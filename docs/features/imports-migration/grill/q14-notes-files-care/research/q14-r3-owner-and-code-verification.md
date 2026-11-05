# Q14-R3 — Owner-rule and current-code verification for Option C

Read-only, develop `629cb71dc`, 2026-11-03. PR #2430 is OPEN and unmerged (head `1483a349`, read locally). `PR2430:c&i`/`rp` = `phase-29-files-documents/custody-and-integration.md`/`records-policies.md` at that head. SQL facts come from migrations only (D13/D24).

**Hypothesis verdict: partly confirmed, partly refuted.**

- Confirmed: literal C breaches operative owner text (Phases 38, 9, 28, 27, 29, 41), and C3 forbids amending it by shorthand.
- Refuted: Phase 9 is not a ready home. Its target lacks occurrence dates, interaction types and an activity actor name.
- Refuted: "wait sealed in custody" is not free. Holding care-bearing bytes needs a Phase 38/29 classification and retention ruling, and a per-person exclusion count discloses who is in counselling.

## 1. Phase 38 care

- "care records sealed by default … care notes are **never** ordinary CRM notes" (`docs/prds/program-roadmap/owner-constraints.md:1255-1257`).
- Screening data "remains in the qualified Phase 38 care source as Restricted with its own retention schedule … never the raw assessment" (`:1271-1275`).
- "DSAR/erasure tooling that correctly excludes data whose disclosure endangers third parties" (`:1277-1278`); "who is in counseling is confidential" (`:1280`); "Care truth is not general CRM" (`:1282`).
- Roadmap: "General CRM notes are not a place for clinical content" (`roadmap.md:5112`); administrators "must not infer sealed work from counts, names or notifications" (`:5116`); "No clinical content in ordinary CRM fields … or AI prompts" (`:5150`); "zero unauthorized existence disclosure across all surfaces" (`:5156`); retention and privacy rules are open (`:5164`).
- No import clause, PRD, OpenSpec or contract; status "phase grooming/qualification required" (`phases.json:276`). The file "preserve[s] existing owner decisions" (`owner-constraints.md:5`); C3: "a superseded clause must itself be edited" (`decision-log.md:721`).

**Verdict:** confirms r1. **C:** "care into general CRM records" needs a Phase 38 amendment that a Q14 answer cannot supply. **Hypothesis:** confirmed for the home; but even an exclusion count per person breaches `:1280`/`:5116`.

## 2. Phase 9 notes and timeline

- "`donor_activities` and the `donors.notes` scalar **die**" (`phase-09-full-crm-depth-relationship-graph.md:576-578`).
- Target `crm_notes`: `author_profile_id NULL … author_name_snapshot`, `visibility CHECK (standard|restricted) DEFAULT 'standard'`, `created_at/updated_at`, **no occurrence date**; "Deferred: attachments → P29 (no schema reservation)" (`:788-797`). Editable: "pin/edit/soft-delete" (`:636`). Two levels only; "A staff-role viewer sees no restricted notes" (`:915`).
- `crm_activity_events`: `actor_kind CHECK (human|system)`, `occurred_at DEFAULT now()`, **no actor name** (`:798-803`). The seeded types `record_created … note_added, merge_completed` (`:637-640`) include no call, meeting, email or visit.
- "P9 owns interaction/encounter identity" (`phase-27-donor-development/context.md:7`), yet Phase 9 defines no interaction table.
- Exclusions: "no `member_care%` relation" (`:913-914`); "party general notes/private activity never appear in missionary-workspace projections … cannot relabel, import, migrate or summarize protected notes" (`:921-926`); "donor-portal projections contain no CRM internals (notes …)" (`:929-930`).
- Provenance carrier is `crm_record_links` (`:846-847`), now "leftover provider links … retired references" (`20260818010000_retire_twenty_crm_runtime.sql:33-34`). None of the Phase 9 tables exist (T11, `:1157`).

**Verdict:** extends r1. **C/hypothesis:** Phase 9 is the right owner, but it must be amended (occurrence date and precision, actor name, interaction types, a source binding) before any note or activity can land without invented dates or authors.

## 3. Phase 27 authors and dates

- "contributor identity, actual occurrence precision … date-only facts SHALL NOT be fabricated into midnight instants … Departed authors remain historically attributed where lawful … editing an old event does not make it new" (`context.md:95`); "current owners do not replace departed authors" (`:99`); "qualified historical coverage, not created-at" (`:147`).
- "Existing private notes, imported history … SHALL NOT be automatically copied, relabeled, migrated or summarized into this lane" (`:31`); imports "count one encounter" (`:164`).

**Verdict:** confirms r1. **C:** imported notes must keep the source author as text and the original date with its precision; Phase 9 cannot do that yet (§2).

