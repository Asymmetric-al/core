import "server-only";

import { createHash } from "node:crypto";

import { getAdminClient } from "@asym/database/supabase/admin";
import sharp, { type Metadata, type Sharp } from "sharp";

import { validateStrictImageContainer } from "./image-container";
import {
  buildMediaMasterKey,
  buildMediaStagingKey,
  buildMediaVariantKey,
  isAllowedMediaMimeType,
  isMediaVariantName,
  MEDIA_BUCKET,
  MEDIA_MAX_BYTES,
  MEDIA_MAX_CONCURRENT_TRANSFORMS,
  MEDIA_MAX_PIXELS,
  MEDIA_MAX_VARIANT_BYTES,
  MEDIA_STATUSES,
  MEDIA_VARIANT_DESCENDING_ORDER,
  MEDIA_VARIANT_WIDTHS,
  selectBoundedVariantWidths,
  type MediaMimeType,
  type MediaStatus,
  type MediaVariantName,
} from "./media-constants";
import { ApiHttpError } from "../shared/api-http-error";

import type { AuthenticatedContext } from "@asym/auth/context";

sharp.cache(false);

let activeMediaTransforms = 0;
const mediaTransformWaiters: Array<{
  grant: () => void;
  cancelled: boolean;
}> = [];

function createCancelledTransformError(): ApiHttpError {
  return new ApiHttpError(499, "Media finalization cancelled");
}

function releaseMediaTransformSlot(): void {
  while (mediaTransformWaiters.length > 0) {
    const next = mediaTransformWaiters.shift();
    if (next && !next.cancelled) {
      next.grant();
      return;
    }
  }
  activeMediaTransforms -= 1;
}

async function withMediaTransformSlot<T>(
  fn: () => Promise<T>,
  signal?: AbortSignal,
): Promise<T> {
  if (signal?.aborted) {
    throw createCancelledTransformError();
  }

  if (activeMediaTransforms >= MEDIA_MAX_CONCURRENT_TRANSFORMS) {
    await new Promise<void>((resolve, reject) => {
      const waiter = {
        cancelled: false,
        grant: () => {
          signal?.removeEventListener("abort", onAbort);
          resolve();
        },
      };
      const onAbort = () => {
        if (waiter.cancelled) {
          return;
        }
        waiter.cancelled = true;
        const idx = mediaTransformWaiters.indexOf(waiter);
        if (idx >= 0) {
          mediaTransformWaiters.splice(idx, 1);
        }
        reject(createCancelledTransformError());
      };
      mediaTransformWaiters.push(waiter);
      signal?.addEventListener("abort", onAbort, { once: true });
    });
  } else {
    activeMediaTransforms += 1;
  }

  try {
    if (signal?.aborted) {
      throw createCancelledTransformError();
    }
    return await fn();
  } finally {
    releaseMediaTransformSlot();
  }
}

