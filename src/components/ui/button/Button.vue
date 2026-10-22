<script setup lang="ts">
import { computed } from "vue"
import type { PrimitiveProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import type { ButtonVariants } from "."
import { Primitive } from "reka-ui"
import { cn } from "@/lib/utils"
import { buttonVariants } from "."

interface Props extends PrimitiveProps {
  variant?: ButtonVariants["variant"]
  size?: ButtonVariants["size"]
  color?: NonNullable<ButtonVariants["color"]>
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  as: "button",
})

const solidVariants = new Set(["default", "destructive", "secondary"])
const legacyColors: Record<NonNullable<ButtonVariants["variant"]>, NonNullable<ButtonVariants["color"]>> = {
  default: "primary",
  destructive: "error",
  outline: "primary",
  secondary: "neutral",
  ghost: "primary",
  link: "primary",
}
const outlinedColors = new Set(["primary", "neutral", "success", "warning", "error"])

const resolvedColor = computed(() => props.color ?? legacyColors[props.variant ?? "default"])
const isSolid = computed(() => solidVariants.has(props.variant ?? "default"))
const isOutlined = computed(() => props.variant === "outline")
const resolvedOutlinedColor = computed(() => outlinedColors.has(resolvedColor.value) ? resolvedColor.value : "primary")
const rootClass = computed(() => cn(
  buttonVariants({
    variant: props.variant,
    size: props.size,
    color: isSolid.value ? resolvedColor.value : isOutlined.value ? resolvedOutlinedColor.value : undefined,
  }),
  props.class,
))
</script>

<template>
  <Primitive
    data-slot="button"
    :data-variant="variant"
    :data-size="size ?? 'default'"
    :data-color="isSolid ? resolvedColor : isOutlined ? resolvedOutlinedColor : undefined"
    :as="as"
    :as-child="asChild"
    :class="rootClass"
  >
    <span v-if="$slots.leadingIcon" class="ach-button__icon" aria-hidden="true">
      <slot name="leadingIcon" />
    </span>
    <slot />
    <span v-if="$slots.trailingIcon" class="ach-button__icon" aria-hidden="true">
      <slot name="trailingIcon" />
    </span>
  </Primitive>
</template>

<style scoped>
.ach-button {
  border: var(--primitives-border-width-default) solid transparent;
  border-radius: var(--primitives-border-radius-sm);
  outline-color: var(--component-input-border-focus);
}

.ach-button:focus-visible {
  outline-style: solid;
  outline-width: var(--primitives-border-width-2);
  outline-offset: var(--primitives-border-width-2);
}

.ach-button.ach-button--solid {
  border: 0;
  border-radius: var(--component-button-solid-radius);
}

.ach-button--color-primary.ach-button--solid {
  background: var(--component-button-solid-primary-bg);
  color: var(--component-button-solid-primary-text);
}

.ach-button--color-primary.ach-button--solid:is(:hover, :active):not(:disabled) {
  background: var(--component-button-solid-primary-bg-hover);
}

.ach-button--color-primary.ach-button--solid:disabled {
  background: var(--component-button-solid-primary-bg-disabled);
  color: var(--component-button-solid-primary-text-disabled);
}

.ach-button--color-success.ach-button--solid {
  background: var(--component-button-solid-success-bg);
  color: var(--component-button-solid-success-text);
}

.ach-button--color-success.ach-button--solid:is(:hover, :active):not(:disabled) {
  background: var(--component-button-solid-success-bg-hover);
}

.ach-button--color-success.ach-button--solid:disabled {
  background: var(--component-button-solid-success-bg-disabled);
  color: var(--component-button-solid-success-text-disabled);
}

.ach-button--color-warning.ach-button--solid {
  background: var(--component-button-solid-warning-bg);
  color: var(--component-button-solid-warning-text);
}

.ach-button--color-warning.ach-button--solid:is(:hover, :active):not(:disabled) {
  background: var(--component-button-solid-warning-bg-hover);
}

.ach-button--color-warning.ach-button--solid:disabled {
  background: var(--component-button-solid-warning-bg-disabled);
  color: var(--component-button-solid-warning-text-disabled);
}

