# D14 — local calendar-copy protocol and timezone probes

Research only, October 16, 2026 UTC. The founder selected optional automatic
calendar updates. The following is a bounded design model, not a selected
provider, implementation, formal owner amendment or production qualification.

**Final result: 24/24 model outcomes passed.** The runner uses Python 3.12.14
standard-library dataclasses, datetime and the installed `zoneinfo` database.
It uses no SQLite, PostgreSQL, container, network, OAuth, provider, credentials,
application module or new dependency. Only `probe-results.json` is written.
Run from the repository root:

```sh
python3 docs/features/missionary-workspace-depth/grill/d14-evidence/probe.py
```

Artifacts: [probe.py](probe.py) is the complete model and assertions;
[probe-results.json](probe-results.json) records execution time, Python and tzdata
evidence, code/source SHA-256 hashes, each outcome and explicit limits. No
temporary services or resources were created, so no service cleanup was needed.

## What the model means

The model assumes one canonical appointment and an exact trusted tenant/actor
context. One stable copy identity contains the appointment, principal, export
purpose and durable provider-account/calendar destination. Different browser
request keys do not create another copy. Credential generations fence execution
but are not part of that business identity. Reconnect does not discard a known
mapping, resolve uncertainty, enroll a removed copy or create a second event.

A copy has a current desired source revision and a small operation journal.
An operation freezes its kind, source revision, destination/copy identity,
connection generation and payload digest. This model permits at most one
unresolved operation for a copy. Later undispatched source changes may coalesce;
an attempted revision is reconciled before a replacement is dispatched.

`claim` is an abstraction of the **last guarded dispatch admission**, after
which an external request may already be in flight. It is not an ordinary queue
lease and does not license a sleeping worker to initiate new I/O after a later
revocation. The real implementation must re-prove current source, connection and
purpose authority at its actual dispatch boundary. These sequential tests do
not prove that boundary or any distributed timing guarantee.

The provider stub is deliberately **not idempotent**. Replaying a create makes
another remote event. The safe model blocks an unresolved replacement; it does
not claim exactly-once provider execution. Acceptance and exact-target absence
are supplied synthetic evidence, not verified callbacks or API results. A
generic HTTP 404 is not established as sufficient deletion evidence.

`cancel` represents an authoritative source cancellation/invalidation supplied
to the model, not a user permission to modify an appointment. Cleanup authority
is a separate explicit synthetic boolean. It is never inferred from obsolete
source-read access; disconnect still prevents calls through the disabled
connection. This demonstrates the distinction, not a new production cleanup
grant or right to retain credentials after disconnection.

## Executed outcomes

| IDs                 | Observed result                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M01–M03             | Different Add request keys return one copy. A create accepted remotely with its response lost remains unknown locally and blocks a fresh create. Disconnect/reconnect changes credential generation without changing copy identity or automatically restoring opt-in; even explicit modeled resume cannot bypass the unresolved operation.                                                                            |
| M04–M07             | Both ordered cancellation and disconnect cases are exercised. Fence-first blocks create. Admission-first can leave a remote copy, and late acceptance cannot mark the cancelled/disconnected copy synchronized or reenroll it. These are sequential orderings, not actual concurrent races.                                                                                                                           |
| M08–M11             | An old accepted revision cannot mark newer source content synchronized. An unresolved update blocks a replacement; reconciliation permits the latest revision next. Undispatched intermediate versions may coalesce. Duplicate old acceptance cannot regress a newer confirmed head; a conflicting remote identity is rejected.                                                                                       |
| M12–M15             | Lost delete response remains unknown until assumed exact-target absence evidence. Late create acceptance after cancellation creates a cleanup need without granting cleanup authority. A disconnected connection cannot perform cleanup. Loss of source-read access blocks ordinary export, while a separately supplied narrow cleanup grant can authorize exact removal only through an otherwise usable connection. |
| M16–M18             | Toy command checks reject another tenant, actor, account or calendar. Acceptance cannot attach to another appointment binding. External deletion does not automatically recreate an event. These are Python checks, not RLS, OAuth or provider proof.                                                                                                                                                                 |
| M19, unsafe control | Bypassing reconciliation and replaying the same create against the non-idempotent stub makes **two** remote events. This is the expected failure demonstration, not a failed probe outcome or current Core vulnerability.                                                                                                                                                                                             |
| M20, unsafe control | New York `2026-03-08 02:30` has no valid UTC round-trip candidate. Python's naive `replace(tzinfo=...)` still constructs a timestamp, demonstrating why attachment alone does not validate a civil time.                                                                                                                                                                                                              |
| M21                 | New York `2026-11-01 01:30` maps to **05:30 UTC or 06:30 UTC**. The probe exposes both; it does not silently select an occurrence or choose a product disambiguation policy.                                                                                                                                                                                                                                          |
| M22–M23             | An ordinary New York appointment at `2026-10-16 09:00` maps to `13:00 UTC`; Tokyo renders `22:00` and Honolulu `03:00`, preserving the source instant. Viewer-zone changes do not alter the modeled event identity or source time.                                                                                                                                                                                    |
| M24                 | An all-day date interval keeps a date-only start and exclusive next-date end, with no invented midnight-UTC timestamp. Provider all-day encoding remains unqualified.                                                                                                                                                                                                                                                 |

