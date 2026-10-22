<script setup lang="ts">
import type { AccordionTriggerProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import {
  AccordionHeader,
  AccordionTrigger,
} from "reka-ui"
import { cn } from "@/lib/utils"

const props = defineProps<AccordionTriggerProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")
</script>

<template>
  <AccordionHeader class="flex">
    <AccordionTrigger
      data-slot="accordion-trigger"
      v-bind="delegatedProps"
      :class="cn('ach-accordion-trigger', props.class)"
    >
      <slot />
      <slot name="icon">
        <img
          class="ach-accordion-trigger__icon"
          src="/icons/ui-actions/expand-more.svg"
          alt=""
          aria-hidden="true"
        />
      </slot>
    </AccordionTrigger>
  </AccordionHeader>
</template>

<style scoped>
.ach-accordion-trigger {
  display: flex;
  width: 100%;
  min-height: calc(
    var(--component-accordion-header-padding-block) * 2 +
      var(--component-accordion-title-line-height)
  );
  align-items: center;
  justify-content: space-between;
  gap: var(--component-accordion-header-gap);
  padding: var(--component-accordion-header-padding-block) 0;
  border: 0;
  border-radius: var(--primitives-border-radius-xs);
  background: transparent;
  color: var(--component-accordion-title);
  font-family: var(--component-accordion-title-font-family), sans-serif;
  font-size: var(--component-accordion-title-font-size);
  font-weight: 500;
  line-height: var(--component-accordion-title-line-height);
  text-align: left;
  cursor: pointer;
  outline: none;
  transition: background-color 150ms ease-out;
}

.ach-accordion-trigger:hover:not(:disabled) {
  background: var(--component-accordion-background-hover);
}

.ach-accordion-trigger:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--component-input-border-focus);
  outline-offset: calc(-1 * var(--primitives-border-width-2));
}

.ach-accordion-trigger:disabled {
  color: var(--component-accordion-title-disabled);
  cursor: not-allowed;
}

.ach-accordion-trigger__icon {
  display: block;
  width: var(--component-accordion-icon-size);
  height: var(--component-accordion-icon-size);
  flex: 0 0 var(--component-accordion-icon-size);
  transition: transform 150ms ease-out;
}

.ach-accordion-trigger[data-state="open"] .ach-accordion-trigger__icon {
  transform: rotate(180deg);
}

@media (prefers-reduced-motion: reduce) {
  .ach-accordion-trigger,
  .ach-accordion-trigger__icon {
    transition: none;
  }
}
</style>
