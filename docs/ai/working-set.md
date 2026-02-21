# Working Set

- Date: 2026-02-21
- Repo: Asymmetric-al/core
- Goal: Complete T1 env migration by hardening `@asym/env` and removing runtime shared-package `process.env` access.
- Primary area: `packages/env/*`, `packages/{database,lib,config,auth,api}/**`, `turbo.json`, `.env.example`
- Constraints:
  - No hardcoded secrets.
  - Preserve behavior while replacing raw runtime env reads.
  - Keep local/preview workflows stable while enforcing staging/production requirements.
  - Use Vercel environment semantics (`VERCEL_ENV` + `VERCEL_TARGET_ENV`).
- Evidence sources used:
  - `packages/env/src/schema.ts`
  - `packages/{database,lib,config,auth,api}/**` env usage scans
  - `spec:a88ffe76-7dbb-427a-8895-674abc96ed66` (Decision 3)
  - Vercel system env docs via Nia (`VERCEL_ENV`, `VERCEL_TARGET_ENV`)
- Tooling note:
  - Nia MCP used for Vercel docs confirmation; repo scans done with `rg` + file reads.
