# D21 independent authorization, data and query review

12 September 2026. Scope: founder-selected **A — Optional labels from a curated Support list**. D1–D20 are ratified. D21's reviewed amendments remain proposals until founder ratification. Source-only audit in verified Ubuntu-24.04 worktree `/home/conrad/code/core-worktrees/grill-with-docs-2026-09-10`; root-provided current baseline `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`.

Read root/scoped API, database, Supabase and admin AGENTS; canonical Supabase skill, backend rules, data-access guide, platform-boundaries/principles OpenSpec, P9/P11 owner contracts and relevant D3/D10/D15/D16/D17/D20 decisions. No source/schema/runtime/provider/GitHub mutation, database query, credential read, live exploit, migration or actual-user test occurred. This is an independent input to the full 23-category synthesis, not a substitute for it.

## Disposition and permanent path

**Accept with required amendments.** Optional curated labels are a proportionate Support capability. Existing code does not yet enforce that product choice. Retain one flat Support vocabulary and original-endpoint memberships; establish a single authoritative command boundary with current capability/source checks and durable mutation history. Reuse Core's established identity, classifications, history, query/list and lifecycle primitives where qualified. Do not convert this into a CRM Party tag, generic taxonomy builder, custom-field system, second saved-view engine or label-triggered automation feature.

The highest-priority corrections are permission separation across API and SQL, exact idempotent membership commands, preserving D10 original custody, preventing destructive catalog retirement and incomplete hydration from changing meaning, and converging fixture/server/cache paths before activation.

### Concrete scope proposal checked with the root

Use **one flat tenant Support catalog**, visible to current eligible tenant Support staff, with no private-label, inbox-specific catalog or ordinary per-label ACL machinery. Catalog metadata must be reusable non-sensitive wording. Delegate catalog management through the existing Support-configuration capability in IAM; do not infer it from handling assignment, D18 publishing or D19 review responsibilities. Applying/removing a label independently requires current handling authority on the exact original endpoint(s). Staff who hold both may manage and apply; this is not a new named role.

Catalog visibility does **not** authorize usage counts, the existence of a restricted conversation, inbox distribution, historical source bodies or related CRM facts. Those remain scoped to permitted source facts. Accidentally sensitive catalog text must still be suppressible/correctable by its actual privacy owner; a flat catalog is not a forever-readable exception. Archive is the sole ordinary retirement action; omit ordinary hard-delete and label-merge UI. Actual privacy disposal remains source/records owned. These concrete product boundaries fit current P9/P11/Core contracts without requiring an implemented universal tag service or a per-label permissions platform.

Severity below describes plausible impact if shipped without the fix. Likelihood is qualitative conditional engineering reasoning, not observed ministry incident frequency.

## 1. Curation is not enforced by either exposed API or SQL

**Material concern: Yes. High severity; high likelihood if current scaffold is reused unchanged.** Anyone passing the broad Support staff/admin/super-admin gate can create/update/delete labels through routes. The adapter uses the admin client and scopes only by tenant. Current SQL independently grants authenticated CRUD to both catalog and membership tables, with same-tenant staff policies. UI-only curator controls would therefore be bypassable. Read and write access to a restricted conversation are also not implied by broad staff membership.

