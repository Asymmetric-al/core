# PRD 1: Eve Autonomous Operations Platform

## Problem Statement

The platform needs an AI operations layer that can do more than answer
questions. The desired system should understand the repo, the admin surface,
GitHub work, product intent, model policy, eval health, memory, approvals, and
operational signals well enough to move work forward with meaningful autonomy.

Today, agent work depends on individual coding sessions, external tools, and
manual coordination. The repo already has strong instructions, OpenSpec
governance, Mission Control, Supabase, GitHub workflows, and validation gates,
but those pieces do not yet form one durable, observable AI operating system.
That leaves too much useful automation trapped in ad hoc prompts, one-off
review comments, and manual follow-up.

The user wants Eve to become a fully live autonomous operator for this repo and
admin platform. That creates real risk. Eve must be able to review, initiate,
coordinate, remember, notify, and act, but it must not silently weaken tenant
isolation, product intent, money integrity, permission correctness, auditability,
or production safety.

## Solution

Build Eve as the repo's autonomous operations platform using the Vercel Eve
framework. Eve will be mounted into the admin experience, operate in GitHub,
coordinate specialized subagents, run dynamic workflows, maintain private admin
memory, manage model policy, monitor engineering health, and write operational
records under explicit policy.

The system name is Eve. Documentation must distinguish:

- Eve framework: the upstream `eve` package and runtime.
- Eve agent: this repo's configured autonomous agent.
- Eve admin workspace: the Mission Control UI for runs, audit, memory, model
  policy, budgets, approvals, and controls.
- Eve GitHub operator: the GitHub App or bot behavior.
- Eve governance data: Supabase-owned policy, audit, memory, model, budget,
  notification, and retention records.

The first implementation program should be governance-first. PR 1 should define
the OpenSpec change, the initial ADR for autonomy, the governance data model at
the spec level, the rollout plan, and the verification contract. Later PRs can
ship the runtime, admin UI, GitHub operator, subagents, dynamic workflows,
memory, notifications, and release switch behind feature flags.

The target state is full workflow readiness with one controlled release switch.
That means all major parts are implemented, governed, tested, and ready to turn
on together, rather than shipping as a toy foundation first.

## User Stories

1. As a platform owner, I want Eve to operate across admin, GitHub, and repo
   workflows, so that repeated operational work becomes durable system behavior.

2. As a platform owner, I want Eve to be fully live behind policy, so that it
   can act without constant manual prompting.

3. As a platform owner, I want Eve to have broad engineering autonomy, so that
   it can review, fix, label, coordinate, and advance work without waiting on
   every small human decision.

4. As a platform owner, I want business data to stay locked behind stricter
   policy, so that autonomy does not weaken tenant safety, donor trust, money
   integrity, or identity correctness.

5. As an admin user, I want Eve to act as my current admin identity inside
   Mission Control, so that its product actions inherit my tenant, role, and
   permissions.

6. As an admin user, I want Eve's admin actions to be audited under my identity,
   so that the organization can tell who initiated each operation.

7. As a platform owner, I want Eve background jobs to use a service identity
   with explicit initiator metadata, so that scheduled and system work remains
   accountable.

8. As a platform owner, I want Eve's GitHub actions to execute through a bot
   while recording the accountable human or trigger, so that GitHub automation
   is practical and auditable.

9. As a reviewer, I want Eve to automatically review PRs, so that risks are
   surfaced quickly.

10. As a reviewer, I want Eve to post inline findings and summary comments, so
    that feedback is close to the code and easy to act on.

11. As a maintainer, I want Eve to act as an autonomous PR operator, so that it
    can label, rerun CI, push safe fixes, update PR state, and coordinate
    follow-up work under policy.

12. As a maintainer, I want Eve to auto-merge only when strict safe policy is
    satisfied, so that useful automation does not bypass protected review
    boundaries.

13. As a maintainer, I want protected areas to block auto-merge, so that auth,
    payments, tenant resolution, admin access control, data boundaries, package
    changes, runtime changes, GitHub workflows, Vercel config, agent
    instructions, Eve config, migrations, RLS, secrets, and production settings
    remain human-controlled.

14. As a platform owner, I want Eve to create issues, branches, PRs, and pushes
    for work it discovers, so that safe improvements do not wait for manual
    task creation.

15. As a product owner, I want Eve to propose and implement new product features
    only through a spec-first path, so that product direction remains explicit.

16. As a product owner, I want Eve-created product work to update OpenSpec
    before implementation proceeds, so that product intent stays legible.

