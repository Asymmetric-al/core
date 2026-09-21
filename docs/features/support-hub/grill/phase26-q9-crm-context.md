# Phase 26 Q9 — The CRM context of a Support conversation

**Status: answered C; D9 and all amendments fully founder-ratified, 11 September 2026.** D1–D8 and all adopted amendments are fully founder-ratified. Research checked 11 September 2026 against current Core, its accepted direction and primary support-product documentation. This preserves the historical question and alternatives. The [full D9 review](phase26-d9-adversarial-review.md) now records the selected answer and exact amendments. This is local grooming, not a formal specification or implementation. The [evidence record](phase26-q9-evidence.md) identifies sources, conflicts, alternatives and limits.

## The next decision

**When a Support conversation concerns more than one CRM person, household or organization, how should staff link and organize that context?**

The person writing is not always the subject of the request. We already require ordinary service without a CRM link, accurate sender observations, explicit authorized record links and permission-aware navigation. We have not chosen whether a conversation has one main CRM context, one main context plus related Parties, or several equal context links.

In Core, a Party is an existing person, household or organization; a church is an organization subtype. This question concerns those records' relevance to a particular conversation. It does not add another kind of customer, rewrite CRM relationships or decide who may represent somebody else.

Example: Maya emails about a request involving Hope Church and missionary Daniel. Maya remains the sender; Hope Church may be the main subject of the request, and Daniel may be relevant context. Linking either record does not establish Maya's authority, email Daniel, or reveal restricted giving/care information. This is an illustrative scenario, not an assertion about the prevalence of a ministry workflow.

## Three options

| Option                                                           | Staff experience                                                                                                                                                                                                                 | Strongest reason to choose it                                                                              | Tradeoff                                                                                                                                   |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **A — One main CRM context only**                                | Link one person, household or organization as this conversation's context. Keep sender details separate. Other context remains reachable through normal authorized CRM relationships, searches and linked gift/document records. | The smallest model and quietest interface for requests with one meaningful subject.                        | A connection specific to this request cannot be saved as an additional conversation-to-Party link; later staff may need to reconstruct it. |
| **B — One main context plus optional related records**           | Keep one clear main person/household/organization, with optional explicit links to other existing Parties relevant to this conversation. The ordinary single-record case stays compact.                                          | Preserves a clear focus while retaining useful request-specific context across handoffs and return visits. | Requires clear labels and safe link-change behavior so main, related and sender are never confused.                                        |
| **C — Related records without a main designation. Recommended.** | Link the relevant Parties as peers without designating a main one. Staff inspect the permitted record relevant to their current task.                                                                                            | Avoids an artificial hierarchy when the request concerns several people or organizations equally.          | Provides no consistent main context for scanning the inbox/detail; the peer list needs more deliberate orientation as it grows.            |

Every option permits an unlinked conversation and keeps the actual sender, participants, explicit reply audience and owner-authorized actions separate. None requires a linking form before ordinary reply. A preserves D1's gift/document and other authorized record links; it is not a proposal to remove existing CRM navigation.

## Single best recommendation

**Choose C: keep the sender separate and allow optional, explicitly related CRM records without designating a main one.**

This retains the people, households and organizations relevant to a request without requiring staff to classify one as primary. An ordinary one-record conversation remains simple. If several records are useful, they form a compact Related records section; there is no extra primary-selection step or new meaning to explain.

Additional links earn their place only when they preserve useful context specific to this conversation. If a gift already provides the right beneficiary context, do not require staff to link that Party again. Existing CRM relationships and owner-derived facts stay authoritative. The conversation link records relevance to the request, not another relationship or ownership fact.

B is the strongest alternative when a designated focal record materially helps staff orientation. Two independent reviews preferred that benefit. The final recommendation instead follows the counterargument that Core has not demonstrated a Support requirement for an additional main designation, and protected actions still need their own explicit current target under B. C retains useful context with less classification. It needs a clear compact list rather than a large undifferentiated panel.

A remains the smallest model and may be enough for straightforward donor→gift/document journeys. It gives up additional conversation-specific Party links while preserving ordinary authorized relationship navigation. That is a real scope choice, not a broken implementation.

