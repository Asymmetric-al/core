import { withAppBasePath } from "@asym/database/document-reload";

export const SIGN_UP_CONFIRMATION_CALLBACK_PATH = "/auth/callback";

export function signUpConfirmationRedirectUrl(origin: string): string {
  return new URL(
    withAppBasePath(SIGN_UP_CONFIRMATION_CALLBACK_PATH),
    origin,
  ).toString();
}
