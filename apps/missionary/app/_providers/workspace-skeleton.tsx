import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

import type { ReactNode } from "react";

/**
 * The static shell every route shares while the role gate and the document
 * scope stream in (see `MissionaryWorkspace` in `app/layout.tsx`): the
 * workspace chrome around `children`, a route's own skeleton
 * (`RouteSkeleton`), or a generic one. It holds no tenant, so it is the same
 * for every organization.
 */
export function WorkspaceSkeleton({
  route,
  children,
}: {
  /** The route whose own skeleton `children` is. */
  route?: string;
  children?: ReactNode;
} = {}) {
  return (
    <div className="flex min-h-svh w-full" data-route-skeleton={route}>
      <span role="status" className="sr-only">
        Loading…
      </span>
      <div
        aria-hidden="true"
        className="hidden w-64 shrink-0 space-y-6 border-r bg-sidebar p-4 md:block"
      >
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} className="h-8 w-full" />
        ))}
      </div>
      <div aria-hidden="true" className="min-w-0 flex-1">
        <div className="flex h-12 items-center gap-3 border-b px-4">
          <Skeleton className="size-6" />
          <Skeleton className="h-4 w-32" />
        </div>
        {children ? (
          <div className="container-responsive py-responsive-section">
            {children}
          </div>
        ) : (
          <div className="container-responsive flex flex-col gap-6 py-responsive-section">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48 max-w-full" />
              <Skeleton className="h-4 w-96 max-w-full" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
