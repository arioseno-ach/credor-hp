import { ref } from 'vue'

export type PersonalisationStep = 'verify' | 'coretax'

const isOpen = ref(false)
const step = ref<PersonalisationStep>('verify')

export function usePersonalisationDrawer() {
  function open() {
    step.value = 'verify'
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  function goToCoretax() {
    step.value = 'coretax'
  }

  return { isOpen, step, open, close, goToCoretax }
}
