# D21 — Explicit qualifying facts: current source and workspace UX

Research only, 17 October 2026 UTC. The founder selected **A — Explicit qualifying
facts only**: a comparison with a supporter's previous giving does not itself
create automatic follow-up. Permitted giving history remains useful context;
required qualified native gift work and ordinary manual follow-up remain.
The earlier [Q21 scenario](/workspace/core/docs/features/missionary-workspace-depth/grill/phase28-q21-history-based-gift-attention-research.md:8)
is the choice's context, not evidence that an actual missionary was interviewed.
Its awaiting-answer language is superseded by the current answer.

## Scope and evidence limits

Read the applicable root, missionary, API, UI and Supabase instructions and reused
the repository Supabase skill. This pass freshly inspected the mounted analytics
and dashboard chart path, metrics endpoint/hook, donor roster/status/score/
pledge/history projections, settings, donor Tasks tab, manual task API/dialog,
operation wrapper and relevant migration declarations. Bounded searches covered
`apps/missionary`, `packages/api/src/missionary-portal`, `missionaries/metrics`,
`workflows`, `admin/mission-control-tasks`, `giving`, `donations`, `stripe`, shared
missionary task/chart components, relevant hooks and forward migration literals.
Searches included special/above-commitment/unusual/history/pattern, score/status,
automatic flags, generation/mock/random/fallback and task creation.

The missionary [donor route](/workspace/core/apps/missionary/app/api/missionary/donors/route.ts:1)
and [metrics route](/workspace/core/apps/missionary/app/api/missionaries/[id]/metrics/route.ts:1)
are thin exports of the handlers inspected below, establishing that these are
reached route implementations, not only unused helpers.

The exact gift/recognition/source-to-task and concurrency census in
[D20 current source](/workspace/core/docs/features/missionary-workspace-depth/grill/d20-evidence/current-source-and-ux.md:17)
is **reused evidence**, not a newly executed end-to-end inspection. D20 in turn
identifies its D19 reused census. Fresh source searches and the registered
[workflow function list](/workspace/core/packages/api/src/workflows/serve.ts:21)
did not locate a qualified history-comparison or special-gift task producer in
these paths. This is not a whole-repository, all-branches, deployed-worker or
hosted-database absence claim. The scoped `git diff --name-only` check showed no
working-tree changes in the rechecked portal, analytics, metrics/hook or task
dialog paths; that is not a comparison with every earlier research snapshot.

No app/schema/dependency/formal-owner change, hosted read, send, runtime probe or
new test was performed. Current data values, applied migration state, effective
hosted grants/RLS, installed triggers outside this census, actual source coverage,
real-user usability and production load remain unqualified.

## Controlling meaning, distinct from implementation

- The [founder brief](/workspace/core/docs/features/missionary-workspace-depth/grill/phase28-founder-brief.md:165)
  still requires native first, special/above-commitment, fulfillment and permitted
  recurring-attention tasks. A excludes this additional historical-comparison
  inference; it does not mean commitments-only or disable required work.
- [D20 C01–C05](/workspace/core/docs/features/missionary-workspace-depth/grill/phase28-d20-grouped-special-gift-follow-up-adversarial-review.md:177)
  requires qualified purpose, compatible scope, stable member identity and separate
  source authority. Grouping is not a financial classifier. Its exact reviewed
  set and Independent follow-up completion remain unchanged.
- [P27 C13](/workspace/core/docs/prds/sitestacker-parity/phase-27-donor-development/context.md:171)
  keeps facts useful with ratings/review Off, and placeholder scores do not prove
  opt-in. [P27 C21](/workspace/core/docs/prds/sitestacker-parity/phase-27-donor-development/context.md:275)
  authorizes no missionary D28 rating projection and explicitly includes derived
  sort/filter/count, AI and task consumers. D21 cannot borrow that staff analysis.
- The [Q21 owner crosscheck](/workspace/core/docs/features/missionary-workspace-depth/grill/phase28-q21-history-based-gift-attention-research.md:72)
  identifies the governing P13/P14/P16 distinctions: commitment application has
  closed authority types; unmatched money is not no commitment; a commitment
  reduction can create an above-current label without a new gift; financial
  large-gift review is another purpose. Those source-owner details are delegated
  evidence here, not a fresh financial-domain review.

