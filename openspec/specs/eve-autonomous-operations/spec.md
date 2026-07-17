# eve-autonomous-operations Specification

## Purpose

Define the durable autonomy, identity, governance, rollout, and verification
boundaries for Eve before any runtime capability is activated.

## Requirements

### Requirement: Eve Autonomy Is Spec-First And Governed

Eve MUST operate as a governed autonomous operations capability whose durable
product behavior is defined in OpenSpec before implementation. Runtime code,
prompts, models, tools, provider integrations, memory, or operational
convenience MUST NOT broaden the accepted contract.

For repository work, Eve MUST use `AGENTS.md` as the canonical instruction
router and the applicable OpenSpec specs as product intent. Runtime, GitHub, CI,
evals, and logs MUST be treated as evidence of current observed state;
version-matched official documentation MUST be used for API facts; memory MUST
remain non-authoritative context.

#### Scenario: Eve proposes a new product behavior

- WHEN Eve proposes or implements a product-direction change
- THEN the applicable OpenSpec change is reviewed before implementation or
  merge proceeds
- AND memory, model output, or a provider plugin cannot substitute for that
  product intent

#### Scenario: Current runtime evidence differs from intended behavior

- WHEN runtime, GitHub, CI, eval, or log evidence differs from accepted product
  intent
- THEN Eve reports the discrepancy without fabricating either state
- AND resolves it through the repository's canonical change workflow

### Requirement: Eve Uses Accountable Execution Identities

Eve MUST resolve actor identity and scope from trusted app-owned execution
boundaries. Mission Control actions MUST act as the current signed-in admin,
with user, tenant, role, and permissions derived from verified server-side
session context. Scheduled, background, and system work MUST act as a
configured service identity with explicit initiator or trigger metadata and
trusted scope from app-owned job or configuration state. GitHub operations MUST
use the configured bot identity while recording the accountable human, service
trigger, or GitHub event.

Prompts, model output, tool input, unverified remote payloads, memory, and
shared context MUST NOT establish or widen the actor, tenant, repository, role,
or permission scope. A signature-verified GitHub event MAY identify a target
only after the app maps its installation and repository to configured
allowlists; event-supplied identifiers MUST NOT be authority by themselves.

#### Scenario: A signed-in admin requests an Eve action

- WHEN a verified admin invokes Eve through Mission Control
- THEN Eve derives user, tenant, role, and permission scope from the verified
  server-side session
- AND supplied prompt or tool identifiers are never authority

#### Scenario: A scheduled job invokes Eve

- WHEN app-owned scheduling or configuration starts background work
- THEN Eve uses the configured service identity and trusted scope
- AND records the initiator or trigger that made the work accountable

#### Scenario: A verified and configured GitHub event invokes Eve

- WHEN a signature-verified event maps to an allowed installation and repository
  and the configured GitHub integration performs an action
- THEN the bot is the executing identity
- AND the accountable human, service trigger, or GitHub event is recorded

### Requirement: Autonomous Activation Uses One Disabled Release Gate

Eve implementation MAY be delivered incrementally, but autonomous activation
MUST use one app-owned release gate that defaults to disabled. Merging a spec or
implementation slice MUST NOT enable Eve. Emergency-off and any more
restrictive kill-switch or policy result MUST take precedence over an enabled
release gate.

An independently runnable slice MUST also ship behind a capability-specific
flag or disabled configuration until coordinated launch. A slice control MAY
restrict that capability further, but MUST NOT enable autonomy while the master
release gate is off or act as an alternative master release switch.

Only the final #437 launch verification MAY establish readiness, and only a
verified human using the authorized control path MAY enable the gate. Missing,
stale, mismatched, waived, or failing required evidence MUST keep it disabled.

#### Scenario: An implementation slice merges successfully

- WHEN any Eve slice before #437 is merged or deployed
- THEN the release gate remains disabled
- AND that slice's independently runnable behavior remains flagged or
  configured off until coordinated launch
- AND no autonomous capability becomes active as a side effect

#### Scenario: Emergency state conflicts with an enabled gate

- WHEN emergency-off or a more restrictive policy state is active
- THEN autonomous execution is blocked
- AND the enabled release-gate value cannot override the restriction

### Requirement: Engineering Work Initiation And PR Operations Are Policy-Gated

When release and GitHub-action controls allow it, Eve MAY initiate engineering
work by creating or updating an issue, creating an isolated branch, opening a
pull request, reviewing or commenting, labeling, rerunning CI, pushing a safe
fix, and updating PR state. Every operation MUST use an accountable identity
and initiator, remain within approved repository and task scope, satisfy
permission and budget policy, and emit the required audit evidence.

Eve-invented work MUST follow issue-first flow. Product-direction changes MUST
follow the spec-first OpenSpec path before implementation or merge. Permission
to perform a PR operation MUST NOT imply permission to merge. An action that
mutates beyond scope, would modify a protected area, lacks required evidence,
or needs broader product or production authority MUST be withheld and escalated
to a human. Separately authorized inspection, review, or comment on a protected
PR MAY proceed: inspection MUST remain read-only, while posting a review or
comment MUST be treated as a separately gated and audited, non-code-changing
GitHub write. Neither MUST grant permission to modify branch contents or merge
the protected change.

#### Scenario: Eve initiates safe engineering work

- WHEN Eve identifies an in-scope engineering task and all action gates allow it
- THEN it records or updates the issue before creating an isolated branch and
  pull request
- AND each review, comment, label, CI rerun, safe fix, push, or PR-state change
  is separately policy-gated and audited

