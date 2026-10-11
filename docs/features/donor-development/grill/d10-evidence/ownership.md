# D10 ownership, identity and evolution evidence

2026-10-10. Research appendix for the founder's **B: add, retire and reorder
organization-approved stages** selection. Proposed safeguards below are not a
ratified amendment, formal specification or implementation. Governing checkout:
`225c02e9499bd6c0d493223cd4b1a4120ff787e3`; D1–D9 interview evidence is read from the
current working tree. Root's consolidated interpretation controls. No runtime,
hosted database, issue state or deployment was qualified by this appendix.

## Evidence and authority

| Ref | Exact source                                                                                                                                                                                                                                                                                                                                                                                            | Established fact and limitation                                                                                                                                                                                                                                                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| E1  | [ADR-0001:62–88](../../../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md:62); [CRM OpenSpec:48–64](../../../../../openspec/specs/crm-core/spec.md:48)                                                                                                                                                                                                                                       | Asym owns CRM truth; identities remain distinct, tenant-scoped, with server-owned metadata changes. This does not prescribe a stage schema.                                                                                                                                                      |
| E2  | [P27 roadmap:4087–4103](../../../../prds/sitestacker-parity/roadmap.md:4087), [4119–4133](../../../../prds/sitestacker-parity/roadmap.md:4119); [retained constraints:17–49](../../../../prds/program-roadmap/owner-constraints.md:17)                                                                                                                                                                  | One shared enrollment, organization-approved presets, history, native next action or actionable exception; P27 owns cultivation meaning. Customization was explicitly open. Stage is neither access nor financial truth.                                                                         |
| E3  | [P9 A12:484–494](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:484); [ADR-0136:30–42](../../../../adr/0136-organization-owned-ministry-assignments-and-separated-support-access.md:30)                                                                                                                                                                              | Party/assignment/portfolio ownership remains P9; cultivation is never Party lifecycle. Ministry identity has exact Tenant/Legal Entity scope.                                                                                                                                                    |
| E4  | [P12:1542–1554](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1542), [1595–1601](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1595), [1652](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1652); [ADR-0044:55–58](../../../../adr/0044-canonical-legal-entity-financial-boundary.md:55) | Capabilities, exact source scope and one resolver govern authority; names never authorize. Exercising a capability differs from administering grants. Tenant is the outer boundary. These sources do not define a P27 preset-edit capability or require every preset to be entity-owned.         |
| E5  | [P11:175–189](../../../../prds/sitestacker-parity/phase-11-custom-fields-custom-collections.md:175)                                                                                                                                                                                                                                                                                                     | Useful existing precedent: stable IDs, same-meaning rename, different meaning as new option, retirement preserving existing values, presentation-only reorder. This is a custom-field contract, not authority to implement P27 as a custom field or import its entire deletion/migration engine. |
| E6  | [D1:7–15](../phase27-d1-review.md:7); [D2:17–53](../phase27-d2-adversarial-review.md:17); [D3:20–64](../phase27-d3-adversarial-review.md:20)                                                                                                                                                                                                                                                            | Continuing exact-purpose partnership; prayer/financial participation can coexist. A preset, assignee or surface does not justify another ordinary journey. Changed ministry/purpose and corrected identity remain distinct.                                                                      |
| E7  | [D4:23–65](../phase27-d4-adversarial-review.md:23); [decision log D5–D8:50–53](../phase27-grill-log.md:50); [D7:45–68](../phase27-d7-adversarial-review.md:45); [D9:13–31](../phase27-d9-recorded-stage-review.md:13)                                                                                                                                                                                   | Deliberate admission, existing accountable lead/work, qualified pause/closure and same-journey return remain binding. Reopening retains historical stage without compulsory reassessment, fabricated dates or automatic effects.                                                                 |
| E8  | [P28:4163–4185](../../../../prds/sitestacker-parity/roadmap.md:4163); [retained P28:55–59](../../../../prds/program-roadmap/owner-constraints.md:55)                                                                                                                                                                                                                                                    | Support-raising preset and terminal/suppression requirements survive; Never Ask belongs to consent. P27/P9/finance/communication owners retain their facts. Legacy labels are not proof of a final mutually exclusive stage list.                                                                |
| E9  | [DON-14:1651–1677](../../../../prds/workflow-studio/07-core-workflow-catalog.md:1651), [DON-15/16:1689–1753](../../../../prds/workflow-studio/07-core-workflow-catalog.md:1689); [WS-18-CORE:299–305](../../../../prds/workflow-studio/09-implementation-backlog.md:299); [acceptance:1295–1329](../../../../prds/workflow-studio/10-acceptance-scenarios.md:1295)                                      | Source-accepted transitions, allowed configuration and source protection; bindings unresolved, default disabled, slice not started, tests specified not executed. Stage configuration does not activate recipes.                                                                                 |
| E10 | [ADR-0183:24–36](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:24), [71–100](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:71); [P34 boundary:4048–4050](../../../../prds/sitestacker-parity/roadmap.md:4048); [workflow OpenSpec:13–30](../../../../../openspec/specs/workflow-orchestration/spec.md:13)                                 | Configuration/pipeline position alone does not admit shared work. Sources own outcomes; executors do not. P34 owns configurable automation vocabulary; native P27 remains independent.                                                                                                           |
| E11 | [Original request:103–109](</workspace/attachments/9b86445f-5040-4a77-b0d1-d8508fc53404/Pasted text.txt:103>); [Q10 boundaries](../phase27-q10-stage-customization.md)                                                                                                                                                                                                                                  | Preserve stable stage identities/history and expected-version changes; no arbitrary workflow language. Selected customization does not settle transition gates, final labels, new preset creation or ordering semantics.                                                                         |

