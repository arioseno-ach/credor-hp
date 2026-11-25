<script setup lang="ts">
import { useSnackbar } from '@/composables/useSnackbar'

const props = defineProps<{ code: string }>()

const { show } = useSnackbar()

async function copy() {
  try {
    await navigator.clipboard.writeText(props.code)
    show({ variant: 'success', title: 'Consent code copied' })
  } catch {
    show({ variant: 'error', title: 'Could not copy the code', description: 'Select the code and copy it by hand.' })
  }
}
</script>

<template>
  <span class="code">
    <code class="code__value">{{ code }}</code>
    <button type="button" class="code__copy" :aria-label="`Copy consent code ${code}`" @click="copy">
      <span class="code__icon" aria-hidden="true"></span>
    </button>
  </span>
</template>

<style scoped>
.code {
  display: inline-flex;
  align-items: center;
  gap: var(--primitives-padding-1);
}

.code__value {
  padding: 2px var(--primitives-padding-2);
  border-radius: var(--primitives-border-radius-sm);
  background: var(--semantic-bg-ach-color-bg-surface-secondary);
  font-family: var(--primitives-font-families-body), sans-serif;
  font-variant-numeric: tabular-nums;
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
  line-height: var(--primitives-line-heights-xs);
  user-select: all;
}

.code__copy {
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: var(--primitives-border-radius-sm);
  background: none;
  color: var(--semantic-text-ach-color-text-secondary);
  cursor: pointer;
}

.code__copy:hover {
  background: var(--semantic-bg-ach-color-bg-surface-hover);
  color: var(--semantic-text-ach-color-text-default);
}

.code__copy:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: var(--primitives-border-width-2);
}

.code__icon {
  width: 16px;
  height: 16px;
  background: currentcolor;
  mask: url('/icons/text-formatting/content-copy.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/text-formatting/content-copy.svg') center / contain no-repeat;
}
</style>
