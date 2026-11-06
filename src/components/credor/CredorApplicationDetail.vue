<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { Alert } from '@/components/ui/alert'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { Timeline, type TimelineItem } from '@/components/ui/timeline'
import { credorPartners } from '@/components/credor/partners'
import { findInvoice } from '@/components/credor/invoice-lookup'
import { credorTransactionTabs } from '@/components/credor/transactions'
import { bankAccounts, financingProducts } from '@/components/credor/financing-submit/requirements'
import FinancingDocumentList from '@/components/credor/financing-submit/FinancingDocumentList.vue'
import FinancingDocumentPreview from '@/components/credor/financing-submit/FinancingDocumentPreview.vue'
import FinancingAddInvoiceDialog from '@/components/credor/financing-submit/FinancingAddInvoiceDialog.vue'
import { useAppView } from '@/composables/useAppView'
import { usePrototypeState } from '@/lib/prototype/usePrototypeState'
import { formatRupiah } from '@/lib/loan-calculator'

const props = defineProps<{
  applicationId: string
  justSubmitted: boolean
}>()

const { state, documentStage, attachInvoice, transactionRows } = usePrototypeState()
const { goHome } = useAppView()

const application = computed(
  () => state.data.applications.find((item) => item.id === props.applicationId) ?? null,
)
const source = computed(() => application.value?.source ?? null)
const tab = computed(
  () => credorTransactionTabs.find((item) => item.id === source.value?.tabId) ?? credorTransactionTabs[0],
)
const invoice = computed(() => findInvoice(source.value?.rowId))
const partner = computed(() => credorPartners.find((item) => item.id === source.value?.partnerId) ?? null)
const product = computed(
  () => financingProducts[source.value?.productKey ?? tab.value.id] ?? financingProducts.sales,
)
const itemTitle = computed(() => (tab.value.itemLabel === 'bills' ? 'Bill' : 'Invoice'))
const itemArticle = computed(() => (itemTitle.value === 'Bill' ? 'a bill' : 'an invoice'))

/** Open invoices this application can take: the partner's own, or every open one in its tab. */
const candidates = computed(() => {
  const submitted = state.data.submittedInvoiceIds ?? []
  const rows = partner.value ? partner.value.invoices : transactionRows(tab.value)
  return rows.filter((row) => !submitted.includes(row.id)).sort((a, b) => a.dueOn.localeCompare(b.dueOn))
})

const addInvoiceOpen = ref(false)
const addInvoiceTrigger = ref<HTMLElement | null>(null)

function openAddInvoice(event: MouseEvent) {
  addInvoiceTrigger.value = event.currentTarget instanceof HTMLElement ? event.currentTarget : null
  addInvoiceOpen.value = true
}

async function onAttach(id: string) {
  const row = candidates.value.find((item) => item.id === id)
  if (!row || !application.value) return
  attachInvoice(application.value.id, {
    id: row.id,
    invoiceNumber: row.invoiceNumber,
    amount: formatRupiah(row.amount),
  })
  // The Add button is gone once the invoice is attached, so land on the documents it brought.
  await nextTick()
  const heading = window.document.getElementById('supporting-docs-title')
  heading?.setAttribute('tabindex', '-1')
  heading?.focus()
}
const bank = computed(() => bankAccounts.find((account) => account.id === source.value?.bankId) ?? null)

