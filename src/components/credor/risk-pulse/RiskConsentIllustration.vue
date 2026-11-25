<script setup lang="ts">
import { bandStrong } from './shared'

// Your company document on the left, animated sharing progress in the middle, requesting company on the right.
defineProps<{ owner: string; requester: string }>()

// Compact band bars on the document sheet so it reads as a Company Health report at a glance.
const bars = [0.45, 0.65, 0.85, 1, 0.78]

// 16 paired dots (32 total) that physically travel left to right while spiraling 180deg apart like a DNA double helix.
const HELIX_COUNT = 16
const HELIX_DURATION = 2.6
const helixPackets = Array.from({ length: HELIX_COUNT }, (_, index) => {
  const ratio = index / HELIX_COUNT
  const travelOffset = ratio * HELIX_DURATION
  // Using 1.5x offset on the same period makes both the individual dots and the helix twist flow left to right seamlessly.
  const helixOffset = travelOffset * 1.5
  const staticRatio = index / (HELIX_COUNT - 1)
  const staticAngle = staticRatio * Math.PI * 3
  return {
    index,
    travelDelay: `${(-HELIX_DURATION + travelOffset).toFixed(3)}s`,
    helixDelayA: `${(-HELIX_DURATION * 2 + helixOffset).toFixed(3)}s`,
    helixDelayB: `${(-HELIX_DURATION * 2.5 + helixOffset).toFixed(3)}s`,
    staticX: `${(staticRatio * 100).toFixed(1)}%`,
    staticOpacity: (0.2 + staticRatio * 0.8).toFixed(2),
    staticYA: `${(-Math.sin(staticAngle) * 9).toFixed(1)}px`,
    staticYB: `${(Math.sin(staticAngle) * 9).toFixed(1)}px`,
  }
})
</script>

<template>
  <div class="ci" aria-hidden="true">
    <div class="ci__node">
      <div class="ci__stage">
        <div class="ci__doc-stack">
          <div class="ci__doc-back"></div>
          <div class="ci__doc-sheet">
            <div class="ci__doc-head">
              <span class="ci__doc-badge">
                <span class="ci__icon ci__icon--doc"></span>
              </span>
              <div class="ci__doc-head-lines">
                <span class="ci__line ci__line--strong"></span>
                <span class="ci__line ci__line--short"></span>
              </div>
            </div>
            <div class="ci__doc-body">
              <span class="ci__line"></span>
              <span class="ci__line ci__line--medium"></span>
            </div>
            <div class="ci__meter">
              <span
                v-for="(height, index) in bars"
                :key="index"
                class="ci__bar"
                :style="{ height: `${height * 100}%`, background: bandStrong[index] }"
              ></span>
            </div>
          </div>
        </div>
      </div>
      <div class="ci__meta">
        <p class="ci__name">{{ owner }}</p>
        <p class="ci__label">Your document</p>
      </div>
    </div>

    <div class="ci__transfer">
      <div class="ci__helix-track">
        <span
          v-for="packet in helixPackets"
          :key="packet.index"
          class="ci__packet"
          :style="{
            '--travel-delay': packet.travelDelay,
            '--static-x': packet.staticX,
            '--static-opacity': packet.staticOpacity,
          }"
        >
          <span
            class="ci__helix-dot"
            :style="{ '--dot-delay': packet.helixDelayA, '--static-y': packet.staticYA }"
          ></span>
          <span
            class="ci__helix-dot"
            :style="{ '--dot-delay': packet.helixDelayB, '--static-y': packet.staticYB }"
          ></span>
        </span>
      </div>
    </div>

    <div class="ci__node">
      <div class="ci__stage">
        <div class="ci__company-tile">
          <span class="ci__company-inner">
            <span class="ci__icon ci__icon--company"></span>
          </span>
        </div>
      </div>
      <div class="ci__meta">
        <p class="ci__name">{{ requester }}</p>
        <p class="ci__label">Requesting access</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ci {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(88px, 148px) minmax(0, 1fr);
  align-items: start;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-3) var(--primitives-padding-2) var(--primitives-padding-2);
}

.ci__node {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  gap: var(--primitives-padding-2);
  text-align: center;
}

.ci__stage {
  display: grid;
  width: 100%;
  height: 82px;
  place-items: center;
}

.ci__doc-stack {
  position: relative;
  width: 68px;
  height: 78px;
}

.ci__doc-back {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 60px;
  height: 72px;
  border: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-default);
  border-radius: var(--primitives-border-radius-sm);
  background: var(--semantic-bg-ach-color-bg-surface-secondary);
  transform: rotate(-6deg);
  transform-origin: bottom left;
}

.ci__doc-sheet {
  position: relative;
  display: flex;
  box-sizing: border-box;
  width: 64px;
  height: 76px;
  margin-left: auto;
  flex-direction: column;
  gap: 5px;
  padding: 7px 7px 6px;
  border: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-default);
  border-radius: var(--primitives-border-radius-sm);
  background: var(--semantic-bg-ach-color-bg-surface);
  box-shadow:
    0 1px 2px var(--primitives-shadows-xs-color),
    0 2px 6px var(--primitives-shadows-xs-color);
}

.ci__doc-head {
  display: flex;
  align-items: center;
  gap: 5px;
}

