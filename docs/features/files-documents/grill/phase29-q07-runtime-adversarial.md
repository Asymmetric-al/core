# Phase29 Q07A — fixed completed-read end: runtime adversarial review

Research date: 20 October 2026. Checkout `/home/conrad/code/core`, HEAD `3d85897ebf1515008ef5c676b1c58a15422fb9ab`. Conrad selected **up to 30 elapsed days from the exact normal completion, preserving earlier binding limits**. This note reviews necessary amendments and qualification, not implementation or ratification.

Read-only source/migration/public-documentation review plus two bounded existing unit suites. No code/schema/dependency/provider/auth changes, private rows, credentials or private file bytes. Only this research note was written. Existing donor/UI and parent documentation changes were preserved. Paths below are relative to the checkout.

## Judgment

The selected maximum is coherent. The two most important requirements are:

1. **Capture one trusted source-transition anchor, and preserve it on retries.** A mutable task completion date, browser timestamp, worker arrival time or transaction-start timestamp is not automatically that anchor.
2. **Preserve the resolved earlier bound, not only the 30-day candidate.** If completion plus 30 days would end on 31 October but an existing binding cap resolves access to 2 October, removing that cap later must not expose the remainder through 31 October.

Use the source's existing permission/transition authority, durable effect identity and private delivery contract. No new permission engine, general time service, access-renewal product or parallel history store is justified. The native recipient completed-read policy is still an implementation gap; current adjacent mechanisms do not qualify it.

## Current source evidence and reuse limits

| Current mechanism             | Exact evidence                                                                                                                                | Useful precedent and limit                                                                                                                                                                                                                                                                           |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Typed finite expiry input     | `packages/api/src/eve/approval-budget/schema.ts:35–50`                                                                                        | An offset-aware expiry belongs to a named operation. Parsing proves timestamp shape, not who may choose it. Its budget policy is unrelated to Q07.                                                                                                                                                   |
| Persisted end and bound       | `supabase/migrations/20260718015747_eve_approval_budget_policy.sql:88–105`                                                                    | An explicit TIMESTAMPTZ end is constrained against creation. Its 24-hour limit is specialized; do not copy the number or assume NOW means commit.                                                                                                                                                    |
| Permissioned durable command  | Same migration`:587–653`, especially `613–637`                                                                                                | Actor/tenant and dedicated permission checks, bounded expiry validation, insertion and audit in one transaction. It is an emergency-budget command, not a native recipient grant or correction/completion transaction.                                                                               |
| Trusted actor plumbing        | `packages/api/src/eve/approval-budget/control.ts:16–35,142–174`                                                                               | Actor fields derive from authenticated identity. Approval lookup includes exact ID, tenant and requesting profile before the RPC. This is useful attribution/ownership shape; neither the lookup nor the mocks prove DB race isolation.                                                              |
| Application-clock expiry read | `packages/api/src/eve/approval-budget/store.ts:177–183`                                                                                       | Active-override metadata filters using application `new Date()`. A server-side date is better than a browser date, but does not establish consistency with DB time or an expiry boundary during waiting/streaming.                                                                                   |
| DB-clock budget decision      | `20260718015747_eve_approval_budget_policy.sql:426–447`; later runtime function in `20260802160104_eve_runtime_active_runs_guard.sql:128–158` | Both check override expiry with NOW after a usage-row lock. NOW retains transaction-start semantics even after the lock wait. This is an observed source pattern and a reuse warning, not a reproduced native disclosure defect.                                                                     |
| Precise timestamp validation  | `packages/api/src/generated-documents/renderer-qualification/charter.ts:235–323`                                                              | Explicit offsets, calendar validity and full fractional-second comparison. The helper is private to renderer qualification; reuse the precision discipline/test cases, not the whole charter subsystem as a new auth dependency.                                                                     |
| Mutable task completion       | `packages/api/src/missionary-portal/task.ts:25–58,81–97`                                                                                      | Status PATCH sets `completed_at` to application now whenever completed is submitted and clears it for another status. Valid task behavior is not an immutable document-fulfillment anchor; repeated PATCH can choose another timestamp.                                                              |
| Worker completion reducer     | `packages/api/src/eve/dynamic-workflow/state.ts:112–128`                                                                                      | Known call completion recomputes overall completed/running status without a terminal-state guard there. A technical callback cannot be the native grant or business-completion authority. No new cancelled-then-late-completion test was run.                                                        |
| Separate technical clocks     | `20260718093000_eve_email_discord_notifications.sql:108–131,173–201`                                                                          | Delivery end, lease end and retention end are separate; semantic dedupe and idempotency keys are tenant-scoped. A service-supplied `p_now` and lease seconds are not browser-controlled entitlement inputs.                                                                                          |
| Retention-derived end         | `20260718022535_eve_retention_replay_tracer.sql:185–205`                                                                                      | The category-derived `make_interval(days => …)` is retention logic. It does not establish elapsed-day recipient permission or Q07's count.                                                                                                                                                           |
| Privileged request execution  | `packages/database/supabase/admin.ts:15–46`; `packages/api/src/shared/with-operation.ts:128–167`                                              | The wrapper passes a service-key client after auth/role checks. Native request/action/expiry authorization must be enforced expressly; ordinary RLS cannot be assumed to restrict this privileged client. Touching a request cookie prevents static prerendering, not all caches or data disclosure. |
| Short signed URL              | `packages/api/src/eve/retention/control.ts:157–178`                                                                                           | Owner/tenant/status/expiry lookup precedes a fixed 60-second URL. Lookup, issuance and use are separate. This does not satisfy Q07 expiry/currentness or inherited Q04 private serving.                                                                                                              |

