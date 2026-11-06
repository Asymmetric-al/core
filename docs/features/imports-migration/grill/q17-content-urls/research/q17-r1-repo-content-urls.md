# Q17-R1 — Website content and old links in a Switch (repo evidence)

F15 (`decision-log.md:1122`). Develop `629cb71dc`, 2026-11-03. Extends r04 §2, r10-gap-g8 §3, r07 §6 and q01-r1 §3. Weaker evidence is marked **unverified** or **inferred**.

## 1. ADR-0173: the clauses that matter in a Switch (ratified; documentation only, `:351-354`)

- **Entry point is Web Studio.** "Web Studio exposes one quiet **Content portability** workspace" with **Move content into Asym** (cl.1, `:33-35`). Phase 30's own surface is "Mission Control Data Tools" (`roadmap.md:4335`). Phase 30 supplies only the mechanics (cl.2, `:42-45`; C5, `decision-log.md:924`).
- **Private drafts only.** Every screen repeats "**Live impact: None — private drafts only**" and the Site's public domain (cl.12, `:127-130`). An import never "activates navigation/redirects/schedules/forms … updates public search, or emits public media" (cl.21, `:215-218`).
- **Media.** "A source URL, Payload upload, checksum match, or successful download never makes media publicly eligible" (cl.9, `:107-108`).
- **Certified sources.** Only certified adapter and version pairs are listed as ready. "**Other CMS or custom site** always exists as a request/approved-sample lane"; unknown versions "pause for qualification" (cl.11, `:118-125`). No SiteStacker content adapter exists (r04 §2.7). SiteStacker would therefore enter through that lane (**inferred**).
- **Specialized pages go to their owners.** Pages and Articles map only to D6–D11 families. "specialized Missionary, Project/Campaign, Ministry Update, form, and media facts" route "through their owner adapters". Every "path, SEO override, publication/schedule fact" is classified (cl.16, `:161-171`).
- **Path impact is checked but not activated.** The no-write check covers "D2/D3 path and continuity impact" (cl.17, `:176`). The plan shows "path/redirect impact … and zero publication" (cl.19, `:196-197`).
- **Re-import.** Content "never updates by title, slug, email, path…" (cl.15, `:159-160`). Only a package with an exact Asym identity can propose an update. "A later source delta is a new checked plan … never blind upsert" (cl.22, `:224-228`).
- **Locale.** Each imported locale maps to "one enabled D22 lineage. There is no default-locale guessing" (cl.24, `:238-243`). C19 (`decision-log.md:938`) says the same.
- **Concurrency and reversal.** "Only one committing content-portability run may own a Site write cohort at a time" (cl.25, `:244-245`). Reversal blocks once an item is "released, externally observed" (cl.29, `:282-290`).

**Gap.** A Switch runs from Data Tools; content import starts in Web Studio. Nothing says whether content status shows in the Switch or gates go-live.

## 2. Phase 23 D29, Phase 42, Payload

- US23-029 restates ADR-0173: "no public, routing, form, message, schedule, or search effect occurs" (`phase-23-web-studio-cms.md:800-822`). Tickets #1407–#1409 are open (r04 §2.1). Phase 42 has no Phase 30 seam (r04 §2.6).
- **Code:** Payload `4.0.0-beta.3` (`apps/admin/package.json:35-41,59`). `bun.lock` has no plugin-import-export, plugin-redirects or plugin-seo entry. Vendored copies exist only as v3.77.0 (`vendor/payload-upstream/packages/plugin-redirects/package.json:3`). D29 is not implemented.

## 3. URL continuity: mechanism and ownership

