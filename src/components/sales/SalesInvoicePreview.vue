<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { verifiedCompany } from '@/components/credor/personalisation'
import { formatDay, formatRupiah, lineTotal, type SaleLine } from './sales'

/** The live page's right-hand Preview, filled from the form. RiskPulse never appears here: this is what the buyer sees. */
const props = defineProps<{
  buyer: { name: string; address: string } | null
  lines: SaleLine[]
  dueOn: string
}>()

const emits = defineEmits<{ hide: [] }>()

const tabs = ['Invoice', 'e-Faktur', 'Payment', 'Financing', 'Transaction log'] as const
const tab = ref<(typeof tabs)[number]>('Invoice')

const today = new Date().toISOString().slice(0, 10)
const total = computed(() => props.lines.reduce((sum, line) => sum + lineTotal(line), 0))

function moveTab(step: number) {
  const next = tabs[(tabs.indexOf(tab.value) + step + tabs.length) % tabs.length]
  tab.value = next
  document.getElementById(`preview-tab-${tabs.indexOf(next)}`)?.focus()
}
</script>

<template>
  <aside class="pv" aria-labelledby="pv-title">
    <header class="pv__head">
      <h2 id="pv-title" class="pv__title">Preview</h2>
      <Button variant="outline" color="neutral" size="small" type="button" @click="emits('hide')">
        Hide
        <span class="pv__icon pv__icon--hide" aria-hidden="true"></span>
      </Button>
    </header>

    <div class="pv__tabs" role="tablist" aria-label="Preview documents">
      <button
        v-for="(item, index) in tabs"
        :id="`preview-tab-${index}`"
        :key="item"
        type="button"
        role="tab"
        class="pv__tab"
        :class="{ 'pv__tab--active': item === tab }"
        :aria-selected="item === tab"
        :tabindex="item === tab ? 0 : -1"
        @click="tab = item"
        @keydown.left.prevent="moveTab(-1)"
        @keydown.right.prevent="moveTab(1)"
      >
        {{ item }}
      </button>
    </div>

    <div class="pv__body" role="tabpanel" :aria-label="tab">
      <template v-if="tab === 'Invoice'">
        <article class="pv__paper">
          <header class="pv__paper-head">
            <div>
              <p class="pv__seller">{{ verifiedCompany.name }}</p>
              <p class="pv__fine">{{ verifiedCompany.address }}</p>
            </div>
            <dl class="pv__dates">
              <div><dt>Invoice date</dt><dd>{{ formatDay(today) }}</dd></div>
              <div><dt>Due date</dt><dd>{{ dueOn ? formatDay(dueOn) : '-' }}</dd></div>
            </dl>
          </header>

          <div class="pv__parties">
            <div>
              <p class="pv__label">Bill to</p>
              <p class="pv__buyer">{{ buyer?.name || 'Choose a buyer' }}</p>
              <p class="pv__fine">{{ buyer?.address }}</p>
            </div>
            <div>
              <p class="pv__label">Shipping address</p>
              <p class="pv__fine">{{ buyer?.address || '-' }}</p>
            </div>
          </div>

          <table class="pv__table">
            <thead>
              <tr><th scope="col">Item</th><th scope="col">Qty</th><th scope="col">Price</th><th scope="col">Total</th></tr>
            </thead>
            <tbody>
              <tr v-for="(line, index) in lines" :key="index">
                <td>{{ line.name }}</td>
                <td>{{ line.quantity }}</td>
                <td>{{ formatRupiah(line.unitPrice) }}</td>
                <td>{{ formatRupiah(lineTotal(line)) }}</td>
              </tr>
              <tr v-if="!lines.length"><td colspan="4" class="pv__fine">Items appear here as you add them.</td></tr>
            </tbody>
            <tfoot>
              <tr><th scope="row" colspan="3">Amount to be paid</th><td>{{ formatRupiah(total) }}</td></tr>
            </tfoot>
          </table>
        </article>

        <p class="pv__cta">
          <span class="pv__icon pv__icon--receipt" aria-hidden="true"></span>
          Create the invoice to see the full preview
        </p>
      </template>

      <p v-else class="pv__empty">{{ tab }} appears once the transaction is created.</p>
    </div>
  </aside>
</template>

