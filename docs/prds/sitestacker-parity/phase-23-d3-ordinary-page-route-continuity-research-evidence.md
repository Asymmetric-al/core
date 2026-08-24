# Phase 23 D3 Ordinary Page Route Continuity — Research Evidence

**Status:** Supporting research for founder-ratified Phase 23 D3 C-prime-R  
**Date:** 2026-08-15  
**Authority:** Evidence only; D3 authority is recorded in the Phase 23 decision
log and ADR-0147. This document does not create a PRD, authorize
implementation, select a provider, or change production behavior.

## Decision seam

Founder-ratified D2 derives the exact old-to-new path delta for a Page move but
intentionally does not decide what the former address does. A path-changing
generation cannot activate safely until Phase 23 establishes the ordinary Page
continuity rule.

The founder decision is:

> When a Phase-23-owned ordinary Page changes path or stops being public, what
> should its former public address do, who chooses that outcome, and how much
> redirect machinery should staff manage?

This decision does not reopen Phase 22. Missionary and Project/Campaign Page
routes remain governed by Phase 22 D8's source-qualified Public Page Route
Disposition Case.

## Current repository evidence

- [`cms-admin-redirect.spec.ts`](../../../tests/e2e/cms-admin-redirect.spec.ts)
  verifies only that unauthenticated staff are redirected from Web Studio to
  login. It is not evidence of a tenant CMS redirect product.
- [`apps/admin/next.config.ts`](../../../apps/admin/next.config.ts) contains
  code-owned compatibility redirects for `/mc`; these are application routes,
  not tenant content truth.
- [`apps/donor/next.config.ts`](../../../apps/donor/next.config.ts) contains a
  few static compatibility redirects. They require deployment and cannot be
  the mutable Tenant × Site × locale route authority selected by D1–D2.
- Payload's checked-in
  [`redirects.mdx`](../../../vendor/payload-upstream/docs/plugins/redirects.mdx)
  explicitly says the plugin stores redirect records but does not enforce them
  in the front end.
- The checked-in plugin
  [`index.ts`](../../../vendor/payload-upstream/packages/plugin-redirects/src/index.ts)
  defaults to one globally unique `from` value and public read access. Those
  defaults are not Asym's exact Site/locale scope or server-only public
  boundary and cannot define the product contract.
- The installed Next.js `16.2.6` bundled documentation distinguishes permanent
  and temporary framework redirects and notes that static configuration has
  platform limits. A large tenant-managed map needs request-time resolution,
  but that does not require a Bloom filter, Edge Config, or proxy-first design
  before measured scale justifies it.

There is therefore no general redirect product to preserve. The current
implementation is a migration input and a set of stop conditions.

## Payload v4 exact behavior (commit-qualified audit)

