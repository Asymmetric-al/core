# Phase29 Q12 A — 1,440-hour ordinary unfinished profile: runtime review

21 October 2026, Asia/Bangkok. Conrad selected the ordinary initial profile of up to sixty elapsed days: nominally **1,440 hours from original qualified source issuance**, preserving genuinely applicable earlier limits. The parent owns the consolidated adversarial review and ratification. This is implementation/qualification research, not a policy deployment.

**Disposition: retain the selected profile with exact time-unit/precision rules, scoped cap treatment, source-time/currentness, immutable admitted results and durable expiry enforcement.** The arithmetic is simple; the authority and representation boundaries are not supplied by the number.

Source reads and one small isolated Node platform experiment only. No new product tests, repository edits, installs, database queries, credentials, private data or provider operations. Networking was disabled for the experiment. Only this research note was written. Prior Q07 timestamp tests and Q10/Q11 test totals are not recounted.

## What this pass establishes

Inspected Core timestamp parser/comparator, purpose qualification, local formatting/task-date seams, Eve expiry SQL and E2E/provider expiry units. Q11's inspected current auth/role/service/ledger boundaries remain the adjacent implementation evidence; no qualified native sixty-day issuance implementation has appeared in these paths.

Official PostgreSQL 17, ECMAScript and exact Node `24.21.0` timer documentation were checked. PostgreSQL 17 is the committed local major-version family, not a verified hosted version. No actual PostgreSQL arithmetic, role/RLS behavior, locks, migration deployment or production clock was exercised.

## Exact quantity and its limits

The nominal duration is:

- 60 × 24 = **1,440 hours**
- **5,184,000 seconds**
- **5,184,000,000 milliseconds**

An ordinary initial candidate end is `I + 1,440 elapsed hours`, where `I` is Q11's qualified source issuance occurrence whose effect durably commits. The original admitted result and applicable source-limit evidence are retained. A numeric constant is not proof of a trustworthy `I`.

The value in milliseconds exceeds a signed 32-bit integer but is exactly representable as a JavaScript Number. Contemporary valid epoch-millisecond arithmetic is not inherently imprecise merely because it uses Number; the dangers are differing precision, unit conversion, calendar operations and unsupported input/ranges. Do not turn this into an unnecessary new numeric/time framework.

Sixty elapsed days is not two months, sixty local calendar-day changes, business days, a requested-target buffer or a sixty-day session/token lifetime. It does not pause for delivery, proof failure or staff review. It does not create a sender override, renewal or grace mechanism.

## Newly observed platform copying hazards

One credential-free, read-only Node `v24.21.0` process ran in a bubblewrap network namespace, with only a clean PATH/HOME/TMPDIR/TZ environment. The working directory was temporary storage; there were no repository imports, project file reads or provider calls. `TZ` was explicitly `America/New_York` to observe DST. The experiment printed observations, not a new product test suite.

| Observation                                                                         | Actual result                                                                                                                     | Relevance                                                                                                                                                     |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `2026-02-01T12:00:00-05:00` plus 1,440 elapsed hours versus `setDate(getDate()+60)` | Elapsed: `2026-04-02T17:00:00.000Z`, exactly 1,440 hours. Calendar: `2026-04-02T16:00:00.000Z`, 1,439 hours.                      | Local calendar-day mutation can shorten this selected duration across spring DST.                                                                             |
| `2026-09-15T12:00:00-04:00` with the same comparison                                | Elapsed: `2026-11-14T16:00:00.000Z`, 1,440 hours. Calendar: `2026-11-14T17:00:00.000Z`, 1,441 hours.                              | Calendar mutation can lengthen it across autumn DST.                                                                                                          |
| `2026-01-31T12:00:00Z` plus sixty elapsed days versus two UTC calendar months       | Elapsed: `2026-04-01T12:00:00.000Z`. Two months: `2026-03-31T12:00:00.000Z`, 1,416 hours.                                         | “Two months” is not the selected rule even without DST.                                                                                                       |
| Valid leap-day input `2028-02-29T12:00:00Z` plus elapsed duration                   | `2028-04-29T12:00:00.000Z`.                                                                                                       | Gregorian leap days are handled as actual days; this is different from leap seconds.                                                                          |
| `new Date("2026-02-30T12:00:00Z")`                                                  | Normalized to `2026-03-02T12:00:00.000Z`.                                                                                         | A finite result from a permissive Date constructor does not prove that the submitted calendar value was valid.                                                |
| Date-only versus offset-free date-time                                              | `"2026-01-05"` became `00:00Z`; `"2026-01-05T00:00:00"` became `05:00Z` in the isolated zone.                                     | Bare date and local date-time interpretation differ; neither supplies a source timezone/end-of-day policy.                                                    |
| Fractional timestamps `.000001Z` and `.000999Z`                                     | `Date.parse` returned equal millisecond values.                                                                                   | A JavaScript Date round-trip can collapse distinct database instants near an exclusive boundary.                                                              |
| Leap-second string and range overflow                                               | `2026-12-31T23:59:60Z` and Date-range maximum plus duration yielded `Invalid Date`.                                               | Unsupported source/input values must fail validation, not fall back to now or a default. No actual leap-second schedule is asserted by this synthetic string. |
| `setTimeout(callback, 5_184_000_000)`                                               | `TimeoutOverflowWarning` stated the delay was set to 1 ms. The callback ran at an observed 1 ms, before a 50 ms cleanup watchdog. | Sixty days cannot be represented by one ordinary Node timer. This is installed-runtime behavior, not a native expiry defect.                                  |