<style scoped>
.pv {
  display: flex;
  min-width: 0;
  flex-direction: column;
  border-radius: var(--primitives-border-radius-lg);
  background: var(--component-card-background);
  box-shadow:
    calc(var(--primitives-shadows-sm-shadow-1-x) * 1px)
      calc(var(--primitives-shadows-sm-shadow-1-y) * 1px)
      calc(var(--primitives-shadows-sm-shadow-1-blur) * 1px)
      var(--primitives-shadows-sm-color);
}

.pv__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--primitives-padding-5) var(--primitives-padding-5) var(--primitives-padding-2);
}

.pv__title {
  margin: 0;
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-xl);
  font-weight: 500;
  line-height: var(--primitives-line-heights-xl);
}

.pv__icon {
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
  background: currentcolor;
}

.pv__icon--hide {
  mask: url('/icons/common-actions/visibility-off.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/common-actions/visibility-off.svg') center / contain no-repeat;
}

.pv__icon--receipt {
  mask: url('/icons/business-payments/receipt-long.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/business-payments/receipt-long.svg') center / contain no-repeat;
}

.pv__tabs {
  display: flex;
  gap: var(--primitives-padding-1);
  padding: 0 var(--primitives-padding-3);
  overflow-x: auto;
  border-bottom: var(--primitives-border-width-default) solid var(--component-tabs-line-border);
  scrollbar-width: none;
}

.pv__tab {
  padding: var(--primitives-padding-3) var(--primitives-padding-2);
  border: 0;
  border-bottom: 3px solid transparent;
  background: none;
  color: var(--component-tabs-line-item-text-inactive);
  cursor: pointer;
  font: inherit;
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  white-space: nowrap;
}

.pv__tab--active {
  border-bottom-color: var(--component-tabs-line-item-indicator);
  color: var(--component-tabs-line-item-text-active);
}

.pv__tab:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: calc(-1 * var(--primitives-border-width-2));
}

.pv__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: var(--primitives-padding-4);
  padding: var(--primitives-padding-4);
  background: var(--semantic-bg-ach-color-bg-surface-secondary);
  border-radius: 0 0 var(--primitives-border-radius-lg) var(--primitives-border-radius-lg);
}

/* A paper sheet: small type, the way the printed invoice reads. */
.pv__paper {
  display: flex;
  width: 100%;
  box-sizing: border-box;
  flex-direction: column;
  gap: var(--primitives-padding-4);
  padding: var(--primitives-padding-5);
  background: var(--component-card-background);
  box-shadow:
    calc(var(--primitives-shadows-sm-shadow-1-x) * 1px)
      calc(var(--primitives-shadows-sm-shadow-1-y) * 1px)
      calc(var(--primitives-shadows-sm-shadow-1-blur) * 1px)
      var(--primitives-shadows-sm-color);
  font-size: var(--primitives-font-sizes-2xs);
  line-height: var(--primitives-line-heights-2xs);
  font-variant-numeric: tabular-nums;
}

.pv__paper-head,
.pv__parties {
  display: flex;
  justify-content: space-between;
  gap: var(--primitives-padding-4);
}

.pv__seller,
.pv__buyer {
  margin: 0;
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
}

.pv__fine,
.pv__label {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
}

.pv__label {
  margin-bottom: 2px;
  font-weight: 600;
}

.pv__dates {
  flex: 0 0 auto;
  margin: 0;
  text-align: right;
  white-space: nowrap;
}

.pv__dates dt {
  color: var(--semantic-text-ach-color-text-secondary);
}

.pv__dates dd {
  margin: 0 0 var(--primitives-padding-1);
}

.pv__table {
  width: 100%;
  border-collapse: collapse;
}

.pv__table th,
.pv__table td {
  padding: var(--primitives-padding-1) 0;
  border-bottom: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
  text-align: left;
}

.pv__table th:not(:first-child),
.pv__table td:not(:first-child) {
  text-align: right;
}

.pv__table thead th {
  color: var(--semantic-text-ach-color-text-secondary);
  font-weight: 600;
}

.pv__table tfoot th,
.pv__table tfoot td {
  border-bottom: 0;
  font-weight: 600;
}

.pv__cta {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-2);
  margin: 0;
  padding: var(--primitives-padding-3) var(--primitives-padding-5);
  border: var(--primitives-border-width-default) dashed var(--semantic-border-ach-color-border-strong);
  border-radius: var(--primitives-border-radius-md);
  background: var(--component-card-background);
  font-size: var(--primitives-font-sizes-xs);
}

.pv__empty {
  margin: var(--primitives-padding-10) 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
}
</style>
