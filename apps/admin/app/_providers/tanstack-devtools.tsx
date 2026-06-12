"use client";

import { TanStackDevtools } from "@tanstack/react-devtools";
import { tableDevtoolsPlugin } from "@tanstack/react-table-devtools";

/**
 * Dev-only TanStack Devtools shell with the Table plugin.
 *
 * Tables opt in by passing a `devtoolsKey` to the shared data-table
 * components. Mirrors the `ReactQueryDevtools` gating in
 * `packages/database/providers/query-provider.tsx`.
 *
 * The `NODE_ENV` early return below is what keeps the shell out of
 * production: `TanStackDevtools` from `@tanstack/react-devtools` has no
 * environment gating of its own. The Table plugin's default entry does
 * additionally export no-ops whenever `NODE_ENV !== "development"`.
 */
export function AdminTanStackDevtools() {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return <TanStackDevtools plugins={[tableDevtoolsPlugin()]} />;
}
