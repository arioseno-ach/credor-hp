import { nextTick, ref } from 'vue'

export type AppView =
  | { name: 'home' }
  | { name: 'apply'; tabId: string; rowId: string }
  | { name: 'application'; id: string; justSubmitted: boolean }

const view = ref<AppView>({ name: 'home' })

/** Prototype-level navigation between the homepage and an application detail page. */
export function useAppView() {
  /** Full-page application for one invoice or bill, started from a transactions row. */
  function openApply(tabId: string, rowId: string) {
    view.value = { name: 'apply', tabId, rowId }
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
