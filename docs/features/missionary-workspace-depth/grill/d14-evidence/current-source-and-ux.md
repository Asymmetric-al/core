# D14 evidence — current source and calendar-copy UX

Research date: October 16, 2026 UTC. Baseline inspected during this session:
`9cada8f3d8ab59db391d3fd20df77fcadeb09813`.

The founder selected optional automatic updates for appointments deliberately
added to a connected calendar. Appointment changes originate in Asym; unrelated
calendar events and the mailbox are not imported. This note distinguishes current
code from the proposed complete journey. It does not choose a provider, API scope,
SDK, dedicated versus existing destination calendar, default export payload,
rollout default, recurrence model or calendar-cleanup policy.

## Inspection and existence-claim limits

Read the root and relevant missionary, admin, UI, API, database and auth
instructions. Bounded filename and text searches covered `apps`, `packages`,
`supabase` and `tests`, followed by the specific files below. Corrected
word-boundary searches used appointment(s), calendar sync, connected calendar,
Google Calendar, Outlook, Microsoft Graph, `BEGIN:VCALENDAR`, `text/calendar`,
OAuth, refresh/provider tokens, `googleapis`, `graph.microsoft`, `calendar_id`
and appointment/calendar/connection table declarations. Dependency manifests
were also searched for calendar/provider packages. General UI calendars, font
URLs and ordinary Supabase session tokens were distinguished from connectors.

No complete appointment/calendar connector, ICS producer, Google/Microsoft
calendar API client, appointment-to-provider-event mapping or connector-specific
test surfaced in that bounded inspection. This is not a proof of absence across
every repository file, generated artifact, deployed service or provider account.
No hosted data, credentials, OAuth consent, external calendars or production
configuration were accessed. No application, database, browser, accessibility,
provider or concurrency tests ran. The historical schema excerpt below is not
proof of the current deployed schema or complete migration/RLS precedence.

## Current implementation evidence

| Source                                                                                                                                                                                                                                                                         | Observed current behavior                                                                                                                                                                                                                    | Consequence for D14                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Task creation schema](/workspace/core/packages/api/src/missionary-portal/tasks.ts:21), [insert](/workspace/core/packages/api/src/missionary-portal/tasks.ts:81)                                                                                                               | A `meeting` task type is accepted alongside call/email/to-do. Fields include title, description and one nullable `due_date`; there is no start/end pair, named time zone, appointment cancellation or provider-event identity in this route. | A meeting-type task is not a qualified timed appointment. Do not infer a duration, all-day meaning or calendar copy from it.                                            |
| [Task update](/workspace/core/packages/api/src/missionary-portal/task.ts:25), [completion mapping](/workspace/core/packages/api/src/missionary-portal/task.ts:48), [delete](/workspace/core/packages/api/src/missionary-portal/task.ts:102)                                    | Status can set `completed_at`; DELETE removes the scoped task and returns success. These operations do not perform a calendar effect in the inspected code.                                                                                  | Completion, deletion, cancellation and provider removal need distinct source meanings. Do not report a remote cancellation because a task was deleted.                  |
| [Foundation task schema](/workspace/core/supabase/migrations/20250101000000_init_schema.sql:287)                                                                                                                                                                               | The historical table has `due_date TIMESTAMPTZ`, completion timestamps and a profile FK with delete cascade; it does not define an appointment or calendar-copy lifecycle.                                                                   | Later source design must establish the real appointment identity and lifecycle. A task-row timestamp is insufficient; a cascade is not a remote-cleanup command.        |
| [Task date field](/workspace/core/packages/missionary/components/task-dialog.tsx:357), [form fields](/workspace/core/packages/missionary/components/task-dialog.tsx:654), [payload](/workspace/core/packages/missionary/components/task-form-model.ts:81)                      | Calendar day selectors supply Due Date and Reminder Date. The form converts date values with `toISOString()`.                                                                                                                                | Reusing this UI as a timed meeting editor could invent midnight/time-zone meaning. This is a reuse risk, not an assertion that the existing due-date feature is broken. |
| [Donor activity composer](/workspace/core/apps/missionary/app/donors/donors-page-detail-overview.tsx:90)                                                                                                                                                                       | Meeting is an activity-log selection followed by Post.                                                                                                                                                                                       | Recording a past interaction does not schedule an appointment or prove attendance at a calendar event.                                                                  |
| [Missionary integration cards](/workspace/core/apps/missionary/app/settings/page-client.tsx:242), [Save behavior](/workspace/core/apps/missionary/app/settings/page-client.tsx:112)                                                                                            | Mailchimp has hardcoded Connected copy; Zapier has a Link button. Save clears local dirty state. No calendar connection is established here.                                                                                                 | These cards are layout references only. Do not carry their state claims into a real connector.                                                                          |
| [Care connected-services data](</workspace/core/apps/admin/app/(app)/care/settings/page-client.tsx:51>), [buttons](</workspace/core/apps/admin/app/(app)/care/settings/page-client.tsx:204>), [Save](</workspace/core/apps/admin/app/(app)/care/settings/page-client.tsx:367>) | Google Calendar is hardcoded `connected: true`; Connect/Disconnect buttons lack action handlers; Save produces a delayed success toast.                                                                                                      | This is not evidence of an existing working calendar adapter, consent grant or persisted connection.                                                                    |
| [Authentication callback](/workspace/core/packages/api/src/auth/callback.ts:28)                                                                                                                                                                                                | Exchanges a Supabase auth code for an app session and redirects to the role home or safe next path.                                                                                                                                          | Login authentication is not calendar-provider consent, token custody, exact calendar selection or connector recovery. Do not repurpose it by changing labels.           |
| [Local auth provider configuration](/workspace/core/supabase/config.toml:296), [OAuth server configuration](/workspace/core/supabase/config.toml:342)                                                                                                                          | Contains generic provider instructions and disabled example/server settings.                                                                                                                                                                 | Local auth configuration does not establish a deployed calendar integration or admissible provider scope.                                                               |
| [SettingsCard](/workspace/core/packages/ui/components/settings/settings-card.tsx:21), [shared Calendar](/workspace/core/packages/ui/components/shadcn/calendar.tsx:19), [UI configuration](/workspace/core/packages/ui/components.json:3)                                      | Shared cards and date controls exist within `base-maia`/Base UI.                                                                                                                                                                             | Reuse the design system and suitable primitives. Their presence does not prove appointment semantics or the composed journey's accessibility.                           |

