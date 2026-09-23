# Phase 26 Q12 (historical question) — Independent requests inside one email thread

**Status update — 11 September 2026:** The founder selected B. The [complete D12 review](phase26-d12-adversarial-review.md) records the answer and complete amendments, now fully founder-ratified on 11 September 2026. The question-stage material below is historical; statements that Q12 is unanswered or no ADR0012 exists describe that earlier stage, not current status.

11 September 2026. **D1–D11 are fully founder-ratified. Q12 is researched and unanswered.** This is the next single founder decision, not a selected D12 model, formal specification or implementation instruction. The [evidence record](phase26-q12-evidence.md) explains the current Core and vendor basis.

## The practical decision

When an existing email thread contains a genuinely separate requester issue, should staff keep coordinating it as one Support conversation, or be able to create a related conversation with independent handling?

Illustrative example: Maya's receipt question has been answered. She replies to that email: **“Thanks, that’s sorted. I also can’t sign in to my account.”** A requester should be able to do this naturally. Staff should not tell Maya to resubmit a form, open a portal or repeat information merely to organize the work.

The new sign-in problem is a separate requester issue, not just Finance checking a fact for the receipt answer. That distinction is why D11's internal-task decision does not settle this question. A second pressure case is one new email containing two independent requests; moving a whole email cannot literally divide its original evidence into two separately received messages.

## The two meaningful alternatives

| Option                                         | What staff and Maya experience                                                                                                                                                                                                                                                                                                               | Advantages                                                                                                                                                                                                                        | Costs and risks                                                                                                                                                                                                                                                                |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **A — Keep one coordinated conversation**      | The existing Support conversation carries the new issue as well. Staff retain one handler/shared inbox, current status and follow-up plan. D11 internal work is used when an internal action is needed. No dedicated topic-separation capability ships in Phase 26.                                                                          | Smallest product and clearest one-thread donor experience. Effective when the same team can handle the exchange promptly and the remaining topics share one useful work plan.                                                     | Different requester issues share one lifecycle. A new unrelated question can keep an old subject active; independent handling/status/follow-up cannot be expressed separately. Staff must coordinate the entire exchange and avoid losing a remaining issue.                   |
| **B — Allow deliberate related conversations** | Staff can explicitly create a related Support conversation for a genuinely independent requester issue. Each conversation can have its own qualified handling, status and follow-up, with clear permitted navigation between them. Creation itself sends nothing; independently replying requires a deliberate new-topic email continuation. | Separates independent obligations without asking Maya to repeat herself. An answered receipt request and an ongoing sign-in problem can be handled and completed distinctly. Keeps A available whenever separation adds no value. | More source/routing/correction work to implement. Maya may receive a second email thread if staff pursue the new issue separately. The UI must make the new topic and reply destination clear, preserve original evidence and prevent duplicate answers or misleading history. |

**Single recommendation: B — allow deliberate related conversations, while keeping the existing conversation together unless independent handling provides a real benefit.**

This selects a capability and the staff judgment that invokes it, not an automatic split rule. Different wording, another CRM Party or a second internal task does not by itself justify separation. A request normally stays together when one coordinator can give a coherent answer under one work plan. Separation is useful when the additional requester issue genuinely needs its own handling, status or follow-up—for example an unrelated question arriving after the original issue was settled.

## Why B fits this point in Phase 26

D10 already handles **duplicate requests** by combining their work without losing evidence. D11 already handles **internal assistance** while retaining Support responsibility. The unresolved opposite case is **independent requester work sharing an email thread**. These are distinct operations; calling all of them tickets, tasks or splitting would obscure ownership.

Core already separates actual communication evidence, current Support work, CRM truth and shared tasks. B can use those boundaries. It must not introduce a second CRM, multiple independently writable copies of a received email, a hidden parent-ticket hierarchy, or a case/workflow platform to support one action. A related conversation is not a main/secondary CRM designation.

