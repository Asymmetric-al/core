# D17 independent lifecycle and temporal review

**Independent review input:** The [reconciled D17 decision](phase26-d17-adversarial-review.md) and [final UX](phase26-d17-retention-ux.md) govern adopted amendments. Calendar-unit, pause and other candidate alternatives below are preserved review history, not competing final requirements. D17 amendments remain proposed pending ratification.

11 September 2026. Bounded independent review for the selected A: automatically expire Support content after Support work ends. D1–D16 are ratified. These are proposed D17 corrections for root synthesis, not founder-ratified amendments, implementation, a universal legal interval, or production proof.

## Disposition

**Accept with required amendments.** A is the strongest ordinary model for preserving usable working context without a repetitive deletion queue. It requires a dependable source-purpose clock and current-source availability rule. It must not mean “delete whichever row currently says Resolved and has an old updated_at.” The strongest alternative is qualified human review before ordinary disposal, but that creates recurring workload and review backlog; use human judgment for actual exceptions rather than making every ordinary expired conversation a task.

The design should retain one automatic model, one effective tenant policy, source-owned original identities, the already ratified D16 removal/cleanup mechanism and existing shared workflow/records tasks. Do not introduce per-message expiry clocks for normal active conversation content, a general retention rules engine, a graph of arbitrary holds, or another provider scheduler.

## Verified evidence and interpretation

