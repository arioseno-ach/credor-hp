<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import RiskBandChip from '@/components/credor/risk-pulse/RiskBandChip.vue'
import RiskBlurredScore from '@/components/credor/risk-pulse/RiskBlurredScore.vue'
import RiskIconAction from '@/components/credor/risk-pulse/RiskIconAction.vue'
import RiskPartnerRequestDialog from '@/components/credor/risk-pulse/RiskPartnerRequestDialog.vue'
import { npwpDigits, PARTNER_REPORT_URL } from '@/components/credor/risk-pulse/partner-access'
import { consentLink, partnerReportLink } from '@/composables/useAppView'
import { usePartnerAccess } from '@/composables/usePartnerAccess'
import { useSnackbar } from '@/composables/useSnackbar'

/**
 * The buyer's RiskPulse score while creating a sale. One anatomy for every state:
 * who on the left; the score, one line of context and the action on the right.
 * A score the buyer has not shared is blurred, never shown.
 */
const props = defineProps<{ npwp: string; email: string; name: string }>()

const { partners, lookup, addFromDirectory, request, resend } = usePartnerAccess()
const { show } = useSnackbar()

const digits = computed(() => npwpDigits(props.npwp))
const valid = computed(() => digits.value.length === 15 || digits.value.length === 16)

const partner = computed(() =>
  valid.value ? partners.value.find((item) => item.npwp === digits.value || item.npwp === `0${digits.value}`) : undefined,
)
const registered = computed(() => {
  if (!valid.value || partner.value) return null
  const result = lookup(digits.value)
  return result.kind === 'registered' ? result.partner : null
})

const company = computed(() => partner.value?.name ?? registered.value?.name ?? (props.name.trim() || 'This buyer'))

type State = 'shared' | 'hidden' | 'pending' | 'declined' | 'outside'
const state = computed<State>(() => {
  if (partner.value?.status === 'unlocked') return 'shared'
  if (partner.value?.status === 'pending') return 'pending'
  if (partner.value?.status === 'declined') return 'declined'
  if (registered.value || partner.value?.onAchilles) return 'hidden'
  return 'outside'
})

const caption = computed(() => {
  switch (state.value) {
    case 'shared':
      return `Shared until ${partner.value?.accessUntil}`
    case 'pending':
      return `Waiting for approval · sent ${partner.value?.requestedOn}`
    case 'declined':
      return 'Request declined'
    case 'hidden':
      return 'Lower the risk on this deal by knowing who you sell to. Request their score to see it.'
    default:
      return 'Not on Achilles'
  }
})

const requestOpen = ref(false)

function openRequest() {
  if (registered.value) addFromDirectory(registered.value.id)
  requestOpen.value = true
}

async function copyLink() {
  if (!partner.value) return
  try {
    await navigator.clipboard.writeText(consentLink(partner.value.id))
    show({ variant: 'success', title: 'Consent link copied', description: `Send it to ${partner.value.name} by WhatsApp or chat.` })
  } catch {
    show({ variant: 'error', title: 'Could not copy the link', description: 'Try again, or resend the email instead.' })
  }
}

// Prototype: an invite to a company outside Achilles carries the consent request with it.
function invite() {
  if (!props.email) {
    show({ variant: 'neutral', title: 'Add the buyer email first', description: 'The invite goes to that address.' })
    document.getElementById('buyer-email')?.focus()
    return
  }
  show({ variant: 'success', title: `Invite sent to ${props.email}`, description: 'Their score opens once they join Achilles and approve.' })
}

function focusPanel() {
  document.getElementById('buyer-pulse')?.focus()
}
</script>

