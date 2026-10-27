import {
  createBearerSupabaseClient,
  getAuthContext,
  hasContextRole,
  requireAuth,
} from "@asym/auth/context";
import { NextResponse } from "next/server";

import { ApiHttpError, toErrorResponse } from "../shared/http-errors";

/** Cap on the cropped upload the control sends, not the source photo (#2308 OQ1). */
export const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;
/**
 * Multipart framing on top of the file: boundary lines, part headers (with the
 * client's filename) and the small `path`/`bucket` fields. A real crop form
 * needs well under 1 KiB; 64 KiB leaves room for long encoded filenames while
 * keeping the buffered body bounded. The file part itself is still capped at
 * exactly MAX_PROFILE_IMAGE_BYTES by validateImageFile.
 */
export const MULTIPART_OVERHEAD_ALLOWANCE_BYTES = 64 * 1024;
/** Most request-body bytes read before the multipart form is parsed. */
export const MAX_UPLOAD_BODY_BYTES =
  MAX_PROFILE_IMAGE_BYTES + MULTIPART_OVERHEAD_ALLOWANCE_BYTES;
const PROFILES_BUCKET = "profiles";
const UPLOAD_FAILED = "Image upload failed.";
const TOO_LARGE = "Image file must be 5 MB or smaller.";

const EXTENSION_BY_TYPE = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
} as const;

export type ProfileImageType = keyof typeof EXTENSION_BY_TYPE;
export type ProfileImagePurpose = "avatars" | "covers";

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const ascii = (text: string) => [...text].map((char) => char.charCodeAt(0));

function startsWith(bytes: Uint8Array, expected: number[], offset = 0) {
  return (
    bytes.length >= offset + expected.length &&
    expected.every((byte, index) => bytes[offset + index] === byte)
  );
}

export function isProfileImageType(type: string): type is ProfileImageType {
  return Object.hasOwn(EXTENSION_BY_TYPE, type);
}

export function extensionForImageType(type: ProfileImageType): string {
  return EXTENSION_BY_TYPE[type];
}

/** True when the leading bytes are the file signature of the declared type. */
export function matchesImageSignature(
  bytes: Uint8Array,
  type: ProfileImageType,
): boolean {
  switch (type) {
    case "image/jpeg":
      return startsWith(bytes, [0xff, 0xd8, 0xff]);
    case "image/png":
      return startsWith(bytes, PNG_SIGNATURE);
    case "image/gif":
      return (
        startsWith(bytes, ascii("GIF87a")) || startsWith(bytes, ascii("GIF89a"))
      );
    case "image/webp":
      return (
        startsWith(bytes, ascii("RIFF")) && startsWith(bytes, ascii("WEBP"), 8)
      );
  }
}

/** The form's `path` names the purpose; it never becomes part of the key. */
export function parseUploadPurpose(
  value: FormDataEntryValue | null,
): ProfileImagePurpose {
  if (value === "avatars" || value === "covers") return value;
  throw new ApiHttpError(400, "Upload path must be avatars or covers.");
}

/** Object key from the caller's auth context only (#2308 OQ4). */
export function buildProfileImageKey(input: {
  purpose: ProfileImagePurpose;
  tenantId: string;
  userId: string;
  type: ProfileImageType;
}): string {
  return `${input.purpose}/${input.tenantId}/${input.userId}/${crypto.randomUUID()}.${extensionForImageType(input.type)}`;
}

function getBearerToken(request: Request): string | null {
  const [scheme, ...rest] = (request.headers.get("authorization") ?? "")
    .trim()
    .split(" ");
  const token = rest.join(" ").trim();
  return scheme?.toLowerCase() === "bearer" && token ? token : null;
}

function assertProfilesBucket(value: FormDataEntryValue | null) {
  if (value !== null && value !== PROFILES_BUCKET) {
    throw new ApiHttpError(400, "Unsupported storage bucket.");
  }
}

