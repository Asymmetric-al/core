import "@asym/env";
import { siteConfig } from "@asym/config/site";
import { QueryProvider } from "@asym/database/providers";
import { getSupabasePublicConfig } from "@asym/database/supabase/config";
import { MotionProvider } from "@asym/lib/motion-provider";
import { Toaster } from "@asym/ui/components/shadcn/sonner";
import { TooltipProvider } from "@asym/ui/components/shadcn/tooltip";
import { fontVariables } from "@asym/ui/fonts";
import { ThemeProvider } from "@asym/ui/lib/theme-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { BoneyardRegistry } from "./_providers/boneyard-registry";
import { AdminTanStackDevtools } from "./_providers/tanstack-devtools";

import type { Metadata, Viewport } from "next";

// Layer order first: it decides how Payload's stylesheets rank against Tailwind.
import "./css-layer-order.css";
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
  themeColor: "#ffffff",
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
            storageKey="admin-theme"
            disableTransitionOnChange
          >
            <BoneyardRegistry />
            <QueryProvider>
              <TooltipProvider delay={0}>
                <MotionProvider>
                  <NuqsAdapter>{children}</NuqsAdapter>
                </MotionProvider>
              </TooltipProvider>
            </QueryProvider>
            <AdminTanStackDevtools />
            <Toaster />
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
