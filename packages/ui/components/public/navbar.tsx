"use client";
"use memo";

import { siteConfig } from "@asym/config/site-client";
import { Button } from "@asym/ui/components/shadcn/button";
import dynamic from "next/dynamic";
import Link from "next/link";

const navLinks = siteConfig.nav.main;

function NavbarLogo({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const isDark = variant === "dark";
  return (
    <Link className="group relative z-50 flex items-center gap-2" href="/">
      <div
        className={`h-8 w-8 ${isDark ? "bg-slate-900 text-white" : "bg-white text-slate-900"} flex items-center justify-center rounded-lg font-bold text-sm shadow-sm transition-transform group-hover:scale-105`}
      >
        {siteConfig.shortName}
      </div>
      <span
        className={`font-bold text-lg tracking-tight ${isDark ? "text-slate-900" : "text-white"}`}
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
    <div className="hidden items-center gap-6 md:flex lg:gap-8">
      {navLinks.map((link) => (
        <Link
          className={`touch-target flex items-center font-semibold text-sm tracking-tight transition-opacity hover:opacity-70 ${isScrolled ? "text-slate-600" : "text-white/90"}`}
          href={link.href}
          key={link.href}
        >
          {link.label}
        </Link>
      ))}
      <Button
        asChild
        className={`h-10 rounded-full px-5 font-bold text-[10px] uppercase tracking-widest shadow-lg lg:px-6 ${isScrolled ? "bg-slate-900 text-white" : "bg-white text-slate-900 hover:bg-slate-100"}`}
      >
        <Link href={siteConfig.nav.cta.href}>{siteConfig.nav.cta.label}</Link>
      </Button>
    </div>
  );
}

function NavbarSkeleton() {
  return (
    <nav className="fixed top-0 z-50 w-full bg-transparent py-4 sm:py-6">
      <div className="container-responsive flex items-center justify-between">
        <NavbarLogo variant="light" />
        <div className="hidden items-center gap-6 md:flex lg:gap-8">
          {navLinks.map((link) => (
            <Link
              className="font-semibold text-sm text-white/90 tracking-tight transition-opacity hover:opacity-70"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
          <Button
            asChild
            className="h-10 rounded-full bg-white px-5 font-bold text-[10px] text-slate-900 uppercase tracking-widest shadow-lg hover:bg-slate-100 lg:px-6"
          >
            <Link href={siteConfig.nav.cta.href}>
              {siteConfig.nav.cta.label}
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}

const NavbarClient = dynamic(
  () =>
    import("./navbar-client").then((mod) => ({ default: mod.NavbarClient })),
  {
    ssr: false,
    loading: () => <NavbarSkeleton />,
  }
);

export function Navbar() {
  return (
    <NavbarClient
      ctaHref={siteConfig.nav.cta.href}
      ctaLabel={siteConfig.nav.cta.label}
      navLinks={navLinks}
      shortName={siteConfig.shortName}
      siteName={siteConfig.name}
    />
  );
}

export { NavbarLogo, DesktopNav };
