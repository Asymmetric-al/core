# Q20: Save recurring ways of looking at Support work

**Historical Q20 material.** On 12 September 2026 the founder selected A and fully ratified the [complete D20 review and every adopted amendment](phase26-d20-adversarial-review.md). Unanswered/pending wording below records the question stage only.

**Historical question-stage record.** On 12 September 2026 the founder selected A. The [complete D20 review](phase26-d20-adversarial-review.md) records proposed amendments pending ratification; prior unanswered/recommendation statements below describe the earlier question stage.

**D1–D19 are fully founder-ratified. Q20 is unanswered.** This is one researched product question, not a formal specification or an accepted D20. Research checked 12 September 2026.

Staff can already open the required standard queues and search/filter their authorized work. A **saved view** remembers useful filter criteria and shows the current matching conversations when opened. It does not copy, move, assign, follow, resolve or send anything.

For example, Alex regularly checks conversations in **Donor care → Waiting on our side**. Sam, the team lead, wants the team to return to that same useful slice without rebuilding its filters. Alex also has a narrower recurring slice of personally assigned work. These people and needs are illustrative, not a claimed ministry user study. The question is whether reusable lists should support personal working preferences alongside maintained shared definitions.

## The next decision

**How should staff save and share recurring conversation views beyond the standard queues?**

| Option                                                   | What staff receive                                                                                                                                               | Benefits and costs                                                                                                                                                                     |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — My views plus curated shared views. Recommended.** | Staff save their own useful filters. Authorized maintainers create and maintain shared views for the relevant audience. People choose useful personal shortcuts. | Reduces repeated individual filtering while preserving dependable shared organization. Requires clear ownership, sharing and a restrained view picker.                                 |
| **B — Curated shared views only.**                       | Authorized maintainers supply custom saved views. Everyone still uses ordinary search and temporary filters.                                                     | Stronger consistency and less personal configuration. Uncommon recurring needs require rebuilding filters or asking a maintainer. This is the strongest simpler alternative.           |
| **C — Standard queues and temporary filters only.**      | Keep the required standard queues and complete authorized filtering/search, without custom saved definitions.                                                    | Smallest interface and maintenance burden. Repeated custom work requires repeated filtering, and teams cannot retain a named custom slice. This is the strongest no-build alternative. |

These are alternative product choices, not three configuration modes to implement. Every option preserves the ratified standard queues, complete authorized discovery, reply-target facts, Following and required recovery/attention. B and C do not mean weaker search or hidden work.

## Single recommendation: A

Choose **A — My views plus curated shared views**. It gives each staff member a fast route back to recurring work without making every personal preference a team setting. Maintained shared definitions give teams a common language; personal pinning keeps the interface quiet.

This is a product judgment supported by concrete documented patterns, not proof that ministries need every competitor feature. Zendesk separates ordinary personal-view creation from permissioned shared maintenance. Front likewise separates private creation, shared management and personal sidebar placement. Intercom expressly distinguishes views from assignment. [Zendesk](https://support.zendesk.com/hc/en-us/articles/4408888828570-Creating-views-to-build-customized-lists-of-tickets), [Front](https://help.front.com/en/articles/2243), [Intercom](https://www.intercom.com/help/en/articles/6588834-organize-your-inbox-with-custom-views-and-folders).

B is credible if work is highly uniform and team consistency outweighs individual reuse. C is credible if the required built-ins cover almost every recurring need. Neither is portrayed as unsafe or incapable; their tradeoff is repeated setup or reliance on maintainers. A provides the most useful flexibility without requiring arbitrary automation or another inbox model.

## Candidate experience if A is selected

1. Apply the ordinary visible filters and inspect their current results.
2. Choose **Save view**, give it a useful name, and default to **My views**.
3. Qualified maintainers can deliberately create/update a **Shared view**, with its audience and criteria visible. Temporarily adjusting filters never silently edits the team's saved definition.
4. Use a small pinned set and a searchable **Views** picker, rather than a chip or permanent sidebar entry for every saved definition.
5. Return to the same live criteria later. Show a changed/invalid definition honestly; never silently drop a filter and broaden the result.

This illustrates the recommendation, not an accepted complete design. If selected, the full adversarial review must settle authoring, current-viewer versus named-person filters, sharing/maintenance, modification/deletion/correction, permission changes, offboarding, persistence, invalid references, completeness, performance and accessible cross-device behavior. No numeric view cap, filter grammar, automatic archive rule, default homepage or new publication workflow is frozen by this question.

## Boundaries applying to every option

- **A view is not an inbox or assignment rule.** Membership changes as current data changes; it creates no second ownership, queue-status engine, automatic action or notification subscription.
- **Sharing a definition grants no data access.** Titles, criteria, filter values and aggregates can themselves disclose restricted information. Definition access, authorized filter context and each source result need current permission. A colleague may legitimately see different results.
- **Current-user filters mean the current viewer.** They must not freeze the creator's identity behind a misleading Me label. Exact supported semantics receive the selected-answer review.
- **Source truth stays where it belongs.** Store criteria/preferences, not copied conversations, CRM identities, transcripts or recipient lists. CRM fields cannot be inferred through unauthorized filters/counts; D9/D16/D17 remain governing.
- **Required work remains discoverable.** Custom views cannot replace mandatory intake/technical recovery awareness, reopen held mail through a conversation list or redefine D14 target reporting. An empty custom list is not proof that all work is complete.
- **Email Studio has no execution role in saved views.** Save, share, pin and open perform no template publication, preparation, send or donor-contact event. A view is not a message audience. Reuse appropriate common UI/query primitives without importing D18's authoring/publication engine.

## Current source is scaffolding, not the answer

Core has `personal`/`workspace` saved-view fields, UI and storage. The current save dialog supplies a null owner for new views; the adapter lists all tenant saved views; the chip bar renders the returned collection; and conversation text/label filtering follows a 2,000-row cap. These are inspected qualification gaps, not a claim of tested production behavior. Existing UI labels cannot establish privacy, and existing code does not decide which product option the founder should select.

The [evidence register](phase26-q20-evidence.md), [independent gap review](phase26-q20-gap-review.md) and [current vendor research](phase26-q20-vendor-research.md) provide precise source references, dates, editions, limitations and counterarguments. This question deliberately does not bundle in taxonomy, bulk actions, historical reporting, arbitrary CRM segmentation, AI or configurable workflows.

**Q20 remains unanswered.** A is the single recommendation; B and C are genuine alternatives. No ADR0020, new accepted glossary definition, formal specification, runtime/schema change, ticket or external effect is inferred. The selected answer receives the complete adversarial review before its amendments are finalized for ratification.