## Intended source boundaries

[Q14](/workspace/core/docs/features/missionary-workspace-depth/grill/phase28-q14-calendar-connection-research.md:12)
describes selected appointments flowing outward, with later Asym changes updating
the corresponding copy. Connection alone does not select appointments for export.
[The founder brief](/workspace/core/docs/features/missionary-workspace-depth/grill/phase28-founder-brief.md:241)
requires exact account/scope/direction/currentness/recovery and a useful manual
path; an invitation is not evidence a meeting occurred.

[P31 connection registry](/workspace/core/docs/prds/sitestacker-parity/roadmap.md:4419)
owns credentials, scopes, connection state and repair. Its
[ownership boundary](/workspace/core/docs/prds/sitestacker-parity/roadmap.md:4431)
keeps source resource meaning and business-effect identity with the appointment
owner. The bounded appointment contract and connector profile must be qualified
before activation. This note does not establish that either already exists.

## Smallest complete proposed journey

### Connect and choose a destination

One Calendar card in the existing settings surface, also reachable from an
appointment's Add to calendar action:

```text
Calendar
Choose which Asym appointments appear in your calendar.
Manage appointment details in Asym.

[Connect calendar]
```

Only qualified providers appear. Consent returns to the same current person and
tenant context, preserving safe appointment intent without automatically adding
the appointment. Display the actual provider account and exact destination. Use
the supported destination-selection or destination-creation flow after provider
qualification; this note freezes neither. A shared or delegated destination must
not be silently treated as private because the user can write to it.

Cancellation, denied consent and an unavailable destination leave native work
intact. Never show Connected before the qualified binding is durable. Explain
application behavior accurately: “We do not import unrelated calendar events”
must not become “We cannot read your other calendars” unless actual provider
permissions support that stronger statement.

### Deliberately add an appointment

The native appointment remains usable without a connection. Its Add to calendar
review identifies the actual account/calendar, start/end and named time zone,
and the source-approved content that will leave Asym. The allowed fields are a
source-policy decision, not a blanket copy of the appointment form.

