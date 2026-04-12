import type { AdminCrmFilters, CrmSortDirection, CrmSortField } from "./query";
import type {
  CrmGridRow,
  AdminCrmListResponse as AdminCrmListResponseBase,
} from "@asym/database/types";

export type { CrmGridRow };

export interface AdminCrmListResponse extends Omit<
  AdminCrmListResponseBase,
  "sort" | "filters"
> {
  sort: {
    field: CrmSortField;
    direction: CrmSortDirection;
  };
  filters: AdminCrmFilters;
}
