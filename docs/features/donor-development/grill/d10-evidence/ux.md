# D10 evidence — flexible organization stage sets

**2026-10-10 UTC.** The founder selected organization-controlled addition,
retirement and reordering, beyond wording-only customization. This appendix
supports **B with bounded safeguards**; it does not reinstate A, introduce formal
specifications or claim implementation. Proposed amendments require the parent
review's disposition. No vendor application or ministry-user pilot was executed.

## Direction and strongest alternative

Offer a straightforward **Stage settings** editor for an approved preset: names,
short guidance, Add stage, reorder controls and Retire. Show unapplied changes,
a concise consequence summary and one deliberate Apply changes action. Reuse the
existing settings/form system; no workflow canvas, mandatory manager approval,
per-edit justification essay or separate configuration product.

Wording-only customization remains the strongest smaller alternative: fewer
configuration choices and simpler cross-organization comparisons. It also cannot
represent a genuinely different stage set. The founder has chosen that flexibility;
requiring every custom stage to map back to an immutable vendor-like progression,
or requiring developer intervention for ordinary list edits, would thinly reverse
B. Standard presets should remain useful starting points, not compulsory live
masters. These are product judgments, not measured adoption findings.

Keep configuration distinct from reassessing a partnership. Adding a stage does
not place anyone in it; retiring one does not erase recorded understanding;
reordering does not prove progress. Tasks, individual asks, prayer/financial
participation, consent and enrollment lifecycle retain their existing owners.
D10 does not choose transition prerequisites or configurable automation.

## Current Core anchors

Inspected 2026-10-10:

- [Q10 boundaries](../phase27-q10-stage-customization.md) explicitly separate
  stage-list customization from transitions, requirements and permissions.
  [D9](../phase27-d9-recorded-stage-review.md) preserves last-recorded stage and
  retired historical meaning without compulsory reassessment on return.
- [P27 roadmap](../../../../prds/sitestacker-parity/roadmap.md:4087) requires shared
  approved presets and history. The
  [prototype CRM enum](../../../../../packages/database/collections/admin-workspace.ts:35)
  is fixed sales vocabulary, in a demo collection; it is not the P27 configuration
  authority or a migration inventory.
- [BusinessHoursForm](../../../../../apps/admin/features/support-hub/components/settings/business-hours/BusinessHoursForm.tsx:50)
  demonstrates local unapplied form state, dirty detection and explicit save.
  It is a UI precedent, not a qualified preset publication or concurrency contract.
- [UI rules](../../../../../packages/ui/AGENTS.md:57),
  [accessibility review](../../../../ai/skills/accessibility-review/SKILL.md:22)
  and [touch guidance](../../../../ai/skills/emil-design-engineering/touch-accessibility.md:46)
  require shared Base Maia/Base UI, meaningful labels/focus/error states and 44px
  touch hit areas. Source inspection is not an accessibility pass.

## Fresh primary evidence

Every URL below was retrieved/read **2026-10-10**. Dates are publisher dates,
not search crawl times. Undated/current SaaS documentation does not identify a
pinned installed release. No comparator establishes the best missions stage set.

