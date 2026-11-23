import { createHash, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

import sharp from "sharp";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildMediaMasterKey,
  buildMediaStagingKey,
  buildMediaVariantKey,
  MEDIA_ALLOWED_MIME_TYPES,
  MEDIA_BUCKET,
  MEDIA_MAX_BYTES,
  MEDIA_MAX_PIXELS,
  MEDIA_MAX_VARIANT_BYTES,
  MEDIA_PURGE_DELAY_DAYS,
  MEDIA_VARIANT_NAMES,
  MEDIA_VARIANT_WIDTHS,
  selectBoundedVariantWidths,
} from "../../src/storage/media-constants";
import {
  finalizeMediaUpload,
  issueSignedUpload,
  readMediaVariant,
} from "../../src/storage/media-store";

import type { AuthenticatedContext } from "@asym/auth/context";

type AssetRow = {
  id: string;
  tenant_id: string;
  status: "uploading" | "ready" | "failed" | "deleted";
  declared_byte_size: number;
  declared_mime_type: string;
  mime_type: string | null;
  content_hash: string | null;
  master_key: string | null;
  variants: Record<
    string,
    {
      key: string;
      width: number;
      height: number;
      byte_size: number;
      mime_type: string;
    }
  >;
  byte_size: number | null;
  width: number | null;
  height: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  purge_after: string | null;
};

type StoredObject = {
  bytes: Buffer;
  contentType: string;
  version: number;
};

const fakeState = vi.hoisted(() => ({
  rows: new Map<string, AssetRow>(),
  objects: new Map<string, StoredObject>(),
  uploadCalls: [] as string[],
  removeCalls: [] as string[][],
  signedUploadCalls: [] as string[],
  downloadCalls: [] as string[],
  streamDownloadCalls: [] as string[],
  onBeforeCasUpdate: null as null | ((id: string) => void | Promise<void>),
  onBeforeStagingDownload: null as
    null | ((path: string) => void | Promise<void>),
  onAfterUpload: null as null | ((path: string) => void),
  nextDownloadError: null as null | { message: string; statusCode: string },
  nextStreamError: null as null | { message: string; statusCode: string },
  nextUploadError: null as null | { message: string; statusCode: string },
  nextUpdateError: null as null | { message: string; code?: string },
}));

function matchesFilters(
  row: AssetRow,
  filters: Array<
    | { op: "eq"; col: string; val: unknown }
    | { op: "neq"; col: string; val: unknown }
    | { op: "in"; col: string; vals: unknown[] }
    | { op: "is"; col: string; val: unknown }
    | { op: "notIs"; col: string; val: unknown }
    | { op: "lte"; col: string; val: unknown }
  >,
): boolean {
  for (const f of filters) {
    const actual = (row as Record<string, unknown>)[f.col];
    if (f.op === "eq" && actual !== f.val) return false;
    if (f.op === "neq" && actual === f.val) return false;
    if (f.op === "in" && !f.vals.includes(actual)) return false;
    if (f.op === "is" && actual !== f.val) return false;
    if (f.op === "notIs" && actual === f.val) return false;
    if (f.op === "lte") {
      if (typeof actual !== "string" || typeof f.val !== "string") return false;
      if (new Date(actual).getTime() > new Date(f.val).getTime()) return false;
    }
  }
  return true;
}

