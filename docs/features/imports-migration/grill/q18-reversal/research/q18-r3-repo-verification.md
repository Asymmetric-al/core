# Q18 r3: Repo verification for the reversal review

**Scope:** read-only check on `develop` at `629cb71dc` of the facts the Q18 adversarial review relies on: repo files, current code and migrations, and GitHub issues read with `gh`. Nothing was changed apart from this file. Twenty is retired and is treated only as history. Each claim is marked **verified**, **refuted** or **not found**.

**Citation keys.** These are the same as r1 (DL, IMCTX, CTX, OC, RM, Pnn, P20A, P20DL, P23UX, P28R). New keys:

- ADR173 = `docs/adr/0173-governed-content-portability-and-private-draft-imports.md`
- ADR216 = `docs/adr/0216-non-destructive-source-governed-replayable-donor-merge.md`
- WSC = `openspec/contracts/web-studio-cms.md`
- WS03 = `docs/prds/workflow-studio/03-runtime-and-recovery.md`
- Q1R, Q12R, Q15R = the `q01`, `q12` and `q15` adversarial reviews
- IMADR12, IMADR15 = `docs/features/imports-migration/docs/adr/0012-…`, `0015-…`
- REG = `packages/auth/capabilities/registry.ts`
- MIG = `supabase/migrations/`

## 1. Q12 import kinds, O51/O52, "touched", and Q5 capabilities

- **Two everyday kinds only: verified.**
  - The two kinds are the People import and the Gift file, which "becomes a draft Phase 15 gift batch" (DL:571-577).
  - Church remittances stay on Phase 14's screen and are not an import kind (DL:578).
  - The Switch and the missionary self-import are "Unchanged", meaning separate profiles (DL:579).
  - Everyday imports pause between a Switch Boundary and go-live (DL:580).
- **O51 (DL:1131): verified.** Phase 9 with Phases 4 and 11 must provide: per-field write modes; contact points added, never replaced, with old addresses end-dated; tags and lists add-only; and reversal that "restores a field only if it still holds the imported value, and untouched import-created people are archived". **O52 (DL:1132): verified.** These are capabilities for running, Replace, clear and reversing. Gift files use Phase 15's batch capability. **O73 (DL:1153)** gives the 30-day window, with Phase 9 as owner.
- **Reversal is defined only for People imports: verified** (DL:613-616; IMCTX:228-229; IMADR12:57-60). For Gift files, "Posted money is never undone by reversing an import; it uses Phase 15's correction path" (DL:617). The capability is Phase 15's batch permission (DL:612). What happens to a Gift file that has not been posted yet: **not found** in Q12. Phase 15's own rule for drafts is "warn → archive-to-audit, never silent delete" (P15:389).
- **"Touched" / "untouched": not found as a defined term.** The words appear only in the phrases "nothing has touched them since" (DL:616; IMCTX:229) and "untouched" (DL:1131; Q12R:178 AC12; IMADR12:59). No text lists what counts as touching (an edit, gift, note, task, relationship, merge, consent event, portal claim, later import or share).
- **Q5: verified.**
  - "Every decision is made by a ministry member who holds that decision's capability. Money commits also need the money owner's capability (C16). This covers … commit, reversal …" (DL:194).
  - "No forced second person" (DL:195).
  - "Never Asym: no Asym identity can make or hold any decision" (DL:196). Asym help access can never commit or decide (DL:216), and its running jobs pause when access ends (DL:217).
  - C16 (DL:993): an import role never widens an owner's authority, and "deferred jobs re-prove the owner's current authority when they fire".
- **Second-person rule: none in Phase 30.** However, money owners can impose one:
  - Phase 13 puts "void … reversal-of-a-high-risk op" in the HIGH tier. That tier requires a reason, the capability and, "when SoD is enabled", routing to a correction request with "server-enforced requester ≠ approver" (P13:856).
  - Phase 15 Mod 3 keeps "an existing explicit stronger tenant policy" (P15:1230).
  - IMADR12:81 lists second-person review for large Replaces only as a learning signal.
- **Code: no import, reversal or legal-hold capability exists.** REG holds only contribution, admin, CRM-view and permission atoms (REG:21-123). The money correction atoms are `contributions.request_corrections` (:27), `apply_corrections` (:39) and `approve_corrections` (:57).
- **New risk:** the option's "Can be reversed now: Asym does it" uses "Asym" to mean the product. Q5 uses "Asym" for Asym-company identities, which may never decide (DL:196). The copy should say what the ministry member confirms.

