import { randomUUID } from "node:crypto";

import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import pg from "pg";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { POST as deleteMediaPost } from "@asym/api/cms/media/delete";
import { POST as finalizeMediaPost } from "@asym/api/cms/media/finalize";
import { POST as startMediaPost } from "@asym/api/cms/media/start";
import { GET as mediaGet } from "@asym/api/media/route";
import {
  buildMediaMasterKey,
  buildMediaStagingKey,
  buildMediaVariantKey,
  MEDIA_BUCKET,
  MEDIA_MAX_BYTES,
  MEDIA_MAX_VARIANT_BYTES,
} from "@asym/api/storage/media-constants";
import {
  finalizeMediaUpload,
  purgeExpiredMedia,
} from "@asym/api/storage/media-store";

import { GET as donorMediaMount } from "../../../../apps/donor/app/api/media/[assetId]/route";
import { proxy as donorProxy } from "../../../../apps/donor/proxy";
import { GET as missionaryMediaMount } from "../../../../apps/missionary/app/api/media/[assetId]/route";
import { proxy as missionaryProxy } from "../../../../apps/missionary/proxy";

import type { AuthenticatedContext } from "@asym/auth/context";

const url = process.env.WP6_MEDIA_IT_URL;
const database = process.env.WP6_MEDIA_IT_DATABASE_URL;
const anonKey = process.env.WP6_MEDIA_IT_ANON_KEY;
const serviceKey = process.env.WP6_MEDIA_IT_SERVICE_KEY;
const required = process.env.GITHUB_JOB === "local-supabase";
const configured = Boolean(url || database || anonKey || serviceKey);

let realAdminClient: SupabaseClient | null = null;

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () =>
    realAdminClient
      ? { client: realAdminClient, error: null }
      : { client: null, error: "Admin client unavailable" },
}));

vi.mock("@asym/lib/audit/logger", () => ({
  createAuditLogger: () => ({
    logRequired: async () => undefined,
    log: async () => undefined,
  }),
}));

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

