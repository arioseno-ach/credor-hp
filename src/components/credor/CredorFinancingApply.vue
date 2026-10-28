<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Timeline, type TimelineItem } from '@/components/ui/timeline'
import { credorTransactionTabs, type CredorTransaction } from '@/components/credor/transactions'
import { credorPartners } from '@/components/credor/partners'
import { verifiedCompany } from '@/components/credor/personalisation'
import {
  bankAccounts,
  consentItems,
  documentCategoriesFor,
  financingProducts,
  isOnFile,
  productEntries,
  type DocumentItem,
} from '@/components/credor/financing-submit/requirements'
import FinancingDocumentPreview from '@/components/credor/financing-submit/FinancingDocumentPreview.vue'
import FinancingInvoiceEmptyState from '@/components/credor/financing-submit/FinancingInvoiceEmptyState.vue'
import { useAppView, type ApplyEntry } from '@/composables/useAppView'
import { usePrototypeState } from '@/lib/prototype/usePrototypeState'
import { formatRupiah } from '@/lib/loan-calculator'

const props = defineProps<{
  entry: ApplyEntry
}>()

const { state, documentStage, submitApplication } = usePrototypeState()
const { goHome, openApplication } = useAppView()

/** Partners are buyers, so partner applications are AR. */
const productKey = computed(() => {
  if (props.entry.kind === 'invoice') return props.entry.tabId
  if (props.entry.kind === 'partner') return 'sales'
  return productEntries[props.entry.productId]?.productKey ?? 'sales'
})
const tabId = computed(() => {
  if (props.entry.kind === 'invoice') return props.entry.tabId
  if (props.entry.kind === 'partner') return 'sales'
  return productEntries[props.entry.productId]?.tabId ?? 'sales'
})
const tab = computed(
  () => credorTransactionTabs.find((item) => item.id === tabId.value) ?? credorTransactionTabs[0],
)
const product = computed(() => financingProducts[productKey.value] ?? financingProducts.sales)
const partner = computed(() =>
  props.entry.kind === 'partner'
    ? (credorPartners.find((item) => item.id === (props.entry as { partnerId: string }).partnerId) ?? null)
    : null,
)
const itemName = computed(() => tab.value.itemLabel.replace(/s$/, ''))
const categories = computed(() => documentCategoriesFor(productKey.value))

/** Invoices the user can pick: the partner's own, or every open one in the tab for a product card. */
const candidates = computed<CredorTransaction[]>(() => {
  const submitted = state.data.submittedInvoiceIds ?? []
  const rows = partner.value ? partner.value.invoices : tab.value.rows
  return rows
    .filter((row) => !submitted.includes(row.id))
    .sort((a, b) => a.dueOn.localeCompare(b.dueOn))
})

/** One invoice per application. Fixed from a table row; picked or skipped otherwise. */
const selectedId = ref<string | null>(props.entry.kind === 'invoice' ? props.entry.rowId : null)
const addLater = ref(false)
const selectedInvoice = computed<CredorTransaction | null>(() => {
  if (props.entry.kind === 'invoice') return tab.value.rows.find((row) => row.id === selectedId.value) ?? null
  return candidates.value.find((row) => row.id === selectedId.value) ?? null
})

/** Partner picks first, since the partner already narrows the list. Product cards pick last,
 *  as in the staging checkout. A table row needs no picking. */
const invoiceStepPosition = computed<'start' | 'end' | null>(() => {
  if (props.entry.kind === 'partner') return 'start'
  if (props.entry.kind === 'product') return 'end'
  return null
})

const uploadedIds = ref<string[]>([])
const uploadingId = ref<string | null>(null)
const replacedFiles = ref<Record<string, string>>({})
const replacingId = ref<string | null>(null)
const bankId = ref<string | null>(documentStage.value === 'complete' ? bankAccounts[0].id : null)
const consents = ref<string[]>([])
const submitting = ref(false)
const preview = ref<{ label: string; fileName: string; trigger: HTMLElement | null } | null>(null)
const previewOpen = ref(false)
let uploadTimer: number | undefined
let replaceTimer: number | undefined
let submitTimer: number | undefined

const isReady = (item: DocumentItem) =>
  isOnFile(item, documentStage.value) || uploadedIds.value.includes(item.id)

