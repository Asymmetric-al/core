# Phase 29 Q35 — Participant email when an ordinary request is canceled

**Status:** Historical researched question prepared 2026-10-23, Asia/Bangkok.
Conrad selected Q35 A and fully ratified every required amendment on 2026-10-23.
Q01–Q35 and all twenty-three glossary definitions are ratified grooming intent.
Earlier preparation/review entries below are dated history. No implementation,
activation or formal owner/OpenSpec publication follows.

## Historical question and alternatives

**When authorized staff cancel an ordinary document request, should an optional
participant cancellation email start On, start Off, or be omitted from this phase?**

Q34 ends the ordinary request and defines its limited terminal status/help and
mistake remedy. It expressly creates no cancellation notice. Q20 fresh-access,
Q26 review-feedback, Q27 staff-review email, Q31 staff-reply and Q32 incoming-text
staff-awareness decisions have different meanings. None silently authorizes
this new outward purpose or its initial choice.

| Option                                                              | Everyday experience                                                                                                                                              | Benefit                                                                                                                   | Tradeoff                                                                                                                                                            |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Notify by default, with staff control (recommended)**         | In the cancellation review, a clearly visible “Email the request recipient about this cancellation” choice starts selected when eligible. Staff can turn it off. | Helps someone who has left the request learn to stop unnecessary work without staff remembering another step.             | A selected option can be overlooked; an unnecessary or wrongly addressed notice can confuse or disclose a relationship.                                             |
| **B — Keep this email opt-in for each cancellation**                | The same optional cancellation notice is available, but starts unselected for each new cancellation.                                                             | Staff deliberately choose each outward notice, useful when they have already communicated through another approved route. | Staff can forget a useful notice. It requires essentially the same delivery/privacy/recovery capability as A.                                                       |
| **C — Keep cancellation in the request without a new email notice** | Current authorized participants see the Q34 result on return; staff use an existing independently approved contact route where needed.                           | Avoids this new outbound purpose and its operational burden.                                                              | Someone away from the request may keep collecting documents, and staff must remember effective follow-through. A decorative help link is not a capable alternative. |

**Recommend A.** A cancellation changes what the recipient should do. Make the
useful stop-work cue part of the already deliberate cancellation interaction,
with a clear way to skip it when unnecessary or inappropriate. This is a
product judgment, not a measured Asym result or universal rule about email.

For a fair A/B comparison, both propose the same qualified optional capability:
the initial tenant plan offers the step, and authorized tenant administrators
can disable it through existing bounded System Messages controls. A/B differ
only in the initial per-cancellation staff choice. Staff On cannot override
Tenant Off, source/disclosure restrictions, contact suppression or unavailable
eligibility. These are three product alternatives, not three new tenant modes,
a second notification engine or a new preference designer.

## Concrete example and user journeys

Illustrative scenario, not an observed ministry workflow: Elena discovers that
an ordinary document request sent to Nora duplicates a valid request. Elena
reviews the exact duplicate, cancels it and, under A, can notify Nora in the
same meaningful action. The notice identifies only the exact canceled request
through safe owner-approved context and says no further work is needed for
that request. It must not suggest the other valid request or an application
was canceled. If Elena has just explained the change to Nora, she turns email Off.

