<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    label?: string
    class?: HTMLAttributes['class']
    labelClass?: HTMLAttributes['class']
  }>(),
  {
    modelValue: false,
    label: '',
  },
)

const emits = defineEmits<{
  'update:modelValue': [payload: boolean]
}>()

function toggle(event: Event): void {
  emits('update:modelValue', (event.target as HTMLInputElement).checked)
}
</script>

<template>
  <label :class="cn('ach-checkbox', props.class)">
    <input
      type="checkbox"
      class="ach-checkbox__input"
      :checked="props.modelValue"
      @change="toggle"
    >
    <span :class="cn('ach-checkbox__label', props.labelClass)">
      <slot>{{ props.label }}</slot>
    </span>
  </label>
</template>

<style scoped>
.ach-checkbox {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: var(--primitives-padding-2);
  color: var(--component-checkbox-text);
  cursor: pointer;
  font-family: var(--primitives-font-families-body), sans-serif;
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 400;
  line-height: var(--primitives-line-heights-sm);
}

.ach-checkbox__input {
  display: grid;
  width: 14px;
  height: 14px;
  flex: 0 0 14px;
  margin: 3px 0 0;
  appearance: none;
  place-content: center;
  border: var(--primitives-border-width-default) solid var(--component-checkbox-border);
  border-radius: var(--primitives-border-radius-xs);
  background: var(--component-checkbox-background);
  cursor: pointer;
  transition:
    background 150ms ease,
    border-color 150ms ease;
}

.ach-checkbox__input:checked {
  border-color: var(--component-checkbox-checked-border);
  background: var(--component-checkbox-checked-background);
}

.ach-checkbox__input:checked::after {
  display: block;
  width: 10px;
  height: 10px;
  background: var(--component-checkbox-check);
  content: '';
  mask: url('/icons/ui-actions/check.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/check.svg') center / contain no-repeat;
}

.ach-checkbox__input:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--component-checkbox-focus);
  outline-offset: var(--primitives-border-width-2);
}

.ach-checkbox__label {
  min-width: 0;
  flex: 1;
}
</style>
