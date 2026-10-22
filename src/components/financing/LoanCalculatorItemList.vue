<script setup lang="ts">
import type { CredorFinancingItem } from '@/components/credor/financing-items'
import { formatRupiah } from '@/lib/loan-calculator'

defineProps<{
  items: CredorFinancingItem[]
  selectedId: string | null
  numberLabel: string
  emptyTitle: string
  emptyDescription: string
  emptyAction: string
}>()

const emit = defineEmits<{
  (e: 'select', payload: CredorFinancingItem): void
}>()
</script>

<template>
  <div class="item-list">
    <table class="item-list__table">
      <colgroup>
        <col class="item-list__col--select" />
        <col class="item-list__col--number" />
        <col class="item-list__col--due" />
        <col class="item-list__col--amount" />
      </colgroup>
      <thead>
        <tr>
          <th scope="col"><span class="sr-only">Select</span></th>
          <th scope="col">{{ numberLabel }}</th>
          <th scope="col">Due Date</th>
          <th scope="col" class="item-list__cell--amount">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in items"
          :key="item.id"
          class="item-list__row"
          :class="{ 'item-list__row--muted': item.muted }"
        >
          <td>
            <label class="item-list__radio">
              <input
                type="radio"
                name="financing-item"
                :value="item.id"
                :checked="item.id === selectedId"
                @change="emit('select', item)"
              >
              <span class="sr-only">Select {{ item.number }}</span>
            </label>
          </td>
          <td class="item-list__number">{{ item.number }}</td>
          <td class="item-list__due">{{ item.dueDate }}</td>
          <td class="item-list__cell--amount">{{ formatRupiah(item.amount) }}</td>
        </tr>
      </tbody>
    </table>

    <div v-if="items.length === 0" class="item-list__empty">
      <p class="item-list__empty-title">{{ emptyTitle }}</p>
      <p class="item-list__empty-description">{{ emptyDescription }}</p>
      <button type="button" class="item-list__empty-action">{{ emptyAction }}</button>
    </div>
  </div>
</template>

<style scoped>
.item-list {
  width: 100%;
  padding-top: var(--primitives-padding-2);
}

.item-list__table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  color: var(--component-table-row-text);
  font-size: var(--primitives-font-sizes-sm);
}

.item-list__col--select {
  width: 46px;
}

.item-list__col--number {
  width: 30%;
}

.item-list__col--due {
  width: 32%;
}

.item-list__col--amount {
  width: 28%;
}

.item-list__table th,
.item-list__table td {
  box-sizing: border-box;
  padding: var(--primitives-padding-2) var(--primitives-padding-4);
  border-bottom: var(--primitives-border-width-default) solid
    var(--semantic-border-ach-color-border-default);
  text-align: left;
  vertical-align: middle;
}

.item-list__table th {
  height: 32px;
  color: var(--component-table-header-text);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 400;
  line-height: var(--primitives-line-heights-sm);
}

.item-list__row--muted {
  opacity: 0.35;
}

.item-list__number {
  font-weight: 500;
}

.item-list__due {
  color: var(--semantic-text-ach-color-text-default);
  font-weight: 400;
}

.item-list__cell--amount {
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.item-list__radio {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.item-list__radio input {
  width: 14px;
  height: 14px;
  margin: 0;
  appearance: none;
  border: var(--primitives-border-width-default) solid
    var(--semantic-border-ach-color-border-default);
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--component-card-background);
  cursor: pointer;
}

.item-list__radio input:checked {
  border-color: var(--semantic-text-ach-color-text-default);
  background: var(--semantic-text-ach-color-text-default);
}

.item-list__radio input:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: var(--primitives-border-width-2);
}

.item-list__empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--primitives-padding-2);
  padding-block: var(--primitives-padding-6);
}

.item-list__empty-title {
  margin: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-sm);
}

.item-list__empty-description {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}

.item-list__empty-action {
  min-height: 32px;
  margin-top: var(--primitives-padding-2);
  padding: 0 var(--primitives-padding-4);
  border: 0;
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--semantic-text-ach-color-text-default);
  color: var(--semantic-text-ach-color-text-inverse);
  cursor: pointer;
  font-family: inherit;
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 500;
  line-height: var(--primitives-line-heights-3xs);
}
</style>
