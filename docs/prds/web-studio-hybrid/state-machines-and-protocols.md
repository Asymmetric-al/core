Planning contract reconciled on 2026-09-22. Read [package authority and checkpoints](README.md) and [owner amendments](adoption-map.md). Source-era evidence is dated; runtime qualification remains open.

<a id="web-states-protocols"></a>

# State machines and detailed integration protocols

These are proposed external behavior names, not claims about existing enum/table names. Map to the owner’s existing states without losing distinctions. Authoritative transitions require current scoped authorization, expected revision/generation and a semantic idempotency key. Current status may be a projection over immutable lifecycle facts; do not rewrite provenance merely to update a badge.

<a id="web-h-connection-state"></a>

## Connection state

| From                   | Event/command                                                              | To                       | Required effect                                                                   |
| ---------------------- | -------------------------------------------------------------------------- | ------------------------ | --------------------------------------------------------------------------------- |
| No binding             | Begin verified connection ceremony                                         | verification-pending     | One-time state ties initiating subject/session to requested Site/project          |
| verification-pending   | Verified provider consent and current Asym grant                           | active                   | Atomic selected repository/project binding and initial epoch                      |
| verification-pending   | Expiry/denial/replay                                                       | expired/rejected         | No active binding; no speculative repository enumeration                          |
| active                 | Validated rename                                                           | active                   | Display labels only; durable identity unchanged                                   |
| active                 | Verified ownership change, App removal or material authorization ambiguity | suspended                | Increment fence; stop new dependent source work; initiate exact re-verification   |
| active/suspended       | Authorized Disconnect                                                      | disconnected             | Increment fence; prevent new intake; no cascade to CMS or retained safe artifacts |
| suspended/disconnected | New completed verification and explicit connection action                  | active under a new epoch | Reprove both domains; historical epochs remain inert                              |
| any                    | Older provider event                                                       | unchanged                | Record no-op where required; never reactivate from delivery order                 |

A temporary API timeout affects health, not legal ownership or lifecycle by itself. A recorded disconnection may complete even if provider token revocation outcome is unknown: product ingress/operations immediately deny the old epoch, while the provider cleanup is reconciled separately. Do not label provider revocation confirmed until observed.

<a id="web-h-source-capture-and-build"></a>

## Source capture and build

A **source request** is stable across transport retries. A **capture** identifies immutable bytes. A **build attempt** identifies one execution; multiple attempts can belong to the same request without creating multiple admissions.

| From             | Allowed next                                                              | Prohibited interpretation                                                                   |
| ---------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| requested        | capturing, rejected, canceled                                             | Accepted request does not mean source was fetched                                           |
| capturing        | captured, failed, cancel-requested, outcome-unknown                       | Failure must not be disguised as an empty archive                                           |
| captured         | build-queued                                                              | Source identity is immutable; later branch moves do not alter it                            |
| build-queued     | running, canceled, rejected                                               | Queue concurrency is not authorization                                                      |
| running          | build-succeeded, build-failed, cancel-requested, outcome-unknown          | A green local test is not independent admission                                             |
| cancel-requested | canceled, build-succeeded-with-cancel-receipt, outcome-unknown            | Cancellation cannot erase a finished execution; late result cannot bypass the request fence |
| outcome-unknown  | Reconciled existing terminal/nonterminal state                            | No blind new attempt before prior external outcome is resolved                              |
| terminal attempt | New explicit eligible attempt under existing request or successor request | Do not mutate old result/provenance to look like a first success                            |

A canceled or revoked request cannot commit a favorable new admission. Already admitted artifacts are governed by their admission/withdrawal owner, not retroactively destroyed by a source-job cancellation. Worker claims include generation and expiry; only the current claimant can finalize. Define deterministic code failure separately from transient infrastructure failure so a broken source revision does not run repeatedly until its budget disappears.

<a id="web-h-qualification-and-admission"></a>

## Qualification and admission

Evidence preparation can be pending, failed or complete. The qualification owner appends a verdict tied to exact artifact, source, profile and policy. Verdicts are not editable by source authors. Admitted status is distinct from available-in-runtime, active-on-Site and current safety eligibility. Withdrawal adds an authoritative fact; it does not rewrite an earlier genuine admission. Requalification produces a new identified verdict after all applicable evidence, rather than clearing a warning flag manually.

A manifest parsed from a repository is a **claim** until verified. The trusted intake may read it as bounded data but does not execute it to discover fields. Dependency locks, source signatures and SBOMs aid provenance; independent verification and current policy still decide admission.

<a id="web-h-preview-state"></a>

## Preview state

