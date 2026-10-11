# D18 — deliberately changing a saved partnership's process

Research appendix, **2026-10-10 UTC**. Scope: general deliberate list changes on
the same ongoing partnership versus correction-only changes. Both alternatives
already require recovery from a mistaken saved choice under D16/D17. This appendix
does not decide stage treatment, ratify a design or claim implementation. No
product runtime, practitioner interview, live mutation or sending action occurred.

## Finding and strongest smaller alternative

**Same-record process switching is a published CRM capability, but retaining the
record is not sufficient proof that its history keeps its meaning.** General
switching is a reasonable product choice when the supporter, identified ministry
and continuing purpose stay the same. It lets an organization change how it
manages ongoing work without fabricating a new relationship or calling a formerly
correct choice a mistake. This is product judgment, not measured ministry demand.

**Correction-only B remains credible.** It reduces process transitions to explain,
train and report, while D15 lets existing work continue on older lists. An agency
might therefore have no demonstrated need for broader switching. Its limit is
that a legitimate later process change has no truthful representation if the
original list was correct. Treating that change as a historical correction would
misstate what happened.

The strongest no-build alternative is **no general switching facility**, while
still providing the already-required safe correction path. “Leave mistakes as
they are,” raw administrator database edits, or delete/recreate are not equivalent
alternatives within the accepted decisions. A correction capability itself has
history, authority and stage-compatibility obligations; B does not remove them.

## Fresh primary evidence and qualification

Every linked source was opened on **2026-10-10**. Dates are publisher dates shown
on the retrieved pages; undated documentation is not a tested current release.
Short quotations are exact source text. No sources establish agency frequency,
user preference or the best cross-list stage policy for Asym.

