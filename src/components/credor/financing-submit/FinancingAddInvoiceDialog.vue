<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { StyleValue } from 'vue'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import type { CredorTransaction } from '@/components/credor/transactions'
import { formatRupiah } from '@/lib/loan-calculator'

const props = defineProps<{
  candidates: CredorTransaction[]
  itemLabel: string
  /** Partner name when the list is limited to one partner. */
  partnerName?: string
  /** The Add invoice button. Reka only restores focus to a DialogTrigger. */
  returnFocus?: HTMLElement | null
}>()

const emits = defineEmits<{
  attach: [id: string]
}>()

const open = defineModel<boolean>('open', { required: true })

const selectedId = ref<string | null>(null)
const attaching = ref(false)
const itemName = computed(() => props.itemLabel.replace(/s$/, ''))

const dialogStyle: StyleValue = {
  width: 'min(calc(100% - 2rem), 640px)',
  maxWidth: '640px',
  padding: '0',
}

const initials = (name: string) =>
  name
    .split(' ')
    .filter((word) => !/^(pt|cv|ud|tb|co)$/i.test(word))
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()

let attachTimer: number | undefined

function attach() {
  if (!selectedId.value || attaching.value) return
  attaching.value = true
  const id = selectedId.value
  attachTimer = window.setTimeout(() => {
    attaching.value = false
    emits('attach', id)
    open.value = false
  }, 600)
}

function restoreFocus(event: Event) {
  if (!props.returnFocus?.isConnected) return
  event.preventDefault()
  props.returnFocus.focus()
}

function guardClose(event: Event) {
  if (attaching.value) event.preventDefault()
}

watch(open, (value) => {
  if (value) {
    selectedId.value = null
    attaching.value = false
  } else {
    window.clearTimeout(attachTimer)
  }
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent
      :style="dialogStyle"
      :show-close="false"
      class="add-invoice"
      @close-auto-focus="restoreFocus"
      @escape-key-down="guardClose"
      @interact-outside="guardClose"
    >
      <header class="add-invoice__header">
        <div class="add-invoice__title-group">
          <DialogTitle class="add-invoice__title">Add {{ itemName }}</DialogTitle>
          <DialogDescription class="add-invoice__description">
            <template v-if="partnerName">Open {{ itemLabel }} to {{ partnerName }}.</template>
            <template v-else>Open {{ itemLabel }} recorded in Achilles.</template>
            Its documents are attached automatically.
          </DialogDescription>
        </div>
        <button
          type="button"
          class="add-invoice__close"
          aria-label="Close"
          :disabled="attaching"
          @click="open = false"
        >
          <img src="/icons/ui-actions/close.svg" alt="" aria-hidden="true" />
        </button>
      </header>

      <fieldset class="add-invoice__list">
        <legend class="add-invoice__sr-only">Add {{ itemName }}</legend>
        <label
          v-for="row in candidates"
          :key="row.id"
          class="add-invoice__choice"
          :class="{ 'add-invoice__choice--selected': selectedId === row.id }"
        >
          <input
            type="radio"
            name="add-invoice"
            :checked="selectedId === row.id"
            @change="selectedId = row.id"
          />
          <Avatar :initials="initials(row.counterparty)" />
          <span class="add-invoice__identity">
            <span class="add-invoice__name">{{ row.counterparty }}</span>
            <span class="add-invoice__meta">{{ row.invoiceNumber }}</span>
          </span>
          <span class="add-invoice__due">
            <span class="add-invoice__due-note" :class="{ 'add-invoice__due-note--overdue': row.overdue }">
              {{ row.dueNote }}
            </span>
            <span class="add-invoice__meta">Due {{ row.dueDate }}</span>
          </span>
          <span class="add-invoice__amount">{{ formatRupiah(row.amount) }}</span>
        </label>
        <p v-if="candidates.length === 0" class="add-invoice__empty">
          No open {{ itemLabel }} right now. Create one in Transaction Hub, then add it here.
        </p>
      </fieldset>

      <footer class="add-invoice__footer">
        <Button
          variant="outline"
          color="neutral"
          type="button"
          class="add-invoice__action"
          :disabled="attaching"
          @click="open = false"
        >
          Cancel
        </Button>
        <Button
          variant="default"
          color="primary"
          type="button"
          class="add-invoice__action"
          :disabled="!selectedId || attaching"
          :aria-busy="attaching"
          @click="attach"
        >
          {{ attaching ? 'Adding…' : `Add ${itemName}` }}
        </Button>
      </footer>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
.add-invoice {
  display: flex;
  flex-direction: column;
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-body), sans-serif;
}

.add-invoice__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-4);
}

.add-invoice__title-group {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--primitives-padding-1);
}

.add-invoice__title {
  margin: 0;
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-xl);
  font-weight: 700;
  line-height: var(--primitives-line-heights-xl);
}

.add-invoice__description {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.add-invoice__close {
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

.add-invoice__close:hover:not(:disabled) {
  background: var(--semantic-bg-ach-color-bg-surface-hover);
}

.add-invoice__close:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.add-invoice__close:focus-visible,
.add-invoice__choice input:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: var(--primitives-border-width-2);
}

.add-invoice__list {
  display: flex;
  max-height: 360px;
  flex-direction: column;
  margin: 0 var(--primitives-padding-4);
  padding: 0;
  overflow-y: auto;
  border: var(--primitives-border-width-default) solid var(--component-card-border);
  border-radius: var(--primitives-border-radius-lg);
}

.add-invoice__choice {
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr) auto 128px;
  align-items: center;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-3) var(--primitives-padding-4);
  cursor: pointer;
}

.add-invoice__choice + .add-invoice__choice {
  border-top: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
}

.add-invoice__choice:hover {
  background: var(--semantic-bg-ach-color-bg-surface-hover);
}

.add-invoice__choice--selected {
  background: var(--semantic-bg-ach-color-bg-surface-secondary);
}

.add-invoice__choice input {
  margin: 0;
  accent-color: var(--semantic-text-ach-color-text-default);
}

.add-invoice__identity,
.add-invoice__due {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.add-invoice__name {
  overflow: hidden;
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-sm);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.add-invoice__meta {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
  white-space: nowrap;
}

.add-invoice__due-note {
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-sm);
  white-space: nowrap;
}

.add-invoice__due-note--overdue {
  color: var(--semantic-text-error-ach-color-text-error);
}

.add-invoice__amount {
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  text-align: right;
  white-space: nowrap;
}

.add-invoice__empty {
  margin: 0;
  padding: var(--primitives-padding-4);
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.add-invoice__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--primitives-padding-2);
  padding: var(--primitives-padding-4);
}

.add-invoice__action:deep(.ach-button),
.add-invoice__action.ach-button {
  border-radius: var(--primitives-border-radius-infinite);
}

.add-invoice__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

@media (max-width: 640px) {
  .add-invoice__choice {
    grid-template-columns: auto minmax(0, 1fr) auto;
  }

  .add-invoice__choice .avatar,
  .add-invoice__due {
    display: none;
  }
}
</style>
