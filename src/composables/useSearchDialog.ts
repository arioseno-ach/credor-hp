import { nextTick, ref } from 'vue'

// One search dialog for the whole app; any trigger or the shortcut opens it.
export const searchOpen = ref(false)
let opener: HTMLElement | null = null

export function openSearch(from: HTMLElement | null) {
  opener = from
  searchOpen.value = true
}

export function closeSearch() {
  searchOpen.value = false
  nextTick(() => opener?.focus())
}
