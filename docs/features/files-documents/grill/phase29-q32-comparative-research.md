# Phase 29 Q32 — Comparative research for supplementary staff clarification email

Research checked 2026-10-22, Asia/Bangkok. Q31 A and its complete amendment
package are fully ratified in the current canonical ADR. Q01–Q31 and twenty-two
definitions remain intact. Q32 is a proposed question with no selected answer.
Only this research note was written; no product, provider, canonical owner,
private data or real messages were changed.

## One fair question and recommendation

**When a participant sends a new question or reply in a document request, should
the staff qualified to handle it receive a supplementary email by default, only
after the tenant enables it, or should this phase keep awareness native?**

Recommend **A — Enable the optional staff email by default, with tenant control**.
A participant's direct question can need attention before further document work
is possible. A modest email cue can help staff who are away from the native work
view notice that incoming clarification. This differs from an uploaded document
becoming ready for routine review, and it does not assume that all staff monitor
Core daily. Current comparable products expressly distinguish message mail from
some submission mail. The recommendation is a product judgment, not a measured
Asym response or completion benefit and not a vendor-majority vote.

| Option                                                     | Practical experience                                                                                                                                                                                                                                    | Strongest benefit                                                                                                                                                                                                    | Cost and boundary                                                                                                                                                                                           |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Optional staff email initially On (recommended)**    | A newly admitted participant question/reply is visible in its existing source work. The qualified optional step can also email the staff admitted for that handling purpose, subject to current gates. Authorized tenant administrators may disable it. | Provides an out-of-product cue for a human request that might otherwise wait for a staff member's next visit. Does not require participants to understand staff settings or staff to opt into each incoming message. | Short thanks and repeated exchanges can create noise. Minimal mail can still expose a relationship. Correct audience and current permissions are essential; email does not guarantee attention or response. |
| **B — Same optional staff email initially Off**            | Native handling is the baseline; authorized tenant administrators enable the supplementary notice if their operating model benefits from it.                                                                                                            | Avoids creating an extra email stream for teams already reliably working from native queues, or where privacy/channel considerations favor native access. Retains the capability for intermittent staff.             | Useful questions may wait if the tenant overlooks the setting or assumes mail is already active. Requires essentially the same qualified delivery and recovery machinery as A.                              |
| **C — Native awareness without this new email capability** | Staff receive and handle clarification through the existing qualified source work; there is no new supplementary clarification-email purpose in this phase.                                                                                             | Smallest outbound scope and no extra email operation to maintain. Credible where native handling is demonstrably sufficient.                                                                                         | Removes the optional out-of-product cue even for teams that would use it. Native discoverability, capable staffing and recovery must still work; it cannot mean an unattended composer.                     |

These are three product alternatives, not three tenant modes. A/B are the same
optional capability with different **initial tenant-plan enablement**. They are
not Q31's per-reply staff checkbox, and participants should not acquire a Notify
staff checkbox, staff directory or ability to choose who is emailed. Existing
applicable recipient/source preferences still apply; no new personal preference
center, subscription manager or arbitrary audience designer is selected.

## Strongest counterargument to A

B is particularly strong when a team reliably checks the existing source work
throughout its working day, receives many short exchanges, or has a reason to
keep supplementary notifications out of external mailboxes. There is no Asym
traffic, monitoring-frequency, recipient-count, response-delay or unwanted-mail
evidence here to show whether those conditions are common. Do not claim that
staff need default mail because native work is inherently inadequate, or that
default Off is safe because staff are assumed to be in Core all day.

Default On will not repair an unstaffed route, absence, a wrong cohort, blocked
mail or unclear responsibility. The native handling obligation remains the
actual operating guarantee. The useful compromise is a narrow enabled optional
step and real tenant disablement; it does not require a digest, urgency classifier,
read tracker, automatic escalation or per-message task fanout.

Q27 is not a universal staff-Off principle. Its fully ratified ADR explicitly
chooses Off for first source-actionable document evidence. Q30 and Q31 expressly
reserve incoming clarification mail. Conversely, Q31's participant-facing On
choice does not establish automatic symmetry: the participant awaiting an answer
and staff handling incoming work have different routines, audiences and controls.
Q32 deserves its own decision.

## Fresh primary product evidence

All linked pages below were reopened during this Q32 research on 2026-10-22.
Public documentation establishes supported behavior, not measured user benefit,
all account configurations, authenticated testing or Core authorization.