const submittedAt = computed(() => {
  if (!source.value) return application.value?.date ?? ''
  return new Date(source.value.submittedAt).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

const invoiceNumber = computed(() => invoice.value?.invoiceNumber.replace('#', '') ?? '')

const supportingDocuments = computed(() =>
  invoice.value
    ? [
        { label: 'Invoice', fileName: `invoice-${invoiceNumber.value}.pdf` },
        { label: 'e-Faktur', fileName: `e-faktur-${invoiceNumber.value}.pdf` },
        { label: 'Transaction record', fileName: `transaction-${invoiceNumber.value}.csv` },
      ]
    : [],
)

const activeTab = ref<'financing' | 'applicant'>('financing')
const showSubmitted = ref(props.justSubmitted)
const preview = ref<{ label: string; fileName: string; trigger: HTMLElement | null } | null>(null)
const previewOpen = ref(false)
const agreementState = ref<'missing' | 'uploading' | 'uploaded'>('missing')
const agreementOpen = ref(false)
const agreementFile = ref('')
const agreementError = ref('')
const agreementInput = ref<HTMLInputElement | null>(null)
const agreementTypes = ['application/pdf', 'image/jpeg', 'image/png']
const agreementMaxBytes = 2 * 1024 * 1024

let agreementTimer: number | undefined

function view(document: { label: string; fileName: string }) {
  const trigger = window.document.activeElement instanceof HTMLElement ? window.document.activeElement : null
  preview.value = { ...document, trigger }
  previewOpen.value = true
}

function onAgreementFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (!agreementTypes.includes(file.type) || file.size > agreementMaxBytes) {
    agreementError.value = 'Upload a PDF, JPG or PNG file up to 2 MB.'
    return
  }
  agreementError.value = ''
  agreementFile.value = file.name
  agreementState.value = 'uploading'
  window.clearTimeout(agreementTimer)
  agreementTimer = window.setTimeout(() => {
    agreementState.value = 'uploaded'
  }, 700)
}

const initials = (name: string) =>
  name
    .split(' ')
    .filter((word) => !/^(pt|cv|ud|tb|co)$/i.test(word))
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()

/** Mock offers so the multiple-offer state can be reviewed before the lender flow exists. */
const offers = computed(() => {
  const amount = invoice.value?.amount ?? 0
  return [
    { id: 'offer-1', lender: 'PT Sinar Pendanaan', advance: 0.9, tenor: 30, rate: '12,00%', fee: 0.01 },
    { id: 'offer-2', lender: 'Bank Mitra Niaga', advance: 0.85, tenor: 45, rate: '11,50%', fee: 0.008 },
    { id: 'offer-3', lender: 'Koperasi Dana Bersama', advance: 0.8, tenor: 92, rate: '10,75%', fee: 0.005 },
  ].map((offer) => ({
    ...offer,
    disbursement: formatRupiah(Math.round((amount * offer.advance) / 1000) * 1000),
    adminFee: formatRupiah(Math.round((amount * offer.fee) / 1000) * 1000),
  }))
})
const offersOpen = ref(false)
const confirmedOffer = ref('')
const confirmedLender = computed(() => offers.value.find((offer) => offer.id === confirmedOffer.value)?.lender ?? '')

const tabOrder = ['financing', 'applicant'] as const

/** Arrow keys move between the two tabs, following the ARIA tabs pattern. */
function onTabKeydown(event: KeyboardEvent) {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
  event.preventDefault()
  const index = tabOrder.indexOf(activeTab.value)
  const next = tabOrder[(index + (event.key === 'ArrowRight' ? 1 : tabOrder.length - 1)) % tabOrder.length]
  activeTab.value = next
  window.document.getElementById(`application-tab-${next}`)?.focus()
}

onBeforeUnmount(() => window.clearTimeout(agreementTimer))

/** Newest first, like the staging activity list. */
const timeline = computed<TimelineItem[]>(() => [
  ...(confirmedOffer.value
    ? [{ id: 'selected', title: 'Contract selected', description: confirmedLender.value, status: 'active' as const }]
    : []),
  {
    id: 'offers',
    title: 'Offers received',
    description: invoice.value ? `${offers.value.length} contract offers, you choose one` : 'You choose one offer',
    status: !invoice.value ? 'disabled' : confirmedOffer.value ? 'success' : 'active',
  },
  {
    id: 'review',
    title: 'Sent to financing partners',
    description: 'After document review',
    status: invoice.value ? 'success' : 'disabled',
  },
  invoice.value
    ? { id: 'invoice', title: `${itemTitle.value} attached`, description: invoiceNumber.value, status: 'success' }
    : {
        id: 'invoice',
        title: `${itemTitle.value} not added yet`,
        description: 'Add it to start lender review',
        status: 'active',
      },
  { id: 'submitted', title: 'Application submitted', description: submittedAt.value, status: 'success' },
])
</script>

<template>
  <div class="application-detail">
    <div class="application-detail__header">
      <button type="button" class="application-detail__back" @click="goHome()">
        <span class="application-detail__back-icon" aria-hidden="true"></span>
        Back to Home
      </button>
      <h1 id="application-detail-title" class="application-detail__title" tabindex="-1">
        Application details
      </h1>
      <p class="application-detail__subtitle">
        {{ product.name }} · Application number
        <span class="application-detail__number">{{ applicationId }}</span>
      </p>
    </div>

    <Alert
      v-if="application && showSubmitted"
      status="success"
      :title-text="invoice ? 'Application submitted' : 'Application saved'"
      :description-text="
        invoice
          ? 'We are checking your documents. You will be notified when lenders send offers.'
          : `Add ${itemArticle} to send it to financing partners.`
      "
      :has-action="false"
      @dismiss="showSubmitted = false"
    />

    <div v-if="application" class="application-detail__grid">
      <section class="application-detail__card application-detail__main">
        <div
          class="application-detail__tabs"
          role="tablist"
          aria-label="Application sections"
          @keydown="onTabKeydown"
        >
          <button
            id="application-tab-financing"
            type="button"
            role="tab"
            class="application-detail__tab"
            :class="{ 'application-detail__tab--active': activeTab === 'financing' }"
            :aria-selected="activeTab === 'financing'"
            :tabindex="activeTab === 'financing' ? 0 : -1"
            aria-controls="application-panel"
            @click="activeTab = 'financing'"
          >
            Financing details
          </button>
          <button
            id="application-tab-applicant"
            type="button"
            role="tab"
            class="application-detail__tab"
            :class="{ 'application-detail__tab--active': activeTab === 'applicant' }"
            :aria-selected="activeTab === 'applicant'"
            :tabindex="activeTab === 'applicant' ? 0 : -1"
            aria-controls="application-panel"
            @click="activeTab = 'applicant'"
          >
            Applicant summary
          </button>
        </div>

        <div
          id="application-panel"
          class="application-detail__panel"
          role="tabpanel"
          :aria-labelledby="`application-tab-${activeTab}`"
        >
          <template v-if="activeTab === 'financing'">
            <section class="application-detail__section" aria-labelledby="financing-summary-title">
              <div class="application-detail__section-heading">
                <h2 id="financing-summary-title">Financing summary</h2>
              </div>
              <dl class="application-detail__facts">
                <div>
                  <dt>Financing type</dt>
                  <dd>{{ product.name }}</dd>
                </div>
                <div>
                  <dt>{{ tab.counterpartyLabel }}</dt>
                  <dd>{{ invoice?.counterparty ?? partner?.name ?? 'Not added yet' }}</dd>
                </div>
                <div>
                  <dt>{{ tab.itemLabel === 'bills' ? 'Bill number' : 'Invoice number' }}</dt>
                  <dd :class="{ 'application-detail__pending': !invoice }">{{ invoiceNumber || 'Not added yet' }}</dd>
                </div>
                <div>
                  <dt>{{ tab.itemLabel === 'bills' ? 'Bill amount' : 'Invoice amount' }}</dt>
                  <dd class="application-detail__amount" :class="{ 'application-detail__pending': !invoice }">
                    {{ invoice ? formatRupiah(invoice.amount) : 'Not added yet' }}
                  </dd>
                </div>
                <div>
                  <dt>Due date</dt>
                  <dd :class="{ 'application-detail__pending': !invoice }">
                    {{ invoice?.dueDate ?? 'Not added yet' }}
                    <span
                      class="application-detail__due-note"
                      :class="{ 'application-detail__due-note--overdue': invoice?.overdue }"
                    >
                      {{ invoice?.dueNote }}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt>Financing amount</dt>
                  <dd class="application-detail__pending">Set by lender offers</dd>
                </div>
              </dl>
            </section>

            <section v-if="invoice" class="application-detail__section" aria-labelledby="supporting-docs-title">
              <div class="application-detail__docs-heading">
                <div class="application-detail__section-heading">
                  <h2 id="supporting-docs-title">Supporting documents</h2>
                  <p>Attached automatically from Transaction Hub.</p>
                </div>
                <Button variant="outline" color="neutral" size="small" type="button" class="application-detail__button">
                  Download all
                </Button>
              </div>
              <ul class="application-detail__docs">
                <li v-for="document in supportingDocuments" :key="document.label" class="application-detail__doc">
                  <span class="application-detail__doc-icon" aria-hidden="true"></span>
                  <span class="application-detail__doc-copy">
                    <span class="application-detail__doc-label">{{ document.label }}</span>
                    <span class="application-detail__doc-file">{{ document.fileName }}</span>
                  </span>
                  <button
                    type="button"
                    class="application-detail__icon-button"
                    :aria-label="`View ${document.label}`"
                    @click="view(document)"
                  >
                    <span class="application-detail__action-icon application-detail__action-icon--view" aria-hidden="true"></span>
                  </button>
                  <button
                    type="button"
                    class="application-detail__icon-button"
                    :aria-label="`Download ${document.label}`"
                  >
                    <span class="application-detail__action-icon application-detail__action-icon--download" aria-hidden="true"></span>
                  </button>
                </li>
              </ul>
            </section>
          </template>

          <template v-else>
            <section class="application-detail__section" aria-labelledby="applicant-title">
              <div class="application-detail__section-heading">
                <h2 id="applicant-title">Applicant</h2>
              </div>
              <dl class="application-detail__facts">
                <div>
                  <dt>Company</dt>
                  <dd>PT Maju Sejahtera Indonesia</dd>
                </div>
                <div>
                  <dt>Disbursement account</dt>
                  <dd>{{ bank ? `${bank.bank} · ${bank.number}` : '' }}</dd>
                </div>
                <div>
                  <dt>Account holder</dt>
                  <dd>{{ bank?.holder }}</dd>
                </div>
                <div>
                  <dt>Submitted</dt>
                  <dd>{{ submittedAt }}</dd>
                </div>
              </dl>
            </section>

            <section class="application-detail__section" aria-labelledby="company-docs-title">
              <div class="application-detail__section-heading">
                <h2 id="company-docs-title">Company documents</h2>
                <p>Shared with lenders for this application.</p>
              </div>
              <FinancingDocumentList
                :stage="documentStage"
                :uploaded-ids="source?.uploadedIds ?? []"
                :replaced-files="source?.replacedFiles ?? {}"
              />
            </section>
          </template>
        </div>
      </section>

      <aside class="application-detail__side" aria-label="Application progress">
        <section class="application-detail__card application-detail__side-card" aria-labelledby="status-title">
          <div class="application-detail__card-header">
            <h2 id="status-title">Status</h2>
            <span
              class="application-detail__badge"
              :class="invoice ? 'application-detail__badge--info' : 'application-detail__badge--warning'"
            >
              {{ invoice ? (confirmedOffer ? 'Contract selected' : 'Contract selection') : application.status }}
            </span>
          </div>
          <template v-if="invoice">
            <p class="application-detail__text">
              {{
                confirmedOffer
                  ? `You chose the offer from ${confirmedLender}. Upload the payment agreement to receive your funds.`
                  : 'You have received loan contract offers. Review them and choose the contract that suits you.'
              }}
            </p>
            <div class="application-detail__lenders">
              <span>Contract offers</span>
              <span class="application-detail__lenders-count">{{ offers.length }}</span>
            </div>
            <Button
              v-if="!confirmedOffer"
              variant="outline"
              color="neutral"
              size="default"
              type="button"
              class="application-detail__button application-detail__add"
              @click="offersOpen = true"
            >
              See and select a contract
            </Button>
          </template>
          <template v-else>
            <p class="application-detail__text">
              Your application is saved but not sent yet. Lenders only review it once
              {{ itemArticle }} is attached.
            </p>
            <Button
              variant="default"
              color="primary"
              size="default"
              type="button"
              class="application-detail__button application-detail__add"
              @click="openAddInvoice"
            >
              Add {{ itemTitle.toLowerCase() }}
            </Button>
          </template>
        </section>

        <section
          v-if="product.needsPaymentAgreement && invoice"
          class="application-detail__card application-detail__side-card"
          aria-labelledby="agreement-title"
        >
          <div class="application-detail__card-header">
            <h2 id="agreement-title">Payment agreement</h2>
            <span
              class="application-detail__badge"
              :class="agreementState === 'uploaded' ? 'application-detail__badge--success' : 'application-detail__badge--warning'"
            >
              {{ agreementState === 'uploaded' ? 'Uploaded' : 'Not uploaded' }}
            </span>
          </div>
          <p class="application-detail__text">
            To ensure your funds are disbursed, upload your payment agreement. This step is needed for a
            smooth transaction.
          </p>
          <Button
            variant="outline"
            color="neutral"
            size="default"
            type="button"
            class="application-detail__button application-detail__add"
            @click="agreementOpen = true"
          >
            {{ agreementState === 'uploaded' ? 'Replace payment agreement' : 'Upload payment agreement' }}
          </Button>
        </section>

        <section class="application-detail__card application-detail__side-card" aria-labelledby="timeline-title">
          <div class="application-detail__card-header">
            <h2 id="timeline-title">Activity</h2>
          </div>
          <Timeline :items="timeline" label="Application activity" />
        </section>
      </aside>
    </div>

    <p v-else class="application-detail__text">This application is no longer available.</p>

    <Sheet v-model:open="offersOpen">
      <SheetContent class="application-detail__sheet" :style="{ maxWidth: '640px', width: '100%' }">
        <header class="application-detail__sheet-header">
          <SheetTitle class="application-detail__sheet-title">Select a loan offer</SheetTitle>
        </header>
        <div class="application-detail__sheet-body">
          <SheetDescription class="application-detail__offers-intro">
            There are <strong>{{ offers.length }} lenders</strong> interested in financing your loan. Choose one
            to review the details.
          </SheetDescription>
          <article v-for="offer in offers" :key="offer.id" class="application-detail__offer">
            <div class="application-detail__offer-head">
              <Avatar
                :initials="initials(offer.lender)"
                verified
                variant="inverse"
                :label="`${offer.lender}, verified lender`"
              />
              <h3>{{ offer.lender }}</h3>
            </div>
            <dl class="application-detail__offer-facts">
              <div>
                <dt>Interest rate</dt>
                <dd>{{ offer.rate }} per year</dd>
              </div>
              <div>
                <dt>Credit limit</dt>
                <dd>Rp0</dd>
              </div>
              <div>
                <dt>Disbursement amount</dt>
                <dd>{{ offer.disbursement }}</dd>
              </div>
              <div>
                <dt>Tenor</dt>
                <dd>{{ offer.tenor }} days</dd>
              </div>
              <div>
                <dt>Payment method</dt>
                <dd>Lump sum</dd>
              </div>
              <div>
                <dt>Total admin fee</dt>
                <dd>{{ offer.adminFee }}</dd>
              </div>
              <div>
                <dt>Late fee</dt>
                <dd>0,10% per day</dd>
              </div>
            </dl>
            <footer class="application-detail__offer-footer">
              <Button
                variant="default"
                color="primary"
                size="default"
                type="button"
                class="application-detail__button"
                @click="((confirmedOffer = offer.id), (offersOpen = false))"
              >
                Select and sign agreement
              </Button>
            </footer>
          </article>
        </div>
      </SheetContent>
    </Sheet>

    <Sheet v-model:open="agreementOpen">
      <SheetContent class="application-detail__sheet" :style="{ maxWidth: '480px', width: '100%' }">
        <header class="application-detail__sheet-header">
          <SheetTitle class="application-detail__sheet-title">Payment agreement</SheetTitle>
          <SheetDescription class="application-detail__sr">Download, sign and upload the payment agreement.</SheetDescription>
        </header>
        <div class="application-detail__sheet-body">
          <section class="application-detail__step">
            <h3><span class="application-detail__step-number">1</span>Download template</h3>
            <div class="application-detail__step-box application-detail__step-row">
              <span class="application-detail__doc-icon application-detail__doc-icon--attach" aria-hidden="true"></span>
              <span class="application-detail__doc-copy">payment-agreement-template.pdf</span>
              <Button variant="outline" color="neutral" size="small" type="button" class="application-detail__button">
                Download
              </Button>
            </div>
          </section>
          <section class="application-detail__step">
            <h3><span class="application-detail__step-number">2</span>Request a wet signature</h3>
            <div class="application-detail__step-box application-detail__step-row">
              <span class="application-detail__doc-icon application-detail__doc-icon--draw" aria-hidden="true"></span>
              <p class="application-detail__text">
                After filling in the template, ask {{ invoice?.counterparty ?? 'your buyer' }} to sign it by hand.
                Then upload the signed agreement in step 3.
              </p>
            </div>
          </section>
          <section class="application-detail__step">
            <h3><span class="application-detail__step-number">3</span>Upload agreement</h3>
            <div class="application-detail__step-box application-detail__step-row">
              <input
                ref="agreementInput"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                class="application-detail__sr"
                tabindex="-1"
                @change="onAgreementFile"
              />
              <Button
                variant="outline"
                color="neutral"
                size="small"
                type="button"
                class="application-detail__button"
                :disabled="agreementState === 'uploading'"
                @click="agreementInput?.click()"
              >
                {{ agreementState === 'uploading' ? 'Uploading…' : agreementFile ? 'Replace file' : 'Upload file' }}
              </Button>
              <span class="application-detail__text" role="status">
                {{ agreementState === 'uploaded' ? agreementFile : 'PDF/JPG/PNG, max 2 MB' }}
              </span>
            </div>
            <p v-if="agreementError" class="application-detail__error" role="alert">{{ agreementError }}</p>
          </section>
        </div>
      </SheetContent>
    </Sheet>

    <FinancingAddInvoiceDialog
      v-model:open="addInvoiceOpen"
      :candidates="candidates"
      :item-label="tab.itemLabel"
      :partner-name="partner?.name"
      :return-focus="addInvoiceTrigger"
      @attach="onAttach"
    />

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
.application-detail {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--primitives-padding-6);
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-body), sans-serif;
}

