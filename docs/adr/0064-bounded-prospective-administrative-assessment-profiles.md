# Bounded prospective Administrative Assessment Profiles

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

See [ADR-0082 — Source-mode-honest Noncash Support Realization](./0082-source-mode-honest-noncash-support-realization.md).
