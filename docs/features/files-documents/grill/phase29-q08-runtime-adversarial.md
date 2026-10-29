# Phase29 Q08A — deliberate fresh read authority: runtime adversarial review

Read-only review, 20 October 2026. Core checkout `/home/conrad/code/core`, HEAD `3d85897ebf1515008ef5c676b1c58a15422fb9ab`. Conrad selected Q08 A: appropriately authorized staff may deliberately issue fresh, finite read-only access after ordinary completed-access expiry. Q01–Q07 remain binding. This review supplies amendments and proof requirements; it does not select a fresh duration/anchor, repetition limit, notification or implementation.

Only source/migrations, public official documentation and bounded existing tests were inspected. No product/schema/dependency/provider/auth changes, credentials, private rows or file bytes. Only this research note was written; existing user and parent changes were preserved.

## Judgment

Accept the capability only with a genuine **new source decision**, exact prior-admission scope, current administrative authority, and durable retry/race semantics. The old access remains ended; normal completion and submitted originals remain unchanged. A new UUID or new signed URL does not supply any of those guarantees.

Current code has useful dedicated-permission, exact-subject retry and projection mechanisms, but also deliberately broad MVP roles, mutable grant rows, weaker duplicate-key recovery and independently issued provider URLs. They must not be treated as a ready native fresh-access subsystem.

No qualified native document fresh-access command or actual end-to-end external help journey was established. This is an implementation gap, not proof that an unbuilt route is currently exploitable.

## Current source and exact limits

### Viewing or broad staff status is not grant-administration authority

`packages/auth/permissions.ts:32–53` expressly gives all staff subroles the same broad MVP Mission Control capability set. `:61–81` treats active staff membership or admin/staff profile roles as broad admin/staff roles. That map is not a safe default for deciding who may grant a private recipient new rights.

There is narrower real precedent:

- `packages/api/src/eve/model-policy/permissions.ts:9–24` requires an active dedicated grant for a general admin, with a specialized super-admin exception.
- `model-policy/store.ts:139–154` filters by tenant, profile, exact permission and active state, throwing on lookup failure.
- `permissions.ts:27–55` denies without the dedicated grant and records a blocked attempt.
- `packages/api/src/admin/contribution-operations/permissions.ts:51–82,90–126` separates specific actions and request/direct capabilities. `actions.ts:37–55` checks actor permissions before dispatch. These are concrete examples of a permission finer than route access.

Neither example implements the full P12 administrative scope/assignable-ceiling contract for Q08. Do not copy Eve's super-admin shortcut, finance role, global service power or ability-to-view as the new issuance capability. P12 says that exercise capability and the live power to cause another principal to receive it are different (`docs/prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1670–1672`).

**Required result:** only an actor currently authorized to administer this exact source/request/recipient/read scope may issue it. The recipient's eligibility must independently pass. UI visibility, a staff role, knowledge of an ID, help responsibility or a service key is insufficient.

### Existing grant storage is not immutable fresh-authority history

`supabase/migrations/20260718005737_eve_model_policy_tracer.sql:7–24` defines one tenant/profile/permission row with mutable `is_active`, created/updated timestamps and nullable grantor provenance. It has no recipient request, old-grant linkage, immutable finite read period or repeated-issuance identity.

The migration enables RLS, revokes anon/authenticated table access, grants service SELECT/INSERT/UPDATE (`103–113`) and uses a BEFORE INSERT/UPDATE trigger to ensure the grantee profile belongs to the row tenant (`115–137`). This is useful constraint/privilege evidence, not a complete native grant model. The trigger does not establish every Q08 principal/request/purpose/member relationship.

Scoped migration search found these definitions and the later function execute revoke at `:729`; no separate later definition of this table/trigger was found in that search. Effective deployed grants, role attributes, function ownership, storage policies and migrations were not queried.

For Q08, old authority must not be overwritten or reactivated. The new authoritative effect needs an unambiguous relationship to the proved expired ordinary admission, exact same recipient context, same-or-narrower eligible scope, governing policy, issuer, finite end and current restriction history. Those are conceptual invariants; this note does not choose table names or a parallel grant engine.

### Duplicate-key handling varies; do not reuse it indiscriminately

The useful stronger pattern is the refund attempt ledger:

