<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { usePersonalisationDrawer } from '@/composables/usePersonalisationDrawer'
import CredorFinancingOfferCard from '@/components/CredorFinancingOfferCard.vue'
import {
  financingOffers,
  type FinancingCardPosition,
} from '@/components/credor/financing-offers'

const { open: openPersonalisation } = usePersonalisationDrawer()

const activeIndex = ref(0)
const isPlaying = ref(true)
let rotationTimer: number | undefined

const activeOffer = computed(() => financingOffers[activeIndex.value])

function getCardPosition(index: number): FinancingCardPosition {
  if (index === activeIndex.value) return 'active'
  if (index === (activeIndex.value + 1) % financingOffers.length) return 'near'
  return 'far'
}

function stopRotation() {
  if (rotationTimer !== undefined) {
    window.clearInterval(rotationTimer)
    rotationTimer = undefined
  }
}

function startRotation() {
  stopRotation()
  if (!isPlaying.value) return

  rotationTimer = window.setInterval(() => {
    activeIndex.value = (activeIndex.value + 1) % financingOffers.length
  }, 5000)
}

function selectOffer(index: number) {
  activeIndex.value = index
  startRotation()
}

function toggleRotation() {
  isPlaying.value = !isPlaying.value
  startRotation()
}

onMounted(startRotation)
onBeforeUnmount(stopRotation)
</script>

<template>
  <section class="credor-financing-banner" aria-labelledby="financing-banner-title">
    <div class="credor-financing-banner__content">
      <h2 id="financing-banner-title">
        Get up to Rp5 billion in financing<br />
        from your business transactions
      </h2>

      <ul class="credor-financing-banner__benefits">
        <li>
          <img src="/icons/ui-actions/check-circle.svg" alt="" aria-hidden="true" />
          <span>Unlock working capital from your business transactions.</span>
        </li>
        <li>
          <img src="/icons/ui-actions/check-circle.svg" alt="" aria-hidden="true" />
          <span>Funds disbursed within 24 hours of approval.</span>
        </li>
        <li>
          <img src="/icons/ui-actions/check-circle.svg" alt="" aria-hidden="true" />
          <span>One application, multiple financing options.</span>
        </li>
      </ul>

      <button
        type="button"
        class="credor-financing-banner__cta"
        @click="openPersonalisation()"
      >
        Get Financing Solution Now
      </button>
      <p class="credor-financing-banner__compliance">
        All financing partners are licensed and supervised by OJK.
      </p>
    </div>

    <div
      class="credor-financing-banner__carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="Financing offers"
    >
      <div class="credor-financing-banner__card-stack">
        <CredorFinancingOfferCard
          v-for="(offer, index) in financingOffers"
          :key="offer.id"
          :offer="offer"
          :position="getCardPosition(index)"
          :aria-hidden="index !== activeIndex"
        />
      </div>

      <div
        class="credor-financing-banner__controls"
        role="group"
        aria-label="Financing offer controls"
      >
        <div class="credor-financing-banner__selectors" role="group" aria-label="Choose an offer">
          <Button
            v-for="(offer, index) in financingOffers"
            :key="offer.id"
            type="button"
            variant="secondary"
            color="neutral"
            size="xs"
            class="credor-financing-banner__selector"
            :class="{ 'credor-financing-banner__selector--active': index === activeIndex }"
            :aria-pressed="index === activeIndex"
            :aria-controls="'credor-financing-offer-' + offer.id"
            @click="selectOffer(index)"
          >
            {{ offer.selectorLabel }}
          </Button>
        </div>

        <Button
          type="button"
          variant="secondary"
          color="neutral"
          size="icon-xs"
          class="credor-financing-banner__playback"
          :aria-label="isPlaying ? 'Pause automatic rotation' : 'Play automatic rotation'"
          :aria-pressed="isPlaying"
          @click="toggleRotation"
        >
          <template #leadingIcon>
            <img
              :src="isPlaying ? '/icons/audio-video/pause.svg' : '/icons/audio-video/play-arrow.svg'"
              alt=""
              aria-hidden="true"
              width="16"
              height="16"
            />
          </template>
        </Button>
      </div>

      <span class="sr-only" :aria-live="isPlaying ? 'off' : 'polite'" aria-atomic="true">
        {{ activeOffer.eyebrow }} offer selected
      </span>
    </div>
  </section>
</template>

<style scoped>
.credor-financing-banner {
  position: relative;
  isolation: isolate;
  box-sizing: border-box;
  min-height: 270px;
  overflow: hidden;
  border-radius: var(--primitives-border-radius-lg);
  background-color: var(--semantic-brand-ach-color-brand-default);
  background-image:
    linear-gradient(
      90deg,
      color-mix(in srgb, var(--primitives-colors-blue-700) 56%, transparent) 0%,
      color-mix(in srgb, var(--primitives-colors-blue-700) 34%, transparent) 56%,
      transparent 100%
    ),
    url('/images/credor/financing/banner-background.png');
  background-position: center;
  background-size: cover;
}

.credor-financing-banner__content {
  position: absolute;
  top: var(--primitives-padding-6);
  left: var(--primitives-padding-6);
  z-index: 1;
  display: flex;
  width: 525px;
  height: 222px;
  max-width: none;
  flex-direction: column;
  align-items: flex-start;
  color: var(--semantic-text-ach-color-text-inverse);
}

