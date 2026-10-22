<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { credorPartners } from '@/components/credor/partners'

/** The partner with the most transactions and the largest average transaction is highlighted. */
const partners = computed(() => {
  const ranked = [...credorPartners].sort(
    (a, b) =>
      b.transactionCount - a.transactionCount ||
      b.averageTransactionValue - a.averageTransactionValue,
  )
  const featuredId = ranked[0]?.id

  return ranked.map((partner) => ({ ...partner, featured: partner.id === featuredId }))
})
</script>

<template>
  <section class="partners" aria-labelledby="partners-title">
    <div class="partners__heading">
      <div class="partners__intro">
        <h2 id="partners-title">Partners you already work with</h2>
        <p>
          Start a new transaction with any of them and get a financing offer. Based on your
          tax records.
        </p>
      </div>
      <button type="button" class="partners__see-all">See All</button>
    </div>

    <div class="partners__list">
      <article
        v-for="partner in partners"
        :key="partner.id"
        class="partner"
        :class="{ 'partner--featured': partner.featured }"
      >
        <span v-if="partner.featured" class="partners__badge">
          <span class="partners__badge-icon" aria-hidden="true"></span>
          Higher chance of approval
        </span>

        <Avatar
          :initials="partner.initials"
          verified
          :label="`${partner.name}, verified partner`"
        />

        <div class="partner__content">
          <p class="partner__name">{{ partner.name }}</p>
          <p class="partner__meta">{{ partner.meta }}</p>
        </div>

        <div class="partner__value">
          <p class="partner__value-label">Avg. transaction</p>
          <p class="partner__value-amount">{{ partner.averageTransaction }}</p>
        </div>

        <Button
          variant="outline"
          color="primary"
          size="small"
          type="button"
          class="partner__action"
        >
          Finance a new Transaction
          <template #trailingIcon>
            <span class="partner__action-icon" aria-hidden="true"></span>
          </template>
        </Button>
      </article>
    </div>
  </section>
</template>

<style scoped>
.partners {
  min-width: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-body), sans-serif;
}

.partners__heading {
  display: flex;
  min-height: 43px;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-3);
  padding-bottom: var(--primitives-padding-4);
}

.partners__intro {
  min-width: 0;
}

.partners__intro h2 {
  margin: 0;
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-md);
  font-weight: 500;
  line-height: var(--primitives-line-heights-md);
}

.partners__intro p {
  margin: var(--primitives-padding-1) 0 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 400;
  line-height: var(--primitives-line-heights-sm);
}

.partners__see-all {
  display: inline-flex;
  min-height: var(--primitives-padding-9);
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  padding: var(--primitives-padding-2) var(--primitives-padding-4);
  border: 0;
  border-radius: var(--primitives-border-radius-infinite);
  background: none;
  color: var(--semantic-text-ach-color-text-link);
  cursor: pointer;
  font-family: inherit;
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-xs);
  white-space: nowrap;
}

.partners__see-all:hover {
  text-decoration: underline;
}

.partners__see-all:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: var(--primitives-border-width-2);
  border-radius: var(--primitives-border-radius-sm);
}

.partners__list {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--primitives-padding-3);
}

.partners__badge {
  position: absolute;
  z-index: 1;
  top: -12px;
  right: 0;
  display: inline-flex;
  height: 26px;
  align-items: center;
  gap: var(--primitives-padding-2);
  padding: 0 var(--primitives-padding-3) 0 var(--primitives-padding-2);
  border-radius: var(--primitives-border-radius-lg);
  background: var(--semantic-fg-success-ach-color-fg-success);
  color: var(--semantic-text-ach-color-text-inverse);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 700;
  line-height: var(--primitives-line-heights-3xs);
  white-space: nowrap;
}

.partners__badge-icon {
  width: 14px;
  height: 14px;
  flex: 0 0 14px;
  background: var(--semantic-text-ach-color-text-inverse);
  mask: url('/icons/text-formatting/percent.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/text-formatting/percent.svg') center / contain no-repeat;
}

.partner {
  position: relative;
  display: flex;
  min-width: 0;
  align-items: center;
  gap: var(--primitives-padding-4);
  padding: var(--primitives-padding-4) var(--primitives-padding-6) var(--primitives-padding-4)
    var(--primitives-padding-5);
  border-radius: var(--primitives-border-radius-lg);
  background: var(--semantic-bg-ach-color-bg-canvas);
  transition:
    box-shadow 150ms ease,
    transform 150ms ease;
}

.partner:hover {
  box-shadow:
    calc(var(--primitives-shadows-sm-shadow-1-x) * 1px)
      calc(var(--primitives-shadows-sm-shadow-1-y) * 1px)
      calc(var(--primitives-shadows-sm-shadow-1-blur) * 1px)
      var(--primitives-shadows-sm-color),
    calc(var(--primitives-shadows-sm-shadow-2-x) * 1px)
      calc(var(--primitives-shadows-sm-shadow-2-y) * 1px)
      calc(var(--primitives-shadows-sm-shadow-2-blur) * 1px)
      var(--primitives-shadows-sm-color);
  transform: translateY(-2px);
}

.partner--featured {
  background:
    radial-gradient(
      ellipse 70% 140% at 100% 50%,
      var(--semantic-bg-success-ach-color-bg-success-surface) 0%,
      transparent 70%
    ),
    var(--semantic-bg-ach-color-bg-canvas);
}

.partner__content {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}

.partner__name,
.partner__meta {
  margin: 0;
}

.partner__name {
  overflow: hidden;
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-md);
  font-weight: 500;
  line-height: var(--primitives-line-heights-md);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.partner__meta {
  padding-top: 5px;
  overflow: hidden;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 400;
  line-height: var(--primitives-line-heights-sm);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.partner__value {
  display: flex;
  width: 130px;
  flex: 0 0 130px;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
}

.partner__value-label {
  margin: 0;
  color: var(--semantic-text-ach-color-text-subtle);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 400;
  line-height: var(--primitives-line-heights-2xs);
  white-space: nowrap;
}

.partner__value-amount {
  margin: 5px 0 0;
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-lg);
  font-weight: 500;
  line-height: var(--primitives-line-heights-lg);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.partner__action {
  flex: 0 0 auto;
  background: transparent;
  box-shadow:
    calc(var(--primitives-shadows-xs-x) * 1px)
      calc(var(--primitives-shadows-xs-y) * 1px)
      calc(var(--primitives-shadows-xs-blur) * 1px)
      var(--primitives-shadows-xs-color);
}

.partner__action:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: var(--primitives-border-width-2);
}

.partner__action-icon {
  display: block;
  width: 16px;
  height: 16px;
  background: currentColor;
  mask: url('/icons/ui-actions/arrow-forward.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/arrow-forward.svg') center / contain no-repeat;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
