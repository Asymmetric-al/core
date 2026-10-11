# D15 evidence — unavailable for new work, usable by existing journeys

2026-10-10. **UX recommendation: retain A, with explicit return-case treatment.**
Research against Core HEAD `225c02e9499bd6c0d493223cd4b1a4120ff787e3`,
[Q15](../phase27-q15-retiring-stage-lists.md) and D10–D14. The founder selected
continuing use by existing work. This appendix proposes precise interactions and
proof; it is not a shipped feature, final widget specification or staff study.

## Meaning and strongest alternative

Whole-list withdrawal changes eligibility for **new partnership admissions**. It
does not make an existing journey, its current stage, every child stage or its
follow-up invalid. Staff with current authority can continue selecting individually
eligible stages within the existing journey's list, including its first assessment
if it is still unassessed. “Existing” is a source fact, not a browser's earlier
draft, cached option or a caller-supplied creation date.

The strongest B stops new admissions too, but requires deliberate replacement of
the list before another assessment. It can standardize future stage use while
preserving history; it need not close work or migrate everything before withdrawal.
It also adds an operational dependency to assessment and needs a qualified switching
and mapping path. A avoids that interruption. Do not recreate B by disabling the
old list's stage control or displaying a mandatory **Choose a replacement list**.
No inspected practitioner study proves either approach universally better.

**Return cases need an explicit disposition.** Recommend continuing A for the same
source journey when a pause ends or closed work is deliberately reopened under
D8/D9. Preserve its list, assessment or genuine absence; once the lifecycle permits
the operation, its eligible stages remain usable. D8/D9 identity retention alone
did not establish this whole-list eligibility rule—Q15 expressly reserved it.
State the extension in the consolidated decision rather than attributing it to an
already settled contract. Retirement itself neither resumes/reopens work nor permits
editing a closed journey outside its normal rules. New tasks, a new session, a new
staff member or a new year are not new partnership admissions. A genuinely distinct
qualified purpose remains a separate source case and cannot borrow another journey's
continued-use eligibility.

Restoration, deletion/cleanup of unused lists, switching, applicability/defaults,
and an empty selectable-stage set remain separate source policy seams. This review
must not imply them through a two-way switch, Restore button, replacement wizard
or an “Archived” state borrowed from another product.

## Fresh primary comparison and accessibility evidence

All sources below retrieved/read **2026-10-10**. Applications were not exercised.
Publisher dates are stated only where the page identifies them reliably.

