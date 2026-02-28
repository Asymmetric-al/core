import "@asym/env";
import { siteConfig } from "@asym/config/site";
import { QueryProvider } from "@asym/database/providers";
import { getSupabasePublicConfig } from "@asym/database/supabase/config";
import { createClient } from "@asym/database/supabase/server";
import { MotionProvider } from "@asym/lib/motion";
import { Toaster } from "@asym/ui/components/shadcn/sonner";
import { Inter, Geist_Mono, Syne } from "next/font/google";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";

import type { Metadata, Viewport } from "next";

import { AppShell } from "@/components/app-shell";
import { ThemeProvider } from "@/lib/theme-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

function getSupabaseOrigin() {
  const { url } = getSupabasePublicConfig();
  if (!url) {
    return null;
  }

  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

const supabaseOrigin = getSupabaseOrigin();

const MISSIONARY_ALLOWED_ROLES = new Set([
  "missionary",
  "admin",
  "staff",
  "super_admin",
]);
const MISSIONARY_PUBLIC_PATH_PREFIXES = [
  "/login",
  "/register",
  "/auth/callback",
  "/forgot-password",
  "/no-access",
  "/api/",
] as const;

function isPublicPath(pathname: string) {
  return MISSIONARY_PUBLIC_PATH_PREFIXES.some((prefix) =>
    prefix.endsWith("/")
      ? pathname.startsWith(prefix)
      : pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

async function MissionaryRoleGate({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get("x-asym-pathname") ?? "/";
  if (isPublicPath(pathname)) {
    return <>{children}</>;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(pathname)}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.role || !MISSIONARY_ALLOWED_ROLES.has(profile.role)) {
    redirect("/no-access");
  }

  return <>{children}</>;
}

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `Missionary Dashboard | ${siteConfig.name}`,
    template: `%s | Missionary Dashboard`,
  },
  description: "Missionary dashboard for managing your mission work",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={siteConfig.language} suppressHydrationWarning>
      <head>
        {supabaseOrigin ? (
          <>
            <link rel="preconnect" href={supabaseOrigin} />
            <link rel="dns-prefetch" href={supabaseOrigin} />
          </>
        ) : null}
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body
        className={`${inter.variable} ${geistMono.variable} ${syne.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          storageKey="missionary-theme"
          disableTransitionOnChange
        >
          <QueryProvider>
            <MotionProvider>
              <Suspense fallback={null}>
                <NuqsAdapter>
                  <MissionaryRoleGate>
                    <AppShell role="missionary">{children}</AppShell>
                  </MissionaryRoleGate>
                </NuqsAdapter>
              </Suspense>
            </MotionProvider>
          </QueryProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
