# Design: Eve Engineering Health Monitors

## Context

#435 establishes the first active monitor set after governance, budgets, the Mission Control workspace,
GitHub review, and specialist contracts are available. Monitors turn periodic or event-driven observations
into normalized findings. They do not own the downstream GitHub mutation and do not gain authority from the
fact that they run in the background.

## Decisions

### 1. V1 has exactly six active signal types

The allowlist is:

1. CI failures
2. Stale pull requests
3. Failing evals
4. Dependency or security alerts
5. Protected-area pull requests
6. Budget or rate-limit issues

Every other type, especially product-opportunity scanning, remains disabled until a separately reviewed
change explicitly adds it. Unknown monitor types fail closed.

### 2. Monitor configuration is app-owned

Each monitor has a stable id/type, enabled state, schedule or event source, threshold/window, severity rules,
repository scope, destination policy, dedupe window, cursor/checkpoint, owner, and policy version. Prompt,
model, issue, PR, or external payload content cannot enable a monitor, change its scope, or choose recipients.

### 3. Collection is read-oriented and evidence-bounded

Collectors normalize only the data needed to identify the signal, its target, timestamps, safe evidence
references, and source freshness. They reject stale, malformed, cross-repository, and untrusted scope. Secret,
donor, payment, raw production, and unrelated tenant content is not copied into findings.

### 4. Findings are deterministic operational records

A finding carries monitor/run ids, signal type, target identity, first/last observed timestamps, severity,
status, dedupe key, policy version, safe evidence references, and decision summary. Re-observation updates the
existing finding under the dedupe policy rather than causing unbounded duplicate actions. Resolution and
reopen transitions are explicit and audited.

### 5. Downstream actions reuse existing owners

A monitor may request:

- a governed GitHub comment through #430 when the target is an existing PR and policy permits it; or
- a governed issue/work-initiation operation through #431 when policy requires a durable issue.

#435 owns detection, classification, dedupe, and the request. It does not implement another comment/issue
client. The accountable bot actor, verified initiator/service identity, approval, budget, and audit rules of
the downstream capability continue to apply.

### 6. Background execution remains governable

Before every run and every downstream request, Eve checks #418 release/emergency state and #420 relevant
pause/kill-switch state, then consumes #423 budget/rate limits. Release-off or emergency-off suppresses even
an otherwise enabled monitor. Protected-area findings cannot authorize protected changes. Exhausted budgets
stop collection or downstream work as policy requires. Mission Control (#427) exposes monitor health, last
run, findings, failures, budget state, and pause state without exposing hidden reasoning.

### 7. Existing owners retain runtime and record lifecycle

#425 owns schedule/runtime durability; #435 owns monitor definitions, collection rules, and findings rather
than a new scheduler. #424 owns retention and redacted replay for persisted findings and audit metadata. #431
is a composed downstream owner only when policy chooses new issue creation, not a required blocker for a
comment-only monitor outcome.

## Per-Signal Minimum Evidence

- **CI failure:** repository, workflow/check identity, commit/PR, conclusion, completed time, safe log link.
- **Stale PR:** repository, PR, last qualifying activity, configured age threshold, draft/blocked state.
- **Failing eval:** suite/case, revision, deterministic/judge status, failure summary, evidence reference.
- **Dependency/security alert:** source, package/advisory identity, severity, affected scope, safe advisory link.
- **Protected-area PR:** PR/head revision, matched protected rule/path class, policy version, review state.
- **Budget/rate-limit issue:** budget scope, threshold or exhaustion status, window, safe aggregate usage.

## State Flow

1. An enabled app-owned monitor is due or receives an allowed event.
2. Current #418 release/emergency, #420 pause, identity, and budget state are checked.
3. The collector reads and normalizes allowed evidence.
4. Deterministic rules classify, dedupe, open/update/resolve the finding.
5. Release/emergency and relevant switch state are rechecked before policy decides whether a #430 comment or
   optional #431 issue request is permitted.
6. Detection and any downstream outcome are audited; #427 shows safe status.

## Alternatives Rejected

- **Let the model discover arbitrary opportunities:** violates the explicitly limited first monitor set.
- **Post directly from each collector:** duplicates #430/#431 governance and identity paths.
- **Create a new issue for every observation:** produces noise and ignores dedupe/lifecycle state.
- **Treat protected-area detection as approval:** a signal is evidence, never authorization.

## Risks and Mitigations

- **Alert storms:** stable dedupe keys, cooldowns, lifecycle updates, hard budgets.
- **Stale evidence:** source timestamps, revision identity, freshness windows.
- **Overcollection:** per-signal evidence allowlists and redacted safe summaries.
- **Background scope drift:** fixed type allowlist and persisted app-owned config.
- **Mutation bypass:** all comments/issues route through #430/#431.

## Rollout

This package defines the contract only. Implementation remains disabled behind governance until focused
monitor tests, notification safety (#436), and final launch verification (#437) pass.
