# Phase29 Q11 A — fixed-at-issuance runtime adversarial review

20 October 2026. Core checkout `/home/conrad/code/core`, last verified HEAD `3d85897ebf1515008ef5c676b1c58a15422fb9ab`. Conrad selected A: resolve and retain the finite unfinished-stage end when the source originally issues the request. This review proposes required implementation/qualification clauses; the parent owns the consolidated review and ratification.

**Disposition: retain A with exact source issuance, stable semantic identity, immutable admitted timing terms, current issuing authority, durable follow-up and truthful unknown-outcome controls.** The inspected code does not establish a qualified native issuance command. Existing auth, email and Workflow mechanisms are adjacent evidence, not proof that the feature works.

Only this research document was written. Three small existing mail-adapter tests ran without credentials/network and with read-only source. No product, schema, dependency, configuration, provider, permission or private-data operations. Earlier Q10 tests are not fresh Q11 evidence.

## Scope and evidence layers

This pass inspected request-scoped authentication, role mapping, the caller-only membership RPC and membership foundation; service-client/handler boundaries; the Resend adapter's validation, retries, timeouts, webhook envelope and delivery bookkeeping; receipt-resend orchestration; and the existing source/dispatch precedents already traced in Q10.

The preceding Q11 research found no qualified native source issuance/first-entry implementation in its bounded code search. That absence has not been replaced by an implementation during this review. Source contracts, observed code, mocked tests, real-role SQL, provider behavior and intended-user qualification remain separate.

Installed and manifest versions checked in the immediate Q11 research: `@supabase/ssr 0.12.7`, `@supabase/supabase-js 2.117.3`, `resend 6.32.1`; auth/database pin Next `16.4.0`. The isolated run used Node `24.21.0` and Vitest `5.0.3`. Public technical docs were read for semantics, not used to adopt new options or change dependencies. No hosted auth settings, deployed migrations/grants, or database version were queried.

## Material current-code findings

Paths are relative to `/home/conrad/code/core`.

