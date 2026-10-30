<script setup lang="ts">
const props = withDefaults(defineProps<{
  initials: string
  verified?: boolean
  label?: string
  variant?: 'default' | 'inverse'
}>(), {
  variant: 'default',
})
</script>

<template>
  <span class="avatar" :class="{ 'avatar--inverse': props.variant === 'inverse' }">
    <span class="avatar__initials">{{ props.initials }}</span>
    <img
      v-if="props.verified"
      class="avatar__verified"
      src="/icons/common-actions/verified-filled.svg"
      alt=""
      aria-hidden="true"
    />
    <span v-if="props.label" class="sr-only">{{ props.label }}</span>
  </span>
</template>

<style scoped>
.avatar {
  position: relative;
  display: grid;
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  place-items: center;
  border: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-default);
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--semantic-bg-ach-color-bg-canvas);
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-md);
  font-weight: 700;
  letter-spacing: 0.16px;
}

.avatar__initials {
  line-height: 1;
}

.avatar__verified {
  position: absolute;
  right: 0;
  bottom: 0;
  display: block;
  width: 20px;
  height: 20px;
}

.avatar--inverse {
  border: 0;
  background: var(--avatar-initials-background);
  color: var(--avatar-initials-text);
  font-family: var(--primitives-font-families-body), sans-serif;
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  letter-spacing: var(--primitives-letter-spacing-wide);
}

.avatar--inverse .avatar__initials {
  line-height: var(--primitives-line-heights-xs);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
