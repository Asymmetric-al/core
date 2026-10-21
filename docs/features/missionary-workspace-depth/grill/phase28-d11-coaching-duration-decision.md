# D11 — ongoing coaching sharing with an optional end date

**Disposition: Accept with required amendments.** The founder selected
**A — Allow ongoing sharing, with an optional end date**, emphasizing a clean,
clear, beautiful and easy user journey. Recorded October 16, 2026 UTC against
baseline `9cada8f3d8ab59db391d3fd20df77fcadeb09813`.

The selected product direction is recorded. [D47](phase28-d47-coaching-share-through-date-decision.md)
now explicitly adopts the whole-selected-day meaning in the decision and C02.
Remaining detailed design retains reviewed status; this is not blanket packet
ratification or implemented behavior.
D8–D10 remain ratified. This is research and acceptance design only; formal
owner/OpenSpec work, implementation and tickets retain their session boundaries.

## Decision

> A missionary with current sharing authority may maintain an ongoing coaching
> share without selecting an end date, where the organization permits it. They
> may instead choose an end date and may stop sharing earlier. Ongoing sharing
> remains subject to current organization rules, source permissions, membership,
> eligibility expiry and required permission reviews; it does not mean permanent
> access or automatic renewal of an expired grant.
>
> Keep duration within the existing sharing review. Clearly show the saved
> access state and any relevant organization limit. Show an end-date field only
> when chosen or required. Use one Save and an obvious Stop sharing action.
>
> Date meaning selected in D47: sharing continues through the chosen calendar day
> in the displayed organization/source-approved time zone. Resolve and retain
> its exact cutoff when saved; later travel or settings changes do not move it.
> Access ends at that cutoff even if a background job has not run.
>
> Extending or removing an end date requires current authority and deliberate
> Save. It changes no modules or selected historical periods. An ended or expired
> sharing episode does not resume through an old link, retry, policy toggle or
> date edit. A later share requires the existing authorized activation journey.

No universal duration, automatic renewal, extra reminder cadence, new approval
queue, time picker or separate expiry-management product is selected. Existing
owner-required permission review and warning behavior remains applicable.

## The smallest complete journey

Use **Coaching → Jordan → Sharing**, retaining the recipient, organization and
ministry context. Separate three plain-language sections: **What Jordan can
see**, **Earlier support periods** where included, and **How long to share**.
Their relationship should be clear without presenting a permissions matrix.

```text
Sharing with Jordan Lee
Community Ministry · [Organization]

[Existing shared-information and earlier-period summary]

How long to share
No scheduled end                         Add an end date
You can stop sharing at any time. Your organization's access rules apply.

                                      Cancel   Save sharing
```

This is a suggested initial presentation when ongoing sharing is permitted,
not proof of activated access. For an existing share, preserve its saved choice
instead of resetting it to ongoing. Selecting an end date reveals one labeled
date input, with optional calendar and typed entry:

```text
Share through [30 November 2026]           Remove end date
Includes the whole day in [organization time zone].
```

Dates are illustrative. Reuse the source-approved organization time zone rather
than add a new missionary preference. Display its human-readable name; do not
use an ambiguous abbreviation alone. No clock-time selection is needed for the
ordinary calendar-date choice. The source must resolve DST and validate the date;
an unsupported civil date or policy conflict is an actionable field error, not
a silently substituted time.

**Organization requires an end:** show the date field and concise requirement
directly. Omit the unavailable Remove end date action. A known fixed policy end
can be shown as read-only when no missionary choice exists. Permission review
due dates remain separately labeled; do not relabel them as scheduled share ends.
Never offer an ongoing option that the server will necessarily reject.
If an organization cutoff falls partway through a day, show its actual time and
zone. Do not round it to day-end or imply that the whole day is included.

**Review and Save:** inline text shows the actual proposed end condition. Clearing
an existing end date explicitly changes the review to No scheduled end. One Save
applies the authorized change; ordinary edits need no second confirmation. If
policy or the share changed while editing, refresh the review and preserve safe
draft input. Do not silently shorten/extend the request and report it as saved.

**Saved state:** show Active, Invitation pending, Sharing ended, or an authorized
limited-access explanation according to actual state. Display No scheduled end
or Sharing through [date, zone] only where applicable to the current state. For a
terminal share, lead with Sharing ended [date]; put any former schedule in history.
A pending invitation is not active access. Known earlier organization limits,
including an exact time/zone when necessary, must be explained accurately;
the chosen end is a ceiling on this share, never a guarantee of uninterrupted access.

