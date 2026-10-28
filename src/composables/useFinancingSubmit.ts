import { ref } from 'vue'

const isOpen = ref(false)
const tabId = ref('sales')
const initialRowId = ref<string | null>(null)
/** The control that opened the sheet. Reka only restores focus to a DialogTrigger. */
const returnFocus = ref<HTMLElement | null>(null)

/** Shared open state so the transactions table can start the submit sheet for one invoice. */
export function useFinancingSubmit() {
  function open(nextTabId: string, rowId: string) {
    returnFocus.value = document.activeElement instanceof HTMLElement ? document.activeElement : null
    tabId.value = nextTabId
    initialRowId.value = rowId
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  return { isOpen, tabId, initialRowId, returnFocus, open, close }
}