No generic staff “special” flag, formula, threshold, lookback, AI opinion or new
settings toggle is established by choosing A. An exact positive fact still needs
its authoritative owner, meaning, occurrence, current eligibility and purpose.

## Fresh current-source findings

### S1 — Stored status already drives attention, but its provenance is not a classifier

The [donor adapter](/workspace/core/packages/api/src/missionary-portal/donors.ts:174)
maps stored `lapsed` and `at_risk` to Lapsed/At Risk and defaults other values to
Active. The [summary reducer](/workspace/core/apps/missionary/app/donors/donors-page-model.ts:182)
counts these statuses; the mounted [Needs Attention card](/workspace/core/apps/missionary/app/donors/donors-page-stats.tsx:149)
adds the counts and applies a status filter. Loaded-window wording is present
when more donor rows remain. This is a real visible attention surface, not proof
of a history-derived automatic producer.

Status is also an accepted field in the [missionary donor PATCH schema](/workspace/core/packages/api/src/missionary-portal/donor.ts:25),
copied into the [update payload](/workspace/core/packages/api/src/missionary-portal/donor.ts:73).
The [write](/workspace/core/packages/api/src/missionary-portal/donor.ts:174) predicates
tenant, missionary and explicit nonanonymous preference. Consequently an existing
stored status is not by itself certified financial evidence. This is a source
meaning problem even where the caller is authorized to edit the legacy record.
The upstream provenance of each retained status was not established here.

**Implication:** inspect attention badges, ranking, default filters, suggestions,
dashboard priority and notifications as well as task insertion. Do not quietly
recreate the rejected history-only review under a different name. Nor should
this note be read as proving every legacy status was history-generated or as a
blanket ban on separately qualified/manual statuses or neutral history displays.

### S2 — Score egress and placeholder writes need qualification, not new score reuse

The [donor selection](/workspace/core/packages/api/src/missionary-portal/donors.ts:436)
includes `score`; the [stats projection](/workspace/core/packages/api/src/missionary-portal/donors.ts:364)
returns `score ?? 0`, and the [anonymous branch](/workspace/core/packages/api/src/missionary-portal/donors.ts:378)
spreads those stats while stripping identities/activities. The [GET handler](/workspace/core/packages/api/src/missionary-portal/donors.ts:581)
serializes the page. Its [operation wrapper](/workspace/core/packages/api/src/shared/with-operation.ts:137)
authenticates and passes an admin client to the handler; successful responses
pass through [unchanged](/workspace/core/packages/api/src/shared/with-operation.ts:77).
There is no field-policy projection step in this inspected route/wrapper chain.

The [field-policy migration declaration](/workspace/core/supabase/migrations/20261005050728_field_policy_foundation.sql:445)
marks donor score unreadable on the missionary surface. This is a concrete
code/declaration and adopted-contract conflict to resolve before reuse. It does
not establish that a deployed database contains real P27 ratings or that the
migration is active. No actual score widget was found in the bounded mounted
roster/detail search; a nonrendered JSON field is still an egress surface.

The [add-partner payload](/workspace/core/packages/missionary/components/add-partner-form-model.ts:34)
sets score to **70**, total given and last gift amount to zero, and status Active.
The [dialog](/workspace/core/packages/missionary/components/add-partner-dialog.tsx:58)
attempts a browser insert of that payload. This is a hardcoded placeholder, not
analysis. Effective write permission was not tested. Do not interpret retained
70/0 values, client priority or an Auto badge as consent, qualified evidence or
legitimate migrated financial judgment.

### S3 — Missing, partial and masked data cannot establish no commitment

The [pledge adapter](/workspace/core/packages/api/src/missionary-portal/donors.ts:308)
defaults missing frequency to Monthly, missing status to active and payment counts
to zero. The [donor projection](/workspace/core/packages/api/src/missionary-portal/donors.ts:364)
defaults missing total/score to zero, absent recurring rows to an empty array and
`has_active_pledge` to false. Anonymous rows deliberately replace recurring detail
with an empty array. These shapes do not distinguish unknown, unavailable,
inapplicable, withheld and established absence.

