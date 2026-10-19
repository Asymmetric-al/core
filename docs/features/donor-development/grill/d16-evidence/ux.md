# D16 evidence — choosing an appropriate approved stage list

2026-10-10. **UX recommendation: retain A.** Research against Core HEAD
`225c02e9499bd6c0d493223cd4b1a4120ff787e3`,
[Q16](../phase27-q16-list-applicability.md) and ratified D1–D15. The founder
selected staff judgment among appropriate approved lists. This appendix proposes
interaction safeguards and acceptance proof; it is not shipped P27 functionality,
a final widget specification or observed ministry feedback.

## Decision, simplicity and strongest alternative

Use the shared organization-approved choices available for new work within the
actual source and permission boundaries. Explain their purpose well enough for
staff to choose; do not add a process-specific restriction system. “Approved” does
not mean universally visible, available across every entity or authorized for every
admission. Selecting a list does not authorize the supporter, ministry, purpose or
journey, and does not choose a stage or create another ordinary partnership.

The strongest B is a bounded allowed-list policy by kind of work. It can prevent
misclassification where the organization needs enforcement, without being a general
rule builder. It also requires maintained categories, editing authority, exceptions
and zero-choice behavior. A is coherent when readable guidance and accountable
judgment suffice. No research here proves that agencies universally prefer A.

Keep D4's contextual start: ask for missing or materially changed information.
A known, still-valid source choice must not become a repeated question. Conversely,
one eligible option, array order, a board column, the viewer's role or the last-used
list is not an already established choice. **Initial suggestions/defaults and exact
single-option behavior remain dependent decisions.** This review neither mandates
a picker click on every start nor quietly selects the sole option. Later switching
of an existing journey's list is also outside D16.

## Fresh primary evidence

Sources were retrieved/read **2026-10-10**; vendor applications were not exercised.
Dates below are publisher dates where stated, not inferred SaaS version pins.

