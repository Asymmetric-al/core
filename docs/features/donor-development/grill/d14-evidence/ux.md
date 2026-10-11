# D14 evidence — additional organization-approved stage lists

2026-10-10. **UX disposition: retain A, with bounded safeguards.** The founder
selected additional approved lists and requires excellent, clear UX. This is
research against Core HEAD `225c02e9499bd6c0d493223cd4b1a4120ff787e3`, not a
shipped feature, final interaction design, user study or browser qualification.
The [Q14 boundary](../phase27-q14-additional-stage-lists.md) leaves applicability,
defaults, switching and whole-list lifecycle open. This appendix does not decide
them through a convenient control or example.

## Decision and strongest smaller alternative

Additional lists are useful when one combined vocabulary would obscure genuinely
different processes. They are organization configuration on the shared cultivation
model, not a personal pipeline, another journey for the same ordinary purpose,
or a new set of supporter facts. More lists do not imply a better experience.

The strongest B is a small supplied library, with D10 customization and D12 direct
stage choice handling variation. It reduces administration and comparison costs.
A preserves that simple starting point while allowing a genuinely different list;
it should not make everyone configure one or choose among every organization list
on every visit. This is product reasoning, not measured agency demand.

**D14 must establish** that authorized organizational configuration can create
additional lists; list/stage identities stay scoped and stable; one journey has
one applicable list and shared assessment; and new configuration does not itself
move, enroll, contact or reassess anyone. “Approved” does not introduce another
approval queue. Exact authority remains P12-owned.

**Still separate decisions:** how a list becomes applicable to new work; any initial
default/suggestion; changing an existing journey's list or mapping its stage;
whole-list retirement/restoration/deletion; and copying/template-update behavior.
No automatic assignment by team, ministry, viewer or screen follows from A. Useful
copying is not necessary to create a list and must not become an implicit live
inheritance system. Stage retirement and direct assessment remain D10–D13 behavior.

## Fresh primary comparisons

Retrieved/read **2026-10-10**. Vendor applications were not exercised. These are
bounded analogies, not evidence of missions-staff usability or Core entitlements.

