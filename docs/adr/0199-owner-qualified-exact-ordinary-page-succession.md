# ADR-0199: Owner-qualified exact ordinary Page succession

**Status:** Accepted with required amendments (Phase 24 D78 — 2026-08-31)

## Context

Phase 24 D77 compares the source and destination effective-host route manifests
for one prepared same-Tenant Site Domain cutover. A collision between two
different ordinary Page identities is deliberately unresolved: matching paths,
titles, copied content, templates, analytics, or similarity do not prove that
the destination Page may inherit the source Page's public meaning.

The safe default is D9's real, non-enumerating not-found result. Requiring the
same immutable Page identity for every continuation would be simpler, but it
would also break legitimate Site rebuilds where staff intentionally created a
new Site-owned Page for the same public visitor task. Generic redirect products
are not an adequate authority boundary: they accept paths or URLs but do not
prove Core's Tenant, Site, locale, Page-family, audience, safety, publication,
or route-owner invariants.

Current `develop` has Tenant-only mutable Payload Page slugs and latest-
published reads. It has no Site-owned immutable ordinary Page identity, Public
Site Generation route manifest, D76 cutover, D77 comparison, or D78 successor
qualification. Proposed Phase 23 ADR-0147 automatically preserves only the same
Page identity and limits different-Page repair to the same Site and locale.
Proposed ADR-0167 makes a copied Page a fresh independent Site-owned identity.
Both predecessor PRs remain open and blocked, so this decision is planning
authority only and must be reconciled before implementation.

## Decision

### One directional, address-scoped owner fact

The ordinary Page route owner MAY create one **Ordinary Page Successor
Qualification** when one different ordinary Page is the truthful successor for
one exact historical public address. The qualification is directional
`source-address -> target-Page` authority. It is not a reusable assertion that
two Pages are equivalent, a Page merge, shared identity, canonical duplicate,
content synchronization, redirect rule, or Site relationship.

The relation is never symmetric or transitive. `A -> B` does not imply `B -> A`,
and `A -> B` plus `B -> C` does not authorize `A -> C`. One target Page may
continue several historical addresses only through separate path-specific
qualifications. Each source address has at most one current owner disposition.

### Structural eligibility before human judgment

Core proves every non-semantic fact before approval is available:

- the exact same Tenant and environment, two exact Sites, one exact BCP-47
  locale, and Phase 23's immutable `general_page` family on both Pages;
- one exact previously public source Page/revision/route/binding generation and
  either one exact currently public target Page/revision/route/Public Site
  Generation or, only for ADR-0200 post-cutover renewal of the same fixed
  relation, one exact D1-admitted publication-ready candidate that can activate
  only atomically with its favorable receipt;
- the same code-owned public audience and Publication Reach plus a compatible
  current safety class;
- ordinary content ownership only, with no Giving, checkout, authentication,
  callback, API, form, file, provider-control/result, `/.well-known`, protected
  action, Phase 22 ministry/project, or other specialized-owner route;
- one stable internal target Page identity rather than a raw or caller-supplied
  URL; and
- no additional/ambiguous canonical collision beyond the reviewed pair, chain,
  loop, active-source shadow, incompatible canonicalizer, stale head, missing
  evidence, or adverse owner result.

Any hard mismatch makes favorable qualification unavailable. A same slug,
title, Site-copy provenance, Page Starter, copied block, body hash, keyword,
search result, traffic pattern, backlink, or AI score is neither proof nor an
eligibility input.

### One explicit semantic decision, not a classifier

After the hard facts pass, one currently authorized human Page owner reviews
the exact former and proposed public releases and answers one plain-language
question:

> Would a person using the old address find the same public subject,
> substantive purpose, and intended task on this Page?

Updated wording, design, staff names, or presentation may still qualify. A
related Page, broad category, homepage, search result, newer ministry,
different audience, different locale, or different promised action does not.
If the answer is uncertain, the correct outcome is **Keep this address
unavailable**.

The durable receipt records the criteria-contract version and the explicit
outcome. Phase 24 does not add a purpose taxonomy, equivalence score, content
diff, embeddings/LLM service, mandatory or optional free-text reason, second
approver, assignment, comment, or approval workflow. Copied-Page provenance may
explain why a pair exists but never preselects or proves the answer.

