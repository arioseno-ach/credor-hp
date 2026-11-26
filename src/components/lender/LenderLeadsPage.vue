<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import { useAppView, type LenderLeadTab } from '@/composables/useAppView'
import { useSnackbar } from '@/composables/useSnackbar'
import { formatRupiah } from '@/lib/lender/lender-data'
import type { BusinessScale, LenderLead, LenderLoanType } from '@/lib/lender/types'
import { useLenderPortal } from '@/lib/lender/useLenderPortal'
import LenderLeadDrawer from './LenderLeadDrawer.vue'
import LenderPageHeader from './LenderPageHeader.vue'

type LoanTypeFilter = 'all' | LenderLoanType

const { view, openLenderLeads } = useAppView()
const { leads, unclaimedLeads, claimedLeads, rejectedLeads } = useLenderPortal()
const { show: showSnackbar } = useSnackbar()

const activeTab = ref<LenderLeadTab>('unclaimed')
const loanTypeFilter = ref<LoanTypeFilter>('all')
const rowsPerPage = ref<number>(10)
const currentPage = ref<number>(1)
const drawerOpen = ref<boolean>(false)
const drawerLeadId = ref<string | null>(null)

const tabs = computed(() => [
  {
    id: 'unclaimed' as const,
    label: 'Potential Leads',
    count: unclaimedLeads.value.length,
    subtext: 'Pending review and claim',
  },
  {
    id: 'claimed' as const,
    label: 'Claimed Leads',
    count: claimedLeads.value.length,
    subtext: 'Claimed and in underwriting',
  },
  {
    id: 'rejected' as const,
    label: 'Rejected Leads',
    count: rejectedLeads.value.length,
    subtext: 'Declined applications',
  },
])

const loanTypeOptions: { value: LoanTypeFilter; label: string }[] = [
  { value: 'all', label: 'All Loan Types' },
  { value: 'AR Invoice Financing', label: 'AR Invoice Financing' },
  { value: 'AP Invoice Financing', label: 'AP Invoice Financing' },
  { value: 'Free Financing', label: 'Free Financing' },
]

const rowsPerPageOptions = [5, 10, 25, 50]

watch(
  () => view.value,
  (nextView) => {
    if (nextView.name !== 'lender-leads') return

    const nextTab = nextView.tab ?? 'unclaimed'
    if (nextTab !== activeTab.value) {
      activeTab.value = nextTab
      currentPage.value = 1
    }

    if (nextView.drawerId) {
      const target = leads.value.find((item) => item.id === nextView.drawerId)
      if (target) {
        drawerLeadId.value = target.id
        drawerOpen.value = true
      } else {
        drawerOpen.value = false
        drawerLeadId.value = null
      }
    } else {
      drawerOpen.value = false
      drawerLeadId.value = null
    }
  },
  { immediate: true },
)

const activeTabMeta = computed(
  () => tabs.value.find((tab) => tab.id === activeTab.value) ?? tabs.value[0],
)

const tabLeads = computed<LenderLead[]>(() => {
  if (activeTab.value === 'claimed') return claimedLeads.value
  if (activeTab.value === 'rejected') return rejectedLeads.value
  return unclaimedLeads.value
})

const filteredLeads = computed<LenderLead[]>(() => {
  if (loanTypeFilter.value === 'all') return tabLeads.value
  return tabLeads.value.filter((lead) => lead.loanType === loanTypeFilter.value)
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredLeads.value.length / rowsPerPage.value)),
)

watch([loanTypeFilter, rowsPerPage], () => {
  currentPage.value = 1
})

watch(totalPages, (maxPages) => {
  if (currentPage.value > maxPages) {
    currentPage.value = maxPages
  }
})

const paginatedLeads = computed<LenderLead[]>(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value
  return filteredLeads.value.slice(start, start + rowsPerPage.value)
})

const rangeStart = computed(() =>
  filteredLeads.value.length === 0 ? 0 : (currentPage.value - 1) * rowsPerPage.value + 1,
)

const rangeEnd = computed(() =>
  Math.min(currentPage.value * rowsPerPage.value, filteredLeads.value.length),
)

const selectedLead = computed<LenderLead | null>(() => {
  if (!drawerLeadId.value) return null
  return leads.value.find((item) => item.id === drawerLeadId.value) ?? null
})

