import { computed, nextTick, ref } from 'vue'
import { usePersonalisationDrawer } from '@/composables/usePersonalisationDrawer'
import { usePrototypeState } from '@/lib/prototype/usePrototypeState'

export type PortalId = 'achilles' | 'lender'
export type LenderLeadTab = 'unclaimed' | 'claimed' | 'rejected'
export type LenderDetailTab = 'borrower' | 'loan' | 'risk-pulse'
export type LenderNavSection = 'leads' | 'loans' | 'settings'

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
  | { name: 'lender-leads'; tab?: LenderLeadTab; drawerId?: string }
  | { name: 'lender-lead-detail'; id: string; tab?: LenderDetailTab }
  | { name: 'lender-loan-detail'; id: string; tab?: LenderDetailTab }
  | { name: 'lender-contract'; id: string; contractId: string; from: 'leads' | 'loans' }
  | { name: 'lender-loans'; drawerId?: string }
  | { name: 'lender-settings'; section?: 'integrations' }

const CONSENT_HASH = /^#\/consent\/([\w-]+)$/

// A shared consent link (#/consent/<partner id>) opens straight on the consent page.
const REPORT_HASH = /^#\/partner-report\/([\w-]+)$/

const LENDER_HASH = /^#\/lender(?:\/|\?|$)/
const LENDER_ROOT_HASH = /^#\/lender\/?$/
const LENDER_LEADS_HASH = /^#\/lender\/leads\/?$/
const LENDER_LEAD_DETAIL_HASH = /^#\/lender\/leads\/([\w-]+)\/?$/
const LENDER_LOANS_HASH = /^#\/lender\/loans\/?$/
const LENDER_LOAN_DETAIL_HASH = /^#\/lender\/loans\/([\w-]+)\/?$/
const LENDER_CONTRACT_HASH = /^#\/lender\/(leads|loans)\/([\w-]+)\/contracts\/([\w-]+)\/?$/
const LENDER_SETTINGS_HASH = /^#\/lender\/settings(?:\/integrations)?\/?$/

function parseLenderLeadTab(raw: string | null): LenderLeadTab {
  if (raw === 'claimed' || raw === 'rejected') return raw
  return 'unclaimed'
}

function parseLenderDetailTab(raw: string | null): LenderDetailTab {
  if (raw === 'loan' || raw === 'risk-pulse') return raw
  return 'borrower'
}

function parseLenderHash(hash: string): AppView | null {
  if (!LENDER_HASH.test(hash)) return null

  const queryIndex = hash.indexOf('?')
  const pathPart = queryIndex >= 0 ? hash.slice(0, queryIndex) : hash
  const params = new URLSearchParams(queryIndex >= 0 ? hash.slice(queryIndex + 1) : '')

  if (LENDER_ROOT_HASH.test(pathPart) || LENDER_LEADS_HASH.test(pathPart)) {
    const tab = parseLenderLeadTab(params.get('tab'))
    const drawerId = params.get('id') || undefined
    return { name: 'lender-leads', tab, drawerId }
  }

  const contractMatch = LENDER_CONTRACT_HASH.exec(pathPart)
  if (contractMatch) {
    const from = contractMatch[1] === 'loans' ? 'loans' : 'leads'
    return {
      name: 'lender-contract',
      from,
      id: decodeURIComponent(contractMatch[2]),
      contractId: decodeURIComponent(contractMatch[3]),
    }
  }

  const leadDetailMatch = LENDER_LEAD_DETAIL_HASH.exec(pathPart)
  if (leadDetailMatch) {
    return {
      name: 'lender-lead-detail',
      id: decodeURIComponent(leadDetailMatch[1]),
      tab: parseLenderDetailTab(params.get('tab')),
    }
  }

  if (LENDER_LOANS_HASH.test(pathPart)) {
    const drawerId = params.get('id') || undefined
    return { name: 'lender-loans', drawerId }
  }

  const loanDetailMatch = LENDER_LOAN_DETAIL_HASH.exec(pathPart)
  if (loanDetailMatch) {
    return {
      name: 'lender-loan-detail',
      id: decodeURIComponent(loanDetailMatch[1]),
      tab: parseLenderDetailTab(params.get('tab')),
    }
  }

  if (LENDER_SETTINGS_HASH.test(pathPart)) {
    return { name: 'lender-settings', section: 'integrations' }
  }

  return { name: 'lender-leads', tab: 'unclaimed' }
}

