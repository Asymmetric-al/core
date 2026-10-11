# Phase 27 D17 — a clear, editable starting list

2026-10-10 UTC. **Reviewed D17 explicitly ratified; review disposition: Accept.** The founder
requires clear, beautiful, understandable UX/UI, obvious options and next actions,
and careful edge-case handling. This is a completed decision review against Core
HEAD `225c02e9499bd6c0d493223cd4b1a4120ff787e3` and the accepted/ratified D1–D16 decisions. It records
intended behavior, not implementation, activation or full-phase readiness.

The founder subsequently instructed, “Yes, ratify this amended D17.” The exact
decision and reviewed safeguards below are explicitly ratified on 2026-10-10,
without a substantive change. [Q18](phase27-q18-changing-saved-list.md) subsequently
records A; the [D18 review](phase27-d18-adversarial-review.md) accepts deliberate
same-work list changes, with current-stage treatment still a blocking decision.

## Exact decision recorded

> **D17 — Prefill a clear starting choice.** When starting new partnership work,
> preserve an already established valid list choice. When no choice has been
> established, visibly prefill the sole currently eligible list; if several lists
> are available, prefill the organization's usual list only when that default can
> be safely disclosed and used in the current context. Otherwise let staff choose.
> The organization may set, replace or clear its optional usual list. There is no
> compulsory default and no default inferred from a person's role, screen, list
> order, supporter type or previous personal choice.
>
> Show the actual selected list, explain its purpose where guidance is available,
> and make other permitted choices easy to inspect and select. Staff can change
> the proposed list before starting. Do not require a separate acknowledgment of
> the default. Prefilling never starts work, chooses an initial stage, contacts a
> supporter or changes existing partnership work.
>
> Treat the prefilled list as a visible starting choice, not a continuing rule.
> Later default changes, refreshes or newly available alternatives must not replace
> an established eligible choice. Invalidated choices require clear recovery rather
> than an unseen substitute. Submit the actual list staff saw as part of the
> deliberate start; never defer the choice to whichever default exists later.
>
> Preserve D15's withdrawal and no-revival rules. When withdrawal expressly includes
> removing this list as the usual choice, qualify and accept those P27-owned changes
> together with the necessary authority; clear only the matching current reference.
> Prior authorized replacement or clearing remains valid dependency treatment.
> Restoring availability does not restore an old default. Existing work retains its
> list, history and current permission boundaries.

**No material product amendment to A is required.** Sole-option prefill and the
optional organization default were explicit in [Q17](phase27-q17-initial-list-choice.md).
The lifecycle and intent qualifications below make that policy implementable within
D4/D13–D16. They do not authorize saved-list switching, a process-rule hierarchy,
new permissions, an initial stage default, persistent offline drafts or an extra
approval ceremony. The founder has now explicitly ratified this reviewed decision.

## Evidence, authority and current reality

| Evidence                                         | What was checked; limit                                                                                                                                                     |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Ownership](d17-evidence/ownership.md)           | Governing ADR/OpenSpec/P27/P28, optional configuration lifecycle, D4 intent, D15 dependency treatment and D16 scope; intended contracts, not runtime proof.                 |
| [Authorization](d17-evidence/authorization.md)   | Minimum safe default disclosure/application, complete authorized choice sets, trusted context and separate configuration/use/admission powers; no new grant system.         |
| [Implementation](d17-evidence/implementation.md) | Current source reuse limits, simple relational representation, bounded query proof, default/withdrawal races and exact new isolated PostgreSQL evidence.                    |
| [UX](d17-evidence/ux.md)                         | Shared Core components and installed form behavior, primary accessibility guidance, concrete states and new actual-component tests; not a complete browser or agency study. |
| [Practice](d17-evidence/practice.md)             | Current primary Salesforce/NPSP, ministry-software, CMS and form-design comparisons; strongest explicit-choice alternative and limits on inferred ministry practice.        |

**Repository facts.** [ADR-0001](../../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md)
and [CRM OpenSpec](../../../../openspec/specs/crm-core/spec.md) keep CRM truth in
Asym Postgres. [P27/P28](../../../prds/sitestacker-parity/roadmap.md:4087) use a shared
cultivation model; [retained owner requirements](../../../prds/program-roadmap/owner-constraints.md:17)
preserve source ownership and independent task/financial/consent meaning. D16
already resolves any compulsory app/Party-type preset interpretation while keeping
supplied presets. D17 must not recreate that restriction through default mappings.
[P12](../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md)
owns current authorization and minimum-safe projections; [platform boundaries](../../../../openspec/specs/platform-boundaries/spec.md)
and the [API boundary](../../../guides/architecture/data-access-boundary.md) keep
shared business decisions out of competing app-local implementations.

**Current behavior.** Fresh bounded searches found no authoritative P27 default/list
admission command in the inspected API/database/migration/admin/missionary paths.
Existing CRM personal/tenant/system view-setting fallback concerns presentation,
not a shared partnership's chosen process. Existing selectors and forms expose
useful primitives but do not implement the required initializer or source command.
The appendices cite actual files and versions. These are reuse limitations, not
claims of deployed P27 security defects.

