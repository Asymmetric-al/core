import { withAppBasePath } from "@asym/database/app-base-path";
import { ownApiFetch } from "@asym/database/own-api";

const HEX_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const MEDIA_UPLOAD_MAX_BYTES = 15_728_640;
export const MEDIA_UPLOAD_TYPES = ["image/jpeg", "image/png", "image/webp"];

const REGISTER_PATH = "/web-studio/api/web-studio/media/register";
const REMOVE_PATH = "/web-studio/api/web-studio/media/remove";

export type MediaVariant = "w320" | "w960" | "w1600";

export type MediaDetails = {
  alt: string;
  credit: string | null;
  folder: string | null;
};

export type MediaUploadStage = "start" | "upload" | "finalize" | "register";

export type MediaUploadOutcome =
  | { ok: true; id: string }
  | {
      ok: false;
      stage: MediaUploadStage;
      message: string;
      assetId?: string;
    };

export type MediaDeleteOutcome = { ok: true } | { ok: false; message: string };

export function mediaAddress(
  id: string,
  variant?: MediaVariant,
): string | null {
  if (!HEX_UUID.test(id)) return null;
  const path = `/api/media/${id.toLowerCase()}`;
  return withAppBasePath(variant ? `${path}?variant=${variant}` : path);
}

async function messageOf(response: Response, fallback: string) {
  const body = (await response.json().catch(() => null)) as {
    error?: unknown;
    errors?: Array<{ message?: unknown }>;
  } | null;
  if (typeof body?.error === "string" && body.error) return body.error;
  const first = body?.errors?.[0]?.message;
  return typeof first === "string" && first ? first : fallback;
}

const jsonPost = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

export async function registerUploadedMedia(
  assetId: string,
  details: MediaDetails,
): Promise<MediaUploadOutcome> {
  const response = await fetch(withAppBasePath(REGISTER_PATH), {
    ...jsonPost({ assetId, ...details }),
    credentials: "same-origin",
  });
  if (!response.ok) {
    return {
      ok: false,
      stage: "register",
      assetId,
      message: await messageOf(
        response,
        "The image was stored but not added to the library.",
      ),
    };
  }
  const { id } = (await response.json()) as { id: string };
  return { ok: true, id };
}

export async function uploadMediaFile(
  file: File,
  details: MediaDetails,
): Promise<MediaUploadOutcome> {
  if (!MEDIA_UPLOAD_TYPES.includes(file.type)) {
    return {
      ok: false,
      stage: "start",
      message: "Choose a JPEG, PNG or WebP image.",
    };
  }
  if (file.size > MEDIA_UPLOAD_MAX_BYTES) {
    return {
      ok: false,
      stage: "start",
      message: "This image is larger than 15 MB.",
    };
  }
  const start = await ownApiFetch(
    "/api/cms/media/start",
    jsonPost({ byteSize: file.size, mimeType: file.type }),
  );
  if (!start.ok) {
    return {
      ok: false,
      stage: "start",
      message: await messageOf(start, "The upload could not start."),
    };
  }
  const started = (await start.json()) as {
    assetId: string;
    signedUrl: string;
  };
  const stored = await fetch(started.signedUrl, {
    method: "PUT",
    headers: { "content-type": file.type },
    body: file,
  });
  if (!stored.ok) {
    return {
      ok: false,
      stage: "upload",
      assetId: started.assetId,
      message: "The file could not be stored. Try again.",
    };
  }
  const finalized = await ownApiFetch(
    "/api/cms/media/finalize",
    jsonPost({ assetId: started.assetId }),
  );
  if (!finalized.ok) {
    return {
      ok: false,
      stage: "finalize",
      assetId: started.assetId,
      message: await messageOf(finalized, "The image could not be checked."),
    };
  }
  return registerUploadedMedia(started.assetId, details);
}

export async function deleteMediaFile(id: string): Promise<MediaDeleteOutcome> {
  const deleted = await ownApiFetch(
    "/api/cms/media/delete",
    jsonPost({ assetId: id }),
  );
  if (!deleted.ok && deleted.status !== 404) {
    return {
      ok: false,
      message: await messageOf(deleted, "The image could not be deleted."),
    };
  }
  const removed = await fetch(withAppBasePath(REMOVE_PATH), {
    ...jsonPost({ assetId: id }),
    credentials: "same-origin",
  });
  if (!removed.ok) {
    return {
      ok: false,
      message: await messageOf(
        removed,
        "The image was deleted but is still listed. Try again.",
      ),
    };
  }
  return { ok: true };
}
