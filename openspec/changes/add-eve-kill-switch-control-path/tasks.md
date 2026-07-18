<!-- Partner DRAFT for GitHub issue #420. Task list for the `add-eve-kill-switch-control-path`
OpenSpec change; enters `Asymmetric-al/core` only via Asymmetric's OpenSpec workflow after sign-off.
Acceptance and scope grounded in [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
and [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]. -->

## 1. Define the kill-switch OpenSpec contract

- [ ] 1.1 Add the `eve-kill-switch` capability via this change's spec delta
      (`specs/eve-kill-switch/spec.md`), building on #418 (state) and #419 (audit) without restating them
- [ ] 1.2 State the five requirements as spec: the suite covers every autonomous domain; switches are
      admin/external actuatable before runtime exists; every actuation creates a #419 audit record; policy
      checks consume switch state and cannot be bypassed; the control path drives #418 state, is subordinate
      to #417, and grants no new authority
- [ ] 1.3 Validate: `bunx @fission-ai/openspec@latest validate add-eve-kill-switch-control-path --strict`

## 2. Record the provisional Eve design decision EVE-DESIGN-0004 (kill-switch control path)

- [ ] 2.1 Author the decision under provisional Eve design label EVE-DESIGN-0004 in this change's `design.md`, traceable from ADR-0019 (#418) and ADR-0020 (#419)
- [ ] 2.2 At implementation time, promote the accepted decision into `docs/adr/` using the next available canonical number, then update all references.
- [ ] 2.3 Cross-link the resulting canonical ADR from the parent PRD and issue #420

## 3. Enumerate the per-domain switch set

- [ ] 3.1 Enumerate the switches at spec level: all-automation (master pause), active runs, GitHub actions,
      production writes, sandbox networking, dynamic workflows, model-policy changes, force-approval mode
- [ ] 3.2 State that each switch is independently actuatable and the master pause halts all domains at once
- [ ] 3.3 State that force-approval mode converts every autonomous action into a human approval while engaged

## 4. Actuation, audit, and non-bypass contract

- [ ] 4.1 State that actuation is a verified authorized-human (or authenticated external control) action,
      never selectable by prompt/model/tool input, and provable before runtime integrations exist
- [ ] 4.2 State that every actuation (set/clear/toggle, any domain) emits a #419 audit record
- [ ] 4.3 State that every policy check consumes persisted app-owned switch state, blocks the matching domain,
      aborts + records on block, and is never satisfiable by a model/tool/memory claim

## 5. Boundary and subordination

- [ ] 5.1 Draw the boundary: #418 owns emergency/kill-switch state + consult gate; #419 owns the audit record
      shape; #421 owns model policy; #420 owns the per-domain control path that drives state, emits records,
      and feeds policy checks
- [ ] 5.2 State that cleared switches never bypass #417 protected-area/approval limits or #418 emergency-off
      precedence, and that this change grants no new authority

## 6. Acceptance checks (HITL)

- [ ] 6.1 Maintainer review of the switch set, actuation identity model, and the no-new-authority boundary
- [ ] 6.2 Confirm no Supabase schema, admin UI, or runtime code is included in this change
- [ ] 6.3 Confirm the change is subordinate to #417/#418, OpenSpec, `AGENTS.md`, `docs/ai/*`, and existing CI gates
- [ ] 6.4 Human sign-off before the change is opened as a PR against `Asymmetric-al/core:develop`
