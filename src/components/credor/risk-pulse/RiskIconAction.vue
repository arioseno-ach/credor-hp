<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

/** A table action as an icon-only outline Button; the tooltip and the accessible name carry the label. */
const props = defineProps<{
  icon: string
  label: string
  /** Full accessible name when the tooltip alone is too short, e.g. with the company name. */
  ariaLabel?: string
  href?: string
}>()

const emits = defineEmits<{ click: [] }>()
</script>

<template>
  <Tooltip>
    <TooltipTrigger as-child>
      <Button
        v-if="href"
        as="a"
        class="icon-action"
        variant="outline"
        color="neutral"
        size="icon-sm"
        :href="href"
        target="_blank"
        rel="noopener"
        :aria-label="`${props.ariaLabel ?? label} (opens in a new tab)`"
      >
        <span class="icon-action__icon" :style="{ '--icon': `url('${icon}')` }" aria-hidden="true"></span>
      </Button>
      <Button
        v-else
        class="icon-action"
        variant="outline"
        color="neutral"
        size="icon-sm"
        type="button"
        :aria-label="props.ariaLabel ?? label"
        @click="emits('click')"
      >
        <span class="icon-action__icon" :style="{ '--icon': `url('${icon}')` }" aria-hidden="true"></span>
      </Button>
    </TooltipTrigger>
    <TooltipContent side="top">{{ label }}</TooltipContent>
  </Tooltip>
</template>

<style scoped>
.icon-action__icon {
  width: 16px;
  height: 16px;
  background: currentcolor;
  mask: var(--icon) center / contain no-repeat;
  -webkit-mask: var(--icon) center / contain no-repeat;
}

.icon-action.ach-button--outlined.ach-button--color-neutral {
  /* The Credor secondary action, as on the homepage cards: a light border on a pill. */
  border-color: var(--component-card-border);
  border-radius: var(--primitives-border-radius-infinite);
}
</style>
