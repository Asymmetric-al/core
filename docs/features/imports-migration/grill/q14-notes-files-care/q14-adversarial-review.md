# Q14 adversarial review: notes, activities, files, applications and care records

Founder answer (2026-11-03): **"C, and think of tough edge cases we need to plan for. Also try and make sure we don't make it needlessly complex."** The founder also asked for a full ruthless review. Decision as asked: `q14-decision-as-asked.md`.

**Evidence.**

- `research/q14-r1-repo-records.md`: owner targets, classification, care, files, applications, message history and missionary notes.
- `research/q14-r2-external-records.md`: vendor practice and SiteStacker.
- `research/q14-r3-owner-and-code-verification.md`: exact owner quotes, corrections to r1 and code defects.
- `research/q14-r4-external-edge-cases-and-law.md`: a 26-row edge-case table, law, retention, sealed-record patterns and file safety.

**Re-verified directly on 2026-11-03:**

- **Super-admin reads every tenant's private care notes.** The private care notes policy is `USING (authz.is_super_admin() OR auth.uid() = author_user_id)`, with no tenant term (`20260414180338_member_care_foundation.sql:335-343`).
- **Any staff member reads member-care activities.** The policy is `authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL)` (`:177-185`).
- **Care-note images go to public storage.** The "Private care note" editor (`PersonnelProfile.tsx:664-668`) uses `LegacyRichTextEditor`, which uploads to `document-uploads` and links it with `getPublicUrl` (`packages/ui/components/shadcn/rich-text-editor/legacy-rich-text-editor.tsx:55-62`).
- **Both buckets are public.** `profiles` and `document-uploads` are created `public = true`, are publicly readable, and accept uploads from any authenticated user (`init_schema.sql:461-487`). No later migration changes them.
- **Donors can read their own staff notes and activities.** Donors may SELECT their own `donors` row, which includes `notes`; the table grant covers every column (`20260625002117:160-182`). They may also read their own `donor_activities` (`:211-232`).
- **Restricted CRM notes trust a global role.** Restricted `crm_notes` require staff membership in the note's tenant plus a global `profiles.role IN ('admin','super_admin')` (`crm_notes.sql:48-61`). The flaw is "admin anywhere and staff here", not a cross-tenant read; this corrects r1.
- **Phase 9 is not ready as a target.** Its target `crm_notes` has an `author_name_snapshot` and a `standard`/`restricted` visibility, but no occurrence date (only `created_at`). Its activity taxonomy has only system event types (`record_created` … `merge_completed`) and no interaction types (`phase-09:637-640`, `:788-797`). This corrects r3's "no author name".

Owner rules quoted in r3: Phase 38 `owner-constraints.md:1255-1290` ("care notes are never ordinary CRM notes"); `roadmap.md:5112`, `:5150`, `:5156`; Phase 9 `:925`; Phase 28 `proof.md:330`; Phase 41 `roadmap.md:5360`; Phase 29 F38 "missing material owner policy blocks that lane"; Phase 30's adapter list (`owner-constraints.md:389-392`). This is research, not legal advice; counsel questions are in §6.

**Disposition: accept with required amendments.**

- **What stays:** C's scope. Everything the source can export comes across.
- **What is replaced:** C's placement rule, "into the closest Asym record". As literally worded, it puts care and personnel content into general CRM records. That breaks at least five owner rules and would expose counselling, crisis and reference material through today's code.
- **The amended rule:** every family lands in a home at least as protected as it was meant to be, or waits sealed until that home exists.
- **Two narrowings the founder must see:**
  - Per-person newsletter send, open and click history does not come across; list facts do (Q9).
  - Asym does not accept care or personnel bytes at all until their sealed home exists. The ministry keeps them, and Asym records their digest.

The corrected decision text is in §3.

---

## 1. Category review

### 1.1 Problem validity, necessity and alternatives: material concern, yes (changes the answer)

**The need is real.** Staff use notes and interaction history daily, and losing them at go-live is the most common complaint in CRM migrations (r2 §1). Applications and care records have long retention duties (r4 §3), so "leave them in the old system" fails once the old system is decommissioned (Q1 clause 12).

**Wrong level.** "Closest Asym record" lets Phase 30 decide where data lives. The owners decide that (C1):

- Phase 9 owns notes and interactions.
- Phase 38 owns care.
- Phase 41 owns applications.
- Phase 29 owns files.
- Phase 28 owns missionary-authored notes.

Phase 30's job is to deliver each family to its owner's import command.

**Strongest alternative: B** (notes as staff history, the rest stays in the export).

- B is safer than literal C. It leaves applications and care in a Phase 29-held export whose own lane is blocked without a Phase 38 policy (F38). That export must then be kept, protected, searchable for subject-access requests and eventually destroyed. Those are custody duties with no product around them.
- Amended C costs little more than B and ends with every family in a governed home.
- Amended C wins on outcome. B wins only on short-term effort.

**No-build alternative: a read-only archive of the old system.** Kept as the fallback for anything the source cannot export (for example SiteStacker files, which have no documented bulk download, r07:282-283). It is not the primary answer, because its protections cannot be governed.

**Unnecessarily frozen:** nothing. Tier names, the file pipeline steps and the follow-up filter are requirements; storage design stays with owners.

**Too vague:**

- "Closest record" → replaced by the family-to-home table (clause 2).
- "Care" → defined by source category, never by content (clause 3).
- "Everything" → bounded by what the source can export, minus per-person bulk email history (clause 8).

### 1.2 Brittleness: material concern, yes

| Fragile assumption                           | What breaks                                                                                                                                                     | Fix                                                                                                                                                                                  |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Sensitivity can be read from text            | Care stored as an ordinary note; false positives hide useful notes. Today's code already does this with a case-sensitive regex (`relationships/model.ts:23-29`) | Tier by source category or file only. Unknown categories are Restricted. No content scanning (Q11).                                                                                  |
| The source separates care from general notes | Care rows inside a mixed notes export                                                                                                                           | Care must arrive as its own declared files (clause 3). A mixed export is split by the ministry before upload as a reviewed transformation (Q3), using the preset's note-type filter. |
| Authors exist as Asym users                  | Lost attribution, or a wrong person credited                                                                                                                    | Author kept as source text plus source ID; never matched to users or recreated (clause 4)                                                                                            |
| Every note has a date                        | Notes shown as written at the Switch                                                                                                                            | Occurrence date with precision. A note with only a created timestamp uses it, flagged "date recorded by system". Never the import date (Phase 27 `context.md:95-99`).                |
| Files are exportable                         | SiteStacker has no documented bulk file download                                                                                                                | Files the source cannot export are a Visible exclusion, "not exportable from {system}" (clause 6)                                                                                    |
| Text encoding is clean                       | Garbled characters from Windows-1252 text read as UTF-8                                                                                                         | Declare and detect encoding at upload. Unreadable rows wait (Q13 pattern). No silent repair.                                                                                         |
| Today's readers respect visibility           | They don't (D40–D49)                                                                                                                                            | Leaks fixed and readers proven before any of these families commit (clause 10)                                                                                                       |

