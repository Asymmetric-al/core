# Proposal: Eve current admin auth and session ownership

**Prepared by the Eve partner fleet for Eve / Asymmetric.**

> **Partner DRAFT for GitHub issue #426 ("Eve: Current admin auth and session ownership").** Staged in the
> Gitea `proposals` repo; NOT a change to `Asymmetric-al/core`, and enters that repo only through Asymmetric's
> OpenSpec workflow after operator/maintainer sign-off. **Builds on #422** (`add-eve-admin-memory-tracer`),
> **#423** (`add-eve-approval-budget-policy`, EVE-DESIGN-0005), and **#425**
> (`add-eve-runtime-foundation`, EVE-DESIGN-0007) — the three slices the implementation plan names as #426's blockers.
> It does not restate their contracts; it defines the **auth and session-ownership boundary** that maps the
> current admin identity, derives tenant and user from verified session context only, and enforces ownership on
> every Eve session and governance-artifact access path — including the memory access #422 governs, the
> approval responses #423 governs, and the runtime-hosted sessions #425 hosts. Every grounded claim carries a
> `[VERIFIED-REPO: path:line]` citation read from `Asymmetric-al/core` at commit `f535c035` on 2026-07-04.

## Why

The implementation plan scopes slice 10 as **Current Admin Auth and Session Ownership**, issue **#426**, an
**AFK** slice **blocked by slices 6, 7, and 9** — the private admin memory tracer (#422), the approval/budget
policy (#423), and the standalone runtime foundation (#425).
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:23]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:168]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:171] All three blockers are
already proposed, so #426 is unblocked. Its stated purpose is to prove that "Eve route auth maps current admin
identity and enforces session ownership before admin UI mount," with acceptance that "tenant and user are
derived from verified session context only," that "session create, continue, stream, approval response, memory,
audit, and replay access enforce ownership," and that "service identity works for background jobs with explicit
initiator metadata." [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:173]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:176]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:177]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:179] It covers user stories 5, 6,
7, 30, 31, 74, and 75. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:172]

The platform constraints already fix the shape. An admin user wants "Eve to act as my current admin identity
inside Mission Control, so that its product actions inherit my tenant, role, and permissions" (US-5), and wants
"Eve's admin actions to be audited under my identity, so that the organization can tell who initiated each
operation" (US-6). A platform owner wants "Eve background jobs to use a service identity with explicit
initiator metadata, so that scheduled and system work remains accountable" (US-7).
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:67]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:71]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:74] A maintainer
wants "tenant auth to derive tenant and user from verified session context only, so that Eve never accepts
tenant IDs from prompts, model output, or tool input" (US-74), and wants "Eve session create, continue, and
stream access to enforce ownership, so that users cannot access another tenant's or user's durable session"
(US-75). [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:331]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:335]

The platform boundaries already state the rule this slice makes enforceable as spec: "Tenant auth always
derives tenant and user from verified route or admin session context. Tenant or user IDs supplied by prompts,
model output, tool input, or remote responses are never authority," and "Eve session create, continue, stream,
approval response, memory access, and replay access must enforce user and tenant ownership."
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:427]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:431]
"Background jobs, schedules, and system-initiated work use a service identity with explicit initiator
metadata." [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:377]

This slice matters to the partner boundary: **auth is a protected area** in the #417 foundation, and this is
the gate that must hold before any admin UI mount (#427/#428) exposes Eve. Fixing that tenant and user come
**only** from verified session context — never from a prompt, model output, tool input, or remote response — is
exactly the structural control that keeps the data boundary intact when Eve later acts on operational records,
and it keeps donor/tenant identity correctness a property of the auth layer rather than of model behavior. It
composes with, and does not weaken, the release switch staying off until "governance, auth, audit, evals,
protected-area policy, kill switches, and rollback paths are verified."
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]

## What Changes

