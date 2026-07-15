import { TablePageFallback } from "@/components/table-page-fallback";
import { SUPPORT_TICKETS_PAGE_META } from "@/components/table-page-meta";

export default function Loading() {
  return <TablePageFallback {...SUPPORT_TICKETS_PAGE_META} columnCount={4} />;
}
