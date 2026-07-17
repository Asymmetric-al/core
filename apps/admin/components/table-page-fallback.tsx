import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { DataTableSkeleton } from "@asym/ui/components/shadcn/data-table";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

interface TablePageFallbackProps {
  title: string;
  description?: string;
  /** Match the density of the route's `PageShell` to avoid layout shift. */
  density?: "default" | "compact";
  columnCount?: number;
  rowCount?: number;
}

/**
 * Shared Suspense/loading fallback for admin table routes.
 *
 * Renders the route's real `PageShell` (same header layout, typography, and
 * density as the loaded page) with skeleton action buttons and the shared
 * `DataTableSkeleton` where the table island will stream in. Reusing
 * `PageShell` instead of re-deriving its classes means the loading state and
 * the loaded page cannot drift on spacing or heading layout.
 */
export function TablePageFallback({
  title,
  description,
  density = "default",
  columnCount = 6,
  rowCount = 10,
}: TablePageFallbackProps) {
  return (
    <PageShell
      title={title}
      description={description}
      density={density}
      actions={
        <>
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </>
      }
    >
      <div aria-busy="true" aria-label={`Loading ${title}`} role="status">
        <DataTableSkeleton columnCount={columnCount} rowCount={rowCount} />
      </div>
    </PageShell>
  );
}
