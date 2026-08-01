import { TablePageFallback } from "@/components/table-page-fallback";
import { CRM_RELATIONSHIPS_PAGE_META } from "@/components/table-page-meta";

export default function Loading() {
  return <TablePageFallback {...CRM_RELATIONSHIPS_PAGE_META} columnCount={6} />;
}
