<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { StyleValue } from 'vue'
import { useEventListener } from '@vueuse/core'
import {
  ListboxContent,
  ListboxFilter,
  ListboxGroup,
  ListboxGroupLabel,
  ListboxItem,
  ListboxRoot,
} from 'reka-ui'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { credorPartners } from '@/components/credor/partners'
import { credorTransactionTabs } from '@/components/credor/transactions'
import { financingOptions } from '@/components/credor/financing-options'
import { platformFeatures } from './platformFeatures'
import { useSnackbar } from '@/composables/useSnackbar'
import { useAppView } from '@/composables/useAppView'
import { useLoanSimulation } from '@/composables/useLoanSimulation'
import { closeSearch, openSearch, searchOpen } from '@/composables/useSearchDialog'
import { usePrototypeState } from '@/lib/prototype/usePrototypeState'
import { formatRupiah } from '@/lib/loan-calculator'

interface SearchItem {
  id: string
  label: string
  description: string
  group: string
  /** Path under public/icons. */
  icon: string
  /** Lay terms people type. Matched, never displayed. */
  aliases: string[]
  run: () => void
}

const { openApply } = useAppView()
const { open: openLoanSimulation } = useLoanSimulation()
const { state } = usePrototypeState()
const { show: showSnackbar } = useSnackbar()

const trigger = ref<HTMLButtonElement | null>(null)
const query = ref('')

const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform)
const shortcutHint = isMac ? '⌘K' : 'Ctrl K'

const reportUrl = `${import.meta.env.BASE_URL}reports/risk-pulse-report-demo.html`

/** Everything searchable is built from the prototype's own data, so it never drifts from the page. */
const items = computed<SearchItem[]>(() => [
  ...financingOptions.map((option) => ({
    id: `product-${option.id}`,
    label: `Apply for ${option.title}`,
    description: 'Start a new financing application',
    group: 'Financing',
    icon: 'business-payments/account-balance',
    aliases: ['pinjaman', 'loan', 'ajukan', 'pembiayaan', option.id],
    run: () => openApply({ kind: 'product', productId: option.id }),
  })),
  {
    id: 'simulation',
    label: 'Simulate a loan',
    description: 'Estimate your monthly payment',
    group: 'Financing',
    icon: 'business-payments/calculate',
    aliases: ['simulasi', 'cicilan', 'calculator', 'kalkulator'],
    run: openLoanSimulation,
  },
  ...(state.stage === 'complete'
    ? [
        {
          id: 'report',
          label: 'Download Company Health report',
          description: 'Open the RiskPulse report',
          group: 'Financing',
          icon: 'text-formatting/description',
          aliases: ['riskpulse', 'laporan', 'skor', 'score', 'download'],
          run: () => window.open(reportUrl, '_blank', 'noopener'),
        },
      ]
    : []),
  ...credorPartners.map((partner) => ({
    id: `partner-${partner.id}`,
    label: partner.name,
    description: 'Finance a new transaction with this partner',
    group: 'Partners',
    icon: 'social/handshake',
    aliases: ['partner', 'mitra'],
    run: () => openApply({ kind: 'partner', partnerId: partner.id }),
  })),
  ...credorTransactionTabs.flatMap((tab) =>
    tab.rows
      .filter((row) => !state.data.submittedInvoiceIds?.includes(row.id))
      .map((row) => ({
        id: row.id,
        label: `${row.invoiceNumber} · ${row.counterparty}`,
        description: `${tab.label} · ${row.dueNote} · ${formatRupiah(row.amount)}`,
        group: tab.label,
        icon: tab.id === 'sales' ? 'custom/e-faktur' : 'business-payments/receipt-long',
        aliases: ['invoice', 'faktur', 'tagihan', 'bill', tab.counterpartyLabel],
        run: () => openApply({ kind: 'invoice', tabId: tab.id, rowId: row.id }),
      })),
  ),
  // Platform features come last so Credor results lead; their screens are outside this prototype.
  ...platformFeatures.map((feature) => ({
    ...feature,
    run: () =>
      showSnackbar({
        variant: 'neutral',
        title: `Opens ${feature.label}`,
        description: 'This feature is part of the full Achilles app, not this prototype.',
      }),
  })),
])

// Lowercase and drop separators so "inv20260128" finds "#INV-2026-0128".
const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '')

const groups = computed(() => {
  const needle = normalize(query.value)
  const matches = needle
    ? items.value.filter((item) =>
        [item.label, item.group, ...item.aliases].some((text) => normalize(text).includes(needle)),
      )
    : items.value
  const order = [...new Set(items.value.map((item) => item.group))]
  return order
    .map((group) => ({ group, items: matches.filter((item) => item.group === group) }))
    .filter((entry) => entry.items.length > 0)
})

const hasResults = computed(() => groups.value.length > 0)

useEventListener(document, 'keydown', (event: KeyboardEvent) => {
  if (event.key?.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault()
    if (searchOpen.value) closeSearch()
    else openSearch(document.activeElement as HTMLElement)
  }
})

function onOpenChange(value: boolean) {
  if (value) openSearch(trigger.value)
  else closeSearch()
}

function choose(item: SearchItem) {
  closeSearch()
  item.run()
}

// Start each search from a clean field.
watch(searchOpen, (value) => {
  if (value) query.value = ''
})

const dialogStyle: StyleValue = {
  width: 'min(calc(100% - 2rem), 560px)',
  maxWidth: '560px',
  padding: '0',
}

// Focus goes back through useSearchDialog, because reka has no trigger to return to here.
const keepFocus = (event: Event) => event.preventDefault()
</script>