**Change or stop:** keep Change sharing and Stop sharing in the same detail view.
Visually separate Stop sharing from Save using existing semantic tokens and
spacing. One short confirmation is appropriate for ending the episode:
“Stop this coaching share with Jordan?” followed by “This ends access provided
by this share. Your records are kept.” Do not introduce a multi-step wizard.
On confirmed completion, show **This coaching share has ended** persistently.
Do not claim Jordan has no other access, expose a hidden grant inventory, or
offer an Undo that silently recreates authority.

**Coach experience:** show the relevant end condition in the subject's sharing
details without adding countdowns or repeated warnings. At expiry or revocation,
remove protected results and show a safe ended/unavailable state where permitted.
Retain navigation to other authorized coaching subjects. Leave coaching remains
the coach's own scoped exit, not permission to extend Maya's share.

**After expiry:** an authorized missionary can deliberately Share again through
the existing activation flow. Re-prove the current subject, modules, history and
identity; do not revive the terminal episode or automatically resend invitations.
A temporary eligibility review or source outage is a different state: it may
resume only through its permitted source transition while the sharing episode
is otherwise still valid.

**Visual and accessibility requirements:** reuse Core's exact `base-maia`, Base
UI components and semantic tokens. Use a calm single-column hierarchy, concise
helper text, clear date labels, readable status, generous touch targets and one
obvious primary action. Support keyboard/date entry, focus restoration after
confirmation, 320 CSS-pixel reflow, 400% zoom, long names/translations and reduced
motion. Save/error feedback must be programmatically announced and remain visible;
neither color nor a disappearing toast carries the only explanation. Preserve
safe edits on a failed request. Automatically recover authoritative status after
an uncertain outcome; offer Check status as a fallback if recovery remains unresolved.

## Source ownership and implementation requirements

**C01 — Ongoing is explicit intent.** The sharing source records a valid selected
duration meaning. A missing field, legacy null, long-lived session or role label
does not establish ongoing access. P12 remains the sole current authorization
owner, including time-bound group governance and tier-scoped recertification.
Do not create permanent grants or automate renewal to make the display match
the user's ongoing intent.

**C02 — Calendar date and exact cutoff.** For the date meaning selected in D47,
the source resolves the selected date and approved IANA zone to the exclusive
start of the next local calendar day, retaining the reviewed date/zone and UTC
instant. It validates supported date resolution and hard policy ceilings.
Retain an earlier organization-imposed cutoff as its actual qualified instant;
show time and zone when needed and never round a partial day to day-end.
Use calendar boundaries, not 86,400 seconds or a synthetic last millisecond.
Changing a tenant or browser time zone must not silently move an existing cutoff.
Today may be selected only if its valid cutoff is still in the future at apply;
an already-passed date is rejected, with Stop sharing offered for immediate end.

**C03 — Deadline enforcement.** Access is allowed only before the exact effective
cutoff and while all current source/permission conditions hold. At equality it
is denied. Recheck trusted source time and current authority at protected release
and mutation commit, including work delayed by locks or generation. A transaction-
start timestamp, JWT lifetime, client clock, cron status or stale active flag is
not sufficient. A cleanup job may maintain derived state but does not create
expiry. No claim is made to recall already delivered bytes or human knowledge.

**C04 — Safe duration mutations.** Use the existing server-owned sharing command,
trusted actor/context, exact tenant/entity/subject/episode, expected version,
semantic idempotency and required atomic audit. Shortening/stopping and widening
retain their distinct authority. Removing an end date is widening. Validate both
the permitted old state and proposed new state; direct updates cannot rebind
scope, actor or duration outside authority. Inspect actual RLS/grants/functions
and service paths; no service role or security keyword bypasses owner admission.

**C05 — Scope and non-revival.** Deadline edits leave D10 historical dates and
independent module/currency rights unchanged. The sharing episode's own scheduled
expiry or explicit stopping closes this episode and fences dependent results/effects;
independent valid rights and source records remain. Underlying eligibility/grant
expiry fences its dependent access under that source's lifecycle; it neither
automatically ends every ongoing episode nor renews an expired grant.
A late extension, retry, restore or policy relaxation cannot reactivate
an ended episode. Temporary review withholding is not terminal expiry; current
permitted re-attestation may restore only an otherwise valid sharing basis.

**C06 — Honest state and recovery.** The UI and API distinguish saved duration,
invitation state and current effective access. Show only permitted duration actions
and source-safe explanations. Never show a permission-review date as guaranteed
share expiry or No scheduled end as guaranteed permanent availability. Confirm
saving/ending only from authoritative outcomes; automatically recover unknown
outcomes before retrying, with a manual status-check fallback, and reject stale
changes after narrowing or stopping. Terminal copy leads with Sharing ended;
source-imposed partial-day cutoffs show their exact time and zone.

