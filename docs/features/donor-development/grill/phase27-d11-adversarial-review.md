# Phase 27 D11 — clear guidance, staff judgment and excellent stage-change UX

2026-10-10. **D11 explicitly ratified; review disposition: Accept.** The founder selected guidance
with staff judgment and explicitly prioritized excellent, beautiful and clear UX/UI.
The safeguards here preserve that choice and the boundaries already stated in
Q11. No material product amendment or repeat ratification was needed. The founder
subsequently explicitly confirmed, “ratify this and then continue with this phase
27 grill with docs session.” The exact decision and reviewed safeguards below are
ratified on 2026-10-10; this records that confirmation without changing their scope.

Research/interview evidence against Core HEAD
`225c02e9499bd6c0d493223cd4b1a4120ff787e3` and the current D1–D10 working documents.
This is a finished decision review and its implementation obligations, not a
formal PRD/OpenSpec, implemented feature, live authorization grant or release.
Formal specification and issues still require `/to-prd` and `/to-issues`.

## Exact decision ratified

> **D11 — Guidance, with staff judgment.** Organizations explain the meaning of
> their approved cultivation stages. Authorized staff record the appropriate stage
> without additional tenant-configured information requirements blocking the change.
> Stage guidance is advisory: it does not require an acknowledgment, compulsory
> explanation, checklist or unrelated record completion. Optional context remains
> optional. Existing source-owned permissions, stage eligibility, history and
> next-action safeguards remain mandatory.
>
> Present the stage and its meaning clearly within the particular partnership's
> context, with an accessible, deliberate update and truthful save/conflict feedback.
> Keep the recorded value authoritative until a change is accepted, and retain
> its lawful history. Guidance
> and stage selection do not prove contact, supporter agreement, participation,
> consent, financial facts or completion of other work.

The first paragraph states A and the mandatory boundaries in the original
question. The second makes the requested UX quality concrete without selecting
new product powers. Staff judgment operates within a stage's approved meaning;
it does not let each user redefine the organization's stages.

## Evidence and strongest alternative

**Repository facts.** [P27](../../../prds/sitestacker-parity/roadmap.md:4087)
requires shared enrollments, approved presets, stage history and next-action
discipline. [D10](phase27-d10-adversarial-review.md) ratifies tenant list flexibility,
stable meaning, retirement and source boundaries. [Q11](phase27-q11-stage-entry-requirements.md)
already excluded waiving existing source safeguards. [P11 E3](../../../prds/sitestacker-parity/phase-11-custom-fields-custom-collections.md:191)
explicitly protects unrelated saves from untouched newly required fields.
[CRM OpenSpec](../../../../openspec/specs/crm-core/spec.md:24), P12 and the
data-access boundary require authoritative source commands. These are intended
contracts, not proof of deployed behavior.

**Observed current behavior.** The [implementation evidence](d11-evidence/implementation.md)
separates donor-status/prototype paths from P27. A generic SelectCell closes on
its callback and displays `N/A` for a value absent from its option list; that is
not sufficient for retained retired-stage meaning or confirmed source acceptance.
A generic optimistic table helper performs direct table updates and can restore
a whole cached-list snapshot after failure. Its existence does not qualify a
multi-record stage/history/work command. Current missionary donor edits and CRM
note logging likewise do not establish P27 expected-version/history/privacy behavior.
Do not copy those behaviors simply because they are local.

