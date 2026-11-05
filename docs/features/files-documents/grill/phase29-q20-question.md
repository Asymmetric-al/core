# Phase 29 Q20 — recipient email when staff grants fresh access

**Status:** Historical researched question prepared 2026-10-21, Asia/Bangkok.
Conrad selected A and ratified its complete required amendments on 2026-10-21:
notify by default, with staff control, preserving excellent UX/UI, flexibility
and no overengineering. Q01–Q20 are ratified grooming intent. No implementation
or activation follows.

## Historical question and alternatives

**When staff grant fresh access to an ordinary native private document request,
should Notify recipient by email start selected, or should staff select it?**

Use the same choice for first and subsequent fresh unfinished-access grants
and fresh completed-read grants, through their distinct owning sources. The
recipient should be told the correct resulting kind of access; completed work
remains read-only. Original request invitations, identity confirmation messages,
reminders, bulk sends, other channels and specialist mandatory notices are
outside this decision.

Q01–Q19 intentionally did not add an automatic notification. Q20 would add a
visible reviewed communication choice, not a hidden send on every state change
or an automatic renewal. Granting access and authorizing its notice remain
separate permissions and outcomes, even when presented in one staff action.

## Practical options

| Option                                                      | Exact proposed behavior                                                                                                                                                                                                                                                       | Benefit                                                                                                                                                                                                                 | Tradeoff                                                                                                                                                                          |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Notify by default, with staff control (recommended)** | In the existing grant review, Notify recipient by email starts selected when the exact source/sender/recipient/channel path is qualified and eligible. Staff can turn it off and grant only where permitted. The final action clearly shows whether it includes notification. | Makes the recipient handoff part of the reviewed grant action; staff need not remember an additional selection or later send. Supports the already-running fixed access period while retaining a quiet grant-only path. | A staff member may leave the default selected when an email is unnecessary or inappropriate. Clear recipient/consequence review and real communication eligibility are essential. |
| **B — Notify only when staff select it**                    | The same option is initially unselected. Staff may select it in that same review, or grant only. No separate mandatory post-grant screen is added.                                                                                                                            | Requires a deliberate opt-in to each notice and reduces reliance on noticing a preselected choice. Keeps the same integrated workflow.                                                                                  | Staff may omit a useful notice, leaving the recipient unaware while the access clock runs. Existing qualified discovery or later communication may help but is not guaranteed.    |

Both options leave the choice under staff control and preserve the same
underlying source/P6/P17 authority. This is a single default choice, not a
tenant preference editor, another notification platform or two permission
models. A later separate message is a governed recovery/manual path only where
available; it is not a third required product mode or a claim of current runtime.

## Concrete example

Illustrative scenario, not an observed ministry workflow: staff approve another
read-only period for Maya's completed request. They review the permitted scope,
recipient and standard end terms. Under A the email option is already selected;
under B they select it if wanted. Either choice can complete the grant and
request its notice in one meaningful action when both are authorized.

If Maya is already being assisted in the same interaction and no notice is
needed, staff can grant without email. This does not imply that copying an old
link is a safe substitute; any handoff must use its qualified source route.
If email is unavailable, show that fact safely rather than inventing a recipient
or fallback channel. A legitimate grant-only path must be explicitly understood.

If the grant succeeds but the email fails, show those outcomes separately.
Do not call the grant failed, grant again or restart its deadline. Recover the
appropriate source/communication outcome; provider acceptance is not proof that
Maya received, read or acted on the message.

## Research and recommendation

**Recommend A**, conditional on the actual qualified optional notice contract.
It makes a useful recipient handoff part of the reviewed action while allowing
staff to suppress unnecessary email. The fixed clock already starts at source
issuance, so a forgotten notice can consume useful opportunity. That is a
reasoned product concern, not a measured Asym omission rate or proof that most
ministries want a notice every time. B's explicit-control advantage is real.

