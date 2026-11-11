<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { verifiedCompany } from '@/components/credor/personalisation'
import { useAppView } from '@/composables/useAppView'
import { useSnackbar } from '@/composables/useSnackbar'
import { companyHealthCategories } from '@/lib/company-health'
import {
  areaLabelForLayerName,
  bottomCategories,
  categoryLabel,
  categorySignal,
  coverage,
  evidenceFor,
  formatDelta,
  getAreas,
  originalAreaLabel,
  sortMacroToMicro,
  improvementSteps,
  riskPulseMonths,
  scoreBand,
  scoreBandIndex,
  scoreDelta,
  topCategories,
  verdict,
} from '@/lib/risk-pulse'
import RiskAreaTable from './RiskAreaTable.vue'
import RiskFactorRow from './RiskFactorRow.vue'
import RiskGauge from './RiskGauge.vue'
import RiskIndicatorList from './RiskIndicatorList.vue'
import RiskScoreHead from './RiskScoreHead.vue'

const { goHome, openApply } = useAppView()
const { show } = useSnackbar()

/** The support channel is outside this prototype, so the action only says where it leads. */
function contactUs() {
  show({
    variant: 'neutral',
    title: 'Opens Talk to us',
    description: 'Contacting the Credor team is not part of this prototype.',
  })
}

/** Prototype report, rewritten on the same 1 to 5 baseline as this page. */
const reportUrl = `${import.meta.env.BASE_URL}reports/risk-pulse-report-demo.html`

// Newest month first; the latest is the real preview, earlier months are prototype history.
const monthKey = ref(riskPulseMonths[0].key)
const monthIndex = computed(() =>
  Math.max(0, riskPulseMonths.findIndex((month) => month.key === monthKey.value)),
)
const month = computed(() => riskPulseMonths[monthIndex.value])
const previousMonth = computed(() => riskPulseMonths[monthIndex.value + 1])
const report = computed(() => month.value.report)

const overall = computed(() => report.value.overall)
const counts = computed(() => coverage(report.value))
const areas = computed(() => sortMacroToMicro(getAreas(report.value)))

// Band index, not label: the loan simulator still names its bands in Bahasa.
const band = computed(() => scoreBand(overall.value))
const startingRate = computed(() => companyHealthCategories[scoreBandIndex(overall.value)].rate)

/** Change against the month before; null for the oldest month. */
const overallDelta = computed(() =>
  previousMonth.value ? scoreDelta(overall.value, previousMonth.value.report.overall) : null,
)

function areaDelta(areaId: string) {
  const current = report.value.layers.find((layer) => layer.id === areaId)
  const previous = previousMonth.value?.report.layers.find((layer) => layer.id === areaId)
  return current && previous ? scoreDelta(current.score, previous.score) : null
}

function deltaTone(delta: number) {
  return delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'
}

const chapters = [
  { id: 'rp-verdict', label: 'Verdict' },
  // What's working and Needs attention sit side by side, so they share one nav stop.
  { id: 'rp-highlights', label: 'Highlights' },
  { id: 'rp-breakdown', label: 'Breakdown' },
  { id: 'rp-improve', label: 'How to improve' },
]

const stories = computed(
  () =>
    [
      {
        id: 'rp-working',
        title: "What's working",
        evidenceLabel: 'Strongest signal',
        tone: 'strength',
        categories: topCategories(3, report.value),
      },
      {
        id: 'rp-attention',
        title: 'Needs attention',
        evidenceLabel: 'Weakest signal',
        tone: 'weakness',
        categories: bottomCategories(3, report.value),
      },
    ] as const,
)

/** Heading track + one track per category, shared by both cells so matching rows stay level. */
const pairRows = computed(() => 1 + Math.max(...stories.value.map((story) => story.categories.length)))

// Sticky chapter nav
const activeId = ref(chapters[0].id)
const navList = ref<HTMLElement | null>(null)
const titleHeading = ref<HTMLElement | null>(null)

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const endMarker = ref<HTMLElement | null>(null)

let observer: IntersectionObserver | undefined
let edgeObserver: IntersectionObserver | undefined
let atStart = true
// Set once the observers exist; re-reads the band after a jump lock ends.
let refreshActive = () => {}
let atEnd = false
let lockTimer: number | undefined
let locked = false

