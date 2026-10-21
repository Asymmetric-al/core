# D7 — database and delivery-lifecycle assessment

Research only, October 16, 2026 UTC. The founder selected deliberate human
authorization of every newsletter. This note assesses the source/database
mechanics needed to make that choice true; it does not ratify a new schema,
implement a newsletter, choose optional scheduling or qualify a provider.

## Recommendation

Use one source-owned issue identity and an immutable authorization of its exact
content and reviewed audience meaning. Final authorization must re-prove the
current actor, Tenant, purpose, selected source revision and applicable rights.
Use the existing P6/P17 plan/member/effect identities and current safety gates
for delivery. Do not add an independent newsletter outbox, provider Contacts
authority, generic workflow status or a second scheduler.

A deliberate send is not a browser request key. Multiple request keys cannot
authorize multiple copies of the same issue by accident; changed approved
meaning cannot mutate an accepted issue. A genuinely new issue requires a new
deliberate source occurrence. Content edits, audience edits, subscription changes
and provider outcomes remain separate facts. Current audience eligibility may
narrow the approved envelope without silently adding new people or retargeting
old prepared destinations.

Record the complete required acceptance facts, immutable authorization evidence
and source dispatch requests atomically through the existing owner boundary.
No released partial occurrence or independently committed orphan recipient work
is allowed. This is not a demand for one unbounded transaction over an arbitrary
subscriber population: the real bounded source manifest and existing P6 plan
compiler must prove completeness before eligible child effects are released.
The synthetic two-recipient transaction establishes only the local atomicity
mechanism.

## Findings and exact proposed clauses

Severity reflects harm if the failure occurs; likelihood is conditional design
risk, not measured production incidence. These are proposed safeguards for the
selected outcome, not new actor rights or a production SQL prescription.

### DB01 — A request key is not a newsletter issue

- **Severity/likelihood:** High / likely if retries, different tabs or refreshed
  clients generate independent send requests without a source occurrence guard.
- **Evidence:** P6 PRD:199 requires immutable source plan/member identity,
  complete comparison hashes and conflicts for changed meaning. P17:1882–1893
  requires complete parent/children and exact replay. Probe checks1–6 and the
  `simultaneous_different_keys_one_source_release` race observe convergence.
- **Impact/fix/clause:** “One deliberately authorized issue has one permanent
  source release and exact recipient-effect identities. Repeated browser,
  transport, worker or operation identifiers cannot create another release.
  Reusing an occupied identity with changed meaning conflicts; a new issue
  requires a distinct authorized source occurrence.”

### DB02 — Approval must bind immutable meaning, not a mutable draft pointer

- **Severity/likelihood:** Critical / plausible when the final send reads latest
  draft/content/audience after the missionary's review.
- **Evidence:** P17:1888–1890 conflicts on changed source/binding/recipient/
  count/order/member/hash; :2789 binds immutable candidate/dependency graph and
  expected head for its own publication command. The latter is owner precedent,
  not permission to classify a newsletter as a system-message publication.
  Probe rejects stale content/audience and changes to already released meaning.
- **Impact/fix/clause:** “The final newsletter command binds the exact reviewed
  content/dependencies, source-owned audience meaning and relevant expected
  revisions. Changed approval-relevant meaning requires refreshed deliberate
  authorization. Current safety can suppress remaining effects but cannot
  silently rewrite approved content, add recipients or retarget a destination.”

### DB03 — Source acceptance cannot survive without its required evidence

- **Severity/likelihood:** High / plausible with separate source, audit and
  enqueue writes or child fan-out that can escape before parent completion.
- **Evidence:** P17:1882–1903 requires complete source-bound plans before release
  and independent child outcomes. P6:199 prohibits independent child primitive
  commitment. PostgreSQL atomicity and composite constraints are primary
  references in `postgres-probe/sources.json`; injected failure leaves
  `draft:0:0:0:0` source/release/audit/effect/operation state.
- **Impact/fix/clause:** “Required source authorization, evidence and dispatch
  work are accepted together or not accepted. Work cannot dispatch before its
  complete source occurrence is durably released. A lost response reconciles
  that occurrence; a later projection failure does not roll back accepted work.”

### DB04 — Exact current authority must survive every alternate access path

- **Severity/likelihood:** Critical / plausible if UI-only permission, caller
  Tenant/actor values, table grants or a privileged RPC bypass the source seam.
- **Evidence:** Durable identity-and-access OpenSpec:14–21/43–53 requires server
  identity and layered Tenant isolation. P12 PRD:1542–1556 requires one PDP and
  trusted current context. Supabase API/RLS primary docs distinguish grants,
  exposure, RLS and function privileges. Probe has actual nonsuperuser roles,
  current-authority checks, no actor raw-table grants and a nonowner definer.
- **Impact/fix/clause:** “Every read, approval, cancellation, repair and dispatch
  re-proves its exact current Tenant/actor/source/purpose authority through the
  source boundary. Inspect Data API, GraphQL, exposed RPC, views, Storage,
  Realtime, jobs and service-role paths. Actor-supplied scope, role, consent,
  approval, sent status or recipient identity is never authority.”
  No new missionary capability is inferred from this database mechanism.

### DB05 — Effective RLS semantics, not keyword checks, protect updates

