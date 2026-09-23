# Recording and viewing Support requests from Support and CRM

**D26 A and every adopted amendment fully founder-ratified, 12 September 2026.** This blueprint makes [D26-R01–R30](phase26-d26-adversarial-review.md) concrete. It preserves the current Core design language and D9's existing CRM placement. It is a researched design, not a built or usability-tested interface. [Independent UX research](phase26-d26-ux-research.md) supplies dated vendor comparisons, maintenance cases and accessibility evidence.

## One form and one detail

The normal staff concepts are **Record a request**, **Support conversations**, **Related records**, **Internal note**, and **Start email thread**. The interface never asks the worker to choose an entity type called case versus ticket versus conversation. One shared form records a received need; one shared Support detail is used from either surface. “Phone” and “In person” identify how the request was received, not calling or recording software.

Illustrative example: a donor says their receipt appears incorrect. Staff records the need for investigation. A finance-authorized person later performs any correction through the receipt domain. This example is not evidence that every tenant uses this workflow or that a call proves the person's identity.

## Path 1 — begin in Support Hub

1. **Launch.** Use Record a request from Support. The current tenant remains visible. A specific current inbox may be prefilled if still qualified; an all-inbox view does not pick an arbitrary inbox. The same navigation shell supports a focused form; small screens use a full-page presentation.

   If no eligible inbox exists, offer contextual inbox setup to an authorized manager or a safe administrator handoff, preserving the permitted request draft. A manager can create a named Support work inbox and its required access/coverage without an email address. Configure email remains a separate action using D25's two equal setup paths; no dummy address or third receiving method is introduced.

2. **Describe the need.** Enter a short request title and a concise staff-authored brief using the bounded Tiptap staff-context profile. Choose Phone or In person. Help text explains that this records an account of a request, not a recording or message from the requester. Retain input when validation or context refresh occurs.
3. **Use what is already known.** Add optional observed requester/callback information and permitted Related records. One name field supports international names; email is optional. A current CRM match is a selectable contextual record, not verified identity. If the exact existing encounter/request is already known and readable, reference or open it without re-entering its content. Do not require a universal CRM search or automatically choose a similar match.
4. **Keep timing light.** Recording time is automatic. Add when received only if needed; preserve exact, date-only or unknown meaning visibly. Do not ask the worker to invent a time just to submit. Show the relevant timezone when an exact time is entered; invalid future occurrence is corrected in place.
5. **Review responsibility.** The responsible inbox is explicit. Shared is the new standalone default, with normal eligible assignment/Assign to me and optional follow-up reminder. A teammate's absence or lost access is handled by existing controls. A missing valid assignment is not silently replaced by the creator. Existing source tasks do not become duplicate tasks.
6. **Record.** The primary button says Record request. Adjacent help says No email will be sent to the requester. This creates Open work and the reviewed brief/context/handling together. Separately qualified staff assignment/attention keeps its existing notification policy. An inline error names the field or changed prerequisite, preserving permitted data. A pending or unknown response shows Checking whether this was recorded and reconciles the same occurrence before another create is offered.
7. **Continue normally.** Open the canonical detail. The source card reads Recorded by [staff] · Phone/In person, with separate recording/reported time. No email yet is honest; there is no fake sender, delivered badge or first-reply timer. Notes, handling and work controls use the existing Support model.
8. **Use CRM or email deliberately.** Related records open the shared qualified CRM shell with a return path. Start email thread is a separate public-authoring action with deliberate audience selection and actual mail readiness. A missing address leaves the Support work usable; it does not generate a placeholder or a request to the donor to resubmit.

## Path 2 — begin on a CRM record

