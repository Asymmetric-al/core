// @vitest-environment jsdom
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { renderDocumentScope } from "./scope-fixture";

/**
 * The browser client sends the document's tenant and assignment on its Data
 * API requests (plan 5.2, "The browser data layer is scoped…": the browser
 * client sends both headers; WP2b, AL-2675). The database ignores them until
 * the second release of WP2b repoints its helper to them.
 *
 * `@supabase/ssr` keeps one browser client per page, so this file loads the
 * client once.
 */

const SCOPE = {
  userId: "00000000-0000-4000-8000-0000000000a1",
  tenantId: "00000000-0000-0000-0000-000000000002",
  assignmentId: "00000000-0000-4000-8000-000000000102",
  addressPrefix: "/00000000-0000-0000-0000-000000000002",
};

const fetchMock = vi.fn(
  async (_input: RequestInfo | URL, _init?: RequestInit) =>
    new Response("[]", {
      status: 200,
      headers: { "content-type": "application/json" },
    }),
);

beforeAll(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

function requestTo(path: string) {
  const call = fetchMock.mock.calls.find(([input]) =>
    String(input instanceof Request ? input.url : input).includes(path),
  );
  expect(call, `a request to ${path}`).toBeDefined();
  const [input, init] = call!;
  return new Headers(
    init?.headers ?? (input instanceof Request ? input.headers : undefined),
  );
}

describe("the browser client", () => {
  it("sends the document's tenant and assignment on every Data API request", async () => {
    const { createClient } =
      await import("../../../../packages/database/supabase/client");
    await renderDocumentScope(SCOPE);
    const supabase = createClient();

    await supabase.from("donors").select("id");
    await supabase.rpc("current_user_assignments");

    for (const path of [
      "/rest/v1/donors",
      "/rest/v1/rpc/current_user_assignments",
    ]) {
      const headers = requestTo(path);
      expect(headers.get("x-asym-tenant")).toBe(SCOPE.tenantId);
      expect(headers.get("x-asym-assignment")).toBe(SCOPE.assignmentId);
    }
  });
});
