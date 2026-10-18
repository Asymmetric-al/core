# D15 — own-account email provider evidence

**Subsequent status — October 16, 2026 UTC:** the founder explicitly ratified the
[corrected D15 decision](../phase28-d15-connected-email-adversarial-review.md)
and its required amendments. That synthesis governs where this original research
contribution leaves options open or uses provisional wording. This note remains
evidence of the research performed; ratification proves no runtime capability.

Research date: **October 16, 2026 UTC**. Research only. The founder selected
optional individual sending through the missionary's own connected account;
the precise profiles and recommendations below are not separately ratified or
implemented. Public primary documentation was inspected without signing in,
connecting accounts, retrieving mail or sending anything. One unauthenticated
Google discovery-document GET verified current upload metadata. Microsoft Learn's
sign-in banner did not prevent reading its public article bodies.

## Recommended permanent, bounded path

Use **native Asym drafting followed by a deliberate direct send through the
authenticated person's primary mailbox**. Request sending and necessary identity
permissions, not mailbox reading or provider-draft management. Start with one
recipient, authored plain text/basic safe rich text and links; a safe optional
signature is content reviewed with the message. Do not import a provider signature,
add tracking, attachments, aliases, shared mailboxes or automatic follow-up sequences
merely because a provider supports them. These are proportionate initial-profile
recommendations, not a claim that D15 selected every exclusion.

The permanent product promise must be **“write here, submit through your account,
and retain the actual known outcome”**, not “complete synchronized email history”
or “verified delivery.” Both provider profiles can support this useful promise.
A lost response can remain **Outcome unknown** indefinitely. That is an honest
supported state with a useful route to the actual mailbox, not a temporary defect
to conceal with automatic resending or a future inbox import.

Prefer the direct-send profile over provider draft-then-send: it needs less access,
has fewer external mutations and avoids exposing an externally editable draft
between review and dispatch. No email integration vendor or new package is needed
by this decision; use existing qualified P6/P17/P31 infrastructure and transport
facilities. Exact Google/Microsoft account classes must pass the tests below before
their button appears. This does not select a provider inventory on the founder's
behalf or require both adapters to launch together.

The [Q15 owner research](../phase28-q15-personal-email-connection-research.md)
identifies the required narrow P6/P17/ADR-0029 amendment: preserve the single
`sendEmail` writer, preparation, eligibility, durable intent/attempt and recovery
spine while adding a personal-account transport profile. P31 owns custody and
connection mechanics, not a new communication purpose. Calendar OAuth and native
newsletter authority do not authorize personal-email sending. Recording an actual
submission outcome does not establish a completed conversation, reply, donor
engagement or new staff/coach audience.

## Primary evidence register

All entries are **documented public contracts**, not tested Asym behavior or
observations from a real account. Dates below are displayed document-update dates
where captured; otherwise the inspection date is the only date asserted. A list of
permissions or endpoints does not prove an account has the service provisioned,
tenant consent allows it, or a particular production adapter works.

