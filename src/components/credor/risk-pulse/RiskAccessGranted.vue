<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { usePartnerAccess } from '@/composables/usePartnerAccess'
import RiskConsentCode from './RiskConsentCode.vue'
import { formatNpwp } from './partner-access'

const props = defineProps<{
  /** Where focus goes once the revoked row is gone. */
  returnFocusId: string
}>()

const { received, revokeReceived } = usePartnerAccess()

// Companies the signed-in company accepted and still shares its report with.
const granted = computed(() => received.value.filter((item) => item.status === 'accepted'))

const confirmOpen = ref(false)
const target = ref<(typeof granted.value)[number] | null>(null)
const revoked = ref(false)

function askRevoke(id: string) {
  target.value = granted.value.find((item) => item.id === id) ?? null
  revoked.value = false
  confirmOpen.value = true
}

function revoke() {
  if (!target.value) return
  revokeReceived(target.value.id)
  revoked.value = true
  confirmOpen.value = false
}

function restoreFocus(event: Event) {
  event.preventDefault()
  // The revoked row is gone; a cancelled revoke goes back to its own button.
  const button = !revoked.value && target.value ? document.getElementById(`rp-granted-${target.value.id}`)?.querySelector<HTMLElement>('.ptable__actions button') : null
  ;(button ?? document.getElementById(props.returnFocusId))?.focus()
}
</script>

<template>
  <div v-if="granted.length" class="table-wrap">
    <table class="ptable">
      <thead>
        <tr>
          <th scope="col">Company</th>
          <th scope="col">Consent code</th>
          <th scope="col">Email</th>
          <th scope="col">Access until</th>
          <th scope="col" class="ptable__actions-head">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in granted" :id="`rp-granted-${item.id}`" :key="item.id">
          <th scope="row">
            <span class="ptable__name">{{ item.name }}</span>
            <span class="ptable__sub">{{ formatNpwp(item.npwp) }}</span>
          </th>
          <td><RiskConsentCode :code="item.consentCode" /></td>
          <td class="ptable__email">{{ item.email.split('@')[0] }}@<wbr>{{ item.email.split('@')[1] }}</td>
          <td>
            {{ item.accessUntil }}
            <span class="ptable__sub">Approved from a request on {{ item.requestedOn }}</span>
          </td>
          <td class="ptable__actions">
            <Button
              variant="outline"
              color="error"
              size="small"
              type="button"
              :aria-label="`Revoke access for ${item.name}`"
              @click="askRevoke(item.id)"
            >
              Revoke access
            </Button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <p v-else class="ptable__empty">You are not sharing your Company Health report with any company.</p>

  <Dialog v-model:open="confirmOpen">
    <DialogContent v-if="target" :show-close="false" @close-auto-focus="restoreFocus">
      <div class="revoke">
        <DialogTitle class="revoke__title">Revoke access for {{ target.name }}?</DialogTitle>
        <DialogDescription class="revoke__text">
          {{ target.name }} will no longer see your Company Health report in Achilles. A PDF they already downloaded
          stays with them. They can send a new request later.
        </DialogDescription>
        <footer class="revoke__footer">
          <Button variant="outline" color="neutral" type="button" @click="confirmOpen = false">Cancel</Button>
          <Button variant="destructive" type="button" @click="revoke">Revoke access</Button>
        </footer>
      </div>
    </DialogContent>
  </Dialog>
</template>

<style scoped src="./partner-table.css"></style>

<style scoped>

.revoke {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-4);
  padding: var(--primitives-padding-6);
}

.revoke__title {
  margin: 0;
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-lg);
  font-weight: 600;
  line-height: var(--primitives-line-heights-lg);
}

.revoke__text {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.revoke__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--primitives-padding-3);
}
</style>
