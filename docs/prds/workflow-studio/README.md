# Workflow Studio program contracts

Integrated 2026-09-22 for AL-1892 from the user-supplied complete roadmap. This is a planning contract, not implemented/qualified/activated product evidence. [Document authority](../../ai/document-authority.md) and the exact accepted source owners remain binding. The [integration guide](../program-roadmap/integration-guide.md) reconciles the original proposals; the [immutable source packet](../program-roadmap/source-2026-09-22/README.md) preserves original bytes and dated research.

Read the [domain glossary](CONTEXT.md) for precise terms.

## Read and implement

1. Read [scope and decisions](00-scope-and-decisions.md), [product experience](01-product-and-experience.md), [language](02-workflow-language.md), [runtime](03-runtime-and-recovery.md), [data/API contracts](04-data-and-api-contracts.md), and [security/source boundaries](05-security-and-domain-boundaries.md).
2. Use [release and acceptance](06-release-and-acceptance.md), [recipe catalog](07-core-workflow-catalog.md), and [binding contracts](08-blueprints-and-binding-contracts.md) for the work in scope.
3. Follow the [effective implementation backlog](09-implementation-backlog.md), [acceptance scenarios](10-acceptance-scenarios.md), and [open qualification decisions](12-owner-bindings-and-decisions.md). [Research](11-research-and-repository-evidence.md) is dated provenance, not current certification.
4. Implement only through the [active OpenSpec change](../../../openspec/changes/add-workflow-studio-program-contracts/proposal.md) and its generated future tasks. Publishing this package checks no implementation task.

## Ownership and authoring

| Checkpoint   | Delivery owner       | Recipes | Recipe tests |
| ------------ | -------------------- | ------: | -----------: |
| CORE         | Phase 34             |      57 |          171 |
| MOBILIZATION | Phase 41             |      12 |           36 |
| GIVING       | Phase 35             |      15 |           45 |
| EVENTS       | Phase 37             |       3 |            9 |
| CARE         | Phase 38             |       9 |           27 |
| FULL         | Evidence rollup only |      96 |          288 |

The 64 cross-cutting scenarios are additional to the 288 recipe tests: **352 specified scenarios total**. CORE proves shared obligations with real non-mobilization sources; exact domain-specific cases close under their source checkpoint. A source-specific test is not replaced by the generic proof. FULL, downstream packs and Phase 42 never gate CORE backwards. Optional Phase 43/44 bindings do not gate it either.

Hand-authored chapters 00–06, 08, 11–12 govern detailed product/source behavior. `contracts/recipe-catalog.json` owns the 96 recipe records; `contracts/delivery-plan.json` owns the effective split of all 26 stable WS identifiers and dependency graph; `verification/acceptance-scenarios.json` owns the 352 scenario records; `contracts/source-contract-register.json` owns unresolved binding inventory. Their generated chapters 07/09/10 and OpenSpec tasks/spec are projections maintained by `tools/render.py`. Reconcile a meaning change across its owning prose and machine record together; no generated view independently decides authority.

The schema/blueprint/form files are candidate structural contracts and inert fixtures. Every original field, recipe, scenario and WS identifier is retained; delivery metadata and explicit owner amendments resolve the original all-program allocation. D01–D18 remain local source-decision labels, not Core ADR numbers. Source-contract aliases and `requiredCapabilities` labels are not existing services, feature flags, production grants or certified adapters.

Run `python3 docs/prds/workflow-studio/tools/render.py --check` and `python3 docs/prds/workflow-studio/tools/verify.py` from the repository root. These checks prove documentation coverage and consistency only; they do not execute any supplied script or certify product behavior.
