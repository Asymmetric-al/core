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
      bytes: Buffer;
      byteSize: number;
      etag: string;
      mimeType: MediaMimeType;
      variant: MediaVariantName;
    };

export interface PurgeExpiredMediaOptions {
  now?: Date;
  batchSize?: number;
  hasLiveUse?: (tenantId: string, assetId: string) => Promise<boolean>;
}

export interface PurgeExpiredMediaResult {
  scanned: number;
  purgedRows: number;
  removedObjects: number;
  removedStagingObjects: number;
  keptSharedObjects: number;
  skippedLiveUse: number;
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
  await admin
    .from("media_assets")
    .update({
      status: "failed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", assetId)
    .eq("tenant_id", tenantId)
    .eq("status", "uploading");
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

  return {
    assetId,
    stagingPath,
    token: data.token,
    signedUrl: data.signedUrl,
  };
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
  let shouldCleanStaging = false;

  try {
    const { data: stagedBlob, error: downloadError } = await admin.storage
      .from(MEDIA_BUCKET)
      .download(stagingPath);

    if (downloadError || !stagedBlob) {
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

    shouldCleanStaging = true;
    const rawBytes = Buffer.from(await stagedBlob.arrayBuffer());

    let sanitizedMaster: Awaited<ReturnType<typeof sanitizeMasterImage>>;
    try {
      sanitizedMaster = await sanitizeMasterImage(rawBytes);
    } catch (error) {
      await markFailedIfUploading(admin, tenantId, assetId);
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
      await markFailedIfUploading(admin, tenantId, assetId);
      throw error;
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

    const { data: updated, error: updateError } = await admin
      .from("media_assets")
      .update({
        status: "ready",
        mime_type: sanitizedMaster.mimeType,
        content_hash: sanitizedMaster.contentHash,
        master_key: masterKey,
        variants: variantsJson,
        byte_size: sanitizedMaster.bytes.byteLength,
        width: sanitizedMaster.width,
        height: sanitizedMaster.height,
        updated_at: new Date().toISOString(),
      })
      .eq("id", assetId)
      .eq("tenant_id", tenantId)
      .eq("status", "uploading")
      .select("*")
      .maybeSingle();

    if (updateError) {
      throw new ApiHttpError(500, "Failed to finalize media asset custody");
    }

    if (updated) {
      return toMediaAssetRecord(updated as MediaAssetRow);
    }

    const raced = await fetchMediaAssetRow(admin, tenantId, assetId);
    if (raced?.status === "ready") {
      return toMediaAssetRecord(raced);
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

  const { data: blob, error } = await admin.storage
    .from(MEDIA_BUCKET)
    .download(selectedEntry.key);
  if (error || !blob) {
    throw new ApiHttpError(404, "Media variant not found");
  }

  const bytes = Buffer.from(await blob.arrayBuffer());
  return {
    notModified: false,
    bytes,
    byteSize: bytes.byteLength,
    etag,
    mimeType: selectedEntry.mimeType,
    variant: selectedName,
  };
}

export async function purgeExpiredMedia(
  options: PurgeExpiredMediaOptions = {},
): Promise<PurgeExpiredMediaResult> {
  const admin = requireMediaAdminClient();
  const nowIso = (options.now ?? new Date()).toISOString();
  const batchSize = options.batchSize ?? 100;

  const { data, error } = await admin
    .from("media_assets")
    .select("*")
    .eq("status", "deleted")
    .not("deleted_at", "is", null)
    .is("purged_at", null)
    .lte("purge_after", nowIso)
    .limit(batchSize);

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
  };

  for (const row of candidates) {
    if (
      options.hasLiveUse &&
      (await options.hasLiveUse(row.tenant_id, row.id))
    ) {
      summary.skippedLiveUse += 1;
      continue;
    }

    if (!row.master_key) {
      const stagingKey = buildMediaStagingKey(row.tenant_id, row.id);
      const { error: removeStagingError } = await admin.storage
        .from(MEDIA_BUCKET)
        .remove([stagingKey]);
      if (!removeStagingError) {
        summary.removedStagingObjects += 1;
      }
    } else if (row.content_hash) {
      const { count, error: countError } = await admin
        .from("media_assets")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", row.tenant_id)
        .eq("content_hash", row.content_hash)
        .neq("status", "deleted")
        .is("deleted_at", null);

      if (countError) {
        throw new ApiHttpError(
          500,
          "Failed to check shared media content hash",
        );
      }

      if ((count ?? 0) > 0) {
        summary.keptSharedObjects += 1;
      } else {
        const variantKeys = Object.values(normalizeVariants(row.variants)).map(
          (v) => v.key,
        );
        const keysToRemove = [...new Set([row.master_key, ...variantKeys])];
        if (keysToRemove.length > 0) {
          const { error: removeError } = await admin.storage
            .from(MEDIA_BUCKET)
            .remove(keysToRemove);
          if (removeError) {
            throw new ApiHttpError(
              502,
              "Failed to purge media Storage objects",
            );
          }
          summary.removedObjects += keysToRemove.length;
        }
      }
    }

    const { error: markPurgedError } = await admin
      .from("media_assets")
      .update({
        purged_at: nowIso,
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

  return summary;
}