| Route kind                | Owner and mechanism                                                                                                                                                                                                                                                                                               | Phase 30 role                                                                                                                                                                                                                      |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ordinary Page             | Phase 23 D3 / ADR-0147. The **Old web addresses** lane may "bind one exact normalized unused source to one stable, eligible ordinary Page reference in the same Site and locale". It accepts "no arbitrary or external URL, wildcard, regex … reserved application path, or Phase-22-owned route" (`0147:33-38`). | "Phase 30 only transports exact legacy mappings through the same validator" (`0147:45-46`). In the owner table, Phase 30 is "[not] Target validation, wildcard authority, or activation owner" (`phase-23-…-decision-log.md:557`). |
| Missionary / Project page | Phase 22 D8 / ADR-0125. A case can only continue, show a Transition Notice, permanently move "to an already released … Route Generation for the same immutable Page identity", or return 404 (`0125:30-37`). "Paths are never reused after tombstoning" (`:52-53`).                                               | None. This is O10 (`decision-log.md:1027`).                                                                                                                                                                                        |
| Giving address            | Phase 24 D10–D12. `/give/*` is a Giving-owned root, and "Ordinary CMS Pages, redirects, plugins, and catch-all routing cannot occupy" it (`phase-24-…-decision-log.md:1550-1552`). Addresses never redirect to each other: older address A "does not redirect, rewrite, traverse B" (`:1845`).                    | None (C20).                                                                                                                                                                                                                        |
| Short link / QR           | Phase 13 D14b: `give.tenant.org/s/<token>` returns a 302 to the canonical page with `?sc=` added (`phase-13-…md:1617`).                                                                                                                                                                                           | None.                                                                                                                                                                                                                              |

- **No general redirect engine exists** (US23-003, `phase-23-web-studio-cms.md:251-262`). "The current Payload redirects plugin is not adopted as the product contract" (`phase-23-…-decision-log.md:560`). Phase 5 has no "CMS/Next/Vercel redirect layer" (`phase-05-…contract.md:246`).
- **Limits.** Exact paths only. Scope is per Tenant × environment × Site × locale. No wildcards, regex, chains, external targets or homepage fallback (`0147:51-55`; D3 evidence `:358-359`). Only GET and HEAD are redirected. On Phase 22 redirects, queries are dropped except "allowlisted, revalidated, non-routing attribution" (`phase-22-…-decision-log.md:1392-1395`). ADR-0147 keeps the query string but never routes on it (`:39-41`).
- **Timing.** A mapping becomes live only through a D1 generation, not at import (ADR-0173 cl.21).
- **Code:** `apps/donor/next.config.ts:193-215` has host-blind static 301s: `/home`→`/`, and `/missionaries`, `/donate`, `/give`→`/workers`. The only redirect-like table is `donor_merge_redirects` (`supabase/migrations/20260704140000_…sql:78`).

## 4. Domains

- **Model (Phase 24 D72, ADR-0193, accepted with amendments).** Each Site has one Primary Site Domain plus optional Redirect Site Domains. Core "supports a proved apex, `www`, or other exact Tenant hostname and never chooses one automatically" (`:56`). There is no platform-branded primary (`:52-53`). Custom wildcard domains need "a separate decision" (`:67`). Tenant-controlled public roles are "production-only" (`:64`). Vercel's whole-domain redirect setting is prohibited (`:119`). Redirect destinations never come from "imports, or AI" (`:91-92`).
- **Verification (D75, ADR-0196).** Staff with `sites.manage_domains` start the check (`:15`). Core issues "its own fresh DNS-control challenge", a TXT record valid "seven calendar days" (`:23`, `:38`).
- **Who does what.** "Vercel owns observed project/domain/DNS/TLS facts; DNS operators and certificate authorities own their external facts" (`0193:152-153`). The ministry's DNS administrator makes the DNS change (**inferred**).
- **Subdomains.** "A dedicated origin may use `https://give.hope.org/give/water-project`" (`phase-24-…-decision-log.md:1554`).
- **Gap.** No owner text covers moving a hostname from an outside host such as SiteStacker into Core during a Switch. q01-r1 G9 marks domains "Census-only. A cutover-day task" (`q01-r1…:293`).
- **Code:** a mutable Payload `Tenants.primaryDomain` text field (`apps/admin/src/cms/collections/tenants.ts:40-41`). The resolver looks up `primaryDomain` with `overrideAccess: true`, then falls back to a subdomain-slug match (`apps/admin/src/cms/public/resolve-tenant.ts:145,155`). There are no Site or Domain tables. ADR-0198 says develop "cannot implement this decision" (`:32-38`).

## 5. Giving links, QR codes, text-to-give, retired designations

