# D19 independent lifecycle, retention and recovery review

Reviewed 12 September 2026. Independent input for the root synthesis; clauses below are proposed, not founder-ratified or implemented. Source worktree was verified as `/home/conrad/code/core-worktrees/grill-with-docs-2026-09-10`; source revision is `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. This reviewer made no repository, database, provider, inbox, DNS, message or GitHub mutation. Only this Windows work artifact is written.

## Disposition

**Accept with required amendments.** Designated reviewers close to an inbox are a sound default if responsibility, content access, allowed disposition, current source classification and tenant policy remain independent. The strongest alternative is central qualified staffing, which the same model supports by naming the same eligible team for several inboxes. The decisive hazards are a misleading universal Recover action, future sender/routing effects hidden in one-item handling, silent accepted-input loss, and using a review action or delayed worker as a new clock.

## Verified evidence and limits

- D1 R3–R5 requires durable accepted-input identity, one recoverable disposition, empty-body versus retrieval-failure distinction, safe unmatched correlation and current authority at each owner action. D13 R06 fixes automatic-confirmation utility to original qualified provider receipt plus fifteen minutes. D14 records original source receipt and actual Support-ready timing separately. D16 establishes immediate restriction, independently owned physical cleanup and restore suppression. D17 R04 explicitly excludes pre-qualified intake/quarantine material from ordinary ended-work retention. These are currently ratified local grooming facts, not proof of deployed behavior.
- [ADR0038](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/adr/0038-purpose-owned-records-schedules-and-verified-disposal.md#L18) is Phase 18's purpose-owned schedule precedent. Its explicit Phase 21 amendment says it is not a platform-wide semantic owner. [ADR0115](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/adr/0115-purpose-owned-phase21-records-schedules-and-exact-custody-exports.md#L72) preserves separate semantic/custody owners. Neither assigns an existing fourteen-day inbound schedule or lets Support reclassify Finance/care records.
- [Current route save](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/workflows/adapters/inbound-routing.ts#L266) creates/redirects persistent routing and resumes other matching reviews. Its route row, audit, review resolution and workflow dispatch are separate writes. This is documented broader routing behavior, not a safe one-item release implementation. The pending scan at line 427 is limited to 50; it cannot prove complete coverage of a new D19 tenant queue.
- [Current technical retry](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/workflows/adapters/inbound-email.ts#L501) dispatches retrieval under a work claim; it is not human safety approval. The claim is released after dispatch at line 574. A work claim therefore cannot replace permanent source-disposition deduplication.
- [Current retrieval](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/workflows/adapters/inbound-email.ts#L166) treats successfully fetched empty text/HTML as a retrieval failure. [Routing](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/workflows/adapters/inbound-email.ts#L374) requires nonempty body and substitutes current time for missing received_at at line 426. Those facts conflict with D1 attachment-only and D13/D14 time requirements; D19 must not endorse them by reuse. The hydration persist at line 195 has no visible current disposal/source-revision predicate in this function; late retrieval after restriction is a required test, not a demonstrated production exploit.
- [Zendesk recovery](https://support.zendesk.com/hc/en-us/articles/4408893392922-Viewing-recovering-and-deleting-suspended-tickets), edited 7 May 2026, documents automatic deletion after 14 days, individual/bulk recovery and a manual-copy path that excludes HTML/attachments. Adopt an explicit bounded review lifecycle; reject treating a copied incomplete ticket as recovered original evidence or using vendor retention as legal authority.
- [Help Scout spam handling](https://docs.helpscout.com/article/307-manage-spam-and-unwanted-email), direct page updated 8 September 2026, recommends regular inspection and documents 30 days after last action plus permanent purge. Its mark/unmark action changes future sender treatment. Adopt visible routine review; reject touch-based renewal and implicit future trust. Search's cached March 13 date was stale; the directly opened page controls.
- [Resend receiving](https://resend.com/docs/dashboard/receiving/introduction) documents provider storage while the webhook is down. [Retries and replays](https://resend.com/docs/webhooks/retries-and-replays) permits replaying succeeded as well as failed events. These support durable source dedupe and recovery; they do not establish unlimited provider retention. [Attachment documentation](https://resend.com/docs/dashboard/receiving/attachments) says attachment bytes are separate from webhook metadata, download URLs last one hour and can be refreshed through the API. The URL lifetime is not the content-retention lifetime.

No live database/RLS, provider custody/retention contract, browser interaction, legal applicability, ministry staffing measurement or scale test was performed. Repository search found no qualified existing numeric inbound holding schedule; absence from the inspected paths is not an exhaustive deployed-system inventory. This review supplies the narrow proposed class, while activation must prove its real custodians and shorter limits.

## Small reason/action model

Use a closed owner-qualified reason set, with the UI grouping by the action actually available. Do not turn each reason into another conversation status or workflow engine.

| Situation                                                                   | Ordinary reviewer action                                                                                        | Owner boundary and safe result                                                                                                                                                                                   |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Possible unwanted mail; uncertainty is explicitly human-reviewable          | Inspect permitted safe evidence; release this input or dismiss it                                               | Release records a one-input decision. It cannot clear a non-overridable source guard, train a filter, verify identity or allow future sender traffic.                                                            |
| Destination/correlation needs confirmation within an already trusted tenant | Choose only currently authorized and classification-compatible destination/correlation, then release that input | No guessed tenant, arbitrary first match, subject match, silent new route or admission into a private conversation without its permission. If safe choice is unavailable, owned routing review remains.          |
| Payload or file retrieval incomplete                                        | Observe truthful technical status and invoke qualified retrieval retry if separately permitted                  | Retry does not release safety checks. Legitimate empty-body/file-only evidence stays distinct from provider failure; missing files remain visibly unavailable rather than silently omitted.                      |
| Malware or other non-overridable safety restriction                         | See a safe reason/owned next step, not Release                                                                  | Security/file owner determines availability/disposition. Harmless text admission, if that owner explicitly supports it, must truthfully preserve the unavailable file fact; ordinary staff cannot clear malware. |
| Protected/care-classified material                                          | Refer through the actual protected owner with minimum permitted context                                         | No body copy to a normal inbox or oversight notification. Current source classification and care authorization win.                                                                                              |
| Tenant unbound/conflicting                                                  | Not visible in a candidate tenant's ordinary intake view                                                        | Separately authorized platform recovery. Owner transitions require exact evidence, not a tenant picker driven by message text.                                                                                   |

Several reasons can coexist. A release decision satisfies only explicitly reviewable reasons for its reviewed evidence revision. Other unresolved guards remain; UI must not offer a false all-clear button. The ordinary view shows one actionable summary and details on demand.

## Exact proposed clauses

### L01 — Stable accepted input and independent state axes

“Every accepted input retains one stable provider-connection/source identity and one current disposition with append-only decision receipts. Separate receipt/custody, technical completeness, classification/safety, reviewer disposition, canonical admission and payload availability. Held does not mean Spam, Resolved, technically failed, or already a Support conversation. A job identifier, UI selection, sender address, subject or current conversation root is not the logical input identity.”

Why: High severity/plausible likelihood. One overloaded status hides whether the reviewer can act, loses pending accepted input after a partial failure and encourages duplicate conversations. This narrows A into a usable, implementable responsibility model.

### L02 — Guarded one-input release

“Release this message reviews one original input, current evidence revision, exact qualified destination/correlation and current permissible release reasons. The trusted command checks active reviewer eligibility, source/inbox authorization, current safety/classification, retention authority and expected review revision. It commits the decision receipt and canonical intake obligation atomically. Canonical admission consumes the same source identity once, rechecks changed current guards and reports whether it appended to an existing conversation, created a new conversation, or remains blocked. A release approval/dispatch receipt alone is not Support-ready.”

Use one local owner transaction when possible; otherwise durable outbox plus unique consumer receipt. Do not add a database transaction around Resend/network I/O. A changed relevant destination, classification, source evidence or reviewer authority before admission stops stale work for current authorized review; after admission, reviewer departure never rewrites historical authorship.

Why: High/plausible; current broader save path contains independently fallible writes and is not the new contract. This changes the necessary mutation seam, not the selected product direction.

### L03 — Dismiss is a reversible review disposition, not deletion

“Dismiss removes the input from Needs review and records a closed body-free reason such as Unwanted message or Not Support work. Dismiss does not delete content, resolve a Support conversation, block a sender, change future routing, create/delete a CRM contact or send a message. Dismissed items remain available only to currently qualified reviewers through the Dismissed filter until their original content cutoff. Reopen review is persistent in item history/detail as well as optional toast Undo; it restores review status under current guards without resetting receipt, expiry or source identity.”

Why: High/plausible; irreversible trash and future-sender side effects are documented vendor footguns. This is the smallest correction path without a generic undo system.

### L04 — Cancellation and post-release correction

“An unconsumed release can be stopped only by its current expected-version command before canonical admission wins the same guard. The stopped input returns to current review with original clocks and history. Once admission wins, do not expose a universal Undo release that deletes or rewinds a conversation, reply, CRM fact, target or downstream action. Show the actual admitted location and use the current owning correction/restriction/routing command. Already-sent email cannot be recalled by correcting intake. A mistaken source decision can be amended, but cannot erase the original review evidence or revive expired material.”

Why: High/plausible. A deceptive undo might remove legitimate later work or claim impossible external recall. Changes the UX promise only; reversible dismissal remains simple.

### L05 — One proposed ordinary Intake-review content schedule

“Qualify a narrow purpose-owned Ordinary intake review content schedule with a proposed default of 14 elapsed days from qualified original provider receipt. Fourteen elapsed days means 1,209,600 seconds on the instant timeline; display the exact local cutoff and available timezone. This is a proposed Asym product choice providing two calendar weeks for ordinary review and short absences, not a universal help-desk standard, legal minimum, promised storage period, or permission to override a shorter actual owner ceiling. New activation explicitly reviews this default and requires qualified custody, current owner policy and cleanup/restore evidence. Tenant adjustments select only independently qualified finite schedule variants through the existing records-policy owner; no per-item Never, arbitrary freeform legal rules or unnoticed per-inbox override.”

A 14-day default is proportionate only if routine review and early coverage attention operate well before it. Compared with 30 days, it minimizes retained pre-admission content sooner while allowing repeated ordinary working opportunities. Compared with 7 days, it offers more room for weekends/short absence without a second grace-period clock. These are product judgments, not measured ministry outcomes. The root may prefer30days if its UX/research evidence justifies a longer review allowance; do not claim either is objectively proven by a vendor's number.

“D17's ordinary after-work duration does not supply this clock, and ADR0115's Phase21 family catalog does not become the inbound semantic owner. Technical recovery, unbound tenant, protected classification, incident evidence and actual holds retain their actual qualified owner classes and shorter/more restrictive limits. An unclassified safety/legal obligation cannot be auto-dismissed/destructively purged merely because the ordinary 14-day timer ran.”

Why: High/plausible. Leaving the queue indefinite violates minimization; borrowing a years-long ended-work interval or purging unknown protected evidence is also unsafe. This is a required explicit amendment, not a reason to delay the selected accountability decision.

### L06 — No clock laundering

“Pin original qualified receipt, schedule/version, effective cutoff and first durable retained/available times separately. Views, edits, assignment, backup changes, dismissal/reopen, duplicate webhooks, provider retry, route changes, team changes, reviewer absence and renewed signed attachment URLs never reset the original holding clock. A missing/unqualified receipt is an owned timing/custody exception; do not substitute now or sender Date. Existing legacy payload does not receive a new full lifetime by backfill. Schedule successors require reviewed effective-dated scope/impact and preserve prior evidence; no successor revives content whose authority already ended.”

Why: High/demonstrated current fallback with plausible future lifecycle impact. This changes required timing semantics.

### L07 — Admission transfers real content purpose, not merely its status

“Only actual qualified canonical Support admission/custody commit strictly before the input's cutoff can end ordinary intake-review custody and establish the admitted source's D17 purpose/lifecycle, preserving original receipt and current admission evidence. A release clicked just before expiry but still queued at the cutoff cannot mint a fresh D17 lifetime. Expiry/restriction wins against unconsumed release at equality. After actual admission, technical audit copies do not inherit an indefinite fresh lifetime; their actual owner class still governs. If the source was already admitted, webhook replay resolves the existing receipt and never creates another source or retention generation.”

An owner-authorized restricted-custody transfer for actual required evidence is separate from normal Support admission; it does not publish the material or create a phantom conversation.

Why: High/plausible race. This prevents release-to-queue becoming a bypass while preserving genuinely admitted work.

### L08 — Expiry removes authority before eventual byte cleanup

“At cutoff, ordinary review read/search/download/release and new hydration/materialization authority end for the exact input payload, whether or not a worker has run. Materialize an Expired — not admitted outcome and minimal permitted receipt; do not mark the item Dismissed by a person or tell staff it was handled. Reuse D16's source restriction, exact copy inventory, owner cleanup, verified disposal and restore journal. Unknown preservation blocks irreversible destruction but not independently authorized ordinary-access restriction; it creates one owned restricted-custody exception with a finite review date rather than silent indefinite ordinary visibility.”

“Physical cleanup acts on exact source and copy identities under final current no-hold/schedule guards. A prior hold preserves only required still-existing bytes in restricted custody. Failed deletion never restores access. Provider copy, backup expiry and actual destruction have distinct truthful outcomes. Delayed fetch, old backup, replica/index rebuild or replay cannot repopulate expired/redacted content under the original or a new surrogate input identity.”

Why: High/plausible; live hydrated copies and asynchronous provider material make a single deleted flag insufficient.

### L09 — Do not change D13/D14/CRM history

“Keep original receipt, first review availability, release decision, actual admission and eventual first reply as distinct facts. D13's fifteen-minute utility starts at original qualified provider receipt and cannot restart after review; all original/current confirmation gates still apply. D14 uses its qualified readiness contract and separately exposes intake delay without backdating staff responsibility or manufacturing response credit. Review, dismissal, expiry and release produce review/source-control evidence, not a new CRM contact, last-contact date, communication copy, verified identity or Finance/care action. Canonical admitted correspondence retains the original author and actual source attribution; reviewer identity is separate.”

Why: High/plausible with demonstrated timestamp fallback. Necessary integration constraint.

### L10 — Races and permanent effect identities

“Serialize release/admission, dismissal/reopen, stop-release, source restriction, expiry and relevant disposition correction on the same exact source version/guard. Tie permanent effect identity to tenant/environment, original input and review-decision generation, with immutable command meaning. Same command returns its existing receipt; changed meaning under the same identity conflicts. One disposition cannot be consumed twice by job retry, route replay or a new worker lease. A duplicate webhook resolves the durable original source even after payload disposal through the permitted minimal tombstone; the tombstone itself follows its justified owner schedule, not metadata forever.”

“Authority-bearing changes fence pending work. Claims/presence can reduce collisions but are not security or permanent idempotency. No exclusive long-lived editor lock is required. A stale reviewer sees what changed and retains safe unsaved work; they cannot overwrite the winner. A transaction success followed by response loss is reconciled by operation ID, never blindly sent as a new decision.”

Why: High/plausible; transient retry claims and at-least-once Resend delivery are verified facts.

### L11 — Coverage and owned attention

“Every enabled responsible inbox has an explicitly named eligible reviewer person/team and a qualified oversight owner. The tenant may reuse one team across inboxes. Prefer more than one eligible reviewer or an explicit backup; a genuinely small tenant may knowingly use one person with the coverage consequence visible. Configuration authority does not grant content/release authority. Team membership, scope, suspension, offboarding and actual source restriction changes recalculate effective coverage. Zero eligible reviewers produces one body-free owned attention item immediately; accepted inputs remain retained under their actual schedule.”

“Routine review stays in the inbox's Intake review view. Existing shared work attention may group due review/coverage facts; no per-item external emails, copied body digest, new SLA engine or automatic promotion of all inbox members. For the ordinary 14-day class, show one grouped Intake review needs attention signal once any undisposed item remains unreviewed 24 elapsed hours after first safe reviewer availability, plus a higher-priority Expiring within 24 hours group. These are explicit operational review thresholds, not requester response promises or D14 reply deadlines. The expiry warning must include unresolved pending-release and dismissed-recoverable work only in appropriate qualified views, without making dismissed spam dominate the ordinary Needs review count.”

The root can replace the24-hour operational threshold with its existing service-calendar owner if that is already sound; do not quietly invent a second business-hours calculator. Exact thresholds must be chosen in synthesis rather than left as ‘regularly.’

Why: Medium/plausible; the selected distributed model otherwise creates invisible abandonment. One owner and grouped signals are sufficient.

### L12 — Complete, bounded queries and bulk scope

“Use current authorized server-side reason/state/age/cutoff projections and stable keyset pagination. Counts use the same current predicate before pagination; old unresolved items cannot disappear behind a recent-date filter or50-row cap. Label snapshot time and loading/unavailable states rather than showing zero on query error. Retrieval/provider limits, safety classification and reviewer attention are independent. Do not hydrate all raw bodies to calculate oversight or age.”

“Default release is one fully reviewed input. If batch dismissal is offered, it is the same recoverable disposition over explicit bounded original IDs with reason and current per-item authority; show exact applied/skipped/conflicted outcomes. Never hide future sender blocking, all-matching routing, irreversible purge or broad release inside a bulk convenience action. No global Select all unseen item mutation from a stale filtered count.”

Why: Medium–High/current boundedscan demonstrates completeness hazard. Prevents scale claims from confusing truncation with complete review.

## Required proof cases for root integration

These are unexecuted acceptance cases, not passed runtime tests.

| Proof | Required falsifiable result                                                                                                                                                  |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L-P01 | One received provider source produces one review identity under repeated failed and succeeded webhook replay.                                                                |
| L-P02 | Two reviewers release the same source concurrently; exactly one canonical admission occurs and both get the same actual result.                                              |
| L-P03 | Release and Dismiss race; one version wins, loser cannot overwrite it or create a second disposition.                                                                        |
| L-P04 | Dismiss then Reopen review preserves original receipt/cutoff and source identity.                                                                                            |
| L-P05 | Stop release before consumer admission returns current review; stop after admission reports current admitted location without deletion/recall.                               |
| L-P06 | Release receipt commits, UI response is lost; reconciliation returns it, no new decision or conversation.                                                                    |
| L-P07 | Release receipt commits, downstream worker crashes; work remains visible as pending/blocked and durable outbox catches up once.                                              |
| L-P08 | Release queued before cutoff but admitted at exact cutoff fails admission and cannot obtain new D17 lifetime.                                                                |
| L-P09 | Real canonical admission commits strictly before cutoff; stale expiry worker cannot destroy the newly owned active Support source.                                           |
| L-P10 | Body fetch starts before expiry and completes after it; no expired body/HTML/raw source is re-exposed or rematerialized.                                                     |
| L-P11 | Legal/records hold races irreversible cleanup; shared exact guard prevents forbidden destruction while ordinary access remains governed.                                     |
| L-P12 | Missing/currently unavailable preservation decision never becomes false no-hold or successful physical deletion.                                                             |
| L-P13 | Fourteen elapsed days equals 1,209,600 seconds across DST; equality is expired, viewer timezone cannot change it.                                                            |
| L-P14 | Dismiss/reopen/touch/retry/new provider URL cannot move cutoff; schedule extension at/after cutoff cannot revive bytes.                                                      |
| L-P15 | Missing or unqualified receipt creates timing exception, never current-time fallback or fresh confirmation eligibility.                                                      |
| L-P16 | Legitimate fetched empty-body attachment-only input is distinguishable from retrieval failure and remains safely serviceable.                                                |
| L-P17 | Safe body with unavailable/unsafe attachment follows the actual file-owner rule and visibly preserves the unavailable attachment fact.                                       |
| L-P18 | Multiple reasons coexist; approving one human-reviewable reason cannot clear malware/protected/unbound gates.                                                                |
| L-P19 | Destination or source classification changes while review is open; stale release rechecks and blocks/refreshes.                                                              |
| L-P20 | Reviewer loses relevant permission/designation before the authoritative boundary; no new unauthorized release/admission; historical actor remains after completed admission. |
| L-P21 | Last eligible reviewer departs; one body-free coverage signal reaches qualified oversight and accepted input remains discoverable by its actual owner.                       |
| L-P22 | One-input release/dismiss never creates future sender allow/block rule, account verification, persistent routing, consent or CRM mutation.                                   |
| L-P23 | One-input recovery preserves original HTML/text/file evidence under current sanitization rather than plain-text copied replacement.                                          |
| L-P24 | Qualified existing-conversation continuation appends once; unrelated same sender/subject remains independent.                                                                |
| L-P25 | D13 delayed release at 15 minutes or later never confirms; prior excluded/possibly-sent occurrence is not revived.                                                           |
| L-P26 | D14/CRM surfaces show original receipt and actual readiness correctly; reviewer is not author, no new interaction for review state change.                                   |
| L-P27 | Unknown tenant cannot expose candidate subjects/counts; separately authorized platform recovery preserves original custody identity.                                         |
| L-P28 | More than 50 held records and old backlog remain included in authorized totals and pagination; query error is not zero.                                                      |
| L-P29 | Backup restore/index rebuild/provider replay honors restriction journal before read, hydration or release; tombstone does not become content archive.                        |
| L-P30 | Partial provider/storage/backup cleanup reports exact unresolved owner outcome; retry does not reset deadline or restore access.                                             |
| L-P31 | Reviewer UI preserves selected item/focus under concurrent list changes; persistent dismissal correction remains usable after toast disappears.                              |
| L-P32 | Policy/mixed-version rollout cannot grant new writers against old unrestricted readers or delete unknown legacy content using invented timestamps.                           |

## Residual operational controls

These controls are proposed response policy, not measured SLA. Required safety proof comes before monitoring.

| Signal                          | Threshold                                                                          | Owner                                                               | Response                                                                                                                      |
| ------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| No eligible review coverage     | Any enabled inbox with zero qualified reviewers                                    | Tenant Support oversight owner                                      | Assign qualified coverage/backup, retain current input, do not grant blanket body access.                                     |
| Review backlog aging            | Any ordinary item unreviewed 24 hours after first safe availability                | Designated inbox review team; oversight if unowned                  | Review oldest actionable work and fix coverage; no clock reset or batch trust.                                                |
| Imminent unadmitted cutoff      | Any currently retained ordinary item cutoff within 24 hours                        | Designated review team and qualified oversight                      | Prioritize current source decision/custody correction; no automatic release or new lifetime.                                  |
| Lost/duplicate source outcome   | Any confirmed invariant violation                                                  | Intake domain owner                                                 | Fence affected writer, reconcile by original source/decision receipts, preserve accepted input and actual downstream effects. |
| Restriction or cleanup failure  | Any unauthorized re-exposure; or now at/after owner cleanup deadline without proof | Source/security owner for exposure; recorded copy owner for cleanup | Stop affected read/hydration, preserve evidence, replay exact cleanup/restrictions and prove before resuming.                 |
| Restricted exception unattended | Any owner-required finite review date reached without disposition                  | Actual records/security/platform owner                              | Re-evaluate qualified custody/schedule; no auto-release, destructive dismissal or indefinite ordinary access.                 |

## Synthesis and priority

Before recording: settle one-input scope, reason/owner distinction, recoverable Dismiss, honest pending admission, separate14-day ordinary class, immutable receipt clock, expiry/admission boundary and coverage responsibility. These amendments are coherent now; no additional founder question is needed inside this selected decision.

Eventual specification/design order: 1) qualify source/safety/class/holding custody; 2) source-identity and atomic decision/admission/disposal guards; 3) owner-authorized projections and CRM/P6/P17 timing seams; 4) quiet reviewer/oversight UI; 5) migration/canary and proof. Reuse shared work/outbox/restriction mechanisms, not a generic quarantine platform.

Activation safeguards: all current writers/readers must respect source restrictions, real tenant/provider custody must fit the published class, no existing unknown history may be silently enrolled in destruction, and actual concurrency/accessibility/restore/provider evidence must pass. A deployment stop can pause new processing, but cannot extend expired content authority or abandon accepted inputs. Rollback must retain compatible receipt/restriction readers and recovery; it must not restore a bypassing old route or hydration writer.

Operational clock precision: first safe reviewer availability means the original input's first qualified availability to its assigned review lane, not the latest viewer login or regrant. Reassignment, team changes, Dismiss/Reopen and permissions churn never renew that age. Original receipt-to-availability delay remains separately observable. Attention thresholds do not pause the absolute content cutoff.

## Root-draft pressure test, 12 September 2026

This follow-up reviews `work/d19-decision-draft.md`, especially R17–R24 and O01–O08. It does not edit the root draft. **Accept with the following targeted precision amendments.** The root's 48-hour pre-expiry attention threshold deliberately supersedes this independent report's earlier 24-hour suggestion; use 48 hours consistently in the final decision and UX. The 24-hour first-review attention and five-minute pending-release detection are proportionate operating choices, not measured SLAs.

### Material correction A: owner-qualified schedule versus arbitrary finite timer

R19's first sentence correctly qualifies one 14-day default, but “Any authorized finite schedule change” could be read as allowing a tenant administrator to choose any finite duration, including decades. That defeats the purpose-owned class even without a literal Never value. Severity Medium; likelihood plausible implementation interpretation. This narrows configuration rather than invalidating 14 days.

Exact replacement: “Tenant changes may select only the finite variants or bounds explicitly permitted by a current published intake-owned schedule contract. The ordinary proposed contract defaults to 14 elapsed days. A newly proposed duration outside those qualified variants is a records-policy qualification/change, not an inbox reviewer's item extension. Publication shows the prior and resulting duration, exact effective time, existing unexpired impact, applicable earlier ceilings and current preservation exclusions.”

No new generic policy engine is needed. Reuse existing policy owner review/publication. Do not invent broad 1–36500 day inputs merely because an integer is finite. It is also unnecessary to invent seven preset options. The root may publish only the 14-day qualified default at initial activation with any independently qualified existing alternatives; the proposal need not assert that unverified variants already exist.

### Material correction B: bounded unknown-receipt recovery must be genuinely bounded

R19 calls missing receipt a bounded owner-reconciliation exception, but neither its clock nor its review/disposition boundary is stated. This can become indefinite retained input through repeated “needs review,” or a developer may use now as the forbidden original receipt. Severity High; likelihood plausible. This changes only the exception contract.

Small complete option: “Unknown original receipt is a separate restricted Intake timing recovery class. Its first trusted platform acceptance is the reconciliation anchor; if that fact is also unavailable in legacy data, first explicitly recorded restricted recovery admission is a new recovery fact, not a substitute historical receipt. The recovery owner gets attention immediately and must perform its first review within 24 elapsed hours. The ordinary proposed recovery access horizon is no later than 14 elapsed days from that recovery anchor, subject to earlier owner limits. Repeated retry, transfer or review does not renew it. Before that boundary, the owner either proves the original receipt and applies the real original ordinary cutoff, makes a qualified exact restricted-custody disposition under another real purpose, or ends access and enters current no-hold disposal. Missing receipt alone is not a preservation hold. Actual required holds remain restricted under their own review/disposition schedule. Ordinary business release cannot use this recovery anchor to obtain another 14-day lifetime or revive source content whose original authority is shown to have ended.”

This is an explicit product proposal, not a finding that Core currently implements such a class. If a real upstream class already supplies a shorter boundary, bind it instead. The recovery horizon is an upper bound for investigating missing evidence, not a promise that unknown old content is lawfully retained for another 14 days. Actual missing custody authority restricts ordinary access immediately; activation still requires that the owner has authority for this restricted recovery purpose.

Proof to add to P21/P26/P37: trusted platform acceptance known versus wholly unknown legacy date; immediate owner attention and 24-hour missed-review visibility; original receipt recovered as already expired; retry cannot renew; required hold survives ordinary-access cutoff; affirmative no-hold disposal cannot wait forever because the message lacked a date.

### Material correction C: avoid implying Phase 21 owns intake retention

R20 says “Apply D16/P21/P29 owner-qualified restriction, disposal and restore barriers.” ADR0115 makes Phase 21's catalog specific to its own record families, with its private-byte execution seam qualified to Phase 29. D19 cannot automatically classify intake under Phase 21 or assume Phase 29's existing readiness proves a new incoming-mail copy path. Severity Medium; likelihood plausible architecture interpretation.

Exact replacement: “Apply D16's source restriction and restore contract, reusing the platform's actual qualified records/private-byte execution mechanisms. Phase 26/intake retains its source-purpose and schedule meaning. Phase 21's record-family catalog does not become the semantic owner of incoming mail. Qualify the concrete asset, database, provider, index and backup owner adapters before this source class activates.”

The rest of R20 is sound: real admission strictly before cutoff transfers admitted source purpose; redundant raw copies have their transient owner deadline; holds restrict ordinary visibility; provider copies cannot rehydrate.

### Material correction D: make O07's prediction threshold falsifiable

“Backlog predicts missing an active deadline” is an unqualified model claim unless its evidence and budget are specified. Severity Medium; likelihood likely if implemented as an arbitrary dashboard color. Use a source-specific schedulability condition rather than build a forecast product.

Exact replacement: “Any required retained-input task has no qualified scheduled attempt that can complete before its current effective source deadline, using recorded next-attempt time and the release-qualified execution budget; or the budget/scheduling evidence is unavailable; or an accepted input lacks its durable recoverable disposition.” Keep the same platform intake owner and safe response. R26 already requires production-shaped execution budgets, so this adds no new modeling engine. O04 still handles release pending more than five minutes before the expiry condition becomes imminent.

### Small precision additions, no new machinery

- R24: explicitly define first routine-reviewable admission as the source's first qualified availability to the responsible review lane, not a person's first view or latest team assignment. Dismiss/reopen, policy edits and handoff never reset that operational age. Original provider age remains visible separately.
- R18: “Return to review” must reconcile the current admission receipt when response is lost; unknown admission must not prevent independently qualified security containment while reconciliation proceeds. Containment is not undo or disposal.
- R20: disposal after admission targets redundant copy instances, not the admitted source's authoritative surviving bytes. If physical storage is shared, do not delete a blob merely because the intake appearance ended; clear the expired appearance and preserve independently valid owner custody, without allowing that surviving copy to become an old-intake download path.
- O03: dismissed-expired content is historical correction availability, not unresolved business-review backlog. Do not emit missed-review exceptions for deliberately dismissed items; an expired unconsumed release does count as unresolved admission processing. R20's distinct outcomes already support this.

No other material contradiction found in the reviewed R17–R24 state ordering. Release versus expiry at equality, pending-release cancellation, current source fences, D13's immutable 15-minute utility, D14 truthful readiness, CRM no implicit mutation and the Email Studio/P6 seam are mutually consistent after these clarifications.