| Journey                                                                       | Required experience in the proposed choice                                                                                                                                                                                                                   |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Participant is away from the request, collecting documents                    | A offers a permitted factual cancellation cue; B requires staff selection; C relies on return or approved outreach. No delivery/read guarantee follows.                                                                                                      |
| Staff already explained cancellation or no useful contact is needed           | A/B allow one visible per-action opt-out/opt-in in the existing cancellation review; no separate message wizard.                                                                                                                                             |
| Duplicate request, several similar requests or a later replacement            | Identify the exact canceled request only with qualified safe context. Do not imply another demand ended, reuse the old upload instruction or redirect to a replacement. If useful identification cannot be disclosed safely, do not send a confusing notice. |
| Request was issued to the wrong person                                        | Do not send a new disclosure to the known-wrong old address. Cancellation remains possible; current source identity/privacy and independently qualified communication authority govern any separate contact.                                                 |
| Participant access expired before cancellation                                | Expiry alone neither grants nor necessarily forbids a useful factual email. Require the notice's own exact current source cancellation-disclosure/contact authority; no new portal admission. A qualified linkless notice can be useful.                     |
| A protected status link is appropriate                                        | It can use only the exact surviving Q34 outcome-only admission within its unchanged end/caps/current restrictions. Email does not renew it; no files, transcript or completed-view period.                                                                   |
| Access ends after provider admission but before opening                       | Entry shows the current safe Q34 unavailable/help result. No recalled-email promise, new proof grant or renewed access.                                                                                                                                      |
| Tenant Off, suppression, missing contact or unknown eligibility               | Show the effective availability safely. Preserve authorized cancellation; do not relabel requested-but-blocked as staff Off or guess that an old invitation proves disclosure authority.                                                                     |
| Cancellation commits but notice preparation, queue, provider or refresh fails | Show Canceled and the independent notice outcome. Recover through the owning source/P6 path without recanceling or silently creating another notice.                                                                                                         |
| Staff retries, a second tab acts, or a replacement is issued                  | Preserve original cancellation occurrence and notice identity/current purpose. No new event from a duplicate click, status refresh or transport retry; no misleading stop-all-work message.                                                                  |
| Mobile, keyboard, assistive technology, RTL/localized text or slow network    | Clear action/consequence/choice, safe destination summary, accessible result announcements, stable focus and recoverable lawful choice; no color/toast-only status or offline private archive.                                                               |

Use the existing base-maia/Base UI surface. A visible label such as “Email the
request recipient about this cancellation” makes the outward consequence
explicit; the final review must show the effective choice and permitted
destination. Keep the main action unmistakably Cancel request, with a distinct
back/keep-request action. Do not add a routine extra approver, typed-name ritual,
mandatory reason essay or extra confirmation solely for the notice.

The message is a minimal factual outcome, not a new document or conversation
channel. Do not include internal cancellation rationale, evidence/filenames,
care/location information, attachments or unapproved request titles. Any safe
request reference must be deliberately qualified, not arbitrary free text.
No new staff alert, reminder series, SMS/push, marketing content, email reply
intake, bulk send or automatic replacement invitation is bundled here.

## Current primary research and strongest alternatives