| Primary source                                                                                                                                                                                                                                                                                                                                   | Verified fact and implication limit                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [HubSpot: Set up and manage object pipelines](https://knowledge.hubspot.com/object-settings/set-up-and-customize-pipelines), updated 2026-09-08, “Create a new pipeline” and “Clone a pipeline”                                                                                                                                                  | Recommends additional pipelines for different processes with different stages, rather than separate teams using the same process. Configuration permission is explicit. Its clone can include rules, automations and access; Core must not infer those capabilities from list creation. Subscription limits are vendor limits, not Core budgets.                                                                                                 |
| [Pipedrive: Create multiple sales processes](https://support.pipedrive.com/en/article/how-can-i-have-multiple-pipelines), updated 2026-09-03                                                                                                                                                                                                     | Each pipeline has its own stages. The guide advises using fields/filters rather than pipelines for salesperson, location or industry, and documents name/stage editing followed by Save changes. Same stage names do not combine its pipelines into one board. This supports avoiding label-based equivalence, not a Core prohibition on combined authorized views or an instruction to adopt probabilities, decay clocks, copying or switching. |
| [Salesforce Trailhead: NPSP opportunity record types](https://trailhead.salesforce.com/content/learn/projects/create-an-opportunity-record-type-for-npsp/get-to-know-opportunity-record-types), undated current lesson, “Review the Basics” and “Explore … Benefits”                                                                             | Different processes can use different stage choices on one Opportunity object. The lesson explicitly covers the NPSP managed package and a special training org; it warns NPSP stopped being a preconfigured production package in December 2025. This is not current integrated Nonprofit product qualification. Its revenue categories, page layouts and forecast probabilities are not Core cultivation semantics.                            |
| [Contentful: Multiple workflows to content types](https://www.contentful.com/help/ai-automations/workflows/workflows-management/multiple-workflows-to-content-types/), “Using multiple workflows” and “Parallel workflows”                                                                                                                       | Separates configuring workflows from entry-level use and displays workflow context. It also supports parallel workflows and automatic-start settings. Those capabilities conflict with importing the page wholesale into Core's one-applicable-list journey model. Hover-only disclosure in its example is not sufficient for essential Core context.                                                                                            |
| [WCAG 2.2 labels/instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html), [status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), [dragging](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html), [reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) | Inputs need meaningful visible labels, including optional inputs; material async outcomes need accessible status. Drag interactions require a non-drag single-pointer alternative, independently of keyboard access. Responsive layouts must preserve information and actions. The Understanding pages explain the criteria; reading them is not conformance testing.                                                                            |

Undated SaaS pages do not establish deployed versions. No comparator establishes
an optimal list count, mandatory creation justification, approval ceremony or
universal ministry stage vocabulary.

## Minimum clear interaction

Use shared Core `base-maia`, Base UI and semantic tokens. An organization settings
area can show **Stage lists**, each permitted list's recognizable name and concise
existing meaning/context, with **View stages** or the authorized edit action.
Offer **Create stage list** to eligible configurators. Supplied and additional
lists should be understandable without a marketplace, setup wizard or a screen
full of technical identifiers. Do not invent “Draft”, “Published”, “Default” or
“Retired” badges until their source semantics are selected and implemented.

Creation needs a recognizable list name and the stage definitions needed for a
usable catalog. Reuse the D10 editing composition for stage names, guidance and
order. A short explanatory description may help differentiation; D14 does not
require a narrative justification, a new required field or a process-design essay.
Keep unapplied edits distinct from accepted configuration, with a clear deliberate
save and Cancel. A compact page, panel or suitable dialog is an implementation
choice; the decision does not mandate a widget or number of screens.

Show the useful consequence before save, briefly: this creates another stage list;
it does not move existing partnership work. The accepted result identifies the
saved list and allows the authorized person to review its stages. Do not claim
that it was assigned, made the default, or is already offered for particular work
unless the qualified source actually performed that separate selected policy.
Do not expose an “Assign now” wizard as the completion requirement for creation.
An unsaved form is not a newly selected persistent draft lifecycle.

Daily work should emphasize partnership identity, current stage, responsible lead,
next work and the permitted Set/Change stage action. Include the applicable list's
name or concise context where needed to understand the available meanings. A known
source-resolved list can be readable context; do not force a repeated chooser.
If a later applicability decision genuinely requires user choice, present only
eligible options with understandable differences. Conversely, do not silently
select the first returned list to avoid showing a control. Neither “always ask”
nor “always infer” is selected here.

The stage editor remains within the source's applicable list. Viewing another
list in configuration or filtering a portfolio does not change a journey's list.
Read-only authorized users can understand permitted context without edit affordances.
List creation cannot imply missionary configuration authority. A mission control
view and missionary view of the same authorized journey must not show independent
assessments because they use different screen defaults.

### Names and contextual distinctions

Labels are display text, not keys. A stage called **Conversation** in two lists
must remain distinguishable by list context where both appear, for example
**Conversation · Church partnership** and **Conversation · Support raising**.
These are illustrative labels, not assigned starter vocabulary or applicability
rules. Do not merge stages, histories, totals or search matches by spelling/rank.

Duplicate or translated list labels need enough permitted context to make an
actual choice understandable. Include the distinction in accessible names and
selected summaries, not just a tooltip, icon or color. If labels and authorized
context are indistinguishable, resolve that ambiguity through the qualified
configuration/validation route rather than asking staff to guess. D14 does not
silently prescribe globally unique names, ASCII-only labels, forbidden words,
UUID display or another taxonomy/translation engine. A matching name is not proof
that a repeated create intent already succeeded; retrieve its authorized receipt.

Recommended bounded creation validation: require a nonblank readable list name;
make **When to use this list** guidance optional. Prefer distinct display names
within the actual organization catalog being configured. Reject an exact display
name collision with a field-linked **Use a name that distinguishes this list**;
show the existing list only when permitted. Similar names may expose permitted
guidance/preview without fuzzy blocking or another acknowledgement. State this
validation explicitly in the consolidated design; A alone does not freeze an
index, collation or Unicode algorithm. Use one source-authoritative comparison
under the qualified input/language policy and test translated collisions. If an
author cannot see the full proposed uniqueness scope, resolve safe disclosure and
creation authority before adopting that scope. Optional guidance alone cannot
disambiguate two identical names when both descriptions are omitted. This does
not mandate renaming retained lists or add any field to journey admission.

Keep D13's **No stage recorded** condition separate from any actual tenant stage
named “Not yet assessed.” Long names, RTL and mixed-direction text must remain
distinguishable after truncation, on touch and through assistive technology.
Names/guidance must not expose private ministry locations or supporter details to
broader configuration audiences.

## Failure and state review

Severity is consequence if implemented incorrectly; likelihood is qualitative
reuse risk, not a measured incident rate. Every remedy retains A.

| Concern; severity / likelihood                               | Exact prevention and acceptance requirement                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Loading/error presented as no lists; high / likely if copied | Distinguish authoritative empty permitted results, no search matches, loading and failure. Offer clear search reset or retry as appropriate; never invite duplicate creation based on a failed read. Retain only currently permitted stale data, marked honestly.                             |
| Permission-safe clarity; critical / plausible                | Display only authorized list/stage/usage context. A denial gets a permitted remedy, not hidden names, usage counts or a fabricated request-access/approval flow. Configuration access alone does not authorize all journeys using the list.                                                   |
| Invalid/incomplete configuration; high / plausible           | Identify correctable fields and preserve draft intent. An authoritative zero-selectable catalog cannot become usable under D10; an empty filtered or permission-limited options response does not prove catalog invalidity. No invented stage/default repairs it.                             |
| Dirty, saving and accepted confused; high / likely if copied | Keep local changes and server acceptance distinct. Disable duplicate submission while pending, expose saving status accessibly and preserve focus. A toast or dirty flag alone is not durable acceptance. Cancel before submission makes no write; closing after submission does not undo it. |
| Lost response or duplicate create; high / plausible          | Show unconfirmed outcome and reconcile the same scoped intent under current disclosure. Do not blindly create another list or use a matching label as acceptance proof. Retry must not drop submitted stages or silently adopt another administrator's configuration.                         |
| Concurrent edits/authority change; high / plausible          | Reconcile source revision and current authority before applying. Explain the permitted conflict, retain recoverable intent and show current source only if allowed. Do not overwrite with a stale form or restore protected labels after revoked access.                                      |
| Catalog edit mistaken for assessment; high / plausible       | Creation/add/reorder does not enroll, assign, move, reopen or change recorded assessment. Daily Set/Change stage uses its own qualified source command. Stage/list context remains consistent on authorized surfaces and history.                                                             |
| Same-name counts and filters; high / plausible               | Group by qualified list/stage identity and label scope clearly. Zero means verified coverage; unavailable/partial is not zero. A view of several lists must not imply ordinal, conversion or probability equivalence. No new dashboard or report store is required.                           |

## Whole-list lifetime: a real follow-up, not inherited stage retirement

Creation without an eventual safe way to stop offering obsolete lists can leave
clutter, accidental new use and support work. Permanently retaining every list as
a new-work option is the strongest no-new-lifecycle alternative: it is simple and
preserves references, but search alone cannot distinguish obsolete guidance from
an intended option. This is a plausible operational burden, not observed Core
sprawl or a reason to invent automatic cleanup.

The strongest minimal later policy is **stop offering a list for new work while
preserving normal stage choice for existing journeys and retained history**.
That avoids forcing reassessment/migration merely to clean up future options. It
still needs an explicit source definition of new use, interaction with applicability
and separately chosen defaults, concurrent creation/start, reopening, and any
restoration. Creation of an additional list does not answer those questions.

Adopting that policy now is a **material amendment** to Q14's expressly reserved
whole-list lifecycle; it is not D10's individual-stage retirement applied by analogy.
My recommendation is to retain A and name this as a genuine next policy decision
needed before operational rollout of the affected capability. Do not add a
Retire list/Delete list control, permanent availability promise or invented enum
in this review. If the parent instead includes the minimal lifecycle policy in
D14, identify it explicitly for the founder's ratification. No automated cleanup,
silent list switching, replacement mapping or destruction follows either way.

## Current Core reuse evidence and limits

- [SettingsPanel:31–47](/workspace/core/apps/admin/features/support-hub/components/settings/SettingsPanel.tsx:31)
  uses a labelled region and responsive header; [SettingsRow:28–61](/workspace/core/apps/admin/features/support-hub/components/settings/SettingsRow.tsx:28)
  provides responsive labels/control layout. These are support-hub compositions,
  not a new approved shared catalog manager; reuse shared primitives rather than
  copying an app-local primitive into another app.
- [BusinessHoursList:23,58–63](/workspace/core/apps/admin/features/support-hub/components/settings/business-hours/BusinessHoursList.tsx:23)
  maps missing query data to `[]` and renders “No business hours yet” on zero rows
  without branching on loading/error in this component. This is a concrete empty
  state reuse trap, not proof of an unsafe P27 implementation. Its delete/default
  controls do not authorize equivalent stage-list policies.
- [BusinessHoursForm:50–88](/workspace/core/apps/admin/features/support-hub/components/settings/business-hours/BusinessHoursForm.tsx:50)
  shows local draft/dirty tracking and awaits a mutation before success.
  [SettingsToolbar:37–74](/workspace/core/apps/admin/features/support-hub/components/settings/SettingsToolbar.tsx:37)
  shows unsaved text, a spinner and Save/Discard disabling. It has no live-status
  markup in that component; the full future composition needs outcome announcements,
  unknown-result recovery and correct focus. Do not reuse its dirty/not-dirty
  distinction as proof of server acceptance.
- [SearchableSelect:73–79,102–139](/workspace/core/packages/ui/components/shadcn/searchable-select.tsx:73)
  uses stable values and supports custom option rendering, but an unmatched selected
  value falls back to the placeholder; option/selected labels truncate, and its
  generic empty text does not classify failed versus empty data. Essential context
  and source-state distinctions need composition review.
- [Current CRM board:29–64](</workspace/core/apps/admin/app/(app)/crm/kanban-view.tsx:29>)
  derives alphabetical lifecycle columns from loaded rows and counts those rows.
  It is not a source catalog, complete list library or cross-list comparison proof.

A fresh bounded search for `StageList`, `stage_list`, `CultivationPreset`,
`cultivation_preset`, `cultivation.*preset` and `stage.*preset` in shared UI, admin
features/routes, API source, database hooks and migrations returned no matches.
That is not an all-repository or live-system absence claim. The earlier
[D11 selector tests](../d11-evidence/source-probe/README.md) prove three jsdom
primitive behaviors, not list management, lifecycle, live authorization, mobile
layout or D14 UX. No new product seam justifies relabelling a synthetic mock as
implementation proof; no tests or product code were added here.

## Falsifiable browser and pilot proof to carry forward

1. An authorized configurator creates a valid additional list, cancels a separate
   unsaved draft, and recovers a simulated lost response. Verify one accepted list
   for the same intent, no partial usable catalog and zero journey/stage changes.
   Actual field errors identify their permitted remedy without erasing input.
2. Independently exercise loading, no matches, genuine empty permitted results,
   failed reads, stale data, denied/revoked authority, source conflict and unconfirmed
   save. Staff can distinguish each outcome and perform the available recovery;
   none reveals hidden context or creates a duplicate through blind retry.
3. On offered daily surfaces, show the same journey to appropriately authorized
   staff and missionaries. Its applicable list/assessment agrees, adding a different
   list changes neither, and setting/changing a stage uses only eligible choices.
   The supplied-list path remains usable without mandatory additional setup or
   repeated selection of a source-resolved list.
4. Exercise same-name stages in different lists, ambiguous list labels, D13 absence,
   renamed source labels where supported, long translations and RTL. A user can
   identify the actual selected list/stage without UUIDs, hover or color. Offered
   filtered counts retain truthful scope/coverage and no label-based equivalence.
5. Use keyboard, screen reader and single-pointer/touch routes for creation, stage
   editing and recovery. If reordering uses drag, exercise a non-drag pointer route
   too. Verify focus/labels/errors/status, Core 44px touch targets, 200% text resize,
   320 CSS px effective reflow, soft keyboard and reduced motion. Automated checks
   supplement these tasks; prior primitive tests do not qualify the flow.
6. With representative authorized organization configurators and daily staff,
   test whether they can explain the difference between a list and an assessment,
   create a needed list, locate its saved result, identify current stage/next work,
   and recover uncertainty without moderator rescue for a critical action. Record
   actual participant context, devices/assistive technology, failures and revisions.
   Any reproduced critical confusion needs correction before expanding that flow;
   no invented sample size, task-time budget or beauty score substitutes for evidence.

These are proposed future acceptance safeguards, not executed D14 tests. Whole-list
lifetime and applicability scenarios join that proof once their policy is selected;
test names must not silently choose the outcome beforehand.
