<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { StyleValue } from 'vue'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { credorTransactionTabs } from '@/components/credor/transactions'
import { useAppView } from '@/composables/useAppView'
import { useFinancingSubmit } from '@/composables/useFinancingSubmit'
import { usePrototypeState } from '@/lib/prototype/usePrototypeState'
import { formatRupiah } from '@/lib/loan-calculator'
import {
  bankAccounts,
  consentItems,
  documentCategories,
  financingProducts,
  isOnFile,
} from './requirements'
import FinancingSubmitForm from './FinancingSubmitForm.vue'

const { isOpen, tabId, initialRowId, returnFocus, close } = useFinancingSubmit()
const { state, submitApplication } = usePrototypeState()
const { openApplication } = useAppView()

const uploadedIds = ref<string[]>([])
const uploadingId = ref<string | null>(null)
const replacedFiles = ref<Record<string, string>>({})
const replacingId = ref<string | null>(null)
const bankId = ref<string | null>(null)
const consents = ref<string[]>([])
const submitting = ref(false)
/** Set on submit so closing moves focus to the detail page instead of the table. */
const submitted = ref(false)
const body = ref<HTMLElement | null>(null)
let uploadTimer: number | undefined
let replaceTimer: number | undefined
let submitTimer: number | undefined

const tab = computed(
  () => credorTransactionTabs.find((item) => item.id === tabId.value) ?? credorTransactionTabs[0],
)
const product = computed(() => financingProducts[tab.value.id] ?? financingProducts.sales)
/** The row the user picked in the table. One invoice per application from this entry point. */
const row = computed(() => tab.value.rows.find((item) => item.id === initialRowId.value) ?? null)
const itemName = computed(() => tab.value.itemLabel.replace(/s$/, ''))

const missingDocuments = computed(
  () =>
    documentCategories
      .flatMap((category) => category.items)
      .filter(
        (item) =>
          !item.optional && !isOnFile(item, state.stage) && !uploadedIds.value.includes(item.id),
      ).length,
)


/** Why the primary action is disabled, shown next to it. Empty when the user can continue. */
const blocker = computed(() => {
  if (uploadingId.value || replacingId.value) return 'Wait for the upload to finish'
  if (missingDocuments.value > 0)
    return `Upload ${missingDocuments.value} more required ${missingDocuments.value === 1 ? 'document' : 'documents'}`
  if (!bankId.value) return 'Choose a disbursement account'
  if (consents.value.length < consentItems.length) return 'Tick all consent boxes to submit'
  return ''
})

const drawerStyle: StyleValue = {
  width: 'var(--component-drawer-width)',
  maxWidth: '100vw',
  gap: '0',
  padding: '0',
  borderLeftColor: 'var(--component-drawer-border)',
  background: 'var(--component-drawer-background)',
}

const initials = (name: string) =>
  name
    .split(' ')
    .filter((word) => !/^(pt|cv|ud|tb|co)$/i.test(word))
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()

function clearTimers() {
  window.clearTimeout(uploadTimer)
  window.clearTimeout(replaceTimer)
  window.clearTimeout(submitTimer)
}

function reset() {
  clearTimers()
  uploadedIds.value = []
  uploadingId.value = null
  replacedFiles.value = {}
  replacingId.value = null
  bankId.value = state.stage === 'complete' ? bankAccounts[0].id : null
  consents.value = []
  submitting.value = false
  submitted.value = false
}

function upload(id: string) {
  if (uploadingId.value) return

  uploadingId.value = id
  uploadTimer = window.setTimeout(async () => {
    uploadedIds.value = [...uploadedIds.value, id]
    uploadingId.value = null
    // The clicked button is replaced by its status, so move focus to the next pending upload.
    await nextTick()
    const nextTarget =
      body.value?.querySelector<HTMLElement>('.document-list__upload') ??
      body.value?.querySelector<HTMLElement>('input[name="bank-account"]')
    nextTarget?.focus()
  }, 700)
}

function replace(id: string) {
  if (replacingId.value) return

  const item = documentCategories.flatMap((category) => category.items).find((doc) => doc.id === id)
  if (!item) return

  replacingId.value = id
  replaceTimer = window.setTimeout(async () => {
    const dot = item.fileName.lastIndexOf('.')
    replacedFiles.value = {
      ...replacedFiles.value,
      [id]: `${item.fileName.slice(0, dot)}_rev${item.fileName.slice(dot)}`,
    }
    replacingId.value = null
    // The button was disabled while replacing, so hand focus back to it.
    await nextTick()
    body.value?.querySelector<HTMLElement>(`[aria-label="Replace ${item.label}"]`)?.focus()
  }, 700)
}

function next() {
  if (blocker.value || submitting.value) return
  submit()
}

