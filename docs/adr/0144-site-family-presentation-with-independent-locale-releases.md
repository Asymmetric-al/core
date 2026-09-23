# ADR-0144: Site-family presentation with independent locale releases

**Status:** Accepted (founder-ratified Phase 22 D27 C-prime-R, 2026-08-14)

## Context

Tenants need one consistent Missionary design and one consistent
Project/Campaign design across every Page and language on a Site without
maintaining template copies. Localized prose, media meaning, accessibility
text, review, and publication nevertheless require independent locale control.
Treating both concerns as one mutable multilingual document would make a design
change capable of translating or publishing content; treating every Page or
locale as its own template would create drift, collisions, and unbounded
maintenance.

D3 previously permitted exact-Page profile exceptions and made the profile
pinned by a D2 Page Release the entire presentation selector. The founder's D27
decision deliberately changes that authority model, so it must be recorded as
an explicit later amendment rather than inferred from UI behavior.

## Decision

For each exact Tenant × Legal Entity × environment × Site × Page Family, Phase
22 has one current D3 presentation-profile head. It selects one immutable
Missionary or Project/Campaign Public Page Presentation Profile Version shared
by every Page and locale in that family. Phase 22 ships no Page- or
locale-specific layout profile, copied layout, layered override, schema fork,
or cross-family universal template.

One Public Ministry Page identity exists per exact Site × Page Family × D17
source-qualified typed subject. Each Page has independent Page × Phase-24-owned BCP 47 locale
editorial lineages. **Page design — all languages** may change compatible
presentation across the family; **Content — this language** changes only one
locale lineage. Neither action translates, overwrites, attests, reviews,
releases, widens, or silently falls back to another locale. Public exact-locale
reads disable provider fallback; an absent eligible locale remains absent.

A compatible presentation successor may become current only through one
immutable Public Page Family Presentation Activation. The system prepares and
shadow-compiles content-addressed artifacts for every non-retired Page × enabled
locale with a current D2 release head, then re-proves actor, scope, current
heads, compatibility, the Site × family coordination epoch, and the exact
release-head-set digest before one short idempotent compare-and-swap. Activation
is all-or-nothing and creates no Page writes or editorial republication. A
concurrent Page release invalidates stale proof. Any semantic exposure,
cardinality, locale, media, catalog, renderer, or otherwise migration-required
change leaves the prior generation current and uses exact cause-owned
exceptions plus the ordinary locale-specific release path.

D2's immutable profile/catalog/renderer pins remain release-time baseline and
historical evidence; the current D3 Presentation Activation Manifest selects
the current family presentation. D18 renders only the coherent composition of
the exact D2 Page × locale release, current D3 activation, and current
D2/Phase-10/D8 admission. D4/D5/D26 remain the sole candidate, review, and
attestation owners; D2 remains release/reach authority; D8/D14 remain
route/search/share authority; D20 remains semantic-catalog authority. A mixed,
unknown, stale, or partially available composition fails closed.

## Amendments to earlier Phase 22 decisions

- D1/D17 Page uniqueness excludes locale: one Site-scoped Page has
  subordinate locale lineages; a different Site remains a different Page.
- ADR-0120/D3's exact-Page profile exception does not ship. Its rule against a
  new default silently changing live Pages remains; D27 permits only an
  explicit, consequence-reviewed, completely proved compatible family
  activation.
- D2's release-time D3 pin is baseline and historical evidence, not the sole
  current presentation selector.
- D14/D18 identities resolve both the exact Page × locale release and current
  family activation generation; either missing or mismatched component fails
  closed.
- D20 optional content never creates a structural profile exception. D23 owns
  only the quiet settings projection and owner-command routing; it does not
  become presentation authority.

Every unamended boundary of D1–D26 and their ADRs remains binding.

## Consequences

- Tenant setup needs at most two family-design choices per Site, and a
  compatible later design change is authored once rather than repeated per
  Page or locale.
- Contributors see organization-managed structure and edit only the selected
  locale's content. Single-locale Sites need no locale-management UI.
- Compatible family activation requires complete-cohort compatibility,
  concurrency, cache-generation, RTL/long-text, accessibility, tenant-isolation,
  and failure proof before the one current head changes.
- Legacy Page/profile exceptions require an explicit D21 disposition before
  authority cutover; they cannot be preserved as hidden overrides.
- Historical rendering requires the exact D2 release and the D3 activation
  effective at the observation time.

## Rejected alternatives

### One mutable multilingual Page document

Rejected because field-level publication and fallback can couple language
meaning, review, safety, and release to presentation changes.

### Per-Page or per-locale templates and synchronization

Rejected because copies, overrides, inheritance, and synchronization matrices
create drift, race conditions, noisy administration, and combinatorial testing.

### Automatic translation or public locale fallback

Rejected because it can expose unreviewed, stale, or unsafe meaning and falsely
claim that a target locale was independently released.

Ratification of this planning decision authorizes no implementation, schema,
migration, profile activation, issue publication, or production change.

## References

- [Phase 22 ratified D27 decision](../prds/sitestacker-parity/phase-22-public-ministry-pages-decision-log.md#d27--what-shares-one-page-identity-and-presentation-pattern-within-one-site-across-pages-and-locales)
- [Phase 22 ratified D27 research evidence](../prds/sitestacker-parity/phase-22-public-ministry-pages-research-evidence.md#50-ratified-d27-research--one-family-pattern-with-independent-locale-content)
- [ADR-0118 — Typed Public Ministry Pages](./0118-typed-public-ministry-pages-and-explicit-contributor-assignments.md)
- [ADR-0119 — Publication Reach](./0119-tenant-defaulted-phase-10-ceiling-resolved-publication-reach.md)
- [ADR-0120 — Family-certified presentation profiles](./0120-family-certified-public-page-presentation-profiles.md)
- [ADR-0131 — Search and sharing presentation](./0131-release-bound-public-search-and-sharing-presentation.md)
- [ADR-0134 — Exact typed Page subjects](./0134-exact-typed-public-page-subject-bindings.md)
- [ADR-0135 — Release-bound runtime composition](./0135-release-bound-public-ministry-runtime-composition.md)
- [ADR-0137 — Page Family Semantic Catalogs](./0137-two-bounded-page-family-semantic-catalogs.md)
- [ADR-0140 — Derived setup and settings](./0140-derived-public-page-setup-and-settings.md)
