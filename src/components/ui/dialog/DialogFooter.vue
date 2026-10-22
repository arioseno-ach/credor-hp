<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

const props = defineProps<{ class?: HTMLAttributes["class"] }>()
</script>

<template>
  <div
    data-slot="dialog-footer"
    :class="cn('ach-dialog-footer flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', props.class)"
  >
    <slot />
  </div>
</template>

<style scoped>
.ach-dialog-footer {
  padding: var(--primitives-padding-4) var(--primitives-padding-6);
}
</style>
