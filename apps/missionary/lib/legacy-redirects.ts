/**
 * The missionary workspace's retired addresses (council round 1, A11). Saved
 * links to the old update pages answer a real 308 to the feed, from
 * `next.config.ts`, before the proxy runs: with the tenant in the address,
 * which they keep, or without it, where the proxy then lands the feed on the
 * person's tenant. As pages under the tenant address they had become
 * redirects streamed with status 200.
 */

/** A tenant address prefix: the tenant's id, and a staff sub-role if any. */
const TENANT_PREFIX =
  "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}(?:~[a-z_]+)?";

const RETIRED: ReadonlyArray<readonly [from: string, to: string]> = [
  // Updates live at /feed.
  ["/ministry-updates", "/feed"],
  // Email Studio was retired; updates are written on the Updates page.
  ["/email-studio", "/feed"],
];

export interface LegacyRedirect {
  source: string;
  destination: string;
  permanent: true;
}

export const legacyRedirects: LegacyRedirect[] = RETIRED.flatMap(
  ([from, to]) => [
    { source: from, destination: to, permanent: true as const },
    {
      source: `/:prefix(${TENANT_PREFIX})${from}`,
      destination: `/:prefix${to}`,
      permanent: true as const,
    },
  ],
);
