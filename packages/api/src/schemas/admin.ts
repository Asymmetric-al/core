import { z } from "zod";

/** Query params for GET /admin/users (list). Defaults applied before parse. */
export const adminUsersListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100),
  offset: z.coerce.number().int().min(0).max(500_000),
  role: z.string().trim().min(1).max(128).optional(),
});