function jumpTo(id: string) {
  const section = document.getElementById(id)
  if (!section) return
  activeId.value = id
  // Hold the highlight on the chosen chapter while a smooth scroll passes the ones in between.
  locked = true
  window.clearTimeout(lockTimer)
  lockTimer = window.setTimeout(() => {
    locked = false
    refreshActive()
  }, 900)
  section.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
  section.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true })
}

onMounted(() => {
  titleHeading.value?.focus({ preventScroll: true })

  const intersecting = new Set<string>()

  function updateActive() {
    if (locked) return
    // With the page title in view no chapter has reached the band yet (tall phone header): that is the verdict.
    if (atStart) {
      activeId.value = chapters[0].id
      return
    }
    // On tall screens the last chapter never reaches the band; reaching the end of the page selects it.
    if (atEnd) {
      activeId.value = chapters[chapters.length - 1].id
      return
    }
    const current = chapters.find((chapter) => intersecting.has(chapter.id))
    if (current) activeId.value = current.id
  }
  refreshActive = updateActive

  // A thin band a quarter of the way down the viewport: the chapter crossing it is the one being read.
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) intersecting.add(entry.target.id)
        else intersecting.delete(entry.target.id)
      }
      updateActive()
    },
    { rootMargin: '-25% 0px -70% 0px' },
  )
  for (const chapter of chapters) {
    const section = document.getElementById(chapter.id)
    if (section) observer.observe(section)
  }

  edgeObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.target === titleHeading.value) atStart = entry.isIntersecting
      else atEnd = entry.isIntersecting
    }
    updateActive()
  })
  for (const marker of [titleHeading.value, endMarker.value]) {
    if (marker) edgeObserver.observe(marker)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
  edgeObserver?.disconnect()
  window.clearTimeout(lockTimer)
})

// On narrow screens the nav scrolls sideways; keep the active chapter in view.
watch(activeId, async () => {
  await nextTick()
  const list = navList.value
  const link = list?.querySelector<HTMLElement>('[aria-current="location"]')
  if (!list || !link || list.scrollWidth <= list.clientWidth) return
  // Scroll only the tab strip, to the nearest edge (centring cut "Verdict" down to its last letter),
  // so a page scroll from jumpTo is never interrupted.
  const min = link.offsetLeft + link.offsetWidth - list.clientWidth
  const max = link.offsetLeft
  list.scrollTo({
    left: Math.min(Math.max(list.scrollLeft, min), max),
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
  })
})
</script>

