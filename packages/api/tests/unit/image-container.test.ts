import { crc32 } from "node:zlib";

import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { validateStrictImageContainer } from "../../src/storage/image-container";

function refusal(bytes: Buffer): unknown {
  try {
    validateStrictImageContainer(bytes);
    return null;
  } catch (error) {
    return error;
  }
}

function pngChunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.byteLength);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body) >>> 0);
  return Buffer.concat([length, body, crc]);
}

const IHDR_END = 8 + 12 + 13;

function afterIhdr(png: Buffer, ...chunks: Buffer[]): Buffer {
  return Buffer.concat([
    png.subarray(0, IHDR_END),
    ...chunks,
    png.subarray(IHDR_END),
  ]);
}

function webpChunk(fourcc: string, data: Buffer, padding = 0): Buffer {
  const header = Buffer.alloc(8);
  header.write(fourcc, 0, "ascii");
  header.writeUInt32LE(data.byteLength, 4);
  return data.byteLength & 1
    ? Buffer.concat([header, data, Buffer.from([padding])])
    : Buffer.concat([header, data]);
}

function riff(...chunks: Buffer[]): Buffer {
  const body = Buffer.concat([Buffer.from("WEBP", "ascii"), ...chunks]);
  const header = Buffer.alloc(8);
  header.write("RIFF", 0, "ascii");
  header.writeUInt32LE(body.byteLength, 4);
  return Buffer.concat([header, body]);
}

function uint24(value: number): Buffer {
  return Buffer.from([value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff]);
}

function vp8x(flags: number, width: number, height: number): Buffer {
  return webpChunk(
    "VP8X",
    Buffer.concat([
      Buffer.from([flags, 0, 0, 0]),
      uint24(width - 1),
      uint24(height - 1),
    ]),
  );
}

async function stillPng(): Promise<Buffer> {
  return sharp({
    create: { width: 16, height: 12, channels: 3, background: "#2c70b8" },
  })
    .png()
    .toBuffer();
}

async function stillWebpFrame(): Promise<Buffer> {
  const webp = await sharp({
    create: { width: 16, height: 12, channels: 3, background: "#2c70b8" },
  })
    .webp({ lossless: true })
    .toBuffer();
  return webp.subarray(12);
}

describe("#2773 (WP6 rest, pull request 2): the image container check refuses animation and checks WebP padding", () => {
  it("passes a still PNG, with or without an ancillary chunk", async () => {
    const png = await stillPng();
    expect(refusal(png)).toBeNull();
    expect(
      refusal(afterIhdr(png, pngChunk("tEXt", Buffer.from("Comment\0still")))),
    ).toBeNull();
  });

  it.each([
    ["acTL", Buffer.alloc(8)],
    ["fcTL", Buffer.alloc(26)],
    ["fdAT", Buffer.alloc(8)],
  ])("refuses a PNG carrying an animation chunk (%s)", async (type, data) => {
    expect(
      refusal(afterIhdr(await stillPng(), pngChunk(type, data))),
    ).toMatchObject({
      status: 415,
      message: expect.stringMatching(/animated/i),
    });
  });

  it("passes a still WebP, simple and extended", async () => {
    const frame = await stillWebpFrame();
    expect(refusal(riff(frame))).toBeNull();
    expect(refusal(riff(vp8x(0, 16, 12), frame))).toBeNull();
  });

  it("refuses an animated WebP: the VP8X animation flag, an ANIM chunk or an ANMF frame", async () => {
    const frame = await stillWebpFrame();
    const anim = webpChunk("ANIM", Buffer.alloc(6));
    const anmf = webpChunk(
      "ANMF",
      Buffer.concat([
        uint24(0),
        uint24(0),
        uint24(15),
        uint24(11),
        uint24(100),
        Buffer.from([0]),
        frame,
      ]),
    );
    for (const animated of [
      riff(vp8x(0x02, 16, 12), anim, anmf),
      riff(vp8x(0x02, 16, 12), frame),
      riff(vp8x(0, 16, 12), anim, frame),
      riff(vp8x(0, 16, 12), anmf),
    ]) {
      expect(refusal(animated)).toMatchObject({
        status: 415,
        message: expect.stringMatching(/animated/i),
      });
    }
  });

  it("refuses an odd-sized WebP chunk whose padding byte is not zero, and passes a zero one", async () => {
    const frame = await stillWebpFrame();
    const odd = (padding: number) =>
      riff(frame, webpChunk("ABCD", Buffer.from([7]), padding));
    expect(refusal(odd(0))).toBeNull();
    expect(refusal(odd(1))).toMatchObject({ status: 415 });
  });
});
