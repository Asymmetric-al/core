# Phase 26 D9 — Related records and CRM conversation journeys

11 September 2026. Founder selection: **C — Related records without a main designation.** This complete UX amendment package accompanies the [full review and exact requirements](phase26-d9-adversarial-review.md) and [evidence](phase26-d9-evidence.md). It is fully founder-ratified, 11 September 2026, including all adopted amendments, additions, adjustments, changes and updates. It is not implemented or user-tested. D1–D8 remain ratified. Examples illustrate the behavior; they are not claims about the frequency of ministry workflows.

## The experience in one sentence

Staff can retain the CRM context useful to a request, find the same conversation from those records, and return to their work without changing who was emailed, manufacturing communication history, or acquiring permissions.

The interface has three distinct concepts, explained through ordinary labels rather than a training diagram:

| Concept               | Where staff see it                                    | Meaning                                                                                                                                      |
| --------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Sender and recipients | Message header and existing reply composer            | Observed source and the exact message audience; the sender's qualified CRM attribution is separate from proof of identity or representation. |
| Related records       | A compact group beside conversation details           | Existing CRM people, households or organizations explicitly relevant to this request; all peers.                                             |
| Support conversations | CRM Overview preview and existing Communications view | The same canonical conversation is discoverable because of related context, actual qualified correspondence, or both.                        |

No main badge, pin-as-primary, mandatory association, new requester type or automatic audience is introduced. A single record is a one-item group, not a different model. A sender record need not be duplicated in Related records to make real correspondence discoverable in CRM.

## Support: add useful context without interrupting a reply

Maya emails about a request involving Hope Church and missionary Daniel. The header continues to identify the observed Maya endpoint and any qualified attribution. Staff can answer normally without linking anything. After reading the request, an authorized worker selects **Add records** under **Related records**.

Use the shared CRM Party selector, with current owner permissions, rather than a Support-specific address book. It searches existing people, households and organizations. Relevant authorized suggestions can appear first with their basis visible; the worker can search more widely within their authority. Similar names receive permitted disambiguation such as record type and an owner-approved location or identifier. Do not disclose giving balances, sensitive location or private relationship snippets merely to distinguish names. Unavailable results are retryable, not proof of no match.

The worker selects Hope Church and Daniel, sees the exact selected set, and chooses **Add selected**. Search selection is staging only. No record is linked by opening a search result or by a first-match shortcut. Already linked records are identified and cannot be counted as newly added. There is no Create new, main designation, relationship-role form or compulsory explanation. The same dialog can add one or several records without a second workflow.

Concise help at the point of action:

> This adds the conversation to Support conversations on these records. It does not add anyone to the email or change communication history.

The server validates the exact conversation and every selected target under current permissions and control revisions, then commits the bounded selection and evidence together. If a target becomes invalid, the set is not silently partly applied. Keep the remaining draft selection visible with safe feedback so the worker can correct it. An inaccessible target's details must disappear rather than explain a hidden permission change.

After success, show compact rows with permitted record name, type and an **Open record** affordance. A More menu supplies **Remove context link**. Use semantic tokens and the established base-maia/Base UI components, restrained borders, readable hierarchy and a comfortable action target. Avoid competing colored pills for every record. Expand a long group through an explicit accessible disclosure; visible counts include only permitted records. Exact display density follows the shared responsive component, not a new business limit on context.