[Donor paging](/workspace/core/packages/api/src/missionary-portal/donors.ts:495)
uses a donor window, then loads related activity/pledges with a shared
[2,000-row limit](/workspace/core/packages/api/src/missionary-portal/donors.ts:450)
per related query, with no corresponding per-donor completeness assertion.
The pledge query filters tenant and donor IDs but not a canonical subject-specific
commitment meaning. The [monthly summary](/workspace/core/apps/missionary/app/donors/donors-page-model.ts:217)
chooses the first active recurring row and returns zero if absent. The dashboard
[snapshot queries](/workspace/core/packages/api/src/missionary-portal/service.ts:194)
cap gifts/donors at 250 and tasks at 100; the [model](/workspace/core/packages/api/src/missionary-portal/model.ts:334)
also maps null gift counts/amounts to zero and pledge presence to a Boolean.

**Implication:** no visible row or zero can authorize “no commitment,” excess,
first-ever giving or coverage of all history. A larger amount need not be extra:
catch-up, advance, partial, multi-period and corrected fulfillment remain owner
questions. A qualified explicit source can support a task without turning the
entire roster into a historical analysis engine.

### S4 — Mounted charts are descriptive, with real errors, but not qualified trigger sources

The [Analytics page](/workspace/core/apps/missionary/app/analytics/page-client.tsx:64)
uses `useDonationMetrics`, shows several unsupported KPI values as Unavailable,
and has distinct loading/error/empty states. Its [selector](/workspace/core/apps/missionary/app/analytics/analytics-data.ts:23)
reshapes a trailing window; recurring plus one-time excludes offline. It is not
a special-gift classifier. No random or synthetic-history fallback was found in
this reached chart/hook chain. The sparkline's single-zero fallback is a separate
[rendering fallback](/workspace/core/packages/missionary/components/metric-tiles.tsx:56),
not generated donor history; it still must not imply complete known zero.

The [metrics endpoint](/workspace/core/packages/api/src/missionaries/metrics.ts:172)
checks authentication, role, missionary ownership and tenant, then reads legacy
donations over the prior 13 months by `created_at`; the [selected fields](/workspace/core/packages/api/src/missionaries/metrics.ts:246)
contain amount/type/status/date but no currency or source-coverage contract.
There is no explicit pagination/completeness envelope. Hosted response row limits
were not measured; the absence of application pagination cannot prove complete
results. This endpoint is a different projection from posted P13 source truth.

The [hook](/workspace/core/packages/lib/hooks/use-donation-metrics.ts:82) zero-fills
months, accepts only `status === completed`, sums raw amount and formats short
month names. Its [change calculation](/workspace/core/packages/lib/hooks/use-donation-metrics.ts:141)
uses 100% when the previous amount is zero and the current amount positive.
That is a display convention, not mathematically established growth from zero
or a gift-qualification fact. [Limited responses](/workspace/core/packages/lib/hooks/use-donation-metrics.ts:181)
become an error, a useful existing safeguard; failures do not switch to generated
history. The [mounted dashboard tiles](/workspace/core/packages/missionary/components/metric-tiles.tsx:116)
respect errors but use dollar-formatted values and “vs prior”; the analytics view
separately divides cents by 100. Currency/unit/date-period and coverage need their
own qualified presentation before using these numbers beyond existing display.

**Implication:** A preserves authorized descriptive history and factual deltas;
it excludes using them alone to emit actionable suspicion, priority or tasks.
Do not “fix” uncertainty by asking AI to guess a donor's normal giving, intent,
generosity, commitment or whether extra support occurred.

### S5 — Manual follow-up is discoverable, but its present recovery/write path is not qualified

The donor detail has ordinary [Tasks and Giving tabs](/workspace/core/apps/missionary/app/donors/donors-page-detail.tsx:210)
and mounts `DonorTasks` with the selected donor. [Add Task](/workspace/core/apps/missionary/app/donors/donor-tasks.tsx:145)
opens the existing dialog with donor preselected. This is a useful base for A's
manual path: no new inbox, mandatory justification, classifier override or
“mark special” control is necessary.

