# Complete program roadmap adoption

AL-1892 adopts Conrad's updated roadmap on 2026-09-22. The source was compiled
September 16; its explicit updated product direction governs this adoption,
while detailed accepted producer contracts remain authoritative. This packet
contains planning and acceptance requirements, not a claim of shipped behavior.

## Start here

1. Read the [45-phase roadmap](../sitestacker-parity/roadmap.md) and the exact
   current owner PRDs/OpenSpec/ADRs for the work being built.
2. Read the [integration guide](integration-guide.md),
   [delivery contract](delivery-contract.md) and
   [retained owner obligations](owner-constraints.md). They specify permission,
   source, clock, effect, privacy and recovery boundaries across phases.
3. Use the complete operative packets: [Workflow Studio](../workflow-studio/README.md),
   [hybrid Web Studio](../web-studio-hybrid/README.md),
   [governed SMS](../governed-sms/README.md), and
   [enterprise identity](../enterprise-identity/README.md).
4. Check [GitHub impact](github-impact.md), exact current issue blockers and
   [decision and qualification gates](decisions-and-gates.md) before dispatch.

## What is canonical

| Question                                             | Authoritative artifact                                                                                                             |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Phase numbering, scope, starting floors and priority | Roadmap v3; phases 0–40 retain their numbers/slugs and 41–44 are added                                                             |
| Compact navigation                                   | phases.json and the marked phase-map.md inventory are generated from the roadmap master table and phase headings                   |
| Common process builder and application split         | Workflow Studio effective contracts: 96 recipes, 352 scenarios, 26 stable WS packages with explicit checkpoint slices              |
| Visual/code website successor                        | Hybrid Web effective contracts: 48 HW requirements, 96 paired scenarios, 27 HA packages, 18 WF journeys and 12 AU native behaviors |
| Channel and identity successors                      | SMS 12 work packages/32 scenarios and enterprise identity 12 packages/34 scenarios with explicit profiles and qualification        |
| Existing business facts and authorizations           | Exact source owner contracts, not Studio aliases, roadmap shorthand, reference fixtures or provider SDK behavior                   |
| Original provenance                                  | Hash-verified supplied document and 52 assets in the immutable source directory                                                    |
| Runtime and live behavior                            | Current code, exact environment/provider tests and release evidence; none is inferred from this documentation                      |

The original WS and Web task arrays are provenance. Their unmodified edges
create all-pack and Git-build prerequisites inconsistent with the adopted
delivery model. Use the effective package graphs and complete original stable
IDs; do not dispatch from source-assets task arrays. All 16 workflow blueprints
remain disabled and their symbolic owner bindings unresolved until qualification.

## Reconciliation dispositions

- Source Part I phases 0–26 are orientation. Keep the fuller current owner
  clauses and dependency floors, including Phase 8's independent observability
  core and the accepted finance, permission and publication contracts.
- Part I phases 27–44 are adopted in full in the current roadmap. Detailed
  predecessor owner obligations are retained separately and linked per phase.
  Generic older roadmap questions resolved by the update are retired from
  active requirements; the complete v2 snapshot remains immutable evidence.
- Part II becomes the operative integration guide. Its repository/Tenant
  wording is clarified: no cross-Tenant repository partitioning, but no
  invented one-repository-per-Tenant commercial limit.
- Parts III/IV and their reference contracts become complete Workflow/Web
  packets with conflicting bodies and dependency graphs corrected explicitly.
  HA-A1–HA-A4 retain proposal-local identifiers; they are not new global ADR
  numbers or blanket replacement of Phase 23/24 behavior.
- Part V remains original design provenance. Hosted IDE/OpenCode/BYOK,
  arbitrary customer server execution and marketplaces remain excluded.
- Part VI's 52 assets are extracted byte-for-byte and hash checked. Historical
  manifests also name prose/HTML archive members not supplied as independent
  files; do not fabricate their bytes or claim original archive validation.
- Part VII and dated source research remain evidence, not newly executed
  runtime, database, browser, provider or legal qualification.

## Maintenance and delivery

For phase metadata, edit the canonical master table and matching phase headings
in `docs/prds/sitestacker-parity/roadmap.md`. The repository generator derives
`phases.json` and only the marked inventory table in `phase-map.md`, using pinned
local Prettier. It never edits the roadmap or immutable source captures.

```sh
# Read-only is the default; --check is explicit.
python3 docs/prds/program-roadmap/tools/render-phases.py --check
# After a reviewed canonical phase change, regenerate both projections.
python3 docs/prds/program-roadmap/tools/render-phases.py --write
```

Amend other canonical machine contracts and their declared projections together.
Preserve stable phase, recipe, task, requirement, scenario and issue IDs.
Run `bun run verify:program-roadmap` and package checks, strict current/archive
OpenSpec validation and applicability checks, then normal `ci:preflight` before
publication. No structural result can close an unchecked source/provider gate.

The implementation handoff for any dispatchable slice must name actual source
symbols/versions and scope, authorized commands, expected heads and receipts,
the stable acceptance cases, real adverse-path tests, retained-data migration,
mixed-version behavior, disable/recovery and exact release criteria. A blocked
owner binding is a concrete prerequisite, not permission to invent a fallback.

See the [source manifest](source-2026-09-22/manifest.json),
[source README](source-2026-09-22/README.md),
[dated research](source-research.md), and
[document-authority guide](../../ai/document-authority.md).

## Verified adoption evidence

The [verification record](verification-2026-09-22.json) separates planning
integrity checks, five negative guard probes, normal preflight results and
remaining runtime qualification. The [issue readback](github-amendments-2026-09-22.json)
records seven exact published amendments without changing existing implementation
checkboxes, labels, states or native blockers. PR/CI publication status remains
a current GitHub fact rather than a permanent documentation claim.
