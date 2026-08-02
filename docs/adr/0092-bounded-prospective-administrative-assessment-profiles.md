# ADR-0092: Bounded prospective Administrative Assessment Profiles

**Status:** Accepted (founder ruling, Phase 21 grill session — D3)

Phase 21 starts every Tenant and Legal Entity with an explicit immutable
**No administrative assessment** profile. A charging policy must be activated
prospectively by an authorized tenant actor; missing configuration never acts
as a financial rule. The supported catalog is deliberately bounded to no
assessment, source-family percentages, percentage with a monthly minimum
and/or cap, fixed monthly assessment, percentage plus a fixed monthly service
component, and scoped exemption or negotiated-account treatment. Profiles do
not stack, and one deterministic specificity model resolves exactly one
profile before selecting a source-family treatment inside it.

The specificity order is exact Field Account, exact worker-classification plus
lifecycle-stage combination, one non-conflicting matching single-axis
assignment, then Legal-Entity/currency default. Worker classification and
lifecycle stage share one rank; different same-rank winners block the affected
account until the tenant supplies an explicit combination. Source family is a
finite frozen source identity inside the winner, never another stackable
profile.

D19 interprets the worker-classification and lifecycle-stage selectors as an
explicit, prospective, source-labelled assessment-applicability context for one
Support Assignment/Field Account scope. They are never inferred from current
Support Assignment Participant Memberships, participant count, workspace
access, or relationship labels. An absent axis does not match and the resolver
continues to the next explicit assignment; conflicting explicit same-rank
values retain D3's existing block-until-combination behavior.

Gift-linked percentage effects and monthly effects remain different
occurrences. A source-linked percentage uses the exact Gross Support Allocation
and reverses from its original frozen coverage. For D21, that Gross Support
Allocation can arise only after an exact Noncash Support Realization Manifest
freezes its Realized Support Basis and D2 admits it. D3 never assesses the
original noncash value, FMV, appraisal, estimate, sale price, brokerage or
liquidation cost, or another intermediate disposition fact; it assesses only
the resulting Gross Support Allocation. A minimum, cap adjustment, fixed amount,
or service component belongs to one immutable monthly
**Assessment Period Determination** and is remeasured through append-only
correction. An assessment never rewrites contribution, Designation, receipt,
processor-cost, Field Account balance, payroll, or Accounting Release truth;
the transparent relationship is gross support minus separate assessment equals
support credited.

Assessment Period is monthly even when Support Cycles are biweekly. Source
percentages are rounded from exact covered allocations; one separate period
adjustment owns a minimum top-up or cap credit, and fixed or service components
remain period effects. Zero-support-month charging is disabled unless the
tenant explicitly enables it, partial first or final periods default to
proration with bounded full or waived choices, and successors activate only at
a complete future period boundary after a side-effect-free preview.

Exactly one Support Cycle Close owns the initial Assessment Period
Determination: the first successfully committed close in strict contiguous
close order whose exact through boundary reaches or passes the Assessment
Period end. That close freezes the covered percentage total from only
source-linked percentage effects whose underlying Gross Support Allocations are
D2-admitted through unique Support Cycle Admission Coverage and whose
source-effective instant falls within the exact half-open interval
`[period_start, period_end)`. Its captured ingestion boundary proves which facts
were available to the close; the Determination excludes every provisional or
unqualified fact and never widens the Assessment Period, even when a delayed or
consolidated close captures facts source-effective after `period_end`. The close performs a
compare-and-swap against the immediately preceding committed boundary; a
later-boundary candidate cannot commit while an earlier boundary remains open.
The complete Tenant, Legal Entity, Field Account/assignment scope, currency,
and Assessment Period form the semantic idempotency and uniqueness key. The
Determination records the one resolved Profile Version, but that version does
not partition uniqueness. A delayed or consolidated close qualifies only when
its manifest proves it is the next contiguous boundary and completely covers
the intervening interval. Retry is exact replay; a concurrent or later close
cannot create another initial determination. Late-qualified in-period source
facts use append-only successor effects without moving ownership or rewriting
the original. Exact-boundary, delayed-close, and frozen partial-period cases use
the same rule. Production proof must exercise an allocation exactly at
`period_start`, one exactly at `period_end`, and a delayed close whose captured
ingestion boundary includes next-period allocations; it must prove start-
inclusive/end-exclusive totals, next-period exclusion, exact retry replay, and
append-only correction for a late-qualified in-period allocation.

When Phase 21 D17 admits certified assessment history, it must cover one
complete, non-overlapping Assessment Period Determination, including the exact
partial-period policy selected above and every minimum, cap, fixed, service,
source-linked, reversal, and correction component. “Complete” means complete
under that frozen D3 period contract, not necessarily a full calendar month.

Staff use one guided, preview-first assessment-policy surface with prospective
successors, winner explanations, production-shaped impact proof, and
exception-only review. Tenants may choose a bounded honest missionary
presentation and explanatory label, but a nonzero assessment remains visible
in exact detail and immutable statements. A tenant with no assessment sees no
assessment setup burden or zero-value missionary UI. This design rejects an
arbitrary rules DSL, numeric priority editor, retroactive re-rating, stackable
fees, hidden netting, misleading availability language, and per-clean-entry
approval.

See [ADR-0110 — Source-mode-honest Noncash Support Realization](./0110-source-mode-honest-noncash-support-realization.md).
