# Q17 — Website content and old links in a Switch: decision as asked and chosen

Founder answer (2026-11-03): **"B but consider brittleness and techincal debt. also research modern best pratices in this area and apply accordingly where and how it makes sense."** The founder also required a full, ruthless adversarial review across all 22 categories.

## Options as asked

- **A. Data only; the website stays out of the Switch.**
- **B. Every old link has a planned outcome; content moves on its own track (chosen).**
- **C. Full website move inside the Switch.**

## Option B as proposed

1. **Content** goes through ADR-0173: private drafts, reviewed, published by people. It can happen before or after the Switch and never gates go-live.
2. **Link list.** The readiness census builds a list of old links from the old sitemap, known giving links, QR targets and text-to-give replies, plus any the ministry adds.
3. **One outcome per old link:**
   - **Ordinary page:** points to its Asym page (ADR-0147).
   - **Giving link:** points to the matching Asym giving page. This needs an owner rule (O10).
   - **Unmatched giving link:** goes to a "Giving has moved" page with search, never the home page.
   - **Retired missionary:** goes to a neutral page offering other giving, or to "not found", by the ministry's choice.
   - **Restricted missionary:** always "not found".
   - **Everything else:** "gone".
4. **How long links last.** Giving and missionary links work for at least 24 months, and longer by default. Page links never expire.
5. **The domain.** The ministry keeps its domain and moves it when it chooses, after a readiness check. The check confirms the old system's still-running donor pages don't depend on the domain, verifies DNS, certificates and email records, and flags leftover SiteStacker subdomains.
6. **Text-to-give.** The reply link is switched to Asym at the boundary.
7. **QR codes.** Codes pointing at the ministry's own domain keep working. Codes on a SiteStacker address are flagged.

## Facts presented with the question

- **ADR-0173:** content imports are private drafts only.
- **ADR-0147:** ordinary-page continuity uses exact paths only; no wildcards, external targets or giving routes; links never expire.
- **No path yet for giving or missionary links (O10).** Imports cannot create giving addresses, and `/give/*` is closed to ordinary redirects.
- **A retired missionary has no page** (Q13).
- **Moving the domain at the boundary may break tail pages** (inferred).
- **SiteStacker text-to-give** runs through the ministry's own Slick Text account.
- **Google:** keep redirects at least a year, and never send old links to the home page en masse.
- **Nothing is built yet:** no redirect, domain or sitemap machinery.

## Ratified context

- **Q1:**
  - clause 4: giving continuity and exact redirects;
  - clause 7: Legacy Surface Dispositions;
  - clause 12: decommission.
- **Q3:** Coverage and website content decided separately.
- **Q7:** tail gifts.
- **Q8:** move campaign, Continue link, End date.
- **Q10:** people.
- **Q13:** retired designations.
- **Q14:** photos private until consent.
- **Q15:** retention.
- **Constraints:**
  - C5: Phase 23 and Phase 30 content split.
  - C19–C21: Site, locale and entry method.
- **Owner requirements:** O4, O5, O8 and O10.
- **Binding:** ADR-0173 CMS private-draft imports, preserved.

## Research

- `research/q17-r1-repo-content-urls.md`
- `research/q17-r2-external-content-urls.md`
- `research/q17-r3-repo-verification.md`
- `research/q17-r4-external-architecture-and-edge-cases.md`

Research files r3 and r4 were added for the full review.
