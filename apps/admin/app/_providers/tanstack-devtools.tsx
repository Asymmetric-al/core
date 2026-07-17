"use client";

import dynamic from "next/dynamic";

// Devtools packages are loaded only via this dynamic import, so they land in a
// separate async chunk instead of the admin app's main client bundle. The
// chunk is fetched only when <DevtoolsShell /> actually renders, which the
// production early-return below prevents. (`ssr: false` because the devtools
// are client-only.)
const DevtoolsShell = dynamic(
  () =>
    Promise.all([
      import("@tanstack/react-devtools"),
      import("@tanstack/react-table-devtools"),
    ]).then(([{ TanStackDevtools }, { tableDevtoolsPlugin }]) => ({
      default: function DevtoolsShellInner() {
        return <TanStackDevtools plugins={[tableDevtoolsPlugin()]} />;
      },
    })),
  { ssr: false },
);

/**
 * Dev-only TanStack Devtools shell with the Table plugin.
 *
 * Tables opt in by passing a `devtoolsKey` to the shared data-table
 * components. Mirrors the `ReactQueryDevtools` gating in
 * `packages/database/providers/query-provider.tsx`.
 *
 * The devtools packages are imported lazily (see DevtoolsShell) so they stay
 * out of the production main bundle; the `NODE_ENV` early return additionally
 * guarantees they never mount in production.
 */
export function AdminTanStackDevtools() {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return <DevtoolsShell />;
}
