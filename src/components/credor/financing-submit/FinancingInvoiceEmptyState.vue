<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { useSnackbar } from '@/composables/useSnackbar'

const props = defineProps<{
  itemLabel: string
}>()

const { show } = useSnackbar()

const itemName = computed(() => props.itemLabel.replace(/s$/, ''))

/** Transaction Hub is outside this prototype, so the action only explains where it leads. */
function createInvoice() {
  show({
    variant: 'neutral',
    title: 'Opens Transaction Hub',
    description: `Creating ${props.itemLabel} is not part of this prototype.`,
  })
}
</script>

<template>
  <div class="invoice-empty" role="status">
    <span class="invoice-empty__icon" aria-hidden="true"></span>
    <!-- The partner is already named above the list, so the title stays short. -->
    <p class="invoice-empty__title">No open {{ itemLabel }} yet</p>
    <p class="invoice-empty__text">
      We can only finance {{ itemLabel }} created in Achilles. Create one in Transaction Hub, then
      come back to add it.
    </p>
    <Button
      variant="outline"
      color="neutral"
      size="small"
      type="button"
      class="invoice-empty__action"
      @click="createInvoice"
    >
      Create {{ itemName }}
    </Button>
  </div>
</template>

<style scoped>
.invoice-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--primitives-padding-2);
  padding: var(--primitives-padding-8) var(--primitives-padding-6);
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-body), sans-serif;
  text-align: center;
}

.invoice-empty__icon {
  width: 40px;
  height: 40px;
  margin-bottom: var(--primitives-padding-1);
  background: var(--semantic-icon-ach-color-icon-default);
  mask: url('/icons/business-payments/receipt-long.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/business-payments/receipt-long.svg') center / contain no-repeat;
}

.invoice-empty__title {
  margin: 0;
  font-size: var(--primitives-font-sizes-md);
  font-weight: 600;
  line-height: var(--primitives-line-heights-md);
}

.invoice-empty__text {
  max-width: 400px;
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.invoice-empty__action {
  margin-top: var(--primitives-padding-2);
}

.invoice-empty__action:deep(.ach-button),
.invoice-empty__action.ach-button {
  border-radius: var(--primitives-border-radius-infinite);
}
</style>
