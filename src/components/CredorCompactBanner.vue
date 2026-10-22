<script setup lang="ts">
const benefits = [
  'Unlock working capital from your business transactions.',
  'Funds disbursed within 24 hours of approval.',
  'One application, multiple financing options.',
]
</script>

<template>
  <section class="compact-banner" aria-label="Financing benefits">
    <ul class="compact-banner__benefits">
      <li v-for="benefit in benefits" :key="benefit">
        <span class="compact-banner__check" aria-hidden="true"></span>
        <span>{{ benefit }}</span>
      </li>
    </ul>

    <p class="compact-banner__compliance">
      All financing partners are licensed and supervised by OJK.
    </p>
  </section>
</template>

<style scoped>
.compact-banner {
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-4);
  border: var(--primitives-border-width-default) solid var(--component-card-border);
  border-radius: var(--primitives-border-radius-lg);
  background:
    radial-gradient(
      ellipse 60% 130% at 50% 100%,
      var(--semantic-bg-info-ach-color-bg-info-surface) 0%,
      transparent 75%
    ),
    var(--component-card-background);
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-body), sans-serif;
}

.compact-banner__benefits {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--primitives-padding-4);
  margin: 0;
  padding: 0;
  list-style: none;
}

.compact-banner__benefits li {
  display: flex;
  align-items: flex-start;
  gap: var(--primitives-padding-2);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 400;
  line-height: var(--primitives-line-heights-2xs);
}

.compact-banner__check {
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
  background: var(--semantic-brand-ach-color-brand-default);
  mask: url('/icons/ui-actions/check-circle.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/check-circle.svg') center / contain no-repeat;
}

.compact-banner__compliance {
  margin: 0;
  color: var(--semantic-text-ach-color-text-subtle);
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-2xs);
  font-weight: 500;
  line-height: var(--primitives-line-heights-4xs);
  text-align: center;
}

@container credor-main (max-width: 720px) {
  .compact-banner__benefits {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--primitives-padding-2);
  }
}
</style>