function createFakeAdminClient() {
  return {
    async rpc(fnName: string, params: Record<string, unknown>) {
      if (fnName === "declare_media_finalize") {
        const tenantId = String(params.p_tenant_id);
        const assetId = String(params.p_asset_id);
        const contentHash = String(params.p_content_hash);
        const row = fakeState.rows.get(assetId);
        if (!row || row.tenant_id !== tenantId) {
          return { data: { outcome: "missing" }, error: null };
        }
        if (row.status === "ready") {
          return {
            data: { outcome: "ready", row: structuredClone(row) },
            error: null,
          };
        }
        if (row.status !== "uploading") {
          return {
            data: { outcome: "terminal", status: row.status },
            error: null,
          };
        }
        const updated: AssetRow = {
          ...row,
          mime_type: String(params.p_mime_type),
          content_hash: contentHash,
          master_key: String(params.p_master_key),
          variants: structuredClone(params.p_variants as AssetRow["variants"]),
          byte_size: Number(params.p_byte_size),
          width: Number(params.p_width),
          height: Number(params.p_height),
          updated_at: String(params.p_now ?? new Date().toISOString()),
        };
        fakeState.rows.set(assetId, updated);
        return {
          data: { outcome: "declared", row: structuredClone(updated) },
          error: null,
        };
      }

      if (fnName === "publish_media_finalize") {
        const tenantId = String(params.p_tenant_id);
        const assetId = String(params.p_asset_id);
        const contentHash = String(params.p_content_hash);
        await fakeState.onBeforeCasUpdate?.(assetId);
        if (fakeState.nextUpdateError) {
          const err = fakeState.nextUpdateError;
          fakeState.nextUpdateError = null;
          return { data: null, error: err };
        }
        const row = fakeState.rows.get(assetId);
        if (!row || row.tenant_id !== tenantId) {
          return { data: { outcome: "missing" }, error: null };
        }
        if (row.status === "ready") {
          return {
            data: { outcome: "ready", row: structuredClone(row) },
            error: null,
          };
        }
        if (row.status !== "uploading") {
          return {
            data: { outcome: "terminal", status: row.status },
            error: null,
          };
        }
        if (row.content_hash !== contentHash) {
          return {
            data: { outcome: "mismatch", status: row.status },
            error: null,
          };
        }
        const updated: AssetRow = {
          ...row,
          status: "ready",
          updated_at: String(params.p_now ?? new Date().toISOString()),
        };
        fakeState.rows.set(assetId, updated);
        return {
          data: { outcome: "published", row: structuredClone(updated) },
          error: null,
        };
      }

      throw new Error(`Unexpected RPC: ${fnName}`);
    },
    from(table: string) {
      if (table !== "media_assets") {
        throw new Error(`Unexpected table: ${table}`);
      }
      const filters: Array<
        | { op: "eq"; col: string; val: unknown }
        | { op: "neq"; col: string; val: unknown }
        | { op: "in"; col: string; vals: unknown[] }
        | { op: "is"; col: string; val: unknown }
        | { op: "notIs"; col: string; val: unknown }
        | { op: "lte"; col: string; val: unknown }
      > = [];
      let pendingUpdate: Partial<AssetRow> | null = null;
      let wantCountOnly = false;

      const execute = async (singleMode: "many" | "maybeSingle") => {
        if (pendingUpdate) {
          if (fakeState.nextUpdateError) {
            const err = fakeState.nextUpdateError;
            fakeState.nextUpdateError = null;
            return { data: null, error: err };
          }
          const matched: AssetRow[] = [];
          const idFilter = filters.find(
            (f): f is { op: "eq"; col: string; val: unknown } =>
              f.op === "eq" && f.col === "id",
          );
          if (idFilter && typeof idFilter.val === "string") {
            await fakeState.onBeforeCasUpdate?.(idFilter.val);
          }
          for (const row of fakeState.rows.values()) {
            if (matchesFilters(row, filters)) {
              const updated: AssetRow = { ...row, ...pendingUpdate };
              fakeState.rows.set(updated.id, updated);
              matched.push(structuredClone(updated));
            }
          }
          if (singleMode === "maybeSingle") {
            return { data: matched[0] ?? null, error: null };
          }
          return { data: matched, error: null };
        }
        const matched = [...fakeState.rows.values()]
          .filter((row) => matchesFilters(row, filters))
          .map((row) => structuredClone(row));
        if (wantCountOnly) {
          return { data: null, count: matched.length, error: null };
        }
        if (singleMode === "maybeSingle") {
          return { data: matched[0] ?? null, error: null };
        }
        return { data: matched, error: null };
      };

      const builder = {
        select(_columns?: string, opts?: { count?: "exact"; head?: boolean }) {
          if (opts?.head) wantCountOnly = true;
          return builder;
        },
        update(patch: Partial<AssetRow>) {
          pendingUpdate = patch;
          return builder;
        },
        eq(col: string, val: unknown) {
          filters.push({ op: "eq", col, val });
          return builder;
        },
        neq(col: string, val: unknown) {
          filters.push({ op: "neq", col, val });
          return builder;
        },
        in(col: string, vals: unknown[]) {
          filters.push({ op: "in", col, vals });
          return builder;
        },
        is(col: string, val: unknown) {
          filters.push({ op: "is", col, val });
          return builder;
        },
        not(col: string, operator: string, val: unknown) {
          if (operator === "is") {
            filters.push({ op: "notIs", col, val });
          }
          return builder;
        },
        lte(col: string, val: unknown) {
          filters.push({ op: "lte", col, val });
          return builder;
        },
        limit(_n: number) {
          return builder;
        },
        maybeSingle() {
          return Promise.resolve(execute("maybeSingle"));
        },
        then<TResult1 = unknown, TResult2 = never>(
          onfulfilled?:
            ((value: unknown) => TResult1 | PromiseLike<TResult1>) | null,
          onrejected?:
            ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
        ) {
          return Promise.resolve(execute("many")).then(onfulfilled, onrejected);
        },
      };
      return builder;
    },
    storage: {
      from(bucket: string) {
        if (bucket !== MEDIA_BUCKET) {
          throw new Error(`Unexpected bucket: ${bucket}`);
        }
        return {
          async createSignedUploadUrl(objectPath: string) {
            fakeState.signedUploadCalls.push(objectPath);
            const token = `tok-${objectPath}`;
            return {
              data: {
                signedUrl: `http://127.0.0.1:54321/storage/v1/upload/sign/${bucket}/${objectPath}?token=${token}`,
                path: objectPath,
                token,
              },
              error: null,
            };
          },
          download(objectPath: string) {
            const executeBlob = async () => {
              fakeState.downloadCalls.push(objectPath);
              if (objectPath.startsWith("tmp/")) {
                await fakeState.onBeforeStagingDownload?.(objectPath);
              }
              if (fakeState.nextDownloadError) {
                const err = fakeState.nextDownloadError;
                fakeState.nextDownloadError = null;
                return { data: null, error: err };
              }
              const stored = fakeState.objects.get(objectPath);
              if (!stored) {
                return {
                  data: null,
                  error: { message: "Object not found", statusCode: "404" },
                };
              }
              return {
                data: new Blob([new Uint8Array(stored.bytes)], {
                  type: stored.contentType,
                }),
                error: null,
              };
            };
            const executeStream = async () => {
              fakeState.streamDownloadCalls.push(objectPath);
              if (fakeState.nextStreamError) {
                const err = fakeState.nextStreamError;
                fakeState.nextStreamError = null;
                return { data: null, error: err };
              }
              const stored = fakeState.objects.get(objectPath);
              if (!stored) {
                return {
                  data: null,
                  error: { message: "Object not found", statusCode: "404" },
                };
              }
              const chunkSize = Math.max(
                1,
                Math.ceil(stored.bytes.byteLength / 3),
              );
              const stream = new ReadableStream<Uint8Array>({
                start(controller) {
                  for (
                    let offset = 0;
                    offset < stored.bytes.byteLength;
                    offset += chunkSize
                  ) {
                    controller.enqueue(
                      new Uint8Array(
                        stored.bytes.subarray(
                          offset,
                          Math.min(offset + chunkSize, stored.bytes.byteLength),
                        ),
                      ),
                    );
                  }
                  controller.close();
                },
              });
              return { data: stream, error: null };
            };
            let blobPromise: ReturnType<typeof executeBlob> | null = null;
            const getBlobPromise = () => {
              blobPromise ??= executeBlob();
              return blobPromise;
            };
            return {
              asStream() {
                return executeStream();
              },
              then<TResult1 = unknown, TResult2 = never>(
                onfulfilled?:
                  | ((
                      value: Awaited<ReturnType<typeof executeBlob>>,
                    ) => TResult1 | PromiseLike<TResult1>)
                  | null,
                onrejected?:
                  | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
                  | null,
              ) {
                return getBlobPromise().then(onfulfilled, onrejected);
              },
            };
          },
          async upload(
            objectPath: string,
            body: Uint8Array | Buffer,
            options?: { contentType?: string; upsert?: boolean },
          ) {
            fakeState.uploadCalls.push(objectPath);
            if (fakeState.nextUploadError) {
              const err = fakeState.nextUploadError;
              fakeState.nextUploadError = null;
              return { data: null, error: err };
            }
            if (fakeState.objects.has(objectPath) && !options?.upsert) {
              return {
                data: null,
                error: {
                  message: "The resource already exists",
                  statusCode: "409",
                },
              };
            }
            const prev = fakeState.objects.get(objectPath);
            fakeState.objects.set(objectPath, {
              bytes: Buffer.from(body),
              contentType: options?.contentType ?? "application/octet-stream",
              version: (prev?.version ?? 0) + 1,
            });
            fakeState.onAfterUpload?.(objectPath);
            return { data: { path: objectPath }, error: null };
          },
          async remove(paths: string[]) {
            fakeState.removeCalls.push([...paths]);
            const removed: Array<{ name: string }> = [];
            for (const p of paths) {
              if (fakeState.objects.delete(p)) {
                removed.push({ name: p });
              }
            }
            return { data: removed, error: null };
          },
        };
      },
    },
  };
}

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: vi.fn(() => ({
    client: createFakeAdminClient(),
    error: null,
  })),
}));

function makeAuth(tenantId: string): AuthenticatedContext {
  return {
    userId: randomUUID(),
    email: "staff@example.test",
    tenantId,
    role: "admin",
    profileId: randomUUID(),
    isAuthenticated: true,
    memberships: [
      {
        tenantId,
        role: "staff",
        staffRole: "development",
        isActive: true,
        isTenantAdmin: false,
      },
    ],
  };
}

function makeRow(
  overrides: Partial<AssetRow> & { id: string; tenant_id: string },
): AssetRow {
  const now = new Date().toISOString();
  return {
    status: "uploading",
    declared_byte_size: 4096,
    declared_mime_type: "image/jpeg",
    mime_type: null,
    content_hash: null,
    master_key: null,
    variants: {},
    byte_size: null,
    width: null,
    height: null,
    created_by: randomUUID(),
    created_at: now,
    updated_at: now,
    deleted_at: null,
    purge_after: null,
    ...overrides,
  };
}

