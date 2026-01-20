import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { getAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export interface ImageVariant {
  key: string;
  url: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
}

export interface ProcessedImageResult {
  original: ImageVariant;
  display: ImageVariant;
  thumbnail: ImageVariant;
}

const DISPLAY_MAX_DIMENSION = 1200;
const THUMBNAIL_MAX_DIMENSION = 200;
const OUTPUT_QUALITY = 85;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 });
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as string) || "profiles";
    const path = (formData.get("path") as string) || "avatars";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Unsupported file type. Allowed: ${ALLOWED_TYPES.join(", ")}`,
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size is ${
            MAX_FILE_SIZE / (1024 * 1024)
          }MB`,
        },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const metadata = await sharp(buffer).metadata();
    if (!metadata.width || !metadata.height) {
      return NextResponse.json(
        { error: "Invalid or corrupt image" },
        { status: 400 },
      );
    }

    const timestamp = Date.now();
    const baseName = `${user.id}-${timestamp}`;

    const displayBuffer = await sharp(buffer)
      .resize(DISPLAY_MAX_DIMENSION, DISPLAY_MAX_DIMENSION, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: OUTPUT_QUALITY })
      .toBuffer();

    const displayMetadata = await sharp(displayBuffer).metadata();

    const thumbnailBuffer = await sharp(buffer)
      .resize(THUMBNAIL_MAX_DIMENSION, THUMBNAIL_MAX_DIMENSION, {
        fit: "cover",
        position: "center",
      })
      .webp({ quality: OUTPUT_QUALITY })
      .toBuffer();

    const thumbnailMetadata = await sharp(thumbnailBuffer).metadata();

    const displayPath = `${path}/${baseName}-display.webp`;
    const thumbnailPath = `${path}/${baseName}-thumb.webp`;

    const [displayUpload, thumbnailUpload] = await Promise.all([
      supabaseAdmin.storage.from(bucket).upload(displayPath, displayBuffer, {
        contentType: "image/webp",
        upsert: true,
      }),
      supabaseAdmin.storage
        .from(bucket)
        .upload(thumbnailPath, thumbnailBuffer, {
          contentType: "image/webp",
          upsert: true,
        }),
    ]);

    if (displayUpload.error) {
      return NextResponse.json(
        { error: `Display upload failed: ${displayUpload.error.message}` },
        { status: 500 },
      );
    }

    if (thumbnailUpload.error) {
      return NextResponse.json(
        { error: `Thumbnail upload failed: ${thumbnailUpload.error.message}` },
        { status: 500 },
      );
    }

    const {
      data: { publicUrl: displayUrl },
    } = supabaseAdmin.storage.from(bucket).getPublicUrl(displayPath);
    const {
      data: { publicUrl: thumbnailUrl },
    } = supabaseAdmin.storage.from(bucket).getPublicUrl(thumbnailPath);

    const result: ProcessedImageResult = {
      original: {
        key: `${path}/${baseName}-original`,
        url: "",
        width: metadata.width,
        height: metadata.height,
        bytes: file.size,
        format: file.type,
      },
      display: {
        key: displayPath,
        url: displayUrl,
        width: displayMetadata.width || DISPLAY_MAX_DIMENSION,
        height: displayMetadata.height || DISPLAY_MAX_DIMENSION,
        bytes: displayBuffer.byteLength,
        format: "image/webp",
      },
      thumbnail: {
        key: thumbnailPath,
        url: thumbnailUrl,
        width: thumbnailMetadata.width || THUMBNAIL_MAX_DIMENSION,
        height: thumbnailMetadata.height || THUMBNAIL_MAX_DIMENSION,
        bytes: thumbnailBuffer.byteLength,
        format: "image/webp",
      },
    };

    return NextResponse.json({
      success: true,
      result,
      url: displayUrl,
      thumbnailUrl,
    });
  } catch (error) {
    console.error("Image processing error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process image",
      },
      { status: 500 },
    );
  }
}
