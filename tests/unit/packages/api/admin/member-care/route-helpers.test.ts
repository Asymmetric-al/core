import { describe, expect, it } from "vitest";

import { manualAttentionSchema } from "../../../../../../packages/api/src/admin/member-care/mutations";
import {
  readJsonBody,
  toApiErrorResponse,
  toMutationErrorResponse,
} from "../../../../../../packages/api/src/admin/member-care/route-helpers";

describe("member care route helpers", () => {
  it("returns 400 for invalid json request body", async () => {
    const request = new Request("http://localhost/api", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: "{invalid-json",
    });

    const result = await readJsonBody(request);
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("Expected invalid JSON failure");
    expect(result.response.status).toBe(400);
  });

  it("returns 400 for non-object json payloads", async () => {
    const request = new Request("http://localhost/api", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(["not-an-object"]),
    });

    const result = await readJsonBody(request);
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("Expected object payload failure");
    expect(result.response.status).toBe(400);
  });

  it("returns 415 for non-json non-empty payloads", async () => {
    const request = new Request("http://localhost/api", {
      method: "POST",
      headers: {
        "content-type": "text/plain",
      },
      body: "plain text",
    });

    const result = await readJsonBody(request);
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("Expected 415 failure");
    expect(result.response.status).toBe(415);
  });

  it("returns 422 when schema validation fails", async () => {
    const request = new Request("http://localhost/api", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ personnelId: 42, manualAttention: true }),
    });

    const result = await readJsonBody(request, manualAttentionSchema);
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("Expected schema validation failure");
    expect(result.response.status).toBe(422);
  });

  it("maps zod errors to 422 responses", async () => {
    const parsed = manualAttentionSchema.safeParse({
      personnelId: 42,
      manualAttention: "nope",
    });

    if (parsed.success) {
      throw new Error("Expected schema parsing to fail");
    }

    const response = toMutationErrorResponse(parsed.error, "Fallback");
    expect(response.status).toBe(422);
  });

  it("maps postgres 42501 to 403 and P0002 to static 500", async () => {
    const forbidden = toMutationErrorResponse(
      Object.assign(new Error("Forbidden"), { code: "42501" }),
      "Fallback",
    );
    expect(forbidden.status).toBe(403);
    expect(await forbidden.json()).toEqual({ error: "Forbidden" });

    const missing = toMutationErrorResponse(
      Object.assign(new Error("Missionary not found."), { code: "P0002" }),
      "Failed to create thread post.",
    );
    expect(missing.status).toBe(500);
    expect(await missing.json()).toEqual({
      error: "Failed to create thread post.",
    });
  });

  it("maps unknown errors to supplied status and fallback message", async () => {
    const response = toApiErrorResponse(new Error("boom"), "fallback", 503);
    expect(response.status).toBe(503);
  });
});