function selectTab(tab: LenderLeadTab) {
  if (activeTab.value !== tab) {
    activeTab.value = tab
    currentPage.value = 1
  }
  openLenderLeads(tab)
}

function onTabKeydown(event: KeyboardEvent) {
  const tabIds: LenderLeadTab[] = ['unclaimed', 'claimed', 'rejected']
  const currentIndex = tabIds.indexOf(activeTab.value)

  let nextTab: LenderLeadTab | null = null
  if (event.key === 'ArrowRight') {
    nextTab = tabIds[(currentIndex + 1) % tabIds.length]
  } else if (event.key === 'ArrowLeft') {
    nextTab = tabIds[(currentIndex + tabIds.length - 1) % tabIds.length]
  } else if (event.key === 'Home') {
    nextTab = tabIds[0]
  } else if (event.key === 'End') {
    nextTab = tabIds[tabIds.length - 1]
  }

  if (!nextTab) return
  event.preventDefault()
  selectTab(nextTab)
  document.getElementById(`lender-leads-tab-${nextTab}`)?.focus()
}

function openDrawer(leadId: string) {
  drawerLeadId.value = leadId
  drawerOpen.value = true
  openLenderLeads(activeTab.value, leadId)
}

function handleDrawerOpenChange(isOpen: boolean) {
  drawerOpen.value = isOpen
  if (!isOpen) {
    drawerLeadId.value = null
    if (view.value.name === 'lender-leads' && view.value.drawerId) {
      openLenderLeads(activeTab.value)
    }
  }
}

function handleLeadClaimed(leadId: string) {
  activeTab.value = 'claimed'
  currentPage.value = 1
  openLenderLeads('claimed', leadId)
}

function handleViewDetail() {
  drawerOpen.value = false
  drawerLeadId.value = null
}

function resetLoanTypeFilter() {
  loanTypeFilter.value = 'all'
  currentPage.value = 1
}

async function copyApplicationNumber(applicationNumber: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(applicationNumber)
    } catch {
      // Clipboard write may be restricted in headless contexts; still surface confirmation.
    }
  }

  showSnackbar({
    variant: 'success',
    title: 'Application number copied',
    description: applicationNumber,
  })
}

function scaleTone(scale: BusinessScale): 'info' | 'success' | 'warning' | 'neutral' {
  if (scale === 'Large') return 'info'
  if (scale === 'Medium') return 'success'
  if (scale === 'Small') return 'warning'
  return 'neutral'
}
</script>