**Verified external facts.** [GOV.UK select guidance](https://design-system.service.gov.uk/components/select/)
permits defaults for settings but cautions against preselecting answers to questions.
That is serious counterevidence to indiscriminate prefill. D17 chooses an explicit,
editable process setting, not a guessed statement about the donor, ministry,
consent or stage. The distinction is a product judgment, not proof that default bias
vanishes. Salesforce's mixed-record-type guidance strengthens B's case; NPSP's
configuration examples do not authorize Core role-based assignment. MPDX's default
workspace is a context example, not a stage-list or access model. Shopify illustrates
visible template assignment, but its fallback behavior is not imported into Core.

[W3C instructions](https://www.w3.org/WAI/tutorials/forms/instructions/) support
visible labels, clear required/optional meaning and associated help/errors.
[Redundant Entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html)
supports preserving valid information within a process; it does not mandate a new
organization default or indefinite memory. [On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html)
supports predictable changes without unexpected navigation or submission.

Official [PostgreSQL constraints](https://www.postgresql.org/docs/17/ddl-constraints.html)
and [policy semantics](https://www.postgresql.org/docs/17/sql-createpolicy.html)
separate structural references, cross-row business state, grants and RLS. The
Supabase skills were applied with those primary semantics taking precedence over
blanket examples. The [Supabase changelog](https://supabase.com/changelog) and
[15.19/17.11 notice](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes)
were checked; extension/custom-operator changes do not establish a need for new D17
infrastructure. The web reader rejected the Markdown index's content type; direct
HTTPS retrieval succeeded. No provider or production upgrade was performed.

**Inference, judgment and unknowns.** A can save routine selection and supports an
unset default for mixed work. No agency usability study, error-rate improvement,
capacity benchmark or universal missions preference has been established. Independent
engineering reviews are not practitioner interviews. Test obligations below make
those limits explicit rather than inventing feedback or calling the UI proven.

## Strongest alternative and simplest permanent solution

B is strongest where staff regularly handle different processes and a suggested
choice may be accepted inattentively. It removes the organization's default-setting
maintenance and makes selection intentional when several choices exist. A allows
that same no-default configuration while also accommodating genuinely usual work;
it adds one bounded optional preference. Keep that small capability. Do not add
ranked recommendations, per-team default hierarchies, AI suitability, remembered
personal choices, process-specific rules, mandatory previews or confirmation steps.

This is not a no-build replacement for source admission: D4 already requires valid
list-bearing work. The no-build baseline is explicit choice from the existing
catalog. Only the optional initializer/configuration is new. Prefer one optional
reference within the actual owner-qualified catalog configuration over a separate
recommendation service or competing per-surface settings. The precise physical
scope and schema must follow the owner contract; D17 creates no Tenant/Legal Entity
partition, new catalog entity, list quota or general rule language.

## Source facts and invariants

| Fact                                                     | Authority and invariant                                                                                                                                                                                                      |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Usual list configuration                                 | P27 owns zero or one optional usual reference per qualified catalog/source scope, with authorized configuration history. It points to that scope's stable list identity and is not a universal per-person suitability claim. |
| Available choices and usable default                     | Current source/P12 projection establishes disclosure and eligibility for this operation. Cached options and a presentation preference cannot grant access.                                                                   |
| Proposed starting list                                   | Context-bound draft intent; an initializer may fill an unresolved field, not overwrite established intent. An exploratory choice is not business history.                                                                    |
| Submitted list                                           | Concrete normalized D4 command intent. Missing list does not mean “resolve the latest default on the server.” Pending or uncertain acceptance must be reconciled before a new intent.                                        |
| Accepted journey/list/stage                              | P27 source truth and preserved history under D3/D4/D13–D16. A nullable initial stage does not weaken the required qualified list. List choice is not another ordinary-journey identity.                                      |
| Tasks, consent, giving, participation and responsibility | Their existing source owners. Prefill/default configuration creates none of these facts. Actual deliberate admission retains its required owner-qualified work/effects.                                                      |

The only new persistent business fact needed by this decision is the optional usual
reference and its ordinary durable configuration evidence. It does not require a
stored candidate ranking, parallel catalog, every-click audit stream or another
journey state machine. Do not claim that an automatically prefilled value was a
separate manual assessment, individual recommendation or supporter agreement.

## Exact initialization and lifecycle behavior

Apply these meanings before choosing a component API. The table describes outcomes,
not a prescribed database schema or public payload shape.

| Situation                                                                  | Required result                                                                                                                                                                               |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Existing journey or accepted start                                         | Use the accepted binding. No initial default lookup may switch it.                                                                                                                            |
| Submitted start pending or outcome uncertain                               | Keep its concrete intent and recover its result. A changed screen or helper response does not make it unsent again.                                                                           |
| Established, still-eligible draft list                                     | Keep it whether manually chosen, visibly prefilled or supplied by qualified context. Another default, an unset default, or one-to-many option change does not invalidate it.                  |
| Established choice becomes invalid                                         | Explain the permitted problem and let staff resolve it. Do not replace it with the latest usual/sole/first list. Preserve other permitted input.                                              |
| Staff deliberately clear the proposed choice, if that control is offered   | Respect the unresolved draft; do not refill it on every render/refetch. A concrete valid list is still required to start. D17 does not require adding a Clear button.                         |
| Fresh unresolved field, exactly one eligible choice proved                 | Visibly select that list. Search results or one loaded page cannot establish this fact.                                                                                                       |
| Fresh unresolved field, several choices and usable disclosed default       | Visibly select that default. Other eligible choices remain available.                                                                                                                         |
| Fresh unresolved field, several choices but no usable authorized default   | Leave choice unresolved and invite selection. Do not reveal a hidden default, guess the first item or invent a default.                                                                       |
| Default lookup failed or is indeterminate                                  | Do not call it unset. Offer retry or independent manual choice where available. Helper failure alone does not invalidate an independently authorized explicit choice or a proved sole choice. |
| True zero, partial choices, search-no-match, denied or failed options read | Distinguish each. Give a permitted next step without claiming organization-wide absence or revealing protected configuration. D15 governs true zero.                                          |

Eligibility may be established without sending the entire catalog to the browser.
A bounded source query can distinguish zero, one and at least two permitted matches;
an authorized usable-default projection can supply its candidate directly. Do not
require an expensive full count or full stage/history expansion merely to initialize
a field. The source must accurately establish the facts on which it relies. Every
actual admission still revalidates the concrete selected list and optional stage.

The optional default can be set, replaced or cleared. An unchanged setting is not a
new business change; retry and stale-edit rules are distinct. Withdrawing A must
not accidentally clear a newer usual reference B. An ordinary withdrawal action
that includes clearing matching A must show that consequence and have authority
for both P27-owned changes before accepting them together. Authorized prior
replacement/clearing plus revalidation remains valid. Other required dependencies
retain D15's owner-specific treatment; no cross-domain atomicity is assumed.
Restoring A's availability, retrying an old accepted Set A, restoring a browser tab,
or replaying an import cannot reinstate the former default implicitly.

## Concrete UX/UI contract

Use Core's `@asym/ui`, Base UI and exact base-maia tokens. Keep supporter/ministry
context recognizable, field hierarchy quiet and consistent, and one ordinary
**Start partnership work** action. The list is required for starting work; choosing
an initial stage remains optional. Do not turn this into a settings wizard.

Illustrative state, with a permitted organization default already resolved:

```text
Start partnership work
[Recognizable supporter and identified ministry]

Stage list
[Partner support                                      ▾]
Your organization's usual starting list. You can change it.
View stages

Stage (optional)
[Not yet assessed                                     ▾]

[Existing lead and next-work controls]

Start partnership work                         Cancel
```

“Partner support” is illustrative, not an established agency process. Available
short purpose guidance should explain what the list is for; avoid piling that text,
a badge, a tooltip and a second banner onto the same field. “Your organization's
usual starting list” is appropriate only when disclosing that relationship is
permitted and the statement is true. Do not label it “best for this partner” or
claim source validity/consent from its appearance. A sole-choice state may simply
show the readable list; any explanatory text must describe the current authorized
choice set, not the organization's hidden inventory.

The selected name must be readable before submission, with an obvious permitted
way to change it. With several options, the shared selector or lightweight change
action exposes other approved names and available purpose guidance; **View stages**
is optional and must not commit the choice. With one option, avoid a pointless
required click; do not imply unavailable alternatives can be chosen. Full names
and relevant guidance must remain obtainable when space is narrow.

Changing the draft list follows D16: visibly resolve only an incompatible proposed
stage and preserve unrelated input. The form should never show one list while
submitting another, quietly reset an assessment, or force a replacement stage.
Known no-stage state, loading and a placeholder are different meanings. Ordinary
submission accepts the plainly shown list and optional stage; no extra “I confirm
this default” checkbox or second Save list step is necessary.

| State                                          | Example copy or next action; adapt to permitted facts                                                                                                                      |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Several choices, no usable default             | “Choose a stage list” with available guidance and choices. No urgent warning for a normal unresolved input.                                                                |
| Optional suggestion unavailable                | “We couldn't load the starting suggestion. Choose a list or try again.” Do not block an independently valid choice.                                                        |
| Lists still loading                            | Loading state, without a fake selected label or fabricated zero. Keep independently established safe information.                                                          |
| Search has no matches                          | Clear/change search, distinct from no eligible lists.                                                                                                                      |
| Chosen list no longer available for new work   | Explain the permitted problem, preserve safe input, and offer available choices. No silent substitution.                                                                   |
| No list available to this person for this work | Explain inability to start and show the real permitted help/settings route. No speculative Request access feature or hidden inventory count.                               |
| Start pending or uncertain                     | “Starting…” or an honest unresolved result with reconciliation/retry. Closing the view does not undo a commit.                                                             |
| Existing work reused                           | Show the permitted existing-work result and actual list; never apply the draft/default as a saved switch.                                                                  |
| Default configuration                          | “Default for new work” with an explicit no-default option; concise explanation of who it affects. Setting/clearing it changes future unresolved starts, not existing work. |
| Withdrawing the current default                | Explain the matching default removal within the ordinary action and preserve existing work. A replacement is optional; no forced migration or extra wizard.                |

Use visible associated labels/help/errors, accurate selected/required/busy states,
text beyond color, Core contrast/focus/touch targets and predictable keyboard
operation. Announce meaningful asynchronous initialization or invalidation without
stealing focus or announcing every background refresh. Test 320 CSS-pixel reflow
and 200% text resize separately, long international names, RTL, translated labels,
mobile soft keyboard, reduced motion and slow/out-of-order responses. No hover-only
explanation, unexplained disabled Start, transient-toast-only error or hidden option
truncation may carry essential meaning. No new address fields, donor checkout steps,
public display, offline storage or timestamp-based default schedule follows.

## Exact requirements to carry into formal specification

**R01 — Bounded optional default.** P27 SHALL own zero or one optional usual-list
reference in the actual governed catalog/source scope. Authorized configuration
may set, replace or clear it; no default is compulsory. Do not infer defaults from
creation order, ranks, apps, Party type, team, personal history or AI. Preserve D16's
shared choices and source ownership; qualify physical scope/capability mapping
without introducing another hierarchy, provider or settings authority.

**R02 — Safe initialization.** Initialize only a genuinely unresolved new-work
choice: use a proved sole eligible list, otherwise a permitted eligible usual list,
otherwise ask. Existing, submitted and established draft choices take precedence.
Do not treat filtered/paged options, placeholder text, loading, lookup failure or
partial joins as authoritative zero/one/absence. A qualified source projection can
supply the bounded eligibility facts without revealing the full catalog.

**R03 — Minimal disclosure and distinct powers.** Authorize the default-application
fact as well as the target. Hiding a Default badge does not make an unauthorized
selection inference safe. A person may consume a minimal safe initializer without
full settings/audit access. Catalog configuration, default application, list use,
journey admission and result/history disclosure remain distinct decisions under
P12. A configurator need not be able to start that journey; a starter need not manage
defaults. Resolve trusted context/current authority before revealing or accepting.

**R04 — Established intent survives helper changes.** Once a list is established,
changing/unsetting a default, adding alternatives, late queries or general form
resets SHALL NOT replace or clear it while it remains eligible. Preserve deliberate
user edits and explicit clearing where supported. Invalidation due to actual source
or permission changes requires visible reconciliation, not a new automatic choice.
Do not use whole-form touched state or uncontrolled `defaultValue` as this contract.
A change of material source context requires current qualification before reuse.

**R05 — Concrete deliberate admission.** The normal Start action SHALL submit the
actual visible qualified list identity and optional exact-list stage, bound to D4's
normalized durable intent. The source SHALL NOT resolve a missing list to its latest
default at execution. Reviewed groups freeze their member intent rather than defer
selection to a later default. Defaults confer no consent, stage assessment, access,
journey uniqueness dimension, donor activity or workflow event. Actual admission
retains its required atomic history/result and owner-qualified next work.

**R06 — Current source and same-list membership.** Revalidate current new-use
eligibility, source/context authorization and optional stage membership at each
consequential acceptance. Validate list eligibility independently from optional
stage absence. Do not require that a still-eligible chosen list remain usual or
sole. Configuration/read snapshots are not admission locks. D15 governs ordered
withdrawal/acceptance; D3/D4 govern collisions/reuse and truthful member results.

**R07 — Coherent default lifecycle.** Set/replace/clear SHALL use the qualified
source configuration boundary, current expected revision, trusted attribution and
atomic durable change evidence/result. Preserve same-value no-op, stale edit,
exact retry and changed-payload conflict distinctions. For P27's ordinary withdrawal
including matching default removal, qualify the combined operation, disclose the
included consequence and validate both powers; commit together or neither. Prior
authorized replacement/clear plus revalidation is also valid. Never clear a new B
reference while withdrawing A. Preserve D15 treatment for other source dependencies.
Carry D15's protected-readiness/result fence across this operation: a person allowed
to withdraw a list but not to know or clear its default relationship must not infer
that relationship from success versus rejection. Require independently permitted
readiness disclosure or the same safe outcome for indistinguishable protected states.
Restoration or historical replay SHALL NOT revive an old default.

**R08 — Relational integrity and all write doors.** Enforce scoped stable identities,
required scope and at-most-one configuration with appropriate primary/unique and
complete foreign keys. A retained list reference alone cannot prove mutable new-use
eligibility; use one qualified concurrency boundary for relevant configuration
changes. Do not put cross-row reads in a PostgreSQL CHECK and call that invariant
proof. Prevent ordinary tenant/scope/actor/owner/history reassignment and destructive
cascades. Default null means no configured usual list, not missing required scope;
journey list remains required. No money precision or new storage type is introduced.

**R09 — Effective authorization everywhere.** Qualify table/column/function grants,
exposed schemas, real nonowner RLS USING and WITH CHECK semantics, SELECT/RETURNING,
views, RPC owners/search paths, imports, jobs, repair and service paths through the
shared API boundary. Omitted WITH CHECK can inherit USING; permissive policies and
actual execution roles determine effective behavior. RLS does not replace default
lifecycle or admission invariants. Derive tenant/context/actor/audit authority from
trusted server state; supplied target IDs and revision are validated proposals.

**R10 — Context and failure-safe recovery.** Scope query caches, drafts, suggestions,
search/detail pages and callbacks to all relevant current tenant/assignment/source/
policy distinctions. Same user ID is insufficient. Revoke unsafe display and reject
stale-context writes; late callbacks/optimistic rollback cannot replace newer context.
Distinguish unset, unavailable, denied, partial, failed and unknown. Optional default
lookup failure SHALL NOT block independently valid explicit or sole-choice intent.
Unknown command success requires receipt reconciliation; a new default never repairs
or retargets a pending intent. No durable effect is repeated to repair presentation.

**R11 — Clear consistent UI.** Implement the initializer and state tables using
shared base-maia components, ordinary contextual Start and accessible controls.
Show selected identity/meaning and permitted alternatives; required list and optional
stage remain distinguishable. Do not require default acknowledgment, manager approval,
a second picker ceremony, mandatory guidance or a setting-management detour. User
choice changes only the unsent intent until admission; D16 governs dependent-stage
recovery. Configuration uses ordinary clear actions with no-default meaning.

**R12 — Privacy, history and independent facts.** Minimize names/guidance/default
status/counts to the permitted purpose. Escape displayed text and qualify exports;
keep sensitive missionary/supporter context out of generic logs/metrics. Source
configuration history, accepted journey history, security audit and technical logs
remain distinct. Default application is not proof of individual suitability or a
manual stage assessment. Apply lawful retention/redaction and governed backup/restore
access. No payment, consent, financial, public-site, task or communication fact changes
merely because a default is configured, displayed or replaced.

**R13 — Compatibility and bounded cost.** Inventory readers/writers/imports assuming
first list, app preset, personal/tenant/system fallback or implicit default-on-insert.
Add compatible optional configuration/readers and source guards before activation;
start existing scopes with no invented usual reference unless explicit authoritative
intent is evidenced. Preserve accepted journey bindings and optional stage state.
Fence old writers; roll-forward/restore must retain permissions, receipts/history
and no-revival behavior. Containment of faulty prefilling can leave qualified manual
choice available without hiding existing work. Bound initializer/option/detail reads,
avoid per-option journey scans and measure real plans, query counts, payload units,
latency and tenant/concurrency skew before declaring capacity or budgets.

**R14 — Release completeness and proof.** Carry D17/R01–R15/AC01–AC22 through the
question/log/glossary, then the authorized `/to-prd` owner/spec/design/tasks and
`/to-issues` workflow. Qualify exact source scope, minimum capabilities, default
configuration, initializer/admission, safe saved-choice recovery, current-context
accessibility and rollout before activation. Saved-choice correction remains its
own genuine decision; do not add an unsupported control or delete/recreate workaround.
No new ADR is necessary just to restate source ownership. A mechanics experiment
or written screen contract does not qualify the actual product.

**R15 — Actionable evidence and monitoring.** Keep durable configuration/admission
receipts and trusted actor attribution sufficient to diagnose the accepted effect;
never record every option view as business activity or claim a historical receipt
is the current default. Technical signals SHALL avoid protected descriptive content.
The monitored residual risks below have explicit owners, thresholds and responses;
monitoring cannot replace source prevention or unresolved release requirements.

## Full category review

Severity/likelihood are prospective engineering judgments, not measured incidents.
Each row states whether a material concern exists, its consequence, evidence,
effect on A and exact permanent requirement/proof. “Accept” means the selected
policy survives these checks, not that its unimplemented paths have passed them.

| Category                                                         | Material concern and why it matters                                                                                                                                                                                            | Evidence, severity/likelihood, effect and exact prevention                                                                                                                                                                                                                                                |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Problem validity, necessity and alternatives                  | **Yes.** A default can reduce repetitive choice but bias mixed-process work and add settings without demonstrated demand.                                                                                                      | Q17 and primary GOV.UK/Salesforce counterevidence. **Medium / plausible. Narrows A:** optional usual reference, visible change and unset choice; B remains strongest where mixed work dominates. R01/R11; AC01/02/21. No universal efficiency claim.                                                      |
| 2. Brittleness                                                   | **Yes.** Treating form defaults, list order or one loaded result as the product rule fails after async loading, edits or added lists.                                                                                          | Actual shared controls/form behavior and eligibility probe. **High / likely if reused naively. Narrows:** explicit bounded initializer and established intent. R02/R04/R10; AC03–07.                                                                                                                      |
| 3. Technical debt                                                | **Yes.** Per-app resolvers, personal fallback chains or separate default flags can create competing meanings and repair work.                                                                                                  | Current view-settings reuse limits; ADR-0001/platform shared-boundary requirements. **High / plausible. Preserves:** one source preference/initializer contract; no new hierarchy. R01/R08/R13; AC08/15/20.                                                                                               |
| 4. Edge cases                                                    | **Yes.** Hidden/unavailable defaults, deliberate clearing, sole-to-many change, failed lookups and existing-work reuse can produce wrong or confusing outcomes.                                                                | D4/D13–D16 and ownership/authorization/UX findings. **High / plausible. Narrows:** explicit precedence and state tables. R02–R06/R10/R11; AC03–09/13/17.                                                                                                                                                  |
| 5. Footguns                                                      | **Yes.** An unseen default may be accepted, a server may fill an omitted list, or late suggestions may overwrite edits.                                                                                                        | Current selector/form mechanics; Q17 requires visible choice. **High / plausible. Narrows:** actual visible concrete intent, no silent substitution or auto-submit. R04/R05/R11; AC04/05/07/13/21.                                                                                                        |
| 6. Tenant safety                                                 | **Yes.** Same-user context changes and shared caches can expose another context's usual list or admit against the wrong source.                                                                                                | Current cache patterns and P12 owner contract. **Critical / plausible. Preserves:** trusted context-bound reads/drafts/callbacks and current acceptance. R03/R09/R10; AC14/15/17.                                                                                                                         |
| 7. Database, RLS and authorization safety                        | **Yes.** Valid independent IDs or an FK can retain a withdrawn/wrong-scope default; permissive writes may retarget state or attribution.                                                                                       | PostgreSQL semantics and isolated default-race checks; no actual P27 path yet. **Critical / plausible. Preserves:** complete references, optional-reference/required-scope distinction, revision/concurrency boundary and effective grants/policies. R07–R09; AC10–12/15. No new monetary type is needed. |
| 8. Overengineering                                               | **Yes.** A default can expand into ranked recommendations, per-ministry rules, new permission bundles, preference sync or confirmation rituals.                                                                                | Q17's bounded fork and D16's rejection of process restrictions. **Medium / plausible. Narrows:** one optional source preference plus visible initializer. R01/R11/R14; AC01/02/21.                                                                                                                        |
| 9. UX/UI and user friction                                       | **Yes.** Staff may mistake default for suitability, miss a selection or not understand how to change/recover; a polished-looking but inaccessible control fails field use.                                                     | Primary form guidance, actual component limitations and source-state analysis. **High / plausible; default-update behavior reproduced. Preserves:** concrete shared UI/state contract and real-user/manual-accessibility proof. R04/R10/R11; AC03–07/17/18/21.                                            |
| 10. Source of truth, ownership and invariants                    | **Yes.** Current default may become continuing journey authority, source eligibility may become cached preference, or null may erase required scope.                                                                           | Owner table, D3/D4/D13/D16 and FK counterexample. **High / plausible. Narrows:** distinguish configuration, projection, draft, submitted intent and accepted binding. R01–R08; AC08/09/13/15/19.                                                                                                          |
| 11. Hidden coupling                                              | **Yes.** Default changes may move existing work, set stage, change tasks/finance/consent or cause different app meanings.                                                                                                      | P27/P28/DON ownership and Q17 boundaries. **High / plausible. Preserves:** default is initializer only; real admission effects retain their owners. R04/R05/R12; AC04/08/19.                                                                                                                              |
| 12. Failure modes                                                | **Yes.** Lookup outage may block all starts or masquerade as no default; ambiguous saves can repeat or revive effects.                                                                                                         | Actual changed-input behavior and default-receipt mechanics. **High / plausible. Narrows:** independent valid-choice path, explicit unknown state, atomic required effects and receipt recovery. R07/R10/R15; AC06/10–13/17.                                                                              |
| 13. Lifecycle, temporal correctness, concurrency and idempotency | **Yes.** Set/clear/withdraw/restore races or old retries can resurrect defaults, clear a newer B, or retarget reviewed members.                                                                                                | New isolated blocking schedules and D4/D15 rules. **High / plausible. Preserves:** revision-aware configuration, explicit matching dependency treatment, no replay writes and concrete member intent. R05–R07/R10; AC04/10–13. Time zone/backdated metadata cannot control eligibility.                   |
| 14. Data integrity                                               | **Yes.** Silent stage mapping, lost manual choice, implicit latest-default insert or guessed backfill can create false history.                                                                                                | D16 pair validity, current form mechanics and source ownership. **High / plausible. Narrows:** concrete exact pair, preserved intent and evidenced migration. R04–R08/R13; AC05/07–09/20.                                                                                                                 |
| 15. Security and privacy                                         | **Yes.** Prefilling can itself disclose a protected default relationship even without a badge; settings/history/logs may reveal sensitive ministry context.                                                                    | P12 minimum revealing operation and authorization appendix. **Critical / plausible. Preserves:** authorize application fact/target independently, minimize payloads and protect history/exports/restore. R03/R09/R12; AC14/15/22.                                                                         |
| 16. Scalability and performance                                  | **Yes.** Full counts/catalog expansion, N+1 stage or journey reads, broad invalidation and blocking config reads can make a small helper expensive.                                                                            | Bounded source-query reasoning; no production-shaped benchmark supplied. **Medium / plausible with scale. Narrows:** bounded eligibility/target projection and measured plans/budgets. R02/R13; AC03/20. No arbitrary list quota or unverified latency claim.                                             |
| 17. Operational burden                                           | **Yes.** Hidden defaults, dormant references or a required replacement when none fits can create support/SQL repair work.                                                                                                      | D15 dependency/no-revival requirements and mixed-process evidence. **Medium / plausible. Narrows:** clear set/replace/clear UI, optional default, safe matching withdrawal and release-qualified correction. R01/R07/R11/R14; AC02/10/18/21.                                                              |
| 18. Observability and auditability                               | **Yes.** Prefill may be falsely logged as an assessment, a historical receipt may appear current, or configuration change may lack evidence.                                                                                   | Source history/idempotency contracts and new retry probe. **High / plausible. Preserves:** actual configuration/admission evidence, truthful receipt/current distinction and separate safe diagnostics. R07/R12/R15; AC11–13/19/22.                                                                       |
| 19. Dependency and integration risks                             | **Yes.** Base UI/TanStack defaults differ from business intent; vendor profile defaults/CMS fallback may be copied as authority, or jobs may resolve defaults late.                                                            | Installed mechanics, current vendor documents and shared API boundary. **High / plausible. Narrows:** controlled source-backed initialization and concrete integration intent. R04/R05/R09/R13; AC05/07/13/15/20. No new provider or sync dependency.                                                     |
| 20. Migration, rollout and upgrade risks                         | **Yes.** Old callers may omit list, fall back silently or overwrite new choices; restore can revive retired defaults or old commands.                                                                                          | Current source gap, dependency version differences and D15 no-revival. **High / plausible. Preserves:** compatible optional configuration, writer fences, no guessed backfill and tested restore/containment. R13/R14; AC12/20.                                                                           |
| 21. Testability, traceability and proof                          | **Yes.** “Clear starting choice” is vague without precedence, coverage, disclosure, correction and actual user outcomes; toy proof can be oversold.                                                                            | Q17 reservations and bounded mechanics evidence. **High / certain pre-release qualification gap. Narrows:** R01–R15, AC01–AC22, canonical trace and production-shaped/manual proof. R14/R15.                                                                                                              |
| 22. Other development hazards                                    | **No additional material concern beyond those above.** Checked new financial/address/storage types, donor/public flows, generic automation, offline draft persistence, default scheduling, new ADR and architecture expansion. | None is required. R01/R05/R11–R14 keep this bounded. Existing privacy, restore, maintainability and unsupported-control hazards are explicitly covered in their own categories.                                                                                                                           |

## Acceptance criteria and proof

These are required future source/API/browser outcomes, not a list of tests already
passed. Real roles and actual enforcement paths must prove them.

| ID   | Independently testable required outcome                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC01 | Fresh context with several eligible lists and a permitted valid usual reference visibly prefills that list; other approved choices remain available. With no usable default, ask; do not infer one by rank, app, role, Party type or prior personal use.                                                                                                                                                                                                                                                                                           |
| AC02 | Authorized configuration sets, replaces and clears the optional usual reference without requiring admission rights. A starter consumes only permitted initializer facts without needing settings-management powers. No default is required for an otherwise usable catalog.                                                                                                                                                                                                                                                                        |
| AC03 | Cover complete authorized eligible counts 0, 1, 2 and more than 2, plus a first page/search containing one of several matches, hidden lists and failed/partial reads. Prefill a sole list only from authoritative eligible coverage; filtered count is never proof.                                                                                                                                                                                                                                                                                |
| AC04 | Prefill A, then change/unset the default or add B while A stays eligible: the draft remains A while any now-false “usual” or “only choice” explanation updates or disappears. Explicitly choose B before a late A-default response: B remains. No refresh or untouched-form reset changes either established choice.                                                                                                                                                                                                                               |
| AC05 | If clearing is offered, deliberately clear the proposed list and refetch: it remains unresolved until valid user action. Edit an unrelated field while defaults load: that edit is preserved and does not wrongly prevent legitimate initialization of the untouched list field.                                                                                                                                                                                                                                                                   |
| AC06 | Default helper failure is shown truthfully and supports retry; independently authorized explicit or proved sole choice still proceeds through normal validation. Failure is neither configured absence nor permission to reveal/use a concealed default.                                                                                                                                                                                                                                                                                           |
| AC07 | Change unsent A/stage-A to B with a same-label stage-B: visibly resolve the incompatible stage, preserve other input and submit only B plus its explicitly final valid stage or allowed absence. The server rejects an invalid submitted pair instead of silently nulling/mapping it.                                                                                                                                                                                                                                                              |
| AC08 | Prefilling, changing, clearing or restoring configuration leaves every existing journey's list/stage/history unchanged. Starting intent that resolves to existing work reuses its actual binding under D3/D4/D15, without an implicit saved switch or duplicate ordinary journey.                                                                                                                                                                                                                                                                  |
| AC09 | At acceptance, withdrawn/unauthorized/wrong-scope list, absent required list and wrong-list stage reject safely. A still-eligible chosen list succeeds even if no longer default/sole. Stage absence never permits an invalid parent scope.                                                                                                                                                                                                                                                                                                        |
| AC10 | Race Set A with withdrawal in both orders; exercise stale expected revision, pre-replaced B and prior clearing. No accepted default points outside its qualified scope or to a list unavailable for new work; starter-specific inability to discover/use it prevents application without clearing the organization setting; withdrawal clears only expressly included matching A. Failure of required history/result rolls back the combined source mutation.                                                                                      |
| AC11 | Set/replace/clear with same-value new intent, exact retry and same-key changed payload yield distinct truthful outcomes; no duplicate configuration history, stale overwrite or old result presented as current state.                                                                                                                                                                                                                                                                                                                             |
| AC12 | After withdrawal and same-ID restoration, the former default remains unset unless deliberately configured again. Replaying an old accepted Set A, old tab or import cannot reinstate it.                                                                                                                                                                                                                                                                                                                                                           |
| AC13 | Submit concrete A and lose the response, then change organization default to B: retry/group execution preserves original normalized A intent and reconciles one result. Omitted list is not “use latest default.” Each reviewed member retains current authorization and its own truthful acceptance/reuse outcome.                                                                                                                                                                                                                                |
| AC14 | Compare forbidden default relationship with readable A, hidden target, absent default and permitted default. Selection, payloads, badges, errors, timing and history do not reveal protected facts. Only independently permitted default application or sole-choice evidence may prefill. Also test a person allowed to withdraw A but unable to know/clear its default relationship: success versus rejection must not reveal the hidden relationship; readiness disclosure must be independently permitted or outcomes safely indistinguishable. |
| AC15 | Actual nonowner grants/RLS/views/RPC/INSERT/UPDATE/UPSERT/RETURNING, jobs/imports and service/repair paths preserve tenant/context, required scope, reference eligibility and trusted attribution. An allowed old row cannot become a forbidden new row.                                                                                                                                                                                                                                                                                           |
| AC16 | Same-user Tenant/assignment/source/epoch changes, sign-out, stale tab and revocation cannot reuse old initializer data or authorize the new work. Test correct invalidation/partitioning independently of server write denial.                                                                                                                                                                                                                                                                                                                     |
| AC17 | Late options/default/detail replies, optimistic rollback and pending admission do not overwrite newer context or actual accepted work. Loading, zero, denied, search-no-match, failed and unconfirmed outcomes remain distinguishable with real permitted recovery.                                                                                                                                                                                                                                                                                |
| AC18 | Keyboard/screen-reader/touch, 320 CSS-pixel reflow, 200% text, RTL, long labels, reduced motion and slow mobile interaction expose selected list, optional stage, alternatives and next action. Separately qualify saved-choice correction before release, preserving identity/history without deletion/recreation; no general switching policy is inferred.                                                                                                                                                                                       |
| AC19 | No prefill/default-change event creates a journey, stage assessment, task, outreach, consent or finance/participation fact. Actual admitted work records its concrete list and trusted actor and produces only the required owner-qualified effects once.                                                                                                                                                                                                                                                                                          |
| AC20 | Test evidenced old data, mixed readers/writers, failed rollout, containment and restore. No guessed defaults or changed journey binding. Measure initializer/option/detail plans, query counts, payload bytes, latency in milliseconds and concurrency at declared actual workloads/boundaries; no per-option journey/history scan.                                                                                                                                                                                                                |
| AC21 | Representative agency users can explain what the prefilled list means, inspect alternatives, change it, start without forced stage assessment and recover from unavailable/uncertain states. Observed belief that it guarantees suitability, changes giving/access or removes choice blocks that flow's release until corrected and retested. Record actual findings rather than invent a pass rate.                                                                                                                                               |
| AC22 | Durable config/admission evidence, security audit, technical logs, exports and authorized history are correctly attributed and minimized. Historical receipt recovery does not claim the old configuration is current; lawful redaction/restore rules remain effective.                                                                                                                                                                                                                                                                            |

## Evidence actually executed and limits

Two new bounded probes target D17-specific uncertainty:

- The [actual-source probe](d17-evidence/source-probe/README.md) passed **4/4**
  checks. Late uncontrolled `defaultValue` does not initialize the selector; an
  initial prefill permits a user override that survives later prop changes. The
  actual form hook replaces an untouched value on default updates, but suppresses
  late initialization after an unrelated field is touched. These observations
  directly justify a field-specific initializer; no P27 flow was constructed.
- The [PostgreSQL probe](d17-evidence/default-probe/README.md) passed **9/9**
  checks. It reproduces FK-valid unavailable defaults and misleading page counts,
  observes both default/withdrawal blocking orders, proves rollback of the fixture's
  combined matching removal/evidence, preserves newer unrelated defaults, prevents
  restore/old-retry revival and retains a captured selected list after default change.
  This is a synthetic owner-run mechanism, not actual P12/RLS or group-admission proof.

The UI run used Node 24.19.0, Base UI 1.8.0, React 19.2.3, TanStack Form 1.28.6
and Vitest 4.1.4 under scoped jsdom configuration. Requested React/Form/Vitest
versions differ, and Bun is unavailable. The first two-selector attempt passed
one check and failed a duplicate-warning expectation; Base UI logs that warning
once. The retained corrected run changes only that expectation and adds two real
form-hook checks, not product behavior. This is no root CI, layout, assistive or
network-scheduling qualification.

The database run used pinned PostgreSQL 17.11 in a network-isolated disposable
container, without ports, application credentials or production data. An initial
harness run stopped after four successful assertions because of buffered output
markers; the corrected barrier retains the database assertions. Both attempts,
input hashes, results and verified container cleanup are preserved. Both containers
were removed. The fixture lacks actual authorization, complete audit/no-op policy,
API compatibility and production workloads; its schema and locks are not ratified
Core implementation. No passing check is relabeled as proving those missing paths.

Prior D14/D15/D16 checks remain dated evidence and are not counted as fresh D17
results. Source ownership and acceptance criteria are not proof of deployed RLS,
real browser accessibility, production latency or tenant usability. No practitioner
interview or live production exercise was performed. No product source, migrations,
formal PRD/OpenSpec, tickets, tenant configuration or donor contact is changed.

## Independent synthesis and document verification

An independent read-only review of the main decision and all five appendices
supported **Accept**, without a material new policy or repeated founder vote.
Three clarifications were incorporated: protected withdrawal/default outcomes
(R07/AC14); current explanatory text while preserving the selected identity
(AC04); and organization-reference validity distinct from a starter's inability
to use it (AC10). None broadens a source permission or introduces a new ceremony.

The [integrated verification record](d17-evidence/review-checks.json) preserves
the completed pre-ratification format, link, status, coverage and evidence checks.
It is dated evidence of that snapshot, not a current hash manifest after subsequent
status edits. The [D17 ratification/Q18 verification](d17-ratification-q18-validation.json)
preserves checks of the then-updated records and unchanged exact decision/evidence. D17 is now
explicitly ratified; these checks qualify research documentation, not implementation
or release.

## Synthesis, order and accountability

1. **Record now — P27/founder intent:** accept A with the exact initializer,
   optional preference and inherited boundaries above. A does not authorize a
   broader default engine. No repeated founder approval is needed for ordinary
   source/permission/intent safeguards.
2. **Capture before formal specification is complete — P27 with P12/P9/P28:**
   qualify actual catalog scope, minimum configuration/application/use powers and
   default withdrawal integration. Carry the exact precedence and UX state tables.
   Complete the separately reserved saved-choice correction decision before any
   release depends on it; D17 is not an answer to that question. Reconcile canonical
   owner prose through `/to-prd`; do not publish specs or tickets in this interview.
3. **Implement before activation — API/database and shared UI owners:** one scoped
   optional preference, a bounded authorized initializer, explicit draft semantics,
   revision-aware configuration and exact concrete admission intent. Reuse shared
   controls after qualifying their seams. No long-lived snapshot locks, new scheduler,
   per-surface fallback chain or generic rule engine is justified.
4. **Prove before release — engineering, QA and product design:** run AC01–AC22 on
   actual source/roles/paths, production-shaped data and the real browser. Rehearse
   compatibility/restore, include assistive/mobile/manual use and agency usability.
   Fix ambiguity and integrity failures before activation. Declare measured capacity
   budgets; neither source code nor a screenshot proves beautiful usable delivery.
5. **Monitor residual failures — accountable roles below:** assign actual team/on-call
   routes in the release evidence. Required prevention remains mandatory.

| Signal                                                                                                                     | Threshold                                                  | Owner                                        | Response                                                                                                                                      |
| -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Established selected list overwritten by initializer/refetch, or accepted list differs from displayed submitted intent     | Any confirmed occurrence                                   | P27 engineering/on-call with shared UI owner | Contain faulty prefilling, preserve qualified manual admission and receipts, identify affected work, fix and regression-test the exact path.  |
| Protected default/target/context disclosed through choice, cache, metadata, export or logs                                 | Any confirmed event                                        | P12 security incident owner                  | Contain the revealing path and follow existing incident process; verify minimum-safe projection and context isolation before reopening.       |
| Default points to withdrawn/foreign list, withdrawal clears a newer unrelated default, or replay revives a cleared default | Any confirmed invariant violation                          | P27 source engineering/on-call               | Stop affected configuration door, preserve durable evidence, repair through the authorized source command and verify concurrent/replay paths. |
| Optional suggestion outage blocks an independently valid explicit start                                                    | Any reproducible occurrence                                | P27 API/UI owner                             | Restore the independent explicit-choice path, diagnose helper coupling and regression-test failure states.                                    |
| Staff believe prefill proves suitability or cannot discover/change another permitted choice                                | Any validated support report or observed usability failure | P27 product/design owner                     | Reproduce and correct hierarchy/copy/interaction, review resulting record errors through qualified recovery, then retest with users.          |

No monitor requires logging sensitive option names, creating another staff inbox or
keeping speculative business history. Performance remains a measured release gate,
not an undefined “watch scalability” promise.

## Adversarial check

### What could go wrong with this answer?

A default could replace staff judgment or submitted intent, conceal invalid scope,
leak protected configuration or revive after withdrawal. R02–R10 address these
specific seams. Visible configuration and explicit source acceptance remain distinct.

### What hidden assumptions are we making?

We infer that optional usual lists can reduce repeated input, not that all agencies
have one process or will notice the default. No particular catalog size, labels,
permissions, default value or user-success rate is assumed. Agency/browser proof
remains required; the organization can leave the default unset.

### How does this affect the whole product?

One shared P27 preference supports authorized surfaces without becoming a personal,
CMS, public or vendor authority. D3/D4 identity/admission, D13 optional stage, D15
withdrawal and D16 shared choice remain intact. Other domains keep their facts.

### How does this affect the end-user experience?

Routine starts can begin with a readable selection. Staff can inspect its meaning,
change it and proceed through one normal action. Later defaults do not move their
work; failures preserve safe input and explain a real next step. Configuration is
optional and separate from ordinary partnership work.

### Does this follow modern best practices?

It uses restrained, visible, editable initialization and preserves valid input.
The strongest official warning about preselected answers is explicitly addressed,
not dismissed. Controlled/uncontrolled form behavior, authorization and retry are
verified at their real seams; vendor defaults do not override Core's source contract.

### Does this fit Asym’s existing repo and product direction?

Yes as intended behavior: shared Postgres/API authority, current P12 context,
base-maia controls and qualified native work. Existing form/view defaults are not
assumed to implement it. Missing product proof is identified rather than hidden.

### Should we adjust the recommendation?

**Accept.** Record the exact D17 with R01–R15 and AC01–AC22. No new product vote is
required for these bounded safeguards. Saved-list correction remains a separate
interview decision and a real release prerequisite; no unsupported implementation
or phase-completion claim follows from this review.
