<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useAppView, type LenderDetailTab, type LenderLeadTab } from '@/composables/useAppView'
import { useSnackbar } from '@/composables/useSnackbar'
import {
  formatLenderDate,
  formatLenderDateTime,
  formatRupiah,
} from '@/lib/lender/lender-data'
import { useLenderPortal } from '@/lib/lender/useLenderPortal'
import LenderOfferSidebar from './LenderOfferSidebar.vue'
import LenderPageHeader from './LenderPageHeader.vue'
import LenderRepaymentModal from './LenderRepaymentModal.vue'

const props = withDefaults(
  defineProps<{
    id: string
    source: 'leads' | 'loans'
    initialTab?: LenderDetailTab
  }>(),
  {
    initialTab: 'borrower',
  },
)

const { openLenderLeads, openLenderLoans, openLenderContract } = useAppView()
const { getDetailRecord } = useLenderPortal()
const { show: showSnackbar } = useSnackbar()

const activeTab = ref<LenderDetailTab>(props.initialTab)
const repaymentModalOpen = ref(false)
const openCategories = ref<string[]>(['company'])

watch(
  () => [props.id, props.initialTab] as const,
  ([, nextTab]) => {
    activeTab.value = nextTab ?? 'borrower'
  },
)

const record = computed(() => getDetailRecord(props.id))
const isUnclaimed = computed(() => record.value?.state === 'unclaimed')

const displayCompanyName = computed(() => {
  if (!record.value) return ''
  return record.value.state === 'unclaimed'
    ? record.value.maskedCompanyName
    : record.value.companyName
})

const headerConfig = computed(() => {
  if (props.source === 'loans') {
    return {
      title: 'Loan Detail',
      subtitle: 'Monitor active loan terms and repayment status.',
      backLabel: 'Back to Active Loans',
    }
  }
  return {
    title: 'Detail',
    subtitle: 'Review prospective borrowers and financing opportunities.',
    backLabel: 'Back to Leads',
  }
})

const statusMeta = computed(() => {
  const item = record.value
  if (!item) return { label: 'Unknown', tone: 'neutral' as const }

  if (item.state === 'unclaimed') {
    return { label: 'Potential Lead', tone: 'info' as const }
  }
  if (item.state === 'rejected') {
    return { label: 'Rejected', tone: 'error' as const }
  }
  if (item.state === 'active') {
    if (item.loanStatus === 'overdue') return { label: 'Overdue', tone: 'error' as const }
    if (item.loanStatus === 'paid') return { label: 'Paid', tone: 'success' as const }
    return { label: 'Active', tone: 'success' as const }
  }
  if (item.claimSubStatus === 'contract-uploaded') {
    return { label: 'Contract Uploaded', tone: 'success' as const }
  }
  if (item.claimSubStatus === 'data-requested') {
    return { label: 'Data Requested', tone: 'warning' as const }
  }
  return { label: 'Claimed', tone: 'info' as const }
})

const tabs: { id: LenderDetailTab; label: string }[] = [
  { id: 'borrower', label: 'Borrower Summary' },
  { id: 'loan', label: 'Loan Details' },
  { id: 'risk-pulse', label: 'RiskPulse' },
]

function handleBack() {
  if (props.source === 'loans') {
    openLenderLoans()
    return
  }
  const state = record.value?.state
  const leadTab: LenderLeadTab =
    state === 'claimed' || state === 'rejected' ? state : 'unclaimed'
  openLenderLeads(leadTab)
}

function handleTabKeydown(event: KeyboardEvent, index: number) {
  if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
  event.preventDefault()
  const delta = event.key === 'ArrowRight' ? 1 : -1
  const nextIndex = (index + delta + tabs.length) % tabs.length
  activeTab.value = tabs[nextIndex].id
}

async function copyApplicationNumber() {
  if (!record.value) return
  const value = record.value.applicationNumber
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value)
    }
  } catch {
    // Clipboard access can be restricted in headless contexts; still confirm feedback.
  }
  showSnackbar({
    variant: 'success',
    title: 'Application number copied',
    description: `${value} copied to clipboard.`,
  })
}

