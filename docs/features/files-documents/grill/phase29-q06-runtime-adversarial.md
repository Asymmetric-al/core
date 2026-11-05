# Phase29 Q06A — completed request, bounded current read access

Read-only runtime/schema review, 20 October 2026. Checkout `/home/conrad/code/core`, HEAD `3d85897ebf1515008ef5c676b1c58a15422fb9ab`. Conrad selected normal read-only completion: ordinary submission/correction ends, while currently authorized current-file reads, status and Q05 history remain until the source's separately governed read boundary ends them. No numeric access period was selected.

This note supports the adversarial amendment package. It does not implement or qualify the generic request lane. Source, nearby migrations and selected existing unit tests were inspected. No credentials, private rows/file bytes, provider changes, dependency changes or product edits. Parent owns canonical decision records.

## Conclusion

The selected behavior is coherent only if **source work state, operation permission, identity session and custody state remain distinct**. A completed source request is not an active upload grant; a valid login is not current request authority; a worker lease is not a human read entitlement; retained bytes are not a promise of access.

The current repository has useful fail-closed controls, trusted identity resolution, stale-auth-response handling and terminal-effect convergence. It also has task/PATCH/default-state and callback patterns that must not become the generic completion state machine. No reached current route supplies the new completed-request participant capability by itself.

The minimum permanent design is the existing native source command and exact member/revision model, with independently derived current read versus submission/correction actions under the existing PDP, Q02/Q04 private delivery and Q05 metadata projection. It needs no new permission engine, archive service or generic workflow state-machine product.

## Accepted source facts to preserve

- Q01 requires current source/request authority for protected operations, finalization, processing promotion, result recovery and separately admitted reading; it separates browser session end, worker authority, participant access end and retained evidence (`docs/features/files-documents/docs/adr/0001-confirmed-recipient-private-document-requests.md:49–56,80–87`).
- Q03 admits a correction only under current source authority for the exact eligible item. Finalized-byte admission atomically records receipt/relation/review-set change and fences predecessor candidacy **before** optional hygiene/preview completion. Failed successor checks do not revive the predecessor (`0003-recipient-corrections-and-exact-review-lineage.md:18–33,43–54`).
- Q04 binds the selected original to a qualified immutable copy before emission, reauthorizes new reads and preserves expiry/in-flight rules. Completion cannot turn a stale predecessor URL into historical access (`0004-submitted-original-download-and-current-source-authority.md:19–46`).
- Q05 permits minimized source receipt/correction history, not old-file content; history and current-file views must be coherent or explicitly unavailable, and cannot independently grant currentness (`0005-current-files-and-participant-submission-history.md:19–47`).
- P12 governs egress, tiered audit/budget and long-stream expiry checks per chunk. Its managed-realtime 60-second allowance is not a file-download grace period (`docs/prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1643–1655`).
- P26 treats already-authorized transfer as in flight, stops new grants at restriction and terminates where feasible; delivered local bytes cannot be recalled (`docs/features/support-hub/grill/phase26-d16-adversarial-review.md:118–120`).

Q06 applies to **normal source-authorized completion of the document request**. It does not decide adverse cancellation, source withdrawal, privacy restriction, reassignment or every business-domain close event. It cannot certify the wider application, expense claim, donation or legal outcome merely because requested document work is complete.

## Current runtime: evidence and reuse limits

### 1. Completed task reading exists, but generic task status is not a protected request transition

`packages/api/src/missionary-portal/service.ts:252–275,295–312` reads tasks under profile/task scope without excluding completed status. This illustrates that “complete” and “readable” are not universally coupled.

`packages/api/src/missionary-portal/task.ts:25–58,81–97` accepts a status PATCH and sets completed_at when completed, clearing it otherwise. It does not supply the proposed native request closure/correction compare-and-set or immutable evidence-set selection. Reusing it as the document request endpoint could make ordinary completion freely reversible.

`packages/api/src/missionary-portal/model.ts:261–276` maps a missing status to `"not_started"` (`271`). That is a specialized presentation default. **Unknown source state or permission must not become active/not-started/uploadable/readable in Q06.** An existing DTO's default is not an access policy.

No claim is made that the current task route is a deployed document-request vulnerability. Its semantics simply do not qualify the new lane.

