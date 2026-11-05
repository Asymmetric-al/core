# Phase 29 Q40 — Recipient email about published request updates

**Status:** Historical researched question prepared 2026-10-23, Asia/Bangkok.
Conrad selected Q40 A and fully ratified every required amendment on2026-10-24.
Q01–Q40 are ratified grooming intent; all25 glossary definitions are unchanged.
Earlier preparation/review entries below are dated history. No implementation,
activation or formal owner/OpenSpec publication follows.

## Historical question and alternatives

**When staff publish an eligible new ordinary request item or a material revision
of an outstanding item's instructions, should the optional recipient email
start On or require staff to switch it On?**

The source already has to show the actual update on authorized return. The open
decision is a useful email cue outside that page, not whether current instructions
are visible, whether the change is lawful, or whether an email grants access.

| Option                                                                  | Practical behavior                                                                                                                                                                                                                                                                | Main tradeoff                                                                                                                                                                                                              |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Notify by default, with tenant and staff control (recommended).** | For this new purpose, start the qualified system configuration Enabled with the visible email choice initially On for an eligible actual publication. Authorized tenant administrators may disable it or choose an initially Off default. Staff can decline an individual notice. | Reduces reliance on remembering a separate follow-up when requested work changes. Successive deliberate publications can produce unnecessary email, so the choice and recipient must be obvious and controls must be real. |
| **B — Offer the same email capability, initially Off.**                 | Staff deliberately switch On when the particular published change deserves an email. Authorized tenant administrators can configure availability and the initial choice through the same bounded surface.                                                                         | Stronger protection against routine or accidental mail, and sensible when staff already coordinate personally. It adds a decision staff can overlook; a recipient may discover new work only on their next visit.          |

**Recommend A**, with a visible choice integrated into the existing Add item /
Update instructions review, source eligibility, tenant control and no automatic
message for drafts, unchanged material or template edits. Both options preserve
the same source publication and current request experience. Their meaningful
difference is the initial staff choice, not access, evidence or extra channels.

This is a product judgment: a cue linked to deliberate published work can reduce
forgotten follow-up and surprise. Neither actual Asym forgetting/noise rates nor
the superiority of an On default has been measured. The strongest counterargument
is that initial Off better protects intentional communication. Existing supported
outreach remains possible, but manually drafting a separate message should not be
mistaken for an already qualified automatic new purpose.

## Concrete example and user journey

Illustrative scenario, not an observed ministry workflow: Elena has an unfinished
ordinary request with Maya. Elena lawfully adds an Equipment list under Q36, or
publishes clearer same-need instructions for an outstanding Project summary
under Q37. The source has already established the actual handling route and
current review responsibility; this question grants no new requirement power.

Under A, Elena sees **Email the recipient about this update** initially On when
eligible, along with the safe current destination. She can switch it Off—for
example, because she has already explained the change directly. Under B the
same choice starts Off and she turns it On when needed. The actual Add item or
Update instructions action remains clear. Saving the change and submitting a
notice for delivery are distinguishable outcomes; a successful publication does
not mean mail was delivered or read.

Maya receives a minimal qualified cue that the request was updated, with only
the safe context/action the current source permits. On authorized return, the
existing request shows the new item/current instructions, actual update time
and preserved prior progress. Do not claim all earlier evidence needs uploading
again, imply new access, or label every change Action required. Q37 may instead
leave staff reassessment as the next work; Q36 may use Q28 staff-supplied evidence
without requiring participant action at all.

If email is Off, disabled, unavailable or fails, independently lawful publication
and required on-return guidance remain valid. Email status is truthful and its
recovery cannot require adding the item or publishing the revision again. An
expired participant admission remains expired unless the source separately
authorizes actual fresh access; the email itself cannot renew it.

## Current primary research and strongest alternative

Official documentation retrieved 2026-10-23 supports awareness and deliberate
control, but does not establish a universal initial-On best practice:

