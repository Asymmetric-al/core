# Phase 42 — Web Studio hybrid authoring

Planning contract reconciled on 2026-09-22 under AL-1892 from the user-supplied complete program roadmap. This is implementation planning, not evidence that the application, a dependency cohort, provider, source connection or deployment is qualified.

## Authority and authoring

The [supplied roadmap](../program-roadmap/source-2026-09-22/supplied-roadmap.md), [integration guide](../program-roadmap/integration-guide.md) and preserved original assets establish source provenance. This package is the operative reconciled authoring source. Its explicit Phase 23/24 successor scope is recorded in [adoption](adoption-map.md), [decisions](decisions.md) and [owner contracts](owner-contracts.md). Historical research and source validation remain dated evidence; latest vendor documentation or a file’s newer date does not replace accepted owner intent.

The package retains **48 HW requirements, 96 paired scenarios, 14 additional HA-INT integration cases, 27 HA packages, 18 WF journeys, 12 native AU behaviors and Q01–Q09**. Canonical requirements, tasks, workflows, automations and checkpoints live in `contracts/`; traceability and the declared Markdown/OpenSpec views are synchronized projections, not independent authoring authorities. Run `node docs/prds/web-studio-hybrid/tools/render-package.mjs --write` for the six declared traceability/document views. `tools/verify-package.mjs` checks correspondence without mutation.

## Read in order

1. [Proposal](proposal.md), [decisions](decisions.md), [owner contracts](owner-contracts.md) and [adoption map](adoption-map.md).
2. [Product workflows](workflows.md), [design](design.md), [visual grammar](ux-and-composition.md), [data/API contracts](data-and-api-contracts.md), [state machines](state-machines-and-protocols.md).
3. [SDK and source delivery](presentation-sdk-and-source.md), [preview/release](preview-and-release.md), [native automation](automations.md), [security](security.md).
4. [Full requirements](requirements.md), [all paired scenarios](acceptance-scenarios.md), [integration cases](integration-scenarios.md), [qualification](acceptance-and-qualification.md), [implementation graph](implementation-plan.md).
5. [Adversarial findings](adversarial-findings.md), [dated evidence](evidence.md), [structural references](reference-contracts.md), [reference checks](reference-checks.md), [original validation report](source-validation-report.md).

## Independent release checkpoints

| Checkpoint | Required proof                                                                                                                                                                     | Excluded prerequisite                                                  |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| WEB-VISUAL | Complete real standard-renderer authoring, layouts, media/reuse/locale, acknowledged save, exact preview, publish/schedule, recovery, migration, accessibility and staff usability | Git credentials, custom source/build service, optional Workflow Studio |
| WEB-SOURCE | Conventional fresh-clone development, public SDK, verified capture, isolated build, independent D9 admission, controlled runtime availability, replacement and recovery            | Site activation or a hosted IDE/model account                          |
| WEB-HYBRID | Actual custom redesign through D10 followed by independent staff editing/release/recovery, complete locales and preserved content                                                  | Any inference that source deployment or a green build published a Site |

The native CMS remains usable when Phase 42 is disabled. AU01–AU12 remain native Web behavior when optional Workflow enrollment is disabled. Phase 42 does not depend on Phases 34, 39, 40, 41, 43 or 44; exact source capability gates still apply to their consuming paths. The phase is complete only after all three checkpoint exits and every applicable requirement/scenario proof pass.

## Verification

Run `node docs/prds/web-studio-hybrid/tools/verify-package.mjs`, the repository-pinned strict OpenSpec validation and delta compatibility gate. These prove planning integrity only. All real C/D/B/O/U qualification evidence remains required. The original Python examples are research fixtures and must never be deployed as Core authorization or data adapters.
