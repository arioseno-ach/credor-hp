<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'

export type AlertStatus = 'neutral' | 'success' | 'info' | 'warning' | 'error'

interface Props {
  status?: AlertStatus
  titleText?: string
  descriptionText?: string
  hasTitle?: boolean
  hasAction?: boolean
  dismissible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  status: 'neutral',
  titleText: 'Alert Title',
  descriptionText: 'Alert description goes here.',
  hasTitle: true,
  hasAction: true,
  dismissible: true,
})

const emit = defineEmits<{
  action: []
  dismiss: []
}>()

const visible = ref(true)

function dismiss() {
  visible.value = false
  emit('dismiss')
}
</script>

<template>
  <div
    v-if="visible"
    class="ach-alert"
    :class="`ach-alert--${props.status}`"
    role="alert"
    aria-atomic="true"
  >
    <slot name="icon">
      <span class="ach-alert__icon" aria-hidden="true" />
    </slot>

    <div class="ach-alert__content">
      <p v-if="props.hasTitle" class="ach-alert__title">{{ props.titleText }}</p>
      <p class="ach-alert__description">{{ props.descriptionText }}</p>
    </div>

    <div v-if="props.hasAction" class="ach-alert__action-group">
      <slot name="action">
        <Button
          class="ach-alert__action"
          variant="link"
          type="button"
          @click="emit('action')"
        >
          Button
        </Button>
      </slot>
    </div>

    <Button
      v-if="props.dismissible"
      class="ach-alert__dismiss"
      variant="ghost"
      size="icon-xs"
      type="button"
      aria-label="Dismiss alert"
      @click="dismiss"
    >
      <span class="ach-alert__dismiss-icon" aria-hidden="true" />
    </Button>
  </div>
</template>

<style scoped>
.ach-alert {
  box-sizing: border-box;
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: center;
  gap: var(--primitives-padding-3);
  border: var(--primitives-border-width-default) solid var(--alert-border);
  border-radius: var(--primitives-border-radius-sm);
  padding: var(--primitives-padding-3) var(--primitives-padding-3) var(--primitives-padding-3) var(--primitives-padding-4);
  background: var(--alert-background);
}

.ach-alert--neutral {
  --alert-background: var(--semantic-bg-ach-color-bg-surface-secondary);
  --alert-border: var(--semantic-border-ach-color-border-default);
  --alert-title: var(--semantic-text-ach-color-text-default);
  --alert-description: var(--semantic-text-ach-color-text-secondary);
  --alert-icon: var(--semantic-icon-ach-color-icon-secondary);
  --alert-action: var(--component-button-link-primary-text);
  --alert-action-hover: var(--component-button-link-primary-text-hover);
}

.ach-alert--success {
  --alert-background: var(--semantic-bg-success-ach-color-bg-success-surface);
  --alert-border: var(--semantic-border-success-ach-color-border-success);
  --alert-title: var(--semantic-text-success-ach-color-text-success);
  --alert-description: var(--semantic-text-success-ach-color-text-success);
  --alert-icon: var(--semantic-icon-success-ach-color-icon-success);
  --alert-action: var(--component-button-link-success-text);
  --alert-action-hover: var(--component-button-link-success-text-hover);
}

.ach-alert--info {
  --alert-background: var(--semantic-bg-info-ach-color-bg-info-surface);
  --alert-border: var(--semantic-border-info-ach-color-border-info);
  --alert-title: var(--semantic-text-info-ach-color-text-info);
  --alert-description: var(--semantic-text-info-ach-color-text-info);
  --alert-icon: var(--semantic-icon-info-ach-color-icon-info);
  --alert-action: var(--component-button-link-brand-text);
  --alert-action-hover: var(--component-button-link-brand-text-hover);
}

.ach-alert--warning {
  --alert-background: var(--semantic-bg-warning-ach-color-bg-warning-surface);
  --alert-border: var(--semantic-border-warning-ach-color-border-warning);
  --alert-title: var(--semantic-text-warning-ach-color-text-warning);
  --alert-description: var(--semantic-text-warning-ach-color-text-warning);
  --alert-icon: var(--semantic-icon-warning-ach-color-icon-warning);
  --alert-action: var(--component-button-link-warning-text);
  --alert-action-hover: var(--component-button-link-warning-text-hover);
}

.ach-alert--error {
  --alert-background: var(--semantic-bg-error-ach-color-bg-error-surface);
  --alert-border: var(--semantic-border-error-ach-color-border-error);
  --alert-title: var(--semantic-text-error-ach-color-text-error);
  --alert-description: var(--semantic-text-error-ach-color-text-error);
  --alert-icon: var(--semantic-icon-error-ach-color-icon-error);
  --alert-action: var(--component-button-link-error-text);
  --alert-action-hover: var(--component-button-link-error-text-hover);
}

.ach-alert__icon,
.ach-alert__dismiss-icon {
  display: block;
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  background-color: var(--alert-icon);
  mask: url('/icons/others/error-circle-rounded.svg') center / contain no-repeat;
}

.ach-alert__content {
  display: flex;
  min-width: 0;
  flex: 1 1 auto;
  flex-direction: column;
  gap: var(--primitives-padding-1);
  overflow-wrap: anywhere;
}

.ach-alert__content p {
  width: 100%;
  margin: 0;
}

.ach-alert__title {
  color: var(--alert-title);
  font-family: var(--primitives-font-families-body), sans-serif;
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-xs);
  letter-spacing: var(--primitives-letter-spacing-wide);
}

.ach-alert__description {
  color: var(--alert-description);
  font-family: var(--primitives-font-families-body), sans-serif;
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 400;
  line-height: var(--primitives-line-heights-2xs);
  letter-spacing: var(--primitives-letter-spacing-md);
}

.ach-alert__action-group {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: var(--primitives-padding-2);
}

.ach-alert__action {
  color: var(--alert-action);
}

.ach-alert__action:hover:not(:disabled) {
  color: var(--alert-action-hover);
}

.ach-alert__dismiss {
  flex: 0 0 24px;
  padding: 0;
}

.ach-alert__dismiss-icon {
  background-color: var(--alert-icon);
  mask-image: url('/icons/ui-actions/close.svg');
}
</style>