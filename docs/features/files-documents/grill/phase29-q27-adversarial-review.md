# Phase 29 Q27 — Staff review email opt-in with current source work

**Disposition: Accept with required amendments.**

**Status:** Conrad selected Q27 A and fully ratified its complete required
amendment package on 2026-10-22, Asia/Bangkok, preserving flexible tenant opt-in,
excellent UX/UI and all journeys without overengineering. Q01–Q27 are ratified
grooming intent. This preserves the adopted decision and proof obligations;
Q28's answer is not inferred. No implementation, activation or formal owner/
OpenSpec publication follows.

Keep the normal product small: current review work stays in the request/My Work
experience. An authorized tenant can enable an additional staff email in the
existing notification settings. No per-upload checkbox, new bell event,
subscriber directory or new workflow engine is required.

The essential amendment is temporal: notification eligibility belongs to the
original source-actionability occurrence. A delayed worker must not apply a
later On setting or a newer team roster to old work. A verified Off result can
remain a real zero-member occurrence without resolving unused email recipients.

## Evidence, assumptions and recommendation

| Evidence class                 | Finding and implication                                                                                                                                                                                                                                                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Founder choice                 | A is selected. This is tenant opt-in for the optional staff-email step, not a requirement for a separate manual notification on every submission or a new double-opt-in enrollment.                                                                                                                                       |
| Ratified source facts          | Q03 fences corrected predecessors and requires inline correction awareness. Q21 owns exact item/evidence acceptance; Q22 owns fulfillment. Q24 already requires coherent review responsibility and current request/My Work. None makes mail the source of review work.                                                    |
| Governing communication intent | P17 owns a bounded tenant plan, native meaning/role/binding/content/material and whole-plan compilation. P6 owns durable communication intent, submission/evidence and recovery. Current source/P12 authority governs work and egress. A task row or group membership is not sufficient authority.                        |
| Inspected implementation       | Finance creates pending-review tasks and notifications through source-specific helpers, current profile/settings queries and newly-inserted-only delivery. It is useful implementation evidence but does not qualify a native document-review notice, original-boundary plan/cohort binding or durable provider recovery. |
| External facts                 | Document-collection products distinguish granular submission notices from aggregate readiness; application-review systems use both work lists and email. Defaults vary. Their audience, granularity, timing and permissions do not transfer automatically.                                                                |
| Product judgment               | Optional external email Off is proportionate when a durable current-work experience already exists. B, initially On, is strong for intermittent or out-of-app reviewers. No evidence proves all ministry staff check Core daily or that A improves response time.                                                         |
| Illustrative assumptions       | Named users below illustrate behavior, not observed ministry workflows. Useful discoverability of the setting and real current work must be proved with representative staff. Disabled email is not proof that anybody noticed the task.                                                                                  |
| Qualification limits           | Native source occurrence/policy/cohort proof, exact staff-email material class, effective deployed roles, actual provider recovery, measured limits and composed browser/AT/user journeys are required deliverables. Source reading and documentation checks cannot certify them.                                         |

Detailed evidence is in the independent [owner review](phase29-q27-owner-adversarial.md),
[runtime review](phase29-q27-runtime-adversarial.md) and
[UX research](phase29-q27-ux-adversarial.md). The
[historical question](phase29-q27-question.md) preserves A and B fairly.

## Primary research and strongest alternative

Primary documentation was checked on 2026-10-22. Displayed dates identify the
manual, not every deployed product edition. These sources establish patterns,
not measured Asym outcomes or universal best practice.

