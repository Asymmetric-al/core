# D14 — Calendar providers, subscribed feeds and reliable bounded updates

Research date: **October 16, 2026 UTC**. The founder selected optional automatic
updates of deliberately added Asym appointments in the missionary's own connected
calendar. Asym retains appointment authority. This file supplies research and
recommendations, not a selected provider inventory, OAuth grant, implementation
or completed integration. No credentials, authenticated API requests, accounts,
subscriptions, events or notifications were created or changed.

**Finding:** there are two genuine automatic-update approaches. A subscribed
iCalendar feed avoids provider calendar-write OAuth and works with several native
calendar clients, but refresh and removal are controlled by subscribers. Direct
Google/Microsoft API projection can obtain a response for an individual remote
operation, at the cost of credentials, broader permissions and durable recovery.
Neither provides an end-to-end exactly-once guarantee or proves that every device
already displays the latest appointment.

**Preferred first qualification:** API-managed personal copies in a dedicated
Google Asym calendar for the exact tenant, principal and provider account, using
`calendar.app.created` and no general destination picker initially. This is a
proportionate recommendation because rescheduling/cancellation benefits from
direct per-event outcomes. It is not a claim the founder selected Google or that
the scope reaches only one calendar. Keep Microsoft as an explicit candidate
pending its event-specific concurrency qualification; retain subscribed feeds as
the strongest simpler automatic alternative when their delay/exposure meets the
accepted job. Qualify setup recovery before activating either API path.

The [Q14 scope](../phase28-q14-calendar-connection-research.md) requires a useful
native/manual path, no general import/mailbox access, no implied attendee mail,
current source permissions and honest connection/update states. P31 owns the
connection boundary; the native appointment owner retains business meaning and
effects. This note does not displace the retained P31 first consumer or make
ordinary scheduling depend on a complete integrations program.

## 1. Current primary evidence

All sources below were read October 16, 2026. Dates shown are publisher dates when
observed. “Current documentation; checked today” means no exact revision date was
captured, not that a date does not exist. Microsoft API claims use **v1.0** unless
explicitly identified as a limitation. A public Microsoft Learn loading/login
banner did not require authentication to read the returned article bodies.

### Google Calendar

