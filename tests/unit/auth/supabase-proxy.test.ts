import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }));

vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: () => ({
    url: "http://127.0.0.1:54321",
    key: "test-anon-key",
  }),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: (
    _url: string,
    _key: string,
    options: {
      cookies: {
        setAll: (
          cookies: { name: string; value: string }[],
          headers: Record<string, string>,
        ) => void;
      };
    },
  ) => ({ auth: { getSession: () => refresh(options.cookies.setAll) } }),
}));

import { updateSession } from "@asym/database/supabase/proxy";

beforeEach(() => {
  refresh.mockReset();
});

describe("legacy Supabase session refresh", () => {
  it("preserves cache headers and earlier cookie chunks across repeated writes", async () => {
    refresh.mockImplementation(async (setAll) => {
      setAll([{ name: "sb-session.0", value: "first" }], {
        "Cache-Control": "private, no-store",
        Expires: "0",
        Pragma: "no-cache",
      });
      setAll([{ name: "sb-session.1", value: "second" }], {});
    });
    const request = new NextRequest("http://localhost/dashboard");

    const response = await updateSession(request);

    expect(request.cookies.get("sb-session.0")?.value).toBe("first");
    expect(request.cookies.get("sb-session.1")?.value).toBe("second");
    expect(response.cookies.get("sb-session.0")?.value).toBe("first");
    expect(response.cookies.get("sb-session.1")?.value).toBe("second");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("expires")).toBe("0");
    expect(response.headers.get("pragma")).toBe("no-cache");
  });
});
