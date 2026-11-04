# Q17-R3 — Repo verification of Option B (F15)

Develop `629cb71dc`, 2026-11-03. This extends r1 and does not repeat it. **Inferred** means derived from the sources, not stated in them. **Unverified** means no evidence was found. DL = decision log.

## 1. ADR-0147 (beyond r1)

- **Who binds.** Only "specifically authorized staff" (P23 DL `:502`). Phase 30 owns transport, parsing, staging and resumability. It is not the owner of "target validation … or activation" (`:557`). Staged mappings "pass through the same D1–D2 validation and release contract" (D3 research `:253-254`). The UX "fixes the Site/locale prefix, accepts one path" (`:579-581`). **There is no batch review for staged imports.**
- **Normalisation.** D3 sets no case or trailing-slash rule. It requires one canonicalizer proved across "Unicode, case, separators … encoding, query" (`:665-668`). The D15 canonicalizer owns "case policy, slash/trailing-slash behavior" (ADR-0198 `:115-117`). P22 rejects ambiguous "case or trailing-slash collisions" rather than folding them (P22 DL `:1340-1342`).
- **Limits.** No numeric cap; "one indexed exact lookup, never a per-request full-list scan" (`:615-617`).
- **Ineligible sources.** "Reserved auth, checkout, API, preview, media, asset, application, and source-owned routes" (`:607-609`); `/give/*`, closed to "redirects" (P24 DL `:1550-1553`); `/lang/`, which "redirects, imports … cannot claim" (`:2677-2679`).
- **Status and queries.** Status is "code-owned" (`:543-545`), for `GET`/`HEAD` only. Queries are "preserved unchanged … excluded from broad route telemetry" (`:538-542`).
- **Target changes later.** A repair follows a target that moves. If the target "retires, becomes unpublished, or becomes unsafe, the repair becomes privacy-safe absence rather than following an inferred successor" (`:529-534`). Phase 10 "can suppress a positive result immediately" (ADR `:44-45`). Paths and continuity activate in one D1 CAS (ADR `:43-44`). Nothing expires "merely by age" (`:27-28`).
- **Scope.** Each mapping is scoped to Tenant × environment × Site × locale (ADR `:21`). The host plays no part within a Site. Giving addresses are keyed by "canonical public origin together with the normalized path" (P24 DL `:1323-1328`).
- **Non-decisions.** No "domain-migration redirect … transition Page" (`:655-657`); not the "domain-move owner" (`:551`).
- **Two rules for one act.** D78/D79 send an old address to a different Page only with a "Page Purpose Continuity Version" (ADR-0200 `:54-59`); ADR-0147 repairs have none.

## 2. Phase 22 D8

- **Moves.** A move goes only to "the same immutable Page's already released … canonical Route Generation" (P22 DL `:1263-1264`), as a direct `308` (`:1319`).
- **Removal.** "The same tenant-branded real `404` … used for an unknown page". No `410` (`:1323-1326`).
- **Successors.** Never an automatic redirect (`:1266-1270`). Redirects to "another worker, project, campaign, organization fund, homepage" are rejected (`:1488-1489`).
- **What a removed page may show.** It "may retain … a separately labelled contact or fresh general-giving link when independently configured" (`:1423-1425`). That is the owner-compatible form of B's "neutral page offering other giving".
- **Queries.** Dropped except "allowlisted, revalidated, non-routing attribution" (`:1392-1395`).
- **Correction to r1 discrepancy 5.** D8's migration census ("mock IDs, name-derived routes, mutable CMS slugs, existing redirects", `:1447-1451`) covers Core's own pre-production routes (P22 research `:9367`). In P22, "legacy" means current Payload or mock pages (`:441-444`, `:3970-3979`). **No SiteStacker seam exists; O10 stays fully open.** Seeding SiteStacker paths as earlier Route Generations would break "no history is fabricated" (`:1451`) (**inferred**).
- **Path shape.** Not found (**unverified**).

## 3. Phase 24: giving addresses and domains

