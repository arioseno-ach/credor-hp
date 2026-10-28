<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import type { PrototypeStage } from '@/lib/prototype/types'
import { documentCategories, isOnFile, type DocumentItem } from './requirements'
import FinancingDocumentPreview from './FinancingDocumentPreview.vue'

const props = withDefaults(
  defineProps<{
    stage: PrototypeStage
    uploadedIds?: string[]
    replacedFiles?: Record<string, string>
    replacingId?: string | null
    uploadingId?: string | null
    /** Shows Replace next to View, and Upload for documents still missing. */
    editable?: boolean
  }>(),
  {
    uploadedIds: () => [],
    replacedFiles: () => ({}),
    replacingId: null,
    uploadingId: null,
    editable: false,
  },
)

const emits = defineEmits<{
  replace: [id: string]
  upload: [id: string]
}>()

const isReady = (item: DocumentItem) =>
  isOnFile(item, props.stage) || props.uploadedIds.includes(item.id)

/** Editable lists every document so missing ones can be uploaded in place. Read-only lists
 *  show only the files the application carries. */
const categories = computed(() =>
  documentCategories
    .map((category) => {
      const ready = category.items.filter(isReady)
      return {
        ...category,
        files: props.editable ? category.items : ready,
        readyCount: ready.length,
        missingRequired: category.items.filter((item) => !item.optional && !isReady(item)).length,
      }
    })
    .filter((category) => category.files.length > 0),
)

const busy = computed(() => props.replacingId !== null || props.uploadingId !== null)

/** Categories that still need uploads start open, so the work is visible without a click. */
const openCategories = ref<string[]>(
  categories.value.filter((category) => category.missingRequired > 0).map((category) => category.id),
)
const preview = ref<{ label: string; fileName: string; trigger: HTMLElement | null } | null>(null)
const previewOpen = ref(false)

const fileNameFor = (item: DocumentItem) => props.replacedFiles[item.id] ?? item.fileName

function toggle(id: string) {
  openCategories.value = openCategories.value.includes(id)
    ? openCategories.value.filter((open) => open !== id)
    : [...openCategories.value, id]
}

function view(item: DocumentItem) {
  const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null
  preview.value = { label: item.label, fileName: fileNameFor(item), trigger }
  previewOpen.value = true
}
</script>

<template>
  <div class="document-list">
    <div v-for="category in categories" :key="category.id" class="document-list__category">
      <button
        type="button"
        class="document-list__toggle"
        :aria-expanded="openCategories.includes(category.id)"
        :aria-controls="`document-list-${category.id}`"
        @click="toggle(category.id)"
      >
        <span class="document-list__category-label">{{ category.label }}</span>
        <span
          v-if="editable && category.readyCount < category.items.length"
          class="document-list__count"
          :class="{ 'document-list__count--missing': category.missingRequired > 0 }"
        >
          {{ category.missingRequired > 0 ? `${category.missingRequired} needed` : `${category.readyCount}/${category.items.length}` }}
        </span>
        <span v-else class="document-list__count">
          {{ category.readyCount }} {{ category.readyCount === 1 ? 'file' : 'files' }}
        </span>
        <img
          class="document-list__chevron"
          :src="
            openCategories.includes(category.id)
              ? '/icons/ui-actions/expand-less.svg'
              : '/icons/ui-actions/expand-more.svg'
          "
          alt=""
          aria-hidden="true"
        />
      </button>

      <ul
        v-show="openCategories.includes(category.id)"
        :id="`document-list-${category.id}`"
        class="document-list__files"
      >
        <li v-for="item in category.files" :key="item.id" class="document-list__file">
          <span
            class="document-list__file-icon"
            :class="{ 'document-list__file-icon--missing': !isReady(item) }"
            aria-hidden="true"
          ></span>
          <span class="document-list__file-copy">
            <span class="document-list__file-label">{{ item.label }}</span>
            <span v-if="isReady(item)" class="document-list__file-name">
              {{ fileNameFor(item) }}
              <span v-if="replacedFiles[item.id]" class="document-list__replaced">Replaced</span>
              <span v-else-if="uploadedIds.includes(item.id)" class="document-list__replaced">Uploaded</span>
            </span>
            <span v-else class="document-list__file-name">
              {{ item.optional ? 'Optional' : 'Required' }}
            </span>
          </span>
          <Button
            v-if="!isReady(item)"
            variant="outline"
            color="neutral"
            size="small"
            type="button"
            class="document-list__upload"
            :disabled="busy"
            :aria-label="`Upload ${item.label}`"
            @click="emits('upload', item.id)"
          >
            {{ uploadingId === item.id ? 'Uploading…' : 'Upload' }}
          </Button>
          <span v-else class="document-list__actions">
            <button
              type="button"
              class="document-list__action"
              :aria-label="`View ${item.label}`"
              @click="view(item)"
            >
              View
            </button>
            <button
              v-if="editable"
              type="button"
              class="document-list__action"
              :aria-label="`Replace ${item.label}`"
              :disabled="busy"
              @click="emits('replace', item.id)"
            >
              {{ replacingId === item.id ? 'Replacing…' : 'Replace' }}
            </button>
          </span>
        </li>
      </ul>
    </div>

    <FinancingDocumentPreview
      v-if="preview"
      v-model:open="previewOpen"
      :label="preview.label"
      :file-name="preview.fileName"
      :return-focus="preview.trigger"
    />
  </div>
