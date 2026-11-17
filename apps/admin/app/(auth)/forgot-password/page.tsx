import { ForgotPasswordScreen } from "@asym/ui/components/auth/ForgotPasswordScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Reset your Mission Control password by email.",
};

export default function ForgotPasswordPage() {
  return (
    <ForgotPasswordScreen subtitle="Enter the email address you use for Mission Control. We’ll email you a link to choose a new password." />
  );
}
