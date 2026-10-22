# Component Usage Rules

- Start from an existing component listed in [`components.md`](components.md). Read its Vue source for the current API.
- Use shadcn-vue for available styled primitives and Reka UI for interaction behavior that is not covered by a local component. Do not recreate focus, keyboard, or overlay behavior without checking those primitives first.
- Keep ACH product composition and navigation content in application components; keep generic UI primitives independent of product flows.
- Style with the existing semantic and component tokens. Verify token variables in `src/styles/tokens/` before using them.
- Run `pnpm lint:tokens` after UI styling changes. Arbitrary Tailwind values are reserved for Sidebar width math and its 600px breakpoint, transition-property helpers in the shadcn primitives, and the Button's structural `has-[>svg]` selector variant.
- Use icons and logos from the project's `public/` assets. Do not add an external icon library or invent a replacement asset.