### 2. Support completion/reopening follows conversation semantics

`packages/api/src/admin/support-hub/adapter/supabase.ts:849–858` writes resolved state/time, while current scoped reads at `738–751` do not use that state as a read ban. The route gate remains staff/admin (`route-helpers.ts:31–74`).

The same adapter reopens a resolved conversation on an inbound message (`655–662`). Do not copy that behavior into a completed document requirement: visiting, downloading, asking for help, a later scan result or an email reply cannot implicitly authorize new uploads or undo acceptance. A separate source-defined correction opportunity may exist, but Q06 does not create a generic Reopen command.

### 3. Useful fail-closed pattern: exact current governance and qualified evidence

`packages/api/src/eve/dynamic-workflow/control.ts:18–56` refuses missing governance, blocked domains, prepared/current governance-version mismatch, blocking context conflict, missing required approval and any policy decision other than allow. This is a useful decision-result pattern: absence/unknown authority does not fall back to active.

`packages/api/src/generated-documents/purpose-catalog/availability.ts:65–148,232–305`:

- Requires exact purpose identity and valid/nonfuture qualification time.
- Rejects expired or invalid supplied expiry and unrecognized qualification outcomes.
- Keeps unknown purposes absent and failed qualification checks dark.
- Uses its own qualified freshness fallback when expiry is absent.

These are **specialized governance/official-document controls**, not the native request PDP or a post-completion duration. Reuse fail-closed handling and typed outcome separation, not their policies, freshness intervals or source identities. “No configured read-end policy” cannot silently adopt one of these unrelated defaults.

### 4. Agent runtime completion is not source completion or a terminal callback fence

`packages/api/src/eve/dynamic-workflow/state.ts:37–61` checks executable prepared/running state and ticket expiry before dispatch. Its successful-completion reducer (`112–128`) instead finds a known call ID, marks its step completed and recomputes the overall state. It does not check the current overall terminal/cancelled status before doing so.

The actual hook `packages/eve-runtime/agent/hooks/subagent-audit.ts:223–236` invokes that reducer on a completion callback; turn cancellation at `275–278` sets the dynamic state cancelled. This is source-confirmed state-code behavior, **not a reproduced production incident or proof of request reopening**. The selected tests below do not exercise cancelled-then-late-completed ordering.

The implication for Q06 is narrow and important: a technical callback must never be the authoritative “request fulfilled/reopened/access restored” transition. A source-specific callback must bind its exact admitted operation/member/version/epoch and apply only an allowed monotonic technical result. Unknown/duplicate/stale callback delivery cannot reset a completed request or revive an old file.

The agent hook's `context.session.auth.current` is an **agent runtime session context**. It is not evidence that a document worker must keep the recipient's browser session alive. Q01's independently admitted source-worker authority remains distinct.

### 5. Existing terminal-effect convergence gives a useful bounded pattern

`packages/api/src/admin/contribution-operations/store.ts:368–457`:

- Returns without changing state when the loaded attempt is not a finalized pending linked attempt (`375–385`).
- Loads the exact correction under tenant/donation (`389–396`).
- Does not rewrite a conflicting terminal correction (`404–407`).
- Changes only pending correction state (`420–428`) and then changes only the pending attempt outcome (`437–449`).
- Deliberately performs the attempt update second so a partial failure can converge on retry without overwriting the terminal correction (`437–439`).

This is meaningful source-specific monotonicity/recovery precedent. It is two coordinated writes, not an atomic generic completion/correction transaction or real concurrency proof. A no-row compare-and-set may fail and require re-read/reconciliation. The financial meaning must not be generalized into document acceptance or used to change posted financial truth.

### 6. Work claims coordinate execution; their lease is not permission

`packages/api/src/workflows/claims.ts:7–38` uses a default 300-second work lease. `supabase/migrations/20260611181000_workflow_work_claims.sql:8–29,45–99` declares one active claim per tenant/subject, expires stale claims and attempts an atomic insert. Release updates an active claim (`103–121`); execution is service-role only (`125–133`).

This prevents some concurrent execution attempts and supports recovery. It does **not** prove current participant permission, source completion eligibility, exact submitted version or stale-worker promotion fencing. A lease expiring can allow another runner; the old runner's late result must still meet the source operation's epoch/version/transition rules. Neither lease lifetime nor worker ticket expiry may define the recipient's read period.

