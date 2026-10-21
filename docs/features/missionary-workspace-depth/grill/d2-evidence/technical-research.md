# D2 technical research — sharing and optional staff attention

Retrieved October 15, 2026 America/Los_Angeles (October 16 UTC). Research only;
no hosted database, queue, webhook, notification or provider was changed.

This adds the mechanics relevant to D2. The same-session
[D1 technical review](../d1-evidence/technical-research.md) and
[D1 real-role probe](../d1-evidence/postgres-probe/README.md) remain the evidence
for RLS, role rights, tenant-aware references, concurrency and current access;
those tests were not rerun merely to inflate a new count.

The Supabase documentation search tool and public web search were used, followed
by exact official documentation retrieval. [Fetch records](technical-source-fetches.json)
retain URLs, retrieval timestamps and byte hashes. Full source pages are
temporary research inputs, not vendor documentation copied into this repo.

## New technical findings

| Primary evidence                                                                                                                                                                                               | What it establishes                                                                                                                                                                                                           | Consequence and limit                                                                                                                                                                                                                                                                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [AWS transactional outbox guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html)                                                                  | A database change and separately emitted event can disagree after a partial failure. Committing source data and durable event intent together closes that gap; consumers still need idempotency.                              | Co-accept the contact-sharing effect, required audit and optional source notification request. Delivery/materialization happens through its existing owner and does not reverse sharing. This is a pattern, not a recommendation for AWS, another broker, event sourcing or a second notification system. |
| [Supabase Database Webhooks](https://supabase.com/docs/guides/database/webhooks)                                                                                                                               | Webhooks wrap asynchronous pg_net calls and can emit underlying row/current-and-old-record payloads.                                                                                                                          | A generic table-change webhook is not a qualified D2 event: it can leak private fields and does not define the intended business occurrence, recipients or durable outcome. No direct contact-row webhook is needed.                                                                                      |
| [Supabase pg_net](https://supabase.com/docs/guides/database/extensions/pg_net)                                                                                                                                 | HTTP requests start after transaction commit, but queue/response tables are unlogged; responses are temporary.                                                                                                                | Commit ordering is not durable recovery. Do not use the HTTP queue or response retention as the business receipt or communication history. No application-level delivery guarantee follows from the extension's throughput examples.                                                                      |
| [Supabase pg_net queued-header guidance](https://supabase.com/docs/guides/troubleshooting/database-roles-can-read-request-headers-queued-by-pg_net-ad6357), page dated October 14, 2026 in current public help | Request headers/body can be inspected by database roles with access to the extension; Vault-decrypted headers are still stored in the queue. Provider-managed queue policies cannot simply be replaced by application RLS.    | Do not move restricted contact payloads or privileged provider credentials into a raw notification trigger. This is an integration footgun, not evidence of a Core exposure. `net` is not normally Data-API-exposed; direct database access and API access are different boundaries.                      |
| [Supabase PGMQ](https://supabase.com/docs/guides/queues/pgmq)                                                                                                                                                  | Its exactly-once wording is bounded by a visibility timeout; a read message becomes visible again after that interval. `pop` removes on read and can lose unfinished processing. Unlogged queues trade away crash durability. | Neither queue delivery nor a worker claim proves one durable notification effect. Use permanent source/recipient identities and idempotent materialization. This research does not add PGMQ or select a new queue.                                                                                        |
| [PostgreSQL 17 transaction isolation](https://www.postgresql.org/docs/17/transaction-iso.html)                                                                                                                 | At Read Committed, concurrent inserts/updates can wait and re-evaluate; independent statements do not automatically establish a multi-write invariant.                                                                        | One guarded source transition must decide shared state, receipt and optional notification intent. Same transport retry and a new transport request for an already-accepted transition both need safe behavior. A result requiring resolution must not be reported as an accepted share.                   |

No source above proves Core's current notification implementation or the future
hidden-identity admission path. The focused D2 probe separately tests the exact
synthetic sharing/intent hypotheses and records its actual results and limits.

## Governing repository reconciliation

- [ADR-0027](../../../../adr/0027-one-notification-presentation-and-engagement-model.md)
  makes notification presentation and personal engagement projections over a
  source-owned event. Read/archive is not task or business completion. D2's
  informational notice belongs to that model; no notification is the contact's
  availability authority.
- [Phase 17](../../../../prds/sitestacker-parity/phase-17-system-messages-template-management.md)
  sections **Dependencies and Ownership**, **Repo Anchors — REAL vs FORWARD**,
  and **Canonical Language and Truth Boundaries** distinguish source facts,
  P6 recipient-specific communication truth, and P17 presentation. Local-only
  availability is not Resend delivery. The legacy notification_queue is explicitly
  a migration hazard, not a reusable generic transport.
- [Workflow orchestration](../../../../../openspec/specs/workflow-orchestration/spec.md)
  requires product-owned effect/dispatch identities, identifier-only envelopes
  and recoverable handoff. A workflow runtime never owns contact state or
  authorization. This does not make optional Phase 34 automation a prerequisite
  for native D2 sharing or staff attention.
- [ADR-0183](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)
  requires an actual source-owned action obligation before projecting a task.
  Choosing staff to notify does not create that obligation.
- [ADR-0211](../../../../adr/0211-distinct-human-approval-for-projection-widening.md)
  governs changes to projection policy. Ordinary qualified contact sharing
  under an admitted source policy is not a new policy edit on every click.

The smallest implementation obligation is source acceptance plus a recoverable
request to the existing notification owner. Exact table, function, transport and
worker names remain design choices. A general publish/share platform, new ACL
engine, notification engine or distributed transaction coordinator is unnecessary.

## Numerical and evidence discipline

No latency, maximum staff count, supported tenant size, delivery SLA or throughput
claim has been established for Core. A provider documentation limit is not a
product budget. Measure the real source query, selected-recipient resolution,
materialization and accessible phone journey before activation. Restrict any
implementation batch size for bounded work without inventing a product limit on
how many eligible staff the missionary may select.

Queued, locally available, read and followed up are distinct facts. Only a
durable local available result can support “Notification sent” in an in-product
flow, and even that does not prove that the person saw or acted on it. Prefer
precise source-backed copy, such as “Contact is available to staff. Notification
pending.” during processing; a later notification failure leaves the shared
contact available and has its own retry route.
