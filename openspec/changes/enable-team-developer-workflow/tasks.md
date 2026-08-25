## 1. Contract and failing tests

- [x] 1.1 Add RED unit coverage for exact Blake, Conrad, and Eve identity tuples, cross-wired tuples, external authors, and forbidden legacy identities.
- [x] 1.2 Add RED unit coverage for existing/new/multi-ref outgoing commit enumeration, full merge ancestry, deletions, deduplication, and the forward-only baseline.
- [x] 1.3 Add RED coverage for immutable event-actor binding, signature-signer fallback, fork impersonation, forbidden principals, verified `web-flow` platform commits, and fail-closed remote metadata.
- [x] 1.4 Add RED contract coverage proving the pre-push hook owns stdin once and required `ci-gate` includes remote attribution verification.

## 2. Attribution implementation

- [x] 2.1 Implement the canonical trusted-identity, forbidden-identity, platform-identity, and policy-baseline registry.
- [x] 2.2 Refactor the attribution verifier around exact tuples, external-author policy, outgoing commit sets, local mode, and remote CI mode.
- [x] 2.3 Implement the single pre-push coordinator and preserve the independent production push guard.
- [x] 2.4 Add full-graph PR proof and provenance-bound protected integration verification to the existing CI gate graph without introducing a new required check name.
- [x] 2.5 Keep data-boundary verification scoped to live source by excluding exact ignored Eve `.eve`, `.nitro`, and `.output` trees with RED/GREEN coverage.

## 3. Ownership and contributor workflow

- [x] 3.1 Add `@cobmojo` beside `@II-ricky-bobby-II` in both CODEOWNERS sources and verify mirror equality.
- [x] 3.2 Rewrite the Git attribution runbook for multiple internal developers, automation, public contributors, and secure Windows/WSL credentials.
- [x] 3.3 Align contributor, ownership, CI, testing-rule, environment, deploy,
      and living protected-path docs without modifying the immutable repo-groundtruth
      snapshot.
- [x] 3.4 Update AL-1425 with implementation discoveries that materially change acceptance criteria.

## 4. Verification and review

- [x] 4.1 Run the focused attribution, pre-push, workflow-contract, and OpenSpec strict validation loops until green.
- [x] 4.2 Run `bun run ci:preflight` under Conrad's truthful identity and prove it leaves the tree unchanged.
- [x] 4.3 Run `git diff --check`, secret-sensitive diff review, CODEOWNERS parity, and rollback review.
- [x] 4.4 Run the required two-axis review against `origin/develop` and resolve every verified finding.

## 5. Publish and operational proof

- [ ] 5.1 Create a signed-off conventional commit referencing AL-1425 and push through the normal hook without bypassing it.
- [ ] 5.2 Open a PR to `develop` with the deploy checklist, issue closure, change summary, and complete verification evidence.
- [ ] 5.3 Confirm required GitHub checks, actor-or-signature verification, review requests, conversations, and mergeability reach a truthful terminal state.
- [x] 5.4 Record live branch-protection drift without changing platform settings
      in this PR: #1426.
- [x] 5.5 Record FastPR's unassociated direct envelope as a
      migration-or-retirement follow-up; register a replacement only after its
      configured App tuple is observed: #1427.

## 6. Evidence

### Live platform evidence — 2026-08-25

- GitHub reports `cobmojo` / `79217644` as an active organization owner and repository admin.
- Eve commit `cde9136e` uses the exact Eve bot tuple and matching bot account.
- Cursor commit `ec1af16e` uses `Cursor Agent <cursoragent@cursor.com>` with a valid SSH signature from `cursoragent` / `199161495`; PR #1337 runs under the distinct `cursor[bot]` event actor.
- PR-loop commit `edadc155` uses the direct actor-bound tuple; `0126a5b9` demonstrates its platform-only author alias beneath valid `web-flow` proof.
- FastPR commit `b8b6a8be` uses unsigned, unassociated `pr-fast <pr-fast@users.noreply.github.com>`. The App remains installed, so migration or retirement is still required before direct repairs resume.
- Live branch protection requires the exact contexts recorded in `docs/ci.md#branch-protection`; `integration-gate` is not required, `release-source-gate` is still required on `production`, and no `main` branch exists.
- Follow-ups: #1426 owns branch-protection/context reconciliation; #1427 owns
  FastPR direct-envelope migration or retirement.

### Implementation verification

- Focused attribution, pre-push, workflow-contract, and generated-output tests:
  83/83 passed on 2026-08-25.
- Strict OpenSpec validation: 49/49 items passed on 2026-08-25.
- Standards and spec/acceptance review axes re-reviewed every finding as
  resolved; final focused coverage is 83/83.
- `git diff --check`, credential-shape scan, CODEOWNERS parity, no-deletion
  check, and immutable repo-groundtruth comparison passed.
- Full `bun run ci:preflight` passed under
  `Conrad O <79217644+cobmojo@users.noreply.github.com>` and left the staged
  tree unchanged.
- Full preflight, clean-tree, and GitHub publication evidence is recorded only
  after the corrected working tree passes each remaining gate.
