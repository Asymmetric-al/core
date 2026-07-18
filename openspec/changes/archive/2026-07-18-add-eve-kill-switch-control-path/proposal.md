# Proposal: Eve kill-switch control path

**Prepared by WNG partner fleet for Eve / Asymmetric.**

> **Accepted implementation for GitHub issue #420 ("Eve: Kill-switch control path").** This change entered
> `Asymmetric-al/core` through its OpenSpec workflow and was implemented behind the disabled release gate.
> **Builds on #418**
> (`add-eve-governance-kernel-release-switch`, ADR-0019) and **#419** (`add-eve-audit-tracer-bullet`,
> ADR-0020) — it does not restate those contracts, it adds the granular per-domain control path that drives
> the emergency/kill-switch **state** #418 persists and records every actuation as a #419 audit record.
> Every grounded claim carries a `[VERIFIED-REPO: path]` citation read from `Asymmetric-al/core` at commit
> `d14a2434` on 2026-07-02.

## Why

The PRD requires "a full kill-switch suite … [to] pause all automation, stop active runs, disable GitHub
actions, disable production writes, disable sandbox networking, disable dynamic workflows, revoke or disable
model policy changes, and force human approval for all actions" (US-35).
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md] #418 defines
only the system-wide release-switch and emergency-off **state**; it explicitly defers the "granular
per-domain kill-switch control path" to #420.
[VERIFIED-REPO: openspec/specs/eve-autonomous-operations/spec.md] The #420 slice makes that
control path real. Its stated purpose is that "platform owners can stop Eve automation from the admin
workspace before runtime integrations exist," with acceptance that kill switches cover all automation, active
runs, GitHub actions, production writes, sandbox networking, dynamic workflows, model-policy changes, and
force-approval mode; that **kill-switch changes create audit records**; and that **policy checks consume
kill-switch state**. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md] It is an
**AFK** (ahead-of-full-knowledge) slice, blocked by #418 and #419.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

## What Changes

- Add a new OpenSpec capability `eve-kill-switch` (spec delta in `specs/eve-kill-switch/spec.md`) stating:
  the kill-switch suite covers **every autonomous domain** (all-automation, active runs, GitHub actions,
  production writes, sandbox networking, dynamic workflows, model-policy changes, and force-approval mode);
  each switch is **actuatable from the admin workspace by an authorized human before any runtime integration
  exists**; **every kill-switch change creates a #419 audit record**; **every policy check / autonomous
  action consumes kill-switch state and is blocked per-domain**, using only persisted app-owned state (not
  bypassable by prompt/model/tool/memory); and the control path **drives #418's state, is subordinate to
  #417, and grants no new authority**.
- Record the accepted decision as **ADR-0021** in this change's `design.md` and `docs/adr/`, building on ADR-0019 (#418) and
  ADR-0020 (#419), which both build on ADR-0018 (#417).

## What Does Not Change

- This change adds **no live autonomy** and no runtime that a kill switch would stop; it defines the control
  path and the state it drives while the system stays disabled by default (per #418).
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
- The **system-wide release-switch and emergency-off state** remain #418's scope; #420 defines the granular
  per-domain switches that drive that state, not the kernel that persists it.
  [VERIFIED-REPO: openspec/specs/eve-autonomous-operations/spec.md]
- The **audit-record shape** (actor, initiator, identity mode, policy, action, target, result, redacted
  evidence) remains #419's scope; #420 only requires that each actuation _emits_ one.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
- The **model-policy** capability (named roles, Gateway-primary routing, eval-gated activation) is #421's
  scope; #420 only requires a switch that can disable/revoke model-policy changes and that policy checks read
  kill-switch state. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
- #417's contract, `AGENTS.md`, `openspec/project.md`, `openspec/specs/**`, and existing CI gates remain
  authoritative and unchanged; this change is subordinate to them. [VERIFIED-REPO: AGENTS.md]
  [VERIFIED-REPO: openspec/project.md]
- No live autonomous runtime or release-gate enablement lands here. This slice implements the app-owned
  state shape, atomic admin control, audit emission, and reusable policy consumption while Eve remains off.

## Expected Outcome

- A validated and archived OpenSpec capability
  (`bunx @fission-ai/openspec@latest validate add-eve-kill-switch-control-path --strict`) that makes the
  full per-domain kill-switch control path a durable, spec-level contract.
  [VERIFIED-REPO: docs/ai/rules/openspec.md]
- Canonical `ADR-0021` for the kill-switch control path, traceable from ADR-0019 (#418) and ADR-0020 (#419).
- A clear boundary: #418 owns the emergency/kill-switch **state**; #419 owns the **audit record**; #421 owns
  **model policy**; #420 owns the granular per-domain **control path** that drives the state, emits the
  records, and feeds policy checks. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