## 2. Phase 15 "Batch-scoped reverse"

- **Text: verified (P15:1281).** "Compensating postings and exact per-source correction evaluation across a whole posted batch, driven by the existing `contribution_operation_batches` infrastructure (chunked claim, stale-running recovery, follow-up task). Only eligible owner-authorized corrected/void document transitions and notices proceed; a batch operation cannot manufacture receipt eligibility or coverage."
  - **Compensating entries:** yes.
  - **Scope:** a whole posted batch. A partial batch reverse is **not found**. The single-gift path is the corrected/void-receipt op (P15:1280) and the Mod 3 amend.
- **Preconditions: none stated.**
  - Receipts already issued do not block the reverse. It proceeds and asks Phase 7/18 for void or corrected documents and Phase 17/6 for notices (P15:1281), so donors see it. Receipts are stopped only inside the recall window, which lasts "a few minutes" and can be lowered to 0 by the tenant (P15:1200-1204).
  - Acknowledgments already sent: "no unsend/void machine" (P15:1894).
  - A deposit set released into Phase 20 coverage is immutable. Later changes need a new coverage decision and "a cause-linked compensating Accounting Release" (P15:358-362).
  - Accounting Release: "Undo is blocked for any fact covered by an immutable Accounting Release" (P20A:866-867). There is "no generic **Undo import**" (P20DL:5264).
- **Capability: verified.** Mod 3 uses capability-authorized correction with reason and audit and no routine second approver. A stronger tenant policy is kept (P15:1230; P13:856). Pending approval means the reverse may wait in a queue rather than finish when the Q18 button is pressed.
- **Gift file becomes a Phase 15 batch: verified** (DL:577, :604). Three refinements:
  - One file can become **more than one** batch, because the capability-gated "escape valve" commits the clean rows and carries the rest into "a linked follow-on draft batch" (P15:80).
  - Import-source rows route to finance review rather than auto-posting (P13:2030).
  - Q12 makes Gift-file rows "ordinary current gifts, not the held import kind", with receipts and thank-yous (DL:604). So Phase 14's "Imports fire NOTHING" (P14:1866) **does not** cover Gift files.
- **Build state.** The reverse rides the Phase 13 posting ledger, which is "groomed-not-built" (P15 build-order gate, Mod 3). Today only the prototype `contribution_operation_batches` exists, with status `running|complete|complete_with_issues|failed|cancelled` (MIG `20260526202500_contribution_operation_batches.sql:14-15`).
- **The P15:1099 versus P13:2028 inconsistency: verified, but minor.**
  - P15:1098-1099 describes a "Thin gift-status projection `pending_ach → completed → reversed`" and says "mark the gift `reversed`".
  - P13:2028 and P13:791 say "`reversed` is a derived read flag only, never a stored status flip".
  - The word "projection" partly reconciles the two, but "mark" reads as a write. The passage concerns ACH returns, not imports. It does show that "reversed" is already a money-state word.

## 3. Archive, unarchive and "merged since" (Phases 4 and 9, ADR216)

- **Owner command.** Phase 9's B1 Party spine service lists "lifecycle-status transitions" (P9:610-613). The values are `active|inactive|archived|deceased`, and `merged` is read from the tombstone (P9:761; CTX:2566-2569).
- **What archive means: not found.** Nothing in P4, P9, ADR216 or CTX says whether an archived person:
  - is hidden from lists or search;
  - stops receiving sends;
  - affects recurring gifts;
  - affects missionary visibility.
- **How to unarchive or restore: not found.** CTX's archive meaning belongs to Phase 28 preparations only (CTX:2234-2243).
- **Current code: no person archive state.**
  - `donors.status TEXT DEFAULT 'active'` has no check constraint (MIG `20250101000000_init_schema.sql:76`).
  - The CRM bulk "Archive" is a stub: "Bulk archive is not available yet." (`apps/admin/app/(app)/crm/page-client.tsx:69`).
- **#2085 "No import-induced unarchive": verified, Phase 28 only.** It applies to reimports in the missionary profile (issue body; P28R:409 AC28-R21-04). Phase 30 has no rule on whether a later People import matches or unarchives an archived person: **not found**. Matching uses the remembered source ID first (DL:597).
  - **New risk:** a corrected re-import after reversal will match the archived people by source ID. It will then either update hidden records or create duplicates.
