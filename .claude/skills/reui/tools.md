# ReUI MCP: full reference

<!-- BEGIN:core-reui-overlay -->

## Core usage

Core configures `reui` in `.mcp.json`, `.cursor/mcp.json`, and
`.codex/config.toml`. For the headless environment, all three read the existing
`REUI_LICENSE_KEY`; Claude uses `${REUI_LICENSE_KEY}`, Cursor uses
`${env:REUI_LICENSE_KEY}`, and Codex uses `bearer_token_env_var` (never a literal
placeholder in a static header). Core's account is Pro: free components and
examples plus premium blocks, with Lucide instead of Ultimate-only Motion
Icons. `get_project_context` confirms Base UI style and auth guidance; premium
search results confirm plan access. Use OAuth instead of configured bearer
credentials only on a deliberately configured browser-sign-in setup; a bearer
credential overrides stored OAuth. Never print or commit the credential.
Every configured client sends `X-Reui-Style: base-maia`; style is request
context, not a guessed tool argument. For `validate_usage`, component `name`
uses the registry slug such as `data-grid`, rather than the React export
`DataGrid`. Read the live schema and returned props before validating.
Live schemas are authoritative, and new tools or response fields may differ
from this pinned reference. Use [documentation routing](./references/docs.md)
when API capsules omit relevant context.

<!-- END:core-reui-overlay -->

The ReUI MCP (`https://mcp.reui.io`, Streamable HTTP) is free to use but needs a ReUI account, so every request is tied to an account through OAuth or a bearer credential. Free covers components and examples; Pro unlocks premium blocks, Ultimate additionally unlocks Motion Icons, and either licensed plan removes the daily request limit. It does **discovery + guidance** (search, inline APIs, page planning, validation) and never serves component source; the shadcn CLI does **installation**. Core uses the runtime license key for both headless MCP and the authenticated `@reui` registry entry in `components.json`. Goal: from the user's intent to correct, themed, data-wired ReUI code in the **fewest tokens and calls**, with **no guessing**.

## Golden path (token-optimal - follow this order)

Most tasks need 2-4 MCP calls and ZERO web fetches:

1. **`search(query, ...hints)`** -> pick the top 1-3 results. Each result already carries `install`, `previewUrl`, `docsUrl`, `componentsUsed`, `score`, `whyMatch`. The payload is complete - do not call another tool just to "confirm" a result.
2. **`get_component([...componentsUsed])`** in ONE batched call (one name or an array of up to 20) -> read each inline `api`. This **replaces** fetching docs pages. Often skippable: search responses carry `componentDigests`, a compact API contract per referenced component.
3. **`get_examples(component)`** -> install ONE returned `c-*` example, read the added files, copy the composition.
4. **`get_install_command(item)`** only to validate a name you are unsure of (results already include `install`). Run the install with the shadcn CLI (`--yes`).
5. **`get_audit_checklist()`** before declaring done.

If you already know the exact item name, skip `search`. Everything else is situational.

## The 5 task-specific tools (when to reach for each)

- **`compose_page`** - BEFORE building any full page (dashboard, settings, billing, landing). Pass the intent (and optionally the sections you want); it returns ordered sections, each with the best premium block for the intent (top pick + alternates). On a free account (or in free-only mode) it answers with `mode: "free"` and composes the same sections from free `c-*` examples instead, so the plan is always buildable. Sections with no real inventory are listed honestly in `unavailableSections` - compose those from components instead of forcing a bad block.
- **`search_icons`** - whenever you need icons, especially several. Batch up to 24 concepts in one call; each concept returns its best icons with install commands. Pass `animated: true` to get only icons that have a hover-animated Motion variant. Motion Icons are Ultimate for **discovery as well as install**: without an Ultimate credential this returns `locked: true` and zero concepts, so check the plan before promising the user icons.
- **`validate_usage`** - BEFORE writing code with component names or props you have not read in an inline `api` or an installed example. It checks planned names + props against the indexed API docs and registry item names; returns did-you-mean suggestions and per-prop documented / notDocumented verdicts. Deterministic, no inference - a notDocumented prop means stop and read the API, not push on.
- **`get_thumbnail`** - when the choice is VISUAL and the ranking has not already made it: 2 or more candidates within about 15 score points. When the top hit leads by a wide margin, or `missedTerms` already rules the others out, skip it; an image costs roughly 10 times a result row. It returns the hosted preview image as image content so you can look yourself; pass up to 4 names in one call to compare `compose_page` alternates side by side before installing any of them. To let the USER see something, share the item's `thumbnail` and `previewUrl` instead - this tool is for your own eyes, and a client that cannot render images gets the URLs in the text block.
- **`get_agent_skill`** - when the agent has no local ReUI skill (a cloud or tools-only client), or to check whether the installed one is stale: it returns the current workflow inline plus the installer command, and its `version` can be compared with the version stamped at the top of your local `SKILL.md`.

