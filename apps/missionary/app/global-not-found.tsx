import "./globals.css";

import { buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import Link from "next/link";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not Found | Missionary Dashboard",
  description: "The requested missionary dashboard page does not exist.",
};

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="m-0 bg-background font-sans text-foreground">
        <main className="flex min-h-dvh items-center justify-center p-6">
          <div className="w-full max-w-110 text-center">
            <Card>
              <CardHeader>
                <p className="text-sm font-medium text-muted-foreground">404</p>
                <CardTitle>
                  <h1 className="text-2xl font-semibold tracking-tight">
                    Page not found
                  </h1>
                </CardTitle>
                <CardDescription>
                  This missionary dashboard route does not exist or has moved.
                </CardDescription>
              </CardHeader>
              <CardFooter className="justify-center">
                <Link href="/" className={buttonVariants()}>
                  Return home
                </Link>
              </CardFooter>
            </Card>
          </div>
        </main>
      </body>
    </html>
  );
}