function handleDownloadAll() {
  if (!record.value || isUnclaimed.value) return
  showSnackbar({
    variant: 'success',
    title: 'Downloading document bundle',
    description: `Preparing all verification documents for ${record.value.companyName}.`,
  })
}

function handleDocumentAction(action: 'view' | 'download', label: string, fileName: string) {
  showSnackbar({
    variant: action === 'download' ? 'success' : 'neutral',
    title: action === 'download' ? 'Document download started' : 'Document preview',
    description: `${label}: ${fileName}`,
  })
}

function handleOpenContract(contractId: string) {
  if (!record.value) return
  openLenderContract(record.value.id, contractId, props.source)
}
</script>

<template>
  <div class="lender-detail">
    <LenderPageHeader
      :title="headerConfig.title"
      :subtitle="headerConfig.subtitle"
      show-back
      :back-label="headerConfig.backLabel"
      @back="handleBack"
    />

    <div v-if="!record" class="lender-detail__empty">
      <h2 class="lender-detail__empty-title">Record not found</h2>
      <p class="lender-detail__empty-copy">
        The requested financing record could not be located in the current session.
      </p>
      <Button type="button" variant="outline" color="primary" @click="handleBack">
        {{ headerConfig.backLabel }}
      </Button>
    </div>

    <div v-else class="lender-detail__grid">
      <!-- Left Main Column -->
      <div class="lender-detail__main">
        <!-- Top Identity Card -->
        <section class="lender-detail__card lender-detail__identity">
          <div class="lender-detail__identity-top">
            <div class="lender-detail__company-wrap">
              <div class="lender-detail__company-row">
                <img
                  v-if="isUnclaimed"
                  src="/icons/common-actions/lock.svg"
                  alt=""
                  class="lender-detail__lock-icon"
                />
                <h2 class="lender-detail__company-name">{{ displayCompanyName }}</h2>
              </div>

              <div class="lender-detail__app-row">
                <span class="lender-detail__app-label">Application No.</span>
                <span class="lender-detail__app-number">{{ record.applicationNumber }}</span>
                <button
                  type="button"
                  class="lender-detail__copy-btn"
                  aria-label="Copy application number"
                  @click="copyApplicationNumber"
                >
                  <img src="/icons/text-formatting/content-copy.svg" alt="" class="lender-detail__copy-icon" />
                </button>
              </div>
            </div>

            <div class="lender-detail__badges">
              <span
                v-if="isUnclaimed && record.badge"
                class="lender-detail__badge lender-detail__badge--brand"
              >
                {{ record.badge }}
              </span>
              <span class="lender-detail__badge" :class="`lender-detail__badge--${statusMeta.tone}`">
                {{ statusMeta.label }}
              </span>
            </div>
          </div>

          <dl class="lender-detail__identity-meta">
            <div class="lender-detail__meta-cell">
              <dt>Submitted</dt>
              <dd class="lender-detail__tabular">
                {{ formatLenderDateTime(record.submittedAt) }}
              </dd>
            </div>
            <div class="lender-detail__meta-cell">
              <dt>Loan Type</dt>
              <dd>{{ record.loanType }}</dd>
            </div>
            <div class="lender-detail__meta-cell">
              <dt>Sub-Type</dt>
              <dd>{{ record.subType }}</dd>
            </div>
          </dl>
        </section>

        <!-- Detail Workspace Tabs Card -->
        <section class="lender-detail__card">
          <div class="lender-detail__tabs" role="tablist" aria-label="Detail sections">
            <button
              v-for="(tab, index) in tabs"
              :id="`lender-detail-tab-${tab.id}`"
              :key="tab.id"
              type="button"
              role="tab"
              class="lender-detail__tab"
              :class="{ 'lender-detail__tab--active': activeTab === tab.id }"
              :aria-selected="activeTab === tab.id"
              :aria-controls="`lender-detail-panel-${tab.id}`"
              :tabindex="activeTab === tab.id ? 0 : -1"
              @click="activeTab = tab.id"
              @keydown="handleTabKeydown($event, index)"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- Tab 1: Borrower Summary -->
          <div
            v-show="activeTab === 'borrower'"
            id="lender-detail-panel-borrower"
            role="tabpanel"
            aria-labelledby="lender-detail-tab-borrower"
            class="lender-detail__panel"
          >
            <div class="lender-detail__section">
              <div class="lender-detail__section-heading">
                <h3>Borrower Profile</h3>
                <p>
                  <template v-if="isUnclaimed">
                    Sensitive company and contact attributes remain masked until you claim this lead.
                  </template>
                  <template v-else>
                    Verified borrower profile, key contacts, and reported financial capacity.
                  </template>
                </p>
              </div>

              <dl class="lender-detail__facts">
                <div class="lender-detail__fact">
                  <dt>Business Scale</dt>
                  <dd>{{ record.businessScale }}</dd>
                </div>

                <div class="lender-detail__fact">
                  <dt>Company NPWP</dt>
                  <dd class="lender-detail__tabular">
                    <span v-if="isUnclaimed" class="lender-detail__masked-value">
                      <img src="/icons/common-actions/lock.svg" alt="" class="lender-detail__inline-lock" />
                      Hidden until claimed
                    </span>
                    <template v-else>{{ record.npwp }}</template>
                  </dd>
                </div>

                <div class="lender-detail__fact">
                  <dt>PIC Name</dt>
                  <dd>
                    <span v-if="isUnclaimed" class="lender-detail__masked-value">
                      <img src="/icons/common-actions/lock.svg" alt="" class="lender-detail__inline-lock" />
                      Hidden until claimed
                    </span>
                    <template v-else>{{ record.picName }}</template>
                  </dd>
                </div>

                <div class="lender-detail__fact">
                  <dt>Phone Number</dt>
                  <dd class="lender-detail__tabular">
                    <span v-if="isUnclaimed" class="lender-detail__masked-value">
                      <img src="/icons/common-actions/lock.svg" alt="" class="lender-detail__inline-lock" />
                      Hidden until claimed
                    </span>
                    <template v-else>{{ record.phone }}</template>
                  </dd>
                </div>

                <div class="lender-detail__fact">
                  <dt>Email</dt>
                  <dd>
                    <span v-if="isUnclaimed" class="lender-detail__masked-value">
                      <img src="/icons/common-actions/lock.svg" alt="" class="lender-detail__inline-lock" />
                      Hidden until claimed
                    </span>
                    <template v-else>{{ record.email }}</template>
                  </dd>
                </div>

                <div class="lender-detail__fact">
                  <dt>Annual Revenue</dt>
                  <dd class="lender-detail__tabular">
                    <span v-if="isUnclaimed" class="lender-detail__masked-value">
                      <img src="/icons/common-actions/lock.svg" alt="" class="lender-detail__inline-lock" />
                      Hidden until claimed
                    </span>
                    <template v-else>{{ formatRupiah(record.annualRevenue) }}</template>
                  </dd>
                </div>

                <div class="lender-detail__fact">
                  <dt>Gross Profit</dt>
                  <dd class="lender-detail__tabular">
                    <span v-if="isUnclaimed" class="lender-detail__masked-value">
                      <img src="/icons/common-actions/lock.svg" alt="" class="lender-detail__inline-lock" />
                      Hidden until claimed
                    </span>
                    <template v-else>{{ formatRupiah(record.grossProfit) }}</template>
                  </dd>
                </div>

                <div class="lender-detail__fact">
                  <dt>Industry</dt>
                  <dd>{{ record.industry }}</dd>
                </div>

                <div class="lender-detail__fact">
                  <dt>Location</dt>
                  <dd>{{ record.location }}</dd>
                </div>
              </dl>
            </div>

            <div class="lender-detail__section">
              <div class="lender-detail__docs-header">
                <div class="lender-detail__section-heading">
                  <h3>Borrower Supporting Documents</h3>
                  <p>Corporate legalities, signatory IDs, business permits, and financial reports.</p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  color="neutral"
                  size="small"
                  :disabled="isUnclaimed"
                  @click="handleDownloadAll"
                >
                  <template #leadingIcon>
                    <img src="/icons/ui-actions/download.svg" alt="" class="lender-detail__btn-icon" />
                  </template>
                  Download All
                </Button>
              </div>

              <Alert
                v-if="isUnclaimed"
                status="info"
                title-text="Documents locked on unclaimed lead"
                description-text="Claim this lead in the right panel to view and download all 5 borrower verification categories."
                :has-action="false"
                :dismissible="false"
              />

              <Accordion v-model="openCategories" type="multiple" class="lender-detail__accordion">
                <AccordionItem
                  v-for="category in record.borrowerDocCategories"
                  :key="category.id"
                  :value="category.id"
                >
                  <AccordionTrigger>
                    <div class="lender-detail__acc-trigger">
                      <span>{{ category.label }}</span>
                      <span class="lender-detail__acc-count">
                        {{ category.files.length }} {{ category.files.length === 1 ? 'file' : 'files' }}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div v-if="isUnclaimed" class="lender-detail__locked-cat">
                      <img src="/icons/common-actions/lock.svg" alt="" class="lender-detail__inline-lock" />
                      <span>Claim this borrower to access {{ category.label }} files.</span>
                    </div>

                    <ul v-else class="lender-detail__doc-list">
                      <li
                        v-for="file in category.files"
                        :key="file.id"
                        class="lender-detail__doc-row"
                      >
                        <span class="lender-detail__doc-icon" aria-hidden="true"></span>
                        <div class="lender-detail__doc-copy">
                          <span class="lender-detail__doc-label">{{ file.label }}</span>
                          <span class="lender-detail__doc-meta">
                            {{ file.fileName }} · {{ formatLenderDate(file.uploadedAt) }} · {{ file.sizeLabel }}
                          </span>
                        </div>
                        <div class="lender-detail__doc-actions">
                          <button
                            type="button"
                            class="lender-detail__icon-btn"
                            :aria-label="`Preview ${file.label}`"
                            @click="handleDocumentAction('view', file.label, file.fileName)"
                          >
                            <span class="lender-detail__action-icon lender-detail__action-icon--view" aria-hidden="true"></span>
                          </button>
                          <button
                            type="button"
                            class="lender-detail__icon-btn"
                            :aria-label="`Download ${file.label}`"
                            @click="handleDocumentAction('download', file.label, file.fileName)"
                          >
                            <span class="lender-detail__action-icon lender-detail__action-icon--download" aria-hidden="true"></span>
                          </button>
                        </div>
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          <!-- Tab 2: Loan Details -->
          <div
            v-show="activeTab === 'loan'"
            id="lender-detail-panel-loan"
            role="tabpanel"
            aria-labelledby="lender-detail-tab-loan"
            class="lender-detail__panel"
          >
            <div class="lender-detail__section">
              <div class="lender-detail__section-heading">
                <h3>Collateral Loan Summary</h3>
                <p>Underlying commercial invoice, e-Faktur tax reference, and counterparty settlement status.</p>
              </div>

              <dl class="lender-detail__facts">
                <div class="lender-detail__fact">
                  <dt>Loan Type</dt>
                  <dd>{{ record.loanType }}</dd>
                </div>

                <div class="lender-detail__fact">
                  <dt>Counterparty</dt>
                  <dd>{{ record.collateral.counterpartyName }}</dd>
                </div>

                <div class="lender-detail__fact">
                  <dt>Counterparty NPWP</dt>
                  <dd class="lender-detail__tabular">{{ record.collateral.counterpartyNpwp }}</dd>
                </div>

                <div class="lender-detail__fact">
                  <dt>Invoice Number</dt>
                  <dd class="lender-detail__tabular">
                    <span>{{ record.collateral.invoiceNumber }}</span>
                    <span
                      class="lender-detail__inline-badge"
                      :class="record.collateral.invoiceStatus === 'Approved' ? 'lender-detail__inline-badge--success' : 'lender-detail__inline-badge--warning'"
                    >
                      {{ record.collateral.invoiceStatus }}
                    </span>
                  </dd>
                </div>

                <div class="lender-detail__fact">
                  <dt>Due Date</dt>
                  <dd class="lender-detail__tabular">{{ formatLenderDate(record.collateral.dueDate) }}</dd>
                </div>

                <div class="lender-detail__fact">
                  <dt>e-Faktur</dt>
                  <dd class="lender-detail__tabular">
                    <span>{{ record.collateral.eFakturNumber }}</span>
                    <span
                      class="lender-detail__inline-badge"
                      :class="record.collateral.eFakturStatus === 'Approved' ? 'lender-detail__inline-badge--success' : 'lender-detail__inline-badge--warning'"
                    >
                      {{ record.collateral.eFakturStatus }}
                    </span>
                  </dd>
                </div>

                <div class="lender-detail__fact">
                  <dt>Invoice Amount</dt>
                  <dd class="lender-detail__tabular">{{ formatRupiah(record.collateral.invoiceAmount) }}</dd>
                </div>

                <div class="lender-detail__fact">
                  <dt>Payment Status</dt>
                  <dd>
                    <span
                      class="lender-detail__badge"
                      :class="record.collateral.paymentStatus === 'Paid' ? 'lender-detail__badge--success' : 'lender-detail__badge--warning'"
                    >
                      {{ record.collateral.paymentStatus }}
                    </span>
                  </dd>
                </div>

                <div class="lender-detail__fact">
                  <dt>Estimated Loan</dt>
                  <dd class="lender-detail__tabular">{{ formatRupiah(record.estimatedLoanAmount) }}</dd>
                </div>
              </dl>
            </div>

            <div class="lender-detail__section">
              <div class="lender-detail__section-heading">
                <h3>Loan Supporting Documents</h3>
                <p>Tax invoices, commercial invoices, and transaction audit trails linked to this collateral.</p>
              </div>

              <div v-if="isUnclaimed" class="lender-detail__locked-banner">
                <img src="/icons/common-actions/lock.svg" alt="" class="lender-detail__locked-banner-icon" />
                <div>
                  <p class="lender-detail__locked-banner-title">
                    Full documents will be available after you claim this borrower.
                  </p>
                  <p class="lender-detail__locked-banner-sub">
                    Claim the lead to inspect the e-Faktur PDF, commercial invoice PDF, and transaction CSV.
                  </p>
                </div>
              </div>

              <ul v-else class="lender-detail__doc-list lender-detail__doc-list--bordered">
                <li
                  v-for="doc in record.collateral.documents"
                  :key="doc.id"
                  class="lender-detail__doc-row"
                >
                  <img
                    :src="doc.type === 'e-Faktur' ? '/icons/custom/e-faktur.svg' : '/icons/custom/invoice.svg'"
                    alt=""
                    class="lender-detail__doc-custom-icon"
                  />
                  <div class="lender-detail__doc-copy">
                    <span class="lender-detail__doc-label">{{ doc.type }} ({{ doc.format }})</span>
                    <span class="lender-detail__doc-meta">{{ doc.fileName }}</span>
                  </div>
                  <div class="lender-detail__doc-actions">
                    <button
                      type="button"
                      class="lender-detail__icon-btn"
                      :aria-label="`Preview ${doc.fileName}`"
                      @click="handleDocumentAction('view', doc.type, doc.fileName)"
                    >
                      <span class="lender-detail__action-icon lender-detail__action-icon--view" aria-hidden="true"></span>
                    </button>
                    <button
                      type="button"
                      class="lender-detail__icon-btn"
                      :aria-label="`Download ${doc.fileName}`"
                      @click="handleDocumentAction('download', doc.type, doc.fileName)"
                    >
                      <span class="lender-detail__action-icon lender-detail__action-icon--download" aria-hidden="true"></span>
                    </button>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <!-- Tab 3: RiskPulse Phase 1 Placeholder -->
          <div
            v-show="activeTab === 'risk-pulse'"
            id="lender-detail-panel-risk-pulse"
            role="tabpanel"
            aria-labelledby="lender-detail-tab-risk-pulse"
            class="lender-detail__panel"
          >
            <div class="lender-detail__riskpulse">
              <div class="lender-detail__riskpulse-head">
                <img src="/logo/logo-riskpulse.svg" alt="RiskPulse" class="lender-detail__riskpulse-logo" />
                <span class="lender-detail__badge lender-detail__badge--info">Phase 2 Preview</span>
              </div>

              <h3 class="lender-detail__riskpulse-title">RiskPulse Credit Intelligence</h3>
              <p class="lender-detail__riskpulse-copy">
                Detailed RiskPulse scoring, pillar breakdowns, tax compliance signals, and counterparty network intelligence will be integrated here in Phase 2.
              </p>

              <Alert
                v-if="isUnclaimed"
                status="neutral"
                title-text="Lead not yet claimed"
                description-text="Claim this lead first so borrower entity data is ready when Phase 2 RiskPulse enrichment runs."
                :has-action="false"
                :dismissible="false"
              />

              <div class="lender-detail__riskpulse-grid">
                <div class="lender-detail__riskpulse-item">
                  <span class="lender-detail__riskpulse-item-label">Credit Score Band</span>
                  <span class="lender-detail__riskpulse-item-val lender-detail__tabular">
                    {{ record.leadScore ? `${record.leadScore} / 100` : 'Pending Phase 2 sync' }}
                  </span>
                </div>
                <div class="lender-detail__riskpulse-item">
                  <span class="lender-detail__riskpulse-item-label">Tax &amp; e-Faktur Signals</span>
                  <span class="lender-detail__riskpulse-item-val">
                    {{ record.collateral.eFakturStatus }} collateral tax invoice
                  </span>
                </div>
                <div class="lender-detail__riskpulse-item">
                  <span class="lender-detail__riskpulse-item-label">Counterparty Network</span>
                  <span class="lender-detail__riskpulse-item-val">
                    {{ record.collateral.counterpartyName }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Right Offer & Lifecycle Sidebar -->
      <LenderOfferSidebar
        :lead="record"
        :source="props.source"
        @open-repayment="repaymentModalOpen = true"
        @open-contract="handleOpenContract"
      />
    </div>

    <LenderRepaymentModal
      v-if="record"
      v-model:open="repaymentModalOpen"
      :offer-terms="record.offerTerms"
      :start-date-iso="record.claimedAt ?? record.submittedAt"
      :company-name="displayCompanyName"
    />
  </div>
</template>

<style scoped>
.lender-detail {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-6);
  min-width: 0;
}

