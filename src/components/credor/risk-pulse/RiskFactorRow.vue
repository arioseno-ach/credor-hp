<script setup lang="ts">
import RiskScoreHead from './RiskScoreHead.vue'

// One anatomy for every factor: title and meta, band chip, score, bar, then the optional body.
withDefaults(
  defineProps<{
    title: string
    meta?: string
    score: number | null
    bar?: boolean
  }>(),
  { bar: true },
)
</script>

<template>
  <div class="factor">
    <RiskScoreHead :title="title" :meta="meta" :score="score" :bar="bar" />
    <div v-if="$slots.default" class="factor__body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.factor {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--primitives-padding-3);
}

.factor__body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--primitives-padding-3);
}
</style>
