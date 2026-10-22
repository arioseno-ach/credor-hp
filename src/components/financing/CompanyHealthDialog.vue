<script setup lang="ts">
import type { StyleValue } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCompanyHealthDialog } from '@/composables/useCompanyHealthDialog'
import { usePersonalisationDrawer } from '@/composables/usePersonalisationDrawer'

const { isOpen, close } = useCompanyHealthDialog()
const { open: openPersonalisation } = usePersonalisationDrawer()

const dialogStyle: StyleValue = {
  width: 'min(calc(100% - 2rem), 1192px)',
  maxWidth: '1192px',
  padding: '0',
  overflow: 'auto',
}

const benefits = [
  'Lihat skor kesehatan bisnis Anda secara instan, tanpa biaya.',
  'Profil yang kuat meningkatkan peluang bunga mulai dari 1%.',
  'Temukan area yang bisa diperbaiki sebelum Anda mengajukan.',
]

function startHealthCheck() {
  close()
  openPersonalisation()
}
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="company-health-dialog" :style="dialogStyle" :show-close="false">
      <div class="company-health-dialog__grid">
        <div class="company-health-dialog__content">
          <div class="company-health-dialog__copy">
            <img
              class="company-health-dialog__logo"
              src="/logo/logo-riskpulse.svg"
              alt="Credor RiskPulse"
            >

            <DialogTitle class="company-health-dialog__title">
              Perusahaan yang sehat berpeluang mendapat bunga lebih rendah
            </DialogTitle>

            <DialogDescription class="company-health-dialog__description">
              Cek Company Health bisnis Anda sebelum mengajukan pendanaan. Profil bisnis yang kuat
              dan terverifikasi membantu kami menilai Anda lebih akurat, sehingga membuka peluang
              suku bunga yang lebih kompetitif.
            </DialogDescription>

            <ul class="company-health-dialog__benefits">
              <li v-for="benefit in benefits" :key="benefit" class="company-health-dialog__benefit">
                <span class="company-health-dialog__benefit-icon" aria-hidden="true"></span>
                <span>{{ benefit }}</span>
              </li>
            </ul>

            <Button
              variant="default"
              color="brand"
              size="extra-large"
              type="button"
              class="company-health-dialog__cta"
              @click="startHealthCheck"
            >
              Cek Kesehatan Perusahaan Gratis
              <template #trailingIcon>
                <span class="company-health-dialog__cta-arrow" aria-hidden="true"></span>
              </template>
            </Button>
          </div>
        </div>

        <div class="company-health-dialog__visual">
          <img
            class="company-health-dialog__visual-image"
            src="/images/risk-pulse-banner.png"
            alt=""
            aria-hidden="true"
          >
        </div>
      </div>

      <button type="button" class="company-health-dialog__close" aria-label="Close" @click="close">
        <img src="/icons/ui-actions/close.svg" alt="" aria-hidden="true">
      </button>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
.company-health-dialog__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 534px;
  align-items: stretch;
}

.company-health-dialog__content {
  display: flex;
  box-sizing: border-box;
  align-items: flex-start;
  padding: var(--primitives-padding-10) var(--primitives-padding-6) var(--primitives-padding-10)
    var(--primitives-padding-10);
}

.company-health-dialog__copy {
  display: flex;
  width: 100%;
  max-width: 600px;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--primitives-padding-4);
}

.company-health-dialog__logo {
  display: block;
  width: auto;
  height: 28px;
}

.company-health-dialog__title {
  margin: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-4xl);
  font-weight: 700;
  letter-spacing: var(--primitives-letter-spacing-tight);
  line-height: var(--primitives-line-heights-4xl);
}

.company-health-dialog__description {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-md);
  font-weight: 400;
  line-height: var(--primitives-line-heights-md);
}

.company-health-dialog__benefits {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: var(--primitives-padding-1);
  margin: 0;
  padding: 0;
  list-style: none;
}

.company-health-dialog__benefit {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-2);
  padding: var(--primitives-padding-2) 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.company-health-dialog__benefit-icon {
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  background: var(--semantic-text-success-ach-color-text-success-subtle);
  mask: url('/icons/ui-actions/check.svg') center / 18px 18px no-repeat;
  -webkit-mask: url('/icons/ui-actions/check.svg') center / 18px 18px no-repeat;
}

.company-health-dialog__cta {
  gap: var(--primitives-padding-2);
  padding: var(--primitives-padding-4) var(--primitives-padding-6);
  white-space: normal;
}

.company-health-dialog__cta-arrow {
  width: var(--primitives-font-sizes-xl);
  height: var(--primitives-font-sizes-xl);
  background: currentColor;
  mask: url('/icons/ui-actions/arrow-forward.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/arrow-forward.svg') center / contain no-repeat;
}

.company-health-dialog__visual {
  position: relative;
  display: block;
  height: 635px;
  min-height: 635px;
  overflow: hidden;
}

.company-health-dialog__visual-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.company-health-dialog__close {
  position: absolute;
  z-index: 2;
  top: var(--primitives-padding-3);
  right: var(--primitives-padding-3);
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: var(--primitives-border-radius-infinite);
  background: color-mix(in srgb, var(--component-card-background) 90%, transparent);
  color: var(--semantic-text-ach-color-text-default);
  cursor: pointer;
}

.company-health-dialog__close img {
  display: block;
  width: 18px;
  height: 18px;
}

.company-health-dialog__close:hover {
  background: var(--component-card-background);
}

.company-health-dialog__close:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: var(--primitives-border-width-2);
}

@container (max-width: 1040px) {
  .company-health-dialog__content {
    padding: var(--primitives-padding-6);
  }
}

@media (max-width: 960px) {
  .company-health-dialog__grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .company-health-dialog__visual {
    display: none;
  }

  .company-health-dialog__content {
    padding: var(--primitives-padding-6);
  }

  .company-health-dialog__title {
    font-size: var(--primitives-font-sizes-3xl);
    line-height: var(--primitives-line-heights-3xl);
  }
}

@media (max-width: 600px) {
  .company-health-dialog__content {
    padding: var(--primitives-padding-5);
    padding-top: var(--primitives-padding-10);
  }

  .company-health-dialog__title {
    font-size: var(--primitives-font-sizes-2xl);
    line-height: var(--primitives-line-heights-2xl);
  }

  .company-health-dialog__cta {
    width: 100%;
  }
}
</style>
