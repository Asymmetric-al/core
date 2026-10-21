# D15 — current source and personal-email journey evidence

**Subsequent status — October 16, 2026 UTC:** the founder explicitly ratified the
[corrected D15 decision](../phase28-d15-connected-email-adversarial-review.md)
and its required amendments. That synthesis governs where this original research
contribution leaves options open or uses provisional wording. This note remains
evidence of the research performed; ratification proves no runtime capability.

Research date: October 16, 2026 UTC. Research only. Founder selected optional
personal-account individual sending when the organization permits it. This note
does not select a provider, authorize a connection or send, implement a feature,
or establish deployed behavior. Recommendations below are candidates for the
D15 review, not additional founder decisions.

## Scope and authority

Inspected the missionary supporter email/manual activity/settings/Email Studio
paths; admin template save/test-send; Support Hub composer, serialization,
attachment staging, reply route and Supabase adapter; the Resend send wrapper;
email consent helper, sender-profile types, inbound workflow, shared rich-text
components and representative existing tests. Bounded searches covered
`apps/missionary/app`, `packages/api/src/email`, `packages/email`, Support Hub
paths, and sender-profile names across API/database/migrations. Read applicable
root, missionary/admin, API and UI instructions; Supabase guidance was consulted
for interpreting privileged database paths. No application, database, OAuth,
mailbox, migration or provider operations were run. No tests were run.

The [Q15 choice](/workspace/core/docs/features/missionary-workspace-depth/grill/phase28-q15-personal-email-connection-research.md:13)
selects intentional individual sending. Its [scope boundary](/workspace/core/docs/features/missionary-workspace-depth/grill/phase28-q15-personal-email-connection-research.md:28)
does not select general inbox/history/contact import, reply synchronization,
shared mailboxes, sequences or automatic body sharing. The frontier file's
“awaiting answer” wording records its pre-answer state; the founder's later A
answer governs this review. D7 newsletters and D14 calendar purposes remain
independent.

Accepted [P6 intent](/workspace/core/docs/prds/sitestacker-parity/phase-06-shared-communication-event-model.md:380)
distinguishes source-owned communication from synthetic tests. Its
[sole-writer rule](/workspace/core/docs/prds/sitestacker-parity/phase-06-shared-communication-event-model.md:387),
[body-free history](/workspace/core/docs/prds/sitestacker-parity/phase-06-shared-communication-event-model.md:398)
and [one tenant Resend composition](/workspace/core/docs/prds/sitestacker-parity/phase-06-shared-communication-event-model.md:425)
require an explicit narrow D15 owner amendment. The current low-level function
named `sendEmail` is not evidence that the complete accepted P6 preparation,
admission and recovery contract is implemented. P31 transport must compose with
the amended spine; it cannot silently become an independent sender authority.

## What exists, and what is unsafe to copy unchanged

