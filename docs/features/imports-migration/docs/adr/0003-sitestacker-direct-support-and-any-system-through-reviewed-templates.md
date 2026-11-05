# ADR-IM-003: SiteStacker is the only directly supported source; any other system moves through reviewed templates

**Status:** Accepted 2026-11-02 — ratified by the founder in the Phase 30 grill (Q3). Record: `docs/features/imports-migration/grill/decision-log.md` §1 Q3. Amends the terminology of ADR-IM-001: a "SiteStacker Switch" is a Switch using the SiteStacker source profile. Amended by ADR-IM-009 (2026-11-02, consent columns become permission only through adoption). Amended by ADR-IM-011 (2026-11-03, how columns are matched at upload). Amended by ADR-IM-016 (2026-11-03, custom fields and collections family).

## Context

The roadmap requires a SiteStacker migration kit (`roadmap.md:4369`, `:4403`) and asks for import templates generated from each ministry's field catalog with remembered mappings (`:4347`). Ministries that might switch to Asym also run Bloomerang, Virtuous, Salesforce, Raiser's Edge, DonorPerfect, Neon, CiviCRM, Planning Center or spreadsheets, and their export shapes differ widely and are often poorly documented. Q2 made every "supported" claim depend on a design partner's real export. Phase 30 must already build source-neutral machinery for the SiteStacker kit, the Phase 28 missionary self-import and Phase 21 opening balances. Phase 11's Import Template Descriptor (#660) covers custom fields only.

## Decision

The first release has three tiers. **Direct support**: SiteStacker only, through its self-serve exports, an Asym export checklist and an omissions sheet, under the Q2 status ladder. **Reviewed transformation**: any other system or spreadsheet can fully move through per-Tenant import templates (Parties and households; contact points with consent and adverse-evidence columns; relationships; custom fields; giving history with reversals, soft credits and tributes where owners allow; recurring evidence), mapping its own export's columns at upload, under the unchanged Q1 switch model. Template rules: a stable source ID on every row (ministry-assigned if the old system has none; rows without one are blocked); text-typed XLSX preferred, with validation for mangled IDs and ambiguous dates; a declared source system and instance on the Switch; level-2 reconciliation against the old system's own totals captured independently of the templates; a generic readiness census and surface checklist. The template profile follows Q2's evidence classes and status ladder; Asym's tests qualify the template format, never a vendor. **Unsupported**: a visible exclusion with a reason. SiteStacker data with no self-serve export is carried when the ministry can obtain it under the same gates, otherwise excluded with a declared coverage start. No named vendor profiles, API pulls or TntConnect/MPDX staff imports in v1.

## Considered options

- **SiteStacker only (A):** rejected; it would block every non-SiteStacker ministry although the source-neutral engine would exist.
- **SiteStacker plus one named vendor profile (C):** rejected for now; it guesses a vendor without a design partner or a real export. Named profiles are added later, one at a time, each with its own design partner.

## Consequences

- Data Tools has two starting points (SiteStacker migration; bring data from another system), and every import screen shows its tier.
- Money owners must publish template descriptors for giving history, reversals, soft credits and tributes, and recurring evidence (decision-log O21).
- Who operates a switch (F18) matters more, because template switches will often need a helper.
- No screen names a vendor as supported; template guidance may describe vendor exports as research input only.
