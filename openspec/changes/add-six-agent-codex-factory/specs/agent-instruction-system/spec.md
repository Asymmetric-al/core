## ADDED Requirements

### Requirement: Native Delivery Keeps Specialist Roles Separate

The optional workflow SHALL place roster, assignments, delegation, waiting,
handoffs and completion solely with Samson. Specialists SHALL receive fresh
role-only context and report through their normal response without peer contact,
roster discovery, delegation or workflow advancement. The coordinator skill
SHALL NOT be given to specialists.

#### Scenario: An issue is admitted

- WHEN the user requests delivery of an eligible issue
- THEN Samson checks scope, authoritative requirements, dependencies and authority
- AND independent acceptance criteria precede implementation
- AND only one writer is active

#### Scenario: A committed candidate is reviewed

- WHEN normal commit hooks finish and writers pause
- THEN two reviewers inspect the same committed candidate without peer conclusions
- AND their outputs distinguish CLEAR, FINDINGS and INCONCLUSIVE
- AND genuine conflicts or missing evidence may receive read-only adjudication
- AND repairs receive current-commit decisions and affected rechecks
- AND final acceptance maps each criterion to evidence for the candidate

#### Scenario: Contributor reproduction commands are supplied

- WHEN reviewers or final acceptance receive candidate reproduction commands
- THEN they inspect each command and its scripts before execution
- AND execution requires a disposable, credential-free sandbox with network denied by default and writes limited to the candidate checkout
- AND missing isolation is reported as missing evidence instead of executing commands
- AND role configuration alone is not evidence of isolation

#### Scenario: Delivery reaches GitHub

- WHEN local acceptance and review conditions are satisfied
- THEN Samson publishes through normal repository hooks and targets `develop`
- AND it converges live required checks and actionable feedback for the current head
- AND it preserves required human approval and applicable merge authority
- AND native protection and expected-head matching govern the merge
- AND completion requires readback of the merge on `develop` and issue closeout

#### Scenario: Evidence or execution cannot advance

- WHEN required evidence, capability or authorization is missing
- THEN Samson reports a concrete blocker instead of inferring success
- AND repeated attempts without progress stop at a bounded decision point
- AND resume and remote retries inspect actual Git/GitHub state

### Requirement: Native Setup Is Reproducible and Honest

Setup SHALL install repository-owned native role files and coordinator guidance
without discarding unrelated personal configuration. Repeated installation SHALL
be idempotent. Verification SHALL detect missing or changed owned content without
mutating sources or installed files. Dependencies SHALL use the pinned Bun and
frozen lockfile. Repository readiness verification SHALL reject dependency-manifest
drift from the lockfile without repairing it. Setup SHALL neither start a trial
nor establish merge authority.

#### Scenario: A fresh startup installs the package

- WHEN setup runs from reviewed source in a fresh environment
- THEN role files, coordinator guidance and executable tool initialization are restored
- AND unrelated configuration is preserved or a conflict fails with useful guidance
- AND credentials are not copied from another Codex installation

#### Scenario: Runtime or persistence is unverified

- WHEN only configuration or local fixture checks have passed
- THEN the report distinguishes those checks from actual role loading and model access
- AND shared-workspace prompt boundaries are not called filesystem isolation
- AND rebuild persistence is claimed only after a real fresh-start readback
