<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { credorTransactionTabs, type CredorLineItem } from '@/components/credor/transactions'

const activeTabId = ref(credorTransactionTabs[0].id)

const activeTab = computed(
  () => credorTransactionTabs.find((tab) => tab.id === activeTabId.value) ?? credorTransactionTabs[0],
)

const readyCount = computed(() => activeTab.value.rows.length)

const totalAmount = computed(() =>
  activeTab.value.rows.reduce((total, row) => total + row.amount, 0),
)

/** Rows follow the tab rule: the longest cash-out period first for sales,
 *  the nearest upcoming due date first for purchases. */
const sortedRows = computed(() => {
  const rows = [...activeTab.value.rows]

  return activeTab.value.sortBy === 'longest-wait'
    ? rows.sort((a, b) => b.dueOn.localeCompare(a.dueOn))
    : rows.sort((a, b) => a.dueOn.localeCompare(b.dueOn))
})

/** Longest cash-out period for sales, nearest upcoming due date for purchases. */
const daysUntilDue = computed(() => {
  const upcoming = activeTab.value.rows
    .map((row) => row.daysLeft)
    .filter((days) => days > 0)

  if (upcoming.length === 0) return 0

  return activeTab.value.sortBy === 'longest-wait'
    ? Math.max(...upcoming)
    : Math.min(...upcoming)
})

const subtitle = computed(() =>
  activeTab.value.subtitle({
    days: daysUntilDue.value,
    amount: formatAmount(totalAmount.value),
    count: readyCount.value,
  }),
)

const formatAmount = (amount: number) => `Rp${amount.toLocaleString('id-ID')}`

const initials = (name: string) => {
  const words = name
    .split(' ')
    .filter((word) => !/^(pt|cv|ud|tb|co)$/i.test(word))
    .slice(0, 2)

  return words.map((word) => word[0]).join('').toUpperCase()
}

type VisibleLineItem = CredorLineItem | { overflow: number }

/** At most two rows: the first line item plus a "+n item" summary for the rest. */
const visibleLineItems = (items: CredorLineItem[]): VisibleLineItem[] => {
  if (items.length <= 2) return items
  return [items[0], { overflow: items.length - 1 }]
}
</script>

<template>
  <section class="transactions" aria-labelledby="transactions-title">
    <div class="transactions__heading">
      <div class="transactions__intro">
        <h2 id="transactions-title">Financing based on your transactions</h2>
        <p>
          {{ subtitle.lead }} <strong>{{ subtitle.days }}</strong>{{ subtitle.middle }}
          <strong>{{ subtitle.amount }}</strong> {{ subtitle.tail }}
        </p>
      </div>

      <div class="transactions__tabs" role="tablist" aria-label="Transaction type">
        <button
          v-for="tab in credorTransactionTabs"
          :id="'transactions-tab-' + tab.id"
          :key="tab.id"
          type="button"
          role="tab"
          class="transactions__tab"
          :class="{ 'transactions__tab--active': tab.id === activeTabId }"
          :aria-selected="tab.id === activeTabId"
          :tabindex="tab.id === activeTabId ? 0 : -1"
          @click="activeTabId = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div
      class="transactions__list"
      role="tabpanel"
      :aria-labelledby="'transactions-tab-' + activeTabId"
    >
      <article v-for="row in sortedRows" :key="row.id" class="transactions-card">
        <Avatar :initials="initials(row.counterparty)" :label="row.counterparty" />

        <div class="transactions-card__identity">
          <p class="transactions-card__counterparty">{{ row.counterparty }}</p>
          <a class="transactions-card__invoice" href="#">{{ row.invoiceNumber }}</a>
          <p class="transactions-card__due">
            <span>{{ row.dueDate }}</span>
            <span
              class="transactions-card__due-note"
              :class="{ 'transactions-card__due-note--overdue': row.overdue }"
            >
              {{ row.dueNote }}
            </span>
          </p>
        </div>

        <ul class="transactions-card__line-items">
          <li
            v-for="(item, index) in visibleLineItems(row.lineItems)"
            :key="index"
            class="transactions-card__line-item"
          >
            <span v-if="'overflow' in item" class="transactions-card__line-item-overflow">
              +{{ item.overflow }} item
            </span>
            <span v-else class="transactions-card__line-item-name">{{ item.name }}</span>
          </li>
        </ul>

        <div class="transactions-card__side">
          <p class="transactions-card__amount">{{ formatAmount(row.amount) }}</p>
          <Button
            variant="outline"
            color="primary"
            size="small"
            type="button"
            class="transactions-card__action"
          >
            {{ activeTab.actionLabel }}
          </Button>
        </div>
      </article>

      <div class="transactions__footer">
        <button type="button" class="transactions__view-all">
          View All
          <span class="transactions__view-all-icon" aria-hidden="true"></span>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.transactions {
  min-width: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-body), sans-serif;
}

.transactions__heading {
  display: flex;
  min-height: 40px;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-3);
  padding-bottom: var(--primitives-padding-4);
}

.transactions__intro {
  min-width: 0;
}

