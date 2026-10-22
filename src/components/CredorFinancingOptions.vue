<script setup lang="ts">
import FinancingOptionCard from '@/components/financing/FinancingOptionCard.vue'
import { financingOptions } from '@/components/credor/financing-options'
</script>

<template>
  <section class="financing-options" aria-labelledby="financing-options-title">
    <div class="financing-options__heading">
      <h2 id="financing-options-title">Financing Solution options for your business</h2>
      <button type="button" class="financing-options__see-all">See All</button>
    </div>

    <div class="financing-options__grid">
      <FinancingOptionCard v-for="option in financingOptions" :key="option.id" :option="option" />
    </div>
  </section>
</template>

<style scoped>
.financing-options {
  min-width: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-body), sans-serif;
}

.financing-options__heading {
  display: flex;
  min-height: 40px;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-3);
  padding-bottom: var(--primitives-padding-4);
}

.financing-options__heading h2 {
  margin: 0;
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-md);
  font-weight: 500;
  line-height: var(--primitives-line-heights-md);
}

.financing-options__see-all {
  display: inline-flex;
  min-height: 36px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: var(--primitives-padding-1);
  padding: var(--primitives-padding-2) var(--primitives-padding-4);
  border: 0;
  border-radius: var(--primitives-border-radius-infinite);
  background: none;
  color: var(--semantic-text-ach-color-text-link);
  cursor: pointer;
  font-family: inherit;
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-xs);
}

.financing-options__see-all:hover {
  text-decoration: underline;
}

.financing-options__see-all:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: var(--primitives-border-width-2);
}

.financing-options__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--primitives-padding-4);
}

@container credor-main (max-width: 720px) {
  .financing-options__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
