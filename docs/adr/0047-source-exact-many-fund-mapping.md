# ADR-0047: Source-exact, provider-bounded many-fund mapping

**Status:** Accepted (founder ruling, Phase 20 grill session — D6)

> Working record:
> `docs/prds/sitestacker-parity/phase-20-accounting-exports-reconciliation-decision-log.md`

## Context

Missions organizations may have hundreds or thousands of donor-facing
Designations. Those Designations are source truth, but they are not
automatically general-ledger accounts, donor-restriction classes, QBO Classes,
Products/Services, Locations, or Projects, or Xero Tracking Options or
Projects.

One-to-one provider mirroring is valid for some tenants but cannot be the
universal model. QBO capability and list capacity depend on subscription and
configuration. Xero has two active Tracking Categories, recommends bounded
option counts, and constrains tracking-based reporting. Conversely, mandatory
summary-only posting would deny tenants legitimate accounting detail.

A free-form mapping precedence engine would be flexible in appearance but
would make outcomes difficult to explain and prove. Blank fallthrough,
recursive groups, provider-name matching, automatic provider-object creation,
or a silent `Other` target could create balanced but wrongly classified books.

## Decision

Asym preserves every source-owned Designation exactly and adds one bounded,
provider-neutral projection: the **Accounting Reporting Target**. Each included
Designation allocation resolves exactly once under one immutable,
effective-dated **Designation Mapping Version**:

- to one Accounting Reporting Target; or
- to a proof-gated evidence-only disposition when D4 policy and the active D5
  Posting Profile explicitly permit provider-level summarization.

`Needs mapping` is a derived blocking exception, not a valid fallback. A target
used by one Designation is presented as exact; a target shared by multiple
Designations is presented as grouped. Exact and grouped therefore use one
resolver and one data model. Targets are one level only and cannot recursively
contain other targets.

The mapping version may contain explicit and bulk-authored assignments and one
optional, visible new-Designation policy: use one named target when the frozen
accounting policy proves compatibility, or require finance mapping. CRM
hierarchy and attributes may filter or suggest draft assignments but never
remain live runtime rules. Resolution provenance is retained.

Accounting Reporting Targets cannot change source identity, donor restriction,
recognition, accounting basis, canonical account role, functional expense,
currency, amount, accounting date, tax treatment, or source lineage. Provider
bindings remain destination-scoped and typed. D7 and D8 define the certified
QBO and Xero carrier matrices; D6 does not make their object types
interchangeable.

Every Accounting Release pins one mapping version and an immutable **Mapping
Coverage Manifest** in the same atomic freeze as its source snapshot. The
manifest proves that every allocation is represented exactly once and records
its resolution, provenance, safe identity snapshot, semantic roles, grouping
key, provider carrier binding, and governing policy, profile, recipe, mapping,
compiler, and provider-contract versions. It reconciles exactly to the D4
Source Coverage Manifest and Canonical Accounting Effect.

Provider catalogs are imported by stable destination-scoped identifiers.
Provisioning missing provider objects is an explicit previewed, resumable,
idempotent operation with per-object outcomes and readback. Partial
provisioning never activates a partial mapping. Rename, archive, type,
capability, subscription, or destination drift creates actionable attention;
Asym never remaps by name or silently substitutes another carrier.

Activation is prospective and atomic. Existing and in-flight releases stay
pinned. Rollback creates a successor version; referenced Designations, targets,
bindings, and versions retire rather than disappear. One authorized finance
actor may activate without mandatory dual approval, while tenants may add a
second-approver policy.

The staff experience is one exception-first workspace reached through
**Accounting → Posting profile → Fund mapping**. It shows exact, grouped,
evidence-only, and needs-mapping coverage by count and monetary exposure,
supports searchable cross-page bulk assignment, explains what remains exact in
Asym, previews provider capacity and reporting consequences, and uses one
review-and-activate action. Healthy mappings remain quiet.

## Consequences

- Tenants may use exact, grouped, or policy-authorized provider-summary
  representation without losing source-level traceability.
- Provider constraints influence only the downstream representation, never
  source truth or accounting meaning.
- High-cardinality tenants can keep selected funds exact and group the
  remainder without a rules engine.
- New Designations follow one visible named-default-or-require-review policy;
  no silent `Other`, unrestricted, or suspense destination exists.
- Provider migration carries semantic targets and source coverage but requires
  destination-owned provider rebinding; raw provider identifiers are not
  portable.
- Provider-object provisioning, mapping activation, delivery, and
  reconciliation remain separate durable truths.
- The system does not provide recursive reporting groups, ranked precedence,
  formulas, live CRM-derived mapping, per-release overrides, automatic
  provider-object creation, mapping by mutable name, or recurring approval.
