import crypto from "crypto";

import { clientEnv, serverEnv } from "@asym/env";

export interface CloudinarySignature {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
}

type CloudinarySignatureParam = string | number | boolean | null | undefined;

/**
 * Generates a SHA-256 signature for Cloudinary signed uploads.
 * Follows Cloudinary's alphabetical sorting requirement.
 *
 * Cloudinary accepts SHA-1 and SHA-256 hex digests; SHA-256 requires
 * `signature_algorithm=sha256` on the upload body, not in the signed string
 * (https://cloudinary.com/documentation/authentication_signatures).
 * Live email uploads sign with SHA-256 in `packages/api/src/email/assets.ts`.
 * This helper is currently unused by production callers.
 */
export function generateCloudinarySignature(
  params: Record<string, CloudinarySignatureParam>,
): CloudinarySignature {
  const cloudName = clientEnv.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = clientEnv.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const apiSecret = serverEnv.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary configuration is missing or incomplete");
  }

  const timestamp = Math.round(new Date().getTime() / 1000);

  // Filter out empty values and exclude metadata/tags if they are objects
  const signatureParams: Record<string, CloudinarySignatureParam> = {
    ...params,
    timestamp,
  };

  // Sort keys alphabetically
  const sortedKeys = Object.keys(signatureParams).sort();

  // Construct signature string: "key1=value1&key2=value2...apiSecret"
  const signatureString =
    sortedKeys
      .filter(
        (key) =>
          signatureParams[key] !== undefined &&
          signatureParams[key] !== null &&
          signatureParams[key] !== "",
      )
      .map((key) => `${key}=${String(signatureParams[key])}`)
      .join("&") + apiSecret;

  // Cloudinary validates SHA-1 and SHA-256 digests interchangeably
  // (https://cloudinary.com/documentation/authentication_signatures); use the
  // collision-resistant one.
  const signature = crypto
    .createHash("sha256")
    .update(signatureString)
    .digest("hex");

  return {
    signature,
    timestamp,
    apiKey,
    cloudName,
  };
}

export const isCloudinaryEnabled = clientEnv.NEXT_PUBLIC_CLOUDINARY_ENABLED;
