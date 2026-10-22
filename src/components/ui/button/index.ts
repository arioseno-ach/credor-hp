import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Button } from "./Button.vue"

export const buttonVariants = cva(
  "ach-button inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:cursor-not-allowed outline-none focus-visible:outline-2 focus-visible:outline-offset-2",
  {
    variants: {
      variant: {
        default: "ach-button--solid",
        destructive: "ach-button--solid",
        outline: "ach-button--outlined",
        secondary: "ach-button--solid",
        ghost: "ach-button--link-primary ach-button--ghost",
        link: "ach-button--link-primary ach-button--link",
      },
      color: {
        primary: "ach-button--color-primary",
        success: "ach-button--color-success",
        warning: "ach-button--color-warning",
        error: "ach-button--color-error",
        brand: "ach-button--color-brand",
        neutral: "ach-button--color-neutral",
        inverse: "ach-button--color-inverse",
      },
      size: {
        "mini": "ach-button--size-mini",
        "small": "ach-button--size-small",
        "default": "ach-button--size-default h-9 px-4 py-2 has-[>svg]:px-3",
        "large": "ach-button--size-large",
        "extra-large": "ach-button--size-extra-large",
        "xs": "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        "sm": "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        "lg": "h-10 rounded-md px-6 has-[>svg]:px-4",
        "icon": "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      color: "primary",
    },
  },
)
export type ButtonVariants = VariantProps<typeof buttonVariants>
