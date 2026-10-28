<script setup lang="ts">
import type { TimelineItem, TimelineStatus } from './types'

const props = withDefaults(
  defineProps<{
    items: TimelineItem[]
    /** Renders each title as a button, for a stepper the user can jump around in. */
    interactive?: boolean
    label?: string
  }>(),
  {
    interactive: false,
    label: undefined,
  },
)

const emits = defineEmits<{
  select: [id: string]
}>()

const statusText: Record<TimelineStatus, string> = {
  active: 'current',
  success: 'complete',
  disabled: 'not started',
}
</script>

<template>
  <ol class="ach-timeline" :aria-label="props.label">
    <li
      v-for="(item, index) in props.items"
      :key="item.id"
      class="ach-timeline__item"
      :class="`ach-timeline__item--${item.status}`"
      :aria-current="item.status === 'active' ? 'step' : undefined"
    >
      <span class="ach-timeline__indicator" aria-hidden="true">
        <span v-if="index > 0" class="ach-timeline__line ach-timeline__line--top"></span>
        <span class="ach-timeline__icon" :class="`ach-timeline__icon--${item.status}`"></span>
        <span
          v-if="index < props.items.length - 1"
          class="ach-timeline__line ach-timeline__line--bottom"
        ></span>
      </span>

      <span class="ach-timeline__content">
        <button
          v-if="props.interactive"
          type="button"
          class="ach-timeline__title ach-timeline__title--button"
          @click="emits('select', item.id)"
        >
          {{ item.title }}
          <span class="ach-timeline__sr-only">({{ statusText[item.status] }})</span>
        </button>
        <span v-else class="ach-timeline__title">
          {{ item.title }}
          <span class="ach-timeline__sr-only">({{ statusText[item.status] }})</span>
        </span>
        <span v-if="item.description" class="ach-timeline__description">{{ item.description }}</span>
      </span>
    </li>
  </ol>
</template>

<style scoped>
.ach-timeline {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0 var(--primitives-padding-2);
  list-style: none;
  font-family: var(--primitives-font-families-body), sans-serif;
}

.ach-timeline__item {
  display: flex;
  align-items: flex-start;
  gap: var(--primitives-padding-3);
}

.ach-timeline__indicator {
  display: flex;
  width: 24px;
  flex: 0 0 24px;
  flex-direction: column;
  align-items: center;
  align-self: stretch;
}

.ach-timeline__line {
  width: 2px;
  background: var(--component-timeline-line);
}

.ach-timeline__line--top {
  height: var(--primitives-padding-1);
  flex: 0 0 auto;
}

.ach-timeline__line--bottom {
  min-height: 1px;
  flex: 1 0 0;
}

.ach-timeline__icon {
  display: block;
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
}

/* Current: 10px dot inside a 24px halo at 15% opacity, as in the Figma 01 Timeline. */
.ach-timeline__icon--active {
  position: relative;
}

.ach-timeline__icon--active::before,
.ach-timeline__icon--active::after {
  position: absolute;
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--component-timeline-active-icon);
  content: '';
}

.ach-timeline__icon--active::before {
  inset: 0;
  opacity: 0.15;
}

.ach-timeline__icon--active::after {
  inset: 7px;
}

/* Pending: 22px ring with a 2px stroke. */
.ach-timeline__icon--disabled {
  box-sizing: border-box;
  border: var(--primitives-border-width-2) solid var(--component-timeline-line);
  border-radius: var(--primitives-border-radius-infinite);
}

.ach-timeline__icon--success {
  background: var(--component-timeline-success-icon);
  mask: url('/icons/ui-actions/check-circle.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/check-circle.svg') center / contain no-repeat;
}

.ach-timeline__content {
  display: flex;
  min-width: 0;
  flex: 1 0 0;
  flex-direction: column;
  gap: var(--primitives-padding-1);
  padding: var(--primitives-padding-1) 0 var(--primitives-padding-6);
}

.ach-timeline__item:last-child .ach-timeline__content {
  padding-bottom: 0;
}

.ach-timeline__title {
  overflow-wrap: break-word;
  color: var(--component-timeline-disabled-title);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-sm);
}

.ach-timeline__item--active .ach-timeline__title {
  color: var(--component-timeline-active-title);
}

.ach-timeline__item--success .ach-timeline__title {
  color: var(--component-timeline-success-title);
}

.ach-timeline__title--button {
  padding: 0;
  border: 0;
  border-radius: var(--primitives-border-radius-xs);
  background: none;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
}

.ach-timeline__title--button:hover {
  color: var(--component-timeline-default-title);
}

.ach-timeline__title--button:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: var(--primitives-border-width-2);
}

.ach-timeline__description {
  color: var(--component-timeline-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}

.ach-timeline__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
