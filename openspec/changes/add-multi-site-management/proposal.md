# Add Multi-Site Management

## Why

Phase 2 reserved Site, locale, currency, and giving-attribution primitives, but
Core still lacks the safe management product needed to operate multiple public
ministry websites. Current code remains shaped around one host, mutable CMS
heads, incomplete Site context, USD/two-decimal assumptions, and provider
status. Extending those shapes would make domains, exact-locale publication,
donor currency, and old-address continuity brittle and unsafe.

Phase 24 converts the completed founder grill into one implementation contract.
It must give ordinary Tenant staff self-service without making Payload, Vercel,
Stripe, DNS, caches, or browser state authoritative. It must also preserve
donor purpose, money correctness, historical attribution, exact public meaning,
and cross-Tenant isolation through concurrency and provider uncertainty.

## What Changes

- Add a behavior-neutral, Tenant-owned Site management lifecycle: private
  setup, explicit public activation, independent website and public-Giving
  containment, immutable successor releases, and terminal retirement.
- Add operational Domain authority with one Primary Site Domain, optional
  redirect-only Site domains, explicit former-primary disposition, owner-
  cleared disconnection, fresh-proof claims, and prepared same-Tenant Site
  cutover.
- Add exact Site Locale management and public release under the fixed
  `/lang/{exact-locale}` base. Core maintains a small Site Locale Publication
  Contract and a separate small Domain Critical Owner-Family Registry; ordinary
  untranslated content does not block and never falls back at runtime.
- Add complete immutable Site Brand Versions, one stable Tenant Donor Account
  Brand, exactly one verified Tenant-controlled Donor Portal host per activated
  Tenant/environment, and one read-only Phase 17-owned message-readiness
  projection.
- Add proof-qualified donor presentment currencies, exponent-safe Money,
  versioned native suggested amounts, and explicit donor transitions: currency
  changes preserve a target-valid schedule while clearing money/payment state;
  schedule changes preserve currency while clearing source schedule and its
  smallest dependent money/payment closure.
- Add explicit translation provenance and source freshness, authoring-only
  Suggested translation sources, exact saved/published Copy heads, revision-
  bound Copy Qualification, and visible but nonselectable source issues.
- Add deterministic domain-move route review and Page-owner-qualified ordinary
  Page continuity. A material Page-purpose change creates one fresh private Page
  identity through an atomic source-cleaning/path/descendant/order handoff.
- Add command-only, tenant-safe persistence, durable receipts/outbox,
  fail-closed provider adapters, generation-bound public reads, mixed-version
  rollout, and production-shaped proof.

## Capability Deltas

- New durable capability: `multi-site-management`.
- Add a `platform-surfaces` requirement that places Site management in the
  staff product while keeping donor account identity Tenant-wide.
- Add a `platform-boundaries` requirement that prevents Site, CMS, and provider
  evidence from owning money, authorization, or public lifecycle truth.
- Add a `donation-lifecycle` requirement for qualified presentment currency and
  purpose-preserving pre-acceptance currency/schedule transitions.

## Dependencies

- Phase 2 supplies Site, locale, currency, Money, and attribution foundations,
  but its array/null/USD-shaped interim seams must be reconciled.
- Phase 5 supplies the trusted public request/host boundary and sole runtime
  router.
- Phase 12 supplies exact staff capabilities and policy enforcement.
- Phase 13 owns gift intent, accepted contributions, allocations, and Site/
  source attribution.
- Phase 16 owns schedule identities and accepted recurring lifecycle.
- Phase 17 owns System Messages, fallback, provider readiness, and repair.
- Phase 20 owns Legal Entity, Settlement Account Binding, settlement, and
  accounting evidence.
- Phase 23 must first supply or be reconciled to accepted equivalents for
  immutable Public Site Generation, Working Revision, Page placement, finite
  transfer, lease fencing, and source-owner adapters. Open PR #1340 is evidence,
  not merged authority.

## Out Of Scope

- Multiple simultaneously active Giving Legal Entities or connected accounts,
  Site-selected merchants, or platform-account fallback.
- FX conversion, retained foreign balances, foreign payout/accounting setup,
  provider pricing authority, or automatic digit conversion.
- Site types, bulk Site clone, live inheritance, arbitrary theme/code/plugin
  systems, or another renderer/serving head.
- Runtime language fallback, automatic translation, locale negotiation,
  translation workflow/quality scoring, or scheduled/bulk locale publication.
- Wildcard or cross-Tenant domain transfer, registrar/DNS/email management,
  per-Site Vercel projects, arbitrary redirect management, or URL crawling.
- Generic Page duplicate/merge/purpose taxonomy, AI successor inference,
  runtime purpose resolution, subtree transfer, or Navigation coupling.
- Changes to accepted gift/recurring truth, provider proration/subscription
  editing, or a generic cart transition engine.
- Phase 24 D19–D55 cross-phase work and the deferred D56 access-profile
  withdrawal-authority question.

## Release Posture

This active change records intended behavior; it does not prove implementation
or authorize production provider configuration. Readers, structural constraints,
receipts, and adverse fences land before writers. Cohorts remain dark until the
one vertical tracer, pure contract suites, real disposable-Postgres matrix,
current Stripe/Vercel/DNS qualification, accessibility, load, and mixed-version
proof all pass. Once a public identity or external effect exists, rollback
disables new commands and repairs forward without deleting history or releasing
adverse reservations.
