<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { useAppView } from '@/composables/useAppView'
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
import LenderPageHeader from './LenderPageHeader.vue'

const props = defineProps<{
  id: string
  contractId: string
  from: 'leads' | 'loans'
}>()

const { openLenderLeadDetail, openLenderLoanDetail } = useAppView()
const { getDetailRecord, signContract } = useLenderPortal()
const { show: showSnackbar } = useSnackbar()

const record = computed(() => getDetailRecord(props.id))
const selectedContractId = ref(props.contractId)

watch(
  () => [props.id, props.contractId] as const,
  ([, nextContractId]) => {
    selectedContractId.value = nextContractId
  },
)

const activeContract = computed(() => {
  const list = record.value?.contracts ?? []
  return list.find((c) => c.id === selectedContractId.value) ?? list[0] ?? null
})

const disbursementAmount = computed(() => {
  if (!record.value) return 0
  return computeDisbursementAmount(
    record.value.offerTerms.approvedAmount,
    record.value.offerTerms.adminFeeAmount,
  )
})

const revenueShare = computed(() => {
  if (!record.value) return null
  return computeRevenueShare(record.value.offerTerms.interestAmount)
})

function handleBack() {
  if (props.from === 'loans') {
    openLenderLoanDetail(props.id)
  } else {
    openLenderLeadDetail(props.id)
  }
}

function handleSignContract() {
  if (!record.value || !activeContract.value) return
  const signed = signContract(record.value.id, activeContract.value.id)
  if (!signed) return
  showSnackbar({
    variant: 'success',
    title: 'Contract signed',
    description: `${signed.label} (${signed.fileName}) has been digitally signed.`,
  })
}

function handleDownloadContract() {
  if (!activeContract.value) return
  showSnackbar({
    variant: 'success',
    title: 'Downloading contract PDF',
    description: `Downloaded ${activeContract.value.fileName}.`,
  })
}
</script>

