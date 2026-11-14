import "./globals.css";

import { buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@asym/ui/components/shadcn/empty";
import { fontVariables } from "@asym/ui/fonts";
import Link from "next/link";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not Found | Mission Control",
  description: "The requested admin page does not exist.",
};

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body
        className={`${fontVariables} m-0 bg-background font-sans antialiased text-foreground`}
      >
        <main className="flex min-h-dvh items-center justify-center p-6">
          <Empty className="max-w-lg">
            <EmptyHeader>
              <EmptyTitle>
                <h1>Page not found</h1>
              </EmptyTitle>
              <EmptyDescription>
                This admin route does not exist or is no longer available.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Link href="/" className={buttonVariants()}>
                Return home
              </Link>
            </EmptyContent>
          </Empty>
        </main>
      </body>
    </html>
  );
}
