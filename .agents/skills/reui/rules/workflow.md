# Workflow: find -> install -> read API -> adapt

The core ReUI loop. The MCP tells you what to install and gives you the API; the shadcn CLI installs it; you turn the installed files into correct, themed, data-wired code by **reuse**, not redesign.

## 1. Find (ReUI MCP `search` / `compose_page`)

**Full multi-section page ask?** Call `compose_page(intent, sections?)` FIRST, before searching block-by-block. It returns ordered sections, each with the best block for the intent (top pick + alternates); sections listed in `unavailableSections` have no real inventory - compose those from components, do not force a bad block.

For everything else, call `search` with the user's intent. Pass structured hints whenever you can infer them - you are an LLM, so do the parsing the server cannot:

- `type`: `"component"` (one of the 17 building blocks), `"example"` (a c-\* use-case), `"block"` (a full page/section), `"icon"`.
- `component`: the ReUI component the request implies (`"data-grid"`, `"kanban"`, ...).
- `category`, `features` (e.g. `["sortable","pagination"]`), `free`.

Example: "build a users management page with filters" -> `search({ query: "users management page with filters", type: "block", component: "data-grid", features: ["filters"] })`.

Each result has `install`, `previewUrl`, `docsUrl`, `componentsUsed`, `score`, `termCoverage`, and `whyMatch`. `score` is relative to the top hit (the top is ~100 by construction), not an absolute quality - compare results to each other, and show the user the top options if several score closely; do not silently guess. A low `termCoverage` means a weak match even with a high score - rephrase or widen.

## 2. Install (shadcn CLI)

Run the result's `install` command from the project root, non-interactively:

```bash
npx shadcn@latest add @reui/<name> --yes
```

The CLI reads `components.json`, installs the correct base+style variant, resolves `registryDependencies` (a block pulls in its components), installs npm deps, and rewrites aliases. Do not pass the base/style. See [cli.md](./cli.md).

## 3. Read the API (do not guess props)

Before writing code against any component an item uses:

1. The item's `componentDigests` already give a 1-line contract per component - often enough to wire it. For the full API, call **`get_component(names)`** with ALL of `componentsUsed` in ONE call (it accepts an array) and read each inline `api` - no web fetch. `docsUrl` and the `/llms.txt` index are the fallback.
2. Call **`get_examples(name)`** for the free `c-*` examples of that component; install one and **read the added files** to copy the exact composition. This is the fastest correct path - the example shows real wiring you adapt, not invent.
3. About to write a prop you did not see in an `api` or installed file? Run **`validate_usage`** BEFORE writing the code - per-prop documented / notDocumented verdicts plus did-you-mean suggestions. notDocumented means read the API, not push on.

## 4. Adapt (reuse-first) - do not skip

Installing files is not the end, and redesigning them defeats the point. First note the project's **base** so you write the right API - read `components.json` -> `style` and take the segment before the first `-` (`base-nova` -> Base UI, `radix-nova` -> Radix UI), see [components.md](./components.md). After `add`:

1. **Read the added files**; keep the composition intact. For a block, verify the components are wired correctly (for `data-grid`: a `useReactTable` instance passed as `table`, `recordCount` set - see [components.md](./components.md)).
2. **Replace demo data with the user's real data** via typed structures (see [adapting.md](./adapting.md)).
3. **Fix icon imports** to the project's icon library (see [icons.md](./icons.md)).
4. **Align styling** to semantic tokens and the active theme - no raw colors (see [styling.md](./styling.md)).
5. **Validate before finalizing**: if your adaptation introduced components or props you did not read in an `api` or example, run `validate_usage` on them.
6. **Hit the craft bar** - clear hierarchy, deliberate density, the empty / loading / error states, subtle motion, and mobile-first responsiveness (see [craft.md](./craft.md)). Generic-looking output means you under-reused the design, not that it needs restyling.
7. **Pass the quality gates** (security, a11y, scroll) - call the MCP `get_audit_checklist` tool and clear every item (see [quality.md](./quality.md)).
8. **Typecheck / lint**.

## If no single block fits

Compose from components (`compose_page` tells you which sections have no block inventory via `unavailableSections`). `search` the components you need, read each `get_component` API, install a worked `get_examples` example for each, and assemble by adapting those examples. A block in the same category is a useful reference - install it and read its files to see how ReUI composes those components, then adapt.
