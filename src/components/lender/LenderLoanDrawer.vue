<script setup lang="ts">
import { computed, type StyleValue } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useAppView } from '@/composables/useAppView'
import { formatLenderDate, formatLenderDateTime, formatRupiah } from '@/lib/lender/lender-data'
import type { LenderLoan, LenderLoanStatus } from '@/lib/lender/types'

const props = defineProps<{
  open: boolean
  loan: LenderLoan | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  viewDetail: [id: string]
}>()

const { openLenderLoanDetail } = useAppView()

const drawerStyle: StyleValue = {
  width: 'var(--component-drawer-width)',
  maxWidth: '100vw',
  gap: '0',
  padding: '0',
  borderLeftColor: 'var(--component-drawer-border)',
  background: 'var(--component-drawer-background)',
}

const statusMeta: Record<LenderLoanStatus, { label: string; tone: 'info' | 'error' | 'success' }> = {
  active: { label: 'Active', tone: 'info' },
  overdue: { label: 'Overdue', tone: 'error' },
  paid: { label: 'Paid', tone: 'success' },
}

const currentStatus = computed(() => {
  if (!props.loan) return null
  return statusMeta[props.loan.status]
})

function handleOpenChange(value: boolean) {
  emit('update:open', value)
}

function closeDrawer() {
  emit('update:open', false)
}

function handleViewDetail() {
  if (!props.loan) return
  const targetId = props.loan.id
  emit('viewDetail', targetId)
  openLenderLoanDetail(targetId)
}
</script>

<template>
  <Sheet :open="open" @update:open="handleOpenChange">
    <SheetContent side="right" :show-close="false" :style="drawerStyle">
      <header class="loan-drawer__header">
        <SheetHeader class="loan-drawer__header-copy">
          <SheetTitle class="loan-drawer__title">Loan Details</SheetTitle>
          <SheetDescription class="loan-drawer__description">
            Review approved terms, disbursement values, and repayment summary for this loan.
          </SheetDescription>
        </SheetHeader>

        <button
          type="button"
          class="loan-drawer__close"
          aria-label="Close loan details"
          @click="closeDrawer"
        >
          <img src="/icons/ui-actions/close.svg" alt="" aria-hidden="true" />
        </button>
      </header>

      <div v-if="loan" class="loan-drawer__body">
        <section class="loan-drawer__hero" aria-label="Borrower overview">
          <div class="loan-drawer__hero-top">
            <div class="loan-drawer__hero-copy">
              <p class="loan-drawer__app-number">{{ loan.applicationNumber }}</p>
              <h2 class="loan-drawer__company">{{ loan.companyName }}</h2>
            </div>

            <span
              v-if="currentStatus"
              class="loan-drawer__status"
              :data-tone="currentStatus.tone"
            >
              {{ currentStatus.label }}
            </span>
          </div>

          <p class="loan-drawer__meta-line">
            <span>Submitted {{ formatLenderDate(loan.submittedAt) }}</span>
            <span aria-hidden="true">&middot;</span>
            <span>{{ loan.relativeAge }}</span>
          </p>
        </section>

        <section class="loan-drawer__section" aria-label="Loan parameters">
          <h3 class="loan-drawer__section-title">Financing Terms</h3>
          <dl class="loan-drawer__grid">
            <div class="loan-drawer__field">
              <dt>Requested Amount</dt>
              <dd class="loan-drawer__value--numeric">{{ formatRupiah(loan.requestedAmount) }}</dd>
            </div>
            <div class="loan-drawer__field">
              <dt>Approved Amount</dt>
              <dd class="loan-drawer__value--numeric">{{ formatRupiah(loan.approvedAmount) }}</dd>
            </div>
            <div class="loan-drawer__field">
              <dt>Disbursement Amount</dt>
              <dd class="loan-drawer__value--numeric">{{ formatRupiah(loan.disbursementAmount) }}</dd>
            </div>
            <div class="loan-drawer__field">
              <dt>Due Date</dt>
              <dd class="loan-drawer__value--numeric">{{ formatLenderDate(loan.dueDate) }}</dd>
            </div>
            <div class="loan-drawer__field">
              <dt>Loan Type</dt>
              <dd>{{ loan.loanType }}</dd>
            </div>
            <div class="loan-drawer__field">
              <dt>Sub-Type</dt>
              <dd>{{ loan.subType }}</dd>
            </div>
          </dl>
        </section>

        <section class="loan-drawer__section" aria-label="Loan summary">
          <div class="loan-drawer__section-header">
            <h3 class="loan-drawer__section-title">Loan Summary</h3>
            <span class="loan-drawer__synced">
              Last synced {{ formatLenderDateTime(loan.lastSyncedAt) }}
            </span>
          </div>

          <div v-if="loan.overdueSummary" class="loan-drawer__overdue-card">
            <div class="loan-drawer__overdue-head">
              <span class="loan-drawer__overdue-icon" aria-hidden="true"></span>
              <span class="loan-drawer__overdue-label">Overdue repayment balance</span>
            </div>

            <dl class="loan-drawer__summary-list">
              <div class="loan-drawer__summary-row">
                <dt>Total interest</dt>
                <dd>{{ formatRupiah(loan.overdueSummary.totalInterest) }}</dd>
              </div>
              <div class="loan-drawer__summary-row">
                <dt>Late penalty</dt>
                <dd>{{ formatRupiah(loan.overdueSummary.latePenalty) }}</dd>
              </div>
              <div class="loan-drawer__summary-row loan-drawer__summary-row--emphasis">
                <dt>Current amount due</dt>
                <dd>{{ formatRupiah(loan.overdueSummary.currentAmountDue) }}</dd>
              </div>
              <div class="loan-drawer__summary-row">
                <dt>Amount due at maturity</dt>
                <dd>{{ formatRupiah(loan.overdueSummary.amountDueAtMaturity) }}</dd>
              </div>
            </dl>
          </div>

          <div v-else class="loan-drawer__summary-card">
            <dl class="loan-drawer__summary-list">
              <div class="loan-drawer__summary-row">
                <dt>Principal Approved</dt>
                <dd>{{ formatRupiah(loan.approvedAmount) }}</dd>
              </div>
              <div class="loan-drawer__summary-row">
                <dt>Net Disbursed</dt>
                <dd>{{ formatRupiah(loan.disbursementAmount) }}</dd>
              </div>
              <div class="loan-drawer__summary-row">
                <dt>Maturity Date</dt>
                <dd>{{ formatLenderDate(loan.dueDate) }}</dd>
              </div>
              <div class="loan-drawer__summary-row">
                <dt>Repayment Status</dt>
                <dd>{{ loan.status === 'paid' ? 'Settled in full' : 'On schedule' }}</dd>
              </div>
            </dl>
          </div>
        </section>
      </div>

      <footer class="loan-drawer__footer">
        <Button
          type="button"
          variant="outline"
          color="neutral"
          size="default"
          @click="closeDrawer"
        >
          Close
        </Button>

        <Button
          type="button"
          variant="default"
          color="primary"
          size="default"
          :disabled="!loan"
          @click="handleViewDetail"
        >
          View Detail
        </Button>
      </footer>
    </SheetContent>
  </Sheet>
