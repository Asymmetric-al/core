# D21 independent lifecycle, CRM, reporting and Email Studio review

Reviewed **12 September 2026** for the selected **A — Optional labels from a curated Support list**. D1–D20 are ratified; the D21 amendment package is under review. This report proposes exact narrow requirements and required proof. It does not create formal specifications, runtime code, tickets, provider changes or new automated behavior.

## Conclusion

**Accept with required amendments.** Optional curated labels meet the demonstrated retrieval need without introducing a compulsory closing step. Extend the existing flat Support conversation-label concept under its real owner. Reuse applicable Core authorization/configuration/list machinery, but do not convert labels into CRM Party tags, security classification, Email Studio Saved Sections, custom-field publication or a generic taxonomy engine.

The most consequential discovery is that **D10-R24 already specifies merge and Undo label behavior exactly**. D21 should complete vocabulary lifecycle and use that accepted source-aware relationship contract rather than inventing another merge strategy. [D10 full record](phase26-d10-adversarial-review.md).

## Inspected evidence and limits

- Current worktree directory verified: `/home/conrad/code/core-worktrees/grill-with-docs-2026-09-10`; root AGENTS was read in this session. Source baseline supplied by root remains `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`.
- [Current label schema](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/supabase/migrations/20260515025814_support_hub_core_modules.sql#L81) has stable tenant-composite ID, name/slug/tone/description and timestamps, but no explicit lifecycle/revision field. The [association schema](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/supabase/migrations/20260515025814_support_hub_core_modules.sql#L267) cascades deletion from either parent into membership. That is actual current structure, not proof that historical provenance or D20 dependencies are protected.
- [Current adapter](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L966) exposes list/upsert/delete. [Save input](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/schemas.ts#L87) has optional ID but no expected revision. This is insufficient evidence for separate curator/application capabilities, safe archive or conflict handling.
- Governing [P9 Party tags](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md#L548) are on the Party spine; taxonomy remains Phase11. The [roadmap](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/roadmap.md#L2957) retains classification, communication and automation owners. A shared word such as tag is not evidence these entities should be synchronized.
- Fresh primary-source reads: [Front, Understanding tags](https://help.front.com/en/articles/2100), edited **1 July 2026**, documents archive blocking later application while preserving historical memberships, search and analytics. It separates shared-tag visibility from conversation sharing and routes shared-tag navigation through Views. [Intercom, Create/edit/archive/delete tags](https://www.intercom.com/help/en/articles/3527143-create-edit-archive-or-delete-tags), dated **12 December 2025**, distinguishes per-conversation removal from global deletion; archive retains filter/report use, restore is available, and rename changes displayed names on existing items. These support archive-first lifecycle and explicit control labels. Their provider synchronization, private labels, arbitrary nesting, audience coupling and permanent-delete behavior are not adopted. Neither source proves an Asym ministry workload, a legal retention period or reliable historical meaning after repurposing a name.
- No live database, load, runtime authorization, merge concurrency, restore or representative-staff usability proof was performed.

## Required findings, exact corrections and proof

Severity and likelihood describe plausible unmitigated impact and qualitative engineering judgment, not measured prevalence. Local IDs below are review references for root synthesis, not new final requirement numbering.

### L01 — Label identity must survive presentation edits

**Material concern: Yes. Severity: High; likelihood: Medium.** Treating a name/slug as identity or repurposing `Receipt question` into `Refund completed` can silently retarget saved views and reinterpret earlier work. Current optional-ID upsert and mutable strings do not establish protection. This **changes implementation and narrows curation** without invalidating A.

**Exact requirement:** “A Support label has one stable tenant-scoped identity and one durable meaning. Renaming, correcting wording or changing a display tone preserves identity and membership. A material change in meaning requires a new label; archive the old one when it should no longer be applied. Name, slug, color and similarity never retarget references or merge catalog entries. The editor explains this distinction without requiring a separate approval queue.”

Keep a brief plain-language usage description, particularly where nearby terms are easily confused. Name and description are configuration, not a place for case-specific identities or quoted conversation content. The software can preserve identity/revisions but cannot prove that a human wording change is semantically equivalent; this is a curator obligation with inspectable history, not an invented AI semantic gate.

**Proof:** rename leaves all D20 predicates bound to the same ID; no stale save recreates a missing label; changed semantic input under one command identity conflicts; an explicit new-meaning label has a distinct ID and no copied historical assignments. Same-name creation/collision does not leak inaccessible labels; normal international display names remain supported.

### L02 — Archive is availability, not mass removal

**Material concern: Yes. Severity: High; likelihood: High if current delete is reused.** A Delete action can cascade all membership rows and break D20 predicates/history. A soft flag that hides all existing chips would silently change current retrieval despite preserving rows. This **replaces unsafe routine deletion**.

**Exact requirement:** “Archive label stops new application and removes the label from the normal add picker. It retains currently lawful existing membership, marked Archived, and remains usable as an explicit historical/current-membership filter while its exact meaning and disclosure remain qualified. Restore rechecks present authority and re-enables future application under the same identity; it does not reapply removed memberships. Remove from conversation, Archive label and source-authorized disposal are distinct operations.”

Use persistent Manage labels → Archived → Restore. Ordinary catalog management should not expose used-label hard deletion. A maintainer may deliberately create a replacement label without automatically rewriting old memberships or saved views. Do not introduce a generic taxonomy merge/replace tool solely to tidy synonyms. Preserve archived identity/name disambiguation while the retained catalog requires it; do not create an unrelated duplicate silently and resolve old references by its name.

**Proof:** archive does not change existing matching populations; add using an archived identity is rejected; existing membership can still be deliberately removed; restore returns eligibility without resurrecting any ended membership; the archived saved-view filter is visibly valid, while actually disposed/forbidden meaning produces D20 unavailable/needs-attention rather than match-all or false zero.

### L03 — Per-conversation edits are exact deltas

**Material concern: Yes. Severity: High; likelihood: Medium.** Saving a full stale set can lose another worker's label. A Remove-all operation can erase a protected contributing membership or later Add; an ambiguous retry can recreate one. This **requires source-aware commands**.

**Exact requirement:** “Apply and Remove operate on the exact reviewed label and current conversation/component control, not a caller-supplied replacement set. An already-effective Add is an explicit unchanged outcome. Remove ends the exact current contributing membership identities atomically under authority for that affected scope. Ordinary inverse actions remain available; any offered Undo reverses only the actual still-current operation delta under current eligibility, never a pre-edit whole-set snapshot.”

Ordinary Remove does not require a mandatory essay or confirm-every-click ceremony. Distinguish **Remove label from this conversation** from catalog **Archive label**. A no-op Add must never produce an Undo that removes someone else's existing membership. If an optional Undo is no longer valid, report its current safe outcome instead of silently attaching a new origin or overriding a newer change. No persistent label-specific time-machine feature is needed merely because normal Add/Remove are reversible.

**Proof:** A and B add different labels concurrently without loss; duplicated Apply gives one effect; Add followed by Remove followed by old Apply retry stays removed; no-op Add Undo changes nothing; Remove versus re-Add cannot terminate the new generation; exact same operation receipt and latest state are distinguishable after network ambiguity.

### L04 — Use the already-ratified merge/Undo model

**Material concern: Yes. Severity: High; likelihood: High if labels are copied onto roots.** A copied union loses original ownership, duplicates after Undo or restores labels that someone deliberately removed. This **applies existing D10-R24 without reopening it**.

**Exact requirement:** “Original label memberships stay on original conversation endpoints. The combined Labels control is their permitted deduplicated union. A new Add from combined handling anchors to the then-current continuing original and is unchanged if that label is already effective. Combined Remove targets all exact currently contributing memberships for that displayed label under the current topology and complete mutation authority; do not remove a silent subset. Undo merge partitions CURRENT memberships by original provenance and preserves later edits. Composing or separating an effective union creates no synthetic label-added/removed communication or automation.”

**Concrete proof:** A carries X, B carries X and Y; merge B→A shows X/Y once, retaining three original contributions. Add X is unchanged. Add Z anchors A. Remove X ends both original X contributions. Undo B→A leaves A with Z and B with Y; neither original X reappears. Subsequent merges and subtree Undo obey the same rule. An unexpected topology change forces current review rather than redirecting a stale one-source edit to a larger component.

### L05 — Race lifecycle changes, source topology and application coherently

**Material concern: Yes. Severity: High; likelihood: Medium.** A stale positive action after Archive→Restore can apply content the user selected under an earlier eligibility episode; Remove can race Merge and change only part of the visible union. This **adds concurrency safeguards, not new workflow states**.

**Exact requirement:** “Guard definition edits by exact ID/revision. Apply, Remove and any inverse command bind current label eligibility and current D10 component/membership control. Archive/Restore change the eligibility generation or equivalent guarded receipt so delayed prior positive intent cannot become a new application after restoration. Serialize materially conflicting topology/membership commands at D10's authoritative boundary in consistent lock order. Return the original receipt for exact replay and current state separately.”

Harmless rename/display changes need not invalidate unrelated message drafts or turn ordinary labeling into a reservation system. Current permissions, label lifecycle and actual source membership are the relevant guards. Canonical membership/control/audit and required identifier-only invalidation commit atomically; failed UI refresh cannot authorize retry as a new effect.

**Proof:** Apply-versus-Archive has one ordered outcome; Archive→Restore does not revive old Apply; two opposite topology/label edits cannot partially update contributors; duplicate callback/recovery cannot infer new attribution. Above a qualified bound, reject the entire mutation safely rather than truncate source contributors.

### L06 — Keep CRM, related work and restricted classification separate

**Material concern: Yes. Severity: Critical; likelihood: Medium.** An apparently harmless label can become a CRM attribute, donor segment, access grant, identity claim or a surrogate for a completed refund. A related record/conversation can inherit sensitive labels by mistake. This **narrows the label's meaning and effects**.

**Exact requirement:** “A Support label describes that Support conversation only. Applying, removing, renaming or retiring one changes no Party tag, person/household/organization relationship, related-record association, receipt/refund/recurring record, last-contact fact, status, priority, target, routing policy or classification. D9 CRM history may project permitted labels only as Support conversation context under joint source authorization; it writes no second membership store. D12 related conversations inherit no labels merely by association. D10 alone governs combined display.”

A label named Confidential does not secure anything; removing it cannot declassify content. Avoid starter names that imitate actual state or business completion. Context visible in Support does not confer financial/care access; being CRM owner or Email Studio publisher does not confer Support label maintenance. Source owners perform their actual consequential mutations.

**Proof:** applying/removing a label causes no CRM write/history/contact event, recipient change or authorization transition; a linked Party and related conversation remain unchanged; source permission loss withdraws the affected label/context projection immediately; actual classifications remain effective even if their human-looking label is absent.

### L07 — Restricted labels and absence predicates can leak

**Material concern: Yes. Severity: Critical; likelihood: Medium.** Names/descriptions, counts, suggestions and filter membership may disclose protected topics even without displaying a conversation body. `No labels` over hidden memberships can become an inference oracle. This **requires one explicit authorized catalog/query contract**.

**Exact requirement:** “Do not use labels as an access-control mechanism. Catalog discovery, search, meaning/description, current and historical membership, facets, counts, saved predicates and exports each require their actual label/source disclosure authority. Never expose a hidden label name, hidden-count badge, autocomplete hit or a boolean result that tests a forbidden membership. A forbidden explicit predicate is unavailable, not silently ignored. No-label semantics are defined over the qualified visible Support-label population and described accordingly; incomplete permission scope cannot be presented as proof that no other annotation exists.”

The simplest ordinary vocabulary is neutral operational wording available to its qualified Support audience. A special restricted label taxonomy is not required by A. If an inherited label is now too sensitive or forbidden, use the actual source/privacy owner's repair; do not widen catalog visibility just to preserve a filter. Parent synthesis should choose the precise ordinary audience and ensure all mutation/read paths implement that same scope, without layering speculative per-label ACL customization.

**Proof:** a user cannot distinguish a hidden sensitive label through Any/All/No-label results, counts, search, archived catalogs, collision errors, audit, cache or query URL; permission loss cannot leave stale definitions/content visible; ordinary authorized criteria continue to work without gaining hidden scope.

### L08 — Current classification and historical facts need truthful names

**Material concern: Yes. Severity: High; likelihood: High.** Optional labels generate biased coverage; overlapping counts can exceed population. Today's renames, removal or merge can silently rewrite a report claimed to mean “labels at resolution.” This **constrains reporting instead of adding an analytics product**.

**Exact requirement:** “Label-based current reports declare their population, current authorized continuing-conversation unit, server As-of instant and Current labels basis. Count each current work root once per label and show the unlabelled eligible portion; label groups overlap and are not additive topic totals. Optional coverage is not proof of classification completeness or accuracy. D14 historical reports preserve their existing original-target/reply-period cohorts and denominator formulas. A label filter on historical results, if exposed, must explicitly identify Current labels rather than imply labels at the historical event.”

Do not add a new historical label-at-every-event reporting engine to complete optional labeling. Preserve minimized actual apply/remove and catalog-revision evidence with trusted occurrence/ordering so a later separately qualified historical dimension can use proof. A purported historical dimension must bind the original subject, meaning revision, membership interval/event, cutoff and data coverage; when evidence was never recorded or lawfully retired, show unknown/unavailable instead of reconstructing from current state. No caller backdating or importing `created_at=now` as proof of earlier classification.

**Proof:** two labels on one conversation do not become two total requests; unlabeled work remains in the population; merge changes current root totals but not historical reply-target instances or actual emails; Undo expands current work under D10; renaming affects display only; later reclassification never silently becomes past event-time classification; unknown coverage and zero-data states remain explicit.

**Further root-report alignment:** If the narrow current-label report includes a start-date filter, construct complete currently authorized D10 components first. Compute each component's earliest trusted **original-conversation creation** instant over its entire component, then filter that derived current row by the half-open reporting interval. Filter the currently responsible inbox as **Currently handled in**, not a subset of original inboxes before computing the minimum. Suggested report description: **Current conversations originally started in [period] — Current labels as of [instant]**. A 2024 original merged with a 2026 original is one current component begun in 2024; filtering away the older source first would fabricate a newly begun 2026 row. Merge/Undo can legitimately change this current-composition report, which must not be labelled new-request inflow or a fixed historical cohort. D10 original creation is distinct from first provider receipt, first message and merge time; use one exact owned fact, not whichever is available. If missing original-start evidence prevents establishing the true earliest instant, show a separate start-date-unconfirmed population under the same non-date scope; do not use a later known member date, zero, now or merge time. Resolve date inputs through the selected reporting timezone into exact half-open instants, preserving DST boundaries. Test a merged component spanning date ranges/inboxes, its Undo, missing original dates and boundary instants.

### L09 — Retention and redaction apply to metadata too

**Material concern: Yes. Severity: High; likelihood: Medium.** Labels named for an individual, health issue or secret location can retain information after message expiry. Keeping all revisions for “analytics” can become a shadow transcript. Conversely, deleting every label at body expiry can erase permitted independent operational facts. This **qualifies data classes separately**.

**Exact requirement:** “Catalog definitions, membership/provenance, minimal audit and source content have separately justified purposes, access and finite owner lifetimes. Generic independently authored vocabulary does not receive the D17 conversation clock. A conversation membership and known source-derived wording remain subject to their actual source/privacy/records restrictions. D16 redaction and D17 expiry cannot be bypassed through old names/descriptions, label history, reports, caches, export or backup restore. Retain only independently lawful operational facts; no default indefinite label history or per-label retention control is added.”

D17 explicitly treats source-derived custom text and summaries as content, not safe merely because they are metadata. A human-selected generic label may retain an independently justified operational classification, but that purpose must be qualified rather than assumed for sensitive facts. Actual owner restriction removes the inappropriate projection; no replacement ID with the same name restores it. [D17 inventory](phase26-d17-data-inventory.md), [D16](phase26-d16-adversarial-review.md).

**Proof:** label text copied from a redacted source is unavailable in all governed representations; permitted generic vocabulary survives unrelated body expiry; source-derived historical report facts obey disclosure/retirement; restore cannot reactivate negative barriers or recover ended membership as current. Report coverage reflects lawful evidence retirement.

### L10 — Catalog stewardship survives staff departure

**Material concern: Yes. Severity: Medium; likelihood: High over time.** Author deletion or team changes can remove vocabulary, strand maintenance or transfer permission to a same-email replacement. This **requires tenant custody and existing qualified repair**.

**Exact requirement:** “The Support catalog is tenant-owned configuration with independently qualified maintenance authority; it does not cascade away when its creator leaves. Trusted creator/editor references remain attributable under current identity policy. Offboarding removes current capability without changing memberships or permitting email-based inheritance. Loss of qualified coverage is an existing configuration-owner responsibility to appoint an independently authorized maintainer or retire unused vocabulary, not automatic broad access.”

Routine missing-label requests can use existing staff collaboration. No separate catalog submission system, permanent private taxonomy, new content-publication role or recurring approval queue is needed.

**Proof:** deactivate the original curator; eligible staff still apply current labels and existing views still work; a separately authorized replacement can maintain the catalog; deletion/reinvite with reused email grants neither historical author identity nor permissions; no personal-account cascade removes shared labels.

### L11 — Email Studio and notification behavior stay explicit

**Material concern: Yes. Severity: High; likelihood: Medium.** “Curated shared” can tempt a second publication workflow or label-triggered automated replies. A merge union can create fake add events and notify followers. This **preserves current owner boundaries**.

**Exact requirement:** “Support label curation and application use their own configuration/source commands. They do not save or publish Email Studio assets, prepare email, select recipients, create follows, create routine P6 communication events or dispatch Resend. D15 keeps ordinary label edits quiet; D10 merge/Undo union changes create no synthetic label-added/removed email or automation. Configurable label-triggered automation remains Phase34 and is not activated by D21.”

Actual human replies remain D4/D18/P17-ready preparation, Support admission and P6 tenant Resend delivery. Internal notes stay non-deliverable. A genuine owner repair obligation, if one already requires staff attention, must use its separately qualified source/P17/P6 local contract; do not create a new default label-event notification or generic label email template. Label name/description never become template variables, approved facts, consent or proof of a financial outcome merely by being present.

**Proof:** create/rename/archive/restore/apply/remove and merge/Undo label display produce no template publication/send/follower notification; actual conversation Send continues through the existing normal boundary; catalog outages do not stop an otherwise valid reply or Resolve, since labels are optional.

### L12 — Migration must preserve uncertainty and convergence

**Material concern: Yes. Severity: High; likelihood: High if current destructive CRUD stays live.** Old callers can hard-delete the new durable catalog, overwrite revisions or apply duplicate/misidentified labels. Existing flat memberships have limited history and must not be marketed as historical proof. This **changes rollout and compatibility requirements**.

**Exact requirement:** “Inventory all catalog and membership writers, legacy label IDs/slugs, unknown owners, duplicate meanings and D20 references. Preserve stable verified IDs or record explicit mappings; do not merge synonyms by spelling or invent historical application actors/times. Add current lifecycle/provenance contracts and qualify readers before activation, then fence unsafe old upsert/delete/whole-set writers. A feature stop preserves current safe reads and ordinary Support work. Rollback cannot restore writers that erase required lineage or ignore privacy/current control.”

Use bounded audit/reconciliation for ambiguous legacy meaning rather than requiring a full taxonomy rebuild. Do not preserve current ON DELETE CASCADE as routine retirement authority merely because it exists; distinguish actual tenant disposal from one curator removing a term.

**Proof:** old clients cannot bypass archive/revision/current-root permission; repeated migration maps one original membership once; name duplicates stay separate unless a separately reviewed justified correction changes them; old history is explicitly unknown; lawful deletion preserves minimum anti-replay evidence; controlled roll-forward keeps D20 views truthful.

## Minimal implementation order for the later authorized stage

1. Ratify vocabulary purpose, curator/application separation and lifecycle semantics; retain D10-R24 exactly.
2. Qualify actual Support catalog authority, source-aware membership, tenant/current authorization and label/ref disposal against the existing shared platform foundations. Do not infer a required universal taxonomy service from P9's Party tags.
3. Replace destructive catalog and stale whole-set membership paths with exact guarded commands; add current permissions, protected history and source-aware merge/Undo qualification together.
4. Deliver the small everyday Labels control and separate Manage labels destination, with meaningful descriptions, current state, safe archive/restore and complete authorized search.
5. Connect D20 references/query behavior and truthful current label coverage to the existing report owners. No new event-time analytics product is necessary.
6. Gate activation on the negative/concurrency/migration/privacy/restore/UI cases above. Monitor actual repair burden only after these invariants pass; a correctness or disclosure defect is not a monitor-only acceptance.

This is a complete narrow lifecycle direction, not a runtime certification. It adds no compulsory labels, primary topic, taxonomy nesting, duplicate-label merge engine, CRM sync, AI classifier, message template or autonomous label automation.