## 4. Phase 28 missionary-authored notes

- "Private planning, earlier notes/activity, attachments, referral context and care information are not copied, summarized or relabeled into shared history" (`phase-28-missionary-workspace-depth/relationships.md:104`).
- The organization owns the record: "a bounded organization-owned preparation purpose for Maya's own restricted work" (`owner-reconciliation.md:26-27`). Staff cannot read it: "Staff or a successor SHALL not acquire private preparation through reassignment, previews, exports or support tools" (`proof.md:330-331`; `relationships.md:249`). "never fabricate private preparation authorship" (`phase-28-…depth.md:699`).
- D17 excludes "notes, care/history" (`owner-constraints.md:344-345`).

**Verdict:** sharpens r1. **C:** importing missionary-authored notes as Phase 9 notes inverts ownership: staff gain access and the author loses it (`phase-09:921`). **Hypothesis:** confirmed. No Phase 28 import home exists, so these wait.

## 5. Phase 29 files

- Not on develop; `openspec/contracts/files-documents.md` is absent.
- F38: "Sealed care attachments … No ordinary existence disclosure … missing material owner policy blocks that lane" (`PR2430:c&i:372`).
- F41: "no Party-wide automatic evidence reuse" (`:375`).
- F30: "Qualify target command, allowed mapping/classification/retention, private input/derivative custody" (`:368`).
- No CRM-record attachment row exists among E01–E23 and F30–F44; "the ledger does not invent an attachment feature from a phase title" (`:364`).
- Limits: "Unknown limits block that profile; vendor or avatar limits are not ordinary defaults" (`:400`).
- Scanning: "no … private-file submission to public malware services" (`:73`). #2083 (2026-10-25T03:56Z): "I'm accepting structural validation only … Record it as a departure", for CSV/TSV/TXT only. Attachments, XLSX and ZIP have neither a scanner nor a departure.
- "never fabricate historic assignment, actor, date or approval from an upload timestamp" (`PR2430:rp:98`). Retention is owner-supplied.
- Develop has four buckets, unchanged by later migrations: `profiles` and `document-uploads` (public; SELECT policy with no `TO` role admits anon; any `authenticated` user may INSERT; `20250101000000_init_schema.sql:461-487`), `email-assets` (public, `20260511024000…:5-16`) and `eve-replay-artifacts` (private, `20260718022535…:120-123`).

**Verdict:** confirms r1. **C:** no lane exists for files or photos on CRM records. **Hypothesis:** custody is the right waiting place, but F30 and F38 require a classification and retention owner before care-bearing source bytes may be held.

## 6. Phase 41 applications

- `roadmap.md:5330-5425` has no import clause. "Clinical contents stay with their qualified restricted owner" (`:5360`); prior learning needs "source-approved equivalence and review, not a copied completed task" (`:5368`); "A clinical path stores only the permitted determination/reference from Phase 38" (`:5384`).
- Phase 30: "Additional application targets use Phase 41" (`:4367`).
- Mobilize reads `cloneValue(MOBILIZE_CANDIDATES_SEED)` (`packages/database/collections/admin-workspace.ts:874-882`). No application table exists.

**Verdict:** confirms r1. **C/hypothesis:** an application splits in two. The record goes to Phase 41, and references and assessments go to Phase 38. Neither has an import path, so both wait.

## 7. Phase 6 message history

- Backfill runs "only through proved permanent internal provider-message / preparation identity mappings … Recipient email never serves as durable person-resolution" (`phase-06-shared-communication-event-model.md:177`).
- Opens and clicks are "a separate signal" (`:44-45`), "ephemeral … short/prunable" (`:175`), and "SHALL NOT establish an exchange" (`phase-27…/context.md:134`).

**Verdict:** corrects r1. `outbound-communications.md:1406-1407` sits under "In-product Notifications…" (`:1383`) and governs notification-item migration, not imports. **C:** per-message history and opens/clicks cannot come across.

## 8. Phase 10 photos

- "no way to say which people, fields, notes, or files are sensitive" (`phase-10-sensitive-data-safety.md:26`). Phase 10 then classifies only fields and Party `security_level` (`:95`).
- Location metadata is scrubbed "before they can be published" (`:82`).
- `real_photo_ref` "points into a **non-public storage bucket**, signed URLs only" (`:137`).
- `publish_photo` "(bool + consent evidence)", `do_not_publish` (`:140`).
- An "API/import that sets a restricted level without an alias is **rejected**" (`:97`).
- Children: only "Phase 10 still controls faces, children …" (`phase-22-public-ministry-pages-decision-log.md:1572`). No Phase 10 rule exists. C13 excludes child sponsorship (`decision-log.md:730`).

