# Phase29 Q07 research — completed-access duration and clock anchor

Read-only research, 20 October 2026. Checkout `/home/conrad/code/core`, HEAD `3d85897ebf1515008ef5c676b1c58a15422fb9ab`. Parent reports Q06 and amendments ratified and is updating the canonical records. Q06 requires a finite qualified completed-read policy but deliberately chooses neither duration, anchor nor renewal.

No code/schema/auth/provider/dependency changes, tests, credentials, private rows or file-byte reads. This note inspects existing clock/policy patterns and current official date/time semantics. It proposes a decision shape, not an implemented grant or a newly adopted number.

## Principal finding

The repository has reusable mechanisms for explicit finite expiry, bounded server validation and independent technical clocks. It has no discovered qualified native document-recipient completed-read policy. **No existing code default supplies the correct product day count.**

The most important design choice is a fixed, source-owned anchor. Recommend using the server-authoritative recorded normal-fulfillment instant for the exact completed request effect, deriving its completed-read end once under an explicit policy. Do not start or reset it at email delivery, first return, last activity, login, preview regeneration or retry.

That recommendation still needs source-grant semantics: completion cannot revive a recipient entitlement that already expired/revoked, override an earlier independent hard stop, or transfer access to a new recipient. An already admitted source worker may complete later without granting anyone new reading rights.

## Existing mechanisms and precise reuse limits

| Mechanism                                  | Current source                                                                               | Useful part                                                                                         | What must not be inherited                                                                                |
| ------------------------------------------ | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Explicit expiry input                      | `packages/api/src/eve/approval-budget/schema.ts:35–50`                                       | Offset-aware date-time input for a named, authorized operation                                      | Emergency override audience, privilege or duration                                                        |
| Source-bound expiry command                | `packages/api/src/eve/approval-budget/control.ts:177–204`                                    | Explicit expiry passed with server-derived identity to a source RPC                                 | Treating a client date or actor as authoritative for recipient access                                     |
| Persisted finite end and invariant         | `supabase/migrations/20260718015747_eve_approval_budget_policy.sql:88–105`                   | TIMESTAMPTZ expiry, creation provenance, constrained valid ordering/bound                           | Its 24-hour maximum; that is a budget emergency policy, not a completed-request window                    |
| Server validation and durable record/audit | Same migration`:587–653`, especially `613–635`                                               | Permission check, bounded expiry check, insertion and policy/audit record in the source transaction | New blanket override rights or automatic renewal; an override is a separately governed exceptional action |
| Expiry in current read                     | `packages/api/src/eve/approval-budget/store.ts:177–183`                                      | Active override query requires expiry greater than server application time                          | A UI cleanup job as the only denial mechanism; app/DB clock agreement still requires qualification        |
| Separate delivery, lease, retention ends   | `20260718093000_eve_email_discord_notifications.sql:108–131`                                 | Distinct delivery_expires_at, lease_expires_at and retention_expires_at; durable semantic keys      | Email delivery period or notification retention becoming participant read duration                        |
| Atomic bounded technical lease             | Same migration`:173–201`; `20260718083000_eve_engineering_health_monitors.sql:161–205`       | Current eligibility, explicit server/service clock input, finite lease, row locking/token identity  | Human grant expiry from worker lease duration; accepting arbitrary browser-supplied “now”                 |
| Worker claim clock                         | `packages/api/src/workflows/claims.ts:7–38`; `20260611181000_workflow_work_claims.sql:45–99` | Named finite coordination interval; source read authority remains separate                          | Its default 300 seconds or technical reacquisition semantics as human renewal                             |
| Replay retention-derived expiry            | `20260718022535_eve_retention_replay_tracer.sql:185–205`                                     | Explicit derivation tied to a recorded source category                                              | Retention as read permission; make_interval(days) as an unexamined elapsed-duration rule                  |
| Fail-closed qualification                  | `packages/api/src/generated-documents/purpose-catalog/availability.ts:65–148,232–305`        | Exact purpose, finite valid time checks, unknown/failed qualification denied                        | Official-purpose freshness defaults, durations or tax eligibility                                         |

The native source will need an explicit policy identity/version, authoritative anchor/effective end, exact recipient/request/action scope, permitted current-state checks and auditable source changes. This is a conceptual contract, not a decision to create particular tables or a general policy engine.

## What Q06 already forbids

`docs/features/files-documents/docs/adr/0006-bounded-completed-request-access.md:20–43` separates durable source fulfillment, narrowly allowed technical writes, finite recipient read policy and independently authorized worker completion after access ends.