.lender-detail__empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-6);
  border: var(--primitives-border-width-default) solid var(--component-card-border);
  border-radius: var(--primitives-border-radius-lg);
  background: var(--component-card-background);
}

.lender-detail__empty-title {
  margin: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-lg);
  font-weight: 600;
}

.lender-detail__empty-copy {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
}

.lender-detail__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  align-items: start;
  gap: var(--primitives-padding-6);
  min-width: 0;
}

.lender-detail__main {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--primitives-padding-5);
}

.lender-detail__card {
  box-sizing: border-box;
  min-width: 0;
  border: var(--primitives-border-width-default) solid var(--component-card-border);
  border-radius: var(--primitives-border-radius-lg);
  background: var(--component-card-background);
}

.lender-detail__identity {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-4);
  padding: var(--primitives-padding-5);
}

.lender-detail__identity-top {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--primitives-padding-3);
}

.lender-detail__company-wrap {
  display: flex;
  min-width: 0;
  flex: 1 1 260px;
  flex-direction: column;
  gap: var(--primitives-padding-1);
}

.lender-detail__company-row {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: var(--primitives-padding-2);
}

.lender-detail__lock-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.lender-detail__company-name {
  margin: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-lg);
  font-weight: 700;
  line-height: var(--primitives-line-heights-lg);
  overflow-wrap: anywhere;
}

