# Q14-R1 — Notes, activities, files, applications and care in a Switch: owner text and code facts

Read-only research for F16 on develop `629cb71dc` (unchanged on 2026-11-03).

- Phase 29 PR #2430 is still OPEN and unmerged at head `1483a349`. `openspec/contracts/files-documents.md` is not on develop. Cites marked `PR2430:` come from that head.
- This extends r04 §1 and §4, r02 §3.5, r07 and q01-r1 (B12–B14, E7, F1–F6, G3).
- SQL facts come from migration files only. Hosted databases may differ (D13).

## 1. Notes and interaction history

**Owner text**

- Phase 9 owns notes, activities and the timeline. "Legacy `donor_activities` and the `donors.notes` scalar **die**" (`phase-09-full-crm-depth-relationship-graph.md:573-579`).
- The Phase 9 target tables (`:788-803`) are not built (T11 open, `:1157`).
  - `crm_notes`: keyed to a Party, nullable author, `author_name_snapshot`, standard/restricted visibility, soft-delete.
  - Attachments are deferred: "Deferred: attachments → P29 (no schema reservation)".
  - `crm_activity_events`: `actor_kind`, `occurred_at`.
- Phase 27 sets the rules for authors and dates (`phase-27-donor-development/context.md:95-99,147`):
  - "Departed authors remain historically attributed where lawful."
  - "date-only facts SHALL NOT be fabricated into midnight instants."
  - "current owners do not replace departed authors."
  - Recency uses "qualified historical coverage, not created-at".
- Tasks:
  - "Only the exact source command receipt closes a source action" (`workflow-studio/12-owner-bindings-and-decisions.md:15`).
  - "Historical-dark" (`workflow-studio/CONTEXT.md:34`).
  - Imported history creates no task (Q13 clause 8, `decision-log.md:673`).
  - No owner text admits imported open tasks.
- Phase 28 D17 excludes "notes, care/history" (`owner-constraints.md:344-345`).
- **The Phase 30 adapter list names no notes, activities or communications.** It covers only "parties, relationships, historic gifts, commitments, custom fields/entities, files, and content" (`owner-constraints.md:389-392`; `roadmap.md:4367`).

**Code facts**

- The integrated `crm_notes` table (`20260818000000_crm_notes.sql:5-61`) differs from the Phase 9 target:
  - It has `title NOT NULL`, a free-text link field and no Party key.
  - `author_name` defaults to `'Mission Control'`.
  - It has only `created_at`, so a note's original date cannot be kept.
  - It is append-only and has a unique idempotency key.
  - Restricted notes are readable when `profiles.role IN ('admin','super_admin')`, but the profile's tenant is never matched (`profiles.user_id UNIQUE`, `init_schema.sql:29`). That is a **possible cross-tenant read (inferred, untested)**.
- The notes list loads every tenant note into memory, then slices (`admin/crm/notes/service.ts:89-103,137-148`).
- `donor_activities` (`init_schema.sql:222-235`):
  - It has no tenant, no author and no date precision.
  - Staff **and the donor** can read it under RLS (`20260625002117:211-232`).
  - Missionaries write notes, calls, meetings and emails into it with no author (`missionary-portal/donor.ts:61-66,120-147`).
  - Missionaries read every activity on their donors under one shared 2,000-row limit (`donors.ts:452,533-541`).

**Implication: Phase 9 decides.** Requests:

- (a) An append-only import command that:
  - records the source author as text;
  - keeps the original date with its precision;
  - carries a Source Record Binding and an "Imported from {system}" label;
  - is read-only, with corrections by annotation.
- (b) Imported tasks arrive closed and historical only.

## 2. Classification gate

**Owner text**

- Phase 3 already classes `donors.notes` and `donations.notes` as `care`: Mission Control only, not exportable (`20261005050728_field_policy_foundation.sql:110-114,490-494`).
- Phase 10 itself admits the platform has "no way to say which people, fields, notes, or files are sensitive" (`phase-10-sensitive-data-safety.md:26`). No note-level rule was found.
- Phase 27: "Unclassified content SHALL NOT default to shared" (`context.md:31`).
- Phase 38: "No clinical content in ordinary CRM fields … or AI prompts" (`roadmap.md:5150`).
- Q11 rules out AI (`decision-log.md:541`).
- Phase 29 forbids an "AI classifier, content scanner" for records policy (`PR2430:…/records-policies.md:96`).
- Q13/O57: memos pass Phase 10 safety rules and stay staff-only (`decision-log.md:655`).

**Code fact.** Member-care activities show in the general CRM relationships list unless they match a case-sensitive keyword pattern, `/care|private|counsel|pastoral|…/` without the `i` flag (`admin/crm/relationships/model.ts:23-29,126-147,484-492`). So "Pastoral visit" or "Counseling" titles show there, with their descriptions (**inferred**).

