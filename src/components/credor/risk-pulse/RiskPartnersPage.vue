<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { usePartnerAccess } from '@/composables/usePartnerAccess'
import { useSegmentedIndicator } from '@/composables/useSegmentedIndicator'
import { useSnackbar } from '@/composables/useSnackbar'
import { useAppView } from '@/composables/useAppView'
import RiskAccessGranted from './RiskAccessGranted.vue'
import RiskConsentRequests from './RiskConsentRequests.vue'
import RiskPartnerLookupDialog from './RiskPartnerLookupDialog.vue'
import RiskPartnerPortfolio from './RiskPartnerPortfolio.vue'
import RiskPartnerSummary from './RiskPartnerSummary.vue'

type Tab = 'portfolio' | 'requests' | 'granted'

const { openRiskPulse } = useAppView()
const { partners, received } = usePartnerAccess()
const { show } = useSnackbar()

// Badges count what needs the user's action; a tab with nothing to do shows none.
const tabs = computed(() => [
  {
    id: 'portfolio' as const,
    label: 'Portfolio',
    badge: partners.value.filter((partner) => partner.status === 'locked').length,
    badgeLabel: 'scores you can request',
  },
  {
    id: 'requests' as const,
    label: 'Received',
    badge: received.value.filter((item) => item.status === 'pending').length,
    badgeLabel: 'requests to answer',
  },
  {
    id: 'granted' as const,
    label: 'Access granted',
    badge: 0,
    badgeLabel: '',
  },
])

const tab = ref<Tab>('portfolio')
const tablist = ref<HTMLElement | null>(null)
const { indicatorStyle, ready } = useSegmentedIndicator(tablist, () => tab.value)

function selectTab(id: Tab, focus = false) {
  tab.value = id
  if (focus) document.getElementById(`pp-tab-${id}`)?.focus()
}

// Arrow keys move between tabs, as a tablist should.
function moveTab(step: number) {
  const ids = tabs.value.map((item) => item.id)
  selectTab(ids[(ids.indexOf(tab.value) + step + ids.length) % ids.length], true)
}

const portfolio = ref<InstanceType<typeof RiskPartnerPortfolio> | null>(null)
const lookupOpen = ref(false)
const lookupButton = ref<HTMLElement | null>(null)

function openLookup(event: MouseEvent) {
  lookupButton.value = event.currentTarget as HTMLElement
  lookupOpen.value = true
}

// The NPWP belongs to a partner already listed: say so and take the user to that row.
async function showPartner(id: string) {
  const partner = partners.value.find((item) => item.id === id)
  show({ variant: 'neutral', title: `${partner?.name} is already in your portfolio` })
  selectTab('portfolio')
  await nextTick()
  document.getElementById(`rp-portfolio-${id}`)?.focus()
}

// A registered company outside the portfolio: the usual request dialog explains and sends the request.
async function requestAdded(id: string) {
  selectTab('portfolio')
  await nextTick()
  portfolio.value?.openRequest(id)
}

async function answerRequests() {
  selectTab('requests')
  await nextTick()
  document.getElementById('pp-tab-requests')?.focus()
}
</script>

<template>
  <div class="pp">
    <header class="pp__header">
      <button type="button" class="pp__back" @click="openRiskPulse()">
        <span class="pp__back-icon" aria-hidden="true"></span>
        Back to Company Health
      </button>
      <div class="pp__title-row">
        <h1 class="pp__title">Partners</h1>
        <Button
          variant="outline"
          color="neutral"
          size="small"
          type="button"
          class="pp__lookup"
          @click="openLookup"
        >
          Request by NPWP
        </Button>
      </div>
    </header>

    <section aria-label="Overview">
      <RiskPartnerSummary :partners="partners" :received="received" @answer="answerRequests" />
    </section>

    <!-- No card: the tabs sit on the page and each list follows straight under them. -->
    <section class="pp__lists">
      <div class="pp__toolbar">
        <div ref="tablist" class="pp__tabs" role="tablist" aria-label="Partner lists">
          <span
            class="pp__indicator"
            :class="{ 'pp__indicator--animated': ready }"
            aria-hidden="true"
            :style="indicatorStyle"
          ></span>
          <button
            v-for="item in tabs"
            :id="`pp-tab-${item.id}`"
            :key="item.id"
            type="button"
            role="tab"
            class="pp__tab"
            :class="{ 'pp__tab--active': item.id === tab }"
            :aria-selected="item.id === tab"
            :aria-controls="item.id === tab ? 'pp-panel' : undefined"
            :tabindex="item.id === tab ? 0 : -1"
            @click="selectTab(item.id)"
            @keydown.left.prevent="moveTab(-1)"
            @keydown.right.prevent="moveTab(1)"
            @keydown.home.prevent="selectTab(tabs[0].id, true)"
            @keydown.end.prevent="selectTab(tabs[tabs.length - 1].id, true)"
          >
            {{ item.label }}
            <span v-if="item.badge > 0" class="pp__badge">
              {{ item.badge }}<span class="sr-only"> {{ item.badgeLabel }}</span>
            </span>
          </button>
        </div>
      </div>

      <div id="pp-panel" class="pp__panel" role="tabpanel" tabindex="0" :aria-labelledby="`pp-tab-${tab}`">
        <RiskPartnerPortfolio
          v-if="tab === 'portfolio'"
          ref="portfolio"
          :partners="partners"
          variant="table"
          id-prefix="rp-portfolio"
        />
        <RiskConsentRequests v-else-if="tab === 'requests'" />
        <RiskAccessGranted v-else return-focus-id="pp-tab-granted" />
      </div>
    </section>

    <RiskPartnerLookupDialog
      v-model:open="lookupOpen"
      :return-focus="lookupButton"
      @found="showPartner"
      @added="requestAdded"
    />
  </div>