## Adversarial concerns and exact requirements

Likelihood below is conditional engineering judgment, not measured incidence.
“Inherited” means enforce an existing boundary; “proposed” makes B's permanent
product behavior concrete and belongs in the amended decision if adopted.

### O1 — Configuration rewrites donor or ministry truth

**Critical; likely if labels drive business effects.** E2/E3/E6/E8 distinguish
stage from Party lifecycle, asks, participation, commitments and consent.
**Inherited requirement:** “Stage configuration and selection cannot establish
another owner's fact, grant authority, admit cultivation automatically, or
close/reopen work.” **Proof:** rename a stage “Never Ask,” “Financial Partner,”
“Closed” or “Appointment Completed”; no corresponding consent, payment, closure
or completed-task fact appears. Names are insufficient evidence, not forbidden
words requiring a semantic-policing engine.

### O2 — Rename becomes historical semantic corruption

**High; likely when IDs or integrations use labels.** E5/E11 separate identity,
display and meaning. **Proposed clarification:** “Same meaning with better words
may keep its identity; a materially different meaning uses a distinct stage
identity. Preserve the earlier meaning and any separately authorized movement.”
No requirement to freeze every spelling in all historical displays or snapshot
every record. **Proof:** harmless rename preserves references; changing
“Exploring partnership” to “Giving regularly” cannot reinterpret old assessments.

### O3 — Retirement forces progression or strands current work

**High; likely with delete/cascade or active-only joins.** E7/E11 preserve old
stage even on return. **Proposed exact policy:** “Retired stages are unavailable
for new selection; existing assignments/history remain interpretable. Retirement
does not force a replacement, reassessment or lifecycle change and does not
block unrelated authorized work.” **Proof:** active, paused and closed journeys;
D8 return; existing saved filters; no new selection into retired stage. Existing
references alone are not a reason to prohibit retirement forever.

### O4 — Reordering fabricates progress, duration or contact

**High; medium if rank is treated as state.** E2/E7/E11. **Inherited requirement:**
“Adding, renaming, retiring or moving display position is not an enrollment
transition, assessment, meaningful contact or stage-aging reset.” Stage order
does not silently become mandatory sequential progression. **Proof:** reorder
the whole list; recorded stage dates, obligations, contact recency and accepted
history stay unchanged. Exact duration/reporting definitions remain open.

### O5 — Tenant configuration becomes cross-entity authority

**Critical; medium with broad admin shortcuts.** E3/E4. **Inherited requirement:**
“Use the exact registered configuration capability and source applicability;
configuration rights do not grant enrollment mutation, protected usage counts,
history or other entity access.” Tenant-owned presets need not be cloned per
Legal Entity; entity-bearing enrollments retain their scope. **Proof:** two
Tenants, two entities, configuration-only versus record-edit actors, revoked
actor, restricted impact count. Exact capability/bundle and applicability remain
owner qualification, not a guessed grant or new approval committee.

