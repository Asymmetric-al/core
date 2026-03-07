import { describe, expect, it, vi } from "vitest";

import { proxy as adminProxy } from "../../../apps/admin/proxy";
import { proxy as donorProxy } from "../../../apps/donor/proxy";
import { proxy as missionaryProxy } from "../../../apps/missionary/proxy";

function createRequest(pathname: string) {
  const nextUrl = new URL(`https://example.org${pathname}`);
  (nextUrl as URL & { clone: () => URL }).clone = () =>
    new URL(nextUrl.toString());

  return {
    nextUrl,
    cookies: {
      get: vi.fn(() => undefined),
      getAll: vi.fn(() => []),
      set: vi.fn(),
    },
    headers: new Headers(),
  } as never;
}

describe("app proxy public route configuration", () => {
  it("keeps the admin public CMS API anonymous", async () => {
    const response = await adminProxy(
      createRequest("/api/cms/public/pages/home"),
    );

    expect(response.status).toBe(200);
  });

  it("keeps health endpoints public across apps", async () => {
    const [adminResponse, donorResponse, missionaryResponse] =
      await Promise.all([
        adminProxy(createRequest("/api/health")),
        donorProxy(createRequest("/api/health")),
        missionaryProxy(createRequest("/api/health")),
      ]);

    expect(adminResponse.status).toBe(200);
    expect(donorResponse.status).toBe(200);
    expect(missionaryResponse.status).toBe(200);
  });
});
