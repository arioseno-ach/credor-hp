<script setup lang="ts">
import { ref } from 'vue'
import type { BcaBankFeed, LoanApplication } from '@/lib/prototype/types'

defineProps<{
  applications: LoanApplication[]
  feed: BcaBankFeed | null
}>()

const expandedApplicationId = ref<string | null>(null)
const feedExpanded = ref(false)

function toggleApplication(id: string): void {
  expandedApplicationId.value = expandedApplicationId.value === id ? null : id
}
</script>

<template>
  <section class="applications-card" aria-labelledby="recent-applications-title">
    <header class="applications-card__header">
      <h2 id="recent-applications-title">Recent applications</h2>
      <button type="button" class="applications-card__link">See All History</button>
    </header>

    <div v-if="!feed" class="applications-card__empty">
      <img
        class="applications-card__icon"
        src="/icons/common-actions/wysiwyg.svg"
        alt=""
        aria-hidden="true"
      />
      <div class="applications-card__empty-text">
        <p class="applications-card__empty-title">No Application yet</p>
        <p class="applications-card__empty-description">
          Your submitted application will go here
        </p>
      </div>
    </div>

    <template v-else>
      <div class="applications-card__feed" :class="{ 'is-expanded': feedExpanded }">
        <button
          type="button"
          class="applications-card__feed-header"
          :aria-expanded="feedExpanded"
          @click="feedExpanded = !feedExpanded"
        >
          <span class="applications-card__feed-icon">
            <img src="/icons/common-actions/today.svg" alt="" aria-hidden="true" />
          </span>
          <span class="applications-card__feed-copy">
            <span class="applications-card__feed-title">
              {{ feed.title }}
              <img
                class="applications-card__chevron"
                :src="
                  feedExpanded
                    ? '/icons/ui-actions/expand-less.svg'
                    : '/icons/ui-actions/expand-more.svg'
                "
                alt=""
                aria-hidden="true"
              />
            </span>
            <span class="applications-card__feed-subtitle">{{ feed.subtitle }}</span>
          </span>
          <span class="applications-card__feed-badge">{{ feed.badge }}</span>
        </button>

        <span class="applications-card__feed-action applications-card__feed-action--hover">
          Open Settings
          <span class="applications-card__action-icon" aria-hidden="true"></span>
        </span>

        <div v-if="feedExpanded" class="applications-card__feed-details">
          <div v-for="detail in feed.details" :key="detail.label" class="applications-card__detail">
            <span class="applications-card__detail-label">{{ detail.label }}</span>
            <span class="applications-card__detail-value">{{ detail.value }}</span>
          </div>
          <span class="applications-card__feed-action applications-card__feed-action--expanded">
            Open Settings
            <span class="applications-card__action-icon" aria-hidden="true"></span>
          </span>
        </div>
      </div>

      <div class="applications-card__table">
        <div class="applications-card__table-head">
          <span>Application</span>
          <span>Status</span>
        </div>

        <div
          v-for="application in applications"
          :key="application.id"
          class="applications-card__row"
          :class="{ 'is-expanded': expandedApplicationId === application.id }"
        >
          <button
            type="button"
            class="applications-card__row-main"
            :aria-expanded="expandedApplicationId === application.id"
            @click="toggleApplication(application.id)"
          >
            <span class="applications-card__chevron">
              <img
                :src="
                  expandedApplicationId === application.id
                    ? '/icons/ui-actions/expand-less.svg'
                    : '/icons/ui-actions/expand-more.svg'
                "
                alt=""
                aria-hidden="true"
              />
            </span>
            <span class="applications-card__row-copy">
              <span class="applications-card__row-product">{{ application.product }}</span>
              <span class="applications-card__row-amount">{{ application.amount }}</span>
              <span class="applications-card__row-date">
                {{ application.date }} ·
                <span
                  class="applications-card__row-note"
                  :class="{ 'is-error': application.noteTone === 'error' }"
                >
                  {{ application.note }}
                </span>
              </span>
            </span>
            <span class="applications-card__row-status">{{ application.status }}</span>
          </button>

          <span class="applications-card__row-action">
            <span class="applications-card__action-icon" aria-hidden="true"></span>
            Add Invoice
          </span>

          <div v-if="expandedApplicationId === application.id" class="applications-card__row-details">
            <div
              v-for="detail in application.details"
              :key="detail.label"
              class="applications-card__detail"
            >
              <span class="applications-card__detail-label">{{ detail.label }}</span>
              <span class="applications-card__detail-value">{{ detail.value }}</span>
            </div>
            <span class="applications-card__row-action applications-card__row-action--expanded">
              <span class="applications-card__action-icon" aria-hidden="true"></span>
              Add Invoice
            </span>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.applications-card {
  box-sizing: border-box;
  overflow: hidden;
  border: var(--primitives-border-width-default) solid var(--component-card-border);
  border-radius: var(--primitives-border-radius-lg);
  background: var(--component-card-background);
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-body), sans-serif;
}

