/**
 * #2308 spec r1 §4 C1–C10; Samson approval comment 6420148722.
 * Owned by Acceptance. Builder must not edit these tests to satisfy the feature.
 * Fake auth/client boundary only: no live Storage/Auth and no realstack file.
 */
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type * as AuthModule from "@asym/auth/context";

const h = vi.hoisted(() => ({
  auth: vi.fn(),
  client: vi.fn(),
  from: vi.fn(),
  upload: vi.fn(),
  publicUrl: vi.fn(),
  remove: vi.fn(),
}));
vi.mock("@asym/auth/context", async (importOriginal) => ({
  ...(await importOriginal<typeof AuthModule>()),
  getAuthContext: h.auth,
  createBearerSupabaseClient: h.client,
}));

const handler = fileURLToPath(
  new URL("../../../../packages/api/src/upload/image.ts", import.meta.url),
);
const TOKEN = "acceptance-caller-token";
const TENANT = "11111111-1111-4111-8111-111111111111";
const USER = "22222222-2222-4222-8222-222222222222";
const publicUrl = (key: string) => `https://storage.example/profiles/${key}`;
const signatures = {
  "image/jpeg": [0xff, 0xd8, 0xff, 0xe0],
  "image/png": [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  "image/gif": [...Buffer.from("GIF89a")],
  "image/webp": [...Buffer.from("RIFF\0\0\0\0WEBP")],
};
function image(type = "image/webp", size = 1024) {
  const bytes = new Uint8Array(size);
  // A 1×1 WebP, padded to the requested cropped-upload size.
  bytes.set(
    type === "image/webp"
      ? Buffer.from(
          "UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",
          "base64",
        )
      : signatures[type as keyof typeof signatures],
  );
  if (type === "image/webp")
    new DataView(bytes.buffer).setUint32(4, size - 8, true);
  return new File([bytes], "untrusted-name.png", { type });
}
function request({
  file = image(),
  path = "avatars",
  bucket = "profiles",
  token = TOKEN,
  cookie = "",
}: {
  file?: File | null;
  path?: string;
  bucket?: string | null;
  token?: string | null;
  cookie?: string;
} = {}) {
  const form = new FormData();
  if (file) form.set("file", file);
  form.set("path", path);
  if (bucket !== null) form.set("bucket", bucket);
  // Spoofed identity fields must never determine storage ownership.
  form.set("tenantId", "other-tenant");
  form.set("userId", "other-user");
  const headers = new Headers({ cookie });
  if (token !== null) headers.set("authorization", `Bearer ${token}`);
  return new Request("http://localhost:4000/api/upload/image", {
    method: "POST",
    headers,
    body: form,
  });
}
async function post(req: Request) {
  expect(existsSync(handler), "C1–C10: shared upload handler is missing").toBe(
    true,
  );
  const { POST } = await import(/* @vite-ignore */ handler);
  return POST(req) as Promise<Response>;
}
async function rejected(req: Request, status: number) {
  const response = await post(req);
  expect(response.status).toBe(status);
  expect(response.headers.get("content-type")).toContain("application/json");
  expect(await response.json()).toEqual({ error: expect.any(String) });
  expect(h.upload).not.toHaveBeenCalled();
}
async function stored(req: Request, purpose = "avatars", ext = "webp") {
  const response = await post(req);
  expect(response.status).toBe(201);
  const body = await response.json();
  expect(body).toEqual({ path: expect.any(String), url: publicUrl(body.path) });
  expect(body.path).toMatch(
    new RegExp(
      `^${purpose}/${TENANT}/${USER}/[a-f\\d]{8}(?:-[a-f\\d]{4}){3}-[a-f\\d]{12}\\.${ext}$`,
      "i",
    ),
  );
  expect(h.client).toHaveBeenCalledWith(TOKEN);
  expect(h.from).toHaveBeenCalledWith("profiles");
  expect(h.from.mock.calls.every(([bucket]) => bucket === "profiles")).toBe(
    true,
  );
  expect(h.upload).toHaveBeenCalledTimes(1);
  expect(h.upload).toHaveBeenCalledWith(
    body.path,
    expect.anything(),
    expect.objectContaining({
      contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
      upsert: false,
    }),
  );
  expect(h.publicUrl).toHaveBeenCalledWith(body.path);
  expect(h.remove).not.toHaveBeenCalled();
}

let context: AuthModule.AuthContext;
beforeEach(() => {
  vi.resetAllMocks();
  context = {
    userId: USER,
    tenantId: TENANT,
    profileId: "33333333-3333-4333-8333-333333333333",
    email: "caller@example.test",
    role: "donor",
    profileRole: "donor",
    memberships: [],
    isAuthenticated: true,
  };
  h.auth.mockImplementation(async () => context);
  h.client.mockReturnValue({ storage: { from: h.from } });
  h.from.mockReturnValue({
    upload: h.upload,
    getPublicUrl: h.publicUrl,
    remove: h.remove,
  });
  h.upload.mockImplementation(async (path: string) => ({
    data: { path },
    error: null,
  }));
  h.publicUrl.mockImplementation((key: string) => ({
    data: { publicUrl: publicUrl(key) },
  }));
  vi.spyOn(globalThis, "fetch").mockRejectedValue(
    new Error("No live services"),
  );
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("#2308 missionary avatar and cover uploads (A)", () => {
  it.each(["", "asym_e2e_auth_missionary=fake-signed-session"])(
    "C1: missing bearer returns 401 before auth/client lookup, cookie=%s",
    async (cookie) => {
      await rejected(request({ token: null, cookie }), 401);
      expect(h.auth).not.toHaveBeenCalled();
      expect(h.client).not.toHaveBeenCalled();
    },
  );
  it.each(["invalid-token", "unresolvable-bearer"])(
    "C2: rejected bearer %s returns 401 without storage",
    async (token) => {
      context.isAuthenticated = false;
      await rejected(request({ token }), 401);
      expect(h.auth).toHaveBeenCalled();
      expect(h.from).not.toHaveBeenCalled();
    },
  );
  it("C3: donor avatar stores the 1 KB crop under caller authority and returns 201 { url, path }", async () => {
    const file = image();
    const req = request({ file });
    await stored(req);
    expect(h.auth).toHaveBeenCalledWith(req);
    const uploaded = h.upload.mock.calls[0]![1];
    expect(await new Response(uploaded).arrayBuffer()).toEqual(
      await file.arrayBuffer(),
    );
  });
  it.each(["avatars/../covers", "other-user"])(
    "C4: client path %s cannot reach the object key",
    async (path) => rejected(request({ path }), 400),
  );
  it.each(["email-assets", "arbitrary-bucket"])(
    "C5: bucket %s is rejected",
    async (bucket) => rejected(request({ bucket }), 400),
  );
  it("C5: missing bucket defaults to profiles", async () => {
    await stored(request({ bucket: null }));
  });
  it("C6: missionary-role caller may upload a cover", async () => {
    context.role = context.profileRole = "missionary";
    await stored(request({ path: "covers" }), "covers");
  });
  it("C6: a cover upload from a non-missionary gets 403", async () => {
    await rejected(request({ path: "covers" }), 403);
  });
  it("C7: missing file returns 400", async () => {
    await rejected(request({ file: null }), 400);
  });
  it("C7: text/plain returns 415", async () => {
    await rejected(
      request({ file: new File(["text"], "text.txt", { type: "text/plain" }) }),
      415,
    );
  });
  it("C7: PNG declaration with non-PNG bytes returns 415", async () => {
    await rejected(
      request({
        file: new File(["not PNG"], "fake.png", { type: "image/png" }),
      }),
      415,
    );
  });
  it.each([
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"],
    ["image/gif", "gif"],
  ])("C8: matching %s bytes store with extension %s", async (type, ext) => {
    await stored(request({ file: image(type) }), "avatars", ext);
  });
  it("C9: the 5 MB cap applies to the cropped upload: exactly 5 MB succeeds", async () => {
    const { MAX_PROFILE_IMAGE_BYTES } = await import(
      /* @vite-ignore */ handler
    );
    const file = image("image/webp", MAX_PROFILE_IMAGE_BYTES);
    expect(file.size).toBe(5 * 1024 * 1024);
    await stored(request({ file }));
    expect(h.upload.mock.calls[0]![1].size).toBe(MAX_PROFILE_IMAGE_BYTES);
  });
  it("C9: a cropped upload of 5 MB + 1 byte returns 413", async () => {
    await rejected(
      request({ file: image("image/webp", 5 * 1024 * 1024 + 1) }),
      413,
    );
  });
  it("C10: storage rejection returns generic 502 { error }", async () => {
    h.upload.mockResolvedValue({
      data: null,
      error: { message: "private detail" },
    });
    const response = await post(request());
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "Image upload failed." });
    expect(h.upload).toHaveBeenCalledTimes(1);
  });
  it.each(["url", "key"])(
    "C10: missing public config %s returns 503",
    async (part) => {
      vi.stubEnv(
        "NEXT_PUBLIC_SUPABASE_URL",
        part === "url" ? "" : "https://example.supabase.co",
      );
      vi.stubEnv(
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        part === "key" ? "" : "test-anon",
      );
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
      h.client.mockReturnValue(null);
      await rejected(request(), 503);
    },
  );
});

// Acceptance r1: valid multipart with a small image and excessive text padding
// separates the whole-body budget from the existing per-file size contract.
const BODY_CAP = 5 * 1024 * 1024 + 64 * 1024;
const CHUNK_BYTES = 16 * 1024;
async function observedBody(declaredLength?: string) {
  const form = await request().formData();
  form.set("padding", "x".repeat(BODY_CAP + 3 * CHUNK_BYTES));
  const encoded = new Response(form);
  const bytes = new Uint8Array(await encoded.arrayBuffer());
  const observed = { reads: 0, bytes: 0, cancelled: false };
  const body = new ReadableStream<Uint8Array>(
    {
      pull(controller) {
        observed.reads++;
        if (observed.bytes === bytes.length) return controller.close();
        const end = Math.min(observed.bytes + CHUNK_BYTES, bytes.length);
        controller.enqueue(bytes.subarray(observed.bytes, end));
        observed.bytes = end;
      },
      cancel() {
        observed.cancelled = true;
      },
    },
    // Prevent speculative pulls: only the handler can initiate a read.
    { highWaterMark: 0 },
  );
  const headers = new Headers({
    authorization: `Bearer ${TOKEN}`,
    "content-type": encoded.headers.get("content-type")!,
  });
  if (declaredLength !== undefined)
    headers.set("content-length", declaredLength);
  const req = new Request("http://localhost:4000/api/upload/image", {
    method: "POST",
    headers,
    body,
    duplex: "half",
  } as RequestInit);
  return { req, observed };
}

describe("#2308 body-cap acceptance (A)", () => {
  it("pins the body budget to 5 MiB plus 64 KiB of multipart overhead", async () => {
    const limits = await import(/* @vite-ignore */ handler);
    expect(limits.MULTIPART_OVERHEAD_ALLOWANCE_BYTES).toBe(64 * 1024);
    expect(limits.MAX_UPLOAD_BODY_BYTES).toBe(BODY_CAP);
  });

  it("rejects declared cap + 1 with 413 before any pull or storage access", async () => {
    const { req, observed } = await observedBody(String(BODY_CAP + 1));
    const response = await post(req);
    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({
      error: "Image file must be 5 MB or smaller.",
    });
    expect(observed.reads).toBe(0);
    expect(observed.bytes).toBe(0);
    expect(h.from).not.toHaveBeenCalled();
    expect(h.upload).not.toHaveBeenCalled();
  });

  it.each([
    ["missing", undefined],
    ["understated", "1000"],
  ])(
    "caps valid multipart when Content-Length is %s",
    async (_label, length) => {
      const { req, observed } = await observedBody(length);
      await rejected(req, 413);
      expect(observed.bytes).toBeGreaterThan(BODY_CAP);
      expect(observed.bytes).toBeLessThanOrEqual(BODY_CAP + CHUNK_BYTES);
      expect(observed.cancelled).toBe(true);
      expect(h.from).not.toHaveBeenCalled();
    },
  );

  it("returns 401 for rejected auth before checking an oversized declaration", async () => {
    context.isAuthenticated = false;
    const { req, observed } = await observedBody(String(BODY_CAP + 1));
    await rejected(req, 401);
    expect(h.auth).toHaveBeenCalledWith(req);
    expect(observed.reads).toBe(0);
    expect(observed.bytes).toBe(0);
    expect(h.from).not.toHaveBeenCalled();
  });
});
