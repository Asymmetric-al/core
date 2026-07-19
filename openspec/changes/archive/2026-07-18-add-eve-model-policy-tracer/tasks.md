<!-- Completed implementation checklist for GitHub issue #421. -->

## 1. Define the model-policy OpenSpec contract

- [x] 1.1 Add the `eve-model-policy` capability via this change's spec delta
      (`specs/eve-model-policy/spec.md`), building on #418 (state), #419 (audit), and #420 (kill switch)
      without restating them
- [x] 1.2 State the seven requirements as spec: named roles + per-subagent settings; Gateway-primary with
      controlled non-default direct-provider fallbacks; dedicated AI-settings permission for edits; draft →
      eval → activate → rollback, all audited; hard budgets/rate limits with audited emergency override; judge
      models configured separately; policy consumes kill-switch state and grants no new authority
- [x] 1.3 Validate: `bunx @fission-ai/openspec@latest validate add-eve-model-policy-tracer --strict`

## 2. Record canonical ADR-0022 (model policy)

- [x] 2.1 Author ADR-0022 in this change's `design.md`, traceable from ADR-0019 (#418), ADR-0020 (#419), and
      ADR-0021 (#420)
- [x] 2.2 Promote the accepted decision into `docs/adr/` using the next available canonical number, then update all references.
- [x] 2.3 Cross-link the resulting canonical ADR from the parent PRD and issue #421

## 3. Roles, routing, and the fallback path

- [x] 3.1 Specify named roles (agent, review, judge, …) and per-subagent overrides; one platform policy in v1
      with schema room for later tenant overrides
- [x] 3.2 Specify Vercel AI Gateway as the primary route and direct providers as controlled, non-default
      fallbacks eligible only when explicitly configured and eval-passed
- [x] 3.3 Specify that any external partner GPU inference gateway is a proposed, non-default fallback —
      instantly revocable by policy edit or the #420 model-policy kill switch, never a hardcoded/default route,
      never activated by prompt/model/tool input

## 4. Permission, lifecycle, budgets, and audit

- [x] 4.1 State that edits require a dedicated AI-settings permission, are made from Mission Control by a
      verified human, and are never selectable by prompt/model/tool input
- [x] 4.2 State the draft → eval → activate → rollback lifecycle; activation blocked unless the eval gate passes;
      every draft/activation/rollback/override emits a #419 audit record
- [x] 4.3 State hard budgets/rate limits per role/subagent/workflow/eval/judge with a permissioned, audited
      emergency override; and that judge/eval models are configured separately from agent models

## 5. Boundary and subordination

- [x] 5.1 Draw the boundary: #418 owns state; #419 owns the audit record; #420 owns the model-policy kill
      switch; #433 owns the subagent catalog; #421 owns the model-policy capability those compose with
- [x] 5.2 State that model policy consumes persisted #420 switch state, cannot be satisfied by a model/tool/
      memory claim, and never bypasses #417 protected-area/approval limits or #418 emergency-off precedence

## 6. Acceptance checks (HITL)

- [x] 6.1 Maintainer review of the role model, the Gateway-primary/controlled-fallback rule, the permission
      model, and the no-new-authority boundary
- [x] 6.2 Confirm the direct-provider fallback rule keeps any partner GPU gateway a proposed, non-default,
      eval-gated, instantly-revocable fallback (charter data-boundary / model-policy posture)
- [x] 6.3 Confirm the app-owned Supabase schema, Mission Control UI,
      deterministic safety evaluator, and pure resolver do not introduce live
      provider calls or enable Eve runtime
- [x] 6.4 Confirm the change is subordinate to #417/#418/#420, OpenSpec, `AGENTS.md`, `docs/ai/*`, and existing
      CI gates
- [x] 6.5 Open the implementation as a non-draft PR for human review
