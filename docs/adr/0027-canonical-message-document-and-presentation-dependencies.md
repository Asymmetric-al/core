# ADR-0027: Canonical message document and immutable presentation dependencies

**Status:** Accepted (founder rulings, Phase 17 grill session — D4, D13, D18)

> Full record: `docs/prds/sitestacker-parity/phase-17-system-messages-template-management.md`
> (ratified decisions D4, D13, and D18).

## Context

Raw HTML, provider templates, multiple editor source formats, and mutable shared
fragments make safe preview, deterministic text output, migration, fallback,
accessibility, and historical explanation brittle. At the same time, tenants
need broad visual and copy freedom without being able to remove protected
meaning or create a second programming language.

## Decision

One versioned Asym-structured document is the canonical content source for each
complete message/locale variant. It contains subject, preheader, semantic body,
locale/direction, governed assets, typed variables/collections, protected fact
and action nodes, and schema/catalog identity. Server-side compilation produces
deterministic HTML and plain text. Browser HTML, raw HTML/CSS/script, React code,
provider-template source, expressions, queries, record paths, and custom nodes
are never authoritative.

One stable compatibility schema and contract-specific allow-list govern nodes,
marks, variables, positions, attributes, collection bounds, null behavior,
escaping, and presentation cases. Ordinary surrounding content is editable by
default. The smallest source-owned semantic units needed for legal, payment,
identity, privacy, or protected-action truth remain locked while staff can edit
permitted copy around them.

Brand Kit and email Role Layout are separate, complete, immutable presentation
dependencies. Organization defaults may be completely customized per permitted
site; runtime resolves one complete site, organization, or compatible system
dependency and never deep-merges fragments. Saved Sections copy content into a
draft on insertion and do not create hidden live fan-out. Publication freezes
source, compiled artifacts, compiler/schema versions, assets, Brand Kit, Role
Layout, protected semantics, and hashes. Existing publications are never
recompiled in place; migrations create reviewable new drafts and preserve
incompatible legacy content read-only with last-known-good artifacts.

## Consequences

- One visual editor and an equivalent accessible outline edit the same document.
- Preview, test, review, publish, and production use the same server compiler
  with synthetic data before recipient-specific preparation.
- Publishing a shared dependency validates its entire affected graph and keeps
  the last-known-good graph active on any failure.
- Schema, paste, link, asset, deterministic output, migration, tenant isolation,
  RTL, accessibility, and representative email-client tests are release blockers.