.application-detail__header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--primitives-padding-1);
}

.application-detail__back {
  display: inline-flex;
  align-items: center;
  gap: var(--primitives-padding-1);
  margin-bottom: var(--primitives-padding-2);
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

.application-detail__back:hover {
  color: var(--semantic-text-ach-color-text-default);
}

.application-detail__back-icon {
  width: 16px;
  height: 16px;
  background: currentColor;
  mask: url('/icons/ui-actions/arrow-back.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/arrow-back.svg') center / contain no-repeat;
}

.application-detail__back:focus-visible,
.application-detail__tab:focus-visible,
.application-detail__icon-button:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: var(--primitives-border-width-2);
}

.application-detail__title {
  margin: 0;
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-2xl);
  font-weight: 700;
  line-height: var(--primitives-line-heights-2xl);
}

.application-detail__title:focus {
  outline: none;
}

.application-detail__subtitle {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.application-detail__number {
  color: var(--semantic-text-ach-color-text-default);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.application-detail__grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  align-items: start;
  gap: var(--primitives-padding-6);
}

.application-detail__card {
  box-sizing: border-box;
  border: var(--primitives-border-width-default) solid var(--component-card-border);
  border-radius: var(--primitives-border-radius-lg);
  background: var(--component-card-background);
}

.application-detail__tabs {
  display: flex;
  gap: var(--primitives-padding-6);
  padding: 0 var(--primitives-padding-6);
  border-bottom: var(--primitives-border-width-default) solid var(--component-card-border);
}

.application-detail__tab {
  padding: var(--primitives-padding-4) 0 var(--primitives-padding-3);
  border: 0;
  border-bottom: var(--primitives-border-width-2) solid transparent;
  background: none;
  color: var(--component-tabs-line-item-text-inactive);
  cursor: pointer;
  font-family: inherit;
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-sm);
}