The actor must hold the ordinary Page owner's exact route-continuity/publication
effect for the source and authorized read/publication scope for the target at
load and commit. Domain permission alone is insufficient. Phase 12 remains the
sole capability authority; D78 creates no role, invite, access-request, or
permission-management flow and does not freeze a physical capability-key name.

### One focused staff review

D77's **Review Page continuity** action opens one route-addressable full-page
Base Maia review and fixes the exact source/target pair. D78 provides no target
search, arbitrary URL field, general redirect list, wizard, Sheet, or modal.
After cutover, ADR-0200's **Historical addresses** detail MAY reopen this same
review only for an existing immutable source-address/target-Page relation. It
may compare the current public target or an exact D1-admitted publication-ready
candidate, but it cannot choose another target or create a general redirect.

The page leads with the visitor consequence and exact address, then renders the
hard scope facts before optional rich media:

> **Review Page continuity**  
> `stories.hoperelief.org/about`
>
> Decide whether this one old address should show Main Website's About Page
> after the domain moves. The safe alternative is Page not found.

For post-cutover renewal, the context instead says:

> Decide whether this old address should continue to the Page update you are
> preparing. Nothing public changes until that exact update publishes.

It shows **Former Page - Field Stories** and **Page at this address after the
move - Main Website**, each with Site, locale, complete clean public URL,
plain-language published-version label, and an exact production-faithful
authenticated preview. Wide screens may use equal panels; narrow screens and
400 percent zoom stack former then proposed without changing reading order.
The consequence and hard facts render first. Previews load independently on
demand, reserve space, execute no forms, checkout, analytics, third-party
scripts, navigation, or mutation, and never become required merely to choose
the safe not-found outcome.

One initially unselected RadioGroup offers exactly:

- **Use Main Website's About Page for this address** - visitors will receive
  the stated direct Page/redirect result after the Domain move; or
- **Keep this address unavailable** - visitors will receive **Page not found**.

The contextual commit is **Save this address decision**. Merely loading a
preview or selecting a radio does not save, publish, navigate, or move focus.
There is no checkbox attestation or second confirmation dialog; this full page
is the review, and D76 still owns the later explicit cutover confirmation.

Unavailable evidence, changed Pages, authorization loss, concurrent decision,
session expiry, or an unknown result produces one specific, persistent status
and owner-native recovery. Success returns to the same D77 exception position
and says **Successor prepared for this domain move** or **Will show Page not
found**. Post-cutover success returns to **Historical addresses** and says
**Continuity prepared for this Page update** or **Will show Page not found for
fresh Core requests**. It never says restored/Live before an ordinary preserving
D1 publication consumes the exact receipt, and it never promises recall of an
externally cached redirect. D80 creates a different private Page and consumes no
D78 receipt.
No consequential result exists only in a toast, color, icon, hover, or motion.

The surface follows Core's PageShell/Base UI/base-maia/Zinc language, 44-pixel
targets, visible focus, semantic headings and RadioGroup, descriptive preview
names, URL bidi isolation and safe wrapping, one polite meaningful status
announcement, 320-CSS-pixel and 400-percent reflow, forced colors, reduced
motion, long localization/RTL, keyboard/screen-reader use, weak networks,
refresh/back/resume, duplicate click, lost response, and error-focus recovery.

### Preparation, activation, and public delivery

Saving D78 prepares an owner disposition; it changes no public response,
content, Page, Domain, DNS, TLS, Vercel project/rule, cache, sitemap, search,
Stripe object, gift, recurring agreement, ledger, message, or notification.
D76 may consume it only when its exact source/target Page revisions, routes,
binding/public generations, capability epoch, safety/audience/reach facts,
canonicalizer, and D77/D76 digests still match. Drift yields **Page changed -
Review again**; it never silently refreshes the attestation.

After cutover, only the existing preserving D1 Page-publication command may
consume a fresh same-relation receipt, and only with the exact candidate effective-release
dependency digest, current Page/continuity/relation/policy heads, capability
epoch, route/safety/audience/Reach facts, and complete affected closure. It
activates the Page release with the current continuity version, D78 outcomes, compiled routes,
receipt/audit/outbox together or none. A prepared candidate receipt alone has no
effect.

