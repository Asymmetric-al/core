# ADR-0185: Tenant-owned Donor Portal host

**Status:** Accepted (founder rulings, Phase 24 D57-D58 — 2026-08-30)

Each Tenant and environment has exactly one current verified Tenant-controlled
HTTPS host for its Tenant-wide authenticated Donor Portal. Every Site links to
that same portal host, but Site, host, and branding never establish identity or
authorization; protected access still intersects the exact current host
binding, validated session, same-Tenant donor relationship, application
authorization, and database isolation.

Tenant-facing portal, authentication, recovery, protected-action, and account
surfaces are Tenant-brand-native and expose no Asym co-branding or donor-visible
`asymmetric.al` fallback. Required legal, merchant, processor, payment,
security, accessibility, support, and privacy facts remain truthful. Domain
loss therefore causes honest unavailability rather than platform fallback;
replacement is successor-first and never rewrites donor, gift, document,
commitment, financial, or audit history.

The one host presents exactly one current Tenant Donor Account Brand across
sign-in, claim, recovery, errors, navigation, account settings, and cross-Site
history. The Default Site, entry Site, locale, referrer, return destination,
last gift, and Site retirement never reskin that account surface. Verified
same-Tenant Site context may appear only as secondary attribution or a
validated return action. Brand publication is complete and prospective; it
does not rewrite historical artifacts or replace Site, Legal Entity, merchant,
issuer, support, or authorization truth.

Tenant customization remains bounded to governed assets and accessible
semantic presentation inside the shared code-owned product structure. No raw
HTML, CSS, JavaScript, arbitrary remote dependency, or layout/authentication
override is allowed. A missing decorative asset degrades to the trusted Tenant
text identity and safe neutral structure, never to Asym, another Tenant, the
Default Site, or an entry Site. D58 establishes this logical brand authority
without choosing a new table, a second theme system, or live inheritance from
Phase 17 email Brand Kits.

This decision amends only the global donor-visible origin clauses in
ADR-0025/ADR-0037 and their Phase 17/D12 records. It preserves their scanner-
resistant transport, producer ownership, no-store behavior, authorization,
idempotency, and financial-truth invariants.
