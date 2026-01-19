import type { Metadata } from "next";
import dynamic from "next/dynamic";

const AppShell = dynamic(
  () => import("@/components/app-shell").then((mod) => mod.AppShell),
  {
    ssr: true,
  },
);

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function MissionaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell role="missionary" tenantName="Give Hope">
      {children}
    </AppShell>
  );
}
