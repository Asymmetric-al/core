# Q6 — Rehearsal mode: decision as asked and chosen

Founder answer (2026-11-02): **"C. B plus a temporary copy of the ministry's account. think through the edge cases."** The founder then required a full adversarial review before recording (standing standard: not over-engineered, fully functional; excellent UX).

## Options as asked

- **A. Preview each file** — each file checked against what is already in Asym; gifts and relationships cannot be checked until donors are saved.
- **B. Full practice run in the import area** — all files planned together; gifts and relationships point to practice donors by old-system ID; totals, both reconciliation levels, issue list and record previews built from practice data; nothing reaches live records. Needs each area to add a check-without-saving; saving time estimated, not timed; no click-through of the real app.
- **C. B plus a temporary copy of the ministry's account (chosen)** — the practice import really saves into a short-lived copy staff can click through, then the copy is destroyed. Noted costs when asked: needs a way to create and destroy tenants, a test mode covering every email, payment, site and login path, and a second protected copy of restricted data; contradicts Q1 clause 3 ("no target-owner write") and Q2 clause 5(b) ("its own Asym Tenant"); repo vocabulary says sandbox results are not production proof (`CONTEXT.md:5075`).

## B's parts (inherited by C)

1. Every practice run covers the whole switch: one set of exports staged together; gifts, relationships and custom data point to practice donors by old-system ID; per family create/update/skip/review counts and both reconciliation levels against the old system's own totals; a new practice run replaces the previous one.
2. Each Minimum Switch Kit area checks without saving (same acceptance rules, current records, no write; a rolled-back transaction does not count — Phase 23 precedent, ADR-0173 clause 17); the real commit re-checks. Proposed O28 on Phases 4, 9, 11, 13, 14, 16.
3. Spot-check any person: look up any practice donor and see record and giving history as they will appear, marked "Practice — not saved"; Q5 floor applies.
4. The giving pause is estimated (timed staging + saving time from measured per-area save rates on synthetic data + margin), shown at go/no-go; the real switch records the actual time (rewords Q1 clause 4).
5. Recovery: practice runs exercise stopping/resuming jobs; recovering real saves proven on synthetic data and at the design partner's real switch (Q2).
6. (Replaced by C) No temporary account copy in v1.

## What C adds (to be defined by the review)

A temporary, destroyable copy of the ministry's Asym account into which a practice run's plan is actually committed through the owners' import commands, so staff can click through the real app with their data, and commit time and recovery can be timed. The founder asked for edge cases to be thought through.

## Context

- Ratified Q1–Q5: `grill/decision-log.md` §1; glossary `docs/features/imports-migration/CONTEXT.md`; ADRs `docs/features/imports-migration/docs/adr/0001-0005`.
- Research: `research/q06-r1-repo-rehearsal.md` (no owner no-write checks except P23/P21; no staged cross-references; no tenant provisioning, deletion, test flag or tenant-wide dark mode; email send has no tenant gate; Stripe client falls back to the platform live key, `packages/api/src/stripe/tenant-client.ts:64-66`; non-production environments may not hold real exports; capacity facts), `research/q06-r2-external-rehearsal.md` (Planning Center stages in the live account; Salesforce/Blackbaud/Microsoft rehearse in separate real-data copies; regulators accept real-data test copies only with production-equal protection, short life, deletion proof; test-mode defaults: Salesforce "System email only", Stripe sandboxes, Shopify dev stores cannot become production, HubSpot sandbox email limits).
