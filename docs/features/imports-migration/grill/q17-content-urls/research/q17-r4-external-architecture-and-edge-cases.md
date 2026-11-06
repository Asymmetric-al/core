# Q17-R4: Redirect architecture, domain move and edge cases (external research)

_Accessed 2026-11-03. This builds on r2 and does not repeat it. **V** = fetched, with the quote checked. **S** = secondary source or snippet. **U** = unverified or inferred._

## 1. Redirect architecture at scale

| Mechanism                       | Capacity                                                      | Host-aware           | Query in match                           | Case / slash                              | Changes without a deploy | Evidence                                                                                      |
| ------------------------------- | ------------------------------------------------------------- | -------------------- | ---------------------------------------- | ----------------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------- |
| Next.js `redirects()`           | 1,024 on Vercel; "1000+": use Proxy                           | `has: host`          | `has: query`                             | —                                         | No                       | V `.next-docs/01-app/02-guides/redirecting.mdx:292`                                           |
| Vercel Bulk Redirects           | Pro 1,000, Enterprise 10,000, +25k blocks; max 1M per project | Full-URL source      | Ignored                                  | Case-insensitive by default; no wildcards | Yes (staged)             | V https://vercel.com/docs/routing/redirects/bulk-redirects                                    |
| Vercel Global Config            | **1 MB per store**, 3 per project; writes take ≤10 s          | Code                 | Code                                     | Code                                      | Yes                      | V https://vercel.com/docs/edge-config/edge-config-limits                                      |
| Proxy + database / Bloom filter | Unbounded                                                     | Code                 | Code                                     | Code                                      | Yes                      | V `.next-docs/…/redirecting.mdx:349-379`                                                      |
| Netlify `_redirects`            | Over 10k rules: use wildcards or Edge Functions               | Full-URL `from`      | Exact parameter set only                 | Case-sensitive; slash ignored             | No                       | V https://docs.netlify.com/manage/routing/redirects/redirect-options/                         |
| Cloudflare Bulk Redirects       | 10k / 25k / 50k / 1M by plan                                  | Yes; scheme optional | Query kept only if opted in              | Not stated                                | Yes                      | V https://developers.cloudflare.com/rules/url-forwarding/bulk-redirects/reference/parameters/ |
| Shopify                         | 100k (Plus: 20M)                                              | Per store            | "might not work as expected"             | —                                         | Yes                      | V https://help.shopify.com/en/manual/online-store/menus-and-links/url-redirect                |
| WordPress Redirection           | Database                                                      | Per site             | Exact (default), ignore, or pass through | Ignore-case and ignore-slash options      | Yes                      | V https://redirection.me/support/matching-a-url/                                              |

