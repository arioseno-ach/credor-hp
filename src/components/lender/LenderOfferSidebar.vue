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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useSnackbar } from '@/composables/useSnackbar'
import {
  formatLenderDate,
  formatLenderDateTime,
  formatRupiah,
} from '@/lib/lender/lender-data'
import {
  computeDisbursementAmount,
  computeRevenueShare,
  useLenderPortal,
} from '@/lib/lender/useLenderPortal'
import type { LenderFeeMode, LenderLead, PaymentMethod } from '@/lib/lender/types'

const props = defineProps<{
  lead: LenderLead
  source: 'leads' | 'loans'
}>()

const emit = defineEmits<{
  openRepayment: []
  openContract: [contractId: string]
}>()

const { show: showSnackbar } = useSnackbar()
const {
  claimLead,
  rejectLead,
  togglePefindo,
  updateOfferTerms,
  uploadContract,
  requestData,
} = useLenderPortal()

const uploadDialogOpen = ref(false)
const contractFileName = ref('')

const requestDataDialogOpen = ref(false)
const requestedChecklist = ref<string[]>([])
const requestDataNote = ref('')

const rejectDialogOpen = ref(false)
const rejectPreset = ref('Debt service coverage below minimum threshold.')
const rejectCustomNote = ref('')

const DATA_REQUEST_OPTIONS = [
  'Latest 3-month bank statements',
  'Updated audited financial report',
  'Tax return (SPT Tahunan)',
  'Verified counterparty purchase order',
]

const REJECT_PRESET_REASONS = [
  'Debt service coverage below minimum threshold.',
  'Incomplete or unverifiable financial documents.',
  'Counterparty concentration or credit risk.',
  'Collateral invoice mismatch with tax filing.',
  'Other reason',
]

watch(
  () => props.lead.id,
  () => {
    contractFileName.value = `Loan_Contract_${props.lead.id}.pdf`
    requestedChecklist.value = []
    requestDataNote.value = ''
    rejectPreset.value = REJECT_PRESET_REASONS[0]
    rejectCustomNote.value = ''
  },
  { immediate: true },
)

const disbursementAmount = computed(() =>
  computeDisbursementAmount(
    props.lead.offerTerms.approvedAmount,
    props.lead.offerTerms.adminFeeAmount,
  ),
)

const revenueShare = computed(() =>
  computeRevenueShare(props.lead.offerTerms.interestAmount),
)

const claimStatusMeta = computed(() => {
  if (props.lead.claimSubStatus === 'contract-uploaded') {
    return { label: 'Contract Uploaded', tone: 'success' as const }
  }
  if (props.lead.claimSubStatus === 'data-requested') {
    return { label: 'Data Requested', tone: 'warning' as const }
  }
  return { label: 'Contract Selection', tone: 'info' as const }
})

const loanStatusMeta = computed(() => {
  const status = props.lead.loanStatus ?? 'active'
  if (status === 'overdue') return { label: 'Overdue', tone: 'error' as const }
  if (status === 'paid') return { label: 'Paid', tone: 'success' as const }
  return { label: 'Active', tone: 'success' as const }
})

const dataRequestedDescription = computed(() => {
  const note = props.lead.requestedDataNote || 'Additional underwriting documents requested.'
  const timestamp = props.lead.requestedDataAt
    ? `Sent on ${formatLenderDateTime(props.lead.requestedDataAt)}`
    : ''
  return timestamp ? `${note} (${timestamp})` : note
})

function handleClaimLead() {
  const updated = claimLead(props.lead.id)
  if (!updated) return
  showSnackbar({
    variant: 'success',
    title: 'Lead claimed',
    description: `${updated.companyName} profile and supporting documents are now unlocked.`,
  })
}

function handleTogglePefindo(checked: boolean) {
  togglePefindo(props.lead.id, checked)
}

function parseNumericInput(event: Event): number | null {
  const raw = (event.target as HTMLInputElement).value
  if (raw.trim() === '') return 0
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
}

function onApprovedAmountInput(event: Event) {
  const val = parseNumericInput(event)
  if (val === null) return
  updateOfferTerms(props.lead.id, { approvedAmount: Math.max(0, Math.round(val)) })
}

function onPaymentMethodChange(event: Event) {
  const val = (event.target as HTMLSelectElement).value as PaymentMethod
  updateOfferTerms(props.lead.id, { paymentMethod: val })
}

function onTenorInput(event: Event) {
  const val = parseNumericInput(event)
  if (val === null) return
  updateOfferTerms(props.lead.id, { tenorDays: Math.max(1, Math.round(val)) })
}

function onInterestModeChange(mode: LenderFeeMode) {
  updateOfferTerms(props.lead.id, { interestMode: mode })
}

function onInterestValueInput(event: Event) {
  const val = parseNumericInput(event)
  if (val === null) return
  if (props.lead.offerTerms.interestMode === 'percent') {
    updateOfferTerms(props.lead.id, { interestRatePa: Math.max(0, val) })
  } else {
    updateOfferTerms(props.lead.id, { interestAmount: Math.max(0, Math.round(val)) })
  }
}

