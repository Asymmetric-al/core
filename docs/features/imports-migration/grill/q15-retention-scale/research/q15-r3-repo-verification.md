# Q15 R3: Repository verification of Option B (F11)

This is read-only research from 2026-11-03 on develop `629cb71dc`. It extends r1 and does not repeat it. Abbreviations:

- `P29C` and `P29FB`: Phase 29 from the unmerged PR #2430 head `1483a349` (`custody-and-integration.md`, `founder-brief.txt`)
- `DL`: the decision log
- `P1M`: Phase 1 ownership matrix
- `P3`, `P12`, `P13`, `P16`: the phase PRDs
- `REL`: Phase 28 `relationships.md`
- `CTX`: imports `CONTEXT.md`
- `OC`: `owner-constraints.md`

## 1. ADR-0038 (Phase 18 D14)

- **Scope.** ADR-0038 covers Phase 18 only. It "remains the Phase 18 generated-document records decision and the architectural precedent … does not broaden this ADR into a platform-wide semantic owner" (`:146-151`). Phase 30 is bound only by analogy, and Phase 29 restates these rules for files.
- **Rules that carry over:**
  - "Access, use, retention, hold, and disposal are independent axes" (`:46`).
  - Holds "never auto-release" (`:52-54`).
  - Disposal follows a fixed sequence: "restrict access; observe the bounded safety window; … no-hold compare-and-set; destroy … await or suppress immutable backup copies; verify" (`:69-73`).
  - A restore "replays the forward-only suppression journal" (`:73-74`).
  - Disposal must be "proven on the actual architecture before irreversible disposal can launch" (`:132-134`).
- **Correction to r1.** `:49-50` reads "An exact issued PDF … is never redacted and represented as the same artifact". It is about PDFs only. The direct file rule is in Phase 29: "a rebuilt substitute cannot be labeled the same signed/issued/received original" (`P29C:224`). The erasure rewrite must therefore be a **successor artifact**.
- **Canada.** The in-Canada rule applies only to "An exact Canadian issuer" (`:91-112`) and is "absent for nonparticipants" (`:88-89`). Switch exports are out of scope.
- **Digests.** Hashes are excluded only from the _disposal proof_ (`:80-81`). Phase 16 keeps "references/hashes" and "cryptographic provenance" after raw expiry (`P16:2548`, `:2550`). Phase 29 records the "whole-ZIP hash/length" (`P29C:148`).
  - **No conflict**, provided the disposal receipt carries no digest, filename or path.
  - A keyed-hash erasure list is not a proof, but it is pseudonymous personal data (see §4).

## 2. Ratified clauses that depend on raw files

- **Q1 1(b), Q13 7 and Q14 9 need the bytes.**
  - Q1 1(b): "importable later only from the retained final manifest" (`DL:41`).
  - Q13 7: the same promise (`:662`, `:671`).
  - Q14 9: files "wait in the retained final manifest in Phase 29 custody" (`:766`).

  None has an end date, so B must amend all three.

- **Q1 5 needs no bytes.** A replay supplies the bytes again, and recognition needs only the digests plus the mapping version (`DL:45`).
- **Q1 9, 10 and 12 need no bytes.**
- **Q4 needs no bytes.** The receipt number and date are written into the Phase 7 fact (`DL:136`), and "Asym takes no custody of previous-system tax documents" (`:152`).
- **Q8 is ambiguous.** SiteStacker is switched off only after "its final export in custody" (`DL:356`):
  - that export is a later one than the post-boundary manifest (`CTX:93`: "Avoid: the final export (as one file)");
  - "custody" does not say whose.
- **Q9 and O42 are at risk.** Q9 copies the evidence onto the permission: "source system, list, original dates, IP and wording … attestation" (`DL:411`). O42 says only "evidence reference" (`:920`).
  - If that reference points into the file, disposal destroys proof of consent.
  - Phase 16 keeps consent evidence seven years (`P16:2548`).
- **Q13 12 may need a new file.** Corrections are "re-adopted from the corrected source" (`DL:705`), and a corrected source has different bytes.
- **Q14 11 depends on retained files.** It says "Retained manifests support per-person erasure", "except under a recorded legal hold" (`DL:774-776`).
- **Q12 8 keeps values, not files.** It needs stored prior values (`DL:604`). The owner text asks for "time-boxed" undo (`OC:378-380`) but gives no window.

## 3. Phase 29 rules and the download step

