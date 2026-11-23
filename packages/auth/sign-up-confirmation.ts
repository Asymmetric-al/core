export const SIGN_UP_CONFIRMATION_CALLBACK_PATH = "/auth/callback";

export function signUpConfirmationRedirectUrl(origin: string): string {
  return new URL(SIGN_UP_CONFIRMATION_CALLBACK_PATH, origin).toString();
}