- **Q1 clause 7** sets "giving links, QR codes and text-to-give targets" to Off at boundary (`decision-log.md:49`). **Clause 4** says "Asym giving and exact redirects then open" (`:46`).
- **Legacy URLs cannot be reserved or issued** (C20, `decision-log.md:939`; r10-gap-g8 §3.3). There are only three ways a legacy link keeps working: a human re-issues the identical `/give/{slug}`, an exact ordinary-Page or D8 mapping exists, or nothing (the link breaks).
- **Phase 24 D13:** "A sent email, printed/downloaded QR, external website, or bookmark cannot and must not be silently rewritten" (`phase-24-…-decision-log.md:2051-2052`).
- **Phase 24 D11:** launch does not support "advance public link/QR material for an unissued Giving address" (`:1572-1574`). New QR codes can be printed only after an Asym page is published.
- **Phase 24 D10:** a Phase 13 short token keeps only "the identical Site, Designation, donor task, and stable `source_code_id` or become unavailable" (`:1355-1358`).
- **Designation-specific links.** A Phase 22 page has exactly one Giving Binding. A stale or forged binding "never falls back to another charitable purpose" (`0124:18-29`). Nothing maps a legacy designation link to an Asym designation. The Q13 binding is for history only.
- **Retired designations** are "kept for history, never givable" (`decision-log.md:661`). A "completed service" page exists only as a Phase 22 **Transition Notice Release** on a page Asym has already released (`0125:31-33`). A never-published Asym page has nothing to transition, so the result is a 404 (**inferred**).
- **Text-to-give.** SiteStacker has no native tool. Slick Text uses "a source-coded checkout URL" (`q01-r1…:72`). The SMS keyword "still points at the SiteStacker URL after the switch (inferred)" (`q01-r2…:227`).

## 6. Missionary profile pages

- Phase 22 owns these pages. Phase 28 defers to it (`phase-28-…/finance-stewardship.md:255-256`).
- **Imports cannot publish.** "imports remain private until deliberate submission". Legacy evidence is recorded as "**not captured**", and the declaration is required "on the next … imported … candidate" (`phase-22-…-decision-log.md:5692-5693`).
- **Restricted workers.** Phase 10: setting restricted or high_risk "without a distinct `display_name` — via service **or import** — is rejected (fail-closed)" (`phase-10-…md:174`).
- **Photos.** Q14: "never published without Phase 10's consent record" (`decision-log.md:769`).
- **ADR-0173 cl.16** sends Missionary content to "owner adapters". No Phase 22 import adapter is specified.
- **Code:** `/workers/[id]` reads mock data (`apps/donor/app/(public)/(solid)/workers/[id]/page.tsx:24,41`). The CMS reader keys missionary giving pages by `missionaryId` (`packages/api/src/cms/public/reader.ts:51-55`).

## 7. SiteStacker content (from r07 §6 and q01-r1 G1–G9)

- **Unverified:** that any content export exists. Page URLs are "sanitized alias, optionally prefixed by folder aliases; dynamic pages follow separate rules" (`q01-r1…:91`, V54). A missionary or project page is a content item linked to a ContributionCampaign (`:226`). Redirects live per Channel and per page; redirect import in 2.49 is snippet-only (`:289`). Pre-login emailed links expire after 3 days (`:93`). Source codes are `?t=` and `?c=` (`:234`).
- **Unverified:** the real giving-page URL shape at any ministry. No customer URL was observed. The only recorded checkout is the vendor's own `sitestacker.com/checkout` (`q01-r2…:105`).

## 8. Current code (summary)

There are no sitemap or robots routes, no `/give/*` route, no `/s/[token]` route, and no source_codes, sites or site_domains tables. The donor public routes are `/[...cmsSlug]` (latest published Payload page by slug), `/workers/[id]` (mock data) and `/checkout?missionary_id|fund_id|workerId|amount|frequency` (`checkout/page.tsx:10-17`). The canonical URL is global: `canonical: siteConfig.url` (`apps/donor/app/layout.tsx:85`).

## 9. SEO and analytics

- Canonicals and sitemaps are compiler-derived from the verified host (Phase 22 D14, `phase-22-…-decision-log.md:2255-2262`; ADR-0172 cl.11/13, `:131-155`). Staff never edit "canonical, robots, hreflang, sitemap, JSON-LD, verification token" (`0172:253-254`).
- D28 "does not own … domain verification, redirects … analytics" (`0172:36-38`). "Search indexing and recrawl are external observations" (`0193:140-141`).
- **Gap:** no owner text covers carrying over legacy analytics, Search Console properties or SEO metadata in a Switch.