function createBoundedMediaStream(
  upstream: ReadableStream<Uint8Array>,
  maxBytes: number,
): ReadableStream<Uint8Array> {
  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  let totalBytes = 0;
  return new ReadableStream<Uint8Array>({
    start() {
      reader = upstream.getReader();
    },
    async pull(controller) {
      const current = reader;
      if (!current) {
        controller.close();
        return;
      }
      try {
        const { done, value } = await current.read();
        if (reader !== current) return;
        if (done) {
          reader = null;
          current.releaseLock();
          controller.close();
          return;
        }
        if (value) {
          totalBytes += value.byteLength;
          if (totalBytes > maxBytes) {
            reader = null;
            await current
              .cancel("Media variant exceeded maximum byte ceiling")
              .catch(() => undefined);
            current.releaseLock();
            controller.error(
              new ApiHttpError(
                502,
                "Media variant exceeded maximum byte ceiling",
              ),
            );
            return;
          }
          controller.enqueue(value);
        }
      } catch (error) {
        if (reader !== current) return;
        reader = null;
        await current.cancel(error).catch(() => undefined);
        current.releaseLock();
        controller.error(error);
      }
    },
    async cancel(reason) {
      const current = reader;
      reader = null;
      if (!current) return;
      await current.cancel(reason).catch(() => undefined);
      current.releaseLock();
    },
  });
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const FORMAT_TO_MIME: Readonly<Record<string, MediaMimeType>> = Object.freeze({
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
});

type StoredVariantJson = {
  key: string;
  width: number;
  height: number;
  byte_size: number;
  mime_type: MediaMimeType;
};

type MediaAssetRow = {
  id: string;
  tenant_id: string;
  status: MediaStatus;
  declared_byte_size: number;
  declared_mime_type: string;
  mime_type: string | null;
  content_hash: string | null;
  master_key: string | null;
  variants: Record<string, StoredVariantJson> | null;
  byte_size: number | null;
  width: number | null;
  height: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  purge_after: string | null;
};

export interface MediaVariantMetadata {
  key: string;
  width: number;
  height: number;
  byteSize: number;
  mimeType: MediaMimeType;
}

export interface MediaAssetRecord {
  id: string;
  tenantId: string;
  status: MediaStatus;
  declaredByteSize: number;
  declaredMimeType: string;
  mimeType: MediaMimeType | null;
  contentHash: string | null;
  masterKey: string | null;
  variants: Partial<Record<MediaVariantName, MediaVariantMetadata>>;
  byteSize: number | null;
  width: number | null;
  height: number | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  purgeAfter: string | null;
}

export interface SignedMediaUploadResult {
  assetId: string;
  stagingPath: string;
  token: string;
  signedUrl: string;
}

export type ReadMediaVariantResult =
  | {
      notModified: true;
      etag: string;
      mimeType: MediaMimeType;
      variant: MediaVariantName;
    }
  | {
      notModified: false;
      stream: ReadableStream<Uint8Array>;
      byteSize: number;
      etag: string;
      mimeType: MediaMimeType;
      variant: MediaVariantName;
    };

function requireAdmittedTenantId(auth: AuthenticatedContext): string {
  if (
    !auth ||
    auth.isAuthenticated !== true ||
    typeof auth.tenantId !== "string" ||
    auth.tenantId.length === 0
  ) {
    throw new ApiHttpError(401, "Unauthorized");
  }
  return auth.tenantId;
}

function requireValidUuid(value: string): string {
  if (typeof value !== "string" || !UUID_RE.test(value)) {
    throw new ApiHttpError(404, "Media asset not found");
  }
  return value.toLowerCase();
}

function requireMediaAdminClient() {
  const { client, error } = getAdminClient();
  if (!client) {
    throw new ApiHttpError(503, error || "Media storage unavailable");
  }
  return client;
}

function normalizeVariants(
  raw: Record<string, StoredVariantJson> | null | undefined,
): Partial<Record<MediaVariantName, MediaVariantMetadata>> {
  const result: Partial<Record<MediaVariantName, MediaVariantMetadata>> = {};
  if (!raw || typeof raw !== "object") {
    return result;
  }
  for (const name of MEDIA_VARIANT_DESCENDING_ORDER) {
    const entry = raw[name];
    if (
      entry &&
      typeof entry.key === "string" &&
      typeof entry.width === "number" &&
      typeof entry.height === "number" &&
      typeof entry.byte_size === "number" &&
      typeof entry.mime_type === "string" &&
      isAllowedMediaMimeType(entry.mime_type)
    ) {
      result[name] = {
        key: entry.key,
        width: entry.width,
        height: entry.height,
        byteSize: entry.byte_size,
        mimeType: entry.mime_type,
      };
    }
  }
  return result;
}

const isText = (value: unknown): value is string => typeof value === "string";
const isTextOrNull = (value: unknown) => value === null || isText(value);
const isCount = (value: unknown) =>
  (typeof value === "number" && Number.isFinite(value)) ||
  (isText(value) && /^\d+$/.test(value));
const isCountOrNull = (value: unknown) => value === null || isCount(value);
const isDimensionOrNull = (value: unknown) =>
  value === null || (typeof value === "number" && Number.isFinite(value));

function parseMediaAssetRow(data: unknown): MediaAssetRow {
  const row = (data ?? {}) as Record<string, unknown>;
  const variants = row.variants;
  if (
    !data ||
    typeof data !== "object" ||
    !isText(row.id) ||
    !UUID_RE.test(row.id) ||
    !isText(row.tenant_id) ||
    !(MEDIA_STATUSES as readonly unknown[]).includes(row.status) ||
    !isCount(row.declared_byte_size) ||
    !isText(row.declared_mime_type) ||
    !isTextOrNull(row.mime_type) ||
    !isTextOrNull(row.content_hash) ||
    !isTextOrNull(row.master_key) ||
    !(
      variants === null ||
      (typeof variants === "object" && !Array.isArray(variants))
    ) ||
    !isCountOrNull(row.byte_size) ||
    !isDimensionOrNull(row.width) ||
    !isDimensionOrNull(row.height) ||
    !isTextOrNull(row.created_by) ||
    !isText(row.created_at) ||
    !isText(row.updated_at) ||
    !isTextOrNull(row.deleted_at) ||
    !isTextOrNull(row.purge_after)
  ) {
    throw new ApiHttpError(500, "Malformed media asset custody record");
  }
  return row as unknown as MediaAssetRow;
}

function toMediaAssetRecord(row: MediaAssetRow): MediaAssetRecord {
  const mimeType =
    row.mime_type && isAllowedMediaMimeType(row.mime_type)
      ? row.mime_type
      : null;
  return {
    id: row.id,
    tenantId: row.tenant_id,
    status: row.status,
    declaredByteSize: Number(row.declared_byte_size),
    declaredMimeType: row.declared_mime_type,
    mimeType,
    contentHash: row.content_hash,
    masterKey: row.master_key,
    variants: normalizeVariants(row.variants),
    byteSize: row.byte_size === null ? null : Number(row.byte_size),
    width: row.width,
    height: row.height,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
    purgeAfter: row.purge_after,
  };
}

function isNotFoundStorageError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }
  const statusCode =
    "statusCode" in error
      ? String((error as { statusCode?: unknown }).statusCode)
      : "";
  const status =
    "status" in error ? Number((error as { status?: unknown }).status) : 0;
  const message =
    "message" in error ? String((error as { message?: unknown }).message) : "";
  const originalStatus =
    "originalError" in error &&
    error.originalError &&
    typeof error.originalError === "object" &&
    "status" in error.originalError
      ? Number((error.originalError as { status?: unknown }).status)
      : 0;
  return (
    statusCode === "404" ||
    status === 404 ||
    originalStatus === 404 ||
    /not\s*found|no such (key|object)/i.test(message)
  );
}