- **Is archive the right outcome? Archive is what Q12 ratified (DL:616).**
  - No owner text gives a better path, and none forbids a purge of a never-used created person.
  - Phase 4 allows "an opt-in, completeness-gated hard-delete" of an empty merge shell (P4:185). ADR216 allows a "warned shell purge … only after a complete source census proves the shell unneeded" (ADR216:41-44).
  - RM:4371 and OC:384-385 forbid deleting a real Party **after a merge**.
- **Merged since: detectable today in schema only.**
  - `donor_merge_redirects` holds (merged_donor_id PK, surviving_donor_id, merged_at), is service-role only, and is "never deleted" (MIG `20260704140000_donor_matching_merge_candidates.sql:8`, `:78-86`, `:120-123`).
  - `donor_merge_audit` holds decided_at, with actor_type `staff|agent` (`:129-143`).
  - No code reads either table (grep of `packages` and `apps`: zero hits).
  - The future path is Phase 4's `merge_operations` with the `merged_into_donor_id` tombstone (P4:221, :254), plus `merged_into_party_id` (P9:762).
  - A created person counts as merged since if it appears as either the merged or the surviving side after the commit time.

## 4. Contact points, tags, lists and household links

- **Contact points: there is no owner store.**
  - `contact_points` is only a Phase 4 reservation (P4:357), and Phase 9 rejects "contact normalization … now" (P9:396).
  - B17 covers a single Name and an optional Phone, with an "expected source revision", where "stale/ABA writes conflict" (P9:592-593, :661-672).
  - End-dating of an old address is ratified only in Phase 30 (DL:586). An owner field for it is **not found**.
- **Tags: flat strings, verified.** `parties.tags` holds "flat labels" (P9:762; P9:246). Today `donors.tags TEXT[]` (MIG `20250101000000_init_schema.sql:83`).
  - **New risk:** a flat string array has no record of who added a tag. "Remove only if untouched" needs per-tag provenance or a before-image. Otherwise a tag the import added cannot be told apart from the same tag added later by staff.
- **Lists: there is no Asym list-membership entity.** Phase 9 reserves "lists/segments" as "a DISTINCT future entity (views = lenses, lists = membership containers)" and rejects static lists (P9:527-529). No PRD defines list membership (grep).
- **Lists do have consent meaning (Q9).**
  - "Unsubscribed from a named list" is a block on that list (DL:388), and "Nothing lifts a block except the person's own later action" (DL:393).
  - Moved lists exist only for missionary newsletters and update emails (DL:400).
  - For US recipients, list membership with its source is permission evidence (DL:412).
  - Imports grant nothing (DL:601-602).
  - **New risk:** if reversal removes a list membership through an unsubscribe path, it records a permanent person-only block. Removal must be a provenance correction, never an opt-out.
- **Automations on list or tag removal: not found** (workflow-studio grep).
- **Household and relationship links.** These are "time-bound, never hard-deleted" (P9:355-357), and the B2 service can "Add/end/re-role edges … never hard-deletes" (P9:614-615). Household membership is a derived view over the grandfathered `household_members` table (P9:400, :768, :829). An "entered in error" end reason is **not found**, so ending an imported link would leave a false relationship in history. Q10 records Switch memberships as starting before the boundary with the date unknown (DL:467).

## 5. Phase 11 custom field values

- **The bulk write API: verified.** It runs through "the **same** write-path (no second weaker path)" (P11:103, :181).
- **Value history: not usable for a restore.**
  - The audit is one append-only `crm_audit_events` stream with `before`/`after` JSONB. However, "change-detection stores nothing value-derived — a monotonic version counter proves 'it changed'", and for erasure "immutable rows hold no subject value" (P11:197). That table is not built (grep of MIG).
  - So prior values must be held separately, which is the Phase 9 store under O73 (DL:1153; Q15R:210).
  - The version counter can support a restore-if-unchanged check.
- **Field-change automations: verified.** P11 reserves a "field changed" event for Phase 34 (P11:106, :181). O78 says "Field-value-change triggers never fire on import-origin writes" (DL:1158). A reversal write is not import-origin unless it is declared so (not found).
- **New risk:** restoring an empty prior value is in effect a Clear. Q12 makes Clear "a separate, confirmed action with a count" (DL:583). The final button and its count should cover it.