<template>
  <div class="lender-contract">
    <LenderPageHeader
      title="Loan Contract"
      subtitle="Review contract terms and signature status."
      show-back
      :back-label="props.from === 'loans' ? 'Back to Loan Detail' : 'Back to Lead Detail'"
      @back="handleBack"
    />

    <div v-if="!record || !activeContract" class="lender-contract__empty">
      <h2 class="lender-contract__empty-title">No contract available</h2>
      <p class="lender-contract__empty-copy">
        Upload a loan contract from the detail workspace before opening contract preview.
      </p>
      <Button type="button" variant="outline" color="primary" @click="handleBack">
        {{ props.from === 'loans' ? 'Back to Loan Detail' : 'Back to Lead Detail' }}
      </Button>
    </div>

    <template v-else>
      <!-- Multi-Contract Tabs & Status Action Bar -->
      <section class="lender-contract__bar">
        <div class="lender-contract__tabs" role="tablist" aria-label="Contracts">
          <button
            v-for="contract in record.contracts"
            :key="contract.id"
            type="button"
            role="tab"
            class="lender-contract__tab"
            :class="{ 'lender-contract__tab--active': contract.id === activeContract.id }"
            :aria-selected="contract.id === activeContract.id"
            @click="selectedContractId = contract.id"
          >
            {{ contract.label }}
          </button>
        </div>

        <div class="lender-contract__actions">
          <span
            class="lender-contract__badge"
            :class="
              activeContract.status === 'Signed'
                ? 'lender-contract__badge--success'
                : 'lender-contract__badge--warning'
            "
          >
            Status: {{ activeContract.status }}
          </span>

          <Button
            type="button"
            variant="outline"
            color="neutral"
            size="small"
            @click="handleDownloadContract"
          >
            <template #leadingIcon>
              <img src="/icons/ui-actions/download.svg" alt="" class="lender-contract__btn-icon" />
            </template>
            Download Contract PDF
          </Button>

          <Button
            v-if="activeContract.status === 'Pending Signature'"
            type="button"
            color="brand"
            size="small"
            @click="handleSignContract"
          >
            <template #leadingIcon>
              <span class="lender-contract__btn-mask lender-contract__btn-mask--sign" aria-hidden="true"></span>
            </template>
            Sign Contract
          </Button>
        </div>
      </section>

      <!-- 4 Structured Summary Cards -->
      <div class="lender-contract__cards">
        <section class="lender-contract__card">
          <h2 class="lender-contract__card-title">Borrower Information</h2>
          <dl class="lender-contract__facts">
            <div class="lender-contract__fact">
              <dt>Company Name</dt>
              <dd>{{ record.companyName }}</dd>
            </div>
            <div class="lender-contract__fact">
              <dt>Company NPWP</dt>
              <dd class="lender-contract__tabular">{{ record.npwp }}</dd>
            </div>
            <div class="lender-contract__fact">
              <dt>PIC Name</dt>
              <dd>{{ record.picName }}</dd>
            </div>
            <div class="lender-contract__fact">
              <dt>Email</dt>
              <dd>{{ record.email }}</dd>
            </div>
            <div class="lender-contract__fact">
              <dt>Phone Number</dt>
              <dd class="lender-contract__tabular">{{ record.phone }}</dd>
            </div>
            <div class="lender-contract__fact">
              <dt>Application Number</dt>
              <dd class="lender-contract__tabular">{{ record.applicationNumber }}</dd>
            </div>
          </dl>
        </section>

        <section class="lender-contract__card">
          <h2 class="lender-contract__card-title">Product</h2>
          <dl class="lender-contract__facts">
            <div class="lender-contract__fact">
              <dt>Loan Type</dt>
              <dd>{{ record.loanType }}</dd>
            </div>
            <div class="lender-contract__fact">
              <dt>Sub-Type</dt>
              <dd>{{ record.subType }}</dd>
            </div>
            <div class="lender-contract__fact">
              <dt>Payment Method</dt>
              <dd>{{ record.offerTerms.paymentMethod }}</dd>
            </div>
            <div class="lender-contract__fact">
              <dt>Tenor</dt>
              <dd class="lender-contract__tabular">{{ record.offerTerms.tenorDays }} days</dd>
            </div>
            <div class="lender-contract__fact">
              <dt>Late Fee (per day)</dt>
              <dd class="lender-contract__tabular">{{ record.offerTerms.lateFeeRatePerDay }}%</dd>
            </div>
            <div class="lender-contract__fact">
              <dt>Document ID</dt>
              <dd class="lender-contract__tabular">{{ activeContract.documentId }}</dd>
            </div>
          </dl>
        </section>

        <section class="lender-contract__card">
          <h2 class="lender-contract__card-title">Loan Summary</h2>
          <dl class="lender-contract__facts">
            <div class="lender-contract__fact">
              <dt>Approved Amount</dt>
              <dd class="lender-contract__tabular">{{ formatRupiah(record.offerTerms.approvedAmount) }}</dd>
            </div>
            <div class="lender-contract__fact">
              <dt>Interest Rate (p.a.)</dt>
              <dd class="lender-contract__tabular">{{ record.offerTerms.interestRatePa }}%</dd>
            </div>
            <div class="lender-contract__fact">
              <dt>Total Interest</dt>
              <dd class="lender-contract__tabular">{{ formatRupiah(record.offerTerms.interestAmount) }}</dd>
            </div>
            <div class="lender-contract__fact">
              <dt>Admin Fee</dt>
              <dd class="lender-contract__tabular">
                {{ formatRupiah(record.offerTerms.adminFeeAmount) }} ({{ record.offerTerms.adminFeeRate }}%)
              </dd>
            </div>
            <div class="lender-contract__fact">
              <dt>Disbursement Amount</dt>
              <dd class="lender-contract__tabular">{{ formatRupiah(disbursementAmount) }}</dd>
            </div>
            <div v-if="revenueShare" class="lender-contract__fact">
              <dt>Net Lender Interest</dt>
              <dd class="lender-contract__tabular">{{ formatRupiah(revenueShare.netLenderInterest) }}</dd>
            </div>
          </dl>
        </section>

        <section class="lender-contract__card">
          <h2 class="lender-contract__card-title">Collateral Information</h2>
          <dl class="lender-contract__facts">
            <div class="lender-contract__fact">
              <dt>Counterparty</dt>
              <dd>{{ record.collateral.counterpartyName }}</dd>
            </div>
            <div class="lender-contract__fact">
              <dt>Counterparty NPWP</dt>
              <dd class="lender-contract__tabular">{{ record.collateral.counterpartyNpwp }}</dd>
            </div>
            <div class="lender-contract__fact">
              <dt>Invoice Number</dt>
              <dd class="lender-contract__tabular">{{ record.collateral.invoiceNumber }}</dd>
            </div>
            <div class="lender-contract__fact">
              <dt>e-Faktur</dt>
              <dd class="lender-contract__tabular">{{ record.collateral.eFakturNumber }}</dd>
            </div>
            <div class="lender-contract__fact">
              <dt>Invoice Amount</dt>
              <dd class="lender-contract__tabular">{{ formatRupiah(record.collateral.invoiceAmount) }}</dd>
            </div>
            <div class="lender-contract__fact">
              <dt>Due Date</dt>
              <dd class="lender-contract__tabular">{{ formatLenderDate(record.collateral.dueDate) }}</dd>
            </div>
          </dl>
        </section>
      </div>

      <!-- Simulated Formatted Contract Preview -->
      <section class="lender-contract__preview-card" aria-label="Contract preview">
        <div class="lender-contract__preview-header">
          <div class="lender-contract__preview-title-wrap">
            <img src="/icons/text-formatting/article.svg" alt="" class="lender-contract__preview-icon" />
            <div>
              <h2 class="lender-contract__preview-title">Contract Preview: {{ activeContract.fileName }}</h2>
              <p class="lender-contract__preview-sub">
                Uploaded on {{ formatLenderDateTime(activeContract.uploadedAt) }}
              </p>
            </div>
          </div>
          <span class="lender-contract__preview-id">{{ activeContract.id }}</span>
        </div>

        <div class="lender-contract__paper">
          <div class="lender-contract__paper-head">
            <img src="/logo/logo-credor-symbol-blue-24px.svg" alt="" class="lender-contract__paper-logo" />
            <div>
              <p class="lender-contract__paper-kicker">CREDOR LENDER FACILITY AGREEMENT</p>
              <h3 class="lender-contract__paper-heading">
                Working Capital Financing Agreement ({{ record.applicationNumber }})
              </h3>
            </div>
          </div>

          <p class="lender-contract__paper-p">
            This Financing Agreement is entered into between <strong>Twice Financing</strong> (the Lender) and
            <strong>{{ record.companyName }}</strong> (NPWP <span class="lender-contract__tabular">{{ record.npwp }}</span>,
            represented by <strong>{{ record.picName }}</strong>, the Borrower) under the Credor institutional lending facility.
          </p>

          <div class="lender-contract__paper-clauses">
            <div class="lender-contract__clause">
              <h4>1. Facility &amp; Disbursement Terms</h4>
              <p>
                The Lender approves a principal financing facility of
                <strong class="lender-contract__tabular">{{ formatRupiah(record.offerTerms.approvedAmount) }}</strong>
                under <strong>{{ record.loanType }}</strong> ({{ record.offerTerms.paymentMethod }}) for a tenor of
                <strong class="lender-contract__tabular">{{ record.offerTerms.tenorDays }} days</strong>. After deducting the
                administration fee of
                <strong class="lender-contract__tabular">{{ formatRupiah(record.offerTerms.adminFeeAmount) }}</strong>,
                the net disbursement amount is
                <strong class="lender-contract__tabular">{{ formatRupiah(disbursementAmount) }}</strong>.
              </p>
            </div>

            <div class="lender-contract__clause">
              <h4>2. Interest, Revenue Share &amp; Late Penalty</h4>
              <p>
                Interest accrues at <strong class="lender-contract__tabular">{{ record.offerTerms.interestRatePa }}% p.a.</strong>
                (total tenor interest <strong class="lender-contract__tabular">{{ formatRupiah(record.offerTerms.interestAmount) }}</strong>).
                Any unpaid principal past maturity accrues a daily late penalty of
                <strong class="lender-contract__tabular">{{ record.offerTerms.lateFeeRatePerDay }}% per day</strong>.
              </p>
            </div>

            <div class="lender-contract__clause">
              <h4>3. Underlying Collateral Reference</h4>
              <p>
                Secured by commercial invoice
                <strong class="lender-contract__tabular">{{ record.collateral.invoiceNumber }}</strong> and tax invoice
                e-Faktur <strong class="lender-contract__tabular">{{ record.collateral.eFakturNumber }}</strong> issued to
                <strong>{{ record.collateral.counterpartyName }}</strong> in the amount of
                <strong class="lender-contract__tabular">{{ formatRupiah(record.collateral.invoiceAmount) }}</strong>, due on
                <strong class="lender-contract__tabular">{{ formatLenderDate(record.collateral.dueDate) }}</strong>.
              </p>
            </div>
          </div>

          <div class="lender-contract__signatures">
            <div class="lender-contract__sig-box">
              <span class="lender-contract__sig-role">Lender Signatory</span>
              <strong class="lender-contract__sig-party">Twice Financing</strong>
              <span
                v-if="activeContract.status === 'Signed'"
                class="lender-contract__sig-status lender-contract__sig-status--signed"
              >
                <span class="lender-contract__sig-icon" aria-hidden="true"></span>
                Digitally signed {{ activeContract.signedAt ? `on ${formatLenderDateTime(activeContract.signedAt)}` : '' }}
              </span>
              <span v-else class="lender-contract__sig-status lender-contract__sig-status--pending">
                Awaiting lender digital signature
              </span>
            </div>

            <div class="lender-contract__sig-box">
              <span class="lender-contract__sig-role">Borrower Signatory</span>
              <strong class="lender-contract__sig-party">{{ record.companyName }}</strong>
              <span class="lender-contract__sig-status">
                Authorized PIC: {{ record.picName }}
              </span>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.lender-contract {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-6);
  min-width: 0;
}