This repository pins `payload` and its first-party packages to
`4.0.0-internal.1f9ae9a` in [`package.json`](../../../package.json) and
[`apps/admin/package.json`](../../../apps/admin/package.json). That suffix maps
to Payload commit
[`1f9ae9ab37bd7a69894762c833fad3e65124c314`](https://github.com/payloadcms/payload/commit/1f9ae9ab37bd7a69894762c833fad3e65124c314).
As of this evidence date, npm labels `3.88.0` as `latest`,
`4.0.0-canary.28` as `canary`, and `4.0.0-internal.567a487` as `internal` for
`@payloadcms/plugin-redirects`; therefore current docs are directional where
they differ, while the pinned commit is the exact runtime source.
[npm version history](https://www.npmjs.com/package/@payloadcms/plugin-redirects?activeTab=versions)

### Redirect storage is not route authority

- The pinned redirect plugin injects a collection whose default `from` field
  is indexed and **globally unique**, whose default `read` access is public,
  and whose target is either a configured document relationship or an
  unrestricted custom URL. An HTTP status selector appears only when the host
  opts into `redirectTypes`. The default collection has no Tenant, Site,
  environment, locale, draft/version, release-generation, loop/chain, reserved
  path, or target-eligibility contract.
  [exact pinned plugin source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/plugin-redirects/src/index.ts)
- Payload's official documentation is explicit that the plugin only manages
  redirect records in the Admin Panel and database; the frontend must perform
  the redirect.
  [Payload redirects documentation](https://payloadcms.com/docs/plugins/redirects)
- The pinned official website template is illustrative, not a production
  contract: it loads and caches the entire redirect collection, finds a source
  with an array scan, omits `overrideAccess: false`, and calls Next.js
  `redirect()` without using the plugin's optional status field. Its plugin
  wiring invalidates after change but does not demonstrate after-delete
  invalidation. It contains no Tenant/Site/locale constraint or D1 generation
  proof.
  [resolver](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/templates/website/src/components/PayloadRedirects/index.tsx),
  [query/cache](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/templates/website/src/utilities/getRedirects.ts),
  [plugin wiring](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/templates/website/src/plugins/index.ts)

### Drafts, hooks, localization, tenancy, and access remain inputs

- Payload drafts/versions correctly preserve document revisions, inject
  `_status`, and keep later `draft: true` updates in the versions table until
  explicit publication. That is document publication, not D1's atomic Site
  Plan release across Pages, paths, navigation, and continuity outcomes.
  [Payload drafts documentation](https://payloadcms.com/docs/versions/drafts)
- In the pinned update operation, collection `afterChange` hooks still run
  after a draft/autosave version is saved; the hook arguments expose only
  `create` or `update`, not the `draft` or `autosave` flags. A generic
  `afterChange` hook must therefore never infer that a Page became publicly
  released.
  [pinned update operation](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/collections/operations/utilities/update.ts),
  [pinned hook types](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/collections/config/types.ts),
  [Payload collection hooks](https://payloadcms.com/docs/hooks/collections)
- Payload localization is field-level and falls back by default. Per-locale
  `_status` is an opt-in beta feature and is off by default. Asym currently
  configures neither Payload localization nor that experiment, so Payload
  cannot silently become the locale route or release authority.
  [Payload localization documentation](https://payloadcms.com/docs/configuration/localization)
- Payload's multi-tenant plugin can add tenant fields, Admin filtering, tenant
  assignment, and access constraints, but it is not installed in the current
  config. Even its official frontend example explicitly filters by tenant and
  sets `overrideAccess: false`; the plugin does not infer Asym's Site,
  environment, locale, route-family, or release-generation scope.
  [Payload multi-tenant documentation](https://payloadcms.com/docs/plugins/multi-tenant),
  [exact pinned plugin source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/plugin-multi-tenant/src/index.ts)
- Payload Local API operations bypass access control by default. The present
  Asym public reader correctly supplies an exact tenant-and-published filter
  and `overrideAccess: false` in
  [`published-content-reader.ts`](../../../apps/admin/src/cms/public/published-content-reader.ts).
  Any future compiler/resolver must preserve that server-owned posture and
  thread the request through nested operations for transaction continuity.
  [Payload Local API documentation](https://payloadcms.com/docs/local-api/overview)

**Provider boundary:** Payload may own editor persistence, fields,
relationships, drafts/versions, and hook extension points. Asym must own the
normalized Tenant × environment × Site × locale route claim, automatic
same-Page predecessor lineage, exact manual exceptions, collision and
reserved-path checks, loop/chain prevention, Phase 10/22 eligibility, D1
compile-and-CAS activation, public redirect enforcement, cache/search
convergence, telemetry, and recovery. Installing either Payload plugin would
not change that authority boundary.

## Current official benchmark findings

### Search engines

Google recommends an exact old-to-new mapping, server-side permanent redirects
for genuine permanent moves, direct targets rather than chains, and keeping
redirects for at least one year—longer is better for users. It warns against
sending unrelated removed URLs to the homepage and accepts a real `404` or
`410` when no replacement exists.

Sources:

- [Google site moves](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
- [Google redirects](https://developers.google.com/search/docs/crawling-indexing/301-redirects)
- [Google crawling errors](https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors)

Bing likewise distinguishes permanent moves from genuinely temporary routing
and expects deleted content to return not found rather than an irrelevant
fallback.

Source:
[Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)

### CMS operator experience

- Webflow places redirect creation beside slug editing and also offers a
  central list. Its optional checkbox demonstrates the right context but the
  wrong safety default: an ordinary same-Page move should not depend on staff
  remembering it.
  [Webflow redirects](https://help.webflow.com/hc/en-us/articles/33961294898835-How-do-I-set-up-redirects-in-Webflow)
- SiteStacker similarly exposes redirects from an individual Page and a
  Site-level management surface. This supports a quiet Page explanation plus
  one bounded repair workspace.
  [SiteStacker redirects](https://training.sitestacker.com/support/solutions/articles/151000114986-how-to-redirect-a-url)
- Payload explicitly supplies storage rather than public enforcement. A
  Payload record is not `Live` until the governed public resolver enforces its
  released effect.
  [Payload redirects plugin](https://payloadcms.com/docs/plugins/redirects)
- Sanity recommends relevant destinations, one source outcome, direct final
  targets, validation, and an explicit Page-versus-redirect precedence rule.
  [Sanity redirect guidance](https://www.sanity.io/docs/developer-guides/managing-redirects-with-sanity)

### Runtime and security

Next.js supports permanent and temporary server redirects, but static
`next.config` redirects run before filesystem routes, pass query values, have
platform limits, and require deployment. Those semantics are infrastructure
facts, not a safe tenant product contract.

Sources:

- [Next.js redirect guide](https://nextjs.org/docs/app/guides/redirecting)
- [Next.js redirect configuration](https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects)

OWASP classifies unvalidated external destinations as an open-redirect and
phishing risk. Arbitrary external URLs therefore cannot be slipped into an
ordinary manual field.

Source:
[OWASP Unvalidated Redirects](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html)

## Options

### Option A — Manual decision for every changed address

Every Page move, web-address edit, unpublish, and retirement blocks until staff
configure the former address.

**Benefits**

- maximum explicit choice; and
- no hidden automatic behavior.

**Costs and risks**

- routine moves become administrative work;
- a branch move can create hundreds of repetitive choices;
- staff must understand redirect consequences; and
- omissions become broken links.

### Option B — Broad automatic replacement

Every former address automatically redirects to a new Page, a related Page,
or the homepage.

**Benefits**

- almost no staff work; and
- few visible not-found results.

**Costs and risks**

- the system invents editorial meaning;
- unrelated homepage redirects behave like soft not-found responses;
- retirement can conceal that content is genuinely gone; and
- generic replacement logic could misroute Phase 22 supporters or disclose a
  protected identity.

### Option C-prime — Automatic same-Page continuity with one bounded exact-path lane

For Phase-23-owned ordinary Pages:

- releasing a path change for the same immutable Page automatically preserves
  every prior eligible canonical path through permanent direct continuity to
  the latest eligible released path;
- repeated moves compile every predecessor directly to the current path rather
  than intentionally issuing a chain;
- no checkbox, status-code picker, or separate redirect publication is shown
  during an ordinary move;
- retiring an ordinary Page offers **Send visitors to another Page** or **No
  replacement**; the homepage, sibling, or similar Page is never inferred;
- one quiet **URLs & redirects** Site workspace lets specifically authorized
  staff add one exact unused former path and select one Page on the same Site;
- tenant-authored patterns, regexes, wildcard priority, arbitrary status codes,
  arbitrary external destinations, and automatic expiry are excluded from this
  decision;
- Phase 30 may stage large exact legacy mappings, but they pass through the
  same D1–D2 validation and release contract;
- Phase 10 may suppress a positive outcome immediately; and
- Phase 22 routes remain read-only and route staff to the D8 workflow.

**Benefits**

- the dominant Page-move case has no redirect chore;
- typo and migration repair do not require a developer;
- manual behavior remains understandable and exact;
- no replacement is invented; and
- the route effect activates with the same Public Site Generation as the Page
  change.

**Costs and permanent mitigations**

- historical paths accumulate: keep them durable and searchable; do not add
  automatic age-based cleanup;
- repeated moves can create chains: compile Asym's active predecessors directly
  to the latest safe target;
- a replacement Page can later become unavailable: reprove it during every
  release and serve safe absence when current safety forbids the target; and
- large route sets require indexed lookup and capacity evidence, not a
  speculative distributed cache product.

## Recommendation

Recommend **Option C-prime — automatic same-Page continuity with one bounded
exact-path lane**.

This is the smallest model that gives ordinary staff both safe automatic Page
moves and a practical repair tool. Option A creates routine work; Option B
invents meaning; a full redirect programming surface would create avoidable
security, UX, and maintenance debt.

The implementation may map permanent same-Page continuity to an appropriate
code-owned HTTP status, but staff should never choose numeric status codes.
Only public navigation-safe methods may use CMS continuity; application, auth,
checkout, API, preview, media, and other reserved paths remain unavailable as
tenant redirect sources.

## Concrete scenario

Hope Mission moves the same Page from:

```text
/get-involved/volunteer
```

to:

```text
/serve/volunteer
```

Web Studio says:

> **Old links will keep working automatically.**
> `/get-involved/volunteer` will send visitors to `/serve/volunteer` after
> publishing.

If it later moves to `/serve/local/volunteer`, fresh Asym responses for both
former addresses point directly to the latest eligible route. The UI does not
promise that an already cached permanent redirect in an external browser can
be recalled.

For an obsolete `2025 Banquet` Page, staff may select a genuinely equivalent
Page or **No replacement**. Asym never silently sends visitors to the homepage
or assumes the `2026 Banquet` is equivalent.

A Missionary Ministry Page in the same Site Plan says only that continuity is
managed through **Public Ministry Pages**. Its Phase 22 D8 disposition is not
visible as a generic editable redirect.

## Explicit non-decisions

This decision does not yet select:

- temporary traffic overrides or their schedules;
- arbitrary or verified external destinations;
- domain-migration redirects owned with Phase 24;
- the numeric permanent status selected by the runtime;
- manual reclamation of durable old paths;
- root/home replacement;
- Page trash retention or permanent deletion;
- generic transition-page authoring; or
- search, cache, sitemap, and crawler convergence completion rules.

Those concerns remain visible. They are not allowed to become accidental
defaults in D3.

## Adversarial scenarios required after founder selection

- a parent move creates 2,000 former paths;
- the same Page moves three times;
- the new destination becomes restricted or unpublished;
- a staff member enters a path reserved by checkout, auth, API, media, preview,
  or Phase 22;
- a manual source collides with a canonical Page or another disposition;
- two editors claim the same normalized former path concurrently;
- a path differs only by Unicode, case, slash, or encoding;
- a replacement Page belongs to another Tenant, Site, environment, or locale;
- a restricted-worker route appears in a generic route search;
- activation succeeds but cache/search convergence fails;
- a previously cached permanent response survives a later move; and
- a migration attempts to import a wildcard, external target, chain, loop, or
  ambiguous source.

## Ratified-option adversarial review

The selected C-prime direction survives review only with the following
permanent controls. Concern means the unhardened idea has a realistic risk; it
does not mean the hardened design should add a general redirect platform.

| Category                          | Concern? | What could go wrong and why it matters                                                                                                                                       | Severity | Likelihood              | Permanent prevention                                                                                                                                                                                                           |
| --------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Brittleness                       | Yes      | Draft/autosave hooks, raw path strings, or cache behavior could be mistaken for a released move and create continuity from an unpublished address.                           | High     | Medium–high             | Derive continuity only while compiling a complete D1 candidate from immutable Page identity and the D2 canonicalizer; hooks may request work but never establish public truth.                                                 |
| Technical debt                    | Yes      | Payload records, Next configuration, code redirects, and a separate database table could each become a different route authority.                                            | High     | High                    | Own one provider-neutral route-effect contract and one active generation; keep Payload and Next behind qualified adapters.                                                                                                     |
| Edge cases                        | Yes      | Repeated moves, branch moves, Unicode/case/slash collisions, malformed escapes, unavailable targets, root paths, and concurrent editors can produce chains or wrong results. | High     | High                    | Require canonicalizer-equivalence and route-closure proofs, stable Page references, chain flattening, and expected-head CAS activation.                                                                                        |
| Footguns                          | Yes      | A missed checkbox, arbitrary URL, wildcard, status selector, or homepage default makes harmful behavior easy.                                                                | High     | High                    | Make same-Page continuity automatic; offer only one exact old path and one eligible Page picker; default retirement to Page not found.                                                                                         |
| Tenant safety                     | Yes      | A global or ID-only lookup could resolve into another Tenant, environment, Site, or locale, or expose a Phase 22 route.                                                      | Critical | Medium                  | Bind every fact and reference structurally to the exact scope, enforce composite uniqueness/foreign keys plus authorization/RLS where applicable, and exclude source-owned routes.                                             |
| Over-engineering                  | Yes      | A redirect DSL, distributed rule engine, Bloom filter, Edge Config dependency, schedules, or pattern priority would solve hypothetical cases and create another product.     | Medium   | High                    | Keep exact-path-only authoring and one indexed request-time lookup; add infrastructure only after measured capacity evidence.                                                                                                  |
| UX/UI and user friction           | Yes      | Jargon, hidden descendant effects, noisy automatic records, drag-only movement, or ambiguous retirement can make staff publish an outcome they did not understand.           | High     | High                    | Use plain web-address copy, proportional consequence previews, a quiet **Old web addresses** exception lane, explicit not-found outcomes, non-drag controls, focus preservation, and concise status announcements.             |
| Hidden coupling                   | Yes      | Page hooks, navigation, redirects, cache invalidation, sitemap, search, and crawler state could require lock-step success.                                                   | High     | Medium–high             | Activate only the authoritative Page/path/continuity manifest together; treat cache, search, sitemap, and crawler convergence as separate observable effects.                                                                  |
| Failure modes                     | Yes      | Partial publication, a lost CAS race, resolver outage, or newly unsafe target could emit a false permanent response or fall through to legacy content.                       | High     | Medium                  | Leave the prior generation serving on proof/CAS failure; use privacy-safe absence for an ineligible target and a neutral no-store retryable failure for authority outages; recover through a new generation.                   |
| Data integrity risks              | Yes      | Two route sources could claim one normalized path, a target string could go stale, or repeated moves could form a loop.                                                      | Critical | Medium–high             | Compile one typed effect per normalized path under structural uniqueness, store stable scoped Page references, reserve predecessor paths, block reclamation, and flatten fresh responses to the final eligible route.          |
| Security and privacy risks        | Yes      | Custom destinations enable open redirects; public route tables, Payload Local API bypass, query logging, or generic Phase 22 search could disclose sensitive information.    | Critical | Medium                  | No raw/external destinations or public route-table reads; use authenticated server-owned operations with access enforced, keep query data out of broad telemetry, and apply Phase 10/22 boundaries before positive resolution. |
| Scalability and performance risks | Yes      | A 2,000-descendant move or full redirect-table scan could cause long writes, cache storms, or request latency.                                                               | High     | Medium                  | Prepare complete closures privately in chunks, activate once, and resolve through an indexed exact lookup; capacity-test the largest supported cohort.                                                                         |
| Operational burden                | Yes      | Staff could inherit a growing redirect chore, manual chain repair, and periodic cleanup work.                                                                                | High     | High without automation | Protect same-Page moves automatically, keep healthy predecessors quiet, surface only cause-owned exceptions, and do not expire durable paths automatically.                                                                    |
| Observability gaps                | Yes      | Collisions, CAS conflicts, stale active heads, safety suppression, or downstream lag could remain invisible until a donor reports a broken link.                             | High     | Medium–high             | Record candidate counts/checksums and cause-coded failures; reconcile serving head and result classes; monitor high-value old paths without broadly exposing exact protected paths or queries.                                 |
| Dependency and integration risks  | Yes      | Payload v4 plugin defaults or Next redirect semantics could silently become product behavior, while search engines converge on their own schedule.                           | High     | Medium                  | Pin and qualify provider adapters, own the HTTP/navigation contract in code, and never equate Asym activation with cache, sitemap, Google, or Bing completion.                                                                 |
| Migration and upgrade risks       | Yes      | Existing duplicate slugs, implicit home handling, static redirects, literal menu URLs, wildcards, or Phase 22 routes could be imported into the wrong authority.             | High     | High                    | Complete a route census; give every source exactly one typed disposition or quarantine; let Phase 30 transport data without weakening D1–D3 proof.                                                                             |
| Other development hazards         | Yes      | A method-preserving permanent redirect could replay a non-navigation request; read-before-write checks can race; destructive rollback can revive unproved routes.            | High     | Medium                  | Apply CMS continuity only to `GET`/`HEAD`, use database constraints plus CAS, test races/idempotence, and recover forward with an append-only successor generation.                                                            |

## Ratified staff-experience contract

The interface should teach three outcomes, not a redirect subsystem:

1. **Move or rename a Page:** the publish review shows **Current public
   address**, **After publish**, and **Old links will keep working
   automatically.** There is no redirect checkbox or second publication.
2. **Stop publishing a Page:** the default says visitors will see the Site's
   Page-not-found screen. **Choose another Page instead** is a deliberate
   secondary action, never a preselected homepage fallback.
3. **Fix an old web address:** the quiet **Old web addresses** workspace accepts
   one exact source path and one currently public ordinary Page from the same
   Site and locale. The source prefix is fixed; the target is selected by title
   and current address, not typed as a URL.

A branch move shows the exact affected count, representative old-to-new
mappings, blockers first, and **View all changes**. Large sets are prepared
privately and reviewed as one consequence; staff do not approve descendants
one by one. Mobile uses searchable Page rows and a parent/Page selector rather
than precision dragging. Keyboard, touch, zoomed, and screen-reader users have
the same actions; focus is preserved and status messages announce complete
results without narrating every processed path.

Required plain-language states include:

- **Address change saved in draft. Your public Site has not changed.**
- **`/about` is already used by About Us. Choose a different web address.**
- **This address is managed in Public Ministry Pages.**
- **Newer Site changes were published. Review the updated addresses before
  publishing.**
- **Nothing was published. Your current Site is still live.**
- **Published. The Page now uses `/serve/volunteer`, and the old address still
  works.**

Success copy reports only the Asym release. It never claims that caches,
sitemaps, Google, Bing, bookmarks, or previously cached permanent responses
have converged.

## Required proof before implementation can ship

- canonicalizer equivalence across authoring, database constraints, migration,
  candidate compilation, and public lookup, including malformed encoding,
  Unicode, case, slash, dot-segment, query, and protocol-relative inputs;
- collisions among canonical Pages, automatic predecessors, manual repairs,
  reserved application paths, and Phase 22 claims;
- cross-Tenant, environment, Site, and locale authorization/RLS attempts,
  including opaque-ID substitution and Payload Local API calls with access
  enforcement;
- three same-Page moves resolving directly to the latest eligible route, plus
  blocked path reclamation and loop attempts;
- retirement with no replacement, a deliberately selected replacement, and a
  target that later moves, retires, becomes unpublished, or becomes unsafe;
- `GET`/`HEAD` continuity, non-redirect behavior for mutation methods, query
  preservation without query-based matching, and no query-string telemetry;
- two concurrent path claims and two candidates from the same generation,
  proving one CAS winner and a visible rebase for the loser;
- a 2,000-descendant move with private bounded preparation, one activation,
  one indexed runtime lookup, and no partial public effect;
- resolver, cache, search, and sitemap failures that leave authority truthful
  and recovery forward-only; and
- keyboard, screen-reader, touch-only, 200% zoom, narrow-screen, error-copy,
  focus, and non-chatty status-message usability tests.

## Founder-ratified hardened formulation

> **C-prime-amended-and-hardened (C-prime-R) — automatic, generation-bound
> same-Page continuity with one bounded exact-path repair lane.** For one exact
> Tenant × environment × Site × BCP-47 locale, every eligible previously
> released canonical path of the same immutable Phase-23 ordinary Page becomes
> durable code-owned permanent navigation continuity to that Page's latest
> eligible path when the path-changing D2 candidate activates inside the same
> immutable D1 Public Site Generation; all Asym-controlled predecessors compile
> directly to the final stable Page reference, remain reserved, and neither
> expire nor become reusable merely by age. Authorized staff see no checkbox,
> numeric HTTP status, rule priority, or second publication: ordinary moves say
> that old links will keep working, branch moves receive one proportional
> consequence review, and retirement defaults honestly to the tenant-branded
> Page-not-found outcome unless staff deliberately choose one currently public,
> genuinely relevant ordinary Page. One quiet **Old web addresses** / **Fix an
> old web address** lane may bind one exact normalized unused source to one
> stable, eligible ordinary Page reference in the same Site and locale; it
> accepts no arbitrary or external URL, wildcard, regex, schedule, query rule,
> status choice, cross-scope target, inferred homepage/sibling/similar successor,
> reserved application path, or Phase-22-owned route. The code-owned permanent
> response applies only to public `GET` and `HEAD`; incoming query parameters are
> preserved but never participate in route identity or destination choice, and
> fragments are outside server claims. Every source has exactly one typed
> released route effect under structural scoped uniqueness and authorization/RLS
> defense in depth; candidates prepare privately, one expected-head CAS activates
> Page paths and continuity together, Phase 10 adverse truth can suppress a
> positive result immediately, Phase 22 D8 remains exclusive, and Phase 30 only
> transports exact legacy mappings through the same validator. Payload's current
> v4 redirect plugin is not the product or public-route authority and may be used
> only behind a qualified Asym adapter. Proof or CAS failure leaves the current
> generation live, an ineligible target becomes privacy-safe absence, an
> authority outage emits no guessed permanent outcome, and correction advances
> through a newly proved successor generation—without dual route truth,
> hook-as-publication, redirect chains, open redirects, pattern DSLs, automatic
> homepage fallback, age cleanup, partial activation, destructive rollback,
> full-list request scans, or claims that Asym activation means external cache,
> sitemap, Google, or Bing completion.

## Non-authority statement

This evidence does not determine database tables, Payload plugin adoption,
public-runtime implementation, exact status codes, cache technology, issue
slicing, or production readiness. Those require the ratified product decision
and later specification and qualification proof.
