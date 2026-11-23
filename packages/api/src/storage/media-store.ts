import "server-only";

import { createHash, randomUUID } from "node:crypto";

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
const mediaTransformWaiters: Array<() => void> = [];

async function withMediaTransformSlot<T>(fn: () => Promise<T>): Promise<T> {
  if (activeMediaTransforms >= MEDIA_MAX_CONCURRENT_TRANSFORMS) {
    await new Promise<void>((resolve) => {
      mediaTransformWaiters.push(resolve);
    });
  }
  activeMediaTransforms += 1;
  try {
    return await fn();
  } finally {
    activeMediaTransforms -= 1;
    const next = mediaTransformWaiters.shift();
    if (next) {
      next();
    }
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
      if (!reader) {
        controller.close();
        return;
      }
      try {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          reader.releaseLock();
          reader = null;
          return;
        }
        if (value) {
          totalBytes += value.byteLength;
          if (totalBytes > maxBytes) {
            await reader
              .cancel("Media variant exceeded maximum byte ceiling")
              .catch(() => undefined);
            reader.releaseLock();
            reader = null;
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
        if (reader) {
          await reader.cancel(error).catch(() => undefined);
          reader.releaseLock();
          reader = null;
        }
        controller.error(error);
      }
    },
    async cancel(reason) {
      if (reader) {
        await reader.cancel(reason).catch(() => undefined);
        reader.releaseLock();
        reader = null;
      }
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
  purged_at: string | null;
  upload_token_expires_at: string | null;
  staging_swept_at: string | null;
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
  purgedAt: string | null;
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

export interface PurgeExpiredMediaOptions {
  now?: Date;
  batchSize?: number;
  tenantIds?: readonly string[];
  hasLiveUse?: (tenantId: string, assetId: string) => Promise<boolean>;
}

export interface PurgeExpiredMediaResult {
  scanned: number;
  purgedRows: number;
  removedObjects: number;
  removedStagingObjects: number;
  keptSharedObjects: number;
  skippedLiveUse: number;
  deferredInUse: number;
}

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
  return value;
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
    purgedAt: row.purged_at,
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
  const normalizedTarget = normalizeEtagToken(etag);
  return headerValue.split(",").some((part) => {
    const token = part.trim();
    return token === "*" || normalizeEtagToken(token) === normalizedTarget;
  });
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
  return (data as MediaAssetRow | null) ?? null;
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

const DEFAULT_SIGNED_UPLOAD_TTL_MS = 2 * 60 * 60 * 1000;

function parseSignedUploadTokenExpiry(token: string, now: Date): string {
  const parts = token.split(".");
  if (parts.length === 3 && parts[1]) {
    try {
      const decoded = JSON.parse(
        Buffer.from(parts[1], "base64url").toString("utf8"),
      ) as { exp?: unknown };
      if (
        typeof decoded.exp === "number" &&
        Number.isFinite(decoded.exp) &&
        decoded.exp > 0
      ) {
        return new Date(decoded.exp * 1000).toISOString();
      }
    } catch {
      return new Date(
        now.getTime() + DEFAULT_SIGNED_UPLOAD_TTL_MS,
      ).toISOString();
    }
  }
  return new Date(now.getTime() + DEFAULT_SIGNED_UPLOAD_TTL_MS).toISOString();
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

  const now = new Date();
  const uploadTokenExpiresAt = parseSignedUploadTokenExpiry(data.token, now);
  const { error: expiryUpdateError } = await admin
    .from("media_assets")
    .update({
      upload_token_expires_at: uploadTokenExpiresAt,
      staging_swept_at: null,
      updated_at: now.toISOString(),
    })
    .eq("id", assetId)
    .eq("tenant_id", tenantId)
    .eq("status", "uploading");
  if (expiryUpdateError) {
    throw new ApiHttpError(500, "Failed to record signed media upload expiry");
  }

  return {
    assetId,
    stagingPath,
    token: data.token,
    signedUrl: data.signedUrl,
  };
}

const PURGE_CLAIM_LEASE_SECONDS = 120;
const MAX_PURGE_CLAIM_WAIT_ATTEMPTS = 25;

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
      record.row && typeof record.row === "object"
        ? (record.row as MediaAssetRow)
        : undefined,
  };
}

function waitMs(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function finalizeMediaUpload(
  auth: AuthenticatedContext,
  input: { assetId: string },
): Promise<MediaAssetRecord> {
  const tenantId = requireAdmittedTenantId(auth);
  const assetId = requireValidUuid(input.assetId);
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

      let declared = false;
      for (
        let attempt = 0;
        attempt < MAX_PURGE_CLAIM_WAIT_ATTEMPTS;
        attempt += 1
      ) {
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
        if (parsedDeclare.outcome === "declared") {
          declared = true;
          break;
        }
        if (parsedDeclare.outcome === "claim_active") {
          await waitMs(Math.min(150, 25 + attempt * 15));
          continue;
        }
        throw new ApiHttpError(
          500,
          "Unexpected media finalization declaration state",
        );
      }

      if (!declared) {
        throw new ApiHttpError(
          503,
          "Media content purge in progress; retry finalize",
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
      if (parsedPublish.outcome === "claim_active") {
        throw new ApiHttpError(
          503,
          "Media content purge in progress; retry finalize",
        );
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
  });
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

export async function purgeExpiredMedia(
  options: PurgeExpiredMediaOptions = {},
): Promise<PurgeExpiredMediaResult> {
  const scopedTenantIds =
    options.tenantIds !== undefined ? [...options.tenantIds] : null;
  if (scopedTenantIds !== null && scopedTenantIds.length === 0) {
    return {
      scanned: 0,
      purgedRows: 0,
      removedObjects: 0,
      removedStagingObjects: 0,
      keptSharedObjects: 0,
      skippedLiveUse: 0,
      deferredInUse: 0,
    };
  }

  const admin = requireMediaAdminClient();
  const nowIso = (options.now ?? new Date()).toISOString();
  const batchSize = options.batchSize ?? 100;

  let expiredQuery = admin
    .from("media_assets")
    .select("*")
    .eq("status", "deleted")
    .not("deleted_at", "is", null)
    .is("purged_at", null)
    .lte("purge_after", nowIso);
  if (scopedTenantIds !== null) {
    expiredQuery = expiredQuery.in("tenant_id", scopedTenantIds);
  }
  const { data, error } = await expiredQuery.limit(batchSize);

  if (error) {
    throw new ApiHttpError(500, "Failed to query expired media assets");
  }

  const candidates = (data as MediaAssetRow[] | null) ?? [];
  const summary: PurgeExpiredMediaResult = {
    scanned: candidates.length,
    purgedRows: 0,
    removedObjects: 0,
    removedStagingObjects: 0,
    keptSharedObjects: 0,
    skippedLiveUse: 0,
    deferredInUse: 0,
  };

  for (const row of candidates) {
    if (
      options.hasLiveUse &&
      (await options.hasLiveUse(row.tenant_id, row.id))
    ) {
      summary.skippedLiveUse += 1;
      continue;
    }

    if (row.master_key && row.content_hash) {
      const claimToken = randomUUID();
      const { data: claimVerdict, error: claimError } = await admin.rpc(
        "claim_media_content_purge",
        {
          p_tenant_id: row.tenant_id,
          p_asset_id: row.id,
          p_content_hash: row.content_hash,
          p_claim_token: claimToken,
          p_lease_seconds: PURGE_CLAIM_LEASE_SECONDS,
        },
      );

      if (claimError) {
        throw new ApiHttpError(500, "Failed to claim media content purge");
      }

      if (claimVerdict === "in_use_uploading" || claimVerdict === "busy") {
        summary.deferredInUse += 1;
        continue;
      }

      if (claimVerdict === "in_use_durable") {
        summary.keptSharedObjects += 1;
      } else if (claimVerdict === "claimed") {
        try {
          const variantKeys = Object.values(
            normalizeVariants(row.variants),
          ).map((v) => v.key);
          const keysToRemove = [...new Set([row.master_key, ...variantKeys])];
          if (keysToRemove.length > 0) {
            const { data: removedData, error: removeError } =
              await admin.storage.from(MEDIA_BUCKET).remove(keysToRemove);
            if (removeError && !isNotFoundStorageError(removeError)) {
              throw new ApiHttpError(
                502,
                "Failed to purge media Storage objects",
              );
            }
            if (!removeError) {
              summary.removedObjects += Array.isArray(removedData)
                ? removedData.length
                : keysToRemove.length;
            }
          }
        } finally {
          await Promise.resolve(
            admin.rpc("release_media_content_purge", {
              p_tenant_id: row.tenant_id,
              p_content_hash: row.content_hash,
              p_claim_token: claimToken,
            }),
          ).catch(() => undefined);
        }
      } else {
        throw new ApiHttpError(500, "Unexpected media purge claim verdict");
      }
    }

    const stagingKey = buildMediaStagingKey(row.tenant_id, row.id);
    const { data: removedStagingData, error: removeStagingError } =
      await admin.storage.from(MEDIA_BUCKET).remove([stagingKey]);
    if (removeStagingError && !isNotFoundStorageError(removeStagingError)) {
      throw new ApiHttpError(502, "Failed to purge staged media object");
    }
    if (
      !removeStagingError &&
      Array.isArray(removedStagingData) &&
      removedStagingData.length > 0
    ) {
      summary.removedStagingObjects += removedStagingData.length;
    }

    const { error: markPurgedError } = await admin
      .from("media_assets")
      .update({
        purged_at: nowIso,
        staging_swept_at: row.staging_swept_at ?? nowIso,
        updated_at: nowIso,
      })
      .eq("id", row.id)
      .eq("tenant_id", row.tenant_id)
      .not("deleted_at", "is", null)
      .is("purged_at", null);

    if (markPurgedError) {
      throw new ApiHttpError(500, "Failed to mark media asset purged");
    }
    summary.purgedRows += 1;
  }

  let sweepQuery = admin
    .from("media_assets")
    .select("*")
    .in("status", ["ready", "failed"])
    .is("staging_swept_at", null)
    .not("upload_token_expires_at", "is", null)
    .lte("upload_token_expires_at", nowIso);
  if (scopedTenantIds !== null) {
    sweepQuery = sweepQuery.in("tenant_id", scopedTenantIds);
  }
  const { data: sweepData, error: sweepQueryError } =
    await sweepQuery.limit(batchSize);

  if (sweepQueryError) {
    throw new ApiHttpError(
      500,
      "Failed to query media assets pending staging sweep",
    );
  }

  const sweepCandidates = (sweepData as MediaAssetRow[] | null) ?? [];
  for (const row of sweepCandidates) {
    const stagingKey = buildMediaStagingKey(row.tenant_id, row.id);
    const { data: removedStagingData, error: removeStagingError } =
      await admin.storage.from(MEDIA_BUCKET).remove([stagingKey]);
    if (removeStagingError && !isNotFoundStorageError(removeStagingError)) {
      throw new ApiHttpError(
        502,
        "Failed to sweep expired staged media object",
      );
    }
    if (
      !removeStagingError &&
      Array.isArray(removedStagingData) &&
      removedStagingData.length > 0
    ) {
      summary.removedStagingObjects += removedStagingData.length;
    }

    const { error: markSweptError } = await admin
      .from("media_assets")
      .update({
        staging_swept_at: nowIso,
        updated_at: nowIso,
      })
      .eq("id", row.id)
      .eq("tenant_id", row.tenant_id)
      .is("staging_swept_at", null);

    if (markSweptError) {
      throw new ApiHttpError(500, "Failed to record media staging sweep");
    }
  }

  return summary;
}
