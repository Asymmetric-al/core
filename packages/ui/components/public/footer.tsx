import React from "react";
import Link from "next/link";

interface FooterLink {
  label: string;
  href: string;
  badge?: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const footerSections: FooterSection[] = [
  {
    title: "Organization",
    links: [
      { label: "Our Mission", href: "/about" },
      { label: "Where We Work", href: "/where-we-work" },
      { label: "Financial Integrity", href: "/financials" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/about#contact" },
    ],
  },
  {
    title: "Giving",
    links: [
      { label: "Missionary Directory", href: "/workers" },
      { label: "Ways to Give", href: "/ways-to-give" },
      { label: "Make a Donation", href: "/checkout" },
      { label: "Donor Portal", href: "/donor-dashboard" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "Mission Control", href: "/mc", badge: "Admin" },
      {
        label: "Missionary Dashboard",
        href: "/missionary-dashboard",
        badge: "Field",
      },
      { label: "Donor Portal", href: "/donor-dashboard", badge: "Partner" },
    ],
  },
];

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

const socialLinks = [
  { Icon: FacebookIcon, href: "#", label: "Facebook" },
  { Icon: InstagramIcon, href: "#", label: "Instagram" },
  { Icon: TwitterIcon, href: "#", label: "Twitter" },
  { Icon: LinkedinIcon, href: "#", label: "LinkedIn" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Cookie Policy", href: "/cookies" },
];

export function Footer() {
  return (
    <footer className="bg-slate-950 text-white py-12 sm:py-16 lg:py-24 border-t border-white/5">
      <div className="container-responsive">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 lg:gap-12 mb-12 lg:mb-16">
          <div className="sm:col-span-2 lg:col-span-1 space-y-4 sm:space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-white text-slate-950 rounded-lg flex items-center justify-center font-bold text-sm">
                GH
              </div>
              <span className="font-bold text-lg tracking-tight">
                GIVE<span className="font-light opacity-60">HOPE</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Bridging the gap between compassion and action. Supporting
              verified field partners in the world&apos;s most fractured
              regions.
            </p>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-4 sm:mb-6 lg:mb-8 text-white/40">
                {section.title}
              </h4>
              <ul className="space-y-3 sm:space-y-4 text-sm font-medium text-slate-300">
                {section.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="hover:text-white transition-colors touch-target inline-flex items-center gap-2"
                    >
                      {link.label}
                      {link.badge && (
                        <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/50">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-4 sm:mb-6 lg:mb-8 text-white/40">
              Connect
            </h4>
            <div className="flex gap-3 sm:gap-4 mb-6 sm:mb-8">
              {socialLinks.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-white/20 transition-all touch-target"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              © 2025 GiveHope. <br className="sm:hidden" />
              Registered 501(c)(3) nonprofit.
            </p>
          </div>
        </div>

        <div className="pt-8 sm:pt-12 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <a
            href="https://asymmetric.al/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors touch-target"
          >
            Made with{" "}
            <HeartIcon className="h-3 w-3 text-rose-500 fill-current" /> by
            Asymmetric.al
          </a>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {legalLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="hover:text-white transition-colors touch-target"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