</template>

<style scoped>
.pp {
  display: flex;
  width: 100%;
  min-width: 0;
  max-width: 1040px;
  flex-direction: column;
  gap: var(--primitives-padding-6);
  margin-inline: auto;
  /* Keeps focused rows clear of the sticky top bar. */
  --rp-bar-offset: calc(var(--component-topbar-height) + var(--primitives-padding-4));
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-body), sans-serif;
}

.pp__header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--primitives-padding-1);
}

.pp__back {
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

.pp__back:hover {
  color: var(--semantic-text-ach-color-text-default);
}

.pp__back:focus-visible,
.pp__tab:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: var(--primitives-border-width-2);
}

.pp__back-icon {
  width: var(--primitives-padding-4);
  height: var(--primitives-padding-4);
  background: currentcolor;
  mask: url('/icons/ui-actions/arrow-back.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/arrow-back.svg') center / contain no-repeat;
}

.pp__title-row {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-4);
}

.pp__title {
  margin: 0;
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-2xl);
  font-weight: 700;
  line-height: var(--primitives-line-heights-2xl);
}

.pp__title:focus {
  outline: none;
}

.pp__toolbar {
  display: flex;
  border-bottom: var(--primitives-border-width-default) solid var(--component-tabs-line-border);
}

/* Line tabs, the same recipe as the Company Health section nav. */
.pp__tabs {
  position: relative;
  display: flex;
  min-width: 0;
  max-width: 100%;
  gap: var(--primitives-padding-6);
  overflow-x: auto;
  scrollbar-width: none;
}

.pp__lookup {
  flex: none;
}

.pp__tab {
  display: inline-flex;
  align-items: center;
  gap: var(--primitives-padding-2);
  padding: var(--primitives-padding-3) var(--primitives-padding-1)
    calc(var(--primitives-padding-2) + var(--primitives-border-width-2));
  border: 0;
  background: none;
  color: var(--component-tabs-line-item-text-inactive);
  cursor: pointer;
  font-family: inherit;
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-sm);
  white-space: nowrap;
}

.pp__tab:hover,
.pp__tab--active {
  color: var(--component-tabs-line-item-text-active);
}

.pp__tab:focus-visible {
  outline-offset: calc(-1 * var(--primitives-border-width-2));
}

.pp__badge {
  min-width: 20px;
  padding: 0 var(--primitives-padding-1);
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--component-badge-brand-background);
  color: var(--component-badge-brand-text);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
  line-height: 20px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.pp__indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  height: var(--primitives-border-width-2);
  background: var(--component-tabs-line-item-indicator);
  pointer-events: none;
}

.pp__indicator--animated {
  transition:
    transform var(--component-tabs-indicator-duration) var(--component-tabs-indicator-easing),
    width var(--component-tabs-indicator-duration) var(--component-tabs-indicator-easing);
}

@media (prefers-reduced-motion: reduce) {
  .pp__indicator--animated {
    transition: none;
  }
}

.pp__lists {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--primitives-padding-2);
}

.pp__panel {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-4);
}

.pp__panel:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: var(--primitives-border-width-2);
}


.pp__lookup.ach-button--outlined.ach-button--color-neutral {
  /* The Credor secondary action, as on the homepage cards: a light border on a pill. */
  border-color: var(--component-card-border);
  border-radius: var(--primitives-border-radius-infinite);
}
</style>
