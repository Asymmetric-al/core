# Phase 44 — Enterprise Sign-In & Directory Integration

Status: adopted roadmap planning under [AL-1892](https://github.com/Asymmetric-al/core/issues/1892), 2026-09-22; implementation and live qualification remain incomplete.

Read [the complete specification](./specification.md), [owner bindings and qualification gates](./qualification.md), and [the machine-readable delivery map](./delivery.json). The delivery map preserves all 12 source work-package IDs and all 34 acceptance cases. They are local planning IDs; no GitHub child issue or passing product test is implied.

Phase 12 D9/§J and [#686](https://github.com/Asymmetric-al/core/issues/686) remain
the inert sign-in/provisioning generation plus independently required negative
deactivation handling. Phase 44 is the explicit enterprise successor.

The [canonical program roadmap](../sitestacker-parity/roadmap.md) owns phase numbering and delivery allocation. The [integration guide](../program-roadmap/integration-guide.md) controls cross-package interpretation. Existing accepted domain contracts remain authoritative for their own data, permission and source effects. The supplied September 16 research is dated evidence and must be refreshed for the selected provider/profile at implementation and release.

Active implementation contract: [add-enterprise-identity-integration](../../../openspec/changes/add-enterprise-identity-integration/proposal.md). Its 12 requirements trace all 34 original cases; implementation and release tasks remain unchecked.

## Delivery and completeness

Required checkpoints: `ID-SIGNIN`, `ID-DIRECTORY`, `ID-OPERATIONS`. All must pass for the selected profile before the full phase can close. Each package includes its own source contract, real tests, permissions, accessible journey and recovery; the final package cannot supply missing safety retroactively. A shared capability may qualify before the complete checkpoint containing it. Keep foundation work independent of its consuming products.

| Package | Complete outcome                                                                                       | Internal predecessors |
| ------- | ------------------------------------------------------------------------------------------------------ | --------------------- |
| EID-W01 | Qualify current identity/PDP substrate, reserved seams, exact support matrix and adopted successor     | Source foundations    |
| EID-W02 | Verified connection/trust configuration and nonprivileged end-to-end test setup                        | EID-W01               |
| EID-W03 | Shared application-initiated SAML callback/session path and exact provider/tenant binding              | EID-W02               |
| EID-W04 | Reviewed existing-account transition and concurrent login/provisioning identity convergence            | EID-W03               |
| EID-W05 | Scoped SCIM protocol, discovery, Users lifecycle, current source mutation and honest errors            | EID-W01, EID-W02      |
| EID-W06 | Stable group mappings, reviewed permission impact and source-provenanced membership changes            | EID-W05               |
| EID-W07 | Lifecycle-aware deactivation/reactivation, current epoch/stream denial and unmatched-event recovery    | EID-W04, EID-W06      |
| EID-W08 | Optional/required staff enforcement, tested step-up and controlled administrator recovery              | EID-W04, EID-W07      |
| EID-W09 | Complete directory reconciliation, operational freshness and safe mapping-change review                | EID-W06, EID-W07      |
| EID-W10 | Certificate/provider succession, scoped disconnection, privacy and restore controls                    | EID-W08, EID-W09      |
| EID-W11 | Downstream authority propagation through source tasks, workflows, finance and content                  | EID-W07, EID-W10      |
| EID-W12 | Certified provider interoperability, accessibility, fault/load tests, user pilot and operating release | EID-W11               |

The exact additional external prerequisites and case mappings are retained in `delivery.json` and the specification. Resolve the affected entries in `qualification.md` before dispatch; unrelated unresolved profiles need not stop a separately qualified slice. Preserve source acceptance identifiers during ticket slicing and record the published issue ID in an auditable mapping rather than inventing it in prose.

## Source and verification

The [original supplied roadmap](../program-roadmap/source-2026-09-22/supplied-roadmap.md#phase-44) is preserved as provenance. This package exposes its complete phase chapter and exact work-package/case mapping for repository use. Local structural checks prove identifier coverage and an acyclic internal dependency graph only; they do not prove provider interoperability, source implementation, permission enforcement, legal qualification or production capacity.
