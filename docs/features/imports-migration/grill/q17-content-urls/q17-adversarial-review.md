# Q17 adversarial review: website content and old links in a Switch

Founder answer (2026-11-03): **"B but consider brittleness and techincal debt. also research modern best pratices in this area and apply accordingly where and how it makes sense."** The founder also asked for a full ruthless review. Decision as asked: `q17-decision-as-asked.md`.

**Evidence.**

- `research/q17-r1-repo-content-urls.md`: ADR-0173, ADR-0147, Phase 22 D8, Phase 24, domains, current code.
- `research/q17-r2-external-content-urls.md`: Google site moves, giving-platform links, QR codes, text-to-give, domains, importers.
- `research/q17-r3-repo-verification.md`: exact Phase 24 giving rules, locale, D8 scope, tail hosts, the Continue link host, current-code hazards.
- `research/q17-r4-external-architecture-and-edge-cases.md`: redirect architecture, status codes, the domain runbook, inventory, monitoring, open redirects, QR codes and text-to-give, edge cases.

**Re-verified directly on 2026-11-03 against `phase-24-multi-site-management-decision-log.md`:**

- "Never redirect Giving intent" (`:1116-1118`).
- Giving rows say "**Cannot redirect — Giving links must not move donor intent** and **Create and share a new Giving link**, with no override" (`:1193-1195`).
- Address identity is "the trusted resolver's versioned canonical public origin together with the normalized path and every explicitly admitted equivalent alias, short link, QR target, or deep link … Queries, fragments … do not narrow" (`:1323-1326`).
- An older address "does not redirect, rewrite, traverse B, silently fall back" (`:1844-1845`).

**Also verified:**

- **ADR-0147** (`:18-50`): exact normalized source → one stable ordinary Page, with no "arbitrary or external URL, wildcard, regex, schedule, query rule, status choice … reserved application path, or Phase-22-owned route". Predecessors "neither expire nor become reusable merely by age". Retirement "defaults honestly to the tenant-branded Page-not-found outcome". "Phase 30 only transports exact legacy mappings through the same validator."
- **Current code.** The donor app's `next.config.ts` redirects `/give`, `/donate` and `/missionaries` to `/workers` (`:193-215`). These are permanent and host-blind.

Research, not legal advice.

**Disposition: accept with required amendments.** B's intent stands. Every old link gets a planned outcome, content moves on its own track, and the ministry moves its domain deliberately.

As worded, B conflicts with ratified Phase 24 rules and would create the brittleness the founder asked us to avoid:

1. **Giving links can't redirect.** They survive only as an _admitted equivalent alias_ served in place, admitted by a person.
2. **No separate outcome pages.** A "Giving has moved" page, a different outcome for retired missionaries, a "gone" response and different responses per kind would each be a new route outcome that owners rejected. Different responses would also reveal which missionaries are restricted. Everything unmapped gets the Site's single not-found page.
3. **No timers.** Page continuity and admitted aliases don't expire.
4. **The domain moves in stages.** The tail likely runs on the ministry's own domain, so the main domain moves only after a readiness check.
5. **Today's host-blind permanent redirects must go first.** They would capture old giving links on every ministry domain, and browsers cache them.
6. **Redirect lookups must run before rendering**, not in pages, config or the host's bulk-redirect store.

The corrected text is in §3.

---

## 1. Category review

### 1.1 Problem validity, necessity and alternatives: material concern, yes (narrows the answer)

**The problem is real.** Ministries' giving links live on printed envelopes, QR codes, years of newsletters, partner churches' sites and text-to-give replies (r2). Owner text accepts that these "cannot and must not be silently rewritten" (`phase-24:2051-2052`). A dead link at the moment of giving costs gifts and trust.

**Correct level.** Phase 30 builds the inventory and hands each row to its route owner:

- ADR-0147 for pages;
- Phase 24 for giving addresses;
- Phase 22 for D8 routes.

Phase 30 never owns or activates a route (ADR-0173 clause 21, ADR-0147).

**Strongest alternative: A** (data only). It is simplest, but every printed giving link breaks the day the domain moves. B with owner-compatible outcomes costs one inventory and one admission step.