| Source and edition/date                                                                                                                                                                                                                                                                                                      | Supported fact                                                                                                                                                                          | Limit for this decision                                                                                                                                                                        |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Salesforce Changing Record Types](https://help.salesforce.com/s/articleView?id=005132135&language=en_US&type=1), published **2025-12-29**, standard CRM help using Opportunity                                                                                                                                              | Describes how to “change the record type of an existing record” through its detail page.                                                                                                | Supports a deliberate edit on the existing record. It does not prove immutable historical semantics, unchanged automation, or that every object/type combination can change.                   |
| [Salesforce NPSP Required Configuration](https://help.salesforce.com/s/articleView?id=sfdo.npsp_required_config.htm&language=en_US&type=5), **undated**, Nonprofit Success Pack                                                                                                                                              | Record types associate opportunities with different process/stage collections; examples include grants, donations and major gifts.                                                      | Establishes nonprofit process variation. It does not turn Phase 27 into an opportunity, require an amount, or prove a missionary use case. NPSP is distinguished from current Nonprofit Cloud. |
| [HubSpot Manage records in board view](https://knowledge.hubspot.com/records/manage-records-in-board-view), updated **2026-09-09**, current board help, subscription conditions apply                                                                                                                                        | Describes editing existing records' properties, including Pipeline, and specifies availability for moving a record to another pipeline.                                                 | Supports existing-record process changes. It does not establish Core's stage treatment, bulk scope, audit guarantees or current exact single-record dialog.                                    |
| [HubSpot pipeline automations](https://knowledge.hubspot.com/object-settings/set-up-pipeline-automations-for-objects), updated **2026-09-02**, Sales/Service Hub, feature-dependent                                                                                                                                          | Configured stage-entry actions can create tasks, send internal notifications and edit records.                                                                                          | Shows concrete downstream effects that require checking. It does not say every pipeline change triggers every action, and it does not authorize new Core automation.                           |
| [HubSpot stage calculated properties](https://knowledge.hubspot.com/properties/stage-calculated-properties), updated **2026-07-15**, Professional/Enterprise features with object-specific limits                                                                                                                            | Values use “current and historical stage values”; each stage has separate properties, including entry/exit and duration calculations.                                                   | Demonstrates that movement and historical stage identity affect consumers. Its formulas, retroactive population, closure semantics and reporting guarantees are not adopted.                   |
| [Salesforce Field History Tracking Overview](https://help.salesforce.com/s/articleView?id=xcloud.tracking_field_history.htm&language=en_US&type=5), **undated**, platform help                                                                                                                                               | Tracking starts when enabled for a field and does not reconstruct earlier changes. The guide describes retention and other limitations.                                                 | A changeable field does not by itself prove complete durable history. Core must qualify its own accepted-history contract, without importing Salesforce retention or implementation.           |
| [Blackbaud Manage Opportunity Statuses](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-opportunity-statuses.html) and [Web or Database View](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-proposal-status-web-or-database-view.html), **undated**, Raiser's Edge NXT | Web view provides solicitation status history; database view can “manage only the current status.” The status guide also permits date edits and deletion of mistaken previous statuses. | Useful history/correction comparison, not a whole-list-switching precedent. Its blank-status, date-edit and deletion behaviors are not authorization to clear or rewrite Core history.         |
| [Shopify Templates](https://help.shopify.com/en/manual/online-store/themes/theme-structure/templates), **undated**, ecommerce/CMS help                                                                                                                                                                                       | Preview and assignment are separate; a saved product, collection or page can receive another template through an explicit assignment/save.                                              | Narrow UI analogue for changing configuration on the same resource. Theme templates do not establish CRM stage semantics, history retention, donor effects or permissions.                     |

**Source freshness caveat:** the old [HubSpot move-between-pipelines URL](https://knowledge.hubspot.com/records/move-a-record-from-one-pipeline-to-another)
redirected to the September board article when opened. Search still exposed a
May 28, 2026 version explicitly selecting both target pipeline and stage. That
older indexed dialog is not claimed as verified current behavior or adopted as
Core policy. The current canonical page supports the narrower claim above.

## Material concerns and exact minimal clauses

Likelihood is a qualitative risk judgment, not observed agency incidence.

### P01 — a process change disguises a different relationship

**High severity; plausible.** A missionary transfer, different supported ministry
or independent purpose might be mistaken for merely changing the process labels.
The reviewed CRM examples do not validate those domain changes.

**Clause:** “Changing a saved list preserves the same supporter, identified
ministry, continuing purpose and journey identity. A different list is not a new
partnership, merge, ministry reassignment or donor agreement.”

**Proof:** an illustrative agency adopts a clearer process for an existing church
partnership. Its same work record and linked history remain. A request that also
changes the ministry or purpose is not silently performed by this operation.
No source proves that this illustrative process change is common in agencies.

### P02 — matching labels create fictional continuity or progress

**High severity; plausible.** Two lists may both contain “Engaged” but mean
different things. Reinterpreting earlier entries under the new list can make a
change of working method appear to be donor progress, regression or giving.

**Clause:** “Retain the earlier list and stage meanings in history and distinguish
the accepted list change from development progress and correction of mistaken
data. Labels, display order and shared wording do not authorize stage mapping,
backdating, clearing a recorded assessment or invented intermediate stages.”

**Proof:** switch between lists with equal labels and different definitions, then
inspect current and historical reporting. The old entries retain their meaning;
the change does not become a conversion, new relationship or financial outcome.
Do not choose a duration formula here. The current-stage outcome must be settled
explicitly before switching can ship; D13's initial absence does not settle it.

### P03 — copied vendor mechanics trigger unrelated work

**High severity; plausible where consumers exist.** HubSpot documents real
stage-entry actions. A process edit reused as an ordinary progress event could
create duplicate tasks, send messages or imply a completed interaction.

**Clause:** “A list change alone does not create, complete, cancel or duplicate
follow-up, contact the supporter, change participation or financial facts, or
grant communication permission. Preserve existing owner-controlled work and
qualify any distinct authorized downstream effects through their source owners.”

**Proof:** inspect actual consumers and exercise switching with existing due work,
a prayer-only partnership and a contribution history. Only the qualified source
change and its required evidence occur. Do not add a new automation engine,
blanket task-review ceremony or global automation-disable toggle as the remedy.

### P04 — changing a usual list or retiring a list becomes migration

**High severity; plausible.** Configuration might retarget live work, or an old
attachment might be treated as permanent permission to switch back to a withdrawn
list. This would contradict D15/D17, not improve usability.

**Clause:** “A saved-work change is deliberate and separately authorized. Defaults,
list creation, retirement and restoration do not perform it. The chosen target
must be currently eligible and permitted; prior use grants no fresh attachment.”

**Proof:** change the organization default while a switch form is open, then
withdraw the selected target. No silent replacement occurs. A return to a former
withdrawn list is rejected under current source rules, while work still attached
to it retains D15's continued use. No extra applicability restrictions are added.

### P05 — a small edit becomes either opaque or ceremonious

**Medium severity; plausible.** A hidden generic field edit may conceal the stage
consequence. At the other extreme, compulsory essays or a multi-step approval
process would make routine correction burdensome without evidence of benefit.

**Clause:** “Make the current and intended list and the qualified stage consequence
understandable before one deliberate acceptance. Preserve useful input on failure
and distinguish unsaved preview, pending acceptance and the accepted result.
Keep correction and prospective change truthful without requiring a narrative.”

**Proof:** a staff member can explain what changes and what remains the same,
cancel without mutation, recover from a stale edit and reconcile an uncertain
retry without a second journey or a fabricated history entry. Existing history
and current permission rules apply equally in staff and missionary views.

## Evidence gaps and scope limits

No current MPDX/TntConnect source reviewed establishes general switching between
organization-approved cultivation lists; account merging and financial designation
changes would be misleading substitutes. No published evidence here determines
how frequently Christian sending agencies need prospective process changes.

Use actual authorized staff and missionaries to test an initial-list mistake,
a later valid process change, identical labels with different meanings and a
prayer-only church partnership. Ask them to explain the before/after record and
history. These are proposed tasks, not invented findings or numeric thresholds.

Paused/closed work, bulk migration, historical correction semantics, automatic
mapping and exact stage treatment remain unselected dependent policies. Keep the
implementation bounded to the chosen capability; neither source comparison nor
same-record identity alone resolves those questions.
