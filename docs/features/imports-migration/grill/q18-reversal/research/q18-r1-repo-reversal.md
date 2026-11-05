# Q18 r1: Import reversal and undo (repo research)

**Scope:** read-only research on `develop` at `629cb71dc` (repo files, current code, GitHub issues read with `gh`). It covers F14: the user-facing word for undoing an import, and which target families get a reversal workbench in v1, both for everyday imports after go-live and for a Switch. It decides nothing.

**Citation keys.** DL = `docs/features/imports-migration/grill/decision-log.md`. IMCTX = `docs/features/imports-migration/CONTEXT.md`. CTX = root `CONTEXT.md`. OC = `docs/prds/program-roadmap/owner-constraints.md`. RM = `docs/prds/sitestacker-parity/roadmap.md`. Pnn = the main `docs/prds/sitestacker-parity/phase-nn-*.md` PRD. P20A = `phase-20-cross-phase-congruency-audit.md`. P20DL = `phase-20-accounting-exports-reconciliation-decision-log.md`. P23UX = `research/phase-23-d29-content-portability-ux-benchmark.md`. P24D12 = `phase-24-d12-direct-giving-address-continuity-adversarial-review.md`. P28R = `phase-28-missionary-workspace-depth/relationships.md`. PR2430 = files at the head of unmerged PR #2430 (`1483a349`), path `docs/prds/sitestacker-parity/phase-29-files-documents/`.

## 0. Ratified baseline (cited, checked for conflicts)

- **Q1 clause 10** (DL:54): abort only before go-live, and committed rows stay invisible and are never deleted. After go-live, authority never returns to SiteStacker. Batch reversal follows `RM:4371` and `OC:378-385` unchanged. The Q1 skeptic explicitly refused "no batch Undo after go-live" because OC allows time-boxed undo while nothing downstream covers the fact (`q01-switch-model/q01-adversarial-review.md:466-468`). Q15 clause 5 amends clause 10 for abandoned Switches only: never-visible rows are disposed by the owners (DL:828).
- **Q12 clause 8** (DL:611-617): reversing a People import is a capability. It runs one import at a time, restores a field only if it still holds the imported value, reports later edits rather than reverting them, and archives only untouched people the import created. Posted money is never undone; it goes through Phase 15.
- **Q15 clause 11 / O73** (DL:840, :1153; amendment at DL:564): the undo is available for 30 days after commit, and the stored prior values are then deleted.
- **Q13 clause 12** (DL:715-717): before go-live, discard and re-run. After go-live, an append-only correction: void with a reason, then re-adopt under the same Source Record Binding. **Q14 clause 12** (DL:793-796): a whole-run error is withdrawn by an owner correction run, then re-imported. **Q16 clause 12** (DL:909-911): fields holding no values are retired in one step. **Q17**: Phase 30 never holds or activates routes (DL:927), and an owner can remove a continuity record (`q17-content-urls/q17-adversarial-review.md:328`).
- **C2** (DL:979), **C5** (DL:982: Phase 30 owns the "reversal-workbench mechanics"), **C20** (DL:997), **C23** (DL:1000), **D3** (DL:1010: the remaining open parts are the wording and which targets get a workbench), **D18** (DL:1025), **O51-O53, O55** (DL:1131-1135).
- **IMCTX:228-230** "Import reversal" is defined as undoing one People import. _Avoid_: "rollback, undo all, restore snapshot". The same files also say "undo": "Everyday import undo" (DL:840) and "undo values" (IMCTX:283).
- **Owner text.** `OC:378-385` allows "time-boxed batch undo with before-image capture only while no immutable downstream coverage exists", then the owner's successor path, and it blocks undo-after-merge. `RM:4371` asks the product to show what can be undone safely, what needs a compensating operation and what is irreversible. `RM:4395`: "Do not promise universal time-window undo". `RM:4403`: publish target-specific reversal procedures before tenant use. `RM:4409`: "safe reversal policies" is still an open decision.
- **No conflict in substance.** These ratified texts are consistent with each other. The r04 verifier reached the same conclusion: only the word is open (`research/r04-files-content-comms-workflow.md:337-339`).

## 1. What each owner says, by family

