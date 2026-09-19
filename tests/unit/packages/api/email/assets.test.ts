import { createHash } from "node:crypto";
import { type NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  getAuthContextMock,
  requireRoleMock,
  getAdminClientMock,
  uploadMock,
  getPublicUrlMock,
  storageFromMock,
  serverEnv,
  clientEnv,
} = vi.hoisted(() => {
  const upload = vi.fn().mockResolvedValue({ data: null, error: null });
  const getPublicUrl = vi.fn(() => ({
    data: { publicUrl: "https://storage.example/email-assets/file.png" },
  }));
  const storageFrom = vi.fn(() => ({ upload, getPublicUrl }));
  return {
    getAuthContextMock: vi.fn(),
    requireRoleMock: vi.fn(),
    getAdminClientMock: vi.fn(),
    uploadMock: upload,
    getPublicUrlMock: getPublicUrl,
    storageFromMock: storageFrom,
    serverEnv: {
      NEXT_PUBLIC_CLOUDINARY_ENABLED: false as boolean,
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "demo",
      NEXT_PUBLIC_CLOUDINARY_API_KEY: "1234",
      CLOUDINARY_API_SECRET: "abcd",
    },
    clientEnv: {
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "demo",
      NEXT_PUBLIC_CLOUDINARY_API_KEY: "1234",
      NEXT_PUBLIC_CLOUDINARY_ENABLED: true,
    },
  };
});

vi.mock("@asym/auth/context", () => ({
  getAuthContext: getAuthContextMock,
  requireRole: requireRoleMock,
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: getAdminClientMock,
}));

vi.mock("@asym/env", () => ({
  serverEnv,
  clientEnv,
}));

import { POST } from "../../../../../packages/api/src/email/assets";

function createUploadRequest(
  file: File,
  templateId = "template_1",
): NextRequest {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("templateId", templateId);

  return new Request("https://example.com/api/email/assets/upload", {
    method: "POST",
    body: formData,
  }) as NextRequest;
}

describe("api/email/assets/upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serverEnv.NEXT_PUBLIC_CLOUDINARY_ENABLED = false;
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("uuid-1234");
    getAuthContextMock.mockResolvedValue({
      tenantId: "tenant_1",
      profileId: "profile_1",
      role: "admin",
    });
    requireRoleMock.mockReturnValue(undefined);
    getAdminClientMock.mockReturnValue({
      client: {
        storage: {
          from: storageFromMock,
        },
      },
      error: null,
    });
  });

  it("rejects unsupported image MIME types", async () => {
    const response = await POST(
      createUploadRequest(
        new File(["not an image"], "file.svg", { type: "image/svg+xml" }),
      ),
    );
    const body = await response.json();

    expect(response.status).toBe(415);
    expect(body.error).toContain("Unsupported image type");
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it("stores images in tenant-scoped Supabase Storage paths", async () => {
    const response = await POST(
      createUploadRequest(
        new File(["png"], "hero.png", { type: "image/png" }),
        "template_9",
      ),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.url).toBe("https://storage.example/email-assets/file.png");
    expect(body.asset.url).toBe(
      "https://storage.example/email-assets/file.png",
    );
    expect(storageFromMock).toHaveBeenCalledWith("email-assets");
    expect(uploadMock).toHaveBeenCalledWith(
      "email-assets/tenant_1/template_9/uuid-1234.png",
      expect.any(File),
      expect.objectContaining({ contentType: "image/png" }),
    );
    expect(getPublicUrlMock).toHaveBeenCalledWith(
      "email-assets/tenant_1/template_9/uuid-1234.png",
    );
  });
});

describe("api/email/assets/upload Cloudinary signature", () => {
  afterEach(() => {
    serverEnv.NEXT_PUBLIC_CLOUDINARY_ENABLED = false;
    vi.useRealTimers();
  });

  it("signs live Cloudinary uploads with SHA-256 and signature_algorithm", async () => {
    serverEnv.NEXT_PUBLIC_CLOUDINARY_ENABLED = true;
    vi.useFakeTimers();
    vi.setSystemTime(new Date(1315060510 * 1000));
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("uuid-1234");
    getAuthContextMock.mockResolvedValue({
      tenantId: "tenant_1",
      profileId: "profile_1",
      role: "admin",
    });
    requireRoleMock.mockReturnValue(undefined);

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        secure_url:
          "https://res.cloudinary.com/demo/image/upload/uuid-1234.png",
        public_id: "email-assets/tenant_1/template_1/uuid-1234",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      createUploadRequest(new File(["png"], "hero.png", { type: "image/png" })),
    );

    expect(response.status).toBe(201);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [, init] = fetchMock.mock.calls[0] as [string, { body: FormData }];
    const uploaded = init.body;
    expect(uploaded.get("signature_algorithm")).toBe("sha256");

    const stringToSign =
      "folder=email-assets/tenant_1/template_1&public_id=uuid-1234&signature_algorithm=sha256&timestamp=1315060510abcd";
    expect(uploaded.get("signature")).toBe(
      createHash("sha256").update(stringToSign).digest("hex"),
    );
    expect(String(uploaded.get("signature"))).toHaveLength(64);
  });
});
