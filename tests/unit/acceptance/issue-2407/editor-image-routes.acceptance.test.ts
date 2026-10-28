/**
 * #2407 PR (a) criteria 12 and 23 [A]: POST /api/upload/editor-image on the
 * admin and missionary mounts, through each app's route module (dynamic
 * import, so the file loads on develop and each case fails on its own).
 * Seams (same as issue-2308/upload-image): @asym/auth/context getAuthContext
 * and createBearerSupabaseClient are mocked; storage is a recorder.
 * Mutants: M13 (client text in key / upsert) c12 success cases, M14 c12
 * type/size cases, M22 criterion 23.
 */
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BUCKET, DEMO } from "./harness";

import type * as AuthModule from "@asym/auth/context";

const h = vi.hoisted(() => ({
  auth: vi.fn(),
  client: vi.fn(),
  from: vi.fn(),
  upload: vi.fn(),
  publicUrl: vi.fn(),
}));
vi.mock("@asym/auth/context", async (importOriginal) => ({
  ...(await importOriginal<typeof AuthModule>()),
  getAuthContext: h.auth,
  createBearerSupabaseClient: h.client,
}));

const MOUNTS = ["admin", "missionary"] as const;
type Mount = (typeof MOUNTS)[number];
const route = (mount: Mount) =>
  `apps/${mount}/app/api/upload/editor-image/route.ts`;