Therefore Q07 cannot quietly implement any of the following:

- Every visit gives another N days.
- A new login, resent invitation or renewed browser session starts the completed period again.
- A completion retry records a new anchor.
- A worker completing after recipient access ended mints a fresh period.
- A changed current policy recomputes all old ends as now + N.
- Keeping an original under a hold permits reading until disposal.
- A metadata-only fallback remains privately readable after its permitted source scope ends.

New authority, extensions or renewal may be considered through a separate explicit source policy, but are not a side effect of choosing a duration.

## Anchor alternatives and their product consequences

| Anchor                                         | Consequence                                                                                                                      | Assessment for the ordinary default                                                                |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **One authoritative normal-fulfillment event** | The read-only follow-up period corresponds to the finished document task. Independent of delivery/read behavior.                 | **Recommended**, with non-revival and earlier-hard-stop constraints                                |
| Invitation/request issue                       | Duration may be mostly consumed during submission or staff review; gives one simple absolute lifetime                            | Coherent if deliberately chosen, but can leave little or no usable completed-read period           |
| Submission receipt                             | Read period runs while review is pending; corrections create ambiguity about resetting it                                        | Unsuitable as an implicit completion anchor; would require a different explicit product model      |
| Notification successfully sent/delivered       | Provider failures, indeterminate results or channel retries change the end; email delivery is not participant awareness          | Avoid as the ordinary source authority clock                                                       |
| First completed-page visit                     | Gives a full period to a late visitor, but an unvisited request may stay eligible indefinitely unless a separate hard cap exists | Adds a second clock and changes the finite-bound semantics; not the smallest default               |
| Last activity/session refresh                  | Creates a sliding entitlement that may never end and can be extended by automated traffic                                        | Conflicts with the chosen fixed finite direction absent a separate deliberate policy               |
| Source-specified absolute read-end instant     | Clear hard deadline, possibly set before completion                                                                              | Valid specialized source constraint; an earlier one must not be overridden by the ordinary default |
| Evidence retention/deletion                    | Reading lasts as long as any hold/reference/copy exists                                                                          | Already excluded: custody and participant authority have different purposes                        |

The completion anchor must identify the exact durable source effect, not a client-provided effective date, mutable task flag, imported timestamp with unknown provenance or whichever worker last finished. The source's meaningful historical completion date and the instant recorded by a transaction may differ; the selected anchor must name which one it uses. Do not call a PostgreSQL `NOW()` default the exact physical commit timestamp.

## Elapsed duration versus civil calendar time

This needs a precise choice even when UI copy says “days.”

**Recommended simple mechanism:** N elapsed 24-hour periods from the fixed source anchor, producing one absolute end instant. Display that instant in a clear localized date/time/timezone. Changing the viewer's timezone changes presentation, not the entitlement.

A tenant-local calendar-day rule is also coherent, but it must state the governing IANA zone, whether the cutoff is the same wall-clock time or end of a day, and how daylight-saving transitions/ambiguous times are resolved. “A month” also differs from 30 elapsed days. Do not accidentally introduce calendar semantics through an arithmetic helper.

PostgreSQL documents that calendar-day interval arithmetic can differ from 24-hour arithmetic across daylight-saving changes. It also distinguishes transaction-start `CURRENT_TIMESTAMP`/`now()` from statement and wall-clock time functions. These semantics matter to both anchor capture and expiry checks; a long-running transaction's start time is not a fresh check for each later streamed chunk. [PostgreSQL date/time functions](https://www.postgresql.org/docs/current/functions-datetime.html)

