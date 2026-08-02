# ADR-0115: Purpose-owned Phase 21 records schedules and exact tenant custody exports

**Status:** Accepted (founder ruling, Phase 21 grill session — D26)

## Context

Phase 21 creates durable Field Account, support-cycle, expense, compensation,
reimbursement, authorization, collaboration, correction, audit, and handoff
records. Some include sensitive receipt, card, travel, payroll, location, and
restricted-worker evidence. Tenants need understandable records guidance and
repeatable exact exports for ordinary custody, audit, migration, and
offboarding, but different record purposes and jurisdictions impose different
clocks, preservation duties, privacy ceilings, access limits, and disposal
conditions.

A universal retention period, mutable per-record expiry, generic database dump,
or `download means transferred` shortcut would be legally and technically
unsound. Conversely, a tenant-authored legal-rules engine, eDiscovery suite,
WORM archive, or connector marketplace would make Asym harder to operate while
still failing to prove the tenant's obligations. Phase 18 already established
purpose-owned records schedules for generated documents, and Phase 29 is the
future owner of private-byte lifecycle execution. Phase 21 needs a domain-
specific application of that pattern with exact open-format tenant custody
exports and explicit ownership boundaries.

## Decision

> **C-prime-amended-and-hardened (C-prime-R) - one source-purpose-,
> record-family-, jurisdiction-, Legal-Entity-, and relationship-where-material-
> owned catalog of immutable, qualified-review-backed Phase 21 Records Schedule
> Contracts with one quiet safe default and only bounded prospective tenant
> bindings; exact typed triggers, preservation floors, privacy ceilings,
> access/use limits, copy classes, holds, recovery, export, and verified-
> disposition semantics; immutable per-record resolutions and complete successor
> impact coverage; and Phase-29-only private-byte custody for Phase-21-owned
> evidence and D26 export packages, including copy inventory, package staging,
> hold/disposal execution, backup and restore suppression, and authorized
> delivery under Phase 3/10/12 egress authority. Independently owned artifacts,
> including Phase 18 generated documents, retain their owner-domain exact-byte
> and lifecycle authority and enter D26 only by authorized reference or
> retrieval. Every currently
> authorized tenant can repeatedly export exact Phase 21 records and policy
> history as contextual human/print copies or one source-watermarked,
> manifest-complete, open-format Records Export Package per Legal Entity, with a
> one-action tenant-wide fan-out, canonical JSONL, bounded spreadsheet-safe CSV,
> accessible PDF/HTML, authorized original artifacts, exact relationships,
> applicable contract/binding and service-document versions, ordered verifiable
> parts, integrity digests, truthful omissions and owner-domain references,
> append-only residual recovery, a short governed repeatable-download window,
> and a separately governed final offboarding snapshot-plus-delta and records-
> only retrieval window. Download, print, tenant external-copy assertion,
> verified destination custody transfer, Asym-held retention, legal hold,
> termination, and copy-specific disposal remain independently authoritative:
> none implies another, changes a source schedule, releases a hold, or proves
> legal sufficiency. The tenant remains responsible for determining its
> applicable organizational obligations and securing, validating, retaining,
> recovering, and disposing copies in its custody; Asym remains responsible for
> its actual statutory, contractual, security, processor/service-provider,
> export-fidelity, hold, return, deletion, backup, provider-copy, and published
> commitments for copies in its custody. Guidance is source-linked,
> jurisdiction-labelled, review-dated, and explicitly informational, with no
> compliance warranty, individualized legal advice, liability-shifting checkbox,
> tenant-authored legal DSL, arbitrary timer, casual forever, floor weakening,
> unsupported privacy-ceiling breach, direct delete, download-as-transfer,
> export-triggered disposal, paper-as-universal-original claim, silent partial
> package, proprietary hostage format, generic database dump, reusable evidence
> URL, email attachment, broad restricted-person export, cross-owner deletion or
> universal-history claim, giant transaction/archive, Phase 30 export ownership,
> launch-time connector sprawl, restore resurrection, or disclaimer purporting
> to erase Asym's own duties.**

### Domain and execution ownership

