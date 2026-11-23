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
  buildMediaStagingKey,
  MEDIA_BUCKET,
  MEDIA_MAX_BYTES,
  MEDIA_MAX_VARIANT_BYTES,
} from "@asym/api/storage/media-constants";
import {
  finalizeMediaUpload,
  purgeExpiredMedia,
} from "@asym/api/storage/media-store";

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
      background: { r: 44, g: 112, b: 184 },
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

    let db: pg.Client | undefined;
    let staffA!: CreatedUser;
    let staffB!: CreatedUser;
    let multiUser!: CreatedUser;
    let twoSubrolesUser!: CreatedUser;
    let inactiveLiveUser!: CreatedUser;
    let donorA!: CreatedUser;
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
             ($16, $17, $3, 'donor', null, true, null)`,
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

    it("proves signed upload, EXIF/GPS/ICC/XMP stripping on master and variants, token reuse refusal, and tenant isolation (1024, 1026)", async () => {
      const dirtyJpeg = await createDirtyJpeg(1800, 1200);
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

      const userClient = createClient(url!, anonKey!, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
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
      expect(asset.width).toBe(1200);
      expect(asset.height).toBe(1800);
      expect(Object.keys(asset.variants).sort()).toEqual(["w320", "w960"]);

      const stagedAfter = await realAdminClient!.storage
        .from(MEDIA_BUCKET)
        .download(started.stagingPath);
      expect(stagedAfter.error).not.toBeNull();

      for (const key of [
        asset.masterKey,
        ...Object.values(asset.variants).map((v) => v.key),
      ]) {
        const dl = await realAdminClient!.storage
          .from(MEDIA_BUCKET)
          .download(key);
        expect(dl.error, key).toBeNull();
        const buf = Buffer.from(await dl.data!.arrayBuffer());
        const meta = await sharp(buf).metadata();
        expect(meta.exif, key).toBeUndefined();
        expect(meta.icc, key).toBeUndefined();
        expect(meta.xmp, key).toBeUndefined();
        expect(meta.iptc, key).toBeUndefined();
        expect(meta.orientation, key).toBeUndefined();
      }

      const crossDelete = await deleteMediaPost(
        staffRequest("/api/cms/media/delete", staffB, tenantB, mStaffB, {
          assetId: asset.id,
        }),
      );
      expect(crossDelete.status).toBe(404);

      for (const [ext, buf, mimeType] of [
        [
          "png",
          await sharp({
            create: {
              width: 640,
              height: 480,
              channels: 4,
              background: { r: 10, g: 140, b: 90, alpha: 1 },
            },
          })
            .withIccProfile("p3")
            .png()
            .toBuffer(),
          "image/png",
        ],
        [
          "webp",
          await sharp({
            create: {
              width: 640,
              height: 480,
              channels: 3,
              background: { r: 210, g: 120, b: 30 },
            },
          })
            .withIccProfile("p3")
            .webp({ quality: 90 })
            .toBuffer(),
          "image/webp",
        ],
      ] as const) {
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
            masterKey: string;
            variants: Record<string, { key: string }>;
          };
        };
        await trackAssetKeys(fJson.asset);
        const dl = await realAdminClient!.storage
          .from(MEDIA_BUCKET)
          .download(fJson.asset.masterKey);
        expect(dl.error, ext).toBeNull();
        const meta = await sharp(
          Buffer.from(await dl.data!.arrayBuffer()),
        ).metadata();
        expect(meta.icc, ext).toBeUndefined();
        expect(meta.exif, ext).toBeUndefined();
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

      const ceilingPng = await sharp({
        create: {
          width: 5000,
          height: 5000,
          channels: 3,
          background: { r: 80, g: 120, b: 160 },
        },
      })
        .png({ compressionLevel: 9 })
        .toBuffer();
      const ceilStart = await startMediaPost(
        staffRequest("/api/cms/media/start", staffA, tenantA, mStaffA, {
          byteSize: ceilingPng.byteLength,
          mimeType: "image/png",
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
          ceilingPng,
          { contentType: "image/png" },
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
    });

    it("proves idempotent finalize, concurrent finalize, failed/deleted refusal, and delayed purge with shared content_hash (1031, F4)", async () => {
      const jpg = await createDirtyJpeg(800, 600);
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
          masterKey: string;
          variants: Record<string, { key: string }>;
        };
      };
      await trackAssetKeys(fin1.asset);

      const objsBefore = await db!.query(
        `select id, name, created_at from storage.objects where bucket_id = $1 and name = $2`,
        [MEDIA_BUCKET, fin1.asset.masterKey],
      );
      expect(objsBefore.rows).toHaveLength(1);

      const retryRes = await finalizeMediaPost(
        staffRequest("/api/cms/media/finalize", staffA, tenantA, mStaffA, {
          assetId: start1.assetId,
        }),
      );
      expect(retryRes.status).toBe(200);
      const objsAfter = await db!.query(
        `select id, name, created_at from storage.objects where bucket_id = $1 and name = $2`,
        [MEDIA_BUCKET, fin1.asset.masterKey],
      );
      expect(objsAfter.rows).toEqual(objsBefore.rows);

      const startRace = (await (
        await startMediaPost(
          staffRequest("/api/cms/media/start", staffA, tenantA, mStaffA, {
            byteSize: jpg.byteLength,
            mimeType: "image/jpeg",
          }),
        )
      ).json()) as { assetId: string; stagingPath: string; token: string };
      createdStorageKeys.add(startRace.stagingPath);
      await anonStorage.storage
        .from(MEDIA_BUCKET)
        .uploadToSignedUrl(startRace.stagingPath, startRace.token, jpg, {
          contentType: "image/jpeg",
        });
      const authA = makeAdmittedAuth(staffA, tenantA, mStaffA);
      const [race1, race2] = await Promise.all([
        finalizeMediaUpload(authA, { assetId: startRace.assetId }),
        finalizeMediaUpload(authA, { assetId: startRace.assetId }),
      ]);
      expect(race1.status).toBe("ready");
      expect(race2.status).toBe("ready");
      expect(race1.masterKey).toBe(fin1.asset.masterKey);

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

      const earlyPurge = await purgeExpiredMedia({
        now: new Date(),
        tenantIds: [tenantA, tenantB],
      });
      expect(earlyPurge.purgedRows).toBe(0);
      expect(earlyPurge.removedObjects).toBe(0);

      const afterWindow = new Date(Date.now() + 36 * 24 * 60 * 60 * 1000);
      const sharedPurge = await purgeExpiredMedia({
        now: afterWindow,
        tenantIds: [tenantA, tenantB],
      });
      expect(sharedPurge.keptSharedObjects).toBeGreaterThanOrEqual(1);
      expect(sharedPurge.removedObjects).toBe(0);

      const survivorGet = await mediaGet(
        new NextRequest(
          `http://127.0.0.1:3000/api/media/${startRace.assetId}`,
          { headers: { cookie: staffA.cookieHeader } },
        ),
        { params: Promise.resolve({ assetId: startRace.assetId }) },
      );
      expect(survivorGet.status).toBe(200);

      const stagingStart = (await (
        await startMediaPost(
          staffRequest("/api/cms/media/start", staffA, tenantA, mStaffA, {
            byteSize: jpg.byteLength,
            mimeType: "image/jpeg",
          }),
        )
      ).json()) as { assetId: string; stagingPath: string; token: string };
      createdStorageKeys.add(stagingStart.stagingPath);
      const stagedUpload = await anonStorage.storage
        .from(MEDIA_BUCKET)
        .uploadToSignedUrl(stagingStart.stagingPath, stagingStart.token, jpg, {
          contentType: "image/jpeg",
        });
      expect(stagedUpload.error).toBeNull();
      const delStaging = await deleteMediaPost(
        staffRequest("/api/cms/media/delete", staffA, tenantA, mStaffA, {
          assetId: stagingStart.assetId,
        }),
      );
      expect(delStaging.status).toBe(200);
      const stagingPurge = await purgeExpiredMedia({
        now: afterWindow,
        tenantIds: [tenantA, tenantB],
      });
      expect(stagingPurge.removedStagingObjects).toBeGreaterThanOrEqual(1);
      const stagingGone = await realAdminClient!.storage
        .from(MEDIA_BUCKET)
        .download(stagingStart.stagingPath);
      expect(stagingGone.error).not.toBeNull();
    });
  },
);