17. As a maintainer, I want Eve to follow a layered source-of-truth model, so
    that it respects OpenSpec, repo instructions, runtime facts, official docs,
    and memory in the right order.

18. As a maintainer, I want Eve memory to be helpful but never authoritative, so
    that remembered preferences do not override product intent or repo rules.

19. As an admin user, I want Eve to remember my communication preferences,
    project working context, and implementation decisions, so that future
    sessions become more useful.

20. As an admin user, I want Eve memory to exclude secrets, credentials,
    payment data, donor or customer PII, private keys, one-time codes, and
    sensitive tenant facts, so that memory cannot become a hidden data leak.

21. As an admin user, I want Eve to auto-save allowed memory, so that useful
    context is not lost.

22. As an admin user, I want a memory management panel with search, edit,
    delete, disable, categories, scopes, and change history, so that I have full
    easy control over what Eve remembers.

23. As a platform owner, I want the memory schema designed for future
    tenant-scoped operational memory, so that the system can grow without a
    rewrite.

24. As a platform owner, I want tenant operational memory disabled until
    categories, retention, deletion, export, and audit rules are explicit, so
    that tenant facts are not stored casually.

25. As an admin user, I want an operations-first Eve admin workspace, so that I
    can see what Eve is doing before I chat with it.

26. As an admin user, I want the Eve workspace to show active runs, approvals,
    recent actions, budgets, failures, GitHub activity, eval health, memory,
    model policy, subagents, notifications, audit, and emergency controls, so
    that the system is observable.

27. As an admin user, I want a global Eve panel in Mission Control, so that I
    can ask for help from any admin page.

28. As an admin user, I want the global panel to receive basic page context, so
    that Eve knows the route, page, selected tenant, and safe UI state without
    ingesting raw records or sensitive form values.

29. As a platform owner, I want separate approval policies for engineering,
    product or admin actions, and memory, so that different trust zones have
    different rules.

30. As a platform owner, I want Eve to write operational production records
    under policy, so that it can update tasks, notes, labels, internal statuses,
    workflow metadata, memory, model settings, and review artifacts.

31. As a platform owner, I want Eve blocked from broad customer, donor, payment,
    identity, tenant ownership, auth, secret, migration, and destructive
    production writes without stricter approval, so that critical records remain
    protected.

32. As a platform owner, I want rich audit records for every meaningful Eve
    action, so that I can reconstruct who or what initiated the action, which
    tool or subagent ran, which model role was used, what policy applied, what
    evidence was used, and what changed.

33. As a platform owner, I want redacted replay and debug packages, so that
    failures can be investigated without storing unsafe raw data.

34. As an admin user, I want high-quality decision summaries instead of raw
    model reasoning, so that I understand why Eve acted without exposing hidden
    reasoning or sensitive internals.

35. As a platform owner, I want a full kill-switch suite, so that I can pause
    all automation, stop active runs, disable GitHub actions, disable
    production writes, disable sandbox networking, disable dynamic workflows,
    revoke model-policy changes, and force human approval for everything.

36. As a platform owner, I want a shared repo model policy, so that Eve, admin
    AI features, evals, and external coding-agent guidance can use consistent
    model roles.

37. As an AI settings admin, I want to edit Eve model settings from Mission
    Control, so that model routing can adapt without code changes.

38. As an AI settings admin, I want model changes to be eval-gated and rollback
    protected, so that changing models does not silently weaken Eve.

39. As a platform owner, I want model-policy editing guarded by a dedicated AI
    settings permission, so that normal admin access does not imply model
    authority.

40. As a platform owner, I want one platform model policy in v1, with schema
    room for tenant overrides later, so that model routing is manageable now
    and flexible later.

41. As a platform owner, I want Vercel AI Gateway as the primary model route
    and direct providers as controlled fallbacks, so that Eve has both
    operational consistency and flexibility.

42. As a platform owner, I want hard budgets and rate limits with emergency
    override, so that autonomous runs, subagents, evals, and judges cannot burn
    unbounded spend.

43. As an evaluator, I want Eve judge models to be configured separately from
    the agent model, so that eval quality can be measured independently.

44. As a platform owner, I want all initial specialists to be real Eve
    subagents, so that each responsibility has dedicated instructions, tools,
    evals, budgets, and routing rules.

45. As a platform owner, I want subagents for code review, CI triage, security,
    test planning, OpenSpec, data-boundary review, dependency review, docs sync,
    product strategy, UX review, migration planning, release coordination,
    memory curation, and future specialist areas, so that Eve can delegate
    deeply.

