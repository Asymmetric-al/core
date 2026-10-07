---
name: react-doctor
description: Run Core's pinned local React Doctor audit after React or Next.js edits; fix actionable correctness, accessibility, composition, performance, and design findings and validate exact exceptions across all eight targets. Use when the user mentions React Doctor or requests React diagnostics or cleanup.
---

# React Doctor in Core

Read `docs/guides/development/react-doctor.md` before auditing. It owns the commands, applicable-rule profile, generated boundaries, exact exception policy, and verification language.

1. Inspect the owning source, tests, package/framework contracts, and nearest `AGENTS.md`. Preserve public APIs, Base UI/base-maia, financial and permission behavior, stable drafts, and existing View Transition owners.
2. Run `bun run react-doctor:audit`. This uses React Doctor 0.9.17's public CLI on a disposable physical source copy. Read every target's JSON and stderr plus `actionable.json`; skipped checks or stale evidence are failures.
3. Prioritize demonstrated correctness and accessibility defects, then bounded composition, design, and performance improvements. Add regression coverage before substantive behavior fixes and retain pending-focus, hydration, stale-response, and financial assertions.
4. Review each suspected false positive against complete source and actual consumers. Record exact identities, reason, source/test evidence hashes, and a reconsideration condition in `docs/qa/react-doctor/exceptions.json`. Unknown or deferred debt remains actionable. Never add blanket rule ignores or manufacture a consumer.
5. Run focused native checks after each batch and Chromium/axe where controls or layouts change. Use `bun run test:react-cleanup` for the isolated synthetic real-component suite; disclose its authenticated/provider limits.
6. Finish with affected builds, formatting, workspace-aware lint/typecheck, `bunx --no-install vitest run --coverage --maxWorkers=4`, `bun run react-doctor:raw`, and `bun run react-doctor:check`. Acceptance is zero unexcepted warnings/errors across all eight completed targets with no skipped applicable checks.
7. Report actual fix/exception counts, exclusions, test/build/browser results, and material limits. Leave work local and uncommitted unless publication is separately authorized.

Scoring, sharing, telemetry, and network-backed supply-chain checks remain disabled. Do not request a numeric score or call the result a dependency-security certification. The classic `react-in-jsx-scope` requirement is disabled in the applicable profile because Next.js uses automatic JSX; the raw inventory re-enables it for transparency. Never add unnecessary imports to satisfy that obsolete requirement.

For interactive diagnostics only, `bun run react-doctor:first-party -- --full --offline --fail-on none` retains legacy argument compatibility. Its advisory exit status does not replace the strict check. No private scanner API is part of the permanent workflow.