.application-detail__tab--active {
  border-bottom-color: var(--semantic-text-ach-color-text-default);
  color: var(--semantic-text-ach-color-text-default);
}

.application-detail__panel {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-8);
  padding: var(--primitives-padding-6);
}

.application-detail__section {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-4);
}

.application-detail__section-heading h2,
.application-detail__card-header h2 {
  margin: 0;
  font-size: var(--primitives-font-sizes-md);
  font-weight: 600;
  line-height: var(--primitives-line-heights-md);
}

.application-detail__section-heading p {
  margin: var(--primitives-padding-1) 0 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.application-detail__facts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--primitives-padding-4) var(--primitives-padding-6);
  margin: 0;
}

.application-detail__facts dt {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}

.application-detail__facts dd {
  margin: var(--primitives-padding-1) 0 0;
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-sm);
}

.application-detail__amount {
  font-variant-numeric: tabular-nums;
}

.application-detail__due-note {
  display: block;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 400;
  line-height: var(--primitives-line-heights-2xs);
}

.application-detail__due-note--overdue {
  color: var(--semantic-text-error-ach-color-text-error);
}

.application-detail__pending {
  color: var(--semantic-text-ach-color-text-secondary);
}

.application-detail__docs {
  margin: 0;
  padding: 0;
  border: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-default);
  border-radius: var(--primitives-border-radius-lg);
  list-style: none;
}

