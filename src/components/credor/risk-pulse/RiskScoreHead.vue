<script setup lang="ts">
import { computed } from 'vue'
import { formatDelta, formatScore, scoreRatio } from '@/lib/risk-pulse'
import RiskBandChip from './RiskBandChip.vue'
import { bandFor } from './shared'

const props = withDefaults(defineProps<{
  title: string
  /** Second line under the title, such as the area a category belongs to. */
  meta?: string
  /** `null` means Risk Pulse had no data; it is never drawn as a low score. */
  score: number | null
  /** Change against the previous month and that month's short name; hidden when there is no change. */
  delta?: number | null
  deltaLabel?: string
  /** Area rows carry a bar; category rows inside an area leave it out. */
  bar?: boolean
}>(), { bar: true })

const deltaText = computed(() =>
  props.delta ? `${formatDelta(props.delta)}${props.deltaLabel ? ` vs ${props.deltaLabel}` : ''}` : null,
)

const fill = computed(() =>
  props.score === null
    ? null
    : { width: `${scoreRatio(props.score) * 100}%`, background: bandFor(props.score).strong },
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
        <span class="head__value">{{ formatScore(score) }}</span>
        <span class="head__max"> / 5</span>
        <!-- Under the score it describes, so the change reads as part of the number. -->
        <span v-if="deltaText" class="head__delta" :class="{ 'head__delta--down': (delta ?? 0) < 0 }">
          {{ deltaText }}
        </span>
      </span>
      <span v-if="bar" class="head__bar" aria-hidden="true">
        <span class="head__fill" :style="fill ?? undefined"></span>
      </span>
    </template>
    <span v-else class="head__empty">Not enough data yet</span>
  </span>
</template>

<style scoped>
/* Wide rows: title and meta, then band chip, then score, on one line; the bar underneath. */
.head {
  display: grid;
  min-width: 0;
  flex: 1 1 auto;
  grid-template-columns:
    minmax(0, 1fr)
    calc(var(--primitives-padding-16) + var(--primitives-padding-8))
    /* Wide enough for "+0.1 vs Sep" under the score, so every row keeps the same columns. */
    calc(var(--primitives-padding-16) + var(--primitives-padding-8));
  grid-template-areas:
    'text chip score'
    'bar bar bar';
  align-items: start;
  gap: var(--primitives-padding-2) var(--primitives-padding-4);
  font-family: var(--primitives-font-families-body), sans-serif;
}

/* No bar: drop its row so the head does not keep an empty gap underneath. */
.head--no-bar {
  grid-template-areas: 'text chip score';
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

.head__score {
  grid-area: score;
  justify-self: end;
  /* Keeps the score flush right when the wider change line sits under it. */
  text-align: right;
  /* Same line box as the title, so the two sit on one line. */
  line-height: var(--primitives-line-heights-sm);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
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

/* Month-on-month change, written out ("+0.1 vs Sep"). Neutral when up so it never reads as a band colour. */
.head__delta {
  display: block;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 500;
  line-height: var(--primitives-line-heights-2xs);
}

.head__delta--down {
  color: var(--semantic-text-error-ach-color-text-error);
}

.head__empty {
  grid-column: 2 / 4;
  grid-row: 1;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 400;
  line-height: var(--primitives-line-heights-sm);
  text-align: right;
}

.head__bar {
  display: block;
  height: var(--primitives-padding-1);
  grid-area: bar;
  overflow: hidden;
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--semantic-bg-ach-color-bg-surface-active);
}

.head__fill {
  display: block;
  height: 100%;
  border-radius: inherit;
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

  .head__bar {
    margin-top: var(--primitives-padding-1);
  }

  .head__empty {
    grid-column: 2;
    grid-row: 1 / 3;
  }
}
</style>
