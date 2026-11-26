<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import { useAppView } from '@/composables/useAppView'
import { useSnackbar } from '@/composables/useSnackbar'
import { formatLenderDate, formatRupiah } from '@/lib/lender/lender-data'
import type { LenderLoan, LenderLoanStatus } from '@/lib/lender/types'
import { useLenderPortal } from '@/lib/lender/useLenderPortal'
import LenderLoanDrawer from './LenderLoanDrawer.vue'
import LenderPageHeader from './LenderPageHeader.vue'

const { loans, loanPortfolioKpis } = useLenderPortal()
const { view, openLenderLoans } = useAppView()
const snackbar = useSnackbar()

const rowsPerPageOptions = [5, 10, 25, 50] as const
const rowsPerPage = ref<number>(10)
const currentPage = ref<number>(1)

const selectedLoanId = ref<string | null>(null)
const drawerOpen = ref(false)

const selectedLoan = computed<LenderLoan | null>(() => {
  if (!selectedLoanId.value) return null
  return loans.value.find((item) => item.id === selectedLoanId.value) ?? null
})

const totalPages = computed(() => Math.max(1, Math.ceil(loans.value.length / rowsPerPage.value)))

const paginatedLoans = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value
  return loans.value.slice(start, start + rowsPerPage.value)
})

const statusMeta: Record<LenderLoanStatus, { label: string; tone: 'info' | 'error' | 'success' }> = {
  active: { label: 'Active', tone: 'info' },
  overdue: { label: 'Overdue', tone: 'error' },
  paid: { label: 'Paid', tone: 'success' },
}

const kpiCards = computed(() => [
  {
    id: 'total-active-loans',
    label: 'Total Active Loans',
    value: String(loanPortfolioKpis.value.totalActiveLoans),
    subtext: 'Manage all loans',
    tone: 'default' as const,
  },
  {
    id: 'total-active-value',
    label: 'Total Active Loan Value',
    value: formatRupiah(loanPortfolioKpis.value.totalActiveLoanValue),
    subtext: 'Across all borrowers',
    tone: 'default' as const,
  },
  {
    id: 'overdue-loans',
    label: 'Overdue Loans',
    value: String(loanPortfolioKpis.value.overdueLoansCount),
    subtext: 'Requires immediate action',
    tone: loanPortfolioKpis.value.overdueLoansCount > 0 ? ('error' as const) : ('default' as const),
  },
  {
    id: 'nearest-due-date',
    label: 'Nearest Due Date',
    value: loanPortfolioKpis.value.nearestDueDate
      ? formatLenderDate(loanPortfolioKpis.value.nearestDueDate)
      : '-',
    subtext: 'Upcoming maturity',
    tone: 'default' as const,
  },
])

watch(rowsPerPage, () => {
  currentPage.value = 1
})

watch(totalPages, (nextTotalPages) => {
  if (currentPage.value > nextTotalPages) {
    currentPage.value = nextTotalPages
  }
})

watch(
  () => view.value,
  (currentView) => {
    if (currentView.name !== 'lender-loans' || !currentView.drawerId) return
    const matched = loans.value.find((item) => item.id === currentView.drawerId)
    if (matched) {
      selectedLoanId.value = matched.id
      drawerOpen.value = true
    }
  },
  { immediate: true },
)

function handleDrawerOpenChange(isOpen: boolean) {
  drawerOpen.value = isOpen
  if (!isOpen) {
    selectedLoanId.value = null
    if (view.value.name === 'lender-loans' && view.value.drawerId) {
      openLenderLoans()
    }
  }
}

function handleViewDetail() {
  drawerOpen.value = false
  selectedLoanId.value = null
}

function openLoanDrawer(loan: LenderLoan) {
  selectedLoanId.value = loan.id
  drawerOpen.value = true
}

async function copyApplicationNumber(applicationNumber: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(applicationNumber)
    }
  } catch {
    // Fallback gracefully in restricted browser contexts while still showing confirmation.
  }
  snackbar.show({
    variant: 'success',
    title: 'Application number copied',
    description: `${applicationNumber} copied to clipboard.`,
  })
}
</script>