function submit() {
  const invoice = row.value
  if (!invoice || !bankId.value) return

  submitting.value = true
  const chosenBank = bankId.value

  submitTimer = window.setTimeout(() => {
    const now = new Date()
    const stamp = now.toISOString().slice(0, 10).replaceAll('-', '')
    const suffix = Math.random().toString(36).slice(2, 8).toUpperCase()
    const number = `${product.value.code}/${stamp}/${suffix}`
    const shortDate = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
    const longDate = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })

    submitApplication(
      {
        id: number,
        product: product.value.name,
        amount: formatRupiah(invoice.amount),
        date: shortDate,
        note: `${invoice.invoiceNumber.replace('#', '')} attached`,
        noteTone: 'default',
        status: 'In Review',
        details: [
          { label: 'Invoice', value: invoice.invoiceNumber.replace('#', '') },
          { label: 'Payment Date', value: 'Still in review' },
          { label: 'Submission date', value: longDate },
        ],
        source: {
          tabId: tab.value.id,
          rowId: invoice.id,
          bankId: chosenBank,
          submittedAt: now.toISOString(),
          uploadedIds: [...uploadedIds.value],
          replacedFiles: { ...replacedFiles.value },
        },
      },
      [invoice.id],
    )

    submitting.value = false
    submitted.value = true
    openApplication(number, true)
    close()
  }, 900)
}

/** Keep the sheet open while the application is being sent. */
function guardClose(event: Event) {
  if (submitting.value) event.preventDefault()
}

function restoreFocus(event: Event) {
  event.preventDefault()
  if (submitted.value) {
    document.getElementById('application-detail-title')?.focus()
    return
  }
  const target = returnFocus.value
  if (target?.isConnected && target !== document.body) {
    target.focus()
    return
  }
  const heading = document.getElementById('transactions-title')
  heading?.setAttribute('tabindex', '-1')
  heading?.focus()
}

watch(isOpen, (value) => {
  if (value) reset()
  else if (!submitting.value) clearTimers()
})
</script>

<template>
  <Sheet v-model:open="isOpen">
    <SheetContent
      side="right"
      :show-close="false"
      :style="drawerStyle"
      class="submit-sheet"
      @escape-key-down="guardClose"
      @interact-outside="guardClose"
      @close-auto-focus="restoreFocus"
    >
      <header class="submit-sheet__header">
        <div class="submit-sheet__title-group">
          <SheetTitle class="submit-sheet__title">Apply for Financing</SheetTitle>
          <SheetDescription class="submit-sheet__product">{{ product.name }}</SheetDescription>
        </div>
        <button
          type="button"
          class="submit-sheet__close"
          aria-label="Close"
          :disabled="submitting"
          @click="close()"
        >
          <img src="/icons/ui-actions/close.svg" alt="" aria-hidden="true" />
        </button>
      </header>


      <div ref="body" class="submit-sheet__body">
        <section v-if="row" class="submit-sheet__invoice" :aria-label="`${itemName} to finance`">
          <div class="submit-sheet__invoice-row">
            <Avatar :initials="initials(row.counterparty)" />
            <span class="submit-sheet__invoice-identity">
              <span class="submit-sheet__invoice-counterparty">{{ row.counterparty }}</span>
              <span class="submit-sheet__invoice-meta">{{ tab.counterpartyLabel }} · {{ row.invoiceNumber }}</span>
            </span>
            <span class="submit-sheet__invoice-due">
              <span
                class="submit-sheet__invoice-due-note"
                :class="{ 'submit-sheet__invoice-due-note--overdue': row.overdue }"
              >
                {{ row.dueNote }}
              </span>
              <span class="submit-sheet__invoice-meta">Due {{ row.dueDate }}</span>
            </span>
            <span class="submit-sheet__invoice-amount">{{ formatRupiah(row.amount) }}</span>
          </div>
          <p v-if="row.overdue" class="submit-sheet__invoice-note submit-sheet__invoice-note--warning">
            <span class="submit-sheet__note-icon" aria-hidden="true"></span>
            This {{ itemName }} is overdue. Lenders may decline it or offer different terms.
          </p>
          <p class="submit-sheet__invoice-note">
            Lenders send offers with the financing amount, fees and terms after review. Nothing is
            final until you accept an offer.
          </p>
        </section>

        <FinancingSubmitForm
          v-model:bank-id="bankId"
          v-model:consents="consents"
          :stage="state.stage"
          :uploaded-ids="uploadedIds"
          :uploading-id="uploadingId"
          :replaced-files="replacedFiles"
          :replacing-id="replacingId"
          :item-label="tab.itemLabel"
          :needs-payment-agreement="product.needsPaymentAgreement"
          @upload="upload"
          @replace="replace"
        />
      </div>

      <footer class="submit-sheet__footer">
        <p id="submit-sheet-blocker" class="submit-sheet__blocker" aria-live="polite">{{ blocker }}</p>
        <Button
          variant="outline"
          color="neutral"
          type="button"
          class="submit-sheet__action"
          :disabled="submitting"
          @click="close()"
        >
          Cancel
        </Button>
        <Button
          variant="default"
          color="primary"
          type="button"
          class="submit-sheet__action submit-sheet__primary"
          :aria-describedby="blocker ? 'submit-sheet-blocker' : undefined"
          :disabled="!!blocker || submitting"
          :aria-busy="submitting"
          @click="next()"
        >
          {{ submitting ? 'Submitting…' : 'Apply for Financing' }}
        </Button>
      </footer>
    </SheetContent>
  </Sheet>