**Verdict:** confirms r1. **C:** photos imported into today's public buckets would breach `:137`. No note- or file-level sensitivity marker exists to carry a source "confidential" flag.

## 9. Phase 34 tasks

- "Historical imports remain outward-effect-dark" (`roadmap.md:4772`); templates hold "no … run data" (`:4782`); "`historical=true` is explicit" (`workflow-studio/03-runtime-and-recovery.md:25`).
- Phase 9 owns follow-ups: "P9 remains the single native relationship/task/interaction authority" (`phase-09:1344`; `roadmap.md:4101`).

**Verdict:** confirms r1. Q13 clause 8's "no … task" (`decision-log.md:673-677`) covers giving history only. **C:** no owner admits imported open tasks or runs.

## 10. Phase 3 classification

- The `care` class gives `donors.notes` and `donations.notes` Mission Control visible+editable access; donor, missionary, public and export get none (`20261005050728_field_policy_foundation.sql:490-494`, `:110-114`). `donations.status` and `donor_pledges.status` are **also `care`** (`:85-89`, `:210-214`).
- "Static ceiling only; actor/row/purpose floors remain mandatory" (`:19`). Defaults: `care` read-audit and require-reason on, never external (`phase-03-…md:109,150`).
- `loadFieldPolicies` and `projection` have no runtime caller.
- Q11: "Asym uses no AI" (`decision-log.md:539`); `roadmap.md:5150` bars clinical content in AI prompts.

**Verdict:** corrects r1 §7. Phase 3 `care` means "all Mission Control staff, never exported". It does not seal. **C:** defaulting imported text to `care` exposes clinical text to every staff member.

## 11. Current-code leaks

- **(a) Confirmed.** The missionary list selects and returns `notes` (`missionary-portal/donors.ts:440,427`); edits accept and write it (`donor.ts:47,91`). Both use the service-role client scoped by `donors.missionary_id` (`donors.ts:502-509`). This contradicts `field_policy_foundation.sql:492`, which is unenforced.
- **(b) Confirmed, mechanism corrected.** The missionary path reads `donor_activities` through `supabaseAdmin`, so no RLS applies. It filters by `donor_id` only, because the table has no tenant column (`donors.ts:532-541`; `init_schema.sql:222-235`), under a shared 2,000-row cap (`:452`). Writes carry no author (`donor.ts:136-142`).
- **(c) Confirmed at policy level.** Whole-table `GRANT SELECT` on `donors`/`donor_activities` to `authenticated` (`20260625002117:160-162`) plus a donor self-predicate (`:176-181`, `:221-230`), with no column revoke: a linked donor reads `donors.notes` and every activity description about them.
- **(d) Confirmed and worse.** Care activities are readable by `is_super_admin() OR has_staff_membership(tenant_id, NULL)` (`member_care_foundation.sql:177-185`); private notes by `is_super_admin() OR auth.uid() = author_user_id` (`:335-343`). `is_super_admin()` has **no tenant check** (`20260226113000:143-156`; "may act in any existing tenant", `docs/security/function-execute-grants.md:160`), so any super_admin can read private care notes in every tenant. The app shows super_admin everything (`reads/member-care.ts:489-491`). **New:** the backfill made every staff, admin and super_admin `staff_role='member_care'` (`20260226113000:108-110`).
- **(e) Confirmed and widened.** Because the SELECT policy admits anon, objects are listable (inferred). **New:** the "Private care note" and "Care thread update" editors (`PersonnelProfile.tsx:392-396,664-668`) use `LegacyRichTextEditor`, whose default image upload writes into public `document-uploads` and returns a public URL (`legacy-rich-text-editor.tsx:46-66`; image tool enabled, `toolbar.tsx:106-111`).
- **(f) Corrected: not cross-tenant.** SELECT also requires `has_staff_membership(tenant_id, NULL)` (`20260818000000_crm_notes.sql:50-61`). The flaw: the admin test reads the user's single global profile, while memberships are per tenant (`20260226113000:45-62`), so an admin of tenant A who is ordinary staff in tenant B reads B's restricted notes through the Data API.
- **(g) Confirmed; the larger defect is the type gap.** The regex lacks the `i` flag (`admin/crm/relationships/model.ts:23-24`). Only three care types are excluded (`:25-29`); `video_call`, `in_person_visit`, `check_in`, `birthday` and `prayer_request` (`member_care_foundation.sql:79-88`) appear in the general CRM list, with `description` shown (`model.ts:502-516`).

**C:** every leak above would carry imported content. Until each is fixed, nothing may be written to `donors.notes`, `donor_activities`, member-care tables or public buckets.

## 12. Erasure and DSAR