```text
Add to calendar
[Qualified account] · [Exact calendar]
[Appointment date, start–end and named time zone]
[Exact approved calendar text]

Changes made in Asym will update this calendar entry.
Changes made in your calendar do not update the Asym appointment.

[Cancel] [Add to calendar]
```

Do not add attendee invitations, contact import, mailbox access, automatic exports
of other appointments or unselected historical appointments. A calendar's shared
audience and lock-screen display make even event titles, aliases and meeting
links a disclosure decision. Minimal useful content is preferable, but the exact
payload remains for the admitted source/provider profile.

### Edit, cancel and understand status

Save native changes independently of provider availability. When an already
selected appointment changes, submit the corresponding qualified calendar effect
without another routine setup wizard. Show state beside that appointment, with
connection repair available from the same context:

| State                                                | Suggested truthful copy/action                                                                        |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| No calendar copy selected                            | Add to calendar                                                                                       |
| Local selection accepted; remote create unfinished   | Adding to [calendar]                                                                                  |
| Latest desired version acknowledged                  | Added to [calendar] / Up to date                                                                      |
| Native change saved; remote update unfinished        | Appointment saved. Calendar update pending.                                                           |
| Cancellation saved; remote removal/update unfinished | Appointment cancelled. Calendar removal/update pending. Use the actual qualified operation's wording. |
| Retryable provider problem                           | Calendar update couldn't finish. Native appointment is saved. Offer the actual retry/recovery action. |
| Provider permission lost                             | Reconnect to resume permitted calendar updates. Do not imply cancellation or removal has succeeded.   |
| Outcome unknown                                      | Checking calendar status. Recover the original effect before creating or retrying another effect.     |

Connected means the connection is usable, not that every appointment is current.
Up to date requires evidence for the current desired source version, not merely
an old successful request. Cancellation, source deletion, task completion and
recorded meeting outcomes remain separate. A completed call/meeting must be
recorded deliberately; a provider entry or past timestamp does not establish it.

### External edits and missing copies

One-way direction is understandable if ownership is stated at setup and retained
in a safe calendar description/link where the source permits it. Moving or
deleting a provider entry does not reschedule or cancel Asym's appointment.

Recommended conflict resolution: inspect only the mapped records/metadata needed
for admitted reconciliation. If managed fields differ or the copy is missing,
show “This calendar entry changed outside Asym” or a safe missing-copy state,
with qualified Restore from Asym and Stop calendar updates actions. Do not
silently overwrite an external edit or recreate an intentionally removed copy.
The exact conflict policy remains a reviewed recommendation requiring source and
provider qualification; this note does not claim the founder selected it.

Preserve unrelated provider-owned fields where the provider contract permits.
An external edit that adds attendees or otherwise changes effect semantics must
not turn the next routine update into an unapproved invitation/send. Conflict
handling must not expand into importing unrelated events or a general merge UI.

### Failure, manual work and disconnect

Native appointment creation, edits and outcome recording continue during an
outage. Offer actionable recovery without discarding the draft or forcing a
reconnect after every transient error. Duplicate clicks, a lost response and
reconnect must not create duplicate calendar entries.

A manual fallback must disclose whether it is a separate copy that will not stay
updated. Do not offer a second export while an earlier create outcome is unknown
as though no copy exists. An ICS file or external link, if later qualified, is
not an implemented fallback merely because the UI has an Add button.

Disconnect fences newly authorized outward work promptly. Confirm its scoped
effect on this connection, native appointments, unfinished effects and existing
provider copies. Exact keep/remove cleanup policy is not selected here. If copy
removal is offered, qualify it as an explicit action while authority remains,
then report partial/unknown results. Do not delay the user's ability to stop
access indefinitely behind cleanup or promise cleanup after credentials are gone.
Already accepted provider effects and delivered copies cannot be recalled by
changing a local status.

Reconnect re-proves account, destination, source authority and connection
generation. A different account/calendar is not permission to retarget old jobs,
move all prior entries or restore ended per-appointment selections. Clearly
explain the treatment of existing versus future copies when changing destination;
do not hide migration inside a simple account picker.

## Time, accessibility and mobile requirements

- Establish real start/end and named-zone meaning. A date-only task must not
  become a midnight timed event or an invented-duration appointment. If all-day
  or recurring appointments are supported, their source semantics and update/
  cancellation identity require separate qualification; they are not selected
  just by choosing automatic updates.
