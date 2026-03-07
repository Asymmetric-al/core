import "@asym/env";
import { siteConfig } from "@asym/config/site";
import { QueryProvider } from "@asym/database/providers";
import { MotionProvider } from "@asym/lib/motion";
import { Toaster } from "@asym/ui/components/shadcn/sonner";
import { Inter, Geist_Mono, Geist, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";

import { MCShell } from "./mc-shell";

import type { Metadata, Viewport } from "next";

import { FontProvider, FONT_INLINE_SCRIPT } from "@/lib/font-provider";
import { ThemeProvider } from "@/lib/theme-provider";
import "./globals.css";

// Inter — body font for modern-clean pairing
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

// Plus Jakarta Sans — heading font for product pairing (default)
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  preload: true,
});

// JetBrains Mono — mono font for product pairing
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  preload: false,
});

// Geist — heading+body font for minimal pairing
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

// Geist Mono — mono font for minimal + modern-clean pairings
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={siteConfig.language} suppressHydrationWarning>
      <head>
        {/* Inline script reads localStorage before first paint — prevents font FOUC */}
        <script dangerouslySetInnerHTML={{ __html: FONT_INLINE_SCRIPT }} />
        <link
          rel="preconnect"
          href="https://kzeybagjclwsxpkjshqa.supabase.co"
        />
        <link
          rel="dns-prefetch"
          href="https://kzeybagjclwsxpkjshqa.supabase.co"
        />
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
        className={`${inter.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable} ${geist.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          storageKey="admin-theme"
          disableTransitionOnChange
        >
          <FontProvider>
            <QueryProvider>
              <MotionProvider>
                <Suspense fallback={null}>
                  <NuqsAdapter>
                    <MCShell>{children}</MCShell>
                  </NuqsAdapter>
                </Suspense>
              </MotionProvider>
            </QueryProvider>
          </FontProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