Repository HEAD used by the root is `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. This review reverified the WSL working directory and read root/API AGENTS, the three canonical grill/domain skills, platform-principles/platform-boundaries, relevant grooming ADRs and clauses, P6 and ADR0031/0032. Source inspection is not a live deployed behavior or RLS proof.

- [Current Support status writer](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L837) writes a new `resolved_at` on every Resolved command. [Incoming message bump](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L643) clears it on inbound reopen and writes general last-message/update timestamps. These projections cannot prove historical retention eligibility. No retention engine was executed or tested.
- Ratified D3-R05 already requires append-only transition evidence and repeated Resolve to be unchanged, with existing mutable snapshots merely projections. D3-R08 admits relevant first-time input by trusted admission order, not an old sender date; it distinguishes automated/quarantined/replayed input. It forbids Resolve from hiding actual Support promises or unreviewed required recovery work.
- D10-R09/R13/R14/R20 preserve original source evidence, current work plans and source-scoped privacy through merge/Undo. A merged-away original is not proof its represented work ended. Persistent Undo must not retain bodies indefinitely or restore expired content.
- D11-R04/R12/R16/R19 distinguish source interests, actual owner work, review and privacy. Independent Finance work can continue after Support has ended; a task’s mere existence is not authority to retain a transcript. An active exact source interest may demonstrate a continuing need.
- D12-R08/R14/R22 and D14-R15 allow original A to be Resolved with `continued_elsewhere` while its actual obligation is handled in B. A bare Resolved test is therefore unsafe. Mere peer/CRM links are neither dependency discovery nor preservation authority; exact transferred work/referral/citation purpose controls.
- D15-R08/R22 and D16 preserve current source restrictions on previews, destinations, retained representations and unsent material. Routine expiry must not generate a new meaningful conversation event, notification storm or reply credit.
- [ADR0031](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/adr/0031-body-free-history-with-expiring-recent-copy.md#L18) makes Recent-copy expiry authoritative immediately even if physical cleanup is asynchronous. Its 7/30/Off policy is not Support transcript retention. Reapply expiry/restriction state before restored content is readable.
- [P6 A17](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-06-shared-communication-event-model.md#L174) and [ADR0032](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/adr/0032-immutable-prepared-message-and-whole-message-recovery.md#L61) govern source fences, actual dispatching, immutable whole-envelope recovery and the earliest frozen material deadline. D17 cannot extend a sealed P17/P6 deadline when the tenant lengthens its ordinary Support policy. Prepared-material authority removal still invokes the existing 24-hour purge ceiling; that is not a new general retention duration.
- [P6 reserved scope](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-06-shared-communication-event-model.md#L300) reserves general pruning/DSAR jobs and written retention policy. D17 must explicitly qualify only the narrow Support eligibility producer and shared cleanup integration needed by this decision.
- [Zendesk deletion schedules](https://support.zendesk.com/hc/en-us/articles/6388012977306-Creating-ticket-deletion-schedules), opened 11 September 2026, document recurring archived-ticket deletion, approximate preview and separate activation; Last-updated conditions can reset from redaction or attachment removal. Adopt recurring reviewed activation; reject reset-on-correction, archived-state imitation and borrowed numeric vendor limits. Zendesk’s report exclusions also show why content disposal must not silently improve Asym’s D14 cohorts. This is documented behavior, not inferred vendor architecture or ministry research.
- [Front deletion policy](https://help.front.com/en/articles/2083), page edited 24 August 2026 and available on all plans, uses last message/comment rather than tagging/archiving, allows inbox overrides and the longest interval among inboxes, and can optionally delete unused contacts. Adopt a meaningful-content distinction and understandable policy effects. Reject longest-associated-inbox wins, hidden trash arithmetic and contact deletion through Support lifecycle. Front’s policy is not identical to the selected after-work-ends model.

## Exact proposed lifecycle contract

### L01 — Unit and source continuity

“Routine retention applies to content owned by an original Support conversation: native message bodies, internal note bodies, source-subject/display content and source-owned file occurrences with their governed alternate representations. It does not delete the CRM person, conversation routing identity, actual communication fact, business result, permitted work history or another owner’s official artifact. Every retained fact/reference still follows its own justified retention and erasure policy; no metadata-forever promise is made.”

“Track current retained content and its original admission frontier. This frontier distinguishes content covered by an expiry from genuinely later content admitted to the same original. It is not a new message-by-message age policy. Already-expired content stays expired when new work arrives.”

Severity High, likelihood plausible: deleting a whole conversation row can cascade unrelated facts or make late old-route mail create a duplicate CRM identity; purging by conversation ID after a new message arrives can erase that new message. This **narrows A’s unit**. Prove old-content/new-content separation, preserved route identity and no CRM/business cascades.

### L02 — Dependable ordinary clock

“The ordinary inactivity anchor is the latest authoritative end of a genuine Support-work episode affecting the retained original content, or later admitted substantive human content in that original, whichever is later, provided no current qualified Support purpose still requires that content. Derive it from protected source/work admission evidence, not generic updated_at, provider event time, mutable resolved_at, browser time, email Date or attachment file modification time.”

“Repeated Resolve, replay, assignment, inbox moves, views/read state, following, labels, links/unlinks, redaction, cleanup, redelivery and provider-status churn never reset the clock. A status-only reopen/resolve correction without a new qualified purpose/content contribution preserves the prior anchor. A genuine new Support obligation can invalidate inactivity; later actual completion starts a new genuine inactivity interval. Do not infer meaningfulness with AI or classify free text automatically.”

“Count the tenant’s chosen interval in explicitly named elapsed days; one elapsed day is 86,400 seconds. Store timezone-aware instants and show local dates with the actual timezone available. Avoid importing business-hour calendars or ambiguous calendar-month/year arithmetic into this retention rule. Equality is due. Changing viewer or tenant display timezone does not move a deadline.”

Severity High, likelihood demonstrated in the inspected mutable projection: ordinary administrative activity can indefinitely extend retention or old sender timestamps can prematurely expire new input. This **changes A’s required clock**. A deliberately published human note is real new content; whether it also changes D3 status remains D3-owned. Draft autosave and edits/removal to existing content do not manufacture new admission age.

### L03 — What substantive input means

“Qualifying new content is a first-time admitted relevant human incoming contribution, a deliberately published human internal note, or a deliberately admitted human outward reply. Existing D3 source qualification excludes spam, quarantine, automated confirmations, duplicates and malicious/unrelated input. Record content admission separately from accepted-for-delivery/delivery; a provider callback cannot make the clock move to callback time.”

“A source-owned required review result can reopen a genuine work episode without copying its body into Support. Its causal evidence must name the exact current source interest or obligation. A mechanically repeated Open command or unrelated owner update is not a new retained-content purpose.”

Severity Medium–High, likelihood plausible. Defining activity as any API update enables indefinite retention; defining it as message direction alone suppresses genuine work and confuses delivery truth. This **narrows the meaning of inactivity** without inventing a generalized event framework.

### L04 — Completion and current purpose are distinct from a label

“Evaluate current source need through the qualified current D3 handling component, exact D11 source interests and source-relevant D12/D14 continuation/referral obligations. A merged-away source or Continued original is not ordinarily disposable while its represented issue still requires its content. Do not retain every transitively related conversation, and do not infer a hold from a CRM link, shared Party, follower, arbitrary task or peer relationship.”

“Preserve original anchors and source provenance through merge/Undo. Topology changes alone do not create new inactivity age. When a real still-owed source obligation is completed in its current home, its authoritative completion can establish the original’s genuine purpose-end evidence. Distinguish this actual completion from the merge, transfer or link that merely moved its handling.”

“Independent owner work may outlive Support. Before ending Support’s remaining source interest, ensure that an owner who still needs necessary evidence has qualified access/custody under its own policy; do not retain a whole transcript just because Finance’s separate action remains open. No generic Keep in CRM, copied transcript, or second records archive.”

Severity Critical for premature loss, plausible under D10/D12. This **changes A’s eligibility**. The finite explicit source-purpose relationships already selected are sufficient; a speculative graph engine is unnecessary.

### L05 — Logical expiry, worker lag and late input

“Once an original content frontier is genuinely eligible and reaches its effective expiry instant, that frontier loses ordinary read/materialization/export/send authority, whether or not a cleanup worker has run. New input, reopening, policy changes and other commands must honor already-reached expiry before considering any new content or future purpose. Cleanup timing cannot grant an accidental retention extension.”

“A qualifying new purpose/input admitted before expiry can invalidate future routine eligibility under the same source guard. At or after expiry, admit genuinely new work and content to the original route without revealing or restoring the expired frontier. A new input may repeat old words as independent new evidence; do not silently reconstruct an erased original or enforce a global text blacklist.”

Severity Critical, plausible race: long worker delays otherwise allow lengthening or new input to revive bytes that the policy said had expired; a late cleanup can erase the new reply. This **changes A’s linearization contract**. Persist content-free expiry/frontier evidence and use it for serving, jobs, replay and restore. Physical bytes may still exist in qualified restricted custody; expired does not mean physically erased.

### L06 — Automatic policy authority versus D16 manual selection

“D17 adds a narrow policy-authorized expiry intent for one original’s qualified retained content frontier. It invokes D16’s current restriction/owner-cleanup contracts. It does not broaden the D16 human redaction command, whose reviewed scope remains one exact original message, nor substitute a mutable search query for D16’s selected content.”

“An automated intent records the effective policy version, source frontier, supporting work/purpose/hold revisions, intended expiry instant, actual acceptance time and stable effect identity. A retry either returns that same outcome or finds changed current eligibility; it cannot create a new independent destructive operation merely because its workflow lease expired.”

Severity High, likely if reused carelessly. This **requires an explicit narrow shared-owner extension**, not a second purge engine or silent conflict with ratified D16-R03.

### L07 — Policy revisions, previews and scope

“The retention policy is versioned declarative authority, with one effective revision for a given original’s classified scope at any instant. Record approving actor, exact scope, interval, treatment of already-retained history, effective time and relevant classification/preservation revision. Draft edits do nothing. Activation is an explicit reviewed command; the preview’s state must still be applicable when it commits.”

“A policy preview describes the recurring rule and estimates current effect at its displayed as-of time; it does not purport to freeze every future message. Count original conversations, message bodies, attachment occurrences and currently eligible content separately if those units are shown. Do not double-count merged originals as both source items and current work rows without naming the units. Unknown classification/holds are shown separately, not included as definitely disposable. The execution path still requalifies each original.”

“An inbox move, source merge or CRM association cannot implicitly lengthen retention or change policy classification. If per-inbox policies are introduced, changing an original’s policy must be an explicit qualified reclassification with the same impact review. Prefer one tenant policy for this decision rather than arbitrary inbox overrides or longest-membership precedence.”

Severity High, plausible. This **changes activation/configuration semantics**. The owner may choose an explicit rule for existing history; the product must not accidentally select a future-only loophole, start all old ages at activation, or run a destructive backfill based on unknown historical clocks.

### L08 — Shortening, lengthening and effective boundaries

“Changes to an active policy apply only from their accepted effective boundary and only to content that still has active retention authority. Lengthening may move eligible future deadlines when its declared scope includes existing retained content; it never revives expired/redacted bytes or relaxes an earlier owner/contract ceiling. Shortening requires an explicit impact review of newly eligible retained history before activation. Its earlier logical expiry and asynchronous cleanup are separately explained.”

“A shortening preview cannot be approved by one actor then expanded through another actor’s policy/scope edit. Use the reviewed policy revision and current activation authority. A later revision invalidates stale scheduled jobs; jobs reload current applicable policy and exact source state rather than trusting the old scheduled payload.”

“Existing P6/P17 sealed deadlines never move later even if the Support policy lengthens. Class/utility/protected-action ceilings continue to apply; a source shortening/privacy stop can only narrow their authority.”

Severity Critical for wrongful destruction/resurrection, plausible. This **changes policy mutation requirements**, while preserving a small UI. The report does not prescribe a universal grace period; effective time and any chosen postponement must be explicit and cannot override a required disposal deadline.

### L09 — Suspension and kill switch

“A safety stop can suspend new automatic disposal admission while a policy fault is corrected, but cannot extend readable authority beyond an already-effective expiry or cancel existing source restrictions, required cleanup, preservation duties or restore barriers. It is not Keep forever. Record the accountable owner, reason and finite review/resolution date.”

“Re-enabling re-evaluates the current rule and backlog with a fresh impact review; it does not issue a new clock from the re-enable date. Policy withdrawal is a governed replacement of prospective authority, not removal of historical receipts or a recall of completed disposal.”

Severity High, plausible. This **narrows suspension** to useful operational control. If the product instead allows routine policy disabling to stop expiry, it must explicitly explain which future horizons change and retain all already-expired restrictions; don’t ambiguously label both operations Pause.

### L10 — Long-open and repeatedly reopened sources

“Open, Waiting, an unresolved task or repeated reopening is not a sufficient keep-forever justification. The policy must provide a finite accountable purpose-review cadence for retained active content. Prefer the tenant’s existing qualified records-review cadence; if none exists, the selected ordinary retention interval can supply the initial review cadence rather than adding an unrelated new schedule engine. Activation must visibly include this behavior.”

“A review records the exact retained source scope, real current purpose/owner and next review date. Confirming a need preserves only still-available necessary content; it does not reset original admission evidence, resurrect expired content or erase the review trail. Reviews use existing shared Mission Control task/attention, with one deduplicated duty per source/cycle; ordinary active work receives no per-message prompts.”

“Missed purpose reviews are explicitly overdue owner work, not proof of lawful retention or a reason to automatically Resolve/delete an active support case. The records/privacy owner must settle the current disposition. Real mandatory maximum retention/erasure deadlines still override routine ongoing-purpose claims.”

Severity High, plausible operationally. This **narrows A’s retention promise**: A bounds ordinary resolved inactivity, not a universal maximum lifetime of every active conversation. Monitoring and accountable decisions are required; claiming both unlimited ongoing access and guaranteed total-age disposal would be contradictory. A finite review date with a named owner/response is more proportionate than a second automatic hard-delete mode disguised as A.

### L11 — Preservation and authority races

“Hold changes, source purpose changes, policy activation/reclassification and destruction must serialize through the applicable authoritative guard. A current authoritative no-hold result can permit the normal rule; an unavailable check cannot. An applicable hold that wins before physical destruction preserves still-existing required bytes in qualified restricted custody, even if ordinary read authority has already expired. It does not restore ordinary Support visibility.”

“Hold release resumes the still-valid underlying automatic disposal obligation after checking current policy, source scope and remaining holds; it does not restart the ordinary period or create a reveal window. A hold arriving after irreversible destruction records the actual ordering and cannot restore what is gone.”

Severity Critical, plausible. This **preserves D16’s guard and truthful custody**. A legal hold is not a generic per-conversation Never toggle, and privacy/data-subject deadlines remain separate owner duties.

### L12 — Outgoing effects and useful drafts

“Scheduled/prepared/draft material does not indefinitely retain source content. Actual outstanding Support promises and required recovery work participate in qualified purpose eligibility; an abandoned draft is not an ongoing-purpose exemption. Before source authority ends, normal authored safe draft text may remain under its own qualified draft policy, while obsolete source-derived quotes/files are removed or made unavailable and must be freshly reviewed.”

“Expiry before P6 dispatching suppresses affected unstarted submission/replay. Dispatching that already won is in flight; retain body-free exact provider evidence and obey D16/ADR0032 without recall, envelope rewrites, rekeying or blind replacement. Expiry cannot make an unknown send safe to resend. No automatic requester/follower email announces healthy routine content expiry.”

Severity Critical for disclosure/duplicates, plausible. This **requires shared source guard conformance**, not provider side-effect work inside a database transaction.

### L13 — Recovery, migration and restore

“Use additive source availability/frontier and policy evidence before any destructive activation. Backfill only proved source identities and purpose-ending timestamps. Unknown historical state remains a named qualification exception with owner and finite review, not age zero, silently ancient, or automatically retained forever.”

“Deploy compatible readers, writers, jobs, exports, notification/preparation paths and restoration gates before enabling automatic expiry. Old workers lacking the contract cannot claim protected work. Recovery scans are tenant-fair, bounded and indexed; they discover overdue logical expiry and outstanding D16 cleanup without replaying deleted payload.”

“Preserve current expiry/restriction evidence outside the snapshot rollback horizon. Restore must reapply current policy/expiry/hold/source state before data becomes readable, exportable or sendable. Rolling back a policy screen or job cannot roll back expired-content authority. Use safe roll-forward after irreversible disposal.”

Severity Critical, plausible. This **changes rollout gates**, not authority to implement now.

## Lifecycle examples to prove

These are independent reasoning cases and required release tests, not executed implementation tests. Use synthetic content and actual owner seams when implementation is authorized.

| Case                                                         | Expected outcome                                                                                                                           |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Resolved twice with no intervening work                      | One genuine resolution episode; unchanged expiry anchor.                                                                                   |
| Redact a paragraph two days before routine expiry            | Selected content removed now; ordinary remainder deadline unchanged.                                                                       |
| Tag/move/follow/link repeatedly                              | No renewal or policy substitution.                                                                                                         |
| New relevant human input before expiry                       | Admit once; new genuine work interrupts inactivity; duplicate webhook has no further effect.                                               |
| Old sender Date, first Core admission now                    | It is current admitted work; do not backdate its retention to the forged/old Date.                                                         |
| New note published while status remains Resolved             | Its real content-admission time is recorded; it may extend ordinary inactivity without fabricating an Open/Resolved episode.               |
| Pure status correction Open then Resolved                    | Preserve prior content/purpose age; no fabricated fresh lifetime. Genuine new reviewed duty is a distinct causal episode.                  |
| Due instant equals read or policy-lengthening time           | Already-due old frontier is unavailable; later policy cannot rescue it because cleanup was late.                                           |
| New reply arrives after logical expiry but before purge      | Old frontier remains unavailable; new reply is admitted and survives the old purge.                                                        |
| Hold arrives after logical expiry before physical purge      | Still-existing required bytes preserved in restricted owner custody; no ordinary reveal.                                                   |
| Hold released after the old due date                         | Requalify/resume eligible cleanup; do not add a new full retention interval.                                                               |
| A continued_elsewhere to active B                            | A content needed by exact transferred work stays under real qualified purpose; A’s Resolved label alone cannot dispose it.                 |
| A merely related to active B                                 | Mere relationship does not suspend A’s expiry or retain all B-related graph members.                                                       |
| B merged into A, then Undo                                   | Original content/purpose/expiry evidence survives; no old bytes restored and no cloned records. Current actual work plans are requalified. |
| Finance task open after Support obligation ends              | Retain only what the Finance owner independently needs under actual owner authority; no automatic blanket Support transcript retention.    |
| Shortening/extension/hold edits concurrent with stale worker | One authoritative ordering; stale policy payload cannot delete newly protected content or revive expired content.                          |
| Two workers and a lost response                              | One original/frontier effect; receipt reconciles; later native content not swept.                                                          |
| Source expiry while a sealed batch is indeterminate          | Follow immutable whole-envelope outcome/recovery; no split, rekey or new replacement send.                                                 |
| Restore a pre-expiry backup                                  | Expired frontier denied before serving or sending; new lawful content and unrelated official records remain correct.                       |
| Expire content used in a D14 report/CRM row                  | Permitted fact cohort remains honest; obsolete title/snippet disappears, no fake completion, no metric improvement or new Activity event.  |

## Additional operational signals

Adopt D16’s existing six cleanup/security controls rather than duplicate them. D17 needs a small additional eligibility layer:

| Signal / threshold                                                                            | Owner                                | Required response                                                                                                              |
| --------------------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Any content read/materialization/send authorization after effective expiry: 1 confirmed event | Security + affected content owner    | Contain the path, preserve content-free evidence, fix current-authority gate before re-enable.                                 |
| A past-due eligible original has no durable expiry/cleanup intent for 15 elapsed minutes      | Support engineering on-call          | Diagnose recovery scan/admission, reconcile original frontier idempotently; access already denied, so no extension is granted. |
| Missing policy/hold/purpose classification owner: 1; recorded review date missed: 1           | Tenant records/privacy administrator | Assign accountable owner or resolve overdue disposition; do not assume permission, destroy unknown evidence or silently renew. |
| Any stale-policy job changes current content authority: 1                                     | Support/platform release owner       | Suspend unsafe new admissions, preserve existing barriers/cleanup and repair the guard.                                        |

Thresholds above are proposed engineering controls, not observed performance or legal grace periods. Any earlier applicable owner/legal obligation wins.

## Minimal final path

1. Record the selected ordinary after-work model and these exact lifecycle qualifications as proposed amendments; preserve D1–D16.
2. Establish policy scope, source purpose-end evidence and original content frontier; explicitly reconcile P6’s reserved generic retention jobs and D16’s manual one-message command without broadening either by implication.
3. Specify one qualified automatic producer plus the D16 restriction/cleanup contract, independent legal/records custody, current-source read/send authority, policy mutation semantics and truthful UI.
4. Require real concurrency, source-intake, hold, late-input, merged/continued/delegated-work, policy-edit, restored-backup and existing-history tests before any tenant activation.
5. Monitor only operational lag and qualification exceptions after correctness gates pass. No monitoring substitutes for no-resurrection, tenant scope, current authorization or required owner preservation.

No source/runtime/schema/external changes were made by this reviewer. No browser, DB, RLS, provider account, capacity or legal-applicability result is claimed. Relevant memory guidance was used only for grill and stage boundaries (MEMORY.md lines431 and241); root’s final citation may include the existing same entries.

## Final reconciliation with root's proposed contract

These refinements make the recommended clauses above precise where implementation shortcuts could otherwise create a contradiction.

1. **One deterministic clock:** `anchor = max(last genuine source-purpose completion, last first-time durable native human-content admission)` when the original has no current qualified ongoing purpose. Human reply activity is the qualified Core command that admits a deliberately reviewed reply for sending, not a draft save/preparation, provider delivery callback or uncertain accepted-for-delivery timestamp. The source can contain genuine human-authored pending-send content before delivery truth is known; D14 response credit still requires its separate P6 acceptance evidence. Do not reuse D14's metric boundary for D17 content lifetime. A note deliberately published after resolution can update the content anchor without a fabricated D3 Open/Resolved episode.
2. **No hidden semantic classifier:** human publication/input admission provides observable activity, not a claim that each note's prose is useful. Repeated human notes can extend ordinary inactivity under A; the oldest retained content review below prevents silently equating chatter with a permanent purpose. Automatically generated/system notes, edits to old content, redaction, retries and source-independent administrative work do not create a new content age.
3. **Immediate policy changes with temporal truth:** an explicit activation at server instant `E` applies its reviewed rule to existing and future unexpired content. If the old effective deadline was `d <= E`, that old content is already expired; extension cannot rescue it. If `E < d`, a valid extension can govern even when its projection update runs after `d`. Readers and workers must consult authoritative policy-version applicability instead of falsely expiring from a stale materialized deadline. A shortening may make content due at `E`; review must state that effect. No backdated activation or mass-row-update completeness assumption.
4. **Policy preview authorizes a rule, not a row manifest:** one exact reviewed scope/rule/revision with an as-of impact snapshot, units and exceptions is sufficient. Requalification at each source remains required. A giant immutable enumeration of all future deletion targets would be both brittle and unnecessary.
5. **Preservation is not extended ordinary visibility:** a legal hold by itself never changes the Support inactive clock or normal expiry. At the ordinary deadline, source content becomes unavailable to ordinary users while required still-existing bytes are held in qualified restricted custody. Qualified custodians can see a neutral expiry/preservation distinction. Only actual ongoing Support purpose can defer the after-work eligibility; mandatory owner ceilings still dominate.
6. **Bounded pause is a distinct policy change:** if offered, Pause future expiry until a reviewed finite date is a qualified prospective policy revision affecting only not-yet-expired content. It cannot override mandatory deadlines, revive expired content or stop existing D16 cleanup. Distinguish it from an engineering stop of new destructive worker admissions, which changes no logical read deadline. UI must not use one ambiguous Pause label for both operations. A bounded pause is optional convenience rather than required A capability.
7. **Proportionate active-purpose review:** use the same approved retention interval to trigger the first review from the oldest still-retained content's admission. New chatter, edits, moves and repeated reopening never move that oldest-age review threshold. If actual ongoing work prevents ordinary expiry at that threshold, admit one deduplicated source-purpose review through shared Mission Control work. The qualified owner either records a current need and next review no later than one approved interval ahead, ends the actual remaining Support obligation, or directs necessary evidence into qualified owning-domain custody. An overdue review requires the records/privacy owner to act and never silently auto-resolves or erases a live case. One threshold/date can be projected per original; no per-message timers or alerts are needed.
8. **Units:** elapsed days alone are the smallest dependable contract. If root adopts months/years for administrator usability, use a pinned explicit UTC calendar convention with end-of-month clamp, calculated directly from the original anchor each time. Do not repeatedly add months (`Jan31 → Feb28 → Mar28`) and drift from the intended original anniversary (`Mar31`). Zone changes must remain display-only. Show a concrete expiry example before apply and test leap/end-of-month/equality boundaries. This is arithmetic implementation complexity, not a reason to borrow D14 service calendars.
