# eve-engineering-health-monitors normative contract clauses

A section is binding only when the matching requirement unconditionally references
it. A proposed or historical section does not become accepted by residing here.
The reference, requirement identity, scenarios, and normal source-authority rules
form one contract. Preserve all clauses; see openspec/contracts/README.md.

<!-- prettier-ignore-start -->

<a id="contract-c7f4cd369ef51f2bf3bb"></a>

## Monitor Configuration And Scope Are App-Owned

<!-- BEGIN CONTRACT {"id":"c7f4cd369ef51f2bf3bb","name":"Monitor Configuration And Scope Are App-Owned"} -->

Every monitor MUST use persisted app-owned configuration containing a stable id/type, enabled and pause
state, schedule/event source, threshold/window, severity rules, repository scope, dedupe window, checkpoint,
owner, and policy version. Prompt, model, issue, PR, webhook, or tool content MUST NOT enable a monitor,
broaden its repository or tenant scope, alter policy, or choose a downstream destination. Verified service or
admin identity and ownership MUST come from #426. [VERIFIED-REPO: openspec/changes/add-eve-admin-auth-session-ownership]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-22bf56a6b529bf74471b"></a>

## Findings Use Safe Fresh Evidence And Stable Dedupe

<!-- BEGIN CONTRACT {"id":"22bf56a6b529bf74471b","name":"Findings Use Safe Fresh Evidence And Stable Dedupe"} -->

Each finding MUST include monitor/run identity, signal type, target identity, first/last observed timestamps,
severity, lifecycle status, stable dedupe key, policy version, safe evidence references, and a decision summary.
Collectors MUST validate source freshness and target revision and MUST reject malformed or stale evidence.
Repeat observations inside the dedupe policy MUST update the existing finding rather than create unbounded
duplicate work. Findings MUST NOT contain secrets, raw production records, donor/payment details, or hidden
reasoning. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-94c51ed8711c490952b9"></a>

## Every Approved Signal Has Minimum Evidence

<!-- BEGIN CONTRACT {"id":"94c51ed8711c490952b9","name":"Every Approved Signal Has Minimum Evidence"} -->

The six monitor types MUST collect only their required minimum evidence: CI identity/conclusion/target; stale-PR
last activity and configured threshold; eval suite/case/revision/status; dependency/security source/advisory/
severity/affected scope; protected-area PR/revision/matched policy; and budget/rate-limit scope/window/status.
Classification rules SHOULD be deterministic before any judge-backed evaluation, and safe source references
MUST remain available for review. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-93bd730500e0a4af715e"></a>

## Comments And Issues Reuse Governed GitHub Capabilities

<!-- BEGIN CONTRACT {"id":"93bd730500e0a4af715e","name":"Comments And Issues Reuse Governed GitHub Capabilities"} -->

Every monitor comment request MUST use the #430 GitHub read/review path, and every durable
issue/work-initiation request MUST use #431. The downstream capability MUST independently
enforce accountable bot identity, verified initiator/service identity, current policy, approvals, protected-
area rules, budgets, rate limits, and audit. #435 MUST NOT introduce a separate comment or issue mutation path.
[VERIFIED-REPO: openspec/changes/add-eve-github-read-review-path]
[VERIFIED-REPO: openspec/changes/add-eve-autonomous-pr-operator]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-ebc66b7f5abd40d5eecb"></a>

## Background Monitoring Is Budgeted, Pausable, Auditable, And Visible

<!-- BEGIN CONTRACT {"id":"ebc66b7f5abd40d5eecb","name":"Background Monitoring Is Budgeted, Pausable, Auditable, And Visible"} -->

Before every run and every downstream request, Eve MUST consult #418 release/emergency state and #420 relevant
pause/kill-switch state; release-off or emergency-off MUST suppress even an otherwise enabled monitor. Every
collection, classification, judge call, and downstream request MUST consume #423 budgets/rate limits and emit
#419 audit records for due/suppressed runs, evidence outcome, finding lifecycle, dedupe, policy decision, and
downstream result. #425 MUST remain the owner of schedule/runtime durability, while #424 owns retention and
redacted replay for persisted findings/audit metadata. #427 MUST be able to display safe monitor health,
last-run state, findings, failures, budget state, and pause state without raw hidden reasoning.
[VERIFIED-REPO: openspec/changes/add-eve-approval-budget-policy]
[VERIFIED-REPO: openspec/changes/add-eve-admin-workspace-shell]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->