**Parties, households, relationships (P4, P9, ADR-0216)**

- Merge is non-destructive and replayable. "Replayable Undo is a governed operation, not an unconditional inverse" (`docs/adr/0216-…:38`). A purge forfeits Undo (`:43`).
- P4's merge UX is "execute-then-undo": a time-boxed **"Merged — Undo"** toast, a durable **Unmerge** for about 30 days, and "No 'type-to-confirm'/irreversible modal" (P4:304). The service methods are `previewMerge / executeMerge / unmerge / purgeShell` (P4:221).
- People are never deleted. `lifecycle_status` is `active|inactive|archived|deceased` (P9:420, :761). Relationships are "time-bound, never hard-deleted" (P9:355-357, :615).
- A batch reversal can only archive a person. Reversal must never delete a Party after a merge (RM:4371; OC:384-385). Issue #512 (open) says `unmerge` "reverses only the recorded, still-admissible mutable repairs … Refuse if the shell was purged."
- Household links: Q12 and O51 do not say how a household link is reversed (gap).

**Contact points, consent and suppression evidence**

- Imports only add contact details, and an old address is end-dated (DL:584-586). A dedicated contact-point store is still only a Phase 4 reservation (P9:396).
- Restrictions are append-only: "Nothing lifts a block except the person's own later action, or a staff correction of a wrong deceased mark with evidence" (DL:393). Imports cannot lift restrictions (DL:594), and consent never comes from an import (C10, DL:987).
- So a reversal cannot remove an imported restriction. Q12 clause 8 does not say so explicitly (gap).

**Tags and lists.** Imports only add them (DL:587; O51). Tags are flat labels on the party record (P9:762). Nothing says whether a reversal removes tags or list memberships that an import added (gap).

**Notes and interactions (P9, Q14)**

- Notes are soft-deleted through `deleted_at` (P9:636, :791). Imported entries are read-only, and corrections are added as notes (DL:751).
- P27 says corrections are "new attributed source changes … not history rewrites or blind undo of intervening work" (`phase-27-donor-development/assignments.md:248-249`).
- A batch-level fix is possible only as Q14's owner correction run (DL:796).

**Files (Phase 29, spec unmerged)**

- F30 row: "irreversible target effects need source successors, not generic Undo" (PR2430 `custody-and-integration.md:368`). The P30 row: "no raw load/merge/undo shortcut" (PR2430 `source-inventory.md:165`). Also "REQ29-E09 — Stop remaining work and repair without fictitious undo" (PR2430 `records-policies.md:164`).
- Purge is allowed "only after complete source-use and policy proof" (RM:4272).

**Applications and care records (Phases 41 and 38, roadmap only)**

- Phase 41 keeps "immutable accepted submissions" and requests "corrections as attributable successors" (RM:5356).
- Phase 38: "a provider outage or user departure never deletes sealed history" (RM:5136).
- Neither phase has a PRD in the repo with import-reversal rules (not found). Q14 clauses 9 and 12 govern for now.

**Custom fields, values and collections (P11, Q16)**

- Field lifecycle: ACTIVE → ARCHIVED (reversible, no timer) → PENDING_PURGE (30-day recycle bin) → TOMBSTONE (irreversible) (P11:199). P11:31 promises "reversible (archive, then a recycle bin)".
- Options are archived. They can be hard-deleted only when nothing references them (P11:189). An option merge is "previewed … reversal-logged" with an undo (P11:97, :189). There is one shared "reversal-logged migration engine" (P11:213).
- Imports write values through P11's bulk write API (P11:103). Switch field drafts are created all or none (DL:888, Q16 clause 3).

**One-time giving history (P13 D.6)**

- Posted rows are immutable. A BEFORE UPDATE/DELETE trigger raises (P13:148, :562). Corrections "append immutable reversing entries (never edit or delete the original)" (P13:355).
- Staff verbs are "Refund / Change amount / Move-or-re-split designation / Add-or-remove line / Void / Write off / Undo correction", and "An undo is a new negating entry" (P13:838). A void is `kind = void` (P13:847).
- "Recorded outside Asym" is never removed by a reversal (DL:141).
- P13 has no import-specific correction run (not found). O53 asks Phase 13 to add one.

**Recurring commitments (P16)**

