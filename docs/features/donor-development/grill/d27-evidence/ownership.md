# D27 ownership — actual personal contact, distinct from outreach

2026-10-11 UTC. Focused research against HEAD
`225c02e9499bd6c0d493223cd4b1a4120ff787e3`. The founder selected Q27 A and
requested researched UX review. **Recommendation: accept A with the source and
meaning clarifications below; no additional founder micro-decision is needed.**
This appendix changes no formal contract, implementation, permission or live
state. It does not claim a qualified contact measure already exists.

## Decision and governing evidence

- **Selected meaning:** [Q27:31–45](../phase27-q27-meaningful-contact.md:31)
  counts completed conversations, meetings and substantive replies; purposeful
  outbound messages remain visible as outreach without resetting the main date.
  [48–75](../phase27-q27-meaningful-contact.md:48) preserves voluntary use,
  occurrence dates, incomplete knowledge, privacy and separate `lastTouchAt`.
- **P27/P28:** [Roadmap:4091–4103](../../../../prds/sitestacker-parity/roadmap.md:4091)
  distinguishes next-action health, relationship context and source-owned facts.
  [4167–4181](../../../../prds/sitestacker-parity/roadmap.md:4167) requires completed
  interactions recorded once and gives P9 the interaction source, P27 development
  meaning and P28 a permitted shared view. A source event and the development
  measure derived from it are different authorities.
- **D26's ratified boundary:** [R10:320–327](../phase27-d26-adversarial-review.md:320)
  permits truthful source-recorded encounters to support separately qualified
  contact measures but forbids contact from save/read/share alone.
  [Owner clauses:144–177](../phase27-d26-adversarial-review.md:144) preserve the
  exact audience/history grant and voluntary contribution without quotas,
  performance rankings, compulsory reporting or manager approval.
- **P6:** [A1–A7:135–151](../../../../prds/sitestacker-parity/phase-06-shared-communication-event-model.md:135)
  owns body-free communication facts with source-owned payloads, actual recipient
  copies and qualified Party attribution. Sent, delivered, opened and clicked are
  different evidence; related-record linkage grants no access or participation.
- **P17:** [ADR0031:18–57](../../../../adr/0031-body-free-history-with-expiring-recent-copy.md:18)
  preserves body-free facts separately from expiring Recent sent copies. Copies
  are not truth, retry material or an indefinite search/export archive.
- **P26:** [2705–2725](../../../../prds/sitestacker-parity/phase-26-support-hub-requirements-a.md:2705)
  distinguishes actual correspondence from relevance, address matching and
  asserted representation; current joint authority precedes counts and sorting.
  [4647](../../../../prds/sitestacker-parity/phase-26-support-hub-requirements-a.md:4647)
  expressly excludes automated acknowledgments from meaningful stewardship-touch
  metrics. [9681–9687](../../../../prds/sitestacker-parity/phase-26-support-hub-requirements-b.md:9681)
  distinguishes trusted recording from reported occurrence and rejects turning
  legacy activity rows into universal encounter authority.

## Current source: useful seams, not proof of D27

1. [CRM model:58](../../../../../packages/api/src/admin/crm/model.ts:58) maps
   `lastTouchAt` to `donor.updated_at`. The [owner-conflict register:772](../phase27-grill-log.md:772)
   already preserves the broader operational meaning rather than silently
   replacing it with meaningful contact.
2. [Missionary activity writer:120–142](../../../../../packages/api/src/missionary-portal/donor.ts:120)
   checks donor access and writes type/title/note with the current save time.
   This command does not establish an actual completed encounter, separate
   reported date precision, qualified ministry/purpose participation or the
   D26/D27 source contract merely because an activity kind says Call.
3. [CRM detail:279–284](../../../../../packages/api/src/admin/crm/detail/service.ts:279)
   takes 50 activity rows; [446–461](../../../../../packages/api/src/admin/crm/detail/service.ts:446)
   composes them using activity date, creation-time and epoch fallbacks.
   [Missionary roster:532–541](../../../../../packages/api/src/missionary-portal/donors.ts:532)
   also loads capped related activity. These display lists cannot establish a
   complete maximum over qualified contact evidence or turn absent history into
   “never contacted.” No database, provider or deployed permission was queried.

## Required clarifications and focused risk review

### C1 — Contact is an actual event, not proof of a captured message pair

**High impact; plausible false-negative during imports and off-platform work.**
The selected “exchange” must not require both sides to exist in Core. A genuine
human inbound contribution about the partnership can itself establish personal
contact, including an initiated inquiry, decision or substantive response to
earlier off-platform outreach. A qualified manually recorded completed phone or
in-person conversation is equally valid; no transcript, recording or provider
receipt is compulsory.

**Exact clause:** “Count qualified evidence of an actual completed personal
conversation/meeting or substantive human inbound exchange for this partnership.
Do not require a preceding recorded outbound message or a synchronous round
trip. Preserve whether the evidence is source-observed or human-reported.”

“Substantive” must not become a word-count, favorable-sentiment or fundraising
success test. A short genuine personal acknowledgment or decline can qualify
when it is a relevant human exchange; changed circumstances or a scheduling
response can also be important contact. Spam, automatic replies and provider
events are not human exchanges. Ambiguous metadata remains unqualified until
legitimate source evidence or an authorized recording/correction establishes the
outcome. This creates neither a compulsory message-review queue nor a new
classifier or AI semantic-scoring product.

### C2 — An actual meeting is not an appointment or a Done checkbox

