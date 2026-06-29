import { resendAdapter } from "@payloadcms/email-resend";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";

import type { EmailAdapter } from "payload";

export const WEB_STUDIO_MEDIA_BLOB_PREFIX = "web-studio/media";
export const DEFAULT_PAYLOAD_EMAIL_FROM_ADDRESS = "noreply@asymmetric.al";
export const DEFAULT_PAYLOAD_EMAIL_FROM_NAME = "Mission Control";

type PayloadRuntimeEnv = Partial<
  Pick<
    NodeJS.ProcessEnv,
    | "BLOB_READ_WRITE_TOKEN"
    | "PAYLOAD_EMAIL_FROM_ADDRESS"
    | "PAYLOAD_EMAIL_FROM_NAME"
    | "RESEND_API_KEY"
  >
>;

export function resolvePayloadEmailAdapter(
  env: PayloadRuntimeEnv = process.env as PayloadRuntimeEnv,
): EmailAdapter | undefined {
  if (!env.RESEND_API_KEY) {
    return undefined;
  }

  return resendAdapter({
    apiKey: env.RESEND_API_KEY,
    defaultFromAddress:
      env.PAYLOAD_EMAIL_FROM_ADDRESS ?? DEFAULT_PAYLOAD_EMAIL_FROM_ADDRESS,
    defaultFromName:
      env.PAYLOAD_EMAIL_FROM_NAME ?? DEFAULT_PAYLOAD_EMAIL_FROM_NAME,
  });
}

export function createPayloadStorageAdapters(
  env: PayloadRuntimeEnv = process.env as PayloadRuntimeEnv,
) {
  return [
    vercelBlobStorage({
      clientUploads: {
        access: ({ req }) => Boolean(req.user),
      },
      collections: {
        media: {
          prefix: WEB_STUDIO_MEDIA_BLOB_PREFIX,
        },
      },
      enabled: Boolean(env.BLOB_READ_WRITE_TOKEN),
      token: env.BLOB_READ_WRITE_TOKEN,
    }),
  ];
}
