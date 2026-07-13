# ReUI MCP: full reference

The ReUI MCP (`https://mcp.reui.io`, Streamable HTTP) is free - it needs no license and no auth header at all. It does **discovery + guidance** (search, inline APIs, page planning, validation) and never serves source code; the shadcn CLI does **installation**, and the license key lives only there (the `@reui` entry in `components.json`, backed by `.env.local`). In this repo it is configured as `reui` for Claude Code (`.mcp.json`), Cursor (`.cursor/mcp.json`), and Codex (`.codex/config.toml`). Goal: from the user's intent to correct, themed, data-wired ReUI code in the **fewest tokens and calls**, with **no guessing**.

## Golden path (token-optimal - follow this order)

Most tasks need 2-4 MCP calls and ZERO web fetches:

1. **`search(query, ...hints)`** -> pick the top 1-3 results. Each result already carries `install`, `previewUrl`, `docsUrl`, `componentsUsed`, `score`, `whyMatch`. The payload is complete - do not call another tool just to "confirm" a result.
2. **`get_component([...componentsUsed])`** in ONE batched call (one name or an array of up to 20) -> read each inline `api`. This **replaces** fetching docs pages. Often skippable: search responses carry `componentDigests`, a compact API contract per referenced component.
3. **`get_examples(component)`** -> install ONE returned `c-*` example, read the added files, copy the composition.
4. **`get_install_command(item)`** only to validate a name you are unsure of (results already include `install`). Run the install with the shadcn CLI (`--yes`).
5. **`get_audit_checklist()`** before declaring done.

If you already know the exact item name, skip `search`. Everything else is situational.

## The 5 task-specific tools (when to reach for each)

- **`compose_page`** - BEFORE building any full page (dashboard, settings, billing, landing). Pass the intent (and optionally the sections you want); it returns ordered sections, each with the best premium block for the intent (top pick + alternates). Sections with no real inventory are listed honestly in `unavailableSections` - compose those from components instead of forcing a bad block.
- **`search_icons`** - whenever you need icons, especially several. Batch up to 24 concepts in one call; each concept returns its best icons with install commands. Pass `animated: true` to get only icons that have a hover-animated Motion variant.
- **`validate_usage`** - BEFORE writing code with component names or props you have not read in an inline `api` or an installed example. It checks planned names + props against the indexed API docs and registry item names; returns did-you-mean suggestions and per-prop documented / notDocumented verdicts. Deterministic, no inference - a notDocumented prop means stop and read the API, not push on.
- **`whats_new`** - when your registry knowledge might be stale (a name 404s, the user mentions an item you don't know). Returns items added/removed per build, newest first.
- **`report_issue`** - when an installed item is actually broken (bad source, wrong dependency, broken preview). Goes straight to the ReUI team; rate-limited 5/hour. Not for usage questions.

## All 19 tools

`search`, `get_block`, `get_example`, `get_icon`, `list_block_groups`, `list_block_categories`, `list_example_categories`, `list_icon_categories`, `list_components`, `get_component`, `get_examples`, `search_icons`, `compose_page`, `validate_usage`, `whats_new`, `report_issue`, `get_install_command`, `get_project_context`, `get_audit_checklist`. The MCP serves the full parameter schemas; do not guess parameters beyond them.

## Token + speed rules

- **Batch `get_component`** - ONE call with the whole `componentsUsed` array, never N calls. Skip it entirely when `componentDigests` already answers the question.
- **Read source by installing** - the MCP serves no source. To read or analyze an item's real code, install it with the shadcn CLI and open the local files. Learn an API from the inline `api` / `componentDigests`, never by reading raw source.
- **Infer `search` hints yourself** (`type`, `component`, `category`, `features`, `free`) - hints shrink the result set and the tokens. Keep `limit` low; one right result beats ten.
- Run independent calls (and the shadcn install) concurrently in one turn - serial tool calls are the main source of slowness.
- Don't repeat a search for the same intent; don't call `list_*` to "see everything" - `search` is the entry point, `list_*` is only for browsing a taxonomy the user explicitly wants to explore.
- Prefer `get_component`'s inline `api` over `docsUrl` / `/llms.txt`. Fetch a web page only as a last resort.

## Result shapes (so you don't re-fetch)

- `score` is 0-100 RELATIVE to the top hit (the top is ~100 by construction), not absolute - compare results to each other.
- `termCoverage` (0-1) is the share of the query the item matched - low means a weak match even if the score looks high; rephrase or widen the search.
- Each result carries `whyMatch`, `install`, docs/preview URLs, and a `free` flag; premium items carry `requiredPlan` (`"pro"` for blocks, `"ultimate"` for icons).
- `componentDigests` is a top-level map: a compact API contract per referenced component - often enough to wire an item without a `get_component` call.
- Icon results and `get_icon` include `animated: true` and `installAnimated` when a hover-animated Motion variant exists (animated: `@reui/icons/animated/<style>/<name>`; static: `@reui/icons/default/<style>/<name>`).

## Error playbook

- **401 / 403** - install-time only: a premium install without a valid `REUI_LICENSE_KEY`, or a plan that does not cover the item (blocks Pro+, icons/templates Ultimate). Point to https://reui.io/account (key) or https://reui.io/pricing (upgrade). The MCP itself never authenticates - connecting and every tool are free.
- **429** - rate limited (120 requests/min per IP); back off, honor `Retry-After`.
- **not found** (`found: false`) - use the returned `suggestions`, or `search`; check `whats_new` if you suspect a stale name. Never run a fabricated install command.

## Fallbacks

- No ReUI MCP: `npx shadcn@latest search @reui -q "..."` then `add` (generic, no scoring / inline API).
- The shadcn project's own MCP also works over the `@reui` registry: https://ui.shadcn.com/docs/mcp.

Per-agent MCP setup: https://reui.io/docs/mcp
