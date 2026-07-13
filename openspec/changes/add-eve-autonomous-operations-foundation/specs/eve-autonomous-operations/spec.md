# Delta for Eve Autonomous Operations

## ADDED Requirements

### Requirement: Eve Autonomy Is Defined In OpenSpec Before Runtime Code

Eve autonomy MUST be defined as durable OpenSpec intent before any Eve runtime code, schema, admin
UI, or GitHub automation is implemented. Delivery MAY use phased PRs, but activation MUST use a
single controlled release switch, and that release switch MUST remain off until governance, auth,
audit, evals, protected-area policy, kill switches, and rollback paths are verified.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

#### Scenario: A contributor proposes Eve runtime code before the spec/ADR foundation exists

- GIVEN no accepted OpenSpec change and ADR define Eve's autonomy contract
- WHEN a contributor proposes Eve runtime code, governance schema, admin mount, or GitHub automation
- THEN the work is deferred until this foundation change and its ADR are accepted
- AND the release switch remains off regardless of how many later slices are implemented

#### Scenario: A later slice is ready to ship behind flags

- GIVEN a later Eve slice (governance kernel, runtime, GitHub operator, subagents, and similar) is implemented
- WHEN it is merged
- THEN it ships disabled behind the governance release switch and feature flags
- AND it does not enable live autonomous behavior until the final release-switch verification passes

### Requirement: Eve Follows A Layered Source-Of-Truth Order

Eve MUST resolve authority in a layered order and MUST NOT let lower layers override higher ones.
OpenSpec and repo instructions define intent and rules; runtime, GitHub, CI, evals, and logs define
current reality; official framework and package docs define API facts; memory is helpful context
only and is never authoritative. Eve implementation MUST preserve `AGENTS.md` and OpenSpec as higher
authority than agent memory or provider plugins. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md] [VERIFIED-REPO: AGENTS.md] [VERIFIED-REPO: openspec/project.md]

#### Scenario: Eve memory conflicts with OpenSpec or repo rules

- GIVEN Eve holds a remembered preference or prior decision
- WHEN that memory conflicts with OpenSpec intent, `AGENTS.md`, or a `docs/ai/rules/*` rulebook
- THEN Eve follows the higher-authority source and treats memory as non-authoritative context
- AND Eve does not act on remembered preference in a way that overrides product intent or repo rules

#### Scenario: A provider plugin suggests behavior contrary to repo instructions

- GIVEN a provider plugin or Codex-style capability layer proposes an action
- WHEN that action conflicts with OpenSpec or repo-local instructions
- THEN repo-local instructions and OpenSpec take precedence
- AND the plugin layer is treated as a conditional helper, not a source of truth

### Requirement: Eve Product Changes Take A Spec-First Path

Eve MAY propose and implement product features, but any product-direction change MUST update
OpenSpec before implementation proceeds, so product intent stays explicit and legible.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
[VERIFIED-REPO: docs/ai/rules/openspec.md]

#### Scenario: Eve invents a new product feature

- GIVEN Eve identifies a useful new product feature
- WHEN Eve begins work on it
- THEN Eve first creates or updates an OpenSpec change under `openspec/changes/<change-id>/`
- AND implementation proceeds only after the durable product intent is captured in OpenSpec

### Requirement: Eve Autonomy Is Recorded In An ADR

The repository MUST record an initial Architecture Decision Record for Eve autonomy that explains
why an AI agent may initiate work, operate PRs, auto-merge under strict policy, and write
operational records, together with the governance guardrails that bound those powers. Later Eve
slices MUST be traceable to this recorded decision. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

#### Scenario: A reviewer asks why Eve is allowed to operate PRs

- GIVEN a contributor or auditor questions Eve's authority to initiate work or auto-merge
- WHEN they consult the repo's decision records
- THEN a recorded ADR states the autonomy model, auto-merge policy, production-write policy, and guardrails
- AND the answer does not depend on scattered prompts, comments, or memory

### Requirement: The Eve Governance Data Model Is Defined At Spec Level