.ach-button--color-error.ach-button--solid {
  background: var(--component-button-solid-error-bg);
  color: var(--component-button-solid-error-text);
}

.ach-button--color-error.ach-button--solid:is(:hover, :active):not(:disabled) {
  background: var(--component-button-solid-error-bg-hover);
}

.ach-button--color-error.ach-button--solid:disabled {
  background: var(--component-button-solid-error-bg-disabled);
  color: var(--component-button-solid-error-text-disabled);
}

.ach-button--color-brand.ach-button--solid {
  background: var(--component-button-solid-brand-bg);
  color: var(--component-button-solid-brand-text);
}

.ach-button--color-brand.ach-button--solid:is(:hover, :active):not(:disabled) {
  background: var(--component-button-solid-brand-bg-hover);
}

.ach-button--color-brand.ach-button--solid:disabled {
  background: var(--component-button-solid-brand-bg-disabled);
  color: var(--component-button-solid-brand-text-disabled);
}

.ach-button--color-neutral.ach-button--solid {
  background: var(--component-button-solid-neutral-bg);
  color: var(--component-button-solid-neutral-text);
}

.ach-button--color-neutral.ach-button--solid:is(:hover, :active):not(:disabled) {
  background: var(--component-button-solid-neutral-bg-hover);
}

.ach-button--color-neutral.ach-button--solid:disabled {
  background: var(--component-button-solid-neutral-bg-disabled);
  color: var(--component-button-solid-neutral-text-disabled);
}

.ach-button--color-inverse.ach-button--solid {
  background: var(--component-button-solid-inverse-bg);
  color: var(--component-button-solid-inverse-text);
}

.ach-button--color-inverse.ach-button--solid:is(:hover, :active):not(:disabled) {
  background: var(--component-button-solid-inverse-bg-hover);
}

.ach-button--color-inverse.ach-button--solid:disabled {
  background: var(--component-button-solid-inverse-bg-disabled);
  color: var(--component-button-solid-inverse-text-disabled);
  opacity: var(--component-button-solid-inverse-opacity-disabled);
}

.ach-button--outlined {
  border-style: solid;
}

.ach-button--outlined.ach-button--color-primary {
  border-color: var(--component-button-outlined-primary-border);
  background: var(--component-button-outlined-primary-bg);
  color: var(--component-button-outlined-primary-text);
}

.ach-button--outlined.ach-button--color-primary:is(:hover, :active):not(:disabled) {
  background: var(--component-button-outlined-primary-bg-hover);
}

.ach-button--outlined.ach-button--color-primary:disabled {
  border-color: var(--component-button-outlined-primary-border-disabled);
  color: var(--component-button-outlined-primary-text-disabled);
}

.ach-button--outlined.ach-button--color-neutral {
  border-color: var(--component-button-outlined-neutral-border);
  background: var(--component-button-outlined-neutral-bg);
  color: var(--component-button-outlined-neutral-text);
}

.ach-button--outlined.ach-button--color-neutral:is(:hover, :active):not(:disabled) {
  background: var(--component-button-outlined-neutral-bg-hover);
}

.ach-button--outlined.ach-button--color-neutral:disabled {
  border-color: var(--component-button-outlined-neutral-border-disabled);
  color: var(--component-button-outlined-neutral-text-disabled);
}

.ach-button--outlined.ach-button--color-success {
  border-color: var(--component-button-outlined-success-border);
  background: var(--component-button-outlined-success-bg);
  color: var(--component-button-outlined-success-text);
}

.ach-button--outlined.ach-button--color-success:is(:hover, :active):not(:disabled) {
  background: var(--component-button-outlined-success-bg-hover);
}

.ach-button--outlined.ach-button--color-success:disabled {
  border-color: var(--component-button-outlined-success-border-disabled);
  color: var(--component-button-outlined-success-text-disabled);
}

.ach-button--outlined.ach-button--color-warning {
  border-color: var(--component-button-outlined-warning-border);
  background: var(--component-button-outlined-warning-bg);
  color: var(--component-button-outlined-warning-text);
}

