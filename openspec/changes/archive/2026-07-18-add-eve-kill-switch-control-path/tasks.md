<!-- Accepted implementation task list for GitHub issue #420 and the
`add-eve-kill-switch-control-path` OpenSpec change.
Acceptance and scope grounded in [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
and [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]. -->

## 1. Define the kill-switch OpenSpec contract

- [x] 1.1 Add the `eve-kill-switch` capability via this change's spec delta
      (`specs/eve-kill-switch/spec.md`), building on #418 (state) and #419 (audit) without restating them
- [x] 1.2 State the five requirements as spec: the suite covers every autonomous domain; switches are
      admin/external actuatable before runtime exists; every actuation creates a #419 audit record; policy
      checks consume switch state and cannot be bypassed; the control path drives #418 state, is subordinate
      to #417, and grants no new authority
- [x] 1.3 Validate: `bunx @fission-ai/openspec@latest validate add-eve-kill-switch-control-path --strict`

## 2. Record ADR-0021 (kill-switch control path)

- [x] 2.1 Record ADR-0021 in this change's `design.md`, traceable from ADR-0019 (#418) and ADR-0020 (#419)
- [x] 2.2 Promote the accepted decision into `docs/adr/0021-eve-kill-switch-control.md` and update downstream references
- [x] 2.3 Cross-link ADR-0021 from the parent PRD and implementation plan

## 3. Enumerate the per-domain switch set

- [x] 3.1 Enumerate the switches at spec level: all-automation (master pause), active runs, GitHub actions,
      production writes, sandbox networking, dynamic workflows, model-policy changes, force-approval mode
- [x] 3.2 State that each switch is independently actuatable and the master pause halts all domains at once
- [x] 3.3 State that force-approval mode converts every autonomous action into a human approval while engaged

## 4. Actuation, audit, and non-bypass contract

- [x] 4.1 Implement actuation as a verified authorized-human action,
      never selectable by prompt/model/tool input, and provable before runtime integrations exist
- [x] 4.2 Make every actuation (set/clear/toggle, any domain) atomically emit a #419 audit record
- [x] 4.3 Make every policy check consume persisted app-owned switch state, block the matching domain,
      aborts + records on block, and is never satisfiable by a model/tool/memory claim

## 5. Boundary and subordination

- [x] 5.1 Draw the boundary: #418 owns emergency/kill-switch state + consult gate; #419 owns the audit record
      shape; #421 owns model policy; #420 owns the per-domain control path that drives state, emits records,
      and feeds policy checks
- [x] 5.2 State that cleared switches never bypass #417 protected-area/approval limits or #418 emergency-off
      precedence, and that this change grants no new authority

## 6. Acceptance checks

- [x] 6.1 Cover the switch set, actuation identity model, and no-new-authority boundary in automated tests and ADR review
- [x] 6.2 Implement the schema, admin UI, route, atomic audit RPC, and policy-consumption path without live autonomy
- [x] 6.3 Confirm the change is subordinate to #417/#418, OpenSpec, `AGENTS.md`, `docs/ai/*`, and existing CI gates
- [x] 6.4 Open the implementation as a non-draft PR for human review against its dependency branch or `develop`
