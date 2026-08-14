# ADR-0133: Source-Bounded Public Page Writing Assistance

**Status:** Accepted (founder ruling, Phase 22 D16, 2026-08-06)

## Context

Missionaries and other authorized Public Page contributors benefit from quiet
help starting, correcting, clarifying, shortening, and translating narrative
content. They do not need a chatbot, model marketplace, generic AI agent, or a
second publishing workflow. Generated prose can be fluent while adding facts,
changing religious or cultural meaning, exposing unsafe source material, or
overwriting a collaborator's newer draft.

Phase 21 D10 already owns the shared tenant-supplied AI provider, credential,
purpose binding, egress, invocation, cost, revocation, and adapter foundation.
Phase 22 owns Public Page contributors, working revisions, semantic edit
targets, content acceptance, review, safety composition, and release. Phase 24
owns locale identity, enabled locales, translation status, fallback, and locale
release context. D16 must compose those authorities without duplicating or
collapsing them.

Translation to English adds specific hazards: generic `English` is ambiguous;
automatic source-language detection is weak for short or mixed text; names,
negation, numbers, quotations, Scripture, doctrine, relationships, idioms, and
cultural meaning can drift; and polished English can falsely appear verified.
The original must remain visible and the author must be told plainly to check
the work.

## Decision

Adopt Phase 22 D16's complete C-prime-R formulation: one tenant-off-by-default,
source-bounded, suggestion-only **Public Page Writing Assistant** routed solely
through the exact Phase 21 D10 `public-profile drafting` Capability Binding.
It may operate only for a currently authorized D1 contributor or separately
authorized staff Page editor on one eligible D3 narrative field, block, or
within-block selection of one saved D1 working revision.

The code-owned action catalog is deliberately small: guided drafting, spelling
and grammar, clarity, shortening, fact-supplied detail, three neutral tones, a
bounded same-source instruction, and **Translate to English**. Every invocation
shows its exact sources and freezes one minimum-data Public Page Writing Source
Package plus the shared D10 Egress Manifest and Invocation Evidence. Provider
calls are server-side, typed, source-minimal, tool-free, retrieval-free, and
incapable of writing Page truth.

Every valid result is one private immutable Public Page Writing Suggestion
Version. Its encrypted content expires within 24 hours or sooner on use,
discard, source supersession, or revocation. The original draft is unchanged
until the actor reviews the exact comparison and explicitly applies it. Apply
freshly reauthorizes current scope and Phase 10 safety, proves the exact target
digest, and CAS-creates at most one ordinary successor D1 working revision.
The suggestion cannot submit, approve, release, publish, change reach, choose a
Designation, alter progress, or create a Ministry Update.

**Translate to English** is available only for an exact pair-certified source
language and existing Phase-24-owned English BCP 47 target locale. The
invocation names both languages; authoritative locale facts precede provider
detection, and any detection is confirmed rather than treated as truth.
Materially mixed-language text is separated or confirmed. Translation is one
operation and cannot simultaneously rewrite, shorten, change tone, localize
money/dates/units, persuade, or add facts.

The source and English suggestion are independently `lang`- and `dir`-labelled
and shown together in an accessible comparison. The original remains
unchanged. The exact primary action is **Use English draft**. The following
code-owned, localized warning remains adjacent to every translation result:

> **Check this translation.** AI translation can make mistakes or miss context.
> Review this English draft carefully before using it.

Its progressive detail is:

> Check names, dates, numbers, quotations, Scripture, ministry terms,
> relationships, and cultural meaning. For important content, ask a fluent
> English reader to review it. This is not a certified translation.

Translation success, author use, staff approval, competent bilingual review,
release, publication, and certified translation remain separate facts. D16
retains private provenance but adds no public AI badge. The used draft continues
through D4/D5's ordinary tenant-selected review/check and release lane.

## Consequences

- The manual editor is always complete. Disabled, missing, unsafe, unsupported,
  ambiguous, unavailable, over-budget, invalid, revoked, or stale AI fails
  without altering the draft or exposing provider jargon to contributors.
- One editor-neutral semantic authoring port isolates the domain from Tiptap,
  Lexical, Payload JSON, DOM offsets, and mutable profile fields.
- Every invocation and application is independently idempotent; ambiguous
  provider outcomes are inspected before retry, and stale source or target
  content cannot be overwritten.
- Source/suggestion bodies remain private and absent from anonymous grants,
  broad search, Realtime publication, ordinary logs, analytics, and support
  tooling. Durable evidence is content-free and references exact digests.
- Exact source-language → English-locale pairs require representative bilingual
  human evaluation, terminology and meaning-drift fixtures, accessibility and
  bidi proof, and current provider/model/region certification. A provider's
  support list or automated score alone is insufficient.
- Phase 10 remains the pre-egress and public-egress ceiling; tenant BYOK and
  fluent output waive nothing. Phase 12 retains exact capabilities. Phase 24
  remains authoritative for locale and translation lifecycle. D4/D5 remain
  authoritative for content release.
- The feature produces no separate key store, provider configuration, locale
  workflow, translation memory, prompt builder, review queue, or publication
  authority.

## Considered options

### No writing assistance

Rejected because a bounded optional aid can materially reduce author friction
without making AI necessary or authoritative.

### Generic chatbot or whole-Page agent

Rejected because it expands source access, makes intent and provenance
ambiguous, increases fabrication and leakage risk, and creates a second editor.

### Fixed editor-local suggestions through D10

Accepted and hardened with exact source packages, explicit comparison and Use,
short-lived private results, semantic target CAS, and complete manual continuity.

### Generic machine translation or automatic English localization

Rejected. Translation must name and certify an exact source/target pair,
preserve and compare the original, warn the author to check the result, and
create only an ordinary draft. Phase 24 remains the locale and translation-
status authority.

## Related decisions

- [ADR-0099](./0099-claim-level-expense-truth-and-purpose-routed-tenant-ai.md)
  — shared tenant-owned AI control plane
- [ADR-0118](./0118-typed-public-ministry-pages-and-explicit-contributor-assignments.md)
  — Page families, revisions, and contributors
- [ADR-0119](./0119-tenant-defaulted-phase-10-ceiling-resolved-publication-reach.md)
  — Phase 10-bounded Publication Reach
- [ADR-0120](./0120-family-certified-public-page-presentation-profiles.md)
  — semantic Page-Family presentation contracts
- [ADR-0121](./0121-tenant-chosen-public-content-review-and-release-profiles.md)
  and [ADR-0122](./0122-simple-public-page-review-with-quiet-phase-10-eligibility.md)
  — tenant-selected review/check and sole release lane
- [Phase 22 decision log](../prds/sitestacker-parity/phase-22-public-ministry-pages-decision-log.md)
- [Phase 22 research evidence](../prds/sitestacker-parity/phase-22-public-ministry-pages-research-evidence.md)
