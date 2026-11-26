import { resendAdapter } from "@payloadcms/email-resend";

import type { EmailAdapter } from "payload";

export const DEFAULT_PAYLOAD_EMAIL_FROM_ADDRESS = "noreply@asymmetric.al";
export const DEFAULT_PAYLOAD_EMAIL_FROM_NAME = "Mission Control";

type PayloadRuntimeEnv = Partial<
  Pick<
    NodeJS.ProcessEnv,
    "PAYLOAD_EMAIL_FROM_ADDRESS" | "PAYLOAD_EMAIL_FROM_NAME" | "RESEND_API_KEY"
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