interface ApplyStep {
  id: string
  label: string
  kind: 'documents' | 'bank' | 'invoice'
  total: number
  readyCount: number
  complete: boolean
}

const steps = computed<ApplyStep[]>(() => {
  const invoiceStep: ApplyStep = {
    id: 'invoice',
    label: tab.value.itemLabel === 'bills' ? 'Select bill' : 'Select invoice',
    kind: 'invoice',
    total: 0,
    readyCount: 0,
    complete: selectedId.value !== null || addLater.value,
  }
  const documentSteps: ApplyStep[] = categories.value.map((category) => ({
    id: category.id,
    label: category.label,
    kind: 'documents',
    total: category.items.length,
    readyCount: category.items.filter(isReady).length,
    complete: category.items.every((item) => item.optional || isReady(item)),
  }))
  const bankStep: ApplyStep = {
    id: 'bank',
    label: 'Disbursement account',
    kind: 'bank',
    total: 0,
    readyCount: 0,
    complete: bankId.value !== null && consents.value.length === consentItems.length,
  }
  return [
    ...(invoiceStepPosition.value === 'start' ? [invoiceStep] : []),
    ...documentSteps,
    bankStep,
    ...(invoiceStepPosition.value === 'end' ? [invoiceStep] : []),
  ]
})

/** Prefilled demos start at the first step so the user can click through every step.
 *  Otherwise open on the first step that still needs work, like staging does. */
const stepIndex = ref(
  state.prefilledDocuments ? 0 : Math.max(0, steps.value.findIndex((step) => !step.complete)),
)
const step = computed(() => steps.value[stepIndex.value])
const category = computed(() => categories.value.find((item) => item.id === step.value.id) ?? null)
const isLastStep = computed(() => stepIndex.value === steps.value.length - 1)
const progress = computed(() =>
  Math.round((steps.value.filter((item) => item.complete).length / steps.value.length) * 100),
)

const timelineItems = computed<TimelineItem[]>(() =>
  steps.value.map((item, index) => ({
    id: item.id,
    title: item.label,
    status: index === stepIndex.value ? 'active' : item.complete ? 'success' : 'disabled',
  })),
)

const missingTotal = computed(
  () =>
    categories.value
      .flatMap((item) => item.items)
      .filter((item) => !item.optional && !isReady(item)).length,
)

/** Why the primary action is disabled, shown next to it. Empty when the user can go on. */
const blocker = computed(() => {
  if (uploadingId.value || replacingId.value) return 'Wait for the upload to finish'
  if (step.value.kind === 'invoice' && !step.value.complete)
    return `Choose ${itemName.value === 'bill' ? 'a bill' : 'an invoice'} or add it later`
  if (step.value.kind === 'documents' && !step.value.complete)
    return 'Upload the required documents to continue'
  if (step.value.kind === 'bank' && !bankId.value) return 'Choose a disbursement account'
  if (step.value.kind === 'bank' && consents.value.length < consentItems.length)
    return 'Tick all consent boxes to continue'
  if (isLastStep.value && missingTotal.value > 0)
    return `${missingTotal.value} required ${missingTotal.value === 1 ? 'document is' : 'documents are'} still missing`
  if (isLastStep.value && steps.value.some((item) => !item.complete))
    return 'Complete every step to submit'
  return ''
})

const ringLength = 2 * Math.PI * 20

const fileNameFor = (item: DocumentItem) => replacedFiles.value[item.id] ?? item.fileName

const initials = (name: string) =>
  name
    .split(' ')
    .filter((word) => !/^(pt|cv|ud|tb|co)$/i.test(word))
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()

async function goTo(index: number) {
  stepIndex.value = index
  window.scrollTo({ top: 0 })
  await nextTick()
  document.getElementById('apply-step-title')?.focus({ preventScroll: true })
}

function selectStep(id: string) {
  if (submitting.value) return
  const index = steps.value.findIndex((item) => item.id === id)
  if (index >= 0) goTo(index)
}

function chooseInvoice(id: string | null) {
  selectedId.value = id
  addLater.value = id === null
}