**C07 — All representations respect expiry.** The existing resolver/projection
boundary governs reads, caches, deferred work and permitted documents alike.
Bound cache validity by the nearest relevant deadline and governance revision;
the deadline itself must work without a mutation event. Discard late results and
clear reached protected display state on scope loss. Supabase session expiry is
separate from this share; do not sign the coach out of unrelated work to end it.

**C08 — Small coherent UI.** Implement the create/change/end/recovery states
above within the existing sharing flow and shared design system. Typed date
entry and an optional calendar use the same valid choices; localize presentation
without changing the authoritative zone/instant. Permission-required warnings
retain their owner; do not add notification settings or renewal campaigns here.

**C09 — Migration, audit and operation.** Never convert existing missing expiry
data into ongoing grants. Activate the qualified duration contract only for
explicitly valid sources and compatible clients. Required source history records
attributed before/after duration, resolved cutoff and command outcome without
private coaching/financial payloads. Safe disable/roll-forward preserves terminal
events and audit. Keep exact-scope reads indexed and measure their existing
authorization budget; no new per-coach periodic job or universal term is needed.

**C10 — Traceability and proof.** Carry D11/C01–C10 and P01–P12 into later
authorized owner/OpenSpec/design/tests. Verify actual Core/Supabase paths and
the complete missionary/coach journey before activation. Source documents and
reviewed copy are not proof of implementation, accessibility or usability.

## Focused concern review

Likelihood below is conditional engineering judgment, not an observed incident
rate. The linked clauses are the exact permanent prevention requirements.

| Concern                                                   | What could go wrong and why it matters                                                                               | Severity / likelihood without prevention           | Evidence and effect on A                                                                            | Permanent fix and exact amendment                                                                                       |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| R01 — Ongoing overpromises access                         | Blank expiry or the word Forever becomes permanent authority, bypassing organization rules or required review.       | High / plausible                                   | P12 group/review rules; narrows interpretation of A, not eligibility.                               | Explicit source meaning, effective-state copy and current owner checks: C01/C06, P01/P02/P09.                           |
| R02 — Ambiguous end date                                  | Browser zone, DST, end-of-day math or delayed jobs leave access too long or cut it early.                            | High / likely if generic date/timer code is reused | PostgreSQL clock/calendar distinction and Supabase session semantics; adds precise date convention. | Reviewed calendar zone/cutoff and fresh enforcement independent of jobs: C02/C03/C07, P03–P05/P10.                      |
| R03 — Stale widening revives access                       | Clearing or extending a date races with stopping; a retry restores a terminal share or widens history.               | High / plausible                                   | Ratified D8 episode lifecycle and D10 fixed history; changes mutation requirements.                 | Existing versioned source command, explicit widening, no terminal revival: C04/C05, P06/P07.                            |
| R04 — Misleading state or recovery                        | Pending access looks active, failed Stop looks successful, or a generic message claims all independent rights ended. | High / plausible                                   | Existing separate source/grant/invitation ownership; adds exact UI states.                          | Scope-specific persistent outcomes, status recovery and safe explanations: C05/C06/C08, P08/P09/P11.                    |
| R05 — A simple choice becomes a second permission product | Per-module timers, recurring reminders, new approvals or an expiry engine add maintenance and user friction.         | Medium / plausible                                 | Existing P12 resolver and D8 commands already own the job; narrows design.                          | One duration control and existing owner enforcement; no new dependency or unsolicited automation: C01/C08/C09, P11/P12. |
| R06 — Migration or retained views defeat expiry           | Old clients, null backfills, caches or browser Back expose ended sharing or recreate it after restore.               | High / plausible                                   | D8/D10 current-release and migration boundaries; requires compatible activation.                    | Denied-first migration, deadline-aware cache/release and preserved audit: C07/C09/C10, P05/P10/P12.                     |

