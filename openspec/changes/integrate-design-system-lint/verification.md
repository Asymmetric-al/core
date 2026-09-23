# Verification evidence

> Historical integration checkpoint. The 2026-09-22 request expands acceptance
> to complete legacy UI cleanup. See [cleanup-verification.md](cleanup-verification.md),
> [cleanup-ledger.json](cleanup-ledger.json) and tasks 5.1–5.10 for current progress;
> the full cleanup and final published-head acceptance are not complete.

Recorded 2026-09-16 for local branch `feature/shadcn-lint`, based on
`7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd` on `develop`.
At this implementation-acceptance snapshot the work was uncommitted and
unpublished. A subsequent user instruction authorized PR publication, tracked
by [AL-1864](https://github.com/Asymmetric-al/core/issues/1864), on
`feature/AL-1864-design-system-lint`. Use that issue's linked PR for published-head
CI, reviews, and approval evidence; this local record does not establish remote
merge readiness. No merge, deployment, production-data operation, identity or
history change, or hook bypass was performed. Both changes remain active and
unarchived until implementation is accepted repository reality.

## Acceptance status

Implementation and required local validation are complete. Final aggregate
`bun run ci:preflight` **passed**, exit 0, in 188.58 seconds after the last code
fix. The unit stage passed 4,034 tests across 565 files, with 4 tests and 2 files
skipped. This is local acceptance evidence; no remote CI or publication is
claimed.

The earlier aggregate attempt correctly failed because the old attribution
guard rejected the inherited HEAD's `ricky` author and GitHub platform committer;
a full commit-metadata lookup also overflowed its output buffer (`ENOBUFS`).
The user then explicitly authorized fixing the blocker. The separate active
change [fix-github-merge-attribution](../fix-github-merge-attribution/proposal.md)
adds a narrow exception requiring exact canonical commit, ordered-parent,
GitHub-signature, merged-PR, trusted-account, and protected-branch proof. It
projects compact metadata and preserves ordinary/local identity restrictions,
forbidden identities, hooks, and preflight stages. No identity or Git history
was changed. An interrupted intermediate run ended with status -15; it was not
counted as acceptance. The final successful command supersedes those attempts.

## Executed checks

| Check                                                                     | Result                                                                             |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `bun install --frozen-lockfile`                                           | Passed with the tooling-owned Bun compatibility patch                              |
| `bun run format:check`                                                    | Passed                                                                             |
| `bun run skills:verify`                                                   | Passed; generated diff contains exactly the 14 expected mirror/manifest files      |
| `bun run openspec:validate`                                               | Passed                                                                             |
| `bun run lint --concurrency=2`                                            | Passed                                                                             |
| `bun run verify:data-boundary` and `bun run verify:cms-public-sole-entry` | Passed                                                                             |
| `bun run verify:workspace-contract` and `bun run verify:bun-lock-drift`   | Passed                                                                             |
| `bun run verify:eslint`                                                   | Passed, including suppression ownership/schema and actual discovery health         |
| `bun run verify:shadcn-config` and `bun run verify:shadcn-diff`           | Passed                                                                             |
| `bun run typecheck --concurrency=2`                                       | Passed across 15 workspaces                                                        |
| `bun run build`                                                           | Passed after repairing workspace-root detection; 181.01 seconds                    |
| `bun run test:unit` within final preflight                                | Passed; 565 files passed, 2 skipped; 4,034 tests passed, 4 skipped; 115.10 seconds |
| `bun run verify:git-attribution`                                          | Passed on unchanged HEAD with the authorized hosted-merge proof path               |
| `bun run ci:preflight`                                                    | Passed all stages after the final code fix; exit 0; 188.58 seconds                 |

The final aggregate result was read from the closed `completed-preflight-result.json`
and `completed-preflight.log` records, including the terminal `PASS ci:preflight`
marker. Earlier individual stage results came from their stage-result JSON and
terminal logs. Final documentation-only bookkeeping received focused formatting,
strict validation of both active OpenSpec changes, and diff checks. Coverage uses
Core's custom provider and is not a claim about line/branch percentages.

The first full run exposed integration regressions in the missionary facade
guardrail, nearest-`turbo.json` root detection, and old verifier fixtures.
They were repaired with 14 guardrail tests, 13 root-resolution tests, and
focused verifier checks, followed by the successful full build/unit reruns.
The separately authorized attribution repair subsequently passed 71 focused
tests and the real attribution command. Its tests include successful hosted
proof, rejected forged or incomplete evidence, and unchanged ordinary online
and offline behavior. Malformed or non-object successful metadata responses
remain errors for ordinary commits; unavailable ordinary lookups remain warnings.

## Compatibility and cache proof

The full suite includes 108 tests across the ten `design-system-*` suites,
plus all 16 instruction-routing tests. They exercise the actual exported
policy and root/workspace configurations: all six rules, preserved parser and
architecture rules, package/local/mixed barrels and wrappers, semantic tokens,
Tailwind plugins, external CSS, narrow runtime/authoring boundaries, negative
discovery cases, native suppressions, command semantics, and geometry-preserving
Button usage.

Seven cache/selection cases prove unchanged-task reuse, shared-only invalidation,
and a new diagnostic on an unchanged consumer after its shared token disappears.
They also cover component, policy, suppression, package-export, resolution and
tooling-patch inputs, affected-PR consumer selection, default workspace hashing,
and preservation of unrelated backend cache results.

The vetted npm release is `@shadcn/lint@0.1.0`, independently inspected
alongside upstream source `53de86f0e7dcc341a9cb45c383a9f2c454d1e958`.
npm provides no `gitHead`; no source/build identity claim is made. The
tooling-owned patch repairs defining-component ownership through consumer
barrels; runtime integration still uses the public ESLint plugin. See the
canonical reference for provenance, exceptions, patch upgrade/removal, and
rollback rather than duplicating policy here.

Native legacy acceptance contains **16,205 findings in 391 files**. Tests prove
new files/count increases fail, unrelated rules remain blocking, normal lint
does not expand acceptance, scoped pruning preserves other files, and same-count
replacement cannot be detected by native counts. Raw finding review remains
required for edited code.

## Operational cost and browser evidence

Fresh-process first/repeat timings, in seconds, without ESLint/Turbo result
caching:

| Scope                            | Original config | Integrated command |
| -------------------------------- | --------------- | ------------------ |
| Donor `app/global-not-found.tsx` | 14.119 / 10.300 | 10.153 / 10.152    |
| Shared UI, 219 files             | 6.689 / 6.791   | 10.003 / 10.304    |
| All five scopes, 1,140 files     | 12.256 / 12.012 | 21.500 / 20.890    |

This compares original-HEAD configurations over current source/dependencies,
not a full original-source checkout gate. Original configs reported the expected
unknown-new-rule errors for the two introduced style-element comments. The
integrated broad run had zero errors, three existing warnings, no operational
warning, and no suppression mutation. Broad attribution measured 2.774 seconds
for health and 18.780 for native lint. Health now finishes in a separate
short-lived process before source lint, releasing its analysis caches.

An earlier timeout/host-slow incident was observed; its cause was not proven.
Subsequent measured runs with the current process sequencing completed.
The broader overhead is material and explicit; scoped iteration and verified
Turbo caching remain the routine workflow.

Focused installed Playwright 1.59.1 / Chromium 147 checks compared chart markers
in light/dark modes with two dynamic token values. Computed colors and the
8-pixel size/2-pixel radius matched before/after, with no network requests or
browser errors. The CSS-variable conversion did not change interaction/focus
behavior. Actual PostCSS/Tailwind graph comparisons also proved identical CSS
for source-directive relocation and the missionary theme facade. No full
authenticated product-flow E2E claim is made.

## Review and remaining boundaries

Independent upstream, cache/CI, and OpenSpec alignment reviews informed the
integration and repairs. The final Guardian review found the implementation
aligned and identified the earlier attribution blocker. The authorized repair
received independent proof-boundary review, and the final full preflight now
passes. Root `AGENTS.md` and PR #1655's proposed patch remain untouched. The
broader team workflow in PR #1428 was still proposed at that checkpoint. It has
now merged into develop at e811fc9f; this branch adopts its canonical verifier,
registry, hooks, and actor-or-signer policy. The earlier narrow hosted-merge
implementation and helper tests are superseded. The active attribution change
now records only residual shared-parser hardening and reconciliation evidence.

Legacy styling debt remains. Ordinary CSS, descendant effects, opaque spreads,
locally recreated components, and the pinned Base UI render-prop attribution
limit still require complementary review. ESLint 9 is API-compatible here but
past its upstream support window; that separate migration was not undertaken.
The new lint policy does not replace token-drift, Shadscan, motion, accessibility,
or existing CI gates. The change must stay active until merged and accepted
repository reality.