- **Shape.** `{verified-site-public-base}/give/{slug}` (DL `:1541-1545`). D15 puts `/lang/{locale}` in every base: "no favorable new default/primary/only-locale content route is unprefixed" (`:2672-2676`). So **no unprefixed SiteStacker path ever equals an Asym path**, and every kept link needs a mapping.
- **Locale.** D15-R19 forbids taking the locale "from path absence" (d15 review `:498-501`). It must come from source evidence, such as SiteStacker channel languages (r07 `:296`). Whether D3's prefix-fixed lane accepts an unprefixed source is **unresolved** (D3 predates D15).
- **Giving never redirects.**
  - D9: "Never redirect Giving intent" (`:1116-1118`).
  - D9: "Cannot redirect — Giving links must not move donor intent" (`:1193-1195`).
  - D12: an older address "does not redirect, rewrite, traverse B" (`:1844-1845`).
  - D15-R19: "Giving intent never redirects" (d15 `:503`).
  - ADR-0193: a domain role "never redirects, reissues, reinterprets, or transfers Giving" (`:114-117`).

  Continuity means the address serves the page directly (D12), or an "explicitly admitted equivalent alias" does (`:1323-1326`).

- **Issuance.** Only a human publish action issues an address; "bulk, import-driven … issuance remain unavailable" (D11-R18, r10-g8). No QR before issuance (`:1572-1574`). "Logs, crawler traffic, analytics … do not create authority" (D10-R3 `:125-126`). D10-R20 excludes a "public choice page", "time-limited release" and "mutable QR destination" (d10 `:543-548`).
- **Domains.**
  - **Verification.** A Core TXT record valid for 7 days; no A/CNAME change needed (ADR-0196 `:23-49`).
  - **Activation.** Needs "ownership/DNS/TLS/provider/Site/route/public-generation proof" (DL `:16924-16925`). Whether TLS can be issued before DNS points at Vercel is **unverified**.
  - **Hostnames.** Apex, `www` or another exact hostname; Core "never chooses one automatically" (ADR-0193 `:54-56`). No platform fallback (`:52-53`).
  - **Redirect domains.** One hop, owner-qualified (`:90-105`). Vercel's whole-domain redirect is prohibited (`:119`).
  - **QR and share links.** "QR/share outputs" use the Primary (`:134-136`).
  - **Detaching.** Blocked while a "direct Giving … route requiring the host" exists (ADR-0195 `:29-31`). No cascade to apex or `www` (`:46-48`).
  - **Gap.** D76/D77 cover only moves inside Core. Nothing covers moving a domain from an outside host into Core.
- **Host resolution.** ADR-0193 bars `X-Forwarded-Host` (`:72-76`); the code reads it (`apps/donor/lib/cms/client.ts:37-38`).
- **P13 vs P24.** P13's `/s/<token>` 302 is "dynamic (a changed slug is fixed without reprinting)" (`:1617`). P24 D10 says a "changed destination … requires a new token and QR" (DL `:1355-1358`). P24 is later and stricter (**inferred**).

## 4. Q1 clause 7: where SiteStacker's tail runs