- `packages/api/src/admin/contribution-operations/store.ts:150–192` loads by tenant/key, maps the row, and rejects a mismatched donation or requested amount with 409.
- `:195–241` claims through upsert with a tenant/key conflict target and `ignoreDuplicates`; a conflict recovers and validates the existing attempt rather than replacing its payload.
- `refunds.ts:100–118` returns the already-finalized recorded outcome instead of repeating provider work.
- `supabase/migrations/20260710170000_contribution_refund_attempts.sql:5–26` provides tenant/key uniqueness and coherent claimed/finalized fields. `:54–89` constrains donation/correction references to the same tenant and donation. `:91–99` denies browser table access and gives service privileges.

This is source-specific financial recovery. It does not authorize a new file grant or prove concurrent native transactions. Its claimed-attempt provider replay contract is specific to its provider/action.

A weaker adjacent pattern is demonstrable in source: `createContributionCorrectionRequestInSupabase`, `correction-requests.ts:123–145`, handles a duplicate key by selecting the existing ID on **tenant plus key**, without comparing action, contribution, payload or actor in that helper. `action-runtime.ts:714–734` passes an explicit caller key through; only absent keys use a context fingerprint. The unique index is tenant/key (`20260611120000_contribution_correction_requests.sql:56–58`).

That is a concrete reason not to copy the helper as a complete fresh-authority replay boundary. It is not, from this bounded review alone, a validated exploit in the full contribution flow. Native issuance needs exact conflict detection independent of whether a key was supplied or derived.

Eve approval issuance also mints a UUID on each invocation and accepts no semantic idempotency identity in the inspected RPC (`20260718015747_eve_approval_budget_policy.sql:496–535`; `approval-budget/control.ts:124–140`). Its pending/expiry locked decision is useful (`539–584`), but not a complete duplicate-safe issuance command.

### Recovering a business effect does not authorize replaying its private JSON

Current contribution routes demonstrate a separate projection step: `route.ts:197–220` resolves actor context and performs the action; `:231–237` projects the returned result for the viewer. `viewer-projection.ts:327–358` applies the detail/provider projection, including redacting unauthorized provider outcomes.

This is useful separation between internal outcome and returned data. It is not proof of native current-recipient expiry or a fresh permission recheck after a long action. The current route computes its capabilities earlier in the request; Q08 must qualify its own current authority boundary rather than reuse this timing as sufficient.

A successfully recorded grant may be recovered internally after an issuer/recipient loses authority. That does not mean the caller can still receive names, exact file scope, private history, usable links or stored response JSON. Replay must preserve the durable effect while independently applying current disclosure permission to its returned projection. “Already succeeded” must never become a bypass.

### Grant, invitation and delivery are separate outcomes

Current Support routing is useful for receiving work, not for granting file rights. `packages/api/src/admin/support-hub/route-helpers.ts:31–74` gates staff and binds tenant context. Email sender/header/subject correlation in `adapter/supabase.ts:1383–1421` is conversation routing, not verified recipient identity. Inbound messages can reopen resolved conversations (`:644–662`); that must never reopen document intake or issue read authority.

`packages/api/src/workflows/adapters/inbound-email.ts:303–371` demonstrates recovery of an existing routed message/bridge and refuses to treat a failed lookup as “not yet routed.” This is useful uncertainty handling, not a native grant transaction.

Contribution notification code also distinguishes durable dedupe rows from a new delivery attempt: `approval-notifications.ts:273–315` returns newly inserted notification keys, and `:571–590` delivers only that subset. The explicit reason is that provider dedupe windows can expire. This avoids a class of repeated delivery but is **not proof of atomic grant-plus-outbox or all crash recovery**; this bounded review did not qualify its complete delivery lifecycle.

Q08 chooses no notification. If a communication is separately admitted later, the new source decision and required durable audit/effect intent must commit through the existing owners before provider work. Failed delivery leaves a truthful source outcome; it must not mint another grant, reset time, revoke valid access automatically, reopen intake or claim the recipient has seen anything. Unknown external success must reconcile under the same admitted effect rather than send again blindly.

### Signed links and session refresh do not fill the gap

`packages/api/src/eve/retention/control.ts:157–178` checks an artifact's tenant/owner/status/expiry and then creates a fixed 60-second signed URL. The checks and URL issue/use are separate. This is not a current native fresh-access grant, and issuing another URL after source expiry cannot be the new product action.

