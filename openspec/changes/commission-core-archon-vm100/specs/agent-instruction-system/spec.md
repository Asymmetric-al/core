## ADDED Requirements

### Requirement: VM Factory Has One Recoverable Execution Owner

The VM native-Claude lane SHALL use one pinned Archon installation and Core
pack with native durable state, claims, triggers, continuation and metrics.
Provisioning SHALL verify the target and preserve recoverable prior work.
No independent scheduler, queue/database or credential broker SHALL be added.

#### Scenario: Replacing retained automation

- WHEN a confirmed duplicate dispatcher is replaced on VM 100
- THEN its unfinished work, Git objects, state and configuration are preserved
- AND unrelated jobs and VM 101 data remain intact
- AND only one reconciled dispatcher can admit the same authorized scope

#### Scenario: Starting after reboot

- WHEN the admin-owned service starts after VM reboot
- THEN explicit executable, state, HOME and trigger-host bindings are effective
- AND accepted triggers become actual native execution, not only receipts
- AND existing waits and uncertain effects are reconciled without duplicates

### Requirement: VM Native Attempts Keep Owner Identity Stable

Every native attempt SHALL bind an actual authorized owner/profile before
preflight and use that same identity for execution, children and resume.
Profiles SHALL be absolute operator-owned paths, not candidate configuration.
API credentials, connected-user delivery and overage SHALL NOT silently
override native subscription mode. Roles SHALL NOT represent pooled seats.

#### Scenario: Native quota is reached

- WHEN the selected profile exhausts a supported limit
- THEN the same attempt uses a qualified native wait/continuation
- AND another owner's unused allowance is not substituted
- AND independently authorized work can continue within proven capacity

#### Scenario: Responsibility transfers legitimately

- WHEN ownership of actual work changes
- THEN the previous attempt is reconciled before a new linked run starts
- AND live session identifiers and login stores are not transplanted

### Requirement: VM Admission Separates Assignment Lease And Capacity

Trusted eligibility SHALL precede Samson ranking and reject out-of-scope,
unmet hard dependencies, conflicting owners/PRs/writers, holds and unavailable
resources. Dependencies SHALL include owning text/contracts and actual
integration evidence, not native links or closed status alone.

#### Scenario: A short selector dispatches delivery

- WHEN the capacity-one selection operation records a pending assignment
- THEN shared conflict reservations use a coherent conditional update
- AND the actual delivery run owns its execution lease
- AND selector completion does not end that run's claim
- AND partial dispatch is reconciled before any retry

#### Scenario: A prerequisite is malformed or unavailable

- WHEN a hard dependency is cyclic, self-referential or malformed
- THEN affected work is blocked with a source-linked reason
- AND unrelated eligible work remains selectable
- AND failed source reads are not treated as missing dependencies

### Requirement: VM Delivery Preserves Complete Specialist Independence

The VM lane SHALL preserve all six responsibilities, independent acceptance,
one candidate writer, two sealed first-pass reviews and conditional dispute
adjudication. Decisions SHALL bind exact assignment/attempt/candidate/base,
context, acceptance and installed policy identities with completed attempts.

#### Scenario: A delivery round produces a candidate

- WHEN Ezra's acceptance precedes Bezalel's implementation
- THEN normal hooks determine the frozen candidate reviewed by Micaiah and Luke
- AND neither first-pass reviewer can consume the other's output
- AND child preparation proves the actual candidate and effective policy
- AND implementation repairs return to Bezalel and oracle repairs to Ezra
- AND Ezra's final criterion-by-criterion acceptance precedes readiness

#### Scenario: Evidence or isolation is absent

- WHEN a role lacks required proof or qualified candidate-command isolation
- THEN its result remains INCONCLUSIVE or BLOCKED rather than PASS
- AND untrusted commands do not execute beside credentials/control files
- AND tool declarations alone are not called filesystem isolation

### Requirement: VM Protected Delivery Uses Fresh External Truth

The VM coordinator SHALL preserve Core hooks/local gates and existing hosted
required CI, including older-run CI_RUNNER_FALLBACK compatibility. Protected
merge SHALL require authorized scope and current head/base, requirements,
acceptance/reviews, check identity/attempt, permissions, mergeability and holds.
Required human review SHALL NOT be bypassed.

#### Scenario: Readiness changes after an earlier decision

- WHEN requirements, head/base, policy, review obligations or check attempt change
- THEN affected stale evidence cannot authorize readiness or merge
- AND unchanged valid evidence is not discarded solely because of a restart
- AND PR_READY, MERGED and BLOCKED remain distinct outcomes

#### Scenario: A remote effect has an unknown result

- WHEN push, PR creation or merge loses its response
- THEN the actual Git/GitHub state is reconciled before retry
- AND completion requires independent merge and issue-closeout evidence

### Requirement: VM Controls Preserve Unfinished Work

Controls SHALL use the actual server-owned execution path. Ordinary Stop,
Hold and Retry SHALL preserve dirty/untracked work. Durable holds/cancellation
SHALL prevent queued retries or children restarting canceled work. One bounded
retry owner SHALL stop repeated no-progress loops without global backlog loss.

#### Scenario: Canceling a disposable check

- WHEN an operator cancels an owned workload
- THEN the actual executor/container/process is confirmed stopped
- AND its files, ports and services are settled before capacity reuse
- AND an acknowledgement or wrapper exit alone is not success evidence

### Requirement: VM Commissioning Demonstrates Complete Operation

Commissioning SHALL satisfy the governing acceptance matrix using real native,
GitHub and browser evidence plus safe failure fixtures. The complete thin
Console SHALL use exact base-maia/Base UI and the same real backend. Bounded
assessments SHALL have explicit freshness/failure handling and remain optional
to delivery. Recovery SHALL include coherent off-host backup and isolated
restoration of an unpushed candidate.

#### Scenario: Only a preview or fixture is available

- WHEN configuration, mock checks, a healthy page or a retained receipt exists
- THEN the installation remains uncommissioned until live acceptance passes
- AND unavailable usage or unsupported controls are not invented
- AND two issue flows, interruption/continuation and independent implementation
  review remain explicit qualification obligations