<template>
  <div class="rp">
    <header class="rp__header">
      <button type="button" class="rp__back" @click="goHome('risk-card-view-details')">
        <span class="rp__back-icon" aria-hidden="true"></span>
        Back to Home
      </button>
      <div class="rp__title-row">
        <div class="rp__title-block">
          <h1 id="risk-pulse-title" ref="titleHeading" class="rp__title" tabindex="-1">Your Company Health</h1>
          <p class="rp__subtitle">{{ verifiedCompany.name }}</p>
        </div>
        <div class="rp__actions">
          <span class="rp__month">
            <select v-model="monthKey" class="rp__month-select" aria-label="Report month">
              <option v-for="item in riskPulseMonths" :key="item.key" :value="item.key">
                {{ item.label }}
              </option>
            </select>
            <img
              class="rp__month-chevron"
              src="/icons/ui-actions/expand-more.svg"
              alt=""
              aria-hidden="true"
            />
          </span>
          <Button
            as="a"
            variant="outline"
            color="neutral"
            size="small"
            :href="reportUrl"
            target="_blank"
            rel="noopener"
          >
            <!-- One demo file for every month; only the month in the label follows the selection. -->
            {{ month.label }} report
            <span class="rp__download-icon" aria-hidden="true"></span>
            <span class="sr-only">(opens in a new tab)</span>
          </Button>
        </div>
      </div>
    </header>

    <nav class="rp__nav" aria-label="Page sections">
      <ul ref="navList" class="rp__nav-list">
        <li v-for="chapter in chapters" :key="chapter.id">
          <a
            class="rp__nav-link"
            :href="`#${chapter.id}`"
            :aria-current="activeId === chapter.id ? 'location' : undefined"
            @click.prevent="jumpTo(chapter.id)"
          >
            {{ chapter.label }}
          </a>
        </li>
      </ul>
    </nav>

    <section :id="chapters[0].id" class="rp__chapter rp__verdict" aria-labelledby="rp-verdict-title">
      <div class="rp__gauge">
        <RiskGauge :score="overall" />
      </div>
      <div class="rp__verdict-copy">
        <h2 id="rp-verdict-title" class="rp__headline" tabindex="-1">{{ verdict.headline }}</h2>
        <p class="rp__text">{{ verdict.body }}</p>
        <p class="rp__note">
          <span v-if="overallDelta !== null" class="rp__delta" :class="`rp__delta--${deltaTone(overallDelta)}`">
            {{ overallDelta === 0 ? 'No change' : formatDelta(overallDelta) }} vs {{ previousMonth?.label }}
          </span>
          <span v-if="overallDelta !== null" aria-hidden="true"> · </span>
          Based on {{ counts.scored }} of {{ counts.total }} indicators
        </p>
      </div>
    </section>

    <div
      :id="chapters[1].id"
      class="rp__pair"
      :style="{ '--rp-rows': String(pairRows), '--rp-rows-content': String(pairRows - 1) }"
    >
    <section
      v-for="story in stories"
      :id="story.id"
      :key="story.id"
      class="rp__chapter rp__card rp__cell"
      :aria-labelledby="`${story.id}-title`"
    >
      <h2 :id="`${story.id}-title`" class="rp__h2" tabindex="-1">{{ story.title }}</h2>
      <ul class="rp__rows">
        <li v-for="category in story.categories" :key="category.id">
          <RiskFactorRow
            :title="categoryLabel(category.name)"
            :meta="areaLabelForLayerName(category.layerName)"
            :score="category.score"
          >
            <p v-if="categorySignal(category.name, story.tone, report)" class="rp__text">
              {{ categorySignal(category.name, story.tone, report) }}
            </p>
            <!-- One signal per category keeps the paired columns level. -->
            <div v-if="evidenceFor(category.name, story.tone, 1, report).length" class="rp__evidence">
              <p class="rp__evidence-label">{{ story.evidenceLabel }}</p>
              <RiskIndicatorList
                compact
                :indicators="evidenceFor(category.name, story.tone, 1, report)"
                :label="`${story.evidenceLabel} in ${categoryLabel(category.name)}`"
              />
            </div>
          </RiskFactorRow>
        </li>
      </ul>
    </section>
    </div>

    <section :id="chapters[2].id" class="rp__chapter rp__card" aria-labelledby="rp-breakdown-title">
      <h2 id="rp-breakdown-title" class="rp__h2" tabindex="-1">{{ chapters[2].label }}</h2>
      <div class="rp__breakdown">
      <Accordion type="multiple">
        <AccordionItem v-for="area in areas" :key="area.id" :value="area.id">
          <AccordionTrigger>
            <RiskScoreHead
              :title="area.id === 'portfolio' ? 'Industry' : originalAreaLabel(area.name)"
              :score="area.score"
              :delta="areaDelta(area.id)"
              :delta-label="previousMonth?.label.split(' ')[0]"
            />
          </AccordionTrigger>
          <AccordionContent>
            <RiskAreaTable :area="area" :report="report" />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      </div>
    </section>

    <section :id="chapters[3].id" class="rp__chapter rp__card" aria-labelledby="rp-improve-title">
      <div class="rp__improve">
        <h2 id="rp-improve-title" class="rp__h2" tabindex="-1">{{ chapters[3].label }}</h2>
        <ol class="rp__steps">
          <li v-for="step in improvementSteps" :key="step.title" class="rp__step">
            <div class="rp__step-copy">
              <p class="rp__step-title">{{ step.title }}</p>
              <p class="rp__text">{{ step.why }}</p>
              <span class="rp__tag">{{ step.area }}</span>
            </div>
          </li>
        </ol>
        <div class="rp__contact">
          <div class="rp__contact-copy">
            <p class="rp__step-title">Need help improving your score?</p>
            <p class="rp__text">Our team can walk you through the steps that fit your business.</p>
          </div>
          <Button variant="outline" color="neutral" type="button" class="rp__contact-action" @click="contactUs">
            Contact us
          </Button>
        </div>
      </div>
    </section>

    <section class="rp__chapter rp__closing rp__card" aria-labelledby="rp-next-title">
      <h2 id="rp-next-title" class="rp__h2">Next step</h2>
      <p class="rp__text">
        Companies in the {{ band }} band may qualify for rates from {{ startingRate }}% per month.
      </p>
      <Button size="large" type="button" @click="openApply({ kind: 'product', productId: 'ar' })">
        Apply for financing
      </Button>
      <p class="rp__note">
        This score is not a credit decision or a financing offer. Financing through Credor is provided by
        OJK-licensed partners and is subject to their review.
      </p>
    </section>
    <span ref="endMarker" aria-hidden="true"></span>
  </div>