Phase 21 owns its closed record-family catalog, purpose and schedule meaning,
prospective tenant bindings, immutable per-record resolutions, successor-impact
coverage, export selection, package schema, and coverage-manifest truth. Phase
29 alone owns the physical lifecycle of Phase-21-owned evidence and D26 package
bytes: copy inventory, package staging and delivery, holds, disposal execution,
provider-copy outcomes, backup treatment, and restore suppression. Phase 18
retains semantic and exact-byte ownership of its generated documents; D26 may
include them only through authorized owner-domain reference or retrieval. Phases
3, 10, and 12 own governed projection,
classification, restricted-subject handling, authorization, step-up, and
egress. Phase 30 remains inbound only; Phase 31 owns any optional certified
external-destination adapter; Phase 38 owns privacy-request orchestration.

The tenant owns its organizational purpose, jurisdiction and classification
facts, professional-advice decisions, and external copies. Asym remains
responsible for duties and promises applicable to copies in its custody. A
disclaimer or checkbox cannot erase or transfer either party's actual duties.

### Schedule resolution

One qualified, immutable Records Schedule Contract Version specifies typed
triggers, preservation floors, privacy ceilings, access/use limits, copy
classes, holds, recovery, export, and verified disposition for a closed record
family. One deterministic non-stacking tenant binding may prospectively select
a supported reviewed variant. Each record pins the exact resolved contract and
binding versions. Later change uses an immutable successor and complete impact
manifest; it never silently changes prior evidence. Legal hold is monotonic and
independent of export, termination, and ordinary disposition.

The closed launch families cover Field Account and support-cycle truth; expense
and downstream financial lineage; sensitive source bytes and derivatives;
compensation/reimbursement/accounting handoff artifacts; authorization,
collaboration, audit, hold, export, and disposition evidence; and transient
staging, parser, OCR/AI, cache, package, and diagnostic material.

### Export package

Every authorized tenant receives a complete browser-download and print path.
One tenant-wide request fans out to one sealed Records Export Package per Legal
Entity under a tenant index. Canonical JSONL, bounded formula-safe CSV,
accessible PDF/HTML, authorized original artifacts, stable opaque identifiers,
exact relationships and corrections, ISO currencies and integer minor units,
applicable policy/service-document versions, deterministic parts, and integrity
digests make the package portable and independently verifiable.

Its Coverage Manifest assigns every selected record exactly one disposition:
exact inclusion, human-readable projection, owner-domain reference, current-
authority exclusion, restricted separate-package requirement, lawful prior
disposal, quarantine/unavailability, or not applicable. Only a closed manifest
is **Ready**. **Ready with issues** is honest partial output and may receive an
append-only residual package. A sealed package is never mutated.

Package preparation is asynchronous, chunked, streaming, resumable, and
tenant-fair. A reviewed short staging window governs only prepared package
bytes. Expiry never removes source records, policy history, manifest evidence,
or the ability to request another currently authorized export. Final
offboarding uses snapshot plus bounded delta and a separately governed records-
only retrieval window.

Download, print, Tenant External Copy Assertion, Verified Destination Custody
Transfer, Asym retention, legal hold, termination, and copy-specific disposal
remain independent. No export starts disposal or releases a hold. Optional
destination delivery is Phase 31 scope and requires exact destination identity,
least privilege, write/readback, integrity, ambiguity-safe recovery,
revocation, residency, and exit proof.

### Experience and activation gate

Authorized staff use one quiet **Settings → Records & exports** surface and the
staff-facing term **Records policy**. The UI starts with a recommended
configuration and plain `kept because` and `starts from` explanations, then
reveals technical/legal detail progressively. Healthy records create no
missionary noise or recurring task. One archive flow chooses scope, reviews
families and restricted lanes, prepares asynchronously, and downloads/prints
or records external custody. Exact copy labels avoid false claims such as
`Safely archived`, `Transferred`, or `Deleted everywhere`.

Production activation is blocked until qualified legal, privacy, security,
product, provider, backup, public-policy, MSA/DPA, and runtime evidence agree.
This includes `apps/donor/openpolicy.ts`, its evidence map, lifecycle jobs,
storage/provider behavior, backup and restore handling, and offered tenant
choices. Accessibility, security, isolation, integrity, recovery, scale, and
representative-nonprofit comprehension tests are release criteria.

