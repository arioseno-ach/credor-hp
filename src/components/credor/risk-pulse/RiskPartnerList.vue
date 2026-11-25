<script setup lang="ts">
import { computed } from 'vue'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import RiskBandChip from './RiskBandChip.vue'
import RiskBlurredScore from './RiskBlurredScore.vue'
import RiskIconAction from './RiskIconAction.vue'
import { canConsent, type PartnerScore } from './partner-access'

const props = withDefaults(
  defineProps<{
    partners: PartnerScore[]
    /** Rows shown; the Risk Pulse chapter previews a few and links to the Partners page. */
    limit?: number
    /** Row id prefix, unique per list so focus can find the right row when two lists share a page. */
    idPrefix?: string
  }>(),
  { limit: undefined, idPrefix: 'rp-partner' },
)

const emits = defineEmits<{
  request: [id: string]
  /** Opens the consent page the partner gets by email. */
  open: [id: string]
}>()

const visible = computed(() => (props.limit ? props.partners.slice(0, props.limit) : props.partners))
</script>

<template>
  <ul class="partners">
    <li
      v-for="partner in visible"
      :id="`${idPrefix}-${partner.id}`"
      :key="partner.id"
      class="partner"
      :data-state="partner.status"
      tabindex="-1"
    >
      <Avatar :initials="partner.initials" />
      <div class="partner__who">
        <p class="partner__name">{{ partner.name }}</p>
        <!-- One detail per side; the NPWP and dates live on the Partners page. -->
        <p class="partner__meta">{{ partner.lastTransaction ? `Last transaction ${partner.lastTransaction}` : 'No transactions yet' }}</p>
      </div>

      <div class="partner__score">
        <template v-if="partner.status === 'unlocked'">
          <p class="partner__value">
            <span class="sr-only">Business risk score</span>
            <span class="partner__number">{{ partner.score.toFixed(1) }}</span>
            <RiskBandChip :score="partner.score" />
          </p>
          <p class="partner__note">Shared until {{ partner.accessUntil }}</p>
        </template>

        <template v-else-if="partner.status === 'pending'">
          <p class="partner__status">
            <img src="/icons/common-actions/pending.svg" alt="" aria-hidden="true" class="partner__icon">
            Request sent {{ partner.requestedOn }}
          </p>
          <p v-if="!canConsent(partner)" class="partner__note">Account not set up yet</p>
          <RiskIconAction
            icon="/icons/ui-actions/open-in-new.svg"
            label="Open consent page"
            :aria-label="`Open consent page sent to ${partner.name}`"
            @click="emits('open', partner.id)"
          />
        </template>

        <template v-else>
          <p class="partner__status">
            <RiskBlurredScore v-if="partner.onAchilles" :seed="partner.id" />
            <span class="partner__note">{{ partner.status === 'declined' ? 'Request declined' : partner.onAchilles ? 'Not shared yet' : 'Not on Achilles' }}</span>
          </p>
          <Button
            class="partner__action"
            variant="outline"
            color="neutral"
            size="small"
            type="button"
            :aria-label="`${partner.status === 'declined' ? 'Request again' : 'Request score'} from ${partner.name}`"
            @click="emits('request', partner.id)"
          >
            {{ partner.status === 'declined' ? 'Request again' : 'Request score' }}
          </Button>
        </template>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.partners {
  margin: 0;
  padding: 0;
  list-style: none;
}

/* One row anatomy for every state: who on the left, the score area on the right. */
.partner {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--primitives-padding-4);
  padding: var(--primitives-padding-5) 0;
  scroll-margin-top: var(--rp-bar-offset);
}

.partner + .partner {
  border-top: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
}

.partner:first-child {
  padding-top: 0;
}

.partner:focus {
  outline: none;
}

.partner__who {
  min-width: 0;
}

.partner__name {
  margin: 0;
  overflow: hidden;
  font-size: var(--primitives-font-sizes-md);
  font-weight: 600;
  line-height: var(--primitives-line-heights-md);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.partner__meta,
.partner__note {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
  font-variant-numeric: tabular-nums;
}

.partner__score {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--primitives-padding-1);
  text-align: right;
}

.partner__value,
.partner__status {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-2);
  margin: 0;
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.partner__number {
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-lg);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.partner__icon {
  width: 16px;
  height: 16px;
}

/* The score area settles in when a row changes state. */
.partner[data-state='unlocked'] .partner__score,
.partner[data-state='pending'] .partner__score {
  animation: partner-settle var(--semantic-motion-duration-base) var(--semantic-motion-easing-emphasized);
}

@keyframes partner-settle {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .partner[data-state] .partner__score {
    animation: none;
  }
}

@container app-workspace (max-width: 560px) {
  .partner {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .partner__score {
    grid-column: 2;
    align-items: flex-start;
    text-align: left;
  }
}

.partner__action.ach-button--outlined.ach-button--color-neutral {
  /* The Credor secondary action, as on the homepage cards: a light border on a pill. */
  border-color: var(--component-card-border);
  border-radius: var(--primitives-border-radius-infinite);
}
</style>
