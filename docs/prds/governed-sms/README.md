# Phase 43 — Governed SMS Messaging & Channel Activation

Status: adopted roadmap planning under [AL-1892](https://github.com/Asymmetric-al/core/issues/1892), 2026-09-22; implementation and live qualification remain incomplete.

Read [the complete specification](./specification.md), [owner bindings and qualification gates](./qualification.md), and [the machine-readable delivery map](./delivery.json). The delivery map preserves all 12 source work-package IDs and all 32 acceptance cases. They are local planning IDs; no GitHub child issue or passing product test is implied.

Phase 17 D9 and [#892](https://github.com/Asymmetric-al/core/issues/892) remain
the evidence-only generation. Phase 43 is their explicit activation successor;
old and unqualified profiles remain unable to create SMS work.

The [canonical program roadmap](../sitestacker-parity/roadmap.md) owns phase numbering and delivery allocation. The [integration guide](../program-roadmap/integration-guide.md) controls cross-package interpretation. Existing accepted domain contracts remain authoritative for their own data, permission and source effects. The supplied September 16 research is dated evidence and must be refreshed for the selected provider/profile at implementation and release.

Active implementation contract: [add-governed-sms-channel](../../../openspec/changes/add-governed-sms-channel/proposal.md). Its 12 requirements trace all 32 original cases; implementation and release tasks remain unchecked.

## Delivery and completeness

Required checkpoints: `SMS-CHANNEL`, `SMS-CONVERSATIONS`, `SMS-OUTREACH`. All must pass for the selected profile before the full phase can close. Each package includes its own source contract, real tests, permissions, accessible journey and recovery; the final package cannot supply missing safety retroactively. A shared capability may qualify before the complete checkpoint containing it. Keep foundation work independent of its consuming products.

| Package | Complete outcome                                                                                       | Internal predecessors |
| ------- | ------------------------------------------------------------------------------------------------------ | --------------------- |
| SMS-W01 | Census source contracts, preserve transport-dark generation, adopt exact successor and support profile | Source foundations    |
| SMS-W02 | Governed account/sender setup, exact registration evidence, credential rotation and visible readiness  | SMS-W01               |
| SMS-W03 | Phone-purpose enrollment, withdrawal, re-consent and current eligibility through existing owners       | SMS-W01               |
| SMS-W04 | Authenticated durable ingress and control-keyword handling, including overload protection              | SMS-W02, SMS-W03      |
| SMS-W05 | Exact prepared text, encoding/segment proof, time-window/deadline and budget preflight                 | SMS-W02, SMS-W03      |
| SMS-W06 | Phase 6 dispatch, permanent identities, provider evidence and ambiguity recovery                       | SMS-W04, SMS-W05      |
| SMS-W07 | Qualified source notice through its explicit Phase 17 contract, without workflow dependency            | SMS-W06               |
| SMS-W08 | Complete Support Hub inbound, assignment, safe reply and correspondent lifecycle                       | SMS-W04, SMS-W06      |
| SMS-W09 | Public keyword-to-giving-link with bounded unknown-correspondent requested-response contract           | SMS-W04, SMS-W06      |
| SMS-W10 | Organization campaign send/schedule/stop and source-labelled outcomes                                  | SMS-W06               |
| SMS-W11 | Consent-preserving migration, route replacement, privacy disposition and safe restore                  | SMS-W07, SMS-W10      |
| SMS-W12 | All-profile load, accessibility, user pilot, independent outage monitoring and release evidence        | SMS-W11               |

The exact additional external prerequisites and case mappings are retained in `delivery.json` and the specification. Resolve the affected entries in `qualification.md` before dispatch; unrelated unresolved profiles need not stop a separately qualified slice. Preserve source acceptance identifiers during ticket slicing and record the published issue ID in an auditable mapping rather than inventing it in prose.

## Source and verification

The [original supplied roadmap](../program-roadmap/source-2026-09-22/supplied-roadmap.md#phase-43) is preserved as provenance. This package exposes its complete phase chapter and exact work-package/case mapping for repository use. Local structural checks prove identifier coverage and an acyclic internal dependency graph only; they do not prove provider interoperability, source implementation, permission enforcement, legal qualification or production capacity.
