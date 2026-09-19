import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  fetchJsonResult,
  fetchResult,
  parseJsonResponse,
  readErrorMessage,
  readJsonBody,
} from "../../../../packages/lib/http/fetch-result";

const fetchMock = vi.fn<typeof fetch>();

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchResult", () => {
  it("returns the response for 2xx statuses without reading the body", async () => {
    const response = new Response(null, { status: 204 });
    fetchMock.mockResolvedValueOnce(response);

    const result = await fetchResult("/api/things/1", { method: "DELETE" });

    expect(result).toEqual({ ok: true, response });
    expect(response.bodyUsed).toBe(false);
  });

  it("turns an HTTP error into a result carrying the parsed error payload", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(422, { error: "Amount must be positive" }),
    );

    const result = await fetchResult("/api/things");

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");
    expect(result.error).toMatchObject({
      kind: "http",
      status: 422,
      payload: { error: "Amount must be positive" },
      message: "Amount must be positive",
    });
  });

  it("falls back to a status message when the error body is not JSON", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response("<html>gateway</html>", { status: 502 }),
    );

    const result = await fetchResult("/api/things");

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");
    expect(result.error).toMatchObject({
      kind: "http",
      status: 502,
      payload: null,
      message: "Request failed with status 502",
    });
  });

  it("turns a rejected fetch into a network result instead of throwing", async () => {
    const cause = new TypeError("Failed to fetch");
    fetchMock.mockRejectedValueOnce(cause);

    const result = await fetchResult("/api/things");

    expect(result).toEqual({
      ok: false,
      error: { kind: "network", cause, message: "Failed to fetch" },
    });
  });
});

describe("fetchJsonResult", () => {
  it("parses the body on success", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { posts: [{ id: 1 }] }));

    const result = await fetchJsonResult<{ posts: { id: number }[] }>(
      "/api/posts",
    );

    expect(result).toEqual({
      ok: true,
      status: 200,
      data: { posts: [{ id: 1 }] },
    });
  });

  it("reports an unparseable success body as a parse failure", async () => {
    fetchMock.mockResolvedValueOnce(new Response("not json", { status: 200 }));

    const result = await fetchJsonResult("/api/posts");

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");
    expect(result.error.kind).toBe("parse");
    expect(result.error.message).toContain("/api/posts");
  });

  it("propagates HTTP failures with their payload", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(500, { message: "boom" }));

    const result = await fetchJsonResult("/api/posts");

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");
    expect(result.error).toMatchObject({
      kind: "http",
      status: 500,
      message: "boom",
    });
  });
});

describe("parseJsonResponse", () => {
  it("checks response.ok before reading the body", async () => {
    const events: string[] = [];
    const response = {
      get ok() {
        events.push("ok");
        return false;
      },
      status: 403,
      async json() {
        events.push("json");
        return { error: "Nope" };
      },
    } as Response;

    await expect(parseJsonResponse(response)).rejects.toThrow("Nope");
    expect(events).toEqual(["ok", "json"]);
  });

  it("returns the parsed payload on success", async () => {
    await expect(
      parseJsonResponse<{ portal: { id: string } }>(
        jsonResponse(200, { portal: { id: "d1" } }),
      ),
    ).resolves.toEqual({ portal: { id: "d1" } });
  });

  it("throws the payload error on HTTP failure and a status fallback otherwise", async () => {
    await expect(
      parseJsonResponse(
        jsonResponse(422, { error: "Amount must be positive" }),
      ),
    ).rejects.toThrow("Amount must be positive");

    await expect(
      parseJsonResponse(new Response("<html>gateway</html>", { status: 502 })),
    ).rejects.toThrow("Request failed with status 502");
  });

  it("does not treat a message field as the thrown error", async () => {
    await expect(
      parseJsonResponse(jsonResponse(500, { message: "boom" })),
    ).rejects.toThrow("Request failed with status 500");
  });

  it("throws when a success body is empty", async () => {
    await expect(
      parseJsonResponse(new Response(null, { status: 204 })),
    ).rejects.toThrow("Request returned an empty response.");
  });
});

describe("readJsonBody", () => {
  it("returns the parsed body with the status flag for both success and error responses", async () => {
    await expect(
      readJsonBody<{ id: number }>(jsonResponse(200, { id: 7 })),
    ).resolves.toEqual({ ok: true, status: 200, body: { id: 7 } });

    await expect(
      readJsonBody<{ error: string }>(jsonResponse(409, { error: "taken" })),
    ).resolves.toEqual({ ok: false, status: 409, body: { error: "taken" } });
  });

  it("yields a null body when the response is not JSON", async () => {
    await expect(
      readJsonBody(new Response("<html>oops</html>", { status: 500 })),
    ).resolves.toEqual({ ok: false, status: 500, body: null });

    await expect(
      readJsonBody(new Response(null, { status: 204 })),
    ).resolves.toEqual({ ok: true, status: 204, body: null });
  });
});

describe("readErrorMessage", () => {
  it("reads string error or message fields and ignores everything else", () => {
    expect(readErrorMessage({ error: "nope" })).toBe("nope");
    expect(readErrorMessage({ message: "why" })).toBe("why");
    expect(readErrorMessage({ error: { code: 1 } })).toBeNull();
    expect(readErrorMessage("plain")).toBeNull();
    expect(readErrorMessage(null)).toBeNull();
  });
});