- **No state for "pointed to Asym".** The four states are Off, Kept on, Not used and Outside control (`decision-log.md:49`). Links, QR codes and text-to-give targets are Off. Kept on are the recurring engine, receipts, reminders, the declined-payment message and update link, and the cancel/update path.
- **Host (inferred: the ministry's own domain).**
  - SiteStacker attaches Domains per Site Channel, alongside "Contributions" (q01-r1 V10 `:47`).
  - The donor dashboard is a Site Planner module (H2 `:300`), with login at `/user/initiate-password` (V22 `:59`).
  - The declined-payment message carries `{$recurring.updatePaymentURL}` (V8 `:45`).
  - Apple Pay verification is tied to the host (q01-r2 `:229`).

  Whether SiteStacker can fall back to a hostname of its own is **unverified**.

- **Consequence.** Moving the channel domain before tail closure breaks Kept-on surfaces; sent links then reach Asym.

## 5. Q8 Continue link

- **No host named.** Q8 clause 3 names no host (`decision-log.md:341-342`). The q08 reviews say only "tenant- and host-bound" (v1 `:240`).
- **D57 decides it.** "Payment-method control, and recurring-gift control uses" the **Tenant Donor Portal Host**, "a verified Tenant-controlled dedicated HTTPS hostname, such as `account.hope.org`" (P24 DL `:11486-11495`). The link is frozen to that host "at issuance" (`:11529-11531`), with no fallback (`:11537-11542`).
- **Result.** The Continue link depends on the account hostname, which must be live before campaign launch, within 14 days of go-live (`:336`). It does not depend on the website domain.

## 6. Current code (Next 16.4.2)

- **Static redirects.** `apps/donor/next.config.ts:193-215` uses `permanent: true`, a 308 that browsers "cache … forever" (`.next-docs/…/redirects.mdx:30`). It applies to every method and every tenant. It "runs **before** Proxy" (`redirecting.mdx:293`), so no host-aware logic can override it.
- **Proxy.** `proxy.ts` is auth only ("middleware" was renamed, `proxy.mdx:11`). An unauthenticated `/checkout*` request goes to `/` with its query dropped (`proxy.ts:22-29`; `packages/auth/middleware.ts:105-119`). A legacy SiteStacker `/checkout?c=` link would land on the homepage (path shape **inferred**, q01-r2 C9).
- **Trailing slashes.** Next redirects `/about/` to `/about` first (`trailingSlash.mdx:8`), so a mapping becomes a two-hop chain.
- **404 page.** `app/global-not-found.tsx` hard-codes "Give Hope" and "Return home" (`:9-11`, `:27-29`).
- **Logging.** Nothing logs 404s. Sentry samples 10% of production traces and keeps query strings, except a deny-list of header-style names (`packages/lib/monitoring/sentry-policy.ts:7,18`).

## 7. Text-to-give and QR codes

- **Text-to-give.** Phase 43 owns it: "a qualified source-coded checkout link, not another payment channel" (`delivery-contract.md:66`). In v1 the Slick Text reply is ministry-controlled (q01-r1 `:248`).
- **QR codes.** P13 emits "a downloadable dynamic QR" (`:1618`); P24 offers "Download QR code" after issuance (DL `:1404`).
- **Source codes.** P13's allowlist already includes `t` and `c` (`:1606`), which ties into O5.

## 8. 404 monitoring and privacy

- **D3.** "Bounded high-hit retired-path diagnostics"; query strings and "protected path histories are not emitted to broad telemetry" (`:624-627`).
- **D8.** No logging of "restricted paths, names, queries" (`:1440-1441`).
- **P13.** Raw UTM can be Article 9 religious data and belongs in an erasable log (`:1610`).
- **Risk.** Old emails carry pre-login tokens (V56); if they sit in query strings (**inferred**), Sentry captures them after the move.

## Conflicts with Option B as worded

1. **"Giving link → matching Asym giving page."**
   - As a redirect, it contradicts the five Giving texts in §3.
   - The compatible form serves the old path directly as an alias, but D11-R18 bars import or bulk issuance.
2. **"Giving has moved" page.**
   - A distinct page is a new outcome: D3 lists "transition Page" as a non-decision, and D10-R20 excludes a "public choice page".
   - With status 200 it is a soft 404.
   - A distinct body reveals which paths were giving links.
3. **Retired versus restricted.** If retired missionaries get a neutral page and restricted ones a plain 404, comparing the responses reveals who is restricted. D8 (`:1323-1326`) and D9 (`:1140-1143`) require one 404, identical to an unknown page.
4. **"Else gone."** D8 adds no `410`, and D9's default is a non-enumerating `404`.
5. **"Work at least 24 months."** No owner has expiry: ADR-0147 rejects "age cleanup" and D10-R20 rejects "time-limited release". A timer is pure debt.
6. **"Ordinary page → its Asym page."**
   - Every Asym page sits under `/lang/` (D15), so the locale of an unprefixed source needs proof.
   - Sources that hit reserved paths (`/checkout`, `/login`, `/give/*`, `/lang/*`) cannot be bound.
7. **A second redirect system.**
   - Until the domain moves, any forwarding happens in SiteStacker, whose redirects are "paths only" (r2 §2; redirects to outside hosts **unverified**).
   - Q1 clause 4's "exact redirects then open" assumes the domain moves at the boundary.
8. **Host-agnostic misfire.**
   - The Next config redirects and the `/checkout` rule hit every tenant.
   - ADR-0147 ignores the host within a Site, so two channel domains joined to one Site with the same path but different meanings collide.
9. **"Moves the domain when it chooses."** Three hostnames are still needed early:
   - a giving Primary at go-live (no platform fallback);
   - the D57 account hostname for Q8;
   - the old domain itself, which the SiteStacker tail likely relies on.
10. **Text-to-give "switched at the boundary".** The target must be an issued address, and issuance happens only when giving opens.
11. **Unbuilt owners.** ADR-0147, D8, D10/D11, D57 and Site/Domain tables do not exist yet (r1 §8).

## Minimal owner-compatible design

- **One census link list, staged by Phase 30.** Each row has: source host, path (query stripped), evidence source, source locale, proposed class. Restricted missionaries get no named row (Phase 10).
- **No new route system.** Each row goes to its existing owner:
  - ordinary page → ADR-0147 repair, activated by D1;
  - missionary or project page → Phase 22 (O10);
  - giving link → Phase 24 alias;
  - anything else gets no row.
- **One tenant-branded 404 per Site.** A real 404, with an optional Site-wide "Ways to give / find a missionary" search chosen by the ministry. It serves unmatched giving links, retired and restricted missionaries, and "gone" identically. Nothing falls back to the homepage.
- **One query rule.** Every legacy-sourced effect keeps only P13's attribution allowlist.
- **Status codes.**
  - Ordinary repairs use the owner's permanent status.
  - Giving and missionary aliases serve the page directly or use a no-store `307`, because their targets can later be stopped. ADR-0193 already uses `307` with no-store for mutable roots (`:125-129`).
- **No timers.**
- **Hostnames in order.**
  1. Account hostname, before the Q8 campaign.
  2. Giving Primary (for example `give.`), before giving opens.
  3. Main domain, whenever the ministry chooses, once no Kept-on surface links through it; check DNS, TLS and email records, and flag stray SiteStacker CNAMEs.
- **404 hits after the move** feed a worklist, never mappings (D10-R3).
- **Code fixes before any domain moves.** Remove the host-blind redirects and the `/checkout`→`/` rule, replace `global-not-found`, and set the trailing-slash policy.

## Owner requirement candidates (requests)

- **R1 — Phase 23 D3/D15.**
  - Accept unprefixed legacy sources that carry source locale evidence.
  - One batch review for staged mappings.
  - An allowlisted query rule.
  - Quarantine collisions when several legacy hosts join one Site.
- **R2 — Phase 24 Giving.** A reviewed batch "Old giving links" admission. Each old path becomes a permanent, directly served alias of one giving entry, never repointed. Otherwise, ratify "not carried".
- **R3 — Phase 22 (O10).** A typed legacy inbound claim bound to one immutable Page. Never for restricted missionaries; a departure falls to the 404.
- **R4 — Phase 5/23.** One Site-level 404 body with an optional giving search.
- **R5 — Phase 24 Domain.** Rules for moving a domain from an outside host into Core, including TLS before the DNS flip.
- **R6 — Phase 30 (amend Q1 clause 7).** A "Pointed to Asym — ministry attested" state, plus a gate that no Kept-on surface links through the host being moved.
- **R7 — Phase 13/24.** Reconcile P13's dynamic short link with D10, together with O5.
- **R8 — Observability.** Strip query strings from legacy-path traces.
