/**
 * #2407 PR (a) criterion 18 (B): POST /api/upload/editor-image handler.
 * Validation and role checks run before any storage call; the key and client
 * come from the auth context; status mapping; missionary mount refuses care.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  adminPOST,
  missionaryPOST,
} from "../../../../../packages/api/src/upload/editor-image";

import type * as AuthModule from "@asym/auth/context";

const h = vi.hoisted(() => ({
  auth: vi.fn(),
  client: vi.fn(),
  from: vi.fn(),
  upload: vi.fn(),
}));
vi.mock("@asym/auth/context", async (importOriginal) => ({
  ...(await importOriginal<typeof AuthModule>()),
  getAuthContext: h.auth,
  createBearerSupabaseClient: h.client,
}));

const TENANT = "11111111-1111-4111-8111-111111111111";
const USER = "22222222-2222-4222-8222-222222222222";
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function ctx(profileRole: string, isAuthenticated = true) {
  return {
    userId: USER,
    tenantId: TENANT,
    profileId: USER,
    email: "u@example.test",
    role: profileRole,
    profileRole,
    memberships: [],
    isAuthenticated,
  } as unknown as AuthModule.AuthContext;
}

function req(
  fields: Record<string, string | File> = {},
  token: string | null = "tok",
) {
  const form = new FormData();
  form.set("purpose", "feed");
  form.set(
    "file",
    new File([new Uint8Array(PNG)], "x.svg", { type: "image/png" }),
  );
  for (const [k, v] of Object.entries(fields)) form.set(k, v);
  return new Request("http://localhost/api/upload/editor-image", {
    method: "POST",
    headers: token ? { authorization: `Bearer ${token}` } : {},
    body: form,
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  h.auth.mockResolvedValue(ctx("missionary"));
  h.client.mockReturnValue({ storage: { from: h.from } });
  h.from.mockReturnValue({
    upload: h.upload,
    getPublicUrl: (p: string) => ({ data: { publicUrl: `https://cdn/${p}` } }),
  });
  h.upload.mockResolvedValue({ data: {}, error: null });
});

describe("#2407a upload/editor-image handler (B)", () => {
  it.each([
    ["no bearer", () => req({}, null), 401],
    ["no public config", () => (h.client.mockReturnValue(null), req()), 503],
    [
      "unresolved session",
      () => (h.auth.mockResolvedValue(ctx("missionary", false)), req()),
      401,
    ],
    ["unknown purpose", () => req({ purpose: "covers" }), 400],
    ["donor feed", () => (h.auth.mockResolvedValue(ctx("donor")), req()), 403],
    ["missing file", () => req({ file: "not a file" }), 400],
    [
      "svg",
      () =>
        req({ file: new File(["<svg/>"], "a.svg", { type: "image/svg+xml" }) }),
      415,
    ],
    ["missionary care-note on admin", () => req({ purpose: "care-note" }), 403],
  ] as const)("%s -> %i with no storage call", async (_label, make, status) => {
    const res = await adminPOST(make());
    expect(res.status).toBe(status);
    expect(await res.json()).toEqual({ error: expect.any(String) });
    expect(h.from).not.toHaveBeenCalled();
  });

  it.each(["care-thread", "care-note"])(
    "missionary mount refuses %s even for a super_admin (M22)",
    async (purpose) => {
      h.auth.mockResolvedValue(ctx("super_admin"));
      const res = await missionaryPOST(req({ purpose }));
      expect(res.status).toBe(403);
      expect(h.client).toHaveBeenCalledWith("tok");
      expect(h.from).not.toHaveBeenCalled();
    },
  );

  it.each([
    [adminPOST, "feed", "missionary"],
    [missionaryPOST, "feed", "missionary"],
    [adminPOST, "care-thread", "staff"],
    [adminPOST, "care-note", "admin"],
  ] as const)(
    "stores %#: %s from %s under the caller's folder",
    async (post, purpose, role) => {
      h.auth.mockResolvedValue(ctx(role));
      const res = await post(
        req({ purpose, path: "evil", bucket: "profiles" }),
      );
      expect(res.status).toBe(201);
      const body = (await res.json()) as { url: string; path: string };
      expect(body.path).toMatch(
        new RegExp(`^editor/${TENANT}/${USER}/[0-9a-f-]{36}\\.png$`),
      );
      expect(body.url).toBe(`https://cdn/${body.path}`);
      expect(h.client).toHaveBeenCalledWith("tok");
      expect(h.from.mock.calls).toEqual([["document-uploads"]]);
      expect(h.upload).toHaveBeenCalledWith(body.path, expect.any(File), {
        contentType: "image/png",
        upsert: false,
      });
    },
  );

  it("maps a storage failure to a generic 502", async () => {
    h.upload.mockRejectedValue(new Error("bucket secret"));
    const res = await adminPOST(req());
    expect(res.status).toBe(502);
    expect(JSON.stringify(await res.json())).not.toContain("bucket secret");
  });
});
