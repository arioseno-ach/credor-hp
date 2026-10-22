<script setup lang="ts">
import { computed, ref } from 'vue'
import { prototypeScenarios } from '@/lib/prototype/scenarios'
import { usePrototypeState } from '@/lib/prototype/usePrototypeState'
import type { PrototypeStage } from '@/lib/prototype/types'

const { state, scenario, showPartners, showTransactions, setStage, toggleModule } =
  usePrototypeState()

const collapsed = ref(false)
const chromeHidden =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('chrome') === '0'

const stages: { id: PrototypeStage; label: string }[] = [
  { id: 'default', label: 'Default' },
  { id: 'personalising', label: 'Personalisasi jalan' },
  { id: 'complete', label: 'Personalisasi selesai' },
]

const activeStageLabel = computed(
  () => stages.find((stage) => stage.id === state.stage)?.label ?? state.stage,
)
</script>

<template>
  <div v-if="!chromeHidden" class="scenario-bar" :class="{ 'scenario-bar--collapsed': collapsed }">
    <div class="scenario-bar__group">
      <span class="scenario-bar__label">Prototype</span>

      <div class="scenario-bar__stages" role="group" aria-label="Personalization stage">
        <button
          v-for="stage in stages"
          :key="stage.id"
          type="button"
          class="scenario-bar__stage"
          :class="{ 'scenario-bar__stage--active': stage.id === state.stage }"
          :aria-pressed="stage.id === state.stage"
          @click="setStage(stage.id)"
        >
          {{ stage.label }}
        </button>
      </div>

      <label class="scenario-bar__toggle">
        <input
          type="checkbox"
          :checked="showPartners"
          @change="toggleModule('partners')"
        />
        <span>Partners</span>
      </label>

      <label class="scenario-bar__toggle">
        <input
          type="checkbox"
          :checked="showTransactions"
          @change="toggleModule('transactions')"
        />
        <span>Transaksi</span>
      </label>
    </div>

    <p v-if="!collapsed" class="scenario-bar__description">{{ scenario.description }}</p>

    <button
      type="button"
      class="scenario-bar__collapse"
      :aria-expanded="!collapsed"
      @click="collapsed = !collapsed"
    >
      {{ collapsed ? activeStageLabel : 'Sembunyikan' }}
    </button>

    <span class="sr-only">{{ prototypeScenarios.length }} preset scenario tersedia</span>
  </div>
</template>

<style scoped>
.scenario-bar {
  position: sticky;
  z-index: 30;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-3);
  box-sizing: border-box;
  padding: var(--primitives-padding-2) var(--primitives-padding-6);
  border-bottom: var(--primitives-border-width-default) solid
    var(--semantic-border-ach-color-border-default);
  background: var(--semantic-bg-ach-color-bg-surface);
  color: var(--semantic-text-ach-color-text-secondary);
  font-family: var(--primitives-font-families-body), sans-serif;
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}

.scenario-bar--collapsed {
  padding-block: var(--primitives-padding-1);
}

.scenario-bar__group {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--primitives-padding-3);
}

.scenario-bar__label {
  color: var(--semantic-text-ach-color-text-subtle);
  font-size: var(--primitives-font-sizes-2xs);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
}

.scenario-bar__stages {
  display: inline-flex;
  padding: var(--primitives-padding-1);
  border-radius: var(--primitives-border-radius-md);
  background: var(--semantic-bg-ach-color-bg-surface-secondary);
}

.scenario-bar__stage {
  min-height: 24px;
  padding: 0 var(--primitives-padding-2);
  border: 0;
  border-radius: var(--primitives-border-radius-sm);
  background: none;
  color: var(--component-tabs-line-item-text-inactive);
  cursor: pointer;
  font-family: inherit;
  font-size: var(--primitives-font-sizes-2xs);
  font-weight: 500;
  line-height: var(--primitives-line-heights-4xs);
  white-space: nowrap;
}

.scenario-bar__stage--active {
  background: var(--component-tabs-segmented-item-background-active);
  color: var(--component-tabs-segmented-item-text);
  box-shadow:
    calc(var(--primitives-shadows-sm-shadow-1-x) * 1px)
      calc(var(--primitives-shadows-sm-shadow-1-y) * 1px)
      calc(var(--primitives-shadows-sm-shadow-1-blur) * 1px)
      var(--primitives-shadows-sm-color);
}

.scenario-bar__stage:focus-visible,
.scenario-bar__toggle input:focus-visible,
.scenario-bar__collapse:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: var(--primitives-border-width-2);
}

.scenario-bar__toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--primitives-padding-1);
  cursor: pointer;
  white-space: nowrap;
}

.scenario-bar__description {
  margin: 0;
  overflow: hidden;
  color: var(--semantic-text-ach-color-text-subtle);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.scenario-bar__collapse {
  flex: 0 0 auto;
  padding: 0 var(--primitives-padding-2);
  border: 0;
  border-radius: var(--primitives-border-radius-sm);
  background: none;
  color: var(--semantic-text-ach-color-text-link);
  cursor: pointer;
  font-family: inherit;
  font-size: var(--primitives-font-sizes-2xs);
  font-weight: 500;
  white-space: nowrap;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

@media (max-width: 900px) {
  .scenario-bar {
    flex-wrap: wrap;
  }

  .scenario-bar__description {
    display: none;
  }
}</style>
