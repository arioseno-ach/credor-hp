<script setup lang="ts">
import {
  formatIndicatorValue,
  formatScore,
  goodHint,
  indicatorsFor,
  indicatorStatus,
  isInternalCheck,
  type RiskArea,
  type RiskPulseIndicator,
  type RiskPulseReport,
} from '@/lib/risk-pulse'
import RiskBandChip from './RiskBandChip.vue'

defineProps<{ area: RiskArea; report: RiskPulseReport }>()

function valueText(indicator: RiskPulseIndicator) {
  const status = indicatorStatus(indicator)
  if (status === 'missing') return 'Not enough data'
  if (status === 'default') return 'No data'
  return formatIndicatorValue(indicator)
}
</script>

<template>
  <!-- Every category and indicator of the area in one table, so nothing needs a click to read. -->
  <table class="area-table" :aria-label="`Categories and indicators in ${area.name}`">
    <colgroup>
      <col />
      <col class="area-table__col-hint" />
      <col class="area-table__col-value" />
      <col class="area-table__col-score" />
    </colgroup>
    <thead>
      <tr>
        <th scope="col">Category and indicator</th>
        <th scope="col">What is good</th>
        <th scope="col" class="area-table__num">Value</th>
        <th scope="col" class="area-table__num">Score</th>
      </tr>
    </thead>
    <tbody v-for="category in area.categories" :key="category.id">
      <tr class="area-table__category">
        <th scope="rowgroup">{{ category.name }}</th>
        <td colspan="2" class="area-table__num">
          <RiskBandChip v-if="category.score !== null" :score="category.score" />
          <span v-else class="area-table__muted">Not counted</span>
        </td>
        <td class="area-table__num area-table__score">
          <template v-if="category.score !== null">{{ formatScore(category.score) }}</template>
        </td>
      </tr>
      <template v-if="!isInternalCheck(category.name)">
        <tr v-for="indicator in indicatorsFor(category.name, report)" :key="indicator.id">
          <td class="area-table__name">{{ indicator.name }}</td>
          <td class="area-table__muted">{{ goodHint(indicator) }}</td>
          <td
            class="area-table__num"
            :class="{ 'area-table__muted': indicatorStatus(indicator) !== 'scored' }"
          >
            {{ valueText(indicator) }}
          </td>
          <td class="area-table__num">
            <template v-if="indicator.score !== null">{{ formatScore(indicator.score) }}</template>
            <span v-else class="area-table__muted">&ndash;</span>
          </td>
        </tr>
      </template>
    </tbody>
  </table>
</template>

<style scoped>
.area-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-family: var(--primitives-font-families-body), sans-serif;
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}

.area-table__col-hint {
  width: 26%;
}

.area-table__col-value {
  width: 20%;
}

.area-table__col-score {
  width: calc(var(--primitives-padding-20) + var(--primitives-padding-8));
}

.area-table thead th {
  padding: var(--primitives-padding-2) var(--primitives-padding-3);
  border-bottom: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-default);
  color: var(--semantic-text-ach-color-text-secondary);
  font-weight: 500;
  text-align: left;
}

.area-table td,
.area-table tbody th {
  padding: var(--primitives-padding-1) var(--primitives-padding-3);
  border-bottom: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
  color: var(--semantic-text-ach-color-text-default);
  text-align: left;
  vertical-align: middle;
}

/* Category rows are the group headers: tinted, bolder, with the band chip in the value column. */
.area-table__category > * {
  padding-block: var(--primitives-padding-2);
  background: var(--semantic-bg-ach-color-bg-surface-secondary);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
}

.area-table__name {
  padding-left: var(--primitives-padding-6);
  overflow-wrap: anywhere;
}

.area-table .area-table__num {
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.area-table__score {
  font-weight: 600;
}

.area-table__muted {
  color: var(--semantic-text-ach-color-text-secondary);
  font-weight: 400;
}

.area-table tbody:last-child tr:last-child > * {
  border-bottom: 0;
}
</style>
