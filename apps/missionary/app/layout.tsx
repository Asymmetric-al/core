import "@asym/env";
import { getAuthContext, hasAnyContextRole } from "@asym/auth/context";
import { getProtectedAppRedirectPath } from "@asym/auth/redirects";
import { siteConfig } from "@asym/config/site";
import { QueryProvider } from "@asym/database/providers";
import { getSupabasePublicConfig } from "@asym/database/supabase/config";
import { MotionProvider } from "@asym/lib/motion";
import { Toaster } from "@asym/ui/components/shadcn/sonner";
import { TooltipProvider } from "@asym/ui/components/shadcn/tooltip";
import { ThemeProvider } from "@asym/ui/lib/theme-provider";
import { Inter, Geist_Mono, Syne } from "next/font/google";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";

import type { Metadata, Viewport } from "next";

import { BoneyardRegistry } from "@/app/_providers/boneyard-registry";
import { MissionaryLayoutShell } from "@/app/_providers/missionary-layout-shell";
import { MISSIONARY_ALLOWED_ROLES } from "@/app/access";
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

const MISSIONARY_PUBLIC_PATH_PREFIXES = [
  "/login",
  "/register",
  "/auth/callback",
  "/forgot-password",
  "/no-access",
  "/api/",
  "/boneyard/",
] as const;

function isPublicPath(pathname: string) {
  return MISSIONARY_PUBLIC_PATH_PREFIXES.some((prefix) =>
    prefix.endsWith("/")
      ? pathname.startsWith(prefix)
      : pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Redirect-only sibling of `{children}` — it renders nothing.
 *
 * It deliberately does not wrap the page: wherever this gate wraps `children`,
 * `children` cannot prerender (the gate must `await headers()` before it can
 * even reach its `isPublicPath` early return), so every route's real markup and
 * every `loading.tsx` fall out of the static shell. As a sibling, the pages —
 * all of which are thin client re-exports with no server data reads — prerender
 * their actual content instead.
 *
 * Safe because `apps/missionary/proxy.ts` enforces `protectedRoutePrefixes:
 * ["/"]` with the shared `MISSIONARY_ALLOWED_ROLES` on every request, and page
 * data arrives through client hooks under RLS. Redirect timing is unchanged:
 * the gate was already inside the boundary, so `redirect()` already fired
 * post-flush. The accepted trade-off is that a request which bypassed the proxy
 * would briefly paint the static page frame — never data — before the streamed
 * redirect.
 */
async function MissionaryRoleGate() {
  const pathname = (await headers()).get("x-asym-pathname") ?? "/";
  if (isPublicPath(pathname)) {
    return null;
  }

  const authContext = await getAuthContext();
  const authRedirectPath = getProtectedAppRedirectPath(
    authContext,
    `/login?next=${encodeURIComponent(pathname)}`,
  );

  if (authRedirectPath) {
    redirect(authRedirectPath);
  }

  if (!hasAnyContextRole(authContext, [...MISSIONARY_ALLOWED_ROLES])) {
    redirect("/no-access");
  }

  return null;
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
          <BoneyardRegistry />
          <QueryProvider>
            <MotionProvider>
              <TooltipProvider delay={0}>
                <NuqsAdapter>
                  {/*
                   * The role gate is a redirect-only sibling of `children`, not
                   * a wrapper — see MissionaryRoleGate. That keeps the session
                   * read (the only suspending work) behind the boundary while
                   * the chrome AND each page's real markup prerender into the
                   * static shell.
                   */}
                  <MissionaryLayoutShell>
                    <Suspense fallback={null}>
                      <MissionaryRoleGate />
                    </Suspense>
                    {children}
                  </MissionaryLayoutShell>
                </NuqsAdapter>
              </TooltipProvider>
            </MotionProvider>
          </QueryProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
