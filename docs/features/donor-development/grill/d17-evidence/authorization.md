# D17 evidence — visible prefill without inferred authority or hidden-default disclosure

2026-10-10. Founder selected **A: visibly prefill the sole eligible list, otherwise an optional eligible organization usual list, otherwise let staff choose**. **Recommendation: accept A with inherited P12/D16 safeguards and the precise discovery contract below.** No new per-list ACL, role grant or process-specific restriction is required. Research against Core `225c02e9499bd6c0d493223cd4b1a4120ff787e3`; only this appendix is authored. Severity/likelihood are prospective implementation judgments, not deployed vulnerability claims.

## Intent and current evidence

- [Q17:26–43,80–101](../phase27-q17-initial-list-choice.md:26) applies only when a valid choice has not already been established. Sole-option and optional usual-list prefills are the new choice; default setting, existing-work switching, stage assessment and admission remain different operations. Q17 now records the supplied A selection and completed D17 review.
- [Ratified D16 R01–R09](../phase27-d16-adversarial-review.md:193) preserves shared choice without process restrictions, separates discovery/use/admission/configuration, requires full authorized coverage and context-bound data, and binds submitted intent. [D15 R06–R10](../phase27-d15-adversarial-review.md:223) owns zero-new-use choices, dependency handling, withdrawal/admission ordering and current replay. A restored list does not restore a removed default implicitly.
- P12 [1464–1468](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1464), [1552–1556](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1552), [1619–1632](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1619) and [2846–2869](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:2846) govern trusted current context, exact source/entity/purpose/capability/field/history floors, protected existence, query inputs, counts, egress and privileged paths. These are intended boundaries, not activated P27 proof.
- **Different existing feature:** [table-preferences GET:169–197](../../../../../packages/api/src/admin/crm/table-preferences/route.ts:169) returns loaded preferences plus a management flag. [Service:69–103](../../../../../packages/api/src/admin/crm/table-preferences/service.ts:69) reads personal and Tenant-default presentation rows in parallel. [Types:28–38,121–133](../../../../../packages/database/types/crm-table-preferences.ts:28) describe user/Tenant/system layers and a separate management flag. This is not D17's permitted default projection.
- [Current resolver:103–135,201–208](../../../../../packages/api/src/admin/crm/table-preferences/view-settings.ts:103) falls through from absent user settings to Tenant/system settings; [tests](../../../../../tests/unit/packages/api/admin/crm-view-settings.test.ts:25) exercise presentation fallback. Reusing that null/fallback meaning would erase the distinction between an untouched D17 choice and a deliberately cleared one.
- [Default write route:243–300](../../../../../packages/api/src/admin/crm/table-preferences/route.ts:243) separately gates configuration and explicitly denies implied contribution power. [Migration:19–57,182–237](../../../../../supabase/migrations/20260611160000_crm_table_preferences.sql:19) has unique Tenant/table settings, audit, revoked browser grants and a service-executed definer command with scoped locking. This offers a configuration pattern, not a P27 permission or default target contract.
- [Hook:92–99,210–225](../../../../../packages/database/hooks/admin-crm-table-preferences.ts:92) caches by table ID and invalidates after shared-default writes. [Session cleanup:64–82](../../../../../packages/auth/client-session.ts:64) distinguishes user IDs. Neither inspected seam proves isolation for one user's changed Tenant/assignment/epoch; D16 already identified the bounded reuse gap. Fresh source searches still found no authoritative P27 prefill/default implementation. No hosted catalog/runtime or new product test was inspected/run.

## D17-specific hazards, requirements and proof

### A17-01 — Applying a default reveals its relationship, even without a badge

**Critical; plausible.** Suppose two lists are readable, but their configured default relationship is protected. Prefilling one reveals that relationship even if “Organization default” is hidden. Reading a list's name is not necessarily permission to disclose how configuration uses it.

**Clause:** “Before applying or identifying an organization default, authorize the minimal current default-application projection: the relevant relationship and its permitted target. This may be resolved through the existing command/read projection without full configuration, audit or management access. If that projection is not authorized, treat it like no usable authorized default; with several choices, leave the choice unresolved. A separately proved sole eligible option may still be visibly prefilled without disclosing default status.”

No separate list ACL or blanket configuration-read grant follows. The response must not emit hidden target IDs, default-exists flags, denial-specific labels or different selection behavior for protected-present versus absent defaults. Configurators can receive their independently authorized detailed result; ordinary starters receive only the permitted projection.

**Proof:** same visible choices with (a) no default, (b) default relationship concealed but target readable, (c) target forbidden, and (d) authorized default. Compare selection, payload, badges, errors, search, logs and applicable timing uniformity. Hiding the badge alone fails (b). Authorized minimal-projection/no-management actors can still receive a default.

### A17-02 — Sole eligible means one in the complete authorized new-use set

**Critical disclosure / High integrity; plausible.** A search match, page of one, currently visible DOM option or count before permission filtering can select the wrong list or reveal hidden catalog size.

**Clause:** “Compute sole-option status from complete coverage of the current actor's authorized new-use choices in the exact source/catalog scope, before search narrowing or UI pagination. Options, counts, default applicability and their context must form a coherent qualified result. Filter by current P12 and D15 eligibility before disclosure; never infer organization-wide totals or relax floors because a list is the default.”

The count is of authorized selectable choices, not all lists then redacted. Zero invokes permitted D15 recovery, without implying organizational absence. A complete sole option wins independently of an unusable/missing usual default. Several choices with no usable authorized usual list remain unresolved. No additional filter by Party type, ministry, team, viewer or screen can be introduced as default logic.

