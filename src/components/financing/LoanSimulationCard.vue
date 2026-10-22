<script setup lang="ts">
import { useLoanSimulation } from '@/composables/useLoanSimulation'

const { open } = useLoanSimulation()
</script>

<template>
  <section class="loan-simulation" aria-labelledby="loan-simulation-title">
    <div class="loan-simulation__content">
      <span class="loan-simulation__icon" aria-hidden="true">
        <span class="loan-simulation__icon-glyph"></span>
      </span>

      <div class="loan-simulation__copy">
        <h2 id="loan-simulation-title">Loan Simulation</h2>
        <p>Simulate your financing before you apply</p>
      </div>
    </div>

    <button type="button" class="loan-simulation__cta" @click="open()">
      Start Simulation
      <span class="loan-simulation__cta-icon" aria-hidden="true"></span>
    </button>
  </section>
</template>

<style scoped>
.loan-simulation {
  position: relative;
  isolation: isolate;
  display: grid;
  min-width: 0;
  box-sizing: border-box;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--primitives-padding-6);
  padding: var(--primitives-padding-3) var(--primitives-padding-4);
  overflow: hidden;
  border: var(--primitives-border-width-default) solid var(--component-loan-simulation-border);
  border-radius: var(--component-loan-simulation-radius);
  background: var(--component-loan-simulation-background);
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-body), sans-serif;
}

.loan-simulation::before {
  position: absolute;
  z-index: -1;
  top: 0;
  right: 0;
  bottom: 0;
  width: 34%;
  min-width: 150px;
  background-image: radial-gradient(
    var(--component-loan-simulation-dot) 1.1px,
    transparent 1.1px
  );
  background-size: 14px 14px;
  content: '';
  opacity: 0.88;
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0%,
    var(--component-loan-simulation-dot) 100%
  );
  mask-image: linear-gradient(
    to right,
    transparent 0%,
    var(--component-loan-simulation-dot) 100%
  );
  pointer-events: none;
}

.loan-simulation__content {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: var(--primitives-padding-4);
}

.loan-simulation__icon {
  display: grid;
  width: 25px;
  height: 25px;
  flex: 0 0 25px;
  place-items: center;
}

.loan-simulation__icon-glyph {
  display: block;
  width: 25px;
  height: 25px;
  background: var(--component-loan-simulation-icon-color);
  mask: url('/icons/business-payments/calculate.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/business-payments/calculate.svg') center / contain no-repeat;
}

.loan-simulation__copy {
  min-width: 0;
}

.loan-simulation__copy h2 {
  margin: 0;
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-md);
  font-weight: 500;
  line-height: var(--primitives-line-heights-md);
}

.loan-simulation__copy p {
  margin: var(--primitives-padding-1) 0 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 400;
  line-height: var(--primitives-line-heights-2xs);
}

.loan-simulation__cta {
  position: relative;
  z-index: 1;
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  gap: var(--primitives-padding-2);
  padding: 0;
  border: 0;
  background: none;
  color: var(--component-loan-simulation-cta);
  cursor: pointer;
  font-family: inherit;
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-xs);
  white-space: nowrap;
  transition:
    color 150ms ease,
    gap 150ms ease;
}

.loan-simulation__cta:hover {
  gap: 13px;
  color: var(--component-loan-simulation-cta-hover);
}

.loan-simulation__cta:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--component-loan-simulation-cta);
  outline-offset: var(--primitives-border-width-2);
  border-radius: var(--primitives-border-radius-sm);
}

.loan-simulation__cta-icon {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  background: currentColor;
  mask: url('/icons/ui-actions/arrow-forward.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/arrow-forward.svg') center / contain no-repeat;
  transition: transform 150ms ease;
}

.loan-simulation__cta:hover .loan-simulation__cta-icon {
  transform: translateX(2px);
}

@container credor-main (max-width: 680px) {
  .loan-simulation {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--primitives-padding-3);
    padding: var(--primitives-padding-5);
  }

  .loan-simulation__cta {
    justify-self: start;
    margin-left: 64px;
  }
}
</style>
