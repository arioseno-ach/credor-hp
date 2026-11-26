<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatLenderDate, formatRupiah } from '@/lib/lender/lender-data'
import { computeRepaymentSchedule } from '@/lib/lender/useLenderPortal'
import type { OfferTerms } from '@/lib/lender/types'

const props = defineProps<{
  open: boolean
  offerTerms: OfferTerms
  startDateIso: string
  companyName: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const tableWrapRef = ref<HTMLElement | null>(null)
const highlightedDay = ref<number | null>(null)
const rowRefs = new Map<number, HTMLElement>()

const rows = computed(() => computeRepaymentSchedule(props.offerTerms, props.startDateIso))
const dueDateRow = computed(() => rows.value.find((row) => row.isDueDate) ?? null)
const penaltyStartRow = computed(() => rows.value.find((row) => row.isPenaltyStart) ?? null)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      highlightedDay.value = null
      nextTick(() => {
        if (tableWrapRef.value) {
          tableWrapRef.value.scrollTop = 0
        }
      })
    }
  },
)

function setRowRef(day: number, el: unknown) {
  if (el instanceof HTMLElement) {
    rowRefs.set(day, el)
  } else {
    rowRefs.delete(day)
  }
}

function jumpToDay(day: number | undefined) {
  if (!day) return
  highlightedDay.value = day
  const container = tableWrapRef.value
  const rowEl = rowRefs.get(day)
  if (!container || !rowEl) return

  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const targetTop = Math.max(
    0,
    rowEl.offsetTop - container.clientHeight / 2 + rowEl.clientHeight / 2,
  )
  container.scrollTo({
    top: targetTop,
    behavior: reduceMotion ? 'auto' : 'smooth',
  })
}
</script>

<template>
  <Dialog :open="props.open" @update:open="emit('update:open', $event)">
    <DialogContent class="repayment-modal__dialog">
      <DialogHeader class="repayment-modal__header">
        <div>
          <DialogTitle>Repayment Simulation</DialogTitle>
          <DialogDescription>
            Daily interest and late penalty schedule for {{ props.companyName }} ({{ props.offerTerms.tenorDays }} days plus 15-day overdue window).
          </DialogDescription>
        </div>
      </DialogHeader>

      <div class="repayment-modal__body">
        <div class="repayment-modal__summary">
          <div class="repayment-modal__stat">
            <span class="repayment-modal__stat-label">Approved Amount</span>
            <span class="repayment-modal__stat-value">{{ formatRupiah(props.offerTerms.approvedAmount) }}</span>
          </div>
          <div class="repayment-modal__stat">
            <span class="repayment-modal__stat-label">Tenor</span>
            <span class="repayment-modal__stat-value">{{ props.offerTerms.tenorDays }} days</span>
          </div>
          <div class="repayment-modal__stat">
            <span class="repayment-modal__stat-label">Interest at Maturity</span>
            <span class="repayment-modal__stat-value">{{ formatRupiah(dueDateRow?.interest ?? 0) }}</span>
          </div>
          <div class="repayment-modal__stat">
            <span class="repayment-modal__stat-label">Late Fee Rate</span>
            <span class="repayment-modal__stat-value">{{ props.offerTerms.lateFeeRatePerDay }}% / day</span>
          </div>
        </div>

        <div class="repayment-modal__toolbar">
          <div class="repayment-modal__jumps">
            <Button
              type="button"
              variant="outline"
              color="primary"
              size="small"
              :disabled="!dueDateRow"
              @click="jumpToDay(dueDateRow?.day)"
            >
              <template #leadingIcon>
                <img src="/icons/common-actions/calendar-today.svg" alt="" class="repayment-modal__btn-icon" />
              </template>
              Jump to due date
            </Button>

            <Button
              type="button"
              variant="outline"
              color="warning"
              size="small"
              :disabled="!penaltyStartRow"
              @click="jumpToDay(penaltyStartRow?.day)"
            >
              <template #leadingIcon>
                <img src="/icons/common-actions/warning.svg" alt="" class="repayment-modal__btn-icon" />
              </template>
              Jump to penalty day
            </Button>
          </div>

          <span class="repayment-modal__count">{{ rows.length }} simulated days</span>
        </div>

        <div ref="tableWrapRef" class="repayment-modal__table-wrap">
          <table class="repayment-modal__table">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col" class="repayment-modal__num-col">Interest</th>
                <th scope="col" class="repayment-modal__num-col">Late Fee</th>
                <th scope="col" class="repayment-modal__num-col">Amount Due</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in rows"
                :key="row.day"
                :ref="(el) => setRowRef(row.day, el)"
                class="repayment-modal__row"
                :class="{
                  'repayment-modal__row--due': row.isDueDate,
                  'repayment-modal__row--overdue': row.isOverdue,
                  'repayment-modal__row--highlighted': highlightedDay === row.day,
                }"
              >
                <td>
                  <div class="repayment-modal__date-cell">
                    <span class="repayment-modal__date-main">{{ formatLenderDate(row.date) }}</span>
                    <span class="repayment-modal__day-sub">Day {{ row.day }}</span>
                    <span v-if="row.isDueDate" class="repayment-modal__badge repayment-modal__badge--due">
                      Due Date
                    </span>
                    <span
                      v-else-if="row.isPenaltyStart"
                      class="repayment-modal__badge repayment-modal__badge--penalty"
                    >
                      Penalty Day
                    </span>
                    <span
                      v-else-if="row.isOverdue"
                      class="repayment-modal__badge repayment-modal__badge--overdue"
                    >
                      Overdue
                    </span>
                  </div>
                </td>
                <td class="repayment-modal__num-col">{{ formatRupiah(row.interest) }}</td>
                <td
                  class="repayment-modal__num-col"
                  :class="{ 'repayment-modal__late-fee--active': row.lateFee > 0 }"
                >
                  {{ formatRupiah(row.lateFee) }}
                </td>
                <td class="repayment-modal__num-col repayment-modal__amount-due">
                  {{ formatRupiah(row.amountDue) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <DialogFooter class="repayment-modal__footer">
        <Button type="button" variant="outline" color="neutral" @click="emit('update:open', false)">
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
:global(.repayment-modal__dialog) {
  --ach-dialog-width: min(100% - 2rem, 52rem);
  --ach-dialog-max-width: 52rem;
}

.repayment-modal__header {
  border-bottom: var(--primitives-border-width-default) solid var(--component-card-border);
}

.repayment-modal__body {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-4);
  padding: var(--primitives-padding-5) var(--primitives-padding-6);
}

.repayment-modal__summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-3) var(--primitives-padding-4);
  border: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
  border-radius: var(--primitives-border-radius-md);
  background: var(--semantic-bg-ach-color-bg-canvas);
}