Evidence: [route gate](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/route-helpers.ts#L31), [catalog POST](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/app/api/admin/support/labels/route.ts#L21), [catalog PATCH/DELETE](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/app/api/admin/support/labels/%5Bid%5D/route.ts#L12), [service client](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L73), [table grants and policies](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/supabase/migrations/20260515025814_support_hub_core_modules.sql#L546).

Both `USING` and `WITH CHECK` **are present** for UPDATE; the defect is their insufficient row/operation meaning, not missing syntax. They permit same-tenant staff mutation without the newly required curation/application distinction. A current same-tenant relationship could be retargeted to a different conversation through direct DML without checking that source's handling rights. The `is_super_admin()` bypass branch is explicit; do not treat it as a permitted ordinary tenant-curator shortcut.

**Exact correction:** “Vocabulary maintenance requires the current qualified catalog-maintenance capability. Applying/removing an existing label requires current handling authority on every affected original conversation endpoint and current eligibility of the label. Neither capability grants the other, source-body/CRM access, tenant-wide administration or a privileged service identity. Tenant, actor and audit attribution derive from trusted current server context. Every API, direct SQL/Data API path, RPC, worker, macro and privileged writer preserves these boundaries; new UI controls alone are insufficient.”

Prefer owner commands and revoke client DML for operations that require lifecycle/audit/multi-endpoint atomicity. Retained read policies must enforce actual allowed catalog/source disclosure. If any browser write remains, prove narrow column grants, immutable fields, old-row `USING`, new-row `WITH CHECK`, endpoint authorization and history invariants together. Do not leave a weaker alternate path.

**Proof:** curator/applicator/read-only/cross-inbox/revoked/other-tenant/nonstaff/anonymous matrices for GET/POST/PATCH/DELETE and direct authenticated SQL; tenant/actor/created-at tampering; same-tenant forbidden endpoint substitution; admin/service commands with missing authority; source restrictions after preview and before commit.

## 2. Toggle is not a retry-safe business command

**Material concern: Yes. High severity; high likelihood under repeated clicks, response loss or concurrency.** The default mode is `toggle`; the conversation menu omits mode. The server reads hydrated membership then decides whether to insert/delete. Retrying an uncertain toggle can reverse the successful first action. Two simultaneous adds can both observe absence and one receives a unique violation. An explicit Add alone is insufficient if an old request is retried after a later Remove.

Evidence: [schema default](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/schemas.ts#L47), [read-then-write adapter](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L870), [menu mutation](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/components/detail/ConversationLabelMenu.tsx#L93).

**Exact correction:** “Submit explicit Apply or Remove intent, stable label/original scope and a durable operation identity; never retry an inversion. Bind reviewed state to a qualified current revision/generation. Replaying an operation returns its original outcome without applying it again or reversing later edits; distinguish that historical outcome from the current projection. Concurrent same-result requests converge without duplicate membership or fabricated history. Conflicting intent, changed source topology or changed label lifecycle returns a clear conflict instead of silently rebasing.”

Postgres `ON CONFLICT` can make a single insertion atomic, but is not the entire multi-source command, authorization or idempotency solution. [PostgreSQL 17 INSERT](https://www.postgresql.org/docs/17/sql-insert.html).

**Proof:** duplicate click; same request delivered twice; lost response; A-Apply→B-Remove→old-A replay; concurrent Add/Add, Add/Remove and Remove/Remove; retry after permission revocation; reconnect with stale selected state; truthful no-op vs changed outcome.

## 3. Preserve D10 original membership; no flattened merge list

**Material concern: Yes. High severity; medium likelihood during implementation simplification.** D10 already requires membership to remain on original endpoints. The effective merged view is a permitted deduplicated union. Add anchors to the continuing origin unless the label is already effective; combined Remove targets exact contributors. Flattening labels onto the survivor or using a blind current ID at replay loses source evidence and makes Undo incorrect.

Evidence: ratified `docs/features/support-hub/grill/phase26-d10-adversarial-review.md:197–203`, especially D10-R24 at line201; D10-P39. This local ratified record is not a merged upstream implementation.

**Exact correction:** “D21 preserves D10-R24. Effective labels are a current authorized projection of original memberships. Reviewed combined removal records and validates its exact permitted contributors and topology. A concurrent merge/Undo or new contribution cannot cause an old command to remove a newly affected original. No partial unauthorized removal may be presented as complete. Merge/Undo alone emits no label application/removal command, notification or automation.”

**Proof:** overlapping/disjoint original labels, hidden originals, Add when already effective, multi-contributor Remove, permission loss on one original, merge/Undo racing Remove, and later fresh label edits surviving Undo.

## 4. Catalog deletion currently destroys membership; rename can retarget meaning

**Material concern: Yes. High severity; high likelihood during ordinary cleanup.** Deleting a catalog row cascades all current memberships. The UI explicitly describes that destructive result. Slug is editable while current server filters use slugs, so renaming an internal lookup can break saved queries. Ordinary catalog save is upsert by tenant+ID, and PATCH of a missing ID can create rather than signal stale/deleted state. Name or meaning changes have no explicit revision check.

Evidence: [catalog constraints](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/supabase/migrations/20260515025814_support_hub_core_modules.sql#L81), [cascade](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/supabase/migrations/20260515025814_support_hub_core_modules.sql#L277), [generic upsert](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L173), [catalog save](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L966), [delete wording](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/components/labels/LabelManagerDialog.tsx#L57), [slug filters](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L719).

**Exact correction:** “Catalog identity is stable and tenant-scoped; display names are not membership or predicate keys. A rename corrects wording for the same meaning. A changed meaning receives a new identity. Separate Create, Update, Archive and Restore commands; stale Update never creates or resurrects a definition. Archive stops new application and normal picker selection while preserving source-authorized existing memberships and exact historical/filter interpretation. Restore rechecks eligibility and conflicts and never replays prior actions. Ordinary Remove affects reviewed conversation membership only. Destructive disposal, if allowed, uses the actual owner restriction/reference/retention contract rather than cascading business associations.”

If duplicate catalog cleanup is needed, prefer explicit archive/new term and deliberate guarded membership correction over a speculative global label-merge engine. Do not silently merge labels by spelling/case/slug, especially during migration. Keep D20 invalid-reference outcomes intact.

**Proof:** rename preserves filter/membership identity; different-meaning rename refused or creates distinct identity; archive vs Apply race; stale edit/Restore race; same-name collision; archived filters remain exact; restricted-name display cannot leak; old clients cannot recreate retired rows; referential integrity remains provable after disposal.

## 5. Incomplete hydration can fabricate No labels and change mutations

**Material concern: Yes. High severity; medium likelihood dependent on tenant shape.** `conversationLabelsById` loads all tenant memberships/catalog rows without explicit paging. It silently skips a join whose catalog row is absent. Per-conversation output substitutes `[]` when no hydrated entry exists. Thus truncation or incomplete hydration can become an apparently unlabelled conversation; the toggle uses that projection as write authority. Current local Data API config is 1,000 rows, while conversations separately use a 2,000 pre-filter cap. These are source limits, not deployed measurements.

Evidence: [unpaged helper](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L143), [join hydration and silent continue](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L415), [limit before filter](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L689), [local max_rows](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/supabase/config.toml#L16).

**Exact correction:** “Authoritative label membership tests use complete source-qualified database predicates, never hydrated browser or capped tenant snapshots. D20 Any/All/No labels, totals and pagination operate before limits using identical semantics. Missing/denied/incomplete metadata is distinct from confirmed no membership. Read only the relevant original endpoints and authorized catalog references; paginate the catalog and use stable ordering rather than loading every tenant join for each interaction.”

Keep composite membership uniqueness and both tenant-aware foreign keys; the existing `(tenant_id,label_id)` index is useful evidence, not sufficient query-plan proof. Use indexed EXISTS/anti-EXISTS or equivalent qualified shared query constructs and prove plans with realistic distributions. Do not hard-code arbitrary performance promises from these observations.

**Proof:** over 1,000 memberships and 2,000 conversations, oldest relevant match, low-cardinality common label, one huge tenant, missing catalog hydration, retired label, constrained viewer, Any/All/No labels plus pagination/count consistency, and query-plan/load evidence.

## 6. Mutation/history/clock effects are split and over-broad

**Material concern: Yes. Medium severity; high likelihood on a response or write failure.** Membership insert/delete is followed by a separate conversation update to `updated_at`. No catalog or membership actor/history appears in those paths. Failure after the first write yields an error even though the label changed. Replaying may compound the problem. Updating a generic timestamp can reorder work or accidentally renew downstream retention if other code incorrectly treats it as meaningful activity.

Evidence: [split write](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L878), [generic updated-at](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L186), [automatic timestamp trigger](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/supabase/migrations/20260515025814_support_hub_core_modules.sql#L599).

**Exact correction:** “Commit the label state change, operation result, trusted actor/time and minimum durable change evidence atomically. Separate necessary technical revision changes from meaningful message/work clocks. Label edits do not reopen or resolve work, renew D17 retention, reset D14 targets, update CRM last-contact, add a conversation message, or trigger D15 following. Routine technical logs contain IDs/operation/outcome without duplicating label descriptions or private source content.”

**Proof:** failure injected before/after commit and before response; history uniqueness and truthful reconciliation; unchanged status/reminder/reply due/content expiry/message counts/CRM interaction; legitimate source restriction still takes precedence over old labels/history exposure.

## 7. Current caches and fixture stores are not source-safe authority

**Material concern: Yes. High severity for disclosure; medium likelihood conditional on context lifetime.** The live label hook uses a shared key with no tenant/principal/scope. GET gives no visible per-response cache policy in the route. Invalidation covers the broad root. Separate browser collections remain mutable fixture-backed stores. This proves multiple present models and unscoped keys; it does not prove a deployed cross-tenant cache leak without the full provider/session lifetime.

Evidence: [live hook](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/hooks/use-support-labels.ts#L20), [canonical keys](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/database/query-keys.ts#L47), [query defaults](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/lib/api-client.ts#L7), [fixture collection](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/database/collections/support-hub.ts#L2210), [actual server adapter selection](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/index.ts#L9).

**Exact correction:** “The single qualified server owner supplies catalog and membership truth. Browser collections/hooks are scoped projections, never separate writable authority. Bind cache/query identity to tenant, trusted viewer/authorization context and declared scope; fence late responses across tenant/identity changes and invalidate on relevant catalog/source restrictions. Denied or failed data is not an empty healthy catalog. Remove fixture paths from production activation while retaining isolated fixtures for tests.”

**Proof:** tenant/account switch with unresolved request, revoke while picker open, another tab archives a label, stale offline response, cached denied metadata, browser reload persistence, no fixture bleed, and explicit distinction of loading/error/empty.

## 8. Alternate writers must converge, including macros and bulk paths

**Material concern: Yes. High severity; medium likelihood if only the visible picker is upgraded.** The server macro runner directly invokes adapter label changes. Bulk UI applies labels per row and current registry wrappers expose raw catalog commands. Existing automation definitions contain label-trigger/action vocabulary but Phase34 is the sole configurable engine. Replacing only the picker/API route leaves these paths weaker or accidentally activates unaccepted behavior.

Evidence: [server macro label operations](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/mutations/run-macro.ts#L79), [bulk application](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/components/table/bulk-actions.tsx#L111), [registry wrappers](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/mutations/registry.ts#L38), [scaffold automation vocabulary](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/database/collections/support-hub.ts#L76).

**Exact correction:** “Every allowed label writer calls the same owner command. Existing legacy direct writers are fenced before activation; no automation or broader macro permission is accepted through D21. Bulk operations use an explicit bounded selection, per-item current authority, durable operation identities and truthful partial results. Retry failed/unresolved items only; do not silently apply to newly matching saved-view results.”

**Proof:** macro/worker/browser/legacy/direct-SQL bypass attempts; bulk partial deny/failure; selection changes mid-flight; duplicated retry; no automatic action on catalog rename/archive/merge composition; minimal source history for actual effects.

## 9. Migration must preserve provenance without inventing history

**Material concern: Yes. High severity; medium likelihood if converting the existing catalog naïvely.** Current rows lack curator/lifecycle and membership-actor evidence. A migration cannot infer authors from current staff or transform an old slug into a stable semantic identity by fuzzy matching. Hard deleting before recording references breaks D20. Rolling back into current upsert/delete policies would reopen unsafe writers or resurrect archived content.

**Exact correction:** “Add compatible identity/revision/lifecycle/history boundaries and qualify current memberships before enabling new writers. Preserve existing stable IDs where sound; map only proven tenant-scoped references. Mark unknown historical actor/time/meaning provenance explicitly. Do not silently deduplicate by display name, retrofit labels onto old conversations, or backfill unlabelled work from current CRM facts. Fence old APIs/DML/macros and migrate D20 references with reviewed exact semantics. A kill switch disables writes while maintaining authorized reads and ordinary unlabelled Support work. Rollback may not restore weaker write grants or resurrect retired definitions.”

**Proof:** mixed-version migration; duplicate/case/Unicode labels; missing references; archived/removed input; rollback after new data; backfill retry; preserved D10 original endpoints; old authorization paths denied after activation.

## Shared capability fit and exclusions

1. **Reuse:** Core API data boundary, tenant/principal identity, current source access/classification, durable operation/history primitives, D20 shared list/query/reference contracts, shared base-maia UI. P11's stable field/option identities and retirement lessons are relevant where its actual field catalog is consumed.
2. **Do not claim an implemented universal tag service:** the migration search found a specific Support catalog and membership relation, not proof of a shared generic Support/CRM label owner. P9 Party tags and P11 configurable fields have different subjects and permissions. A flat Support vocabulary does not justify redesigning them.
3. **Do not broaden:** no arbitrary CRM fields, private personal tags, hierarchical taxonomy, automatic classification, source-free reporting snapshots, general tag merge engine, multi-step publication approval, mandatory Resolve labels, AI tool authority or provider integration is necessary for A.
4. **Privacy:** catalog names/descriptions and labels themselves can leak if staff encode case/identity/restricted-location details. Use reusable non-sensitive vocabulary, current classification/exposure checks and a source-owned correction path; do not treat a free-form label as consent/security or retain sensitive data in history/logs as a workaround. Catalog stewardship alone grants no body or CRM reads.
5. **Email Studio seam:** Create/Apply/Remove/Archive label is not authoring, publication, template preparation, P6 communication admission or Resend sending. Ordinary labels stay internal Support metadata. A future approved message field must qualify separately through P11/P17/P6; no automatic new merge token is accepted here.

## Authoritative invariants

- Tenant-scoped label identity is immutable; relation uniqueness is `(tenant, original conversation, label)` with same-tenant foreign keys. Current technical TEXT IDs do not force a UUID migration without value.
- Catalogue meaning and presentation are distinguished; rename does not repurpose historical meaning.
- Membership, minimal durable change history and operation result agree atomically. No API response or cached projection becomes write authority.
- Current catalog/application/source permissions are independent. Direct authenticated DML cannot bypass the command contract; service role is not authorization.
- An effective merged label is a permitted union of original memberships under D10, not a copied survivor fact.
- Archive prevents new application; existing permitted interpretation remains truthful. Failed/missing metadata is not confirmed absence.
- Optional remains optional: label/catalog availability cannot block normal unlabelled intake/reply/work resolution.
- No label operation changes source completion, recipients, CRM/giving/care truth, message chronology, targets, retention anchor or optional following.

## Technical-source qualifications and evidence limits

Supabase's current documentation distinguishes grants, per-operation RLS and service-role bypass; both old and resulting row states must be qualified. PostgreSQL17 documentation confirms table owners/BYPASSRLS roles bypass ordinary row policies, permissive policies combine with OR and reference constraints can create disclosure channels. This supports reviewing the complete grants/policies/functions path rather than trusting one safe-looking policy. [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [PostgreSQL17 row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html).

The inspected adapter unit tests mock Supabase and prove a required tenant scope, equality filter and tenant stamp; they do not prove actual grants/RLS, curator restrictions, transaction behavior or service-role boundaries. [Existing tests](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/tests/unit/packages/api/admin/support-hub/supabase-adapter.test.ts#L50). I did not execute those tests or a synthetic model. Source findings and proposed invariants must become real database/API/concurrency/migration/browser acceptance tests before release.

No confirmed new money-precision, external-provider, attachment-storage or database-financial-conservation concern is introduced by plain label metadata. Those domains were checked for accidental coupling and remain governed by prior decisions; inventing new contracts for them would expand scope.
