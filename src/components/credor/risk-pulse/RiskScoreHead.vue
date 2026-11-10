<script setup lang="ts">
import { computed } from 'vue'
import { formatDelta, formatScore, scoreRatio } from '@/lib/risk-pulse'
import RiskBandChip from './RiskBandChip.vue'
import { bandMuted } from './shared'

const props = withDefaults(defineProps<{
  title: string
  /** Second line under the title, such as the area a category belongs to. */
  meta?: string
  /** `null` means Risk Pulse had no data; it is never drawn as a low score. */
  score: number | null
  /** Change against the previous month and that month's short name; hidden when there is no change. */
  delta?: number | null
  deltaLabel?: string
  /** Area rows carry the band scale; category rows inside an area leave it out. */
  bar?: boolean
}>(), { bar: true })

const marker = computed(() =>
  props.score === null ? undefined : { left: `${scoreRatio(props.score) * 100}%` },
)
</script>

<template>
  <!-- Spans only, so the head can sit inside an accordion trigger button. -->
  <span class="head" :class="{ 'head--no-bar': !bar || score === null }">
    <span class="head__text">
      <span class="head__title">{{ title }}</span>
      <span v-if="meta" class="head__meta">{{ meta }}</span>
    </span>
    <template v-if="score !== null">
      <RiskBandChip class="head__chip" :score="score" />
      <span class="head__score">
        <span class="head__figure">
          <span class="head__value">{{ formatScore(score) }}</span>
          <span class="head__max"> / 5</span>
        </span>
        <span v-if="delta" class="head__delta" :class="{ 'head__delta--down': delta < 0 }">
          {{ formatDelta(delta) }}{{ deltaLabel ? ` vs ${deltaLabel}` : '' }}
        </span>
      </span>
      <span v-if="bar" class="head__bar" aria-hidden="true">
        <span v-for="band in bandMuted" :key="band" class="head__band" :style="{ background: band }"></span>
        <span class="head__marker" :style="marker"></span>
      </span>
    </template>
    <span v-else class="head__empty">Not enough data yet</span>
  </span>
</template>

<style scoped>
/* Wide rows: title, then the change when there is one, the band scale, band chip and score on one line. */
.head {
  display: grid;
  min-width: 0;
  flex: 1 1 auto;
  grid-template-columns:
    minmax(0, 1fr)
    auto
    calc(var(--primitives-padding-20) + var(--primitives-padding-10))
    calc(var(--primitives-padding-16) + var(--primitives-padding-8))
    var(--primitives-padding-14);
  grid-template-areas: 'text delta bar chip score';
  align-items: start;
  gap: var(--primitives-padding-2) var(--primitives-padding-4);
  font-family: var(--primitives-font-families-body), sans-serif;
}

/* No scale: the title takes its column, and the chip and score stay where they are. */
.head--no-bar .head__text {
  grid-column: 1 / 4;
}

.head__text {
  grid-column: 1 / 3;
}

.head__text {
  display: flex;
  min-width: 0;
  grid-area: text;
  flex-direction: column;
  gap: var(--primitives-padding-1);
}

.head__title {
  min-width: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-sm);
}

.head__meta {
  min-width: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 400;
  line-height: var(--primitives-line-heights-2xs);
}

.head__chip {
  grid-area: chip;
  justify-self: start;
  /* Centres the chip on the title's first line. */
  margin-top: 1px;
}

/* Wide rows place the figure and the change in their own columns. */
.head__score {
  display: contents;
}

.head__figure,
.head__delta {
  justify-self: end;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.head__figure {
  grid-area: score;
}

.head__value {
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 600;
  line-height: var(--primitives-line-heights-sm);
}

.head__max {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 400;
}

/* Month-on-month change ("+0.1 vs Sep"). Neutral when up so it never reads as a band colour. */
.head__delta {
  grid-area: delta;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 500;
  /* Same line box as the title, so the two sit on one line. */
  line-height: var(--primitives-line-heights-sm);
}

.head__delta--down {
  color: var(--semantic-text-error-ach-color-text-error);
}

.head__empty {
  grid-column: 4 / -1;
  grid-row: 1;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 400;
  line-height: var(--primitives-line-heights-sm);
  text-align: right;
}

/* Five rating bands with a marker at the score: shows how close the score is to the next band. */
.head__bar {
  position: relative;
  display: grid;
  height: var(--primitives-padding-1);
  /* Centres the scale on the title's first line. */
  margin-top: var(--primitives-padding-2);
  grid-area: bar;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--primitives-border-width-2);
}

.head__band {
  border-radius: var(--primitives-border-radius-infinite);
}

.head__marker {
  position: absolute;
  top: calc(-1 * var(--primitives-padding-1));
  bottom: calc(-1 * var(--primitives-padding-1));
  width: var(--primitives-border-width-2);
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--semantic-text-ach-color-text-default);
  transform: translateX(-50%);
}

/* Narrow containers (a half-width Highlights column, or a phone): two lines, then the bar. */
@container (max-width: 560px) {
  .head {
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas:
      'title score'
      'meta chip'
      'bar bar';
    align-items: center;
    row-gap: var(--primitives-padding-1);
  }

  .head--no-bar {
    grid-template-areas:
      'title score'
      'meta chip';
  }

  .head__score {
    display: block;
    grid-area: score;
    justify-self: end;
    line-height: var(--primitives-line-heights-sm);
    text-align: right;
  }

  .head__delta {
    display: block;
    line-height: var(--primitives-line-heights-2xs);
  }

  .head__text {
    display: contents;
  }

  /* Top-aligned, not centred: a change line under the score must not pull the title down. */
  .head__title,
  .head__score {
    align-self: start;
  }

  .head__title {
    grid-area: title;
  }

  .head__meta {
    grid-area: meta;
  }

  .head__chip {
    justify-self: end;
    margin-top: 0;
  }

  /* Room for the marker, which overhangs the scale. */
  .head__bar {
    margin-top: var(--primitives-padding-2);
  }

  .head__empty {
    grid-column: 2;
    grid-row: 1 / 3;
  }
}
</style>
