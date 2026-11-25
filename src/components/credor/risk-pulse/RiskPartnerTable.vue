<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { consentLink } from '@/composables/useAppView'
import { useSnackbar } from '@/composables/useSnackbar'
import RiskBandChip from './RiskBandChip.vue'
import RiskBlurredScore from './RiskBlurredScore.vue'
import RiskIconAction from './RiskIconAction.vue'
import RiskStatusPill, { type StatusTone } from './RiskStatusPill.vue'
import { canConsent, formatNpwp, PARTNER_REPORT_URL, type PartnerScore } from './partner-access'

/** `compact` is the Company Health preview: no Last transaction column and no row count, so it fits the chapter card. */
defineProps<{ partners: PartnerScore[]; idPrefix: string; compact?: boolean }>()

const emits = defineEmits<{
  request: [id: string]
  /** Opens the consent page the partner gets by email. */
  open: [id: string]
  resend: [id: string]
  report: [id: string]
}>()

const { show } = useSnackbar()

// The one note beside the status: when access ends, when it was sent, or why it is still waiting.
function requestNote(partner: PartnerScore) {
  if (partner.status === 'unlocked') return `until ${partner.accessUntil}`
  if (partner.status === 'pending') return canConsent(partner) ? `sent ${partner.requestedOn}` : 'waiting for their auth key'
  return partner.requestedOn ?? ''
}

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
          <th v-if="!compact" scope="col">Last transaction</th>
          <th scope="col">Your request</th>
          <th scope="col" class="ptable__num-head">Business risk score</th>
          <th scope="col" class="ptable__actions-head">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="partner in partners" :id="`${idPrefix}-${partner.id}`" :key="partner.id" tabindex="-1">
          <th scope="row">
            <span class="ptable__name">{{ partner.name }}</span>
            <span class="ptable__sub">{{ formatNpwp(partner.npwp) }}</span>
          </th>
          <td v-if="!compact">
            <span v-if="partner.lastTransaction">{{ partner.lastTransaction }}</span>
            <span v-else class="ptable__muted">No transactions yet</span>
          </td>
          <td>
            <!-- One line per row: a pill and one short note. Nothing asked yet stays quiet, so active rows stand out.
                 The consent code lives in the email and on the consent page; the recipient is in the Resend tooltip. -->
            <span v-if="partner.status === 'locked'" class="ptable__muted">Not requested</span>
            <span v-else class="request">
              <RiskStatusPill v-bind="access[partner.status]" />
              <span class="request__note">{{ requestNote(partner) }}</span>
            </span>
          </td>
          <td class="ptable__num">
            <!-- Band first, then the number: the word says how good, the figure says exactly. -->
            <span v-if="partner.status === 'unlocked'" class="ptable__score">
              <RiskBandChip :score="partner.score" />
              <span class="ptable__number">{{ partner.score.toFixed(1) }}</span>
            </span>
            <!-- Not shared: a blurred score says one exists without showing it. Every company has one, Achilles account or not. -->
            <RiskBlurredScore v-else :seed="partner.npwp" />
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
                  :label="`Resend email to ${partner.email}`"
                  :aria-label="`Resend request email to ${partner.name} at ${partner.email}`"
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
    <div v-if="partners.length && !compact" class="ptable__footer">
      <span>1-{{ partners.length }} of {{ partners.length }} {{ partners.length === 1 ? 'result' : 'results' }}</span>
    </div>
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
  justify-content: flex-end;
  gap: var(--primitives-padding-2);
}

/* Every labelled action gets the same width, so the icon actions after it line up down the column. */
.actions__main {
  min-width: 120px;
}

.request {
  display: inline-flex;
  align-items: center;
  gap: var(--primitives-padding-2);
  white-space: nowrap;
}

.request__note {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
  font-variant-numeric: tabular-nums;
}

.ptable thead th.ptable__num-head,
.ptable td.ptable__num {
  text-align: right;
}

.ptable__score {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--primitives-padding-2);
}

.actions__main.ach-button--outlined.ach-button--color-neutral {
  /* The Credor secondary action, as on the homepage cards: a light border on a pill. */
  border-color: var(--component-card-border);
  border-radius: var(--primitives-border-radius-infinite);
}
</style>