**Gap.** No owner defines care content beyond Phase 38's families (`roadmap.md:5112,5122`), and none says how free text is classified at import.

**Implication.**

- People classify notes and activities by source type in the plan. Anything unclassified gets the strictest class.
- Keyword matches only flag rows for review.
- Request: Phases 10 and 38 publish a minimal import classification rule.

## 3. Member care (Phase 38)

**Owner text**

- Status: "roadmap scope adopted; phase grooming/qualification required" (`program-roadmap/phases.json:272-276`). No PRD or OpenSpec exists.
- "care notes are **never** ordinary CRM notes"; care is "sealed by default"; the owner holds DSAR and per-tier retention duties (`owner-constraints.md:1255-1290`).
- Phase 29 F38: "missing material owner policy blocks that lane" (`PR2430:…/custody-and-integration.md:372`).

**Code facts** (`20260414180338_member_care_foundation.sql`)

- **Any staff member** can read `member_care_activities`, which include pastoral notes, crisis interventions and prayer requests (`:177-185`).
- Private notes are readable by their author and super_admin (`:335-343`). The app shows super_admin all of them (`reads/member-care.ts:489-491`).
- `author_user_id` is `NOT NULL` and must point to a live user (`:71,130`).
- The API gate admits any staff role (`admin/member-care/route-helpers.ts:28`).
- Reads stop at 500 rows (`reads/member-care.ts:398,487`).

**Implication.**

- Care records are a Visible exclusion. They never go into these tables or into general notes.
- Even keeping them in staging or a retained manifest needs a Phase 38/29 ruling.

## 4. Files, attachments and photos

r04 §1.3 covers scanning, size limits and retention.

**Owner text**

- Phase 9 deferred attachments with no schema (`phase-09:793`).
- The Phase 29 consumer register (E01–E23, F30–F44) has **no row for general CRM record files**.
- Phase 29: "never fabricate historic assignment, actor, date or approval from an upload timestamp" (`PR2430:…/records-policies.md:98`).
- Photos:
  - A restricted worker's real photo belongs in a "non-public storage bucket" (`phase-10:137`).
  - Consent to publish a photo is a separate record (`:140`), and location metadata is scrubbed (`:82`).
  - Media placement "never proves ownership or person consent" (ADR-0126 `:133-134`).
  - Profile imagery needs one compatible cutover (E21, `PR2430:c&i:330`).
- No rule on photos of children was found outside C13.

**Code facts**

- The `profiles` and `document-uploads` buckets are public-read, and any signed-in user can upload to them (`init_schema.sql:461-485`).
- The only private bucket is Eve's.
- Avatars go to `profiles` with a 5 MiB limit (`upload/image.ts:12,24`).
- There is no CRM file table.

**Implication.**

- CRM files and email attachments are excluded until Phase 29 adds a consumer for them and Phase 9 adds a target (extends O19).
- Photos are never placed in a public bucket and carry "consent unknown".

## 5. Applications (Phase 41)

**Owner text**

- Status: "specification adopted; binding/qualification gates open" (`phases.json:292-297`).
- No import clause exists (`roadmap.md:5330-5425`).
- Prior learning needs "source-approved equivalence and review, not a copied completed task" (`:5368`).
- "evidence reuse requires current source equivalence" (`:5372`).
- Phase 29 F41: "no Party-wide automatic evidence reuse" (`PR2430:c&i:375`).

**Code fact.** Mobilize is a static seed (`packages/database/collections/admin-workspace.ts:874-882`). There are no application tables.

**SiteStacker.** Forms export one person at a time (q01-r1 V39). Changing a reference overwrites the person (V40).

**Implication.**

- In v1 applications get a census and a Visible exclusion.
- Applicants mid-process need a ministry choice: finish before the boundary, restart later, or keep Motion 2 as a declared residual system (Q1 clause 1(e), `decision-log.md:39`).

## 6. Communications history

**Owner text**

- Phase 6 backfills only Asym's own send logs, through "proved permanent internal provider-message … mappings". "Recipient email never serves as durable person-resolution" (`phase-06-shared-communication-event-model.md:177`).
- Engagement signals are "ephemeral … short/prunable" (`:175`).
- The contract says imports "MUST NOT replay historical communication rows … or infer engagement from email telemetry" (`outbound-communications.md:1406-1407`).
- Q9 uses the list's last-send date (`decision-log.md:402`) and says "never by opens" (`:428`).

**SiteStacker.** No sent-history export exists (q01-r1 E7). Inbound email is stored as activities (V44).

**Implication.**

- Exclude per-message history and opens/clicks.
- Keep list-level send dates and the statement send log as evidence only.
- Inbound-email activities follow §1.

