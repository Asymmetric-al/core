# Testing And Fixtures

> **Superseded implementation authority (Phase 18, 2026-07-21).** This file is
> retained as historical testing evidence only. Current tests must derive from
> the Phase 18 PRD, decision-test traceability matrix, authority manifest,
> renderer qualification protocol, ADRs 0033-0039, and OpenSpec change. Do not
> use old renderer, migration, signed-URL, or dual-runtime expectations.

Testing should be risk-based and practical. It should catch broken renders and tenant leaks without creating a heavyweight framework before the product shape is proven.

## Triggers

Use this doc when adding document jobs, variables, renderers, artifacts, assignments, retention, or cross-app PDF integrations.

## Workflow Steps

1. Add safe fixtures for each standard document job.
2. Cover normal, empty, large, and key edge-case states.
3. Add focused render smoke checks.
4. Add tenant-safety resolver tests.
5. Add structural checks for required text/sections.
6. Add regression coverage for high-risk documents.

## Fixture Requirements

High-risk documents need stronger coverage:

- Donor receipts.
- Annual giving statements.
- Missionary monthly statements.
- Finance/bookkeeping reports.
- Event badges and rosters.
- Legal/audit documents.
- Care/private packets.

Fixture edge cases:

- Split gifts, refunds, anonymous donors, household giving, in-kind gifts, corrected receipts.
- Empty gifts, large gift histories, multi-currency, fiscal/calendar year differences.
- Missing images, private field locations, redacted care data.
- Cancelled/no-show attendees, meal/accessibility needs, minors, waivers.
- Large tables, page breaks, subtotals, appendices.

## Verification Types

- Schema/type checks for template and variable contracts.
- Unit tests for resolvers and tenant safety.
- Render smoke tests for blank output, missing assets, overflow, and table behavior.
- Structural checks for required labels, totals, dates, and legal text.
- Route tests for donor/missionary/admin artifact access boundaries.

## Checklist

- [ ] Tests prove tenant isolation.
- [ ] Fixtures use safe synthetic sample data.
- [ ] Production resolvers are tested with realistic tenant scopes.
- [ ] Render smoke checks cover blank/missing/overflow risks.
- [ ] High-risk documents have regression fixtures.
- [ ] Tests are scoped and not over-engineered.