// Shared links: a consent link (#/consent/<id>), a partner report (#/partner-report/<id>), or a Lender Portal route (#/lender/...).
function viewFromHash(): AppView | null {
  const consent = CONSENT_HASH.exec(window.location.hash)?.[1]
  if (consent) return { name: 'consent', partnerId: consent }
  const report = REPORT_HASH.exec(window.location.hash)?.[1]
  if (report) return { name: 'partner-report', partnerId: report }
  return parseLenderHash(window.location.hash)
}

const initialHashView = viewFromHash()
if (LENDER_ROOT_HASH.test(window.location.hash)) {
  history.replaceState(null, '', '#/lender/leads')
}

const view = ref<AppView>(initialHashView ?? { name: 'home' })

// A consent link or lender route pasted into a tab that already has the app open only changes the hash.
window.addEventListener('hashchange', () => {
  const next = viewFromHash()
  if (next) {
    if (LENDER_ROOT_HASH.test(window.location.hash)) {
      history.replaceState(null, '', '#/lender/leads')
    }
    view.value = next
    return
  }
  if (!window.location.hash && view.value.name.startsWith('lender-')) {
    view.value = { name: 'home' }
  }
})

/** The link the request email carries, also copied for WhatsApp. Prototype: the partner id stands in for a signed token. */
export function consentLink(partnerId: string): string {
  return `${window.location.origin}${window.location.pathname}#/consent/${partnerId}`
}

/** Opens a shared partner report in a new tab, so a form in progress stays as it is. */
export function partnerReportLink(partnerId: string): string {
  return `${window.location.origin}${window.location.pathname}#/partner-report/${partnerId}`
}

const activePortal = computed<PortalId>(() =>
  view.value.name.startsWith('lender-') ? 'lender' : 'achilles',
)

const activeLenderNav = computed<LenderNavSection>(() => {
  const current = view.value
  if (
    current.name === 'lender-loans' ||
    current.name === 'lender-loan-detail' ||
    (current.name === 'lender-contract' && current.from === 'loans')
  ) {
    return 'loans'
  }
  if (current.name === 'lender-settings') {
    return 'settings'
  }
  return 'leads'
})

function clearLenderHash() {
  if (LENDER_HASH.test(window.location.hash)) {
    history.replaceState(null, '', window.location.pathname)
  }
}

