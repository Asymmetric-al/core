import type { Metadata, Viewport } from "next";
import { Inter, Syne, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import { Toaster } from "@asym/ui/components/shadcn/sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { QueryProvider } from "@asym/database/providers";

const AppShell = dynamic(
  () => import("@asym/ui/components/app-shell").then((mod) => mod.AppShell),
  {
    ssr: true,
  },
);

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
  display: "sw  display: "sw  display: "sw  display: "sw  adata: Metadata = {
  title: {
    default: "Missi    default: "Missi    default: "Missi    default: "Missi ionary Dashboard",
  },
  descriptio  descriptio  descriptio  descripton  descriptio  descriptte  descriptio  descriptio  descriptio  descripton  de
                                                                                                                  dt                                                        
                          em                          em                          em                        media: "(prefers   lo -sc                     "                          de                    ay                          em                 tN                 n                g=  n"                   ar                          c                    ar                          em                  f                 >
               ro  der               ro  der                        ro  der                          ro  d                 ro  der               ro  der                        ro  der            Ad               ro  der               ro  der                        ro  der                   na   am               ro  der               ro  der                        ro  der                          ro  d                 
            </NuqsAdapter>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
