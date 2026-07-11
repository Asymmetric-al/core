# Delta for Eve Sandbox Engineering Worker

## ADDED Requirements

### Requirement: The Sandbox Provides A Writable Repo Checkout For Engineering Work

The Eve sandbox MUST provide a **writable repo checkout** in which Eve can **inspect, edit, test, commit, and
push** engineering work. The checkout MUST be a disposable working copy contained within the sandbox, and the
sandbox MUST be the **contained environment the #425 runtime executes in**, never the runtime package itself.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:259]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:509]

#### Scenario: Eve edits and tests in a writable checkout

- GIVEN the sandbox is running with the release switch off for local verification
- WHEN Eve inspects, edits, tests, commits, and pushes engineering work
- THEN it operates on a writable repo checkout inside the sandbox
- AND that checkout is a disposable working copy, not the isolated #425 runtime package

### Requirement: Allow-All Networking Is Permitted Only With Strong Containment

Sandbox network access MAY be **allow-all**, but it MUST be paired with the full compensating-control set — no
mounted secrets/env/service-role keys/production dumps, egress and command audit, sensitive-file scanning,
protected-file detection, and a networking kill switch. Allow-all networking MUST NOT be permitted unless those
controls are active. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:262]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:509]

#### Scenario: Allow-all networking requires the compensating controls

- GIVEN the sandbox has allow-all network access
- WHEN it is provisioned or a run starts
- THEN the compensating controls (no mounted secrets, egress/command audit, sensitive-file scan, protected-file
  detection, networking kill switch) are active
- AND allow-all networking is refused if those controls are not in place

### Requirement: The Sandbox Mounts No Secrets, Env Files, Service-Role Keys, Or Production Dumps

The sandbox MUST be provisioned with **no mounted secrets, no environment files, no service-role keys, and no
production data dumps**. The exfiltration risk of allow-all networking MUST be compensated **structurally** — by
there being nothing sensitive present to exfiltrate — not by trusting the agent. No donor PII, payments,
secrets, one-time codes, or tenant facts MUST enter the sandbox.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:266]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:510]

#### Scenario: No sensitive material is present in the sandbox

- GIVEN the sandbox is provisioned for an engineering run
- WHEN a reviewer inspects what is mounted
- THEN there are no mounted secrets, no environment files, no service-role keys, and no production data dumps
- AND there is no donor PII, payment data, or tenant fact present to exfiltrate

### Requirement: Egress And Commands Are Audited In The #419 Record Shape

The sandbox MUST **audit egress and commands where available**, and those audit records MUST use the **#419
audit-record shape** rather than a new one. The sandbox emits audit records; it MUST NOT redefine or persist the
audit contract itself. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:267]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:511]

#### Scenario: A network egress and a command are audited

- GIVEN the sandbox performs a network egress and runs a command during a run
- WHEN auditing is available
- THEN an audit record is emitted for the egress and for the command
- AND the record uses #419's audit-record shape, which the sandbox does not redefine

### Requirement: Sensitive-File Scanning And Protected-File Detection Can Pause Risky Runs

The sandbox MUST run a **sensitive-file scanner** and **protected-file detection** (against #417's
protected-area set) that **can pause a risky run before it proceeds**, not merely report after the fact. A run
that touches a sensitive or protected file MUST be pausable pending review.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:268]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:221]

#### Scenario: A run touching a protected file is paused

- GIVEN the sandbox is executing an engineering run
- WHEN the sensitive-file scanner or protected-file detection flags a sensitive or protected-area file
- THEN the run can be paused before the risky work proceeds
- AND the pause is subject to review rather than silently continuing

### Requirement: A Sandbox Networking Kill Switch And Emergency Stop Can Cut The Sandbox

The sandbox MUST honor #420's **`disable sandbox networking`** kill switch and an **emergency stop** that can cut
the sandbox instantly. The sandbox MUST **read the persisted switch state** from the app-owned governance store,
never a prompt/model/tool claim that networking is on, and MUST stop egress when the switch is set.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:512]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:184]

#### Scenario: The networking kill switch cuts sandbox egress

- GIVEN a platform owner sets #420's `disable sandbox networking` switch
- WHEN the sandbox checks network authorization for its next egress
- THEN it reads the persisted switch state and stops sandbox networking
- AND it never proceeds on a prompt/model/tool claim that networking is still on

### Requirement: The Sandbox Grants No New Authority

The sandbox MUST resolve **every model through #421's shared policy via the #425 runtime** (never hardcoding a
model or provider), MUST spend **under #423 hard budgets and rate limits**, and MUST stay **disabled by default
while the release switch is off**. It MUST NOT widen Eve's authority, MUST NOT bypass #417 protected-area /
production-write / approval limits or #418 emergency-off precedence, and MUST read only persisted app-owned
governance state. The change itself MUST remain a spec/ADR contract and MUST NOT introduce live sandbox code.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:205]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]
[VERIFIED-REPO: openspec/project.md] [VERIFIED-REPO: AGENTS.md]

#### Scenario: Sandbox work stays within model policy and budget

- GIVEN the sandbox needs a model and runs engineering work
- WHEN it resolves the model and consumes model calls
- THEN it resolves through #421's policy via the #425 runtime, not a hardcoded provider
- AND the spend stays under #423's hard budgets, degrading or refusing rather than exceeding the ceiling

#### Scenario: The sandbox grants no new authority

- GIVEN the sandbox is present and every kill switch is cleared
- WHEN Eve evaluates an action that touches a protected area or requires approval
- THEN the #417 protected-area and approval rules and #418 emergency-off precedence still apply and can block it
- AND the sandbox never overrides those higher-authority constraints
