# Phase29 Q12 — choose the ordinary unfinished-access calculation profile

21 October 2026, Asia/Bangkok. Parent reports Conrad ratified Q11 A and its complete amendments today; the parent is recording that ratification. This research selects no Q12 answer. Core checkout `/home/conrad/code/core`, last verified HEAD `3d85897ebf1515008ef5c676b1c58a15422fb9ab`.

Read-only source, owner docs and official date semantics. No credentials, private rows, provider/runtime changes or product edits. Existing date test sources were read only; no tests ran for this documentation question. Only this research note was written.

## Recommended next single decision

Q11 fixed the original end at source issuance while leaving its calculation open. A complete ordinary profile can now combine **one explicit elapsed duration and its issuance-based formula** in the founder's next decision. It does not need a separate shape-only question if the formula and number are disclosed together.

Suggested framing:

> **For newly issued ordinary private document requests, should unfinished access last up to 30, 60 or 90 elapsed days from original source issuance, while preserving genuine earlier limits?**

All three mean one source-approved profile, resolved once at issuance and retained. They do not mean a staff date picker, a per-request menu, elapsed time from first visit, a buffer after a requested target, or permission to extend later.

My cautious ordinary starting preference is **30 elapsed days**, explicitly a product judgment rather than a measured optimum. It keeps the initial exposure shorter and gives a concrete cohort qualification target. It is acceptable only where delivery, recipient work and source review can usefully complete within that actual opportunity. Do not activate an unsuitable cohort on the assumption that staff will extend access.

The strongest longer alternative is **60 elapsed days**: another thirty days for the same collection-and-review journey, at the cost of potentially twice the unfinished access interval. **90 elapsed days** buys still more time and still more exposure; no inspected ordinary-source evidence demonstrates that it is necessary. No implementation mechanism makes one of these counts inherently correct. The founder can reasonably prefer a longer initial allowance without claiming a study proved it.

## Exact candidate profiles

Let `I` be Q11's original qualified source issuance occurrence and `N` the chosen count.

| Candidate       | Exact nominal unfinished end | Principal tradeoff                                                                        |
| --------------- | ---------------------------- | ----------------------------------------------------------------------------------------- |
| 30 elapsed days | `I + 720 hours`              | Shortest of these ordinary options; most pressure on delayed discovery and staff review.  |
| 60 elapsed days | `I + 1,440 hours`            | More opportunity for the same source task; longer potential unfinished access.            |
| 90 elapsed days | `I + 2,160 hours`            | Largest allowance and exposure among these choices; needs a reasoned ordinary-cohort fit. |

These are exact 24-hour days, not one/two/three calendar months, business days, local end-of-day, or “next month on the same date.” The actual applicable unfinished end is no later than the nominal result and every genuinely binding earlier limit. Current authorization can deny particular actions sooner.

The original admitted result and policy provenance are fixed under Q11. Later genuine shortening stays enforceable without rewriting why the original end was admitted. Changing a default, target, display timezone, credential, message or retry time does not recalculate it.

This profile bounds only the unfinished stage under Q10. Timely eligible fulfillment enters Q07's separately bounded completed stage. Do not describe these numbers as a new overall request cap or truncate valid completed access at the old unfinished end.

For the original ordinary lifecycle, if no earlier limit applies, `F < U` and `E <= F + 720 hours` imply:

| Initial candidate | Derived latest possible original completed end        |
| ----------------- | ----------------------------------------------------- |
| 30 days           | Strictly before `I + 1,440 hours` (60 elapsed days).  |
| 60 days           | Strictly before `I + 2,160 hours` (90 elapsed days).  |
| 90 days           | Strictly before `I + 2,880 hours` (120 elapsed days). |

That is an arithmetic consequence, not an additional stored overall cap, a guaranteed complete interval, a retention period, or a bound on independently authorized Q08 fresh access. Actual fulfillment may happen much earlier; true caps or missing admission may prevent completed reading entirely.

## Evidence does not prove the number

There is no inspected production distribution for invitation delay, document preparation, staff-review duration, expiry-related help, recipient satisfaction or failed cohorts. None of 30/60/90 is a demonstrated ministry optimum. A decision can still select a product default, followed by adversarial review and release qualification.

The relevant documented values have narrower owners:

- `docs/prds/workflow-studio/01-product-and-experience.md:65–69` proposes fourteen-day external-task expiry with reauthorization. This is an existing product proposal requiring explicit native-source reconciliation. It is not a legal requirement, and its renewal assumption cannot be imported while initial-expiry recovery remains unselected.
- `docs/adr/0037-scanner-safe-exact-artifact-access.md:83–88` gives fourteen-day official-document guest and thirty-minute document-session defaults. Those belong to that exact purpose, not this collection/review journey.
- Q07's thirty-day completed maximum has a different anchor and purpose. Matching its number for unfinished access is not evidence of suitability.
- Local Auth JWT/OTP, work claims, provider URLs and retention clocks are technical or custody lifetimes. They are not candidate values for recipient collection authority.

