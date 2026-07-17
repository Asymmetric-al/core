# Design (provisional Eve label EVE-DESIGN-0010): Eve Admin Mount and Global Panel

> **Numbering:** `EVE-DESIGN-0010` is a provisional cross-change label, not a canonical `docs/adr/` number. If this decision is accepted, its implementation PR must allocate the next available canonical number and update every reference, following `docs/adr/README.md`.

> This `design.md` uses provisional Eve design label **EVE-DESIGN-0010**, the admin-mount-and-global-panel decision required by issue #428.
> It is traceable from **EVE-DESIGN-0007** (#425, `add-eve-runtime-foundation`, the standalone Eve runtime), **EVE-DESIGN-0008**
> (#426, `add-eve-admin-auth-session-ownership`, the admin auth/session-ownership gate), and **EVE-DESIGN-0009** (#427,
> `add-eve-admin-workspace-shell`, the operations-first workspace shell), and does not restate them — it
> operationalizes the **admin mount and global panel** that exposes the #427 shell into Mission Control through
> the compatible Next.js path, on the #425 runtime, behind the #426 auth gate, feeding the panel basic page
> context only, while the release switch stays off per #418. When accepted into `Asymmetric-al/core`, its ADR
> body should also be landed at the repo's ADR location (using the next available canonical number per `docs/adr/README.md`). Every grounded
> claim carries a `[VERIFIED-REPO: path:line]` citation read from `Asymmetric-al/core` at commit `f535c035` on
> 2026-07-04. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:195]

## Status

Proposed (partner draft for #428). Supersedes nothing. Traceable from EVE-DESIGN-0007 (#425, runtime), EVE-DESIGN-0008 (#426,
admin auth), and EVE-DESIGN-0009 (#427, workspace shell). Subordinate to OpenSpec and `AGENTS.md`.
[VERIFIED-REPO: AGENTS.md] [VERIFIED-REPO: openspec/project.md]

## Context

The implementation plan scopes slice 12 (#428, "Admin Mount and Global Panel") as a **HITL** slice **blocked by
slices 9, 10, and 11** — the standalone Eve runtime foundation (#425), the current admin auth and session
ownership gate (#426), and the admin workspace operations shell (#427) — and covering user stories 25, 26, 27,
28, 73, 74, and 75. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:198]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:199] What it must prove is that
"Eve can be mounted into admin through the compatible Next.js path and provide a global panel with basic page
context only," with acceptance that "compatibility with the installed Next.js version is proven or explicitly
blocked on stable 16.3 rollout," that "the global panel receives route, page identity, selected tenant/org, and
safe UI state," and that "raw records, payment data, donor details, table rows, and sensitive form values are
not sent silently." [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:200]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:203]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:205]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:207]

The platform constraints already fix the mount's shape. An admin wants "a global Eve panel in Mission Control"
so they "can ask for help from any admin page" (US-27), and wants "the global panel to receive basic page
context" — "the route, page, selected tenant, and safe UI state without ingesting raw records or sensitive form
values" (US-28). A maintainer wants "the admin mount to use the Eve Next.js integration only after
compatibility with the repo's installed Next.js version is proven or the planned Next.js 16.3 rollout is
stable" (US-73), wants "tenant auth to derive tenant and user from verified session context only" (US-74), and
wants "Eve session create, continue, and stream access to enforce ownership" (US-75).
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:150]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:153]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:326]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:331]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:335]

The boundary constraints restate the same contract as durable rules: "The admin mount uses Eve's Next.js
integration only after compatibility is confirmed with the installed Next.js version or after the planned
Next.js 16.3 stable rollout is validated"; "A lightweight global Eve panel appears across Mission Control and
receives basic page context only: route, page identity, selected tenant or org, and safe UI state. It does not
automatically receive table rows, donor details, payment data, raw form values, or sensitive records"; and
"Global panel tests must verify that basic page context is included and raw records, payment data, donor
details, table rows, and sensitive form values are not silently included."
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:370]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:455]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:582]

