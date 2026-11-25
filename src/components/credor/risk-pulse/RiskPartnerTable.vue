<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { consentLink } from '@/composables/useAppView'
import { useSnackbar } from '@/composables/useSnackbar'
import RiskBandChip from './RiskBandChip.vue'
import RiskConsentCode from './RiskConsentCode.vue'
import RiskIconAction from './RiskIconAction.vue'
import RiskStatusPill, { type StatusTone } from './RiskStatusPill.vue'
import { canConsent, formatNpwp, PARTNER_REPORT_URL, type PartnerScore } from './partner-access'

defineProps<{ partners: PartnerScore[]; idPrefix: string }>()

const emits = defineEmits<{
  request: [id: string]
  /** Opens the consent page the partner gets by email. */
  open: [id: string]
  resend: [id: string]
  report: [id: string]
}>()

const { show } = useSnackbar()

// For sending the consent link another way, such as WhatsApp.
async function copyLink(partner: PartnerScore) {
  try {
    await navigator.clipboard.writeText(consentLink(partner.id))
    show({ variant: 'success', title: 'Consent link copied', description: `Send it to ${partner.name} by WhatsApp or chat.` })
  } catch {
    show({ variant: 'error', title: 'Could not copy the link', description: 'Open the link and copy it from the address bar.' })
  }
}

const access: Record<PartnerScore['status'], { tone: StatusTone; label: string }> = {
  unlocked: { tone: 'success', label: 'Shared' },
  pending: { tone: 'warning', label: 'Pending' },
  declined: { tone: 'error', label: 'Declined' },
  locked: { tone: 'neutral', label: 'Not requested' },
}
</script>

<template>
  <!-- Scrolls sideways inside its card on narrow screens, so the page itself never does. -->
  <div class="table-wrap">
    <table class="ptable">
      <thead>
        <tr>
          <th scope="col">Company</th>
          <th scope="col">Last transaction</th>
          <th scope="col">Business risk score</th>
          <th scope="col">Your request</th>
          <th scope="col" class="ptable__actions-head">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="partner in partners" :id="`${idPrefix}-${partner.id}`" :key="partner.id" tabindex="-1">
          <th scope="row">
            <span class="ptable__name">{{ partner.name }}</span>
            <span class="ptable__sub">{{ formatNpwp(partner.npwp) }}</span>
          </th>
          <td>{{ partner.lastTransaction || 'No transactions yet' }}</td>
          <td>
            <span v-if="partner.status === 'unlocked'" class="ptable__score">
              <span class="ptable__number">{{ partner.score.toFixed(1) }}</span>
              <RiskBandChip :score="partner.score" />
            </span>
            <span v-else class="ptable__sub">Hidden until shared</span>
          </td>
          <td>
            <RiskStatusPill v-bind="access[partner.status]" />
            <span v-if="partner.status === 'unlocked'" class="ptable__sub">Until {{ partner.accessUntil }}</span>
            <template v-else-if="partner.status === 'pending'">
              <span class="ptable__sub">Sent {{ partner.requestedOn }}{{ canConsent(partner) ? '' : ' · Account not set up yet' }}</span>
              <span class="ptable__sub">To {{ partner.email }}</span>
            </template>
            <span v-else-if="partner.status === 'declined'" class="ptable__sub">Sent {{ partner.requestedOn }}</span>
            <RiskConsentCode v-if="partner.consentCode && partner.status !== 'locked'" :code="partner.consentCode" class="ptable__code" />
          </td>
          <td class="ptable__actions">
            <!-- Before a request: one labelled action. After it: icon actions with tooltips, starting at the same edge. -->
            <div class="actions">
              <template v-if="partner.status === 'unlocked'">
                <RiskIconAction
                  icon="/icons/common-actions/visibility.svg"
                  label="View report"
                  :aria-label="`View report of ${partner.name}`"
                  @click="emits('report', partner.id)"
                />
                <RiskIconAction
                  icon="/icons/ui-actions/file-download.svg"
                  label="Download PDF"
                  :aria-label="`Download PDF report of ${partner.name}`"
                  :href="PARTNER_REPORT_URL"
                />
              </template>
              <template v-else-if="partner.status === 'pending'">
                <RiskIconAction
                  icon="/icons/communications/link.svg"
                  label="Copy link"
                  :aria-label="`Copy consent link for ${partner.name}`"
                  @click="copyLink(partner)"
                />
                <RiskIconAction
                  icon="/icons/communications/forward-to-inbox.svg"
                  label="Resend email"
                  :aria-label="`Resend request email to ${partner.name}`"
                  @click="emits('resend', partner.id)"
                />
                <RiskIconAction
                  icon="/icons/ui-actions/open-in-new.svg"
                  label="Open consent page"
                  :aria-label="`Open consent page sent to ${partner.name}`"
                  @click="emits('open', partner.id)"
                />
              </template>
              <Button
                v-else
                variant="outline"
                color="neutral"
                size="small"
                type="button"
                class="actions__main"
                :aria-label="`${partner.status === 'declined' ? 'Request again' : 'Request score'} from ${partner.name}`"
                @click="emits('request', partner.id)"
              >
                {{ partner.status === 'declined' ? 'Request again' : 'Request score' }}
              </Button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped src="./partner-table.css"></style>

<style scoped>

.ptable__number {
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-md);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.actions {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-2);
}

/* Every labelled action gets the same width, so the icon actions after it line up down the column. */
.actions__main {
  min-width: 120px;
}

.ptable__code {
  margin-top: var(--primitives-padding-1);
}

.ptable__score {
  display: inline-flex;
  align-items: center;
  gap: var(--primitives-padding-2);
}
</style>