**Not required.** C, which would tie each Switch to a website rebuild.

**Too vague or wrong in B:**

- "Points to the matching giving page" (a redirect, which Phase 24 forbids);
- "Giving has moved page" (a new route outcome);
- "Retired: neutral page" (an enumeration risk);
- "≥24 months" (an unnecessary timer);
- "moves when it chooses" (no ordering against the tail).

### 1.2 Brittleness: material concern, yes

| Fragile assumption                                   | What breaks                                                                                                                                 | Fix                                                                                                                                                                                                                             |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Redirects can carry giving intent                    | Phase 24 forbids it                                                                                                                         | Admitted aliases served in place                                                                                                                                                                                                |
| Old paths match Asym paths                           | Asym pages live under `/lang/{locale}/` (D15), and locale can't be read from a missing prefix                                               | Every kept link has an explicit mapping, with locale from source evidence (channel language). Owner request O83 covers unprefixed sources.                                                                                      |
| Old links are exact paths                            | SiteStacker (CakePHP) links appear with mixed case, trailing slashes and percent-encoding; some pages are query-driven (`?id=123`)          | Owner normalisation: host-scoped, case-insensitive fallback, one trailing-slash form, percent-decoded. Queries never decide the target (ADR-0147, `phase-24:1323-1326`). The share of query-driven links is measured (M-Q17-2). |
| A host-blind config redirect is harmless             | `/give` and `/donate` permanently go to `/workers` on every host, and browsers cache it                                                     | Removed or made tenant-aware before Asym serves any ministry domain (D65, O85)                                                                                                                                                  |
| Redirects can be checked inside pages                | With Cache Components, a redirect after streaming starts becomes a client redirect behind a 200 (r4 §1)                                     | Continuity resolves before rendering, so responses are real HTTP outcomes                                                                                                                                                       |
| The host's bulk redirects or config can hold the map | Vercel config redirects cap at 1,024. Bulk redirects run before the app and can't see live state, such as a missionary becoming restricted. | Owner-held, tenant-scoped continuity records resolved per request (r4 §1)                                                                                                                                                       |
| Moving the domain is a single switch                 | Tail pages (card update, cancel, declined-payment links) likely run on the ministry's domain                                                | Staged move after a Domain readiness check (clause 5)                                                                                                                                                                           |

### 1.3 Technical debt: material concern, yes