46. As a platform owner, I want each subagent to have its own model role,
    reasoning setting, fallback, budget, and eval gate, so that specialist
    quality can be tuned.

47. As a platform owner, I want Eve to use broad autonomous subagent delegation,
    so that the root agent can call specialists whenever it believes that
    improves the work.

48. As a platform owner, I want workflow-specific subagent caps in v1, designed
    toward adaptive caps later, so that delegation is powerful but bounded.

49. As a platform owner, I want subagents to collaborate through a shared
    structured run context, so that PR metadata, decisions, issue scope, safe
    page context, eval status, and findings can be reused.

50. As a platform owner, I want any subagent to write anywhere in shared run
    context, so that collaboration is flexible.

51. As a platform owner, I want shared run context writes to require schema
    validation, provenance, confidence, risk level, source evidence, and
    conflict handling, so that flexible collaboration remains auditable.

52. As a platform owner, I want conflicts preserved as disagreements rather
    than silently overwritten, so that Eve must resolve important conflicts
    before acting.

53. As a platform owner, I want broad dynamic workflows in v1, so that Eve can
    generate orchestration logic when it needs more flexible coordination.

54. As a platform owner, I want dynamic workflow failures to escalate by risk,
    so that harmless failures stop locally while protected-area or suspicious
    behavior pauses the run and may disable dynamic workflows.

55. As a platform owner, I want Eve's sandbox to have a writable repo checkout,
    so that it can inspect, edit, test, commit, and push engineering work.

56. As a platform owner, I want sandbox network access to be allow-all with
    strong containment, so that Eve can work flexibly while compensating for
    exfiltration risk.

57. As a platform owner, I want no secrets, no environment files, no
    service-role keys, no production dumps, egress and command audit,
    sensitive-file scanning, protected-file detection, and emergency kill
    switches around the sandbox, so that allow-all networking is contained.

58. As a platform owner, I want broad schedules and background monitors in v1,
    so that Eve can proactively catch operational issues.

59. As a platform owner, I want engineering health monitors first, designed
    toward product opportunity scanning later, so that day-one monitoring is
    useful and not noisy.

60. As a platform owner, I want Eve to monitor CI failures, stale PRs, failing
    evals, dependency or security alerts, protected-area PRs, and budget or
    rate-limit issues, so that engineering health is continuously visible.

61. As a platform owner, I want external notifications in v1, so that important
    Eve events are not trapped inside the admin UI.

62. As a platform owner, I want email plus Discord notifications, so that email
    provides durable owner records and Discord provides urgent ops awareness.

63. As a platform owner, I want Discord messages to include rich details only
    when policy says they are safe, so that urgent context is useful without
    leaking sensitive data.

64. As a platform owner, I want Eve email notifications to go to platform owners
    only in v1, so that durable external records have a clear audience.

65. As a platform owner, I want Eve governance data in Supabase tables, so that
    memory, approvals, audit, model policy, budgets, notifications, and
    retention are governed by the app.

66. As a platform owner, I want large replay and debug artifacts in Supabase
    Storage with table metadata, so that Postgres remains queryable and does
    not become an artifact bucket.

67. As a platform owner, I want category-based retention with a 180-day default,
    so that logs and artifacts are useful for operations without being retained
    indefinitely.

68. As a platform owner, I want security or incident holds to override normal
    retention, so that investigations are not prematurely deleted.

69. As a platform owner, I want memory retention to be controlled separately
    from run logs, so that useful memory can remain while memory history and
    deleted entries follow clear policy.

70. As a platform owner, I want phased PRs with one release switch, so that the
    system can be reviewed safely while still shipping as one complete
    capability.

71. As a platform owner, I want PR 1 to be planning and spec-first, including
    governance data model at the spec level, so that the high-autonomy system
    has a durable contract before code exists.

72. As a platform owner, I want an initial ADR for Eve autonomy, so that future
    contributors understand why an AI agent may initiate work, operate PRs,
    auto-merge under policy, and write operational records.

73. As a maintainer, I want the admin mount to use the Eve Next.js integration
    only after compatibility with the repo's installed Next.js version is
    proven or the planned Next.js 16.3 rollout is stable, so that the runtime
    integration does not destabilize admin.

74. As a maintainer, I want tenant auth to derive tenant and user from verified
    session context only, so that Eve never accepts tenant IDs from prompts,
    model output, or tool input.

75. As a maintainer, I want Eve session create, continue, and stream access to
    enforce ownership, so that users cannot access another tenant's or user's
    durable session.

