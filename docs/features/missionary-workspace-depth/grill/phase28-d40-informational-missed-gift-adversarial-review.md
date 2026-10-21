# D40 — one missed recurring gift remains informational

Reviewed **October 18, 2026 (Asia/Bangkok)** against Core
`9cada8f3d8ab59db391d3fd20df77fcadeb09813` and its research working tree.
The founder selected **Q40 A — Keep it informational** and requested simple,
usable tenant customization and a complete adversarial review.
**Disposition: Accept with required amendments.** The corrected decision,
C01–C22, P01–P34 and required design amendments were **explicitly ratified on
October 18, 2026 (Asia/Bangkok)**. The original answer review posed no Q41.
Ratification establishes accepted intent, not implementation or activation.

This is a completed research/design review under the
[founder boundary](phase28-founder-brief.md:21), not a formal PRD/OpenSpec,
application/schema change, live setting or release certification. No tickets,
GitHub changes or external communications were created. No earlier model,
probe or verification program was executed.

## Exact corrected decision to record

> **A — Keep a confirmed missed recurring gift informational.** When a scheduled
> automatic gift is confirmed not received after its recovery has ended, and
> the current source confirms that regular giving remains scheduled, Maya sees
> that occurrence and the current next scheduled gift in her permitted existing
> recurring-support view. This condition alone creates no automatic review or
> outreach task. She can deliberately add ordinary follow-up when useful and
> permitted. Other independently qualified attention work remains intact.
>
> Authorized staff can turn **New missed-gift notices** on or off for the
> organization through the existing notification-plan controls. This optional
> missionary in-product notice is available only after its exact source and
> message contract are qualified and Live. The default is On at that
> qualified activation; explicit tenant Off is preserved. Off stops new notices,
> including eligible notices not yet published. Existing published notices keep
> their ordinary history and engagement lifecycle. Turning notices back on does
> not replay missed history or revive suppressed notices.
>
> Notice settings do not erase permitted financial history, change payment
> status, grant access, create tasks, or change donor communications. Financial
> access and ordinary task permissions retain their own controls. No new
> threshold, retry calendar, channel matrix or per-missionary override is added.
> The screen updates honestly when the schedule changes or information is
> uncertain; it never promises another gift, implies debt or labels a person
> lapsed. Existing governed donor payment notices retain their own contracts.

The tenant notice default and exact Off semantics were proposed review
judgments and are now **explicitly ratified with the complete amendment**.
They preserve the chosen informational behavior while satisfying tenant control.
Disabling this optional attention feature is different from revoking financial
visibility; concealing financial outcomes would be a conflicting product change.

## Evidence, current behavior and permanent direction

**Repository facts.** P16 owns recurring intent, occurrence closure, recovery,
next schedule and safe health evaluation. P13 owns received money; P9 owns
ordinary tasks; P12 owns current authorization; P17/P6 own bounded notification
contracts, publication and delivery. P28 composes permitted facts and selects
native work purposes. A notification, task and missed occurrence are distinct
records with different completion meanings.

**Current implementation observations.** The bounded source review found legacy
`donor_pledges` projections and separate `missionary_tasks`; it did not find a
qualified D40 producer. The provider handler writes `next_charge_at`, whereas
the missionary read path selects `next_payment_date`. The displayed recurring
status lacks the complete occurrence/recovery/currentness evidence needed here.
The mounted legacy task dialog writes directly through the browser, despite a
later migration revoking that table's browser grants. The server create path can
insert then fail its separate readback and does not supply durable creation
idempotency. These are static qualification gaps, not demonstrated deployed
incidents. See the [exact source and authorization evidence](d40-evidence/source-and-authorization.md).

**Permanent direction.** Use the qualified native P16 projection and the existing
P9 task command behind `packages/api`; preserve the ordinary recurring detail
navigation and shared UI components. Do not extend legacy pledge rows into a
new financial model, reopen revoked browser grants, infer misses from missing
rows or create a parallel missed-gift store. No new automatic task producer is
needed for A. Runtime, real RLS, complete UI and production-shaped proof remain
release obligations, not achievements of this documentation.

| Governing source                                                                                                                                                                                                            | What it requires                                                                                                                                          | D40 reconciliation                                                                                                                                                                                    |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [P16 missionary journey](../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:335), [communication contract](../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:888)          | Source truth remains available; terminal miss has a grouped missionary in-product notice only when its exact key is Live; no default donor-outreach task. | A confirms that this case also creates no automatic internal review obligation. Mandatory or separately eligible donor communications remain independent.                                             |
| [P16 support health](../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:1033)                                                                                                                       | Line/occurrence grain, current coherent evidence, unknown is not healthy, miss counts do not define lapse.                                                | Historical miss and current schedule must coexist without suggesting a person stopped supporting.                                                                                                     |
| [P28 owner constraints](../../../prds/program-roadmap/owner-constraints.md:74), [D21 C03–C14](phase28-d21-explicit-gift-follow-up-adversarial-review.md:187)                                                                | Preserve required qualified recurring-attention tasks and ordinary deliberate follow-up with exact source/permission/recovery meaning.                    | A excludes only this trigger acting alone; it cannot suppress a separate action-needed transition.                                                                                                    |
| [ADR-0026](../../../adr/0026-contract-bounded-delivery-plans.md:17), [P17 optional slots](../../../prds/sitestacker-parity/phase-17-system-messages-template-management.md:1835)                                            | Tenants customize only declared optional slots; accepted plans remain pinned, ordinary edits are future-only.                                             | Explicit amendment: declare this missionary slot optional and add a current pre-publication Off fence that suppresses an unpresented member without rewriting its sealed plan. No donor slot changes. |
| [ADR-0027](../../../adr/0027-one-notification-presentation-and-engagement-model.md:17), [P17 manifest](../../../prds/sitestacker-parity/phase-17-system-message-executable-manifest.md:1214)                                | One notification model; information-only policy and current authority; recurring missed key remains Reserved without a qualified exact policy/end rule.   | Future activation must bind the existing informational policy and exact P16 source-end rule. D40 itself activates nothing.                                                                            |
| [ADR-0183](../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:24)                                                                                                                                    | Required source work needs an exact contract; task/notice engagement cannot complete business truth.                                                      | No task solely from this informational event. Deliberate ordinary work retains P9's independent task lifecycle.                                                                                       |
| [OpenSpec index](../../../../openspec/project.md:6), [CRM](../../../../openspec/specs/crm-core/spec.md), [active recurring contract](../../../../openspec/changes/add-recurring-giving/specs/donation-lifecycle/spec.md:86) | Intended versus implemented distinction; native ownership; legacy pledge model is migration evidence, not target architecture.                            | Existing code must pass qualification or be replaced at the source seam; no status/UI adapter can manufacture the missing proof.                                                                      |

