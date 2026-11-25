import { ref } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'
import {
  accessUntil,
  achillesDirectory,
  formatAccessDate,
  initialPartnerScores,
  initialReceived,
  newConsentCode,
  nextStatus,
  npwpDigits,
  type PartnerAccessEvent,
  type PartnerScore,
} from '@/components/credor/risk-pulse/partner-access'

export type PartnerLookup =
  | { kind: 'invalid' }
  | { kind: 'portfolio'; partner: PartnerScore }
  | { kind: 'registered'; partner: Omit<PartnerScore, 'status' | 'lastTransaction'> }
  | { kind: 'unregistered' }

// Module-level, like useSnackbar: the Risk Pulse chapter and the Partners page share one prototype state.
const partners = ref(initialPartnerScores())
const received = ref(initialReceived())

export function usePartnerAccess() {
  const { show } = useSnackbar()

  function update(id: string, event: PartnerAccessEvent | null, patch: Partial<PartnerScore> = {}) {
    const partner = partners.value.find((item) => item.id === id)
    if (!partner) return
    Object.assign(partner, patch)
    if (event) partner.status = nextStatus(partner.status, event)
    return partner
  }

  function request(id: string) {
    const partner = update(id, 'request', { requestedOn: formatAccessDate(new Date()), consentCode: newConsentCode() })
    if (partner) show({ variant: 'success', title: `Request sent to ${partner.name}`, description: 'We will let you know when they reply.' })
  }

  // Prototype: resending only says where the email went; a real resend would also renew the link.
  function resend(id: string) {
    const partner = partners.value.find((item) => item.id === id)
    if (partner?.status === 'pending') {
      show({ variant: 'success', title: 'Request email sent again', description: `Sent to ${partner.email}.` })
    }
  }

  /** The partner's reply from the consent link. No snackbar: the person on that page is the partner, not the requester. */
  function answerFromLink(id: string, accepted: boolean) {
    const partner = partners.value.find((item) => item.id === id)
    if (!partner) return
    // A link opened in a fresh tab starts from the demo data, where the request was not sent yet.
    if (partner.status === 'locked') {
      partner.status = 'pending'
      partner.requestedOn ??= formatAccessDate(new Date())
      partner.consentCode ??= newConsentCode()
    }
    update(id, accepted ? 'accept' : 'decline', accepted ? { accessUntil: accessUntil(new Date()) } : {})
  }

  function completeSetup(id: string) {
    update(id, null, { onAchilles: true, authKeyReady: true })
  }

  function answerReceived(id: string, accepted: boolean) {
    const item = received.value.find((entry) => entry.id === id)
    if (!item || item.status !== 'pending') return
    item.status = accepted ? 'accepted' : 'declined'
    if (accepted) item.accessUntil = accessUntil(new Date())
    show(
      accepted
        ? { variant: 'success', title: `You shared your score with ${item.name}`, description: `They can see it until ${item.accessUntil}.` }
        : { variant: 'neutral', title: `You declined ${item.name}'s request`, description: 'They will not see your score.' },
    )
  }

  /** Stops sharing the signed-in company's report with a company it accepted earlier. */
  function revokeReceived(id: string) {
    const item = received.value.find((entry) => entry.id === id)
    if (!item || item.status !== 'accepted') return
    item.status = 'revoked'
    show({ variant: 'neutral', title: `${item.name} can no longer see your report`, description: 'Copies they already downloaded stay with them.' })
  }

  function lookup(value: string): PartnerLookup {
    const digits = npwpDigits(value)
    if (digits.length !== 15 && digits.length !== 16) return { kind: 'invalid' }
    // A 15-digit entry matches the same company as its 16-digit form with a leading 0.
    const match = (npwp: string) => npwp === digits || npwp === `0${digits}`
    const partner = partners.value.find((item) => match(item.npwp))
    if (partner) return { kind: 'portfolio', partner }
    const listed = achillesDirectory.find((item) => match(item.npwp))
    return listed ? { kind: 'registered', partner: listed } : { kind: 'unregistered' }
  }

  /** Adds a registered company found by NPWP to the portfolio, locked, so the usual request dialog can send the request. */
  function addFromDirectory(id: string) {
    const listed = achillesDirectory.find((item) => item.id === id)
    if (listed && !partners.value.some((item) => item.id === id)) {
      partners.value.push({ ...listed, lastTransaction: '', status: 'locked' })
    }
  }

  return { partners, received, request, resend, answerFromLink, completeSetup, answerReceived, revokeReceived, lookup, addFromDirectory }
}
