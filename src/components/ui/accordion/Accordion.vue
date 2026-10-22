<script setup lang="ts">
import type { AccordionRootEmits, AccordionRootProps } from "reka-ui"
import {
  AccordionRoot,
  useForwardPropsEmits,
} from "reka-ui"

const props = defineProps<AccordionRootProps>()
const emits = defineEmits<AccordionRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <AccordionRoot v-slot="slotProps" data-slot="accordion" class="ach-accordion" v-bind="forwarded">
    <slot v-bind="slotProps" />
  </AccordionRoot>
</template>

<style scoped>
.ach-accordion {
  display: flex;
  width: 100%;
  flex-direction: column;
}
</style>