function isClientValidationError(error: unknown): boolean {
  return (
    error instanceof ApiHttpError && error.status >= 400 && error.status < 500
  );
}

function isAlreadyExistsStorageError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }
  const statusCode =
    "statusCode" in error
      ? String((error as { statusCode?: unknown }).statusCode)
      : "";
  const status =
    "status" in error ? Number((error as { status?: unknown }).status) : 0;
  const message =
    "message" in error ? String((error as { message?: unknown }).message) : "";
  return (
    statusCode === "409" ||
    status === 409 ||
    /already exists|duplicate/i.test(message)
  );
}

function normalizeEtagToken(token: string): string {
  const trimmed = token.trim();
  return trimmed.startsWith("W/") ? trimmed.slice(2).trim() : trimmed;
}

function matchesIfNoneMatch(
  headerValue: string | null | undefined,
  etag: string,
): boolean {
  if (!headerValue) {
    return false;
  }
  if (headerValue.trim() === "*") {
    return true;
  }
  const normalizedTarget = normalizeEtagToken(etag);
  return headerValue
    .split(",")
    .some((part) => normalizeEtagToken(part) === normalizedTarget);
}

async function fetchMediaAssetRow(
  admin: ReturnType<typeof requireMediaAdminClient>,
  tenantId: string,
  assetId: string,
): Promise<MediaAssetRow | null> {
  const { data, error } = await admin
    .from("media_assets")
    .select("*")
    .eq("id", assetId)
    .eq("tenant_id", tenantId)
    .maybeSingle();
  if (error) {
    throw new ApiHttpError(500, "Failed to read media asset custody record");
  }
  return data === null || data === undefined ? null : parseMediaAssetRow(data);
}

