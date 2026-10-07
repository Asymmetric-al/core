import { TablePageFallback } from "@/components/table-page-fallback";
import { CRM_NOTES_PAGE_META } from "@/components/table-page-meta";

export default function Loading() {
  return (
    <TablePageFallback
      title={CRM_NOTES_PAGE_META.title}
      description={CRM_NOTES_PAGE_META.description}
      density={CRM_NOTES_PAGE_META.density}
      columnCount={5}
    />
  );
}
