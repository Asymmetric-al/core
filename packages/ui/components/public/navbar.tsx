"use client";
"use memo";

import { siteConfig } from "@asym/config/site-client";
import Link from "next/link";

import { NavbarClient, type NavbarVariant } from "./navbar-client";
import { buttonVariants } from "../shadcn/button";

const navLinks = siteConfig.nav.main;

function NavbarLogo({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const isDark = variant === "dark";
  return (
    <Link href="/" className="flex items-center gap-2 group relative z-50">
      <div
        className={`h-8 w-8 ${isDark ? "bg-primary text-primary-foreground" : "bg-invert-foreground text-invert"} rounded-lg flex items-center justify-center font-bold text-sm shadow-sm [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-105 transition-transform`}
      >
        {siteConfig.shortName}
      </div>
      <span
        className={`font-bold text-lg tracking-tight ${isDark ? "text-foreground" : "text-media-foreground"}`}
      >
        {siteConfig.name.toUpperCase().slice(0, 4)}
        <span className="font-light opacity-60">
          {siteConfig.name.toUpperCase().slice(4)}
        </span>
      </span>
    </Link>
  );
}

function DesktopNav({ isScrolled }: { isScrolled: boolean }) {
  return (
    <div className="hidden md:flex items-center gap-6 lg:gap-8">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`text-sm font-semibold tracking-tight hover:opacity-70 transition-opacity touch-target flex items-center ${isScrolled ? "text-muted-foreground" : "text-media-foreground"}`}
        >
          {link.label}
        </Link>
      ))}
      <Link
        href={siteConfig.nav.cta.href}
        className={buttonVariants({
          variant: isScrolled ? "default" : "inverse",
          size: "lg",
        })}
      >
        {siteConfig.nav.cta.label}
      </Link>
    </div>
  );
}

/**
 * Public site navbar. `variant` is required by design.
 *
 * @param variant - `"hero"` for full-bleed routes (transparent until scroll),
 *   `"solid"` for everything else. It is a static prop rather than a
 *   `usePathname()` lookup so shared chrome stays out of request data and the
 *   public routes keep prerendering.
 */
export function Navbar({ variant }: { variant: NavbarVariant }) {
  return (
    <NavbarClient
      navLinks={navLinks}
      ctaLabel={siteConfig.nav.cta.label}
      ctaHref={siteConfig.nav.cta.href}
      siteName={siteConfig.name}
      shortName={siteConfig.shortName}
      variant={variant}
    />
  );
}

export { NavbarLogo, DesktopNav };
export type { NavbarVariant } from "./navbar-client";