- **Severity/likelihood:** High / plausible if a reviewer assumes omitted
  `WITH CHECK` always permits ownership reassignment, or assumes any definer
  automatically bypasses RLS, and misses the real effective privilege shape.
- **Evidence:** PostgreSQL17 CREATE POLICY explicitly reuses `USING` for new
  rows when an ALL/UPDATE policy omits `WITH CHECK`. The probe proves a visible
  allowed update, invisible old row, and denied new Tenant/actor. Supabase's
  current RLS documentation explains owner-dependent definer bypass.
- **Impact/fix/clause:** “Prove permitted and forbidden old-to-new transformations
  under actual roles, all applicable policies and grants. Protect immutable
  scope/attribution/approval columns independently where row policies do not
  constrain them. Review function owner, search_path, PUBLIC EXECUTE, table
  ownership/BYPASSRLS and view execution behavior; syntax alone is not proof.”

### DB06 — Cancellation needs a defined order against actual dispatch

- **Severity/likelihood:** Critical / plausible in queued/batched sending and
  slow or interrupted provider calls.
- **Evidence:** P17:1905–1912 re-proves current source/recipient/safety before
  dispatch and retains indeterminate outcomes; :3681–3684 names exact
  definitely-unsubmitted versus may-have-begun crash boundaries. Probe observes
  real lock waits for cancel-first and dispatch-first with distinct outcomes.
- **Impact/fix/clause:** “Cancellation or applicable revocation that wins the
  source/dispatch fence prevents unstarted effects. Effects proved definitely
  unsubmitted remain subject to their existing safe cancellation rules. Once
  submission may have begun, retain that exact identity and truthful outcome;
  cancellation ends only still-stoppable work and never claims recall.”
  A lease, preparation or generic queued status alone does not establish the
  may-have-begun boundary. No transaction may wait across provider I/O.

### DB07 — A re-enabled setting must not accidentally revive canceled effects

- **Severity/likelihood:** High / plausible with current Boolean checks and
  revocation/re-enable between worker runs.
- **Evidence:** P17:737–740 uses a monotonic cancellation ceiling for its exact
  P12 policy occurrence, showing the permanent source pattern. It is not a
  universal rule that every grant change cancels every newsletter. Probe
  deliberately models one required source authority epoch and rejects its old
  unprocessed effect after re-enable.
- **Impact/fix/clause:** “Identify the exact source events that end or invalidate
  unstarted newsletter effects and preserve their non-revivable identity across
  re-enable, restore and retry. Unrelated permission changes and surviving
  independently sufficient authority paths are evaluated under their owner
  contracts, not treated as blanket cancellation.”

### DB08 — Unknown delivery cannot justify a replacement

- **Severity/likelihood:** Critical / plausible after timeout, interrupted
  worker, expired provider dedupe window or late webhook.
- **Evidence:** P17:1905–1912 repairs the same step; :3666–3667 permits only
  exact bounded identical same-key calls for specified causes, and :3769
  forbids replacement after the provider window. P6:190 requires exact scoped
  provider evidence attachment, not email-address correlation. Probe preserves
  one unknown effect, rejects wrong-key evidence and records exact late
  simulated acceptance without reviving canceled siblings.
- **Impact/fix/clause:** “Unknown outcomes reconcile the same sealed source and
  provider identity under P17's exact rules. Do not rekey, split, substitute
  recipients, create a replacement issue or call it not sent merely because a
  response is missing. Qualified exact same-key retry is distinct from creating
  another intended effect; provider key lifetime is not business dedupe.”

## Owner reconciliation and limits

Human-authored newsletters remain outside P17's system-message catalog
(:1093). Its older :280 statement that P32 owns newsletters needs the native
P28 amendment already identified for D6; reusing P17 editor/preparation/dispatch
mechanisms does not move the native issue into that catalog or make P32 required.
The real P28 issue/audience authorization producer still needs qualification.
P22 content release, P25 post notifications, newsletter subscription and a new
newsletter issue are distinct: database dedupe cannot decide whether genuinely
different communications should both exist.

Do not add proof/retention durations, a new per-recipient approval queue,
automatic digest, automatic send, new permission flag or provider scheduler
from this note. Deferred work should use existing Core-owned intents when its
source permits scheduling; current provider feature availability does not amend
the accepted P17 owner contract. Subject/body/contact bytes stay in their exact
source/prepared-material owners, not broadly readable audit/outbox/status rows.

## Experiment result and reproducibility

See [probe README](postgres-probe/README.md), [results](postgres-probe/results.json),
[roles](postgres-probe/roles.json), [environment](postgres-probe/environment.json),
[cleanup](postgres-probe/cleanup.json), [sources](postgres-probe/sources.json) and
[manifest](postgres-probe/manifest.json). **41/41 outcomes passed; six actual
transaction-lock waits.** Eight synthetic accepted issues have eight
authorization audit records and sixteen recipient effects. The faulted issue
has none. Container and volume are removed.

These results establish bounded PostgreSQL17.11 mechanisms only. They do not
qualify Core P12 decisions, Supabase Auth/JWT/RLS/API configuration, actual source
commands, P6/P17 manifests, message content, recipient privacy, storage,
Inngest, provider calls/webhooks/idempotency windows, crashed-process recovery,
load, UI, accessibility or human authorization comprehension. The fixture's
`admitted_unknown` is an assumed model boundary, not observed provider I/O;
the parent review must retain that limitation when citing its races.
