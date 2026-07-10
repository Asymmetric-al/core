# Proposal: Eve standalone runtime foundation

**Prepared by the Eve partner fleet for Eve / Asymmetric.**

> **Partner DRAFT for GitHub issue #425 ("Eve: Standalone Eve runtime foundation").** Staged in the Gitea
> `proposals` repo; NOT a change to `Asymmetric-al/core`, and enters that repo only through Asymmetric's
> OpenSpec workflow after operator/maintainer sign-off. **Builds on #417** (`add-eve-autonomous-operations-foundation`,
> ADR-0001), **#421** (`add-eve-model-policy-tracer`, ADR-0006), and **#423** (`add-eve-approval-budget-policy`,
> ADR-0005) — the three slices the implementation plan names as #425's blockers. It does not restate their
> contracts; it defines the isolated Eve runtime package that resolves models through #421's policy and spends
> under #423's budgets, while the release switch stays off. Every grounded claim carries a
> `[VERIFIED-REPO: path:line]` citation read from `Asymmetric-al/core` at commit `d14a2434` on 2026-07-02.

## Why

The implementation plan scopes slice 9 as the **Standalone Eve Runtime Foundation**, issue **#425**, an **AFK**
slice **blocked by slices 1, 5, and 7** — the spec/ADR foundation (#417), the model-policy tracer (#421), and
the approval/budget policy (#423). [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:22]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:158] All three blockers are
already proposed, so #425 is unblocked. Its stated purpose is to prove that "the repo can host an isolated Eve
runtime package that builds, reports health, reads installed Eve docs, and runs a minimal eval while the
release switch remains off," with acceptance that "installed Eve docs are read and summarized before coding,"
that the "runtime is isolated from the three Next apps until admin mount is proven," and that "`eve info`,
`eve build`, and a minimal eval pass locally." [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:160]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:164]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:166] It covers user stories 1, 2,
17, 36, 41, 73, 76, and 77. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:159]

The platform constraints already fix the shape: "Eve uses the Vercel Eve framework and must read the installed
Eve docs after the package is added. Runtime coding must not depend on memory of upstream APIs" (US-77); "the
Eve runtime begins as a dedicated workspace package so that Eve's Node and dependency needs can be isolated
before admin mounting" (US-73); the admin mount "uses Eve's Next.js integration only after compatibility is
confirmed" — so the runtime stays isolated from admin until #428; and "Eve's own sessions and workflow
durability remain owned by the Eve runtime and its host workflow system," distinct from Supabase-owned
governance data. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:363]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:367]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:370]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:404]
The runtime must follow the layered source-of-truth order (OpenSpec and repo rules define intent; runtime and
logs define reality; framework docs define API facts; memory is helpful context only) (US-17), and preserve
AGENTS and OpenSpec as higher authority than agent memory or provider plugins (US-76).
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:399]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:339]

This slice matters to the partner boundary: the standalone runtime is the host that will eventually *call*
models, so it is exactly where the fleet's shared **GPU inference gateway** would be invoked. Specifying #425
as an isolated, release-switch-off package that resolves models **only through #421's policy** — Gateway-primary,
any direct provider a controlled non-default fallback — is what keeps that gateway a **proposed, non-default,
revocable** route rather than something the runtime hardcodes. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:205]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:468]

## What Changes

- Add a new OpenSpec capability `eve-runtime-foundation` (spec delta in
  `specs/eve-runtime-foundation/spec.md`) stating: the Eve runtime is an **isolated, dedicated workspace
  package**, isolated from the three Next apps until the #428 admin mount is proven; it **reads and summarizes
  the installed Eve docs before coding** and never depends on memory of upstream APIs; it exposes **local
  verification** (`eve info` health/report, `eve build`, and a **minimal eval** that passes locally) while the
  **release switch stays off** and the package is **disabled by default**; it **owns its own sessions and
  workflow durability** while governance persistence stays Supabase-owned app data (boundary vs #418); it
  **resolves models through the #421 shared model policy** and **spends under #423 budgets**, follows the
  **layered source-of-truth order**, keeps **AGENTS/OpenSpec above memory and provider plugins**, and **grants
  no new authority** (subordinate to #417/#421/#423, never bypassing protected-area/approval limits or the
  #418 emergency-off precedence).
- Record the decision as **ADR-0007** in this change's `design.md`, building on ADR-0001 (#417), ADR-0005
  (#423), and ADR-0006 (#421).

## What Does Not Change

- This change adds **no live Eve runtime code, no CLI implementation, and no eval harness code**; it defines
  the runtime capability, its isolation, and its local-verification contract while the system stays disabled by
  default (per #418). [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:160]
- The **admin mount and Next.js integration** remain #428's scope; #425 only requires the runtime stay
  isolated from the three Next apps until that mount is proven.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:370]
- The **model-policy capability** (named roles, Gateway-primary routing, controlled fallbacks) remains #421's
  scope; #425 only requires the runtime resolve models **through** that policy, never hardcoding a provider.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:468]
- The **approval/budget policy** remains #423's scope; #425 only requires runtime work spend **under** those
  budgets. The **audit-record shape** remains #419's scope; the **governance state store** remains #418's.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:129]
- The **sandbox engineering worker** (writable checkout, allow-all networking, egress controls) remains #429's
  scope; the **admin session-ownership auth** remains #426's. #425 hosts sessions but does not implement their
  ownership enforcement. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:210]
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:168]
- No Supabase schema, Mission Control UI, or provider-client code lands here. #417's contract, `AGENTS.md`,
  `openspec/project.md`, `openspec/specs/**`, and existing CI gates remain authoritative and unchanged; this
  change is subordinate to them. [VERIFIED-REPO: AGENTS.md] [VERIFIED-REPO: openspec/project.md]

## Expected Outcome

- A validated OpenSpec change
  (`bunx @fission-ai/openspec@latest validate add-eve-runtime-foundation --strict`) that makes the standalone
  Eve runtime — isolated workspace package, docs-before-coding, `eve info`/`eve build`/minimal-eval local
  verification, self-owned session/workflow durability, #421 model resolution, #423 budgets, layered
  source-of-truth, disabled-by-default — a durable, spec-level contract.
  [VERIFIED-REPO: docs/ai/rules/openspec.md]
- ADR-0007 of record for the runtime foundation, traceable from ADR-0001 (#417), ADR-0005 (#423), and ADR-0006
  (#421).
- A clear boundary: #417 owns the autonomy contract; #421 owns model policy; #423 owns approval/budget; #428
  owns the admin mount; #429 owns the sandbox; #425 owns the **isolated runtime package** that composes with
  them and stays off until governance is verified. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]
