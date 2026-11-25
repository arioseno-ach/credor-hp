<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { usePartnerAccess, type PartnerLookup } from '@/composables/usePartnerAccess'
import { formatNpwp } from './partner-access'

const props = defineProps<{
  /** The Request by NPWP button. Reka only restores focus to a DialogTrigger. */
  returnFocus?: HTMLElement | null
}>()

const emits = defineEmits<{
  /** The NPWP belongs to a company already in the portfolio. */
  found: [id: string]
  /** A registered company outside the portfolio, added so the request dialog can take over. */
  added: [id: string]
}>()

const open = defineModel<boolean>('open', { required: true })

const { lookup, addFromDirectory } = usePartnerAccess()

const npwp = ref('')
const result = ref<PartnerLookup | null>(null)
const handedOff = ref(false)

async function check() {
  result.value = lookup(npwp.value)
  if (result.value.kind === 'portfolio') {
    handedOff.value = true
    emits('found', result.value.partner.id)
    open.value = false
    return
  }
  // The Check button is replaced by the next action, so focus follows it.
  await nextTick()
  if (result.value.kind === 'registered') document.getElementById('lookup-continue')?.focus()
  else document.getElementById('lookup-npwp')?.focus()
}

function continueToRequest(id: string) {
  addFromDirectory(id)
  handedOff.value = true
  open.value = false
  emits('added', id)
}

function restoreFocus(event: Event) {
  // The page takes focus on to the portfolio row or the request dialog instead.
  if (handedOff.value) {
    event.preventDefault()
    return
  }
  if (!props.returnFocus?.isConnected) return
  event.preventDefault()
  props.returnFocus.focus()
}

watch(open, (value) => {
  if (value) {
    npwp.value = ''
    result.value = null
    handedOff.value = false
  }
})

// A new entry clears the previous result so it never describes a different NPWP.
watch(npwp, () => {
  if (result.value?.kind !== 'portfolio') result.value = null
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent :show-close="false" @close-auto-focus="restoreFocus">
      <form class="lookup" @submit.prevent="check">
        <DialogTitle class="lookup__title">Request by NPWP</DialogTitle>
        <DialogDescription class="lookup__text">
          Request the Company Health report of any company registered on Achilles, including companies you have not transacted with yet.
        </DialogDescription>

        <div class="lookup__field">
          <label for="lookup-npwp" class="lookup__label">NPWP</label>
          <Input
            id="lookup-npwp"
            v-model="npwp"
            inputmode="numeric"
            autocomplete="off"
            placeholder="15 or 16 digits"
            :aria-invalid="result?.kind === 'invalid'"
            :aria-describedby="result?.kind === 'invalid' ? 'lookup-error' : undefined"
          />
          <p v-if="result?.kind === 'invalid'" id="lookup-error" class="lookup__error" role="alert">
            An NPWP has 15 or 16 digits. Check the number and try again.
          </p>
        </div>

        <div aria-live="polite">
          <div v-if="result?.kind === 'registered'" class="lookup__result">
            <Avatar :initials="result.partner.initials" />
            <div class="lookup__who">
              <p class="lookup__name">{{ result.partner.name }}</p>
              <p class="lookup__meta">NPWP {{ formatNpwp(result.partner.npwp) }} · Registered on Achilles</p>
            </div>
          </div>
          <p v-else-if="result?.kind === 'unregistered'" class="lookup__empty">
            This company is not on Achilles yet, so its score is not available. Check the NPWP, or ask the company to
            register on Achilles.
          </p>
        </div>

        <footer class="lookup__footer">
          <Button variant="outline" color="neutral" type="button" @click="open = false">Cancel</Button>
          <Button
            v-if="result?.kind === 'registered'"
            id="lookup-continue"
            type="button"
            @click="continueToRequest(result.partner.id)"
          >
            Continue
          </Button>
          <Button v-else type="submit" :disabled="!npwp.trim()">Check</Button>
        </footer>
      </form>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
.lookup {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-4);
  padding: var(--primitives-padding-6);
}

.lookup__title {
  margin: 0;
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-lg);
  font-weight: 600;
  line-height: var(--primitives-line-heights-lg);
}

.lookup__text,
.lookup__empty {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.lookup__field {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-1);
}

.lookup__label,
.lookup__name {
  margin: 0;
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 600;
  line-height: var(--primitives-line-heights-sm);
}

.lookup__error {
  margin: 0;
  color: var(--semantic-text-error-ach-color-text-error);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
}

.lookup__result {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-3);
}

.lookup__who {
  min-width: 0;
}

.lookup__meta {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
  font-variant-numeric: tabular-nums;
}

.lookup__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--primitives-padding-3);
}
</style>