</template>

<style scoped>
.loan-drawer__header {
  display: flex;
  box-sizing: border-box;
  min-height: var(--component-drawer-header-height);
  flex: 0 0 auto;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-4) var(--primitives-padding-6);
  border-bottom: var(--primitives-border-width-default) solid var(--component-drawer-border);
  background: var(--component-drawer-background);
}

.loan-drawer__header-copy {
  padding: 0;
  gap: var(--primitives-padding-1);
}

.loan-drawer__title {
  margin: 0;
  color: var(--component-drawer-title-text);
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-xl);
  font-weight: 700;
  line-height: var(--primitives-line-heights-xl);
}

.loan-drawer__description {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-family: var(--primitives-font-families-body), sans-serif;
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
}

.loan-drawer__close {
  display: grid;
  width: var(--primitives-padding-8);
  height: var(--primitives-padding-8);
  flex: 0 0 var(--primitives-padding-8);
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: var(--primitives-border-radius-xs);
  background: transparent;
  color: var(--component-drawer-icon);
  cursor: pointer;
}

.loan-drawer__close img {
  display: block;
  width: var(--primitives-padding-5);
  height: var(--primitives-padding-5);
}

.loan-drawer__close:hover {
  background: var(--semantic-bg-ach-color-bg-surface-hover);
}

.loan-drawer__close:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-brand-ach-color-brand-default);
  outline-offset: var(--primitives-border-width-2);
}

.loan-drawer__body {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: var(--primitives-padding-6);
  padding: var(--primitives-padding-6);
  overflow-y: auto;
  background: var(--component-drawer-background);
}

.loan-drawer__hero {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-2);
  padding: var(--primitives-padding-4);
  border: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
  border-radius: var(--primitives-border-radius-md);
  background: var(--semantic-bg-ach-color-bg-canvas);
}

.loan-drawer__hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--primitives-padding-3);
}

.loan-drawer__hero-copy {
  min-width: 0;
}