| ID  | Primary source and date                                                                                                                                                                                                                                    | Relevant documented claim and limit                                                                                                                                                                                                                                                        |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| G1  | [OAuth scopes](https://developers.google.com/workspace/calendar/api/auth), updated **2026-09-03**                                                                                                                                                          | `calendar.app.created` permits secondary-calendar creation and event operations on those calendars. `calendar.events.owned` covers owned calendars; `calendar.events` covers events across the user's calendars. The scopes are not an arbitrary single-calendar or single-event selector. |
| G2  | [Create calendar](https://developers.google.com/workspace/calendar/api/v3/reference/calendars/insert), updated **2025-10-28**                                                                                                                              | Creates a secondary calendar and makes the authenticated user its data owner. `calendar.app.created` is accepted. The request does not document an event-style caller-chosen calendar ID or idempotency token.                                                                             |
| G3  | [Create event](https://developers.google.com/workspace/calendar/api/v3/reference/events/insert), updated **2026-07-07**                                                                                                                                    | Supports a caller-supplied event ID with base32hex characters, length 5–1024 and uniqueness per calendar. Google warns collisions may not be detected at creation in its distributed system. Notification flags are not a universal no-email guarantee.                                    |
| G4  | [Conditional resource versions](https://developers.google.com/workspace/calendar/api/guides/version-resources), updated **2026-09-11**                                                                                                                     | `If-Match` with the retrieved etag conditionally updates/deletes; a changed version yields 412. The same guide warns that some calendar-list read-only/ACL changes do not change its etag. Event-version checking is not proof that every external permission stayed fixed.                |
| G5  | [Delete event](https://developers.google.com/workspace/calendar/api/v3/reference/events/delete), updated **2026-05-12**                                                                                                                                    | Deletes a specific calendar/event resource and exposes notification controls. Its deprecated notification flag explicitly warns that email may still be sent. Do not treat deletion as harmless merely because an app requests quiet operation.                                            |
| G6  | [Calendar sharing](https://developers.google.com/workspace/calendar/api/concepts/sharing), updated **2026-09-03**                                                                                                                                          | Event visibility works with calendar ACLs. Private-event details remain visible to users with at least `writer` access; the current separate `writerWithoutPrivateAccess` role is narrower. Attendee copies follow the attendees' calendar sharing.                                        |
| G7  | [Calendars, events and timezones](https://developers.google.com/workspace/calendar/api/concepts/events-calendars), updated **2026-09-03**                                                                                                                  | Secondary calendars are user-owned, shareable and deletable. Timed events and all-day dates differ; IANA zones govern relevant timed/recurring behavior. Calendar creation also adds the calendar to its creator's calendar list.                                                          |
| G8  | [CalendarList.list](https://developers.google.com/workspace/calendar/api/v3/reference/calendarList/list), updated **2026-07-29**; [Calendars.get](https://developers.google.com/workspace/calendar/api/v3/reference/calendars/get), updated **2026-05-12** | List discovery has separate accepted scopes, including `calendar.calendarlist.readonly`; `calendar.app.created` is not listed. Getting an already known calendar ID does accept `calendar.app.created`. That distinction matters when a create response containing the ID is lost.         |
| G9  | [Push notifications](https://developers.google.com/workspace/calendar/api/guides/push), updated **2026-09-11**                                                                                                                                             | Event watches are per calendar; notifications have no changed-resource body, channels expire and renewal is explicit. Google explicitly says notifications are not 100% reliable.                                                                                                          |
| G10 | [Incremental synchronization](https://developers.google.com/workspace/calendar/api/guides/sync), updated **2026-09-11**                                                                                                                                    | Sync tokens follow completed pagination and changes include deleted entries. An invalidated token can return 410 and require a new full sync. That is a projection-rebuild instruction, not authority to delete Asym appointments or import an entire unrelated calendar.                  |

### Microsoft Graph

| ID  | Primary source and date                                                                                                                                                                                                                                                       | Relevant documented claim and limit                                                                                                                                                                                                                                              |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1  | [Permissions reference: Calendars.ReadWrite](https://learn.microsoft.com/en-us/graph/permissions-reference#calendarsreadwrite), current documentation; checked today                                                                                                          | Delegated permission creates, reads, updates and deletes events in user calendars; personal Microsoft accounts can consent. Application permission has substantially broader mailbox reach. A calendar chosen in Asym does not narrow the delegated token to that one calendar.  |
| M2  | [Create event in a calendar](https://learn.microsoft.com/en-us/graph/api/calendar-post-events?view=graph-rest-1.0), current v1.0 documentation; checked today                                                                                                                 | Supports a specified calendar and requires `Calendars.ReadWrite` for user calendars. Examples include `transactionId`; this is not a permission to operate on any calendar supplied by a client.                                                                                 |
| M3  | [Event resource](https://learn.microsoft.com/en-us/graph/api/resources/event?view=graph-rest-1.0), updated **2025-05-15**                                                                                                                                                     | `transactionId` helps avoid redundant create POSTs and cannot be changed after creation. `changeKey` identifies event version. Default IDs can change on moves; all-day start/end must be midnight in one timezone. These are distinct from proof of unconditional retry safety. |
| M4  | [Immutable Outlook IDs](https://learn.microsoft.com/en-us/graph/outlook-immutable-id), updated **2024-11-07**                                                                                                                                                                 | `Prefer: IdType="ImmutableId"` is per request. An event ID remains stable within the same mailbox, including folder moves; archive-mailbox moves or export/reimport can change it. Calendar containers do not use this option because their ordinary IDs are already constant.   |
| M5  | [Update event](https://learn.microsoft.com/en-us/graph/api/event-update?view=graph-rest-1.0), updated **2024-06-22**                                                                                                                                                          | PATCH supplies changed properties; omitted properties remain or are recalculated. Attendee changes and recurring-series edits can send meeting updates. The documented header table does not specify an event `If-Match` contract.                                               |
| M6  | [Delete event](https://learn.microsoft.com/en-us/graph/api/event-delete?view=graph-rest-1.0) and [Cancel event](https://learn.microsoft.com/en-us/graph/api/event-cancel?view=graph-rest-1.0), current v1.0 documentation; checked today                                      | Deleting an organizer's meeting sends cancellation to attendees. Cancel is an organizer action that moves the item to Deleted Items and can send a custom cancellation comment. These are not interchangeable silent cleanup commands.                                           |
| M7  | [Calendar resource](https://learn.microsoft.com/en-us/graph/api/resources/calendar?view=graph-rest-1.0), updated **2026-10-15**; [calendar permissions](https://learn.microsoft.com/en-us/graph/api/resources/calendarpermission?view=graph-rest-1.0), updated **2024-05-23** | Capability/ownership metadata and calendar permissions are distinct. A delegate can be allowed to see private events. Reading calendar permissions as a recipient/delegate can return an empty collection; that is not proof of no other viewers.                                |
| M8  | [Create calendar](https://learn.microsoft.com/en-us/graph/api/user-post-calendars?view=graph-rest-1.0), updated **2025-07-23**                                                                                                                                                | Creates a user calendar with `Calendars.ReadWrite`; no Google-style app-created-calendar OAuth scope or event `transactionId` contract is documented for calendar creation.                                                                                                      |
| M9  | [dateTimeTimeZone](https://learn.microsoft.com/en-us/graph/api/resources/datetimetimezone?view=graph-rest-1.0), updated **2024-08-08**                                                                                                                                        | Windows zones and additional calendar zones are described; create/update may not support every listed zone. The event-update page requires using zones supported by the user's mailbox server. Do not assume arbitrary IANA strings always work.                                 |
| M10 | [Calendar-view delta](https://learn.microsoft.com/en-us/graph/delta-query-events), current documentation; checked today                                                                                                                                                       | Stable calendar-view delta is bound to a particular calendar and date/time interval. State links are opaque and pagination must complete. This guide identifies unbounded event delta as beta; do not silently depend on that variant.                                           |
| M11 | [Outlook change notifications](https://learn.microsoft.com/en-us/graph/outlook-change-notifications-overview) and [subscription lifetime](https://learn.microsoft.com/en-us/graph/api/resources/subscription?view=graph-rest-1.0), current documentation; checked today       | The documented event subscription resource is all events in a user's mailbox (`/me/events` or `/users/{id}/events`). Subscriptions need renewal; the ordinary Outlook-resource maximum is listed as 10,080 minutes, under seven days. The table is not an Asym retention policy. |
| M12 | [Graph error semantics](https://learn.microsoft.com/en-us/graph/errors), current documentation; checked today                                                                                                                                                                 | 412 denotes a failed supplied precondition, such as an `If-Match` mismatch. This general definition does not establish conditional-write support for every calendar operation.                                                                                                   |

### Subscribed iCalendar and native clients

| ID  | Primary source and date                                                                                                                                                             | Relevant documented claim and limit                                                                                                                                                                                                                                              |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | [Google: Subscribe from a calendar URL](https://support.google.com/calendar/answer/37100?hl=en), current help; checked today                                                        | Describes adding a published/public calendar from URL on a computer. No numeric refresh bound was found in the current article. It does not establish support for arbitrary authenticated Asym feed endpoints.                                                                   |
| F2  | [Google: View-only iCal and secret addresses](https://support.google.com/calendar/answer/37648?hl=en), current help; checked today                                                  | A secret iCal address provides a read-only view in another application; Google says not to share it and provides Reset to invalidate the old address. This is primary evidence of link secrecy, not proof that resetting a link erases previously fetched data.                  |
| F3  | [Outlook: Import versus subscribe](https://support.microsoft.com/en-us/outlook/import-or-subscribe-to-a-calendar-in-outlook-com-or-outlook-on-the-web), current help; checked today | Import is a static snapshot; subscribing automatically refreshes. Outlook.com mentions roughly three-hour updates and Outlook on the web roughly six-hour updates, but both warn updates may take **more than 24 hours**. Those intervals are not guaranteed delivery deadlines. |
| F4  | [Apple: iCloud calendar subscriptions](https://support.apple.com/en-us/102301), published **2026-05-22**                                                                            | Documents subscription setup on iPhone/iPad/Mac and availability across devices using the same iCloud account. Account/device setup still matters; this is not a claim that every client refreshes instantly.                                                                    |
| F5  | [Apple: Refresh calendars on Mac](https://support.apple.com/guide/calendar/refresh-calendars-icl1024/mac), current user guide; checked today                                        | Supports automatic refresh options for a subscribed calendar and a manual Refresh Calendars action. No universal end-to-end latency or cancellation-removal guarantee is established.                                                                                            |

Search results from mirrors, third-party SDK wrappers, community answers and
unrelated Graph note/Planner/Drive APIs were not promoted to provider calendar
contracts. No numeric Google subscription-refresh folklore is used.

## 2. Permissions and destination: practical minimums differ

| Candidate destination                                             | Practical permission posture                                                                                                                                                           | Benefit and unresolved cost                                                                                                                                                                                                      |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Google app-created secondary Asym calendar                        | Prefer delegated `calendar.app.created` when it covers the qualified operations. This limits the provider surface to app-created secondary calendars rather than every owned calendar. | Strongest API scope reduction. It still covers events on those calendars, including events the user might add independently, and can cover more than one calendar. Asym must enforce its exact target and mapped-event boundary. |
| Google existing owned calendar selected by user                   | `calendar.events.owned` can cover event operations; calendar discovery may separately require `calendar.calendarlist.readonly`.                                                        | Convenient existing destination, but token authority extends beyond the selected calendar and beyond Asym-created events. No false “access to only this calendar” copy.                                                          |
| Google shared/delegated calendar                                  | Usually needs a broader eligible event scope and actual calendar access.                                                                                                               | Not implied by the selected missionary-own-calendar use. Avoid extending initial scope merely because a picker lists it.                                                                                                         |
| Microsoft dedicated Asym calendar in the signed-in user's mailbox | Delegated `Calendars.ReadWrite` for create/update/delete; a dedicated calendar is an application organization boundary, not an OAuth restriction.                                      | Useful isolation and predictable display. Provider token breadth remains materially wider than Google `calendar.app.created`; the user must be told the truth.                                                                   |
| Microsoft existing owned calendar                                 | Same delegated write scope, plus exact application target/mapping checks.                                                                                                              | Avoids calendar provisioning but mixes managed and unrelated entries. No mailbox-wide list/import is necessary for ordinary mapped-event updates.                                                                                |
| Read-only Asym subscription feed                                  | No provider calendar-write OAuth; the client retrieves a source-issued feed URL. A secret bearer URL is still a credential and export surface.                                         | Cross-client and comparatively simple, but recipient identity, caching, refresh delay and revocation must be honestly bounded. No automatic readback proof that the user subscribed or sees the latest item.                     |

Use user-delegated access for this own-calendar job. Do not introduce app-only
mailbox access, domain-wide delegation, shared-calendar permissions, Mail.Read,
Mail.Send, address-book or free/busy scopes to make the connector easier. The
existing P31 identity/OAuth/refresh-token flow still needs qualification; calendar
scope alone does not bind a connection to the right Asym actor, tenant and provider
account. Display email is not a substitute for a verified stable account binding.

The narrower Google path has a **setup-recovery tradeoff**. G2 returns a newly
created calendar's server ID; G8 does not accept `calendar.app.created` for general
calendar-list discovery. If the create succeeded but its response was lost, a
local outbox alone cannot prove which remote calendar was created. Do not blindly
retry creation, select a calendar by name, delete every similarly named calendar
or quietly add broad scopes. Qualify a bounded recovery mechanism or pause setup
for truthful recovery. Additional list-metadata access is an explicit scope
tradeoff, not an automatic least-privilege requirement. Microsoft calendar
provisioning has the same lost-create-response question, despite broader existing
calendar permission.

Creating a dedicated calendar also does not authorize changing its ACLs or
deleting the entire calendar on disconnect. The missionary can share it or place
other entries in it. Keep all cleanup limited to independently qualified mapped
objects and current authority.

## 3. Identity, retries and concurrent changes

The durable association must bind the source appointment/projection generation,
Asym tenant/actor, verified provider account, exact destination calendar and remote
event identity. Display title, date/time, contact email, arbitrary remote custom
properties and a calendar named “Asym” are not proof of that association.

### Google

Use a valid opaque client-chosen event ID generated once for the intended create
operation, and preserve it for retries. A suitably encoded UUID-style value fits
the documented character constraints; a normal hyphenated UUID string must not
be assumed valid. The ID is unique **per calendar**, so store calendar identity
with it. `iCalUID` is a different identity and is not a drop-in event API key;
recurring instances have their own event IDs.

This helps reconcile a lost insert response by addressing the intended event,
but G3 expressly prevents an absolute collision-detection or exactly-once claim.
Check that an existing object matches the intended mapping and safe projection
before considering a retry complete; never overwrite an unrelated collision.

For update/delete, G4 provides a documented etag precondition. On conflict,
retrieve only the mapped resource, re-evaluate current authority and the allowed
projection, then resolve or report the disagreement. Do not convert 412 into an
unconditional overwrite. Do not blindly PUT a stale full resource that contains
remote fields outside the qualified projection.

### Microsoft

Preserve one `transactionId` for the same create retry. The documentation explains
duplicate-POST prevention but does not supply a universal deduplication lifetime,
an unlimited retry window or a guarantee across delete/recreate, changed targets
and changed payloads. A new source revision is not permission to reuse a create
token with incompatible meaning or generate a second event after uncertainty.

Request immutable event IDs consistently on the calls that return/use them and
preserve case. Their stability is within the mailbox, not across archive moves or
export/reimport. An event moved to another calendar must not silently authorize
Asym to follow it into a different destination merely because its ID still works.

**Conditional-write qualification remains open.** M3 exposes an event version,
and M12 explains precondition errors. However, the v1.0 event update/delete pages
inspected do not document an `If-Match` header contract. Documentation for other
Graph resource types and community examples are insufficient to certify event
PATCH/DELETE behavior. This research does not claim Graph lacks support; it
identifies a specific missing proof. Qualify the exact request, version token,
conflict outcome and deletion behavior for each supported provider/account path
before relying on it for race-safe mutation. A preflight GET alone leaves a race.

### Both providers

Source changes need durable ordered/reconcilable work for the one mapped remote
copy. Cancelled or superseded appointment versions must not be recreated by late
workers or retries. Provider acceptance, source success, current connection and
device display are separate states. A timeout means the remote outcome may be
unknown; it does not prove failure. A 404 alone is not evidence that cancellation
was completed everywhere or that a lost create never happened.

Revocation fences new authorized work but cannot recall a request already accepted
by the provider. Reconnection must revalidate the same provider identity and target,
not silently publish all retained appointments to a newly selected account.
These are implementation requirements under the existing source/connection
owners, not a new exactly-once architecture claim.

## 4. Cancellation and privacy cannot be reduced to flags

**Recommended initial projection:** a personal calendar copy, with no attendees,
resource booking, invitations, response tracking, automatic conferencing,
attachments or copied private relationship history. Export only source-approved
appointment fields and a permission-checked Asym link. A calendar connection does
not make every appointment field eligible for external disclosure.

No Mail.Send scope does **not** mean the calendar API cannot send mail: M5/M6 and
G3/G5 document calendar-driven meeting notifications. `sendUpdates=none`, a
private label or a hidden-attendee option is not permission to send an otherwise
unauthorized update. A remote user can also add attendees after creation. Before
mutating or deleting a mapped item, qualify its current role/shape and the
provider's concurrency boundary; detected meeting/attendee drift should enter
safe reconciliation rather than invoke an unintended invitation/cancellation.

An Asym cancellation changes the source appointment regardless of provider health.
The external copy may be removed or otherwise represented as cancelled only by
the qualified provider contract. Do not confuse Graph's organizer `cancel`
action with silent removal of a personal reminder. If the connection is revoked
or provider outcome is uncertain, report that the calendar copy could not yet be
updated; do not undo source cancellation or claim the remote item disappeared.

Private/sensitive settings can reduce some exposure but cannot guarantee “only
you can see this.” Google private events remain visible to writer-level viewers;
Microsoft delegates may have private-event access. A user's own calendar may be
shared. A calendar-permission result or etag is not a perpetual guarantee about
that external audience. Prefer minimizing exported content at the source over
making confidentiality depend on inspecting or controlling every calendar ACL.
No ACL-changing permission is required merely to implement appointment copies.

## 5. Timezones, all-day values and recurrence

Preserve the source appointment's intended instant/local time, explicit timezone,
duration and all-day meaning. Never derive an appointment's timezone from the
worker host, current browser or connected calendar default merely because that
default is convenient.

Google documents IANA zones and separate all-day date fields. Event end is
exclusive. Graph all-day events require midnight start/end in the same zone;
Graph's timezone formats/support are not identical to Google's. A source all-day
date is not a UTC-midnight instant to shift into another day. A provider adapter
needs tested mapping for the admitted forms and must report unsupported data
without silently changing the appointment.

Check spring-forward nonexistent times, fall-back ambiguous times, travel between
zones, calendar-default changes, leap day and multi-day all-day events. The source
owner decides ambiguity policy; this research does not choose it. Recurring
masters, occurrences and exceptions require their own qualified identity and
cancellation semantics if native recurrence is supported. D14 does not itself
add a new recurrence feature or require copying a series when one appointment
was deliberately added.

## 6. Subscribed feed: strongest simpler automatic alternative

A feed can publish only the source-approved appointments the missionary has
deliberately added. The calendar application subscribes once and periodically
retrieves the current representation. This is **automatic updating**, unlike a
downloaded `.ics` file, and should not be dismissed as the manual alternative.
It avoids broad provider-write consent and lets the subscription remain read-only
while Asym stays authoritative.

The important costs are different from the API path:

- **Refresh belongs to the subscriber.** F3 explicitly allows more than 24 hours.
  F1 supplies no current numeric bound. F5 offers Mac refresh controls, but that
  does not guarantee other clients refresh on the same schedule. Do not promise
  timely same-day rescheduling/cancellation or “updated in your calendar” just
  because the source feed changed.
- **A feed fetch is not the missionary's current interactive session.** A secret
  bearer URL can authorize a bounded feed, but possession permits fetching it.
  Evaluate the current source/tenant/feed grant on each request, minimize content,
  protect the URL in logs/referrers and support revocation/rotation under P31.
  That is a design recommendation; generic public-feed support does not prove
  every client's compatibility with Asym authentication.
- **Revocation stops future authorized fetches; it cannot erase knowledge.** A
  client or intermediary can retain downloaded events. Returning an empty feed,
  an error or cancellation entries must not be claimed to purge every native
  calendar cache. Exact removal behavior needs client-specific proof.
- **Identity still matters.** Stable event identity and correct update/cancellation
  representation are necessary to avoid duplicate imported copies, but format
  correctness alone is not proof of a particular client's refresh/removal behavior.
- **Do not embed scheduling side effects.** A feed is a display projection, not
  an invitation channel or a way to add attendee email/alarms/attachments outside
  the source's permitted export. Native client behavior still needs qualification.
- **Setup and status need honest language.** “Subscribe to Asym appointments” can
  explain that the calendar checks for changes on its own schedule. A copied URL,
  successful feed response or opened subscription dialog does not prove the user
  completed setup or the external calendar is current.

The practical selection rule is a product judgment: **choose a subscription feed
when a read-only calendar with provider-controlled delay and bearer-link exposure
meets the accepted job; choose API projection when direct per-event operations
and confirmable remote outcomes are needed.** Neither A nor the word “connected”
proves that API writes are necessary. Conversely, calling a feed simpler cannot
justify hiding its delay or external-retention limits. Native Asym remains the
current appointment reference with either approach.

Do not build both transports merely to avoid choosing a qualified initial path.
Provider inventory, acceptable user-visible delay, supported clients and export
profile must be explicit before activation; this research selects none by fiat.

## 7. Webhooks and delta are optional optimizations

Asym can initiate a mapped update from its own authoritative appointment change;
that does not inherently require listening to an entire external calendar.
Targeted reads of mapped items for reconciliation are distinct from general
calendar import. Start with the smallest qualified reconciliation strategy that
meets the actual reliability job, and measure its cost.

If watches/delta are adopted, treat notifications as hints requiring current
authorization and source reconciliation. Google explicitly permits dropped push
messages and requires manual channel renewal. Its sync-token reset instructions
apply to the external projection state, not the native business source. Graph's
documented mailbox event-notification scope can reveal changes unrelated to Asym;
the selected product does not grant permission to retain/import those events.
Calendar-view delta bounds its collection by calendar and interval, but requires
opaque-token/pagination handling and a separate strategy for mapped events outside
that interval. A time window cannot silently lose responsibility for a deliberately
added future appointment or a cancellation.

No webhook or delta cursor is proof of current source authority, a successful
business mutation, the last user-visible device state or exactly-once delivery.
Do not add rich notification payloads, mailbox permissions or broad mirrors when
identifier-only targeted reconciliation is sufficient.

## 8. Proposed review clauses and qualification proofs

These are candidate amendments for the parent review, not newly ratified policy.

| Concern and severity                             | Exact proposed clause                                                                                                                                                                                | Required falsifiable proof                                                                                                                                                                           |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Scope overclaim — high                           | **Provider consent SHALL describe actual OAuth breadth. Exact application target/mapping restrictions SHALL remain enforced even when the token can access other calendars or events.**              | A valid broader token cannot operate on an arbitrary caller-supplied calendar/event; Google app-created and Graph delegated flows show truthful consent copy.                                        |
| Duplicate creation/unknown outcome — high        | **A create retry SHALL preserve the same intended operation identity and reconcile uncertainty; no exactly-once guarantee or blind calendar/event recreation SHALL be claimed.**                     | Lose calendar/event create responses; retry concurrently; reject mismatched existing objects; retain one known mapping or a truthful unresolved outcome.                                             |
| Concurrent remote mutation — high                | **Each supported provider mutation SHALL have a qualified conflict boundary; a preflight read or version field alone SHALL NOT be cited as atomic conditional-write proof.**                         | Exact event update and delete stale-version requests reject safely; change attendees between read/write; verify Graph's event-specific header behavior rather than borrowing another API's contract. |
| Unexpected attendee mail — high                  | **Personal calendar projection SHALL NOT imply attendee invitations, meeting updates, resource bookings or cancellation mail; drift into those effects SHALL be safely reconciled before mutation.** | Add remote attendees/organizer changes and attempt update/cancel; prove no unauthorized calendar-generated message occurs.                                                                           |
| False privacy — high                             | **Only source-approved minimized fields SHALL be exported. A private/sensitivity flag, own-calendar label or empty permission listing SHALL NOT be represented as an exclusive audience guarantee.** | Shared Google writer and Microsoft private-event delegate scenarios; verify titles, descriptions, URLs and metadata contain no excluded source details.                                              |
| Stale source work — high                         | **Current source/connection authority and source revision SHALL fence each attempted effect; later cancellation/revocation SHALL NOT be undone by a stale queued update or reconnect.**              | Race source edit/cancel, disconnect, lost response, worker retry and reconnection to a different provider account.                                                                                   |
| Calendar/identity drift — high                   | **Moves, copies, deleted targets and replaced connections SHALL NOT silently retarget the mapping or authorize operations on a new calendar.**                                                       | Event moved within mailbox, archive move, calendar renamed/deleted, cloned metadata and alternate account with similar email/name.                                                                   |
| Time distortion — high                           | **The adapter SHALL preserve qualified source time/all-day meaning and report unsupported timezone/recurrence forms; no default-zone substitution SHALL silently change the appointment.**           | DST ambiguity/gap, travel, leap day, exclusive all-day end, multi-day event and selected recurrence occurrence.                                                                                      |
| Subscription latency/revocation overclaim — high | **A subscribed feed SHALL disclose provider-controlled refresh and retained-copy limits; feed publication or revocation SHALL NOT be reported as confirmed remote update or deletion.**              | Test supported native clients through change, cancellation, token rotation, source revocation, temporary error and recovery; observe actual results without inventing a universal SLA.               |
| General import through recovery — high           | **Optional watch/delta/recovery SHALL remain limited to the approved projection purpose and mappings; unrelated calendar/mailbox data SHALL NOT become native appointment/contact history.**         | Expired cursor, broad Graph notification, foreign event in a dedicated calendar, out-of-range mapped event and missed Google notification.                                                           |
| Misleading success — medium to high              | **Connection, source save, pending projection, confirmed provider result and unknown/failed update SHALL remain distinct; native work SHALL remain useful during provider failure.**                 | Simulate accepted-but-lost response, throttling, expired consent and offline device; UI names the known outcome and offers safe recovery.                                                            |
| Overbuilt initial path — medium                  | **Transport/provider scope SHALL follow the required appointment job; D14 SHALL NOT automatically add both API and feed systems, a two-way importer or a new general integration framework.**        | Show the selected path meets add/update/cancel/recovery needs without mailbox ingestion, duplicate authority or unrelated dependencies.                                                              |

## 9. Remaining limits

Documented API behavior is not verified provider behavior in this environment.
In particular, Graph event conditional writes, create-deduplication lifetime,
dedicated-calendar setup recovery, supported timezone/account variations,
user-added attendee races and feed cancellation/removal need exact qualification.
No token lifecycle, webhook callback, quota, consent-screen review, account-type
matrix or native-client UX was exercised. An API response also cannot prove that
every synced phone has refreshed.

The evidence supports a permanent narrow integration under existing source/P31
ownership. It does not support claiming a single-calendar OAuth sandbox on both
providers, guaranteed silent deletion, instantaneous revocation of remote copies,
unlimited retries, guaranteed subscription freshness or exactly-once external
effects. Where a provider cannot qualify the selected behavior, retain truthful
native/manual recovery and keep only that unsupported path unavailable.
