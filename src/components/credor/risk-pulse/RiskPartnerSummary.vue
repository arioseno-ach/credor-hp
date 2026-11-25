<script setup lang="ts">
import { computed } from 'vue'
import { riskBands, scoreBandIndex } from '@/lib/risk-pulse'
import { bandStrong } from './shared'
import type { PartnerScore, ReceivedRequest } from './partner-access'

const props = defineProps<{ partners: PartnerScore[]; received: ReceivedRequest[] }>()

const emits = defineEmits<{ answer: [] }>()

const unlocked = computed(() => props.partners.filter((partner) => partner.status === 'unlocked'))
const awaiting = computed(() => props.partners.filter((partner) => partner.status === 'pending').length)
const toAnswer = computed(() => props.received.filter((item) => item.status === 'pending').length)
const granted = computed(() => props.received.filter((item) => item.status === 'accepted').length)

// Only shared scores count; locked partners are left out rather than guessed.
const bands = computed(() =>
  riskBands.map((label, index) => ({
    label,
    color: bandStrong[index],
    count: unlocked.value.filter((partner) => scoreBandIndex(partner.score) === index).length,
  })),
)

// The ring is one conic gradient, a slice per band in band order.
const ring = computed(() => {
  const total = unlocked.value.length
  if (!total) return 'var(--semantic-bg-ach-color-bg-surface-secondary)'
  let start = 0
  const stops = bands.value
    .filter((band) => band.count > 0)
    .map((band) => {
      const end = start + (band.count / total) * 100
      const stop = `${band.color} ${start}% ${end}%`
      start = end
      return stop
    })
  return `conic-gradient(${stops.join(', ')})`
})

const insights = computed(() => [
  { id: 'answer', label: 'Requests to answer', hint: 'Companies asking for your report', value: toAnswer.value },
  { id: 'awaiting', label: 'Awaiting reply', hint: 'Requests you sent', value: awaiting.value },
  { id: 'granted', label: 'Access granted', hint: 'Companies that can see your report', value: granted.value },
])
</script>

<template>
  <div class="summary">
    <section class="summary__card" aria-labelledby="summary-health-title">
      <header class="summary__head">
        <h2 id="summary-health-title" class="summary__label">Portfolio health</h2>
        <span class="summary__meta">{{ partners.length }} companies</span>
      </header>
      <div class="summary__health">
        <div
          class="summary__ring"
          :style="{ background: ring }"
          role="img"
          :aria-label="`${unlocked.length} of ${partners.length} partners share their score`"
        >
          <span class="summary__ring-value">{{ unlocked.length }}</span>
          <span class="summary__ring-label">Shared</span>
        </div>
        <ul class="summary__legend">
          <li v-for="band in bands" :key="band.label" :style="{ '--band-bg': band.color }">
            <span class="summary__dot" aria-hidden="true"></span>
            <span class="summary__band">{{ band.label }}</span>
            <span class="summary__count">{{ band.count }}</span>
          </li>
        </ul>
      </div>
      <p class="summary__meta">
        {{ unlocked.length ? `Bands of the ${unlocked.length} shared scores. Locked partners are not counted.` : 'Request a score to see how your partners compare.' }}
      </p>
    </section>

    <section class="summary__card" aria-labelledby="summary-consent-title">
      <h2 id="summary-consent-title" class="summary__label">Consent</h2>
      <dl class="summary__insights">
        <div v-for="item in insights" :key="item.id" class="summary__insight">
          <dt>
            <span class="summary__insight-label">{{ item.label }}</span>
            <span class="summary__meta">{{ item.hint }}</span>
          </dt>
          <dd>
            <button v-if="item.id === 'answer' && item.value > 0" type="button" class="summary__link" @click="emits('answer')">
              {{ item.value }}<span class="sr-only"> {{ item.value === 1 ? 'request' : 'requests' }} to answer, review them</span>
            </button>
            <template v-else>{{ item.value }}</template>
          </dd>
        </div>
      </dl>
    </section>
  </div>
</template>

<style scoped>
.summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--primitives-padding-4);
}

.summary__card {
  display: flex;
  box-sizing: border-box;
  min-width: 0;
  flex-direction: column;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-4) var(--primitives-padding-5);
  border: var(--primitives-border-width-default) solid var(--component-card-border);
  border-radius: var(--primitives-border-radius-lg);
  background: var(--component-card-background);
}

.summary__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--primitives-padding-2);
}

.summary__label {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
  letter-spacing: 0.04em;
  line-height: var(--primitives-line-heights-xs);
  text-transform: uppercase;
}

.summary__meta {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
}

.summary__health {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-5);
}

/* A ring, not a pie: an inner disc in the card colour makes the hole. */
.summary__ring {
  position: relative;
  display: grid;
  width: 88px;
  height: 88px;
  flex: 0 0 88px;
  place-content: center;
  border-radius: var(--primitives-border-radius-infinite);
  text-align: center;
}

.summary__ring::before {
  position: absolute;
  inset: 10px;
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--component-card-background);
  content: '';
}

.summary__ring-value,
.summary__ring-label {
  position: relative;
}

.summary__ring-value {
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-xl);
  font-weight: 700;
  line-height: var(--primitives-line-heights-xl);
  font-variant-numeric: tabular-nums;
}

.summary__ring-label {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
  letter-spacing: 0.04em;
  line-height: var(--primitives-line-heights-xs);
  text-transform: uppercase;
}

.summary__legend {
  display: grid;
  min-width: 0;
  flex: 1;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--primitives-padding-2) var(--primitives-padding-4);
  margin: 0;
  padding: 0;
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
  list-style: none;
}

.summary__legend li {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-2);
}

.summary__dot {
  width: var(--primitives-padding-2);
  height: var(--primitives-padding-2);
  flex: 0 0 var(--primitives-padding-2);
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--band-bg);
}

.summary__band {
  flex: 1;
  white-space: nowrap;
}

.summary__count {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.summary__insights {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-3);
  margin: 0;
}

.summary__insight {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-3);
}

.summary__insight dt {
  display: flex;
  flex-direction: column;
}

.summary__insight-label {
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 600;
  line-height: var(--primitives-line-heights-sm);
}

.summary__insight dd {
  margin: 0;
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-md);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.summary__link {
  padding: 0;
  border: 0;
  border-radius: var(--primitives-border-radius-xs);
  background: none;
  color: var(--semantic-text-ach-color-text-link);
  cursor: pointer;
  font: inherit;
  text-decoration: underline;
  text-underline-offset: var(--primitives-padding-1);
}

.summary__link:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: var(--primitives-border-width-2);
}

@container app-workspace (max-width: 720px) {
  .summary {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
