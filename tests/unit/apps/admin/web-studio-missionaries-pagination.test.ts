import { afterEach, expect, it, vi } from "vitest";

import { fetchStudioMissionaries } from "../../../../apps/admin/src/cms-ui/web-studio/flows/studio-missionaries";

// WP2b, AL-2675: these calls go through the own-API wrapper, whose own suite
// (tests/unit/packages/database/own-api.test.ts) proves what it adds: the
// document's tenant and assignment, and no HTTP cache. Here it passes each
// call through unchanged, so the assertions below still read exactly the
// request the caller sends.
vi.mock("@asym/database/own-api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@asym/database/own-api")>()),
  ownApiFetch: (path: string, init?: RequestInit) =>
    globalThis.fetch(path, init),
}));

afterEach(() => vi.unstubAllGlobals());

it("reads every offset, including the empty page after an exact multiple", async () => {
  const fetchMock = vi.fn(async (url: string) => {
    const offset = Number(new URLSearchParams(url.split("?")[1]).get("offset"));
    return Response.json({
      missionaries:
        offset < 400
          ? Array.from({ length: 200 }, (_, i) => ({ id: `m-${offset + i}` }))
          : [],
    });
  });
  vi.stubGlobal("fetch", fetchMock);
  const signal = new AbortController().signal;
  const rows = await fetchStudioMissionaries(signal);
  expect(rows).toHaveLength(400);
  expect(rows.at(-1)?.id).toBe("m-399");
  expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
    "/api/admin/missionaries?limit=200&offset=0",
    "/api/admin/missionaries?limit=200&offset=200",
    "/api/admin/missionaries?limit=200&offset=400",
  ]);
  expect(fetchMock).toHaveBeenCalledWith(expect.any(String), {
    credentials: "include",
    signal,
  });
});

it.each(["http", "missing rows"])(
  "rejects the full directory when a later page fails: %s",
  async (failure) => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          Response.json({
            missionaries: Array.from({ length: 200 }, (_, i) => ({
              id: `m-${i}`,
            })),
          }),
        )
        .mockResolvedValueOnce(
          Response.json({}, failure === "http" ? { status: 503 } : undefined),
        ),
    );
    await expect(fetchStudioMissionaries()).rejects.toThrow(
      "The missionary directory didn't load. Try again.",
    );
  },
);