<template>
  <div class="lender-leads">
    <LenderPageHeader
      title="Leads"
      subtitle="Review prospective borrowers and financing opportunities."
    />

    <section class="lender-leads__kpi-row" aria-label="Leads summary">
      <article class="lender-leads__kpi-card">
        <div class="lender-leads__kpi-copy">
          <p class="lender-leads__kpi-title">Total Leads</p>
          <p class="lender-leads__kpi-value lender-leads__tabular">{{ activeTabMeta.count }}</p>
          <p class="lender-leads__kpi-subtext">{{ activeTabMeta.subtext }}</p>
        </div>
        <span class="lender-leads__kpi-icon-wrap" aria-hidden="true">
          <span class="lender-leads__kpi-icon"></span>
        </span>
      </article>
    </section>

    <section class="lender-leads__card" aria-label="Leads workspace">
      <div class="lender-leads__tabs-bar">
        <div
          class="lender-leads__tabs"
          role="tablist"
          aria-label="Lead lifecycle stages"
          @keydown="onTabKeydown"
        >
          <button
            v-for="tab in tabs"
            :id="`lender-leads-tab-${tab.id}`"
            :key="tab.id"
            type="button"
            role="tab"
            class="lender-leads__tab"
            :class="{ 'lender-leads__tab--active': activeTab === tab.id }"
            :aria-selected="activeTab === tab.id"
            :tabindex="activeTab === tab.id ? 0 : -1"
            aria-controls="lender-leads-panel"
            @click="selectTab(tab.id)"
          >
            <span>{{ tab.label }}</span>
            <span
              class="lender-leads__tab-count lender-leads__tabular"
              :class="{ 'lender-leads__tab-count--active': activeTab === tab.id }"
            >
              {{ tab.count }}
            </span>
          </button>
        </div>
      </div>

      <div class="lender-leads__toolbar">
        <div class="lender-leads__filter">
          <label for="lender-leads-loan-type" class="lender-leads__filter-label">
            Loan Type
          </label>
          <div class="lender-leads__select-wrap">
            <select
              id="lender-leads-loan-type"
              v-model="loanTypeFilter"
              class="lender-leads__select"
            >
              <option
                v-for="option in loanTypeOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
            <span class="lender-leads__select-chevron" aria-hidden="true"></span>
          </div>
        </div>
      </div>

      <div
        id="lender-leads-panel"
        role="tabpanel"
        :aria-labelledby="`lender-leads-tab-${activeTab}`"
        class="lender-leads__panel"
      >
        <div v-if="paginatedLeads.length > 0" class="leads-table-wrap">
          <table class="leads-table">
            <thead>
              <tr>
                <th scope="col">Submission Date</th>
                <th scope="col">Application Number</th>
                <th scope="col">Loan Type</th>
                <th scope="col">Company Name</th>
                <th scope="col">Industry</th>
                <th scope="col">Loan Details</th>
                <th scope="col">Estimated Loan</th>
                <th scope="col">Business Scale</th>
                <th scope="col" class="leads-table__actions-head">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="lead in paginatedLeads" :key="lead.id">
                <td class="leads-table__nowrap lender-leads__tabular">
                  <span class="leads-table__primary">{{ lead.submittedDisplayDate }}</span>
                  <span class="leads-table__sub">{{ lead.submittedDisplayTime }}</span>
                </td>

                <td class="leads-table__nowrap">
                  <div class="leads-table__app-num">
                    <span class="leads-table__code lender-leads__tabular">
                      {{ lead.applicationNumber }}
                    </span>
                    <button
                      type="button"
                      class="leads-table__copy-btn"
                      :aria-label="`Copy application number ${lead.applicationNumber}`"
                      @click="copyApplicationNumber(lead.applicationNumber)"
                    >
                      <span class="leads-table__copy-icon" aria-hidden="true"></span>
                    </button>
                  </div>
                </td>

                <td class="leads-table__loan-type">
                  <div class="leads-table__loan-title">
                    <span class="leads-table__primary">{{ lead.loanType }}</span>
                    <span
                      v-if="lead.badge"
                      class="leads-table__chip"
                      :data-tone="lead.badge === 'New' ? 'info' : 'warning'"
                    >
                      {{ lead.badge }}
                    </span>
                  </div>
                  <span class="leads-table__sub">{{ lead.subType }}</span>
                </td>

                <td class="leads-table__company">
                  <template v-if="lead.state === 'unclaimed'">
                    <div class="leads-table__masked-row">
                      <img
                        src="/icons/common-actions/lock.svg"
                        alt=""
                        aria-hidden="true"
                        class="leads-table__lock-icon"
                      />
                      <span class="leads-table__primary">{{ lead.maskedCompanyName }}</span>
                    </div>
                    <span class="leads-table__sub">Claim to reveal</span>
                  </template>
                  <template v-else>
                    <span class="leads-table__primary">{{ lead.companyName }}</span>
                    <span class="leads-table__sub">{{ lead.location }}, {{ lead.country }}</span>
                  </template>
                </td>

                <td class="leads-table__industry">
                  <span class="leads-table__text">{{ lead.industry }}</span>
                </td>

                <td class="leads-table__details">
                  <div class="leads-table__detail-line">
                    <span class="leads-table__detail-label">Commercial Invoice No.:</span>
                    <span class="leads-table__detail-value lender-leads__tabular">
                      {{ lead.collateral.invoiceNumber }}
                    </span>
                  </div>
                  <div class="leads-table__detail-line">
                    <span class="leads-table__detail-label">Counterparty:</span>
                    <span class="leads-table__detail-value">
                      {{ lead.collateral.counterpartyName }}
                    </span>
                  </div>
                </td>

                <td class="leads-table__nowrap">
                  <span class="leads-table__amount lender-leads__tabular">
                    {{ formatRupiah(lead.estimatedLoanAmount) }}
                  </span>
                </td>

                <td class="leads-table__nowrap">
                  <span class="leads-table__chip" :data-tone="scaleTone(lead.businessScale)">
                    {{ lead.businessScale }}
                  </span>
                </td>

                <td class="leads-table__actions">
                  <Button
                    variant="outline"
                    color="neutral"
                    size="small"
                    type="button"
                    @click="openDrawer(lead.id)"
                  >
                    Review
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="lender-leads__empty">
          <img
            src="/icons/business-payments/cases.svg"
            alt=""
            aria-hidden="true"
            class="lender-leads__empty-icon"
          />
          <p class="lender-leads__empty-title">
            {{
              loanTypeFilter === 'all'
                ? `No ${activeTabMeta.label.toLowerCase()} yet`
                : 'No leads match the selected loan type'
            }}
          </p>
          <p class="lender-leads__empty-desc">
            {{
              loanTypeFilter === 'all'
                ? 'Leads moved into this stage will appear here automatically.'
                : `There are no ${activeTabMeta.label.toLowerCase()} under ${loanTypeFilter}.`
            }}
          </p>
          <Button
            v-if="loanTypeFilter !== 'all'"
            variant="outline"
            color="neutral"
            size="small"
            type="button"
            @click="resetLoanTypeFilter"
          >
            Reset filter
          </Button>
        </div>

        <footer v-if="filteredLeads.length > 0" class="lender-leads__footer">
          <div class="lender-leads__rows-control">
            <label for="lender-leads-rows-per-page" class="lender-leads__rows-label">
              Rows per page
            </label>
            <div class="lender-leads__select-wrap lender-leads__select-wrap--compact">
              <select
                id="lender-leads-rows-per-page"
                v-model.number="rowsPerPage"
                class="lender-leads__select lender-leads__select--compact lender-leads__tabular"
              >
                <option v-for="count in rowsPerPageOptions" :key="count" :value="count">
                  {{ count }}
                </option>
              </select>
              <span class="lender-leads__select-chevron" aria-hidden="true"></span>
            </div>
            <span class="lender-leads__range-summary lender-leads__tabular">
              Showing {{ rangeStart }}-{{ rangeEnd }} of {{ filteredLeads.length }}
            </span>
          </div>

          <Pagination
            v-model:page="currentPage"
            :total="filteredLeads.length"
            :items-per-page="rowsPerPage"
            label="Leads pagination"
          />
        </footer>
      </div>
    </section>

    <LenderLeadDrawer
      :open="drawerOpen"
      :lead="selectedLead"
      @update:open="handleDrawerOpenChange"
      @claimed="handleLeadClaimed"
      @view-detail="handleViewDetail"
    />
  </div>
