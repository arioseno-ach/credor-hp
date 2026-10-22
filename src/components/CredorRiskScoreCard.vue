<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { useCompanyHealthDialog } from '@/composables/useCompanyHealthDialog'
import type { HealthVariant } from '@/lib/prototype/types'

const { open: openCompanyHealthDialog } = useCompanyHealthDialog()

const props = withDefaults(
  defineProps<{
    variant?: HealthVariant
    score?: number
    minScore?: number
    maxScore?: number
    updatedAt?: string
  }>(),
  {
    variant: 'unsync',
    score: 69,
    minScore: 0,
    maxScore: 100,
    updatedAt: '15 Oct 2026',
  },
)

const scaleRange = computed(() => props.maxScore - props.minScore)

const scoreRatio = computed(() =>
  Math.min(1, Math.max(0, (props.score - props.minScore) / scaleRange.value)),
)

const categories = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

const segmentColors = [
  'var(--component-risk-score-meter-low)',
  'var(--component-risk-score-meter-fair)',
  'var(--component-risk-score-meter-good)',
  'var(--component-risk-score-meter-very-good)',
  'var(--component-risk-score-meter-excellent)',
]

const scoreCategory = computed(() => {
  const index = Math.min(categories.length - 1, Math.floor(scoreRatio.value * categories.length))
  return categories[index]
})

const markerPosition = computed(() => `${scoreRatio.value * 100}%`)

const isSynced = computed(() => props.variant === 'synced')
const isSyncing = computed(() => props.variant === 'syncing')
</script>

<template>
  <section class="risk-card" :class="`risk-card--${variant}`" aria-labelledby="risk-card-title">
    <header class="risk-card__header">
      <h2 id="risk-card-title">Company Health</h2>
      <img class="risk-card__logo" src="/logo/logo-riskpulse.svg" alt="Credor RiskPulse" />
    </header>

    <div v-if="variant === 'unsync'" class="risk-card__score">
      <span class="risk-card__value">{{ score }}</span>
      <span class="risk-card__blur" aria-hidden="true"></span>
      <span class="risk-card__badge risk-card__badge--info">
        <span class="risk-card__badge-icon" aria-hidden="true"></span>
        Unlock now, <strong>Free</strong>
      </span>
    </div>

    <div v-else-if="isSyncing" class="risk-card__sync-badge">
      <span class="risk-card__badge risk-card__badge--warning">
        <span class="risk-card__badge-icon risk-card__badge-icon--sync" aria-hidden="true"></span>
        Syncing data
      </span>
    </div>

    <div v-else class="risk-card__score risk-card__score--synced">
      <span class="risk-card__value">{{ score }}</span>
      <span class="risk-card__badge risk-card__badge--success">{{ scoreCategory }}</span>
    </div>

    <div class="risk-card__scale">
      <div class="risk-card__range">
        <span>{{ minScore }}</span>
        <span>{{ maxScore }}</span>
      </div>

      <div class="risk-card__meter" :class="{ 'risk-card__meter--muted': !isSynced }" aria-hidden="true">
        <span
          v-for="(color, index) in segmentColors"
          :key="index"
          class="risk-card__segment"
          :style="{ background: color }"
        ></span>
        <span
          v-if="isSynced"
          class="risk-card__marker"
          :style="{ left: markerPosition }"
        ></span>
      </div>

      <div class="risk-card__categories" aria-hidden="true">
        <span v-for="category in categories" :key="category">{{ category }}</span>
      </div>
    </div>

    <p v-if="isSyncing" class="risk-card__description">
      We are syncing your tax data. You can still get financing while you wait.
    </p>

    <div v-else-if="isSynced" class="risk-card__footer">
      <p class="risk-card__description">Last update: {{ updatedAt }}</p>
      <button type="button" class="risk-card__report">
        Download Report
        <span class="risk-card__report-icon" aria-hidden="true"></span>
      </button>
    </div>

    <p v-else class="risk-card__description">
      Connect your NPWP and Coretax to see your score. A healthy score can unlock lower interest
      rates.
    </p>

    <div v-if="variant === 'unsync'" class="risk-card__cta">
      <Button
        variant="outline"
        color="primary"
        size="small"
        type="button"
        class="risk-card__cta-button"
        @click="openCompanyHealthDialog()"
      >
        Get Free Report
        <template #trailingIcon>
          <span class="risk-card__cta-arrow" aria-hidden="true"></span>
        </template>
      </Button>
    </div>
  </section>
</template>

<style scoped>
.risk-card {
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  align-items: center;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-4);
  border: var(--primitives-border-width-default) solid var(--component-card-border);
  border-radius: var(--primitives-border-radius-lg);
  background: var(--component-card-background);
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-body), sans-serif;
  text-align: center;
}

.risk-card__header {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-2);
  text-align: left;
}

