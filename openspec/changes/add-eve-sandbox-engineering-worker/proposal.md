# Proposal: Eve sandbox engineering worker

**Prepared by the Eve partner fleet for Eve / Asymmetric.**

> **Partner DRAFT for GitHub issue #429 ("Eve: Sandbox Engineering Worker").** Staged in the Gitea
> `proposals` repo; NOT a change to `Asymmetric-al/core`, and enters that repo only through Asymmetric's
> OpenSpec workflow after operator/maintainer sign-off. **Builds on #420** (`add-eve-kill-switch-control-path`,
> EVE-DESIGN-0004), **#423** (`add-eve-approval-budget-policy`, EVE-DESIGN-0005), and **#425** (`add-eve-runtime-foundation`,
> EVE-DESIGN-0007) — the three slices the implementation plan names as #429's blockers. It does not restate their
> contracts; it defines the **contained sandbox** in which the isolated #425 runtime does writable engineering
> work, honoring #420's sandbox-networking kill switch and spending under #423's budgets, while the release
> switch stays off. Every grounded claim carries a `[VERIFIED-REPO: path:line]` citation read from
> `Asymmetric-al/core` at commit `d14a2434` on 2026-07-04.

## Why

The implementation plan scopes slice 13 as the **Sandbox Engineering Worker**, issue **#429**, an **AFK** slice
**blocked by slices 4, 7, and 9** — the kill-switch control path (#420), the approval/budget policy (#423), and
the standalone runtime foundation (#425). [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:210]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:212]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:213] All three blockers are
already proposed, so #429 is unblocked. Its stated purpose is to prove that "Eve can use a writable repo
checkout in sandbox with allow-all network and compensating controls," with acceptance that the sandbox "has no
mounted secrets, no env files, no service-role keys, and no production data dumps," that "egress and commands
are audited where available," that a "sensitive-file scanner and protected-file detection can pause risky
runs," and that the "sandbox networking kill switch works." [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:215]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:218]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:220]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:221]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:222] It covers user stories 55,
56, and 57. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:214]

The platform constraints already fix the shape. A platform owner wants "Eve's sandbox to have a writable repo
checkout, so that it can inspect, edit, test, commit, and push engineering work" (US-55); wants "sandbox
network access to be allow-all with strong containment, so that Eve can work flexibly while compensating for
exfiltration risk" (US-56); and wants "no secrets, no environment files, no service-role keys, no production
dumps, egress and command audit, sensitive-file scanning, protected-file detection, and emergency kill switches
around the sandbox, so that allow-all networking is contained" (US-57). [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:259]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:262]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:266] The design
constraint is explicit: "The sandbox may use a writable repo checkout and allow-all network access, but only
with strong containment: no mounted secrets, no environment files, no service-role keys, no production dumps,
egress and command audit, sensitive-file scanning, protected-file detection, and emergency kill switch."
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:509]

This slice matters to the partner boundary more than any other so far. Allow-all egress from a writable
checkout is precisely where donor PII, payments, secrets, and tenant facts could leak — the exact data the
fleet charter forbids from ever touching this infra. Specifying the sandbox as a place with **no mounted
secrets/env/service-role/production dumps**, **audited egress and commands**, a **sensitive-file scanner**,
**protected-file detection**, and a **networking kill switch** is what makes allow-all networking survivable:
the containment is structural, not a policy request. The sandbox is also where model calls originate, so it
resolves models **only through #421's policy** (via the #425 runtime) — keeping the fleet's shared GPU gateway
a proposed, non-default, revocable route rather than something the sandbox hardcodes.

## What Changes

- Add a new OpenSpec capability `eve-sandbox-engineering-worker` (spec delta in
  `specs/eve-sandbox-engineering-worker/spec.md`) stating: the sandbox provides a **writable repo checkout** for
  inspect/edit/test/commit/push engineering work; **network access is allow-all only with strong containment**;
  the sandbox has **no mounted secrets, no environment files, no service-role keys, and no production data
  dumps**; **egress and commands are audited** (via #419's record shape) where available; a **sensitive-file
  scanner and protected-file detection can pause risky runs**; a **sandbox-networking kill switch** (driven by
  #420's `disable sandbox networking` control) and emergency stop can cut the sandbox instantly; and the
  sandbox **grants no new authority** — it resolves models through #421 via the #425 runtime, spends under #423
  budgets, stays disabled by default while the release switch is off, and never bypasses #417 protected-area or
  #418 emergency-off precedence.
- Record the decision under provisional Eve design label **EVE-DESIGN-0011** in this change's `design.md`, building on EVE-DESIGN-0004 (#420), EVE-DESIGN-0005
  (#423), and EVE-DESIGN-0007 (#425).

## What Does Not Change

- This change adds **no live sandbox implementation, no container/VM provisioning code, no egress proxy, and no
  scanner code**; it defines the sandbox capability, its containment contract, and its verification boundary
  while the system stays disabled by default (per #418) and the release switch stays off.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]
- The **kill-switch state and control path** remain #420's scope; #429 only requires the sandbox **honor**
  #420's `disable sandbox networking` switch and force-approval mode — it does not define or persist switch
  state. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:96]
- The **audit-record shape** remains #419's scope; the sandbox emits egress/command audit records **in** that
  shape, it does not redefine it. The **approval/budget policy** remains #423's scope; sandbox work spends
  **under** those budgets. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:129]
- The **isolated runtime package** remains #425's scope; #429 is the **contained environment the runtime runs
  in**, not the runtime itself. The **model-policy capability** remains #421's scope; the sandbox resolves
  models **through** it, never hardcoding a provider. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:155]
- The **GitHub read/review path** remains #430's (slice 14) scope, and the **autonomous PR operator** remains
  #431's (slice 15) scope; #429 provides the contained checkout those later slices act from, not the GitHub
  identity or PR actions. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:224]
- No donor PII, payments, secrets, one-time codes, or tenant facts enter the sandbox — that boundary is
  reinforced here, never relaxed. No Supabase schema, Mission Control UI, or provider-client code lands. #417's
  contract, `AGENTS.md`, `openspec/project.md`, `openspec/specs/**`, and existing CI gates remain authoritative
  and unchanged; this change is subordinate to them. [VERIFIED-REPO: AGENTS.md] [VERIFIED-REPO: openspec/project.md]

## Expected Outcome

- A validated OpenSpec change
  (`bunx @fission-ai/openspec@latest validate add-eve-sandbox-engineering-worker --strict`) that makes the
  contained sandbox — writable checkout, allow-all-with-containment networking, no mounted
  secrets/env/service-role/prod-dumps, egress and command audit, sensitive-file scanning, protected-file
  detection, and a networking kill switch — a durable, spec-level contract. [VERIFIED-REPO: docs/ai/rules/openspec.md]
- Provisional Eve design decision `EVE-DESIGN-0011` for the sandbox engineering worker, traceable from EVE-DESIGN-0004 (#420), EVE-DESIGN-0005 (#423), and
  EVE-DESIGN-0007 (#425).
- A clear boundary: #420 owns the kill-switch state; #423 owns approval/budget; #425 owns the isolated runtime;
  #419 owns the audit shape; #421 owns model policy; #429 owns the **contained sandbox** those compose in, and
  it stays off until governance is verified. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]