function upload(item: DocumentItem) {
  if (uploadingId.value || replacingId.value) return
  uploadingId.value = item.id
  uploadTimer = window.setTimeout(async () => {
    uploadedIds.value = [...uploadedIds.value, item.id]
    uploadingId.value = null
    // The Upload button turns into the file row, so move focus to the next pending upload.
    await nextTick()
    const nextTarget =
      document.querySelector<HTMLElement>('.apply__upload') ??
      document.querySelector<HTMLElement>(`[aria-label="Replace ${item.label}"]`)
    nextTarget?.focus()
  }, 700)
}

function replace(item: DocumentItem) {
  if (uploadingId.value || replacingId.value) return
  replacingId.value = item.id
  replaceTimer = window.setTimeout(async () => {
    const dot = item.fileName.lastIndexOf('.')
    replacedFiles.value = {
      ...replacedFiles.value,
      [item.id]: `${item.fileName.slice(0, dot)}_rev${item.fileName.slice(dot)}`,
    }
    replacingId.value = null
    await nextTick()
    document.querySelector<HTMLElement>(`[aria-label="Replace ${item.label}"]`)?.focus()
  }, 700)
}

function view(item: DocumentItem) {
  const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null
  preview.value = { label: item.label, fileName: fileNameFor(item), trigger }
  previewOpen.value = true
}

function toggleConsent(id: string, checked: boolean) {
  consents.value = checked ? [...consents.value, id] : consents.value.filter((consent) => consent !== id)
}

function back() {
  if (stepIndex.value === 0) goHome()
  else goTo(stepIndex.value - 1)
}

function next() {
  if (blocker.value || submitting.value) return
  if (!isLastStep.value) {
    goTo(stepIndex.value + 1)
    return
  }
  submit()
}

function submit() {
  const chosenBank = bankId.value
  if (!chosenBank) return
  const invoice = selectedInvoice.value

  submitting.value = true
  submitTimer = window.setTimeout(() => {
    const now = new Date()
    const stamp = now.toISOString().slice(0, 10).replaceAll('-', '')
    const suffix = Math.random().toString(36).slice(2, 8).toUpperCase()
    const number = `${product.value.code}/${stamp}/${suffix}`
    const invoiceNumber = invoice?.invoiceNumber.replace('#', '') ?? ''

    submitApplication(
      {
        id: number,
        product: product.value.name,
        amount: invoice ? formatRupiah(invoice.amount) : 'Not set',
        date: now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
        note: invoice ? `${invoiceNumber} attached` : 'No Invoice Selected',
        noteTone: invoice ? 'default' : 'error',
        status: 'In Review',
        details: [
          { label: 'Invoice', value: invoice ? invoiceNumber : 'None selected' },
          { label: 'Payment Date', value: 'Still in review' },
          {
            label: 'Submission date',
            value: now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
          },
        ],
        source: {
          productKey: productKey.value,
          tabId: tab.value.id,
          rowId: invoice?.id,
          partnerId: partner.value?.id,
          bankId: chosenBank,
          submittedAt: now.toISOString(),
          uploadedIds: [...uploadedIds.value],
          replacedFiles: { ...replacedFiles.value },
        },
      },
      invoice ? [invoice.id] : [],
    )

    submitting.value = false
    openApplication(number, true)
    nextTick(() => document.getElementById('application-detail-title')?.focus())
  }, 900)
}

// Every entry button unmounts with the page it was on, so start focus on the step heading.
onMounted(() => document.getElementById('apply-step-title')?.focus({ preventScroll: true }))

onBeforeUnmount(() => {
  window.clearTimeout(uploadTimer)
  window.clearTimeout(replaceTimer)
  window.clearTimeout(submitTimer)
})
</script>

