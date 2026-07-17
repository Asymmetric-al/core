<!-- Partner DRAFT for GitHub issue #418. Task list for the `add-eve-governance-kernel-release-switch`
OpenSpec change; enters `Asymmetric-al/core` only via Asymmetric's OpenSpec workflow after sign-off.
Acceptance and scope grounded in [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
and [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]. -->

## 1. Define the governance-kernel OpenSpec contract

- [ ] 1.1 Add the `eve-governance-kernel` capability via this change's spec delta
      (`specs/eve-governance-kernel/spec.md`), building on #417 without restating it
- [ ] 1.2 State the five requirements as spec: release switch disabled by default; emergency-off
      precedence over the switch; kernel persists release/emergency/kill-switch state + run summaries +
      policy status and every autonomous action consults it; disabled/emergency state observable and
      provably blocking; kernel subordinate to #417 and grants no new authority
- [ ] 1.3 Validate: `bunx @fission-ai/openspec@latest validate add-eve-governance-kernel-release-switch --strict`

## 2. Record the provisional Eve design decision EVE-DESIGN-0002 (governance kernel + release switch)

- [ ] 2.1 Author the decision under provisional Eve design label EVE-DESIGN-0002 in this change's `design.md`, traceable from ADR-0018 (#417)
- [ ] 2.2 At implementation time, promote the accepted decision into `docs/adr/` using the next available canonical number, then update all references.
- [ ] 2.3 Cross-link the resulting canonical ADR from the parent PRD and issue #418

## 3. Fix the release-switch / emergency-off state boundary

- [ ] 3.1 Define the kernel's persisted state fields at spec level: release-switch state
      (disabled default), emergency-off state, kill-switch state (read here, driven by #420),
      run summaries, policy status
- [ ] 3.2 State that the kernel is the single consult point every autonomous action reads immediately
      before acting, and that it aborts + records the reason when disabled or emergency-off
- [ ] 3.3 State the precedence rule: emergency-off overrides an enabled release switch; clearing
      emergency-off returns only to what the release switch dictates (never auto-resumes)
- [ ] 3.4 Draw the boundary vs #420 (granular per-domain kill-switch control path) and #437
      (final release-switch flip after end-to-end verification)

## 4. Non-bypass + observability contract

- [ ] 4.1 State that kernel decisions use only persisted app-owned state, never prompt/model/tool/memory claims
- [ ] 4.2 State that an authorized admin can see enabled/disabled, emergency-off, and policy status
- [ ] 4.3 Require tests that prove disabled mode blocks autonomous behavior (gate is not cosmetic)

## 5. Acceptance checks (HITL)

- [ ] 5.1 Maintainer review of the release-switch/emergency-off state model and the no-new-authority boundary
- [ ] 5.2 Confirm no Supabase schema, admin UI, or runtime code is included in this change
- [ ] 5.3 Confirm the change is subordinate to #417, OpenSpec, `AGENTS.md`, `docs/ai/*`, and existing CI gates
- [ ] 5.4 Human sign-off before the change is opened as a PR against `Asymmetric-al/core:develop`