**High impact; likely if calendar/task/activity labels are reused as evidence.**
The event must have happened. A scheduled visit, accepted invitation, elapsed
calendar time, completed task, attempt/voicemail or note about a future call does
not establish completed contact. A calendar event with multiple invitees cannot
prove which people attended or which partnerships were discussed.

**Exact clause:** “Reuse a qualified actual encounter or allow an authorized
person to record that it occurred. Selecting an activity kind, marking work
complete or saving a shared update alone does not qualify contact. No task or
calendar record is required merely to record a truthful encounter.”

The source can expose a clear ordinary outcome choice; it need not demand a
second log entry, manager sign-off or transcript. Preserve outreach as useful
history without claiming it has the same meaning as contact under A.

### C3 — Author, participant, represented Party and ministry differ

**High impact; plausible with churches, couples, teams and joint visits.**
P6 recipient-copy facts and P26 relevance rules do not make every linked Party a
participant. An assistant can record someone else's reported conversation; a
missionary can take part without authoring the record. A church leader's personal
relationship and their church representation are not interchangeable.

**Exact clause:** “Attribute contact only to the exact qualified partnership
context for which the source proves the actual encounter's relevance and
participation or represented-party meaning. Recording, responsibility,
readership, broad church linkage, ministry membership or financial designation
alone does not supply that attribution.”

A genuine joint meeting may support more than one authorized partnership where
the facts establish each connection. Reuse its one encounter identity; do not
clone the meeting or refresh every relationship involving that Party. Different
representatives seeing the same encounter do not create extra contact. This
requires a bounded typed source reference, not a universal participation engine
or automatic retargeting after ministry succession/Party repair. Broader
cross-partnership count/rollup semantics remain separately qualified.

### C4 — Use occurrence time with its actual precision

**High impact; likely with late entry, corrected history and imports.**
The current save-time writer is insufficient. Record trusted author/admission
time separately from the reported or source-observed occurrence. Date-only
contact can support an honest date without invented midnight, a claimed exact
instant or timezone drift. Unknown occurrence time is not `now`, creation time,
an epoch date or the time another person reads the update.

**Exact clause:** “Derive recency from the actual qualified occurrence date/time,
with supplied precision and zone meaning. Late entry retains the earlier
occurrence; corrections can move the derived result earlier or later without
creating a new encounter. Unknown chronology stays visibly unknown.”

Use the complete qualified source set, with current revisions, restriction and
retention rules, rather than the last UI page. Same-source retries/references
must not inflate frequency or create a second event. Display an honest date or
uncertainty; do not create an elaborate temporal engine for this feature.

### C5 — Derived dates must not disclose private encounters

**High impact; plausible with global caches and cross-surface aggregates.**
The viewer must be allowed the contact fact itself under the exact source,
partnership, field, purpose and historical-access projection. A private body
cannot be laundered into a date, count, badge, hidden-entry hint or AI brief.
Filter before aggregation, sorting and paging; source changes and revocation
invalidate every affected read path.

**Exact clause:** “Show the most recent qualified personal contact available
under the viewer's current authorized source projection, with honest coverage.
No known entry means no qualifying contact is recorded in that available
history; it does not prove that no contact happened.”

Do not overcorrect by requiring readable message bodies forever. Under P17, an
explicitly permitted retained body-free fact can remain usable after an optional
sent copy expires. Conversely a copied qualification flag cannot preserve a
fact whose governing source permission or retention no longer allows it. No
new disclosure exception is created by D27.

### C6 — A contextual date is not a compulsory activity target

**High impact; plausible given older portfolio-health/coaching wording.**
D26 remains binding. No log quotas, automatic missionary enrollment, missing-log
penalties, staff supervision or “good/bad missionary” colors follow. Neither
contact nor its absence completes next work, grants consent, changes stage,
recognizes giving, resolves an ask, resumes a pause or creates outreach pressure.

**Exact clause:** “Present contact and outreach as distinct, source-linked
relationship context. Do not infer diligence or relationship value from
incomplete history. Existing source obligations and contact restrictions remain
independent; D27 chooses no aging thresholds, required logging cadence,
automatic task or reminder policy.”

## Acceptance obligations, not executed tests

- **AC01:** actual reported conversation/meeting qualifies; a scheduled meeting,
  attempted call, voicemail, task completion, update save and provider delivery
  do not. Recording an encounter does not require another task or transcript.
- **AC02:** a substantive human inbound message qualifies without an earlier
  recorded outbound; an automatic reply does not. A genuine negative response
  can count while its no-contact/ask consequences remain with their owners.
- **AC03:** two representatives and several eligible partnership references
  reuse one real encounter; unrelated ministries/Parties receive no new date.
  Recorder identity never substitutes for participant or representation evidence.
- **AC04:** late, corrected, date-only and unknown history remains truthful;
  retry/deduplication and a late import do not create new contact or outward work.
- **AC05:** source access loss, audience changes, private notes and hidden history
  cannot influence an unauthorized date/count/order/brief/cache. Independently
  retained permitted body-free facts survive optional-copy expiry correctly.
- **AC06:** empty, incomplete, stale and unavailable history are distinguishable
  without exposing hidden facts. A source maximum is not calculated from a
  truncated display list or generic `updated_at`.
- **AC07:** staff and missionary views explain the same qualified source meaning
  within their respective rights; contributing nothing creates no quota failure,
  compulsory task or coaching enrollment.

The necessary owner clarification is bounded: P9 qualifies actual encounter
evidence; P6/P17/P26 retain their real communication and payload contracts; P27
defines this derived development meaning; P28 consumes the permitted result.
No generic event engine, new message store, formal owner edit, runtime probe or
production qualification is part of this research.
