import { describe, expect, it } from "vitest";

import { parseJsonResponse } from "../../../../packages/database/http/parse-json-response";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("packages/database parseJsonResponse", () => {
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
      parseJsonResponse<{ location: { id: string } }>(
        jsonResponse(200, { location: { id: "loc_1" } }),
      ),
    ).resolves.toEqual({ location: { id: "loc_1" } });
  });

  it("throws the payload error on HTTP failure and a status fallback otherwise", async () => {
    await expect(
      parseJsonResponse(jsonResponse(409, { error: "taken" })),
    ).rejects.toThrow("taken");

    await expect(
      parseJsonResponse(new Response("nope", { status: 503 })),
    ).rejects.toThrow("Request failed with status 503");
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