.applications-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-2);
  padding: 14px var(--primitives-padding-4);
}

.applications-card__header h2 {
  margin: 0;
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-sm);
}

.applications-card__link {
  display: inline-flex;
  align-items: center;
  gap: var(--primitives-padding-1);
  padding: 0;
  border: 0;
  background: none;
  color: var(--semantic-text-ach-color-text-link);
  cursor: pointer;
  font-family: inherit;
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 500;
  line-height: var(--primitives-line-heights-3xs);
  white-space: nowrap;
}

.applications-card__link:hover,
.applications-card__feed-action:hover {
  text-decoration: underline;
}

.applications-card__link:focus-visible,
.applications-card__feed-header:focus-visible,
.applications-card__row-main:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: calc(-1 * var(--primitives-border-width-2));
}

.applications-card__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--primitives-padding-2);
  padding: var(--primitives-padding-2) var(--primitives-padding-4) var(--primitives-padding-4);
  text-align: center;
}

.applications-card__icon {
  width: var(--primitives-padding-6);
  height: var(--primitives-padding-6);
  flex: 0 0 var(--primitives-padding-6);
}

.applications-card__empty-text {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: var(--primitives-padding-1);
}

.applications-card__empty-title {
  margin: 0;
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-xs);
}

.applications-card__empty-description {
  margin: 0;
  color: var(--semantic-text-ach-color-text-subtle);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}

.applications-card__feed {
  position: relative;
  background: var(--semantic-brand-ach-color-brand-subtle);
}

.applications-card__feed-header {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-2);
  padding: var(--primitives-padding-3) var(--primitives-padding-3) var(--primitives-padding-3)
    var(--primitives-padding-4);
  border: 0;
  background: none;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
}

.applications-card__feed-icon {
  display: grid;
  width: var(--primitives-padding-6);
  height: var(--primitives-padding-6);
  flex: 0 0 var(--primitives-padding-6);
  place-items: center;
  border-radius: var(--primitives-border-radius-lg);
  background: var(--semantic-bg-info-ach-color-bg-info-surface);
}

.applications-card__feed-icon img {
  width: 16px;
  height: 16px;
}

.applications-card__feed-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.applications-card__feed-title {
  display: inline-flex;
  align-items: center;
  gap: var(--primitives-padding-1);
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-sm);
}

.applications-card__feed-subtitle {
  color: var(--semantic-text-ach-color-text-subtle);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}

.applications-card__chevron {
  display: inline-flex;
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
}

.applications-card__chevron img {
  width: 16px;
  height: 16px;
}

.applications-card__feed-badge,
.applications-card__row-status {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  padding: 2px var(--primitives-padding-2);
  border-radius: var(--primitives-border-radius-sm);
  background: var(--semantic-bg-info-ach-color-bg-info-surface);
  color: var(--semantic-text-info-ach-color-text-info);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 500;
  line-height: var(--primitives-line-heights-3xs);
  white-space: nowrap;
}

