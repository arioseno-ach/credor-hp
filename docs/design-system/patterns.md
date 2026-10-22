# Patterns

Document reusable page and interaction patterns here, with links to reference examples in `src/examples`.

## Prototype scenario switcher

The Credor workspace prototype can be reviewed in several states. A sticky switcher sits above the
top bar and controls two independent dimensions:

- **Stage** (single select): `default` → `personalising` → `complete`. The stage drives the
  banner variant, the personalisation alert, the company health card variant, the balance
  figures, and whether recent applications are empty or populated.
- **Modules** (independent toggles): `partners` shows the partner section, and `transactions`
  shows the financing table based on the user's transactions. The transactions table belongs to
  the Sales and Purchase Transaction modules, so it can be enabled in any stage.

State lives in [`src/lib/prototype/`](../../src/lib/prototype/): `types.ts` holds the shape,
`defaults.ts` the base state, `scenarios.ts` the stage presets, and `usePrototypeState.ts` the
store with URL (`?stage=&modules=`) and `localStorage` persistence. Add a new stage by adding
one preset object; components keep reading the same derived flags.

Use `?chrome=0` to hide the switcher when capturing screenshots.

## Loan simulation modal

`Start Simulation` opens the loan calculator modal, both from the main column card in the `default`
stage and from the sidebar card in the later stages. The dialog is rendered once in
`AppWorkspace.vue` and toggled through `useLoanSimulation()`.

The quote math lives in [`src/lib/loan-calculator.ts`](../../src/lib/loan-calculator.ts): the
effective rate for a term is the monthly rate prorated by day (`rate × term / 30`), the interest is
`amount × effective rate`, and the total is `amount + interest`. The comparison list renders every
available term with a bar scaled between the shortest and the longest total.

The modal header follows the design system dialog header: title on the left, close on the right, and
a bottom border. The amount always comes from the active source: manual entry in the amount tab, or
the selected invoice or purchase in the other tabs. The invoice and purchase tabs list mock items
from [`src/components/credor/financing-items.ts`](../../src/components/credor/financing-items.ts);
picking one fills the transaction amount and recalculates the summary without leaving the tab.