The current Supabase Storage documentation distinguishes private authenticated reads from time-limited signed URLs. Storage URLs use an internal signing key independent of Auth key rotation and ordinarily remain usable until their own expiry. Thus a new URL or changed Auth session cannot prove current application revocation. [Supabase private downloads](https://supabase.com/docs/guides/storage/serving/downloads)

The PKCE callback in `packages/api/src/auth/callback.ts:6–17,28–59` exchanges the identity session and safely handles redirects/private headers. It does not grant this document scope; role-home routing may override the supplied safe next destination. The native same-request confirmation/re-entry journey remains to be qualified under Q01.

## Risk and required-clause review

These severities are consequences if the proposed lane is built with the listed omission. Likelihood is qualitative engineering judgment from nearby patterns, not incident statistics or a claim of an exploited existing native feature.

| Hazard                                                          | Severity / likelihood                                     | Required invariant                                                                                                                                                                                                                                                                      |
| --------------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Broad staff/file-view permission becomes power to issue         | High / likely under naive role reuse                      | Re-prove exact administrative scope and ceiling independently from recipient/read permission; no implicit self-benefit, delegated expansion or global-admin shortcut.                                                                                                                   |
| New ID bypasses a substantive expired/revoked purpose           | High / plausible                                          | Admit only normal-expiry cases with proved prior authority and a currently permitted purpose. Preserve hard ends, genuine shortening, recipient disqualification and revocation.                                                                                                        |
| Mutable old grant is reactivated                                | High / likely if the existing active-flag table is copied | Preserve old identity/end/history; new decision has distinct provenance and lifecycle through the existing source owner.                                                                                                                                                                |
| Same key recovers a different subject/payload                   | High / concrete weak adjacent helper                      | Exact semantic effect binding and conflict comparison, not tenant/key alone. Conflicting payload fails without exposing the other result.                                                                                                                                               |
| Two staff commands silently stack grants or periods             | High / plausible                                          | Serialize against the relevant source/fresh-authority head and qualified repetition policy. Same deliberate effect converges; genuinely different intentions need source conflict/current-state resolution. No repetition number or universal “one active grant” schema is chosen here. |
| Issuer or recipient loses rights while approval waits           | High / plausible                                          | Current source/issuer/recipient/member/policy checks at the winning authoritative transition after waits; stale review must not authorize a new state.                                                                                                                                  |
| Stored result leaks after revocation                            | High / plausible                                          | Recover internal effect separately from current caller/recipient disclosure projection; no raw response or provider-link replay exemption.                                                                                                                                              |
| “Same recipient” is inferred from email/help/thread             | High / concrete nearby correlation pattern                | Exact qualified principal/recipient/address revision under Q01; email string and old-link possession are not binding authority. Changed identity uses the owner's distinct recovery path.                                                                                               |
| Fresh scope includes new members or old correction predecessors | High / plausible                                          | Intersect the previously admitted completed-view scope with current exact member/action eligibility. No folder/latest-pointer/hash-based expansion.                                                                                                                                     |
| Mail failure creates another grant or slides time               | High / plausible                                          | Separate durable authority, proof/entry, notice delivery and use; same effect recovery. No communication policy or timing reset implied.                                                                                                                                                |
| RLS is assumed to constrain service-key helpers                 | High / likely under wrapper reuse                         | Qualify all actual roles/RPCs/views/storage and privileged source paths; service execution must explicitly enforce the source.                                                                                                                                                          |
| Restore recreates old active authority or repeats notice        | High / lower-frequency recovery case                      | Reconcile original/new authority identities, irreversible restrictions and effects before serving or redispatching. No repair-time grant or time reset.                                                                                                                                 |
| Help/confirmation/replay mutates completed work                 | High / plausible                                          | Completed source state and business write fence remain intact; fresh read is not correction, acceptance or a new evidence request.                                                                                                                                                      |
| Denial audit failure becomes permission or disappears silently  | Medium–high / concrete separate audit pattern             | Always deny unauthorized issuance; durable successful grant/audit is atomic per owner contract; observe failed denial recording without pretending it was durably recorded.                                                                                                             |

### Exact source/recipient/file boundary

The fresh command must prove that the earlier ordinary read admission actually existed, ended by an eligible ordinary expiry, and belonged to the same source request and recipient revision. Unknown historical eligibility is not “renewal.” A valid original admission whose projection was lost must instead recover its original end; repair is not fresh authority.

The current source decides whether issuance is allowed, but Q08's scope ceiling remains the same or narrower than the prior admitted own-submission/Q05 context. Do not let new attachments added later, staff-only notes, superseded predecessors, another person's contribution or a changed purpose enter automatically.

Separate immutable original identity from a repairable representation. A newly qualified rendition of an already eligible original may be served under current permission; recreating a preview does not admit a different original. New read access never implies upload, correction, acceptance reversal or unfreezing.

Before the staff confirms, show the permitted intended recipient, scope/action consequences and actual finite end under a qualified policy. Re-prove after any source revision change; do not silently accept a narrower/wider target that differs materially from what was reviewed. This is a required consequence review, not a decision to add a new modal, free-text essay, per-file ceremony or multi-approver flow.

### Concurrency, durable outcome and idempotency

The source mutation must order issuance against revocation, principal/recipient rebinding, purpose/classification change, prior-scope corrections, disposal/holds, policy changes, issuer administrative changes and another issuance. Locking only a newly inserted row does not serialize two concurrent attempts that both saw no row. Exact revision/CAS/locking or an equivalent source-owned invariant must cover the relevant absent/existing state.

A transport retry carries the same semantic intent and immutable effective payload. A new browser-generated UUID on each retry is insufficient. Tenant/environment/source/request/recipient revision, prior authority, exact scope, admitted policy and intentional issuance identity must not drift under the same key. A server-computed payload fingerprint can help detect mismatch, but it is not authorization or a complete source identity by itself.

PostgreSQL Read Committed uses statement snapshots; row-lock waits can return newer target versions while other relevant facts need their own coherent check. ON CONFLICT can resolve a concurrent insertion that was not visible in the original statement snapshot. Serializable transactions can still require whole-transaction retry. The design must qualify its actual consistency boundary, not claim that “transaction” or “upsert” alone makes the new grant correct. No external effect occurs before successful local commit. [PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html)

No fresh duration, anchor or repetition count is adopted here. Before activation, an explicit finite source policy must determine those facts and constrain intentional repeated issuance; unknown policy denies the affected new-access capability. Replays recover the already admitted end and never recompute it from now.

### Database and privileged-path qualification

The current service client is distinct from a caller session (`packages/database/supabase/admin.ts:15–46`), and `with-operation.ts:128–167` supplies it after authentication/role checking. Neither source-level application checks nor RLS keywords alone prove correct fine-grained issuance.

The exact native schema must enforce same-scope references among request, prior admission, recipient/principal revision, new effect, policy and allowed member lineage. Constraints must cover permitted resulting updates as well as insertion; a permitted row must not move to another tenant/principal or acquire a later end through a broad patch. Independent FKs are not equivalent to these joined invariants.

Use actual effective table/column/function grants, roles and composed policies. PostgreSQL may use USING for WITH CHECK when the latter is absent on UPDATE/ALL; a BEFORE trigger can change the proposed row before that check. Permissive policies combine by OR and restrictive policies constrain with AND. Missing a keyword is not itself a demonstrated vulnerability. [PostgreSQL CREATE POLICY](https://www.postgresql.org/docs/current/sql-createpolicy.html)

SECURITY DEFINER behavior depends on the function owner's privileges, table ownership, FORCE RLS and BYPASSRLS. Superusers/BYPASSRLS roles bypass; table owners normally do unless forced. Native service routes must still enforce current source authorization. [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

Supabase documents both table grants and RLS as relevant, and warns that user metadata can be edited by the user and JWT claims may lag changes. Neither a valid token nor cached membership proves live permission to issue or receive this grant. [Supabase RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security)

Actual denial tests must assert no unauthorized rows returned and no target mutation, not only no thrown exception. Exercise ordinary recipient, unrelated recipient, same-user other tenant/request, staff viewer without administrative power, bounded grant administrator, scoped worker and service/definer routes. The native privilege names and schema are not frozen in this research.

### Audit, delivery and recovery

The existing blocked Eve audit deliberately swallows recording failure while preserving refusal (`packages/api/src/eve/audit/control-decision.ts:58–69`). Its comment distinguishes that from operations whose audit is mandatory. A passing denial test therefore proves the refusal persists, not that all blocked attempts are durably recorded.

Successful fresh issuance needs its required source/audit facts and any admitted effect intent committed atomically through the proper owner. Do not use a best-effort denial logger as the successful-grant audit. Current generic audit existence and `await` are insufficient evidence of durability.

A committed grant with failed optional notice stays a committed source decision, subject to current restriction and its unchanged end. If policy requires another acceptance/proof before use, represent that separately; “granted,” “invitation sent,” “recipient confirmed,” “read requested,” “bytes emitted” and “saved by a person” must not collapse into one success flag.

Backup restore, mixed-version writers, delayed callbacks and administrative reactivation must not reactivate the old grant, recreate a revoked fresh grant, change a recorded end or replay old communications. If source evidence is missing after restore, deny affected reads while independently authorized source work and safe reconciliation continue. Do not manufacture new issuance from an email record or provider acknowledgment.

Original/preview delivery still obeys Q04/Q07: immutable byte/reference qualification before emission, current metadata/HEAD/range/conditional gates, per-chunk long-stream expiry and feasible termination on restriction. Expired source access does not prevent legitimate retained bytes or independently admitted technical processing; it prevents disclosure through that ended authority.

## Meaningful new bounded tests

**10 selected existing tests passed; 34 skipped by filter; 3 files; Vitest 5.0.3; reported duration 1.69s.**

| Existing file and lines                                                              | Executed proof                                                                                                                                                                                               | Limit                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/unit/packages/api/eve-model-policy-permissions.test.ts:35–118`                | Four tests: specialized super-admin shortcut, dedicated general-admin grant, denial without it, denial remains 403 when audit insert fails                                                                   | Mock grant lookup/audit client. Not actual P12 administrative ceiling, issuer/recipient race, DB enforcement or native permission. The super-admin behavior is source-specific, not recommended for Q08. |
| `tests/unit/packages/api/admin/contribution-refunds-dependency.test.ts:884–1031`     | Four tests: terminal result recovery without repeated work; different donation and different amount conflict before provider call; same-key ambiguous result recovery plus a new-key remaining-balance guard | In-memory DB and Stripe stubs. No live provider request, DB transaction/unique-race/locking/RLS, fresh-grant or replay-disclosure-after-revocation proof.                                                |
| `tests/unit/packages/api/admin/contribution-action-result-projection.test.ts:71–114` | Two tests: action-result identifiers/raw outcome redacted for a non-provider viewer, preserved for an authorized provider viewer                                                                             | Pure projection fixtures with supplied capabilities. No live authorization freshness, TTL, cache, browser or new recipient flow.                                                                         |

The Q07 timestamp/approval-control suites were not rerun. These selections answer different adjacent questions: dedicated administration, semantic-key mismatch/recovery and projection of internal outcomes.

Execution used Node 24.21.0, existing dependencies, `env -i`, dummy loopback Supabase values, HOME/temp storage in tmpfs, a read-only root bind, `.env.local` masked by `/dev/null`, and bubblewrap networking disabled. Command used existing `node node_modules/vitest/vitest.mjs run` with the three named files, `--no-cache --no-file-parallelism --reporter=dot`, and:

```text
Eve model-policy permission|recovers a terminal outcome without repeating local or provider work|rejects reuse of a refund key|replays an ambiguous full refund|redacts Stripe identifiers in the action result|preserves Stripe identifiers for provider-authorized viewers
```

The current run passed. An informational warning concerns future Vite native-config-loader compatibility; no configuration was changed.

## Essential later proof before activation

1. **Real authority:** view versus administrative scope/ceiling, self-benefit and current delegation constraints, eligible recipient and purpose; no broad staff/service-key substitution.
2. **Proved lineage:** prior ordinary admission existed; original end/completion unchanged; exact same-or-narrower own-member/Q05 scope; no unknown-history repair disguised as fresh access.
3. **Real transactions:** duplicate/retry/concurrent issuance, same key with conflicting context, lost response after commit, absent-row races, revoke/rebind/policy/issuer changes in both orders; inspect actual committed facts.
4. **Outcome disclosure:** internal recovery can succeed while returned private result is denied/redacted under current authority; no reusable stored URL or broad result JSON.
5. **Separated effects:** grant success/notice failure, delivery success/response loss, notice delayed past expiry, source revocation before dispatch, queued technical work afterward; no new grant or clock reset.
6. **All serving paths:** exact private metadata, preview/original, conditional/range/resume, cache/CDN/browser histories, current proof, expired old token and deliberate same-request re-entry; no automatic download or enrollment.
7. **Restore and coexistence:** old/new writers, rollback, restored earlier state, revoked/new authority history, provider outcomes and replay; preserve independently valid work without disclosure or repeated issuance.
8. **User/operator truth:** staff sees permitted consequences and a current end before confirming; stale review conflicts; safe recipient ended/help/new-access states; no promise that email was received or a file saved; actual governed help works.
9. **Unresolved policy dependencies:** finite fresh duration/anchor, repetition and exact authority binding, active-request source contract and any selected communication must be resolved explicitly before the relevant profile is enabled.

This is a focused review of the Q08 boundary, not a whole-system certification. Current official PostgreSQL documentation resolved to version 18; deployed PostgreSQL and effective Supabase policies were not queried. No current test establishes the native fresh-access feature, real-role enforcement, provider behavior or recipient experience as working.
