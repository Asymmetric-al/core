import { MEDIA_MAX_PIXELS, type MediaMimeType } from "./media-constants";
import { ApiHttpError } from "../shared/api-http-error";

export interface VerifiedImageContainer {
  mimeType: MediaMimeType;
  width: number;
  height: number;
}

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

const JPEG_SOF_MARKERS = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
]);

function isAsciiLetter(byte: number): boolean {
  return (byte >= 0x41 && byte <= 0x5a) || (byte >= 0x61 && byte <= 0x7a);
}

function parseStrictPng(rawBytes: Buffer): VerifiedImageContainer {
  if (rawBytes.byteLength < 33) {
    throw new ApiHttpError(415, "Corrupted PNG container");
  }
  let pos = 8;
  let width = 0;
  let height = 0;
  let sawIhdr = false;
  let sawIend = false;

  while (pos < rawBytes.byteLength) {
    if (sawIend) {
      throw new ApiHttpError(
        415,
        "Image contains trailing content after PNG container end",
      );
    }
    if (pos + 12 > rawBytes.byteLength) {
      throw new ApiHttpError(415, "Corrupted PNG container");
    }
    const chunkLength = rawBytes.readUInt32BE(pos);
    if (
      chunkLength > 0x7fffffff ||
      pos + 12 + chunkLength > rawBytes.byteLength
    ) {
      throw new ApiHttpError(415, "Corrupted PNG chunk length");
    }
    for (let i = 0; i < 4; i += 1) {
      if (!isAsciiLetter(rawBytes[pos + 4 + i]!)) {
        throw new ApiHttpError(415, "Invalid PNG chunk type");
      }
    }
    const chunkType = rawBytes.toString("ascii", pos + 4, pos + 8);
    if (pos === 8) {
      if (chunkType !== "IHDR" || chunkLength !== 13) {
        throw new ApiHttpError(415, "Invalid PNG IHDR chunk");
      }
      width = rawBytes.readUInt32BE(pos + 8);
      height = rawBytes.readUInt32BE(pos + 12);
      sawIhdr = true;
    } else if (chunkType === "IHDR") {
      throw new ApiHttpError(415, "Duplicate PNG IHDR chunk");
    } else if (chunkType === "IEND") {
      if (chunkLength !== 0) {
        throw new ApiHttpError(415, "Invalid PNG IEND chunk");
      }
      sawIend = true;
    }
    pos += 12 + chunkLength;
  }

  if (!sawIhdr || !sawIend || width <= 0 || height <= 0) {
    throw new ApiHttpError(415, "Incomplete or invalid PNG container");
  }
  return { mimeType: "image/png", width, height };
}

function parseStrictWebp(rawBytes: Buffer): VerifiedImageContainer {
  if (rawBytes.byteLength < 12) {
    throw new ApiHttpError(415, "Corrupted WebP container");
  }
  const riffSize = rawBytes.readUInt32LE(4);
  if (riffSize < 4 || riffSize + 8 !== rawBytes.byteLength) {
    throw new ApiHttpError(
      415,
      "Image contains trailing content or truncated WebP container",
    );
  }
  let pos = 12;
  let width = 0;
  let height = 0;

  while (pos < rawBytes.byteLength) {
    if (pos + 8 > rawBytes.byteLength) {
      throw new ApiHttpError(415, "Corrupted WebP chunk header");
    }
    const fourcc = rawBytes.toString("ascii", pos, pos + 4);
    const chunkSize = rawBytes.readUInt32LE(pos + 4);
    const payloadStart = pos + 8;
    const paddedEnd = payloadStart + chunkSize + (chunkSize & 1);
    if (paddedEnd > rawBytes.byteLength) {
      throw new ApiHttpError(415, "Corrupted WebP chunk length");
    }
    if (fourcc === "VP8X" && width === 0) {
      if (chunkSize < 10) {
        throw new ApiHttpError(415, "Corrupted WebP VP8X header");
      }
      width =
        1 +
        (rawBytes[payloadStart + 4]! |
          (rawBytes[payloadStart + 5]! << 8) |
          (rawBytes[payloadStart + 6]! << 16));
      height =
        1 +
        (rawBytes[payloadStart + 7]! |
          (rawBytes[payloadStart + 8]! << 8) |
          (rawBytes[payloadStart + 9]! << 16));
    } else if (fourcc === "VP8 " && width === 0) {
      if (
        chunkSize < 10 ||
        rawBytes[payloadStart + 3] !== 0x9d ||
        rawBytes[payloadStart + 4] !== 0x01 ||
        rawBytes[payloadStart + 5] !== 0x2a
      ) {
        throw new ApiHttpError(415, "Corrupted WebP VP8 header");
      }
      width = rawBytes.readUInt16LE(payloadStart + 6) & 0x3fff;
      height = rawBytes.readUInt16LE(payloadStart + 8) & 0x3fff;
    } else if (fourcc === "VP8L" && width === 0) {
      if (chunkSize < 5 || rawBytes[payloadStart] !== 0x2f) {
        throw new ApiHttpError(415, "Corrupted WebP VP8L header");
      }
      const bits = rawBytes.readUInt32LE(payloadStart + 1);
      width = (bits & 0x3fff) + 1;
      height = ((bits >> 14) & 0x3fff) + 1;
    }
    pos = paddedEnd;
  }

  if (pos !== rawBytes.byteLength || width <= 0 || height <= 0) {
    throw new ApiHttpError(415, "Incomplete or invalid WebP container");
  }
  return { mimeType: "image/webp", width, height };
}

