import { z } from "zod";

import { ApiHttpError } from "../../shared/http-errors";

import type { SupportTicketListParams } from "./types";

const supportTicketListQuerySchema = z.object({
  queueId: z
    .enum(["donor_care", "mobilization", "missionary_support"])
    .optional(),
  status: z.enum(["open", "waiting", "resolved", "escalated"]).optional(),
  search: z.string().trim().min(1).max(120).optional(),
});

function optionalSearchParam(searchParams: URLSearchParams, key: string) {
  const value = searchParams.get(key);
  return value === null || value.trim() === "" ? undefined : value;
}

export function parseSupportTicketListParams(
  searchParams: URLSearchParams,
): SupportTicketListParams {
  const parsed = supportTicketListQuerySchema.safeParse({
    queueId: optionalSearchParam(searchParams, "queueId"),
    status: optionalSearchParam(searchParams, "status"),
    search: optionalSearchParam(searchParams, "search"),
  });

  if (!parsed.success) {
    throw new ApiHttpError(400, "Invalid support ticket query.");
  }

  return parsed.data;
}
