<!-- Partner DRAFT for GitHub issue #431. Task list for the `add-eve-autonomous-pr-operator` OpenSpec
change; enters `Asymmetric-al/core` only via Asymmetric's OpenSpec workflow after sign-off. Acceptance and
scope grounded in [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md] and
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]. -->

## 1. Define the autonomous-pr-operator OpenSpec contract

- [ ] 1.1 Add the `eve-autonomous-pr-operator` capability via this change's spec delta
      (`specs/eve-autonomous-pr-operator/spec.md`), building on #423 (approval/budget), #429 (sandbox), and #430
      (read-and-review / accountable bot identity) without restating them
- [ ] 1.2 State the six requirements as spec: issue-first work initiation; mutating PR operations under policy
      with no merge; engineering autonomy with business-data writes blocked; spec-first product direction; every
      operation with policy, audit, and accountable initiator; subordination and no new authority
- [ ] 1.3 Validate: `bunx @fission-ai/openspec@latest validate add-eve-autonomous-pr-operator --strict`

## 2. Record the provisional Eve design decision EVE-DESIGN-0013 (autonomous PR operator and work initiation)

- [ ] 2.1 Author the decision under provisional Eve design label EVE-DESIGN-0013 in this change's `design.md`, traceable from EVE-DESIGN-0005 (#423), EVE-DESIGN-0011 (#429), and
      EVE-DESIGN-0012 (#430)
- [ ] 2.2 At implementation time, promote the accepted decision into `docs/adr/` using the next available canonical number, then update all references.
- [ ] 2.3 Cross-link the resulting canonical ADR from the parent PRD and issue #431

## 3. Issue-first work initiation and mutating PR operations

- [ ] 3.1 Specify that Eve-initiated work follows an issue-first flow (work Eve discovers becomes an issue, then
      a branch, then a PR) and never a silent push, with the initiating trigger recorded
- [ ] 3.2 Specify the mutating PR operations under policy — label, rerun CI, push safe fixes, update PR state,
      create issues, create branches, open PRs — and that this path performs no merge and does not bypass GitHub
      branch protection or required reviews (auto-merge remains #432)

## 4. Engineering-only autonomy, spec-first, policy/audit/accountability

- [ ] 4.1 Specify that engineering autonomy is allowed (operational production records under policy — tasks,
      notes, labels, internal statuses, workflow metadata, memory, model settings, review artifacts) while broad
      customer/donor/payment/identity/tenant-ownership/auth/secret/migration/destructive-production/deployment
      writes stay blocked without stricter approval
- [ ] 4.2 Specify that Eve-invented product features require a spec-first PR path and update OpenSpec before
      implementation proceeds
- [ ] 4.3 Specify that every GitHub operation executes through #430's accountable bot identity, is gated by
      #423's approval/budget policy, and emits an audit record in #419's shape (who/what initiated, tool/subagent,
      model role, policy applied, evidence used, what changed)

## 5. Boundary and subordination

- [ ] 5.1 Draw the boundary: #430 owns read-and-review and the accountable bot identity; #423 owns
      approval/budget; #419 owns the audit shape; #421 owns model policy; #425 owns the runtime; #429 owns the
      sandbox; #432 owns strict auto-merge; #431 owns the mutating PR operations and work initiation those
      compose in
- [ ] 5.2 State that the path resolves models through #421 via the #425 runtime inside the #429 sandbox checkout,
      spends under #423 budgets, honors #420's `disable GitHub actions` switch, does not bypass GitHub branch
      protection/required reviews, stays disabled by default while the release switch is off, and never bypasses
      #417 protected-area/approval limits or #418 emergency-off precedence

## 6. Acceptance checks (AFK)

- [ ] 6.1 Maintainer review that Eve-initiated work follows the issue-first flow, that the mutating PR operations
      are policy-gated and audited with an accountable initiator, and that no merge is performed
- [ ] 6.2 Confirm engineering autonomy is allowed while business-data writes stay blocked, and that
      product-direction changes go spec-first (OpenSpec updated before implementation proceeds)
- [ ] 6.3 Confirm the operator resolves models only through #421 via #425 so any partner GPU gateway stays a
      proposed, non-default, revocable fallback, and that no donor PII/payments/secrets are written to GitHub or
      enter this path (charter data-boundary law)
- [ ] 6.4 Confirm no GitHub App code, work-initiation/issue-opener, branch/PR creator, label/CI-rerun caller,
      safe-fix pusher, business-data guard, or Supabase schema is included in this change
- [ ] 6.5 Confirm the change is subordinate to #423/#429/#430, OpenSpec, `AGENTS.md`, `docs/ai/*`, GitHub branch
      protection, and existing CI gates, and that the release switch stays off
- [ ] 6.6 Human sign-off before the change is opened as a PR against `Asymmetric-al/core:develop`