<template>
  <div class="apply">
    <div class="apply__container">
      <button type="button" class="apply__back" :disabled="submitting" @click="goHome()">
        <span class="apply__back-icon" aria-hidden="true"></span>
        Back to Home
      </button>

      <div class="apply__layout">
        <nav class="apply__stepper" aria-label="Application steps">
          <div class="apply__progress">
            <svg class="apply__ring" viewBox="0 0 44 44" aria-hidden="true">
              <circle class="apply__ring-track" cx="22" cy="22" r="20" />
              <circle
                class="apply__ring-value"
                cx="22"
                cy="22"
                r="20"
                :stroke-dasharray="ringLength"
                :stroke-dashoffset="ringLength * (1 - progress / 100)"
              />
            </svg>
            <span class="apply__ring-label">{{ progress }}%</span>
            <span class="apply__progress-copy">
              <span class="apply__progress-title">{{ product.name }}</span>
              <span class="apply__progress-meta">Step {{ stepIndex + 1 }} of {{ steps.length }}</span>
            </span>
          </div>

          <Timeline class="apply__timeline" :items="timelineItems" interactive @select="selectStep" />
        </nav>

        <div class="apply__main">
          <!-- Only shown when there is context to keep in view: a partner or a chosen invoice. -->
          <section
            v-if="partner || selectedInvoice"
            class="apply__invoice"
            :aria-label="`${product.name} application`"
          >

            <div v-if="partner" class="apply__invoice-row apply__invoice-row--partner">
              <Avatar :initials="partner.initials" />
              <span class="apply__invoice-identity">
                <span class="apply__invoice-counterparty">{{ partner.name }}</span>
                <span class="apply__meta">
                  Verified partner · {{ partner.transactionCount }} transactions · avg {{ partner.averageTransaction }}
                </span>
              </span>
            </div>

            <div v-if="selectedInvoice" class="apply__invoice-row" :class="{ 'apply__invoice-row--nested': partner }">
              <Avatar v-if="!partner" :initials="initials(selectedInvoice.counterparty)" />
              <span class="apply__invoice-identity">
                <span v-if="!partner" class="apply__invoice-counterparty">{{ selectedInvoice.counterparty }}</span>
                <span class="apply__meta">
                  <template v-if="!partner">{{ tab.counterpartyLabel }} · </template>{{ selectedInvoice.invoiceNumber }}
                </span>
              </span>
              <span class="apply__invoice-due">
                <span class="apply__due-note" :class="{ 'apply__due-note--overdue': selectedInvoice.overdue }">
                  {{ selectedInvoice.dueNote }}
                </span>
                <span class="apply__meta">Due {{ selectedInvoice.dueDate }}</span>
              </span>
              <span class="apply__invoice-amount">{{ formatRupiah(selectedInvoice.amount) }}</span>
            </div>

            <p v-else-if="addLater" class="apply__meta apply__invoice-empty">
              No {{ itemName }} yet. You can add it from the application page.
            </p>

            <p v-if="selectedInvoice?.overdue" class="apply__invoice-note">
              This {{ itemName }} is overdue, so lenders may decline it or offer different terms.
            </p>
          </section>

          <div class="apply__heading">
            <h1 id="apply-step-title" tabindex="-1">{{ step.label }}</h1>
            <span
              v-if="category"
              class="apply__badge"
              :class="step.complete ? 'apply__badge--complete' : 'apply__badge--missing'"
            >
              {{ step.readyCount }}/{{ step.total }} · {{ step.complete ? 'Complete' : 'Incomplete' }}
            </span>
          </div>

          <template v-if="step.kind === 'invoice'">
            <p v-if="candidates.length > 0" class="apply__step-intro">
              <template v-if="partner">Open {{ tab.itemLabel }} to {{ partner.name }}.</template>
              <template v-else>Open {{ tab.itemLabel }} recorded in Achilles.</template>
              Adding one now lets lenders review sooner.
            </p>
            <fieldset class="apply__choices">
              <legend class="apply__sr-only">{{ step.label }}</legend>
              <label
                v-for="row in candidates"
                :key="row.id"
                class="apply__choice"
                :class="{
                  'apply__choice--selected': selectedId === row.id,
                  'apply__choice--partner': partner,
                }"
              >
                <input
                  type="radio"
                  name="apply-invoice"
                  :checked="selectedId === row.id"
                  @change="chooseInvoice(row.id)"
                />
                <!-- With one partner, the name is already above, so rows lead with what tells them apart. -->
                <span v-if="partner" class="apply__invoice-identity">
                  <span class="apply__choice-name">{{ row.invoiceNumber }}</span>
                  <span class="apply__meta apply__meta--truncate">
                    {{ row.lineItems[0]?.name }}<template v-if="row.lineItems.length > 1"> +{{ row.lineItems.length - 1 }}</template>
                  </span>
                </span>
                <template v-else>
                  <Avatar :initials="initials(row.counterparty)" />
                  <span class="apply__invoice-identity">
                    <span class="apply__choice-name">{{ row.counterparty }}</span>
                    <span class="apply__meta">{{ row.invoiceNumber }}</span>
                  </span>
                </template>
                <span class="apply__invoice-due">
                  <span class="apply__due-note" :class="{ 'apply__due-note--overdue': row.overdue }">
                    {{ row.dueNote }}
                  </span>
                  <span class="apply__meta">Due {{ row.dueDate }}</span>
                </span>
                <span class="apply__choice-amount">{{ formatRupiah(row.amount) }}</span>
              </label>
              <FinancingInvoiceEmptyState
                v-if="candidates.length === 0"
                :item-label="tab.itemLabel"
              />
              <label class="apply__choice apply__choice--later" :class="{ 'apply__choice--selected': addLater }">
                <input type="radio" name="apply-invoice" :checked="addLater" @change="chooseInvoice(null)" />
                <span class="apply__invoice-identity">
                  <span class="apply__choice-name">Add {{ itemName }} later</span>
                  <span class="apply__meta">Submit now and add it from the application page.</span>
                </span>
              </label>
            </fieldset>
          </template>

          <template v-else-if="category">
            <div v-if="category.id === 'company'" class="apply__company">
              <span class="apply__verified">
                <span class="apply__icon apply__icon--check" aria-hidden="true"></span>
                Verified
              </span>
              <p class="apply__company-name">PT Harapan Terakhir</p>
              <dl class="apply__company-facts">
                <div><dt>NPWP</dt><dd>{{ verifiedCompany.npwp }}</dd></div>
                <div><dt>NITKU</dt><dd>{{ verifiedCompany.nitku }}</dd></div>
                <div><dt>Address</dt><dd>{{ verifiedCompany.address }}</dd></div>
              </dl>
            </div>

            <div v-for="item in category.items" :key="item.id" class="apply__field">
              <span class="apply__field-label">
                {{ item.label }}<span v-if="!item.optional" class="apply__required" aria-hidden="true"> *</span>
                <span v-if="item.optional" class="apply__optional">Optional</span>
              </span>

              <div v-if="isReady(item)" class="apply__file">
                <Button
                  variant="outline"
                  color="neutral"
                  size="small"
                  type="button"
                  class="apply__file-button"
                  :disabled="uploadingId !== null || replacingId !== null"
                  :aria-label="`Replace ${item.label}`"
                  @click="replace(item)"
                >
                  {{ replacingId === item.id ? 'Replacing…' : 'Replace file' }}
                </Button>
                <span class="apply__icon apply__icon--check" aria-hidden="true"></span>
                <span class="apply__icon apply__icon--doc" aria-hidden="true"></span>
                <span class="apply__file-name">{{ fileNameFor(item) }}</span>
                <button
                  type="button"
                  class="apply__icon-button"
                  :aria-label="`View ${item.label}`"
                  @click="view(item)"
                >
                  <span class="apply__icon apply__icon--view" aria-hidden="true"></span>
                </button>
              </div>

              <div v-else class="apply__file apply__file--empty">
                <Button
                  variant="outline"
                  color="neutral"
                  size="small"
                  type="button"
                  class="apply__file-button apply__upload"
                  :disabled="uploadingId !== null || replacingId !== null"
                  :aria-label="`Upload ${item.label}`"
                  @click="upload(item)"
                >
                  {{ uploadingId === item.id ? 'Uploading…' : 'Upload file' }}
                </Button>
                <span class="apply__meta">PDF, JPG or PNG, max 2 MB</span>
              </div>
            </div>
          </template>

          <template v-else>
            <fieldset class="apply__banks">
              <legend class="apply__sr-only">Disbursement account</legend>
              <label v-for="account in bankAccounts" :key="account.id" class="apply__bank">
                <span class="apply__bank-header">
                  <input
                    type="radio"
                    name="apply-bank"
                    :checked="bankId === account.id"
                    @change="bankId = account.id"
                  />
                  <span class="apply__bank-name">Bank {{ account.bank }}</span>
                </span>
                <dl class="apply__bank-facts">
                  <div><dt>Account holder</dt><dd>{{ account.holder }}</dd></div>
                  <div><dt>Account number</dt><dd>{{ account.number }}</dd></div>
                  <div><dt>Bank reconciliation</dt><dd>{{ account.note }}</dd></div>
                </dl>
              </label>
            </fieldset>

            <p class="apply__fine-print">
              Financing partners are licensed and supervised by OJK. You review and accept a lender
              offer before any funds are disbursed.
            </p>

            <div class="apply__consents">
              <Checkbox
                v-for="item in consentItems"
                :key="item.id"
                :model-value="consents.includes(item.id)"
                :label="item.label"
                @update:model-value="toggleConsent(item.id, $event)"
              />
            </div>
          </template>
        </div>

      </div>

    </div>

    <footer class="apply__footer">
      <p id="apply-blocker" class="apply__blocker" aria-live="polite">{{ blocker }}</p>
      <Button
        variant="outline"
        color="neutral"
        type="button"
        class="apply__action"
        :disabled="submitting"
        @click="back()"
      >
        {{ stepIndex === 0 ? 'Cancel' : 'Back' }}
      </Button>
      <Button
        variant="default"
        color="primary"
        type="button"
        class="apply__action"
        :aria-describedby="blocker ? 'apply-blocker' : undefined"
        :disabled="!!blocker || submitting"
        :aria-busy="submitting"
        @click="next()"
      >
        {{ isLastStep ? (submitting ? 'Submitting…' : 'Submit Application') : 'Save & Continue' }}
      </Button>
    </footer>

    <FinancingDocumentPreview
      v-if="preview"
      v-model:open="previewOpen"
      :label="preview.label"
      :file-name="preview.fileName"
      :return-focus="preview.trigger"
    />
  </div>
