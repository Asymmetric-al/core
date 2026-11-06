# Q17-R2 — External evidence: website content and old links in a Switch

_Web research, accessed 2026-11-03. **V** = source fetched, quote checked · **S** = secondary (third party, vendor blog, forum or search snippet only) · **U** = unverified or inference._

**Gaps:** GoFundMe Pro, Ministry Brands, Tithe.ly transition, Webflow help and CRCNA pages returned 403; help.sitestacker.com fails TLS (r07). No public document found from Funraise, Bloomerang, Pushpay, Donorbox or Givebutter on redirecting old form URLs, or from SiteStacker on DNS or vendor hostnames.

## 1. Website moves (Google Search Central)

- Use permanent server-side redirects (301/308): "`301` and other permanent redirects don't cause a loss in PageRank". "Map your old site's URLs to the URLs for the new site". "Don't redirect many old URLs to one irrelevant single URL destination, such as the home page … might be treated as a soft 404". Removed pages "return an HTTP 404 or 410". Keep redirects "generally at least 1 year. From users' perspective, consider keeping redirects indefinitely". Redirect "to the final destination directly"; chains "ideally no more than 3 and fewer than 5". Update sitemaps and `rel="canonical"`. (V: https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
- Temporary redirects are not a canonical signal. JavaScript redirects are a last resort. (V: https://developers.google.com/search/docs/crawling-indexing/301-redirects)
- "All `4xx` errors, except `429`, are treated the same", so Google handles 404 and 410 alike. (V: https://developers.google.com/search/docs/crawling-indexing/http-network-errors)
- Change of Address works only for domain or subdomain moves ("cannot move properties at the path level"). It needs a 301 from the old home page and lasts 180 days. (V: https://support.google.com/webmasters/answer/9370220)
- RFC 9110: 301 and 308 are "heuristically cacheable", so browsers may keep reusing a wrong permanent redirect. (V: https://www.rfc-editor.org/rfc/rfc9110#section-15.4.2)

**Implication for Asym.** The usual case is the same domain (ministry.org) moving from SiteStacker to Asym. That is a URL change on one host, not a domain move, so Change of Address does not apply and the redirect map must be served by Asym on that host. Use 301/308 for content pages. Use 302/307 for giving and missionary paths whose target may change during the tail. Never fall back to the home page.

## 2. Giving-platform switches

| Vendor / case               | Old links                                                                                                                                                                                                                                                                     | Evidence                                                                                                                                                                                                         |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fundraise Up                | "Map each old donation URL to its intended destination before making changes". Its server rule example keeps "the path and query string". Its own redirects for archived campaigns last **18 months**, after which old links return not found                                 | V: https://fundraiseup.com/support/301-redirect/                                                                                                                                                                 |
| GoFundMe Pro (Classy)       | Legacy pages are being retired and Studio has 301s. Nothing says legacy URLs redirect automatically                                                                                                                                                                           | S: https://prosupport.gofundme.com/hc/en-us/articles/37288737924251-Sunsetting-legacy-campaigns (403; snippet)                                                                                                   |
| Blackbaud Online Express    | Marked discontinued; the move is to RE NXT forms. No redirect document found                                                                                                                                                                                                  | S: TrustRadius; U for redirects                                                                                                                                                                                  |
| Kindful to Bloomerang       | Donation pages and text-to-donate carry over; registration forms and crowdfunding do not                                                                                                                                                                                      | S: https://www.donordock.com/articles/kindful-alternatives                                                                                                                                                       |
| University of Alaska (2026) | "Redirects have been added to existing engage.alaska.edu pages" but "legacy 'giving search' URLs have stopped working"; units must update "website, print, and digital materials"                                                                                             | V: https://www.alaska.edu/news/system/2026-new-online-giving-platform-has-launched.php                                                                                                                           |
| Planning Center Giving      | Shared short code 84321 ended on 2 June 2025 because carriers dropped shared short codes. The new dedicated number costs $5/month and is randomly assigned. Donors who text the old code are redirected; churches without a number send them to the web form                  | V: https://www.planningcenter.com/changelog/giving/35774266392219-changed-dedicated-10-digit-numbers-now-required-for-text2give                                                                                  |
| CDM+                        | Porting a text-giving number takes "up to 7 days", then registration with no fixed time. Until then, gifts go to a CDM+ form. Alternatively, keep the old number live while a new toll-free number registers                                                                  | V: https://help.essentials.cdmplus.com/ce/migrating-text-to-give                                                                                                                                                 |
| Text In Church              | Porting takes 24 hours to 5 business days and must be started by the account owner                                                                                                                                                                                            | V: http://help.textinchurch.com/en/articles/2407395-move-my-text-in-church-phone-number-to-another-provider                                                                                                      |
| 10DLC                       | A2P 10DLC registration is "generally not transferable"                                                                                                                                                                                                                        | S: https://www.alphonsolabs.com/switching-business-texting-providers/amp/                                                                                                                                        |
| Givebutter / Tithe.ly       | Recurring gifts move only by deliberate migration (Stripe only). Tithe.ly QR codes stay active "as long as the linked Giving Form or Custom Link remains valid"                                                                                                               | S: https://help.givebutter.com/en/articles/5489025-how-to-migrate-recurring-plans; https://help.tithe.ly/hc/en-us/articles/16676859596567                                                                        |
| Overlap windows             | ChurchTrac keeps the old platform open about 90 days ("If everyone has moved over, you can officially close it out"). Ministry Brands suggests 1–3 months                                                                                                                     | V: https://www.churchtrac.com/blog/switching-online-giving-platforms-a-guide-for-church-leaders; S: Ministry Brands (403)                                                                                        |
| **SiteStacker**             | No built-in text-to-give. It uses **Slick Text** through the organisation's own account and keyword. The auto-reply links to the SiteStacker checkout with a source code. Redirects are stored per Site Channel and per page as paths only; the status code is not documented | V: https://training.sitestacker.com/support/solutions/articles/151000114955-text-to-give-option-for-site-stacker; https://training.sitestacker.com/support/solutions/articles/151000114986-how-to-redirect-a-url |

**Implication for Asym.** No vendor keeps redirects on its own hostnames forever, so the ministry's domain is the only lasting anchor. In SiteStacker setups, text-to-give is a Slick Text auto-reply URL. Changing that one URL, which the ministry controls, moves text giving without porting a number (S: Slick Text's default is shared short code 31996, and shared codes are being phased out). No link moves a recurring gift. "Switched off at the boundary" should mean the old processor stops taking gifts. The old path on the ministry's domain should still land on the mapped Asym giving page or a "giving has moved" page.

## 3. QR codes

- The printed pattern never expires; the destination does. A static code pointing at a URL on your own domain is the least fragile choice. A dynamic code dies with its subscription, so ask whether its redirects can be exported. (S: qrstuff, rocketlink and uniqode vendor blogs)
- Bitly: links on your own custom domain keep resolving while DNS points to Bitly but cannot be edited after a downgrade. On complimentary domains, "your links will break" when the registration lapses. (S: https://support.bitly.com/hc/en-us/articles/18143223221773-Why-can-t-I-edit-or-redirect-my-link)
- A church lost its domain while switching ISPs, and the fliers it had handed out sent visitors to a porn site. (V: https://churchmarketingsucks.com/?p=730)
- Fake QR stickers over real codes, and flyers for fake donation pages, are documented scams. (S: BBB/WQAD, https://www.wqad.com/article/news/verify/dont-get-scammed-by-a-qr-code-fraud-charity-donations-on-qr-codes-could-be-scams/65-caafe7ff-5955-40ae-a043-09008831628b)

**Implication for Asym.** Printed codes on envelopes and mailers encode either a ministry-domain URL, which Asym can redirect indefinitely, or a vendor or shortener host, which Asym cannot. The Switch inventory must record each code's host. Never leave a printed ministry-domain path dead: give it a landing page.

## 4. Domains and DNS

- Lower TTLs before cutover: Route 53 suggests an NS TTL of 60–900 s, then about two days' wait for the old TTL to expire. Keep the old name servers for rollback; copy MX records too. (V: https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/migrate-dns-domain-in-use.html)
- The apex needs an A record and `www` a CNAME. Vercel issues certificates once DNS resolves. Stale AAAA records or proxied records block issuance. (V/S: https://vercel.com/kb/guide/a-record-and-caa-with-vercel)
- On multi-tenant platforms, each custom domain gets its own certificate. A TXT record proves ownership if the domain is already in use elsewhere. Redirect between `www` and the apex, and set a canonical when both a platform subdomain and a custom domain serve the site. (V: https://vercel.com/docs/platforms/multi-tenant-platforms/configuring-domains)
- A CNAME left pointing at a deprovisioned vendor resource can be claimed by someone else (subdomain takeover). Update DNS before deprovisioning. (S: https://learn.microsoft.com/azure/security/fundamentals/subdomain-takeover)
- The legacy vendor domain kintera.org was taken over by a gambling site, which broke the Sphere-to-Luminate redirects. (S: Blackbaud Community thread title only, https://community.blackbaud.com/discussion/comment/240912)

**Implication for Asym.** Three parties are involved: the ministry controls the registrar and usually DNS; WMTEK controls its own hostnames (U: whether SiteStacker hosts customer DNS or uses `*.sitestacker.com` names). Asym can promise redirects only for hostnames that resolve to Asym. Issue and verify TLS for the apex, `www` and `give.` hosts before the flip. Have the ministry re-point or delete every CNAME to SiteStacker. Asym should not take over the ministry's whole DNS zone.

## 5. CMS content migration

| Tool                         | Transfers                                                                                                          | Does not                                                                                                               | Evidence                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| WordPress Importer (WXR)     | Posts, pages, custom post types, comments, custom fields, terms, authors (mapped), nav menus, attachments (opt-in) | Themes, widgets and settings (not listed)                                                                              | V: https://wordpress.org/plugins/wordpress-importer/                               |
| Squarespace export           | Layout pages, one blog, gallery pages, text and image blocks                                                       | Other page types, headers, footers, drafts, styles, custom CSS, audio/product/video blocks; images "might not migrate" | V: https://support.squarespace.com/hc/en-us/articles/206566687-Exporting-your-site |
| Squarespace Getty images     | —                                                                                                                  | "Licensed Images are site-specific … purchase a new license" for another site                                          | S: https://www.squarespace.com/image-terms                                         |
| Webflow CSV                  | Rich text as HTML; files up to 4 MB                                                                                | No responsive image variants; draft status cannot be set on import                                                     | S: help and forum snippets                                                         |
| Wix                          | Some CSV/RSS                                                                                                       | No full-site export; the design must be rebuilt                                                                        | S                                                                                  |
| Payload import-export plugin | CSV/JSON; create/update/upsert; `defaultVersionStatus: draft`                                                      | Virtual fields are skipped. It warns that readers of the uploads collection "may be able to download data"             | V: https://payloadcms.com/docs/plugins/import-export                               |
| Payload redirects plugin     | `from` and `to` (a document reference), with types                                                                 | It "does not handle the redirect itself"                                                                               | V: https://payloadcms.com/docs/plugins/redirects                                   |
| Next.js                      | —                                                                                                                  | Vercel caps config redirects at 1,024; for 1,000+, use Proxy with a stored map                                         | V: repo `.next-docs/01-app/02-guides/redirecting.mdx:292,349-358`                  |

- Audit before migrating: inventory every URL and cut ROT (redundant, outdated, trivial). One university puts legacy ROT at 30–50%. Consolidate or archive rather than delete. (S: https://www.uvm.edu/drupalwebguide/preparing-migrate-next-phase)
- SiteStacker documents no content export; redirect import in Release 2.49 is unverified (r07 §6).

**Implication for Asym.** No importer anywhere carries layouts, forms or widgets. Payload's draft default matches the "private drafts only" rule. Every old URL should get exactly one outcome: draft page, redirect, gone, or restricted. Media rights and alt text do not travel with the files and need their own check.

## 6. Missionary profile pages

- "Prayer letters published on church websites, photos posted on blogs, and stories told in public can all be used against missionaries." (V: https://christianitytoday.com/ct/2009/march/8.14.html) A sensitive worker's identity "cannot be published online" (S: https://www.potomacag.org/missions-contact). Consult higher-risk workers before publishing names or photos (S: https://www.gfbc.com/s/security-and-communications-missions.pdf).
- Departures: NAMB requires "a current assignment to keep the account open", and gifts above the need go "where the need is greatest" (S). AIM Canada may redirect funds when a missionary leaves but honours designations "whenever reasonably possible" (S: https://cagiving.aimint.org/wp-content/uploads/2026/08/Donor-restricted-gift-policy.pdf). Closed giving pages say "no longer accepting donations" and point to the cause (S: GlobalGiving, JustGiving). I found no published agency policy on profile URLs (U).
- Google's temporary removal "lasts only about six months". Permanent removal needs 404/410, a login wall or noindex. (V: https://support.google.com/webmasters/answer/9689846)

**Implication for Asym.**

- **Active, unrestricted:** a temporary redirect to the new profile.
- **Departed:** a "completed service" page, or 410. Never redirect silently to another missionary's giving; changing the designation is a donor-intent matter.
- **Restricted:** never redirect a real-name URL to the alias page, because that publishes the name-to-alias link. Return 404/410 and leave it out of sitemaps. Note that search caches and archives sit outside Asym's control.

## 7. Edge cases

- **Case, slashes and queries:** Google treats URLs as case-sensitive (V: https://developers.google.com/search/docs/crawling-indexing/url-structure). Fundraise Up: "Test any relevant paths, trailing-slash variants, and query parameters."
- **Giving parameters:** pass UTM and source codes through. Translate fund or designation through the server-side mapping, drop unknown parameters, and never accept a destination from a parameter.
- **Open redirects:** OWASP says to keep user input out of destinations, map IDs "server-side to a full target URL", and use allow-lists; otherwise "phishing attempts may have a more trustworthy appearance". (V: https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html)
- **Loops:** loops across servers show as browser errors; prefer HTTP redirects to meta refresh. Use 307/308 when the method (POST) must be preserved. (V: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Redirections)
- **Vanity, short and frozen links:** `ministry.org/give/smith` can be mapped; bit.ly links need their owner to re-point them. Old emails, PDFs and partner-church sites can't be edited, so only redirects help.
- **Multi-language:** "Avoid automatically redirecting" users between language versions. Give each language its own URL and add hreflang. (V: https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)

## Common failure modes

1. Many old URLs redirected to the home page (soft 404), or simply 404, so printed QR codes and letters dead-end.
2. Vendor-hosted redirects (old checkout host, shortener, dynamic QR) quietly expiring when the contract ends (Fundraise Up 18 months; Bitly complimentary domains).
3. Dangling `give.` CNAMEs, or a lapsed domain, captured by gambling, porn or phishing sites.
4. The text-to-give auto-reply still pointing at the dead SiteStacker checkout.
5. Permanent 301s for giving targets that later change, which browsers cache.
6. A restricted worker's real-name URL redirected to the alias.
7. Imported pages published by default; layouts and forms assumed to transfer.
8. TLS not yet issued at the DNS flip; MX records lost.

## Simplest robust defaults

1. A URL inventory from crawl, sitemap and SiteStacker redirects, plus the hosts of printed codes, short links and the Slick Text reply. Each row gets one outcome: **draft, redirect, completed service, gone or restricted**.
2. Exact-match lookup first, then normalised (lowercase, no trailing slash). Single hop. Validate at import time against loops and chains.
3. 301/308 for content; 302/307 for giving and missionary paths. Keep them indefinitely while the ministry's domain points at Asym.
4. Unmapped giving paths go to a "giving has moved" page with the main giving link, not to the home page.
5. The domain stays with the ministry. Asym checks DNS, TLS, MX and stray CNAMEs before the flip.
6. Restricted workers: 404/410, no redirect, no sitemap entry, no imported photos.
7. Change the Slick Text auto-reply URL before porting numbers.

## What not to build

- A destination taken from a query parameter, or any open redirect.
- A redirect service for hostnames Asym does not serve (sitestacker hosts, bit.ly).
- Bulk redirects to the home page, or wildcard catch-alls.
- Layout, form or widget importers; automatic publishing; AI-guessed URL mapping.
- Number porting or a QR-code service inside Asym.
- Automatic language-based redirects.
