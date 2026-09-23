Planning contract reconciled on 2026-09-22. Read [package authority and checkpoints](README.md) and [owner amendments](adoption-map.md). Source-era evidence is dated; runtime qualification remains open.

<a id="web-schema-guide"></a>

# Structural contract examples

These JSON Schemas validate the proposed wire-envelope shape. They do not replace current Core D7/D11 semantic decoders, current Phase 12 authorization, reference/media qualification, runtime package admission or PostgreSQL constraints.

- `composition.schema.json`: shape, finite layout setting keys/values and slot lengths. The reference Python validator adds context-dependent grammar, node/depth/identity/profile rules. Real semantic content and package-setting values require exact admitted owner validators.
- `presentation-manifest.schema.json`: manifest shape only. A fixture digest is not an attestation. Only the real admission owner can authorize an artifact.
- `workflow-event.schema.json`: safe identifier-only example. Actual field names must converge with the existing Core event contract; do not introduce a parallel bus.
- `editorial-save.schema.json`: request does not accept actor, Tenant or bypass fields. Authenticated server context still must validate every resource selector and exact lease/revision.

All examples are labelled structural fixtures and contain invented non-production identifiers/digests. No fixture claims a real repository, user, artifact or legal right. Do not use them as seed data in a live Tenant. The schemas make unspecified semantic data visibly incomplete rather than inventing a new rich-text or operational model.

---
