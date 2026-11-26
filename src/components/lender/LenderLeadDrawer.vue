<script setup lang="ts">
import { computed } from 'vue'
import type { StyleValue } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useAppView } from '@/composables/useAppView'
import { useSnackbar } from '@/composables/useSnackbar'
import { formatLenderDate, formatLenderDateTime, formatRupiah } from '@/lib/lender/lender-data'
import type { BusinessScale, LenderLead } from '@/lib/lender/types'
import { useLenderPortal } from '@/lib/lender/useLenderPortal'

const props = defineProps<{
  open: boolean
  lead: LenderLead | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  claimed: [id: string]
  viewDetail: [id: string]
}>()

const { openLenderLeadDetail } = useAppView()
const { claimLead } = useLenderPortal()
const { show: showSnackbar } = useSnackbar()

const drawerStyle: StyleValue = {
  width: 'min(100vw, var(--component-drawer-width))',
  maxWidth: 'var(--component-drawer-width)',
  gap: '0',
  padding: '0',
  borderLeftColor: 'var(--component-drawer-border)',
  background: 'var(--component-drawer-background)',
}

const isUnclaimed = computed(() => props.lead?.state === 'unclaimed')
const isClaimed = computed(() => props.lead?.state === 'claimed')
const isRejected = computed(() => props.lead?.state === 'rejected')

function scaleTone(scale: BusinessScale): 'info' | 'success' | 'warning' | 'neutral' {
  if (scale === 'Large') return 'info'
  if (scale === 'Medium') return 'success'
  if (scale === 'Small') return 'warning'
  return 'neutral'
}

function handleOpenChange(value: boolean) {
  emit('update:open', value)
}

function closeDrawer() {
  emit('update:open', false)
}

function handleViewDetail() {
  if (!props.lead) return
  const leadId = props.lead.id
  emit('viewDetail', leadId)
  openLenderLeadDetail(leadId)
}

function handleClaimLead() {
  if (!props.lead || props.lead.state !== 'unclaimed') return
  const updated = claimLead(props.lead.id)
  if (!updated) return

  showSnackbar({
    variant: 'success',
    title: 'Lead claimed. Borrower profile and supporting documents are now unlocked.',
  })
  emit('claimed', updated.id)
}
</script>

