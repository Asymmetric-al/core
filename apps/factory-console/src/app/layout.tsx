import { fontVariables } from "@asym/ui/fonts";
import { ThemeProvider } from "@asym/ui/lib/theme-provider";

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Core Console · VM100",
  description: "Owner-only Core factory operations over Archon",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body>
        {/* The shared theme provider sets the class before first paint; the
            choice is a per-browser display preference, not factory state.
            Light by default: the shared ThemeToggle reflects an explicit
            light/dark choice, not a resolved system theme. */}
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
          storageKey="factory-console-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
