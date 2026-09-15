# Phase26 publication and reviewed-documentation provenance

This record separates the original [AL-1656 publication](https://github.com/Asymmetric-al/core/issues/1656), its initial repository packaging, and later reviewed documentation amendments in [PR 1657](https://github.com/Asymmetric-al/core/pull/1657). Support remains unimplemented; all 237 implementation/qualification tasks remain unchecked.

## Original publication and initial packaging

The original packet contains **11 volumes and 175 comments**, matched at the recorded September 15 readback to manifest **9503ff46b1f85604d845c62a0045031cd1b43acb0e4b704c38a72ff6bfd205b8**. This PR does not rewrite that packet or its publication plan. Embedded source hashes and line ranges continue to identify their original captures.

Commit [201e696335bd420b377609e63c523546d7a6cc29](https://github.com/Asymmetric-al/core/commit/201e696335bd420b377609e63c523546d7a6cc29) is the immutable initial packaging generation. Its proof covered **768 candidate files before the two provenance records**: 99 formatted and 669 byte-identical, with matching snapshots/readbacks and no unsafe candidate. Prettier 3.8.2 and markdown-it 14.1.1 preserved the qualified Markdown structure, hard breaks, links, list starts, literal code and JSON values. Five deliberate corruptions were rejected. Its 216 scoped guards and exact capture/authored/formatted hashes remain recorded unchanged under **initialPackaging.record** in the [machine provenance register](publication-provenance.json).

That historical formatting proof is not reassigned to the later authoring changes. The original archived Python/text evidence, issue packet, and source-hash fields remain dated evidence. Current repository hashes are recorded separately.

## Reviewed authoring amendments

The following changes reconcile already-ratified scope, shared ownership and documentation locality. They do not reopen D1–D40 or claim product implementation.

- **R01 — Align the Phase26 program status and charter routing with completed ratification/specification while keeping implementation and release proof outstanding.** [Review PRRT_kwDOQ4BXFs6iosVb](https://github.com/Asymmetric-al/core/pull/1657#discussion_r4018616174), [Review PRRT_kwDOQ4BXFs6iot02](https://github.com/Asymmetric-al/core/pull/1657#discussion_r4018625409), [Review PRRT_kwDOQ4BXFs6io-sp](https://github.com/Asymmetric-al/core/pull/1657#discussion_r4018731225)
- **R02 — Replace obsolete Phase26 roadmap alternatives with the actual D1–D40 scope and explicit exclusions; preserve unrelated phases.** [Review PRRT_kwDOQ4BXFs6iosV1](https://github.com/Asymmetric-al/core/pull/1657#discussion_r4018616215)
- **R03 — Name P23 as an activation dependency for the selected Public Guidance and Help/contact/form lanes while preserving Support-owned Internal Staff-guide publication.** [Review PRRT_kwDOQ4BXFs6iosVf](https://github.com/Asymmetric-al/core/pull/1657#discussion_r4018616180)
- **R04 — Extend the standing ownership matrix with bounded Support record families and their shared CRM, personal-preference, authoring, communication, intake and file/custody owners; preserve Phase21 financial Support Assignments.** [Review PRRT_kwDOQ4BXFs6iosVp](https://github.com/Asymmetric-al/core/pull/1657#discussion_r4018616196)
- **R05 — Synchronize the existing native-CRM retirement intent into the durable crm-core specification and explain its use in Support planning, preserving the retirement change and its outstanding cleanup tasks.** [Review PRRT_kwDOQ4BXFs6iosVv](https://github.com/Asymmetric-al/core/pull/1657#discussion_r4018616204)
- **R06 — Rank the Support reading path so governing stories/glossary/requirements/design precede the task queue, derived projection/trace navigation and historical evidence.** [Review PRRT_kwDOQ4BXFs6io5sq](https://github.com/Asymmetric-al/core/pull/1657#discussion_r4018700697)
- **R07 — Consolidate the repeated story-completion instruction into one shared queue preamble while preserving all 237 task identifiers and unchecked status.** [Review PRRT_kwDOQ4BXFs6io5sk](https://github.com/Asymmetric-al/core/pull/1657#discussion_r4018700691)
- **R08 — Label the OpenSpec behavior file as a maintained derived projection and explain its full-contract context; preserve all 217 requirement blocks and 717 acceptance scenarios.** [Review PRRT_kwDOQ4BXFs6io5sc](https://github.com/Asymmetric-al/core/pull/1657#discussion_r4018700680)

The program roadmap, phase map and charter entry now agree on specification readiness and preserve unrelated phase status. The ownership matrix names Support records without changing Phase21 financial Support Assignments. The durable native-CRM synchronization follows its existing owning retirement change; that change stays active and its remaining cleanup/tasks are not marked complete. Public Page guidance and Help/contact/form lanes retain qualified P23 dependencies, while Internal Staff guides keep their Support-owned publication.

The [Support entry point](README.md) now ranks the governing story/glossary/requirement/design material before the implementation queue, derived OpenSpec/trace navigation and evidence. The queue keeps all **237 identifiers and unchecked states**. The derived OpenSpec file keeps all **217 requirement blocks and 717 scenarios byte-for-byte**; only its purpose/maintenance explanation changed. These representations remain synchronized to the governing contract rather than becoming independent product writers.

## Current repository relationship to the published volumes

**Four repository volume representations intentionally differ from their initial packaged versions: proposal, design, tasks and the OpenSpec projection.** Their current bytes must not be described as identical to the original issue packet or as formatting-only changes. The machine register keeps the original published SHA, initial formatted repository SHA, current SHA and exact review reasons for every volume. The other seven volume representations retain their initial packaged bytes and their original formatting proof.

The current PR scope is **775 paths**: 773 content paths plus these two self-excluded provenance files. Five governance paths extend the initial scope: the program charter README, roadmap, phase map, ownership matrix and durable crm-core specification. The register lists every current content hash alongside its initial-packaging or baseline hash and identifies each intentional authoring amendment. Git and the final PR-head audit identify the provenance files themselves, avoiding circular hashes.

Use stable US26/REQ26/AC26 identifiers and the ranked reading path for current navigation. Historical raw hashes and line numbers are capture locators; they are not silently rewritten to describe a later formatted or amended file.

## Validation and release boundary

Per-amendment checks distinguish deliberate source edits from subsequent formatter preservation. They cover program-index scope, matrix row/owner preservation, native-CRM survivor requirements, full task identifiers, the unchanged OpenSpec requirement/scenario corpus, local links and normal formatting/whitespace checks. The initial packaging record retains its original evidence; later review verification is a separate generation.

The PR targets develop and references the specification issue without closing its authority. Normal commit hooks, attribution, pre-push preflight, exact-head CI and eligible approval still apply. Review-thread links identify the addressed feedback, not proof that a review was resolved or approved. Neither parser comparisons, OpenSpec validation nor documentation reconciliation proves API, database/RLS, browser, provider, accessibility, usability or capacity behavior. Documentation rollback does not alter product data or the original published packet.
