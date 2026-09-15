# Phase 26 D13 — Confirmation experience and Email Studio starter

11 September 2026. Complete ratified grooming blueprint for the founder's selected A. **Fully founder-ratified, including every adopted amendment, 11 September 2026.** The [full review](phase26-d13-adversarial-review.md) records the fully ratified behavior; this document makes the user journey, exact starter content and shared-stack contract concrete. No template has been published to Email Studio or Resend and no product UI has been implemented.

## The experience to deliver

Maya sends a normal email to the tenant's Support address. After qualified intake has accepted recoverable new work, Asym attempts a short automatic confirmation in the same email exchange only while the source, freshness, courtesy and staff-reply gates permit it. It does not ask her to open a portal or repeat her request. Her next reply follows D1's normal email route. Staff keep their existing Open/Waiting/Resolved and reply workflow; the confirmation does not claim a person has read it.

There are two deliberate safeguards to explain accurately: at most one new automatic confirmation is admitted to dispatch for this mailbox across the tenant's Support inboxes in a rolling 24 hours, and an old queued confirmation cannot start sending after 15 minutes from the qualified provider receipt. These are proposed Asym policy limits, not universal vendor rules. They reduce repetitive/stale mail and never discard a second legitimate request. Actual delivery order and delivery time remain outside that promise.

## Inbox administrator journey

Reuse the existing inbox settings form and shared components. One compact section has clear hierarchy, generous spacing, quiet helper copy and one section-scoped Save/Cancel. Avoid nested cards, status badges on every line, a second content editor or “advanced automation” setup.

```text
New request confirmation                            Ready
Let people know their new email request reached us.

Send confirmation     New requests                  ▾
                      Recommended

Template              Support request received      ▾
                      Published · Preview · Edit in Email Studio

From                  Example Ministry Support
                      support@example.test

People can reply normally. Replies and reopened requests
do not get another confirmation. To avoid repeated emails,
we start at most one per address every 24 hours
across this organization's Support inboxes.

                                         Cancel     Save
```

The mode choices are **New requests**, **Outside service hours** and **Off**. Enabling or changing mode creates a prospective eligibility generation: an older received email not yet bound to a decision is skipped, even if processing happens after Save. Already-bound eligible work keeps its earlier mode subject to current safety, Off/Pause and other revocations. This is a blueprint of the selected policy, not another question to the founder. New requests is the proposed default in new inbox setup, never silent activation of existing inboxes. Under Off, retain a quiet summary of the last compatible template for easy future setup; make clear that no new automatic confirmations are active.

Outside service hours adds only the governed calendar summary and its existing settings link, including its zone. A missing calendar yields **Choose service hours before enabling this option**; do not silently treat missing data as always closed. The calendar determines original-intake eligibility, not a delivery schedule. An eligible out-of-hours request can receive its prompt confirmation as the office opens, within the original 15-minute window; the wording says received and optionally states ordinary hours, never “we are currently closed” from stale data.

Mode, readiness and Pause are different facts. A saved New requests preference with no qualified publication/sender displays **Setup required — Choose a published confirmation template** or the specific source/connection blocker, linking to its owner. It must not appear Ready. An operational Pause identifies this confirmation purpose; it does not silently change routing, staff Receiving or human email. Selecting Off/pausing stops unsubmitted pending confirmations and further calls for indeterminate ones, while retaining truthful reconciliation; a small save result explains **Future confirmations stopped. Email already being sent may still arrive.** No permanent warning is needed after staff understand the state.

Admin saves use current version/conflict checks. A conflict preserves their local edits and shows the current saved version for comparison; no silent last-writer overwrite. Publishing a shared template remains an Email Studio action with existing impact review. The inbox binding selects reusable qualified content; every actual message later pins its immutable publication. Displaying template names, usage counts, previews and return links checks current permissions. Inbox administration never grants publish or restricted CRM rights.

**Preview** opens the current permitted sample, with desktop/narrow-screen and HTML/plain-text views in the existing Email Studio preview experience. **Edit in Email Studio** carries return context and the settings draft using the application's established navigation/draft mechanism. Browser Back returns to the inbox and does not lose unrelated edits. A non-editor sees **View template** and any permitted alternative selection; no dead edit button or new role bypass.

Routine configuration does not expose responder classifications, message keys, raw headers, credential IDs, receipt timestamps, SMTP reverse-path or internal worker states. A short **How this works** disclosure explains skipped automated/unsafe input, the 24-hour courtesy limit, no repeated confirmation on ordinary replies and no stale catch-up mail. Detailed safety reasons remain permission-aware operations data.

## Email Studio template to provide

**Visible name:** Support request received. **Location:** the existing Email Studio system-message library, under the qualified Support service-confirmation meaning. Do not put it among donation receipts or human saved replies. **Reusable:** one eligible publication can serve multiple permitted inbox bindings. **Channel:** email only. **Sender:** source/connection-owned tenant Support sender; **audience:** exact qualified original sender; neither is a free template field.