- **Retention clocks.** Phase 29 sets "No universal number of years … or unconditional retain-forever fallback" (`P29C:176`), and says "Do not … restart a retention clock on download" (`P29FB:289`).
- **Capacity.** Derived copies follow their own class rules (`:182`). "Staging, candidates, orphans and held copies count against capacity" (`:153`).
- **Unmeasured limits.** "Unknown limits block that profile" (`:400`).
- **Encrypted files.** An encrypted input is a distinct non-clean outcome (`:70`).
- **Backups.** "A database backup excludes any object bytes it does not actually contain." A restore must reconcile disposition first (`:220-223`).
- **Bearer links (D5).** The ban covers _strict private purposes_: "current requester-authorized, non-public/non-cacheable application retrieval and forbid reusable provider bearer URLs. A reference link still requiring authorization is not a bearer grant" (`:116`).
  - Downloads are allowed; a reusable Supabase signed URL is not.
  - Eve already uses `createSignedUrl(…, 60)` (`packages/api/src/eve/retention/control.ts:175`).
  - O64's "short-lived signed URLs" (`DL:942`) contradicts D5's resolution, "Phase 29 governs" (`:826`).
- **Download is not custody.** "A browser download … never proves destination custody or authorizes source disposal" (`:154`; also `:238`).

**Implication.** The sign-off step can only be an attestation. Disposal follows the schedule, never the download.

## 4. Phase 3 erasure model

- **No erasure feature exists.** Erasure is "seam reserved, not built" (`P3:321`). Phase 38 owns erasure requests (`P1M:783-786`).
- **Suppressions store plain email.** `email_suppressions` stores `email TEXT NOT NULL`, cascading with the tenant (`20260402090000_…backfill.sql:86-95`). It is "the email suppression authority" (`P3:401-402`).
- **Erasure keeps money facts.**
  - Phase 13: "GDPR-erased donors remain pseudonymized" (`P13:746-747`).
  - Q13: "removes their identity but keeps the money facts" (`DL:708`).
- **An erasure list already exists.** The Source Record Binding "blocks re-creation after erasure" and holds the plain source ID (`CTX:96`).
- **Keyed-hash precedent, with limits:**
  - Phase 26 uses "tenant-scoped keyed hashes/IDs" (`phase-26-…-a.md:4617`), but warns: "require access/retention/rotation rules; do not introduce an unreviewed permanent email hash warehouse" (`phase26-d28-data-review.md:88`).
  - Phase 12 D25: "no blind index on restricted-identity fields" (`P12:1656`).

**Verdict.** A keyed-hash list is redundant wherever a source ID exists. If kept, it must be tenant-scoped, rotatable and bounded.

## 5. Tenant closure

- There is no platform tenant-closure policy. Only ADR-0038's gate for Canadian issuers exists.
- Phase 12 offers a "Tenant External Copy Assertion without granting transfer or disposal authority" (`P12:2617-2618`). It also offers an offboarding snapshot (`:2615`).
- Download, assertion, "Asym-held retention, legal hold, termination" are "independent immutable facts", and Asym stays responsible for copies "in its custody" (`P1M:788-793`).
- Tenant foreign keys cascade database rows but not Storage objects, which become orphans. Q6 destroys Practice copies at "agreement end" (`DL:270`); B is silent.

## 6. Residency

- No production region is recorded in `docs/ops/environments.md` or `supabase/config.toml`.
- Q2 6(6) requires the region to be "recorded for the agreement" (`DL:78`). Q6 puts the Practice environment "in production's region" (`DL:250`).
- Phase 12 D21 says restricted data has "no silent default … placement is a required decision … excluded from out-of-region backups" (`P12:1655`). Switch files are restricted by default (`DL:77`), so this applies.

## 7. Who may download a full export

- **Restricted floor.** Uncleared users see restricted people "only by alias" (`DL:203`). Uploads come only from ministry members (`:204`).
- **Asym staff.** Asym specialists never download (`:210`). MFA is named only for them (`:206`).
- **Egress ownership.** Phases 3, 10 and 12 own "step-up, and egress audit" (`P1M:778-780`). Exports are projection-based (`P3:281`), and raw bytes cannot be projected.
- **Restricted exports:**
  - "bulk contact/export across a restricted set is blocked outright with justification + audit" (`P12:1641`);
  - "hard-deny for … restricted export" (`:1663`).
- **No implementation.** There is no MFA or step-up code, only a placeholder: "Enforce MFA …" (`apps/admin/app/(app)/admin/page-client.tsx:97-99`).

## 8. Platform limits

- **Storage caps.** Local storage allows 50 MiB (`supabase/config.toml:106`). No migration sets a per-bucket `file_size_limit`.
- **Uploads.** No TUS or resumable code exists. The general cap is 10 MB (`packages/config/constants.ts:57`), and no `maxDuration` is set.
- **Function duration.** ADR-0177: "a high `maxDuration` is not a capacity strategy" (`:172-178`). Streaming a 2 GB file through an application route conflicts with this.
- **Inngest.**
  - Version 4.25.0 is used only in `packages/api` (`package.json:204`).
  - A run allows 1,000 steps (`SKILL.md:46`), so 20 million rows needs at least 20,000 rows per step, or child runs.
  - Per-tenant concurrency has a precedent (`inbound-email-processing.ts:53`).
- **D17 XLSX bounds.** D17 bounds the file at 10 MiB and the **decompressed** package at 128 MiB (`REL:473`). B's "XLSX ≤50 MB" does not say which it bounds.

## 9. Everyday imports

