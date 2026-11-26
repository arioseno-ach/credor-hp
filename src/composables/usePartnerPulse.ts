import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { usePartnerAccess } from '@/composables/usePartnerAccess'

/** Partner RiskPulse summary for the homepage health card: how many shared, and one partner at a time rotating. */
export function usePartnerPulse() {
  const { partners } = usePartnerAccess()

  const shared = computed(() => partners.value.filter((partner) => partner.status === 'unlocked'))

  // The two strongest shared scores, then one still hidden: a promo slot is no place to single out a weak band.
  const slides = computed(() => {
    const top = [...shared.value].sort((a, b) => b.score - a.score).slice(0, 2)
    const hidden = partners.value.find((partner) => partner.status !== 'unlocked')
    return hidden ? [...top, hidden] : top
  })

  const index = ref(0)
  const slide = computed(() => slides.value[index.value % Math.max(slides.value.length, 1)])

  let timer: number | undefined
  onMounted(() => {
    // Motion only for people who have not asked for less of it; they see the first partner, still.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    timer = window.setInterval(() => (index.value += 1), 3000)
  })
  onBeforeUnmount(() => window.clearInterval(timer))

  return { partners, shared, slide }
}
