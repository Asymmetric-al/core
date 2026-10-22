---
source_name: cloudflare/security-audit-skill (security-audit)
source_url: https://github.com/cloudflare/security-audit-skill/tree/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit
source_type: github
upstream_path: skills/security-audit/
skills_lock_hash: b074953afeb35cd146629a77c1d516e6a6cb07ee1b3503563bd197021c40a2f8
last_reviewed: 2026-10-22
---

# Upstream: security-audit

Canonical copy in this repo: `docs/ai/skills/security-audit/` (mirrored to `.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/cloudflare/security-audit-skill
- **Ref:** `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8`
- **Commit reviewed:** `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8`
- **Upstream path:** `skills/security-audit/`
- **Lock skillPath:** `skills/security-audit/SKILL.md`
- **Computed hash:** `b074953afeb35cd146629a77c1d516e6a6cb07ee1b3503563bd197021c40a2f8`

## Refresh from upstream

1. Run `bun run skills:refresh-security-audit`.
2. The script clones `https://github.com/cloudflare/security-audit-skill.git` at `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8`, verifies the upstream skill directory exists, copies the full skill directory into `docs/ai/skills/security-audit/`, and updates this metadata.
3. Run `bun run skills:sync` and `bun run skills:verify` to refresh runtime mirrors.

## Notes for maintainers

- Do not copy secrets, tokens, or environment-specific identifiers into skill content.
- Preserve repo-local notes in this `references/` directory when refreshing.

## Reviewed source inventory

- AI-AND-LLM.md
- ATTACK-CLASSES.md
- CLIENT-SIDE.md
- CLOUD-AND-DEPLOYMENT.md
- DATA-ISOLATION-AND-LIFECYCLE.md
- DESKTOP-MOBILE-AND-LOCAL-IPC.md
- HUNTING.md
- MEMORY-SAFETY-AND-BINARY.md
- PROTOCOLS-RPC-AND-MESSAGING.md
- RECONNAISSANCE.md
- RESOURCE-EXHAUSTION-AND-AVAILABILITY.md
- SKILL.md
- SUPPLY-CHAIN-AND-RELEASE.md
- VALIDATION-AND-REPORTING.md
- WEB-PROTOCOL-AND-AUTH.md
- report-schema.json
- validate-coverage-ledger.cjs
- validate-coverage-ledger.test.cjs
- validate-findings.cjs
- validate-findings.test.cjs

License: MIT; copyright 2025-2026 Cloudflare, Inc.. The notice is preserved in references/LICENSE.md.
The marked Core overlay is the only semantic adaptation. Validators and schema retain their upstream contracts.
Refresh never executes imported code; reviewed validator tests run explicitly under WSL Node.
