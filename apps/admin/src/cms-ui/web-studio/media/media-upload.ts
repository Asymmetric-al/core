import { withAppBasePath } from "@asym/database/app-base-path";
import { ownApiFetch } from "@asym/database/own-api";
import { z } from "zod";

const HEX_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const MEDIA_UPLOAD_MAX_BYTES = 15_728_640;
export const MEDIA_UPLOAD_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MEDIA_TEXT_MAX_LENGTH = 500;

const REGISTER_PATH = "/web-studio/api/web-studio/media/register";
const REMOVE_PATH = "/web-studio/api/web-studio/media/remove";
const NO_CONNECTION = "Check your connection and try again.";

export type MediaVariant = "w320" | "w960" | "w1600";

export type MediaDetails = {
  alt: string;
  credit: string | null;
  folder: string | null;
};

export type MediaDetailsField = keyof MediaDetails;

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

const DETAIL_LABELS: Record<MediaDetailsField, string> = {
  alt: "Alt text",
  credit: "Credit",
  folder: "Folder",
};

export function mediaDetailsErrors(
  details: MediaDetails,
): Partial<Record<MediaDetailsField, string>> {
  const errors: Partial<Record<MediaDetailsField, string>> = {};
  if (!details.alt.trim()) {
    errors.alt = "Describe the image for people who cannot see it.";
  }
  for (const field of ["alt", "credit", "folder"] as const) {
    if ((details[field]?.trim().length ?? 0) > MEDIA_TEXT_MAX_LENGTH) {
      errors[field] =
        `${DETAIL_LABELS[field]} can be at most ${MEDIA_TEXT_MAX_LENGTH} characters.`;
    }
  }
  return errors;
}

export function mediaAddress(
  id: string,
  variant?: MediaVariant,
): string | null {
  if (!HEX_UUID.test(id)) return null;
  const path = `/api/media/${id.toLowerCase()}`;
  return withAppBasePath(variant ? `${path}?variant=${variant}` : path);
}

async function attempt(request: () => Promise<Response>) {
  try {
    return await request();
  } catch {
    return null;
  }
}

const mediaId = z
  .string()
  .regex(HEX_UUID)
  .transform((value) => value.toLowerCase());

const mediaStartAnswer = z.object({
  assetId: mediaId,
  signedUrl: z.url({ protocol: /^https?$/ }),
});

const mediaRegistrationAnswer = z.object({ id: mediaId });

const sentence = z.string().trim().min(1);

const mediaErrorAnswer = z.union([
  z.object({ error: sentence }),
  z.object({ errors: z.array(z.object({ message: sentence })).min(1) }),
]);

export type MediaStartAnswer = z.infer<typeof mediaStartAnswer>;
export type MediaRegistrationAnswer = z.infer<typeof mediaRegistrationAnswer>;
export type MediaErrorAnswer = z.infer<typeof mediaErrorAnswer>;

async function parseAnswer<T>(
  response: Response,
  schema: z.ZodType<T>,
): Promise<T | null> {
  const parsed = schema.safeParse(await response.json().catch(() => undefined));
  return parsed.success ? parsed.data : null;
}

async function messageOf(response: Response, fallback: string) {
  const answer = await parseAnswer(response, mediaErrorAnswer);
  if (!answer) return fallback;
  return "error" in answer ? answer.error : answer.errors[0]!.message;
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
  const notAdded = (message: string): MediaUploadOutcome => ({
    ok: false,
    stage: "register",
    assetId,
    message,
  });
  const response = await attempt(() =>
    fetch(withAppBasePath(REGISTER_PATH), {
      ...jsonPost({ assetId, ...details }),
      credentials: "same-origin",
    }),
  );
  if (!response) {
    return notAdded(
      `The image was stored but not added to the library. ${NO_CONNECTION}`,
    );
  }
  if (!response.ok) {
    return notAdded(
      await messageOf(
        response,
        "The image was stored but not added to the library.",
      ),
    );
  }
  const added = await parseAnswer(response, mediaRegistrationAnswer);
  if (added?.id !== assetId.toLowerCase()) {
    return notAdded(
      "The image was stored, but the library's answer could not be read. Try again.",
    );
  }
  return { ok: true, id: added.id };
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
  const [detailsError] = Object.values(mediaDetailsErrors(details));
  if (detailsError) {
    return { ok: false, stage: "start", message: detailsError };
  }
  const start = await attempt(() =>
    ownApiFetch(
      "/api/cms/media/start",
      jsonPost({ byteSize: file.size, mimeType: file.type }),
    ),
  );
  if (!start) {
    return {
      ok: false,
      stage: "start",
      message: `The upload could not start. ${NO_CONNECTION}`,
    };
  }
  if (!start.ok) {
    return {
      ok: false,
      stage: "start",
      message: await messageOf(start, "The upload could not start."),
    };
  }
  const started = await parseAnswer(start, mediaStartAnswer);
  if (!started) {
    return {
      ok: false,
      stage: "start",
      message: "The upload could not start. Try again.",
    };
  }
  const { assetId, signedUrl } = started;
  const stored = await attempt(() =>
    fetch(signedUrl, {
      method: "PUT",
      headers: { "content-type": file.type },
      body: file,
    }),
  );
  if (!stored?.ok) {
    return {
      ok: false,
      stage: "upload",
      assetId,
      message: "The file could not be stored. Try again.",
    };
  }
  const finalized = await attempt(() =>
    ownApiFetch("/api/cms/media/finalize", jsonPost({ assetId })),
  );
  if (!finalized) {
    return {
      ok: false,
      stage: "finalize",
      assetId,
      message: `The image could not be checked. ${NO_CONNECTION}`,
    };
  }
  if (!finalized.ok) {
    return {
      ok: false,
      stage: "finalize",
      assetId,
      message: await messageOf(finalized, "The image could not be checked."),
    };
  }
  return registerUploadedMedia(assetId, details);
}

export async function deleteMediaFile(id: string): Promise<MediaDeleteOutcome> {
  const deleted = await attempt(() =>
    ownApiFetch("/api/cms/media/delete", jsonPost({ assetId: id })),
  );
  if (!deleted) {
    return {
      ok: false,
      message: `The image could not be deleted. ${NO_CONNECTION}`,
    };
  }
  if (!deleted.ok && deleted.status !== 404) {
    return {
      ok: false,
      message: await messageOf(deleted, "The image could not be deleted."),
    };
  }
  const removed = await attempt(() =>
    fetch(withAppBasePath(REMOVE_PATH), {
      ...jsonPost({ assetId: id }),
      credentials: "same-origin",
    }),
  );
  if (!removed) {
    return {
      ok: false,
      message: `The image was deleted but is still listed. ${NO_CONNECTION}`,
    };
  }
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
