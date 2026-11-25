import { nextTick, ref } from 'vue'
import { usePersonalisationDrawer } from '@/composables/usePersonalisationDrawer'
import { usePrototypeState } from '@/lib/prototype/usePrototypeState'

/** Where an application starts: a transactions row, a partner card, or a product card. */
export type ApplyEntry =
  | { kind: 'invoice'; tabId: string; rowId: string }
  | { kind: 'partner'; partnerId: string }
  /** `resume` continues an in-progress personalisation: only the NPWP is on file so far. */
  | { kind: 'product'; productId: string; resume?: boolean }

export type AppView =
  | { name: 'home' }
  | { name: 'apply'; entry: ApplyEntry }
  | { name: 'application'; id: string; justSubmitted: boolean }
  | { name: 'risk-pulse' }
  | { name: 'partners' }
  /** A partner's Company Health report, readable once they share it. */
  | { name: 'partner-report'; partnerId: string }
  | { name: 'transactions'; tabId: string }
  /** Sales transactions list; `focusId` names a new row to land on after creating it. */
  | { name: 'sales'; focusId?: string }
  | { name: 'sales-create' }
  /** The public consent page a partner opens from the request email, outside the signed-in app shell. */
  | { name: 'consent'; partnerId: string }

const CONSENT_HASH = /^#\/consent\/([\w-]+)$/

// A shared consent link (#/consent/<partner id>) opens straight on the consent page.
const REPORT_HASH = /^#\/partner-report\/([\w-]+)$/

// Shared links: a consent link (#/consent/<id>) or a partner report opened in a new tab (#/partner-report/<id>).
function viewFromHash(): AppView | null {
  const consent = CONSENT_HASH.exec(window.location.hash)?.[1]
  if (consent) return { name: 'consent', partnerId: consent }
  const report = REPORT_HASH.exec(window.location.hash)?.[1]
  return report ? { name: 'partner-report', partnerId: report } : null
}

const view = ref<AppView>(viewFromHash() ?? { name: 'home' })

// A consent link pasted into a tab that already has the app open only changes the hash.
window.addEventListener('hashchange', () => {
  const next = viewFromHash()
  if (next) view.value = next
})

/** The link the request email carries, also copied for WhatsApp. Prototype: the partner id stands in for a signed token. */
export function consentLink(partnerId: string): string {
  return `${window.location.origin}${window.location.pathname}#/consent/${partnerId}`
}

/** Opens a shared partner report in a new tab, so a form in progress stays as it is. */
export function partnerReportLink(partnerId: string): string {
  return `${window.location.origin}${window.location.pathname}#/partner-report/${partnerId}`
}

/** Prototype-level navigation between the homepage and an application detail page. */
export function useAppView() {
  const { state } = usePrototypeState()
  const { open: openPersonalisation } = usePersonalisationDrawer()

  /** Full-page application, started from a transactions row, a partner, a product card or search.
   *  Before personalisation, a product (general loan) goes through the NPWP and Coretax drawer first. */
  function openApply(entry: ApplyEntry) {
    if (entry.kind === 'product' && state.stage === 'default') {
      openPersonalisation(() => openApply(entry))
      return
    }
    view.value = { name: 'apply', entry }
    window.scrollTo({ top: 0 })
  }

  function openApplication(id: string, justSubmitted = false) {
    view.value = { name: 'application', id, justSubmitted }
    window.scrollTo({ top: 0 })
  }

  function openTransactions(tabId: string) {
    view.value = { name: 'transactions', tabId }
    window.scrollTo({ top: 0 })
  }

  // The control that opened the page unmounts with the old one, so the new page heading takes focus.
  async function focusHeading() {
    window.scrollTo({ top: 0 })
    await nextTick()
    const heading = document.querySelector<HTMLElement>('.app-content h1')
    heading?.setAttribute('tabindex', '-1')
    heading?.focus({ preventScroll: true })
  }

  function openRiskPulse() {
    view.value = { name: 'risk-pulse' }
    focusHeading()
  }

  function openPartners() {
    // Leaving a consent page opened from a link drops the link, so a reload lands in the app.
    if (CONSENT_HASH.test(window.location.hash) || REPORT_HASH.test(window.location.hash)) history.replaceState(null, '', window.location.pathname)
    view.value = { name: 'partners' }
    focusHeading()
  }

  async function openSales(focusId?: string) {
    view.value = { name: 'sales', focusId }
    if (!focusId) return focusHeading()
    window.scrollTo({ top: 0 })
    await nextTick()
    document.getElementById(focusId)?.focus()
  }

  function openSalesCreate() {
    view.value = { name: 'sales-create' }
    focusHeading()
  }

  function openConsentPage(partnerId: string) {
    // The address bar shows the same link the email carries, so a reload stays on the consent page.
    history.replaceState(null, '', `#/consent/${partnerId}`)
    view.value = { name: 'consent', partnerId }
    window.scrollTo({ top: 0 })
  }

  function openPartnerReport(partnerId: string) {
    view.value = { name: 'partner-report', partnerId }
    focusHeading()
  }

  /** `focusId` names the control that opened the page we are leaving; it gets focus back when it exists. */
  async function goHome(focusId?: string) {
    view.value = { name: 'home' }
    window.scrollTo({ top: 0 })
    // The Back button unmounts with the detail page, so focus the opener or a homepage heading instead.
    await nextTick()
    const opener = focusId ? document.getElementById(focusId) : null
    if (opener) {
      // Scroll allowed: at narrow widths the card sits below the main column.
      opener.focus()
      return
    }
    const heading =
      document.getElementById('transactions-title') ??
      document.getElementById('recent-applications-title')
    heading?.setAttribute('tabindex', '-1')
    heading?.focus({ preventScroll: true })
  }

  return { view, openApply, openApplication, openRiskPulse, openPartners, openPartnerReport, openConsentPage, openSales, openSalesCreate, openTransactions, goHome }
}