.application-detail__doc {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-3) var(--primitives-padding-4);
}

.application-detail__doc + .application-detail__doc {
  border-top: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
}

.application-detail__add {
  width: 100%;
}

.application-detail__doc-icon {
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
  background: var(--semantic-icon-ach-color-icon-default);
  mask: url('/icons/text-formatting/description.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/text-formatting/description.svg') center / contain no-repeat;
}

.application-detail__doc-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}

.application-detail__doc-label {
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.application-detail__doc-file {
  overflow: hidden;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.application-detail__docs-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--primitives-padding-4);
}

.application-detail__icon-button {
  display: inline-flex;
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-default);
  border-radius: var(--primitives-border-radius-infinite);
  background: none;
  cursor: pointer;
}

.application-detail__icon-button:hover {
  background: var(--semantic-bg-ach-color-bg-surface-hover);
}

.application-detail__action-icon {
  width: 16px;
  height: 16px;
  background: var(--semantic-icon-ach-color-icon-default);
}

.application-detail__action-icon--view {
  mask: url('/icons/common-actions/visibility.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/common-actions/visibility.svg') center / contain no-repeat;
}

.application-detail__action-icon--download {
  mask: url('/icons/ui-actions/download.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/download.svg') center / contain no-repeat;
}

.application-detail__side {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-4);
}

