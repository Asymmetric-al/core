# Q14 — Notes, activities, files, applications and care records: decision as asked and chosen

Founder answer (2026-11-03): **"C, and think of tough edge cases we need to plan for. Also try and make sure we don't make it needlessly complex."** The founder also required a full, ruthless adversarial review across all 22 categories.

## Options as asked

- **A. Leave them all behind in v1.** Everything stays in the sealed final export in Phase 29 custody as "not yet covered", and each family can be imported later once its owner has a safe place for it.
- **B. Notes and finished activities as staff-only history; the rest stays behind (recommended at the time).** Notes and finished activities go into Phase 9's timeline. Visibility is set by source category: Staff, Restricted, or Leave behind. Care records and notes written by missionaries stay in the export. Open tasks go on a review list. Files, photos and applications stay behind. Email open and click history is not moved.
- **C. Bring everything into the closest Asym record (chosen).** Notes, activities, files, photos, applications and care all come across into general CRM records.

## Facts presented with the question

- **No owner has a safe target for these families.**
  - Phase 9 owns notes and the timeline, but its tables are unbuilt.
  - Phase 38 (member care) has no spec.
  - Phase 41 (applications) has no import path.
  - Phase 29 has no CRM-attachment lane.
  - Phase 30's adapter list does not name notes or activities (`owner-constraints.md:389-392`).
- **The owner rule says care notes are "never ordinary CRM notes"** (`owner-constraints.md:1255-1257`).
- **Current code leaks:**
  - The missionary portal reads and edits donor notes.
  - Any staff member can read member-care activities.
  - The photo and document buckets are publicly readable.
- **Industry practice:**
  - The original author is the field most often lost.
  - Losing a note's visibility flag is the worst failure.
  - Church systems restrict by category.
  - Open tasks need a deliberate choice.
  - Files are often left behind.
  - References and assessments are archived.
  - Open and click history is not moved.
- **SiteStacker's public documentation covers importing these families, not exporting them.**

## Ratified context

- **Q1:** Minimum Switch Kit; clause 1(b) on Visible exclusions; clause 12 on privacy during the tail.
- **Q2:** custody and approved environments.
- **Q3:** templates and SiteStacker presets.
- **Q5:** visibility of raw rows; Asym help access.
- **Q6:** practice runs and copies.
- **Q9:** restrict-only evidence and list facts.
- **Q10:** people first.
- **Q11:** no AI, nothing leaves Asym.
- **Q12:** imports send nothing.
- **Q13:** memos staff-only and passed through Phase 10's firewall; complete or wait.
- **Constraints:** C1, C13 (child sponsorship excluded) and C17.

## Research

- `research/q14-r1-repo-records.md`
- `research/q14-r2-external-records.md`
- `research/q14-r3-owner-and-code-verification.md`
- `research/q14-r4-external-edge-cases-and-law.md`

Research files r3 and r4 were added for the full review.