- "There is no generic adjustment, Undo" (P16:1376), and a restoration is "Neither … generic Undo" (P16:1407). Journals are append-only (P16:1495).
- Imports classify each field as proved, hint or unknown, and executors are external and read-only (P16:2581, :1314). Scope changes supersede rather than rewrite (P16:1236).
- How to cancel or undo an imported commitment: not found.

**Designations (P13).** Funds and missionaries are "lifecycle-only … never hard-deleted", with `ON DELETE RESTRICT` on posted lines (P13:823, :1900). Attributed campaigns can only be archived (P13:1633, :1638). Retired designations created from mapping exist only in the grill (DL:663-666); P13 has no text on creating or removing them (not found).

**Phase 20 and 21 finance facts**

- Accounting Releases are immutable, and corrections are Compensating Accounting Releases (CTX:7063-7068, :7143-7148; P20:129-131). C-10: "Undo is blocked for any fact covered by an immutable Accounting Release" (P20A:866-867; also :1301-1303, :1623). P20 D16: "There is no generic **Undo import**" (P20DL:5264).
- In Phase 21, a Phase 30 "commit, completion, or undo status has no Field Account authority" (`phase-01-source-of-truth-ownership-matrix.md:590-593`; OC:403-404). After the authority fence there is no destructive rollback, only an Opening Position Correction (`docs/adr/0106-…:98-108`).
- None of these can be reversed by an import batch.

**CMS private drafts (P23, ADR-0173)**

- Clause 29: "Reversal is a checked plan, not undo theatre. **Prepare reversal** computes which still-private, unedited, unreleased, unreferenced results can move through D21's governed Trash or receive a private successor restoring a before-image". Blocked items name the owner correction, and the plan has its own capability, receipts and audit (`docs/adr/0173-…:282-290`). "Reversal preparation" is separately authorized (`:47-50`).
- UX contract: "The action is **Prepare reversal**, never **Undo import**." The plan groups results as Trash, restoring revision, edited, referenced, scheduled, released, or owner-correction (P23UX:759-774).
- Issue #1409 (open) is the only ticket for a reversal workbench in any target.

**Old-link continuity (ADR-0147, Phase 24)**

- Corrections go through a "newly proved successor generation", with no "destructive rollback". Retirement defaults to Page-not-found (`docs/adr/0147-…:51-54`, `:62`).
- A kept giving link stops only through **Stop this address**, which has "no resume, undo, release, transfer, reuse, or correction-to-current path" and "offers no Undo, Reactivate, Redirect, or Reuse action" (P24D12:208-213, :699). An imported stop attempt has zero effect (P24D12:1494-1500; C20).

**Practice copy (Q6).** It is not a reversal target. Copies write nothing back, so "Rollback is trivial" (`q06-rehearsal-mode/q06-adversarial-review.md:340`), and they are destroyed by purge.

**Missionary self-import (P28 D17, related).** "D17 does not require a new batch-undo engine." An unsafe reversal is refused and the user is pointed to the source correction path (P28R:458, :464). "Deleting a run/file never deletes contacts" (P28R:456).

## 2. Downstream coverage that blocks undo

- **The list** (OC:379-385): issued document, fulfillment application, Field Account entry, Accounting Release, provider operation, external transfer. Undo-after-merge is also blocked.
- **Issued document.** The receipt is immutable once issued (P7:107). Statement Runs are frozen once released (P19:340; CTX:4754). Phase 13 "never re-issues or retracts" a legacy receipt (P13:2231).
- **Fulfillment application:** CTX:4240-4243 (append-only). **Field Account entry:** no glossary entry; the nearest is Field Account Occurrence (CTX:5231-5235). **Accounting Release:** CTX:7063.
- **Provider operation:** no definition. It is used at P20:121 and P16:705. Processor refunds and disputes belong to Phase 13 (P13:845-850).
- **External transfer:** not defined anywhere, and it is an _Avoid_ term (CTX:6753).
- **Blockers named elsewhere but missing from OC's list:**
  - later staff edits (RM:4371; DL:615);
  - merges (RM:4371);
  - sharing (P28R:458);
  - CMS references, schedules, D1 candidates and releases (ADR-0173:285-287);
  - sent thank-yous and acknowledgments, which cannot be recalled (P15:1896). These do not arise for imports today, because import acknowledgments stay held and "Imports fire NOTHING" (P14:1485-1490, :1866).
