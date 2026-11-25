<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import RiskBlurredScore from '@/components/credor/risk-pulse/RiskBlurredScore.vue'
import RiskIconAction from '@/components/credor/risk-pulse/RiskIconAction.vue'
import RiskPartnerRequestDialog from '@/components/credor/risk-pulse/RiskPartnerRequestDialog.vue'
import { npwpDigits, PARTNER_REPORT_URL } from '@/components/credor/risk-pulse/partner-access'
import { bandFor, bandStrong } from '@/components/credor/risk-pulse/shared'
import { scoreBandIndex } from '@/lib/risk-pulse'
import { consentLink, partnerReportLink } from '@/composables/useAppView'
import { usePartnerAccess } from '@/composables/usePartnerAccess'
import { useSnackbar } from '@/composables/useSnackbar'

/**
 * The buyer's RiskPulse score while creating a sale. One anatomy for every state:
 * the RiskPulse mark and the actions on top; what it means on the left and the score on the right below.
 * A score the buyer has not shared is blurred, never shown.
 */
const props = defineProps<{ npwp: string; email: string; name: string }>()

const { partners, lookup, addFromDirectory, addBuyer, request, resend } = usePartnerAccess()
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

// Every company has a score from its tax data, so there is no "no score" state: unshared is simply hidden.
type State = 'shared' | 'hidden' | 'pending' | 'declined'
const state = computed<State>(() => {
  if (partner.value?.status === 'unlocked') return 'shared'
  if (partner.value?.status === 'pending') return 'pending'
  if (partner.value?.status === 'declined') return 'declined'
  return 'hidden'
})

// What each band means for a buyer, in one plain line. Descriptive only: never a credit decision.
const bandMeaning = [
  'Weak signals across their tax and business data. Agree on terms with care.',
  'Mixed signals. Some areas need attention before larger deals.',
  'Healthy overall, with a few areas to watch.',
  'Strong and consistent signals across most areas.',
  'Consistently strong across every area we check.',
]

const band = computed(() => (state.value === 'shared' && partner.value ? bandFor(partner.value.score) : null))
const bandIndex = computed(() => (partner.value ? scoreBandIndex(partner.value.score) : 0))
// The marker sits on the 1 to 5 scale, kept off the very edges so it stays inside the meter.
const markerLeft = computed(() => `${Math.min(97, Math.max(3, (((partner.value?.score ?? 1) - 1) / 4) * 100))}%`)

const caption = computed(() => {
  switch (state.value) {
    case 'pending':
      return `Waiting for ${company.value} to approve. Sent ${partner.value?.requestedOn}.`
    case 'declined':
      return `${company.value} declined your last request. You can ask again.`
    default:
      return 'Lower the risk on this deal by knowing who you sell to. Request their score to see it.'
  }
})

const requestOpen = ref(false)