TIMESTAMPTZ stores an instant rather than preserving the original named timezone. If a chosen policy needs civil-time zone semantics/provenance, that zone must be represented explicitly; a timestamp alone is insufficient. The actual deployed PostgreSQL version/timezone was not queried in this task. [PostgreSQL date/time types](https://www.postgresql.org/docs/current/datatype-datetime.html)

JavaScript `setDate()` uses local calendar time and can cross DST with a different elapsed duration than a fixed-hour addition. It should not silently determine the product meaning of N days. [MDN Date.setDate](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/setDate)

The full implementation must reject nonfinite/invalid ends, use authoritative source/server time, and deny new affected operations at or after the effective end. Browser timers, provider URL expiration and background expiry jobs remain secondary, not the permission check.

## The grant-continuity trap

A completion-anchored policy is not permission to “give everyone a fresh grant when complete.”

Consider a recipient whose private source access ended while the organization continued independently authorized processing. The source later completes the work. Q06 explicitly permits that durable outcome but forbids renewing the recipient's access or leaking result/history through the expired entitlement. Q07 must preserve that case.

For an eligible ongoing source context, a completion-anchored read phase can be an explicitly pre-admitted policy transition: its end is computed from the original completion effect, under its policy version and existing recipient scope. That phase is different from a login renewal or a new invitation. The authoritative source must define its relationship to any earlier independent access cap.

A useful conceptual rule is:

> The ordinary completed-read end is determined once from the selected completion anchor and duration, subject to any earlier applicable source hard stop and all current restrictions. It never revives an ended entitlement or expands audience/evidence scope.

This is not a literal schema formula. If the source currently has one combined expiry for all phases, the owner contract must explicitly reconcile that model; a hidden `max(old_expiry, completion + N)` would be unauthorized extension. A `min` with the earlier hard stop is a safe upper-bound concept, but the absence of a cap must be understood through a qualified source policy rather than converted to infinity by implementation.

A resumed range, retry, late notification, regenerated rendition, reopened browser or idempotent completion read-back must use the same admitted effect and effective end. Future new source work or exceptional renewed authority must have its own explicit identity/policy; it cannot mutate the old completed scope as a convenience.

## Should Q07 choose anchor and count together?

**Independent judgment: anchor first is the cleaner next decision.** The anchor controls what the window means and whether it can revive or extend a previous grant. Thirty days from invitation, completion or first visit are different product promises. The code does not make one of those anchors already settled, and a day count alone would be incomplete.

A coherent bundled question is possible if the founder is explicitly selecting a complete ordinary policy such as “N elapsed days from one source-confirmed completion, never sliding or reviving ended authority.” In that case both anchor and number must be visible, compared on their own tradeoffs, and recorded as selected. Do not ask only “30 or 90 days?” and quietly assume completion as the anchor.

Because Q06 intentionally left both unresolved, this research prefers a short anchor decision now, followed by a focused count decision with owner/comparator/user context. That preserves one meaningful choice at a time and avoids using implementation defaults to decide product policy.

Suggested anchor framing:

“Should the ordinary completed-read window run once from the organization's source-confirmed completion, or should the request keep its previously fixed absolute access end even when review finishes late?”

- **Fixed period from normal completion — recommended:** aligns the follow-up window with the finished task; no sliding clock, no revival of expired/revoked authority, and earlier independent hard stops still apply.
- **Previously fixed source end:** simplest single deadline and less continuing exposure, but review may consume the entire completed-read opportunity.

First-visit/sliding designs are stronger complexity alternatives to explain, not necessary equal default choices.

## What can be said about a practical day count?

No inspected runtime, test or official date/time source establishes 14, 30, 60 or 90 days as the correct Asym default. Existing examples have unrelated purposes. The frequency of recipient return visits, difficult connectivity, staff review delay and support demand was not measured.

If parent research warrants a bundled proposal, **30 elapsed days after the fixed completion anchor is a reasonable candidate to grill**, framed explicitly as product judgment rather than a legal/security/industry requirement. It gives a finite follow-up opportunity without choosing a long-running archive. A shorter candidate reduces the period of potential access but increases the chance a late return needs help; a longer candidate increases convenience and ongoing private-read exposure/operating obligations. This note does not claim an optimal count or ratify that candidate.

Do not claim a month is necessary because users work monthly, or that a particular shorter period is proven secure. Source-specific restrictions still override the ordinary upper bound, and the qualification of current content is independent of how many days remain.

## Later proof implications, not tests executed

After the policy is chosen, prove the exact source anchor and durable effect identity; duplicate/lost completion responses; completion after expired recipient authority; earlier source hard stop; recipient/purpose changes; invalid/missing policy; DST/calendar/leap-day semantics; server/DB clock boundary; immediately before/at/after expiry; jobs paused; source policy changes and old grants; retry/return/login/help/preview regeneration without sliding; current metadata/original/range gates; and no retention/hold coupling.

An end-date display must match the effective server decision and acknowledge current restrictions without promising universal availability until that date. No implicit auto-renewal, expiry notice, new help queue or extension workflow is selected by a number.

No tests were needed for this next-question research, and no old test counts are reused. The native completed-read policy, deployed clock configuration and effective role/provider behavior remain unqualified. Parent owns final founder framing and source-owner reconciliation.
