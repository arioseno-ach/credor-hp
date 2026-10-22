<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { useVModel } from "@vueuse/core"
import { cn } from "@/lib/utils"

const props = defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
  class?: HTMLAttributes["class"]
}>()

const emits = defineEmits<{
  (e: "update:modelValue", payload: string | number): void
}>()

const modelValue = useVModel(props, "modelValue", emits, {
  passive: true,
  defaultValue: props.defaultValue,
})
</script>

<template>
  <input
    v-model="modelValue"
    data-slot="input"
    :class="cn(
      'ach-input h-9 w-full min-w-0 rounded-md border px-3 py-1 text-sm outline-none transition-colors disabled:pointer-events-none disabled:cursor-not-allowed',
      props.class,
    )"
  >
</template>

<style scoped>
.ach-input {
  border-color: var(--component-input-border);
  border-radius: var(--primitives-border-radius-sm);
  background: var(--component-input-background);
  color: var(--component-input-text);
}

.ach-input::placeholder {
  color: var(--component-input-placeholder);
}

.ach-input:focus-visible {
  border-color: var(--component-input-border-focus);
  outline: var(--primitives-border-width-2) solid var(--component-input-border-focus);
  outline-offset: var(--primitives-border-width-2);
}

.ach-input[aria-invalid="true"] {
  border-color: var(--component-input-border-error);
}

.ach-input[aria-invalid="true"]:focus-visible {
  outline-color: var(--component-input-border-error);
}

.ach-input:disabled {
  border-color: var(--component-input-border);
  background: var(--component-input-field-background-disabled);
  color: var(--component-input-field-text-disabled);
}
</style>