| Primary source and date shown                                                                                                                                                               | Documented behavior                                                                                                                                                                                                   | Bounded lesson                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [FileInvite Managing Notification Preferences](https://help.fileinvite.com/articles/managing-notification-preferences), no update date shown                                                | New message from borrower is Enabled by default; Request submission is Disabled by default; Ready for review is Enabled. A master switch and individual settings control incoming email.                              | Direct counterevidence to assuming incoming human messages should inherit an upload/email default. This is a personal preference interface, not proof of Core's desired tenant-level policy, exact staff audience or measured results. |
| [FileInvite Messaging in the Client Portal](https://help.fileinvite.com/articles/messaging-in-the-client-portal), no update date shown                                                      | Native message history is available within the Invite/portal. Contacts cannot message each other; the documented lending team sees contact messages.                                                                  | Native context remains useful alongside email. Do not import whole-team access, all-contact messages, fixed character limits or visibility-switch semantics.                                                                           |
| [Content Snare Manage the emails you receive](https://contentsnare.com/help/knowledge-base/manage-emails/), March 24, 2024                                                                  | Dashboard users can disable or limit incoming notifications. Comment emails are among the options listed as enabled by default; the page also lists a daily limit option.                                             | Supports default-On comment awareness with noise controls. Does not establish which comment classes the daily limit covers or justify adding daily batching, a digest or a personal preference center to Q32.                          |
| [Content Snare Comments](https://contentsnare.com/help/knowledge-base/comments/), March 24, 2024                                                                                            | Client questions and staff replies are associated with specific fields; internal comments are distinct. Staff see the question in the request's comment context.                                                      | Supports contextual native handling rather than a separate global conversation. Its rejection notification is a different event; do not conflate comments and review decisions.                                                        |
| [Content Snare Step 2: Essentials](https://contentsnare.com/help/knowledge-base/step-2-essentials/), September 23, 2024                                                                     | A named request owner receives request-related communications and can be used to filter the request dashboard.                                                                                                        | Shows an explicit ownership/audience pattern. Core permits qualified person/team handling, so do not import a mandatory single owner, creator fallback, sender identity or assignment-equals-access rule.                              |
| [Submittable reviewer notifications](https://submittable.help/en/articles/4927182-what-notifications-should-i-expect-from-submittable-as-a-reviewer-for-an-organization), February 10, 2025 | Reviewers can disable ordinary email and check assigned submissions in the product. For submitter messages, reviewer mail is conditional on initiating contact; other messages go to the organization's main address. | A serious grant workflow supports mail-off native work and selective routing. It does not prove all assignments should be emailed or authorize a central mailbox fallback in Core.                                                     |
| [Submittable Messaging](https://submittable.help/en/articles/2489806-how-does-submittable-s-messaging-feature-work), September 16, 2026                                                     | Participant-initiated messages notify the main organization address while assignees can see them in the native activity feed; responses to a team member notify that sender under the documented role model.          | Strong evidence that incoming questions and replies need deliberate audience rules, not whole-team broadcast. Do not import main-address fallback, prior-author routing, role levels, email ingestion or full-body mail.               |

The FileInvite `/articles/` guides explicitly redirect users whose login URL
ends in `fileinvite.com` to [the separate knowledge base](https://help.fileinvite.com/).
The current comparison uses the matching `/articles/` notification and portal
guides. Its stated message-enabled/submission-disabled distinction must not be
merged with differently documented older-edition behavior. No comparator's
configuration screen is proof that Core already implements the equivalent path.

## Concrete examples and necessary journeys

Illustrative scenarios, not observations of ministry staffing or behavior:

Elena handles a request through the source-owned route. Nora asks which dates a
certificate should cover before uploading anything. Under A, eligible handling
staff can receive a minimal cue as well as seeing the admitted clarification
in native work. Under B, that same cue is available after authorized tenant opt-in.
Under C, staff rely on native work. Nothing tells Nora that a human has read the
question or guarantees a response time.

Another team works continuously from its native queue and sees many brief
replies. B can be the better initial experience for that team, while A permits
its administrator to disable the extra step. No participant must choose a staff
member or learn how notification policy works. The native clarification and its
handling obligation are identical under all options.

| Journey                                                 | Required boundary whatever default is selected                                                                                                                                                                                           |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First question before upload                            | Native Q30 receipt/handling remains available without a file or evidence-readiness event. The optional notice needs its own exact source occurrence.                                                                                     |
| Participant reply, including short thanks               | Use the actual admitted clarification meaning; no AI urgency classifier, forced question punctuation, hidden first-unanswered latch or fabricated actionable-evidence event. Genuine new messages and technical replay remain distinct.  |
| Staff away from the work view                           | Email is a supplementary cue, never proof of availability, reading or response. Staffing and capable handling are independent.                                                                                                           |
| Team already operating from native work                 | Tenant Off leaves current work and safe shared context usable. Do not replace native discoverability with email or make it depend on delivery.                                                                                           |
| Source route is a qualified team                        | Only the source-qualified cohort for this clarification may be admitted. Team membership, Q24 review responsibility, prior reply authorship or a matching email alone is not authority. No per-member task copies.                       |
| Staff change, leave or lose authority                   | Preserve admitted native work and actual handoff. Later roster changes cannot silently add recipients to old mail; current narrowing still applies. Existing work routing is not a new email event.                                      |
| Participant access expires after sending                | Staff may still have independently authorized handling work. Do not mechanically suppress staff awareness solely because the participant's access ended, and do not promise that the participant can still read a native answer.         |
| Mail is missing, suppressed, delayed or uncertain       | Preserve the received question and accountable native work. Show safe truthful staff/admin information; do not ask the participant to send again or expose staff addresses, preferences or delivery diagnostics to them.                 |
| Administrator changes Off/On                            | Show effective event-specific tenant policy using existing administration. Later On must not email historical questions by replay; pending-work Off semantics need an explicit Q32 owner decision rather than automatic Q31 inheritance. |
| Sensitive case or wrong recipient                       | Minimal subject/body/link metadata still require source authority. Exclude message bodies/excerpts, filenames, private notes and sensitive person/location labels; use the staff's qualified doorway, not participant credentials.       |
| Mobile, keyboard/AT, international or low-bandwidth use | Staff can find the admitted message in its item context, understand native/mail outcomes and resume through a safe authorized route. A plain-text cue with a descriptive link must be useful without images or tracking pixels.          |

## Repository reconciliation and scope discipline

The current canonical records read for this question are feature ADR-0024
(person/team review responsibility), ADR-0027 (staff evidence-review email),
ADR-0030/full Q30 review C05/C07/C11 and P20 (native clarification handling), and
ADR-0031 (participant reply notices). They preserve separate responsibility,
permission, participant contact, staff handling and email audience. Latest
explicit user ratification outranks earlier in-progress headers; the current
ADR-0031 now records full ratification.

The audience should be described as **staff currently qualified to handle this
clarification through its source-owned route**. Detailed original-boundary cohort
admission and current narrowing belong to the exact source/P12/P17/P6 contract.
Do not send to all admins, the original request creator, every reviewer, everyone
on a team, the last reply author or a generic organization mailbox by assumption.
An authorized tenant administrator configuring the optional step does not acquire
private content access or become its recipient.

If A or B is selected, admit one exact new supplementary staff-notice meaning;
preserve Q27 evidence and Q31 outward-participant purposes. Bind original policy
and required finite recipient basis to the actual occurrence, use the complete
existing P6 release and preserve truthful Off/zero/unknown distinctions. Native
lawful receipt/handling must not depend on optional transport success. Avoid a
new queue, digest, bell, read receipt, personal subscription surface, arbitrary
who/how menu, availability engine or a task per incoming message. Any Q32 pending
Off narrowing needs explicit owner reconciliation; it is not inherited from
Q31's separately ratified provider-admission rule.

This is a source-native minimal awareness cue, not permission to email full
participant text or accept staff replies by email. Qualify its staff authority,
protected action and email-only material posture independently; do not borrow
the participant branch or invent a bell sibling to fit an existing staff class.
Participant closure and staff authority must be evaluated independently because
Q30 retains admitted work after participant access ends.

## Evidence still needed before activation

Measure representative staff work habits, clarification frequency, qualified
cohort size, useful-cue versus unwanted-mail reports, native task success and
missed-awareness cases. Include intermittent staff, teams using native work
continuously, short exchanges, handoffs, suppression and participant expiry.
Test real discoverability and control comprehension; do not equate a delivered
email, open/click or view duration with staff understanding. Declare finite
workload/latency/recovery budgets without inventing an SLA or copying a vendor's
daily/hourly notification interval.

No authenticated comparator use, browser/AT/intended-user study, runtime,
real-role SQL/RLS, provider submission or concurrency test was performed. Fresh
documentation and canonical intent support the choice; they do not qualify a
native notification implementation. Full question review will follow when the
coordinator supplies the draft.

## Independent full-question closure — 2026-10-22

Read the complete `work/phase29-q32-question.md`. **No material comparative-
evidence, practical-option, user-journey or UX scope finding remains.** A/B/C
are one real product decision: the same supplementary staff-email capability
initially enabled versus initially disabled, or no new capability. They are
not three tenant modes. A's recommendation and B's noise/privacy/established-
native-work advantages are fair, without a claimed response SLA or assumed
daily monitoring. The current FileInvite message-enabled/submission-disabled
comparison and Content Snare/Submittable limits are represented accurately.

The draft preserves the finite source-qualified clarification-handling cohort,
separate Q24 responsibility and Q27/Q31 purposes, original occurrence/policy
and current narrowing, native receipt independent of optional mail, and the
distinct consequences of participant expiry versus current staff authority.
Participant receipt does not claim email delivery or reading; no participant
Notify checkbox, whole-team broadcast, personal preference center, digest,
new inbox or per-message task is introduced. Staff/admin/participant, handoff,
sensitive context, mail Off/error/uncertainty, mobile/AT/international and
intermittent-use journeys are covered at this question stage.

One focused source-state wording issue was sent to the coordinator and fixed:
mail failure must not imply that the question is perpetually actionable. Final
readback now says the question remains received with source-owned handling and
any current work intact, and expressly excludes reopened work, participant
resend and a task per attempt. This preserves independent native truth after
a question has already been handled. The finding is closed.

The report's live-repository delta is the dedicated owner/runtime pass's
evidence; this comparative review does not claim a separate semantic audit of
that delta. No runtime, SQL/RLS, provider, browser/AT or intended-user test was
performed. This closes the independent question review, not the future
selected-answer adversarial review, ratification or native qualification.
