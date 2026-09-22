# 5. Data, API, and registry contracts

## Storage principles

Table names below are proposed additions, not existing schema assertions. Before migrations, inspect current migrations and reuse equivalent owners. Use `workflow_studio_*` for genuinely new Studio records and explicit links to existing shared tasks, communication intent/history, documents, CRM, claims, and dispatch ledger. Never recreate these under a new name.

Every tenant row carries `tenant_id` and environment scope. Use UUID identifiers and composite foreign keys containing tenant identity where supported. Retain explicit Legal Entity/currency when the source requires it. Authorization is evaluated by Core's server PDP and source service; forced tenant RLS provides defense in depth, not a second relationship-based policy engine. A service role can bypass RLS; it is not evidence of user authority [S13, S14].

Mutable coordination rows have a `revision bigint`, server timestamps, and CAS semantics. Immutable publications, decisions, effect records, and audit evidence are append-only for application roles, with correction/supersession references rather than edits. Retention/erasure is performed only by governed disposition services and can redact or remove permitted data while preserving minimal lawful tombstones. “Immutable” does not mean infinite retention.

## Logical records and constraints

| Proposed record                        | Required fields beyond common tenant/environment/id                                                                                         | Required constraints and indexes                                                                                 |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `workflow_studio_templates`            | stable slug, owner team ref, classification/purpose, current draft ref, archive time                                                        | Unique tenant+slug; no delete cascade into runs; owner/status indexes                                            |
| `workflow_studio_drafts`               | template ref, AST, layout ref, revision, editor actor                                                                                       | CAS revision; one current draft per template; draft ACL same as template                                         |
| `workflow_studio_publications`         | template ref, version, normalized AST, dialect/compiler/registry versions, digest, publisher, review ref                                    | Unique template+version; immutable digest and dependency snapshot                                                |
| `workflow_studio_bindings`             | publication ref, trigger contract, eligibility policy, scope ref, activation generation/boundary, status, automation grant ref              | One active binding per defined template/scope/trigger slot; CAS enable/disable                                   |
| `workflow_studio_binding_dependencies` | publication/binding ref, source type/ID/version, exact field/action/template dependency                                                     | Reverse index by source reference for retirement, revocation, and readiness invalidation                         |
| `workflow_studio_event_receipts`       | binding generation, source event ref, provenance, processing state, accepted time                                                           | Unique binding generation+source event; pending/failed partial index; immutable accepted identity                |
| `workflow_studio_runs`                 | template lineage, publication ref, subject type/ID, enrollment key, active plan revision, lifecycle, operational health, cancellation epoch | Unique semantic enrollment key; subject and authorized status indexes; CAS revision                              |
| `workflow_studio_plan_revisions`       | run ref, parent revision, effective AST/digest, impact manifest, reason, author/reviewer, accepted time                                     | Unique run+sequence; immutable revision chain; no history deletion                                               |
| `workflow_studio_occurrences`          | run/node/activation path/iteration, state, selected-branch set, typed source outcome ref, sequence                                          | Unique run+stable activation key; ready/waiting indexes; terminal state fencing                                  |
| `workflow_studio_task_links`           | occurrence ref, shared task ref, task contract/version, role-binding ref                                                                    | Unique occurrence+purpose+task identity; source task remains task owner                                          |
| `workflow_studio_role_bindings`        | run/role, assignment version, principal/team/queue ref, source qualification refs, reason                                                   | One effective version per role slot; no implicit ACL grant; reassignment lineage                                 |
| `workflow_studio_evidence_links`       | requirement occurrence, owner-domain ref, exact evidence version, qualification decision ref, currentness                                   | Unique requirement+source evidence coverage; no bytes or clinical fields                                         |
| `workflow_studio_waits`                | occurrence, fact contract, source subject/version, schedule/calendar ref, deadline, next recheck, cancellation epoch                        | Indexed source correlation; due partial index; unique current wait generation                                    |
| `workflow_studio_operation_intents`    | occurrence, action contract/version, source semantic key, argument digest, prepared source request ref, status, fence/lease, outcome ref    | Unique source semantic effect identity within relevant namespace; due/uncertain indexes; no raw provider payload |
| `workflow_studio_operation_attempts`   | intent ref, attempt no, fence, started/ended, safe outcome/error code, provider reference where permitted                                   | Unique intent+attempt; append-only; sensitive fields prohibited                                                  |
| `workflow_studio_decisions`            | occurrence, predicate digest, source evidence refs, true/false/unknown, selected branches, policy version                                   | Append-only; same classification and purpose as derived facts                                                    |
| `workflow_studio_audit`                | actor, delegated automation ref, action, target, before/after digests, reason, source correlation                                           | Append-only safe audit; confidential scope applies to names, counts, and access                                  |
| `workflow_studio_preflights`           | operation type, target revision/digest, bindings and policy digest, risk, reviewed impacts, expiry, consumed ref                            | Single consumption per preflight; immutable evidence; live authority recheck                                     |
| `workflow_studio_layouts`              | publication/draft/run-view ref, presentation revision, permitted coordinates/collapsed groups                                               | No executable state or sensitive node contents; independent from execution digest                                |
| `workflow_studio_simulations`          | draft/publication digest, synthetic fixture version, clock seed, outcome refs, no-side-effect proof                                         | Isolated environment; bounded retention; no live destinations or actual secrets                                  |

