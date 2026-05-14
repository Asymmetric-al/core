import { type NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getAuthContextMock,
  requireRoleMock,
  getAdminClientMock,
  uploadMock,
  getPublicUrlMock,
  storageFromMock,
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
  serverEnv: {
    NEXT_PUBLIC_CLOUDINARY_ENABLED: false,
  },
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