<template>
  <section v-if="valid" id="buyer-pulse" class="bp" :data-state="state" :aria-label="`RiskPulse score of ${company}`" tabindex="-1">
    <div class="bp__who">
      <p class="bp__company">{{ company }}</p>
      <img src="/logo/logo-riskpulse.svg" alt="RiskPulse" class="bp__logo">
    </div>

    <div class="bp__score-block">
      <p v-if="state === 'shared' && partner" class="bp__score">
        <span class="bp__number">{{ partner.score.toFixed(1) }}</span><span class="bp__scale">/5</span>
        <RiskBandChip :score="partner.score" />
      </p>
      <p v-else-if="state !== 'outside'" class="bp__score"><RiskBlurredScore size="lg" :seed="company" /></p>
      <p v-else class="bp__score bp__score--none">No score yet</p>
      <p class="bp__caption">
        {{ caption }}
      </p>
    </div>

    <div class="bp__actions">
      <template v-if="state === 'shared' && partner">
        <RiskIconAction icon="/icons/common-actions/visibility.svg" label="View report" :aria-label="`View report of ${partner.name}`" :href="partnerReportLink(partner.id)" />
        <RiskIconAction icon="/icons/ui-actions/file-download.svg" label="Download PDF" :aria-label="`Download PDF report of ${partner.name}`" :href="PARTNER_REPORT_URL" />
      </template>
      <template v-else-if="state === 'pending' && partner">
        <RiskIconAction icon="/icons/communications/link.svg" label="Copy link" :aria-label="`Copy consent link for ${partner.name}`" @click="copyLink" />
        <RiskIconAction icon="/icons/communications/forward-to-inbox.svg" label="Resend email" :aria-label="`Resend request email to ${partner.name}`" @click="resend(partner.id)" />
      </template>
      <!-- White on the tinted panel: the one action here, without the weight of a dark primary button. -->
      <Button v-else-if="state === 'hidden' || state === 'declined'" class="bp__request" color="inverse" size="small" type="button" @click="openRequest">
        {{ state === 'declined' ? 'Request again' : 'Request score' }}
      </Button>
      <Button v-else class="bp__invite" variant="outline" color="neutral" size="small" type="button" @click="invite">Invite</Button>
    </div>

    <RiskPartnerRequestDialog v-model:open="requestOpen" :partner="partner ?? null" @sent="request" @closed="focusPanel" />
  </section>
</template>

<style scoped>
.bp {
  display: grid;
  /* Who on the first row at full width; the score and its action share the second. */
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--primitives-padding-3) var(--primitives-padding-4);
  padding: var(--primitives-padding-4) var(--primitives-padding-5);
  border-radius: var(--primitives-border-radius-md);
  /* A soft glow from the RiskPulse corner fading to white: highlighted, without a flat blue block or an outline. */
  background:
    radial-gradient(
      120% 160% at 100% 0%,
      var(--semantic-bg-ach-color-bg-illustration-tint) 0%,
      var(--component-card-background) 70%
    );
  box-shadow:
    calc(var(--primitives-shadows-sm-shadow-1-x) * 1px)
      calc(var(--primitives-shadows-sm-shadow-1-y) * 1px)
      calc(var(--primitives-shadows-sm-shadow-1-blur) * 1px)
      var(--primitives-shadows-sm-color);
}

.bp:focus {
  outline: none;
}

.bp__who {
  display: flex;
  min-width: 0;
  grid-column: 1 / -1;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-3);
  padding-bottom: var(--primitives-padding-3);
  border-bottom: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
}

.bp__logo {
  height: 20px;
}

.bp__company {
  max-width: 100%;
  margin: 0;
  overflow: hidden;
  font-size: var(--primitives-font-sizes-md);
  font-weight: 600;
  line-height: var(--primitives-line-heights-md);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bp__score-block {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.bp__score {
  display: flex;
  align-items: baseline;
  gap: var(--primitives-padding-1);
  margin: 0;
}

.bp__score :deep(.band-chip) {
  align-self: center;
  margin-left: var(--primitives-padding-1);
}

.bp__number {
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-2xl);
  font-weight: 700;
  line-height: var(--primitives-line-heights-2xl);
  font-variant-numeric: tabular-nums;
}

.bp__scale {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
}

.bp__score--none {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 600;
}

.bp__caption {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
}

.bp__actions {
  display: flex;
  gap: var(--primitives-padding-2);
}


.bp__invite.ach-button--outlined.ach-button--color-neutral {
  /* The Credor secondary action, as on the homepage cards: a light border on a pill. */
  border-color: var(--component-card-border);
  border-radius: var(--primitives-border-radius-infinite);
}
.bp__request.ach-button--solid.ach-button--color-inverse {
  border: 0;
  box-shadow:
    calc(var(--primitives-shadows-sm-shadow-1-x) * 1px)
      calc(var(--primitives-shadows-sm-shadow-1-y) * 1px)
      calc(var(--primitives-shadows-sm-shadow-1-blur) * 1px)
      var(--primitives-shadows-sm-color);
}
</style>