- Show the appointment's actual time zone, support unambiguous date/time entry
  and handle DST gaps/overlaps explicitly. Browser travel and locale display must
  not move the appointment. Provider rendering can use another local zone while
  representing the same intended instant; compare semantics, not formatted text.
- Keep one narrow, phone-friendly card/review. Use labeled native/shared inputs,
  typed entry as appropriate, visible keyboard focus, adequate touch targets,
  localized long account/calendar names and reflow at 320 CSS pixels/400% zoom.
  Restore focus after connection/confirmation and announce status changes without
  moving focus unnecessarily. Color alone cannot express connection health.
- Keep pending/error state visible near the affected appointment rather than
  relying only on a disappearing toast. Native save and calendar result are
  distinct. Avoid a full-page reload or loss of safe work during consent/repair.
- No free/busy import is selected, so do not promise conflict detection or that
  a proposed slot is available. App/provider performance budgets and update
  latency must be demonstrated before making timing guarantees.

## High-leverage implementation requirements and proof cases

These are proposed acceptance outcomes, not executed tests:

1. Native scheduling works with no connection, denied consent or provider outage;
   no false Connected/Added/Up to date appears.
2. Adding one appointment exports only its admitted projection to the exact
   account/calendar; other appointments, private notes and attendees do not follow.
3. Duplicate Add and a lost response converge on one mapped copy; recovery uses
   the original effect identity before retrying.
4. Rescheduling and cancellation, including opposite concurrent orders and delayed
   retries, preserve the latest valid source intent. A task deletion cannot leave
   an unreported successful-looking remote cancellation.
5. Connection and source identity bind tenant, principal, appointment/copy,
   provider account, calendar and generation. Cross-context callbacks, account
   changes and stale jobs cannot redirect effects.
6. Actual provider scopes, consent/callback checks and server-only credential
   custody are qualified. Login OAuth and app-session tokens do not substitute.
7. External edit/delete, provider-added attendees and revoked write permission
   yield the agreed safe conflict/repair behavior without broad event ingestion.
8. Date-only, timed and any admitted all-day/recurrence cases preserve meaning
   across DST, locale, travel and provider-zone rendering.
9. Disconnect/revocation fences new effects and accurately reports accepted,
   pending, failed or unknown earlier work; cleanup and independent connections
   retain their own authority.
10. Representative users complete setup/add/change/cancel/repair/disconnect on
    phone, keyboard and screen reader, and can explain the one-way boundary and
    which appointment version the calendar currently reflects.

These obligations reuse the source/P31 transport model; they do not prescribe a
new queue system, dependency, provider, token schema or generic sync engine.

## Primary product comparisons inspected

| Primary source                                                                                                                                                                                                                                     | Observed pattern and limit                                                                                                                                                                                                                                                                                                                                                        |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [MPDX — Connect Services](https://help.mpdx.org/article/449-connect-services), updated September 29, 2022; inspected October 16, 2026                                                                                                              | Shows Google account identity, deliberate calendar enablement and task selection. It also offers contact import and uses green dots for connection/sync status. Account selection is useful precedent; broad import and color-only/currentness implications are not Core requirements. Its age and product-specific behavior do not establish current API permission suitability. |
| [HubSpot — Customize connected calendar and meeting scheduling page settings](https://knowledge.hubspot.com/meeting-tool/customize-connected-calendar-and-meeting-scheduling-page-settings), updated September 9, 2026; inspected October 16, 2026 | Documents that calendar sync can import externally created contact meetings and that CRM-created meetings can send calendar invitations. This is a concrete warning against treating familiar “calendar sync” UX as a neutral one-way-copy contract. Those effects are outside D14's selected scope.                                                                              |
| [Jump — Sync your diary to Google Calendar](https://www.usejump.co.uk/help/appointments/calendar-sync), updated September 24, 2026; inspected October 16, 2026                                                                                     | Explicitly describes one-way copies, external deletion not cancelling the source, minimal event content and a distinguishable connection/diary lifecycle. Useful precedent for clear ownership and disclosure. Its dedicated-calendar permission, automatic rolling window, account support and timing claims are not selected or proven for Core.                                |

External documentation establishes comparator behavior only. No provider grant,
mutation, imported event, private calendar or real-user usability observation was
used. Provider feasibility and exact destination strategy remain for the parent's
separate evidence review.
