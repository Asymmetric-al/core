import { createHash } from "node:crypto";

import {
  getAuthContext,
  requireRole,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { serverEnv } from "@asym/env";
import { type NextRequest, NextResponse } from "next/server";

import { ApiHttpError, toErrorResponse } from "../shared/http-errors";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);
const SUPABASE_EMAIL_ASSETS_BUCKET = "email-assets";

async function requireAdminContext(
  request?: Request,
): Promise<AuthenticatedContext> {
  const auth = await getAuthContext(request);
  requireRole(auth, ["admin", "super_admin"]);
  return auth as AuthenticatedContext;
}

function getExtension(file: File): string {
  const explicit = file.name.split(".").pop()?.toLowerCase();
  if (explicit && /^[a-z0-9]{2,5}$/.test(explicit)) {
    return explicit === "jpeg" ? "jpg" : explicit;
  }

  switch (file.type) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "bin";
  }
}

function validateImageFile(value: FormDataEntryValue | null): File {
  if (!(value instanceof File)) {
    throw new ApiHttpError(400, "Image file is required.");
  }
  if (!ALLOWED_IMAGE_TYPES.has(value.type)) {
    throw new ApiHttpError(415, "Unsupported image type.");
  }
  if (value.size > MAX_IMAGE_BYTES) {
    throw new ApiHttpError(413, "Image file must be 5 MB or smaller.");
  }
  return value;
}

function getTenantAssetPath(input: {
  tenantId: string;
  templateId: string | null;
  file: File;
}): string {
  const templateSegment = input.templateId || "draft";
  const extension = getExtension(input.file);
  return `email-assets/${input.tenantId}/${templateSegment}/${crypto.randomUUID()}.${extension}`;
}

function isCloudinaryEnabled() {
  return serverEnv.NEXT_PUBLIC_CLOUDINARY_ENABLED === true;
}

function getCloudinarySignature(params: Record<string, string>) {
  const payload = Object.entries(params)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1")
    .update(`${payload}${serverEnv.CLOUDINARY_API_SECRET ?? ""}`)
    .digest("hex");
}

async function uploadToCloudinary(input: {
  ctx: AuthenticatedContext;
  templateId: string | null;
  file: File;
}) {
  const cloudName = serverEnv.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = serverEnv.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const apiSecret = serverEnv.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new ApiHttpError(
      503,
      "Cloudinary image upload is enabled but not fully configured.",
    );
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const publicId = crypto.randomUUID();
  const folder = `email-assets/${input.ctx.tenantId}/${
    input.templateId || "draft"
  }`;
  const signature = getCloudinarySignature({
    folder,
    public_id: publicId,
    timestamp,
  });
  const formData = new FormData();
  formData.set("file", input.file);
  formData.set("api_key", apiKey);
  formData.set("timestamp", timestamp);
  formData.set("folder", folder);
  formData.set("public_id", publicId);
  formData.set("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    throw new ApiHttpError(502, "Cloudinary image upload failed.");
  }

  const body = (await response.json()) as {
    secure_url?: string;
    public_id?: string;
  };
  if (!body.secure_url) {
    throw new ApiHttpError(502, "Cloudinary did not return an image URL.");
  }

  return {
    provider: "cloudinary" as const,
    url: body.secure_url,
    path: body.public_id ?? `${folder}/${publicId}`,
  };
}

async function uploadToSupabaseStorage(input: {
  ctx: AuthenticatedContext;
  templateId: string | null;
  file: File;
}) {
  const { client, error } = getAdminClient();
  if (!client) {
    throw new ApiHttpError(503, error || "Admin client unavailable");
  }

  const path = getTenantAssetPath({
    tenantId: input.ctx.tenantId,
    templateId: input.templateId,
    file: input.file,
  });
  const { error: uploadError } = await client.storage
    .from(SUPABASE_EMAIL_ASSETS_BUCKET)
    .upload(path, input.file, {
      contentType: input.file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new ApiHttpError(502, uploadError.message);
  }

  const { data } = client.storage
    .from(SUPABASE_EMAIL_ASSETS_BUCKET)
    .getPublicUrl(path);

  return {
    provider: "supabase" as const,
    url: data.publicUrl,
    path,
  };
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireAdminContext(request);
    const formData = await request.formData();
    const file = validateImageFile(formData.get("file"));
    const templateIdValue = formData.get("templateId");
    const templateId =
      typeof templateIdValue === "string" && templateIdValue.trim()
        ? templateIdValue.trim()
        : null;
    const uploaded = isCloudinaryEnabled()
      ? await uploadToCloudinary({ ctx, templateId, file })
      : await uploadToSupabaseStorage({ ctx, templateId, file });

    return NextResponse.json(
      {
        success: true,
        url: uploaded.url,
        asset: {
          ...uploaded,
          contentType: file.type,
          size: file.size,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}