.ach-button--outlined.ach-button--color-warning:is(:hover, :active):not(:disabled) {
  background: var(--component-button-outlined-warning-bg-hover);
}

.ach-button--outlined.ach-button--color-warning:disabled {
  border-color: var(--component-button-outlined-warning-border-disabled);
  color: var(--component-button-outlined-warning-text-disabled);
}

.ach-button--outlined.ach-button--color-error {
  border-color: var(--component-button-outlined-error-border);
  background: var(--component-button-outlined-error-bg);
  color: var(--component-button-outlined-error-text);
}

.ach-button--outlined.ach-button--color-error:is(:hover, :active):not(:disabled) {
  background: var(--component-button-outlined-error-bg-hover);
}

.ach-button--outlined.ach-button--color-error:disabled {
  border-color: var(--component-button-outlined-error-border-disabled);
  color: var(--component-button-outlined-error-text-disabled);
}

.ach-button--link-primary {
  color: var(--component-button-link-primary-text);
}

.ach-button--link-primary:hover:not(:disabled) {
  background: var(--component-button-link-primary-bg-hover);
  color: var(--component-button-link-primary-text-hover);
}

.ach-button--link-primary:disabled {
  color: var(--component-button-link-primary-text-disabled);
}

.ach-button--link {
  text-underline-offset: var(--primitives-padding-1);
}

.ach-button--link:hover:not(:disabled) {
  text-decoration-line: underline;
}

.ach-button__icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
}

.ach-button__icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.ach-button--solid.ach-button--size-mini {
  height: var(--component-button-size-mini-height);
  gap: var(--component-button-size-mini-gap);
  padding: var(--component-button-size-mini-padding-block) var(--component-button-size-mini-padding-inline);
  border-radius: var(--component-button-solid-radius);
  font-size: var(--component-button-size-mini-font-size);
  line-height: var(--component-button-size-mini-line-height);
  letter-spacing: var(--component-button-size-mini-letter-spacing);
}

.ach-button--solid.ach-button--size-small {
  height: var(--component-button-size-small-height);
  gap: var(--component-button-size-small-gap);
  padding: var(--component-button-size-small-padding-block) var(--component-button-size-small-padding-inline);
  border-radius: var(--component-button-solid-radius);
  font-size: var(--component-button-size-small-font-size);
  line-height: var(--component-button-size-small-line-height);
  letter-spacing: var(--component-button-size-small-letter-spacing);
}

.ach-button--solid.ach-button--size-default {
  height: var(--component-button-size-default-height);
  gap: var(--component-button-size-default-gap);
  padding: var(--component-button-size-default-padding-block) var(--component-button-size-default-padding-inline);
  border-radius: var(--component-button-solid-radius);
  font-size: var(--component-button-size-default-font-size);
  line-height: var(--component-button-size-default-line-height);
  letter-spacing: var(--component-button-size-default-letter-spacing);
}

.ach-button--solid.ach-button--size-large {
  height: var(--component-button-size-large-height);
  gap: var(--component-button-size-large-gap);
  padding: var(--component-button-size-large-padding-block) var(--component-button-size-large-padding-inline);
  border-radius: var(--component-button-solid-radius);
  font-size: var(--component-button-size-large-font-size);
  line-height: var(--component-button-size-large-line-height);
  letter-spacing: var(--component-button-size-large-letter-spacing);
}

.ach-button--solid.ach-button--size-extra-large {
  height: var(--component-button-size-extra-large-height);
  gap: var(--component-button-size-extra-large-gap);
  padding: var(--component-button-size-extra-large-padding-block) var(--component-button-size-extra-large-padding-inline);
  border-radius: var(--component-button-solid-radius);
  font-size: var(--component-button-size-extra-large-font-size);
  line-height: var(--component-button-size-extra-large-line-height);
  letter-spacing: var(--component-button-size-extra-large-letter-spacing);
  font-weight: 700;
}

.ach-button--solid.ach-button--size-mini .ach-button__icon {
  width: var(--component-button-size-mini-icon-size);
  height: var(--component-button-size-mini-icon-size);
}

