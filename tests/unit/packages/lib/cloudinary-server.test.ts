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
    // Cloudinary's documented example inputs; the API validates SHA-1 and
    // SHA-256 digests interchangeably, and only the latter is collision safe.
    const { signature, timestamp, apiKey, cloudName } =
      generateCloudinarySignature({
        public_id: "sample_image",
        eager: "w_400,h_300,c_pad|w_260,h_200,c_crop",
        folder: "",
      });

    const stringToSign =
      "eager=w_400,h_300,c_pad|w_260,h_200,c_crop&public_id=sample_image&timestamp=1315060510abcd";

    expect(timestamp).toBe(1315060510);
    expect(apiKey).toBe("1234");
    expect(cloudName).toBe("demo");
    expect(signature).toBe(
      createHash("sha256").update(stringToSign).digest("hex"),
    );
    expect(signature).toHaveLength(64);
  });
});