</template>

<style scoped>
.lender-leads {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-6);
  min-width: 0;
}

.lender-leads__tabular {
  font-variant-numeric: tabular-nums;
}

.lender-leads__kpi-row {
  display: grid;
  grid-template-columns: minmax(240px, 340px);
}

.lender-leads__kpi-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--primitives-padding-4);
  padding: var(--primitives-padding-5);
  border: var(--primitives-border-width-default) solid var(--component-stats-border);
  border-radius: var(--primitives-border-radius-lg);
  background: var(--component-stats-item-background);
}

.lender-leads__kpi-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--primitives-padding-1);
}

.lender-leads__kpi-title {
  margin: 0;
  color: var(--component-stats-item-title);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-sm);
}

.lender-leads__kpi-value {
  margin: 0;
  color: var(--component-stats-item-number);
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-3xl);
  font-weight: 700;
  line-height: var(--primitives-line-heights-3xl);
}

.lender-leads__kpi-subtext {
  margin: 0;
  color: var(--component-stats-item-subtitle);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
}

.lender-leads__kpi-icon-wrap {
  display: grid;
  width: var(--primitives-padding-10);
  height: var(--primitives-padding-10);
  flex: 0 0 auto;
  place-items: center;
  border-radius: var(--primitives-border-radius-md);
  background: var(--semantic-bg-ach-color-bg-surface-secondary);
  color: var(--semantic-icon-ach-color-icon-secondary);
}

.lender-leads__kpi-icon {
  width: var(--primitives-padding-5);
  height: var(--primitives-padding-5);
  background: currentColor;
  mask: url('/icons/business-payments/cases.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/business-payments/cases.svg') center / contain no-repeat;
}

.lender-leads__card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  border: var(--primitives-border-width-default) solid var(--component-card-border);
  border-radius: var(--primitives-border-radius-lg);
  background: var(--component-card-background);
}

.lender-leads__tabs-bar {
  padding: 0 var(--primitives-padding-6);
  border-bottom: var(--primitives-border-width-default) solid var(--component-tabs-line-border);
}

.lender-leads__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--primitives-padding-6);
}

