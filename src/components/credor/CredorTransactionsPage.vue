<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSegmentedIndicator } from '@/composables/useSegmentedIndicator'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { credorTransactionTabs, type CredorTransaction } from '@/components/credor/transactions'
import FinancingInvoiceEmptyState from '@/components/credor/financing-submit/FinancingInvoiceEmptyState.vue'
import { useAppView } from '@/composables/useAppView'
import { usePrototypeState } from '@/lib/prototype/usePrototypeState'
import { formatRupiah } from '@/lib/loan-calculator'

const props = defineProps<{ tabId: string }>()

const { goHome, openApply } = useAppView()
const { state, transactionRows } = usePrototypeState()

const activeTabId = ref(props.tabId)
const activeTab = computed(
  () => credorTransactionTabs.find((tab) => tab.id === activeTabId.value) ?? credorTransactionTabs[0],
)

const tablist = ref<HTMLElement | null>(null)
const { indicatorStyle, ready } = useSegmentedIndicator(tablist, () => activeTabId.value)

const query = ref('')
const isSubmitted = (id: string) => state.data.submittedInvoiceIds?.includes(id) ?? false

/** Same order as the homepage list: overdue first, then the tab rule. */
const sortedRows = computed(() => {
  const byTabRule = (a: CredorTransaction, b: CredorTransaction) =>
    activeTab.value.sortBy === 'longest-wait' ? b.dueOn.localeCompare(a.dueOn) : a.dueOn.localeCompare(b.dueOn)
  return [...transactionRows(activeTab.value)].sort((a, b) => {
    if (a.overdue !== b.overdue) return a.overdue ? -1 : 1
    if (a.overdue) return a.daysLeft - b.daysLeft
    return byTabRule(a, b)
  })
})

const rows = computed(() => {
  const term = query.value.trim().toLowerCase()
  if (!term) return sortedRows.value
  return sortedRows.value.filter((row) => `${row.counterparty} ${row.invoiceNumber}`.toLowerCase().includes(term))
})

const initials = (name: string) =>
  name
    .split(' ')
    .filter((word) => !/^(pt|cv|ud|tb|co)$/i.test(word))
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()

const tabOrder = credorTransactionTabs.map((tab) => tab.id)

/** Arrow keys move between the tabs, following the ARIA tabs pattern. */
function onTabKeydown(event: KeyboardEvent) {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
  event.preventDefault()
  const index = tabOrder.indexOf(activeTabId.value)
  const step = event.key === 'ArrowRight' ? 1 : tabOrder.length - 1
  activeTabId.value = tabOrder[(index + step) % tabOrder.length]
  document.getElementById(`all-transactions-tab-${activeTabId.value}`)?.focus()
}
</script>