At activation, the target Page remains an independent Site-owned Page. If the
moved hostname is the target Site's serving Primary and its current canonical
path is the historical path, the complete target binding generation serves it
directly with no redirect. A Redirect Site Domain never serves duplicate
content; it composes one direct final owner-qualified result to the target
Primary. If the owner-approved final path differs, Phase 5 likewise emits one
direct server-owned permanent response under the governing route contract
(currently `308`) only for clean `GET`/`HEAD`.
`Not used for website`, private, moving, disconnected, or unknown binding roles
cannot activate a favorable Page result.
It resolves the stored Page identity to the final eligible path, sends no source
query/body/cookie/header/authorization/attribution/return state, blocks source-
fragment inheritance, and never follows a chain or external target. Unsafe
methods and protected owners never use D78.

ADR-0200/D79 now defines the temporal rule. Before D76 activation, the D78
qualification remains valid only for the exact reviewed target public revision/
generation; drift requires this fixed-pair review again. After activation, the
relation pins the target Page/locale's opaque Page Purpose Continuity Version.
Each candidate effective Page public release whose meaning-bearing dependency
digest changes explicitly chooses in the existing D1 Publish review whether it
keeps what the Page is for and reuses that version, or declares that D80 must
continue the candidate as a fresh independent private Page. D80 leaves the
source version/relations unchanged and the target inherits none. Draft/autosave/preview and delivery-only D1 rebuilds with
the exact effective content-dependency digest unchanged have no continuity
effect. A purpose-changing candidate never publishes through the source identity.

### Source of truth, data, authorization, and failure

The Page owner owns Page identities, revisions, family, locale, audience/reach,
safety inputs, and route dispositions. Public Site Generations own compiled
route effects. D76 owns the Domain cutover. D78 owns only the immutable human
qualification/negative outcome and receipt. Payload mutable documents,
previews, the UI, D77, Vercel, caches, analytics, search, imported redirects,
and AI are not write authorities.

The logical model records non-null exact Tenant/environment, source Site/Page/
public revision/binding/route-effect/canonical path/canonicalizer/locale,
target Site/Page/public revision/route generation, Page family, audience/reach
and safety evidence heads, outcome, criteria-contract version, predecessor,
semantic command/idempotency identity, server-derived actor/capability epoch,
created time, receipt, and activation linkage where applicable. After D76
activation, ADR-0200 additionally requires the relation's non-null exact target
Page/locale Page Purpose Continuity Version; the original reviewed revision
remains immutable evidence. It stores no arbitrary destination URL or copied
Page body.

One current head per exact source route, same-scope composite relationships,
restrictive delete behavior, immutable versions/receipts/audit/outbox, and
equality-leading indexes make cross-Tenant or ambiguous states structural
errors. Cross-store Page evidence uses typed immutable references and digests
validated by the owner command rather than pretending a foreign key can cross
an adapter boundary. The commit transaction is short and contains no provider
or network call.

Browser/Data API roles cannot mutate qualifications, dispositions, heads,
receipts, audits, or outbox rows. Applicable tables use least grants, enabled
and FORCE RLS where required; `SELECT`/`DELETE` use `USING`, `INSERT` uses `WITH
CHECK`, and any admitted `UPDATE` uses both while immutable scope cannot change.
Append-only facts expose no direct update/delete path. Service/secret roles,
table owners, views, RPCs, `SECURITY DEFINER`, Payload Local API, workers,
imports, support, repair, and AI repeat the same actor, exact-scope, capability,
expected-head, criteria, and target-admission checks. Privileged functions use
least-privileged ownership, schema-qualified names, and an empty pinned
`search_path`.

One expected-head command appends the outcome, receipt, audit, and outbox fact
atomically. Same semantic replay returns the same receipt; same key with changed
input conflicts. Opposite concurrent decisions have one winner. Lost response
resolves the receipt. Failure before commit changes nothing; failure after
commit resumes the same effect. Corrections append a new owner disposition and
never rewrite history. A favorable target becoming ineligible produces the D9
not-found result and a cause-owned exception, never another guessed Page.

### Rollout and provider boundary

D78 cannot activate until the Phase 22/23 route contracts are reconciled,
Phase 23's stable Site-owned Pages and immutable public generations exist, and
D72-D77/D76 owner routing is live. Rollout is reader/adverse-first: land exact
owner readers and not-found behavior, add private qualification preparation,
shadow-compile, prove same-scope and concurrency invariants, then enable one
Tenant cohort. No mapping is backfilled from matching slugs, titles, copied
content, provider redirects, analytics, or AI. Legacy different-Page redirects
are quarantined as untrusted candidates until individually qualified or made
not-found.