.lender-contract__empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-6);
  border: var(--primitives-border-width-default) solid var(--component-card-border);
  border-radius: var(--primitives-border-radius-lg);
  background: var(--component-card-background);
}

.lender-contract__empty-title {
  margin: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-lg);
  font-weight: 600;
}

.lender-contract__empty-copy {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
}

.lender-contract__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-3);
  padding: 0 var(--primitives-padding-5);
  border: var(--primitives-border-width-default) solid var(--component-card-border);
  border-radius: var(--primitives-border-radius-lg);
  background: var(--component-card-background);
}

.lender-contract__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--primitives-padding-5);
}

.lender-contract__tab {
  padding: var(--primitives-padding-4) 0 var(--primitives-padding-3);
  border: 0;
  border-bottom: var(--primitives-border-width-2) solid transparent;
  background: none;
  color: var(--component-tabs-line-item-text-inactive);
  cursor: pointer;
  font-family: inherit;
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  white-space: nowrap;
}

.lender-contract__tab--active {
  border-bottom-color: var(--component-tabs-line-item-indicator);
  color: var(--component-tabs-line-item-text-active);
  font-weight: 600;
}

.lender-contract__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--primitives-padding-2);
  padding: var(--primitives-padding-3) 0;
}

.lender-contract__btn-icon {
  display: block;
  width: 14px;
  height: 14px;
}