**Proof:** zero/one/many, one permitted plus hidden choices, search narrowing, incomplete pages, withdrawn list, unavailable target, and different valid entity scopes. A coherent snapshot/version contract prevents combining an old default with another context's choices. Acceptance still revalidates current source eligibility; a read snapshot is not a reservation.

### A17-03 — Failure or indeterminate lookup is not “no default”

**High; plausible.** A failed shared-default query could silently become null and select another list, or unnecessarily disable a known valid explicit choice.

**Clause:** “Distinguish confirmed no usable authorized default from lookup failure or indeterminate coverage. Do not fabricate a fallback/default or claim absence after failed reads. Failure of the optional suggestion helper does not block an independently validated explicit choice or independently proved sole option; current admission authority and eligibility still govern.”

An unresolved several-choice form can offer permitted manual selection while reporting an appropriate loading/failure state, without revealing protected configuration. It need not wait for a nonessential default query before starting with a valid deliberate choice. Nor may a failed options query be treated as complete coverage. Keep failure recovery separate from granting permissions or changing organization settings.

**Proof:** default lookup failure with valid explicit choice, with independently proved sole option, and with several known choices; choice-set failure with a returned default; protected/default-absent paired cases. No first-array fallback, bogus “not configured,” or irrelevant configuration requirement.

### A17-04 — Prefill is initial assistance, not continuous control of the draft

**High; likely with reactive null-coalescing.** Refetch can undo a staff choice or clear, revive an invalid list, overwrite an already proposed stage, or retarget a submitted group.

**Clause:** “Apply prefill only to genuinely unresolved initial choice in its qualified context. Preserve an established valid draft selection and deliberate user clearing through refetch/default changes. Do not repopulate merely because the value is null. Source revocation/withdrawal invalidates affected use with truthful permitted recovery; it does not silently substitute another list.”

A cleared required list prevents submission until resolved; it is not a missing-stage substitute. No persistent draft state machine or separate confirmation is needed. If a still-valid prefilled list later stops being the organization default, retain the established draft choice while correcting any stale permitted explanation. A new eligible list does not invalidate the prior legitimate sole-option prefill. Proposed stage compatibility remains D16's visible local concern.

**Proof:** clear before slow response, manual change before refetch, default A→B, sole A→A+B, chosen A withdrawn, selected stage incompatible with a revised list, and old callback after submit. An empty query result must not clear accepted source state. Submitted/uncertain work reconciles its original effect before revised input; group members never resolve “latest default” during execution.

### A17-05 — Setting the usual list and using it have different authority

**Critical; plausible.** Default management can be accidentally exposed to anyone who can start work; conversely, a configurator may lack journey-admission authority without lacking legitimate configuration power.

**Clause:** “Set/replace/clear the one optional usual list through current source-owned configuration authority in the actual governed catalog scope. Validate a stable qualified target and current new-use eligibility; preserve expected revision, trusted attribution, required history and durable result. Independently authorize default projection and each actual admission. Configuration changes create no journey/stage/task/contact effect.”

The configuring actor needs the applicable configuration/target authority, not permission to admit every possible future journey. Each starter's source/entity/field floors remain decisive. D17 supplies no personal/team/ministry default hierarchy or new capability names. Clearing the optional default means no usual list, not falling through to a system/personal/first-ranked list. D15 withdrawal explicitly handles real default dependencies; reversal does not revive a removed pointer.

**Proof:** config-only, admission-only, minimal-default-read, revoked and cross-Tenant actors; concurrent set/clear, target withdrawal, no-op/retry and stale revision. Complete Tenant/catalog/target references constrain resulting rows; optional target must not make mandatory scope optional. Do not borrow a source from the current default to authorize a different journey.

### A17-06 — Context, privilege and restore must cover the suggestion itself

**Critical; plausible.** Default value/reason, choice count and cached prefill are themselves protected outputs, even before any write. A privileged helper may return more than the final chooser needs.

**Clause:** “Resolve principal, Tenant Authorization Context, exact source scope, purpose, capability/floors and epoch server-side for suggestion, default configuration, submission and replay. Isolate/invalidate cached option/default/value/reason together on relevant context changes. A late result cannot repaint another Tenant or undo newer intent. Preserve P12 raw-table restrictions and qualify effective grants, policies, views and private RPC execution.”

Test nonowner SELECT/INSERT/UPDATE/UPSERT/RETURNING and applicable service/operator paths, including allowed-old/forbidden-new target/scope, forged actor, extra permissive policies and metadata leakage. Default/preselection never substitutes for admission checks. Restored readers/workers must reconcile current access, eligibility, configuration revisions, redaction and consumed admission/configuration receipts before activation; stale default caches cannot resurrect authority or work. Current disclosure also governs history and diagnostic output.

## Primary semantics and limits

The previously read Supabase skill remains applied. Fresh 2026-10-10 retrieval checked [PG17 CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html), [RLS](https://www.postgresql.org/docs/17/ddl-rowsecurity.html), [isolation](https://www.postgresql.org/docs/17/transaction-iso.html) and [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security); Core config declares [PG major 17](../../../../../supabase/config.toml:27), not a verified hosted minor. Existing/resulting-row policies, applicable `USING` fallback when `WITH CHECK` is omitted, SELECT requirements and actual grants/role privileges govern—not blanket omitted-check or definer-bypass claims. Separate Read Committed queries need not share one snapshot; qualify coherent context/default/coverage rather than assuming parallel API reads do. Source acceptance, not suggestion time, settles eligibility.

No new probe or implementation is claimed. The minimum solution is a small authorized suggestion projection plus existing configuration/admission boundaries. D17's selected prefill behavior is new product policy; the privacy, intent and permission safeguards above preserve ratified owners without another permission framework, approval queue or process restriction system.
