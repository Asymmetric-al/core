import crypto from "crypto";

export interface CloudinarySignature {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
}

/**
 * Generates a SHA-1 signature for Cloudinary signed uploads.
 * Follows Cloudinary's alphabetical sorting requirement.
 */
export function generateCloudinarySignature(
  params: Record<string, any>,
): CloudinarySignature {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary configuration is missing or incomplete");
  }

  const timestamp = Math.round(new Date().getTime() / 1000);

  // Filter out empty values and exclude metadata/tags if they are objects
  const signatureParams: Record<string, any> = { ...params, timestamp };

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
      .map((key) => `${key}=${signatureParams[key]}`)
      .join("&") + apiSecret;

  // Generate SHA-1 hash
  const signature = crypto
    .createHash("sha1")
    .update(signatureString)
    .digest("hex");

  return {
    signature,
    timestamp,
    apiKey,
    cloudName,
  };
}

export const isCloudinaryEnabled =
  process.env.NEXT_PUBLIC_CLOUDINARY_ENABLED === "true";
