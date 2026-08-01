# Tasks: Eve Dynamic Workflow Orchestration

## 1. Plan Contract

- [x] 1.1 Define the versioned typed plan schema and supported operation registry.
- [x] 1.2 Validate graph integrity, specialist registration, input/output schemas, bounded retries, and scope.
- [x] 1.3 Reject generated code or unsupported operations before execution.

## 2. Governance Composition

- [x] 2.1 Check #418 release/emergency and #420 relevant switch state before every step, retry, delegation, and resume.
- [x] 2.2 Consult full #417/#421/#423/#426 action policy before each consequential effect.
- [x] 2.3 Prove a workflow grants no authority beyond its underlying actions.
- [x] 2.4 Re-evaluate changed policy, budget, approval, and kill-switch state during a run.

## 3. Subagents And Context

- [x] 3.1 Resolve only registered #433 specialists.
- [x] 3.2 Enforce workflow-specific count/depth caps across nested delegation.
- [x] 3.3 Use #433 shared context without bypassing validation, provenance, evidence, or conflicts.

## 4. Failure And Audit

- [x] 4.1 Implement deterministic app-owned failure classification.
- [x] 4.2 Stop locally for bounded low-risk failures and pause the run for high-risk behavior.
- [x] 4.3 Route critical/systemic responses through existing #420 authorized controls.
- [x] 4.4 Emit #419 audit records for the full plan and step lifecycle.

## 5. Verification

- [x] 5.1 Test allowed orchestration and malformed/out-of-scope plan rejection.
- [x] 5.2 Test cap enforcement, budget/rate-limit exhaustion, bounded retries, and kill-switch changes.
- [x] 5.3 Test protected-area, suspicious, secret, cross-user, and cross-tenant pause behavior.
- [x] 5.4 Test failure-risk precedence, audited cancellation, and authorized resume.
- [x] 5.5 Keep the release switch off; perform no runtime or production activation in this slice.

## 6. Scope Check

- [x] 6.1 Confirm #425 still owns workflow durability/hosting and #433 owns specialists/shared context.
- [x] 6.2 Confirm #424 still owns retention/replay and canonical product/Inngest workflow orchestration is unchanged.
- [x] 6.3 Confirm schedules, notifications, and final launch remain #435, #436, and #437 scope.