| ID  | Official source, edition/date                                                                                                                                                                                                                                                                           | Fact and limit                                                                                                                                                                                                                                                                                        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E1  | Salesforce platform [Manage Picklist Values](https://trailhead.salesforce.com/content/learn/modules/picklist_admin/picklist_admin_manage), undated; [Keep historical values](https://help.salesforce.com/s/articleView?id=000384482&language=en_US&type=1), published **2026-05-14**                    | Generic picklists distinguish display labels from programming names; deactivation preserves existing values while removing new choices. Supports identity/retirement separation, not a Core schema or identical behavior in every Salesforce field.                                                   |
| E2  | Salesforce Classic/Lightning Opportunity [Edit or Delete Stage Names](https://help.salesforce.com/s/articleView?id=000384827&language=en_US&type=1), published **2026-04-02**                                                                                                                           | Opportunity stage-name changes use create/replace; replacement changes current records while historical stage values remain. Multiple sales processes require Enterprise or above. This specific field differs from generic picklists. Not an integrated Nonprofit journey policy or NPSP evidence.   |
| E3  | HubSpot CRM [Manage object pipelines](https://knowledge.hubspot.com/object-settings/set-up-and-customize-pipelines), updated **2026-09-08**, general guidance with plan-dependent features                                                                                                              | Supports add/edit/reorder and explicit Save; exposes internal identifiers; Used in references block deletion. Conditional properties and automation are separate settings. Useful comparable separation, not permission to copy its probability, Won/Lost or rule engine into Core.                   |
| E4  | Pipedrive web [Design your sales process](https://support.pipedrive.com/en/article/how-can-i-customize-my-pipeline-stages), updated **2026-09-03**, deal-admin configuration                                                                                                                            | Provides editable starter stages and Save changes. Warns stage deletion also deletes deals; moving deals between pipelines affects reporting. **Reject the destructive deletion model.** Vendor advice about fewer stages is guidance, not empirical Asym adoption evidence.                          |
| E5  | Virtuous CRM+ [Customize Gift Ask Statuses](https://support.virtuous.org/hc/en-us/articles/360051735651-How-Do-I-Customize-Gift-Ask-Statuses), article API edited **2025-07-02**                                                                                                                        | Admins configure named statuses, enabled state and ordering, then Update Settings. Only statuses unassigned to asks may be deleted. Does not prove disabled in-use asks remain visible. Closure/probability semantics concern asks. Contradictory Closed-status cardinality wording is not relied on. |
| E6  | RE NXT web [Configure Opportunity Statuses](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-opportunity-status-configure.html), undated                                                                                                                                       | Configuration includes lifecycle/counting mappings and open-status overdue thresholds; Review precedes Save. Illustrates reporting consequences and reviewable settings. Does not establish every add/delete operation or justify copying these mappings/clocks.                                      |
| E7  | CiviCRM APIv4 [Option Lists](https://docs.civicrm.org/dev/en/latest/api/v4/pseudoconstants/), latest developer guide, undated                                                                                                                                                                           | Separates option IDs, names and labels, with localized label retrieval. Useful identity/presentation precedent. It does not specify immutable Core identities, stage revisioning or a stage-management interface.                                                                                     |
| E8  | Contentful web [Hide field when editing](https://www.contentful.com/help/fields/hide-field-when-editing/), undated                                                                                                                                                                                      | Hiding a field leaves API content present; hiding is not editing authorization; hidden required fields can still block publication. CMS analogy only: visibility, validity and permission differ. Core retirement must not create a hidden blocker on unrelated work.                                 |
| E9  | WCAG 2.2 AA [Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html), updated **2026-08-10**; [Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), **2026-05-11**                                                              | Reordering needs a single-pointer alternative to dragging; keyboard support alone does not satisfy that requirement. WCAG minimum is 24 CSS px or applicable exceptions; Core's 44px touch guidance is stronger.                                                                                      |
| E10 | WCAG AA [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), updated **2026-09-06**; [Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), **2026-05-11**; [GOV.UK Error summary](https://design-system.service.gov.uk/components/error-summary/), undated | Require accessible layout/feedback; error guidance links to correctable fields with consistent messages. They do not mandate a new wizard, approval role or persistence engine.                                                                                                                       |

## Graded concerns and exact proposed clauses

Severity/likelihood are qualitative risk judgments, **not observed incident rates**.
E/R facts above support the reasoning; all Core clauses below are proposals.

| Concern                                    | Grade; evidence; answer effect                                           | Exact bounded correction                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------ | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| U1 — Flexibility becomes a workflow engine | High / plausible; Q10, E3/E6; retain B                                   | “Organization-authorized configuration may add, retire, reorder and describe stages. This does not configure permissions, contact eligibility, financial outcomes, required actions or transition rules. Personal pipelines and a workflow builder are not introduced.”                                                           |
| U2 — Retirement loses or strands work      | High / plausible; D9, E1/E4/E5/E8; amend retirement                      | “Retire prevents new selection while preserving existing recorded stages, history and valid unrelated work. It does not move or close journeys, complete tasks or require immediate reassessment. A subsequent stage change uses its own authorized source action.”                                                               |
| U3 — Rename disguises a new meaning        | High / plausible; E1/E2/E7; preserve real customization                  | “Labels and ordering are not identity. Preserve the definition applicable to historical stage facts. A genuinely different meaning uses a new stage rather than rewriting old assessments; ordinary wording corrections need no ceremonial approval. Human judgment, not automatic prose comparison, determines semantic intent.” |
| U4 — Reorder fabricates progress/reporting | High / plausible; E2/E4/E6; separate configuration from events           | “Configuration changes do not create relationship transitions, refresh assessment dates, reset time in stage or change ask/financial outcomes. Reports identify the relevant preset/definition; equal labels or positions do not prove equal meaning across tenants or presets.”                                                  |
| U5 — Apply overwrites concurrent work      | High / plausible; explicit Save precedent E3/E5; qualify application     | “Editing remains unapplied until one authorized save against the current configuration revision. Show a concise change summary. Stale saves preserve input and require reconciliation, not silent overwrite; response-loss recovery must not duplicate accepted changes.”                                                         |
| U6 — Unsafe migration/default updates      | High / plausible; E1/E2/E4; preserve tenant control                      | “Core template improvements do not silently overwrite approved tenant sets or move existing journeys. Adoption identifies the affected preset and changes. Any reassessment/remapping of existing records is a separately explicit, authorized operation with preserved provenance, not a side effect of Apply.”                  |
| U7 — Excessive admin friction              | Medium / likely if overbuilt; E3/E5 and local form precedent; simplify B | “Use one ordinary settings editor with Add, Retire, reorder, Apply and Cancel. Do not demand a bespoke permission model, multi-person sign-off, record-by-record migration, workflow canvas or mandatory explanation for routine list changes.”                                                                                   |
| U8 — Configuration leaks protected usage   | High / plausible; existing P12 boundary; qualify preview                 | “Configuration authority does not grant access to affected supporters or history. Preview only permitted aggregate/detail facts. Retirement cannot depend on exposing hidden records or an unauthorized count; unknown verification is not zero usage.”                                                                           |
| U9 — Drag-only/desktop-only editing        | Medium / high exposure; E9/E10, Core rules; accessibility gate           | “Provide visible Move up/down or equivalent tap/click controls and keyboard operation, with retained focus and announced position. Support narrow layouts, zoom and touch targets. Color, hover, drag and animation are never the only carriers of meaning.”                                                                      |
| U10 — Locale/name collisions               | Medium / plausible; E7; preserve scoped identity                         | “Support Unicode and long translated labels; distinguish choices within the displayed preset without requiring globally unique English names. Locale, label or transliteration changes never alter identity. Show contextual guidance where labels could be confused.”                                                            |
| U11 — Offline or failed saves look applied | High / plausible; E10 and network inference; honest recovery             | “Display unapplied, saving, applied, failed or unresolved status truthfully. Preserve safe editing input after recoverable failure; recheck current authority on return. Do not promise offline activation or put protected usage results in browser drafts. Normal refresh recovers authoritative settings without realtime.”    |

For U2, existing records can show **Retired stage — last recorded** with their
original evidence. Retired choices remain available to permitted historical
filters; removing them from new-choice menus must not drop their records from
counts or conceal active work. Unrelated updates must not fail merely because an
unchanged stage is retired. Removing an unused unsaved row is different from
retiring a used definition; this choice need not add hard deletion of published
stages or automatic reactivation.

For U3/U6, a small revision-aware settings model is sufficient in principle;
no branch/merge UI, universal template registry or per-record preset fork follows.
Showing current wording in operational views can coexist with reconstructible
historical wording/meaning. The exact display rule should be explicit. The
suggested safe default is no automatic current-record remapping and no platform
push that replaces tenant choices; this is **our inference**, not a documented
cross-vendor standard.

## Minimal interaction and proof

Start from the selected organization preset. Show its active list and a compact
retired section. Use plain controls and short guidance explaining that list edits
do not reassess relationships. Apply shows relevant effects in the same context;
Cancel discards unapplied edits. Do not force a second confirmation for every
keystroke or a separate approval workflow. Reordering a definition and moving a
partnership card are visibly distinct operations.

Before release, obtain these **application proofs**, not merely source snapshots:

1. Add, rename and reorder; existing assessments, timestamps, tasks and money are
   unchanged. Historical definitions remain reconstructible after repeated edits.
2. Retire an in-use stage across active, paused and closed work; new choices omit
   it, permitted existing/history views retain it, and normal task/owner work and
   D9 return remain usable. No automatic reassessment or duplicate journey occurs.
3. Rename similar-looking labels in different tenants/presets and switch locale;
   identifiers, report scope and historical meaning remain correct. A changed
   label is neither a grant nor a consent fact.
4. Two administrators edit concurrently; disconnect before/after server acceptance,
   retry and revoke authority. Show a truthful result, retain recoverable input
   and accept no stale overwrite or duplicate configuration effect.
5. Offer a changed Core starter template; tenant choices remain intact unless
   deliberately adopted. Any separately authorized record mapping preserves prior
   stage history and never fabricates a performed assessment.
6. With hidden supporters, configuration preview discloses only allowed facts.
   Counts/drill-downs include retained retired-stage records under matching scope.
7. Complete add/retire/reorder/apply/cancel with keyboard, screen reader and touch,
   at 320 CSS px, zoom, RTL and long labels; verify focus, errors and saving status
   with a slow connection. Test pointer-only reorder without dragging.
8. In a fictional ministry pilot, staff distinguish stage-list changes from an
   individual ask, task and actual partnership reassessment. If they cannot,
   revise labels/help rather than removing the selected tenant flexibility.

No empirical benefit, performance limit, accessibility conformance or activation
readiness is claimed. This note edits only the research appendix; sources were
read, not exercised against live records.
