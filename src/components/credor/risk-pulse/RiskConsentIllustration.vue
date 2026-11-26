<script setup lang="ts">
import { bandStrong } from './shared'

// Your company document on the left, the requesting company on the right, and what passes between them in the middle:
// a live stream while the request waits, a settled trail once approved, a trail that stops short once rejected.
const props = withDefaults(defineProps<{ owner: string; requester: string; state?: 'request' | 'approved' | 'rejected' }>(), {
  state: 'request',
})

const requesterLabel = { request: 'Requesting access', approved: 'Has access', rejected: 'No access' }

// The settled trail: evenly spaced dots, pale at the document and full brand blue at the requester.
const TRAIL_COUNT = 18
const trail = Array.from({ length: TRAIL_COUNT }, (_, index) => {
  const ratio = index / (TRAIL_COUNT - 1)
  return {
    index,
    approved: (0.25 + ratio * 0.75).toFixed(2),
    // Rejected: the data never leaves the left half.
    rejected: ratio < 0.4 ? (0.5 - ratio).toFixed(2) : '0',
  }
})

// Compact band bars on the document sheet so it reads as a Company Health report at a glance.
const bars = [0.45, 0.65, 0.85, 1, 0.78]

// Small particles drifting left to right, spread at the document and gathering toward the requester, like data in transit.
// A fixed seed keeps the field identical on every render.
const PARTICLE_COUNT = 40
let seed = 7
const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646

const particles = Array.from({ length: PARTICLE_COUNT }, (_, index) => {
  const duration = 3 + random() * 1.8
  const spread = (random() * 2 - 1) * 12
  return {
    index,
    size: `${(2 + random() * 2).toFixed(1)}px`,
    duration: `${duration.toFixed(2)}s`,
    // Negative delays start every particle mid-flight, so the stream is full from the first frame.
    delay: `${(-random() * duration).toFixed(2)}s`,
    yStart: `${spread.toFixed(1)}px`,
    yEnd: `${(spread * 0.25).toFixed(1)}px`,
    staticX: `${((index / (PARTICLE_COUNT - 1)) * 100).toFixed(1)}%`,
    staticOpacity: (0.15 + (index / (PARTICLE_COUNT - 1)) * 0.7).toFixed(2),
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
      <div v-if="props.state !== 'request'" class="ci__trail">
        <span
          v-for="dot in trail"
          :key="dot.index"
          class="ci__trail-dot"
          :style="{ opacity: props.state === 'approved' ? dot.approved : dot.rejected }"
        ></span>
        <span class="ci__badge" :class="`ci__badge--${props.state}`">
          <span class="ci__icon" :class="props.state === 'approved' ? 'ci__icon--check' : 'ci__icon--close'"></span>
        </span>
      </div>
      <div v-else class="ci__stream">
        <span
          v-for="particle in particles"
          :key="particle.index"
          class="ci__particle"
          :style="{
            '--size': particle.size,
            '--duration': particle.duration,
            '--delay': particle.delay,
            '--y-start': particle.yStart,
            '--y-end': particle.yEnd,
            '--static-x': particle.staticX,
            '--static-opacity': particle.staticOpacity,
          }"
        ></span>
      </div>
    </div>

    <div class="ci__node">
      <div class="ci__stage">
        <div class="ci__company-tile" :class="{ 'ci__company-tile--muted': props.state === 'rejected' }">
          <span class="ci__company-inner">
            <span class="ci__icon ci__icon--company"></span>
          </span>
        </div>
      </div>
      <div class="ci__meta">
        <p class="ci__name">{{ requester }}</p>
        <p class="ci__label">{{ requesterLabel[props.state] }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ci {
  position: relative;
  display: grid;
  box-sizing: border-box;
  width: 100%;
  grid-template-columns: repeat(2, minmax(0, 1fr));
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

.ci__node {
  position: relative;
  z-index: 1;
}

/* Spans from just past the document to just before the company tile: the visuals sit at the column centres. */
.ci__transfer {
  position: absolute;
  top: var(--primitives-padding-3);
  right: calc(25% + 32px);
  left: calc(25% + 32px);
  display: flex;
  height: 82px;
  align-items: center;
}

.ci__trail {
  position: relative;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
}

.ci__trail-dot {
  width: 3px;
  height: 3px;
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--semantic-brand-ach-color-brand-default);
}

.ci__badge {
  position: absolute;
  top: 50%;
  left: 50%;
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border: 3px solid var(--component-card-background);
  border-radius: var(--primitives-border-radius-infinite);
  transform: translate(-50%, -50%);
}

.ci__badge--approved {
  background: var(--semantic-bg-success-ach-color-bg-success-surface);
  color: var(--semantic-icon-success-ach-color-icon-success);
}

.ci__badge--rejected {
  background: var(--semantic-bg-error-ach-color-bg-error-surface);
  color: var(--semantic-icon-error-ach-color-icon-error);
}

/* The badge lands once, as the answer arrives. */
@media (prefers-reduced-motion: no-preference) {
  .ci__badge {
    animation: ci-badge-in var(--semantic-motion-duration-slow) var(--semantic-motion-easing-emphasized) both;
  }
}

@keyframes ci-badge-in {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.6);
  }
}

.ci__company-tile--muted {
  opacity: 0.5;
}

.ci__stream {
  position: relative;
  width: 100%;
  height: 32px;
}

.ci__particle {
  position: absolute;
  top: 50%;
  left: 0;
  width: var(--size);
  height: var(--size);
  margin: calc(var(--size) / -2) 0 0 calc(var(--size) / -2);
  border-radius: var(--primitives-border-radius-infinite);
  opacity: 0;
  will-change: left, transform, opacity;
  animation: ci-drift var(--duration) linear infinite;
  animation-delay: var(--delay);
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

.ci__icon--check,
.ci__icon--close {
  width: 14px;
  height: 14px;
  mask: url('/icons/ui-actions/check.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/check.svg') center / contain no-repeat;
}

.ci__icon--close {
  mask-image: url('/icons/ui-actions/close.svg');
  -webkit-mask-image: url('/icons/ui-actions/close.svg');
}

.ci__icon--company {
  width: 26px;
  height: 26px;
  mask: url('/icons/business-payments/domain.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/business-payments/domain.svg') center / contain no-repeat;
}

/* Faint and pale where it leaves the document, full brand blue as it reaches the requester. */
@keyframes ci-drift {
  0% {
    left: 0%;
    background: var(--semantic-brand-ach-color-brand-secondary);
    opacity: 0;
    transform: translateY(var(--y-start));
  }
  15% {
    opacity: 0.35;
  }
  55% {
    opacity: 0.6;
  }
  85% {
    background: var(--semantic-brand-ach-color-brand-default);
    opacity: 1;
  }
  100% {
    left: 100%;
    background: var(--semantic-brand-ach-color-brand-default);
    opacity: 0;
    transform: translateY(var(--y-end));
  }
}

@media (prefers-reduced-motion: reduce) {
  .ci__particle {
    left: var(--static-x);
    animation: none;
    background: var(--semantic-brand-ach-color-brand-default);
    opacity: var(--static-opacity);
    transform: translateY(var(--y-end));
  }
}
</style>
