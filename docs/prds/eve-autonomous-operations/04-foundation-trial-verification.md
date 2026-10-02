# Eve foundation trial verification — #417

Recorded 2026-10-02 (America/Los_Angeles) for the first product trial under
[#416](https://github.com/Asymmetric-al/core/issues/416), scoped to
[#417](https://github.com/Asymmetric-al/core/issues/417), **Spec and ADR Foundation
(HITL)**. Baseline `develop`: `b13dc8af189f909a095bad78bd04340cb1d87e5b`.

The foundation already exists in the baseline. This trial adds its acceptance
reconciliation and a plan pointer; it does not rebuild the runtime or amend the
accepted autonomy contract. The archived foundation's wording about Eve being
“unimplemented” describes its original scope and sequencing, not current program
absence. Later slices and the launch runbook exist, but this trial does not
qualify their implementation, deployment, or activation.

## Live acceptance reconciliation

The three live #417 acceptance points map to the existing artifacts below.
Current durable authority remains with the spec and accepted ADR; this record
is evidence and navigation, not a replacement contract.

| #417 acceptance point                                                                                  | Existing evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OpenSpec change captures Eve as an autonomous operations platform.                                     | The [archived proposal](../../../openspec/changes/archive/2026-07-17-add-eve-autonomous-operations-foundation/proposal.md#what-changes), [design](../../../openspec/changes/archive/2026-07-17-add-eve-autonomous-operations-foundation/design.md#design-decisions), and [completed tasks](../../../openspec/changes/archive/2026-07-17-add-eve-autonomous-operations-foundation/tasks.md#1-durable-capability-contract) establish the foundation. The [durable spec](../../../openspec/specs/eve-autonomous-operations/spec.md#requirement-eve-autonomy-is-spec-first-and-governed) defines spec-first authority, and [accountable execution identities](../../../openspec/specs/eve-autonomous-operations/spec.md#requirement-eve-uses-accountable-execution-identities) bind actors and scope to trusted execution boundaries. |
| ADR records the autonomy model, auto-merge policy, production-write policy, and governance guardrails. | Accepted [ADR-0018](../../adr/0018-governed-eve-autonomy.md#decision): decisions 1–2 define authority and identity; decision 4 separates work initiation/PR operations from merge authority; decision 5 requires strict, deny-by-default merge policy, protected-area human review, and narrow production writes; decision 6 assigns governance ownership to app-owned Supabase state separately from runtime durability. The corresponding [durable requirements](../../../openspec/specs/eve-autonomous-operations/spec.md#requirement-engineering-work-initiation-and-pr-operations-are-policy-gated) retain these boundaries.                                                                                                                                                                                                 |
| Verification contract and release-switch strategy are documented.                                      | [ADR-0018 decisions 3 and 8](../../adr/0018-governed-eve-autonomy.md#3-delivery-is-phased-activation-uses-one-human-controlled-release-gate), the [single disabled release gate requirement](../../../openspec/specs/eve-autonomous-operations/spec.md#requirement-autonomous-activation-uses-one-disabled-release-gate), and [per-slice and launch verification requirement](../../../openspec/specs/eve-autonomous-operations/spec.md#requirement-verification-gates-every-eve-slice-and-launch) define rollout and evidence gates. The [launch runbook](../../guides/operations/eve-launch.md) supplies the later operational procedure; its existence is not proof of a qualified launch.                                                                                                                                     |

The release gate defaults off. Capability flags may only restrict it further;
emergency controls and stricter policy prevail. Only #437 verification plus an
authorized human using the approved control path can activate Eve. Missing,
stale, mismatched, waived, or failing required evidence blocks activation.
Every slice retains its focused policy/safety verification and repository gates;
final launch additionally requires the composition, reversal, and operational
evidence described in the launch runbook.

## Provenance and tracker snapshot

The coordinator verified these GitHub merge facts; local ancestry checks also
confirmed all three commits are contained in the baseline:

| Source                                                    | Verified provenance                                                                                                                                                                                                                              |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [PR #742](https://github.com/Asymmetric-al/core/pull/742) | Foundation design merged to `develop` on `2026-07-11T16:53:48Z`, merge commit `73d8d2a03e054b5a7855af7429940b3d1cebec1f`.                                                                                                                        |
| [PR #851](https://github.com/Asymmetric-al/core/pull/851) | Canonical #417 foundation merged to `develop` on `2026-07-17T23:45:11Z`, merge commit `4bc5a707903bb4ca524e3c10f84334dc30365924`; implementation commit `0c249088921565386a5726c1267498f698bf5f7b` (`docs(eve): establish autonomy foundation`). |

Separately, the coordinator's live tracker read on 2026-10-02 found #417 **OPEN**,
all three acceptance boxes unchecked, and no comments. The parent #416 comment
directs work to start with #417. Those unchecked boxes describe tracker state;
they do not establish that the merged foundation is absent. This record does
not change those boxes or close either issue. The implementation plan's
2026-06-29 publication snapshot remains historical publication evidence.

## Checks and remaining delivery gates

Observed for this documentation trial:

- Strict validation of the current `eve-autonomous-operations` spec: passed
  (`Specification 'eve-autonomous-operations' is valid`).
- Each foundation provenance commit is an ancestor of the exact baseline:
  passed (`git merge-base --is-ancestor`, exit 0 for all three).
- Scoped Prettier: passed for both trial documents.
- Local Markdown links: passed for all 21 relative links across both documents,
  resolving each file and any heading anchor; external URLs were not checked.
- `git diff --check`: passed. Scope inspection found only the new record and the
  implementation-plan update; the historical archive is untouched.

Reproduce the spec, ancestry, formatting, and diff checks from the repository
root of a committed trial checkout. The diff commands compare the trial's
committed `HEAD` against the baseline:

```bash
export PATH=/workspace/.onboarding-tools/node_modules/.bin:$PATH
bun run openspec -- validate eve-autonomous-operations --type spec --strict
for revision in \
  73d8d2a03e054b5a7855af7429940b3d1cebec1f \
  4bc5a707903bb4ca524e3c10f84334dc30365924 \
  0c249088921565386a5726c1267498f698bf5f7b; do
  git merge-base --is-ancestor "$revision" b13dc8af189f909a095bad78bd04340cb1d87e5b || exit
done
bunx --no-install prettier --check \
  docs/prds/eve-autonomous-operations/02-implementation-plan.md \
  docs/prds/eve-autonomous-operations/04-foundation-trial-verification.md
git diff --check b13dc8af189f909a095bad78bd04340cb1d87e5b...HEAD
git diff --name-only b13dc8af189f909a095bad78bd04340cb1d87e5b...HEAD
git diff b13dc8af189f909a095bad78bd04340cb1d87e5b...HEAD -- \
  docs/prds/eve-autonomous-operations/02-implementation-plan.md \
  docs/prds/eve-autonomous-operations/04-foundation-trial-verification.md
```

These checks establish document integrity and foundation provenance,
not runtime safety or release readiness. This record does not claim this
trial's independent reviews, normal push-hook `bun run ci:preflight`, remote CI,
or branch-protection checks have passed. Those remain delivery gates for the
trial PR to `develop` and must be reported against its actual reviewed head.

## Human approval boundary

The trial must stop for explicit human approval before merge. Prior foundation
merges, existing ADR acceptance, passing checks, permission to implement or open
a PR, and a future favorable review do not supply that approval. #416 remains
open. Merging this documentation trial would establish neither deployment nor
qualification nor runtime activation authorization; the separate #437 launch
and authorized human activation requirements still apply.