</template>

<style scoped>
.apply {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-body), sans-serif;
}

.apply__container {
  display: flex;
  width: 100%;
  /* Stepper and form centered together: 240px stepper, gap, then a 720px form. */
  max-width: calc(240px + var(--primitives-padding-8) + 720px);
  flex-direction: column;
  margin-inline: auto;
}

.apply__back {
  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  gap: var(--primitives-padding-1);
  margin-bottom: var(--primitives-padding-4);
  padding: var(--primitives-padding-1) 0;
  border: 0;
  border-radius: var(--primitives-border-radius-xs);
  background: none;
  color: var(--semantic-text-ach-color-text-secondary);
  cursor: pointer;
  font-family: inherit;
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-sm);
}

.apply__back:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.apply__back:hover:not(:disabled) {
  color: var(--semantic-text-ach-color-text-default);
}

.apply__back:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: var(--primitives-border-width-2);
}

.apply__back-icon {
  width: 16px;
  height: 16px;
  background: currentColor;
  mask: url('/icons/ui-actions/arrow-back.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/arrow-back.svg') center / contain no-repeat;
}

.apply__layout {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  align-items: start;
  gap: var(--primitives-padding-8);
  padding-bottom: var(--primitives-padding-8);
}

.apply__stepper {
  position: sticky;
  top: var(--primitives-padding-4);
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-4);
}

