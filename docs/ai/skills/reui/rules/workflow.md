# Workflow: find -> install -> read API -> adapt

<!-- BEGIN:core-reui-overlay -->

## Core usage

Use current MCP schemas and Pro access, keep exact `base-maia`, and install
into `packages/ui` with Bun and `--cwd packages/ui`. Returned npm commands are
item-name evidence; adapt their runner and target to this repo. API/docs links
must refer to Base UI, and scoped `.md` docs fill gaps in MCP capsules. Keep
Core's shared tables and existing API/database ownership. See
[Core workflow](../SKILL.md#this-repository-asymmetric-alcore) and
[documentation routing](../references/docs.md).

<!-- END:core-reui-overlay -->

The core ReUI loop. The MCP tells you what to install and gives you the API; the shadcn CLI installs it; you turn the installed files into correct, themed, data-wired code by **reuse**, not redesign.

## When to reach for ReUI vs plain shadcn

- A full page or section (dashboard, billing, auth, pricing, settings): `compose_page` first (step 1).
- A standard app table: Core `DataTableResponsive`; use ReUI `data-grid` for its specific documented composition through the shared UI owner.
- A drag-and-drop board: the `kanban` component.
- Column filters, a date range, a tree, a stepper and the like: the matching ReUI component.
- A single generic control shadcn already has (Button, Dialog, Select): plain shadcn.

## 1. Find (ReUI MCP `search` / `compose_page`)

**Full multi-section page ask?** Call `compose_page(intent)` FIRST (`sections`, 1 to 10, caps how many sections, default 8), before searching block-by-block. It returns ordered sections, each with the best block for the intent (top pick + alternates); on a free account it answers `mode: "free"` and fills the same sections with free `c-*` examples instead, so the plan is always buildable. Sections listed in `unavailableSections` have no real inventory - compose those from components, do not force a bad block.

For everything else, call `search` with the user's intent. Pass structured hints whenever you can infer them - you are an LLM, so do the parsing the server cannot:

- `type`: `"component"` (a ReUI component), `"example"` (a c-\* use-case), `"block"` (a full page/section), `"icon"`.
- `component`: the ReUI component the request implies (`"data-grid"`, `"kanban"`, ...).
- `category`, `free`.

Example: "build a users management page with filters" -> `search({ query: "users management page with filters", type: "block", component: "data-grid" })` (on a free account use `type: "example"`).

Each result has `install`, `previewUrl`, `docsUrl`, `componentsUsed`, `score`, `termCoverage`, and `whyMatch`. `score` is relative to the top hit (the top is ~100 by construction), not an absolute quality - compare results to each other, and show the user the top options if several score closely; do not silently guess. A low `termCoverage` means a weak match even with a high score - rephrase or widen.

**Pick with the guidance, not the title.** Look-alikes are common (dialog, sheet and drawer; dozens of data-grid examples and app shells). Before installing, read the item's guidance: `get_component` returns `whenToUse` and `whenNotToUse`, `get_example` and `get_block` return `bestFor` (what sets the item apart from its siblings), `agentNotes` and `whenNotToUse`, and a block adds `categoryGuidance` (its category's key note), and `get_examples` rows carry `bestFor`. Each `whenNotToUse` entry names the item to use instead and its `type` (`component` -> `get_component`, `example` -> `get_example`, `block` -> `get_block`, `block-category` "<group>/<category>" -> `search({ query, type: "block", category: "<category>" })`); when the user's situation matches its `when`, switch. Apply every `agentNotes` line before you ship: it names the real identifiers to replace or wire (sample data, stubbed actions, required props). An item with no guidance yet has none of these keys; fall back to its description and thumbnail.

Results are scoped to the account's plan, so you are never shown an item the user could not install: blocks need Pro, Motion Icons need Ultimate. A `type` hint the plan cannot use (or a query whose only matches are premium) comes back as a normal HTTP 200 answer with `locked: true` and `requiredPlan` rather than results - that is a paywall, not a missing item, so switch to free components and `c-*` examples and mention https://reui.io/pricing?ref=skill.

**Show the preview.** List every item with its `previewUrl` (a live preview page). Where a result carries `thumbnail` (blocks, `c-*` examples and icons), show the image as markdown linked to `previewUrl`, so the user sees it before you install.

## 2. Install (shadcn CLI)

Run the result's `install` command from the project root, non-interactively:

```bash
npx shadcn@latest add @reui/<name> --yes
```

The CLI reads `components.json`, installs the correct base+style variant, resolves `registryDependencies` (a block pulls in its components), installs npm deps, and rewrites aliases. Do not pass the base/style. See [cli.md](./cli.md).

## 3. Read the API (do not guess props)

Before writing code against any component an item uses:

1. The item's `componentDigests` already give a 1-line contract per component - often enough to wire it. For the deeper API, call **`get_component(names)`** with ALL of `componentsUsed` in ONE call (it accepts an array) and read each inline `api` - no web fetch. A very large API is trimmed on heading boundaries to fit your context and lists what it dropped in `sectionsOmitted`; when the part you need is in that list, re-read it as the response's `next` hint says rather than guessing. `validate_usage` always checks the FULL API, so it still catches a prop you invented from a trimmed capsule. **Share the component's `docsUrl`** (its API documentation page) with the user whenever you work with that component's API, so they have the full reference; the `/llms.txt` index is a further fallback.
2. Call **`get_examples(name)`** for the free `c-*` examples of that component; install one and **read the added files** to copy the exact composition. This is the fastest correct path - the example shows real wiring you adapt, not invent.
3. About to write a prop you did not see in an `api` or installed file? Run **`validate_usage`** BEFORE writing the code - per-prop documented / notDocumented verdicts plus did-you-mean suggestions. notDocumented means read the API, not push on.

## 4. Adapt (reuse-first) - do not skip

Installing files is not the end, and redesigning them defeats the point. Write against your project's base (see [components.md](./components.md)). After `add`:

1. **Read the added files**; keep the composition intact. For a block, verify the components are wired correctly (for `data-grid`: a `useTable({ features: dataGridFeatures, ... })` instance passed as `table`, `recordCount` set - see [components.md](./components.md)).
2. **Replace demo data with the user's real data** via typed structures (see [adapting.md](./adapting.md)).
3. **Fix icon imports** to the project's icon library (see [icons.md](./icons.md)).
4. **Align styling** to the active theme: semantic tokens for anything that carries meaning, raw palette only for categorical identity and always with its `dark:` pair (see [color.md](./color.md)).
5. **Validate before finalizing**: if your adaptation introduced components or props you did not read in an `api` or example, run `validate_usage` on them.
6. **Hit the craft bar** - clear hierarchy, deliberate density, the empty / loading / error states, motion that leaves installed components alone, and mobile-first responsiveness (see [layout.md](./layout.md) and [motion.md](./motion.md)). Generic-looking output means you under-reused the design, not that it needs restyling.
7. **Pass the quality gates** (security, a11y, scroll) - call the MCP `get_audit_checklist` tool and clear every item (see [quality.md](./quality.md)).
8. **Typecheck / lint**.

## If no single block fits

Compose from components (`compose_page` tells you which sections have no block inventory via `unavailableSections`). `search` the components you need, read each `get_component` API, install a worked `get_examples` example for each, and assemble by adapting those examples. A block in the same category is a useful reference - install it and read its files to see how ReUI composes those components, then adapt.
