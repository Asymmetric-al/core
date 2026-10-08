# ReUI documentation routing for Core

Use the authenticated ReUI MCP for live registry matching, page composition,
inline APIs, worked examples, and usage validation. Use official documentation
for setup, architectural constraints, styling/RTL, complete API sections,
changelogs, and recovery when an API capsule is incomplete or MCP unavailable.
Local instructions and installed source still govern Core's current behavior.

## Start with the index

[llms.txt](https://reui.io/llms.txt) is the current navigation index: setup and
agent guides, every primitive's API, example/block categories, templates, and
plan/license links. Fetch it when choosing documentation rather than maintaining
an assumed component count or stale URL inventory. It distinguishes free
primitives/examples, Pro blocks, Ultimate icons, and templates. The larger
[llms-full.txt](https://reui.io/llms-full.txt) lists every block/example; use it
for a concrete catalog question when MCP search is unavailable, then verify the
item before installation. Neither index is a component's full API.

Every listed documentation page also serves plain Markdown at its URL plus
`.md`. Prefer those readable pages over scraping the application shell. For
Core component APIs, use **`/docs/components/base/<name>.md`**, the Base UI
variant. Never use the Radix twin to infer Core composition or props. MCP
requests should send `X-Reui-Style: base-maia` or `?style=base-maia`, so returned
API and preview links resolve to Core's primitive base; `get_project_context`
confirms the style.

## Read by purpose

| Task                                              | Official source                                                                                                            | Core application                                                                                                                                                                                      |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Understand or refresh agent workflow              | [Agent Skills](https://reui.io/docs/agent-skills.md)                                                                       | Vendor the full shared bundle through [upstream.md](./upstream.md), then reconcile overlays and sync mirrors.                                                                                         |
| MCP authentication, discovery, plans, recovery    | [MCP](https://reui.io/docs/mcp.md)                                                                                         | Every call authenticates. Pro includes blocks; a `locked` icon result needs Ultimate. Keep process secrets outside tracked config.                                                                    |
| Client credential interpolation                   | [Codex](https://reui.io/docs/codex.md), [Claude](https://reui.io/docs/claude.md), [Cursor](https://reui.io/docs/cursor.md) | Use each client's actual environment syntax; configured bearer credentials override OAuth.                                                                                                            |
| Initial registry/base/aliases                     | [Get Started](https://reui.io/docs/get-started.md), [Registry](https://reui.io/docs/registry.md)                           | Inspect the existing setup; preserve exact `base-maia` and install only through `packages/ui`. `@reui` is a registry namespace, not an npm scope.                                                     |
| Premium installs and monorepo environment loading | [License Setup](https://reui.io/docs/license-setup.md)                                                                     | Keep the authenticated object. Shell environment works; package-local `.env.local` is needed if the key is not already exported. Root `.env.local` alone is not auto-loaded by package-scoped shadcn. |
| Semantic status tokens                            | [Styling](https://reui.io/docs/styling.md)                                                                                 | Add justified shared semantic tokens to the existing `packages/ui/styles/globals.css`, with contrast checks; preserve Core token scales.                                                              |
| Bidirectional layouts                             | [RTL](https://reui.io/docs/rtl.md)                                                                                         | Read before adding RTL behavior; inspect actual output and layout/drag/scroll behavior instead of assuming conversion covers custom code.                                                             |
| API/dependency changes during maintenance         | [Changelog](https://reui.io/docs/changelog.md), the relevant Base UI API page                                              | Compare current source/manifests with live docs before a component/dependency upgrade. A skill refresh alone does not upgrade product components.                                                     |
| Source reuse and redistribution conditions        | [License](https://reui.io/legal/license), [plans](https://reui.io/pricing)                                                 | Reuse within the account's actual entitlement; never expose a key in browser code. Templates are page downloads, not registry item names.                                                             |

## API reading loop

1. Read the existing component and owning `packages/ui` instructions. For new
   work, use MCP `search` or `compose_page`, then batch `get_component` for the
   returned `componentsUsed`. Reuse `componentDigests` when they already answer
   the question; inspect `sectionsOmitted` and follow the returned `next` hint
   for omitted sections rather than treating a capsule as the complete API.
2. If MCP is unavailable or still lacks the needed detail, fetch the relevant
   Base UI Markdown API page via the index. Read props, composition, examples,
   dependencies, and the section for the intended feature. Fetch linked Base UI,
   TanStack, or headless-library docs only for the missing dependency details.
3. Use `get_examples` and a staged/non-overwriting CLI install to read a worked
   composition. The MCP supplies guidance/metadata, not source files. Read the
   files the CLI adds before adapting them to real typed data.
4. Verify new names/props with `validate_usage` where available. For existing
   components the installed version's source/types may differ from today's
   live API: resolve that deliberately before changing or upgrading them.
5. Share the relevant returned preview and API docs links with the user when
   presenting choices or component behavior. Run the live audit checklist and
   the applicable Core tests/UI checks before considering the feature done.

The reviewed bundle documents 24 primitives, including cascader, code-block,
event-calendar, gantt, icon-tile, signature-pad, and time-picker. File upload is
a documented pattern, not an additional primitive. New `data-grid` uses TanStack
v9 `useTable` plus `dataGridFeatures`; new Filters uses a boolean query tree.
Do not copy the former v8/flat-filter examples into those APIs. Core already
has shared `DataTableResponsive` and data access conventions; prefer them for
standard app tables and integrate specialized ReUI composition through the
shared package.