The [governance review](d40-evidence/governance.md) records the exact amendment
boundary. The notice control is **not** already authorized merely because a
settings screen or generic On/Off field exists. Reconciliation into the owning
P16/P17 contract, manifest and generated OpenSpec is required at the authorized
formal-spec transition, not silently performed during this research session.

**Verified external documentation.** Official pages were opened afresh on
October 18, 2026. Their publication/update dates and limitations are recorded in
[UX evidence](d40-evidence/ux-and-primary-research.md) and
[root research](d40-evidence/root-research.md).

| Primary source                                                                                                                                                                                                                                  | Verified pattern                                                                                                    | Adopt / reject                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| [MPDX Notifications](https://help.mpdx.org/article/1199-notifications), September 26, 2022                                                                                                                                                      | Separate In App, Email and Task selections include missed-gift events.                                              | Awareness and work can differ. Do not copy its whole matrix, event definitions or person-level labels.                 |
| [Planning Center notifications](https://help.planningcenter.com/en/138360-donation-notifications.html), displayed publication October 15, 2026                                                                                                  | Profile notification choices include failed recurring donations, with administrator-controlled bookkeeper settings. | Put optional attention in familiar governed settings. The page does not prove whether every product flow has tasks.    |
| [REACH settings](https://www.reachapp.co/reach-knowledge-base/organization-settings/reach-general-settings/), undated                                                                                                                           | Donor notices and administrator tasks have separate controls.                                                       | B has a real accountability benefit. Reject imported failure-count/cancellation/payment-method rules.                  |
| [Donately recurring status](https://support.donately.com/help/recurring-donation-management), September 29, 2026                                                                                                                                | Distinguishes temporary failure, donor action, inability to collect and provider investigation.                     | Explain actual state and next action. Do not import retry counts, suspension policy or ambiguous shared Paused labels. |
| [GOV.UK notification banner](https://design-system.service.gov.uk/components/notification-banner/), living guidance                                                                                                                             | Context matters when selecting prominent notification treatment.                                                    | Put this fact beside the recurring gift, not in a compulsory warning banner. Retain Core's design system.              |
| W3C [status feedback](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), [reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) | Nonintrusive accessible feedback, readable narrow layouts and usable targets.                                       | Require real keyboard/screen-reader/mobile checks; a screenshot or axe pass alone cannot prove usability.              |
| PostgreSQL [policy semantics](https://www.postgresql.org/docs/17/sql-createpolicy.html), Supabase [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)                                                                  | Grants, effective policies, old/new rows and privileged paths matter together.                                      | Verify inherited WITH CHECK semantics; absence of the written clause alone is not a demonstrated bypass.               |

No authenticated competitor installation, ministry interview, measured donor
outcome or production telemetry was available. Evidence supports the patterns,
not a claim that all missionaries want the same default. The founder's selected
A resolves the product trade-off; the exact notice default remains a proposed
judgment. No comparison adds a vendor dependency or overrides Core governance.

## Complete user journey and UI

### Discovery and everyday use

Use the existing **Supporters → supporter → recurring gift** context and existing
recurring-support list; preserve the current app's actual navigation naming.
The list preserves the current P16 primary lifecycle and any coexisting
permitted attention reasons, and shows a calm **Not received** fact
for the named occurrence. Detail reveals its scheduled date and amount/currency
alongside the **current** next scheduled gift. It does not use a red overdue
badge, prominent debt balance, stoplight donor score or new task count.

Example content, only when these facts are currently proved:

```text
Recurring gift

Scheduled October 1 · USD 100.00
Not received

Regular giving remains scheduled.
Next scheduled gift: November 1 · USD 100.00

View gift history                 Add follow-up
```

Amounts/dates are illustrative, not defaults. The UI uses source currency
precision and the governed giving calendar; USD and two decimals are not
fallbacks. **Scheduled** describes intent, not a guarantee of collection.
Do not copy a balance, retry diagnostic, card/bank icon or private staff note
into this view. Names use approved display identity or Anonymous; no required
Western name split, address form or location inference is introduced.

A neutral sentence in detail can explain **This missed gift will not be added
to a later scheduled gift** only when the source permits that statement. It
must not imply the supporter is prohibited from deliberately giving separately.
The standard view needs no acknowledgement, dismiss-to-resolve step or forced
contact action. Existing month summary keeps Received/Processing/Upcoming/
Recovery/Not received separate; a miss never becomes negative received money.

### Optional notice and organization setup

In the existing system-message/notification plan controls, expose one setting:

**New missed-gift notices — On / Off**

Help text: **Show an in-app notice when a recurring gift is confirmed not
received and regular giving remains scheduled. Turning this off stops new
notices. Existing notices remain in history. Gift records are unchanged.**

Only staff with the exact current tenant plan-publishing authority can publish
this change. Use the existing draft/review/publish interaction and impact
explanation, not a cosmetic local switch or new approval workflow. No per-Site,
project or missionary exceptions, donor audience picker, extra task switch,
delay/threshold slider or arbitrary wording editor is added. Existing permitted
views, locale, branding and ordinary task permissions supply the other useful
customization; branding cannot alter factual meaning.

The switch applies only to D40's continuing-schedule informational case, not
every use of the broader terminal-miss message key. Current source eligibility
is rechecked before publication. Independent action-required and donor purposes
remain outside this switch. A coexisting source statement such as **At risk —
recurring gifts continue** stays visible; the example's schedule sentence must
not replace it.

Default On applies only when the exact optional slot and source become qualified
and Live. Reserved/unavailable is **Not available yet**, not Off or enabled.
Saved Off remains Off through deployment or later Live activation. If access or
readiness changes during save, retain the attempted choice for review, report
that it was not published and refresh the current state; never silently enable.

Off gates future occurrences and eligible unpresented optional notices.
Already published items retain their normal read/archive/recent lifecycle and
current source corrections. No synthetic read, deletion or completion follows.
Re-enabling affects future transitions only; suppressed events stay suppressed.
Admission uses the source transition's durable accepted order and then-applicable
qualified activation/tenant policy. Delayed processing cannot admit an Off-era or
Reserved-era transition. An intervening Off before first publication permanently
fences that candidate even if On returns before a worker records suppression.
Existing policy history/fences prove this; no new user-facing timer is added.
No new blanket policy for donor messages, payment collection or financial
visibility follows. Financial visibility can be revoked only through its own
existing access controls; ordinary task creation through its own capability.

The optional notice uses the existing information-only presentation: **All**,
not **Needs attention** merely because of this miss. Existing
`presentation.information_30d_then_recent_90d@1` governs unread/recent duration;
these 30/90 values are inherited presentation limits, not new donor follow-up
thresholds or financial retention rules. No per-failure repeated notice,
additional email, push channel, SMS or digest is introduced by D40.

### Deliberate follow-up

**Add follow-up** opens the ordinary task form with an authorized context link
and a neutral editable suggestion such as **Review recurring support**. Maya can
change it; do not preselect contacting the donor, invent a due date, require a
note or automatically copy supporter names, amounts or protected source details into
the suggested title. Maya's permitted authored text follows ordinary task
content/visibility rules; no new content-policing rule is introduced. Existing ordinary task fields remain
available. One deliberate Save creates one intended task and returns a stable
**Follow-up added — View task** result. Cancel creates nothing.

If known compatible current work is already available to Maya, offer **View
follow-up** without revealing hidden tasks/counts or preventing genuinely
different work. A double tap, lost response or retry of the same submission
resolves the original task; intentional distinct work remains possible. Do not
use a global one-task-ever-per-occurrence constraint or title matching.

The task remains ordinary human work. Completing it does not record a contact,
confirm receipt, fix a payment, mark a notice read or consume a separate native
attention purpose. If the financial context later changes, show the latest
permitted context; do not delete, reopen or complete the person's task on their
behalf. Existing P9 coordination and qualified native-work reconciliation remain
available when independently applicable.

### Changed, unavailable and restricted states

| Situation                                                         | What Maya sees and can do                                                                                                                                    |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Recovery is still running or payment is processing                | The correct source state; no terminal-miss claim or D40 notice.                                                                                              |
| Next date/amount changes                                          | Historical missed occurrence remains; next scheduled gift reflects current accepted source terms. No copied stale reassurance.                               |
| Future giving pauses, ends or requires action                     | Current primary lifecycle replaces the continuing-schedule sentence. Any independently qualified work remains available.                                     |
| Source is stale/conflicting/unavailable                           | Status updating or a clear temporary error. Preserve independently valid permitted history; do not substitute zero, healthy, cancelled or a guessed date.    |
| A late authoritative correction proves receipt or another outcome | Source correction changes the occurrence view and corrects/ends misleading unread treatment. Prior human work and durable body-free history remain truthful. |
| New notice setting is Off                                         | No new notice; the permitted source view still works. Previously published history remains under normal policy.                                              |
| Permission is removed                                             | Protected facts, counts, links and actions are no longer returned. Use a non-disclosing unavailable result; no historical access from having seen a notice.  |
| Manual task Save response is lost                                 | Show outcome being checked; recover the original result under current rights. Do not tell Maya to create another task.                                       |
| No permission to add a task                                       | Show the permitted information without an active Add action. Explain only if it does not disclose hidden policy or identity.                                 |
| A historical import contains a miss                               | Permitted history appears with honest provenance; no new live notice, automatic task or replay of prior attention.                                           |

Phone layouts stack the date/amount/status and next-gift lines; full meaning
survives at 320 CSS pixels and equivalent 400% zoom. Use shared base-maia/Base UI
components and semantic CSS-variable tokens, existing touch targets, text plus
status styling, visible focus and normal keyboard navigation. Announce saves,
failures and meaningful updates without moving focus or reading every refreshed
row. Preserve entered task text on recoverable failures and restore focus after
closing its form. Avoid essential hover-only help and loading flashes that imply
zero/healthy. Use the source schedule's giving zone, separate localized display
from source dates and do not recalculate the next gift from device time.

## Exact required amendments

These clauses are explicitly ratified requirements, not an assertion of implementation.

- **C01 — Narrow informational rule.** A source-confirmed terminal missed automatic
  occurrence whose current regular schedule continues SHALL create no automatic
  review/outreach task from that condition alone. Other qualified source action
  requirements SHALL remain independent. No missed-count threshold or person-level
  lapse classification SHALL be derived by P28.
- **C02 — Qualified source and ownership.** P16 SHALL provide exact tenant, Legal
  Entity, group/line/occurrence identity, closure meaning, effective source revision,
  current schedule/health and freshness evidence; P13 owns received money. Unknown,
  processing, recovery, skip/pause and source failure SHALL NOT become a confirmed
  miss. P28 SHALL consume permitted projections without a parallel financial store.
- **C03 — Historical versus current meaning.** The missed occurrence's scheduled
  facts and current next-gift facts SHALL remain distinct. Schedule changes SHALL
  replace current reassurance; corrections SHALL preserve original evidence and
  apply the current effective truth. Currentness is decided by the source contract,
  not an arbitrary P28 cache age, device clock or missing row.
- **C04 — One bounded tenant notice control.** The P17 owner contract SHALL declare
  only the missionary informational in-product slot for this purpose optional,
  organization-wide On/Off, scoped to D40's continuing-schedule case only.
  Current source applicability SHALL be rechecked before publication; other
  terminal-miss, action-required and donor purposes retain their owner rules.
  Default On applies only at qualified Live activation;
  explicit Off survives upgrades. This adds no per-user exception, timing/channel
  matrix, automatic-task mode or donor-message control. Current exact publishing
  authority is required, with existing preview/publication/audit and recovery.
- **C05 — Precise disable and re-enable semantics.** Current Off SHALL fence new or
  not-yet-published optional notices, retaining sealed plan evidence and a terminal
  suppression outcome. Already available items retain normal engagement/history.
  Re-enable and Reserved-to-Live SHALL admit future eligible transitions only;
  no old suppressed member or historical candidate is replayed. Source-accepted
  event order and the then-applicable activation/tenant policy determine original
  eligibility. An intervening Off before first publication irreversibly fences
  that candidate, even when a delayed worker has not materialized suppression.
  On after Off cannot make a previously ineligible event new. Publication and
  Off SHALL have one authoritative order; no check-then-publish race after Off.
- **C06 — Catalog, projection and engagement.** Reserved/unknown/unqualified keys
  SHALL create no communication item, header, intent or notification workaround.
  Live activation SHALL register the existing informational presentation policy
  with an exact P16 applicability/end rule in the same manifest generation.
  Correction/supersession ends misleading unread without fabricating a read.
  Read/archive/grouping SHALL NOT alter source truth, task completion or access,
  extend presentation clocks or generate an extra notice. Donor contracts remain
  independently governed; D40 adds no send channel or notification store.
- **C07 — Current authorization on every surface.** List/detail/count/search/cache/
  task link/notice/deep link/export SHALL enforce current tenant, recipient, role,
  ministry/source and field visibility. Task or notification possession grants no
  financial/contact authority. Anonymous identity, restricted sibling lines and
  cross-tenant existence SHALL remain protected; no coach access is introduced.
- **C08 — Trusted mutation and database boundaries.** Tenant, actor, author, owner,
  audit attribution, policy revision and linked source identity SHALL be derived
  or resolved from trusted current server context. Validate references and current
  action scope; generic updates SHALL NOT move tenant/owner/source provenance or
  turn manual work into generated coverage. Review actual grants, old-row USING,
  proposed-row WITH CHECK (including inherited predicates), permissive/restrictive
  combinations, view/RPC/function privileges and every service-role path together.
- **C09 — Data-model invariants.** Relationships and unique effect keys SHALL be
  tenant-aware; exact source references retain their owner grain and Legal Entity
  constraints. Missing next gift is nullable unknown/none with a typed reason,
  never epoch/zero. Money uses source exact precision/currency, not float-derived
  eligibility or default USD. Delete/merge/correction behavior SHALL not cascade
  away accepted task or financial/audit history or retain unauthorized snapshots.
  Indexes SHALL support actual tenant/source/current-list access. No physical
  schema or append-only universal data policy is invented here.
- **C10 — Deliberate ordinary task.** The normal qualified P9 task command SHALL
  accept one deliberate intended action with optional user content/due date and
  a currently authorized source reference. No mandatory note, default debt/contact
  instruction or financial certification. Current permission decides creation;
  ordinary task authority, not notification state, owns its subsequent lifecycle.
- **C11 — Retry, duplication and distinct work.** Same-intent manual retries SHALL
  resolve one durable accepted result and its audit under current disclosure rights.
  Retries or tabs submitting the same durable creation-intent identity SHALL
  not duplicate that intent; identical text/source alone does not prove identity. Explicitly
  distinct work remains possible; compatible existing work may be shown only if
  currently authorized. No title/NLP matching, donor-wide suppression or universal
  one-task-per-occurrence rule. Use existing owner coordination rather than a new
  task-purpose registry.
- **C12 — Independent outcomes.** Manual Save/Done SHALL NOT send, log a conversation,
  record money, resolve a source incident, suppress independently valid native
  tasks, mark a notice read or establish consent. Source correction SHALL NOT
  erase/reopen/complete manual work; show current permitted linked context and let
  its authorized owner decide whether the task still helps.
- **C13 — Failure and recovery.** Financial writes SHALL NOT wait for a notice or
  optional task. Durable source events and exact communication effect identities
  SHALL make secondary work recoverable without replaying suppressed history.
  Notice failures go to the existing repair owner; manual ambiguous Save is an
  unknown outcome until resolved, not failure proof or permission for a new write.
  Failure after authoritative acceptance SHALL preserve a recoverable receipt.
- **C14 — Race and ordering rules.** Source corrections/schedule amendments,
  recipient revocation, policy Off, publication and manual creation SHALL compare
  the applicable current revisions at the owning boundary. Older jobs cannot
  overwrite newer truth or publish from stale authorization. Off before publication
  suppresses; publication before Off keeps ordinary history; re-enable is not a new
  event. Source correction and authority loss dominate stale client context.
- **C15 — Privacy and retention.** Reuse source/reference-based protected loading,
  purpose-minimized list facts and body-free operational/audit evidence. Do not
  copy card/bank data, provider diagnostics, private notes, sensitive ministry
  locations or supporter contact details into generated task suggestions, logs or
  notices. Ordinary permitted user-authored task content retains its existing
  content/visibility rules; no new text-policing mechanism is introduced. No new
  attachment/export/offline store is required. Existing retention/deletion/restore
  owners govern their facts; 30/90-day presentation does not define money retention.
  Restores/rebuilds SHALL reapply current access, suppression and consumed effects.
- **C16 — Calm accessible UI.** Use existing recurring context and shared base-maia
  components; make historical miss, current schedule and uncertainty legible with
  text, retaining current source-qualified primary lifecycle and coexisting
  attention statements. A continuing schedule SHALL NOT suppress those statements.
  No mandatory acknowledgement, overdue task badge or new inbox. Ensure
  keyboard/focus/error/recovery behavior, nonintrusive status announcements,
  localization, source-zone date meaning, currency precision, 320-CSS-pixel reflow,
  supported touch targets and low-bandwidth loading states. No new address/name
  collection or donor checkout step is added.
- **C17 — Configuration is not truth.** Notice Off, saved views, filter changes,
  read/archive and lack of a task SHALL NOT imply that money was received or no
  action could be useful. Users with financial access retain accurate source
  history; access revocation uses its existing independent owner. No tenant text,
  workflow, AI, coaching, calendar or integration may reinterpret this condition
  as automatic donor contact without a separately governed source purpose.
- **C18 — Bounded execution.** Pages and counts SHALL be authorized before exposure,
  with stable pagination and source completeness evidence; no provider fetch per
  visible row or capped global join represented as complete. Workers use existing
  tenant-bounded execution/retry/fairness facilities. A cohort failure SHALL not
  multiply a common incident or expose hidden member lines. Numeric production
  load/latency/freshness budgets must be set and passed at the source qualification
  gate; this review makes no throughput or instant-refresh claim.
- **C19 — Audit and observability.** Keep distinct source transition/correction,
  tenant plan publication/suppression, personal engagement and manual task receipts,
  with trusted actor/revision/causal IDs and no unnecessary bodies. Diagnostics must
  distinguish Reserved, tenant Off, unavailable source, denied audience, duplicate,
  published, suppressed, projection failure and manual Save unknown without leaking
  those distinctions to unauthorized users. Do not audit every ordinary view as a
  new business event; existing required access audit remains applicable.
- **C20 — Migration and rollback.** Census legacy pledge/task/notification/settings
  records and actual grants before adoption. Do not infer terminal misses from
  old failed flags or synthesize historic notices/tasks. Preserve manual history
  and exact Off choices; uncertain legacy state stays unresolved. Deploy compatible
  schema/owner contracts before consumers and activate only the qualified lane.
  Rollback must keep current disclosure, suppression and accepted effects; disabling
  new optional publication must not undo money or replay work. No downgrade to a
  legacy producer that lacks these guarantees.
- **C21 — Proof and traceability.** Link the selected answer and proposed amendments
  to C/P criteria, glossary and owner reconciliation; propagate to formal source,
  generated OpenSpec, tasks/tickets, implementation and release evidence only at the
  authorized transitions. Prove positive/negative/auth/concurrency/correction/import/
  retention/accessibility/production-shaped behavior at real owner seams. Static
  research and document checks SHALL NOT be reported as runtime qualification.
- **C22 — Keep scope economical.** Reuse the P16 source, P17/P6 optional slot and P9
  ordinary task. Do not add a missed-gift service, donor score, retry engine, deadline,
  free-form rule builder, message channel, compulsory coaching/report or new vendor.
  Existing independent capabilities remain available; only affected unqualified
  paths are blocked. No new founder question is needed to select routine engineering
  safeguards already determined by these owners.

## Concern register

Severity is impact if the defect occurs; likelihood is a qualitative judgment
about the unamended design, not a measured production rate. Each concern changes
or narrows the answer through the referenced exact clauses; none overturns A.

| ID  | What could go wrong and why it matters                                                                                                      | Severity / likelihood                             | Evidence or reasoning                                                                           | Effect and permanent prevention                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| F01 | Informational becomes a blanket ban on all attention, hiding real inability to collect.                                                     | High / medium                                     | P28 requires named attention; P16 distinguishes continuing schedule from action needed.         | Narrow A to this exact condition; C01–C03, P01–P05.                                                                   |
| F02 | Legacy active flags or stale next date falsely reassure Maya or misclassify processing as missed.                                           | High / high if legacy model reused                | Source next_charge_at/next_payment_date split and no qualified occurrence envelope.             | Change implementation path to qualified source; C02–C03/C18, P02/P04/P06–P08.                                         |
| F03 | Generic tenant disable hides financial truth, or creates an unauthorized optional message slot.                                             | High / medium                                     | ADR-0026 requires declared options; P17 missed key is Reserved.                                 | Narrow customization, explicitly amend owning slot; C04–C06/C17, P09–P13.                                             |
| F04 | Off/On or delayed jobs publish old notices, erase engagement or repeatedly revive unread.                                                   | Medium / medium                                   | P17 immutable pins, ADR-0027 non-revival; delivery and config can race.                         | Current Off fence plus terminal suppression, normal published-history lifecycle; C05/C06/C14, P10–P13/P23.            |
| F05 | Financial/contact data crosses tenant, ministry, role, coaching or anonymous boundaries via links/counts/cache.                             | Critical / medium without complete checks         | P12 source visibility; legacy donor/task grain and privileged projection paths.                 | Current scoped projection on every surface; C07–C09/C15, P14–P17/P26.                                                 |
| F06 | Generic update changes tenant/owner/source provenance or browser grant restoration bypasses command checks.                                 | Critical / medium                                 | Current task browser-write/revoked-grant mismatch; privileged APIs need independent validation. | Exact server commands, tenant-aware references, effective RLS/grants and immutable attribution; C08–C09, P14–P17/P28. |
| F07 | Lost Save response creates duplicate tasks, or global dedupe blocks genuine distinct work.                                                  | Medium / high under retries without identity      | Current create inserts before separate readback; offline/multi-tab retries are ordinary.        | Durable same-intent result; existing compatible work only when authorized; C10–C11/C13, P18–P20/P23.                  |
| F08 | Task Done is mistaken for gift received, contact made or native work fulfilled; correction destroys human work.                             | High / medium                                     | Distinct P9/P13/P16 facts; D21 coordination rules.                                              | Independent outcomes and protected context updates; C12, P21–P22.                                                     |
| F09 | Confusing failure language, extra banners, mandatory fields or inaccessible controls add friction and blame.                                | Medium / high if generic failed-payment UI copied | Primary comparisons and current UI limitations; no ministry study proves one workflow.          | Existing context, neutral copy, optional normal task form and accessible states; C10/C16/C17, P18/P29–P31.            |
| F10 | Same miss multiplies by retry/cohort line; stale projections, page caps or synchronous provider calls misstate totals and degrade use.      | High / medium                                     | P16 cohort/occurrence ownership; observed capped legacy joins.                                  | Exact source grain, cursor/revision checks and bounded authorized pagination; C02/C09/C14/C18, P08/P24/P32.           |
| F11 | Notice failure blocks finance, silently loses evidence or invokes an ungoverned sender; required donor notices are suppressed accidentally. | High / medium                                     | P6/P17 guarded compiler and independent channels; wording 'nothing sends' is too broad.         | Preserve owner event/secondary recovery and donor contract boundaries; C06/C13/C19, P12/P25/P27.                      |
| F12 | Imports, upgrades or rollback revive history, reset Off, lose accepted tasks or treat old failure as confirmed miss.                        | High / medium                                     | Legacy architecture is migration evidence; runtime population unknown.                          | Census and expand/qualify/activate, no synthetic historical effects, safe disable/roll-forward; C20, P28/P33.         |
| F13 | Retention/cache/export/logs keep sensitive copies after access loss or restore old notices.                                                 | High / medium                                     | Missionary source is privacy-sensitive; attention, financial retention and user work differ.    | Purpose-minimized references, current reauthorization, owner retention/restore; C07/C15, P16/P26/P33.                 |
| F14 | Staff cannot distinguish deliberate suppression from failure, or must repair data manually; claimed performance lacks proof.                | Medium / medium                                   | Multiple valid no-notice outcomes; runtime/load evidence absent.                                | Separate outcomes, bounded existing repair owner, explicit gate/monitors; C13/C18–C21, P25/P27/P32/P34.               |
| F15 | A second rules/notification/task system or excessive settings creates hidden coupling and expensive maintenance.                            | Medium / medium                                   | Strong existing owner contracts already cover each fact; competitor matrix conflicts with A.    | Reuse three existing owners and one optional slot; C04/C17/C22, P34.                                                  |

## Category-by-category adversarial review

Every category is evaluated independently. Concern IDs refer to the complete
severity, likelihood, evidence, effect and exact prevention language above.

| Category                                                      | Material concern?                    | Assessment and exact required response                                                                                                                                                                                                                     |
| ------------------------------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Problem validity, necessity, and alternatives                 | Yes — F01/F09/F15                    | A avoids mandatory work for a continuing schedule. B offers accountability but adds an obligation; explicit manual tasks are the simpler alternative. Narrow the trigger and keep discoverability; C01/C10/C22.                                            |
| Brittleness                                                   | Yes — F02/F04                        | Provider flags, stale schedule and immutable-plan assumptions break under corrections/settings races. Source envelope and current fences; C02–C06/C14.                                                                                                     |
| Technical debt                                                | Yes — F02/F06/F15                    | Extending legacy pledge/task/settings paths or duplicating owners locks in false truth. Native source/task reuse; C02/C08/C20/C22.                                                                                                                         |
| Edge cases                                                    | Yes — F01/F02/F04/F07/F10            | Processing, late success, pause, changed amount/date, Anonymous, multiple lines, retry, hidden work and history import require distinct outcomes. C01–C03/C05/C07/C11/C14 and P01–P33.                                                                     |
| Footguns                                                      | Yes — F03/F08/F11                    | A broad Off switch, debt-oriented task title or generic Done can mislead or suppress unrelated notices. C04/C10/C12/C17.                                                                                                                                   |
| Tenant safety                                                 | Yes — F05/F06                        | Tenant IDs alone do not establish ministry/role/source visibility; config/cache/jobs can leak. C07–C09/C14/C15.                                                                                                                                            |
| Database, RLS, and authorization safety                       | Yes — F05/F06/F07                    | Verify composite scope, foreign references, nullability, constraints, delete behavior, exact money types, indexes, immutable attribution, old/new predicates, grants/views/RPCs/service role. Current paths do not qualify all of them. C08–C11/C20.       |
| Overengineering                                               | Yes — F15                            | New missed-gift store, matrix, universal dedupe or mandatory review engine is unnecessary. One optional slot and ordinary manual tasks; C04/C11/C22.                                                                                                       |
| UX/UI and user friction                                       | Yes — F02/F09                        | Ambiguous status and noisy alert/task patterns hide the useful fact. Whole journey above; C03/C10/C16/C17. No donor checkout change or new name/address capture.                                                                                           |
| Source of truth, ownership, and domain invariants             | Yes — F01/F02/F08/F10                | Money, schedule, notice engagement and human work cannot own each other. C01–C03/C06/C09/C12.                                                                                                                                                              |
| Hidden coupling                                               | Yes — F03/F08/F11/F15                | Config/contact/message/task side effects can be mistakenly coupled to one event. Fixed owner seams and independent outcomes; C04–C06/C12/C17/C22.                                                                                                          |
| Failure modes                                                 | Yes — F02/F07/F11/F14                | Unknown source, accepted Save with lost response and failed secondary publication need visible, recoverable outcomes. C03/C11/C13/C19.                                                                                                                     |
| Lifecycle, temporal correctness, concurrency, and idempotency | Yes — F04/F07/F10/F12                | Off/publication, source correction/job ordering and Save/retry must not duplicate or revive. C03/C05/C11/C14/C20.                                                                                                                                          |
| Data integrity risks                                          | Yes — F02/F06/F07/F10/F12            | Wrong date fields, duplicate tasks, old events and incomplete joins corrupt meaning. C02/C03/C08/C09/C11/C18/C20.                                                                                                                                          |
| Security and privacy risks                                    | Yes — F05/F06/F13                    | Source details can escape via task titles, caches, anonymous labels, exports or old links. C07–C09/C15; no new document or storage feature.                                                                                                                |
| Scalability and performance risks                             | Yes — F10/F14                        | Capped joins, provider-per-row calls and unbounded fan-out are unproven at real tenant sizes. C18/P32 require measured source-owned budgets before release, not a claimed universal capacity.                                                              |
| Operational burden                                            | Yes — F11/F14/F15                    | Silent suppressions and direct database task repair cause recurring toil. Owner diagnostics/recovery and single setting; C13/C19/C22.                                                                                                                      |
| Observability and auditability gaps                           | Yes — F04/F07/F14                    | Technical logs cannot prove source state, settings publication or manual task acceptance. Distinct durable evidence; C19/P27.                                                                                                                              |
| Dependency and integration risks                              | Yes — F02/F10/F11                    | Existing provider evidence can be delayed/contradictory; integration fields are not schedule truth. C02/C13/C18. No new vendor dependency is justified.                                                                                                    |
| Migration, rollout, and upgrade risks                         | Yes — F06/F12/F13                    | Existing rows/grants/pins and mixed-version clients can reintroduce old behavior. C20/P28/P33; no unsafe destructive reset or legacy rollback.                                                                                                             |
| Testability, traceability, and proof                          | Yes — F14                            | 'Keep informational' alone is not falsifiable across APIs, notice plans and manual tasks. C21 with P01–P34 and explicit owner gates.                                                                                                                       |
| Other development hazards                                     | No additional material concern found | Checked AI/workflow bypass, compulsory coaching, new channels/vendors, legal claims, contributor permissions and unrelated scope. Existing concerns already cover reached risks through C07/C17/C22. No new subsystem or speculative control is warranted. |

## Falsifiable acceptance criteria and edge-case pressure test

These are design counterexamples and required future test outcomes, **not
executed application tests**. They deliberately challenge the decision's
assumptions instead of mirroring a proposed implementation.

| ID  | Counterexample / observable required outcome                                                                                                                                                                                               |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P01 | Confirmed terminal miss + proved future schedule: show permitted miss/next gift; zero automatic review/outreach tasks caused solely by it.                                                                                                 |
| P02 | First failure, recovery retry, unsettled ACH or absent row: no terminal-miss claim or D40 notice.                                                                                                                                          |
| P03 | Future collection actually requires action: preserve the independent current source state and qualified work despite D40 A.                                                                                                                |
| P04 | Later schedule amount/date/zone change: historical miss retains its own terms; current next gift shows accepted new terms and retains coexisting current risk/attention statements, never cached old reassurance.                          |
| P05 | Pause, skip, cancellation or planned end: show its correct current meaning; no donor-lapsed label or inferred debt.                                                                                                                        |
| P06 | Source revision/cursor conflict or timeout: Status updating/error; no guessed next date, zero received total or healthy default.                                                                                                           |
| P07 | Late authoritative success/correction/refund/return: use the owning outcome, correct misleading presentation and preserve human history; refund/return is not relabelled as the original miss.                                             |
| P08 | One cohort incident with several permitted/hidden lines and repeated provider attempts: exact authorized scope, no multiplied incident or hidden member counts.                                                                            |
| P09 | Authorized staff publish notice Off/On through existing plan controls; only the D40 continuing-schedule notice is affected; independently qualified action-required/donor purposes and money remain unchanged. Unauthorized publish fails. |
| P10 | Off accepted before optional publication: no new item; suppression is durable. Already published items retain original engagement/expiry and current access.                                                                               |
| P11 | On after Off or restored access: no replay/revival, including delayed Off-era/Reserved-era transitions or an On→Off→On candidate not published before Off. New eligible future transitions remain possible.                                |
| P12 | Reserved/unknown/unqualified key: zero headers/intents/items/provider calls. Source view still works; later Live cannot catch up old candidates.                                                                                           |
| P13 | Read/archive/group/unarchive/retry do not change payment/task state or extend original unread/recent clocks; source correction has its own end evidence.                                                                                   |
| P14 | Tenant A IDs supplied while acting in Tenant B: reject without existence/amount leak, including counts, lookup, deep link and task context.                                                                                                |
| P15 | Allowed row update attempts to change tenant/actor/owner/source or label manual work native: rejected by owner boundary and effective database controls.                                                                                   |
| P16 | Access revoked between list, detail, Save or result recovery: no protected data/command response escapes current rights, including cache/export/old link.                                                                                  |
| P17 | Allowed source visibility with denied task/contact/coach capability: only respective permitted actions/facts appear; visibility does not imply authority.                                                                                  |
| P18 | Manual Add opens normal form; editable neutral title, no imposed date/note/contact; Cancel has no write and Save returns a stable usable task.                                                                                             |
| P19 | Double tap, two tabs submitting the same durable creation-intent ID, timeout after commit and readback failure: one accepted task/result; matching text alone is not a dedupe key. Retry resolves original under current rights.           |
| P20 | Explicitly distinct follow-up for the same occurrence succeeds when authorized; known compatible work can be opened without revealing hidden tasks.                                                                                        |
| P21 | Task Done produces no money, contact, consent, send, notice-read or independent native coverage effect.                                                                                                                                    |
| P22 | Source correction after manual task creation changes eligible linked context but neither deletes nor auto-completes/reopens that task.                                                                                                     |
| P23 | Off versus publish, correction versus old projector, revocation versus Save and concurrent retries are exercised under actual command transactions; one valid ordering, no stale write.                                                    |
| P24 | Zero-/three-decimal supported currencies, large exact values and two currency lanes display/compare through source rules; no float-derived status, USD or merged totals.                                                                   |
| P25 | Financial write succeeds while notification projection is unavailable; durable secondary recovery works without duplicate publication or historical replay.                                                                                |
| P26 | Anonymous/restricted supporter, sensitive ministry, logs/cache/export/backup restore: no disallowed identity/detail or resurrected attention; source retention stays distinct.                                                             |
| P27 | Operator can distinguish Reserved, Off, denied, stale, duplicate, failed and published using safe evidence; technical log alone is not a receipt.                                                                                          |
| P28 | Real role/grant/SELECT/INSERT/UPDATE/DELETE/view/RPC/service-role matrix and tenant-aware relationships are tested on exact deployed schema; no browser-grant widening to rescue legacy task UI.                                           |
| P29 | Keyboard-only and screen-reader journeys can read status, open/cancel/save task, handle errors and recover focus; no color/hover/toast-only meaning.                                                                                       |
| P30 | At 320 CSS pixels and 400% equivalent zoom, long international names/localized labels/currency/date content reflows; shared touch targets remain usable.                                                                                   |
| P31 | Slow/interrupted network preserves edits and identifies unsaved/unknown outcomes; no offline queue of sensitive writes or false success/healthy flash.                                                                                     |
| P32 | Production-shaped tenant distribution/large cohort/pagination/concurrency runs meet numeric owner-published load/freshness/latency budgets; completeness and fair recovery are proved. No budget/evidence means no activation claim.       |
| P33 | Legacy import, mixed-version deploy, explicit Off migration, kill switch, retained-data restore and roll-forward preserve history, authority and consumed/suppressed identities; no catch-up notice/task.                                  |
| P34 | Trace answer → C clauses → owner contract/manifest → formal projections → implementation/tests/release evidence; no new vendor/store/matrix and no fabricated ticket/publication status.                                                   |

## Ruthless synthesis and qualification order

1. **Resolved in this answer review before recording the corrected answer:**
   keep A narrowly informational; separate current schedule from historical miss;
   preserve other attention; limit tenant customization to one optional missionary
   notice slot; choose prospective On and exact Off semantics; preserve manual
   work and donor communications. These amendments are now explicitly ratified. Their integration into formal
   owner documents remains within the authorized specification transition.
2. **Capture at formal specification/design transition:** reconcile C04–C06 with
   P16/P17/ADR-0026 and the executable manifest, register exact policy/end rule,
   map P9 manual task recovery and P12 disclosure, publish traceability. Do not
   alter official source/projections piecemeal during this research boundary.
3. **Require implementation safeguards before activation:** G1–G5 below. Existing
   raw/legacy UI cannot be used as a substitute. The informational source view,
   optional notice and manual command can qualify independently; failure of one
   does not block unrelated workspace features or money processing.
4. **Operate with narrow monitoring after qualification:** named signals below.
   Monitoring is never a substitute for authorization, durable idempotency,
   accurate source meaning or usable recovery.

| Gate                         | Accountable owner                                                                   | Required evidence before activating the affected path                                                                                                                                                                                                                             |
| ---------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G1 Source truth              | P16 recurring owner with P13 ledger owner                                           | Qualified occurrence/recovery/schedule/currentness contract and correction/reconciliation tests; replace legacy assumptions; exact currency/time semantics and finite load budgets.                                                                                               |
| G2 Notice contract           | P17 catalog owner with P6 communication owner                                       | Exact optional missionary slot, default and Off fence; immutable plan/suppression/publication race proof; informational policy/end rule; Reserved negative tests and no catch-up.                                                                                                 |
| G3 Manual work and authority | P9 task owner with P12 authorization/database owners                                | Durable command/result, current reference permissions, real grants/RLS/privileged paths and same-intent concurrency; independent manual outcomes.                                                                                                                                 |
| G4 Migration and operation   | Owning source engineers with release/operations owner                               | Real retained-data/grant census, mixed-version compatibility, preserved Off/history/receipts, safe kill switch/restore/roll-forward and repair runbook.                                                                                                                           |
| G5 Complete user journey     | Missionary Workspace product/design owner with accessibility and tenant pilot leads | Actual composed screen and controls; P29–P31 manual checks, source uncertainty and lost-response recovery; representative missionary/staff task trials with no unresolved critical misunderstanding. Record participants/tasks/outcomes honestly; no fabricated current feedback. |

The following are ratified operating thresholds, not measurements of current
service quality. Source-specific numeric performance budgets are a G1/G4 gate;
none is silently left as a performance claim to monitor later.

| Signal                                   | Threshold                                                                                                                       | Owner                                                  | Required response                                                                                                                              |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| D40 automatic task admission             | Any task admitted solely because of this informational condition                                                                | P28/P9 engineering owner                               | Disable defective admission, preserve evidence/legitimate work, repair through task owner and require regression proof before re-enable.       |
| Unauthorized/incorrect source projection | Any confirmed cross-scope disclosure or false confirmed-miss/current-schedule statement                                         | P12 or P16 incident owner, respectively                | Contain the affected read lane, correct source/projection and revoke stale caches; assess impact and qualify correction before restoring it.   |
| Duplicate or revived effect              | Any duplicate same-intent task, suppressed-event publication or revived historical notice                                       | P9 or P6/P17 owner, respectively                       | Stop affected optional publication/command lane, reconcile stable receipts and suppression evidence; never delete finance to repair attention. |
| Unrecoverable secondary failure          | Any exhausted existing retry policy or missing accepted-result receipt                                                          | P6/P17 operations for notices; P9 operations for tasks | Open the existing repair incident, recover through the owner command; expose honest user state and do not request a blind duplicate Save.      |
| User comprehension/accessibility blocker | Any confirmed inability to distinguish not received from debt/next-gift guarantee, or blocked keyboard/screen-reader completion | Workspace product/accessibility owner                  | Treat as release-blocking during qualification; post-release correct wording/interaction and recheck affected journeys.                        |

## Review limits and verification

The complete category review, source comparisons and edge-case pressure test are
finished. Existing code and public documentation were inspected; no deployed
Supabase/real RLS, provider, full UI, accessibility, ministry interview or load
experiment was run. Those are named implementation proof obligations, not
unanswered product decisions and not grounds to invent runtime assurances.

Original Q40 and every D39 evidence file are preserved in
[the prior-evidence manifest](d40-evidence/prior-evidence-sha256.json).
The [cross-review resolution](d40-evidence/cross-review-resolution.md) records
independent challenges and the resulting choices. The
[new document verification](d40-evidence/review-verification.json) checks status,
22-category coverage, concern/clause/acceptance references, frozen evidence and
local references without running earlier programs. The ratified answer and
amendments are reflected in the session/glossary with their exact
status. **Accept with required amendments; explicitly ratified.**

## Explicit ratification

On **October 18, 2026 (Asia/Bangkok)** the founder instructed:
**“Ratify this decision and amendment. Then continue with this phase 28
grill-with-docs session.”** The corrected decision, C01–C22, P01–P34,
qualification gates and operating responsibilities are explicitly ratified.

This includes one organization-wide optional missionary notice control, default
On only at qualified Live activation, preserved explicit Off, future-only
re-enable and the durable intervening-Off fence. It preserves source truth,
current risk statements, separately qualified work and ordinary task authority.
Donor communications retain their independent contracts.

The [pre-ratification decision](d40-evidence/d40-before-ratification.txt) and
[pre-ratification Q40](d40-evidence/q40-before-ratification.txt) preserve the
reviewed text. The only change inside the exact decision is the status phrase
“The proposed default” becoming “The default”; its behavior and all clauses and
acceptance criteria are unchanged. All nine original evidence files and both
snapshots are pinned in the [ratification manifest](d40-evidence/ratification-evidence-sha256.json).
[New ratification verification](d40-evidence/ratification-verification.json)
checks preservation, status and references without running earlier programs.

This does not publish a formal specification, implement/activate the source or
notice slot, change live settings, create tickets or alter unrelated decisions.