.ci__doc-badge {
  display: grid;
  width: 18px;
  height: 18px;
  flex: none;
  place-items: center;
  border-radius: var(--primitives-border-radius-xs);
  background: var(--semantic-bg-ach-color-bg-surface-secondary);
  color: var(--semantic-icon-ach-color-icon-default);
}

.ci__doc-head-lines,
.ci__doc-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 3px;
}

.ci__line {
  display: block;
  width: 100%;
  height: 3px;
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--semantic-border-ach-color-border-subtle);
}

.ci__line--strong {
  background: var(--semantic-border-ach-color-border-strong);
}

.ci__line--medium {
  width: 74%;
}

.ci__line--short {
  width: 62%;
}

.ci__meter {
  display: flex;
  height: 18px;
  margin-top: auto;
  align-items: flex-end;
  gap: 3px;
}

.ci__bar {
  flex: 1;
  border-radius: 2px;
}

.ci__transfer {
  display: flex;
  width: 100%;
  height: 82px;
  align-items: center;
}

.ci__helix-track {
  position: relative;
  width: 100%;
  height: 28px;
}

.ci__packet {
  position: absolute;
  top: 0;
  left: 0;
  display: grid;
  width: 4px;
  height: 28px;
  margin-left: -2px;
  place-items: center;
  will-change: left, opacity;
  animation: ci-travel 2.6s linear infinite;
  animation-delay: var(--travel-delay);
}

.ci__helix-dot {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--semantic-brand-ach-color-brand-default);
  will-change: transform, opacity;
  animation: ci-helix 2.6s linear infinite;
  animation-delay: var(--dot-delay);
}

.ci__company-tile {
  display: grid;
  width: 72px;
  height: 72px;
  place-items: center;
  border: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-default);
  border-radius: var(--primitives-border-radius-lg);
  background: var(--semantic-bg-ach-color-bg-surface);
  box-shadow:
    0 1px 2px var(--primitives-shadows-xs-color),
    0 2px 6px var(--primitives-shadows-xs-color);
}

.ci__company-inner {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: var(--primitives-border-radius-md);
  background: var(--semantic-bg-ach-color-bg-surface-secondary);
  color: var(--semantic-icon-ach-color-icon-default);
}

.ci__meta {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.ci__name {
  margin: 0;
  max-width: 100%;
  overflow: hidden;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
  line-height: var(--primitives-line-heights-xs);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ci__label {
  margin: 0;
  color: var(--semantic-text-ach-color-text-subtle);
  font-size: var(--primitives-font-sizes-2xs);
  font-weight: 500;
  line-height: var(--primitives-line-heights-3xs);
}

.ci__icon {
  display: block;
  background: currentcolor;
}

.ci__icon--doc {
  width: 12px;
  height: 12px;
  mask: url('/icons/text-formatting/description.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/text-formatting/description.svg') center / contain no-repeat;
}

.ci__icon--company {
  width: 26px;
  height: 26px;
  mask: url('/icons/business-payments/domain.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/business-payments/domain.svg') center / contain no-repeat;
}

@keyframes ci-travel {
  0% {
    left: 0%;
    opacity: 0;
  }
  12% {
    opacity: 0.24;
  }
  45% {
    opacity: 0.62;
  }
  82% {
    opacity: 1;
  }
  92% {
    opacity: 0.85;
  }
  100% {
    left: 100%;
    opacity: 0;
  }
}

@keyframes ci-helix {
  0% {
    z-index: 2;
    background: var(--semantic-brand-ach-color-brand-default);
    opacity: 1;
    transform: translateY(0) scale(1.12);
  }
  12.5% {
    z-index: 2;
    background: var(--semantic-brand-ach-color-brand-default);
    opacity: 0.94;
    transform: translateY(-6.5px) scale(1.04);
  }
  25% {
    z-index: 1;
    background: var(--semantic-brand-ach-color-brand-secondary);
    opacity: 0.78;
    transform: translateY(-9px) scale(0.9);
  }
  37.5% {
    z-index: 1;
    background: var(--semantic-brand-ach-color-brand-muted);
    opacity: 0.54;
    transform: translateY(-6.5px) scale(0.74);
  }
  50% {
    z-index: 1;
    background: var(--semantic-brand-ach-color-brand-subtle);
    opacity: 0.34;
    transform: translateY(0) scale(0.62);
  }
  62.5% {
    z-index: 1;
    background: var(--semantic-brand-ach-color-brand-muted);
    opacity: 0.54;
    transform: translateY(6.5px) scale(0.74);
  }
  75% {
    z-index: 1;
    background: var(--semantic-brand-ach-color-brand-secondary);
    opacity: 0.78;
    transform: translateY(9px) scale(0.9);
  }
  87.5% {
    z-index: 2;
    background: var(--semantic-brand-ach-color-brand-default);
    opacity: 0.94;
    transform: translateY(6.5px) scale(1.04);
  }
  100% {
    z-index: 2;
    background: var(--semantic-brand-ach-color-brand-default);
    opacity: 1;
    transform: translateY(0) scale(1.12);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ci__packet {
    left: var(--static-x);
    animation: none;
    opacity: var(--static-opacity);
  }

  .ci__helix-dot {
    animation: none;
    background: var(--semantic-brand-ach-color-brand-default);
    opacity: 0.85;
    transform: translateY(var(--static-y));
  }
}
</style>