.lender-detail__app-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--primitives-padding-2);
}

.lender-detail__app-label {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
}

.lender-detail__app-number {
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.lender-detail__copy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
  border-radius: var(--primitives-border-radius-xs);
  background: var(--semantic-bg-ach-color-bg-surface);
  cursor: pointer;
}

.lender-detail__copy-btn:hover {
  background: var(--semantic-bg-ach-color-bg-surface-hover);
}

.lender-detail__copy-btn:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--component-input-border-focus);
  outline-offset: var(--primitives-border-width-2);
}

.lender-detail__copy-icon {
  display: block;
  width: 14px;
  height: 14px;
}

.lender-detail__badges {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--primitives-padding-2);
}

.lender-detail__badge {
  display: inline-flex;
  align-items: center;
  padding: 2px var(--primitives-padding-2);
  border: var(--primitives-border-width-default) solid transparent;
  border-radius: var(--primitives-border-radius-infinite);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
  line-height: var(--primitives-line-heights-2xs);
  white-space: nowrap;
}

.lender-detail__badge--brand {
  background: var(--component-badge-brand-background);
  color: var(--component-badge-brand-text);
}

.lender-detail__badge--info {
  border-color: var(--component-badge-info-border);
  background: var(--component-badge-info-background);
  color: var(--component-badge-info-text);
}

