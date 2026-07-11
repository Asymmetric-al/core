# Proposal: Eve admin mount and global panel

**Prepared by the Eve partner fleet for Eve / Asymmetric.**

> **Partner DRAFT for GitHub issue #428 ("Eve: Admin mount and global panel").** Staged in the Gitea
> `proposals` repo; NOT a change to `Asymmetric-al/core`, and enters that repo only through Asymmetric's
> OpenSpec workflow after operator/maintainer sign-off. **Builds on the three slices it depends on —**
> **#425** (`add-eve-runtime-foundation`, the standalone Eve runtime), **#426**
> (`add-eve-admin-auth-session-ownership`, ADR-0008, the admin auth/session-ownership gate), and **#427**
> (`add-eve-admin-workspace-shell`, ADR-0009, the operations-first workspace shell) — the three blockers the
> implementation plan names for slice 12. It does not restate their contracts; it defines the **admin mount and
> global panel** that exposes the #427 shell into Mission Control through the compatible Next.js path, behind
> the #426 auth gate, feeding the panel **basic page context only**. Every grounded claim carries a
> `[VERIFIED-REPO: path:line]` citation read from `Asymmetric-al/core` at commit `f535c035` on 2026-07-04.

## Why

The implementation plan scopes slice 12 as **Admin Mount and Global Panel**, issue **#428**, a **HITL** slice
**blocked by slices 9, 10, and 11** — the standalone Eve runtime foundation (#425), the current admin auth and
session ownership gate (#426), and the admin workspace operations shell (#427).
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:195]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:198] All three blockers are
already proposed, so #428 is unblocked. Its stated purpose is to prove that "Eve can be mounted into admin
through the compatible Next.js path and provide a global panel with basic page context only," with acceptance
that "compatibility with the installed Next.js version is proven or explicitly blocked on stable 16.3 rollout,"
that "the global panel receives route, page identity, selected tenant/org, and safe UI state," and that "raw
records, payment data, donor details, table rows, and sensitive form values are not sent silently."
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:200]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:203]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:205]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:207] It covers user stories 25,
26, 27, 28, 73, 74, and 75. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:199]

The platform constraints already fix the shape. An admin user wants "a global Eve panel in Mission Control, so
that I can ask for help from any admin page" (US-27), and wants "the global panel to receive basic page
context, so that Eve knows the route, page, selected tenant, and safe UI state without ingesting raw records or
sensitive form values" (US-28).
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:150]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:153] A maintainer
wants "the admin mount to use the Eve Next.js integration only after compatibility with the repo's installed
Next.js version is proven or the planned Next.js 16.3 rollout is stable, so that the runtime integration does
not destabilize admin" (US-73), wants "tenant auth to derive tenant and user from verified session context
only" so Eve "never accepts tenant IDs from prompts, model output, or tool input" (US-74), and wants "Eve
session create, continue, and stream access to enforce ownership, so that users cannot access another tenant's
or user's durable session" (US-75).
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:326]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:331]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:335]

The platform boundaries restate the same contract as durable rules. "The admin mount uses Eve's Next.js
integration only after compatibility is confirmed with the installed Next.js version or after the planned
Next.js 16.3 stable rollout is validated." The installed version is **`next` 16.2.6**, not 16.3, so
compatibility must be proven against 16.2.6 or the mount is explicitly blocked on the 16.3 rollout.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:370]
[VERIFIED-REPO: package.json:169] "A lightweight global Eve panel appears across Mission Control and receives
basic page context only: route, page identity, selected tenant or org, and safe UI state. It does not
automatically receive table rows, donor details, payment data, raw form values, or sensitive records."
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:455] And the
Node/runtime boundary holds: "The Eve runtime begins as a dedicated workspace package so that Eve's Node and
dependency needs can be isolated before admin mounting," and "the admin mount should be treated as a runtime
compatibility milestone. If Eve requires a newer Next.js release than the repo has installed, the Next.js
upgrade must become a separate prerequisite."
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:367]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:644]

This slice matters to the partner boundary. The mount is a **HITL** slice — it is where Eve first becomes
admin-visible — so the charter safety-first and data-boundary rules bind hardest here: the panel receives
governance-safe page context only, and "raw records, payment data, donor details, table rows, and sensitive
form values are not sent silently," which keeps donor PII, payments, and tenant facts off this surface by
construction. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:207]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:582] The mount is
gated by the #426 admin auth boundary — tenant and user derive from verified session context, and session
create/continue/stream enforce ownership — and the release switch stays off until "governance, auth, audit,
evals, protected-area policy, kill switches, and rollback paths are verified."
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:335]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]

