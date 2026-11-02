<script setup lang="ts">
import type { FinancingOption } from '@/components/credor/financing-options'
import { useAppView } from '@/composables/useAppView'

defineProps<{
  option: FinancingOption
}>()

const { openApply } = useAppView()
</script>

<template>
  <button
    type="button"
    class="financing-shortcut"
    :aria-label="`Apply for ${option.title}`"
    @click="openApply({ kind: 'product', productId: option.id })"
  >
    <span class="financing-shortcut__head">
      <img class="financing-shortcut__icon" :src="option.icon" alt="" aria-hidden="true" />
      <span class="financing-shortcut__title">{{ option.title }}</span>
    </span>

    <span class="financing-shortcut__figures">
      <span class="financing-shortcut__figure">
        <span class="financing-shortcut__label">Limit up to</span>
        <span class="financing-shortcut__value">Rp{{ option.limit }}</span>
      </span>
      <span class="financing-shortcut__figure">
        <span class="financing-shortcut__label">Interest rate</span>
        <span class="financing-shortcut__value">{{ option.rate }}</span>
      </span>
    </span>
  </button>
</template>

<style scoped>
.financing-shortcut {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-4);
  border: 0;
  border-radius: var(--component-option-card-radius);
  background: var(--component-option-card-background);
  color: var(--semantic-text-ach-color-text-default);
  cursor: pointer;
  font-family: var(--primitives-font-families-body), sans-serif;
  text-align: left;
  transition: transform 200ms ease;
}

.financing-shortcut:hover {
  transform: translateY(-2px);
}

.financing-shortcut:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: var(--primitives-border-width-2);
}

.financing-shortcut__head {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: var(--primitives-padding-3);
}

.financing-shortcut__icon {
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
}

.financing-shortcut__title {
  min-width: 0;
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-md);
  font-weight: 500;
  line-height: var(--primitives-line-heights-md);
}

.financing-shortcut__figures {
  display: flex;
  justify-content: space-between;
  gap: var(--primitives-padding-3);
  padding-top: var(--primitives-padding-3);
  border-top: var(--primitives-border-width-1) solid var(--component-option-card-border);
  font-variant-numeric: tabular-nums;
}

.financing-shortcut__figure {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.financing-shortcut__figure:last-child {
  align-items: flex-end;
  text-align: right;
}

.financing-shortcut__label {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
}

.financing-shortcut__value {
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-sm);
}

@media (prefers-reduced-motion: reduce) {
  .financing-shortcut {
    transition: none;
  }

  .financing-shortcut:hover {
    transform: none;
  }
}
</style>