| Primary source, checked 2026-10-21                                                                                                                                         | Documented behavior                                                                                                                      | Consequence and limit                                                                                                                                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Content Snare Publish & Send](https://contentsnare.com/help/knowledge-base/step-5-publish-send/)                                                                          | Distinguishes ordinary notification/reminder settings, no automatic reminders and no messages; users can preview planned communications. | Shows useful control at the action that makes a request available. Its initial publishing, schedules, shared-client access and accounts do not establish Asym's fresh-access default or permissions. |
| [Digify mobile secure-file sending](https://help.digify.com/en/articles/1137411-sending-files-with-document-security-on-your-mobile)                                       | Provides Send & notify recipients and Get link & skip notification outcomes.                                                             | Supports a clear send-or-skip choice in the same task. Do not import bearer-link sharing, trackers, arbitrary recipients or Digify's timing settings. It does not prescribe a checkbox default.      |
| [Submittable Additional Form workflow](https://submittable.help/en/articles/2829680-how-can-i-allow-a-submitter-to-edit-an-additional-form)                                | Staff review an email and use a combined Open for Editing and Send Response action.                                                      | A relevant applicant/grant-management example of integrated action and communication. It neither documents a silent alternative nor authorizes reopening completed Asym work.                        |
| [Microsoft Entra request process](https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-process)                                                    | Separates assigned-access and delivery/request states, with policy/configuration-dependent notifications.                                | Useful evidence for distinct outcomes, not a universal notification default or proof that a staff grant always sends mail.                                                                           |
| [GOV.UK check answers](https://design-system.service.gov.uk/patterns/check-answers/) and [confirmation](https://design-system.service.gov.uk/patterns/confirmation-pages/) | Make the consequential action and its result understandable.                                                                             | Use the existing meaningful review and clear result; do not add a routine second confirmation or copy example email/retention behavior.                                                              |

The [comparative research](phase29-q20-comparative-research.md) records further
details and limits. No primary source establishes the optimal on/off default
for this exact Asym notice. No intended-user study or provider-account test was
performed. Integrated default-off is the strongest direct alternative because
it preserves communication control without forcing another workflow step.

## Lean UX and safeguards shared by both options

- Keep the choice in the existing **Grant access to continue** or **Grant read
  access** review. Show the source-approved recipient/destination and message
  consequence only to the extent the staff actor may see them. No arbitrary
  To/CC/BCC, recipient picker, attachment selection or composer is introduced.
- Make the final action explicit: granting with notification versus granting
  only. Preserve the staff selection across validation and safe recovery; a
  retry must not silently re-enable email or treat a new default as intent.
  No extra routine confirmation is needed.
- The proposed fresh-access notice is optional within this ordinary profile.
  Do not disable separately required source/security notices, modify a tenant
  Delivery Plan or treat grant permission as message-send permission. An
  unavailable or unknown message path must not silently become eligible.
- Source/P12 still owns admission, P17 the exact contract/rendered presentation
  and protected-action node, and P6 the communication intent/dispatch/provider
  outcome. The shared doorway remains scanner-resistant and recipient-bound;
  notification possession alone does not complete Q01 proof or authorize files.
- Request one logical notice when notification remains selected in the
  deliberately approved grant review; A does not require a manual toggle.
  This is not a physical exactly-once delivery guarantee. Preserve the reviewed
  choice and durable source/communication identity, eligible current dispatch
  and provider recovery. Grant replay must not turn a grant-only choice into a
  notice; recover an already-authorized notice and its actual state without
  issuing a new grant. Queued, accepted, delivered and read are different facts.
- Preserve current recipient/destination revisions, purpose/contactability,
  sender/host qualification, suppression and private metadata constraints.
  No raw attachment, public/provider retrieval URL, secret logging or
  source-unapproved alternate channel is a fallback. Sender defaults are not
  permission to disclose request details in a subject or lock-screen preview.
- Email delay, bounce, retry or opening does not move the Q14/Q18 source clock.
  The actual issued end and current permission govern. Late/stale notices must
  not promise a new full period or revive ended/revoked access. Ordinary
  reminders, marketing, SMS, push and staff-alert policy are not bundled here.
- Retain shared Base UI/base-maia, accessible checkbox/action names, focus and
  status, localized plain-language content and mobile/low-bandwidth recovery.
  Preserve grant, recipient proof, representation and notification states
  without adding a dashboard, request queue, account or essay requirement.

## Historical governing contracts and current reality

The [owner research](phase29-q20-owner-research.md) and
[runtime research](phase29-q20-runtime-research.md) distinguish intended behavior
from current code. Q08, Q13, Q15 and Q19 expressly left new notification policy
unselected; the fresh clocks and repeat rules are now settled. This is a useful
handoff decision before broader file-management choices, not another expiry rule.

Q01 already ratified a narrow document-request-recipient authority for legitimate
no-Party recipients, with later canonical P4/P12/P17/P6 adoption and the existing
ADR-0025/0037 doorway. Do not ask that identity question again or borrow Phase28's
newsletter-only exception. Exact shared seam qualification precedes its consumers;
whole Phase34/41 delivery is not a newly invented prerequisite.

P17 message contracts own requiredness, audience, channel and recovery; a tenant
Delivery Plan remains separate from source occurrence facts. Its census defers
the workflow file-request binding rather than establishing a Live native fresh-
access notice. Q20 would specify an optional ordinary notice/default through
the appropriate source/P17/P6 contract, not repurpose Phase18 artifact-ready mail.
The selected answer requires exact narrow successor mapping and full adversarial
review; no notification capability is activated by this question.

Local HEAD remains `3d85897ebf1515008ef5c676b1c58a15422fb9ab`; freshly checked
live develop remains `800213405e2c51e07180e86ee8322355e0fdb4eb`. Adjacent
approval/receipt/template/dispatch helpers do not establish the qualified native
fresh-grant notice or reliable source-to-dispatch recovery. No new runtime suite,
live database/provider action, email send, pull or private-data access occurred.

At preparation no Q20 answer, ADR-0020 or glossary term was recorded. The
subsequent selection and completed review are recorded below. Q01–Q19, all
seventeen definitions and existing product edits remain preserved. Formal
owner/OpenSpec publication remains `/to-prd`; tickets remain `/to-issues`;
no implementation follows here.

## Historical founder answer and review — before ratification, 2026-10-21

Conrad selected **A — Notify by default, with staff control**, requesting the
full adversarial review, excellent UX/UI, flexibility and no overengineering.
The [completed review](phase29-q20-adversarial-review.md) recommends
**Accept with required amendments**: corrected decision, Q20-C01–C08,
Q20-P01–P18, eight journeys, nine lifecycle distinctions and six operational
controls. The [feature ADR](../docs/adr/0020-default-on-fresh-access-email-with-staff-control.md)
records selected/reviewed status; the full package awaits ratification.

Use one visible, initially selected optional email choice for each genuinely
new eligible ordinary fresh unfinished or completed-read review, including
ratified later periods. Preserve staff choice, permitted recipient and clear
final consequence without a manual-toggle ritual or extra routine confirmation.
This is a source condition under exact authority and Delivery Plan gates,
not a plan override or send authority. Missing/legacy input is never true.

Preserve exact grant/choice and durable required handoff. Replay cannot add
an omitted notice; recovery may finish the original authorized selected notice.
Staff-off alone means not requested; selected suppressed/non-applicable/unknown
or zero-child outcomes retain the original requested choice. Keep grant and
message outcomes distinct. Current source checks prevent stale unfinished
instructions after fulfillment, retargeting or access-clock reset. Immutable
provider recovery/correlation and safe body-free history remain required.

The strongest alternative remains integrated default-off, supported by GOV.UK's
explicit preselection caution. A is a bounded product judgment; staff
comprehension remains an activation proof requirement. Qualify the exact
optional-recipient prepared-material/utility and Recent-copy posture rather
than borrowing staff/financial retention or the thirty-day access window.

The full review maps the narrow predecessor notice reservations and requires
native source/role/RLS/race/provider/restore/browser/AT/user proof. Independent
final passes resolved staff-off versus suppressed-zero wording and source
business meaning versus P17 contract/presentation ownership. No material design
finding remains unresolved; implementation qualification remains explicit.
No new runtime tests, implementation, email or formal publication occurred.
Q01–Q19 and seventeen terms remain unchanged; Q21 has not been asked.

## Ratification — 2026-10-21

Conrad subsequently ratified Q20 A and its complete required amendments:
corrected decision, Q20-C01–C08, Q20-P01–P18, eight journeys, nine lifecycle
distinctions, six operational controls and exact predecessor notice-reservation
mapping. The preceding selection/review is dated provenance; ADR and full
review record adoption. Q21's answer, native qualification/implementation and
formal publication are not inferred.
