# ADR-0153: Certified Site-bound custom Presentation Packages

**Status:** Accepted (founder-ratified Phase 23 D9 C-prime-R, 2026-08-21)

## Context

ADR-0145 makes D1 Public Site Generations the sole coherent ordinary public
release authority. ADR-0151 fixes a portable semantic section catalog and a
separately governed route for new semantic meanings. ADR-0152 makes Reusable
Sections presentation-neutral while preserving compatible code-owned visual
variants. Those decisions do not yet provide the level of brand differentiation
required by tenants whose Sites must feel genuinely custom rather than like
logo-and-color variations of one template.

Source-controlled bespoke renderers can provide that differentiation. Runtime
tenant code upload, arbitrary Payload plugins, remote modules, or per-tenant
application forks would instead create unsafe executable authority, tenant
isolation risk, content lock-in, and an unbounded upgrade burden. AI assistance
changes how source may be produced, not the proof required to admit it.

## Decision

> **C-prime-amended-and-hardened (C-prime-R) — Certified, Site-bound custom
> Presentation Packages over portable semantic content and platform-owned
> capability islands:** launch one managed custom-development lane in which Asym
> or an explicitly qualified partner—including AI-assisted development under a
> named human maintainer—may create genuinely bespoke Tenant presentation code
> for an exact environment × Site: custom public chrome, DOM and responsive
> composition, components, D7/D8-compatible section renderers and variants,
> typography, styling, art direction, motion, transitions, progressive loading,
> and native-scroll presentation. Any pre-admission execution of imported or
> AI-produced code is confined to an isolated, disposable nonproduction
> environment without production data or secrets; sandbox success never equals
> certification. Each immutable package version is admitted only from reviewed
> source through a deterministic build and a content-addressed artifact whose
> manifest binds the exact Tenant/Site scope, source commit, provenance, SBOM,
> licenses, pinned dependencies, owner/support window,
> platform/SDK/catalog/compiler compatibility, Page families/locales, component
> registry, public assets/origins, budgets, fallback behavior, and complete
> security, privacy, tenant-isolation, accessibility, reduced-motion,
> responsive/locale, no-JavaScript, visual, performance, donation-handoff, and
> failure-recovery evidence. Package code receives only one versioned serialized
> Public Presentation View Model containing D7/D8 semantic content and
> Phase-5/10-qualified public projections plus narrow canonical platform
> capabilities for privileged interactions; it never receives operational
> records, Supabase/Payload clients, auth, secrets, arbitrary network or server
> authority, money or checkout truth, restricted-worker decisions, or a private
> release head. Radically different visual implementations are permitted, but a
> new semantic content purpose must first enter through D7's separately governed
> additive catalog seam, preserving content portability and a qualified standard
> fallback. Phase 22's Site × specialized-family consistency remains intact,
> Phase 24 alone owns complete Site/package selection and settings UX, and Phase
> 29 alone owns media bytes and qualified public renditions. Tenant staff use a
> quiet brief → actual-content preview/compare → exception resolution →
> design-intent approval flow and see only compatible purpose-named choices in
> ordinary editing; they do not certify code or manage packages. D1 alone pins
> and CAS-activates the exact deployed package, profile, content, assets, and
> code/schema generation; failures preserve the current public generation, and
> fixes, revocations, fallbacks, and rollbacks occur by smallest-scope containment
> and an immutable proven successor. This launches bespoke brand expression
> without runtime code/CSS upload, `eval`, URL modules, arbitrary HTML or
> unreviewed/package-managed third-party scripts, tenant npm/plugin installation,
> a marketplace or production tenant-code sandbox, Payload plugins as isolation,
> package inheritance mazes, package-specific content silos, self-certification,
> direct-model-to-production publication, scroll hijacking, fake loading delays,
> inaccessible motion, obscured giving, silent package substitution, mutable
> production package pointers, or any second public truth or release authority.

## Consequences

- Tenants may commission genuinely distinct public shells, component
  implementations, responsive composition, typography, art direction, motion,
  loading, and native-scroll presentation without forking semantic content or
  privileged platform behavior.
- Packages are reviewed first-party application code after admission. Tenant
  staff never upload executable source, packages, dependencies, plugins, CSS,
  schemas, or AI output through Web Studio.
