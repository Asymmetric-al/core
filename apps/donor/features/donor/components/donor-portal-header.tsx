"use client";

import { signOutClientSession } from "@asym/auth/client-session";
import { siteConfig } from "@asym/config/site-client";
import { useDonorPortalSnapshot } from "@asym/database/hooks";
import { useAuth } from "@asym/lib/hooks";
import { AccountMenu } from "@asym/ui/components/app-shell/account-menu";
import { MobileTabBar } from "@asym/ui/components/app-shell/mobile-tab-bar";
import { NavigationCommandPalette } from "@asym/ui/components/primitives/navigation-command-palette";
import { ButtonLink, buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@asym/ui/components/shadcn/tooltip";
import { cn } from "@asym/ui/lib/utils";
import {
  CreditCard,
  ExternalLink,
  Heart,
  LayoutDashboard,
  Newspaper,
  ReceiptText,
  Repeat,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useTransition } from "react";

const SECTIONS = [
  {
    label: "Overview",
    short: "Overview",
    href: "/donor-dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Updates",
    short: "Updates",
    href: "/donor-dashboard/feed",
    icon: Newspaper,
  },
  {
    label: "Giving history",
    short: "Giving",
    href: "/donor-dashboard/history",
    icon: ReceiptText,
  },
  {
    label: "Recurring gifts",
    short: "Recurring",
    href: "/donor-dashboard/pledges",
    icon: Repeat,
  },
  {
    label: "Payment methods",
    short: "Payments",
    href: "/donor-dashboard/wallet",
    icon: CreditCard,
  },
] as const;

const SETTINGS_HREF = "/donor-dashboard/settings";

function isSectionActive(pathname: string, href: string) {
  return href === "/donor-dashboard"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The current-page bar under a header destination: the same 2px rule the
 * section tabs use, drawn at the header's bottom edge.
 */
function currentBar(active: boolean) {
  return cn(
    "after:absolute after:inset-x-1 after:bottom-0 after:h-0.5 after:rounded-full",
    active ? "after:bg-foreground" : "after:bg-transparent",
  );
}

/**
 * The donor portal's navigation: brand, sections, Give, Settings and the
 * account menu. On phones the sections move to a bottom tab bar.
 */
export function DonorPortalHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, user } = useAuth();
  // The donor record's name and photo, the same ones the pages use.
  const donor = useDonorPortalSnapshot().data?.profile;
  const [signingOut, startSigningOut] = useTransition();
  const signOutInFlight = useRef(false);

  const email = donor?.email ?? profile?.email ?? user?.email ?? "";
  const name =
    donor?.displayName ||
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    email ||
    "Your account";
  const avatarUrl = donor ? donor.avatarUrl : profile?.avatar_url;
  const settingsActive = isSectionActive(pathname, SETTINGS_HREF);

  const signOut = () => {
    if (signOutInFlight.current) return;
    signOutInFlight.current = true;
    startSigningOut(async () => {
      await signOutClientSession().finally(() => {
        signOutInFlight.current = false;
      });
    });
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="container-responsive flex h-16 items-center gap-6">
          <Link
            href="/donor-dashboard"
            className="flex shrink-0 items-center gap-2"
            aria-label={`${siteConfig.name} donor portal`}
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              {siteConfig.shortName}
            </span>
            {/* Tablets need the room for the tabs; the mark keeps the link named. */}
            <span className="hidden text-base font-semibold tracking-tight text-foreground sm:inline md:hidden xl:inline">
              {siteConfig.name}
            </span>
          </Link>

          <nav
            aria-label="Donor workspace"
            className="hidden h-full items-stretch gap-1 md:flex"
          >
            {SECTIONS.map((section) => {
              const active = isSectionActive(pathname, section.href);
              return (
                <Link
                  key={section.href}
                  href={section.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative inline-flex items-center whitespace-nowrap px-3 text-sm font-medium transition-colors",
                    "after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full",
                    active
                      ? "text-foreground after:bg-foreground"
                      : "text-muted-foreground hover:text-foreground after:bg-transparent",
                  )}
                >
                  {/* Five two-word tabs don't fit a tablet, so below xl they use the
                      phone bar's short names. Only the visible one is read. */}
                  {section.short === section.label ? (
                    section.label
                  ) : (
                    <>
                      <span className="xl:hidden">{section.short}</span>
                      <span className="hidden xl:inline">{section.label}</span>
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2 self-stretch">
            <NavigationCommandPalette
              title="Donor navigation"
              triggerLabel="Search donor pages"
              items={[...SECTIONS, { label: "Settings", href: SETTINGS_HREF }]}
              onNavigate={(href) => router.push(href)}
            />
            <Link href="/workers" className={buttonVariants({ size: "sm" })}>
              <Heart aria-hidden data-icon="inline-start" />
              Give
            </Link>
            <span
              className={cn(
                "relative flex items-center self-stretch",
                currentBar(settingsActive),
              )}
            >
              <Tooltip>
                <TooltipTrigger
                  render={
                    <ButtonLink
                      variant={settingsActive ? "secondary" : "ghost"}
                      size="icon"
                      aria-label="Settings"
                      aria-current={settingsActive ? "page" : undefined}
                      render={<Link href={SETTINGS_HREF} />}
                    >
                      <Settings aria-hidden />
                    </ButtonLink>
                  }
                />
                <TooltipContent side="bottom">Settings</TooltipContent>
              </Tooltip>
            </span>
            <AccountMenu
              name={name}
              detail={email || undefined}
              avatarUrl={avatarUrl}
              onSignOut={signOut}
              signingOut={signingOut}
              links={[
                {
                  label: `Visit ${siteConfig.name}`,
                  href: "/",
                  icon: ExternalLink,
                },
              ]}
            />
          </div>
        </div>
        <span role="status" className="sr-only">
          {signingOut ? "Signing out…" : ""}
        </span>
      </header>

      <MobileTabBar
        label="Donor workspace"
        isActive={(href) => isSectionActive(pathname, href)}
        items={SECTIONS.map((section) => ({
          label: section.short,
          href: section.href,
          icon: section.icon,
        }))}
      />
    </>
  );
}