.credor-financing-banner__content h2 {
  margin: 0;
  color: inherit;
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-2xl);
  font-weight: 700;
  line-height: var(--primitives-line-heights-2xl);
  letter-spacing: var(--primitives-letter-spacing-md);
  margin-bottom: var(--primitives-padding-4);
}

.credor-financing-banner__benefits {
  display: grid;
  gap: var(--primitives-padding-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.credor-financing-banner__benefits li {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-2);
  color: var(--semantic-text-ach-color-text-inverse);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 400;
  line-height: var(--primitives-line-heights-2xs);
}

.credor-financing-banner__benefits img {
  width: var(--primitives-padding-4);
  height: var(--primitives-padding-4);
  flex: 0 0 var(--primitives-padding-4);
  filter: brightness(0) invert(1);
}

.credor-financing-banner__cta {
  display: inline-flex;
  min-height: var(--primitives-padding-8);
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
  border-radius: var(--primitives-border-radius-infinite);
  padding: var(--primitives-padding-2) var(--primitives-padding-4);
  background: var(--semantic-bg-ach-color-bg-inverse);
  color: var(--semantic-text-ach-color-text-inverse);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
  line-height: var(--primitives-line-heights-3xs);
  white-space: nowrap;
  margin-top: var(--primitives-padding-4);
  border: 0;
  cursor: pointer;
  font-family: inherit;
  transition:
    background 150ms ease,
    color 150ms ease;
}

.credor-financing-banner__cta:hover {
  background: var(--semantic-border-ach-color-border-inverse);
}

.credor-financing-banner__cta:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-inverse);
  outline-offset: var(--primitives-border-width-2);
}

.credor-financing-banner__compliance {
  margin: 0;
  color: var(--semantic-text-ach-color-text-inverse);
  font-size: var(--primitives-font-sizes-2xs);
  font-weight: 400;
  line-height: var(--primitives-line-heights-4xs);
  opacity: 0.9;
  margin-top: var(--primitives-padding-4);
}

.credor-financing-banner__carousel {
  position: absolute;
  top: var(--primitives-padding-6);
  right: var(--primitives-padding-8);
  z-index: 1;
  display: flex;
  width: 336px;
  flex-direction: column;
}

.credor-financing-banner__card-stack {
  position: relative;
  width: 100%;
  height: 188px;
}

.credor-financing-banner__controls {
  display: flex;
  width: 100%;
  height: var(--semantic-button-size-mini-height);
  align-items: center;
  margin-top: var(--primitives-padding-3);
  gap: var(--primitives-padding-2);
}

.credor-financing-banner__selectors {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-2);
}

.credor-financing-banner .credor-financing-banner__selector,
.credor-financing-banner .credor-financing-banner__playback {
  border: var(--primitives-border-width-default) solid
    color-mix(in srgb, var(--semantic-text-ach-color-text-inverse) 32%, transparent);
  border-radius: var(--primitives-border-radius-infinite);
  background: color-mix(in srgb, var(--semantic-text-ach-color-text-inverse) 16%, transparent);
  color: var(--semantic-text-ach-color-text-inverse);
  box-shadow: none;
}

.credor-financing-banner .credor-financing-banner__selector {
  min-width: var(--semantic-button-size-mini-height);
  height: var(--semantic-button-size-mini-height);
  padding-inline: var(--primitives-padding-2);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}

.credor-financing-banner .credor-financing-banner__selector--active {
  border-color: color-mix(in srgb, var(--semantic-text-ach-color-text-inverse) 56%, transparent);
  background: color-mix(in srgb, var(--semantic-text-ach-color-text-inverse) 28%, transparent);
}

.credor-financing-banner .credor-financing-banner__playback {
  margin-left: auto;
  width: var(--semantic-button-size-mini-height);
  height: var(--semantic-button-size-mini-height);
  padding: 0;
}

.credor-financing-banner .credor-financing-banner__playback img {
  display: block;
  width: var(--primitives-padding-4);
  height: var(--primitives-padding-4);
  filter: brightness(0) invert(1);
}

.credor-financing-banner .credor-financing-banner__selector:focus-visible,
.credor-financing-banner .credor-financing-banner__playback:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-inverse);
  outline-offset: var(--primitives-border-width-2);
}

.credor-financing-banner .credor-financing-banner__selector:is(:hover, :active):not(:disabled),
.credor-financing-banner .credor-financing-banner__playback:is(:hover, :active):not(:disabled) {
  background: color-mix(in srgb, var(--semantic-text-ach-color-text-inverse) 24%, transparent);
}

.credor-financing-banner
  .credor-financing-banner__selector--active:is(:hover, :active):not(:disabled) {
  background: color-mix(in srgb, var(--semantic-text-ach-color-text-inverse) 36%, transparent);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  clip-path: inset(50%);
}

@container credor-main (max-width: 760px) {
  .credor-financing-banner {
    display: flex;
    min-height: auto;
    flex-direction: column;
    gap: var(--primitives-padding-6);
    padding: var(--primitives-padding-6);
  }

  .credor-financing-banner__content {
    position: relative;
    top: auto;
    left: auto;
    width: 100%;
    height: auto;
    max-width: none;
  }

  .credor-financing-banner__carousel {
    position: relative;
    top: auto;
    right: auto;
    width: min(336px, 100%);
    align-self: center;
  }
}

@container credor-main (max-width: 420px) {
  .credor-financing-banner {
    padding: var(--primitives-padding-4);
  }

  .credor-financing-banner__content h2 {
    font-size: var(--primitives-font-sizes-xl);
    line-height: var(--primitives-line-heights-xl);
  }
}
</style>
