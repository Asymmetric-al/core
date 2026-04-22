import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Sign document",
  description: "Review and sign a document shared with you.",
};

export default function SignLayout({ children }: { children: ReactNode }) {
  return children;
}
