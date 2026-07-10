## 1. Define the Eve autonomy OpenSpec contract

- [ ] 1.1 Add the `eve-autonomous-operations` capability spec via this change's spec delta
      (`specs/eve-autonomous-operations/spec.md`)
- [ ] 1.2 Capture layered source-of-truth, spec-first product path, identity/accountability,
      protected-area + production-write limits, governance data model, and model policy as requirements
- [ ] 1.3 Validate: `bunx @fission-ai/openspec@latest validate add-eve-autonomous-operations-foundation --strict`

## 2. Record the initial autonomy ADR

- [ ] 2.1 Author ADR-0001 (autonomy model, auto-merge policy, production-write policy, guardrails) —
      drafted in this change's `design.md`
- [ ] 2.2 Land the ADR at the repo's chosen ADR location (confirm convention with maintainers)
- [ ] 2.3 Cross-link the ADR from the parent PRD and issue #417

## 3. Document rollout & verification contract

- [ ] 3.1 Record the governance-first 8-phase rollout order (maps to #417–#437)
- [ ] 3.2 Record the feature-flag posture (release switch off by default)
- [ ] 3.3 Record the verification contract (OpenSpec validate + existing CI gates + Next.js
      compatibility caveat + read installed Eve docs before runtime coding)

## 4. Governance data model at spec level (hand-off to #418)

- [ ] 4.1 Enumerate governance records at spec level: release/kill-switch state, audit, approvals,
      model policy, budgets, notifications, run summaries, shared-run context, private admin memory,
      retention state
- [ ] 4.2 State retention default (180 days, category-based) and incident/legal-hold override
- [ ] 4.3 Confirm governance persistence is app-owned; Eve session/workflow durability stays
      runtime-owned

## 5. Acceptance checks (HITL)

- [ ] 5.1 Maintainer review of the autonomy model and protected-area set
- [ ] 5.2 Confirm no runtime code, schema, UI, or automation is included in this change
- [ ] 5.3 Confirm the change is subordinate to OpenSpec, `AGENTS.md`, `docs/ai/*`, and existing CI gates
- [ ] 5.4 Human sign-off before the change is opened as a PR against `Asymmetric-al/core:develop`