function parseStrictJpeg(rawBytes: Buffer): VerifiedImageContainer {
  if (rawBytes.byteLength < 4) {
    throw new ApiHttpError(415, "Corrupted JPEG container");
  }
  let pos = 2;
  let width = 0;
  let height = 0;
  let sawSos = false;
  let sawEoi = false;

  while (pos < rawBytes.byteLength) {
    if (sawEoi) {
      throw new ApiHttpError(
        415,
        "Image contains trailing content after JPEG container end",
      );
    }
    if (rawBytes[pos] !== 0xff) {
      throw new ApiHttpError(415, "Corrupted JPEG marker framing");
    }
    while (pos < rawBytes.byteLength && rawBytes[pos] === 0xff) {
      pos += 1;
    }
    if (pos >= rawBytes.byteLength) {
      throw new ApiHttpError(415, "Truncated JPEG marker");
    }
    const marker = rawBytes[pos]!;
    pos += 1;

    if (marker === 0x00 || marker === 0xd8) {
      throw new ApiHttpError(415, "Unexpected JPEG marker");
    }
    if (marker === 0xd9) {
      sawEoi = true;
      continue;
    }
    if ((marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
      continue;
    }

    if (pos + 2 > rawBytes.byteLength) {
      throw new ApiHttpError(415, "Truncated JPEG segment length");
    }
    const segmentLength = rawBytes.readUInt16BE(pos);
    if (segmentLength < 2 || pos + segmentLength > rawBytes.byteLength) {
      throw new ApiHttpError(415, "Corrupted JPEG segment length");
    }
    if (JPEG_SOF_MARKERS.has(marker)) {
      if (segmentLength < 8) {
        throw new ApiHttpError(415, "Corrupted JPEG SOF segment");
      }
      height = rawBytes.readUInt16BE(pos + 3);
      width = rawBytes.readUInt16BE(pos + 5);
    }
    pos += segmentLength;

    if (marker === 0xda) {
      sawSos = true;
      while (pos < rawBytes.byteLength) {
        if (rawBytes[pos] !== 0xff) {
          pos += 1;
          continue;
        }
        let nextPos = pos + 1;
        while (nextPos < rawBytes.byteLength && rawBytes[nextPos] === 0xff) {
          nextPos += 1;
        }
        if (nextPos >= rawBytes.byteLength) {
          throw new ApiHttpError(415, "Truncated JPEG entropy stream");
        }
        const nextByte = rawBytes[nextPos]!;
        if (nextByte === 0x00 || (nextByte >= 0xd0 && nextByte <= 0xd7)) {
          pos = nextPos + 1;
          continue;
        }
        break;
      }
    }
  }

  if (!sawEoi || !sawSos || width <= 0 || height <= 0) {
    throw new ApiHttpError(415, "Incomplete or invalid JPEG container");
  }
  return { mimeType: "image/jpeg", width, height };
}

export function validateStrictImageContainer(
  rawBytes: Buffer,
): VerifiedImageContainer {
  let container: VerifiedImageContainer;
  if (
    rawBytes.byteLength >= 8 &&
    rawBytes.subarray(0, 8).equals(PNG_SIGNATURE)
  ) {
    container = parseStrictPng(rawBytes);
  } else if (
    rawBytes.byteLength >= 12 &&
    rawBytes.toString("ascii", 0, 4) === "RIFF" &&
    rawBytes.toString("ascii", 8, 12) === "WEBP"
  ) {
    container = parseStrictWebp(rawBytes);
  } else if (
    rawBytes.byteLength >= 2 &&
    rawBytes[0] === 0xff &&
    rawBytes[1] === 0xd8
  ) {
    container = parseStrictJpeg(rawBytes);
  } else {
    throw new ApiHttpError(
      415,
      "Unsupported image format; only JPEG, PNG, and WebP are allowed",
    );
  }

  if (container.width * container.height > MEDIA_MAX_PIXELS) {
    throw new ApiHttpError(422, "Image exceeds 25 megapixel limit");
  }

  return container;
}