**Phase 21 D27 precision amendment (2026-08-02).** D27 creates no seventh
records family. Durable Release Generation, Adoption Plan, Go-Live Readiness
Manifest, consequence-review, activation-operation, and containment evidence
resolve under D26's authorization/audit/evidence family. Replaceable shadow
working data and diagnostics resolve under D26's transient staging/preview/
diagnostic family; any sealed proof referenced by a readiness manifest is
durable audit evidence. D27 containment preserves currently authorized D26
records access and custody export unless an independently authoritative legal
or security restriction forbids that access.

## Consequences

- Tenants receive useful guidance and exact portable custody copies without
  Asym promising individualized legal advice or pretending a download is a
  custody transfer.
- Purpose-specific schedules and immutable resolution preserve record meaning
  across policy, provider, jurisdiction, and tenant changes.
- Complete manifests and open formats prevent silent partial exports and
  proprietary lock-in.
- Separating domain meaning from Phase 29 execution prevents Phase 21 from
  becoming a storage, backup, or deletion engine.
- Browser download remains complete at launch; optional destinations do not
  create connector sprawl or a hard dependency.
- Implementation is intentionally blocked until current legal copy and actual
  lifecycle behavior are reconciled; documentation alone does not prove the
  controls exist.
- D1-D25 remain binding and unchanged.

## Alternatives rejected

- **One fixed period or mutable expiry timestamp.** Rejected because triggers,
  jurisdictions, purposes, copy classes, holds, and privacy ceilings differ.
- **Tenant-authored retention DSL or free-form timers.** Rejected because it
  creates legally unsafe, untestable, and operationally expensive behavior.
- **Download, print, or checkbox as verified transfer.** Rejected because none
  proves destination identity, integrity, acceptance, recovery, or custody.
- **Export-triggered source deletion.** Rejected because export, retention,
  hold, termination, and disposal are independent authorities.
- **Generic database dump or PDF-only archive.** Rejected because neither
  preserves typed meaning, relationships, exact versions, originals,
  corrections, omissions, or independent verification.
- **Phase 21-owned byte lifecycle or Phase 30 outbound transport.** Rejected
  because Phase 29 owns private-byte mechanics and Phase 30 is inbound only.
- **Launch-time destination connector portfolio.** Rejected because a complete
  browser lane exists and uncertified connectors increase privacy, ambiguity,
  retention, residency, and exit risk.
- **Disclaimer that transfers all responsibility to the tenant.** Rejected
  because it cannot erase Asym's actual legal, contractual, security, provider,
  deletion, backup, or published duties.

## Related decisions and evidence

- [ADR-0038 — Purpose-owned records schedules and verified disposal](./0038-purpose-owned-records-schedules-and-verified-disposal.md)
- [ADR-0099 — Claim-level expense truth and purpose-routed tenant AI](./0099-claim-level-expense-truth-and-purpose-routed-tenant-ai.md)
- [ADR-0101 — Immutable Support Cycle statements](./0101-immutable-support-cycle-statements-with-automatic-tenant-publication.md)
- [ADR-0103 — File-first organization-card evidence](./0103-file-first-organization-card-transaction-evidence.md)
- [ADR-0106 — Reconciled Field Account opening position](./0106-reconciled-field-account-opening-position-and-operational-cutover.md)
- [ADR-0114 — Exact, cause-owned Expense Claim resolution](./0114-cause-owned-expense-claim-resolution.md)
- [ADR-0116 — Evidence-gated Core Field Accounts production
  activation](./0116-evidence-gated-core-field-accounts-production-activation.md)
- [Phase 21 decision log](../prds/sitestacker-parity/phase-21-field-accounts-decision-log.md#d26--purpose-owned-phase-21-records-schedules-and-exact-tenant-custody-exports)
- [D26 research evidence](../prds/sitestacker-parity/phase-21-mission-dashboard-product-research-evidence.md#d26-decision-research---purpose-owned-phase-21-records-schedules)
- [Phase 1 source-of-truth ownership matrix](../prds/sitestacker-parity/phase-01-source-of-truth-ownership-matrix.md)
- [OpenPolicy evidence map](../ai/OPENPOLICY-EVIDENCE-MAP.md)
