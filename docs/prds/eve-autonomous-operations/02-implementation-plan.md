# Eve Autonomous Operations Platform Implementation Plan

Status: child issues published on 2026-06-29.

Parent PRD:
[PRD 1: Eve Autonomous Operations Platform](./01-eve-autonomous-operations-platform.md)

Parent issue: https://github.com/Asymmetric-al/core/issues/416

## Published Issues

| Slice                                            | Issue                                                    | Type |
| ------------------------------------------------ | -------------------------------------------------------- | ---- |
| 1. Spec and ADR Foundation                       | [#417](https://github.com/Asymmetric-al/core/issues/417) | HITL |
| 2. Governance Kernel and Release Switch          | [#418](https://github.com/Asymmetric-al/core/issues/418) | AFK  |
| 3. Audit Tracer Bullet                           | [#419](https://github.com/Asymmetric-al/core/issues/419) | AFK  |
| 4. Kill-Switch Control Path                      | [#420](https://github.com/Asymmetric-al/core/issues/420) | AFK  |
| 5. Model Policy Tracer Bullet                    | [#421](https://github.com/Asymmetric-al/core/issues/421) | AFK  |
| 6. Private Admin Memory Tracer Bullet            | [#422](https://github.com/Asymmetric-al/core/issues/422) | AFK  |
| 7. Approval and Budget Policy Tracer Bullet      | [#423](https://github.com/Asymmetric-al/core/issues/423) | AFK  |
| 8. Retention and Replay Artifact Tracer Bullet   | [#424](https://github.com/Asymmetric-al/core/issues/424) | AFK  |
| 9. Standalone Eve Runtime Foundation             | [#425](https://github.com/Asymmetric-al/core/issues/425) | AFK  |
| 10. Current Admin Auth and Session Ownership     | [#426](https://github.com/Asymmetric-al/core/issues/426) | AFK  |
| 11. Admin Workspace Operations Shell             | [#427](https://github.com/Asymmetric-al/core/issues/427) | AFK  |
| 12. Admin Mount and Global Panel                 | [#428](https://github.com/Asymmetric-al/core/issues/428) | HITL |
| 13. Sandbox Engineering Worker                   | [#429](https://github.com/Asymmetric-al/core/issues/429) | AFK  |
| 14. GitHub App Read and Review Path              | [#430](https://github.com/Asymmetric-al/core/issues/430) | AFK  |
| 15. Autonomous PR Operator and Work Initiation   | [#431](https://github.com/Asymmetric-al/core/issues/431) | AFK  |
| 16. Strict Auto-Merge Policy                     | [#432](https://github.com/Asymmetric-al/core/issues/432) | HITL |
| 17. Subagent Catalog and Shared Run Context      | [#433](https://github.com/Asymmetric-al/core/issues/433) | AFK  |
| 18. Dynamic Workflow Orchestration               | [#434](https://github.com/Asymmetric-al/core/issues/434) | HITL |
| 19. Engineering Health Monitors                  | [#435](https://github.com/Asymmetric-al/core/issues/435) | AFK  |
| 20. Email and Discord Notifications              | [#436](https://github.com/Asymmetric-al/core/issues/436) | AFK  |
| 21. Final Release Switch and Launch Verification | [#437](https://github.com/Asymmetric-al/core/issues/437) | HITL |

## Planning Rules

- Use phased PRs with one controlled release switch.
- Build governance before live autonomy.
- Prefer tracer-bullet slices that are independently verifiable.
- Child issues are published; use the issue map above as the tracker source.
- Keep Eve disabled by default until governance, auth, audit, evals,
  protected-area policy, kill switches, and rollback paths are verified.
- Every implementation slice must preserve OpenSpec, AGENTS, repo rulebooks,
  data-access boundaries, tenant isolation, and existing CI gates.

## Issue Breakdown

### 1. Spec and ADR Foundation

- Type: HITL
- Blocked by: None
- Architecture decision:
  [ADR-0018: Govern Eve autonomy behind one disabled-by-default release
  gate](../../adr/0018-governed-eve-autonomy.md)
- User stories covered: 15, 16, 17, 70, 71, 72, 76
- What it proves: Eve autonomy is defined in OpenSpec and one initial ADR
  before runtime code exists.
- Acceptance focus:
  - OpenSpec change captures Eve as an autonomous operations platform.
  - ADR records the autonomy model, auto-merge policy, production-write policy,
    and governance guardrails.
  - Verification contract and release-switch strategy are documented.

### 2. Governance Kernel and Release Switch

- Type: AFK
- Blocked by: 1
- Architecture decision:
  [ADR-0019: Gate Eve autonomy through one app-owned governance
  kernel](../../adr/0019-eve-governance-kernel.md)
- User stories covered: 25, 26, 35, 65, 70
- What it proves: the platform can persist and display Eve system state while
  Eve remains disabled by default.
- Acceptance focus:
  - Governance data model supports release switch state, kill-switch state,
    run summaries, and policy status.
  - Admin can see Eve disabled/enabled state and emergency status.
  - Tests prove disabled mode blocks autonomous behavior.

### 3. Audit Tracer Bullet

Canonical decision: [ADR-0020: Persist redacted, accountable Eve action
records](../../adr/0020-eve-audit-tracer.md).

- Type: AFK
- Blocked by: 2
- User stories covered: 5, 6, 7, 8, 32, 33, 34
- What it proves: one safe Eve-like action can create a rich audit record and
  redacted debug package metadata.
- Acceptance focus:
  - Audit records actor, initiator, identity mode, policy, action, target,
    result, model role placeholder, and evidence summary.
  - Admin can inspect audit history and a high-quality decision summary.
  - Redaction rules are represented in tests.

### 4. Kill-Switch Control Path

Canonical decision: [ADR-0021: Restrict Eve through atomic, app-owned kill
switches](../../adr/0021-eve-kill-switch-control.md).

- Type: AFK
- Blocked by: 2, 3
- User stories covered: 35, 42, 53, 54, 56, 57
- What it proves: platform owners can stop Eve automation from the admin
  workspace before runtime integrations exist.
- Acceptance focus:
  - Kill switches cover all automation, active runs, GitHub actions,
    production writes, sandbox networking, dynamic workflows, model-policy
    changes, and force-approval mode.
  - Kill-switch changes create audit records.
  - Policy checks consume kill-switch state.

### 5. Model Policy Tracer Bullet

Canonical decision: [ADR-0022: Govern Eve model routing through an eval-gated
policy control plane](../../adr/0022-eve-model-policy-control-plane.md).

- Type: AFK
- Blocked by: 2, 3, 4
- User stories covered: 36, 37, 38, 39, 40, 41, 42, 43, 46
- What it proves: authorized admins can draft, evaluate, activate, and roll
  back a model policy change without touching Eve runtime code.
- Acceptance focus:
  - Shared model policy supports named roles, Gateway-primary routing, direct
    provider fallback eligibility, budgets, and per-subagent overrides.
  - Dedicated AI settings permission gates edits.
  - Activation is eval-gated and rollback-capable.

### 6. Private Admin Memory Tracer Bullet

Canonical decision: [ADR-0023: Bound Eve memory to private, excluded,
human-controlled context](../../adr/0023-eve-private-admin-memory.md).

- Type: AFK
- Blocked by: 2, 3
- User stories covered: 18, 19, 20, 21, 22, 23, 24, 69
- What it proves: Eve can save and manage allowed private admin memory with
  full control and audit.
- Acceptance focus:
  - Admin memory supports preferences, project context, and decisions.
  - Exclusions block secrets, credentials, payment data, donor or customer PII,
    private keys, one-time codes, and sensitive tenant facts.
  - Admin can view, search, edit, delete, disable, and inspect change history.
  - Schema can support future tenant operational memory without enabling it.

### 7. Approval and Budget Policy Tracer Bullet

Canonical decision: [ADR-0024: Classify Eve actions by trust zone and reserve
hard budgets atomically](../../adr/0024-eve-approval-budget-policy.md).

- Type: AFK
- Blocked by: 2, 3, 4, 5
- User stories covered: 29, 30, 31, 42
- What it proves: one operational action can be allowed, denied, or paused by
  trust-zone policy and budget state.
- Acceptance focus:
  - Engineering, product/admin, and memory policies are separate.
  - Hard budgets and emergency override are enforceable and audited.
  - Operational production writes are distinct from blocked business-data
    writes.

### 8. Retention and Replay Artifact Tracer Bullet

Implementation: private Storage artifacts, relational redacted metadata,
tenant/owner-scoped signed access, human incident/legal holds, and two-phase
expiry are delivered by issue #424 and ADR-0025.

- Type: AFK
- Blocked by: 2, 3
- User stories covered: 33, 66, 67, 68, 69
- What it proves: redacted replay/debug artifacts and audit records can be
  retained, expired, or held by category.
- Acceptance focus:
  - 180-day default retention is represented.
  - Category overrides and incident/legal holds are supported.
  - Large artifact metadata is queryable while artifact content lives in
    storage.

### 9. Standalone Eve Runtime Foundation

Implementation: the isolated Node.js 24+ Eve 0.25.1 workspace package,
disabled capability surface, app-owned governance activation boundary, and
offline framework verification are delivered by issue #425 and ADR-0062.

- Type: AFK
- Blocked by: 1, 5, 7
- User stories covered: 1, 2, 17, 36, 41, 73, 76, 77
- What it proves: the repo can host an isolated Eve runtime package that builds,
  reports health, reads installed Eve docs, and runs a minimal eval while the
  release switch remains off.
- Acceptance focus:
  - Installed Eve docs are read and summarized before coding.
  - Runtime is isolated from the three Next apps until admin mount is proven.
  - `eve info`, `eve build`, and a minimal eval pass locally.

### 10. Current Admin Auth and Session Ownership

Implementation: verified Supabase admin route identity, explicit accountable
service identity, app-owned session ACL metadata, and ownership enforcement for
session and governance-artifact access are delivered by issue #426 and
ADR-0027.

- Type: AFK
- Blocked by: 6, 7, 9
- User stories covered: 5, 6, 7, 30, 31, 74, 75
- What it proves: Eve route auth maps current admin identity and enforces
  session ownership before admin UI mount.
- Acceptance focus:
  - Tenant and user are derived from verified session context only.
  - Session create, continue, stream, approval response, memory, audit, and
    replay access enforce ownership.
  - Service identity works for background jobs with explicit initiator metadata.

### 11. Admin Workspace Operations Shell

Implementation: the admin-only operations-first panel index, real governance
and failure summaries, model-policy-backed eval/subagent health, explicit
unavailable future connections, and safe secondary-chat boundary are delivered
by issue #427 and ADR-0028.

- Type: AFK
- Blocked by: 2, 3, 4, 5, 6, 7, 8
- User stories covered: 22, 25, 26, 34, 35, 37, 38, 42, 67
- What it proves: Mission Control has an operations-first Eve workspace backed
  by real governance state, not mock data.
- Acceptance focus:
  - Workspace shows active run summaries, approvals, recent actions, budgets,
    failures, GitHub activity placeholders, eval health, memory, model policy,
    subagents, notifications, audit, and emergency controls.
  - Admin controls are role-gated.
  - UI exposes decision summaries, not raw hidden reasoning.

### 12. Admin Mount and Global Panel

Implementation: the Next.js 16.2.6-compatible same-origin Eve mount, protected
admin-only global panel, explicit page-context allowlist, and forwarded-request
cookie authentication are delivered by issue #428 and ADR-0029.

- Type: HITL
- Blocked by: 9, 10, 11
- User stories covered: 25, 26, 27, 28, 73, 74, 75
- What it proves: Eve can be mounted into admin through the compatible Next.js
  path and provide a global panel with basic page context only.
- Acceptance focus:
  - Compatibility with the installed Next.js version is proven or explicitly
    blocked on stable 16.3 rollout.
  - The global panel receives route, page identity, selected tenant/org, and
    safe UI state.
  - Raw records, payment data, donor details, table rows, and sensitive form
    values are not sent silently.

### 13. Sandbox Engineering Worker

Implementation: the Eve 0.25.1 per-session writable sandbox, deny-first
app-owned network authorization, protected/sensitive-file guardrails, and
redacted command/write audit are delivered by issue #429 and ADR-0030.

- Type: AFK
- Blocked by: 4, 7, 9
- User stories covered: 55, 56, 57
- What it proves: Eve can use a writable repo checkout in sandbox with allow-all
  network and compensating controls.
- Acceptance focus:
  - Sandbox has no mounted secrets, no env files, no service-role keys, and no
    production data dumps.
  - Egress and commands are audited where available.
  - Sensitive-file scanner and protected-file detection can pause risky runs.
  - Sandbox networking kill switch works.

### 14. GitHub App Read and Review Path

Implementation: Eve 0.25.1's native verified GitHub App channel, automatic PR
review trigger, policy-gated summary plus inline findings, protected-area
visibility, output data-boundary enforcement, and accountable #419 audit are
delivered by issue #430 and ADR-0063.

- Type: AFK
- Blocked by: 3, 7, 9, 13
- User stories covered: 8, 9, 10, 32, 34, 60
- What it proves: Eve can respond to GitHub PR triggers by reviewing and
  posting summary plus inline findings with accountability metadata.
- Acceptance focus:
  - GitHub bot identity executes actions while accountable trigger is recorded.
  - Review comments are policy-gated and audited.
  - Protected-area detection is visible in review output.

### 15. Autonomous PR Operator and Work Initiation

- Type: AFK
- Blocked by: 7, 13, 14
- User stories covered: 11, 14, 15, 16, 30, 31
- What it proves: Eve can create issues, branches, PRs, labels, rerun CI, push
  safe fixes, and update PR state under policy.
- Acceptance focus:
  - Eve-initiated work follows issue-first flow.
  - Engineering autonomy is allowed while business-data writes stay blocked.
  - Every GitHub operation has policy, audit, and accountable initiator.

### 16. Strict Auto-Merge Policy

- Type: HITL
- Blocked by: 14, 15
- User stories covered: 12, 13, 31, 32
- What it proves: Eve can merge only when strict safe policy passes and
  protected areas are absent.
- Acceptance focus:
  - Auto-merge passes for safe PRs with required checks and reviews satisfied.
  - Auto-merge blocks for repo-aware protected areas.
  - Human escalation path is explicit.

### 17. Subagent Catalog and Shared Run Context

- Type: AFK
- Blocked by: 5, 7, 9
- User stories covered: 44, 45, 46, 47, 48, 49, 50, 51, 52
- What it proves: Eve can delegate to the initial subagent catalog and preserve
  structured shared run context with provenance and conflict handling.
- Acceptance focus:
  - Initial specialist catalog exists as real Eve subagents.
  - Per-subagent model role, budget, eval gate, and routing policy are defined.
  - Shared context writes require schema, provenance, confidence, risk, source
    evidence, and conflict preservation.

### 18. Dynamic Workflow Orchestration

- Type: HITL
- Blocked by: 4, 7, 17
- User stories covered: 47, 48, 49, 53, 54
- What it proves: broad dynamic workflows can orchestrate subagents while risk
  escalation and kill switches remain effective.
- Acceptance focus:
  - Dynamic workflows are enabled only behind governance gates.
  - Workflow failures escalate by risk.
  - Suspicious or protected-area behavior pauses the run and records audit.

### 19. Engineering Health Monitors

- Type: AFK
- Blocked by: 7, 11, 14, 17
- User stories covered: 58, 59, 60
- What it proves: schedules/background monitors can detect engineering health
  signals and initiate governed follow-up.
- Acceptance focus:
  - Monitors cover CI failures, stale PRs, failing evals, dependency/security
    alerts, protected-area PRs, and budget/rate-limit issues.
  - Monitors can create audited issues or comments under policy.
  - Product opportunity scanning remains disabled.

### 20. Email and Discord Notifications

- Type: AFK
- Blocked by: 3, 7, 8, 19
- User stories covered: 61, 62, 63, 64
- What it proves: Eve can notify platform owners by email and Discord with
  redaction and safe-rich-detail policy.
- Acceptance focus:
  - Email durable records go to platform owners only.
  - Discord urgent alerts can include rich safe details after policy checks.
  - Notification dedupe, audit, redaction, and pause state are tested.

### 21. Final Release Switch and Launch Verification

- Type: HITL
- Blocked by: 1-20
- User stories covered: 1-77
- What it proves: all governance, runtime, UI, GitHub, subagents, workflows,
  monitors, memory, notifications, and emergency controls are ready to activate
  together.
- Acceptance focus:
  - Release switch remains off until all required checks pass.
  - End-to-end launch checklist proves auth, audit, evals, protected-area
    policy, kill switches, rollback, retention, and notification safety.
  - Documentation points operators to the right runbooks and emergency controls.

## Dependency Shape

```text
1
└─ 2
   ├─ 3 ─ 4
   ├─ 5
   ├─ 6
   ├─ 7
   ├─ 8
   ├─ 9 ─ 10 ─ 11 ─ 12
   ├─ 13 ─ 14 ─ 15 ─ 16
   ├─ 17 ─ 18
   ├─ 19 ─ 20
   └─ 21 depends on all previous slices
```

## Publication Notes

- Child issues were published in dependency order under parent issue
  [#416](https://github.com/Asymmetric-al/core/issues/416).
- Each child issue includes the parent reference, source PRD path, source plan
  path, slice type, user stories covered, acceptance criteria, and blocking
  issue references.
- Each child issue has one complexity label, one status label, one type label,
  and `ready-for-agent`.
