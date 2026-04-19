import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Track supporter engagement and giving trends.",
};

export default function AnalyticsLayout({ children }: { children: ReactNode }) {
  return children;
}
