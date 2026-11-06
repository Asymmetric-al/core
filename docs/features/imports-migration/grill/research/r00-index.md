# Phase 30 research index (tracks r01-r09 with verifier corrections)

Generated 2026-11-01 from the completed research workflow. Each track's full notes live in the named file in this folder. This index holds each track's summary, its open founder questions, and every verifier verdict that was NOT a plain confirmation (corrected / refuted / unverifiable), plus what the verifier said the track missed. Confirmed verdicts are omitted for size. Evidence labels follow docs/ai/document-authority.md.

Completeness critic gaps g1-g8 are being filled in r10-gap-g*.md (see those files once complete).

---

## r01: `r01-governance-authority-census.md`

### Summary

I finished the research and wrote it to C:/Users/Conrad/.t3/worktrees/core/t3-73d54b3d/docs/features/imports-migration/grill/research/r01-governance-authority-census.md (eight sections). Nothing else in the repo changed. Phase 30 has no glossary, ADRs, decision log or spec yet; only empty grill/research folders exist.

**Where Phase 30 stands.**

- Its status is "roadmap scope adopted; phase grooming/qualification required" (phases.json:216-220).
- That means the roadmap chapter (roadmap.md:4320-4418) and the retained owner obligations (owner-constraints.md:329-455) are adopted planning direction, not shipped behaviour.
- Its listed open decisions must be settled before work is dispatched (delivery-contract.md:145).
- The shared Phase 29/30 row in decisions-and-gates.md:14 lists "supported legacy source profiles and owner-specific import/reversal semantics" and adds that "import mechanics cannot decide business or legal meaning."

**Authority rules.**

- Order is: user request; ratified owner intent reconciled through OpenSpec; AGENTS rules; then code and runtime evidence.
- The key rule for Phase 30: "A later consumer phase cannot acquire a producer's authority by shorthand" (document-authority.md:10-13).
- When a clause is superseded, the clause itself must be edited; a banner is not enough (:30-35).
- Nine evidence states are defined: proposed, ratified, published, integrated, merged, implemented, qualified, activated, superseded (:42-54).
- Phase 30 is a consumer of the identity/merge, Party, custom-data, money, Field Account, CMS and file-custody owners. Its own job is transport, staging, mappings, plans and import-run evidence (roadmap.md:4377).

