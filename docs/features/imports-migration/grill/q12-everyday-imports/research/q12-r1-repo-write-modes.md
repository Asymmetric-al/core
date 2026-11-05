# Q12 research r1: everyday imports and write modes (repository evidence)

**Read-only research, 2026-11-03.** Baseline `develop` at `629cb71dc`. Only this file was written. No tracker, database or app changes were made. GitHub was read with `gh issue/pr list|view` only.
**Labels** (`docs/ai/document-authority.md:42-58`): **ratified** (accepted product decision) · **published** (exact issue, PR or roadmap packet) · **implemented** (code exists) · **proposed** (option or research only) · **inference** (this author's reading, not owner text). "DL" = `docs/features/imports-migration/grill/decision-log.md`. "OC" = `docs/prds/program-roadmap/owner-constraints.md`. "RM" = `docs/prds/sitestacker-parity/roadmap.md`. "Pnn" = the phase PRD under `docs/prds/sitestacker-parity/`.

---

## 1. Owner text on Phase 30 scope beyond the Switch

**Text that frames Phase 30 as migration:**

- RM:4326 calls Phase 30 "the embedded migration product for bringing an organization's **legacy** data into Asym" (published).
- Q1–Q11 are all scoped to a Switch (DL §1). The exceptions are Q11 clause 5, which closes build-versus-adopt "for Phase 30 staff imports" (DL:533), and Q11 clause 2's remembered mappings. Both read as covering any staff import (ratified).

**Text that frames Phase 30 as a general importer (published unless marked):**

- OC:356-365: an "Import wizard to the 2026 embedded-importer bar (Flatfile/OneSchema/Dromo)" with a dry-run of "exactly what would be created/updated/skipped/merged".
- OC:373-374: "re-import updates instead of duplicating". Q1 clause 5 narrows this for Switches only (D20).
- RM:4349: the plan shows records "to create, update, skip or queue for merge".
- RM:4409 leaves open "whether a target supports update, append, merge or reference-only import".
- RM:4387: "Begin with a complete low-risk source-to-Party import and exact repeat import".

**Owners that send routine file imports to Phase 30:**

- P09:986: "Full import tool → Phase 30" (ratified PRD).
- P11 story 47 (:103) and #660: an Import Template Descriptor plus a "bulk validated write API" running the same write path as interactive entry (ratified; #660 OPEN, unbuilt).
- P15:144, :216, :2536, :2558: "spreadsheet import with column-mapping or bulk donor-resolution — that is Phase 30". It "shares Phase 30's never-auto-send posture" (ratified).
- P15:704: the grid keyboard contract also governs "the future Phase 30 … paste surface".
- P15:926: the noncash invariant applies across "grid entry, CSV paste, API, and import".
- P14 G.13 (:989): the matching-gift socket is designed so "Phase 31, a CSV importer, or a staff bulk tool can produce into it".
- P14:331, :338, :802: `external_ref` columns exist "for Phase 30 … idempotent re-runs", and Phase 30 import is one of four flows allowed to set `line_id`.
- `phase-21-field-accounts-decision-log.md:5213-5214` refers to "Phase 30's future general import product".
- RM:697-702: the Designation producer contract covers "offline batch, recurring, import, migration … sources owned by Phases 5/15/16/22/30/31".
- `parity-matrix.md:783-791`, row 22: "staff import CRM records/content from a file with mapping and validation" (published).
- RM:5266: Phase 40 data stewardship depends on Phase 30 import provenance.

**Text that keeps routine intake with other owners:**

- OC:424-430 (C18): "recurring intake of one operational source artifact under a fixed, certified source contract … is owned by that source domain, not by this general migration workbench".
- Phase 21 D14 card files: #1193 says Phase 30 is "not a dependency".
- Phase 20 bank-statement import: #1075, #1086.
- P14 H.2 (:1042-1050): church-remittance CSV paste.
- P11 E3 (:191): "Deliberate backfill" of field values is a "previewed, batched, audited Phase-8 data-health action", using the P11 migration engine (#654).
- P19:114, :640: NCOALink-to-CRM is a separately groomed future capability. "Provider address changes may inform evidence but never overwrite the CRM."

**Verdict (inference).**

- Owner text expects Phase 30 to become the general file-import product: owners outside Phase 30 defer formal multi-row import to it.
- No owner text says which everyday imports belong in v1. Today the only ratified everyday profile is Phase 28 D17, the missionary self-import.
- Everyday import is therefore neither in nor out of v1. It is a founder scope call, constrained by C18 for recurring operational feeds.

## 2. Write-mode rules per target

| Target                                          | What owner text says                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Label                              | Modes the text permits                                                            |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------- |
| Party core fields (name, email, phone, address) | No general staff-import update rule exists (r02 §8, `r02:274`). D17: "neither bulk-updates existing contact fields" (P28 `relationships.md:367`); "Changed bound assertions preserve current fields, show only authorized discrepancies and direct to ordinary correction" (`:402`, AC28-R21-03 `:408`). Switch: differences become "source-changed conflicts for reviewed correction, never applied source-wins" (Q1 cl.5, DL:41). OC:373 "re-import updates" is older and conflicts with these (D20). | ratified (D17, Q1); published (OC) | create; reuse (reference-only); reviewed correction. Blind update is unsupported. |
| Party `display_name`                            | Written only "by the OWNING subtype service … never edited directly on parties" (P09:610-613).                                                                                                                                                                                                                                                                                                                                                                                                          | ratified                           | only through the subtype command                                                  |
| Email                                           | Each email belongs to one person (Q10 cl.4, DL:461-475). The installed key also counts merged donors (D32).                                                                                                                                                                                                                                                                                                                                                                                             | ratified; implemented key          | An email update can collide with another person.                                  |
| Personal contact (P25)                          | "The source field contract declares meaningful input and clearability"; "stale/ABA updates cannot overwrite current data"; a clear must not "reappear from an old fallback" (P25 `contracts/identity.md:93`, `:97`).                                                                                                                                                                                                                                                                                    | ratified planning contract         | Clear only where the field contract allows it.                                    |
| Address                                         | Provider address changes "never overwrite the CRM" (P19:640). #1582: move or remove an address "without silently retargeting mail".                                                                                                                                                                                                                                                                                                                                                                     | ratified / published               | Evidence or reviewed change only.                                                 |
| Custom fields (P11)                             | "NULL vs NOT-SET vs EMPTY is load-bearing … REST PATCH (absent key = leave unchanged)". Defaults apply on create only and are never back-filled. Required applies only to fields taking part in the write. Provenance `source=import` (E3 :191). Unknown options are rejected (E2 :189). Restricted-for-import fields are absent from the template (#660). Option merge uses the migration engine (H1 :213, #654).                                                                                      | ratified (unbuilt) = C15           | update allowed through the P11 write path; clear semantics undefined for CSV      |
| Tags                                            | Flat tags on the party spine (P09 story 24 :246; #606/#2278 OPEN). No import rule exists.                                                                                                                                                                                                                                                                                                                                                                                                               | ratified (no import rule)          | append vs replace is unknown                                                      |
| Relationships                                   | Add, end or re-role edges; "never hard-deletes" (P09 B2 :614-615).                                                                                                                                                                                                                                                                                                                                                                                                                                      | ratified                           | append or end (inference)                                                         |
| Households                                      | Created only from explicit source evidence; no households of one (Q10 cl.1-2).                                                                                                                                                                                                                                                                                                                                                                                                                          | ratified (Switch)                  | create only                                                                       |
| Restrictions / suppression                      | Restrict-only and append-only. "Only the person's own later action lifts it" (glossary `CONTEXT.md:151-153`; Q1 cl.6; Q9; O41; P28 REQ28-R22).                                                                                                                                                                                                                                                                                                                                                          | ratified                           | append only                                                                       |
| Consent                                         | An import never grants consent (C10; AC28-R22-01 `relationships.md:425`). Adoption exists only for a Switch's moved lists (Q9).                                                                                                                                                                                                                                                                                                                                                                         | ratified                           | none outside a Switch                                                             |
| Restricted-tier people                          | Setting restricted "without a distinct `display_name` — via service or import — is rejected" (P10:97, :174). Dedupe is clearance-gated (:204).                                                                                                                                                                                                                                                                                                                                                          | ratified                           | create or update with an alias only                                               |
| Merge                                           | Never by import. Staff-deliberate only (ADR-0216:14-16, :50-51; P04:222; `openspec/contracts/crm-core.md:125-127`).                                                                                                                                                                                                                                                                                                                                                                                     | ratified                           | none                                                                              |
| Money facts                                     | Append-only. Refunds append. Posted rows are immutable (C6; ADR-0216:24-28).                                                                                                                                                                                                                                                                                                                                                                                                                            | ratified                           | append only                                                                       |
| Notes and activities                            | No rule (F16 open).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | —                                  | —                                                                                 |

**What a blank cell means.**

- No owner text defines it for a file import.
- The nearest rules:
  - P11 E3 above: an absent key means leave unchanged.
  - P25 identity:93: clearability is declared per field.
  - Q11 cl.3 (DL:524): "A left-out value leaves that cell blank" when a record is created.
  - Q10 (DL:474): recognised placeholder addresses "become blank and are listed".
  - D17 AC28-R20-03 (`relationships.md:389`): no "guessed fill-down".
- Non-binding research (proposed):
  - `phase-21-mission-dashboard-product-research-evidence.md:5372-5375` says "blank overwrites … must be rejected rather than copied".
  - `r08:232` notes that DonorPerfect blanks never clear and give no way to express a deliberate clear (listed as "do not copy").
- Prototype code (implemented, not authority): `packages/api/src/missionary-portal/donor.ts:68-71`, `:73-99`, `:184` does a whole-form replace. `optionalText` turns a blank into `null` (a clear), and the country is hard-coded "USA".

**Conflicts with newer staff edits.**

- Owner text:
  - RM:4349: "Reprove … affected target state at commit; a changed target is a conflict, not permission to overwrite newer work."
  - RM:4371: reversal must not "erase later staff edits".
  - RM:4401: acceptance proves "concurrent target edits".
  - `openspec/contracts/platform-boundaries.md:395-398`: every imported fact keeps its source label and ID, and "disagreement MUST remain visible and route to bounded review" (published contract).
  - P23 D29 cl.22 (content): "explicit create/update/conflict dispositions, never blind upsert".
- The display itself is unspecified. `r10-gap-g4.md:120-135` (proposed) shows that telling "only the source changed" apart from "both changed" needs a stored per-field **base** (the last accepted import value). No owner text requires that base.

## 3. Money imports

- **Sole writer.**
  - "Every staff-entered offline gift MUST be staged, validated … and committed through Phase 15 `gift_entry_batches`" (`openspec/contracts/contribution-operations.md:418-433`, published).
  - "Nothing writes offline money except the batch commit path" (P15:72). A guard test enforces it: "no API path other than the batch commit service writes offline money" (P15:836).
  - P16 congruence A14 says the same (ratified).
- **Inference.** An "import this month's checks" feature would have to produce a Phase 15 batch (draft → validate → approve → commit), with Phase 30 supplying only the file, mapping and donor resolution. No owner text defines that handoff. r03 D-3 (`r03:280`) records the same gap for historical offline money.
- **Thank-yous.** "Import-origin purposes remain held and never pass this batch gate. Imports never auto-send" (P15:1884). Current-year gifts from a file would therefore get no batch-released acknowledgment unless an owner activation is added.
- **Receipts and who issues them.**
  - Q4 cl.1 (DL:123-124, ratified): Asym issues for gifts "first recorded in Asym", which includes Phase 15 entry. A Phase 30 import "(pre-boundary history, any source profile)" is Recorded outside Asym.
  - The glossary drops that qualifier: "every gift that reaches Asym through a Phase 30 import" (`CONTEXT.md:185-187`).
  - O22 ties the fact to the D.6 and O13 commands, so it is narrower than the glossary.
  - P07 E3 (:339) lets "manual/imported/historical gifts" be receipted under prospective issuance.
  - The Phase 15 receipt rail is #765 (OPEN).
- **Historic versus current.** P13 D.6 (:1023-1039) covers pre-Asym gifts only: payment already succeeded, and review is bypassed unless the donor match or allocation is ambiguous (:984-990). No owner text describes a current-gift import outside Phase 15.
- **Entry method.** P02:523-533 separates `offline` (batch entry) from `import` ("data import/onboarding") and `legacy`. A current check arriving by file has no clear value (inference).
- **Benevity, employer match and DAF.**
  - A match is two gifts. The legal donor is the payer of record, possibly an intermediary (P14:918). "Benevity disbursements MIX both" match and payroll lines (:923).
  - The ingest socket (G.13 :987-992; #739 OPEN) produces events that are "never money". It quarantines ambiguity and never auto-creates.
  - DAFpay/Chariot is a reserved rail (P14:584, :2031).
  - Every staff-entered gift, including these, posts through Phase 15.
- **Church remittance.** CSV paste → staged preview (matched / create-new / ambiguous) → one confirm. Members are "CREATED, not held" (a founder visibility ruling) and enter dupe review immediately (P14:1048-1050; #775 OPEN). This is the closest ratified pattern for an everyday file import of people.
- **Lockbox.** There are zero hits in `docs/prds` and on GitHub.
- **Recurring feeds** (a monthly Benevity or lockbox file) fall under C18 (OC:424-430): they belong to the source domain (inference by analogy; the text names Phase 21 card activity).
- **O13** (DL:632) is the only owner request for externally collected post-boundary money, and it is scoped to a Switch tail.

**Verdict (inference).** No owner path makes Phase 30 the writer of current gifts. Owner text points at Phase 15 as the writer. Putting money files in Phase 30 v1 needs agreement from the Phase 15/7/14 owners and a scoped Recorded-outside-Asym definition.

## 4. Permissions and audit for bulk changes

- **No import or bulk capability exists.**
  - The registry defines only `admin.dashboard.access`, `admin.crm.manage`, `admin.gifts.manage`, `admin.reports.view` and `permissions.*` (`packages/auth/capabilities/registry.ts:87-111`).
  - "All staff subroles have full Mission Control admin access in MVP" (`packages/auth/permissions.ts:37-38`) (implemented).
  - Phase 12 names no Phase 30 capability (r02 §5).
- **Authority does not widen.** C16: an import role never widens target authority. P12 repeats "import" among paths that never grant authority (P12:227-323, for example :306) and says a "Phase 30 import role never widens it" (:2249, :2327).
- **Switch-scoped rules.** Q5 cl.1: each decision needs its capability, and money commits also need the money owner's. Q5 cl.3: helpers get only "Data Tools preparation capabilities". Q5 cl.4 and Q11 cl.4: restricted floor and previews by visibility. O27: scoped, expiring grants.
- **Restricted export.** Bulk restricted export is "blocked outright" (P12:1641).
- **Audit.**
  - Every CRM write is the row, a `crm_audit_events` row and an activity emission, in one transaction (P09:151, :585-587).
  - P11 F2 (:197): one append-only audit stream with before/after values.
  - P11 :191: provenance `source=import`.
  - OC:378: "every import batch tagged on created/updated records".
  - RM:4363: per-record lineage.
  - P25 identity:97: minimized audit of field, revision, actor, purpose and result.
- **Undo.**
  - OC:378-385: "time-boxed batch undo with before-image capture only while no immutable downstream coverage exists".
  - RM:4371: reversal must not delete a real Party after merge, erase later staff edits or rewind money.
  - RM:4395: no universal time-window undo.
  - ADR-0216: Undo is governed, not a blind inverse.
  - Wording and which targets get reversal remain open (D3, F14).
- **Bulk-action pattern (published).**
  - `docs/prds/mission-control-contribution-operations/05-bulk-actions-batch-results.md:16-40`: preview plus confirmation; batches of 50 or fewer low-risk records may run immediately; more than 50 run in the background; "the batch wrapper grants no additional permission".
  - DL §8 rules contribution bulk batches out as import machinery.

## 5. Existing bulk tools and import code (implemented)

- **No import code.**
  - There is no CSV or XLSX parser dependency.
  - Only CSV writers exist: `packages/lib/csv.ts` (`csvSafeCell`), `packages/api/src/admin/crm/reports/export.ts`, `apps/admin/features/support-hub/lib/report-export.ts` and `packages/ui/components/shadcn/data-table/utils/export.ts`.
  - There is no Data Tools route, navigation entry or capability (DL §8, g6).
- **CRM grid.** It has bulk export, plus a bulk-archive stub that shows "Bulk archive is not available yet." (`apps/admin/app/(app)/crm/page-client.tsx:68-72`, `:401-402`).
- **No staff Party edit command in the admin API.** Tags are read-only (`packages/api/src/admin/crm/model.ts:18`, `:62`; `crm/detail/service.ts:28`, `:489`). Donor field writers exist only in the missionary and donor portals (`missionary-portal/donor.ts:159`, `:184`; `donor-portal/index.ts:149`).
- **Contribution bulk actions** run over existing gifts only (`packages/api/src/admin/contribution-batches/*`).
- **Support Hub bulk actions** loop in the browser (`apps/admin/features/support-hub/components/table/bulk-actions.tsx`). The Phase 24 D36 research rejected this as a precedent (`phase-24-d36-…-primary-research.md:76`).
- **"Import" appears only as a legacy gift-source label** (`packages/api/src/admin/contributions/model.ts:25`, `:83`, `:235-245`; `apps/admin/app/(app)/contributions/data.ts:191`). This is census evidence only (D7).
- **Planned overlaps (published, OPEN):**
  - P9 list engine and saved views (#611); tags (#606, #2278).
  - P11 migration engine for option merge and backfill (#654).
  - P15 resolver-backed donor search shared by the picker, the CSV-paste matcher and new-donor dedupe (P15:2366; #769).
  - P14 remittance sub-grid (#775).
  - Phase 26 bulk changes (#1667) cover support work only.

## 6. Matching for everyday imports

- **Switch rules (ratified).**
  - Q10 cl.7 (DL:486-489): source IDs come first. An email match also needs the first name to agree. A shared mailbox always goes to review. In-file duplicates are listed. Duplicates go to the Phase 4 queue after commit, with no auto-merge.
  - O47 asks Phase 4 to apply the same rule to import and guest matching. It is a Switch gate.
- **ID-less rows.** Q3 cl.4(b) (DL:96) blocks rows without a source ID in Switch templates, "because they cannot converge on re-import" (ratified).
- **ID-less files elsewhere.**
  - D17 accepts them: "Reordered/changed files without stable qualified IDs require authorized review; no perfect deduplication claim" (`relationships.md:400`, AC28-R21-02 `:407`).
  - Identical bytes in the same scope are recognised. "File hash, row number or tool name alone is never person identity" (`:406`).
- **Other owner rules.**
  - P04 A5 (:153): ambiguity goes to staff review. P04:222: exact email = high, fuzzy = low → candidates, never auto-merge.
  - P13 story 171 (:539-542): money is never linked "by email, name, phone, or payment fingerprint".
  - P14 H.2: name-only remittance members are created and go to dupe review.
  - C14: a source ID is a link, not an identity.
- **Gap.** For a one-off event list there is no source ID. No owner text says what the binding key is: the file row, the event, or nothing. Re-importing an updated attendee list would duplicate people or need match review (inference).

## 7. Missionary self-import (D17)

- **Scope (ratified and published; RM:4328-4333, :4353-4361; OC:333-355; P28 REQ28-R19…R26).**
  - Who and where: the missionary's own same-tenant restricted preparation. The missionary reviews and commits, with no second reviewer.
  - Fields: name/display, email, phone and mailing address only.
  - Never: merge, bulk-update, share, verify, enroll, send or grant consent.
  - Limits: ≤10 MiB and ≤10,000 rows (`relationships.md:473`).
  - Mapping is rule-based (Q11 cl.5).
- **No widening.** "Ordinary staff import, high-band auto-merge and stable-ID bulk-update rules cannot widen this profile" (P28 `owner-reconciliation.md:42-50`; C4).
- **Timing risk (DL §6, D12).** #2347 (Ready) and #2087 would land P28-named plan storage and a new package before Phase 30 sets per-profile limits. A staff everyday profile built on that machinery would inherit D17 limits.

## 8. Open issues and PRs (gh, 2026-11-03)

- **Open PRs:** none with import, bulk, CSV or Data Tools in the title.
- **Phase 30 tickets:** #2369 (OPEN) is the only one, and it covers D17 only ("doesn't merge, bulk-update…").
- **Phase 28 and 29, D17 track:** #2083, #2084, #2085 ("changed files show safe discrepancies rather than … overwrite"), #2086, #2087, #2347, #2349, #2351; Phase 29 custody #2368.
- **Field catalog and CRM:** #660 (template descriptor and bulk write API), #654 (migration engine), #606/#2278 (tags), #611, #621, #659.
- **Money:** #758 (P15 epic), #764, #765, #769, #772, #775; P14 #739, #727, #734; #711 (routes "broader historical import" to Phase 36, D2); P20 #1075, #1086; P21 #1193.
- **Other:** #2281 (operator access, DL §6), #2000 (imported assignment provenance), #1626.
- **Nothing found for:** "lockbox"; any everyday staff import, field bulk update, blank-cell meaning or Data Tools ticket.

## 9. Founder choices and the owner texts that bear on each

1. **v1 scope beyond the Switch.**
   - Options: (a) Switch and D17 only; (b) plus create-only staff imports of new people (event, volunteer or newsletter lists) with match review; (c) plus reviewed field updates to existing people; (d) plus money files.
   - Bearing: RM:4326 vs OC:356-365; P09:986; P15:144; P11 story 47; RM:4387; C18; parity row 22.
2. **What an import may do to existing records, per target.**
   - Options: reference-only with discrepancies sent to ordinary correction (the D17 posture); fill blanks only; reviewed per-field update; append for tags, notes, relationships and restrictions; overwrite.
   - Bearing: RM:4349, :4409; OC:373; D17 R21; Q1 cl.5; P11 E3; P09:610-615; P19:640. No text supports blind overwrite, and merge is never allowed.
3. **What a blank cell means**, and how a deliberate clear is expressed (an explicit clear marker, a separate action, or per-field clearability).
   - Bearing: P11 E3; P25 identity:93; Q11 cl.3; prototype `donor.ts:68-71` (blank = clear).
4. **How conflicts are shown.** Either any difference from the current value is a conflict (two-way), or Asym keeps a per-field base for a three-way check (only the file changed → propose; only Asym changed → keep; both changed → review). Also: what staff see (current value, file value, last editor and time).
   - Bearing: RM:4349, :4371, :4401; `platform-boundaries.md:395-398`; `r10-gap-g4.md:120-135`.
5. **Identity for files without IDs.** Either require a row ID (Q3 posture) or allow one-shot imports with email + first-name match and review (D17, O47 and P14 H.2 posture).
6. **Money files** (checks, DAF, Benevity) in Phase 30 v1, handing off to a Phase 15 batch, or left to the Phase 14/15 paste and socket paths.
   - Bearing: P15:72, :144, :836, :1884; `contribution-operations.md:418-433`; Q4 cl.1; P02:523-533.
7. **Outward effects for everyday new people.** Imported contacts get no consent (C10). Batch-origin suppression applies (OC:386-388). Should welcomes or automations stay dark?
8. **Who may run everyday imports and bulk updates**, any second-person threshold, and the undo window.
   - Bearing: `permissions.ts:37-38`; C16; Q5; OC:378-385; P15/P12 maker-checker patterns.

---

## What is settled

- **Writes go through owner commands.** No raw table loads (OC:439-441). Phase 30 owns transport, staging, mapping, plans and run evidence; owners own acceptance (RM:4377; C1).
- **No automatic merge, ever.** Merge is a staff Phase 4 action (C2; RM:4351).
- **Consent and restrictions.** An import never grants consent outside a Switch's Q9 adoption (C10). Restrictions are restrict-only and append-only (Q9; glossary :151-153).
- **Custom fields.** An absent key leaves the value unchanged. Defaults apply on create only. Unknown options are rejected (C15).
- **Newer work wins.** A changed target is a conflict, never permission to overwrite newer work (RM:4349). Disagreement stays visible (`platform-boundaries.md:395-398`).
- **Imports fire nothing.** Batch-origin suppression applies (OC:386-388). Imported acknowledgments stay held (P15:1884; P14 fixture 35).
- **Offline money.** The only writer of staff-entered offline money is the Phase 15 batch commit (published contract). Recurring operational feeds belong to their source domain (C18).
- **Mapping.** It is rule-based, with no AI and no outside importer, for all Phase 30 staff imports. Remembered mappings are kept per tenant and source (Q11 cl.2, cl.5).
- **D17.** The profile is fixed and cannot be widened by staff rules (C4).
- **Historical gifts** are Recorded outside Asym and never receipted by Asym (Q4; C7).

## What is open for the founder

In suggested order. Each item is a product choice, not something owner text decides.

1. **v1 scope** of everyday imports (§9.1).
2. **Per-target write mode** for existing records (§9.2).
3. **Blank-cell meaning** and how to clear a value (§9.3).
4. **Conflict display**, two-way or three-way (§9.4).
5. **ID-less file identity** (§9.5).
6. **Money files** in or out of Phase 30 v1 (§9.6). This needs Phase 15/7/14 owner agreement either way.
7. **Outward effects** for imported new people (§9.7).
8. **Capability, approval threshold and undo window** (§9.8). This overlaps F7 and F14.
9. **Related open items:** F10 (creating custom-field definitions during import) and F16 (notes and activities) bear on §9.2.

## Gaps and hazards (ranked)

1. **Recorded outside Asym is worded too broadly.** The glossary (`CONTEXT.md:185-187`) says "every gift … through a Phase 30 import", while Q4 cl.1 limits it to pre-boundary history. If Phase 30 imports current checks, a literal reading bars their Asym tax receipts. Scope the term before money files are offered.
2. **No path exists for current gifts.** A Phase 30 money adapter breaks the P15 sole-writer guard (:836) unless it hands off to a batch. Import-origin acknowledgments stay held for good (:1884). The entry method (`offline` or `import`) is undefined for file-borne current gifts. r03 D-3 is still open.
3. **Event lists cannot be emailed.** Imported signups grant no permission (C10; AC28-R22-01), and Q9 adoption works only inside a Switch. A founder expecting "import the event list and send the newsletter" hits this. The owners are P12 (#680) and P3, together with P25 R07 C10.
4. **Blank-cell meaning is undefined.** The P11 three-state model (NULL, NOT-SET, EMPTY) cannot be expressed in a CSV without a convention. The only live donor writer treats a blank as a clear (`donor.ts:68-71`). Copying it would wipe data on import.
5. **The source-ID rule does not fit everyday files.** Applying Q3 cl.4(b) blocks most event files. Dropping it loses convergence, so re-imports duplicate people. Everyday profiles need their own identity rule.
6. **Three-way conflicts need a per-field base.** No owner text requires one (`r10-gap-g4.md:133`). Without it, every difference looks like a conflict and review becomes noise. With it, Phase 30 must store the last accepted value for each bound field.
7. **Staff imports can be bounded by D17 limits.** #2347 and #2087 would land P28-named machinery with D17-only limits (D12; DL §6). A staff profile reusing it inherits those limits, and any staff update rule must not leak into D17 (`owner-reconciliation.md:47-48`).
8. **No capability gates bulk work.** Any staff member could run a bulk update today (`permissions.ts:37-38`). O27 and Phase 12 have to land first.
9. **Email updates can collide.** One email per person, and merged donors still count against the key (D32, Q10, O48). A bulk email update can hit uniqueness errors or attach the wrong person.
10. **Two owners for "set a field on many records."** P11/P8 own data-health backfill (P11 E3 :191; #654), and Phase 30 owns file imports.
11. **Vendor address updates.** P19:640 forbids provider address overwrites, so NCOA-style address files need their own source class and review, not a generic update.
12. **Bindings are not yet trusted provenance.** Any staff member can write `crm_record_links` until #2295 lands (D9, O7).
