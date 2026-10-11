# D17 — optional governed default and stable initial choice

2026-10-10. Research-only source inspection at
`225c02e9499bd6c0d493223cd4b1a4120ff787e3`, with ongoing grooming changes. The
founder selected A: for unresolved initial choice, visibly prefill a proved sole
eligible list; with several choices use an eligible optional organization default,
otherwise ask. Prefilling does not start work or select a stage. D1–D16 remain
settled. This appendix recommends bounded source mechanics and exact safeguards,
not a formal schema, activation or implementation.

## Current source: usable precedents, no P27 default implementation

Fresh searches for `cultivation`, `stage.list`, `stage_list`, `stage_catalog` and
`stage_preset` across API, database package, migrations, admin and missionary source
again found no implementing P27 list/default/admission path. The existing CRM
grid remains donor lifecycle status and the workspace collection is explicitly
demo-only, as verified in [D16 implementation evidence](../d16-evidence/implementation.md).

There are concrete default-setting precedents, but they have different meaning:

- [Personal named-view schema](../../../../../supabase/migrations/20260611170000_crm_table_named_views.sql:1)
  says personal-only, one default per user/table. Its partial unique index at
  lines 20–22 enforces at most one default at that exact scope. Lines 24–28 enable
  RLS, revoke anon/authenticated access and grant service role. The create RPC
  at lines 137–167 clears previous default flags and inserts the new view within
  a function transaction; deletion at lines 265–336 locks the named rows and
  optionally promotes another view. These are examples of scoped uniqueness and
  compound persistence, not the correct scope, lifecycle or permission for D17.
  Personal views may be deleted; D15 retained stage lists must not inherit that rule.
- [Tenant table-preference schema](../../../../../supabase/migrations/20260611160000_crm_table_preferences.sql:18)
  has one row per `(tenant_id, table_id)` at line 29, a dedicated configuration
  audit at lines 32–45, RLS and service-only grants at lines 47–57. Its save RPC
  begins at line 182, locks an existing default row at line 215 and appends audit
  at line 280. This is evidence that governed settings and audit already have
  source-owned patterns; it is not evidence of P27 list-reference eligibility,
  permanent intent replay or handling of every create/withdraw race.
- [Tenant-default route](../../../../../packages/api/src/admin/crm/table-preferences/route.ts:243)
  explicitly separates its capability/delegation from contribution permissions
  at lines 254–277. The [service](../../../../../packages/api/src/admin/crm/table-preferences/service.ts:170)
  calls that domain RPC. Do not reuse the unrelated
  `crm.gift_history.manage_view_defaults` grant for P27 or infer that service-role
  access proves current human authority. The owning P12 capability mapping must
  qualify P27 configuration separately without adding manager approval.
- [Gift-history setting resolution](../../../../../packages/api/src/admin/crm/table-preferences/view-settings.ts:11)
  intentionally has user → tenant → system fallback. D17 does not authorize that
  hierarchy: no personal last-used, app-specific, Party-type, first-row or AI default.
- [CRM list service](../../../../../packages/api/src/admin/crm/service.ts:204)
  fetches `limit + 1`, returns a page and `hasMore` at lines 207–215. The
  [query hook](../../../../../packages/database/hooks/admin-crm-infinite.ts:192)
  caches pages and retains previous data. Loaded page length/search matches cannot
  establish complete eligible catalog cardinality. These sources are not a P27
  catalog reader or evidence that it is already unsafe.

## Smallest sufficient relational contract

After the owner qualifies the **actual catalog/source scope**, represent zero or
one optional governed default reference at that scope. A nullable typed reference
on its existing owner configuration is a simple candidate; a source-owned unique
settings row is also possible. If the chosen model instead uses per-list flags,
scope-bound partial uniqueness must enforce at most one. Do not maintain both
representations as independently writable authorities. D17 does not require a new
scope taxonomy, personal override hierarchy, applicability registry or rule engine.

The target must belong to that same authoritative scope through suitable composite
identity/reference constraints. A missing default is valid. A non-null reference
is only a candidate default: referential integrity cannot prove current new-use
availability or the caller's permitted use/discovery. The canonical source command
must validate current eligibility; its authorized projection returns only an
eligible usable initial choice or truthful no-choice/needs-choice/unknown outcome.
The source owner chooses exact capability names, shape and fields later.