- **D18 is still live.** IMCTX:85 now uses "Coverage start" for completeness of source history, while OC uses "coverage" for these blockers.

## 3. Current code

- **No import, undo or before-image machinery exists.** There are zero hits for `import_batch`, `import_run`, `before_image`, `import_session`, `migration_session` or `import_reversal` (or their camelCase forms) in `packages`, `apps` or `supabase/migrations`, and zero occurrences of "import" in any migration.
- **Twenty-shaped leftovers.** `source_system TEXT NOT NULL DEFAULT 'asym'` sits on a Twenty-shaped projection table with `crm_provider … CHECK (crm_provider = 'twenty')` (`supabase/migrations/20260508000413_crm_identity_mapping.sql:167`, `:172`). This is retired, not batch provenance (D9).
- **Prototype money correction on the `donations` table**, which Q13 says never to write:
  - `contribution_operation_batches`, with statuses running, complete, complete_with_issues, failed, cancelled (`20260526202500_contribution_operation_batches.sql:3-17`);
  - `contribution_adjustments` with status `applied|reversed` (`20260611100000_contribution_adjustments.sql:13-14`);
  - correction requests with status pending, approved, rejected, superseded (`20260611120000_…:41-42`);
  - bulk actions such as refund, amount correction and fund correction (`packages/api/src/admin/contribution-batches/preview.ts:39-88`).
  - P15 names this batch infrastructure for its "Batch-scoped reverse" (P15:1281).
