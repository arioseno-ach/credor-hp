<script setup lang="ts">
import type { DialogContentEmits, DialogContentProps as RekaDialogContentProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import {
  DialogClose,
  DialogContent,
  DialogPortal,
  useForwardPropsEmits,
} from "reka-ui"
import { cn } from "@/lib/utils"
import DialogOverlay from "./DialogOverlay.vue"

interface DialogContentProps extends RekaDialogContentProps {
  class?: HTMLAttributes["class"]
  showClose?: boolean
}

const props = withDefaults(defineProps<DialogContentProps>(), {
  showClose: true,
})
const emits = defineEmits<DialogContentEmits>()

const delegatedProps = reactiveOmit(props, "class", "showClose")

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <DialogPortal>
    <DialogOverlay />

    <DialogContent
      data-slot="dialog-content"
      :class="cn(
        'ach-dialog-content data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-50 max-w-lg -translate-x-1/2 -translate-y-1/2',
        props.class,
      )"
      v-bind="{ ...$attrs, ...forwarded }"
    >
      <slot />

      <DialogClose
        v-if="props.showClose"
        class="ach-dialog-close focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
      >
        <img class="ach-dialog-close-icon size-4" src="/icons/ui-actions/close.svg" alt="" aria-hidden="true" />
        <span class="sr-only">Close</span>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>

<style scoped>
.ach-dialog-content {
  box-sizing: border-box;
  width: var(--ach-dialog-width, min(100% - 2rem, 32rem));
  max-width: var(--ach-dialog-max-width, 32rem);
  max-height: calc(100vh - 4rem);
  overflow: auto;
  border: var(--primitives-border-width-default) solid var(--component-card-border);
  border-radius: var(--primitives-border-radius-lg);
  background: var(--component-card-background);
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-body), sans-serif;
  box-shadow:
    calc(var(--primitives-shadows-md-shadow-1-x) * 1px)
      calc(var(--primitives-shadows-md-shadow-1-y) * 1px)
      calc(var(--primitives-shadows-md-shadow-1-blur) * 1px)
      calc(var(--primitives-shadows-md-shadow-1-spread) * 1px)
      var(--primitives-shadows-md-color),
    calc(var(--primitives-shadows-md-shadow-2-x) * 1px)
      calc(var(--primitives-shadows-md-shadow-2-y) * 1px)
      calc(var(--primitives-shadows-md-shadow-2-blur) * 1px)
      calc(var(--primitives-shadows-md-shadow-2-spread) * 1px)
      var(--primitives-shadows-md-color);
}

.ach-dialog-content:focus-visible {
  outline: none;
}

.ach-dialog-close-icon {
  display: block;
}
</style>
