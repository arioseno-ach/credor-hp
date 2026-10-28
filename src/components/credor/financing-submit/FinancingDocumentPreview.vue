<script setup lang="ts">
import type { StyleValue } from 'vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'

const props = defineProps<{
  label: string
  fileName: string
  /** The View button that opened the preview. Reka only restores focus to a DialogTrigger. */
  returnFocus?: HTMLElement | null
}>()

function restoreFocus(event: Event) {
  if (!props.returnFocus?.isConnected) return
  event.preventDefault()
  props.returnFocus.focus()
}

const open = defineModel<boolean>('open', { required: true })

const dialogStyle: StyleValue = {
  width: 'min(calc(100% - 2rem), 560px)',
  maxWidth: '560px',
  padding: '0',
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent
      :style="dialogStyle"
      :show-close="false"
      class="document-preview"
      @close-auto-focus="restoreFocus"
    >
      <header class="document-preview__header">
        <div class="document-preview__title-group">
          <DialogTitle class="document-preview__title">{{ label }}</DialogTitle>
          <DialogDescription class="document-preview__file">{{ fileName }}</DialogDescription>
        </div>
        <button type="button" class="document-preview__close" aria-label="Close" @click="open = false">
          <img src="/icons/ui-actions/close.svg" alt="" aria-hidden="true" />
        </button>
      </header>

      <div class="document-preview__page" role="img" :aria-label="`Preview of ${fileName}`">
        <span class="document-preview__icon" aria-hidden="true"></span>
        <span>File preview is not available in this prototype</span>
      </div>

      <footer class="document-preview__footer">
        <Button variant="outline" color="neutral" type="button" class="document-preview__action" @click="open = false">
          Close
        </Button>
      </footer>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
.document-preview {
  display: flex;
  flex-direction: column;
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-body), sans-serif;
}

.document-preview__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-4);
}

.document-preview__title-group {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.document-preview__title {
  margin: 0;
  font-size: var(--primitives-font-sizes-md);
  font-weight: 600;
  line-height: var(--primitives-line-heights-md);
}

.document-preview__file {
  overflow: hidden;
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.document-preview__close {
  display: grid;
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: var(--primitives-border-radius-xs);
  background: none;
  cursor: pointer;
}

.document-preview__close:hover {
  background: var(--semantic-bg-ach-color-bg-surface-hover);
}

.document-preview__close:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: var(--primitives-border-width-2);
}

.document-preview__page {
  display: flex;
  min-height: 320px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--primitives-padding-3);
  margin: 0 var(--primitives-padding-4);
  border: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-default);
  border-radius: var(--primitives-border-radius-md);
  background: var(--semantic-bg-ach-color-bg-surface-secondary);
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.document-preview__icon {
  width: 40px;
  height: 40px;
  background: var(--semantic-icon-ach-color-icon-default);
  mask: url('/icons/text-formatting/description.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/text-formatting/description.svg') center / contain no-repeat;
}

.document-preview__footer {
  display: flex;
  justify-content: flex-end;
  padding: var(--primitives-padding-4);
}

.document-preview__action:deep(.ach-button),
.document-preview__action.ach-button {
  border-radius: var(--primitives-border-radius-infinite);
}
</style>
