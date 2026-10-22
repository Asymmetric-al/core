import { mkdtemp, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";

import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// Exercise the installed SDK's complete upload planner with the real product
// configuration and transformer. This internal planner is not a package export;
// the public transformFile primitive alone does not generate stored variants.
const { generateFileData } =
  await import("../../../apps/admin/node_modules/payload/dist/uploads/generateFileData.js");

type UploadArgs = Parameters<typeof generateFileData>[0];
type PayloadConfig = Awaited<
  (typeof import("../../../apps/admin/payload.config"))["default"]
>;
type UploadData = {
  variants?: Record<string, { filename: string }>;
  original?: { filename: string };
};

let config: PayloadConfig;
let mediaCollection: PayloadConfig["collections"][number];

beforeAll(async () => {
  vi.stubEnv("PAYLOAD_DISABLE_SCHEMA_PUSH", "1");
  vi.stubEnv("BLOB_READ_WRITE_TOKEN", undefined);
  vi.stubEnv("RESEND_API_KEY", undefined);
  const { default: configured } =
    await import("../../../apps/admin/payload.config");
  config = await configured;
  const media = config.collections.find((entry) => entry.slug === "media");
  if (!media || !media.upload) throw new Error("Missing Media upload config");
  mediaCollection = media;
}, 30_000);

afterAll(() => vi.unstubAllEnvs());

const repoRoot = path.resolve(import.meta.dirname, "../../..");
const consumers = [
  ["root tools", path.join(repoRoot, "package.json")],
  ["Payload admin", path.join(repoRoot, "apps/admin/package.json")],
  [
    "Next image optimizer",
    createRequire(path.join(repoRoot, "package.json")).resolve("next"),
  ],
] as const;

function versionNumber(version: string) {
  const [major, minor, patch] = version.split(".").map(Number);
  return major * 1_000_000 + minor * 1_000 + patch;
}

function uploadFile(data: Buffer, format: string) {
  return {
    data,
    mimetype: `image/${format}`,
    name: `harmless-fixture.${format}`,
    size: data.length,
  };
}

async function resizeMedia(
  data: Buffer,
  format: string,
  focalPoint?: { x: number; y: number },
) {
  const staticPath = await mkdtemp(path.join(os.tmpdir(), "core-cms-sharp-"));
  const collection = {
    ...mediaCollection,
    upload: { ...mediaCollection.upload, staticDir: staticPath },
  };
  // Only filename-collision lookup is stubbed. The SDK performs type validation,
  // planning, decoding, focal cropping and variant generation without a database
  // connection, HTTP request, storage write or running Payload instance.
  const req = {
    context: {},
    file: uploadFile(data, format),
    payload: {
      config,
      collections: { media: { config: collection } },
      db: { findOne: async () => null },
      logger: { error() {}, warn() {} },
    },
    payloadUploadSizes: {},
    query: focalPoint ? { uploadEdits: { focalPoint } } : {},
    t: (key: string) => key,
  } as UploadArgs["req"];
  try {
    const result = await generateFileData<UploadData>({
      collection: { config: collection } as UploadArgs["collection"],
      config,
      data: {},
      operation: "create",
      req,
    });
    const variants = result.data.variants;
    if (!variants) throw new Error("Media upload did not generate variants");
    const filenames = new Set(
      Object.values(variants).map((variant) => variant.filename),
    );
    return {
      sizeData: variants,
      sizesToSave: result.files.filter((file) =>
        filenames.has(path.basename(file.path)),
      ),
      original: result.data.original,
      files: result.files,
    };
  } finally {
    await rm(staticPath, { recursive: true, force: true });
  }
}

describe("native CMS image dependencies", () => {
  it.each(consumers)(
    "%s loads the patched native decoder libraries",
    (_, importer) => {
      const loadedSharp = createRequire(importer)("sharp") as typeof sharp;

      // Maintainer advisories: libvips <0.35.0, libheif <0.35.4,
      // and librsvg <0.35.5. Check loaded code, not only manifest ranges.
      expect(versionNumber(loadedSharp.versions.sharp)).toBeGreaterThanOrEqual(
        35_005,
      );
      expect(versionNumber(loadedSharp.versions.vips)).toBeGreaterThanOrEqual(
        8_018_007,
      );
      expect(versionNumber(loadedSharp.versions.heif)).toBeGreaterThanOrEqual(
        1_023_002,
      );
      expect(versionNumber(loadedSharp.versions.rsvg)).toBeGreaterThanOrEqual(
        2_063_002,
      );
    },
  );
});

describe("Payload Media native image compatibility", () => {
  it.each(["avif", "gif", "jpeg", "png", "webp"] as const)(
    "decodes allowed %s uploads into the existing thumbnail and card sizes",
    async (format) => {
      const data = await sharp({
        create: {
          width: 1600,
          height: 900,
          channels: 3,
          background: { r: 30, g: 80, b: 130 },
        },
      })
        .toFormat(format)
        .toBuffer();
      const result = await resizeMedia(data, format);

      expect(result.sizeData.thumbnail).toMatchObject({
        width: 320,
        height: 320,
        mimeType: `image/${format}`,
      });
      expect(result.sizeData.card).toMatchObject({
        width: 960,
        height: 540,
        mimeType: `image/${format}`,
      });
      expect(result.sizesToSave).toHaveLength(2);
      expect(Object.keys(result.sizeData).sort()).toEqual([
        "card",
        "thumbnail",
      ]);
      const original = result.files.find(
        (file) => path.basename(file.path) === result.original?.filename,
      );
      expect(original?.buffer).toEqual(data);
      for (const output of result.sizesToSave) {
        const metadata = await sharp(output.buffer).metadata();
        expect(metadata.format).toBe(format === "avif" ? "heif" : format);
        expect(["320x320", "960x540"]).toContain(
          `${metadata.width}x${metadata.height}`,
        );
        const { data: pixels } = await sharp(output.buffer)
          .removeAlpha()
          .raw()
          .toBuffer({ resolveWithObject: true });
        expect(pixels[0]).toBeGreaterThanOrEqual(25);
        expect(pixels[0]).toBeLessThanOrEqual(35);
        expect(pixels[1]).toBeGreaterThanOrEqual(75);
        expect(pixels[1]).toBeLessThanOrEqual(85);
        expect(pixels[2]).toBeGreaterThanOrEqual(125);
        expect(pixels[2]).toBeLessThanOrEqual(135);
      }
    },
  );

  it("retains both frames of a harmless animated GIF at each configured size", async () => {
    const raw = Buffer.alloc(1600 * 1800 * 3);
    for (let offset = 0; offset < raw.length; offset += 3) {
      raw[offset < raw.length / 2 ? offset : offset + 2] = 255;
    }
    const data = await sharp(raw, {
      raw: { width: 1600, height: 1800, channels: 3, pageHeight: 900 },
    })
      .gif({ delay: [80, 120], loop: 0 })
      .toBuffer();
    const result = await resizeMedia(data, "gif");

    expect(result.sizesToSave).toHaveLength(2);
    for (const output of result.sizesToSave) {
      const metadata = await sharp(output.buffer, {
        animated: true,
      }).metadata();
      expect(metadata.pages).toBe(2);
      expect(metadata.delay).toEqual([80, 120]);
      expect(["320x320", "960x540"]).toContain(
        `${metadata.width}x${metadata.pageHeight}`,
      );
    }
  });

  it("crops the thumbnail around the requested focal point", async () => {
    const raw = Buffer.alloc(1600 * 900 * 3);
    for (let offset = 0; offset < raw.length; offset += 3) {
      const x = (offset / 3) % 1600;
      raw[x < 800 ? offset : offset + 2] = 255;
    }
    const data = await sharp(raw, {
      raw: { width: 1600, height: 900, channels: 3 },
    })
      .png()
      .toBuffer();
    const result = await resizeMedia(data, "png", { x: 95, y: 50 });
    const thumbnail = result.sizesToSave.find((output) =>
      output.path.endsWith("-320x320.png"),
    );
    expect(thumbnail).toBeDefined();
    const { data: pixels } = await sharp(thumbnail!.buffer)
      .raw()
      .toBuffer({ resolveWithObject: true });
    const center = (160 * 320 + 160) * 3;
    expect([...pixels.subarray(center, center + 3)]).toEqual([0, 0, 255]);
  });

  it("rejects malformed permitted-format bytes without creating image sizes", async () => {
    await expect(
      resizeMedia(Buffer.from("harmless invalid image"), "png"),
    ).rejects.toMatchObject({ status: 400 });
  });

  it("rejects a TIFF renamed to a permitted PNG before decoding", async () => {
    const data = await sharp({
      create: { width: 16, height: 16, channels: 3, background: "white" },
    })
      .tiff()
      .toBuffer();
    await expect(resizeMedia(data, "png")).rejects.toMatchObject({
      status: 400,
    });
  });
});