.application-detail__side-card {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-4);
}

.application-detail__card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-3);
  margin: calc(var(--primitives-padding-4) * -1) calc(var(--primitives-padding-4) * -1) 0;
  padding: var(--primitives-padding-4);
  border-bottom: var(--primitives-border-width-default) solid var(--component-card-border);
}

.application-detail__badge {
  padding: 2px var(--primitives-padding-2);
  border-radius: var(--primitives-border-radius-infinite);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 500;
  line-height: var(--primitives-line-heights-2xs);
  white-space: nowrap;
}

.application-detail__badge--info {
  background: var(--semantic-bg-info-ach-color-bg-info-surface);
  color: var(--semantic-fg-info-ach-color-fg-info);
}

.application-detail__badge--warning {
  background: var(--semantic-bg-warning-ach-color-bg-warning-surface);
  color: var(--semantic-fg-warning-ach-color-fg-warning);
}

.application-detail__badge--success {
  background: var(--semantic-bg-success-ach-color-bg-success-surface);
  color: var(--semantic-fg-success-ach-color-fg-success);
}

.application-detail__text,
.application-detail__hint {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.application-detail__hint {
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}

.application-detail__lenders {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--primitives-padding-3);
  border-radius: var(--primitives-border-radius-md);
  background: var(--semantic-bg-ach-color-bg-surface-secondary);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.application-detail__lenders-count {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.application-detail__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.application-detail__offers-intro {
  margin: 0;
  font-size: var(--primitives-font-sizes-md);
  line-height: var(--primitives-line-heights-md);
}

.application-detail__offers-intro strong {
  color: var(--semantic-text-ach-color-text-link);
  font-weight: 500;
}

.application-detail__offer {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-4);
  padding: var(--primitives-padding-5);
  border: var(--primitives-border-width-default) solid var(--component-card-border);
  border-radius: var(--primitives-border-radius-lg);
}

.application-detail__offer-head {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-3);
}

