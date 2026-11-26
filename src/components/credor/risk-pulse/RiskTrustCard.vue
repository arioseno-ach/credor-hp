<script setup lang="ts">
const badges = [
  {
    src: '/images/credor/trust/djp-qr.png',
    alt: 'Directorate General of Taxes (DJP) PJAP verification QR code',
    width: 34,
    height: 40,
  },
  {
    src: '/images/credor/trust/bsi-iso-27001-27701.png',
    alt: 'BSI ISO/IEC 27001 and ISO/IEC 27701 certified',
    width: 124,
    height: 40,
  },
  {
    src: '/images/credor/trust/wqa-iso-9001.png',
    alt: 'WQA Registered ISO 9001:2015',
    width: 35,
    height: 40,
  },
] as const
</script>

<template>
  <aside class="trust-card" aria-labelledby="consent-trust-title">
    <div class="trust-card__content">
      <div class="trust-card__header">
        <img
          src="/icons/privacy-security/security.svg"
          alt=""
          aria-hidden="true"
          width="24"
          height="24"
          class="trust-card__icon"
        >
        <h2 id="consent-trust-title" class="trust-card__title">You are safe with us</h2>
      </div>
      <p class="trust-card__text">
        Achilles is an officially recognized Tax Application Service Provider (PJAP) authorized by the Directorate
        General of Taxes to automate invoicing and corporate tax reporting, and it is ISO 27001 certified.
      </p>
    </div>

    <div class="trust-card__badges">
      <img
        v-for="badge in badges"
        :key="badge.src"
        :src="badge.src"
        :alt="badge.alt"
        :width="badge.width"
        :height="badge.height"
        class="trust-card__badge"
      >
    </div>
  </aside>
</template>

<style scoped>
.trust-card {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-4);
  padding: var(--primitives-padding-4);
}

.trust-card__content {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-1);
}

.trust-card__header {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-2);
}

.trust-card__icon {
  display: block;
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
}

.trust-card__title {
  margin: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-body), sans-serif;
  font-size: var(--primitives-font-sizes-md);
  font-weight: 500;
  line-height: var(--primitives-line-heights-md);
  letter-spacing: var(--primitives-letter-spacing-md);
}

.trust-card__text {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-family: var(--primitives-font-families-body), sans-serif;
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 400;
  line-height: var(--primitives-line-heights-2xs);
  letter-spacing: var(--primitives-letter-spacing-md);
}

.trust-card__badges {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--primitives-padding-4);
}

.trust-card__badge {
  display: block;
  height: 40px;
  flex-shrink: 0;
  object-fit: cover;
}
</style>