function onAdminFeeModeChange(mode: LenderFeeMode) {
  updateOfferTerms(props.lead.id, { adminFeeMode: mode })
}

function onAdminFeeValueInput(event: Event) {
  const val = parseNumericInput(event)
  if (val === null) return
  if (props.lead.offerTerms.adminFeeMode === 'percent') {
    updateOfferTerms(props.lead.id, { adminFeeRate: Math.max(0, val) })
  } else {
    updateOfferTerms(props.lead.id, { adminFeeAmount: Math.max(0, Math.round(val)) })
  }
}

function onLateFeeInput(event: Event) {
  const val = parseNumericInput(event)
  if (val === null) return
  updateOfferTerms(props.lead.id, { lateFeeRatePerDay: Math.max(0, val) })
}

function openUploadDialog() {
  contractFileName.value =
    props.lead.contracts[0]?.fileName || `Loan_Contract_${props.lead.id}.pdf`
  uploadDialogOpen.value = true
}

function onFileSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file?.name) {
    contractFileName.value = file.name
  }
}

function confirmUploadContract() {
  const cleanName = contractFileName.value.trim() || `Loan_Contract_${props.lead.id}.pdf`
  const updated = uploadContract(props.lead.id, cleanName)
  if (!updated) return
  uploadDialogOpen.value = false
  showSnackbar({
    variant: 'success',
    title: 'Contract uploaded',
    description: `${cleanName} is ready for contract preview and digital signature.`,
  })
}

function openRequestDataDialog() {
  requestedChecklist.value = []
  requestDataNote.value = ''
  requestDataDialogOpen.value = true
}

function toggleChecklistItem(item: string, checked: boolean) {
  if (checked) {
    if (!requestedChecklist.value.includes(item)) {
      requestedChecklist.value = [...requestedChecklist.value, item]
    }
  } else {
    requestedChecklist.value = requestedChecklist.value.filter((entry) => entry !== item)
  }
}

function confirmRequestData() {
  const itemsText = requestedChecklist.value.length > 0 ? requestedChecklist.value.join(', ') : ''
  const customText = requestDataNote.value.trim()
  const combinedNote = [itemsText, customText].filter(Boolean).join(': ') ||
    'Please provide updated financial verification documents.'

  const updated = requestData(props.lead.id, combinedNote)
  if (!updated) return
  requestDataDialogOpen.value = false
  showSnackbar({
    variant: 'success',
    title: 'Data request sent',
    description: 'The borrower has been notified to upload the requested documents.',
  })
}

function openRejectDialog() {
  rejectPreset.value = REJECT_PRESET_REASONS[0]
  rejectCustomNote.value = ''
  rejectDialogOpen.value = true
}

function confirmRejectLead() {
  const baseReason = rejectPreset.value === 'Other reason' ? '' : rejectPreset.value
  const extra = rejectCustomNote.value.trim()
  const finalReason = [baseReason, extra].filter(Boolean).join(' ') ||
    'Declined after underwriting review.'

  const updated = rejectLead(props.lead.id, finalReason)
  if (!updated) return
  rejectDialogOpen.value = false
  showSnackbar({
    variant: 'neutral',
    title: 'Lead rejected',
    description: 'This application has been moved to Rejected Leads.',
  })
}
</script>

