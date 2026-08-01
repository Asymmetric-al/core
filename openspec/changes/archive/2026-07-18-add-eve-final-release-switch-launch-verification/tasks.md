# Tasks: Eve Final Release Switch And Launch Verification

## 1. Readiness Manifest

- [x] 1.1 Define target identity, revision/config versions, freshness, evidence, reviewer, and result schema.
- [x] 1.2 Require a passing implementation/evidence entry for every issue #417 through #436.
- [x] 1.3 Reject missing, stale, mismatched, draft-only, open-work, or failing evidence.
- [x] 1.4 Make mandatory slice evidence/safety gates non-waivable; allow only non-blocking annotations.
- [x] 1.5 Keep manifest data redacted/access-controlled/auditable under #419 and retained/held/expired by #424.

## 2. Composition Verification

- [x] 2.1 Require target-bound proof of auth/service identity, ownership, and cross-user/tenant denial end to end.
- [x] 2.2 Require target-bound proof of audit/redaction, retention/replay, evals/model rollback, budgets, and approvals.
- [x] 2.3 Require target-bound proof of protected-area, sandbox, GitHub, production-write, and sensitive-file controls.
- [x] 2.4 Require target-bound proof that runtime/UI/GitHub/subagents/workflows/monitors/memory/notifications compose safely.
- [x] 2.5 Require proof that disabled mode blocks all trigger classes and suppression is observable.

## 3. Reversal And Operations

- [x] 3.1 Require exercised evidence for emergency-off, master/domain switches, active-run stop, and force-approval.
- [x] 3.2 Require exercised evidence for notification/provider pause, deployment rollback, model rollback, and data recovery paths.
- [x] 3.3 Verify operator permissions, exact runbook links, escalation owners, and secret-free instructions.

## 4. Human Activation Contract

- [x] 4.1 Bind the current passing manifest to the exact target and authorized human release decision.
- [x] 4.2 Recheck manifest freshness and #418/#420 state immediately before transition.
- [x] 4.3 Use only #418's existing persisted switch; emit #419 audit; grant no new action authority.
- [x] 4.4 Prove prompts, models, tools, services, CI, merge, and deploy cannot activate Eve.

## 5. Post-Activation Verification

- [x] 5.1 Define the bounded canary window and non-destructive checks.
- [x] 5.2 Require confirmation of state visibility, trigger gates, audit, budgets, notifications, and safe canaries.
- [x] 5.3 Route critical failures and watchdog expiry through existing emergency/kill/rollback controls and close the launch record.

## 6. Scope Check For This PR

- [x] 6.1 Keep #418 the sole owner of release-switch and emergency-state semantics/persistence.
- [x] 6.2 Do not configure a target, deploy an environment, activate, or run a real launch in this implementation slice.
- [x] 6.3 Confirm migration grants no permission and leaves the switch disabled after this PR.