.application-detail__offer-head h3 {
  margin: 0;
  font-size: var(--primitives-font-sizes-lg);
  font-weight: 600;
  line-height: var(--primitives-line-heights-lg);
}

.application-detail__offer-facts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--primitives-padding-4);
  margin: 0;
}

.application-detail__offer-facts dt {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}

.application-detail__offer-facts dd {
  margin: var(--primitives-padding-1) 0 0;
  font-size: var(--primitives-font-sizes-md);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  line-height: var(--primitives-line-heights-md);
}

.application-detail__offer-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: var(--primitives-padding-4);
  border-top: var(--primitives-border-width-default) solid var(--component-card-border);
}

.application-detail__sheet {
  padding: 0;
}

.application-detail__sheet-header {
  padding: var(--primitives-padding-4) var(--primitives-padding-6);
  border-bottom: var(--primitives-border-width-default) solid var(--component-card-border);
}

.application-detail__sheet-title {
  margin: 0;
  font-size: var(--primitives-font-sizes-lg);
  font-weight: 600;
  line-height: var(--primitives-line-heights-lg);
}

.application-detail__sheet-body {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-6);
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  padding: var(--primitives-padding-2) var(--primitives-padding-6) var(--primitives-padding-6);
}

.application-detail__step {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-2);
}

