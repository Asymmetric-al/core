# Phase 23 D9 Site Presentation and Section Variants — Decision Brief and Research Evidence

- **Status:** Founder-ratified Phase 23 D9 C-prime-R on 2026-08-21.
- **Date:** 2026-08-21
- **Authority:** Research and decision support only. This document does not
  authorize implementation, schema work, migration, provider adoption, issue
  publication, deployment, release activation, or a production change.

## Decision seam

Phase 23 D8 deliberately separates reusable semantic content from visual
presentation. The next founder decision is therefore:

> How much safe visual control should an ordinary tenant Site receive through
> the Phase 23 presentation contract, without turning Web Studio into a raw
> design tool or making every tenant Site look interchangeable?

This is a configurability decision, not yet the separate decision about how a
Site-wide presentation change activates across several locale-specific D1
Public Site Generations.

## Boundaries already settled

D9 must preserve all of the following:

- D1 owns Page-local semantic composition and an immutable Public Site
  Generation for one exact Tenant × environment × Site × BCP-47 locale.
- D6 Page Starters create local starting copies. They are not live themes or
  inheritance.
- D7 owns the family-qualified semantic section catalog. Presentation must not
  create new semantic section types for every visual treatment.
- D8 permits an exact Page placement to select only a compatible named,
  code-owned presentation variant under a separately ratified Site
  Presentation Profile and Section Variant contract. A variant is not a
  semantic-content override, independent workflow, or approval authority.
- Phase 2 already defines basic Site brand facts and a branding resolver. Phase
  24 owns the complete multi-Site, locale, domain, currency, Site-branding, and
  settings product. D9 must not create a competing Site-management system.
- Phase 22 D3/D27 remains authoritative for Missionary Ministry and
  Project/Campaign Pages: one Site × family presentation profile applies to
  every Page and locale in that family. Phase 23 ordinary-Page choices cannot
  silently create Phase 22 exact-Page or locale layout exceptions.
- Phase 29 owns generalized Media truth. Presentation may reference only
  qualified public renditions.
- Tenant staff do not upload or execute CSS, JavaScript, React, Liquid,
  templates, packages, plugins, or component schemas.

## Canonical vocabulary proposed for this question

| Term                                  | Meaning                                                                                                                                                            | Not the same as                                                                                          |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| **Site Brand Version**                | Phase-2/24-owned Site identity and brand inputs such as approved logo, name, tagline, and role-qualified colors.                                                   | Page content, renderer code, a theme upload, or a Public Site Generation.                                |
| **Presentation Package**              | An immutable, code-owned and qualified renderer capability package with a stable ID/version, compatible semantic catalog, token contract, and Section Variants.    | Tenant-authored code, a Payload plugin, a Page Starter, or mutable CSS.                                  |
| **Site Presentation Profile Version** | One immutable Site-scoped selection of a Presentation Package plus bounded semantic presentation choices and defaults, referencing the exact Site Brand Version.   | A locale translation, Page layout tree, Reusable Section, or Site-management authority.                  |
| **Section Variant**                   | A stable, purpose-named, code-owned visual treatment for exactly one compatible D7 semantic section type while preserving the same content contract and DOM logic. | A new content type, arbitrary style bag, per-viewport layout, content override, or independent workflow. |
| **Starting style**                    | A thumbnail-led set of initial profile values copied into a draft so staff can begin from a coherent look.                                                         | Hidden inheritance or a permanently linked global preset.                                                |

The product UI should normally say **Website appearance**, **Starting style**,
and **Section layout**. Provider terms such as design tokens, package,
renderer, schema, and Payload Global remain implementation or advanced audit
language.

## Current repository evidence

The current implementation is not an architecture to preserve:

- `apps/admin/src/cms/collections/page-builders.ts` defines one generic
  seven-block Payload palette. It has no Site Presentation Profile,
  Presentation Package, or Section Variant contract.
- `apps/admin/src/cms/collections/page-templates.ts` stores tenant Page Template
  layouts that are copied by the existing create-from-template endpoint. It
  does not provide coherent Site-wide presentation authority.
- The current Payload collection set has no `cms.sites` collection in the
  checked-out implementation, despite Phase 2's accepted target contract.
- `apps/donor/app/layout.tsx` still reads the static `@asym/config/site`
  `siteConfig`; the donor runtime does not yet resolve versioned Site branding
  or a presentation profile.
- Public block rendering is partial and app-specific. Hard-coded classes and
  route-group navigation variants are current migration evidence, not a
  qualified renderer catalog.
- The repo pins Payload and related packages to
  `4.0.0-internal.1f9ae9a`. Payload Blocks, Globals, Versions, drafts, and
  custom Admin components are possible adapter primitives, but an internal
  provider build does not own or prove Asym's Site scope, compatibility,
  release, or public-serving contract.

## Accepted predecessor evidence

### Phase 2 and Phase 24 ownership

Phase 2 defines a Site as a presentation-and-attribution boundary and reserves
`resolveSiteBranding(site) → { name, logo, tagline, brandTokens }`. Its target
`cms.sites` presentation facet contains basic branding and is editable in Web
Studio. Phase 24 later owns the complete staff product for creating and
configuring Sites, branding, domains, enabled locales, and related defaults.

D9 should therefore define the presentation capability consumed by Phase 23
Pages and preview, while Phase 24 remains the complete owner of Site setup and
advanced Site-appearance administration. Phase 23 may surface the active Site
appearance and route the user to its owner; it must not clone Site settings
into Page documents.

### Phase 22 specialized Page families

