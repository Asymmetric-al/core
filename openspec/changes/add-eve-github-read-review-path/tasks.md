<!-- Partner DRAFT for GitHub issue #430. Task list for the `add-eve-github-read-review-path` OpenSpec
change; enters `Asymmetric-al/core` only via Asymmetric's OpenSpec workflow after sign-off. Acceptance and
scope grounded in [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md] and
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]. -->

## 1. Define the github-read-review-path OpenSpec contract

- [ ] 1.1 Add the `eve-github-read-review-path` capability via this change's spec delta
      (`specs/eve-github-read-review-path/spec.md`), building on #419 (audit), #423 (approval/budget), #425
      (runtime foundation), and #429 (sandbox) without restating them
- [ ] 1.2 State the seven requirements as spec: accountable bot identity; PR-triggered review with summary plus
      inline findings and no mutating PR operations; policy-gated comments; audit in the #419 record shape;
      protected-area detection visible in review output; decision summary with no sensitive data on GitHub;
      subordination and no new authority
- [ ] 1.3 Validate: `bunx @fission-ai/openspec@latest validate add-eve-github-read-review-path --strict`

## 2. Record ADR-0012 (GitHub read and review path)

- [ ] 2.1 Author ADR-0012 in this change's `design.md`, traceable from ADR-0003 (#419), ADR-0005 (#423),
      ADR-0007 (#425), and ADR-0011 (#429)
- [ ] 2.2 Land the ADR at the repo's chosen ADR location (confirm convention with maintainers, same as ADR-0001)
- [ ] 2.3 Cross-link ADR-0012 from the parent PRD and issue #430

## 3. Accountable bot identity and read-and-review scope

- [ ] 3.1 Specify that every GitHub review action executes through the bot identity and records the accountable
      admin, GitHub sender, schedule, or system trigger
- [ ] 3.2 Specify that on a GitHub PR trigger Eve reviews the PR and posts a summary plus inline findings, and
      that this path performs no mutating PR operation (no label, CI rerun, push, issue/branch/PR creation,
      PR-state change, or merge) — those remain #431 (slice 15) and #432 (slice 16)

## 4. Policy-gating, audit, and protected-area visibility

- [ ] 4.1 Specify that every posted comment/finding is gated by #423's approval/budget policy and that model
      spend to produce the review stays under #423's budgets
- [ ] 4.2 Specify that every review action emits an audit record in #419's shape (who/what initiated, tool/subagent,
      model role, policy applied, evidence used, what changed)
- [ ] 4.3 Specify that protected-area detection (against #417's set) is visible in the review output and that the
      review is a decision summary carrying no PII/payments/secrets/unredacted logs onto GitHub

## 5. Boundary and subordination

- [ ] 5.1 Draw the boundary: #419 owns the audit shape; #423 owns approval/budget; #425 owns the runtime; #429
      owns the sandbox; #421 owns model policy; #431 owns mutating PR operations; #432 owns strict auto-merge;
      #430 owns the read-and-review path those compose in
- [ ] 5.2 State that the path resolves models through #421 via the #425 runtime inside the #429 sandbox checkout,
      spends under #423 budgets, honors #420's `disable GitHub actions` switch, does not bypass GitHub branch
      protection/required reviews, stays disabled by default while the release switch is off, and never bypasses
      #417 protected-area/approval limits or #418 emergency-off precedence

## 6. Acceptance checks (AFK)

- [ ] 6.1 Maintainer review of the accountability metadata, the policy-gating of comments, the audit-in-#419-shape
      emission, and the visibility of protected-area detection in review output
- [ ] 6.2 Confirm the review resolves models only through #421 via #425 so any partner GPU gateway stays a
      proposed, non-default, revocable fallback, and that no donor PII/payments/secrets are posted to GitHub or
      enter this path (charter data-boundary law)
- [ ] 6.3 Confirm no GitHub App code, webhook/trigger handler, review-comment poster, protected-area detector,
      mutating PR operation, or Supabase schema is included in this change
- [ ] 6.4 Confirm the change is subordinate to #419/#423/#425/#429, OpenSpec, `AGENTS.md`, `docs/ai/*`, GitHub
      branch protection, and existing CI gates, and that the release switch stays off
- [ ] 6.5 Human sign-off before the change is opened as a PR against `Asymmetric-al/core:develop`
