<script setup lang="ts">
import { computed } from 'vue'
import { formatScore, scoreRatio } from '@/lib/risk-pulse'
import RiskBandChip from './RiskBandChip.vue'
import { bandStrong } from './shared'

const props = defineProps<{ score: number }>()

// Semicircle in a 240 x 132 box: centre (120, 120), radius 100. Angle runs from PI (score 1) to 0 (score 5).
const CX = 120
const CY = 120
const RADIUS = 100
const GAP = 0.05
const step = Math.PI / bandStrong.length

function pointAt(angle: number) {
  return { x: CX + RADIUS * Math.cos(angle), y: CY - RADIUS * Math.sin(angle) }
}

// Bands are exact fifths of the 1-5 range, so each segment is one fifth of the arc.
const segments = bandStrong.map((color, index) => {
  const start = pointAt(Math.PI - index * step - (index === 0 ? 0 : GAP / 2))
  const end = pointAt(Math.PI - (index + 1) * step + (index === bandStrong.length - 1 ? 0 : GAP / 2))
  const d = `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${RADIUS} ${RADIUS} 0 0 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`
  return { d, color }
})

const marker = computed(() => pointAt(Math.PI * (1 - scoreRatio(props.score))))
</script>

<template>
  <div class="gauge">
    <div class="gauge__dial">
      <svg class="gauge__svg" viewBox="0 0 240 132" aria-hidden="true" focusable="false">
        <path
          v-for="(segment, index) in segments"
          :key="index"
          class="gauge__segment"
          :d="segment.d"
          :style="{ stroke: segment.color }"
        />
        <circle class="gauge__marker" :cx="marker.x" :cy="marker.y" r="9" />
      </svg>
      <p class="gauge__score">
        <span class="sr-only">Company health score </span>
        <span class="gauge__value">{{ formatScore(score) }}</span>
        <span class="gauge__max">/ 5</span>
      </p>
    </div>
    <div class="gauge__foot">
      <span class="gauge__end" aria-hidden="true">1</span>
      <RiskBandChip :score="score" />
      <span class="gauge__end" aria-hidden="true">5</span>
    </div>
  </div>
</template>

<style scoped>
.gauge {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: var(--primitives-padding-2);
  font-family: var(--primitives-font-families-body), sans-serif;
}

.gauge__dial {
  position: relative;
}

.gauge__svg {
  display: block;
  width: 100%;
  height: auto;
}

.gauge__segment {
  fill: none;
  stroke-width: 16;
}

.gauge__marker {
  fill: var(--semantic-bg-ach-color-bg-surface);
  stroke: var(--semantic-text-ach-color-text-default);
  stroke-width: 3;
}

.gauge__score {
  position: absolute;
  right: 0;
  bottom: var(--primitives-padding-3);
  left: 0;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: var(--primitives-padding-1);
  margin: 0;
  font-variant-numeric: tabular-nums;
}

.gauge__value {
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-display), sans-serif;
  /* Largest type step: the score has to outweigh the verdict headline beside it. */
  font-size: var(--primitives-font-sizes-5xl);
  font-weight: 600;
  line-height: var(--primitives-line-heights-5xl);
}

.gauge__max {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-lg);
  line-height: var(--primitives-line-heights-lg);
}

.gauge__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* Pulls the end labels under the ends of the arc. */
  padding-inline: 6%;
}

.gauge__end {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  font-variant-numeric: tabular-nums;
  line-height: var(--primitives-line-heights-2xs);
}
</style>