Timezone cases use the installed rules reported in the result. They do not
implement pinned tzdb/resolver storage, recurrence, series exceptions, provider
IANA/Windows mappings, every jurisdiction or a full date validation interface.
The useful permanent requirement is to preserve source time kind and zone,
detect invalid/ambiguous civil times through the source owner, and display
viewer conversion without changing the appointment.

## Repository basis and applicable limits

- [P31 roadmap](../../../../prds/sitestacker-parity/roadmap.md:4413),
  **4413–4419**: current principal scopes, bounded delivery, exact connection
  registry and server-held credentials.
- P31 **4431–4449**: source owns eligibility, business identity and outcomes;
  P31 owns connection/transport. Connected is not synchronized. Outage is not
  deletion/access loss. Explicit disconnect immediately fences future work;
  external cleanup is separate. **4455–4457** requires duplicate, late,
  lost-acknowledgement, unknown-outcome and connector-specific proofs.
- [Retained P31 constraints](../../../../prds/program-roadmap/owner-constraints.md:485),
  **485–490**: reset/resnapshot cannot erase provider-owned records or claim
  downstream deletion. The financial feed remains its distinct first consumer;
  calendar copy work does not widen that feed or replace source owners.
- [P6 prepared identity](../../../../prds/sitestacker-parity/phase-06-shared-communication-event-model.md:524),
  **524–556**, and correlation **598–616**: exact prepared identity, unknown
  outcome rather than failure, no blind replay, scope/connection-bound provider
  correlation and no matching by recipient address. These are **email-specific
  owner contracts used as design precedent**. Calendar copies are not forced
  into email intents, and P6's prepared-email purge periods are not adopted here.
- [P12 principal/tenant boundary](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1552),
  **1552–1556**, **1584–1587**, **2864–2887**: one current trusted context,
  single-tenant service identity with its applicable live owner ceiling,
  re-proof for deferred work, structural tenant references, coarse RLS and
  current source-purpose authorization across privileged paths.

## Proposed PostgreSQL constraints — not executed

These are required invariants to reconcile into the owning source and P31
contracts, not a schema migration or a new sync subsystem.

1. **Stable copy identity:** enforce one binding for the exact
   `(tenant, appointment, principal, export purpose, durable destination)`.
   Destination binds provider namespace, provider account and calendar through
   a typed source-qualified record. **Do not include credential generation in
   the business uniqueness key.** Retain the same binding/mapping and unknown
   operation across rotation; do not rely solely on an “active rows” unique
   index that permits a duplicate while an inactive unknown create survives.
2. **Scoped references:** non-null tenant and complete same-tenant composite
   FKs bind source appointment, principal/context reference, destination,
   connection, copy, operation and evidence. Account/calendar references cannot
   be swapped by a caller or an ordinary row update. Applicable entity/purpose
   scope follows the source, not fabricated financial fields.
