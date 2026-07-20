## 1. Define the approval/budget contract

- [x] 1.1 Add the `eve-approval-budget-policy` capability without restating #418–#421.
- [x] 1.2 Specify separate zones, write classes, hard limits, bounded override, app-owned state, audit, and no-new-authority behavior.
- [x] 1.3 Pass strict OpenSpec validation.

## 2. Record the accepted decision

- [x] 2.1 Promote the provisional decision to canonical ADR-0024.
- [x] 2.2 Cross-link ADR-0024 from the PRD and implementation plan.

## 3. Implement trust-zone and write classification

- [x] 3.1 Persist separate engineering, product/admin, and memory rules.
- [x] 3.2 Resolve zone, write class, governance domain, budget scope, and cost from an app-owned action catalog.
- [x] 3.3 Default unknown actions to strict business-data denial.
- [x] 3.4 Keep the only effect a non-business stable-key tracer artifact.

## 4. Implement approvals and budgets

- [x] 4.1 Add target-bound, expiring, single-use zone and strict approvals.
- [x] 4.2 Require dedicated approval-decision permission.
- [x] 4.3 Lock and reserve deterministic hard-budget windows atomically.
- [x] 4.4 Add permissioned, reasoned, bounded, expiring emergency overrides.

## 5. Compose governance and audit

- [x] 5.1 Consume release, emergency, all-automation, production-write, force-approval, and ready-policy state.
- [x] 5.2 Persist every consult result and matching ADR-0020 audit event in the effect transaction.
- [x] 5.3 Give the most restrictive state precedence and expose no browser table/RPC access.

## 6. Admin tracer

- [x] 6.1 Show separate policies, fixed actions, budgets, approvals, and decisions in Mission Control.
- [x] 6.2 Allow deliberate approval decisions and bounded override requests through authenticated server routes.

## 7. Verification and review

- [x] 7.1 Unit-test cross-zone isolation, strict business approval, unknown denial, budget pause, override, governance precedence, validation, and identity binding.
- [x] 7.2 Apply the complete migration chain and prove allow/deny/pause/override, single-use approvals, audit rollback, and browser denial against Postgres.
- [x] 7.3 Pass lint, type checks, full unit tests, all app builds, and 41/41 strict OpenSpec validation.
- [x] 7.4 Open a non-draft PR for human review without merging it.
