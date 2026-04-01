import "@asym/env";
import { getAuthContext, hasAnyContextRole } from "@asym/auth/context";
import { siteConfig } from "@asym/config/site";
import { QueryProvider } from "@asym/database/providers";
import { getAdminClient } from "@asym/database/supabase/admin";
import { getSupabasePublicConfig } from "@asym/database/supabase/config";
import { createClient } from "@asym/database/supabase/server";
import {
  createMCBootstrapState,
  type MCBootstrapState,
} from "@asym/lib/mission-control/bootstrap";
import { MotionProvider } from "@asym/lib/motion";
import { Toaster } from "@asym/ui/components/shadcn/sonner";
import { Inter, Geist_Mono, Syne } from "next/font/google";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";

import { MCShell } from "./mc-shell";

import type { Metadata, Viewport } from "next";

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

const ADMIN_PUBLIC_PATH_PREFIXES = [
  "/login",
  "/register",
  "/auth/callback",
  "/forgot-password",
  "/no-access",
  "/api/",
] as const;

type AdminShellProfile = {
  avatar_url: string | null;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  tenant_id: string | null;
  tenants:
    | {
        id: string;
        name: string;
        slug: string;
      }
    | {
        id: string;
        name: string;
        slug: string;
      }[]
    | null;
};

function isPublicPath(pathname: string) {
  return ADMIN_PUBLIC_PATH_PREFIXES.some((prefix) =>
    prefix.endsWith("/")
      ? pathname.startsWith(prefix)
      : pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function normalizeTenant(
  tenant: AdminShellProfile["tenants"],
  tenantId: string | null,
) {
  const resolvedTenant = Array.isArray(tenant) ? tenant[0] : tenant;

  if (
    resolvedTenant &&
    typeof resolvedTenant.id === "string" &&
    typeof resolvedTenant.name === "string" &&
    typeof resolvedTenant.slug === "string"
  ) {
    return resolvedTenant;
  }

  if (!tenantId) {
    return null;
  }

  return {
    id: tenantId,
    name: "Give Hope",
    slug: "give-hope",
  };
}

async function getProtectedShellState(
  pathname: string,
): Promise<MCBootstrapState> {
  const auth = await getAuthContext();

  if (!auth.isAuthenticated || !auth.userId) {
    redirect(`/login?next=${encodeURIComponent(pathname)}`);
  }

  if (
    !auth.tenantId ||
    !hasAnyContextRole(auth, ["staff", "admin", "super_admin"])
  ) {
    redirect("/no-access");
  }

  const serverClient = await createClient();
  const profileReader = getAdminClient().client ?? serverClient;
  const { data: profile } = await profileReader
    .from("profiles")
    .select(
      "email, first_name, last_name, avatar_url, role, tenant_id, tenants(id, name, slug)",
    )
    .eq("user_id", auth.userId)
    .maybeSingle<AdminShellProfile>();

  return createMCBootstrapState({
    userId: auth.userId,
    email: profile?.email ?? "",
    firstName: profile?.first_name,
    lastName: profile?.last_name,
    avatarUrl: profile?.avatar_url,
    profileRole:
      auth.profileRole ??
      auth.role ??
      (typeof profile?.role === "string" ? profile.role : null),
    tenantId: auth.tenantId,
    tenant: normalizeTenant(profile?.tenants ?? null, auth.tenantId),
  });
}

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `Mission Control | ${siteConfig.name}`,
    template: `%s | Mission Control`,
  },
  description: "Admin dashboard for managing your organization",
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

async function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get("x-asym-pathname") ?? "/";
  const isPublic = isPublicPath(pathname);
  const shellState = isPublic ? null : await getProtectedShellState(pathname);

  return (
    <NuqsAdapter>
      {isPublic ? (
        children
      ) : (
        <MCShell initialState={shellState}>{children}</MCShell>
      )}
    </NuqsAdapter>
  );
}

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
          storageKey="admin-theme"
          disableTransitionOnChange
        >
          <QueryProvider>
            <MotionProvider>
              <Suspense fallback={null}>
                <LayoutContent>{children}</LayoutContent>
              </Suspense>
            </MotionProvider>
          </QueryProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
