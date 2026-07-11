<!-- Partner DRAFT for GitHub issue #427. Task list for the `add-eve-admin-workspace-shell` OpenSpec change;
enters `Asymmetric-al/core` only via Asymmetric's OpenSpec workflow after sign-off. Acceptance and scope
grounded in [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md] and
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]. -->

## 1. Define the admin-workspace-shell OpenSpec contract

- [ ] 1.1 Add the `eve-admin-workspace-shell` capability via this change's spec delta
      (`specs/eve-admin-workspace-shell/spec.md`), rendering the governance state owned by #418–#424 without
      restating their contracts
- [ ] 1.2 State the seven requirements as spec: operations-first shell; real-governance-state backing;
      decision-summaries-not-raw-reasoning; role-gated controls; surfaces-and-triggers-not-redefines;
      no-sensitive-data-in-the-shell; and no new authority / spec-only
- [ ] 1.3 Validate: `bunx @fission-ai/openspec@latest validate add-eve-admin-workspace-shell --strict`

## 2. Record ADR-0009 (admin workspace operations shell)

- [ ] 2.1 Author ADR-0009 in this change's `design.md`, traceable from ADR-0002 (#418), ADR-0003 (#419),
      ADR-0004 (#420), ADR-0006 (#421), #422 (admin memory), ADR-0005 (#423), and #424 (retention/replay)
- [ ] 2.2 Land the ADR at the repo's chosen ADR location (confirm convention with maintainers, same as ADR-0001)
- [ ] 2.3 Cross-link ADR-0009 from the parent PRD and issue #427

## 3. Operations-first panel set and real-state backing

- [ ] 3.1 Specify that the first screen prioritizes active run summaries, approvals, recent actions, budgets,
      failures, GitHub activity placeholders, eval health, memory, model policy, subagents, notifications,
      audit, and emergency controls, with chat available but not primary
- [ ] 3.2 Specify that every panel is backed by real governance state from #418–#424 (GitHub activity an
      explicit placeholder until the GitHub path lands), not mock data

## 4. Decision summaries, role-gating, and data boundary

- [ ] 4.1 Specify that the UI exposes decision summaries (action, evidence, alternatives, risk, policies,
      approvals, reversal/follow-up path), never raw hidden reasoning or sensitive internals
- [ ] 4.2 Specify that admin controls are role-gated (model-policy editing behind the dedicated AI settings
      permission; kill switches, budget overrides, and memory management gated to authorized admins)
- [ ] 4.3 Specify that the shell surfaces governance state and decision summaries only and must not surface
      donor details, payment data, raw records, table rows, secrets, or sensitive form values

## 5. Boundary and subordination

- [ ] 5.1 Draw the boundary: #418 owns the governance state store; #419 the audit record; #420 kill switches;
      #421 model policy; #422 memory content; #423 approval/budget; #424 retention/replay; #426 the auth gate;
      #428 the admin mount; #427 owns the operations-first shell that renders and controls them
- [ ] 5.2 State that the shell surfaces and triggers those policies without redefining their semantics, adds no
      live UI code / governance schema / Supabase schema, defers the admin-visible mount to #428 behind #426
      auth, grants no new authority, and keeps the release switch off until verified

## 6. Acceptance checks (AFK)

- [ ] 6.1 Maintainer review of the operations-first panel set, real-state backing, decision-summary rule,
      role-gating, surfaces-not-redefines boundary, and no-sensitive-data posture
- [ ] 6.2 Confirm no panel is backed by mock data and that GitHub activity is an explicit placeholder — the
      real-governance-state acceptance
- [ ] 6.3 Confirm the shell exposes decision summaries not raw reasoning, and surfaces no donor details, payment
      data, raw records, table rows, secrets, or sensitive form values — the charter data boundary
- [ ] 6.4 Confirm no live workspace UI, data fetchers, governance schema, or Supabase schema is included, and
      that the governance store (#418), audit record (#419), kill switches (#420), model policy (#421), memory
      content (#422), approval/budget (#423), and retention/replay (#424) are not redefined here
- [ ] 6.5 Confirm the change is subordinate to #417/#418, OpenSpec, `AGENTS.md`, `docs/ai/*`, and existing CI
      gates, defers the admin mount to #428 behind #426 auth, and keeps the release switch off until verified
- [ ] 6.6 Human sign-off before the change is opened as a PR against `Asymmetric-al/core:develop`
