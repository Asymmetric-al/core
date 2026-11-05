# Phase 29 Q26 — Recipient email when staff request changes

**Status:** Historical researched question prepared 2026-10-22, Asia/Bangkok.
Conrad selected Q26 A and fully ratified all required amendments, including
tenant configuration of who/how and the explicit Off rule. Q01–Q26 are ratified
grooming intent; all twenty definitions remain unchanged. No implementation or
activation follows.

## Historical question and alternatives

**When staff commit an ordinary Request changes review, should its optional
recipient-email choice start on or off?**

Both options use the same visible choice in the existing meaningful review.
Both retain the source-approved guidance in the request and permit a lawful
review-only outcome. Neither requires a separate email wizard or gives a staff
checkbox authority to override the tenant's effective Delivery Plan.

| Option                                                      | Practical behavior                                                                                                                                                                                                    | Benefits                                                                                                                                                                                         | Costs and boundaries                                                                                                                                                                                                                                               |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **A — Notify by default, with staff control (recommended)** | In a genuinely new eligible Request changes review, the visible optional recipient-email choice starts selected. Staff can turn it off before committing. Show the permitted recipient and email consequence clearly. | Helps recipients learn that more work is needed without staff having to remember an additional communication step. Fits Q20's existing control pattern while addressing a distinct source event. | Preselection can cause an unnoticed outward message. Repeated separate review actions may create noise. Eligibility, current delivery policy, clear consequence and intended-user comprehension must be qualified; no hidden send or new reminder/digest behavior. |
| **B — Email only when staff opt in**                        | The same optional choice starts unselected. Staff select it when they want this review to request an eligible recipient email. Current guidance still appears in the request.                                         | Gives deliberate control over each outward notice and reduces accidental or poorly timed email when staff are coordinating separately.                                                           | Staff may forget the notice, leaving the recipient unaware of actionable feedback until they return to the request. It adds a selection when email is wanted, but does not require a separate send workflow or prohibit notification.                              |

**Recommend A.** Request changes creates a useful recipient next action; someone
who already submitted their documents may not otherwise know to return. Keep
the consequence conspicuous and allow staff to turn it off when an email is
unhelpful, already covered by another lawful communication, or poorly timed.
This is a scoped product judgment, not a universal rule that preselected
checkboxes are better or that every status change deserves an email.

B is the strongest alternative because email is an outward action and staff
may be reviewing several items or already speaking with the recipient. A must
not win merely by calling B “no notifications.” The only fork here is the
initial value of the same optional choice, subject to the same source and
delivery constraints.

## Practical example and lean UX

Illustrative scenario, not an observed ministry workflow: Elena reviews Nora's
submission and records a Request changes outcome with safe, specific guidance
about what needs correcting.

- With **A**, the permitted **Email recipient** choice is already selected.
  Elena sees its destination/consequence and can turn it off before committing.
- With **B**, that same choice is initially unselected. Elena selects it if she
  wants the source event to request the email.
- In both cases, the actual review and current permitted guidance are recorded
  in the request. Email is an additional means of awareness, not the review,
  a new access grant or proof that Nora has read the feedback.

Use the existing review action, accessible control and safe message preview/
consequence where already supported. Preserve the choice through validation
and safe recovery. Do not make staff repeatedly toggle a valid default to prove
they saw it, require another routine confirmation, add arbitrary To/CC fields,
or expose private contact details beyond current permission.

If the exact email path is unavailable, suppressed or cannot be established,
explain the actual state safely and offer only the lawful choices the source
supports. A selected combined intent must not silently become review-only
because a lookup failed. Once the source review is committed, subsequent email
failure does not undo that business outcome. Display review and notice state
separately; queued/accepted is not delivered, and delivered is not read.

The repeated-item noise risk is real. This question does not select a per-file
email trigger, one mail for every field update, an arbitrary digest delay, a
review-pass aggregate, bulk review or a new batching system. Reuse the exact
qualified source action and P6/P17 release semantics; the selected answer's
adversarial review must test repeated reviews and notification usefulness.

## What research establishes

Primary documentation was read on 2026-10-22. These sources establish vendor
behavior and UX guidance, not measured Asym user preferences or a universal
notification policy.

