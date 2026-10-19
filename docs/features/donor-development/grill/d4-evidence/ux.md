# D4 UX and current bulk-work practice evidence

Research/grooming only, 2026-10-09. Scope: founder selects deliberate authorized
human start of a journey, singly or in a reviewed group. D1, amended D2 and
ratified D3 remain binding. This appendix evaluates that selection; it does not
ratify D4, specify a new bulk platform, choose lifecycle rules or implement UI.
Current official sources were fetched for this pass. No donor was contacted,
product database modified, browser journey tested or performance statistic used.

## Recommendation and strongest alternative

**Retain deliberate entry with a minimal contextual flow.** A human should
understand that they are accepting accountable cultivation work, not perform a
second administrative ritual after recording a useful referral, ask or task.
Where the authorized supporter, ministry, purpose and needed follow-through are
already clear, one explicitly labelled action may start/reuse the journey and
save that work. If information is missing, ask only for what is needed. Do not
silently create a journey when a user merely saves a contact, opens a record,
receives a gift or records a note.

**Strongest alternative:** an organization-qualified rule can automatically
start/reuse ordinary work when repeatable source and responsibility conditions
are met. This can reduce repetitive selection; current Salesforce actionable
lists support adding newly matching records and future assignment rules. It also
needs policy configuration, current authority, stable source evidence and
correction/recovery. That is alternative B, not part of choosing A. A should not
be made deliberately clumsy to create demand for B. Existing saved views can
surface candidates without starting work; no mandatory candidate queue follows.

**No-build challenge within A:** Party, referral and shared-task work may be all
that is needed until deliberate cultivation begins. Do not force enrollment
setup merely to record these facts, require re-entry of existing data or create
a fictitious ministry. Once the user deliberately accepts the D1–D3 cultivation
responsibility, an authoritative journey is justified by its separate meaning.
It remains thin; no second Party, portfolio membership, task engine or donor
setup form is needed.

## Fresh official-source evidence

All sources below were retrieved 2026-10-09. Short excerpts establish the narrow
fact being used. Procedural documentation is not tested customer behavior.
Salesforce Fundraising here means the integrated **Agentforce Nonprofit**
(formerly Nonprofit Cloud) model, not NPSP. General Salesforce Bulk API training
is separately labelled; it does not prove the nonprofit list UI's behavior.

