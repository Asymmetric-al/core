import { mkdtemp, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";

import sharp from "sharp";
import { describe, expect, it } from "vitest";

const { Media } = await import("../../../apps/admin/src/cms/collections/media");
// Payload does not expose its resizing helper through package exports. Use
// the installed SDK implementation that generateFileData calls, without
// initializing Payload, a database, storage adapters, or an HTTP server.
const { checkFileRestrictions } =
  await import("../../../apps/admin/node_modules/payload/dist/uploads/checkFileRestrictions.js");
const { createImageSizes } =
  await import("../../../apps/admin/node_modules/payload/dist/uploads/image-resizing/createImageSizes.js");

type ResizeArgs = Parameters<typeof createImageSizes>[0];

const repoRoot = path.resolve(import.meta.dirname, "../../..");
const adminSharp = createRequire(
  path.join(repoRoot, "apps/admin/package.json"),
)("sharp") as typeof sharp;
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

function requestBoundary() {
  // Only logging and in-memory size buffers are used by these SDK helpers.
  return {
    payload: { logger: { error() {}, warn() {} } },
    payloadUploadSizes: {},
  } as ResizeArgs["req"];
}

async function resizeMedia(
  data: Buffer,
  format: string,
  focalPoint?: ResizeArgs["focalPoint"],
) {
  const staticPath = await mkdtemp(path.join(os.tmpdir(), "core-cms-sharp-"));
  const req = requestBoundary();
  const file = uploadFile(data, format);
  try {
    await checkFileRestrictions({ collection: Media, file, req });
    const metadata = await adminSharp(data).metadata();
    return await createImageSizes({
      config: Media as ResizeArgs["config"],
      dimensions: {
        width: metadata.width!,
        height: metadata.pageHeight ?? metadata.height!,
      },
      file,
      focalPoint,
      mimeType: file.mimetype,
      req,
      savedFilename: file.name,
      sharp: adminSharp,
      staticPath,
    });
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
    await expect(
      checkFileRestrictions({
        collection: Media,
        file: uploadFile(data, "png"),
        req: requestBoundary(),
      }),
    ).rejects.toMatchObject({ status: 400 });
  });
});
