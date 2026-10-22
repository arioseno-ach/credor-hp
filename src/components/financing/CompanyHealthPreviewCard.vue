<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  annuityInterest,
  companyHealthAmounts,
  companyHealthCategories,
  companyHealthCurrentRate,
  companyHealthTerms,
  getCompanyHealthCategory,
  termInMonths,
} from '@/lib/company-health'

const score = ref(69)
const amount = ref(companyHealthAmounts[1])
const term = ref(companyHealthTerms[2])

const category = computed(() => getCompanyHealthCategory(score.value))
const activeCategoryIndex = computed(() => companyHealthCategories.indexOf(category.value))
const months = computed(() => termInMonths(term.value))

const currentInterest = computed(() =>
  annuityInterest(amount.value, companyHealthCurrentRate, months.value),
)
const healthInterest = computed(() =>
  annuityInterest(amount.value, category.value.rate, months.value),
)
const savings = computed(() => currentInterest.value - healthInterest.value)
const savingsPercent = computed(() =>
  currentInterest.value > 0 ? Math.round((savings.value / currentInterest.value) * 100) : 0,
)

const meterSegments = [
  'low',
  'fair',
  'good',
  'very-good',
  'excellent',
] as const

const scoreRatio = computed(() => score.value / 100)

function formatAmount(value: number): string {
  return `Rp${value.toLocaleString('id-ID')}`
}

