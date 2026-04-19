import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Email Studio",
  description: "Compose and send transactional email templates.",
};

export default function EmailStudioLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
