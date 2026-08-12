# Eve stack reconciliation for the private ASYM Factory

**Decision ticket:** [Reconcile the shipped Mission Control Eve stack with the private Factory boundary](https://github.com/Asymmetric-al/core/issues/1239)  
**Evidence snapshot:** 2026-08-12 at `develop` / `8c53dc40a92306c3a2cbd71da030d71b1f9a1411`  
**Decision status:** unresolved; this document supplies evidence and options without choosing the product boundary

## Executive finding

Core contains a substantial, accepted Eve implementation, but it is not a neutral Factory platform and it is not production-shipped.

- It is **develop-integrated**: `origin/develop` contains the Eve runtime, governance APIs and migrations, Mission Control surfaces, engineering automation, tests, 21 merged OpenSpec capability specs, and 21 accepted Eve ADRs.
- It is **not on the production branch**: `origin/production` is `fb168d89` (2026-06-20), predates the Eve work, and contains none of `packages/eve-runtime`, `packages/api/src/eve`, or the admin Eve mount. Under the repository's release rules, “shipped” must not be read as “present in the Vercel Production Branch.”
- It is **not live autonomous operation**: the root agent still uses Eve's deterministic `mockModel`; governance defaults to release disabled; missing governance fails closed; schedules and external effects require separately configured credentials, app-owned policy, budgets, and an enabled release; and there is no committed target-bound launch manifest or hosted activation evidence.
- It is **currently a tenant-product capability**: identity comes from Mission Control/Supabase auth, durable authorization records reference product `tenants` and `profiles`, the runtime reads the product Supabase service-role boundary, the global panel receives the selected product organization, and GitHub/background identities require a tenant-linked product profile.

The implementation should therefore be treated as a high-value source of contracts, guardrails, tests, and selected pure modules—not as a Factory runtime that can be pointed at a new UI unchanged. A private Factory must have a separate identity plane, database, deployment, credentials, runtime state, and GitHub authority.

## Method and evidence standard

Nia was unavailable in this session. The fallback was repo-scoped `rg`, exact local source reads, current Git ancestry, live GitHub issue/PR/protection queries, and focused current-tree tests. No secondary sources were needed.

“Implemented” below means code is present in `develop` and its current focused test corpus passes. It does not imply production deployment, configured credentials, a passing launch ceremony, or enabled autonomy.

The current evidence is:

- accepted intent: [`openspec/specs/eve-*`](../../../openspec/specs/) and the [Eve ADR set](../../../docs/adr/0018-governed-eve-autonomy.md);
- code and executable contracts: [`packages/api/src/eve`](../../../packages/api/src/eve/), [`packages/eve-runtime`](../../../packages/eve-runtime/), the [admin Eve workspace](<../../../apps/admin/app/(app)/admin/eve/>), and [Eve migrations](../../../supabase/migrations/);
- integration points: [`apps/admin/next.config.ts`](../../../apps/admin/next.config.ts), [`apps/admin/app/eve/global-panel.tsx`](../../../apps/admin/app/eve/global-panel.tsx), and [`apps/admin/app/mc-shell.tsx`](../../../apps/admin/app/mc-shell.tsx);
- tracker/provenance: the [Eve parent PRD issue](https://github.com/Asymmetric-al/core/issues/416), implementation PRs, and current Git ancestry;
- current verification: 77 Eve-focused unit-test files, 546 tests, all passing on this snapshot.

## Current-state classification

### Accepted and implemented on `develop`

The following capability families have accepted OpenSpec/ADR coverage and corresponding code/tests:

| Capability                               | Primary implementation evidence                                                                                                                                                                                                           | What is actually present                                                                                                                                                                                                                                                                                                                          |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Governance, emergency controls, audit    | [`governance`](../../../packages/api/src/eve/governance/), [`audit`](../../../packages/api/src/eve/audit/), governance migration                                                                                                          | Disabled-by-default release state, emergency/kill-switch precedence, fail-closed action wrapper, app-owned decision/audit records.                                                                                                                                                                                                                |
| Model, approval, budget, retention       | [`model-policy`](../../../packages/api/src/eve/model-policy/), [`approval-budget`](../../../packages/api/src/eve/approval-budget/), [`retention`](../../../packages/api/src/eve/retention/)                                               | Typed policy lifecycle, catalogued actions, rate/cost/token constraints, approval records, artifact metadata/holds.                                                                                                                                                                                                                               |
| Admin identity, memory, operations UI    | [`session-ownership`](../../../packages/api/src/eve/session-ownership/), [`admin-memory`](../../../packages/api/src/eve/admin-memory/), [Eve admin page](<../../../apps/admin/app/(app)/admin/eve/page.tsx>)                              | Verified Mission Control admin identity, tenant/user session ownership, private admin memory controls, governance/operations panels.                                                                                                                                                                                                              |
| Runtime foundation                       | [`packages/eve-runtime/package.json`](../../../packages/eve-runtime/package.json), [`agent/agent.ts`](../../../packages/eve-runtime/agent/agent.ts), [`governance-boundary.ts`](../../../packages/eve-runtime/src/governance-boundary.ts) | An isolated Node 24+ package pinned to Eve 0.25.1, deterministic root model, typed activation adapter, and declared channels, tools, sandbox, specialists, schedules, and evals.                                                                                                                                                                  |
| Next.js mount and global panel           | [`apps/admin/next.config.ts`](../../../apps/admin/next.config.ts), [`global-panel.tsx`](../../../apps/admin/app/eve/global-panel.tsx), [`page-context.ts`](../../../apps/admin/app/eve/page-context.ts)                                   | `withEve` mounts the isolated package into admin; authenticated admins receive a bounded text panel with allowlisted, redacted page/organization context.                                                                                                                                                                                         |
| Sandbox and GitHub review/operator       | [`sandbox`](../../../packages/api/src/eve/sandbox/), [`github-review`](../../../packages/api/src/eve/github-review/), [`github-operator`](../../../packages/api/src/eve/github-operator/)                                                 | Disposable Core checkout, deny-first network policy, protected/sensitive path scanning, read/review channel, seven guarded mutating operations, exact repository allowlist.                                                                                                                                                                       |
| Strict merge policy                      | [`strict-auto-merge`](../../../packages/api/src/eve/strict-auto-merge/)                                                                                                                                                                   | Exact-head checks, required check/review and protection evaluation, protected-area blocking, escalation on ambiguity. Current live GitHub evidence shows `develop` has strict status checks, requires one human approval, enforces protection for admins and conversation resolution, and has no active ruleset that this evaluator would reject. |
| Specialists, shared context, workflows   | [`subagent-catalog`](../../../packages/api/src/eve/subagent-catalog/), [`shared-context`](../../../packages/api/src/eve/shared-context/), [`dynamic-workflow`](../../../packages/api/src/eve/dynamic-workflow/)                           | Thirteen declared specialists, depth and budget caps, run-scoped structured evidence, preserved conflicts, validated typed plans, governed resume/failure behavior.                                                                                                                                                                               |
| Monitors, notifications, launch controls | [`engineering-monitors`](../../../packages/api/src/eve/engineering-monitors/), [`notifications`](../../../packages/api/src/eve/notifications/), [`launch-readiness`](../../../packages/api/src/eve/launch-readiness/)                     | Six allowlisted engineering monitors, email/Discord envelopes and delivery state, schedules, immutable launch manifest evaluation, two-reviewer/human activation and rollback procedures.                                                                                                                                                         |

The post-merge [Eve containment hardening PR](https://github.com/Asymmetric-al/core/pull/1236) is material evidence, not a footnote. It closed confirmed pre-launch gaps in shell target approval, scanned-versus-executed inputs, workflow pause ordering, specialist metering, GitHub session-purpose separation, product-direction classification, shared-context resolution, and sensitive PR preflight. Its existence shows both that the guardrails are actively tested and that merged capability code should not be treated as already-qualified Factory security architecture.

### Merged but not tracker-reconciled

The issue graph materially understates implementation:

- Of the 21 implementation slices from issues 417–437, only five are closed. Sixteen remain open and labelled `status:todo` / `ready-for-agent`, even though their specs, ADRs, code, migrations, or tests are present on `develop`.
- The [autonomous PR operator PR](https://github.com/Asymmetric-al/core/pull/865) closed unmerged, while the [strict auto-merge PR](https://github.com/Asymmetric-al/core/pull/866) merged into its stacked branch. The later [specialist/shared-context PR](https://github.com/Asymmetric-al/core/pull/867) merged the resulting operator and strict-merge modules into `develop`; the corresponding operator and merge issues remain open.
- The [engineering monitors PR](https://github.com/Asymmetric-al/core/pull/869) closed unmerged, while the [notification PR](https://github.com/Asymmetric-al/core/pull/870) merged into that stacked branch. The later [final launch PR](https://github.com/Asymmetric-al/core/pull/871) carried monitor/notification implementation into `develop`; the corresponding issues remain open.
- [`openspec/changes/add-eve-email-discord-notifications`](../../../openspec/changes/add-eve-email-discord-notifications/) remains an active-looking change with every task unchecked, while an accepted capability spec, ADR, migration, API/runtime code, admin UI, and tests also exist. This is source-of-truth drift, not evidence that the capability is absent.
- [`packages/eve-runtime/AGENTS.md`](../../../packages/eve-runtime/AGENTS.md) still says the package must remain isolated from admin until issue 428 proves the mount, although the issue is closed and the mount is present. [ADR-0029](../../../docs/adr/0029-eve-admin-mount-global-panel.md) also records the earlier Next.js compatibility version rather than the current repo pin.

Before Factory extraction, these records need a non-destructive implementation inventory: connect each accepted requirement to current code/test evidence, reconcile issue status, remove or archive duplicate active changes, and update stale boundary documentation. That work should not be confused with a decision to activate or preserve tenant Eve.

### Specified or structurally implemented, but not operationally proven

These behaviors must not be advertised as live:

1. **A live root agent.** [`agent/agent.ts`](../../../packages/eve-runtime/agent/agent.ts) uses only the deterministic fixture model. Specialist model selection can resolve through persisted policy after release, but the root agent itself is not a live Chief of Staff.
2. **A production Eve deployment.** The production branch contains none of the Eve stack. No deployment/runtime inspection in this research established a deployed Eve host.
3. **Configured provider, GitHub, or notification authority.** The code and runbooks define environment inputs and credential paths, but repository contents cannot prove they are provisioned or attached. The [GitHub review runbook](../../../docs/guides/operations/eve-github-review.md) explicitly describes the channel as implemented but inert pending configuration and launch.
4. **End-to-end launch readiness.** The [launch runbook](../../../docs/guides/operations/eve-launch.md) requires fresh evidence for every slice, 15 composition checks, nine reversal checks, eight runbooks, two independent reviewers, and a separate human activator. Unit tests and merged PRs explicitly do not satisfy that gate. No committed current-target launch manifest exists.
5. **Operational schedules and external effects.** Monitor defaults are disabled, paused, and destinationless; notification delivery and GitHub mutations remain subordinate to release, policy, budgets, identity, and credentials.
6. **Direct-provider fallback.** The accepted autonomy direction mentions controlled fallbacks, while [`governance-boundary.ts`](../../../packages/eve-runtime/src/governance-boundary.ts) deliberately permits only the Vercel AI Gateway route and excludes direct-provider actuation.

### Still disabled by design

- The governance migration inserts `release_enabled = false`, and missing state is rendered as release-off with engaged switches.
- [`prepareEveRuntimeActivation`](../../../packages/eve-runtime/src/governance-boundary.ts) refuses release-off, missing/non-persisted governance, emergency state, kill switches, unready policy, rejected model resolution, and blocked approval/budget decisions.
- The sandbox starts deny-all and requires governance plus an auditable policy decision before egress or writes.
- GitHub review, operator, strict merge, specialists, workflows, monitors, and notification effects all re-check more restrictive governance.
- The global Mission Control panel is mounted UI/transport, but the panel itself grants no product-action authority and the authored root model is deterministic.

The repository proves safe defaults and control logic. It does not prove the current value of any hosted product Supabase row. A live database inspection would be required before claiming the switch is off in every deployed environment; the production-branch absence independently proves that the repository's current production release cannot contain this implementation.

## Why the current stack crosses the Factory boundary

### Identity is product-tenant identity

[`session-ownership/identity.ts`](../../../packages/api/src/eve/session-ownership/identity.ts) derives an admin actor from the existing Supabase auth context and requires a product tenant, role, profile, and membership. Background and GitHub paths use `EVE_GITHUB_TENANT_ID` and, for writes, a tenant-linked actor profile. This is correct for a Mission Control assistant and incorrect as the root authority for a private internal Factory.

### Persistence is product Supabase persistence

The Eve migrations are in the product migration stream. Session ownership, model policy, memory, approval/budget, retention, shared context, monitors, notifications, and launch records repeatedly reference `public.tenants` and `public.profiles`. Runtime adapters obtain the product admin client from `@asym/database/supabase/admin` and require `SUPABASE_SERVICE_ROLE_KEY` for persisted governance. A private Factory cannot inherit that service role or use a fabricated product tenant as its internal organization.

### Runtime composition is mounted into the product application

The admin app declares `@asym/eve-runtime`, wraps its Next.js config with `withEve`, renders `EveGlobalPanel` inside the Mission Control shell, and exposes product-admin Eve routes. The panel's safe context still intentionally includes the selected product organization. This is a well-guarded product integration, not separation.

### GitHub authority is tenant-linked and runtime-specific

The existing operator is usefully hard-bound to `Asymmetric-al/core`, issue-first branches, safe-fix limits, protected paths, exact-SHA reviews, and an accountable GitHub App. Its durable audit and budget identity, however, is constructed from the product Supabase tenant/profile plane. Factory GitHub Apps, audit actors, budgets, branch leases, Forgejo handoff, and publication authority must be Factory-owned even if the pure guardrails are reused.

### The present engineering loop is not the Factory cell

The current Eve operator can create an issue/branch/PR, review, push a bounded safe fix, run specialists, and attempt a strictly gated merge. It does not implement the Factory's Work Contract Pack, one-writer cell lease, two independent Fighters, evidence adjudication, bounded repair cycle, De-Slop, Proof role, Forgejo-to-GitHub authority transfer, local prepublication CI, post-merge/phase proof, or Librarian publication. Those are new Factory-domain contracts, not configuration of the Mission Control assistant.

## Reuse disposition by layer

| Disposition                                                           | Assets                                                                                                                                                                                                                                                                        | Boundary condition                                                                                                                                                                                                     |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Preserve as product-plane behavior pending the founder decision**   | Mission Control Eve workspace/global panel, product admin auth/session ownership, product memory and control routes, existing product migrations                                                                                                                              | Keep disabled and isolated from Factory authority. Do not point a Factory host at these records or credentials.                                                                                                        |
| **Extract as pure shared contracts where imports can remain one-way** | Governance evaluation/types, audit/redaction shapes, approval action catalog/evaluators, model-policy schemas/evaluators, protected-path scanners, GitHub request validation, strict-merge policy, workflow plan/risk validation, subagent catalog, launch-manifest evaluator | Shared modules must not import product auth, `@asym/database`, Next.js apps, runtime environment, or tenant tables. Product and Factory adapters may depend on the pure layer; the pure layer depends on neither host. |
| **Port behind Factory-owned adapters**                                | Eve framework declarations, session/workflow integration, GitHub client/operator mechanics, sandbox wrappers, schedules, monitor collectors, notification envelopes, audit/store interfaces, runbooks and eval cases                                                          | Replace product tenant/profile identity, product Supabase stores, credentials, deployment, routes, and audit actor construction with Factory equivalents. Reread the exact installed Eve version before porting.       |
| **Reuse as qualification evidence, not authority**                    | 546 passing focused tests, migration constraints, containment regressions from PR 1236, OpenSpec scenarios, ADR tradeoffs, operational runbooks                                                                                                                               | Turn these into Factory acceptance/adversarial cases. Passing product-plane tests does not prove Factory identity or infrastructure isolation.                                                                         |
| **Build new for the Factory**                                         | Factory app/auth, Factory Supabase schema, Chief of Staff plus deterministic scheduler, Work Contract Pack/admission, cell/worker/branch leases, Forgejo publication handoff, local CI gate manifest, role harnesses, proof/knowledge lifecycle                               | These concepts do not exist in the current Eve product stack. They must not be simulated with product tenants or untracked prompts.                                                                                    |
| **Reconcile or archive only after an explicit decision**              | Stale open Eve issues, duplicate notification change, obsolete isolation/version notes; potentially the tenant Eve UI/runtime if the product assistant is retired                                                                                                             | Tracker/doc cleanup is safe. Product code/data deletion is not: retirement requires a migration, retention, rollback, and user-surface decision.                                                                       |

## Domain-language boundary

The repo already uses “Eve” for several different things. Factory work should use qualified terms until a domain decision is recorded:

- **Eve framework** — the upstream `eve` package and its filesystem/runtime conventions.
- **Mission Control Eve** — the tenant-product assistant, admin workspace, product identity, and product governance records currently implemented on `develop`.
- **Factory Chief of Staff** — the internal human-facing agent role, not the deterministic scheduler and not a product admin identity.
- **Factory control plane** — Factory lifecycle/policy state, scheduler, workers, Git/CI/knowledge services, and Factory Supabase.
- **Shared Eve policy kernel** — only a future pure, host-neutral module if extraction proves it has no product or Factory infrastructure dependency.

`CONTEXT-MAP.md` currently has no Eve or Factory context entry. That absence should remain visible until the founder-owned boundary and names are chosen; this research should not invent a canonical Factory glossary prematurely.

## Narrow decision options

### Option 1 — Dual-plane extraction

Keep Mission Control Eve as a disabled product capability, extract a small pure policy/contract kernel, and build a separate Factory app/runtime with Factory Supabase, Factory auth, Factory GitHub Apps, and Factory credentials.

- Strongest evidence-backed reuse without crossing the identity/data boundary.
- Requires careful dependency enforcement and qualification of every extracted module.
- Leaves two products that use Eve framework concepts but share no runtime state or secrets.

### Option 2 — Factory-owned port with no shared runtime package

Freeze Mission Control Eve as-is and port selected contracts/tests into Factory-only packages, accepting deliberate duplication instead of a shared kernel.

- Creates the clearest short-term blast-radius boundary.
- Avoids prematurely generalizing code that was authored for tenant identity.
- Costs more maintenance and may allow product/Factory policy behavior to drift.

### Option 3 — Retire Mission Control Eve, then migrate reusable assets

Decide that no tenant-facing Eve assistant will ship; preserve accepted policy/test knowledge, move the useful engineering contracts to Factory ownership, and remove product UI/runtime/data only through an explicit deprecation and retention plan.

- Produces the simplest long-term product/runtime topology.
- Is the most destructive and least reversible option.
- Requires evidence about product intent, any deployed data, retention/holds, route removal, and rollback before deletion.

### Not a valid boundary-preserving option — reuse the current host unchanged

Mounting the Factory into `apps/admin`, using the current product Supabase service role, representing Factory actors as product tenants/profiles, or sharing the current GitHub service principal would contradict the private Factory boundary. The current code makes that coupling explicit; naming or environment-variable changes would not remove it.

## Decision-ready conclusion

The currently integrated Eve work is neither disposable nor directly deployable as the Factory. Its accepted contracts, pure evaluators, guardrails, regressions, and tests are valuable. Its Mission Control UI, identity, persistence, credentials, and runtime composition are product-plane assets. The unresolved founder decision is therefore narrow: preserve Mission Control Eve alongside a separate Factory, freeze it while the Factory ports selected assets, or retire it through a governed migration. In every viable option, Factory identity, state, secrets, deployment, and GitHub authority remain separate.

## Verification and limits

The current-tree evidence suite was run as:

```sh
rg --files tests/unit | rg '/eve[^/]*\.test\.tsx?$|eve-[^/]*\.test\.tsx?$' | xargs bunx vitest run
```

Result: 77 test files and 546 tests passed. Prettier also passes for this report.

This research did not inspect a hosted Supabase database, Vercel deployment, attached GitHub App installation, provider account, or external notification destination. It therefore makes no claim that a non-production environment has never been provisioned or manually activated. The branch, source, tracker, protection, and test findings are current only at the evidence snapshot above.