76. As a maintainer, I want Eve implementation to preserve AGENTS and OpenSpec
    as higher authority than agent memory or provider plugins, so that the new
    system does not undermine the existing instruction system.

77. As a maintainer, I want Eve to maintain compatibility guidance for Cursor,
    Claude Code, Codex, and future Hermes-style routing, so that the repo's AI
    workflows stay coherent.

## Implementation Decisions

- Eve is the product name and the framework name. Documentation must qualify
  which one it means when ambiguity matters.

- The implementation target is full workflow readiness with one release switch,
  not a narrow proof of concept.

- Delivery uses phased PRs, but activation uses a single controlled release
  switch after governance, runtime, UI, GitHub, subagents, evals, notifications,
  and emergency controls are ready.

- PR 1 is spec-first. It must define the OpenSpec change, initial autonomy ADR,
  governance data model at spec level, rollout order, feature flags, and
  verification contract before runtime implementation proceeds.

- Eve uses the Vercel Eve framework and must read the installed Eve docs after
  the package is added. Runtime coding must not depend on memory of upstream
  APIs.

- The Eve runtime begins as a dedicated workspace package so that Eve's Node
  and dependency needs can be isolated before admin mounting.

- The admin mount uses Eve's Next.js integration only after compatibility is
  confirmed with the installed Next.js version or after the planned Next.js 16.3
  stable rollout is validated.

- Admin UI actions act as the current signed-in admin user. Their tenant, role,
  permissions, and audit identity come from verified admin session context.

- Background jobs, schedules, and system-initiated work use a service identity
  with explicit initiator metadata.

- GitHub actions execute through a GitHub App or bot identity, but every action
  records the accountable admin, GitHub sender, schedule, or system trigger.

- Eve may act as an autonomous PR operator in GitHub. It may review, comment,
  create inline findings, label, rerun CI, push safe fixes, update PR state,
  create issues, create branches, and open PRs under policy.

- Eve may auto-merge only when strict safe policy passes.

- Auto-merge is blocked for repo-aware protected areas: auth, donations,
  payments, secrets, environment config, Supabase migrations, RLS, production
  deployment config, tenant resolution, admin access control, data-access
  boundary changes, GitHub workflows, Vercel config, agent instructions, Eve
  config, package changes, dependency changes, and runtime changes.

- New product features invented by Eve require a spec-first PR path. Eve may
  propose and implement product features, but product-direction changes require
  OpenSpec before merge.

- The source-of-truth order for Eve is layered: OpenSpec and repo instructions
  define intent and rules; runtime, GitHub, CI, evals, and logs define current
  reality; official framework and package docs define API facts; memory is
  helpful context only.

- Eve's governance persistence lives in Supabase-owned app data. Eve's own
  sessions and workflow durability remain owned by the Eve runtime and its host
  workflow system.

- Governance storage covers audit, approvals, memory, model policy, budgets,
  notification records, run summaries, shared run context metadata, kill-switch
  state, release switches, and retention state.

- Large replay and debug packages use Supabase Storage with relational metadata,
  redacted summaries, retention state, and access control.

- Retention is category-based with a 180-day default. Incident and legal holds
  may retain records longer. Larger artifacts may expire earlier when their
  purpose no longer applies.

- Eve may write operational production records under policy. Examples include
  tasks, notes, labels, internal statuses, workflow metadata, memory, model
  settings, review artifacts, notification records, and audit-linked operations.

- Eve must not autonomously write broad customer, donor, payment, identity,
  tenant ownership, auth, secret, migration, destructive production, or
  production deployment records.

- Tenant auth always derives tenant and user from verified route or admin
  session context. Tenant or user IDs supplied by prompts, model output, tool
  input, or remote responses are never authority.

- Eve session create, continue, stream, approval response, memory access, and
  replay access must enforce user and tenant ownership.

- Eve memory starts as private admin memory. It may store communication
  preferences, project working context, and decisions, with strict exclusions.

- Eve memory schema is designed for future tenant-scoped operational memory,
  but tenant operational memory is not live until categories, retention,
  deletion, export, and audit rules are explicit.

- Eve auto-saves allowed private admin memory and emits audit events.

- Eve admin workspace provides full memory control: view, search, edit, delete,
  disable, category, scope, and change history.

- Eve exposes high-quality decision summaries, not raw hidden reasoning. A
  decision summary explains action, evidence, alternatives, risk, policies,
  approvals, and reversal or follow-up path.