However [DonorTasks](/workspace/core/apps/missionary/app/donors/donor-tasks.tsx:69)
does not consume the hook's error; its [empty branch](/workspace/core/apps/missionary/app/donors/donor-tasks.tsx:185)
can show No tasks yet after an initial failed request. The [hook](/workspace/core/packages/lib/hooks/use-tasks.ts:157)
sets an error and retains prior tasks on failure. A false empty state can prompt
duplicate manual follow-up, conceal a qualified generated task or leave stale
context looking current. This is a concrete source path, not a claimed observed
production incident. Deferred tasks are excluded from active/completed sections;
history only shows five completed rows plus a count, so current discovery cannot
prove there is no related prior work.

The [manual task API](/workspace/core/packages/api/src/missionary-portal/tasks.ts:30)
has a strict allowlist, validates donor access and forces `is_auto_generated:false`.
It accepts follow_up/thank_you as ordinary types, not qualified gift-purpose
admission. The mounted [TaskDialog](/workspace/core/packages/missionary/components/task-dialog.tsx:167)
still attempts direct browser insert/update, and its [payload](/workspace/core/packages/missionary/components/task-form-model.ts:81)
sets generated false even when editing. The inspected later
[server-only grant declaration](/workspace/core/supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:261)
revokes browser access to missionary_tasks. With that effective grant state the
dialog write fails; with different effective permissions its generic payload
still lacks D19/D20 source invariants. Neither outcome was tested live.

The [task row](/workspace/core/packages/missionary/components/task-row.tsx:220)
displays priority and Auto from stored fields. Those fields must not become an
authoritative source-type registry or a way for imports/old writers to certify
special-gift eligibility. Reuse D20's narrower source/CAS/coverage findings; do
not build another task engine or require source closure for an independent task.

### S6 — Existing settings are not a durable enablement contract

The mounted [settings array](/workspace/core/apps/missionary/app/settings/page-client.tsx:95)
advertises At-Risk Donor Alert. Its state is local, and
[Save Preferences](/workspace/core/apps/missionary/app/settings/page-client.tsx:135)
only clears `hasChanges`. This does not prove a persisted subscription, a
qualified source producer, dispatch, or a chosen recipient/channel contract.
Do not treat this demo affordance as authorization to reintroduce historical
attention or as the switch controlling required native gift tasks.

## Smallest complete proposed journey

These are candidate UX requirements, not implemented screens or verbatim founder
labels. Use the shared [base-maia contract](/workspace/core/packages/ui/AGENTS.md:19).

1. **Read a gift or giving history.** Show currently permitted source date, amount
   and currency, subject and source reference, with its actual coverage. A neutral
   trend can remain. No “unusually generous,” risk badge, suggested high priority
   or history-generated queue item is added for the Q21 example.
2. **Create ordinary work deliberately.** Provide the existing Tasks entry point
   and a concise **Add follow-up** action where appropriate. Preselect only the
   permitted person/subject; keep title, optional due date and normal task fields.
   Do not prefill an assertion that the gift is extra or make the user explain
   why the system did not generate a task. Ordinary manual action never certifies
   financial eligibility or automatically consumes D19/D20 generated coverage.
3. **Recognize existing work without ceremony.** Show a currently permitted
   relevant current task/link when known. If discovery fails, say **We couldn't
   load related tasks. Try again.** Never present unknown as No tasks yet. Do not
   require users to inspect every historical task before creating ordinary work,
   or impose an unselected global duplicate ban on distinct manual intentions.
4. **Save, recover and act.** After accepted save, show **Follow-up created** and
   **Open task**; preserve entered fields on failure. A lost response is an
   unconfirmed save until recovered, not permission to create another intended
   task. Mark done remains task disposition, not proof a thank-you was sent.
5. **See qualified native work when it exists.** Keep D19 first-support and D20
   special-gift tasks in the shared Tasks flow. A short explanation names the
   qualified source reason and permitted gift references. A may legitimately
   produce no automatic task for the history-only scenario; it must not display
   an unsupported claim that no qualifying fact exists anywhere.

Unknown source detail: **Commitment details unavailable** rather than No
commitment. Restricted detail: omit it or use an authorized neutral unavailable
state without revealing hidden commitments/gifts. Failed history load:
**We couldn't load giving history. Try again.** Successful empty permitted scope:
**No gifts recorded in this view**, only where that scope/completeness is known.
Do not add a classifier settings screen, arbitrary lookback selector or “Analyze
with AI” recovery button.