function openRequest() {
  if (registered.value) addFromDirectory(registered.value.id)
  else if (!partner.value) addBuyer({ name: company.value, npwp: props.npwp, email: props.email })
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


function focusPanel() {
  document.getElementById('buyer-pulse')?.focus()
}
</script>

<template>
  <section
    v-if="valid"
    id="buyer-pulse"
    class="bp"
    :data-state="state"
    :style="band ? { '--bp-glow': band.muted } : undefined"
    :aria-label="`RiskPulse score of ${company}`"
    tabindex="-1"
  >
    <header class="bp__top">
      <img src="/logo/logo-riskpulse.svg" alt="RiskPulse" class="bp__logo">
      <div class="bp__actions">
        <template v-if="state === 'shared' && partner">
          <RiskIconAction icon="/icons/common-actions/visibility.svg" label="View report" :aria-label="`View report of ${partner.name}`" :href="partnerReportLink(partner.id)" />
          <RiskIconAction icon="/icons/ui-actions/file-download.svg" label="Download PDF" :aria-label="`Download PDF report of ${partner.name}`" :href="PARTNER_REPORT_URL" />
        </template>
        <template v-else-if="state === 'pending' && partner">
          <RiskIconAction icon="/icons/communications/link.svg" label="Copy link" :aria-label="`Copy consent link for ${partner.name}`" @click="copyLink" />
          <RiskIconAction icon="/icons/communications/forward-to-inbox.svg" label="Resend email" :aria-label="`Resend request email to ${partner.name}`" @click="resend(partner.id)" />
        </template>
        <!-- White on the glow: the one action here, without the weight of a dark primary button. -->
        <Button v-else class="bp__request" color="inverse" size="small" type="button" @click="openRequest">
          {{ state === 'declined' ? 'Request again' : 'Request score' }}
        </Button>
      </div>
    </header>

    <div class="bp__body">
      <div class="bp__meaning">
        <template v-if="band && partner">
          <div class="bp__meter" aria-hidden="true">
            <span
              v-for="(color, index) in bandStrong"
              :key="index"
              class="bp__segment"
              :class="{ 'bp__segment--dim': index !== bandIndex }"
              :style="{ background: color }"
            ></span>
            <span class="bp__marker" :style="{ left: markerLeft }"></span>
          </div>
          <p class="bp__band" :style="{ '--band-dot': band.strong }">{{ band.label }}</p>
          <p class="bp__text">{{ bandMeaning[bandIndex] }}</p>
        </template>
        <p v-else class="bp__text">{{ caption }}</p>
      </div>

      <div class="bp__score">
        <template v-if="state === 'shared' && partner">
          <p class="bp__value"><span class="bp__number">{{ partner.score.toFixed(1) }}</span><span class="bp__scale">/5</span></p>
          <p class="bp__note">Shared until {{ partner.accessUntil }}</p>
        </template>
        <RiskBlurredScore v-else size="lg" :seed="partner?.npwp ?? digits" />
      </div>
    </div>

    <RiskPartnerRequestDialog v-model:open="requestOpen" :partner="partner ?? null" @sent="request" @closed="focusPanel" />
  </section>
</template>

<style scoped>
.bp {
  /* The glow takes the band colour once a score is shared; until then, the RiskPulse tint. */
  --bp-glow: var(--semantic-bg-ach-color-bg-illustration-tint);
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-4) var(--primitives-padding-5);
  border-radius: var(--primitives-border-radius-md);
  /* A faint wash falling from the top centre: the band colour mixed half with white, fading out early. */
  background: radial-gradient(
    70% 100% at 50% 0%,
    color-mix(in srgb, var(--bp-glow) 50%, var(--component-card-background)) 0%,
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

.bp__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-3);
}

.bp__logo {
  height: 22px;
}

.bp__actions {
  display: flex;
  gap: var(--primitives-padding-2);
}

.bp__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--primitives-padding-5);
}

.bp__meaning {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--primitives-padding-1);
}

/* The homepage Company Health meter at small size: five bands, the current one in full colour, a marker on the score. */
.bp__meter {
  position: relative;
  display: grid;
  max-width: 240px;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 3px;
  margin-bottom: var(--primitives-padding-2);
}

.bp__segment {
  height: var(--primitives-padding-2);
  border-radius: var(--primitives-border-radius-xs);
}

.bp__segment--dim {
  opacity: 0.3;
}

.bp__marker {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  border: 2px solid var(--semantic-text-ach-color-text-default);
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--component-card-background);
  transform: translate(-50%, -50%);
}

.bp__band {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-2);
  margin: 0;
  font-size: var(--primitives-font-sizes-md);
  font-weight: 600;
  line-height: var(--primitives-line-heights-md);
}

.bp__band::before {
  width: var(--primitives-padding-2);
  height: var(--primitives-padding-2);
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--band-dot);
  content: '';
}

.bp__text {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.bp__score {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  text-align: right;
}

.bp__value {
  margin: 0;
  white-space: nowrap;
}

.bp__number {
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-4xl);
  font-weight: 700;
  line-height: var(--primitives-line-heights-4xl);
  font-variant-numeric: tabular-nums;
}

.bp__scale {
  margin-left: 2px;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-md);
}

.bp__note {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
  white-space: nowrap;
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
