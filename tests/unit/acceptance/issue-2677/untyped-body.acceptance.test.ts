import { beforeEach, describe, expect, it, vi } from "vitest";

/*
 * Fix check G1, the second half of F13. The proxy judges a write by its
 * headers alone and forwards one with no type and no framing as empty; over
 * HTTP/2 or HTTP/3 a body needs no length header, so one may still arrive.
 * The shared JSON reader is the second line: it decides by the bytes it
 * reads, and a non-empty body whose media type is not JSON gets 415.
 */
const h = vi.hoisted(() => ({ update: vi.fn(), admin: vi.fn() }));
vi.mock("@asym/database/supabase/admin", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  getAdminClient: h.admin,
}));
vi.mock("@asym/auth/context", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  getAuthContext: async () => ({
    isAuthenticated: true,
    tenantId: "tenant-1",
    userId: "user-1",
  }),
  requireTenantAdministrator: () => undefined,
  requireCapability: () => undefined,
}));

import { PATCH as commentPATCH } from "../../../../packages/api/src/admin/comments/comment";
import { POST as emailAssetPOST } from "../../../../packages/api/src/email/assets";
import { readForm } from "../../../../packages/api/src/upload/image";
import {
  ensureJsonBody,
  readJsonBodyOrNull,
} from "../../../../packages/api/src/shared/http-errors";

const url = "https://admin.example.test/api/admin/comments/c-1";
const json = JSON.stringify({ content: "Edited" });
/** A request whose body carries no type: bytes, not a string. */
const write = (method: string, body?: string, type?: string) =>
  new Request(url, {
    method,
    body: body === undefined ? undefined : new TextEncoder().encode(body),
    headers: type ? { "content-type": type } : {},
  });

beforeEach(() => vi.clearAllMocks());

describe("the shared JSON reader", () => {
  // Re-check H3: a body that is not JSON is refused on its first non-empty
  // chunk; the rest of the stream is never pulled.
  it("refuses a large untyped stream after its first chunk", async () => {
    let pulls = 0;
    const body = new ReadableStream<Uint8Array>({
      pull(controller) {
        pulls += 1;
        if (pulls > 10_000) controller.close();
        else controller.enqueue(new Uint8Array(1024).fill(123));
      },
    });
    const request = new Request(url, {
      method: "POST",
      body,
      duplex: "half",
    } as RequestInit);
    await expect(ensureJsonBody(request)).rejects.toMatchObject({
      status: 415,
    });
    expect(pulls).toBeLessThanOrEqual(3);
  });

  it.each([
    ["no media type", undefined],
    ["text/plain", "text/plain;charset=UTF-8"],
  ])("refuses a non-empty JSON body with %s: 415", async (_name, type) => {
    await expect(
      ensureJsonBody(write("POST", json, type)),
    ).rejects.toMatchObject({
      status: 415,
      message: "Unsupported mutation content type.",
    });
    await expect(
      readJsonBodyOrNull(write("POST", json, type)),
    ).rejects.toMatchObject({ status: 415 });
  });

  it("reads a JSON body typed as JSON", async () => {
    expect(
      await ensureJsonBody(
        write("POST", json, "application/json; charset=utf-8"),
      ),
    ).toEqual({ content: "Edited" });
  });

  it.each(["POST", "DELETE"])(
    "treats an empty untyped %s as before: invalid JSON, or no body",
    async (method) => {
      await expect(ensureJsonBody(write(method))).rejects.toMatchObject({
        status: 400,
        message: "Invalid JSON body",
      });
      expect(await readJsonBodyOrNull(write(method))).toBeNull();
      expect(await readJsonBodyOrNull(write(method, ""))).toBeNull();
    },
  );
});

describe("readers of multipart bodies need the type themselves", () => {
  const form =
    '--piece\r\nContent-Disposition: form-data; name="file"\r\n\r\nx\r\n--piece--\r\n';
  it("the image upload refuses an untyped body", async () => {
    await expect(readForm(write("POST", form))).rejects.toMatchObject({
      status: 400,
      message: "Invalid form data.",
    });
  });
  it("the email asset upload refuses an untyped body before any storage call", async () => {
    const response = await emailAssetPOST(write("POST", form) as never);
    expect(response.status).toBe(400);
    expect(h.admin).not.toHaveBeenCalled();
  });
});

describe("a handler that reads through the shared reader", () => {
  beforeEach(() => {
    const comments = {
      select: () => comments,
      eq: () => comments,
      single: async () => ({
        data: { id: "c-1", post: { tenant_id: "tenant-1" } },
        error: null,
      }),
      update: (values: unknown) => {
        h.update(values);
        return {
          eq: () => ({
            select: () => ({
              single: async () => ({ data: { id: "c-1" }, error: null }),
            }),
          }),
        };
      },
    };
    h.admin.mockReturnValue({ client: { from: () => comments }, error: null });
  });
  const edit = (request: Request) =>
    commentPATCH(request as never, {
      params: Promise.resolve({ commentId: "c-1" }),
    });

  it("answers an untyped JSON body with 415 and changes nothing", async () => {
    const response = await edit(write("PATCH", json));
    expect(response.status).toBe(415);
    expect(await response.json()).toEqual({
      error: "Unsupported mutation content type.",
    });
    expect(h.update).not.toHaveBeenCalled();
  });

  it("still applies a typed JSON body", async () => {
    const response = await edit(write("PATCH", json, "application/json"));
    expect(response.status).toBe(200);
    expect(h.update).toHaveBeenCalledWith(
      expect.objectContaining({ content: "Edited" }),
    );
  });
});