Phone and keyboard users need a directly reachable Tasks action, visible labels,
focus return, field-error association and a non-toast-only save outcome. History
amount/date/reference must remain usable without hovering a chart. Loading more
rows must not shift focus or silently change a task's reviewed scope. Screen
reader output must distinguish loading, unknown, error and established empty;
avoid color-only risk/priority semantics. Existing shared components are reuse
candidates, not an accessibility or low-bandwidth performance test result.

## Eight concern dimensions and exact candidate safeguards

All severities concern adoption/reuse under D21. Likelihood is conditional, not
a measured incident rate. The source evidence above supports each concern;
additional financial-owner qualification remains separate.

| ID / dimension                        | Material concern; severity and conditional likelihood                                                                                                    | Exact candidate requirement                                                                                                                                                                                                                                                                                                                                                                                                   | Proposed proof |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| S21-C1 — Product meaning              | High; likely if A is translated into no native gift tasks, or history-only inference is renamed a badge/suggestion. S1/S4/S6.                            | Native gift attention SHALL consume only an owner-qualified explicit occurrence and purpose. A difference from past giving alone SHALL NOT create or raise actionable follow-up, priority, notification or equivalent review suggestion. Authorized descriptive history and independently qualified required native/manual work SHALL remain usable.                                                                          | P1–P3, P8.     |
| S21-C2 — Data integrity               | High; likely if false/zero/empty, legacy status, score or source label substitutes for fact. S1–S4.                                                      | Missing, masked, partial and unavailable source data SHALL remain distinguishable from qualified absence and zero. Commitment/gift qualification SHALL retain canonical subject, occurrence, provenance, units/currency, current revisions and applicable source coverage; history, unmatched money and labels alone SHALL confer no financial meaning.                                                                       | P2–P5.         |
| S21-C3 — Tenant/auth/disclosure       | High; conditional on reuse of score egress, admin reads or retained derivatives without current field/subject rights. S2/S3/S5.                          | Current server-derived tenant, actor, subject, field and purpose authority SHALL govern source facts and every task, badge, count, sort/filter, explanation, export, cache, notification and AI derivative. Legacy score output SHALL be removed or separately owner-qualified before activation; no missionary P27 rating projection is authorized.                                                                          | P6–P7, P11.    |
| S21-C4 — Lifecycle/corrections        | High; plausible with imports, late corrections or migration of unqualified legacy tasks. Reused D20 and S5.                                              | Qualification changes SHALL reconcile unstarted generated work through the source/task owners, preserving completed human history and independent promises. Imports/backfills/legacy labels SHALL NOT invent a qualifying live occurrence or completed coverage. D19/D20 permanent purpose and reviewed-set receipts SHALL remain authoritative.                                                                              | P9–P10.        |
| S21-C5 — UX/accessibility             | Medium/high; likely if load failure appears empty or A hides the manual path. S4/S5.                                                                     | The shared workspace SHALL provide a direct ordinary manual follow-up path, truthful source scope and distinct loading/error/unknown/known-empty states. Creation SHALL make no implicit contact/send or gift-qualification claim; pending/failure/recovery and outcomes SHALL be keyboard, screen-reader and phone usable.                                                                                                   | P8, P12–P13.   |
| S21-C6 — Architecture/debt            | High; likely if browser writes or generic flags bypass source admission, or a second task/classifier engine is built. S5/S6.                             | Extend existing authoritative source commands and the P9 shared task contract. Strict request/DB boundaries SHALL prevent callers, imports and old writers from forging source qualification, actor, generated purpose or task coverage; successful UI-only settings SHALL NOT imply durable behavior.                                                                                                                        | P7, P9, P14.   |
| S21-C7 — Performance/boundedness      | Medium/high; plausible if every dashboard visit scans full history or capped pages silently decide absence. S3/S4.                                       | History displays SHALL use bounded, explicitly scoped owner projections; native qualification SHALL not depend on loaded UI pages or perform an unselected history-anomaly scan. Necessary D19/P16 owner evidence SHALL remain qualified and indexed independently of D21's rejected comparison feature.                                                                                                                      | P4–P5, P14.    |
| S21-C8 — Recovery/proof/observability | High; plausible if task presence/Auto badge/HTTP success is treated as eligibility proof or failed task discovery creates duplicates. S5 and reused D20. | Accepted source qualification, task admission and disposition SHALL retain their distinct owner evidence and recoverable results. Observability SHALL distinguish qualification unavailable, no eligible occurrence, task pending/materialized and manual creation without exposing protected facts. Release evidence SHALL exercise actual commands/permissions and source failures, not only synthetic classifier fixtures. | P1, P9–P14.    |

