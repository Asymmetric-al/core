# ADR-0229: Publishing copies pages into immutable Core releases through two commands, and the public reads only those

**Status:** Accepted on 2026-11-17 by the owner's instruction to implement the
CRM, CMS and database plan ([AL-2688](https://github.com/Asymmetric-al/core/issues/2688)).
Deferring atomic multi-page launches rests on the plan section 15.1 default
("not needed"), taken under the implementation record (D-05), not on a fresh
owner ruling; if the owner requires them, this decision returns to plan section
11.4.

This records target intent. It does not say that anything is built; see the
[implementation record](../audits/core-crm-cms-database-implementation-record.md).

## Context

Every public content read today is a live call into the admin app, where Payload
runs (ADR-0027). Withdrawal would depend on a cross-deployment expiry signal that
no code implements (ADR-0030; audit NR-39). Payload's status field is not a safe
public signal. Accepted intent (ADR-0145) wants one Publish to activate related
documents together through whole-site generations, which presuppose Sites,
compiled projections and machinery that do not exist yet (NX-01). The plan's
decision 1 (section 11.2) chose per-page release rows.

## Decision

1. **A publish writes immutable release rows in Core.** `published_releases`
   holds one immutable row for each published page or navigation set, with its
   version ID, a content digest, its subject, its reach and a locale.
   `published_heads` holds one head per Site, document and locale, carrying the
   public path, and moves by compare-and-swap on a counter that only increases.
   One publish may move several heads in one transaction.
2. **Two publish commands.** The editor's Web Studio action calls the
   **request-publish command** on the caller's token. It checks the caller's
   membership and publishing capability, that the Site is a Site of that tenant in
   Core and is active, and records a short-lived publish intent naming the actor,
   the assignment and the exact document and version pairs. The admin server then
   reads those versions through Payload's service port, serializes them with the
   allowlist serializer and calls the **fulfil-publish command** as a system entry
   that only the service key can call. In one transaction it checks the intent is
   unexpired, unused and names the same pairs, re-checks that the assignment is
   still live and holds the capability and that the tenant and Site are active,
   checks every operational and media reference against Core's own tables,
   inserts the releases, records their media uses, marks the intent fulfilled and
   moves the heads.
3. **Withdrawal is a Core command** on the caller's token that flips the head and
   writes an audit row. It takes effect at the next request. Restriction and the
   erasure of a worker withdraw the subject's live releases by command
   (ADR-0239). A suspended or closed tenant, an inactive Site and an inactive
   subject flip no head; admission refuses them while the condition lasts.
4. **The public reads only releases, after admission.** One read function, keyed
   by verified host and path and never cached across requests, returns the live
   head, its reach, the Site's live navigation release and whether the tenant, the
   Site and the subject may be served now. It runs in the donor app's proxy before
   any prerendered shell is served; the proxy answers the 404 or the uncached 503
   itself. Only then is the release body read, cached under its release ID with
   function-level `use cache`. A body is never served without a current
   admission, so nothing has to expire and nothing is sent to a cache on publish
   or withdrawal.
5. **Payload's own status never makes anything public.** Its native publish
   control is hidden or mapped to the Web Studio action, and "live" in Web Studio
   is read from the head.
6. **Whole-site generations are deferred, not rejected.** They return when a
   requirement needs atomic multi-page launches, scheduled releases or whole-site
   rollback, and can be added without replacing the tables. Scheduled publishing,
   when built, is an outbox row that calls the same commands.

## Consequences

- The public site never queries Payload and does not depend on the admin app
  being up. ADR-0027's reserved capability is invoked behind the same interface,
  and ADR-0030's publish signal is not built (both amended 2026-11-17).
- A page and a menu published separately can disagree until both are published,
  and two separately cached fragments can disagree briefly. That is the stated
  price of deferring generations, and Seat B's dissent is preserved (plan section
  11.3).
- A changed path leaves no redirect and the old path returns 404; the reach
  default is held per tenant (ADR-0119 amendment of 2026-11-17).
- If the thin proof TP3 shows the proxy cannot carry admission, the public route
  blocks instead and awaits admission before any Suspense boundary.
- Forging or replaying fulfilment, and admission before cached content under
  Cache Components, are proofs in plan section 15.2.

## Source

- [Plan, section 6.6](../audits/core-crm-cms-database-target-architecture.md#66-publishing-preview-versions-and-media)
  and decision 1 in [section 11.3](../audits/core-crm-cms-database-target-architecture.md#113-reasoning-on-the-decisions-that-mattered-most)
- Work packages WP6 and WP7, thin proof TP3
- Related: [ADR-0027](0027-transport-agnostic-public-content-reader.md),
  [ADR-0030](0030-function-level-tagged-caching-publish-signal.md),
  [ADR-0119](0119-tenant-defaulted-phase-10-ceiling-resolved-publication-reach.md),
  [ADR-0145](0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md),
  [ADR-0231](0231-core-media-custody-and-derived-live-use.md)
