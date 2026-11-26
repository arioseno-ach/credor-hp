<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useSnackbar } from '@/composables/useSnackbar'
import type { WebhookEventDomain } from '@/lib/lender/types'
import { useLenderPortal } from '@/lib/lender/useLenderPortal'
import LenderPageHeader from './LenderPageHeader.vue'

const { webhookEvents } = useLenderPortal()
const snackbar = useSnackbar()

const domainToneMap: Record<WebhookEventDomain, 'info' | 'brand' | 'success' | 'warning' | 'neutral'> = {
  'Application Lifecycle': 'info',
  'Offer & Contract': 'brand',
  Disbursement: 'success',
  'Collateral & Repayment': 'warning',
  'Collateral Invoice & e-Faktur': 'neutral',
}

function handleDownloadDocumentation() {
  snackbar.show({
    variant: 'success',
    title: 'Documentation download',
    description: 'Credor Lender Webhook API documentation (v1.4) downloaded.',
  })
}

function handleManageWebhook() {
  snackbar.show({
    variant: 'neutral',
    title: 'Global Settings',
    description: 'Opening Achilles Global Webhook Settings.',
  })
}
</script>

<template>
  <section class="lender-settings" aria-label="Settings">
    <LenderPageHeader
      title="Settings"
      subtitle="Manage your account information and configure portal integrations."
    />

    <div class="lender-settings__tabs" role="tablist" aria-label="Settings sections">
      <button
        type="button"
        role="tab"
        aria-selected="true"
        class="lender-settings__tab lender-settings__tab--active"
      >
        Integrations
      </button>
    </div>

    <article class="lender-settings__webhook-card" aria-label="Webhook configuration">
      <div class="lender-settings__webhook-main">
        <div class="lender-settings__webhook-icon-wrap" aria-hidden="true">
          <span class="lender-settings__webhook-icon"></span>
        </div>

        <div class="lender-settings__webhook-copy">
          <h2 class="lender-settings__webhook-title">Webhook</h2>
          <p class="lender-settings__webhook-subtitle">
            Receive real-time event notifications on your server.
          </p>
        </div>
      </div>

      <div class="lender-settings__webhook-actions">
        <Button
          type="button"
          variant="outline"
          color="neutral"
          size="small"
          @click="handleDownloadDocumentation"
        >
          <template #leadingIcon>
            <img src="/icons/ui-actions/download.svg" alt="" aria-hidden="true" />
          </template>
          Download Documentation
        </Button>

        <Button
          type="button"
          variant="default"
          color="primary"
          size="small"
          @click="handleManageWebhook"
        >
          Manage Webhook
          <template #trailingIcon>
            <span class="lender-settings__manage-icon" aria-hidden="true"></span>
          </template>
        </Button>
      </div>
    </article>

    <section class="lender-settings__catalog" aria-label="Webhook event catalog">
      <div class="lender-settings__catalog-header">
        <div>
          <h2 class="lender-settings__catalog-title">Webhook Event Catalog</h2>
          <p class="lender-settings__catalog-subtitle">
            Supported real-time event payloads emitted across the financing lifecycle.
          </p>
        </div>

        <span class="lender-settings__event-count">
          {{ webhookEvents.length }} events
        </span>
      </div>

      <div class="lender-settings__table-wrap">
        <table class="lender-settings__table">
          <thead>
            <tr>
              <th scope="col">Event Name</th>
              <th scope="col">Domain</th>
              <th scope="col">Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in webhookEvents" :key="item.event">
              <td>
                <code class="lender-settings__event-code">{{ item.event }}</code>
              </td>
              <td>
                <span
                  class="lender-settings__domain-badge"
                  :data-tone="domainToneMap[item.domain]"
                >
                  {{ item.domain }}
                </span>
              </td>
              <td class="lender-settings__purpose">
                {{ item.purpose }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </section>
</template>

<style scoped>
.lender-settings {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-6);
  min-width: 0;
}

.lender-settings__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--primitives-padding-6);
  border-bottom: var(--primitives-border-width-default) solid var(--component-tabs-line-border);
}

.lender-settings__tab {
  position: relative;
  padding: var(--primitives-padding-2) 0 var(--primitives-padding-3);
  border: 0;
  background: transparent;
  color: var(--component-tabs-line-item-text-inactive);
  font-family: var(--primitives-font-families-body), sans-serif;
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 600;
  line-height: var(--primitives-line-heights-sm);
  cursor: pointer;
}

.lender-settings__tab--active {
  color: var(--component-tabs-line-item-text-active);
}

.lender-settings__tab--active::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: var(--primitives-border-width-2);
  background: var(--component-tabs-line-item-indicator);
}

.lender-settings__tab:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-brand-ach-color-brand-default);
  outline-offset: var(--primitives-border-width-2);
  border-radius: var(--primitives-border-radius-xs);
}

.lender-settings__webhook-card {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-4);
  padding: var(--primitives-padding-5);
  border: var(--primitives-border-width-default) solid var(--component-card-border);
  border-radius: var(--primitives-border-radius-md);
  background: var(--component-card-background);
}

.lender-settings__webhook-main {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-4);
  min-width: 0;
}