**Primary external evidence, freshly retrieved 2026-10-10.** Salesforce's
[Path guidance](https://trailhead.salesforce.com/content/learn/modules/leads_opportunities_lightning_experience/visualize-success-with-path-and-kanban)
demonstrates contextual guidance and a deliberate stage action; its sales model
is not a missions contract. [Contentful](https://www.contentful.com/help/fields/configure-a-field/)
separates help text from validation. [HubSpot](https://knowledge.hubspot.com/object-settings/set-up-and-customize-pipelines)
documents conditional properties as a separate capability, supporting B as a
credible alternative. [RE NXT](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-opportunity-statuses.html)
documents contextual status editing, but does not establish that its comment is
optional; no such claim is imported. [WCAG On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html)
supports predictable interaction, not a universal prohibition on autosave.
See the [UX appendix](d11-evidence/ux.md) for editions, dates, source limits and
additional nonprofit CRM, CMS and accessibility evidence. Root also freshly
queried the official [Supabase RLS documentation](https://supabase.com/docs/guides/database/postgres/row-level-security):
applicable omitted `WITH CHECK` can fall back to `USING`; effective policy, grants
and actual role privileges must be inspected. No live catalog was inspected.

**Strongest alternative B.** A small, supported required-information policy for
selected stages can standardize documentation and handoffs. Its benefit is more
consistent recorded context. Its cost is collecting information even when staff
can accurately describe the present relationship without that information; it
also needs treatment of unknown, inaccessible and historical values. A nonempty
note does not establish its truth. No reviewed evidence proves compulsory stage
fields improve Christian missions outcomes. The founder chose A, which meets the
immediate need through clear definitions, accountable history and existing work.
Keep A; do not retain a dormant gate builder, exception queue or waiver system.

**Missions facts and inference.** [OMF](https://omf.org/get-involved/support-a-worker/)
describes meaningful financial and nonfinancial partnership. MPDX import/coaching
and TntConnect documentation illustrate incomplete imported context and distinct
contact/support facts; their dated, program-specific practices are not universal
agency rules. [The ministry appendix](d11-evidence/ministry.md) records those limits.
The risk of filler, the recommended interaction and its visual hierarchy are
product judgments to validate, not measured Asym user-study results.

| Evidence                                         | Scope                                                                                                              |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| [Ownership](d11-evidence/ownership.md)           | ADR/OpenSpec/P11/P12/P27/D1–D10 boundaries; DON-14 reconciliation; strongest alternative.                          |
| [Authorization](d11-evidence/authorization.md)   | Current source mutation/privacy limits, real-role qualification and exact trusted-context obligations.             |
| [Implementation](d11-evidence/implementation.md) | Actual UI/API/cache patterns, reuse hazards and bounded source-test evidence.                                      |
| [UX and comparables](d11-evidence/ux.md)         | Contextual interaction, accessible states, visual consistency and current primary documentation.                   |
| [Ministry practice](d11-evidence/ministry.md)    | Truthful staff understanding, imperfect history, nonfinancial partnership and scoped coaching/access distinctions. |

## A concrete UX contract

The normal action should feel like a small, understandable update to the
partnership the person is already working on. It should not require navigating
to configuration, completing the donor profile, opening a workflow diagram or
writing an essay.

**Recommended baseline:** a compact contextual **Change stage** editor. Show the
permitted supporter/ministry context and current recorded stage. Let staff choose
an eligible stage, see its short meaning and use **Save stage** or **Cancel**.
This is one deliberate save, without a second “Are you sure?” ceremony. An existing
equivalent interaction may be used after proving the same outcomes; D11 does not
freeze a dropdown versus popover versus responsive sheet or require a new component.

Essential stage meaning belongs beside the choice. Longer examples can expand
on request. A tooltip, hover state, distant help page or clipped label must not
be the only way to distinguish stages. Show only approved available meanings;
do not make up guidance when none has been supplied. Missing optional guidance
does not invalidate an otherwise legitimate update.

An illustrative content hierarchy, not final preset names or a screen mock:

| Placement                    | Information/action                                                   | Purpose                                                               |
| ---------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Existing partnership context | Permitted supporter and identified ministry                          | Confirm which work is changing without exposing extra information.    |
| Current value                | **Partnership stage** · current recorded label                       | Distinguish the stored understanding from the proposed choice.        |
| Change control               | Eligible choices with a clear selected state                         | Choose a stage deliberately; browsing alone has no business effect.   |
| Nearby guidance              | Selected stage's concise meaning; **More guidance** only when useful | Explain the choice without forcing acknowledgment.                    |
| Existing work context        | Current permitted next action/exception where already relevant       | Preserve accountability without demanding another task.               |
| Action row                   | **Save stage** · **Cancel**                                          | Commit once or discard unapplied intent. No new mandatory note field. |
| Result in context            | Saved, saving, conflict, rejected or unconfirmed status              | Let staff know what actually happened and how to proceed.             |

**Visual quality is an outcome, not decoration.** Preserve exact `base-maia`,
Base UI and shared semantic tokens, typography, spacing, radii and interaction
states. The stage label is primary; guidance and authorized provenance are
secondary; one primary action is visually obvious. Use restrained color, clear
focus/selection and readable empty/error states. Avoid sales-progress percentages,
supporter-value colors, confetti, competing animation or another design system.
There is no new public/donor surface or checkout step in D11.

**Mobile and accessibility are part of the same flow.** Provide keyboard and
tap/click operation, visible unobscured focus and readable guidance at narrow
widths/zoom. Respect Core's 44 CSS px touch minimum, reduced-motion behavior and
semantic light/dark tokens. Long names, translated stage labels and RTL content
must remain distinguishable. Where native scrolling or a responsive container
is needed, keep Save/Cancel reachable above the soft keyboard. Do not promise
offline saving; preserve safe unapplied intent and show connection uncertainty.

**Do not make optional context another product.** If an already-qualified optional
explanation exists, label it optional and keep it secondary. D11 does not require
adding a new note field, copying private CRM notes into history or collecting
sensitive ministry detail. Automatic actor/time/from/to provenance is distinct
from a staff-written explanation and independently governed for disclosure.

## Exact implementation and acceptance obligations

These clauses preserve the selected behavior. They are inputs to later formal
specification, not a schema or implementation plan disguised as a new feature.

**R01 — Advisory means advisory.** An otherwise valid ordinary stage update SHALL
succeed without additional tenant-configured required information, explanation,
acknowledgment, checklist, manager sign-off or unrelated profile completion.
Missing optional guidance/context SHALL not block it. Explanatory text SHALL not
execute rules. No tenant requirement may be relabeled a platform safeguard without
an accepted source-owner contract. Existing mandatory source fields/checks still apply.

**R02 — Narrow action and truthful facts.** Stage editing SHALL operate on the
specific cultivation journey and its approved stage meaning, not a Party status,
whole-record/custom-field form or another source's facts. Unrelated required fields
SHALL not enter this write. An actual separately requested source-field edit SHALL
retain its own validation. Stage selection SHALL not establish encounter, donor
agreement, consent, participation, money, meaningful contact, closure or task
completion. Neither a gift nor a score change silently updates the stage.

**R03 — Clear, deliberate interaction.** The interface SHALL distinguish current
recorded stage, proposed choice and accepted outcome. Browsing, focus, help expansion
and cancel-before-submit SHALL not mutate source state/history. Provide concise
meaning at the decision point, with accessible supplementary detail. Use a single
clear commit action in the ordinary editor and no routine second confirmation.
Do not introduce forced sequencing through arrows, numeric steps or a percentage.
Choosing the unchanged value SHALL not fabricate a new transition or assessment.

**R04 — Existing work remains accountable.** Accepted next-action/exception rules
remain mandatory. Applicable existing dated work or an owned actionable exception
may satisfy them. A stage edit SHALL not require a duplicate task, mark unperformed
work complete, drop promises or restart ended work. If a genuine source requirement
prevents acceptance, explain the permitted reason and shortest authorized recovery
in context; reuse valid information rather than requiring re-entry. D11 does not
settle all stage-specific work changes or grant task-mutation authority.

**R05 — Current authority and minimum disclosure.** Every read, preview, command,
deferred execution, receipt replay, export and repair SHALL resolve the appropriate
current P12 human or service/operator context, tenant/entity/source, capability,
processing purpose, field/history/result floors, residency and policy epoch.
Derive actor, tenant and attribution from trusted context; validate caller-selected
references against that context. Responsibility/configuration rights SHALL not
imply stage-edit or private-context access. Errors and stale-write results SHALL
not reveal hidden records, actors, notes or stage identities beyond permitted
observation; hidden-present/absent cases must remain indistinguishable where required.

**R06 — Database integrity without extra data collection.** Preserve same-tenant,
same-applicable-preset relationships, non-null required identities, immutable scope
bindings and protected history. Ordinary writes SHALL not update/delete accepted
history or cascade-delete referenced definitions. New ordinary selection SHALL
validate current stage eligibility; retained retired values and qualified historical
imports/corrections retain D9/D10 treatment. Inspect real PK/FK/unique/check/default
behavior, indexes, table/column/function grants, effective RLS `USING`/`WITH CHECK`,
views, function owner/search path and privileged paths. A permits no broad JSON
patch or service-role bypass. No new money columns, precision, storage bucket,
attachment requirement or global required-field table is introduced by D11.

**R07 — Accepted source change, once.** A real stage change SHALL check the
expected enrollment revision and current applicable target, then atomically accept
the stage fact, necessary history, stable business-effect outcome and required
secondary-effect intent. Never substitute a catalog format version for enrollment
concurrency. Replayed same intent SHALL recover the original authorized outcome;
same effect identity with different intent SHALL conflict. A later return to an
earlier stage, where separately permitted by its transition contract, is not
deduplicated merely because the target ID matches an old edit.
Use consistent lock ordering and bounded recovery from deadlock/serialization
aborts; no lost or duplicate accepted effect. D10 retirement/selection coordination
applies. Cosmetic guidance edits alone SHALL not impose a new acknowledgment.

**R08 — Honest pending and failure states.** Clearly distinguish unapplied choice,
saving, accepted, known rejection, conflict and unconfirmed outcome. Success SHALL
mean source acceptance, not a click, optimistic cache update or notification read.
A lost response SHALL not be called definite failure or definite success; resolve
through authorized receipt/current-state readback. Preserve safe unapplied intent,
prevent unintended double submission and offer useful recovery. A late failure
SHALL not restore an old whole-list snapshot over newer accepted changes. Closing
the editor or canceling a request after submission SHALL not promise to undo a commit.
Essential feedback SHALL remain in context, with appropriate accessible announcements.

**R09 — History and corrections.** Record genuine accepted stage changes with
stable source identity, prior/new value, actual acceptance time and trusted actor
provenance. Optional explanations SHALL remain optional and separately minimized.
Unknown historical dates remain unknown; reopening, renaming guidance or no-op
selection SHALL not reset stage/contact dates. Ordinary correction SHALL retain
prior accepted evidence under the owning correction contract. Do not add a generic
Undo control that deletes history, reverses completed effects or ignores current
authority. Exact correction/backdating/duration policies remain separate decisions. Where an
already-qualified optional explanation is submitted with the stage, retain its
owner's acceptance contract and report its actual outcome. A stage receipt SHALL
not certify uncommitted text, silently discard it or duplicate note/history on
retry. This does not require adding an explanation feature or a combined-write engine.

**R10 — Shared guidance, protected context.** Guidance SHALL describe an approved
stage, not store private supporter, missionary-location, pastoral or member-care
facts. Render through the qualified safe content path, with bounded text and
output/URL/export protections; no executable rule markup. Cache, logs, analytics,
generated documents, history and backups SHALL preserve current disclosure and
retention/erasure floors. Do not copy optional note bodies into unrestricted command
logs or immutable narrative snapshots. Current read authority governs old receipts
and corrected/redacted history as well as fresh reads.

**R11 — One source across surfaces and dependencies.** Permitted staff/missionary
views of the same journey SHALL resolve its same authoritative meaning; surface
differences remain disclosure/presentation differences. Render an existing retired
value as the last recorded current stage, marked retired, while preserving its
history; never replace it with `N/A` or an invented stage. Loaded rows and
browser state SHALL not own catalog membership or stage history. Native updates
SHALL work without optional Studio, provider availability or whole-phase predecessors
unrelated to the exact operation. DON-14 SHALL not introduce a pre-save tenant gate
or retrospectively invalidate a source-accepted stage. Required downstream work
uses its source-owned effect identity and recoverable acceptance boundary.

**R12 — Consistent accessible craft.** Compose the interaction from shared Maia/Base
UI primitives and existing semantic tokens; no alternate component library or
global style migration. Stage/guide/control/help/error relationships SHALL be
programmatically understandable. Keyboard, screen-reader and tap/click users SHALL
complete the same task; drag, hover, color and transient toast SHALL not be sole
channels. Test 200% text resizing and reflow at an effective width of 320 CSS px
(for example, a 1280 CSS px viewport at 400% browser zoom), long Unicode/RTL
content, light/dark contrast, Core 44 CSS px touch targets, soft keyboard, focus
restoration and reduced motion. WCAG conformance SHALL not be inferred from a
component import, screenshot or automated scan alone.

**R13 — Bounded read/write and rollout.** Opening guidance SHALL not fetch complete
giving/contact histories or all tenant journeys. Use appropriately scoped bounded
catalog/current-record reads and measured query plans; declare supported list/text
sizes, page limits, response/lock budgets and test profiles before activation.
Do not invent numerical capacity claims or adopt P11 quotas automatically. Census
actual retained data/clients; retire unsafe reached prototypes with explicit
history-preserving mapping. New/old versions must not silently drop stage IDs or
optional fields. Gate qualified slices, keep safe reads during write disablement,
and roll forward compatibly after new accepted data. Before backup-restored readers,
writers or workers activate, reconcile authoritative source/catalog revisions,
current authorization, retirement/redaction,
expiry and consumed-effect fences; hold affected access/writes if they cannot be
recovered. A backup restore is not a deliberate stage update.

**R14 — Evidence of usable outcomes.** Carry D11 and these requirements through
the glossary, appropriate owner contracts, formal requirements/design/tasks,
tickets and release evidence at their authorized workflow stages. Test the actual
source command and user journey with production-shaped data and real test roles.
Before general availability, validate the proposed copy and complete interaction
with representative agency staff and authorized support-raising users, including
less experienced staff and relevant assistive/mobile input. Record observed
confusion/failure, severity, correction and retest; do not claim measured benefit
or “best possible” usability before evidence exists.

## Source ownership and lifecycle, including difficult cases

P27 owns the recorded stage and its accepted meaning/history. D10 defines the
organization-approved catalog. P9 retains Party, Ministry Assignment, shared work
and responsibility sources; P12 retains authority. Finance, participation and
communications retain their own facts. The editor's tentative value and helpful
text are not source state, evidence of contact or a write policy.

The interaction states are **viewing → editing → saving → accepted / rejected /
conflict / unconfirmed**. These are UI/request distinctions, not new journey
lifecycle values. Cancel before submission leaves source state unchanged. During
an unconfirmed outcome, recover whether the accepted effect exists before treating
a retry as a new business act. A change after acceptance is another authorized
source action; displaying older content or dismissing the editor cannot reverse it.

| Case                                                                          | Required result                                                                                                                                               |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ordinary permitted update; no note, all existing source obligations satisfied | Save succeeds with attributable history and no tenant information gate. R01/R07.                                                                              |
| Untouched newly required custom field on the Party                            | Stage-only write does not include or validate it; separately editing that field follows P11. R02.                                                             |
| Existing applicable next task                                                 | Preserve it; no new task merely to finish the form. R04.                                                                                                      |
| Missing or inaccessible required source information                           | No fake default or unauthorized disclosure; explain the allowed recovery without relabeling tenant preference as safety. R04/R05.                             |
| Old or retired stage on reopen                                                | D9 retains it without fresh assessment or forced replacement. It remains unavailable as an ordinary new selection. R06/R09.                                   |
| No optional guidance supplied                                                 | Show available meaning honestly; do not invent policy or block valid work. R01/R03.                                                                           |
| Empty/unknown option response                                                 | Preserve the authoritative recorded value and distinguish unavailable choices from missing historical data. Do not save blank or infer no stage. R06/R08/R11. |
| Two staff edit concurrently, or the selected stage retires                    | Current source validation and expected version decide acceptance; loser receives a permitted conflict, not a silent overwrite. R05–R08.                       |
| Double tap, retry after response loss, delayed old response                   | One business effect; current authorized result; old result cannot overwrite newer source truth. R07/R08.                                                      |
| Same stage chosen again                                                       | No invented new stage-entry/assessment/contact time or repeated downstream effect. R03/R09.                                                                   |
| Staff knows present situation but not the old interaction date                | Record the actual new accepted update; leave unknown history unknown. R09.                                                                                    |
| Stage label suggests giving, prayer commitment, refusal or Never Ask          | No inferred participation, money, consent, task completion or closure; owners supply those facts separately. R02.                                             |
| Permission revoked while editor is open or before replay                      | Current command/result policy applies; preserve no unauthorized private draft/cache information. R05/R10.                                                     |
| Invalid optional note entered through an existing qualified feature           | Optional does not mean unsafe data accepted. Explain its own validation and allow removal; absence is never itself an error. R01/R10.                         |
| Current stage update accepted; secondary view/task projection delayed         | Show accepted stage truth, qualify affected secondary status and recover durable intent without repeating acceptance. R07/R08/R11.                            |
| User changes locale, timezone or device                                       | Stable IDs/meaning; localized labels/instants; no D6 date-only review change or clock reset. R06/R09/R12.                                                     |
| Protected alias/limited history in missionary view                            | Keep authorized relationship context and guidance; do not expose staff-private explanation to improve visual completeness. R05/R10/R11.                       |

**DON-14 and P11 conflicts are resolved explicitly.** DON-14's trigger follows
source acceptance and its binding remains unqualified/default-disabled. Its
“require relevant information” phrase can only coordinate separately qualified
downstream work; it cannot reverse A. P11 does require information in some owning
writes, but untouched fields do not belong to this stage-only action. Neither
contract is deleted or broadly weakened. See the ownership appendix for exact
anchors and generated OpenSpec limits.

Stage sequencing, backward/skipped transitions, initial/default choices, preset
switching, exact correction semantics, ask lifecycle and stage-specific task
treatment remain separate open decisions. They are not silently approved or
prohibited by choosing advisory information guidance.

Subsequent decision: [D12](phase27-d12-adversarial-review.md) now accepts direct
ordinary stage choice, including skips and returns. The other choices above remain
separate; this pointer does not rewrite D11's original scope.

## All 22 review categories

Severity measures prospective consequence: **Critical** = authorization/privacy
boundary failure; **High** = materially false/lost state or excluded users;
**Medium** = meaningful usability, maintenance or operational harm. Likelihood
is qualitative implementation judgment, not an observed production rate.
“Likely if reused” names a specific tempting current path. All material findings
below qualify implementation of A; none requires replacing or narrowing the
selected product choice beyond the Q11 boundaries already accepted.

| Category                                                         | Material concern: what fails, why it matters, severity and likelihood                                                                                                                                            | Evidence, effect on A and exact prevention/proof                                                                                                                                                                                                                                                                    |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Problem validity, necessity and alternatives                  | **Yes.** Advice can be too vague to support accurate updates; mandatory evidence can instead collect filler and obstruct legitimate understanding. Medium; plausible.                                            | User's A/UX requirement; CRM/CMS guidance distinctions and ministry evidence. **Retain A** with useful definitions and genuine accountability. R01–R04/R14; AC01/AC02/AC15. B's consistent-handoff benefit is acknowledged, not falsely disproved.                                                                  |
| 2. Brittleness                                                   | **Yes.** Retired/missing option labels become `N/A`; a stale menu, locale change or unrelated required field can break ordinary work. High; likely if generic controls/forms are copied unchanged.               | SelectCell/source inventory, P11 E3, D9/D10. **Retain A**, preserve historical value and narrow payload. R02/R06/R11/R12; AC03/AC04/AC11/AC13.                                                                                                                                                                      |
| 3. Technical debt                                                | **Yes.** A latent gate builder, duplicate stage arrays or generic form patch creates unnecessary policy/storage paths. High; plausible.                                                                          | No qualified P27 runtime in bounded source inventory; ADR-0001/shared command ownership. **Retain A** without speculative B infrastructure. R01/R02/R06/R11; AC01/AC05/AC10.                                                                                                                                        |
| 4. Edge cases                                                    | **Yes.** Inherited unknown history, retired current stages, reopens, no-op choices, revocation and ambiguous responses can create false assessments or lost work. High; plausible.                               | D9/D10 and lifecycle table. **Retain A**, distinguish retention, new selection, source acceptance and uncertainty. R05–R09; AC04/AC06–AC09.                                                                                                                                                                         |
| 5. Footguns                                                      | **Yes.** Browsing can trigger writes; clearing can erase a required stage; automatic “next” or Undo can create/reverse unintended effects. High; plausible.                                                      | SelectCell synchronous completion/clear behavior, source callback limits, WCAG predictable interaction. **Retain A**, explicit intent and bounded recovery. R03/R06/R08/R09; AC02/AC04/AC08. No new generic Undo engine.                                                                                            |
| 6. Tenant safety                                                 | **Yes.** Wrong journey context, shared cached guidance/results or target IDs can mix tenants/entities or disclose restricted history. Critical; plausible.                                                       | P12 and authorization appendix; stage ID alone is not scope. **Retain A**, current source/context/disclosure checks. R05/R06/R10/R11; AC05/AC06/AC12.                                                                                                                                                               |
| 7. Database, RLS and authorization safety                        | **Yes.** Direct broad patches, caller attribution or privileged RPCs may turn a permitted row into forbidden scope/state or omit history. Critical; plausible.                                                   | Current generic browser helper and donor API are not P27 boundaries; PG/Supabase evidence in authorization appendix. **Retain A**, qualify actual grants, effective old/new-row checks, keys, immutable scope and one command. R05–R07/R09; AC05–AC08. No D11 money precision/default or attachment-storage change. |
| 8. Overengineering                                               | **Yes.** Rule engines, waiver queues, mandatory explanation dialogs, custom controls or new scoring exceed the selected need. Medium; plausible.                                                                 | Q11/D10 scope and existing shared UI. **Retain A**, compose a small source action and advisory text. R01/R03/R11/R12; AC01/AC02/AC10/AC13.                                                                                                                                                                          |
| 9. UX/UI and friction                                            | **Yes.** Hidden/verbose help, compulsory notes, tiny touch controls, clipped names, toast-only feedback or poor focus make a pretty screen unusable. High/Medium; likely exposure without composed-flow testing. | Core Maia/accessibility contract, WCAG/GOV.UK/CRM sources. **Retain A**, apply concrete interaction and visual contract. R03/R08/R12/R14; AC02/AC11–AC15. No donor checkout or public publishing step added.                                                                                                        |
| 10. Source of truth, ownership and invariants                    | **Yes.** Stage/guidance can be treated as evidence of money, consent, contact or donor commitment; a read model can become a second authority. High/Critical; plausible.                                         | D1–D10, P27/P9/finance/communications ownership, ministry sources. **Retain A**, keep fact owners and attributable stage history. R02/R04/R06/R09/R11; AC04/AC09/AC10.                                                                                                                                              |
| 11. Hidden coupling                                              | **Yes.** Whole-Party validation, optional Studio or context queries can become prerequisites for a simple stage update. High; plausible.                                                                         | P11 E3 and DON-14 binding/trigger; current generic paths. **Retain A**, narrow participating write and qualified exact dependencies. R02/R04/R11/R13; AC03/AC09/AC10/AC14.                                                                                                                                          |
| 12. Failure modes                                                | **Yes.** Save-close before acceptance, lost response or whole-cache rollback can mislead staff or overwrite another accepted change. High; plausible; specific reuse hazard identified.                          | Current callback/optimistic helpers, distributed acceptance reasoning. **Retain A**, honest pending/unknown outcome, stable receipt and scoped reconciliation. R07/R08/R11; AC07/AC08/AC12.                                                                                                                         |
| 13. Lifecycle, temporal correctness, concurrency and idempotency | **Yes.** Concurrent edits/retirement, duplicate retries or identical target values across different events can produce stale history or bad deduplication. High; plausible.                                      | Original expected-version requirement, D10 concurrency proof and D9 retained facts. **Retain A**, source revision/eligibility plus durable business-effect identity. R06–R09; AC04/AC07–AC09. No time-in-stage policy silently chosen.                                                                              |
| 14. Data integrity                                               | **Yes.** Broad payloads, default-filled notes, erased retired stages and timestamp resets create false data without obvious crashes. High; plausible.                                                            | P11 payload semantics; current display/API limits. **Retain A**, narrow command, explicit absence and no-op/history semantics. R01/R02/R06/R09; AC01/AC03/AC04/AC09.                                                                                                                                                |
| 15. Security and privacy                                         | **Yes.** Help or explanations can expose sensitive ministry facts through logs, caches, receipts, exports or restored data. Critical/High; plausible.                                                            | P12, CRM note logging source and bounded disclosure findings. **Retain A**, minimal content, independent current read permission and governed retention/restore. R05/R09/R10/R13; AC06/AC12/AC14.                                                                                                                   |
| 16. Scalability and performance                                  | **Yes.** Fetching a whole donor history or rendering an unbounded stage/guide list makes a small action slow, especially in the field. Medium; plausible; no measured supported ceiling.                         | Current loaded-row/status patterns; UI/context design reasoning. **Retain A**, bounded scoped reads, declared measured profiles and no unnecessary history join. R11/R13; AC11/AC16. No unverified latency/capacity claim.                                                                                          |
| 17. Operational burden                                           | **Yes.** Unclear definitions create training/support work; failed edits requiring DB repair or newly forced chores burden staff. Medium/High; plausible.                                                         | User clarity priority, ministry handoff evidence and source recovery limits. **Retain A**, contextual guidance, current safe retry and existing work reuse. R03/R04/R08/R14; AC02/AC08/AC15.                                                                                                                        |
| 18. Observability and auditability                               | **Yes.** Eliminating required narrative could be mistaken for eliminating evidence; logs may record attempts as successful changes or omit secondary failures. High; plausible.                                  | Current command-log/source boundaries. **Retain A**, trusted accepted provenance distinct from optional explanation, security audit and technical attempts. R07–R10; AC07–AC09/AC12.                                                                                                                                |
| 19. Dependency and integration                                   | **Yes for existing consumers; no new provider is needed.** Optional recipes, delayed events or UI-library behavior can bypass or misrepresent acceptance. High; plausible.                                       | DON-14 unresolved binding; current UI composition/version/test limits. **Retain A**, exact source events/commands and component qualification. R07/R11/R12; AC07/AC10/AC13. No new CRM/CMS provider, synchronization master or rules package.                                                                       |
| 20. Migration, rollout and upgrades                              | **Yes.** Old broad forms, enum clients or restored snapshots can reinstate gates, erase IDs or restore revoked permissions/effects. High/Critical; plausible.                                                    | Current donor/status prototypes, D10 rollout and P12 restore rules. **Retain A**, inventory/reconcile actual retained state, mixed-version protection and current recovery fences. R06/R10/R13; AC03/AC12/AC14.                                                                                                     |
| 21. Testability, traceability and proof                          | **Yes.** “Beautiful” and “no blockers” can conceal subjective or untested behavior; component tests can be overstated as product evidence. High; likely if only screenshots/mocks are checked.                   | User quality requirement and actual qualification limits. **Retain A**, explicit tasks/states/input modes and traceable evidence. R12/R14; AC01–AC16.                                                                                                                                                               |
| 22. Other development hazards                                    | **Yes.** Review could pre-decide skipped/backward movement, correction, automation or preset switching, or ask for repeated approval without an actual amendment. Medium; plausible.                             | Q11 boundaries, accepted D1–D10 and original material-amendment rule. **Retain A** and document safeguards as inherited. R01/R03/R09/R14; keep remaining frontier explicit. No repeat ratification is required.                                                                                                     |

## Falsifiable acceptance criteria

| ID   | Required outcome; these are release obligations unless explicitly marked executed below                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC01 | Given valid current authority, eligible target and satisfied source obligations, save an ordinary stage change with no explanation, acknowledgment or tenant-required field. No new note/checklist/approval/task is demanded merely for the change. Unsafe optional content, if separately supplied, follows its own validation and may be removed.                                                                                                                                                                                          |
| AC02 | From an authorized partnership context, identify current stage, understand the proposed stage's meaning, choose and save through one compact interaction without leaving for settings. Browsing/help/cancel has no source effect; one deliberate commit is sufficient. Missing optional guidance is not a validation error.                                                                                                                                                                                                                  |
| AC03 | An untouched missing newly required Party/custom field does not block the stage-only action and is absent from its payload. An actually requested governed field edit still receives its owner's validation. No filler, default or private data is added to bypass a form.                                                                                                                                                                                                                                                                   |
| AC04 | Reopen with an unchanged retired stage and unknown provenance date; retain both without a new assessment. Fresh retired selection fails. Same-value no-op, renamed guidance and locale changes do not create transitions or reset dates. Qualified historical corrections/imports retain their separate treatment.                                                                                                                                                                                                                           |
| AC05 | Exercise real nonowner application roles and API/RPC paths: cross-tenant/entity/preset targets, broad extra payload fields, scope/actor spoofing, lead/configurator without stage power and service jobs. Reject forbidden old/new states and preserve history atomically; verify actual grants/RLS/function owners/search paths.                                                                                                                                                                                                            |
| AC06 | Revoke authority during editing, deferred execution and result replay; enforce current source/purpose/field/history/residency policy. Hidden-present/absent targets, stale-editor identity and unique/FK errors reveal no unauthorized facts. Protected aliases remain protected.                                                                                                                                                                                                                                                            |
| AC07 | Deterministically interleave two enrollment edits and retirement versus selection; exercise duplicate business effects, different content under the same effect key and, where separately admitted by the transition contract, a genuine later return to the same stage. No stale overwrite, duplicate accepted event or mistaken lifetime deduplication occurs.                                                                                                                                                                             |
| AC08 | Disconnect/fail before commit, after commit before response and during downstream projection. UI distinguishes known rejection from unconfirmed outcome; recovery finds the authorized accepted result. Late errors cannot roll back newer data. Closing/canceling after submit never claims to undo a committed update.                                                                                                                                                                                                                     |
| AC09 | A real stage change records actual actor/time/from/to provenance without requiring a narrative. It changes no contact/giving/consent/closure fact. Preserve valid existing work and expose genuine missing accountability; no duplicate task or false completion appears. Optional context is not copied into unrestricted logs. Where an existing qualified flow submits text with a stage, inject partial success/response loss: report each actual accepted outcome without discarding or duplicating text or certifying an unsaved note. |
| AC10 | Native updates work with Studio and unrelated providers unavailable. DON-14 cannot gate or reverse the accepted stage; duplicate/out-of-order downstream delivery preserves one source effect and current authority. Financial/prayer-like stage labels create no financial or participation evidence.                                                                                                                                                                                                                                       |
| AC11 | Long Unicode/RTL/translated labels and international names remain distinguishable under 200% text resizing and reflow at an effective 320 CSS px width (including a 1280 CSS px viewport at 400% browser zoom). Relevant controls stay reachable with soft keyboard and slow connection. Locale/timezone changes alter presentation, not identity or D6 date-only meaning.                                                                                                                                                                   |
| AC12 | Test stale caches, tenant/context switches, redaction/retention, CSV/document output, denied history and backup restore. Expose only currently permitted content; older responses cannot overwrite newer accepted revisions. No sensitive guidance/narrative remains in an unauthorized draft or shared cache.                                                                                                                                                                                                                               |
| AC13 | Complete normal, cancellation, failure and conflict flows using keyboard, screen reader and tap/click; verify names, described help/errors, focus and restoration, material status announcements, light/dark contrast, Core touch targets and reduced motion. Drag is optional; automated axe checks supplement manual outcomes.                                                                                                                                                                                                             |
| AC14 | Inventory retained data/clients, rehearse additive reader/writer compatibility, map actual legacy status meanings explicitly, and test slice activation, write kill switch, safe reads and forward repair. Restored snapshots cannot replace later authoritative stage/history or revive retired choices, revoked access, redacted content or consumed effects. No migration is inferred solely from a demo enum.                                                                                                                            |
| AC15 | Representative missions staff, including less experienced staff and relevant authorized support-raising users, can explain the selected stage, its limits, what remains unknown and whether the change saved. Include prayer-only partnership, church/multiple-ministry context and incomplete handoff history. Resolve every observed critical task failure before general availability; record findings and retests without inventing a success rate or preference claim.                                                                  |
| AC16 | Declare finite supported catalog/text/history/tenant profiles, query plans, request/lock budgets and throttled-network test conditions; measure them on the actual composed flow. Guidance opening does not scan all journeys or full financial/contact history. Over-limit and timeout outcomes remain safe and understandable.                                                                                                                                                                                                             |

## Proof and evidence limits

Five independent research appendices support the decision. Three independent
reviewers checked the consolidated review; conditional backward-transition proof,
optional-text acceptance, current restored revisions, retired-value display and
zoom/reflow wording were refined without changing A. Root verified the
shared UI configuration and ran the installed shadcn `info --json` in
`packages/ui`: exact `base-maia`, Base UI base, Zinc and CSS-variable configuration
remain present. This is configuration evidence, not a rendered visual-quality,
RTL or accessibility pass. No component package, style or registry was changed.

**Three existing SearchableSelect tests passed** using the real shared control and
Base UI in jsdom: stable-ID keyboard selection/focus, empty-result preservation,
and disabled/refreshed options. The [source-probe record](d11-evidence/source-probe/README.md)
retains commands, raw results, exact versions, safe isolated configuration and
source hashes; root verified those hashes and results. Installed Vitest 4.1.4
differs from manifest 5.0.3; this focused harness excludes the previously failing
root Sentry alias. It is not the full repository gate, a browser accessibility
pass or a P27 stage-save test. No new implementation tests or SQL fixture were
created. Only this actual scope counts as fresh D11 proof. D10's 15 isolated
PostgreSQL checks remain prior evidence for identity/retirement/concurrency;
they were not rerun or relabeled as D11 application tests.

No P27 UI/source command or live Supabase authorization path has been qualified.
No actual agency user study, full application accessibility assessment, browser
visual acceptance, performance measurement or migration rehearsal has occurred.
This prevents a claim that the eventual UI is already “best possible”; it does
not prevent accepting a clear product policy and setting a falsifiable quality bar.

## Synthesis: do this, in this order

1. **Recorded and explicitly ratified:** A, Q11/log/glossary and the preservation of ratified D1–D10.
   All safeguards above elaborate already stated source boundaries or the explicit
   UX requirement; no new founder permission or ratification loop is justified.
2. **Carry into specification/design:** R01–R14, AC01–AC16 and the concrete UX
   contract. Keep advisory guidance separate from source validity and close the
   DON-14/P11 interpretation explicitly. Resolve the remaining stage-transition,
   existing-work, correction and preset policies through later interview choices;
   do not fabricate them to make this review appear to finish all of Phase 27.
3. **Require in implementation:** a narrow current-authority source command and
   shared contextual editor; stable accepted history/effects; expected revisions;
   honest pending/conflict recovery; current privacy and bounded consumers. Reuse
   shared primitives after checking composition; do not reuse unsafe prototype
   semantics or build a rule/waiver/approval system.
4. **Prove before activation:** actual source/database/API roles and race outcomes,
   complete keyboard/screen-reader/touch/mobile flows, design-system fidelity,
   retained-data/mixed-version/restore safety and representative staff comprehension.
   Trace D11 → glossary → relevant owner/ADR only if a new durable architectural
   decision warrants it → formal OpenSpec/design/tasks after `/to-prd` → tickets
   after `/to-issues` → implementation tests and release evidence.
5. **Monitor only qualified operation:** assign actual people to these accountable
   functions before activation. Monitoring does not substitute for missing privacy,
   concurrency, accessibility or source qualification.

| Signal                                                                                                                  | Threshold                                                                                                   | Accountable owner               | Response                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Otherwise valid ordinary stage save requires tenant-added note/acknowledgment/unrelated field                           | Any reproducible instance                                                                                   | P27 product/source owner        | Remove the hidden gate from the affected path; rerun AC01/AC03 before reopening that path.                                  |
| Unauthorized cross-scope/read/history/receipt disclosure                                                                | Any confirmed instance                                                                                      | Security/P12 owner              | Contain affected routes/caches/exports, preserve evidence and invoke security incident handling.                            |
| Duplicate accepted stage effect or stale overwrite                                                                      | Any confirmed instance                                                                                      | P27 source engineering owner    | Stop affected writes, reconcile accepted history and repair protocol before re-enable.                                      |
| An unconfirmed mutation is still unresolved after one completed authorized reconciliation attempt                       | Any such result                                                                                             | P27 operations owner            | Keep status unconfirmed, correlate source receipt/read failure and repair; do not ask staff to create a new effect blindly. |
| Configuration or stage command timeout/deadlock failures                                                                | Three failures in 15 minutes for the same tenant/source slice; proposed operating trigger, not measured SLO | Platform performance owner      | Inspect contention/plans, bound affected work and repair; qualified numeric budgets remain an activation prerequisite.      |
| Usability participant cannot identify current/proposed/saved state, complete without drag, or access essential guidance | Any reproducible critical task failure                                                                      | P27 product/accessibility owner | Correct composition/copy, retest that task and block wider release until resolved.                                          |

## Adversarial check

### What could go wrong with this answer?

“Guidance” could become a hidden required note or meaningless decorative text.
Generic status controls could hide retired values or imply success before source
acceptance. The requirements forbid those outcomes and demand source/interaction proof.

### What hidden assumptions are we making?

That concise contextual guidance will serve these teams better than compulsory
stage fields is a reasoned product choice, not an observed comparative trial.
We have not established final agency definitions, precise performance limits or
complete implemented transitions. No example is treated as a universal ministry fact.

### How does this affect the whole product?

It keeps native cultivation simple while preserving independent source owners.
P11 required-field rules and optional DON-14 cannot become hidden stage-entry gates.
The same source meaning serves authorized staff and missionary projections without
adding donor/public work or a second cultivation record.

### How does this affect the end-user experience?

Staff see the current stage, understand the choice and save it deliberately in
context. No compulsory explanation is added. Applicable existing work remains accountable, with its permitted context
visible; failures and conflicts are understandable. Mobile and assistive-input
users receive the same essential meaning and completion path.

### Does this follow modern best practices?

Current CRM and CMS documentation supports separating guidance from validation
and making deliberate contextual edits. Accessibility guidance supports predictable
controls, accessible feedback and usable help. Neither proves one perfect layout;
Core's actual composed tasks still require validation.

### Does this fit Asym’s existing repo and product direction?

Yes. A preserves the shared stage model, current P12 authority, source-owned work
and exact Maia/Base UI system. It rejects unsafe reuse of generic donor statuses,
whole-record validation and unconfirmed optimistic completion without replacing
the sound shared component infrastructure.

### Should we adjust the recommendation?

**Accept A.** No material amendment is necessary. Record the explicit UX contract
and inherited safeguards, require the listed proof before release, and keep later
product choices separate. Excellent UI is an acceptance obligation, not a claim
that a document or component test has already delivered it.
