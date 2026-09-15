# Q21 — Who shapes the Support label list, and when must staff use it?

**Historical question material.** On 12 September 2026 the founder selected A and fully ratified the [complete D21 adversarial review and every adopted amendment](phase26-d21-adversarial-review.md). Earlier unanswered wording describes the question stage only.

**Q21 is unanswered.** Prepared 12 September 2026 after full founder ratification of D20 and every adopted amendment. This question selects the product policy for conversation categorization. It does not accept a new label schema, curator role, resolution condition or implementation plan.

## The practical decision

**How should staff categorize conversations beyond their inbox and work status?**

An inbox identifies where work belongs. Status describes what is happening with it. A Support label can describe what a conversation concerns so staff can find similar work through D20's views and review patterns later. This is conversation context, not a tag applied to a person or evidence that a business action succeeded.

For example, a church emails about a receipt correction. The team has a **Receipt question** label. A staff member can apply that label, and a saved view can later find the conversation. This is an illustration, not evidence of a measured ministry workflow or a proposed seeded taxonomy. No label changes the receipt, creates a CRM contact or confirms a refund.

## Three real options

| Option                                                 | Everyday experience                                                                                                                                                     | Strongest benefit                                                                                | Main tradeoff                                                                                               |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| **A — Optional labels from a curated Support list**    | Staff select useful existing labels. Qualified maintainers create, clarify and retire the list. Staff can resolve work without adding a label.                          | Consistent terms for views and reporting, with no compulsory classification step.                | Some work stays unlabelled; a genuinely new category depends on a maintainer.                               |
| **B — Optional labels staff can create while working** | Staff select existing labels or deliberately create a new one from the conversation's label picker. Labelling remains optional.                                         | New needs can be captured immediately without waiting for catalog maintenance.                   | Similar terms and one-off labels can fragment views and reports and require cleanup.                        |
| **C — At least one curated label before Resolve**      | Staff use the maintained list. If none is applied, the Resolve flow asks for an applicable label before completing. Intake, reading and replies remain available first. | More complete categorization of resolved work when topic coverage is an operational requirement. | Adds a step and can encourage inaccurate catch-all selections; completion coverage does not prove accuracy. |

These are alternative product choices, not three configuration modes to implement. C requires a label at resolution, not intake. It does not create a primary-topic column or a new custom-field engine. Multiple relevant labels can apply under any option; their counts overlap.

## Single recommendation: A

**Choose optional labels from a curated Support list.** It gives staff consistent terms when useful without making every completed conversation wait for classification. It also separates applying a known term from changing a shared vocabulary. A qualified staff member could hold both permissions; curation need not mean a distant central administrator.

This separation is directly documented by Intercom: a teammate without tag-management permission can still apply existing conversation tags. Front likewise distinguishes catalog-management permissions from applying/removing tags. These are evidence of practical interaction patterns, not proof that every ministry needs the same policy. [Intercom permissions](https://www.intercom.com/help/en/articles/176-teammate-permissions-how-to-control-workspace-access), [Front permissions](https://help.front.com/en/articles/4645696).

**B is the strongest choice when vocabulary changes rapidly** and waiting on a maintainer costs more than later cleanup. Zendesk demonstrates inline creation, but its documentation also shows how spelling and separator variants become distinct tags that must match exactly. Asym should not copy those formatting limitations. [Zendesk ticket tags](https://support.zendesk.com/hc/en-us/articles/4408835059482-Working-with-ticket-tags).

**C is the strongest challenge to A when complete topic coverage is necessary.** Front offers required tagging on Professional and above, but documents exceptions for mobile, automatic archiving and brand-new Send & archive. A mandatory Asym rule would need consistent enforcement at the actual resolution boundary. No Asym evidence reviewed establishes that every resolved conversation needs a category, so that cost is not justified as the universal default today. [Front required tagging](https://help.front.com/en/articles/2106).

## How A would feel

Keep **Labels** in the conversation's existing details area, with a visible **Add label** control usable by keyboard and touch. Open a searchable list of eligible readable names; show a short explanation where meaning is not obvious. Select an existing label and return to the conversation. Selected labels remain visible with compact overflow rather than filling the screen with badges. Text carries meaning; color is supplementary.

No matches means no matching label, not an implicit Create action or a red error. Staff can continue work without inventing a category. Maintainers have a clear **Manage labels** destination using existing Support settings patterns. Ordinary staff use established internal collaboration to suggest a needed term; do not create a separate approval queue solely for labels. Curator staffing, lifecycle and exact controls belong in the selected-answer review.

The same Support label control can appear in an authorized Support conversation opened from a CRM record, preserving the current conversation and return context. It remains clearly separate from the CRM Party's tags. Personal ways to group recurring work remain D20 My views; this proposal does not add a parallel private-label catalog.

The proposed management experience should distinguish removing a label from one conversation from retiring a label in the list. Archive-first retirement is a strong candidate because used labels and saved filters need stable meaning. Front and Intercom document preserving historical use through archival; deletion is materially different. The selected-answer review must resolve Core's existing destructive-delete behavior without silently rewriting history. [Front tag lifecycle](https://help.front.com/en/articles/2100), [Intercom tag lifecycle](https://www.intercom.com/help/en/articles/3527143-create-edit-archive-or-delete-tags).

## Boundaries already settled

- Support owns conversation label meaning and application. CRM Party tags, identity, relationships, giving, care and restricted classifications retain their actual owners and permissions. A label named Confidential does not create protection; removing it cannot lift protection.
- D20's existing-label Any/All/No labels predicates, stable references, current authorization and complete filtering before count/page remain accepted. Retiring or changing label definitions cannot silently drop or broaden a saved-view predicate. Deliberately applying or removing a label can legitimately change current matches.
- Optional labels require honest reports: show the unlabelled population, define the denominator and account for overlapping labels. Do not present a voluntarily labelled subset as a complete census of request topics.
- Labels cannot substitute for D3 work status, D14 reply-target truth or proof of a completed CRM/giving action. D10 merge/Undo, D12 relationships, D16 redaction, D17 retention and current access remain authoritative.
- Routine label edits stay quiet under D15. A label is not a follow, recipient list, message template, Email Studio publication or Resend send. Configurable label-triggered automation is outside this question and remains Phase34's owner boundary.

The [evidence and gap review](phase26-q21-evidence.md) distinguishes inspected current code, intended Core contracts, current vendor behavior, reported friction and product judgments. The [independent gap challenge](phase26-q21-gap-review.md) and [primary-source research](phase26-q21-vendor-research.md) preserve the fuller research.

**No ADR0021 or new accepted label term is created.** A is a recommendation, while B and C remain genuine alternatives. The selected answer will receive the full category-by-category adversarial review before its amendment package is proposed for ratification. Broader search coverage remains a separate unresolved gap. No formal specification, implementation, issue, provider change or real message is authorized here.