</template>

<style scoped>
.rp {
  display: flex;
  width: 100%;
  min-width: 0;
  max-width: 800px;
  flex-direction: column;
  margin-inline: auto;
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-body), sans-serif;
}

/* Header */
.rp__header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--primitives-padding-1);
  padding-bottom: var(--primitives-padding-4);
}

.rp__back {
  display: inline-flex;
  align-items: center;
  gap: var(--primitives-padding-1);
  margin-bottom: var(--primitives-padding-2);
  padding: var(--primitives-padding-1) 0;
  border: 0;
  border-radius: var(--primitives-border-radius-xs);
  background: none;
  color: var(--semantic-text-ach-color-text-secondary);
  cursor: pointer;
  font-family: inherit;
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-sm);
}

.rp__back:hover {
  color: var(--semantic-text-ach-color-text-default);
}

.rp__back-icon,
.rp__download-icon {
  width: var(--primitives-padding-4);
  height: var(--primitives-padding-4);
  flex: 0 0 var(--primitives-padding-4);
  background: currentcolor;
}

.rp__back-icon {
  mask: url('/icons/ui-actions/arrow-back.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/arrow-back.svg') center / contain no-repeat;
}

.rp__title-row {
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--primitives-padding-2) var(--primitives-padding-6);
}

.rp__title {
  margin: 0;
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-2xl);
  font-weight: 700;
  line-height: var(--primitives-line-heights-2xl);
}

.rp__subtitle {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.rp__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--primitives-padding-2);
}

/* A native select dressed as the grey outlined small button; the chevron ignores clicks. */
.rp__month {
  display: inline-flex;
  position: relative;
  align-items: center;
  color: var(--component-button-outlined-neutral-text);
}

/* A real image above the select (z-index), like the sidebar's chevron, so no browser can paint the control over it. */
.rp__month-chevron {
  position: absolute;
  z-index: 1;
  right: var(--component-button-size-small-padding-inline);
  width: var(--component-button-size-small-icon-size);
  height: var(--component-button-size-small-icon-size);
  pointer-events: none;
}

.rp__month-select {
  height: var(--component-button-size-small-height);
  padding-block: var(--component-button-size-small-padding-block);
  padding-inline: var(--component-button-size-small-padding-inline)
    calc(
      var(--component-button-size-small-padding-inline) + var(--component-button-size-small-icon-size) +
        var(--component-button-size-small-gap)
    );
  border: var(--primitives-border-width-default) solid var(--component-button-outlined-neutral-border);
  border-radius: var(--component-button-solid-radius);
  background: var(--component-button-outlined-neutral-bg);
  color: inherit;
  font: inherit;
  font-size: var(--component-button-size-small-font-size);
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  line-height: var(--component-button-size-small-line-height);
  cursor: pointer;
  appearance: none;
}

.rp__month-select:hover {
  background: var(--component-button-outlined-neutral-bg-hover);
}

.rp__month-select:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--component-input-border-focus);
  outline-offset: var(--primitives-border-width-2);
}

/* Month-on-month change: the sign carries the meaning, the colour only reinforces it. */
.rp__delta {
  font-weight: 600;
}