<template>
  <Sheet :open="open" @update:open="handleOpenChange">
    <SheetContent side="right" :show-close="false" :style="drawerStyle">
      <header class="lead-drawer__header">
        <SheetHeader class="lead-drawer__header-copy">
          <SheetTitle class="lead-drawer__title">Lead Detail</SheetTitle>
          <SheetDescription class="lead-drawer__subtitle">
            <template v-if="lead">
              <span class="lead-drawer__tabular">{{ lead.applicationNumber }}</span>
              <span aria-hidden="true"> · </span>
              <span>{{ lead.loanType }}</span>
            </template>
            <template v-else>Review prospective borrower and financing opportunity.</template>
          </SheetDescription>
        </SheetHeader>

        <button
          type="button"
          class="lead-drawer__close"
          aria-label="Close lead detail drawer"
          @click="closeDrawer"
        >
          <img src="/icons/ui-actions/close.svg" alt="" aria-hidden="true" />
        </button>
      </header>

      <div v-if="lead" class="lead-drawer__body">
        <section
          v-if="isUnclaimed"
          class="lead-drawer__callout lead-drawer__callout--info"
          aria-labelledby="drawer-claim-prompt-title"
        >
          <span class="lead-drawer__callout-icon lead-drawer__callout-icon--info" aria-hidden="true"></span>
          <div class="lead-drawer__callout-copy">
            <h2 id="drawer-claim-prompt-title" class="lead-drawer__callout-title">Claim this lead?</h2>
            <p class="lead-drawer__callout-text">
              Claiming this lead unlocks the borrower's full company profile, NPWP, PIC contact details, financial metrics, and supporting documents.
            </p>
          </div>
        </section>

        <section
          v-else-if="isClaimed"
          class="lead-drawer__callout lead-drawer__callout--success"
          aria-labelledby="drawer-claimed-title"
        >
          <span class="lead-drawer__callout-icon lead-drawer__callout-icon--success" aria-hidden="true"></span>
          <div class="lead-drawer__callout-copy">
            <h2 id="drawer-claimed-title" class="lead-drawer__callout-title">Lead claimed</h2>
            <p class="lead-drawer__callout-text">
              Borrower profile and supporting documents are unlocked.
              <template v-if="lead.claimedAt">
                Claimed on <span class="lead-drawer__tabular">{{ formatLenderDateTime(lead.claimedAt) }}</span>.
              </template>
            </p>
          </div>
        </section>

        <section
          v-else-if="isRejected"
          class="lead-drawer__callout lead-drawer__callout--error"
          aria-labelledby="drawer-rejected-title"
        >
          <span class="lead-drawer__callout-icon lead-drawer__callout-icon--error" aria-hidden="true"></span>
          <div class="lead-drawer__callout-copy">
            <h2 id="drawer-rejected-title" class="lead-drawer__callout-title">Application rejected</h2>
            <p class="lead-drawer__callout-text">
              {{ lead.rejectionReason || 'Declined after underwriting review.' }}
            </p>
            <p v-if="lead.rejectedAt || lead.leadScore !== undefined" class="lead-drawer__callout-meta lead-drawer__tabular">
              <template v-if="lead.rejectedAt">
                Rejected on {{ formatLenderDate(lead.rejectedAt) }}
              </template>
              <template v-if="lead.rejectedAt && lead.leadScore !== undefined"> · </template>
              <template v-if="lead.leadScore !== undefined">
                Lead score: {{ lead.leadScore }}
              </template>
            </p>
          </div>
        </section>

        <section class="lead-drawer__section" aria-labelledby="drawer-overview-title">
          <div class="lead-drawer__section-head">
            <h2 id="drawer-overview-title" class="lead-drawer__section-title">Financing Request</h2>
            <span v-if="lead.badge" class="lead-drawer__chip" :data-tone="lead.badge === 'New' ? 'info' : 'warning'">
              {{ lead.badge }}
            </span>
          </div>

          <dl class="lead-drawer__facts">
            <div class="lead-drawer__fact">
              <dt>Submission date</dt>
              <dd class="lead-drawer__tabular">
                {{ lead.submittedDisplayDate }}, {{ lead.submittedDisplayTime }}
              </dd>
            </div>

            <div class="lead-drawer__fact">
              <dt>Loan Type</dt>
              <dd>
                <span class="lead-drawer__value-strong">{{ lead.loanType }}</span>
                <span class="lead-drawer__value-sub">{{ lead.subType }}</span>
              </dd>
            </div>

            <div class="lead-drawer__fact">
              <dt>Estimated Loan</dt>
              <dd class="lead-drawer__amount lead-drawer__tabular">
                {{ formatRupiah(lead.estimatedLoanAmount) }}
              </dd>
            </div>

            <div class="lead-drawer__fact">
              <dt>Counterparty</dt>
              <dd>{{ lead.collateral.counterpartyName }}</dd>
            </div>

            <div class="lead-drawer__fact">
              <dt>Commercial Invoice No.</dt>
              <dd class="lead-drawer__tabular">{{ lead.collateral.invoiceNumber }}</dd>
            </div>

            <div class="lead-drawer__fact">
              <dt>Business Scale</dt>
              <dd>
                <span class="lead-drawer__chip" :data-tone="scaleTone(lead.businessScale)">
                  {{ lead.businessScale }}
                </span>
              </dd>
            </div>
          </dl>
        </section>

        <section class="lead-drawer__section" aria-labelledby="drawer-borrower-title">
          <div class="lead-drawer__section-head">
            <h2 id="drawer-borrower-title" class="lead-drawer__section-title">Borrower Summary</h2>
            <span class="lead-drawer__lock-pill" :data-locked="isUnclaimed ? 'true' : 'false'">
              <img
                :src="isUnclaimed ? '/icons/common-actions/lock.svg' : '/icons/common-actions/lock-open.svg'"
                alt=""
                aria-hidden="true"
                class="lead-drawer__lock-icon"
              />
              <span>{{ isUnclaimed ? 'Claim to unlock' : 'Unlocked' }}</span>
            </span>
          </div>

          <dl class="lead-drawer__list">
            <div class="lead-drawer__row">
              <dt>Company Name</dt>
              <dd>
                <template v-if="isUnclaimed">
                  <span class="lead-drawer__masked">
                    <img
                      src="/icons/common-actions/lock.svg"
                      alt=""
                      aria-hidden="true"
                      class="lead-drawer__inline-icon"
                    />
                    <span>{{ lead.maskedCompanyName }}</span>
                  </span>
                  <span class="lead-drawer__value-sub">Claim to reveal full company identity</span>
                </template>
                <template v-else>
                  <span class="lead-drawer__value-strong">{{ lead.companyName }}</span>
                  <span class="lead-drawer__value-sub">{{ lead.location }}, {{ lead.country }}</span>
                </template>
              </dd>
            </div>

            <div class="lead-drawer__row">
              <dt>Industry</dt>
              <dd>{{ lead.industry }}</dd>
            </div>

            <div class="lead-drawer__row">
              <dt>Company NPWP</dt>
              <dd>
                <span v-if="isUnclaimed" class="lead-drawer__locked-text">
                  <img
                    src="/icons/common-actions/lock.svg"
                    alt=""
                    aria-hidden="true"
                    class="lead-drawer__inline-icon"
                  />
                  <span>Hidden until claimed</span>
                </span>
                <span v-else class="lead-drawer__tabular">{{ lead.npwp }}</span>
              </dd>
            </div>

            <div class="lead-drawer__row">
              <dt>PIC Name</dt>
              <dd>
                <span v-if="isUnclaimed" class="lead-drawer__locked-text">
                  <img
                    src="/icons/common-actions/lock.svg"
                    alt=""
                    aria-hidden="true"
                    class="lead-drawer__inline-icon"
                  />
                  <span>Hidden until claimed</span>
                </span>
                <template v-else>
                  <span class="lead-drawer__value-strong">{{ lead.picName }}</span>
                  <span class="lead-drawer__value-sub lead-drawer__tabular">
                    {{ lead.phone }} · {{ lead.email }}
                  </span>
                </template>
              </dd>
            </div>

            <div class="lead-drawer__row">
              <dt>Annual Revenue</dt>
              <dd>
                <span v-if="isUnclaimed" class="lead-drawer__locked-text">
                  <img
                    src="/icons/common-actions/lock.svg"
                    alt=""
                    aria-hidden="true"
                    class="lead-drawer__inline-icon"
                  />
                  <span>Hidden until claimed</span>
                </span>
                <span v-else class="lead-drawer__tabular lead-drawer__value-strong">
                  {{ formatRupiah(lead.annualRevenue) }}
                </span>
              </dd>
            </div>

            <div class="lead-drawer__row">
              <dt>Gross Profit</dt>
              <dd>
                <span v-if="isUnclaimed" class="lead-drawer__locked-text">
                  <img
                    src="/icons/common-actions/lock.svg"
                    alt=""
                    aria-hidden="true"
                    class="lead-drawer__inline-icon"
                  />
                  <span>Hidden until claimed</span>
                </span>
                <span v-else class="lead-drawer__tabular lead-drawer__value-strong">
                  {{ formatRupiah(lead.grossProfit) }}
                </span>
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <footer v-if="lead" class="lead-drawer__footer">
        <Button
          variant="outline"
          color="neutral"
          size="default"
          type="button"
          class="lead-drawer__action"
          @click="handleViewDetail"
        >
          View Detail
        </Button>

        <Button
          v-if="isUnclaimed"
          variant="default"
          color="primary"
          size="default"
          type="button"
          class="lead-drawer__action"
          @click="handleClaimLead"
        >
          Claim lead
        </Button>
      </footer>
    </SheetContent>
  </Sheet>
