<script setup lang="ts">
defineProps<{
  initials: string
  verified?: boolean
  label?: string
}>()
</script>

<template>
  <span class="avatar">
    <span class="avatar__initials">{{ initials }}</span>
    <img
      v-if="verified"
      class="avatar__verified"
      src="/icons/common-actions/verified-filled.svg"
      alt=""
      aria-hidden="true"
    />
    <span v-if="label" class="sr-only">{{ label }}</span>
  </span>
</template>

<style scoped>
.avatar {
  position: relative;
  display: grid;
  width: 56px;
  height: 56px;
  flex: 0 0 56px;
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

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