- The admin workspace is operations-first. Chat is available, but the first
  screen prioritizes active runs, approvals, recent actions, budgets, failures,
  GitHub activity, eval health, memory, model policy, subagents, notifications,
  audit, and emergency controls.

- A lightweight global Eve panel appears across Mission Control and receives
  basic page context only: route, page identity, selected tenant or org, and
  safe UI state. It does not automatically receive table rows, donor details,
  payment data, raw form values, or sensitive records.

- Approval policy is separated by trust zone: engineering actions, product or
  admin actions, and memory actions.

- A full kill-switch suite is required. It can pause all automation, stop
  active runs, disable GitHub actions, disable production writes, disable
  sandbox networking, disable dynamic workflows, revoke or disable model policy
  changes, and force human approval for all actions.

- The shared model policy uses Vercel AI Gateway as the primary route and
  direct providers as controlled fallbacks.

- Model policy uses named roles and per-subagent settings rather than a single
  hard-coded model.

- Authorized admins with a dedicated AI settings permission may edit model
  policy from Mission Control.

- Model policy changes are draftable, eval-gated, activatable, audited, and
  rollback protected.

- V1 uses one platform model policy. Schema may support tenant-specific model
  overrides later.

- Hard budgets and rate limits apply to roles, subagents, dynamic workflows,
  evals, judge models, and expensive features. Emergency override requires
  permission and audit.

- Eve includes a broad initial subagent catalog as real Eve subagents, not only
  skills. Initial specialists include code review, CI triage, security review,
  test planning, OpenSpec guarding, data-boundary review, dependency review,
  docs sync, product strategy, UX review, migration planning, release
  coordination, memory curation, and future specialists.

- Each subagent may have its own model role, reasoning setting, fallback,
  budget, eval gate, tool surface, and instruction set.

- Subagents may delegate broadly and collaborate through shared structured run
  context.

- Workflow-specific subagent caps exist in v1 and are designed toward adaptive
  caps later.

- Any subagent may write to shared run context, but writes require schema
  validation, provenance, confidence, risk level, source evidence, and conflict
  handling. Conflicting writes are preserved as disagreements until resolved.

- Broad dynamic workflows are enabled in v1. Dynamic workflow failures escalate
  by risk.

- The sandbox may use a writable repo checkout and allow-all network access,
  but only with strong containment: no mounted secrets, no environment files, no
  service-role keys, no production dumps, egress and command audit,
  sensitive-file scanning, protected-file detection, and emergency kill switch.

- Schedules and monitors are broad in v1, but the first active monitor set is
  engineering health: CI failures, stale PRs, failing evals, dependency or
  security alerts, protected-area PRs, and budget or rate-limit issues.

- Product opportunity scanning is designed for later expansion, not the first
  active monitor set.

- External notifications are in v1. Email goes to platform owners only. Discord
  receives urgent ops notifications and may include rich details only when
  policy says the content is safe.

- The system needs one initial ADR covering Eve autonomy: work initiation,
  autonomous PR operation, strict auto-merge, production write policy, and
  governance guardrails. The accepted decision is
  [ADR-0018: Govern Eve autonomy behind one disabled-by-default release
  gate](../../adr/0018-governed-eve-autonomy.md).

- The release gate, emergency precedence, mandatory consult behavior, and
  no-new-authority boundary are defined by
  [ADR-0019: Gate Eve autonomy through one app-owned governance
  kernel](../../adr/0019-eve-governance-kernel.md).

## Testing Decisions

- Tests should verify external behavior and policy outcomes, not private helper
  structure.

- The governance storage module needs unit and integration tests for memory,
  audit, approvals, model policy, budgets, notification records, retention,
  kill-switch state, release switch state, and replay artifact metadata.

- The auth boundary needs tests proving that admin UI requests act as the
  current admin user, background jobs act as service identity with initiator
  metadata, and tenant IDs cannot be selected by prompt or tool input.

- Session ownership tests must cover session creation, session continuation,
  stream attachment, approval responses, memory reads, memory writes, audit
  reads, and replay/debug artifact access.

- GitHub operator tests must cover PR review, inline comments, labels, CI
  reruns, branch pushes, issue creation, PR creation, protected-area detection,
  strict auto-merge pass, strict auto-merge block, and accountability metadata.

- Protected-area tests must include auth, payments, tenant resolution, admin
  access control, data-access boundaries, package/runtime changes, workflows,
  Vercel config, Eve config, agent instructions, migrations, RLS, secrets, and
  production config.

