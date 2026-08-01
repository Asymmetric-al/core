# Public-content contract package

The one owner of the public tenant website's content rules (Phase 5 (Public
Website Runtime Contract); PRD
`docs/prds/sitestacker-parity/phase-05-public-website-runtime-contract.md`,
the five Phase 5 ADRs from the #521 docs ticket — allocated ADR-0026–0030 in
PR #962 — and epic #520).

## What lives here

| Module                | Owns                                                                                                             |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `context.ts`          | `PublicRequestContext` (operational tenant id + CMS tenant id + reserved `siteId`), fail-closed resolution shape |
| `reader.ts`           | `PublishedContentReader` interface, page-type config registry, result unions, updates-limit clamp                |
| `serialized.ts`       | The serialized public types (page, layout blocks, media, navigation, updates, tenant summary)                    |
| `serializer.ts`       | The allowlist serializer — named public-safe fields only; unknown fields/blocks are excluded by default          |
| `cache-tags.ts`       | The tenant/document cache-tag scheme + bounded `cacheLife` profile name; reserved site/locale dimensions         |
| `checkout-handoff.ts` | Checkout-handoff types, reserved attribution fields, Phase 7 pass-through seams, wire parameter names            |

## Boundary rules (enforced)

- **Server-only.** `index.ts` imports `server-only`; a client-component import
  fails the Next.js build. The package is exported only as
  `@asym/api/cms/public` — deep imports are not exposed.
- **Dependencies point inward.** Apps depend on this package; the package
  never imports Payload, `@payloadcms/*`, or any `apps/*` code. Enforced by a
  scoped `no-restricted-imports` rule in `packages/api/eslint.config.mjs`
  (the config CI's per-package lint resolves; the root `eslint.config.mjs`
  mirrors it for root-cwd runs) and by the boundary unit test
  (`packages/api/tests/unit/cms-public-boundary.test.ts`).
- **Serialized output only.** Consumers never see raw Payload documents or
  the `cms` schema. Rich-text `content`/`body` fields carry Lexical JSON —
  the one intentional pass-through, rendered by the shared renderer. The
  reader implementation (#523) is contractually bound to read rich text at
  depth 0 or strip populated `upload`/`relationship` node values, so no
  populated Payload document rides inside the pass-through.
- **Payload-touching implementation lives elsewhere.** The single concrete
  `PublishedContentReader` is co-located with Payload in `apps/admin` (#523);
  the host resolver that produces `PublicRequestContext` is #524; the cache
  runtime is #525; the checkout resolver implementation is #526.

## Reserved seams (plumbed now, populated later)

- `siteId` on the context, cache tags, and handoff — Phase 2 (#479/#482/#485).
- `locale` tag dimension and handoff field — Phase 2 (#483).
- `source_code`, `currency`, `entry_method = 'public_checkout'` — Phase 2.
- Tribute annotation, giving-intent hints, `party_kind` (default `person`,
  org routing via `org_type`; never `party_type`) — Phase 7 credit model
  (Phase 9 C2 amendment, 2026-07-06).
