# ADR-0018: Govern Eve autonomy behind one disabled-by-default release gate

**Status:** Accepted (foundation design merged in PR #742; canonical record
completed under issue #417 on 2026-07-17)

> Durable capability contract:
> `openspec/specs/eve-autonomous-operations/spec.md`
>
> Archived source change:
> `openspec/changes/archive/2026-07-17-add-eve-autonomous-operations-foundation/`
>
> Source product documents:
> `docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md`
> and `docs/prds/eve-autonomous-operations/02-implementation-plan.md`

## Context

Eve is intended to become a durable autonomous operations layer across Mission
Control, GitHub, and repository workflows. It may eventually review and advance
engineering work, coordinate specialists, maintain governed memory, notify
operators, and write narrowly defined operational records. Those powers create
material risk if autonomy can outrun product intent, permission boundaries,
tenant isolation, money integrity, auditability, or an operator's ability to
stop the system.

The repository already has authoritative product intent in OpenSpec, an
always-on instruction router in `AGENTS.md`, server-side data and identity
boundaries, CI gates, and Supabase-owned application state. Eve must compose
with those systems rather than create a parallel source of truth or a second
authorization model.

Issue #417 therefore establishes the autonomy decision before runtime,
database, admin UI, or GitHub automation is implemented.

## Decision

### 1. OpenSpec defines Eve's durable behavior before implementation

Eve product and autonomy changes follow the repository's OpenSpec workflow.
Durable behavior is proposed in an active change, reviewed, implemented, and
then archived into `openspec/specs/**`. Runtime code, prompts, memory, provider
plugins, or operational convenience cannot broaden the accepted contract.

For repo work, Eve follows the canonical authority routing in `AGENTS.md` and
the applicable OpenSpec specs. Different evidence classes retain their proper
roles: OpenSpec and repo instructions define intended behavior and operating
rules; runtime, GitHub, CI, evals, and logs establish current observed state;
version-matched official documentation establishes framework and API facts;
memory is context only and never authority. Evidence about current state does
not rewrite product intent, and product intent does not fabricate runtime
facts.

### 2. Identity is verified by execution mode and never chosen by model input

Eve has three accountable execution modes:

- Mission Control actions execute as the current signed-in admin. User, tenant,
  role, and permission scope come from verified server-side session context.
- Scheduled, background, and system-initiated work executes as a configured
  service identity. Tenant or repository scope and accountable initiator or
  trigger come from trusted app-owned job/configuration state.
- GitHub operations execute through the configured bot identity while recording
  the accountable human, service trigger, or GitHub event.

Prompts, model output, tool input, unverified remote payloads, memory, and
shared context cannot establish or widen the acting identity, tenant,
repository, role, or permission scope. A signature-verified GitHub event may
identify a target only after the app maps its installation and repository to
configured allowlists; event-supplied identifiers are not authority by
themselves.

### 3. Delivery is phased; activation uses one human-controlled release gate

Implementation proceeds through issues #418–#437, but autonomous activation is
controlled by the single app-owned release switch defined by #418. The switch
defaults to disabled. Merging a specification or implementation slice never
enables Eve as a side effect.

Independently runnable slices also ship behind capability-specific flags or
disabled configuration until coordinated launch. Those rollout controls may
restrict a slice further, but they cannot enable autonomy while the master
release switch is off and do not become alternative release switches.

Only the final #437 launch verification may establish readiness, and only a
verified human using the authorized control path may enable the switch. Missing,
stale, mismatched, waived, or failing required evidence keeps it disabled.
Emergency-off and more restrictive kill-switch or policy state always win.

### 4. Work initiation and PR operations are scoped, accountable, and reversible

When the release gate and GitHub-action controls allow it, Eve may initiate
engineering work under policy: create or update an issue, create an isolated
branch, open a pull request, review and comment, label, rerun CI, push a safe
fix, and update PR state. Every operation must have an accountable identity and
initiator, stay within approved repository and task scope, satisfy permission
and budget policy, and emit the required audit evidence.

Work invented by Eve follows issue-first flow, and product-direction changes
follow the spec-first OpenSpec path before implementation or merge. A PR
operation does not imply merge authority; merging is a separate, stricter
decision. Any mutation that exceeds scope, would modify a protected area, lacks
required evidence, or needs broader product or production authority is withheld
and escalated to a human. Separately authorized inspection, review, or comment
on a protected PR may still proceed: inspection is read-only, while posting a
review or comment is a separately gated and audited, non-code-changing GitHub
write. Neither grants permission to modify branch contents or merge the
protected change.

### 5. Protected areas and sensitive production writes remain human-controlled

Eve may eventually perform engineering and operational work under policy, but
an enabled release switch is not blanket authorization. Protected areas include
auth, permissions, tenant resolution, donations and payments, secrets and
environment configuration, migrations and RLS, production deployment,
data-access boundaries, GitHub workflows, Vercel configuration, agent
instructions, Eve configuration, packages, dependencies, and runtime changes.
Protected changes block autonomous merge and follow their required human review
path.

For changes outside protected areas, autonomous merge remains deny-by-default.
It is eligible only when the release gate and GitHub-action controls allow it,
the action is within the accountable actor's policy and budget, all required
checks and reviews pass, branch protection and repository policy are satisfied,
and no unresolved blocking finding or stricter approval applies. Otherwise Eve
withholds the merge and escalates to a human.

Routine operational records—such as tasks, notes, labels, internal statuses,
workflow metadata, governed memory, model settings, notification records, and
review artifacts—may be writable only under the applicable policy. Broad
customer, donor, payment, identity, tenant-ownership, auth, secret, migration,
destructive production, or production-deployment writes require stricter
human-gated authority.

### 6. Governance state is app-owned; Eve runtime durability is separate

Supabase-owned application data is the authority for release and kill-switch
state, audit, approvals, budgets, model policy, notification records, run
summaries, shared-run-context metadata, private admin memory, and retention
state. Large redacted replay/debug artifacts may use Supabase Storage with
relational metadata and access controls.

Eve's own sessions and workflow durability remain owned by the isolated Eve
runtime and its workflow host. Runtime/session state cannot override app-owned
governance or identity state.

### 7. Model use is policy-routed, bounded, evaluated, and reversible

Vercel AI Gateway is the primary model route. Direct providers are controlled
fallbacks, not hard-coded defaults. Named roles and per-specialist settings are
resolved through app-owned model policy. Model-policy changes require the
dedicated permission, passing evals, audit, and rollback protection. Hard
budgets and rate limits apply to agents, subagents, dynamic workflows, evals,
judges, retries, and other expensive features; emergency override is separately
permissioned and audited.

### 8. Verification is part of the architecture, not a launch afterthought

Every implementation slice must prove its externally observable policy and
safety outcomes through focused tests plus the repository's formatting,
`skills:verify`, lint, workspace-contract, data-boundary, typecheck, build, and
unit-test gates. The final launch gate must prove identity and ownership,
audit/redaction, evals, protected-area enforcement, budgets, kill switches,
rollback, retention, notification safety, deployment compatibility, and
operator runbooks before activation.

## Consequences

- Eve can be implemented incrementally without granting incremental production
  autonomy.
- All autonomous actions incur policy, identity, budget, and audit checks.
- High-risk operations remain slower because human review is deliberate.
- Governance data and runtime durability have separate, explicit owners.
- Memory, prompts, tools, plugins, and model output cannot become authority.
- Vercel and Supabase provisioning are implementation concerns for later
  slices, not evidence that #417 itself activates a runtime.

## Alternatives rejected

- **Runtime first, governance later:** rejected because authorization and stop
  controls must exist before autonomous behavior.
- **One identity inferred from prompts or payloads:** rejected because it would
  make tenant and actor scope attacker- or model-controlled.
- **A switch per integration:** rejected because fragmented activation makes it
  difficult to prove that the whole system is off.
- **Skills or memory as the autonomy contract:** rejected because neither is an
  app-owned, reviewable policy and neither can own approvals, budgets, or
  emergency controls.
- **Hard-code one model provider:** rejected because provider choice must remain
  governed, evaluated, budgeted, and reversible.