This approach takes the useful related-record navigation demonstrated in support products without copying their customer models or integrations. HubSpot documents explicit record associations; Zendesk provides related-record inspection, with different behavior for different object types. Neither proves that Asym needs a primary Party or arbitrary custom relationship builder. [HubSpot record associations](https://knowledge.hubspot.com/records/associate-records), [Zendesk related objects](https://support.zendesk.com/hc/en-us/articles/6097369527322-Interacting-with-related-object-records-in-tickets).

## CRM: visible in the right places, with an honest reason

Use the qualified existing Party record shell, not the current donor-only DTO as the finished contract. Give this feature its full name, **Support conversations**: current CRM financial support/commitment summaries retain their meaning.

| Surface                                | Presentation                                                                                | Does not happen                                                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Overview                               | Compact preview of up to three accessible unfinished conversations; **View conversations**. | No full transcript, extra CRM tab, or inference that three is the total population.                              |
| Communications → Support conversations | Complete permission-filtered list. Default **Unfinished**; **All** includes Resolved.       | No filtering a capped client snapshot or silently omitting archived history that the source owner still permits. |
| Activity → Communication               | Actual source-owned P6 message history with authentic timing and outcomes.                  | No extra email or ordinary Activity marker generated by adding/removing context.                                 |
| Audit, where qualified                 | Projection of the Support association's real link/remove/correction evidence.               | No unrestricted disclosure of removed, erroneous or inaccessible links.                                          |

When Overview has no unfinished rows, say **No unfinished Support conversations** and keep **View conversations** available. Its destination visibly identifies **Unfinished** and offers **All** for resolved history. This avoids promising every conversation while initially applying an unfinished filter.

Each conversation appears once per CRM record. A subtle text reason reads **Related context**, **Correspondence**, or both when necessary. Reason help explains relevance versus actual source-message attribution. It does not say the person contacted the tenant when they were only an outbound recipient or related subject. Correspondence does not prove that a named human personally authored the message or saw the whole thread.

The row shows permitted subject, current work status, responsible inbox/worker or required handling, true last-message time, and the reason. Keep D3's **Open**, **Waiting for requester**, **Waiting on our side** and **Resolved** meanings. Keep D8's pending handoff condition distinct from status. Use an exceptional delivery indicator when required; a queued or uncertain message cannot be labeled delivered. Do not overload each row with every possible badge or action.

Sort by actual source-owned last incoming/external-reply occurrence, with a stable conversation-ID tie-break. Notes, link changes, assignment and webhook refresh do not make an old conversation look newly contacted. No qualifying timestamp means a truthful absence, not today's time. Dates follow the shared locale/time-zone display with precise detail available accessibly.

For the example:

| CRM record                                                                                | Support conversations                                                                | Activity → Communication                                                                                      |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Maya, if source attribution is qualified                                                  | One row, Correspondence. If explicitly related too, the same row shows both reasons. | Only actual permitted messages attributed through the source owner.                                           |
| Hope Church, explicitly related                                                           | One row, Related context.                                                            | No fabricated email from Maya or to Hope Church. Actual independent correspondence appears only if it exists. |
| Daniel, explicitly related                                                                | One row, Related context.                                                            | No fabricated email or copied donor-care transcript.                                                          |
| Another household member or gift beneficiary, merely reachable through a CRM relationship | No automatic row from that graph relationship.                                       | No new communication event.                                                                                   |

An authorized gift or receipt may still be linked through its typed owner reference and opened normally. That reference does not fan this conversation into every beneficiary, donor, household or organization. Staff add a Party context link only when it has independent request relevance.

## Message history without duplicates or misleading delivery

P6's source/member events remain authoritative. When several permitted recipient-copy events demonstrably belong to the same canonical Support message, CRM may render one message tile, with the actual permitted outcomes available for inspection. This is display grouping, not deletion or consolidation of the underlying events. Matching text, subject or timestamps is not enough to group.

The server qualifies visibility and event identity, groups by proven source lineage, then pages those groups. It retrieves permitted member outcomes independently of event-page boundaries. Otherwise one message can reappear on page two or look delivered because the failed copy was not loaded. Stable source occurrence and lineage identify the group; late delivery updates do not reorder history. Hidden recipients contribute no count, address or status clue. If legacy common source identity/time cannot be proved, show individual canonical events honestly.

The UI must distinguish pending, failed, unknown and mixed outcomes. A successful copy cannot label an entire mixed group Delivered. Neither provider acceptance nor an open signal proves the intended person read it. Underlying event metrics retain their real cardinality. Bloomerang documents grouping email threads for viewing while retaining individual email access; that supports the usability of grouping, not an inference about vendor storage or Asym household history. [Bloomerang email history](https://help.bloomerang.com/en/articles/12632631-upload-non-bloomerang-emails-to-constituents).

## Removing a link: precise and reversible

**More → Remove context link** affects that explicit relevance fact only. Do not label it Delete record, Remove person or Remove from email. It does not delete the conversation, actual correspondence, CRM Party, gift, history or current recipients. A deliberate reversible context edit needs no routine confirmation modal or mandatory reason.

Use outcome-specific feedback:

| Actual outcome                                               | Feedback                                                                                                |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Context was the sole discovery basis                         | “Context link removed.” The normal Support row is withdrawn from that record.                           |
| Independent qualified correspondence remains                 | “Context link removed. This conversation still appears through correspondence.”                         |
| An original Add/Remove succeeded but a later edit changed it | Show the original receipt and current state distinctly; no second blind command.                        |
| Current control no longer permits Undo                       | “This link changed after your action.” Refresh the permitted state and offer the normal current action. |

Undo Add reverses only links that operation actually created and that remain current. It cannot remove a pre-existing link selected in the same batch. Undo Remove creates a new currently authorized link generation/time while that removal remains current; it does not restore a whole historical set, old interval, obsolete alias or another worker's overwritten work.

If correspondence itself was attributed to the wrong Party, the distinct owner-qualified correction flow repairs current attribution and projections, retaining original observed endpoints and actual delivery evidence. Removing context is not that correction. Old projectors cannot restore retracted attribution. Explain the distinction when needed, not through an always-visible warning panel.

## Navigation and actions feel like one product

**Open record** uses the common authorized CRM shell. Use its drawer when that route supports it, otherwise its canonical full-page view with preserved return context. **Open conversation** from CRM uses the same Support detail and capabilities. Refresh and direct URLs must work through safe full-page fallback. The exact navigation component is not a second domain.

Keep the initiating Party, filters, scroll, selection and the current worker's permitted private draft across the round trip. A support worker who opens a gift acts through the giving domain's exact-target authorization, validation and approvals. A CRM owner is not a Support assignee; an assignee is not authorized to refund solely by assignment. Completing a Support conversation does not certify completion of the business action.

Do not add a parallel CRM reply editor. The canonical composer keeps D2's exact recipient controls, D4's Send-preserves-status default, preparation/Email Studio/Resend contracts and collision protection. Related record order cannot supply template variables, change a prepared audience or choose a refund target. An unrelated context edit preserves typing; genuine relied-on owner permission or source changes invoke the existing qualified fence.

## Accessibility, mobile and graceful failure

Use explicit labels, keyboard search/selection, meaningful accessible names for repeated More controls, visible focus and focus return to the initiating control. Announce saved, removed, failed and reconciled outcomes through the shared status-message primitive without moving focus gratuitously. Color, hover and truncated text cannot be the only way to understand record type, provenance or outcome. [W3C status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).

On narrow screens the record context and CRM preview remain discoverable through ordinary responsive sections; they cannot displace the reply composer with a permanently wide side panel. Long international names wrap or reveal their full permitted form through an accessible action. Respect zoom/reflow, touch targets, localized dates and reduced motion. No motion is needed to explain an association.

Keep Loading, no visible conversations, source unavailable and owner-safe denied/not-found behavior distinct. A Support projection outage leaves other permitted CRM data usable with a local Retry action. A tenant change or revoked scope discards stale responses and cached details. A lost response after Add reconciles the original operation before inviting another action; offline typing does not become offline permission to commit links.

Context edits create no donor email or notification to everyone related. Business audit is durable; ordinary staff awareness is the changed section plus restrained feedback. Only unresolved failures needing intervention enter the existing qualified operations/task path.

## Evidence and release proof

The specific placement, labels and three-row preview are Asym product judgments based on its governing Phase 9 shell and the researched tradeoffs. They are not claims that vendors use this exact design or that it has passed usability testing. The current CRM helper/source observations do not prove the finished Party/search/permission/P6 foundations.

Run all [D9-P01–P32](phase26-d9-adversarial-review.md), including true Support→CRM→owner action→Support continuity; joint-policy negative cases; mixed new/pre-existing Add; stale Undo; merge/unmerge and attribution repair; grouped messages across pages; current permission loss; redaction; migration; accessibility and representative staff tasks. The full review supplies named signals, thresholds, owners and responses for residual monitoring. The complete amendment package is fully accepted by the founder; implementation readiness is a separate proof obligation.