- Model policy tests must cover role resolution, subagent model assignment,
  Gateway-primary routing, direct-provider fallback eligibility, eval-gated
  activation, rollback, permission checks, budget enforcement, and audit.

- Eval suites must include deterministic checks before judge-backed checks.
  Judge-backed evals should be used when quality cannot be expressed
  deterministically.

- Subagent tests must verify routing, model role selection, budget caps,
  delegated task completion, shared context writes, provenance, conflicts, and
  conflict resolution.

- Dynamic workflow tests must verify allowed orchestration, risk classification,
  failure escalation, kill-switch behavior, and budget limits.

- Sandbox tests must verify writable checkout behavior, safe branch handling,
  sensitive-file scanning, protected-file detection, no secret mounting, egress
  and command audit, and network kill-switch behavior.

- Memory tests must cover auto-save categories, exclusions, search, edit,
  delete, disable, change history, audit events, and future tenant-scope schema
  constraints.

- Admin workspace tests must cover operations-first navigation, active runs,
  approvals, audit, memory controls, model policy, budgets, kill switches,
  notification settings, and safe decision summaries.

- Global panel tests must verify that basic page context is included and raw
  records, payment data, donor details, table rows, and sensitive form values
  are not silently included.

- Notification tests must cover email owner routing, Discord safe-rich-detail
  policy, redaction, alert severity, deduplication, opt-out or pause state, and
  audit.

- Retention tests must cover 180-day defaults, category overrides, artifact
  expiration, memory history behavior, incident holds, and deletion jobs.

- OpenSpec and ADR verification must be part of PR 1 before runtime work.

- Existing repo gates remain required: formatting, linting, typechecking,
  build, unit tests, workspace contract verification, data-boundary
  verification, and skills verification.

- If the admin mount is implemented before a stable Next.js 16.3 upgrade,
  compatibility tests must prove the current installed Next.js version works
  with the Eve integration, Payload, Sentry, Turbopack, and Cache Components.

## Out of Scope

- This PRD does not approve autonomous money movement, refunds, donation
  corrections, donor identity changes, customer identity changes, tenant
  ownership changes, auth/security changes, secret rotation, RLS changes,
  migrations, or destructive production data changes.

- This PRD does not replace OpenSpec, AGENTS, repo rulebooks, local framework
  docs, or existing CI gates.

- This PRD does not make Eve memory a source of truth.

- This PRD does not expose raw hidden model reasoning in the product.

- This PRD does not enable anonymous Eve access.

- This PRD does not require tenant-level model policy overrides in v1.

- This PRD does not require tenant operational memory to be active in v1.

- This PRD does not require product opportunity scanning as the first active
  monitor set.

- This PRD does not treat Discord as a safe place for secrets, raw production
  data, donor details, payment data, or unredacted logs.

- This PRD does not bypass GitHub branch protection, required reviews, or
  repository policy.

- This PRD does not allow implementation to begin without reading installed Eve
  docs after the package is added.

## Further Notes

- The implementation should add OpenSpec and ADR coverage before runtime code.
  This is required because Eve changes durable product behavior and trust
  boundaries.

- The first ADR should explain why the repo allows an AI agent to initiate work,
  operate PRs, auto-merge under strict policy, and write operational records.

- The admin mount should be treated as a runtime compatibility milestone. If
  Eve requires a newer Next.js release than the repo has installed, the Next.js
  upgrade must become a separate prerequisite.

- Eve currently requires special care around Node runtime expectations. The
  runtime package should isolate Eve needs until the repo deliberately changes
  its broader Node baseline.

- The PR sequence should be governance-first:
  1. OpenSpec, ADR, governance data model spec, rollout plan, verification
     contract.
  2. Supabase governance schema and storage contracts.
  3. Admin operations workspace shell, memory controls, model policy, audit,
     budgets, and kill switches.
  4. Standalone Eve runtime, model policy integration, eval harness, sandbox
     policy, and safe local verification.
  5. Admin mount and global panel with basic page context.
  6. GitHub App operator, PR review, PR operations, protected-area policy, and
     strict auto-merge.
  7. Subagents, shared run context, dynamic workflows, workflow caps, and evals.
  8. Memory auto-save, memory curation, notifications, schedules, retention
     jobs, and final release switch.

- The release switch should remain off until governance, auth, audit, evals,
  protected-area policy, kill switches, and rollback paths are verified.

- Issue tracker publication should follow the repo's current AL issue and label
  rules. The PRD itself is the product source artifact; an implementation issue
  should reference this PRD once PR 1 is ready to start.