1. **Find current Support context.** On the Party Overview, the separate Support conversations preview shows up to three accessible unfinished requests and View conversations. This is not the financial support/giving summary. In Communications → Support conversations, Unfinished/All exposes the complete eligible set with ordinary simple filters.
2. **Choose existing or new work.** Open the current matching request if this is an update. Otherwise use Record a request. Only currently authorized actions appear; lack of permission must not be discovered after substantial editing.
3. **Carry reviewed context.** The same form opens with the current Party visibly staged under Related records. Its name/type/disambiguation is permission-aware. It can be removed. If launched from an actual interaction, show that source as a separate reviewed reference; do not equate it with a Party link or automatically copy its notes/files.
4. **Capture the same minimal information.** Source, brief and qualified handling use the Support-first form. Do not re-enter known permitted information. Do not silently select the Party's present email as recipient, assume the Party made the request, or make the Party's CRM owner the Support assignee.
5. **Save together.** Record request admits work and the exact reviewed context links atomically. If access/source/Party merge state changes, explain that the context needs review and preserve allowed input. Create without that link is an explicit revised choice where legitimate; a success must never quietly omit the link promised by the CRM entry.
6. **Stay in CRM while seeing the real request.** Show the same canonical Support detail in the shared shell/side presentation when it fits. The new linked request is discoverable in the current full CRM view. A brief projection delay has a truthful pending/retry state and the actual returned identity; no duplicate save is needed.
7. **Return without losing place.** Close/back returns to the same permitted Party/view/filter/scroll. Open in Support Hub uses the same ID and preserves a safe return location. Refresh/deep-link/new-tab has a full-page fallback. Drafts remain separate, actor/tenant scoped and subject to current rights; switching surfaces is not a new draft author or send.

## Every email-origin request is viewable through CRM too

The full CRM Support view includes each currently permitted request justified by an explicit relevance link or qualified correspondence, regardless of manual/email origin. Both bases produce one row, with concise truthful reasons. All includes resolved history; the preview's three-row limit and Unfinished default do not define the full population.

Opening an email-origin row uses the normal source/thread cards, qualified attachments, notes and actual delivery indicators inside the same Support detail. It does not use a reduced CRM transcript with missing attachments or a parallel composer. Read-only users see the actual authorized read experience and only their permitted actions. Changes made from CRM go through the same collision/current-authority checks and produce the same durable outcome as Support Hub.

CRM Communication history remains independently based on actual source-owned communication. Merely linking or recording a request adds no email event or last-contact update. This gives full request visibility without teaching staff that every related CRM record actually participated in the conversation.

## Detail and list behavior

| Situation                                              | Visible behavior                                                                                                                   |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Manual request without email                           | Staff-recorded source card; Recorded time; No email yet; normal work controls.                                                     |
| Request with external correspondence                   | Actual last external-message occurrence/order, normal source timeline and separate delivery status.                                |
| Multiple Related Parties or overlapping correspondence | One row per current canonical conversation in each justified Party view; both reasons remain inspectable without duplicate counts. |
| No unfinished requests                                 | No unfinished Support conversations and View conversations remain visible; All can show permitted ended work.                      |
| No linked CRM record                                   | Clear Support-side state and optional authorized linking; no unknown-person placeholder in CRM.                                    |
| Hidden source/request                                  | No title, count, locked hint or preview that reveals existence.                                                                    |
| Source/read service unavailable                        | An isolated retryable section, not a false empty list or broken whole CRM record.                                                  |
| Body expired but row remains permitted                 | Content expired with its allowed status/time metadata; no missing-history illusion or cached old body.                             |
| Email not ready                                        | Work remains usable; Start email thread explains the actual readiness prerequisite to an authorized operator.                      |
| Incoming email after manual capture                    | Proven reply lineage uses normal routing; an unrelated new email is not silently attached by similarity.                           |

Lists retain D9's actual-message ordering. Zero-mail staff-origin requests use trusted original recording time and the Recorded label. Link, label, assignment, internal note and provider callback updates do not cause unexplained row jumps. No automatic global activity sort is added. Filter state and count meaning are consistent across preview, full list and navigation; count never includes inaccessible inboxes.

## Correction and maintenance

