# Core Factory admission inputs: current-state audit

**Research ticket:** [Audit Core admission, OpenSpec, tracker, CI, and merge protection as Factory inputs](https://github.com/Asymmetric-al/core/issues/1241)  
**Evidence date:** 2026-08-12  
**Status:** Wayfinder research input; no pilot issue was selected.

## Verdict

Core exposes enough repository and GitHub data to build deterministic Factory admission, but there is no trustworthy single readiness signal today. The inputs conflict:

- four task-complete OpenSpec changes remain active and one active change fails strict validation;
- the roadmap says `PRD exists` is neither implementation nor dispatch proof;
- no open issue has canonical `status:ready`, while 126 have legacy `ready-for-agent`, including 100 also marked `status:blocked`;
- live branch protection differs from checked-in CI policy, and `production` requires no review;
- there are no rulesets or merge queue; and
- check runs identify a PR head SHA, while default PR checkout tests a synthetic merge SHA and merge-commit-only policy creates a distinct final accepted SHA.

Admission must therefore be a fresh, fail-closed snapshot over issue, relationship, OpenSpec, roadmap, workflow, enforcement, and exact-SHA facts. A label query is insufficient. Admission should remain disabled until tracker readiness, OpenSpec debt, CI/protection drift, and the production review gap have explicit resolutions.

## Evidence boundary

This audit used the local `Asymmetric-al/core` repository, read-only GitHub REST/GraphQL APIs, and official GitHub documentation. No product code, tracker, PR, branch, or GitHub setting was changed. `docs/ai/working-set.md` was not touched. Live counts are evidence-time snapshots and require refresh before admission.

## Current facts

### OpenSpec: merged truth versus proposed state

Root `AGENTS.md` gives `openspec/specs/` precedence as merged product intent and `openspec/changes/` as proposed changes. `openspec/project.md` says completed changes must be archived so their deltas enter current specs; completed active changes can leave merged specs stale.

Current CLI results:

- 31 merged specs and 14 active changes;
- 10 changes marked in progress;
- four task-complete but unarchived changes: `add-curated-agent-skills` (10/10), `add-emilkowalski-agent-skills` (13/13), `add-grill-for-unknowns-agent-skill` (11/11), and `canonical-supabase-tanstack-db` (44/44);
- `sitestacker-parity` is 44/49; and
- strict all validation reported 45 items, 44 passing, one failing.

The failure is active `add-guest-giving-and-gift-anonymity`: its modified donation-lifecycle requirement omits three scenarios retained by the merged spec. All 31 merged specs passed.

Factory consequence:

- task completion is not merged truth;
- behavior-changing work needs a named change and affected merged specs;
- behavior-neutral work needs a reviewed `OpenSpec not required` determination;
- affected specs and overlapping active deltas must validate at the Contract Pack/candidate repository SHA; and
- an unrelated invalid active change need not block all work, but overlap or uncertain impact must fail closed.

Sources: `AGENTS.md` → “Source-of-truth order”; `openspec/config.yaml`; `openspec/project.md` → “OpenSpec Expectations”; `openspec/specs/**`; `openspec/changes/**`.

### Roadmap and phase gates

`docs/prds/sitestacker-parity/roadmap.md` is authoritative for phase set, numbering, dependencies, and scope summaries, while OpenSpec remains authoritative for product boundaries. It says:

- hard dependencies gate starts;
- phase number alone is insufficient;
- `PRD exists` does not mean built, live, or dispatched; and
- `future (needs PRD)` is direction, not commitment.

`phase-map.md` is only a mirror. It warns that pre-2026-07-07 references above Phase 9 use old numbering and that later PRDs are planning contracts, not build proof. Additional dispatch requires an explicit founder decision.

Live tracker examples expose the distinction:

- Phase 18 issues `#908`–`#910`, described as an approved frontier, carry `ready-for-agent` plus `status:todo`, not `status:ready`.
- Phase 21 has 114 open issues: 100 `status:blocked`, 13 `status:todo`, one unlabeled PRD issue; its 100 blocked issues use native blockers, while epic/lane hierarchy uses sub-issues.

Admission must resolve a stable phase name/slug, validate every hard dependency using phase-defined evidence, and distinguish “blocker closed” from “prerequisite built/live and accepted.” Stale numbering or PRD-as-build claims make a ticket ineligible.

Sources: `docs/prds/sitestacker-parity/roadmap.md` → “How to read this roadmap” and master table; `docs/prds/sitestacker-parity/phase-map.md` → ticket guardrails and tracking notes.

### Tracker taxonomy, dependencies, and staleness

`docs/ai/rules/general.md` requires exactly one label from each canonical category:

- `type:bug | feature | chore | refactor | docs`;
- `status:todo | blocked | needs-review | ready`; and
- `complexity:simple | easy | medium | hard`.

`docs/agents/triage-labels.md` maps the role `ready-for-agent` to canonical `status:ready`; it does not make the legacy label independently authoritative. `docs/agents/issue-tracker.md` defines Wayfinder frontier as open map children with no open blocker and no assignee, in map order. Assignment is the claim.

Live snapshot (PRs excluded):

| Signal                                               |                    Count |
| ---------------------------------------------------- | -----------------------: |
| Open / closed issues                                 |                685 / 123 |
| Open taxonomy violations                             |                       27 |
| Open issues not updated in 30 days                   |                      273 |
| Open canonical `status:ready`                        |                        0 |
| Open legacy `ready-for-agent`                        |                      126 |
| Legacy ready + `status:blocked` / `todo` / no status |             100 / 24 / 2 |
| Open assigned issues                                 | 1 (this research ticket) |
| Open issues with native blocker / blocking another   |                325 / 354 |
| Open issues with sub-issues                          |                       17 |

A paginated GraphQL read found no `Agent Brief` marker in comments on any of the 126 open legacy-ready issues. The label supplies no uniform machine-readable work contract.

Closed labels are stale too: 119/123 closed issues retain a `status:*` label (69 blocked, 21 todo, 20 needs-review, 9 ready). Excluding historically useful `blocked`, 50 retain an open-workflow status. Always evaluate issue `state`; neither label nor closure alone is enough.

Native relationships are useful: this research ticket has no blocker and natively blocks three tickets; the Factory map has 36 children, 33 open, three closed, and 26 open with blockers. Native dependency/sub-issue APIs should win over `Blocked by:` prose.

Unsafe sole predicates are: legacy ready label, `status:todo`, no assignee, blocker closure, parent status, age, or mutable comment/body prose.

### CI graph and local-gate boundary

At `develop`, `.github/workflows/ci.yml` runs on PRs/pushes to `develop` and `production`. Aggregate `ci-gate` requires success from `format`, `lint`, `typecheck`, `build`, and `test-unit`.

`.github/workflows/ci-integration.yml` runs the same branches:

- `migrate`, `smoke`, and `test-e2e-smoke`;
- `e2e-smoke-gate` over smoke E2E;
- `integration-gate` over migrate, smoke, and smoke gate;
- broader `test-e2e` and production-build `instant-nav`; and
- production-only `e2e-gate` over full E2E and Instant Navigation.

On `develop`, full E2E and Instant Navigation are informational through `continue-on-error`; on `production`, they feed `e2e-gate`.

`package.json` maps `ci:preflight` to `scripts/verify/ci-preflight.mjs`. It mirrors fast CI through unit tests only. It excludes integration/migration/E2E, OpenSpec validation, and `verify:deployment-discipline`; that last exclusion is intentional in `tests/unit/scripts/ci-preflight.contract.test.ts`. Local preflight is evidence, not GitHub gate parity.

### Intended policy versus live enforcement

Checked-in `docs/ai/rules/testing.md`, `docs/ci.md`, and `scripts/verify/deployment-discipline.mjs` agree on intended aggregates:

- `develop`: `ci-gate`, `integration-gate`;
- `production`: those plus `e2e-gate`; and
- at least one approving review on each branch.

Live GitHub differs:

| Control                                     | `develop`                                       | `production`                                                                       |
| ------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------- |
| Required GitHub Actions checks (App 15368)  | `ci-gate`, `e2e-smoke-gate`, `migrate`, `smoke` | `ci-gate`, `e2e-gate`, `release-source-gate`, `migrate`, `smoke`, `e2e-smoke-gate` |
| `integration-gate` required                 | No                                              | No                                                                                 |
| Required approvals                          | 1, stale dismissed                              | None                                                                               |
| Code-owner / last-push approval             | No / no                                         | No / N/A                                                                           |
| Conversation resolution / admin enforcement | Yes / yes                                       | Yes / yes                                                                          |
| Force push / deletion                       | Disabled / disabled                             | Disabled / disabled                                                                |
| Linear history / signatures                 | No / no                                         | No / no                                                                            |

Repository-level facts:

- default branch `develop`; no `main` branch;
- no rulesets and GraphQL `mergeQueue(branch: "develop") = null`;
- auto-merge, squash, and rebase disabled; merge commits enabled;
- `CODEOWNERS` is only `* @II-ricky-bobby-II`, with no syntax error; but code-owner reviews are not required; and
- production's branch-local `release-source-gate` requires PR source `Asymmetric-al/core:develop` and is absent on current `develop`.

Live protection is the enforcement fact; checked-in files are intended policy. Their mismatch must block autonomous publication/merge. Branch-local workflow definitions must be read at the target base SHA; the default branch cannot describe production reliably.

### Exact-SHA observability

GitHub APIs expose PR head/base/merge SHAs, Actions `head_sha` and run attempt, and check-run name, App, suite/run IDs, conclusion, and `head_sha`.

Live PR `#1275` demonstrated:

- head `4d12db6de68c51c9f7a183335045697e818564ef`;
- all queried Actions checks attached to that head and App `15368`; and
- distinct synthetic merge SHA `68324f1acbc8a32df88237bd14d5834832fdc3b3`.

The workflows use default `actions/checkout`. GitHub documents that `pull_request` workflows set `GITHUB_REF=refs/pull/<number>/merge`, set `GITHUB_SHA` to the synthetic merge commit, and default checkout tests that merged result. ([workflow-event documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull_request))

Because only merge commits are allowed, the final accepted commit is distinct from candidate head and may differ from an earlier synthetic merge after a base update. Green head-attached checks are not a complete execution/acceptance identity record.

Record: Contract Pack/repo SHA, candidate head, target base and base SHA, gate-captured `GITHUB_SHA`, workflow SHA, run/attempt and check-suite/run IDs, App/context/conclusion, pre-merge current head/base, and final merge SHA plus parents. Only current-head checks from the expected App count. The Checks API defines runs against a specific `head_sha`. ([Checks API](https://docs.github.com/en/rest/checks/runs))

## Proposed Factory admission policy (not current behavior)

### Immutable admission snapshot

Capture repository/issue identity; issue state and mutable-field hashes; exact canonical labels; assignees; native parent/dependency edges; phase/roadmap revision and prerequisite evidence; OpenSpec mode/affected specs/validation hash; Contract Pack hash; target branch/base SHA; and live protection/ruleset/queue/workflow snapshot.

Expire/recompute on issue, label, assignment, dependency, Contract Pack, OpenSpec, roadmap, base, workflow, or enforcement changes.

### Eligibility predicates

An issue is eligible only if:

1. open, not a PR, with exactly one canonical type/complexity and `status:ready`;
2. unassigned at discovery, then atomically claimed through assignment/lease;
3. all native blockers closed and phase evidence accepted;
4. child execution explicitly allowed by parent/lane policy;
5. freshly triaged with no relevant mutation or expired staleness review;
6. governed by a typed Contract Pack/Agent Brief defining scope, acceptance, forbidden actions, tests, security, and OpenSpec decision;
7. affected merged specs and active deltas strictly valid at the pinned SHA; and
8. free of unresolved human, credential/access, legal/finance, or activation prerequisites.

### Publication and merge predicates

- Readmit immediately before publication.
- Push and verify only the approved candidate SHA.
- Fetch live protection/rulesets/queue and workflow definitions at the target base SHA.
- Block on any intended-versus-live drift.
- Require exact-current-head checks from the expected App and permitted conclusions.
- Require approved review/code-owner/last-push and conversation policy.
- Capture the tested synthetic merge SHA, then observe final merge SHA and parents.
- Never infer success from a context name, combined status, local preflight, or earlier PR head.

## Preconditions before enabling Factory admission

1. Reconcile required checks with `docs/ci.md`, testing rules, and deployment-discipline verifier.
2. Restore production review discipline; decide Code Owner and last-push requirements.
3. Decide classic protection versus rulesets/required workflows and merge queue; add `merge_group` triggers if adopting a queue.
4. Migrate legacy ready labels to `status:ready`, remove contradictions, and normalize close-time status.
5. Define a typed Contract Pack/Agent Brief and freshness TTL.
6. Archive four completed OpenSpec changes after verification and repair the invalid change.
7. Add affected OpenSpec validation to admission and decide whether formal CI requires it.
8. Formalize candidate/base/tested-merge/final-merge SHA evidence.

## Representative commands

```bash
bunx @fission-ai/openspec@latest list --json
bunx @fission-ai/openspec@latest validate --all --strict --json
gh api --paginate 'repos/Asymmetric-al/core/issues?state=open&per_page=100'
gh api --paginate 'repos/Asymmetric-al/core/issues?state=closed&per_page=100'
gh api 'repos/Asymmetric-al/core/issues/1241/dependencies/blocking'
gh api --paginate 'repos/Asymmetric-al/core/issues/1237/sub_issues?per_page=100'
gh api repos/Asymmetric-al/core/rulesets
gh api repos/Asymmetric-al/core/branches/{develop,production}/protection
gh api repos/Asymmetric-al/core/codeowners/errors
gh api graphql # issue comments, branch rules, mergeQueue(branch: "develop")
gh api 'repos/Asymmetric-al/core/actions/runs?per_page=20'
gh api 'repos/Asymmetric-al/core/commits/<sha>/check-runs?per_page=100'
gh api repos/Asymmetric-al/core/pulls/1275
gh api -H 'Accept: application/vnd.github.raw+json' \
  'repos/Asymmetric-al/core/contents/.github/workflows/<file>?ref=<branch>'
```

## Primary source index

- Repository authority: `AGENTS.md`, `openspec/config.yaml`, `openspec/project.md`, `openspec/specs/**`, `openspec/changes/**`.
- Planning: `docs/prds/sitestacker-parity/roadmap.md`, `phase-map.md`.
- Tracker: `docs/ai/rules/general.md`, `docs/agents/issue-tracker.md`, `docs/agents/triage-labels.md`.
- CI: `.github/workflows/ci.yml`, `ci-integration.yml`, `.github/CODEOWNERS`, `docs/ci.md`, `docs/ai/rules/testing.md`, `scripts/verify/ci-preflight.mjs`, `scripts/verify/deployment-discipline.mjs`, and their unit contract tests.
- Live GitHub: read-only repository, issue/dependency/sub-issue, PR/review, Actions/check, branch protection, ruleset, CODEOWNERS, content, and GraphQL APIs captured on the evidence date.
- Official GitHub: [pull-request merge-ref semantics](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull_request); [Checks API](https://docs.github.com/en/rest/checks/runs).
