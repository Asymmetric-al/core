# AL-1861 documentation reconciliation verification

Initial reconciliation verified 2026-09-16 in `docs/AL-1861-documentation-authority`, based on `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. The current user authorized credible current decisions/terminology and Twenty retirement. Product implementation, deployment and source-PR merge are not claimed.

## Scope

Five ratified P22–26 planning packages were integrated cumulatively: 1,264 source paths, 1,292 source-path records, 1,225 exact imports and 39 reconciled representations after the workflow prerequisite was integrated. Every integrated hash matches the source manifest. PR #1655's instruction guidance is recorded in a separate source manifest. Original capture hashes were not rewritten.

Changes cover CRM retirement, owner boundaries, terminology/approval supersession, ADR disambiguation, OpenSpec synchronization, generated sources, current publication status and deterministic documentation verification. There are no application-runtime or migration changes.

## Checks actually run

| Check                                              | Result                                                                                                |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `bun run openspec:validate`                        | 55 current items passed                                                                               |
| `bun run openspec:audit-archive`                   | 32 archives passed                                                                                    |
| `bun run verify:openspec-deltas`                   | 45 deltas built in memory; no writes                                                                  |
| `bun run verify:phase25-spec`                      | 242 stories; all three generated views match                                                          |
| Focused routing/OpenSpec/verifier/CI Vitest suites | 27 unique tests passed; routing rerun after final guidance edits passed                               |
| Verifier fixtures                                  | Missing MODIFIED and changed ADDED collisions rejected; valid/no-op cases remain read-only            |
| `bun run verify:workspace-contract`                | Passed                                                                                                |
| `bun run skills:verify`                            | Passed; no mirror mutations                                                                           |
| `bun run verify:data-boundary`                     | Passed; retired Twenty guard preserved                                                                |
| Focused ESLint                                     | Passed for changed verifier/CI tests                                                                  |
| `bun run format:check`                             | Passed over the consolidated repository; final small authoring edits checked separately               |
| Local prose links                                  | 6,038 links in 479 changed document files resolve; historical source folders and fenced code excluded |
| Source hashes                                      | 1,264 checked; no mismatch                                                                            |
| Conflict markers / runtime diff                    | None / no runtime changes                                                                             |

Raw `git diff --check` reports inherited whitespace: 573 Markdown hard-break lines and 33 blank quoted lines in preserved illustrations. Every reported line was compared with its exact source capture; no unexpected whitespace remains. These source bytes were preserved deliberately.

These initial documentation checks preceded publication. The subsequent publication record below distinguishes the additional checks actually run. No hosted provider test, environment cleanup, GitHub approval or merge is implied by local verification.

## Companion PR #1329 correction

Seven Markdown files were reconciled against head `134310f29e68f77888e462f37aaf101d7d4c567d` in `docs/AL-1861-pr-1329-contract`. They describe atomic persisted fee snapshots, full-quote replay checks, preserved recovery method binding and limited legacy-empty-snapshot fallback. Exact-head apply/reverse checks, strict scoped OpenSpec, Prettier and whitespace checks passed. The patch was applied to the companion worktree; the original source branch and PR body were not published or modified.

## Decisions and remaining gates

No new product decision was required for these corrections. Phase 25 G01 and Phase 18 renderer selection remain evidence gates; only failed qualification or a genuinely new tradeoff would require another ruling. External credential cleanup and GitHub publication/approval remain execution gates.

The main checkout was left untouched. At final readback it contained independent work on `feature/shadcn-lint`; none of that work was changed by this reconciliation. At the initial documentation handoff, the two worktrees contained local, uncommitted changes. Imported product tasks stay unchecked, and this reconciliation change stays active until accepted integration and closeout.

## Direct document-body correction pass

The follow-up request was fulfilled by rewriting current requirements,
decisions, examples and acceptance criteria themselves. Supersession notices
now identify provenance; they are not the only correction above stale clauses.

- Contribution detail: 114 story IDs preserved, 81 texts unchanged and 33
  owner-sensitive stories reconciled; current ADR Decision/Consequences and
  five program PRDs use the accepted owner contracts. Original rationale has
  immutable historical links with a dated amendment.
- Phases 1/4/8/9/12/16: current identity/contact/permission/wallet requirements,
  dependency statements, CRM retirement and planned-versus-shipped language
  corrected directly. G01 qualification remains explicit.
- Phase 13: 25 point-of-use clause corrections, including 17 existing story
  texts. All 185 extant IDs/order and the protected Connect, ledger and
  explicitly historical recurring sections are preserved.
- Phase 26: 217 requirements and 717 scenario identities/order preserved;
  the CRM clause is synchronized across governing requirements, story and
  projection. The original provenance JSON payload remains intact beneath
  explicit source-snapshot metadata.
- Obsolete Twenty runbook bodies now contain current retirement/remaining-proof
  instructions, with immutable links to withdrawn originals. Active architecture,
  program, publication and workflow prose reflects the verified source.
- Phase 23's newer PR #1340 head `db7a5e519ee062d28d05f68e5f8aff707de6e209`
  was inspected and its two-document dependency clarification adopted
  cumulatively. Original `9069dcad` captures remain separate in the manifest.

The direct pass again passed strict OpenSpec (55), in-memory applicability (45),
P25's 242-story projection check, 27 focused tests, scoped formatting and local
link checks. No runtime code, migration, original source PR or provider state
was changed. There is no new product decision needed for these corrections.

## Publication preparation

The user approved including PR #1428 as a prerequisite. The publication branch
`docs/AL-1861-documentation-authority-pr` preserves the 11 original workflow
commits and the subsequent develop merge through
`4e2c014afdbea1a2679f71ff3e9f385f6bf755a2`, with current `develop`
`ab53c847` as the publication base. Five overlapping
workflow/doc files were reconciled; no original prerequisite commit was rewritten.

Independent review found and corrected two remaining stale clauses: the durable
contribution audit's retired CRM retry scenario and the Phase 1 legal-donor row's
legacy `donations.donor_id` authority. The corrected row preserves donor/Party
profiles while naming the Phase 13 header's frozen legal-donor evidence. Source
hashes, 6,038 links in 480 documents, all 55 current OpenSpec items, all 45 delta
applications and all three Phase 25 projections passed again after those edits.
Full-repository formatting passed.

The reconciliation tree's remaining individual gates passed, including lint,
typecheck, build and the full unit suite. Its original full preflight failed at
the inherited attribution policy; the publication branch must pass the normal
full preflight with the approved prerequisite and verified Conrad identity.
The Shadscan baseline and enforced floor are 43 on both trees. The publication
worktree uses its own frozen-lockfile dependency installation; credentials and
the other active checkout remain untouched.

On 2026-09-21, publication resumed after the interrupted check run. The branch
fast-forwarded to PR #1428's existing develop-integration merge. PR #966's
renderer qualification harness is now part of the develop base; this does not
select a renderer or prove qualification. Seven stale links in the prerequisite's
contributor/deployment docs were repaired against actual repository destinations
or replaced with explicit release-specific rollback-plan requirements.

The separate live `verify:deployment-discipline` readback on 2026-09-21
reported eight existing platform-policy discrepancies: the GitHub default
branch, required-context differences on develop/production, and review-rule
differences. These are tracked in #1426. The verifier and all three Vercel
project configurations are unchanged relative to develop. No live settings
were changed. Actual PR merge requirements must be read from GitHub for the
published commit; this failed audit is not represented as a passing check.

## Publication gate result — 2026-09-21

The combined branch passed all 17 stages of the normal `bun run ci:preflight`
with Conrad's verified identity: formatting, skills, 242-story generation,
56 strict OpenSpec items, 46 read-only delta builds, lint, boundary/workspace/lock/
ESLint/UI guards, typecheck, all three application builds and the full unit suite.
The suite passed 571 files and 4,193 tests; two files/four tests were explicitly
skipped. All 32 archived OpenSpec changes also passed.

The final source audit verified 1,264 integrated hashes, all 32 prerequisite
source/integrated hashes and preserved prerequisite ancestry. The link scan
checked 6,060 links in 495 changed prose documents with no missing targets.
No application code or migrations differ from current develop; the only changed
app path is documentation. Two independent review findings were corrected and
rechecked. The normal commit/push hooks and remote current-head checks remain
mandatory; their final results are recorded in the PR to avoid implying that
pre-publication local results prove a future remote state.

## Large-commit CI attribution correction

The first published commit exposed `spawnSync gh ENOBUFS` in the prerequisite's
GitHub REST lookup: the large commit's unused file patches exceeded Node's
default stdout buffer before identity validation. The lookup now asks `gh` to
project only the SHA, Git author/committer identities, GitHub actor login/ID
pairs and parent records before Node reads stdout. Signature verification and
all attribution decisions remain unchanged; no buffer limit or policy is relaxed.

A regression test reproduced the overflow with the real default subprocess
limit and oversized patch/message output before the fix. The fix passed all
87 focused attribution, workflow-contract and pre-push tests, including negative
cases for missing parent, Git identity and actor-ID data. Scoped formatting,
ESLint and whitespace checks passed. Final outgoing and remote checks are
tracked on PR #1891 at the published commit.

Independent live verification compared the actual `a54f236a` response:
1,275,130 raw bytes versus 643 projected bytes, with exact equality for every
retained attribution field and parent record. The raw response reproduces
`ENOBUFS` under Node's default limit; the projected response exits successfully.
Independent review found no actionable issue in the fix or four regression cases.

## Recorded PR base and actual merge ancestry

GitHub review identified a second prerequisite edge case. Two independent reads
of real Core PR #968 confirmed a valid, signed merge whose recorded PR base
`5e2018d4bf05f3b261a69e421b6c5956665e2119` predates its first parent
`da8593ab01ef0044e16b9585d061f4506bbec7ea`; the merge SHA and second-parent
head match exactly. Both local Git and GitHub comparison prove the required
base-to-first-parent ancestry. The captured proof records the immutable SHAs
and remote evidence.

The workflow contract now admits that proven ancestor relationship while
preserving every exact closed-PR, repository, branch, merge-SHA, head-parent and
platform-signature check. Missing/malformed evidence, command failure, reversed
or unrelated ancestry must fail closed. This corrects a disproved metadata
assumption; it does not broaden who may authorize an integration.

PR #968 predates the policy baseline and is normally skipped as historical; it
proves the real metadata shape rather than an existing protected-push failure.
The corresponding regression failed before the fix. All 102 focused attribution,
workflow-contract and pre-push tests then passed. Independent execution accepted
the real ancestry and rejected descendant/missing bases, unavailable proof and
wrong merge/head/repository/branch bindings; exact-base matches avoid a needless
Git query. The code, negative cases, ops guide and OpenSpec amendment passed
independent review, scoped formatting/lint and strict OpenSpec/delta checks.