.repayment-modal__stat {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--primitives-padding-1);
}

.repayment-modal__stat-label {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}

.repayment-modal__stat-value {
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 600;
  line-height: var(--primitives-line-heights-sm);
  font-variant-numeric: tabular-nums;
}

.repayment-modal__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-3);
}

.repayment-modal__jumps {
  display: flex;
  flex-wrap: wrap;
  gap: var(--primitives-padding-2);
}

.repayment-modal__btn-icon {
  display: block;
  width: 14px;
  height: 14px;
}

.repayment-modal__count {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
  font-variant-numeric: tabular-nums;
}

.repayment-modal__table-wrap {
  position: relative;
  max-height: 360px;
  overflow: auto;
  border: var(--primitives-border-width-default) solid var(--component-table-border);
  border-radius: var(--primitives-border-radius-md);
  background: var(--component-table-background);
}

.repayment-modal__table {
  width: 100%;
  border-collapse: collapse;
  color: var(--component-table-row-text);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.repayment-modal__table thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: var(--primitives-padding-3) var(--primitives-padding-4);
  border-bottom: var(--primitives-border-width-default) solid var(--component-table-border);
  background: var(--component-table-header-background);
  color: var(--component-table-header-text);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
  line-height: var(--primitives-line-heights-xs);
  text-align: left;
  white-space: nowrap;
}

.repayment-modal__table tbody td {
  padding: var(--primitives-padding-3) var(--primitives-padding-4);
  border-bottom: var(--primitives-border-width-default) solid var(--component-table-cell-divider);
  vertical-align: middle;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.repayment-modal__table thead th.repayment-modal__num-col,
.repayment-modal__table tbody td.repayment-modal__num-col {
  text-align: right;
}

.repayment-modal__row {
  transition: background-color var(--semantic-motion-duration-fast) ease;
}

.repayment-modal__row--due {
  background: var(--semantic-bg-info-ach-color-bg-info-surface);
}

.repayment-modal__row--overdue {
  background: var(--semantic-bg-warning-ach-color-bg-warning-surface);
}

.repayment-modal__row--highlighted {
  outline: var(--primitives-border-width-2) solid var(--semantic-brand-ach-color-brand-default);
  outline-offset: calc(-1 * var(--primitives-border-width-2));
  background: var(--component-table-cell-selected);
}

.repayment-modal__date-cell {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--primitives-padding-2);
}

.repayment-modal__date-main {
  font-weight: 500;
}

.repayment-modal__day-sub {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
}

.repayment-modal__badge {
  display: inline-flex;
  align-items: center;
  padding: 2px var(--primitives-padding-2);
  border-radius: var(--primitives-border-radius-infinite);
  font-size: var(--primitives-font-sizes-2xs);
  font-weight: 600;
  line-height: var(--primitives-line-heights-3xs);
  white-space: nowrap;
}

.repayment-modal__badge--due {
  border: var(--primitives-border-width-default) solid var(--component-badge-info-border);
  background: var(--component-badge-info-background);
  color: var(--component-badge-info-text);
}

.repayment-modal__badge--penalty {
  border: var(--primitives-border-width-default) solid var(--component-badge-error-border);
  background: var(--component-badge-error-background);
  color: var(--component-badge-error-text);
}

.repayment-modal__badge--overdue {
  border: var(--primitives-border-width-default) solid var(--component-badge-warning-border);
  background: var(--component-badge-warning-background);
  color: var(--component-badge-warning-text);
}

.repayment-modal__late-fee--active {
  color: var(--semantic-text-error-ach-color-text-error);
  font-weight: 500;
}

.repayment-modal__amount-due {
  font-weight: 600;
}

.repayment-modal__footer {
  border-top: var(--primitives-border-width-default) solid var(--component-card-border);
}

@media (max-width: 640px) {
  .repayment-modal__summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (prefers-reduced-motion: reduce) {
  .repayment-modal__row {
    transition: none;
  }
}
</style>
