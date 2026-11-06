# ADR-IM-014: Every record family goes to its protected owner home

**Status:** Accepted 2026-11-03. Ratified by the founder in the Phase 30 grill (Q14), after a full ruthless review. Amended by ADR-IM-015 (2026-11-03, retained manifest time-boxed; erasure inside held files; actor-bound download grants).

- **Record:** `docs/features/imports-migration/grill/decision-log.md` §1 Q14.
- **Evidence:** `grill/q14-notes-files-care/` (research r1–r4, `q14-adversarial-review.md`). The review covers edge cases E1–E36, invariants J1–J8, AC1–AC16 and counsel questions.
- **Amends:** ADR-IM-001 (Q1 clause 1(b) families; ministry-held sealed exports).

## Context

The founder chose to bring everything across: notes, interactions, files and photos, applications and care records.

**Owner text:**

- Care notes "are never ordinary CRM notes" (`owner-constraints.md:1255-1257`).
- Phase 9 forbids importing protected notes into anything a missionary sees (`:925`).
- Phase 28 keeps a missionary's private notes from staff (`proof.md:330`).
- Phase 41 sends clinical content to Phase 38.
- Phase 29 blocks the care lane without a Phase 38 policy.
- Phase 30's adapter list names none of these families (`owner-constraints.md:389-392`).
- Phase 9's target has `author_name_snapshot` and `standard`/`restricted` visibility, but no occurrence date or interaction types.

**Current code leaks** (D40–D49):

- Any super_admin reads every tenant's private care notes.
- Care-note images go to a public bucket.
- Donors read staff notes about themselves.
- The `profiles` and `document-uploads` buckets are public, and any signed-in user can upload to them.
- Any staff member reads care activities.
- Missionaries read and edit donor notes.

**Vendor practice:**

- Category-level protection (Planning Center, Rock, MinistryPlatform).
- Sealed care and personnel modules.
- The source author kept as text.
- Facts over documents for applications.
- File quarantine and scanning.

**Known failures:** per-note restriction rules (Salesforce) and note approvals (Rock).

## Decision

1. **Scope.** Everything the source can export comes across, each family into its owner's home, never "the closest record". These are not Minimum Switch Kit families.
2. **Homes:**
   - **Notes and finished interactions:** Phase 9 timeline.
   - **Missionary-authored notes:** the author's private notes (Phase 28).
   - **Care:** Phase 38 sealed care.
   - **Applications:** Phase 41 as facts. Personnel documents go to a sealed personnel area.
   - **Files and photos:** Phase 29 private storage, on their record.
3. **Record tiers.** Staff, Restricted and Sealed (care, personnel), set per source category and never by content.
   - Unknown categories start as Restricted.
   - Records about minors or restricted workers are at least Restricted.
   - A "care, counselling, health or safeguarding?" question per category allows only Sealed or Leave behind.
   - An entry linked to several people takes the strictest tier.
   - Tightening is open to the capability; loosening needs the tier's holder and a reason.
4. **History as recorded.** Entries are read-only and labelled.
   - **Author and date:** the author is kept as text, with the original date and its precision.
   - **Open tasks:** become Open at the Switch, with no reminders.
   - **Clean-up:** exact-key de-duplication only. Long notes are split, never truncated.
5. **Who sees it.** Missionaries and donors see nothing from these families, except a missionary's own notes.
6. **File safety check.** Every file goes through it before storage. Imported files never use today's public buckets. Photos are private and published only with consent.
7. **In-progress applications.** They continue in Asym once Phase 41's import exists. Until then, the ministry finishes or pauses them in the old system.
8. **Email history.** Logged one-to-one emails come across. Per-person newsletter sends, opens and clicks do not.
9. **When a home doesn't exist yet.**
   - Other families wait in the retained final manifest.
   - Care and personnel files are never taken into Asym until their sealed home exists. They stay with the ministry, and Asym records their digest at the boundary.
10. **Safety gate.** No family commits for any ministry until D40–D49 are fixed, the Reader readiness check covers notes, activities and files, and counsel has answered the relevant questions.
11. **Privacy.**
    - Subject access and erasure reach every tier.
    - The ministry sets review dates; safeguarding records are never auto-deleted.
    - Logs carry no content.
    - Asym help access never reaches sealed families.
12. **Corrections.** A wrong tier is tightened, a wrong family is moved to its home, and a whole-run mistake is withdrawn by an audited owner correction run. Nothing is silently deleted.

## Considered options

- **C as literally worded.** Rejected: it breaks owner rules and exposes data.
- **A (leave everything behind) and B (notes only).** Rejected: they leave care and applications in an ungoverned export.
- **Per-note flags or access lists; content or AI classification.** Rejected as leaky or forbidden.
- **Recreating source users; live tasks from imports.** Rejected: they misattribute or flood staff with reminders.
- **Per-person newsletter history.** Rejected: about 10⁷ rows of advisory signals.
- **Public buckets or a third-party scanner.** Rejected: exposure, and data leaving Asym.
- **A temporary Phase 30 store.** Rejected: it duplicates owner homes.
- **Break-the-glass; auto-delete timers.** Rejected as unworkable or unsafe.

## Consequences

- **Owner requirements:**
  - O61 (Phase 9 import);
  - O62 (Phase 38 sealed care);
  - O63 (Phase 28);
  - O64 (Phase 29 lanes);
  - O65 (Phase 41);
  - O66 (Phase 10 tiers);
  - O67 (Phase 3 resolver and finder);
  - O68 (reader readiness);
  - O69 (adapter list).
- **Discrepancies:** D40–D51. D40, D41, D43 and D44 are flagged as time-sensitive, with no tracker action.
- **Sequence:**
  1. Leak fixes.
  2. O69.
  3. O66 and O67.
  4. O61 and O63.
  5. O64.
  6. O62 and O65.
  7. O68.
  8. Counsel's answers.
  9. Practice runs.
  10. Family-by-family activation.
- **Monitors:** M-Q14-1 to M-Q14-8, covering:
  - zero unauthorised tier reads;
  - zero effects from imported tasks;
  - infected files kept in quarantine;
  - scanner freshness;
  - unknown-category share above 30%;
  - tightening above 1% in the first 90 days;
  - file-check time;
  - families waiting for homes.
