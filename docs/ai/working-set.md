# Working Set (AI)

Agents MUST keep this file updated during a task. Use it to build the Nia query preamble.

## Current objective
- Add/standardize repository licensing and contribution policy (AGPL-3.0-only + DCO 1.1), and ensure the running service can link users to the exact Corresponding Source (commit/tag) and license text.

## Repo scope
- repository: Asymmetric-al/core
- in-scope paths (if known):
  - apps/
  - packages/
  - tooling/
  - bun.lock
  - package.json

## Stack tags (pick from docs/ai/stack-registry.md)
- Next.js
- React
- TypeScript
- Bun
- Turborepo
- GitHub Actions

## Known identifiers (exact strings)
- files:
  - LICENSE
  - CONTRIBUTING.md
  - README.md
  - THIRD_PARTY_NOTICES.md
  - .github/workflows/ci.yml
- symbols:
  - "AGPL-3.0-only"
  - "Developer Certificate of Origin"
  - "Signed-off-by"
- routes:
  - N/A
- error strings:
  - N/A
- package ids:
  - N/A

## Expected behavior
- GitHub detects the repository license as AGPL-3.0.
- Contributors have clear guidance (DCO signoff + AGPL for contributions).
- Hosted deployments can provide users a link to the exact running source version (commit/tag) and the AGPL license text.

## Constraints
- runtime: Node.js
- tooling: Bun/Turborepo
- env/platform notes:
  - Keep diffs minimal and docs accurate (do not claim UI behavior that isn't implemented).
  - Do not introduce secrets or credentials.
  - Rules source of truth: docs/ai/rules/* (treat .cursor/rules/* as legacy).

## Verification
- git status
- (optional) gh repo view Asymmetric-al/core --json licenseInfo

## Nia query preamble (fill before calling Nia)
Repo: Asymmetric-al/core
Goal: Update license + contributing policy and (if needed) add an About/Source link for hosted deployments
Area: repo root docs + app UI entry points
Stack: Next.js, React, TypeScript, Bun, GitHub Actions
Keywords: LICENSE, "AGPL-3.0-only", CONTRIBUTING.md, "Developer Certificate of Origin", "Signed-off-by", "Help", "About"
Constraints: minimal, accurate diffs; no secrets; cite exact files + components
Evidence required: file paths + UI entry points + brief explanation
