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
  envState,
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
    envState: {
      NEXT_PUBLIC_CLOUDINARY_ENABLED: false as boolean,
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: undefined as string | undefined,
      NEXT_PUBLIC_CLOUDINARY_API_KEY: undefined as string | undefined,
      CLOUDINARY_API_SECRET: undefined as string | undefined,
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
  serverEnv: envState,
  clientEnv: envState,
}));

import { POST } from "../../../../../packages/api/src/email/assets";
import { generateCloudinarySignature } from "../../../../../packages/lib/cloudinary-server";

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

function resetEnv() {
  envState.NEXT_PUBLIC_CLOUDINARY_ENABLED = false;
  envState.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = undefined;
  envState.NEXT_PUBLIC_CLOUDINARY_API_KEY = undefined;
  envState.CLOUDINARY_API_SECRET = undefined;
}

describe("api/email/assets/upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetEnv();
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

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
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

  it("returns 503 when Cloudinary is enabled but not fully configured", async () => {
    envState.NEXT_PUBLIC_CLOUDINARY_ENABLED = true;
    const fetchMock = vi.spyOn(globalThis, "fetch");

    const response = await POST(
      createUploadRequest(new File(["png"], "hero.png", { type: "image/png" })),
    );
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error).toBe(
      "Cloudinary image upload is enabled but not fully configured.",
    );
    expect(fetchMock).not.toHaveBeenCalled();
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it("signs live Cloudinary uploads with SHA-256 via generateCloudinarySignature", async () => {
    envState.NEXT_PUBLIC_CLOUDINARY_ENABLED = true;
    envState.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = "demo";
    envState.NEXT_PUBLIC_CLOUDINARY_API_KEY = "1234";
    envState.CLOUDINARY_API_SECRET = "abcd";

    vi.useFakeTimers();
    vi.setSystemTime(new Date(1315060510 * 1000));

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          secure_url:
            "https://res.cloudinary.com/demo/image/upload/v1/email-assets/tenant_1/template_1/uuid-1234.png",
          public_id: "email-assets/tenant_1/template_1/uuid-1234",
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );

    const expected = generateCloudinarySignature({
      folder: "email-assets/tenant_1/template_1",
      public_id: "uuid-1234",
    });
    const liveStringToSign =
      "folder=email-assets/tenant_1/template_1&public_id=uuid-1234&timestamp=1315060510abcd";
    const independentLiveDigest = createHash("sha256")
      .update(liveStringToSign)
      .digest("hex");
    const sha1OfOfficialString = createHash("sha1")
      .update(liveStringToSign)
      .digest("hex");

    const response = await POST(
      createUploadRequest(new File(["png"], "hero.png", { type: "image/png" })),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.url).toBe(
      "https://res.cloudinary.com/demo/image/upload/v1/email-assets/tenant_1/template_1/uuid-1234.png",
    );
    expect(body.asset.provider).toBe("cloudinary");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe("https://api.cloudinary.com/v1_1/demo/image/upload");
    expect(init).toMatchObject({ method: "POST" });

    const uploaded = init?.body as FormData;
    const signature = String(uploaded.get("signature"));
    const reservedUploadKeys = new Set([
      "file",
      "resource_type",
      "api_key",
      "signature",
      "signature_algorithm",
    ]);
    expect(independentLiveDigest).toBe(
      "54071de8e8ab0810fa44e425dc682d2caa5982f50f470ec1a7cdddcb8970ccc3",
    );
    expect(signature).toHaveLength(64);
    expect(signature).toBe(independentLiveDigest);
    expect(signature).toBe(expected.signature);
    expect(signature).not.toBe(sha1OfOfficialString);
    expect(uploaded.get("api_key")).toBe(expected.apiKey);
    expect(uploaded.get("timestamp")).toBe(String(expected.timestamp));
    expect(uploaded.get("folder")).toBe("email-assets/tenant_1/template_1");
    expect(uploaded.get("public_id")).toBe("uuid-1234");
    expect(uploaded.get("signature_algorithm")).toBe(
      expected.signatureAlgorithm,
    );
    expect(
      [...uploaded.keys()]
        .filter((key) => !reservedUploadKeys.has(key))
        .toSorted(),
    ).toEqual(["folder", "public_id", "timestamp"]);
    expect(uploadMock).not.toHaveBeenCalled();
  });
});