.lender-contract__btn-mask {
  display: block;
  width: 14px;
  height: 14px;
  background: currentColor;
}

.lender-contract__btn-mask--sign {
  mask: url('/icons/custom/e-signature.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/custom/e-signature.svg') center / contain no-repeat;
}

.lender-contract__badge {
  display: inline-flex;
  align-items: center;
  padding: 4px var(--primitives-padding-3);
  border: var(--primitives-border-width-default) solid transparent;
  border-radius: var(--primitives-border-radius-infinite);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
  white-space: nowrap;
}

.lender-contract__badge--success {
  border-color: var(--component-badge-success-border);
  background: var(--component-badge-success-background);
  color: var(--component-badge-success-text);
}

.lender-contract__badge--warning {
  border-color: var(--component-badge-warning-border);
  background: var(--component-badge-warning-background);
  color: var(--component-badge-warning-text);
}

.lender-contract__cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--primitives-padding-5);
}

.lender-contract__card {
  box-sizing: border-box;
  min-width: 0;
  padding: var(--primitives-padding-5);
  border: var(--primitives-border-width-default) solid var(--component-card-border);
  border-radius: var(--primitives-border-radius-lg);
  background: var(--component-card-background);
}

.lender-contract__card-title {
  margin: 0 0 var(--primitives-padding-4);
  padding-bottom: var(--primitives-padding-3);
  border-bottom: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-md);
  font-weight: 600;
}

