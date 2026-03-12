"use client";
"use memo";

import { siteConfig } from "@asym/config/site";
import Link from "next/link";

import { NavbarClient } from "./navbar-client";
import { Button } from "../shadcn/button";

const navLinks = siteConfig.nav.main;

function NavbarLogo({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const isDark = variant === "dark";
  return (
    <Link href="/" className="flex items-center gap-2 group relative z-50">
      <div
        className={`h-8 w-8 ${isDark ? "bg-slate-900 text-white" : "bg-white text-slate-900"} rounded-lg flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform`}
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
    <div className="hidden md:flex items-center gap-6 lg:gap-8">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`text-sm font-semibold tracking-tight hover:opacity-70 transition-opacity touch-target flex items-center ${isScrolled ? "text-slate-600" : "text-white/90"}`}
        >
          {link.label}
        </Link>
      ))}
      <Button
        asChild
        className={`rounded-full px-5 lg:px-6 font-bold uppercase tracking-widest text-[10px] h-10 shadow-lg ${isScrolled ? "bg-slate-900 text-white" : "bg-white text-slate-900 hover:bg-slate-100"}`}
      >
        <Link href={siteConfig.nav.cta.href}>{siteConfig.nav.cta.label}</Link>
      </Button>
    </div>
  );
}

export function Navbar() {
  return (
    <NavbarClient
      navLinks={navLinks}
      ctaLabel={siteConfig.nav.cta.label}
      ctaHref={siteConfig.nav.cta.href}
      siteName={siteConfig.name}
      shortName={siteConfig.shortName}
    />
  );
}

export { NavbarLogo, DesktopNav };