<template>
  <div class="all-transactions">
    <div class="all-transactions__header">
      <button type="button" class="all-transactions__back" @click="goHome('transactions-see-all')">
        <span class="all-transactions__back-icon" aria-hidden="true"></span>
        Back to Home
      </button>
      <h1 id="all-transactions-title" class="all-transactions__title">All transactions</h1>
      <p class="all-transactions__subtitle">Transactions recorded in Achilles that you can finance.</p>
    </div>

    <section class="all-transactions__card" aria-labelledby="all-transactions-title">
      <div class="all-transactions__toolbar">
        <div
          ref="tablist"
          class="all-transactions__tabs"
          role="tablist"
          aria-label="Transaction type"
          @keydown="onTabKeydown"
        >
          <span
            class="all-transactions__tab-indicator"
            :class="{ 'all-transactions__tab-indicator--animated': ready }"
            aria-hidden="true"
            :style="indicatorStyle"
          ></span>
          <button
            v-for="tab in credorTransactionTabs"
            :id="`all-transactions-tab-${tab.id}`"
            :key="tab.id"
            type="button"
            role="tab"
            class="all-transactions__tab"
            :class="{ 'all-transactions__tab--active': tab.id === activeTabId }"
            :aria-selected="tab.id === activeTabId"
            :tabindex="tab.id === activeTabId ? 0 : -1"
            aria-controls="all-transactions-panel"
            @click="activeTabId = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="all-transactions__filters">
          <label class="all-transactions__search">
            <span class="all-transactions__sr">Search transactions</span>
            <span class="all-transactions__search-icon" aria-hidden="true"></span>
            <Input v-model="query" type="search" placeholder="Search name or number" class="all-transactions__input" />
          </label>
        </div>
      </div>

      <div
        id="all-transactions-panel"
        class="all-transactions__scroll"
        role="tabpanel"
        :aria-labelledby="`all-transactions-tab-${activeTabId}`"
      >
        <FinancingInvoiceEmptyState v-if="sortedRows.length === 0" :item-label="activeTab.itemLabel" />
        <table v-else class="all-transactions__table">
          <caption class="all-transactions__sr">{{ activeTab.label }}</caption>
          <thead>
            <tr>
              <th scope="col">{{ activeTab.counterpartyLabel }}</th>
              <th scope="col">{{ activeTab.itemLabel === 'bills' ? 'Bill number' : 'Invoice number' }}</th>
              <th scope="col">Due date</th>
              <th scope="col" class="all-transactions__num">Amount</th>
              <th scope="col"><span class="all-transactions__sr">Action</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id">
              <td>
                <div class="all-transactions__company">
                  <Avatar
                    :initials="initials(row.counterparty)"
                    verified
                    variant="inverse"
                    :label="`${row.counterparty}, verified partner`"
                  />
                  <span class="all-transactions__name">{{ row.counterparty }}</span>
                </div>
              </td>
              <td class="all-transactions__tabular">{{ row.invoiceNumber }}</td>
              <td>
                <span class="all-transactions__date">{{ row.dueDate }}</span>
                <span
                  class="all-transactions__note"
                  :class="{ 'all-transactions__note--overdue': row.overdue }"
                >
                  {{ row.dueNote }}
                </span>
              </td>
              <td class="all-transactions__num all-transactions__tabular">{{ formatRupiah(row.amount) }}</td>
              <td class="all-transactions__action">
                <span v-if="isSubmitted(row.id)" class="all-transactions__submitted">Submitted</span>
                <Button
                  v-else
                  variant="outline"
                  color="neutral"
                  size="small"
                  type="button"
                  class="all-transactions__button"
                  :aria-label="`${activeTab.actionLabel}: ${row.invoiceNumber}`"
                  @click="openApply({ kind: 'invoice', tabId: activeTab.id, rowId: row.id })"
                >
                  {{ activeTab.actionLabel }}
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="sortedRows.length > 0 && rows.length === 0" class="all-transactions__empty" role="status">
          <p>No transactions match your search.</p>
          <Button
            variant="outline"
            color="neutral"
            size="small"
            type="button"
            class="all-transactions__button"
            @click="query = ''"
          >
            Clear search
          </Button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.all-transactions {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--primitives-padding-6);
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-body), sans-serif;
}

.all-transactions__header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--primitives-padding-1);
}

.all-transactions__back {
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

.all-transactions__back:hover {
  color: var(--semantic-text-ach-color-text-default);
}

.all-transactions__back:focus-visible,
.all-transactions__tab:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: var(--primitives-border-width-2);
}

.all-transactions__back-icon {
  width: 16px;
  height: 16px;
  background: currentColor;
  mask: url('/icons/ui-actions/arrow-back.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/arrow-back.svg') center / contain no-repeat;
}

.all-transactions__title {
  margin: 0;
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-2xl);
  font-weight: 700;
  line-height: var(--primitives-line-heights-2xl);
}

.all-transactions__subtitle {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.all-transactions__card {
  min-width: 0;
  border: var(--primitives-border-width-default) solid var(--component-card-border);
  border-radius: var(--primitives-border-radius-lg);
  background: var(--component-card-background);
}

.all-transactions__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-3) var(--primitives-padding-4);
  padding: var(--primitives-padding-3) var(--primitives-padding-4);
  border-bottom: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
}

.all-transactions__tabs {
  position: relative;
  display: inline-flex;
  flex: 0 0 auto;
  padding: var(--primitives-padding-1);
  border-radius: var(--primitives-border-radius-md);
  background: var(--semantic-bg-ach-color-bg-surface-secondary);
}

.all-transactions__tab {
  position: relative;
  z-index: 1;
  min-height: 28px;
  padding: 0 var(--primitives-padding-2);
  border: 0;
  border-radius: var(--primitives-border-radius-sm);
  background: none;
  color: var(--component-tabs-line-item-text-inactive);
  cursor: pointer;
  font-family: inherit;
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-xs);
  white-space: nowrap;
}

