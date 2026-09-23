# ADR-0194: Explicit former-primary website disposition

**Status:** Accepted with required amendments (Phase 24 D73 — 2026-08-30)

Changing a Site's Primary Site Domain is a public-identity successor, not a
text-field edit. Mature hosted website products generally keep every connected
former domain redirecting automatically. Core instead requires one explicit
former-primary website disposition for every exact Primary change because
ordinary continuity and a ministry's need to stop publicly connecting two
identities are both legitimate. The common continuity result is recommended,
but no answer is preselected.

## Decision

When current authorized staff replace one Primary Site Domain with another
fully proved Tenant custom hostname, the review requires exactly one choice:

- **Redirect eligible website visits — recommended.** Current public website
  routes with an owner-proved equivalent move directly to the final equivalent
  route on the new Primary Site Domain. The Tenant must continue controlling,
  renewing, connecting, and securing the former hostname.
- **Stop website use on the old domain.** Core no longer serves or redirects
  Site website pages on the former hostname. Requests that still reach Core
  receive the applicable small platform-neutral, no-brand non-success result.

The choice applies only to the former domain's **website role**. Giving,
checkout, authentication, callbacks, APIs, protected actions, provider control
paths, and every other source-owned route keep only their owners' current
behavior. The review shows those outcomes before confirmation and never claims
that stopping website use erases every public relationship.

The Site Root Entry remains D16-owned. A retained former-domain `/` therefore
returns D16's current `307 Temporary Redirect`, `Cache-Control: no-store`, and
explicit empty-fragment destination directly to the current Default Site Locale
homepage. An owner-classified stable equivalent website route may use `308
Permanent Redirect` with `Cache-Control: no-store`. Every favorable redirect
also uses `Referrer-Policy: no-referrer`, the approved explicit empty-fragment
form, and no application cookie. No blanket status applies to every path, and no
staff setting controls status or cache headers.

## Exact transition boundary

Before review, Core privately proves the replacement's exact Tenant,
environment, Site, canonical hostname, ownership, DNS, TLS, Vercel assignment,
trusted host admission, production-faithful rendering, every current public Site
Locale, public-origin generation closure, route compatibility, redirect/cache
history, and safety. It compiles one complete hard-gate manifest only from
finite code-owned authorities, covering:

- the former Primary Site Domain and requested website disposition;
- every current Redirect Site Domain whose derived final target changes;
- every current public Site Locale and compatible D1/D66 successor generation;
- every registered source-owned route family on the affected hosts;
- independently owned registered auth/callback/CORS/CSP/cookie/service-worker/
  WebAuthn and other exact-host security/control dependencies; and
- whether each result is safe, blocked, or unknown.

Known CMS placements, messages, QR codes, documents, analytics properties,
search properties, backlinks, printed material, and third-party integrations
are separately bounded advisory evidence. Core never claims that this list is
complete, crawls every URL, or blocks on an advisory item unless its source owner
declares a finite registered hard dependency. Unknown, stale, contradictory,
cross-scope, cache-incompatible, or safety-blocked hard-gate impact cannot
commit. Exact owner details and counts render only when the viewer has a complete
authorized inventory; otherwise the UI uses a safe aggregate while the command
still proves the complete server-side hard gate.

A candidate that previously redirected to the current Primary cannot be
promoted into an inverse mapping unless its durable response history proves the
transition cache-compatible. A known or possible cached permanent `new → old`
response makes a simultaneous retained `old → new` mapping loop-prone. Core
blocks the unsafe disposition or primary change; registrable-domain similarity,
including apex/`www`, never overrides that proof.

One semantic command pins the candidate, requested former-domain disposition,
expected Domain and public-generation heads, complete impact digest, actor
authority, policy/compiler versions, and idempotency identity. In one short
stable-order transaction, it reauthorizes and re-proves current facts, inserts
the immutable successor Domain role generation, compatible public-origin
generation successors, receipt, audit, and outbox, and compare-and-set advances
the exact head cohort—or changes nothing. No DNS, Vercel, Payload, Search, or
other network call occurs under lock.

The cutover projection is generation-checked. A redirect is withheld while its
target Primary generation is unproved or mismatched, preventing mixed-edge
`old → new → old` loops. A committed new Primary may therefore be authoritative
while a retained former-domain redirect honestly shows **Needs attention** and
fails safely until reconciliation. Completion requires current readback of the
new Primary, every current locale-origin closure, former-domain website result,
and applicable regional admission probes. Search recrawl is observation, never
command completion.

Reverting to the former Primary is a new successor command with fresh proof and
impact review. It is not Undo and is not a Vercel deployment rollback.

