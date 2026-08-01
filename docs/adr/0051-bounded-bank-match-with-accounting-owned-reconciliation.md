# Bounded Bank Match with accounting-owned reconciliation

**Status:** Accepted (founder ruling, Phase 20 grill session — D10)

Phase 20 will provide one informational, source-labelled, allocation-safe
**Bank Match** between immutable **Expected Bank Arrivals** and posted
**Bank Evidence Observations**. Every tenant can use reviewed statement imports
or explicit staff-confirmed evidence; a certified read-only bank connection is
optional acceleration only. Deterministic automation may link exact evidence,
but it never declares accounting reconciliation. QuickBooks Online or Xero
always owns final bank reconciliation, period comparison, and close.

This boundary is deliberate. Stripe payout status and trace references help
locate an expected transfer but do not prove bank posting. Imported and
connected bank observations have different provenance and can be delayed,
modified, removed, duplicated, or superseded. QuickBooks distinguishes
matching downloaded activity from reconciling an account to its statement, and
Xero does not expose public API support for reconciling bank-statement lines.
Asym therefore helps finance staff answer whether processor or offline-deposit
expectations agree with observed bank evidence without becoming a bank
register, bank-feed product, general ledger, or accounting close system.

Bank Match supports exact one-to-one, many-to-one, one-to-many, and partial
allocations under Tenant, Legal Entity, bank-account binding, currency,
direction, posted-state, integer-minor-unit, no-over-allocation, and
no-double-consumption invariants. Amount, date, or description similarity may
rank candidates but cannot silently prove a link. Ambiguity, stale evidence,
pending activity, later mutation, and residual amounts remain visible,
cause-coded review work. Evidence and corrections are append-only.

Direct connectivity is not a launch prerequisite. It may be enabled only after
an opt-in, production-shaped certification demonstrates sufficient
institution coverage, freshness, consent and reconnect behavior, mutation
handling, security, supportability, and measurable reduction in staff rekeying.
The core domain remains provider-neutral, and statement import plus staff
confirmation remain complete fallback lanes.