- **Import labels.** There is an entry-method label "import" (`packages/api/src/admin/contributions/model.ts:83`, `:235-245`), and `DonationSource` includes `"import"` (`packages/database/types/database.ts:39-40`). These count as census evidence only (D7).
- **Merge.** Only `donor_merge_candidates` and `donor_merge_redirects` exist ("never deleted", `20260704140000_donor_matching_merge_candidates.sql:8`, `:78`). There is no `merge_operations` table and no unmerge code (#512 is open).
- **CRM bulk "Archive".** It is a destructive-styled action with a Trash icon (`apps/admin/app/(app)/crm/page-client.tsx:610-615`), but it is a stub that shows "Bulk archive is not available yet." (`:68-70`). The shared DataGrid has session-only grid undo (`packages/ui/components/shadcn/data-grid/data-grid.tsx`), which is not import reversal (`docs/features/missionary-workspace-depth/grill/d17-evidence/current-source-and-ux.md:303-305`).

## 4. GitHub (read-only)

- **#2084** (P28-R10, open, Ready): "No batch undo. Accepted entries are changed one at a time where they live … Results show 'To change an imported entry, open it in preparation'" (spec r1, comment 0). The body has AC28-R24-03 and "no mandatory batch undo engine". #2083, #2087 and #2347 only cover **Discard** and disposal. #2085: "No import-induced unarchive, erased-content revival".
- **#2369** (Phase 30 self-import profile) and **#2368** (P29 custody): nothing on reversal. #2368 restates AC29-D22-01: "source-specific correction; an imported CSV cannot … replay historical effects".
- **#1409** (P23-69, open, blocked by #1379 and #1408): "Reverse a committed import within its safe boundary". It reverses "only untouched artifacts", moves them to Trash, and skips and reports diverged items. It excludes "Database rollback, overwriting post-import work, cascade deletion … all-or-none claims". It gives no button wording. #1407 and #1408 require "truthful" reversal outcomes.
- **#711** (Phase 13): "Source corrections remain append-only and never rewrite issued receipt/statement/accounting facts." **#766** (Phase 15): the "undo half": "A whole posted batch reverses through compensating postings"; it concerns offline batches, not imports. #512: unmerge refuses after a purge. #610 and #2000: "intervening effects cannot be blindly undone".
- **Searches** for "import undo", "reversal workbench", "rollback import", "prepare reversal" and "reverse import" found no other Phase 30 issue. No Phase 30 implementation ticket for a reversal workbench exists (PR2430 F30 also says one is "not established").

## 5. Wording in use

- **"Import reversal" / "reversing an import":** IMCTX:228 and DL:612 (ratified). **"Reverse this import":** a Q12 UX sketch in the review, not ratified text (`q12-everyday-imports/q12-adversarial-review.md:69`). **"Everyday import undo" / "undo values":** DL:840 and IMCTX:283 (ratified).
- **"Prepare reversal" (never "Undo import"):** ADR-0173:282 (ratified for CMS) and P23UX:759. **"There is no generic Undo import":** P20DL:5264 (ratified D16). **"Do not show Undo import unless the owning source has a qualified compensating operation":** the P28 D17 evidence at `:303`.
- **Owner verbs.** Phase 4: "Merged — Undo" and "Unmerge" (P4:304). Phase 13: "Void", "Undo correction" (P13:838). Phase 15: "Corrected/void-receipt op", "Batch-scoped reverse" (P15:1280-1281), "Mod 3 undo" (P15:1383), draft "archive-to-audit" (P15:389), deposit "Void, don't delete" (P15:1539). Phase 11: "Archive", recycle bin, "retire an option" (P11:31, :85-86, :96). Phase 24: "Stop this address" (P24D12:208). Phase 28: optional "Undo" only for an exact archive (P28R:222), "Discard" (P28R:456). Grill: "voided … re-adopted" (DL:717), "withdrawn by an owner correction run" (DL:796), "retired in one step" (DL:911).
- **App copy today.** "Undo" appears only in the email and PDF editors (`apps/admin/app/(app)/email/email-studio-header.tsx:121`; `apps/admin/app/(app)/pdf/page-client.tsx:437`, `:450`). Also present: "Refund gift" (`contributions/contribution-detail-overlay.tsx:337`), "Archive" (`crm/page-client.tsx:611`), and "Roll back" / "Confirm rollback" for Eve model policy (`admin/eve/model-policy-panel.tsx:330`, `:358`). There is no "Reverse", "Revert", "Void", "Restore", "Unmerge" or "Correct" label in the apps.
- **Rules.** `docs/ai/rules/frontend.md` has no undo or destructive-confirmation rule (searched). The `better-writing` skill says "Undo beats confirmation": use undo for reversible, frequent actions, and confirm before irreversible actions, actions that affect other people, or actions that destroy many items. Titles name the action and the object, buttons are verb plus object, and nobody types to confirm except for an account, workspace or repository (`docs/ai/skills/better-writing/SKILL.md:116-125`; `patterns.md:9-11`). P24 D12 uses GOV.UK-style dedicated review for irreversible stops (P24D12:1278).

## 6. Retention interplay

- After 30 days the undo is refused and the prior values are gone (DL:840; AC12 at `q15-retention-scale/q15-adversarial-review.md:463`). Phase 9 owns the prior values (`…:210`). For everyday imports this is OC's "time-boxed" window. It is one target's window, not a universal one, so it does not breach RM:4395.
- **Legal hold** "stops every deletion path" (DL:838), so a hold would keep prior values past 30 days. Whether undo stays offered during a hold is not stated.
- **Erasure.** Q15 clause 8 covers held _files_ through tombstones and a 14-day rewrite (DL:832-833). Stored prior values are not files, and what an erasure does to them, or to a pending reversal for that person, is not stated. Q13 clause 13 keeps money facts on erasure (DL:720). Q14 clause 11 lets erasure reach every tier except under a hold (DL:788).
- **Switch.** No undo window is ratified. Staging is deleted 30 days after commit, and the final run's staging 30 days after go-live (DL:822). Corrections later re-read the final export while it is held (until the earlier of Switch closed + 90 days or go-live + 24 months), or use a ministry correction file (DL:808, :823). So a Switch "before-image" exists only as long as those artifacts do.

## Facts for the question

- Six owners already reject a generic "Undo import" and use successor or correction wording:
  - Phase 23 ("Prepare reversal", ADR-0173:282; P23UX:759);
  - Phase 20 (P20DL:5264);
  - Phase 16 (P16:1376);
  - Phase 28 (P28R:458);
  - Phase 29 (PR2430 `custody-and-integration.md:368`);
  - the grill's own glossary avoids "undo all" and "rollback" (IMCTX:230).
- Ratified Phase 30 text already uses both words: "Import reversal" (IMCTX:228) and "Everyday import undo" (DL:840).
- Only two owners give a real batch-level reversal of imported results:
  - People import, restore-if-unchanged plus archive (DL:611-617);
  - CMS private drafts, a checked plan with Trash or restoring revision (ADR-0173:282-290; #1409).
- Phase 15's "Batch-scoped reverse" covers posted gift-entry batches through compensating postings (P15:1281), so it would also cover a Gift file, which becomes a Phase 15 batch (DL:612).
- These families have correction runs or successors only, never a batch undo:
  - money history (DL:717; P13:355);
  - notes, files, applications and care (DL:796; RM:5356; PR2430 :368);
  - commitments (P16:1376);
  - finance facts (P20A:866; ADR-0106:98-108);
  - continuity and kept giving links (ADR-0147:51-54; P24D12:208-213);
  - restrictions (DL:393).
- Custom fields have their own owner-native reversible path (archive, recycle bin, restore) (P11:199). Q16 adds one-step retirement of empty fields (DL:911).
- Q1 keeps OC's time-boxed batch undo available for Switch runs after go-live while nothing downstream covers the facts (DL:54; q01 review :468). In practice, every Minimum Switch Kit money family is append-only (P13:148), so this only matters for non-money families.
- No reversal code, batch-provenance or before-image store exists today. The only batch and reverse machinery is the prototype `contribution_*` set on `donations` (§3).
- Phase 4 prefers execute-then-undo with no type-to-confirm (P4:304). The better-writing skill prefers undo for reversible actions and consequence-naming confirmation for many-item actions (SKILL.md:116-125).

## Conflicts and gaps

- **Wording drift in ratified text.** "Import reversal" (IMCTX:228, _Avoid_ "undo all") sits next to "Everyday import undo" and "undo values" (DL:840; IMCTX:283). The Q12 review sketch says "Reverse this import". Q18 should pick one word and edit DL:840 and IMCTX:283 to match.
- **OC:378-385 is the one owner text that still says "batch undo"**, while RM:4395, ADR-0173:282, P20DL:5264, PR2430 :368 and P28R:458 avoid it. The substance agrees; only the wording needs aligning at Phase 30 publication (D3).
- **OC's blocker list is incomplete.** It omits later staff edits, merges, sharing, CMS references and releases, and sent acknowledgments, which RM:4371, P28R:458 and ADR-0173:285 add. "Provider operation" and "external transfer" have no definition (CTX:6753 lists "external transfer" as an _Avoid_ term). D18's two meanings of "coverage" are still open.
- **Phase 20's C-10 is narrower than OC.** It blocks only on Accounting Release (P20A:866), and P20A:1301 proposes Phase 30 text to that effect.
- **People-import reversal is silent on several items:** contact points it added, tags and list memberships it added, household links, restriction columns (which must stay), and people who were later merged. O51 does not cover these.
- **Gift files.** Q12 sends posted money to "Phase 15's correction path" (DL:617). Phase 15's batch reverse exists for posted batches (P15:1281), but nothing states that undoing a Gift file is that Phase 15 batch reverse, under Phase 15's capability rather than O52's.
- **No owner command exists for the corrections Q13 and Q14 rely on.** No Phase 13 import-specific void and re-adopt run exists (not found in P13; O53 asks for one), and no Phase 9 or 29 "owner correction run" exists. Phase 30's workbench would have nothing to call yet.
- **No PRD for Phases 38 and 41** (roadmap only), so their reversal procedures for C23 cannot be written yet.
- **Retention.** It is not stated whether a legal hold extends the 30-day undo, or what erasure does to stored prior values (§6). No Switch-run reversal window is set, so C23's "target-specific reversal procedures" still needs per-family answers for Switch runs.
- **Retired designations and Created-by-Switch fields** have no P13 or P11 owner text on removing them after an aborted Switch, beyond P11's archive lifecycle (P13 not found; DL:911).
- **Phase 15 internal inconsistency** (agent-found, not re-verified): "mark the gift `reversed`" (P15:1099) contradicts "`reversed` is a derived read flag, never a stored status flip" (P13:2028).