Use the same bounded owner transaction/protocol for configuration revision,
default set/replace/unset, required history, durable effect result and relevant
list-availability dependencies. Reuse existing source result/audit conventions;
do not add a scheduler or distributed repair engine. Under D15 R06 an offered
withdrawal must convey and accept a valid dependent-reference disposition. For
this optional reference, clearing **only the matching default** in the same
source transaction is the smallest proposed permanent reconciliation; choosing
a replacement remains an explicit organization action. An ordinary withdrawal
action can show that consequence and accept it without a second confirmation.
Restoration does not reinstate the old default.

## Concerns, exact clauses and future proof

Severity/likelihood grade prospective implementation errors, not deployed incidents.

**I1 — “One option” is inferred from incomplete or unauthorized data. High / likely
if existing paged controls are reused literally.** The loaded first page, search
result, stale cache, permission-lost read and whole-catalog authorized result are
different things. Probe case 2 reproduces one loaded row with three source choices.
**Exact clause:** “Sole-choice prefilling requires a current complete determination
of the eligible set for this source context, after all disclosure/use filtering.
Partial, filtered, loading, stale or failed results do not establish zero or one.”
**Proof:** actual reader/API cases for zero/one/multiple, pagination/search, missing
coverage, revoked access and cross-scope cache reuse. Completeness need not mean
loading every row into the browser: an owner-qualified bounded query can establish
zero/one/multiple and the eligible default without disclosing hidden totals. No
raw count or hidden default-presence leak, and no mandatory unbounded catalog fetch.

**I2 — Optional default multiplies or names a valid-but-unusable list. High /
plausible.** A display name cannot be the reference. Two concurrent configuration
requests cannot install conflicting authorities. FK-valid retired/foreign-purpose
information is not permission to use the list. Probe case 1 shows a stored FK-valid
withdrawn default, then the qualified fixture resolver declines it without picking
an arbitrary alternative. **Exact clause:** “There is at most one optional governed
usual-list reference in the actual owner scope; new-use eligibility and caller
permission are independently re-proved before suggesting or accepting it.”
**Proof:** real constraints and current source checks under concurrent set/unset,
withdrawal, same-label identities, wrong scope and concealed configuration. A hidden
or unavailable default produces the same permitted no-usable-default behavior as
appropriate; it does not broaden access. A separately proven sole eligible option
may still prefill under D17. No new per-team/type/personal defaults are inferred.

**I3 — Default refresh retargets established draft or reviewed-group intent. High /
likely with reactive form resets or late lookup.** Initially unresolved choice may
be initialized only through the accepted rule. Once a valid list is established,
a changed default, newly available list or refreshed option order is not a reason
to replace it. Probe case 9 changes the default before acceptance and preserves
the captured selected list. **Exact clause:** “Materialize the visible initial
choice as exact draft/submitted intent; do not submit a symbolic ‘use the default’
instruction. Default changes do not retarget established drafts, submitted group
members or accepted work.” **Proof:** actual late-response/form initialization,
user override, default update, member retry and unrelated-field edits. A selected
list's own eligibility/authority change still requires source revalidation and
truthful reconciliation, never silent substitution. A change only to the current
default need not reject a still-valid explicit selected list or force new choice.
Do not use whole-form dirty state as the sole definition of whether this list
choice is established; the actual field's source and interaction state matter.

**I4 — Withdrawal/default races expose half-configuration or restore old intent.
High / plausible.** D15 already requires explicit treatment of dependent references
and valid acceptance order. Probe cases 3–8 cover the new optional-default
consequence: stale revision rejection in both race orders, explicit matching-default
disposition, rollback and coherent observation, unrelated-list withdrawal, unset
and no revival on restore. **Exact proposed amendment:** “The ordinary withdrawal
action makes removal of its matching optional usual-list reference apparent and
accepts that disposition atomically with withdrawal. It preserves any different
current default. Availability restoration never restores a removed reference.”
**Proof:** actual current-authorized config command, expected revision, audit/result
and default/list updates all-or-none; current change vs withdrawal/restore races;
no unique-index exception mistaken for success. If owner boundaries cannot commit
jointly, D15's qualified prior repair and revalidation rule applies; do not manufacture
cross-domain atomicity or a new repair engine. This candidate is not an already
implemented schema or a hidden second confirmation step.

