# Phase 25 — Donor Dashboard Depth

**Integrated planning status (2026-09-16, AL-1861).** This reconciliation adopts
the Phase 25 contract and its bounded owner amendments together with the
Phase 22–24 predecessor packages. Their original PRs remain open; accepted
planning is distinct from implementation and producer qualification. The
historical publication/source registers retain their exact captures and original
stage language. The [reconciliation manifest](../../../ai/audits/2026-09-16-documentation-reconciliation-sources.json)
identifies source hashes and integrated amendments; the [authority guide](../../../ai/document-authority.md)
governs interpretation. G01 and all actual provider/activation proof remain
outstanding where the contract requires them.

This is the repository package for [AL-1563](https://github.com/Asymmetric-al/core/issues/1563). The founder ratified the product decisions and confirmed the existing testing seams. The active OpenSpec change records intended behavior; neither publication nor merging these documents proves implementation or activation.

## Read and implement in this order

1. [Implementation specification](../phase-25-donor-dashboard-depth.md): scope and 242 independently verifiable stories.
2. [Shared decisions and owner gates](contracts/shared.md), then the applicable [identity](contracts/identity.md), [recurring giving and Wallet](contracts/recurring.md), [financial records](contracts/financial.md) and [experience](contracts/experience.md) contracts: 87 normative sections in total.
3. [Acceptance register](acceptance.md): the generated reading view of every observable outcome and negative boundary from the canonical story records.
4. [Canonical OpenSpec task plan](../../../../openspec/changes/add-donor-dashboard-depth/tasks.md) and [OpenSpec design](../../../../openspec/changes/add-donor-dashboard-depth/design.md): 266 unchecked implementation tasks, sequencing and required qualification. The [PRD task page](implementation-tasks.md) is a pointer only.
5. [Traceability](traceability.md), [source map](source-map.json), [decision log](decision-log.md) and [research inventory](research/README.md): the source and ratification behind each decision, including the final F01–F14 clarifications.

The [local architecture decision](architecture.md), [glossary](glossary.md), [evidence and testing prior art](evidence.md) and [publication record](publication.md) explain the remaining boundaries and provenance. The source map's 1,951 rows include evidence and adoption records; they are not 1,951 separate feature requirements or runtime certifications.

## Authoring and generated views

The `stories` array in [traceability.json](traceability.json) is the sole editable source for each US25 story's actor, requested outcome, benefit, acceptance predicates, question references and contract references. It contains all 242 stories. Acceptance source labels combine each story’s `question_refs` with the exact `P25.FINAL.*` → story mappings already recorded in the same JSON’s `traces` array. These final mappings, including the existing `P25.FINAL.U-ACTION` addendum, are the single source for final-assembly provenance; there is no separately maintained source-reference field. An empty question list is valid only when a mapped final source supplies provenance. The 87 owner-contract sections remain the independently authored domain design rules.

[Acceptance](acceptance.md), the main specification's [User Stories](../phase-25-donor-dashboard-depth.md#user-stories) section and all 242 [OpenSpec story requirements](../../../../openspec/changes/add-donor-dashboard-depth/specs/donor-dashboard-depth/spec.md) are generated projections of those same records. Their complete observable requirements remain available in OpenSpec. Do not edit these projections independently or treat their repeated presentation as separate requirements.

For an authorized story amendment, edit `traceability.json` → `stories`, retaining stable IDs and exact source/contract references. Correct final-assembly provenance in its existing qualified trace-to-story mapping, rather than inventing a question number or editing a generated source label. Regenerate the three views from the repository root:

```sh
bun docs/prds/sitestacker-parity/phase-25-donor-dashboard-depth/tools/render-stories.mjs --write
bun run verify:phase25-spec
```

The [local renderer](tools/render-stories.mjs) defaults to checking without writing; the verification command checks the projections and their complete ID/outcome coverage. It does not execute product behavior or earn a release gate. Follow the existing OpenSpec validation workflow after any intended-contract change.

The [OpenSpec task plan](../../../../openspec/changes/add-donor-dashboard-depth/tasks.md) is the sole authoring location for task definitions and completion state. The PRD pointer and the historical published task appendices carry no separately editable checklist. Original publication hashes continue to identify the published snapshots, not regenerated repository bytes.

## Planning and activation boundaries

Phase 25 retains the existing domain owners and testing frameworks. Complete each producer contract before enabling its consumer. The source-amendment and qualification register in Shared S04–S07 governs prerequisites. Phase 22–24 references retain the pinned source versions from the original publication. AL-1861 reconciles and adopts their planning contracts here; it does not make their unimplemented behavior current. Qualify the exact adopted producer contract and implementation before affected consumer activation.

G01 remains an unresolved supported native Supabase account-linking guarantee. Its exact qualification must pass before affected social sign-in is activated. This package selects no alternate Auth architecture and removes no selected provider.

Historical question options, pending-ratification sentences and research-only restrictions are retained as chronology in the source records. The final contracts and acceptance register contain the ratified execution. Source IDs are qualified by question; identical local IDs from different questions are not interchangeable.

The live 2026-09-16 delivery graph has 88 native implementation issues #1565–#1652 under AL-1563. This reconciliation creates no implementation tickets. The unchecked OpenSpec task list remains the canonical implementation/qualification checklist; the issue graph projects delivery sequencing rather than redefining that contract. Feature code, database changes, provider effects and production activation are outside this PR. The OpenSpec change stays active until implementation is accepted repository reality.
