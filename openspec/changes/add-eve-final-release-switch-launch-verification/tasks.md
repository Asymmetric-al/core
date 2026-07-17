# Tasks: Eve Final Release Switch And Launch Verification

## 1. Readiness Manifest

- [ ] 1.1 Define target identity, revision/config versions, freshness, evidence, reviewer, and result schema.
- [ ] 1.2 Require a passing implementation/evidence entry for every issue #417 through #436.
- [ ] 1.3 Reject missing, stale, mismatched, draft-only, open-work, or failing evidence.
- [ ] 1.4 Make mandatory slice evidence/safety gates non-waivable; allow only non-blocking annotations.
- [ ] 1.5 Keep manifest data redacted/access-controlled/auditable under #419 and retained/held/expired by #424.

## 2. Composition Verification

- [ ] 2.1 Prove auth/service identity, ownership, and cross-user/tenant denial end to end.
- [ ] 2.2 Prove audit/redaction, retention/replay, evals/model rollback, budgets, and approvals.
- [ ] 2.3 Prove protected-area, sandbox, GitHub, production-write, and sensitive-file controls.
- [ ] 2.4 Prove runtime/UI/GitHub/subagents/workflows/monitors/memory/notifications compose safely.
- [ ] 2.5 Prove disabled mode blocks all trigger classes and suppression is observable.

## 3. Reversal And Operations

- [ ] 3.1 Exercise emergency-off, master/domain switches, active-run stop, and force-approval.
- [ ] 3.2 Exercise notification/provider pause, deployment rollback, model rollback, and data recovery paths.
- [ ] 3.3 Verify operator permissions, runbook links, escalation owners, and secret-free instructions.

## 4. Human Activation Contract

- [ ] 4.1 Bind the current passing manifest to the exact target and authorized human release decision.
- [ ] 4.2 Recheck manifest freshness and #418/#420 state immediately before transition.
- [ ] 4.3 Use only #418's existing transition; emit #419 audit; grant no new action authority.
- [ ] 4.4 Prove prompts, models, tools, services, CI, merge, and deploy cannot activate Eve.

## 5. Post-Activation Verification

- [ ] 5.1 Define the bounded canary window and non-destructive checks.
- [ ] 5.2 Confirm state visibility, trigger gates, audit, budgets, notifications, and safe canaries.
- [ ] 5.3 Route critical failures through existing emergency/kill/rollback controls and close the launch record.

## 6. Scope Check For This PR

- [ ] 6.1 Keep #418 the sole owner of release-switch and emergency-state semantics/persistence.
- [ ] 6.2 Do not configure, deploy, migrate, activate, or run a real launch in this specification slice.
- [ ] 6.3 Confirm the switch remains disabled after this PR.