.transactions__intro h2 {
  margin: 0;
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-md);
  font-weight: 500;
  line-height: var(--primitives-line-heights-md);
}

.transactions__intro p {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 400;
  line-height: var(--primitives-line-heights-sm);
}

.transactions__intro strong {
  color: var(--semantic-text-ach-color-text-default);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.transactions__tabs {
  display: inline-flex;
  flex: 0 0 auto;
  padding: var(--primitives-padding-1);
  border-radius: var(--primitives-border-radius-md);
  background: var(--semantic-bg-ach-color-bg-surface-secondary);
}

.transactions__tab {
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

.transactions__tab:hover:not(.transactions__tab--active) {
  background: var(--component-tabs-segmented-item-background-hover);
}

.transactions__tab--active {
  background: var(--component-tabs-segmented-item-background-active);
  color: var(--component-tabs-segmented-item-text);
  box-shadow:
    calc(var(--primitives-shadows-sm-shadow-1-x) * 1px)
      calc(var(--primitives-shadows-sm-shadow-1-y) * 1px)
      calc(var(--primitives-shadows-sm-shadow-1-blur) * 1px)
      var(--primitives-shadows-sm-color),
    calc(var(--primitives-shadows-sm-shadow-2-x) * 1px)
      calc(var(--primitives-shadows-sm-shadow-2-y) * 1px)
      calc(var(--primitives-shadows-sm-shadow-2-blur) * 1px)
      var(--primitives-shadows-sm-color);
}

.transactions__tab:focus-visible,
.transactions__view-all:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: var(--primitives-border-width-2);
}

.transactions__list {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--primitives-padding-3);
}

.transactions-card {
  display: grid;
  min-width: 0;
  transition:
    box-shadow 150ms ease,
    transform 150ms ease;
  grid-template-columns: 56px minmax(0, 1fr) minmax(0, 1.2fr) auto;
  align-items: center;
  gap: var(--primitives-padding-4);
  padding: var(--primitives-padding-4);
  border-radius: var(--primitives-border-radius-lg);
  background: var(--semantic-bg-ach-color-bg-canvas);
}

.transactions-card:hover {
  box-shadow:
    calc(var(--primitives-shadows-sm-shadow-1-x) * 1px)
      calc(var(--primitives-shadows-sm-shadow-1-y) * 1px)
      calc(var(--primitives-shadows-sm-shadow-1-blur) * 1px)
      var(--primitives-shadows-sm-color),
    calc(var(--primitives-shadows-sm-shadow-2-x) * 1px)
      calc(var(--primitives-shadows-sm-shadow-2-y) * 1px)
      calc(var(--primitives-shadows-sm-shadow-2-blur) * 1px)
      var(--primitives-shadows-sm-color);
  transform: translateY(-2px);
}

.transactions-card__identity {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.transactions-card__counterparty,
.transactions-card__due {
  margin: 0;
}

.transactions-card__counterparty {
  overflow: hidden;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-md);
  font-weight: 500;
  line-height: var(--primitives-line-heights-md);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.transactions-card__invoice {
  overflow: hidden;
  color: var(--semantic-text-ach-color-text-link);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
  text-overflow: ellipsis;
  text-decoration: underline;
  white-space: nowrap;
}

.transactions-card__due {
  display: flex;
  gap: var(--primitives-padding-1);
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}

.transactions-card__due-note--overdue {
  color: var(--semantic-text-error-ach-color-text-error-subtle);
}

.transactions-card__line-items {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.transactions-card__line-item {
  display: flex;
  min-width: 0;
  align-items: baseline;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}

.transactions-card__line-item-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.transactions-card__line-item-overflow {
  color: var(--semantic-text-ach-color-text-subtle);
}

.transactions-card__side {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: var(--primitives-padding-4);
}

.transactions-card__amount {
  margin: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-md);
  font-weight: 500;
  line-height: var(--primitives-line-heights-md);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.transactions-card__action {
  flex: 0 0 auto;
  background: transparent;
}

.transactions__footer {
  display: flex;
  justify-content: center;
  padding-top: var(--primitives-padding-1);
}

.transactions__view-all {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  justify-content: center;
  gap: var(--primitives-padding-2);
  padding: var(--primitives-padding-2) var(--primitives-padding-4);
  border: 0;
  border-radius: var(--primitives-border-radius-infinite);
  background: none;
  color: var(--semantic-text-ach-color-text-link);
  cursor: pointer;
  font-family: inherit;
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-xs);
}

.transactions__view-all:hover {
  text-decoration: underline;
}

.transactions__view-all-icon {
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
  background: var(--semantic-text-ach-color-text-link);
  mask: url('/icons/ui-actions/arrow-forward.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/arrow-forward.svg') center / contain no-repeat;
}

@media (max-width: 900px) {
  .transactions-card {
    grid-template-columns: 56px minmax(0, 1fr);
    row-gap: var(--primitives-padding-2);
  }

  .transactions-card__line-items,
  .transactions-card__side {
    grid-column: 2;
  }
}
</style>