| ID  | Official source and date                                                                                                                                                                                                                 | Relevant fact / short excerpt                                                                                                                                                                                                                                  | Limits and Core consequence                                                                                                                                                                                                                                                                                                                                           |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1  | [Salesforce: Manage an Actionable List](https://trailhead.salesforce.com/content/learn/projects/fundraising-portfolios-with-actionable-lists/manage-an-actionable-list), integrated Fundraising; official sitemap lastmod **2026-10-06** | Manual selected-member flow says “Review & Save” then “Confirm & Save”; quick actions can add one or more records from record/list pages; preview details preserve list context. Also documents “Add Latest Records” and future assignment rules.              | Supports contextual deliberate selection and preview. Does not prove a mandatory wizard is optimal, nor authorize auto-entry under A. Vendor list membership/assignment is not Core's enrollment or portfolio authority. Its wealth/major-donor filtering example is not a Core policy.                                                                               |
| S2  | [Salesforce: Create an Actionable List](https://trailhead.salesforce.com/content/learn/projects/fundraising-portfolios-with-actionable-lists/create-an-actionable-list), same edition; sitemap lastmod **2026-10-06**                    | Filters narrow a dataset, then specific person accounts are selected and reviewed before saving.                                                                                                                                                               | Useful distinction between discovering candidates and accepting selected work; no proof of Core disclosure/concurrency. Do not reproduce list-definition/flow setup as routine enrollment setup.                                                                                                                                                                      |
| S3  | [Salesforce: Use Bulk API 2.0](https://trailhead.salesforce.com/content/learn/modules/api_basics/api_basics_bulk), **general platform API training**, sitemap lastmod **2026-09-10**                                                     | “Once a job is in the JobComplete state (or Failed state)” results expose successfully and unsuccessfully processed records; failed results include errors. Receipt of upload data and completed processing are distinct.                                      | Supports honest job/item outcomes. Does not establish nonprofit enrollment batch transactions, a cancellation guarantee or automatic retry safety. The “Close or Abort a Job” resource name alone is insufficient evidence of compensation semantics. Two attempted specific API-guide URLs returned 404; no behavior is inferred from them.                          |
| B1  | [Blackbaud: Managed Lists](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-managed-lists.html), Raiser’s Edge NXT current web help, **undated**                                                                | Query results are copied at that point in time; “Only new records are added; records already on the list are not duplicated.” Add/remove changelog records user/date/action/source.                                                                            | Useful operation-scope and audit precedent. Do not create a separately writable Core portfolio list. A selected command population is not a permanent audience, a saved view or communication permission. No partial-failure/cancel mechanics are documented here.                                                                                                    |
| B2  | [Blackbaud: Add or Exclude Constituents in a List](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-add-exclude-constituents-in-list.html), same edition, **undated**                                           | Filter-based inclusion changes with criteria; explicit additions/exclusions do not automatically track later source-list changes. “Remove exclusion” can undo that list choice.                                                                                | Demonstrates distinct live versus recorded meanings. Undoing a list exclusion is not undoing an enrollment, task, message or donor promise.                                                                                                                                                                                                                           |
| B3  | [Blackbaud: Lists](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-lists.html), same edition, **undated**                                                                                                      | Existing lists support filters, columns, actions, current records and list rights.                                                                                                                                                                             | Useful shared-list surface; no proof a loaded page is every matching record or a new bulk enrollment source exists.                                                                                                                                                                                                                                                   |
| V1  | [Virtuous: Execute a Bulk Action in a Query](https://support.virtuous.org/hc/en-us/articles/13795795095949-How-Do-I-Execute-a-Bulk-Action-in-a-Query), **CRM+**, API `edited_at` **2025-07-02**                                          | Top checkbox selects current page only; a separate “Select all X items in query results” includes all matches. Count and action confirmation are shown. Warning: changing search criteria while processing “could adversely affect the results”.               | Concrete reason to state selected scope and keep accepted command population stable. Do not copy a design in which editing a live view changes an already submitted operation. Action availability depends on query type and permissions; Gift Ask query explicitly has no bulk action in this article. It is not evidence for built-in bulk ask/enrollment creation. |
| V2  | [Virtuous: Edit Tasks in Bulk](https://support.virtuous.org/hc/en-us/articles/34579079094797-How-Do-I-Edit-Tasks-in-Bulk), **CRM+**, edited **2025-07-02**                                                                               | Page/all-results selection and confirmation; “It is not possible to undo a Bulk Action.” Reassignment of existing tasks does not update future workflow task assignments.                                                                                      | Honest irreversibility and open/future work distinction are useful. Do not infer Core needs a mandatory acknowledgment checkbox or that generic undo is safe.                                                                                                                                                                                                         |
| V3  | [Virtuous: Contact Queue](https://support.virtuous.org/hc/en-us/articles/360049183771-What-is-the-Contact-Queue), **CRM+**, edited **2025-09-05**                                                                                        | Supports individually gathered contacts, checkboxes for a chosen subset and task/note bulk actions; advises checking count.                                                                                                                                    | Helps with non-query groups, e.g. people met together. Does not justify a new mandatory queue, copying the same editable encounter note everywhere, or treating remembered contacts as admitted journeys.                                                                                                                                                             |
| V4  | [Virtuous: Bulk Update Records Using an Import File](https://support.virtuous.org/hc/en-us/articles/360059931992-How-Can-I-Bulk-Update-Records-Using-an-Import-File), **CRM+**, edited **2026-08-19**                                    | Distinguishes same-value query update from different per-record values; validates file, exposes error review, permits rejecting/re-uploading before execution. Warns creation through Bulk Data Tools does not check duplicates; update templates require IDs. | Useful review/correction and exact-identity precedent. Do not use import to bypass Core admission/deduplication or copy no-dedup create semantics. Documentation does not fully establish partial accepted-row transaction semantics.                                                                                                                                 |
| A1  | [W3C: Error Prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html), WCAG 2.2 **3.3.4 AA**, Understanding page updated **2025-09-16**                                                        | For applicable data-changing submissions, at least one of **Reversible, Checked, Confirmed** applies.                                                                                                                                                          | Does not require a modal confirmation for every action. Choose appropriate protection; never promise undo when source effects cannot safely reverse. Understanding text is informative guidance quoting the criterion.                                                                                                                                                |
| A2  | [GOV.UK: Check Answers](https://design-system.service.gov.uk/patterns/check-answers/), current Design System, no single edit date captured                                                                                               | Review supports confidence and correction; action label should state the effect; users changing an answer should not repeat the whole transaction. Recommends testing review design with users.                                                                | Useful for meaningful group review, not proof that every small contextual action needs a separate summary page or a GOV.UK visual system.                                                                                                                                                                                                                             |
| A3  | [GOV.UK: Button](https://design-system.service.gov.uk/components/button/), current Design System, no single edit date captured                                                                                                           | Notes accidental double submissions from slow connections or motor impairments; warns against unexplained disabled buttons; destructive warning styling is for serious difficult-to-undo actions.                                                              | Frontend double-click suppression is a usability aid, not server idempotency or concurrency protection. Use existing Core Base UI/base-maia components.                                                                                                                                                                                                               |

The source registry deliberately excludes unrelated marketing claims, vendor
performance promises and inherited portfolio statistics. D3's recently checked
WCAG dragging/status-message and Core accessibility evidence remains applicable;
this pass adds the narrower submission/error-prevention material rather than
claiming that every old source was rechecked again.

## Graded findings

Severity and likelihood below are qualitative product risks if implemented
incorrectly, not observed incident rates. **Critical** means potential restricted
information or unauthorized action; **high** means wrong accepted work, duplicate
obligations or serious recovery failure; **medium** means material friction or
confusion. No current P27 implementation is claimed to exhibit these failures.

### U1 — deliberate start becomes duplicate administration

**Severity medium-high; likelihood high.** Evidence S1/S2 supports contextual
quick actions; D1–D3 already distinguish basic CRM work from journey acceptance.
Inference: a separate enrollment page, repeated identity entry and confirmation
wizard would make ordinary work harder without adding meaning.

**Bounded fix:** show the authorized existing context; collect only missing
journey facts; make the actual effect explicit in the action. An illustrative
label is “Save ask and start journey” when that is exactly what will happen.
“Save contact” must not covertly start it. If already authorized existing ordinary
work is reused, do not demand its purpose be redefined. Do not make a task merely
so the enrollment wizard has something to create: D3 permits appropriate existing
source-linked work.

**Exact proposed language:** “An authorized person may start or reuse a journey
while recording the actual development work in one clear contextual action.
Deliberate entry does not require a separate setup wizard, second candidate queue
or manager approval. Basic Party/referral/task work remains possible without it.”

**Proof:** a new referral can be recorded without enrollment; an authorized ask
can deliberately start/reuse its journey without retyping known identity; missing
ministry remains honest and repairable without a dummy record. Users can explain
which button accepted ongoing work. No donor-facing setup or consent is implied.

### U2 — ‘select all’ means the wrong people

**Severity high; likelihood high.** Evidence V1/V2 explicitly distinguishes a
page from all query results. Current Core selection code uses page-row selection;
existing CRM export does not consume the selected IDs (anchors below).

**Bounded fix:** distinguish selected records, loaded page and all matching
results in visible and accessible wording. Preserve intentional selections across
paging/filter changes only with clear behavior; never silently broaden. Group
review can be an existing list plus a compact summary; no required individual
click per person or obligatory extra modal is inferred.

**Exact proposed language:** “Reviewed group entry means an explicitly selected,
reviewable set. The interface states whether it covers selected records, the
current page or all results, and shows the actual intended scope before start.
A loaded page or capped result is never represented as the complete population.”

**Proof:** select records across pages, deselect some, change filters, switch to
mobile cards and start; accepted identities match the explicitly reviewed set.
Accessible selection labels expose scope. Tests include capped/estimated counts;
unknown completeness must not become an exact count or success assertion.

### U3 — live query changes rewrite the accepted group

**Severity high; likelihood medium-high.** V1 documents an actual warning that
changing a query can affect an in-process bulk action. B1 documents point-in-time
membership and duplicate avoidance. Core saved views are deliberately live lenses.

**Bounded fix:** define the command's accepted population from the reviewed
selection, not a live query that silently adds new matches while execution runs.
Current authority and eligibility still need rechecking. A recorded operation
selection does not become another portfolio-membership or audience store. How it
is represented durably belongs to the existing operation boundary, not a new UI
queue framework.

**Exact proposed language:** “Starting a reviewed group fixes which intended
records that operation may act on. Later saved-view edits or newly matching
records do not expand it. Current authority, source eligibility and restrictions
are still checked for each consequential acceptance.”

**Proof:** add a newly matching donor and edit the source view while work is
pending; neither silently joins the accepted group. Revoke a selected item's
eligibility and show a permission-safe unresolved/skipped outcome. Previews are
not durable permission grants.

### U4 — a group is called successful when only some work exists

**Severity high; likelihood high when work is asynchronous.** S3 distinguishes
accepted input, job completion and per-record successful/failed results. V4
provides pre-execution data review but does not prove a complete result contract.

**Bounded fix:** recommend coherent acceptance per intended journey and its
required linked follow-through, with explicit group outcomes. Do not silently
claim one transaction for every record or permit an active orphan journey if its
required initial obligation failed. Whole-operation prevalidation failure and
per-item outcomes must be distinguishable; exact transaction boundaries are
engineering work and must preserve the already-required invariant.

**Exact proposed language:** “Submission is not completion. Report what was
actually created or safely reused, what remains unstarted and what needs repair,
within current disclosure rights. Never report whole-group success for a partial
result or show an active journey as healthy when required follow-through failed.”

**Proof:** valid item, existing authorized item, invalid item and item revoked
after review are submitted together. Every accepted item has the declared
accountability; unresolved items remain visible/repairable without private reason
leakage. Reopen the outcome after refresh and verify persisted truth. UI labels
must follow server outcomes, not the number of requests issued.

### U5 — retry creates duplicates; clearing filters loses recovery

**Severity high; likelihood high on poor connections.** A3 documents accidental
double submission. V1's dynamic-query caveat and S3's per-record outcomes show why
a generic “try again” button is insufficient. D3 already requires authoritative
reuse and duplicate protection.

**Bounded fix:** double-click protection may improve feedback but the server must
resolve the same intended command safely. Preserve a recoverable authorized
operation outcome through navigation. Retry unresolved work without silently
re-running accepted effects or expanding to the latest query. If changing inputs
makes it a different intent, communicate that; do not reuse a stale submission
identity for materially changed work.

**Exact proposed language:** “A timeout can mean the outcome is not yet known.
Resolve that operation before presenting a new start. Retrying must not duplicate
accepted journeys, tasks or effects, and navigating away does not erase results.”

**Proof:** disconnect after committed save but before response; double-click;
refresh; retry after one successful and one failed item; change inputs before
retry. Accepted source/effect count stays correct and the user sees confirmed,
pending, rejected or unknown—not a false blanket failure/success.

### U6 — Cancel, Undo and correction are falsely interchangeable

**Severity high; likelihood medium-high.** V2 explicitly says task bulk actions
cannot be undone. B2's undo is only list selection. A1 permits several error-
prevention methods rather than requiring universal reversal. No retrieved vendor
source proves safe cancellation of Core's new journey admission.

**Bounded fix:** before execution, users may cancel selection without accepted
work. If an operation can stop future items, describe it as stopping pending
work; already accepted work remains visible. Closing a sheet or browser is not a
cancellation contract. Correcting/ending an accepted journey invokes its own
qualified source operation and preserves history and effects. Never remove a
pre-existing reused journey or undo another operator's later work merely because
it appeared in this group's receipt.

**Exact proposed language:** “Cancel stops only work that has not been accepted,
where supported, and reports what already completed. It does not erase history,
reused journeys or completed effects. Any correction of accepted work is a
separately authorized, attributable operation; do not label it generic Undo.”

**Proof:** cancel before start, during processing and after partial completion;
then another operator acts on an accepted journey. UI and source state agree on
what stopped; historical work and independent tasks survive. If stopping is no
longer possible, say so clearly rather than rendering a decorative Cancel button.

### U7 — bulk reuse reveals hidden journeys or grants rights

**Severity critical; likelihood medium.** D2/D3 prohibit disclosure through
reuse/deduplication; V1 confirms vendor bulk actions vary with permissions, but
does not prove Core's row/scope enforcement.

**Bounded fix:** selection, preview, execution and results require the owning
authorization. Suppress hidden reasons and identities in item results, counts,
downloads and notifications. “Already exists” may disclose protected work;
current authorization determines the permitted result. A human selection is not
a right to see hidden work, take responsibility for it, or contact its supporter.

**Exact proposed language:** “Selecting a record does not authorize creation,
reuse or disclosure. Group previews and result receipts reveal only what the
caller currently may observe. Hidden existing work neither grants access nor
justifies a duplicate; preserve an honest safe unresolved outcome.”

**Proof:** same-name/restricted ministries, inaccessible existing ordinary work,
same-user revocation while results load, and tenant switch. Inspect network
payloads, counts, cached receipts and exported details, not merely rendered rows.
Exact source/database enforcement is outside this UX evidence pass.

### U8 — common group defaults erase individual meaning

**Severity high; likelihood medium-high.** V1 distinguishes same change across
selected records; V4 says per-record different values need distinct handling.
A shared list is not proof that every participant has the same ministry,
relationship stage, responsibility or appropriate next action.

**Bounded fix:** only apply visible defaults where genuinely valid; allow narrow
exclusions/corrections before acceptance without forcing a full wizard for each
person. Do not start ordinary prospective work over evidenced existing history,
coerce prayer partnership into financial prospecting, or turn every referral/gift
into a solicitation. Choosing a group is internal work acceptance, not evidence
that any donor agreed to partner.

**Exact proposed language:** “Group convenience does not invent common ministry,
stage, owner or follow-up facts. Show the intended shared settings and material
exceptions; preserve evidenced existing work and individual restrictions. The
start itself establishes no donor agreement, consent, financial instruction or
authority to send.”

**Proof:** a selected group contains a new referral, an established prayer
partner, a never-ask supporter and evidenced existing work. Each outcome remains
honest; no reset to prospect, duplicate administrative task or prohibited outreach
is produced. Initial-stage and entry-eligibility policy remain separately groomed.

### U9 — review becomes an unnecessary confirmation ceremony

**Severity medium; likelihood high if vendor screens are copied literally.**
S1/S2/V1 demonstrate review/confirm flows; they do not demonstrate that each click
is necessary. A1 offers reversible/checked/confirmed alternatives. A2 is a review
pattern for transactions, not a law requiring a dedicated page for every edit.

**Bounded fix:** review should reveal material effect and enable correction.
For an ordinary single-item command, visible contextual facts and a precise action
can suffice. For a group, clearly expose intended scope/settings; additional
review is justified when it helps verify consequences. No mandatory “I understand”
checkbox, multi-step wizard or routine manager approval follows from D4.

**Exact proposed language:** “Make the decision clear at the point of action.
Use additional review only where the scope or consequences need it; do not require
users to reconfirm facts already visible and deliberate. Keep correction easy
without replaying an entire setup flow.”

**Proof:** users can state supporter, ministry, ordinary/separate purpose, scope
and next responsibility before activating the command. Compare minimal contextual
flow with extra confirmation in representative tasks; retain only steps that
improve correct decisions or necessary recovery. No numerical efficiency claim
is assumed or acceptance threshold fabricated.

### U10 — mobile and accessibility hide selection, errors or outcomes

**Severity high; likelihood high for large groups or poor connections.** A2/A3
support understandable actions, correction and duplicate-click feedback. Core's
accessibility rules require manual keyboard/focus proof in addition to axe;
recent D3 WCAG sources cover status announcements and non-drag equivalents.

**Bounded fix:** use shared base-maia/Base UI selection/actions, retain full
permitted names and enough context, make selected scope readable on mobile, and
preserve focus/selection on return. Native form labels and error links must remain
usable. Do not rely on color, hover, drag, a disappearing toast or email alone to
explain partial results. Avoid all-in-memory loading of every match merely to
claim an exact selection count; server scope and workload limits must be explicit.

**Exact proposed language:** “The same start, review, correction and result path
must work by keyboard and single-pointer touch, including narrow screens and
poor connections. Keep selection scope and outcome visible and announced; preserve
permitted context without silently replaying consequential commands.”

**Proof:** keyboard-only select/deselect across pages; narrow cards; long/local-
script names; screen reader; zoom/reflow; slow/disconnected save; partial-result
repair. Check focus return when a selected row is no longer in the live view and
clear private draft/result data after revocation. No browser or AT check ran here.

## Current repository anchors and pattern classification

- **Durable intent:** P9 A12 and A14 in
  `docs/prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:484`
  and `:508` retain source-owned assignments/tasks, live saved views, server
  paging/facets, shared list engine and accessible focus behavior. D4 should
  compose these rather than create another donor/list product.
- **Useful precedent, limited selection semantics:**
  `packages/ui/components/shadcn/data-table/data-table-responsive-inner.tsx:294`
  uses `getIsAllPageRowsSelected`/`toggleAllPageRowsSelected`; label at `:307` is
  “Select all”. This proves page-row selection code, not all-filtered selection,
  a durable reviewed population or bulk enrollment. Any D4 consumer must expose
  its exact meaning; do not assume a label establishes server scope.
- **Temporary bridge / unsuitable behavior to inherit:**
  `apps/admin/app/(app)/crm/page-client.tsx:68` reports bulk archive unavailable;
  `:72` receives selected rows for export but sends the `donors` report slice
  without selected IDs. The toast describes that slice. This is not a qualified
  selection-scoped bulk command. Report readers include a 5,000-row cap at
  `packages/api/src/admin/crm/reports/service.ts:90`; a downloaded slice is not
  proof of complete selected scope.
- **Durable UI contract:** existing frontend/accessibility rules and
  `packages/ui/components.json` require base-maia/Base UI shared primitives,
  meaningful async/error states and manual interaction verification. This pass
  proposes no alternate components, modal framework or global selection store.
- **Conflict with first principles if copied:** Virtuous's live-query mutation
  hazard; treating a completion notification as proof every item succeeded;
  generic undo over accepted shared work; using list membership to grant access
  or trigger solicitation; requiring donor setup or creating a dummy ministry.

These source reads are static evidence, not a claim of live exploit or of any
new D4 implementation. No code was edited in this review.

## Proposed bounded D4 language

> An authorized person deliberately accepts new cultivation work, individually
> or in a reviewed group. Existing facts and saved views may inform that choice;
> their arrival or display alone does not start a journey. One clear contextual
> action may start or safely reuse the intended journey while recording its
> actual ask or follow-up, without a separate setup ceremony or routine approval.
>
> A reviewed group is an explicitly selected, reviewable operation population,
> with its intended scope and material shared settings visible before start.
> Later view edits and new matches do not expand that operation. Current identity,
> authority, eligibility and restrictions still govern every acceptance and what
> its result may disclose. Selection itself grants no access, donor consent,
> financial instruction or authority to send.
>
> Distinguish submitted, pending, accepted/reused, unresolved and failed work
> honestly. Accepted journeys retain appropriate existing or deliberately created
> follow-through; group convenience cannot hide missing accountability. Safe retry
> resolves the same intended operation without duplicating accepted effects.
> Stopping pending work is not undoing completed or pre-existing shared work;
> correction preserves source history and uses its own authority.
>
> This choice creates no mandatory candidate queue, purpose catalog, bulk-work
> engine, communication campaign or donor-facing setup. It does not decide exact
> initial stages, entry eligibility, transaction layout, cancellation implementation
> or reopening/merge behavior. Migration of evidenced existing work remains a
> separately governed operation and does not imply re-solicitation or new prospect
> status.

This is proposed wording for the parent review. Source-supported comparisons and
inferred safeguards are separated above. Meaningful future proof includes
selection scope, mixed results, timeout/retry, cancel-after-partial, hidden reuse,
revocation, accessible mobile recovery and representative staff task completion.
None was reported as passed; no formal specification or issue packet is created.