<template>
  <aside class="offer-sidebar" aria-label="Deal actions and offer terms">
    <!-- State 1: Unclaimed Lead -->
    <section v-if="lead.state === 'unclaimed'" class="offer-card">
      <div class="offer-card__header">
        <h2 class="offer-card__title">Underwriting Action</h2>
        <span class="offer-badge offer-badge--neutral">Unclaimed</span>
      </div>

      <div class="offer-card__body">
        <p class="offer-card__lead-copy">Ready to underwrite this borrower?</p>
        <p class="offer-card__helper">
          Claiming this lead unlocks full company identity, contact details, financial metrics, and supporting verification documents.
        </p>

        <dl class="offer-summary-list">
          <div class="offer-summary-list__row">
            <dt>Estimated Loan</dt>
            <dd class="offer-tabular">{{ formatRupiah(lead.estimatedLoanAmount) }}</dd>
          </div>
          <div class="offer-summary-list__row">
            <dt>Loan Type</dt>
            <dd>{{ lead.loanType }}</dd>
          </div>
          <div class="offer-summary-list__row">
            <dt>Business Scale</dt>
            <dd>{{ lead.businessScale }}</dd>
          </div>
        </dl>

        <div class="offer-card__actions">
          <Button type="button" color="brand" class="offer-btn-full" @click="handleClaimLead">
            Claim lead
          </Button>
          <Button
            type="button"
            variant="outline"
            color="error"
            class="offer-btn-full"
            @click="openRejectDialog"
          >
            Reject
          </Button>
        </div>
      </div>
    </section>

    <!-- State 2: Claimed Lead (Pending Offer / Data Requested / Contract Uploaded) -->
    <section v-else-if="lead.state === 'claimed'" class="offer-card">
      <div class="offer-card__header">
        <h2 class="offer-card__title">Offer Terms</h2>
        <span class="offer-badge" :class="`offer-badge--${claimStatusMeta.tone}`">
          {{ claimStatusMeta.label }}
        </span>
      </div>

      <div class="offer-card__body">
        <Alert
          v-if="lead.claimSubStatus === 'data-requested'"
          status="warning"
          title-text="Additional Data Requested"
          :description-text="dataRequestedDescription"
          :has-action="false"
          :dismissible="false"
        />

        <!-- Pefindo Check -->
        <div class="offer-pefindo">
          <div class="offer-pefindo__top">
            <Checkbox
              :model-value="lead.pefindoChecked"
              @update:model-value="handleTogglePefindo"
            >
              <span class="offer-pefindo__label">Pefindo checking</span>
            </Checkbox>
            <span class="offer-badge offer-badge--warning">Required</span>
          </div>
          <p v-if="lead.pefindoChecked && lead.pefindoCheckedAt" class="offer-pefindo__stamp">
            <span class="offer-pefindo__icon" aria-hidden="true"></span>
            <span>Checked on {{ formatLenderDateTime(lead.pefindoCheckedAt) }}</span>
          </p>
          <p v-else class="offer-pefindo__hint">
            Confirm credit bureau verification before finalizing contract upload.
          </p>
        </div>

        <!-- Offer Form -->
        <form class="offer-form" @submit.prevent>
          <div class="offer-field">
            <label class="offer-field__label" for="offer-approved-amount">Approved Amount</label>
            <div class="offer-input-group">
              <span class="offer-input-group__addon">Rp</span>
              <input
                id="offer-approved-amount"
                type="number"
                min="0"
                step="1000000"
                class="offer-input-group__control offer-tabular"
                :value="lead.offerTerms.approvedAmount"
                @input="onApprovedAmountInput"
              />
            </div>
            <span class="offer-field__hint offer-tabular">
              {{ formatRupiah(lead.offerTerms.approvedAmount) }}
            </span>
          </div>

          <div class="offer-field-row">
            <div class="offer-field">
              <label class="offer-field__label" for="offer-payment-method">Payment Method</label>
              <select
                id="offer-payment-method"
                class="offer-select"
                :value="lead.offerTerms.paymentMethod"
                @change="onPaymentMethodChange"
              >
                <option value="Lump sum">Lump sum</option>
                <option value="Installment">Installment</option>
              </select>
            </div>

            <div class="offer-field">
              <label class="offer-field__label" for="offer-tenor-days">Tenor (Days)</label>
              <input
                id="offer-tenor-days"
                type="number"
                min="1"
                max="365"
                step="1"
                class="offer-input offer-tabular"
                :value="lead.offerTerms.tenorDays"
                @input="onTenorInput"
              />
            </div>
          </div>

          <!-- Interest Rate (p.a.) with % / Rp switch -->
          <div class="offer-field">
            <div class="offer-field__head">
              <label class="offer-field__label" for="offer-interest-input">
                Interest Rate (p.a.)
              </label>
              <div class="offer-unit-switch" role="group" aria-label="Interest input unit">
                <button
                  type="button"
                  class="offer-unit-switch__btn"
                  :class="{ 'offer-unit-switch__btn--active': lead.offerTerms.interestMode === 'percent' }"
                  :aria-pressed="lead.offerTerms.interestMode === 'percent'"
                  @click="onInterestModeChange('percent')"
                >
                  %
                </button>
                <button
                  type="button"
                  class="offer-unit-switch__btn"
                  :class="{ 'offer-unit-switch__btn--active': lead.offerTerms.interestMode === 'amount' }"
                  :aria-pressed="lead.offerTerms.interestMode === 'amount'"
                  @click="onInterestModeChange('amount')"
                >
                  Rp
                </button>
              </div>
            </div>

            <div class="offer-input-group">
              <span
                v-if="lead.offerTerms.interestMode === 'amount'"
                class="offer-input-group__addon"
              >
                Rp
              </span>
              <input
                id="offer-interest-input"
                type="number"
                min="0"
                :step="lead.offerTerms.interestMode === 'percent' ? '0.1' : '100000'"
                class="offer-input-group__control offer-tabular"
                :value="
                  lead.offerTerms.interestMode === 'percent'
                    ? lead.offerTerms.interestRatePa
                    : lead.offerTerms.interestAmount
                "
                @input="onInterestValueInput"
              />
              <span
                v-if="lead.offerTerms.interestMode === 'percent'"
                class="offer-input-group__addon offer-input-group__addon--end"
              >
                % p.a.
              </span>
            </div>
            <span class="offer-field__hint offer-tabular">
              <template v-if="lead.offerTerms.interestMode === 'percent'">
                Calculated interest: {{ formatRupiah(lead.offerTerms.interestAmount) }}
              </template>
              <template v-else>
                Equivalent rate: {{ lead.offerTerms.interestRatePa }}% p.a.
              </template>
            </span>
          </div>

          <!-- Admin Fee with % / Rp switch -->
          <div class="offer-field">
            <div class="offer-field__head">
              <label class="offer-field__label" for="offer-admin-fee-input">Admin Fee</label>
              <div class="offer-unit-switch" role="group" aria-label="Admin fee input unit">
                <button
                  type="button"
                  class="offer-unit-switch__btn"
                  :class="{ 'offer-unit-switch__btn--active': lead.offerTerms.adminFeeMode === 'percent' }"
                  :aria-pressed="lead.offerTerms.adminFeeMode === 'percent'"
                  @click="onAdminFeeModeChange('percent')"
                >
                  %
                </button>
                <button
                  type="button"
                  class="offer-unit-switch__btn"
                  :class="{ 'offer-unit-switch__btn--active': lead.offerTerms.adminFeeMode === 'amount' }"
                  :aria-pressed="lead.offerTerms.adminFeeMode === 'amount'"
                  @click="onAdminFeeModeChange('amount')"
                >
                  Rp
                </button>
              </div>
            </div>

            <div class="offer-input-group">
              <span
                v-if="lead.offerTerms.adminFeeMode === 'amount'"
                class="offer-input-group__addon"
              >
                Rp
              </span>
              <input
                id="offer-admin-fee-input"
                type="number"
                min="0"
                :step="lead.offerTerms.adminFeeMode === 'percent' ? '0.1' : '100000'"
                class="offer-input-group__control offer-tabular"
                :value="
                  lead.offerTerms.adminFeeMode === 'percent'
                    ? lead.offerTerms.adminFeeRate
                    : lead.offerTerms.adminFeeAmount
                "
                @input="onAdminFeeValueInput"
              />
              <span
                v-if="lead.offerTerms.adminFeeMode === 'percent'"
                class="offer-input-group__addon offer-input-group__addon--end"
              >
                %
              </span>
            </div>
            <span class="offer-field__hint offer-tabular">
              <template v-if="lead.offerTerms.adminFeeMode === 'percent'">
                Calculated fee: {{ formatRupiah(lead.offerTerms.adminFeeAmount) }}
              </template>
              <template v-else>
                Equivalent rate: {{ lead.offerTerms.adminFeeRate }}%
              </template>
            </span>
          </div>

          <div class="offer-field">
            <label class="offer-field__label" for="offer-late-fee">Late Fee (per day)</label>
            <div class="offer-input-group">
              <input
                id="offer-late-fee"
                type="number"
                min="0"
                step="0.01"
                class="offer-input-group__control offer-tabular"
                :value="lead.offerTerms.lateFeeRatePerDay"
                @input="onLateFeeInput"
              />
              <span class="offer-input-group__addon offer-input-group__addon--end">% / day</span>
            </div>
          </div>
        </form>

        <!-- Terms Summary -->
        <div class="offer-summary-box">
          <h3 class="offer-summary-box__heading">Terms Summary</h3>
          <dl class="offer-summary-list">
            <div class="offer-summary-list__row offer-summary-list__row--highlight">
              <dt>Disbursement Amount</dt>
              <dd class="offer-tabular">{{ formatRupiah(disbursementAmount) }}</dd>
            </div>
            <div class="offer-summary-list__row">
              <dt>Total Interest</dt>
              <dd class="offer-tabular">{{ formatRupiah(lead.offerTerms.interestAmount) }}</dd>
            </div>
            <div class="offer-summary-list__row">
              <dt>Admin Fee</dt>
              <dd class="offer-tabular">{{ formatRupiah(lead.offerTerms.adminFeeAmount) }}</dd>
            </div>
          </dl>

          <Accordion type="single" collapsible class="offer-revshare">
            <AccordionItem value="revshare">
              <AccordionTrigger class="offer-revshare__trigger">
                <span>Revenue Share (incl. tax)</span>
                <span class="offer-tabular offer-revshare__trigger-val">
                  {{ formatRupiah(revenueShare.totalPlatformFeeInclTax) }}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <dl class="offer-summary-list offer-summary-list--compact">
                  <div class="offer-summary-list__row">
                    <dt>Platform Share (20%)</dt>
                    <dd class="offer-tabular">{{ formatRupiah(revenueShare.platformFeeBase) }}</dd>
                  </div>
                  <div class="offer-summary-list__row">
                    <dt>VAT / PPN (11%)</dt>
                    <dd class="offer-tabular">{{ formatRupiah(revenueShare.ppnAmount) }}</dd>
                  </div>
                  <div class="offer-summary-list__row">
                    <dt>PPh 23 (-2%)</dt>
                    <dd class="offer-tabular">-{{ formatRupiah(revenueShare.pph23Amount) }}</dd>
                  </div>
                  <div class="offer-summary-list__row offer-summary-list__row--divider">
                    <dt>Total Platform Fee (incl. tax)</dt>
                    <dd class="offer-tabular">{{ formatRupiah(revenueShare.totalPlatformFeeInclTax) }}</dd>
                  </div>
                  <div class="offer-summary-list__row offer-summary-list__row--highlight">
                    <dt>Net Lender Interest</dt>
                    <dd class="offer-tabular">{{ formatRupiah(revenueShare.netLenderInterest) }}</dd>
                  </div>
                </dl>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <!-- Claimed Actions -->
        <div class="offer-card__actions">
          <Button
            type="button"
            variant="outline"
            color="neutral"
            class="offer-btn-full"
            @click="emit('openRepayment')"
          >
            <template #leadingIcon>
              <img src="/icons/business-payments/calculate.svg" alt="" class="offer-btn-icon" />
            </template>
            Repayment Simulation
          </Button>

          <Button
            type="button"
            color="brand"
            class="offer-btn-full"
            @click="openUploadDialog"
          >
            <template #leadingIcon>
              <span class="offer-btn-mask offer-btn-mask--upload" aria-hidden="true"></span>
            </template>
            Upload Contract
          </Button>

          <Button
            v-if="lead.contracts.length > 0"
            type="button"
            variant="outline"
            color="primary"
            class="offer-btn-full"
            @click="emit('openContract', lead.contracts[0].id)"
          >
            <template #leadingIcon>
              <img src="/icons/text-formatting/article.svg" alt="" class="offer-btn-icon" />
            </template>
            View Contract
          </Button>

          <div class="offer-card__actions-split">
            <Button
              type="button"
              variant="outline"
              color="neutral"
              class="offer-btn-full"
              @click="openRequestDataDialog"
            >
              Request Data
            </Button>
            <Button
              type="button"
              variant="outline"
              color="error"
              class="offer-btn-full"
              @click="openRejectDialog"
            >
              Reject
            </Button>
          </div>
        </div>
      </div>
    </section>

    <!-- State 3: Active / Overdue / Paid Loan -->
    <section v-else-if="lead.state === 'active'" class="offer-card">
      <div class="offer-card__header">
        <h2 class="offer-card__title">Active Loan Summary</h2>
        <span class="offer-badge" :class="`offer-badge--${loanStatusMeta.tone}`">
          {{ loanStatusMeta.label }}
        </span>
      </div>

      <div class="offer-card__body">
        <p class="offer-synced">
          <img src="/icons/common-actions/schedule.svg" alt="" class="offer-synced__icon" />
          <span>Last synced: {{ formatLenderDateTime(lead.lastSyncedAt ?? lead.submittedAt) }}</span>
        </p>

        <dl class="offer-summary-list">
          <div class="offer-summary-list__row">
            <dt>Approved Amount</dt>
            <dd class="offer-tabular">{{ formatRupiah(lead.offerTerms.approvedAmount) }}</dd>
          </div>
          <div class="offer-summary-list__row">
            <dt>Disbursement Amount</dt>
            <dd class="offer-tabular">{{ formatRupiah(disbursementAmount) }}</dd>
          </div>
          <div class="offer-summary-list__row">
            <dt>Due Date</dt>
            <dd class="offer-tabular">{{ formatLenderDate(lead.collateral.dueDate) }}</dd>
          </div>
          <div class="offer-summary-list__row">
            <dt>Interest Rate (p.a.)</dt>
            <dd class="offer-tabular">{{ lead.offerTerms.interestRatePa }}%</dd>
          </div>
        </dl>

        <div v-if="lead.overdueSummary" class="offer-overdue-box">
          <h3 class="offer-overdue-box__title">Overdue Summary</h3>
          <dl class="offer-summary-list offer-summary-list--compact">
            <div class="offer-summary-list__row">
              <dt>Total interest</dt>
              <dd class="offer-tabular">{{ formatRupiah(lead.overdueSummary.totalInterest) }}</dd>
            </div>
            <div class="offer-summary-list__row">
              <dt>Late penalty</dt>
              <dd class="offer-tabular offer-text-error">{{ formatRupiah(lead.overdueSummary.latePenalty) }}</dd>
            </div>
            <div class="offer-summary-list__row offer-summary-list__row--divider">
              <dt>Current amount due</dt>
              <dd class="offer-tabular offer-text-error">{{ formatRupiah(lead.overdueSummary.currentAmountDue) }}</dd>
            </div>
            <div class="offer-summary-list__row">
              <dt>Amount due at maturity</dt>
              <dd class="offer-tabular">{{ formatRupiah(lead.overdueSummary.amountDueAtMaturity) }}</dd>
            </div>
          </dl>
        </div>

        <div class="offer-card__actions">
          <Button
            type="button"
            variant="outline"
            color="neutral"
            class="offer-btn-full"
            @click="emit('openRepayment')"
          >
            <template #leadingIcon>
              <img src="/icons/business-payments/calculate.svg" alt="" class="offer-btn-icon" />
            </template>
            Repayment Simulation
          </Button>

          <Button
            v-if="lead.contracts.length > 0"
            type="button"
            color="primary"
            class="offer-btn-full"
            @click="emit('openContract', lead.contracts[0].id)"
          >
            <template #leadingIcon>
              <span class="offer-btn-mask offer-btn-mask--article" aria-hidden="true"></span>
            </template>
            View Contract
          </Button>
        </div>
      </div>
    </section>

    <!-- State 4: Rejected Lead -->
    <section v-else class="offer-card">
      <div class="offer-card__header">
        <h2 class="offer-card__title">Application Status</h2>
        <span class="offer-badge offer-badge--error">Rejected</span>
      </div>

      <div class="offer-card__body">
        <div class="offer-rejected-banner">
          <span class="offer-rejected-banner__icon" aria-hidden="true"></span>
          <div>
            <p class="offer-rejected-banner__title">You rejected this lead</p>
            <p class="offer-rejected-banner__sub">
              This application is closed and no longer eligible for an offer.
            </p>
          </div>
        </div>

        <dl class="offer-summary-list">
          <div class="offer-summary-list__row">
            <dt>Lead score</dt>
            <dd class="offer-tabular">{{ lead.leadScore ?? 68 }}</dd>
          </div>
          <div class="offer-summary-list__row">
            <dt>Rejected on</dt>
            <dd class="offer-tabular">{{ formatLenderDateTime(lead.rejectedAt ?? lead.submittedAt) }}</dd>
          </div>
          <div class="offer-summary-list__stack">
            <dt>Rejection reason</dt>
            <dd>{{ lead.rejectionReason || 'Declined after underwriting review.' }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <!-- Upload Contract Dialog -->
    <Dialog v-model:open="uploadDialogOpen">
      <DialogContent>
        <DialogHeader class="offer-dialog-header">
          <div>
            <DialogTitle>Upload Loan Contract</DialogTitle>
            <DialogDescription>
              Attach the proposed financing agreement PDF for {{ lead.companyName }}.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div class="offer-dialog-body">
          <Alert
            v-if="!lead.pefindoChecked"
            status="warning"
            title-text="Pefindo check recommended"
            description-text="Pefindo checking is marked Required. You can still simulate uploading a contract for review."
            :has-action="false"
            :dismissible="false"
          />

          <div class="offer-field">
            <label class="offer-field__label" for="contract-file-name">Contract PDF File Name</label>
            <input
              id="contract-file-name"
              v-model="contractFileName"
              type="text"
              class="offer-input"
              placeholder="Loan_Contract.pdf"
            />
          </div>

          <div class="offer-field">
            <label class="offer-field__label" for="contract-file-picker">Select File (optional)</label>
            <input
              id="contract-file-picker"
              type="file"
              accept=".pdf,application/pdf"
              class="offer-file-input"
              @change="onFileSelected"
            />
          </div>
        </div>

        <DialogFooter class="offer-dialog-footer">
          <Button type="button" variant="outline" color="neutral" @click="uploadDialogOpen = false">
            Cancel
          </Button>
          <Button type="button" color="brand" @click="confirmUploadContract">
            Confirm Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Request Data Dialog -->
    <Dialog v-model:open="requestDataDialogOpen">
      <DialogContent>
        <DialogHeader class="offer-dialog-header">
          <div>
            <DialogTitle>Request Additional Data</DialogTitle>
            <DialogDescription>
              Select documents or specify clarifications needed from {{ lead.companyName }}.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div class="offer-dialog-body">
          <div class="offer-checklist">
            <Checkbox
              v-for="item in DATA_REQUEST_OPTIONS"
              :key="item"
              :model-value="requestedChecklist.includes(item)"
              @update:model-value="(checked) => toggleChecklistItem(item, checked)"
            >
              {{ item }}
            </Checkbox>
          </div>

          <div class="offer-field">
            <label class="offer-field__label" for="request-data-note">Note to Borrower</label>
            <textarea
              id="request-data-note"
              v-model="requestDataNote"
              rows="3"
              class="offer-textarea"
              placeholder="Add specific instructions or requested reporting period."
            ></textarea>
          </div>
        </div>

        <DialogFooter class="offer-dialog-footer">
          <Button type="button" variant="outline" color="neutral" @click="requestDataDialogOpen = false">
            Cancel
          </Button>
          <Button type="button" color="brand" @click="confirmRequestData">
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Reject Lead Dialog -->
    <Dialog v-model:open="rejectDialogOpen">
      <DialogContent>
        <DialogHeader class="offer-dialog-header">
          <div>
            <DialogTitle>Reject Lead</DialogTitle>
            <DialogDescription>
              Provide a reason for declining this financing application. Rejected leads move to Rejected Leads.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div class="offer-dialog-body">
          <div class="offer-field">
            <label class="offer-field__label" for="reject-reason-select">Rejection Reason</label>
            <select id="reject-reason-select" v-model="rejectPreset" class="offer-select">
              <option v-for="reason in REJECT_PRESET_REASONS" :key="reason" :value="reason">
                {{ reason }}
              </option>
            </select>
          </div>

          <div class="offer-field">
            <label class="offer-field__label" for="reject-custom-note">Additional Notes (optional)</label>
            <textarea
              id="reject-custom-note"
              v-model="rejectCustomNote"
              rows="3"
              class="offer-textarea"
              placeholder="Optional underwriting notes for internal audit."
            ></textarea>
          </div>
        </div>

        <DialogFooter class="offer-dialog-footer">
          <Button type="button" variant="outline" color="neutral" @click="rejectDialogOpen = false">
            Cancel
          </Button>
          <Button type="button" variant="destructive" @click="confirmRejectLead">
            Confirm Rejection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </aside>
</template>

<style scoped>
.offer-sidebar {
  min-width: 0;
}

.offer-card {
  box-sizing: border-box;
  border: var(--primitives-border-width-default) solid var(--component-card-border);
  border-radius: var(--primitives-border-radius-lg);
  background: var(--component-card-background);
}

.offer-card__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-2);
  padding: var(--primitives-padding-4);
  border-bottom: var(--primitives-border-width-default) solid var(--component-card-border);
}