| Primary evidence                                                                                                                                                                | Relevant fact                                                                                                                                                                | Core interpretation and boundary                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [FileInvite notification preferences](https://help.fileinvite.com/articles/managing-notification-preferences), current guide                                                    | Request submission email starts disabled; Ready for review starts enabled and means all documents submitted.                                                                 | Supports separating granular intake from a meaningful review handoff. It also supports B for aggregate readiness. Do not copy an all-request gate, two-hour batching, master mute or autosave behavior into Core item review.    |
| [Content Snare email preferences](https://contentsnare.com/help/knowledge-base/manage-emails/), updated March 24, 2024                                                          | Field-completion email and a daily email limit are enabled by default; personal and team-event settings can disable notices.                                                 | Real volume and organization/personal distinctions matter. Do not import a daily quota, all-team audience, CC-to-self or reminder scheduler. Its On default is counterevidence to a universal Off claim.                         |
| [Submittable Next review guide](https://next.support.submittable.com/hc/en-us/articles/42009269512343-How-to-Complete-a-Review), updated October 15, 2026                       | New-assignment email accompanies an assignments work list.                                                                                                                   | Strong B evidence for reviewers outside the app. Assignment is not the same source event as new evidence becoming actionable; do not import review rounds, extra confirmation, account enrollment or blanket reviewer authority. |
| [Submittable Next communication overview](https://next.support.submittable.com/hc/en-us/articles/41676497661335-Email-Communications-Overview), updated July 6, 2026            | Revision Submitted sends automatically to Program Admins outside configurable Setup.                                                                                         | Shows that revision return deserves attention, but its administrator audience and non-configurable behavior conflict with Core's exact source recipients and tenant flexibility. Do not copy either.                             |
| [W3C status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) and [redundant entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html) | Relevant result/status changes need accessible presentation; repeated entry should be avoided unless justified.                                                              | Preserve current work, input and focus through recovery. No compulsory second setup, recipient form, preview refresh or confirmation ritual; actual composed accessibility remains untested here.                                |
| [PostgreSQL 17 isolation](https://www.postgresql.org/docs/17/transaction-iso.html) and [RLS](https://www.postgresql.org/docs/17/ddl-rowsecurity.html)                           | Concurrent transactions and related-row changes need explicit correctness; row visibility and permitted resulting rows differ, and privileged roles can bypass ordinary RLS. | A preflight lookup or table policy alone cannot prove original source/plan/cohort binding or prevent retargeting. Prove the native command and actual roles. Repository target evidence is not a hosted-version query.           |
| [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys)                                                                                                 | Its documented provider-key window is 24 hours.                                                                                                                              | Permanent business identity and ambiguous-outcome recovery remain with P6; no new-key resend, physical exactly-once delivery or recall promise.                                                                                  |

**Strongest B:** the same bounded tenant setting starts On, helping staff who do
not frequently open Core. Its cost is unexpected/repeated inbox traffic. A
avoids assuming that extra email is necessary for every tenant, while making it
straightforward to enable. Both retain real current work. Neither is safe if
the work view is stale, hidden or unowned. A cannot be justified by inventing
daily staff usage or claiming that email never helps.

No-build alternatives are limited: existing current work can serve tenants
that deliberately leave email Off, but a permanently unavailable notice setting
does not fulfill the requested configurable capability. Manual copied email,
per-file sending and a new reminder/digest engine are not acceptable substitutes.

## Ratified corrected decision

> For ordinary native document-review work caused by first submission or a
> current correction, keep the optional staff-email step Off in the qualified
> system/default tenant plan. Authorized tenant staff may enable it through
> the existing bounded System Messages/Delivery Plan configuration. Preserve
> current request/My Work, source responsibility and Q03 inline correction
> warnings independently. Email is supplementary awareness, not work creation,
> permission, acknowledgment, review acceptance or fulfillment.
>
> Admit this notification only for the source's authoritative first actionable
> occurrence for the exact current item/evidence/review basis. Receipt, upload,
> scan or preview events may cause source re-evaluation but cannot independently
> create it. Technical retries or readiness loss/restoration on the same basis
> do not create another occurrence. A genuine newly admitted correction may
> create a new review basis even while the same logical work remains pending.
> Do not require every item in the request, an online reviewer, a personal claim
> or an extra recipient Submit for review action.
>
> Bind the original occurrence to the then-effective notification policy and,
> when needed for enabled delivery, the source's exact admitted review-work
> recipient generation and complete finite candidate basis through trusted
> source/P17 resolution. Order that boundary with plan publication; worker time
> and caller-supplied plan or recipient fields cannot choose eligibility. Later
> On or roster changes cannot notify old work. Previously received evidence
> that first becomes actionable after On can be a new eligible occurrence.
>
> Keep lawful receipt, current work and review available when optional notice
> proof is unavailable. Retain a durable unresolved handoff with trustworthy
> original-boundary provenance; recover the original terms or remain safely
> blocked, never substitute today's On or recipients. A proved Off under valid
> top-level authority may produce a durable zero-member result without querying
> recipients or contacts for the disabled step. Unknown required proof is not
> Off or zero. Use one complete bounded P6 plan release and permanent replay
> identity; no partial send, historical catch-up or independently committed
> per-recipient loop.
>
> For this exact Q27 optional staff-email step, explicitly add a Tenant Off
> narrowing ordered with P6 submission admission. Off-first stops affected
> unsubmitted work; admission-first retains potentially in-flight truth.
> Preserve immutable plan/content pins and unrelated purposes. An intervening
> Off remains effective for old work even after On returns. No stopped or
> historical zero/off occurrence revives through retry, restoration or settings.
> This is a Q27 owner amendment, not automatic inheritance of Q26's exception.
>
> Use the existing tenant configuration and staff doorway, exact current
> source-authorized recipients, minimal approved content and separate truthful
> delivery outcomes. Configuration does not broadcast to all team members or
> grant source access. Qualify the native email-only material/utility/Recent-copy
> posture explicitly; do not invent a required bell sibling to reuse another
> profile. No new in-product notification, personal preference center, per-upload
> control, assignment/handoff mail, digest, reminder, access clock or notification
> engine is selected.

## Exact owner reconciliation

Q27 narrows Q24's notification-default reservation and Q03-C17's separately
authorized communication boundary for incoming ordinary staff review work only.
Keep Q03's immediate correction fence, Q21–Q25 source meaning, Q26's recipient-
facing notice and all source work/access obligations unchanged.

C03/C04 explicitly specialize the native source occurrence: original policy
and required enabled-cohort eligibility are bound at its authoritative
actionability boundary, with server-owned resolution and recoverable provenance.
This is a required native admission contract, not a claim that current finance
queues or a later P17 worker already preserve it. Reconcile it in the source,
P17/P6 binding and applicable OpenSpec owners before activation.

Platform ADR-0026 and P17 normally pin plans and make edits future-effective.
The C06 Off stop above is an **explicit ratified Q27 exception** for this exact
optional step, ordered at the existing P6 submission boundary. It does not
rewrite plan/content or global policy. On is prospective; old admission must
also prove no intervening Off invalidated it. A check of the current On value
alone is insufficient. Reuse qualified source/delivery fences, not a new
generic cancellation engine or a synchronous scan of every pending request.

P17's `prepared.optional_staff_7d@1` is specifically for staff email accompanying
required in-product attention. Q27 selects no such event, so a native reviewed
material-class/utility mapping is necessary; neither that class nor Q26's
external-recipient class may be adopted by a label. No new retention number is
selected without its owner qualification. Required privacy and finite ceilings
are prerequisites before Live use, not optional future cleanup.

## Required clauses

| ID                                                        | Exact required spec/design language                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q27-C01 — Scope, default and occurrence                   | The native source SHALL define the exact ordinary item/evidence/review basis that first requires actionable human review after first submission or current correction. Its optional staff-email system/default plan SHALL be Off; only authorized tenant publication may enable it. Source work and Q03 warnings remain independent. The notification occurrence SHALL be durable and distinguish genuinely new evidence basis from retries, task rendering, check/preview outages, same-basis readiness oscillation and responsibility-only changes. Technical events may wake a qualified source recheck but cannot own the decision. No per-file email, whole-request-ready gate, new submit-for-review ceremony, reviewer-online condition, personal claim or human-review SLA follows.                                                                                                                                                                                                                                                                                                                                                                            |
| Q27-C02 — Real flexible configuration and distinct powers | Provide this event's usable bounded P17 tenant configuration, showing effective Off/On, inheritance, source-resolved staff audience and permitted message/locale/sender/reply choices. Enabling applies to new actionability occurrences, not old pending work or upload age. Use existing publication, synthetic impact/comparison and restore-as-draft. Review/source responsibility, plan/content administration, source visibility and notice/contactability authority SHALL remain separate; a reviewer need not become a plan administrator. Apply actual existing recipient preferences/consent/suppression without inventing a personal opt-in center or borrowing another purpose's preference key. No arbitrary To/CC, shared-mailbox identity, all-admin/member fallback, hidden global mute or participant-controlled staff recipients.                                                                                                                                                                                                                                                                                                                    |
| Q27-C03 — Original policy admission and durable handoff   | The source actionability occurrence and tenant plan publication SHALL have a trustworthy authoritative logical order. Bind policy eligibility through P17's server-owned resolver to the effective plan at that original source boundary, with immutable sufficient provenance for exact recovery before any delayed execution. Do not accept a caller/producer-selected plan or use worker/browser time, upload time, task materialization or a refreshed configuration lookup to choose old eligibility. Co-located source/history/admission/handoff writes SHALL be coherent and atomic; providers remain outside locks. If optional proof cannot be established, preserve independently lawful receipt/work/review with a durable unresolved notice handoff and original-boundary provenance. Recover those original terms or expose blocked/unavailable; never borrow future On or manufacture zero. Failure to persist required source/handoff evidence must not be reported as a completed transition.                                                                                                                                                          |
| Q27-C04 — Exact bounded staff recipients                  | For an enabled original occurrence, bind the native source's then-admitted review-work recipient generation and complete finite concrete candidate basis, independently qualified for this notice purpose and contactability. A team route needs a declared/proved resolver; responsibility/team membership/task row alone grants no disclosure. Preserve original eligibility and generation evidence for unresolved recovery, with current narrowing before dispatch. Later joins, handoffs, restored access or expanded settings SHALL NOT append or replace recipients in old work. Continuing entitlement must be proved through the source's actual continuity rules, not assumed from an equal ID. For a proved disabled step, do not enumerate unused rosters/contacts merely to create a zero result. Proved zero, partial/unknown and over-limit resolution are distinct; no fallback, truncation or recipient list leak. Task projection need not materialize before source-qualified mail. Q01's request-participant no-Party authority MUST NOT become a staff-recipient fallback; qualify the actual staff branch without fabricated accounts or grants. |
| Q27-C05 — Full-plan identity and replay                   | Reuse P6's single bounded whole-plan compilation/release with permanent source-occurrence identity, exact original plan/binding/context and complete validated candidate set. All children or a proved zero result commit atomically before any child is claimable. Unknown or incomplete required resolution releases nobody. Replay SHALL recover the original admitted terms and outcome, not re-evaluate today's tenant/roster defaults. Changed bound material conflicts; legitimate new source occurrence uses new authority, not merely a fresh transport key. Item-plus-pending-status, same bytes/address or provider-key age are insufficient identity. A failed optional notice never deletes evidence, creates another task/review or changes acceptance/fulfillment.                                                                                                                                                                                                                                                                                                                                                                                      |
| Q27-C06 — Explicit Off stop and current usefulness        | As a Q27-specific amendment to general future-only plan edits, published Tenant Off SHALL narrow this exact step's current eligibility, serialized with P6 submission admission through the qualified source/delivery boundary. Off-first suppresses affected unsubmitted work; admission-first preserves potentially in-flight/unknown evidence. Retain immutable plan/content pins and unrelated purposes. An intervening Off SHALL permanently invalidate the older admission for further new submission admission even after On; no old/zero/stopped occurrence is revived. Relevant evidence, source, privacy and recipient changes SHALL fence affected unstarted work. Re-prove source applicability, recipient/destination/contact, suppression, sender/connection/reply and current action at required preparation/submission/use boundaries. No stale review promise, readdressing, channel substitution or sealed-body rewrite. Use existing exact provider reconciliation/recovery; Off cannot promise recall or authorize a blind retry.                                                                                                                  |
| Q27-C07 — Minimal protected content and material          | Show only an approved minimal staff-purpose projection, with the current authorized staff doorway. Subject, preview, body, sender/reply, labels, counts, samples and history SHALL not expose restricted request existence, care/location/third-party facts, filenames, raw notes, attachments or storage links outside their exact permission. Synthetic setup preview cannot load private live evidence merely because the actor manages templates. Do not copy Q26 participant credentials or require a new account; any protected action material must use its own qualified carrier and stay out of generic facts/editor/history/logs. Qualify the native optional email-only closed material class, finite source-utility ceiling, absolute non-extending purge due and explicit Recent-copy policy; no accidental 7/30-day inheritance or fake in-product sibling. Minimize body-free history and follow existing export/redaction/erasure/backup owners.                                                                                                                                                                                                       |
| Q27-C08 — Complete lean journeys                          | Preserve the existing source/request/My Work experience, truthful current state and Q03 correction warning without replacing the evidence under a reviewer. Make the staff-email setting discoverable and understandable without forcing setup on every request. Explain effective Off, future-only On, independent work visibility, unavailable checks and scoped repair in plain language; do not blame participants for staff delay or imply delivery proves reading. No per-upload toggle, new bell, extra recipient action, compulsory duplicate entry, artificial personal claim or routine second approval. Use Core base-maia/Base UI and actual keyboard/AT/zoom/reflow/touch/mobile/low-bandwidth/localized/RTL/long-name and images-blocked email proof. Preserve authorized input/focus/context on recovery and discard stale cross-tenant/user/source results; no private offline cache or automatic download.                                                                                                                                                                                                                                            |
| Q27-C09 — Structural data and bounded operations          | Enforce stable same-tenant/environment source/basis/recipient-generation/plan/intent/attempt relationships, trusted actor/system attribution and times, valid states/nullability/defaults, immutable original admission and permanent uniqueness. Prove effective grants, RLS USING and WITH CHECK, trigger transformations, views/RPC/functions/storage and service/worker paths; an allowed update cannot retarget tenant, actor, basis, purpose, recipient or admitted policy. Use source-appropriate delete/redaction rules, not destructive cascades into required effect history or indefinite body retention. Bound indexed current proof, history pagination, exact finite recipient/step compilation, retry/recovery and tenant fairness under measured owner budgets. Over-limit rejects before partial release; known Off avoids unnecessary cohort work. No new money/precision fields, general notification schema or per-team mailbox machinery.                                                                                                                                                                                                         |
| Q27-C10 — Prospective adoption and proof                  | Activate only after the exact native source/actionability/recurrence/policy-boundary/cohort contract, P12/P9/Workflow seams, P17 meaning/profile/default/binding/content/material and P6 release/dispatch/history/recovery are qualified with P01–P26. No whole future Studio completion is required. Preserve Q01–Q26 and reconcile Q03-C17/Q24 reservations plus C06's explicit owner exception into canonical sources and complete incorporated OpenSpec, then regenerate projections at authorized publication. Gate mixed-version writers, retain legacy unknown/omitted history without guessed On, prohibit historical catch-up through import/backfill/restore, and reconcile outward effects before resumption. Scoped stop/rollback preserves source work and valid later acts. Bind named operators and finite measured limits before activation.                                                                                                                                                                                                                                                                                                           |

## Category-by-category adversarial review

Severity and likelihood assess the hazard **if the amendment is omitted**, not
an observed native production incident. Likelihood is a reasoned exposure under
ordinary settings changes, retries or work, not measured rates. Critical means
unauthorized sensitive disclosure; High means material lost/false business or
communication truth; Medium means significant UX/operational/maintenance cost.
Every material row explains its effect on A and points to exact clauses/proof.

| #   | Category and material concern                                                    | Failure, evidence, effect and exact prevention                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| --- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Problem validity, necessity and alternatives — Yes**                           | **Medium / plausible.** Opt-in can leave intermittent reviewers unaware even though work exists; default-on can create repeated inbox noise. FileInvite varies defaults by grain; Submittable supports outward awareness. This **narrows A** to supplementary email with discoverable tenant enablement and real current work, preserving strong B and intended-user proof. **C01–C02/C08; P01/P19/P25**.                                                                           |
| 2   | **Brittleness — Yes**                                                            | **High / plausible.** A delayed worker reads current On after a source occurrence under Off, or a failed lookup looks like a deliberate zero. Existing finance reloads settings; P17 pins exact occurrences. This **changes admission precision**: original-boundary server resolution/provenance, unresolved versus proved Off, current narrowing and no worker-time policy selection. **C03–C06; P03/P04/P07/P10**.                                                               |
| 3   | **Technical debt — Yes**                                                         | **High / plausible if adjacent helpers are copied.** Finance-specific task/recipient queries and direct sending become a second native authority; new-only inserts lose recoverable delivery. This **narrows implementation** to source-owned handoff, P17 complete plan and P6 existing recovery/history, not another sender/preferences/queue model. **C02–C05/C10; P06/P08/P15/P26**.                                                                                            |
| 4   | **Edge cases — Yes**                                                             | **High / routine exposure.** Upload before On may first become actionable after On; old work before On may release afterward; correcting the same item, missing preview, later staffing change and temporary check failures differ. Q03/Q21 and owner source predicates establish those distinctions. This **changes temporal/event semantics** with exact basis, current inspection paths and explicit same-basis versus new-work rules. **C01/C03/C04/C06; P02–P05/P11/P12/P18**. |
| 5   | **Footguns — Yes**                                                               | **High / plausible.** “Turn on email” unexpectedly sweeps pending work, “team” emails everyone, or Off looks like disabling My Work. The selected default and P17 role/step boundaries do not authorize those effects. This **narrows controls** to one event-specific staff-email setting, clear future boundary, source-resolved audience and no per-submission or global mute. **C02/C04/C08; P03/P05/P19/P20**.                                                                 |
| 6   | **Tenant safety — Yes**                                                          | **Critical / lower frequency, high impact.** Cohort cache, copied plan, shared email, tenant switch or callback correlation leaks one request into another tenant/role. Source/P12 and P6 exclusive authority require exact scoping. This **requires all-path isolation**, including previews/counts/history/worker and per-recipient rendering. **C04/C07/C09; P09/P13/P16/P17/P20**.                                                                                              |
| 7   | **Database, RLS and authorization safety — Yes**                                 | **Critical / plausible if service-only is assumed safe.** Mutable tenant/basis/plan/recipient/author fields let a valid old row become a forbidden notice; privileged paths bypass ordinary policy. PostgreSQL and actual finance service grants establish the hazard, not native proof. This **requires native constraints plus real-role USING/WITH CHECK/update/definer/worker proof**, server-derived attribution and protected relationships. **C03–C05/C09; P06/P09/P16**.    |
| 8   | **Overengineering — Yes**                                                        | **Medium / plausible.** Staff opt-in expands into a new preference center, bell event, mandatory double opt-in, digest/cadence or team subscriber model. Existing P17 configuration and Q24 work suffice. This **narrows the feature** to one optional email purpose and earned choices, with no roster enumeration for a proved disabled step. **C01–C02/C04/C08/C10; P01/P07/P20/P26**.                                                                                           |
| 9   | **UX/UI and friction — Yes**                                                     | **High / plausible.** An obscure setting, stale work, misleading “notified” status or broken return path undermines both staff and recipients. Platform principles/WCAG require understandable current state. This **changes the UX acceptance bar**: easy effective configuration, source work independent, clear future semantics, useful failure recovery and composed accessible journeys. **C02/C08; P18–P20/P25**.                                                            |
| 10  | **Source of truth, ownership and invariants — Yes**                              | **High / plausible.** Email or task creation is treated as actionability, review or source completion; team membership becomes egress authority. Q03/Q21/Q24 and ADR0183/0027 separate them. This **narrows ownership**: source owns work/basis/cohort; P17 policy/content; P6 delivery; all UI is scoped projection. **C01/C03–C07; P02/P06/P11/P15**.                                                                                                                             |
| 11  | **Hidden coupling — Yes**                                                        | **High / plausible.** Optional email failure blocks receipt/review, task materialization becomes a prerequisite, or a material class forces a new bell. None follows from source/P17 rules. This **changes dependencies**: independent valid source work, durable unresolved optional handoff, no projection-first gate and exact email-only material qualification. **C03/C04/C07/C10; P04/P07/P17/P26**.                                                                          |
| 12  | **Failure modes — Yes**                                                          | **High / plausible.** Crash after source work or dedupe insertion loses mail; timeout creates uncertain external success; repair invents a second occurrence. Finance sequencing and finite provider dedupe show why convenience paths are insufficient. This **requires coherent durable handoff, complete release and exact provider recovery**, preserving source truth. **C03/C05/C06; P06/P08/P14/P15/P23**.                                                                   |
| 13  | **Lifecycle, temporal correctness, concurrency and idempotency — Yes**           | **High / normal concurrency exposure.** Off→On→Off→On, new team members or same-basis ready oscillation revive old work or multiply notices. P17 exact pins and source fences require explicit policy. This **changes the exact admission/stop contract**: original policy/cohort, one basis occurrence, prospective On, monotonic Q27 Off narrowing and new correction identity. **C01/C03–C06; P03–P05/P10–P13**.                                                                 |
| 14  | **Data integrity — Yes**                                                         | **High / plausible.** Partial recipients, missing plan history or stale candidate projections become incomplete releases, false zero or duplicate identities. P17 requires exact full sets and Q24 one work identity. This **requires complete-set validation, preserved original provenance, typed zero/unresolved states and no current-roster reconstruction**. **C03–C05/C09; P04/P07–P10/P16**.                                                                                |
| 15  | **Security and privacy — Yes**                                                   | **Critical / plausible with sensitive work.** Minimal-looking subject, source title, filename, recipient list, export or sample exposes care/location/request existence. Founder brief and P17 fact wall forbid automatic disclosure. This **narrows content/material** on every surface, safe staff doorway, no participant credential copying and exact retention/erasure. **C04/C07/C09; P13/P16–P18/P20**.                                                                      |
| 16  | **Scalability and performance — Yes**                                            | **Medium / plausible at higher volume.** A default-off plan still scans every roster, ready-state flapping generates occurrences, or per-member workers starve tenants. Existing compiler limits and source identity avoid that. This **narrows work** to meaningful source basis, valid zero without unused resolution, finite full sets/indexed checks and measured fair recovery. **C01/C04/C05/C09; P02/P07/P09/P21**.                                                          |
| 17  | **Operational burden — Yes**                                                     | **Medium / plausible.** Disabled mail is treated as an incident, operators repeatedly request review to resend, or a failed plan requires SQL repair. Existing shared source/P6 operations should own recovery. This **changes operations**: Off is ordinary policy, unknown/failure is distinct, owned same-intent repair and useful current-work route; no routine developer intervention. **C03/C06/C08/C10; P04/P14/P19/P23/P26**.                                              |
| 18  | **Observability and auditability — Yes**                                         | **High / plausible.** Current settings erase why old work did not notify; “sent” hides provider uncertainty; logs retain private bodies. P6 independent axes/body-free history and original policy provenance matter. This **requires separate original plan/cohort disposition, source result and recipient delivery evidence**, with safe attribution/correlation. **C03–C07/C09; P06/P07/P10/P15/P17**.                                                                          |
| 19  | **Dependency and integration — Yes**                                             | **High / plausible.** Resend delays, limits, sender loss or duplicated/out-of-order events mislead source state. Provider 24-hour dedupe is not permanent identity. This **narrows provider reliance** to exact immutable account/connection/attempt correlation, current safety checks and bounded reconciliation, without sender/channel fallback. **C05–C07; P13–P15/P23**.                                                                                                      |
| 20  | **Migration, rollout and upgrade — Yes**                                         | **High / plausible.** Old pending work, new defaults or restored roster/settings create historical catch-up mail. Existing runtime is not native qualified. This **changes activation** to prospective genuine source occurrences, version-compatible writers, preserved original policy/cohort and restore with outward effects stopped until reconciled. **C03/C05/C06/C10; P03/P10/P22/P23**.                                                                                    |
| 21  | **Testability, traceability and proof — Yes**                                    | **High / likely if “reuse email” is the spec.** Finance mocks cannot prove native original-boundary admission, cohort or usability. This **requires P01–P26**, exact owner/ADR/OpenSpec reconciliation and independently observed domain/user outcomes. No generated view or proposal is runtime proof. **C01–C10; P01–P26**.                                                                                                                                                       |
| 22  | **Other development hazards — No additional independent material concern found** | Checked money precision, account enrollment, review staffing/presence gates, unsupported transport, provider replacement and whole-Studio dependency. Applicable hazards are already bounded by **C01/C02/C07/C09/C10; P01/P17/P20/P22/P26**. No extra financial data model, policy engine or new glossary object is necessary; native qualification remains required.                                                                                                              |

## Ownership, invariants and lifecycle

The source owns current item/evidence/review basis, actionability occurrence,
responsibility and recipient-generation lineage. P12/identity/contact owners
prove exercise and disclosure authority. P17 alone resolves the registered
native profile and exact effective plan; source/client input cannot select it
as arbitrary authority. P6 owns complete release and independent provider facts.
My Work, inline correction warning and history remain projections. No email
state changes evidence, task closure, review acceptance or recipient access.

One exact source basis has at most one original Q27 actionability occurrence.
One such occurrence has one exactly replayable bounded complete plan result,
including proved zero. Subsequent genuine correction basis can be new while the
logical work remains pending. Optional delivery proof cannot erase valid source
work. Original policy/cohort facts and current send permission are distinct;
current permission may narrow but never manufacture original membership.

| State or boundary                              | Required meaning                                                                                                                                        |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Evidence received/checking                     | Q03 receipt and predecessor fence hold; no false ready-to-review email. Source checks can later establish actionability.                                |
| First authoritative actionable basis           | Record one exact source occurrence and the original plan-policy boundary; clocks from browser/upload/worker cannot replace it.                          |
| Verified plan Off                              | Exact top-level authority may release valid zero without unused recipient/contact resolution. Work and warnings remain current.                         |
| Plan or enabled-cohort proof unknown           | Preserve lawful source work and original-boundary unresolved handoff; release nobody, do not guess zero or future On.                                   |
| Tenant enables email                           | Only genuinely later actionability occurrences qualify. Previously received checking evidence may first become actionable afterward. No old-work sweep. |
| Original enabled cohort admitted               | Freeze the complete qualified source generation/candidate basis; task projection completion is not a prerequisite.                                      |
| Complete plan released                         | All children or proved zero are durable before eligibility. Same occurrence cannot acquire extra recipients/steps.                                      |
| Lost source/release response                   | Recover original identity/terms/disposition under current disclosure. Do not create another source event or read current defaults as history.           |
| Same basis loses and regains readiness         | Keep the same original occurrence; reprocessing/restoration is not new email. Current invalidation/stop remains effective.                              |
| Genuine corrected current basis                | New source actionability can be a new occurrence; same task status, filename or bytes does not collapse legitimate lineage.                             |
| Responsibility-only handoff/new member         | Current source/My Work may update; Q27 does not create a reassignment notice or append a recipient to old evidence mail.                                |
| Published Off before submission admission      | Suppress affected old unsubmitted work through Q27's explicit gate; later On does not undo that stop.                                                   |
| Submission admitted or uncertain               | Treat as potentially in flight; preserve exact provider evidence and qualified recovery, no recall/new-key guarantee.                                   |
| Source resolved/superseded/private access lost | Stop stale unstarted work and deny unauthorized landing; never show old instructions or fake task completion.                                           |
| One recipient suppressed or mail failed        | Other lawful source work/results remain. Preserve each exact member outcome; no substitute staff recipient/channel.                                     |
| Migration/stop/restore                         | Preserve source and original effect truth, reconcile outward effects, prevent historical catch-up and erased-material restoration.                      |

These sixteen distinctions do not prescribe a sixteen-state enum or a new
workflow runtime. Implement them through the existing qualified owners.

## User journeys and recovery

Names are illustrative. These scenarios span the supported roles and adverse
paths; they do not establish a ministry workflow as an observed fact.

| Journey                                          | Expected useful behavior and edge protection                                                                                                                                                                                                                                                                                        |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. New tenant uses the default                   | Priya sees staff email Off in the existing event-specific configuration, with clear explanation that current review work remains available. No compulsory setup dialog or warning pretending that Off is broken.                                                                                                                    |
| 2. Tenant enables email                          | Priya sees the permitted source audience, message/sender/reply choices and synthetic impact; publication says it affects new review work after this change. Existing pending work remains accessible but is not silently emailed. No live sensitive roster preview is required.                                                     |
| 3. Reviewer works mainly in Core                 | Elena finds source-backed current review work and Q03 correction warnings. She is not forced to opt into email, claim a team item or manually notify herself for each upload. Ordinary review proceeds through Q21/Q23.                                                                                                             |
| 4. Reviewer works intermittently                 | Tenant enables the qualified email aid. Elena receives only eligible notices and follows the current staff doorway. On does not guarantee delivery/reading, and current source work remains the recovery path. No assumed daily Core usage.                                                                                         |
| 5. Named person versus team                      | The source's qualified named person or finite team recipient resolution supplies exact candidates. No all-members/admin/creator broadcast or shared mailbox identity. If notice eligibility is unresolved, source work persists with capable recovery.                                                                              |
| 6. Recipient submits while email is Off          | Nora's submission/receipt is unaffected. When the source first admits review actionability under Off, that occurrence stays no-email even if a worker runs after On. The recipient does not select staff addresses or handle staff configuration.                                                                                   |
| 7. Earlier upload becomes actionable after On    | Nora uploaded while checks were pending. The source first proves the new basis reviewable after Priya enables email; it may legitimately qualify under On. Upload time alone neither grants nor denies the notice.                                                                                                                  |
| 8. Corrected evidence reaches an open reviewer   | Q03 immediately fences the predecessor and warns Elena without swapping content under her. Required checking and exact inspection remain separate. New Q27 email, if enabled/eligible, waits for actual source actionability; it does not delay the warning or receipt.                                                             |
| 9. Checks or preview oscillate                   | A service outage or preview regeneration on the same basis does not repeatedly email staff. A sufficient qualified original-inspection path may still allow review. Recovery retains the same occurrence and actual invalidation history.                                                                                           |
| 10. Tenant enables during delayed processing     | A delayed old Off/unresolved handoff uses original authoritative policy evidence, not today's On. If that evidence cannot be recovered, staff see truthful blocked notice recovery while independent current work remains. No backfill or assumed zero.                                                                             |
| 11. Tenant disables and re-enables               | Off-first stops affected unsubmitted Q27 mail; On later admits only new work. A message already admitted to submission may still arrive. UI does not promise recall or quietly resurrect old preparations.                                                                                                                          |
| 12. Responsibility changes before email          | A new reviewer gains only the source-authorized work projection; the delayed original notice is not readdressed. Continuing recipients need current entitlement and exact original membership. No extra Q27 mail merely for a handoff or rejoin.                                                                                    |
| 13. Review completes before delivery/use         | The source fence prevents unstarted stale prompts where required. An in-flight email can still arrive; its destination shows permitted current outcome/other work, not a demand to review again. Delivery does not complete the task.                                                                                               |
| 14. Missing contact, suppression or mail failure | Notice state explains the actual permitted reason and existing repair. Staff can still perform lawful review; Nora does not resubmit documents. No alternate colleague/address/channel is silently selected.                                                                                                                        |
| 15. Limited administrator or confidential work   | A plan administrator can use synthetic settings without gaining evidence/roster access. A reviewer can see permitted effective consequences without becoming a plan manager. Sealed/private request existence stays hidden even in counts/errors/previews.                                                                          |
| 16. Mobile, AT, locale and weak network          | Use readable current work, accessible labeled On/Off, persistent outcome and appropriate status announcement. Preserve draft settings/focus through validation/unknown save; support zoom/reflow/touch/RTL/CJK/long names, explicit source dates/zones where relevant and plain-text/images-blocked mail. No private offline cache. |
| 17. Operations recovers or restores              | Authorized operators inspect safe original source/plan/cohort/attempt identifiers and recover the same legal work. They do not repeat submission, overwrite reviews, force-release partial sets, use a personal sender, rebuild from current rosters or retrieve purged bodies.                                                     |

Donor, missionary and request-only participants keep their narrow submission/
correction experience; none becomes the staff notification-policy operator.
Public giving/CMS behavior and financial approval remain outside this purpose.

## Falsifiable acceptance and proof

P01–P26 are required native implementation/release outcomes, not tests claimed
to have run in this review. Test real source/roles/database boundaries and
production-shaped fixtures, not a second model that merely restates this text.

| ID      | Required observable outcome                                                                                                                                                                                                                                                                                                                                                                       |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q27-P01 | Qualified default is Off; deliberate authorized tenant On enables the exact optional staff step. Missing/legacy unproved values cannot become On. Existing applicable recipient restrictions narrow the result; no invented second opt-in or per-upload toggle.                                                                                                                                   |
| Q27-P02 | First source-actionable item/evidence basis creates one notice occurrence; upload/scan/preview/task callbacks only re-evaluate through the source. Same-basis ready/unavailable/ready, retry and rerender do not create another; a genuine current correction can. No all-request-ready gate or personal-claim prerequisite.                                                                      |
| Q27-P03 | Race On publication against first authoritative actionability. Occurrence-first under Off remains no-email despite delayed worker; On-first can admit new work. Earlier receipt still checking may first become actionable after On. No client/upload/worker timestamp or stale pre-wait read decides eligibility.                                                                                |
| Q27-P04 | Original policy or enabled-cohort proof unavailable preserves independently lawful source receipt/work/review and durable unresolved handoff. Recovery proves the original boundary or remains blocked; never guesses Off/zero, current On or current roster. Missing required persistence never reports full transition success.                                                                 |
| Q27-P05 | Original enabled recipient generation/set cannot gain a later joiner, reassigned person, restored member or new admin through retry/configuration change. Current valid My Work still updates independently. Continuity/removal/rejoin cases and no guessed fallback are proved.                                                                                                                  |
| Q27-P06 | Fault before/during source/history/admission/outbox and crash after commit/before reply preserve atomic facts and exact recoverable handoff. Actor/system attribution and source timing are trusted; provider I/O does not hold source locks.                                                                                                                                                     |
| Q27-P07 | Proven Off with valid source/top-level plan authority releases exact zero without enumerating disabled-step recipients/contacts. Unknown required proof for an enabled result is not zero; complete proved no eligible recipients is a different valid zero. All retain honest causes.                                                                                                            |
| Q27-P08 | Fault at header, each child, release and commit exposes no partial eligible set; exact replay returns the same full set or zero. Unknown/partial resolution never releases a subset; no per-member independently committed producer loop.                                                                                                                                                         |
| Q27-P09 | Missing/extra/duplicate/swapped/foreign/stale/over-limit candidates and changed original binding/plan/condition/membership conflict atomically. Same-tenant wrong source/purpose/evidence and cross-tenant/site/environment references are denied through API/import/worker/service paths.                                                                                                        |
| Q27-P10 | Off published after original On but before delayed compile/preparation/submission stops old work. Off→On cannot restore it; current On alone is insufficient. Exact ordered submission-admission-first keeps in-flight/unknown truth and immutable pins; unrelated purposes are unaffected.                                                                                                       |
| Q27-P11 | Correction, acceptance, fulfillment, cancellation, evidence disposal, privacy/authority or source usefulness changes racing preparation/submission/use stop stale unstarted notices through the correct source fence. No old replay reinstates work or silently rerenders sealed meaning.                                                                                                         |
| Q27-P12 | Q03 predecessor fencing and in-context warning remain immediate at correction admission; no email or preview readiness dependency. Current item review uses a qualified inspection path and preserves independent accepted work, source fulfillment and recipient clocks.                                                                                                                         |
| Q27-P13 | Contact revision, suppression/preference change, source-recipient removal and sender/reply/connection loss cannot substitute another address/member/channel or alter sealed bytes. Current protected landing denies stale access and does not leak private request existence.                                                                                                                     |
| Q27-P14 | Definitely unsubmitted, definitely rejected, accepted/lost response and indeterminate provider cases follow exact current P6 recovery. No fresh-key resend after uncertainty/window expiry; signed duplicate/out-of-order provider events correlate to exact account/environment/connection/attempt/member.                                                                                       |
| Q27-P15 | Source work, original policy/admission/zero, per-recipient intent, provider submission/delivery/reputation and advisory engagement remain distinct. Failed mail does not erase work or trigger another review; queued/accepted/opened does not mean read, accepted evidence or task completed.                                                                                                    |
| Q27-P16 | Real grants and RLS USING/WITH CHECK, trigger transformations, views/definer/RPC/storage/service paths prohibit retargeting scope, actor, original basis, policy, cohort or purpose. Caller-controlled IDs are selectors only; source/system attribution cannot be forged.                                                                                                                        |
| Q27-P17 | Email-only native material/utility/Recent-copy class is explicitly reviewed, finite and non-extending. Purge/decryption denial, backups, erasure/export/log/cache behavior preserve minimal body-free evidence; no inherited sibling class, invented bell, participant verifier copying or restoration of erased material.                                                                        |
| Q27-P18 | Minimal subject/preview/body/sender/reply, synthetic samples, safe counts/history and staff landing disclose only authorized facts. No raw sensitive filename/care/location/third-party details, notes, attachments or direct storage URLs; any action material uses only its actual qualified carrier.                                                                                           |
| Q27-P19 | Administrator can find the real setting, understand Off/current work and prospective On, use permitted preview/compare/save and recover unknown save without resetting valid inputs. Non-admin reviewer has useful permitted state/help without plan powers. Disabled mail produces no fake incident or mandatory setup.                                                                          |
| Q27-P20 | Actual Core composed work/configuration/landing and email/proof paths pass keyboard, AT, zoom/reflow, touch/mobile, slow network, locale/fallback, RTL/CJK/long-name and images-blocked/plain-text cases. No focus loss, color-only status, repeated data entry or inaccessible recovery. Unsupported channels remain non-instantiable.                                                           |
| Q27-P21 | At declared maximum source/cohort/step bounds, concurrent tenants and growing history meet finite measured owner budgets. Maximum+1 rejects without truncation/chunking; known Off avoids unused resolution; source/projection delay does not authorize repeated mail or tenant starvation.                                                                                                       |
| Q27-P22 | N/N-1 source/catalog/schema/worker combinations gate unsafe writers; no legacy nullable setting, task row or old pending basis creates new Q27 mail. Activation admits genuinely new source occurrences, not historical state scans. Imports/backfills are non-sending without independent exact source authority.                                                                                |
| Q27-P23 | Stop/rollback/restore preserves review/evidence/current restrictions and permanent source/plan/cohort/provider identity. Outward effects remain stopped until reconciliation; old Off/zero/stopped/accepted work does not revive, erased material is not restored and no force release is used.                                                                                                   |
| Q27-P24 | Changing only responsibility or personal notification settings updates its own allowed projection/policy but does not manufacture a first-submission/correction occurrence, duplicate task, bell item, reminder or new review requirement. No task-materialization gate on otherwise qualified source notice.                                                                                     |
| Q27-P25 | Representative permitted staff can discover review work with Off, understand and enable email when needed, predict who can receive future notices, and recover delayed/failed/old mail. Test intermittent reviewers and repeated corrections without assuming daily Core use or claiming unmeasured satisfaction. Any misleading retroactive-send or audience understanding blocks qualification. |
| Q27-P26 | Trace the exact decision/clauses through native source/P12/P9, P17 meaning/profile/default/binding/material, P6 and complete incorporated OpenSpec/design/tasks, later authorized tickets/tests/release proof. Named operators exercise actual safe repair/stop and no direct-sender bypass, new engine or whole-Studio dependency remains.                                                       |

## Residual operational controls

Launch safety and temporal correctness cannot be delegated to monitoring.
The following detects regression after qualification. Bind accountable roles
to named operators and concrete existing-owner numeric budgets before activation;
this review does not fabricate workload, human-response or retention numbers.

| Signal                                                                                            | Threshold                                                                                                                                                | Accountable owner                                       | Response                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unauthorized tenant/recipient/purpose disclosure or private content in mail/configuration/history | Any confirmed occurrence, greater than zero                                                                                                              | Native source security owner and P12/P6 incident owners | Stop affected notice path, preserve safe evidence, contain/repair authorization and privacy before re-enable; do not erase source work.                                 |
| Retroactive On, later-roster expansion, same-basis duplicate or Off-resurrected notice            | Any confirmed invariant violation, greater than zero                                                                                                     | Native source and P17/P6 owners                         | Quarantine affected occurrence/cohort, stop unsafe dispatch, reconcile original policy/cohort/stop evidence and fix admission/replay.                                   |
| Unrecoverable handoff, uncompleted source projection or committed-unreleased plan                 | Any committed-unreleased plan immediately; other delay beyond its existing qualified owner SLO (including applicable inherited Q03 projection threshold) | Source/P9 and P6 operations owners                      | Recover original effect/current projection, investigate proof loss; no guessed zero, new occurrence, all-team fallback or manual force release.                         |
| Provider ambiguity or expired useful delivery material                                            | Any attempted illegal/out-of-window replay; otherwise original utility/recovery limit reached                                                            | P6 delivery operations owner                            | Reconcile signed scoped evidence, stop unsafe attempts and present actual unavailable/unknown outcome with existing help. No body restoration or alternate sender.      |
| Misunderstood opt-in or repeated-notice noise                                                     | Any credible wrong-audience/retroactive-send complaint; reproduce reported noise within supported review sequence                                        | Native product/UX owner and tenant administrator        | Correct setting copy/flow/source occurrence or use tenant Off; reopen an owner decision only if actual evidence warrants it. No unreviewed digest or queue rewrite.     |
| Bounded workload/fairness regression                                                              | Declared source/cohort/compiler limit exceeded or approved query/latency/recovery/fairness budget breached                                               | P17 compiler/P6 operations and native source owner      | Reject over-limit full admission safely, diagnose indexed resolution/retry/load, stop affected cohort or roll forward. Missing finite release budgets block activation. |

## Ruthless synthesis and implementation order

1. **Ratified policy:** Conrad adopted the complete corrected decision and
   C01–C10 covering the exact source basis, tenant opt-in, original policy/cohort
   boundary, Off/zero/unresolved distinctions, same-basis recurrence and explicit
   Q27 Off stop. Strong B and evidence limits remain. Ratification does not
   qualify native implementation.
2. **Capture in the source spec/design at authorized publication:** reconcile
   Q03-C17/Q24's notice reservation and this precise staff purpose, while keeping
   Q26 separate. State the native authoritative source actionability/recurrence,
   original resolver-issued plan/admission context and complete source-cohort
   provenance. Explicitly adopt Q27 Off narrowing into the source/P17/P6 and
   applicable platform ADR/OpenSpec owners; retain immutable pins and general
   rules elsewhere. Specify exact email-only content/action/material profile,
   usable bounded tenant controls and actual partial/unknown behavior.
3. **Require implementation safeguards:** coherent source/history/handoff;
   trustworthy publication order and original-context recovery; exact finite
   full release/zero; native role/recipient integrity and current narrowing;
   irreversible stop continuity and immutable provider recovery; minimal safe
   surfaces. Reuse owner mechanisms without a policy DSL, extra queue or new
   event per task/file. Provider I/O remains outside source locks.
4. **Prove and roll out:** P01–P26 must cover real roles, concurrency/faults,
   source-only work independence, cohort timing, mixed versions, restore,
   representative staff and actual composed accessibility/workload. No polished
   settings screen or finance mock qualifies the feature. Prospective activation
   and a narrow stop preserve existing work and later valid decisions.
5. **Monitor only residual regression:** use the six named-owner signals above,
   with real release limits/runbooks. Off is valid policy, not an incident;
   current source work must still be discoverable and correct.

### What could go wrong with this answer?

Opt-in is easy to implement superficially while accidentally mailing the backlog
on delayed execution. Or staff never discover the setting and miss useful cues.
The permanent fix is exact original-boundary admission plus a visible useful
configuration and current work experience—not a checkbox over a direct sender.

### What hidden assumptions are we making?

That source work, recipient resolution and the existing shared surfaces can be
qualified for this native purpose, and that some tenants prefer less default
email. These are explicit product assumptions/activation proofs. We do not
assume daily Core use, all-team eligibility, instant checks, a materialized task
or a provider delivery guarantee.

### How does this affect the whole product?

One native optional staff-email purpose uses shared source/tasks/communication
owners. It preserves the participant-facing Q26 notice and all source review,
fulfillment/access rules. No public giving, CMS release, financial approval or
account-enrollment behavior changes. Broader File Manager work remains open.

### How does this affect the end-user experience?

Tenants choose email once through understandable existing settings. Reviewers
keep current work and safe correction context; intermittent reviewers can get
an additional cue when enabled. Participants submit normally and never manage
staff mail. Unknown delivery and old links have truthful current recovery.

### Does this follow modern best practices?

It follows purposeful optional notifications, visible organization settings,
source-owned work and durable idempotent delivery. Vendor defaults vary and
support strong B. A is the founder's bounded starting policy, not a universal
claim that email is undesirable. Noise and discoverability need actual proof.

### Does this fit Asym's existing repo and product direction?

Yes with the exact amendments: one source-owned work identity, P12 current
authority, P17 bounded configuration, P6 one communication spine and the existing
UI system. The new Off exception and email-only material qualification are
explicit owner work rather than accidental inheritance. Twenty glossary
definitions suffice; no new domain object or whole-Studio dependency is needed.

### Should we adjust the recommendation?

Keep A. Make tenant enablement useful and prospective, keep true current work
independent, and do not turn opting in into per-item ceremony. Required proof
may expose poor comprehension or unsuitable defaults; address that evidence
honestly rather than asserting the selected default guarantees faster review.

## Recording, snapshot and evidence limits

Local HEAD remains `3d85897ebf1515008ef5c676b1c58a15422fb9ab`; freshly checked
live develop remains `7df55820eee8a1e0076dea489f3836e8d15d7c69`. There is no
new drift from the preceding research. Relevant source/SQL/test bodies and
owner sections were rechecked; unchanged fully read incorporated live OpenSpec
bodies remain identified in the owner note. No shortened wrapper substitutes
for its contract. Prior live delta comparisons are dated bounded evidence, not
all-file local/live equivalence. No pull or checkout change occurred.

This full review, feature ADR-0027, question, decision log, context map and
session record full Q27 ratification. Three independent notes retain their
dated findings. Q01–Q26, twenty glossary definitions and unrelated product
edits remain intact. This package contains
22 category outcomes, ten exact clauses, 26 proof groups, seventeen journeys,
sixteen lifecycle distinctions and six operational controls.

No new runtime/database/provider/browser/AT/intended-user qualification or
messages occurred. Static code, accepted owner intent, external primary
documentation, ratified native intent and actual release proof remain
distinct. Formal owner/OpenSpec publication remains `/to-prd`; tickets remain
`/to-issues`. All Q27 amendments are fully ratified; Q28's answer is not inferred.

## Founder ratification — 2026-10-22

Conrad explicitly ratified Q27 A with all required amendments before requesting
the next researched Phase 29 question. The corrected decision, ten clauses,
26 proof groups, seventeen journeys, sixteen lifecycle distinctions and six
controls are adopted without substantive change. Q01–Q27 are ratified and
twenty definitions remain unchanged. Independent notes are dated evidence,
not competing status. No native qualification, implementation, formal
publication or Q28 selection follows.
