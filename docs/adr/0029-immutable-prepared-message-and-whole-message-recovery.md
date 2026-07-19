# ADR-0029: Immutable prepared message and whole-message recovery

**Status:** Accepted (founder ruling, Phase 17 grill session — D15)

> Full record: `docs/prds/sitestacker-parity/phase-17-system-messages-template-management.md`
> (ratified decision D15).

## Context

Render failures, missing translations, revoked credentials, network timeouts,
worker crashes, and ambiguous provider responses occur at different phases.
Treating all of them as “retry” can send changed content, duplicate a message,
cross provider accounts, generate a new protected action, or silently claim an
unknown attempt failed. Fragment fallback also produces combinations that were
never reviewed.

## Decision

Every recipient/channel-step receives one durable semantic intent identity. An
external-delivery step then crosses one durable prepared-message boundary before
provider I/O; an `in_product` step instead appends its local `available` event
and role-safe projection and never creates provider preparation, provider bytes,
provider identity, provider state, or provider outcome. The producer supplies
one bounded opaque token for exactly one intended recipient/channel-step
occurrence slot; fan-out uses independent tokens. The server derives an
occurrence-slot hash and enforces one
permanent unique `(scope kind, scope owner, environment, occurrence-slot hash)`
row. In the same transaction it locks that slot, separately derives and compares
a versioned semantic-identity hash and a complete immutable-command hash, and
returns prior work only when both hashes and all schema versions match. Any
mismatch hard-conflicts; legitimate successor work requires a new producer-
authorized slot token. Preparation then freezes the exact
source/fact snapshot, relations and ordering, contract/plan step, audience,
locale and fallback trace, content, Brand Kit, Role Layout, compiler/formatter,
protected-action reference, subject, HTML/text, recent-copy posture,
sender/reply/connection revisions, permanent internal provider-message identity,
and member payload hashes. A request-level Resend idempotency key does not exist
until the exact one-member or batch provider-submission envelope is sealed.

The prepared-delivery artifact is encrypted restricted execution material,
separate from history and Recent sent copy. Its closed associated-data schema
binds scope/environment, preparation/schema/material hash, key version and exact
recipient/profile revisions. A subordinate immutable provider submission
envelope seals the exact endpoint, account/credential, request bytes, one
request-level idempotency key, and an ordered recipient-member map before
external I/O; its distinct associated-data schema binds the submission/request/
member-map identity rather than one member's preparation id. Before sealing,
every member MUST have the same exact scope kind, scope owner, environment,
delivery account/connection/credential, domain, sender/reply authority,
safety/latency class, and endpoint capability. Mixed membership is rejected
before artifact decryption, envelope creation, or external I/O. Any component or
owner mismatch fails decryption. One-member and strict 2–100-member batch
requests use the same Phase 6 queue and per-recipient truth. Mapping uncertainty
is indeterminate. Batch disablement may select governed one-member submissions
only before any batch envelope is sealed and before any external/provider I/O.
Once an envelope is sealed—or submission may have begun—recovery reconciles
that exact sealed envelope as one unit and never splits, rechunks, rekeys, or
replays its members. A permitted pre-seal one-member fallback does not change
semantic identity.

Every contract maps each delivery step to one closed material posture. An
external-delivery step maps to a prepared-artifact retention class; the initial
external classes are required email with a 30-day ceiling and optional staff
email with a 7-day ceiling. An `in_product` step maps to the explicit
`prepared.none@1` sentinel, which is not an artifact class and structurally
creates no prepared artifact or provider bytes. At external seal, the server
freezes the earliest class, intent/utility, protected-action,
and source-owned deadline; it can never move later, and a batch uses its earliest
member deadline. Exact acceptance, terminal definite rejection, terminal
no-send, the end of the provider idempotency window for an indeterminate request,
or the frozen deadline immediately removes decrypt/adapter authority. Primary
ciphertext, wrapped keys, and plaintext-capable caches purge within 24 hours,
while hashes and body-free provider truth remain. An unknown outcome may remain
unknown after purge, but it cannot authorize replay or restoration.

Recovery distinguishes three states:

1. **Unprepared:** the contract may choose another complete, immutable,
   currently compatible publication through the existing resolver.
2. **Prepared and definitely unsubmitted:** execution may retry the identical
   frozen payload only while current safety, consent, authorization, and
   transport fences still pass.
3. **Provider submission may have begun:** the outcome is indeterminate until
   signed provider evidence or bounded reconciliation proves accepted or
   rejected. It MUST NOT rerender, choose fallback, change account/identity, or
   issue a new occurrence slot, semantic identity, or provider-submission key.

For that third state, only exact `concurrent_idempotent_request`, typed
`provider_5xx`, and `network_or_timeout` without contradictory evidence permit
an identical same-key provider call. One sealed envelope permits at most two
follow-up HTTP calls after the initial call, total, with bounded full-jitter
backoff, valid `Retry-After`, live safety/decrypt reproof, and both the earliest
member deadline and provider-idempotency-window ceiling. The endpoint, bytes,
order, headers, account/credential, member map, and key remain identical; this
does not create a new attempt ordinal. Mapping uncertainty, idempotency-payload
conflict, malformed/unknown/contradictory evidence, and provider-contract drift
are reconcile-only and cannot call the provider again. Exhaustion remains
**Delivery outcome unknown**, never a new-key replay.

Failure ownership is typed: producer truth, message contract/publication,
presentation dependency, recipient/consent/permission, Phase 6 dispatch, and—
for external delivery only—matching-scope Resend connection or provider outcome.
A compatible prior/system publication may recover only before channel
materialization (external preparation or local in-product availability) and only
when the exact message contract authorizes whole-message fallback. Quarantine affects precise future
resolution or submission scopes. Proof-gated backlog recovery resumes only
still-eligible unprepared work, prepared work proved definitely unsubmitted, or
work proved definitely rejected when the exact contract permits that new
attempt. It records per-recipient results. Completed or accepted,
no-longer-applicable, still-blocked, and indeterminate work is excluded;
indeterminate submission is reconciled under its frozen identity and is never
bulk replayed. Staff use one grouped repair surface keyed by root cause rather
than one alert per recipient.

The resolver order is fixed: normal complete candidate, one compatible prior
candidate when contract-authorized, remaining complete candidates under the
published fallback policy, one compatible protected Asym system default when
explicitly authorized, independent sibling steps, then truthful stop. Content
never fragment-mixes. Quarantine has exactly `New preparation only` and
`Revoke unsubmitted` effects, resolved by safety epoch plus dispatch-state CAS.
Publish-and-resume preflight partitions eligible unprepared,
prepared-definitely-unsubmitted, contract-permitted definitely rejected,
completed, inapplicable, blocked, and indeterminate work; success and unknown
submission are never replayed.

## Consequences

- Provider idempotency is a secondary transport safeguard, never the permanent
  product identity or proof of rejection.
- Restoring content creates a new draft/publication and affects future work; it
  never mutates prepared or historical communication.
- Recovery metrics and UI expose definitely unsubmitted, accepted, rejected,
  indeterminate, blocked, quarantined, reconciled, and resumed counts truthfully.
- Bounded provider-material retention preserves retry only while it remains safe
  and useful; it never turns durable communication evidence into a body archive.
- Crash-point, timeout, duplicate-event, stale-proof, partial-batch, quarantine,
  retention/erasure race, resume, and no-blind-replay tests are release blockers.
