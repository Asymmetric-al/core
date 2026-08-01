# ADR-0038: Purpose-owned records schedules and verified disposal

**Status:** Accepted (founder ruling, Phase 18 grill session — D14)

> Full record:
> `docs/prds/sitestacker-parity/phase-18-receipt-pdf-template-system.md`
> (ratified decision D14).

## Context

Immutability does not mean permanence. Official PDFs, issuance evidence, source
facts, validation evidence, access evidence, and temporary render material have
different legal and operational purposes. One expiry column can destroy required
records too early, while “keep everything forever” enlarges privacy and security
risk. User access revocation, fundraising-use restriction, legal retention,
holds, and physical disposal are distinct actions.

## Decision

Every Document Purpose Contract binds one reviewed, effective-dated,
code-owned **Records Schedule Contract**. The initial closed model distinguishes
seven obligations: canonical artifact/official duplicate; issuance identity and
lifecycle evidence; source-owned financial facts; template/render validation
evidence; delivery/access/security evidence; privacy/hold/disposal evidence; and
temporary authoring/render material. Incident records remain with the existing
incident authority.

Each obligation names its owner, authoritative typed trigger, preservation
floor, privacy ceiling where applicable, permitted bounded tenant extension,
custody/location, access/use restriction, hold behavior, recovery behavior, and
verified disposal requirements. An unexplained floor/ceiling conflict becomes
**Needs records review** with restricted access; it never guesses deletion or
silent indefinite retention.

Records preserve the schedule version and trigger facts used at creation. A
later law, policy, or provider change creates one bounded impact set and a
qualified-reviewed, effective-dated successor contract. Its idempotent
recalculation command carries the expected prior schedule version; duplicate
delivery returns the same transition and a stale version fails without changing
records. Each affected record retains its prior schedule/version/trigger evidence
alongside the successor result. The transition never silently rewrites history
or leaves affected records on an obsolete rule forever. A shortening enters the
ordinary access restriction, grace, final current-rule/no-hold reproof, and
verified disposal lane; it never immediately mass-deletes.

Access, use, retention, hold, and disposal are independent axes. Removing an
account or marketing purpose can immediately revoke portal/grant access and
convenience data while required exact evidence remains in least-privilege
custody. Retention never authorizes fundraising reuse. An exact issued PDF is
retained or disposed; it is never redacted and represented as the same artifact.

Holds are monotonic safety controls with typed basis, exact scope, accountable
owner, evidence reference, start, review-due date, and explicit release. Review
dates escalate but never auto-release. Hold placement and the irreversible
disposal boundary serialize on the same tenant/record guard.

One quiet permissioned **Records** disclosure shows the controlling purpose and
authority, resolved trigger and dates, schedule version, and plain-language
explanation. A records administrator may choose only a bounded extension
enumerated by that contract, submitting its documented basis and expected
schedule version; apply or explicitly release an authorized scoped hold; and
export tenant- and issuer-scoped custody/disposition evidence. Every accepted
change records its actor, authority, basis, controlling schedule version, prior
and resulting dates, and time. The server rejects stale-version changes, floor
weakening, unsupported or unbounded/**forever** extensions, per-document timers,
direct object deletion, and any privacy-ceiling breach without a separately
reviewed lawful basis.

Disposal is a tenant-isolated, idempotent, resumable lifecycle: restrict access;
observe the bounded safety window; perform a final current-rule and no-hold
compare-and-set; destroy exact primary and derived versions through owner
adapters; await or suppress immutable backup copies; verify; then record minimal,
PII-light, separately scheduled proof. Every restore replays the forward-only
suppression journal before product reads or workers reopen. The system never
claims stronger physical destruction than its provider evidence proves.

The retained disposal proof has a closed allow-list: record class, tenant/issuer,
schedule version, reason code, operation and time, copy-class outcomes, and only
the narrow D11 disposition needed to prevent serial reuse. It excludes names,
addresses, amounts, filenames, storage paths, rendered content, raw Party IDs,
and raw hashes. Provider payloads and operational diagnostics cannot widen the
proof. The proof itself binds its own bounded Records Schedule Contract; it is
not retained forever by default.

Phase 18 disposes only its artifacts, previews, derivatives, and evidence. It
coordinates with—but never cascades into—Phase 7 facts, the Phase 13 ledger,
Phase 17 communication history, Party identity, restricted-person truth, or any
other owner's records. Canadian custody and offboarding requirements are absent
for nonparticipants.

An exact Canadian issuer cannot activate or continue new official-receipt
issuance until one finite, current records-readiness proof establishes all five
items: the required production primary and backup/recovery custody are located in
Canada rather than merely reachable from Canada; the production document and
register are readable; the approved production and recovery paths can decrypt
them; a representative restore reproduces readable exact bytes and governing
metadata; and an authorized tenant actor acknowledges, under a versioned record,
that use of Asym or another service provider does not displace the charity's
records responsibility. The proof is issuer- and environment-bound. Missing,
expired, indeterminate, or drifted evidence blocks only new affected Canadian
issuance with one repair action; it does not alter existing receipts or introduce
Canadian state for a nonparticipant.

Before ordinary application access ends for an activated Canadian issuer,
tenant closure must complete exactly one of two records outcomes: a verified
destination-custody transfer that preserves the exact issuer, immutable history,
holds, access restrictions, and readable records; or an explicit restricted
records-only custody agreement that preserves the same obligations. Until one
outcome is durable and verified, closure remains incomplete with one records-
owned repair action and cannot delete, strand, or silently move the records.
This closure gate and its UI, rows, queries, jobs, and alerts remain absent for
every Canadian nonparticipant.

## Consequences

- Ordinary users continue to see one document. Hidden replicas, recovery media,
  and WORM custody never appear as competing files.
- Permissioned staff receive one quiet **Records** disclosure and one grouped
  exception surface, not a retention matrix or records-management product.
- Records administrators receive only contract-enumerated extensions, scoped
  hold/release actions, and evidence export. Expected-version fencing and
  append-only basis evidence prevent stale or unaudited schedule changes.
- Direct object deletion, tenant-authored legal rules, casual forever, floor
  weakening, ceiling extension without reviewed basis, and delete cascades over
  official evidence are prohibited.
- Law/policy/provider changes use one reviewed, effective-dated, expected-version
  successor transition. Shortening never bypasses grace, final reproof, holds, or
  verified disposal.
- Disposal proof is limited to the explicit PII-light allow-list and follows its
  own bounded schedule; raw identities, content, locations, and hashes are not
  retained as proof.
- Storage, search, cache, export, backup, restore, tenant closure, key rotation,
  and provider-exit behavior must be proven on the actual architecture before
  irreversible disposal can launch.
- Canadian activation is release-gated on the finite primary/backup Canada-
  location, production readability, decryption, representative-restore, and
  tenant-responsibility proof above. Mere remote accessibility does not pass.
- Activated-Canadian closure cannot complete before one verified destination-
  custody transfer or explicit restricted records-only custody agreement
  preserves issuer, history, holds, restrictions, and readability.
- No generic eDiscovery suite, per-document timer, universal anonymizer,
  multi-cloud archive, blockchain proof, or duplicate file manager is created.