| Evidence                                                                                                                                                                                                                                                                                        | Current fact                                                                                                                                                                                                                                                          | D15 implication                                                                                                                                                                                                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Supporter email helper](/workspace/core/apps/missionary/app/donors/donors-page-model.ts:166); [detail action](/workspace/core/apps/missionary/app/donors/donors-page-detail.tsx:433)                                                                                                           | Email is a `mailto:` handoff; anonymous/missing addresses return no link.                                                                                                                                                                                             | Preserve the useful external-app path where permitted, but opening it supplies no sending outcome. Do not auto-complete an exchange or invent a sent event.                                                                                                                                                             |
| [Manual Log Email](/workspace/core/apps/missionary/app/donors/donors-page-dialogs.tsx:49); [activity insert](/workspace/core/packages/api/src/missionary-portal/donor.ts:129)                                                                                                                   | A user-authored activity note is inserted after missionary donor-access checking. The payload records type, note and date.                                                                                                                                            | Manual authored history and observed native dispatch need separate provenance. Native sending must not require a second manual log or silently convert existing notes to provider evidence.                                                                                                                             |
| [Missionary Email Studio](/workspace/core/apps/missionary/app/email-studio/page-client.tsx:77); [settings cards](/workspace/core/apps/missionary/app/settings/page-client.tsx:247); [settings save](/workspace/core/apps/missionary/app/settings/page-client.tsx:135)                           | Studio says Coming Soon. Mailchimp Connected is literal UI. Save only clears local dirty state in the inspected settings handler.                                                                                                                                     | These are not personal-account connection/readiness evidence. A real card must distinguish connected identity, ready, attention needed and organization unavailable.                                                                                                                                                    |
| [Tenant connection gate](/workspace/core/packages/api/src/email/connect.ts:67); [settings read](/workspace/core/packages/api/src/email/connect.ts:98)                                                                                                                                           | Admin/super-admin connection operates on authenticated tenant email settings.                                                                                                                                                                                         | Do not expose this tenant Resend configuration as missionary OAuth or claim that an existing calendar/app-login connection authorizes mail.                                                                                                                                                                             |
| [Admin template save](</workspace/core/apps/admin/app/(app)/email/email-studio-api.ts:49>); [template update](/workspace/core/packages/api/src/email/template-store.ts:438)                                                                                                                     | Saves campaign design/HTML/text/subject through a real API. Update reads current version, updates by tenant/id, then inserts a version separately; no expected-version predicate appears in this update.                                                              | Useful persistence experience, but not a private individual draft or an atomic immutable send snapshot. Copying it would risk stale-tab overwrites and disagreement between content and send authorization. This is a conditional reuse hazard, not a demonstrated production race.                                     |
| [Support reply route](/workspace/core/apps/admin/app/api/admin/support/conversations/[id]/replies/route.ts:11); [access gate](/workspace/core/packages/api/src/admin/support-hub/route-helpers.ts:31); [adapter binding](/workspace/core/packages/api/src/admin/support-hub/adapter/index.ts:9) | Staff/admin/super-admin route binds the authenticated tenant, checks route/body conversation match and calls the Supabase adapter.                                                                                                                                    | This is a staff support surface, not a missionary personal sending permission. Tenant isolation alone does not establish ownership of a connected personal account.                                                                                                                                                     |
| [Support actor and message insert](/workspace/core/packages/api/src/admin/support-hub/adapter/supabase.ts:916)                                                                                                                                                                                  | Adapter uses submitted `authorAgentId` to find a tenant support agent, writes `isPrivate:false`, state draft/queued, fresh message IDs, and support-derived headers. Route passes parsed body rather than resolving the personal sender from its authenticated actor. | Do not copy its actor/header binding, draft audience or fresh-per-call identity. For D15, the server must bind actor, tenant, allowed relationship and exact owned connection; a client-supplied agent/name/email is not sender authority. No claim here that the support route currently dispatches impersonated mail. |
| [Support send feedback](/workspace/core/apps/admin/features/support-hub/components/detail/composer/use-conversation-composer.ts:206); [adapter result](/workspace/core/packages/api/src/admin/support-hub/adapter/supabase.ts:929)                                                              | UI says “Reply sent” and resets after mutation; inspected adapter writes a queued record and returns it, with no provider dispatch in that function.                                                                                                                  | A queued row cannot justify D15 Sent. Broader worker/deployed behavior was not qualified. Keep the draft/content and persistent operation status until the precise outcome is known.                                                                                                                                    |
| [Support draft action](/workspace/core/apps/admin/features/support-hub/components/detail/composer/use-conversation-composer.ts:231)                                                                                                                                                             | Explicit draft save writes via the reply mutation and resets only after resolved success. Current unsaved editor state is React state.                                                                                                                                | Save-before-clear and distinct saving feedback are useful. The support conversation storage/audience and append-new-message semantics are not a private editable draft contract.                                                                                                                                        |
| [Attachment stub](/workspace/core/apps/admin/features/support-hub/components/detail/composer/AttachmentChips.tsx:17); [serializer warning](/workspace/core/apps/admin/features/support-hub/components/detail/composer/serialize-payload.ts:41)                                                  | File picker stores metadata and `local:` references; comments explicitly say no upload pipeline/file bytes.                                                                                                                                                           | The visual chip is not an attachment. A future file must be durably owned, checked, accessible for the exact permitted send and included by a qualified adapter; otherwise omit that control.                                                                                                                           |
| [Template test send](/workspace/core/packages/api/src/email/template-test-send.ts:224)                                                                                                                                                                                                          | Fresh UUID per request; consent is conditional on an available admin client; tenant Resend sends first, audit is attempted afterwards.                                                                                                                                | Do not turn this operational test endpoint into personal sending. A fresh request ID does not recover one deliberate business send, and skipped admission/audit tolerance cannot define D15's durable source acceptance. This does not prove the unavailable-client branch is reachable in deployment.                  |
| [Sender-profile interface](/workspace/core/packages/email/types.ts:133)                                                                                                                                                                                                                         | Types name tenant, From/Reply-To/default/verified fields. Bounded sender-profile searches found campaign type references but did not establish a personal connection resolver.                                                                                        | An interface/verified flag does not prove provider identity ownership, token scope or active sending capability. Do not infer a working connector from the types.                                                                                                                                                       |
| [Inbound workflow](/workspace/core/packages/api/src/workflows/functions/inbound-email-processing.ts:27)                                                                                                                                                                                         | Resend client retrieves body/attachment metadata, then routes to Support Hub; failures leave a staff-retry placeholder.                                                                                                                                               | Real support inbound machinery is not permission to import a missionary inbox or put personal replies into a staff conversation. Ordinary replies remain in the sender's mailbox for D15.                                                                                                                               |