</template>

<style scoped>
.submit-sheet__header {
  display: flex;
  box-sizing: border-box;
  min-height: var(--component-drawer-header-height);
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-4);
  border-bottom: var(--primitives-border-width-default) solid var(--component-drawer-border);
  background: var(--component-drawer-background);
}

.submit-sheet__title-group {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.submit-sheet__title {
  margin: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-xl);
  font-weight: 700;
  line-height: var(--primitives-line-heights-xl);
}

.submit-sheet__product {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-family: var(--primitives-font-families-body), sans-serif;
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.submit-sheet__close {
  display: grid;
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: var(--primitives-border-radius-xs);
  background: none;
  cursor: pointer;
}

.submit-sheet__close img {
  display: block;
  width: 24px;
  height: 24px;
}

.submit-sheet__close:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.submit-sheet__close:hover:not(:disabled) {
  background: var(--semantic-bg-ach-color-bg-surface-hover);
}

.submit-sheet__close:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: var(--primitives-border-width-2);
}









.submit-sheet__body {
  box-sizing: border-box;
  min-height: 0;
  flex: 1;
  padding: var(--primitives-padding-6) var(--primitives-padding-4);
  overflow-y: auto;
  background: var(--component-drawer-background);
}

.submit-sheet__invoice {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-2);
  margin-bottom: var(--primitives-padding-6);
  padding: var(--primitives-padding-4);
  border-radius: var(--primitives-border-radius-lg);
  background: var(--semantic-bg-ach-color-bg-surface-secondary);
  font-family: var(--primitives-font-families-body), sans-serif;
}

.submit-sheet__invoice-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  align-items: center;
  gap: var(--primitives-padding-3);
  color: var(--semantic-text-ach-color-text-default);
}

.submit-sheet__invoice-identity,
.submit-sheet__invoice-due {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.submit-sheet__invoice-counterparty {
  overflow: hidden;
  font-size: var(--primitives-font-sizes-md);
  font-weight: 500;
  line-height: var(--primitives-line-heights-md);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.submit-sheet__invoice-meta {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
  white-space: nowrap;
}

.submit-sheet__invoice-due-note {
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-sm);
  white-space: nowrap;
}

.submit-sheet__invoice-due-note--overdue {
  color: var(--semantic-text-error-ach-color-text-error);
}

.submit-sheet__invoice-amount {
  min-width: 128px;
  font-size: var(--primitives-font-sizes-md);
  font-weight: 600;
  line-height: var(--primitives-line-heights-md);
  font-variant-numeric: tabular-nums;
  text-align: right;
  white-space: nowrap;
}

.submit-sheet__invoice-note {
  display: flex;
  align-items: flex-start;
  gap: var(--primitives-padding-2);
  margin: 0;
  padding-top: var(--primitives-padding-2);
  border-top: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-default);
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}

.submit-sheet__invoice-note--warning + .submit-sheet__invoice-note {
  padding-top: 0;
  border-top: 0;
}

.submit-sheet__note-icon {
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
  background: var(--semantic-icon-warning-ach-color-icon-warning);
  mask: url('/icons/common-actions/warning.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/common-actions/warning.svg') center / contain no-repeat;
}

.submit-sheet__footer {
  display: flex;
  box-sizing: border-box;
  flex: 0 0 auto;
  align-items: center;
  justify-content: flex-end;
  gap: var(--primitives-padding-2);
  padding: var(--primitives-padding-4);
  border-top: var(--primitives-border-width-default) solid var(--component-drawer-border);
  background: var(--component-drawer-background);
}

.submit-sheet__blocker {
  min-width: 0;
  flex: 1;
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-family: var(--primitives-font-families-body), sans-serif;
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}

.submit-sheet__action:deep(.ach-button),
.submit-sheet__action.ach-button {
  border-radius: var(--primitives-border-radius-infinite);
}


@media (max-width: 640px) {

  .submit-sheet__blocker {
    display: none;
  }

  .submit-sheet__invoice-row {
    grid-template-columns: auto minmax(0, 1fr) auto;
  }

  .submit-sheet__invoice-due {
    grid-column: 2;
  }

  .submit-sheet__invoice-amount {
    min-width: 0;
    grid-column: 3;
    grid-row: 1;
  }
}
</style>
