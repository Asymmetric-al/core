# Design

## Context

Core distinguishes canonical skills under docs/ai/skills from ecosystem-owned
.agents/skills sources. Sync publishes both into Cursor and Claude mirrors;
verification renders expected output in scratch without changing tracked files.
The implementation baseline is c4d36cb029121641b8882237632d0d6da434049e, which
already replaced the older Payload skill names with public-v4 adapters.

## Goals / Non-Goals

**Goals:** provide the complete reviewed Cloudflare workflow, reproducible source
provenance, preserved Core adaptations and complete installed-skill accounting.

**Non-Goals:** running an audit, changing product code/dependency versions,
adding unrelated upstream pack members, changing global installations or secrets.
The proprietary PDF payload is excluded pending the owner's license review.

## Decisions

- Vendor Cloudflare commit c1c8a8c1471069fb0e188eeaff69b8e8db6564a8 and its
  complete 20-file package. Use a marked Core overlay and a fully managed tree.
- Extend the established GitHub refresh transaction with an immutable commit
  path. Fetch/check out that exact commit with hooks disabled, verify the source
  inventory and ordinary-file entries, then stage, adapt and publish.
- Reuse directory/side-file rollback. Refresh only copies/formats source and
  never executes vendor lifecycle hooks, scripts or tests.
- Preserve the established lock hash conventions. Separate raw upstream
  identifiers from adapted hashes and retain complete per-source audit evidence.
- Keep the twenty newly attributed runtime skills ecosystem-owned. Preserve
  stable aliases, local code fixes, invocation boundaries and overlays through
  persistent sync transforms.
- Retain removed, paid, untraceable and unknown-permission snapshots explicitly.
  Never infer source freshness from a changed hash alone.
- Keep the maintenance log's current inventory separate from dated historical
  entries. Match installed runtime API versions instead of upgrading dependencies.

## Risks / Trade-offs

Upstream guidance can conflict with Core's autonomous TDD, CONTEXT documents,
shared UI, payment contracts or authorization. Review complete source trees and
apply bounded adaptations, with focused structural/behavioral regression checks.
Unexpected source inventory or adaptation drift fails before publication.
The PDF exclusion is proved using immutable full-tree hashes across all mirrors.