## Falsifiable proof outcomes proposed, not run here

1. The Q21 new larger gift with only historical comparison creates no task,
   attention badge, hidden priority, notification, AI suggestion or review event.
   Permitted history remains visible and ordinary manual follow-up is possible.
2. A qualified first-support or independently qualified special/above-commitment
   occurrence still creates its required native work even with optional ratings,
   workflow products and all history-comparison analysis unavailable.
3. A source-qualified explicit special case that does not depend on a commitment
   remains possible; the implementation cannot silently redefine A as
   commitments-only. An arbitrary staff flag does not pass this proof.
4. Null pledge data, withheld anonymous detail, related-row cap, partial import,
   load failure and true qualified absence produce distinct meanings. None alone
   qualifies no commitment, excess, first support or a historical anomaly.
5. Cross-currency, differently dated/multi-period gifts, catch-up/advance and a
   reduced commitment with no new gift do not acquire special-gift meaning from
   raw amount/delta or a chart's zero-filled prior period.
6. Score 70/0, At Risk/Lapsed or an Auto flag from retained data produces no
   automatic financial authority. Missionary responses/derivatives expose no
   prohibited P27 rating, including nonrendered JSON and anonymous rows.
7. Forged tenant/actor/source/purpose/generated fields, donor status edits,
   imported labels and old browser writes cannot bypass qualified admission.
   Real tenant/role/field denial is checked at result release and mutation time.
8. Maya can create ordinary manual follow-up from authorized history, with no
   mandatory special classification, justification, message or new inbox. A
   related-task load failure cannot appear as no related work.
9. Replay, import, material correction and source withdrawal preserve D19/D20
   purpose identity and completed human history. A correction changes eligibility
   through its owner; it does not retroactively claim a thank-you was sent.
10. Completing an ordinary manual task does not implicitly complete a generated
    reviewed gift set; D20 exact review, new-arrival residue and receipts hold.
11. Permission loss, tenant/lens change or stale cache response reveals no hidden
    gift, pledge, score, source reason or count through history/task/error UI.
12. Failed save preserves entered manual work; uncertain response recovers the
    original result without duplicate intended tasks. A successful settings
    appearance cannot substitute for a persisted authorized preference.
13. Keyboard, screen-reader, 320 CSS px phone/zoom and low-bandwidth flows can
    read permitted gift facts, find Tasks, create/recover work and understand
    scope/error/empty states without chart hover, color alone or forced narrative.
14. A measured bounded source/task workload uses existing owner projections and
    repair paths without N+1/full-history anomaly scans, unsafe fallback or a
    second task engine. UI-only mocks and passing fixture tests are insufficient.

## Verification performed and not performed

The prior [D19 test attempt, reused by D20](/workspace/core/docs/features/missionary-workspace-depth/grill/d20-evidence/current-source-and-ux.md:248)
failed **before collection** because installed Sentry lacks the `./config` export
used by Vitest configuration. No tests ran then; this static documentation pass
does not justify another unchanged blocked run or dependency change. Existing
[add-partner form tests](/workspace/core/tests/unit/packages/missionary/add-partner-form-model.test.ts:44)
even expect score 70: that documents a placeholder contract, not a qualified rating.

Local link-target/line-bound, trailing-whitespace and scoped diff checks passed;
these are documentation checks only. No database permission probe, applied migration-chain proof,
complete source producer qualification, UI/a11y run or throughput result is
claimed. The requirements/proof outcomes above are release work to implement and
verify through owners after the documentation decision, not evidence of current
compliance.