## 6. Automation and effects

- **Verified text covers imports only:**
  - "batch-origin event suppression (an import must not fan out ten thousand automation emails)" (OC:386-388);
  - "No welcome or automation fires because of an import" (DL:603);
  - "Imports never publish, create users, send or fire automations" (C5, DL:982);
  - "For imported or historical events, `historical=true` is explicit and outward effects stay dark" (WS03:25);
  - "Imports fire NOTHING" (P14:1866).
- **Reversal runs:** no text covers a reversal's own writes, such as an archive, restored values, or tag or list removal: **not found**. ADR173 clause 29 says only "Nothing public is deleted, rolled back, or unpublished implicitly" (ADR173:289-290).
- **Gift-file reversal is the exception.** By design it emits donor-visible void or corrected receipts and notices (P15:1281).

## 7. ADR173 clause 29, the P23 UX benchmark and #1409

- **Clause 29: verified** (ADR173:282-290). "**Prepare reversal** computes which still-private, unedited, unreleased, unreferenced results can move through D21's governed Trash or receive a private successor restoring a before-image … Reversal has separate capability, immutable plan, idempotency, receipts, audit, and truthful partial handling."
  - "Reversal preparation" is a separately authorizable action (ADR173:49).
  - There is no "needless two-person approval ritual" (ADR173:52-54).
- **Group labels in P23UX: verified, seven groups, not three.**
  - The action is "**Prepare reversal**, never **Undo import**" (P23UX:759).
  - The intro reads "We will show exactly which private changes can be reversed and which items need review. Nothing changes until you approve the reversal plan." (P23UX:763-764).
  - The groups are (P23UX:768-774):
    - "can move to governed Trash";
    - "can receive a private restoring revision";
    - "edited since import";
    - "now referenced";
    - "scheduled or included in a candidate";
    - "released/public and therefore never auto-reversed";
    - "requires owner-domain correction".
- **Button wording: not fixed.** "Final action names exact reversible counts" (P23UX:776). The only exact pattern is the import commit's "**Create {count} private drafts**" or "**Create 170 Pages and add 16 private revisions**" (ADR173:203-205).
- **Staleness.**
  - Import plans go stale on "a source, mapping, permission, target, catalog, or relevant destination change" and then need "**Check import again**" (ADR173:198-199). Commit re-proves capability and versions (ADR173:200-202).
  - #1409 requires failing closed "on stale scope, stale revision, incomplete evidence, authorization loss … or concurrency loss", and has proof-02 "Concurrent change fencing" and proof-03 "Repeated reversal".
- **Expiry.** P23 import plans are "one immutable expiring plan" (WSC:367). Expiry of a **reversal** plan: **not found**.
- **"Receipts".** In ADR173 these are operation receipts, not tax receipts. This collides with the option's "receipt issued" reason.
- **#1409: verified** (open). "Reverse only untouched artifacts from one import"; "Skip and report diverged artifacts with owner-specific next actions"; "Make reversal idempotent and auditable".

## 8. Phase 28 D17 self-import

- **What D17 promises users: verified.**
  - "Deleting a run/file never deletes contacts" (P28R:456).
  - "Any source-qualified undo refuses unsafe reversal … D17 does not require a new batch-undo engine" (P28R:458; `openspec/contracts/missionary-workspace-depth.md:4206`; openspec spec AC28-R24-03).
- **#2084's approved spec r1 (comment 0) goes further.**
  - "**No batch undo.** Accepted entries are changed one at a time where they live: edit (R01-b) or archive (R05, #2081). Results show 'To change an imported entry, open it in preparation'."
  - "**A9 [A][R] No undo (AC28-R24-03).** No run-undo route exists (static)."
- **#2369** (the Phase 30 self-import profile) says nothing about reversal (body read).
- **Conflict: yes, if "every committed import" includes the self-import profile.** Q12 keeps the self-import separate (DL:579), but C4 says it "reuses Phase 30 machinery" (DL:981). A shared Prepare-reversal route would break #2084's static A9 test and its user copy. The option must exclude the self-import profile by name.

## 9. Q15 retention, legal hold and erasure