| Source                                                                                                                                                                                                                                                    | Relevant observation and boundary                                                                                                                                                                                                                                                                       |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [HubSpot: create records on the updated index page](https://knowledge.hubspot.com/records/create-records-on-the-updated-index-page), updated 2026-09-02                                                                                                   | Board creation can prepopulate pipeline and stage. This is a useful counterexample: entry context can introduce implicit choices. D16 does not adopt those defaults or HubSpot's activity-association behavior. Review every offered Core entry path.                                                   |
| [HubSpot: set up and customize pipelines](https://knowledge.hubspot.com/object-settings/set-up-and-customize-pipelines), updated 2026-09-08                                                                                                               | Recommends separate pipelines for processes with different stages, and documents restricted pipeline access as an additional capability. This supports distinguishing process guidance from access configuration; vendor plans and sales semantics do not establish Core policy.                        |
| [Salesforce: considerations for record types and picklists](https://help.salesforce.com/s/articleView?id=sf.customize_recordtype_considerations.htm&language=en_US&type=0), undated                                                                       | A single profile-associated record type can avoid a creation prompt; record-type assignment is not itself record access. Names/descriptions can also reveal sensitive information. Core must separate choice, prompt behavior and disclosure; Salesforce's profile/default rules are not selected here. |
| [WCAG 2.2 On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html) and [SCR19 dependent selects](https://www.w3.org/WAI/WCAG22/Techniques/client-side-script/SCR19.html)                                                                      | Updating a dependent control can remain in the same context; a changed input must not unexpectedly change context. SCR19 illustrates placing the dependent control after its parent. These do not require an extra Apply button or ban every immediate field update.                                    |
| [WCAG 2.2 Redundant Entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html)                                                                                                                                                              | Reuse information already provided in the same process where applicable; essential, security-related or no-longer-valid information has exceptions. This supports D4, not indefinite cross-session remembering or retaining a stage that belongs to another list.                                       |
| [Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html), [Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) | Explain controls and material outcomes accessibly; preserve operation at narrow effective widths. Reading these documents does not qualify a complete Core interaction.                                                                                                                                 |

## Current Core reuse and a newly executed probe

The exact `base-maia`, Base UI, Zinc-oriented semantic-token contract remains in
[`packages/ui/AGENTS.md`](../../../../../packages/ui/AGENTS.md); do not create a
second picker system or app-local component fork. Relevant inspected source:

- [`SearchableSelect`](../../../../../packages/ui/components/shadcn/searchable-select.tsx:22)
  separates stable values from labels and supports disabled options. Lines 73–79
  build identities from `value`; lines 90–105 provide accessible trigger attributes
  but derive the visible selected label only from current options, otherwise showing
  the placeholder. Lines 129–139 use stable option values and a check indicator.
- The same component's lines 104–105 and 135–136 truncate labels. `renderOption`
  can customize option contents, but does not by itself qualify full-name access,
  guidance searchability or the selected summary. Lines 112–127 construct English
  labels and hardcode search/empty strings. A localized P27 composition must address
  these actual seams rather than assume translating the field label is sufficient.
- The separate [`TanStack form select wrapper`](../../../../../packages/ui/components/primitives/tanstack-form.tsx:522)
  passes the field value and ignores a null change callback at lines 531–535.
  It is not used in the probe and does not implement D16 dependent-field clearing.
- The current [`CRM infinite reader`](../../../../../packages/database/hooks/admin-crm-infinite.ts:192)
  deliberately retains previous data during queries, uses a 30-second stale period
  and disables focus refetch. This is evidence of an existing list-reading pattern,
  not a defect in its consumer or a qualified source of admission eligibility.

**New result: 1/1 actual-component test passed.** In the
[reproducible selector probe](source-probe/README.md), a controlled stage ID from
list A remains supplied by the caller while options are replaced with list B's
same-labelled stage. The trigger displays the placeholder, emits no change callback
and does not select B's identity. An explicit click selects B exactly once. Thus
refreshing options neither resets the caller's model nor silently binds by label.
Crucially, a placeholder cannot establish source absence or “Not yet assessed.”

This is jsdom execution of the real shared component, not a synthetic P27 UI.
Installed Node 24.19.0, Vitest 4.1.4, React 19.2.3 and Base UI 1.8.0 were used;
the repository manifests request Vitest 5.0.3 and React 19.3.0. Bun is unavailable.
The scoped configuration follows D11 because the earlier root-config run encountered
the installed Sentry `./config` export failure; that failure was not rerun here.
The adjacent test, configuration, JSON result and metadata record reproducibility
and exact limits. Existing D11 disabled-option, stable-ID and keyboard tests were
not repeated. This proves no P27 API, authorization, real browser or network behavior.

## Proposed minimal interaction

Within the ordinary start context, make **Stage list** understandable as the menu
used to assess this partnership. It is not the supporter's category, financial
status, assessment or permission level. Show the recognizable approved name and
optional short organizational guidance; a lightweight **View stages** affordance
can expose the actual stage names where useful. Do not require opening every
preview, reading an essay or visiting administration. Search is useful when the
catalog warrants it; D16 does not freeze a searchable combobox, cards or a wizard.

For example, hypothetical approved guidance could explain **Missionary support**
as developing continuing support for a ministry, and **Church partnerships** as
developing an organizational relationship with a church. A church supporting a
missionary can overlap both descriptions. Staff choose the fitting process; being
a church must not secretly force the second list. These examples establish no
Core taxonomy or actual tenant configuration. Use organization-written guidance
when present and approved stage names when absent; do not invent an authoritative
description from a list name. If guidance remains ambiguous, the allowed choice
remains available under A; do not add a mandatory justification or escalation.

Keep the chosen list readable in the draft alongside the optional stage. An
appropriate draft **Change** affordance should not resemble permission to switch
a saved journey's list. Previewing another list is not selecting it, selecting a
list is not selecting its first stage, and selecting a draft is not a successful
admission. Preserve the single ordinary start action and its truthful pending,
accepted or failed result. No additional Apply/confirmation ceremony is needed.

**Handle an intentional unsaved list change explicitly.** If the user changes A
to B after choosing an A-stage, remove that dependent stage from the submission
intent and visibly explain the reset, for example:

> Stage reset because you changed the list. Choose a stage for this list, or leave
> it Not yet assessed.

Show B's eligible stage choices and the resulting optional unassessed draft state
beside the list. The normal submission must make this final pair clear. Never carry
the hidden A-stage ID, match by label/rank, choose B's first stage or silently
restore an earlier assessment if the user returns to A. This is a proposed handling
of an unsaved dependent field, **not authority to clear an existing assessment**.
If a previously selected list/stage instead becomes invalid due to source changes,
reject/reconcile that explicit intent; do not silently turn it into unassessed.

If admission resolves to an existing journey with a different list, preserve its
source binding and assessment. Explain the authorized reuse result and appropriate
existing-work action; do not apply the abandoned draft list, create a duplicate to
satisfy it or imply that opening the draft permits a saved-list switch. Reveal only
what the caller may know. Any later switching capability needs its own decision.

## Distinct states and obvious next actions

| State                                 | Required meaning and recovery                                                                                                                                                                                                                                      |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Choices loading                       | Identify loading without claiming an empty catalog. Keep known authorized draft context visible; do not insert a default.                                                                                                                                          |
| Choices failed                        | Explain that choices could not be loaded and offer retry. Do not erase independently known authorized list/stage data or imply that no lists exist. Options fetch failure alone is not a new source eligibility rule.                                              |
| Search finds nothing                  | Explain that this search found no match; permit clearing it. Do not describe the whole catalog as empty or offer an unauthorized creation action.                                                                                                                  |
| Authoritatively no new-use choices    | D15 permits this configuration. Explain that new work currently has no available list and show only a real permitted repair path. Existing work continues. Unassessed stage does not substitute for a missing list.                                                |
| Choices/context withheld              | Use permission-safe wording and a real next action. Do not disclose hidden list names, counts or a speculative “Request access” workflow. Loss of access must not leave a stale selectable option.                                                                 |
| List withdrawn while drafting         | Reconcile against current source. New use is blocked; choose another permitted list if offered. An earlier accepted admission remains existing work. Qualified reuse of a retained journey follows D15 rather than treating all continued use as fresh attachment. |
| Stage retired/renamed                 | A rename keeps identity and should refresh the readable label. A newly retired stage cannot be freshly selected. Preserve an already saved retired assessment as D10 requires; an unsaved invalid intent needs explicit recovery.                                  |
| Slow/out-of-order options             | The latest chosen list governs guidance and stage options. A late A-response must not replace B's choices or enable an A-stage submission. Scope changes require fresh permitted context, not cross-scope cached labels.                                           |
| Submit pending/lost response/conflict | Preserve the submitted intent and distinguish accepted, rejected and unresolved outcomes. Reconcile the receipt before recreating work or changing the payload of a retry. Keep unrelated safe draft input; never claim success from picker closure.               |

D4 reviewed groups use the same source rules per member. Show the intended list and
optional stage clearly in the bounded review; shared intent can be summarized with
inspectable exceptions. Do not require identical clicks on every member when valid
information is already established. Preserve partial outcomes and retry identities;
D16 does not introduce a separate bulk stage-change feature or a live-query admission.

Use D14's governed naming rule and permitted contextual guidance for similar names;
do not expose raw UUIDs or hidden scope information to disambiguate. Distinguish
the system's **No stage recorded** condition from an actual tenant stage named
“Not yet assessed,” as D13 requires. Known zero, unknown and unavailable are different.

## Acceptance proof and risk priorities

These are proposed release criteria, not passed product tests. Likelihood is a
qualitative reuse judgment; no tenant incident rate or capacity target was measured.

1. **High impact; plausible with ordinary dependent controls:** in the real start
   flow choose A/stage-A, then B with the same-labelled stage-B. The user sees the
   dependent reset; neither stage-A nor stage-B is submitted without matching final
   intent. Test A→B→A, preview without selection and reverse-order network responses.
   Observe the actual request and accepted source pair, not only screen text.
2. **High impact; plausible under source changes:** withdraw the selected list,
   retire its selected stage, revoke access and change source scope before commit
   in separate cases. Assert no unauthorized admission or silent substitute; recovery
   preserves only safe input and discloses no hidden choice. An admission accepted
   before withdrawal remains correctly usable; existing-journey reuse retains its
   binding. These require source-boundary tests as well as browser evidence.
3. **Medium impact; likely if generic labels are reused:** separately exercise
   loading, options failure with known current data, zero new-use lists, empty search,
   permission-restricted results, rename, pending and lost response. Each displays
   the correct meaning and reachable remedy. No placeholder/N/A is interpreted as
   authoritative absence; retry does not duplicate admission.
4. **Medium impact; plausible from copying vendor defaults:** test each offered
   entry path, one/multiple eligible lists and an already valid supplied choice.
   Assert no unchosen default or stage inference and no redundant question for
   unchanged valid information. The later default/single-option decision must be
   qualified separately; this criterion does not answer it indirectly.
5. **Medium impact; known primitive limitations:** test full long names, duplicated
   stage labels across lists, localized guidance and mixed-direction text. At 320
   CSS-pixel effective width and 200% text size, people can obtain complete labels,
   distinguish list from stage, preview/change/select and recover without hover or
   hidden essential actions. Use Core's touch target convention, semantic tokens,
   visible focus and text/semantics beyond color. Check keyboard order, dismissal,
   retained focus and screen-reader announcements for reset/error/save states.
6. **UX judgment requires a real pilot:** give representative authorized users a
   church-supporting-a-missionary example, missing guidance and a changed draft list.
   Ask them to explain the selected process, optional stage and next action before
   submitting. Record wrong-list assumptions, accidental assessments and inability
   to recover; revise those causes. No invented pass rate, user quote or claim of
   beautiful UI follows from this document. Review the rendered Core design at
   mobile and desktop sizes, including slow responses, rather than accepting a
   component test or static screenshot as the full experience.

No new database mechanics experiment was necessary for this UX seam. D14/D15's
isolated proofs remain limited evidence for scoped membership/replay and retirement;
the D16 source command, every caller, cache boundary and complete user flow still
need their own implementation qualification. Only this appendix and the adjacent
research probe were written; no application code or real data was changed.

## Consolidated decision status

The [completed D16 review](../phase27-d16-adversarial-review.md) consolidates this
research and records Accept. The founder subsequently explicitly ratified its
exact decision and safeguards on 2026-10-10. Earlier recommendation language is
research provenance; no additional default, sole-option or saved-list correction
policy is inferred. [Q17](../phase27-q17-initial-list-choice.md) is unanswered.