#### Scenario: Eve proposes a product-direction change

- WHEN Eve-originated work would change durable product behavior
- THEN Eve creates or updates the applicable OpenSpec change before
  implementation or merge proceeds
- AND the PR workflow cannot bypass product review

#### Scenario: A PR operation is allowed but merge is not

- WHEN Eve may review, update, or safely fix a pull request but strict merge
  policy is not satisfied
- THEN Eve may perform only the individually authorized non-merge operations
- AND it withholds merge and escalates with the blocking evidence

#### Scenario: Eve inspects or responds to a protected pull request

- WHEN policy authorizes Eve to inspect, review, or comment on a pull request
  that touches a protected area
- THEN inspection remains read-only and any posted review or comment is
  separately gated and audited as a non-code-changing GitHub write
- AND neither operation grants permission to modify branch contents or merge
  the protected change

### Requirement: Protected Areas Block Autonomous Merge

Eve MUST NOT autonomously merge changes that touch auth, permissions, tenant
resolution, donations or payments, secrets or environment configuration,
migrations or RLS, production deployment, data-access boundaries, GitHub
workflows, Vercel configuration, agent instructions, Eve configuration,
packages, dependencies, runtime behavior, or other repository-designated
protected areas. Protected changes MUST follow their required human review
path even when the release gate is enabled.

For changes outside protected areas, autonomous merge MUST remain
deny-by-default. It MAY be eligible only when release and GitHub-action controls
allow it, the action is within the accountable actor's policy and budget, all
required checks and reviews pass, branch protection and repository policy are
satisfied, and no unresolved blocking finding or stricter approval applies.

#### Scenario: A change touches a protected area

- WHEN Eve detects a protected file or protected behavioral area in a proposed
  change
- THEN autonomous merge is blocked
- AND the change is routed to the required human review path with evidence

#### Scenario: A safe change does not satisfy every merge precondition

- WHEN a non-protected change lacks any required check, review, policy,
  budget, branch-protection, or blocking-finding condition
- THEN Eve withholds the merge
- AND routes the decision to the explicit human escalation path

### Requirement: Production Writes Are Narrow And Policy-Gated

Eve MAY write routine operational records only under the applicable policy.
Examples include tasks, notes, labels, internal statuses, workflow metadata,
governed memory, model settings, notification records, and review artifacts.

Eve MUST NOT autonomously write broad customer, donor, payment, identity,
tenant-ownership, auth, secret, migration, destructive production, or
production-deployment records. An enabled release gate MUST NOT broaden these
write permissions.

#### Scenario: Eve proposes an operational record write

- WHEN an operational write is allowed by identity, tenant, approval, budget,
  kill-switch, and capability policy
- THEN Eve may perform the write and create the required audit evidence

#### Scenario: Eve proposes a sensitive business-data write

- WHEN the target affects a blocked or stricter-approval production category
- THEN Eve does not autonomously perform the write
- AND routes it through the required human-controlled path

### Requirement: Governance State Is App-Owned

Supabase-owned application data MUST be authoritative for release and
kill-switch state, audit, approvals, budgets, model policy, notification
records, run summaries, shared-run-context metadata, private admin memory,
replay metadata, and retention state. Large redacted replay or debug artifacts
MAY use Supabase Storage with relational metadata and access controls.

Eve's sessions and workflow durability MUST remain owned by the isolated Eve
runtime and its workflow host. Runtime or session state MUST NOT override
app-owned governance, identity, or authorization state.

#### Scenario: Runtime state conflicts with governance state

- WHEN the Eve runtime reports that work may proceed but app-owned governance
  state blocks it
- THEN the governance state wins
- AND the blocked decision is auditable

### Requirement: Model Use Is Policy-Routed And Bounded

Vercel AI Gateway MUST be the primary model route. Direct providers MAY be
configured only as controlled fallbacks. Named roles and specialist settings
MUST resolve through app-owned model policy. Model-policy changes MUST require
the dedicated permission, passing evals, audit, and rollback protection.

Budgets and rate limits MUST cover agents, subagents, dynamic workflows, evals,
judges, retries, and other model-consuming work. Emergency override MUST be
separately permissioned and audited.

#### Scenario: A direct provider is available

- WHEN a direct model provider is configured
- THEN it is eligible only according to controlled fallback policy
- AND it cannot become a hard-coded or prompt-selected route

### Requirement: Verification Gates Every Eve Slice And Launch

Every Eve implementation slice MUST verify its externally observable policy
and safety outcomes with focused tests plus the repository's formatting,
`skills:verify`, lint, workspace-contract, data-boundary, typecheck, build, and
unit-test gates. Final launch verification MUST cover identity and ownership,
audit and redaction, evals, protected-area enforcement, budgets, kill switches,
rollback, retention, notification safety, deployment compatibility, and
operator runbooks.

#### Scenario: Required launch evidence is incomplete

- WHEN any required evidence is missing, stale, mismatched, waived, or failing
- THEN Eve remains disabled
- AND the readiness report identifies the blocking evidence

### Requirement: The Foundation Does Not Imply Runtime Readiness

Acceptance of this capability and ADR-0018 MUST NOT be treated as evidence that
the Eve package is installed, a runtime is deployed, Supabase persistence is
implemented, Vercel is configured, or autonomous operation is ready.

#### Scenario: The foundation change is archived

- WHEN this OpenSpec change becomes current product truth
- THEN it authorizes the later phased implementation program
- BUT Eve remains unimplemented and disabled until those slices are completed
  and final launch verification passes
