import { TablePageFallback } from "@/components/table-page-fallback";
import { TASKS_PAGE_META } from "@/components/table-page-meta";

export default function Loading() {
  return <TablePageFallback {...TASKS_PAGE_META} columnCount={6} />;
}
