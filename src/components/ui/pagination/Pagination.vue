<script setup lang="ts">
import { computed } from "vue"
import {
  PaginationEllipsis,
  PaginationList,
  PaginationListItem,
  PaginationNext,
  PaginationPrev,
  PaginationRoot,
} from "reka-ui"

const props = withDefaults(
  defineProps<{
    total: number
    itemsPerPage?: number
    label?: string
  }>(),
  {
    itemsPerPage: 10,
    label: "Pagination",
  },
)

const page = defineModel<number>("page", { default: 1 })

const pageCount = computed(() => Math.ceil(props.total / props.itemsPerPage))
const rangeStart = computed(() => (page.value - 1) * props.itemsPerPage + 1)
const rangeEnd = computed(() => Math.min(page.value * props.itemsPerPage, props.total))
</script>

<template>
  <PaginationRoot
    v-if="total > itemsPerPage"
    v-model:page="page"
    data-slot="pagination"
    class="ach-pagination"
    :aria-label="label"
    :total="total"
    :items-per-page="itemsPerPage"
    :sibling-count="1"
    show-edges
  >
    <!-- Prev/Next stay focusable at the ends (aria-disabled, not native disabled) so focus is not dropped to body; reka's click guard keeps them inert. -->
    <!-- Announces the new range after a page change; focus stays on the control. -->
    <p class="ach-pagination__range" aria-live="polite">
      {{ rangeStart }}–{{ rangeEnd }} of {{ total }}
    </p>
    <PaginationList v-slot="{ items }" as="ul" class="ach-pagination__list">
      <li>
        <PaginationPrev
          class="ach-pagination__control ach-pagination__control--icon"
          :disabled="false"
          :aria-disabled="page === 1 || undefined"
        >
          <span class="ach-pagination__chevron ach-pagination__chevron--prev" aria-hidden="true" />
        </PaginationPrev>
      </li>
      <!-- Pages keyed by number so focus stays on the chosen page when the ellipsis moves. -->
      <li v-for="(item, index) in items" :key="item.type === 'page' ? `p${item.value}` : `e${index}`">
        <PaginationListItem
          v-if="item.type === 'page'"
          :value="item.value"
          class="ach-pagination__control"
        />
        <PaginationEllipsis v-else class="ach-pagination__ellipsis" aria-hidden="true" />
      </li>
      <li>
        <PaginationNext
          class="ach-pagination__control ach-pagination__control--icon"
          :disabled="false"
          :aria-disabled="page === pageCount || undefined"
        >
          <span class="ach-pagination__chevron ach-pagination__chevron--next" aria-hidden="true" />
        </PaginationNext>
      </li>
    </PaginationList>
  </PaginationRoot>
</template>

<style scoped>
.ach-pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-3);
  font-family: var(--primitives-font-families-body), sans-serif;
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
  font-variant-numeric: tabular-nums;
}

.ach-pagination__range {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
}

.ach-pagination__list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--primitives-padding-1);
  margin: 0;
  padding: 0;
  list-style: none;
}

.ach-pagination__control,
.ach-pagination__ellipsis {
  display: inline-flex;
  min-width: var(--primitives-padding-8);
  height: var(--primitives-padding-8);
  align-items: center;
  justify-content: center;
  padding: 0 var(--primitives-padding-2);
  color: var(--semantic-text-ach-color-text-default);
}

.ach-pagination__control {
  border: 0;
  border-radius: var(--primitives-border-radius-sm);
  background: transparent;
  font: inherit;
  cursor: pointer;
  outline: none;
  transition: background-color 150ms ease-out;
}

.ach-pagination__control:hover:not([aria-disabled='true']) {
  background: var(--semantic-bg-ach-color-bg-surface-hover);
}

.ach-pagination__control:active:not([aria-disabled='true']) {
  background: var(--semantic-bg-ach-color-bg-surface-active);
}

.ach-pagination__control:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--component-input-border-focus);
  /* Inset so the ring is not clipped by an overflow: hidden parent. */
  outline-offset: calc(var(--primitives-border-width-2) * -1);
}

.ach-pagination__control[aria-current="page"],
.ach-pagination__control[aria-current="page"]:hover {
  background: var(--semantic-bg-ach-color-bg-inverse);
  color: var(--semantic-text-ach-color-text-inverse);
  cursor: default;
}

.ach-pagination__control[aria-disabled="true"] {
  color: var(--semantic-text-ach-color-text-disabled);
  cursor: not-allowed;
}

.ach-pagination__control--icon {
  padding: 0;
}

.ach-pagination__ellipsis {
  color: var(--semantic-text-ach-color-text-secondary);
}

/* The chevron SVGs have a fixed fill, so mask them to follow the control's text color. */
.ach-pagination__chevron {
  display: block;
  width: var(--primitives-padding-6);
  height: var(--primitives-padding-6);
  background: currentcolor;
}

.ach-pagination__chevron--prev {
  mask: url("/icons/ui-actions/chevron-left.svg") center / contain no-repeat;
  -webkit-mask: url("/icons/ui-actions/chevron-left.svg") center / contain no-repeat;
}

.ach-pagination__chevron--next {
  mask: url("/icons/ui-actions/chevron-right.svg") center / contain no-repeat;
  -webkit-mask: url("/icons/ui-actions/chevron-right.svg") center / contain no-repeat;
}

@media (prefers-reduced-motion: reduce) {
  .ach-pagination__control {
    transition: none;
  }
}
</style>