- Add a new OpenSpec capability `eve-admin-auth-session-ownership` (spec delta in
  `specs/eve-admin-auth-session-ownership/spec.md`) stating: Eve **acts as the current admin identity** for
  admin UI requests so its product actions inherit that user's tenant, role, and permissions, and those actions
  are **audited under that identity** (the audit-record shape stays #419's scope); **background jobs use a
  service identity** carrying **explicit initiator metadata** (the accountable human or trigger); **tenant and
  user are derived from verified route/admin session context only** and IDs from prompts, model output, tool
  input, or remote responses are **never authority**; **session create, continue, stream, approval response,
  memory, audit, and replay access all enforce user and tenant ownership**, so no user reaches another tenant's
  or user's durable session or artifacts; enforcement is **server-side and fails closed**, is the **auth gate
  before admin UI mount** (#427/#428), and applies to the **#425 runtime-hosted sessions**; and the change
  **grants no new authority** — subordinate to #417's protected-area/approval limits and #418's emergency-off
  precedence, with the release switch staying off until auth is verified.
- Record the decision under provisional Eve design label **EVE-DESIGN-0008** in this change's `design.md`, building on #422 (admin memory), EVE-DESIGN-0005
  (#423), and EVE-DESIGN-0007 (#425).

## What Does Not Change

- This change adds **no live auth code, no session store, no middleware, and no admin UI**; it defines the auth
  and session-ownership capability and its enforcement contract while the system stays disabled by default (per
  #418) and the release switch stays off until auth is verified.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]
- The **audit-record shape and content** remain #419's scope; #426 only requires that admin actions are audited
  **under the acting identity** and that background jobs record **initiator metadata** — it does not define the
  record fields. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:71]
- The **private admin memory** capability (what memory stores, its exclusions) remains #422's scope; #426 only
  requires that memory access **enforces ownership**. The **approval/budget policy** remains #423's scope; #426
  only requires that approval-response access **enforces ownership**.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:431]
- The **retention and replay artifacts** remain #424's scope; #426 only requires that replay/debug access
  **enforces ownership**. The **governance state store** (where sessions-adjacent governance data persists)
  remains #418's scope. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:408]
- The **runtime that hosts sessions** remains #425's scope; #426 does not host sessions, it enforces ownership
  over them. The **admin workspace shell** (#427) and the **Next.js admin mount** (#428) remain their own
  scope; #426 is the auth gate that must hold **before** that mount.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:168]
- No Supabase schema, Mission Control UI, or provider-client code lands here. #417's contract, `AGENTS.md`,
  `openspec/project.md`, `openspec/specs/**`, and existing CI gates remain authoritative and unchanged; this
  change is subordinate to them. [VERIFIED-REPO: AGENTS.md] [VERIFIED-REPO: openspec/project.md]
  [VERIFIED-REPO: openspec/specs/platform-boundaries/spec.md]

## Expected Outcome

- A validated OpenSpec change
  (`bunx @fission-ai/openspec@latest validate add-eve-admin-auth-session-ownership --strict`) that makes the
  Eve auth and session-ownership boundary — current-admin-identity mapping, service identity with initiator
  metadata, verified-context-only tenant/user derivation, ownership enforcement on session/approval/memory/
  audit/replay access, server-side fail-closed, auth-before-mount — a durable, spec-level contract.
  [VERIFIED-REPO: docs/ai/rules/openspec.md]
- Provisional Eve design decision `EVE-DESIGN-0008` for admin auth and session ownership, traceable from #422 (admin memory), EVE-DESIGN-0005 (#423), and
  EVE-DESIGN-0007 (#425).
- A clear boundary: #417 owns the protected-area/auth contract; #419 owns the audit-record shape; #422 owns
  memory content; #423 owns approval/budget; #424 owns retention/replay; #425 hosts sessions; #427/#428 own the
  admin shell and mount; #426 owns the **auth and session-ownership gate** they all pass through.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]
