import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Boneyard tasks",
  description: "Archived or deferred tasks kept out of the main list.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function BoneyardTasksLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
