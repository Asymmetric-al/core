export const DEFAULT_SITE_URL = "https://givehope.org";

export const siteConfigShared = {
  name: "GiveHope",
  shortName: "GH",
  tagline: "Direct Aid to Frontline Missionaries",
  description:
    "Support verified field missionaries with 100% direct-to-field giving. Transparent, efficient, and impactful humanitarian aid platform.",
  ogImage: "/og-image.png",
  logo: "/logo.png",
  favicon: "/favicon.ico",

  organization: {
    type: "NGO" as const,
    foundingDate: "2019",
    nonprofitStatus: "501c3",
    email: "support@givehope.org",
    phone: undefined as string | undefined,
    address: {
      country: "US",
      region: undefined as string | undefined,
      city: undefined as string | undefined,
      street: undefined as string | undefined,
      postalCode: undefined as string | undefined,
    },
  },

  social: {
    twitter: "@givehope",
    twitterUrl: "https://twitter.com/givehope",
    facebook: "https://facebook.com/givehope",
    instagram: "https://instagram.com/givehope",
    linkedin: "https://linkedin.com/company/givehope",
    youtube: undefined as string | undefined,
  },

  keywords: [
    "missionary support",
    "charitable giving",
    "humanitarian aid",
    "direct donations",
    "nonprofit",
    "field workers",
    "501c3",
    "tax deductible donations",
    "christian missions",
    "global outreach",
  ],

  locale: "en_US",
  language: "en",
  category: "nonprofit",

  routes: {
    public: {
      home: "/",
      about: "/about",
      workers: "/workers",
      faq: "/faq",
      financials: "/financials",
      waysToGive: "/ways-to-give",
      checkout: "/checkout",
      privacy: "/privacy",
      terms: "/terms",
      cookies: "/cookies",
    },
    auth: {
      login: "/",
      register: "/",
    },
    dashboards: {
      admin: "/",
      missionary: "/",
      donor: "/donor-dashboard",
    },
  },

  nav: {
    main: [
      { label: "Mission", href: "/about" },
      { label: "Deployments", href: "/workers" },
      { label: "Transparency", href: "/financials" },
      { label: "Ways to Give", href: "/ways-to-give" },
    ],
    cta: { label: "Give Now", href: "/workers" },
  },

  footer: {
    sections: [
      {
        title: "Organization",
        links: [
          { label: "Our Mission", href: "/about" },
          { label: "Financial Integrity", href: "/financials" },
          { label: "FAQ", href: "/faq" },
          { label: "Contact", href: "#" },
        ],
      },
      {
        title: "Giving",
        links: [
          { label: "Missionary Directory", href: "/workers" },
          { label: "Ways to Give", href: "/ways-to-give" },
          { label: "Make a Donation", href: "/checkout" },
          { label: "Donor Portal", href: "#" },
        ],
      },
      {
        title: "Platform",
        links: [
          { label: "Mission Control", href: "/", badge: "Admin" },
          {
            label: "Missionary Dashboard",
            href: "/",
            badge: "Field",
          },
          { label: "Donor Portal", href: "/donor-dashboard", badge: "Partner" },
        ],
      },
    ],
    social: [
      { platform: "facebook", href: "#" },
      { platform: "instagram", href: "#" },
      { platform: "twitter", href: "#" },
      { platform: "linkedin", href: "#" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
    copyright: "© 2025 GiveHope. Registered 501(c)(3) nonprofit.",
    poweredBy: {
      name: "Asymmetric.al",
      url: "https://asymmetric.al/",
    },
  },
} as const;
