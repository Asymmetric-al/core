# Six-agent handoff protocol

One run belongs to one authorized GitHub issue and one branch from `develop`.
Keep runtime evidence out of product source and never store credentials or private reasoning.

## Capability and disclosure

Before work, confirm the actual runtime can spawn `ezra`, `bezalel`, `micaiah`,
`luke`, `agabus` and a fresh `samson` ratifier at their configured models and
efforts. Check effective permissions rather than trusting TOML alone. Reviewer
and referee invocations may run disposable probes but cannot modify the canonical
candidate or GitHub. Use isolated workspaces or cloud tasks when shared files
would expose withheld reports. Never claim a prompt-only prohibition is an OS
permission or a filesystem visibility boundary.

Micaiah and Luke get equal source and candidate context and separately sealed
first reports. They do not read one another's session or output. Agabus gets both
reports after they seal. Ratification starts with original approved meaning and
exact source before receiving the correction lineage. A fresh invocation reduces
anchoring; Samson is still the intent author, not a distinct Samuel principal.

## Records

Store `run.json` and the immutable JSON stage reports in a run artifact directory
outside the candidate tree. The coordinating task must retain them durably as
task outputs. A new ticket starts a new run; a new candidate starts a new evidence
generation. Preserve old generations instead of overwriting or regrading them.

`run.json` has:

```json
{
  "version": 1,
  "repository": "Asymmetric-al/core",
  "target_branch": "develop",
  "issue": 1923,
  "base_sha": "<40-hex original develop commit>",
  "proof_sha": "<40-hex accepted protected-test commit>",
  "candidate_sha": "<40-hex frozen current commit>",
  "artifacts": {
    "intent": { "path": "intent.json", "sha256": "<digest>" },
    "proof": { "path": "proof.json", "sha256": "<digest>" },
    "build": { "path": "build.json", "sha256": "<digest>" },
    "micaiah": { "path": "micaiah.json", "sha256": "<digest>" },
    "luke": { "path": "luke.json", "sha256": "<digest>" },
    "adjudication": { "path": "adjudication.json", "sha256": "<digest>" },
    "ratification": { "path": "ratification.json", "sha256": "<digest>" }
  }
}
```

Every stage report identifies `role`, `stage`, `invocation_id`, `issue`,
`base_sha`, `subject_sha`, `status`, `input_digests`, source/evidence references,
commands actually run, limitations and next route. No hidden reasoning.

Bind `input_digests` to the exact referenced predecessor artifacts: proof uses
intent; build uses intent/proof; each reviewer uses intent/proof/build;
adjudication uses intent/proof/both reviewers; ratification uses all six earlier
reports. `protected_paths` includes the tests and their material fixture, helper,
runner/configuration and other transitive proof dependencies, not only assertions.

| Report         | Required additional fields                                                                                                                                                                                                                                |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| intent         | `role: samson`, `stage: intent`, `status: READY`, `obligations` with unique IDs, authoritative sources and expected/forbidden outcomes; scope/non-goals, binding constraints, unresolved meaning                                                          |
| proof          | `role: ezra`, `stage: proof`, `status: READY`, `protected_paths`, oracle/scenario model, RED or lawful nonbehavioral evidence; `saw_implementation: false` for its sealed normative stage                                                                 |
| build          | `role: bezalel`, `stage: build`, `status: READY`, `covered_obligations`, RED/GREEN and final checks, `blocking_gaps: []`                                                                                                                                  |
| micaiah / luke | matching role, `stage: review`, `status: COMPLETE`, `findings` with unique role-qualified IDs, mechanism, consequence, evidence/counterevidence and disprover; `saw_peer_report: false`, `saw_builder_self_review: false`; complete scope/evidence limits |
| adjudication   | `role: agabus`, `stage: adjudication`, `status: NO_REPAIR`, `dispositions` covering every reviewer finding and `blocking_findings: []`; rejected/deferred/unresolved claims must retain evidence and route                                                |
| ratification   | `role: samson`, `stage: ratification`, `status: RATIFIED`, fresh `invocation_id`, `satisfied_obligations`, `blocking_gaps: []`, exact correction/feedback/check lineage                                                                                   |

A positive result requires all accepted current obligations to be satisfied and
every material finding lawfully resolved. If a defect needs repair, Agabus returns
a Repair Contract, not `NO_REPAIR`; create a successor generation only after the
accepted correction. An assertion of completeness is not proof. The guard
validates binding and integrity, while independent agents evaluate meaning.

## Guard and GitHub convergence

Run:

```sh
node scripts/factory/evidence-guard.mjs /absolute/run/run.json
```

The guard requires current clean HEAD, exact source/base/proof lineage, immutable
artifact digests, separate invocation identities, complete obligation coverage,
two review reports, disposition coverage, no claimed blocker and unchanged
protected files between proof and candidate. It does not authenticate a model's
claim that it was blind or that a test ran. Preserve the actual task/session
records and effective capability evidence separately.

Before any merge, fetch live PR head/base, complete paginated comments/reviews
and threads, branch protection and check runs. The required contexts observed
October 1, 2026 were `ci-gate`, `e2e-smoke-gate`, `migrate` and `smoke`; that dated
inventory does not replace live readback. Missing, failed, skipped, stale or
wrong-source required checks block. Formal requested changes remain blocking.
PR-head movement requires a new generation. Base movement requires composition
checks and renewed conformance; never rely on a green merge box alone.

The default policy requires Blake's human PR review/merge authorization. The
agent reports and guard do not grant GitHub merge authority. GitHub CLI or the
connected GitHub app may perform an authorized merge when available; cloud
environment files do not supply credentials. Do not copy subscription sign-in
or GitHub credential caches into a cloud environment. No automatic deployment,
production migration or protected-branch push belongs to this workflow.
