<script setup lang="ts">
import { computed } from "vue"
import { useVModel } from "@vueuse/core"
import { cn } from "@/lib/utils"

const props = withDefaults(
  defineProps<{
    modelValue?: number
    min?: number
    max?: number
    step?: number
    disabled?: boolean
    class?: string
    ariaLabel?: string
  }>(),
  {
    modelValue: 0,
    min: 0,
    max: 100,
    step: 1,
    disabled: false,
    ariaLabel: "Slider",
  },
)

const emits = defineEmits<{
  (e: "update:modelValue", payload: number): void
}>()

const value = useVModel(props, "modelValue", emits, { passive: true })

const ratio = computed(() => {
  const range = props.max - props.min
  if (range <= 0) return 0
  return Math.min(1, Math.max(0, (value.value - props.min) / range))
})
</script>

<template>
  <input
    v-model.number="value"
    data-slot="slider"
    type="range"
    class="ach-slider"
    :class="cn(props.class)"
    :min="props.min"
    :max="props.max"
    :step="props.step"
    :disabled="props.disabled"
    :aria-label="props.ariaLabel"
    :style="{ '--slider-ratio': ratio }"
  >
</template>

<style scoped>
.ach-slider {
  width: 100%;
  height: var(--primitives-padding-4);
  margin: 0;
  padding: 0;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

.ach-slider:disabled {
  cursor: not-allowed;
}

.ach-slider::-webkit-slider-runnable-track {
  height: var(--component-slider-height);
  border-radius: var(--primitives-border-radius-infinite);
  background: linear-gradient(
    to right,
    var(--component-slider-fill) 0%,
    var(--component-slider-fill) calc(var(--slider-ratio) * 100%),
    var(--component-slider-track) calc(var(--slider-ratio) * 100%),
    var(--component-slider-track) 100%
  );
}

.ach-slider::-webkit-slider-thumb {
  width: 14px;
  height: 14px;
  margin-top: calc((var(--component-slider-height) - 14px) / 2);
  appearance: none;
  border: 2px solid var(--component-slider-handle-border);
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--component-slider-handle);
}

.ach-slider::-moz-range-track {
  height: var(--component-slider-height);
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--component-slider-track);
}

.ach-slider::-moz-range-progress {
  height: var(--component-slider-height);
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--component-slider-fill);
}

.ach-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border: 2px solid var(--component-slider-handle-border);
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--component-slider-handle);
}

.ach-slider:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--component-slider-fill);
  outline-offset: var(--primitives-border-width-2);
}
</style>
