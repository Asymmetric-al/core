import { getAuthContext } from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

import { POST } from "../../src/posts";

vi.mock("@asym/auth/context", () => ({
  getAuthContext: vi.fn(),
  requireAuth: vi.fn(),
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: vi.fn(),
}));

const mockedGetAuthContext = vi.mocked(getAuthContext);
const mockedGetAdminClient = vi.mocked(getAdminClient);

describe("posts read-only POST", () => {
  it("returns the fixed demo response without auth or admin setup", async () => {
    const request = new NextRequest("http://localhost/api/posts", {
      method: "POST",
    });

    const response = await POST(request);

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "Read-only demo" });
    expect(mockedGetAuthContext).not.toHaveBeenCalled();
    expect(mockedGetAdminClient).not.toHaveBeenCalled();
  });
});
