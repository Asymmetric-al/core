# ADR-0034: Evidence-qualified renderer and canonical PDF profiles

**Status:** Accepted (founder rulings, Phase 18 grill session — D3, D4)

> Full record:
> `docs/prds/sitestacker-parity/phase-18-receipt-pdf-template-system.md`
> (ratified decisions D3 and D4).

## Context

An attractive preview or an existing adapter does not prove that a renderer can
produce legally complete, accessible, archival, deterministic, secure, and
operationally reliable PDFs. Running two production engines or switching engines
after a request freezes would make pagination, tags, hashes, and historical
evidence depend on an outage path.

Users also should not see an “accessible copy,” “archive copy,” “portal copy,”
and “delivery copy” of the same document. Accessibility and required archival
conformance are properties of the one canonical recipient-usable artifact.

## Decision

Select a renderer through one pre-registered, production-shaped evidence contest
that may yield **one exact production winner or no winner**. The Prince family is
the default hypothesis, Typst 0.15.1 is the sole challenger, and Chromium is a
layout-preview and control baseline only. Candidate family, exact build and
deployment mode, fonts, assets, options, validators, corpus, budgets, hard gates,
scoring, reviewers, tie-breakers, and stop conditions are frozen and hashed
before output is judged.

The contest uses separate open-development and held-back synthetic nonprofit
corpora. Hard gates precede scoring and cover protected-fact completeness,
one-page and 100-plus-page layout, Unicode/RTL/CJK and missing-glyph behavior,
PDF semantics and assistive-technology use, archival conformance, sandbox and
resource isolation, deterministic evidence, failure recovery, throughput,
provider security/privacy, and staff-facing proof usability. A failed or unknown
hard gate cannot be waived after results are known. If neither finalist passes,
official production rendering remains dark.

Run exactly one winner behind one narrow Asym renderer contract. The losing
runtime is not shipped. An outage queues or fails the frozen request truthfully;
it does not invoke a different engine. A renderer upgrade is a compatibility
event that reruns the corpus, preserves the prior qualified deployment for a
bounded rollback, and requires a new publication when output behavior changes
materially.

Each human-facing publication produces exactly one canonical PDF under one of
two code-owned policies selected by the Document Purpose Contract:

- `accessible-v1`: PDF 1.7 plus PDF/UA-1 and applicable WCAG 2.2 AA outcomes;
- `accessible-archive-v1`: all `accessible-v1` requirements plus PDF/A-2a.

Tenants, templates, callers, and providers cannot choose or downgrade the
policy. Phase 18 initially supports no other output profile.

Finalization order is fixed: freeze all inputs; render; perform every required
byte-changing finalization; validate the exact final bytes; run semantic and
product accessibility checks; calculate digest and length; store privately;
read back and verify; atomically promote; then make only those exact bytes
available. No byte-changing operation occurs after validation and hashing.

## Consequences

- Chromium preview is clearly labeled as a layout approximation and cannot
  authorize official output.
- Machine validation runs on every recipient artifact; qualified human and
  assistive-technology review covers each purpose/template corpus and material
  renderer, font, layout, or profile change.
- A lost copy, download, print, or delivery retry returns the stored bytes. A
  fresh render cannot impersonate historical evidence.
- PDF/A does not determine retention, and file-level encryption cannot create a
  peer archival rendition. Access security belongs to private custody and the
  authorized delivery boundary.
- Renderer selection remains explicitly unresolved until the contest evidence
  names a winner. Documentation and implementation must not silently promote
  the current adapter or default hypothesis.