## 7. Free-text custom fields

- Phase 11 treats import as "a classified write surface". Care and security data leaving Asym is "hard-blocked" (`phase-11-custom-fields-custom-collections.md:159,161`).
- SiteStacker text-area entities often hold notes, health or security data (r07 §2.1; q01-r1 B7).
- F10 is still open.
- **Implication.** The ministry classifies each field when it is created. Imported free text defaults to `care`, matching Phase 3's treatment of `donors.notes`.

## 8. Missionary-facing

**Owner text**

- The Phase 14 H.5 NEVER list includes "notes … staff notes" (`phase-14-donor-credit-operations.md:1105`).
- "party general notes/private activity never appear in missionary-workspace projections"; the exception "cannot relabel, import, migrate or summarize protected notes" (`phase-09:920-926`).
- Phase 28 keeps earlier private notes unshared (`relationships.md:104`).

**Code conflicts**

- The missionary portal reads and edits `donors.notes` (`missionary-portal/donor.ts:47,91`; `donors.ts:427`), but field policy says missionaries may not see it (`field_policy_foundation.sql:492`).
- Missionaries see all activities on their donors.
- Donors can read their own notes and activities through the Data API (`20260625002117:165-182,211-232`).

**SiteStacker.** Notes on the missionary dashboard are **undocumented**. TntConnect and MPDX notes are excluded (Q3 clause 7).

**Implication.**

- No imported note reaches a missionary or donor.
- Imports never write to `donors.notes` or `donor_activities`.

## 9. Retention and erasure

- F11 is open.
- Phase 3 DSAR/erasure is a "seam reserved, not built" (`phase-03-…:321`).
- Phase 6 erasure must "scrub any free-text" (`phase-06:176`).
- Phase 38 owns care retention and DSAR (`owner-constraints.md:1276-1278`).
- Phase 29 only executes retention that owners set.
- No retention rule exists for Phase 9 notes.
- Q1 clause 1(b) keeps excluded families "importable later only from the retained final manifest". That means keeping unclassified text, which needs a retention class from Phases 9 and 38 and the Phase 21 D26 records owner.

## 10. What SiteStacker holds

| Family                  | Import template                                         | Export                         | Gaps                                                                |
| ----------------------- | ------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------- |
| Notes                   | body, type, subject, important, author person (r07:100) | None (B12)                     | No visibility field; Motion writes notes (V36)                      |
| Activities              | Six types plus Activity People (r07:100)                | BI models only (V31)           | Proposal/cultivation types; inbound email creates people (V44)      |
| Files and photos        | Path and label (r07:100)                                | No bulk download (r07:282-283) | Linkage, rights and alt text unknown                                |
| Forms and applications  | —                                                       | One person at a time (V39)     | References overwrite people (V40)                                   |
| Prayers, DocuSign, care | —                                                       | Unknown                        | Possibly pastoral; care may sit in notes or entities (**inferred**) |

Every family depends on BI reports or a WMTEK package (r07:306). Formats are unverified.

## Discrepancies

1. Integrated `crm_notes` is not the Phase 9 target shape.
2. Field policy and H.5 hide `donors.notes` from missionaries, but the portal shows and edits it.
3. Phase 38 says care is "sealed", but all staff read care activities and super_admin reads private notes. Phase 9's "RLS-revoked" private notes are still author-readable.
4. Phase 30's adapter list omits notes, activities and communications.
5. q01-r1 maps SiteStacker Prayers to Phase 27 Requests, which are invitations (`roadmap.md:4089`).
6. The care keyword pattern is case-sensitive.

## Hazards

These follow from the sections above:

- Care text readable by all staff.
- Possible cross-tenant reads of restricted notes.
- Invented authors and dates, which corrupt "last contacted".
- Imported open tasks or proposals starting work.
- Unbounded or capped readers.
- Unclassified care text kept in retained manifests.
- Photos in public buckets.
- Spam senders imported as people.
- Donors reading activity notes.

## Founder-decision candidates

1. **Notes and activities:**
   - (a) excluded but retained;
   - (b) staff-only, read-only, restricted by default, once Phase 9 exists;
   - (c) excluded and not retained.
2. **Classification:** the ministry classifies by source type, unclassified text gets the strictest class, and no AI or keyword match clears anything.
3. **Care:** always excluded. Decide whether Asym holds it at all.
4. **Files and photos:** excluded until a target exists; never made public automatically.
5. **Applicants mid-process:** finish before the boundary, restart later, or keep Motion 2 as a residual system.
6. **Communications:** exclude per-message history and opens/clicks.
7. **Tasks:** never imported as open work.
8. **Missionaries:** see no imported notes, and the current leaks are fixed before any Switch commits.