- Phase 3: "DSAR / erasure … seam reserved, not built" (`phase-03-…md:321`). Phase 6 erasure must "scrub any free-text" (`:176`).
- Phase 38 owns care DSAR with third-party exclusion (`owner-constraints.md:1277-1278`; `roadmap.md:5124`). An archive "is not an individual's subject-access … response" (`:1292-1296`).
- No rule covers third-party content in imported notes outside Phase 38, or erasing one person inside an immutable manifest; Q6 covers practice copies only (`decision-log.md:268`).

**Verdict:** extends r1. **Hypothesis:** waiting families have no erasure path inside the retained manifest.

## Corrections to r1

1. `crm_notes` is not cross-tenant; the flaw is "admin anywhere + staff here" (§11f).
2. Phase 3 `care` does not seal; r1 §7's "default to `care`" is unsafe (§10).
3. The Phase 9 target, not only today's table, lacks occurrence dates, an activity actor name and interaction types (§2).
4. `outbound-communications.md:1406-1407` governs notification items (§7).
5. Q13 clause 8 covers gifts only; the Q11 "No AI" clause is `:539`, not `:541`.
6. The missionary activity leak is a service-role bypass, not RLS (§11b).
7. The care-list leak is mainly the five unexcluded types (§11g).
8. Phase 9's provenance carrier `crm_record_links` is retired (§2).

## Owner rules C would breach as literally worded

Phase 38 (`owner-constraints.md:1257`, `:1271-1275`, `:1280`; `roadmap.md:5112`, `:5150`, `:5156`); Phase 9 (`:913`, `:925`, `:929-930`); Phase 28 (`proof.md:330`; `relationships.md:104`); Phase 27 (`context.md:31`, `:95`); Phase 29 (F38 `:372`, `:364`; `phase-09:793`); Phase 30 adapters only after a typed target command (`owner-constraints.md:389-392`) and "Do not promise … lossless transformation of unknown data" (`roadmap.md:4395`); Phase 41 (`:5360`, `:5368`); Phase 10 (`:137`); C3.

## Owner requirement candidates (requests)

1. **Phase 38:**
   - the ministry declares care source types and columns at header level;
   - those columns are never staged, previewed or narrowed (Q5's cleared narrower is a Phase 10 clearance, not care access);
   - bytes are sealed with a Phase 38 retention class and a named custodian;
   - exclusion counts are tenant-level only.
2. **Phase 9:**
   - an import command with occurrence date and precision, a text author or actor, interaction types, a Source Record Binding and an "Imported from" label;
   - read-only, with correction by annotation;
   - `restricted` unless a source category maps lower;
   - imported tasks closed and historical only.
3. **Phase 28:** missionary-authored notes go to the author's restricted preparation or wait. They are never staff-visible.
4. **Phase 29:**
   - a staff-migration input profile (O19) that includes care-bearing columns;
   - a CRM-attachment lane or a stated exclusion;
   - a scanner decision for attachments, XLSX and ZIP;
   - per-person erasure inside retained manifests.
5. **Phase 41:** an import clause (decided applications, in-flight applicants; assessments to Phase 38).
6. **Phase 10:** note- and file-level sensitivity; photo rules for restricted workers and children.
7. **Phase 3:** a wired projection resolver before imported notes reach missionary or donor reads.

## Current-code defects to flag (severity)

1. **Critical:** Any super_admin (a global role) reads every tenant's private care notes (`member_care_foundation.sql:335-343`; `20260226113000:143-156`).
2. **High:** Care-note editor puts images in public, anon-listable `document-uploads` (`PersonnelProfile.tsx:664-668`; `legacy-rich-text-editor.tsx:46-66`).
3. **High:** Any staff member reads care activities; five care types leak into the CRM list (`member_care_foundation.sql:177-185`; `model.ts:25-29,516`).
4. **High:** Donors read their own staff notes and activities through the Data API (`20260625002117:160-182,211-232`).
5. **High:** Public `profiles`/`document-uploads` with uploads from any authenticated user (`init_schema.sql:461-487`).
6. **Medium-High:** Missionary reads and edits `donors.notes`; field policy unenforced (`donor.ts:47,91`; `donors.ts:427,440`).
7. **Medium:** Restricted `crm_notes`: admin anywhere + staff here (`crm_notes.sql:50-61`).
8. **Medium:** Missionary sees all donor activities; writes carry no author; 2,000-row cap (`donors.ts:452,532-541`; `donor.ts:136-142`).
9. **Medium (latent):** All legacy staff backfilled as `member_care` (`20260226113000:108-110`).
10. **Low:** Case-sensitive care regex; unbounded notes load (`model.ts:23-24`; `notes/service.ts:89-103`).

All findings are inferred from SQL and code; none was tested live.
