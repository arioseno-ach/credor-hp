---
name: figma-to-vue
description: Implement or update a Vue UI component from a supplied Figma node using the project's shadcn-vue and Reka UI patterns, tokens, and local assets. Use when asked to build, convert, or sync an individual Figma component; for whole screens, use the project screen and flow guidance instead.
---

# Figma component to Vue

Implement the supplied Figma component in the project's Vue 3, TypeScript, shadcn-vue, and Reka UI codebase. Match the design while keeping interaction behavior accessible and consistent with existing implementations.

## Working rules

- Treat one component as the default scope. Include only directly related exports and an existing showcase when needed. Follow an explicit user request if it sets a broader scope.
- Extend existing project or shadcn-vue components where suitable. Use Reka UI for interaction behavior when no appropriate local wrapper exists; do not recreate its keyboard, focus, ARIA, overlay, or positioning behavior.
- Preserve the project's current component APIs unless the user asks to change them. Follow the local composition, `cn()`, typed props, and `cva` patterns where they apply.
- Style color, surface, border, and text roles with existing component or semantic tokens. Use a component token when it represents the Figma role; otherwise choose a clearly matching semantic token. Use geometry primitives directly only where that matches existing component conventions.
- Verify every token and Tailwind utility in `src/styles/tokens/` and its `@theme inline` mappings before using it. Do not infer runtime support from Figma names or external specs.
- Do not change token files as part of the default component workflow. If the user explicitly requests token work, handle it within that scope and update `docs/design-system/tokens.md` as needed. Otherwise, report unresolved token gaps rather than hardcoding design values.
- Use icon and logo files that exist in `public/`. Inspect the available files and use exact paths. Never guess paths or add icons/logos from external libraries, URLs, CDNs, or newly drawn inline SVGs. If no suitable local asset exists, omit it and report the gap.
- Keep this workflow component-focused. Do not create per-component Markdown specs; update `docs/design-system/components.md` only when the implemented component inventory changes.

## Workflow

### 1. Learn the repository

Read `AGENTS.md`, `components.json`, `package.json`, and `docs/design-system/components.md`. Inspect `docs/design-system/usage-rules.md` when shared behavior or usage constraints apply. For explicitly requested token work, also read `docs/design-system/tokens.md`. Confirm the actual component paths and token entry point in `src/styles/tokens.css`; inspect the relevant files under `src/styles/tokens/` and one comparable Vue component. Use the repo's existing folder and naming patterns rather than assuming generated CLI defaults.

### 2. Inspect the supplied Figma node

Use the available Figma integration to inspect only the supplied node, including its component variants, variables, layers, and screenshot. Follow any platform-required Figma skill prerequisites before calling Figma tools. Avoid fetching the entire page when node-level context is available.

Record the component's variants, states, token roles, layer order, and icon or slot needs. Verify icon/logo choices against `public/` assets.

### 3. Classify before implementation

State one classification before coding:

| Case | Match | Approach |
| --- | --- | --- |
| A | A matching project component exists | Extend it while preserving its established Vue API and behavior. |
| B | It is a shadcn-vue component not yet present | Add the matching component using the existing `components.json` aliases and project structure, then apply project styling. |
| C | It needs interaction behavior without a suitable shadcn-vue wrapper | Compose the matching Reka UI primitive using local conventions. |
| D | It is static and has no behavior | Implement a small Vue component with the project's typed-prop and styling patterns. |

Choose the first applicable case. Check package manifests and installed components before adding dependencies; keep `reka-ui` to one installed version.

### 4. Map design to Vue

- Map Figma variants to component props and `cva` variants when that matches the local component pattern. Preserve established prop names when extending an existing component; report meaningful differences from Figma.
- Map Figma variables to verified project tokens by semantic role, not by visual color guess. Use Tailwind utilities only when their `@theme inline` mappings exist; existing scoped CSS may use verified project CSS variables directly.
- Use Reka UI state attributes for open, checked, disabled, and similar primitive states. Do not add manual props that duplicate primitive state.
- Represent leading/trailing content with the existing slot or prop pattern. Match the Figma component's name only when it fits the project's naming conventions.
- If no token clearly matches, use a close semantic token only when its meaning is equivalent and record the assumption. Otherwise leave the unresolved property unhardcoded and report the token gap and Figma layer/value.

### 5. Verify

- Run `pnpm lint`, `pnpm typecheck`, and `pnpm lint:tokens` for component styling changes.
- Check changed component files for raw colors and unapproved arbitrary Tailwind values. Follow documented exceptions in `docs/design-system/usage-rules.md`.
- If dependencies changed, inspect `pnpm ls reka-ui --depth Infinity` and confirm only one version is installed.
- Review keyboard access, visible focus, disabled behavior, accessible names, and primitive-provided ARIA behavior. Update an existing showcase when it is the project's established way to demonstrate variants; inspect the rendered result when practical.

## Handoff

Summarize the classification, files changed, variants implemented, token assumptions or gaps, remaining differences from Figma, and checks run with their results. Do not paste the full component code into the response.
