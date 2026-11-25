<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import RiskStatusPill, { type StatusTone } from '@/components/credor/risk-pulse/RiskStatusPill.vue'
import { formatNpwp } from '@/components/credor/risk-pulse/partner-access'
import { useAppView } from '@/composables/useAppView'
import { useSales } from '@/composables/useSales'
import { formatDay, formatRupiah, saleTotal, type SaleStatus } from './sales'

const { openSalesCreate } = useAppView()
const { sales, buyerOf } = useSales()

const query = ref('')

const status: Record<SaleStatus, { tone: StatusTone; label: string }> = {
  unpaid: { tone: 'warning', label: 'Unpaid' },
  overdue: { tone: 'error', label: 'Overdue' },
  paid: { tone: 'success', label: 'Paid' },
}

const rows = computed(() => {
  const needle = query.value.trim().toLowerCase()
  return sales.value
    .map((sale) => ({ sale, buyer: buyerOf(sale), total: saleTotal(sale) }))
    .filter(({ sale, buyer }) =>
      !needle || [sale.number, buyer?.name, buyer?.npwp].some((value) => value?.toLowerCase().includes(needle)),
    )
})

const outstanding = computed(() =>
  sales.value.filter((sale) => sale.status !== 'paid').reduce((sum, sale) => sum + saleTotal(sale), 0),
)
</script>

<template>
  <div class="sl">
    <header class="sl__header">
      <div>
        <h1 class="sl__title">Sales transactions</h1>
        <p class="sl__text">Tax period November 2026 · {{ formatRupiah(outstanding) }} not yet paid</p>
      </div>
      <Button type="button" @click="openSalesCreate()">Create transaction</Button>
    </header>

    <div class="sl__toolbar">
      <Input v-model="query" class="sl__search" placeholder="Search by invoice number, buyer or NPWP" aria-label="Search transactions" />
    </div>

    <div v-if="rows.length" class="table-wrap">
      <table class="ptable">
        <thead>
          <tr>
            <th scope="col">Invoice</th>
            <th scope="col">Buyer</th>
            <th scope="col">Due date</th>
            <th scope="col" class="sl__num">Amount</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="{ sale, buyer, total } in rows" :id="`sale-${sale.id}`" :key="sale.id" tabindex="-1">
            <th scope="row">
              <span class="ptable__name">{{ sale.number }}</span>
              <span class="ptable__sub">Issued {{ formatDay(sale.issuedOn) }}</span>
            </th>
            <td>
              <span class="sl__buyer">{{ buyer?.name }}</span>
              <span v-if="buyer" class="ptable__sub">{{ formatNpwp(buyer.npwp) }}</span>
            </td>
            <td>{{ formatDay(sale.dueOn) }}</td>
            <td class="sl__num">{{ formatRupiah(total) }}</td>
            <td><RiskStatusPill v-bind="status[sale.status]" /></td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="ptable__empty">No transaction matches "{{ query }}". Check the spelling, or clear the search.</p>
  </div>
</template>

<style scoped src="../credor/risk-pulse/partner-table.css"></style>

<style scoped>
.sl {
  display: flex;
  width: 100%;
  min-width: 0;
  max-width: 1040px;
  flex-direction: column;
  gap: var(--primitives-padding-5);
  margin-inline: auto;
  --rp-bar-offset: calc(var(--component-topbar-height) + var(--primitives-padding-4));
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-body), sans-serif;
}

.sl__header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--primitives-padding-3);
}

.sl__title {
  margin: 0;
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-2xl);
  font-weight: 700;
  line-height: var(--primitives-line-heights-2xl);
}

.sl__title:focus {
  outline: none;
}

.sl__text {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
  font-variant-numeric: tabular-nums;
}

.sl__search {
  max-width: 360px;
}

.sl__buyer {
  display: block;
  white-space: normal;
}

.ptable .sl__num {
  font-variant-numeric: tabular-nums;
  text-align: right;
}

/* A new transaction lands here with focus; the row shows it briefly. */
.ptable tbody tr:focus {
  background: var(--semantic-bg-ach-color-bg-illustration-tint);
}
</style>
