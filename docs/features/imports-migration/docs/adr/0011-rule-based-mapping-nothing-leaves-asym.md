# ADR-IM-011: Rule-based mapping; nothing leaves Asym for mapping

**Status:** Accepted 2026-11-03. Ratified by the founder in the Phase 30 grill (Q11). Amended by ADR-IM-013 (2026-11-03, retired designations created by a person from mapping; explicit General Fund mapping). Amended by ADR-IM-016 (2026-11-03, value maps use option IDs; options added deliberately or as archived in a Switch). Amended by ADR-IM-019 (2026-11-04, Eve panel not shown on Data Tools pages in v1; match labels without scores). Amended by ADR-IM-020 (2026-11-04, fund-name rule scoped to Switch real exports; preview visibility per record; only editable fields offered).

- **Record:** `docs/features/imports-migration/grill/decision-log.md` §1 Q11.
- **Evidence:** `grill/q11-mapping-assistance/` (research r1–r2, `q11-adversarial-review.md`).
- **Amends:** ADR-IM-002 (answers Q2 clause 4's deferral on AI) and ADR-IM-003 (how columns are matched at upload).

## Context

**Owner text already sets the boundary:**

- "Deterministic mapping suggestions with tenant-confirmed remembered mappings" (`owner-constraints.md:356-363`).
- "Optional AI is not a prerequisite" (`roadmap.md:4347`).
- Heuristic suggestions are labelled "Suggested — review required" (ADR-0173 item 15).
- Imported PII never leaves its governed boundary "merely to improve mapping" (C17).
- Any AI runs only on the unbuilt shared tenant AI foundation (ADR-0099, D10). Restricted, care and security content never leaves.

**Where mapping is actually needed:** only Q3's "map your export at upload" path. Templates match by design, and SiteStacker uses presets.

**What research shows:**

- **Headers alone get only modest accuracy.** Headers-only AI scores about F1 0.55 and cannot see the values (funds, gift types, codes) that ministries struggle with.
- **Headers can be confidential** (Q2).
- **Vendors send data out.** Some importer vendors send headers and sample rows to third-party models with retention and learn across customers.
- **Donor CRMs don't use AI here.** Donor CRMs and email tools match columns deterministically, with human review.

## Decision

1. **Rule-based column matching only.**
   - Templates match by exact key, and SiteStacker uses presets.
   - Other files are matched first by remembered mappings, then by Asym's Common-header list, then by fuzzy matches labelled "Suggested — review required".
   - A person confirms the header row and every match.
   - An unmatched non-empty column blocks the plan until it is matched or left out. A column left out is recorded as a Visible exclusion.
2. **Matching never crosses ministries.** Remembered mappings are per tenant and source.
   - **Reuse:** a mapping is reused only on an exact header match and is still shown for confirmation.
   - **Versioning:** the plan records the mapping version.
   - **Common-header list:** written by Asym and never learned from ministries' files.
3. **Value-mapping tables** cover code columns. Each value maps to an existing Asym option or is left out, and unknown values are rejected. Creating new options or funds during mapping stays open (F10 and the money owners).
4. **Previews and value lists follow Q5's visibility rules.** Ambiguous dates are flagged, never guessed.
5. **Nothing leaves Asym for mapping.**
   - **No AI, no outside importer:** mapping uses no AI and no hosted or embedded importer service. Asym builds its own importer, while open-source parsing libraries inside Asym stay an engineering choice.
   - **No staff AI tools:** Asym staff's own AI tools never process a ministry's exports, headers, sample values, error output or screenshots.
   - **Missionary self-import:** it stays rule-based.
6. **Measure, then revisit.** Each Switch records its match-method mix and mapping time. The founder revisits optional headers-only AI after the first three template-path Switches, or sooner if most need Asym help to map.

## Considered options

- **Optional AI from headers only in v1 (B).** Rejected for v1. It needs the unbuilt foundation, Phase 10/12/3 amendments and counsel, it gains little accuracy, and it cannot help with values.
- **AI with sample values, or an importer vendor's AI (C).** Rejected. It breaks C17 and the D10 rules.
- **Cross-ministry learning.** Rejected. It would carry one ministry's confidential labels to another.
- **A hosted or embedded importer service.** Rejected. It adds a second processor and conflicts with ADR-0173 item 4 and the UI invariant.

## Consequences

- O9 (sequencing the AI foundation for mapping) is not needed for v1.
- No new owner requirement: Phase 11's field catalog (#650, #660) and the O21 template descriptors are already required.
- For Phase 30 staff imports, this closes the roadmap item on importer build-versus-adopt and mapping-assistance data handling.
- Monitors:
  - The match-method mix and mapping time per Switch.
  - Template-path Switches that need help to map.
  - A zero-tolerance check that no request goes from import processing to non-Asym hosts and no raw content reaches logs or support tools.
