<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSegmentedIndicator } from '@/composables/useSegmentedIndicator'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { credorTransactionTabs, type CredorTransaction } from '@/components/credor/transactions'
import { useAppView } from '@/composables/useAppView'
import { usePrototypeState } from '@/lib/prototype/usePrototypeState'

const { openApply } = useAppView()
const { state } = usePrototypeState()

const isSubmitted = (id: string) => state.data.submittedInvoiceIds?.includes(id) ?? false

const activeTabId = ref(credorTransactionTabs[0].id)

const tablist = ref<HTMLElement | null>(null)
const { indicatorStyle, ready } = useSegmentedIndicator(tablist, () => activeTabId.value)

const activeTab = computed(
  () => credorTransactionTabs.find((tab) => tab.id === activeTabId.value) ?? credorTransactionTabs[0],
)

/** Rows still open for financing. Submitted ones stay listed but leave the totals. */
const openRows = computed(() =>
  activeTab.value.rows.filter((row) => !isSubmitted(row.id)),
)

const readyCount = computed(() => openRows.value.length)

const totalAmount = computed(() =>
  openRows.value.reduce((total, row) => total + row.amount, 0),
)

const VISIBLE_ROWS = 3

/** Overdue rows come first, the most overdue on top. The rest follow the tab rule:
 *  the longest cash-out period first for sales, the nearest due date first for purchases. */
const sortedRows = computed(() => {
  const rows = [...activeTab.value.rows]
  const byTabRule = (a: CredorTransaction, b: CredorTransaction) =>
    activeTab.value.sortBy === 'longest-wait'
      ? b.dueOn.localeCompare(a.dueOn)
      : a.dueOn.localeCompare(b.dueOn)

  return rows.sort((a, b) => {
    if (a.overdue !== b.overdue) return a.overdue ? -1 : 1
    if (a.overdue) return a.daysLeft - b.daysLeft
    return byTabRule(a, b)
  })
})

const visibleRows = computed(() => sortedRows.value.slice(0, VISIBLE_ROWS))

/** Longest cash-out period for sales, nearest upcoming due date for purchases. */
const daysUntilDue = computed(() => {
  const upcoming = openRows.value
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

</script>

<template>
  <section class="transactions" aria-labelledby="transactions-title">
    <div class="transactions__heading">
      <div class="transactions__intro">
        <h2 id="transactions-title">
          {{ readyCount > 0 ? subtitle.title : `All ${activeTab.itemLabel} are submitted for financing` }}
        </h2>
      </div>

      <button v-if="sortedRows.length > VISIBLE_ROWS" type="button" class="transactions__view-all">
        See All
      </button>
    </div>

    <div class="transactions__panel">
      <div class="transactions__toolbar">
        <div ref="tablist" class="transactions__tabs" role="tablist" aria-label="Transaction type">
          <span
            class="transactions__tab-indicator"
            :class="{ 'transactions__tab-indicator--animated': ready }"
            aria-hidden="true"
            :style="indicatorStyle"
          ></span>
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

        <p v-if="readyCount > 0" class="transactions__summary">
          {{ subtitle.count }}<template v-if="daysUntilDue > 0">
            · {{ subtitle.lead }} <strong>{{ subtitle.days }}</strong>
          </template>
        </p>
      </div>

      <Transition name="transactions-panel" mode="out-in">
        <div
          class="transactions__list"
          :key="activeTabId"
          role="tabpanel"
          :aria-labelledby="'transactions-tab-' + activeTabId"
        >
          <div class="transactions__rows">
            <article v-for="row in visibleRows" :key="row.id" class="transactions-card">
              <Avatar :initials="initials(row.counterparty)" :label="row.counterparty" />

              <div class="transactions-card__identity">
                <p class="transactions-card__counterparty">{{ row.counterparty }}</p>
                <a class="transactions-card__invoice" href="#">{{ row.invoiceNumber }}</a>
              </div>

              <p class="transactions-card__items">
                <span class="transactions-card__items-name" :title="row.lineItems[0].name">
                  {{ row.lineItems[0].name }}
                </span>
                <span v-if="row.lineItems.length > 1" class="transactions-card__items-more">
                  +{{ row.lineItems.length - 1 }}
                </span>
              </p>

              <div class="transactions-card__due">
                <span
                  class="transactions-card__due-dot"
                  :class="{ 'transactions-card__due-dot--overdue': row.overdue }"
                  aria-hidden="true"
                ></span>
                <div>
                  <p
                    class="transactions-card__due-note"
                    :class="{ 'transactions-card__due-note--overdue': row.overdue }"
                  >
                    {{ row.dueNote }}
                  </p>
                  <p class="transactions-card__due-date">{{ row.dueDate }}</p>
                </div>
              </div>

              <p class="transactions-card__amount">{{ formatAmount(row.amount) }}</p>

              <span v-if="isSubmitted(row.id)" class="transactions-card__submitted">Submitted</span>
              <Button
                v-else
                variant="outline"
                color="neutral"
                size="small"
                type="button"
                class="transactions-card__action"
                :aria-label="`${activeTab.actionLabel}: ${row.invoiceNumber}`"
                @click="openApply(activeTab.id, row.id)"
              >
                {{ activeTab.actionLabel }}
              </Button>
            </article>
          </div>

        </div>
      </Transition>
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
  padding-bottom: var(--primitives-padding-3);
}

.transactions__intro {
  min-width: 0;
}

.transactions__intro h2 {
  margin: 0;
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-lg);
  font-weight: 500;
  line-height: var(--primitives-line-heights-lg);
}