- **Owner text.** It says only "time-boxed batch undo with before-image capture" (`OC:378-380`). Q12 sets no window.
- **D17 clocks.** The 7-day window and 24-hour purge are ratified (`REL:497-501`) but scoped: "do not reuse those numbers" (`:842`).
- **They are not implemented.** No import tables or purge cron exist. The only expiry lifecycle in code is Eve's (`20260718022535_…:58-69`).

## Conflicts with Option B as worded

1. **"No personal data" is false.**
   - Actors are staff personal data.
   - Mappings carry headers that "can name workers, places or programmes" (`DL:74`).
   - "Totals per designation" (`DL:700`) can name restricted workers.
2. **No upper bound.** Switch closed has no cap:
   - the 12 months is "by default" (`DL:46`);
   - the tail is "extended until every open dispute resolves" (`:355`);
   - PAD donors wait "until a PAD rail exists" (`:352`).

   On the default path the file is deleted about 12 months after go-live. At the End-date cap it is about 21 months, and on the dispute or PAD path it is open-ended. "Normally ≤ ~15 months" is true only for the default path.

3. **The "download your copy" step:**
   - A download is not custody (`P29C:154`). Use the Tenant External Copy Assertion instead.
   - A raw whole-file download is a restricted bulk export (`P12:1641`).
   - It cannot use a bearer URL (`P29C:116`).
   - Streaming 2 GB conflicts with ADR-0177.
   - The ministry already holds the bytes it uploaded (`DL:204`). Q14 already relies on digest-only confirmation of ministry-held copies (`DL:767`). Prefer "confirm you hold copies matching these digests", with download only as an audited fallback for cleared users.
4. **Several "final exports".** The manifest is several files (`CTX:91-93`). Q8's switch-off export (`DL:356`) comes after go-live sign-off. Not covered:
   - Legacy Tail Backfill inputs;
   - the 4-weekly returns from kept email-tool lists (Q9 2), which can outlive Switch closed.
5. **Q1 1(b), Q13 7 and Q14 9** must be amended to add "or, after disposal, a digest-matched ministry copy".
6. **Q13 12 corrections** come from a corrected source with different bytes. Limit digest matching to deferred families and replays.
7. **Erasure rewrite.** Deleting a person's rows breaks "keeps the money facts" (`DL:708`) and level-1 totals (`DL:49`).
   - Blank identity fields, and keep money rows and source IDs.
   - The result is a successor artifact (`P29C:224`).
   - Replays must match the recorded original digest.
8. **Staging clock.** "30 days after go-live" ignores the Waiting rows that backfills create after go-live (`DL:46`). Run the clock per run.
9. **Holds are missing.** Q14 has a legal-hold exception (`DL:774`). D17 says "Holds delay physical disposal, not ordinary expiry" (`REL:499`). Every B clock, and the rewrite, must yield to holds.
10. **"Idle".** Count only Switch-progress acts; reads must not reset it (`P29FB:289`; `REL:497`).
11. **Erasure list.** Use an erased mark on the binding (`CTX:96`). A keyed hash should be used only where no source ID exists, and must be bounded.
12. **Unanswered items:**
    - Q14 11's "Review dates … (F11)" (`DL:775`);
    - Q12 before-image windows;
    - unfinished uploads (the D17 precedent is 24 hours, `REL:497`);
    - backup expiry on receipts (Q6 7);
    - agreement end or tenant closure.
13. **Size profile:**
    - The 10 GB must count practice, staging, orphan and successor copies (`P29C:153`).
    - The XLSX limit needs both compressed and expanded bounds.
    - Numbers stay "admitted, not demonstrated" until measured (`P29C:400`; `REL:481`).

## Owner requirement candidates (requests)

- **R1 (Phase 29, extends O19 and O64):** a staff-migration profile with:
  - resumable upload sessions;
  - large-object private delivery with range requests, re-authorization per chunk and no bearer URL;
  - measured limits;
  - capacity counted across all copies;
  - successor-generation rewrite with original-digest lineage;
  - verified disposal and restore suppression.

  Reconcile O64 with D5.

- **R2 (Phases 12 and 3):** a "Switch source copy" egress action (cleared holder, step-up, reason, audit), or none. Reuse the Tenant External Copy Assertion for sign-off.
- **R3 (Phase 12 O42):** permissions carry their evidence by value, never as a pointer into a Switch file.
- **R4 (Phase 38, O67):** an erasure adapter for Phase 30 custody: 30-day rewrite, erased mark on the binding, legal holds honoured, suppression replayed after restore.
- **R5 (Phases 13 and 7):** confirm erasure keeps money rows and source IDs.
- **R6 (Ops):** record the region and backup retention. Make the Phase 12 D21 placement decision for restricted Switch files.
- **R7 (Tenant lifecycle):** at closure, dispose of Switch artifacts, Storage included, after a hold check and an offer to assert copies.
- **R8 (Phases 9, 14 and 38):** set Q14 review-date defaults, or state "owner retention applies".