| Review category                           | Material concern?              | Assessment                                                                                                                                   |
| ----------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Problem validity, necessity, alternatives | Yes — R01/R05                  | Optional end fits ongoing coaching; mandatory end contains forgotten access but forces renewal work. No measured Asym preference is claimed. |
| Brittleness                               | Yes — R01/R02/R06              | Missing settings, calendar changes and event-only expiry fail outside ideal conditions.                                                      |
| Technical debt                            | Yes — R05/R06                  | Avoid parallel duration logic, legacy null grants and new scheduler authority.                                                               |
| Edge cases                                | Yes — R02–R04                  | Today, DST, pending invitation past end, multiple grants, late edits and response loss have explicit outcomes.                               |
| Footguns                                  | Yes — R01–R04                  | Removing a date widens authority; misleading labels and optimistic ending are unsafe.                                                        |
| Tenant safety                             | Yes — R03/R06                  | Scope, actor, subject and cache identity remain server-derived and isolated.                                                                 |
| Database, RLS and authorization           | Yes — R01–R03/R06              | Source lifetime and current authorization differ; both old/new states, trusted time and privileged paths must be checked.                    |
| Overengineering                           | Yes — R05                      | No separate expiry wizard, reminder engine, arbitrary default term or permission system.                                                     |
| UX/UI and friction                        | Yes — R01/R02/R04              | One progressive date field, actual status, clear timezone and accessible recovery prevent confusion.                                         |
| Source of truth and invariants            | Yes — R01–R03                  | Source intent, active grants, invitation expiry, selected history and retention have separate meanings.                                      |
| Hidden coupling                           | Yes — R02/R05                  | Auth sessions, donor dates and cleanup jobs must not determine coaching validity.                                                            |
| Failure modes                             | Yes — R02/R04/R06              | Delayed work and uncertain writes cannot extend or falsely end access.                                                                       |
| Lifecycle, concurrency and idempotency    | Yes — R02/R03                  | Fresh deadline checks and ordered extension/stop races preserve terminal state.                                                              |
| Data integrity                            | Yes — R03/R06                  | No resurrection, reattribution, history widening or inferred migration enrollment.                                                           |
| Security and privacy                      | Yes — R01/R03/R06              | All reached representations retain current access; other grant existence remains protected.                                                  |
| Scalability and performance               | Yes — R05/R06                  | Use bounded existing authorization reads and deadline-aware caches; no per-coach polling job. Actual load remains unmeasured.                |
| Operational burden                        | Yes — R01/R05                  | Ongoing sharing needs discoverable management and existing required reviews, not invented recurring admin chores.                            |
| Observability and auditability            | Yes — R03/R04/R06              | Attribute duration changes, preserve terminal history and diagnose uncertain outcomes without content logs.                                  |
| Dependencies and integrations             | No new material concern        | Checked calendar/auth dependencies; existing owners suffice and no provider/send action is added. Session assumptions are addressed in R02.  |
| Migration, rollout and upgrades           | Yes — R06                      | Null/old-schema interpretation, backup restore and mixed clients require explicit qualification.                                             |
| Testability, traceability and proof       | Yes — R02–R04/R06              | Outcome scenarios below are required; no product/runtime proof is claimed from document review.                                              |
| Other development hazards                 | No additional material concern | Checked financial writes, record deletion, public access, exports and compulsory coaching; none follows from duration.                       |

## Acceptance scenarios

These are required future proofs, not tests claimed to have passed in this turn.

| Proof                           | Observable outcome                                                                                                                                                                                                                                                           |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P01 — Ongoing positive          | Qualified ongoing sharing works without an invented end date and displays its actual state; older null/missing intent supplies no grant.                                                                                                                                     |
| P02 — Organization limit        | Required-date/maximum-duration rules govern UI and server; tampering cannot remove them. A partial-day source cutoff retains and displays its exact time/zone. Review due and scheduled end remain distinct.                                                                 |
| P03 — Date meaning              | Selected day includes its whole source-zone day; timezone travel/change, leap day and DST 23-/25-hour days retain the reviewed cutoff. Invalid mappings fail clearly.                                                                                                        |
| P04 — Exact deadline            | Immediately before cutoff the otherwise valid share works; at and after it no new dependent release/extension is admitted, including a transaction that began earlier.                                                                                                       |
| P05 — Delayed infrastructure    | Stopped jobs, token refresh delays, open tabs, long generation/lock waits and caches cannot extend authority; unrelated work remains available.                                                                                                                              |
| P06 — Duration versus history   | Extending/removing an end date changes only the reviewed lifetime, never D10 historical dates, modules or exports.                                                                                                                                                           |
| P07 — Competing writes          | Both extension/stop orders, late acceptance, duplicate requests and stale retries preserve final authority; expired episodes require fresh activation.                                                                                                                       |
| P08 — Unknown outcome           | A lost Save/Stop response triggers automatic authoritative status recovery, with a manual fallback; no false success or duplicate fresh share follows.                                                                                                                       |
| P09 — Independent states        | Invitation pending, active share, temporary review withholding, ended episode and unrelated valid grants produce accurate scoped copy/actions. Underlying eligibility expiry does not silently terminate every ongoing episode. Terminal copy cannot promise future sharing. |
| P10 — Tenant and retained state | Cross-tenant/subject/actor substitution fails; Back, another tab, service paths and restored caches cannot expose expired results.                                                                                                                                           |
| P11 — Complete usable journey   | Representative missionary/coach users create, understand, change and stop sharing on phone/keyboard/screen reader, including failures and organization-required dates, without confusing it with history.                                                                    |
| P12 — Rollout and audit         | Mixed versions/backfill/restore preserve denied unknowns and terminal history; audit is attributed, queries meet declared supported-workload budgets, and no extra reminder/sender effect occurs.                                                                            |

