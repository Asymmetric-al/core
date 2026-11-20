// @vitest-environment jsdom
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { renderDocumentScope } from "./scope-fixture";

/**
 * The browser client sends the document's tenant and assignment on its Data
 * API requests (plan 5.2, "The browser data layer is scoped…": the browser
 * client sends both headers; WP2b, AL-2675). Database functions that already
 * read `x-asym-assignment` accept only a membership the caller holds; the
 * rest of the database ignores the headers until the second release of WP2b
 * repoints its helper to them.
 *
 * `@supabase/ssr` keeps one browser client per page, so this file creates the
 * client once, before the page has a scope, and its cases run in order on that
 * one client: first with no scope, then after the page fixes one.
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

type BrowserClient = ReturnType<
  typeof import("../../../../packages/database/supabase/client").createClient
>;
let supabase: BrowserClient;

beforeAll(async () => {
  vi.stubGlobal("fetch", fetchMock);
  const { createClient } =
    await import("../../../../packages/database/supabase/client");
  // Created before any page has fixed a scope, as a module-level client is.
  supabase = createClient();
});

beforeEach(() => {
  fetchMock.mockClear();
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
  it("sends neither header from a document with no scope, and drops a copy the caller set", async () => {
    await supabase
      .from("donors")
      .select("id")
      .setHeader("x-asym-tenant", "00000000-0000-0000-0000-0000000000ff");

    const headers = requestTo("/rest/v1/donors");
    expect(headers.has("x-asym-tenant")).toBe(false);
    expect(headers.has("x-asym-assignment")).toBe(false);
  });

  it("sends the scope from a client created before the page fixed it, read at each request", async () => {
    await renderDocumentScope(SCOPE);

    await supabase.from("donors").select("id");

    const headers = requestTo("/rest/v1/donors");
    expect(headers.get("x-asym-tenant")).toBe(SCOPE.tenantId);
    expect(headers.get("x-asym-assignment")).toBe(SCOPE.assignmentId);
  });

  it("sends the document's tenant and assignment on every Data API request", async () => {
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

  it("sends Auth and Storage requests out unchanged, without the tenant headers", async () => {
    await supabase.auth
      .signInWithPassword({ email: "donor@example.test", password: "secret" })
      .catch(() => undefined);
    await supabase.storage
      .from("receipts")
      .list()
      .catch(() => undefined);

    for (const path of ["/auth/v1/token", "/storage/v1/object/list/receipts"]) {
      const headers = requestTo(path);
      expect(headers.has("x-asym-tenant")).toBe(false);
      expect(headers.has("x-asym-assignment")).toBe(false);
    }
  });
});
