/**
 * #2308 spec r1 §4 C13 (signature sniffer) and C14 (key and extension helpers).
 */
import { describe, expect, it } from "vitest";

import {
  buildProfileImageKey,
  extensionForImageType,
  isProfileImageType,
  matchesImageSignature,
  parseUploadPurpose,
  type ProfileImageType,
} from "../../../../../packages/api/src/upload/image";

const bytes = (...values: Array<number | string>) =>
  new Uint8Array(
    values.flatMap((value) =>
      typeof value === "string" ? [...Buffer.from(value, "latin1")] : [value],
    ),
  );

const VALID: Record<ProfileImageType, Uint8Array[]> = {
  "image/jpeg": [bytes(0xff, 0xd8, 0xff, 0xe0), bytes(0xff, 0xd8, 0xff, 0xdb)],
  "image/png": [bytes(0x89, "PNG\r\n\x1a\n", 0, 0, 0, 0x0d)],
  "image/gif": [bytes("GIF87a"), bytes("GIF89a", 1, 0)],
  "image/webp": [bytes("RIFF", 0x24, 0, 0, 0, "WEBPVP8 ")],
};
const INVALID: Record<ProfileImageType, Uint8Array[]> = {
  "image/jpeg": [bytes(0xff, 0xd8, 0xfe), bytes(0x89, "PNG\r\n\x1a\n")],
  "image/png": [bytes(0x89, "PNG\r\n\x1a"), bytes(0x89, "PNX\r\n\x1a\n")],
  "image/gif": [bytes("GIF88a"), bytes("gif89a")],
  "image/webp": [bytes("RIFF", 0, 0, 0, 0, "WAVE"), bytes("RIFX0000WEBP")],
};
const TYPES = Object.keys(VALID) as ProfileImageType[];

describe("#2308 C13 image signature sniffer (B)", () => {
  it.each(TYPES)("accepts the %s signature", (type) => {
    for (const sample of VALID[type]) {
      expect(matchesImageSignature(sample, type)).toBe(true);
    }
  });

  it.each(TYPES)("rejects a corrupted %s signature", (type) => {
    for (const sample of INVALID[type]) {
      expect(matchesImageSignature(sample, type)).toBe(false);
    }
  });

  it.each(TYPES)("rejects the other types' bytes declared as %s", (type) => {
    for (const other of TYPES.filter((candidate) => candidate !== type)) {
      for (const sample of VALID[other]) {
        expect(matchesImageSignature(sample, type)).toBe(false);
      }
    }
  });

  it.each(TYPES)("rejects empty and short buffers for %s", (type) => {
    expect(matchesImageSignature(new Uint8Array(), type)).toBe(false);
    const [sample] = VALID[type];
    expect(matchesImageSignature(sample!.slice(0, 2), type)).toBe(false);
  });

  it("needs the WEBP marker at offset 8, not just RIFF", () => {
    expect(matchesImageSignature(bytes("RIFF", 0, 0, 0, 0), "image/webp")).toBe(
      false,
    );
    expect(
      matchesImageSignature(bytes("RIFF", 0, 0, 0, 0, "WEB"), "image/webp"),
    ).toBe(false);
  });
});

describe("#2308 C14 key and extension helpers (B)", () => {
  const input = {
    purpose: "avatars" as const,
    tenantId: "11111111-1111-4111-8111-111111111111",
    userId: "22222222-2222-4222-8222-222222222222",
    type: "image/webp" as const,
  };

  it("maps the four accepted types to their extensions", () => {
    expect(TYPES.map(extensionForImageType)).toEqual([
      "jpg",
      "png",
      "gif",
      "webp",
    ]);
  });

  it("accepts only the four image types", () => {
    for (const type of TYPES) expect(isProfileImageType(type)).toBe(true);
    for (const type of [
      "",
      "text/plain",
      "image/svg+xml",
      "image/jpg",
      "IMAGE/PNG",
      "toString",
      "__proto__",
    ]) {
      expect(isProfileImageType(type)).toBe(false);
    }
  });

  it("builds {purpose}/{tenantId}/{userId}/{uuid}.{ext}", () => {
    expect(buildProfileImageKey(input)).toMatch(
      /^avatars\/11111111-1111-4111-8111-111111111111\/22222222-2222-4222-8222-222222222222\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp$/,
    );
    expect(
      buildProfileImageKey({ ...input, purpose: "covers", type: "image/jpeg" }),
    ).toMatch(/^covers\/.+\.jpg$/);
  });

  it("uses a fresh uuid on every call", () => {
    const keys = new Set(
      Array.from({ length: 20 }, () => buildProfileImageKey(input)),
    );
    expect(keys.size).toBe(20);
  });

  it("only lets the two purposes through, so client path text never reaches the key", () => {
    expect(parseUploadPurpose("avatars")).toBe("avatars");
    expect(parseUploadPurpose("covers")).toBe("covers");
    for (const value of [
      null,
      "",
      "Avatars",
      "avatars/",
      "avatars/../covers",
      "../avatars",
      "other-user",
      "document-uploads",
      new File(["x"], "avatars"),
    ]) {
      expect(() => parseUploadPurpose(value)).toThrow(
        expect.objectContaining({ status: 400 }),
      );
    }
  });
});