| Primary source                                                                                                                                                                    | Verified fact                                                                                                                                                                                     | Scope and limitation                                                                                                                                                                                                                                       |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [FileInvite — Borrower email notification](https://help.fileinvite.com/articles/borrower-email-notification), current undated guide                                               | Request Revision is a documented email trigger, with a default message when no note is supplied.                                                                                                  | Close document-collection evidence for alerting recipients to changes. It does not prove a per-action staff opt-out, Core's exact default, safe message contents or emission granularity. No raw-note/email-editor or other notification rules are copied. |
| [Content Snare — Approving & Rejecting](https://contentsnare.com/help/knowledge-base/approving-rejecting/), updated 2026-02-17                                                    | Under the default reminder schedule, rejected answers lead to an email that changes are required; the client-facing action is framed as Redo.                                                     | Supports action-needed awareness alongside request guidance. Core keeps its ratified Request changes meaning, exact source review, permissions and recovery rather than copying optional approval, reversal or editing behavior.                           |
| [Content Snare — Publish & Send](https://contentsnare.com/help/knowledge-base/step-5-publish-send/) and [schedules](https://contentsnare.com/help/knowledge-base/schedules/)      | Communications are configurable, but the guides disagree about which messages remain under No automatic reminders. The former says initial/rejected-field messages; the latter says initial only. | Do not present an inferred current no-reminders invariant. The default rejection-event documentation is narrower evidence. Do not copy a scheduler, SMS settings, blanket no-message preference or performance/ROI claims.                                 |
| [Submittable Next — Request revisions](https://next.support.submittable.com/hc/en-us/articles/42038103841431-Request-Revisions-on-an-Application-as-an-Admin), updated 2026-10-15 | Revision Requested email is set up by default and can be removed/edited through the product's communications setup.                                                                               | Relevant nonprofit precedent for actionable-feedback email. Program-level configuration differs from a per-action checkbox; no review freeze, extra confirmation, round model or template authority is imported.                                           |
| [GOV.UK — Checkboxes](https://design-system.service.gov.uk/components/checkboxes/)                                                                                                | Advises against preselected options because users can overlook the question or submit an unintended answer.                                                                                       | Strong counterevidence supporting B. A is justified only as a conspicuous optional transactional consequence with meaningful staff control and actual comprehension proof; styling or a checkbox alone does not solve the risk.                            |

The synthesis is deliberate: awareness of new correction work favors A; avoiding
unnoticed external actions favors B. Existing Core source and communication
authority constrains either choice. None of the sources proves that more email
is always better, that a recipient will read it, or that a numerical send delay
is appropriate for this product.

## Repository authority and why this remains open

Detailed source evidence is in [owner research](phase29-q26-owner-research.md),
[runtime research](phase29-q26-runtime-research.md) and
[comparative research](phase29-q26-comparative-research.md). Repository locators
are relative to `/home/conrad/code/core`.

- Ratified ADR-0023 `0023-recoverable-ordinary-item-review.md:148–150` explicitly
  selects no review-result email/reminder. It requires useful current safe
  in-request guidance and real correction/recovery; that is not already email
  permission or a communication default.
- Ratified ADR-0020 `0020-default-on-fresh-access-email-with-staff-control.md:40–44`
  limits its optional-email default to fresh access and excludes review notices.
  Its visible choice, preserved intent and truthful independent outcomes are
  useful shared design constraints, not authority to send this different notice.
- P17 `phase-17-system-messages-template-management.md` requires a code-owned
  source/message contract, audience, typed facts, safe content, lifecycle,
  effective Delivery Plan and qualified producer before Live use. Native
  Request changes must acquire its exact owner mapping; calling a direct sender
  “transactional” does not qualify it.
- P6 `phase-06-shared-communication-event-model.md` and current immutable-message
  recovery contracts govern durable intent, exact release, provider evidence,
  privacy, suppression and recovery. A source's optional choice is a condition
  within that authority, not a tenant-plan override or new preference system.
- Q01's request-only participant authority remains closed and purpose-bound.
  Email does not require fabricating a CRM Party or donor/missionary account.
  Q21–Q25 continue to own exact review, fulfillment, responsibility and issuance;
  neither notice selection nor delivery resets access or reopens work.

At authorized publication, either selected policy must be reconciled into the
native source and exact P6/P17 contract/producer, including the optional external-
recipient material/privacy posture. A reserved key, financial message or existing
mail adapter is not native qualification. Full incorporated owner/OpenSpec
sections retain their actual status and must be read in full.

## Current implementation and proof limits

The inspected financial outcome path targets the staff profile that requested a
financial correction, not the external request-only document recipient. It can
plan an in-app record and condition email on tenant/user preferences; a settings
lookup failure falls back to email-off defaults. Those source-specific defaults
are not proof that Core implements either Q26 policy or can silently change a
reviewed combined intent.

A financial dedupe key tied to request/outcome cannot be copied as a permanent
item/status key for Q23. A genuinely later Request changes decision after a
correction is a different source occurrence; replaying the same committed
decision is not. Preserve source business identity and exact communication
recovery rather than assuming a provider's temporary key window is sufficient.

No new native runtime tests, provider sends, private-data access or actual
role/RLS/message/browser/AT/user qualification was performed. Current code is
bounded implementation evidence, not permission to preserve weak reuse.

## Boundaries shared by both options

- **Keep source guidance independent.** The recipient's permitted current
  guidance remains in the request whether this optional notice is requested or
  not. Email is not the only location of the instructions or a new reply channel.
- **Respect current eligibility.** Source/actor/recipient/contact/purpose,
  message contract, Live qualification, effective Delivery Plan, suppression,
  sender/channel and protected use remain authoritative. Default-on applies
  only to a genuinely eligible new review; absent/legacy/unknown input cannot
  silently become true. Staff control cannot bypass those boundaries.
- **Preserve intent and truthful outcomes.** Same source-decision replay keeps
  its reviewed choice and exact notice identity; off does not become on after
  defaults change. A selected notice later blocked/non-applicable is not the
  same as staff choosing off. Unknown source/provider outcome is not proof of
  failure or permission to resend with a new identity.
- **Keep notices current and safe.** No notice may assert an uncommitted review
  or give stale upload instructions after correction, acceptance, completion,
  changed recipient scope or expiry. Current qualified source variants/help may
  be possible under their actual contract; this question does not impose a new
  access-active-only email rule or grant fresh access to make a link work.
  A sealed prepared message cannot be rewritten into another purpose.
- **Preserve privacy and access.** Use approved minimal content and the existing
  protected doorway; no raw staff notes, sensitive filenames/location/care data,
  attachments, direct storage links, arbitrary recipients or new account. The
  exact contract determines safe content and current action, not the checkbox.
- **Keep scope small.** This covers ordinary Q23 Request changes only. Acceptance,
  fulfillment, initial invitation, confirmation, reminder, fresh-access,
  assignment and staff-alert policies retain their own decisions. No global
  notification preference, SMS/push channel, cadence, resend power, bulk action,
  digest timer or second notification engine is selected.

## Historical preparation scope and snapshot

Q01–Q25 are fully ratified and all twenty definitions are unchanged. Q26 is a
researched question with A recommended and no answer selected. No ADR-0026 or
new glossary term is created. The selected answer receives the full adversarial
review before amendment ratification.

Local HEAD remains `3d85897ebf1515008ef5c676b1c58a15422fb9ab`; fresh live develop
is `3408edad69c8cb6032e2cee301447653403b383f`. The reviewed range from 1e59f19
contains 21 commits and 104 unique paths through PR2178, PR2181 and PR2182.
Relevant governing Q26 owner contracts remain unchanged in that range, while
infrastructure, data/task UI and dependency changes are real. Complete path
coverage and targeted source/patch review are not an all-file semantic audit or
native qualification. Local and live snapshots remain distinct; no pull.

Formal owner/OpenSpec publication remains `/to-prd`; tickets remain `/to-issues`.
No implementation or provider action occurred. This question does not declare
the broader File Manager/library/format/custody/disposition work complete.

## Historical founder answer and review — before ratification, 2026-10-22

Conrad selected **A — Notify by default, with staff control**, requesting deep
research, all-category adversarial review, excellent flexible UX and concrete
tenant control of who and how people are notified without overengineering.
The earlier question's narrower scope is dated provenance; it does not erase
this explicit addition. [Full review](phase29-q26-adversarial-review.md) and
[ADR-0026](../docs/adr/0026-default-on-review-notices-with-tenant-control.md)
record the corrected decision and required package awaiting ratification.

Use one review control plus the real P17 event-specific configuration. Initially
Who is the source-owned Request recipient, with qualified default email On,
tenant Off and permitted content/locale/sender/reply controls. Recipient change
uses its existing authorized source route; no fake team/audience picker or
unsupported channel. Preserve staff choice, exact source/whole-plan replay,
independent delivery truth and current safe protected use. C06 explicitly adds
Q26-specific Tenant Off narrowing before submission while preserving plan pins,
in-flight truth and no resurrection on On. This is an owner amendment, not
assumed generic future-only plan behavior. Approved private action material
remains permitted only in its exact qualified carrier.

The package contains ten clauses, 24 proof groups, sixteen journeys, fifteen
lifecycle distinctions, six controls and every one of the 22 requested review
categories. Independent owner/runtime/UX review and targeted corrections are
recorded. No new term, native qualification, formal publication or Q27 answer.

## Full ratification — 2026-10-22

Conrad fully ratified Q26 A and all required amendments: the corrected decision,
Q26-C01–C10, Q26-P01–P24, sixteen journeys, fifteen lifecycle distinctions and
six controls. Real tenant configuration and Q26's explicit Off narrowing are
adopted. Earlier pending question/review text is dated provenance; ADR-0026 and
the full review record current adoption. Q01–Q26 are ratified; twenty definitions
remain unchanged. Q27's answer, native qualification, implementation and formal
publication are not inferred.