Bind runtime authority to the existing Phase 12 single-Tenant NHI and its required active human owner. The effective authority is the live intersection of the NHI grants, the owner’s current resolved capabilities and exact source-purpose/scope eligibility. Additional Studio records may reference that authority but may not mint an ownerless grant, freeze publisher permissions or implement a second PDP. Owner departure force-disables affected authority; ownership transfer revalidates the source grants.

## Publication binding manifest

The manifest resolves every symbolic source contract, message, form, role, evidence requirement, parameter, and subflow to a real compatible tenant resource. It includes source module readiness/certification, publication version, schema digest, scope, classification, current authorization reference, and retirement policy. Missing bindings prevent publication. Display friendly names separately from stable reference IDs.

A blueprint's fixed message reference can bind a governed resolver policy rather than an arbitrary current template. At send preparation the existing message owner resolves one compatible whole publication for site/locale and records it. Retries pin that prepared publication and content. A source safety withdrawal blocks unsent work even when its old workflow remains published; an edit cannot resurrect an unsafe message.

## Action registry

Every action entry declares: stable name/version; owner module; compatible subjects; input/output schema; required capabilities and purpose; available source phases; classification and egress policy; semantic-effect key function; allowed automation vs human execution; approval requirement; idempotency and reconciliation contract; concurrency class; retry/timeout budget; safe result codes; simulation handler; and source-event mapping.

Registry code is shipped with Core, not authored by tenants. Tenant fields and collections enter only through the custom-data owner with bounded types and certified commands. Adding a new action requires an ownership review, contract tests, privacy projection tests, retry tests, documentation, and an example fixture. Finite protected policies remain within their owners.

`task.create` cannot select an unauthorized reviewer for a protected approval. `message.request` cannot bypass source eligibility. `cms.publication.request` requires exact source-approved revision and current publication authority. There is no generic `set_status`, `mark_paid`, `approve_expense`, `provider.replay`, `write_table`, or `grant_any_role` action.

## Fact registry

Each field entry declares its type, source, subject, entity/currency basis if applicable, historical coverage, freshness limit, missing/unknown semantics, classification, permitted purpose, audience, version reference, query cost, and subscribed update events. Stable IDs survive renaming. Unsafe declassification through comparisons is forbidden: a derived boolean inherits the input's information sensitivity and permitted purposes unless the source provides an explicitly approved less-sensitive projection.

## Proposed HTTP commands

App routes remain thin; business operations belong in `packages/api` [R1]. The following paths are proposed under `/api/workflow-studio`; participant BFFs call the same services with their own projections. Generate route schemas and client types from the accepted contract layer, not manually duplicated interface files.

