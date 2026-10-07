---
source: https://reui.io/docs/agent-skills
bundle_url: https://mcp.reui.io/api/skills/download
upstream_installer: https://mcp.reui.io/install
upstream_version: e7aac3424a
bundle_sha256: 79becac482cf5e25ee6f3de7b75f8f8b83693bfb017643ad35a7a735b7550338
last_refreshed: 2026-10-07
reviewed_commit: unavailable — ReUI publishes a hosted bundle rather than a public repository commit
license: ReUI terms; no separate license identifier is published in the agent-skill bundle
license_url: https://reui.io/legal/license
---

# ReUI agent skills upstream

Canonical copy: `docs/ai/skills/reui/`; generated mirrors: `.agents/skills/reui/`,
`.cursor/skills/reui/`, and `.claude/skills/reui/`. This tree vendors the complete
**11-file** official shared bundle, not just `SKILL.md`: all nine `rules/*.md`
files plus `tools.md` and `SKILL.md`.

Current [Claude](https://reui.io/docs/claude.md),
[Codex](https://reui.io/docs/codex.md), and
[Cursor](https://reui.io/docs/cursor.md) guides recommend the same hosted
installer. Its reviewed implementation downloads this shared bundle, then
writes client-specific destinations and MCP configuration. There are no longer
separate agent-specific skill payloads to install: the former registry items
`@reui/skills-claude`, `@reui/skills-codex`, and `@reui/skills-cursor` returned
404 on review. Do not use those old commands to refresh this repository.

ReUI publishes the skill for free. The hosted artifact does not expose a
source repository, source commit, or separate license file/identifier. Do not
invent a Git commit or MIT license. The hosted bundle URL, version, exact raw
payload SHA-256, installer SHA-256, and upstream file hashes in
[upstream-manifest.json](./upstream-manifest.json) identify what was reviewed.
They describe upstream bytes **before** Core overlays or formatting.

## Refresh workflow

1. Read the current agent-skills and MCP `.md` docs, and inspect the upstream
   installer as text if its behavior changed. Do not pipe the remote installer
   into a runtime in this checkout: it recursively rewrites skill directories,
   writes MCP config and Cursor rules, and can store credentials locally.
2. Run `bun run skills:refresh-reui` to download and validate the complete
   official bundle in a temporary staging directory. This command preserves
   Core overlay markers, routing fields, and local references in the staged
   candidate. It does not publish canonical skills, modify MCP config, or write
   generated mirrors. Read the command's reported paths and full candidate diff.
3. Check `get_agent_skill.version`, the downloaded bundle version and hash,
   every file hash, and the upstream inventory. Read added/changed rule files,
   not just the entrypoint. Validate all file paths before any promotion; never
   write remote absolute paths, traversal paths, duplicate paths, or symlinks
   into canonical or mirrored directories.
4. Reconcile `<!-- BEGIN:core-reui-overlay -->` /
   `<!-- END:core-reui-overlay -->` blocks in all eleven upstream files. Preserve
   Core discovery fields in `SKILL.md` and `references/docs.md`. Three explicit
   entrypoint adjustments also need review after staging: the upstream version
   reminder must point to this staged workflow, the plan sentence must distinguish
   Pro blocks from Ultimate-only Motion Icons, and the table decision row must
   keep shared `DataTableResponsive` with ReUI `data-grid` for its specific
   composition. Core's exact `base-maia`, package ownership, Pro entitlement,
   authenticated registry, Lucide fallback, current data-access boundaries, and
   installed-component compatibility outrank generic upstream advice.
   Keep `tools.md`'s introduction consistent too: Pro blocks and Ultimate-only
   Motion Icons have distinct entitlements, and Core uses its runtime license
   for both MCP authentication and registry installation.
5. Promote the reviewed staged files into `docs/ai/skills/reui/`, including the
   updated manifest/provenance. Remove an obsolete upstream file only after
   reviewing the inventory. Keep local references. Do not change product UI,
   package dependencies, theme, secrets, or MCP configuration as a side effect
   of a skill refresh.
6. Run `bun run skills:sync`, then non-mutating `bun run skills:verify`, the
   focused instruction-system checks, formatting, and `git diff --check`.
   Review and commit canonical and generated mirror updates together.

For setup/API documentation use [documentation routing](./docs.md). Ordinary
component installation uses the shared UI package and existing authenticated
registry, separately from this skill-maintenance workflow.
