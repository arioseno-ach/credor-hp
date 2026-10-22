<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { StyleValue } from 'vue'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { usePersonalisationDrawer } from '@/composables/usePersonalisationDrawer'
import { usePrototypeState } from '@/lib/prototype/usePrototypeState'
import {
  emptyCoretaxCredentials,
  personalisationCopy,
  verifiedCompany,
  type CoretaxCredentials,
} from '@/components/credor/personalisation'
import PersonalisationCoretaxStep from './PersonalisationCoretaxStep.vue'
import PersonalisationVerifyStep from './PersonalisationVerifyStep.vue'

const { isOpen, step, open, close, goToCoretax } = usePersonalisationDrawer()
const { setStage } = usePrototypeState()

const npwp = ref('09.456.789.0-123.000')
const verifying = ref(false)
const verified = ref(false)
const consent = ref(false)
const credentials = ref<CoretaxCredentials>(emptyCoretaxCredentials())

const canContinue = computed(
  () => step.value === 'coretax' || (verified.value && consent.value),
)

const drawerStyle: StyleValue = {
  width: 'var(--component-drawer-width)',
  maxWidth: 'var(--component-drawer-width)',
  gap: '0',
  padding: '0',
  borderLeftColor: 'var(--component-drawer-border)',
  background: 'var(--component-drawer-background)',
}

function reset() {
  npwp.value = '09.456.789.0-123.000'
  verifying.value = false
  verified.value = false
  consent.value = false
  credentials.value = emptyCoretaxCredentials()
}

function verify() {
  if (verifying.value || !npwp.value.trim()) return

  verifying.value = true
  window.setTimeout(() => {
    verifying.value = false
    verified.value = true
  }, 700)
}

function cancel() {
  close()
}

function continueFlow() {
  if (!canContinue.value) return

  if (step.value === 'verify') {
    goToCoretax()
    return
  }

  close()
  setStage('personalising')
}

watch(isOpen, (value) => {
  if (!value) reset()
})

defineExpose({ open })
</script>

<template>
  <Sheet v-model:open="isOpen">
    <SheetContent side="right" :show-close="false" :style="drawerStyle">
      <header class="drawer__header">
        <SheetTitle class="drawer__title">{{ personalisationCopy.title }}</SheetTitle>
        <SheetDescription class="drawer__description">
          {{ personalisationCopy.description }}
        </SheetDescription>
        <button type="button" class="drawer__close" aria-label="Close" @click="cancel()">
          <img src="/icons/ui-actions/close.svg" alt="" aria-hidden="true" />
        </button>
      </header>

      <div class="drawer__body">
        <div class="drawer__intro">
          <img
            class="drawer__illustration"
            src="/images/credor/personalisation/invoicing-compliance-automation.png"
            alt=""
            aria-hidden="true"
          />
          <p class="drawer__intro-text">{{ personalisationCopy.description }}</p>
        </div>

        <PersonalisationVerifyStep
          v-if="step === 'verify'"
          :company="verifiedCompany"
          :npwp="npwp"
          :verifying="verifying"
          :verified="verified"
          :consent="consent"
          @update:npwp="npwp = $event"
          @update:consent="consent = $event"
          @verify="verify"
        />

        <PersonalisationCoretaxStep
          v-else
          :company="verifiedCompany"
          :credentials="credentials"
          @update:credentials="credentials = $event"
        />
      </div>

      <footer class="drawer__footer">
        <Button
          variant="outline"
          color="neutral"
          size="default"
          type="button"
          class="drawer__action"
          @click="cancel()"
        >
          Cancel
        </Button>

        <Button
          variant="default"
          color="primary"
          size="default"
          type="button"
          class="drawer__action"
          :disabled="!canContinue"
          @click="continueFlow()"
        >
          Save &amp; Continue
        </Button>
      </footer>
    </SheetContent>
  </Sheet>
</template>

<style scoped>
.drawer__header {
  display: flex;
  box-sizing: border-box;
  min-height: var(--component-drawer-header-height);
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-4);
  border-bottom: var(--primitives-border-width-default) solid var(--component-drawer-border);
  background: var(--component-drawer-background);
}

.drawer__title {
  margin: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-xl);
  font-weight: 700;
  line-height: var(--primitives-line-heights-xl);
}

.drawer__description {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.drawer__close {
  display: grid;
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: var(--primitives-border-radius-xs);
  background: none;
  color: var(--semantic-text-ach-color-text-default);
  cursor: pointer;
}

.drawer__close img {
  display: block;
  width: 24px;
  height: 24px;
}

.drawer__close:hover {
  background: var(--semantic-bg-ach-color-bg-surface-hover);
}

.drawer__close:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: var(--primitives-border-width-2);
}

.drawer__body {
  display: flex;
  box-sizing: border-box;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: var(--primitives-padding-6);
  padding: var(--primitives-padding-4);
  overflow-y: auto;
  background: var(--component-drawer-background);
}

.drawer__intro {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: var(--primitives-padding-4);
}

.drawer__illustration {
  display: block;
  width: 56px;
  height: 56px;
  flex: 0 0 56px;
  object-fit: contain;
}

.drawer__intro-text {
  min-width: 0;
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-family: var(--primitives-font-families-body), sans-serif;
  font-size: var(--primitives-font-sizes-md);
  font-weight: 400;
  line-height: var(--primitives-line-heights-md);
}

.drawer__footer {
  display: flex;
  box-sizing: border-box;
  flex: 0 0 auto;
  align-items: center;
  justify-content: flex-end;
  gap: var(--primitives-padding-2);
  padding: var(--primitives-padding-4);
  border-top: var(--primitives-border-width-default) solid var(--component-drawer-border);
  background: var(--component-drawer-background);
}

.drawer__action:deep(.ach-button) {
  border-radius: var(--primitives-border-radius-infinite);
}

.drawer__action:deep(.ach-button.ach-button--outlined) {
  box-shadow:
    calc(var(--primitives-shadows-xs-x) * 1px)
      calc(var(--primitives-shadows-xs-y) * 1px)
      calc(var(--primitives-shadows-xs-blur) * 1px)
      var(--primitives-shadows-xs-color);
}
</style>
