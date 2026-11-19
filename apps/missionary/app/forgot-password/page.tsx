import { ForgotPasswordScreen } from "@asym/ui/components/auth/ForgotPasswordScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset your password",
  description: "Reset your missionary portal password by email.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordScreen />;
}
