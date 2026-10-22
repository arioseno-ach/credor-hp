<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const reference = ref('')

const colors = [
  { value: 'primary', label: 'Primary' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'inverse', label: 'Inverse' },
  { value: 'success', label: 'Success' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Error' },
  { value: 'brand', label: 'Brand' },
] as const

const outlinedColors = [
  { value: 'primary', label: 'Primary' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'success', label: 'Success' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Error' },
] as const

const sizes = [
  { value: 'mini', label: 'Mini' },
  { value: 'small', label: 'Small' },
  { value: 'default', label: 'Default' },
  { value: 'large', label: 'Large' },
  { value: 'extra-large', label: 'Extra large' },
] as const

const states = [
  { value: 'default', label: 'Default', disabled: false, preview: false },
  { value: 'hover', label: 'Hover & active', disabled: false, preview: true },
  { value: 'disabled', label: 'Disabled', disabled: true, preview: false },
] as const
</script>

<template>
  <section class="controls-showcase" aria-labelledby="controls-showcase-title">
    <h2 id="controls-showcase-title">Button & Input</h2>

    <div class="button-matrix__scroller" role="region" aria-label="Solid button variants" tabindex="0">
      <table class="button-matrix" aria-label="Solid button color, size, and state combinations">
        <thead>
          <tr>
            <th class="button-matrix__color-heading" scope="col" rowspan="2">Color</th>
            <th v-for="size in sizes" :key="size.value" scope="colgroup" :colspan="states.length">
              {{ size.label }}
            </th>
          </tr>
          <tr>
            <template v-for="size in sizes" :key="`${size.value}-states`">
              <th v-for="state in states" :key="`${size.value}-${state.value}`" scope="col">
                {{ state.label }}
              </th>
            </template>
          </tr>
        </thead>
        <tbody>
          <tr v-for="color in colors" :key="color.value">
            <th class="button-matrix__color-name" scope="row">{{ color.label }}</th>
            <template v-for="size in sizes" :key="`${color.value}-${size.value}`">
              <td v-for="state in states" :key="`${color.value}-${size.value}-${state.value}`">
                <Button
                  :color="color.value"
                  :size="size.value"
                  :disabled="state.disabled"
                  :aria-label="`${color.label} ${size.label} button, ${state.label.toLowerCase()} state`"
                  :class="{ 'button-matrix__preview-hover': state.preview }"
                >
                  Button
                </Button>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>

    <h3>Outlined buttons</h3>
    <div class="button-matrix__scroller" role="region" aria-label="Outlined button variants" tabindex="0">
      <table class="button-matrix" aria-label="Outlined button color, size, and state combinations">
        <thead>
          <tr>
            <th class="button-matrix__color-heading" scope="col" rowspan="2">Color</th>
            <th v-for="size in sizes" :key="size.value" scope="colgroup" :colspan="states.length">
              {{ size.label }}
            </th>
          </tr>
          <tr>
            <template v-for="size in sizes" :key="`${size.value}-outlined-states`">
              <th v-for="state in states" :key="`${size.value}-outlined-${state.value}`" scope="col">
                {{ state.label }}
              </th>
            </template>
          </tr>
        </thead>
        <tbody>
          <tr v-for="color in outlinedColors" :key="`outlined-${color.value}`">
            <th class="button-matrix__color-name" scope="row">{{ color.label }}</th>
            <template v-for="size in sizes" :key="`outlined-${color.value}-${size.value}`">
              <td v-for="state in states" :key="`outlined-${color.value}-${size.value}-${state.value}`">
                <Button
                  variant="outline"
                  :color="color.value"
                  :size="size.value"
                  :disabled="state.disabled"
                  :aria-label="`Outlined ${color.label} ${size.label} button, ${state.label.toLowerCase()} state`"
                  :class="{ 'button-matrix__preview-outlined': state.preview }"
                >
                  Button
                </Button>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="controls-showcase__fields">
      <label class="controls-showcase__field">
        <span>Reference number</span>
        <Input v-model="reference" placeholder="Enter a reference number" />
      </label>

      <label class="controls-showcase__field">
        <span>Disabled input</span>
        <Input model-value="Unavailable" disabled />
      </label>
    </div>
  </section>
</template>

<style scoped>
.controls-showcase {
  display: flex;
  width: 100%;
  min-width: 0;
  grid-column: 1 / -1;
  flex-direction: column;
  gap: var(--primitives-padding-4);
}

h2 {
  margin: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-lg);
  font-weight: 600;
}

h3 {
  margin: var(--primitives-padding-2) 0 calc(-1 * var(--primitives-padding-2));
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 600;
}

.button-matrix__scroller {
  max-width: 100%;
  overflow-x: auto;
  border: var(--primitives-border-width-default) solid var(--component-controls-showcase-border);
  border-radius: var(--primitives-border-radius-sm);
  background: var(--component-controls-showcase-background);
  outline-color: var(--component-input-border-focus);
}

.button-matrix__scroller:focus-visible {
  outline-style: solid;
  outline-width: var(--primitives-border-width-2);
  outline-offset: var(--primitives-border-width-2);
}

.button-matrix {
  width: max-content;
  min-width: 100%;
  border-collapse: collapse;
  color: var(--component-controls-showcase-text);
  font-size: var(--primitives-font-sizes-xs);
  white-space: nowrap;
}

.button-matrix th,
.button-matrix td {
  padding: var(--primitives-padding-2);
  border-bottom: var(--primitives-border-width-default) solid var(--component-controls-showcase-border);
  text-align: center;
  vertical-align: middle;
}

.button-matrix thead th {
  color: var(--component-controls-showcase-text);
  font-weight: 500;
}

.button-matrix thead tr:first-child th {
  padding-top: var(--primitives-padding-3);
}

.button-matrix tbody tr:last-child th,
.button-matrix tbody tr:last-child td {
  border-bottom: 0;
}

.button-matrix__color-heading,
.button-matrix__color-name {
  position: sticky;
  left: 0;
  z-index: 1;
  min-width: 88px;
  background: var(--component-controls-showcase-background);
  text-align: left !important;
}

.button-matrix__color-name {
  font-weight: 500;
}

.button-matrix__preview-hover[data-color='primary'] {
  background: var(--component-button-solid-primary-bg-hover);
}

.button-matrix__preview-hover[data-color='success'] {
  background: var(--component-button-solid-success-bg-hover);
}

.button-matrix__preview-hover[data-color='warning'] {
  background: var(--component-button-solid-warning-bg-hover);
}

.button-matrix__preview-hover[data-color='error'] {
  background: var(--component-button-solid-error-bg-hover);
}

.button-matrix__preview-hover[data-color='brand'] {
  background: var(--component-button-solid-brand-bg-hover);
}

.button-matrix__preview-hover[data-color='neutral'] {
  background: var(--component-button-solid-neutral-bg-hover);
}

.button-matrix__preview-hover[data-color='inverse'] {
  background: var(--component-button-solid-inverse-bg-hover);
}

.button-matrix__preview-outlined[data-color='primary'] {
  background: var(--component-button-outlined-primary-bg-hover);
}

.button-matrix__preview-outlined[data-color='neutral'] {
  background: var(--component-button-outlined-neutral-bg-hover);
}

.button-matrix__preview-outlined[data-color='success'] {
  background: var(--component-button-outlined-success-bg-hover);
}

.button-matrix__preview-outlined[data-color='warning'] {
  background: var(--component-button-outlined-warning-bg-hover);
}

.button-matrix__preview-outlined[data-color='error'] {
  background: var(--component-button-outlined-error-bg-hover);
}

.controls-showcase__fields {
  display: grid;
  width: min(100%, 528px);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
  gap: var(--primitives-padding-4);
}

.controls-showcase__field {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-1);
  color: var(--component-input-label-text);
  font-size: var(--primitives-font-sizes-sm);
}
</style>
