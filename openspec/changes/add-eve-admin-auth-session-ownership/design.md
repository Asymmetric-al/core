# Design (provisional Eve label EVE-DESIGN-0008): Eve Current Admin Auth and Session Ownership

> **Numbering:** `EVE-DESIGN-0008` is a provisional cross-change label, not a canonical `docs/adr/` number. If this decision is accepted, its implementation PR must allocate the next available canonical number and update every reference, following `docs/adr/README.md`.

> This `design.md` uses provisional Eve design label **EVE-DESIGN-0008**, the admin-auth/session-ownership decision required by issue #426.
> It builds on **#422** (`add-eve-admin-memory-tracer`), **EVE-DESIGN-0005** (#423,
> `add-eve-approval-budget-policy`), and **EVE-DESIGN-0007** (#425, `add-eve-runtime-foundation`), and does not
> restate them — it operationalizes the auth boundary that maps the current admin identity, derives tenant and
> user from verified session context only, and enforces ownership over the sessions #425 hosts, the memory #422
> governs, and the approval responses #423 governs, while the release switch stays off per #418. When accepted
> into `Asymmetric-al/core`, its ADR body should also be landed at the repo's ADR location (same convention
> chosen for ADR-0018). Every grounded claim carries a `[VERIFIED-REPO: path:line]` citation read from
> `Asymmetric-al/core` at commit `f535c035` on 2026-07-04.
> [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:168]

## Status

Proposed (partner draft for #426). Supersedes nothing. Builds on #422 (admin memory), EVE-DESIGN-0005 (#423), and
EVE-DESIGN-0007 (#425). Subordinate to OpenSpec and `AGENTS.md`. [VERIFIED-REPO: AGENTS.md]
[VERIFIED-REPO: openspec/project.md]

## Context

The implementation plan scopes slice 10 (#426, "Current Admin Auth and Session Ownership") as an **AFK** slice
**blocked by slices 6, 7, and 9** — the private admin memory tracer (#422), the approval/budget policy (#423),
and the standalone runtime foundation (#425) — and covering user stories 5, 6, 7, 30, 31, 74, and 75.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:171]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:172] What it must prove is that
"Eve route auth maps current admin identity and enforces session ownership before admin UI mount," with
acceptance that "tenant and user are derived from verified session context only," that "session create,
continue, stream, approval response, memory, audit, and replay access enforce ownership," and that "service
identity works for background jobs with explicit initiator metadata."
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:173]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:176]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:177]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:179]

The platform constraints already fix the auth boundary's shape. Eve must "act as my current admin identity
inside Mission Control" so product actions inherit "my tenant, role, and permissions" (US-5); admin actions
must be "audited under my identity" so the organization "can tell who initiated each operation" (US-6);
background jobs must "use a service identity with explicit initiator metadata" (US-7); tenant auth must "derive
tenant and user from verified session context only" so Eve "never accepts tenant IDs from prompts, model
output, or tool input" (US-74); and session "create, continue, and stream access" must "enforce ownership" so
users "cannot access another tenant's or user's durable session" (US-75).
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:67]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:71]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:74]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:331]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:335]

The boundary constraints restate the same contract as durable rules: tenant auth "always derives tenant and
user from verified route or admin session context," and IDs "supplied by prompts, model output, tool input, or
remote responses are never authority"; session "create, continue, stream, approval response, memory access, and
replay access must enforce user and tenant ownership"; and "background jobs, schedules, and system-initiated
work use a service identity with explicit initiator metadata."
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:427]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:431]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:377]

The `platform-boundaries` spec already makes sensitive operations server-side-only and treats tenant isolation
as a structural boundary; this auth layer inherits those contracts and adds no relaxation — it is the
enforcement point where verified session context becomes the only source of tenant and user.
[VERIFIED-REPO: openspec/specs/platform-boundaries/spec.md]

**Partner-boundary note.** Auth is a protected area in the #417 foundation, and this slice is the gate that
must hold before any admin UI mount exposes Eve. Fixing tenant and user as derived **only** from verified
session context — never a prompt, model output, tool input, or remote response — is the structural control that
keeps donor/tenant identity correctness a property of the auth layer, not of model behavior, and keeps the data
boundary intact when Eve later writes operational records under policy.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:427]

## Decision

1. **Eve acts as the current admin identity.** For admin UI requests, Eve acts as the authenticated current
   admin user; its product actions inherit that user's tenant, role, and permissions, and are audited under
   that identity. Eve never elevates beyond, or acts outside, the acting user's tenant/role/permissions.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:67]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:71]
2. **Service identity with explicit initiator metadata.** Background jobs, schedules, and system-initiated work
   run under a distinct service identity that carries explicit initiator metadata naming the accountable human
   or trigger; system work is never attributed to a real admin user without that recorded initiator.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:377]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:74]
3. **Verified session context is the only source of tenant and user.** Tenant and user are derived only from
   verified route or admin session context. Tenant or user IDs supplied by prompts, model output, tool input,
   or remote responses are never authority and are ignored for identity resolution.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:427]
