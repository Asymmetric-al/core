# ADR-IM-002: Staged source evidence, and no real donor data before an agreement and qualified custody

**Status:** Accepted 2026-11-01 — ratified by the founder in the Phase 30 grill (Q2). Record: `docs/features/imports-migration/grill/decision-log.md` §1 Q2; evidence `grill/q02-evidence-sourcing/`. Approved-environment check amended by ADR-IM-005 (2026-11-02): it also confirms no `super_admin` or role-string escape on person, money, file or import tables. Amended by ADR-IM-006 (2026-11-02, Practice runs and Practice copies). Amended by ADR-IM-011 (2026-11-03, no AI on real exports; clause 4 deferral answered).

## Context

The SiteStacker kit rests on public training articles; no one on the Asym side has seen a real SiteStacker export, and the release gate requires a representative SiteStacker migration while forbidding synthetic source success (`roadmap.md:4395`, `:4403`). Asym has no governed place for a ministry's donor file today: Phase 29 private custody is specified but unbuilt, existing upload code writes to public storage, the repository and its issues are public, and hosted projects are recorded as still carrying an anonymous `public read` policy on donor tables (decision-log D24).

## Decision

Evidence is gathered in stages. Before any agreement, Asym collects only a no-personal-data discovery declaration, exports of marked fake CRM records (after the ministry confirms its automations will not fire) and export header lines, all held as ministry-confidential material outside the public repository. Real donor exports enter Asym only under a signed agreement with data-processing terms, after the ministry is onboarded as its own Tenant, into a qualified Phase 29 staff-migration custody profile in an Approved environment, classified restricted by default, after the retained-state census and a fresh readiness census. Evidence is classed as synthetic, vendor-format sample or representative real export; only the last can move a source profile from Unavailable to Pilot-qualified (a design partner's practice runs pass) and then Supported (that pilot switch goes live with reconciliation signed off and recovery exercised).

## Considered options

- **Real exports early under an evaluation agreement:** rejected; it creates an ungoverned second file store and exposes restricted missionary identities before any control exists.
- **Rely on WMTEK:** rejected as a dependency; asked in parallel only, with the ministry's consent before it is named.
- **Synthetic only until the first customer:** rejected; it turns the first customer's switch into the debugging session, contrary to the "no developer repair" outcome.

## Consequences

- The first ministry is a named design partner on pilot terms; "Supported" is scoped to what was actually exercised, and every later installation still runs header pre-flight and practice runs.
- Today no environment qualifies as Approved; the hosted public-read hazard must be verified closed first.
- Phase 29 needs a staff-migration custody profile distinct from the self-import profile (#2368).