**How Phase 29 recorded its grooming (PR #2430 head).**

- A feature glossary at docs/features/files-documents/CONTEXT.md.
- Feature-local ADRs 0001–0067. Two decisions deliberately have no ADR. Each ADR is marked "Ratified by Conrad".
- A 558-file grill corpus with question, research and adversarial files per question.
- A decision log at grill/decision-log.md: a summary table, then one section per question naming the exact option ratified, the amendments folded in, and what is not implied.
- A CONTEXT-MAP row, a spec file with six canonical volumes, owner reconciliation with S/Q gates, a consumer register, testing evidence, hash-checked preservation of the grill corpus, a generated OpenSpec change, and a `verify:phase29-spec` script.

**ADR numbering.** Platform ADRs take the next free number only when accepted; the next is 0224. Feature-local ADR series are allowed when the decision only matters inside that feature.

**Publishing specs and tickets.**

- `/to-spec` uses a seven-section template and the user must confirm the testing seams. In this repo the spec is a repo PRD that a tracker issue mirrors.
- The readiness label is now `Ready`; `status:*` labels are retired.
- Phases 28 and 29 applied the label to the finished spec. Phases 1–19 held it back until dispatch.
- `/to-tickets` is a separate, explicitly invoked stage that creates tracer-bullet tickets with native blocking edges.
- `/grill-with-docs` runs the grilling and domain-modeling skills: numbered question rounds, glossary updates as terms settle, and ADRs only when a decision passes the three-part test.

**Obligation census.**

- I filtered out false positives. Most raw `P30` hits are local IDs in Phase 26/27/29 tables.
- Real obligations come from:
  - Phase 4 / ADR-0216: no automatic merge; undo is governed, not an unconditional reverse.
  - Phase 9: the External-IDs socket on `crm_record_links`.
  - Phase 11: import template descriptor plus one bulk write path shared with normal entry.
  - Phase 12: capability splits.
  - Phases 13/14: import-aware money seams, `already_receipted`, per-table `external_ref`.
  - Phase 15: imports never auto-send.
  - Phases 20/21: transport and staging only; no activation, no reconciliation, no posting ownership; undo blocked over Accounting Releases.
  - Phase 23 (ADR-0173): Phase 30 owns the reusable migration workbench, including reversal-workbench mechanics. Phase 23 ticket #1407 is blocked on a "Phase 30 migration source-adapter contract".
  - Phase 27: imports never start cultivation work or confer rule-managed status.
  - Phase 28 D17 (REQ28-R19..R26): the full self-import contract, file limits, a 7-day working window and 24-hour disposal.
  - Phase 29 (unmerged): F30, E10, E19 and AC29-D22-01.
  - Phases 31, 33 and 40 consume Phase 30 provenance. Phase 40 also depends on Phase 30.
- No stale v1 numbering survives in live docs (v1 Phase 29 = imports, v1 Phase 30 = reporting).

**Main conflicts.**

- Owner-constraints says "auto-merge high band only" (owner-constraints.md:368). The accepted identity ADR rejects automatic merge (ADR-0216:54-55), as do the Phase 4 PRD and the glossary. Phase 28's owner reconciliation already asked for this to be fixed, but the clause was never edited.
- Owner-constraints promises "time-boxed batch undo" (:378-385). The roadmap says not to promise universal time-window undo (roadmap.md:4395). ADR-0216, Phase 28 REQ28-R24 and Phase 29 F30 say the same or similar.
- A Phase 30 ticket, #2369, was filed before grooming through a relay chain (Chad/Blake/Samson). The `Ready` Phase 28 tickets #2083 and #2084 wait on it.
- External-ID ownership is split: Phase 9 record links, Phase 14/13 per-table refs, and Phase 31 co-ownership.

**Glossary.**

- About 25 relevant defined terms have line numbers in the file, including Party, Field catalog, Legal Entity, Entry Method, Provider link, Reviewed contact-list intake, Non-destructive merge and Posting Ownership Cutover.
- Missing: Import/Import Session/Import Profile, Migration, Source Record, External ID, Source System, Dry Run/Plan, Staging, Import Batch, Backfill, Outward-effect-dark, Restricted preparation.
- Colliding: Import Profile (Phase 21), Import Surface Conformance Record (Phase 20, which means importing into QBO/Xero), the retired Staged Gift, Gift-entry batch, receipt (tax vs idempotency), reconciliation, provenance, and Source Code (defined twice).

### Open founder questions proposed by this track

- Should Phase 30 adopt the Phase 29 governance pattern (feature glossary, feature-local ADRs, per-question grill files and decision log under docs/features/imports-migration/, registered in CONTEXT-MAP), or use root CONTEXT.md and platform ADRs (next number 0224)?
- Do you confirm that no import profile may automatically merge Parties (ADR-0216 governs), or do you want to propose a narrow identity-owner amendment, for example convergence on an exact qualified external ID?
- Should the 'time-boxed batch undo' promise be replaced by per-target owner-defined reversal (safe undo / compensating source operation / irreversible)? Which targets, if any, get a reversal workbench in the first release?
- Build or adopt/embed the importer (Flatfile/OneSchema/Dromo-class vs native on the shared grid), decided together with Phase 31's OAuth/webhook build-vs-buy?
- Which source export profiles and targets come first? Is SiteStacker the only first-release source family, and is source-to-Party plus exact repeat import the first slice?
- Should Phase 30 adopt, amend or supersede issue #2369 (filed via Chad/Blake/Samson without a recorded founder ratification), given that Ready Phase 28 tickets #2083/#2084 wait on it?
- Mapping assistance: deterministic only in the first release, or allow AI assistance (which owner rules route through Phase 40, and Phase 40 depends on Phase 30)?
- Per target, which write modes are allowed (update / append / merge-queue / reference-only)? In particular, may a staff reimport update existing Party fields?
- How should staff import permissions be split (prepare, review plan, commit, reverse)? Does any target need a second reviewer?
- For the eventual /to-spec publication, should the issue get the Ready label (Phase 28/29 precedent) or should readiness be held back until dispatch (Phases 1–19 precedent)?
- Should Phase 30 own a general External ID / Source System model (the Phase 9 socket co-owned with Phase 31), or consume per-target external references (the Phase 13/14 pattern)?
- What retention and records-policy owner applies to staff-migration source files, staging and error artifacts? Self-import fixes 7 days / 24 hours; do larger migrations need longer reconciliation windows?

### Verifier: non-confirmed verdicts

- **corrected** — claim: The relay chain (Chad/Blake/Samson) is not founder ratification. Phase 30 should adopt, amend or supersede #2369 and not treat the chain as owner intent.
  - evidence: #2369 was authored by II-ricky-bobby-II, which is Blake, a code owner alongside Conrad (docs/ci.md:430). Samson is the factory lead whose rulings 'under Blake's charter' are recorded as accepted ADR amendments (ADR-0001:144). Sibling issue #2368 has identical relay provenance, was filed in the same minute by the same account, and was adopted by Phase 29: its body gained an additive amendment ('preserves this issue's existing source ownership, original contract…'), it became a native sub-issue of #2429, and cobmojo applied Ready on 2026-10-29. #2083's body says its blockers clear when 'Blake files the Phase 29 and Phase 30 owner issues and marks them Ready'.
- **corrected** — claim: crm_record_links has Twenty-shaped columns. The retire migration dropped its provider CHECK and recorded COUNT(*)=0. The only source_system column is crm_identity_mapping.sql:167 (default 'asym').
  - evidence: crm_identity_mapping.sql:73-90 and retire_twenty_crm_runtime.sql:1-8 and :21-34 are as stated. But line 167 belongs to crm_projection_state, which 20260818010000_retire_twenty_crm_runtime.sql:19 drops ('DROP TABLE IF EXISTS public.crm_projection_state CASCADE'). Also, 20261024120000_crm_link_entity_type_party_values.sql (#2257, ADR-0001 amendment 2026-10-24) extended crm_link_entity_type with household and organization, with lockstep TypeScript in packages/api/src/crm/identity/concepts.ts and a parity test.
- **corrected** — claim: Phase 13's 'fresh-build, no-migration-ceremony posture' (phase-13:2257) is in tension with Phase 30's requirement to census actual retained state (roadmap.md:4403) and needs scoping.
  - evidence: phase-13-…giving-cart.md:2257 already says the fresh-build delete-and-replace 'is _distinct_ from the D24/D25 migration seams: Asym has no legacy, but an incoming tenant arrives with an existing recurring donor book, so the ledger must be import-aware from day one'.

### Verifier: missed by this track

- Phase 29 already set the precedent for relay-filed pre-grooming tickets. #2368 has the same provenance as #2369, the same author (II-ricky-bobby-II / Blake) and was filed in the same minute. Phase 29 adopted it with an additive body amendment, made it a native sub-issue of #2429, and cobmojo applied Ready on 2026-10-29. Its amended body lists #2369 as 'Downstream P30 source profile consumes #2368; no reverse block'. #2083 says its blockers clear when Blake files the Phase 30 owner issue and marks it Ready. The founder question on #2369 should start from this adopt-and-amend precedent.
- crm_record_links (the P9 External-IDs socket) is live and governed. The 2026-10-24 ADR-0001 amendment (docs/adr/0001-…:142-165) and migration 20261024120000 (#2257) extended crm_link_entity_type to 17 values under an append-only lockstep rule: the DB enum, CrmIdentityConceptId and CRM_IDENTITY_CONCEPTS in packages/api/src/crm/identity/concepts.ts change together, with a build-failing parity test, and 'Any later value needs its own consumer and its own amendment here'. Any Phase 30 use of that socket for source-system IDs therefore needs another ADR-0001 amendment plus lockstep code changes, which bears on open question 11 and discrepancy 6.
- Legacy 'import' label values already exist in live code. DonationSource includes 'import' (packages/database/types/database.ts:39-40). The admin contributions model maps source 'import' to entryMethod 'import' (packages/api/src/admin/contributions/model.ts:83,244-245), with an 'Import' filter at apps/admin/app/(app)/contributions/data.ts:191. Email SuppressionSource includes 'import' (packages/email/types.ts:36). These must be reconciled with P13's 'no imported status' (Entry Method is an attribution axis) and with the rule that historic flags are evidence, not consent (roadmap.md:4381). The retained-state census required by roadmap.md:4403 should list them.

---

## r02: `r02-identity-crm-custom-data.md`

### Summary

Track R02 covers identity, CRM, relationships, custom data, sensitivity and permissions that Phase 30 must reuse. I read it against develop 629cb71dc. Nothing in this track is implemented, qualified or activated for imports. Most owner intent is ratified. The storage that exists is either a prototype or shaped for Twenty, the retired CRM vendor.

(1) Five identity operations that must stay separate:

- **(a) Retry recognition.** Phase 30 keeps a durable receipt for each row's effect. Each target owner uses its own effect identity and expected-revision checks. A file hash, row number or tool name alone is never identity (P28 relationships.md:398-399; P9 A17/B17).
- **(b) Established source-record binding.** This is provenance, not identity. P9 says imported/legacy provenance is "a Phase 30 concern carried by crm_record_links" (phase-09:846-847). P1 says a provider ID "is a link, not an identity" (phase-01:106-113).
- **(c) Possible-duplicate detection.** This belongs to Phase 4. Its scan feeds crm_merge_candidates and never merges anything (phase-04:222). P9 only displays the candidates.
- **(d) Match to an authorized existing identity.** Phase 4 A5 rule 6 allows one clean match to attribute a guest gift. Ambiguous matches go to staff review, and attribution never creates a claim or access (phase-04:153). For P28 D17, names, emails, phones and addresses are evidence, never universal keys, and hidden matches must never reveal that a record exists (relationships.md:58-74). No equivalent rule is ratified for general staff imports.
- **(e) Merge of two existing records.** This is a deliberate staff action in Phase 4 under ADR-0216.

**Automatic merge is not permitted anywhere by the identity owner.** ADR-0216 rejects "Automatic or cross-Tenant merge" (0216:54-55). Phase 4 A9 says "never automatic" (phase-04:185, 107, 222, 399-400). P1 says merges never run automatically (phase-01:48), and CONTEXT.md agrees (1623-1628).

How ADR-0216 constrains import:

- Merge is a same-Tenant, staff-deliberate, field-by-field golden record.
- Consent combines to the most restrictive state.
- A tombstone and a replayable merge record make Undo possible.
- Only source-approved mutable references are repaired. Frozen gift, legal-donor, receipt, accounting, commitment-owner and provenance facts never move.
- A merge never transfers an owner.
- Undo is governed: it rechecks current revisions and rejects unsafe restoration. It is not a blind inverse.
- Unknown references block purge.
- Phase 30 can at most queue a candidate. Batch undo cannot delete a Party that has been merged.

Imported email is unverified contact data. It is never a claim, possession or access. Claim proof must never be backfilled from matching emails (phase-04:152, 250-253; P25 identity.md:149).

(2) External/source IDs. There is no general accepted model.

- Ratified pieces: the provider-link principle; the OpenSpec rule that each link keeps source concept, source id, tenant, confidence, status, verification and repair metadata (crm-core contract:122-124); crm_record_links as the carrier (P9); and P31 co-owning the External-IDs socket (owner-constraints:481-484).
- The only explicit scope tuple is for P28 D17: Tenant, target/workspace, source instance, entity kind and established binding (relationships.md:400).
- Financial roots must pin Tenant, Legal Entity, currency, source system and stable external ID (owner-constraints:373-377).
- P11 designs an item_external_id column on collection items.
- In code, crm_record_links exists but still has Twenty columns (twenty_object_name, twenty_record_id, crm_provider default 'twenty'). It has 0 rows and no writer (20260508000413:73-121; 20260818010000:21-34).
- No source_system, external_id, legacy_id or import_batch column exists anywhere else.

(3) Party semantics.

- party_kind is person, household or org, with group reserved. A church is an org with org_type='church'. Imported provenance is never a party_kind or status.
- Spouse is a stored person-to-person edge. Household membership, supports and org contacts are derived views that cannot be imported as edges. Relationship types come from a seeded catalog and cannot be invented on import. Edges are time-bound and never hard-deleted.
- Imported staff assignments keep protected "unknown" provenance and never get rule-managed status (P27 assignments.md:112-113, 315-318). Imports count as one encounter (P27 context.md:164). Imported private notes are never relabelled as shared.
- How a source couple or household should map is not ratified.
- The installed UNIQUE (tenant_id, email_normalized) on donors also counts merged donors. Two people cannot share an email on donor rows.
- There are no parties, household or org tables yet (#570 open). The legacy flat donors columns (type, organization, spouse, notes) still exist, and P9 says they are never carried forward.
- Restricted preparation: only the D17 self-import may target it. It must never auto-merge or bulk-update, and it must not reveal hidden matches through counts, outcomes or downloads. It is not implemented (#2072, #2336, #2369, #2368 all open).

(4) Field catalog (P11 PRD ratified; epic #645 and #646-664 all open; no schema).

- The import template is generated from getFieldCatalog and keyed by value_key. Renaming a label never breaks a mapping.
- Import is a classified write surface that rejects fields it may not set. Unknown dropdown options are rejected by default.
- A blank and a missing value are different: an absent key means leave unchanged. Defaults apply only when a record is created and never satisfy required. Value provenance records source=import.
- Auto-creation obeys quotas. An active or scheduled import blocks deleting a field it uses.
- P11 assumes there is no legacy custom-field data, which conflicts with the SiteStacker field-catalog bootstrap.

(5) Sensitivity and permissions.

- Integrated field_policies has five surfaces and no "import" surface. Unregistered surfaces fail closed.
- The only staff capabilities are coarse (admin.crm.manage and similar). There is no import, merge, dedupe, classification or clearance capability.
- Ratified rules:
  - OpenSpec requires current purpose-specific capability before anyone can list, count or retrieve an import plan (identity-and-access contract:350).
  - Holding a Phase 30 import role never widens a target owner's authority (P12:2249, 2327).
  - Non-human identities and deferred jobs re-prove their owner's current authority when they fire (contract:218-220).
  - Restricted-tier dedupe and merge require clearance. An import that sets a restricted level without an alias is rejected (P10:97, 122).
  - Restricted export is hard-blocked (P12:1641, 1663). Telemetry redacts locked-room fields.
  - Imported PII never leaves its governed boundary just to improve mapping.
- Not ratified for staff profiles: who may see raw rows, previews, candidates, error downloads and counts.

(6) Seams and obligations: section 6 of the file lists about 30 cited seams.

(7) Implementation status:

- Integrated: email normalizer and donor keys; claim and invitation tables; inert persons anchor; narrow tenant guard; crm_notes and its create command.
- Integrated helpers that are not wired in: scoreDuplicateCandidate, and resolveGuestDonorMatch (used only by tests).
- Two non-PRD merge-candidate stores exist: crm_merge_candidates (Twenty-shaped) and the donor_merge_* prototype, whose audit allows actor_type 'agent'.
- Not built: merge execution, dedupe scan, Party create, relationship writes and custom-field writes.

Key contradictions:

- owner-constraints:366-372 and P28 OA-01:47-48 still say "auto-merge high band only", against ADR-0216.
- The crm-core contract only bans low-confidence auto-merge.
- The installed email key differs from the PRD's partial key.
- Re-import "updates instead of duplicating" conflicts with D17's rule to keep current values. The per-target policy is left open (roadmap:4409).

### Open founder questions proposed by this track

- For staff import profiles, when a row resolves to exactly one authorized existing Party, should the default plan be fill-empty-only, update-changed, append-only, or reference-only with discrepancies sent to ordinary correction (the D17 posture)?
- May a single unambiguous high-confidence match (exact normalized email or a prior source-ID binding) attach a row to an existing Party without per-row review, as guest attribution does, given that merging two existing records stays manual under ADR-0216?
- How should source couples/households map: a household Party plus two person Parties with membership and a spouse edge, or one person Party with a couple label until staff split it? Who keeps a shared email under the one-email-per-donor-per-Tenant key?
- Should Phase 30 create custom-field definitions during an import (SiteStacker bootstrap), or only propose definitions that an admin creates through Phase 11 policy-at-birth before data import?
- Unknown source columns: always visibly excluded/quarantined, or offered as create-a-field proposals? Unknown dropdown values: reject (P11 default) or auto-create on admin-marked open fields?
- Does a blank cell in a staff import mean leave-unchanged (fill-only) or clear, and if clearing is supported how is it expressed and confirmed?
- Who may run staff imports and see raw source rows, previews with current values, match candidates and error downloads: a dedicated Data Tools capability, separate check/commit capabilities, or existing CRM management?
- When a staff import row matches a restricted-tier or care-protected Party the reviewer cannot see, should the row be blocked with a neutral outcome, routed to a clearance-holder, or created new and queued as a duplicate candidate?
- Should remembered tenant mappings be organization-wide or per user, and who may change a mapping that later imports reuse?
- Should source-ID bindings live on a generalized provider-link table shared with Phase 31 connectors or on a separate import-binding record, and must a binding carry source instance and purpose?
- Should imported staff-assignment and relationship edges be in the first release at all, given imported assignment provenance stays protected/unknown until reviewed?

### Verifier: non-confirmed verdicts

- **corrected** — claim: crm_record_links exists with Twenty columns, its Twenty CHECK was dropped and it was re-commented, it had 0 rows on 2026-08-18, and it has no writer; staff select/insert policies apply (:200-218).
  - evidence: Confirmed: 20260508000413_crm_identity_mapping.sql:73-90 (crm_provider DEFAULT 'twenty', twenty_object_name and twenty_record_id NOT NULL) and 20260818010000_retire_twenty_crm_runtime.sql:1-8 and 21-34. No TS in packages, apps or scripts writes the table; the only reference is a description string in packages/api/src/crm/identity/concepts.ts:65. The policy description is wrong: :204 grants SELECT, INSERT and UPDATE to authenticated, and :211-240 defines select, insert and update RLS policies using authz.has_staff_membership(tenant_id, NULL), which matches any active staff member. 20261024163000:39-41 re-targets them to authenticated. asym_entity_id is TEXT NOT NULL (:80).

### Verifier: missed by this track

- M1: The integrated #2254 identity contract docs/security/identity-email-normalization.md:81-89 says 'There is no donors.merged_into_donor_id. Merge redirects stay in the server-only donor_merge_redirects table'. It also says merge execution (#512) must clear or rewrite the merged row's email, or reopen the index design. ADR-0216:19 and P4:185/268 instead name a merged_into_donor_id tombstone, so the integrated contract treats the 'prototype' redirect table as the redirect store. This affects how Phase 30 undo-after-merge finds survivors, and how re-import email matching treats merged-away donors whose email may have been rewritten.
- M2: crm_record_links and crm_merge_candidates are directly writable by any active tenant staff member. 20260508000413:204-207 grants INSERT and UPDATE to authenticated, and the RLS policies at :220-240 and :251-271 require only authz.has_staff_membership(tenant_id, NULL), with no capability check. They remain in force after 20261024163000:39-44. If Phase 30 records source bindings in crm_record_links (P9:846-847), any staff member could forge or re-point bindings and merge candidates through PostgREST. The P4/P9 owner must close direct DML and route writes through a typed command before the table becomes trusted import provenance.
- M3: The integrated public.crm_command_logs table (20260507234343_crm_command_logs.sql:1-16) stores actor, request_id, action, resource, idempotency_key, status and a JSONB payload. It is written by logCrmCommand (packages/api/src/crm/commands/log.ts:69-81), whose only caller is createMissionControlCrmNote (admin/crm/notes/service.ts:253), and the digest does not mention it. Its redaction matches key names only (log.ts:47-62) and does not redact PII, so raw import rows must never be sent through it. P9:595 also rules out a generic CRM journal, so Phase 30 should not adopt this table as its row-receipt store without an owner decision.

---

## r03: `r03-money-history-openings.md`

### Summary

Track R03 covers historical money, recognition, commitments, receipts, accounting and Field Account openings for Phase 30 (imports-migration). It is static, read-only research on develop 629cb71dc, with all citations accessed 2026-10-31.

Bottom line: every money family already has a ratified or published owner rule saying what an import may and may not do. None of those owner commands exists in code. In supabase/migrations and packages/api there are zero matches for contribution_headers, contribution_credits, gift_entry_batches, recurring_commitments, fixed_total_pledges, Field Account or Opening Position tables, Posting Ownership Cutover, already_receipted, import_session or external_id. What exists is the legacy prototype that the owners call migration evidence or removal targets:

- `donations`: single donor/fund FK, currency defaulting to usd, amount converted with x100, no Legal Entity, no source IDs.
- `donor_pledges` and `pledge_charge_attempts`.
- `staged_gifts`, `contribution_adjustments` and `gift_receipt_records`.
- Mutable balance scalars `missionaries.current_funding` and `funds.current_amount`.

The ADR-0208 money primitives (currency_metadata, parseMoneyToMinorUnits, assertTransactable) are integrated source. The roadmap gate "adapters activate only after the target phase and its typed import command exist" (owner-constraints.md:389-393) is unmet for every money target.

Per-family owners:

- **Historical gifts:** Phase 13 D.6 "import/adopt" (phase-13:1023-1039). No special imported status. Payment is "already-succeeded". Posting is stamped with a pre-Asym provenance boundary. A separate Phase 7 import fact records that a prior receipt exists or that no Asym receipt is permitted. Accounting ownership goes to the Phase 20 D17 cutover. Review is bypassed unless donor match or allocation is ambiguous; large-gift and restricted predicates still apply.
- **Refunds, returns and chargebacks:** append-only postings.
- **Anonymous or unknown donors:** null legal donor, never a placeholder Party.
- **Noncash:** describe-never-value is enforced across import (phase-15:922-926).
- **Matching, tributes, soft credits and DAF:** Phase 14. It already reserves import identities (external_ref, external_source and source_kind='import') and requires historic matching pairs to come through its settlement function. Tributes arrive stream-STOPPED, and "Imports fire NOTHING" is enforced by poison fixtures (phase-14:1860-1869).
- **Pledges and recurring commitments:** the Phase 16 classifier, published as #834 and still blocked (phase-16:2581-2593). Each field is classified proved, hint or unknown. Imports never backfill consent, authority, legal donor, collection authorization, fulfillment, reminders or cash. Provider objects default to external read-only or control unknown. Formal cutover needs proof the old executor stopped.
- **Accounting history:** Phase 20 D17 (ADR-0058). Clean forward-only cutover; previous-owner evidence keeps its provenance; gap-only backfill is off by default. The congruency audit item C-10 (a Blocker) adds that migration totals prove import fidelity only, not QBO/Xero posting, Bank Match or final reconciliation.
- **Field Account openings:** Phase 21 D17 (ADR-0106 and the field-account-operations contract). A complete Tenant x Legal Entity x currency cohort, a five-way disposition, and conservation (exact history plus residual equals the reconciled position). Negative positions block the cohort. Phase 30 supplies only "import-session/upload UX, transport, replaceable parsing and mapping mechanics, resumable job mechanics, and review scaffolding". D17 activation is feature-gated on the Phase 29 custody seam and the Phase 30 import-session seam, and published tickets #1218, #1219 and #1206 carry that prerequisite. D28 cumulative travel is the same: Phase 30 does bulk mechanics only. D14 card ingestion, the D8 feed and D26 archives are explicitly not Phase 30.

Reconciliation the owners already require:

- Phase 30: Legal-Entity-partitioned, per-currency counts and control totals, never summed across currencies.
- Phase 20: a Cutover Coverage Manifest plus pre- and post-activation overlap inspection, with fidelity-only totals.
- Phase 21: per-account and per-cohort conservation, shadow reconciliation and post-activation gap monitoring.
- Phase 16: shadow folds and human review reconcile before enablement, plus agreement between the Phase 13 money/receipt and Phase 16 fulfillment folds.
- Phase 14: zero-send poison fixtures.

Main contradictions found:

1. Phase 7 E3 says imported or historical gifts "can be receipted" (phase-07:339). That conflicts with Phase 30's no-new-receipt rule. Phase 13 relies on a Phase 7 import fact that Phase 7 never defines.
2. Issue #711 routes broader historical import to "Phase 36". Phase 36 is P2P and always was; historical import belongs to Phase 30. #711's safeguards still bind.
3. Phase 15 and Phase 16 A14 make the Phase 15 batch commit the sole offline-money writer, with a guard test. Phase 15 assigns formal import to Phase 30, and Phase 13 D.6 describes a separate pre-advanced import path. No owner says which writer handles historical check or cash gifts.
4. Phase 13 defines no concrete import-identity columns on contribution roots, although Phase 30 requires source system plus external ID on every financial root.
5. Phase 19 turns post-Start facts, explicitly including import retries, into Late Fact Obligations. Nothing exempts pre-Asym imports, which threatens outward-effect-darkness.
6. A server-resolved legal_issuer_id must somehow come from reviewed import mapping evidence.
7. Phase 13's own internal-cutover check (sum(minor)/100) assumes two decimals, so it cannot be reused for Phase 30 reconciliation.

Genuine founder choices remain: which writer handles historical offline money; cutover-year annual statement coverage; non-transactable historical currencies; what Legal Entity evidence counts for single-entity sources; who owns processor vault transfer and re-authorization; what "source basis" means for control totals; whether money targets are in the first Phase 30 release; and whether predecessor receipt PDFs are retained.

The output file has 14 sections with a per-family matrix and file:line citations. Phase 29 findings come from unmerged PR #2430 head 1483a349 (E10 and F30 rows; AC29-D22-01 "an imported CSV cannot certify financial coverage or replay historical effects").

### Open founder questions proposed by this track

- Historical offline-tender gifts (check/cash/church remittance from the legacy system): should they enter through a Phase 15 historical batch profile (with relaxed deposit evidence) or through a distinct Phase 13 historical-import command that Phase 15's sole-writer guard explicitly allow-lists?
- Cutover-year year-end statements: should Asym's first annual statement include pre-Asym gifts (possibly already receipted/stated by the predecessor), or cover only Asym-era gifts with the predecessor responsible for its portion?
- Historical gifts in currencies the Legal Entity never settled in (or not transactable today): import as ledger truth, as reference-only history, or reject?
- For legacy sources with no legal-entity concept, what reviewed evidence should establish each imported gift's Legal Entity: one explicit tenant-level confirmation for a single entity, or mandatory per-row/per-fund mapping?
- Who owns processor migration work (card/bank vault transfer, donor re-authorization campaigns, cutover freezes): Phase 30, Phase 16, or a separate migration workstream?
- What does 'source basis' mean for SiteStacker kit control totals (gross vs net of refunds, gift date vs deposit date, designation-line vs header)?
- Should the first Phase 30 release include any money targets, or ship Party/relationship import first and add historic gifts, commitments and Field Account opening staging as later profiles once each owner command exists?
- Should predecessor-system receipt/statement PDFs be retained as Phase 29 private evidence linked to the already-receipted fact, or should only the fact be recorded?

### Verifier: non-confirmed verdicts

- **corrected** — claim: The only source_system column is on Twenty-era crm_projection_state (20260508000413_crm_identity_mapping.sql:167), provider-locked to 'twenty'; it is not import identity.
  - evidence: 20260818010000_retire_twenty_crm_runtime.sql:19 drops crm_projection_state, so the table is gone from the final schema. The column at :167 is source_system TEXT NOT NULL DEFAULT 'asym'; the twenty lock was on crm_provider (:172). crm_record_links and donation_crm_links survive with their provider CHECKs dropped (retire…sql:21-34). donation_crm_links links donations to external records (20260512190000_phase_03_giving_pipeline.sql:182-200).
- **corrected** — claim: Phase 20 congruency audit C-10 (Blocker): migration count/amount reconciliation proves import fidelity only, not QBO/Xero posting, Bank Match or final reconciliation. The checklist marks it done and the rule is carried into owner-constraints.md:405-413.
  - evidence: C-10 text is verified at phase-20-cross-phase-congruency-audit.md:847-869, with proposed roadmap text at :1292-1305 and the checklist [x] at :1623; the audit is Completed and dated 2026-07-31. owner-constraints.md:405-413 contains only the Posting Ownership Cutover and the 'never replays historic Accounting Releases' text. :435 says only 'control totals proving migration fidelity'. The roadmap v3 Phase 30 chapter (:4320-4420) has no Bank Match, posting-owner or Accounting Release text.
- **corrected** — claim: D-5: Phase 19 turns any post-Start source fact, explicitly including import retries, into a Late Fact Obligation that may require supplemental or correction statements. No exemption for pre-Asym imports exists, which conflicts with outward-effect-dark imports.
  - evidence: phase-19-year-end-statement-operations.md:976-990 and the change spec at openspec/changes/add-statement-operations/specs/statement-operations/spec.md:138-146 are verified. The first allowed resolution is 'no document action' (phase-19:979-980), so the obligation does not itself cause an outward send. A grep of Phase 19 shows no pre-Asym or already_receipted exemption.

### Verifier: missed by this track

- M1: Twenty-era crm_record_links and donation_crm_links survive on develop with their provider CHECKs dropped (supabase/migrations/20260818010000_retire_twenty_crm_runtime.sql:21-34). donation_crm_links already links donations to external records (20260512190000_phase_03_giving_pipeline.sql:182-200), and phase-14-donor-credit-operations.md:1876 names 'generalized crm_record_links' as the future vendor linkage. The digest never names these tables. The Phase 30 grill should rule that neither is the import-identity or provenance store for financial roots (Phase 13 must define that; D-4) and should note the CRM-retirement invariant.
- M2: Under the Phase 21 D5 amendment to Phase 13 (2026-07-30), each designation line freezes an Accepted Source Purpose Authority Snapshot: restriction-or-preference class, purpose and excess-use policy version, and a provenance variant ('not_captured' still needs the exact source-purpose evidence reference and digest). 'Missing or ambiguous accepted-purpose authority blocks the affected line … no caller may select the legal classification' (phase-13-…md:796-806, :1748-1766). Legacy fund-only historical gifts may therefore block per line. Two owner questions follow: which legacy evidence qualifies, and whether an unqualified line stays blocked or becomes reference-only.
- M3: The generic Phase 30 dedupe rule ('auto-merge high band only … same rules across UI entry, API writes, and bulk import', owner-constraints.md:366-372) is not reconciled with Phase 13 story 171 (phase-13-…md:540-543). Story 171 requires unmatched or ambiguous external records to be quarantined 'rather than linked by email, name, phone, or payment fingerprint, so migration cannot silently attach money or authority to the wrong Party'. D.2 also sends import donor-match ambiguity to review (:984-989). The digest covers only Phase 21 D17's auto-merge ban. It leaves two owner questions open for Phases 4, 13 and 7: what evidence resolves the donor on a historical gift row, and whether a Party auto-merge can supply a gift's legal donor.

---

## r04: `r04-files-content-comms-workflow.md`

### Summary

I researched four areas for the Phase 30 (Imports & Migration Tools) grill: file custody, CMS content portability, communications and consent, and the workflow/applications/care boundaries. I also covered the Phase 31 external-ID and build-vs-adopt seams. The full report (285 lines, with file:line citations) is in the output file. I only read the repo and GitHub; the output file is the only thing I created (a new, uncommitted file).

**Bottom line.** Every adjacent phase has already decided how imports must behave at its boundary, so Phase 30 is a transport and staging product hemmed in on all sides. None of it is built. There is no import session, staging table, upload intake, CSV/XLSX parser, batch-origin suppression, content-portability ledger or generic external-ID table on develop 629cb71dc. The only CSV code is for exports (packages/lib/csv.ts).

**Files and custody (Phase 29, unmerged PR #2430).** The PR is open, not a draft, not merged. Phase 29's spec says it authorizes no implementation, and all its tasks are unchecked.

- **Register entries for imports:** Phase 29's list of file consumers names Phase 30 directly (rows F30, E19, E10, at custody-and-integration.md:319, 328, 368).
  - Phase 30 owns upload, session, parsing and review. The target domain owns the accepted rows.
  - The missionary self-import (Phase 28 D17) and the finance opening evidence (Phase 21 D17) are separate profiles.
  - "Irreversible target effects need source successors, not generic Undo."
  - "An imported CSV cannot certify financial coverage or replay historical effects."
  - For finance opening evidence, "P30 transports only".
- **Rules on import inputs:**
  - No bytes-only business deduplication.
  - Every derived output is a distinct, versioned artifact.
  - Parsers run with no ambient credentials and never send private files to public malware services.
  - Upload limits are set per profile; "unknown limits block that profile".
  - The only concrete CSV/XLSX numbers in Phase 29 are preview limits, explicitly not upload defaults.
- **What Phase 29 leaves open for imports:** retention (it executes the owner's retention decisions and sets no period of its own), parsing and mapping, which scanner engine, and any Phase 30 ticket.
- **Issue #2368:** OPEN, Ready, no comments. The approved amendment (P29-058) is appended to the issue body, not posted as a comment. It reuses #2368 only for "private input/parser-derivative custody". Custody must be verified "independently of import row acceptance". Full F30 evidence is shared jointly with downstream #2369. It is blocked by #2444. #2369 (the Phase 30 self-import target) is OPEN, not Ready, and is the only Phase 30 issue.
- **Concrete precedent from Phase 28.** Phase 28 has the only ratified import file profile (relationships.md:467-507):
  - Size and shape: 10 MiB upload, 10,000 rows, 500,000 parsed cells, 128 MiB unpacked XLSX, 4,096 zip entries, 32 KiB per cell, 16,384 columns.
  - Format: CSV, data-only XLSX, TSV and TXT, with no formula or macro execution.
  - Custody: a seven-day working window, then purge within 24 hours. Staging, previews and error files are Phase 29 custody material.
  - Departure: in #2083 comments, an implementation lead accepted structural-only file checks with no malware scanner, under a security grant. The founder has not ratified this, and the Phase 29 spec doesn't reflect it.

**Content and CMS.**

- **ADR-0173 (Phase 23 D29), founder-ratified, documentation only.** It splits ownership precisely:
  - Phase 23 owns the content package, the import-plan validator and the private-draft (D12) command.
  - Phase 30 owns migration sessions, private upload transport, parsing, mapping, staged rows, the issue grid, chunked execution and reversal mechanics.
  - Staged content bodies stay in "Phase 30 private staging/custody".
  - Imports never publish, create users, send, fire automations or emit public media. Batch-origin suppression applies, but audit and outbox facts stay durable.
  - Content is never updated by title, slug, email, path or fuzzy match.
  - The Payload plugin is never the product.
- **Tickets #1407, #1408 and #1409:** all OPEN, no comments. #1407 requires a "Phase 30 migration source-adapter contract" before it can start, so that is a concrete deliverable Phase 30 owes Phase 23.
- **Redirects:** Phase 30 only carries exact legacy redirect maps through Phase 23's validator.
- **Phase 22 and Phase 24:** an imported page cannot inherit a rights attestation, and an imported site cannot carry reviewers, grants or overrides.
- **ADR-0179 (D35)** is a one-time internal CMS replacement, not Phase 30.
- **Phase 42:** a developer database never replaces current CMS content (workflows.md:332).
- **Payload:** the installed version is 4.0.0-beta.3. @payloadcms/plugin-import-export is published on npm at that version but isn't installed or configured. The repo's copy is a vendored v3.77.0 historical mirror.

**Communications and consent.** Many independent sources agree that imported phones, subscription flags, opt-ins, gifts or relationship labels never grant consent:

- roadmap.md:4381
- the SMS-W03 contract
- SMS-AT-05 and SMS-AT-28 ("incomplete legacy evidence remains unconsented")
- ADR-0028
- the outbound-communications contract
- Phase 28 ("no imported flag manufactures consent")
- ADR-0170

Do-not-contact and withdrawal remain hard floors. Phase 32 applies the stricter suppression and never re-subscribes anyone on reconnect. Phase 44 forbids merging accounts by email and creates no consent from directory sync.

Nowhere does a source say where imported adverse evidence lands, or with what channel, purpose or scope. The existing suppression table is keyed by tenant plus email address and has a free-text source column.

Downstream owners also need to know whether imported history is complete: "a fresh import containing no older gifts cannot prove there were no earlier gifts" (Workflow Studio, Phase 35).

**Workflow, applications and care.**

- Workflow templates import as inert, disabled drafts that need rebinding.
- Historical imports are side-effect-dark. The Workflow runtime expects an explicit `historical=true` marker on imported events, but nobody is assigned to set it.
- Workflow recipe ADM-07 expects an "import manifest" it can review and an "authorized import acceptance" command it can call.
- Applications enter only through Phase 41, with no Party-wide evidence reuse. Phase 41 has no section in owner-constraints.md.
- Care notes are "never ordinary CRM notes", and clinical content never enters ordinary CRM fields. No Phase 38 import target exists.

**Phase 31.** It shares external-ID conventions with Phase 30. Phase 30 and Phase 31 co-own the External-IDs slot that Phase 9 reserved. The importer build-vs-adopt choice is to be decided together with OAuth and webhooks ("don't hand-roll the importer grid, webhook delivery, and connector OAuth simultaneously"). Outbound continuity feeds, resnapshots and records archives are not imports. The only provider-link table today is crm_record_links, which still has Twenty-shaped columns (retired references only).

**Main discrepancies.**

- Parsed staging rows: Phase 30 database state (ADR-0173) or Phase 29 custody derivatives (#2368, Phase 28 R26)?
- "Time-boxed batch undo" in owner-constraints conflicts with "no universal undo" and "checked reversal plan" elsewhere.
- Matching strictness differs by profile.
- Owner-constraints still says "signed-URL" while the Phase 29 spec bans bearer links.
- The malware-scan departure.
- Three different things are called "D17".

The output file also lists 12 open founder questions and the items I couldn't verify.

### Open founder questions proposed by this track

- Retention for staff/migration import source files and staging: adopt Phase 28's seven-day working window plus 24-hour purge, or retain SiteStacker exports until migration sign-off/reconciliation acceptance (and for how long)?
- Are parsed staged rows Phase 29 custody derivatives (with P29 hold/disposal/restore) or Phase 30-owned database state?
- First staff/migration profile limits: reuse the Phase 28 10 MiB/10,000-row profile or define a larger SiteStacker migration profile?
- Must CSV/XLSX import inputs pass a real malware scanner at launch, or is structural-only validation acceptable for data-only formats?
- Legacy newsletter/subscription flags: evidence-only requiring re-permission, a consent record with legacy provenance under Phase 3 rules, or excluded?
- Imported adverse evidence (unsubscribe, bounce, complaint, do-not-contact, do-not-mail, SMS STOP): enforce tenant-wide across channels, or preserve per channel/purpose/topic as recorded?
- Do CMS migrations start only in the Web Studio Content portability workspace, or also from Mission Control Data Tools with Phase 30 mechanics underneath?
- Does Phase 30 host the Phase 17 template import and Workflow template import UIs, or do they remain domain-local inert-draft lanes?
- Are legacy free-text notes imported at all, and what classification gate keeps care/clinical content out of ordinary CRM notes?
- Is application/onboarding history (Phase 41) part of the SiteStacker migration kit at launch?
- User-facing reversal: offer 'Undo' (time-boxed while no downstream coverage) or only a 'Prepare reversal' checked plan?
- Importer build-vs-adopt (Flatfile/OneSchema/Dromo, Payload plugin, native), decided jointly with Phase 31 OAuth/webhook choices?
- Who sets the historical marker on events emitted from imported rows: Phase 30 transport or each target owner's command?

### Verifier: non-confirmed verdicts

- **corrected** — claim: Discrepancy: owner-constraints promises time-boxed batch undo with before-images, which conflicts with roadmap's 'no universal undo', Phase 29 F30's 'not generic Undo' and ADR-0173's checked reversal plan.
  - evidence: owner-constraints.md:378-385 reads "time-boxed batch undo with before-image capture only while no immutable downstream coverage exists". When coverage exists, "undo is blocked and the owning domain's append-only successor/correction path applies". That is consistent with roadmap.md:4395, F30 :368 and ADR-0173 clause 29.
- **corrected** — claim: public.email_suppressions is keyed by (tenant_id, email, suppression_type), has a free-text source, and has no channel, purpose or scope column.
  - evidence: In supabase/migrations/20260402090000_resend_email_foundation_backfill.sql: the table is defined at :86-95, the unique index at :143-144, and :91 has `group_id UUID REFERENCES public.email_suppression_groups(id)`. email_suppression_groups is defined at :75-84 as tenant-named groups, unique on (tenant_id, name), with is_default. evaluateEmailConsent (packages/api/src/email/consent.ts:142-176) reads only suppression_type.

### Verifier: missed by this track

- Phase 10 sensitive-data rules bind imports. An API or import that sets a restricted/high_risk security_level without a distinct alias is rejected fail-closed (phase-10-sensitive-data-safety.md:97,174,223). Legal name, real country, precise location and real photo live only in party_restricted, with photos in a non-public bucket (:99,:137). Worker-linked media is EXIF/geodata-scrubbed on upload (:98). So SiteStacker imports of restricted-worker identities, photos and page content must go through the Phase 10 alias constraint and publication firewall. None of this is implemented: neither party_restricted nor security_level appears in supabase/migrations.
- Phase 3 governs import-session read models: 'Phase 29 private byte objects and Phase 30 import-session mechanics retain separate projections and never imply Phase 21 activation'. Readers must filter by tenant, cohort, staging generation, parser/mapping version and classification before any row, count, preview, exception, log or diagnostic, and a partial subset can never be shown as a complete cohort (phase-03-minimum-permission-role-scoped-projection-foundation.md:615-626). So the Phase 30 issue grid and counts are Phase 3 census projections. Separately, roadmap.md:4268 on develop preserves 'Phase 30's staging-only role', which bears on the question of who owns staged rows.
- The #2083 structural-only scanning departure covers only CSV, TSV and TXT up to 10,485,760 bytes. The data-only XLSX that R25 admits (#2087 R13, OPEN Ready) is a ZIP container, and so is any zipped SiteStacker export. Neither has a malware scanner or a recorded departure, while REQ28-R26 still requires quarantine/scan controls. The founder question on scanning should ask about XLSX and archives separately.

---

## r05: `r05-phase25-28-and-issues.md`

### Summary

Across Phases 25-28 there is one concrete, already-chosen Phase 30 consumer: the Phase 28 D17 missionary contact self-import. Phases 25, 26 and 27 never name Phase 30 as a dependency. Every "P30" in those files is a local requirement or acceptance ID. What they do impose are rules that hold for any import path. Imports keep their provenance. Imports start no new work, outreach, approvals, receipts, ratings baselines or attention items. Ambiguous imports are quarantined rather than labelled received or One-time. Tenant/external_source/external_ref prevents duplicate gift import (Phase 25 acceptance.md:1543). Imported provenance never becomes rule-managed or shared history (Phase 27 assignments.md:108-116, context.md:31). Phase 26 fences Phase 30 off explicitly (traceability.md:6917) and has its own import/export for its configuration.

D17 status: the founder ratified it on 2026-10-16, including C01-C24, the file and custody profile, and P01-P28 as future obligations (review.md:792-808; phase28-session.md:2302-2318). It was published as spec #2064 and contract text (openspec/contracts/missionary-workspace-depth.md R19-R26). Commit 542cb78b1 (2026-10-21) added it to the roadmap (4328-4333, 4353-4361, 4411-4414) and owner-constraints (333-355). Nothing is implemented, qualified or activated. The only evidence is synthetic: Postgres 30/30 and a format probe 34/34. No importer is mounted, and the current Add Partner writes donors from the browser.

The accepted profile:

- **Journey and actor:** Choose file -> Review -> Import and results. The currently authorized missionary is both reviewer and committer. No staff substitution and no second reviewer.
- **Target:** restricted preparation, or safe reuse of an authorized reference.
- **Fields:** name/label, email, phone and mailing address only. A row needs a name, email or phone. Multiple values need explicit mappings. Source IDs and labels stay provenance. Unsupported fields are shown as excluded.
- **Matching:** no auto-merge, no bulk update, and no hidden-match disclosure. External IDs are scoped to tenant, target, source instance, entity kind and binding.
- **Restrictions and effects:** adverse contactability needs an atomic P6 receipt or the row stays blocked. No outward effects.
- **Plan and results:** the reviewed plan is immutable and bound to the exact bytes. Each row gets one of seven outcomes, and the counts must add up. Durable receipts, lease fencing, cancel and discard. No batch-undo engine.
- **Limits:** 10 MiB upload; 10,000 rows; 500,000 slots; 128 MiB expanded; 4,096 ZIP members; 32 KiB per cell; one worksheet; 16,384 columns. CSV/TSV/TXT and data-only XLSX. UTF-8/UTF-16 BOM and explicit Windows-1252. No formula execution.
- **Custody:** P29 private custody with a seven-day non-sliding window and 24-hour purges.
- **Reuse:** P28 must reuse P30's intake, parser and job substrate.

Source presets only help with mapping. MPDX/Tnt continuity feeds were dropped by D41. Phase 30 must qualify these contracts, not reopen them (roadmap.md:4411-4414; owner-reconciliation.md:42-50).

GitHub: #2369 is the only Phase 30 issue. It is open, not Ready, has no parent and no comments, and was filed 2026-10-25 per "Chad for Blake." It natively blocks #2083, #2084 and #2348, so the whole D17 chain waits on Phase 30 grooming. #2368 (Phase 29 custody, Ready, parent #2429) carries the approved P29-058 amendment. Under it, #2368 owns only private input and parser-derivative custody, with AC29-D21-19/AC29-D22-01 jointly owned with #2369; it is blocked by #2444.

The Phase 28 tickets have moved ahead of Phase 30:

- #2347 (Ready, no blockers) designs a shared pure text reader/planner in packages/lib/import/text, with the target profile "from the Phase 30 owner."
- #2087 (Ready) designs an in-repo XLSX/ZIP reader plus saxes@6.0.0.
- #2083 r2 designs P28 custody and plan tables (preparation_import_*) but rules no stand-in, blocked on Phase 29/30.
- #2084 designs runs and leases (BATCH_ROWS=50, 60s lease).
- #2085 rules a "source instance" to be a user-named label, as a recorded departure.
- #2352 sets a per-tenant concurrency cap of 1 and a factory-measured envelope.

No implementation PR exists for any of these. packages/lib/import is absent on develop 629cb71dc.

Other consumers:

- #1407 (Phase 23) is externally gated on a "Phase 30 migration source-adapter contract" that does not exist.
- Phase 21 #1218/#1219/#1206 need Phase 30 inbound staging before evidence-bearing opening can activate. #1193 explicitly does not depend on Phase 30.
- #660 (Phase 11) produces the Import Template Descriptor and the bulk validated write API that Phase 30 consumes. Phase 30 builds parsing, mapping UI, fuzzy fallback, dedupe, staging, async processing and error files.
- #711 wrongly points broader historical import to Phase 36, which is p2p-campaigns.

PR #2430 is open, not draft, unmerged, head 1483a349, and changes nothing about Phase 28 imports. Its Phase 29 F30/E19/E10 rows say Phase 30 owns upload, session, parse and review, while targets own accepted effects.

Main discrepancies:

- The Phase 28 tickets building plan/run/receipt and parser mechanics conflicts with "P30 owns plans, source namespaces, runs and row receipts" and with C22's reuse rule.
- The ticket-level parser and dependency choices pre-empt Phase 30's open build-vs-adopt decision.
- The "high band" auto-merge shorthand in owner-constraints conflicts with P4's never-auto-merge.
- The seven-day clock and malware scanning have ambiguous owners.

Several queries returned zero issues and zero PRs: SiteStacker migration, import wizard and dry-run import.

### Open founder questions proposed by this track

- Should Phase 30 adopt the Phase 28 ticket designs as the shared Phase 30 substrate (packages/lib/import/text and xlsx readers; preparation_import_* plan/run/receipt tables)? Or should Phase 30 define a generic import-session/plan/run/receipt model that the D17 profile consumes, re-scoping #2083/#2084/#2085?
- For staff migration profiles, should Phase 30 build natively (as D17 does) or embed a Flatfile/OneSchema/Dromo-class importer, given the governed-data boundary and the D17 rule against unqualified processors?
- Which source export profiles and entities ship first for staff migration (for example SiteStacker Parties, then relationships, historic gifts, commitments)? Is the first Phase 30 release the D17 profile, the low-risk source-to-Party import, or both?
- For staff profiles, is any automatic merge ever acceptable (the owner-constraints 'high band'), or must every match be a reviewed choice (Phase 4 'never auto-merges')?
- What should a 'source instance' be for scoping stable external IDs: a user-named label per import, a registered tenant source/connection, or a system-of-record registry?
- Should staff migration profiles inherit the D17 limits (10 MiB / 10,000 rows) or get larger, separately qualified limits?
- Given the current field policy, should missionaries be able to download correction/error files that contain contact fields, or should the D17 journey rely on in-app correction only?
- Should Phase 30's first release include the 'migration source-adapter contract' that Phase 23 #1407 waits on, or should Phase 23 CMS import proceed independently on its neutral package schema?
- Should a Phase 30 epic and ticket graph be created now (only #2369 exists), and should #2369 become Ready once groomed?

### Verifier: non-confirmed verdicts

- **corrected** — claim: Phases 25, 26 and 27 never name Phase 30 as a dependency. Every 'P30' there is a local requirement or acceptance ID, and grep for 'Phase 30|imports-migration' returns nothing.
  - evidence: The grep used 'Phase 30' with a space and missed 'Phase30'. Two founder-ratified Phase 25 reviews (7 Sep 2026, adopted for AL-1563) name Phase 30 obligations. phase25-r05-adversarial-review.md:717 says "Imports / Phase30 | Supplies qualified provenance/correlation through owners. History neither matches donors nor imports historical artifacts or adopts payment executors." phase25-r11-adversarial-review.md:425 says "Phase30 must preserve binding/contact-proof provenance". phase-26-support-hub-traceability.json:122239-122241 also carries the Phase 30 fence.
- **corrected** — claim: Phase 23 #1407 is gated on a 'Phase 30 migration source-adapter contract' that does not exist anywhere. The open question is whether Phase 23 should proceed on its own neutral package schema.
  - evidence: #1407 is OPEN, and body :107/:125/:130 cite that external gate. No artifact with that name exists; git grep finds only unrelated Phase 24 text. However, Phase 23 D29 (founder-ratified 2026-08-24, phase-23-web-studio-cms-decision-log.md:7862-7882 and :8173) already defines the split. Phase 23 owns the Content Package, validator and typed commands. "Phase 30 owns reusable migration sessions, private upload transport, parsing, mapping UI/mechanics, staged rows, issue-grid mechanics, chunked execution, and reversal-workbench mechanics."

### Verifier: missed by this track

- Phase 23 D29 (founder-ratified 2026-08-24, phase-23-web-studio-cms-decision-log.md:7862-7882, :8173) assigns Phase 30 reusable migration sessions, private upload transport, parsing, mapping UI, staged rows, the issue grid, chunked execution and reversal-workbench mechanics. That means one P30 substrate must serve P23, P21 and P28, which strengthens Discrepancy 1 against P28-named preparation_import_* tables becoming the shared substrate. It also partly answers open question 8 and sits in tension with D17's 'no batch-undo engine' for profiles other than D17.
- Commit 542cb78b1 also added a D17 custody bullet to the Phase 29 section of owner-constraints.md:162-170. It says the existing private Upload Intake owns the file and parser derivatives and P30 owns parsing/review mechanics. It also says 'Apply the exact target-purpose classification, access, malware, retention/hold/disposal and restore rules ... No second file store or invented retention period is introduced'. This is the authoritative D17 source for Discrepancies 5 and 6. The digest instead cited owner-constraints.md:394-396, which is the Phase 21 D17 opening bullet. The bullet also contradicts #2083's early 'own seven-day upload custody clock' stand-in.
- The #711 handling is incomplete. The Phase 13 PRD (:158-163) sends 'recurring-object adoption, and bulk cutover tooling' to a migration workstream governed by Phase 16's control contracts, and :2143-2145 says 'Phase 16 owns all import/adoption control posture'. Re-pointing #711 should therefore split the work: Phase 30 historic-gift transport and staging, Phase 16 adoption control, and the Phase 13 ledger linkage seam. Re-pointing it to Phase 30 alone is not enough.

---

## r06: `r06-repo-implementation-evidence.md`

### Summary

I checked the code on develop at 629cb71dc (read-only) and the docs-only Phase 29 PR #2430. No import capability exists. The repo has the infrastructure an importer should build on, but none of the target owners it needs.

**Not there yet**

- **Parsing:** no CSV or XLSX parsing library in any package.json or in bun.lock. No parser code, and no handling of input file encodings.
- **Import machinery:** no tables or code for import sessions, runs, batches, staging, column mappings or dry runs. No Data Tools route, menu item or permission in Mission Control.
- **Identity targets:** no Party, Household, Organization, Relationship or custom-field tables. `public.persons` exists but is empty and unused by design. The only identity record is the old flat `donors` table, which stores running totals (total given, last gift).
- **Money:** gifts are only created by the Stripe donation flow. The one non-Stripe gift-entry command (offline gifts) is deliberately unfinished and returns HTTP 501. Gifts have no Legal Entity, external-ID or source-system column, and a hard-coded default tenant ID and `'usd'` default are still declared.
- **Files:** no private import-file storage and no malware scanning. Existing upload code writes to public buckets.
- **UI:** no generic file picker or upload area, and no wizard or stepper component.

**Reuse these**

- `csvSafeCell` in `packages/lib/csv.ts`. ADR-0212 makes it the only allowed CSV escaping code.
- The background-job machinery and its published spec (`openspec/specs/workflow-orchestration/spec.md`):
  - a ledger table (`workflow_dispatch_requests`) that records work before it is handed to Inngest, keyed per tenant
  - job events that may carry only IDs, never record data
  - per-tenant concurrency limits, work claims and recovery scans
  - Inngest 4.25.0 runs seven functions today; none relate to imports.
- The tenant guard (`withTenant`), which runs background work under row-level security for one tenant, plus the CI checks on table security and service-role use.
- Per-tenant idempotency keys with unique constraints, and the single email normalizer `public.normalize_email`.
- Database tests that run against real Postgres 17 in the CI `migrate` job. These can prove the idempotency, scope and late-commit behavior the roadmap asks for (`roadmap.md:4401`). Playwright with axe accessibility checks and `@inngest/test` are also in place.
- TanStack Table 9.3.1 for shared tables. The new permission registry from ADR-0210 is a good home for future import permissions, but it is not yet used by request auth.

**Useful models to adapt, not copy**

- **Contribution bulk batches** are the closest thing to an importer. They preview, store items in order, claim 25 at a time, record a result per row, recover stuck items, and re-check the current user's permissions on every chunk. But the browser drives the loop (not Inngest), and they use the service-role database client.
- Others: the counts-only document-cutover census, the audited CRM report CSV export, and an unused editable `DataGrid` in packages/ui (grid roles, keyboard, paste, undo, per-column checks).

**Two hard limits on how an importer is built**

- **Service-role client:** the CI check on service-role database use is frozen and can only shrink. Any new site fails `test:unit`, and adding one needs a new security ruling (`docs/security/tenant-guard.md:232-239`). So a new importer cannot be built the way contribution batches are; tenant-scoped work has to go through new tenant-guard functions.
- **Actor authority:** job events have no field for who started the work, and jobs run as a placeholder system user (all-zeros ID). Nothing today lets a background job carry a staff member's authority, which the roadmap's "reprove authority at commit" needs.

**Avoid these**

- The missionary "Add partner" dialog inserts into `donors` straight from the browser, but signed-in users only have read access to that table, so it should be refused. I did not run it.
- `findOrCreateDonor` is unused and has a known race (#2299).
- A second email normalizer in `crm/mapping/normalize.ts` that skips Unicode normalization. It also assumes US phone numbers and USD.
- Two separate, unconnected donor-matching vocabularies, and merge tables (`donor_merge_*`) that no code reads or writes.
- Leftover Twenty CRM link tables (Twenty is retired; ADR-0001).
- `donations.source='import'` is only a display label, not real source tracking.
- Payload's import/export plugin is not installed. The only copy is in the vendored upstream tree at 3.77.0, while 4.0.0-beta.3 is installed, and ADR-0173 rejects it as the product.

**Nothing to suppress yet**

- No database trigger sends messages.
- Receipts go out only when staff act.
- Mission Control automations are only evaluated in preview.
- There are no welcome or first-gift flows.
  So "imports send nothing" has to be designed into the event model before any automatic sends exist.

**Ownership overlap with Phase 28**
Published Phase 28 tickets already define the parser and review plan:

- #2347 (Ready): a pure reader and planner in `packages/lib/import/text`, with encoding, separator and size limits and a frozen plan tied to the source file.
- #2087 and #2352: XLSX support.
- #2084 and #2085: commit with per-row results, and safe re-import.
  The only Phase 30 ticket is #2369 (D17 profile, not Ready). The owner constraints assign "replaceable parsing" to Phase 30, so these tickets need reconciling. None are implemented; `packages/lib/import` does not exist.

Two smaller issues: annotated error files written with `csvSafeCell` will carry its `'` escape back into a re-upload. And the unique `donors` email index stops two old contacts who share an email from landing as two records.

The report has file:line evidence, test coverage and a 1–5 classification for each finding.

### Open founder questions proposed by this track

- Should Phase 30 adopt the Phase 28 packages/lib/import/text reader and immutable plan (#2347) and XLSX reader (#2087) as the single shared import engine for every profile, including staff migrations and the SiteStacker kit?
- Build natively or embed a vendor importer (Flatfile/OneSchema/Dromo)? Is any vendor-hosted processing of imported PII acceptable, given the rule that imported PII never leaves its governed boundary and Phase 29's least-privilege parser rule?
- When staff fix an annotated error file and re-upload it, should the importer strip the spreadsheet-safety quote prefix automatically, or should error files be issued in a format that avoids it (for example XLSX)?
- When a long import runs in the background, whose authority does each chunk use: the committing staff member re-checked every chunk, or a delegated service account tied to that person? What should happen to an in-flight import if that person loses access?
- May the first 'complete low-risk source-to-Party import' target today's legacy donors record, or must Phase 30 wait for the Phase 9 Party target to exist?
- Who may run staff imports: every staff member (today all staff subroles have identical capabilities) or a dedicated data-steward permission? Where should Data Tools sit in Mission Control navigation?
- For legacy contacts who share one email (spouses, household inboxes), what should the first profile do: create one record, create separate records with a held duplicate, or quarantine the rows for a staff decision?

### Verifier: non-confirmed verdicts

- **corrected** — claim: owner-constraints.md:395-397 assigns 'replaceable parsing' and mapping mechanics to Phase 30, which conflicts with the Ready Phase 28 tickets that put the reader and plan in packages/lib/import/text.
  - evidence: owner-constraints.md:394-397 reads 'For Phase 21 D17, Phase 29 owns ... Phase 30 owns import-session/upload UX and transport, replaceable parsing, mapping mechanics ...'. That sentence is scoped to Phase 21 D17 (finance-history adoption), not to Phase 28 D17 contact imports or imports in general.
- **corrected** — claim: Phase 29 PR #2430 contains no application/database code; its only non-doc changes are scripts/git/environment.mjs, scripts/git/pre-push.mjs and one test.
  - evidence: git diff --name-only 629cb71dc...1483a349 also lists .gitattributes, .prettierignore, and docs/prds/sitestacker-parity/phase-29-files-documents/tools/render-spec.mjs and verify-evidence.mjs. gh pr view 2430: OPEN, not draft, no review decision, not merged, head 1483a349.

### Verifier: missed by this track

- #2347 fixes its acceptance bounds as constants, each accepted at its limit and rejected one over: 10,000 rows, 500,000 slots, 32,768-byte cells and 16,384 columns (issue body line 22). Staff or SiteStacker migrations routinely exceed 10,000 rows, so adopting #2347 as the single engine also requires the bounds to be set per profile. Plan storage, superseded marking, review commands and their tenant-guard GUARDED_RPCS were moved to #2083 by ruling, with migration 20261025210000 reserved (body lines 49, 65). Phase 28 therefore already plans a staging/plan store, which overlaps Phase 30's 'staging, plans' ownership (roadmap.md:4377), not just parsing.
- ADR-0212's export policy, not just csvSafeCell, binds annotated error downloads and templates. 'exportable' is authoritative, 'serializers ... cannot grant export from visibility alone', and CSV/JSON 'share authorization, row scope and identifiers-only audit of actual emitted rows' (docs/adr/0212 Decision). Error files echo uploaded PII, so they need field-policy resolution and emitted-row audit; the client-side packages/ui data-table CSV download is not a compliant precedent.
- Further inferred donations defaults that a historic-gift import could hit: 20260214090000_foundation_1_schema.sql:333-338 sets gift_date NOT NULL DEFAULT CURRENT_DATE and source DEFAULT 'direct', besides currency NOT NULL DEFAULT 'usd'. A historic row without an explicit date would silently become today's gift, contradicting roadmap.md:4395 ('A source event marked historical cannot become prospective by changing a displayed timestamp'). Also, the contribution-batch browser loop is capped at MAX_CONTRIBUTION_BATCH_PROCESS_REQUESTS = 50 (apps/admin/app/(app)/contributions/batch-continuation.ts:13), so at most about 1,250 items per session, which further disqualifies it as an import executor.

---

## r07: `r07-sitestacker-sources.md`

### Summary

I researched SiteStacker (WMTEK) as a Phase 30 migration source on 2026-10-31. I used about 45 official help articles from training.sitestacker.com, plus forms.sitestacker.training and sitestacker.com, and checked them against the repo baseline (roadmap.md:4320-4420; owner-constraints.md:329-455). Before this, the repo cited none of SiteStacker's import or export articles. Parity-matrix row 22 (parity-matrix.md:783-791) only says "extent partial".

**Export surfaces (verified).** The vendor documentation index lists exactly two "Exports" entries:

- **CRM grid "Export as CSV":** filter the records, choose columns, then export.
- **Contributions grid "Export as CSV":** the Transaction, Campaign/Designation and Recurring views.

Smaller documented exports:

- a per-donor "Export all donor gifts to CSV" from the CRM record's Giving tab;
- per-list newsletter subscriber CSVs;
- the Statements report (CSV or PDF template);
- tagged reports in the Reports component;
- per-person PDF print templates;
- an entity-definition "Export to Import" (CRM > Entities). This is the only schema-level export found, and its format is not documented.

Not documented anywhere:

- the columns of any export (whether internal IDs, external IDs, households, entity values or relationships are included);
- the permissions needed to export, and any row limits;
- a Historic Giving export;
- exports of relationships, activities, notes or files;
- any content, Site Plan, menu, redirect or File Manager export;
- a read API (only API keys, the Settings component and API Logs are documented);
- a database or file exit package.

Deleting a CRM record is permanent ("gone forever!"), so exports cannot contain deleted people.

**Data model (verified from the help articles).**

- **Records and households:** CRM has People and Groups; churches and schools are Groups, and organizations probably are too (inferred). Households are Person columns (`household_id`, `household_external_id`, `is_household_head`), with no separate household record documented.
- **Custom data:** Entity Groups → Entities → Fields, with multi-value fields and Linked Entities. Data Groups are typed lookup lists. Record Types are tags that also trigger Spark and Motion 2 automations.
- **Relationships:** identical or opposite types, linked by external ID, with direction set by column position.
- **IDs and duplicates:** each record has one `external_id`, which the vendor calls the "connecting piece". Emails must be unique. Merging duplicates is manual, with no documented detection or survivor rules.
- **Giving:** a transaction has one or more campaign designations. Campaigns are created automatically from CMS content items, and a missionary or project is a content item plus a ContributionCampaign. Offline Recurring is "similar to Pledges", and fulfillment is checked by hand from a CSV. Child sponsorship is record types plus relationships, not a commitment object. Reversals create an offsetting transaction. Soft credits are recorded on batch designations and are not on statements. Source codes are session-based.
- **Historic Giving** is a separate store, filled manually from a previous donor management system (DMS). Its template has `site_id`, `currency` ("USD or CAD"), deductible splits, soft-credit and tribute columns, and a `record_type` that is either a donation or a ledger (expense) line. It has no gift-level transaction, gateway, batch, receipt or Legal Entity columns.
- **Legal entities and currency:** no Legal Entity concept is documented. The marketing site claims "150+ currencies".
- **Mailchimp:** sync runs one way only (SiteStacker to Mailchimp), so unsubscribes and suppressions made in Mailchimp never reach SiteStacker.

**SiteStacker's own importer (verified).**

- It imports CSV templates whose leading file number selects the import type.
- It covers CRM records, Users and User Groups, Data Groups, entity definitions, content through Data Maps, child sponsorship, Historic Giving, and the offline Batch → Transaction → Designation and Recurring files.
- Any row error fails the whole file. Rollback "will delete the data in that import", and files should stay under 25,000 lines.
- Re-import (create vs update) is not documented. Newer release-note snippets suggest updates are partly possible, but I could not open that help site.

**Side effects (the key finding).** The importer does not send its own system messages ("System messages will not be sent based on import like address update"). However, "Spark automation will be triggered and could have emails triggered on both import and rollback". The docs also say:

- Record Types trigger Spark and Motion 2 events.
- Staff must turn off named Donor Spark events before importing or "this will create a HUGE mess".
- After a child sponsorship import, staff must re-tick the events' "Active" boxes.
- Spark outcomes can "send messages, add users to groups, cancel contributions".

So turning off only the importer's emails is not enough. The effects come from automations that react to the data changes, rollback causes effects too, and not all effects are emails. The vendor's workaround is a manual on/off switch for the whole tenant, which also stops automation for live donors during the migration. Asym's batch-origin suppression should therefore be recorded on every domain event, including undo events, and respected by every consumer. This matches owner-constraints.md:386-388, roadmap.md:4365 and 4395, and CONTEXT.md:4679-4684. SiteStacker's "delete the batch" rollback is exactly what roadmap.md:4371 and owner-constraints.md:384-385 forbid.

**Data Migration Plan page.** It is a static 2020 overview page, not a form. It lists five import areas, says CRM always goes first and System Messages should be turned off, and describes two ways Historic Giving is used. My reading is that SiteStacker has no migration package, rehearsal or reconciliation precedent. `external_id` values may be IDs from a system used before SiteStacker. Some tenants may hold the same gift twice, once as a native Contribution and once in Historic Giving.

**Content exportability.** Unverified across the board. Only the import shapes (`ContentItem.*` and positional fields) and the structure are documented. This is consistent with the repo's own Phase 23 evidence (opening-cms evidence:372-373; d1 evidence:543-545; D29 US23-029).

**Evidence checklist.** Section 7 of the file lists 25 artifacts in six groups: installation census, CRM, giving, communication preferences, content, and the vendor exit package. It also lists the coverage questions only real exports can answer: export headers and IDs, row caps and permission filtering, currencies and sites actually present, overlap between Contributions and Historic Giving, deleted or merged donors, ledger rows, pledge fulfillment links, and how multi-value fields are written.

**Implementation.** None exists at 629cb71dc. There is no Data Tools route, no CSV/XLSX parser, and no SiteStacker adapter. The only `source_system` column belongs to the retired Twenty CRM integration. Phase 30 is "grooming/qualification required".

**Not verified:** help.sitestacker.com (the fetch failed with a TLS error), the Business Intelligence articles (video only), the API, a vendor database export, the columns of every export, and create-vs-update behavior.

### Open founder questions proposed by this track

- Which SiteStacker export profile does the first kit target: customer self-serve UI grid CSVs only, an Asym-published 'export pack' of named Reports/BI datasets the customer builds, or a vendor database/file package where the customer can get one?
- Does Asym publish a customer-facing SiteStacker export runbook (which columns to tick, which reports to build, who exports), or run early migrations as a staff-led service?
- For tenants holding both native Contributions and Historic Giving (DMS case 2), which source is the record of truth for each gift, and is overlap resolved by a tenant-level rule or per-row review?
- Are Historic Giving 'ledger' (missionary expense) rows in scope for the kit, or excluded and left to Phase 21's own opening-evidence path?
- Is an email-provider suppression export (e.g. a Mailchimp audience including unsubscribed and cleaned contacts) a hard prerequisite before any email-consent classification is accepted for a SiteStacker tenant?
- Who asserts the Site-to-Legal-Entity and Site-to-currency mapping, and does the import block until every Site has an assertion?
- Is child sponsorship (record types plus Sponsor-of relationships) in the first kit or deferred?
- Are activities, notes and CRM secure files in the first kit, given that no bulk export is documented?
- For content, is the first kit limited to missionary/project content items, or does it attempt full Site Plan capture (crawl or vendor package) through Phase 23 D29?
- Should SiteStacker Users (logins and SAML IDs) be imported only as inert census evidence, with any later account invitation a separately authorized activation?
- Should both the SiteStacker internal ID and its external_id (possibly an ID from a pre-SiteStacker DMS) be kept as separate source identities, and which one drives repeat-import convergence?

### Verifier: non-confirmed verdicts

- **corrected** — claim: The only source_system column in migrations is in the Twenty-era crm_projection_state table (supabase/migrations/20260508000413_crm_identity_mapping.sql:163-183), so it is not a Phase 30 source-identity primitive.
  - evidence: The column exists at 20260508000413_crm_identity_mapping.sql:167 (DEFAULT 'asym'). However, supabase/migrations/20260818010000_retire_twenty_crm_runtime.sql:19 runs DROP TABLE IF EXISTS public.crm_projection_state CASCADE.
- **corrected** — claim: Discrepancy: the vendor docs disagree on System Messages during import (the Data Migration Plan says disable all; S1 says none are sent), and 'both agree Spark automations still fire on import and on rollback'.
  - evidence: The re-fetched Data Migration Plan (copyright 2020 WMTEK) says 'make sure that all the System Messages are disabled', so the System Messages conflict is real. However, the page never mentions Spark, workflows or rollback; 'Automation' appears only as a nav label.
- **corrected** — claim: Export surfaces. The documentation index lists exactly two 'Exports' entries (CRM and Giving). CRM grid 'Export as CSV' documents no columns, limits or permissions. The Contributions grid 'Export as CSV' covers the Transaction, Campaign and Recurring views ('You can export your current grid and query'). Historic Giving has no documented export, its currency is 'USD or CAD', and the marketing site claims '150+ international currencies' and 'No duplicates'.
  - evidence: The index has two bullet entries labelled 'Exports' (one under CRM, one under Giving) and no API entry. S3 (19 Sep 2023 10:56 AM) gives steps only, with no columns, limit or permission, and shows the update banner. The Historic Giving template documents currency as '(USD,CAD)', has no transaction, gateway, batch, receipt or legal-entity column, and mentions no export. sitestacker.com contains '150+ international currencies' and 'No duplicates.' Export to Import covers definitions only, in an undocumented format.

### Verifier: missed by this track

- Batch-origin suppression has no implemented seam. No batch_gate_pending, origin-reason or batch-origin column or code exists in packages, apps or supabase/migrations at 629cb71dc. The recommended origin tag on every domain event (including undo) therefore depends on the Phase 15 NF3 held gate and an origin field being built first or alongside. Grooming should record this as a sequencing dependency.
- Newer SiteStacker release notes widen the export and entity surface (help.sitestacker.com search snippets only, dated 13/04/2026; the TLS failure was reproduced). Release 2.47 adds 'Link Set' entity fields to the import component and grid modules, a further value form beyond multi-value and Linked Entities. Release 2.49 changes Export ('longer time limit for complex reports') and Mailchimp export, which suggests report and grid exports can time out or truncate. The checklist should add: installation version >= 2.49, Link Set serialization, and export timeout or truncation detection.
- Some Mailchimp-side changes cannot be reversed in Mailchimp itself. The Mailchimp article (11 Nov 2024) says a contact deleted (not unsubscribed) in Mailchimp 'can NEVER resubscribe using the Mailchimp API, only through SiteStacker', and SiteStacker has its own unsubscribe action that pushes to Mailchimp. SiteStacker's subscription state and Mailchimp's suppression set can therefore conflict in both directions. Checklist item 22 should ask explicitly for archived and permanently deleted Mailchimp members, and the SiteStacker unsubscribe should be treated as separate consent evidence.

---

## r08: `r08-nonprofit-crm-sources.md`

### Summary

I researched seven nonprofit CRMs other than SiteStacker as possible export sources for Phase 30, one section each: CiviCRM; Salesforce NPSP and Nonprofit Cloud (treated as two separate sources); Raiser's Edge NXT, with short notes on eTapestry and Luminate; DonorPerfect; Virtuous; Bloomerang; and Neon CRM. The file ends with a cross-source comparison table and my view on which sources are worth supporting first. Each fact carries one of these tags: V (read on the vendor page), V* (only seen in a search snippet of the vendor page), VC (depends on version or configuration), NX (needs a real export file), S (my inference), or 3P (third-party source). External sources were accessed 2026-10-31. Repo citations are against develop 629cb71dc.

Repo baseline: the Phase 30 roadmap lists "the first supported source export profiles" as an open decision (roadmap.md:4409). SiteStacker is the only source the roadmap names (roadmap.md:4369; owner-constraints.md:431-437). So no other source is committed in any document.

Main findings:

- **Export surfaces are not interchangeable in practice.**
  - Report and grid exports cap or choose rows and columns: Salesforce XLSX at 100k rows (third-party sources), RE NXT web-view lists at 500k rows with only the selected columns, DonorPerfect Export to Excel "not a one to one match".
  - Vendor-native backups are not portable. DonorPerfect's backup can only be restored, and restoring it undoes coworkers' later entries. RE NXT's backup is an encrypted SQL Server file that expires after 7 days and only its requester can download.
  - Only Bloomerang offers a documented self-serve whole-database export (a ZIP of per-type CSVs). eTapestry has a separate paid "Final Data Export" for organizations leaving.
- **Stable IDs vary.**
  - CiviCRM has a unique 64-character `external_identifier` (confirmed in the core schema).
  - RE NXT has three competing keys: system record ID, Import ID (loses leading zeros in Excel) and an optional Constituent ID.
  - Virtuous uses source/ID reference pairs for both contacts and gift transactions.
  - Salesforce uses record IDs, and NPSP field names are stable across orgs.
  - Bloomerang uses an account number; whether its export files carry ID columns is NX.
- **Relational rebuild is possible from the documented shapes for CiviCRM** (pledge payments carry `contribution_id`; installments carry `contribution_recur_id`), **NPSP** (Payment links to Opportunity; GAU Allocation hangs off Opportunity, Payment, Recurring Donation or Campaign, by amount or percent) and **RE via its API** (gift splits, soft credits, pledge installments and payments, linked gifts). For Bloomerang, DonorPerfect, Virtuous query exports and Neon, the link columns are NX.
- **Explicit omissions and misleading values** (Bloomerang, verified):
  - Not exported: split-gift information, groups, engagement scores, membership levels and templates.
  - Expected oddities: $0 card-validation rows when a recurring donation starts, and 01/01/0001 completion dates on active tasks.
  - Payment and staff data in the export: wallet items (EFT and credit card data), processor accounts and Users.
- **Model differences that matter for mapping:**
  - NPSP makes the household account the Opportunity owner. Nonprofit Cloud uses person accounts plus household groups, where one person can belong to several groups.
  - Virtuous makes the household Contact the giving unit, containing Individuals.
  - Percent-based designations: NPSP GAU allocations and Nonprofit Cloud gift designations.
  - Soft credits are configurable per role (NPSP) or vary by release (Nonprofit Cloud). Virtuous "passthrough" gifts describe where a gift originated, not necessarily who gets recognition.
  - Pledge vs recurring are split differently in every vendor: NPC Gift Commitments cover both; NPSP uses Opportunity+Payments vs Recurring Donation; Virtuous and Bloomerang keep separate pledge and recurring entities.
- **Import behaviors worth learning from:**
  - CiviCRM separates dedupe rules from the duplicate action (Skip/Update/Fill) and offers a preview with downloadable errors.
  - Virtuous sorts rows into Match Needed / Update Needed / Ready for Import and uses source-pair idempotency.
  - DonorPerfect shows Pending and Invalid tabs before commit.
- **Behaviors not to copy:**
  - Undo by full database restore (DonorPerfect).
  - Reprocessing that discards later manual edits (Virtuous).
  - "No Duplicate Checking" mode and irreversible batch merges (CiviCRM).
  - A dry run that checks only matching and only open Opportunities and unpaid Payments (NPSP).
  - Importers that require removing pledge-payment links and soft credits before import (Neon's legacy guidance; two Neon pages conflict on this).
  - Matching on last name + first name + address + zip, or name plus the last 7 digits of a phone number.
- **Candid view.**
  - Evidence: I found no data on which CRMs mission agencies use. Virtuous markets itself as built for faith-based nonprofits and lists Operation Mobilization among its customers (vendor-published).
  - Speculation, ranked by documented export quality: Bloomerang Database Export first (self-serve, publishes its own gaps), then Virtuous (closest model fit for ministries, weaker export), then Salesforce NPSP (open, stable schema but the highest mapping risk). Nonprofit Cloud would be a separate later profile. RE NXT is likely valuable for larger ministries but has the least portable full export. A generic canonical-CSV template set built from the field catalog is a vendor-neutral fallback.

Caveats: these pages could not be read directly — developer.salesforce.com (403), both Virtuous articles (403), the Neon support pages (403 or an expired TLS certificate) and the Salesforce help pages and SKY API reference (render in the browser only). Those facts rest on search snippets or the Blackbaud-published Power Platform connector reference. The requested Blackbaud article 75298 is about import identifiers, not export, and I report it that way. No real export file from any vendor was examined.

### Open founder questions proposed by this track

- Should Phase 30's first release ship any vendor-specific non-SiteStacker profile (e.g. Bloomerang Database Export, Virtuous query CSVs, Salesforce NPSP per-object extract), or only a generic canonical-CSV template set generated from the field catalog?
- Are API-pull extractors (Blackbaud SKY API, Salesforce Bulk API, Virtuous/Neon APIs) in Phase 30 scope, or does Phase 30 accept only customer-supplied files with any extractor owned elsewhere (e.g. Phase 31)?
- When a source's giving unit is a household (NPSP Household Account, Virtuous household Contact, CiviCRM Household, Bloomerang household), should the default legal donor be the household Party, the primary person, or left unresolved for reviewer choice?
- Should vendor soft-credit/passthrough rows always import as recognition-only credits, even where source semantics suggest the passthrough giver was the true payer (DAF, employer match)?
- For percent-based designations (NPSP GAU allocations, NPC gift designations), is a deterministic rounding/remainder rule acceptable, or must such rows be quarantined until amounts are confirmed?
- Do historic recurring schedules import as inert historical commitments, as Phase 16 recurring commitments awaiting new payment authority, or not at all?
- Are vendor attachments (Bloomerang File Attachments, RE NXT gift attachments) in scope for the first release given Phase 29 custody prerequisites?
- Is migration from missionary personal tools (TntConnect, MPDX) a Phase 30 profile (e.g. feeding the D17 self-import contact profile) or explicitly out of scope?
- Should every supported profile be required to publish a vendor-specific 'known omissions and sentinel values' sheet before tenant use?

### Verifier: non-confirmed verdicts

- **corrected** — claim: Only Bloomerang offers a documented self-serve whole-database export (a ZIP of per-type CSVs). Salesforce Data Export Service options and its 48-hour download window are only third-party claims.
  - evidence: Salesforce's own Trailhead unit (lex_implementation_data_export) can be fetched. It says 'The data is exported as a set of comma-separated values (CSV) files' in a zip and recommends 'select Include all data'. Manual export is limited to once every 7 days (weekly) or 29 days (monthly), images, documents and attachments are optional, and 'Zip files are deleted 48 hours after the email is sent.'
- **corrected** — claim: RE NXT web-view list export is capped at 500,000 records and includes 'Only the columns you select'. The self-serve backup is encrypted, expires after 7 days and can only be downloaded by its requester.
  - evidence: bb-export-lists.html confirms 500,000 records as CSV, semicolon-joined multi-value columns, the Is anonymous column, four-hour link expiry, the Control panel export setting and a 'View record' bullet. The phrase 'Only the columns you select' does not appear; instead the page says that depending on list type the file 'may automatically include additional columns'. download-backups-renxt.html confirms the TDE certificate bundle, the SAS URI with Azure Storage Explorer, 'Backups expire after seven days' and 'You can't access ones requested by other users'. It does not mention .bak format, a monthly limit or 'database view only'.
- **unconfirmed** — claim: Discrepancy: two Neon pages conflict (the legacy page says households, relationships, recurring donations, pledge-linked payments and soft credits cannot be imported; the newer Import Field Guide says the Import Manager automates household and relationship creation). Virtuous pages conflict on the passthrough limit per gift (one vs up to 100).
  - evidence: support.neonone.com article 4407409383821 returned HTTP 403 again. A web search for the exact phrase 'will automate the creation of households and relationship links' found nothing. A search for the Virtuous passthrough-limit text did not surface either page's body. Both conflicts still rest only on the researcher's search snippets.

### Verifier: missed by this track

- The repo already bans the CiviCRM 'Both' trap (CONTEXT.md:4469-4475; phase-14-donor-credit-operations.md:67, 440): CiviCRM's combined hard+soft report option double-counts. The digest does not use this when ranking export surfaces: report exports that blend hard and soft credits (a CiviReport 'Both' option, or the RE soft-credit totals that community users say come out wrong) must be rejected or flagged before reconciliation. Phase 14 also makes recognition 'deliberately unbounded across parties' (phase-14:67), so RE soft-credit totals above the gift amount are admissible recognition rather than a data defect.
- Bloomerang's split-gift omission is wider than fund designation. Bloomerang's own announcement (bloomerang.com/news/new-split-payments-in-bloomerang, 2018-11-06) says one payment can be split across campaigns, funds, appeals, tributes and custom fields, and across multiple pledge installments, recurring schedules or donations at once. So the Database Export can also lose per-split campaign, appeal and tribute attribution and the application of payments to installments or schedules. That weakens the digest's claim that pledge and recurring links can be rebuilt 'if parent IDs are present'.
- Church-management systems (Planning Center Giving and similar) are not considered as ministry migration sources, although owner-constraints.md:384-385 already cites Planning Center. Planning Center's help says Giving reports export to CSV for moving to another platform, and its donation-history import documents limits of 152,000 rows and 30 MB (search snippets only). For churches and smaller ministries this may be the system of record, which the section 9 ranking does not weigh.

---

## r09: `r09-continuity-importers-cms-security.md`

### Summary

The output file covers five areas: continuity sources, embedded importers, CMS portability, security, and spreadsheet correctness. Read-only apart from the output file. External sources were read on 2026-10-31. The repo was read at develop 629cb71dc, plus the Phase 29 PR head 1483a349.

1. MPDX and TntConnect. The vendor docs show two different kinds of authority mixed in one file. TntConnect moves to MPDX as a whole-database XML export (TntConnect 3.2 or later) carrying contacts, tasks, task history, notes and appeals. Groups and user fields become tags, and some fields are dropped (Short Name, Salutation, Task Importance, recurring tasks, pictures). Where a birthday has no year, MPDX shows 1900. "Deceased" is applied to the whole household. MPDX CSV import cannot be undone, and its re-import choices are fill-blanks or override-all. Gift and commitment data in MPDX come from organization donation systems that sync daily, and MPDX "stopped adding additional organizations" in 2024. So MPDX/Tnt money columns are copies of another system's records, not organization-authoritative history. They cannot meet Phase 30's requirement to pin Legal Entity, currency, source system and external ID (owner-constraints.md:373-377). The Phase 28 D17 decision (ratified 2026-10-16) already covers flat MPDX/Tnt contact exports for missionary self-import. It excludes native Tnt database/XML files, money, notes and history. Outbound DonorHub/MPDX continuity is a separate Phase 31 feed, not an import (roadmap.md:2088-2090; ADR-0097). I could not verify the .tntmpd/.tntdatasync formats or whether TntConnect is still maintained.

2. Embedded importers. No importer or parser dependency is installed. Ratified intent already rules out giving a vendor any authority:

- ADR-0173 item 4: vendors are adapters behind Asym-owned authority.
- D17 C12: "No source content enters external AI or an unqualified processor."
- D17 C22: no vendor selected.
- Owner constraints: imported PII never leaves its governed boundary to improve mapping.
- AGENTS.md: base-maia/Base UI only.

Vendor facts that matter:

- Flatfile has renamed its company to Obvious. Its mapping model learns from 1.8B rows of choices and the user's and colleagues' past selections. Unmapped columns are excluded.
- OneSchema warning semantics differ between its products and output formats. It drops unmapped columns unless a setting is on, and does not validate them.
- OneSchema webhooks retry only on timeout, connection failure, 408 and 429. 5xx responses are not retried, and the same request_id is reused across retries.
- OneSchema's AI sends headers, sample rows or whole files to OpenAI, Anthropic or Google, with 30-day retention at the provider.
- Dromo and CSVBox advertise browser-only "private mode" (marketing claims only).
- react-spreadsheet-import (MIT) depends on Chakra UI and a forked SheetJS, and its last release was 2024-08-23. That conflicts with the UI invariant.
- Impler is MIT.

Each option is assessed in the file against field catalog, server validation, data boundary, plan binding, warning semantics, recovery, accessibility, retention, cost and lock-in. Even a vendor front end would still need P29 custody of the original bytes, Asym plan binding and Asym issue codes. So a vendor mainly saves the mapping and grid UI, at the cost of a second data boundary.

3. CMS portability.

- Installed Payload is 4.0.0-beta.3 (since commit 8441e754e, 2026-10-22). It is not the 4.0.0-internal.1f9ae9a pin cited in the D29 research behind ADR-0173. The import-export plugin is not installed, and vendor/payload-upstream is 3.77.0.
- The public payloadcms.com pages read are 3.x docs.
- At tag v4.0.0-beta.3, the Local API default `overrideAccess` changed to false: a call without a user is treated as anonymous. The 3.x docs say access is overridden by default.
- At that same tag the plugin still defaults imported documents to 'published' (getImportCollection.ts:15, createImport.ts:60). Its import limits default to unlimited. It writes targets with overrideAccess false, but uses true for its own bookkeeping, clears the transaction and continues past failed rows.
- WordPress WXR carries content plus media references only. It has no media bytes, themes or plugins, and authors are included by default.
- Strapi import "deletes all existing data". Its export encryption is aes-128-ecb with no minimum key length, and admin users and API tokens are excluded.
- Sanity uses NDJSON. Assets can come from file or https URLs. Imported references start weak, and the patches that strengthen them reset `_updatedAt`.
- ADR-0173 rules apply: private drafts only, media admitted through P29/D27, SSRF-bounded fetching, and source authors never become users.

4. Security. OWASP CSV injection guidance now lists LF and full-width ＝＋－＠ as formula triggers. It recommends a tab prefix for Excel and says quote-based fixes fail after save and reopen. The shared CSV helper (packages/lib/csv.ts:20-28) and ADR-0212 do not cover the full-width characters. OWASP's file-upload and SSRF cheat sheets are mapped into a control checklist covering zip and XML bombs, zip-slip, XXE, macros, formulas, HTML, remote media, malware, processors and cost. Each control is tied to D17 C12/FMT-10, ADR-0173 items 13-14, and the P29 spec on the PR head ("hostile content ... remain untrusted data").

5. Spreadsheet facts, from Microsoft and WHATWG pages:

- The 1900 and 1904 date systems differ by 1,462 days.
- Excel treats 1900 as a leap year.
- Excel keeps 15 significant digits; later digits become zero, and leading zeros removed before formatting cannot be restored.
- UTF-8 CSV opens normally only with a BOM.
- Every CSV save format writes only the active sheet.
- The CSV delimiter and decimal separator follow regional settings.
- The latin1, iso-8859-1 and ascii labels all mean windows-1252, and a byte-order mark overrides any label.

D17's ratified encoding and delimiter handling already covers these points.

The file ends with nine discrepancies, eight open founder questions and a list of what could not be verified.

### Open founder questions proposed by this track

- Build versus adopt: should Phase 30 be a native workbench on Asym seams (P29 custody, field catalog, Inngest plus product ledger, packages/ui grid), or put a vendor's parse/map UI in front as a non-authoritative layer, accepting a second data boundary and a non-base-maia UI to save the mapping/grid build?
- Before Phase 40 exists, may v1 mapping assistance send headers and field-catalog metadata only (no cell values) to an external model or vendor ML, or must v1 use deterministic aliases only?
- Should staff-run Phase 30 profiles include an MPDX export and/or a TntConnect whole-database XML carrying tasks, history, notes and appeals, and if so which owner receives relationship history? Or does the flat contact-only scope of D17 stay the only missionary continuity path at first?
- Which legacy CMS adapter is certified first (SiteStacker content, WordPress WXR, other), and for WXR media does Asym fetch remote URLs through an SSRF-hardened fetcher, require a separately uploaded media archive, or support both?
- What first size and scale profile should staff migrations (e.g. a representative SiteStacker tenant) be qualified for, given that D17's 10 MiB / 10,000-row profile applies to self-import only?
- Should staff profiles accept multi-file ZIP archives (WordPress multi-XML, Mailchimp status ZIPs, CRM backup ZIPs) in the first release, or only single selected files?
- Should Phase 30 annotated error and correction downloads be XLSX-only (explicit text cells, no formulas), and should ADR-0212's shared csvSafeCell be amended for OWASP's full-width triggers and Excel tab-prefix guidance?
- When a source date has no year (MPDX/Tnt birthdays and anniversaries), should Phase 30 admit a partial date where the target owner supports one, or visibly exclude it?

### Verifier: non-confirmed verdicts

- **corrected** — claim: Outbound DonorHub/MPDX continuity is a separate Phase 31 feed, not an import (roadmap.md:2088-2090; ADR-0097).
  - evidence: - roadmap.md:2088-2090 is inside the Phase 21 chapter (heading at :1340).
- ADR-0097 status: 'Accepted (founder ruling, Phase 21 grill session — D8)'.
- owner-constraints.md:442-444: 'The Phase 21 D8 outbound continuity feed and every Phase 31 resnapshot/reset are not imports or migrations'.
- Phase 31 (roadmap.md:4424, Platform API, Webhooks & Connector Framework) supplies only the connector seams for read-only continuity feeds.
- The digest body (§1.2) is correct; only the summary JSON is wrong.
- **corrected** — claim: OneSchema: webhook 5xx responses are not retried; only timeout, connection failure, 408 and 429 are retried, up to 3 times; request_id is reused across retries. Warning semantics: errors in Importer JSON, 'ignored for CSV/Excel output', clean by default in FileFeeds.
  - evidence: - Re-fetched docs.oneschema.co/docs/importer-webhook: 'Other HTTP error responses (including 5xx) are not retried' and 'The request_id will be the same for every retry'. This part is confirmed.
- importing-warnings: warning rows are error rows by default for JSON, and 'CSV and Excel output file formats are not affected by this setting'. FileFeeds default: 'treat warning rows as clean rows'.
- The page never says warnings are ignored in CSV/Excel output.

### Verifier: missed by this track

- A second CSV encoder with no formula neutralization already exists, against ADR-0212.
- packages/api/src/admin/contribution-batches/results.ts:6-11 defines a private csvEscape. It quotes only on a double quote, comma or LF, has no formula-trigger handling, and ignores CR.
- buildContributionBatchCsv (:44-81) joins records with LF, writes no BOM, and serializes the donor-controlled donorName, donorEmail and failureReason.
- It is publicly exported via @asym/api/admin/contribution-batches (packages/api/package.json:54). At 629cb71dc only a test calls it (tests/unit/packages/api/admin/contribution-batches.test.ts:1861).
- The same module's 'complete_with_issues' status (results.ts:28) is the kind of aggregate that ADR-0173 item 18 forbids.
- §4.3's claim that csvSafeCell is the only CSV path is therefore incomplete. Phase 30 must not reuse this batch encoder for error or correction downloads.
- The Payload import-export plugin at 4.0.0-beta.3 depends on csv-parse 5.6.0 and csv-stringify 6.5.2 (npm view).
- Export: createExport.ts:405-409 and :595-599 call csv-stringify with no formula neutralization, which is a second encoder that ADR-0212 forbids.
- Import: utilities/parseCSV.ts:20-54 uses trim:true and skip_empty_lines, and silently casts 'true'/'false' to booleans, 'null'/'NULL' to null, and any numeric string containing '.' to a number ('1.50' becomes 1.5).
- Empty cells become undefined, so a blank can never clear a value, and all records are buffered in memory.
- The digest re-checked the plugin's status, access and transaction behaviour but not this parse/encode behaviour. It conflicts with D17 FMT-07, the locale-inference ban and ADR-0173 item 4.
- There is no shared file-upload or dropzone control in packages/ui yet; only a data-table exists, and a grep for file-upload|dropzone|FileUpload finds nothing.
- roadmap.md:4389 requires 'the shared accessible grid and file controls'.
- The ratified P29 spec at PR head (phase-29-files-documents.md:736) already binds file UI to 'the shared exact base-maia/Base UI components and qualified ReUI file patterns'. It also requires keyboard and touch equivalents to drag, 320px reflow and weak-network recovery.
- The digest's build-vs-embed design-system and accessibility rows do not cite this. The native path starts from a P29-owned, not-yet-built control, and a vendor iframe would bypass P29's ratified UI rules.

---

## Completeness critic: cross-track conflicts

- crm_record_links status. r03 (verifier M1), r04 §5, r06 and r07 (verifier V2) call it a retired Twenty leftover to exclude. r01's verifier, the 2026-10-24 ADR-0001 amendment, migration 20261024120000 and P9:846-847 make it the live governed provider-link carrier for #570 Party rows and imported provenance. r02's verifier adds that any staff member can write it directly through RLS.
- donor_merge_redirects. r02 and r06 call it an unused prototype to avoid. r02's verifier M1 shows the integrated #2254 contract (identity-email-normalization.md:81-89) names it the merge-redirect store with no merged_into_donor_id, which contradicts the tombstone in ADR-0216 and P4:185/268.
- Staged-row, plan, run and receipt ownership. ADR-0173, roadmap.md:4268/4377 and D17 review.md:455 assign it to the Phase 30 database. #2368 and P28 REQ28-R26 assign parser derivatives, staging, previews and error files to Phase 29 custody (r04). Phase 28 tickets #2083 r2, #2084 and #2085 design P28-named preparation_import_* tables (r05, r06 verifier).
- Parser adoption. r06 recommends adopting #2347 as the single shared engine. r05 says to decide adopt or re-scope before #2347/#2087 merge. r06's verifier and r09 V5 show that #2347 hard-codes D17-only limits that are 'not universal' and that 'a larger migration belongs in qualified P30 staff tooling'.
- Authority of the relay and factory-lead rulings. r01's main text says #2369 (Chad, Blake, Samson) is not owner intent. r01's verifier cites the #2368 adopt-and-amend precedent and ADR-0001:144, which records a Samson ruling as an accepted amendment. r05 leaves the authority of ticket-comment rulings (BATCH_ROWS, lease, concurrency cap, saxes, structural-only scanning, source-instance label) unverified.
- Time-boxed batch undo. r01 (discrepancy 2) and r02 treat owner-constraints.md:378-385 as a clause conflict that must be edited. r04's verifier finds no substantive conflict, because the clause already limits undo to the period before downstream coverage and falls back to owner successors; only the user-facing wording is open. Separately, ADR-0173 gives P30 the reversal-workbench mechanics, while P28 D17 says 'no batch-undo engine' (r05 verifier).
- Single-match attachment. r02 Q2 floats letting one unambiguous exact-email or prior-binding match attach a staff-import row without per-row review. r03's verifier M3 cites P13 story 171 (phase-13:540-543), which says unmatched or ambiguous external records are quarantined 'rather than linked by email, name, phone, or payment fingerprint', and D.2 sends donor-match ambiguity to review.
- Auto-merge handling. All tracks agree ADR-0216 governs, but they propose different fixes. r01: edit the owner-constraints clause in the P30 publication and ask about a narrow P4 amendment. r02: a P4-owned OpenSpec delta, because the crm-core contract bans only low-confidence merges. r04: target-owned per-profile policy with no global confidence policy. r05: treat every match as reviewed until P4 rules.
- Retention clock owner. r05: the P30 profile declares the window and P29 executes it. r05's verifier cites owner-constraints.md:162-170: 'No second file store or invented retention period is introduced'. r04: P29 sets no period of its own, so retention is a founder question. r01: the records-policy owner is unidentified.
- Malware scanning. r04 treats the #2083 structural-only departure as a founder decision that is not owner-ratified. r05 treats scanning as a P29 qualification gate that P30 cannot certify. r04's verifier notes the departure covers only CSV/TSV/TXT, not XLSX or ZIP archives.
- Batch-origin suppression sequencing. r06 says there is nothing to suppress today, so suppression should be designed into the event model. r07's verifier says it depends on the unbuilt Phase 15 NF3 held gate. r04 says the workflow runtime's historical=true marker has no assigned setter. No track names one producer.
- AI mapping assistance. r01 frames it as dependent on the Phase 40 ledger, a cycle because P40 depends on P30. r09 asks whether header-only external egress is allowed before P40. Neither reads the ratified shared AI execution foundation (Phase 1:66 and :397-401, Phase 21 D10, Phase 10:330).
