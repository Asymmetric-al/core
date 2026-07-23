# eve-runtime-foundation Specification

## Purpose

Define the isolated, disabled-by-default Eve runtime foundation, including its
installed-document authority, local framework proof, session-ownership
boundary, and fail-closed integration with app-owned governance.

## Requirements

### Requirement: The Eve Runtime Is An Isolated Dedicated Workspace Package

The Eve runtime MUST begin as a **dedicated workspace package** whose Node and dependency needs are isolated
from the three Next apps (admin, donor, missionary), so Eve's runtime footprint can be validated before admin
mounting. The runtime MUST remain **isolated from the three Next apps until the #428 admin mount is proven**
compatible with the installed Next.js version; it MUST NOT import app runtime code and no app MUST import the
runtime before that mount. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:367]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:370]

#### Scenario: The runtime is a standalone package

- GIVEN the Eve runtime is added to the repo
- WHEN a reviewer inspects the workspace
- THEN the runtime is a dedicated workspace package with its own Node and dependency footprint
- AND it is isolated from the admin, donor, and missionary Next apps

#### Scenario: The runtime stays isolated until admin mount is proven

- GIVEN the #428 admin mount has not yet proven Next.js compatibility
- WHEN the runtime package is built or run locally
- THEN it does not import the three Next apps' runtime code and no app imports it
- AND admin integration is deferred to the #428 mount

### Requirement: The Runtime Reads Installed Eve Docs Before Coding And Never Codes From Memory

The runtime MUST **read and summarize the installed Eve (Vercel) framework docs after the package is added**,
before runtime coding proceeds. Runtime coding MUST NOT depend on memory of upstream APIs; official framework
and package docs are the **API-fact layer** of the source-of-truth order and MUST be consulted for API facts.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:363]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:401]

#### Scenario: Installed docs are read and summarized first

- GIVEN the Eve framework package has just been added
- WHEN runtime work begins
- THEN the installed Eve docs are read and summarized before coding against the framework
- AND the summary is available for review

#### Scenario: Runtime coding does not rely on remembered APIs

- GIVEN a runtime code path calls an Eve framework API
- WHEN a reviewer checks the basis for that call
- THEN it is grounded in the installed docs, not memory of upstream APIs
- AND framework docs are treated as the API-fact source, above memory

### Requirement: The Runtime Provides Local Verification With The Release Switch Off

The runtime MUST expose local verification that passes while the **release switch remains off** and the package
is **disabled by default**: an **`eve info`** command that reports runtime health and the read docs, an
**`eve build`** command, and a **minimal eval** that all pass locally. None of these MUST enable live autonomy,
admin mounting, or any production action. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:166]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]

#### Scenario: Local verification passes with the switch off

- GIVEN the Eve release switch is off and the runtime is disabled by default
- WHEN a developer runs `eve info`, `eve build`, and the minimal eval locally
- THEN each reports health/build/eval success
- AND no live autonomy, admin mount, or production action is triggered

#### Scenario: The runtime does not run live while disabled

- GIVEN the release switch is off
- WHEN the runtime is invoked beyond local verification
- THEN it does not perform autonomous or production-affecting work
- AND it stays off until governance, auth, audit, evals, protected-area policy, kill switches, and rollback are
  verified

### Requirement: The Runtime Owns Its Own Session And Workflow Durability

The Eve runtime MUST own **its own sessions and workflow durability** through the runtime and its host workflow
system. Governance persistence — audit, approvals, memory, model policy, budgets, notification records, run
summaries, shared run context metadata, kill-switch state, release switches, and retention state — MUST remain
**Supabase-owned app data** (#418); the runtime MUST NOT persist governance state itself.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:404]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:408]

#### Scenario: Sessions live in the runtime, governance in Supabase

- GIVEN the runtime maintains an Eve session and workflow durability
- WHEN a reviewer traces where state lives
- THEN session and workflow durability are owned by the runtime and its host workflow system
- AND governance state (audit, approvals, memory, model policy, budgets, kill-switch/release state) lives in
  Supabase-owned app data, not the runtime

### Requirement: The Runtime Resolves Models Through #421 Policy And Spends Under #423 Budgets

The runtime MUST resolve **every model through the #421 shared model policy** (Gateway-primary; any direct
provider — including a partner GPU inference gateway — a controlled, non-default, revocable fallback) and MUST
NOT hardcode a model or provider in runtime code. All runtime work, including the minimal eval, MUST spend
**under #423 hard budgets and rate limits**. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:187]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:205]

#### Scenario: A model is resolved through the shared policy

- GIVEN the runtime needs a model for a role
- WHEN it resolves the model
- THEN it resolves through the #421 shared model policy, not a hardcoded model id or provider
- AND routing stays Gateway-primary with any direct provider only as a non-default, revocable fallback

#### Scenario: Runtime work stays within budget

- GIVEN the runtime runs its minimal eval or other work
- WHEN that work consumes model calls
- THEN the spend is bounded by the #423 hard budgets and rate limits for its role
- AND work is refused or degraded per policy rather than spending past the ceiling

### Requirement: The Runtime Follows The Layered Source-Of-Truth Order And Grants No New Authority

The runtime MUST follow the **layered source-of-truth order** — OpenSpec and repo instructions define intent
and rules; runtime, GitHub, CI, evals, and logs define current reality; official framework/package docs define
API facts; memory is helpful context only — and MUST preserve **AGENTS and OpenSpec as higher authority** than
agent memory or provider plugins. The runtime MUST only add an isolated, off-by-default host; it MUST NOT widen
Eve's authority, MUST NOT bypass #417 protected-area/production-write/approval limits or #418 emergency-off
precedence, and MUST read only persisted app-owned governance state, never a prompt/model/tool claim that a
switch is off. The foundation MAY include disabled local verification runtime code, but MUST NOT introduce a
live model/provider path, an app mount, deployment, or autonomous effect.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:399]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:339]
[VERIFIED-REPO: openspec/project.md] [VERIFIED-REPO: AGENTS.md]

#### Scenario: Memory never overrides OpenSpec or AGENTS

- GIVEN memory suggests a preference that conflicts with OpenSpec or AGENTS
- WHEN the runtime decides how to act
- THEN OpenSpec and repo instructions win as higher authority and memory stays advisory only
- AND the layered order (intent > reality > API docs > memory) is preserved

#### Scenario: The runtime grants no new authority

- GIVEN the runtime is present and every kill switch is cleared
- WHEN Eve evaluates an action that touches a protected area or requires approval
- THEN the #417 protected-area and approval rules and #418 emergency-off precedence still apply and can block it
- AND the runtime never overrides those higher-authority constraints