### O6 — Retirement races selection or loses concurrent edits

**High; medium without shared source checks.** E11 requires expected versions;
E1/E4 require authoritative server commands. **Required safeguard:** “Accept a
configuration change and its required history together; stage selections prove
current applicable eligibility at acceptance. Stale conflicting edits return a
truthful conflict, not last-write-wins.” **Proof:** retirement versus selection
in both orders; concurrent reorder/rename; retry after lost response. Do not
prescribe an event-sourcing platform, global Tenant lock or version table here.

### O7 — Supplied template update overwrites organization choices

**High; medium during reseeding/upgrades.** E2/E7/E11 require approved presets and
preserved meaning. **Proposed requirement:** “A supplied-template update cannot
silently overwrite tenant customization, reinterpret history or move existing
journeys. Adoption uses the qualified configuration path.” **Proof:** upgraded
starter template against untouched and customized presets, interrupted adoption,
retry and rollback. Whether harmless text updates can be automatically offered
or applied remains open; no publishing studio or recurring approval ceremony is
required by these sources.

### O8 — Live consumers silently retarget retired IDs

**High; medium once imports/reporting/Studio consume stages.** E5/E9.
**Required safeguard:** “Consumers bind to stable source identity and admitted
meaning, not text or rank. Determine the exact affected use; preserve valid
historical queries and reject obsolete fresh-selection targets.” **Proof:**
renamed label, same label with different IDs, retired filter versus retired
transition target, stale imported value and delayed recipe. No nearest-name
mapping, blanket destruction of saved reports or universal workflow shutdown.

### O9 — Flexibility creates another workflow or ownership engine

**High; medium with configurable required fields/actions.** E6/E9/E10.
**Inherited requirement:** “Stage-list configuration supplies approved stage data,
not arbitrary predicates, scripts, timers, probabilities, permission grants or
task/outreach recipes.” Native source follow-through remains independent of
optional Studio; DON-14–16 use separately qualified source events/commands and
shared effect identities. **Proof:** all stage operations work with Studio off;
configuration events do not masquerade as accepted enrollment transitions.

### O10 — Multiple presets become multiple conflicting stage authorities

**High; medium across staff and missionary views.** E2/E6. **Inherited
requirement:** “A surface or preset preference alone cannot create another
ordinary journey or independently writable competing stage.” **Proof:** staff
and missionary open the same authorized journey; each sees source-qualified
meaning, no second state created. Exact preset assignment/switching and
cross-preset reporting are still product choices; do not invent equivalence
maps or universal funnel percentages to conceal them.

## P28 reconciliation: retain requirements without importing false semantics

E8's mixed legacy vocabulary remains a requirement inventory, reconciled by the
later exact D1–D9 decisions. “Partner-Financial/Special/Prayer” cannot impose
exclusive participation or progression toward money (D3). “Not Interested” and
“Unresponsive” do not alone prove whole-journey closure (D7). “Never Ask” remains
the consent owner's restriction; editing or retiring its display cannot lift it.
Appointment/referral facts remain their source facts, even if they inform
relationship progress. This determines ownership, **not** a replacement preset,
new participation table or rewritten P28 acceptance contract. Final owner-approved
labels and interaction with these facts require reconciliation before shipping.

## Simpler alternative and remaining decisions

The strongest simpler alternative is Q10 A: retain supplied structures and permit
same-meaning wording changes, using existing asks/tasks for detail. It minimizes
configuration and reporting variation, but the founder explicitly chose broader
missions flexibility. B is a credible bounded permanent choice; do not smuggle
A back through a universal fixed-stage mapping or make every extra stage require
engineering/manager approval. Actual agency workflows still need validation.

Keep open: exact preset applicability/assignment and creation; switching presets;
initial-stage and transition requirements; reversible retirement/restoration and
any explicit replacement operation; qualified seed adoption; cross-preset
reporting and stage-duration meanings. None requires a generic migration engine,
parallel permission system, per-person pipeline, or whole-phase implementation
before accepting the bounded decision.

**Disposition:** accept B with explicit identity/meaning, retirement, concurrency,
source-independence and safe-update safeguards. O2/O3/O7 contain concrete proposed
policy refinements; other requirements mainly enforce inherited boundaries.
This appendix contributes ownership evidence to the root's 22-category review;
it does not claim those categories or P27 delivery are independently complete.