.lender-detail__badge--success {
  border-color: var(--component-badge-success-border);
  background: var(--component-badge-success-background);
  color: var(--component-badge-success-text);
}

.lender-detail__badge--warning {
  border-color: var(--component-badge-warning-border);
  background: var(--component-badge-warning-background);
  color: var(--component-badge-warning-text);
}

.lender-detail__badge--error {
  border-color: var(--component-badge-error-border);
  background: var(--component-badge-error-background);
  color: var(--component-badge-error-text);
}

.lender-detail__badge--neutral {
  border-color: var(--component-badge-neutral-border);
  background: var(--component-badge-neutral-background);
  color: var(--component-badge-neutral-text);
}

.lender-detail__identity-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--primitives-padding-3) var(--primitives-padding-4);
  margin: 0;
  padding-top: var(--primitives-padding-3);
  border-top: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
}

.lender-detail__meta-cell {
  min-width: 0;
}

.lender-detail__meta-cell dt {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}

.lender-detail__meta-cell dd {
  margin: var(--primitives-padding-1) 0 0;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-sm);
  overflow-wrap: anywhere;
}

.lender-detail__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--primitives-padding-5);
  padding: 0 var(--primitives-padding-5);
  border-bottom: var(--primitives-border-width-default) solid var(--component-tabs-line-border);
}

