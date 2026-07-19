# ADR-0028: Body-free history with an expiring recent copy

**Status:** Accepted (founder ruling, Phase 17 grill session — D14)

> Full record: `docs/prds/sitestacker-parity/phase-17-system-messages-template-management.md`
> (ratified decision D14).

## Context

Staff need enough evidence to answer “what was sent?” without turning the
communication ledger into an indefinite searchable archive of donor PII,
protected links, payment information, or restricted ministry data. Provider
history is temporary and cannot be product authority. Official receipts and
statements already belong to their producing domains.

## Decision

Durable `communication_events` remain body-free. They retain the stable catalog
classification or contract-proven safe title, the exclusive scope owner
(`tenant_id` XOR `platform_scope_id`), conditional tenant site/Party references
or platform recipient/authority references, channel, requested and effective
locale, fallback trace, publication and dependency pins, prepared
identity/hashes, provider outcome evidence, timestamps, and audit—never the
resolved personalized body or ordinary personalized subject.

Eligible **tenant-scoped** email classes may create one separate encrypted,
recipient-specific, support-safe recent sent copy at preparation. Before
persistence, a typed projection structurally removes credentials, protected
destinations, payment secrets, staff-only/care/restricted facts, unsafe headers,
and other contract-forbidden values. Security-sensitive classes may require
zero storage. The tenant chooses 30 days (recommended), 7 days, or Off, bounded
by the contract's shorter maximum. Expiry is authoritative immediately even if
physical purge is asynchronous.

Platform-scoped messages in this generation are always `no_readable_copy` and
MUST NOT create a recent-copy row. Their permanent history remains body-free
and service-only. A future readable platform copy requires a separately
ratified service-owned retention, encryption, authorization, support-access,
and purge policy rather than inheriting tenant controls.

The copy is subordinate evidence, not communication truth, retry payload,
official artifact, provider log, search/export corpus, or legal archive.
Viewing requires current tenant, role/capability, exact recipient Party and
contact-revision authority, permitted source/site authority, privacy
classification, restriction/erasure state, and unexpired copy authority. It
creates a content-free audit event. Source access alone is insufficient.
Reclassification, restriction, erasure, recipient-authority loss, or permission
loss denies future reads and can trigger priority purge. Restore procedures
reapply expiry, erasure, recipient authority, and restriction ledgers before any
copy becomes readable.

## Consequences

- Communication history stays useful after expiry through pins, hashes,
  outcomes, and approved-design preview without recipient values.
- The UI distinguishes available, expired, disabled, never captured, restricted,
  purged, and legacy-without-copy states without implying delivery certainty.
- Tenant copies are encrypted with tenant-bound context and are never
  deduplicated across recipients or tenants; the platform branch retains no
  readable copy.
- Retention, expiry race, restore, erasure, access revocation, support reveal,
  batch isolation, and forbidden-value tests are release blockers.