| ID  | Current primary source and date                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Supported fact and important limit                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E01 | [Gmail scope catalog](https://developers.google.com/workspace/gmail/api/auth/scopes), updated 2026-09-10                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `gmail.send` is sensitive and send-only. `gmail.compose`, `gmail.readonly`, `gmail.metadata`, `gmail.modify` and `gmail.settings.basic` are restricted. Sensitive verification and restricted-scope review differ; server storage/transmission of restricted-scope data invokes the stated security-assessment requirement. Do not claim send-only requires the same assessment as mailbox reading, or guarantees exemption from every other applicable obligation. |
| E02 | [Gmail getProfile](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users/getProfile) and [sendAs.list](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.settings.sendAs/list), both updated 2026-04-15                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `gmail.send` authorizes neither endpoint. getProfile returns a mailbox email address but accepts broader scopes; sendAs.list includes primary/custom From addresses and accepts settings/basic or broader mail scopes. No invisible “small identity lookup” using send-only, and no alias picker justified by a user-typed address.                                                                                                                                 |
| E03 | [Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect), updated 2026-06-15; [ID-token verification](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token); [Google Account email](https://support.google.com/accounts/answer/6316959?hl=en), latter two inspected 2026-10-16                                                                                                                                                                                                                                                                                                                                                                                                                               | Validated `sub` is stable; email can change and is not an identity key. `openid email` supplies identity/email assertions. Google is authoritative for the documented Gmail-address case, or verified email with `hd`; third-party Google Account email_verified alone is insufficient. Account help describes the Google Account email as its primary email. These facts do not prove Gmail is enabled or enumerate mailbox aliases.                               |
| E04 | [Gmail messages.send](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/send), updated 2026-04-15; [labels](https://developers.google.com/workspace/gmail/api/guides/labels), updated 2026-09-10                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Send accepts `gmail.send`, addresses the authenticated user as `me`, and returns a Message on success. SENT is automatically applied to messages sent through messages.send/drafts.send. No client idempotency key or exactly-once contract is documented. SENT is a mailbox fact, not recipient delivery proof.                                                                                                                                                    |
| E05 | [Gmail error handling](https://developers.google.com/workspace/gmail/api/guides/handle-errors), updated 2026-09-15                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Explicitly warns that a 200 does not ensure successful sending: sending-quota enforcement may lag. Daily sending limits are shared across the user's API, web and other clients; 429 can include a retry time. Backoff guidance is not a deduplication promise for a request whose outcome was lost.                                                                                                                                                                |
| E06 | [Gmail messages.list](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/list), updated 2026-04-15; [draft lifecycle](https://developers.google.com/workspace/gmail/api/guides/drafts), updated 2026-09-10                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Message-ID search is documented using `q`, but `q` is unavailable with gmail.metadata; send-only cannot list mail. Draft ID is stable while its underlying message is replaced; sending deletes the draft and creates a new SENT message ID. Missing draft does not identify why it disappeared.                                                                                                                                                                    |
| E07 | [Gmail quota](https://developers.google.com/workspace/gmail/api/reference/quota), updated 2026-09-10; [official discovery document](https://gmail.googleapis.com/$discovery/rest?version=v1), revision **20261012**, retrieved 2026-10-16                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Current API quotas are 1,200,000 units/project/minute and **6,000 units/user/project/minute**; messages.send costs 100. API quota is not a personal daily-send allowance. Discovery reports send media-upload maximum **36,700,160 bytes**. This is not a safe universal attachment or delivered-message limit.                                                                                                                                                     |
| E08 | [Graph sendMail](https://learn.microsoft.com/en-us/graph/api/user-sendmail?view=graph-rest-1.0), updated 2025-07-23; [permissions](https://learn.microsoft.com/en-us/graph/permissions-reference), inspected 2026-10-16                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Delegated Mail.Send works for documented work/school and personal account classes; saving to Sent Items defaults true and needs no Mail.ReadWrite. Success is 202 with no response body and does not mean completed processing/delivery. Application Mail.Send is a broader different authority, excluded here. No send idempotency key is documented.                                                                                                              |
| E09 | [Graph GET user](https://learn.microsoft.com/en-us/graph/api/user-get?view=graph-rest-1.0), inspected 2026-10-16; [user resource](https://learn.microsoft.com/en-us/graph/api/resources/user?view=graph-rest-1.0), updated 2026-04-20                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | `/me` profile retrieval requires delegated User.Read; Mail.Send is not a profile-read scope. `id` is opaque. `mail` defines the primary proxy address, with documented guest exceptions. A UPN or sign-in claim must not be guessed into a sender address, and a profile email alone is not proof of an available Exchange mailbox.                                                                                                                                 |
| E10 | [Graph send processing](https://learn.microsoft.com/en-us/graph/outlook-things-to-know-about-send-mail), updated 2024-11-07                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Most transport steps follow the HTTP response. Sent Items precedes downstream policy/routing; later failure reports arrive in the mailbox. Read receipts may not be produced. Neither acceptance nor a Sent copy is proof of receipt/read/reply.                                                                                                                                                                                                                    |
| E11 | [Graph create draft](https://learn.microsoft.com/en-us/graph/api/user-post-messages?view=graph-rest-1.0), inspected 2026-10-16; [send draft](https://learn.microsoft.com/en-us/graph/api/message-send?view=graph-rest-1.0), updated 2025-07-23; [immutable IDs](https://learn.microsoft.com/en-us/graph/outlook-immutable-id), updated 2024-11-07                                                                                                                                                                                                                                                                                                                                                                                                                         | Creating a draft needs Mail.ReadWrite; sending it remains a separate Mail.Send action. The documented immutable-ID sequence can find the sent copy using the draft ID, but availability can lag. The preference must be included per request; IDs remain stable within the mailbox, with archive/export-reimport exceptions. This is correlation, not duplicate-send prevention.                                                                                    |
| E12 | [Graph GET message](https://learn.microsoft.com/en-us/graph/api/message-get?view=graph-rest-1.0), [message resource](https://learn.microsoft.com/en-us/graph/api/resources/message?view=graph-rest-1.0), and [other-user sending](https://learn.microsoft.com/en-us/graph/outlook-send-mail-from-other-user), inspected 2026-10-16; other-user article updated 2024-11-07                                                                                                                                                                                                                                                                                                                                                                                                 | Message retrieval needs Mail.ReadBasic or broader read rights, not Mail.Send. internetMessageId is a message identifier, not an idempotency token. Other-user sending needs Mail.Send.Shared plus suitable mailbox delegation. Neither shared sending nor general read scope is selected by D15.                                                                                                                                                                    |
| E13 | [Microsoft publisher verification](https://learn.microsoft.com/en-us/entra/identity-platform/publisher-verification-overview), updated 2024-08-13                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Verification authenticates the publishing organization, not app quality or security certification. Tenant consent rules may require it; risk-based consent can block unverified multitenant apps seeking more than basic sign-in/profile rights. “Delegated permission does not require admin consent” in the permission catalog does not promise every organization lets users connect it.                                                                         |
| E14 | [Graph throttling](https://learn.microsoft.com/en-us/graph/throttling), updated 2025-01-15; [Outlook service limits](https://learn.microsoft.com/en-us/graph/throttling-limits#outlook-service-limits), updated 2026-02-06                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Documented 429 handling observes Retry-After; SDK retry behavior requires inspection. Outlook limits apply per app-ID/mailbox: 10,000 requests/10 minutes, four concurrent requests, 150 MB uploads/5 minutes. These are API ceilings, not recipient-delivery or allowed-outreach targets.                                                                                                                                                                          |
| E15 | [Graph large attachments](https://learn.microsoft.com/en-us/graph/outlook-large-attachments) and [Exchange limits](https://learn.microsoft.com/en-us/office365/servicedescriptions/exchange-online-service-description/exchange-online-limits), inspected 2026-10-16                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Larger attachment uploads add a separate session/draft path and Mail.ReadWrite; the advertised 150 MB capability is not a universal sending limit. Exchange mailbox defaults/configured transport/client/recipient limits differ; encoding adds overhead. Bound the entire serialized request and prepared content, not merely visible characters.                                                                                                                  |
| E16 | [Google web-server OAuth](https://developers.google.com/identity/protocols/oauth2/web-server#tokenrevoke), updated **2026-10-15**; [Microsoft scopes](https://learn.microsoft.com/en-us/entra/identity-platform/scopes-oidc), [changing requested permissions](https://learn.microsoft.com/en-us/entra/identity-platform/howto-update-permissions), [grant PATCH](https://learn.microsoft.com/en-us/graph/api/oauth2permissiongrant-update?view=graph-rest-1.0), [My Apps permission removal](https://support.microsoft.com/en-us/accounts-billing/work-school/edit-or-revoke-application-permissions-in-the-my-apps-portal), and [revokeSignInSessions](https://learn.microsoft.com/en-us/graph/api/user-revokesigninsessions?view=graph-rest-1.0), inspected 2026-10-16 | Calendar/email product purposes need separate local fences even when the provider grant/token is shared. Google revocation is not scoped to just mail or one OAuth client. Microsoft requesting fewer scopes is not existing-consent removal; programmatic grant editing needs privileged permissions, and session revocation is much broader than this feature. See the concrete cross-feature contract below.                                                     |

The register groups related primary pages into sixteen evidence families; its
conclusions do not rely on community answers, copied documentation mirrors or
third-party integration vendors. Source age is exposed rather than treated as
evidence that an API is obsolete. Public documentation is current as inspected,
not proof of deployed behavior in a particular cloud/account.

## Concrete initial adapter profiles

| Question                | Gmail recommendation                                                                                                                                                                                   | Microsoft Graph recommendation                                                                                                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mail permission         | `gmail.send`; separate `openid email` identity scopes.                                                                                                                                                 | Delegated `Mail.Send`; separate `User.Read` for the current own-account profile and qualified OIDC identity flow.                                                                                                       |
| Durable account binding | Validated issuer/subject plus the exact Asym Tenant/principal/purpose. Provider email is mutable display/sender evidence, never the connection key.                                                    | Validated provider issuer/tenant/subject/account identifiers plus exact Asym context. Use current `/me` identity; do not address a caller-supplied other mailbox.                                                       |
| Visible From            | Provider-asserted primary account address from a supported Google-hosted identity class, reviewed before Send. Do not authorize arbitrary aliases or infer Gmail capability from email_verified alone. | Current qualified primary mailbox address from the own-account profile; no UPN fallback or guessed guest address. Use `/me/sendMail`, letting the provider use that mailbox, without an arbitrary From/sender override. |
| Compose/send            | Save a native draft, freeze the reviewed MIME payload, then use `users/me/messages/send`. Server constructs recipient/From/header fields from admitted facts, not raw user MIME.                       | Save a native draft, freeze the reviewed safe JSON/body envelope, then use `/me/sendMail`. Preserve the default Sent Items behavior.                                                                                    |
| History evidence        | Durable Asym submission/attempt plus returned Message correlation if received.                                                                                                                         | Durable Asym submission/attempt plus exact HTTP/request correlation; 202 gives no message object/ID.                                                                                                                    |
| Inbox/replies           | Replies go to the real sender mailbox. No inbox read, automatic thread/reply import or delivery monitor.                                                                                               | Same. Do not set an unrelated replyTo or claim replies will appear in Asym.                                                                                                                                             |
| Uncertain submission    | Retain unknown; no blind retry, no draft creation as a repair, no account/provider fallback.                                                                                                           | Same; a response-less send cannot be reconciled by Mail.Send alone.                                                                                                                                                     |

For Google, a fresh provider identity assertion can establish which account is
connected without a restricted mailbox-profile read. It does **not** prove every
possible primary-address/alias configuration. Qualify the documented Google-hosted
identity cases and actual From behavior with controlled test accounts; block an
unsupported or ambiguous identity instead of adding `gmail.readonly` silently.
For Graph, explicitly reject unsupported guest/non-mailbox profiles when current
primary sender evidence is absent. Do not conduct a real test send during connection
merely to discover that an account exists. Ordinary service or policy rejection
must leave the original native draft/reviewed intent intact.

Neither recommendation implies sender metadata is forever current. Recheck the
provider-derived identity at the connection/composition/dispatch boundaries the
profile qualifies. If the reviewed sender changes, require review of that change;
do not silently replace it. A profile without mailbox-read rights cannot claim an
atomic lock on externally administered mailbox configuration or inspect the final
rewritten wire message. Present the authenticated sending account accurately and
qualify the provider's own primary-sender behavior; do not promise more.

## Stable grant, token renewal and one deliberate submission

Recommended mechanics, derived from the evidence and the existing owner seams:

1. **Connection is authority, not an email.** Bind the OAuth transaction and returned
   account to the initiating Asym Tenant/principal/purpose. Keep token material in
   P31 custody. Show the selected account and real permission breadth. Connecting,
   consenting, token refresh and reconnecting send no message.
2. **Refresh is credential maintenance.** Preserve the stable account/grant binding
   and each accepted message's business identity when access/refresh tokens rotate.
   Request offline access only for the already authorized durable dispatch job,
   not future unsolicited messages. Do not repeatedly prompt for consent when a
   normal refresh suffices. If fresh identity indicates a different account, stop
   and require explicit connection review; never relabel the old attempts.
3. **Prepare a native message.** Current source/recipient/channel rights and safety
   restrictions apply before acceptance and at the final authorized dispatch
   boundary. Sender, recipient, content and native history audience are explicit.
   Store the exact prepared envelope and version under the existing governed
   preparation contract; do not rerender an attempted message during recovery.
4. **Accept once locally.** The native send intent, audit and required work commit
   atomically. Repeated clicks return the existing intent. Before provider I/O,
   durably record the attempt and final dispatch admission under the current
   authority/generation. Network work remains outside that database transaction.
5. **Submit without hidden send retries.** Audit transport/SDK/proxy retry defaults.
   No layer may replay a possibly accepted send merely because it timed out,
   received an ambiguous server failure or lost its worker lease. The exact bytes,
   account and operation correlation remain immutable evidence.
6. **Classify evidence precisely.** A definite pre-dispatch cancellation makes no
   send request. A documented definitive rejection can support a bounded retry
   under the same admitted intent if no prior attempt is unresolved and current
   authority still holds. A rate-limit response provides a wait rule; it is not
   proof that some earlier timed-out request had no effect. Local crash after
   admission but before known I/O may conservatively remain unknown.
7. **Keep uncertainty without manufacturing facts.** A received success establishes
   the provider's documented acceptance level. A missing response establishes
   neither failure nor safe-to-resend. Correlation helps retain later evidence;
   it does not itself cause provider deduplication. A future authorized readback
   path may improve evidence, but empty results never by themselves prove absence.
8. **Revoke forward authority, retain truth.** Disconnect/permission loss fences new
   ordinary dispatches; it cannot retract a submission already accepted/in flight.
   Credential renewal cannot revive a stopped send or replay an uncertain one.
   Keep minimal original-attempt evidence through governed retention and restore;
   no auto-forward, delete-from-Sent or recall operation is implied.

The no-replay rule is an application safety recommendation based on missing
provider deduplication guarantees, not a claim that either provider always creates
duplicates. A local at-most-once dispatch boundary can deliberately sacrifice
automatic completion after a crash. It cannot guarantee exactly-once delivery
inside an external mail network.

## Why readback and provider drafts are not free fixes

**Targeted readback is a possible separately justified alternative, not selected
baseline scope.** Gmail can search an exact RFC Message-ID with broader read
permission; metadata-only cannot use that query. Requesting a read scope for a
narrow query still grants broad mailbox capability. A name/recipient/subject/time
match is weaker than exact operation correlation. Even an exact match needs
ownership and content/context checks; Message-ID is not an unforgeable receipt.

Graph Mail.ReadBasic is less invasive than body reading, but still permits basic
metadata across the mailbox, not only this application's messages. A known exact
message ID can support a targeted GET. Direct sendMail does not return that ID;
adding an x-header or internetMessageId is not a documented server deduplication
key, and general header search must not be assumed to exist under a minimal scope.
Do not add broad polling, delta, subscriptions or historical Sent import to fill
this evidence gap.

**Draft-then-send is the strongest technical alternative.** Graph documents a
draft/immutable-ID/send/GET sequence useful for positive correlation. Gmail has a
stable draft container but replaces message identity on send. Both introduce
external draft creation whose own lost acknowledgement needs handling, plus
externally editable/deletable content. A user can change or send that draft outside
Asym after review. No inspected send-draft contract establishes a version-conditional
send that atomically fixes this review-to-send race. A still-present draft or a
404 after sending does not prove that resending is safe. The extra permissions
and lifecycle are not warranted just to eliminate the label Outcome unknown.

| Alternative                                | Useful benefit                                                                   | Why not the recommended baseline                                                                                                                                             |
| ------------------------------------------ | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Direct send with sending + identity scopes | Deliberate integrated personal email, minimal mail access, native draft/history. | Must keep acceptance and uncertainty honest; cannot observe later replies/delivery. Recommended.                                                                             |
| Additional targeted mail read              | Better positive evidence for some sends; potentially better support diagnosis.   | Broader grant/privacy/review obligations; search or absence is not exactly-once proof. Requires separate purpose and consent.                                                |
| Provider draft then send/read              | Graph has a documented stable-ID route to a Sent copy.                           | More rights, mutations and external edit races; no documented idempotent or conditional-send guarantee.                                                                      |
| Open the person's usual email app          | Least connection complexity; full provider mailbox experience.                   | Handoff is not sending evidence and may require an authored interaction entry. Keep useful for unconnected/unsupported users, but not as an automatic retry of unknown work. |

## Permanent truthful UI/history contract

Recommended copy should follow the actual provider evidence, not generic email
marketing vocabulary. P27 outcome/history visibility remains source-owned.

| Actual state                                | Minimal visible wording                                                                                                       | Available behavior and limit                                                                                                                              |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No connection                               | **Use your email account**; explain sending purpose and supported account.                                                    | Native composition/handoff remains useful; connecting alone sends nothing.                                                                                |
| Native draft saved                          | **Draft saved in Asym**.                                                                                                      | Does not imply a draft exists in Gmail/Outlook.                                                                                                           |
| Accepted native intent, no provider outcome | **Sending…** with persistent status.                                                                                          | Reopening or repeated Send retrieves the same intent. Show exact sender/recipient.                                                                        |
| Documented provider success received        | **Accepted by Gmail** / **Accepted by Outlook**. Detail: **Delivery isn't confirmed here. Replies go to your email account.** | Record the actual accepted submission once. Do not label Delivered, Read, Replied or completed conversation.                                              |
| Definitively not submitted/rejected         | **Not sent** with the specific safe reason.                                                                                   | Relevant correction/reconnect/retry only after the evidence proves this classification. No account fallback.                                              |
| Response lost or outcome unresolved         | **Sending outcome unknown. Check your email account before sending another message.**                                         | Open the real mailbox and retain the original attempt. No Retry button that resubmits it. Checking or not finding Sent is not provider proof of non-send. |
| Email stopped after an attempt              | **Email sending stopped. Earlier sending outcomes are unchanged.**                                                            | Stops new work, does not unsend or delete the provider copy. Show provider permission-removal state separately when applicable.                           |

A person's later statement that they found/sent/received a message is authored
source evidence if the owning workflow admits it; it must not overwrite transport
evidence as an API receipt. Do not invent a mandatory second manual activity entry
for a successfully accepted send. Nor should the connected feature imply a complete
history of messages sent elsewhere, current delivery/bounce state, or automatic
read/reply capture. Later failures may appear only in the actual mailbox.

Use shared base-maia/Base UI components and persistent readable status, with
keyboard/screen-reader announcements and recoverable composition. A small account
line, one To field, subject, body, optional signature and explicit Send are enough
for the recommended initial profile. No permission-selection wizard or inbox
facsimile is necessary. Message-history visibility must be explained before send
when it would otherwise be surprising; sending is not permission to share a body
with staff or a coach.

## D14 coupling: stopping one purpose versus removing provider access

**Documented Google behavior:** incremental authorization can combine previously
granted scopes; refreshing that authorization returns combined authority. Revoking
the user's token removes the project's prior scopes and invalidates access/refresh
tokens across its OAuth clients. Revocation may take time to have full effect.
Therefore, using two client IDs in one Google Cloud project is not documented
revocation isolation. E16 is current primary evidence, not an inference from the
word “disconnect.”

**Documented Microsoft behavior:** `.default` can return all previously granted
Graph scopes and prompt for registered permissions. Changing requested permissions
does not revoke existing grants. Grant PATCH can replace the allowed scope set,
but requires DelegatedPermissionGrant.ReadWrite.All and a supported Entra role;
this is not a Mail.Send/User.Read operation. My Apps distinguishes user-consented
permissions from admin-consented permissions users cannot themselves revoke.
revokeSignInSessions invalidates the user's app refresh tokens/session cookies
broadly; it is not a mail-only disconnect endpoint.

**Recommended bounded solution:**

1. Keep one P31 record of actual provider account/grant relationships and separate
   source-purpose enablement/fences for calendar and personal mail. Do not assume
   independently stored token strings mean independently revocable authority.
2. Request additional mail scopes only after explicit D15 connection intent.
   Inspect the actual granted scopes; a partial grant does not activate sending.
   Existing calendar consent, even a technically broad token, is not mail-purpose
   authority. Avoid a generic `.default` request that obscures scope selection.
3. **Stop email sending** immediately disables the local mail purpose and fences
   unsent work. When a shared grant remains needed for calendar, say so plainly:
   **“Email sending is stopped in Asym. Your provider permissions are still in
   place for this connected account.”** Offer the provider permission-management
   route and describe the known calendar consequence. Never label this **Email
   permission removed** or keep a supposedly deleted connection secretly active.
4. **Remove provider access** is a separate deliberate operation. Before a broad
   revoke, show that connected calendar updates will also lose access, then fence
   all known affected purposes locally. Report provider revocation as requested,
   confirmed to its documented level, or unresolved. Do not await remote revocation
   before enforcing local stop; do not promise instantaneous remote invalidation.
5. If the user wants mail permission removed while retaining calendar, use a
   provider-supported selective-removal route only where actually qualified.
   Otherwise explain full removal followed by deliberate calendar-only reconnection.
   Do not add Microsoft directory grant-management privileges to automate this.
   Do not automatically re-request stopped mail scopes on calendar reconnect.
6. Map the impact across shared account/grant uses, including other authorized
   Asym contexts, without disclosing another Tenant's private connection details.
   Unknown external grant topology is a disclosed limit, not “calendar unaffected.”
   No separate OAuth project/client architecture is mandated by this research.

This creates a small honest product boundary, not a new permission-management
application. It also preserves D14's truthful native/calendar states when a
provider revocation initiated through email makes calendar authorization fail.

## Limits, production permission and verification implications

- Rate budgets must account for the actual mailbox and app, even if the same
  external account has separate Asym Tenant bindings. Respect Retry-After and
  provider backoff for safely retryable requests, while keeping unresolved sends
  fenced. Do not expose API ceilings as the user's supported daily outreach quota.
- Gmail's current 6,000-unit user/project/minute figure replaces commonly repeated
  older numbers. Recheck published limits when qualifying the production profile;
  sending limits also depend on mailbox class and activity outside Asym.
- Keep the initial prepared text/rich-text payload comfortably bounded and count
  serialized bytes/encoding. No attachment pipeline is needed for this profile.
  Do not conflate Google's upload maximum, Graph's S/MIME-specific 4 MB note,
  large-attachment capability or configurable Exchange message limits into one
  guaranteed provider-neutral size. Oversize input fails before external dispatch.
- Public Gmail sending requires the applicable sensitive-scope verification;
  adding restricted mailbox scopes materially changes the review/assessment path.
  Google internal/testing exceptions are not evidence that a multitenant public
  Core product is exempt. Microsoft publisher verification and tenant consent
  readiness are deployment work, not proof that mail will be delivered.
- Existing approved OAuth/token machinery should be reused. Do not add a connector
  vendor, SMTP password handling, domain-wide delegation, application Mail.Send,
  shared-mail permission or new dependency to bypass an unresolved qualification.

## Material risks, proposed exact clauses and falsifiable proofs

Severity and likelihood below are engineering judgments, not measured incidence.
These local PE identifiers are research recommendations, not published requirements.

| Concern and practical impact                                                                    | Severity / likelihood                                                        | Evidence; proposed exact clause                                                                                                                                                                                                                | Required proof                                                                                                                                                                                                                                                      |
| ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wrong sender or alias leaks identity or impersonates another mailbox.                           | High / plausible with multiple accounts or mutable email.                    | E02/E03/E09/E12. **PE01:** The sender SHALL be derived from the qualified authenticated primary mailbox, bound to stable provider identity and Asym context; caller addresses, UPN guesses and unqualified aliases SHALL NOT confer authority. | Account swap, renamed email, missing mail, external Google email, Graph guest and alias attempts fail safely or require exact reviewed rebinding; no message is used as a connection test.                                                                          |
| Timeout/worker recovery causes repeated outreach.                                               | High / ordinary network failure is plausible.                                | E04/E08/E11. **PE02:** Possibly submitted work SHALL retain its original envelope/identity and SHALL NOT be automatically resubmitted, rerendered, moved to another account or converted into a new operation.                                 | Lost success, process crash before/after I/O, duplicate job, expired lease and reconnect never cause a second send. Conservative unknown remains possible.                                                                                                          |
| “Sent” is interpreted as recipient delivery or interaction completion.                          | High for misleading history / likely if generic toasts are reused.           | E05/E08/E10. **PE03:** Native acceptance, provider acceptance, unknown submission, later delivery and authored interaction evidence SHALL remain distinct.                                                                                     | Gmail 200/Graph 202 cannot produce Delivered/Read/Replied or completed conversation; later absent readback cannot produce Not sent.                                                                                                                                 |
| Broader scope is silently added for identity or reconciliation.                                 | High privacy impact / plausible implementation shortcut.                     | E01/E02/E06/E12. **PE04:** Send-only profiles SHALL NOT read mailbox content/metadata or provider settings using assumed permission; any broader profile requires explicit purpose, disclosed consent and production qualification.            | getProfile/sendAs/message-read calls are absent under send-only; no background mailbox mirror or scope escalation after an unknown send.                                                                                                                            |
| Draft alternative sends content different from the reviewed message.                            | High / plausible if external drafts are introduced.                          | E06/E11. **PE05:** The initial profile SHALL draft natively and submit the immutable prepared envelope; a provider-draft alternative requires independent edit-race and lost-create proof.                                                     | Inspect provider requests and race an external draft edit in any future alternative; no unqualified conditional-send claim.                                                                                                                                         |
| Refresh/reconnect revives a stopped or uncertain send.                                          | High / plausible lifecycle error.                                            | E03 plus owner recovery invariants. **PE06:** Credential renewal SHALL preserve account binding and intent identity, create no send, and never override current dispatch fences or unknown outcomes.                                           | Token rotation, wrong-account reauth, permission loss, disconnect-versus-dispatch and restored stale jobs preserve history without new unauthorized I/O.                                                                                                            |
| Throttling creates hidden retry storms or unsupported scale/size promises.                      | Medium–high / expected at limits.                                            | E05/E07/E14/E15. **PE07:** Retry policy SHALL separate documented non-acceptance from uncertain outcomes, observe shared mailbox budgets, and validate full prepared payload size before dispatch.                                             | Inject provider 429/Retry-After, ambiguous 5xx, timeout, oversize and multiple Asym contexts using one mailbox; only qualified rejection paths retry.                                                                                                               |
| Individual mail becomes an unreviewed bulk sender or shared body archive.                       | High / plausible feature reuse.                                              | D15 selected scope and Q15 owner boundaries. **PE08:** Personal sending SHALL retain current purpose/recipient restrictions and source history audience; it SHALL NOT imply newsletter enrollment, shared history, sequences or inbox import.  | One-recipient initial profile rejects hidden CC/BCC/additional headers; body/history audience and suppression paths are tested independently of OAuth scope.                                                                                                        |
| Email disconnect either silently breaks calendar or falsely claims provider access was removed. | High for authority/trust / plausible with the same Google/Microsoft account. | E16. **PE09:** Local purpose disablement and provider-grant revocation SHALL remain distinct; broad removal SHALL disclose and fence its actual cross-feature impact, and reconnect SHALL not restore stopped purposes.                        | Connect calendar then mail; reject partial consent; stop only mail; remove shared provider access; fail/delay revoke; reconnect calendar only. Verify both features' truthful states, no mail dispatch, no silent scope re-addition and no other-Tenant disclosure. |

Before activation, attach real controlled-account evidence for exact From/Reply-To,
MIME/HTML handling, ordinary Sent behavior, known rejections, missing responses,
transport retry suppression, token renewal, consent denial and supported account
types. These tests can prove the implemented boundary and useful observed behavior;
they cannot prove unlimited exactly-once delivery, all future provider policies or
complete history under send-only access. No such tests were run in this research.
