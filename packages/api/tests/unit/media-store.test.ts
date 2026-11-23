import { createHash, randomUUID } from "node:crypto";

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
  purgeExpiredMedia,
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
  purged_at: string | null;
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
  onBeforeCasUpdate: null as null | ((id: string) => void),
  onBeforeStagingDownload: null as null | ((path: string) => void),
}));

function matchesFilters(
  row: AssetRow,
  filters: Array<
    | { op: "eq"; col: string; val: unknown }
    | { op: "neq"; col: string; val: unknown }
    | { op: "is"; col: string; val: unknown }
    | { op: "notIs"; col: string; val: unknown }
    | { op: "lte"; col: string; val: unknown }
  >,
): boolean {
  for (const f of filters) {
    const actual = (row as Record<string, unknown>)[f.col];
    if (f.op === "eq" && actual !== f.val) return false;
    if (f.op === "neq" && actual === f.val) return false;
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
    from(table: string) {
      if (table !== "media_assets") {
        throw new Error(`Unexpected table: ${table}`);
      }
      const filters: Array<
        | { op: "eq"; col: string; val: unknown }
        | { op: "neq"; col: string; val: unknown }
        | { op: "is"; col: string; val: unknown }
        | { op: "notIs"; col: string; val: unknown }
        | { op: "lte"; col: string; val: unknown }
      > = [];
      let pendingUpdate: Partial<AssetRow> | null = null;
      let wantCountOnly = false;

      const execute = (singleMode: "many" | "maybeSingle") => {
        if (pendingUpdate) {
          const matched: AssetRow[] = [];
          const idFilter = filters.find((f) => f.op === "eq" && f.col === "id");
          if (idFilter && typeof idFilter.val === "string") {
            fakeState.onBeforeCasUpdate?.(idFilter.val);
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
            return {
              data: {
                signedUrl: `http://127.0.0.1:54321/storage/v1/upload/sign/${bucket}/${objectPath}?token=tok-${objectPath}`,
                path: objectPath,
                token: `tok-${objectPath}`,
              },
              error: null,
            };
          },
          async download(objectPath: string) {
            fakeState.downloadCalls.push(objectPath);
            if (objectPath.startsWith("tmp/")) {
              fakeState.onBeforeStagingDownload?.(objectPath);
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
          },
          async upload(
            objectPath: string,
            body: Uint8Array | Buffer,
            options?: { contentType?: string; upsert?: boolean },
          ) {
            fakeState.uploadCalls.push(objectPath);
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
            return { data: { path: objectPath }, error: null };
          },
          async remove(paths: string[]) {
            fakeState.removeCalls.push([...paths]);
            for (const p of paths) {
              fakeState.objects.delete(p);
            }
            return { data: paths.map((name) => ({ name })), error: null };
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
    purged_at: null,
    ...overrides,
  };
}

function injectJpegXmpSegment(jpeg: Buffer): Buffer {
  const xmpPayload = Buffer.concat([
    Buffer.from("http://ns.adobe.com/xap/1.0/\0", "utf8"),
    Buffer.from(
      '<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description exif:GPSLatitude="37,46.5N" xmlns:exif="http://ns.adobe.com/exif/1.0/"/></rdf:RDF></x:xmpmeta>',
      "utf8",
    ),
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
    fakeState.onBeforeCasUpdate = null;
    fakeState.onBeforeStagingDownload = null;
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

  it("keeps largest bounded variant under 4.5 MB even for a 25 MP ceiling image", async () => {
    const ceilingId = randomUUID();
    const ceilingPng = await sharp({
      create: {
        width: 5000,
        height: 5000,
        channels: 3,
        background: { r: 90, g: 130, b: 170 },
      },
    })
      .png({ compressionLevel: 9 })
      .toBuffer();
    fakeState.rows.set(
      ceilingId,
      makeRow({
        id: ceilingId,
        tenant_id: tenantA,
        declared_mime_type: "image/png",
      }),
    );
    fakeState.objects.set(buildMediaStagingKey(tenantA, ceilingId), {
      bytes: ceilingPng,
      contentType: "image/png",
      version: 1,
    });
    const ready = await finalizeMediaUpload(authA, { assetId: ceilingId });
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

    const defaultRead = await readMediaVariant(authA, { assetId });
    expect(defaultRead.notModified).toBe(false);
    expect(defaultRead.variant).toBe("w960");
    if (!defaultRead.notModified) {
      expect(
        defaultRead.bytes.equals(
          fakeState.objects.get(ready.variants.w960!.key)!.bytes,
        ),
      ).toBe(true);
      expect(
        defaultRead.bytes.equals(
          fakeState.objects.get(ready.masterKey!)!.bytes,
        ),
      ).toBe(false);
    }

    const downloadsBefore304 = fakeState.downloadCalls.length;
    const cached = await readMediaVariant(authA, {
      assetId,
      ifNoneMatch: defaultRead.etag,
    });
    expect(cached.notModified).toBe(true);
    expect(fakeState.downloadCalls.length).toBe(downloadsBefore304);

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

  it("purges only past purge_after, preserves shared content_hash objects, cleans uploading staging, and honors live-use hook", async () => {
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
    await finalizeMediaUpload(authA, { assetId: a2 });

    const now = new Date("2027-01-01T00:00:00.000Z");
    const futurePurge = new Date("2027-02-05T00:00:00.000Z");
    const pastPurge = new Date("2026-12-31T00:00:00.000Z");

    const row1 = fakeState.rows.get(a1)!;
    fakeState.rows.set(a1, {
      ...row1,
      status: "deleted",
      deleted_at: "2026-11-23T00:00:00.000Z",
      purge_after: futurePurge.toISOString(),
    });
    const beforeDelay = await purgeExpiredMedia({ now });
    expect(beforeDelay.purgedRows).toBe(0);
    expect(beforeDelay.removedObjects).toBe(0);
    expect(fakeState.objects.has(r1.masterKey!)).toBe(true);

    fakeState.rows.set(a1, {
      ...fakeState.rows.get(a1)!,
      purge_after: pastPurge.toISOString(),
    });
    const sharedResult = await purgeExpiredMedia({ now });
    expect(sharedResult.purgedRows).toBe(1);
    expect(sharedResult.keptSharedObjects).toBe(1);
    expect(sharedResult.removedObjects).toBe(0);
    expect(fakeState.objects.has(r1.masterKey!)).toBe(true);
    expect(fakeState.objects.has(r1.variants.w320!.key)).toBe(true);

    const row2 = fakeState.rows.get(a2)!;
    fakeState.rows.set(a2, {
      ...row2,
      status: "deleted",
      deleted_at: "2026-11-23T00:00:00.000Z",
      purge_after: pastPurge.toISOString(),
    });
    const blockedByLiveUse = await purgeExpiredMedia({
      now,
      hasLiveUse: async (_t, id) => id === a2,
    });
    expect(blockedByLiveUse.skippedLiveUse).toBe(1);
    expect(blockedByLiveUse.removedObjects).toBe(0);
    expect(fakeState.objects.has(r1.masterKey!)).toBe(true);

    const finalPurge = await purgeExpiredMedia({ now });
    expect(finalPurge.purgedRows).toBe(1);
    expect(finalPurge.removedObjects).toBeGreaterThanOrEqual(2);
    expect(fakeState.objects.has(r1.masterKey!)).toBe(false);
    expect(fakeState.objects.has(r1.variants.w320!.key)).toBe(false);

    const uploadingDeleted = randomUUID();
    const stagingKey = buildMediaStagingKey(tenantA, uploadingDeleted);
    fakeState.rows.set(
      uploadingDeleted,
      makeRow({
        id: uploadingDeleted,
        tenant_id: tenantA,
        status: "deleted",
        deleted_at: "2026-11-23T00:00:00.000Z",
        purge_after: pastPurge.toISOString(),
      }),
    );
    fakeState.objects.set(stagingKey, {
      bytes: Buffer.from("partial"),
      contentType: "image/jpeg",
      version: 1,
    });
    const stagingPurge = await purgeExpiredMedia({ now });
    expect(stagingPurge.removedStagingObjects).toBe(1);
    expect(fakeState.objects.has(stagingKey)).toBe(false);
  });
});
