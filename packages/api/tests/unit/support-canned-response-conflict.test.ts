import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ single: vi.fn(), upsert: vi.fn() }));
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({
    client: {
      from: () => ({
        upsert: (...args: unknown[]) => {
          mocks.upsert(...args);
          return { select: () => ({ single: mocks.single }) };
        },
      }),
    },
    error: null,
  }),
}));
vi.mock("@asym/auth/context", () => ({
  getAuthContext: vi.fn(),
  hasAnyContextRole: vi.fn(),
}));
import { supabaseSupportHubAdapter } from "../../src/admin/support-hub/adapter/supabase";
import { SupportCannedResponseError } from "../../src/admin/support-hub/canned-response-error";
import { runWithSupportHubTenant } from "../../src/admin/support-hub/request-context";
import { toApiErrorResponse } from "../../src/admin/support-hub/route-helpers";
beforeEach(() => {
  vi.clearAllMocks();
});
it("maps the atomic shortcode index conflict to a safe typed API error", async () => {
  mocks.single.mockResolvedValue({
    data: null,
    error: {
      code: "23505",
      message:
        'duplicate key violates unique constraint "support_canned_responses_tenant_owner_short_code_uq"',
    },
  });
  const error = await runWithSupportHubTenant("tenant-a", () =>
    supabaseSupportHubAdapter.cannedResponses.save({
      shortCode: "receipt",
      title: "Receipt",
      ownerAgentId: null,
      bodyText: "Thank you",
    }),
  ).catch((value) => value);
  expect(error).toBeInstanceOf(SupportCannedResponseError);
  expect(mocks.upsert).toHaveBeenCalledWith(
    expect.objectContaining({ tenant_id: "tenant-a" }),
    { onConflict: "tenant_id,id" },
  );
  const response = toApiErrorResponse(error, "Could not save.");
  expect(response.status).toBe(409);
  expect(await response.json()).toEqual({
    error: "This shortcode is already in use.",
  });
});
it("does not misclassify unrelated database errors as shortcode collisions", async () => {
  mocks.single.mockResolvedValue({
    data: null,
    error: { code: "23505", message: "other_private_constraint" },
  });
  const error = await runWithSupportHubTenant("tenant-a", () =>
    supabaseSupportHubAdapter.cannedResponses.save({
      shortCode: "receipt",
      title: "Receipt",
      ownerAgentId: null,
      bodyText: "Thanks",
    }),
  ).catch((value) => value);
  const response = toApiErrorResponse(error, "Could not save.");
  expect(response.status).toBe(500);
  expect(await response.json()).toEqual({ error: "Could not save." });
});