.offer-card__title {
  margin: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-md);
  font-weight: 600;
  line-height: var(--primitives-line-heights-md);
}

.offer-card__body {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-4);
  padding: var(--primitives-padding-4);
}

.offer-card__lead-copy {
  margin: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 600;
  line-height: var(--primitives-line-heights-sm);
}

.offer-card__helper {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
}

.offer-badge {
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

.offer-badge--info {
  border-color: var(--component-badge-info-border);
  background: var(--component-badge-info-background);
  color: var(--component-badge-info-text);
}

.offer-badge--success {
  border-color: var(--component-badge-success-border);
  background: var(--component-badge-success-background);
  color: var(--component-badge-success-text);
}

.offer-badge--warning {
  border-color: var(--component-badge-warning-border);
  background: var(--component-badge-warning-background);
  color: var(--component-badge-warning-text);
}

.offer-badge--error {
  border-color: var(--component-badge-error-border);
  background: var(--component-badge-error-background);
  color: var(--component-badge-error-text);
}

.offer-badge--neutral {
  border-color: var(--component-badge-neutral-border);
  background: var(--component-badge-neutral-background);
  color: var(--component-badge-neutral-text);
}

.offer-pefindo {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-1);
  padding: var(--primitives-padding-3);
  border: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
  border-radius: var(--primitives-border-radius-md);
  background: var(--semantic-bg-ach-color-bg-canvas);
}

