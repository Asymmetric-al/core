import { clientEnv } from "@asym/env";

export interface CloudinaryUploadResponse {
  bytes: number;
  context?: unknown;
  created_at: string;
  folder?: string;
  format: string;
  height: number;
  public_id: string;
  resource_type: string;
  secure_url: string;
  signature: string;
  type: string;
  url: string;
  version: number;
  width: number;
}

/**
 * Uploads a file directly to Cloudinary using a signed request.
 * The signature is obtained from the local API route.
 */
export async function uploadToCloudinary(
  file: Blob | File,
  options: { folder?: string; purpose?: string } = {}
): Promise<CloudinaryUploadResponse> {
  // 1. Get signature from our API
  const signatureResponse = await fetch("/api/upload/cloudinary/signature", {
    method: "POST",
    body: JSON.stringify(options),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!signatureResponse.ok) {
    const error = await signatureResponse.json();
    throw new Error(error.error || "Failed to get Cloudinary signature");
  }

  const { signature, timestamp, apiKey, cloudName, folder, context } =
    await signatureResponse.json();

  // 2. Prepare FormData for Cloudinary
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  if (folder) {
    formData.append("folder", folder);
  }
  if (context) {
    formData.append("context", context);
  }

  // 3. Upload to Cloudinary
  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!uploadResponse.ok) {
    const error = await uploadResponse.json();
    throw new Error(error.error?.message || "Cloudinary upload failed");
  }

  return uploadResponse.json();
}

export const isCloudinaryEnabled = clientEnv.NEXT_PUBLIC_CLOUDINARY_ENABLED;
