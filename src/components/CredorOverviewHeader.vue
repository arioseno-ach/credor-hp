<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { usePrototypeState } from '@/lib/prototype/usePrototypeState'

const { state } = usePrototypeState()

const formatAmount = (amount: number) => `Rp${amount.toLocaleString('id-ID')}`

const balanceLabel = computed(() => formatAmount(state.data.balance))
const incomingFundLabel = computed(() => formatAmount(state.data.incomingFund))
</script>

<template>
  <section class="credor-overview" aria-labelledby="credor-overview-title">
    <div class="credor-overview__intro">
      <img class="credor-overview__logo" src="/logo/logo-credor-lockup-full-color-24px.svg" alt="Credor" />
      <div class="credor-overview__copy">
        <h1 id="credor-overview-title">Financing &amp; risk solutions</h1>
        <p>Manage your finances more efficiently and monitor business risk.</p>
      </div>
    </div>

    <section class="balance-card" aria-labelledby="available-balance-title">
      <div class="balance-card__decoration" aria-hidden="true">
        <span class="balance-card__orb balance-card__orb--blue-150"></span>
        <span class="balance-card__orb balance-card__orb--blue-100"></span>
        <span class="balance-card__orb balance-card__orb--surface"></span>
      </div>

      <div class="balance-card__primary">
        <div class="balance-card__summary">
          <span class="balance-card__wallet" aria-hidden="true"></span>
          <div class="balance-card__amount">
            <h2 id="available-balance-title">Available Balance</h2>
            <p>{{ balanceLabel }}</p>
          </div>
        </div>

        <Button class="balance-card__disburse" type="button" size="mini" color="inverse">
          Disburse Money
          <template #trailingIcon>
            <span class="balance-card__arrow" aria-hidden="true"></span>
          </template>
        </Button>
      </div>

      <div class="balance-card__secondary">
        <div class="balance-card__incoming">
          <span>Incoming Fund</span>
          <strong>{{ incomingFundLabel }}</strong>
        </div>
        <Button class="balance-card__transactions" type="button" variant="link" size="mini">
          See All Transaction
        </Button>
      </div>
    </section>
  </section>
</template>

<style scoped>
.credor-overview {
  display: grid;
  width: 100%;
  grid-template-columns: minmax(0, 1fr) 340px;
  column-gap: var(--primitives-padding-5);
  row-gap: var(--primitives-padding-6);
  align-items: end;
}

.credor-overview__intro {
  display: flex;
  min-width: 0;
  grid-column: 1;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--primitives-padding-1);
}

.credor-overview__logo {
  display: block;
  width: 96px;
  height: 24px;
}

.credor-overview__copy {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--primitives-padding-1);
}

.credor-overview__copy h1 {
  margin: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-3xl);
  font-weight: 500;
  line-height: var(--primitives-line-heights-3xl);
}

.credor-overview__copy p {
  margin: 0;
  color: var(--semantic-text-ach-color-text-subtle);
  font-family: var(--primitives-font-families-body), sans-serif;
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 400;
  line-height: var(--primitives-line-heights-sm);
}

.balance-card {
  position: relative;
  isolation: isolate;
  box-sizing: border-box;
  width: 100%;
  grid-column: 2;
  overflow: clip;
  border: var(--primitives-border-width-default) solid var(--component-card-border);
  border-radius: var(--primitives-border-radius-lg);
  background: var(--component-card-background);
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-body), sans-serif;
}

.balance-card__primary {
  position: relative;
  z-index: 1;
  display: flex;
  min-height: 40px;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-2);
  padding: var(--primitives-padding-2) var(--primitives-padding-4);
}

.balance-card__decoration {
  position: absolute;
  z-index: 0;
  top: -21px;
  right: 10px;
  width: 75px;
  height: 124px;
  opacity: 0.5;
  pointer-events: none;
}

.balance-card__orb {
  position: absolute;
  display: block;
  border-radius: var(--primitives-border-radius-infinite);
}

.balance-card__orb--blue-150 {
  top: 20px;
  left: 31px;
  width: 79px;
  height: 79px;
  background: var(--primitives-colors-blue-150);
}

.balance-card__orb--blue-100 {
  top: -19px;
  left: -1px;
  width: 59px;
  height: 59px;
  background: var(--primitives-colors-blue-100);
  opacity: 0.6;
}

.balance-card__orb--surface {
  top: 50px;
  left: -16px;
  width: 98px;
  height: 98px;
  background: var(--primitives-colors-neutral-0);
  opacity: 0.6;
}

.balance-card__summary {
  position: relative;
  z-index: 1;
  display: flex;
  min-width: 0;
  flex: 1 1 auto;
  align-items: center;
  gap: var(--primitives-padding-2);
}

.balance-card__wallet {
  display: block;
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  background: var(--semantic-brand-ach-color-brand-default);
  mask: url('/icons/business-payments/wallet.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/business-payments/wallet.svg') center / contain no-repeat;
}

.balance-card__arrow {
  display: block;
  width: var(--primitives-padding-3);
  height: var(--primitives-padding-3);
  background: var(--semantic-text-ach-color-text-default);
  mask: url('/icons/ui-actions/chevron-right.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/chevron-right.svg') center / contain no-repeat;
}

.balance-card__amount {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: calc(var(--primitives-dimension-xxs) * 1px);
}

.balance-card__amount h2,
.balance-card__amount p {
  margin: 0;
}

.balance-card__amount h2 {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 400;
  line-height: var(--primitives-line-heights-2xs);
}

.balance-card__amount p {
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-sm);
  font-variant-numeric: tabular-nums;
}

.balance-card__disburse {
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  box-shadow:
    calc(var(--primitives-shadows-sm-shadow-2-x) * 1px)
      calc(var(--primitives-shadows-sm-shadow-2-y) * 0.5px)
      calc(var(--primitives-shadows-sm-shadow-2-blur) * 0.5px)
      calc(var(--primitives-shadows-sm-shadow-2-spread) * 1px)
      var(--primitives-shadows-sm-color),
    calc(var(--primitives-shadows-sm-shadow-1-x) * 1px)
      calc(var(--primitives-shadows-sm-shadow-1-y) * 0.5px)
      calc(var(--primitives-shadows-sm-shadow-1-blur) * 0.5px)
      calc(var(--primitives-shadows-sm-shadow-1-spread) * 1px)
      var(--primitives-shadows-sm-color);
}

.balance-card__secondary {
  position: relative;
  z-index: 1;
  display: flex;
  min-height: 36px;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-2);
  padding: var(--primitives-padding-2) var(--primitives-padding-4);
  background: var(--semantic-bg-ach-color-bg-canvas);
}

.balance-card__incoming {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: var(--primitives-padding-1);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
  white-space: nowrap;
}

.balance-card__incoming span {
  color: var(--semantic-text-ach-color-text-secondary);
}

.balance-card__incoming strong {
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.balance-card__transactions {
  flex: 0 0 auto;
  padding-inline: 0;
  color: var(--component-button-link-brand-text);
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-2xs);
  font-weight: 500;
  line-height: var(--primitives-line-heights-4xs);
}

.balance-card__transactions:hover:not(:disabled) {
  color: var(--component-button-link-brand-text-hover);
}

@container app-workspace (max-width: 1120px) {
  .credor-overview {
    grid-template-columns: minmax(0, 1fr);
  }

  .credor-overview__intro,
  .balance-card {
    grid-column: 1;
  }
}
</style>