.offer-pefindo__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-2);
}

.offer-pefindo__label {
  font-weight: 500;
}

.offer-pefindo__stamp {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-1);
  margin: 0;
  color: var(--semantic-text-success-ach-color-text-success);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
  font-variant-numeric: tabular-nums;
}

.offer-pefindo__icon {
  display: block;
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  background: currentColor;
  mask: url('/icons/ui-actions/check-circle.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/check-circle.svg') center / contain no-repeat;
}

.offer-pefindo__hint {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}

.offer-form {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-3);
}

.offer-field-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--primitives-padding-3);
}

.offer-field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--primitives-padding-1);
}

.offer-field__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-2);
}

.offer-field__label {
  color: var(--component-input-label-text);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 500;
  line-height: var(--primitives-line-heights-2xs);
}

.offer-field__hint {
  color: var(--component-input-helper-text);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}

.offer-input,
.offer-select,
.offer-textarea {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  border: var(--primitives-border-width-default) solid var(--component-input-border);
  border-radius: var(--primitives-border-radius-sm);
  background: var(--component-input-background);
  color: var(--component-input-text);
  font-family: inherit;
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.offer-input,
.offer-select {
  height: var(--primitives-padding-9);
  padding: 0 var(--primitives-padding-3);
}

.offer-textarea {
  padding: var(--primitives-padding-2) var(--primitives-padding-3);
  resize: vertical;
}

.offer-input:focus-visible,
.offer-select:focus-visible,
.offer-textarea:focus-visible {
  border-color: var(--component-input-border-focus);
  outline: var(--primitives-border-width-2) solid var(--component-input-border-focus);
  outline-offset: var(--primitives-border-width-2);
}

.offer-input-group {
  display: flex;
  min-width: 0;
  align-items: stretch;
  overflow: hidden;
  border: var(--primitives-border-width-default) solid var(--component-input-group-default-border);
  border-radius: var(--primitives-border-radius-sm);
  background: var(--component-input-group-default-background);
}

.offer-input-group:focus-within {
  border-color: var(--component-input-group-focus-border);
  outline: var(--primitives-border-width-2) solid var(--component-input-group-focus-border);
  outline-offset: var(--primitives-border-width-2);
}

.offer-input-group__addon {
  display: inline-flex;
  align-items: center;
  padding: 0 var(--primitives-padding-2);
  border-right: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
  background: var(--semantic-bg-ach-color-bg-canvas);
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 500;
  white-space: nowrap;
}

.offer-input-group__addon--end {
  border-right: 0;
  border-left: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
}

.offer-input-group__control {
  width: 100%;
  min-width: 0;
  height: var(--primitives-padding-9);
  padding: 0 var(--primitives-padding-3);
  border: 0;
  background: transparent;
  color: var(--component-input-group-default-text);
  font-family: inherit;
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
  outline: none;
}

.offer-unit-switch {
  display: inline-flex;
  padding: 2px;
  border: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-default);
  border-radius: var(--primitives-border-radius-sm);
  background: var(--semantic-bg-ach-color-bg-canvas);
}

