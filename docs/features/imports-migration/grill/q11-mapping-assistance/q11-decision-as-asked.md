# Q11 — Mapping assistance and the data boundary: decision as asked and chosen

Founder answer (2026-11-02): **"yes"**, accepting Option A as recommended.

## Options as asked

- **A. Rule-based matching only in v1 (chosen).** Strong matching inside Asym: exact keys, remembered mappings, a list of common header names, fuzzy suggestions, a value-mapping table and a preview. Nothing leaves Asym.
- **B. A plus optional AI from headers only.** It is off by default, limited to staff imports, and runs on the ministry's own AI account. The AI sees header names and Asym's field list, never values.
- **C. AI with sample values, or an importer vendor's AI.**

## Option A as proposed (five parts)

1. **Rule-based column matching.**
   - Templates match exactly, and SiteStacker uses presets.
   - Other files are matched in this order: remembered mappings for that source, then a list of common header names, then fuzzy matches labelled "Suggested — review required".
   - A person confirms every match.
   - A non-empty column left unmatched blocks the plan until it is matched or explicitly left out (a Visible exclusion).
2. **A value-mapping table.**
   - It covers code columns: gift types, payment methods, funds, campaigns and statuses.
   - Each distinct source value is listed with its count and mapped to an Asym option, and the mapping is remembered.
   - Unknown values are rejected by default.
   - Fund names are visible only to cleared members (Q5).
3. **Preview before practice.** A few transformed sample rows are shown inside Asym to the person mapping. Ambiguous dates are flagged, never guessed.
4. **Nothing leaves Asym for mapping.**
   - There is no AI and no embedded importer vendor. Asym builds its own importer in its own UI.
   - Asym staff's own AI tools never process a ministry's real exports, headers or sample values; this answers Q2 clause 4.
   - The missionary self-import stays rule-based.
5. **Measure, then revisit.** The design-partner switch records how columns were matched. If many are mapped by hand, a later founder decision can add B.

## Ratified context

- **Q2:** clause 3(iii) (headers are confidential) and clause 4 (AI on real exports deferred to F6).
- **Q3:** clause 3 ("maps its own export's columns onto template fields at upload (with remembered mappings)"; no vendor presets).
- **Q5:** clause 4 (headers, counts and summaries only until narrowing; fund names restricted) and clause 5 (Asym help access may do mapping).
- **Q6:** clause 3 (the Practice environment refuses AI).
- **Constraints:** C15 (templates from the Phase 11 field catalog; unknown options rejected) and C17 (imported PII never leaves "merely to improve mapping").
- **Earlier owner requirement:** O9 (D10 sequencing, if AI mapping were wanted).
- **Research:** `research/q11-r1-repo-ai-boundary.md`, `research/q11-r2-external-ai-mapping.md`.
