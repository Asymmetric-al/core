// @vitest-environment jsdom
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderDocumentScope } from "./scope-fixture";

/**
 * The own-API fetch wrapper (plan 5.2, "Calls from a page to the app's own
 * API carry the tenant too"; WP2b, AL-2675).
 */

const SCOPE = {
  userId: "00000000-0000-4000-8000-0000000000a1",
  tenantId: "00000000-0000-0000-0000-000000000002",
  assignmentId: "00000000-0000-4000-8000-000000000102",
  addressPrefix: "/00000000-0000-0000-0000-000000000002",
};

async function load() {
  vi.resetModules();
  return import("../../../../packages/database/own-api");
}

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function sentHeaders(call = 0): Headers {
  return fetchMock.mock.calls[call]![1].headers as Headers;
}

describe("ownApiFetch", () => {
  it("sends the document's tenant and assignment on a call to the app's own API", async () => {
    const { ownApiFetch } = await load();
    await renderDocumentScope(SCOPE);

    await ownApiFetch("/api/admin/funds?limit=200", {
      headers: { Accept: "application/json" },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]![0]).toBe("/api/admin/funds?limit=200");
    const headers = sentHeaders();
    expect(headers.get("x-asym-tenant")).toBe(SCOPE.tenantId);
    expect(headers.get("x-asym-assignment")).toBe(SCOPE.assignmentId);
    expect(headers.get("accept")).toBe("application/json");
  });

  it("replaces any tenant or assignment the caller names with the document's", async () => {
    const { ownApiFetch } = await load();
    await renderDocumentScope(SCOPE);

    await ownApiFetch("/api/posts", {
      method: "POST",
      headers: {
        "x-asym-tenant": "00000000-0000-0000-0000-000000000001",
        "x-asym-assignment": "00000000-0000-4000-8000-000000000101",
      },
    });

    expect(sentHeaders().get("x-asym-tenant")).toBe(SCOPE.tenantId);
    expect(sentHeaders().get("x-asym-assignment")).toBe(SCOPE.assignmentId);
    expect(fetchMock.mock.calls[0]![1].method).toBe("POST");
  });

  it("sends neither header from a document with no scope, and drops a caller's copy", async () => {
    const { ownApiFetch } = await load();

    await ownApiFetch("/api/auth/demo-account", {
      headers: { "x-asym-tenant": "00000000-0000-0000-0000-000000000001" },
    });

    expect(sentHeaders().has("x-asym-tenant")).toBe(false);
    expect(sentHeaders().has("x-asym-assignment")).toBe(false);
  });

  it("never takes a response from the HTTP cache, which keys by address alone", async () => {
    const { ownApiFetch } = await load();
    await renderDocumentScope(SCOPE);

    await ownApiFetch("/api/admin/crm/records", { cache: "force-cache" });

    expect(fetchMock.mock.calls[0]![1].cache).toBe("no-store");
  });

  it.each([
    "https://example.org/api/admin/funds",
    "//example.org/api/admin/funds",
    "/web-studio/api/pages",
    "/apiary",
    "api/admin/funds",
  ])(
    "refuses %s before any request, so the headers never leave the app",
    async (path) => {
      const { ownApiFetch, OwnApiPathError } = await load();
      await renderDocumentScope(SCOPE);

      expect(() => ownApiFetch(path)).toThrow(OwnApiPathError);
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );
});

describe("ownApiDownload", () => {
  it("fetches the file with the document's scope and hands it to the browser", async () => {
    const { ownApiDownload } = await load();
    await renderDocumentScope(SCOPE);
    fetchMock.mockResolvedValue(
      new Response("a,b\n", {
        status: 200,
        headers: {
          "content-disposition": 'attachment; filename="donors.csv"',
        },
      }),
    );
    const createObjectURL = vi.fn(() => "blob:own-api");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal(
      "URL",
      Object.assign(URL, { createObjectURL, revokeObjectURL }),
    );
    const clicks: Array<{ href: string; download: string }> = [];
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(function (this: HTMLAnchorElement) {
        clicks.push({ href: this.href, download: this.download });
      });

    await ownApiDownload("/api/admin/crm/reports/export?slice=donors");

    expect(sentHeaders().get("x-asym-tenant")).toBe(SCOPE.tenantId);
    expect(sentHeaders().get("x-asym-assignment")).toBe(SCOPE.assignmentId);
    expect(clicks).toEqual([{ href: "blob:own-api", download: "donors.csv" }]);
    click.mockRestore();
  });

  it("rejects with the route's message when the route refuses", async () => {
    const { ownApiDownload } = await load();
    fetchMock.mockResolvedValue(
      Response.json({ error: "Forbidden" }, { status: 403 }),
    );

    await expect(ownApiDownload("/api/donor/statements/2026")).rejects.toThrow(
      "Forbidden",
    );
  });
});