.applications-card__feed-action,
.applications-card__row-action {
  display: none;
  align-items: center;
  gap: var(--primitives-padding-1);
  padding: var(--primitives-padding-1) var(--primitives-padding-3);
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--component-card-background);
  box-shadow:
    calc(var(--primitives-shadows-sm-shadow-1-x) * 1px)
      calc(var(--primitives-shadows-sm-shadow-1-y) * 1px)
      calc(var(--primitives-shadows-sm-shadow-1-blur) * 1px)
      var(--primitives-shadows-sm-color),
    calc(var(--primitives-shadows-sm-shadow-2-x) * 1px)
      calc(var(--primitives-shadows-sm-shadow-2-y) * 1px)
      calc(var(--primitives-shadows-sm-shadow-2-blur) * 1px)
      var(--primitives-shadows-sm-color);
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-2xs);
  font-weight: 500;
  line-height: var(--primitives-line-heights-4xs);
  white-space: nowrap;
}

.applications-card__action-icon {
  width: 12px;
  height: 12px;
  flex: 0 0 12px;
  background: currentColor;
  mask: url('/icons/ui-actions/add.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/add.svg') center / contain no-repeat;
}

.applications-card__feed:hover .applications-card__feed-badge,
.applications-card__row:hover .applications-card__row-status {
  visibility: hidden;
}

.applications-card__feed:hover .applications-card__feed-action--hover,
.applications-card__row:hover .applications-card__row-action:not(.applications-card__row-action--expanded) {
  position: absolute;
  z-index: 1;
  top: var(--primitives-padding-3);
  right: var(--primitives-padding-3);
  display: inline-flex;
}

.applications-card__feed-details,
.applications-card__row-details {
  display: flex;
  flex-direction: column;
  padding: var(--primitives-padding-1) var(--primitives-padding-4) var(--primitives-padding-4)
    var(--primitives-padding-12);
}

.applications-card__row-details {
  padding-left: var(--primitives-padding-9);
}

.applications-card__detail {
  display: flex;
  gap: var(--primitives-padding-4);
  padding-block: var(--primitives-padding-1);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}

.applications-card__detail-label {
  color: var(--semantic-text-ach-color-text-secondary);
}

.applications-card__detail-value {
  flex: 1;
  min-width: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-weight: 500;
}

.applications-card__feed-action--expanded,
.applications-card__row-action--expanded {
  display: inline-flex;
  align-self: flex-end;
  margin-top: var(--primitives-padding-2);
}

.applications-card__table {
  display: flex;
  flex-direction: column;
}

.applications-card__table-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-6);
  padding: var(--primitives-padding-2) var(--primitives-padding-4);
  background: var(--semantic-bg-ach-color-bg-canvas);
  color: var(--component-table-header-text);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-sm);
}

.applications-card__row {
  position: relative;
  border-bottom: var(--primitives-border-width-default) solid
    var(--semantic-border-ach-color-border-default);
}

.applications-card__row.is-expanded {
  background: var(--semantic-bg-ach-color-bg-canvas);
}

.applications-card__row-main {
  display: flex;
  width: 100%;
  min-height: 48px;
  align-items: flex-start;
  gap: var(--primitives-padding-1);
  padding: var(--primitives-padding-3) var(--primitives-padding-4);
  border: 0;
  background: none;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
}

.applications-card__row-main .applications-card__chevron {
  margin-top: 1px;
}

.applications-card__row-status {
  align-self: center;
}

.applications-card__row-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
}

.applications-card__row-product {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}

.applications-card__row-amount {
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-sm);
}

.applications-card__row-date {
  color: var(--semantic-text-ach-color-text-subtle);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}

.applications-card__row-note.is-error {
  color: var(--semantic-text-error-ach-color-text-error-subtle);
}
</style>
