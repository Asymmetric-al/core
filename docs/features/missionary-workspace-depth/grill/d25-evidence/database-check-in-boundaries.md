# D25 — Written check-ins: database and disclosure boundaries

Research only, **October 17, 2026 UTC / Asia/Bangkok**. The founder selected A: optional organization-provided written questions, with voluntary answers and a useful freeform path. D8 and D24 remain distinct disclosure contracts. This note proposes constraints and proof obligations, not a migration, new permission engine or implemented service. The Q25 frontier was read before its answer/status update; its earlier unanswered wording does not override the current selection.

**No new PostgreSQL experiment is warranted or run.** The new risk is the real composition of question meaning, private drafts, exact shared response versions and current coaching authority. Prior isolated D8/D16/D24 evidence establishes only its stated mechanics/source inspection. Another seeded toy would not qualify this producer, body retention, P12 integration or hosted grants. No previous experiment was rerun.

## Source reconciliation and actual implementation limits

| Source inspected                                                                                                                                                                                                                                          | Consequential fact and limit                                                                                                                                                                                                                                                   |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Founder brief §10](../phase28-founder-brief.md:225), [P28 owner constraints](../../../../prds/program-roadmap/owner-constraints.md:118)                                                                                                                  | Qualitative check-ins are separately chosen, voluntary coaching context; goals/metrics and operational obligations remain separate. No compulsory reporting or care-data copying follows.                                                                                      |
| [D8 C07–C15](../phase28-d8-adversarial-review.md:469)                                                                                                                                                                                                     | Current exact episode/source rights govern disclosure. Coach is read-only; narratives declare their audience; private CRM/care/history cannot be relabeled as coaching. Retention is not access.                                                                               |
| [D11 duration](../phase28-d11-coaching-duration-decision.md:16), [D24 C07–C10](../phase28-d24-coaching-activity-summary-adversarial-review.md#c07--explicit-same-target-continuation)                                                                     | An ongoing duration and standing numeric-target period scope do not share future written answers, private drafts or old answer revisions.                                                                                                                                      |
| [P12 current authority](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1540)                                                                                                                                          | One canonical fine-grained PDP, exact validated active Tenant context and current source purpose; coarse Tenant RLS is a backstop. Additive independent grants remain distinct. Service authority has its current owner ceiling.                                               |
| [P27 voluntary contribution projection](../../../../../openspec/changes/add-donor-development/specs/donor-development/spec.md:6835)                                                                                                                       | The active change preserves voluntary contribution and separation from tasks. It is an intent projection, not evidence a D25 response service exists.                                                                                                                          |
| [FORM-04 reference](../../../../prds/program-roadmap/source-2026-09-22/assets/ws/form-blueprints/FORM-04.json:1)                                                                                                                                          | Disabled `reference_blueprint` names possible check-in/retention contracts. Those strings and illustrative field limits do not establish callable owners, mandatory fields, production tables or a requirement to build Workflow Studio.                                       |
| [Member-care migration](../../../../../supabase/migrations/20260414180338_member_care_foundation.sql:1), activity table at 68; [care reader](../../../../../packages/api/src/reads/member-care.ts:341)                                                    | Current `last_check_in`, care activities and private notes belong to member care. The reader uses an admin client and care-specific fields. These are not the new voluntary coaching-answer source. Reuse by matching “check-in” would import the wrong purpose and lifecycle. |
| [Field classification](../../../../../supabase/migrations/20261005050728_field_policy_foundation.sql:820)                                                                                                                                                 | `missionaries.last_check_in` is care-classified; missionary/public/export visibility is false in these static rows. A new coaching draft/shared-answer profile cannot inherit it by name or manufacture a permissive fallback.                                                 |
| [Projection resolver](../../../../../packages/api/src/projection/resolver.ts:7), [field reader](../../../../../packages/api/src/field-policies/reader.ts:52), [missionary wrapper](../../../../../packages/api/src/missionary-portal/route-helpers.ts:14) | Resolver explicitly acquires no authority or I/O; field reader loads a static ceiling; wrapper currently requires a role and supplies an admin client. None independently proves current check-in author/audience/source authorization.                                        |

A fresh bounded search for check-in, qualitative and question-template terms in API, database package, missionary app, migrations and OpenSpec found the care paths above and reference/intended contracts, not a qualified D25 producer. This is not a whole-repository absence proof or a hosted vulnerability finding. Effective deployed tables, grants, ownership, policies, functions, transport access and retention remain uninspected.

## Smallest coherent source lifecycle

Keep these concepts in the existing P28 coaching owner and existing source-sharing/P12 boundaries. They describe required meaning, **not a mandate for one table per concept** or a generic publication framework.

1. **Organization questions:** authorized tenant staff maintain a bounded optional set. Stable question identity and immutable accepted question wording/version distinguish “the same prompt edited” from another question. Ordering is presentation, not answer identity. Retire a question from future selection without silently deleting or rewriting lawful earlier answers. Template management grants no response-body, draft-existence or completion-report access.
2. **Private draft:** current author/subject and Tenant bind the draft. It preserves the exact question versions used, including skipped questions and independently authored context. Reordering or changing current questions cannot relabel existing text. No-question/freeform entry works without fake template IDs. Server-backed recovery uses the current owner boundary; an autosave is not publication or a durable public audit of every keystroke.
3. **One current shared revision:** deliberate Share binds the exact reviewed answer revision and normalized named recipient set in the exact coaching context. The shared pointer never follows the latest mutable draft. Editing an already shared check-in creates private work until deliberate Update. Its preview shows every retained recipient, addition and removal. One accepted update atomically replaces the current shared revision and audience; no per-coach content branches are introduced. Different wording belongs in a separate check-in.
4. **Current recipient authority:** saved recipient membership records intended scope, not perpetual permission. Each release intersects the exact current episode/module/source rights, source restrictions and expiry. An expired/revoked recipient cannot return merely because an old saved list still contains their identifier. Another coach, replacement episode or new active hat requires the exact deliberate qualified inclusion; a name/email/role match is insufficient.
5. **Withdrawal and correction:** removing a recipient or stopping this check-in's sharing fences further release independently of private edits and other modules. Retained old revisions/receipts are historical evidence, not coach-visible revision history. A correction is deliberate replacement of the shared revision, not silent editing of what a previous receipt meant. Withdrawal does not promise recall of bytes already seen; lawful retention and erasure remain separate. A new explicit share after withdrawal uses current review/authority and cannot be an old command retry resurrected.

The one shared revision is compatible with different effective current access: a recipient whose grant ends sees nothing, while another independently authorized recipient may still see that same current revision. Do not copy bodies into per-recipient stores to implement this intersection. No template edit, numeric-sharing rollover, new coach acceptance, background scheduler or AI action implicitly publishes a draft. Newly authored text still must satisfy the source's sharing eligibility; merely labeling copied care history “new text” supplies no authority.

## Minimal structural invariants and command boundary

| Invariant                      | Minimal enforcement direction; actual owner/schema still needs qualification                                                                                                                                                                                                                                                                                           |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Exact identity and Tenant      | Non-null Tenant plus source-owned check-in/author/subject/typed ministry references. Composite Tenant/resource references or the owning equivalent prevent cross-tenant links. Authenticate and validate selected references server-side; client IDs are selectors, not authority. Entity-bearing sources retain their owner-required inner scope.                     |
| Question-to-answer meaning     | A question answer references the exact same-tenant question version used by its draft/response. Do not join old answers to `latest_question`, array position or current text. Explicit freeform context is its own permitted variant, not a null that disables every question check.                                                                                   |
| Version and head               | Accepted content/question versions are not updated in place. Positive source versions and an expected head protect save/update; the current shared pointer must reference a version of that same check-in, not merely some same-tenant response. Immutability does not require retaining bodies forever.                                                               |
| Audience                       | Uniqueness for each exact recipient/episode in a current recipient set; all belong to the same intended check-in/context. Normalize duplicate/order-only input before comparing intent. Empty audience grants nobody, never all. Do not encode current authorization in a writable `is_allowed` flag.                                                                  |
| Atomic publication             | Exact accepted revision, audience replacement, source transition, required audit and durable command result commit together. Reject the whole publication if an included part is unauthorized or stale; no body-new/audience-old intermediate state. Any separately required notification intent follows its existing owner; D25 itself adds no notification behavior. |
| Durable retry                  | Reusing an intent with changed body revision, recipient meaning or target conflicts. Same accepted intent recovers the original effect, with current receipt-read permission and no old-body disclosure by default. Source head/currentness and semantic effect identity prevent duplicates; a fresh request key cannot evade stale-review or stopped-scope guards.    |
| Private fields and attribution | Generic UPDATE cannot move Tenant, author, subject, question reference, shared pointer or disclosure state. A same-tenant editable row is not permission to change every column. Coach has no business mutation; qualified self-leave/preferences stay separate.                                                                                                       |
| Retirement/deletion            | Retiring a question or removing a membership cannot cascade-delete required check-in/evidence history. Actual owner retention may later erase/restrict bodies; retain only lawful minimum provenance. Do not retain raw answers inside general audit/receipts as a workaround for body expiry.                                                                         |
| Limits and rendering           | Validate supported question/answer counts, lengths and format through actual owner contracts, not illustrative FORM-04 numbers. Parameterized persistence and safe rendering are separate requirements; stored questions/answers remain untrusted content. No arbitrary HTML/embedded active content or new upload channel is implied.                                 |

PostgreSQL cannot enforce cross-table consistency with a `CHECK` expression that simply reads another table: those checks are not continuously maintained when the referenced row changes. Use real unique/foreign-key constraints and the qualified command for current state/authority. A composite FK ordinarily skips enforcement if a referencing component is null; required references need NOT NULL, and a valid freeform variant needs explicit shape validation. A unique revision number or `ON CONFLICT` alone does not prove semantic idempotency, correct payload, current authorization or head ownership. Index the actual Tenant/author/current-head/recipient-episode lookup and required retention/recovery paths after the shape is known; no speculative indexing catalogue is needed.

These are multi-record privacy-bearing commands under `packages/api`, not collection-safe generic browser updates. A one-field autosave still cannot touch shared state or inherit permission to read another person's draft. Do not add draft bodies to a broadly readable missionary row just because it already has a field named `last_check_in`.

## Current authority, RLS and service paths

P12 remains the fine-grained decision source. Coarse Tenant RLS must use the same trusted Tenant context; it does not decide which coach sees which revision. The output/source policy must distinguish question administration, own draft editing/reading, publication, withdrawal, current coach reading and lawful restricted evidence access. These are source actions within existing authority, not a second grants engine. A role label, user-controlled metadata, stale JWT grant array or client `author_id` cannot resolve them.

Inspect all effective schema/table/column/function grants and RLS policies. `USING` filters old rows; applicable `WITH CHECK` validates resulting rows. **When an ALL/UPDATE policy omits WITH CHECK, PostgreSQL uses its USING expression for the new-row check.** The skill's blanket omission-bypass claim is not correct. Nevertheless, a tenant-only predicate permits many forbidden same-tenant mutations unless commands/privileges enforce immutability and allowed transitions. Applicable permissive policies combine by OR; tests must cover the effective set. A zero-row mutation can mean hidden/stale/missing data rather than a completed save; report only the command's qualified outcome.

Views are not automatically safe or automatically RLS bypasses. Default underlying access uses the view owner's rights; `security_invoker` uses the caller's base privileges and policies. Do not grant all draft/old-revision base SELECT merely to make a shared-answer view run. Use the qualified bounded reader with minimum actual privileges. SECURITY DEFINER uses its owner's privileges; its presence alone proves neither bypass nor authority. Review ownership/BYPASSRLS/FORCE behavior, trusted `search_path`, explicit schema qualification and narrowly granted EXECUTE. New functions default to PUBLIC EXECUTE unless revoked; create and privilege changes must avoid an unintended exposure window.

A privileged service route cannot skip the same author, current sharing and source checks because database RLS is bypassed. Supabase request identity also depends on the actual authorization header, not only which key initialized the SDK. Deferred work re-resolves its proper current context; it does not impersonate the human. No client service key, temporary staff elevation, operator god-mode or raw care reader is a fallback. Direct DB/browser collections, REST/RPC, GraphQL, Realtime, loaders, previews, result recovery, support tools and any permitted egress must either use the qualified projection or deny.

## Required races and observable outcomes

These are production proof obligations, **not tests executed here**. Use actual source roles and transport paths, including more than one coach, another tenant, staff who only maintain questions and a service principal with restricted current authority.

| Race / adversarial case                                                          | Required result                                                                                                                                                                                                                                                                                              |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Question wording/reorder/retirement versus draft save                            | Existing text remains bound to the version the author used; new questions do not silently acquire old answers. A safe refresh preserves authorized draft input. Retirement alone does not rewrite lawful history; a genuine source restriction still governs release.                                        |
| Two private-draft saves                                                          | Expected-version handling prevents last-writer silent loss. An older autosave cannot overwrite a later deliberate edit. Neither save alters the shared revision or audience.                                                                                                                                 |
| Share versus later draft edit                                                    | Share accepts exactly the reviewed draft revision, or conflicts if that review is stale. It never publishes whatever happens to be latest at execution time. Later private text stays private.                                                                                                               |
| Concurrent publication/recipient changes                                         | One coherent accepted head wins; the other intent conflicts/reviews current state. No mixed body/audience, silently omitted recipient or two current content branches. Order-only recipient input is equivalent; changed set is not.                                                                         |
| Stop/recipient revoke/expiry versus Update, both orders                          | If reduction wins the applicable fence, later stale publication cannot reactivate it, including with a new request key. If valid publication wins first, reduction subsequently blocks future release; accepted history does not authorize a later read. A previously delivered response cannot be recalled. |
| Grantor loses sharing authority or organization disables the purpose during Save | Current qualified owner checks prevent the new acceptance. A cached allow/active JWT cannot override the current fence. Do not infer that loss of ordinary edit permission removes every separately permitted read or lawful stop action.                                                                    |
| Shared read/preview versus restriction or correction                             | Return one coherent currently authorized revision or a neutral unavailable result. Old body with new question/audience metadata is invalid. Permission/source changes fence caches and late responses; an Updating badge does not justify continued forbidden body display.                                  |
| Lost Share/Update/Stop response and repeat under same intent                     | Recover the original durable outcome under current receipt-read rights; do not duplicate publication or reopen removed access. Changed meaning conflicts. Receipt is not an alternate raw-body/history endpoint.                                                                                             |
| Required audit/storage failure inside publication                                | No accepted disclosure/head/audience change remains without its required evidence. A later optional external failure cannot reverse a committed source result or justify repeating it. No database locks across network/user waits.                                                                          |
| Unrelated/new coach or new episode reuses old recipient identifier               | No inherited answers or draft existence. Any new inclusion identifies the new exact audience and current episode deliberately. Existing unrelated additive rights are evaluated in their own context.                                                                                                        |
| Delete/restore/cache recovery                                                    | Question retirement, account removal and restored old data neither erase required lawful evidence accidentally nor restore disclosure. Restricted/expired bodies stay unavailable through receipts, search, history and restored caches.                                                                     |

Read Committed allows successive SELECTs inside one transaction to see different committed states. Fetching draft, audience and grant separately without a qualified head/currentness boundary can therefore form a review that never existed. Use the established source transaction/CAS and current P12 acceptance/release fence, with a consistent lock/validation order appropriate to the actual producer. Snapshot consistency alone cannot establish current disclosure after revocation. This is not a requirement for global Tenant locks, a new workflow engine, distributed transactions or an additional confirmation dialog.

## Material findings — all eight dimensions

### DB25-F1 — Question administration becomes response authority

1. **Harm:** staff or another coach reads private drafts, answer existence or shared histories through a template/admin query.
2. **Severity:** critical disclosure.
3. **Likelihood:** plausible if “organization owns templates” is implemented as one CRUD permission.
4. **Cause:** question maintenance, author ownership and recipient rights are conflated.
5. **Evidence:** D8 C09/C11/C12, P12 current context; existing check-in names belong to care.
6. **Effect on A:** retain optional questions but separate the source actions and projections.
7. **Clause:** “Question administration SHALL confer no response, draft-existence or submission-report entitlement. Each check-in read or mutation SHALL use its exact current source/P12 purpose; coach access SHALL remain read-only.”
8. **Proof:** question-only staff denied draft/body/count/search access; exact permitted coach succeeds; other coach, tenant and unrelated hat denied; service path has the same boundary.

### DB25-F2 — Current prompt text rewrites an old answer's meaning

1. **Harm:** an answer is displayed under a materially different question, or retirement destroys its context.
2. **Severity:** high integrity and potentially critical disclosure.
3. **Likelihood:** likely with mutable text or array-position keys.
4. **Cause:** answers point to current template state instead of exact question revisions.
5. **Evidence:** selected reusable-question capability and PostgreSQL FK/constraint rules; FORM-04 is only a reference.
6. **Effect on A:** pin meaning while keeping the administration UI small.
7. **Clause:** “Question edits/reordering/retirement SHALL NOT relabel existing draft or accepted answers. Each answer SHALL preserve its exact qualified question version; freeform context SHALL remain usable without a template. Retention/restriction SHALL govern historical bodies independently.”
8. **Proof:** wording change, reorder, delete/retire, cross-tenant question, reused ID and erased-body cases; no guessed reconstruction from current template.

### DB25-F3 — Private edits publish automatically

1. **Harm:** a coach sees unfinished or unintended text or a retained recipient receives a correction meant for someone else.
2. **Severity:** critical disclosure.
3. **Likelihood:** plausible with a shared pointer to the mutable draft.
4. **Cause:** save, accepted revision and audience replacement are one generic PATCH.
5. **Evidence:** D8 audience declaration and separate D24 numeric scope; root's bounded single-current-revision proposal.
6. **Effect on A:** preserve deliberate Share/Update and one content branch.
7. **Clause:** “Private editing SHALL NOT change the shared revision. Deliberate publication SHALL atomically bind one exact reviewed response revision and exact reviewed recipient set, showing retained recipients and additions/removals. Old accepted revisions SHALL not imply coach history access.”
8. **Proof:** draft/save/share races; unauthorized member in a mixed audience rejects the publication; two concurrent updates never mix body/audience; no new revision is implicitly sent to a new coach.

### DB25-F4 — Stale Save or receipt reverses Stop

1. **Harm:** removed access silently returns from an old tab, new request key, retry, policy toggle or restored recipient list.
2. **Severity:** critical disclosure.
3. **Likelihood:** plausible under weak networks and concurrent tabs.
4. **Cause:** operation dedupe is mistaken for current source authority or terminality.
5. **Evidence:** D8 C07 and D11 ending rules; primary PostgreSQL isolation behavior.
6. **Effect on A:** use existing sharing commands, current fences and coherent revisions.
7. **Clause:** “Publication and release SHALL requalify exact current authority and source head. Withdrawal/revocation SHALL fence subsequent use; accepted receipts and persisted recipient identifiers SHALL NOT reactivate ended access. Result recovery SHALL remain separately read-authorized.”
8. **Proof:** both actual race orders, old/new operation keys, expired invite/episode, replay after narrowing, accepted receipt after source/body restriction and restored backup.

### DB25-F5 — Coarse RLS is mistaken for field and lifecycle protection

1. **Harm:** an allowed row is retargeted to another author/coach/revision or a broad view/service exposes drafts.
2. **Severity:** critical.
3. **Likelihood:** plausible if generic table grants replace the qualified command.
4. **Cause:** row eligibility is treated as permission to mutate identity, publish or read every version.
5. **Evidence:** primary policy/view/function/constraint documentation; current pure resolver and static field ceiling acquire no authority.
6. **Effect on A:** require structural keys and least effective grants without a SQL shadow PDP.
7. **Clause:** “Actual grants, old/new-row policy behavior, typed same-tenant references and immutable attribution SHALL preserve the qualified source commands. Coarse RLS SHALL not substitute for current P12 decisions. No raw draft/history SELECT or coach business UPDATE SHALL be granted merely to make a view work.”
8. **Proof:** effective policy combinations, same-tenant forbidden fields, cross-tenant FKs, invoker/definer ownership, PUBLIC EXECUTE, browser/RPC/service/Realtime and pooled-context paths.

### DB25-F6 — Immutable evidence becomes perpetual narrative exposure

1. **Harm:** withdrawn or erased text survives through receipts, telemetry, old revisions, notifications, caches or restore.
2. **Severity:** critical disclosure.
3. **Likelihood:** plausible with generic serialization and “keep all audit” defaults.
4. **Cause:** source provenance is confused with indefinite body retention and current permission.
5. **Evidence:** D8 source ownership/minimal projection, P12 all-egress boundary and source privacy obligations.
6. **Effect on A:** retain only owner-qualified evidence and bodies with independent disclosure checks.
7. **Clause:** “Retention and historical evidence SHALL confer no current narrative access. Ordinary audit/receipts/telemetry SHALL not copy raw answers or private question context. Restriction, erasure and restoration SHALL preserve the current boundary across all reached projections.”
8. **Proof:** withdrawn response/history link, body expiry, nested serializer, logs/error body, stale browser payload, restore and permission-safe recovery; current-authorized author recovery remains useful.

### DB25-F7 — Optional writing becomes another administrative engine

1. **Harm:** required-answer validation, no-template dead ends, mandatory submission reporting or per-coach content copies create pressure and operational burden.
2. **Severity:** high product/integrity impact.
3. **Likelihood:** plausible if imported form/care infrastructure drives the design.
4. **Cause:** reference blueprints and nearby care fields are treated as the accepted check-in contract.
5. **Evidence:** founder brief, selected A, disabled FORM-04 and P27 voluntary contribution.
6. **Effect on A:** keep bounded questions, freeform drafting and deliberate sharing within current owners.
7. **Clause:** “No question SHALL become a mandatory coaching report, score or source-work completion. The native path SHALL remain usable without configured questions; this capability SHALL introduce no general form builder, copied care ledger or per-coach parallel response history.”
8. **Proof:** no questions, all questions skipped with authored context, retired template, disabled template administration, no automatic task/notification/AI/metric effects and bounded authorized recovery without direct DB repair.

## Technical provenance and proof limits

Supabase and managed-runtime skills plus repository API/Supabase/backend/data-boundary rules were read for this review. Runtime was running/current with enforced unrestricted HTTP policy and no configured VPN; inherited proxy and TLS trust were preserved. The Supabase changelog was fetched first, followed by relevant current official pages. The upcoming October 30 automatic-grant change applies to new tables; **existing tables keep their grants**. It does not prove current project exposure or replace effective-grant inspection. No project connection, CLI apply, migration, Docker container, dependency or provider call occurred.

The exact primary fetches and raw-body hashes follow; times are UTC on October 17, 2026. Temporary raw/text bodies and text hashes are in `/tmp/phase28-d25-primary/fetches.json`. These are newly fetched bodies, not new hosted observations. Primary PostgreSQL rules correct the skill's broad claims about omitted WITH CHECK and automatic definer/view bypass.

| Primary source                                                                                                              | Fetched UTC             | Raw SHA-256                                                        |
| --------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------ |
| [supabase-changelog](https://supabase.com/changelog.md)                                                                     | `05:41:13.161603+00:00` | `15b3d0d1a7dc3b3f2c0af4788e49acfdf2d2edbd2613f22de0705fa43b1cf58b` |
| [api-grants](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically) | `05:41:31.916457+00:00` | `2aca1bab12bbbf44192096f39862f9a03fa0aa2d464885566a8d854a44bc7b7b` |
| [supabase-rls](https://supabase.com/docs/guides/database/postgres/row-level-security.md)                                    | `05:41:31.149392+00:00` | `9398df00c60160ffbbdf9b53f02e61bd34db000d291152a3268a00a95e4cdac8` |
| [pg17-policies](https://www.postgresql.org/docs/17/sql-createpolicy.html)                                                   | `05:41:33.428169+00:00` | `1772bf6791789204d77a0ed3e35c0ff2f7ea988fb71f64a0b4b3a19908fad6a6` |
| [pg17-constraints](https://www.postgresql.org/docs/17/ddl-constraints.html)                                                 | `05:41:32.627854+00:00` | `dadc6166e3dcae0a1c91ada5373ef046682876b6db32e8c771338a4cb9b8c4be` |
| [pg17-view](https://www.postgresql.org/docs/17/sql-createview.html)                                                         | `05:41:32.568704+00:00` | `528ba275d3b79ff228d32985c6833387b50ca918b275c96cf7c43bbd95ad1ef4` |
| [pg17-functions](https://www.postgresql.org/docs/17/sql-createfunction.html)                                                | `05:41:33.010565+00:00` | `887e05c52a98890006d7d63cd1dcbb933309376ff78967bef6693f247dddbf43` |
| [pg17-isolation](https://www.postgresql.org/docs/17/transaction-iso.html)                                                   | `05:41:33.305926+00:00` | `e3475df0c76b214dbda0bc681015099763b83778e1355e17ee7b908e6fd38a26` |

Static local snapshot hashes identify what was inspected, not deployment. Q25 is specifically the **pre-answer/status-update snapshot**; later documentary updates do not retroactively change this readback.

| Repository-relative source                                                                | SHA-256                                                            |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `docs/features/missionary-workspace-depth/grill/phase28-q25-check-in-prompts-research.md` | `241d281727d9f9b1de7d96d108646e2f9f34ff1d331151c57324b63587adda47` |
| `docs/prds/program-roadmap/source-2026-09-22/assets/ws/form-blueprints/FORM-04.json`      | `c6c2be508dac4512d1920b894646f216053b7951c58efe92d7e2297f0be73dda` |
| `supabase/migrations/20260414180338_member_care_foundation.sql`                           | `5ec64116c64341ea0f4d90cae4d70e250f686f9daf5ff06362e4d046a0787a5a` |
| `supabase/migrations/20261005050728_field_policy_foundation.sql`                          | `6b221d88f06ff31b05aad192060254a024cf8e16eb7b396f698b5a9b155ea169` |
| `packages/api/src/reads/member-care.ts`                                                   | `291d03defb329a519712f689089c42b26e19ae830dbec6625a25e59563d31308` |
| `packages/api/src/projection/resolver.ts`                                                 | `c5d1c88253c963a34c23f0f034dd741d5e3a364374099c42d8facb5951b63304` |
| `packages/api/src/field-policies/reader.ts`                                               | `aa744a071c07d8cbb2ed1f719fce4172fefdb53c73c91c37be558c422a04e90f` |
| `packages/api/src/missionary-portal/route-helpers.ts`                                     | `ae5dd954e7e617ef32677365c878b036153f7ff5bac40db4630e88ac41791986` |

Remaining release gates are the actual P28 check-in/question owner and current source profile; usable body/draft retention and recovery; exact role/grant/command/transport composition; real concurrent acceptance/release tests; renderer/egress proof; capacity and UI comprehension. This note supplies no PostgreSQL assertion count, no production authorization or body-retention proof, and no claim that prior toy experiments implement D25.