.lender-detail__tab {
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
  white-space: nowrap;
}

.lender-detail__tab:hover {
  color: var(--component-tabs-line-item-text-active);
}

.lender-detail__tab:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--component-input-border-focus);
  outline-offset: calc(-1 * var(--primitives-border-width-2));
}

.lender-detail__tab--active {
  border-bottom-color: var(--component-tabs-line-item-indicator);
  color: var(--component-tabs-line-item-text-active);
  font-weight: 600;
}

.lender-detail__panel {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-6);
  padding: var(--primitives-padding-5);
}

.lender-detail__section {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--primitives-padding-4);
}

.lender-detail__section-heading h3 {
  margin: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-md);
  font-weight: 600;
  line-height: var(--primitives-line-heights-md);
}

.lender-detail__section-heading p {
  margin: var(--primitives-padding-1) 0 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
}

.lender-detail__facts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--primitives-padding-4) var(--primitives-padding-5);
  margin: 0;
}

.lender-detail__fact {
  min-width: 0;
}

.lender-detail__fact dt {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}

.lender-detail__fact dd {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--primitives-padding-1);
  margin: var(--primitives-padding-1) 0 0;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-sm);
  overflow-wrap: anywhere;
}

.lender-detail__masked-value {
  display: inline-flex;
  align-items: center;
  gap: var(--primitives-padding-1);
  color: var(--semantic-text-ach-color-text-secondary);
  font-weight: 400;
}