.lender-settings__webhook-icon-wrap {
  display: grid;
  width: var(--primitives-padding-12);
  height: var(--primitives-padding-12);
  flex: 0 0 var(--primitives-padding-12);
  place-items: center;
  border-radius: var(--primitives-border-radius-md);
  background: var(--semantic-bg-info-ach-color-bg-info-surface);
  color: var(--semantic-icon-info-ach-color-icon-info);
}

.lender-settings__webhook-icon {
  width: var(--primitives-padding-6);
  height: var(--primitives-padding-6);
  background: currentColor;
  mask: url('/icons/brand/webhook.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/brand/webhook.svg') center / contain no-repeat;
}

.lender-settings__webhook-copy {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-1);
  min-width: 0;
}

.lender-settings__webhook-title {
  margin: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-md);
  font-weight: 700;
  line-height: var(--primitives-line-heights-md);
}

.lender-settings__webhook-subtitle {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.lender-settings__webhook-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--primitives-padding-3);
}

.lender-settings__manage-icon {
  display: block;
  width: var(--component-button-size-small-icon-size);
  height: var(--component-button-size-small-icon-size);
  background: currentColor;
  mask: url('/icons/ui-actions/open-in-new.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/open-in-new.svg') center / contain no-repeat;
}

.lender-settings__catalog {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-4);
  min-width: 0;
  padding: var(--primitives-padding-5);
  border: var(--primitives-border-width-default) solid var(--component-card-border);
  border-radius: var(--primitives-border-radius-md);
  background: var(--component-card-background);
}

.lender-settings__catalog-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--primitives-padding-3);
}

.lender-settings__catalog-title {
  margin: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-md);
  font-weight: 600;
  line-height: var(--primitives-line-heights-md);
}

.lender-settings__catalog-subtitle {
  margin: var(--primitives-padding-1) 0 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
}

.lender-settings__event-count {
  display: inline-flex;
  align-items: center;
  padding: var(--primitives-padding-1) var(--primitives-padding-3);
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--component-badge-neutral-background);
  border: var(--primitives-border-width-default) solid var(--component-badge-neutral-border);
  color: var(--component-badge-neutral-text);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
  line-height: var(--primitives-line-heights-xs);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.lender-settings__table-wrap {
  overflow-x: auto;
  min-width: 0;
}

.lender-settings__table {
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
  color: var(--component-table-row-text);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.lender-settings__table thead th {
  padding: var(--primitives-padding-2) var(--primitives-padding-3) var(--primitives-padding-3);
  border-bottom: var(--primitives-border-width-default) solid var(--component-table-cell-divider);
  background: transparent;
  color: var(--component-table-header-text);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
  line-height: var(--primitives-line-heights-xs);
  text-align: left;
  white-space: nowrap;
}

.lender-settings__table thead th:first-child,
.lender-settings__table tbody td:first-child {
  padding-left: 0;
}

.lender-settings__table thead th:last-child,
.lender-settings__table tbody td:last-child {
  padding-right: 0;
}

.lender-settings__table tbody td {
  padding: var(--primitives-padding-3);
  border-bottom: var(--primitives-border-width-default) solid var(--component-table-cell-divider);
  vertical-align: top;
}

.lender-settings__table tbody tr:hover {
  background: var(--semantic-bg-ach-color-bg-canvas);
}

.lender-settings__event-code {
  display: inline-block;
  padding: var(--primitives-padding-1) var(--primitives-padding-2);
  border: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
  border-radius: var(--primitives-border-radius-xs);
  background: var(--semantic-bg-ach-color-bg-surface-secondary);
  color: var(--semantic-text-ach-color-text-default);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
  line-height: var(--primitives-line-heights-xs);
  white-space: nowrap;
}

.lender-settings__domain-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px var(--primitives-padding-2);
  border: var(--primitives-border-width-default) solid transparent;
  border-radius: var(--primitives-border-radius-infinite);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
  line-height: var(--primitives-line-heights-xs);
  white-space: nowrap;
}

.lender-settings__domain-badge[data-tone='info'] {
  background: var(--component-badge-info-background);
  border-color: var(--component-badge-info-border);
  color: var(--component-badge-info-text);
}

.lender-settings__domain-badge[data-tone='brand'] {
  background: var(--semantic-brand-ach-color-brand-subtle);
  border-color: var(--semantic-border-info-ach-color-border-info);
  color: var(--semantic-brand-ach-color-brand-strong);
}

.lender-settings__domain-badge[data-tone='success'] {
  background: var(--component-badge-success-background);
  border-color: var(--component-badge-success-border);
  color: var(--component-badge-success-text);
}

.lender-settings__domain-badge[data-tone='warning'] {
  background: var(--component-badge-warning-background);
  border-color: var(--component-badge-warning-border);
  color: var(--component-badge-warning-text);
}

.lender-settings__domain-badge[data-tone='neutral'] {
  background: var(--component-badge-neutral-background);
  border-color: var(--component-badge-neutral-border);
  color: var(--component-badge-neutral-text);
}

.lender-settings__purpose {
  color: var(--semantic-text-ach-color-text-secondary);
  line-height: var(--primitives-line-heights-sm);
}
</style>