- [Adobe Acrobat Sign cancellation](https://helpx.adobe.com/sign/web/users/manage-agreements/cancel.html),
  updated February 4, 2026, allows a sender to choose notification for manually
  created agreements and explains workflow-controlled notification behavior.
  This is strong precedent for visible cancellation communication control. The
  text does not establish the checkbox's initial state. Its sender-only power,
  all-participant scope, required reason and workflow policy do not govern Core.
- [Submittable Additional Forms](https://submittable.help/en/articles/2670501-how-can-i-track-additional-forms),
  dated May 29, 2026, documents participant notification when an additional form
  is rescinded. Its [submitter notification guidance](https://submittable.help/en/articles/4926006-what-notifications-should-i-expect-to-receive-from-submittable-as-a-submitter)
  also describes email preferences. This supports cancellation awareness, not an
  unavoidable mandatory Core email or an inferred initial staff-checkbox default.
- [GOV.UK checkboxes](https://design-system.service.gov.uk/components/checkboxes/)
  explicitly cautions against preselected answers because people may miss the
  question or submit an unintended answer. That is real counterevidence to a
  preselected On default. A proposes a conspicuous reviewed operational action
  default, never inferred recipient consent, and must demonstrate comprehension.
  Do not cite that guidance as an endorsement of preselection or import its UI.
- [W3C error prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html)
  and [status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
  support appropriate review/correction and accessible outcome feedback. They
  do not mandate a second reviewer, universal Undo or extra modal for each email.

The [comparative research](phase29-q35-comparative-research.md) retains additional
current primary comparisons and exact limits. B is the strongest alternative
when deliberate opt-in matters more than avoiding omitted notices; C is the
real no-build alternative. Default On is not proved superior by vendor adoption.
No Asym cancellation frequency, notification preference, savings, read rate or
delivery performance has been measured. Representative staff and participant
proof must include already-contacted, wrong-recipient, duplicate-request,
expired-access and privacy-sensitive cases before claiming benefit.

## Repository reconciliation and scope boundaries

The [owner research](phase29-q35-owner-research.md) and
[runtime research](phase29-q35-runtime-research.md) supply exact source anchors,
complete consumed contract evidence and implementation limits.

1. **New exact occurrence and purpose.** A/B would explicitly add a participant
   cancellation-awareness purpose after a genuine committed Q34 cancellation.
   The cancellation command and permission are separate from the outward notice.
   Do not borrow Q20/Q26/Q31 triggers, manufacture a reply/feedback/access grant,
   or infer this purpose from a task status change. Q34's exclusions remain
   intact until this separate decision and its amendments are ratified.
2. **Different authority for notice and portal.** The source/P12 must authorize
   disclosure of this exact cancellation to this exact current recipient through
   the eligible contact route. An expired portal root does not alone decide that
   permission; neither does mailbox equality, an old invitation or staff title.
   A qualified minimal linkless notice is possible, not an automatic fallback
   invented by a worker. Any protected return action stays strictly within Q34.
3. **Existing communication ownership.** The source owns event meaning, audience
   eligibility and usefulness. P17 governs the exact catalog contract,
   presentation, bounded plan and generated routing. P6 owns complete release,
   recipient-specific intent, dispatch, provider evidence and recovery while
   consuming current source recipient authority and canonical contact/consent/
   suppression gates. Preserve immutable original
   pins/material and current admission as separate checks. Q27 staff-email
   opt-in and Q31/Q32-specific pending-Off semantics do not automatically apply.
   Any exception affecting already-prepared Q35 notices must be explicit in its
   selected-answer review, not quietly imported or imposed here.
4. **Cancellation remains independent.** Ineligible or unavailable optional mail
   cannot delay or undo legitimate cancellation. Preserve the staff's actual
   choice and required durable source/communication facts coherently; distinguish
   Canceled from requested/queued/provider-accepted/delivered/blocked/unknown.
   A delivery or click is not proof of reading or a new fulfillment/acceptance.
5. **Current usefulness and privacy.** Revalidate exact purpose/recipient and
   source restrictions before provider admission. A message saying the request
   ended can remain useful after web expiry; it must not promise access it cannot
   deliver, reveal a wrong recipient's relationship or imply separate work ended.
   No unbounded stale replay merely because cancellation is a permanent fact.
   Retain provider-unknown/admitted outcome truth rather than retrying blindly
   or promising recall. Safe internal diagnostics remain distinct from egress.
6. **Small complete integration.** Use existing qualified source/P17/P6 seams,
   durable identity and bounded recovery. Do not invent a parallel queue, inbox,
   audience builder, settings platform or whole future Studio prerequisite.
   Qualify this exact purpose's closed prepared-material class and finite utility;
   do not borrow a financial/staff retention limit or Q34 web lifetime. Optional
   readable copies require compatible current reveal authority; otherwise use
   no readable copy rather than fabricating a Party or blocking lawful notice.
   Formal publication must amend canonical owners and regenerate their declared
   OpenSpec projections; grooming does not edit generated meaning independently.

## Current implementation and evidence limits

Fresh read-only checks still return local HEAD
`3d85897ebf1515008ef5c676b1c58a15422fb9ab` and live develop
`f59331942c6e84ab66bcdd14c3b120025cceecfd`. Live is unchanged from Q34's reviewed
snapshot. The prior complete 63-commit/114-path drift classification and pinned
relevant code/migration reads remain dated evidence: owner/current-contract
trees were unchanged, runtime had changed, and no whole-runtime equivalence
was claimed. No pull occurred.

Inspected task, finance notification, workflow-ledger and Resend code provide
adjacent seams, not qualified native Q34 cancellation or a Q35 notice. The
document-cutover reader is an evidence-only Phase18 assessment path. Direct
provider retry, key-only ledger recovery, broad role wrappers or tests with
mocked clients cannot establish current source purpose, exact semantic identity,
provider-unknown recovery, effective native RLS or intended-user outcomes.

No native runtime, real-role SQL/RLS, provider, concurrency/load/restore,
browser/assistive-technology or intended-user tests ran. Public documentation
was read, not exercised through authenticated competitor accounts. No real
messages, private data, credentials or product/schema/provider mutations.

## Historical preparation scope and snapshot

Q34's complete corrected decision, C01–C12/P01–P26, twenty journeys, sixteen
lifecycle distinctions, seven measurement rows, six controls and the Document
Request Cancellation definition are fully ratified without substantive change.
Q01–Q34 and twenty-three definitions remain ratified. The current Q34 ADR/review,
historical question, decision log, context map and session reflect adoption.

This Q35 question records researched alternatives, recommendation and evidence
only. No feature ADR-0035, new glossary definition, selected Q35 answer, formal
owner/OpenSpec publication or implementation is created. After Conrad selects
an answer, perform its full adversarial review and exact amendment package
before requesting full ratification. Publication remains `/to-prd`; tickets
remain `/to-issues`.

Independent full-question checks are closed: owner, runtime and UX reviewers
verified the complete alternatives, journeys, authority boundaries and evidence
claims. The final revisions clarify source/P17/P6 ownership, exact material/copy
qualification and the genuine preselection counterargument. This approves the
researched question only; it does not select Q35 or qualify native behavior.

## Historical founder answer and review — before ratification, 2026-10-23

Conrad selected **A — Notify by default, with staff control**, adding “make all
this changeable by tenant to prevent too much noise” and all user journeys.
The [full review](phase29-q35-adversarial-review.md) recommends **Accept with
required amendments**; the [feature ADR](../docs/adr/0035-tenant-controlled-participant-cancellation-notices.md)
records the exact corrected decision. Twelve clauses, 30 proof groups, all22
categories, twenty-two journeys, eighteen lifecycle distinctions, eight
measurement rows and seven controls form the complete proposed package.

The qualified system starts Enabled+On. Tenant administrators can disable this
notice or change the initial staff choice On/Off through existing bounded P17
publication. Default-only edits seed new reviews; they do not reset open visible
choices or stop pending selected mail. Staff may request On only while eligible
and Enabled, and may decline the optional notice for any otherwise lawful
cancellation. Existing source/current recipient gates always apply. This is a
Q35 amendment, not a global rewrite of earlier notice defaults or required mail.

Actual cancellation is the positive source occurrence. Capture original choice,
applicable policy/recipient basis and durable handoff coherently without making
optional delivery a cancellation dependency. Unknown original proof is not
Off/zero; if it cannot be proved, preserve C with blocked/no-send historic mail.
Release one exact Live-qualified complete P6 occurrence/zero, permanently keyed.
No later settings/contact, rekey, source retry or activation catch-up creates mail.

Published Disabled explicitly fences Q35 at every actual sealed provider call
admission, including unresolved handoffs and later same-key calls. Preserve
intervening Disabled across re-enable even when no worker ran. No old backlog,
pin rewrite or recall promise. Existing P17 three closed indeterminate causes
and at most two follow-up HTTP calls total retain all current fences/deadlines.

Email disclosure/contact authority is separate from Q34 web admission. A useful
qualified factual linkless notice may survive web expiry; no old wrong address,
new grant, renewed period, file/transcript access or replacement redirect follows.
Identify only the exact canceled request through safe approved context. Qualify
the exact optional external material/finite utility and readable-copy posture;
no borrowed financial/staff/web period or fake Party. Preserve body-free history.

Use existing accessible settings/source UI, explicit safe consequence and
persistent separate Canceled/notice states. Plain-text/images-off email retains
the same useful meaning. No new inbox, engine, digest, reminder, extra channel,
routine approver or future Studio gate. Current vendor evidence supports controls
but does not prove the optimal initial default; GOV.UK preselection counterevidence
and representative comprehension proof remain explicit.

Independent [owner](phase29-q35-owner-adversarial.md),
[runtime](phase29-q35-runtime-adversarial.md) and [UX](phase29-q35-ux-adversarial.md)
whole-report/ADR checks closed findings. Local3d85897/livef593319 remain distinct
and unchanged from the question. No pull, native/runtime/real-role SQL/provider/
race/load/restore/browser/AT/user tests, real messages, private data or product/
schema/provider mutations. Documentation checks establish record integrity only.
Q35 amendments await ratification; no new glossary term or Q36 question follows.
Formal publication `/to-prd`; tickets `/to-issues` remain separate stages.

## Full ratification — 2026-10-23

Conrad fully ratified Q35 A and all required amendments: the corrected decision,
Q35-C01–C12, Q35-P01–P30, twenty-two journeys, eighteen lifecycle distinctions,
eight measurement rows and seven controls. Earlier pending wording is dated
provenance; ADR-0035 and the full review record current adoption. Q01–Q35 and
twenty-three definitions are ratified. Q36's answer, native qualification,
implementation and publication are not inferred.