## What Changes

- Add a new OpenSpec capability `eve-admin-mount-global-panel` (spec delta in
  `specs/eve-admin-mount-global-panel/spec.md`) stating: the **admin mount uses Eve's Next.js integration only
  after compatibility with the installed Next.js version (`16.2.6`) is proven or the mount is explicitly blocked
  on the stable 16.3 rollout**, with the Eve runtime kept as a **dedicated, Node-isolated workspace package**
  and any newer-Next.js need treated as a **separate prerequisite**; a **lightweight global Eve panel is
  available across Mission Control** so an admin can ask for help from any admin page; the panel **receives
  basic page context only** — route, page identity, selected tenant or org, and safe UI state; the panel
  **never silently receives** raw records, payment data, donor details, table rows, or sensitive form values,
  and its tests verify both that basic page context is included and that sensitive data is not; the mount is
  **gated by the #426 auth boundary** — tenant and user derive from **verified session context only**, and
  session create/continue/stream **enforce ownership**; the mount **exposes the #427 operations-first workspace
  shell** and **runs on the #425 standalone runtime** without redefining either; and the change **grants no new
  authority** — it is a spec/ADR contract with no live mount code, no Next.js integration wiring, and no
  Supabase schema, it is **HITL**, and the release switch stays off until verified.
- Record the decision as **ADR-0010** in this change's `design.md`, traceable from ADR-0007-era runtime work
  (#425, `add-eve-runtime-foundation`), **ADR-0008** (#426, `add-eve-admin-auth-session-ownership`), and
  **ADR-0009** (#427, `add-eve-admin-workspace-shell`).

## What Does Not Change

- This change adds **no live admin mount, no Next.js integration wiring, no React/Next components, no global
  panel UI, and no Supabase schema**; it defines the mount/panel capability and its compatibility,
  page-context, data-boundary, and auth contracts while the system stays disabled by default (per #418) and the
  release switch stays off until verified.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]
- The **standalone Eve runtime** (its workspace package, Node isolation, and model-policy integration) remains
  #425's scope; #428 mounts that runtime, it does not define it.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:155]
- The **admin auth and session ownership** gate — tenant/user derived from verified session context, ownership
  enforced on session create/continue/stream — remains #426's scope; #428 mounts behind that gate, it does not
  redefine it. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:168]
- The **operations-first workspace shell** — its panel set, real-governance-state backing, decision summaries,
  and role-gating — remains #427's scope; #428 exposes that shell through the mount and panel, it does not
  redefine it. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:181]
- The **governance state store, audit record, kill switches, model policy, memory content, approval/budget, and
  retention/replay** remain #418–#424's scope; #428 introduces none of them and redefines none of them.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:62]
- No Supabase schema, no provider-client code, and no live autonomy land here. #417's contract, `AGENTS.md`,
  `openspec/project.md`, `openspec/specs/**`, and existing CI gates remain authoritative and unchanged; this
  change is subordinate to them. [VERIFIED-REPO: AGENTS.md] [VERIFIED-REPO: openspec/project.md]
  [VERIFIED-REPO: openspec/specs/platform-boundaries/spec.md]

## Expected Outcome

- A validated OpenSpec change
  (`bunx @fission-ai/openspec@latest validate add-eve-admin-mount-global-panel --strict`) that makes the Eve
  admin mount and global panel — Next.js-compatibility-proven mount, global panel across Mission Control,
  basic-page-context-only feed, no-silent-sensitive-data boundary, and the #426 auth gate — a durable,
  spec-level contract. [VERIFIED-REPO: docs/ai/rules/openspec.md]
- ADR-0010 of record for the admin mount and global panel, traceable from #425 (runtime), ADR-0008 (#426 auth),
  and ADR-0009 (#427 shell).
- A clear boundary: #425 owns the standalone runtime; #426 owns the auth gate; #427 owns the operations-first
  shell; #428 owns the **admin mount and global panel** that exposes that shell into Mission Control, through
  the compatible Next.js path, behind the auth gate, with basic page context only.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:660]