- **Wrong Related record:** Remove context link or correct through D9's owner command. If correspondence independently justifies the row it remains with that reason; explain the actual result rather than promising that all history vanished.
- **Wrong source claim/time:** Record an attributable correction. Original recorder/server time remains; a reported date change does not backdate response credit or extend retention.
- **Duplicate work:** Use actual D10 merge/Undo or D12 related-work judgment. Do not deduplicate all requests with the same person or title.
- **Created in error:** Retain all D12 unused-tracking exclusions before checking settled responsibility/current work home. Subsequent independent activity, admitted/possibly submitted mail, owner/external effects, merge/dependent continuation/referral or protected draft loss prevent unused cancellation. A legitimately used request is not “created in error” merely because it is completed. A standalone request has no original email conversation to silently receive abandoned work.
- **Source or Party access revoked:** Requalify both directions and remove unavailable content. A permitted work brief cannot become a copied fallback for restricted source data.
- **Staff departure/coverage:** Work stays in its tenant/inbox; actor history remains distinct from assignment. Use existing D7/D8 handling rather than copying staff profile data into the brief.
- **Record merge/archive:** Use canonical Party/source references and current owner eligibility. A Party merge does not merge Support conversations or grant access.
- **Retention/redaction:** The initial published brief enters D17 once; ordinary edits/context changes do not renew it. Both surfaces and all derivatives honor D16/D17. Independent financial/CRM records retain their own lifecycle.

## Visual and accessibility contract

Use Core's exact base-maia/Base UI foundation and shared semantic tokens. A calm hierarchy separates request description, optional context and responsibility. Keep primary work prominent; secondary context/source details disclose progressively. Avoid a dense new call-center form, a channel switch inside the send composer, multiple save buttons with overlapping meaning or nested modal stacks.

Use visible programmatic labels, helpful inline errors and non-disruptive save announcements. Keyboard focus follows launch, validation, save and contextual return predictably. Do not rely on color, hover, icons alone, dragging, pointer precision or automatic form submission. Reflow at narrow widths and zoom, long names and localized labels must remain workable. Preserve permitted input through slow connection/retry; do not claim disconnected-device operation or store private drafts indefinitely. Existing qualified asset controls handle attachments; no new recording/transcription surface is included.

The intended standard is WCAG 2.2 AA with actual shared-component and staff-task qualification, not a conformance claim from this document. W3C's redundant-entry and notification guidance supports avoiding repeated input and explaining outcomes; it does not replace user testing. [Redundant entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry), [Form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/).

## Email Studio's exact role

Recording a brief uses an appropriate shared Tiptap editor without creating an Email Studio message source or a provider send. Saved staff-context structure, if offered through already-qualified reusable content, remains content-only; D24 external reply-and-work shortcuts do not execute on intake.

A later public reply uses D18 eligible wording, D23 actual inbox/responder signature, explicit D2/D12 audience and first-thread intent, P17 immutable preparation, D4 Support admission and P6 tenant Resend dispatch. Related Parties and the internal brief are not automatic recipients or merge values. No new template key, Role Layout, provider-template mirror or alternate mailer is needed. The [data contract](phase26-d26-data-contract.md) supplies the ownership and failure boundaries behind this journey.

All applicable P01–P50 remain required and unexecuted. The complete two-entry/CRM-view/correction/later-email journeys must pass representative staff, keyboard, assistive-technology, mobile, slow-network and current-permission tests before this is described as implemented or fully usable.

## Ratification and Email Studio clarification

The founder fully ratified D26, complete CRM access and every adopted amendment, definition, independent correction, UX/data/owner contract and required proof on 12 September 2026. The [Email Studio integration](phase26-d26-email-studio-integration.md) and [independent seam review](phase26-d26-email-studio-seam-review.md) make the accepted manual-recording/staff-awareness/CRM/first-email/retention boundary explicit. Historical proposed/pending/no-Q27 wording is superseded only as to acceptance and advancement. [Current ratification validation](d26-ratification-q27-validation.json) preserves historical evidence. All 50 implementation/release proof groups remain required and unexecuted.
