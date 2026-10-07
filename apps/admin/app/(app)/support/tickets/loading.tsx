import { TablePageFallback } from "@/components/table-page-fallback";
import { SUPPORT_TICKETS_PAGE_META } from "@/components/table-page-meta";

export default function Loading() {
  return (
    <TablePageFallback
      title={SUPPORT_TICKETS_PAGE_META.title}
      description={SUPPORT_TICKETS_PAGE_META.description}
      density={SUPPORT_TICKETS_PAGE_META.density}
      columnCount={4}
    />
  );
}