Phase 22 D3 and its D27 amendment define two non-interchangeable Public Page
Presentation Profile families. Each exact Site × family has one active profile
for all Pages and locales, with no exact-Page or locale-specific layout fork.
Those profiles may consume shared Site brand roles and rendering primitives,
but Phase 23's ordinary Section Variant choice cannot weaken the specialized
family contract.

## Current official external evidence

### Global style and bounded local choice are complementary

- WordPress separates Site-wide Styles and style variations from Page content.
  Its current Styles UI covers color, typography, spacing, layout, and block
  defaults, previews changes, and offers named variations rather than requiring
  every Page to encode its visual system.
  [WordPress Styles overview](https://wordpress.org/documentation/article/styles-overview/)
- Webflow separates centralized Variables from reusable Components and
  per-instance Component Variants. A variant supplies a predefined layout or
  style choice without requiring a separate component definition for each use.
  [Webflow Variables](https://help.webflow.com/hc/en-us/articles/33961268146323-Variables),
  [Webflow Components](https://help.webflow.com/hc/en-us/articles/33961303934611-Components-overview)
- Shopify separates a code-defined settings schema from merchant-selected
  values and supports several coherent theme presets from the same codebase.
  Its Theme Store requirements explicitly warn against unnecessarily deep or
  complicated configuration and require staff-facing names to describe the
  section's purpose.
  [Shopify theme settings data](https://shopify.dev/docs/storefronts/themes/architecture/config/settings-data-json),
  [Shopify theme requirements](https://shopify.dev/docs/storefronts/themes/store/requirements)

### Semantic content should survive redesigns

Sanity's current structured Page-building guidance recommends modeling content
for meaning rather than storing colors, floats, and other presentation details
inside the content model. That keeps content reusable across redesigns and
reduces what editors must understand.
[Sanity structured Page building](https://www.sanity.io/docs/developer-guides/how-to-use-structured-content-for-page-building)

### Tokens help portability but do not define product policy

The Design Tokens Community Group's 2025.10 format standardizes human-readable
typed token names, values, groups, and aliases in JSON. It is useful as an
interchange and migration influence. It does not decide which controls tenants
should receive, which combinations are accessible, or how Asym releases them.
[Design Tokens Format Module 2025.10](https://www.designtokens.org/TR/2025.10/format/)

### Provider versioning is a mechanism, not release authority

Payload Versions can preserve drafts, history, diffs, and restores for
Collections or Globals. D9 may qualify those features for authoring
persistence, but D1 still owns the immutable compiled public generation and
release proof.
[Payload Versions](https://payloadcms.com/docs/versions/overview),
[Payload Globals](https://payloadcms.com/docs/configuration/globals)

### Accessibility limits unsafe combinations

Every selectable presentation must preserve text contrast, meaningful order,
narrow-viewport reflow, keyboard use, focus visibility, and reduced-motion
behavior. A color value being syntactically valid does not make every role
assignment accessible.
[WCAG 2.2 contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html),
[WCAG 2.2 reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)

## Concrete staff scenario

Nina manages Hope Harbor Missions. She wants its public Site to feel warm,
story-led, and clearly distinct from another Asym tenant, but she does not know
CSS.

The desired low-guesswork experience is:

1. Nina opens **Website appearance** for the clearly named current Site.
2. She starts from a visual thumbnail such as **Warm & story-led**.
3. The product uses the Phase-2/24 Site logo and brand inputs, maps colors to
   semantic roles, and explains any inaccessible combination in plain language.
4. Nina previews real representative Pages and sections at desktop and narrow
   widths. The preview uses the same candidate compiler and renderer contract
   as public delivery.
5. While editing a Page, Nina sees **Section layout** only when that section
   has a meaningful choice, such as **Image alongside** or **Full width**. The
   thumbnails use Hope Harbor's actual brand and content.
6. The UI clearly labels a Site-wide appearance change as **Affects all pages
   and languages** and a Section Variant selection as **This section on this
   page**.
7. Nothing changes publicly merely because Nina saved a draft or previewed a
   choice.

Phase 24 owns the complete Site-appearance setup and management product. Phase
23 owns the ordinary Page's variant selection, presentation compatibility,
actual-Site preview integration, and exact release inputs.

## Options

### Option A — One conservative Site presentation

Each Site has one bounded profile: approved brand references, a role-based
color palette, one supported heading/body type pairing, and a few whole-Site
character choices such as density and corner treatment. Every D7 section has
one automatic presentation. Staff receive one simple Site preview and no
per-section visual choices.

**Benefits**

- Smallest setup burden and compatibility matrix.
- Strong consistency and easiest accessibility protection.
- Fewest renderer, migration, and support obligations.

**Costs and risks**

- Sites can carry different logos, colors, imagery, and type but may still feel
  structurally similar.
- Tenants are likely to request one-off CSS, duplicate semantic section types,
  or support-only exceptions to obtain layout variety.
- It underuses D8's already preserved compatible Section Variant seam.

### Option B-prime — One Site Presentation Profile plus bounded Section Variants — Recommended

Each Site resolves one immutable Site Presentation Profile Version. It
references one qualified Presentation Package, the exact Site Brand Version,
one bounded starting style/profile value set, and code-owned defaults. Each D7
semantic section may expose a small, demonstrated set of compatible named
Section Variants, selected per exact Page placement and stored independently
of semantic content.

Examples—not a ratified launch catalog—might include:

- Hero: **Centered** or **Image alongside**;
- Call to Action: **Band** or **Card**;
- Quote: **Simple** or **Image-led**;
- Cards: **Grid** or **Feature list**; and
- Media: **Full width** or **Contained**.

The editor shows thumbnail choices only where more than one qualified variant
exists, previews the actual Site/content at desktop and narrow widths, explains
whether a change is Site-wide or local, and provides **Use site default**.

At launch, Asym may ship only the standard qualified Presentation Package and
a bounded set of starting styles and variants. The profile nevertheless pins a
stable package ID/version so a later separately approved certified package can
be added without rewriting content or inventing a style bag now. No package
upload, marketplace, custom code editor, or tenant-authored renderer ships.

**Benefits**

- Meaningful tenant differentiation comes from Site brand roles, starting
  style, media, semantic section selection/order, and purposeful visual
  variants rather than arbitrary CSS.
- Semantic content remains durable and can survive redesigns.
- The ordinary editor stays small: most sections need no appearance decision,
  and each qualified choice is visual and purpose-named.
- The stable package seam preserves a credible bespoke future without building
  a plugin ecosystem or migration-heavy abstraction now.

**Costs and risks**

- Every variant adds accessibility, responsive, locale, preview, renderer,
  migration, compatibility, and performance proof.
- An undisciplined catalog could become a noisy style panel or reproduce a
  professional design tool poorly.
- Site-wide profile release and cross-locale activation still require their
  own next decision.

**Permanent controls**

- A variant is added only for demonstrated editorial value, uses the same
  semantic content contract, has one meaningful DOM order, and passes the
  complete public proof matrix.
- Token controls are semantic and bounded; no arbitrary property names,
  per-breakpoint values, raw units, selector strings, or CSS cascade enter
  tenant data.
- Unknown or incompatible package/profile/variant versions block the candidate
  and preserve the prior public generation.
- Presentation choices never alter content meaning, identity, route, SEO,
  Navigation, reach, review, approval, or source-owned truth.

### Option C-prime — Certified custom Presentation Packages at launch

Option C includes B's ordinary experience and launches a governed custom
development lane. A tenant may commission an experience whose structure,
components, typography, styling, art direction, motion language, loading
presentation, and section treatments are genuinely its own. Code may be
written by Asym, a qualified partner, or with AI assistance, but it enters the
same source-control, review, proof, deployment, and D1 release path as other
platform code. Tenant staff never paste, upload, install, or execute code in
Web Studio.

This option is viable only if **custom package** means a platform-admitted
renderer over portable semantic content—not an untrusted runtime plugin. Once
admitted and deployed, the code is platform-trusted code and must be treated
accordingly.

**Benefits**

- A tenant can receive distinctive information architecture, visual rhythm,
  components, transitions, loading presentation, and storytelling instead of
  merely receiving a new logo and palette on a shared template.
- Bespoke work remains inside Asym's public-data, semantic-content, preview,
  accessibility, checkout, and release contracts rather than becoming an
  unrelated website or a permanent content fork.
- A source-controlled lane accommodates skilled designers, developers, and AI
  generation without exposing a code editor or plugin system to ordinary staff.
- Exact package versions make bespoke work testable, attributable, supportable,
  and reversible through a proven successor generation.

**Costs and risks**

- Each active package is a maintained software product with an owner,
  dependency surface, compatibility range, performance envelope, and support
  window.
- Bespoke UI can accidentally couple content to one renderer, weaken the
  donation path, fail accessibility, or inflate public JavaScript and media.
- Code generated quickly by AI can contain invented dependencies, insecure
  patterns, inaccessible interaction, copied code, and logic no maintainer
  understands.
- One deployment serving many tenants creates a shared blast radius unless
  package inputs, imports, caches, assets, errors, and release bindings are
  exact and tenant-safe.

## Founder direction received

On 2026-08-21 the founder selected **C-prime** and clarified that custom
presentation is important at launch. The intended result is not a palette of
cookie-cutter themes. A tenant may commission its own components, blocks,
chrome, visual language, animations, loading treatment, and bounded UX
presentation so the Site faithfully expresses the tenant's complete brand.
AI-assisted development is expected. The founder also required a practical,
modern design that avoids both unsafe shortcuts and an over-engineered plugin
platform.

That direction changes the recommendation from B-prime to the hardened
C-prime-R below. The source-controlled custom lane launches; a tenant-facing
runtime code-upload lane, marketplace, and arbitrary extension runtime do not.

## Additional current official evidence for the selected direction

### Payload extension points do not provide tenant-code isolation

Payload describes a plugin as a function that receives and modifies the
Payload configuration, and its advanced API permits collection, field,
endpoint, hook, and component changes. Payload also recommends SemVer and
declared Payload compatibility for third-party plugins. These are useful
build-time application mechanisms, but they are regular trusted JavaScript—not
a security sandbox for tenant-submitted code. Asym may use Payload adapters
inside an admitted package workflow; a Payload plugin must never become the
tenant execution boundary.
[Payload plugin overview](https://payloadcms.com/docs/plugins/overview),
[Payload plugin API](https://payloadcms.com/docs/plugins/plugin-api),
[Payload build-your-own guidance](https://payloadcms.com/docs/plugins/build-your-own)

Payload Access Control and the multi-tenant plugin remain defense layers for
CMS records, not permission to send operational records into presentation
code. Payload's Local API skips access control by default unless the caller
explicitly supplies the user and sets `overrideAccess: false`, which makes any
package access to the Payload instance an unacceptable tenant-isolation
footgun. D9 therefore accepts only Phase-5/10-qualified public view models and
never exposes the Local API to package code.
[Payload Access Control](https://payloadcms.com/docs/access-control/overview),
[Payload multi-tenant plugin](https://payloadcms.com/docs/plugins/multi-tenant),
[Payload Local API access control](https://payloadcms.com/docs/local-api/access-control)

### Mature theme ecosystems combine creative code with strict contracts

Shopify permits code-defined sections, blocks, settings, and theme-specific
presentation, while requiring modularity, purpose-led settings, merchant
preview, performance, and accessibility. Its guidance favors native browser
features and minimal JavaScript. Theme Check supplies static analysis rather
than treating arbitrary code as intrinsically safe. This supports a rich
source-controlled package lane, not raw code pasted into tenant settings.
[Shopify theme settings](https://shopify.dev/docs/storefronts/themes/architecture/settings),
[Shopify theme best practices](https://shopify.dev/docs/storefronts/themes/best-practices),
[Shopify design guidance](https://shopify.dev/docs/storefronts/themes/best-practices/design),
[Shopify performance guidance](https://shopify.dev/docs/storefronts/themes/best-practices/performance),
[Shopify accessibility guidance](https://shopify.dev/docs/storefronts/themes/best-practices/accessibility),
[Shopify Theme Check](https://shopify.dev/docs/storefronts/themes/tools/theme-check/index)

Comparable nonprofit products commonly permit branded site shells or embedded
fundraising widgets while retaining a controlled donation/payment surface.
That is the right product boundary here: distinctive public presentation may
surround—but may not reimplement—the authoritative give handoff and checkout.
[Neon One web themes](https://support.neonone.com/hc/en-us/articles/4416826302989-Web-Themes),
[Neon One donation-form release notes](https://support.neonone.com/hc/en-us/articles/36436997553677-Neon-CRM-Release-Notes-May-10th-2025),
[Givebutter widgets](https://help.givebutter.com/en/articles/6464859-how-to-use-givebutter-widgets-on-your-website)

### Certification needs evidence tied to an exact artifact

SLSA provenance identifies where, when, and how an artifact was produced.
GitHub artifact attestations can bind build provenance to an artifact, while
dependency review detects dependency changes before merge. CISA's current SBOM
minimum elements provide a useful dependency-inventory floor. D9 does not
claim a generic compliance badge: evidence is bound to one exact package
artifact and compatible platform generation.
[SLSA build requirements](https://slsa.dev/spec/v1.2/build-requirements),
[SLSA provenance](https://slsa.dev/spec/v1.2/provenance),
[GitHub artifact attestations](https://docs.github.com/en/actions/concepts/security/artifact-attestations),
[GitHub dependency review](https://docs.github.com/en/code-security/concepts/supply-chain-security/dependency-review),
[CISA 2025 SBOM minimum elements](https://www.cisa.gov/sites/default/files/2025-08/2025_CISA_SBOM_Minimum_Elements.pdf)

AI assistance does not reduce this burden. GitHub advises human review and
testing of AI-generated code, including security and licensing concerns. The
NIST SSDF GenAI profile applies source-code assurance regardless of whether a
human or model generated the source. AI output may accelerate authoring; it
cannot self-certify or move directly to production.
[GitHub reviewing AI-generated code](https://docs.github.com/en/copilot/tutorials/review-ai-generated-code),
[GitHub matching public code](https://docs.github.com/en/copilot/how-tos/get-code-suggestions/find-matching-code),
[NIST SSDF GenAI profile](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=958391)

### Brand motion is allowed; inaccessible or obstructive motion is not

Custom motion may express a tenant's brand, but substantial motion must honor
the user's reduced-motion preference, interaction-triggered motion must be
disableable when WCAG requires it, and moving or auto-updating content must
provide pause, stop, or hide behavior when applicable. Native scrolling and
meaningful server-rendered content are the default; scroll hijacking, fake
loading delays, or animation that blocks content and giving actions are not.
[WCAG Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html),
[WCAG Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html),
[MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion)

### Public security and performance remain package invariants

A strict Content Security Policy limits resource origins and script execution,
but remains defense in depth rather than a substitute for sanitization and safe
rendering. Package certification therefore forbids production `eval`, raw
runtime module URLs, unrestricted third-party scripts, and public production
source maps. External origins are exact, reviewed manifest capabilities.
[MDN Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP),
[Vercel Conformance](https://vercel.com/docs/conformance),
[Vercel Conformance rules](https://vercel.com/docs/conformance/rules)

The public proof target is the current good Core Web Vitals threshold at the
75th percentile: LCP at or below 2.5 seconds, INP at or below 200 milliseconds,
and CLS at or below 0.1. These are outcome gates, not permission to consume the
entire budget. Package-specific synthetic and real-user evidence must identify
regressions by safe Site, package, version, and generation identifiers.
[Core Web Vitals thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds),
[Vercel Speed Insights](https://vercel.com/docs/speed-insights),
[Vercel Observability](https://vercel.com/docs/observability)

A single multi-tenant Next.js application still shares deployment and function
limits. Package isolation must therefore be logical, build-time, and
release-bound: content-addressed assets, statically analyzable imports,
package-level chunks, bounded dependencies, and a lifecycle policy are safer
than runtime variable imports or indefinite inclusion of every historical
package in every route.
[Vercel multi-tenant application guidance](https://vercel.com/kb/guide/nextjs-multi-tenant-application),
[Vercel Function limits](https://vercel.com/docs/functions/limitations)

## Hardened trust and architecture contract

### The custom lane

1. A tenant selects **Custom-built website experience** for one exact Site.
   This opens a managed design-and-development project, not a code editor.
2. Asym or an explicitly qualified partner develops the package in source
   control. AI may assist, but a named human maintainer must understand and own
   the submitted code.
3. A pull request and deterministic build produce one immutable package
   artifact and proof manifest. Required platform, security, accessibility,
   and package code owners review it.
4. A deployed, admitted package may be selected in one prospective Site
   Presentation Profile Version. Saving, previewing, or approving the design
   does not activate it.
5. D1's Public Site Generation pins the exact compatible package, profile,
   component/variant registry, semantic catalog, assets, content, and public
   projection inputs. There is no second package activation head.
6. A package change produces an immutable successor version and a new proven
   Site generation. Failed candidates leave the current generation live.

### Allowed package authority

A qualified package may own:

- Site chrome and public Page presentation;
- custom React renderers, markup, typography, styling, visual composition,
  responsive behavior, and package-private presentational components;
- compatible renderers and named variants for D7/D8 semantic sections;
- distinctive but accessible motion, transitions, progressive loading
  presentation, and native-scroll enhancements;
- presentation of Phase-10-filtered public projections; and
- package-specific public assets and fonts admitted through exact manifest
  capabilities and Phase-29-qualified media references.

This permits genuinely bespoke implementations. Two packages need not share
DOM shape, layout, styling, motion language, or visual component code merely
because they render the same semantic content.

### Authority the package never receives

A package may not own or directly access:

- Tenant identity, authentication, authorization, Supabase, Payload records,
  environment secrets, cookies, file-system/process APIs, server actions, or
  arbitrary network fetches;
- money, designation, cart, checkout, consent, receipting, accounting,
  restricted-worker publication, route, canonical, SEO, or source truth;
- raw database models or unfiltered person/missionary/project records;
- new content semantics hidden in a visual component; or
- an independent publish, deploy, rollback, or activation pointer.

The renderer receives one versioned, serialized **Public Presentation View
Model** containing only D7/D8 semantic content and Phase-5/10-qualified public
projections. A narrow platform capability SDK supplies canonical interactive
islands such as the give CTA/handoff, consent, forms, and other privileged
behaviors. Package code may present those capabilities but may not duplicate,
replace, or bypass their authority.

If bespoke design requires a genuinely new semantic content purpose, D7's
separately governed additive catalog seam must admit it first. D9 may then
provide a unique renderer. This prevents both a cookie-cutter visual product
and nonportable package-specific content silos.

### Presentation Package Manifest

Each candidate manifest closes over:

- immutable package ID, semantic version, artifact digest, source repository,
  source commit, build identity, and provenance attestation;
- exact Tenant × environment × Site bindings; reuse requires another explicit
  compatible Site binding—never a wildcard or inferred tenant relationship;
- named package owner, maintainer, support window, lifecycle state, and
  emergency contact;
- compatible platform, Public Presentation SDK, semantic catalog, compiler,
  renderer, schema, and Site Presentation Profile generations;
- supported Page families, locales/directions, component IDs, Section Variant
  IDs, and public capability requests;
- dependency lock, SBOM, licenses, reviewed external origins, public assets,
  fonts, CSS boundaries, and CSP requirements;
- JavaScript, CSS, font, image, route, and motion budgets;
- fallback-renderer compatibility and no-JavaScript behavior; and
- content-fixture, browser, responsive, locale, accessibility, privacy,
  security, performance, visual-regression, and failure-recovery evidence.

Unknown, missing, revoked, incompatible, or digest-mismatched inputs block the
candidate. The system never guesses a package, silently substitutes another
tenant's package, or treats a preview build as production proof.

### Code, dependency, CSS, and browser boundaries

- Package imports are statically analyzable and restricted to its own files,
  approved platform presentation APIs, and reviewed pinned dependencies.
- No tenant package gets open-semver dependencies, runtime `eval`, URL module
  loading, arbitrary npm installation, global middleware, raw HTML execution,
  or unreviewed external scripts.
- New third-party dependencies require dependency, license, provenance, size,
  and maintenance review. Platform-provided pinned dependencies are preferred
  to duplicated package copies.
- CSS is rooted and layered beneath an exact package/Site namespace. A package
  may not reset the global document outside its root or restyle protected
  platform capability islands by accident.
- Assets are content-addressed; public production source maps and original
  development filenames are not exposed by default.
- Meaningful content, Navigation, and the give path render server-first. Client
  code enhances rather than gates them; package-only enhancements are loaded
  only where needed.

### Accessibility, motion, and performance proof

WCAG 2.2 AA, keyboard operability, visible focus, semantic order, zoom/reflow,
contrast, forced-colors resilience, touch targets, and reduced-motion behavior
are platform floors—not tenant preferences. Certification combines automated
checks with manual keyboard, screen-reader, zoom, motion, and representative
device review.

Motion may be bold, but it must be interruptible and must not carry the only
meaning, trap or replace native scrolling, reorder focus, delay already-ready
content, or block a donation action. A no/reduced-motion treatment is designed,
not generated by merely setting every duration to zero. Full-page ornamental
preloaders may not manufacture waiting time.

Proof uses minimum, representative, and maximum-shape real-content fixtures:
missing and oversized media, long text, empty optional fields, slow or failed
fonts/assets, JavaScript disabled or failed, narrow screens, zoom, all supported
locales, long translations, RTL where supported, restricted-worker public
projections, and the tenant's actual donation CTA. Core Web Vitals are tested
in the lab and monitored at the 75th percentile in production by package and
generation.

### AI-assisted source

AI-generated source receives no shortcut and no special presumption of risk or
quality. The submitting human must be able to explain and maintain it. The
same compile, type, lint, unit, contract, integration, accessibility, browser,
security, dependency, license, performance, and human-review gates apply.
Direct model-to-production publication and package self-certification are
forbidden. The review records that AI assisted the package without storing
prompts, private tenant material, or model transcripts as public evidence.

Any imported or generated code that must execute before admission runs only in
an isolated, disposable nonproduction environment with synthetic/public-safe
fixtures, no production secrets, and restricted egress. A successful sandbox
run is evidence—not certification—and `node:vm` is explicitly not a security
mechanism for untrusted code.
[Node.js `vm` documentation](https://nodejs.org/api/vm.html)

## Staff and public experience

### Tenant staff and designer workflow

The ordinary Page editor remains semantic and quiet. It does not expose source
code, npm, manifests, CSP, internal versions, or hundreds of design knobs.
Staff see only compatible, demonstrated choices supplied by the active package.

The custom project workspace uses seven plain-language steps:

1. **Choose the Site and scope.** Show the exact Site, Page families, locales,
   and what remains platform-controlled.
2. **Describe the brand experience.** Capture brand references, voice, visual
   examples, desired movement, representative Pages, mobile priorities, and
   donor journey—not implementation settings.
3. **Build safely.** The designer/developer works in source control with
   synthetic or already-public-safe content.
4. **Preview with real shapes.** A shareable, access-controlled preview labels
   exact Site, package candidate, locale, and freshness; staff compare current
   and candidate versions on desktop and mobile.
5. **Resolve exceptions.** One exception-first checklist explains issues in
   plain language and names the responsible developer; healthy proof stays
   quiet.
6. **Approve the design intent.** Tenant staff approve what the Site looks and
   feels like. They do not certify code, security, or accessibility.
7. **Release through D1.** The platform performs final compatibility and
   generation reproof; the UI reports candidate, live, or blocked without
   conflating approval with publication.

The certification summary says, in plain language, whether brand presentation,
mobile behavior, keyboard and screen-reader use, reduced motion, performance,
privacy, dependencies, and the give handoff passed. Advanced evidence remains
available to developers and auditors without becoming everyday staff noise.

### Donor, missionary, and public experience

- Sites may feel radically different, but the designation and give action
  remain understandable, trustworthy, and consistent with the platform's
  authoritative checkout handoff.
- A custom package may not add avoidable steps, obscure donation amounts or
  designations, mimic system errors, or trade basic readability for brand
  spectacle.
- Missionaries and ordinary staff continue authoring portable semantic content;
  they are not asked to understand the custom implementation.
- When decorative JavaScript, animation, a font, or a third-party asset fails,
  meaningful content, navigation, and the give path remain usable.

## Ruthless adversarial review

The review treats a concern as evidence that a permanent control is required,
not as a reason to reject all custom presentation.

| Category                              | Concern? | What could go wrong and why it matters                                                                                                                                                                                                                       | Severity | Likelihood without controls | Permanent fix or prevention                                                                                                                                                                                                                                                 |
| ------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Brittleness**                       | **Yes**  | A renderer coupled to private Payload fields, internal CSS, a specific content shape, or current framework behavior can break during locale expansion or platform upgrades. One visual flourish can also make the whole Page dependent on client JavaScript. | High     | High                        | Consume only a versioned Public Presentation View Model and narrow capability SDK; pin compatibility generations; contract-test every package; preserve meaningful SSR/no-JS output and a qualified fallback.                                                               |
| **Technical debt**                    | **Yes**  | Copy-pasted tenant forks, private utility layers, duplicated dependencies, and ownerless packages make every security, accessibility, and platform fix repeat across tenants.                                                                                | High     | High                        | Require one manifest, named maintainer and support window; keep semantic contracts shared; prefer platform dependencies/primitives; permit package-private code only for real brand value; upstream reusable fixes; prohibit package inheritance mazes.                     |
| **Edge cases**                        | **Yes**  | Missing media, long names, empty sections, long or RTL translations, restricted workers, failed fonts, slow networks, disabled JavaScript, multiple tenant Sites, stale previews, and removed packages can produce blank, unsafe, or misleading Pages.       | High     | High                        | Certify minimum/representative/maximum fixtures across locales, directions, viewports, failures, and public-safety tiers; bind exact Site/package inputs; require fallback fonts, no-JS behavior, and candidate reproof.                                                    |
| **Footguns**                          | **Yes**  | A staff member or AI could paste executable code; a developer could import secrets/database clients, use raw HTML, escape the CSS root, add an unreviewed tracker, hijack scrolling, or re-create checkout.                                                  | Critical | Medium–high                 | No Web Studio code upload or install; static import restrictions; protected capability islands; sanitized rendering and strict CSP; code-owner review; automated forbidden-API/CSS/dependency checks; platform-owned checkout.                                              |
| **Tenant safety**                     | **Yes**  | A package, cache key, preview, asset, or telemetry tag could leak another tenant's content or make one Site use another Site's presentation.                                                                                                                 | Critical | Medium                      | Give packages only public-safe serialized inputs; require exact Tenant × environment × Site manifest bindings and cache namespaces; keep RLS/publication firewall upstream; run cross-tenant negative tests; never infer or wildcard reuse.                                 |
| **Over-engineering**                  | **Yes**  | A marketplace, remote-code sandbox, package inheritance system, arbitrary schema DSL, or self-service plugin ecosystem would consume years and create more attack and migration surface than launch demand warrants.                                         | High     | Medium                      | Launch one managed source-control package type, one manifest, and one certification/release path. Exclude runtime uploads, marketplace/install UX, arbitrary data schemas, and remote plugin execution.                                                                     |
| **UX/UI and user friction**           | **Yes**  | Staff could face developer jargon, endless options, an inaccurate preview, or confusion between design approval and public release; donors could encounter theatrical motion or an unfamiliar give flow.                                                     | High     | Medium–high                 | Keep ordinary editing semantic; use a guided brief, actual-shape compare preview, exception-first proof, clear scope/impact, and separate design approval from D1 publication; preserve canonical give capability and accessibility.                                        |
| **Hidden coupling**                   | **Yes**  | Custom components can quietly depend on routes, internal database fields, operational APIs, global selectors, Phase-22 layouts, or checkout implementation details, making unrelated changes dangerous.                                                      | High     | High                        | Enforce a stable presentation boundary, protected platform islands, forbidden imports, CSS root/layers, capability contracts, consumer-driven contract tests, and explicit D7 admission for new semantics.                                                                  |
| **Failure modes**                     | **Yes**  | Builds can fail; a component can throw; CSS/CSP can hide content; assets can disappear; a dependency can be revoked; a candidate can pass preview but fail production. Without a defined response, staff may publish blank or unsafe Pages.                  | High     | Medium                      | Fail closed before activation; use component/error boundaries and meaningful server output; retain the current generation; require a pre-qualified standard/degraded renderer; use smallest-scope adverse containment and observable successor recovery.                    |
| **Data integrity risks**              | **Yes**  | Package-specific content fields can strand tenant content; incompatible or unknown component IDs can silently omit material; mutable package settings can make the same release render differently later.                                                    | High     | Medium                      | Keep content truth in D7/D8 semantic contracts; content-address and version every presentation input; reject unknown mappings; require manifest closure; add semantics only through D7; make changes immutable successors.                                                  |
| **Security and privacy risks**        | **Yes**  | XSS, unsafe HTML, compromised dependencies, data exfiltration, public source maps, private preview leakage, or restricted-worker facts reaching a custom renderer could harm people and all tenants sharing the application.                                 | Critical | Medium                      | Apply Phase-10 filtering before the renderer; sanitize and use strict CSP; prohibit unrestricted network/secrets/data clients; require provenance, SBOM, dependency/license review, secret scanning, private previews, source-map controls, and revocation.                 |
| **Scalability and performance risks** | **Yes**  | Many packages and versions can inflate builds, server bundles, JavaScript, CSS, fonts, images, and test matrices. Brand animation can damage LCP, INP, CLS, battery use, and low-end mobile completion.                                                      | High     | High over time              | Isolate content-addressed chunks/assets; set package and route budgets; prefer server/native CSS/browser features; lazy-load optional enhancements; deduplicate dependencies; establish retention/LTS policy; use lab plus package-tagged real-user monitoring.             |
| **Operational burden**                | **Yes**  | Every bespoke package needs upgrades, vulnerability response, design changes, accessibility fixes, and a person who can diagnose it. An orphaned package becomes an unpatchable production dependency.                                                       | High     | High                        | Require owner, maintainer, support window, compatibility dashboard, deprecation/successor plan, standardized certification, and explicit commercial/support responsibility before activation.                                                                               |
| **Observability gaps**                | **Yes**  | Shared logs without package/generation context make one-tenant errors, CSP violations, hydration failures, or performance regressions hard to find and reproduce.                                                                                            | High     | Medium                      | Tag errors, CWV, CSP reports, release events, bundle evidence, and certification results with safe Tenant/Site/package/version/generation identifiers; exclude PII/content; show package health and owner.                                                                  |
| **Dependency and integration risks**  | **Yes**  | An abandoned npm package, open version range, invented AI dependency, provider API change, unreviewed font/script origin, or Payload/Next mismatch can compromise or strand a Site.                                                                          | High     | High                        | Pin and lock dependencies; prefer platform-provided libraries; use dependency review, SBOM, license/provenance checks, origin allowlists, compatibility ranges, upgrade tests, and platform adapters; prohibit tenant-managed third-party scripts.                          |
| **Migration and upgrade risks**       | **Yes**  | React, Next.js, Payload, SDK, schema, or catalog upgrades can make a tenant package impossible to build; visual content forks can prevent export or renderer replacement.                                                                                    | High     | High over product life      | Version the SDK and compatibility contract; maintain a cross-package test matrix and deprecation window; assign upgrade ownership; keep semantic content exportable; keep the prior generation until a successor proves; use codemods only where evidence supports them.    |
| **Other development hazards**         | **Yes**  | Stale design approval, branch drift, race conditions between content/profile/package releases, non-reproducible builds, TOCTOU, blind retry, or pointer rollback can activate a different artifact than staff reviewed.                                      | High     | Medium                      | Bind source commit, artifact digest, profile, content/assets, actor, permissions, and code/schema generations in one candidate manifest; reprove inside D1's idempotent CAS release; use deterministic builds, concurrency/fault tests, and append-only successor recovery. |

## Ruthless synthesis and permanent implementation order

1. **Freeze the trust model first.** Define Presentation Package, Public
   Presentation View Model, platform capability island, exact Site binding,
   and the prohibition on runtime tenant code. If this boundary is fuzzy,
   everything downstream is unsafe.
2. **Stabilize portability before custom rendering.** Complete the versioned
   D7/D8 semantic renderer contract and Phase-5/10 public projection boundary.
   A custom package must not become the only place its content can exist.
3. **Build the smallest real package lane.** One source-controlled workspace,
   one static import boundary, one manifest/proof format, one deterministic
   artifact, and one owner/support contract. Do not build a marketplace,
   production tenant-code sandbox, or user-installed plugin system.
4. **Protect privileged interactions.** Deliver give/checkout, consent,
   restricted publication, forms, and other sensitive behavior as canonical
   platform capabilities that packages can compose but cannot reimplement.
5. **Make certification production-shaped.** Test actual content extremes,
   supported locales, tenant separation, accessibility, reduced motion,
   browser/device behavior, CSP, dependencies, performance, no-JS/failure
   behavior, and the exact donation handoff.
6. **Give staff a design workflow, not a developer console.** Brief, preview,
   compare, exception resolution, and design-intent approval should be obvious;
   code evidence is available but quiet. The ordinary Page editor stays simple.
7. **Bind and observe one release.** D1 pins the exact admitted package and
   inputs, rechecks compatibility at CAS activation, leaves the prior generation
   live on failure, and emits package/generation-qualified health evidence.
8. **Activate the first custom Site only after the entire path proves.** Use a
   real maximum-shape tenant package as the tracer bullet. Expand dependencies,
   capabilities, or partner access only from observed demand and evidence.

The result is deliberately asymmetric: tenants receive broad creative freedom
and genuinely bespoke public Sites; executable authority remains narrow,
reviewed, versioned, and platform-owned. This is materially more flexible than
a token-only theme and materially simpler and safer than an untrusted plugin
platform.

## Founder-ratified C-prime-amended-and-hardened formulation

**C-prime-amended-and-hardened (C-prime-R) — Certified, Site-bound custom
Presentation Packages over portable semantic content and platform-owned
capability islands:** launch one managed custom-development lane in which Asym
or an explicitly qualified partner—including AI-assisted development under a
named human maintainer—may create genuinely bespoke Tenant presentation code
for an exact environment × Site: custom public chrome, DOM and responsive
composition, components, D7/D8-compatible section renderers and variants,
typography, styling, art direction, motion, transitions, progressive loading,
and native-scroll presentation. Any pre-admission execution of imported or
AI-produced code is confined to an isolated, disposable nonproduction
environment without production data or secrets; sandbox success never equals
certification. Each immutable package version is admitted only from reviewed
source through a deterministic build and a content-addressed artifact whose
manifest binds the exact Tenant/Site scope, source commit, provenance, SBOM,
licenses, pinned dependencies, owner/support window,
platform/SDK/catalog/compiler compatibility, Page families/locales, component
registry, public assets/origins, budgets, fallback behavior, and complete
security, privacy, tenant-isolation, accessibility, reduced-motion,
responsive/locale, no-JavaScript, visual, performance, donation-handoff, and
failure-recovery evidence. Package code receives only one versioned serialized
Public Presentation View Model containing D7/D8 semantic content and
Phase-5/10-qualified public projections plus narrow canonical platform
capabilities for privileged interactions; it never receives operational
records, Supabase/Payload clients, auth, secrets, arbitrary network or server
authority, money or checkout truth, restricted-worker decisions, or a private
release head. Radically different visual implementations are permitted, but a
new semantic content purpose must first enter through D7's separately governed
additive catalog seam, preserving content portability and a qualified standard
fallback. Phase 22's Site × specialized-family consistency remains intact,
Phase 24 alone owns complete Site/package selection and settings UX, and Phase
29 alone owns media bytes and qualified public renditions. Tenant staff use a
quiet brief → actual-content preview/compare → exception resolution →
design-intent approval flow and see only compatible purpose-named choices in
ordinary editing; they do not certify code or manage packages. D1 alone pins
and CAS-activates the exact deployed package, profile, content, assets, and
code/schema generation; failures preserve the current public generation, and
fixes, revocations, fallbacks, and rollbacks occur by smallest-scope containment
and an immutable proven successor. This launches bespoke brand expression
without runtime code/CSS upload, `eval`, URL modules, arbitrary HTML or
unreviewed/package-managed third-party scripts, tenant npm/plugin installation,
a marketplace or production tenant-code sandbox, Payload plugins as isolation,
package inheritance mazes, package-specific content silos, self-certification,
direct-model-to-production publication, scroll hijacking, fake loading delays,
inaccessible motion, obscured giving, silent package substitution, mutable
production package pointers, or any second public truth or release authority.

## Deliberate non-decisions

At D9 ratification, D9 did not decide:

- the exact launch Presentation SDK API, manifest wire format, repository or
  deployment topology, package price, qualified-partner program, or support
  tiers;
- the exact token roles, font allowlist, standard package starting styles, or
  launch Section Variant inventory;
- the exact Site-wide/cross-locale activation mechanics, which the later
  founder-ratified D10 now resolves without weakening D1's sole generation
  authority;
- the complete Phase-24 Site-appearance administration and cross-Site copy
  product;
- new D7 semantic section purposes, future Page-local containers, or arbitrary
  tenant-defined schemas;
- Phase-29 media storage and transformation mechanics; or
- any implementation, schema, migration, issue, deployment, or production
  change before specification and ticketing.

## Ratification

The founder ratified the exact **C-prime-R** formulation above as **Phase 23
D9** on 2026-08-21. The decision log and ADR-0153 carry the binding authority;
this document preserves the supporting research, adversarial review, and proof
requirements. Ratification authorizes no implementation, schema, migration,
provider adoption, issue publication, deployment, release activation, or
production change.
