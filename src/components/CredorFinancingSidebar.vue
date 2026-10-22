<script setup lang="ts">
import CredorApplicationsCard from '@/components/CredorApplicationsCard.vue'
import CredorRiskScoreCard from '@/components/CredorRiskScoreCard.vue'
import { useLoanSimulation } from '@/composables/useLoanSimulation'
import { usePrototypeState } from '@/lib/prototype/usePrototypeState'

const { healthVariant, state, showLoanSimulationInSidebar } = usePrototypeState()
const { open } = useLoanSimulation()
</script>

<template>
  <aside class="financing-sidebar" aria-label="Business health and financing tools">
    <CredorRiskScoreCard :variant="healthVariant" />

    <CredorApplicationsCard :applications="state.data.applications" :feed="state.data.bcaFeed" />

    <section
      v-if="showLoanSimulationInSidebar"
      class="simulation-card"
      aria-labelledby="simulation-title"
    >
      <div class="simulation-card__heading">
        <img src="/icons/business-payments/calculate.svg" alt="" aria-hidden="true" />
        <div class="simulation-card__copy">
          <h2 id="simulation-title">Loan Simulation</h2>
          <p>Simulate first your monthly payment</p>
        </div>
      </div>
      <button type="button" class="sidebar-link simulation-card__action" @click="open()">
        Start Simulation
        <span class="sidebar-link__arrow" aria-hidden="true"></span>
      </button>
    </section>

    <section class="contact-card" aria-label="Contact and sharing options">
      <div class="contact-card__row">
        <img src="/icons/communications/forum.svg" alt="" aria-hidden="true" />
        <strong>Need help?</strong>
        <span class="sidebar-link">Contact Us</span>
      </div>
      <div class="contact-card__row">
        <img src="/icons/others/share-reviews.svg" alt="" aria-hidden="true" />
        <strong>Your team may find this useful?</strong>
        <span class="sidebar-link">Share Offers</span>
      </div>
    </section>
  </aside>
</template>

<style scoped>
.financing-sidebar {
  display: grid;
  min-width: 0;
  gap: var(--primitives-padding-5);
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-body), sans-serif;
}

.simulation-card,
.contact-card {
  box-sizing: border-box;
  overflow: hidden;
  border: var(--primitives-border-width-default) solid var(--component-card-border);
  border-radius: var(--primitives-border-radius-lg);
  background: var(--component-card-background);
}

.sidebar-link__arrow {
  width: var(--primitives-padding-3);
  height: var(--primitives-padding-3);
  flex: 0 0 var(--primitives-padding-3);
  background: var(--semantic-text-ach-color-text-link);
  mask: url('/icons/ui-actions/arrow-forward.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/arrow-forward.svg') center / contain no-repeat;
}

.simulation-card {
  position: relative;
  isolation: isolate;
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-3) var(--primitives-padding-4);
}

.simulation-card::before {
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

.simulation-card__heading {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  gap: var(--primitives-padding-3);
}

.simulation-card__copy {
  min-width: 0;
}

.simulation-card__heading > img,
.contact-card__row > img {
  width: var(--primitives-padding-5);
  height: var(--primitives-padding-5);
  flex: 0 0 var(--primitives-padding-5);
}

.simulation-card__heading h2 {
  margin: 0;
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 600;
  line-height: var(--primitives-line-heights-xs);
}

.simulation-card__heading p {
  margin: var(--primitives-padding-1) 0 0;
  color: var(--semantic-text-ach-color-text-subtle);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}

.sidebar-link {
  display: inline-flex;
  align-items: center;
  gap: var(--primitives-padding-1);
  color: var(--semantic-text-ach-color-text-link);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
  line-height: var(--primitives-line-heights-2xs);
  white-space: nowrap;
}

.simulation-card > .sidebar-link {
  position: absolute;
  right: var(--primitives-padding-4);
  top: 50%;
  z-index: 1;
  padding: var(--primitives-padding-1) var(--primitives-padding-3);
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--semantic-bg-ach-color-bg-surface);
  opacity: 0;
  pointer-events: none;
  transform: translateY(-50%);
  transition: opacity 150ms ease;
  box-shadow:
    calc(var(--primitives-shadows-md-shadow-1-x) * 1px)
      calc(var(--primitives-shadows-md-shadow-1-y) * 1px)
      calc(var(--primitives-shadows-md-shadow-1-blur) * 1px)
      calc(var(--primitives-shadows-md-shadow-1-spread) * 1px)
      var(--primitives-shadows-md-color),
    calc(var(--primitives-shadows-md-shadow-2-x) * 1px)
      calc(var(--primitives-shadows-md-shadow-2-y) * 1px)
      calc(var(--primitives-shadows-md-shadow-2-blur) * 1px)
      calc(var(--primitives-shadows-md-shadow-2-spread) * 1px)
      var(--primitives-shadows-md-color);
  backdrop-filter: blur(8px);
}

.simulation-card:hover > .sidebar-link,
.simulation-card:focus-within > .sidebar-link {
  opacity: 1;
  pointer-events: auto;
}

.simulation-card::before {
  transition: opacity 150ms ease;
}

.simulation-card:hover::before,
.simulation-card:focus-within::before {
  opacity: 0;
}

.contact-card {
  display: grid;
  min-height: 98px;
  grid-template-rows: repeat(2, minmax(0, 1fr));
}

.contact-card__row {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: var(--primitives-padding-3);
  padding-inline: var(--primitives-padding-4);
}

.contact-card__row + .contact-card__row {
  border-top: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-default);
}

.contact-card__row strong {
  min-width: 0;
  flex: 1;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 400;
  line-height: var(--primitives-line-heights-xs);
}

.contact-card__row .sidebar-link {
  font-size: var(--primitives-font-sizes-xs);
}

@container app-workspace (max-width: 680px) {
  .contact-card__row {
    gap: var(--primitives-padding-2);
    padding-inline: var(--primitives-padding-3);
  }

  .contact-card__row strong {
    font-size: var(--primitives-font-sizes-xs);
  }
}
</style>