.lender-detail__inline-lock {
  display: block;
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.lender-detail__inline-badge {
  display: inline-flex;
  align-items: center;
  padding: 1px var(--primitives-padding-2);
  border-radius: var(--primitives-border-radius-infinite);
  font-size: var(--primitives-font-sizes-2xs);
  font-weight: 600;
  line-height: var(--primitives-line-heights-3xs);
  white-space: nowrap;
}

.lender-detail__inline-badge--success {
  background: var(--component-badge-success-background);
  color: var(--component-badge-success-text);
}

.lender-detail__inline-badge--warning {
  background: var(--component-badge-warning-background);
  color: var(--component-badge-warning-text);
}

.lender-detail__docs-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--primitives-padding-3);
}

.lender-detail__btn-icon {
  display: block;
  width: 14px;
  height: 14px;
}

.lender-detail__accordion {
  border: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
  border-radius: var(--primitives-border-radius-md);
  padding: 0 var(--primitives-padding-4);
}

.lender-detail__acc-trigger {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-2);
  padding-right: var(--primitives-padding-2);
}

.lender-detail__acc-count {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 400;
  font-variant-numeric: tabular-nums;
}

.lender-detail__locked-cat {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-2);
  padding: var(--primitives-padding-3);
  border-radius: var(--primitives-border-radius-sm);
  background: var(--semantic-bg-ach-color-bg-canvas);
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
}