- [Content Snare: Editing requests after they are sent](https://contentsnare.com/help/knowledge-base/editing-requests-after-sending/),
  updated September23,2024, says edits appear on the next client visit and
  recommends manually sending a suitable email template about additions.
  This is direct evidence for useful awareness and a credible manual/Off
  alternative. Core does not inherit live autosave, mutable response history
  or changing reminder/due-date behavior from that guide.
- [FileInvite: Sending an Invite Follow-Up](https://help.fileinvite.com/articles/sending-an-invite-follow-up)
  documents an explicit follow-up action that adds requests within the existing
  invite and notifies the client. Its [borrower-email guide](https://help.fileinvite.com/articles/borrower-email-notification)
  identifies a follow-up email after a user sends that follow-up. This supports
  connecting meaningful added work to awareness. It does not prove every Edit
  Invite automatically emails, or justify copying its access/SMS behavior.
- [FileInvite: Modifying a Sent Invite](https://help.fileinvite.com/modifying-a-sent-invite)
  describes a separate product/login edition and recommends Resend after request
  editing. Its explicit no-notification statement concerns the Options section;
  do not generalize it to every mutation. The two guides show why product edition
  and exact action matter, rather than proving contradictory universal rules.
- [Submittable's submitter notification matrix](https://submittable.help/en/articles/4926006-what-notifications-should-i-expect-to-receive-from-submittable-as-a-submitter),
  dated December29,2023, lists notices for additional forms and editing events
  and allows submitter email opt-out. The newer [Open for Editing guide](https://submittable.help/en/articles/15850735-open-for-editing-edit-submission-responses)
  makes some admin email conditional. This supports useful cues and respecting preferences,
  not a claim that every update always sends or that Core's initial choice is
  already proved. Exact newer-page evidence is retained in the comparative note.

The [comparative research](phase29-q40-comparative-research.md) records full source
dates, current editing guidance, notification/noise counterevidence, accessibility
considerations and journey distinctions. [GOV.UK's checkbox guidance](https://design-system.service.gov.uk/components/checkboxes/)
warns against preselection because people may miss a question or give an unintended
answer. This is real counterevidence to initial On, not an endorsement of it or
a claim that this operational choice is a consent checkbox. A visible default
alone does not prove staff understand it. The selected-answer
review must require an unmistakable effective choice and consequence, not import
a checkbox convention as justification for unnoticed sending. No authenticated
vendor exercise, staff interview, usability measurement or email-delivery test
was conducted here.

## Governing boundaries and why this is a genuine next question

The [owner research](phase29-q40-owner-research.md) and
[runtime research](phase29-q40-runtime-research.md) retain exact contract and
implementation evidence. Both options must respect these boundaries:

1. **Q36/Q37 deliberately reserve this decision.** They authorize source-owned
   published additions and material instruction revisions, and require useful
   on-return presentation. They expressly select no added-item/revision email,
   default, reminder or channel. Q39's reusable templates are inert and cannot
   supply the missing communication occurrence.
2. **One policy question, distinct actual source facts.** The proposed family is
   participant awareness of actual Q36 addition/Q37 material instruction
   publication. Keep each event's exact identity and meaning; do not invent a
   generic request.changed event or conflate review feedback with revised
   instructions. Drafts, autosave, template maintenance, no-op publication,
   transfer/scan/provider callbacks and generic task updates are not triggers.
3. **Earlier notice contracts remain distinct.** Q20 fresh-access notices,
   Q26 Request changes, Q27 source-actionable staff review email, Q31 staff
   clarification replies, Q32 received participant clarification to staff and
   Q35 cancellation retain their own
   meaning, recipient, plan and eligibility. Their defaults are precedents,
   not automatic authority for Q40 or permission to rewrite all notifications.
4. **Source publication survives optional mail failure.** The requesting source
   owns the actual update and current audience/usefulness/disclosure. P17 owns
   the exact qualified content/catalog/plan; P6 owns its authorized release,
   delivery and reconciliation. Preserve actual original choice and recoverable
   handoff coherently; no fake event, new publication on retry or inferred
   unqualified zero. No full Workflow Studio prerequisite follows.
5. **Notify does not mean demand action or grant access.** Current factual
   awareness may be useful even when staff—not the participant—must act next.
   Eligibility and copy/action must match that actual route. Conversely a
   participant-required update must have its Q36/Q37 qualified handling path;
   mail cannot paper over missing authority or promise future admission.
   Email delivery/reading, recipient online presence and reply are not source
   publication or acceptance prerequisites.
6. **Control noise without inventing another platform.** The recommendation is
   bounded tenant availability/initial-choice settings and a visible per-act
   staff choice within existing surfaces. No arbitrary audience, extra channel,
   digest, automatic reminder, AI importance classifier or second approval is
   selected. A tenant default should seed a new review, not silently flip an
   already visible choice. Missing choice is not an instruction to send.
7. **Qualify pending work explicitly if A or B is selected.** Q35's historical
   Disabled behavior is an explicit purpose-specific exception; it is not a
   blanket override of P17's future-only plan rules. The selected-answer review
   must resolve this new purpose's disable/re-enable, current usefulness,
   sealed material, original handoff/replay and in-flight outcomes explicitly.
   No silent reuse of another purpose's lifetime or current-utility rule.
8. **Avoid duplicate-looking access and update mail.** Q36/Q37 may accompany a
   separately authorized Q13 fresh admission, whose Q20 notice has its own
   choice and meaning. Qualify clear source-action coordination and visible
   notice consequences; do not blindly send two near-identical messages,
   silently suppress a selected purpose, or invent a composite event/digest.
   This edge needs explicit selected-answer treatment, not a second product
   question or an unqualified combined-template shortcut now.
9. **Minimize external content.** The intended recipient is source-qualified,
   not any entered email, watcher list, team, household or template audience.
   Provide enough currently permitted context to distinguish this exact updated
   request from similar or replacement requests; a sensitive title is not
   automatically safe. If no useful safe identification is possible, do not
   send a confusing generic cue. Respect current contact/privacy/communication rules; tenant On cannot
   override them. Avoid private instruction bodies, filenames, evidence,
   internal reasons and attachments in the cue. Any return route uses its
   actual current authority; a notice is not a bearer grant or access reset.
   Later portal expiry alone neither authorizes nor universally prohibits a
   useful factual notice; current disclosure, usefulness and any action must
   independently qualify. Expiry never validates an otherwise unavailable CTA.
10. **Native proof remains required.** Current task notifications, approval
    helpers, outbox tables and email rendering provide adjacent mechanisms.
    They do not prove this exact Live source purpose, material class, finite
    utility, optional readable-history contract, recipient rights or complete
    release/replay path. Do not fabricate a Party, borrow financial/staff
    lifetime limits or activate a placeholder key to make it appear implemented.

Q40 therefore asks one unresolved product default with its necessary boundaries.
It does not reopen Q36/Q37 authoring or Q39 templates, select a provider or demand
a broad notification redesign. Exact amendments follow the selected answer's
full adversarial review; no choice is inferred from consistency with earlier A's.

## Journeys and acceptance direction

| Journey                                                  | Required distinction under either option                                                                                                                                                                          |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Staff adds an actual ordinary item                       | Existing Add item review shows the effective eligible email choice and consequence; publication remains the authoritative act.                                                                                    |
| Staff changes instructions for the same outstanding need | Notice corresponds to actual material Q37 publication, not draft keystrokes or unchanged text.                                                                                                                    |
| Staff already explained the change directly              | Can decline this optional notice without blocking an otherwise lawful update or adding an essay/approval step.                                                                                                    |
| Tenant wants less mail                                   | Can configure the new purpose's availability and initial choice where qualified, without changing unrelated ratified notice purposes.                                                                             |
| Recipient returns after an update                        | Sees actual current work, true update time and preserved progress whether email was sent or not. No forced reupload/read receipt.                                                                                 |
| Staff reassessment or existing-evidence route            | Message does not demand participant work or claim new access. Show the true next actor and qualified current action.                                                                                              |
| Expired access and genuinely required participant work   | Actual source fresh admission/route qualifies separately; notice grants nothing. Coordinate Q20/Q40 choices and outcomes without duplicative or misleading messages.                                              |
| Current recipient/contact is restricted or changed       | Do not substitute destination or disclose private content. Revalidate or show a safe notice-unavailable state while retaining lawful source work.                                                                 |
| Tenant policy changes while a review is open             | Preserve the initialized visible choice; independently revalidate current availability/authority with an explicit outcome. No hidden On.                                                                          |
| Lost response after source publication                   | Recover original source occurrence and notice outcome; no repeated addition/revision, new message key or fabricated not-sent result.                                                                              |
| Permission/state changes before dispatch                 | Apply this purpose's qualified current usefulness/disclosure and pending-work rules; immutable original facts remain true.                                                                                        |
| Recipient on mobile, AT or slow connection               | Minimal accessible cue and protected return; no attachment/download/new account step. Maintain current source proof requirements and lawful progress.                                                             |
| Staff on keyboard/AT/mobile                              | Effective choice, safe destination and outcomes are perceivable and operable without focus theft or a hidden default.                                                                                             |
| Support diagnosing missing email                         | Distinguish source published, email declined/disabled/ineligible, handed off, pending, failed and actually provider-observed outcomes using safe evidence. Published does not mean sent; sent does not mean read. |

Selected-answer acceptance should prove source-independent publication, exact
original occurrence/choice/handoff, current recipient/contact and material rights,
semantic replay, disable/re-enable and in-flight behavior, Q20 coordination,
privacy-safe history and composed intended-user comprehension. Use actual source
and delivery boundaries, not an email mock or a checkbox screenshot. Native
limits/resource budgets belong to qualified implementation; no guessed throughput,
frequency, cost neutrality or extra policy platform is implied.

## Current implementation, ratification and evidence limits

Q39's exact12-paragraph decision (10,888 characters with paragraph separators),
all138 review-table rows and full C/P obligations are preserved. Its exact new
term is now in CONTEXT.md; the prior24 definitions remain byte-preserved. Root
verification checks345 other feature/product file hashes, including unrelated
pre-existing product edits. Q01–Q39 are ratified; Q40 remains unselected.

Fresh local HEAD remains3d85897ebf1515008ef5c676b1c58a15422fb9ab; reviewed live
develop remains4e31ff33fc63063dafd8678298e74ce0c2eee894, unchanged since Q39.
The source/runtime notes distinguish actual current code from intended owner
contracts and exact native qualification. No pull, deployment, hosted SQL,
private documents, provider configuration, real email or implementation change
occurred. Documentary preservation/links/formatting are separate from native
RLS/race/provider/browser/accessibility or intended-user evidence.

## Historical preparation scope and snapshot

Independent whole-question owner/runtime/UX reviews are closed with no material
findings remaining. Their notes preserve full source/current-code distinctions,
primary counterevidence, journey checks and Q39 exact-adoption verification.
Conrad chooses A or B; the chosen answer
then receives the complete adversarial review and exact amendments. No Q40 ADR,
new glossary term or answer is inferred. Formal canonical owner/OpenSpec
publication remains /to-prd and tickets remain /to-issues.

## Historical founder answer and review — before ratification, 2026-10-24

Conrad selected **A — Notify by default, with tenant and staff control** on
2026-10-24. The [full review](phase29-q40-adversarial-review.md) gives **Accept
with required amendments**. The [feature ADR](../docs/adr/0040-tenant-controlled-recipient-update-notices.md)
records the exact fourteen-paragraph corrected decision. Q40-C01–C14/P01–P32,
all22 categories,20 lifecycle distinctions,24 journeys,8 measurement rows and8
operating controls form the complete reviewed package. Q01–Q39 and all25
glossary definitions remain unchanged; no new term is proposed.

Permit one optional minimal recipient email for an actual committed Q36 addition
or Q37 material instruction publication. Start the qualified purpose Enabled
with the visible staff choice initially On. Tenant administrators can disable
the purpose or choose an initial Off default; staff may decline. Defaults seed
new reviews only, and missing/conflicting input never becomes On. Keep actual
source publication, original explicit choice, policy and mandatory handoff
coherent; optional mail never rolls back or requires repeating source work.

The narrow Q40-only overlap exception is resolved: in the exact combined Q13
fresh unfinished admission plus update review, same request/recipient/qualified
destination, independently eligible selected Q20 initializes only uninitialized
Q40 Off. Show separate purposes and0/1/2 notices requested; staff can choose
neither/either/both. Preserve initialized choices and revalidate material changes.
There is no combined event, cross-purpose satisfaction, hidden auto-flip,
deduplication or fallback after Q20 fails. Q20's own rules remain unchanged.

Q40 explicitly adopts pending Tenant Disabled at every actual sealed submission
and later allowed provider-call admission, including unresolved handoffs and
ambiguity retries. Preserve intervening Disabled history and in-flight truth;
re-enable cannot revive old Off/zero/stopped work. Initial-default changes remain
future-review-only. Exact utility requires current outstanding/unaccepted work
in an unfinished request; Q37 requires its exact notified instruction revision.
Acceptance/removal/actual supersession/terminal/source restriction that ends
that predicate stops all later calls, even if the ending interval occurred
while no worker ran. Actual durable Q21 acceptance can stop Q40 before Q22
fulfillment; clicks/receipts/deferred evaluation alone do not prove either.
Q36 added-need awareness may remain applicable through a later same-item Q37
revision when its frozen variant/action remains valid. Unknown proof blocks
without fabricating a terminal stop, and no later applicability revives old mail.

Require exact complete Live release/proved zero, permanent semantic identity,
original plan/recipient/material pins and committed-result reconciliation first.
Reserved/unknown has no P6 parent or historical catch-up. Provider ambiguity is
not failure or permission to rekey; retain the inherited three permitted causes
and at most two follow-up HTTP calls total after initial, within earliest
deadlines/current fences. Authenticate exact callback evidence and never infer
human reading or promise physical exactly-once delivery/recall.

Use minimal safe context that identifies the exact request. Keep factual
awareness separate from participant action and access, including staff-only
Q28 routes and later portal expiry. Any protected action/current contact and
the full Party/no-Party resolver/preparation/authenticated-data/dispatch/history
branch must qualify. No private instruction bodies, evidence, arbitrary audience
or public storage fallback. Exact qualified transport/protected-action carriers
have only their bounded owner permission, not general log/history/Recent access.

Qualify the exact closed optional external material/finite utility profile
before Live; no borrowed financial/staff/access duration or indefinite storage.
Durable history is body-free. Readable Recent copies need an exact compatible
current reveal contract and inherited shorter tenant Off/7/30-day versus
contract0/7/30-day retention; unknown classification is zero. No fake Party,
old-copy resurrection or retry-byte reconstruction follows.

Native proofs cover effective tenant-aware grants/RLS USING/WITH CHECK and all
privileged doors, original-admission versus plan/binding/recipient/generation
races, complete candidate/member release, failures, every-call stops, restore
and actual accessible user comprehension. Use existing source/P12/P17/P6/UI
surfaces, clear persistent publication/mail outcomes and supported stage-correct
remedies. Plain-text/images-off email remains useful; toggling never sends.
No new inbox/digest/channel/approval/notification engine or whole-Studio gate.

Independent full-report/ADR owner/runtime/UX reviews are closed after material
precision findings were reconciled, with complete proof/journey crosswalks.
Fresh livec541b84b differs from previous4e31 by43 ahead/0 behind and67 fully
inventoried files: CI, ownership/setup guidance, scripts/tests and Shadscan
baseline. Nontruncated trees preserve applicable product/owner/OpenSpec scopes;
changed governance uses .github/CODEOWNERS for review routing, not authorization.
Local3d85897 remains distinct. No pull, native tests, hosted SQL/private content,
provider change, real email or runtime implementation occurred. Primary research
retains mixed defaults and GOV.UK counterevidence; no measured Asym benefit.

Q40 A is selected and fully reviewed; all required amendments await ratification.
Q41 is not asked. Formal canonical owner/OpenSpec publication remains /to-prd
and tickets remain /to-issues.

## Full ratification — 2026-10-24

Conrad explicitly instructed on2026-10-24: “Yes, fully ratify Q40 A with all
required amendments. Record it and move to the next question in this Phase 29
grill-with-docs session, with research, practical options, and your recommendation.”
The exact fourteen-paragraph corrected decision, C01–C14/P01–P32, all22
categories,20 lifecycle distinctions,24 journeys,8 measurement rows and8
operating controls are adopted without substantive change. Q01–Q40 are fully
ratified grooming intent; all25 glossary definitions are byte-preserved.
No new term is added or refined.

Preserve the optional exact Q36/Q37 update purpose, tenant availability/default
and explicit staff choice, source-independent coherent original handoff, exact
Live release/zero, permanent replay and every-call Disabled/current-utility
stops. The narrow same-request/recipient/qualified-destination compound Q13
exception initializes only uninitialized Q40 Off when eligible Q20 is already
selected; choices/results stay independent with no fallback or combined event.
Actual acceptance/removal/applicable supersession/closure/restriction stops old
calls without recall or later revival. Q36 added-need and Q37 exact-revision
utility remain distinct; unknown proof is not a fabricated terminal stop.

Retain minimal safe identification, actual next actor/access, full qualified
recipient/material/reveal branches, bounded immutable provider recovery,
body-free history, effective database authorization and supported accessible
stage-correct recovery. No new channel, inbox, digest, approval engine, generic
workflow or glossary term follows. The exact native profile/budget/proof gates
remain implementation obligations, not satisfied by ratification.

Review source/runtime/primary-research snapshots remain dated evidence; Q41
research records current freshness. No Q41 answer is inferred. Formal canonical
owner/OpenSpec publication remains /to-prd; tickets remain /to-issues.
