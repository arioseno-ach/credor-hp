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

const view = ref<AppView>({ name: 'home' })

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

  function openRiskPulse() {
    view.value = { name: 'risk-pulse' }
    window.scrollTo({ top: 0 })
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

  return { view, openApply, openApplication, openRiskPulse, goHome }
}
