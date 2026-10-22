<script setup lang="ts">
import type {
  FinancingCardPosition,
  FinancingOffer,
} from '@/components/credor/financing-offers'

defineProps<{
  offer: FinancingOffer
  position: FinancingCardPosition
}>()
</script>

<template>
  <article
    :id="'credor-financing-offer-' + offer.id"
    class="offer-card"
    :class="['offer-card--' + offer.id, 'offer-card--position-' + position]"
    :aria-label="offer.eyebrow + ' offer'"
  >
    <div class="offer-card__art" aria-hidden="true">
      <img
        v-for="(artwork, index) in offer.artwork"
        :key="artwork"
        :src="artwork"
        class="offer-card__art-layer"
        :class="'offer-card__art-layer--' + (index + 1)"
        alt=""
        draggable="false"
      />
    </div>

    <div class="offer-card__eyebrow">
      <span class="offer-card__dot" aria-hidden="true"></span>
      <span>{{ offer.eyebrow }}</span>
    </div>

    <div class="offer-card__body">
      <div class="offer-card__avatar" aria-hidden="true">{{ offer.avatar }}</div>
      <div class="offer-card__content">
        <p class="offer-card__title">{{ offer.title }}</p>
        <p class="offer-card__amount">
          <strong>{{ offer.amount }}</strong>
          <span>{{ offer.amountDetail }}</span>
        </p>
        <p class="offer-card__detail">{{ offer.detail }}</p>
        <p class="offer-card__action">{{ offer.action }}</p>
      </div>
    </div>
  </article>
</template>

<style scoped>
.offer-card {
  position: absolute;
  top: 0;
  left: 50%;
  display: flex;
  box-sizing: border-box;
  height: 141px;
  max-width: 336px;
  flex-direction: column;
  overflow: hidden;
  border: var(--primitives-border-width-default) solid var(--component-card-border);
  border-radius: var(--primitives-border-radius-md);
  background: var(--component-card-background);
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
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-body), sans-serif;
  pointer-events: none;
  transform: translate(-50%, 0);
  transition: width 500ms ease, transform 500ms ease;
}

.offer-card--position-active {
  width: 100%;
}

.offer-card--position-near {
  width: 96%;
}

.offer-card--position-far {
  width: 92%;
}

.offer-card--position-active {
  z-index: 3;
  transform: translate(-50%, 47px);
}

.offer-card--position-near {
  z-index: 2;
  transform: translate(-50%, 23px);
}

.offer-card--position-far {
  z-index: 1;
  transform: translate(-50%, 0);
}

.offer-card__art {
  position: absolute;
  z-index: 0;
  inset: 0 0 0 auto;
  width: 110px;
  overflow: hidden;
  pointer-events: none;
}

.offer-card__art-layer {
  position: absolute;
  top: 0;
  right: 0;
  display: block;
  height: 100%;
  max-width: none;
  object-fit: fill;
}

.offer-card--ar .offer-card__art-layer--1 {
  width: 88px;
}

.offer-card--ar .offer-card__art-layer--2 {
  width: 28px;
  height: 55px;
}

.offer-card--ar .offer-card__art-layer--3 {
  width: 66px;
  height: 120px;
}

.offer-card--ap .offer-card__art-layer--1 {
  width: 110px;
}

.offer-card--cash .offer-card__art-layer--1 {
  width: 92px;
}

.offer-card--cash .offer-card__art-layer--2 {
  width: 72px;
}

.offer-card--cash .offer-card__art-layer--3 {
  width: 32px;
  height: 96px;
}

.offer-card__eyebrow {
  position: relative;
  z-index: 1;
  display: flex;
  height: 24px;
  flex: 0 0 24px;
  align-items: center;
  gap: var(--primitives-padding-1);
  padding-inline: var(--primitives-padding-4);
  color: var(--semantic-brand-ach-color-brand-default);
  font-size: var(--primitives-font-sizes-2xs);
  font-weight: 600;
  line-height: var(--primitives-line-heights-4xs);
}

.offer-card--ap .offer-card__eyebrow {
  color: var(--semantic-fg-success-ach-color-fg-success-strong);
}

.offer-card--cash .offer-card__eyebrow {
  color: var(--semantic-text-warning-ach-color-text-warning);
}

.offer-card__dot {
  width: 6px;
  height: 6px;
  flex: 0 0 6px;
  border-radius: var(--primitives-border-radius-infinite);
  background: currentColor;
}

.offer-card__body {
  position: relative;
  z-index: 1;
  display: flex;
  min-height: 0;
  flex: 1;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-1) var(--primitives-padding-4) var(--primitives-padding-3);
}

.offer-card__avatar {
  display: grid;
  width: var(--primitives-padding-10);
  height: var(--primitives-padding-10);
  flex: 0 0 var(--primitives-padding-10);
  place-items: center;
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--semantic-bg-ach-color-bg-inverse);
  color: var(--semantic-text-ach-color-text-inverse);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
  line-height: 1;
}

.offer-card__content {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  padding-right: var(--primitives-padding-18);
}

.offer-card__title,
.offer-card__amount,
.offer-card__detail,
.offer-card__action {
  max-width: 100%;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.offer-card__title {
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
  line-height: var(--primitives-line-heights-xs);
}

.offer-card__amount {
  display: flex;
  min-width: 0;
  align-items: baseline;
  gap: var(--primitives-padding-1);
  line-height: var(--primitives-line-heights-2xl);
}

.offer-card__amount strong {
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-2xl);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.offer-card__amount span {
  overflow: hidden;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-2xs);
  line-height: var(--primitives-line-heights-4xs);
  text-overflow: ellipsis;
}

.offer-card__detail {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-2xs);
  line-height: var(--primitives-line-heights-4xs);
}

.offer-card__action {
  margin-top: var(--primitives-padding-1);
  color: var(--semantic-text-ach-color-text-link);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
  line-height: var(--primitives-line-heights-xs);
}

.offer-card--ap .offer-card__action {
  color: var(--semantic-fg-success-ach-color-fg-success-strong);
}

.offer-card--cash .offer-card__action {
  color: var(--semantic-text-warning-ach-color-text-warning);
}

@media (prefers-reduced-motion: reduce) {
  .offer-card {
    transition: none;
  }
}
</style>