The support adapter uses an [admin database client](/workspace/core/packages/api/src/admin/support-hub/adapter/supabase.ts:74)
and [explicit tenant predicates](/workspace/core/packages/api/src/admin/support-hub/adapter/supabase.ts:144).
These are current code facts, not real-role/RLS proof. This pass did not repeat
D1/D5 migration-precedence and role probes; no new personal draft/send table or
policy was qualified. Private drafts cannot be added to existing tenant-wide
support/template storage and declared private by a UI label.

## Sending truth, restrictions and content

The [Resend wrapper](/workspace/core/packages/email/resend/send.ts:211) accepts
caller-supplied From/To/Reply-To/HTML/text. Its constructed payload at line 229
does not include attachments. It sends with a supplied idempotency key at line
245 and returns success when the provider returns no error at line 255. That is
provider acceptance, not proof of delivery, reading or a two-way encounter.
Timeout/error handling and retries at line 265 cannot by themselves establish
durable recovery across separate API calls, crashes or another provider's
capabilities. Do not map all `success:false` cases to safe fresh resend.

The [consent helper](/workspace/core/packages/api/src/email/consent.ts:178) defaults
unknown message types to marketing, blocks do-not-contact/hard suppression,
applies marketing opt-outs, then returns allowed. Its
[identity lookup](/workspace/core/packages/api/src/email/consent.ts:110) accepts a
donor ID or one tenant/address match with `limit(1)`; no donor match returns null.
This negative-restriction helper is not positive proof of the source's lawful,
permitted relationship purpose or the right individual behind a shared address.
Do not make every individual message “transactional,” use donor existence as
consent, or infer consent from an account connection, visible address, contact
share, donation, task or newsletter subscription. Preserve P6/P12/current
source restrictions and the applicable Never Ask purpose boundary. Different
restrictions need their actual purpose semantics; do not invent a blanket ban
from a label either. Unknown eligibility must prevent dispatch while preserving
the author's recoverable draft.

Useful editor foundations already exist:

- [Shared editor](/workspace/core/packages/ui/components/shadcn/rich-text-editor/rich-text-editor.tsx:17)
  supports controlled JSON value and an accessible textbox name; the editable
  element receives textbox/multiline attributes at line 79.
- [Existing support composition](/workspace/core/apps/admin/features/support-hub/components/detail/composer/SupportTipTapEditor.tsx:89)
  uses shared root/content/toolbar, without an app-local editor dependency.
- [Default extensions](/workspace/core/packages/ui/components/shadcn/rich-text-editor/extensions.ts:13)
  already check allowed link URIs in the editor, but also enable headings and
  images. Hiding toolbar buttons is not a server content policy or removal of
  paste/import capabilities.
- [Support serialization](/workspace/core/apps/admin/features/support-hub/components/detail/composer/serialize-payload.ts:45)
  derives HTML and text and appends an escaped signature without mutating the
  editor JSON. Its [link serialization](/workspace/core/apps/admin/features/support-hub/components/detail/composer/serialize-payload.ts:212)
  escapes an attribute but does not itself validate its protocol. The API accepts
  JSON/HTML/text fields; qualify a server-owned canonical schema/serialization
  path rather than trusting arbitrary submitted HTML or the client toolbar.
  No exploitable stored-XSS claim is made without tracing every renderer.