3. **Permanent operation identity:** unique source-copy/revision/operation kind
   (or the owner-equivalent semantic key), distinct from request retry keys and
   provider idempotency caches. Freeze attempted destination, source generation,
   kind and payload digest. Attempts point to the same operation; a retry cannot
   rewrite its meaning. Before dispatch, an unattempted desired revision can
   be superseded/coalesced under the source command.
4. **Exact remote mapping:** a known provider event ID is unique within the
   appropriate tenant/provider account/calendar namespace. Evidence attaches only
   through the verified connection/account and original operation, never title,
   email or untrusted provider metadata. Unknown create remains representable
   without a fabricated ID. A conflicting mapping creates an owned exception.
5. **Closed valid states:** constrain operation kinds/outcomes and required
   references. Unknown is distinct from rejected, accepted and definitely
   unsubmitted. Removal requires the exact owned mapping or qualified resolution
   of an unknown create. A single current observed head cannot regress when old
   evidence arrives; preserve that evidence separately from current desired state.
6. **Lifecycle-safe deletion:** source cleanup, connection disconnection and
   remote deletion are distinct facts. Do not cascade-delete mapping/outcome
   evidence needed to prevent duplicates or explain incomplete cleanup. Apply
   the existing retention/classification owner rather than inventing indefinite
   payload retention. Keep credentials and export text out of job payloads/logs.
7. **Time facts:** keep timed versus date-only values structurally distinct;
   require valid ordered boundaries and source-approved zone/rule evidence for
   timed civil intent. Do not coerce an all-day DATE into UTC midnight or assume
   provider recurrence semantics. A local SQL CHECK alone cannot certify an
   external timezone mapping or cross-row schedule meaning.

## Authorization and transaction proofs still required — not executed

- **Actual grants/RLS:** inspect actual table ACLs, coarse tenant RLS, role
  ownership, FORCE RLS where required, private functions, controlled search
  paths, security-invoker views and every service/BYPASSRLS path. Prove eligible
  old row and allowed new row/fields. Omitted WITH CHECK may inherit USING;
  omission alone is not proof of a vulnerability or safe behavior.
- **Sole P12 decision:** validate the actual tenant/principal/context, source
  appointment export eligibility, exact destination control, field projection,
  current epochs and service ceiling. OAuth calendar access is not Asym source
  permission. Provider account email is not principal identity. The initiating
  human and actual background service actor remain distinct and attributed.
- **Atomic local effects:** source opt-in/cancel, desired revision, required audit
  and outbox intent commit coherently. An external provider call is outside that
  local transaction. Test rollback and lost response without duplicate local
  intent or misleading accepted/synchronized status.
- **Real concurrency:** exercise actual database waiting/commit orders for
  double Add with different keys; source edit versus final dispatch admission;
  cancel/disconnect versus admission; old lease versus new attempt; completion
  versus newer source revision; delete versus late create acceptance. Current
  authority is re-proved at the real irreversible boundary, not only when a
  worker first leases a row. No lock is held across provider I/O as a substitute
  for a qualified distributed protocol.
- **Revocation/cleanup:** prove ordinary dispatch stops when current authority
  is lost. Separately establish who can remove the exact previously exported
  copy without rereading/reexporting restricted source content. A surviving
  technical credential is not that authority. If cleanup cannot be authorized
  or verified, retain a truthful unresolved/remains state and safe manual route.
- **External effects and privacy:** certify provider create correlation and
  idempotency limits, targeted readback, conditional update, missing-event and
  delete semantics, external-edit conflict behavior, attendee/notification
  suppression, OAuth scope granularity and credential revocation. No unrelated
  calendar import is needed. A provider-owned calendar's sharing/delegation can
  expose copies, so validate the exact export projection under current privacy
  floors, including generic timing/existence and authenticated deep links.

No case here proves exactly-once external delivery, protected data erasure,
provider deletion, hosted Supabase authorization, neutral error/timing behavior,
production load or a user-comprehensible recovery journey. The model is useful
evidence for the proposed state distinctions and negative cases; it is not a
replacement for those release qualifications.