### 1.3 Technical debt: material concern, yes

- **Today's tables.** Importing into `donor_activities`, `donors.notes`, the current `crm_notes` or `member_care_*` would bake leaky prototypes into permanent history. `donor_activities` and `donors.notes` are slated to "die" (`phase-09:573-579`). Owner homes only.
- **Per-note permission flags.** These are the classic debt trap: Salesforce restriction rules miss child notes, are bypassed by "View All Data" and leak into search (r4 §4), and Rock dropped note approvals as too complex. Use three tiers set by category, with Sealed as a separate store (clause 3).
- **Duplicated classification logic** in Phase 30. Instead, Phase 10 owns the tier model (O66), and Phase 30 records the ministry's category mapping as a Remembered mapping (Q11).
- **A Phase 30-built care or applications store** (a "temporary" home). Refused. If the home doesn't exist, the family waits.

### 1.4 Edge cases: material concern, yes

Each case below has a simple rule in §3.

| #   | Case                                                                          | Handling                                                                                                                                                                                                                                                                  |
| --- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E1  | A general note mentions a donor's child's illness (third party, health)       | Comes across under its category's tier. If the ministry knows a category carries health or care detail, it maps that category to Sealed (care) or Leave behind. Any staff member with the capability can later move a note to a stricter tier. The note is never scanned. |
| E2  | A note about a minor (the subject Party is a child, Q10)                      | At least Restricted                                                                                                                                                                                                                                                       |
| E3  | A note about a deceased person                                                | Imported as is. Q9 governs contact, not history.                                                                                                                                                                                                                          |
| E4  | Embedded HTML, images or base64 inside a note                                 | Text kept as sanitised plain text with line breaks. Inline images become separate files through the file pipeline, or are listed as not imported. Scripts are never kept.                                                                                                 |
| E5  | A very long note (pasted email thread, over 100 KB)                           | Kept whole up to the owner's limit. Over the limit, it is split into numbered parts and never truncated silently.                                                                                                                                                         |
| E6  | The same logged email on several people, or one household activity            | Stored once and linked to each person. The strictest tier among the links applies.                                                                                                                                                                                        |
| E7  | Duplicate activities (the same email logged twice)                            | Removed only on exact keys (source ID, or email Message-ID where exported). Never fuzzy.                                                                                                                                                                                  |
| E8  | The author is a missionary                                                    | Goes to that missionary's private notes (Phase 28), or waits. Never staff-visible (clause 5).                                                                                                                                                                             |
| E9  | The author is a volunteer or has left the ministry                            | Author text kept ("Recorded by {name} in {system}"). No user account is created.                                                                                                                                                                                          |
| E10 | The author is unknown or system-generated (for example inbound email capture) | "Recorded by {system}"                                                                                                                                                                                                                                                    |
| E11 | Mixed languages, or mojibake                                                  | Encoding declared and checked at upload. Unreadable rows wait.                                                                                                                                                                                                            |
| E12 | A note with no occurrence date                                                | Created timestamp, flagged; if absent, waits                                                                                                                                                                                                                              |
| E13 | An open task, past due, whose assignee has left                               | Imported as history, "Open in {system} at the Switch". No assignee, reminder or automation. One filter lets staff turn it into a real task (clause 4).                                                                                                                    |
| E14 | A recurring task                                                              | One entry describing the recurrence. Not recreated.                                                                                                                                                                                                                       |
| E15 | A malware or macro document                                                   | Quarantined and never stored; listed with its record (clause 6)                                                                                                                                                                                                           |
| E16 | A password-protected or encrypted file                                        | Not imported; listed ("Encrypted: keep in your archive")                                                                                                                                                                                                                  |
| E17 | A very large file (video)                                                     | Over the cap it is not imported; listed                                                                                                                                                                                                                                   |
| E18 | An unsupported or legacy format (HEIC, TIFF, `.msg`, `.eml`, `.pages`)        | Allowlist. HEIC and TIFF are re-encoded to standard images. `.msg` and `.eml` are kept as downloadable files, not parsed. Others are listed.                                                                                                                              |
| E19 | A PDF with JavaScript; Office files                                           | Download-only serving, never rendered inline (CVE-2024-4367 class)                                                                                                                                                                                                        |
| E20 | A file name containing personal data                                          | Stored under an opaque key. The original name is shown only to people who can see the record.                                                                                                                                                                             |
| E21 | EXIF GPS in photos                                                            | Images re-encoded, which strips metadata                                                                                                                                                                                                                                  |
| E22 | Photos of children or of restricted workers                                   | Restricted. Never shown on public, donor or missionary surfaces without the Phase 10 publish-consent record.                                                                                                                                                              |
| E23 | One file linked to several records; duplicate files                           | Stored once by content hash and linked to each record. The strictest tier wins.                                                                                                                                                                                           |
| E24 | An orphan file (no record)                                                    | Not imported; listed for the ministry's archive                                                                                                                                                                                                                           |
| E25 | Confidential references; medical or psychological evaluations                 | Sealed (Personnel). Never shown to the applicant through Asym. Subject access goes through the privacy role with counsel's rules.                                                                                                                                         |
| E26 | Background-check reports                                                      | The facts (date, outcome, expiry) go to Phase 41. The report is Sealed (Personnel), or left behind if the ministry chooses (FCRA disposal: counsel question).                                                                                                             |
| E27 | An applicant part-way through                                                 | Continues in Asym as an open application once Phase 41's import exists. Until then, the ministry finishes the application in the old system or pauses it. Listed in the readiness census.                                                                                 |
| E28 | Rejected or withdrawn applicants                                              | Decided applications come across as facts. Documents are Sealed (Personnel) or left behind by the ministry's choice.                                                                                                                                                      |
| E29 | Safeguarding or abuse disclosures                                             | Sealed (Care). Never deleted automatically. Retention is set by the ministry with counsel (UK guidance runs to 70–75 years, r4 §3).                                                                                                                                       |
| E30 | Crisis or evacuation plans for workers in sensitive countries                 | Sealed (Care)                                                                                                                                                                                                                                                             |
| E31 | Care records about a third party (a missionary's family member)               | Sealed (Care), linked to the worker. Third-party redaction is handled at subject-access time.                                                                                                                                                                             |
| E32 | Ordinary staff searching for a person who has Sealed records                  | No result, count or indicator. Sealed existence is hidden (clause 3).                                                                                                                                                                                                     |
| E33 | A note about a restricted worker naming their location                        | The restricted-worker link forces Restricted at least, and Phase 10 alias rules apply to labels (Q13, O57)                                                                                                                                                                |
| E34 | Per-person newsletter sends, opens and clicks                                 | Not imported (clause 8). Q9's list facts come across. One-to-one logged emails are activities.                                                                                                                                                                            |
| E35 | Free-text custom fields holding note-like content                             | Follow F10 with the same tier rule                                                                                                                                                                                                                                        |
| E36 | Asym help access during a Switch                                              | Never sees Sealed families. Their bytes are not in Asym before the home exists.                                                                                                                                                                                           |

### 1.5 Footguns: material concern, yes

| Footgun                                          | Harm                                     | Prevention                                                                                                                                                                                                                     |
| ------------------------------------------------ | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Mapping a care-heavy category to Staff           | Care content visible to all staff        | The mapping step asks plainly for each category: "Does this contain care, counselling, health or safeguarding information?" Answering yes offers only Sealed (care) or Leave behind. Unknown categories default to Restricted. |
| Loosening a tier after import                    | Exposure                                 | Moving to a stricter tier is open to anyone with the capability. Loosening needs the tier holder and a reason, and is audited.                                                                                                 |
| Uploading a care export into the ordinary import | Care content staged and previewed        | Care and personnel files go only through the sealed lane, which does not exist until Phase 38/29/41 build it. The ordinary lane warns on the preset's care note types, and the ministry splits the file first.                 |
| Reusing today's public buckets                   | Public exposure                          | Imported files never touch `profiles` or `document-uploads`. Private storage only (O64).                                                                                                                                       |
| A "convert all open tasks" bulk action           | A flood of stale tasks and notifications | Conversion is per item, or batch with a count and assignee. Converted tasks start without reminders until a due date is set.                                                                                                   |
| Super-admin access                               | Cross-tenant reading                     | Q5: no platform path into tenant content. D40 must be fixed before any care import.                                                                                                                                            |

### 1.6 Tenant safety: material concern, yes

- **Current code has tenant-boundary defects** (D40, D46). Super-admin reads every tenant's private care notes. Restricted notes trust a global profile role.
- **Required:**
  - every imported note, activity, file link and sealed record carries `tenant_id` with tenant-composite foreign keys;
  - storage keys are prefixed by tenant and governed by storage RLS keyed to tenant membership;
  - no global role grants tenant content (Q5, O26–O27);
  - category mappings are per tenant and source (Q11).
- **Content-hash deduplication is per tenant.** A hash index across tenants would reveal that two ministries hold the same file.

### 1.7 Database, RLS and authorization safety: material concern, yes

| Concern                    | Requirement                                                                                                                                                                                                                         |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tier enforcement           | Enforced in RLS, not only in the app: Staff (tenant staff), Restricted (named capability), Sealed (Phase 38/41 holder capability, in separate tables and a separate bucket). There are no `USING (true)` or global-role escapes.    |
| Missionary and donor reads | Never from these tables directly. Imported notes, activities and files are never granted to missionary or donor roles. Today's leaks (D43–D45) are fixed first.                                                                     |
| Storage                    | Private buckets. The policy on `storage.objects` checks tenant and tier through a join to the owning record. No `getPublicUrl`. Signed URLs are short-lived, download-only (`Content-Disposition: attachment`) and use opaque keys. |
| Service role               | Only the owner import commands and the scan worker use it. Supabase service keys bypass RLS (r4 §5), so the worker can only write to quarantine and the final private bucket, from a server context.                                |
| Attribution                | Importer, run and tenant come from server context. The source author is a text field, never a user ID the caller supplies.                                                                                                          |
| Append-only                | Imported entries are read-only. Corrections are annotations (Phase 9). Tier changes are audited events.                                                                                                                             |
| WITH CHECK                 | No update can move an entry to another tenant, clear its origin, or loosen its tier without the holder capability.                                                                                                                  |
| Constraints                | Unique `(tenant_id, source_system, installation, record_family, source_object_id)` (O16 pattern). Occurrence date plus precision is NOT NULL. A tier column with a CHECK. A content-hash unique index per tenant on file blobs.     |

### 1.8 Overengineering: material concern, yes (resolved by refusals)

**Refused:**

- per-note access lists;
- note approval workflows;
- break-the-glass access;
- banners saying a sealed record exists;
- content or AI classification;
- fuzzy de-duplication;
- automatic encoding repair;
- parsing `.msg` and `.eml` files;
- inline PDF or Office previews;
- video hosting;
- recreating source users;
- per-person newsletter history;
- auto-delete retention timers;
- a Phase 30 temporary care or applications store;
- a document management system.

**Kept, because each is the smallest thing that is safe:**

- three tiers;
- one file pipeline;
- one "open at the Switch" filter;
- a recorded digest for ministry-held sealed exports.

### 1.9 UX/UI and user friction: material concern, yes

**Staff mapping (one screen per family):**

- Each source category shows its row count, date range and a sample under Q5 visibility.
- The tier choice has plain help: Staff, Restricted, Sealed (care), Sealed (personnel), Leave behind.
- Unknown categories show Restricted pre-selected.
- The care and safeguarding question is asked once per category.
- Bulk-apply works across categories, and Remembered mappings pre-fill re-runs.

**Timeline:**

- Imported entries appear in date order, mixed with Asym entries.
- Each shows a small "Imported from {system}" label, "Recorded by {name}" and, where needed, "Date recorded by system".
- Entries are read-only, with an "Add correction note" action.
- A filter "Open at the Switch" shows former open tasks, each with "Make a task".

**Files:**

- Files are listed on the record with type, size and download.
- Files not imported are summarised: "12 files kept in your archive: 8 too large, 3 encrypted, 1 failed a safety check". The summary is downloadable.

**Sealed:**

- Holders see Sealed records in the owner's sealed area only.
- Ordinary staff see nothing at all.
- The Switch summary shows tenant-level counts only.

**Missionaries:**

- Their own imported private notes appear in their private notes (Phase 28) when that home exists, labelled "From {system}".
- They never see staff notes.

**Donors:** see nothing from these families.

**Accessibility, language and mobile:**

- Accessibility: tier choices are radio groups with descriptions, labels are text rather than colour, and the timeline is keyboard-navigable.
- Language: say "kept in your archive" and "left behind"; never "error" or "deleted".
- Mobile: staff timelines are readable on mobile, but mapping is desktop-first, which is acceptable for a one-off Switch.

### 1.10 Source of truth, ownership and domain invariants: material concern, yes

| Family                                                                      | Owner and home                                                                 | Phase 30 role                                                    |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| Notes and interactions (note, call, meeting, visit, email, task-as-history) | Phase 9 timeline (amended, O61)                                                | Deliver through its import command                               |
| Missionary-authored notes                                                   | Phase 28 private notes (O63)                                                   | Deliver, or wait                                                 |
| Care records                                                                | Phase 38 sealed care (O62)                                                     | Deliver when the home exists; until then, a recorded digest only |
| Applications (facts) and personnel documents                                | Phase 41, plus a Phase 29 sealed personnel lane (O65, O64)                     | Same as care                                                     |
| Files and photos                                                            | Phase 29 custody with a CRM-attachment lane (O64), linked to the owning record | Pipeline mechanics; Phase 29 owns bytes and retention            |
| Tier model                                                                  | Phase 10 (O66)                                                                 | Records the mapping                                              |
| Subject access and erasure across tiers                                     | Phase 3 privacy role (O67)                                                     | None                                                             |

**Invariants:**

1. **J1:** No imported entry is less protected than its source category's mapped tier. No Sealed content exists outside its sealed home.
2. **J2:** An entry linked to several people takes the strictest tier among them.
3. **J3:** Imported entries are read-only. Origin, source author text and occurrence date are immutable.
4. **J4:** No imported entry, task or file causes a notification, reminder, automation or message (Q12, O1/O33).
5. **J5:** Missionary and donor roles can read no imported staff note, activity, file or sealed record.
6. **J6:** Ordinary staff cannot learn that a Sealed record exists (no row, count, search hit or indicator).
7. **J7:** One stored entry per source identity per tenant. One stored blob per content hash per tenant.
8. **J8:** Every source row and file has exactly one disposition: imported (with tier), waiting, left behind (with reason), or held by the ministry with a recorded digest.

J1, J5 and J7 are enforced in the database. J6 is enforced by separate tables, a separate bucket and negative tests.

### 1.11 Hidden coupling: material concern, yes

- **Phase 9 target design.** It must add an occurrence date and interaction types before notes can import (D50). It already has `author_name_snapshot` and `standard`/`restricted` visibility, which map onto the source author text and the Staff and Restricted tiers. Coupled to Phase 27's rules on authors and dates.
- **Phase 38, 41 and 29 sealed lanes.** These gate the care and personnel families. The Switch never waits for them, because they are not Minimum Switch Kit families (Q1 clause 1(b)).
- **Phase 30 adapter list.** It must be amended to name these families (C3; `owner-constraints.md:389-392`) (O69).
- **Today's readers.** The missionary portal, donor Data API and CRM relationships list must stop leaking before these families commit (O68 extends O60).
- **Phase 34.** Imported tasks stay history; they never enter workflow runs (`roadmap.md:4772`, `:4782`).

### 1.12 Failure modes: material concern, yes

| Failure                                                      | Required behaviour                                                                                                                                             |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A scan worker crash part-way                                 | Files stay in quarantine; resumable; nothing is promoted without a clean verdict                                                                               |
| Scanner unavailable                                          | Files wait in quarantine. The Switch can go live without them (not a kit family). They are shown as "files still being checked".                               |
| A file is promoted, then the link write fails                | Promotion and link happen in one owner command. On failure, the blob is unreferenced and garbage-collected after a grace period. The source row stays waiting. |
| A wrong tier mapping found after commit                      | Move to a stricter tier, single or batch, with a count; audited. Loosening is limited (§1.5).                                                                  |
| A wrong family mapping (care imported as notes)              | Owner correction: move the entry to the sealed home once it exists. Until then, Restricted, and access is reviewed in the audit log. Incident under M-Q14-1.   |
| A ministry-held sealed export is lost before its home exists | The recorded digest proves what existed. Asym cannot recover the content, and the readiness census states this risk.                                           |

### 1.13 Lifecycle, temporal correctness, concurrency and idempotency: material concern, yes

- **Row and file states:**
  - Rows: staged → mapped (tier) → waiting, left behind, held by ministry, or ready → committed. A committed entry can only be annotated or tightened.
  - Files: uploaded → quarantined → clean, or rejected with a reason → promoted → linked.
- **Forbidden transitions:**
  - committed → edited;
  - Sealed → any non-sealed store;
  - a tier loosened without the holder;
  - a task created live by import.
- **Temporal rules:**
  - occurrence date with precision; dates are never shifted through time zones;
  - post-boundary notes in the source are not imported (Q1: after the boundary Asym is the only writer);
  - tail backfills carry no notes (Q1 clause 6).
- **Idempotency:** on source identity for rows and on content hash for blobs. Re-runs converge.
- **Concurrency:**
  - One commit per family per Switch.
  - Tier changes are serialised per entry, and the stricter tier wins on conflict.
  - A staff member annotating during the commit is safe, because annotations are separate rows.

### 1.14 Data integrity risks: material concern, yes

| Risk                                                    | Prevention                                                                      |
| ------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Lost authors and dates                                  | J3; source author text; occurrence date with precision                          |
| Lost visibility flags (the worst vendor failure, r2 §2) | Tier is mapped per category; unknown means Restricted; enforced in RLS          |
| Duplicates                                              | J7; exact keys only                                                             |
| Broken links (activity to person)                       | Bound through Q10 Source Record Bindings; unbound rows wait                     |
| Orphan blobs                                            | One owner command for promote plus link; garbage collection with a grace period |
| Garbled text                                            | Encoding check; waits, never repaired                                           |
| Shared activities split or duplicated                   | Stored once; linked to many                                                     |

### 1.15 Security and privacy risks: material concern, yes (highest category)

**Current code** has one critical defect and four high ones (D40–D49, §5).

**Health data (US):**

- Washington's MHMDA likely treats importing donor health notes as collecting consumer health data (r4 §2; counsel question 1). Maryland allows sensitive data only when strictly necessary.
- _Product rule:_ health detail about donors belongs in Sealed (care) or Leave behind, never Staff. The mapping step asks the question, and counsel confirms the rule before the first real Switch.

**UK/EU:**

- Religious-body processing (Art. 9(2)(d)) covers members and regular contacts. Asym acts as processor (Art. 28; Q2's agreement).
- Subject access reaches imported staff notes. The privacy role's finder must cover every tier (O67).

**Confidential references.** Sealed (Personnel); never shown to the subject through Asym (counsel question 7).

**Files:**

- quarantine;
- a self-hosted scanner (never VirusTotal or any other third-party upload service, Q11);
- an allowlist and size cap;
- images re-encoded;
- opaque keys;
- download-only serving.

**Logs and help access.** Logs hold no note text, file names or content. Asym help access (Q5) never reaches Sealed families.

**Retention and erasure.**

- Review dates are set per family by the ministry (F11).
- Safeguarding records are never deleted automatically.
- Erasure removes a person's entries across tiers, except under a recorded legal-hold reason (O67).
- Retained manifests need per-person erasure (O64).

**Québec.** Law 25 may require a privacy impact assessment before data leaves Québec. Asym supplies a one-page hosting and subprocessor fact sheet (counsel question 6).

### 1.16 Scalability and performance: material concern, yes (moderate; partly unknown)

**Volumes:**

- Notes and activities: about 10⁴–10⁶ rows per ministry (inference; r4 marks typical volumes as a gap).
- Per-person newsletter history would be about 10⁷ rows (20,000 recipients × 50 sends × 10 years). That is one reason it is left out (clause 8).
- Files: volumes unknown. SiteStacker has no documented bulk file export.

**Requirements:**

- **Rows:** chunked and resumable, with a timeline index on `(tenant_id, party, occurrence_date)`. No in-memory loading of all notes; today's notes list loads every note (D49).
- **Files:**
  - streamed;
  - a per-file cap of 25 MB, adjustable by the Phase 29 profile;
  - a per-Switch total measured in practice runs;
  - scanning concurrency limited per tenant so one Switch cannot starve others.

**Unverified:** scanner throughput and storage cost at scale. Practice runs measure both (M-Q14-7).

### 1.17 Operational burden: material concern, yes (contained)

- **Ministry effort:** category mapping (once per category, remembered), reviewing waiting rows, keeping the ministry-held sealed exports until their home exists, and working through open-at-Switch items. Counts and bulk actions keep this small.
- **Asym operations:** running the self-hosted scanner (one worker, with signature updates; monitored). Nothing needs direct database repair. Corrections are product actions.
- **No developer involvement per Switch.**

### 1.18 Observability and auditability gaps: material concern, yes

**Business evidence (durable).** Per run and family:

- counts by disposition and tier;
- the mapping version;
- files not imported, with reasons;
- digests of ministry-held sealed exports;
- tier changes, with actor and reason.

**Security audit (durable):**

- every read of Restricted and Sealed entries;
- every signed-URL issue for files;
- every tier loosening.

**Technical telemetry:** scan verdict counts, queue depth and failures. No content or file names.

**Leak tests (CI).** Fixtures prove:

- missionary and donor roles read nothing imported;
- ordinary staff see no Sealed existence;
- a super-admin without a tenant grant reads nothing.

### 1.19 Dependency and integration risks: material concern, yes

- **Owner homes are the critical path:** Phase 9 amendment, Phase 38, Phase 41 and Phase 29 lanes. Each family's import activates only when its home and command exist (owner-constraints :389-393).
- **Scanner:** self-hosted ClamAV or an equivalent Asym runs. Signature updates must be monitored; a stale scanner fails closed (files wait).
- **SiteStacker:** no documented export of activities, notes or files (r07). The coverage register (Q3) records what each source can export. Anything it cannot is a Visible exclusion, "not exportable from {system}", and goes to the ministry's archive.
- **Email tools:** Q9 already covers list exports. No integration is added.

### 1.20 Migration, rollout and upgrade risks: material concern, yes

- **Activation order:**
  1. leak fixes (D40–D49);
  2. owner homes;
  3. reader readiness;
  4. practice runs;
  5. family-by-family activation.

  Each family has its own switch, and halting one doesn't stop others.

- **Families whose home appears after a ministry's Switch** import later:
  - from the retained final manifest, for Phase 29 custody (Q1 clause 1(b));
  - for care and personnel, from the ministry-held export whose digest was recorded at the boundary. The digest must match, otherwise the plan blocks.
- **Rollback after commit:** entries are read-only history. A whole family run can be withdrawn by an owner correction run (hide plus audit, then re-import), like Q13's append-only correction. Never a deletion that loses audit.

### 1.21 Testability, traceability and proof: material concern, yes

**Proof needed:**

- **Positive:** each family lands in its home with the right tier, author text, date and label.
- **Negative:**
  - care, personnel and missionary-authored content never lands in ordinary notes;
  - an imported task produces no reminder;
  - a malicious file never leaves quarantine.
- **Boundary:**
  - a note at the size limit plus one byte splits;
  - a file at the cap plus one byte is rejected;
  - a note with only a created timestamp is flagged.
- **Authorization:**
  - missionary, donor and anonymous roles and a tenantless super-admin read nothing;
  - ordinary staff see no Sealed existence, including in search and counts.
- **Concurrency:** a re-run converges; a tier tightened during a commit wins.
- **Production-shaped:** a practice run with real-shaped volumes measures scanner throughput.
- **Accessibility:** the mapping and timeline screens.

**Traceability.** New Phase 30 terms: Record tier, Sealed family, Open at the Switch, Ministry-held sealed export, File safety check. Owner terms are reused.

### 1.22 Other development hazards: material concern, yes

- **Counsel dependencies** (MHMDA, Maryland, FCRA for volunteers, Art. 9(2)(d), retention, Québec, references). These are recorded as counsel questions to answer before the first real Switch that includes notes, care or personnel families. They do not block the Minimum Switch Kit.
- **Expectation risk.** "Everything comes across" may be heard as "on day one". The Switch summary must say plainly which families came across, which are kept by the ministry until their home exists, and which the source could not export.

---

## 2. Disposition

**Accept with required amendments.**

- **Kept:** C's scope.
- **Replaced:** C's "closest Asym record" placement, by "each family into its owner's protected home, or it waits sealed".
- **Narrowings the founder must confirm:**
  - per-person newsletter history is not moved;
  - care and personnel bytes stay with the ministry, with a recorded digest, until their sealed home exists.

## 3. Corrected decision (to record)

**Q14 — Notes, activities, files, applications and care records. Option C, amended.** (★ = changed from what was asked.)

1. **Everything the source can export comes across.** ★ Each family goes into its owner's home, at least as protected as it was meant to be, never into "the closest record". A family whose home does not yet exist waits (clause 9). These are not Minimum Switch Kit families, so a Switch never waits for them (Q1 clause 1(b)).
2. ★ **Where each family goes.**
   - **Notes and finished interactions** (note, call, meeting, visit, logged email) go to the Phase 9 timeline (O61).
   - **Notes written by missionaries** go to that missionary's private notes (Phase 28), never staff-visible (O63).
   - **Care records** (care, counselling, health, crisis, safeguarding) go to Phase 38's sealed care records. They never become CRM notes (O62).
   - **Applications** go to Phase 41 as facts: status, dates, decision, and background-check date, outcome and expiry. References, assessments, medical or psychological evaluations and check reports go to the sealed personnel area (O65, O64).
   - **Files and photos** go to Phase 29 private storage, attached to the record they belonged to (O64).
3. ★ **Three tiers, set by source category, never by reading the content.**
   - **The tiers:** Staff; Restricted (named roles); and Sealed, which comes in two kinds, care and personnel. Sealed is kept separately and its existence is hidden from everyone else.
   - **Choosing a tier:** the ministry picks a tier, or Leave behind, for each source category or file type in the mapping step.
     - Unknown categories start as Restricted.
     - Anything about a minor or a restricted worker is at least Restricted.
     - For each category, the step asks: "Does this contain care, counselling, health or safeguarding information?" Yes offers only Sealed (care) or Leave behind.
   - **No scanning:** no AI and no keyword scanning (Q11).
   - **Changing a tier later:** anyone with the capability can move an entry to a stricter tier. Loosening needs the tier's holder and a reason. Both are audited.
   - **Shared entries:** an entry linked to several people takes the strictest of their tiers.
4. **History as it was recorded.**
   - **Entries:** imported entries are read-only, with "Imported from {system}". Corrections are added as notes.
   - **Author:** kept as text ("Recorded by {name} in {system}"). No user accounts are created.
   - **Date:** the original occurrence date, with its precision. If only a system timestamp exists, it is used and flagged; if there is none, the entry waits. Never the import date.
   - ★ **Open tasks** come across as history marked "Open in {system} at the Switch", with no assignee, reminder or automation. A filter lets staff turn any of them into a real task. Recurring tasks become one entry that describes the recurrence.
   - **Deduplication:** only on exact keys (source ID, email Message-ID).
   - **Formatting:** HTML is kept as safe text.
   - **Long notes:** split into numbered parts, never cut short.
   - **Encoding:** unreadable text waits.
5. ★ **Missionaries and donors see nothing imported from these families**, except a missionary's own private notes, which go to them alone. Staff notes stay staff-only (Phase 9, Phase 14 H.5).
6. ★ **Files go through one safety check.**
   - **Steps:**
     - quarantine;
     - a malware scan Asym runs itself, never a third-party upload service;
     - a type allowlist and a size cap (25 MB per file by default; Phase 29 sets the profile);
     - images re-encoded, which removes location data;
     - opaque storage names;
     - download-only, never shown inline.
   - **Storage:** files never use today's public buckets. Identical files are stored once per ministry.
   - **Files not imported:** infected, encrypted, oversized, unsupported or orphaned files are not imported. They are listed with reasons for the ministry's archive.
   - **Source limits:** files the source cannot export are a Visible exclusion, "not exportable from {system}".
   - **Photos** are private and staff-visible. They are never published without Phase 10's consent record; photos of minors and restricted workers are Restricted.
7. **Applications in progress.**
   - When Phase 41's import exists, they continue in Asym at their current step.
   - Until then, the ministry finishes or pauses them in the old system, and the readiness census lists them.
   - Rejected and withdrawn applications come across as facts. Their documents are sealed or left behind, by the ministry's choice.
8. ★ **Email history.**
   - **Comes across:** one-to-one emails logged on records, as interactions.
   - **Does not come across:** per-person newsletter sends, opens and clicks. They have no reliable meaning: Phase 6 treats opens and clicks as advisory, short-lived signals separate from delivery (`phase-06:44-45`, `:152`, `:175`), and Q9 refuses to use opens. List membership and permission facts follow Q9.
9. ★ **When a home doesn't exist yet.**
   - **Files and other non-sealed families** wait in the retained final manifest in Phase 29 custody and are imported later (Q1 clause 1(b)).
   - **Care and personnel files** are never uploaded to Asym before their sealed home exists. The ministry keeps them, and Asym records their digest at the Switch Boundary. They are imported later only from a copy whose digest matches.
   - **Counts:** sealed families appear only as tenant-level counts.
10. ★ **Safety first.** Before any of these families commits for any ministry:
    - the current leaks (D40–D49) are fixed;
    - every surface that reads notes, activities or files passes the Reader readiness check (O68, extends O60);
    - counsel has answered the health-data, references and retention questions for the families involved.
11. **Privacy and retention.**
    - **Subject access and erasure** reach every tier through the privacy role (O67), except under a recorded legal hold.
    - **Review dates** are set per family by the ministry (F11). Safeguarding records are never deleted automatically.
    - **Retained manifests** support per-person erasure.
    - **Logs** carry no content.
    - **Asym help access** never reaches sealed families.
12. **Fixing mistakes.**
    - **Wrong tier:** tighten it (clause 3).
    - **Wrong family:** an owner correction moves the entry to its proper home once that home exists. Until then, the entry is Restricted and its access is reviewed.
    - **Whole-run errors:** withdrawn by an owner correction run, audited, then re-imported. Nothing is silently deleted.

**Acceptance criteria**

- **AC1:** Care, personnel and missionary-authored content never lands in ordinary notes or activities. A test seeds each into a notes import and proves the plan blocks it, or routes it to the right home.
- **AC2:** Every imported entry carries its tier. Unknown categories land as Restricted. Entries about minors or restricted workers are at least Restricted.
- **AC3:** Missionary, donor and anonymous roles, and a super-admin with no tenant grant, can read no imported staff note, activity, file or sealed record.
- **AC4:** Ordinary staff see no row, count, search hit or indicator for Sealed records.
- **AC5:** Imported entries keep the source author text and occurrence date with its precision, are read-only and show "Imported from {system}".
- **AC6:** Imported open tasks create no task, reminder, notification or automation. "Make a task" converts exactly one, with an assignee.
- **AC7:** A file is promoted only after a clean scan and allowlist check. Infected, encrypted, oversized, unsupported and orphaned files are listed with reasons, never stored outside quarantine.
- **AC8:** Imported files are served only through short-lived, download-only signed URLs with opaque keys. No imported file is in a public bucket.
- **AC9:** Re-encoded images carry no EXIF location data.
- **AC10:** A re-run converges. Duplicate rows and identical files are stored once.
- **AC11:** An entry linked to several people takes the strictest tier.
- **AC12:** Tightening a tier is open to the capability. Loosening needs the holder and a reason. Both are audited.
- **AC13:** Care and personnel files are never accepted before their sealed home exists. A ministry-held export imports later only if its digest matches the one recorded.
- **AC14:** Per-person newsletter, open and click history is not imported.
- **AC15:** The Switch summary lists each family as imported, waiting for its home, kept by the ministry, or not exportable, with counts. Sealed families appear only at tenant level.
- **AC16:** None of these families commits for any ministry until D40–D49 are fixed and the Reader readiness check covers notes, activities and files.

## 4. Ruthless synthesis

### Before recording

- Amend C as §3.
- Record discrepancies D40–D51.
- Flag D40, D41, D43 and D44 as time-sensitive live exposures, with no tracker action.

### Must be captured in the spec and design

- the family-to-home table;
- the tier model and mapping step;
- invariants J1–J8;
- AC1–AC16;
- the edge-case rules E1–E36;
- the file safety check;
- the "Open at the Switch" filter;
- ministry-held sealed exports with a recorded digest;
- the Switch summary wording.

### Owner requirements, in dependency order

1. **Leak fixes, D40–D49 (outside Phase 30, urgent).** The critical one is D40.
2. **O69:** amend Phase 30's adapter list to name these families (C3).
3. **O66 and O67:** the Phase 10 tier model, and the Phase 3 projection resolver plus a privacy finder across tiers.
4. **O61, then O63:** the Phase 9 import command and the Phase 28 private-notes import. This unlocks the commonest family, notes.
5. **O64:** Phase 29's CRM-attachment lane and sealed lanes. This unlocks files.
6. **O62 and O65:** Phase 38 and Phase 41. These unlock care and applications.
7. **O68:** Reader readiness extended to these surfaces.
8. **Counsel answers for the families involved.**
9. **Practice runs, then family-by-family activation.**

### Implementation safeguards required

- RLS tiers;
- separate sealed tables and bucket;
- private storage with tenant-keyed policies;
- download-only signed URLs;
- quarantine plus a self-hosted scanner;
- image re-encoding;
- exact-key deduplication;
- read-only entries;
- audited tier changes;
- no content in logs;
- leak tests in CI.

### Monitors

| ID      | Signal                                                                                                   | Threshold                           | Owner                         | Response                                                           |
| ------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------- | ----------------------------- | ------------------------------------------------------------------ |
| M-Q14-1 | An imported Restricted or Sealed entry read by a role outside its tier (access audit plus CI leak tests) | 0                                   | Phase 30 with Phases 10/38    | Halt the family; incident; owner fix                               |
| M-Q14-2 | Outward effects (task, reminder, notification, automation) from imported entries                         | 0                                   | Phase 30 with Phase 9/34      | Halt; correct                                                      |
| M-Q14-3 | Files with an infected verdict                                                                           | Any                                 | Phase 29                      | Keep in quarantine; tell the Switch lead; never promote            |
| M-Q14-4 | Scanner signatures older than 24 hours, or scanner unavailable                                           | Any                                 | Asym operations               | Files wait (fail closed); restore the scanner                      |
| M-Q14-5 | Share of notes landing Restricted because their category was unknown, at the final practice run          | > 30%                               | Phase 30 with the Switch lead | Review the category mapping with the ministry before the real run  |
| M-Q14-6 | Entries moved to a stricter tier in the first 90 days                                                    | > 1% of imported entries            | Phase 30                      | Review mapping guidance and defaults                               |
| M-Q14-7 | File safety-check time per practice run                                                                  | > 50% of the declared editing pause | Phase 30                      | Run files after go-live (not a kit family) or add scanner capacity |
| M-Q14-8 | Families waiting for a home at each Switch's go-live                                                     | Learning signal                     | Roadmap owner                 | Input to owner sequencing                                          |

## 5. Owner requirements and discrepancies

**Owner requirements (proposed O61–O69):**

- **O61 (Phase 9).** An import command for notes and interactions:
  - **Fields:** occurrence date with precision; interaction types (note, call, meeting, visit, email, open-at-Switch task); source author as text, never a user ID; Source Record Binding; an "Imported from" label.
  - **Tier:** Staff or Restricted, from the ministry's category mapping.
  - **Behaviour:** read-only, with correction notes; one entry linked to many people at the strictest tier; no reminders or automations.
  - **Amends** the target design (`:637-640`, `:788-797`) to add an occurrence date and interaction types, matching Phase 27 (`context.md:95-99`). The existing `author_name_snapshot` and `standard`/`restricted` visibility are reused.
- **O62 (Phase 38).**
  - **Sealed care home and its import command:**
    - care is declared at the source-type, column or file level, and is never staged, previewed or narrowed outside the sealed lane;
    - existence is hidden from ordinary staff;
    - counts are tenant-level only;
    - records are read-only and access-logged;
    - a Phase 38 retention class and a named custodian apply.
  - **Until it exists:** Asym accepts no care bytes; only a digest of the ministry-held export is recorded.
- **O63 (Phase 28).** Missionary-authored source notes go to the author's private notes or wait. They are never staff-visible.
- **O64 (Phase 29).**
  - **CRM-attachment lane (private storage):**
    - quarantine and a self-hosted scan;
    - allowlist and size profile;
    - image re-encoding;
    - opaque keys;
    - download-only signed URLs;
    - per-tenant content-hash deduplication.
  - **Sealed lanes** for personnel and care files.
  - **Staff-migration input profile:** extends O19.
  - **Retained manifests:** per-person erasure, plus digest-only records of ministry-held sealed exports.
- **O65 (Phase 41).** Import of decided applications as facts (including background-check date, outcome and expiry) and of in-progress applications at their current step. Documents go to the sealed personnel lane.
- **O66 (Phase 10).**
  - **Tiers:** Staff, Restricted and Sealed (care, personnel) at record and file level. Minors and restricted workers are at least Restricted. The strictest linked tier applies.
  - **Tier changes:** tightening by the capability; loosening by the holder with a reason; both audited.
  - **Photos:** private by default; published only with a consent record.
- **O67 (Phase 3).**
  - **Projection resolver:** wired so that missionary and donor reads cannot reach imported notes, activities or files. Field policy is unenforced today.
  - **Privacy finder:** covers every tier for subject access and erasure, with legal-hold reasons.
- **O68 (each surface owner; extends O60).** Reader readiness covers every surface that reads notes, activities or files. D40–D49 are fixed before any of these families commits.
- **O69 (roadmap/owner-constraints).** Amend Phase 30's adapter list (`owner-constraints.md:389-392`; `roadmap.md:4367`) to name notes and interactions, attachments, applications and care, with their owner homes (C3).

**Discrepancies (proposed D40–D51).** Severity is in brackets.

- **D40 (critical, time-sensitive).** Any super-admin reads every tenant's private care notes (`member_care_foundation.sql:335-343`; `20260226113000:143-156`).
- **D41 (high, time-sensitive).** The "Private care note" editor uploads images to the public `document-uploads` bucket and links them by public URL (`PersonnelProfile.tsx:664-668`; `legacy-rich-text-editor.tsx:55-62`).
- **D42 (high).** Any tenant staff member reads member-care activities (`member_care_foundation.sql:177-185`), and five care types appear with their descriptions in the general CRM relationships list (`relationships/model.ts:25-29`, `:516`).
- **D43 (high, time-sensitive).** Donors read their own `donors.notes` and `donor_activities` through the Data API (`20260625002117:160-182`, `:211-232`).
- **D44 (high, time-sensitive).** The `profiles` and `document-uploads` buckets are public-read and accept uploads from any authenticated user (`init_schema.sql:461-487`).
- **D45 (medium-high).** The missionary portal reads and edits `donors.notes` (`missionary-portal/donor.ts:47`, `:91`; `donors.ts:427`, `:440`), contrary to field policy (`field_policy_foundation.sql:492`). Field policies are not enforced at runtime.
- **D46 (medium).** Restricted `crm_notes` trust a global `profiles.role`, so an admin anywhere who is staff here can read them (`crm_notes.sql:48-61`).
- **D47 (medium).** Missionaries see every activity on their donors; activities are written with no author; reads cap at 2,000 rows (`donors.ts:452`, `:532-541`; `donor.ts:136-142`).
- **D48 (medium, latent).** Every legacy staff member was backfilled with the `member_care` role (`20260226113000:108-110`).
- **D49 (low).** Care activities are filtered with a case-sensitive keyword regex (`relationships/model.ts:23-24`), and the notes list loads every note into memory (`notes/service.ts:89-103`).
- **D50.** Phase 9's target design has no occurrence date (only `created_at`) and no interaction types (`phase-09:637-640`, `:788-797`), contrary to Phase 27 (`context.md:95-99`, `:147`). It does have `author_name_snapshot` and `standard`/`restricted` visibility.
- **D51.** Phase 30's adapter list (`owner-constraints.md:389-392`; `roadmap.md:4367`) names no notes, interactions or communications. The roadmap also says "Do not promise … lossless transformation of unknown data" (`:4395`). Q14 keeps that promise bounded to what the source can export.

## 6. Counsel questions (before the first real Switch that includes these families)

1. Under Washington's MHMDA, is importing donor-health notes "collection" that needs consent? Are missionaries "acting in an employment context"?
2. Maryland's "strictly necessary" test for sensitive data, including religious belief.
3. Does the FCRA reach volunteer and missionary screening? May imported reports be destroyed at the Switch?
4. Does GDPR Art. 9(2)(d) cover supporters who are not members? Is the UK safeguarding condition enough for safeguarding records?
5. Retention for care, counselling and safeguarding records in each jurisdiction, and who owns counsellors' notes.
6. Québec Law 25 impact assessment before a Switch; Alberta PIPA for religious societies.
7. Withholding confidential references from their subjects in the US and Canada.

## 7. Rejected alternatives

| Alternative                                               | Why rejected                                                                                        |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| C as literally worded (closest general record)            | Breaks Phase 38, 9, 28, 41 and 29 owner rules; exposes care and references through today's code     |
| A (everything stays behind)                               | Staff lose working history; care and applications sit in an ungoverned export                       |
| B (notes only; the rest stays behind)                     | Leaves care and applications in custody with no governed home or retention                          |
| A per-note restricted flag or ACLs                        | Proven leaky and complex (Salesforce, Rock)                                                         |
| Content or AI classification                              | Breaks Q11 and Phase 38; unreliable                                                                 |
| Recreating source users as authors                        | Wrong attribution; ghost accounts                                                                   |
| Live tasks from imported open tasks                       | Floods stale tasks and reminders; outward effects                                                   |
| Per-person newsletter, open and click history             | About 10⁷ rows; opens and clicks are advisory, short-lived signals (Phase 6) that Q9 refuses to use |
| Using today's public buckets or a third-party scanner     | Public exposure; data leaves Asym                                                                   |
| A Phase 30 temporary care or applications store           | Duplicates owner homes; ungoverned                                                                  |
| Break-the-glass, or banners saying a sealed record exists | Small ministries can't staff the review; banners disclose existence                                 |
| Auto-delete retention timers                              | Safeguarding records must not auto-delete; retention varies 1–75 years                              |
