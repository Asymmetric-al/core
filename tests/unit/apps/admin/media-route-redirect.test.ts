import { expect, it } from "vitest";

import { nextConfig } from "../../../../apps/admin/next.config";

/**
 * Payload's media route moved from `/api/media/file/` to
 * `/web-studio/api/media/file/` (AL-2675). Links that still hold the old
 * address (pasted into text, or in a donor response cached before the
 * release) would break the moment the admin app is promoted, so for this
 * release the admin app sends the old address to the new one; the release
 * that drops the old prefix removes it (council round 2, CR3). Next.js
 * applies these redirects before the proxy, so a signed-out request, as
 * the donor's image optimizer makes, is redirected too.
 */
it("sends the old media route to the new one, temporarily, for this release", async () => {
  const redirects = await nextConfig.redirects!();
  expect(redirects).toContainEqual({
    source: "/api/media/file/:path*",
    destination: "/web-studio/api/media/file/:path*",
    permanent: false,
  });
});