async function validateImageFile(
  value: FormDataEntryValue | null,
): Promise<File & { type: ProfileImageType }> {
  if (!(value instanceof File)) {
    throw new ApiHttpError(400, "Image file is required.");
  }
  if (!isProfileImageType(value.type)) {
    throw new ApiHttpError(415, "Unsupported image type.");
  }
  if (value.size > MAX_PROFILE_IMAGE_BYTES) {
    throw new ApiHttpError(413, TOO_LARGE);
  }
  const head = new Uint8Array(await value.slice(0, 12).arrayBuffer());
  if (!matchesImageSignature(head, value.type)) {
    throw new ApiHttpError(415, "Image content does not match its type.");
  }
  return value as File & { type: ProfileImageType };
}

/** Rejects a declared oversize body before any of it is read. */
function assertDeclaredLengthWithinCap(request: Request) {
  const declared = request.headers.get("content-length")?.trim();
  if (
    declared &&
    /^\d+$/.test(declared) &&
    Number(declared) > MAX_UPLOAD_BODY_BYTES
  ) {
    throw new ApiHttpError(413, TOO_LARGE);
  }
}

/**
 * Reads at most MAX_UPLOAD_BODY_BYTES, whatever Content-Length says, and
 * cancels the stream once a chunk pushes the total past the cap.
 */
async function readCappedBody(
  request: Request,
): Promise<Uint8Array<ArrayBuffer>> {
  if (!request.body) return new Uint8Array(0);
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_UPLOAD_BODY_BYTES) {
        await reader.cancel().catch(() => undefined);
        throw new ApiHttpError(413, TOO_LARGE);
      }
      chunks.push(value);
    }
  } catch (error) {
    if (error instanceof ApiHttpError) throw error;
    throw new ApiHttpError(400, "Invalid form data.");
  } finally {
    reader.releaseLock();
  }
  const joined = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    joined.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return joined;
}

async function readForm(request: Request): Promise<FormData> {
  assertDeclaredLengthWithinCap(request);
  const body = await readCappedBody(request);
  try {
    return await new Response(body, {
      headers: { "content-type": request.headers.get("content-type") ?? "" },
    }).formData();
  } catch {
    throw new ApiHttpError(400, "Invalid form data.");
  }
}

type StorageBucket = ReturnType<
  NonNullable<ReturnType<typeof createBearerSupabaseClient>>["storage"]["from"]
>;

/** Writes once (`upsert: false`); storage detail stays server-side. */
async function uploadOnce(
  storage: StorageBucket,
  path: string,
  file: File & { type: ProfileImageType },
) {
  let failed: boolean;
  try {
    const { error } = await storage.upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    failed = Boolean(error);
  } catch {
    failed = true;
  }
  if (failed) throw new ApiHttpError(502, UPLOAD_FAILED);
}

export async function POST(request: Request) {
  try {
    const token = getBearerToken(request);
    if (!token) throw new ApiHttpError(401, "Unauthorized");

    // Caller's own authority under the bucket's RLS, never the service role.
    const client = createBearerSupabaseClient(token);
    if (!client) {
      throw new ApiHttpError(503, "Image upload is not configured.");
    }

    const ctx = await getAuthContext(request);
    requireAuth(ctx);

    const form = await readForm(request);
    const purpose = parseUploadPurpose(form.get("path"));
    assertProfilesBucket(form.get("bucket"));
    if (purpose === "covers" && !hasContextRole(ctx, "missionary")) {
      throw new ApiHttpError(403, "Cover photos require missionary access.");
    }
    const file = await validateImageFile(form.get("file"));

    const path = buildProfileImageKey({
      purpose,
      tenantId: ctx.tenantId,
      userId: ctx.userId,
      type: file.type,
    });
    const storage = client.storage.from(PROFILES_BUCKET);
    await uploadOnce(storage, path, file);

    const { data } = storage.getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl, path }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
