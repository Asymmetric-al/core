# eve-final-release-switch-launch-verification normative contract clauses

A section is binding only when the matching requirement unconditionally references
it. A proposed or historical section does not become accepted by residing here.
The reference, requirement identity, scenarios, and normal source-authority rules
form one contract. Preserve all clauses; see openspec/contracts/README.md.

<!-- prettier-ignore-start -->

<a id="contract-d241976e819e0b2e0753"></a>

## Operators Have Versioned Launch, Emergency, And Recovery Runbooks

<!-- BEGIN CONTRACT {"id":"d241976e819e0b2e0753","name":"Operators Have Versioned Launch, Emergency, And Recovery Runbooks"} -->

The manifest MUST reference accessible versioned runbooks for readiness review, activation, state inspection,
approvals, budgets, kill switches, emergency-off, active-run termination, rollback, notification pause,
retention/incident hold, audit/replay access, provider/credential disable, and escalation ownership. Links and
required permissions MUST be verified and the procedures MUST be exercised by authorized operators before
readiness passes. Runbooks MUST NOT expose secrets. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

#419 MUST own audit/redaction for launch decisions, while #424 MUST own retention, hold, and expiry for launch
manifests and evidence metadata. Retention state or an incident hold MUST NOT override a not-ready result.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-deae5b3772f3a1b4a63f"></a>

## Dry Run, Emergency Controls, And Rollback Must Be Proven Before Launch

<!-- BEGIN CONTRACT {"id":"deae5b3772f3a1b4a63f","name":"Dry Run, Emergency Controls, And Rollback Must Be Proven Before Launch"} -->

Operators MUST complete the checklist while #418 remains disabled and MUST exercise or prove, using safe
environment-appropriate methods, emergency-off, master/domain kill switches, active-run termination,
force-approval, notification pause, provider/credential disable, deployment rollback, model-policy rollback,
and data/schema rollback or forward-recovery. Any failed, destructive-only, undocumented, or inaccessible
reversal path MUST block readiness. [VERIFIED-REPO: openspec/changes/add-eve-kill-switch-control-path]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-031a3df088a9e087579d"></a>

## End-To-End Evidence Proves Safety And System Composition

<!-- BEGIN CONTRACT {"id":"031a3df088a9e087579d","name":"End-To-End Evidence Proves Safety And System Composition"} -->

Before readiness can pass, environment-appropriate end-to-end evidence MUST prove: auth/service identity and
session ownership; cross-user/tenant denial; audit/redaction and retention/replay access; deterministic/judge
eval gates and model rollback; budgets/rate limits; protected-area, sensitive-file, sandbox, GitHub, and
production-write policy; release-off suppression; emergency-off and all relevant kill switches; active-run
stop and rollback; runtime/UI/GitHub/subagents/shared-context/dynamic-workflow/monitor/memory behavior;
platform-owner email and safe Discord policy; deployment compatibility; observability; and operator access to
current controls. Isolated unit tests alone MUST NOT satisfy required cross-capability checks.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-a66a83789cfed296464a"></a>

## Launch Readiness Is Bound To An Exact Environment And Revision

<!-- BEGIN CONTRACT {"id":"a66a83789cfed296464a","name":"Launch Readiness Is Bound To An Exact Environment And Revision"} -->

Eve MUST represent launch readiness as a versioned manifest containing stable launch id, environment,
repository/application revision, deployment ids, schema/migration version, applicable policy/model/eval
configuration versions, generated time, expiry/freshness window, evidence entries, reviewers, overall result,
and immutable #419 audit reference. Evidence MUST be safe references/redacted summaries and MUST NOT contain
credentials or unsafe raw data. Evidence from a different target or expired window MUST NOT satisfy the gate
without a deterministic compatibility rule. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-9266ffa025ed09168cb4"></a>

## Every Prior Eve Slice Has Passing Implementation Evidence

<!-- BEGIN CONTRACT {"id":"9266ffa025ed09168cb4","name":"Every Prior Eve Slice Has Passing Implementation Evidence"} -->

The manifest MUST contain a required readiness entry for each issue #417 through #436. Each entry MUST identify
the implemented capability/revision, acceptance and operational evidence, relevant runbook, responsible
reviewer, and pass/fail result. Mandatory slice evidence and safety gates MUST NOT be waived. A merged
proposal, draft OpenSpec, unchecked task list, open implementation work, missing/stale/mismatched entry, or
failing evidence MUST produce not-ready and MUST keep #418 disabled. Non-blocking observations MAY be
documented but MUST NOT change a required failing result to ready.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-665a30f21d18a683fee9"></a>

## Activation Uses Only The Existing #418 Human-Controlled Transition

<!-- BEGIN CONTRACT {"id":"665a30f21d18a683fee9","name":"Activation Uses Only The Existing #418 Human-Controlled Transition"} -->

The system MUST permit only a verified human with dedicated release permission to enable Eve, and MUST use
only #418's existing activation path after binding a current passing manifest, recording justification, and immediately rechecking
manifest freshness plus #418 emergency and #420 relevant kill-switch state. Prompts, models, tools, service
identities, CI, merges, deployments, schedules, or ready results MUST NOT enable the switch. #437 MUST NOT
define a second switch or change #418 persistence/semantics. [VERIFIED-REPO: openspec/changes/add-eve-governance-kernel-release-switch]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-c3f34342d252487e9442"></a>

## Post-Activation Verification Is Bounded And Fail-Safe

<!-- BEGIN CONTRACT {"id":"c3f34342d252487e9442","name":"Post-Activation Verification Is Bounded And Fail-Safe"} -->

After human activation, a bounded verification window MUST confirm visible switch/control state, trigger
gating, audit, budgets, notification safety, and selected non-destructive canary behavior. A critical failure
MUST use the existing authorized emergency/kill/rollback path and MUST be audited; it MUST NOT trigger an
authority-expanding automatic recovery. Successful completion MUST close the launch record with the exact
target and evidence. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->
