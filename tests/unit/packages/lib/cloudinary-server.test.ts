import { createHash } from "node:crypto";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@asym/env", () => ({
  clientEnv: {
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "demo",
    NEXT_PUBLIC_CLOUDINARY_API_KEY: "1234",
    NEXT_PUBLIC_CLOUDINARY_ENABLED: true,
  },
  serverEnv: {
    CLOUDINARY_API_SECRET: "abcd",
  },
}));

import { generateCloudinarySignature } from "../../../../packages/lib/cloudinary-server";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(1315060510 * 1000));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("generateCloudinarySignature", () => {
  it("signs the sorted, non-empty parameters plus the secret with SHA-256", () => {
    // Cloudinary documented example:
    // https://cloudinary.com/documentation/authentication_signatures
    const { signature, timestamp, apiKey, cloudName, signatureAlgorithm } =
      generateCloudinarySignature({
        public_id: "sample_image",
        eager: "w_400,h_300,c_pad|w_260,h_200,c_crop",
        folder: "",
      });

    const stringToSign =
      "eager=w_400,h_300,c_pad|w_260,h_200,c_crop&public_id=sample_image&timestamp=1315060510abcd";
    // Official published SHA-1 of that string-to-sign (locks canonical input).
    const officialPublishedSha1 = "bfd09f95f331f558cbd1320e67aa8d488770583e";
    // Independently pinned SHA-256 of the same official string-to-sign.
    const expectedSha256 =
      "cc927e1290f9e3ae4c1a741eda21a4630b4ce80f9ce0bc0296337d25cf40f91e";

    expect(timestamp).toBe(1315060510);
    expect(apiKey).toBe("1234");
    expect(cloudName).toBe("demo");
    expect(signatureAlgorithm).toBe("sha256");
    expect(createHash("sha1").update(stringToSign).digest("hex")).toBe(
      officialPublishedSha1,
    );
    expect(signature).toBe(expectedSha256);
    expect(signature).toHaveLength(64);
  });

  it("omits reserved unsigned upload keys from the string-to-sign", () => {
    const signedWithReserved = generateCloudinarySignature({
      public_id: "sample_image",
      file: "blob",
      resource_type: "image",
      api_key: "should-not-sign",
      signature: "should-not-sign",
      signature_algorithm: "sha256",
    });
    const signedCanonical = generateCloudinarySignature({
      public_id: "sample_image",
    });

    expect(signedWithReserved.signature).toBe(signedCanonical.signature);
    expect(signedWithReserved.signatureAlgorithm).toBe("sha256");
    expect(signedCanonical.signatureAlgorithm).toBe("sha256");
  });
});