/** Prototype-level navigation between the homepage, borrower flows, and the Lender Portal. */
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
    clearLenderHash()
    view.value = { name: 'apply', entry }
    window.scrollTo({ top: 0 })
  }

  function openApplication(id: string, justSubmitted = false) {
    clearLenderHash()
    view.value = { name: 'application', id, justSubmitted }
    window.scrollTo({ top: 0 })
  }

  function openTransactions(tabId: string) {
    clearLenderHash()
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
    clearLenderHash()
    view.value = { name: 'risk-pulse' }
    focusHeading()
  }

  function openPartners() {
    // Leaving a consent page opened from a link drops the link, so a reload lands in the app.
    if (
      CONSENT_HASH.test(window.location.hash) ||
      REPORT_HASH.test(window.location.hash) ||
      LENDER_HASH.test(window.location.hash)
    ) {
      history.replaceState(null, '', window.location.pathname)
    }
    view.value = { name: 'partners' }
    focusHeading()
  }

  async function openSales(focusId?: string) {
    clearLenderHash()
    view.value = { name: 'sales', focusId }
    if (!focusId) return focusHeading()
    window.scrollTo({ top: 0 })
    await nextTick()
    document.getElementById(focusId)?.focus()
  }

  function openSalesCreate() {
    clearLenderHash()
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
    clearLenderHash()
    view.value = { name: 'partner-report', partnerId }
    focusHeading()
  }

  function openLenderLeads(tab: LenderLeadTab = 'unclaimed', drawerId?: string) {
    const query = new URLSearchParams()
    if (tab !== 'unclaimed' || drawerId) query.set('tab', tab)
    if (drawerId) query.set('id', drawerId)
    const qs = query.toString()
    const hash = qs ? `#/lender/leads?${qs}` : '#/lender/leads'
    const wasLeads = view.value.name === 'lender-leads'
    history.replaceState(null, '', hash)
    view.value = { name: 'lender-leads', tab, drawerId }
    if (!drawerId && !wasLeads) {
      focusHeading()
    }
  }

  function openLenderLeadDetail(id: string, tab: LenderDetailTab = 'borrower') {
    const hash =
      tab !== 'borrower'
        ? `#/lender/leads/${encodeURIComponent(id)}?tab=${tab}`
        : `#/lender/leads/${encodeURIComponent(id)}`
    const wasSameDetail = view.value.name === 'lender-lead-detail' && view.value.id === id
    history.replaceState(null, '', hash)
    view.value = { name: 'lender-lead-detail', id, tab }
    if (!wasSameDetail) {
      focusHeading()
    }
  }

  function openLenderLoanDetail(id: string, tab: LenderDetailTab = 'borrower') {
    const hash =
      tab !== 'borrower'
        ? `#/lender/loans/${encodeURIComponent(id)}?tab=${tab}`
        : `#/lender/loans/${encodeURIComponent(id)}`
    const wasSameDetail = view.value.name === 'lender-loan-detail' && view.value.id === id
    history.replaceState(null, '', hash)
    view.value = { name: 'lender-loan-detail', id, tab }
    if (!wasSameDetail) {
      focusHeading()
    }
  }

  function openLenderContract(id: string, contractId: string, from: 'leads' | 'loans' = 'leads') {
    const hash = `#/lender/${from}/${encodeURIComponent(id)}/contracts/${encodeURIComponent(contractId)}`
    history.replaceState(null, '', hash)
    view.value = { name: 'lender-contract', id, contractId, from }
    focusHeading()
  }

  function openLenderLoans(drawerId?: string) {
    const hash = drawerId ? `#/lender/loans?id=${encodeURIComponent(drawerId)}` : '#/lender/loans'
    const wasLoans = view.value.name === 'lender-loans'
    history.replaceState(null, '', hash)
    view.value = { name: 'lender-loans', drawerId }
    if (!drawerId && !wasLoans) {
      focusHeading()
    }
  }

  function openLenderSettings() {
    history.replaceState(null, '', '#/lender/settings/integrations')
    view.value = { name: 'lender-settings', section: 'integrations' }
    focusHeading()
  }

  /** `focusId` names the control that opened the page we are leaving; it gets focus back when it exists. */
  async function goHome(focusId?: string) {
    if (
      CONSENT_HASH.test(window.location.hash) ||
      REPORT_HASH.test(window.location.hash) ||
      LENDER_HASH.test(window.location.hash)
    ) {
      history.replaceState(null, '', window.location.pathname)
    }
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

  return {
    view,
    activePortal,
    activeLenderNav,
    openApply,
    openApplication,
    openRiskPulse,
    openPartners,
    openPartnerReport,
    openConsentPage,
    openSales,
    openSalesCreate,
    openTransactions,
    openLenderLeads,
    openLenderLeadDetail,
    openLenderLoanDetail,
    openLenderContract,
    openLenderLoans,
    openLenderSettings,
    goHome,
  }
}