## Vercel boundary

Vercel has project domains, production-deployment assignment, optional domain
redirect configuration, DNS/TLS evidence, and provider operations; it does not
own Core's Primary Site Domain or former-primary disposition. A configured
project domain can automatically serve the latest production deployment, so
Core's host-admission fence must remain adverse until the Core role activates.

Core does not use Vercel's whole-domain redirect for D73. Vercel documents that
domain redirects are browser-cached but does not document enough route/path/
query/cache-lifetime semantics to satisfy D9–D16. Core's route-aware admission
seam preserves source-owner precedence, final-path equivalence, D16 root
behavior, fragment suppression, and noncacheable containment.

D73 never automatically:

- uses Vercel `--force` or moves a hostname from another project/team;
- detaches the former hostname from the project, account, registrar, or DNS;
- changes nameservers, MX, CAA, DNSSEC, email, or unrelated subdomains;
- configures a provider redirect or treats its webhook as product authority; or
- treats an Instant Rollback/deployment revert as a Domain-role rollback.

Provider calls stay outside the authoritative transaction and converge through
one durable work identity using current response limit/reset headers, `429`
backoff, readback, and reconciliation. Provider success with a lost response and
provider failure after Core commit never create a second product command.

ADR-0195/D74 now owns the later disconnection boundary. A stopped website role
does not imply disconnection. Only complete current owner proof that no positive
Core hosting dependency remains can expose the separate Tenant self-service
action. D74 first establishes and reads back an adverse host fence, then removes
the exact Core-controlled provider associations, and only after authenticated
absence ends the current Site binding/occupancy claim. History and D9–D15
reservations survive; DNS, registration, provider-account ownership, email, and
future claims remain separate from D73/D74 and follow ADR-0196.

ADR-0197/D76 composes this disposition when a hostname becomes another Site's
Primary. If the destination already has a Primary, its former-primary choice
remains initially unselected and D73-owned. If the moved hostname is the source
Primary, it cannot remain a source Redirect because one hostname cannot
represent two Sites; the source requires a different qualified Primary and the
moved hostname's source website role stops. D76 never weakens D73 into an
implicit demotion, retirement, provider switch, or mutable row update.

ADR-0198/D77 reuses D73's finite owner-family registry for D76 rather than
creating another impact system. Critical owner results remain a hard gate; the
ordinary Page lane is a deterministic comparison over complete immutable route
manifests with durable source-only not-found effects and exception-only staff
review. D77 cannot infer a different-Page successor or use a provider redirect,
path fallback, wildcard, query carry, crawler, or permission-filtered false zero.

## Staff, Tenant, and visitor experience

The fully proved candidate exposes **Make primary** in **Site → Domains**. The
review uses one focused, route-addressable Base Maia flow—not a wizard, nested
dialog, or provider dashboard. Design may use a Sheet on a suitable desktop
surface only when usability and accessibility evidence support it; mobile is a
full-viewport single-column review. The review contains:

1. the Site and production context;
2. stacked **Current** and **New** hostname values;
3. what public origin, locales, generated links, and existing Redirect Site
   Domains change;
4. **What this change does not move**, including source-owned route outcomes;
5. the initially unselected former-domain RadioGroup; and
6. **Cancel** plus **Make `www.hopeglobal.org` primary**.

The RadioGroup legend is:

> **What should happen to website visits at `www.hoperelief.org`?**

The retain option says only **eligible website visits**, never “all links.” The
stop option says only that Core stops Site website pages and explicitly states
that independently managed addresses and external evidence may remain. If such
routes still identify the Tenant, the UI says so. Core cannot promise to erase
search indexes, web archives, certificate-transparency records, backlinks,
third-party hosting, DNS outside Core, or content already cached outside the
accepted response contract.

No radio is preselected. Submitting without a choice produces one visible group
error, moves focus to it, and preserves the rest of the review. The review
heading receives initial focus; each option has a visible label and description,
native RadioGroup semantics, keyboard navigation, a full-row touch target, and
text—not color alone—for the recommendation. Links and owner handoffs remain
outside radio labels. Stale candidate/head/impact facts clear the choice and
require review again. A refresh or return may resume only the exact still-current
review basis; it never silently rebases the choice.

After acknowledgement, the focused review returns to the durable Domains
operation card:

> **Changing primary website address**  
> You can leave this page. Core is applying the reviewed change.

Success and partial-convergence receipts itemize the authoritative Primary,
former-domain website outcome, unchanged source-owned routes, and any **Needs
attention** effect. An unknown outcome says not to submit again and reconciles
the original receipt. Toast-only success, fake percentages, a typed hostname,
reason field, second approver, scheduled cutover, timer, route matrix, and
generic redirect editor are prohibited.