- **Undo window: verified.** Undo is available for 30 days, after which "the stored prior values are then deleted" (DL:840). Undo values are a Retention class (IMCTX:283). Phase 9 owns them (Q15R:210).
- **Legal hold: verified.** It "stops every deletion path" (DL:838) for "named artifacts" (IMCTX:287). Whether reversal stays **offered** past 30 days while a hold keeps the prior values: **not found**.
- **Erasure: verified, but for held files only** (DL:831-833). For prior values, or a pending reversal for an erased person: **not found**.
  - **New risk:** restoring a prior value onto an erased person revives erased content, which #2085 forbids in Phase 28.
- **Run evidence** holds "no donor or supporter row content" (DL:830). A downloadable results list that names people needs a Retention class or must be on-demand only, like Waiting rows (DL:824; IMCTX:283, "An artifact without a class cannot be stored").
- **Heavy jobs** run "One at a time, by a lock on the Switch" (DL:856). Everyday imports have no Switch to lock on (gap).

## 10. Q1, Q13, Q14, Q15 and Q16 Switch clauses

- **Q1 clause 10 (DL:54): verified.** "Abort only before go-live … committed rows stay invisible and are never deleted … Batch reversal follows `roadmap.md:4371` and `owner-constraints.md:378-385` unchanged. Every switch and every run can be halted." Records carry Switch, manifest, run and Source Record Binding identity (DL:55).
- **Q1 review: verified.**
  - The proposed text "After go-live, a switch run offers no batch Undo" (Q1R:466) was **narrowed** by the skeptic: "owner-constraints.md:378-385 explicitly allows time-boxed batch undo … Undoing an import batch does not create a dual writer" (Q1R:468). A9 also adds "no Party is deleted" (Q1R:39).
  - **No Switch reversal window is ratified.** The option's "a Switch's people, within 30 days" is new, and it doesn't say whether the 30 days run from commit or from go-live. Final-run staging is deleted 30 days after go-live (DL:822).
- **Q15 clause 5 (DL:828).** A Switch aborted before go-live and later purged has "its never-visible committed rows disposed by the owners" (abandoned Switches only).
- **Q13 clause 12 (DL:715-718).** Before go-live: "discard and re-run". After go-live: "voided with a reason and re-adopted … under the same Source Record Binding, with a count and total confirmation and its own capability". Never deletion.
- **Q14 clause 12 (DL:796).** "Whole-run errors: withdrawn by an owner correction run, audited, then re-imported."
- **Q16 clause 12 (DL:909-911).** A list of every field and option the Switch created, and "fields with no values … can be retired in one step" (also IMCTX:308-309).
- **Retired designations created from mapping** (DL:665): what happens to them on abort or reversal is **not found**. The Created-by-Switch list covers fields and options only. Phase 13 designations are "lifecycle-only … never hard-deleted" (P13:1900), so they would remain.

## 11. Existing repo patterns

- **Background jobs (Inngest).** The functions are in `packages/api/src/workflows/functions/`: `donation-saga-recovery.ts` (retries and concurrency at :26-27, :78-79), `dispatch-recovery-scan.ts`, `stripe-event-processing.ts`, `inbound-email-processing.ts` and `workflow-smoke.ts`. The client is at `packages/api/src/workflows/inngest/client.ts`, served by `apps/admin/app/api/inngest/route.ts`. Supporting pieces: the work claims table `MIG 20260611181000_workflow_work_claims.sql` and `packages/api/src/workflows/claims.ts`, `ledger.ts` and `recovery.ts`.
- **Chunked batches with progress.** `packages/api/src/admin/contribution-batches/process-batch.ts` provides chunked claims (:410-459), stale-running recovery (:51, :287) and follow-up tasks (:105). It is triggered by `apps/admin/app/api/admin/contribution-batches/[batchId]/process/route.ts`. Inngest does not run it.
- **Idempotency.**
  - `UNIQUE (tenant_id, idempotency_key)` (MIG `20260223170000_atomic_rpc_and_donation_saga.sql:905`, `:921`) and `packages/api/src/donate/idempotency.ts`.
  - `crm_command_logs` has a partial unique key (MIG `20260507234343_crm_command_logs.sql:23-25`). It was re-described as Asym-owned (MIG `20260818010000_retire_twenty_crm_runtime.sql:36`), but P9 keeps it "reserved for future async provider commands only" (P9:590).
