<script setup lang="ts">
import type { CompanyIdentity } from '@/components/credor/personalisation'

const props = withDefaults(
  defineProps<{
    company: CompanyIdentity
    showNpwp15?: boolean
    verified?: boolean
  }>(),
  {
    showNpwp15: false,
    verified: false,
  },
)
</script>

<template>
  <section class="company-card">
    <slot name="alert" />

    <div class="company-card__content">
      <div class="company-card__heading">
        <p class="company-card__name">{{ props.company.name }}</p>

        <span v-if="props.verified" class="company-card__badge">
          <span class="company-card__badge-icon" aria-hidden="true"></span>
          Verified
        </span>
      </div>

      <div class="company-card__row">
        <span class="company-card__label">NPWP</span>
        <span class="company-card__value">{{ props.company.npwp }}</span>
      </div>

      <div v-if="props.showNpwp15" class="company-card__row">
        <span class="company-card__label">NPWP 15</span>
        <span class="company-card__value">{{ props.company.npwp15 }}</span>
      </div>

      <div class="company-card__row">
        <span class="company-card__label">NITKU</span>
        <span class="company-card__value">{{ props.company.nitku }}</span>
      </div>

      <div class="company-card__row">
        <span class="company-card__label">Address</span>
        <span class="company-card__value">{{ props.company.address }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.company-card {
  display: flex;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  flex-direction: column;
  gap: var(--primitives-padding-2);
  padding: var(--primitives-padding-4);
  border: var(--primitives-border-width-default) solid var(--component-card-border);
  border-radius: var(--primitives-border-radius-sm);
  background: var(--component-card-background);
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-body), sans-serif;
}

.company-card__content {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--primitives-padding-2);
}

.company-card__heading {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--primitives-padding-3);
}

.company-card__name {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  font-size: var(--primitives-font-sizes-lg);
  font-weight: 500;
  letter-spacing: 0.15px;
  line-height: var(--primitives-line-heights-lg);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.company-card__badge {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: var(--primitives-padding-1);
  padding: 2px var(--primitives-padding-2);
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--semantic-bg-success-ach-color-bg-success-surface);
  color: var(--semantic-text-success-ach-color-text-success);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 400;
  line-height: var(--primitives-line-heights-2xs);
  white-space: nowrap;
}

.company-card__badge-icon {
  display: block;
  width: 12px;
  height: 12px;
  flex: 0 0 12px;
  background: currentColor;
  mask: url('/icons/ui-actions/check-circle.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/check-circle.svg') center / contain no-repeat;
}

.company-card__row {
  display: flex;
  min-width: 0;
  align-items: baseline;
  gap: var(--primitives-padding-2);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}

.company-card__label {
  min-width: 0;
  flex: 1;
  font-weight: 500;
  color: var(--semantic-text-ach-color-text-secondary);
}

.company-card__value {
  min-width: 0;
  flex: 1;
  font-weight: 400;
  color: var(--semantic-text-ach-color-text-default);
  font-variant-numeric: tabular-nums;
}
</style>
