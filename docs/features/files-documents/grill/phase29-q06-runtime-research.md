# Phase29 Q06 research — normal completion versus recipient read access

Read-only research, 20 October 2026. Checkout `/home/conrad/code/core`, HEAD `3d85897ebf1515008ef5c676b1c58a15422fb9ab`. Parent reports Q05 and its amendments ratified and is updating canonical records. Q01–Q05 are treated as accepted grooming decisions; none is represented as an implemented generic request service.

No product/schema/auth/provider/dependency changes, tests, private rows, credentials or file-byte reads. Only this research note was written. The question concerns the ordinary native request after normal successful fulfillment, not every reason a source might close or restrict something.

## The next unresolved decision

Should normal successful fulfillment stop submissions/corrections while leaving currently authorized current-file reading, status and concise history available until the source's separately governed read-access boundary ends them? Or should completion remove file reading and retain only permitted metadata, or end ordinary recipient access immediately?

This is a real product decision. Q03 prevents ordinary recipient corrections after the relevant item is accepted/frozen/closed. Q04 and Q05 reserve post-closure continuity. Keeping source evidence does not settle participant read rights. Conversely, a work item being complete does not inherently mean its recipient can no longer view anything.

The question should explicitly mean **the source has normally completed this document request**, with no additional submission work owed under it. Do not ask a single “what does closed mean?” question that also decides privacy revocation, cancellation, recipient reassignment, deadline expiry, failed checking or request withdrawal. Those are different source events and can require different access outcomes.

## Recommendation

For the ordinary native profile, recommend **read-only completion**: stop ordinary new submissions/corrections; retain the source-authorized current files with independently qualified View/Download, clear completion status and the Q05 concise history while current read authority remains valid.

This preserves continuity for someone returning to confirm completion or retrieve the currently permitted copy. The request stays small and task-bound; it does not become a drive, prior-version archive or indefinite access promise. It also avoids making successful completion unexpectedly erase capabilities the person just used.

This is product judgment, not measured ministry demand or a fact required by current code. Metadata-only is the strongest narrower alternative: it confirms the outcome while reducing post-completion file delivery. Immediate loss of access is a coherent stronger boundary but gives the least self-service confirmation/retrieval and can move normal follow-up to staff.

No number of days, grace period, reminder schedule or permanent retention/access promise should be chosen in this question. The affected profile must eventually have a qualified source-owned access-ending policy; an unknown boundary cannot be interpreted as unlimited access. Completion should not silently start an invented countdown or extend the existing one.

## Accepted boundaries already settle much of the design

| Source                      | Exact reference                                                                                                       | Consequence                                                                                                                                                                                                                                                                   |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Current request authority   | `docs/features/files-documents/docs/adr/0001-confirmed-recipient-private-document-requests.md:49–56`                  | Protected operations recheck current authority. Revocation/expiry/supersession fences new affected participant actions and unaccepted late submissions. Independently authorized processing can continue after a browser session ends. Ending access does not erase evidence. |
| Request source owns scope   | Same ADR`:76–87`                                                                                                      | Source owns recipient eligibility, action scope, stronger assurance, review/acceptance/correction/retention. Q06 cannot change specialized receipt, expense or unrelated external-task rules.                                                                                 |
| Readback and custody        | `docs/features/files-documents/docs/adr/0002-purpose-bound-files-and-submission-readback.md:47–66`                    | Confirmation, qualified preview, review and acceptance differ. Post-closure access was reserved. Ended request or expired rendition is not disposal authority.                                                                                                                |
| Correction cutoff           | `docs/features/files-documents/docs/adr/0003-recipient-corrections-and-exact-review-lineage.md:9–12,18–33,43–54`      | Ordinary correction is for the exact unaccepted pending item under current source permission. An item cannot be altered merely because other work keeps the request open. Viewing is not a lock or reopening action.                                                          |
| Current original reads      | `docs/features/files-documents/docs/adr/0004-submitted-original-download-and-current-source-authority.md:19–46,61–68` | Exact current original, whole-file authority, private delivery and current read checks remain. Q04 grants no post-closure duration. An already admitted stream follows inherited expiry/termination rules.                                                                    |
| Concise history             | `docs/features/files-documents/docs/adr/0005-current-files-and-participant-submission-history.md:19–47`               | Current supporting members remain distinct from superseded predecessors; history is current-authorized metadata, not old-byte permission or an access-duration promise.                                                                                                       |
| Workflow participant intent | `docs/prds/workflow-studio/01-product-and-experience.md:57–77`                                                        | Participant projection, submitted items and correction requests are source-defined. External task sessions are purpose-limited and reads/submissions recheck authority. The suggested task-link expiry in that document is not a universal post-completion read period.       |