4. **Ownership enforced on every access path.** Session create, continue, stream, approval response, memory
   read/write, audit read, and replay/debug artifact access each enforce user and tenant ownership; a request
   whose verified context does not own the target session or artifact is denied, so no user reaches another
   tenant's or user's durable session or artifacts.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:431]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:177]
5. **Server-side, fail-closed, auth-before-mount.** Ownership and identity are enforced server-side on verified
   context, and enforcement fails closed — missing, unverifiable, or mismatched ownership denies access rather
   than defaulting open. This gate must hold before the #427/#428 admin UI mount, and it applies to the
   sessions the #425 runtime hosts. [VERIFIED-REPO: openspec/specs/platform-boundaries/spec.md]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:168]
6. **Subordinate; grants no new authority.** This slice only adds the auth/session-ownership boundary; it never
   widens Eve's authority, never bypasses #417 protected-area/production-write/approval limits or #418
   emergency-off precedence, and the release switch stays off until auth is verified. The change itself remains
   a spec/ADR contract and introduces no live auth code.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]
   [VERIFIED-REPO: openspec/project.md] [VERIFIED-REPO: AGENTS.md]

## Boundary with adjacent slices

- **#417 (ADR-0018, foundation):** owns the autonomy contract and the protected-area set (auth among them) at
  spec level. #426 is subordinate to it and enforces the auth protected area.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:52]
- **#419 (audit tracer):** owns the audit-record shape and content. #426 requires actions be audited **under
  the acting identity** with initiator metadata; it does not define the record fields.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:71]
- **#422 (admin memory):** owns what private admin memory stores and its exclusions. #426 enforces
  **ownership** on memory access; it does not define memory content.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:431]
- **#423 (EVE-DESIGN-0005, approval/budget):** owns approval and budget policy. #426 enforces **ownership** on
  approval-response access; it does not define approval policy.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:129]
- **#424 (retention/replay):** owns retention and replay artifacts. #426 enforces **ownership** on replay/debug
  access; it does not define retention. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:408]
- **#425 (EVE-DESIGN-0007, runtime foundation):** hosts Eve sessions and workflow durability. #426 enforces
  **ownership** over those runtime-hosted sessions; it does not host them.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:168]
- **#427 (admin workspace shell) / #428 (admin mount):** own the workspace UI and the Next.js mount. #426 is
  the auth gate that must hold **before** that mount exposes Eve.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:168]

## Verification contract

- OpenSpec validates:
  `bunx @fission-ai/openspec@latest validate add-eve-admin-auth-session-ownership --strict`.
  [VERIFIED-REPO: docs/ai/rules/openspec.md]
- Existing repo gates remain required and unchanged (`format:check`, `skills:verify`, `lint`,
  `verify:workspace-contract`, `verify:eslint`, `typecheck`, `build`, `test:unit`, plus data-boundary
  verification). [VERIFIED-REPO: docs/ai/rules/general.md]
- The slice-specific acceptance tests — admin UI requests act as the current admin user, background jobs act as
  service identity with initiator metadata, tenant IDs cannot be selected by prompt or tool input, and session
  ownership across creation, continuation, stream attachment, approval responses, memory reads, memory writes,
  audit reads, and replay/debug artifact access — land with the implementing PR, not this spec/ADR.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:538]
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:542]

## Consequences

- Positive: tenant and user identity is provably a property of verified session context, not model behavior;
  system work is accountable through service identity with initiator metadata; and no session or governance
  artifact is reachable across tenant or user boundaries — the auth gate holds before any admin mount.
- Cost: an auth/session-ownership layer to build and maintain, and ownership checks on every access path (a
  deliberate price for cross-tenant isolation that fails closed).
- Risk if skipped: Eve accepting tenant/user IDs from prompt or tool input, or exposing another tenant's
  durable session — the exact identity-confusion and cross-tenant failures the constraints forbid.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:427]

## Alternatives considered

- **Trust tenant/user IDs from prompt, tool input, or model output.** Rejected: tenant auth must derive tenant
  and user from verified session context only; supplied IDs are never authority.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:427]
- **Run background jobs as a real admin user.** Rejected: system-initiated work must use a service identity
  with explicit initiator metadata so it stays accountable.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:377]
- **Enforce ownership only on session create.** Rejected: create, continue, stream, approval response, memory,
  audit, and replay access must each enforce ownership.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:431]
- **Enforce ownership client-side or fail open.** Rejected: sensitive operations are server-side-only and
  tenant isolation is structural; enforcement must fail closed.
  [VERIFIED-REPO: openspec/specs/platform-boundaries/spec.md]
- **Mount admin UI first, add auth later.** Rejected: this gate must hold before admin UI mount, and the
  release switch stays off until auth is verified.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:173]
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]

## Out of scope (this change)

Live auth/middleware code, a session store, admin UI, the audit-record shape (#419), private-memory content
(#422), approval/budget policy (#423), retention/replay artifacts (#424), the session-hosting runtime (#425),
the admin workspace shell (#427), the Next.js admin mount (#428), the governance-kernel state store (#418), any
Supabase schema, and any live autonomy — all deferred to their own separately-gated slices.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:168]
