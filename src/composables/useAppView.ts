import { nextTick, ref } from 'vue'

/** Where an application starts: a transactions row, a partner card, or a product card. */
export type ApplyEntry =
  | { kind: 'invoice'; tabId: string; rowId: string }
  | { kind: 'partner'; partnerId: string }
  | { kind: 'product'; productId: string }

export type AppView =
  | { name: 'home' }
  | { name: 'apply'; entry: ApplyEntry }
  | { name: 'application'; id: string; justSubmitted: boolean }

const view = ref<AppView>({ name: 'home' })

/** Prototype-level navigation between the homepage and an application detail page. */
export function useAppView() {
  /** Full-page application, started from a transactions row, a partner, or a product card. */
  function openApply(entry: ApplyEntry) {
    view.value = { name: 'apply', entry }
    window.scrollTo({ top: 0 })
  }

  function openApplication(id: string, justSubmitted = false) {
    view.value = { name: 'application', id, justSubmitted }
    window.scrollTo({ top: 0 })
  }

  async function goHome() {
    view.value = { name: 'home' }
    window.scrollTo({ top: 0 })
    // The Back button unmounts with the detail page, so focus a homepage heading instead.
    await nextTick()
    const heading =
      document.getElementById('transactions-title') ??
      document.getElementById('recent-applications-title')
    heading?.setAttribute('tabindex', '-1')
    heading?.focus({ preventScroll: true })
  }

  return { view, openApply, openApplication, goHome }
}
