<script setup lang="ts">
import type { AccordionContentProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { AccordionContent } from "reka-ui"
import { cn } from "@/lib/utils"

const props = defineProps<AccordionContentProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")
</script>

<template>
  <AccordionContent
    data-slot="accordion-content"
    v-bind="delegatedProps"
    class="ach-accordion-content-region overflow-hidden"
  >
    <div :class="cn('ach-accordion-content', props.class)">
      <slot />
    </div>
  </AccordionContent>
</template>

<style scoped>
.ach-accordion-content {
  padding-bottom: var(--component-accordion-header-padding-block);
  color: var(--component-accordion-content);
  font-family: var(--component-accordion-content-font-family), sans-serif;
  font-size: var(--component-accordion-content-font-size);
  line-height: var(--component-accordion-content-line-height);
}

.ach-accordion-content-region[data-state="open"] {
  animation: ach-accordion-expand 180ms ease-out;
}

.ach-accordion-content-region[data-state="closed"] {
  animation: ach-accordion-collapse 180ms ease-in;
}

@keyframes ach-accordion-expand {
  from {
    height: 0;
  }

  to {
    height: var(--reka-accordion-content-height);
  }
}

@keyframes ach-accordion-collapse {
  from {
    height: var(--reka-accordion-content-height);
  }

  to {
    height: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ach-accordion-content-region[data-state="open"],
  .ach-accordion-content-region[data-state="closed"] {
    animation: none;
  }
}
</style>