Complete starter body, with the public tenant name substituted by the qualified compiler:

> Thanks for contacting Example Ministry.
>
> We’ve received your message. You can reply to this email if you need to add anything.
>
> Automatic confirmation · Example Ministry

The first paragraph can use approved surrounding copy. The received fact and email continuation meaning are protected semantic content. The last line visibly identifies the automatic nature without impersonating an assigned worker. No greeting requires knowing a legal name, donor record, gender, family form or preferred language. There is no “being reviewed,” “resolved,” “within 24 hours,” “no-reply,” receipt number or fake staff signature.

**Subject:** the adapter's qualified ordinary reply-subject derivation, normally `Re: Help with my account` for that synthetic source. If no safe original subject exists, use the compatible publication's localized neutral fallback, **We received your message**. The subject derivation is protected; the template cannot prepend an arbitrary workflow/ticket identifier or inherit a different conversation's ancestry. The automatic indication is in the body/attribution/headers; preserving the ordinary subject is an explicit RFC3834 SHOULD tradeoff to support normal email continuity, requiring real client proof.

**Preheader:** “Your message has reached our support inbox.” It may be edited within the same factual meaning; it must not expose sensitive source details in mailbox previews. **Optional calendar block:** an approved public service-hours summary generated from the pinned owner calendar. It describes normal hours and zone, not a guaranteed reply deadline. It appears only in a deliberately published compatible variant that includes that permitted fact. The default starter omits it, so A does not create a calendar prerequisite.

### Canonical content and publication contract

This is the exact proposed semantic structure; node labels describe the required existing-compiler mapping, not an assertion that these new P17 names already exist. Formalization must admit the narrow class/profile and map these nodes to the supported canonical schema rather than accepting this outline or raw HTML as a runtime program.

| Content / dependency         | Owner and permitted behavior                                                                                                                                                                                                      |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document kind                | New closed Support service-confirmation meaning. It cannot be selected as a donation receipt, marketing appeal, human reply or work-changing macro.                                                                               |
| Public organization identity | Current approved tenant/site public brand identity from the qualified source snapshot and complete Brand Kit; never internal care/missionary/site metadata.                                                                       |
| Subject                      | Typed safe reply-subject derived from this original received message, or whole-publication fallback. No arbitrary record path or template expression.                                                                             |
| Received statement           | Protected source-owned semantic fact emitted only after recoverable qualified intake. Editable surrounding text cannot hide, contradict or change it to human review/resolution.                                                  |
| Reply instruction            | Protected normal-email continuation meaning with no URL, protected action or mandatory login; route is composed separately by the sender owner.                                                                                   |
| Automatic attribution        | Visible localized system identity, never the current handler's personal name/avatar.                                                                                                                                              |
| Optional hours               | Only the published owner-calendar summary/zone, not inferred presence, next-agent availability or freehand response-time promise.                                                                                                 |
| Locale/direction             | Qualified request locale if available, otherwise inbox locale, then explicit whole-message fallback. No AI or private CRM enrichment is introduced.                                                                               |
| Presentation                 | Reuse the existing Service message Role Layout and complete Brand Kit. No new Role Layout family solely for this message. Freeze dependency/compiler/formatter/schema/asset versions at publication and recipient preparation.    |
| Forbidden data and behavior  | Donor/gift/care fields, quoted source body, custom queries/raw CSS/JS, external action links, tracking pixels/link rewriting, attachments, identity verification, workflow actions, macros, newsletters and AI-generated answers. |
| Retention                    | Narrow provider preparation bounded by original receipt+15 minutes; terminal purge under ADR0032. Recent sent copy Off-only. Permanent actual history remains body-free.                                                          |
| Preview / test               | Synthetic example identity/request with the exact production compiler and compatible publication; real diagnostic sends are separately authorized and classified, never real requester intake.                                    |

The standard presentation is a restrained, readable service email: ordinary text, left/start alignment (RTL-aware), comfortable line height, 16px base text, approximately 560px maximum content width, 24px desktop and 16px small-screen padding. These are design starting values, not newly frozen application tokens. Use the actual shared Brand Kit/layout tokens and preserve WCAG contrast, client-safe output and plain text. The message remains understandable with images blocked. A logo is optional existing brand presentation, never necessary to convey receipt; no banner, hero image, campaign navigation or large call-to-action is needed.

Publish/edit follows Email Studio's existing permissions, draft, review, synthetic preview, compatibility and immutable publication flow. Saving a template as “active” in legacy storage does not satisfy that contract. Optional hours content must be revalidated against current calendar facts in every mode before any provider call; a changed fact cannot rewrite prepared bytes or revive expired work. No provider-template synchronization is introduced: Resend receives the qualified compiled HTML/text through P6. The CLI `--template` facility refers to a Resend-hosted template and is deliberately not this Core content authority.