async function markFailedIfUploading(
  admin: ReturnType<typeof requireMediaAdminClient>,
  tenantId: string,
  assetId: string,
): Promise<void> {
  const { error } = await admin
    .from("media_assets")
    .update({
      status: "failed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", assetId)
    .eq("tenant_id", tenantId)
    .eq("status", "uploading");
  if (error) {
    throw new ApiHttpError(500, "Failed to record failed media asset state");
  }
}

async function assertZeroMetadata(bytes: Buffer): Promise<{
  width: number;
  height: number;
  mimeType: MediaMimeType;
}> {
  const meta = await sharp(bytes, {
    limitInputPixels: MEDIA_MAX_PIXELS,
    failOn: "error",
  }).metadata();
  const mimeType = meta.format ? FORMAT_TO_MIME[meta.format] : undefined;
  if (
    !mimeType ||
    typeof meta.width !== "number" ||
    typeof meta.height !== "number" ||
    meta.width <= 0 ||
    meta.height <= 0 ||
    meta.exif !== undefined ||
    meta.icc !== undefined ||
    meta.iptc !== undefined ||
    meta.xmp !== undefined ||
    meta.orientation !== undefined
  ) {
    throw new ApiHttpError(
      500,
      "Stored media failed metadata sanitization verification",
    );
  }
  return {
    width: meta.width,
    height: meta.height,
    mimeType,
  };
}

async function encodeImageFormat(
  pipeline: Sharp,
  mimeType: MediaMimeType,
  quality: number,
): Promise<Buffer> {
  if (mimeType === "image/jpeg") {
    return pipeline.jpeg({ quality, mozjpeg: false }).toBuffer();
  }
  if (mimeType === "image/webp") {
    return pipeline.webp({ quality }).toBuffer();
  }
  return pipeline.png({ compressionLevel: 9 }).toBuffer();
}

async function sanitizeMasterImage(rawBytes: Buffer): Promise<{
  bytes: Buffer;
  width: number;
  height: number;
  mimeType: MediaMimeType;
  contentHash: string;
}> {
  if (rawBytes.byteLength === 0) {
    throw new ApiHttpError(400, "Uploaded media object is empty");
  }
  if (rawBytes.byteLength > MEDIA_MAX_BYTES) {
    throw new ApiHttpError(413, "Uploaded media exceeds maximum byte limit");
  }

  const container = validateStrictImageContainer(rawBytes);

  let probe: Metadata;
  try {
    probe = await sharp(rawBytes, {
      limitInputPixels: MEDIA_MAX_PIXELS,
      failOn: "error",
    }).metadata();
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (/pixel limit/i.test(message)) {
      throw new ApiHttpError(422, "Image exceeds 25 megapixel limit");
    }
    throw new ApiHttpError(415, "Unsupported or corrupted image file");
  }

  const mimeType = probe.format ? FORMAT_TO_MIME[probe.format] : undefined;
  if (!mimeType || mimeType !== container.mimeType) {
    throw new ApiHttpError(
      415,
      "Unsupported image format; only JPEG, PNG, and WebP are allowed",
    );
  }

  if (
    typeof probe.width !== "number" ||
    typeof probe.height !== "number" ||
    probe.width <= 0 ||
    probe.height <= 0
  ) {
    throw new ApiHttpError(415, "Invalid image dimensions");
  }

  if (probe.width * probe.height > MEDIA_MAX_PIXELS) {
    throw new ApiHttpError(422, "Image exceeds 25 megapixel limit");
  }

  let masterBytes: Buffer;
  try {
    masterBytes = await encodeImageFormat(
      sharp(rawBytes, {
        limitInputPixels: MEDIA_MAX_PIXELS,
        failOn: "error",
      }).rotate(),
      mimeType,
      88,
    );
  } catch {
    throw new ApiHttpError(415, "Image could not be decoded safely");
  }

  if (masterBytes.byteLength > MEDIA_MAX_BYTES && mimeType !== "image/png") {
    for (const quality of [75, 60]) {
      masterBytes = await encodeImageFormat(
        sharp(rawBytes, {
          limitInputPixels: MEDIA_MAX_PIXELS,
          failOn: "error",
        }).rotate(),
        mimeType,
        quality,
      );
      if (masterBytes.byteLength <= MEDIA_MAX_BYTES) {
        break;
      }
    }
  }

  if (masterBytes.byteLength > MEDIA_MAX_BYTES) {
    throw new ApiHttpError(413, "Sanitized master exceeds maximum byte limit");
  }

  const verified = await assertZeroMetadata(masterBytes);
  const contentHash = createHash("sha256").update(masterBytes).digest("hex");

  return {
    bytes: masterBytes,
    width: verified.width,
    height: verified.height,
    mimeType: verified.mimeType,
    contentHash,
  };
}

async function encodeBoundedVariant(
  masterBytes: Buffer,
  sourceMimeType: MediaMimeType,
  targetWidth: number,
): Promise<{
  bytes: Buffer;
  width: number;
  height: number;
  mimeType: MediaMimeType;
}> {
  let variantMime: MediaMimeType = sourceMimeType;
  let bytes = await encodeImageFormat(
    sharp(masterBytes, {
      limitInputPixels: MEDIA_MAX_PIXELS,
      failOn: "error",
    }).resize({
      width: targetWidth,
      withoutEnlargement: true,
    }),
    variantMime,
    85,
  );

  if (bytes.byteLength > MEDIA_MAX_VARIANT_BYTES) {
    if (variantMime === "image/png") {
      bytes = await sharp(masterBytes, {
        limitInputPixels: MEDIA_MAX_PIXELS,
        failOn: "error",
      })
        .resize({ width: targetWidth, withoutEnlargement: true })
        .png({ palette: true, quality: 85, compressionLevel: 9 })
        .toBuffer();

      if (bytes.byteLength > MEDIA_MAX_VARIANT_BYTES) {
        variantMime = "image/webp";
        bytes = await sharp(masterBytes, {
          limitInputPixels: MEDIA_MAX_PIXELS,
          failOn: "error",
        })
          .resize({ width: targetWidth, withoutEnlargement: true })
          .webp({ quality: 82 })
          .toBuffer();
      }
    } else {
      for (const quality of [72, 58]) {
        bytes = await encodeImageFormat(
          sharp(masterBytes, {
            limitInputPixels: MEDIA_MAX_PIXELS,
            failOn: "error",
          }).resize({
            width: targetWidth,
            withoutEnlargement: true,
          }),
          variantMime,
          quality,
        );
        if (bytes.byteLength <= MEDIA_MAX_VARIANT_BYTES) {
          break;
        }
      }
    }
  }

  if (bytes.byteLength > MEDIA_MAX_VARIANT_BYTES) {
    throw new ApiHttpError(413, "Bounded variant exceeds maximum byte limit");
  }

  const verified = await assertZeroMetadata(bytes);
  return {
    bytes,
    width: verified.width,
    height: verified.height,
    mimeType: verified.mimeType,
  };
}

async function uploadObjectIfAbsent(
  admin: ReturnType<typeof requireMediaAdminClient>,
  key: string,
  bytes: Buffer,
  mimeType: MediaMimeType,
): Promise<void> {
  const { error } = await admin.storage
    .from(MEDIA_BUCKET)
    .upload(key, bytes, { contentType: mimeType, upsert: false });
  if (error && !isAlreadyExistsStorageError(error)) {
    throw new ApiHttpError(502, "Failed to persist sanitized media object");
  }
}

async function verifyStoredObjectMetadata(
  admin: ReturnType<typeof requireMediaAdminClient>,
  key: string,
): Promise<void> {
  const { data, error } = await admin.storage.from(MEDIA_BUCKET).download(key);
  if (error || !data) {
    throw new ApiHttpError(502, "Failed to verify persisted media object");
  }
  const bytes = Buffer.from(await data.arrayBuffer());
  await assertZeroMetadata(bytes);
}

export async function issueSignedUpload(
  auth: AuthenticatedContext,
  input: { assetId: string },
): Promise<SignedMediaUploadResult> {
  const tenantId = requireAdmittedTenantId(auth);
  const assetId = requireValidUuid(input.assetId);
  const admin = requireMediaAdminClient();

  const row = await fetchMediaAssetRow(admin, tenantId, assetId);
  if (!row || row.status !== "uploading") {
    throw new ApiHttpError(404, "Media upload not found");
  }

  const stagingPath = buildMediaStagingKey(tenantId, assetId);
  const { data, error } = await admin.storage
    .from(MEDIA_BUCKET)
    .createSignedUploadUrl(stagingPath);
  if (error || !data?.token || !data?.signedUrl) {
    throw new ApiHttpError(502, "Failed to issue signed media upload");
  }

  const { data: confirmedRow, error: confirmError } = await admin
    .from("media_assets")
    .update({
      updated_at: new Date().toISOString(),
    })
    .eq("id", assetId)
    .eq("tenant_id", tenantId)
    .eq("status", "uploading")
    .select("id")
    .maybeSingle();
  if (confirmError) {
    throw new ApiHttpError(500, "Failed to confirm signed media upload");
  }
  if (!confirmedRow) {
    throw new ApiHttpError(404, "Media upload not found");
  }

  return {
    assetId,
    stagingPath,
    token: data.token,
    signedUrl: data.signedUrl,
  };
}

type FinalizeRpcResult = {
  outcome: string;
  status?: string;
  row?: MediaAssetRow;
};

function parseFinalizeRpcResult(data: unknown): FinalizeRpcResult {
  if (!data || typeof data !== "object" || !("outcome" in data)) {
    throw new ApiHttpError(500, "Unexpected media finalize RPC response");
  }
  const record = data as Record<string, unknown>;
  return {
    outcome: String(record.outcome),
    status: typeof record.status === "string" ? record.status : undefined,
    row:
      record.row === undefined || record.row === null
        ? undefined
        : parseMediaAssetRow(record.row),
  };
}

export async function finalizeMediaUpload(
  auth: AuthenticatedContext,
  input: { assetId: string; signal?: AbortSignal },
): Promise<MediaAssetRecord> {
  const tenantId = requireAdmittedTenantId(auth);
  const assetId = requireValidUuid(input.assetId);
  if (input.signal?.aborted) {
    throw createCancelledTransformError();
  }
  const admin = requireMediaAdminClient();

  const existing = await fetchMediaAssetRow(admin, tenantId, assetId);
  if (!existing) {
    throw new ApiHttpError(404, "Media asset not found");
  }
  if (existing.status === "ready") {
    return toMediaAssetRecord(existing);
  }
  if (existing.status !== "uploading") {
    throw new ApiHttpError(404, "Media asset not found");
  }

  const stagingPath = buildMediaStagingKey(tenantId, assetId);

  return withMediaTransformSlot(async () => {
    const current = await fetchMediaAssetRow(admin, tenantId, assetId);
    if (!current) {
      throw new ApiHttpError(404, "Media asset not found");
    }
    if (current.status === "ready") {
      return toMediaAssetRecord(current);
    }
    if (current.status !== "uploading") {
      throw new ApiHttpError(404, "Media asset not found");
    }

    let shouldCleanStaging = false;

    try {
      const { data: stagedBlob, error: downloadError } = await admin.storage
        .from(MEDIA_BUCKET)
        .download(stagingPath);

      if (downloadError || !stagedBlob) {
        if (downloadError && !isNotFoundStorageError(downloadError)) {
          throw new ApiHttpError(502, "Failed to read staged media upload");
        }
        const reread = await fetchMediaAssetRow(admin, tenantId, assetId);
        if (reread?.status === "ready") {
          return toMediaAssetRecord(reread);
        }
        if (!reread || reread.status !== "uploading") {
          throw new ApiHttpError(404, "Media asset not found");
        }
        await markFailedIfUploading(admin, tenantId, assetId);
        const afterFail = await fetchMediaAssetRow(admin, tenantId, assetId);
        if (afterFail?.status === "ready") {
          return toMediaAssetRecord(afterFail);
        }
        throw new ApiHttpError(400, "Uploaded media object is missing");
      }

      const rawBytes = Buffer.from(await stagedBlob.arrayBuffer());

      let sanitizedMaster: Awaited<ReturnType<typeof sanitizeMasterImage>>;
      try {
        sanitizedMaster = await sanitizeMasterImage(rawBytes);
      } catch (error) {
        if (isClientValidationError(error)) {
          await markFailedIfUploading(admin, tenantId, assetId);
          shouldCleanStaging = true;
        }
        throw error;
      }

      const masterKey = buildMediaMasterKey(
        tenantId,
        sanitizedMaster.contentHash,
      );
      const variantNames = selectBoundedVariantWidths(sanitizedMaster.width);
      const encodedVariants: Array<{
        name: MediaVariantName;
        key: string;
        bytes: Buffer;
        width: number;
        height: number;
        mimeType: MediaMimeType;
      }> = [];

      try {
        for (const name of variantNames) {
          const encoded = await encodeBoundedVariant(
            sanitizedMaster.bytes,
            sanitizedMaster.mimeType,
            MEDIA_VARIANT_WIDTHS[name],
          );
          encodedVariants.push({
            name,
            key: buildMediaVariantKey(
              tenantId,
              sanitizedMaster.contentHash,
              name,
            ),
            bytes: encoded.bytes,
            width: encoded.width,
            height: encoded.height,
            mimeType: encoded.mimeType,
          });
        }
      } catch (error) {
        if (isClientValidationError(error)) {
          await markFailedIfUploading(admin, tenantId, assetId);
          shouldCleanStaging = true;
        }
        throw error;
      }

      const variantsJson: Record<string, StoredVariantJson> = {};
      for (const variant of encodedVariants) {
        variantsJson[variant.name] = {
          key: variant.key,
          width: variant.width,
          height: variant.height,
          byte_size: variant.bytes.byteLength,
          mime_type: variant.mimeType,
        };
      }

      const { data: declareData, error: declareError } = await admin.rpc(
        "declare_media_finalize",
        {
          p_tenant_id: tenantId,
          p_asset_id: assetId,
          p_content_hash: sanitizedMaster.contentHash,
          p_master_key: masterKey,
          p_variants: variantsJson,
          p_mime_type: sanitizedMaster.mimeType,
          p_byte_size: sanitizedMaster.bytes.byteLength,
          p_width: sanitizedMaster.width,
          p_height: sanitizedMaster.height,
          p_now: new Date().toISOString(),
        },
      );
      if (declareError) {
        throw new ApiHttpError(
          500,
          "Failed to declare media asset finalization",
        );
      }
      const parsedDeclare = parseFinalizeRpcResult(declareData);
      if (parsedDeclare.outcome === "ready" && parsedDeclare.row) {
        shouldCleanStaging = true;
        return toMediaAssetRecord(parsedDeclare.row);
      }
      if (
        parsedDeclare.outcome === "missing" ||
        parsedDeclare.outcome === "terminal"
      ) {
        if (parsedDeclare.status === "failed") {
          shouldCleanStaging = true;
        }
        throw new ApiHttpError(404, "Media asset not found");
      }
      if (parsedDeclare.outcome !== "declared") {
        throw new ApiHttpError(
          500,
          "Unexpected media finalization declaration state",
        );
      }

      await uploadObjectIfAbsent(
        admin,
        masterKey,
        sanitizedMaster.bytes,
        sanitizedMaster.mimeType,
      );
      for (const variant of encodedVariants) {
        await uploadObjectIfAbsent(
          admin,
          variant.key,
          variant.bytes,
          variant.mimeType,
        );
      }

      await verifyStoredObjectMetadata(admin, masterKey);
      for (const variant of encodedVariants) {
        await verifyStoredObjectMetadata(admin, variant.key);
      }

      const { data: publishData, error: publishError } = await admin.rpc(
        "publish_media_finalize",
        {
          p_tenant_id: tenantId,
          p_asset_id: assetId,
          p_content_hash: sanitizedMaster.contentHash,
          p_now: new Date().toISOString(),
        },
      );

      if (publishError) {
        throw new ApiHttpError(500, "Failed to finalize media asset custody");
      }

      const parsedPublish = parseFinalizeRpcResult(publishData);
      if (
        (parsedPublish.outcome === "published" ||
          parsedPublish.outcome === "ready") &&
        parsedPublish.row
      ) {
        shouldCleanStaging = true;
        return toMediaAssetRecord(parsedPublish.row);
      }
      if (parsedPublish.status === "failed") {
        shouldCleanStaging = true;
      }
      throw new ApiHttpError(404, "Media asset not found");
    } finally {
      if (shouldCleanStaging) {
        await admin.storage
          .from(MEDIA_BUCKET)
          .remove([stagingPath])
          .catch(() => undefined);
      }
    }
  }, input.signal);
}

export async function readMediaVariant(
  auth: AuthenticatedContext,
  input: {
    assetId: string;
    variant?: string | null;
    ifNoneMatch?: string | null;
  },
): Promise<ReadMediaVariantResult> {
  const tenantId = requireAdmittedTenantId(auth);
  const assetId = requireValidUuid(input.assetId);

  let requestedVariant: MediaVariantName | null = null;
  if (
    input.variant !== undefined &&
    input.variant !== null &&
    input.variant !== ""
  ) {
    if (!isMediaVariantName(input.variant)) {
      throw new ApiHttpError(404, "Media variant not found");
    }
    requestedVariant = input.variant;
  }

  const admin = requireMediaAdminClient();
  const row = await fetchMediaAssetRow(admin, tenantId, assetId);
  if (!row || row.status !== "ready" || !row.content_hash) {
    throw new ApiHttpError(404, "Media asset not found");
  }

  const variants = normalizeVariants(row.variants);
  let selectedName: MediaVariantName | null = null;
  let selectedEntry: MediaVariantMetadata | null = null;

  if (requestedVariant) {
    const entry = variants[requestedVariant];
    if (!entry) {
      throw new ApiHttpError(404, "Media variant not found");
    }
    selectedName = requestedVariant;
    selectedEntry = entry;
  } else {
    for (const candidate of MEDIA_VARIANT_DESCENDING_ORDER) {
      const entry = variants[candidate];
      if (entry) {
        selectedName = candidate;
        selectedEntry = entry;
        break;
      }
    }
  }

  if (!selectedName || !selectedEntry) {
    throw new ApiHttpError(404, "Media variant not found");
  }

  const etag = `"${row.content_hash}-${selectedName}"`;
  if (matchesIfNoneMatch(input.ifNoneMatch, etag)) {
    return {
      notModified: true,
      etag,
      mimeType: selectedEntry.mimeType,
      variant: selectedName,
    };
  }

  if (selectedEntry.byteSize > MEDIA_MAX_VARIANT_BYTES) {
    throw new ApiHttpError(502, "Media variant exceeds maximum byte ceiling");
  }

  const { data: upstream, error } = await admin.storage
    .from(MEDIA_BUCKET)
    .download(selectedEntry.key)
    .asStream();
  if (error || !upstream) {
    if (error && !isNotFoundStorageError(error)) {
      throw new ApiHttpError(502, "Failed to read media variant");
    }
    throw new ApiHttpError(404, "Media variant not found");
  }

  return {
    notModified: false,
    stream: createBoundedMediaStream(upstream, MEDIA_MAX_VARIANT_BYTES),
    byteSize: selectedEntry.byteSize,
    etag,
    mimeType: selectedEntry.mimeType,
    variant: selectedName,
  };
}