</template>

<style scoped>
.lead-drawer__header {
  display: flex;
  box-sizing: border-box;
  min-height: var(--component-drawer-header-height);
  flex: 0 0 auto;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-4) var(--primitives-padding-6);
  border-bottom: var(--primitives-border-width-default) solid var(--component-drawer-border);
  background: var(--component-drawer-background);
}

.lead-drawer__header-copy {
  min-width: 0;
  flex: 1 1 auto;
  padding: 0;
  gap: var(--primitives-padding-1);
}

.lead-drawer__title {
  margin: 0;
  color: var(--component-drawer-title-text);
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-xl);
  font-weight: 700;
  line-height: var(--primitives-line-heights-xl);
}

.lead-drawer__subtitle {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-family: var(--primitives-font-families-body), sans-serif;
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
}

.lead-drawer__close {
  display: grid;
  width: var(--primitives-padding-8);
  height: var(--primitives-padding-8);
  flex: 0 0 auto;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: var(--primitives-border-radius-xs);
  background: none;
  color: var(--component-drawer-icon);
  cursor: pointer;
}

.lead-drawer__close img {
  display: block;
  width: var(--primitives-padding-5);
  height: var(--primitives-padding-5);
}

.lead-drawer__close:hover {
  background: var(--semantic-bg-ach-color-bg-surface-hover);
}

