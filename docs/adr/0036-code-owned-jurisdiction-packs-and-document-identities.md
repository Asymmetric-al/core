# ADR-0036: Code-owned jurisdiction packs and document identities

**Status:** Accepted (founder rulings, Phase 18 grill session — D7 through D12)

> Full record:
> `docs/prds/sitestacker-parity/phase-18-receipt-pdf-template-system.md`
> (ratified decisions D7 through D12).

## Context

United States charitable acknowledgments and Canadian official donation
receipts have materially different issuer, content, valuation, numbering,
signature, correction, and records requirements. A tenant-configurable legal
rules template would make invalid combinations representable. Separate products
would duplicate authoring, rendering, accessibility, batching, custody, and UX.

The public identity of a U.S. acknowledgment is also not the same contract as a
Canadian official receipt serial. Treating both as a generic per-tenant receipt
number would add unsupported gapless and replacement behavior.

## Decision

Run separate immutable, code-owned jurisdiction packs over the one shared
Document Studio kernel. One verified legal issuer per tenant selects the pack;
Site, donor address, locale, currency, template, staff choice, payment provider,
and delivery route never select jurisdiction. A future jurisdiction requires a
reviewed pack extension, not a tenant rules language.

The U.S. federal acknowledgment pack covers complete everyday monetary, annual,
quid-pro-quo, eligible intangible-religious-benefit, ordinary noncash/stock/
digital-asset, DAF/pass-through, QCD, and correction cases from source-owned
facts. Uncommon duties become append-only, evidence-gated **Specialist Document
Obligations** with a closed purpose, owner, deadline provenance, evidence, and
one next action. The product does not claim universal federal forms, state tax
compliance, or legal advice.

Each logical U.S. acknowledgment receives one short operational reference in
the exact display form `ACK-XXXXX-XXXXX`. The token contains ten unbiased
uppercase Crockford Base32 characters from 50 CSPRNG bits, is globally unique
across retained native chains, and is collision-retried only for its named
uniqueness constraint. It encodes no tenant, donor, year, Site, amount, or
authority and never authorizes access. A correction retains the base and creates
the next immutable `vN` publication. A fundamental source-owned issuer,
recipient, or purpose change creates a related new chain.

The Canadian registered-charity pack is absent and inert unless an authorized
administrator deliberately starts and completes a four-task, issuer-specific,
proof-gated activation. Nonparticipants receive no Canadian UI, rows, queries,
jobs, fields, exports, warnings, alerts, donor friction, or meaningful cost.
The active pack natively covers cash/noncash crossed with advantage/no advantage,
individual and nonoverlapping cumulative cash coverage, ordinary Quebec
presentation where approved, and formal cancellation/replacement. Processing
bank payments and incomplete or unsupported cases issue no official receipt.

One full Canadian registration account owns one fixed native series:
`R-000001`. `R-` is code-owned; the positive integer uses a six-digit minimum
display width, grows without an artificial ceiling, and never resets. A short
issuer-local transaction atomically re-proves authority and reserves the next
serial for one frozen idempotent issuance intent. Rendering occurs outside the
lock. Every committed serial is permanently non-reused and has a truthful
disposition. Exact copies retain their serial and bytes. A formal replacement
receives a new serial, cites the cancelled predecessor, and becomes current only
after its validated artifact is ready.

Canadian activation must prove a safe initial series position for that exact
issuer without building a general external-history importer. If safe continuity
cannot be established, activation blocks and routes to qualified specialist
review.

The exact Canadian issuer also owns one immutable, effective-dated **Authorized
receipt signer** authority: one current signer and at most one ready successor.
The jurisdiction pack renders the protected visible imaged-signature block with
real accessible signer name/title text. The sanitized private PNG/JPEG mark is
not a Brand Kit asset, template field, export, or cross-tenant resource. Every
issuance re-proves signer authority. Already issued bytes never change after
rotation; a replacement uses the signer current at replacement issuance.

Exact-byte digest, length, write-once object generation, read-back, issuance
pins, retention, and any purpose-required WORM proof provide artifact integrity.
Every canonical artifact's SHA-256 joins the platform's existing shared,
append-only, externally anchored audit-checkpoint capability. Its checkpoint
coverage is truthfully `anchored` or `unanchored_pending`. Delayed anchoring
leaves the artifact, issuance, receipt currentness, and authorized access
unchanged; it alerts the accountable owner and reconciles idempotently until the
same hash is anchored. Anchoring never rewrites bytes, reissues a receipt,
changes a serial or signer, or promotes a different current artifact.

Phase 18 does not create a signing, sealing, certificate, or per-receipt key
service; require tenant PKI; or label a checksum or platform proof as the human
signer's digital signature. Canadian production and delivery remain dark until
the exact federal and, where applicable, Quebec legal, finance, records,
security, accessibility, and operational package receives qualified current
review.

## Consequences

- Tenant freedom remains broad in layout, branding, typography, locale, and
  safe supplemental content, but legal blocks, calculations, issuer, identity,
  serial, signer, eligibility, and correction meaning are protected.
- U.S. `ACK-… · vN` and Canadian `R-…` are explicitly different fields and
  lifecycles. No generic gapless allocator or base-number-plus-version rule
  governs both.
- Predictable or opaque references are locators only. Every read, search,
  download, print, and resend reauthorizes tenant, issuer, purpose, Party, role,
  current state, and artifact.
- Staff never type, reset, select, fill gaps in, or repair a Canadian serial;
  never choose a legal case; and never choose a signer in a template.
- External checkpoint delay is an evidence-coverage exception, not an artifact,
  issuance, receipt-currentness, or access failure. Reconciliation and owner
  alerting never create a second PDF-integrity or signature system.
- Qualified authority review, golden legal fixtures, coverage constraints,
  concurrency, replacement, exact-copy, tenant-isolation, records, accessibility,
  and nonparticipant-zero-impact proofs are release blockers.
