<!-- Partner DRAFT for GitHub issue #421. Task list for the `add-eve-model-policy-tracer` OpenSpec
change; enters `Asymmetric-al/core` only via Asymmetric's OpenSpec workflow after sign-off. Acceptance and
scope grounded in [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md] and
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]. -->

## 1. Define the model-policy OpenSpec contract

- [ ] 1.1 Add the `eve-model-policy` capability via this change's spec delta
      (`specs/eve-model-policy/spec.md`), building on #418 (state), #419 (audit), and #420 (kill switch)
      without restating them
- [ ] 1.2 State the seven requirements as spec: named roles + per-subagent settings; Gateway-primary with
      controlled non-default direct-provider fallbacks; dedicated AI-settings permission for edits; draft →
      eval → activate → rollback, all audited; hard budgets/rate limits with audited emergency override; judge
      models configured separately; policy consumes kill-switch state and grants no new authority
- [ ] 1.3 Validate: `bunx @fission-ai/openspec@latest validate add-eve-model-policy-tracer --strict`

## 2. Record the provisional Eve design decision EVE-DESIGN-0006 (model policy)

- [ ] 2.1 Author the decision under provisional Eve design label EVE-DESIGN-0006 in this change's `design.md`, traceable from ADR-0019 (#418), EVE-DESIGN-0003 (#419), and
      EVE-DESIGN-0004 (#420)
- [ ] 2.2 At implementation time, promote the accepted decision into `docs/adr/` using the next available canonical number, then update all references.
- [ ] 2.3 Cross-link the resulting canonical ADR from the parent PRD and issue #421

## 3. Roles, routing, and the fallback path

- [ ] 3.1 Specify named roles (agent, review, judge, …) and per-subagent overrides; one platform policy in v1
      with schema room for later tenant overrides
- [ ] 3.2 Specify Vercel AI Gateway as the primary route and direct providers as controlled, non-default
      fallbacks eligible only when explicitly configured and eval-passed
- [ ] 3.3 Specify that any external partner GPU inference gateway is a proposed, non-default fallback —
      instantly revocable by policy edit or the #420 model-policy kill switch, never a hardcoded/default route,
      never activated by prompt/model/tool input

## 4. Permission, lifecycle, budgets, and audit

- [ ] 4.1 State that edits require a dedicated AI-settings permission, are made from Mission Control by a
      verified human, and are never selectable by prompt/model/tool input
- [ ] 4.2 State the draft → eval → activate → rollback lifecycle; activation blocked unless the eval gate passes;
      every draft/activation/rollback/override emits a #419 audit record
- [ ] 4.3 State hard budgets/rate limits per role/subagent/workflow/eval/judge with a permissioned, audited
      emergency override; and that judge/eval models are configured separately from agent models

## 5. Boundary and subordination

- [ ] 5.1 Draw the boundary: #418 owns state; #419 owns the audit record; #420 owns the model-policy kill
      switch; #433 owns the subagent catalog; #421 owns the model-policy capability those compose with
- [ ] 5.2 State that model policy consumes persisted #420 switch state, cannot be satisfied by a model/tool/
      memory claim, and never bypasses #417 protected-area/approval limits or #418 emergency-off precedence

## 6. Acceptance checks (HITL)

- [ ] 6.1 Maintainer review of the role model, the Gateway-primary/controlled-fallback rule, the permission
      model, and the no-new-authority boundary
- [ ] 6.2 Confirm the direct-provider fallback rule keeps any partner GPU gateway a proposed, non-default,
      eval-gated, instantly-revocable fallback (charter data-boundary / model-policy posture)
- [ ] 6.3 Confirm no Supabase schema, Mission Control UI, eval harness, or provider/runtime routing code is
      included in this change
- [ ] 6.4 Confirm the change is subordinate to #417/#418/#420, OpenSpec, `AGENTS.md`, `docs/ai/*`, and existing
      CI gates
- [ ] 6.5 Human sign-off before the change is opened as a PR against `Asymmetric-al/core:develop`