## What staff see

```text
Maya · Incoming email                                10:04
[The actual requester message]

✉ Automatic confirmation · Accepted by email service  10:04
  Details

[Normal Reply / Internal note composer]
                                             Send reply
```

Use the shared outcome wording consistently: Queued before submission; Sending or Delivery outcome unknown where warranted; Accepted by email service only with that proof; Delivered only with the matching delivery evidence. An open/click is not human understanding and creates no response credit. The ordinary inbox list retains its useful requester/human preview rather than replacing every row with confirmation boilerplate; actual mail timestamps remain available separately. An automatic confirmation row is visually quieter than the actual human exchange, with no staff avatar or success confetti. Its details show the permitted recipient, source/time, **Template used**, publication version and safe outcome/reason. A template preview uses samples and clearly says it is not the personalized sent copy. D13's Off-only Recent copy is not silently bypassed by a Support body viewer.

Expected non-sends have no empty outgoing bubble. In permitted processing details, use **Not sent — recent confirmation**, **Not sent — staff reply started**, **Not sent — no longer timely**, **Not sent — inbox setting**, or an appropriately safe generic safety reason. The 24-hour bucket counts final provider-crossing admission, including uncertainty, not just known Delivered mail; helper copy must not claim the donor definitely received an earlier message. Sensitive spam/auth/contactability details are visible only to the qualified role.

A failed automatic confirmation is labelled on that occurrence. It does not mark the whole conversation “Undelivered” or mean a later substantive reply failed. Systemic failures produce one grouped owner repair case. No ordinary Force confirmation/Send again button bypasses current purpose, recipient budget or immutable provider identity. Staff can write a real helpful reply through the existing composer; that is a human response with its own reviewed content, not a disguised automatic retry.

Confirmation admission/success/expected suppression never changes D3 status/reminder, D6 handler, coverage, D8 access-loss review, D11 work outcome, business-action status or human-first-response/meaningful-contact metrics. Fresh qualified delivery/contactability evidence that actually requires current Support action still creates D3 review once; a notice-only fault goes to grouped owner repair. An expired optional confirmation alone never reopens a completed request. If a genuine human reply to this same recipient wins final dispatch first, this unsubmitted confirmation is skipped. A reply to a different CC, an internal note, presence indicator or unsent draft does not. If the confirmation crossed first, human work proceeds immediately; the UI does not promise which email arrives first.

## CRM continuity

The same canonical original conversation and P6 automatic event appear through D9's permission-aware Communications surface. Staff can open the conversation with record/list/filter context preserved on return. An authorized Activity projection may include the actual automated event only for its qualified P6 recipient/member Party attribution, without duplicate history or a human-stewardship touch. Explicit Related Party context is a separate reason the conversation is relevant; it does not mean that Party received this confirmation. An unlinked requester can receive eligible service confirmation without creating a CRM record. No inbox rule changes Party ownership, contact data, giving state or care permissions.

## Representative acceptance walkthroughs

| Walkthrough                                         | Required visible result                                                                                                                  |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| First safe direct new email, A ready                | Prompt short automatic message; one actual system outcome; ordinary work remains Open.                                                   |
| Another issue from the same mailbox within 24 hours | Both requests reach staff. The second confirmation is quietly skipped, not delayed until tomorrow and not merged into the first request. |
| Another tenant receives the same sender's request   | Its qualified independent tenant bucket and sender apply; no cross-tenant address/history disclosure.                                    |
| Human sends first to the requester                  | Confirmation skipped as staff reply started; no claim of delivery until actual proof.                                                    |
| Human replies only to a helper/CC                   | This alone does not suppress the requester's eligible confirmation.                                                                      |
| During business hours under outside-hours mode      | Ordinary intake and staff work, no confirmation; calendar/policy details explain why.                                                    |
| Held mail released after 15 minutes                 | Work reaches its qualified review path; no stale automatic confirmation.                                                                 |
| Missing translation or sender proof                 | Setup required/grouped repair; accepted work remains visible; no fragment fallback or another account.                                   |
| Rapid Save/Off while send is in flight              | Unsubmitted mail stops; already crossed mail has a truthful eventual outcome; no false recall success.                                   |
| CRM access revoked                                  | Restricted record/context/recipient details disappear from every projection; unrelated Support access does not re-grant them.            |
| Keyboard, screen reader, mobile/RTL, images blocked | Mode/save/preview/outcome and email meaning remain understandable without color, hover, motion, images or wide layout.                   |

These journeys correspond to D13-P01–P38. The local [CLI dry-run](phase26-d13-cli-probe.json) verifies only synthetic request construction. Canonical compiler, actual Email Studio preview/test parity, SMTP/MIME/provider threading, DB/concurrency and representative donor/staff comprehension remain release proof, not completed tests.