/* Neutral when up: the + sign carries it, and green would read as another band colour. */
.rp__delta--up {
  color: var(--semantic-text-ach-color-text-default);
}

.rp__delta--down {
  color: var(--semantic-text-error-ach-color-text-error);
}

.rp__download-icon {
  mask: url('/icons/ui-actions/download.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/download.svg') center / contain no-repeat;
}

.rp__back:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: var(--primitives-border-width-2);
}

/* The nav list and the accordion region clip overflow, so these rings sit inside the box. */
.rp__nav-link:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: calc(-1 * var(--primitives-border-width-2));
}

.rp__title:focus,
.rp__h2:focus,
.rp__headline:focus {
  outline: none;
}

/* Sticky chapter nav */
.rp__nav {
  position: sticky;
  z-index: 1;
  top: 0;
  border-bottom: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
  background: var(--semantic-bg-ach-color-bg-surface);
}

.rp__nav-list {
  position: relative;
  display: flex;
  gap: var(--primitives-padding-6);
  margin: 0;
  padding: 0;
  overflow-x: auto;
  list-style: none;
  scrollbar-width: none;
}

.rp__nav-link {
  display: block;
  padding: var(--primitives-padding-3) var(--primitives-padding-1) var(--primitives-padding-2);
  border-bottom: var(--primitives-border-width-2) solid transparent;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-sm);
  text-decoration: none;
  white-space: nowrap;
}

.rp__nav-link:hover,
.rp__nav-link[aria-current='location'] {
  color: var(--semantic-text-ach-color-text-default);
}

.rp__nav-link[aria-current='location'] {
  border-bottom-color: var(--semantic-text-ach-color-text-default);
}

/* Chapters: spacing and flow; chapters that render as cards add .rp__card. */
.rp__chapter {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-6);
  padding: var(--primitives-padding-10) 0;
  /* Keeps the heading clear of the sticky nav after an anchor jump. */
  scroll-margin-top: var(--primitives-padding-12);
}

/* The card chapters share one recipe, the same one the Credor cards use. */
.rp__card {
  box-sizing: border-box;
  border: var(--primitives-border-width-default) solid var(--component-card-border);
  border-radius: var(--primitives-border-radius-lg);
  background: var(--component-card-background);
  padding: var(--primitives-padding-6) var(--primitives-padding-8);
}

/* Cards sit 24px apart, the same gap as between the two highlight cards (never the cells inside the pair). */
.rp__chapter.rp__card:not(.rp__cell) {
  margin-top: var(--primitives-padding-6);
}

/*
 * Two chapters as cards. Both cells share the pair's row tracks (subgrid), so the category
 * rows line up: a row starts at the same y in both columns, however uneven the two stories are.
 */
.rp__pair {
  display: grid;
  /* Same clearance as a chapter when the nav jumps to a pair. */
  scroll-margin-top: var(--primitives-padding-12);
  grid-template-columns: repeat(2, minmax(0, 1fr));
  /* 1 heading track + 1 per category, set inline from the stories (--rp-rows vs --rp-rows-content). */
  grid-template-rows: repeat(var(--rp-rows, 4), minmax(0, auto));
  column-gap: var(--primitives-padding-6);
}

.rp__cell {
  display: grid;
  min-width: 0;
  container-type: inline-size;
  grid-row: span var(--rp-rows, 4);
  grid-template-rows: subgrid;
}

/* The list covers every category track; the heading takes the first one. */
.rp__cell > .rp__rows {
  display: grid;
  grid-row: span var(--rp-rows-content, 3);
  grid-template-rows: subgrid;
}


/* Section labels sit a step below the page title so the verdict headline is the one large line. */
.rp__h2 {
  margin: 0;
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-lg);
  font-weight: 600;
  line-height: var(--primitives-line-heights-lg);
}

.rp__headline {
  margin: 0;
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-xl);
  font-weight: 600;
  line-height: var(--primitives-line-heights-xl);
  text-wrap: balance;
}

