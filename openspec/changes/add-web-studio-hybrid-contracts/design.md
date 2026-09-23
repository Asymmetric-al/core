## Context

The full reconciled design lives in [the Phase 42 package](../../../docs/prds/web-studio-hybrid/README.md). The package preserves every supplied HW scenario, native automation and work-package identity while resolving the original source graph's hidden Git dependency for visual publication.

## Goals / Non-Goals

One canonical CMS document and existing publication authority support visual, conventional source and mixed work. This adds no Workflow Studio engine, raw Payload product interface, runtime source evaluator, hosted IDE prerequisite or independent public serving head.

## Decisions

- [HA-A1–HA-A4](../../../docs/prds/web-studio-hybrid/decisions.md) record the exact bounded successor scope and qualification gates.
- [Architecture](../../../docs/prds/web-studio-hybrid/design.md), [data/transactions](../../../docs/prds/web-studio-hybrid/data-and-api-contracts.md) and [state machines](../../../docs/prds/web-studio-hybrid/state-machines-and-protocols.md) retain provider-neutral ports and the private admin Payload adapter.
- [Source/SDK](../../../docs/prds/web-studio-hybrid/presentation-sdk-and-source.md), [preview/release](../../../docs/prds/web-studio-hybrid/preview-and-release.md) and [security](../../../docs/prds/web-studio-hybrid/security.md) separate untrusted execution, admitted first-party rendering, deployment and Site activation.
- [Checkpoint dependencies](../../../docs/prds/web-studio-hybrid/implementation-plan.md) separate WEB-VISUAL, WEB-SOURCE and WEB-HYBRID; optional Workflow Studio never gates native CMS behavior.

## Risks / Trade-offs

- Cross-provider calls cannot prove save atomicity → Q02 requires one physical Postgres transaction and fault evidence.
- Puck's internal viewport is not isolation → qualify the whole composer origin and restricted bridge under Q03.
- Source ownership is not safe execution or licensing → independent D9 admission, retained evidence and exact rights/maintainer gates.
- New runtime code can require application deployment → deploy exact admitted registry versions without activating a Site or rebuilding on ordinary edits.
- Research tests can look complete → structural checks are explicitly separate from C/D/B/O/U runtime evidence and all three checkpoint exits.

## Migration Plan

Follow [adoption/cutover](../../../docs/prds/web-studio-hybrid/adoption-map.md): census reached data and alternate writers, qualify readers before writers, retain v1/history, apply no-write plans as authorized private successors and switch one writer only after real proof. Pause new authoring/source intake independently of safe existing operation. Restore through the owning current-content successor rather than a database rewind or raw-Admin fallback.