The workflow dispatch ledger likewise records handoffs, not source business completion (`20260611134500_workflow_dispatch_ledger.sql:29–37`; `packages/api/src/workflows/ledger.ts:112–175,184–245`). Its pending/failed compare-and-set is useful, but delivery success cannot mean all request items were accepted.

### 7. Eve artifact expiry separates metadata and body reads, while coupling expiry to retention

`packages/api/src/eve/retention/control.ts:157–178` requires owner/tenant/available/unexpired before issuing a signed URL. `store.ts:109–150` lists authorized metadata/status/expiry without the same available/unexpired body gate. This demonstrates different read projections.

The migration derives artifact expires_at from its retention category (`20260718022535_eve_retention_replay_tracer.sql:185–205`), and cleanup checks expiry plus hold/lease state (`373–447`). This is intentional specialized replay-artifact lifecycle, not a universal relationship between participant access and custody. A hold prevents qualifying cleanup; it does not make the body-read expiry predicate pass.

The app evaluates available/expiry before separate URL issuance and then returns a reusable 60-second storage bearer URL. That is not the Q04 source-rechecking gateway and cannot be treated as immediate read revocation. Q06 must not reuse its duration, schema field or retention coupling just because the file is private.

### 8. Session handling has real cleanup/failure controls, but does not renew request authority

`packages/auth/context.ts:249–301` verifies the user and derives profile/tenant/membership identity under caller authority. Those trusted identity facts are useful; they do not implement the Q01 request-recipient grant. Role membership is not completion-read eligibility and must not be broadened to accommodate the new surface.

`packages/auth/client-session.ts:56–82,131–188` clears cached queries on sign-out/user switch and prevents late profile loads from overwriting newer auth state. Reuse the version-fencing idea for completed-request/context reads; do not claim the repository lacks all cleanup.

`client-session.ts:203–238` first awaits server sign-out confirmation. On server failure it reports failure and does not claim successful logout; on success it attempts local cleanup, clears QueryClient and redirects. `client-signout.ts:18–38` similarly distinguishes server success/failure.

These are not live revocation proof. A client cache clear does not revoke request grants, cached provider URLs or already emitted bytes. Reauthentication may establish a new valid identity session, but cannot extend the source's read boundary, reopen work, restore a superseded file or grant previous-recipient history. A still-valid identity token cannot bypass an expired/revoked source entitlement.

### 9. Current metadata/cache/error precedents still need source qualification

The Q05 runtime review established exact nearby behavior at the same checkout:

- Support's optional private-message filter runs after fetch/cache (`use-support-messages.ts:50–62`).
- Its timeline can interpret missing rows after error as empty (`ConversationTimeline.tsx:27–35`).
- Current query defaults/stale times and user-switch cleanup do not encode request-recipient source epochs.

These remain unsuitable for completed-request metadata. A completed banner itself can reveal protected existence/outcome. Apply current source permission before history/status/file metadata, counts, caches and serialization; no assumption that metadata is safe because no file is returned.

Likewise Q04's exact serving findings remain relevant: receipt route is buffered generated output, Payload Blob is public-media streaming, and current generic error helpers do not automatically apply every private header. Completion cannot bypass those qualification requirements. See `outputs/phase29-q04-runtime-adversarial.md` for exact route/installed-package references; no old test count is credited here.

## Required completion boundary

Normal completion must be a source-owned transition over the exact relevant requirement/member set and source revision. It cannot be a client PATCH to completed, an aggregate “all uploads finished,” renderer readiness, an empty task list or the latest worker callback.

The permanent source behavior should enforce:

1. **Submission/correction fence:** after source completion, new ordinary admission/finalization/correction for that closed scope is denied. An earlier upload grant or started transfer does not preserve a late admission right.
2. **Previously committed facts survive:** a correction that was durably admitted first remains admitted and changes the relevant review set under Q03. A stale completion command cannot ignore it or pretend its predecessor remained current.
3. **Completion wins first:** a later unadmitted correction cannot change the completed review/evidence set. Any already staged bytes receive the source's truthful custody/recovery/disposition outcome; do not invent acceptance or delete retained evidence automatically.
4. **Exact source concurrency:** compare the expected current member/review set and relevant source revision, not only a shared status string. Both old and new versions may have the same status, so a pending check alone is insufficient.
5. **Idempotent completion:** retries/lost responses recover the same durable source outcome under current disclosure authority. They do not append another completion, reset a time window, reopen eligibility or send duplicate messages.
6. **Allowed read scope survives only deliberately:** Q06A continues the independently authorized current metadata/preview/original actions; completion does not widen them to old predecessors or unqualified current content.
7. **No implicit reopen:** help, sign-in, read retry, later technical result, an incoming message or policy re-evaluation cannot set work active again. A source-approved successor opportunity is a distinct governed action where the owning domain permits it.
8. **No stale result promotion:** callbacks/worker completions bind exact operation and source epoch/version; record a permitted terminal technical result or reconcile safely, never rewrite current membership or source completion from callback arrival order.

This does not mandate a new schema, global sequence or generalized event engine. It states invariants the native owner must implement and prove using its admitted commands and existing data layer.

## Server read authority versus source-worker authority

| Situation                                           | Participant path                                                                             | Worker/custody path                                                                                                           |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Normal completion, read entitlement valid           | Show only qualified current files/status/Q05 history; no ordinary submit/correct             | Previously admitted source work may continue only under its own current authority and exact subject                           |
| Browser/auth session expires                        | Reauthenticate through Q01-compatible flow; re-resolve source rights                         | Session expiry alone does not cancel independently admitted source processing                                                 |
| Source read entitlement expires/revokes             | Deny new affected metadata/content/recovery reads; no silent renewal                         | Read expiry is not automatically deletion or every worker stop; source contract decides permitted processing                  |
| Source withdraws/restricts promotion                | Deny affected actions/projections                                                            | Fence result promotion/processing where required, even if task has a valid technical lease                                    |
| Preview expires or checker is unavailable           | Truthful per-representation unavailability; original only if independently allowed/qualified | A new rendition may be generated only under qualified current source/worker authority; no broad re-upload or source reopening |
| Original missing, restricted or integrity uncertain | No substitute/public fallback or false “complete means available” claim                      | Exact-copy repair under custody/source authority; preserve factual completion and safe diagnostic evidence                    |
| Retention hold after access ends                    | No ordinary access restoration                                                               | Preserve obligated bytes/facts under the hold; do not mistake retained for readable                                           |

Business completion, session timeout, invitation expiry, access expiry, worker lease, rendition lifetime and retention remain separate clocks. Numeric values observed in specialized code are not Q06 policy.

Before activation the ordinary profile must have a concrete, qualified access-ending policy and server evaluation mechanism. Unknown/missing/invalid policy or time data cannot mean active forever. Do not create a duration during implementation by borrowing receipt/export/replay defaults. A known effective boundary is evaluated using trusted server/source time; browser countdowns are explanatory, not authoritative.

An earlier valid read decision is not an unlimited streaming lease. Q04/P12 require current gate sequencing and per-chunk expiry for long streams; source restriction stops new grants and terminates in-flight delivery where feasible. A subsequent HEAD/range/conditional/resume is a new read. Prevent mixed-version transfer and metadata leakage before conditional responses.

Once bytes have been emitted, an interruption cannot erase partial local files or retroactively change them. Abort/truncate safely; do not append JSON/login/error content under the original filename or claim saved/completed. Original identity must be established before emission; a digest obtained only at the end is detection rather than prevention.

## Material risks to incorporate

Impact/likelihood are prospective design assessments, not claims of deployed generic defects.