<template>
  <button
    ref="trigger"
    type="button"
    class="search-trigger"
    aria-haspopup="dialog"
    :aria-expanded="searchOpen"
    :aria-keyshortcuts="isMac ? 'Meta+K' : 'Control+K'"
    aria-label="Search products"
    @click="openSearch(trigger)"
  >
    <span class="search-trigger__icon" aria-hidden="true"></span>
    <span class="search-trigger__label">Search products</span>
    <kbd class="search-trigger__hint" aria-hidden="true">{{ shortcutHint }}</kbd>
  </button>

  <Dialog :open="searchOpen" @update:open="onOpenChange">
    <DialogContent
      :style="dialogStyle"
      :show-close="false"
      class="search-dialog"
      @close-auto-focus="keepFocus"
    >
      <DialogTitle class="search-dialog__sr-only">Search</DialogTitle>
      <DialogDescription class="search-dialog__sr-only">
        Find a financing product, partner, invoice, bill or Achilles feature and open it.
      </DialogDescription>

      <ListboxRoot>
        <div class="search-dialog__field">
          <span class="search-dialog__icon" aria-hidden="true"></span>
          <ListboxFilter
            v-model="query"
            auto-focus
            class="search-dialog__input"
            placeholder="Search financing, partners, invoices, features"
            aria-label="Search"
          />
        </div>

        <ListboxContent class="search-dialog__list">
          <ListboxGroup v-for="entry in groups" :key="entry.group" class="search-dialog__group">
            <ListboxGroupLabel class="search-dialog__heading">{{ entry.group }}</ListboxGroupLabel>
            <ListboxItem
              v-for="item in entry.items"
              :key="item.id"
              :value="item.id"
              class="search-dialog__item"
              @select="choose(item)"
            >
              <span
                class="search-dialog__item-icon"
                :style="{ '--search-icon': `url('/icons/${item.icon}.svg')` }"
                aria-hidden="true"
              ></span>
              <span class="search-dialog__text">
                <span class="search-dialog__label">{{ item.label }}</span>
                <span class="search-dialog__description">{{ item.description }}</span>
              </span>
            </ListboxItem>
          </ListboxGroup>

          <p v-if="!hasResults" class="search-dialog__empty" role="status">
            Nothing matches "{{ query }}". Try a partner name, an invoice number, or "tax".
          </p>
        </ListboxContent>
      </ListboxRoot>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
.search-trigger {
  box-sizing: border-box;
  display: flex;
  width: 256px;
  min-width: 0;
  height: 36px;
  align-items: center;
  gap: var(--primitives-padding-2);
  padding: 0 var(--primitives-padding-3);
  border: 0;
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--semantic-bg-ach-color-bg-surface-secondary);
  color: var(--component-input-placeholder);
  cursor: pointer;
  font-family: inherit;
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.search-trigger:hover {
  background: var(--semantic-bg-ach-color-bg-surface-hover);
}

.search-trigger:active {
  background: var(--semantic-bg-ach-color-bg-surface-active);
}

.search-trigger:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--component-input-border-focus);
  outline-offset: var(--primitives-border-width-2);
}

.search-trigger__icon,
.search-dialog__icon {
  mask: url('/icons/ui-actions/search.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/search.svg') center / contain no-repeat;
}

.search-trigger__icon {
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
  background: var(--semantic-icon-ach-color-icon-subtle);
}

.search-dialog__icon {
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
  background: var(--semantic-icon-ach-color-icon-default);
}

.search-trigger__label {
  overflow: hidden;
  flex: 1 1 auto;
  color: var(--component-input-placeholder);
  font-weight: 400;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-trigger__hint {
  flex: 0 0 auto;
  padding: 0 var(--primitives-padding-1);
  border: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
  border-radius: var(--primitives-border-radius-xs);
  color: var(--semantic-text-ach-color-text-secondary);
  font-family: inherit;
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}

.search-dialog {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: var(--primitives-font-families-body), sans-serif;
}

.search-dialog__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.search-dialog__field {
  display: flex;
  height: 48px;
  align-items: center;
  gap: var(--primitives-padding-2);
  padding: 0 var(--primitives-padding-3);
  border-bottom: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
}

.search-dialog__input {
  min-width: 0;
  flex: 1;
  height: 40px;
  border: 0;
  background: transparent;
  color: var(--semantic-text-ach-color-text-default);
  font-family: inherit;
  font-size: var(--primitives-font-sizes-md);
  outline: none;
}

.search-dialog__input::placeholder {
  color: var(--semantic-text-ach-color-text-subtle);
}

.search-dialog__list {
  max-height: 320px;
  overflow-x: hidden;
  overflow-y: auto;
}

.search-dialog__group {
  padding: var(--primitives-padding-1);
}

.search-dialog__heading {
  display: block;
  padding: var(--primitives-padding-2);
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 500;
  line-height: var(--primitives-line-heights-2xs);
}

.search-dialog__item {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-2);
  border-radius: var(--primitives-border-radius-md);
  cursor: pointer;
  outline: none;
  user-select: none;
}

.search-dialog__item[data-highlighted] {
  background: var(--semantic-brand-ach-color-brand-subtle);
}

.search-dialog__item-icon {
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
  background: var(--semantic-icon-ach-color-icon-secondary);
  mask: var(--search-icon) center / contain no-repeat;
  -webkit-mask: var(--search-icon) center / contain no-repeat;
}

.search-dialog__text {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.search-dialog__label {
  overflow: hidden;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-sm);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-dialog__description {
  overflow: hidden;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-dialog__empty {
  margin: 0;
  padding: var(--primitives-padding-6) var(--primitives-padding-4);
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
  text-align: center;
}

@media (max-width: 600px) {
  .search-trigger {
    width: 36px;
    justify-content: center;
    padding: 0;
  }

  .search-trigger__label,
  .search-trigger__hint {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
}
</style>