.offer-unit-switch__btn {
  padding: 2px var(--primitives-padding-2);
  border: 0;
  border-radius: var(--primitives-border-radius-xs);
  background: transparent;
  color: var(--component-tabs-segmented-item-text-inactive);
  cursor: pointer;
  font-family: inherit;
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
  line-height: var(--primitives-line-heights-2xs);
}

.offer-unit-switch__btn--active {
  background: var(--component-tabs-segmented-item-background-active);
  color: var(--component-tabs-segmented-item-text);
  box-shadow:
    calc(var(--primitives-shadows-xs-x) * 1px)
    calc(var(--primitives-shadows-xs-y) * 1px)
    calc(var(--primitives-shadows-xs-blur) * 1px)
    calc(var(--primitives-shadows-xs-spread) * 1px)
    var(--primitives-shadows-xs-color);
}

.offer-summary-box {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-2);
  padding: var(--primitives-padding-3);
  border: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
  border-radius: var(--primitives-border-radius-md);
  background: var(--semantic-bg-ach-color-bg-canvas);
}

.offer-summary-box__heading {
  margin: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
  line-height: var(--primitives-line-heights-xs);
  text-transform: uppercase;
  letter-spacing: var(--primitives-letter-spacing-wider);
}

.offer-summary-list {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-2);
  margin: 0;
}

