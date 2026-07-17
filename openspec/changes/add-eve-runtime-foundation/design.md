# Design (provisional Eve label EVE-DESIGN-0007): Eve Standalone Runtime Foundation

> **Numbering:** `EVE-DESIGN-0007` is a provisional cross-change label, not a canonical `docs/adr/` number. If this decision is accepted, its implementation PR must allocate the next available canonical number and update every reference, following `docs/adr/README.md`.

> This `design.md` uses provisional Eve design label **EVE-DESIGN-0007**, the standalone-runtime decision required by issue #425. It builds
> on **ADR-0018** (#417, `openspec/specs/eve-autonomous-operations/spec.md`), **EVE-DESIGN-0005** (#423,
> `add-eve-approval-budget-policy`), and **EVE-DESIGN-0006** (#421, `add-eve-model-policy-tracer`), and does not
> restate them — it operationalizes the isolated runtime package that resolves models through #421's policy,
> spends under #423's budgets, and stays disabled by default per #418. When accepted into `Asymmetric-al/core`,
> its ADR body should also be landed at the repo's ADR location (using the next available canonical number per `docs/adr/README.md`). Every
> grounded claim carries a `[VERIFIED-REPO: path:line]` citation read from `Asymmetric-al/core` at commit
> `d14a2434` on 2026-07-02. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:158]

## Status

Proposed (partner draft for #425). Supersedes nothing. Builds on ADR-0018 (#417), EVE-DESIGN-0005 (#423), and
EVE-DESIGN-0006 (#421). Subordinate to OpenSpec and `AGENTS.md`. [VERIFIED-REPO: AGENTS.md]
[VERIFIED-REPO: openspec/project.md]

## Context

The implementation plan scopes slice 9 (#425, "Standalone Eve Runtime Foundation") as an **AFK** slice
**blocked by slices 1, 5, and 7** — the spec/ADR foundation (#417), the model-policy tracer (#421), and the
approval/budget policy (#423) — and covering user stories 1, 2, 17, 36, 41, 73, 76, and 77.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:158]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:159] What it must prove is that
"the repo can host an isolated Eve runtime package that builds, reports health, reads installed Eve docs, and
runs a minimal eval while the release switch remains off," with acceptance that "installed Eve docs are read
and summarized before coding," that the "runtime is isolated from the three Next apps until admin mount is
proven," and that "`eve info`, `eve build`, and a minimal eval pass locally."
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:160]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:164]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:166]

The platform constraints already fix the runtime's shape. It "uses the Vercel Eve framework and must read the
installed Eve docs after the package is added"; "runtime coding must not depend on memory of upstream APIs"; it
"begins as a dedicated workspace package so that Eve's Node and dependency needs can be isolated before admin
mounting"; the admin mount uses Eve's Next.js integration "only after compatibility is confirmed"; and "Eve's
own sessions and workflow durability remain owned by the Eve runtime and its host workflow system," separate
from Supabase-owned governance data. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:363]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:367]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:370]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:404]
The PR sequence places the "Standalone Eve runtime, model policy integration, eval harness, sandbox policy, and
safe local verification" at step 4, after governance and admin-shell steps, and "the release switch should
remain off until governance, auth, audit, evals, protected-area policy, kill switches, and rollback paths are
verified." [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:658]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]

The `platform-boundaries` spec already makes sensitive operations server-side-only and treats tenant isolation
as a structural boundary; the runtime inherits those contracts — it isolates its Node/dependency footprint,
adds no relaxations, and stays off until governance is verified.
[VERIFIED-REPO: openspec/specs/platform-boundaries/spec.md]

**Partner-boundary note.** The standalone runtime is the eventual host of model calls, so it is where the
fleet's shared GPU inference gateway would be invoked. This ADR therefore fixes that the runtime resolves
models **only through #421's shared policy** — never hardcoding a provider — so any such gateway stays a
proposed, non-default, revocable fallback rather than a route baked into runtime code.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:468]

## Decision

1. **Isolated dedicated workspace package.** The Eve runtime is a single workspace package whose Node and
   dependency needs are isolated from the three Next apps (admin/donor/missionary), and it stays isolated until
   the #428 admin mount is proven compatible with the installed Next.js version. It never imports app runtime
   code and no app imports it. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:367]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:370]
2. **Docs before coding.** The runtime reads and summarizes the installed Eve (Vercel) framework docs after the
   package is added, and runtime coding must not depend on memory of upstream APIs — official framework docs
   are the API-fact layer of the source-of-truth order.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:363]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:401]
3. **Local verification, release switch off.** The runtime exposes `eve info` (health/report on the installed
   runtime and read docs), `eve build`, and a **minimal eval** that all pass locally, while the release switch
   stays off and the package is disabled by default — proving the runtime exists and builds before any live
   autonomy or admin mount. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:166]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]