.application-detail__step h3 {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-2);
  margin: 0;
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-sm);
}

.application-detail__step-number {
  display: inline-flex;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  border: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-default);
  border-radius: var(--primitives-border-radius-infinite);
  font-size: var(--primitives-font-sizes-xs);
  font-variant-numeric: tabular-nums;
}

.application-detail__step-box {
  padding: var(--primitives-padding-3) var(--primitives-padding-4);
  border: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-default);
  border-radius: var(--primitives-border-radius-md);
}

.application-detail__step-row {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-3);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.application-detail__doc-icon--attach {
  mask-image: url('/icons/text-formatting/attach-file.svg');
  -webkit-mask-image: url('/icons/text-formatting/attach-file.svg');
}

.application-detail__doc-icon--draw {
  mask-image: url('/icons/text-formatting/draw.svg');
  -webkit-mask-image: url('/icons/text-formatting/draw.svg');
}

.application-detail__error {
  margin: 0;
  color: var(--semantic-text-error-ach-color-text-error);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}

.application-detail__button:deep(.ach-button),
.application-detail__button.ach-button {
  border-radius: var(--primitives-border-radius-infinite);
}









@media (max-width: 1024px) {
  .application-detail__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 640px) {
  .application-detail__offer-facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .application-detail__facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .application-detail__panel {
    padding: var(--primitives-padding-4);
  }

  .application-detail__tabs {
    padding: 0 var(--primitives-padding-4);
  }
}
</style>
