# Design tokens

Runtime design tokens are organized under [`src/styles/tokens/`](../../src/styles/tokens/) and loaded through [`src/styles/tokens.css`](../../src/styles/tokens.css). The entry point imports the layers in dependency order.

## Token layers

- [`primitives.css`](../../src/styles/tokens/primitives.css) contains literal foundation values such as colors, spacing, and typography.
- [`semantic.css`](../../src/styles/tokens/semantic.css) gives those values a design meaning and references primitives.
- [`components.css`](../../src/styles/tokens/components.css) assigns semantic values to component roles. Component tokens should reference semantic tokens rather than primitives directly.

Keep references flowing from primitives → semantic → components. Add raw values only in the primitives layer; do not put raw color values in component styles.

## Tailwind and shadcn-vue

`semantic.css` exposes shadcn-vue's standard color names as aliases to ACH semantic tokens and maps colors, spacing, radius, and the default sans-serif font to Tailwind v4 utilities with `@theme inline`. The default font uses `--primitives-font-families-body`, which must match the family name registered by Fontsource (`Lexend Variable`). Existing ACH token names remain available. Sidebar utility colors are mapped in `components.css` to the existing Sidebar component tokens. The current bridge is light-theme only; add a dark palette only when its design values are available.

## Sidebar compatibility

The existing `--sidebar-*` and `--avatar-*` variables remain available as aliases to component tokens so current Vue styles continue to work. Sidebar hover and active colors now follow the Figma component tokens.

When a Figma design or external reference names a CSS variable, verify it exists in one of the runtime layers. External token names such as `--ach-*` do not define the application's CSS API by themselves.

## Accordion compatibility

Accordion colors map to existing `--component-accordion-*` tokens. Header spacing, icon dimensions, typography, and divider width flow through the primitives → semantic → component layers in [`components.css`](../../src/styles/tokens/components.css).

## Button and Input

Button color states consume the `--component-button-solid-*` roles, and Input styles consume `--component-input-*` roles. Success and error hover/pressed fills use their stronger semantic foreground colors, while neutral hover/pressed uses the surface-hover token. Solid button size aliases flow through semantic and component roles, including typography; the extra-large height is 54px, and the inverse disabled state uses 40% opacity. The Controls showcase displays every solid color, size, and state combination on a dark semantic canvas so inverse buttons remain visible. Generic shadcn-vue semantic utilities remain aliases over ACH semantic tokens; component-specific styles should continue to use the ACH component roles when available.

## Risk score

The Credor company health card uses a five-step score scale. Literal values live in the primitives layer (`--primitives-colors-score-*`), semantic aliases in `semantic.css` (`--semantic-bg-ach-color-bg-score-*`, `--semantic-text-ach-color-text-score-muted`), and component roles in `components.css` (`--component-risk-score-meter-*`, `--component-risk-score-label-text`). The muted scale and category labels share one color; the meter segments fade to 50% opacity while the score is not yet synced.

## Financing option illustrations

The Credor financing option cards use illustration tokens: `--semantic-text-ach-color-text-illustration`,
`--semantic-border-ach-color-border-illustration`, `--semantic-bg-ach-color-bg-illustration-tint`, and
`--semantic-text-ach-color-text-error-soft` in the semantic layer, aliased to
`--component-option-illustration-*` roles in `components.css`. The card surface uses
`--component-option-card-background` (brand subtle), the paper and rule outlines reuse the border
roles, and the option card radius follows the 16px card radius.

## Loan simulation card

The contextual loan simulation banner uses `--component-loan-simulation-*` roles in `components.css`:
surface, border, and 16px radius follow the card tokens, while the icon tile and the decorative dot
grid resolve through `--semantic-border-ach-color-border-illustration-soft` and
`--semantic-bg-ach-color-bg-illustration-dot`. The dot pattern is drawn with a radial gradient so
no raw color literal is needed.

## Slider

The slider primitive resolves its colors through `--component-slider-*` roles in `components.css`:
`--component-slider-track`, `--component-slider-fill`, `--component-slider-handle`, and
`--component-slider-handle-border`, plus `--component-slider-height` for the track thickness.

## Personalisation drawer

The Credor personalisation drawer uses `--component-drawer-*` roles in `components.css`:
`--component-drawer-background`, `--component-drawer-border`, `--component-drawer-width`, and
`--component-drawer-header-height`. The literal width and header height live in the primitives
layer (`--primitives-drawer-width`, `--primitives-drawer-header-height`).

## Checkbox

The checkbox primitive resolves its colors through `--component-checkbox-*` roles in
`components.css`: `--component-checkbox-background`, `--component-checkbox-border`,
`--component-checkbox-checked-background`, `--component-checkbox-checked-border`,
`--component-checkbox-check`, `--component-checkbox-text`, and `--component-checkbox-focus`.

## Top Bar compatibility

The TopBar uses top-bar, avatar, icon-button, divider, and focus tokens. Its literal dimensions are in the primitives layer, semantic aliases are in `semantic.css`, and `--component-topbar-*` role tokens are in [`components.css`](../../src/styles/tokens/components.css).
