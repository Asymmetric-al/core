import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import { Separator } from "@asym/ui/components/shadcn/separator";
import Link from "next/link";

import type { ReactNode } from "react";

type LegalRoute = "privacy" | "terms" | "cookies";

type LegalPageShellProps = {
  children: ReactNode;
  currentRoute: LegalRoute;
  effectiveDate?: string;
  intro: string;
  title: string;
};

const legalRoutes: {
  href: `/${LegalRoute}`;
  key: LegalRoute;
  label: string;
}[] = [
  { key: "privacy", label: "Privacy", href: "/privacy" },
  { key: "terms", label: "Terms", href: "/terms" },
  { key: "cookies", label: "Cookies", href: "/cookies" },
];

export function LegalPageShell({
  children,
  currentRoute,
  effectiveDate,
  intro,
  title,
}: LegalPageShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/40 via-background to-background selection:bg-primary/15">
      <div className="container-responsive py-12 sm:py-16 lg:py-20">
        <div className="mx-auto flex max-w-5xl flex-col gap-8 sm:gap-10">
          <header className="flex flex-col gap-6">
            <Badge
              variant="outline"
              className="w-fit border-border/80 bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
            >
              Legal Scaffold
            </Badge>

            <div className="flex flex-col gap-4">
              <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {title}
              </h1>
              <p className="max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
                {intro}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                Effective date
              </span>
              <span>{effectiveDate ?? "TODO: Replace before production."}</span>
            </div>

            <div className="rounded-2xl border border-border/80 bg-secondary/65 px-4 py-4 text-sm leading-7 text-secondary-foreground">
              This page is a conservative starter legal scaffold. Human review
              and legal review are still required before production sign-off.
            </div>

            <div className="flex flex-wrap gap-2">
              {legalRoutes.map((route) => (
                <Button
                  key={route.key}
                  asChild
                  size="sm"
                  variant={route.key === currentRoute ? "default" : "outline"}
                >
                  <Link href={route.href}>{route.label}</Link>
                </Button>
              ))}
            </div>
          </header>

          <Separator className="bg-border/80" />

          <div className="mx-auto w-full max-w-4xl">{children}</div>
        </div>
      </div>
    </div>
  );
}