const TOKEN = "acceptance-caller-token";
const TENANT = "11111111-1111-4111-8111-111111111111";
const USER = "22222222-2222-4222-8222-222222222222";
const UUID = "[a-f\\d]{8}(?:-[a-f\\d]{4}){3}-[a-f\\d]{12}";
const publicUrl = (key: string) => `https://storage.example/${BUCKET}/${key}`;
const signatures = {
  "image/jpeg": [0xff, 0xd8, 0xff, 0xe0],
  "image/png": [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  "image/gif": [...Buffer.from("GIF89a")],
  "image/webp": [...Buffer.from("RIFF\0\0\0\0WEBP")],
};
/** Signature-valid bytes of `type`; the client file name always lies (.html). */
function image(type: keyof typeof signatures = "image/webp", size = 1024) {
  const bytes = new Uint8Array(size);
  bytes.set(signatures[type]);
  return new File([bytes], "client-name.html", { type });
}
type Actor =
  | "staff"
  | "admin"
  | "super_admin"
  | "super_admin (no tenant)"
  | "missionary"
  | "donor";
const ACTORS: Actor[] = [
  "staff",
  "admin",
  "super_admin",
  "super_admin (no tenant)",
  "missionary",
  "donor",
];
const STAFFISH: Actor[] = [
  "staff",
  "admin",
  "super_admin",
  "super_admin (no tenant)",
];
/** AuthContext per actor; ctx.tenantId is the demo tenant for S (context.ts:281-300). */
function ctxFor(actor: Actor): AuthModule.AuthContext {
  const role = actor.startsWith("super_admin") ? "super_admin" : actor;
  const staff = actor === "staff";
  return {
    userId: USER,
    tenantId: actor === "super_admin (no tenant)" ? DEMO : TENANT,
    profileId: "33333333-3333-4333-8333-333333333333",
    email: "caller@example.test",
    role,
    profileRole: staff ? "donor" : role,
    memberships: staff
      ? [
          {
            tenantId: TENANT,
            role: "staff",
            staffRole: "finance",
            isActive: true,
          },
        ]
      : [],
    isAuthenticated: true,
  };
}
function request({
  file = image() as File | null,
  purpose = "feed" as string | null,
  token = TOKEN as string | null,
  length = undefined as string | undefined,
} = {}) {
  const form = new FormData();
  if (file) form.set("file", file);
  if (purpose !== null) form.set("purpose", purpose);
  // Client text that must never reach the key or bucket.
  for (const [k, v] of Object.entries({
    path: "../../evil",
    bucket: "profiles",
    name: "evil",
    tenantId: "other-tenant",
    userId: "other-user",
  }))
    form.set(k, v);
  const headers = new Headers();
  if (token !== null) headers.set("authorization", `Bearer ${token}`);
  if (length !== undefined) headers.set("content-length", length);
  return new Request("http://localhost:4000/api/upload/editor-image", {
    method: "POST",
    headers,
    body: form,
  });
}
async function post(mount: Mount, req: Request) {
  expect(
    existsSync(route(mount)),
    `${route(mount)} missing: #2407a upload route not implemented`,
  ).toBe(true);
  const mod = await import(
    /* @vite-ignore */ fileURLToPath(
      new URL(`../../../../${route(mount)}`, import.meta.url),
    )
  );
  return (mod as { POST: (r: Request) => Promise<Response> }).POST(req);
}
async function rejected(mount: Mount, req: Request, status: number) {
  const response = await post(mount, req);
  expect(response.status).toBe(status);
  expect(await response.json()).toEqual({ error: expect.any(String) });
  expect(h.upload).not.toHaveBeenCalled();
}
/** Interim (a): every purpose lands at editor/{ctx.tenantId}/{ctx.userId}/{uuid}.{ext} with a public URL. */
async function stored(
  mount: Mount,
  req: Request,
  ext = "webp",
  tenant = TENANT,
) {
  const response = await post(mount, req);
  expect(response.status).toBe(201);
  const body = await response.json();
  expect(body).toEqual({ path: expect.any(String), url: publicUrl(body.path) });
  expect(body.path).toMatch(
    new RegExp(`^editor/${tenant}/${USER}/${UUID}\\.${ext}$`),
  );
  expect(h.client).toHaveBeenCalledWith(TOKEN);
  expect(h.from.mock.calls.map(([b]) => b)).toEqual([BUCKET]);
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
}

beforeEach(() => {
  vi.resetAllMocks();
  h.auth.mockImplementation(async () => ctxFor("missionary"));
  h.client.mockReturnValue({ storage: { from: h.from } });
  h.from.mockReturnValue({ upload: h.upload, getPublicUrl: h.publicUrl });
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

describe.each(MOUNTS)("#2407a criterion 12 [A] %s mount", (mount) => {
  it("#2407a criterion 12: no bearer returns 401 before auth or client lookup", async () => {
    await rejected(mount, request({ token: null }), 401);
    expect(h.auth).not.toHaveBeenCalled();
    expect(h.from).not.toHaveBeenCalled();
  });
  it("#2407a criterion 12: an unresolved bearer returns 401 without storage", async () => {
    h.auth.mockImplementation(async () => ({
      ...ctxFor("missionary"),
      isAuthenticated: false,
      userId: null,
    }));
    await rejected(mount, request({ token: "unresolvable" }), 401);
    expect(h.from).not.toHaveBeenCalled();
  });
  it("#2407a criterion 12: missing public config returns 503", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    h.client.mockReturnValue(null);
    await rejected(mount, request(), 503);
  });
  it.each([null, "avatars", "editor", "../feed", "FEED"])(
    "#2407a criterion 12: purpose %s returns 400",
    async (purpose) => {
      await rejected(mount, request({ purpose }), 400);
    },
  );
  it("#2407a criterion 12: feed from a donor returns 403 without storage", async () => {
    h.auth.mockImplementation(async () => ctxFor("donor"));
    await rejected(mount, request(), 403);
    expect(h.from).not.toHaveBeenCalled();
  });
  it("#2407a criterion 12: missing file returns 400", async () => {
    await rejected(mount, request({ file: null }), 400);
  });
  it.each([
    ["text/plain", new File(["text"], "t.txt", { type: "text/plain" })],
    ["image/svg+xml", new File(["<svg/>"], "t.svg", { type: "image/svg+xml" })],
    [
      "image/png declared over non-PNG bytes",
      new File(["not PNG"], "f.png", { type: "image/png" }),
    ],
  ])("#2407a criterion 12: %s returns 415 (M14)", async (_label, file) => {
    await rejected(mount, request({ file }), 415);
  });
  it("#2407a criterion 12: 5,242,880 bytes succeed; one more byte, or an oversize declared Content-Length, returns 413 before storage (M14)", async () => {
    await stored(mount, request({ file: image("image/webp", 5242880) }));
    h.from.mockClear();
    h.upload.mockClear();
    await rejected(mount, request({ file: image("image/webp", 5242881) }), 413);
    await rejected(mount, request({ length: String(6 * 1024 * 1024) }), 413);
    expect(h.from).not.toHaveBeenCalled();
  });
  it("#2407a criterion 12: a streamed body past the cap with an understated Content-Length returns 413 (M14)", async () => {
    const form = await request({
      file: image("image/webp", 5242880),
    }).formData();
    form.set("padding", "x".repeat(128 * 1024));
    const encoded = new Response(form);
    const bytes = new Uint8Array(await encoded.arrayBuffer());
    let sent = 0;
    const body = new ReadableStream<Uint8Array>({
      pull(c) {
        if (sent >= bytes.length) return c.close();
        c.enqueue(bytes.subarray(sent, (sent += 16 * 1024)));
      },
    });
    const headers = new Headers({
      authorization: `Bearer ${TOKEN}`,
      "content-type": encoded.headers.get("content-type")!,
      "content-length": "1000",
    });
    const req = new Request("http://localhost:4000/api/upload/editor-image", {
      method: "POST",
      headers,
      body,
      duplex: "half",
    } as RequestInit);
    await rejected(mount, req, 413);
    expect(h.from).not.toHaveBeenCalled();
  });
  it.each([
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/gif", "gif"],
    ["image/webp", "webp"],
  ] as const)(
    "#2407a criterion 12: feed %s stores editor/{tenant}/{user}/{uuid}.%s from the detected type, never the client name, path, bucket or ids (M13)",
    async (type, ext) => {
      const file = image(type);
      const req = request({ file });
      await stored(mount, req, ext);
      expect(h.auth).toHaveBeenCalledWith(req);
      const uploaded = h.upload.mock.calls[0]![1];
      expect(await new Response(uploaded).arrayBuffer()).toEqual(
        await file.arrayBuffer(),
      );
    },
  );
  it.each(STAFFISH)(
    "#2407a criterion 12: feed from %s succeeds",
    async (actor) => {
      h.auth.mockImplementation(async () => ctxFor(actor));
      await stored(
        mount,
        request(),
        "webp",
        actor === "super_admin (no tenant)" ? DEMO : TENANT,
      );
    },
  );
  it("#2407a criterion 12: storage failure returns a generic 502 that never echoes storage detail", async () => {
    h.upload.mockResolvedValue({
      data: null,
      error: { message: "private detail" },
    });
    const response = await post(mount, request());
    expect(response.status).toBe(502);
    const body = await response.json();
    expect(body).toEqual({ error: expect.any(String) });
    expect(body.error).not.toContain("private detail");
    expect(h.upload).toHaveBeenCalledTimes(1);
  });
});

describe("#2407a criterion 12 [A] admin mount, care purposes (interim r1.1)", () => {
  it.each(
    STAFFISH.flatMap((a) =>
      ["care-thread", "care-note"].map((p) => [p, a] as const),
    ),
  )(
    "#2407a criterion 12: %s from %s stores under editor/{ctx.tenantId}/{ctx.userId}/ in document-uploads with a public URL",
    async (purpose, actor) => {
      h.auth.mockImplementation(async () => ctxFor(actor));
      await stored(
        "admin",
        request({ purpose }),
        "webp",
        actor === "super_admin (no tenant)" ? DEMO : TENANT,
      );
    },
  );
  it.each([
    ["care-thread", "missionary"],
    ["care-thread", "donor"],
    ["care-note", "missionary"],
    ["care-note", "donor"],
  ] as const)(
    "#2407a criterion 12: %s from %s returns 403 without storage",
    async (purpose, actor) => {
      h.auth.mockImplementation(async () => ctxFor(actor));
      await rejected("admin", request({ purpose }), 403);
      expect(h.from).not.toHaveBeenCalled();
    },
  );
});

describe("#2407a criterion 23 [A] missionary mount refuses care purposes at the route (Chief condition d, M22)", () => {
  it.each(
    ACTORS.flatMap((a) =>
      ["care-thread", "care-note"].map((p) => [p, a] as const),
    ),
  )(
    "#2407a criterion 23: %s from %s returns 403 before any storage call",
    async (purpose, actor) => {
      h.auth.mockImplementation(async () => ctxFor(actor));
      await rejected("missionary", request({ purpose }), 403);
      expect(h.from).not.toHaveBeenCalled();
      expect(h.upload).not.toHaveBeenCalled();
    },
  );
});