.lead-drawer__close:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: var(--primitives-border-width-2);
}

.lead-drawer__body {
  display: flex;
  box-sizing: border-box;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: var(--primitives-padding-6);
  padding: var(--primitives-padding-6);
  overflow-y: auto;
  background: var(--component-drawer-background);
}

.lead-drawer__callout {
  display: flex;
  align-items: flex-start;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-4);
  border: var(--primitives-border-width-default) solid transparent;
  border-radius: var(--primitives-border-radius-md);
}

.lead-drawer__callout--info {
  border-color: var(--component-alert-info-border);
  background: var(--component-alert-info-background);
}

.lead-drawer__callout--success {
  border-color: var(--component-alert-success-border);
  background: var(--component-alert-success-background);
}

.lead-drawer__callout--error {
  border-color: var(--component-alert-error-border);
  background: var(--component-alert-error-background);
}

.lead-drawer__callout-icon {
  width: var(--primitives-padding-5);
  height: var(--primitives-padding-5);
  flex: 0 0 auto;
  margin-top: 2px;
  background: currentColor;
}

.lead-drawer__callout-icon--info {
  color: var(--component-alert-info-icon);
  mask: url('/icons/common-actions/info.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/common-actions/info.svg') center / contain no-repeat;
}

.lead-drawer__callout-icon--success {
  color: var(--component-alert-success-icon);
  mask: url('/icons/ui-actions/check-circle.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/check-circle.svg') center / contain no-repeat;
}

.lead-drawer__callout-icon--error {
  color: var(--component-alert-error-icon);
  mask: url('/icons/common-actions/error.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/common-actions/error.svg') center / contain no-repeat;
}

.lead-drawer__callout-copy {
  display: flex;
  min-width: 0;
  flex: 1 1 auto;
  flex-direction: column;
  gap: var(--primitives-padding-1);
}

.lead-drawer__callout-title {
  margin: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 600;
  line-height: var(--primitives-line-heights-sm);
}

.lead-drawer__callout-text,
.lead-drawer__callout-meta {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
}

.lead-drawer__section {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-4);
  border: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
  border-radius: var(--primitives-border-radius-md);
  background: var(--semantic-bg-ach-color-bg-canvas);
}

.lead-drawer__section-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-2);
}