The timer was bounded by a cleanup watchdog and the whole subprocess by a ten-second timeout. The observed 1 ms is one local observation, not a callback-latency guarantee. No browser or Bun timer was tested.

**These observations prove platform semantics/copying hazards only.** They do not prove a native source end, database equality/precision, authorization, real clock synchronization, provider expiry, user flow or SQL race. No unit-test pass count is claimed.

## Concrete Core evidence

Paths relative to `/home/conrad/code/core`.

| Source                                                                                                     | Verified behavior                                                                                                                                           | Use and limit                                                                                                                                                                                          |
| ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/api/src/generated-documents/renderer-qualification/charter.ts:91–92,240–305`                     | Explicit-offset timestamp shape, calendar/leap-year checks, rejects seconds >59, computes whole epoch seconds and preserves the complete fractional string. | A useful strict timestamp precedent. It is local renderer-qualification code, not a qualified generic issuance parser or a reason to expose caller-supplied issuance time.                             |
| Same `charter.ts:308–322`                                                                                  | Compares whole seconds then padded fractional strings without Date millisecond truncation.                                                                  | Shows Core already recognizes precision-sensitive ordering. A native transport/DB contract must still define its own bounded accepted precision and conversion rules.                                  |
| `tests/unit/packages/api/renderer-qualification-timestamp-approval-contract.test.ts:47–110`                | Existing cases cover invalid/date-only/zone-less values, explicit-offset equality and sub-millisecond ordering.                                             | Read again for relevance; not rerun. Earlier Q07 test evidence is historical adjacent proof, not new Q12 qualification.                                                                                |
| `packages/api/src/generated-documents/purpose-catalog/availability.ts:78–114`; `admission.ts:37–66`        | Purpose checks parse times with Date and return an application-time admission stamp without allocating a document or access record.                         | Not an exact native deadline/current-role transaction. Reusing its timestamp conversion unchanged can lose finer precision.                                                                            |
| `packages/lib/hooks/use-locale-format.ts:20–40,97–120,137–174`                                             | Deterministic UTC server render, then browser locale/zone; special date-only display handling.                                                              | Reuse presentation intentionally, but never derive authority from formatted dates, hydration text or a visitor timezone.                                                                               |
| `packages/lib/hooks/use-tasks.ts:111–125,265–290`; `packages/api/src/missionary-portal/task.ts:25–58`      | Optional/mutable target, ISO conversion and local-day task classification.                                                                                  | No expiry calculation or guarantee of a source calendar. Q09 requested targets remain non-authorizing.                                                                                                 |
| `supabase/migrations/20260718022535_eve_retention_replay_tracer.sql:185–205`                               | Retention artifact end uses `NOW() + make_interval(days => retention_days)`.                                                                                | Different owner and calendar semantics. Do not copy its “days” expression or retention value into the selected elapsed access policy.                                                                  |
| `supabase/migrations/20260718015747_eve_approval_budget_policy.sql:79–100,613–637`                         | Technical approvals/overrides have their own hour-based end/constraints; override validity is checked before a later row lock, using `NOW()`.               | Useful explicit bounds, but not proof of actual-time checks after all relevant waits. Neither 24-hour default is changed to sixty days.                                                                |
| Same approval migration`:565–568`                                                                          | Locks decision row then uses transaction-start `NOW()` for expiry.                                                                                          | The clock remains the old transaction start after waiting. This is a source-confirmed copying hazard, not a demonstrated hosted incident.                                                              |
| `packages/api/src/eve/retention/control.ts:157–178`                                                        | Filters artifact owner/status/end, then asks for a 60-second signed URL.                                                                                    | Artifact validity, current access and provider capability are different. The literal 60 is seconds, not this sixty-day profile. No provider TTL should be extended merely to match the new source end. |
| `packages/auth/e2e-auth.ts:76–93,278–285`                                                                  | Test bypass expiry is signed epoch seconds using a test-only TTL.                                                                                           | An unrelated test mechanism and unit. Do not alter it, production JWT lifetime, cookies, OTPs, provider links or work leases to match 1,440 hours.                                                     |
| `packages/auth/context.ts:240–338`; membership RPC `20260802041500_current_user_memberships_rpc.sql:22–50` | Current user/profile and caller-only active memberships are read.                                                                                           | Preserve this accurate description from Q11; it is not simply JWT-role trust. It still does not establish source issuance capability atomically through a later wait.                                  |
| `packages/database/supabase/admin.ts:15–46`; `packages/api/src/shared/with-operation.ts:137–165`           | Auth/role context is established before a handler receives the service client.                                                                              | Domain currentness and immutable end enforcement remain the source mutation's responsibility, including privileged paths.                                                                              |

No current source block here qualifies native immutable `I/U`, the selected ordinary profile, or all per-action permission scopes. There is no justification for a broad search-and-replace of other TTL constants.

## Preserve cap scope rather than taking a global minimum

“Genuine earlier limits” means limits that actually govern the relevant stage/action. A naive `min(every expires_at)` is not a correct domain model.

| Existing limit                                   | Correct relationship to the ordinary profile                                                                                                                                                   |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| True whole-unfinished-stage source-access cap    | Constrains the admitted/effective unfinished opportunity under its actual scope.                                                                                                               |
| True overall purpose/security/access cap         | Applies to the relevant unfinished operations and, where genuinely cross-stage, to Q07 completed reading. It survives fulfillment.                                                             |
| Intake/submission/correction cutoff              | Can end those actions while independently authorized reads/review remain possible. It does not automatically expire every status/file view or prevent otherwise authorized source fulfillment. |
| Original-download or preview restriction         | Applies to that representation/action. One unavailable action does not imply all source rights ended.                                                                                          |
| Entry credential/session/OTP/provider URL expiry | Ends that technical proof/capability. Qualified recovery/re-entry may exercise still-valid source rights; it neither lengthens the old credential nor resets `I/U`.                            |
| Custody/retention/disposal boundary              | May make particular bytes unavailable through its owner; it is not by itself the recipient's original source-access period. Preserve holds and independent uses.                               |
| Worker claim/retry/reconciliation lease          | Governs the worker attempt, not recipient admission or deadline.                                                                                                                               |

Q10 remains exact: once timely eligible fulfillment is proved, the former unfinished-only end does not also clip the valid completed stage. Independently binding true caps still apply. After actual unfinished authority ended, later source completion cannot revive recipient access. No source worker or browser job may infer either result solely from a cached “expired” label.

The implementation need not create a general temporal-policy engine. It does need owner-defined, typed applicability sufficient to avoid treating unrelated end fields as interchangeable. P12's sole resolver, coarse tenant defense, mutation boundary and governed-read/egress contracts remain controlling.

## Precision, calendar and leap-second qualification

PostgreSQL timestamps support microsecond resolution, while ECMAScript Date time values have millisecond precision. If the source stores a finer `I`, an end or competing fulfillment occurrence, native computation/comparison must preserve that agreed precision or apply a deliberately qualified canonical precision at admission. Do not silently truncate one side during JSON/SDK conversion and then claim exact before/equal/after enforcement.

For example, two instants that differ within the same millisecond can compare equal in JavaScript after parsing. This may deny a valid boundary operation or admit an invalid one depending on which values are rounded and which comparison is used. The safe requirement is a consistent authoritative precision and trusted ordering, not an unsupported claim that every Date conversion creates an exploit.

Validate calendar fields and exact supported offsets, finite values, accepted precision, range and units before arithmetic. Check the result as well as the input. A constructor may normalize invalid dates; adding to a representable maximum may overflow. Date-only, zone-less, malformed or unsupported source instants must not become “now plus sixty days.”

Elapsed hours must be interpreted on the qualified platform timestamp timescale. ECMAScript time values use POSIX-like days and do not represent UTC leap seconds; PostgreSQL likewise does not handle leap seconds. The current strict Core parser rejects a seconds value of 60. Do not claim leap-second-aware physical SI-duration metrology, silently normalize a leap-second string differently across tiers, or add a custom clock library merely to restate this product period. Record and qualify the existing platform convention, invalid-input behavior and operational clock/skew handling. No future leap-second occurrence or new skew tolerance is chosen.

Gregorian leap years and leap seconds are different concerns. A valid February 29 can be handled while the source still requires an explicit contract for unsupported leap-second syntax. Local timezone/DST affects display and civil scheduling; it must not change the already admitted elapsed end.

## Current time, immutable issuance and races

Q11's source occurrence remains load-bearing. The numeric profile does not authorize a caller's `issued_at`, an old task timestamp, a provider event, first visit or transaction-start `NOW()` as `I`.

After relevant waits, the source must qualify actual current time and current issuer/recipient/policy/cap state at its authoritative issuance boundary. A further lock or material permission wait after an early time sample requires the appropriate recheck. Define source linearization, effect commit, rollback and unknown-commit recovery distinctly. An internal timestamp is not a physical database commit timestamp.

Same-intent replay first recovers original `I`, the admitted profile and end. They are outputs, not regenerated fields to compare against the intent. A new default, time zone, transport key, credential or delivery success cannot make another sixty-day period. Source/recipient/material policy conflicts still require the owner command's safe outcome.

At a completed transition, prove the original admitted source/recipient policy and exact current reviewed set at the original fulfillment occurrence, plus current authority before disclosure. Delayed valid completion evidence may materialize its original Q07 view after the unfinished boundary; late actual completion may not. There is no new sixty-day restart when rendering, restoring, reconciling or reissuing a link.

If a whole-stage true cap becomes restrictive during issuance, use one qualified source order. If only an action-specific restriction changes, preserve its actual scope rather than stamping the entire request expired. Snapshot freshness, scalar clock arithmetic and atomic identity all matter; none alone proves authorization.

## SQL, roles and structural enforcement

The profile is source-owned fixed policy, not a new client-writable `days`, end-date or override field. A valid old row must not be transformable into a different tenant/recipient, later original `I/U`, changed policy type or invented historical admission through a generic update or service route.

Qualify actual grants, column privileges, composed RLS, views/RPCs, definer ownership/search path, service invocation context and same-scope relationships. UPDATE/ALL policies can inherit `WITH CHECK` from `USING`; missing explicit text alone is not a flaw. BEFORE triggers can alter resulting rows. Browser policies do not replace source checks on a privileged mutation path.

Use appropriate required/state-dependent finite fields and integrity/uniqueness protection for the original effect. A SQL CHECK can accept null and is not continuously reevaluated as time passes; it cannot enforce live expiry by itself. A helper named “is current” or a trigger that only stamps `updated_at` does not make original facts immutable. Current permission remains checked at the protected action, including service/replay/worker paths.

The native schema/role implementation remains unqualified; no table layout, precision scale or new global lock is selected here. Preserve source/P12 ownership and current query budgets rather than adding an independent browser policy engine or a complete-history scan to every read.

## Durable scheduling, cache and provider boundaries

**Never schedule this end as one `setTimeout(5_184_000_000)` and trust its callback.** The installed Node runtime reduced that delay to 1 ms, matching its documented signed-32-bit timer bound. Process restarts and callback scheduling also make ordinary timers unsuitable for durable authority even when a delay fits.

Use persisted source instants and synchronous current checks; existing durable recovery/scheduling can perform bounded housekeeping or update projections under the same source policy. An early/late/lost wake cannot grant grace, revoke the wrong stage, delete evidence or create a new source end. Timer refresh and a retry sleep are not renewal mechanisms.

The milliseconds count also cannot be placed into a signed 32-bit database/API field; conversely, passing the seconds count to a millisecond API silently changes the interval. Specify units at every API boundary. This does not mean contemporary timestamp Number arithmetic itself requires BigInt.

Do not lengthen a JWT, OTP, cookie, entry verifier, provider URL or work lease to sixty days. Their independent supported lifetimes and current-use checks remain. Valid source authority may require proof renewal; proof renewal never resets the source interval. Cached success, dates, counts, range responses and stored idempotent JSON remain subject to current exact authorization.

## Derived bound and no hidden global cap

For the original ordinary profile without a narrower whole-stage limit:

`U = I + 1,440 hours`, eligible `F < U`, and `E <= F + 720 hours`.

Therefore `E < I + 2,160 hours` (strictly before ninety elapsed days). A narrower genuine limit can only reduce the relevant bound. This implication does not create a separate overall ninety-day cap, retention policy, guaranteed time or bound on separately authorized Q08 fresh access.

An intake-only cutoff must not be substituted for `U` in that reasoning as though it were the whole unfinished authority. Conversely, the mere existence of a later preview/read opportunity cannot keep submission/correction open after its own earlier limit.

## Necessary native qualification

The following are future proofs, not tests claimed passed here:

1. Exact source duration and units: 1,440 hours/5,184,000 seconds; nominal result and scoped earlier limits, with no per-request unselected override.
2. Spring/fall DST, month end, leap year, visitor/server timezone and locale changes; preserve the same admitted instant and correct display.
3. Invalid calendar/date-only/zone-less/nonfinite/overflow values and unsupported leap-second syntax; no normalization or now/default fallback creating authority.
4. Agreed DB/driver/JSON/application precision with just-before/equal/just-after cases below one millisecond where the source supports it.
5. Source clock after all relevant waits, candidate occurrence versus later commit, rollback and unknown commit; no caller or old transaction timestamp backdating.
6. True whole-stage cap, true cross-stage cap, intake-only cutoff, preview/original restriction, proof expiry and worker/retention limits remain distinct in issue, use and completion.
7. Immutable original effect and terms across same-intent retry, conflicting intent, new transport key, default change, recipient change and lost result.
8. Actual roles/grants/RLS/RPC/service/trigger paths reject forbidden transformed rows and privilege escalation; native context follows P12 rather than broad profile-role fallback.
9. Early/late/missing expiry jobs and process restarts cannot control authorization; the oversized timer cannot be used as the authority.
10. Valid timely fulfillment with delayed materialization versus actual late fulfillment, including source business completion without recipient admission.
11. Current metadata/count/history/replay/full/HEAD/range/conditional/resume/stream checks across the true action end and Q10 stage change; no cached success grace.
12. Migration/restore/rollback preserves original policy/end and genuine shortening; no restore-time sixty-day backfill or conversion of a specialized deadline.
13. Delivery/recipient/reviewer/help journeys fit the selected finite opportunity. No assumption that sixty days is empirically sufficient or that unselected extension/recovery will repair routine insufficiency.

## Official technical basis

- [Node 24.21.0 timers](https://nodejs.org/download/release/v24.21.0/docs/api/timers.html): delays above 2,147,483,647 ms become 1 ms; callbacks are not exact scheduling guarantees. The initially attempted latest-v24 alias was inaccessible in the web tool; the exact installed-version page was successfully read.
- [ECMAScript time values](https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-time-values-and-time-range): millisecond resolution, finite Date range and POSIX-like leap-second convention.
- [ECMAScript Date.parse](https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-date.parse): date-only versus offset-free date-time interpretation.
- [PostgreSQL 17 date/time types](https://www.postgresql.org/docs/17/datatype-datetime.html): timestamp precision and supported range; no hosted-version claim.
- [PostgreSQL 17 date/time functions](https://www.postgresql.org/docs/17/functions-datetime.html): calendar versus elapsed interval arithmetic, transaction/current time and lack of leap-second accounting.
- [PostgreSQL 17 policies](https://www.postgresql.org/docs/17/sql-createpolicy.html) and [constraints](https://www.postgresql.org/docs/17/ddl-constraints.html): effective policy/new-row semantics and limits of CHECK/null/time-dependent enforcement, previously verified in this session.

No official source establishes sixty days as the optimal ordinary Asym period. That remains Conrad's selected product judgment, with implementation and cohort usefulness still requiring the declared proof.