The source's completion fact must be authoritative. Client file count, all uploads reaching 100%, preview readiness, an empty My Work queue or a worker reporting success cannot mark the source request fulfilled.

## Actual runtime evidence

The bounded native-request/API/schema census has not found a generic request-recipient completion/read-access lane. The existing examples below show separation opportunities and misleading couplings, not a prebuilt Q06 implementation.

### Missionary task completion remains readable, but is freely mutable task state

- `packages/api/src/missionary-portal/tasks.ts:43–65` lists tasks under the missionary route gate, including donor relationship checks where applicable.
- `packages/api/src/missionary-portal/service.ts:252–275` loads tasks for the profile without excluding completed status. `295–312` fetches a task by exact ID/profile, again without a completion read prohibition.
- `packages/api/src/missionary-portal/task.ts:8–14,25–58` accepts a task-status update and sets or clears completed_at depending on the submitted status. `81–97` applies it and reads the task back.

This demonstrates that completion and read access are not universally the same runtime predicate. It is not the protected document-request state machine: blindly copying a generic PATCH could make “completed” freely reversible and accidentally reopen submission. Do not add missionary membership to a request recipient to reuse this route.

### Support resolved status is separate from staff visibility and can reopen on new input

- `packages/api/src/admin/support-hub/route-helpers.ts:31–74` gates staff/admin access and binds the tenant.
- `adapter/supabase.ts:683–694` filters conversation status only when requested for the list; `738–751` retrieves conversation/messages under their source scope without a resolved-state read prohibition.
- `adapter/supabase.ts:849–858` sets status/resolved_at.
- `adapter/supabase.ts:655–662` reopens a resolved conversation when an inbound message arrives; `663–670` also changes snoozed state in the outbound-message case.

Useful precedent: working-state filters and authorized record reading are different. Unsuitable coupling: a reply, visit, download or late technical callback must not automatically reopen a completed document requirement or authorize a new submission. Support's conversation rules and staff audience do not transfer to the native request.

### “Needs attention” omission is not global access revocation

`packages/api/src/admin/mission-control-tasks/types.ts:1–6` defines open/in_progress/completed/dismissed/suppressed. `store.ts:130–152` lists only open attention items. That is a purpose-specific work-list filter, not a statement that the linked contribution/evidence/history is deleted or inaccessible.

Likewise, `packages/api/src/reads/member-care.ts:418–443` reads goals including their statuses, while `539–547` excludes completed goals from the derived gaps list. `supabase/migrations/20260414180338_member_care_foundation.sql:91–124` separates goal status/target date from interval-based care requirements. The similarly named requirements are recurring care activities, not native document-request grants.

Do not infer completion/read behavior from whether something disappears from a task list, or treat these care source tables as an existing file-request service.

### Eve deliberately couples replay-body access to artifact expiry, with metadata still visible

- `packages/api/src/eve/retention/control.ts:157–178` requires owner/tenant/available/unexpired artifact metadata before returning a 60-second signed URL.
- `store.ts:109–150` lists owner-scoped metadata/status/expiry without applying that body-download available/unexpired predicate.
- `supabase/migrations/20260718022535_eve_retention_replay_tracer.sql:185–205` derives artifact expiry from its replay retention category. `373–396` uses that expiry for cleanup eligibility and excludes active holds.

This is an actual specialized model where metadata and bytes have distinct availability and artifact expiry participates in retention. It does not establish a universal participant read deadline. A hold protects custody but does not make `expires_at` pass the download gate. The signed-URL mechanism also does not supply Q04's current-authorized original gateway.

Do not copy its expiry column, category durations or 60-second URL lifetime into a native request completion/access policy.

### Worker leases and execution tickets have different clocks