4. **Self-owned session/workflow durability.** Eve's own sessions and workflow durability are owned by the Eve
   runtime and its host workflow system; governance persistence (audit, approvals, memory, model policy,
   budgets, kill-switch/release state) stays Supabase-owned app data (#418). The runtime does not persist
   governance state. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:404]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:408]
5. **Models via #421, spend under #423.** The runtime resolves every model through the #421 shared model
   policy (Gateway-primary; any direct provider a controlled, non-default, revocable fallback) and never
   hardcodes a provider; its work — including the minimal eval — spends under #423's hard budgets/rate limits.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:187]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:205]
6. **Layered source-of-truth; AGENTS/OpenSpec above memory.** The runtime respects the layered order — OpenSpec
   and repo instructions define intent and rules; runtime, GitHub, CI, evals, and logs define current reality;
   framework/package docs define API facts; memory is helpful context only — and preserves AGENTS and OpenSpec
   as higher authority than agent memory or provider plugins.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:399]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:339]
7. **Subordinate; grants no new authority.** The runtime only adds an isolated, off-by-default host; it never
   bypasses #417 protected-area/production-write/approval limits or #418 emergency-off precedence, and reads
   only persisted app-owned governance state, never a prompt/model/tool claim that a switch is off.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:389]
   [VERIFIED-REPO: openspec/project.md] [VERIFIED-REPO: AGENTS.md]

## Boundary with adjacent slices

- **#417 (ADR-0018, foundation):** owns the autonomy contract, protected-area set, and governance data model at
  spec level. #425 is subordinate to it. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:52]
- **#421 (EVE-DESIGN-0006, model policy):** owns named roles and Gateway-primary routing. #425 resolves models through
  that policy; it does not define roles or routing. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:102]
- **#423 (EVE-DESIGN-0005, approval/budget):** owns trust-zone approval and hard budgets. #425 spends under those
  budgets; it does not define them. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:129]
- **#418 (governance kernel):** owns release/kill-switch **state**. #425 stays off by default and reads that
  state; it does not persist it. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:408]
- **#426 (admin auth/session ownership):** owns session-ownership enforcement. #425 hosts sessions; ownership
  enforcement lands in #426. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:168]
- **#428 (admin mount):** owns the Next.js integration/mount. #425 stays isolated from the three apps until
  that mount is proven. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:195]
- **#429 (sandbox worker):** owns the writable checkout, allow-all networking, and egress controls. #425 is the
  isolated package, not the sandbox. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:210]

## Verification contract

- OpenSpec validates: `bunx @fission-ai/openspec@latest validate add-eve-runtime-foundation --strict`.
  [VERIFIED-REPO: docs/ai/rules/openspec.md]
- Existing repo gates remain required and unchanged (`format:check`, `skills:verify`, `lint`,
  `verify:workspace-contract`, `verify:eslint`, `typecheck`, `build`, `test:unit`, plus data-boundary
  verification). [VERIFIED-REPO: docs/ai/rules/general.md]
- The slice-specific acceptance tests — package isolation from the three apps, docs-read-and-summarized,
  `eve info`/`eve build`/minimal-eval passing locally with the release switch off, self-owned session
  durability, and model resolution through #421 — land with the implementing PR, not this spec/ADR.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:166]

## Consequences

- Positive: Eve's runtime dependencies are isolated and provably build before any admin mount or live autonomy;
  the runtime cannot hardcode a model provider, cannot spend past #423 budgets, and cannot run while the
  release switch is off — a foundation that is safe to iterate on.
- Cost: a dedicated workspace package to maintain and a docs-read step before runtime coding (a deliberate
  price for not coding against remembered upstream APIs).
- Risk if skipped: runtime code entangled with the three Next apps or coded from memory of upstream APIs — the
  exact isolation and docs-first failures the constraints forbid.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:363]

## Alternatives considered

- **Build the runtime inside an existing Next app.** Rejected: the constraint requires a dedicated workspace
  package so Node/dependency needs are isolated before admin mounting.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:367]
- **Mount into admin now.** Rejected: the admin mount uses Eve's Next.js integration only after compatibility
  is confirmed with the installed Next.js version (#428/US-73).
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:370]
- **Code the runtime from memory of upstream Eve APIs.** Rejected: the runtime must read the installed Eve docs
  and not depend on memory of upstream APIs (US-77).
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:363]
- **Hardcode a model provider (e.g. the partner GPU gateway) in the runtime.** Rejected: the runtime must
  resolve models through #421's Gateway-primary policy where direct providers are controlled, non-default
  fallbacks. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:468]
- **Enable the runtime by default.** Rejected: the release switch must remain off until governance, auth,
  audit, evals, protected-area policy, kill switches, and rollback paths are verified.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]

## Out of scope (this change)

Eve runtime source code, the `eve` CLI implementation, the eval harness, provider-client/routing code, the
Next.js admin mount (#428), the sandbox engineering worker (#429), admin session-ownership auth (#426), the
governance-kernel state store (#418), the model-policy capability (#421), the approval/budget policy (#423),
and any live autonomy — all deferred to later, separately-gated slices.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:160]