.apply__progress {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-3);
}

.apply__ring {
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  transform: rotate(-90deg);
}

.apply__ring-track,
.apply__ring-value {
  fill: none;
  stroke-width: 4;
}

.apply__ring-track {
  stroke: var(--semantic-border-ach-color-border-default);
}

.apply__ring-value {
  stroke: var(--semantic-text-ach-color-text-link);
  stroke-linecap: round;
}

.apply__ring-label {
  position: absolute;
  left: 0;
  width: 44px;
  font-size: var(--primitives-font-sizes-2xs);
  font-weight: 600;
  text-align: center;
}

.apply__progress-copy {
  display: flex;
  flex-direction: column;
}

.apply__progress-title {
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 600;
  line-height: var(--primitives-line-heights-sm);
}

.apply__meta,
.apply__progress-meta {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}








.apply__icon-button:focus-visible,
.apply__bank input:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: var(--primitives-border-width-2);
}

.apply__timeline {
  padding: 0;
}

.apply__main {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--primitives-padding-4);
}

.apply__invoice {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-4);
  border: var(--primitives-border-width-default) solid var(--component-card-border);
  border-radius: var(--primitives-border-radius-lg);
  background: var(--component-card-background);
}


.apply__invoice-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  align-items: center;
  gap: var(--primitives-padding-3);
}

