<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { useAppView } from '@/composables/useAppView'
import { Avatar } from '@/components/ui/avatar'
import { credorPartners } from '@/components/credor/partners'

/** The highest-activity partner stays first and carries the active-partner badge. */
const VISIBLE_PARTNERS = 4

const partners = computed(() => {
  const ranked = [...credorPartners].sort(
    (a, b) =>
      b.transactionCount - a.transactionCount ||
      b.averageTransactionValue - a.averageTransactionValue,
  )
  const featuredId = ranked[0]?.id

  return ranked
    .slice(0, VISIBLE_PARTNERS)
    .map((partner) => ({ ...partner, featured: partner.id === featuredId }))
})

const { openApply } = useAppView()
</script>

<template>
  <section class="partners" aria-labelledby="partners-title">
    <div class="partners__heading">
      <div class="partners__intro">
        <h2 id="partners-title">Partners you already work with</h2>
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
        <span v-if="partner.featured" class="partners__badge partner__badge">Most active partner</span>

        <div class="partner__identity">
          <Avatar
            :initials="partner.initials"
            verified
            variant="inverse"
            :label="`${partner.name}, verified partner`"
          />

          <div class="partner__content">
            <p class="partner__name">{{ partner.name }}</p>
            <p class="partner__meta">
              Total {{ partner.transactionCount }} Transaction · last {{ partner.lastTransaction }}
            </p>
          </div>
        </div>

        <div class="partner__footer">
          <div class="partner__value">
            <p class="partner__value-label">Avg. transaction</p>
            <p class="partner__value-amount">{{ partner.averageTransaction }}</p>
          </div>

          <Button
            variant="outline"
            color="neutral"
            size="small"
            type="button"
            class="partner__action"
            :aria-label="`Finance a new transaction with ${partner.name}`"
            @click="openApply({ kind: 'partner', partnerId: partner.id })"
          >
            Finance a new Transaction
          </Button>
        </div>
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
  padding-bottom: var(--primitives-padding-3);
}

.partners__intro {
  min-width: 0;
}

.partners__intro h2 {
  margin: 0;
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-lg);
  font-weight: 500;
  line-height: var(--primitives-line-heights-lg);
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
  display: grid;
  min-width: 0;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--primitives-padding-4);
}

.partner {
  position: relative;
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--primitives-padding-3);
  overflow: hidden;
  /* Keep the Figma 24px top inset consistent across partner cards. */
  padding: var(--primitives-padding-6) var(--primitives-padding-4) var(--primitives-padding-4);
  border: var(--primitives-border-width-default) solid var(--component-card-border);
  border-radius: var(--primitives-border-radius-lg);
  background: var(--semantic-bg-ach-color-bg-surface);
}

.partner__identity {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: var(--primitives-padding-3);
}

.partner__content {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 2px;
}

.partner__name,
.partner__meta {
  margin: 0;
}

.partner__name {
  display: block;
  overflow: hidden;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-md);
  font-weight: 500;
  line-height: var(--primitives-line-heights-md);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.partner__meta {
  overflow: hidden;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* The first card carries the factual activity badge shown in the design. */
.partners__badge {
  display: inline-flex;
  height: 24px;
  align-items: center;
  padding: 0 var(--primitives-padding-3);
  background: var(--semantic-bg-info-ach-color-bg-info-surface);
  color: var(--semantic-text-info-ach-color-text-info);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 500;
  line-height: var(--primitives-line-heights-3xs);
  white-space: nowrap;
}

.partner__badge {
  position: absolute;
  top: 0;
  right: 0;
  border-radius: 0 0 0 var(--primitives-border-radius-md);
}

/* Average and action share one row. */
.partner__footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--primitives-padding-3);
  margin-top: auto;
  padding-top: var(--primitives-padding-3);
  border-top: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
}

.partner__value {
  display: flex;
  flex-direction: column;
}

.partner__value-label {
  margin: 0;
  color: var(--semantic-text-ach-color-text-subtle);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
  white-space: nowrap;
}

.partner__value-amount {
  margin: 2px 0 0;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-md);
  font-weight: 500;
  line-height: var(--primitives-line-heights-md);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.partner__action.ach-button--outlined.ach-button--color-neutral {
  flex: 0 0 auto;
  border-color: var(--component-card-border);
}

.partner__action:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: var(--primitives-border-width-2);
}

@media (max-width: 900px) {
  .partners__list {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
