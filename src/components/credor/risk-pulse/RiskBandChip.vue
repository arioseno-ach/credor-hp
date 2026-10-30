<script setup lang="ts">
import { computed } from 'vue'
import { bandFor } from './shared'

const props = defineProps<{ score: number }>()

const band = computed(() => bandFor(props.score))
</script>

<template>
  <!-- The band name is always written out; the colour only reinforces it. -->
  <span class="band-chip" :style="{ '--band-bg': band.muted, '--band-dot': band.strong }">
    <span class="band-chip__dot" aria-hidden="true"></span>{{ band.label }}
  </span>
</template>

<style scoped>
.band-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--primitives-padding-1);
  padding: 2px var(--primitives-padding-2);
  border-radius: var(--primitives-border-radius-sm);
  background: var(--band-bg);
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 500;
  line-height: var(--primitives-line-heights-3xs);
  white-space: nowrap;
}

.band-chip__dot {
  width: var(--primitives-padding-2);
  height: var(--primitives-padding-2);
  flex: 0 0 var(--primitives-padding-2);
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--band-dot);
}
</style>