.all-transactions__tab:hover:not(.all-transactions__tab--active) {
  background: var(--component-tabs-segmented-item-background-hover);
}

.all-transactions__tab--active {
  color: var(--component-tabs-segmented-item-text);
}

.all-transactions__tab-indicator {
  position: absolute;
  top: var(--primitives-padding-1);
  bottom: var(--primitives-padding-1);
  left: 0;
  border-radius: var(--primitives-border-radius-sm);
  background: var(--component-tabs-segmented-item-background-active);
  box-shadow:
    calc(var(--primitives-shadows-sm-shadow-1-x) * 1px)
      calc(var(--primitives-shadows-sm-shadow-1-y) * 1px)
      calc(var(--primitives-shadows-sm-shadow-1-blur) * 1px)
      var(--primitives-shadows-sm-color),
    calc(var(--primitives-shadows-sm-shadow-2-x) * 1px)
      calc(var(--primitives-shadows-sm-shadow-2-y) * 1px)
      calc(var(--primitives-shadows-sm-shadow-2-blur) * 1px)
      var(--primitives-shadows-sm-color);
  pointer-events: none;
}

.all-transactions__tab-indicator--animated {
  transition:
    transform var(--component-tabs-indicator-duration) var(--component-tabs-indicator-easing),
    width var(--component-tabs-indicator-duration) var(--component-tabs-indicator-easing);
}

@media (prefers-reduced-motion: reduce) {
  .all-transactions__tab-indicator--animated {
    transition: none;
  }
}


.all-transactions__filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--primitives-padding-2);
}

.all-transactions__search {
  position: relative;
  display: block;
}

.all-transactions__search-icon {
  position: absolute;
  top: 50%;
  left: var(--primitives-padding-3);
  width: 16px;
  height: 16px;
  background: var(--semantic-icon-ach-color-icon-default);
  pointer-events: none;
  transform: translateY(-50%);
}

.all-transactions__search-icon {
  mask: url('/icons/ui-actions/search.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/search.svg') center / contain no-repeat;
}

.all-transactions__search :deep(.ach-input) {
  width: 240px;
  padding-left: 36px;
  border-radius: var(--primitives-border-radius-infinite);
}

.all-transactions__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-8) var(--primitives-padding-4);
  border-top: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
}

.all-transactions__empty p {
  margin: 0;
}

.all-transactions__scroll {
  overflow-x: auto;
}

.all-transactions__table {
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.all-transactions__table th {
  padding: var(--primitives-padding-3) var(--primitives-padding-4);
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 500;
  line-height: var(--primitives-line-heights-2xs);
  text-align: left;
  white-space: nowrap;
}

.all-transactions__table td {
  padding: var(--primitives-padding-3) var(--primitives-padding-4);
  border-top: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
  vertical-align: middle;
}

.all-transactions__table tbody tr:hover {
  background: var(--semantic-bg-ach-color-bg-surface-hover);
}

.all-transactions__table th:first-child,
.all-transactions__table td:first-child {
  padding-left: var(--primitives-padding-6);
}

.all-transactions__table th:last-child,
.all-transactions__table td:last-child {
  padding-right: var(--primitives-padding-6);
}

th.all-transactions__num,
td.all-transactions__num {
  text-align: right;
}

.all-transactions__tabular {
  font-variant-numeric: tabular-nums;
}

.all-transactions__company {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-3);
}

.all-transactions__name {
  font-weight: 500;
}

.all-transactions__date,
.all-transactions__note {
  display: block;
}

.all-transactions__note {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}

.all-transactions__note--overdue {
  color: var(--semantic-text-error-ach-color-text-error);
}

.all-transactions__action {
  text-align: right;
  white-space: nowrap;
}

.all-transactions__submitted {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
}

.all-transactions__button:deep(.ach-button),
.all-transactions__button.ach-button {
  border-radius: var(--primitives-border-radius-infinite);
}

.all-transactions__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

@media (max-width: 640px) {
  .all-transactions__search :deep(.ach-input) {
    width: 100%;
  }

  .all-transactions__search,
  .all-transactions__filters {
    flex: 1 1 100%;
  }
}
</style>
