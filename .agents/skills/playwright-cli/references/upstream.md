---
source_name: microsoft/playwright-cli
source_url: https://github.com/microsoft/playwright-cli
source_type: github
upstream_path: skills/playwright-cli/SKILL.md
reviewed_commit: b1a5903c5b633b8c9f843ad7b629c2a78437040c
license: Apache-2.0
last_reviewed: 2026-10-22
---

# Upstream: playwright-cli

- **Copyright:** Microsoft Corporation
- **License:** Apache License 2.0; see the upstream
  [`LICENSE`](https://github.com/microsoft/playwright-cli/blob/b1a5903c5b633b8c9f843ad7b629c2a78437040c/LICENSE).
- **Official docs:** https://playwright.dev/docs/getting-started-cli and
  https://playwright.dev/agent-cli/skills

No upstream file is vendored verbatim. Core's adapter is a shortened,
repository-specific workflow that replaces npm/npx installation guidance with
Bun one-off execution, separates interactive CLI evidence from committed
`@playwright/test` coverage, and adds Core's dev-server, auth, artifact, secret,
accessibility, and Next.js-devtools boundaries.

The CLI currently performs an exact-content comparison between its bundled
generic skill and same-named `.agents`/`.claude` skills. Core's intentional
adapter therefore produces a compatibility notice. Do not use the CLI's
`install --skills` repair command in this repository; update this canonical
source and regenerate mirrors instead.

## Refresh workflow

1. Inspect the current official skill, docs, commit, release behavior, and
   license.
2. Verify commands against `playwright-cli --help` (or the Bun one-off prefix)
   and compare them with Core's current Playwright Test configuration.
3. Adapt only stable browser-automation workflow changes; update the reviewed
   commit and date above.
4. Run `bun run skills:sync` and `bun run skills:verify`.

This skill is not updated by `bun run skills:refresh-upstream` today.

## Reviewed refresh 2026-10-22

Reviewed complete official skill and reference inventory at `b1a5903c5b633b8c9f843ad7b629c2a78437040c`. The existing Core command set still matches the official source. Added bounded regex snapshot lookup while retaining the compact adapter, Bun one-off execution, generated-mirror protection, ignored artifact paths and separation from committed Playwright Test coverage. No generic shell token-extraction example or automatic PR-media upload workflow is imported. CLI commands were source-checked; no browser was launched during this refresh.
