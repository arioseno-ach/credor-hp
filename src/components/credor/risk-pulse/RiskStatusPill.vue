<script setup lang="ts">
export type StatusTone = 'warning' | 'success' | 'error' | 'neutral'

defineProps<{ tone: StatusTone; label: string }>()

// One icon per tone; the label always carries the meaning, the icon only reinforces it.
// Neutral has none: a lock read as "blocked" for states like "Not requested", which only mean nothing happened yet.
const icons: Record<StatusTone, string | null> = {
  warning: '/icons/common-actions/schedule.svg',
  success: '/icons/ui-actions/check-circle.svg',
  error: '/icons/ui-actions/cancel.svg',
  neutral: null,
}
</script>

<template>
  <span class="pill" :data-tone="tone" :style="icons[tone] ? { '--pill-icon': `url('${icons[tone]}')` } : undefined">
    <span v-if="icons[tone]" class="pill__icon" aria-hidden="true"></span>{{ label }}
  </span>
</template>

<style scoped>
.pill {
  display: inline-flex;
  align-items: center;
  gap: var(--primitives-padding-1);
  padding: 2px var(--primitives-padding-2);
  border-radius: var(--primitives-border-radius-infinite);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 500;
  line-height: var(--primitives-line-heights-xs);
  white-space: nowrap;
}

.pill[data-tone='warning'] {
  background: var(--component-badge-warning-background);
  color: var(--component-badge-warning-text);
}

.pill[data-tone='success'] {
  background: var(--component-badge-success-background);
  color: var(--component-badge-success-text);
}

.pill[data-tone='error'] {
  background: var(--component-badge-error-background);
  color: var(--component-badge-error-text);
}

.pill[data-tone='neutral'] {
  background: var(--component-badge-neutral-background);
  color: var(--semantic-text-ach-color-text-secondary);
}

.pill__icon {
  width: 14px;
  height: 14px;
  flex: 0 0 14px;
  background: currentcolor;
  mask: var(--pill-icon) center / contain no-repeat;
  -webkit-mask: var(--pill-icon) center / contain no-repeat;
}
</style>
