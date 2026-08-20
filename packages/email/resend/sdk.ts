import { Resend } from "resend";

export function createResendClientInstance(apiKey: string): Resend {
  return new Resend(apiKey);
}