| Evidence                                                                                         | What it actually establishes                                                                                                                                                                                                                           | Limit or copying hazard                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/auth/context.ts:240–302`                                                               | Validates the current user through `getUser`, then reads profile under the caller's own RLS client and loads memberships. Profile/membership read failures deny.                                                                                       | This is not merely JWT role-metadata trust. It is still a request-time role snapshot, not an atomic source issuing capability, authority history or permission after later waits.                                                      |
| Same `context.ts:305–338,355–377`                                                                | Calls `current_user_memberships(target_tenant)` and filters exact tenant, active rows and known membership roles; `requireRole` uses the resulting context.                                                                                            | No native request recipient/source/purpose issuing permission is proved by a broad role. External recipient entry cannot require manufacturing donor/staff membership merely to satisfy this general context shape.                    |
| `supabase/migrations/20260802041500_current_user_memberships_rpc.sql:22–50`                      | SECURITY DEFINER wrapper with empty search path and schema-qualified tables; source rows are constrained to `auth.uid()`, exact tenant and active state. No caller-selected user ID. PUBLIC execute revoked; authenticated execute explicitly granted. | Useful trusted-subject/query pattern. Does not prove deployed effective roles/grants, serialize a later issuance command, or authorize service-role callers based on a recipient parameter.                                            |
| `packages/auth/permissions.ts:32–53,61–117`                                                      | MVP staff subroles share broad capabilities. Profile admin/staff compatibility fallback can still establish those broad roles without active membership.                                                                                               | Do not say disabling one membership necessarily revokes all issuing authority, or import this broad map as a new domain grant. Resolve actual owner capability and continuing dependencies.                                            |
| `supabase/migrations/20260226113000_authz_memberships_foundation.sql:45–85,130–203`              | Typed role/staff-role constraints, active-membership indexes, own-row SELECT policy and helpers. `current_tenant_id` reads app metadata; membership helpers query current rows.                                                                        | Different helpers have different authority/freshness semantics. Current role resolution above must not be inaccurately described as using only the JWT tenant helper.                                                                  |
| `packages/database/supabase/admin.ts:15–46`; `packages/api/src/shared/with-operation.ts:137–165` | Separate service-key client; initial auth/optional role before invoking handler with that client.                                                                                                                                                      | Browser RLS is not the sole guard on this service path. A later source command must prove current issuer/source relationships; retaining the initial context object does not keep mutable authority current.                           |
| `packages/email/resend/send.ts:123–185`                                                          | Requires bounded nonempty send idempotency key and validates inputs before SDK send.                                                                                                                                                                   | This is provider-attempt validation, not original source issuance identity, policy admission or recipient permission.                                                                                                                  |
| Same `send.ts:188–208,211–262,265–296`                                                           | Reuses the key across attempts; successful SDK response becomes `success: true`; timeouts/errors are retried under adapter policy and can return `success: false`.                                                                                     | `false` includes both definite no-send validation and exhausted ambiguous transport errors. It is not evidence that source issuance rolled back or provider acceptance definitely never occurred.                                      |
| `packages/email/resend/webhook.ts:9–27,55–78`                                                    | Signature verification is followed by basic required envelope type/time parsing.                                                                                                                                                                       | A signed provider occurrence is authentic provider evidence, not source issuance or human entry. It does not authorize replay of a private source result.                                                                              |
| `packages/api/src/email/webhooks/resend.ts:348–354,639–646,688–710,737–751`                      | Provider event timestamps and send-log status/time are handled independently. Missing event time has a fallback helper; normal verified envelopes require it.                                                                                          | Do not present the fallback as a demonstrated reachable bypass on the verified path. Neither original provider time nor local fallback is native issuance time. Mutable send-log time is especially unsuitable as the original anchor. |
| `packages/api/src/email/template-test-send.ts:254–288`                                           | Test-send calls the provider, then logs application-time requested/sent values.                                                                                                                                                                        | This is a test-message path, not atomic source issuance. Its time/log ordering must not become the authority model.                                                                                                                    |
| `packages/api/src/admin/contribution-operations/action-handlers/resend-receipt.ts:26–58`         | Checks contribution/revision, invokes delivery dependency, then appends audit and reloads source.                                                                                                                                                      | Useful source-before-delivery intent, but no universal original-issuance/delivery atomicity or unknown-outcome proof. An error after provider work must not imply the original business effect never happened.                         |
| `packages/api/src/auth/callback.ts:6–17,28–59`; `packages/auth/demo-login.ts:39–70`              | Private account callback; same-origin `next` sanitization and role routing.                                                                                                                                                                            | Account-code exchange, `request.url` origin and path sanitizer do not establish native request issuance, source-owned tenant host, recipient proof or permission to forward protected fragments.                                       |
| `packages/api/src/workflows/ledger.ts:117–175,279–328,338–389`                                   | Durable handoff upsert and recovery identity, conditional outcome handling.                                                                                                                                                                            | Reuse by tenant/key alone does not compare exact source/recipient/policy/payload; separate producer mutation and ledger write need an atomic/recoverable bridge. Dispatch time is not issuance time.                                   |
| `supabase/migrations/20260820001000_begin_donation_saga_fee_extras.sql:46–63,113–186,215–216`    | Current payment producer serializes a tenant/key and commits business row, audit and outbox in one function.                                                                                                                                           | A useful atomic producer precedent, not a native request command. Its replay lookup is not the full native payload/current-disclosure check. Older producer definitions are superseded by this signature.                              |
| `supabase/migrations/20260718015747_eve_approval_budget_policy.sql:565–568`                      | Row locking followed by expiry comparison to `NOW()`.                                                                                                                                                                                                  | Demonstrates a transaction-start-time copying hazard: the value does not advance after a wait. No hosted exploit or native defect is claimed.                                                                                          |

The membership RPC search found the one August committed definition. This pass did not prove all deployed role inheritance, policies, views, function owners, table grants or route bypasses. An existing constraint/helper is not presumed correct merely because it is in the repository.

## Strongest newly material pitfalls

Severity is prospective impact if the native feature copies a pattern or omits a control; likelihood is qualitative judgment, not incident frequency.

| Pitfall                                                                                                     | Severity / likelihood | Permanent constraint                                                                                                                                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A retry creates a later deadline because the implementation derives it from retry time/current defaults     | High / plausible      | Resolve existing semantic issuance first. A repeated admitted intent recovers its original occurrence, policy inputs and end; it never re-runs admission as a fresh original issuance.                                                                              |
| A new transport UUID bypasses original-issuance dedupe                                                      | High / plausible      | Source uniqueness/state must protect the original business effect, including concurrent first issuance where no row yet exists. Transport key, button instance and request ID are insufficient. Genuine new source work needs its separately authorized procedure.  |
| `success:false` from mail delivery is interpreted as failed issuance                                        | High / plausible      | Separate source admission, prepared communication, provider acceptance, delivery evidence and observer uncertainty. Retry delivery or reconcile unknown outcome; do not move the source end.                                                                        |
| Role snapshot remains trusted after revocation, recipient replacement or host/policy changes during awaits  | High / plausible      | Current exact source issuing authority and reviewed context at the authoritative mutation; trusted actor attribution and a concurrency model that covers relevant permission/state changes.                                                                         |
| Immutable `U` is recomputed from changed policy, timezone, requested date, program end or restored defaults | High / plausible      | Preserve admitted result and the material calculation/policy evidence. New display timezones change rendering only. Genuine later shortening remains independently enforceable and attributable; it does not rewrite the original fact.                             |
| An already-past/unknown/infinite end is issued as useful access                                             | High / plausible      | Complete finite policy, valid typed terms and applicable future opportunity at issuance under the exact source model. Do not treat null/infinity, an empty result or an end at/before its issuance occurrence as usable activation. No numeric minimum is invented. |
| Credential replacement or provider dedupe expiry resets business time                                       | High / plausible      | Distinguish original source issuance, entry credential, prepared message and provider attempt identities. New credential/message does not create a new source period.                                                                                               |
| Delayed notifications or old workers resurrect expired/revoked source state                                 | High / plausible      | Delivery/consumers re-read exact source/currentness before effects. A valid old source effect is historical evidence, not present permission or a fresh deadline.                                                                                                   |
| Original `U` is treated as a completed-stage cap                                                            | High / plausible      | Preserve Q10's scope. Valid timely fulfillment enters Q07; only genuinely cross-stage caps continue. Old unfinished expiry jobs remain fenced by stage/version/end.                                                                                                 |

## Refined source issuance contract

Use `I` for the authoritative original issuance occurrence and `U` for its resolved unfinished-stage end. These names describe facts, not prescribed columns.

Issuance is a durable source-owned admission of this exact request, intended recipient binding, purpose, applicable action scope and timing policy. It is not draft creation, a browser click, message composition, queue scheduling, send success, delivery/open/click telemetry, login or first visit. Under A, first entry does not decide `I` or `U`.

The source command must establish its current issuing capability, exact relationships, source readiness, policy applicability and governing limits. A signed-in staff account may be an authenticated actor without permission to issue this source's request. Reading files, editing a task, sending email, changing a contact or using a support role is not automatically that capability. No new staff role or recipient enrollment follows from Q11.

Once the source effect commits, preserve one original `I`, its admitted `U`, the exact policy/calculation inputs required to explain it, the request/recipient/source revision and trusted attribution. This does not mandate a general event-sourcing system. It does prohibit reconstructing the original boundary from mutable current settings or guessing it from `created_at`.

A's formula remains unselected: resolving at issuance does not necessarily mean adding an elapsed count to `I`. If a future adopted policy uses a program end or requested-date-relative formula, its source, timezone/civil-time interpretation, missing/distant-date behavior and actual owner edit semantics need explicit qualification. No later target edit silently edits authority. Q07's 720 elapsed hours does not itself choose the initial period's arithmetic.

Drafts may legitimately have incomplete/unresolved timing terms. They must not be confused with issued access. A future scheduled issuance capability must requalify at its actual source act; creating a schedule neither starts original access nor adds scheduling permission.

## Current time, review and commit

Evaluate the actual source state/time at the qualified issuance point after relevant waits. Database `NOW()`/`CURRENT_TIMESTAMP` is transaction-start time; a lock does not make it current. An application timestamp before network calls or a second lock is likewise not proof of current admission.

`I` must be the qualified source-occurrence/linearization point of an effect that durably commits. It is not automatically physical database commit time, and no general SQL function is prescribed as such. Qualification must cover a transaction spanning an independent boundary: early candidate `I`, a later material wait, commit after the boundary, rollback and an unknown commit response. Do not backdate to rescue issuance. No provider call belongs under the source lock.

Where a real absolute cap leaves no remaining opportunity at the authoritative issuance point, do not show an active useful request or silently select a new end. A durable historical issuance can later be discovered after its original `U`; recovery must then report its actual ended status under current disclosure rules rather than manufacture fresh time.

For a moving issuance-relative formula, pre-issuance staff review should show the approved timing terms and controlling limits; show exact `U` once resolved. Do not introduce an endless confirmation loop requiring an exact future timestamp to remain byte-for-byte unchanged as wall time advances. Conversely, a material source/recipient/policy change outside the reviewed terms must not be silently accepted as the same issuance.

## Semantic retry identity and fixed terms

Preserve these separate identities:

| Identity                               | Purpose                                                                    | Cannot do                                                                                             |
| -------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Original source issuance intent/effect | Identifies the source business admission and its immutable meaning/outcome | Change `I`, `U`, recipient or purpose merely because a retry needs another HTTP request.              |
| Entry credential                       | Carries a constrained protected doorway/proof mechanism                    | Reset the source period on replacement or recovery.                                                   |
| Prepared communication                 | Binds one authorized presentation/action credential identity               | Mutate an old prepared message to contain a new verifier; dictate the underlying permission lifetime. |
| Provider attempt/dedupe key            | Reduces duplicate transport work for a finite provider window              | Guarantee permanent business idempotency or recipient delivery.                                       |

Stable semantic identity and payload comparison are complementary. The command must reject conflicting reuse of the same intent with different source, recipient, expected revision, purpose or reviewed material terms. But server-derived issuance time and resolved `U` are outputs of the first authoritative admission; do not regenerate them on retry and then misclassify a legitimate retry as a different intent.

A new client key must not automatically authorize a second “original” issuance for the same source context. Qualify the source's legitimate uniqueness/conflict boundary and absent-row race without inventing a generic grant-cardinality schema or a new reissue capability.

On a duplicate, first recover the source effect, then check present authorization before returning private details or replayed JSON. Original success does not authorize a different user, newly revoked actor or stale recipient. Lookup failure is not “no existing effect.” Do not select another key/end because the result is temporarily unavailable.

## Atomic admission and durable follow-up

Persist source admission, fixed terms, required audit/evidence and durable follow-up intent as one atomic source outcome where they share a database, or through an equivalent recoverable owner contract that cannot expose uncommitted/unproved access. A separate call to the shared Workflow ledger after a source update is not automatically such a contract.

The producer's durable intent is authoritative; Workflow, mail and session mechanisms carry it. If a notification is separately authorized, it should point to the committed source effect. A crash before send must be recoverable without issuing again. A worker retry, provider timeout, queue loss or notification rejection must not modify `U`.

Do not erase valid source issuance because a later optional notification/audit projection failed, and do not claim a required issuance record committed when it did not. The source's required atomic records, independent delivery outcome and observer uncertainty must be distinguished. A definitely rolled-back admission, a committed admission with lost reply, and a provider-accepted message with lost response require different recovery.

The current adapter's timeout tests simulate already-aborted requests; they do not prove provider acceptance. General transport uncertainty still matters: an error alone cannot establish nonacceptance. Reconcile same-intent state and use existing owner-supported delivery retry before any separately authorized new effect. Preserve files and source facts; no destructive compensation or private attachment fallback.

## Credentials, host and scanner boundary

ADR-0025 `:28–43,45–92` remains the owner contract: exact source/frozen tenant host, inert GET/HEAD, constrained fragment handling, deliberate POST and required recipient/current assurance. ADR-0037 `:45–67` warns that a scanner can execute scripts/submit forms; bare POST success is not a universal proof of the intended human.

A source end fixed at issuance must not make every invitation holder authorized. Q01 exact recipient confirmation and current permission are still needed. Account callback cookies, same email, general donor membership or a successful redirect cannot substitute.

Replacing an entry credential can produce a new credential and new prepared communication identity while preserving the original source admission. Provider/message creation time cannot become a fresh `I`. Expired credentials stay expired; qualified re-entry may exercise still-valid source rights without extending them. Credential/session/provider lifetimes may be shorter than `U` and must never defeat current source restrictions.

After a valid Q10 transition, current authority is the admitted completed stage; the old unfinished `U` is not a universal cap. A separately qualified new credential may support those still-valid rights under its own contract, but it cannot lengthen an old credential or create Q08 authority.

Frozen tenant-host binding cannot be reconstructed from a generic callback's `request.url`, untrusted Host/Forwarded headers, return parameter or contact edit. Host/source/recipient changes require the existing owner mapping; Q11 creates no automatic migration or replacement power.

## SQL, RLS and integrity proof

The caller-only membership function is a narrow useful pattern: bind the subject to authenticated server context and minimize callable arguments. In contrast, a general service client can reach mutations that browser policies do not govern. Native source commands must establish exact current authority on those paths and not trust caller-provided role, tenant, recipient or issued/end timestamps.

Qualify effective role grants, schema/table/column privileges, views, RPC execution, definer owner/search path, resulting-row checks and storage/service paths. A security-definer function is not automatically a bypass: its owner's role/table privileges and FORCE RLS matter. A service-key request with a user access token can run with that user's RLS; inspect the actual invocation rather than assuming one rule for every client.

PostgreSQL UPDATE/ALL policies can inherit `WITH CHECK` from `USING`; omission of that keyword is not itself a flaw. Policies compose, and BEFORE triggers can transform rows before resulting-row checks. Test both permitted old rows and forbidden changed tenant/recipient/end/policy rows. RLS does not provide immutable-field comparison or original-issuance uniqueness by itself.

At issued states, required timing/scope/effect fields must be present and finite. A comparison CHECK alone may accept null; time-dependent CHECK conditions are not continuously reevaluated expiry enforcement. Use proper state-dependent non-null/integrity rules, exact same-scope relationships, semantic uniqueness, immutable-history protection and deliberate delete behavior, then enforce current expiry at protected operations. No particular table layout is frozen here.

Current profile/membership reads improve authenticity, but authorization may change between those reads and issuance. The source must qualify its currentness/concurrency relationship to the actual granting authority. The broad role compatibility fallback means a membership toggle alone is not a universal capability oracle. Initial issuing permission and any ongoing issuer/delegation dependency are determined by the exact source type, not invented from employment status.

## Migration, restore and stale observations

Persist original admitted results and semantics through policy upgrades, restore and application timezone changes. Never backfill `I` from an email's newest `sent_at`, a task timestamp, a credential row or restore time; never recompute `U` using today's default. Unknown legacy meanings fail closed pending owner resolution.

Keep earlier true shortening/revocation and current recipient/source epoch fences when replaying old issuance/outbox records. A restored “issued” status does not erase later adverse evidence. A stale writer that knows only B's first-entry behavior or an older overall-cap model cannot extend A's end or truncate a valid Q10 completed stage.

Client/CDN caches and receipt/status projections may display old results; they do not authorize current private reads or writes. Under A, first use and every return resolve the same original `U` while unfinished. A stale screen or lost reply cannot instruct the user to “issue again” as a recovery shortcut. Denied/unknown source authority must not be converted into empty data, unconditional success, an expired-state guess or a new deadline.

## Required clauses and future falsifiable proof

These are proposed implementation safeguards, not features or tests claimed complete.

1. **Original source effect:** draft/button/schedule/send/callback/first visit do not start issuance. Only qualified source admission establishes `I/U`; failed transaction creates no admitted source effect.
2. **Immutable admitted terms:** original effect, source/recipient binding, policy/calculation evidence and `U` survive re-render, policy version change, target edit, timezone change, deployment and restore.
3. **Current issuer:** source-specific capability and exact tenant/request/recipient/host/revision checks are proved at the mutation, including revocation/recipient replacement while awaiting locks.
4. **Time after waits:** qualify independent-boundary crossings, candidate `I` versus physical commit, later waits, rollback and unknown commit; no early timestamp backdating.
5. **Finite opportunity:** null/infinity/malformed/unsupported precision or already-ended controlling terms cannot be advertised as active useful access. No initial number or minimum is selected here.
6. **Semantic duplicates:** same intent with same material meaning converges despite changed retry time; conflicting meaning fails. Two first issuers and absent-row races cannot produce two original periods simply by using different transport keys.
7. **Unknown source outcome:** committed-with-lost-reply, definite rollback and failed lookup remain distinct; recovery never chooses a new key or later end to escape uncertainty.
8. **Atomic durable follow-up:** crash after source admission and before dispatch is recoverable; delayed/duplicate/reordered messages re-read exact original source. No provider work under locks.
9. **Provider failure distinction:** missing-key no-send, definite provider rejection, timeout/unknown acceptance and delivery failure do not rewrite source authority. Test accepted-then-lost separately from the existing pre-aborted fixture.
10. **Credential/message identity:** replacement/retry preserves `I/U`; new credential creates the required new prepared identity without mutating the old message or resetting source rights.
11. **Proof and scanners:** generic login, verified account callback, GET/HEAD, tracking and scanner POST without required source/recipient proof cannot issue, extend or activate private access.
12. **Protected-use expiry:** current source state controls every read/write/history/count/replay/cache/range/stream; token/session/provider TTL does not grant a grace period.
13. **Q10 compatibility:** timely qualified fulfillment enters Q07 without applying the old stage-only `U` as an overall cap; actual late fulfillment never revives access. Old expiry jobs remain fenced.
14. **Real SQL paths:** anon/authenticated/recipient/unrelated/staff/service roles, composed policies, transformed rows, callable functions, direct mutations and integrity constraints enforce the same meaning.
15. **Restore/mixed versions:** preserve original identity/terms and later restrictions; no restore-time default, regenerated clock or old first-entry worker changes the result.
16. **Truthful UI/recovery:** exact end once resolved; reviewed conditional terms before resolution where appropriate; honest source issuance versus delivery status; no duplicate invitation, implicit extension or false receipt instruction.

No new initial duration, civil/elapsed arithmetic, deadline editor, reissue right, reminder, scheduling capability or Q08 timing is implied.

## New bounded tests actually run

**3 passed; 31 intentionally filtered/skipped; 1 file; Vitest duration 473 ms.**

`tests/unit/packages/email/resend.test.ts`:

- `:78–105` — the supplied idempotency key reaches the SDK's mocked fetch request.
- `:135–150` — missing key returns validation failure without invoking fetch.
- `:815–850` — pre-aborted signals cause the mocked adapter attempts to exhaust and return a timeout failure with the expected retry count.

The installed Resend SDK was exercised against stubbed `fetch`; no provider request was allowed. The timeout test deliberately starts with aborted signals, so it does not establish accepted-then-lost behavior, real delivery, immutable source issuance, database transaction state or permanent dedupe. Expected SDK error logs came from this fixture; they were not network failures against a live account.

Exact filter: `forwards idempotency key in send request options|requires an idempotency key before sending|maps aborted send requests to a timeout after retries`.

Node `24.21.0`, Vitest `5.0.3`, existing dependencies; cleared environment with dummy loopback Supabase values; bubblewrap read-only root; root `.env`, `.env.local`, `.env.test`, `.env.test.local` masked if present; HOME/temp/Vite temporary storage in tmpfs; networking disabled. Existing `node node_modules/vitest/vitest.mjs run` used `--no-cache --no-file-parallelism --reporter=dot`. A warning about a future Vite native configuration-loader default did not affect the passing result.

No prior source tests were rerun for a larger score. No real SQL-role/concurrency, current authorization, scanner/browser/AT, native issuance, host binding or provider qualification is claimed.

## Official technical sources

- [Supabase getUser](https://supabase.com/docs/reference/javascript/auth-getuser): performs an Auth-server request; supports describing the actual request-context implementation accurately.
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security): grants plus policies, stale JWT metadata, and the distinction between service credentials with and without a user access token. This does not prove this deployment's actual role/grant state.
- [PostgreSQL 17 time functions](https://www.postgresql.org/docs/17/functions-datetime.html): transaction/statement/current time differ; required for after-wait qualification, not a physical-commit or initial-duration prescription.
- [PostgreSQL 17 constraints](https://www.postgresql.org/docs/17/ddl-constraints.html): CHECK null behavior, assumed immutability, uniqueness/null treatment and relational constraint scope.
- [PostgreSQL 17 policies](https://www.postgresql.org/docs/17/sql-createpolicy.html): effective USING/WITH CHECK, composition and BEFORE-transform semantics previously verified in this session remain the SQL basis.
- [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys): the currently documented 24-hour provider dedupe window cannot be the lifetime of source business identity.
- [Resend event types](https://resend.com/docs/webhooks/event-types): API acceptance and recipient mail-server delivery are different provider facts; neither is source issuance or proof of human entry.
- [Supabase email-template limitations](https://supabase.com/docs/guides/auth/auth-email-templates): link prefetch/rewriting are real transport hazards; generic examples do not override Core's protected-action contract.

These sources were checked in the Q11 research/review session. They constrain implementation semantics but select neither the initial period nor a provider-specific permission model.