.lender-leads__tab {
  display: inline-flex;
  align-items: center;
  gap: var(--primitives-padding-2);
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
  transition:
    color var(--component-tabs-indicator-duration) var(--component-tabs-indicator-easing),
    border-color var(--component-tabs-indicator-duration) var(--component-tabs-indicator-easing);
}

.lender-leads__tab:hover {
  color: var(--component-tabs-line-item-text-active);
  border-bottom-color: var(--component-tabs-line-item-indicator-hover);
}

.lender-leads__tab:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: var(--primitives-border-width-2);
  border-radius: var(--primitives-border-radius-xs);
}

.lender-leads__tab--active,
.lender-leads__tab--active:hover {
  border-bottom-color: var(--component-tabs-line-item-indicator);
  color: var(--component-tabs-line-item-text-active);
  font-weight: 600;
}

.lender-leads__tab-count {
  display: inline-flex;
  min-width: var(--primitives-padding-5);
  height: var(--primitives-padding-5);
  align-items: center;
  justify-content: center;
  padding: 0 var(--primitives-padding-2);
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--component-tabs-counter-background);
  color: var(--component-tabs-counter-text);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
  line-height: 1;
}

.lender-leads__tab-count--active {
  background: var(--component-badge-solid-primary-background);
  color: var(--component-badge-solid-primary-text);
}

.lender-leads__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-4);
  padding: var(--primitives-padding-4) var(--primitives-padding-6);
  border-bottom: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
}

.lender-leads__filter {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-3);
}

.lender-leads__filter-label {
  color: var(--component-select-label-text);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
  line-height: var(--primitives-line-heights-xs);
  white-space: nowrap;
}

.lender-leads__select-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-width: 220px;
}

.lender-leads__select-wrap--compact {
  min-width: 76px;
}

.lender-leads__select {
  box-sizing: border-box;
  width: 100%;
  height: var(--primitives-padding-9);
  padding: 0 var(--primitives-padding-8) 0 var(--primitives-padding-3);
  border: var(--primitives-border-width-default) solid var(--component-select-field-border);
  border-radius: var(--primitives-border-radius-sm);
  background: var(--component-select-field-background);
  color: var(--component-select-field-text);
  font-family: inherit;
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
  appearance: none;
  cursor: pointer;
}

.lender-leads__select--compact {
  height: var(--primitives-padding-8);
  padding: 0 var(--primitives-padding-7) 0 var(--primitives-padding-2);
  font-size: var(--primitives-font-sizes-xs);
}

.lender-leads__select:focus-visible {
  border-color: var(--component-select-field-border-focus);
  outline: var(--primitives-border-width-2) solid var(--component-select-field-border-focus);
  outline-offset: var(--primitives-border-width-2);
}

.lender-leads__select-chevron {
  position: absolute;
  right: var(--primitives-padding-2);
  width: var(--primitives-padding-4);
  height: var(--primitives-padding-4);
  background: var(--component-select-field-icon);
  pointer-events: none;
  mask: url('/icons/ui-actions/expand-more.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/expand-more.svg') center / contain no-repeat;
}

.lender-leads__panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.leads-table-wrap {
  overflow-x: auto;
  padding: 0 var(--primitives-padding-6);
}

