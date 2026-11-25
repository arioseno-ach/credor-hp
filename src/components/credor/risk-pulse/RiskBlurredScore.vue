<script setup lang="ts">
import { computed } from 'vue'
import { bandMuted } from './shared'

/**
 * A score the partner has not shared: the shape of a score and its band, blurred.
 * It reads as "there is a score you cannot see yet". The number and colour are a placeholder
 * picked from `seed` (so rows differ), never the real score, which stays off the page until consent.
 */
const props = withDefaults(defineProps<{ seed?: string; size?: 'md' | 'lg'; label?: string }>(), {
  seed: '',
  size: 'md',
  label: 'Score hidden until they share it',
})

const shape = computed(() => {
  const hash = [...props.seed].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7)
  return { number: (1.6 + (hash % 30) / 10).toFixed(1), band: bandMuted[hash % bandMuted.length] }
})
</script>

<template>
  <span class="blur-score" :data-size="size">
    <span class="blur-score__shape" aria-hidden="true">
      <span class="blur-score__number">{{ shape.number }}</span>
      <span class="blur-score__chip" :style="{ background: shape.band }">Band</span>
    </span>
    <span class="sr-only">{{ label }}</span>
  </span>
</template>

<style scoped>
.blur-score {
  display: inline-flex;
  align-items: center;
}

.blur-score__shape {
  display: inline-flex;
  align-items: center;
  gap: var(--primitives-padding-2);
  filter: blur(4px);
  opacity: 0.85;
  user-select: none;
}

.blur-score__number {
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-md);
  font-weight: 700;
  line-height: var(--primitives-line-heights-md);
}

.blur-score[data-size='lg'] .blur-score__number {
  font-size: var(--primitives-font-sizes-2xl);
  line-height: var(--primitives-line-heights-2xl);
}

.blur-score__chip {
  padding: 2px var(--primitives-padding-2);
  border-radius: var(--primitives-border-radius-sm);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-3xs);
}
</style>