</template>

<style scoped>
.document-list {
  display: flex;
  flex-direction: column;
  border: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-default);
  border-radius: var(--primitives-border-radius-lg);
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-body), sans-serif;
}

.document-list__category + .document-list__category {
  border-top: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-default);
}

.document-list__toggle {
  display: flex;
  width: 100%;
  min-height: 48px;
  align-items: center;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-3) var(--primitives-padding-4);
  border: 0;
  border-radius: var(--primitives-border-radius-lg);
  background: none;
  color: inherit;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
}

.document-list__toggle:hover {
  background: var(--semantic-bg-ach-color-bg-surface-hover);
}

.document-list__toggle:focus-visible,
.document-list__action:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: calc(var(--primitives-border-width-2) * -1);
}

.document-list__category-label {
  flex: 1;
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 600;
  line-height: var(--primitives-line-heights-sm);
}

.document-list__count {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  font-variant-numeric: tabular-nums;
  line-height: var(--primitives-line-heights-2xs);
}

.document-list__count--missing {
  color: var(--semantic-text-error-ach-color-text-error);
  font-weight: 500;
}

.document-list__chevron {
  width: 20px;
  height: 20px;
}

.document-list__files {
  margin: 0;
  padding: 0 0 var(--primitives-padding-2);
  list-style: none;
}

.document-list__file {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-2) var(--primitives-padding-4);
}

.document-list__file-icon {
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
  background: var(--semantic-icon-ach-color-icon-default);
  mask: url('/icons/text-formatting/description.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/text-formatting/description.svg') center / contain no-repeat;
}

.document-list__file-icon--missing {
  width: 16px;
  height: 16px;
  flex-basis: 16px;
  margin: 2px;
  border: var(--primitives-border-width-2) dashed var(--semantic-border-ach-color-border-strong);
  border-radius: var(--primitives-border-radius-infinite);
  background: none;
  mask: none;
  -webkit-mask: none;
}

.document-list__file-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}

.document-list__file-label {
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.document-list__file-name {
  overflow: hidden;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.document-list__replaced {
  margin-left: var(--primitives-padding-1);
  color: var(--semantic-fg-success-ach-color-fg-success);
  font-weight: 500;
}

.document-list__upload:deep(.ach-button),
.document-list__upload.ach-button {
  border-radius: var(--primitives-border-radius-infinite);
}

.document-list__actions {
  display: flex;
  flex: 0 0 auto;
  gap: var(--primitives-padding-3);
}

.document-list__action {
  padding: var(--primitives-padding-1) 0;
  border: 0;
  border-radius: var(--primitives-border-radius-xs);
  background: none;
  color: var(--semantic-text-ach-color-text-link);
  cursor: pointer;
  font-family: inherit;
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-sm);
}

.document-list__action:hover:not(:disabled) {
  text-decoration: underline;
}

.document-list__action:disabled {
  color: var(--semantic-text-ach-color-text-disabled);
  cursor: not-allowed;
}
</style>