| Method / relative route                      | Request / precondition                                                  | Response / effect                                                                        |
| -------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `GET /catalog`                               | Purpose, subject, authorized scope                                      | Only available actions, facts, roles, templates, and contract metadata                   |
| `GET /templates`                             | Cursor and allowed filters                                              | Projection-scoped rows and count; opaque cursor                                          |
| `POST /templates`                            | Name, purpose, starter ID or blank kind; idempotency key                | Creates inert draft and versioned initial bindings                                       |
| `GET /templates/:id/draft`                   | Current read capability                                                 | Draft, revision/ETag, diagnostics, permitted editable sections                           |
| `PUT /templates/:id/draft`                   | `If-Match`, full proposed AST, presentation ref                         | Validated structural save and new revision; no execution                                 |
| `POST /templates/:id/validate`               | Draft revision                                                          | Typed diagnostics, dependency/readiness report, no mutation to product facts             |
| `POST /templates/:id/simulations`            | Digest, fixture ID, synthetic clock                                     | Simulation record; effects disabled                                                      |
| `POST /templates/:id/publication-preflights` | Exact draft revision and bindings                                       | Immutable impact and required-review preflight                                           |
| `POST /templates/:id/publications`           | Preflight ID, digest, required review; idempotency key                  | Revalidate and atomically publish immutable version                                      |
| `POST /bindings/:id/activation-preflights`   | Publication version, target scope and prospective boundary              | Exact affected enrollment scope, no retroactive side effects                             |
| `POST /bindings/:id/activate`                | Preflight and current revision                                          | Enabled prospective binding; accepted generation                                         |
| `POST /bindings/:id/disable`                 | Revision and reason                                                     | Stop new enrollment only; existing runs unchanged                                        |
| `GET /runs` / `GET /runs/:id`                | Projection-specific filters and role                                    | Safe run summary, tasks, evidence, allowed commands                                      |
| `POST /runs`                                 | Subject ref, publication/binding ref, accepted manual purpose           | Idempotent enrollment; caller cannot set tenant or bypass eligibility                    |
| `POST /runs/:id/amendment-preflights`        | Expected revision, proposed future plan, reason                         | Exact work/evidence/message impact, source eligibility and review requirements           |
| `POST /runs/:id/amendments`                  | Preflight, digest, revision, approval                                   | CAS apply; fence stale work; append plan revision                                        |
| `POST /runs/:id/control`                     | `pause`, `resume`, or `discontinue`; revision and reason                | Explicit lifecycle command and timer policy effects                                      |
| `POST /runs/:id/reassign`                    | Source task/role slot, eligible target, revision/reason                 | Delegates to source owner; creates assignment revision                                   |
| `POST /operations/:id/reconcile`             | Current authority and source-supported intent                           | Starts reconciliation, not a new business action                                         |
| `POST /operations/:id/retry`                 | Proven safe source status, revision, reason                             | Same semantic operation identity; no blind replay                                        |
| `GET /me/journeys` / `GET /me/tasks`         | Current authenticated tenant and role                                   | Participant-safe projections only                                                        |
| `POST /tasks/:id/submissions`                | Task contract/version, submission payload, idempotency, source revision | Owning service validates and records immutable submission; source task result drives run |
| `POST /external-task/session`                | Protected-action exchange, explicit interaction                         | Purpose-bound session; no membership or approval                                         |
| `POST /template-exports`                     | Authorized definition/version                                           | Safe inert package without real participants, secrets, or run data                       |
| `POST /template-imports`                     | Validated portable package                                              | Draft with all references rebound/reviewed; never enabled automatically                  |

## Mutation protocol

Verified server context derives authority, tenant and environment. Reject unsupported actor, tenant-override and bypass fields. Validate any contract-permitted selector against current authority; a selector requests scope and never grants it. Do not globally change unrelated source DTOs to accept or ignore the same fields. Require current source and Studio capabilities, origin/CSRF protection appropriate to the existing session transport, input schema validation, classification checks, and optimistic concurrency. An idempotency key is scoped to tenant+principal+operation and bound to the request digest. Reusing it with different content returns a conflict. Returning the original result still requires current permission to view it.

A preflight is evidence of what was reviewed, not a reusable authorization token. Final commit verifies expiry, current grant, source policies, target revisions, and digest. One transaction consumes it and writes the accepted change. Duplicate confirmation returns the already accepted result safely; policy drift returns `409 preflight_stale` with a safe repair path.

Error envelopes contain stable code, safe message, retryability, request correlation, and permitted field diagnostics. Use `404` for unavailable/inaccessible object reads where enumeration resistance requires it; `409` for revisions/idempotency conflicts; `422` for schema or publication semantics; `429` with Retry-After for admission controls; `503` for unavailable dependencies before acceptance. Once a source request is durably accepted, do not mislead the user into resubmitting as a new action because background dispatch failed.

## Real-time and caches

Publish authorized invalidation signals or source-approved summaries; clients refetch via the PDP. No raw Postgres change stream containing tenant workflow rows, medical context, donor records, or financial data. Cache keys must contain tenant, projection purpose, role/principal scope where needed, and source version. Tags invalidate; they do not isolate. Do not cache token exchanges or private evidence in public/CDN paths. Retired access clears relevant client caches and prevents new retrieval.

## Contract evolution

Additive schema evolution is not automatically behavior-compatible. Publications pin dialect, registry action versions, fact meaning, and source binding versions. Support old versions for active runs until migrated or safely discontinued. New runtime releases run fixture equivalence and replay tests before deployment. Incompatible changes create a new contract version and an explicit migration plan. Do not deserialize arbitrary executable types or trust imported package metadata.
