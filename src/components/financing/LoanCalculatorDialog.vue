<script setup lang="ts">
import { computed, ref } from "vue"
import type { StyleValue } from "vue"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useLoanSimulation } from "@/composables/useLoanSimulation"
import {
  buildQuotes,
  defaultLoanAmount,
  defaultLoanRate,
  defaultLoanTerm,
} from "@/lib/loan-calculator"
import { credorInvoices, credorPurchases } from "@/components/credor/financing-items"
import type { CredorFinancingItem } from "@/components/credor/financing-items"
import LoanCalculatorForm, { type CalculatorTab } from "@/components/financing/LoanCalculatorForm.vue"
import LoanCalculatorSummary from "@/components/financing/LoanCalculatorSummary.vue"

const { isOpen, close } = useLoanSimulation()

const manualAmount = ref(defaultLoanAmount)
const term = ref(defaultLoanTerm)
const rate = ref(defaultLoanRate)
const tab = ref<CalculatorTab>("amount")
const selectedInvoiceId = ref<string | null>(credorInvoices[0].id)
const selectedPurchaseId = ref<string | null>(credorPurchases[0].id)

const selectedItemId = computed(() =>
  tab.value === "purchase" ? selectedPurchaseId.value : selectedInvoiceId.value,
)

/** The amount always comes from the active source: manual entry, an invoice, or a purchase. */
const effectiveAmount = computed(() => {
  if (tab.value === "invoice") {
    return (
      credorInvoices.find((item) => item.id === selectedInvoiceId.value)?.amount ??
      defaultLoanAmount
    )
  }

  if (tab.value === "purchase") {
    return (
      credorPurchases.find((item) => item.id === selectedPurchaseId.value)?.amount ??
      defaultLoanAmount
    )
  }

  return manualAmount.value
})

const quotes = computed(() => buildQuotes(effectiveAmount.value, rate.value))

function selectItem(item: CredorFinancingItem) {
  if (tab.value === "purchase") {
    selectedPurchaseId.value = item.id
    return
  }

  selectedInvoiceId.value = item.id
}

// The dialog root is rendered inside a portal, so scoped styles from this component
// cannot reach it. Size the root inline instead.
const dialogStyle: StyleValue = {
  width: 'min(100%, 1230px)',
  maxWidth: '1230px',
  padding: '0',
  overflow: 'hidden',
}
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent
      class="calculator-dialog"
      :style="dialogStyle"
      :show-close="false"
    >
      <DialogHeader class="calculator-dialog__header">
        <DialogTitle class="calculator-dialog__title">
          Simulasi Pendanaan Usaha
        </DialogTitle>
        <DialogDescription class="calculator-dialog__description">
          Estimate your monthly repayment and total cost for each available term.
        </DialogDescription>
        <button
          type="button"
          class="calculator-dialog__close"
          aria-label="Close"
          @click="close()"
        >
          <img src="/icons/ui-actions/close.svg" alt="" aria-hidden="true" />
        </button>
      </DialogHeader>

      <div class="calculator-dialog__grid">
        <LoanCalculatorForm
          v-model:amount="manualAmount"
          v-model:term="term"
          v-model:rate="rate"
          v-model:tab="tab"
          :invoices="credorInvoices"
          :purchases="credorPurchases"
          :selected-item-id="selectedItemId"
          @select-item="selectItem"
        />

        <div class="calculator-dialog__divider" aria-hidden="true"></div>

        <LoanCalculatorSummary
          :amount="effectiveAmount"
          :rate="rate"
          :term="term"
          :quotes="quotes"
        />
      </div>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
.calculator-dialog__header {
  padding: var(--primitives-padding-4);
  border-bottom: var(--primitives-border-width-default) solid
    var(--semantic-border-ach-color-border-default);
}

.calculator-dialog__title {
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-xl);
  font-weight: 700;
  line-height: var(--primitives-line-heights-xl);
}

.calculator-dialog__description {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.calculator-dialog__close {
  display: grid;
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: var(--primitives-border-radius-xs);
  background: none;
  color: var(--semantic-text-ach-color-text-default);
  cursor: pointer;
}

.calculator-dialog__close img {
  display: block;
  width: 20px;
  height: 20px;
}

.calculator-dialog__close:hover {
  background: var(--semantic-bg-ach-color-bg-surface-hover);
}

.calculator-dialog__close:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: var(--primitives-border-width-2);
}

.calculator-dialog__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 1px minmax(0, 1fr);
  align-items: stretch;
}

.calculator-dialog__divider {
  background: var(--semantic-border-ach-color-border-default);
}

@media (max-width: 900px) {
  .calculator-dialog__grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .calculator-dialog__divider {
    height: 1px;
  }
}
</style>