This is an Asym product judgment, not a measured ministry preference. The founder can choose B for its explicit orientation benefit or A for its narrower retained context. No option makes record linking a prerequisite to ordinary correspondence.

## A calm interface direction

Keep the observed sender block and explicit message recipients distinct from **Related CRM records**. Show only deliberately useful permitted context. The one-record case uses one compact item; additional records appear in the same restrained group. Ordinary Party types help distinguish a person, household or organization without inventing roles such as representative or beneficiary on the Support link.

Use permission-aware search with enough permitted detail to distinguish similar names, and preserve the conversation, draft and queue position while inspecting a candidate. Existing relationships can help find likely candidates; they are not automatic association or representation proof and must not be the only search path.

No record gains authority by being first in the list, most recently added or currently expanded. Links never silently readdress a draft, select template variables or protected-action targets, change CRM relationships, publish history or duplicate email events. An authorized owner action still identifies the exact record and uses its own permissions.

The selected answer's [full D9 review](phase26-d9-adversarial-review.md) now settles initialization, link/change/unlink interaction, list presentation and authorized history projections as complete founder-ratified amendments. This question chooses retained context, not a physical schema, arbitrary maximum, custom role catalogue or auto-linking algorithm.

## Research supporting the comparison

HubSpot documents associating a support ticket with multiple contacts and a deal, and editing associated records from the Help Desk sidebar. This supports explicit request-specific context and nearby navigation. Its primary-company and activity/personalization behavior is not a universal main-Party rule for Asym. [HubSpot record associations](https://knowledge.hubspot.com/records/associate-records), [Help Desk record context](https://knowledge.hubspot.com/help-desk/manage-tickets-in-help-desk).

Intercom distinguishes which company a conversation concerns from the contact's company memberships, including explicit conversation-company selection and persistence when later membership changes. This supports a conversation-specific subject without making membership itself the source of conversation truth. Its single-company automatic default is not adopted by this question. [Intercom conversation-company guidance](https://www.intercom.com/help/en/articles/8838326-conversations-faqs).

Other products demonstrate why these controls must be separated carefully. Help Scout's Change Customer changes the reply target; Zoho's secondary contacts combine CC behavior, automatic contact creation and portal visibility. Those are consequential external behaviors to reject for an internal Asym context link because D1/D2 already separate those authorities. [Help Scout Change Customer](https://docs.helpscout.com/article/437-change-customer), [Zoho secondary contacts](https://help.zoho.com/portal/en/kb/desk/ticket-management/ticket-replies/articles/enabling-and-adding-cc-users-on-tickets).

## Pressure cases for the selected answer

| Situation                                                               | Boundary the selected model must preserve                                                                                                       |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| An address matches several people or a shared household/church address  | Candidates remain ambiguous until a qualified link exists; do not attach every possible match or invent a Party.                                |
| The writer is different from the linked main subject                    | Keep observed sender/participants separate; no implied legal or financial representation.                                                       |
| A gift or existing CRM relationship already provides the needed context | Reuse that owner-derived path; do not require duplicate conversation links or persist derived CRM edges.                                        |
| Staff adds a related person or changes the main record                  | No To/Cc change, new recipient, template/action authority, permission grant or new communication event.                                         |
| One related Party is restricted or staff rights change                  | Current owner filtering applies to search, counts, cards, navigation and actions; no inference of broader access from the conversation.         |
| A record is merged, unlinked, archived or redacted                      | Preserve actual message observations, historical evidence and current authorized context; do not copy a vendor's conversation-deletion cascade. |
| Several staff edit context while a reply is being composed              | Preserve draft/audience and current-control semantics; stale linkage must not determine a protected action.                                     |
| The same conversation is relevant from several CRM surfaces             | Reuse one canonical conversation and owner-filtered projections; no duplicate authoritative thread or automatic timeline fan-out.               |

Q9 is answered C and the full independent D9 review is complete, including Party, communication, permissions, query, history and UI contracts. The complete amendment package is now fully ratified; the founder separately authorized the next researched question. D1–D8, collision-protected Send and no assignment-on-Send remain settled. This question does not authorize a new CRM, generic relationship engine, portal, formal specification, tickets or implementation.