.apply__invoice-identity,
.apply__invoice-due {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.apply__invoice-counterparty {
  overflow: hidden;
  font-size: var(--primitives-font-sizes-md);
  font-weight: 500;
  line-height: var(--primitives-line-heights-md);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.apply__due-note {
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-sm);
  white-space: nowrap;
}

.apply__due-note--overdue {
  color: var(--semantic-text-error-ach-color-text-error);
}

.apply__invoice-amount {
  min-width: 128px;
  font-size: var(--primitives-font-sizes-md);
  font-weight: 600;
  line-height: var(--primitives-line-heights-md);
  font-variant-numeric: tabular-nums;
  text-align: right;
  white-space: nowrap;
}

.apply__invoice-row--nested {
  grid-template-columns: minmax(0, 1fr) auto auto;
  padding-top: var(--primitives-padding-3);
  border-top: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
}

.apply__invoice-empty {
  margin: 0;
}

.apply__step-intro {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.apply__choices {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  border: var(--primitives-border-width-default) solid var(--component-card-border);
  border-radius: var(--primitives-border-radius-lg);
  overflow: hidden;
}

.apply__choices > .apply__meta {
  margin: 0;
  padding: var(--primitives-padding-4);
}

.apply__choice {
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr) auto 128px;
  align-items: center;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-3) var(--primitives-padding-4);
  cursor: pointer;
}

.apply__choice--partner {
  grid-template-columns: auto minmax(0, 1fr) auto 128px;
}

.apply__meta--truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.apply__choice + .apply__choice {
  border-top: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
}

.apply__choice:hover {
  background: var(--semantic-bg-ach-color-bg-surface-hover);
}

.apply__choice--selected {
  background: var(--semantic-bg-ach-color-bg-surface-secondary);
}

.apply__choice--later {
  grid-template-columns: auto minmax(0, 1fr);
}

.apply__choice input {
  margin: 0;
  accent-color: var(--semantic-text-ach-color-text-default);
}

.apply__choice input:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: var(--primitives-border-width-2);
}

.apply__choice-name {
  overflow: hidden;
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-sm);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.apply__choice-amount {
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  text-align: right;
  white-space: nowrap;
}

.apply__invoice-note {
  margin: 0;
  padding-top: var(--primitives-padding-3);
  border-top: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}

.apply__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-3);
  margin-top: var(--primitives-padding-4);
}

.apply__heading h1 {
  margin: 0;
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-2xl);
  font-weight: 700;
  line-height: var(--primitives-line-heights-2xl);
}

.apply__heading h1:focus {
  outline: none;
}

.apply__badge {
  padding: 2px var(--primitives-padding-2);
  border-radius: var(--primitives-border-radius-infinite);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  line-height: var(--primitives-line-heights-2xs);
  white-space: nowrap;
}

.apply__badge--complete {
  background: var(--semantic-bg-success-ach-color-bg-success-surface);
  color: var(--semantic-fg-success-ach-color-fg-success);
}

.apply__badge--missing {
  background: var(--semantic-bg-warning-ach-color-bg-warning-surface);
  color: var(--semantic-fg-warning-ach-color-fg-warning);
}

.apply__company {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-2);
  padding: var(--primitives-padding-4);
  border: var(--primitives-border-width-default) solid var(--component-card-border);
  border-radius: var(--primitives-border-radius-lg);
}

.apply__verified {
  display: inline-flex;
  align-items: center;
  gap: var(--primitives-padding-2);
  color: var(--semantic-fg-success-ach-color-fg-success);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
}

.apply__company-name {
  margin: 0;
  font-size: var(--primitives-font-sizes-xl);
  font-weight: 600;
  line-height: var(--primitives-line-heights-xl);
}

.apply__company-facts,
.apply__bank-facts {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-1);
  margin: 0;
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.apply__company-facts div {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  gap: var(--primitives-padding-3);
}

.apply__company-facts dt,
.apply__bank-facts dt {
  color: var(--semantic-text-ach-color-text-secondary);
}

.apply__company-facts dd,
.apply__bank-facts dd {
  margin: 0;
}

.apply__field {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-2);
}

.apply__field-label {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 500;
  line-height: var(--primitives-line-heights-2xs);
}

.apply__required {
  color: var(--semantic-text-error-ach-color-text-error);
}

