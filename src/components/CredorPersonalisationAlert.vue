<script setup lang="ts">
import { Alert } from '@/components/ui/alert'
</script>

<template>
  <Alert
    class="personalisation-alert"
    status="info"
    :has-title="false"
    description-text="Your personalisation is in progress - finish reviewing and adding account connections now to submit your application"
    :has-action="true"
    :dismissible="false"
  >
    <template #action>
      <button type="button" class="personalisation-alert__action">
        Resume Application
        <span class="personalisation-alert__action-icon" aria-hidden="true"></span>
      </button>
    </template>
  </Alert>
</template>

<style scoped>
.personalisation-alert__action {
  display: inline-flex;
  min-height: 24px;
  align-items: center;
  gap: var(--primitives-padding-1);
  padding: var(--primitives-padding-1) var(--primitives-padding-3);
  border: 0;
  border-radius: var(--primitives-border-radius-infinite);
  background: none;
  color: var(--semantic-text-ach-color-text-link);
  cursor: pointer;
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-2xs);
  font-weight: 500;
  line-height: var(--primitives-line-heights-4xs);
}

.personalisation-alert__action:hover {
  text-decoration: underline;
}

.personalisation-alert__action:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: var(--primitives-border-width-2);
}

.personalisation-alert__action-icon {
  width: 12px;
  height: 12px;
  flex: 0 0 12px;
  background: var(--semantic-text-ach-color-text-link);
  mask: url('/icons/ui-actions/chevron-right.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/chevron-right.svg') center / contain no-repeat;
}
</style>
