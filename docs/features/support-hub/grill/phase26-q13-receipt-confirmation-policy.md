# Phase 26 Q13 — Automatic confirmation of new email requests

11 September 2026. **D1–D12 are fully founder-ratified. Q13 was answered A; its complete D13 amendment package is now fully founder-ratified on 11 September 2026.** The [evidence record](phase26-q13-evidence.md) supports the three alternatives and recommendation. The original alternatives below are preserved as question-stage history. The [D13 review](phase26-d13-adversarial-review.md) records the selection and complete proposed amendments, not an activated automation or formal specification.

## The next single decision

Which receipt-confirmation policy should Asym recommend when a tenant configures a Support inbox: a brief automatic confirmation for eligible new email requests, confirmation only outside service hours, or staff replies only?

“Receipt confirmation” here means **we received your Support request**, not a charitable-gift receipt, a substantive answer, a staff member's personal acknowledgment or a promise that the issue is solved. “New request” means a new requester conversation created by qualified inbound intake, not a newly phrased issue inside an existing conversation. It applies only after qualified durable intake and outbound safety checks. A provider webhook arriving or an unreviewed placeholder existing is insufficient.

Illustrative example: Maya emails the tenant with a new sign-in question on Tuesday morning. Another requester emails on Friday evening. Neither has a portal ticket page under D1. A short confirmation can reassure them their message reached the team, but it also adds an email before a staff answer.

## Three meaningful options

| Option                                     | Tuesday during configured service hours                                   | Friday outside configured service hours                                                                                | Strongest benefit                                                                                                              | Main cost                                                                                                                                   |
| ------------------------------------------ | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Confirm eligible new requests**      | One brief automatic confirmation, subject to safety/applicability limits. | The same receipt confirmation; useful approved service-hours information can be included without inventing a deadline. | Consistent reassurance that the team has a recoverable request, regardless of when staff can answer.                           | An extra email can feel redundant when staff respond quickly. Requires precise anti-loop, duplicate and late-send suppression rules.        |
| **B — Confirm only outside service hours** | Staff's actual reply is normally the first response.                      | One brief automatic confirmation confirms receipt and explains the configured service hours.                           | Reduces daytime email noise while explaining predictable off-hours delay.                                                      | A daytime requester may still wait without confirmation. Correct inbox calendars, holidays and time zones become prerequisites.             |
| **C — Staff replies only**                 | No automatic receipt confirmation.                                        | No automatic receipt confirmation.                                                                                     | Fewest automated messages and simplest outward behavior; well suited to teams that deliberately prefer personal first contact. | The requester gets no confirmation until staff respond, even during a long wait. Staff still own all intake/recovery/follow-up obligations. |

**Single recommendation: A — one concise receipt confirmation for each eligible newly admitted email request, with a tenant-controlled inbox policy.**

“For each” is a policy preference, not a guarantee to bypass suppressions or send on every message. It is at most one qualified occurrence for new requester intake, with exact safety/rate/applicability rules to be settled in the selected answer's full review. The policy should remain a small explicit inbox choice rather than a tenant-authored workflow builder. The recommended mode does not activate sending until the tenant's source/sender/content/safety contract is qualified.

## Why A is the strongest starting point

Email-first support provides no required portal status page. A short factual confirmation makes receipt visible without requiring a donor to sign in, follow a link, quote a ticket number or repeat the request. Working hours are not proof that a staff answer is immediate. This is a product judgment, not a claim about measured ministry response times or donor satisfaction.

A should communicate only what the system can substantiate. Example wording for review, not a finalized template:

> Thanks for contacting [tenant]. We’ve received your message, and our team will reply here.

No invented “within 24 hours,” personal staff signature, financial facts, AI answer, compulsory self-service or echo of the request's sensitive body is needed. The eventual full review must qualify purpose, recipient, content, sender, threading, localization, suppression and how staff see its actual status.

Help Scout offers first-conversation auto replies and an outside-office-hours mode. Zendesk supplies a received-request notification pattern; Front distinguishes once-only from repeating responses. Those establish real alternatives, not an instruction to reproduce their rules, recipients, hidden history or limits. [Help Scout](https://docs.helpscout.com/article/16-create-a-mailbox-auto-reply), [Zendesk](https://support.zendesk.com/hc/en-us/articles/4408828984346-About-the-standard-ticket-triggers), [Front](https://help.front.com/en/articles/2112).

## What this question does not reopen

- Ordinary replies, reopened conversations, duplicate delivery/replay, D10 Merge/Undo, D11 internal assistance and D12 staff-created/referral work do not become new automatic-confirmation triggers merely because work changed. D12 creation still sends nothing.
- D1 already requires durable recoverable accepted input and current safety/classification/recipient authority before automatic sending. Held, ambiguous, unsafe or detected automated input is not eligible merely because the provider delivered it. Release/recovery applicability must be deliberately qualified before any later send.
- A confirmation is not the substantive staff answer, does not stop response measurement, claim human review, change work status or complete a business action.
- D2's personal Reply-all setting governs human composition; it must not silently choose the audience for an automated system notice.
- Phase 17 governs the automatic notice's qualified producer/content/preparation and Phase 6 its actual communication/delivery facts. The D4 human-authored path and a generic macro are not substitutes.
- Quarantine and loop protection remain activation prerequisites. Resend-first provider qualification is already the roadmap direction; this is not a new provider-selection question.

## Consequences for the full review after selection

The selected answer's adversarial review must settle the exact eligible new-intake occurrence, no-Party recipient authority versus spoofing/forwarding, one-per-occurrence and sender/tenant loop budgets, malformed/automated mail, prior staff-answer races, held-message release and replay, outside-hours interpretation where enabled, template/publication safety, source-currentness, actual P6 history, delivery failure and recovery, privacy, metrics, migration and a clean inbox-settings/staff-history UI.

A should not introduce a hidden tag workaround or rely on every tenant constructing correct automation rules. B should not pretend calendar maintenance is free or infer availability from presence. C should not be presented as ignoring requests: all ordinary Support work and staff response responsibilities remain under D1–D12.

No numerical cooldown, new notification schema, recipient expansion, exact SLA or default-on production switch is accepted by this question alone. These are consequences to resolve rigorously after the founder chooses the recommended product policy, not extra questions bundled here.

## Record status

D12 is fully accepted: corrected decision, 27 requirements, 45 proof groups, all 23 categories, complete UX/terms, nine independent corrections and nine operational responses. The [current ratification/question validation](d12-ratification-q13-validation.json) checks preservation separately from the historical D12 review validation.

**Q13 was answered A on 11 September 2026.** The [full D13 review](phase26-d13-adversarial-review.md), [UX/template](phase26-d13-confirmation-ux-template.md), fully ratified ADR0013/glossary and current validation now record the complete amendment package fully founder-ratified on 11 September 2026. The original A/B/C alternatives remain historical. No Q14, implementation, formal spec, tickets or external mutation is advanced.

## D13 selection and full review

The founder selected A and requested the full Resend/Email Studio/adversarial review. See the [complete ratified decision](phase26-d13-adversarial-review.md), [template and experience](phase26-d13-confirmation-ux-template.md) and [current validation](phase26-d13-validation.json). Historical unanswered/no-ADR instructions above describe the earlier question stage only; D13 amendments are now fully ratified.

## D13 ratified; question stage advanced

D13 and its complete amendments are fully founder-ratified on 11 September 2026. The [current researched question is Q14](phase26-q14-reply-timeliness.md); the [current validation](d13-ratification-q14-validation.json) verifies preservation. Earlier no-Q14/pending wording is historical question/review-stage context and does not supersede this ratification.