Scoped search in API/database/migrations found no qualified generic native completion-access policy. Migration search found the budget table/helper definitions in the initial policy migration and later runtime consumers noted above. This is source evidence, not deployed-schema or full-repository absence proof.

## Required amendments and adversarial cases

Severity below describes the consequence **if the proposed native lane is implemented incorrectly**. Likelihood is engineering judgment from the inspected patterns, not measured incident frequency. No production exploit or generic feature failure was demonstrated.

### 1. Bind the anchor to one authoritative normal-fulfillment effect

**High impact; plausible under task/callback reuse.**

The source must capture an authoritative normal-completion instant once at the winning source transition, under current authority and the expected request/member/review-set revision. Record its effect identity, recipient scope and admitted policy together. The transaction must commit for that fact to exist; rollback creates no completed grant. A source's historical business-effective date can differ from its authoritative recorded transition instant, so name the selected clock explicitly.

Never accept the browser's `completed_at`, a staff-editable generic date, a timestamp on an untrusted imported event, the most recent `updated_at`, email delivery or worker callback arrival as the default anchor. A valid RFC3339 string still needs trusted provenance.

PostgreSQL NOW/CURRENT_TIMESTAMP use transaction start; statement_timestamp uses statement start; clock_timestamp changes with wall time. A transaction or statement can wait across an access boundary. Therefore choose and qualify the source-transition capture/check point after relevant lock waits and current-state validation rather than calling NOW an exact commit timestamp. Do not hold a DB transaction open for provider delivery. [PostgreSQL date/time functions](https://www.postgresql.org/docs/current/functions-datetime.html)

**Proof:** transaction starts before access end and obtains the source lock after it; concurrent correction changes the member set; two completion commands race; a lost success response is retried tomorrow; caller supplies past/future/zone-less anchor; imported/legacy completion lacks authoritative provenance. Every case either recovers the one original permitted effect or denies/reconciles without manufacturing a new anchor.

### 2. Freeze the resolved cap for the admitted policy/effect

**High impact; likely under a naive live `min(completion + 30 days, currentCap)` calculation.**

Persist or otherwise durably prove the resolved end and the policy/anchor/cap provenance. The exact storage representation is not selected here. Removing, lengthening, nulling or restoring an earlier binding cap must not enlarge the same completed entitlement. A later binding shortening also constrains that entitlement and cannot become a hidden route to renewal when its source row changes.

Distinguish **binding end** from **temporary current restriction**. If a content-safety restriction lifts while the original source authority remains valid and before its unchanged end, a fresh source decision may permit that content again. That is not authority to revive an expired/revoked grant or to reset its clock. Do not make every temporary unavailable state an irreversible expiry.

Known absence of an additional cap under a qualified finite policy is different from missing/unknown policy. Neither NULL nor an infinity sentinel is permission to guess a longer period. Existing binding deadlines and specialized sources remain unchanged unless separately authorized through explicit owner resolution.

**Proof:** remove/lengthen earlier cap before and after its effective end; shorten then later remove it; edit the default duration; restore old policy rows; lift a temporary safety restriction before the unchanged end; completion after source expiry. The same entitlement never gains an unused remainder automatically.

### 3. Resolve eligibility and completion under one source concurrency boundary

**High impact; plausible.**

Completion must serialize against correction admission, acceptance/freeze, recipient/source reassignment, revocation and relevant cap changes. Reading those records and then inserting an end without a shared revision/transaction discipline leaves a stale-authority gap. A status check alone does not detect a changed exact review set.

When correction admission wins first, Q03's new member set remains current and stale completion cannot ignore it. When completion wins first, later ordinary finalization/correction is denied, even if upload already started. A worker may finish a previously admitted technical result under independent source/service authority after recipient read access ends; that result cannot create/restart the recipient window.

Idempotency identifies the same semantic completion effect, not merely the same caller-generated HTTP request key. A replay recovers the same anchor/end/effect. Replaying stored private response JSON still requires **current disclosure authorization**; an idempotency cache is not an exemption from expiry.

**Proof:** concurrent completion/correction/cap-shortening/revocation in both orders; duplicate delivery with distinct transport IDs; same idempotency key with conflicting subject/payload; timeout after commit; old worker after lease replacement; result replay after expiry. Verify durable facts and protected response separately.

### 4. Enforce fresh time at every protected recipient operation

**High impact; plausible from application-clock and transaction-clock differences.**

The selected arithmetic is **30 × 24 hours = 720 hours**, not month arithmetic, local `setDate(+30)`, business days or local end-of-day. Resolve one absolute end and compare using a qualified trusted clock and precision. New protected operations require current time strictly before that end; equality denies.

Calendar-day arithmetic can cross DST differently from literal elapsed hours. This makes the replay retention expression a poor unexamined template for Q07. Timestamp normalization, driver serialization and display must not round the access boundary later. [PostgreSQL date/time arithmetic](https://www.postgresql.org/docs/current/functions-datetime.html)

The existing charter test corpus proves offset/fraction handling in that module. It does not choose a new universal nanosecond date framework. Use one explicit precision supported by the source of authority, and prove the application/DB boundary rather than passing a future/past client “now.”

Qualify clock skew, rollback and stale authorization reads. Previously recorded expiry/revocation or an earlier resolved end must not disappear because a wall clock moves backwards, a lagging replica is consulted or old state is restored. Unknown current authority denies private disclosure. This is a requirement for a credible authority boundary, not a proposal to build a distributed time oracle.

**Proof:** immediately before/at/after end at the chosen precision; DST both directions, leap day/month boundary and timezone change; DB/app clock skew; lock wait crossing expiry; wall-clock rollback against recorded adverse state; delayed/lagging current-state read. No arbitrary grace interval is selected.

### 5. Prove the actual SQL/service boundary, not policy keywords

**High impact; likely to be missed by superficial verification.**

The inspected budget table enables RLS and revokes browser roles, with service-role reads (`20260718015747_eve_approval_budget_policy.sql:160–174`). Its exposed business RPCs revoke PUBLIC/anon/authenticated execution and grant service execution (`657–670`). The definer helper checks profile/tenant correspondence (`176–195`), while its permission helper has a trusted `p_actor_role` branch (`197–215`). This is meaningful server-side separation, but it depends on trusted caller derivation and effective deployed function/grant ownership.

The native grant must bind exact tenant, verified recipient, request/purpose, relevant member/lineage and admitted policy/effect. Two independent UUID foreign keys do not alone prove both referenced records share that tenant/request. Prove equivalent same-scope constraints in the source's chosen design, including old and resulting values on allowed updates. Do not inherit Eve's super-admin exception or create donor membership for the recipient.

PostgreSQL can inherit USING as WITH CHECK for UPDATE/ALL. BEFORE triggers run before the resulting-row policy check. Permissive policies combine with OR; restrictive policies constrain them with AND. Missing an explicit WITH CHECK keyword is not itself a defect. [PostgreSQL CREATE POLICY](https://www.postgresql.org/docs/current/sql-createpolicy.html)

SECURITY DEFINER executes with owner privileges; whether RLS is bypassed depends on the executing role/table ownership, FORCE RLS and BYPASSRLS, not the keyword alone. Superusers and BYPASSRLS roles bypass; ordinary table owners usually bypass unless forced. [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

The Supabase client here uses the privileged service key with session persistence/refresh disabled. It is not a caller-authenticated client simply because a route previously ran getAuthContext. New service routes/RPCs need explicit source checks. Supabase also documents that user-editable metadata is unsuitable for authorization and JWT membership claims can lag changes until refresh. [Supabase RLS reference](https://supabase.com/docs/guides/database/postgres/row-level-security)

**Proof:** actual anon/authenticated/scoped-worker/service roles and deployed table/RPC/view/storage routes; correct user wrong tenant/request/purpose; cross-tenant old→new reference changes; forged actor/time/end parameters; relevant BEFORE transformations and composed policies. Check denied mutations leave the target intact, not only that an API call returned no rows.

### 6. Keep browser/session, technical lease and source expiry distinct

**High impact; plausible under configuration reuse.**

`packages/auth/context.ts:249–301` derives a verified user/profile/membership context. `packages/auth/client-session.ts:56–82,131–188` clears cached data on user changes/sign-out and fences stale profile loads. Useful foundations, but neither is the native purpose grant.

A browser session may expire before the fixed source end; successful Q01-qualified re-entry can regain the same still-valid source view without sliding that end. Conversely, a valid session can outlive source access and must not retrieve protected status/history/files.

Supabase's timebox/inactivity settings are checked on token refresh and are not a precise substitute for the native source boundary. Q07 does not authorize changing global Auth session duration to 30 days. [Supabase session lifetime](https://supabase.com/docs/guides/auth/sessions)

Worker claims (`packages/api/src/workflows/claims.ts:7–38`; `20260611181000_workflow_work_claims.sql:45–99,103–133`) coordinate finite service work. Expiring/reacquiring one does not refresh recipient authority. Notification lease/delivery and retention remain separate clocks.

### 7. Gate private metadata, caches, conditionals and streams

**High impact; current adjacent paths are expressly unsuitable without qualification.**

An expiry check must precede protected serialization: completion outcome, file name/size, history rows, counts, date display, preview/original headers, HEAD, range and conditional responses. A 304 still selects a private representation and cannot bypass current authorization. The fixed end bounds source eligibility; it does not promise every current file is safe/available until that date.

`packages/api/src/reads/donor-history.ts:37–66` uses minute-scale Cache Components caching. Its donor/tenant arguments participate in the cache key; tags are not the isolation boundary. This staff-facing cache is not proof of native current-recipient expiry. `apps/donor/next.config.ts:114–174` also has extension-shaped public cache rules; future private routes require deployed response/CDN override proof. Do not declare an existing native leak from a route that has not been implemented.

The Eve download helper checks row expiry then returns an independently reusable fixed-lifetime URL. It cannot guarantee Q07's source end or immediate current revocation. Supabase documents that Storage signed URLs use an internal signing key independent of Auth key rotation and ordinarily remain valid until their own expiry. [Supabase private downloads](https://supabase.com/docs/guides/storage/serving/downloads)

Reuse Q04's private gateway: exact immutable original generation/reference qualified before emission, independent preview/original action checks, no public or stale-URL fallback, private no-store treatment on success/error/redirect, and truthful partial outcomes. A terminal digest can detect wrong bytes after emission; it cannot prevent those bytes having escaped.

P12 requires expiry rechecks per chunk for long streams (`docs/prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1643–1655`). P26 D16 stops new grants on restriction and terminates an authorized in-flight transfer where feasible (`docs/features/support-hub/grill/phase26-d16-adversarial-review.md:118–120`). Do not turn the initial check into a 30-day stream lease or borrow the managed-realtime 60-second allowance. Reauthorize every resumed range against the same byte generation and current source context.

Measure buffering/cancellation at the actual runtime and provider. No DB lock across the entire transfer. At expiry/restriction, abort safely without appending JSON/login/error to an original. Already emitted bytes or a partial local file cannot be recalled; never report that the recipient saved/completed the file from a click or server response alone.

### 8. Preserve the end through restore, migration and operational failure

**High impact; lower-frequency but credible recovery risk.**

Durable completion/policy/end/adverse facts must survive retry, restore and mixed-version rollout. A snapshot with an older longer cap, old active status or a prior recipient is not permission to resume service before reconciliation with source authority. Cache/object restoration cannot restore an ended right.

Expiry is enforced by the serving/metadata operation while cleanup, notification and expiry jobs are paused. Retention/hold state preserves custody according to its source policy, not participant readability. No retention job must run on the deadline for denial to take effect.

If an independently admitted source operation finishes after recipient access ends, keep its permitted durable business/technical outcome and service audit. Return only the currently permitted neutral response to that recipient. Do not roll back valid source work merely to avoid an expired disclosure; do not “repair” disclosure by granting new access.

## Minimal permanent path

Keep the existing source-owned request task and PDP boundaries. The exact admitted completion effect should provide sufficient durable facts to resolve its fixed end once, prove why an earlier cap applies, and detect stale transitions. Current reads intersect that immutable bound with current action/content/recipient restrictions. Current technical jobs use separately admitted service authority and exact operation/version identity.

No particular schema or generalized permission engine is frozen here. Reuse the existing transaction/idempotency/audit mechanisms only after proving that their actual semantics meet this source contract. Protect source facts from broad mutable PATCH; fail closed on legacy or missing policy until explicitly reconciled.

The recipient sees the actual localized end date/time/timezone, not a guaranteed full 30 days, countdown-only UI or a permanent metadata fallback. A browser timer can clear controls but cannot authorize or extend the view. Returning from sleep/offline/login needs a fresh gated result; a late earlier response must not overwrite newer ended/restricted state. Preserve accessible focus and neutral recovery/help without promising renewal or inviting attachment email.

## New bounded test evidence

**16 selected tests passed; 10 skipped by filter; 2 files; Vitest 5.0.3; reported duration 572ms.**

| Existing file                                                                               | Executed checks                                                                                                                                                                       | Proof limit                                                                                                                                                              |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tests/unit/packages/api/renderer-qualification-timestamp-approval-contract.test.ts:47–110` | 11 timestamp cases: six malformed/non-RFC3339 freeze dates; two zone-less nested times; explicit-offset equality; offset-obscured post-freeze time; full fractional-second comparison | Pure charter-validation fixtures. Not authoritative anchor capture, DB precision, 30-day arithmetic, source expiry, DST execution, current permission or a native route. |
| `tests/unit/packages/api/eve-approval-budget-control.test.ts:18–185`                        | Five control cases: verified identity fields, fixed policy action/target, absent-grant error mapping, tenant/user ownership lookup, rejection before RPC for a different owner        | Mock RPC/query responses. Does not execute SQL permission logic, real authentication, locks, expiry validation, policy composition or concurrency.                       |

Executed with Node 24.21.0 and existing installed dependencies, `env -i`, dummy loopback Supabase values, HOME in tmpfs, read-only root bind, `.env.local` masked by `/dev/null`, temporary Vitest storage in tmpfs and networking disabled by bubblewrap. No installs or tests mirroring a proposed implementation. Filter:

```text
rejects a non-RFC3339|rejects a zone-less|accepts explicit offsets|rejects an approval after freeze|compares the complete fractional second|Eve approval and budget controls
```

Command shape: existing `node node_modules/vitest/vitest.mjs run` for those two files, `--testNamePattern` above, `--no-cache --no-file-parallelism --reporter=dot`. The only warning concerned possible future Vite native-config-loader compatibility; the current run passed. Earlier Q01–Q06 counts are not counted as fresh Q07 evidence.

Current relevant manifest pins: `packages/auth/package.json:30–38` specifies Supabase SSR 0.12.7, supabase-js 2.117.3, Next 16.4.0, React 19.3.0 and TypeScript 7.0.2; root `package.json:6` pins Bun 1.4.3. This review did not alter or reinstall them.

## Remaining qualification before activation

At minimum, the native implementation needs real source/DB-role concurrency tests for completion-versus-correction/revocation/expiry, fixed-cap and retry invariants, exact same-scope references, boundary precision and trusted timestamp provenance. Then actual route/storage/browser evidence must cover private metadata, conditional/range requests, slow streams, stale cache/URLs, timeout/recovery and safe ended states. Deployed policy/grants/function ownership/clock configuration and provider revocation behavior remain unqueried.

Current official PostgreSQL documentation resolved to version 18; the deployed server version was not queried. Supabase's current RLS/session/Storage topic documentation and changelog were read. The `.md` changelog endpoint was unsupported by the browsing tool, so its HTML index was used. Nothing in that read justifies an incidental dependency upgrade, provider configuration change or new Q07 product scope.

No new test demonstrates the proposed native completed-read feature works. The meaningful result is a source-grounded, bounded design amendment set and passing adjacent precision/identity tests.