- [Installed UI dependencies](/workspace/core/packages/ui/package.json:72) include
  Base UI 1.9.0, React Email editor 1.7.12 and Tiptap 3.31.4. The
  [base-maia configuration](/workspace/core/packages/ui/components.json:3) remains
  the visual contract. Dependency presence does not prove email-safe output or
  accessibility of the proposed composer.

Recommended minimum: paragraphs, bold/italic, lists, safe links and undo/redo;
normal subject and a visible exact From/To. Use plain-text output as well as
approved email HTML. A simple optional signature belongs to the owned sender,
is visibly part of the message and can be removed/edited for this draft without
silently changing future messages. Do not import provider signatures, arbitrary
HTML, remote tracking images or profile/location fields by assumption. Prevent
duplicate signatures and materialize the reviewed signature into the authorized
content version. Scheduling, campaigns, merge-tag expansion, tracking, CC/BCC,
multiple recipients and shared senders are not implied by a rich-text editor.

Attachments are useful for genuine individual follow-up. Prefer a bounded
ordinary file attachment capability when P29/source/provider ownership can
qualify it: actual file bytes, exact version, access/scan/readiness, permitted
type/size, remove/retry, and immutable inclusion in the sent version. Show
Uploading / Checking / Ready / Could not attach and block sending an incomplete
selected file. Freeze no arbitrary size or provider inventory here. If that
chain is unavailable, omit attachment UI and explain the limitation where
needed; an eligible resource link is an alternative only when the recipient
actually has access, not a reason to publish a private file. Do not advertise
the existing metadata stub as a completed capability.

## Primary comparable UX evidence

Opened the following primary pages on October 16, 2026. They inform interaction
patterns, not Core permissions, defaults, providers or feature entitlement.