<template>
  <section class="lender-loans" aria-label="Active Loans">
    <LenderPageHeader
      title="Active Loans"
      subtitle="Monitor active loans and track repayment progress across your portfolio."
    />

    <div class="lender-loans__kpis" role="region" aria-label="Loan portfolio summary">
      <article
        v-for="card in kpiCards"
        :key="card.id"
        class="lender-loans__kpi-card"
        :data-tone="card.tone"
      >
        <p class="lender-loans__kpi-label">{{ card.label }}</p>
        <p class="lender-loans__kpi-value">{{ card.value }}</p>
        <p class="lender-loans__kpi-subtext">{{ card.subtext }}</p>
      </article>
    </div>

    <div class="lender-loans__surface">
      <div class="lender-loans__toolbar">
        <div class="lender-loans__toolbar-copy">
          <h2 class="lender-loans__section-title">Loan Portfolio</h2>
          <span class="lender-loans__count">{{ loans.length }} loans</span>
        </div>

        <label class="lender-loans__rows-control">
          <span class="lender-loans__rows-label">Rows per page</span>
          <span class="lender-loans__select-wrap">
            <select
              v-model.number="rowsPerPage"
              class="lender-loans__select"
              aria-label="Rows per page"
            >
              <option v-for="option in rowsPerPageOptions" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
            <img
              src="/icons/ui-actions/expand-more.svg"
              alt=""
              aria-hidden="true"
              class="lender-loans__select-chevron"
            />
          </span>
        </label>
      </div>

      <div class="lender-loans__table-wrap">
        <table class="lender-loans__table">
          <thead>
            <tr>
              <th scope="col">Submission Date</th>
              <th scope="col">Application Number</th>
              <th scope="col">Company Name</th>
              <th scope="col">Due Date</th>
              <th scope="col" class="lender-loans__col-numeric">Approved Amount</th>
              <th scope="col" class="lender-loans__col-numeric">Disbursement Amount</th>
              <th scope="col">Loan Type</th>
              <th scope="col">Status</th>
              <th scope="col" class="lender-loans__actions-head">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="paginatedLoans.length === 0">
              <td colspan="9" class="lender-loans__empty">No active loans found.</td>
            </tr>

            <tr v-for="loan in paginatedLoans" :key="loan.id">
              <td>
                <span class="lender-loans__cell-primary">
                  {{ formatLenderDate(loan.submittedAt) }}
                </span>
                <span class="lender-loans__cell-sub">{{ loan.relativeAge }}</span>
              </td>

              <td>
                <div class="lender-loans__app-cell">
                  <span class="lender-loans__app-number">{{ loan.applicationNumber }}</span>
                  <button
                    type="button"
                    class="lender-loans__copy-btn"
                    :aria-label="`Copy application number ${loan.applicationNumber}`"
                    title="Copy application number"
                    @click="copyApplicationNumber(loan.applicationNumber)"
                  >
                    <span class="lender-loans__copy-icon" aria-hidden="true"></span>
                  </button>
                </div>
              </td>

              <th scope="row">
                <span class="lender-loans__company">{{ loan.companyName }}</span>
              </th>

              <td class="lender-loans__cell-numeric">
                {{ formatLenderDate(loan.dueDate) }}
              </td>

              <td class="lender-loans__cell-numeric lender-loans__col-numeric">
                {{ formatRupiah(loan.approvedAmount) }}
              </td>

              <td class="lender-loans__cell-numeric lender-loans__col-numeric">
                {{ formatRupiah(loan.disbursementAmount) }}
              </td>

              <td>
                <span class="lender-loans__cell-primary">{{ loan.loanType }}</span>
                <span class="lender-loans__cell-sub">{{ loan.subType }}</span>
              </td>

              <td>
                <span
                  class="lender-loans__badge"
                  :data-tone="statusMeta[loan.status].tone"
                >
                  {{ statusMeta[loan.status].label }}
                </span>
              </td>

              <td class="lender-loans__actions">
                <Button
                  type="button"
                  variant="outline"
                  color="neutral"
                  size="small"
                  @click="openLoanDrawer(loan)"
                >
                  <template #leadingIcon>
                    <img src="/icons/common-actions/visibility.svg" alt="" aria-hidden="true" />
                  </template>
                  View
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="loans.length > rowsPerPage" class="lender-loans__pagination">
        <Pagination
          v-model:page="currentPage"
          :total="loans.length"
          :items-per-page="rowsPerPage"
          label="Active loans pagination"
        />
      </div>
    </div>

    <LenderLoanDrawer
      :open="drawerOpen"
      :loan="selectedLoan"
      @update:open="handleDrawerOpenChange"
      @view-detail="handleViewDetail"
    />
  </section>