- **A second redirect system** (Phase 30's own table, a config list, or Vercel bulk redirects) would duplicate ADR-0147 and Phase 24 authority. _Refused:_ Phase 30 stages the list. Owners hold the records.
- **Host-blind permanent redirects in config** (D65) are debt that becomes a defect on the first ministry domain.
- **Reading `X-Forwarded-Host` for tenant resolution** (`apps/donor/lib/cms/client.ts:37-38`) contradicts ADR-0193 (D66). Host comes from the trusted resolver only.
- **A hard-coded "Give Hope" not-found page** (D66). It must be the Site's own branded page.
- **Timers on continuity** would mean a scheduled deletion job and support tickets when links die. _Removed._

### 1.4 Edge cases: material concern, yes

| #   | Case                                                               | Handling                                                                                                                                                                                   |
| --- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| H1  | A giving link printed on envelopes (`/give/smith`)                 | The ministry admits it as an alias of the Smiths' Asym giving page, served in place, with no redirect                                                                                      |
| H2  | The same giving link with different case or a trailing slash       | Owner normalisation matches it                                                                                                                                                             |
| H3  | A query-driven giving link (`/give.php?id=123`)                    | Can't be mapped, because queries never decide identity. It gets the Site's not-found page with giving search. Counted at census (M-Q17-2).                                                 |
| H4  | A giving link for a retired missionary                             | Not found (the single Site page). Donor intent is never moved to someone else.                                                                                                             |
| H5  | A giving link for a restricted missionary                          | Not found, identical to unknown. A real-name link is never tied to an alias page.                                                                                                          |
| H6  | An ordinary page (About, Statement of Faith)                       | Exact ADR-0147 mapping to its Asym page, never expiring                                                                                                                                    |
| H7  | A missionary profile page                                          | A Phase 22 D8 mapping if Phase 22 admits legacy sources (O81). Otherwise not found.                                                                                                        |
| H8  | News and blog posts                                                | An ADR-0147 mapping if the post was imported and published. Otherwise not found.                                                                                                           |
| H9  | A link to a page later retired in Asym                             | ADR-0147: tenant-branded not found, or a deliberately chosen relevant page. Single hop, so no chains.                                                                                      |
| H10 | A missionary becomes restricted after their alias was admitted     | Phase 10 adverse truth suppresses immediately. It is resolved per request, so nothing is cached.                                                                                           |
| H11 | The tail still uses the ministry domain for card update and cancel | The main domain moves only after the tail no longer depends on it, or once the old system serves those pages from its own vendor host (clause 5)                                           |
| H12 | The Q8 Continue link and move-campaign emails                      | Use the account hostname, which moves first, independent of the website domain                                                                                                             |
| H13 | `ministry.sitestacker.com` vendor addresses                        | Asym can't serve or redirect hosts it doesn't control. They are flagged in the census and die when SiteStacker ends.                                                                       |
| H14 | QR codes on a third-party dynamic-QR or short-link service         | Flagged. They depend on that vendor's subscription (r4 §7).                                                                                                                                |
| H15 | QR codes on the ministry's own domain                              | Survive through the outcome of their path (H1, H6)                                                                                                                                         |
| H16 | Text-to-give keyword auto-reply                                    | The ministry changes its reply link to the Asym giving address at the boundary. This is a checklist item. Asym doesn't port numbers.                                                       |
| H17 | Partner churches' links and old emails                             | Can't be rewritten (D13). Covered by the same path outcomes. The Switch summary lists hosts still pointing at old services.                                                                |
| H18 | The old site sent HSTS (HTTPS-only)                                | Asym's certificate is issued before DNS changes, so there is no clickable warning                                                                                                          |
| H19 | Email breaks after a nameserver change                             | The readiness check confirms MX, SPF, DKIM and DMARC are carried over                                                                                                                      |
| H20 | Leftover subdomains pointing at retired services                   | Flagged and must be removed (takeover risk). Re-checked 30 days after the move.                                                                                                            |
| H21 | The domain expires or is registered to the old vendor              | The ministry confirms it controls the registrar account and registration. Expiry is more than 12 months away and the registrar lock is on. Otherwise the move is blocked.                  |
| H22 | Apex versus `www`                                                  | The ministry chooses explicitly. Core never chooses (ADR-0193).                                                                                                                            |
| H23 | Multiple old hosts (www, non-www, http)                            | Each host is listed. Owner normalisation covers http/https and www only where the ministry admitted both hosts.                                                                            |
| H24 | Thousands of old URLs                                              | The inventory is ranked by known traffic and print use. The ministry maps the important ones, and the rest fall to not found. Unmatched-path counts guide additions afterwards (clause 8). |
| H25 | Language variants of pages                                         | Mapped per locale from source evidence. Never guessed.                                                                                                                                     |
| H26 | Open-redirect abuse (`?next=`)                                     | Destinations never come from the request. Same-tenant targets only (ADR-0147).                                                                                                             |
| H27 | Old `/checkout` links                                              | The not-found page with giving search, never a silent homepage bounce (current code bounces signed-out visitors home; D66)                                                                 |
| H28 | New QR codes wanted before go-live                                 | Only after the Asym giving address is issued (Phase 24 D11)                                                                                                                                |

### 1.5 Footguns: material concern, yes

| Footgun                                         | Harm                                      | Prevention                                                                                           |
| ----------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Mass-mapping old links to the home page         | Soft 404s and confused donors             | Not allowed (ADR-0147, Google)                                                                       |
| Mapping a giving link to a different missionary | Moves donor intent                        | An alias must be the same designation's page, and the person sees the target before admitting        |
| Moving the domain before the tail ends          | Breaks donor card-update and cancel pages | Domain readiness check blocks it                                                                     |
| Deleting old DNS records hastily                | Dangling records or broken email          | The checklist preserves email records and removes only pointers to retired services                  |
| A permanent redirect cached by browsers         | Can't be undone                           | Giving is never redirected. Page continuity is owner-coded. Host-blind config redirects are removed. |

### 1.6 Tenant safety: material concern, yes

- **Host-blind config redirects apply to every tenant's domain** (D65).
- **`X-Forwarded-Host` can be spoofed to select another tenant's content** (D66; ADR-0193 bars it).

**Requirements:**

- Continuity records are scoped by Tenant × environment × Site × host × locale (ADR-0147, Phase 24).
- Host comes only from the trusted resolver.
- The inventory is per tenant.
- Unmatched-path counts are per tenant and host.

### 1.7 Database, RLS and authorization safety: material concern, yes

| Concern                | Requirement                                                                                                                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Who creates continuity | Only the owner commands. ADR-0147's Old web addresses lane (staff with its capability), Phase 24 alias admission (a person), Phase 22 D8 (if admitted). Phase 30 writes only the staged list. |
| Uniqueness             | One outcome per normalized (tenant, environment, Site, host, locale, path), enforced by the owners' scoped uniqueness (ADR-0147)                                                              |
| Targets                | Same-tenant, eligible targets only. Resolved per request, so later retirement or restriction applies immediately.                                                                             |
| Logging                | Unmatched-path counts store path only, with no IP, query string or user identifiers. Sentry and request logs scrub query strings (D66).                                                       |
| Actor                  | Admission and mapping actors come from server context and are audited                                                                                                                         |

### 1.8 Overengineering: material concern, yes (resolved)

**Refused:**

- a Phase 30 redirect engine;
- wildcard or regex rules;
- query rules;
- "Giving has moved" or per-kind outcome pages;
- 410 responses;
- timers;
- dynamic-QR hosting;
- number porting;
- a crawler service run by Asym (the ministry supplies the sitemap or export; a simple fetch of the sitemap is enough);
- automatic language redirects.

**Kept:**

- one staged inventory;
- owner commands;
- one Site not-found page;
- one readiness checklist;
- one unmatched-path count.

### 1.9 UX/UI and user friction: material concern, yes

**Old links screen** (in the Switch). Each row shows:

- the old address and its host;
- its source (sitemap, giving list, QR, text-to-give, added);
- a suggested kind (page, giving, missionary, other);
- its outcome.

**Actions:**

- **Pages:** "Point to page…". This opens ADR-0147's picker.
- **Giving:** "Keep this giving link" picks the matching designation's giving page and admits it as an alias.
- **Everything else:** "Let it show not found".

**Ordering.** Links are sorted by known importance: printed QR targets, text-to-give and top giving links first.

**Progress.** "Giving links kept: 41 of 52".

**Domain move.** A checklist with plain explanations, such as "Your email will keep working: MX records carried over ✓". There is a staged plan (account → giving → main website) with a date picker for each stage.

**Site not-found page.** It is the ministry's own design and can include "Looking to give? Search our missionaries and projects".

**After the move.** For 90 days a weekly "Old links people still use" list (path and count) offers one-click "Point to page" or "Keep giving link".

**Language.** Use "old link" and "keep working"; never "redirect", "301" or "alias" in ministry UI.

**Accessibility.** Tables are keyboard-operable. Results are text, not colour.

### 1.10 Source of truth, ownership and domain invariants: material concern, yes

| Fact                                                    | Owner                                |
| ------------------------------------------------------- | ------------------------------------ |
| Page continuity                                         | ADR-0147 (Phase 23)                  |
| Giving addresses and aliases                            | Phase 24                             |
| D8 routes                                               | Phase 22                             |
| Domains                                                 | Phase 24                             |
| The Old link list and the Domain readiness check record | Phase 30 (staging and evidence only) |
| The text-to-give reply                                  | The ministry's provider account      |

**Invariants:**

- **U1:** Every listed old link has exactly one outcome: a mapped page, an admitted giving alias, a D8 mapping, or not found.
- **U2:** Giving intent never moves. An alias serves only the same designation's giving page.
- **U3:** Every not-found outcome is one identical response per Site.
- **U4:** No continuity expires by age.
- **U5:** Phase 30 never activates a route.
- **U6:** The request never chooses the destination.
- **U7:** At most one hop.
- **U8:** The main domain doesn't move while a tail surface depends on it.

### 1.11 Hidden coupling: material concern, yes

- **Q1 clause 4:** "exact redirects" becomes "exact continuity: page mappings and admitted giving aliases" (D62).
- **Q1 clause 7:** gains a state, "Pointed to Asym" (D67).
- **Q8:** the Continue link host moves first.
- **Q13:** retired designations have no page, so their links get not found.
- **Q14:** photos and profile content stay private until consent.
- **Phase 10:** adverse suppression must apply to aliases.

### 1.12 Failure modes: material concern, yes

| Failure                                       | Required behaviour                                                                                          |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| The continuity lookup is unavailable          | No guessed permanent outcome (ADR-0147). Serve the Site's not-found page with retry-safe caching.           |
| The certificate isn't issued by the move time | The move is blocked by the readiness check                                                                  |
| DNS propagation is mixed                      | TTL is lowered ahead. Both old and new hosts serve consistent outcomes during the window.                   |
| Email breaks after the move                   | The checklist prevents it. Restore the records from the pre-move snapshot recorded in the readiness record. |
| A loop or a second hop                        | Prevented by single-hop resolution to stable page references. Monitored (M-Q17-6).                          |

### 1.13 Lifecycle, temporal correctness, concurrency and idempotency: material concern, yes

**Inventory row states:** listed → outcome proposed → admitted or mapped by the owner (or not found) → live after the move → reviewed.

**Domain move stages:** planned → checks passed → moved → re-checked at +30 days.

**Idempotency:**

- Owner uniqueness per normalized source.
- Re-admitting the same alias is a no-op.

**Concurrency:** owner CAS activation (ADR-0147).

**Time:** the domain move happens at a chosen date. The check is re-run within 24 hours before the move.

### 1.14 Data integrity risks: material concern, yes

| Risk                           | Prevention                                            |
| ------------------------------ | ----------------------------------------------------- |
| Wrong target for a giving link | Same designation only, and the person sees the target |
| Duplicate mappings             | Owner uniqueness                                      |
| Chains                         | Stable references, single hop                         |
| Stale cached redirects         | Giving is never redirected; config redirects removed  |
| Lost email                     | Checklist                                             |

### 1.15 Security and privacy risks: material concern, yes

- **Restricted workers.** No real-name → alias mapping. Identical not-found responses (Phase 10, D8/D9).
- **Open redirects.** Prevented (U6).
- **Subdomain takeover.** Leftover records are flagged and removed, then re-checked.
- **Host spoofing.** Fixed (D66).
- **Logs.** No query strings or IPs in unmatched-path counts. Sentry scrubs query strings, which may carry email or amount parameters.
- **Registrar.** The ministry confirms control and the registrar lock.

### 1.16 Scalability and performance: material concern, no (requirement)

Checked:

- Lookups are per request, by indexed key (tenant, host, normalized path), with short-lived per-host caching of known keys (r4).
- Inventories of tens of thousands of rows are fine.
- Config-file caps (1,024) are avoided by design.

### 1.17 Operational burden: material concern, yes (contained)

- **The ministry's burden:** mapping the important links and running one checklist. The weekly list for 90 days covers anything missed.
- **No developer involvement.**
- **No manual DNS work by Asym.** The ministry edits its own DNS with Asym's checklist and live verification.

### 1.18 Observability and auditability gaps: material concern, yes

**Evidence:**

- the inventory, with outcomes and actors;
- the Domain readiness check record (each item, value and time);
- the move date per stage;
- unmatched-path counts.

**Monitoring:**

- 5xx responses and loops on continuity paths;
- the dangling-record re-check;
- certificate expiry (owner).

### 1.19 Dependency and integration risks: material concern, yes

- **The old vendor's host and services.** SiteStacker hosts and third-party QR or short-link services can't be controlled. They are flagged.
- **Text-to-give provider.** Owned by the ministry.
- **DNS registrar.** Owned by the ministry.
- **Hosting.** Vercel bulk redirects and config are not used as authority.
- **Payload's redirects plugin** may be used only behind a qualified adapter (ADR-0147).

### 1.20 Migration, rollout and upgrade risks: material concern, yes

**Order:**

1. Remove or fix the host-blind redirects and host resolution (D65, D66).
2. Owner capabilities exist: ADR-0147 lane, Phase 24 alias admission, Site not-found page.
3. Inventory and outcomes prepared before the move.
4. Staged domain move.
5. A 90-day review.

**Rollback.** DNS can point back during the TTL window (the old platform must still be serving). There are no permanent client-cached redirects for giving.

**Kill switch.** A continuity record can be removed by its owner; the link then returns not found.

### 1.21 Testability, traceability and proof: material concern, yes

**Tests:**

- An admitted giving alias serves the same page with no redirect.
- A retired or restricted link returns the identical not-found response as an unknown path.
- Case and trailing-slash variants match.
- A query never changes the target.
- A spoofed host can't select another tenant.
- Config redirects no longer capture `/give` on ministry hosts.
- The readiness check blocks a move when the certificate, email records or tail dependency fail.
- Unmatched-path logs hold no query or IP.
- Continuity is a single hop.

**Traceability.** New terms: Old link list, Domain readiness check, Staged domain move.

### 1.22 Other development hazards: material concern, yes

- **Owner amendments needed:**
  - Phase 24 batch alias admission (O80);
  - Phase 22 legacy sources (O81);
  - an unprefixed ADR-0147 source (O83).
- **Until O80 lands**, giving aliases are admitted one at a time. The inventory's ordering keeps that workable.
- **Expectation.** The Switch summary must say plainly which old links will keep working and which won't.

---

## 2. Disposition

**Accept with required amendments.** B's intent stands. The amendments:

- give giving links a served-in-place alias outcome;
- use a single not-found outcome;
- remove timers;
- add the staged domain move with a Domain readiness check;
- fix current-code defects first;
- resolve continuity before rendering;
- add the 90-day unmatched-path review.

## 3. Corrected decision (to record)

**Q17 — Website content and old links in a Switch. Option B, amended.** (★ = changed from what was asked.)

1. **Content on its own track.** Website content moves only through ADR-0173: private drafts, reviewed, published by people. It happens before or after the Switch, never gates go-live, and Phase 30 never publishes or activates anything.
2. **Old link list.**
   - **Sources:** the readiness census builds it from the old sitemap or site export, the ministry's known giving links, QR targets and text-to-give replies, plus any links the ministry adds.
   - **Content:** each row records the old host and path.
   - **Order:** rows are sorted by known importance, printed QR targets and giving links first.
   - **Storage:** Phase 30 stages the list and hands each row to its owner. ★ It never holds or activates routes itself.
3. ★ **One outcome per old link, from its owner:**
   - **Ordinary page:** points to its Asym page through ADR-0147's exact old-address mapping. The locale comes from source evidence, never guessed.
   - **Giving link:** a person keeps it by admitting it as an equivalent address of the same designation's Asym giving page (Phase 24). It is served in place, never redirected, and donor intent never moves.
   - **Missionary or project page:** a Phase 22 mapping, if Phase 22 admits legacy sources (O81).
   - **Everything else:** the Site's single not-found page. This includes:
     - retired and restricted missionaries;
     - unmatched or query-driven giving links;
     - anything left unmapped.

     The response is identical for all of them, so nothing reveals who is restricted, and it can offer the ministry's giving search. A restricted worker's real-name link is never tied to their alias page.
4. ★ **No timers.** Page continuity and kept giving links don't expire.
5. ★ **Staged domain move.**
   - **Ownership:** the ministry keeps its domain and moves it in stages through Phase 24's custom-domain flow, choosing apex or `www` itself.
   - **Order:** account hostname first, for Q8's Continue link; then the giving hostname; then the main website.
   - **The main website moves** only after a ★ Domain readiness check, re-run within 24 hours before the move, confirms:
     - the old system's still-running donor pages (card update, cancel, declined-payment links) don't depend on the hostname being moved;
     - the ministry controls the registrar account and registration, expiry is more than 12 months away, and the registrar lock is on;
     - Asym's certificate is issued before DNS changes (CAA allows it, no stray AAAA records, HTTPS-only settings respected);
     - email records (MX, SPF, DKIM, DMARC) are carried over;
     - no leftover records point at retired services;
     - DNS TTL was lowered in advance.

     Leftover records are re-checked 30 days after the move.

   - **New Q1 clause 7 state:** ★ "Pointed to Asym".
6. **Text-to-give and QR codes.**
   - **Text-to-give:** at the boundary, the ministry changes its keyword's reply link to the Asym giving address. Asym doesn't port numbers.
   - **QR codes on the ministry's own domain** work through their link's outcome.
   - **Flagged in the census:** QR codes and links on SiteStacker addresses or third-party QR and short-link services. They stop when those services end.
   - **New QR codes:** only after the Asym giving address is issued.
7. ★ **Fix today's code first.** Before Asym serves any ministry domain:
   - the donor app's host-blind permanent redirects (`/give`, `/donate`, `/missionaries` to `/workers`) are removed or made tenant-aware;
   - the host comes only from the trusted resolver (no `X-Forwarded-Host`);
   - the not-found page is the Site's own, with no hard-coded ministry name;
   - trailing slashes resolve in one hop;
   - logs and error reports drop query strings.

   Continuity is resolved before the page renders, so outcomes are real HTTP responses. It uses the owners' tenant-scoped records, never config files or the host's bulk-redirect store.

8. ★ **Old links people still use.** For 90 days after each domain stage, Asym shows the Switch lead a weekly list of unmatched old paths with counts. It holds the path only, with no query string or IP. The lead can point a path to a page or keep it as a giving link in one step.
9. **Partner sites, emails and printed materials** can't be rewritten. The Switch summary lists which old links will keep working, which will show not found, and which depend on services Asym doesn't control.

**Acceptance criteria**

- **AC1:** Phase 30 creates no route, alias or redirect itself. Every outcome is created by its owner's command and actor.
- **AC2:** A kept giving link serves the same designation's giving page with no redirect. Its target can't be another designation.
- **AC3:** Retired, restricted, unmatched and unknown paths return an identical not-found response per Site.
- **AC4:** No continuity record expires by age.
- **AC5:** Case and trailing-slash variants of a mapped path resolve to the same outcome in at most one hop. Query strings never change the target.
- **AC6:** A request can't choose its destination, and a spoofed host can't select another tenant.
- **AC7:** After the fix, `/give`, `/donate` and `/missionaries` on a ministry host are not captured by app-wide config redirects.
- **AC8:** A main-domain move is blocked when any readiness item fails. That includes a tail surface still depending on the hostname, a missing certificate, missing email records, registrar control or expiry under 12 months, and leftover records.
- **AC9:** The account hostname can move before the website domain, and the Continue link keeps working throughout.
- **AC10:** Unmatched-path counts and logs contain no query strings or IP addresses.
- **AC11:** The weekly unmatched list runs for 90 days per domain stage, and a one-step action creates an owner mapping or alias admission.
- **AC12:** Continuity responses are real HTTP responses, never a client-side redirect behind a 200.
- **AC13:** A missionary who becomes restricted after their link was kept stops resolving immediately.

## 4. Ruthless synthesis

### Before recording

- Amend B as §3.
- Amend Q1 clause 4 ("exact redirects" → exact continuity: page mappings and kept giving links) and clause 7 (add "Pointed to Asym").
- Record D62–D67.

### Spec and design

- the Old link list;
- the outcome rules;
- the Old links screen;
- the Domain readiness check;
- the staged domain move;
- the weekly unmatched list;
- invariants U1–U8;
- AC1–AC13;
- edge cases H1–H28.

### Owner requirements, in order

1. **O85 (donor app and route owners):** fix D65 and D66 before any ministry domain is served.
2. **O82 (Phases 23 and 24):** one tenant-branded Site not-found page, identical for all unmapped paths, with optional giving search.
3. **O80 (Phase 24):** a person may admit legacy giving links from a reviewed Old link list as equivalent addresses of the same designation's giving page, one at a time or in a confirmed batch. This amends D11-R18 for this case. They are served in place and never redirect.
4. **O83 (Phase 23, ADR-0147):** accept unprefixed legacy sources with an explicit locale from source evidence.
5. **O81 (Phase 22):** decide whether legacy missionary and project page links may feed D8. This resolves O10.
6. **O84 (Phase 24):** the Domain readiness check and the staged move from an outside host.
7. **O86 (Phase 24 with Phase 30):** unmatched-path counts (path only) per host for 90 days after each stage.

### Implementation safeguards

- continuity resolved before rendering;
- owner-scoped uniqueness;
- single-hop references;
- no query in identity;
- query scrubbing in logs;
- the trusted host resolver;
- certificate issuance before the DNS change.

### Monitors

| ID      | Signal                                                                                  | Threshold          | Owner                         | Response                                                                |
| ------- | --------------------------------------------------------------------------------------- | ------------------ | ----------------------------- | ----------------------------------------------------------------------- |
| M-Q17-1 | Unmatched old path with repeat hits in the 90 days after a domain stage                 | ≥ 10 hits per week | Phase 30 with the Switch lead | Show it in the weekly list; the ministry decides                        |
| M-Q17-2 | Share of listed giving links that are query-driven (unmappable) at the readiness census | > 20%              | Phase 30                      | Founder revisits whether Phase 24 should admit a single exact query key |
| M-Q17-3 | Domain readiness items failing at the planned move                                      | Any                | Phase 24                      | Block the move; the ministry fixes the item                             |
| M-Q17-4 | Leftover DNS records pointing at retired services, 30 days after the move               | 0                  | Phase 24                      | Alert the ministry; remove them                                         |
| M-Q17-5 | Listed giving links kept at go-live                                                     | < 50%              | Phase 30                      | Review admission UX and the O80 batch path                              |
| M-Q17-6 | 5xx responses or loops on continuity paths                                              | 0                  | Route owners                  | Incident; fix                                                           |

## 5. Owner requirements and discrepancies

**Owner requirements (proposed O80–O86):** listed in §4.

**Discrepancies (proposed D62–D67):**

- **D62.** Q1 clause 4's "exact redirects then open" conflicts with Phase 24's "Never redirect Giving intent" (`phase-24-…-decision-log.md:1116-1118`, `:1193-1195`, `:1844-1845`; ADR-0193). Resolved: giving continuity is a kept equivalent address served in place.
- **D63.** Phase 13's giving URL shape `/missionary/the-smiths?sc=` (`phase-13:1616`) differs from Phase 24's `/give/{slug}`.
- **D64.** ADR-0147's prefix-fixed old-address lane predates Phase 24 D15's `/lang/{locale}/` prefix. Whether unprefixed legacy sources are accepted is unresolved (O83).
- **D65 (current code).** Host-blind permanent redirects: `/give`, `/donate` and `/missionaries` to `/workers` (`apps/donor/next.config.ts:193-215`).
- **D66 (current code).**
  - Tenant host resolution reads `X-Forwarded-Host` (`apps/donor/lib/cms/client.ts:37-38`), contrary to ADR-0193.
  - The not-found page hard-codes a ministry name.
  - Error reporting keeps query strings.
  - Signed-out `/checkout` visitors are bounced to the homepage.
- **D67.** Q1 clause 7 has no "Pointed to Asym" state. Resolved by amending Q1.

## 6. Rejected alternatives

| Alternative                                                              | Why rejected                                                                     |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| A. Data only                                                             | Every printed giving link breaks when the domain moves                           |
| C. Full website move inside the Switch                                   | Ties each Switch to a website rebuild                                            |
| Redirecting giving links                                                 | Forbidden by Phase 24; moves donor intent                                        |
| A "Giving has moved" page or per-kind outcomes (retired, gone)           | New route outcomes owners rejected; distinct responses reveal restricted workers |
| A Phase 30 redirect table, config redirects or the host's bulk redirects | Duplicates owner authority; caps; can't see live restriction                     |
| 24-month timers                                                          | Needless expiry machinery; owners don't expire continuity                        |
| Wildcard, regex or query rules                                           | Rejected by ADR-0147; brittle and open-redirect-prone                            |
| Moving the whole domain at the boundary                                  | Breaks tail donor pages                                                          |
| Asym crawling or porting numbers or hosting QR codes                     | Unneeded services; the ministry controls its sitemap, numbers and DNS            |
