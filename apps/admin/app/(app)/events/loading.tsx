import { TablePageFallback } from "@/components/table-page-fallback";
import { EVENTS_PAGE_META } from "@/components/table-page-meta";

export default function Loading() {
  return <TablePageFallback {...EVENTS_PAGE_META} columnCount={5} />;
}