- **Precedence.** Shopify: "You can redirect only from broken URLs", so a live page wins. Vercel runs bulk redirects "before any other route", so a stale entry hides a live page.
- **Cost.** Per Vercel, Proxy "adds latency by running extra code on every request". Bulk redirects use hashed shards behind a Bloom filter (V https://vercel.com/blog/scaling-redirects-to-infinity-on-vercel).
- **Streaming hazard.** "a `redirect()` mid-stream becomes a client-side redirect rather than an HTTP redirect header". A mid-stream `notFound()` returns 200 with `noindex` (V `.next-docs/01-app/02-guides/streaming.mdx:613-617`). Under Cache Components, uncached data outside `<Suspense>` fails the build (`:380`). The donor app sets `cacheComponents` (`apps/donor/next.config.ts:36`).

**Implication for Asym.**

- **Bulk Redirects is brittle here.** It is a second copy to sync and delete per tenant. It is blind to live state, so a restricted missionary keeps redirecting until the next sync. It ignores query strings and shadows live pages. Tenants share one staging version per project (U).
- **Global Config** is too small.
- **A lookup in the catch-all page** would produce a 200 response plus a client-side redirect. The lookup must finish before rendering, in Proxy.

## 2. Status codes and caching

- **Next.js and Vercel.** In Next.js, `permanent: true` "will use the 308 status code which instructs clients/search engines to cache the redirect forever" (V `.next-docs/…/next-config-js/redirects.mdx:30`). Vercel says 307 and 302 are "Not cached by client" (V https://vercel.com/docs/redirects).
- **Cached 301s can't be recalled.** Browsers reportedly honour `Cache-Control` on a 301 (S https://www.sitedetour.com/articles/prevent-browser-from-caching-a-301-redirect).
- **Google.** 302, 303 and 307 are temporary, and the "target page might still be indexed if other canonicalization signals are present" (V https://developers.google.com/search/docs/crawling-indexing/301-redirects).
- **HSTS.** Browsers allow no click-through past a certificate error on an HSTS host (V https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security). Preloading requires `includeSubDomains`, "cannot easily be undone", and takes "months" (V https://hstspreload.org/).

**Implication for Asym.**

- **Pages:** 308 with a bounded `Cache-Control` (for example `max-age=86400`).
- **Giving and missionary links:** 307 with `no-store`. A cached 308 to a missionary who is later restricted is a safety bug.
- **HSTS:** never send `includeSubDomains` or `preload` on a ministry's domain. If the old site sent HSTS, Asym's certificate must be live before the DNS flip.

## 3. Domain move runbook

- **CAA and IPv6.** "A CAA record that doesn't permit Let's Encrypt blocks issuance." Remove apex AAAA records, because Vercel "doesn't support IPv6 for custom domains added through a third-party DNS provider" (V https://vercel.com/kb/guide/a-record-and-caa-with-vercel).
- **Email.** Moving nameservers moves the whole zone, so MX, SPF and DKIM records must be re-created. Vercel's advice is to clone the zone first, or to keep the nameservers and add only A/CNAME records (S https://vercel.com/kb/guide/why-has-email-stopped-working).
- **Dangling records.** Delete DNS records before deprovisioning. Takeover gives an attacker valid certificates, cookies, and "MX records … to receive emails" (V https://learn.microsoft.com/en-us/azure/security/fundamentals/subdomain-takeover). Vercel's own takeover protection is undocumented (U).
- **Expiry.** Registrars send reminders about a month and about a week before expiry. DNS "must be interrupted" after expiry, followed by a 30-day redemption period (V https://www.icann.org/resources/pages/errp-2013-02-28-en). RDAP replaced WHOIS on 28 January 2025 (S).
- **Vendor as registrant.** Evangelical Baptist Missions (2011) alleged its IT vendor registered EBM's domains to the vendor's principal and withheld them; its donation software stopped working (V https://www.ibj.com/articles/25088-missionary-group-says-vendor-holding-website-hostage).

**Implication for Asym.** Add these readiness probes:

- the RDAP registrant is the ministry;
- the domain is on auto-renew or has more than 24 months left;
- the registrar lock is on;
- CAA allows `letsencrypt.org`;
- there are no apex AAAA records;
- the old HSTS header is recorded;
- the default is "keep your nameservers". If the ministry moves them anyway, diff MX, SPF, DKIM and DMARC before and after;
- every CNAME is classified, and each one pointing at SiteStacker gets a date to re-point or delete it.

Asym monitors expiry and certificates for the hosts it serves. It does not host DNS.

## 4. Building the link inventory

- **Google's sources.** Sitemaps, the CMS, "server logs or analytics software", the Links report, and URLs "visited at least once recently". Google says: "Start with your important URLs" (V https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes).
- **Search Console Links.** Tables are capped at 1,000 rows and are sampled. Exports go up to 100,000 rows (V https://support.google.com/webmasters/answer/9049606).
- **Wayback CDX.** `matchType=domain&collapse=urlkey&fl=original` lists archived URLs per host, 150,000 rows per query by default (V https://github.com/internetarchive/wayback/tree/master/wayback-cdx-server). It finds designation pages that sitemaps have dropped.

**Implication for Asym.**

- **Order of sources.** Generate first: giving and missionary links from imported designations and SiteStacker's redirect list. Then add the sitemap, Search Console exports, Wayback CDX, and samples of print and SlickText replies.
- **Coverage target (U).** No authoritative figure exists. Proposed: every giving, missionary and printed URL, plus content URLs covering about 95% of 12-month landings or having any external link.
- **Everything else.** "Gone"; the unmatched log is the safety net.

## 5. Post-move monitoring

- **Log retention.** Vercel Pro keeps runtime logs for **1 day**, or 30 days with Observability Plus (V https://vercel.com/docs/logs/runtime).
- **Query strings leak** through the "Referer Header", "Web Logs" and "Browser History" (V https://community.owasp.org/vulnerabilities/Information_exposure_through_query_strings_in_url). Google Analytics forbids personal data in URLs (S https://support.google.com/analytics/answer/6366371).
- **Google** says to watch for an "unusually high number of "Not found" errors" (V site-move guide).

**Implication for Asym.**

- **Own aggregate.** Store tenant, host, normalised key, outcome, count, first seen and last seen. Drop the query (except allow-listed keys), IP and user agent. Retention follows Q15.
- **Noise.** Filter scanner paths such as `/wp-*` and `.env` (U).
- **Cadence.** Review weekly for 8 weeks, monthly to 12 months, then quarterly for at least 24 months.
- **Alert.** Raise one for any miss under the old giving prefixes.

## 6. Open redirects and abuse

- **OWASP.** Use "a maintained URL parser". "Do not use raw prefix or suffix matching." Map approved IDs on the server (V https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html).
- **Backslash bypass.** In CVE-2026-49820, `/../\evil.com` passed a relative-path check because browsers treat `\` as a separator (S https://osv.dev/vulnerability/CVE-2026-49820).
- **Lookalike domains.** Chrome's lookalike warning covers only top or engaged domains, so it doesn't protect small ministries (V https://chromium.googlesource.com/chromium/src/+/main/docs/idn.md). Fake charity sites use lookalike names to collect card numbers (S https://secretservice.gov/sites/default/files/reports/2025-02/TLP-Clear-Alert-Tips-for-Avoiding-Charity-Scams-FINAL.pdf).

**Implication for Asym.**

- **Targets.** Rows hold typed references, never URL strings. `Location` is built from the resolved same-host route.
- **Import checks.** Imports reject `\`, `%5C`, `//` and control characters. Hosts are verified.
- **"Giving has moved" search.** It shows only that tenant's designations.

## 7. QR codes and text-to-give

- **Dynamic QR codes.** qr-code-generator.com: "If you stop paying, the links pause". Trial codes "deactivate automatically" (V https://www.qr-code-generator.com/blog/do-qr-codes-expire/).
- **Lapsed domains.** Heinz let its promotion domain lapse, and the ketchup QR code then led to an adult site (2015, V https://www.theregister.com/2015/06/19/heinz_cockup_sees_ketchups_qr_codes_spurt_saucy_sites/). The domain behind a Beijing street-pole QR code "expired on Feb. 27" and the code then led to pornography (2026, V https://www.sixthtone.com/news/1018752).
- **Text-to-give codes.** Planning Center's 84321 code has been unsupported since 4 March 2026, and texts to it now fail (V https://www.planningcenter.com/changelog/giving/update-text2give-short-code-84321-officially-retiring).
- **SlickText Smart Links.** They shorten links onto a SlickText domain or a branded domain, and SlickText advises against using the ministry's website domain (S https://slicktext.com/helpcenter/articles/how-do-i-use-a-custom-domain-for-my-smart-links). SlickText's own old help URL 301s to its help home page, a soft 404 (V, observed).

**Implication for Asym.**

- **QR inventory by encoded host.**
  - Ministry domain: Asym handles it.
  - Dynamic-QR vendor: the ministry keeps paying or re-points the code.
  - SiteStacker host: the code dies at decommission.
- **New print.** Uses static codes to `ministry.org/<path>`.
- **SlickText reply.** Point it at a ministry-domain path, not at Asym's current URL.
- **Past Smart Links.** The SlickText account and short domain must outlive the 24-month window; otherwise the short domain dangles.

## 8. Edge cases

| Case                                | What happens                                                                                                    | Rule for Asym                                                                                               | Evidence                                                                                                                              |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **SiteStacker is CakePHP, not IIS** | Mixed-case links may have worked anyway, because MySQL's default collation is case-insensitive                  | Exact match first, then a lowercase key. Reject keys that collide when lowercased                           | Repo `grill/research/r10-gap-g3.md` §3.4(6); V https://dev.mysql.com/doc/refman/8.0/en/case-sensitivity.html; SiteStacker behaviour U |
| Trailing slash                      | Next.js 308s `/x/` to `/x` before Proxy runs                                                                    | Store keys without the slash                                                                                | V `.next-docs/…/skipTrailingSlashRedirect.mdx`                                                                                        |
| `.php`, `.aspx` or `.html`          | Next.js treats a dotted last segment as a file                                                                  | Keep the extension in the key; never strip it                                                               | V same                                                                                                                                |
| `?id=123` designation pages         | A path-only map can't route these                                                                               | Per-tenant allow-listed query keys go into the key, sorted. UTM parameters pass through; others are dropped | V Vercel Bulk Redirects ignores the query                                                                                             |
| Percent-encoding                    | `%7e` is the same as `~`                                                                                        | Decode unreserved characters and uppercase hex. Never decode `%2F` or `%5C`                                 | V RFC 3986 §2.1, §2.3                                                                                                                 |
| Fragments                           | Never sent to the server. A redirect "inherits the original reference's fragment"                               | Nothing to map                                                                                              | V RFC 9110 §10.2.2                                                                                                                    |
| Several old hosts                   | Apex, `www`, `give.`, vendor subdomain                                                                          | Host is part of the key. Aliases are handled by domain configuration. Vendor hosts are out of scope         | ADR-0193 via r1                                                                                                                       |
| `http` and `https`                  | Scheme differs                                                                                                  | Leave the scheme out of the key                                                                             | V Cloudflare                                                                                                                          |
| Later Asym page move                | A stored URL target creates a redirect chain                                                                    | Store a reference and resolve it at request time, so there is one hop                                       | r2                                                                                                                                    |
| Retired page reactivated            | A legacy row and a live page share a key                                                                        | The live page wins; publishing it retires the row                                                           | V Shopify                                                                                                                             |
| Missionary restricted later         | A cached permanent redirect outlives the restriction                                                            | 307 with `no-store`, decided at request time                                                                | §2                                                                                                                                    |
| Redirect that only changes case     | Loops if matching is case-insensitive                                                                           | Reject rows whose target equals the source once both are lowercased                                         | V https://vercel.com/docs/routing/project-routing-rules                                                                               |
| **Host-blind app redirects**        | `apps/donor/next.config.ts:193-215` 308s `/give`, `/donate` and `/missionaries` to `/workers` before Proxy runs | Make them tenant-aware or remove them before Asym serves any ministry domain                                | Repo; V `.next-docs/…/proxy.mdx:240-242`                                                                                              |

## Corrections to Option B

1. **Existing host-blind 308s.** They will send `/give` and `/donate`, the most-printed paths, to `/workers` on every ministry domain, cached permanently. This contradicts the giving outcomes and the `/give/*` root. r1 calls them 301s; they are 308s.
2. **The lookup runs in Proxy,** not in a streamed page (§1).
3. **"Exact path" needs normalisation rules:** host, lowercase fallback, trailing slash, percent-encoding and allow-listed query keys. Otherwise `?id=` pages and mixed-case links become "gone".
4. **Targets.** Use references, not paths.
5. **Status and cache rule for each outcome.**
   - Pages: 308 with a cache cap.
   - Giving and missionary: 307 with `no-store`.
   - Restricted: 404.
   - Gone: 404 or 410.
6. **Extra readiness probes:** registrant, expiry, CAA, AAAA, HSTS, the nameserver choice, SlickText short domains and QR vendors.
7. **Text-to-give.** Point the reply at a ministry-domain path.
8. **"Never expire".** It holds only while the domain points to Asym and stays registered.
9. **Platform.** SiteStacker is CakePHP 2.x, not IIS or ASP.NET.

## Least-brittle architecture (simple)

1. **One `legacy_link` table** in Postgres, owned by `packages/api`. Columns: tenant site, verified host, normalised key, outcome enum, typed target reference, and dates.
2. **Proxy gated by host.** Check a short-lived cached key set for the tenant, read the row only on a hit, and return real HTTP status codes.
3. **Precedence decided at write time.** Reject rows that:
   - equal a live route;
   - collide with another key when lowercased;
   - redirect to themselves;
   - contain forbidden characters;
   - name an unverified host.

   Publishing a page at a legacy key retires that row.

4. **Targets resolved at request time,** so every link is one hop.
5. **Unmatched-path aggregate,** with one-action mapping for the ministry.
6. **Readiness probes** for DNS, RDAP, CAA, HSTS and certificates. Asym does not host DNS.

## What not to build

- A synced copy of the map in Vercel Bulk Redirects, Global Config or a KV store.
- A database query on every request without a cached gate.
- Regex, wildcard, fuzzy or AI matching, or a fallback to the home page.
- Cacheable permanent redirects for giving or missionary links.
- HSTS `includeSubDomains` or `preload` on ministry domains, or DNS or registrar services.
- A dynamic-QR or link-shortener service, or a SlickText integration.
- Logging of full URLs, IP addresses or user agents.
