<script setup lang="ts">
import { computed, ref } from 'vue'
import { Pagination } from '@/components/ui/pagination'
import {
  formatIndicatorValue,
  formatScore,
  goodHint,
  indicatorLabel,
  indicatorStatus,
  type RiskPulseIndicator,
} from '@/lib/risk-pulse'
import { PAGE_SIZE } from './shared'

const props = defineProps<{
  indicators: RiskPulseIndicator[]
  /** Names the table and its pagination for assistive technology. */
  label: string
  /** Evidence mode: name and value only, no score column, no paging. */
  compact?: boolean
}>()

const page = ref(1)

const visible = computed(() =>
  props.compact
    ? props.indicators
    : props.indicators.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE),
)

function valueText(indicator: RiskPulseIndicator) {
  const status = indicatorStatus(indicator)
  if (status === 'missing') return 'Not enough data yet'
  if (status === 'default') return 'No data'
  return formatIndicatorValue(indicator)
}
</script>

<template>
  <div class="indicators">
    <table class="indicators__table" :aria-label="label">
      <colgroup>
        <col />
        <col class="indicators__col-value" />
        <col v-if="!compact" class="indicators__col-score" />
      </colgroup>
      <thead>
        <tr :class="{ 'indicators__head--hidden': compact }">
          <th scope="col"><span :class="{ 'sr-only': compact }">Indicator</span></th>
          <th scope="col" class="indicators__num"><span :class="{ 'sr-only': compact }">Value</span></th>
          <th v-if="!compact" scope="col" class="indicators__num">Score</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="indicator in visible" :key="indicator.id">
          <td>
            <span class="indicators__name">{{ indicatorLabel(indicator) }}</span>
            <span v-if="goodHint(indicator)" class="indicators__hint">{{ goodHint(indicator) }}</span>
          </td>
          <td
            class="indicators__num"
            :class="{ 'indicators__num--muted': indicatorStatus(indicator) !== 'scored' }"
          >
            {{ valueText(indicator) }}
          </td>
          <td v-if="!compact" class="indicators__num indicators__score">
            <template v-if="indicator.score !== null">{{ formatScore(indicator.score) }}</template>
            <span v-if="indicatorStatus(indicator) === 'default'" class="indicators__note">
              Default score applied
            </span>
          </td>
        </tr>
      </tbody>
    </table>
    <Pagination
      v-if="!compact && indicators.length > PAGE_SIZE"
      v-model:page="page"
      :total="indicators.length"
      :items-per-page="PAGE_SIZE"
      :label="`${label}, pages`"
    />
  </div>
</template>

<style scoped>
.indicators {
  display: flex;
  width: 100%;
  min-width: 0;
  flex-direction: column;
  gap: var(--primitives-padding-3);
  font-family: var(--primitives-font-families-body), sans-serif;
}

.indicators__table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.indicators__col-value {
  width: 36%;
}

.indicators__col-score {
  /* Wide enough for "Default score" on one line beside the cell padding. */
  width: calc(var(--primitives-padding-20) + var(--primitives-padding-2));
}

.indicators th {
  padding: 0 0 var(--primitives-padding-2);
  border-bottom: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 500;
  line-height: var(--primitives-line-heights-2xs);
  text-align: left;
}

.indicators .indicators__head--hidden th {
  padding: 0;
  border: 0;
}

.indicators td {
  padding: var(--primitives-padding-3) 0;
  border-bottom: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
  vertical-align: top;
}

.indicators tbody tr:last-child td {
  border-bottom: 0;
}

.indicators .indicators__num {
  padding-left: var(--primitives-padding-3);
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
  text-align: right;
}

.indicators .indicators__num--muted {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-sm);
}

.indicators__score {
  font-weight: 600;
}

.indicators__name,
.indicators__hint,
.indicators__note {
  display: block;
}

.indicators__note {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 400;
  line-height: var(--primitives-line-heights-2xs);
}

.indicators__hint {
  margin-top: var(--primitives-padding-1);
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}
</style>
