<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import RiskBandChip from '@/components/credor/risk-pulse/RiskBandChip.vue'
import { useAppView } from '@/composables/useAppView'
import { useCompanyHealthDialog } from '@/composables/useCompanyHealthDialog'
import type { HealthVariant } from '@/lib/prototype/types'
import {
  RISK_SCORE_MAX,
  RISK_SCORE_MIN,
  formatScore,
  riskBands,
  riskPulseReport,
  riskPulseUpdatedAt,
  scoreRatio,
} from '@/lib/risk-pulse'

const { open: openCompanyHealthDialog } = useCompanyHealthDialog()
const { openRiskPulse } = useAppView()

/** Prototype report built from the same Risk Pulse preview as the details page (1–5 scale). */
const reportUrl = `${import.meta.env.BASE_URL}reports/risk-pulse-report-demo.html`

const props = withDefaults(
  defineProps<{
    variant?: HealthVariant
    score?: number
    updatedAt?: string
  }>(),
  {
    variant: 'unsync',
    score: riskPulseReport.overall,
    updatedAt: riskPulseUpdatedAt,
  },
)

const mutedSegmentColors = [
  'var(--component-risk-score-meter-low)',
  'var(--component-risk-score-meter-fair)',
  'var(--component-risk-score-meter-good)',
  'var(--component-risk-score-meter-very-good)',
  'var(--component-risk-score-meter-excellent)',
]

const strongSegmentColors = [
  'var(--component-risk-score-meter-low-strong)',
  'var(--component-risk-score-meter-fair-strong)',
  'var(--component-risk-score-meter-good-strong)',
  'var(--component-risk-score-meter-very-good-strong)',
  'var(--component-risk-score-meter-excellent-strong)',
]

const markerPosition = computed(() => `${scoreRatio(props.score) * 100}%`)

const isSynced = computed(() => props.variant === 'synced')
const isSyncing = computed(() => props.variant === 'syncing')

/** Once the score is unlocked the meter switches to the saturated palette. */
const segmentColors = computed(() => (isSynced.value ? strongSegmentColors : mutedSegmentColors))
</script>

<template>
  <section class="risk-card" :class="`risk-card--${variant}`" aria-labelledby="risk-card-title">
    <header class="risk-card__header">
      <h2 id="risk-card-title">Company Health</h2>
      <img class="risk-card__logo" src="/logo/logo-riskpulse.svg" alt="Credor RiskPulse" />
    </header>

    <div v-if="variant === 'unsync'" class="risk-card__score">
      <span class="risk-card__value">{{ formatScore(score) }}</span>
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
      <span class="risk-card__value">{{ formatScore(score) }}</span>
      <RiskBandChip :score="score" />
    </div>

    <div class="risk-card__scale">
      <div class="risk-card__range">
        <span>{{ RISK_SCORE_MIN }}</span>
        <span>{{ RISK_SCORE_MAX }}</span>
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
        <span v-for="band in riskBands" :key="band">{{ band }}</span>
      </div>
    </div>

    <p v-if="isSyncing" class="risk-card__description">
      We are syncing your tax data. You can still get financing while you wait.
    </p>

    <div v-else-if="isSynced" class="risk-card__footer">
      <p class="risk-card__description">Last update: {{ updatedAt }}</p>
      <div class="risk-card__actions">
        <button
          id="risk-card-view-details"
          type="button"
          class="risk-card__report"
          @click="openRiskPulse()"
        >
          View details
        </button>
        <a class="risk-card__report" :href="reportUrl" target="_blank" rel="noopener">
          Download Report
          <span class="risk-card__report-icon" aria-hidden="true"></span>
          <span class="risk-card__sr-only">(opens in a new tab)</span>
        </a>
      </div>
    </div>

    <p v-else class="risk-card__description">
      Connect your NPWP and Coretax to see your score. A healthy score can unlock lower interest
      rates.
    </p>

    <div v-if="variant === 'unsync'" class="risk-card__cta">
      <Button
        variant="outline"
        color="neutral"
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

.risk-card--synced {
  padding-bottom: 0;
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

@media (prefers-reduced-motion: no-preference) {
  .risk-card__badge-icon--sync {
    animation: risk-card-sync-spin var(--component-risk-card-sync-spin-duration) linear infinite;
  }
}

@keyframes risk-card-sync-spin {
  to {
    transform: rotate(360deg);
  }
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

.risk-card__actions {
  display: grid;
  width: calc(100% + var(--primitives-padding-4) + var(--primitives-padding-4));
  margin-inline: calc(-1 * var(--primitives-padding-4));
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: stretch;
  border-top: var(--primitives-border-width-default) solid var(--component-card-border);
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
  width: 100%;
  min-width: 0;
  align-items: center;
  justify-content: center;
  gap: var(--primitives-padding-1);
  padding: var(--primitives-padding-2) var(--primitives-padding-1);
  border: 0;
  background: none;
  color: var(--semantic-text-ach-color-text-link);
  cursor: pointer;
  font-family: inherit;
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 500;
  line-height: var(--primitives-line-heights-2xs);
  text-decoration: none;
}

.risk-card__report + .risk-card__report {
  border-left: var(--primitives-border-width-default) solid var(--component-card-border);
}

.risk-card__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
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

.risk-card__cta-button.ach-button--outlined.ach-button--color-neutral {
  width: 100%;
  border-color: var(--component-card-border);
  border-radius: var(--primitives-border-radius-infinite);
}

.risk-card__cta-arrow {
  width: 14px;
  height: 14px;
  background: currentColor;
  mask: url('/icons/ui-actions/arrow-forward.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/arrow-forward.svg') center / contain no-repeat;
}
</style>