- `packages/api/src/workflows/claims.ts:7–38` uses a default 300-second work claim to coordinate retryable effect execution. `22–26` explicitly describes execution concurrency, not a human session or file-read grant.
- `packages/api/src/eve/dynamic-workflow/state.ts:37–53` requires executable prepared/running state and unexpired workflow ticket. `112–128` derives runtime completion from completed/stopped steps.

A worker's claim expiry, queue completion or retry exhaustion is not participant access expiry, request fulfillment, source acceptance or retention. The native request must not inherit these execution clocks just because its processing uses the same infrastructure.

### Existing donor receipt reading is its own source

`packages/api/src/donor-portal/receipts.ts:45–80` resolves a signed-in donor context, loads an owned donation and generates a text receipt. The ordinary donor history UI shows a receipt link on successful transaction rows (`apps/donor/app/(dashboard)/donor-dashboard/history/columns.tsx:175–192`). These specialized financial/source rules do not define document-request completion.

The P18 source contract independently provides one current official document and authorized read/download, with restricted evidence access for prior replaced/canceled artifacts (`docs/prds/sitestacker-parity/phase-18-receipt-pdf-template-system.md:234–240,250–259`). Neither donor persistence nor a receipt/export link's expiry supplies the native request's duration.

## Clocks and transitions that must remain distinct

| Concept                                     | Meaning in this question                                                                 | What it must not imply                                                                               |
| ------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Invitation/proof expiry                     | Whether the particular entry/proof mechanism may still establish a qualified session     | Universal deletion, request failure or a new post-completion read period                             |
| Browser/auth session expiry                 | Whether this session can act without reauthentication                                    | Completion, receipt loss, worker cancellation or automatic source-access renewal after sign-in       |
| Submission/business due date                | Source timeliness/admission boundary for supplying work                                  | Automatic metadata/byte-read expiry unless source policy explicitly says so                          |
| Item acceptance/freeze                      | Stops ordinary correction of that exact item                                             | All other items complete, broader source outcome approved, or all reading revoked                    |
| Normal request fulfillment                  | Source says the requested document work is complete                                      | Application/expense/legal decision accepted, retention ended, or read permission automatically ended |
| Current source read boundary                | Whether this participant may now see each permitted metadata/preview/original projection | Indefinite rights merely because bytes remain or they once uploaded them                             |
| Privacy restriction/revocation/reassignment | Ends or changes affected source authority                                                | A benign completion state; weaker access to explain the protected reason                             |
| Rendition lifetime                          | Availability/requalification of a derived reading representation                         | Receipt loss, original deletion, permission to generate an unapproved fallback or extend access      |
| Custody/retention/hold/disposal             | Source-governed preservation or deletion of bytes/facts                                  | Ordinary participant access for as long as a copy exists                                             |
| Processing lease/worker ticket              | Authority and concurrency for a technical effect                                         | Human read authorization or source business completion                                               |

The source may deliberately relate some of these boundaries, but the relationship must be explicit. An implementation should not reuse a single ambiguous `expires_at` or `closed` test across all operations simply to reduce code.

## The three product options

| Option                                            | Ordinary completed-request experience                                                                                                                                               | Benefit and cost                                                                                                                                                                                                                                                        |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Read-only completion, recommended**         | No ordinary submission/correction; current source-authorized files retain qualified View/Download, with completion status and Q05 concise history until source read authority ends. | Clear continuity and useful copy retrieval. Keeps a private read surface operating after work completion, so current checks, expiry, support and processing qualification remain necessary. No indefinite access promise.                                               |
| **B — Metadata-only completion**                  | No ordinary submission/correction or file reading; show only permitted completion/status/receipt-history and help while that metadata authority remains.                            | Smaller post-completion content exposure and clear outcome. Someone needing a current copy must use an existing local copy or separately authorized source help/delivery; metadata does not reproduce file content.                                                     |
| **C — Completion ends ordinary recipient access** | Completed request is no longer ordinarily readable through that participant route; only a source-permitted neutral outcome/help doorway can remain.                                 | Strongest simple termination at normal fulfillment. Least convenient confirmation/retrieval; risks making success look like a broken link and moves follow-up to staff. It does not delete retained evidence or establish how a later independent access request works. |

