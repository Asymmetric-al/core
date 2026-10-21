# ui-quality-audits normative contract clauses

A section is binding only when the matching requirement unconditionally references
it. A proposed or historical section does not become accepted by residing here.
The reference, requirement identity, scenarios, and normal source-authority rules
form one contract. Preserve all clauses; see openspec/contracts/README.md.

<!-- prettier-ignore-start -->

<a id="contract-7aab1c5a8227bf2da9b4"></a>

## Each Application Category Has An Independent Score Floor

<!-- BEGIN CONTRACT {"id":"7aab1c5a8227bf2da9b4","name":"Each Application Category Has An Independent Score Floor"} -->

Core SHALL protect all six categories of each deployed application independently
using verified raw assessment percentages. An aggregate or application-level
improvement SHALL NOT hide a category regression. Missing or unassessed categories
SHALL fail even when their configured floor is zero. A 100-point application or
category floor SHALL require every applicable scored point, not rounded totals.
Activating an application's overall floor at 100 SHALL also reject unresolved
advisory assessments for rules with positive point values in any of its
categories. Existing raw category floors SHALL retain their current protection.
Zero-point advisory results SHALL remain visible for separate verification.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->