Eligible visitors receive one server redirect to the final matching destination
without JavaScript, an interstitial, content flash, platform branding,
application cookie, duplicate client analytics, or homepage fallback. Stop-mode
website errors contain no Tenant or Asym branding, analytics, or favorable
assets. The journey is proved at 320 CSS pixels, 400% zoom, keyboard, screen
reader, touch, forced colors, reduced motion, long translations, IDN, RTL/bidi,
JavaScript-off, and weak-network conditions.

## Consequences

- Routine rebrands receive the mainstream continuity recommendation without
  making it an unsafe universal default.
- Sensitive ministries can stop Core's website relationship before any redirect
  is emitted, while source-owned and externally irreversible evidence remains
  truthfully disclosed.
- Exact apex/`www` swaps receive the same explicit review because historical
  browser-cached inverse redirects can make an automatic swap loop.
- Primary change is one auditable successor transition across Domain and public
  origin generations, not a mutable string plus best-effort provider calls.
- The former domain may remain attached after website stop because Giving,
  protected, certificate, or other owners can still require the hostname.
  ADR-0195 permits later owner-cleared self-service disconnection but never
  treats historical reservations as a positive hosting dependency.
- A retained redirect has ongoing registration, DNS, TLS, monitoring, and
  security cost; elapsed time or search recrawl never removes it automatically.

## Rejected alternatives

- **Always retain:** best ordinary continuity and the mainstream CMS default,
  but can disclose a relationship a ministry must not create.
- **Always stop:** minimizes Core website exposure but knowingly breaks normal
  bookmarks, campaigns, partner links, printed material, QR codes, and search
  migration.
- **Preselect retain:** makes the recommended path faster but increases the risk
  that staff miss a rare high-consequence question.
- **Automatic apex/`www` companion swap:** seems low-friction but can invert a
  previously browser-cached permanent redirect and create a client-side loop.
- **Blanket Vercel redirect:** cannot preserve Core's route-owner, D16, privacy,
  or containment semantics.
- **Automatic rollback:** can make a stale or unsafe former domain Primary again;
  recovery must be a freshly authorized successor.

## References

- [D73 adversarial review](../prds/sitestacker-parity/phase-24-d73-explicit-former-primary-disposition-adversarial-review.md)
- [ADR-0193 — Primary and Redirect Site Domains](./0193-one-primary-site-domain-with-redirect-site-domains.md)
- [ADR-0195 — Owner-cleared Tenant domain disconnection](./0195-owner-cleared-tenant-domain-disconnection.md)
- [D74 adversarial review](../prds/sitestacker-parity/phase-24-d74-owner-cleared-domain-disconnection-adversarial-review.md)
- [ADR-0197 — Prepared same-Tenant Site Domain cutovers](./0197-prepared-same-tenant-site-domain-cutover.md)
- [D76 adversarial review](../prds/sitestacker-parity/phase-24-d76-prepared-same-tenant-site-domain-cutover-adversarial-review.md)
- [ADR-0198 — Critical-path-gated Domain move route review](./0198-critical-path-gated-exception-led-domain-move-route-review.md)
- [D77 adversarial review](../prds/sitestacker-parity/phase-24-d77-critical-path-exception-led-domain-move-route-adversarial-review.md)
- [Vercel — Deploying and redirecting domains](https://vercel.com/docs/domains/working-with-domains/deploying-and-redirecting)
- [Vercel — Setting up a custom domain](https://vercel.com/docs/domains/set-up-custom-domain)
- [Vercel — Domain troubleshooting](https://vercel.com/docs/domains/troubleshooting)
- [Vercel — Removing a project domain](https://vercel.com/docs/domains/working-with-domains/remove-a-domain)
- [Vercel — Project-domain webhooks](https://vercel.com/docs/webhooks/webhooks-api)
- [Google — Site moves and URL changes](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
- [Shopify — Change the primary domain](https://help.shopify.com/en/manual/domains/domain-type/change-primary-domain)
- [Squarespace — Primary domain](https://support.squarespace.com/hc/en-us/articles/205812368-Setting-a-primary-domain)
- [WordPress.com — Primary site address](https://wordpress.com/support/domains/set-a-primary-address/)
- [RFC 9110 — HTTP semantics](https://www.rfc-editor.org/rfc/rfc9110.html)
- [RFC 9111 — HTTP caching](https://www.rfc-editor.org/rfc/rfc9111.html)
- [GOV.UK — Radio guidance](https://design-system.service.gov.uk/components/radios/)
- [W3C APG — Radio Group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)
