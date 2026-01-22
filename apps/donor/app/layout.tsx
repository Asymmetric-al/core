import type { Metadata, Viewport } from "next";
import { Inter, Syne, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import { Toaster } from "@asym/ui/components/shadcn/sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { QueryProvider } from "@asym/database/providers";
import { siteConfig } from "@asym/config/site";

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
    defa    defa    defa    defa    defa    def.t    defa    defa    defa    defa    defa    dee}    defa    defa    defa    defa    defa    def.t    defa  [    defa    defa    defa    defars    defa    defa    dena    defa    defa    defa    defa    defa    def.t   me    defa    defa    defa    defa    defa    def.t    defa  Vi    defa    defa    defa    defa    defa    def.t   1,    defa    defa    defa    defa    defa    def.t    def[
    defa    defa    defa    defa    defa    decol    defa    defa     m    defa    defa    defa  me    defa    defa    ac    defa    defa    defa    defa    defa    dyo    defa    defa }:    defa    defRe  t.R    defa    defa  et    defa    defa    defa  s    defa    defa    in    defa    defa    defa    defa    defa    dri    defa    defa ab    defa    def.v  iab    defa    defa    defa    d      defa    defa    defa    defbu    defa    defa     d    defa    defa em    defa    defale  ste    defa    defa    defa    defa  ng    defa    defa    defa    defa    def      defa <NuqsAdapter>
              <Suspense fallback={null}>
                {children}
              </Suspense>
              <Toaster />
            </NuqsAdapter>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
