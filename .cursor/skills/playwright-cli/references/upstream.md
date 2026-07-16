---
source_name: microsoft/playwright-cli
source_url: https://github.com/microsoft/playwright-cli
source_type: github
upstream_path: skills/playwright-cli/SKILL.md
reviewed_commit: eee5a185c98e6b04d88f580d45a854e9692ab50b
license: Apache-2.0
last_reviewed: 2026-07-15
---

# Upstream: playwright-cli

- **Copyright:** Microsoft Corporation
- **License:** Apache License 2.0; see the upstream
  [`LICENSE`](https://github.com/microsoft/playwright-cli/blob/eee5a185c98e6b04d88f580d45a854e9692ab50b/LICENSE).
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
