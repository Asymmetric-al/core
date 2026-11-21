---
name: react-doctor
description: Run Core's pinned, advisory React Doctor audit after React or Next.js edits; review the findings in the files you changed, fix confirmed correctness, accessibility, composition, performance, and design defects with tests, and report the rest. Use when the user mentions React Doctor or requests React diagnostics or cleanup.
---

# React Doctor in Core

Read `docs/guides/development/react-doctor.md` before auditing. It owns the commands, applicable-rule profile, generated boundaries, triage rules, accepted patterns, and verification language. The audit is advisory: it has no acceptance target, and no hook or CI check runs it.

1. Inspect the owning source, tests, package/framework contracts, and nearest `AGENTS.md`. Preserve public APIs, Base UI/base-maia, financial and permission behavior, stable drafts, and existing View Transition owners.
2. After React edits, run `bun run react-doctor:audit -- --changed-since=origin/develop`, or name the branch's actual base. It uses React Doctor 0.9.18's public CLI on a disposable physical source copy and prints its evidence directory. Read `summary.md` first, then `findings.json` and any target's JSON or stderr you need. Exit 1 with `React Doctor audit evidence is unavailable` means the scan did not complete: report that, never a result.
3. Triage the findings listed for your changed files. Prioritize demonstrated correctness and accessibility defects, then bounded composition, design, and performance improvements. Repair a confirmed defect at its owner with a focused behavior test written first, keeping pending-focus, hydration, stale-response, and financial assertions, or open an issue that tracks it.
4. Review each suspected false positive against complete source and actual consumers. A false positive or accepted pattern needs no record: leave it in the report. Never disable or narrow a rule, add an inline disable or blanket ignore, or manufacture a consumer to hide a finding. Check the guide's accepted patterns before acting on an `unused-dependency` finding.
5. Run focused native checks after each batch and Chromium/axe where controls or layouts change. Use `bun run test:react-cleanup` for the isolated synthetic real-component suite; disclose its authenticated/provider limits.
6. For a cleanup batch, finish with affected builds, formatting, workspace-aware lint/typecheck, `bunx --no-install vitest run --coverage --maxWorkers=4`, and the changed-files audit again. Run `bun run react-doctor:raw` when the fully unsuppressed inventory matters.
7. Report repairs and tracking issues, the findings that remain in your changed files, test/build/browser results, and material limits. Do not call a completed audit a pass. Leave work local and uncommitted unless publication is separately authorized.

Scoring, sharing, telemetry, and network-backed supply-chain checks remain disabled. Do not request a numeric score or call the result a dependency-security certification. The classic `react-in-jsx-scope` requirement is disabled in the applicable profile because Next.js uses automatic JSX; the raw inventory re-enables it for transparency. Never add unnecessary imports to satisfy that obsolete requirement.

For interactive diagnostics only, `bun run react-doctor:first-party -- --full --offline --fail-on none` retains legacy argument compatibility. It scans the live checkout and writes no summary. No private scanner API is part of the permanent workflow.
