# Phase 25 — Donor Dashboard Depth

This is the repository package for [AL-1563](https://github.com/Asymmetric-al/core/issues/1563). The founder ratified the product decisions and confirmed the existing testing seams. The active OpenSpec change records intended behavior; neither publication nor merging these documents proves implementation or activation.

## Read and implement in this order

1. [Implementation specification](../phase-25-donor-dashboard-depth.md): scope and 242 independently verifiable stories.
2. [Shared decisions and owner gates](contracts/shared.md), then the applicable [identity](contracts/identity.md), [recurring giving and Wallet](contracts/recurring.md), [financial records](contracts/financial.md) and [experience](contracts/experience.md) contracts: 87 normative sections in total.
3. [Acceptance register](acceptance.md): the observable outcome and negative boundary for each story.
4. [Implementation tasks](implementation-tasks.md) and [OpenSpec design](../../../../openspec/changes/add-donor-dashboard-depth/design.md): 266 unchecked implementation tasks, sequencing and required qualification.
5. [Traceability](traceability.md), [source map](source-map.json), [decision log](decision-log.md) and [research inventory](research/README.md): the source and ratification behind each decision, including the final F01–F14 clarifications.

The [local architecture decision](architecture.md), [glossary](glossary.md), [evidence and testing prior art](evidence.md) and [publication record](publication.md) explain the remaining boundaries and provenance. The source map's 1,951 rows include evidence and adoption records; they are not 1,951 separate feature requirements or runtime certifications.

## Planning and activation boundaries

Phase 25 retains the existing domain owners and testing frameworks. Complete each producer contract before enabling its consumer. The source-amendment and qualification register in Shared S04–S07 governs prerequisites. Phase 22–24 references identify explicitly proposed predecessor work at pinned source versions; they do not make those unmerged proposals current behavior. Reconcile their final accepted forms before affected implementation and activation.

G01 remains an unresolved supported native Supabase account-linking guarantee. Its exact qualification must pass before affected social sign-in is activated. This package selects no alternate Auth architecture and removes no selected provider.

Historical question options, pending-ratification sentences and research-only restrictions are retained as chronology in the source records. The final contracts and acceptance register contain the ratified execution. Source IDs are qualified by question; identical local IDs from different questions are not interchangeable.

No implementation tickets are created by this documentation PR. AL-1563 remains the specification issue, and the unchecked task list is the future ticket-slicing input. Feature code, database changes, provider effects and production activation are outside this PR. The OpenSpec change stays active until implementation is accepted repository reality.
