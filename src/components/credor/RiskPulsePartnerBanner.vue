<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import RiskBandChip from '@/components/credor/risk-pulse/RiskBandChip.vue'
import RiskBlurredScore from '@/components/credor/risk-pulse/RiskBlurredScore.vue'
import { useAppView } from '@/composables/useAppView'
import { usePartnerAccess } from '@/composables/usePartnerAccess'

/**
 * A slim, fully clickable invite to the Partners page. The left slot cycles through real partners:
 * two scores already shared, then one still hidden, so the banner shows what opening a score looks like.
 */
const { openPartners } = useAppView()
const { partners } = usePartnerAccess()

const slides = computed(() => {
  // The two strongest shared scores: a promo slot is no place to single out a partner's weak band.
  const shared = partners.value
    .filter((partner) => partner.status === 'unlocked')
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
  const hidden = partners.value.find((partner) => partner.status !== 'unlocked')
  return hidden ? [...shared, hidden] : shared
})

const index = ref(0)
const slide = computed(() => slides.value[index.value % Math.max(slides.value.length, 1)])

let timer: number | undefined

onMounted(() => {
  // Motion only for people who have not asked for less of it; they see the first partner, still.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  timer = window.setInterval(() => {
    index.value = (index.value + 1) % Math.max(slides.value.length, 1)
  }, 3000)
})

onBeforeUnmount(() => window.clearInterval(timer))
</script>

<template>
  <button type="button" class="pulse-banner" @click="openPartners()">
    <!-- Decorative: the sentence beside it is the button's name. -->
    <span class="pulse-banner__slot" aria-hidden="true">
      <Transition name="pulse-slide" mode="out-in">
        <span v-if="slide" :key="slide.id" class="pulse-banner__slide">
          <span class="pulse-banner__avatar">{{ slide.initials }}</span>
          <template v-if="slide.status === 'unlocked'">
            <RiskBandChip :score="slide.score" />
            <span class="pulse-banner__score">{{ slide.score.toFixed(1) }}</span>
          </template>
          <RiskBlurredScore v-else :seed="slide.npwp" />
        </span>
      </Transition>
    </span>

    <span class="pulse-banner__text">
      <strong>Know who you sell to.</strong>
      <span class="pulse-banner__sub"> See your partners' RiskPulse scores.</span>
    </span>

    <span class="pulse-banner__chevron" aria-hidden="true"></span>
  </button>
</template>

<style scoped>
.pulse-banner {
  display: flex;
  width: 100%;
  align-items: center;
  gap: var(--primitives-padding-4);
  margin-bottom: var(--primitives-padding-4);
  padding: var(--primitives-padding-3) var(--primitives-padding-4);
  border: var(--primitives-border-width-default) solid var(--component-card-border);
  border-radius: var(--primitives-border-radius-lg);
  background: var(--component-card-background);
  color: inherit;
  cursor: pointer;
  font: inherit;
  text-align: left;
  transition: border-color var(--semantic-motion-duration-fast);
}

.pulse-banner:hover {
  border-color: var(--semantic-border-ach-color-border-strong);
}

.pulse-banner:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: var(--primitives-border-width-2);
}

/* Fixed width, so the sentence never shifts as the slides change. */
.pulse-banner__slot {
  display: flex;
  width: 168px;
  height: 28px;
  flex: 0 0 168px;
  align-items: center;
}

.pulse-banner__slide {
  display: inline-flex;
  align-items: center;
  gap: var(--primitives-padding-2);
}

.pulse-banner__avatar {
  display: grid;
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  place-items: center;
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--semantic-bg-ach-color-bg-inverse);
  color: var(--semantic-text-ach-color-text-inverse);
  font-size: var(--primitives-font-sizes-2xs);
  font-weight: 600;
}

.pulse-banner__score {
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.pulse-banner__text {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pulse-banner__text strong {
  font-weight: 600;
}

.pulse-banner__sub {
  color: var(--semantic-text-ach-color-text-secondary);
}

.pulse-banner__chevron {
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
  background: var(--semantic-text-ach-color-text-secondary);
  mask: url('/icons/ui-actions/chevron-right.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/chevron-right.svg') center / contain no-repeat;
  transition: transform var(--semantic-motion-duration-fast);
}

.pulse-banner:hover .pulse-banner__chevron {
  transform: translateX(2px);
}

/* Each partner slides up and out, the next one in. */
.pulse-slide-enter-active,
.pulse-slide-leave-active {
  transition:
    opacity var(--semantic-motion-duration-base) var(--semantic-motion-easing-emphasized),
    transform var(--semantic-motion-duration-base) var(--semantic-motion-easing-emphasized);
}

.pulse-slide-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.pulse-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (prefers-reduced-motion: reduce) {
  .pulse-banner,
  .pulse-banner__chevron,
  .pulse-slide-enter-active,
  .pulse-slide-leave-active {
    transition: none;
  }
}
</style>