.rp__text {
  max-width: 64ch;
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.rp__note {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  font-variant-numeric: tabular-nums;
  line-height: var(--primitives-line-heights-2xs);
}

/* 1 Verdict */
.rp__verdict {
  display: grid;
  grid-template-columns: minmax(0, 280px) minmax(0, 1fr);
  align-items: center;
  gap: var(--primitives-padding-8);
}

.rp__verdict-copy {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-3);
}

/* 2 to 4 factor rows */
.rp__rows {
  display: flex;
  margin: 0;
  padding: 0;
  flex-direction: column;
  list-style: none;
}

.rp__rows > li {
  padding: var(--primitives-padding-5) 0;
}

.rp__rows > li + li {
  border-top: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
}

.rp__rows > li:first-child {
  padding-top: 0;
}

.rp__evidence {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: var(--primitives-padding-2);
}

/* Same tokens as the page notes; the small visible label above the evidence table. */
.rp__evidence-label {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 500;
  line-height: var(--primitives-line-heights-2xs);
}

/* A container, so the area rows stack on a phone like the highlight rows do. */
.rp__breakdown {
  container-type: inline-size;
}

/* The hover pill reaches past the text on both sides, so the row text stays aligned with the card. */
.rp__breakdown :deep(.ach-accordion-trigger) {
  width: calc(100% + var(--primitives-padding-8));
  margin-inline: calc(var(--primitives-padding-4) * -1);
  padding-inline: var(--primitives-padding-4);
  border-radius: var(--primitives-border-radius-lg);
}

/* 5 How to improve */
/* The steps are what the owner can act on, so the card carries the whole section. */
.rp__improve {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-2);
}

.rp__contact {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-3) var(--primitives-padding-4);
  margin-top: var(--primitives-padding-5);
  padding-top: var(--primitives-padding-5);
  border-top: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
}

.rp__contact-copy {
  display: flex;
  min-width: 0;
  flex: 1 1 240px;
  flex-direction: column;
  gap: var(--primitives-padding-1);
}

.rp__contact-copy p {
  margin: 0;
}

.rp__contact-action:deep(.ach-button),
.rp__contact-action.ach-button {
  border-radius: var(--primitives-border-radius-infinite);
}

.rp__steps {
  display: flex;
  margin: 0;
  padding: 0;
  flex-direction: column;
  counter-reset: rp-step;
  list-style: none;
}

.rp__step {
  display: grid;
  grid-template-columns: var(--primitives-padding-8) minmax(0, 1fr);
  padding: var(--primitives-padding-4) 0;
  counter-increment: rp-step;
}

.rp__step + .rp__step {
  border-top: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
}

.rp__step::before {
  content: counter(rp-step);
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  line-height: var(--primitives-line-heights-sm);
}

.rp__step-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--primitives-padding-1);
}

.rp__step-title {
  margin: 0;
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-sm);
}

.rp__tag {
  margin-top: var(--primitives-padding-1);
  padding: 2px var(--primitives-padding-2);
  border-radius: var(--primitives-border-radius-sm);
  background: var(--semantic-bg-ach-color-bg-surface-secondary);
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 500;
  line-height: var(--primitives-line-heights-3xs);
}

/* Closing */
.rp__closing {
  align-items: flex-start;
  gap: var(--primitives-padding-4);
}

.rp__closing .rp__text {
  margin-bottom: var(--primitives-padding-2);
}

@container app-workspace (max-width: 720px) {
  .rp__pair {
    grid-template-columns: minmax(0, 1fr);
    /* Cards stack: killed row tracks and gap between the cards. */
    row-gap: var(--primitives-padding-6);
    grid-template-rows: none;
  }

  .rp__cell {
    display: block;
    grid-row: auto;
    grid-template-rows: none;
  }

  .rp__cell > .rp__rows {
    display: flex;
    flex-direction: column;
    grid-row: auto;
    grid-template-rows: none;
  }
}

@container app-workspace (max-width: 560px) {
  .rp__verdict {
    grid-template-columns: minmax(0, 1fr);
  }

  /* One step smaller on a phone so the headline holds two lines. */
  .rp__headline {
    font-size: var(--primitives-font-sizes-lg);
    line-height: var(--primitives-line-heights-lg);
  }

  .rp__gauge {
    width: 100%;
    max-width: 280px;
    margin-inline: auto;
  }
}
</style>