| Source                                                                                                                                                                      | Observed pattern and limit                                                                                                                                                                                                                                                                                 |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [HubSpot: Send and manage one-to-one emails](https://knowledge.hubspot.com/one-to-one-email/send-and-reply-to-one-to-one-emails), updated September 28, 2026                | Contact-record composition, visible recipient/sender, formatting, links, attachment/signature actions and mobile composition. Record access and connected-account permission are explicit. Its team-email, broad logging, subscription exception and reply/forward features must not be imported into D15. |
| [HubSpot: Create and manage one-to-one email drafts](https://knowledge.hubspot.com/one-to-one-email/create-and-manage-one-to-one-email-drafts), beta, updated June 26, 2026 | Explicit save, return, edit/send/delete makes drafts useful. Its placement on CRM timelines and team-review links are not evidence that private missionary drafts may be shared. Scheduling is outside the selected D15 job.                                                                               |
| [Pipedrive: Email signature](https://support.pipedrive.com/en/article/email-signature), updated October 15, 2026                                                            | Account-level optional signature and visible per-message edits offer a simple useful pattern. Multiple-signature libraries, HTML import, shared-team signatures and full email sync are unnecessary dependencies for this job.                                                                             |
| [MPDX: Tackle MPDX Mobile Tasks](https://help.mpdx.org/article/500-tackle-mpdx-mobile-tasks), updated November 29, 2021                                                     | Email task leads to contact-address selection and composition; manual completed-task logging is a separate interaction. Useful dated nonprofit comparison for the daily-work entry point, not evidence of present MPDX provider transport, sent-state reliability or inbox authorization.                  |

## Smallest complete proposed journey

One Personal email card in existing account settings, one composer reached from
an eligible contact/task, and a small private Drafts entry are sufficient. Use
existing shared components and layout; do not build another inbox or campaign
studio. A task entry must retain the exact contact/person context without
marking the task complete merely because composition opened or dispatch began.

### Connect and return

```text
Personal email                         Not connected
Send individual emails from your own account in Asym.
Replies stay in your email app.
[Connect email]
```

Explain the actual qualified provider permissions before leaving for consent.
Do not promise “send-only access” until the adapter's recovery scope is proved.
Returning from consent must bind the same authenticated person, organization
and exact account; show that address and readiness. OAuth cancellation or
failure returns to the starting context without a fabricated Connected state.
If a draft was started, preserve it through a qualified server draft, never by
putting its body/addresses/tokens into an OAuth URL or telemetry. Calendar and
newsletter controls do not change as a side effect.

Organization unavailability: “Personal email sending is not available in this
organization.” Show an allowed external-app/manual option if independently
permitted; do not show a working Connect button that necessarily fails. A
blocked recipient's restriction must not be presented as something connecting
another account or opening an external app will cure.

### Compose, save, return

```text
Email Alex                              [Close]
From  Maya <maya@example.org>
To    Alex <alex@example.net>
Subject [Thank you for meeting]
[simple formatting row]
[message body and visible optional signature]
[Attach file, only when qualified]
Not saved / Saving… / Draft saved
Replies go to maya@example.org.
[Save draft]                              [Send]
```

The exact address stays visible even if the contact name is familiar. For the
initial individual job, recommend one explicitly selected recipient; do not
resolve a household, merged contact or address ambiguity by a hidden first
match. A changed/deleted/restricted contact or sender while a draft is open
requires current revalidation and a clear correction, never silent retargeting.

Save is separate from send. A saved draft must be durably private to the
qualified author/source audience and be discoverable both from that contact and
the author's small Drafts list, subject to current permissions. Do not put
draft text on a tenant staff timeline. Show “Draft saved” only after confirmed
save. “Couldn't save. Your changes are still open” must preserve the actual
editor state; unsaved navigation asks Save / Discard / Keep editing only when
there really are unsaved changes. No repeated confirmation for a normal send.
If autosave is later selected, keep equally truthful states and conflict
handling; do not quietly promise offline persistence or autosave now.

### Send and recover

One deliberate Send binds the exact draft/content version, recipient, sender,
purpose and approved attachment versions to one durable operation. Prevent
duplicate clicks and stale-tab resend; preserve immutable sent evidence even if
the author later edits or discards a separate draft. A reconnect must never
auto-send an old draft or pending rejected operation.

| Proven state                                            | Proposed visible behavior                                                                                                                                                                                                                                                                                        |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Saved, not submitted                                    | Draft saved. Edit, send or discard.                                                                                                                                                                                                                                                                              |
| Accepted locally, awaiting external submission          | Sending… with a persistent status reachable after navigation. Never Sent solely from a queued database insert.                                                                                                                                                                                                   |
| Provider acceptance proved                              | “Sent to your email provider.” Explain delivery is not yet confirmed when no reliable delivery outcome exists. Record that exact outreach fact without a duplicate manual log. Final short label may be Sent if its meaning is consistently defined.                                                             |
| Confirmed refusal before acceptance                     | “Couldn't send: [safe actionable reason]. Your draft is saved.” Offer the permitted correction/retry of the same operation when safe; do not overwrite the message.                                                                                                                                              |
| Acceptance uncertain after timeout/lost acknowledgement | “Sending status is unconfirmed. Avoid sending again while we check.” Show Check status only if it can do useful authorized work. Do not assert automatic resolution or a safe Retry when the adapter cannot prove either. Preserve supportable operation evidence without asking users to inspect technical IDs. |
| Confirmed later failure/bounce                          | Show the qualified failure on this send, distinct from never-submitted. Do not create a successful interaction or automatically resend to another address/account.                                                                                                                                               |

If the provider cannot resolve an unknown outcome under the selected access
scope, the product must own that honest limitation and an explicit supervised
resolution path before promising reliable automatic recovery. No bulk inbox
reading or authority expansion is justified by the recovery wish alone. Do not
provide a casual “send again in your email app” shortcut from an uncertain send.
The prior result remains visible if the user navigates away or refreshes.

Ordinary replies arrive in the actual mailbox. Display “Replies arrive in your
email app” and the correct account; only offer an Open email app action that
actually works for the qualified environment. No fake Asym reply thread, inbox
badge or inference that “no imported reply” means “no response.” P6 body-free
history must not contain personal subjects/bodies or broaden staff/coach access.
Any separately readable sent-copy feature needs its explicit owner eligibility,
audience, retention and reveal rules; it is not an automatic D15 side effect.

### Disconnect, revoked access and drafts

```text
Personal email                         maya@example.org
[Disconnect]

Disconnect personal email?
Asym will stop new sends from this account.
Messages already accepted by your provider cannot be recalled.
[Keep connected]                         [Disconnect]
```

Do not promise that disconnect erases messages in either person's mailbox,
recalls an in-flight accepted send or removes independent calendar authority.
Fence new dispatches at current permission/connection state. A concurrent
unknown send retains honest recovery evidence and cannot be relabeled unsent.
Previously saved drafts remain available only under their source's current
access/retention rules; do not promise indefinite retention or access after
departure. An expired/revoked provider grant shows Reconnect, while an
organization prohibition does not. Reconnection to a different identity must
not inherit the old account's sender authority, drafts' ready state or unresolved
operation identity. Resolve/save first; the user deliberately sends again only
where that operation is actually safe and permitted.

## Mobile, accessibility and implementation qualification

Use a full-width mobile compose surface with visible From/To and simple stacked
fields. The keyboard must not cover the final body lines, save state or Send.
Keep formatting small, labelled and keyboard operable; preserve selection/focus
through link insertion and errors. Plain Enter remains text entry. Do not copy
the support composer's Cmd+Enter shortcut without deliberately qualifying focus,
IME/composition, scope and accidental-send behavior. Explicit Send is sufficient
initially. Every pending/error state needs persistent text and an announced
status, not color or a disappearing toast alone. Ensure reflow/zoom, readable
long addresses, touch targets, accessible attachment removal and no horizontal
toolbar dependence. Slow connectivity must not lose typed content, claim saved
before a response or silently resend after a refresh. These are proposed
acceptance requirements, not browser-tested claims.

Existing [save/send pending controls](/workspace/core/apps/admin/features/support-hub/components/detail/composer/ComposerActions.tsx:71)
use distinct labels, `aria-busy` and focusable disabled controls. They are useful
patterns; current send-result semantics and local shortcut text are not a
complete D15 journey. Qualify reusable shared configuration rather than forking
the editor or adding another UI system.

## Twelve meaningful proposed checks — not run

1. Authorized person connects the intended supported account and returns to the
   same organization/contact. Cancel, wrong identity and organization/role
   change never grant sender authority or lose an already saved draft.
2. Missing/anonymous/restricted/ambiguous recipient cannot be guessed or sent
   through a stale detail view; one permitted explicit destination succeeds.
3. Save then reload restores exact content/signature/recipient/attachment state
   for the authorized author; another tenant, staff user or coach gains no draft
   body through list/detail/search/cache/export/realtime paths.
4. Two tabs saving or sending the same draft detect revision conflict. The
   accepted send remains the exact reviewed version; no silent overwrite or
   duplicate business operation is created.
5. Double click, timeout, response loss, page refresh and worker retry preserve
   one logical send. Unknown acceptance is never rendered safe-to-resend merely
   because the HTTP request failed.
6. Current source restrictions/consent become unavailable or change after
   compose/save but before dispatch: no external send; content remains
   recoverable according to current source access. No transactional relabeling,
   alternate sender or external-app prompt circumvents the block.
7. Provider rejection, accepted submission and later bounce have distinct
   persistent outcomes. Manual mailto/log records retain their authored/handoff
   provenance; neither path fabricates reading, reply or task completion.
8. Disconnection, tenant switch, departure or policy revocation racing dispatch
   prevents unauthorized new effects and preserves an honest prior uncertain or
   accepted outcome. Reconnect never silently resumes old sending.
9. Crafted JSON/HTML/link protocol, pasted images, hidden remote content and
   signature changes cannot bypass the server content contract. HTML/plain text
   represent the approved message; no extra merge-variable data leaks.
10. Attachment selection has real bytes and ownership. Failed upload/check,
    access revocation, replacement version, unsupported format/size and removal
    cannot produce a false Ready or a send missing an advertised attachment.
11. Reply reaches the correct actual mailbox without authorizing general inbox
    import, private body publication or a shared support conversation. History
    obeys body-free and separately qualified recent-copy rules.
12. Keyboard/screen-reader/mobile/zoom/slow network users can connect, compose,
    save, reopen, correct errors, send once and disconnect without focus loss,
    hidden actions, accidental keyboard sends or disappearance of an uncertain
    operation.

Representative existing tests were inspected, not executed:
[composer payload tests](/workspace/core/tests/unit/apps/admin/features/support-hub/composer-payload.test.ts:25)
cover serialization, signature non-mutation, text escaping and metadata
pass-through; [Resend retry test](/workspace/core/tests/unit/packages/email/resend-send-thrown-retry.test.ts:22)
uses a mocked SDK. These do not prove attachment bytes, personal provider
authorization, actual role isolation, cross-request exactly-once sending or
mobile UX. This note does not qualify live grants/RLS/storage policies,
provider enrollment/scope/recovery, supported account inventory, webhook
delivery, runtime caches, production history or browser accessibility. Those
must be established at the appropriate owner seam before implementation claims.