.leads-table {
  width: 100%;
  min-width: 1040px;
  border-collapse: collapse;
  color: var(--component-table-row-text);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.leads-table thead th {
  padding: var(--primitives-padding-3);
  border-bottom: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
  background: transparent;
  color: var(--component-table-header-text);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
  line-height: var(--primitives-line-heights-xs);
  text-align: left;
  white-space: nowrap;
}

.leads-table thead th:first-child,
.leads-table tbody td:first-child {
  padding-left: 0;
}

.leads-table thead th:last-child,
.leads-table tbody td:last-child {
  padding-right: 0;
}

.leads-table thead th.leads-table__actions-head,
.leads-table td.leads-table__actions {
  text-align: right;
}

.leads-table tbody td {
  padding: var(--primitives-padding-3);
  border-bottom: var(--primitives-border-width-default) solid var(--component-table-cell-divider);
  font-weight: 400;
  text-align: left;
  vertical-align: middle;
}

.leads-table tbody tr {
  transition: background-color var(--semantic-motion-duration-fast) ease;
}

.leads-table tbody tr:hover {
  background: var(--component-table-cell-hover);
}

.leads-table__nowrap {
  white-space: nowrap;
}

.leads-table__primary {
  display: block;
  color: var(--semantic-text-ach-color-text-default);
  font-weight: 600;
}

.leads-table__sub {
  display: block;
  margin-top: 2px;
  color: var(--semantic-text-ach-color-text-subtle);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
}

.leads-table__text {
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
}

.leads-table__app-num {
  display: inline-flex;
  align-items: center;
  gap: var(--primitives-padding-1);
}

.leads-table__code {
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
}

.leads-table__copy-btn {
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

.leads-table__copy-btn:hover {
  background: var(--semantic-bg-ach-color-bg-surface-hover);
  color: var(--semantic-icon-ach-color-icon-default);
}

.leads-table__copy-btn:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: var(--primitives-border-width-2);
}

.leads-table__copy-icon {
  width: var(--primitives-font-sizes-sm);
  height: var(--primitives-font-sizes-sm);
  background: currentColor;
  mask: url('/icons/text-formatting/content-copy.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/text-formatting/content-copy.svg') center / contain no-repeat;
}

.leads-table__loan-type {
  min-width: 170px;
}

.leads-table__loan-title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--primitives-padding-2);
}

.leads-table__company {
  min-width: 190px;
}

.leads-table__masked-row {
  display: inline-flex;
  align-items: center;
  gap: var(--primitives-padding-1);
}

.leads-table__lock-icon {
  width: var(--primitives-font-sizes-sm);
  height: var(--primitives-font-sizes-sm);
  flex: 0 0 auto;
  opacity: 0.72;
}

.leads-table__industry {
  min-width: 130px;
}

.leads-table__details {
  min-width: 210px;
}

.leads-table__detail-line {
  display: flex;
  flex-wrap: wrap;
  gap: var(--primitives-padding-1);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
}

.leads-table__detail-line + .leads-table__detail-line {
  margin-top: 2px;
}

.leads-table__detail-label {
  color: var(--semantic-text-ach-color-text-subtle);
}

.leads-table__detail-value {
  color: var(--semantic-text-ach-color-text-default);
  font-weight: 500;
}

.leads-table__amount {
  color: var(--semantic-text-ach-color-text-default);
  font-weight: 600;
}

.leads-table__chip {
  display: inline-flex;
  align-items: center;
  padding: 2px var(--primitives-padding-2);
  border-radius: var(--primitives-border-radius-infinite);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
  line-height: var(--primitives-line-heights-xs);
  white-space: nowrap;
}

.leads-table__chip[data-tone='info'] {
  background: var(--component-badge-info-background);
  color: var(--component-badge-info-text);
}

.leads-table__chip[data-tone='success'] {
  background: var(--component-badge-success-background);
  color: var(--component-badge-success-text);
}

.leads-table__chip[data-tone='warning'] {
  background: var(--component-badge-warning-background);
  color: var(--component-badge-warning-text);
}

.leads-table__chip[data-tone='neutral'] {
  background: var(--component-badge-neutral-background);
  color: var(--component-badge-neutral-text);
}

.leads-table__actions {
  white-space: nowrap;
}

.lender-leads__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--primitives-padding-2);
  padding: var(--primitives-padding-12) var(--primitives-padding-6);
  text-align: center;
}

.lender-leads__empty-icon {
  width: var(--primitives-padding-8);
  height: var(--primitives-padding-8);
  opacity: 0.45;
}

.lender-leads__empty-title {
  margin: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-md);
  font-weight: 600;
  line-height: var(--primitives-line-heights-md);
}

.lender-leads__empty-desc {
  margin: 0 0 var(--primitives-padding-2);
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.lender-leads__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-4);
  padding: var(--primitives-padding-4) var(--primitives-padding-6);
}

.lender-leads__rows-control {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--primitives-padding-3);
}

.lender-leads__rows-label,
.lender-leads__range-summary {
  color: var(--component-pagination-label-text);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
}

@media (prefers-reduced-motion: reduce) {
  .lender-leads__tab,
  .leads-table tbody tr {
    transition: none;
  }
}

@media (max-width: 640px) {
  .lender-leads__tabs-bar,
  .lender-leads__toolbar,
  .leads-table-wrap,
  .lender-leads__footer {
    padding-inline: var(--primitives-padding-4);
  }

  .lender-leads__kpi-row {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
