import { ForgotPasswordScreen } from "@asym/ui/components/auth/ForgotPasswordScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset your password",
  description: "Reset your donor portal password by email.",
};

export default function ForgotPasswordPage() {
  return (
    <ForgotPasswordScreen subtitle="Enter the email address you sign in with, usually the one your gift receipts go to. We’ll email you a link to choose a new password." />
  );
}
