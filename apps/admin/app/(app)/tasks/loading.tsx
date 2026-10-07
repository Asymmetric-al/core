import { TablePageFallback } from "@/components/table-page-fallback";
import { TASKS_PAGE_META } from "@/components/table-page-meta";

export default function Loading() {
  return (
    <TablePageFallback
      title={TASKS_PAGE_META.title}
      description={TASKS_PAGE_META.description}
      density={TASKS_PAGE_META.density}
      columnCount={6}
    />
  );
}
