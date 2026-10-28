<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { credorTransactionTabs } from '@/components/credor/transactions'
import { bankAccounts, financingProducts } from '@/components/credor/financing-submit/requirements'
import FinancingDocumentList from '@/components/credor/financing-submit/FinancingDocumentList.vue'
import FinancingDocumentPreview from '@/components/credor/financing-submit/FinancingDocumentPreview.vue'
import { useAppView } from '@/composables/useAppView'
import { usePrototypeState } from '@/lib/prototype/usePrototypeState'
import { formatRupiah } from '@/lib/loan-calculator'

const props = defineProps<{
  applicationId: string
  justSubmitted: boolean
}>()

const { state, documentStage } = usePrototypeState()
const { goHome } = useAppView()

const application = computed(
  () => state.data.applications.find((item) => item.id === props.applicationId) ?? null,
)
const source = computed(() => application.value?.source ?? null)
const tab = computed(
  () => credorTransactionTabs.find((item) => item.id === source.value?.tabId) ?? credorTransactionTabs[0],
)
const invoice = computed(() => tab.value.rows.find((row) => row.id === source.value?.rowId) ?? null)
const product = computed(() => financingProducts[tab.value.id] ?? financingProducts.sales)
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

let agreementTimer: number | undefined

function view(document: { label: string; fileName: string }) {
  const trigger = window.document.activeElement instanceof HTMLElement ? window.document.activeElement : null
  preview.value = { ...document, trigger }
  previewOpen.value = true
}

function uploadAgreement() {
  agreementState.value = 'uploading'
  agreementTimer = window.setTimeout(() => {
    agreementState.value = 'uploaded'
  }, 700)
}

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

const timeline = computed(() => [
  { title: 'Application submitted', meta: submittedAt.value, done: true },
  {
    title: `${tab.value.itemLabel === 'bills' ? 'Bill' : 'Invoice'} attached`,
    meta: invoiceNumber.value,
    done: true,
  },
  { title: 'Sent to financing partners', meta: 'After document review', done: false },
  { title: 'Offers received', meta: 'You choose one offer', done: false },
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
      title-text="Application submitted"
      description-text="We are checking your documents. You will be notified when lenders send offers."
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
                  <dd>{{ invoice?.counterparty }}</dd>
                </div>
                <div>
                  <dt>{{ tab.itemLabel === 'bills' ? 'Bill number' : 'Invoice number' }}</dt>
                  <dd>{{ invoiceNumber }}</dd>
                </div>
                <div>
                  <dt>{{ tab.itemLabel === 'bills' ? 'Bill amount' : 'Invoice amount' }}</dt>
                  <dd class="application-detail__amount">{{ invoice ? formatRupiah(invoice.amount) : '' }}</dd>
                </div>
                <div>
                  <dt>Due date</dt>
                  <dd>
                    {{ invoice?.dueDate }}
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

            <section class="application-detail__section" aria-labelledby="supporting-docs-title">
              <div class="application-detail__section-heading">
                <h2 id="supporting-docs-title">Supporting documents</h2>
                <p>Attached automatically from Transaction Hub.</p>
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
                    class="application-detail__link"
                    :aria-label="`View ${document.label}`"
                    @click="view(document)"
                  >
                    View
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
                  <dd>PT Harapan Terakhir</dd>
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
            <span class="application-detail__badge application-detail__badge--info">{{ application.status }}</span>
          </div>
          <p class="application-detail__text">
            We are checking your documents and sending the application to financing partners. This
            usually takes 1 business day.
          </p>
          <div class="application-detail__lenders">
            <span>Lender offers</span>
            <span class="application-detail__lenders-count">0</span>
          </div>
          <p class="application-detail__hint">Offers appear here with the amount, fees and repayment date.</p>
        </section>

        <section
          v-if="product.needsPaymentAgreement"
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
          <ol class="application-detail__agreement-steps">
            <li>Download the agreement template.</li>
            <li>Ask {{ invoice?.counterparty ?? 'your buyer' }} to sign it.</li>
            <li>Upload the signed agreement (PDF, JPG or PNG, max 2 MB).</li>
          </ol>
          <div class="application-detail__agreement-actions">
            <Button variant="outline" color="neutral" size="small" type="button" class="application-detail__button">
              Download template
            </Button>
            <Button
              variant="outline"
              color="neutral"
              size="small"
              type="button"
              class="application-detail__button"
              :disabled="agreementState !== 'missing'"
              @click="uploadAgreement"
            >
              {{ agreementState === 'uploading' ? 'Uploading…' : agreementState === 'uploaded' ? 'Uploaded' : 'Upload signed agreement' }}
            </Button>
          </div>
        </section>

        <section class="application-detail__card application-detail__side-card" aria-labelledby="timeline-title">
          <div class="application-detail__card-header">
            <h2 id="timeline-title">Activity</h2>
          </div>
          <ol class="application-detail__timeline">
            <li
              v-for="item in timeline"
              :key="item.title"
              class="application-detail__event"
              :class="{ 'application-detail__event--pending': !item.done }"
            >
              <span class="application-detail__event-dot" aria-hidden="true"></span>
              <span class="application-detail__event-copy">
                <span class="application-detail__event-title">{{ item.title }}</span>
                <span class="application-detail__event-meta">{{ item.meta }}</span>
              </span>
            </li>
          </ol>
        </section>
      </aside>
    </div>

    <p v-else class="application-detail__text">This application is no longer available.</p>

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
.application-detail__link:focus-visible {
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

.application-detail__link {
  padding: var(--primitives-padding-1) 0;
  border: 0;
  border-radius: var(--primitives-border-radius-xs);
  background: none;
  color: var(--semantic-text-ach-color-text-link);
  cursor: pointer;
  font-family: inherit;
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
}

.application-detail__link:hover {
  text-decoration: underline;
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

.application-detail__agreement-steps {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-2);
  margin: 0;
  padding-left: var(--primitives-padding-5);
  color: var(--semantic-text-ach-color-text-secondary);
  list-style: decimal;
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.application-detail__agreement-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--primitives-padding-2);
}

.application-detail__button:deep(.ach-button),
.application-detail__button.ach-button {
  border-radius: var(--primitives-border-radius-infinite);
}

.application-detail__timeline {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-4);
  margin: 0;
  padding: 0;
  list-style: none;
}

.application-detail__event {
  display: flex;
  align-items: flex-start;
  gap: var(--primitives-padding-3);
}

.application-detail__event-dot {
  width: 10px;
  height: 10px;
  flex: 0 0 10px;
  margin-top: 5px;
  border: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-default);
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--semantic-text-ach-color-text-default);
}

.application-detail__event--pending .application-detail__event-dot {
  border-color: var(--semantic-border-ach-color-border-strong);
  background: none;
}

.application-detail__event-copy {
  display: flex;
  flex-direction: column;
}

.application-detail__event-title {
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-sm);
}

.application-detail__event--pending .application-detail__event-title {
  color: var(--semantic-text-ach-color-text-secondary);
  font-weight: 400;
}

.application-detail__event-meta {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}

@media (max-width: 1024px) {
  .application-detail__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 640px) {
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
