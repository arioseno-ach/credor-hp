# shadcn-vue / Reka UI Migration Checklist

Branch: `feat/shadcn-vue-reka-ui` · Baseline: `9d62d0f` (`chore: checkpoint current Vue design system state`)

## Phase 0 — Scan and decisions

- [x] Scan the Vue/Vite/Tailwind stack, token graph, existing components, docs, and guardrails.
- [x] Confirm this branch carries all local project changes from `main`.
- [x] Limit implementation scope to Accordion, Sidebar, Top Bar, Button, and Input; other designs remain backlog.
- [x] Keep the migration light-mode only until a dark palette is defined.

## Phase 1 — Documentation

- [x] Remove all 45 Markdown files under `docs/design-system/components/`, including `_index.md` and `_template.md`.
- [x] Keep `docs/design-system/components.md` as the only component overview; update it as code changes.
- [x] Update `AGENTS.md`, the ACH design-taste skill, and implementation notes to remove links/instructions for individual component specs.
- [x] Keep concise cross-component rules in `docs/design-system/usage-rules.md`.
- [x] Search the repository for broken links and instructions pointing to deleted component docs.

## Phase 2 — Tokens and shadcn-vue setup

- [x] Preserve primitive → semantic → component token layers and current ACH variables.
- [x] Add semantic aliases for shadcn-vue and Tailwind v4 `@theme inline`; do not add an invented dark palette.
- [x] Configure shadcn-vue for the existing Vue, CSS, utility, and component paths without replacing token files.
- [x] Install only the required Reka UI version and confirm `pnpm ls reka-ui --depth Infinity` reports one version.

## Phase 3 — Pilot components

- [x] Add shadcn-vue Button and Input, styled with ACH tokens and project assets.
- [x] Migrate Accordion to the shadcn-vue/Reka composition API and update the showcase.
- [x] Preserve multi-expand and disabled behavior; verify keyboard interaction and visible focus.

## Phase 4 — Sidebar integration

- [x] Adopt shadcn-vue Sidebar primitives while retaining ACH navigation, the `select` event, and project asset paths.
- [x] Preserve collapse, mobile drawer, backdrop, and Escape behavior through the Sidebar and Sheet primitives.
- [x] Keep Top Bar custom and connect its menu to the Sidebar provider.

## Phase 5 — Guardrails and final checks

- [x] Add `pnpm lint:tokens` for raw color literals and arbitrary Tailwind values, with narrow layout exceptions.
- [x] Run `pnpm lint`, `pnpm typecheck`, `pnpm build`, and `pnpm lint:tokens`.
- [x] Audit component-doc links and instruction references; verify all local icon/logo paths exist.
- [x] Review the final diff against the baseline.
- [x] Manually verify Accordion, Sidebar, Top Bar, Button, and Input behavior and visual states.
- [x] Merge the branch into `main` after all checks pass.

## Progress log

- Phase 3 implementation: `pnpm lint` and `pnpm typecheck` passed.
- Phase 4 implementation: `pnpm lint` and `pnpm typecheck` passed.
- Manual review: Accordion multi-expand, disabled state, and ArrowDown navigation passed; Button/Input focus and disabled states passed; Sidebar collapse, mobile drawer, backdrop, Escape, selection, and Top Bar toggle passed.
- Final gates: `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm lint:tokens`, and `pnpm ls reka-ui --depth Infinity` passed; the dependency tree contains one `reka-ui@2.11.0` package.