The governance data model MUST be defined at the spec level before implementation, and MUST cover
release-switch state, kill-switch state, audit records, approvals, model policy, budgets,
notification records, run summaries, shared-run-context metadata, private admin memory, and
retention state. Governance persistence MUST be owned by app data; Eve's own sessions and workflow
durability remain owned by the Eve runtime and its host workflow system. Retention MUST be
category-based with a 180-day default, and incident or legal holds MUST be able to override normal
retention. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

#### Scenario: The governance kernel slice begins

- GIVEN the governance kernel slice (#418) is ready to start
- WHEN it defines persistence for Eve system state
- THEN the schema supports release-switch state, kill-switch state, run summaries, and policy status
- AND admin can see Eve's disabled/enabled and emergency state while Eve remains disabled by default

#### Scenario: A retention policy is applied to Eve records

- GIVEN Eve audit, run, or replay records exist
- WHEN retention runs
- THEN records follow a category-based 180-day default
- AND an incident or legal hold overrides deletion for the affected records

### Requirement: Protected Areas Block Autonomous Write And Auto-Merge

Eve MUST NOT autonomously perform broad customer, donor, payment, identity, tenant-ownership, auth,
secret, migration, or destructive production writes; those require stricter human-gated approval.
Eve MAY write operational records (tasks, notes, labels, internal statuses, workflow metadata,
memory, model settings, review artifacts) under policy. Auto-merge MUST be blocked whenever a change
touches a repo-aware protected area, which includes at least: auth, donations, payments, secrets,
environment config, Supabase migrations, RLS, production deployment config, tenant resolution, admin
access control, data-access-boundary changes, GitHub workflows, Vercel config, agent instructions,
Eve config, package changes, dependency changes, and runtime changes. Tenant and user identity MUST
always be derived from verified session context only, never from prompts, model output, or tool
input. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
[VERIFIED-REPO: openspec/specs/platform-boundaries/spec.md] [VERIFIED-REPO: docs/ai/rules/backend.md]

#### Scenario: An Eve-eligible PR touches a protected area

- GIVEN a PR modifies migrations, RLS, auth, payments, agent instructions, Eve config, or package/dependency/runtime files
- WHEN Eve evaluates it for auto-merge
- THEN auto-merge is blocked and the change is routed to human review
- AND the protected-area determination is recorded for audit

#### Scenario: Eve attempts a broad business-data write

- GIVEN Eve would write to customer, donor, payment, identity, tenant-ownership, auth, secret, or migration records
- WHEN the action is requested without the required human-gated approval
- THEN the write is blocked
- AND only operational records remain writable under policy

#### Scenario: A tenant id arrives from model or tool input

- GIVEN a prompt, model output, or tool response supplies a tenant or user id
- WHEN Eve resolves the acting tenant and user
- THEN Eve uses only the verified session context
- AND it never treats prompt-, model-, or tool-supplied ids as authority

### Requirement: The Eve Model Policy Is Gateway-Primary, Role-Based, And Eval-Gated

The shared Eve model policy MUST use Vercel AI Gateway as the primary route with direct providers as
controlled fallbacks, MUST use named model roles and per-subagent settings rather than a hardcoded
model, MUST be editable only with a dedicated AI-settings permission, and MUST be eval-gated on
activation and rollback-protected. Hard budgets and rate limits with audited emergency override MUST
apply to roles, subagents, dynamic workflows, evals, and judge models. A partner GPU endpoint is
admissible only as a proposed provider/role/fallback under this policy, never as a hardcoded default.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

#### Scenario: An AI-settings admin activates a model-policy change

- GIVEN an authorized admin with the dedicated AI-settings permission drafts a model-policy change
- WHEN they attempt to activate it
- THEN activation is gated on passing evals and is rollback-protected
- AND the change is audited

#### Scenario: A partner GPU provider is proposed for a role

- GIVEN a partner GPU endpoint is offered for a model role or fallback
- WHEN it is added to the model policy
- THEN it is represented as a proposed provider/role/fallback, not a hardcoded default
- AND it remains subject to budgets, kill switches, audit, and instant revocation
