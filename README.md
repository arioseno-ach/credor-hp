# ACH Prototype

An ACH component showcase and prototyping workspace built with Vue 3, TypeScript, Vite, and Tailwind CSS v4. It demonstrates reusable interface components, layout patterns, and design tokens used by the project.

## Getting started

Install dependencies and start the local development server:

```sh
pnpm install
pnpm dev
```

Vite prints the local URL after the server starts.

## Available scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Vite development server. |
| `pnpm build` | Run Vue type checks and create a production build. |
| `pnpm preview` | Preview the production build locally. |
| `pnpm lint` | Run Oxlint. |
| `pnpm lint:tokens` | Check Vue component styles for raw colors and unapproved arbitrary Tailwind values. |
| `pnpm typecheck` | Run Vue-aware TypeScript checks. |

## Component showcase

The workspace currently includes examples for Alerts, Accordions, and Controls. The Controls showcase includes the ACH Button color and size variants alongside input examples. Reusable UI primitives and layout components live under `src/components`.

## Project structure

```text
src/
  components/       Reusable UI primitives and composed layout components
  examples/         Component showcase examples
  styles/tokens/    Primitive, semantic, and component design tokens
docs/
  design-system/    Component, token, pattern, and usage guidance
```

## Design-system documentation

- [Components](docs/design-system/components.md) — implemented components and source locations
- [Tokens](docs/design-system/tokens.md) — token layers and styling guidance
- [Patterns](docs/design-system/patterns.md) — documented page and interaction patterns
- [Usage rules](docs/design-system/usage-rules.md) — shared component and composition constraints
