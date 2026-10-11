# Phase 27 D16 — clear staff choice from approved stage lists

2026-10-10 UTC. **Reviewed D16 explicitly ratified; review disposition: Accept.** The founder wants
clear, beautiful, intuitive UX/UI and careful edge-case handling. This review uses
Core HEAD `225c02e9499bd6c0d493223cd4b1a4120ff787e3`, the ratified D1–D15
boundaries and fresh source/primary-document evidence. This is the completed
decision review within `/grill-with-docs`, not an implementation or release claim.

The founder subsequently instructed, “Yes, ratify this amended D16.” The exact
decision and reviewed safeguards below are explicitly ratified on 2026-10-10.
This confirmation makes no additional default, sole-option or saved-list correction
decision. [Q17](phase27-q17-initial-list-choice.md) subsequently records A; the
[D17 review](phase27-d17-adversarial-review.md) accepts the visible sole/usual-list
initializer. Saved-choice correction remains separately reserved.

## Exact decision recorded

> **D16 — Let authorized people choose the appropriate approved stage list.**
> When deliberately starting new partnership work, an authorized person may
> choose from the organization's approved stage lists currently available for
> new work within the applicable source and permission boundaries. Do not add
> a separate set of rules restricting lists by kind of partnership, Party type,
> team, ministry, viewer or screen. Existing source validity and authorization
> remain mandatory; choosing a list grants no access or business authority.
>
> Make the choice understandable through clear names, available short purpose
> guidance and an easy way to inspect the stages when useful. Ask only for
> missing or materially changed information. A known valid choice need not be
> repeated, and ordinary users do not need configuration privileges to choose
> a list they are authorized to use.
>
> A new journey receives one source list. Its optional initial stage must belong
> to that exact list. Changing an unsaved list choice must visibly resolve an
> incompatible proposed stage; never translate a stage by its name or position.
> Existing or possibly already accepted work is not an unsaved draft: preserve
> its source binding and reconcile the actual result before any new action.
>
> Keep selection, pending submission, accepted work and failure visibly distinct.
> Preserve useful input and provide a permitted next action when a choice becomes
> unavailable. Apply D15 withdrawal rules and current permissions consistently
> across staff and missionary surfaces. A choice or preview does not start work,
> change an existing journey, create a duplicate or contact anyone.

**No material amendment to A is necessary.** This records its shared-choice policy
and makes inherited D4/D10–D15/P12 boundaries precise. It does not select a default,
automatically choose the sole visible option, require a chooser at every start,
authorize saved-list switching or impose a new mandatory guidance field. Those
were expressly reserved in [Q16](phase27-q16-list-applicability.md). Existing
permission limits are not a back door for inventing the rejected process-rule layer.

## Evidence and authority

| Evidence                                         | Scope and limit                                                                                                                              |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| [Ownership](d16-evidence/ownership.md)           | D4 and D14/D15 scope, owning ADR/OpenSpec/P27/P28 contracts, draft versus saved choice, and genuine dependent decisions.                     |
| [Authorization](d16-evidence/authorization.md)   | Catalog discovery, selection eligibility, admission/configuration powers, authorized coverage, context isolation and source acceptance.      |
| [Implementation](d16-evidence/implementation.md) | Fresh bounded code inspection, list/stage integrity and reuse hazards, earlier SQL evidence limits and why no repeated SQL probe was needed. |
| [UX](d16-evidence/ux.md)                         | Core components, concrete interaction states, primary accessibility/CRM guidance and the new installed-component probe.                      |
| [Ministry evidence](d16-evidence/ministry.md)    | Missions relevance, overlapping church/missionary purposes, strongest B case, published examples and unverified user assumptions.            |

**Repository facts.** [ADR-0001](../../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md)
and [CRM OpenSpec](../../../../openspec/specs/crm-core/spec.md:185) keep CRM truth in
Asym Postgres. [P27](../../../prds/sitestacker-parity/roadmap.md:4087) owns cultivation,
with P28 consuming one shared model. P9 owns identity/assignments/shared tasks;
P12 owns current source access and disclosure; P33 owns metric meaning. Finance,
communication and participation facts retain their owners. The shared
[API boundary](../../../guides/architecture/data-access-boundary.md) applies to
multi-table admission; browser convenience cannot become a competing authority.

**Intent reconciliation.** The roadmap requires supplied staff, support-raising
and church presets; its P27/P28 wording says P28 uses a support-raising preset.
Preserve the supplied-preset and shared-model commitments. D14 permits additional
approved lists; D16 now rejects mandatory list assignment based solely on app,
Party type, team or ministry label. Any compulsory or exclusive interpretation of
the older wording conflicts with this later explicit founder choice and must be
reconciled at the canonical P27/P28 owner in the authorized formal-spec workflow.
Do not retroactively describe the earlier prescription as merely an example, or
copy contradictory requirements. Current source permissions still apply. This is
an explicit internal intent resolution, not an imported vendor practice overriding
a repository decision; no formal owner document is edited during this interview.

**Current source.** Bounded searches in API/database/migrations/admin/missionary
paths found no authoritative P27 list-selection/admission implementation. Shared
selectors, personal CRM views and donor-status boards exist, but represent different
facts. The exact inspected paths and limitations are in the appendices. No claim
about every deployment or a shipped P27 vulnerability follows.

