# 0010. Build links from page paths and load a new document when scope changes

**Status:** Recorded on 2026-11-22 from code comments in `packages/auth`
([#2751](https://github.com/Asymmetric-al/core/issues/2751)). It describes the
code as it is and ratifies no product intent. Accepted platform intent is in
[`docs/adr/`](../../../../docs/adr/README.md).

## Context

The proxy renders a tenant address from a page whose own path has no tenant prefix. A browser document keeps the person, tenant and assignment it was loaded for. A client-side transition changes the address without replacing that document. That is useful between pages of the same organization, but not when the destination needs a different scope.

## Decisions

1. **Let page code use the same path regardless of organization.** In `packages/auth/tenant-navigation.tsx`, `TenantLink`, `useTenantRouter` and `useTenantHref` add the document's prefix to internal tenant page paths. They add none on sign-in, on the chooser or in the donor portal. `useRoutePathname` strips the prefix from the browser's pathname, so active navigation compares page paths. Server redirects use `redirectInTenant` in `packages/auth/tenant-server.ts` for the same reason. Cited: [plan §5.2][plan], [AL-2675][issue].

2. **Tell Web Studio which organization the link came from.** Web Studio uses a cookie, not a tenant path. For a link from a tenant document to a Web Studio page on this site, `useTenantHref` and `prefixLinkHref` in `packages/auth/tenant-navigation.tsx` put the tenant and assignment in the entry query. This lets the proxy ask before switching the cookie's organization. For an object destination, `prefixLinkHref` omits the entry fields if the object names a host, hostname or protocol. Otherwise it updates `search` when it is a string, and `query` when it is not: Next.js gives `search` precedence. Cited: [council on the joined release, JC3][reviews].

3. **Reject `URL` instances rather than guess their origin on the server.** `TenantLinkHref` in `packages/auth/tenant-navigation.tsx` excludes objects with an `href` property, and `prefixLinkHref` throws on a `URL` instance at runtime. Callers should supply a path string or a path descriptor such as `{ pathname, query, hash }`, and use a plain anchor for another site. The type does not ban every descriptor with a host. The reason for rejecting a `URL` is that it could point back to this site without its tenant prefix. Cited: [council round 1, A13][reviews].

4. **Compare the destination with the segment where the document loaded.** `loadedPathname` in `packages/auth/tenant-navigation.tsx` reads the navigation timing entry, which still names the original address after a client-side transition. `loadedSegment` extracts its tenant prefix, including the staff suffix; `loadedAddressSegment` also recognizes Web Studio pages. For destinations, `tenantSegmentOf` treats each tenant prefix and Web Studio's pages as separate segments. Sign-in and the Web Studio chooser are outside both. It gives unprefixed signed-in destinations their own segment. The proxy adds a tenant prefix when one assignment matches the surface's role class, redirects to the organization chooser when several match, and redirects to `/no-access` when none match. `TenantLink` and `useTenantRouter` load a new document and skip prefetch for a recognized crossing; they leave same-segment navigation to the client router. If the load address is unavailable, they cannot identify a crossing from it. Cited: [plan §5.2][plan], [council round 1 ruling and joined release JC1][reviews].

5. **Follow the anchor the browser resolved, and only for an ordinary click.** `TenantLink` in `packages/auth/tenant-navigation.tsx` uses `isPlainClick` to intercept an unmodified left click in the same window, unless it is a download or the caller already prevented it. `anchorAddress` reads the rendered anchor's path, query and fragment and declines other origins. This preserves new tabs and downloads and avoids formatting a destination twice, which lost or changed fragments, string queries and `search`. Cited: [council round 2, AR4; round 3, AR14][reviews].

6. **Catch crossings that bypass a link or router helper.** The admin and missionary root layouts mount `TenantSegmentBoundary` from `packages/auth/tenant-navigation.tsx`. Its `SegmentCrossingWatcher` compares the current segment from `addressSegmentOf` with the known load segment, so a redirect can still trigger a document load. For this comparison an unprefixed path has no tenant prefix; `TenantDocument` handles signed-in pages reached that way. The watcher reads the pathname under its own `Suspense` boundary so the root can keep its prerendered shell. Once the watcher reports a crossing, the boundary replaces its children with `ScopeReloadNotice`, which requests the reload and offers a way out if it stalls. Cited: [council round 1 ruling, joined release JC1 and fix-list check JR10][reviews], [plan §5.2][plan].

7. **Use a path boundary when the address has no tenant prefix.** `PathSegmentBoundary` in `packages/auth/tenant-navigation.tsx` compares the load path and destination against one path and its descendants. At `/donor-dashboard` this makes entry and exit document loads without forcing one between two portal pages or two public pages. It needs neither request data nor a watcher: the portal supplies the same path to `DocumentScopeProvider`, which handles soft crossings that bypass the helpers. Cited: [council round 2 on slice B, BR2 and BR1][reviews].

8. **Do not refresh the page a crossing is leaving.** `loadCrossing` in `packages/auth/tenant-navigation.tsx` sets `crossingLoadBegun` before starting the document load. `useTenantRouter` skips `refresh()` while that mark is set so the old page does not render again. A same-segment `push` or `replace` leaves the mark alone. The mark clears on a zero-delay timer so refresh still works if the browser cancels the load or restores the document. Web Studio's Payload router adapter in `apps/admin/src/cms/payload-next-router-adapter.tsx` takes its `refresh` from `useTenantRouter`. For navigation outside Web Studio's pages, it uses `loadDocument` in `apps/admin/src/cms/web-studio-document-load.ts`, which calls `loadCrossing`. Cited: [council round 2, AR3; round 3, AR14; joined release JC8][reviews].

9. **With the switch on, the segments carry no organization.** The helpers
   read the address with `parseSubRoleAddress` instead of the ID form: a
   document's segment is `/~<sub-role>`, or `""` for every page path outside
   `OUTSIDE_TENANT_SEGMENT_ROOTS` that is not a sub-role address
   (`nameAddressSegmentOf`). A crossing between two of them, or into and out
   of them, is a document load as before. `useCopiedLinkHref` gives the path
   without any prefix for a link a person copies and gives to someone else
   (R6), and the document's prefix off. See
   [0015](0015-organization-from-the-verified-name.md), decision 24.

[plan]: ../../../../docs/audits/core-crm-cms-database-target-architecture.md#52-choosing-the-tenant
[reviews]: ../../../../docs/audits/core-crm-cms-database-implementation-record.md#11-council-reviews
[issue]: https://github.com/Asymmetric-al/core/issues/2675