D78 never writes Vercel project-level, bulk, deployment, middleware, or Domain
redirect configuration. Those rules are project-scoped provider execution and
would create shared-project cross-Tenant coupling, environment skew, and a
second route authority. Phase 5 consumes the indexed current Core route effect
before content/cache. A kill switch disables new favorable qualifications and
cutovers while preserving current adverse behavior and immutable history; it
never restores mutable latest reads or provider redirect authority.

## Consequences

- Legitimate rebuilt General Pages can preserve one historical public address without
  collapsing their independent identities or inventing a general redirect
  product.
- Staff make one understandable choice only for a real collision; routine
  same-Page moves stay automatic and no-equivalent cases stay safely not-found.
- Human semantic judgment remains a material risk, but it is bounded by hard
  eligibility, exact releases, a fixed pair, explicit outcome, current-head
  activation, and immutable evidence rather than a false similarity score.
- Donors and visitors see only the tenant-native final Page, one direct internal
  navigation result when needed, or the existing neutral not-found envelope.
  They never see Asym/Vercel/provider terminology or a migration interstitial.
- The model adds one Page-owner relation and one focused review, not a semantic
  classification service, workflow engine, redirect console, or provider rule.
- Exact pre-cutover evidence remains revision-bound. Post-cutover routine
  releases may continue only through ADR-0200's explicit, opaque Page Purpose
  Continuity Version; material repurposing never inherits old authority.

## Rejected alternatives and unsafe interpretations

- same immutable Page identity as the only possible continuation;
- requiring a visibly different target URL for every D78 repaired-Page identity
  even when the reviewed purpose is the same; D80 separately requires a distinct
  route for a genuinely different purpose;
- treating two Pages as globally, symmetrically, or transitively equivalent;
- automatic approval from a copy/import lineage, slug, title, content hash,
  template, taxonomy, backlink, traffic, search, or AI similarity;
- a Page-purpose taxonomy, score, content-diff engine, LLM/embedding dependency,
  target-suggestion service, free-text reason field, second approver, task,
  comment, or assignment workflow in D78;
- arbitrary target search/URL entry, external targets, wildcards, regex,
  catch-alls, homepage/default fallback, chains, query/fragment carry, unsafe-
  method redirects, or protected-owner mutation;
- Article, Site-root, locale-root, Phase 22, and every other specialized route
  succession; those meanings require their own owner contract;
- mutable Payload redirect rows, Vercel project/bulk redirects, CDN/cache state,
  or live provider calls as route authority;
- direct browser writes, caller-supplied Tenant/Site/Page/actor/approval facts,
  service-role bypass, mutable audit history, or cross-scope receipt disclosure;
  and
- guessed migration backfills, mixed-version favorable fallback, destructive
  rollback, or claims that cached external permanent responses are recallable.

## References

- [ADR-0200 - Stable Page identity with owner-attested purpose-continuity versions](./0200-stable-page-identity-with-purpose-continuity-versions.md)
- [ADR-0201 - Material Page-purpose changes create independent Pages](./0201-material-purpose-changes-create-independent-pages.md)
- [Phase 24 D78 adversarial review](../prds/sitestacker-parity/phase-24-d78-owner-qualified-ordinary-page-successor-adversarial-review.md)
- [ADR-0198 - Critical-path-gated Domain move route review](./0198-critical-path-gated-exception-led-domain-move-route-review.md)
- [Phase 24 D9 - Retired-address disposition](../prds/sitestacker-parity/phase-24-d9-retired-address-disposition-adversarial-review.md)
- [Google - Site moves and URL mapping](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
- [Google - Crawl errors and clear replacements](https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors)
- [HubSpot - Create and manage URL redirects](https://knowledge.hubspot.com/domains-and-urls/create-and-manage-url-redirects)
- [Webflow - Set up redirects](https://help.webflow.com/hc/en-us/articles/33961294898835-How-do-I-set-up-redirects-in-Webflow)
- [Shopify - Create and manage URL redirects](https://help.shopify.com/en/manual/online-store/menus-and-links/url-redirect)
- [WordPress.com - Page and post links](https://wordpress.com/support/permalinks-and-slugs/)
- [OWASP - Unvalidated redirects and forwards](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html)
- [RFC 9110 - HTTP semantics](https://www.rfc-editor.org/rfc/rfc9110.html)
- [WCAG 2.2 - On input](https://www.w3.org/WAI/WCAG22/Understanding/on-input)
- [Supabase - Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [PostgreSQL - Row security policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [PostgreSQL - Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