**I5 — An old successful default request becomes a command to apply it again.
High / plausible after restore or uncertain response.** A successful old set-default
operation may be retried after a newer unset/withdraw/restore. Receipt recovery
must not reinstate the old choice. Probe case 7 returns the original result while
current configuration stays unchanged. **Exact clause:** “Exact replay returns
the same accepted configuration result under current disclosure authority without
re-executing its effect. Show historical accepted outcome separately from current
configuration; a new change requires new deliberate intent and current revision.”
**Proof:** lost response, duplicate submission, old retry after several newer changes,
payload conflict, current actor revocation and cross-scope result lookup. A request
UUID or temporary worker lease is not the permanent business-effect identity.
Source revalidation must not turn an already accepted historical replay into a
fresh mutation, nor treat its stale receipt as current selection authority.

**I6 — RLS/privileged RPC or a generic preferences path is taken as full governance.
High / plausible if prototypes are copied.** Scope uniqueness, grants, RLS, current
human capability and transition invariants address different risks. **Exact clause:**
“All settings writers, reads, jobs, imports and repair paths use the same governed
source boundary. Default-setting authority grants neither cultivation admission
nor access to hidden lists/journeys; service credentials are not user authority.”
**Proof:** actual P12 capability/current-revocation checks, same-scope references,
exposed schema/table/column/function grants, RLS USING/WITH CHECK and read visibility,
privileged function owner/search path, exact audit and direct-write containment.
Use current catalog scope rather than constructing a new geography/team/entity
default hierarchy. No new Supabase tables, RPCs or policies are ratified by the toy
owner schema. No default action changes stages, journeys, tasks, gifts or consent.

## New mechanics and coordinated actual-control evidence

The [default probe](default-probe/README.md) adds distinct D17 evidence, with
[final results](default-probe/results.json) **9/9 passed**. It uses one synthetic
optional reference, source configuration transaction and explicit selected-list
acceptance. It does not retest optional-stage composite FKs or the old D15 race.
Two default/withdrawal schedules use exact `pg_blocking_pids` barriers. The fixture's
stale-revision `40001` is explicitly raised, not proof of Serializable isolation.

[Run metadata](default-probe/run-metadata.json) records pinned image/input hashes,
PostgreSQL 17.11, Docker 28.4.0, network `none`, no ports/bind mounts/volumes,
tmpfs data, resource bounds and exact verified cleanup. The first attempt stopped
on a duplicate output-marker buffering issue after four assertions passed;
its mechanics/results/error/cleanup remain in `attempt-1-*`. The corrected run
uses the function-result output as the barrier. Both disposable containers were
removed; no application DSN, credential, Core migration, live DB or provider was used.

All fixture calls execute as owner, with PUBLIC function execution revoked.
There is no P12/RLS/Auth/PostgREST, real authorized cardinality, complete configuration
audit policy, immutable journal trigger or real reviewed group. The fixture's
scope IDs are placeholders for already-qualified source scope, not a new product
taxonomy. Its field names, error codes and SQL lock choices are not selected Core
contracts. A limited positive mechanism is not production authorization proof.

The CRM/UI reviewer executed a separate [actual-component/form probe](source-probe/README.md);
its source, metadata and observations were reviewed here. **4/4 final checks passed**:
late `defaultValue` does not initialize an initially empty SearchableSelect; a
visible initial prefill permits user override and that identity survives later
default/option refresh; the real `useAsymForm` replaces untouched choices when
`defaultValues` change; touching an unrelated field instead prevents a later
missing-list initialization. These are complementary mechanics: neither generic
`defaultValue` nor form-wide reset/touched behavior implements D17's field-specific
unresolved-versus-established policy. Source rerenders represent changed input,
not measured network scheduling.

Executed TanStack React Form/core was 1.28.6 versus requested 1.33.5; React was
19.2.3 versus requested 19.3.0 and Vitest 4.1.4 versus requested 5.0.3. Base UI was
1.8.0 and Node 24.19.0. A first selector-only attempt expected a duplicate
development warning that Base UI intentionally logs once; that failed expectation
and evidence are retained separately. No component behavior was patched. Refer
to [D17 UX evidence](ux.md) and source-probe artifacts for complete versions and
scoped harness limitations. No root CI, actual P27 form, browser layout, source
authorization or command qualification is claimed from those tests.

Supabase and PostgreSQL guidance loaded earlier in this session remains applicable;
the official PostgreSQL 17 row-lock, constraint and transaction references support
engine mechanics, not product authority. Existing UI/default-settings code was
inspected, not modified. Changes are limited to grooming evidence and isolated
probe artifacts. No product code, migration, formal spec, issue or live record changed.