## Evidence, checks and limits

- [Q11 research](phase28-q11-coaching-duration-research.md) retains the alternatives,
  founder brief, P12 and primary MPDX/Google/Microsoft comparisons. Optional end
  is the founder's product choice; vendor practices do not select Core's limits.
- [D8](phase28-d8-adversarial-review.md) C07–C13 and [D10](phase28-d10-adversarial-review.md)
  C01–C02/C10–C14 govern source episodes, scoped stopping, independent rights,
  selected historical dates, truthful outcomes and accessibility.
- [P12](../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1587)
  requires deadline-bounded cache authority; group governance at 1594,
  recertification at 1661 and source lifecycle at 2409–2417 remain applicable.
  Its D50 elapsed reminder duration is a different purpose and is not imported
  as calendar-date expiry. [Active identity OpenSpec](../../../../openspec/changes/sitestacker-parity/specs/identity-and-access/spec.md)
  preserves the single context/projection boundary; neither documents shipment.
- [Supabase sessions](https://supabase.com/docs/guides/auth/sessions), inspected
  October 16, 2026: session lifetime checks and JWT validity do not themselves
  establish an exact coaching-share cutoff. The changelog index was retrieved
  during this review; no deployment/SDK change is made or claimed.
- [PostgreSQL date/time functions](https://www.postgresql.org/docs/17/functions-datetime.html),
  inspected October 16, 2026: transaction, statement and actual clock time differ;
  calendar-day and elapsed-time arithmetic also differ around DST. These support
  C02/C03, not a new bespoke clock service.
- [USWDS date picker](https://designsystem.digital.gov/components/date-picker/)
  and [GOV.UK dates](https://design-system.service.gov.uk/patterns/dates/) support
  task-appropriate controls, typed entry and clear formats. Reuse Core components;
  importing their libraries or US date formats is not required.
- [Core UI contract](../../../../packages/ui/AGENTS.md),
  [configured design system](../../../../packages/ui/components.json) and
  [accessibility review](../../../ai/skills/accessibility-review/SKILL.md) inform
  the state/focus/error/reflow requirements. No new UI or visual prototype was
  built and no usability/conformance result is asserted.

Performed scoped repository/primary research, independent owner/UX review and
documentation verification. No new application, database, authorization, browser,
accessibility, provider or load test ran. Earlier D8–D10 probes retain their
limits and are not duration qualification. No application, migration, formal
specification, external communication or dependency changed.

## Adversarial synthesis

**What could go wrong?** Ongoing can conceal stale access. Keep current reviews,
explicit source authority and easy stopping; do not equate a saved preference
with current permission.

**What assumptions remain?** Ongoing is the selected product choice, not a
measured optimal default for every tenant. D47 explicitly selects the whole-day
convention; exact control composition remains a reviewed design recommendation.
Both require implementation proof. The [pre-D47 review](d47-evidence/d11-before-d47.txt)
preserves the earlier recommendation status.

**Whole-product effect:** one lifetime choice on existing coaching sharing;
identity, financial periods, retention and other rights retain their owners.

**End-user effect:** a short sharing review, clear persistent state and one place
to edit or end it. Organization restrictions appear where they affect the choice.

**Modern-practice fit:** optional expiry and explicit removal have primary
precedents, but Core's existing reviews and current authorization remain binding.

**Repository fit:** retain the source commands, P12 resolver, owned projections,
Base Maia UI and current OpenSpec boundaries. No new ADR or timer platform is needed.

**Recommendation adjustment:** accept A with C01–C10's date, authority, lifecycle
and UX precision; retain independent work rather than treating expiry as logout.

Before activation, specify the source timing/profile and existing eligibility
mapping, then implement the native flow and actual authorization paths, then
prove P01–P12. Monitor only residual operation: any confirmed post-cutoff release
belongs to the P12/security owner for immediate containment and requalification;
any reproducible misleading duration/status outcome belongs to the P28 product
owner for correction and task retest before wider rollout. These are prevention
requirements, not acceptable defects to leave for monitoring.
