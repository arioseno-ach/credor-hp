<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    showBack?: boolean
    backLabel?: string
    lenderName?: string
  }>(),
  {
    subtitle: undefined,
    showBack: false,
    backLabel: 'Back',
    lenderName: 'Twice Financing',
  },
)

const emit = defineEmits<{
  back: []
}>()
</script>

<template>
  <header class="lender-page-header">
    <div class="lender-page-header__main">
      <button
        v-if="showBack"
        type="button"
        class="lender-page-header__back"
        @click="emit('back')"
      >
        <span class="lender-page-header__back-icon" aria-hidden="true"></span>
        <span>{{ backLabel }}</span>
      </button>

      <h1 class="lender-page-header__title" tabindex="-1">
        {{ title }}
      </h1>

      <p v-if="subtitle" class="lender-page-header__subtitle">
        {{ subtitle }}
      </p>
    </div>

    <div class="lender-page-header__pill" aria-label="Active lender workspace">
      <img
        src="/logo/logo-credor-symbol-blue-24px.svg"
        alt=""
        class="lender-page-header__pill-logo"
      />
      <span class="lender-page-header__pill-name">{{ lenderName }}</span>
      <span class="lender-page-header__pill-verified" aria-hidden="true"></span>
    </div>
  </header>
</template>

<style scoped>
.lender-page-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--primitives-padding-4);
  min-width: 0;
}

.lender-page-header__main {
  display: flex;
  min-width: 0;
  flex: 1 1 auto;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--primitives-padding-1);
}

.lender-page-header__back {
  display: inline-flex;
  align-items: center;
  gap: var(--primitives-padding-1);
  margin-bottom: var(--primitives-padding-1);
  padding: var(--primitives-padding-1) 0;
  border: 0;
  border-radius: var(--primitives-border-radius-xs);
  background: none;
  color: var(--semantic-text-ach-color-text-secondary);
  cursor: pointer;
  font-family: var(--primitives-font-families-body), sans-serif;
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-xs);
  transition: color var(--semantic-motion-duration-fast) var(--semantic-motion-easing-emphasized);
}

.lender-page-header__back:hover {
  color: var(--semantic-text-ach-color-text-default);
}

.lender-page-header__back:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: var(--primitives-border-width-2);
}

.lender-page-header__back-icon {
  width: var(--primitives-padding-4);
  height: var(--primitives-padding-4);
  flex-shrink: 0;
  background: currentColor;
  mask: url('/icons/ui-actions/arrow-back.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/arrow-back.svg') center / contain no-repeat;
}

.lender-page-header__title {
  margin: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-2xl);
  font-weight: 700;
  line-height: var(--primitives-line-heights-2xl);
}

.lender-page-header__title:focus {
  outline: none;
}

.lender-page-header__subtitle {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-family: var(--primitives-font-families-body), sans-serif;
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.lender-page-header__pill {
  display: inline-flex;
  align-items: center;
  gap: var(--primitives-padding-2);
  padding: var(--primitives-padding-2) var(--primitives-padding-3);
  border: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--semantic-bg-ach-color-bg-surface);
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-body), sans-serif;
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
  line-height: var(--primitives-line-heights-xs);
  white-space: nowrap;
}

.lender-page-header__pill-logo {
  width: var(--primitives-padding-4);
  height: var(--primitives-padding-4);
  flex-shrink: 0;
  object-fit: contain;
}

.lender-page-header__pill-name {
  color: var(--semantic-text-ach-color-text-default);
}

.lender-page-header__pill-verified {
  width: var(--primitives-font-sizes-sm);
  height: var(--primitives-font-sizes-sm);
  flex-shrink: 0;
  background: var(--semantic-brand-ach-color-brand-default);
  mask: url('/icons/common-actions/verified-filled.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/common-actions/verified-filled.svg') center / contain no-repeat;
}

@media (prefers-reduced-motion: reduce) {
  .lender-page-header__back {
    transition: none;
  }
}
</style>
