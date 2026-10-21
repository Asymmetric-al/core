# Q14 frontier: ongoing calendar connection versus manual handoff

Research date: October 16, 2026 UTC. **Answered: A — Optional automatic calendar
updates.** The founder requires a clean, easy, beautiful, clear journey without
needless complexity. The [D14 adversarial review](phase28-d14-calendar-updates-adversarial-review.md)
records the answer and completed review. On October 16, 2026 UTC the founder
explicitly ratified the corrected decision and its required amendments. This
establishes design direction, not implemented functionality. D13 retains its
own status. The original choice and pre-answer reasoning are preserved below.

## The original single product choice (now answered)

**Should Asym keep appointments up to date in a missionary's own calendar?**

- **A — Optional automatic calendar updates (recommended).** Maya deliberately
  adds an Asym appointment to a connected calendar. Later changes or cancellation
  made in Asym update that calendar entry. Appointment details are managed in
  Asym; unrelated calendar events and the mailbox are not imported.
- **B — Manual Add to calendar initially.** Maya adds an appointment to her
  calendar when needed, then manages subsequent calendar changes herself.
  There is no continuous calendar connection in the initial scope.

Recommend A for avoiding duplicate maintenance of deliberately shared appointments,
while preserving complete native scheduling when no calendar is connected or a
provider is unavailable. B is the strongest simpler alternative: less integration
work and fewer ongoing permissions, with explicit manual update responsibility.
These are product tradeoffs, not observed Asym-user behavior or a claim that a
current connector already works.

## Evidence and boundaries

- [Founder brief](phase28-founder-brief.md:241) explicitly leaves calendar/email
  connection scope open: exact accounts, read/write powers, mappings, direction,
  currentness, revocation, conflict and recovery. It forbids broad mailbox/address-
  book ingestion by default and requires a useful manual path. An invitation does
  not establish that a meeting occurred.
- [P28 open decisions](../../../prds/sitestacker-parity/roadmap.md#phase-28-open-decisions)
  leaves required calendar/email connections to this session; they are not settled
  by native newsletter sending or the retired historical stack document.
- [P31 connection registry](../../../prds/sitestacker-parity/roadmap.md:4419)
  owns scopes, credential custody, connection state and recovery.
  [Ownership and integrations](../../../prds/sitestacker-parity/roadmap.md#phase-31-ownership-and-integrations)
  keeps appointment meaning, eligible actions and durable business effects with
  their source owner. Connected is not synchronized or business-complete.
- [Retained P31 first consumer](../../../prds/program-roadmap/owner-constraints.md:451)
  remains the qualified Missionary Support Feed. A calendar selection does not
  displace that contract, widen financial feeds or make ordinary native work wait
  for a whole external-integration phase.

Under A, the later bounded source/connection contract must specify supported
providers, exact calendars and permissions, allowed exported fields, reliable
update/cancellation identity, external-edit disagreement, revoked access and
lost-response/retry behavior. The completed D14 review resolves these requirements into exact proposed
clauses; actual source/provider qualification remains a release gate, not an
assumption that any OAuth scope can safely implement the choice. Tenant
policy and current source permission remain ceilings. Deliberately adding an
appointment does not by itself authorize emailing attendees or adding private
supporter/care details to calendar text.

Under B, manual handoff needs truthful copy that later edits do not stay in sync;
do not label a file download or link as Connected or Synced. Both options retain
native appointments, independent manual recovery, current confidentiality and
explicit meeting-outcome recording. Neither includes two-way calendar import,
free/busy surveillance, automatic contact import or email account access.

This question selects the product outcome, not the transport, token model, API
library, provider inventory or a new dependency. No current provider capability,
source appointment producer, implementation readiness or runtime synchronization
is established by this note. Initial evidence was scoped repository research and owner
review. D14 adds current primary-provider research, independent review and 24/24
local model outcomes with explicit limits. Actual source, database/role, provider
and UI qualification remains required. Email-connection scope remains independent;
this answered question must not be presented again as unresolved.
