# 3. Workflow language, conditions, and compilation

## Canonical representation

Use a structured, versioned JSON AST, not React Flow's `nodes` and `edges` as execution authority. The candidate structural schema [`contracts/workflow.schema.json`](contracts/workflow.schema.json) defines dialect `asym.workflow/1`. A blueprint is a portable source definition, with declared contract bindings that must resolve to tenant-owned publications and capabilities before publication. It contains no real person IDs, credentials, message bodies, or clinical/financial records.

The AST is a tree of supported blocks. The compiler may produce a graph IR for execution and visualization, but that graph is derived. Compiler/interpreter semantic versions and a canonical SHA-256 digest are pinned with publication. JSON canonicalization must be deterministic and tested across clients/server; use one audited implementation, not ordinary object insertion order as a signature contract.

## Node semantics

| Node kind    | Required semantics                                                                                                                                        |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sequence`   | Activate children in order; advance only after each child's accepted normal outcome                                                                       |
| `task`       | Create/link one shared task for a registered contract and eligible role; wait for its source-accepted completion, not merely creation                     |
| `evidence`   | Invoke the named evidence-request contract and wait for qualified source evidence; reminders and review remain contract-bounded                           |
| `action`     | Request a registered product operation with typed inputs; map confirmed outcomes through the action contract                                              |
| `wait`       | Persist a wait over an approved fact predicate and optional deadline; source evidence remains authoritative                                               |
| `choose_one` | Evaluate all cases against one consistent fact bundle; exactly one true selects it; none true selects fallback only if every case is known false          |
| `parallel`   | Evaluate branch guards once at activation; freeze selected branches; execute eligible work independently; join on explicitly selected successful branches |
| `subflow`    | Invoke an exact pinned publication with explicit typed inputs, restricted authority, and mapped outputs; no recursion                                     |
| `finish`     | Finish the run with a declared process outcome; illegal inside a parallel branch or reusable nonterminal fragment                                         |

Stages are presentation groupings over node IDs, not independent scheduling instructions. A task contract may record a legitimate `declined` or `needs_information` response; these are business facts consumed by a following branch, not automatic infrastructure errors. Source-owned human review can be opaque within an evidence block when its policy cannot be customized.

`parallel.join` supports `all`, `any`, or `quorum` with required branch IDs. `all` means every activated branch accepted its normal successful outcome. `any` requires at least one activated successful branch plus every explicitly required branch. `quorum(k)` requires at least k activated successful branches plus required branches; required branches count toward k. Activation with insufficient possible branches is blocked, not satisfied. An empty selected set succeeds only when the node explicitly allows `onEmpty: continue`; otherwise it blocks. Failed, canceled, waived-by-UI, or unselected work is not affirmative evidence.

For an `any`/`quorum` join, publication requires a safe remainder policy. `await_remaining` waits for all already-started work; `cancel_unstarted` cancels only operations that have not crossed their irreversible boundary, records remaining in-flight operations, and cannot start downstream work whose safety requires their absence. The initial certified use is `all`; wider joins activate only after their source side-effect policies pass the tests.

## If–then conditions

Predicates use `all`, `any`, `not`, `compare`, and `exists`. Operands are typed literals or declared fact/parameter/step references. Supported comparison operators are `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, and `in`. No JavaScript truthiness, implicit coercion, regex, arbitrary property walking, raw SQL, JSONPath, or calls to external services inside the predicate evaluator.

Result values are **true**, **false**, and **unknown**. Access denial is **blocked**, not another fact value. An unauthorized field is rejected at publication; newly revoked access blocks evaluation without revealing whether its value exists.

| Operation | Rule                                                                                                        |
| --------- | ----------------------------------------------------------------------------------------------------------- |
| `all`     | False if any known operand is false; true if all are true; otherwise unknown                                |
| `any`     | True if any known operand is true; false if all are false; otherwise unknown                                |
| `not`     | Invert true/false; unknown remains unknown                                                                  |
| `exists`  | False only for source-certified absence; unavailable/stale/incomplete remains unknown                       |
| `compare` | Unknown if a needed value is unknown or required history is incomplete; type mismatch is a validation error |

Empty `all`/`any` arrays are forbidden. Evaluate the permission eligibility of all referenced fields before value short-circuiting, preventing short-circuit access leaks. Normal diagnostics return a purpose-safe reason code, not unauthorized field names or values.

For `choose_one`: one true plus unknown alternatives blocks, because exclusivity is unproved. Several true cases block as ambiguous. All false with explicit fallback selects fallback. Unknown never silently selects an adverse path. The compiler statically detects simple overlap; runtime handles anything not provable in advance. An explicitly ordered `first_match` dialect is not included in version 1.