.ach-button--outlined.ach-button--size-mini {
  height: var(--component-button-size-mini-height);
  gap: var(--component-button-size-mini-gap);
  padding: var(--component-button-size-mini-padding-block) var(--component-button-size-mini-padding-inline);
  border-radius: var(--component-button-solid-radius);
  font-size: var(--component-button-size-mini-font-size);
  line-height: var(--component-button-size-mini-line-height);
  letter-spacing: var(--component-button-size-mini-letter-spacing);
}

.ach-button--outlined.ach-button--size-small {
  height: var(--component-button-size-small-height);
  gap: var(--component-button-size-small-gap);
  padding: var(--component-button-size-small-padding-block) var(--component-button-size-small-padding-inline);
  border-radius: var(--component-button-solid-radius);
  font-size: var(--component-button-size-small-font-size);
  line-height: var(--component-button-size-small-line-height);
  letter-spacing: var(--component-button-size-small-letter-spacing);
}

.ach-button--outlined.ach-button--size-default {
  height: var(--component-button-size-default-height);
  gap: var(--component-button-size-default-gap);
  padding: var(--component-button-size-default-padding-block) var(--component-button-size-default-padding-inline);
  border-radius: var(--component-button-solid-radius);
  font-size: var(--component-button-size-default-font-size);
  line-height: var(--component-button-size-default-line-height);
  letter-spacing: var(--component-button-size-default-letter-spacing);
}

.ach-button--outlined.ach-button--size-large {
  height: var(--component-button-size-large-height);
  gap: var(--component-button-size-large-gap);
  padding: var(--component-button-size-large-padding-block) var(--component-button-size-large-padding-inline);
  border-radius: var(--component-button-solid-radius);
  font-size: var(--component-button-size-large-font-size);
  line-height: var(--component-button-size-large-line-height);
  letter-spacing: var(--component-button-size-large-letter-spacing);
}

.ach-button--outlined.ach-button--size-extra-large {
  height: var(--component-button-size-extra-large-height);
  gap: var(--component-button-size-extra-large-gap);
  padding: var(--component-button-size-extra-large-padding-block) var(--component-button-size-extra-large-padding-inline);
  border-radius: var(--component-button-solid-radius);
  font-size: var(--component-button-size-extra-large-font-size);
  line-height: var(--component-button-size-extra-large-line-height);
  letter-spacing: var(--component-button-size-extra-large-letter-spacing);
  font-weight: 700;
}

.ach-button--solid.ach-button--size-small .ach-button__icon {
  width: var(--component-button-size-small-icon-size);
  height: var(--component-button-size-small-icon-size);
}

.ach-button--solid.ach-button--size-default .ach-button__icon {
  width: var(--component-button-size-default-icon-size);
  height: var(--component-button-size-default-icon-size);
}

.ach-button--solid.ach-button--size-large .ach-button__icon {
  width: var(--component-button-size-large-icon-size);
  height: var(--component-button-size-large-icon-size);
}

.ach-button--solid.ach-button--size-extra-large .ach-button__icon {
  width: var(--component-button-size-extra-large-icon-size);
  height: var(--component-button-size-extra-large-icon-size);
}

.ach-button--outlined.ach-button--size-mini .ach-button__icon {
  width: var(--component-button-size-mini-icon-size);
  height: var(--component-button-size-mini-icon-size);
}

.ach-button--outlined.ach-button--size-small .ach-button__icon {
  width: var(--component-button-size-small-icon-size);
  height: var(--component-button-size-small-icon-size);
}

.ach-button--outlined.ach-button--size-default .ach-button__icon {
  width: var(--component-button-size-default-icon-size);
  height: var(--component-button-size-default-icon-size);
}

.ach-button--outlined.ach-button--size-large .ach-button__icon {
  width: var(--component-button-size-large-icon-size);
  height: var(--component-button-size-large-icon-size);
}

.ach-button--outlined.ach-button--size-extra-large .ach-button__icon {
  width: var(--component-button-size-extra-large-icon-size);
  height: var(--component-button-size-extra-large-icon-size);
}
</style>
