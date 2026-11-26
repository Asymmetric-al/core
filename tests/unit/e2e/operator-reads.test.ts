import { describe, expect, it, vi } from "vitest";

import { readFailedRequest } from "../../e2e/helpers/operator-reads";

import type { APIRequestContext, Request } from "@playwright/test";

const ROUTE_DATA = "http://localhost:3130/operator?_rsc=t6mUerBowmZM7s7p";

type Shape = {
  method: string;
  url: string;
  resourceType: string;
  navigation: boolean;
  headers: Record<string, string>;
  failure: string;
};

function failedRequest(overrides: Partial<Shape> = {}): Request {
  const shape: Shape = {
    method: "GET",
    url: ROUTE_DATA,
    resourceType: "fetch",
    navigation: false,
    headers: { rsc: "1", accept: "*/*", "next-url": "/login" },
    failure: "net::ERR_ABORTED",
    ...overrides,
  };
  return {
    method: () => shape.method,
    url: () => shape.url,
    resourceType: () => shape.resourceType,
    isNavigationRequest: () => shape.navigation,
    headers: () => shape.headers,
    allHeaders: async () => ({
      ...shape.headers,
      cookie: "sb-auth-token=abc",
      host: "localhost:3130",
    }),
    failure: () => ({ errorText: shape.failure }),
  } as unknown as Request;
}

function replayAnswering(status: number, body = "0:route data") {
  const get = vi.fn(async () => ({
    status: () => status,
    headers: () => ({ "content-type": "text/x-component" }),
    body: async () => Buffer.from(body),
  }));
  return { api: { get } as unknown as APIRequestContext, get };
}

describe("AL-2675 WP2c part 2a, F9: an /operator request the browser dropped", () => {
  it("reads again a route-data fetch the router aborted, with its address and headers, and takes its 200 answer", async () => {
    const { api, get } = replayAnswering(200);
    const read = await readFailedRequest(
      api,
      failedRequest(),
      "GET /operator",
      true,
    );
    expect(read).toMatchObject({ named: true, readAgain: true, reason: "" });
    expect(read.text).toContain("0:route data");
    expect(get).toHaveBeenCalledWith(ROUTE_DATA, {
      headers: { rsc: "1", accept: "*/*", "next-url": "/login" },
      maxRedirects: 0,
    });
  });

  it.each([
    [
      "an aborted document navigation",
      { resourceType: "document", navigation: true, headers: {} },
    ],
    ["a reset connection", { failure: "net::ERR_CONNECTION_RESET" }],
    ["a fetch that is not route data", { headers: { accept: "*/*" } }],
    [
      "an aborted prefetch",
      { headers: { rsc: "1", "next-router-prefetch": "1" } },
    ],
  ] as const)(
    "never reads again %s: it stays unreadable and fails with its path",
    async (_label, overrides) => {
      const { api, get } = replayAnswering(200);
      const read = await readFailedRequest(
        api,
        failedRequest(overrides),
        "GET /operator",
        true,
      );
      expect(read.text).toBeNull();
      expect(read.where).toBe("GET /operator");
      expect(get).not.toHaveBeenCalled();
    },
  );

  it.each([307, 404, 500])(
    "counts a re-read answering %i as unreadable, failing with its path",
    async (status) => {
      const { api } = replayAnswering(status, "");
      const read = await readFailedRequest(
        api,
        failedRequest(),
        "GET /operator",
        true,
      );
      expect(read.text).toBeNull();
      expect(read.where).toBe("GET /operator");
      expect(read.reason).toContain(String(status));
    },
  );

  it("reads nothing again for a request outside the area", async () => {
    const { api, get } = replayAnswering(200);
    const read = await readFailedRequest(
      api,
      failedRequest({ url: "http://localhost:3130/login?_rsc=x" }),
      "GET /login",
      false,
    );
    expect(read).toMatchObject({ named: false, text: null });
    expect(get).not.toHaveBeenCalled();
  });
});