## All 19 tools

`search`, `get_block`, `get_example`, `get_icon`, `get_thumbnail`, `list_block_groups`, `list_block_categories`, `list_example_categories`, `list_icon_categories`, `list_components`, `get_component`, `get_examples`, `search_icons`, `compose_page`, `validate_usage`, `get_install_command`, `get_project_context`, `get_agent_skill`, `get_audit_checklist`. The MCP serves the full parameter schemas; do not guess parameters beyond them.

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
- An inline `api` is not always the whole API: a very large one is trimmed on heading boundaries to fit your context, and the response names every dropped heading in `sectionsOmitted` plus a `next` hint for re-reading one. Never treat a trimmed capsule as complete; `validate_usage` still checks the FULL API.
- Icon results and `get_icon` include `animated: true` and `installAnimated` when a hover-animated Motion variant exists (animated: `@reui/icons/animated/<style>/<name>`; static: `@reui/icons/default/<style>/<name>`).
- Blocks and `c-*` examples carry `thumbnail`, an absolute URL to a hosted preview image (3:2; blocks 1080x720, examples 900x600, light theme). Show the top 2 or 3 as markdown images linked to `previewUrl` so the user picks by eye; use `get_thumbnail` when YOU need to see them. Components and icons have no thumbnail.
- Each result carries `missedTerms`, the words from YOUR query it does not mention (omitted when it matches them all). A high score with 3 missed words is a near miss wearing a good score: read this before `get_thumbnail`, it is far cheaper.
- `weakMatch: true` means the top result misses more of the query's words than it matches; `unmatchedTerms` lists the words none of the top results mention and `weakMatchNote` says what to do. Stop and re-search with the registry's own words, or compose from components, instead of installing the top hit.
- On a free account `premiumPicks` (a sibling of `results`, never inside it) lists up to 3 premium blocks that fit the query more closely than the free answer, as previews with no install command, plus `unlock` with the plan and a pricing link. Mention the upgrade at most once per conversation, then keep building with what the plan covers. `weakMatch` and `premiumPicks` can appear together: the free answer is weak AND a premium block fits; `weakMatchNote` says so.
- Results are scoped to the caller's plan, so a free account never sees a block or icon it could not install. When a search matches only hidden premium items, the answer says so (`locked`, `requiredPlan`, `premiumMatches`) instead of pretending the registry is empty.

## Error playbook

- **401** - the MCP requires a signed-in ReUI account, on every request (there is no anonymous access). The client prompts "Sign in with ReUI" (OAuth) on first use; a free account is created if needed. For headless/CI, pass a personal token (`reui_pat_...`, created at https://reui.io/account/mcp?ref=skill) as `Authorization: Bearer`.
- **locked result** - a valid account whose plan does not cover the item. This is NOT an error and NOT a 403: it comes back as a normal HTTP 200 result carrying `locked: true` and `requiredPlan` (`"pro"` for premium blocks, `"ultimate"` for Motion Icons). Keep working with the free components and `c-*` examples, and point the user at https://reui.io/pricing?ref=skill if they want the locked item.
- **daily allowance reached** - a free account has a per-account, per-UTC-day allowance on tool calls (ReUI sets the number and can change it, so read it from the message and never assume one). It comes back as a normal tool RESULT with `isError: true` at HTTP 200: not an HTTP error status, no back-off header to honor, and no per-minute limit to wait out. Retrying the same call just spends the next unit, so surface the message (it carries the reset and the upgrade link) to the user instead of looping. The count resets at UTC midnight, and using a Pro or Ultimate license as the MCP credential removes the limit.
- **not found** (`found: false`) - use the returned `suggestions`, or `search`. Never run a fabricated install command.

## Fallbacks

- No ReUI MCP: `npx shadcn@latest search @reui -q "..."` then `add` (generic, no scoring / inline API).
- The shadcn project's own MCP also works over the `@reui` registry: https://ui.shadcn.com/docs/mcp.

Per-agent MCP setup: https://reui.io/docs/mcp?ref=skill
