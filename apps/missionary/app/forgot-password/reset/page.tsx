import { readPasswordRecovery } from "@asym/auth/auth-screen";
import { ResetPasswordScreen } from "@asym/ui/components/auth/ResetPasswordScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Choose a new password",
  description: "Finish resetting your missionary portal password.",
};

// Streams behind `loading.tsx`: the recovery session is read per request.
export default async function ResetPasswordPage() {
  const recovery = await readPasswordRecovery();
  return <ResetPasswordScreen appId="missionary" recovery={recovery} />;
}
