import { createBrowserClient } from "@asym/database/supabase";
import type { CloudinaryUploadResponse } from "./cloudinary-client";

export interface SaveAssetOptions {
  userId?: string;
  tenantId?: string;
  purpose?: string;
  metadata?: Record<string, any>;
}

/**
 * Persists Cloudinary asset metadata to the Supabase 'assets' table.
 */
export async function saveAssetMetadata(
  cloudinaryData: CloudinaryUploadResponse,
  options: SaveAssetOptions = {},
) {
  const supabase = await createBrowserClient();

  const { data, error } = await supabase
    .from("assets")
    .insert({
      public_id: cloudinaryData.public_id,
      secure_url: cloudinaryData.secure_url,
      width: cloudinaryData.width,
      height: cloudinaryData.height,
      format: cloudinaryData.format,
      bytes: cloudinaryData.bytes,
      resource_type: cloudinaryData.resource_type,
      purpose: options.purpose,
      user_id: options.userId,
      tenant_id: options.tenantId,
      metadata: {
        ...options.metadata,
        version: cloudinaryData.version,
        created_at: cloudinaryData.created_at,
      },
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving asset metadata:", error);
    throw new Error(`Failed to save asset metadata: ${error.message}`);
  }

  return data;
}
