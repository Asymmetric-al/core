## 1. Integrate current ReUI guidance

- [x] 1.1 Review current official skills, MCP, license, registry, and Markdown documentation contracts.
- [x] 1.2 Vendor the complete official skill bundle with Core overlays and provenance.
- [x] 1.3 Configure runtime authentication and exact `base-maia` for all three supported clients.
- [x] 1.4 Document Pro installation, client reload, current docs, and safe refresh workflow.

## 2. Make readiness repeatable

- [x] 2.1 Add readiness verification with red-green tests for transport, credentials, drift, and failure behavior.
- [x] 2.2 Add staged refresh with red-green tests for safe paths, filesystem conflicts, and nonmutation.
- [x] 2.3 Regenerate skill mirrors and verify them without working-tree mutation.
- [x] 2.4 Verify live Pro discovery, Base UI API context, premium source access, and CLI preview.

## 3. Verify the integrated result

- [x] 3.1 Run focused tests, formatting, shadcn configuration guards, and instruction checks.
- [x] 3.2 Validate the OpenSpec change and requirement deltas.
- [x] 3.3 Review the final diff and record checks and any client reload limitation.

## Verification record (2026-10-07)

- Six focused suites: **104 tests passed**, including 21 readiness and 27 staged-refresh tests, with red-green evidence for new behavior and review findings.
- `bun run verify:reui` and live mode: canonical mirrors, exact registry/client configuration, authenticated Pro MCP, Base UI APIs, Pro discovery, and premium source retrieval passed.
- Live MCP additionally verified 19 tools, four prompts, worked examples, install commands, registry-slug usage validation, and the audit checklist. The server reported Pro and exact `base-maia`/Base UI context.
- shadcn `info`, paid `view @reui/settings-2`, and `add @reui/settings-2 --yes --dry-run --cwd packages/ui` passed without changing product source. The preview identified existing shared files and explicit ReUI targets that require reconciliation during future feature work.
- Live `bun run skills:refresh-reui` staged all 11 current official files with the pinned bundle hash. Canonical promotion remains a reviewed maintenance action.
- Skill mirror verification, shadcn config guardrails, OpenSpec strict validation/delta compatibility, scoped lint, formatting, Node syntax, JSON/TOML parsing, and `git diff --check` passed.
- Independent review found no remaining actionable issues. The two reported script issues (protected-tree staging and invalid MCP negotiation) were fixed with regression tests; a macOS temporary-directory alias regression is also covered.
- Clients need restart/reconnect to load changed MCP settings. Direct protocol and native Codex configuration-parser checks establish connectivity and supported configuration; they do not prove that the current chat has reloaded its registered tools.

The change remains active until accepted repository reality; no product UI was
migrated and no deployment or Git publication was performed.