- The package boundary is one provider-neutral Public Presentation View Model
  plus narrow platform capability islands. Raw Payload, Supabase, operational
  records, secrets, unrestricted network/server authority, and source-owned
  giving/privacy/route truth remain structurally unavailable.
- D7 continues to own semantic authoring types. New meaning requires a separate
  D7 successor; D9 permits bespoke renderers, not opaque content silos.
- Each immutable package release has exact Site audience, artifact digest,
  provenance, dependencies, compatibility, owner/support, budgets, fallback,
  and complete qualification evidence.
- WCAG 2.2 AA, meaningful server output, reduced motion, native scrolling,
  recognizable giving, Core Web Vitals, tenant isolation, and recovery remain
  non-negotiable platform floors.
- D1 remains the only ordinary public release and serving authority. A package
  deployment or staff design approval cannot independently make it public.
- ADR-0154 now defines the sole bounded Site Presentation Activation:
  complete private preparation followed by one all-or-none CAS of the exact D1
  public-locale head cohort, without a global presentation pointer.

## Rejected alternatives

- limiting every tenant to one common structural renderer with only logo,
  palette, and small token variations;
- tenant-uploaded JavaScript, CSS, React, packages, plugins, schemas, executable
  archives, remote modules, or runtime npm installation;
- treating Payload plugins, Local API, TypeScript, lint, CSP, or `node:vm` as a
  security boundary for untrusted code;
- a launch marketplace, production tenant-code sandbox, remote-plugin runtime,
  arbitrary schema builder, package inheritance graph, or per-tenant
  application fork;
- direct database, auth, secret, operational, arbitrary-network, checkout, or
  publication authority inside presentation packages;
- AI self-approval or direct model-to-production publication; and
- mutable package pointers, runtime `latest`, silent fallback, scroll hijacking,
  fake loading delays, inaccessible motion, hidden essential content, or
  package-specific semantic content.

## Implementation proof gates

Implementation remains unauthorized by this ADR. A future authorized change
must prove at minimum:

- exact Tenant × environment × Site binding, cross-scope denial, cache
  isolation, and Phase-10 public-projection negative fixtures;
- deterministic locked builds, content-addressed artifacts, provenance, SBOM,
  dependency/license/vulnerability/secret review, and human ownership;
- a statically enforced package import/capability boundary with no Payload,
  Supabase, auth, secrets, filesystem/process, arbitrary network, server-action,
  operational-write, or source-owned capability access;
- exhaustive semantic renderer and settings-schema compatibility across empty,
  minimum, maximum, historical, localized/RTL, missing/failing asset, no-JS,
  reduced-motion, narrow, and lower-end-device states;
- keyboard, focus, screen-reader, contrast, touch, zoom/reflow, forced-colors,
  semantic-order, CSP, sanitization, SSR/hydration, SEO/share, navigation,
  Give/designation/attribution, and checkout-handoff correctness;
- versioned JavaScript, CSS, font, image, LCP, INP, CLS, and render budgets plus
  package/generation-qualified field observability without PII or content;
- private actual-content preview/public parity and clear separation of tenant
  design-intent approval from platform certification and D1 activation; and
- stale-candidate, code/deployment-skew, concurrency, package/component/asset
  failure, revocation, adverse containment, prior-generation preservation, and
  immutable-successor recovery.

Ratification of this planning decision authorizes no implementation, schema,
migration, provider adoption, issue publication, deployment, release
activation, or production change.

## References

- [Phase 23 D9 decision log](../prds/sitestacker-parity/phase-23-web-studio-cms-decision-log.md#d9--certified-site-bound-custom-presentation-packages)
- [Phase 23 D9 adversarial evidence](../prds/sitestacker-parity/phase-23-d9-site-presentation-profile-and-section-variants-research-evidence.md)
- [ADR-0145 — Page-local composition, bounded reuse, and coherent Public Site Generations](./0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [ADR-0151 — Semantic ordinary section catalog with an additive bounded-composition seam](./0151-semantic-ordinary-section-catalog-and-additive-bounded-composition-seam.md)
- [ADR-0152 — Family-qualified exact semantic Reusable Sections](./0152-family-qualified-semantic-reusable-sections.md)
- [ADR-0154 — Complete-cohort Site Presentation Activation through D1](./0154-complete-cohort-site-presentation-activation-through-d1.md)
