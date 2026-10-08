# ReUI Pro for Core agents

ReUI is available through the canonical `docs/ai/skills/reui` skill, its Codex,
Claude Code, and Cursor mirrors, and the authenticated `reui` MCP server.
Use it to discover and compose new UI from components, examples, and Pro blocks.
Core's shared Base UI system and exact `base-maia` style govern every addition.

## Authentication and client setup

The managed environment supplies `REUI_LICENSE_KEY` as a runtime secret.
The checked-in configurations reference it without storing its value:

| Consumer                              | Credential reference                        | Style selection           |
| ------------------------------------- | ------------------------------------------- | ------------------------- |
| Codex: `.codex/config.toml`           | `bearer_token_env_var = "REUI_LICENSE_KEY"` | `X-Reui-Style: base-maia` |
| Claude Code: `.mcp.json`              | `Bearer ${REUI_LICENSE_KEY}`                | `X-Reui-Style: base-maia` |
| Cursor: `.cursor/mcp.json`            | `Bearer ${env:REUI_LICENSE_KEY}`            | `X-Reui-Style: base-maia` |
| shadcn: `packages/ui/components.json` | `Bearer ${REUI_LICENSE_KEY}`                | `style: "base-maia"`      |

Restart or reconnect the client after configuration edits. The client process
must inherit the secret; placing it in `.env.local` does not automatically give
it to an already-running MCP client. Codex must also trust the project for its
project configuration to load. Run the verifier in the same environment as the
client to confirm its prerequisite configuration and remote access.

For local development, supply the key through your secret manager or shell
environment. A git-ignored `packages/ui/.env.local` can supply the shadcn CLI
when it runs in that package. Root `.env.local` is not automatically loaded by a
CLI whose working directory is `packages/ui`. Keep credential values out of
source, command arguments, and logs.

ReUI also supports browser OAuth or a personal MCP token. The committed setup
uses the existing Pro license for headless access. To use OAuth locally, remove
the client-side bearer setting and reconnect through its sign-in action. A
personal MCP token can replace the client credential reference, while registry
installation still uses the license key. See the current
[MCP authentication guide](https://reui.io/docs/mcp.md) and the client's guide.

Pro covers the free components/examples and premium blocks. Motion Icons require
Ultimate for discovery and installation; use Core's existing `lucide-react`
icons. Respect the tool's `locked`, `unlock`, and weak-match responses.

Authentication and purchase entitlement are separate from permission to
distribute source. Core is public and AGPL-3.0-only. Public ReUI primitives,
hooks and examples are MIT; retain their copyright/license notices. The owner
confirmed a separate agreement covering publication of Pro block source and
modified derivatives here, including contributors; see
[the recorded permission](./reui-source-license.md). Use fitting Pro blocks
alongside public components and official shadcn compositions, keeping
commercial-source provenance distinct from MIT. Do not infer template or
Ultimate icon rights outside that confirmed scope. See
[ReUI's license](https://reui.io/legal/license).

## Verify readiness

```bash
bun run verify:reui
bun run skills:verify
bun run verify:reui --live
```

The first check reads reviewed canonical provenance, skill mirrors, and
client/registry configuration without making network calls. It rejects pending
or undated skill manifests and an explicitly disabled Codex ReUI server.
Skill verification checks the complete generated trees.
Live mode requires the runtime key and checks authenticated MCP tools, Base UI
API context, Pro discovery, and premium registry source access. These commands
do not install components or edit client settings. A protocol check establishes
remote access; the MCP client still needs to load its configuration before the
tools appear in that client.

## Build with current docs and real registry items

1. Read `packages/ui/AGENTS.md`, the frontend rulebook, current shared source,
   and the ReUI skill. Confirm the existing shadcn config with
   `bunx --bun shadcn@latest info --cwd packages/ui --json`.
2. Use `compose_page` for a page or `search` for a component or Pro block. Select
   exact returned names and compare preview links before installing. Read tool
   schemas; style comes from the configured header. Verify the selected item's
   source-distribution license independently from the account's access.
3. Read `get_component` APIs and `get_examples` compositions. Use
   `validate_usage` for unfamiliar props, and reconcile live guidance against
   installed source and manifest versions.
4. Preview additions and inspect dependencies and existing-file conflicts:

   ```bash
   bunx --bun shadcn@latest add @reui/<returned-name> --yes --dry-run --cwd packages/ui
   bunx --bun shadcn@latest add @reui/<returned-name> --yes --cwd packages/ui
   ```

   Keep the authenticated registry object; free items work through it too.
   Never run `shadcn init` or blindly overwrite customized shared components.
   Inspect each registry file's explicit `target` and imports: ReUI can write
   `components/reui`, `components/examples`, and `components/blocks` independently
   of the UI alias. Existing Core data-grid ownership is
   `packages/ui/components/shadcn/data-grid`; reconcile a new registry version
   with that owner before creating another data-grid tree. CLI previews also
   catch conflicts with shared facades and customized primitives.

5. Adapt reusable composition to Core's semantic tokens, motion, real typed
   data, loading/empty/error states, and accessibility. Add appropriate shared
   exports for reusable blocks; apps consume `@asym/ui`. Retain the existing
   `DataTableResponsive` for standard tables and use ReUI data-grid where its
   specific composition is needed. Run applicable package and browser checks
   and the live audit checklist for the feature.

[ReUI's live documentation index](https://reui.io/llms.txt) lists setup guides,
components, examples, and blocks. Documentation pages serve Markdown at their
URL plus `.md`; use `/docs/components/base/<component>.md` for this repo. Read
the relevant pages on demand, including styling, RTL, and changelogs when they
apply. [The skill's documentation reference](../../ai/skills/reui/references/docs.md)
provides the full routing workflow. Inventory counts and APIs can change; the
live index and tool schemas remain the current external evidence.

## Refresh the skill safely

```bash
bun run skills:refresh-reui
```

This stages the official shared bundle and retains Core overlays for review.
It prints the candidate path and does not change canonical files, mirrors, or
MCP settings. Compare the complete candidate with `docs/ai/skills/reui`, reconcile
Core body edits and removed upstream files, and update reviewed provenance when
promoting it: set `reviewStatus: "reviewed"` and an ISO `reviewedAt` date or
timestamp in `references/upstream-manifest.json` after review. Then run
`bun run skills:sync`, `bun run skills:verify`, and `bun run verify:reui`.

The old `@reui/skills-codex`, `skills-claude`, and `skills-cursor` packages have
been replaced by the shared hosted bundle. ReUI's installer writes client files
directly; Core uses staging to maintain its canonical-source ownership. See
[upstream provenance and refresh steps](../../ai/skills/reui/references/upstream.md).
