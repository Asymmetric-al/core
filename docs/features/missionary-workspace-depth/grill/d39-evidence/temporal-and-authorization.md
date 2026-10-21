# D39 — Temporal and authorization adversarial review

Reviewed October 18, 2026 against repository
`9cada8f3d8ab59db391d3fd20df77fcadeb09813` and its research working tree.
This is an independent research contribution, not ratification, a formal source
contract, runtime qualification or an implementation change. No older program,
model, probe or verifier was executed. One fresh arithmetic illustration used
Python's standard `datetime`/`zoneinfo`; it does not test Core or PostgreSQL.

**Disposition recommendation: Accept with required amendments.** Anchor the first
window to the actual referral event for the continuing lineage. Keeping event
time separate from recorded/accepted time prevents delayed entry from granting
a fresh full period. During this review the parent asked the founder about the
date-only conflict; the founder selected **calendar-date deadlines for all New
referrals**, leaving Continued elapsed days unchanged. The final calendar
contract below explicitly replaces the initial elapsed-day recommendation and
resolves the product frontier; that earlier analysis remains here as rationale.

## Governing evidence and current reality

| Evidence                                                                                                                                                                                                                                                                                                                                                                        | What was checked and its consequence                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Q39](../phase28-q39-initial-referral-clock-research.md)                                                                                                                                                                                                                                                                                                                        | The scenario has a known original date and no previously accepted window. It explicitly requires resolving date-only/unknown facts and first late-admission policy selection. It does not select an arbitrary midnight or new tenant clock mode.               |
| [D38 C02, C05–C11](../phase28-d38-separate-referral-periods-adversarial-review.md#exact-required-amendments)                                                                                                                                                                                                                                                                    | Independent New/Continued positive whole elapsed-day settings; no implied numeric default; separate original/recorded/accepted times; preserved accepted windows; source-owned acceptance and authority.                                                       |
| [D36 C04–C13](../phase28-d36-configured-referral-period-adversarial-review.md#exact-required-amendments)                                                                                                                                                                                                                                                                        | Continuation's fresh trusted acceptance instant, exact 86,400-second days and exact expiry remain binding. Ordinary edits do not move accepted dates. Original date is not the continued-window start.                                                         |
| [D35 C03–C10](../phase28-d35-referral-continuation-adversarial-review.md#exact-required-amendments)                                                                                                                                                                                                                                                                             | Exact current eligible responsibility; one successor per expired cycle; truthful lineage; deliberate continuation; retry returns the original result.                                                                                                          |
| [D34 C03–C10](../phase28-d34-expired-referral-history-adversarial-review.md#exact-required-amendments)                                                                                                                                                                                                                                                                          | Limited history requires prior authorized work plus current authority. A late record cannot invent historical access. Missing dates are not proof of expiry or ongoing access; mistaken-expiry correction is a separate source command.                        |
| [P9 A4](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:353), [A17](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:581), [owner constraint](../../../../prds/program-roadmap/owner-constraints.md:81)                                                                                                      | One native tenant-scoped referral relationship with history. Native mutation, audit and required activity commit together; no generic provider command journal or payment idempotency-header reuse.                                                            |
| [P12 authorization context](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1552), [ADR-0209](../../../../adr/0209-static-field-policies-and-subtract-only-projection.md), [ADR-0210](../../../../adr/0210-code-authoritative-capability-foundation.md), [ADR-0211](../../../../adr/0211-distinct-human-approval-for-projection-widening.md) | Current tenant/scope/capability and field projections govern. Names and role strings are not future capability authority. Do not turn a factual date edit into a projection-policy widening bypass, or require a new routine maker-checker flow for all dates. |
| [OpenSpec current/intended distinction](../../../../../openspec/project.md:6), [CRM boundary](../../../../../openspec/specs/crm-core/spec.md), [identity and access](../../../../../openspec/specs/identity-and-access/spec.md:45)                                                                                                                                              | Accepted source intent and actual enforcement are separate evidence. Business logic belongs in `packages/api`, not a browser clock or task DTO.                                                                                                                |
| [Current missionary donor mutation](../../../../../packages/api/src/missionary-portal/donor.ts:174), [portal role/admin-client wrapper](../../../../../packages/api/src/missionary-portal/route-helpers.ts:14), [donor model](../../../../../packages/api/src/missionary-portal/model.ts:150)                                                                                   | Existing tenant/assignment/anonymity checks are useful current safeguards, but the broad donor model and person-wide status mutation do not implement referral lineage, period policy or immutable accepted window facts.                                      |
| [Current organization settings](../../../../../packages/api/src/admin/org-settings.ts:9)                                                                                                                                                                                                                                                                                        | A fixed tenant identifier and role-gated visibility PATCH exist. They are a concrete unsafe template for new referral policy; this review does not claim a demonstrated deployed exploit.                                                                      |
| [Current browser grants](../../../../../supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:157), [revoked task table](../../../../../supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:265)                                                                                                                                      | Grants differ by relation. Neither a broad donor read grant nor a server-only task table proves a referral projection/write path. Full effective migrations, grants and deployed paths remain unqualified.                                                     |

Fresh case-insensitive searches for `referral`, `continuation` and `introduction`
in `packages/api`, `packages/database`, `supabase/migrations` and
`apps/missionary` produced no matches. This bounded static observation is not a
claim of global absence or deployment state. The active
[Partner roster change](../../../../../openspec/changes/fix-missionary-partner-roster-safety/proposal.md)
addresses donor-row privacy and presentation, not an implemented referral clock.

## Primary technical verification

The repository [Supabase skill](../../../../ai/skills/supabase/SKILL.md) was read
along with backend/API/Supabase rules. Relevant official pages were freshly
opened on October 18. Local [configuration](../../../../../supabase/config.toml:34)
selects PostgreSQL 17; the actual deployed engine and grants were not inspected.

- [PostgreSQL 17 date/time types](https://www.postgresql.org/docs/17/datatype-datetime.html): a date is not a timestamp; timestamp type and timezone conversion matter. A `timestamptz` normalizes the instant without retaining the originally supplied zone, so source zone/precision evidence must be preserved separately when needed. Infinity is a supported special value and must be rejected where finite endpoints are required.
- [PostgreSQL 17 date/time functions](https://www.postgresql.org/docs/17/functions-datetime.html): calendar-day interval arithmetic can differ from 24 elapsed hours across daylight-saving changes. Transaction time differs from fresh wall-clock time. Use checked source arithmetic and one qualified trusted acceptance instant after required waits.
- [PostgreSQL 17 row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html) and [CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html): effective grants, policy composition and privileged paths all matter. `ALL`/`UPDATE` can inherit `USING` as the missing `WITH CHECK`; the skill's shorthand claim that absence necessarily permits ownership reassignment is not adopted. Inherited new-row checks still do not enforce column immutability or a valid lifecycle transition.
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) and its [explicit-grants change](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically): table exposure and row filtering are separate. Explicitly qualify privileges, views, functions and server-role paths rather than assuming an environment's defaults protect new data.

No external technical documentation selects a ministry's event-date convention,
numeric duration or historical policy. Those remain product/source semantics.

## Initial elapsed-day alternative examined before clarification

**Not the selected final New-period contract.** This section records the exact
alternative that exposed the date-only problem. The founder's subsequent
calendar-date choice and the contract below supersede its duration arithmetic.

Let `G` be the preserved original referral event for this lineage, `A` the trusted
instant of first qualified acceptance in Asym, `N` the accepted New period, and
`E` its endpoint. With an exact qualified source instant:

1. Verify this is genuinely the initial window, not an existing/imported window
   or disguised continuation. A missing local row alone is not sufficient proof.
2. Preserve any previously accepted source window and terms exactly. For a
   genuinely new acceptance, recommend applying the **current New policy at A**,
   retaining its identity/revision and saying which period was applied then.
   Do not present that policy as the policy historically in force at `G`.
3. Compute `E = G + N × 86,400 seconds` with checked finite arithmetic. `G` must
   describe a past or current known event, not a scheduled future introduction.
   `A` does not replace `G`; import, retry, edit, reassignment and view times do
   not replace either fact.
4. At acceptance, if `A < E`, only the remainder is potentially active under
   current source/access rules. If `A >= E`, record the truthful ended window
   without a transient Active state or temporary disclosure. Further work uses
   eligible authorized continuation; saving cannot bundle an unreviewed renewal.
5. The historical interval `[G,E)` does not assert the user had Asym permission
   before `A`. Do not backdate grants, contactability, operational events, activity
   credit or access history. Source event and system acceptance answer different
   questions.
6. No existing accepted `E` is recalculated after an ordinary policy change.
   Changing `N` later can affect genuinely later first acceptances, anchored to
   their own original events, but never recreate the first window of an accepted
   lineage. This is prospective policy selection, not historical policy repair.

This is a recommended exact amendment for first adoption, not evidence that D39
already chose a historical-versus-current policy. The chosen rule must appear in
the corrected decision rather than being buried in an implementation task.

Illustrative arithmetic checked afresh (not Core runtime proof): original
`2026-10-01 10:00Z`, first acceptance `2026-10-18 10:00Z`, `N=7` gives
`E=2026-10-08 10:00Z`, already expired. With `N=30`, `E=2026-10-31 10:00Z`, only
13 elapsed days remain. Neither case starts 7/30 fresh days on October 18.
Original `2026-03-07 12:00-05:00` in New York plus two elapsed days ends
`2026-03-09 13:00-04:00`; retaining noon would instead use calendar arithmetic.
The example numbers are not proposed defaults or tenant limits.

## Date-only alternatives examined and resolved by clarification

Requiring Maya to remember an exact historical time is likely to encourage
invented precision; that is a reasoned UX risk, not observed user-study evidence.
Silently making a date midnight or using the browser's current timezone has the
same integrity problem. Q39 A alone cannot determine the missing instant.

| Option                                                        | Benefit                                                                                                                                                                 | Cost and verdict                                                                                                                                                                                                                                     |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Explicit fixed day-bound convention for a known original date | One date input and one predictable endpoint; no false memory requirement. Preserve date-only precision and distinguish computed policy boundary from actual event time. | Best practical candidate, but start-of-day vs end-of-day and the source timezone are substantive semantics requiring explicit adoption. They must not be hidden as normalization. Do not add a tenant-selectable clock-mode matrix.                  |
| Preserve an uncertainty interval                              | Honest about the range of possible instants and expiry.                                                                                                                 | Requires an ambiguous boundary state: a date-only record can be possibly active but not demonstrably active near expiry. More explanation and repair, a poor default for the requested simple UI. Do not casually add a third interval timer engine. |
| Require a precise event instant for all active work           | Simple exact arithmetic and clear evidence.                                                                                                                             | Poor ordinary manual-entry UX; may permanently block legitimate known-date referrals or force guesses. Suitable only for exact machine evidence, not a product-wide default.                                                                         |
| Preserve date/unknown evidence without calculating a window   | Avoids fabrication and allows records to remain truthful while qualified source repair is needed.                                                                       | Safe fallback for genuinely unknown/unresolvable facts, not a complete everyday date-only design. No new Active or Expired claim and no invented predecessor cycle merely to unlock Continue.                                                        |

For date `D` in a known source zone, possible instants lie in `[B0,B1)`, bounded
by the actual start of `D` and the next local date. The width is not always
86,400 seconds: freshly checked New York examples are 82,800 seconds on
March 8, 2026 and 90,000 seconds on November 1, 2026. A date does not give one
exact `G`. Using `B0` creates an earlier conservative endpoint; using `B1`
gives extra time compared with many actual instants. Choosing calendar end-of-day
also changes elapsed-day semantics if done after duration addition. No database
type can resolve that product trade-off.

The parent presented a meaningful clarification and the founder selected
calendar-date deadlines for all New referrals. This avoids both a guessed
historical time and two competing New-period conventions. Preserve unknown
dates honestly, give the user a helpful existing source correction route, and
do not invent a new queue, approval layer or arbitrary retention extension.

## Selected calendar contract and temporal challenge

The chosen amendment changes **D38 New only** from elapsed days to calendar
dates; D36 and D38 Continued remain exact 86,400-second elapsed days from trusted
acceptance. Staff helper text and the glossary must state the difference.
The product input remains two integer day fields, not a per-referral date picker
or tenant-selectable clock mode.

The parent proposed inclusive counting. This reviewer recommends its explicit
adoption: the original referral date counts as day 1. For accepted original
business date `D`, positive integer New period `N` and frozen organization policy
timezone `Z`, the last nominal calendar date is `D + N - 1`. The exclusive expiry
instant `E` is the first valid instant on or after the beginning of calendar
date `D + N` in `Z`. At `E`, it is expired. One day can therefore expire shortly
after the event when the event occurs late that day; it does **not** promise 24
hours of work. The staff help and Maya's computed endpoint must make that clear.
No extra full day is appended after the original date.

Apply the explicitly selected **current New policy and qualified organization
timezone at first actual acceptance**, retaining their accepted evidence. For a
known precise source instant, derive `D` in that organization calendar while
preserving the actual original instant. For a qualified date-only source, retain
`D` as a date and preserve its precision/provenance; do not cast it through UTC
or manufacture an original instant. A date from an external source with different
date semantics must be qualified before it is treated as this business date.
For example, converting "October 1 in another zone" to the organization's date
requires an actual instant or an explicit source-date interpretation, not a
midnight guess. Known source meaning must not be silently relabeled.

Use the already qualified organization timezone, visibly named in the relevant
settings and endpoint. It is not a geolocation claim about Maya. Missing or
unqualified zone blocks only new dependent acceptance; no browser/system-zone
fallback. Policy/zone edits affect future acceptances, not already accepted
`D/N/Z/E`. Store the accepted instant `E` as authority, with the calculation
evidence needed to explain it; later timezone-database updates cannot recalculate
it silently. Source corrections remain separate, attributable commands.

Boundary rules need precision without imposing extra user controls:

- Missing midnight: use the first real instant of the target date.
- Repeated midnight: choose the earliest real occurrence.
- Entire target date skipped by civil-time history: choose the first instant of
  the next existing date. Never accept the database's ambiguous default blindly.
- A claimed original date that never existed in the selected calendar cannot be
  accepted as a physically observed local date without resolving its source
  meaning. Preserve original evidence; no fabricated midnight or forced user
  guess. An exact original instant always yields an actual local date.
- Format actual `E` with the applicable offset and zone. If an unusual skipped
  nominal last day would make "through [date]" misleading, use the actual
  "Follow-up ends [date/time/zone]" wording. This is display fidelity, not a new
  state or extra duration setting.
- Calculate and preserve finite validated results at source precision. An
  unavailable original date does not get an initial window or invented Expired
  predecessor to make Continue available. Future original dates are not past
  referrals; source error feedback must preserve entered evidence for correction.

### Fresh boundary illustrations

The following were freshly checked in Python `zoneinfo`. For each endpoint,
the localized instant one second before `E` lies before the target boundary date
and `E` lies on/after it. This is independent arithmetic evidence, not a portable
implementation algorithm, PostgreSQL proof or actual Core test. PostgreSQL and
the deployed timezone-data version must prove these outcomes separately.

| Original date; N | Zone              | Last nominal date | Actual exclusive E  | Significance                                                           |
| ---------------- | ----------------- | ----------------- | ------------------- | ---------------------------------------------------------------------- |
| 2026-03-08; 1    | America/New_York  | Mar 8             | Mar 9 00:00 −04:00  | The original day is 23 elapsed hours; calendar semantics remain clear. |
| 2026-11-01; 1    | America/New_York  | Nov 1             | Nov 2 00:00 −05:00  | The original day is 25 elapsed hours; no 24-hour promise.              |
| 2028-02-28; 2    | UTC               | Feb 29            | Mar 1 00:00Z        | Leap day and inclusive original-day counting.                          |
| 2026-10-01; 30   | Asia/Bangkok      | Oct 30            | Oct 31 00:00 +07:00 | Thirty calendar dates, not through Oct 31 plus an extra day.           |
| 2018-11-03; 1    | America/Sao_Paulo | Nov 3             | Nov 4 01:00 −02:00  | Target-date midnight did not exist; first actual instant is 01:00.     |
| 2020-10-31; 1    | America/Havana    | Oct 31            | Nov 1 00:00 −04:00  | Midnight repeats; earliest occurrence governs.                         |
| 2011-12-29; 1    | Pacific/Apia      | Dec 29            | Dec 31 00:00 +14:00 | Target Dec 30 never occurred; next real date begins at E.              |

The historical examples stress timezone behavior and are not suggestions that
these old records should become active. They also expose why simply appending
00:00, adding milliseconds or using server-local timezone is insufficient.

## Concern register and exact safeguards

Likelihood is reasoned exposure if omitted, not a measured incident frequency.
All concerns below narrow/amend A; none rejects the original-event anchor.

| Concern and consequence                                                                                       | Severity / likelihood; evidence                                                       | Exact amendment or acceptance requirement                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Late entry is accidentally fresh time; old contacts regain eligibility merely through import.                 | High / likely if created-at is reused; Q39 and D38 explicitly separate clocks.        | **Initial expiry SHALL use the qualified original referral event for the same lineage. Ingestion, creation, viewing, ordinary edits and reassignment SHALL NOT create a fresh initial period.**                                                                                                                                                                                                          |
| Date-only input is silently made exact or interpreted in a different zone.                                    | High / plausible; PostgreSQL conversion rules and missing time evidence.              | **Use the adopted New calendar-date rule, preserve source precision and qualified business-date meaning, and freeze the applied organization zone and endpoint. Unknown facts SHALL remain unknown. No hidden browser/session-zone, fabricated original midnight, current-time or approximate-date substitution.**                                                                                       |
| Today's policy is misrepresented as historical policy; existing windows are recomputed.                       | High / plausible; D38 accepted history.                                               | **Preserve accepted source terms. For genuinely first acceptance use the explicitly selected policy-selection rule, record the applied revision and acceptance time, and never claim unverified historical applicability. Later settings SHALL NOT recalculate accepted endpoints.**                                                                                                                     |
| Backdated source interval implies historical system authority.                                                | High / plausible; current tenant/access contract and D34 prior-work rule.             | **Original-event chronology SHALL NOT backdate access, grants, consent, recorded activity, active-work admission or attribution. A late expired row SHALL satisfy D34 history admission independently; insertion does not manufacture earlier authorized work.**                                                                                                                                         |
| A correction becomes an ungoverned date extension, or a refused correction leaves false source facts forever. | High / plausible; D34 correction and D36/C38 preserved-history contracts.             | **Correct source facts through the separately authorized, revision-checked history-preserving source command. Preserve before/after evidence and applied terms; distinguish genuine correction from requested more time. Ordinary date/status PATCH cannot renew, erase expiry, consume a cycle or retroactively alter an already accepted successor. Re-evaluate current projection after correction.** |
| Same person/referrer is used as lineage identity, or a new row bypasses prior expiry.                         | High / plausible; P9 relationship identity, CRM weak-match rules.                     | **Source identity/provenance SHALL establish the continuing lineage and at most one initial window. Import row identity and request keys do not replace business identity. Do not automatically merge referrals by name; ambiguous prior-window/lineage evidence requires source resolution rather than a fabricated initial window.**                                                                   |
| Concurrent acceptance, policy changes, correction or continuation create inconsistent terms.                  | High / plausible; D35–38 qualified ordering.                                          | **Initial acceptance SHALL order the exact source/revision, current New policy and relevant authority in one qualified transaction after waits. Commit one initial effect, required audit/activity and minimal recovery evidence together. A change to unrelated Continued policy alone SHALL NOT invalidate initial intent.**                                                                           |
| Retry after lost response creates another window or a later end; replay after Off restores rejected action.   | High / plausible on low-bandwidth/mobile; D35 recovery contract.                      | **Recovery SHALL return the original currently permitted outcome for the original exact lineage/action/revision; it SHALL NOT compute another window or consume a later cycle. Definitively rejected intent stays no-effect through its admissible lifetime.**                                                                                                                                           |
| UI or delayed worker serves active data past exact expiry.                                                    | High / plausible; D34/D36 source expiry.                                              | **At trusted time E the window SHALL be expired regardless of cached flags or cleanup lag. No temporary Active state for late acceptance with E <= A. Revalidate source authority before protected disclosure/action; stale cycle jobs cannot end a successor.**                                                                                                                                         |
| Service role, generic PATCH or permissive RLS transforms a visible row into forbidden ownership/kind/state.   | Critical / plausible if current generic patterns are reused; fresh source inspection. | **Trusted server context SHALL derive tenant/actor/attribution and qualified authority. Source operations SHALL reject caller-authoritative lineage, accepted terms and ownership fields. Test effective grants, old/new-row RLS, column mutation paths, views, RPC EXECUTE/search_path and privileged bypass routes for equivalent semantics.**                                                         |
| Timing data reveals location or private history through errors, previews, export or audit copies.             | High / plausible; ADR-0209 and D34 narrow projection.                                 | **Timing/precision/zone/provenance fields SHALL be classified and disclosed only for the current permitted purpose. A zone need not reveal a missionary location. No protected raw context in diagnostics, hidden DOM, response fields, logs or generic errors.**                                                                                                                                        |
| Migration/restore invents original time or changes a lineage into a first window.                             | High / plausible; data exists outside newly built paths.                              | **Inventory original precision, source windows and meanings before migration. Preserve qualified facts, isolate unqualified paths, reject unsafe old writers, and reapply restrictions on restore. Rollback stops affected acceptance without erasing or recomputing accepted history.**                                                                                                                 |

## Structural database contract to require, not a proposed new schema

- Non-null trusted tenant, exact source/lineage and accepted-kind identifiers;
  tenant-aware foreign relationships to relevant parties, policy evidence and
  source cycles. Neither a UUID nor an RLS predicate makes a cross-tenant FK safe.
- Positive finite integral duration and finite endpoints, explicit temporal
  precision states, valid required/absent combinations. SQL CHECK permits null
  unless separately constrained; required facts need null protection. A nullable
  unique key cannot be assumed to prove the one-initial-effect invariant.
- Structural uniqueness for one initial window per true source lineage and one
  successor per consumed expired cycle; qualify native active-edge invariants
  without preventing legitimate distinct referral events. Indexed same-tenant
  relationship/revision lookups and bounded source pages; no all-history sweep
  when policy is edited.
- Trusted accepted policy/time/actor/lineage cannot be ordinary writable columns.
  Two separately allowed old/new rows do not prove that moving between them is
  legal. Do not encode current time, mutable permission or policy lookups inside
  row CHECKs as if immutable.
- Policy replacement/deletion cannot cascade accepted history away. Retain
  minimal required attribution and corrective history under owner retention;
  append-only business history does not authorize retaining private context
  forever. No new money, currency or attachment schema is needed.
- Table/column grants, permissive and restrictive policies, security-definer or
  invoker behavior, RPC grants/search paths and privileged service routes require
  actual test evidence. RLS `USING`/`WITH CHECK` equivalence does not prove
  authorization after a related grant/policy changes concurrently.

## Proof cases required in the later authorized implementation

1. Same original event recorded immediately and late retains the same anchor;
   preserve any already accepted source endpoint. Show only remaining time.
2. Late first acceptance with `A = E` and `A > E` never exposes Active even
   transiently; valid continuation remains independently permission-gated.
3. Date-only, unknown date, date with unknown zone, ambiguous/nonexistent local
   time, future event and unsupported precision follow the adopted explicit rule;
   no coerced timestamp and no invented historical contact authority.
4. Leap day, midnight, DST-forward/backward, travel/display-zone changes, storage
   precision boundary and arithmetic overflow preserve the source meaning.
5. Current-New policy at first acceptance is recorded as applied then; historical
   accepted policy is preserved. A New policy edit cannot rebase prior E; a
   Continued-only edit cannot spuriously conflict with initial acceptance.
6. Concurrent first admissions under different request IDs yield one effect;
   late response recovery returns it. Policy/access/correction changes before
   acceptance force current source checks; rejected intent does not later revive.
7. Reassignment, Party merge, re-import, external ID collision and genuinely
   distinct repeated referral events preserve proper lineage without name-based
   automatic merging or a second first window.
8. Correct mistaken source facts with retained before/after evidence; concurrent
   correction/continuation cannot overwrite the successor. Ordinary edits cannot
   masquerade as correction or extra time.
9. Cross-tenant, wrong membership/assignment/scope, forged actor, browser raw-row,
   RPC/view/service-role and old-row-to-forbidden-new-row probes fail. Denial
   must not disclose another referral or protected timing/location context.
10. Source commit plus failed response/read refresh remains recoverable; audit or
    required activity failure rolls back the authoritative transaction. No fake
    successful UI or emergency direct database repair path.
11. Mixed-version migration, unconfigured New policy, rollback, restored backups
    and delayed expiry jobs preserve historical outcomes and current restrictions.
12. Actual source/database tests and mobile/keyboard/screen-reader comprehension
    proof are required; this document and fresh arithmetic do not substitute.

## Proportionate operational signals

These are proposed release conditions/monitoring responses, not installed alerts.

| Signal                                                                                     | Threshold                | Owner role                       | Response                                                                                                                   |
| ------------------------------------------------------------------------------------------ | ------------------------ | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Duplicate accepted initial window or successor for one source identity                     | Any confirmed occurrence | P9/API owner                     | Restrict affected acceptance; preserve evidence; repair through source correction and close the concurrency gap.           |
| Ordinary edit/import changed an already accepted endpoint or fabricated original precision | Any confirmed occurrence | P9/import owner                  | Stop affected writer/import path; assess impacted source revisions; restore truthful history through qualified correction. |
| Unauthorized timing/context release or accepted mutation                                   | Any confirmed occurrence | P12 security owner with P9 owner | Restrict affected path, investigate exact scope and policy; preserve minimal security evidence.                            |
| Source arithmetic and stored endpoint disagree                                             | Any confirmed occurrence | P9/API owner                     | Block affected producer, investigate precision/unit conversion, reconcile through attributable correction.                 |

The date-only product fork was explicitly answered. Qualification of the adopted
calendar contract and native source producer remains a **pre-activation gate**,
not a risk that can be placed in monitoring. The final design should keep
staff's two existing period fields and Maya's source-aware date/status/next
action; temporal correctness does not justify another dashboard, generic timer
service, permission system or review queue.
