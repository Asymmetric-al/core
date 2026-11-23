import { randomUUID } from "node:crypto";

import { describe, expect, it, vi } from "vitest";

import type { AuthenticatedContext } from "@asym/auth/context";

import {
  MEDIA_BUCKET,
  MEDIA_MAX_BYTES,
  MEDIA_MAX_PIXELS,
  MEDIA_PURGE_DELAY_DAYS,
  MEDIA_VARIANT_NAMES,
} from "@asym/api/storage/media-constants";
import {
  finalizeMediaUpload,
  issueSignedUpload,
  readMediaVariant,
} from "@asym/api/storage/media-store";

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: vi.fn(() => ({
    client: null,
    error: "Admin client unavailable",
  })),
}));

describe("@asym/api/storage/media-store package surface", () => {
  it("exports media constants and rejects unauthenticated contexts before acquiring the admin client", async () => {
    expect(MEDIA_BUCKET).toBe("cms-media");
    expect(MEDIA_MAX_BYTES).toBe(15_728_640);
    expect(MEDIA_MAX_PIXELS).toBe(25_000_000);
    expect(MEDIA_PURGE_DELAY_DAYS).toBe(35);
    expect(MEDIA_VARIANT_NAMES).toEqual(["w320", "w960", "w1600"]);

    const unauth = {
      userId: null,
      email: null,
      tenantId: null,
      role: null,
      profileId: null,
      isAuthenticated: false,
      memberships: [],
    } as unknown as AuthenticatedContext;
    const assetId = randomUUID();

    await expect(issueSignedUpload(unauth, { assetId })).rejects.toMatchObject({
      status: 401,
    });
    await expect(
      finalizeMediaUpload(unauth, { assetId }),
    ).rejects.toMatchObject({ status: 401 });
    await expect(readMediaVariant(unauth, { assetId })).rejects.toMatchObject({
      status: 401,
    });
  });
});