.offer-summary-list--compact {
  gap: var(--primitives-padding-1);
}

.offer-summary-list__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--primitives-padding-3);
}

.offer-summary-list__row dt {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
}

.offer-summary-list__row dd {
  margin: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
  line-height: var(--primitives-line-heights-xs);
  text-align: right;
}

.offer-summary-list__row--highlight dt {
  color: var(--semantic-text-ach-color-text-default);
  font-weight: 600;
}

.offer-summary-list__row--highlight dd {
  color: var(--semantic-brand-ach-color-brand-default);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 700;
}

.offer-summary-list__row--divider {
  padding-top: var(--primitives-padding-2);
  border-top: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
}

.offer-summary-list__stack {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-1);
  padding-top: var(--primitives-padding-2);
  border-top: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
}

.offer-summary-list__stack dt {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
}

.offer-summary-list__stack dd {
  margin: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.offer-revshare {
  border-top: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
}

.offer-revshare__trigger {
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
}

.offer-revshare__trigger-val {
  margin-left: auto;
  color: var(--semantic-text-ach-color-text-default);
}

.offer-card__actions {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-2);
}

.offer-card__actions-split {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--primitives-padding-2);
}

.offer-btn-full {
  width: 100%;
  justify-content: center;
}

.offer-btn-icon {
  display: block;
  width: 16px;
  height: 16px;
}

