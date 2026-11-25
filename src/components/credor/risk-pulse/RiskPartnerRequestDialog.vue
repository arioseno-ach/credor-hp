<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { verifiedCompany } from '@/components/credor/personalisation'
import { ACCESS_DAYS, canConsent, type PartnerScore } from './partner-access'

const props = defineProps<{ partner: PartnerScore | null }>()

const emits = defineEmits<{
  sent: [id: string]
  /** Fired after the dialog has closed, so the page can return focus to the row. */
  closed: []
}>()

const open = defineModel<boolean>('open', { required: true })

const sending = ref(false)
let timer: number | undefined

function send() {
  if (!props.partner || sending.value) return
  const id = props.partner.id
  sending.value = true
  // Prototype: the email goes out after a short simulated delay.
  timer = window.setTimeout(() => {
    sending.value = false
    emits('sent', id)
    open.value = false
  }, 700)
}

function guardClose(event: Event) {
  if (sending.value) event.preventDefault()
}

function returnFocus(event: Event) {
  event.preventDefault()
  emits('closed')
}

onBeforeUnmount(() => window.clearTimeout(timer))

watch(open, (value) => {
  if (!value) {
    window.clearTimeout(timer)
    sending.value = false
  }
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent
      v-if="partner"
      :show-close="false"
      @escape-key-down="guardClose"
      @interact-outside="guardClose"
      @close-auto-focus="returnFocus"
    >
      <div class="request">
        <DialogTitle class="request__title">Request {{ partner.name }}'s Company Health report</DialogTitle>
        <DialogDescription class="request__text">
          We will email {{ partner.name }} at {{ partner.email }} and ask them to share their Company Health report with you.
          <template v-if="!canConsent(partner)">
            They need a DJP Online auth key before they can reply.
          </template>
        </DialogDescription>
  
        <figure class="request__email">
          <figcaption class="request__email-head">
            <img src="/icons/custom/automatic-email-distribution.svg" alt="" aria-hidden="true" class="request__icon">
            <span>Email preview</span>
          </figcaption>
          <p class="request__subject">{{ verifiedCompany.name }} asks to see your Company Health report</p>
          <p class="request__text">
            If you agree, they can read your Company Health report in Achilles and download it as a PDF for {{ ACCESS_DAYS }} days.
            Your transactions stay private. You can revoke access at any time; a PDF already downloaded stays with them.
          </p>
        </figure>
  
        <footer class="request__footer">
          <Button variant="outline" color="neutral" type="button" :disabled="sending" @click="open = false">
            Cancel
          </Button>
          <!-- aria-disabled, not disabled, so focus stays on the button while sending. -->
          <Button type="button" :aria-disabled="sending" :aria-busy="sending" @click="send">
            {{ sending ? 'Sending…' : 'Send request' }}
          </Button>
        </footer>
      </div>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
.request {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-4);
  padding: var(--primitives-padding-6);
}

.request__title {
  margin: 0;
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-lg);
  font-weight: 600;
  line-height: var(--primitives-line-heights-lg);
}

.request__text {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.request__email {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-2);
  margin: 0;
  padding: var(--primitives-padding-4);
  border-radius: var(--primitives-border-radius-md);
  background: var(--semantic-bg-ach-color-bg-surface-secondary);
}

.request__email-head {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-2);
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
}

.request__icon {
  width: 16px;
  height: 16px;
}

.request__subject {
  margin: 0;
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 600;
  line-height: var(--primitives-line-heights-sm);
}

.request__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--primitives-padding-3);
}
</style>