.lender-detail__doc-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.lender-detail__doc-list--bordered {
  border: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
  border-radius: var(--primitives-border-radius-md);
  padding: 0 var(--primitives-padding-4);
}

.lender-detail__doc-row {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-3) 0;
}

.lender-detail__doc-row + .lender-detail__doc-row {
  border-top: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
}

.lender-detail__doc-icon {
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
  background: var(--semantic-icon-ach-color-icon-default);
  mask: url('/icons/text-formatting/description.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/text-formatting/description.svg') center / contain no-repeat;
}

.lender-detail__doc-custom-icon {
  display: block;
  width: 22px;
  height: 22px;
  flex: 0 0 22px;
  object-fit: contain;
}

.lender-detail__doc-copy {
  display: flex;
  min-width: 0;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 2px;
}

.lender-detail__doc-label {
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-sm);
}

.lender-detail__doc-meta {
  overflow: hidden;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
  text-overflow: ellipsis;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.lender-detail__doc-actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: var(--primitives-padding-2);
}

.lender-detail__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-default);
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--semantic-bg-ach-color-bg-surface);
  cursor: pointer;
}

.lender-detail__icon-btn:hover {
  background: var(--semantic-bg-ach-color-bg-surface-hover);
}

.lender-detail__icon-btn:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--component-input-border-focus);
  outline-offset: var(--primitives-border-width-2);
}

.lender-detail__action-icon {
  width: 16px;
  height: 16px;
  background: var(--semantic-icon-ach-color-icon-default);
}

.lender-detail__action-icon--view {
  mask: url('/icons/common-actions/visibility.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/common-actions/visibility.svg') center / contain no-repeat;
}

.lender-detail__action-icon--download {
  mask: url('/icons/ui-actions/download.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/download.svg') center / contain no-repeat;
}

.lender-detail__locked-banner {
  display: flex;
  align-items: flex-start;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-4);
  border: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-default);
  border-radius: var(--primitives-border-radius-md);
  background: var(--semantic-bg-ach-color-bg-canvas);
}

.lender-detail__locked-banner-icon {
  display: block;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.lender-detail__locked-banner-title {
  margin: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 600;
}

.lender-detail__locked-banner-sub {
  margin: var(--primitives-padding-1) 0 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
}

.lender-detail__riskpulse {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-4);
  padding: var(--primitives-padding-5);
  border: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
  border-radius: var(--primitives-border-radius-md);
  background: var(--semantic-bg-ach-color-bg-canvas);
}

.lender-detail__riskpulse-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-3);
}

.lender-detail__riskpulse-logo {
  display: block;
  height: 24px;
  width: auto;
  object-fit: contain;
}

.lender-detail__riskpulse-title {
  margin: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-md);
  font-weight: 600;
}

.lender-detail__riskpulse-copy {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.lender-detail__riskpulse-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--primitives-padding-3);
}

.lender-detail__riskpulse-item {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--primitives-padding-1);
  padding: var(--primitives-padding-3);
  border: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
  border-radius: var(--primitives-border-radius-sm);
  background: var(--semantic-bg-ach-color-bg-surface);
}

.lender-detail__riskpulse-item-label {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
}

.lender-detail__riskpulse-item-val {
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  overflow-wrap: anywhere;
}

.lender-detail__tabular {
  font-variant-numeric: tabular-nums;
}

@media (max-width: 1023px) {
  .lender-detail__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@container app-workspace (max-width: 899px) {
  .lender-detail__facts,
  .lender-detail__identity-meta,
  .lender-detail__riskpulse-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 899px) {
  .lender-detail__facts,
  .lender-detail__identity-meta,
  .lender-detail__riskpulse-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 540px) {
  .lender-detail__facts,
  .lender-detail__identity-meta,
  .lender-detail__riskpulse-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