| Primary source                                                                                                                                                                                                                                                                                                                                                           | Verified fact and limit                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Salesforce: considerations for record types and picklists](https://help.salesforce.com/s/articleView?id=sf.customize_recordtype_considerations.htm&language=en_US&type=0), “Deactivating Record Types,” undated                                                                                                                                                         | Deactivation prevents creation with that record type while retaining existing associations/page layouts; the page also identifies an inline-editing layout caveat. This supports separating new-use availability from retained records. It does not prove all future stage edits work in Core, confer access, or establish a missions policy. |
| [Nutshell: delete/archive/deactivate a pipeline](https://support.nutshell.com/en/articles/8428889-pipelines-how-do-i-delete-a-pipeline), page says “Updated over a month ago”                                                                                                                                                                                            | Its archive procedure requires no open/pending leads; deactivation moves a pipeline to Draft, which cannot contain open leads. This is a concrete contrasting lifecycle, not A. Do not import its prerequisite, draft state, lead completion or movement into Core withdrawal. No exact publication date is inferred.                         |
| [HubSpot pipeline deletion API change](https://developers.hubspot.com/changelog/pipeline-stage-validation-true), announced 2026-07-21, live 2026-09-08                                                                                                                                                                                                                   | Reference validation defaults change for `/2026-09/` and later APIs, with documented bypass options; earlier versions differ. This is deletion behavior, not an ongoing-use retirement contract or proof that all integrations enforce it. Core's preservation rule needs its own all-path source proof.                                      |
| [Contentful: hide field when editing](https://www.contentful.com/help/fields/hide-field-when-editing/), current page                                                                                                                                                                                                                                                     | Hidden fields remain in API responses and can still be shown/edited unless permissions prevent it. Presentation, source preservation and editing authority are distinct. Hiding a Core list is not sufficient admission enforcement; the CMS's publishing/required-field rules do not become cultivation rules.                               |
| [Contentful: delete a content type](https://www.contentful.com/help/content-types/delete-content-type/), current page                                                                                                                                                                                                                                                    | Deletion first requires deletion of all entries, including archived ones; the type cannot be restored afterward. This is a destructive operation unlike A and supplies no Core cleanup or restoration authority.                                                                                                                              |
| [WCAG 2.2 labels/instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html), [name/role/value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html), [status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), [error suggestion](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html) | Controls need understandable labels/semantics; material asynchronous outcomes need accessible exposure; known remedies should be supplied subject to security/purpose limits. This supports precise contextual explanations, not showing private list details to justify a denial.                                                            |
| [WCAG 2.2 reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [target minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)                                                                                                                                                                                                       | Test effective narrow layouts and usable controls. WCAG's 24 CSS-pixel target minimum includes exceptions; Core's 44px touch convention is stronger. Neither reading guidance nor passing a primitive test proves the whole flow accessible.                                                                                                  |

These are current retrieved documents, not pinned deployed SaaS releases. The
Contentful sidebar-configuration guide was also inspected; it establishes setup,
not withdrawal semantics, and is not evidence for an automatic publish/workflow
feature. No vendor practice substitutes for the selected Core policy.

## Minimal admin and everyday interaction

In permitted organization stage-list settings, show the list's recognizable name
and a clear availability statement. Suggested action: **Stop offering for new work**.
Suggested accepted status: **Unavailable for new work**. These are display proposals,
not database enum names. Avoid a bare **Inactive**, **Archive** or **Delete** label
whose effects on existing work are unclear.

Present the consequence beside the deliberate action, for example:

> New partnership work cannot use this list. Existing work can continue using its
> available stages. Recorded stages, history and follow-up are preserved.

One reviewable action with ordinary Cancel is sufficient; no typed list name,
compulsory reason, second approver, count-dependent acknowledgement or migration
wizard is justified. Do not require opening every existing journey. A usage count
is optional and independently authorized: unavailable/partial is not zero, and a
configurator need not gain private journey access to understand the consequence.
Exact panel/dialog placement remains an implementation choice using shared Core UI.

Only an accepted source result supports the changed status. Pending, rejected,
conflicted and unconfirmed outcomes remain distinct. After accepted withdrawal,
the list stays discoverable to authorized configurators without a new archival
subsystem. If it leaves a currently filtered settings view, explain the accepted
change and filter consequence, retain an authorized route to its result and restore
meaningful focus. Disappearance alone must not communicate success.

For an existing journey, keep current stage or **Not yet assessed**, next work and
the authorized **Set stage**/**Change stage** action prominent. In relevant list
context, use a calm secondary explanation such as **Unavailable for new work · You
can still use this list for this partnership**. Do not mark the partnership failed,
overdue or closed because of configuration retirement. The notice need not become
a repeated blocking banner or extra acknowledgement before every stage change.

A list's withdrawal does not label all of its child stages “retired.” Individually
retired stages still cannot be freshly chosen; an existing recorded retired stage
retains its identity/meaning under D10. Include the actual list context where names
could otherwise collide, and keep D13 absence separate from a tenant stage with a
matching label. A current value must not become blank or `N/A` merely because it is
absent from a new-admission options query.

For new work, do not offer the withdrawn list as an eligible destination. An old
draft or stale menu referencing it gets a precise permitted outcome and recovery:
refresh eligible choices and deliberately revise the intended admission under the
qualified applicability rule. Do not silently pick another list, translate its
stage by label/rank, create an unassessed fallback or convert the request into a
reuse result. If the source genuinely finds an existing journey, use D4's authorized
reuse/reopen semantics instead of treating a new browser session as a new admission.
No list-choice/default policy or hidden-duplicate disclosure follows from this.

## Important states and exact safeguards

Severity describes prospective consequence; likelihood is qualitative engineering
judgment, not a deployed incident rate. These concerns retain A unless a separately
reserved policy is expressly selected.

| State or failure; severity / likelihood                                                 | Required behavior and proof                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Existing assessed or unassessed journey; high / likely if options are globally filtered | Withdrawal alone leaves authorized eligible stage changes and first assessment usable. Preserve stage absence and existing work; no replacement-list task, new assessment deadline or added permission.                                                                                                                                                                                                     |
| Paused/closed return; high / plausible                                                  | Explicitly resolve the recommended continued-use extension above. A return preserves the source journey/list and history; it is not fresh admission. Pause/close still govern which operations are allowed now, and ended child work does not restart automatically.                                                                                                                                        |
| Individually retired current stage; high / plausible                                    | Show its retained value/meaning with a stage-specific explanation; choose another currently eligible stage directly when authorized. Withdrawal is not authority to restore or reselect that retired stage.                                                                                                                                                                                                 |
| Options loading/failure versus current fact; high / likely if copied                    | Keep independently authorized current list/stage/absence visible while its options request loads or fails. Options failure is not evidence of retirement, no assessment or no eligible stages. Offer retry without discarding submitted intent.                                                                                                                                                             |
| No matching choices versus authoritative zero selectable stages; high / plausible       | Distinguish search/filter/permission results from actual source configuration. If none is genuinely selectable, show the permitted configuration remedy, not automatic restoration or mandatory migration. D10's zero-stage prohibition explicitly covers lists available for new work; any strengthened protection for withdrawn lists with existing work must be recorded as source policy, not inferred. |
| Withdrawal versus new admission race; high / plausible                                  | Show the real serialized source result: admission accepted before withdrawal remains existing work; an unaccepted stale admission cannot use the now-withdrawn list. Do not judge by when the form opened, or undo a real admitted journey afterward.                                                                                                                                                       |
| Withdrawal versus existing stage change; high / plausible                               | Whole-list withdrawal alone cannot turn an otherwise eligible existing-work assessment into a replacement requirement. Current stage eligibility, journey revision, lifecycle and authority still apply; concurrent individual-stage retirement remains a real conflict.                                                                                                                                    |
| Repeated click, offline failure or lost response; high / plausible                      | Block duplicate pending submission, show truthful state and reconcile the same intent. Historical receipt and current configuration are distinct; a late callback must not regress newer accepted state. Closing a view does not cancel committed withdrawal.                                                                                                                                               |
| Read-only or revoked actor; critical / plausible                                        | Disclose only permitted context/remedies. Existing association confers no access or editing grant. Do not show private list/usage details, an unauthorized Restore action or a fabricated permission-request workflow.                                                                                                                                                                                      |
| Last applicable list or separately configured default; high / plausible                 | Never silently choose a substitute or strand admission behind an unexplained empty dropdown. Respect the explicitly qualified applicability/default treatment and show permitted repair. D15 must resolve the affected source condition before shipping it, without inventing a default or a fallback chooser.                                                                                              |
| Mixed reviewed group; high / plausible                                                  | Report each fixed D4 member's actual accepted/reused/rejected/unresolved outcome. Pre-withdrawal accepted members remain; unaccepted new members do not inherit eligibility from them. Preserve reviewed intent; retry neither expands the group nor applies a silent replacement list.                                                                                                                     |
| Ordinary work views and counts; high / likely with active-only joins                    | Existing eligible work remains in ordinary authorized views/counts despite the list being unavailable for new work. Explicit availability filters may narrow results with clear meaning. Do not infer stage equivalence or progress from old/new list labels/order.                                                                                                                                         |

The two material unresolved policy seams are the explicit return-case treatment
and whether later stage configuration may exhaust all choices for still-existing
work. Do not claim a component or external comparator has already settled them.
Restoration and switching can remain absent; the UI must not advertise them as
recovery unless actually selected and qualified.

## Current Core evidence and reuse limits

The shared UI contract remains [base-maia/Base UI](/workspace/core/packages/ui/AGENTS.md:26),
with [accessibility review](/workspace/core/docs/ai/skills/accessibility-review/SKILL.md:22)
and [44px touch guidance](/workspace/core/docs/ai/skills/emil-design-engineering/touch-accessibility.md:44).
Fresh inspection found these relevant mechanics, not a qualified D15 boundary:

- [SearchableSelect:102–139](/workspace/core/packages/ui/components/shadcn/searchable-select.tsx:102)
  resolves selected labels only from supplied options, falls back to a placeholder,
  and can disable each option. A filtered active-only list can therefore erase the
  apparent current label or disable valid continued use if composed incorrectly.
  Its generic **No options found** does not distinguish a failed request.
- [SelectCell:34–51,126–132](/workspace/core/packages/ui/components/shadcn/data-table/cell-variants/select-cell.tsx:34)
  closes editing synchronously after its callback, can emit `null` through Clear,
  and displays unmatched values as `N/A`. None proves durable acceptance or gives
  permission to clear an existing list/stage.
- [SettingsToolbar:37–74](/workspace/core/apps/admin/features/support-hub/components/settings/SettingsToolbar.tsx:37)
  provides dirty/saving visual states and disables repeated pending Save, but its
  span lacks live-status markup. The future full composition needs accessible
  acceptance/conflict/reconciliation state, not merely a spinner and dirty flag.
- [BusinessHoursList:23–30](/workspace/core/apps/admin/features/support-hub/components/settings/business-hours/BusinessHoursList.tsx:23)
  uses an empty fallback for absent query data and a generic delete confirmation.
  Its deletion semantics are not an appropriate withdrawal contract or a reason
  to add typed-name/destructive ceremony.
- [CRM board:29–64](</workspace/core/apps/admin/app/(app)/crm/kanban-view.tsx:29>)
  derives alphabetical lifecycle columns/counts from loaded rows. It cannot prove
  source-list retention or portfolio completeness. [The grid query:192–207](/workspace/core/packages/database/hooks/admin-crm-infinite.ts:192)
  retains previous data, uses a 30-second stale time and disables refetch on window
  focus; cached presentation alone cannot authorize a new admission.
- [TanStack form metadata:142–170](/workspace/core/packages/ui/components/primitives/tanstack-form.tsx:142)
  provides associated description/error IDs useful for permitted field-linked
  recovery. Shared primitive support does not qualify this complete operation.

A bounded search for `available_for_new`, `new_work_available`, `stage_list_retire`,
`retireStageList`, `retire_stage_list` and `cultivation` in admin features/routes,
API source, database hooks and migrations returned no matches. This is not an
all-repository or live-system absence claim. No shipped D15 defect is alleged.
Earlier [D11 selector tests](../d11-evidence/source-probe/README.md) remain only
three jsdom primitive checks. No new synthetic UI, product test or browser run was
performed for this research; actual lifecycle/authority behavior needs its own proof.

## Falsifiable browser and staff proof

1. An authorized configurator can inspect the list, explain the consequence,
   cancel before submission and then withdraw it once. Verify one accepted source
   change, zero journey/stage/task/contact effects and understandable accepted
   result/focus even when a settings filter removes the row.
2. From an already assessed and an unassessed existing journey, perform authorized
   stage change and first assessment after withdrawal. Independently retired stages
   remain unavailable for fresh selection; current references remain intelligible.
   No replacement chooser, migration chore or configuration detour appears merely
   because the list stopped admitting new work.
3. Execute actual-source races for new admission and existing-stage change, and
   simulate response loss, stale caches, duplicate clicks, delayed callbacks and
   permission changes in the browser. The presented accepted/rejected/unconfirmed
   result matches source receipts/revision; no hidden disclosure or blind duplicate
   effect occurs. Exercise the same distinctions in a mixed finite reviewed group.
4. Once return policy is explicit, cover pause, closure and qualified return for
   both assessed/unassessed journeys. Show what can be done now and next without
   implying withdrawal itself reopens work or grants editing. Separately exercise
   actual empty-stage and last-applicable-list/default cases under their chosen
   source policies; do not choose those policies through test fixtures.
5. Verify ordinary views, history, filters and offered reports with withdrawn lists,
   retired stages, equal labels, partial coverage and revoked access. Retained work
   does not disappear through active-list filtering; zero/unavailable/partial remain
   distinct. Full names and the “new work” qualification survive translation/RTL.
6. In actual browsers, complete admin withdrawal and daily assessment/recovery with
   keyboard, screen reader and touch. Check visible focus, labels/status/error
   relationships, Core 44px targets, 200% text resize, 320 CSS px effective reflow,
   long text, mobile soft keyboard and reduced motion. Keep essential explanation
   available without hover; low bandwidth must show honest pending/recovery, not
   imply an offline queue. Record devices/assistive-technology versions and failures.
7. Representative authorized configurators, staff and missionaries can distinguish
   withdrawn list, retired stage and paused/closed journey; explain why existing
   work can continue while new use is unavailable; identify next work and recover
   an uncertain result without moderator rescue for a critical action. Record
   observed confusion and corrections. No invented sample size, time budget or
   aesthetic claim replaces that evidence; reproduced critical confusion blocks
   expansion of the affected flow.

These are future proof obligations, not results. Real source/API/database authority,
concurrency and rollout evidence must support the browser states; attractive copy
alone cannot enforce the distinction that makes A useful.

## Consolidated review disposition

The [completed D15 review](../phase27-d15-adversarial-review.md) reconciles this
research into an exact amended decision, including return, reversible
availability with saved-list retention, usable retained catalogs and zero-new-list
treatment. The founder explicitly ratified that decision and its safeguards on
2026-10-10. Earlier proposed labels and reservations here record the evidence-stage
scope, not a competing current recommendation. The full
review defines the owner-native dependency, naming-conflict and release-proof
requirements. No product implementation follows from publication of this appendix.
