<script setup lang="ts">
import { computed, nextTick, ref, watch, type StyleValue } from 'vue'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { ACCESS_DAYS, canConsent, type ConsentRequest } from './partner-access'

/** `demo` shows the partner's side of a request the signed-in company sent; otherwise the signed-in company is replying. */
const props = defineProps<{ request: ConsentRequest | null; demo?: boolean }>()

const emits = defineEmits<{
  accept: [id: string]
  decline: [id: string]
  /** Prototype: the partner finishes their Achilles account and auth key setup. */
  setup: [id: string]
  closed: []
}>()

const open = defineModel<boolean>('open', { required: true })

// Credor guardrail: data-access consent is never pre-checked.
const agreed = ref(false)
const ready = computed(() => !!props.request && canConsent(props.request))
const blocker = computed(() => {
  if (!ready.value) return 'Finish your account setup to reply.'
  if (!agreed.value) return 'Tick the agreement to accept.'
  return ''
})

const sheetStyle: StyleValue = { width: '100%', maxWidth: '520px', padding: '0', gap: '0' }

function reply(kind: 'accept' | 'decline') {
  if (!props.request) return
  if (kind === 'accept') emits('accept', props.request.id)
  else emits('decline', props.request.id)
  open.value = false
}

// The setup button disappears once used, so focus moves on to the agreement.
async function completeSetup(id: string) {
  emits('setup', id)
  await nextTick()
  document.querySelector<HTMLInputElement>('.consent .ach-checkbox__input')?.focus()
}

function returnFocus(event: Event) {
  event.preventDefault()
  emits('closed')
}

watch(open, (value) => {
  if (value) agreed.value = false
})
</script>

<template>
  <Sheet v-model:open="open">
    <SheetContent v-if="request" side="right" :style="sheetStyle" @close-auto-focus="returnFocus">
      <div class="consent">
        <header class="consent__header">
          <p v-if="demo" class="consent__demo">Prototype: what {{ request.owner }} sees</p>
          <SheetTitle class="consent__title">{{ request.requester }} asks to see your Company Health report</SheetTitle>
          <SheetDescription class="consent__text">
            They have transacted with you on Achilles and want to check your score before their next deal.
          </SheetDescription>
        </header>
  
        <div class="consent__body">
          <section aria-labelledby="consent-check-title">
            <h3 id="consent-check-title" class="consent__h3">Account check</h3>
            <ul class="consent__checks">
              <li>
                <img
                  :src="request.onAchilles ? '/icons/common-actions/verified-filled.svg' : '/icons/common-actions/warning.svg'"
                  alt=""
                  aria-hidden="true"
                  class="consent__icon"
                >
                {{ request.onAchilles ? 'Achilles account active' : 'No Achilles account yet' }}
              </li>
              <li>
                <img
                  :src="request.authKeyReady ? '/icons/common-actions/verified-filled.svg' : '/icons/common-actions/warning.svg'"
                  alt=""
                  aria-hidden="true"
                  class="consent__icon"
                >
                {{ request.authKeyReady ? 'Auth key set up' : 'Auth key not set up' }}
              </li>
            </ul>
            <Button
              v-if="!ready"
              variant="outline"
              color="neutral"
              size="small"
              type="button"
              class="consent__setup"
              @click="completeSetup(request.id)"
            >
              Simulate setup complete
            </Button>
          </section>
  
          <section aria-labelledby="consent-share-title">
            <h3 id="consent-share-title" class="consent__h3">What you share</h3>
            <p class="consent__text">
              Your Company Health report, with its score, band and the areas behind it. They can read it in Achilles and download it as a PDF for {{ ACCESS_DAYS }} days.
              Your transactions stay private. You can revoke access at any time in Partners; a PDF they already downloaded stays with them.
            </p>
          </section>
  
          <Checkbox v-model="agreed">
            I agree to share my Company Health report with {{ request.requester }} for {{ ACCESS_DAYS }} days, in Achilles and as a PDF.
          </Checkbox>
        </div>
  
        <footer class="consent__footer">
          <p id="consent-blocker" class="consent__blocker" aria-live="polite">{{ blocker }}</p>
          <Button variant="outline" color="neutral" type="button" :disabled="!ready" @click="reply('decline')">
            Decline
          </Button>
          <Button
            type="button"
            :disabled="!!blocker"
            :aria-describedby="blocker ? 'consent-blocker' : undefined"
            @click="reply('accept')"
          >
            Accept
          </Button>
        </footer>
      </div>
    </SheetContent>
  </Sheet>
</template>

<style scoped>
.consent {
  display: flex;
  height: 100%;
  flex-direction: column;
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-body), sans-serif;
}

.consent__header {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-2);
  padding: var(--primitives-padding-6);
  border-bottom: var(--primitives-border-width-default) solid var(--component-card-border);
}

.consent__demo {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
}

.consent__title {
  margin: 0;
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-xl);
  font-weight: 700;
  line-height: var(--primitives-line-heights-xl);
}

.consent__text {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.consent__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--primitives-padding-6);
  padding: var(--primitives-padding-6);
  overflow: auto;
}

.consent__h3 {
  margin: 0 0 var(--primitives-padding-2);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 600;
  line-height: var(--primitives-line-heights-sm);
}

.consent__checks {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-2);
  margin: 0;
  padding: 0;
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
  list-style: none;
}

.consent__checks li {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-2);
}

.consent__icon {
  width: 16px;
  height: 16px;
}

.consent__setup {
  margin-top: var(--primitives-padding-3);
}

.consent__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-4) var(--primitives-padding-6);
  border-top: var(--primitives-border-width-default) solid var(--component-card-border);
}

.consent__blocker {
  flex: 1;
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
}
</style>