All three preserve stronger privacy stops and source-specific exceptions. B still requires metadata authorization. C cannot expose restricted existence/reasons in its “access ended” page. None authorizes new communication, automatic reminders or new historical-byte access.

If only two founder options are desirable, A versus B is the most informative ordinary product tradeoff. Immediate access termination can be explained as the stronger variant/constraint that still applies to explicit revocation, or retained as a third option when the founder should decide it for normal fulfillment. Do not merge B and C into one “closed” label: their visible evidence/help experience differs.

## Suggested one-question framing

“The organization has finished this document request and no more uploads or corrections are allowed. While the source still permits access, should the recipient be able to return to the current files and the completion record, see only the completion/history record, or lose ordinary request access when it is completed?”

Explain that the recommendation is A, and the duration/end policy is not being chosen yet. This choice concerns normal successful completion; explicit withdrawal, privacy restriction or recipient change still follows the stronger source rule. Do not say “forever,” “for 30 days,” “until we delete it,” or “until the email link expires.”

For A, a useful screen could say that the document request is complete and no further submission is needed, retain allowed current-file actions, show concise history, and offer the existing source help path. It must not say the wider application/claim has been approved unless that source separately authorizes that outcome.

## Practical guardrails whichever option is chosen

1. **Per-operation source permission:** continuation of read does not keep upload/finalization/correction/reopen authority alive. Late upload completion must recheck its exact source operation, even if the completed screen remains readable.
2. **No global latest-file assumption:** the source preserves the exact final/current member set and Q03 predecessor history. Reading after completion does not resurrect superseded bytes or inherit all retained files.
3. **No accidental reopen:** visiting, downloading, contacting support or receiving a late worker signal does not reopen accepted work. Any new correction opportunity uses the source's explicit successor/reopen contract where allowed.
4. **Current source gates still apply:** preview, whole-original delivery, history metadata and help are independently qualified; “completed” is not a universal allow or deny predicate.
5. **State changes are coherent:** closure races with finalization/correction/read admission use the owning source boundary. Already received facts remain truthful; already admitted streams use Q04 expiry/termination; new reads use current authority.
6. **Access renewal is explicit:** reauthentication renews a browser identity session only. It does not renew a revoked/expired request entitlement, add membership, extend business deadlines or restore access to old predecessors.
7. **Status and failure differ:** request complete, file temporarily unavailable, history load failed and access ended are different safe outcomes. Never claim the file disappeared or request failed merely because a private read is now denied.
8. **No retention coupling:** read access ending neither deletes bytes/history nor extends preservation. Holds do not grant participant rights. Every retained use/disposal stays source-owned.
9. **No surprise automatic events:** choosing a completed-read experience does not itself decide end-of-access notifications, email copies, grace periods, reissue links, retention timers or reminders.
10. **Finite policy required before activation:** this question leaves numeric timing open, not unlimited. The source's concrete access boundary and recovery behavior must be qualified before the affected profile operates.

## Narrow permanent implementation seam

The native request source needs distinguishable submit/correct eligibility, metadata read, preview read and original read under the existing Q01/P12 context. Completion is a business fact consumed by those policies; it is not an alternative auth system. Reuse Q02/Q04 private serving and Q05 authorized history, and keep the existing source coordinator/help path.

Do not introduce a configurable state-machine platform, separate binary repository, “archive mode” permission system or universal completed-record access policy. Do not freeze table/enum/API names in this question. Code must later enforce the chosen native default and preserve each specialized source's existing semantics.

## Evidence limits and later qualification

This research adds no pass count. There is no new generic runtime to test merely because Q05 was ratified. Source inspection confirms partial models and the unresolved permission choice; it does not prove a native completed-request reader, deployed access expiry, closure race behavior or browser UX.

Later implementation proof must cover: source-authoritative normal completion; blocked submissions/corrections after the exact cutoff; preserved permitted current reads if selected; metadata-only or no-access outcomes if selected; expiry versus reauthentication; privacy/reassignment precedence; late finalization and concurrent completion; immutable current/earlier membership; independently authorized workers after session end; stream/current-source fences; truthful accessible completed/unavailable/ended screens; and retention/hold/disposal independence.

No arbitrary duration, provider expiry or specialized task/receipt deadline is adopted by this note. Parent owns final source-owner reconciliation and the founder question.
