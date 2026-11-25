<script setup lang="ts">
import { bandStrong } from './shared'

// Your report on the left, the company asking on the right, joined through a shield: access you grant, not a transfer.
defineProps<{ owner: string; requester: string }>()

// A small band meter so the card reads as a score report at a glance.
const bars = [0.5, 0.7, 0.9, 1, 0.8]
</script>

<template>
  <div class="ci" aria-hidden="true">
    <div class="ci__report">
      <p class="ci__report-title">Company Health</p>
      <p class="ci__report-name">{{ owner }}</p>
      <div class="ci__meter">
        <span
          v-for="(height, index) in bars"
          :key="index"
          class="ci__bar"
          :style="{ height: `${height * 100}%`, background: bandStrong[index] }"
        ></span>
      </div>
    </div>

    <span class="ci__link"></span>
    <span class="ci__shield">
      <span class="ci__icon ci__icon--shield"></span>
    </span>
    <span class="ci__link"></span>

    <div class="ci__company">
      <span class="ci__avatar">
        <span class="ci__icon ci__icon--company"></span>
      </span>
      <p class="ci__company-name">{{ requester }}</p>
      <p class="ci__company-label">Asks for access</p>
    </div>
  </div>
</template>

<style scoped>
.ci {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--primitives-padding-2);
  padding: var(--primitives-padding-6) var(--primitives-padding-4);
  border-radius: var(--primitives-border-radius-md);
  /* The dotted field the other product illustrations sit on. */
  background:
    radial-gradient(var(--semantic-bg-ach-color-bg-illustration-dot) 1px, transparent 1px) 0 0 / 14px 14px,
    var(--semantic-bg-ach-color-bg-illustration-tint);
}

.ci__report,
.ci__company {
  display: flex;
  width: 148px;
  flex: 0 1 148px;
  flex-direction: column;
  gap: 2px;
  padding: var(--primitives-padding-3);
  border: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-illustration);
  border-radius: var(--primitives-border-radius-md);
  background: var(--semantic-bg-ach-color-bg-surface);
}

.ci__company {
  align-items: center;
  text-align: center;
}

.ci__report-title,
.ci__company-label {
  margin: 0;
  color: var(--semantic-text-ach-color-text-illustration);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  line-height: var(--primitives-line-heights-3xs);
  text-transform: uppercase;
}

.ci__report-name,
.ci__company-name {
  margin: 0;
  overflow: hidden;
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
  line-height: var(--primitives-line-heights-xs);
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.ci__meter {
  display: flex;
  height: 28px;
  align-items: flex-end;
  gap: 4px;
  margin-top: var(--primitives-padding-2);
}

.ci__bar {
  flex: 1;
  border-radius: 2px;
}

.ci__link {
  width: var(--primitives-padding-6);
  flex: 0 1 var(--primitives-padding-6);
  border-top: var(--primitives-border-width-2) dashed var(--semantic-border-ach-color-border-illustration);
}

.ci__shield,
.ci__avatar {
  display: grid;
  place-items: center;
  border-radius: var(--primitives-border-radius-infinite);
}

.ci__shield {
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  border: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-illustration);
  background: var(--semantic-bg-ach-color-bg-surface);
  color: var(--semantic-text-success-ach-color-text-success);
}

.ci__avatar {
  width: 32px;
  height: 32px;
  margin-bottom: var(--primitives-padding-1);
  background: var(--semantic-bg-ach-color-bg-illustration-tint);
  color: var(--semantic-text-ach-color-text-link);
}

.ci__icon {
  width: 20px;
  height: 20px;
  background: currentcolor;
}

.ci__icon--shield {
  mask: url('/icons/privacy-security/verified-user.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/privacy-security/verified-user.svg') center / contain no-repeat;
}

.ci__icon--company {
  width: 16px;
  height: 16px;
  mask: url('/icons/business-payments/domain.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/business-payments/domain.svg') center / contain no-repeat;
}
</style>