Current [HubSpot Help Desk documentation](https://knowledge.hubspot.com/help-desk/manage-tickets-in-help-desk) explicitly uses an old ticket reopened with an unrelated issue as a splitting example. [Front](https://help.front.com/en/articles/2307) and [Zoho Desk](https://help.zoho.com/portal/en/kb/desk/ticket-management/actions-in-tickets/articles/actions-in-ticket-conversation) document message-level separation with important limitations. These support the need and expose tradeoffs; they do not authorize copying their source mutations, contact associations or automation side effects into Core.

## What the clean interaction should communicate

Under B, an occasional contextual action such as **Create related conversation…** should explain the outcome in plain language: **“Handle a separate request, with its own follow-up.”** It should stay secondary to replying and the existing D11 Ask for help action. The exact final label and controls belong in the chosen answer's full review; no new glossary term or command is accepted yet.

The worker needs to understand the new topic, which work remains in each conversation, their qualified destinations and whether they are only organizing work or also composing a new email. Original context must remain available where authorized, with a clear return path. A source link or topic label must not become a recipient or permission grant.

Creating a related conversation must not automatically email the donor. If staff reply independently, Maya should receive a clear topic-specific email—for example **“Help signing in”**—without an explanation of internal ticket mechanics or a request to resubmit. The subject alone is not a technical threading guarantee; actual P6/P17/Resend lineage needs explicit qualification.

An old-thread reply remains serviceable at its legitimate original route. Do not assume the software can reliably infer its topic and forward it to one or both conversations. The cost of ambiguous old replies and how staff safely refer context onward must be settled in the chosen answer's review. B cannot promise that staff organization rewrites the donor's email-client history.

## Existing boundaries that either answer must preserve

- **D1/D2/D4:** normal email continuation, no compulsory portal/resubmission/Party creation, exact reviewed audience, deliberate Send with current preparation and collision controls.
- **D3/D5:** legitimate current work/reminder/ending semantics. Moving a concern between work items cannot manufacture a resolved request, drop an obligation or erase a required review.
- **D6–D8:** assignment and access are current owner decisions; copying an old assignee, queue or coverage state is not automatically valid.
- **D9:** CRM related context differs from correspondence. One actual incoming email remains one original message; its existing P6 event and recipient-copy facts remain unchanged. Related work does not create an extra donor interaction or unrestricted CRM association.
- **D10:** original messages, source routes and factual history retain identity. Its original-conversation/current-root model cannot silently become per-topic routing. If B needs a new explicit continuation/work relation, the review must reconcile it precisely rather than calling it existing Merge or Undo behavior.
- **D11:** internal specialist work stays one shared/owner work item with exact source interests; a new conversation does not duplicate that task or turn specialist assistance into a requester issue.

## Consequences to resolve after the founder chooses

This turn chooses the product path only. The next full adversarial review must settle exact source context versus factual-message custody, current work/reminder/assignment disposition, deliberate independent outward continuation, old-route ambiguity, CRM relevance/history, private data and selected recipients, D10/D11 scope, correction after later activity, concurrency/idempotency, migration and observable recovery.

Literal single-message movement, selecting several messages, copying the entire transcript and automatically dividing free-text topics are **not** selected by B's recommendation. They are materially different mechanisms with different evidence and permission costs. An initial message with two subjects must not become two fake received emails. Likewise A does not require forgetting an unresolved issue; its one work plan remains accountable for all current obligations.

No third option is offered merely by renaming D11's already-ratified internal assistance. Automatic AI topic splitting and a parent/child case hierarchy are not proportionate alternatives to this bounded founder choice. There is no measured Asym demand or usability result establishing a universal one-issue-per-ticket rule.

## Ratification and stage status

The founder fully ratified D11's corrected decision, all 24 requirements, 40 proof groups, 23 category results, complete UX/terminology, eleven independent corrections and eight operational responses. Those substantive records are preserved. The [current ratification/question validation](d11-ratification-q12-validation.json) is distinct from the historical pre-ratification D11 validation.

**Q12 remains unanswered.** Present A and B with their tradeoffs and B as the single recommendation, then wait for the founder's answer before its full adversarial review. Do not create ADR0012, accept new D12 terms, implement, publish specifications/tickets, mutate external systems or send mail.
