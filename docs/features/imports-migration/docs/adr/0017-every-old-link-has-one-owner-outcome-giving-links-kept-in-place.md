# ADR-IM-017: Every old link has one owner outcome; giving links are kept in place, never redirected

**Status:** Accepted 2026-11-03. Ratified by the founder in the Phase 30 grill (Q17), after a full ruthless review.

- **Record:** `docs/features/imports-migration/grill/decision-log.md` §1 Q17.
- **Evidence:** `grill/q17-content-urls/` (research r1–r4 and `q17-adversarial-review.md`, which holds edge cases H1–H28, invariants U1–U8 and AC1–AC13).
- **Amends:** ADR-IM-001: clause 4's "exact redirects" becomes exact continuity, and clause 7 gains the "Pointed to Asym" state.
- **Preserves:** ADR-0173 (CMS imports are private drafts) and ADR-0147 (exact-path page continuity that never expires).

## Context

A ministry's giving links live on printed envelopes, QR codes, years of newsletters, partner churches' sites and text-to-give replies. None of them can be rewritten.

**Owner rules already ratified:**

- **Phase 24: never redirect giving.** Phase 24 says "Never redirect Giving intent" and "Cannot redirect — Giving links must not move donor intent" (`phase-24-multi-site-management-decision-log.md:1116-1118`, `:1193-1195`, `:1844-1845`).
  - An address may have an explicitly admitted equivalent alias (`:1323-1326`).
  - Bulk or import-driven issuance is barred (D11-R18).
  - No QR code exists before issuance.
  - D8/D9 give every unknown path one non-enumerating not-found response.
  - D15 puts Asym pages under `/lang/{locale}/`.
- **ADR-0147** allows exact-path continuity for ordinary pages only: no wildcards, queries, external targets or giving routes. Continuity never expires.

**Current code:**

- **Host-blind redirects.** The donor app permanently redirects `/give`, `/donate` and `/missionaries` to `/workers` on every host (`apps/donor/next.config.ts:193-215`).
- **Spoofable host.** It reads `X-Forwarded-Host` (`apps/donor/lib/cms/client.ts:37-38`), which ADR-0193 forbids.

**Domain risk.** The old system's still-running donor pages (card update, cancel, declined payment) likely run on the ministry's own domain.

**Practice:**

- **Google:** map each old page to its own new page, never send old links en masse to the home page, and keep continuity long-term.
- **Domain moves:** lower DNS caching time first, issue the certificate before the DNS change, carry over email records, and remove leftover records (subdomain takeover).

## Decision

1. **Content on its own track.** Website content moves only through ADR-0173 private drafts, published by people, before or after the Switch. It never gates go-live. Phase 30 never publishes or activates anything.
2. **Old link list.**
   - **Sources:** built at the readiness census from the old sitemap or export, giving links, QR targets, text-to-give replies and the ministry's additions.
   - **Order:** printed QR targets and giving links first.
   - **Ownership:** Phase 30 stages the list and hands each row to its owner. It never holds or activates routes.
3. **One outcome per old link, from its owner.**
   - **Ordinary page:** an ADR-0147 exact mapping, with the locale taken from source evidence.
   - **Giving link:** kept by a person as an equivalent address of the same designation's giving page (Phase 24), served in place and never redirected.
   - **Missionary or project page:** a Phase 22 mapping, if Phase 22 admits legacy sources.
   - **Everything else** (retired, restricted, unmatched, query-driven or unmapped): the Site's single not-found page, identical every time, optionally with giving search. A restricted worker's real-name link is never tied to their alias page.
4. **No timers.** Continuity and kept giving links never expire.
5. **Staged domain move.** The order is account hostname, then giving hostname, then main website. The ministry chooses apex or `www`.
   - **Domain readiness check:** the main website moves only after this check passes, re-run within 24 hours before the move. It confirms:
     - tail independence;
     - registrar control, more than 12 months to expiry, and the registrar lock on;
     - the certificate is issued before DNS changes (CAA, AAAA, HTTPS-only);
     - email records are carried over;
     - no leftover records remain;
     - DNS caching time was lowered.
   - **Follow-up:** leftover records are re-checked at +30 days.
   - **New disposition state:** "Pointed to Asym".
6. **Text-to-give and QR codes.**
   - **Text-to-give:** the ministry changes the reply link at the boundary. Numbers are not ported.
   - **QR codes on the ministry's own domain** keep working.
   - **Flagged:** codes on SiteStacker or third-party services.
   - **New QR codes:** only after issuance.
7. **Fix today's code first.** Before Asym serves any ministry domain:
   - host-blind redirects are removed or made tenant-aware;
   - the host comes only from the trusted resolver;
   - the not-found page is the Site's own;
   - trailing slashes resolve in one hop;
   - query strings are dropped from logs;
   - continuity is resolved before rendering from owners' tenant-scoped records, never config files or the host's bulk redirects.
8. **Old links people still use.** For 90 days after each domain stage, a weekly list of unmatched paths with counts (path only, no query string or IP) offers one-step owner actions.
9. **Plain expectations.** The Switch summary says which old links will keep working, which will show not found, and which depend on services Asym doesn't control.

## Considered options

| Option                                                                               | Why rejected                                                                       |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| A. Data only                                                                         | Every printed giving link breaks when the domain moves.                            |
| C. Full website move inside the Switch                                               | Ties each Switch to a website rebuild.                                             |
| Redirecting giving links                                                             | Forbidden by Phase 24; moves donor intent.                                         |
| "Giving has moved" page, or separate outcomes for retired, restricted and gone links | New route types the owners rejected; distinct responses reveal restricted workers. |
| A Phase 30 redirect table, config redirects or the host's bulk redirects             | Duplicates owner authority; hits caps; can't see live restriction.                 |
| 24-month timers                                                                      | Owners never expire continuity.                                                    |
| Wildcard, regex or query rules                                                       | Rejected by ADR-0147; brittle and open-redirect-prone.                             |
| Moving the whole domain at the boundary                                              | Breaks the old system's tail donor pages.                                          |
| Asym crawling, number porting or QR hosting                                          | The ministry controls its sitemap, numbers and DNS.                                |

## Consequences

**Owner requirements (in order of work):**

1. **O85:** donor app and route owners fix the current code.
2. **O82:** Phases 23 and 24 provide the single Site not-found page.
3. **O80:** Phase 24 allows person-admitted kept giving links, one at a time or in a confirmed batch (amends D11-R18 for this case).
4. **O83:** Phase 23 accepts unprefixed legacy sources.
5. **O81:** Phase 22 decides on legacy missionary and project links (resolves O10).
6. **O84:** Phase 24 provides the Domain readiness check and the staged move.
7. **O86:** unmatched-path counts.

**Until O80 lands,** kept giving links are admitted one at a time, most important first.

**Discrepancies:** D62–D67.

**Monitors** M-Q17-1 to M-Q17-6:

- repeat unmatched paths;
- query-driven giving links above 20% at the census, which sends the question back to the founder;
- readiness failures, which block the move;
- leftover records at +30 days;
- giving links kept below 50% at go-live;
- 5xx errors or loops on continuity paths.