| Failure                                                     | Impact / likelihood                                 | Necessary correction                                                                                                      |
| ----------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| One `completed` flag drives submit and read alike           | High / likely under naive reuse                     | Derive each action under current source authority; work completion is an input, not a universal permission                |
| Unknown source state defaults to not_started/active         | High / concrete nearby mapper pattern               | Explicit unknown/unavailable outcome; deny dependent operations without fabricating state                                 |
| Old upload/correction wins after completion                 | High / plausible                                    | Exact source transaction/revision/member fencing at final admission, not only at upload grant creation                    |
| Late callback changes completed/cancelled to running        | High / nearby reducer has no terminal guard         | Source-owned terminal transition rules; exact operation binding and monotonic late-result handling                        |
| Login/session refresh renews source entitlement             | High / plausible                                    | Reauthenticate identity, then independently resolve current request grant and read policy                                 |
| Worker lease is treated as source permission                | High / plausible                                    | Recheck current source promotion/operation authority; lease only coordinates execution                                    |
| Completion unexpectedly revokes all read despite selected A | Medium–high / plausible                             | Preserve the declared qualified ordinary read scope; do not implement A as a permanent unavailable placeholder            |
| Completed banner/history leaks revoked source facts         | High / plausible                                    | Metadata row/field/count gating and cache isolation before disclosure, including errors/conditional paths                 |
| Signed URL/cache survives source access end                 | High / concrete unsuitable nearby approach          | Qualified private gateway and alternate-path containment; no source TTL inferred from provider token lifetime             |
| Retention/deletion follows access or task end automatically | High / plausible                                    | Independent custody/hold/source obligations; neither read extension nor automatic disposal                                |
| Read error changes business status or prompts re-upload     | Medium–high / concrete adjacent empty/error pattern | Separate source completion, transient availability, unavailable authority and access-ended states                         |
| Completion retry resets access window or sends again        | High / plausible                                    | Stable semantic completion identity, safe result recovery and owner-governed communication effects                        |
| Cached pre-completion UI still permits correction           | High / plausible                                    | Invalidate/fence stale responses; server rejects now-forbidden mutation even if an old button remains momentarily visible |
| Access-end worker/scheduler fails and reads continue        | High / plausible                                    | Authoritative read-time expiry/policy check; background jobs clean up/notify but are not the sole denial mechanism        |

## UI and recovery consequences

A normal completion screen should name the narrow outcome: **This document request is complete**, with a source-approved explanation that no more submissions are needed. It must not imply broader application/claim approval. Preserve allowed current-file actions and concise history; omit upload/correction controls rather than displaying an active-looking form that always fails.

If the person returns after a session timeout, guide them through the existing safe identity flow. Do not prefetch/download the private file automatically on sign-in return. After reauthentication, the source may still allow read, permit metadata only, or deny access; a previously visible completion screen is not authority.

If read access ends, use only the safe source-approved outcome/help context. A privacy restriction may require uniform unavailable wording rather than revealing the request's completion or the reason access ended. “Access ended” is not “your document was deleted.” A valid completed state can coexist with temporarily unavailable content/history; distinguish those cases without exposing private diagnostics.

Expose an access-end date or condition only when the qualified source policy supplies it accurately. Do not display a fabricated countdown, promise permanent access, silently extend it on activity or turn a missing value into “no expiry.” Announcements, help routes and notifications remain within existing owners; Q06 alone does not authorize new messages/reminders.

Keep source status/history and current-file representations coherent or explicitly refreshing. A late earlier response cannot replace the completed state with an active one. Preserve focus and safe in-memory user context when a completion race rejects a pending correction, without falsely reporting acceptance or offering an unauthorized reopen.

## Database and privilege proof

No generic native completion/readback schema or deployed RLS has been qualified. Existing task/workflow/retention migrations are examples, not authority to reuse their roles/grants/state enums.

The later source implementation must prove:

- Trusted admission actor, tenant, request/item/member and recipient authority references; no caller-supplied identity/clearance/current-state fields.
- Immutable receipt/correction facts and governed completion decision; exact same-scope references, permitted old/new transitions, expected review-set/revision checks and semantic effect uniqueness.
- Read versus mutate predicates under actual anon/authenticated/scoped-worker/service roles, views/RPCs and storage paths. Browser hiding is irrelevant to write denial.
- Effective policy composition and function/table ownership. Omitted WITH CHECK may inherit USING; SECURITY DEFINER is not synonymous with RLS bypass. Inspect actual FORCE/BYPASSRLS/owner/grants and triggers rather than keywords.
- Source clock/epoch evaluation before read and finalization, plus the qualified long-stream mechanism. A scheduler toggling a flag later is not sufficient to enforce expiry.
- Mixed-version writers, legacy URLs, restored metadata/cache/object state and historical result replay cannot reopen completed work or restore ended reads.

A source transition and durable effect/history intent must agree atomically where required. A shared log helper, a successful event send or a worker claim is not proof of that transaction.

## Focused tests actually executed