.transactions__summary {
  min-width: 0;
  margin: 0;
  text-align: right;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 400;
  line-height: var(--primitives-line-heights-sm);
}

.transactions__summary strong {
  color: var(--semantic-text-ach-color-text-default);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

/* The panel holds the tabs and the rows, so See All can sit beside the title. */
.transactions__panel {
  min-width: 0;
  overflow: hidden;
  border: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-default);
  border-radius: var(--primitives-border-radius-lg);
  background: var(--semantic-bg-ach-color-bg-surface);
}

.transactions__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-4);
  padding: var(--primitives-padding-3) var(--primitives-padding-4);
  border-bottom: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
}

.transactions__tabs {
  position: relative;
  display: inline-flex;
  flex: 0 0 auto;
  padding: var(--primitives-padding-1);
  border-radius: var(--primitives-border-radius-md);
  background: var(--semantic-bg-ach-color-bg-surface-secondary);
}

.transactions__tab {
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

.transactions__tab:hover:not(.transactions__tab--active) {
  background: var(--component-tabs-segmented-item-background-hover);
}

.transactions__tab--active {
  color: var(--component-tabs-segmented-item-text);
}

.transactions__tab-indicator {
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

.transactions__tab-indicator--animated {
  transition:
    transform var(--component-tabs-indicator-duration) var(--component-tabs-indicator-easing),
    width var(--component-tabs-indicator-duration) var(--component-tabs-indicator-easing);
}

@media (prefers-reduced-motion: reduce) {
  .transactions__tab-indicator--animated {
    transition: none;
  }
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

.transactions-panel-enter-active {
  transition:
    opacity var(--component-tabs-panel-enter-duration) var(--component-tabs-indicator-easing),
    transform var(--component-tabs-panel-enter-duration) var(--component-tabs-indicator-easing);
}

.transactions-panel-leave-active {
  transition: opacity var(--component-tabs-panel-exit-duration) var(--component-tabs-panel-exit-easing);
}

.transactions-panel-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.transactions-panel-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .transactions-panel-enter-active,
  .transactions-panel-leave-active {
    transition: none;
  }
}

/* One row anatomy: fixed columns keep avatar, items, due, amount and action aligned row to row. */
.transactions__rows {
  min-width: 0;
  padding-bottom: var(--primitives-padding-1);
}

.transactions-card {
  display: grid;
  min-width: 0;
  grid-template-columns: auto minmax(0, 1.5fr) minmax(0, 1fr) 124px 128px 116px;
  align-items: center;
  gap: var(--primitives-padding-3);
  margin: 0 var(--primitives-padding-4);
  padding: var(--primitives-padding-4) 0;
}

/* Divider starts under the text, past the 48px avatar, and runs to the list's right edge. */
.transactions-card {
  position: relative;
}

.transactions-card + .transactions-card::before {
  position: absolute;
  top: 0;
  right: calc(var(--primitives-padding-4) * -1);
  left: calc(48px + var(--primitives-padding-3));
  border-top: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
  content: '';
}

.transactions-card__identity {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.transactions-card__counterparty,
.transactions-card__items,
.transactions-card__due-note,
.transactions-card__due-date {
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
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
  text-overflow: ellipsis;
  text-decoration: none;
  white-space: nowrap;
}

.transactions-card__invoice:hover {
  color: var(--semantic-text-ach-color-text-link);
  text-decoration: underline;
}

.transactions-card__items {
  display: flex;
  min-width: 0;
  gap: var(--primitives-padding-1);
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.transactions-card__items-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.transactions-card__items-more {
  flex: 0 0 auto;
  color: var(--semantic-text-ach-color-text-subtle);
}

.transactions-card__due {
  display: flex;
  align-items: flex-start;
  gap: var(--primitives-padding-2);
}

.transactions-card__due-dot {
  width: 6px;
  height: 6px;
  flex: 0 0 6px;
  margin-top: 7px;
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--semantic-text-ach-color-text-disabled);
}

.transactions-card__due-dot--overdue {
  background: var(--semantic-fg-error-ach-color-fg-error);
}

.transactions-card__due-note {
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-sm);
  white-space: nowrap;
}

.transactions-card__due-note--overdue {
  color: var(--semantic-text-error-ach-color-text-error);
}

.transactions-card__due-date {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}

.transactions-card__amount {
  margin: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-md);
  font-weight: 500;
  line-height: var(--primitives-line-heights-md);
  font-variant-numeric: tabular-nums;
  text-align: right;
  white-space: nowrap;
}

.transactions-card__action {
  width: 100%;
  background: transparent;
}

.transactions-card__submitted {
  display: inline-flex;
  min-height: 32px;
  align-items: center;
  justify-content: center;
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--semantic-bg-ach-color-bg-surface-secondary);
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 500;
  line-height: var(--primitives-line-heights-2xs);
}

.transactions__view-all {
  display: inline-flex;
  min-height: var(--primitives-padding-9);
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
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
  white-space: nowrap;
}

.transactions__view-all:hover {
  text-decoration: underline;
}

@media (max-width: 900px) {
  .transactions-card {
    grid-template-columns: auto minmax(0, 1fr) auto;
    row-gap: var(--primitives-padding-2);
  }

  .transactions-card__items,
  .transactions-card__due {
    grid-column: 2 / -1;
  }

  .transactions-card__amount {
    grid-column: 2;
    text-align: left;
  }

  .transactions-card__action,
  .transactions-card__submitted {
    grid-column: 3;
    width: auto;
  }

  .transactions-card__submitted {
    padding: 0 var(--primitives-padding-3);
  }
}
</style>