- **Compare-and-set.**
  - ADR-0147's "one expected-head CAS" (`docs/adr/0147-…:43`).
  - The pending-status CAS in `packages/api/src/admin/contribution-operations/correction-requests.ts:445` and `store.ts:377`.
  - `expectedVersion` in `packages/api/src/eve/admin-memory/control.ts:153-194`.
  - Planned but unbuilt: the P9 B17 expected source revision (P9:592) and the P11 version counter (P11:197).
- **Audit tables in migrations:**
  - `audit_logs` (`20250101000000_init_schema.sql:325`, RLS enabled at `20260226113000_authz_memberships_foundation.sql:315`);
  - `contribution_operation_audit_events` (`20260526132000_…`);
  - `donor_merge_audit`;
  - `staged_gift_audit_events` (`20260512190000_…:168`);
  - `support_audit_log`, `pdf_template_audit_events`, `crm_table_preference_audit_events` and `eve_audit_events`.
  - P11's `crm_audit_events` is planned and not built.
- **Capabilities.** REG is the code-authoritative registry (ADR-0210; key pattern :17), together with `packages/auth/capabilities/effective-capabilities.ts` and `bundles.ts`, plus `packages/auth/permissions.ts` (staff subroles :43). Nothing covers imports or reversal.

## 12. "Reversal" already means a payment reversal

Phase 30's own text uses "reversal" for money in these places:

- The Minimum Switch Kit is "one-time giving history including reversals" (DL:45; IMCTX:36).
- Backfills carry "refunds, returns, chargebacks" (DL:50).
- Q8 has a "reversal-only window" and a "reversal window (card 120 days …)", and processor reports are the "Source of reversals" (DL:31, :360, :362).
- Coverage start says "Reversals whose original falls before it are left out" (DL:638).
- Q13 clause 4 is titled "Refunds and reversals", and "A reversal with no original … becomes a Waiting row" (DL:657-660), shown as "Refund without an original" (IMCTX:239).
- O21, O53 and O55 use "reversals" for money (DL:1101, :1133, :1135).

Root CONTEXT uses it the same way:

- Phase 13 Posting: "chargeback, or NSF is a NEW posting"; _Avoid_ "a `status='reversed'` flag" (CTX:2938-2941).
- Phase 16 ACH: "a later return appends a reversal" (CTX:4182).
- Phase 21 card adjustment evidence (CTX:5808).
- Phase 20 Compensating Accounting Release, which "corrects, reverses" (CTX:7143-7145).
- Phase 13 PRD: "compensating reversal" for ACH, NSF and chargebacks (P13:368, :391, :791, :1012).
- Phase 15: "reversed" status and "Batch-scoped reverse" (P15:1098, :1281).

Words meaning to undo an import appear only at IMCTX:228, DL:54, DL:612-617, DL:840 and in O73.

**Collision: yes.** A Switch run that imported refunds would put "reversals" on a page called "Prepare reversal". The phrase "Import reversal" stays unambiguous only if the noun is always qualified.

## 13. OpenSpec

- **Import undo, reversal or rollback:**
  - The only matches are the D17 scenario AC28-R24-03 (`openspec/changes/add-missionary-workspace-depth/specs/missionary-workspace-depth/spec.md:1142-1145`; contract :4206) and the CMS import contract (WSC:362-374: "seal one immutable expiring plan … Partial, interrupted, stale, resumed, reconciled and reversal outcomes SHALL be truthful").
  - The CMS spec scenario "Import is interrupted or the plan becomes stale" says to "distinguish applied, pending, failed and reversed slices idempotently" (`openspec/changes/add-web-studio-cms/specs/web-studio-cms/spec.md:827-834`).
  - "Prepare reversal" appears in no OpenSpec file (grep). It exists only in ADR173 and in the P23 PRD and decision log.
- **platform-principles.** The priority ladder puts tenant safety first and money and operational truth second (`openspec/specs/platform-principles/spec.md:13-35`). "Operational Truth And Money Integrity" covers refunds, receipts and donor linkage (:37-50). "Honest States" forbids softening the real state (:77-95).
- **platform-boundaries.**
  - Sensitive mutations stay server-side (`openspec/specs/platform-boundaries/spec.md:111-125`).
  - An AI assistant stops at a human approval gate for money effects and mutations (:163-185).
  - Honest money state (:207-228).
  - The contract says every imported fact "MUST retain its source label and exact source identifier" and must not "rewrite another authority's history or permit blind replay" (`openspec/contracts/platform-boundaries.md:395-399`).