</template>

<style scoped>
.lender-loans {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-6);
  min-width: 0;
}

.lender-loans__kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--primitives-padding-4);
}

.lender-loans__kpi-card {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-1);
  min-width: 0;
  padding: var(--primitives-padding-4) var(--primitives-padding-5);
  border: var(--primitives-border-width-default) solid var(--component-stats-border);
  border-radius: var(--primitives-border-radius-md);
  background: var(--component-stats-item-background);
}

.lender-loans__kpi-label {
  margin: 0;
  color: var(--component-stats-item-title);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 500;
  line-height: var(--primitives-line-heights-xs);
}

.lender-loans__kpi-value {
  margin: 0;
  color: var(--component-stats-item-number);
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-xl);
  font-weight: 700;
  line-height: var(--primitives-line-heights-xl);
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}

.lender-loans__kpi-card[data-tone='error'] .lender-loans__kpi-value {
  color: var(--semantic-text-error-ach-color-text-error);
}

.lender-loans__kpi-subtext {
  margin: 0;
  color: var(--component-stats-item-subtitle);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
}

.lender-loans__surface {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-4);
  min-width: 0;
  padding: var(--primitives-padding-5);
  border: var(--primitives-border-width-default) solid var(--component-card-border);
  border-radius: var(--primitives-border-radius-md);
  background: var(--component-card-background);
}

.lender-loans__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-3);
}

.lender-loans__toolbar-copy {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-2);
}

.lender-loans__section-title {
  margin: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-md);
  font-weight: 600;
  line-height: var(--primitives-line-heights-md);
}

.lender-loans__count {
  padding: 2px var(--primitives-padding-2);
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--component-tabs-counter-background);
  color: var(--component-tabs-counter-text);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
  line-height: var(--primitives-line-heights-xs);
  font-variant-numeric: tabular-nums;
}

.lender-loans__rows-control {
  display: inline-flex;
  align-items: center;
  gap: var(--primitives-padding-2);
}

.lender-loans__rows-label {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 500;
  line-height: var(--primitives-line-heights-xs);
}

.lender-loans__select-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.lender-loans__select {
  height: var(--primitives-padding-8);
  padding: 0 var(--primitives-padding-7) 0 var(--primitives-padding-3);
  border: var(--primitives-border-width-default) solid var(--component-select-field-border);
  border-radius: var(--primitives-border-radius-sm);
  background: var(--component-select-field-background);
  color: var(--component-select-field-text);
  font-family: var(--primitives-font-families-body), sans-serif;
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  appearance: none;
  cursor: pointer;
}

.lender-loans__select:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--component-select-field-border-focus);
  outline-offset: var(--primitives-border-width-2);
}

.lender-loans__select-chevron {
  position: absolute;
  right: var(--primitives-padding-2);
  width: var(--primitives-padding-4);
  height: var(--primitives-padding-4);
  pointer-events: none;
}

.lender-loans__table-wrap {
  overflow-x: auto;
  min-width: 0;
}