For “run all matching,” use guarded parallel branches and `join: all`; unknown guards block the group. This avoids implicit Zapier-style multi-match behavior while retaining the useful ability to perform several independent actions [S12].

## Time and fact semantics

Every fact contract defines identity, owner, schema, scope, completeness/freshness, classification, allowed purpose, authorized audience, and update/wake mechanism. Source facts are immutable references or versioned projections; the workflow stores only necessary decision evidence, not a shadow CRM.

Routing facts freeze at the accepted decision with source versions. Current authorization, suppression, source command eligibility, and publication restrictions always re-evaluate at final action dispatch. A later change does not silently rewrite a past branch; the source adapter creates a new event or remediation requirement as appropriate.

Money uses integer minor units and explicit ISO currency and entity. A workflow may only compare values with compatible source-defined bases and currency. Display currency conversion never becomes an execution fact. Date-only fields are distinct from timestamps. An event has `occurredAt`, `recordedAt`, source revision, and provenance; delayed delivery never causes the system to pretend the event occurred now.

History-dependent predicates such as “first gift” require a named completeness-qualified source fact. A fresh import containing no older gifts cannot prove there were no earlier gifts. Scheduled inactivity evaluation freezes the cohort basis and uses source-approved reporting projections; it does not scan arbitrary tables or create a person-level `lapsed` state [R4].

## Subject and enrollment

A subject is a typed source reference, not always a person. Supported initial classes include inquiry, application, contribution, recurring occurrence, conversation, publication revision, support-raising check-in, document requirement, registration, and source-owned care intake.

Version 1 enrollment policies are `once_per_subject`, `once_per_event`, and `one_active_per_subject`. The uniqueness scope includes tenant, environment, template lineage, subject type/ID, and the policy's semantic key. The key never includes the current template version when that would restart the same journey. Reapplications use a new domain application ID. An amendment is not enrollment. Re-enrollment after completion requires a new accepted occurrence or explicit authorized manual request.

Do not define “one active per person” globally. A person may have distinct simultaneous applications, conversations, and registrations. Merge/correction of a person record must preserve subject lineage and deduplication; it must not reenroll everything under a new ID.

## Compiler contract

Compilation is a pure operation over source JSON, registry snapshot, binding manifest, authority envelope, and declared facts. It emits normalized AST/IR, semantic digest, dependencies, risk classification, required data purposes, structural diagnostics, bounded workload estimates, and a test plan. It performs no external actions.

Publication checks syntax, unique node IDs, reference resolution, stage membership, action version availability, input/output compatibility, dominance of referenced outputs, branch reachability, allowed terminal outcomes, role fallback, evidence authority, cross-tenant/entity references, classification propagation, purpose-compatible recipients, bounded fan-out, join feasibility, maximum depth, source readiness, contract deprecations, and protected action restrictions.

Source references are permitted only through registry keys. A reference to a conditional branch output outside that branch must be an explicit optional/join export; it cannot assume the branch ran. A later node cannot be referenced. Layout changes are excluded from the execution digest. Role labels may be translated without changing stable IDs.

## Bounded complexity and product defaults

Initial platform ceilings: 250 executable nodes per expanded definition, nesting depth 8, at most 10 branches in a group, subflow call depth 4, at most 25 named external participants in one request, and 100 planned operations per evaluator advance. Bulk donor cohorts are chunked enrollment runs, not a giant in-memory loop. These are proposed safety limits to validate with production-shaped load tests, not vendor limits or claims of capacity. Tenants may narrow them; increases require platform qualification.

No free loops in version 1. Resubmission creates a new source task attempt under a bounded contract; reminders use a schedule policy; recurring processes create occurrence-scoped engagements. Subflows cannot recurse. Cross-workflow causation has a platform hop/operation budget and human-visible quarantine to stop indirect A→B→A loops.

## Schema versus semantic validation

The supplied JSON Schema validates structure. Registry and compiler checks are additional and mandatory. A structurally valid blueprint is not publishable until every binding resolves to real tenant capabilities. The package's validation report does not claim a production interpreter exists.

## Held dispositions and re-entry

An operator pause retains the continuation point. A `finish` with `lifecycle: on_hold` instead records a held business disposition, such as a deferral, with no automatic continuation beyond that terminal. Resuming a held disposition requires an authorized source successor and a previewed new plan revision/step occurrence or a new source-defined engagement. It never reevaluates the old recorded branch or silently reruns earlier work. The Studio must distinguish **Resume paused work** from **Review held disposition**.

A monetary comparison's type carries its source currency, Legal Entity and amount basis even when its serialized value is an integer. The compiler may establish compatibility through a preceding `choose_one` currency guard and must validate that dominance. It must reject an unguarded cross-currency numeric comparison. BP-15 deliberately performs the currency guard before the threshold comparison.
