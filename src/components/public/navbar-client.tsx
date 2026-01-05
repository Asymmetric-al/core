'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavLink {
  label: string;
  href: string;
}

interface NavbarClientProps {
  navLinks: readonly NavLink[];
  ctaLabel: string;
  ctaHref: string;
  siteName: string;
  shortName: string;
}

const HERO_PAGES = ['/', '/about', '/workers', '/faq', '/financials', '/ways-to-give'];

export function NavbarClient({ navLinks, ctaLabel, ctaHref, siteName, shortName }: NavbarClientProps) {
  const pathname = usePathname();
  const isHeroPage = HERO_PAGES.includes(pathname);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!isHeroPage) {
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHeroPage]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const displayName = siteName.toUpperCase();
  const showScrolledStyles = !isHeroPage || isScrolled;

  return (
    <header>
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:bg-white focus:text-slate-900 focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
      >
        Skip to main content
      </a>
      <nav 
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-300",
          showScrolledStyles 
            ? "bg-white/95 backdrop-blur-md border-b border-slate-200 py-2 sm:py-3" 
            : "bg-transparent py-4 sm:py-6"
        )}
        aria-label="Main navigation"
      >
        <div className="container-responsive flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group relative z-50">
            <div 
              className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-all",
                showScrolledStyles ? "bg-slate-900 text-white" : "bg-white text-slate-900"
              )}
            >
              {shortName}
            </div>
            <span 
              className={cn(
                "font-bold text-lg tracking-tight transition-colors",
                showScrolledStyles || isMobileMenuOpen ? "text-slate-900" : "text-white"
              )}
            >
              {displayName.slice(0, 4)}<span className="font-light opacity-60">{displayName.slice(4)}</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "text-sm font-semibold tracking-tight hover:opacity-70 transition-opacity touch-target flex items-center",
                  showScrolledStyles ? "text-slate-600 hover:text-slate-900" : "text-white/90"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Button 
              asChild 
              className={cn(
                "rounded-full px-5 lg:px-6 font-bold uppercase tracking-widest text-[10px] h-10 shadow-lg transition-all",
                showScrolledStyles 
                  ? "bg-slate-900 text-white hover:bg-slate-800" 
                  : "bg-white text-slate-900 hover:bg-slate-100"
              )}
            >
              <Link href={ctaHref}>{ctaLabel}</Link>
            </Button>
          </div>

          <button 
            type="button"
            className={cn(
              "md:hidden p-2 touch-target flex items-center justify-center relative z-50 -mr-2",
              showScrolledStyles || isMobileMenuOpen ? "text-slate-900" : "text-white"
            )}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <div 
          id="mobile-menu"
          className={cn(
            "md:hidden fixed inset-0 bg-white z-40 transition-all duration-300 ease-out",
            isMobileMenuOpen 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 -translate-y-full pointer-events-none"
          )}
          aria-hidden={!isMobileMenuOpen}
        >
          <div className="container-responsive pt-20 pb-8 flex flex-col h-full">
            <div className="flex flex-col gap-2 flex-1" role="menu">
              {navLinks.map((link, index) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "text-xl font-bold text-slate-900 py-4 border-b border-slate-100 touch-target flex items-center",
                    "transition-all duration-300",
                    isMobileMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4",
                    index === 0 && "nav-delay-1",
                    index === 1 && "nav-delay-2",
                    index === 2 && "nav-delay-3",
                    index === 3 && "nav-delay-4"
                  )}
                  role="menuitem"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            
            <div className="pt-6 safe-area-bottom">
              <Button 
                asChild 
                className="w-full h-14 rounded-xl bg-slate-900 text-white font-bold uppercase tracking-widest text-xs shadow-lg hover:bg-slate-800"
              >
                <Link href={ctaHref} onClick={() => setIsMobileMenuOpen(false)}>
                  {ctaLabel}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
