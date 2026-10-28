/**
 * #2308 r1 (PR #2415 review): the request body is capped before it is buffered.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type * as AuthModule from "@asym/auth/context";

const h = vi.hoisted(() => ({
  auth: vi.fn(),
  client: vi.fn(),
  upload: vi.fn(),
}));
vi.mock("@asym/auth/context", async (importOriginal) => ({
  ...(await importOriginal<typeof AuthModule>()),
  getAuthContext: h.auth,
  createBearerSupabaseClient: h.client,
}));

import {
  MAX_PROFILE_IMAGE_BYTES,
  MAX_UPLOAD_BODY_BYTES,
  POST,
} from "../../../../../packages/api/src/upload/image";

const URL = "http://localhost/api/upload/image";
const MULTIPART = "multipart/form-data; boundary=cap-test-boundary";
const MiB = 1024 * 1024;

function webp(size: number) {
  const bytes = new Uint8Array(size);
  bytes.set(Buffer.from("RIFF\0\0\0\0WEBP", "latin1"));
  return new File([bytes], "crop.webp", { type: "image/webp" });
}

/** A form-shaped request whose multipart bytes and real length are known. */
async function encodedForm(file: File) {
  const form = new FormData();
  form.set("file", file);
  form.set("path", "avatars");
  form.set("bucket", "profiles");
  const encoded = new Request(URL, { method: "POST", body: form });
  return {
    bytes: new Uint8Array(await encoded.arrayBuffer()),
    contentType: encoded.headers.get("content-type")!,
  };
}

/** Body stream that counts what the handler pulls; nothing is read eagerly. */
function trackedStream(totalBytes: number, chunkBytes = MiB) {
  const stats = { pulled: 0, cancelled: false };
  let remaining = totalBytes;
  const stream = new ReadableStream<Uint8Array>(
    {
      pull(controller) {
        if (remaining <= 0) return controller.close();
        const size = Math.min(chunkBytes, remaining);
        remaining -= size;
        stats.pulled += size;
        controller.enqueue(new Uint8Array(size));
      },
      cancel() {
        stats.cancelled = true;
      },
    },
    { highWaterMark: 0 },
  );
  return { stream, stats };
}

function upload(body: BodyInit, headers: Record<string, string> = {}) {
  return new Request(URL, {
    method: "POST",
    headers: { authorization: "Bearer cap-test", ...headers },
    body,
    duplex: "half",
  } as RequestInit);
}

async function expect413(response: Response) {
  expect(response.status).toBe(413);
  expect(await response.json()).toEqual({ error: expect.any(String) });
  expect(h.upload).not.toHaveBeenCalled();
}

beforeEach(() => {
  vi.resetAllMocks();
  h.auth.mockResolvedValue({
    userId: "22222222-2222-4222-8222-222222222222",
    tenantId: "11111111-1111-4111-8111-111111111111",
    profileId: "33333333-3333-4333-8333-333333333333",
    email: "caller@example.test",
    role: "donor",
    profileRole: "donor",
    memberships: [],
    isAuthenticated: true,
  });
  h.upload.mockResolvedValue({ data: {}, error: null });
  h.client.mockReturnValue({
    storage: {
      from: () => ({
        upload: h.upload,
        getPublicUrl: (path: string) => ({
          data: { publicUrl: `https://storage.example/${path}` },
        }),
      }),
    },
  });
});
afterEach(() => vi.restoreAllMocks());

describe("#2308 upload body cap", () => {
  it("allows the file cap plus a bounded multipart allowance", () => {
    expect(MAX_UPLOAD_BODY_BYTES).toBeGreaterThan(MAX_PROFILE_IMAGE_BYTES);
    expect(MAX_UPLOAD_BODY_BYTES - MAX_PROFILE_IMAGE_BYTES).toBeLessThanOrEqual(
      64 * 1024,
    );
  });

  it("returns 413 for an over-limit Content-Length without reading the body", async () => {
    const { stream, stats } = trackedStream(64 * MiB);
    const request = upload(stream, {
      "content-type": MULTIPART,
      "content-length": String(MAX_UPLOAD_BODY_BYTES + 1),
    });

    await expect413(await POST(request));
    expect(stats.pulled).toBe(0);
  });

  it.each([
    ["missing", {}],
    ["understated", { "content-length": "1024" }],
  ])(
    "aborts an oversized stream with 413 when Content-Length is %s",
    async (_label, lengthHeader: Record<string, string>) => {
      const { stream, stats } = trackedStream(64 * MiB);
      const request = upload(stream, {
        "content-type": MULTIPART,
        ...lengthHeader,
      });

      await expect413(await POST(request));
      expect(stats.pulled).toBeLessThanOrEqual(MAX_UPLOAD_BODY_BYTES + MiB);
      expect(stats.cancelled).toBe(true);
    },
  );

  it("reads a body of exactly the limit and rejects one byte more", async () => {
    const atLimit = trackedStream(MAX_UPLOAD_BODY_BYTES, 64 * 1024);
    const atLimitResponse = await POST(
      upload(atLimit.stream, { "content-type": MULTIPART }),
    );
    // Not multipart, so it fails to parse; the cap did not reject it.
    expect(atLimitResponse.status).toBe(400);
    expect(atLimit.stats.pulled).toBe(MAX_UPLOAD_BODY_BYTES);

    const overLimit = trackedStream(MAX_UPLOAD_BODY_BYTES + 1, 64 * 1024);
    await expect413(
      await POST(upload(overLimit.stream, { "content-type": MULTIPART })),
    );
  });

  it.each([
    ["an accurate", true],
    ["no", false],
  ])(
    "stores an exact-cap file with %s Content-Length",
    async (_label, withLength) => {
      const { bytes, contentType } = await encodedForm(
        webp(MAX_PROFILE_IMAGE_BYTES),
      );
      const headers: Record<string, string> = { "content-type": contentType };
      if (withLength) headers["content-length"] = String(bytes.byteLength);

      const response = await POST(upload(bytes, headers));

      expect(response.status).toBe(201);
      expect(h.upload).toHaveBeenCalledTimes(1);
      const stored = h.upload.mock.calls[0]![1] as File;
      expect(stored.size).toBe(MAX_PROFILE_IMAGE_BYTES);
    },
  );

  it("keeps the per-file 413 for a cap + 1 file inside the body limit", async () => {
    const { bytes, contentType } = await encodedForm(
      webp(MAX_PROFILE_IMAGE_BYTES + 1),
    );
    expect(bytes.byteLength).toBeLessThanOrEqual(MAX_UPLOAD_BODY_BYTES);

    await expect413(
      await POST(
        upload(bytes, {
          "content-type": contentType,
          "content-length": String(bytes.byteLength),
        }),
      ),
    );
  });
});