const SAMPLE_XMP_XML =
  '<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description exif:GPSLatitude="37,46.5N" xmlns:exif="http://ns.adobe.com/exif/1.0/"/></rdf:RDF></x:xmpmeta>';

function injectJpegXmpSegment(jpeg: Buffer): Buffer {
  const xmpPayload = Buffer.concat([
    Buffer.from("http://ns.adobe.com/xap/1.0/\0", "utf8"),
    Buffer.from(SAMPLE_XMP_XML, "utf8"),
  ]);
  const length = xmpPayload.byteLength + 2;
  const header = Buffer.from([0xff, 0xe1, (length >> 8) & 0xff, length & 0xff]);
  return Buffer.concat([
    jpeg.subarray(0, 2),
    header,
    xmpPayload,
    jpeg.subarray(2),
  ]);
}

function injectWebpXmpChunk(webp: Buffer): Buffer {
  const xmpBuf = Buffer.from(SAMPLE_XMP_XML, "utf8");
  const pad = xmpBuf.byteLength & 1;
  const header = Buffer.alloc(8);
  header.write("XMP ", 0, "ascii");
  header.writeUInt32LE(xmpBuf.byteLength, 4);
  const xmpChunk = pad
    ? Buffer.concat([header, xmpBuf, Buffer.from([0])])
    : Buffer.concat([header, xmpBuf]);
  const out = Buffer.concat([webp, xmpChunk]);
  out.writeUInt32LE(out.byteLength - 8, 4);
  if (out.toString("ascii", 12, 16) === "VP8X") {
    out[20] = out[20]! | 0x04;
  }
  return out;
}

async function createDirtyJpeg(width = 1800, height = 1200): Promise<Buffer> {
  const base = await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 64, g: 128, b: 192 },
    },
  })
    .withMetadata({ orientation: 6 })
    .withExifMerge({
      IFD0: { Make: "WP6TestCamera", Software: "LocationTag" },
      IFD3: {
        GPSLatitudeRef: "N",
        GPSLatitude: "37/1 46/1 30/1",
        GPSLongitudeRef: "W",
        GPSLongitude: "122/1 25/1 10/1",
      },
    })
    .withIccProfile("p3")
    .jpeg({ quality: 92 })
    .toBuffer();
  return injectJpegXmpSegment(base);
}

async function createDirtyPng(width = 2000, height = 1700): Promise<Buffer> {
  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 44, g: 156, b: 92, alpha: 1 },
    },
  })
    .withMetadata({ orientation: 6 })
    .withExifMerge({
      IFD0: { Make: "WP6PngCamera", Software: "LocationTag" },
      IFD3: {
        GPSLatitudeRef: "N",
        GPSLatitude: "37/1 46/1 30/1",
        GPSLongitudeRef: "W",
        GPSLongitude: "122/1 25/1 10/1",
      },
    })
    .withIccProfile("p3")
    .png()
    .toBuffer();
}

async function createDirtyWebp(width = 2000, height = 1700): Promise<Buffer> {
  const base = await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 196, g: 112, b: 48 },
    },
  })
    .withMetadata({ orientation: 6 })
    .withExifMerge({
      IFD0: { Make: "WP6WebpCamera", Software: "LocationTag" },
      IFD3: {
        GPSLatitudeRef: "N",
        GPSLatitude: "37/1 46/1 30/1",
        GPSLongitudeRef: "W",
        GPSLongitude: "122/1 25/1 10/1",
      },
    })
    .withIccProfile("p3")
    .webp({ quality: 90 })
    .toBuffer();
  return injectWebpXmpChunk(base);
}

async function createTextured25MpJpeg(): Promise<Buffer> {
  const tileW = 250;
  const tileH = 250;
  const tile = Buffer.alloc(tileW * tileH * 3);
  let state = 0x13572468;
  for (let i = 0; i < tile.byteLength; i += 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    tile[i] = (state >>> 24) & 0xff;
  }
  return sharp(tile, { raw: { width: tileW, height: tileH, channels: 3 } })
    .resize(5000, 5000, { kernel: "lanczos3" })
    .jpeg({ quality: 88 })
    .toBuffer();
}

describe("media constants single source of truth", () => {
  it("defines bucket, limits, purge delay and bounded variants", () => {
    expect(MEDIA_BUCKET).toBe("cms-media");
    expect(MEDIA_MAX_BYTES).toBe(15_728_640);
    expect(MEDIA_MAX_PIXELS).toBe(25_000_000);
    expect(MEDIA_MAX_VARIANT_BYTES).toBeLessThan(4_500_000);
    expect(MEDIA_PURGE_DELAY_DAYS).toBeGreaterThan(30);
    expect(MEDIA_ALLOWED_MIME_TYPES).toEqual([
      "image/jpeg",
      "image/png",
      "image/webp",
    ]);
    expect(MEDIA_VARIANT_NAMES).toEqual(["w320", "w960", "w1600"]);
    expect(MEDIA_VARIANT_WIDTHS).toEqual({ w320: 320, w960: 960, w1600: 1600 });
    expect(selectBoundedVariantWidths(200)).toEqual(["w320"]);
    expect(selectBoundedVariantWidths(600)).toEqual(["w320"]);
    expect(selectBoundedVariantWidths(1000)).toEqual(["w320", "w960"]);
    expect(selectBoundedVariantWidths(2000)).toEqual(["w320", "w960", "w1600"]);
    expect(buildMediaStagingKey("t1", "a1")).toBe("tmp/t1/a1");
    expect(buildMediaMasterKey("t1", "h1")).toBe("t1/h1");
    expect(buildMediaVariantKey("t1", "h1", "w960")).toBe("t1/h1-w960");
  });
});

