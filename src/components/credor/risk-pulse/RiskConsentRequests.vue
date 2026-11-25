<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { verifiedCompany } from '@/components/credor/personalisation'
import { usePartnerAccess } from '@/composables/usePartnerAccess'
import RiskConsentCode from './RiskConsentCode.vue'
import RiskPartnerConsentSheet from './RiskPartnerConsentSheet.vue'
import RiskStatusPill from './RiskStatusPill.vue'
import { formatNpwp, type ConsentRequest } from './partner-access'

// Requests other companies sent to the signed-in company; the ones it sent live in Portfolio.
const { received, answerReceived } = usePartnerAccess()

const status = {
  pending: { tone: 'warning', label: 'Needs your reply' },
  accepted: { tone: 'success', label: 'Approved' },
  declined: { tone: 'error', label: 'Declined' },
  revoked: { tone: 'neutral', label: 'Revoked' },
} as const

const sheetOpen = ref(false)
const activeId = ref<string | null>(null)

// The signed-in company is the one replying, and its account is already set up.
const request = computed<ConsentRequest | null>(() => {
  const item = received.value.find((entry) => entry.id === activeId.value)
  return item ? { id: item.id, requester: item.name, owner: verifiedCompany.name, onAchilles: true, authKeyReady: true } : null
})

function openReview(id: string) {
  activeId.value = id
  sheetOpen.value = true
}

// The Review button is gone once answered, so the row itself takes focus.
function focusRow() {
  const row = document.getElementById(`rp-received-${activeId.value}`)
  ;(row?.querySelector<HTMLElement>('.ptable__actions button') ?? row)?.focus()
}
</script>

<template>
  <div v-if="received.length" class="table-wrap">
    <table class="ptable">
      <thead>
        <tr>
          <th scope="col">Requested by</th>
          <th scope="col">Consent</th>
          <th scope="col">Consent code</th>
          <th scope="col">Email</th>
          <th scope="col">Requested on</th>
          <th scope="col" class="ptable__actions-head">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in received" :id="`rp-received-${item.id}`" :key="item.id" tabindex="-1">
          <th scope="row">
            <span class="ptable__name">{{ item.name }}</span>
            <span class="ptable__sub">{{ formatNpwp(item.npwp) }}</span>
          </th>
          <td>
            <RiskStatusPill v-bind="status[item.status]" />
            <span v-if="item.status === 'accepted'" class="ptable__sub">Until {{ item.accessUntil }}</span>
          </td>
          <td><RiskConsentCode :code="item.consentCode" /></td>
          <td class="ptable__email">{{ item.email.split('@')[0] }}@<wbr>{{ item.email.split('@')[1] }}</td>
          <td>{{ item.requestedOn }}</td>
          <td class="ptable__actions">
            <Button
              v-if="item.status === 'pending'"
              size="small"
              type="button"
              :aria-label="`Review request from ${item.name}`"
              @click="openReview(item.id)"
            >
              Review
            </Button>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="ptable__footer">
      <span>1-{{ received.length }} of {{ received.length }} {{ received.length === 1 ? 'result' : 'results' }}</span>
    </div>
  </div>
  <p v-else class="ptable__empty">No company has asked to see your report yet.</p>

  <RiskPartnerConsentSheet
    v-model:open="sheetOpen"
    :request="request"
    @accept="(id) => answerReceived(id, true)"
    @decline="(id) => answerReceived(id, false)"
    @closed="focusRow"
  />
</template>

<style scoped src="./partner-table.css"></style>