- **No OpenSpec requirement for Phase 30 exists** (no change folder).

## Corrections to r1

1. **The `crm_projection_state` leftover is gone.** r1 §3 cites it, and its `crm_provider = 'twenty'` check, as present. The table was dropped (MIG `20260818010000_retire_twenty_crm_runtime.sql:19`).
2. **"People are never deleted" (r1 §1, P9:420/:761) is overstated.** Phase 9 says relationships are never hard-deleted. Phase 4 and ADR216 allow a completeness-gated purge of an empty merge shell (P4:185; ADR216:41-44).
3. **"A batch reversal can only archive a person"** is cited to RM:4371 and OC:384-385. Those lines forbid deleting a Party **after a merge**. Archive-only comes from Q12 (DL:616).
4. **"Gift file, which becomes a Phase 15 batch (DL:612)".** The correct citations are DL:577 and :604, and a file may become several batches through the escape valve (P15:80).
5. **r1 §2 says acknowledgments "do not arise for imports today".** For Gift files they do: the rows are ordinary current gifts with receipts and thank-yous (DL:604). P14's "fire nothing" does not apply to them.
6. **Line fixes.** Designation "lifecycle-only" is at P13:1900, not :823. "No unsend/void machine" is at P15:1894, not :1896.
7. **The P15/P13 "reversed" conflict is now verified** with the nuance given in §2.

## Facts the review must use

- **Two everyday kinds** (DL:571-577). Reversal is defined only for People imports (DL:613-616). Gift files belong to Phase 15 (DL:617). "Touched" is undefined: the review must define it (DL:616).
- **Phase 15's reverse is whole-batch only, with compensating postings and no precondition gates.** It sends void or corrected receipts and notices and has no unsend for acknowledgments (P15:1281, :1894). It may need a second approver under tenant policy (P13:856; P15:1230). It depends on the unbuilt Phase 13 ledger.
- **One Gift file can map to several Phase 15 batches** (P15:80). Its rows send receipts like any gift (DL:604).
- **No owner defines what "archived" does to a person, or how to restore one** (P9:761; CTX:2566). There is no code for it. Phase 30 has no rule against matching or unarchiving archived people on re-import (DL:597, versus #2085 for P28 only).
- **"Merged since" is detectable from `donor_merge_redirects` and `donor_merge_audit`** (MIG `20260704140000…:78-143`). Nothing reads them yet.
- **Contact points:** no owner store and no end date (P4:357; P9:396). **Tags:** flat strings with no per-tag provenance (P9:762). **Lists:** no entity exists (P9:527-529), and Q9 gives list membership consent weight (DL:388, :393, :412). **Links:** end-dated only, with no "entered in error" reason (P9:355-357).
- **Value history.** P11 keeps no value history usable for a restore (P11:197). Field-change triggers are suppressed only for import-origin writes (DL:1158). Effect suppression for reversal runs is **not found** anywhere (OC:386-388; WS03:25; P14:1866).
- **P23 uses seven groups and no fixed button text** (P23UX:759-776). Plans go stale on change (ADR173:198-199) and import plans expire (WSC:367). Reversal-plan expiry is not found.
- **#2084's approved spec has "No batch undo" and a static "No run-undo route exists" test.** The Q18 option must name the self-import profile as excluded (#2084 comment 0; DL:579).
- **No Switch reversal window is ratified.** The 30 days in the option is new and needs a stated start event (DL:54, :822, :840).
- **Hold and erasure effects on prior values are unstated** (DL:838; DL:831-833). An undo-values Retention class exists (IMCTX:283). A results download naming people needs a class or must be on-demand (DL:824).
- **Retired designations created by mapping have no abort or reversal rule** (DL:665; P13:1900).
- **"Reversal" already means a money reversal** at DL:31, :45, :360-362, :638, :657-660, IMCTX:36 and :239, CTX:2941 and :4182, and P13:368. The undo sense also says "undo" at DL:840, IMCTX:283 and IMADR15:9, :41 and :58. All of these need renaming if Q18 picks "reverse".
- **There is no reversal, import, legal-hold or before-image capability or table in code** (REG:21-123; MIG grep). Reusable patterns exist for chunked claims, idempotency keys, compare-and-set and audit tables (§11).