.lead-drawer__section-title {
  margin: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-md);
  font-weight: 600;
  line-height: var(--primitives-line-heights-md);
}

.lead-drawer__facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--primitives-padding-4);
  margin: 0;
}

.lead-drawer__fact {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--primitives-padding-1);
}

.lead-drawer__fact dt,
.lead-drawer__row dt {
  color: var(--semantic-text-ach-color-text-subtle);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 500;
  line-height: var(--primitives-line-heights-xs);
}

.lead-drawer__fact dd,
.lead-drawer__row dd {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
  margin: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
  overflow-wrap: anywhere;
}

.lead-drawer__list {
  display: flex;
  flex-direction: column;
  margin: 0;
}

.lead-drawer__row {
  display: grid;
  grid-template-columns: minmax(120px, 148px) minmax(0, 1fr);
  align-items: start;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-3) 0;
  border-bottom: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
}

.lead-drawer__row:first-child {
  padding-top: 0;
}

.lead-drawer__row:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.lead-drawer__value-strong {
  color: var(--semantic-text-ach-color-text-default);
  font-weight: 600;
}

.lead-drawer__value-sub {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
}

.lead-drawer__amount {
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-md);
  font-weight: 700;
  line-height: var(--primitives-line-heights-md);
}

.lead-drawer__masked,
.lead-drawer__locked-text {
  display: inline-flex;
  align-items: center;
  gap: var(--primitives-padding-1);
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
}

.lead-drawer__masked {
  color: var(--semantic-text-ach-color-text-default);
  font-weight: 600;
}

.lead-drawer__inline-icon,
.lead-drawer__lock-icon {
  width: var(--primitives-font-sizes-sm);
  height: var(--primitives-font-sizes-sm);
  flex: 0 0 auto;
  opacity: 0.72;
}

.lead-drawer__lock-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--primitives-padding-1);
  padding: 2px var(--primitives-padding-2);
  border: var(--primitives-border-width-default) solid var(--component-badge-neutral-border);
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--component-badge-neutral-background);
  color: var(--component-badge-neutral-text);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 500;
  line-height: var(--primitives-line-heights-xs);
}

.lead-drawer__lock-pill[data-locked='false'] {
  border-color: var(--component-badge-success-border);
  background: var(--component-badge-success-background);
  color: var(--component-badge-success-text);
}

.lead-drawer__chip {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  padding: 2px var(--primitives-padding-2);
  border-radius: var(--primitives-border-radius-infinite);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
  line-height: var(--primitives-line-heights-xs);
  white-space: nowrap;
}

.lead-drawer__chip[data-tone='info'] {
  background: var(--component-badge-info-background);
  color: var(--component-badge-info-text);
}

.lead-drawer__chip[data-tone='success'] {
  background: var(--component-badge-success-background);
  color: var(--component-badge-success-text);
}

.lead-drawer__chip[data-tone='warning'] {
  background: var(--component-badge-warning-background);
  color: var(--component-badge-warning-text);
}

.lead-drawer__chip[data-tone='neutral'] {
  background: var(--component-badge-neutral-background);
  color: var(--component-badge-neutral-text);
}

.lead-drawer__tabular {
  font-variant-numeric: tabular-nums;
}

.lead-drawer__footer {
  display: flex;
  box-sizing: border-box;
  flex: 0 0 auto;
  align-items: center;
  justify-content: flex-end;
  gap: var(--primitives-padding-2);
  padding: var(--primitives-padding-4) var(--primitives-padding-6);
  border-top: var(--primitives-border-width-default) solid var(--component-drawer-border);
  background: var(--component-drawer-background);
}

.lead-drawer__action:deep(.ach-button) {
  border-radius: var(--primitives-border-radius-infinite);
}

@media (max-width: 560px) {
  .lead-drawer__facts {
    grid-template-columns: minmax(0, 1fr);
  }

  .lead-drawer__row {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--primitives-padding-1);
  }
}
</style>
