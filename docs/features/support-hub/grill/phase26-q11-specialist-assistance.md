# Phase 26 Q11 (historical question) — Getting specialist help without losing responsibility

**Status update — 11 September 2026:** The founder answered A. The [complete D11 review](phase26-d11-adversarial-review.md) records the selection and complete amendments, now fully founder-ratified on 11 September 2026. The question-stage research below is retained as historical context; statements that Q11 is unanswered or no ADR0011 exists describe that earlier stage, not the current session.

**Status: researched question, unanswered.** D1–D10, including all D10 amendments and Undo behavior, are fully founder-ratified. Current Core and primary documentation were checked 11 September 2026. This is one product question, not a selected D11 answer, formal specification or implementation. The [evidence record](phase26-q11-evidence.md) documents sources, alternatives, current implementation limits and independent challenge.

## The next decision

**When Support needs another staff member or team to complete a specialist step, what should be the normal way to coordinate the work?**

Example: Maya asks Alex in donor care about a receipt. Alex needs an authorized Finance colleague to check the relevant giving record before answering. The specialist needs to perform a bounded internal action; Maya still has one support request. This is an illustrative scenario grounded in existing receipt/owner boundaries, not a measured claim about ministry workflow frequency.

Both options keep the same donor email thread. The decision is who remains responsible for answering and following through while another person acts. It does not choose initial intake routing, temporary coverage, access-loss handling or a new requester-facing conversation.

## Two strong alternatives

| Option                                                                      | How it works in the example                                                                                                                                                                                                                 | Strongest benefit                                                                                                                                                                | Real tradeoff                                                                                                                                                                                                          |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Keep Support responsibility; assign the internal work. Recommended.** | Alex keeps the conversation. Finance receives only the authorized work/context needed, through an existing owner operation/task or a qualified shared task when tracking is needed. Alex sees the relevant outcome and continues with Maya. | One clear point of coordination; specialist work can have its own accountable handler and follow-up without transferring the whole conversation or exposing unnecessary context. | Requires reliable linked progress, outcome/recovery visibility and a working shared-task/owner contract. The coordinator can become an unnecessary relay if the specialist actually should conduct the whole exchange. |
| **B — Transfer the whole conversation to the specialist.**                  | Alex explicitly hands the conversation to an eligible Finance Support handler. That handler owns the requester communication and follow-through, using their separate authority for the giving action.                                      | Direct specialist-to-requester communication; fewer relays when the specialist needs to ask questions and own the whole answer. Uses the existing explicit assignment model.     | Requires the specialist to be qualified for all affected Support work as well as their specialist action. Repeated internal dependencies can cause repeated responsibility changes.                                    |

The question selects the normal assistance journey, not an automatic routing rule or a ban on the other action. Existing explicit whole-conversation transfer remains available under A. B does not forbid quick consultation or qualified owner tasks. No new tenant preference hierarchy or custom workflow builder is implied.

Two alternatives are sufficient here. Creating a second outward conversation or physically splitting email history answers a different question and would not improve this comparison.

## Single best recommendation

**Choose A — keep responsibility for the conversation and delegate only the internal work that needs another owner.**

It best fits a bounded specialist step: the Support worker can maintain the requester context and communicate the result, while the specialist works under the correct domain permissions. Where the conversation is handled by a shared inbox rather than an individual, that existing Support handling remains responsible; A does not invent a new coordinator role or automatically claim the conversation.

Reuse an existing owner operation/task if it already carries the work. Create a shared task only when an action needs ownership, progress or follow-up tracking. A quick clarification may remain an internal note/mention. A user who can perform the authorized owner action directly does not need a ceremonial task or another person.

Whole-conversation transfer is the stronger choice when the specialist should handle the entire exchange. This distinction keeps A from turning into a rigid layer through which every answer must pass.

Intercom documents separating an internal specialist work item from the customer conversation, with customer replies staying in the latter. Zendesk documents separately assigned side-conversation child work. These support the distinction between asking for help and transferring the whole conversation. Asym should use its governed shared task/owner model, not copy either vendor's ticket hierarchy, sharing or comment-propagation rules. [Intercom internal work](https://www.intercom.com/help/en/articles/8300293-when-to-use-back-office-tickets), [Zendesk child side conversations](https://support.zendesk.com/hc/en-us/articles/4408836521498-Using-side-conversation-child-tickets/).

## What a clean A journey should make clear

The proposed interaction distinguishes **Ask for help** from the existing **Assign/Transfer** action. A small contextual flow identifies the internal action and qualified destination, reusing permitted record references rather than copying a full transcript. If relevant owner work already exists, staff open/link that work instead of creating another task for the same outcome.

The conversation needs only a compact indicator of outstanding internal work and its accountable handler, with access to permitted details. The specialist uses the shared or owning work surface. Task creation is not proof of acceptance/completion; completion is not an automatic donor reply or resolution. Current D3 meanings and relevant owner-result review remain authoritative.

This question does not freeze labels, fields, notification cadence, task lifecycle or an implicit status change. After the founder chooses, the full review must define those precisely against the actual owner contract. It must also settle interruption/retry, blocked work, unavailable specialists, who may inspect what, and D10 merge/Undo interaction. No polished task screen is accepted as proof the integration exists.

## Guardrails carried forward

- Task assignment, a mention or a conversation link grants no access to restricted CRM, giving, missionary, member-care or Support content.
- The owner domain authorizes and performs consequential actions. A Support request or completed task cannot certify a refund, contact change or receipt correction that the owner has not actually performed.
- Preserve current Support responsibility until an explicit qualified handoff changes it. No assignment-on-Send, automatic return to a former worker or bypass of D7/D8 handling rules.
- Use minimum necessary context and qualified deep links. No automatic full-transcript/attachment copying or private-note cross-posting into broader access.
- Keep the same D1/P6/P17 email and preparation path. Asking for help adds no one to the requester reply audience and creates no requester-facing email/public note or fabricated correspondence event. Any actual authorized staff notification follows its owning shared notification policy and P6 evidence.
- Reuse current owner work and durable identity; do not create a duplicate task every time the same request is retried, linked, reopened or merged.
- Shared tasks and owner operations retain their truth. Support observes permitted outcomes; it does not become a second financial workflow or generic task platform.

## Why this precedes general topic splitting

Research initially considered one email containing multiple independent topics. That mixes two different needs: an internal specialist substep, and genuinely separate requester-facing work. Internal coordination should be settled first so the product does not create parallel conversations for ordinary owner-domain work.

Topic splitting remains open. Moving a whole email cannot separate two subjects contained in that one message, and moving/rethreading historical messages can conflict with D10's original-source rules. Nothing in A or B authorizes that change. D10 merge and Undo remain fully ratified.

## Current Core fit and proof limits

Merged platform boundaries require one shared Mission Control staff task/issue model. That is a strong reason to reuse it. Current source is less complete: persisted task types/link types and a wrapper are contribution-oriented, while another generic Tasks collection stores in-memory rows. The Support conversation link and reliable owner/task progress contract need actual qualification; they are not ready merely because the UI looks finished.

This is a product default decision with two legitimate approaches, not a choice of database shape or a promise of current runtime support. The source/research and independent challenge are complete for the question. Q11 is unanswered; no ADR0011 or accepted D11 glossary term is created. After the founder answers, perform the full adversarial review before advancing.