.loan-drawer__app-number {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-family: var(--primitives-font-families-body), sans-serif;
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
  line-height: var(--primitives-line-heights-xs);
  font-variant-numeric: tabular-nums;
}

.loan-drawer__company {
  margin: var(--primitives-padding-1) 0 0;
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-lg);
  font-weight: 700;
  line-height: var(--primitives-line-heights-lg);
  overflow-wrap: anywhere;
}

.loan-drawer__status {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  padding: var(--primitives-padding-1) var(--primitives-padding-3);
  border: var(--primitives-border-width-default) solid transparent;
  border-radius: var(--primitives-border-radius-infinite);
  font-family: var(--primitives-font-families-body), sans-serif;
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
  line-height: var(--primitives-line-heights-2xs);
  white-space: nowrap;
}

.loan-drawer__status[data-tone='info'] {
  background: var(--component-badge-info-background);
  border-color: var(--component-badge-info-border);
  color: var(--component-badge-info-text);
}

.loan-drawer__status[data-tone='error'] {
  background: var(--component-badge-error-background);
  border-color: var(--component-badge-error-border);
  color: var(--component-badge-error-text);
}

.loan-drawer__status[data-tone='success'] {
  background: var(--component-badge-success-background);
  border-color: var(--component-badge-success-border);
  color: var(--component-badge-success-text);
}

.loan-drawer__meta-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--primitives-padding-2);
  margin: 0;
  color: var(--semantic-text-ach-color-text-subtle);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
  font-variant-numeric: tabular-nums;
}

.loan-drawer__section {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-3);
}

.loan-drawer__section-header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--primitives-padding-2);
}

.loan-drawer__section-title {
  margin: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 600;
  line-height: var(--primitives-line-heights-sm);
}

.loan-drawer__synced {
  color: var(--semantic-text-ach-color-text-subtle);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
  font-variant-numeric: tabular-nums;
}

.loan-drawer__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--primitives-padding-4);
  margin: 0;
  padding: var(--primitives-padding-4);
  border: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
  border-radius: var(--primitives-border-radius-md);
  background: var(--component-card-background);
}

.loan-drawer__field {
  min-width: 0;
}

.loan-drawer__field dt {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
}

.loan-drawer__field dd {
  margin: var(--primitives-padding-1) 0 0;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 600;
  line-height: var(--primitives-line-heights-sm);
  overflow-wrap: anywhere;
}

.loan-drawer__value--numeric {
  font-variant-numeric: tabular-nums;
}

.loan-drawer__overdue-card {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-4);
  border: var(--primitives-border-width-default) solid var(--semantic-border-error-ach-color-border-error);
  border-radius: var(--primitives-border-radius-md);
  background: var(--semantic-bg-error-ach-color-bg-error-surface);
}

.loan-drawer__overdue-head {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-2);
  color: var(--semantic-text-error-ach-color-text-error);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
  line-height: var(--primitives-line-heights-xs);
}

.loan-drawer__overdue-icon {
  width: var(--primitives-padding-4);
  height: var(--primitives-padding-4);
  flex-shrink: 0;
  background: currentColor;
  mask: url('/icons/common-actions/warning.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/common-actions/warning.svg') center / contain no-repeat;
}

.loan-drawer__summary-card {
  padding: var(--primitives-padding-4);
  border: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
  border-radius: var(--primitives-border-radius-md);
  background: var(--semantic-bg-ach-color-bg-canvas);
}

.loan-drawer__summary-list {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-2);
  margin: 0;
}

.loan-drawer__summary-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--primitives-padding-4);
}

.loan-drawer__summary-row dt {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
}

.loan-drawer__summary-row dd {
  margin: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 600;
  line-height: var(--primitives-line-heights-sm);
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.loan-drawer__summary-row--emphasis {
  padding-top: var(--primitives-padding-2);
  border-top: var(--primitives-border-width-default) solid var(--semantic-border-error-ach-color-border-error);
}

.loan-drawer__summary-row--emphasis dt,
.loan-drawer__summary-row--emphasis dd {
  color: var(--semantic-text-error-ach-color-text-error);
  font-weight: 700;
}

.loan-drawer__footer {
  display: flex;
  box-sizing: border-box;
  flex: 0 0 auto;
  align-items: center;
  justify-content: flex-end;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-4) var(--primitives-padding-6);
  border-top: var(--primitives-border-width-default) solid var(--component-drawer-border);
  background: var(--component-drawer-background);
}

@media (max-width: 540px) {
  .loan-drawer__grid {
    grid-template-columns: 1fr;
  }
}
</style>
