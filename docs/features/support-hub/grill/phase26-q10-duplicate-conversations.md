# Phase 26 Q10 — Handling duplicate Support conversations

**Status: answered C with explicit Undo merge; D10 and all amendments fully founder-ratified, 11 September 2026.** D1–D9 and every adopted amendment, addition, adjustment, change and update are fully founder-ratified. Current Core and primary documentation were checked 11 September 2026. The [evidence record](phase26-q10-evidence.md) distinguishes repository facts, vendor behavior, reported friction, product judgment and remaining proof. This preserves the historical question and alternatives. The [full D10 review](phase26-d10-adversarial-review.md) records the selected answer and exact founder-ratified amendments. This is grooming, not a formal specification or implementation.

## The next decision

**When staff confirm that two separate conversations concern the same support request, how should they bring the work together?**

Example: Maya emails about a missing receipt. Later she starts another email about the same receipt because she is unsure the first arrived. Two legitimate conversations exist, and two staff members could start answering. This is an illustrative case, not a measured claim about ministry request volume.

This differs from receiving the same webhook twice, which existing ingestion/idempotency rules must already handle. It also differs from two distinct questions from the same person, duplicate CRM records, or splitting unrelated subjects out of one long conversation. None of those becomes a semantic duplicate merely because an email, subject, gift or Party matches.

## Three options and their consequences

| Option                                           | Staff experience                                                                                                                                                                                            | What happens if Maya replies to the older email later?                                                                                                      | Strength and tradeoff                                                                                                                                                                                                             |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Keep the conversations separate**          | Both retain their own work, assignment and history. Staff coordinate using existing permitted internal references and ordinary handling.                                                                    | It continues or reopens that independent conversation. Staff coordinate again as needed.                                                                    | Smallest feature scope and clearest separation for related-but-distinct requests. For genuine duplicates it leaves ongoing coordination and duplicate-answer risk.                                                                |
| **B — Resolve the duplicate with a reference**   | Staff choose where they will continue, resolve the other conversation as duplicate work covered there, and leave a clear permitted reference. Histories and routing stay separate.                          | The older conversation reopens under the normal rules. Staff review whether the reply belongs with the continuing request or needs separate handling.       | Tidies the queue with a smaller lifecycle change. It does not permanently bring later input together, so staff may repeat the same reconciliation.                                                                                |
| **C — Merge confirmed duplicates. Recommended.** | An authorized worker reviews the pair and chooses the continuing conversation. One place carries the work, while both original histories and their provenance remain inspectable under current permissions. | Qualified replies to either original email route reach the continuing work. The donor does not need to choose the correct old thread or repeat the request. | Best ongoing experience for one genuine request: less duplicate handling and searching. Requires a proper source-preserving merge, work reconciliation and correction path, not a bulk message move or automatic field overwrite. |

B is a credible permanent simpler choice; it is not described as if it silently forwards future replies. That later-reply behavior is its meaningful difference from C. A remains appropriate for separate requests even if C is available. Every option preserves accepted-input recovery, current permissions, source history and ordinary email continuation.

## Single best recommendation

**Choose C — a deliberate, reviewed merge for confirmed duplicate requests.**

Per-conversation collision detection protects two staff replying in the same conversation. It does not by itself coordinate two genuinely separate conversations about the same request. A continuing work item addresses that gap and makes the CRM conversation view easier to understand. B cleans up the present queue but can recreate the coordination problem on the next reply.

The aim is one continuing place for the work, not flattening or rewriting source history. Intercom explicitly retains original conversation IDs and separate linked histories after its merge; Front instead describes combined message presentation. These demonstrate different valid product implementations, not one universal storage design. Asym should choose its staff outcome while preserving its own communication and authorization contracts. [Intercom merging](https://www.intercom.com/help/en/articles/8862676-merging-conversations-and-tickets), [Front manual merging](https://help.front.com/en/articles/2278).

This recommendation is a product judgment based on the Phase 26 duplicate-answer problem and normal email continuation, not a claim that vendor feature parity or measured Asym duplicate volume proves necessity. If requests are merely related, or their visibility and obligations cannot safely be reconciled, they stay separate.

## A clear and restrained interaction

The proposed entry point is an occasional **Merge duplicate…** action in the conversation's existing More menu. Staff choose the other permitted conversation and review which conversation will continue before confirming. This is consequential enough for one focused preview and confirmation; it does not need an always-visible banner or a large all-fields merge wizard.

The preview must communicate the resulting work/handling and any follow-up conflict, retain access to both source histories, and make the internal effect clear. Selecting the continuing conversation is not designating a primary CRM Party; D9's related records remain peers. No automatic public merge note, donor email, participant addition or CRM merge accompanies the action.

Afterward, staff work in the continuing conversation with a compact provenance notice and permitted access to the originals. Original links must resolve safely. The donor may still see two threads in their own mailbox; Asym cannot retroactively merge another email client's history. The benefit is that qualified replies to either route reach the correct current Support work.

The full D10 review now defines source-history presentation, visibility eligibility, current work/reminder plans and supported Undo after subsequent activity. It records the complete founder-ratified amendments rather than inheriting a competitor's Merge behavior.

## Boundaries already settled

- Same sender, subject or CRM Party alone does not authorize an automatic merge. Exact source-event dedupe remains separate and mandatory.
- Permission to inspect both conversations is not permission to expose either history to everyone who can inspect the destination. Tenant, inbox, source classification and current owner authorization still apply.
- No automatic To/Cc union, quoted-history disclosure, requester replacement, Party merge, template-variable substitution or prepared-send rewrite.
- Retain real messages, original identities/headers/times, attachment visibility, admitted send effects, recipient-copy outcomes and audit provenance. A merge is not another communication event or a successful donor outcome.
- Required work, reminders, unresolved delivery/owner evidence and D8 handoff review cannot disappear through status or assignee inheritance. Duplicate retirement is not D5 No response.
- Keep private draft text safe and stop unsafe stale commands across the pair. Already admitted or ambiguous provider sends keep their original identity and recovery; merging cannot unsend them.
- D9 CRM discovery can follow qualified continuing identity while real correspondence history remains source-owned. Related context does not become historical audience.
- A mistaken merge needs a supported, audited correction path that preserves later work. A blanket Undo promise cannot imply recalling sent mail or restoring an obsolete snapshot.

Splitting one conversation into separate topics remains a separate founder decision. Safe correction of a mistaken merge is a quality requirement for C, not permission to add a general split, parent/child case or enterprise workflow product.

## Why provider and current-source evidence matter

Resend documents reply correlation through `Message-ID`, `In-Reply-To` and `References`, and added outbound Message-ID to retrieval/webhook surfaces in July 2026. That supports preserving actual source references; it does not provide Asym's merge authorization, work state or conversation-routing policy. Email Studio remains content preparation, not the owner of thread consolidation. [Resend reply threading](https://resend.com/docs/dashboard/receiving/reply-to-emails), [Resend Message-ID change](https://resend.com/changelog/message-id-for-sent-emails).

Core's inspected inbound route still contains sender/normalized-subject fallback and first-match header behavior, already rejected by D1 where it could combine unrelated work. The inspected Support mutation surface does not supply a proven conversation-merge command. Choosing C would therefore require qualified product work later; it is not turning on a finished hidden feature or preserving an unsafe heuristic.

The founder selected C and explicitly requested Undo. The complete D10 adversarial review, fully ratified ADR0010/glossary, UX/evidence and proof obligations are accepted. The founder separately authorized the next researched question. No implementation, formal specification, tickets or external mutation occurred.
