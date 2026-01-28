import type { Metadata, Viewport } from "next";
import { redirect } from "next/navigation";
import { Inter, Syne, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "@asym/ui/styles/globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import { Toaster } from "@asym/ui/components/shadcn/sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { QueryProvider } from "@asym/database/providers";
import { siteConfig } from "@asym/config/site";
import { getAuthContext } from "@asym/auth";
import { MCShell } from "./mc-shell";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const auth = await getAuthContext();

  if (!auth.isAuthenticated) {
    redirect("/login");
  }

  if (
    auth.role !== "admin" &&
    auth.role !== "staff" &&
    auth.role !== "super_admin"
  ) {
    redirect("/login");
  }

  return (
    <html lang={siteConfig.language} suppressHydrationWarning>
      <head>
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
            <Suspense fallback={null}>
              <NuqsAdapter>
                <MCShell>{children}</MCShell>
              </NuqsAdapter>
            </Suspense>
          </QueryProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