.lender-loans__table {
  width: 100%;
  min-width: 960px;
  border-collapse: collapse;
  color: var(--component-table-row-text);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.lender-loans__table thead th {
  padding: var(--primitives-padding-2) var(--primitives-padding-3) var(--primitives-padding-3);
  border-bottom: var(--primitives-border-width-default) solid var(--component-table-cell-divider);
  background: transparent;
  color: var(--component-table-header-text);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
  line-height: var(--primitives-line-heights-xs);
  text-align: left;
  white-space: nowrap;
}

.lender-loans__table thead th:first-child,
.lender-loans__table tbody td:first-child {
  padding-left: 0;
}

.lender-loans__table thead th:last-child,
.lender-loans__table tbody td:last-child {
  padding-right: 0;
}

.lender-loans__table td,
.lender-loans__table tbody th {
  padding: var(--primitives-padding-3);
  border-bottom: var(--primitives-border-width-default) solid var(--component-table-cell-divider);
  font-weight: 400;
  text-align: left;
  vertical-align: middle;
}

.lender-loans__table tbody tr {
  transition: background-color var(--semantic-motion-duration-fast) ease;
}

.lender-loans__table tbody tr:hover {
  background: var(--semantic-bg-ach-color-bg-canvas);
}

.lender-loans__cell-primary {
  display: block;
  color: var(--semantic-text-ach-color-text-default);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.lender-loans__cell-sub {
  display: block;
  margin-top: 2px;
  color: var(--semantic-text-ach-color-text-subtle);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.lender-loans__app-cell {
  display: inline-flex;
  align-items: center;
  gap: var(--primitives-padding-1);
}

.lender-loans__app-number {
  color: var(--semantic-text-ach-color-text-default);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.lender-loans__copy-btn {
  display: inline-grid;
  width: var(--primitives-padding-6);
  height: var(--primitives-padding-6);
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: var(--primitives-border-radius-xs);
  background: transparent;
  color: var(--semantic-icon-ach-color-icon-subtle);
  cursor: pointer;
}

.lender-loans__copy-btn:hover {
  background: var(--semantic-bg-ach-color-bg-surface-hover);
  color: var(--semantic-icon-ach-color-icon-default);
}

.lender-loans__copy-btn:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-brand-ach-color-brand-default);
  outline-offset: var(--primitives-border-width-2);
}

.lender-loans__copy-icon {
  width: var(--primitives-font-sizes-sm);
  height: var(--primitives-font-sizes-sm);
  background: currentColor;
  mask: url('/icons/text-formatting/content-copy.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/text-formatting/content-copy.svg') center / contain no-repeat;
}

.lender-loans__company {
  display: block;
  min-width: 160px;
  color: var(--semantic-text-ach-color-text-default);
  font-weight: 600;
}

.lender-loans__cell-numeric {
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.lender-loans__table thead th.lender-loans__col-numeric,
.lender-loans__table td.lender-loans__col-numeric {
  text-align: right;
}

.lender-loans__badge {
  display: inline-flex;
  align-items: center;
  padding: 2px var(--primitives-padding-2);
  border: var(--primitives-border-width-default) solid transparent;
  border-radius: var(--primitives-border-radius-infinite);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
  line-height: var(--primitives-line-heights-xs);
  white-space: nowrap;
}

.lender-loans__badge[data-tone='info'] {
  background: var(--component-badge-info-background);
  border-color: var(--component-badge-info-border);
  color: var(--component-badge-info-text);
}

.lender-loans__badge[data-tone='error'] {
  background: var(--component-badge-error-background);
  border-color: var(--component-badge-error-border);
  color: var(--component-badge-error-text);
}

.lender-loans__badge[data-tone='success'] {
  background: var(--component-badge-success-background);
  border-color: var(--component-badge-success-border);
  color: var(--component-badge-success-text);
}

.lender-loans__table thead th.lender-loans__actions-head,
.lender-loans__table td.lender-loans__actions {
  text-align: right;
  white-space: nowrap;
}

.lender-loans__empty {
  padding: var(--primitives-padding-6) 0;
  color: var(--semantic-text-ach-color-text-secondary);
  text-align: center;
}

.lender-loans__pagination {
  padding-top: var(--primitives-padding-2);
}

@media (max-width: 1024px) {
  .lender-loans__kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .lender-loans__kpis {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lender-loans__table tbody tr {
    transition: none;
  }
}
</style>