The installed Next.js version is a hard fact this slice must respect: the repo's root and app packages pin
`next` **16.2.6**, not 16.3. [VERIFIED-REPO: package.json:169] So the "compatibility proven or explicitly
blocked" acceptance resolves to: prove the Eve integration against 16.2.6, or block the mount on the 16.3
rollout — and if Eve needs a newer Next.js than installed, "the Next.js upgrade must become a separate
prerequisite," with the runtime kept isolated as a dedicated workspace package "until the repo deliberately
changes its broader Node baseline."
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:644]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:649]

The `platform-boundaries` spec keeps sensitive operations server-side and treats tenant isolation as a
structural boundary; the mount and panel inherit those contracts and add no relaxation — the panel receives
governance-safe page context only. [VERIFIED-REPO: openspec/specs/platform-boundaries/spec.md]

**Partner-boundary note.** The admin mount is the point where Eve first becomes **admin-visible**, so it is a
**HITL** slice and the charter data boundary binds hardest here. Because the global panel receives route, page
identity, selected tenant/org, and safe UI state only — and never table rows, donor details, payment data, raw
form values, or sensitive records — donor PII, payments, and tenant facts stay off this surface by
construction, and the mount does not weaken tenant safety, donor trust, money integrity, or identity
correctness (US-4). The mount is gated by the #426 auth boundary, and the release switch stays off until
verified. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:63]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]

## Decision

1. **Compatibility-gated Next.js mount.** The admin mount uses Eve's Next.js integration only after
   compatibility with the installed version (`next` 16.2.6) is proven, or after the planned 16.3 stable rollout
   is validated; otherwise the mount is explicitly blocked on that rollout. The Eve runtime stays a dedicated,
   Node-isolated workspace package, and a newer-Next.js requirement is a separate prerequisite, not part of this
   mount. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:370]
   [VERIFIED-REPO: package.json:169]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:644]
2. **Global panel across Mission Control.** A lightweight global Eve panel is available across Mission Control
   so an admin can ask for help from any admin page.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:150]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:455]
3. **Basic page context only.** The panel receives route, page identity, selected tenant or org, and safe UI
   state only, and does not automatically receive table rows, donor details, payment data, raw form values, or
   sensitive records. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:153]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:205]
4. **No silent sensitive data; tests both ways.** The mount and panel never silently send raw records, payment
   data, donor details, table rows, or sensitive form values, and the panel tests verify both that basic page
   context is included and that sensitive data is not.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:207]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:582]
5. **Auth-gated, ownership-enforcing mount.** The mount is gated by the #426 auth boundary: tenant and user
   derive from verified session context only, and session create/continue/stream enforce ownership; the mount
   inherits that boundary and does not redefine it.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:331]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:335]
6. **Exposes the #427 shell on the #425 runtime.** The mount exposes the #427 operations-first workspace shell
   running on the #425 standalone runtime; it hosts and renders them and does not redefine the shell's panels,
   decision-summary rule, or role-gating, nor the runtime's contract.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:181]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:155]
7. **HITL; grants no new authority; spec-only.** This slice adds only the mount/panel boundary as a spec/ADR
   contract; it introduces no live mount, Next.js integration wiring, global panel UI, or Supabase schema, is
   HITL, never bypasses #417 protected-area/approval limits, #418 emergency-off precedence, or the #426 auth
   gate, and keeps the release switch off until verified.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]
   [VERIFIED-REPO: openspec/project.md] [VERIFIED-REPO: AGENTS.md]

## Boundary with adjacent slices

- **#417 (ADR-0018, foundation):** owns the autonomy contract and the protected-area set at spec level. #428 is
  subordinate to it and exposes governance-safe context within it.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:49]
- **#418 (EVE-DESIGN-0002, governance kernel):** owns the governance state store and release switch, which stays off
  until verified. #428 introduces neither; it mounts behind the disabled-by-default posture.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:62]
