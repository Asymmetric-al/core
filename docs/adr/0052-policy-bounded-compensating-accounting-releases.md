# Policy-bounded compensating Accounting Releases

**Status:** Accepted (founder ruling, Phase 20 grill session — D11)

Phase 20 corrects released accounting only through a new, source- and
cause-linked **Compensating Accounting Release**. The original Accounting
Release remains immutable. A pinned, prospective, accountant-confirmed tenant
**Correction Posting Policy Version** supplies the permitted treatments and
periods; authorized finance staff may choose only among those permitted
options. If no treatment is permitted, or the issue may require a restatement,
material-error judgment, or locked-period exception, Asym blocks delivery for
accountant-owned resolution instead of backdating or silently choosing the
current period.

The correction preserves source-effective, discovery, accounting-effective,
and provider-posting dates independently and compiles through D4-D8's existing
canonical effects, Posting Profiles, mappings, Carrier Plans, immutable
artifacts, and mutually exclusive delivery lanes. QuickBooks Online or Xero
remains authoritative for period locks, accepted provider resources,
reconciliation, close, and the books. Provider preflight is advisory: QBO's
official close-date surfaces are not reliable enough to replace its closed-
period response, while Xero exposes lock dates but can still reject a write.

First-class direct delivery uses the provider-native resource selected by the
active Carrier Plan rather than forcing every correction through a generic
journal. Every operation retains an operation-granular QBO `requestid` or Xero
idempotency key, resolves unknown outcomes before retry, reads the exact
provider resource back, compares its accepted effect, detects later drift, and
retains the artifact lane when direct delivery is unavailable. Asym never
changes provider lock settings, stores a close password, determines GAAP
materiality, prepares financial-statement restatements, or becomes the general
ledger.