function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString('id-ID')}`
}

function formatAmountOption(value: number): string {
  return value >= 1_000_000_000 ? '1 M' : `${value / 1_000_000} jt`
}
</script>

<template>
  <section class="company-health" aria-labelledby="company-health-card-title">
    <header class="company-health__header">
      <h2 id="company-health-card-title" class="company-health__title">
        Kesehatan Perusahaan Anda
      </h2>
      <img
        class="company-health__logo"
        src="/logo/logo-riskpulse.svg"
        alt="Credor RiskPulse"
      >
    </header>

    <div class="company-health__score">
      <span class="company-health__score-value" aria-hidden="true">{{ score }}</span>
      <span class="company-health__badge company-health__badge--success">
        {{ category.label }}
      </span>
    </div>

    <div class="company-health__scale">
      <div class="company-health__range" aria-hidden="true">
        <span>0</span>
        <span>100</span>
      </div>

      <div class="company-health__meter">
        <div class="company-health__segments" aria-hidden="true">
          <span
            v-for="(segment, index) in meterSegments"
            :key="segment"
            class="company-health__segment"
            :class="[
              `company-health__segment--${segment}`,
              { 'company-health__segment--active': index === activeCategoryIndex },
            ]"
          ></span>
        </div>
        <span
          class="company-health__marker"
          :style="{ left: `${scoreRatio * 100}%` }"
          aria-hidden="true"
        ></span>
        <input
          v-model.number="score"
          class="company-health__range-input"
          type="range"
          min="0"
          max="100"
          step="1"
          aria-label="Skor kesehatan perusahaan"
          :aria-valuetext="`${score} dari 100, ${category.label}`"
        >
      </div>

      <div class="company-health__categories">
        <span
          v-for="(item, index) in companyHealthCategories"
          :key="item.label"
          class="company-health__category"
          :class="{ 'company-health__category--active': index === activeCategoryIndex }"
        >
          {{ item.label }}
        </span>
      </div>

      <p class="company-health__caption">Geser skor untuk melihat dampaknya ke bunga</p>
    </div>

    <div class="company-health__separator" aria-hidden="true"></div>

    <div class="company-health__controls">
      <div class="company-health__control">
        <p id="company-health-amount-label" class="company-health__control-label">Nominal</p>
        <div
          class="company-health__options"
          role="group"
          aria-labelledby="company-health-amount-label"
        >
          <button
            v-for="option in companyHealthAmounts"
            :key="option"
            type="button"
            class="company-health__option"
            :class="{ 'company-health__option--selected': option === amount }"
            :aria-pressed="option === amount"
            @click="amount = option"
          >
            {{ formatAmountOption(option) }}
          </button>
        </div>
      </div>

      <div class="company-health__control company-health__control--term">
        <p id="company-health-term-label" class="company-health__control-label">Repayment Time</p>
        <div
          class="company-health__options"
          role="group"
          aria-labelledby="company-health-term-label"
        >
          <button
            v-for="option in companyHealthTerms"
            :key="option"
            type="button"
            class="company-health__option"
            :class="{ 'company-health__option--selected': option === term }"
            :aria-pressed="option === term"
            @click="term = option"
          >
            {{ option }} Hari
          </button>
        </div>
      </div>
    </div>

    <div class="company-health__simulation">
      <div class="company-health__simulation-head">
        <p class="company-health__simulation-eyebrow">Simulasi untuk</p>
        <p class="company-health__simulation-title">
          {{ formatAmount(amount) }}
          <span class="company-health__simulation-dot" aria-hidden="true">·</span>
          {{ term }} hari
        </p>
      </div>

      <div class="company-health__comparison">
        <div class="company-health__comparison-column">
          <p class="company-health__comparison-label">Saat ini</p>
          <p class="company-health__comparison-rate">{{ companyHealthCurrentRate }}%/bulan</p>
          <p class="company-health__comparison-total">
            Total bunga {{ formatRupiah(currentInterest) }}
          </p>
        </div>

        <div class="company-health__comparison-divider" aria-hidden="true"></div>

        <div class="company-health__comparison-column">
          <p class="company-health__comparison-label">Dengan Company Health</p>
          <p class="company-health__comparison-rate company-health__comparison-rate--success">
            mulai {{ category.rate.toString().replace('.', ',') }}%/bulan
          </p>
          <p class="company-health__comparison-total">
            Total bunga {{ formatRupiah(healthInterest) }}
          </p>
        </div>
      </div>
    </div>

    <div class="company-health__savings">
      <div>
        <p class="company-health__savings-label">Potensi penghematan bunga</p>
        <p class="company-health__savings-value">{{ formatRupiah(savings) }}</p>
      </div>
      <span class="company-health__badge company-health__badge--brand">
        Hemat {{ savingsPercent }}%
      </span>
    </div>

    <p class="company-health__disclaimer">
      Ilustrasi membandingkan suku bunga yang Anda masukkan dengan suku bunga terendah Credor pada
      tiap kategori skor (mulai dari 1%). Suku bunga final bergantung pada hasil penilaian.
    </p>
  </section>
</template>

<style scoped>
.company-health {
  box-sizing: border-box;
  display: flex;
  width: 100%;
  max-width: 450px;
  flex-direction: column;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-4) var(--primitives-padding-5) var(--primitives-padding-6);
  border-radius: var(--primitives-border-radius-xl);
  background: var(--component-card-background);
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-body), sans-serif;
  box-shadow:
    calc(var(--primitives-shadows-md-shadow-1-x) * 1px)
      calc(var(--primitives-shadows-md-shadow-1-y) * 1px)
      calc(var(--primitives-shadows-md-shadow-1-blur) * 1px)
      calc(var(--primitives-shadows-md-shadow-1-spread) * 1px)
      var(--primitives-shadows-md-color),
    calc(var(--primitives-shadows-md-shadow-2-x) * 1px)
      calc(var(--primitives-shadows-md-shadow-2-y) * 1px)
      calc(var(--primitives-shadows-md-shadow-2-blur) * 1px)
      calc(var(--primitives-shadows-md-shadow-2-spread) * 1px)
      var(--primitives-shadows-md-color);
}

.company-health__header {
  display: flex;
  min-height: 21px;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-2);
}

.company-health__title {
  margin: 0;
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-sm);
}

.company-health__logo {
  display: block;
  width: auto;
  height: 21px;
  flex: 0 0 auto;
}

.company-health__score {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--primitives-padding-3);
}

.company-health__score-value {
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-4xl);
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  letter-spacing: var(--primitives-letter-spacing-tight);
  line-height: var(--primitives-line-heights-4xl);
}

.company-health__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--primitives-padding-1) var(--primitives-padding-2);
  border-radius: var(--primitives-border-radius-sm);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 500;
  line-height: var(--primitives-line-heights-3xs);
  white-space: nowrap;
}

.company-health__badge--success {
  background: var(--component-badge-success-background);
  color: var(--component-badge-success-text);
}

.company-health__badge--brand {
  background: var(--component-badge-brand-background);
  color: var(--component-badge-brand-text);
}

.company-health__scale {
  display: flex;
  flex-direction: column;
}

.company-health__range {
  display: flex;
  justify-content: space-between;
  padding-top: 1px;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-2xs);
  line-height: var(--primitives-line-heights-3xs);
}

.company-health__meter {
  position: relative;
  display: flex;
  height: 22px;
  align-items: center;
  margin: 1px 0;
}

.company-health__segments {
  display: flex;
  width: 100%;
  height: var(--primitives-padding-1);
  gap: 3px;
}

.company-health__segment {
  height: 100%;
  flex: 1;
  border-radius: var(--primitives-border-radius-infinite);
  opacity: 0.3;
}

.company-health__segment--active {
  opacity: 1;
}

.company-health__segment--low {
  background: var(--component-risk-score-meter-low-strong);
}

.company-health__segment--fair {
  background: var(--component-risk-score-meter-fair-strong);
}

.company-health__segment--good {
  background: var(--component-risk-score-meter-good-strong);
}

.company-health__segment--very-good {
  background: var(--component-risk-score-meter-very-good-strong);
}

.company-health__segment--excellent {
  background: var(--component-risk-score-meter-excellent-strong);
}

.company-health__marker {
  position: absolute;
  top: 50%;
  width: 16px;
  height: 16px;
  border: 3px solid var(--semantic-border-ach-color-border-inverse);
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--component-card-background);
  pointer-events: none;
  transform: translate(-50%, -50%);
}

.company-health__range-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

.company-health__range-input::-webkit-slider-runnable-track {
  height: 100%;
  background: transparent;
}

.company-health__range-input::-webkit-slider-thumb {
  width: 1px;
  height: 100%;
  appearance: none;
  background: transparent;
}

.company-health__range-input::-moz-range-track {
  height: 100%;
  background: transparent;
}

.company-health__range-input::-moz-range-thumb {
  width: 1px;
  height: 100%;
  border: 0;
  background: transparent;
}

.company-health__meter:focus-within {
  border-radius: var(--primitives-border-radius-xs);
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: 2px;
}

.company-health__categories {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-2xs);
  line-height: var(--primitives-line-heights-3xs);
  text-align: center;
}

.company-health__category {
  padding: 4.5px 0;
}

.company-health__category--active {
  color: var(--semantic-text-ach-color-text-default);
  font-weight: 500;
}

.company-health__caption {
  margin: 0;
  padding: var(--primitives-padding-1) 0;
  color: var(--semantic-text-ach-color-text-subtle);
  font-size: var(--primitives-font-sizes-2xs);
  line-height: var(--primitives-line-heights-3xs);
  text-align: center;
}

.company-health__separator {
  height: 0;
  border-top: var(--primitives-border-width-default) solid
    var(--semantic-border-ach-color-border-default);
}

.company-health__controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-2);
  padding: var(--primitives-padding-1) 0;
}

.company-health__control {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
}

.company-health__control--term {
  align-items: flex-end;
}

.company-health__control-label {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}

.company-health__options {
  display: flex;
  flex-wrap: wrap;
  gap: 4.5px;
}

.company-health__option {
  padding: 4.5px var(--primitives-padding-2);
  border: var(--primitives-border-width-default) solid
    var(--semantic-border-ach-color-border-default);
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--component-card-background);
  color: var(--semantic-text-ach-color-text-default);
  cursor: pointer;
  font-family: inherit;
  font-size: var(--primitives-font-sizes-2xs);
  line-height: var(--primitives-line-heights-3xs);
  white-space: nowrap;
}

.company-health__option:hover {
  border-color: var(--semantic-border-ach-color-border-strong);
}

.company-health__option--selected {
  border-color: var(--component-button-solid-brand-bg);
  background: var(--component-button-solid-brand-bg);
  color: var(--component-button-solid-brand-text);
}

.company-health__option--selected:hover {
  border-color: var(--component-button-solid-brand-bg-hover);
  background: var(--component-button-solid-brand-bg-hover);
}

.company-health__option:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: 2px;
}

.company-health__simulation {
  overflow: hidden;
  border: var(--primitives-border-width-default) solid
    var(--semantic-border-ach-color-border-default);
  border-radius: var(--primitives-border-radius-md);
}

.company-health__simulation-head {
  padding: 9px var(--primitives-padding-3);
  text-align: center;
}

.company-health__simulation-eyebrow {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-2xs);
  line-height: var(--primitives-line-heights-3xs);
}

.company-health__simulation-title {
  margin: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-sm);
  font-variant-numeric: tabular-nums;
  line-height: var(--primitives-line-heights-sm);
}

.company-health__simulation-dot {
  color: var(--semantic-text-ach-color-text-subtle);
}

.company-health__comparison {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 1px minmax(0, 1fr);
  border-top: var(--primitives-border-width-default) solid
    var(--semantic-border-ach-color-border-default);
}

.company-health__comparison-column {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
  padding: 9px var(--primitives-padding-3);
}

.company-health__comparison-divider {
  background: var(--semantic-border-ach-color-border-default);
}

.company-health__comparison-label,
.company-health__comparison-total {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-2xs);
  line-height: var(--primitives-line-heights-3xs);
}

.company-health__comparison-total {
  font-variant-numeric: tabular-nums;
}

.company-health__comparison-rate {
  margin: 0;
  font-size: var(--primitives-font-sizes-md);
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  line-height: var(--primitives-line-heights-md);
  white-space: nowrap;
}

.company-health__comparison-rate--success {
  color: var(--semantic-text-success-ach-color-text-success-subtle);
}

.company-health__savings {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-3) 15px;
  border-radius: var(--primitives-border-radius-md);
  background: var(--semantic-bg-info-ach-color-bg-info-surface-subtle);
}

.company-health__savings-label {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-2xs);
  line-height: var(--primitives-line-heights-3xs);
}

.company-health__savings-value {
  margin: 0;
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-2xl);
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  letter-spacing: var(--primitives-letter-spacing-md);
  line-height: var(--primitives-line-heights-2xl);
}

.company-health__disclaimer {
  margin: 0;
  color: var(--semantic-text-ach-color-text-subtle);
  font-size: var(--primitives-font-sizes-2xs);
  line-height: var(--primitives-line-heights-3xs);
}
</style>