- **#425 (EVE-DESIGN-0007, runtime foundation):** owns the standalone Eve runtime, its workspace package, and Node
  isolation. #428 mounts that runtime into admin; it does not define it.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:155]
- **#426 (EVE-DESIGN-0008, admin auth):** owns tenant/user derivation from verified session context and ownership
  enforcement on session create/continue/stream. #428 mounts behind that gate; it does not redefine it.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:168]
- **#427 (EVE-DESIGN-0009, workspace shell):** owns the operations-first panel set, real-governance-state backing,
  decision summaries, and role-gating. #428 exposes that shell through the mount and global panel; it does not
  redefine it. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:181]
- **#418–#424 (governance slices):** own the governance state store, audit record, kill switches, model policy,
  memory content, approval/budget, and retention/replay. #428 introduces none of them and redefines none of
  them. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:62]

## Verification contract

- OpenSpec validates:
  `bunx @fission-ai/openspec@latest validate add-eve-admin-mount-global-panel --strict`.
  [VERIFIED-REPO: docs/ai/rules/openspec.md]
- Existing repo gates remain required and unchanged (`format:check`, `skills:verify`, `lint`,
  `verify:workspace-contract`, `verify:eslint`, `typecheck`, `build`, `test:unit`, plus data-boundary
  verification). [VERIFIED-REPO: docs/ai/rules/general.md]
- The slice-specific acceptance tests — Next.js compatibility tests proving the current installed version works
  with the Eve integration, Payload, Sentry, Turbopack, and Cache Components, and global panel tests verifying
  basic page context is included and sensitive data is not silently included — land with the implementing PR,
  not this spec/ADR. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:599]
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:582]

## Consequences

- Positive: Eve becomes admin-visible through a compatibility-gated Next.js mount and a global panel reachable
  from any admin page, fed governance-safe page context only, behind verified-session auth — with no sensitive
  data crossing the boundary and the runtime kept Node-isolated.
- Cost: a mount and panel to build and maintain, a Next.js compatibility gate to keep green against the
  installed version, and page-context plumbing constrained to route, page identity, tenant/org, and safe UI
  state.
- Risk if skipped: an ungated or context-leaky mount that destabilizes admin on a Next.js mismatch or silently
  ships donor/payment/record data into the panel — the exact failures the constraints forbid.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:582]

## Alternatives considered

- **Mount Eve into admin before proving Next.js compatibility.** Rejected: the mount uses the Eve Next.js
  integration only after compatibility with the installed version is proven or the 16.3 rollout is stable.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:370]
- **Bundle a Next.js 16.3 upgrade into this mount.** Rejected: if Eve requires a newer Next.js than installed,
  the upgrade must become a separate prerequisite, and the runtime stays isolated until the repo changes its
  Node baseline. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:644]
- **Feed the panel full page data (table rows, form values) for richer help.** Rejected: the panel receives
  basic page context only and must not automatically receive raw records or sensitive form values.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:153]
- **Trust tenant/user from the panel's page context or prompt.** Rejected: tenant and user derive from verified
  session context only, and session access enforces ownership per #426.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:331]
- **Re-implement the workspace shell inside the global panel.** Rejected: the mount exposes the #427 shell on
  the #425 runtime; the panel is a lightweight companion and does not redefine either.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:181]
- **Enable the mount now.** Rejected: this is a spec/ADR-only, HITL slice, and the release switch stays off
  until verified. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]

## Out of scope (this change)

Live admin mount code, the Eve Next.js integration wiring, the global panel UI/components, page-context data
fetchers, the standalone Eve runtime (#425), the admin auth gate (#426), the operations-first workspace shell
(#427), the governance state store (#418), the audit record (#419), kill switches (#420), model policy (#421),
memory content (#422), approval/budget (#423), retention/replay (#424), any Supabase schema, and any live
autonomy — all deferred to their own separately-gated slices.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:195]