**Fresh primary facts.** Salesforce distinguishes record-type choice from record
access. HubSpot documents both shared processes and administrative restrictions;
it does not prove A universally best. MPDX's ministry/account conventions do not
authorize a second journey or catalog per viewer. Missions examples show that a
church may support missionary work: the example names “Church partnerships” and
“Missionary support” can overlap. Purpose guidance must explain the process rather
than masquerade as a donor-type rule. Source URLs, dates and product limits are
preserved in the ministry/UX appendices.

[W3C form instructions](https://www.w3.org/WAI/tutorials/forms/instructions/) support
visible, programmatically associated help and clear required/optional meaning.
[WCAG On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html) supports
predictable effects of selection. [GOV.UK's select guidance](https://design-system.service.gov.uk/components/select/)
warns about difficult long selectors in public services. Adopt the usability lesson,
not its public-service page flow, visual system, extra qualifying questions or a
default policy. Core's D4 and base-maia remain governing.

**Inference and product judgment.** Shared approved choices are the smallest policy
consistent with the founder's flexibility goal. Actual agency preference, workload,
choice-error rate and usability success have not been measured. Independent review
is engineering feedback, not a practitioner interview. No numeric capacity, time-to-
complete or satisfaction claim is made. Release criteria below require that evidence.

## Strongest alternative and minimal permanent solution

B can prevent a process from being used in the wrong operational context and help
an organization enforce a standardized method. That benefit is real when the
organization needs enforcement. Its costs are applicability configuration, another
source of empty choices, ongoing maintenance and future change/exception handling.
The founder chose staff judgment within organizational approval. Do not implement
B through automatic Party-type filters, hardcoded missionary-only lists, role-based
process menus, required acknowledgments or a generic rules builder.

An organization can already keep a small useful catalog, improve names/guidance,
inspect stage definitions and withdraw obsolete lists under D14/D15. These simpler
capabilities reduce confusion without more rules. They do not justify a new quota,
forced catalog cleanup, compulsory preview or approval step. The choice does not
establish that any two lists mean the same thing or that every source permission
scope sees an identical catalog.

## Concrete UI and interaction contract

Use Core's `@asym/ui`, Base UI and base-maia tokens. Keep the supporter/ministry
context recognizable, the list choice secondary to the work being started, and one
clear primary action for the existing D4 admission. Do not turn a process menu into
an onboarding wizard or another configuration screen.

An illustrative state **after the user has chosen a list**, not a selected default:

```text
Start partnership work
[Existing supporter and identified ministry context]

Stage list
[Partner support                         ▾]
For ongoing prayer and financial partnership.
View stages

[Optional initial stage and existing lead/next-work controls]

Start partnership work                   Cancel
```

The example guidance is illustrative copy, not a prescribed missions process.
Keep descriptions short when supplied; missing optional guidance does not make a
valid list unusable. Available stage names and source-qualified details should be
inspectable without leaving or committing the form. A details action is optional,
not a required preview/approval checkpoint. Do not cram full histories or every
stage into every option. Search or a different shared single-choice composition
may help a larger catalog; choose based on actual usage and accessibility evidence,
not an arbitrary option-count threshold or a new component library.

| Situation                                  | Clear behavior and next action                                                                                                                                                                                                                                                                    |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Valid choice already established           | Show its understandable name/context; do not demand another selection merely because a new screen or actor opened the work. Preserve current authority and distinguish a proposed choice from accepted binding.                                                                                   |
| Choice missing                             | Present permitted current choices with enough information to compare. The ordinary Start action makes the admission; selecting or inspecting an option does not submit it.                                                                                                                        |
| One visible option                         | It must not be mistaken for the complete source catalog. Whether a complete, authorized sole option is filled in automatically remains a separate initial-choice decision. Do not invent that behavior here.                                                                                      |
| Multiple plausible lists                   | Show purpose guidance/stage details when authorized. Similar names or overlapping audiences are not evidence of equivalence or a reason for hidden rules.                                                                                                                                         |
| Genuine zero authorized choices            | Explain that no list is available to this person for this work and show the permitted configuration/help route. Do not assert that the organization has no lists or reveal hidden choices/counts.                                                                                                 |
| Search has no matches                      | Offer to clear/change the search. Do not turn this into a zero-catalog or permission error.                                                                                                                                                                                                       |
| Loading, partial results or failure        | Show the true state; retain independently established current facts. Retry is distinct from changing configuration. A partial page cannot prove one or zero total choices.                                                                                                                        |
| Intentional unsaved list change            | Preserve unrelated inputs. If the proposed stage belongs to the former list, visibly invalidate it or clear that draft field with a concise explanation. Let the person choose a stage from the new list or knowingly start unassessed under D13. No additional modal/acknowledgment is required. |
| Submitted list/stage mismatch              | Reject the invalid intent without partial admission. The server must not silently clear the stage, guess an equivalent name or accept a different list. Retain permitted input for correction.                                                                                                    |
| Choice withdrawn/revoked before acceptance | Explain only the permitted current problem and let the user make a valid revised choice. Do not substitute the next list. D15 defines the actual admission-versus-withdrawal order.                                                                                                               |
| Existing journey found                     | Preserve its actual list/stage, including a retained withdrawn list under D15. Show the authorized reuse result. The starting form is not a saved-list switch or a reason to duplicate ordinary work.                                                                                             |
| Pending or unconfirmed admission           | Preserve the submitted intent, reconcile its result and prevent a late callback from repainting another context. Never treat possibly accepted work as an ordinary unsaved form.                                                                                                                  |
| Permission/context changes                 | Invalidate affected choices and unsafe displayed data, re-prove authority and preserve only what can still be shown. Do not leak the previous tenant/assignment's catalog or apply an old result to the new work.                                                                                 |
| User wants to correct a saved choice       | Use only a separately qualified correction/switch operation with history and current authority. Do not advertise unsupported Change list or recommend deleting/recreating the journey. This recovery contract is a release prerequisite if choice is offered.                                     |

List identity is independent of language and display text. Support long
international names, translation and RTL without indistinguishable truncation.
Use visible labels, associated descriptions/errors, text status, visible focus,
keyboard/screen-reader operation and Core touch targets. Test 200% text resize and
320 CSS-pixel reflow separately, mobile soft keyboard, reduced motion and slow
networks. Important distinctions cannot rely on color, hover, a transient toast
or an unexplained disabled button. Announce relevant state changes without moving
focus unexpectedly. Selecting a list should not navigate or auto-submit.

Dates/times, where shown in history, use the user's context; source ordering and
permission do not depend on local midnight or a backdated input. D16 adds no
international-address fields, donor/public steps, giving checkout questions or
new offline-storage promise. Staff and authorized missionaries share the same
source meaning and may have different permitted actions.

## Exact requirements to carry forward

**R01 — Shared approved choice, no new process gate.** An authorized person MAY
choose a currently approved, new-use-eligible list within the actual governed
catalog/source scope. D16 SHALL NOT add process-specific restrictions by Party
type, viewer, surface, ministry, team or new taxonomy. Existing P12/source
constraints remain. List labels/guidance are explanatory, not executable policy,
financial probability, participation, consent or identity rules. No new approval
queue, capability hierarchy, personal pipeline or per-list permission engine follows.

**R02 — Discovery, use, admission and configuration are distinct.** Server-side
trusted context SHALL establish tenant, active assignment/service context, purpose,
source/entity scope, current capabilities, field/history floors, residency and
epoch. Catalog discovery/read, current eligibility to choose, deliberate admission
and configuration mutation SHALL be separately enforced. Staff need the rights
for the particular read/use/write, not catalog-management power merely to choose.
Caller-provided approved/tenant/actor/owner flags are not authority. A broad staff
role, an earlier picker response or list possession cannot authorize the admission.

**R03 — Authorized coverage and context-bound reads.** Options, search, counts and
details SHALL be authorized before disclosure. Distinguish complete authorized
zero, one or many choices from incomplete results, search-no-match, denied and
failed reads. Never infer organization-wide absence or expose inaccessible options.
Cache/query identity, draft association, pagination, previews and late callbacks
SHALL carry all relevant trusted tenant/context/source/permission distinctions;
same user ID is insufficient proof of unchanged authority. Context changes and
revocation SHALL prevent stale display/submission and stale rollback overwriting
a newer context. No cache is a write authority or permission grant.

**R04 — Exact source binding and optional stage.** Accepted new work SHALL have
one required, valid source list; an optional initial stage SHALL belong to that
same tenant/list. Enforce required scope independently of nullable stage, with
appropriate stable primary/unique/composite foreign keys and immutable ordinary
scope bindings. Names, ranks, translated labels or matching text do not establish
membership/equivalence. Availability is validated at the source boundary; a
retained reference is not required to remain eligible for new admissions forever.
No cascade, SET NULL or generic update may erase or reparent accepted work/history.
This decision introduces no money, precision, storage or date-type changes.

**R05 — Truthful unsaved revision of intent.** Before submission, staff MAY revise
the proposed list as part of forming the same new-work input. A resulting invalid
stage proposal SHALL be visibly resolved; unrelated input remains. A clear local
reset of only the incompatible draft stage, or a flagged invalid draft requiring
resolution, is acceptable. The final selected pair or intentional stage absence
must be apparent at the ordinary submit action. Do not require a separate Save
list step, draft history or a repeated confirmation ceremony. The server SHALL
reject a submitted stale/wrong-list stage; it SHALL NOT convert it to absence or
another stage. This gives no authority to clear an accepted assessment or switch
an existing journey's list.

**R06 — Admission and reuse preserve D3/D4.** Selection and preview SHALL NOT
create/admit work or emit stage/task/contact effects. The actual deliberate
admission remains D4's atomic member operation, including its valid list, optional
stage, trusted attribution, required history/result and dated follow-up or owned
actionable exception. List choice SHALL NOT enter ordinary-journey identity so
that two lists can create duplicate same-purpose work. Resolve existing/reused
work under D2/D3/D4 without resetting its binding/stage/lead or revealing hidden
duplicates. A different submitted list is not an implicit saved-work switch.

**R07 — Current acceptance and material change.** Validate actual selected
identity, available stages, list new-use status, source validity and current
authority at acceptance using D15's ordered eligibility boundary. A form opening,
preview, search response, queued job or reviewed group is not admission. Check
each still-unaccepted member; earlier accepted members remain, permitted reuse
follows current binding, and retries do not expand or retarget the group. Do not
require the user to start over merely because an unrelated list was added or
same-meaning wording changed. Relevant revoked/withdrawn targets or changed intent
must produce a current, permitted and actionable outcome, never guessed fallback.

**R08 — Submitted intent, retry and correction.** Bind durable submitted business
intent to its normalized list/stage/context/subject/purpose payload under D4.
Exact retries recover the original permitted outcome; changed payload under the
same bound submitted intent conflicts. A never-submitted draft edit does not require an
idempotency event. After submission or ambiguous success, reconcile the original
effect before offering a changed selection as new work. Confirmed nonacceptance
can permit a qualified revised intent; an unknown outcome cannot. Use source receipts and
current authority, not cached optimism or transport UUIDs alone. Precommit failure
leaves no partial admission; lost response after commit does not undo it. Late or
out-of-order responses must not overwrite current work or newer UI context.

**R09 — Database and all-door enforcement.** Enforce R02/R04/R06–R08 through the
shared `packages/api` source command with suitable database constraints. Qualify
actual table/column/function grants, exposed schemas, SELECT visibility, RLS
USING/WITH CHECK semantics, views, RPC execution owners/search paths and privileged
service paths. Ordinary updates cannot transform allowed rows into another tenant,
list or falsely attributed author/owner. Browser raw writes, imports, jobs,
upserts, repair and mixed API versions cannot bypass the same source boundaries.
RLS does not replace business invariants. PostgreSQL's effective policy composition
and execution roles must be inspected; omitted WITH CHECK is not inherently a
bypass, and definer/view behavior is privilege-dependent.

**R10 — Existing work and independent owners remain intact.** D15 governs retained
withdrawn lists, resume/reopen and new attachments. D16 neither changes that
lifecycle nor selects switching/defaults. Staff and missionary views read the
same accepted binding; opening another screen or changing a filter cannot change
it. List choice alone SHALL NOT change giving, commitments, recognition, consent,
participation, responsibility, tasks, clocks or donor communication. Legitimate
effects of actual accepted admission retain their owning contracts and one
source-purpose effect identity; a picker event is not DON-14 enrollment.

**R11 — Comprehensible shared UI.** Implement the state table through Core's
shared base-maia components with clear names, permitted optional guidance/details,
proper labels and one contextual admission action. Do not force every person to
choose again when the valid intent is established. Resolve current versus proposed
versus accepted versus unconfirmed state explicitly. Zero options, no search match,
loading, failure, withdrawal and permission loss need truthful permitted recovery.
Do not force a default, auto-select the first/sole visible item, require preview,
auto-submit, mandate guidance prose or introduce configuration into ordinary work
under the guise of this decision. Such initial-choice policy remains separate.

**R12 — Privacy, reporting and evidence.** List names/guidance/usage can be
sensitive. Minimize metadata to the permitted selection purpose; plain text must
remain escaped and exports must use qualified encoding. Apply current disclosure
to history, counts, generated documents and exports; separately govern log/backup
access, retention and safe restore under their owning contracts. No private catalog
content in ordinary telemetry. Equal labels retain distinct identity/provenance;
they do not prove equal meaning, donor value or financial progress. Later reads
must preserve historical meaning and lawful retention/redaction. A read model,
saved view or external CRM cannot become another source of binding truth.

**R13 — Release completeness without invented policy.** Before exposing this
choice as an operable tenant flow, qualify the source catalog scope and minimum
read/use capabilities, actual initial-choice behavior, zero/partial/error UX and
safe correction of mistaken accepted list choice. D16 does not itself choose
initial defaults, sole-choice auto-fill, general switching or correction rules.
Those are subsequent genuine product decisions, not reasons to ship a dead end.
Unsupported controls remain absent until qualified; deleting/recreating work is
not a recovery substitute. Preserve D14/D15 creation/lifecycle release gates.
No second-stage approval or arbitrary rule engine is needed to satisfy this gate.

**R14 — Migration, compatibility and performance.** Inventory all readers,
writers, imports and caches that assume one preset per surface, fixed enums,
label identity or a shared default. Reconcile retained data only from evidenced
bindings; no guessing, bulk reassessment or duplicate journeys. Deploy compatible
schema/readers/source guards before activating choice and fence old writers.
Roll-forward/restore must preserve accepted bindings, receipts, permissions and
redaction; a kill switch can stop unsafe admission without hiding permitted
existing work. Bound option/purpose-detail reads and search; avoid per-option
journey scans and eager full histories. Measure real list/stage counts, tenant
skew, payload units, query plans, milliseconds and concurrency before setting
limits. Paginate with explicit coverage; do not derive safety from a loaded page.

**R15 — Audit, proof and traceability.** Keep technical diagnostics, durable
admission/binding history and security audit distinct. Record actual accepted
source attribution and intent, not every exploratory dropdown click as an
assessment or donor activity. Carry D16/R01–R15/AC01–AC20 into the glossary/log,
later authorized `/to-prd` owner/spec/design/tasks, then `/to-issues` tickets and
implementation/release evidence. Reconcile obsolete preset restrictions at their
canonical sources in that workflow. No new ADR is needed merely to restate current
source ownership. No interview text or isolated primitive test proves a shipped
feature, usability success or production authorization.

## Full category review

Severity and likelihood describe prospective failures, not measured incidents.
Every concern names the effect on A and exact permanent requirement/proof. The
requirements preserve the offered choice and governing boundaries; no new product
policy is hidden inside a safeguard.

| Category                                                         | Material concern; what could go wrong and why it matters                                                                                                                                                                         | Evidence, severity/likelihood, effect and permanent prevention                                                                                                                                                                                                                    |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Problem validity, necessity and alternatives                  | **Yes.** Additional lists may confuse staff, while rejecting B without assessing its enforcement benefit could solve the wrong problem.                                                                                          | Q16 and ministry evidence. **Medium / plausible. Narrows A:** small useful approved catalog and explanatory guidance, not compulsory proliferation or a rule engine. R01/R11/R13; AC01/02/20. B remains the strongest alternative when process enforcement is a real requirement. |
| 2. Brittleness                                                   | **Yes.** Hardcoded app/Party-type filters or first-option assumptions break when tenants add lists or a church supports a missionary.                                                                                            | P27/P28 wording, ministry overlap and source controls. **High / plausible. Narrows:** exact shared choice scope with current authority; no hidden process mapping. R01/R03/R07; AC01/02/07.                                                                                       |
| 3. Technical debt                                                | **Yes.** Per-screen catalog stores, local permission rules or use of personal saved-view defaults would duplicate authority.                                                                                                     | ADR-0001, API boundary, inspected CRM hooks. **High / plausible. Preserves:** one source catalog/binding, scoped read models and shared commands. R02/R04/R09/R14; AC12/14/18.                                                                                                    |
| 4. Edge cases                                                    | **Yes.** Similar names, zero/partial choices, changed drafts, reuse or uncertain saves could produce wrong or duplicate work.                                                                                                    | Current selector and D3/D4/D13/D15. **High / plausible. Narrows:** explicit state table, valid pair and recovery. R03–R08/R11; AC03–11/16.                                                                                                                                        |
| 5. Footguns                                                      | **Yes.** Selecting a list may auto-submit; a stale stage may silently clear or bind by label; Change list may mutate saved work.                                                                                                 | Source primitive/grid behavior and D4/D12. **High / plausible. Narrows:** draft versus accepted distinction and one deliberate admission. R04–R08/R11; AC04/05/08/10.                                                                                                             |
| 6. Tenant safety                                                 | **Yes.** Same-user context switches, incomplete cache keys or late callbacks may display or apply another tenant/assignment's choices.                                                                                           | Authorization appendix's current cache/session patterns. **Critical / plausible. Preserves:** full relevant context isolation and server revalidation, never browser-supplied authority. R02/R03/R09/R12; AC12/13/17.                                                             |
| 7. Database, RLS and authorization safety                        | **Yes.** Separate valid FKs, nullable stage, broad updates or service/RPC bypass can accept a wrong-list stage or forbidden row transformation.                                                                                  | D14 relational evidence, P12, source API limits. **Critical / plausible. Preserves:** composite membership, independent required scope, grants/effective policies and canonical command. R04/R09; AC05/14/15. No new monetary type or precision requirement.                      |
| 8. Overengineering                                               | **Yes.** Universal applicability rules, a type registry, mandatory comparison wizard or new permissions might reintroduce B or burden normal work.                                                                               | Q16's explicit fork, D4 minimal input and D14 bounds. **Medium / plausible. Narrows:** staff judgment with approved choices and optional detail. R01/R11/R13; AC01/02/20.                                                                                                         |
| 9. UX/UI and user friction                                       | **Yes.** Users may not understand a list, lose selected context or confuse a placeholder with no stage; narrow/mobile/assistive use may hide names and next actions.                                                             | Actual selector probe, Core UI rules, W3C/GOV.UK guidance. **High / likely if composed naively. Preserves:** state matrix and accessible contextual flow, not visual polish alone. R05/R11; AC03–08/16/20.                                                                        |
| 10. Source of truth, ownership and invariants                    | **Yes.** A selected option, remembered preference or source consumer may become the write authority or new ordinary-journey identity.                                                                                            | ADR-0001/P9/P12/P27/P28, D3/D4. **High / plausible. Narrows:** accepted one-list binding, explicit admission, immutable history and source-owned identity. R04/R06/R10/R15; AC08/10/14/19.                                                                                        |
| 11. Hidden coupling                                              | **Yes.** List name/type may alter finance, participation, assigned staff, workflow triggers or contact eligibility.                                                                                                              | P27 ownership and DON-14, overlapping missions processes. **High / plausible. Preserves:** selection has no business effect; actual admission effects stay with their owners. R01/R06/R10; AC02/19.                                                                               |
| 12. Failure modes                                                | **Yes.** A fetch failure may become an empty catalog, or lost response may cause another admission with a different list.                                                                                                        | Source cache/selector behavior, D4 durable member results. **High / plausible. Narrows:** distinct failures, preserved valid input and reconciliation before revised submitted intent. R03/R07/R08/R11; AC06/10/11/17.                                                            |
| 13. Lifecycle, temporal correctness, concurrency and idempotency | **Yes.** Withdrawal, permission change, competing starts or out-of-order responses can change the meaning of an earlier choice.                                                                                                  | D15 ordered races, D3/D4 uniqueness/reuse and current auth contracts. **High / plausible. Preserves:** acceptance-time eligibility, normalized submitted intent and independent member results. R06–R08; AC09–13.                                                                 |
| 14. Data integrity                                               | **Yes.** Name-based stage carryover, silent nulling, duplicate ordinary journeys or guessed imports can corrupt assessment and history.                                                                                          | Installed primitive probe plus D14 membership/identity evidence. **High / plausible. Narrows:** exact pair, explicit absence, no switch on reuse or guessed backfill. R04–R06/R14; AC04/05/08/14/18.                                                                              |
| 15. Security and privacy                                         | **Yes.** Catalog names, guidance, previews, counts or logs may reveal sensitive work; choice may be mistaken for permission.                                                                                                     | P12 and authorization/ministry evidence. **Critical / plausible. Preserves:** independently authorized minimized discovery and current disclosure across exports/history/caches. R02/R03/R12; AC12–15/17.                                                                         |
| 16. Scalability and performance                                  | **Yes.** Shared options can become slow through eager stages/history, N+1 queries or unreliable partial-result assumptions.                                                                                                      | Source read patterns; no production-shaped catalog evidence supplied. **Medium / plausible as catalogs grow. Preserves:** bounded scoped queries/details, explicit coverage and measured budgets. R03/R14; AC07/18. No invented quota or response-time claim.                     |
| 17. Operational burden                                           | **Yes.** Poor names or lack of a safe saved-choice correction path could require training workarounds, duplicate records or SQL repair.                                                                                          | Ministry/UX evidence and Q16's switching reservation. **Medium / plausible. Narrows:** maintain catalog through existing settings and qualify recovery before release. R11/R13; AC02/16/20. No automatic cleanup or new admin queue.                                              |
| 18. Observability and auditability                               | **Yes.** Logs may record exploratory choice as fact or omit the accepted list and original actor/intent, making recovery unsafe.                                                                                                 | D4 source/result history and current generic mutation limitations. **High / plausible. Preserves:** durable accepted evidence separate from diagnostics and private content. R06/R08/R15; AC10/11/19 and monitor table.                                                           |
| 19. Dependency and integration risks                             | **Yes.** Vendor record-type restrictions, a CMS workflow or saved-view fallback may be copied into Core as authority; old imports may write bindings directly.                                                                   | Current CRM/MPDX/Salesforce/HubSpot comparisons and ADR-0001. **High / plausible. Narrows:** vendor guidance is comparative only; Core-owned choice/acceptance through all doors. R01/R09/R10/R14; AC01/14/18/19. No new provider is required.                                    |
| 20. Migration, rollout and upgrade risks                         | **Yes.** Mixed versions can force a preset by surface, misread IDs or overwrite new bindings; rollback may reopen unsafe writers.                                                                                                | Bounded current-source absence and old reader semantics. **High / plausible. Preserves:** compatibility-first rollout, evidenced backfill and safe roll-forward/restore. R14; AC18.                                                                                               |
| 21. Testability, traceability and proof                          | **Yes.** “Choose appropriate” is too vague without exact options/authority/draft/reuse outcomes; one UI test cannot prove the product.                                                                                           | Q16 scope and actual evidence limits. **High / certain qualification gap before release. Narrows:** R01–R15, AC01–AC20 and canonical trace chain. No extra founder answer is inferred.                                                                                            |
| 22. Other development hazards                                    | **No additional material concern beyond those above.** Checked need for new money/address/storage types, public/donor steps, mandatory previews, offline draft storage, optional-workflow dependence and an unnecessary new ADR. | No such feature is required. R01/R10/R11/R13/R15 keep this decision bounded; identified dependency/privacy/rollback risks are already covered in their respective categories.                                                                                                     |

## Acceptance criteria and release evidence

These are independently testable future outcomes. Execute them on the qualified
source/API/actual roles and real browser flow, not solely through privileged fixtures.

| ID   | Required outcome                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC01 | Given the same valid source/permission scope, approved new-use lists are not further filtered by viewer app, Party type, ministry/team label or an unselected process rule. Unauthorized/withdrawn choices remain unavailable.                                                                                                                                                                                                                                                                                                                     |
| AC02 | A church supporting a missionary can use the appropriate approved process without a hidden church-versus-missionary gate. Names and permitted guidance/details help distinguish purpose; missing optional guidance does not invalidate a list.                                                                                                                                                                                                                                                                                                     |
| AC03 | An already established valid choice is clearly shown without a repeated selection ceremony. A missing choice is understandable; opening, searching and previewing do not admit work or modify a source record. No default/sole-choice behavior is inferred by this test.                                                                                                                                                                                                                                                                           |
| AC04 | In an unsent form, change from list A with proposed stage A1 to list B containing a same-label B1. Preserve other inputs, visibly resolve the invalid stage and admit only the explicitly final valid B/stage-or-absence intent. No name/rank mapping occurs.                                                                                                                                                                                                                                                                                      |
| AC05 | Submit A1 with list B, foreign tenant/list, absent required scope or stale stage eligibility. Reject without partial journey/history/work. The server never silently changes the submitted stage to null or B1.                                                                                                                                                                                                                                                                                                                                    |
| AC06 | Genuine authorized zero, search-no-match, loading, denied and network/source failure have distinguishable permitted UI outcomes. User sees the appropriate retry/search/settings/help path; none claims global absence or reveals hidden choices.                                                                                                                                                                                                                                                                                                  |
| AC07 | With paged/partial choices or concurrent catalog edits, no sole/default inference arises from a loaded subset. An unrelated new list or same-meaning rename does not require re-entering unaffected valid information.                                                                                                                                                                                                                                                                                                                             |
| AC08 | Start intent discovers an existing ordinary journey with another or withdrawn retained list: authorized reuse preserves its binding/stage/lead and returns a truthful result, without creating a second journey or switching it. Hidden reuse remains protected.                                                                                                                                                                                                                                                                                   |
| AC09 | Two concurrent same-purpose starts with different selected lists obey D3/D4's qualified collision/reuse policy; list ID does not create another ordinary identity. Admission/withdrawal and permission-change races follow actual acceptance order.                                                                                                                                                                                                                                                                                                |
| AC10 | Exact submitted-intent retry produces one durable effect/result; changed list/stage/payload under the same bound submitted intent conflicts. Lost response is reconciled before a changed selection is offered as new work; confirmed nonacceptance permits only the qualified revised-intent path. No stale callback regresses current context.                                                                                                                                                                                                   |
| AC11 | A fixed reviewed group mixes accepted, permitted reused, newly ineligible and unconfirmed members. Preserve accepted work, independently reject later invalid members, reconcile unknown results and never expand or retarget the reviewed group.                                                                                                                                                                                                                                                                                                  |
| AC12 | Test same user across tenant/assignment/source/policy changes, two users with different read/use/config powers, revoked authority and appropriate service contexts. Old options/drafts/results cannot leak or authorize another context. Config management is not required merely to use an independently authorized list.                                                                                                                                                                                                                         |
| AC13 | Late failed optimistic request, out-of-order search/detail responses and token/context refresh cannot restore a prior context's catalog or overwrite newer accepted work. Current source and disclosure remain authoritative.                                                                                                                                                                                                                                                                                                                      |
| AC14 | Test real grants/RLS/RPC/views/raw access/upsert/import/jobs/repair: an allowed row update cannot mutate tenant, source list, trusted actor/owner or history into a forbidden state. Optional stage never weakens required list scope.                                                                                                                                                                                                                                                                                                             |
| AC15 | Names/guidance/usage counts/previews/export and audit are limited to independently authorized purpose and context. Hidden-present versus absent yields no unauthorized distinguishing result; logs omit protected descriptive content.                                                                                                                                                                                                                                                                                                             |
| AC16 | Real browser keyboard/screen-reader/touch and narrow layouts preserve full distinguishable names, labels, focus and next actions. Check 200% text, 320 CSS-pixel reflow, RTL, long text, soft keyboard, reduced motion and slow-network recovery; complement automated accessibility with manual checks.                                                                                                                                                                                                                                           |
| AC17 | Options failure does not erase independently established list/stage truth or become Not yet assessed. On uncertain admission, pending/unconfirmed/accepted are truthful, input remains protected, and closing the view does not claim to undo a commit.                                                                                                                                                                                                                                                                                            |
| AC18 | Before activation, exercise evidenced retained data, mixed readers/writers, failed rollout, kill switch and restore; accepted bindings/history/receipts survive. Exercise the separately qualified recovery for a mistaken saved list choice, preserving journey identity and history without deletion/recreation; this test does not select general switching policy. Measure authorized complete/paged catalog and details at declared workload boundaries and one-over cases, with plans, query counts, payload units, latency and concurrency. |
| AC19 | Exploratory choices create no business audit event, stage transition, task, DON-14 admission or outreach. Actual deliberate admission records its correct list and attribution and produces only its owner-qualified required effects once.                                                                                                                                                                                                                                                                                                        |
| AC20 | Representative staff/missionaries/configurators can explain what the list controls, compare overlapping purposes, select appropriately, revise an unsaved choice, find existing work and recover from zero/unconfirmed states. Any observed belief that choice grants access, changes giving or creates another partnership is a release blocker for that flow; record findings and retest fixes.                                                                                                                                                  |

## Evidence actually executed and its limits

Fresh inspection and primary-source retrieval are recorded in the appendices.
The new [actual-component probe](d16-evidence/source-probe/README.md) passed
**1/1 test**: replacing list A's options with list B's same-label/different-ID stage
shows a placeholder while the caller still supplies A's old ID. No change callback
or automatic B selection occurs; explicitly choosing B emits its ID once. This
demonstrates why refreshing options alone cannot validate/reset a dependent field.
It is a composition hazard, not a proven defect in an existing P27 flow.

The test uses the real shared selector under jsdom with installed Node 24.19.0,
Base UI 1.8.0, React 19.2.3 and Vitest 4.1.4. Repository manifest React/Vitest
versions differ; a scoped evidence configuration was used and Bun is unavailable.
The exact test, JSON result, command, source hashes and limitations are preserved.
It cannot qualify Core admission, authorization, production UX, screen readers,
migration, workload capacity or the root CI gate.

An independent synthesis review checked the consolidated decision against all five
appendices. Its corrections are incorporated: preserve the roadmap's actual preset
prescription before resolving the conflict, bind in-flight as well as accepted
submitted intent, and explicitly test the separately qualified saved-choice
recovery gate. These are precision/proof corrections, not a new product policy.
The [documentation checks](d16-evidence/review-checks.json) verify category,
requirement and acceptance coverage, local links and the saved probe's report/hash
consistency. They do not rerun or broaden that test.

D14's composite-membership, identity and payload/replay checks and D15's
admission/withdrawal mechanics remain relevant prior evidence; no new SQL probe
was warranted merely to repeat them. They are not proof of the real Core command,
new draft behavior or all P12 paths. No earlier run is relabeled as a new result.

The full source flow does not yet exist in the inspected paths. Real-role/API,
concurrency, browser/accessibility, retained-data and user research acceptance
therefore remain release requirements. This is a completed decision review,
not permission to claim those tests passed. No live data, product code, formal
OpenSpec/PRD, ticket, deployment or donor communication is changed by this review.

## Synthesis, ownership and order

1. **Record now — P27/founder intent:** accept A exactly as stated above. The
   shared-choice policy is settled; B's additional process-rule layer is absent.
   No repeat ratification is needed for inherited source/permission safeguards.
2. **Before the later formal specification is complete — P27/P12/P9/P28:** define
   actual catalog read/use scope, then decide initial suggestions/defaults and
   saved-choice correction/switching only through their own remaining questions.
   D16 defines their constraints, not their answer. Reconcile older preset wording
   at its declared canonical source under `/to-prd`; do not create formal artifacts
   or tickets during this interview.
3. **In design/implementation — source and UI owners:** build one context-bound
   catalog projection and exact source admission binding, the R04/R05 draft-pair
   behavior, durable result/reuse handling and coherent shared UI. Reuse intentional
   primitives, not unrelated personal-view semantics. No general rules engine,
   extra approval, separate default store or new per-surface model is required.
4. **Before release — engineering/QA/product design:** fulfill R13 and AC01–AC20
   on actual contracts and a production-shaped workload. Rehearse rollout/restore,
   test real assistive interactions and conduct agency usability probes. Fix
   confusion and integrity failures before activation; no toy evidence waives this.
5. **After release — the accountable roles below:** monitor actionable deviations,
   with actual team/on-call routes assigned in the release record. Monitors do not
   replace source prevention or justify leaving a required policy undefined.

| Signal                                                                                                | Threshold                                                  | Owner                          | Response                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Accepted wrong-list stage, silent stage substitution or duplicate ordinary work caused by list choice | Any confirmed occurrence                                   | P27 source engineering/on-call | Contain the affected admission door, preserve receipts/history, identify affected work and correct through the qualified source boundary. |
| Unauthorized catalog/context/preview/count/result disclosure                                          | Any confirmed event                                        | P12 security incident owner    | Contain affected cache/API/export access and follow existing incident procedure; verify current-context isolation before reopening.       |
| Valid choice denied solely by an unselected app/Party-type/process filter                             | Any reproducible occurrence                                | P27 with P28 surface owner     | Remove the unselected restriction while preserving real source/permission floors; test affected surfaces and regression.                  |
| Accepted result missing required binding/history/receipt or late UI result applied to another context | Any confirmed mismatch                                     | P27 engineering                | Stop the faulty mutation/presentation path as appropriate, reconcile source evidence and repair without replaying accepted effects.       |
| Staff misunderstand a list as changing giving/access or creating another partnership                  | Any validated support report or observed usability failure | P27 product/design owner       | Reproduce, correct wording/interaction/guidance and retest; investigate erroneous records through the qualified correction path.          |

No monitor requires logging sensitive option text or starting another product
inbox. Performance budgets and release sample/workload selection must be measured
and declared before activation; “monitor scalability” is not a substitute.

## Adversarial check

### What could go wrong with this answer?

“Approved” could be mistaken for unrestricted permission, and “appropriate” could
become hidden hardcoded rules. R01/R02 separate these. A mismatched stage or unclear
existing-work result could create wrong data; R04–R08 require valid source intent
and truthful reuse/recovery. The most important UI safeguard is a clear distinction
between an unsent proposal and work that might already exist.

### What hidden assumptions are we making?

The founder prefers staff judgment over extra process restrictions. We do not
assume particular lists, mutually exclusive church/missionary audiences, every
staff member's authority, a default, a maximum catalog size or easy user comprehension.
Those last usability/capacity claims require actual evidence before release.

### How does this affect the whole product?

One source binding is shared by authorized staff/missionary consumers. CRM identity,
tasks, finance, communications, access and reporting retain their owners. The
decision adds no donor checkout or public workflow and no alternate CRM authority.

### How does this affect the end-user experience?

Users get understandable choices and optional context without another configuration
lesson. Existing valid choices are not asked again. Revision of an unsent choice
is straightforward; unavailable and uncertain states explain a permitted next step.
Visual consistency and accessible behavior are required alongside correct source data.

### Does this follow modern best practices?

Yes as a bounded design: separate choice from access, use stable identity, preserve
submitted intent, show truthful state and make forms understandable. Vendor-specific
record types, restriction rules, pricing limits and public-service form patterns
are not imported as Core requirements. Actual usable delivery remains to be tested.

### Does this fit Asym’s existing repo and product direction?

Yes. It preserves the shared cultivation model, current P12/source boundaries,
contextual D4 admission, D13 optional stage and D15 retained-use policy. Any older
wording interpreted as mandatory per-surface preset assignment must be reconciled
with this explicit later choice, not preserved as a contradictory requirement.

### Should we adjust the recommendation?

**Accept.** Record the exact D16 above with R01–R15 and AC01–AC20. The review adds
precision and inherited implementation safeguards without choosing a new product
policy or requiring repeat ratification. The remaining initial-choice and saved-
choice recovery decisions remain genuine next steps in the interview.