If the founder chooses 30/60/90 for the ordinary profile, explicitly record its relationship to Workflow's suggested fourteen-day proposal. Do not erase the proposal or say a longer number was already the implemented default.

## Current source conventions and gaps

Paths below are relative to `/home/conrad/code/core`.

| Source                                                                                              | Current behavior                                                                                                                                                                        | Consequence for Q12                                                                                                                                                                                                                    |
| --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/features/files-documents/docs/adr/0011-fixed-unfinished-deadline-at-source-issuance.md:18–36` | Original source issuance is distinct from proof/delivery/fulfillment; original end and calculation provenance are retained; retry recovers existing output before computing new timing. | The selected profile must resolve once at that source effect. No retry-time or first-open fallback. Ratification header was still being updated by the parent when read; the latest explicit parent/user ratification controls status. |
| Same ADR`:38–63,71–74`                                                                              | Exact authority/currentness, physical-commit distinction, no implicit extension, Q10 stage scope and qualification gates.                                                               | A numeric default does not replace source admission, turn it into a whole-lifecycle cap or activate the lane.                                                                                                                          |
| `packages/api/src/missionary-portal/tasks.ts:30–41,81–95`                                           | Optional nullable `due_date`; submitted value is stored, task completion uses application time.                                                                                         | A missing target is valid task data. This does not define access duration or justify inventing a target when absent.                                                                                                                   |
| `packages/api/src/missionary-portal/task.ts:25–58`                                                  | `due_date` is optionally mutable through task PATCH.                                                                                                                                    | Deriving current authority from the latest task target would create hidden extension/shortening. Q09 and Q11 reject that accidental coupling.                                                                                          |
| `packages/lib/hooks/use-tasks.ts:111–125`                                                           | A `Date` form value serializes to ISO; other due-date/null values pass through.                                                                                                         | Form serialization is not a canonical source timezone, authority end or duration calculation.                                                                                                                                          |
| Same `use-tasks.ts:265–290`                                                                         | Browser-local day boundaries and `new Date(due_date)` classify due/overdue tasks, memoized on tasks.                                                                                    | Calendar-relative UI grouping is not exact server expiry enforcement; do not use it to admit requests or decide deadline races.                                                                                                        |
| `apps/missionary/app/tasks/page-client.tsx:793–820`                                                 | Local midnight and date-fns `isPast`/`isToday` classify task views.                                                                                                                     | Useful task display, not an elapsed-duration permission model.                                                                                                                                                                         |
| `packages/lib/hooks/use-locale-format.ts:20–40,80–99,101–120,137–174`                               | Deterministic en-US/UTC server/hydration formatting, then visitor locale/zone; date-only `formatDate` defaults to UTC to preserve the displayed calendar date.                          | Reuse formatting deliberately. It supplies no authoritative date-only-to-expiry conversion. Native deadline display needs exact instant, explicit timezone and sufficient precision.                                                   |
| `tests/unit/packages/lib/use-locale-format.test.tsx:26–89,111–128`                                  | Existing tests assert date-only preservation, explicit-zone behavior and instant formatting.                                                                                            | Read only, not run this turn. They test presentation, not initial admission, timezone rule history, DST duration or live authority.                                                                                                    |
| `tests/unit/packages/lib/use-locale-format-hydrate.test.ts:20–35,72–85,106–125`                     | Separate-process timezone/hydration fixtures exist.                                                                                                                                     | Useful future adjacent display verification, not proof of native deadline computation. No new pass count claimed.                                                                                                                      |

The existing formatter intentionally treats a date-only string differently from a timestamp. In its current source, `formatDateTime` does not apply the date-only display special case (`use-locale-format.ts:143–152`). Its test explicitly demonstrates that selecting an explicit Los Angeles zone for a parsed date-only value can display the previous date. Neither behavior is a native deadline bug; it is a concrete reason not to feed a bare business date into generic timestamp formatting and infer permission.

The inspected source still lacks a qualified native issuance calculation/runtime. No code default decides Q12.

## Date-only, elapsed time and timezone constraints

The proposed ordinary elapsed profile does not need a local calendar date to calculate its end. Use the trusted source occurrence as an instant, add the approved exact elapsed amount, preserve the admitted result, and render it in appropriate explicitly identified display zones. The environment's Asia/Bangkok timezone dates this research; it does not become every tenant's business timezone.

An elapsed choice avoids some calendar ambiguities but does not eliminate source clock, timestamp precision, boundary comparison or current-authorization requirements. Q11's after-wait checks and qualified occurrence-versus-commit model remain binding. The end is exclusive; rounding in UI cannot move it.

Current ECMAScript Date parsing interprets date-only forms without an offset as UTC, while offset-free date-time forms are local time. That is a parsing convention, not a source owner's intended “end of this day.” Unrecognized/out-of-range input is not a permission fallback. [ECMAScript Date.parse](https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-date.parse)

PostgreSQL's calendar-day interval arithmetic can differ from adding the same nominal number of 24-hour intervals across DST; month arithmetic also has calendar semantics. Transaction-start `NOW()` is different from a fresh current-time observation. Qualify exact elapsed arithmetic and source occurrence rather than assuming `interval '30 days'`, `addDays`, local midnight or a JavaScript display result implements the selected profile in every zone. [PostgreSQL date/time functions](https://www.postgresql.org/docs/17/functions-datetime.html)

Workflow distinguishes elapsed, local-date and business-clock interpretation (`docs/prds/workflow-studio/03-runtime-and-recovery.md:61–67`). Its date-only expiry and DST-resolution guidance is for its qualified clocks; specialized clocks such as CMS appointments retain their explicit source rules. Its fixed expiry continues during pauses. Do not use worker pause, review status, proof outage or a business-calendar update to stop the newly selected ordinary elapsed clock.

## Missing, past and distant requested targets

An ordinary requested-by target remains separate under Q09:

| Situation                                          | Correct effect under a selected elapsed profile                                                                                                                                                                                   |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No requested-by target                             | The source can still resolve finite access from `I` and the selected profile. Do not fabricate a due date or treat access as forever.                                                                                             |
| Requested target is already past at issuance       | A target alone does not create a hard denial or shorten/extend permission. Source purpose/readiness and other actual rules still determine whether issuance is legitimate. Do not infer an authorization exception from lateness. |
| Requested target falls before the access end       | Q09 allows otherwise-authorized late intake until actual action authority ends, including review/acceptance constraints.                                                                                                          |
| Requested target falls after the actual access end | Do not silently extend authority to the target or promise submission until it. Expose the actual conflict to authorized source staff and qualify the cohort/terms; no automatic date-edit power follows.                          |
| Target changes after issuance                      | Preserve Q09 target/receipt history and Q11 original access result. No recomputation from the new target.                                                                                                                         |
| A genuine source hard cap is already ended         | No new currently usable admission merely because the nominal elapsed formula yields a future date. Q11's rejection/currentness rules apply.                                                                                       |

“Requested date plus a buffer” is therefore not a neutral default. It needs choices about buffer, absent/past/distant targets, an absolute maximum, target edits and source calendar interpretation. Without those choices it hides permission inside mutable task data. It is not the recommended ordinary calculation.

## Specialized fixed-source deadlines

An existing specialized source may already own a real program end, legal/purpose limit, exact fixed permission date or different cohort policy. Preserve its declared semantics. A narrower genuine cap constrains ordinary use where applicable; a separate specialized profile remains its owner's contract.

That is a compatible source alternative, not a fourth arbitrary staff override or permission to select a later date whenever the ordinary period is inconvenient. Do not silently replace a specialized absolute end with 30/60/90 days, broaden its scope, import its date-only convention into every ordinary request, or treat a later program target as permission to extend a fixed original result.

If a future source genuinely needs variable ordinary deadlines, that needs its explicit prospective calculation/authority contract. Q12 can choose one ordinary elapsed profile without deciding a general policy builder or per-request editor.

## Rollback, repair and qualification consequences

- A definitely rolled-back first issuance establishes no original admitted `I/U`; a subsequent authorized attempt follows Q11's current source checks. A committed issuance with an unknown/lost response recovers the same original values.
- Default/profile changes apply prospectively to qualified new effects. They do not extend existing requests during rollout, rollback, restore or same-intent replay.
- Source issuance already committed before delivery/entry repair keeps ticking under A. First successful notification, first visit and staff review do not reset or pause it.
- On-time receipt alone does not qualify completed access. If actual source fulfillment occurs after unfinished authority ends, Q10 preserves source work but does not revive recipient readback.
- Recovery after ordinary completed expiry remains Q08's separately qualified capability. Active unfinished-expiry recovery is still unselected; none of these counts assumes it exists.
- A chosen number is not activation proof. Representative delivery/recipient/reviewer/help journeys must show that the claimed cohort can use the actual remaining interval under genuine caps, without duplicate-request workarounds, unowned extensions or pressure to falsify completion.

No tests ran or product code changed. The founder can select the complete numeric profile as product judgment; implementation and usability evidence must then qualify it. Source authority, original effect identity, civil/elapsed meaning, scoped caps and evidence limits must remain explicit.
