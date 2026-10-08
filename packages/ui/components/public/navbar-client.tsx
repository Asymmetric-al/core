"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

import { cn } from "../../lib/utils";
import { Button, buttonVariants } from "../shadcn/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../shadcn/sheet";

interface NavLink {
  label: string;
  href: string;
}

/**
 * `hero` routes open on full-bleed artwork, so the bar starts transparent and
 * solidifies on scroll. `solid` routes are opaque from first paint.
 *
 * This is a static prop rather than a `usePathname()` lookup on purpose. Under
 * Cache Components a URL read in shared layout chrome is request data, which
 * blocks prerendering for every route below it that has a dynamic param — and a
 * `<Suspense>` fallback here would be shared by all those routes, baking one
 * navbar variant into each of them. Callers pick the variant instead, via
 * sibling route groups.
 */
export type NavbarVariant = "hero" | "solid";

interface NavbarClientProps {
  navLinks: readonly NavLink[];
  ctaLabel: string;
  ctaHref: string;
  siteName: string;
  shortName: string;
  variant: NavbarVariant;
}

export function NavbarClient({
  navLinks,
  ctaLabel,
  ctaHref,
  siteName,
  shortName,
  variant,
}: NavbarClientProps) {
  const isHeroPage = variant === "hero";

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!isHeroPage) {
      // setIsScrolled(true); // Redundant and causes lint error
      return;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHeroPage]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setIsMobileMenuOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  const displayName = siteName.toUpperCase();
  const showScrolledStyles = !isHeroPage || isScrolled;

  return (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <header>
        {/* The target is a <main id="main-content"> in every live Navbar
          consumer: public (hero)/(solid) layouts and the donor dashboard. */}
        {/* react-doctor-disable-next-line react-doctor/anchor-target-exists */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-100 focus:top-4 focus:left-4 focus:bg-background focus:text-foreground focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Skip to main content
        </a>
        <nav
          className={cn(
            "fixed top-0 z-50 w-full transition-colors duration-[var(--duration-standard)] ease-[var(--ease-out-soft)]",
            showScrolledStyles
              ? "bg-background/95 backdrop-blur-md border-b border-border py-2 sm:py-3"
              : "bg-transparent py-4 sm:py-6",
          )}
          aria-label="Main navigation"
        >
          <div className="container-responsive flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 group relative z-50"
            >
              <div
                className={cn(
                  // Logo: gate hover-scale for hover devices only.
                  "size-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm transition-colors duration-[var(--duration-micro)] ease-[var(--ease-out-soft)] [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-105",
                  showScrolledStyles
                    ? "bg-primary text-primary-foreground"
                    : "bg-invert-foreground text-invert",
                )}
              >
                {shortName}
              </div>
              <span
                className={cn(
                  "font-bold text-lg tracking-tight transition-colors",
                  showScrolledStyles || isMobileMenuOpen
                    ? "text-foreground"
                    : "text-media-foreground",
                )}
              >
                {displayName.slice(0, 4)}
                <span className="font-light opacity-60">
                  {displayName.slice(4)}
                </span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-semibold tracking-tight hover:opacity-70 transition-opacity touch-target flex items-center",
                    showScrolledStyles
                      ? "text-muted-foreground hover:text-foreground"
                      : "text-media-foreground",
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={ctaHref}
                className={buttonVariants({
                  variant: showScrolledStyles ? "default" : "inverse",
                  size: "lg",
                })}
              >
                {ctaLabel}
              </Link>
            </div>

            <SheetTrigger
              render={
                <Button
                  variant={showScrolledStyles ? "ghost" : "ghost-inverse"}
                  size="icon-lg"
                >
                  <Menu aria-hidden="true" />
                </Button>
              }
              className="md:hidden"
              aria-label="Open menu"
            />
          </div>

          <SheetContent
            id="mobile-menu"
            side="left"
            className="w-full sm:max-w-none"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Main navigation</SheetTitle>
              <SheetDescription>
                Browse {siteName} and find ways to give.
              </SheetDescription>
            </SheetHeader>
            <div className="container-responsive pt-20 pb-8 flex flex-col h-full">
              <div className="flex flex-col gap-2 flex-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-xl font-bold text-foreground py-4 border-b border-border touch-target flex items-center focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="pt-6 safe-area-bottom">
                <Link
                  href={ctaHref}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" }),
                    "w-full",
                  )}
                >
                  {ctaLabel}
                </Link>
              </div>
            </div>
          </SheetContent>
        </nav>
      </header>
    </Sheet>
  );
}