describe("media-store custody and Sharp sanitization", () => {
  const tenantA = randomUUID();
  const tenantB = randomUUID();
  const authA = makeAuth(tenantA);
  const authB = makeAuth(tenantB);

  beforeEach(() => {
    fakeState.rows.clear();
    fakeState.objects.clear();
    fakeState.uploadCalls = [];
    fakeState.removeCalls = [];
    fakeState.signedUploadCalls = [];
    fakeState.downloadCalls = [];
    fakeState.streamDownloadCalls = [];
    fakeState.onBeforeCasUpdate = null;
    fakeState.onBeforeStagingDownload = null;
    fakeState.onAfterUpload = null;
    fakeState.nextDownloadError = null;
    fakeState.nextStreamError = null;
    fakeState.nextUploadError = null;
    fakeState.nextUpdateError = null;
  });

  it("binds issueSignedUpload, finalizeMediaUpload and readMediaVariant to auth.tenantId and refuses foreign tenant assets", async () => {
    const assetB = randomUUID();
    fakeState.rows.set(assetB, makeRow({ id: assetB, tenant_id: tenantB }));
    fakeState.objects.set(buildMediaStagingKey(tenantB, assetB), {
      bytes: await createDirtyJpeg(400, 300),
      contentType: "image/jpeg",
      version: 1,
    });

    await expect(
      issueSignedUpload(authA, { assetId: assetB }),
    ).rejects.toMatchObject({ status: 404 });
    expect(fakeState.signedUploadCalls).toEqual([]);

    await expect(
      finalizeMediaUpload(authA, { assetId: assetB }),
    ).rejects.toMatchObject({ status: 404 });
    expect(fakeState.uploadCalls).toEqual([]);
    expect(fakeState.rows.get(assetB)!.status).toBe("uploading");

    const signedB = await issueSignedUpload(authB, { assetId: assetB });
    expect(signedB.stagingPath).toBe(buildMediaStagingKey(tenantB, assetB));
    const readyB = await finalizeMediaUpload(authB, { assetId: assetB });
    expect(readyB.status).toBe("ready");

    await expect(
      readMediaVariant(authA, { assetId: assetB }),
    ).rejects.toMatchObject({ status: 404 });
  });

  it("strips EXIF GPS, ICC, and XMP, applies orientation 6, produces deterministic SHA-256, and never upscales", async () => {
    const dirtyJpeg = await createDirtyJpeg(1800, 1200);
    const beforeMeta = await sharp(dirtyJpeg).metadata();
    expect(beforeMeta.orientation).toBe(6);
    expect(beforeMeta.exif).toBeDefined();
    expect(beforeMeta.icc).toBeDefined();
    expect(beforeMeta.xmp).toBeDefined();

    const asset1 = randomUUID();
    const asset2 = randomUUID();
    fakeState.rows.set(asset1, makeRow({ id: asset1, tenant_id: tenantA }));
    fakeState.rows.set(asset2, makeRow({ id: asset2, tenant_id: tenantA }));
    fakeState.objects.set(buildMediaStagingKey(tenantA, asset1), {
      bytes: dirtyJpeg,
      contentType: "image/jpeg",
      version: 1,
    });
    fakeState.objects.set(buildMediaStagingKey(tenantA, asset2), {
      bytes: dirtyJpeg,
      contentType: "image/jpeg",
      version: 1,
    });

    const first = await finalizeMediaUpload(authA, { assetId: asset1 });
    expect(first.status).toBe("ready");
    expect(first.width).toBe(1200);
    expect(first.height).toBe(1800);
    expect(first.contentHash).toMatch(/^[0-9a-f]{64}$/);
    expect(first.masterKey).toBe(
      buildMediaMasterKey(tenantA, first.contentHash!),
    );
    expect(Object.keys(first.variants).sort()).toEqual(["w320", "w960"]);
    expect(fakeState.objects.has(buildMediaStagingKey(tenantA, asset1))).toBe(
      false,
    );

    const storedMaster = fakeState.objects.get(first.masterKey!)!;
    expect(createHash("sha256").update(storedMaster.bytes).digest("hex")).toBe(
      first.contentHash,
    );
    const masterMeta = await sharp(storedMaster.bytes).metadata();
    expect(masterMeta.width).toBe(1200);
    expect(masterMeta.height).toBe(1800);
    expect(masterMeta.orientation).toBeUndefined();
    expect(masterMeta.exif).toBeUndefined();
    expect(masterMeta.icc).toBeUndefined();
    expect(masterMeta.xmp).toBeUndefined();
    expect(masterMeta.iptc).toBeUndefined();

    for (const [name, info] of Object.entries(first.variants)) {
      const storedVariant = fakeState.objects.get(info.key)!;
      const vMeta = await sharp(storedVariant.bytes).metadata();
      expect(vMeta.orientation, name).toBeUndefined();
      expect(vMeta.exif, name).toBeUndefined();
      expect(vMeta.icc, name).toBeUndefined();
      expect(vMeta.xmp, name).toBeUndefined();
      expect(vMeta.iptc, name).toBeUndefined();
      expect(vMeta.width, name).toBeLessThanOrEqual(1200);
      expect(storedVariant.bytes.byteLength, name).toBeLessThan(
        MEDIA_MAX_VARIANT_BYTES,
      );
    }

    const second = await finalizeMediaUpload(authA, { assetId: asset2 });
    expect(second.contentHash).toBe(first.contentHash);
    expect(fakeState.objects.get(first.masterKey!)!.version).toBe(1);

    const tinyAsset = randomUUID();
    const tinyPng = await sharp({
      create: {
        width: 180,
        height: 120,
        channels: 4,
        background: { r: 20, g: 40, b: 60, alpha: 1 },
      },
    })
      .withIccProfile("p3")
      .png()
      .toBuffer();
    fakeState.rows.set(
      tinyAsset,
      makeRow({
        id: tinyAsset,
        tenant_id: tenantA,
        declared_mime_type: "image/png",
      }),
    );
    fakeState.objects.set(buildMediaStagingKey(tenantA, tinyAsset), {
      bytes: tinyPng,
      contentType: "image/png",
      version: 1,
    });
    const tinyReady = await finalizeMediaUpload(authA, { assetId: tinyAsset });
    expect(Object.keys(tinyReady.variants)).toEqual(["w320"]);
    expect(tinyReady.variants.w320!.width).toBe(180);
    expect(tinyReady.variants.w320!.height).toBe(120);

    for (const [label, mimeType, bytes, expectInputXmp] of [
      [
        "jpeg-all-variants",
        "image/jpeg",
        await createDirtyJpeg(2000, 1700),
        true,
      ],
      [
        "png-all-variants",
        "image/png",
        await createDirtyPng(2000, 1700),
        false,
      ],
      [
        "webp-all-variants",
        "image/webp",
        await createDirtyWebp(2000, 1700),
        true,
      ],
    ] as const) {
      const inMeta = await sharp(bytes).metadata();
      expect(inMeta.orientation, label).toBe(6);
      expect(inMeta.exif, label).toBeDefined();
      expect(inMeta.icc, label).toBeDefined();
      if (expectInputXmp) {
        expect(inMeta.xmp, label).toBeDefined();
      }
      const id = randomUUID();
      fakeState.rows.set(
        id,
        makeRow({ id, tenant_id: tenantA, declared_mime_type: mimeType }),
      );
      fakeState.objects.set(buildMediaStagingKey(tenantA, id), {
        bytes,
        contentType: mimeType,
        version: 1,
      });
      const ready = await finalizeMediaUpload(authA, { assetId: id });
      expect(ready.width, label).toBe(1700);
      expect(ready.height, label).toBe(2000);
      expect(Object.keys(ready.variants).sort(), label).toEqual([
        "w1600",
        "w320",
        "w960",
      ]);
      for (const [outLabel, key] of [
        ["master", ready.masterKey!],
        ["w320", ready.variants.w320!.key],
        ["w960", ready.variants.w960!.key],
        ["w1600", ready.variants.w1600!.key],
      ] as const) {
        const stored = fakeState.objects.get(key)!;
        const outMeta = await sharp(stored.bytes).metadata();
        expect(outMeta.orientation, `${label}:${outLabel}`).toBeUndefined();
        expect(outMeta.exif, `${label}:${outLabel}`).toBeUndefined();
        expect(outMeta.icc, `${label}:${outLabel}`).toBeUndefined();
        expect(outMeta.xmp, `${label}:${outLabel}`).toBeUndefined();
        expect(outMeta.iptc, `${label}:${outLabel}`).toBeUndefined();
      }
    }
  });

  it("refuses oversize bytes, >25 MP images, and disguised GIF/SVG while cleaning staging and marking failed", async () => {
    const overBytesId = randomUUID();
    fakeState.rows.set(
      overBytesId,
      makeRow({ id: overBytesId, tenant_id: tenantA }),
    );
    fakeState.objects.set(buildMediaStagingKey(tenantA, overBytesId), {
      bytes: Buffer.alloc(MEDIA_MAX_BYTES + 1, 0xff),
      contentType: "image/jpeg",
      version: 1,
    });
    await expect(
      finalizeMediaUpload(authA, { assetId: overBytesId }),
    ).rejects.toMatchObject({ status: 413 });
    expect(fakeState.rows.get(overBytesId)!.status).toBe("failed");
    expect(
      fakeState.objects.has(buildMediaStagingKey(tenantA, overBytesId)),
    ).toBe(false);

    const gifId = randomUUID();
    fakeState.rows.set(
      gifId,
      makeRow({
        id: gifId,
        tenant_id: tenantA,
        declared_mime_type: "image/png",
      }),
    );
    fakeState.objects.set(buildMediaStagingKey(tenantA, gifId), {
      bytes: Buffer.from(
        "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
        "base64",
      ),
      contentType: "image/png",
      version: 1,
    });
    await expect(
      finalizeMediaUpload(authA, { assetId: gifId }),
    ).rejects.toMatchObject({ status: 415 });
    expect(fakeState.rows.get(gifId)!.status).toBe("failed");

    const svgId = randomUUID();
    fakeState.rows.set(
      svgId,
      makeRow({
        id: svgId,
        tenant_id: tenantA,
        declared_mime_type: "image/png",
      }),
    );
    fakeState.objects.set(buildMediaStagingKey(tenantA, svgId), {
      bytes: Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg"><script/></svg>',
      ),
      contentType: "image/png",
      version: 1,
    });
    await expect(
      finalizeMediaUpload(authA, { assetId: svgId }),
    ).rejects.toMatchObject({ status: 415 });
    expect(fakeState.rows.get(svgId)!.status).toBe("failed");

    const bombId = randomUUID();
    const bombPng = await sharp({
      create: {
        width: 6000,
        height: 5000,
        channels: 3,
        background: { r: 10, g: 20, b: 30 },
      },
    })
      .png({ compressionLevel: 9 })
      .toBuffer();
    fakeState.rows.set(
      bombId,
      makeRow({
        id: bombId,
        tenant_id: tenantA,
        declared_mime_type: "image/png",
      }),
    );
    fakeState.objects.set(buildMediaStagingKey(tenantA, bombId), {
      bytes: bombPng,
      contentType: "image/png",
      version: 1,
    });
    await expect(
      finalizeMediaUpload(authA, { assetId: bombId }),
    ).rejects.toMatchObject({ status: 422 });
    expect(fakeState.rows.get(bombId)!.status).toBe("failed");
    expect(fakeState.objects.has(buildMediaStagingKey(tenantA, bombId))).toBe(
      false,
    );
  });

  it("rejects trailing content appended after valid JPEG, PNG, and WebP containers and never disables Sharp limitInputPixels", async () => {
    const mediaStoreSource = readFileSync(
      path.resolve(__dirname, "../../src/storage/media-store.ts"),
      "utf8",
    );
    expect(mediaStoreSource).not.toMatch(/limitInputPixels\s*:\s*false/);

    const validJpeg = await sharp({
      create: {
        width: 120,
        height: 80,
        channels: 3,
        background: { r: 100, g: 120, b: 140 },
      },
    })
      .jpeg({ quality: 85 })
      .toBuffer();
    const validPng = await sharp({
      create: {
        width: 120,
        height: 80,
        channels: 4,
        background: { r: 100, g: 120, b: 140, alpha: 1 },
      },
    })
      .png()
      .toBuffer();
    const validWebp = await sharp({
      create: {
        width: 120,
        height: 80,
        channels: 3,
        background: { r: 100, g: 120, b: 140 },
      },
    })
      .webp({ quality: 85 })
      .toBuffer();

    const trailingPayload = Buffer.from("BENIGN_TRAILING_BYTES_AFTER_EOF");
    for (const [label, mimeType, bytes] of [
      [
        "jpeg+trailing",
        "image/jpeg",
        Buffer.concat([validJpeg, trailingPayload]),
      ],
      ["png+trailing", "image/png", Buffer.concat([validPng, trailingPayload])],
      [
        "webp+trailing",
        "image/webp",
        Buffer.concat([validWebp, trailingPayload]),
      ],
    ] as const) {
      const assetId = randomUUID();
      fakeState.rows.set(
        assetId,
        makeRow({
          id: assetId,
          tenant_id: tenantA,
          declared_mime_type: mimeType,
        }),
      );
      fakeState.objects.set(buildMediaStagingKey(tenantA, assetId), {
        bytes,
        contentType: mimeType,
        version: 1,
      });

      await expect(
        finalizeMediaUpload(authA, { assetId }),
        label,
      ).rejects.toMatchObject({ status: 415 });
      expect(fakeState.rows.get(assetId)!.status, label).toBe("failed");
      expect(
        fakeState.objects.has(buildMediaStagingKey(tenantA, assetId)),
        label,
      ).toBe(false);
    }

    const progressiveJpeg = await sharp({
      create: {
        width: 160,
        height: 120,
        channels: 3,
        background: { r: 30, g: 90, b: 150 },
      },
    })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();
    const losslessWebp = await sharp({
      create: {
        width: 160,
        height: 120,
        channels: 4,
        background: { r: 30, g: 90, b: 150, alpha: 1 },
      },
    })
      .webp({ lossless: true })
      .toBuffer();

    for (const [label, mimeType, bytes] of [
      ["progressive-jpeg", "image/jpeg", progressiveJpeg],
      ["lossless-webp", "image/webp", losslessWebp],
    ] as const) {
      const assetId = randomUUID();
      fakeState.rows.set(
        assetId,
        makeRow({
          id: assetId,
          tenant_id: tenantA,
          declared_mime_type: mimeType,
        }),
      );
      fakeState.objects.set(buildMediaStagingKey(tenantA, assetId), {
        bytes,
        contentType: mimeType,
        version: 1,
      });
      const ready = await finalizeMediaUpload(authA, { assetId });
      expect(ready.status, label).toBe("ready");
    }
  });

  it("keeps largest bounded variant under 4.5 MB even for a high-entropy textured 25 MP ceiling image", async () => {
    const ceilingId = randomUUID();
    const ceilingJpeg = await createTextured25MpJpeg();
    expect(ceilingJpeg.byteLength).toBeGreaterThan(1_000_000);
    expect(ceilingJpeg.byteLength).toBeLessThanOrEqual(MEDIA_MAX_BYTES);
    fakeState.rows.set(
      ceilingId,
      makeRow({
        id: ceilingId,
        tenant_id: tenantA,
        declared_mime_type: "image/jpeg",
      }),
    );
    fakeState.objects.set(buildMediaStagingKey(tenantA, ceilingId), {
      bytes: ceilingJpeg,
      contentType: "image/jpeg",
      version: 1,
    });
    const ready = await finalizeMediaUpload(authA, { assetId: ceilingId });
    expect(ready.width).toBe(5000);
    expect(ready.height).toBe(5000);
    expect(Object.keys(ready.variants).sort()).toEqual([
      "w1600",
      "w320",
      "w960",
    ]);
    expect(ready.variants.w1600!.byteSize).toBeLessThan(4_500_000);
    expect(ready.variants.w1600!.byteSize).toBeLessThanOrEqual(
      MEDIA_MAX_VARIANT_BYTES,
    );
  });

  it("handles idempotent retries, concurrent finalize races, and refuses failed/deleted rows with zero Storage writes", async () => {
    const assetId = randomUUID();
    const jpg = await createDirtyJpeg(640, 480);
    fakeState.rows.set(assetId, makeRow({ id: assetId, tenant_id: tenantA }));
    fakeState.objects.set(buildMediaStagingKey(tenantA, assetId), {
      bytes: jpg,
      contentType: "image/jpeg",
      version: 1,
    });

    const first = await finalizeMediaUpload(authA, { assetId });
    const uploadsAfterFirst = fakeState.uploadCalls.length;
    const retry = await finalizeMediaUpload(authA, { assetId });
    expect(retry.status).toBe("ready");
    expect(retry.masterKey).toBe(first.masterKey);
    expect(fakeState.uploadCalls.length).toBe(uploadsAfterFirst);

    const racedId = randomUUID();
    fakeState.rows.set(racedId, makeRow({ id: racedId, tenant_id: tenantA }));
    fakeState.objects.set(buildMediaStagingKey(tenantA, racedId), {
      bytes: jpg,
      contentType: "image/jpeg",
      version: 1,
    });
    const [raceA, raceB] = await Promise.all([
      finalizeMediaUpload(authA, { assetId: racedId }),
      finalizeMediaUpload(authA, { assetId: racedId }),
    ]);
    expect(raceA.status).toBe("ready");
    expect(raceB.status).toBe("ready");
    expect(raceA.masterKey).toBe(raceB.masterKey);
    expect(fakeState.rows.get(racedId)!.status).toBe("ready");

    const missingTempWinnerId = randomUUID();
    fakeState.rows.set(
      missingTempWinnerId,
      makeRow({ id: missingTempWinnerId, tenant_id: tenantA }),
    );
    fakeState.onBeforeStagingDownload = () => {
      const existing = fakeState.rows.get(missingTempWinnerId)!;
      fakeState.rows.set(missingTempWinnerId, {
        ...existing,
        status: "ready",
        mime_type: first.mimeType,
        content_hash: first.contentHash,
        master_key: first.masterKey,
        variants: {
          w320: {
            key: first.variants.w320!.key,
            width: first.variants.w320!.width,
            height: first.variants.w320!.height,
            byte_size: first.variants.w320!.byteSize,
            mime_type: first.variants.w320!.mimeType,
          },
        },
        byte_size: first.byteSize,
        width: first.width,
        height: first.height,
      });
    };
    const recovered = await finalizeMediaUpload(authA, {
      assetId: missingTempWinnerId,
    });
    expect(recovered.status).toBe("ready");
    expect(fakeState.rows.get(missingTempWinnerId)!.status).toBe("ready");
    fakeState.onBeforeStagingDownload = null;

    for (const status of ["failed", "deleted"] as const) {
      const badId = randomUUID();
      fakeState.rows.set(
        badId,
        makeRow({ id: badId, tenant_id: tenantA, status }),
      );
      const uploadsBefore = fakeState.uploadCalls.length;
      const removesBefore = fakeState.removeCalls.length;
      await expect(
        finalizeMediaUpload(authA, { assetId: badId }),
      ).rejects.toMatchObject({ status: 404 });
      expect(fakeState.uploadCalls.length).toBe(uploadsBefore);
      expect(fakeState.removeCalls.length).toBe(removesBefore);
    }
  });

  it("serves bounded variants only, supports ETag 304, and refuses original/master/unknown variants", async () => {
    const assetId = randomUUID();
    const img = await sharp({
      create: {
        width: 1200,
        height: 800,
        channels: 3,
        background: { r: 200, g: 100, b: 50 },
      },
    })
      .webp({ quality: 85 })
      .toBuffer();
    fakeState.rows.set(
      assetId,
      makeRow({
        id: assetId,
        tenant_id: tenantA,
        declared_mime_type: "image/webp",
      }),
    );
    fakeState.objects.set(buildMediaStagingKey(tenantA, assetId), {
      bytes: img,
      contentType: "image/webp",
      version: 1,
    });
    const ready = await finalizeMediaUpload(authA, { assetId });

    const blobDownloadsBeforeRead = fakeState.downloadCalls.length;
    const defaultRead = await readMediaVariant(authA, { assetId });
    expect(defaultRead.notModified).toBe(false);
    expect(defaultRead.variant).toBe("w960");
    if (!defaultRead.notModified) {
      expect(fakeState.streamDownloadCalls).toContain(ready.variants.w960!.key);
      expect(fakeState.downloadCalls.length).toBe(blobDownloadsBeforeRead);
      const streamed = Buffer.from(
        await new Response(defaultRead.stream).arrayBuffer(),
      );
      expect(
        streamed.equals(fakeState.objects.get(ready.variants.w960!.key)!.bytes),
      ).toBe(true);
      expect(
        streamed.equals(fakeState.objects.get(ready.masterKey!)!.bytes),
      ).toBe(false);
    }

    const oversizedKey = ready.variants.w320!.key;
    fakeState.objects.set(oversizedKey, {
      bytes: Buffer.alloc(MEDIA_MAX_VARIANT_BYTES + 1024, 0x11),
      contentType: "image/webp",
      version: 2,
    });
    const oversizedRead = await readMediaVariant(authA, {
      assetId,
      variant: "w320",
    });
    expect(oversizedRead.notModified).toBe(false);
    if (!oversizedRead.notModified) {
      await expect(
        new Response(oversizedRead.stream).arrayBuffer(),
      ).rejects.toThrow();
    }

    const downloadsBefore304 =
      fakeState.downloadCalls.length + fakeState.streamDownloadCalls.length;
    const cached = await readMediaVariant(authA, {
      assetId,
      ifNoneMatch: defaultRead.etag,
    });
    expect(cached.notModified).toBe(true);
    expect(
      fakeState.downloadCalls.length + fakeState.streamDownloadCalls.length,
    ).toBe(downloadsBefore304);

    const smallRead = await readMediaVariant(authA, {
      assetId,
      variant: "w320",
    });
    expect(smallRead.variant).toBe("w320");

    for (const invalidVariant of ["original", "master", "w1600", "w9999"]) {
      await expect(
        readMediaVariant(authA, { assetId, variant: invalidVariant }),
      ).rejects.toMatchObject({ status: 404 });
    }
  });

  it("serializes overlapping Sharp finalizes per instance so at most one transform runs at a time", async () => {
    const img1 = await createDirtyJpeg(400, 300);
    const img2 = await createDirtyJpeg(420, 310);
    const id1 = randomUUID();
    const id2 = randomUUID();
    fakeState.rows.set(id1, makeRow({ id: id1, tenant_id: tenantA }));
    fakeState.rows.set(id2, makeRow({ id: id2, tenant_id: tenantA }));
    fakeState.objects.set(buildMediaStagingKey(tenantA, id1), {
      bytes: img1,
      contentType: "image/jpeg",
      version: 1,
    });
    fakeState.objects.set(buildMediaStagingKey(tenantA, id2), {
      bytes: img2,
      contentType: "image/jpeg",
      version: 1,
    });

    let activeDownloads = 0;
    let maxActiveDownloads = 0;
    let releaseFirst!: () => void;
    const firstEntered = new Promise<void>((resolve) => {
      let seen = 0;
      fakeState.onBeforeStagingDownload = async () => {
        seen += 1;
        activeDownloads += 1;
        maxActiveDownloads = Math.max(maxActiveDownloads, activeDownloads);
        if (seen === 1) {
          resolve();
          await new Promise<void>((r) => {
            releaseFirst = r;
          });
        }
        activeDownloads -= 1;
      };
    });

    const p1 = finalizeMediaUpload(authA, { assetId: id1 });
    await firstEntered;
    const p2 = finalizeMediaUpload(authA, { assetId: id2 });
    await new Promise((r) => setTimeout(r, 40));
    expect(maxActiveDownloads).toBe(1);
    releaseFirst();

    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1.status).toBe("ready");
    expect(r2.status).toBe("ready");
    expect(maxActiveDownloads).toBe(1);
  });

  it("refuses to return a signed upload token when concurrent deletion transitions the row out of uploading before confirmation (W6-R16 point 7)", async () => {
    const assetId = randomUUID();
    fakeState.rows.set(
      assetId,
      makeRow({ id: assetId, tenant_id: tenantA, status: "uploading" }),
    );
    fakeState.onBeforeCasUpdate = (id) => {
      if (id === assetId) {
        const cur = fakeState.rows.get(assetId)!;
        fakeState.rows.set(assetId, {
          ...cur,
          status: "deleted",
          deleted_at: new Date().toISOString(),
          purge_after: new Date(Date.now() + 35 * 86_400_000).toISOString(),
        });
      }
    };

    await expect(issueSignedUpload(authA, { assetId })).rejects.toMatchObject({
      status: 404,
    });
  });

  it("drops an aborted waiter from the transform slot queue without running work and lets the next waiter proceed (W6-R16 point 9)", async () => {
    const img1 = await createDirtyJpeg(400, 300);
    const img2 = await createDirtyJpeg(410, 305);
    const img3 = await createDirtyJpeg(420, 310);
    const id1 = randomUUID();
    const id2 = randomUUID();
    const id3 = randomUUID();
    for (const [id, img] of [
      [id1, img1],
      [id2, img2],
      [id3, img3],
    ] as const) {
      fakeState.rows.set(id, makeRow({ id, tenant_id: tenantA }));
      fakeState.objects.set(buildMediaStagingKey(tenantA, id), {
        bytes: img,
        contentType: "image/jpeg",
        version: 1,
      });
    }

    let releaseFirst!: () => void;
    const firstEntered = new Promise<void>((resolve) => {
      fakeState.onBeforeStagingDownload = async (objectPath) => {
        if (objectPath === buildMediaStagingKey(tenantA, id1)) {
          resolve();
          await new Promise<void>((r) => {
            releaseFirst = r;
          });
        }
      };
    });

    const ac2 = new AbortController();
    const ac3 = new AbortController();
    const p1 = finalizeMediaUpload(authA, { assetId: id1 });
    await firstEntered;

    const p2 = finalizeMediaUpload(authA, {
      assetId: id2,
      signal: ac2.signal,
    });
    const p3 = finalizeMediaUpload(authA, {
      assetId: id3,
      signal: ac3.signal,
    });
    await new Promise((r) => setTimeout(r, 30));

    ac2.abort();
    const cancelledOutcome = await Promise.race([
      p2.then(
        () => "resolved" as const,
        (err: { status?: number }) => err.status ?? -1,
      ),
      new Promise<"timed_out">((r) => setTimeout(() => r("timed_out"), 200)),
    ]);
    releaseFirst();

    const [r1, r3] = await Promise.all([p1, p3]);
    expect(cancelledOutcome).toBe(499);
    expect(r1.status).toBe("ready");
    expect(r3.status).toBe("ready");
    expect(fakeState.downloadCalls).not.toContain(
      buildMediaStagingKey(tenantA, id2),
    );
    expect(fakeState.rows.get(id2)!.status).toBe("uploading");

    const preAborted = new AbortController();
    preAborted.abort();
    await expect(
      finalizeMediaUpload(authA, {
        assetId: id2,
        signal: preAborted.signal,
      }),
    ).rejects.toMatchObject({ status: 499 });
  });

  it("contains no canonical object removal path anywhere in the media storage module (W6-R15)", () => {
    const mediaStoreSource = readFileSync(
      path.resolve(__dirname, "../../src/storage/media-store.ts"),
      "utf8",
    );
    const mediaConstantsSource = readFileSync(
      path.resolve(__dirname, "../../src/storage/media-constants.ts"),
      "utf8",
    );

    expect(mediaStoreSource).not.toMatch(/\bpurgeExpiredMedia\b/);
    expect(mediaStoreSource).not.toMatch(/\bclaim_media_content_purge\b/);
    expect(mediaStoreSource).not.toMatch(/\brelease_media_content_purge\b/);
    expect(mediaStoreSource).not.toMatch(/\bmedia_purge_claims\b/);

    const forbiddenCanonicalMutation =
      /upsert\s*:\s*true|\.move\s*\(|\.copy\s*\(|\bemptyBucket\b|\bdeleteBucket\b|\.remove\b(?!\s*\(\s*\[stagingPath\]\s*\))/;
    expect(mediaStoreSource).not.toMatch(forbiddenCanonicalMutation);
    for (const negativeControl of [
      mediaStoreSource.replace("upsert: false", "upsert: true"),
      `${mediaStoreSource}\nawait bucket.move(a, b);`,
      `${mediaStoreSource}\nawait bucket.copy(a, b);`,
      `${mediaStoreSource}\nawait storage.emptyBucket("cms-media");`,
      `${mediaStoreSource}\nawait storage.deleteBucket("cms-media");`,
      `${mediaStoreSource}\nawait bucket.remove([masterKey]);`,
      `${mediaStoreSource}\nconst rm = bucket.remove.bind(bucket);`,
    ]) {
      expect(negativeControl).toMatch(forbiddenCanonicalMutation);
    }

    const removeCalls = [
      ...mediaStoreSource.matchAll(/\.remove\s*\(([^)]*)\)/g),
    ];
    expect(removeCalls).toHaveLength(1);
    expect(removeCalls[0]![1]!.trim()).toBe("[stagingPath]");

    const stagingPathAssignments = [
      ...mediaStoreSource.matchAll(/\bstagingPath\s*=\s*([^\n;]+)/g),
    ].map((m) => m[1]!.trim());
    expect(stagingPathAssignments.length).toBeGreaterThanOrEqual(1);
    for (const rhs of stagingPathAssignments) {
      expect(rhs).toMatch(/^buildMediaStagingKey\(/);
    }
    expect(mediaConstantsSource).toMatch(
      /function buildMediaStagingKey[\s\S]*?return `tmp\/\$\{tenantId\}\/\$\{assetId\}`/,
    );
  });

  it("keeps shared canonical bytes intact when one of two identical-content assets is deleted and preserves canonical keys on mid-finalize tombstones (W6-R15)", async () => {
    const img = await createDirtyJpeg(500, 400);
    const a1 = randomUUID();
    const a2 = randomUUID();
    fakeState.rows.set(a1, makeRow({ id: a1, tenant_id: tenantA }));
    fakeState.rows.set(a2, makeRow({ id: a2, tenant_id: tenantA }));
    fakeState.objects.set(buildMediaStagingKey(tenantA, a1), {
      bytes: img,
      contentType: "image/jpeg",
      version: 1,
    });
    fakeState.objects.set(buildMediaStagingKey(tenantA, a2), {
      bytes: img,
      contentType: "image/jpeg",
      version: 1,
    });

    const r1 = await finalizeMediaUpload(authA, { assetId: a1 });
    const r2 = await finalizeMediaUpload(authA, { assetId: a2 });
    expect(r1.masterKey).toBe(r2.masterKey);
    expect(r1.contentHash).toBe(r2.contentHash);

    for (const removedBatch of fakeState.removeCalls) {
      for (const removedKey of removedBatch) {
        expect(removedKey.startsWith("tmp/")).toBe(true);
      }
    }

    const row1 = fakeState.rows.get(a1)!;
    const deletedAt = "2026-11-24T00:00:00.000Z";
    const purgeAfter = "2026-12-29T00:00:00.000Z";
    fakeState.rows.set(a1, {
      ...row1,
      status: "deleted",
      deleted_at: deletedAt,
      purge_after: purgeAfter,
    });

    expect(fakeState.objects.has(r1.masterKey!)).toBe(true);
    expect(fakeState.objects.has(r1.variants.w320!.key)).toBe(true);
    await expect(
      readMediaVariant(authA, { assetId: a1 }),
    ).rejects.toMatchObject({ status: 404 });

    const surviving = await readMediaVariant(authA, { assetId: a2 });
    expect(surviving.notModified).toBe(false);
    if (!surviving.notModified) {
      const streamed = Buffer.from(
        await new Response(surviving.stream).arrayBuffer(),
      );
      expect(
        streamed.equals(fakeState.objects.get(r2.variants.w320!.key)!.bytes),
      ).toBe(true);
    }

    const midAssetId = randomUUID();
    const midStagingKey = buildMediaStagingKey(tenantA, midAssetId);
    fakeState.rows.set(
      midAssetId,
      makeRow({ id: midAssetId, tenant_id: tenantA }),
    );
    fakeState.objects.set(midStagingKey, {
      bytes: img,
      contentType: "image/jpeg",
      version: 1,
    });

    fakeState.onBeforeCasUpdate = (targetId) => {
      if (targetId === midAssetId) {
        const cur = fakeState.rows.get(midAssetId)!;
        fakeState.rows.set(midAssetId, {
          ...cur,
          status: "deleted",
          deleted_at: deletedAt,
          purge_after: purgeAfter,
        });
      }
    };

    await expect(
      finalizeMediaUpload(authA, { assetId: midAssetId }),
    ).rejects.toMatchObject({ status: 404 });

    const tomb = fakeState.rows.get(midAssetId)!;
    expect(tomb.status).toBe("deleted");
    expect(tomb.content_hash).toBe(r1.contentHash);
    expect(tomb.master_key).toBe(r1.masterKey);
    expect(tomb.variants.w320?.key).toBe(r1.variants.w320!.key);
    expect(fakeState.objects.has(r1.masterKey!)).toBe(true);
    expect(fakeState.objects.has(r1.variants.w320!.key)).toBe(true);
    for (const removedBatch of fakeState.removeCalls) {
      for (const removedKey of removedBatch) {
        expect(removedKey.startsWith("tmp/")).toBe(true);
      }
    }
  });

  it("preserves staging and uploading state across transient Storage and database errors", async () => {
    const jpg = await createDirtyJpeg(480, 320);

    const transientDlId = randomUUID();
    const transientDlKey = buildMediaStagingKey(tenantA, transientDlId);
    fakeState.rows.set(
      transientDlId,
      makeRow({ id: transientDlId, tenant_id: tenantA }),
    );
    fakeState.objects.set(transientDlKey, {
      bytes: jpg,
      contentType: "image/jpeg",
      version: 1,
    });
    fakeState.nextDownloadError = {
      message: "Storage upstream unavailable",
      statusCode: "503",
    };
    await expect(
      finalizeMediaUpload(authA, { assetId: transientDlId }),
    ).rejects.toMatchObject({ status: 502 });
    expect(fakeState.rows.get(transientDlId)!.status).toBe("uploading");
    expect(fakeState.objects.has(transientDlKey)).toBe(true);
    const retriedAfterDl = await finalizeMediaUpload(authA, {
      assetId: transientDlId,
    });
    expect(retriedAfterDl.status).toBe("ready");

    const transientUploadId = randomUUID();
    const transientUploadKey = buildMediaStagingKey(tenantA, transientUploadId);
    fakeState.rows.set(
      transientUploadId,
      makeRow({ id: transientUploadId, tenant_id: tenantA }),
    );
    fakeState.objects.set(transientUploadKey, {
      bytes: jpg,
      contentType: "image/jpeg",
      version: 1,
    });
    fakeState.nextUploadError = {
      message: "Temporary write failure",
      statusCode: "503",
    };
    await expect(
      finalizeMediaUpload(authA, { assetId: transientUploadId }),
    ).rejects.toMatchObject({ status: 502 });
    expect(fakeState.rows.get(transientUploadId)!.status).toBe("uploading");
    expect(fakeState.objects.has(transientUploadKey)).toBe(true);
    const retriedAfterUpload = await finalizeMediaUpload(authA, {
      assetId: transientUploadId,
    });
    expect(retriedAfterUpload.status).toBe("ready");

    const transientDbId = randomUUID();
    const transientDbKey = buildMediaStagingKey(tenantA, transientDbId);
    fakeState.rows.set(
      transientDbId,
      makeRow({ id: transientDbId, tenant_id: tenantA }),
    );
    fakeState.objects.set(transientDbKey, {
      bytes: jpg,
      contentType: "image/jpeg",
      version: 1,
    });
    fakeState.nextUpdateError = { message: "connection reset" };
    await expect(
      finalizeMediaUpload(authA, { assetId: transientDbId }),
    ).rejects.toMatchObject({ status: 500 });
    expect(fakeState.rows.get(transientDbId)!.status).toBe("uploading");
    expect(fakeState.objects.has(transientDbKey)).toBe(true);
    const retriedAfterDb = await finalizeMediaUpload(authA, {
      assetId: transientDbId,
    });
    expect(retriedAfterDb.status).toBe("ready");

    const failWriteErrId = randomUUID();
    const failWriteErrKey = buildMediaStagingKey(tenantA, failWriteErrId);
    fakeState.rows.set(
      failWriteErrId,
      makeRow({ id: failWriteErrId, tenant_id: tenantA }),
    );
    fakeState.objects.set(failWriteErrKey, {
      bytes: Buffer.from("not-an-image"),
      contentType: "image/jpeg",
      version: 1,
    });
    fakeState.nextUpdateError = { message: "db write unavailable" };
    await expect(
      finalizeMediaUpload(authA, { assetId: failWriteErrId }),
    ).rejects.toMatchObject({ status: 500 });
    expect(fakeState.rows.get(failWriteErrId)!.status).toBe("uploading");
    expect(fakeState.objects.has(failWriteErrKey)).toBe(true);

    fakeState.nextStreamError = {
      message: "Storage gateway timeout",
      statusCode: "503",
    };
    await expect(
      readMediaVariant(authA, { assetId: transientDlId }),
    ).rejects.toMatchObject({ status: 502 });
  });
});