async function createDirtyJpeg(
  width = 1800,
  height = 1200,
  background: { r: number; g: number; b: number } = { r: 44, g: 112, b: 184 },
): Promise<Buffer> {
  const base = await sharp({
    create: {
      width,
      height,
      channels: 3,
      background,
    },
  })
    .withMetadata({ orientation: 6 })
    .withExifMerge({
      IFD0: { Make: "WP6LocalStackCam", Software: "GPSLocationFixture" },
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
      background: { r: 16, g: 144, b: 96, alpha: 1 },
    },
  })
    .withMetadata({ orientation: 6 })
    .withExifMerge({
      IFD0: { Make: "WP6LocalPngCam", Software: "GPSLocationFixture" },
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
      background: { r: 210, g: 120, b: 30 },
    },
  })
    .withMetadata({ orientation: 6 })
    .withExifMerge({
      IFD0: { Make: "WP6LocalWebpCam", Software: "GPSLocationFixture" },
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
  let state = 0x24681357;
  for (let i = 0; i < tile.byteLength; i += 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    tile[i] = (state >>> 24) & 0xff;
  }
  return sharp(tile, { raw: { width: tileW, height: tileH, channels: 3 } })
    .resize(5000, 5000, { kernel: "lanczos3" })
    .jpeg({ quality: 88 })
    .toBuffer();
}

function applyProxyForwardedHeaders(
  originalRequest: NextRequest,
  proxyResponse: Response,
): NextRequest {
  const forwarded = new Headers(originalRequest.headers);
  const overrideList = proxyResponse.headers.get(
    "x-middleware-override-headers",
  );
  if (overrideList) {
    for (const name of overrideList.split(",")) {
      const trimmed = name.trim();
      if (!trimmed) continue;
      const value = proxyResponse.headers.get(
        `x-middleware-request-${trimmed}`,
      );
      if (value === null) {
        forwarded.delete(trimmed);
      } else {
        forwarded.set(trimmed, value);
      }
    }
  }
  return new NextRequest(originalRequest.url, {
    method: originalRequest.method,
    headers: forwarded,
  });
}

type CreatedUser = {
  id: string;
  email: string;
  password: string;
  accessToken: string;
  cookieHeader: string;
};

it.runIf(required && !configured)(
  "local-supabase supplies WP6_MEDIA_IT settings (fails, never skips)",
  () => {
    expect(configured).toBe(true);
  },
);

describe.skipIf(!required && !configured)(
  "AL-2679 WP6 part 1 media custody on disposable local Auth, PostgREST and Storage stack only",
  () => {
    const tenantA = randomUUID();
    const tenantB = randomUUID();
    const mStaffA = randomUUID();
    const mStaffB = randomUUID();
    const mMultiA = randomUUID();
    const mMultiB = randomUUID();
    const mSub1 = randomUUID();
    const mSub2 = randomUUID();
    const mInactive = randomUUID();
    const mLive = randomUUID();
    const mDonorA = randomUUID();
    const mMissionaryA = randomUUID();
    const mStaffNoCapA = randomUUID();

    let db: pg.Client | undefined;
    let staffA!: CreatedUser;
    let staffB!: CreatedUser;
    let multiUser!: CreatedUser;
    let twoSubrolesUser!: CreatedUser;
    let inactiveLiveUser!: CreatedUser;
    let donorA!: CreatedUser;
    let missionaryA!: CreatedUser;
    let staffNoCapA!: CreatedUser;
    const createdUserIds: string[] = [];
    const createdStorageKeys = new Set<string>();

    async function createSignedInUser(prefix: string): Promise<CreatedUser> {
      const email = `wp6-${prefix}-${randomUUID()}@example.test`;
      const password = randomUUID();
      const createRes = await fetch(`${url}/auth/v1/admin/users`, {
        method: "POST",
        headers: {
          apikey: serviceKey!,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, email_confirm: true }),
      });
      expect(createRes.ok, `create user ${prefix}`).toBe(true);
      const createdJson = (await createRes.json()) as { id: string };
      createdUserIds.push(createdJson.id);

      const capturedCookies = new Map<string, string>();
      const ssrClient = createServerClient(url!, anonKey!, {
        cookies: {
          getAll: () =>
            [...capturedCookies.entries()].map(([name, value]) => ({
              name,
              value,
            })),
          setAll: (cookiesToSet) => {
            for (const { name, value } of cookiesToSet) {
              if (value === "") capturedCookies.delete(name);
              else capturedCookies.set(name, value);
            }
          },
        },
      });
      const { data: signInData, error: signInError } =
        await ssrClient.auth.signInWithPassword({ email, password });
      expect(signInError, `login user ${prefix}`).toBeNull();
      expect(signInData.session?.access_token).toBeTruthy();
      const cookieHeader = [...capturedCookies.entries()]
        .map(([name, value]) => `${name}=${value}`)
        .join("; ");
      expect(cookieHeader).toContain("-auth-token");
      return {
        id: createdJson.id,
        email,
        password,
        accessToken: signInData.session!.access_token,
        cookieHeader,
      };
    }

    function staffRequest(
      path: string,
      user: CreatedUser,
      tenantId: string,
      assignmentId: string,
      body: object,
    ) {
      return new NextRequest(`http://127.0.0.1:3001${path}`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${user.accessToken}`,
          "content-type": "application/json",
          "x-asym-role-class": "staff",
          "x-asym-tenant": tenantId,
          "x-asym-assignment": assignmentId,
        },
        body: JSON.stringify(body),
      });
    }

    function makeAdmittedAuth(
      user: CreatedUser,
      tenantId: string,
      assignmentId: string,
    ): AuthenticatedContext {
      return {
        userId: user.id,
        email: user.email,
        tenantId,
        role: "admin",
        profileId: user.id,
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
        assignment: {
          assignmentId,
          userId: user.id,
          tenantId,
          revision: "rev-1",
          membershipRole: "staff",
          staffRole: "development",
          isTenantAdmin: false,
        },
      };
    }

    async function trackAssetKeys(asset: {
      masterKey?: string | null;
      variants?: Record<string, { key: string } | undefined>;
    }) {
      if (asset.masterKey) createdStorageKeys.add(asset.masterKey);
      for (const variant of Object.values(asset.variants ?? {})) {
        if (variant?.key) createdStorageKeys.add(variant.key);
      }
    }

    beforeAll(async () => {
      if (
        !url ||
        !database ||
        !anonKey ||
        !serviceKey ||
        ![url, database].every((value) =>
          ["localhost", "127.0.0.1", "[::1]"].includes(new URL(value).hostname),
        )
      ) {
        throw new Error(
          "A disposable local loopback Supabase stack is required for WP6_MEDIA_IT",
        );
      }

      db = new pg.Client({ connectionString: database });
      await db.connect();

      const envMarker = await db.query(`select kind from platform.environment`);
      if (
        envMarker.rows.length !== 1 ||
        envMarker.rows[0]?.kind !== "disposable"
      ) {
        await db.end();
        db = undefined;
        throw new Error(
          `Refusing to run WP6_MEDIA_IT against non-disposable database (platform.environment.kind=${String(envMarker.rows[0]?.kind ?? "missing")})`,
        );
      }

      vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url);
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", anonKey);
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", anonKey);

      realAdminClient = createClient(url, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      staffA = await createSignedInUser("staff-a");
      staffB = await createSignedInUser("staff-b");
      multiUser = await createSignedInUser("multi");
      twoSubrolesUser = await createSignedInUser("subroles");
      inactiveLiveUser = await createSignedInUser("inactivelive");
      donorA = await createSignedInUser("donor-a");
      missionaryA = await createSignedInUser("missionary-a");
      staffNoCapA = await createSignedInUser("staff-nocap-a");

      await db.query("begin");
      try {
        await db.query(
          `insert into public.tenants (id, name, slug, status)
           values ($1::uuid, 'WP6 Stack A', 'wp6-stack-a-' || $1::uuid::text, 'active'),
                  ($2::uuid, 'WP6 Stack B', 'wp6-stack-b-' || $2::uuid::text, 'active')`,
          [tenantA, tenantB],
        );
        await db.query(
          `delete from authz.memberships where user_id = any($1::uuid[])`,
          [createdUserIds],
        );
        await db.query(
          `insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_active, revoked_at)
           values
             ($1, $2, $3, 'staff', 'development', true, null),
             ($4, $5, $6, 'staff', 'development', true, null),
             ($7, $8, $3, 'staff', 'finance', true, null),
             ($9, $8, $6, 'staff', 'mobilizer', true, null),
             ($10, $11, $3, 'staff', 'finance', true, null),
             ($12, $11, $3, 'staff', 'development', true, null),
             ($13, $14, $3, 'staff', 'hr', false, null),
             ($15, $14, $3, 'staff', 'finance', true, null),
             ($16, $17, $3, 'donor', null, true, null),
             ($18, $19, $3, 'missionary', null, true, null),
             ($20, $21, $3, 'staff', 'hr', true, null)`,
          [
            mStaffA,
            staffA.id,
            tenantA,
            mStaffB,
            staffB.id,
            tenantB,
            mMultiA,
            multiUser.id,
            mMultiB,
            mSub1,
            twoSubrolesUser.id,
            mSub2,
            mInactive,
            inactiveLiveUser.id,
            mLive,
            mDonorA,
            donorA.id,
            mMissionaryA,
            missionaryA.id,
            mStaffNoCapA,
            staffNoCapA.id,
          ],
        );
        await db.query("commit");
      } catch (error) {
        await db.query("rollback");
        throw error;
      }
    });

    afterAll(async () => {
      try {
        if (realAdminClient && createdStorageKeys.size > 0) {
          await realAdminClient.storage
            .from(MEDIA_BUCKET)
            .remove([...createdStorageKeys])
            .catch(() => undefined);
        }
        if (db) {
          await db.query("begin");
          try {
            await db.query(
              `delete from public.media_purge_claims where tenant_id in ($1, $2)`,
              [tenantA, tenantB],
            );
            await db.query(
              `delete from public.media_assets where tenant_id in ($1, $2)`,
              [tenantA, tenantB],
            );
            await db.query(
              `delete from authz.memberships where tenant_id in ($1, $2)`,
              [tenantA, tenantB],
            );
            await db.query(`delete from public.tenants where id in ($1, $2)`, [
              tenantA,
              tenantB,
            ]);
            await db.query("commit");
          } catch (error) {
            await db.query("rollback");
            throw error;
          } finally {
            await db.end();
          }
        }
      } finally {
        for (const uid of createdUserIds) {
          await fetch(`${url}/auth/v1/admin/users/${uid}`, {
            method: "DELETE",
            headers: {
              apikey: serviceKey!,
              Authorization: `Bearer ${serviceKey}`,
            },
          }).catch(() => undefined);
        }
        vi.unstubAllEnvs();
      }
    });

    it("proves signed upload, per-format EXIF/GPS/ICC/XMP stripping on master and all variants, token scope/replay/sweep, and tenant isolation (1024, 1026, F7)", async () => {
      const dirtyJpeg = await createDirtyJpeg(2000, 1700);
      const jpegInMeta = await sharp(dirtyJpeg).metadata();
      expect(jpegInMeta.orientation).toBe(6);
      expect(jpegInMeta.exif).toBeDefined();
      expect(jpegInMeta.icc).toBeDefined();
      expect(jpegInMeta.xmp).toBeDefined();

      const startRes = await startMediaPost(
        staffRequest("/api/cms/media/start", staffA, tenantA, mStaffA, {
          byteSize: dirtyJpeg.byteLength,
          mimeType: "image/jpeg",
        }),
      );
      expect(startRes.status).toBe(201);
      const started = (await startRes.json()) as {
        assetId: string;
        stagingPath: string;
        token: string;
        signedUrl: string;
      };
      expect(started.stagingPath).toBe(
        buildMediaStagingKey(tenantA, started.assetId),
      );
      createdStorageKeys.add(started.stagingPath);

      const expiryRow = await db!.query(
        `select upload_token_expires_at, staging_swept_at from public.media_assets where id = $1`,
        [started.assetId],
      );
      expect(expiryRow.rows[0]!.upload_token_expires_at).not.toBeNull();
      expect(expiryRow.rows[0]!.staging_swept_at).toBeNull();

      const userClient = createClient(url!, anonKey!, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const wrongKeyRes = await userClient.storage
        .from(MEDIA_BUCKET)
        .uploadToSignedUrl(
          buildMediaStagingKey(tenantA, randomUUID()),
          started.token,
          dirtyJpeg,
          { contentType: "image/jpeg" },
        );
      expect(wrongKeyRes.error).not.toBeNull();

      const uploadRes = await userClient.storage
        .from(MEDIA_BUCKET)
        .uploadToSignedUrl(started.stagingPath, started.token, dirtyJpeg, {
          contentType: "image/jpeg",
        });
      expect(uploadRes.error).toBeNull();

      const reuseRes = await userClient.storage
        .from(MEDIA_BUCKET)
        .uploadToSignedUrl(started.stagingPath, started.token, dirtyJpeg, {
          contentType: "image/jpeg",
        });
      expect(reuseRes.error).not.toBeNull();

      const crossFinalize = await finalizeMediaPost(
        staffRequest("/api/cms/media/finalize", staffB, tenantB, mStaffB, {
          assetId: started.assetId,
        }),
      );
      expect(crossFinalize.status).toBe(404);

      const finalizeRes = await finalizeMediaPost(
        staffRequest("/api/cms/media/finalize", staffA, tenantA, mStaffA, {
          assetId: started.assetId,
        }),
      );
      expect(finalizeRes.status).toBe(200);
      const { asset } = (await finalizeRes.json()) as {
        asset: {
          id: string;
          status: string;
          width: number;
          height: number;
          contentHash: string;
          masterKey: string;
          variants: Record<string, { key: string; byteSize: number }>;
        };
      };
      await trackAssetKeys(asset);
      expect(asset.status).toBe("ready");
      expect(asset.width).toBe(1700);
      expect(asset.height).toBe(2000);
      expect(Object.keys(asset.variants).sort()).toEqual([
        "w1600",
        "w320",
        "w960",
      ]);

      const stagedAfter = await realAdminClient!.storage
        .from(MEDIA_BUCKET)
        .download(started.stagingPath);
      expect(stagedAfter.error).not.toBeNull();

      const replayAfterFinalize = await userClient.storage
        .from(MEDIA_BUCKET)
        .uploadToSignedUrl(started.stagingPath, started.token, dirtyJpeg, {
          contentType: "image/jpeg",
        });
      if (!replayAfterFinalize.error) {
        const afterTokenExpiry = new Date(Date.now() + 3 * 60 * 60 * 1000);
        const swept = await purgeExpiredMedia({
          now: afterTokenExpiry,
          tenantIds: [tenantA, tenantB],
        });
        expect(swept.removedStagingObjects).toBeGreaterThanOrEqual(1);
        const replayedGone = await realAdminClient!.storage
          .from(MEDIA_BUCKET)
          .download(started.stagingPath);
        expect(replayedGone.error).not.toBeNull();
        const sweptRow = await db!.query(
          `select staging_swept_at from public.media_assets where id = $1`,
          [started.assetId],
        );
        expect(sweptRow.rows[0]!.staging_swept_at).not.toBeNull();
      }

      const deletedBeforeUploadStart = await startMediaPost(
        staffRequest("/api/cms/media/start", staffA, tenantA, mStaffA, {
          byteSize: dirtyJpeg.byteLength,
          mimeType: "image/jpeg",
        }),
      );
      expect(deletedBeforeUploadStart.status).toBe(201);
      const delStartJson = (await deletedBeforeUploadStart.json()) as {
        assetId: string;
        stagingPath: string;
        token: string;
      };
      createdStorageKeys.add(delStartJson.stagingPath);
      const delBeforeUpload = await deleteMediaPost(
        staffRequest("/api/cms/media/delete", staffA, tenantA, mStaffA, {
          assetId: delStartJson.assetId,
        }),
      );
      expect(delBeforeUpload.status).toBe(200);
      const lateUploadAfterDelete = await userClient.storage
        .from(MEDIA_BUCKET)
        .uploadToSignedUrl(
          delStartJson.stagingPath,
          delStartJson.token,
          dirtyJpeg,
          { contentType: "image/jpeg" },
        );
      if (!lateUploadAfterDelete.error) {
        const afterDelWindow = new Date(Date.now() + 36 * 24 * 60 * 60 * 1000);
        const sweptDeleted = await purgeExpiredMedia({
          now: afterDelWindow,
          tenantIds: [tenantA, tenantB],
        });
        expect(sweptDeleted.removedStagingObjects).toBeGreaterThanOrEqual(1);
        const lateGone = await realAdminClient!.storage
          .from(MEDIA_BUCKET)
          .download(delStartJson.stagingPath);
        expect(lateGone.error).not.toBeNull();
      }

      for (const [outLabel, key] of [
        ["master", asset.masterKey],
        ["w320", asset.variants.w320!.key],
        ["w960", asset.variants.w960!.key],
        ["w1600", asset.variants.w1600!.key],
      ] as const) {
        const dl = await realAdminClient!.storage
          .from(MEDIA_BUCKET)
          .download(key);
        expect(dl.error, `jpeg:${outLabel}`).toBeNull();
        const buf = Buffer.from(await dl.data!.arrayBuffer());
        const meta = await sharp(buf).metadata();
        expect(meta.exif, `jpeg:${outLabel}`).toBeUndefined();
        expect(meta.icc, `jpeg:${outLabel}`).toBeUndefined();
        expect(meta.xmp, `jpeg:${outLabel}`).toBeUndefined();
        expect(meta.iptc, `jpeg:${outLabel}`).toBeUndefined();
        expect(meta.orientation, `jpeg:${outLabel}`).toBeUndefined();
      }

      const crossDelete = await deleteMediaPost(
        staffRequest("/api/cms/media/delete", staffB, tenantB, mStaffB, {
          assetId: asset.id,
        }),
      );
      expect(crossDelete.status).toBe(404);

      for (const [ext, buf, mimeType, expectInputXmp] of [
        ["png", await createDirtyPng(2000, 1700), "image/png", false],
        ["webp", await createDirtyWebp(2000, 1700), "image/webp", true],
      ] as const) {
        const inMeta = await sharp(buf).metadata();
        expect(inMeta.orientation, ext).toBe(6);
        expect(inMeta.exif, ext).toBeDefined();
        expect(inMeta.icc, ext).toBeDefined();
        if (expectInputXmp) {
          expect(inMeta.xmp, ext).toBeDefined();
        }
        const s = await startMediaPost(
          staffRequest("/api/cms/media/start", staffA, tenantA, mStaffA, {
            byteSize: buf.byteLength,
            mimeType,
          }),
        );
        expect(s.status, ext).toBe(201);
        const sJson = (await s.json()) as {
          assetId: string;
          stagingPath: string;
          token: string;
        };
        createdStorageKeys.add(sJson.stagingPath);
        const u = await userClient.storage
          .from(MEDIA_BUCKET)
          .uploadToSignedUrl(sJson.stagingPath, sJson.token, buf, {
            contentType: mimeType,
          });
        expect(u.error, ext).toBeNull();
        const f = await finalizeMediaPost(
          staffRequest("/api/cms/media/finalize", staffA, tenantA, mStaffA, {
            assetId: sJson.assetId,
          }),
        );
        expect(f.status, ext).toBe(200);
        const fJson = (await f.json()) as {
          asset: {
            width: number;
            height: number;
            masterKey: string;
            variants: Record<string, { key: string }>;
          };
        };
        await trackAssetKeys(fJson.asset);
        expect(fJson.asset.width, ext).toBe(1700);
        expect(fJson.asset.height, ext).toBe(2000);
        expect(Object.keys(fJson.asset.variants).sort(), ext).toEqual([
          "w1600",
          "w320",
          "w960",
        ]);
        for (const [outLabel, key] of [
          ["master", fJson.asset.masterKey],
          ["w320", fJson.asset.variants.w320!.key],
          ["w960", fJson.asset.variants.w960!.key],
          ["w1600", fJson.asset.variants.w1600!.key],
        ] as const) {
          const dl = await realAdminClient!.storage
            .from(MEDIA_BUCKET)
            .download(key);
          expect(dl.error, `${ext}:${outLabel}`).toBeNull();
          const meta = await sharp(
            Buffer.from(await dl.data!.arrayBuffer()),
          ).metadata();
          expect(meta.icc, `${ext}:${outLabel}`).toBeUndefined();
          expect(meta.exif, `${ext}:${outLabel}`).toBeUndefined();
          expect(meta.xmp, `${ext}:${outLabel}`).toBeUndefined();
          expect(meta.iptc, `${ext}:${outLabel}`).toBeUndefined();
          expect(meta.orientation, `${ext}:${outLabel}`).toBeUndefined();
        }
      }
    });

    it("refuses every direct signed-in Storage operation on cms-media and every direct Data API write on public.media_assets (1028, W6-R2)", async () => {
      const sampleJpeg = await createDirtyJpeg(400, 300);
      const startRes = await startMediaPost(
        staffRequest("/api/cms/media/start", staffA, tenantA, mStaffA, {
          byteSize: sampleJpeg.byteLength,
          mimeType: "image/jpeg",
        }),
      );
      const started = (await startRes.json()) as {
        assetId: string;
        stagingPath: string;
        token: string;
      };
      const anonStorageClient = createClient(url!, anonKey!, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      await anonStorageClient.storage
        .from(MEDIA_BUCKET)
        .uploadToSignedUrl(started.stagingPath, started.token, sampleJpeg, {
          contentType: "image/jpeg",
        });
      const finRes = await finalizeMediaPost(
        staffRequest("/api/cms/media/finalize", staffA, tenantA, mStaffA, {
          assetId: started.assetId,
        }),
      );
      const { asset } = (await finRes.json()) as {
        asset: {
          id: string;
          masterKey: string;
          variants: Record<string, { key: string }>;
        };
      };
      await trackAssetKeys(asset);

      const signedInClient = createClient(url!, anonKey!, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: {
          headers: {
            Authorization: `Bearer ${staffA.accessToken}`,
            "x-asym-tenant": tenantA,
            "x-asym-assignment": mStaffA,
          },
        },
      });

      const directUpload = await signedInClient.storage
        .from(MEDIA_BUCKET)
        .upload(`${tenantA}/direct-forged.jpg`, sampleJpeg, {
          contentType: "image/jpeg",
        });
      expect(directUpload.error).not.toBeNull();

      const directOverwrite = await signedInClient.storage
        .from(MEDIA_BUCKET)
        .upload(asset.masterKey, sampleJpeg, {
          contentType: "image/jpeg",
          upsert: true,
        });
      expect(directOverwrite.error).not.toBeNull();

      const directDownload = await signedInClient.storage
        .from(MEDIA_BUCKET)
        .download(asset.masterKey);
      expect(directDownload.error).not.toBeNull();

      const directList = await signedInClient.storage
        .from(MEDIA_BUCKET)
        .list(tenantA);
      expect(directList.data ?? []).toEqual([]);

      const directUpdate = await signedInClient.storage
        .from(MEDIA_BUCKET)
        .update(asset.masterKey, sampleJpeg, { contentType: "image/jpeg" });
      expect(directUpdate.error).not.toBeNull();

      const directRemove = await signedInClient.storage
        .from(MEDIA_BUCKET)
        .remove([asset.masterKey]);
      expect(directRemove.data ?? []).toEqual([]);
      const stillPresent = await realAdminClient!.storage
        .from(MEDIA_BUCKET)
        .download(asset.masterKey);
      expect(stillPresent.error).toBeNull();

      const directSignedUrl = await signedInClient.storage
        .from(MEDIA_BUCKET)
        .createSignedUrl(asset.masterKey, 60);
      expect(directSignedUrl.error).not.toBeNull();

      const directSignedUpload = await signedInClient.storage
        .from(MEDIA_BUCKET)
        .createSignedUploadUrl(`${tenantA}/forged-upload.jpg`);
      expect(directSignedUpload.error).not.toBeNull();

      const directInsert = await signedInClient.from("media_assets").insert({
        tenant_id: tenantA,
        status: "uploading",
        declared_byte_size: 100,
        declared_mime_type: "image/jpeg",
      });
      expect(directInsert.error).not.toBeNull();

      const directRowUpdate = await signedInClient
        .from("media_assets")
        .update({ master_key: "forged", status: "ready" })
        .eq("id", asset.id);
      expect(directRowUpdate.error).not.toBeNull();

      const directRowDelete = await signedInClient
        .from("media_assets")
        .delete()
        .eq("id", asset.id);
      expect(directRowDelete.error).not.toBeNull();
    });

    it("serves /api/media/[assetId] with no headers and no Web Studio cookie across multi-tenant, multi-subrole and inactive+live staff (1027, W6-R4, W6-R5)", async () => {
      const uploadAndFinalize = async (
        user: CreatedUser,
        tenantId: string,
        assignmentId: string,
        width: number,
        height: number,
      ) => {
        const jpeg = await createDirtyJpeg(width, height);
        const s = await startMediaPost(
          staffRequest("/api/cms/media/start", user, tenantId, assignmentId, {
            byteSize: jpeg.byteLength,
            mimeType: "image/jpeg",
          }),
        );
        const sJson = (await s.json()) as {
          assetId: string;
          stagingPath: string;
          token: string;
        };
        const c = createClient(url!, anonKey!, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        await c.storage
          .from(MEDIA_BUCKET)
          .uploadToSignedUrl(sJson.stagingPath, sJson.token, jpeg, {
            contentType: "image/jpeg",
          });
        const f = await finalizeMediaPost(
          staffRequest(
            "/api/cms/media/finalize",
            user,
            tenantId,
            assignmentId,
            {
              assetId: sJson.assetId,
            },
          ),
        );
        const fJson = (await f.json()) as {
          asset: {
            id: string;
            masterKey: string;
            variants: Record<string, { key: string }>;
          };
        };
        await trackAssetKeys(fJson.asset);
        return fJson.asset;
      };

      const assetA = await uploadAndFinalize(
        staffA,
        tenantA,
        mStaffA,
        1400,
        1200,
      );
      const assetB = await uploadAndFinalize(
        staffB,
        tenantB,
        mStaffB,
        1400,
        1200,
      );

      const multiCookieA = await mediaGet(
        new NextRequest(`http://127.0.0.1:3000/api/media/${assetA.id}`, {
          headers: { cookie: multiUser.cookieHeader },
        }),
        { params: Promise.resolve({ assetId: assetA.id }) },
      );
      expect(multiCookieA.status).toBe(200);
      expect(multiCookieA.headers.get("cache-control")).toBe(
        "private, no-cache",
      );
      expect(multiCookieA.headers.get("cache-control")).not.toMatch(
        /public|immutable/i,
      );
      expect(multiCookieA.headers.get("x-content-type-options")).toBe(
        "nosniff",
      );
      const etagA = multiCookieA.headers.get("etag");
      expect(etagA).toBeTruthy();
      const servedBytesA = Buffer.from(await multiCookieA.arrayBuffer());
      const variantBytesA = Buffer.from(
        await (
          await realAdminClient!.storage
            .from(MEDIA_BUCKET)
            .download(assetA.variants.w960!.key)
        ).data!.arrayBuffer(),
      );
      const masterBytesA = Buffer.from(
        await (
          await realAdminClient!.storage
            .from(MEDIA_BUCKET)
            .download(assetA.masterKey)
        ).data!.arrayBuffer(),
      );
      expect(servedBytesA.equals(variantBytesA)).toBe(true);
      expect(servedBytesA.equals(masterBytesA)).toBe(false);

      const notModifiedA = await mediaGet(
        new NextRequest(`http://127.0.0.1:3000/api/media/${assetA.id}`, {
          headers: {
            cookie: multiUser.cookieHeader,
            "if-none-match": etagA!,
          },
        }),
        { params: Promise.resolve({ assetId: assetA.id }) },
      );
      expect(notModifiedA.status).toBe(304);
      expect(await notModifiedA.arrayBuffer()).toHaveProperty("byteLength", 0);

      const multiBearerB = await mediaGet(
        new NextRequest(`http://127.0.0.1:3000/api/media/${assetB.id}`, {
          headers: { authorization: `Bearer ${multiUser.accessToken}` },
        }),
        { params: Promise.resolve({ assetId: assetB.id }) },
      );
      expect(multiBearerB.status).toBe(200);

      const twoSubrolesRes = await mediaGet(
        new NextRequest(`http://127.0.0.1:3000/api/media/${assetA.id}`, {
          headers: { cookie: twoSubrolesUser.cookieHeader },
        }),
        { params: Promise.resolve({ assetId: assetA.id }) },
      );
      expect(twoSubrolesRes.status).toBe(200);

      const inactiveLiveRes = await mediaGet(
        new NextRequest(`http://127.0.0.1:3000/api/media/${assetA.id}`, {
          headers: { cookie: inactiveLiveUser.cookieHeader },
        }),
        { params: Promise.resolve({ assetId: assetA.id }) },
      );
      expect(inactiveLiveRes.status).toBe(200);

      const foreignStaffRes = await mediaGet(
        new NextRequest(`http://127.0.0.1:3000/api/media/${assetA.id}`, {
          headers: { cookie: staffB.cookieHeader },
        }),
        { params: Promise.resolve({ assetId: assetA.id }) },
      );
      expect(foreignStaffRes.status).toBe(404);
      expect(await foreignStaffRes.arrayBuffer()).toHaveProperty(
        "byteLength",
        0,
      );

      const unknownId = randomUUID();
      const unknownRes = await mediaGet(
        new NextRequest(`http://127.0.0.1:3000/api/media/${unknownId}`, {
          headers: { cookie: staffA.cookieHeader },
        }),
        { params: Promise.resolve({ assetId: unknownId }) },
      );
      expect(unknownRes.status).toBe(404);
      expect(await unknownRes.arrayBuffer()).toHaveProperty("byteLength", 0);

      const donorRes = await mediaGet(
        new NextRequest(`http://127.0.0.1:3000/api/media/${assetA.id}`, {
          headers: { cookie: donorA.cookieHeader },
        }),
        { params: Promise.resolve({ assetId: assetA.id }) },
      );
      expect(donorRes.status).toBe(404);
      expect(await donorRes.arrayBuffer()).toHaveProperty("byteLength", 0);

      const anonRes = await mediaGet(
        new NextRequest(`http://127.0.0.1:3000/api/media/${assetA.id}`),
        { params: Promise.resolve({ assetId: assetA.id }) },
      );
      expect(anonRes.status).toBe(401);
      expect(await anonRes.arrayBuffer()).toHaveProperty("byteLength", 0);

      const originalRefused = await mediaGet(
        new NextRequest(
          `http://127.0.0.1:3000/api/media/${assetA.id}?variant=original`,
          { headers: { cookie: staffA.cookieHeader } },
        ),
        { params: Promise.resolve({ assetId: assetA.id }) },
      );
      expect(originalRefused.status).toBe(404);

      const missionaryIncoming = new NextRequest(
        `http://127.0.0.1:3002/api/media/${assetA.id}`,
        { headers: { cookie: missionaryA.cookieHeader } },
      );
      const missionaryProxyRes = await missionaryProxy(missionaryIncoming);
      const missionaryMountRes = await missionaryMediaMount(
        applyProxyForwardedHeaders(missionaryIncoming, missionaryProxyRes),
        { params: Promise.resolve({ assetId: assetA.id }) },
      );
      expect(missionaryMountRes.status).toBe(404);
      expect(await missionaryMountRes.arrayBuffer()).toHaveProperty(
        "byteLength",
        0,
      );

      const staffOnMissionaryIncoming = new NextRequest(
        `http://127.0.0.1:3002/api/media/${assetA.id}`,
        { headers: { cookie: staffA.cookieHeader } },
      );
      const staffOnMissionaryProxyRes = await missionaryProxy(
        staffOnMissionaryIncoming,
      );
      const staffOnMissionaryRes = await missionaryMediaMount(
        applyProxyForwardedHeaders(
          staffOnMissionaryIncoming,
          staffOnMissionaryProxyRes,
        ),
        { params: Promise.resolve({ assetId: assetA.id }) },
      );
      expect(staffOnMissionaryRes.status).toBe(200);
      expect(
        Buffer.from(await staffOnMissionaryRes.arrayBuffer()).equals(
          variantBytesA,
        ),
      ).toBe(true);

      const donorIncoming = new NextRequest(
        `http://127.0.0.1:3000/api/media/${assetA.id}`,
        { headers: { cookie: donorA.cookieHeader } },
      );
      const donorProxyRes = await donorProxy(donorIncoming);
      const donorMountRes = await donorMediaMount(
        applyProxyForwardedHeaders(donorIncoming, donorProxyRes),
        { params: Promise.resolve({ assetId: assetA.id }) },
      );
      expect(donorMountRes.status).toBe(404);
      expect(await donorMountRes.arrayBuffer()).toHaveProperty("byteLength", 0);

      const staffOnDonorIncoming = new NextRequest(
        `http://127.0.0.1:3000/api/media/${assetA.id}`,
        { headers: { cookie: staffA.cookieHeader } },
      );
      const staffOnDonorProxyRes = await donorProxy(staffOnDonorIncoming);
      const staffOnDonorRes = await donorMediaMount(
        applyProxyForwardedHeaders(staffOnDonorIncoming, staffOnDonorProxyRes),
        { params: Promise.resolve({ assetId: assetA.id }) },
      );
      expect(staffOnDonorRes.status).toBe(200);
      expect(
        Buffer.from(await staffOnDonorRes.arrayBuffer()).equals(variantBytesA),
      ).toBe(true);

      const originalCapFn = String(
        (
          await db!.query(
            `select pg_get_functiondef('authz.assignment_capabilities(uuid)'::regprocedure) as def`,
          )
        ).rows[0]!.def,
      );
      try {
        await db!.query(
          `create or replace function authz.assignment_capabilities(p_assignment_id uuid)
           returns text[] language sql stable security invoker set search_path = '' as $$
             select case
               when p_assignment_id = '${mStaffNoCapA}'::uuid then array['admin.dashboard.access']::text[]
               else array['web_studio.edit']::text[]
             end;
           $$`,
        );
        const staffNoCapRes = await mediaGet(
          new NextRequest(`http://127.0.0.1:3000/api/media/${assetA.id}`, {
            headers: { cookie: staffNoCapA.cookieHeader },
          }),
          { params: Promise.resolve({ assetId: assetA.id }) },
        );
        expect(staffNoCapRes.status).toBe(404);
        expect(await staffNoCapRes.arrayBuffer()).toHaveProperty(
          "byteLength",
          0,
        );
      } finally {
        await db!.query(originalCapFn);
      }
    });

    it("refuses over-limit bytes, MIME and pixels at all three layers and keeps 25 MP w1600 under 4.5 MB (1030, W6-R5)", async () => {
      const signedInClient = createClient(url!, anonKey!, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: {
          headers: {
            Authorization: `Bearer ${staffA.accessToken}`,
            "x-asym-tenant": tenantA,
            "x-asym-assignment": mStaffA,
          },
        },
      });
      const overCmd = await signedInClient.rpc("start_media_upload", {
        p_tenant_id: tenantA,
        p_byte_size: MEDIA_MAX_BYTES + 1,
        p_mime_type: "image/jpeg",
      });
      expect(overCmd.error?.code).toBe("22023");

      const gifCmd = await signedInClient.rpc("start_media_upload", {
        p_tenant_id: tenantA,
        p_byte_size: 1024,
        p_mime_type: "image/gif",
      });
      expect(gifCmd.error?.code).toBe("22023");

      const anonStorage = createClient(url!, anonKey!, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const startForLimit = async (mimeType: "image/jpeg" | "image/png") => {
        const res = await startMediaPost(
          staffRequest("/api/cms/media/start", staffA, tenantA, mStaffA, {
            byteSize: 1024,
            mimeType,
          }),
        );
        expect(res.status).toBe(201);
        const json = (await res.json()) as {
          assetId: string;
          stagingPath: string;
          token: string;
        };
        createdStorageKeys.add(json.stagingPath);
        return json;
      };

      const overBucketStarted = await startForLimit("image/png");
      const bucketOversize = await anonStorage.storage
        .from(MEDIA_BUCKET)
        .uploadToSignedUrl(
          overBucketStarted.stagingPath,
          overBucketStarted.token,
          Buffer.alloc(MEDIA_MAX_BYTES + 1, 0xaa),
          { contentType: "image/png" },
        );
      expect(bucketOversize.error).not.toBeNull();
      expect(
        String(
          (bucketOversize.error as { statusCode?: string | number })
            .statusCode ?? "",
        ),
      ).toBe("413");

      const gifBucketStarted = await startForLimit("image/png");
      const bucketGif = await anonStorage.storage
        .from(MEDIA_BUCKET)
        .uploadToSignedUrl(
          gifBucketStarted.stagingPath,
          gifBucketStarted.token,
          Buffer.from(
            "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
            "base64",
          ),
          { contentType: "image/gif" },
        );
      expect(bucketGif.error).not.toBeNull();
      expect(
        String(
          (bucketGif.error as { statusCode?: string | number }).statusCode ??
            "",
        ),
      ).toBe("415");

      const disguisedStarted = await startForLimit("image/png");
      const disguisedUpload = await anonStorage.storage
        .from(MEDIA_BUCKET)
        .uploadToSignedUrl(
          disguisedStarted.stagingPath,
          disguisedStarted.token,
          Buffer.from(
            "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
            "base64",
          ),
          { contentType: "image/png" },
        );
      expect(disguisedUpload.error).toBeNull();
      const disguisedFinalize = await finalizeMediaPost(
        staffRequest("/api/cms/media/finalize", staffA, tenantA, mStaffA, {
          assetId: disguisedStarted.assetId,
        }),
      );
      expect(disguisedFinalize.status).toBe(415);
      const failedRow = await db!.query(
        `select status from public.media_assets where id = $1`,
        [disguisedStarted.assetId],
      );
      expect(failedRow.rows[0]!.status).toBe("failed");

      const bombPng = await sharp({
        create: {
          width: 6000,
          height: 5000,
          channels: 3,
          background: { r: 20, g: 30, b: 40 },
        },
      })
        .png({ compressionLevel: 9 })
        .toBuffer();
      const bombStart = await startMediaPost(
        staffRequest("/api/cms/media/start", staffA, tenantA, mStaffA, {
          byteSize: bombPng.byteLength,
          mimeType: "image/png",
        }),
      );
      const bombStarted = (await bombStart.json()) as {
        assetId: string;
        stagingPath: string;
        token: string;
      };
      createdStorageKeys.add(bombStarted.stagingPath);
      const bombUpload = await anonStorage.storage
        .from(MEDIA_BUCKET)
        .uploadToSignedUrl(
          bombStarted.stagingPath,
          bombStarted.token,
          bombPng,
          { contentType: "image/png" },
        );
      expect(bombUpload.error).toBeNull();
      const bombFinalize = await finalizeMediaPost(
        staffRequest("/api/cms/media/finalize", staffA, tenantA, mStaffA, {
          assetId: bombStarted.assetId,
        }),
      );
      expect(bombFinalize.status).toBe(422);

      const ceilingJpeg = await createTextured25MpJpeg();
      expect(ceilingJpeg.byteLength).toBeGreaterThan(1_000_000);
      expect(ceilingJpeg.byteLength).toBeLessThanOrEqual(MEDIA_MAX_BYTES);
      const ceilStart = await startMediaPost(
        staffRequest("/api/cms/media/start", staffA, tenantA, mStaffA, {
          byteSize: ceilingJpeg.byteLength,
          mimeType: "image/jpeg",
        }),
      );
      const ceilStarted = (await ceilStart.json()) as {
        assetId: string;
        stagingPath: string;
        token: string;
      };
      createdStorageKeys.add(ceilStarted.stagingPath);
      await anonStorage.storage
        .from(MEDIA_BUCKET)
        .uploadToSignedUrl(
          ceilStarted.stagingPath,
          ceilStarted.token,
          ceilingJpeg,
          { contentType: "image/jpeg" },
        );
      const ceilFin = await finalizeMediaPost(
        staffRequest("/api/cms/media/finalize", staffA, tenantA, mStaffA, {
          assetId: ceilStarted.assetId,
        }),
      );
      expect(ceilFin.status).toBe(200);
      const { asset: ceilAsset } = (await ceilFin.json()) as {
        asset: {
          id: string;
          masterKey: string;
          variants: Record<string, { key: string; byteSize: number }>;
        };
      };
      await trackAssetKeys(ceilAsset);
      expect(ceilAsset.variants.w1600!.byteSize).toBeLessThan(4_500_000);
      expect(ceilAsset.variants.w1600!.byteSize).toBeLessThanOrEqual(
        MEDIA_MAX_VARIANT_BYTES,
      );

      const trailingSuffix = Buffer.from(
        "BENIGN_TRAILING_DATA_AFTER_CONTAINER",
      );
      for (const [label, mimeType, validBytes] of [
        ["jpeg", "image/jpeg", await createDirtyJpeg(320, 240)],
        ["png", "image/png", await createDirtyPng(320, 240)],
        ["webp", "image/webp", await createDirtyWebp(320, 240)],
      ] as const) {
        const trailingBytes = Buffer.concat([validBytes, trailingSuffix]);
        const trStart = await startMediaPost(
          staffRequest("/api/cms/media/start", staffA, tenantA, mStaffA, {
            byteSize: trailingBytes.byteLength,
            mimeType,
          }),
        );
        expect(trStart.status, label).toBe(201);
        const trStarted = (await trStart.json()) as {
          assetId: string;
          stagingPath: string;
          token: string;
        };
        createdStorageKeys.add(trStarted.stagingPath);
        const trUpload = await anonStorage.storage
          .from(MEDIA_BUCKET)
          .uploadToSignedUrl(
            trStarted.stagingPath,
            trStarted.token,
            trailingBytes,
            { contentType: mimeType },
          );
        expect(trUpload.error, label).toBeNull();
        const trFin = await finalizeMediaPost(
          staffRequest("/api/cms/media/finalize", staffA, tenantA, mStaffA, {
            assetId: trStarted.assetId,
          }),
        );
        expect(trFin.status, label).toBe(415);
        const trRow = await db!.query(
          `select status from public.media_assets where id = $1`,
          [trStarted.assetId],
        );
        expect(trRow.rows[0]!.status, label).toBe("failed");
      }
    });

    it("proves idempotent finalize across all objects, brand-new concurrent finalize, staggered delete, both purge/finalize barriers, and mid-finalize delete cleanup (1031, F1, F2, F4, F5)", async () => {
      const jpg = await createDirtyJpeg(800, 600, { r: 30, g: 90, b: 170 });
      const anonStorage = createClient(url!, anonKey!, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const start1 = (await (
        await startMediaPost(
          staffRequest("/api/cms/media/start", staffA, tenantA, mStaffA, {
            byteSize: jpg.byteLength,
            mimeType: "image/jpeg",
          }),
        )
      ).json()) as { assetId: string; stagingPath: string; token: string };
      createdStorageKeys.add(start1.stagingPath);
      await anonStorage.storage
        .from(MEDIA_BUCKET)
        .uploadToSignedUrl(start1.stagingPath, start1.token, jpg, {
          contentType: "image/jpeg",
        });

      const fin1 = (await (
        await finalizeMediaPost(
          staffRequest("/api/cms/media/finalize", staffA, tenantA, mStaffA, {
            assetId: start1.assetId,
          }),
        )
      ).json()) as {
        asset: {
          id: string;
          contentHash: string;
          masterKey: string;
          variants: Record<string, { key: string }>;
        };
      };
      await trackAssetKeys(fin1.asset);

      const allFin1Keys = [
        fin1.asset.masterKey,
        ...Object.values(fin1.asset.variants).map((v) => v.key),
      ].sort();
      const objsBefore = await db!.query(
        `select id, name, created_at from storage.objects
          where bucket_id = $1 and name = any($2::text[])
          order by name`,
        [MEDIA_BUCKET, allFin1Keys],
      );
      expect(objsBefore.rows).toHaveLength(allFin1Keys.length);

      const retryRes = await finalizeMediaPost(
        staffRequest("/api/cms/media/finalize", staffA, tenantA, mStaffA, {
          assetId: start1.assetId,
        }),
      );
      expect(retryRes.status).toBe(200);
      const objsAfter = await db!.query(
        `select id, name, created_at from storage.objects
          where bucket_id = $1 and name = any($2::text[])
          order by name`,
        [MEDIA_BUCKET, allFin1Keys],
      );
      expect(objsAfter.rows).toEqual(objsBefore.rows);

      const freshConcurrentJpg = await createDirtyJpeg(820, 620, {
        r: 175,
        g: 42,
        b: 118,
      });
      const startRace = (await (
        await startMediaPost(
          staffRequest("/api/cms/media/start", staffA, tenantA, mStaffA, {
            byteSize: freshConcurrentJpg.byteLength,
            mimeType: "image/jpeg",
          }),
        )
      ).json()) as { assetId: string; stagingPath: string; token: string };
      createdStorageKeys.add(startRace.stagingPath);
      await anonStorage.storage
        .from(MEDIA_BUCKET)
        .uploadToSignedUrl(
          startRace.stagingPath,
          startRace.token,
          freshConcurrentJpg,
          { contentType: "image/jpeg" },
        );
      const authA = makeAdmittedAuth(staffA, tenantA, mStaffA);
      const [race1, race2] = await Promise.all([
        finalizeMediaUpload(authA, { assetId: startRace.assetId }),
        finalizeMediaUpload(authA, { assetId: startRace.assetId }),
      ]);
      await trackAssetKeys(race1);
      expect(race1.status).toBe("ready");
      expect(race2.status).toBe("ready");
      expect(race1.masterKey).toBe(race2.masterKey);
      expect(race1.masterKey).not.toBe(fin1.asset.masterKey);
      const raceKeys = [
        race1.masterKey!,
        ...Object.values(race1.variants)
          .filter((v): v is NonNullable<typeof v> => Boolean(v))
          .map((v) => v.key),
      ].sort();
      const raceObjs = await db!.query(
        `select id, name, created_at from storage.objects
          where bucket_id = $1 and name = any($2::text[])
          order by name`,
        [MEDIA_BUCKET, raceKeys],
      );
      expect(raceObjs.rows).toHaveLength(raceKeys.length);

      const startDuplicate = (await (
        await startMediaPost(
          staffRequest("/api/cms/media/start", staffA, tenantA, mStaffA, {
            byteSize: jpg.byteLength,
            mimeType: "image/jpeg",
          }),
        )
      ).json()) as { assetId: string; stagingPath: string; token: string };
      createdStorageKeys.add(startDuplicate.stagingPath);
      await anonStorage.storage
        .from(MEDIA_BUCKET)
        .uploadToSignedUrl(
          startDuplicate.stagingPath,
          startDuplicate.token,
          jpg,
          {
            contentType: "image/jpeg",
          },
        );
      const finDup = await finalizeMediaUpload(authA, {
        assetId: startDuplicate.assetId,
      });
      expect(finDup.masterKey).toBe(fin1.asset.masterKey);

      const del1 = await deleteMediaPost(
        staffRequest("/api/cms/media/delete", staffA, tenantA, mStaffA, {
          assetId: start1.assetId,
        }),
      );
      expect(del1.status).toBe(200);

      const finalizeDeleted = await finalizeMediaPost(
        staffRequest("/api/cms/media/finalize", staffA, tenantA, mStaffA, {
          assetId: start1.assetId,
        }),
      );
      expect(finalizeDeleted.status).toBe(404);

      const delDup = await deleteMediaPost(
        staffRequest("/api/cms/media/delete", staffA, tenantA, mStaffA, {
          assetId: startDuplicate.assetId,
        }),
      );
      expect(delDup.status).toBe(200);
      await db!.query(
        `update public.media_assets
            set deleted_at = now() - interval '36 days',
                purge_after = now() - interval '1 day'
          where id = $1`,
        [start1.assetId],
      );
      await db!.query(
        `update public.media_assets
            set deleted_at = now() - interval '1 day',
                purge_after = now() + interval '34 days'
          where id = $1`,
        [startDuplicate.assetId],
      );

      const staggeredToday = await purgeExpiredMedia({
        now: new Date(),
        tenantIds: [tenantA, tenantB],
      });
      expect(staggeredToday.keptSharedObjects).toBeGreaterThanOrEqual(1);
      expect(staggeredToday.removedObjects).toBe(0);
      const keptAfterFirst = await realAdminClient!.storage
        .from(MEDIA_BUCKET)
        .download(fin1.asset.masterKey);
      expect(keptAfterFirst.error).toBeNull();

      const startBarrier1 = (await (
        await startMediaPost(
          staffRequest("/api/cms/media/start", staffA, tenantA, mStaffA, {
            byteSize: jpg.byteLength,
            mimeType: "image/jpeg",
          }),
        )
      ).json()) as { assetId: string; stagingPath: string; token: string };
      createdStorageKeys.add(startBarrier1.stagingPath);
      const declare1 = await realAdminClient!.rpc("declare_media_finalize", {
        p_tenant_id: tenantA,
        p_asset_id: startBarrier1.assetId,
        p_content_hash: fin1.asset.contentHash,
        p_master_key: fin1.asset.masterKey,
        p_variants: {
          w320: {
            key: fin1.asset.variants.w320!.key,
            width: 320,
            height: 427,
            byte_size: 4096,
            mime_type: "image/jpeg",
          },
        },
        p_mime_type: "image/jpeg",
        p_byte_size: 8192,
        p_width: 600,
        p_height: 800,
        p_now: new Date().toISOString(),
      });
      expect(declare1.error).toBeNull();
      expect((declare1.data as { outcome: string }).outcome).toBe("declared");

      const afterDupWindow = new Date(Date.now() + 36 * 24 * 60 * 60 * 1000);
      const barrier1Purge = await purgeExpiredMedia({
        now: afterDupWindow,
        tenantIds: [tenantA, tenantB],
      });
      expect(barrier1Purge.deferredInUse).toBeGreaterThanOrEqual(1);
      expect(barrier1Purge.removedObjects).toBe(0);

      const publish1 = await realAdminClient!.rpc("publish_media_finalize", {
        p_tenant_id: tenantA,
        p_asset_id: startBarrier1.assetId,
        p_content_hash: fin1.asset.contentHash,
        p_now: new Date().toISOString(),
      });
      expect(publish1.error).toBeNull();
      expect((publish1.data as { outcome: string }).outcome).toBe("published");
      const barrier1Get = await mediaGet(
        new NextRequest(
          `http://127.0.0.1:3000/api/media/${startBarrier1.assetId}`,
          { headers: { cookie: staffA.cookieHeader } },
        ),
        { params: Promise.resolve({ assetId: startBarrier1.assetId }) },
      );
      expect(barrier1Get.status).toBe(200);

      await deleteMediaPost(
        staffRequest("/api/cms/media/delete", staffA, tenantA, mStaffA, {
          assetId: startBarrier1.assetId,
        }),
      );
      await db!.query(
        `update public.media_assets
            set purged_at = now()
          where id = $1`,
        [startDuplicate.assetId],
      );
      await db!.query(
        `update public.media_assets
            set deleted_at = now() - interval '36 days',
                purge_after = now() - interval '1 day'
          where id = $1`,
        [startBarrier1.assetId],
      );

      const barrier2ClaimToken = randomUUID();
      const claim2 = await realAdminClient!.rpc("claim_media_content_purge", {
        p_tenant_id: tenantA,
        p_asset_id: startBarrier1.assetId,
        p_content_hash: fin1.asset.contentHash,
        p_claim_token: barrier2ClaimToken,
        p_lease_seconds: 120,
      });
      expect(claim2.error).toBeNull();
      expect(claim2.data).toBe("claimed");

      const startBarrier2 = (await (
        await startMediaPost(
          staffRequest("/api/cms/media/start", staffA, tenantA, mStaffA, {
            byteSize: jpg.byteLength,
            mimeType: "image/jpeg",
          }),
        )
      ).json()) as { assetId: string; stagingPath: string; token: string };
      createdStorageKeys.add(startBarrier2.stagingPath);
      await anonStorage.storage
        .from(MEDIA_BUCKET)
        .uploadToSignedUrl(
          startBarrier2.stagingPath,
          startBarrier2.token,
          jpg,
          { contentType: "image/jpeg" },
        );

      const barrier2FinalizePromise = finalizeMediaUpload(authA, {
        assetId: startBarrier2.assetId,
      });
      await new Promise((r) => setTimeout(r, 150));
      await realAdminClient!.storage.from(MEDIA_BUCKET).remove(allFin1Keys);
      await db!.query(
        `update public.media_assets set purged_at = now() where id = $1`,
        [startBarrier1.assetId],
      );
      await realAdminClient!.rpc("release_media_content_purge", {
        p_tenant_id: tenantA,
        p_content_hash: fin1.asset.contentHash,
        p_claim_token: barrier2ClaimToken,
      });

      const barrier2Ready = await barrier2FinalizePromise;
      expect(barrier2Ready.status).toBe("ready");
      const barrier2Get = await mediaGet(
        new NextRequest(
          `http://127.0.0.1:3000/api/media/${startBarrier2.assetId}`,
          { headers: { cookie: staffA.cookieHeader } },
        ),
        { params: Promise.resolve({ assetId: startBarrier2.assetId }) },
      );
      expect(barrier2Get.status).toBe(200);
      expect((await barrier2Get.arrayBuffer()).byteLength).toBeGreaterThan(0);

      const midDelJpg = await createDirtyJpeg(440, 320, {
        r: 92,
        g: 180,
        b: 64,
      });
      const midDelStart = (await (
        await startMediaPost(
          staffRequest("/api/cms/media/start", staffA, tenantA, mStaffA, {
            byteSize: midDelJpg.byteLength,
            mimeType: "image/jpeg",
          }),
        )
      ).json()) as { assetId: string; stagingPath: string; token: string };
      createdStorageKeys.add(midDelStart.stagingPath);
      await anonStorage.storage
        .from(MEDIA_BUCKET)
        .uploadToSignedUrl(
          midDelStart.stagingPath,
          midDelStart.token,
          midDelJpg,
          { contentType: "image/jpeg" },
        );
      const midHash = "c".repeat(64);
      const midMasterKey = buildMediaMasterKey(tenantA, midHash);
      const midVariantKey = buildMediaVariantKey(tenantA, midHash, "w320");
      createdStorageKeys.add(midMasterKey);
      createdStorageKeys.add(midVariantKey);
      const midDeclare = await realAdminClient!.rpc("declare_media_finalize", {
        p_tenant_id: tenantA,
        p_asset_id: midDelStart.assetId,
        p_content_hash: midHash,
        p_master_key: midMasterKey,
        p_variants: {
          w320: {
            key: midVariantKey,
            width: 320,
            height: 240,
            byte_size: midDelJpg.byteLength,
            mime_type: "image/jpeg",
          },
        },
        p_mime_type: "image/jpeg",
        p_byte_size: midDelJpg.byteLength,
        p_width: 320,
        p_height: 440,
        p_now: new Date().toISOString(),
      });
      expect(midDeclare.error).toBeNull();
      await realAdminClient!.storage
        .from(MEDIA_BUCKET)
        .upload(midMasterKey, midDelJpg, {
          contentType: "image/jpeg",
          upsert: false,
        });
      await realAdminClient!.storage
        .from(MEDIA_BUCKET)
        .upload(midVariantKey, midDelJpg, {
          contentType: "image/jpeg",
          upsert: false,
        });

      const midDeleteRes = await deleteMediaPost(
        staffRequest("/api/cms/media/delete", staffA, tenantA, mStaffA, {
          assetId: midDelStart.assetId,
        }),
      );
      expect(midDeleteRes.status).toBe(200);
      const midPublish = await realAdminClient!.rpc("publish_media_finalize", {
        p_tenant_id: tenantA,
        p_asset_id: midDelStart.assetId,
        p_content_hash: midHash,
        p_now: new Date().toISOString(),
      });
      expect(midPublish.error).toBeNull();
      expect(midPublish.data as { outcome: string; status: string }).toEqual({
        outcome: "terminal",
        status: "deleted",
      });

      const midPurge = await purgeExpiredMedia({
        now: afterDupWindow,
        tenantIds: [tenantA, tenantB],
      });
      expect(midPurge.removedObjects).toBeGreaterThanOrEqual(2);
      const remainingMidObjs = await db!.query(
        `select name from storage.objects
          where bucket_id = $1 and name = any($2::text[])`,
        [MEDIA_BUCKET, [midMasterKey, midVariantKey, midDelStart.stagingPath]],
      );
      expect(remainingMidObjs.rows).toEqual([]);
    });
  },
);
