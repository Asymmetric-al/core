import {
  createBearerSupabaseClient,
  getAuthContext,
  hasAnyContextRole,
  requireAuth,
} from "@asym/auth/context";
import { NextResponse } from "next/server";

import {
  getBearerToken,
  readForm,
  uploadOnce,
  validateImageFile,
} from "./image";
import { editorImagePath, isEditorImagePurpose } from "../editor-images/key";
import { ApiHttpError, toErrorResponse } from "../shared/http-errors";

import type { UserRole } from "@asym/database/types";

/** Public bucket; its INSERT policy admits only editor/{own tenant}/{uid}/…. */
const EDITOR_IMAGES_BUCKET = "document-uploads";
const CARE_ROLES: UserRole[] = ["staff", "admin", "super_admin"];
const FEED_ROLES: UserRole[] = ["missionary", ...CARE_ROLES];

/**
 * POST /api/upload/editor-image (#2407): the rich-text editor's inline image
 * upload. The server picks the key from the caller's auth context and writes
 * with the caller's bearer client, never the service role. Care purposes are
 * refused unless the mount allows them (missionary app: never); until #2407
 * PR (b) they share the editor image bucket and its public URLs.
 */
function editorImageUpload({ allowCare }: { allowCare: boolean }) {
  return async function POST(request: Request) {
    try {
      const token = getBearerToken(request);
      if (!token) throw new ApiHttpError(401, "Unauthorized");

      const client = createBearerSupabaseClient(token);
      if (!client) {
        throw new ApiHttpError(503, "Image upload is not configured.");
      }

      const ctx = await getAuthContext(request);
      requireAuth(ctx);

      const form = await readForm(request);
      const purpose = form.get("purpose");
      if (!isEditorImagePurpose(purpose)) {
        throw new ApiHttpError(
          400,
          "Image purpose must be feed, care-thread or care-note.",
        );
      }
      const care = purpose !== "feed";
      if (care && !allowCare) {
        throw new ApiHttpError(403, "Care images are not accepted here.");
      }
      if (!hasAnyContextRole(ctx, care ? CARE_ROLES : FEED_ROLES)) {
        throw new ApiHttpError(403, "Forbidden");
      }
      const file = await validateImageFile(form.get("file"));

      const path = editorImagePath({
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        type: file.type,
      });
      const storage = client.storage.from(EDITOR_IMAGES_BUCKET);
      await uploadOnce(storage, path, file);

      const { data } = storage.getPublicUrl(path);
      return NextResponse.json({ url: data.publicUrl, path }, { status: 201 });
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

/** Mission Control mount: feed and care purposes. */
export const adminPOST = editorImageUpload({ allowCare: true });
/** Missionary app mount: feed only (Chief condition d, criterion 23). */
export const missionaryPOST = editorImageUpload({ allowCare: false });
