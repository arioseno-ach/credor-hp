<script setup lang="ts">
import { computed } from "vue"
import { Button } from "@/components/ui/button"
import { formatRupiah, type LoanQuote } from "@/lib/loan-calculator"

const props = defineProps<{
  amount: number
  rate: number
  term: number
  quotes: LoanQuote[]
}>()

const selectedQuote = computed(
  () => props.quotes.find((quote) => quote.term === props.term) ?? props.quotes[0],
)
</script>

<template>
  <div class="calculator-summary">
    <p class="calculator-summary__caption">
      Total repayment for a {{ props.term }}-day term
    </p>

    <p class="calculator-summary__total">{{ formatRupiah(selectedQuote.total) }}</p>

    <dl class="calculator-summary__rows">
      <div class="calculator-summary__row">
        <dt>Transaction amount</dt>
        <dd>{{ formatRupiah(props.amount) }}</dd>
      </div>
      <div class="calculator-summary__row">
        <dt>Interest</dt>
        <dd>{{ formatRupiah(selectedQuote.interest) }}</dd>
      </div>
      <div class="calculator-summary__row">
        <dt>Interest rate</dt>
        <dd>{{ props.rate }}%</dd>
      </div>
    </dl>

    <div class="calculator-summary__comparison">
      <p class="calculator-summary__comparison-title">Total repayment comparison</p>
      <p class="calculator-summary__comparison-description">
        Estimated total for each available term.
      </p>

      <ul class="calculator-summary__quotes">
        <li
          v-for="quote in props.quotes"
          :key="quote.term"
          class="calculator-summary__quote"
          :class="{ 'calculator-summary__quote--active': quote.term === props.term }"
        >
          <span class="calculator-summary__quote-term">{{ quote.term }} days</span>
          <span class="calculator-summary__quote-bar">
            <span
              class="calculator-summary__quote-fill"
              :style="{ width: `${Math.max(8, quote.fillRatio * 100)}%` }"            ></span>
          </span>
          <span class="calculator-summary__quote-value">
            {{ formatRupiah(quote.total) }} · {{ quote.rate }}%
          </span>
        </li>
      </ul>
    </div>

    <Button variant="default" color="brand" size="large" type="button" class="calculator-summary__cta">
      Apply Solution Financing Now
    </Button>

    <p class="calculator-summary__note">
      This estimate assumes a single lump-sum repayment at the end of the selected term. It
      excludes other fees and is not an official offer. Interest of {{ props.rate }}% per month is
      prorated by day. Actual fees and terms are subject to agreement and business assessment.
    </p>
  </div>
</template>

<style scoped>
.calculator-summary {
  display: flex;
  min-width: 0;
  flex-direction: column;
  padding: var(--primitives-padding-5) var(--primitives-padding-6);
}

.calculator-summary__caption {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
  text-align: center;
}

.calculator-summary__total {
  margin: var(--primitives-padding-2) 0 var(--primitives-padding-5);
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-4xl);
  font-weight: 700;
  line-height: var(--primitives-line-heights-4xl);
  font-variant-numeric: tabular-nums;
  text-align: center;
}

.calculator-summary__rows {
  display: flex;
  flex-direction: column;
  margin: 0;
}

.calculator-summary__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-3);
  padding-block: var(--primitives-padding-2);
  border-bottom: var(--primitives-border-width-default) solid
    var(--semantic-border-ach-color-border-subtle);
}

.calculator-summary__row dt {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 400;
}

.calculator-summary__row dd {
  margin: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.calculator-summary__comparison {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-1);
  margin-top: var(--primitives-padding-4);
}

.calculator-summary__comparison-title {
  margin: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-sm);
}

.calculator-summary__comparison-description {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}

.calculator-summary__quotes {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-1);
  margin: var(--primitives-padding-2) 0 0;
  padding: 0;
  list-style: none;
}

.calculator-summary__quote {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-2) var(--primitives-padding-3);
  border: var(--primitives-border-width-default) solid transparent;
  border-radius: var(--primitives-border-radius-sm);
}

.calculator-summary__quote--active {
  border-color: var(--semantic-brand-ach-color-brand-default);
  background: var(--semantic-bg-info-ach-color-bg-info-surface);
}

.calculator-summary__quote-term {
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 400;
  white-space: nowrap;
}

.calculator-summary__quote-bar {
  display: block;
  height: 6px;
  overflow: hidden;
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--primitives-colors-neutral-200);
}

.calculator-summary__quote-fill {
  display: block;
  height: 100%;
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--semantic-brand-ach-color-brand-default);
}

.calculator-summary__quote-value {
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 400;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.calculator-summary__cta {
  width: 100%;
  margin-top: var(--primitives-padding-5);
}

.calculator-summary__note {
  margin: var(--primitives-padding-3) 0 0;
  color: var(--semantic-text-ach-color-text-subtle);
  font-size: var(--primitives-font-sizes-2xs);
  font-weight: 400;
  line-height: var(--primitives-line-heights-4xs);
}
</style>