## Discrepancies

1. Q1 clause 4's "exact redirects then open" has no owner mechanism for giving links. Phase 30 cannot activate redirects (ADR-0173 cl.21). Giving addresses do not redirect (D12). `/give/*` is closed to ordinary redirects (D11).
2. Q1 clause 7 has no "Redirected to Asym" state. Yet q01-r5 proposed "disable … giving forms/checkout (or redirect to Asym once Asym pages are live)" (`q01-r5…:137`).
3. Entry surface: Web Studio Content portability (ADR-0173 cl.1) versus Data Tools (`roadmap.md:4335`). Q3 clause 8 says "decided separately (F15) under Phase 23" (`decision-log.md:108`).
4. Path shape: Phase 13 uses `/missionary/the-smiths?sc=` (`phase-13-…md:1616`), but Phase 24 D11 uses `/give/{slug}`. Phase 13's "changed slug is fixed without reprinting" (`:1617`) needs to be read against D10's "changed destination … requires a new token and QR".
5. Phase 22 D8's migration census includes "existing redirects, and copied public links" (`phase-22-…-decision-log.md:1447-1451`). That reads like a legacy-import seam, but ADR-0147 restricts Phase 30 transport to ordinary pages. This is O10.
6. ADR-0198 still calls ADR-0147 "proposed" (`0198:28`). ADR-0147 is Accepted.
7. ADR-0173 cl.11 requires a certified adapter, while Q3 gives SiteStacker "Direct support". There is no SiteStacker content adapter, and content export is unverified.

## Hazards

- **Domain move versus the legacy tail.** The SiteStacker surfaces kept on during the tail are on the SiteStacker host: the donor update and cancel path, the declined-payment update link, and pre-login links. Apple Pay verification is also tied to that host (`q01-r2…:229`, inferred). If the ministry's main domain points to Asym at the boundary, those surfaces may break for months. **Unverified** whether SiteStacker serves them on the ministry's custom domain.
- **Lead time versus the giving pause.** A TXT challenge can take up to 7 days and DNS propagation up to 48 h. Asym giving needs a verified Primary Site Domain. So the domain step must finish before the boundary, but pointing DNS early takes the SiteStacker site offline.
- **The most-shared links have no path.** Missionary-page links fall under O10. Printed QR codes, text-to-give keywords and retired-designation links end in a 404 unless the identical path is re-issued.
- **No new QR codes before go-live** (D11), so replacement print material cannot be ready on switch day.
- **The current `/give` → `/workers` 301 is permanent.** Once a domain moves, it would catch legacy `/give` traffic, and browsers cache that redirect indefinitely.
- **Wrong 308s cannot be recalled** (`0125:76-79`). A mapping error is permanent in donors' browsers.
- **Slow go-live.** Imported pages arrive as "not captured" drafts. Each needs a new declaration and publication, which slows the post-Switch website.

## Founder-decision candidates (plain language)

1. **Is the website part of the first Switch?** Options: (a) inventory only, with the ministry rebuilding in Web Studio; (b) private-draft import once a SiteStacker adapter is certified; (c) capture by crawling the public site.
2. **Where do staff start website import?** In Web Studio as ADR-0173 says, with the Switch summary only showing its status? Or does content readiness block go-live?
3. **When does the domain move?** At the boundary, before it, or never during the tail, using a new address such as give.ministry.org for Asym?
4. **May old addresses be carried?** Should Asym accept a ministry's list of old addresses: for ordinary pages (already allowed), for missionary and project pages (needs a Phase 22 amendment), and for giving links (re-issue only, or blocked from reuse)?
5. **Missionaries who have left and closed funds.** Show a plain "page not found", or require a published Phase 22 transition page ("this missionary has completed service")?
6. **QR codes and text-to-give.** Accept that they stop working and the ministry redistributes, or add a recorded "Pointed to Asym" state for SiteStacker-side redirects during the tail?
7. **Website-only SiteStacker.** May SiteStacker stay as a website-only host whose giving links point to Asym checkout (`q01-r5…:305,346`, still open)?