**12 selected existing tests passed; 45 other cases intentionally skipped by name filter**, across three files. Vitest **5.0.3**, reported duration **1.93 seconds**. This is a filtered run, not 57 passing tests or full-suite qualification.

| File                                                                            | Executed scope                                                                                                                                                    | Proof limit                                                                                                                                                                    |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tests/unit/auth/client-session.test.ts`                                        | Eight client-session cases: load/no-user behavior, stale auth response, user-switch query clearing, server-signout failure and confirmed-success cleanup/redirect | Mocked Supabase/auth/cache/server callback; no live cookies/token revocation, browser multi-tab or request-grant proof                                                         |
| `tests/unit/packages/api/admin/contribution-refunds-dependency.test.ts:510–621` | Two parameterized pending-to-terminal convergence cases and one duplicate terminal monotonicity case                                                              | In-memory query stub, specialized financial subject; no DB locking/RLS/concurrent transactions or generic request completion                                                   |
| `tests/unit/packages/api/eve-dynamic-workflow.test.ts:368–441`                  | One case asserting allow, approval requirement, context conflict, governance-version mismatch and active/dynamic kill-switch denial                               | Pure control fixtures. Despite its broad test title, it does not separately execute null-governance/unknown-policy inputs, ticket-expiry or late completion after cancellation |

The test name filter was:

`client session|converges a linked pending attempt|keeps terminal attempt|fails closed on governance`

Execution reused the established secure pattern: `env -i`, only synthetic test URL/anon key, Node24.21.0, `bwrap --ro-bind / / --unshare-net`, memory-backed `/tmp` and Vite temp, `.env.local` replaced by `/dev/null`, Vitest `--no-cache --no-file-parallelism --reporter=dot`. No network/provider call or product write was possible. The existing Vite future-native-loader warning was informational.

Missing-governance/unknown-policy denial is **source-confirmed** in the control helper, not separately proved by the selected test. The late-callback concern is static evidence only. No earlier Q01–Q05 suite was rerun or credited here.

## Required future proof before enabling completed-request readback

| Area                       | Essential adversarial cases                                                                                                                                                                                     |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Normal completion          | Exact source completes the intended request/member set; reads remain only as selected; no inferred wider acceptance, upload progress completion or task-list shortcut                                           |
| Operation split            | Direct upload-grant/finalization/correction/reopen endpoints denied after the cutoff while independently permitted metadata/preview/original reads succeed                                                      |
| Completion/correction race | Both orders, duplicate commands, same status/different member set, lost response, in-flight transfer and earlier durably admitted correction; exactly one allowed source outcome, no silent predecessor revival |
| Late processing            | Duplicate/out-of-order/old-generation scan, preview, storage and worker callbacks; retries after lease expiration; source withdrawal during processing; no reopening or old-result promotion                    |
| Identity and access        | Same identity with changed recipient/tenant/purpose, account switch, session expiry/re-login, revoked grant and malformed/missing policy/expiry; no authority renewal from login or unknown state               |
| Time and expiry            | Trusted server boundary, at/before/after expiry, invalid clock/policy, scheduler stopped, stale cache, multiple regions; no borrowed token/lease/retention lifetime                                             |
| Private bytes and metadata | Full/HEAD/range/conditional/resume, current metadata/history/counts, wrong copy/length/version, stale URLs, error/redirect/cache/CDN/service worker; independent action permission before disclosure            |
| Active stream              | Expiry and source restriction during slow delivery; measured per-chunk enforcement/buffering/cancellation; immutable generation, honest partial outcome, no recall or browser-save claim                        |
| Recovery and UX            | Completed-but-content-unavailable, history failure, unknown authority, ended access, declined sign-in, completion race while editing; truthful accessible state/help and no unnecessary re-upload               |
| Retention and restore      | Access ends under hold, cleanup races, source-specific disposal, restore/mixed-version rollout; no deletion from completion and no restoration of old access/currentness                                        |
| Operational bounds         | Concrete source access-ending policy plus qualified finite query/transfer/recheck/concurrency/budget/audit behavior; failed background cleanup cannot extend rights                                             |

No duration, provider migration, new package or universal post-completion rule is introduced. Current evidence confirms useful primitives and explicit qualification gaps. The generic Q06 feature, real role enforcement, provider/header/cache/stream behavior and recipient journey remain unproved.