.lender-contract__facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--primitives-padding-3) var(--primitives-padding-4);
  margin: 0;
}

.lender-contract__fact {
  min-width: 0;
}

.lender-contract__fact dt {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}

.lender-contract__fact dd {
  margin: var(--primitives-padding-1) 0 0;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-sm);
  overflow-wrap: anywhere;
}

.lender-contract__preview-card {
  box-sizing: border-box;
  border: var(--primitives-border-width-default) solid var(--component-card-border);
  border-radius: var(--primitives-border-radius-lg);
  background: var(--component-card-background);
  overflow: hidden;
}

.lender-contract__preview-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-4) var(--primitives-padding-5);
  border-bottom: var(--primitives-border-width-default) solid var(--component-card-border);
  background: var(--semantic-bg-ach-color-bg-canvas);
}

.lender-contract__preview-title-wrap {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-3);
}

.lender-contract__preview-icon {
  display: block;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.lender-contract__preview-title {
  margin: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 600;
}

.lender-contract__preview-sub {
  margin: 2px 0 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  font-variant-numeric: tabular-nums;
}

.lender-contract__preview-id {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.lender-contract__paper {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-5);
  padding: var(--primitives-padding-6);
}

.lender-contract__paper-head {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-3);
  padding-bottom: var(--primitives-padding-4);
  border-bottom: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
}

.lender-contract__paper-logo {
  display: block;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}

.lender-contract__paper-kicker {
  margin: 0;
  color: var(--semantic-brand-ach-color-brand-default);
  font-size: var(--primitives-font-sizes-2xs);
  font-weight: 700;
  letter-spacing: var(--primitives-letter-spacing-wider);
}

.lender-contract__paper-heading {
  margin: 2px 0 0;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-md);
  font-weight: 700;
}

.lender-contract__paper-p {
  margin: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-md);
}

.lender-contract__paper-clauses {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-4);
}

.lender-contract__clause h4 {
  margin: 0 0 var(--primitives-padding-1);
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 600;
}

.lender-contract__clause p {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-md);
}

.lender-contract__signatures {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--primitives-padding-4);
  padding-top: var(--primitives-padding-4);
  border-top: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
}

.lender-contract__sig-box {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-1);
  padding: var(--primitives-padding-4);
  border: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
  border-radius: var(--primitives-border-radius-md);
  background: var(--semantic-bg-ach-color-bg-canvas);
}

.lender-contract__sig-role {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
}

.lender-contract__sig-party {
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 600;
}

.lender-contract__sig-status {
  display: inline-flex;
  align-items: center;
  gap: var(--primitives-padding-1);
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  font-variant-numeric: tabular-nums;
}

.lender-contract__sig-status--signed {
  color: var(--semantic-text-success-ach-color-text-success);
  font-weight: 500;
}

.lender-contract__sig-status--pending {
  color: var(--semantic-text-warning-ach-color-text-warning);
  font-weight: 500;
}

.lender-contract__sig-icon {
  display: block;
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  background: currentColor;
  mask: url('/icons/ui-actions/check-circle.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/check-circle.svg') center / contain no-repeat;
}

.lender-contract__tabular {
  font-variant-numeric: tabular-nums;
}

@media (max-width: 900px) {
  .lender-contract__cards,
  .lender-contract__signatures {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 540px) {
  .lender-contract__facts {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
