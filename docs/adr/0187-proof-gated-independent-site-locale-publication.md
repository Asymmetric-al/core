# ADR-0187: Proof-gated independent Site Locale publication

**Status:** Accepted (founder ruling, Phase 24 D66 — 2026-08-30)

## Context

Adding a locale for private authoring is not the same as making a coherent
website public. Immediate publication can expose incomplete navigation, errors,
or tenant identity; requiring every historical story to be translated blocks
useful launches indefinitely. Transparent cross-language field fallback is also
incompatible with Core's explicit `/lang/{exact-locale}` identity and can make
a French URL silently present English content.

## Decision

Staff may add, author, review, and production-preview a Site Locale privately.
One explicit authorized publication creates a Site Locale Public Release only
after a fresh Site Locale Publication Contract proves the applicable core
website closure. Version 1 contains exactly five code-owned families:

1. trusted route, Site, host, stable-locale, and release identity;
2. exact-locale homepage, Site frame, Brand Version, Navigation, language
   control, and invoked support/privacy/legal destinations;
3. known-Site not-found, error, unavailable, and recovery surfaces;
4. complete exact-locale presentation of every applicable member of families 2
   and 3, plus direction, script/font, bidi, responsive, and accessibility
   correctness; and
5. canonical, reciprocal locale alternatives, sitemap/robots eligibility,
   public serialization, generation, and cache-serving closure.

Site Platform maintains this small manifest in version-controlled code. Every
new universal locale-bearing website dependency must be classified in the same
change or CI fails. Tenants cannot add checklist rows, waive evidence, or turn
the contract into a percentage. Each Page, Navigation, Brand, route, legal,
accessibility, and runtime owner still owns its evidence; the contract only
composes exact references.

Ordinary stories, updates, campaigns, and nonessential Pages do not block the
locale. Missing target-language content remains absent from that locale's
Navigation, site search, sitemap, and `hreflang`. A source-owned component or
placement may store a typed same-resource alternative relation; the runtime
renders the authorized language-labelled link only when its target is present
in the current authorized public generation and is not source-revoked; D67
translation freshness is a separate editorial fact. The runtime never
invents placement, label, or equivalence. The route never substitutes another Site Locale as field,
fragment, resource, or Page fallback. Deliberately authored multilingual
passages remain valid when marked with their actual `lang`/`dir`. Payload's
transparent field fallback and
experimental localized status are neither runtime behavior nor publication
authority.

ADR-0189's Site **Suggested translation sources** order is staff authoring
preference only. It never supplies the public alternative relation, selects a
public release, changes `hreflang`/Navigation/search/sitemap, or participates in
runtime exact-locale resolution or cache identity.

ADR-0191's Copy Qualification is likewise private authoring proof only. It says
that one exact source revision can be materialized safely as private target
input; it does not run, weaken, or satisfy this Site Locale Publication Contract
or any resource's release validation. Source findings may remain visible and
non-gating for Copy, while the independently derived target and D1/D66 exact
publication candidate must still prove every current source-owned invariant.

Giving addresses, Giving admission, donor-account localization, messages,
receipts, currencies, and payment behavior retain their separate owners and
activation gates. Their read-only summaries may appear beside Site Locale
readiness, but they neither block nor satisfy core website publication.
Publishing a locale does not make it the default; D16 alone owns the root.

Operational Postgres owns stable Site Locale identity and the sole locale-exact
release head through D66's minimal Public Site Generation contract. This does
not accept or depend on the broader unmerged Phase 23 Presentation Package
proposal; an accepted compatible Phase 23 generation contract must be consumed
rather than duplicated. Payload owns
localized content drafts/publications. Public readers consume one exact
generation. Readiness is derived, never a mutable database Boolean or a second
serving head. This aggregate is isolated one deployment environment per
Supabase project/database; environment remains trusted command/cache/audit
context rather than a partial Site key. A future shared-environment database
must first add the discriminator to Site and every dependent key/FK together.

## Consequences

- The stale Phase 2 `allowed_locales[]` model must normalize into a bounded
  repeated Site Locale aggregate before Phase 24 publication; this is the
  explicit A1a exception, not another Site hierarchy or generic settings table.
- First Site Locale activation, whole-locale withdrawal/restoration, and
  locale-wide policy/contract transitions use one authorized, idempotent,
  expected-head `sites.publish_locales` command. It pins
  immutable source versions, commits the release/audit/outbox in a short
  transaction, and makes no Payload, Vercel, or other network call while locked.
  Authority tables deny direct DML to browser and secret/service-role paths.
  A registered single-Tenant NHI may compile, reconcile, dispatch, or
  mechanically commit an unchanged sealed human command, never replace it.
- After activation, an ordinary resource successor follows its source owner's
  Tenant-controlled publication policy, including already-authorized automatic
  or scheduled release, and may mechanically compose a successor generation
  without a second locale-manager approval. It must still re-prove current Site
  Locale admission, publication-contract invariants, source authority, expected
  heads, and absence of an applicable safety fence. D67 safety-governed source
  successors require their source-owned public-use disposition; they do not
  create a generic locale approval workflow.
- Cache and route identity include Tenant, environment, Site, stable Site
  Locale, public generation, and renderer. Locale tags are scoped invalidation
  handles, never cache isolation. First publication remains **Publishing** until
  the public runtime acknowledges the new generation.
- The generation-bound Edge Config admission projection is a pre-stream deny
  gate and never grants authority. Favorable publication is head-first/admission-
  allow-second; withdrawal, suspension, and safety revocation are adverse-fence-
  first/head-second. Unknown fence outcomes reconcile before transition.
  It stores only compact host/Site/locale/generation/status coordinates and
  remains behind a bounded, partitionable provider adapter; exhaustion denies.
- After an adverse fence succeeds, a failed/conflicted/unknown head transition
  keeps admission adverse and the same durable command in **Needs attention**
  while Core reconciles forward. Admission restoration is a separate
  reauthorized recovery that re-proves the head, affected owners, and prior
  generation safe; the UI never claims that nothing changed.
- The committed generation head becomes sole authority atomically;
  **Publishing** reports Core-controlled convergence, not a second authority.
  Lagging edges fail to privacy-safe absence or serve prior output only after a
  fresh head check proves it remains authorized.
- Exact locale routes never use browser negotiation. No Vercel Domain API call
  or deployment is part of locale publication.
- Failure before commit leaves a first locale private or the prior generation
  public. A failed post-commit readback keeps the committed head, the honest
  **Publishing** state, and fail-safe edge behavior; it never restores or mints
  another head. Withdrawal preserves identity/history and never redirects or
  changes the default automatically.
