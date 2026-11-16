"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@asym/ui/components/shadcn/breadcrumb";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { Separator } from "@asym/ui/components/shadcn/separator";
import { cn } from "@asym/ui/lib/utils";
import { useAuth, useConfig } from "@payloadcms/ui";
import { ChevronLeft, LogOut, UserRound, UserRoundCog } from "lucide-react";
import { formatAdminURL } from "payload/shared";

import { getEnabledWebStudioCollections } from "../collections/config";
import { Link } from "../routing";

type StudioTopBarProps = {
  sectionLabel?: string;
  /** Overrides the section link (stock Payload screens know their own). */
  sectionHref?: string;
  currentLabel?: string;
  /** The document a stock sub-view (Versions, API) belongs to. */
  document?: { label: string; href: string } | null;
  className?: string;
};

function resolveUserLabel(user: unknown): string | null {
  if (user && typeof user === "object" && "email" in user && user.email) {
    return String(user.email);
  }
  return null;
}

function StudioUserMenu() {
  const { user } = useAuth();
  const {
    config: {
      admin: { routes },
      routes: { admin: adminRoute },
    },
  } = useConfig();
  const label = resolveUserLabel(user);
  const accountHref = formatAdminURL({ adminRoute, path: routes.account });
  const logoutHref = formatAdminURL({ adminRoute, path: routes.logout });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="sm">
            <UserRound aria-hidden="true" />
            <span className="hidden max-w-48 truncate lg:inline">
              {label ?? "Your account"}
            </span>
            <span className="sr-only lg:hidden">{label ?? "Your account"}</span>
            <span className="sr-only">, account menu</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <span className="block truncate">{label ?? "Your account"}</span>
          </DropdownMenuLabel>
          <DropdownMenuItem render={<Link href={accountHref} />}>
            <UserRoundCog aria-hidden="true" />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/" />}>
            <ChevronLeft aria-hidden="true" />
            Mission Control
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href={logoutHref} />}>
            <LogOut aria-hidden="true" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function StudioTopBar({
  sectionLabel,
  sectionHref: sectionHrefOverride,
  currentLabel,
  document,
  className,
}: StudioTopBarProps) {
  const enabledCollections = getEnabledWebStudioCollections();
  const sectionHref =
    sectionHrefOverride ??
    enabledCollections.find((entry) => entry.sectionLabel === sectionLabel)
      ?.listPath ??
    "/web-studio";
  const isHome = !sectionLabel;

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-2 backdrop-blur supports-backdrop-filter:bg-background/80 sm:px-4",
        className,
      )}
    >
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "hidden sm:inline-flex",
        )}
      >
        <ChevronLeft aria-hidden="true" />
        Mission Control
      </Link>
      <Separator orientation="vertical" className="hidden h-4 sm:flex" />

      <div className="min-w-0 flex-1 overflow-hidden px-1">
        {sectionLabel && currentLabel ? (
          <>
            <Link
              href={sectionHref}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "-ml-1 max-w-full sm:hidden",
              )}
            >
              <ChevronLeft aria-hidden="true" />
              <span className="truncate">{sectionLabel}</span>
            </Link>
            <div className="hidden sm:block md:hidden">
              <Breadcrumb>
                <BreadcrumbList className="flex-nowrap">
                  <BreadcrumbItem>
                    <BreadcrumbLink render={<Link href={sectionHref} />}>
                      <span className="block max-w-40 truncate">
                        {sectionLabel}
                      </span>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      <span className="block max-w-48 truncate">
                        {currentLabel}
                      </span>
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </>
        ) : (
          <div className="md:hidden">
            <Breadcrumb>
              <BreadcrumbList className="flex-nowrap">
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    <span className="block max-w-48 truncate">
                      {currentLabel ?? sectionLabel ?? "Web Studio"}
                    </span>
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        )}
        <div className="hidden md:block">
          <Breadcrumb>
            <BreadcrumbList className="flex-nowrap">
              <BreadcrumbItem>
                {isHome ? (
                  <BreadcrumbPage>Web Studio</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href="/web-studio" />}>
                    Web Studio
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {sectionLabel ? (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {currentLabel ? (
                      <BreadcrumbLink render={<Link href={sectionHref} />}>
                        {sectionLabel}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{sectionLabel}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </>
              ) : null}
              {document ? (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink render={<Link href={document.href} />}>
                      <span className="block max-w-60 truncate">
                        {document.label}
                      </span>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              ) : null}
              {currentLabel ? (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      <span className="block max-w-40 truncate sm:max-w-80">
                        {currentLabel}
                      </span>
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              ) : null}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <Badge variant="outline">Staff only</Badge>
      <StudioUserMenu />
    </header>
  );
}
