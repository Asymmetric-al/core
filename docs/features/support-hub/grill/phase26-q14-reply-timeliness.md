# Phase 26 Q14 — Reply timeliness at launch

11 September 2026. **D1–D13 are fully founder-ratified. Q14 was answered A; the complete D14 amendments are fully founder-ratified, 11 September 2026.** This is the next single product-scope decision. The [evidence record](phase26-q14-evidence.md) contains current Core/primary-source research and independent challenge. No D14 answer, ADR, target number or implementation is inferred.

## The next single decision

**At launch, how should Support Hub help teams keep their replies timely?**

An internal reply target helps staff prioritize when a reply is due. A published response commitment tells a requester what response timing they can expect. A reminder is the deliberate follow-up/review already covered by D3. These have different jobs; selecting a launch approach must not collapse them into one deadline field.

Illustrative example: Maya emails about a missing receipt and receives D13's short automatic confirmation. Her request still needs a human answer. After staff respond, Maya supplies more information and needs another reply. Alex is covering the shared inbox and must decide which unanswered work to address first. This example tests the workflow; it does not claim measured ministry response times, staffing or donor behavior.

## Three meaningful options

| Option                                  | What staff and requesters experience                                                                                                                                                                                                               | Strongest benefit                                                                                               | Main tradeoff                                                                                                                                                                            |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Internal reply targets**          | Tenants can configure internal targets. Staff see a quiet due/overdue cue and a focused view of replies needing attention, alongside reports and existing reminders. Requesters continue normal email without an automatically published deadline. | Helps the team notice owed replies while there is still time to act, with little added donor-facing complexity. | Requires trustworthy response evidence, calendars and target rules. Poor choices could create noisy badges or misleading performance pressure.                                           |
| **B — Queues, reminders and reporting** | Staff manage the shared queue, aging work and D3 reminders. Reports show actual response history. Phase 26 does not add automatic target-based due/overdue guidance.                                                                               | Smaller configuration and operational burden; useful for teams that deliberately manage follow-up themselves.   | Timeliness depends more on staff noticing aging work and setting reminders. Reports can reveal a problem after it happened.                                                              |
| **C — Published response commitments**  | Internal tracking also supports deliberately publishing a response-time commitment to requesters through qualified messages or surfaces. Tenant use is optional.                                                                                   | Gives requesters clearer expectations when a team has the coverage and processes to honor them.                 | Requires additional public-content authority, applicability and missed/changed-commitment handling. An internal target miss now also disappoints an explicitly communicated expectation. |

These are different launch capabilities, not three names for the same setting. A includes reporting; B retains active queue management and reminders; C adds an external expectation capability. None requires every tenant to set a target. C does not imply contractual penalties, priority by donation amount or a guarantee about when Finance, a refund or another business action will finish.

## Single best recommendation

**A — Optional internal reply targets, with quiet staff guidance and honest reporting.**

D1's email-first journey and D6–D8 shared responsibility make it useful for the queue to show replies needing attention without requiring staff to remember a separate reminder for every unanswered exchange. D3 reminders still serve deliberate follow-up. D13 remains a factual receipt confirmation. Internal targets add a way to act on timing without creating a new public promise.

Prefer a concise label such as **Reply due [local time]** or **Reply overdue**, in the existing list/detail hierarchy, with a focused view when useful. Do not assume a constantly ticking timer, repeated toast, new task per conversation, automatic reassignment or punitive scoreboard. These are UI directions to pressure-test after selection, not an implemented interface or a finalized warning threshold.

Modern products support this distinction: Front explicitly offers time goals for internal expectations as well as external agreements, while Help Scout's native SLA setup demonstrates that a relatively small policy surface can coexist with ordinary inbox work. Neither vendor's exact clock rules should be imported wholesale. [Front time goals](https://help.front.com/en/articles/3038464), [Help Scout SLA setup](https://docs.helpscout.com/article/1751-create-and-manage-service-level-agreements-slas).

B is the strongest simpler alternative. It is appropriate if tenant teams prefer their existing queue discipline and reminders over policy configuration. Choosing B still requires accurate history, counts and reports; it does not preserve current misleading calculations. C is appropriate if product-managed public commitments are a demonstrated launch need. No such requirement has yet been established in this session.

## What stays settled under every option

- D13's automatic confirmation never satisfies a human reply target. Its 15-minute dispatch utility and 24-hour courtesy cap are unrelated to staff response targets.
- D3's work states, reminders and real promises remain intact. Waiting/snoozing cannot secretly erase owed work or change a promise. A target does not complete a request or an owner-domain business action.
- D10/D12 preserve original evidence and request age through merging, undo, related work and handoff. New tracking rows do not authorize resetting history to improve metrics.
- Support assignment, target eligibility and report access do not grant CRM, giving, care or missionary permissions. D11's delegated work retains its owning domain's due dates and completion authority.
- A/B preserve D13's receipt-only content boundary. C would require an explicit approved public-commitment capability and any necessary D13/content-contract amendment; it cannot silently insert a deadline into the current confirmation template. Existing deliberate human promises remain governed under all three options.
- Resend and P6 provide actual communication evidence; email delivery state, substantive human response and resolution are different facts. Any later system attention/email must use qualified P17/P6 meanings, not a new notification engine.

## What this question does not prematurely choose

No default number of hours, warning interval, universal response guarantee, first-versus-next formula, resolution deadline, service-hours default, pause/reset rule, automatic escalation, customer tier or database schema is selected here. The selected answer's full adversarial review must resolve the necessary scope and semantics against real source/recipient evidence, current clocks, failure/ambiguity and historical integrity. This question chooses the appropriate launch posture before those dependent rules are fixed.

The current repository has SLA fields and UI, but its existing defaults, UTC-only calendar helper, differing risk windows and elapsed-time reporting do not establish a qualified permanent model. Those are implementation gaps to resolve under whichever option is selected, not reasons to avoid the product decision.

## Record status

D13's exact corrected decision, 26 requirements, 38 proof groups, all 23 categories, complete Email Studio/UX/evidence, eighteen independent corrections, glossary and nine operational responses are fully ratified. The [current ratification/question validation](d13-ratification-q14-validation.json) checks their preservation separately from the historical review validation.

**Q14 was answered A; the complete D14 amendments are fully founder-ratified, 11 September 2026.** Present these three alternatives with their tradeoffs and A as the single recommendation, then wait for the founder's selection before the full answer review. No ADR0014, accepted new glossary terms, formal specification, tickets, implementation, provider change or real message is created by this question.

## Founder selection and complete D14 review

The founder selected A—Internal reply targets on 11 September 2026 and requested the full deep/adversarial review. The [complete fully ratified D14 decision](phase26-d14-adversarial-review.md), [UX/reporting blueprint](phase26-d14-reply-targets-ux.md), [source/primary evidence](phase26-d14-evidence.md) and [validation](phase26-d14-validation.json) now record all amendments, fully ratified ADR0014 and glossary. Earlier unanswered/no-ADR wording describes the prior question stage only. D14 amendments are fully founder-ratified; the next question is researched separately.

Q14 is historical interview material. Its former unanswered/proposed/no-ADR language describes that earlier stage only. The full [D14 ratification](phase26-d14-adversarial-review.md#founder-ratification--11-september-2026) now governs. No Q15 selection is inferred.
