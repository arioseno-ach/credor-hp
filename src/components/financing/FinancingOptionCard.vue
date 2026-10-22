<script setup lang="ts">
import { computed, ref } from 'vue'
import { useElementSize } from '@vueuse/core'
import { Button } from '@/components/ui/button'
import FinancingOptionIllustration from '@/components/financing/FinancingOptionIllustration.vue'
import type { FinancingOption } from '@/components/credor/financing-options'

const props = defineProps<{
  option: FinancingOption
}>()

const slotRef = ref<HTMLElement | null>(null)
const { width } = useElementSize(slotRef)

const stageScale = computed(() => (width.value > 0 ? width.value / 720 : 0))
</script>

<template>
  <article class="financing-option">
    <div class="financing-option__copy">
      <h3>{{ option.title }}</h3>
      <p>
        <template v-for="(part, index) in option.description" :key="index">
          <b v-if="part.strong">{{ part.text }}</b>
          <template v-else>{{ part.text }}</template>
        </template>
      </p>
    </div>

    <div ref="slotRef" class="financing-option__slot">
      <div
        class="financing-option__stage"
        :style="{ transform: `scale(${stageScale})` }"
      >
        <FinancingOptionIllustration :type="option.illustration" />
      </div>
    </div>

    <div class="financing-option__actions">
      <Button
        variant="default"
        color="primary"
        size="default"
        type="button"
        class="financing-option__apply"
      >
        Apply Now
      </Button>
    </div>
  </article>
</template>

<style scoped>
.financing-option {
  position: relative;
  display: flex;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  border-radius: var(--component-option-card-radius);
  background: var(--component-option-card-background);
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-body), sans-serif;
  transition: transform 200ms ease;
}

.financing-option:hover {
  transform: translateY(-2px);
}

.financing-option__copy {
  padding: var(--primitives-padding-4);
}

.financing-option__copy h3 {
  margin: 0;
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-md);
  font-weight: 500;
  line-height: var(--primitives-line-heights-md);
}

.financing-option__copy p {
  margin: var(--primitives-padding-2) 0 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 400;
  line-height: var(--primitives-line-heights-sm);
}

.financing-option__copy b {
  color: var(--semantic-text-ach-color-text-default);
  font-weight: 500;
}

.financing-option__slot {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 2;
  margin-top: auto;
  overflow: hidden;
}

.financing-option__stage {
  position: absolute;
  top: 0;
  left: 0;
  width: 720px;
  height: 480px;
  transform-origin: top left;
}

.financing-option__actions {
  position: absolute;
  z-index: 2;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  padding: var(--primitives-padding-4);
  background: color-mix(in srgb, var(--component-option-card-background) 62%, transparent);
  backdrop-filter: blur(12px);
  opacity: 0;
  transform: translateY(8px);
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.financing-option:hover .financing-option__actions,
.financing-option:focus-within .financing-option__actions {
  opacity: 1;
  transform: none;
}

.financing-option__apply {
  width: 100%;
}
</style>