.offer-btn-mask {
  display: block;
  width: 16px;
  height: 16px;
  background: currentColor;
}

.offer-btn-mask--upload {
  mask: url('/icons/ui-actions/file-upload.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/file-upload.svg') center / contain no-repeat;
}

.offer-btn-mask--article {
  mask: url('/icons/text-formatting/article.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/text-formatting/article.svg') center / contain no-repeat;
}

.offer-synced {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-2);
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  font-variant-numeric: tabular-nums;
}

.offer-synced__icon {
  display: block;
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.offer-overdue-box {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-2);
  padding: var(--primitives-padding-3);
  border: var(--primitives-border-width-default) solid var(--semantic-border-error-ach-color-border-error);
  border-radius: var(--primitives-border-radius-md);
  background: var(--semantic-bg-error-ach-color-bg-error-surface);
}

.offer-overdue-box__title {
  margin: 0;
  color: var(--semantic-text-error-ach-color-text-error);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 700;
  line-height: var(--primitives-line-heights-xs);
}

.offer-text-error {
  color: var(--semantic-text-error-ach-color-text-error);
}

.offer-rejected-banner {
  display: flex;
  align-items: flex-start;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-3);
  border: var(--primitives-border-width-default) solid var(--semantic-border-error-ach-color-border-error);
  border-radius: var(--primitives-border-radius-md);
  background: var(--semantic-bg-error-ach-color-bg-error-surface);
}

.offer-rejected-banner__icon {
  display: block;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  background: var(--semantic-icon-error-ach-color-icon-error);
  mask: url('/icons/ui-actions/cancel.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/cancel.svg') center / contain no-repeat;
}

.offer-rejected-banner__title {
  margin: 0;
  color: var(--semantic-text-error-ach-color-text-error);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 600;
}

.offer-rejected-banner__sub {
  margin: var(--primitives-padding-1) 0 0;
  color: var(--semantic-text-error-ach-color-text-error);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}

.offer-tabular {
  font-variant-numeric: tabular-nums;
}

.offer-dialog-header {
  border-bottom: var(--primitives-border-width-default) solid var(--component-card-border);
}

.offer-dialog-body {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-4);
  padding: var(--primitives-padding-5) var(--primitives-padding-6);
}

.offer-dialog-footer {
  border-top: var(--primitives-border-width-default) solid var(--component-card-border);
}

.offer-checklist {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-2);
}

.offer-file-input {
  font-size: var(--primitives-font-sizes-xs);
  color: var(--semantic-text-ach-color-text-secondary);
}
</style>
