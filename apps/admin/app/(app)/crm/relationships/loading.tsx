import { TablePageFallback } from "@/components/table-page-fallback";
import {
  CRM_PAGE_META,
  CRM_RELATIONSHIPS_PAGE_META,
} from "@/components/table-page-meta";

export default function Loading() {
  return (
    <TablePageFallback
      title={CRM_RELATIONSHIPS_PAGE_META.title}
      description={CRM_RELATIONSHIPS_PAGE_META.description}
      density={CRM_PAGE_META.density}
      columnCount={6}
      rowCount={8}
    />
  );
}
