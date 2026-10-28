import { ref } from 'vue'

export type PersonalisationStep = 'verify' | 'coretax'

const isOpen = ref(false)
const step = ref<PersonalisationStep>('verify')
/** Runs once when the drawer is completed, not when it is cancelled. */
let afterComplete: (() => void) | null = null

export function usePersonalisationDrawer() {
  function open(next?: () => void) {
    step.value = 'verify'
    afterComplete = typeof next === 'function' ? next : null
    isOpen.value = true
  }

  /** Hands back the pending follow-up and clears it, so it can only run once. */
  function takeAfterComplete(): (() => void) | null {
    const next = afterComplete
    afterComplete = null
    return next
  }

  function clearAfterComplete() {
    afterComplete = null
  }

  function close() {
    isOpen.value = false
  }

  function goToCoretax() {
    step.value = 'coretax'
  }

  return { isOpen, step, open, close, goToCoretax, takeAfterComplete, clearAfterComplete }
}
