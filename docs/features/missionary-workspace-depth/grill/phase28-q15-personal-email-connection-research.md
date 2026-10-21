# Q15 frontier — individual email through a connected account

Research date: October 16, 2026 UTC. **Answered A — optional connected-account
sending.** The founder requested deep research and a full adversarial review. The
[D15 review](phase28-d15-connected-email-adversarial-review.md) records the corrected
decision and required amendments, explicitly ratified by the founder on
October 16, 2026 UTC. Ratification does not establish a live connector.
The options below preserve the question as presented. D14's corrected
calendar decision and required amendments are explicitly ratified. They do not
settle this independent email scope. D7's complete native newsletter, qualified
reply route and per-issue authorization remain required under either answer.

## The single product choice

**Should a missionary be able to write and send an individual follow-up email
inside Asym using their own connected email account?**

- **A — Optional connected-account sending (recommended).** When the organization
  permits it, Maya connects a supported email account, writes an individual
  follow-up in Asym and deliberately sends it. Asym shows the actual sending
  outcome without requiring a second manual sent-message entry.
- **B — Use the usual email app initially.** Asym opens Maya's email app for
  personal follow-up. She sends there and can deliberately record the relevant
  interaction in Asym. No personal email-account connection is added initially.

Recommend A for the integrated daily-work goal: fewer application switches and
less duplicate recording for messages deliberately sent inside Asym. B is the
strongest simpler alternative and avoids another durable external sender adapter.
This is a product judgment, not measured Asym-user demand or proof of an existing
connector. Calendar connection neither authorizes email access nor makes a shared
Google/Microsoft login sufficient for a new mail purpose.

Neither option selects general inbox browsing, historical mailbox/contact import,
automatic reply synchronization, shared mailbox access, automatic outreach,
sequence sending or automatic publication of message bodies to staff/coaches.
Ordinary replies can still arrive in the actual sender's email application;
D7's separately qualified newsletter reply job remains intact. Exact provider,
permissions, reply handling and interaction-history visibility follow the
selected outcome and existing owners, not a generic “connect email” switch.

## Repository facts

- [Founder brief](phase28-founder-brief.md:241) explicitly leaves email connection
  accounts, scope, mappings, direction, currentness, revocation and recovery open.
  It excludes broad mailbox/address-book ingestion by default. Its daily-work
  section at line 125 says opening an email app does not establish a sent message.
- [P28 open decisions](../../../prds/sitestacker-parity/roadmap.md#phase-28-open-decisions)
  requires selection of calendar/email connection scope; the native/manual path
  must remain useful during outages. [P31](../../../prds/sitestacker-parity/roadmap.md#phase-31)
  owns connection/transport, not message-purpose authority or business outcomes.
- [Ratified D7](phase28-d7-adversarial-review.md:21) requires native newsletters
  and qualified replies independent of optional external sync/new inboxes. It
  does not by itself qualify a general personal-mailbox sender or inbox reader.
- Current supporter Email builds a `mailto:` link in
  [donors-page-model.ts](../../../../apps/missionary/app/donors/donors-page-model.ts:166)
  and renders it in [donors-page-detail.tsx](../../../../apps/missionary/app/donors/donors-page-detail.tsx:433).
  [Log Email](../../../../apps/missionary/app/donors/donors-page-dialogs.tsx:49)
  records a manual activity through the [donor API](../../../../packages/api/src/missionary-portal/donor.ts:129).
  These are handoff and authored history, not actual email dispatch evidence.
- [Missionary Email Studio](../../../../apps/missionary/app/email-studio/page-client.tsx:77)
  is Coming Soon; [settings](../../../../apps/missionary/app/settings/page-client.tsx:247)
  has hardcoded integration cards. The [tenant email connection](../../../../packages/api/src/email/connect.ts:67)
  and [test sender](../../../../packages/api/src/email/test-send.ts:70) are not a
  personal mailbox connection. The [inbound workflow](../../../../packages/api/src/workflows/functions/inbound-email-processing.ts:27)
  routes into Support Hub; it is not authority to import missionary correspondence.

Bounded current-source searches establish these observations, not whole-system
or hosted absence. Existing source behavior is not automatically the permanent
path; A would require an explicit qualified personal-message producer and adapter.
No new source commands, credentials or dependencies are added during this research.

**Governing conflict requiring explicit amendment under A.**
[P6](../../../prds/sitestacker-parity/phase-06-shared-communication-event-model.md:387)
keeps `sendEmail` as the sole external writer; its current connection composition
at line 425 and [ADR-0029](../../../adr/0029-tenant-owned-resend-and-composed-delivery-identities.md:18)
use one tenant Resend connection with bounded sender profiles.
[P17](../../../prds/sitestacker-parity/phase-17-system-messages-template-management.md:3725)
currently excludes the missionary personal-email product and multiple transport
providers. Selecting A therefore requires a narrow, explicit P6/P17/ADR-0029
extension for personal-account sending while preserving the shared preparation,
eligibility, dispatch, recovery and history spine. P31 alone cannot authorize a
new sender or bypass `sendEmail`. B does not require that transport extension.
Automatic outcome recording means qualified sending/outreach evidence, not an
automatically completed personal exchange or a new shared audience; the
[P27 distinction](../../../prds/sitestacker-parity/phase-27-donor-development/context.md:134)
remains binding.

## Primary external evidence and important limits

- [HubSpot's connected-inbox FAQ](https://knowledge.hubspot.com/connected-email/hubspot-crm-email-integration-faq)
  describes one-to-one sending and logging from an individual work account. This
  supports the comparable job, not adoption of its broader reading/logging or
  attachment defaults. Such behavior requires separate Core purpose/audience
  authority and must not expose private missionary correspondence by association.
- [Google Gmail scopes](https://developers.google.com/workspace/gmail/api/auth/scopes)
  distinguishes send permission from message/metadata reading and labels their
  sensitivity differently. A send capability does not imply permission to read
  the inbox, or prove that send-only scope can provide every recovery guarantee.
- [Microsoft Graph sendMail](https://learn.microsoft.com/en-us/graph/api/user-sendmail?view=graph-rest-1.0)
  offers Mail.Send and documents acceptance separately from completed delivery.
  No unlimited exactly-once or safe blind retry guarantee follows from that API.
- [MPDX Connect Services](https://help.mpdx.org/article/449-connect-services), last
  updated September 2022, describes calendar/contact and newsletter integrations.
  Its reference to a Gmail address is not evidence of a native personal-mailbox
  send/read feature. It is a dated comparison, not a dependency prescription.

Checked October 16, 2026 through primary documentation; no real accounts used.
If A is chosen, resolve exact sender identity, allowed content/destinations,
current consent/restrictions, durable send identity, lost acknowledgement,
provider acceptance versus delivery, revocation, reply destination, and permitted
history before formalizing it. Personal connected mail is not a way around P6/P17
or a replacement for native newsletters. P31 handles transport; P9/P28 own the
qualified relationship purpose; P12/current safety owners remain authoritative.

No founder answer, provider inventory, broader email scope, new access right,
implementation readiness or runtime send success is inferred by this note. Ask
this one outcome question; do not bundle further mailbox/history questions into
this round. Formal specification and tickets still await their explicit transitions.
