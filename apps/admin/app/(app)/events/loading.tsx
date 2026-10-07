import { TablePageFallback } from "@/components/table-page-fallback";
import { EVENTS_PAGE_META } from "@/components/table-page-meta";

export default function Loading() {
  return (
    <TablePageFallback
      title={EVENTS_PAGE_META.title}
      description={EVENTS_PAGE_META.description}
      density={EVENTS_PAGE_META.density}
      columnCount={5}
    />
  );
}
