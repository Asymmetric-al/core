import "@asym/env";
import { getAuthContext, hasAnyContextRole } from "@asym/auth/context";
import { getProtectedAppRedirectPath } from "@asym/auth/redirects";
import { CHOOSER_PATH, stripTenantAddress } from "@asym/auth/tenant-address";
import { TenantDocument } from "@asym/auth/tenant-navigation";
import { readDocumentScope } from "@asym/auth/tenant-server";
import { siteConfig } from "@asym/config/site";
import { QueryProvider } from "@asym/database/providers";
import { getSupabasePublicConfig } from "@asym/database/supabase/config";
import { MotionProvider } from "@asym/lib/motion-provider";
import { Toaster } from "@asym/ui/components/shadcn/sonner";
import { TooltipProvider } from "@asym/ui/components/shadcn/tooltip";
import { fontVariables } from "@asym/ui/fonts";
import {
  RetainedDraftPageTenant,
  SessionRetainedDraftProvider,
} from "@asym/ui/hooks";
import { ThemeProvider } from "@asym/ui/lib/theme-provider";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";

import type { Metadata, Viewport } from "next";

import { BoneyardRegistry } from "@/app/_providers/boneyard-registry";
import {
  MissionaryLayoutShell,
  MissionaryWorkspaceChrome,
} from "@/app/_providers/missionary-layout-shell";
import { WorkspaceSkeleton } from "@/app/_providers/workspace-skeleton";
import { MISSIONARY_ALLOWED_ROLES } from "@/app/access";
import { isMissionaryRoleGatePublicPath } from "@/lib/route-policy";
import "./globals.css";

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

/**
 * The signed-in workspace: the role gate, the document scope and the chrome.
 * Stream: they are request-time data, so `MissionaryLayoutShell` renders this
 * behind a Suspense boundary on workspace routes, and the skeleton prerenders
 * into those routes' static shell. Account screens render outside it, so
 * their own markup still prerenders.
 *
 * Every signed-in page lives under the tenant in the page address (plan 5.2;
 * AL-2675), so its links, its navigation and its data all depend on the
 * tenant the proxy admitted, and the static shell holds no tenant. The pages
 * therefore render here, inside the gate and the `TenantDocument` that fixes
 * the document's scope, as Mission Control's do. The proxy has already
 * decided membership in the address's tenant before this runs; this gate is
 * the defense in depth behind it, and with the pages outside it their markup
 * would flush before its redirect reached the stream.
 */
async function MissionaryWorkspace({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = (await headers()).get("x-asym-pathname") ?? "/";
  // React renders this element for every route, account screens included,
  // even where the shell does not show it: do no auth work for those.
  if (isMissionaryRoleGatePublicPath(stripTenantAddress(pathname))) {
    return <MissionaryWorkspaceChrome>{children}</MissionaryWorkspaceChrome>;
  }

  const authContext = await getAuthContext(undefined, {
    roleClass: "missionary",
  });
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

  const scope = await readDocumentScope(authContext);
  if (!scope) {
    redirect(`${CHOOSER_PATH}?next=${encodeURIComponent(pathname)}`);
  }

  // Retained drafts are scoped by the page's tenant: the tenant of the
  // document's scope, which is the resolved missionary assignment's
  // (AL-2675). `RetainedDraftPageTenant` renders nothing.
  return (
    <TenantDocument scope={scope}>
      <RetainedDraftPageTenant
        userId={scope.userId}
        tenantId={scope.tenantId}
      />
      <MissionaryWorkspaceChrome>{children}</MissionaryWorkspaceChrome>
    </TenantDocument>
  );
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
      </head>
      <body className={`${fontVariables} font-sans antialiased`}>
        <div className="app-root">
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
                    <SessionRetainedDraftProvider>
                      <MissionaryLayoutShell
                        workspace={
                          <Suspense fallback={<WorkspaceSkeleton />}>
                            <MissionaryWorkspace>
                              {children}
                            </MissionaryWorkspace>
                          </Suspense>
                        }
                      >
                        {children}
                      </MissionaryLayoutShell>
                    </SessionRetainedDraftProvider>
                  </NuqsAdapter>
                </TooltipProvider>
              </MotionProvider>
            </QueryProvider>
            <Toaster />
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
