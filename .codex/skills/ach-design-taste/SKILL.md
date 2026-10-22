---
name: ach-design-taste
description: Applies ACH enterprise fintech visual-taste and anti-slop standards. Use when designing, implementing, or reviewing screens, flows, or UI components in this repository.
---

# ACH Design Taste

Apply these guidelines to UI design, implementation, and review across ACH product surfaces. Use judgment based on the task and existing product context; do not force every pattern onto every screen.

## Before shaping a screen

1. Identify the product pillar, surface, primary user, and regulatory or financial risk.
2. Read `docs/design-system/context/product-overview.md` and any relevant file under `docs/design-system/context/units/`. Read `docs/design-system/patterns.md` when composing a documented workflow, and use `docs/design-system/components.md` plus the actual Vue source for component context. Read linked implementation notes only when they apply.
3. Set the screen's intent using three dials:
   - **Data density (1–10):** 1–3 for onboarding and public guidance, 4–6 for standard settings and forms, 7–10 for high-volume grids and operational workspaces.
   - **Decision friction (1–5):** 1–2 for reversible exploration, 3 for validated saves, 5 for high-stakes or irreversible actions that need deliberate confirmation.
   - **Motion restraint (1–3):** 1 for immediate feedback, 2 for subtle transitions around 150 ms, 3 for meaningful staged transitions such as a wizard. Respect reduced-motion preferences.

## Visual hierarchy and interaction

- Prefer calm, high-trust hierarchy and clear typography. Use spacing, dividers, and surface contrast to group related content; avoid putting every field or metric in its own card.
- Keep one visually primary action in a screen context when there is a clear next step. Keep destructive actions secondary and make their impact explicit.
- Account for applicable default, hover, pressed, keyboard-focus, and disabled states. Add loading behavior for asynchronous actions without shifting control dimensions; explain a disabled state when its reason is not clear.
- Use motion to communicate state changes, not as decoration. Avoid ornamental glows, gratuitous animation, and generic visual flourishes.
- Keep copy calm, direct, and consistent with `docs/design-system/context/brand-voice.md` and `docs/design-system/context/legal-rules.md`. Avoid filler and em dashes in user-facing copy.

## Financial data and dense grids

- Use tabular numerals for financial and statistical values. Align numeric columns consistently and keep decimal places and currency labels easy to scan.
- For Indonesian Rupiah, use `Rp` followed by a space and dot thousands separators when that matches the product's locale and existing formatting conventions.
- For high-density data grids, keep headers visible while rows scroll, show bulk actions when rows are selected, communicate data freshness, and provide an actionable empty state.

## Forms and high-stakes actions

- Use a real-time summary panel when it helps the user understand a consequential decision.
- Preserve entered data when navigating backward, validate on blur or explicit continuation, and warn before discarding unsaved work.
- For irreversible actions such as tax submissions, fund disbursements, or batch deletion, use a deliberate two-step confirmation with a concise impact summary.

## Use this repository's design system

- Define literal design values in `src/styles/tokens/primitives.css`, meaning-based aliases in `semantic.css`, and component-role aliases in `components.css`. These layers are loaded through `src/styles/tokens.css`.
- Keep references flowing from primitives to semantic to component tokens. Verify token names in the CSS files before use; do not assume names such as `--ach-*` from external specs are available.
- Do not add raw colors or one-off visual values directly to component styles. Reuse project components, patterns, and tokens. Follow `AGENTS.md` for the project's icon and logo asset rules.

## Handoff

For substantial screen or flow work, include a concise **ACH Design Read** with the surface, target user, and intended density, friction, and motion. Explain material tradeoffs briefly when the implementation departs from the chosen dials.
