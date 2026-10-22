<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

const props = defineProps<{ class?: HTMLAttributes["class"] }>()
</script>

<template>
  <div
    data-slot="dialog-header"
    :class="cn('ach-dialog-header', props.class)"
  >
    <slot />
  </div>
</template>

<style scoped>
.ach-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-4);
  padding: var(--primitives-padding-5) var(--primitives-padding-6);
}
</style>
