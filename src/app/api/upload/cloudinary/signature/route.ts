import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  generateCloudinarySignature,
  isCloudinaryEnabled,
} from "@/lib/cloudinary-server";

export async function POST(request: NextRequest) {
  try {
    if (!isCloudinaryEnabled) {
      return NextResponse.json(
        { error: "Cloudinary pipeline is disabled" },
        { status: 403 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { folder, purpose, ...otherParams } = body;

    // Whitelist parameters to be signed
    const paramsToSign: Record<string, any> = {
      ...otherParams,
    };

    if (folder) paramsToSign.folder = folder;

    // Add user context for security/tracking
    paramsToSign.context = `user_id=${user.id}|purpose=${purpose || "general"}`;

    const signatureData = generateCloudinarySignature(paramsToSign);

    return NextResponse.json({
      ...signatureData,
      folder: paramsToSign.folder,
      context: paramsToSign.context,
    });
  } catch (error) {
    console.error("Cloudinary signature error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate signature",
      },
      { status: 500 },
    );
  }
}
