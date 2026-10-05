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
- AND the worker returns exact-head DELIVERY_READY and stops before merge
- AND David, the root coordinator, alone performs the authorized protected expected-head merge after refreshed checks/reviews/protection
- AND completion requires independent merge readback on `develop` and successful same-worker closeout
- AND #1955 remains open until separate postmerge hosted qualification passes

#### Scenario: Evidence or execution cannot advance

- WHEN required evidence, capability or authorization is missing
- THEN Samson reports a concrete blocker instead of inferring success
- AND repeated attempts without progress stop at a bounded decision point
- AND resume and remote retries inspect actual Git/GitHub state

### Requirement: Native Setup Is Reproducible and Honest

Explicit local CLI setup SHALL install repository-owned native role files and coordinator guidance
without discarding unrelated personal configuration. Repeated installation SHALL
be idempotent. Verification SHALL detect missing or changed owned content without
mutating sources or installed files. Dependencies SHALL use the pinned Bun and
frozen lockfile. Repository readiness verification SHALL reject dependency-manifest
drift from the lockfile without repairing it. Setup SHALL neither start a trial
nor establish merge authority.

#### Scenario: Explicit local installation prepares the package

- WHEN explicitly authorized local setup runs from reviewed source
- THEN role files, coordinator guidance and executable tool initialization are restored
- AND unrelated configuration is preserved or a conflict fails with useful guidance
- AND credentials are not copied from another Codex installation

#### Scenario: Runtime or persistence is unverified

- WHEN only configuration or local fixture checks have passed
- THEN the report distinguishes those checks from actual role loading and model access
- AND shared-workspace prompt boundaries are not called filesystem isolation
- AND rebuild persistence is claimed only after a real fresh-start readback

### Requirement: Hosted Startup Validates Retained Assets Read-Only

Hosted startup SHALL validate retained/personal coordinator guidance, handoff
protocol, workspace coordination policy, all six own-role TOML sources/copies and
available native tools read-only. It SHALL NOT require installation into active
CODEX_HOME or local CLI verification/app-server launch. Active-home absence or a
read-only mount SHALL NOT request repair. Explicit local installer/setup flags
and preservation semantics SHALL remain unchanged.

#### Scenario: Hosted coordinating chat starts

- WHEN reviewed retained assets and required observed native/tools are available
- THEN matching coordinator/protocol and six role copies are validated with parsed own-role instructions and requested settings
- AND reviewed Node/Bun pins and shell/Git/GitHub/Python availability are checked
- AND fresh native own-role handoffs may follow without active-home writes, installer invocation or local CLI launch
- AND configuration, hashes and supplied tool inventory do not prove runtime enforcement, isolation or hosted qualification

#### Scenario: Required hosted assets or tools are unavailable

- WHEN a required coordinator/role/policy asset is missing, malformed or mismatched, or a required tool is unavailable
- THEN startup is BLOCKED before specialist/product work with the precise missing evidence
- AND no installer, fallback synthesis, home repair or permissions change occurs

#### Scenario: The bounded startup regression is repaired

- WHEN owner-authorized #1955 diagnoses the mandatory-installer regression
- THEN read-only retained asset/tool validation may establish independent acceptance and permit the bounded repository startup repair without running the failing installer
- AND this exception does not waive another gate or authorize product implementation
- AND #1954 remains paused in its existing assignment until actual fresh hosted qualification passes

#### Scenario: Repository repair and hosted publication are distinguished

- WHEN repository R1–R5 passes on the actual committed candidate
- THEN it may support the root's normal protected merge with H1–H2 explicitly pending
- AND root separately verifies actual fresh named Samson Core Factory execution, all six native own-role handoffs/normal returns, unchanged watched assets and clean product checkout without active-home writes
- AND consumed coordinator/role hashes, source revision and actual configuration/admission version identify what ran
- AND stale saved/personal/embedded startup copies require precise supported reconciliation/publication evidence and a new fresh-session verification
- AND merge, configuration parsing, mocked handoffs, catalog revisions or unpublished Start artifacts do not establish publication/consumption or product readiness
- AND missing review/acceptance execution isolation remains missing required evidence and INCONCLUSIVE
- AND #1955 is not auto-closed before H1–H2 passes