.apply__optional {
  margin-left: var(--primitives-padding-1);
  color: var(--semantic-text-ach-color-text-subtle);
  font-weight: 400;
}

.apply__file {
  display: flex;
  min-height: 48px;
  align-items: center;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-2) var(--primitives-padding-3);
  border: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-default);
  border-radius: var(--primitives-border-radius-md);
}

.apply__file--empty {
  border-style: dashed;
}

.apply__file-button:deep(.ach-button),
.apply__file-button.ach-button,
.apply__action:deep(.ach-button),
.apply__action.ach-button {
  border-radius: var(--primitives-border-radius-infinite);
}

.apply__file-name {
  overflow: hidden;
  min-width: 0;
  flex: 1;
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.apply__icon {
  display: inline-block;
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  background: var(--semantic-icon-ach-color-icon-default);
  mask: var(--apply-icon) center / contain no-repeat;
  -webkit-mask: var(--apply-icon) center / contain no-repeat;
}

.apply__icon--check {
  --apply-icon: url('/icons/ui-actions/check-circle.svg');
  background: var(--semantic-icon-success-ach-color-icon-success);
}

.apply__icon--doc {
  --apply-icon: url('/icons/text-formatting/description.svg');
}

.apply__icon--view {
  --apply-icon: url('/icons/common-actions/visibility.svg');
}


.apply__icon-button {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: var(--primitives-border-radius-sm);
  background: none;
  cursor: pointer;
}

.apply__icon-button:hover {
  background: var(--semantic-bg-ach-color-bg-surface-hover);
}

.apply__banks {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-3);
  margin: 0;
  padding: 0;
  border: 0;
}

.apply__bank {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-4);
  border: var(--primitives-border-width-default) solid var(--component-card-border);
  border-radius: var(--primitives-border-radius-lg);
  cursor: pointer;
}

.apply__bank:has(input:checked) {
  border-color: var(--semantic-border-ach-color-border-strong);
}

.apply__bank-header {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-3);
}

.apply__bank-header input {
  margin: 0;
  accent-color: var(--semantic-text-ach-color-text-default);
}

.apply__bank-name {
  font-size: var(--primitives-font-sizes-md);
  font-weight: 600;
  line-height: var(--primitives-line-heights-md);
}

.apply__bank-facts div {
  display: flex;
  justify-content: space-between;
  gap: var(--primitives-padding-3);
}

.apply__fine-print {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}

.apply__consents {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-3);
}






.apply__footer {
  position: sticky;
  margin-top: auto;
  z-index: 10;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--primitives-padding-2);
  margin-right: calc(var(--primitives-padding-6) * -1);
  margin-bottom: calc(var(--primitives-padding-6) * -1);
  margin-left: calc(var(--primitives-padding-6) * -1);
  padding: var(--primitives-padding-4) var(--primitives-padding-6);
  border-top: var(--primitives-border-width-default) solid var(--component-card-border);
  background: var(--semantic-bg-ach-color-bg-surface);
}

.apply__blocker {
  min-width: 0;
  flex: 1;
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
  text-align: right;
}

.apply__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

@media (max-width: 1180px) {
  .apply__layout {
    grid-template-columns: 220px minmax(0, 1fr);
  }

}

@media (max-width: 760px) {
  .apply__layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .apply__stepper {
    position: static;
  }

  .apply__timeline {
    display: none;
  }

  .apply__invoice-row {
    grid-template-columns: auto minmax(0, 1fr) auto;
  }

  .apply__invoice-due {
    grid-column: 2;
  }

  .apply__invoice-amount {
    min-width: 0;
    grid-column: 3;
    grid-row: 1;
  }

  .apply__choice,
  .apply__choice--partner {
    grid-template-columns: auto minmax(0, 1fr) auto;
  }

  .apply__choice .avatar,
  .apply__choice .apply__invoice-due {
    display: none;
  }

  .apply__footer {
    margin-right: calc(var(--primitives-padding-4) * -1);
    margin-bottom: calc(var(--primitives-padding-4) * -1);
    margin-left: calc(var(--primitives-padding-4) * -1);
    padding: var(--primitives-padding-3) var(--primitives-padding-4);
  }

  .apply__blocker {
    display: none;
  }
}
</style>
