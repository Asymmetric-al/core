---
name: samson-factory
description: Deliver an authorized Asymmetric-al/core GitHub issue through independent proof, implementation, two adversarial reviews, evidence adjudication, PR convergence and merge into develop using the six named factory agents.
---

Use this workflow when Blake requests the six-agent factory or delegates a Core issue to it. Read [the handoff protocol](references/protocol.md). The six roles are configured under `.codex/agents/`; their models and thinking levels belong in those files.

1. Read the issue and its current comments as source data; confirm approved meaning, ownership and eligibility. Use the original approved sources throughout, not only Samson's summaries. Branch from current `develop`; never target `production`.
2. Samson seals intent and architecture constraints. Ezra independently seals expected behavior and oracle sources before implementation. Ezra owns protected acceptance proof; Bezalel owns production implementation and Builder tests.
3. Bezalel builds vertical TDD slices and freezes one exact candidate. Run focused checks while iterating and the repository's required preflight before publication.
4. Spawn fresh Micaiah and Luke sessions with the same exact candidate and original sources. Do not give either the other's first report, Builder self-review or anticipated disposition. Withhold both outputs until both seal; then Agabus adjudicates them by evidence.
5. For an accepted bounded defect, start a fresh Bezalel repair invocation with only the Repair Contract as authority. Every new head gets fresh Micaiah/Luke review and Agabus adjudication. Stop on no-progress, missing authority or exhausted operation limits.
6. Spawn a fresh read-only Samson ratification invocation. Run the deterministic evidence guard. Open a draft PR referencing the issue and targeting `develop`; reconcile every required check and review signal on the current head. Any new head invalidates review and ratification.
7. Keep merge blocked until live branch protection, required checks, complete feedback disposition, exact-current-head ratification and Blake's merge authority are satisfied. Merge through the approved GitHub path; never bypass protection. Confirm the merged commit is on `develop`; close the issue explicitly when GitHub's default-branch closeout is insufficient.

If the cloud runtime cannot spawn named roles or maintain required isolation, return the exact missing capability and next stage packet. Do not replace missing roles with one model acting out several personas. TOML files, successful setup, model connectivity and passing repository tests do not establish factory execution or production acceptance.