**Requested → Preparing → Ready**, or **Rejected/Failed/Canceled**. Ready means the entire exact selected closure was sealed, not that every current future operation is guaranteed. A candidate remains immutable while an independently evaluated access/eligibility projection can say **Expired**, **Revoked**, **No longer eligible**, or **Newer work not included**.

Only expiry/revocation/relevant eligibility failure stops use. A new unrelated private draft is informational, not automatic replacement. Preparation snapshots briefly, compiles outside database locks, and rechecks before sealing. A partially written artifact set cannot become Ready. Expiry cleanup removes grants/disposable preview resources only after required reference/retention checks.

<a id="web-h-activation-state"></a>

## Activation state

An authorized release request is **Accepted → Preparing → Ready to commit → Committed**, or **Rejected/Canceled/Outcome unknown** as appropriate. Existing owner receipts determine finality. Immediately before the short commit, reprove current policy/safety, exact selected artifacts, relevant expected heads and D10 cohort. Commit heads, receipt and required convergence intent together.

A successful deployment is input readiness only. An unknown activation response is resolved by original receipt; retry cannot switch to a newer draft, different artifact or changed locale set. When a cancel races with commit, the losing action reports the actual committed outcome. Restore is a new authorized operation, not reversal of an HTTP result.

<a id="web-h-proposed-query-projections"></a>

## Proposed query projections

| Projection    | Minimum content                                                                                                                   | Avoid                                                                                 |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Editor        | Exact revision/digest; allowed content; safe field/control schema; saved/public relationship; permitted actions; safe lease state | Full capability inventory, raw provider user, unrestricted relationships              |
| Source status | Binding health, display source, exact selected revision, build/candidate status and safe recovery                                 | Provider tokens, unrelated repository names, private commit author details by default |
| Build result  | Exact source/profile/artifact identity; typed checks, permitted diagnostic excerpt and error locations                            | Unbounded terminal log, credentials, unrestricted source archive URL                  |
| Preview       | Exact selected version labels, rendered allowed content, local navigation and capability stubs                                    | Tokens in DOM/data attributes, Live fallback, real operational side effects           |
| Release       | Source-owned activation receipt, exact scope and selected revisions, separately derived delivery status                           | Inferring Live from provider build/merge/queue state                                  |
| Impact        | Permitted affected references, count, projection completeness and source version                                                  | Treating stale/incomplete zero as proof of Unused                                     |

<a id="web-h-bounded-editor-intent-protocol"></a>

## Bounded editor-intent protocol

An editing intent carries `channelId`, `sequence`, `baseLocalRevision`, `operation`, `nodeId` where relevant, and a typed payload. Example operation names are **set-field**, **insert-node**, **move-node**, **duplicate-node**, **remove-node**, **set-layout-setting** and **select-node**. They are explicit operation-specific schemas, not arbitrary JSON Patch paths. A local selection has no write effect. Source profile, allowed manifest/control schema and exact node membership constrain every operation.

Local intents update only the current tab candidate. The shell coalesces saves with the last acknowledged source revision and current lease fence. Per-intent UI undo operates on local editing state; it never performs a hidden restore of public content. An acknowledged checkpoint is recovered through the explicit D12 restore flow when required.

Messages do not carry Tenant/actor grants, provider credentials, arbitrary code, new component registrations or publication commands. Unknown operation/sequence/channel is rejected without unsafe processing. The bridge is a convenience boundary; the server independently validates the full canonical save and authorization. Bound payload size to the qualified Page profile and validate before recursive traversal.

<a id="web-h-api-and-receipt-behavior"></a>

## API and receipt behavior

Errors reference permitted node/field IDs and stable typed causes, not unsanitized provider exceptions. Responses distinguish `accepted` asynchronous work from `committed` source mutation. Querying a receipt requires current permission to that receipt’s scope; request ID knowledge alone grants nothing.

If a save returns a field error, keep tab content and focus a meaningful recovery target. If a request might have committed, stop newer saves and reconcile that request. If authentication expires, reauthenticate without discarding local input, then recheck lease/revision. If permission or safety is revoked, do not disguise it as a temporary login failure and repeatedly retry.

<a id="web-h-concurrency-lock-order"></a>

## Concurrency lock order

Define one consistent order for owner rows touched in a transaction: exact scope/authorization fence, resource lease/current revision, deterministic ordered dependency/head rows, then new receipt/outbox inserts. Reuse the existing owning transaction order where it differs; never introduce opposite lock ordering between new and old paths. Keep remote calls/builds outside locks. Real deadlock/race tests and bounded transaction retries must replay the same semantic operation, not select new content implicitly.

---