.risk-card__header h2 {
  margin: 0;
  font-size: var(--primitives-font-sizes-md);
  font-weight: 400;
  line-height: var(--primitives-line-heights-md);
}

.risk-card__logo {
  width: 77px;
  height: 18px;
  flex: 0 0 77px;
}

.risk-card__score {
  position: relative;
  display: flex;
  width: 100%;
  min-height: 54px;
  align-items: center;
  justify-content: center;
}

.risk-card__score--synced {
  gap: var(--primitives-padding-2);
}

.risk-card__value {
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-3xl);
  font-weight: 500;
  line-height: var(--primitives-line-heights-3xl);
}

.risk-card__blur {
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--component-card-background) 2%, transparent);
  backdrop-filter: blur(2px);
}

.risk-card__badge {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: var(--primitives-padding-1);
  padding: 2px var(--primitives-padding-2);
  border-radius: var(--primitives-border-radius-sm);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 500;
  line-height: var(--primitives-line-heights-3xs);
  white-space: nowrap;
}

.risk-card__badge--info {
  position: absolute;
  bottom: var(--primitives-padding-2);
  left: 50%;
  background: var(--semantic-bg-info-ach-color-bg-info-surface);
  color: var(--semantic-text-info-ach-color-text-info);
  font-weight: 400;
  transform: translateX(-50%);
}

.risk-card__badge--warning {
  background: var(--semantic-bg-warning-ach-color-bg-warning-surface);
  color: var(--semantic-text-warning-ach-color-text-warning);
}

.risk-card__badge--success {
  background: var(--semantic-bg-success-ach-color-bg-success-surface);
  color: var(--semantic-text-success-ach-color-text-success);
}

.risk-card__badge strong {
  font-weight: 700;
}

.risk-card__badge-icon {
  width: var(--primitives-padding-3);
  height: var(--primitives-padding-3);
  flex: 0 0 var(--primitives-padding-3);
  background: currentColor;
  mask: url('/icons/common-actions/lock-open.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/common-actions/lock-open.svg') center / contain no-repeat;
}

.risk-card__badge-icon--sync {
  mask: url('/icons/ui-actions/sync.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/sync.svg') center / contain no-repeat;
}

.risk-card__sync-badge {
  display: flex;
  width: 100%;
  min-height: 54px;
  align-items: center;
  justify-content: center;
}

.risk-card__scale {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: var(--primitives-padding-1);
}

.risk-card__footer {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  gap: var(--primitives-padding-2);
}

.risk-card__range,
.risk-card__categories {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--component-risk-score-label-text);
  font-size: var(--primitives-font-sizes-2xs);
  font-weight: 500;
  line-height: var(--primitives-line-heights-4xs);
}

.risk-card__categories {
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 400;
  line-height: var(--primitives-line-heights-2xs);
}

.risk-card__categories span {
  text-align: center;
}

.risk-card__meter {
  position: relative;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--primitives-padding-1);
}

.risk-card__meter--muted .risk-card__segment {
  opacity: 0.5;
}

.risk-card__segment {
  height: var(--primitives-padding-2);
  border-radius: var(--primitives-border-radius-xs);
}

.risk-card__marker {
  position: absolute;
  top: 50%;
  width: 10px;
  height: 10px;
  border: 2px solid var(--semantic-text-ach-color-text-default);
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--component-card-background);
  transform: translate(-50%, -50%);
}

.risk-card__description {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 400;
  line-height: var(--primitives-line-heights-2xs);
}

.risk-card__report {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--primitives-padding-1);
  padding: 0;
  border: 0;
  background: none;
  color: var(--semantic-text-ach-color-text-link);
  cursor: pointer;
  font-family: inherit;
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 500;
  line-height: var(--primitives-line-heights-2xs);
}

.risk-card__report:hover {
  text-decoration: underline;
}

.risk-card__report:focus-visible,
.risk-card__cta-button:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: var(--primitives-border-width-2);
}

.risk-card__report-icon {
  width: var(--primitives-padding-3);
  height: var(--primitives-padding-3);
  flex: 0 0 var(--primitives-padding-3);
  background: var(--semantic-text-ach-color-text-link);
  mask: url('/icons/ui-actions/download.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/download.svg') center / contain no-repeat;
}

.risk-card__cta {
  display: flex;
  width: 100%;
  justify-content: center;
}

.risk-card__cta-button {
  width: 100%;
  box-shadow:
    calc(var(--primitives-shadows-xs-x) * 1px)
      calc(var(--primitives-shadows-xs-y) * 1px)
      calc(var(--primitives-shadows-xs-blur) * 1px)
      var(--primitives-shadows-xs-color);
}

.risk-card__cta-arrow {
  width: 14px;
  height: 14px;
  background: currentColor;
  mask: url('/icons/ui-actions/arrow-forward.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/arrow-forward.svg') center / contain no-repeat;
}
</style>
