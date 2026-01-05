# Tenant Migration & Branding Guide

This document outlines all configuration items that need to be updated when deploying this platform for a new tenant/organization.

## 1. Primary Configuration File

**File: `src/config/site.ts`**

This is the **single source of truth** for all tenant-specific branding. Update the following:

### Basic Branding
```typescript
name: "YourOrganization",           // Organization name
shortName: "YO",                     // 2-letter abbreviation for logo
tagline: "Your Organization Tagline", // Used in meta titles
description: "Full description...",   // Meta description
url: "https://yourorg.org",          // Production URL
```

### Organization Details
```typescript
organization: {
  type: "NGO",                       // or "NonProfit", "Charity", etc.
  foundingDate: "2020",              // Year founded
  nonprofitStatus: "501c3",          // Tax status
  email: "support@yourorg.org",      // Contact email
  phone: "+1-xxx-xxx-xxxx",          // Contact phone (optional)
  address: {
    country: "US",
    region: "CA",                    // State/Region
    city: "Los Angeles",
    street: "123 Main St",
    postalCode: "90001",
  },
}
```

### Social Media
```typescript
social: {
  twitter: "@yourorg",
  twitterUrl: "https://twitter.com/yourorg",
  facebook: "https://facebook.com/yourorg",
  instagram: "https://instagram.com/yourorg",
  linkedin: "https://linkedin.com/company/yourorg",
  youtube: "https://youtube.com/@yourorg",
}
```

### SEO Keywords
```typescript
keywords: [
  "your keyword 1",
  "your keyword 2",
  // Add relevant keywords for your organization
]
```

---

## 2. Environment Variables

**File: `.env.local` (or Vercel Dashboard)**

### Required Variables
```env
# Site URL (production domain)
NEXT_PUBLIC_SITE_URL=https://yourorg.org

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_url

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx

# SEO Verification (optional but recommended)
GOOGLE_SITE_VERIFICATION=your_google_verification_code
BING_SITE_VERIFICATION=your_bing_verification_code
```

---

## 3. Public Assets

**Directory: `public/`**

### Required Files to Replace
- `favicon.ico` - 32x32 favicon
- `icon.svg` - SVG favicon with your branding
- `logo.png` - 512x512 logo (used in JSON-LD)
- `apple-touch-icon.png` - 180x180 for iOS
- `icon-192.png` - 192x192 PWA icon
- `icon-512.png` - 512x512 PWA icon
- `icon-maskable-192.png` - 192x192 maskable PWA icon
- `icon-maskable-512.png` - 512x512 maskable PWA icon

### Web Manifest
**File: `public/manifest.webmanifest`**

Update all instances of organization name and description.

---

## 4. Dynamic OG Images

**Files:**
- `src/app/opengraph-image.tsx`
- `src/app/twitter-image.tsx`

These automatically use `siteConfig`, but you may want to customize the design/colors to match your brand.

---

## 5. Navigation & Footer

The navigation and footer content are defined in `src/config/site.ts`:

### Navigation Links
```typescript
nav: {
  main: [
    { label: "About Us", href: "/about" },
    { label: "Our Workers", href: "/workers" },
    // Customize navigation items
  ],
  cta: { label: "Donate", href: "/workers" },
}
```

### Footer Sections
```typescript
footer: {
  sections: [
    {
      title: "Organization",
      links: [
        { label: "Our Mission", href: "/about" },
        // Customize footer links
      ],
    },
  ],
  copyright: "© 2025 YourOrg. Registered 501(c)(3) nonprofit.",
}
```

---

## 6. Content Updates

### Home Page Sections
**File: `src/components/public/home-sections.tsx`**

- Update hero headline and subtext
- Replace Unsplash image URLs with organization-specific images
- Update statistics (deployed amount, partners count, jurisdictions)
- Update featured projects/deployments
- Update testimonials

### About Page
**File: `src/components/public/about-sections.tsx`**

- Update leadership team
- Update organization history/timeline
- Update mission statement

### FAQ Page
**File: `src/app/(public)/faq/page.tsx`**

- Update FAQ questions and answers for your organization

---

## 7. Database Schema

The following tables may need tenant-specific data:
- `users` - Admin and staff accounts
- `missionaries` / `workers` - Field worker profiles
- `donations` - Configure Stripe products/prices
- `org_settings` - Organization-wide settings

---

## 8. Routing Considerations

### Production Subdomains (Multi-tenant)
If using subdomains, update `src/proxy.ts`:
- `tenanturl.org/` - Public site
- `tenanturl.org/mc` - Mission Control (Admin)
- `my.tenanturl.org` - Missionary Dashboard
- `tenanturl.org/dashboard` - Donor Portal

---

## 9. SEO Checklist Before Launch

- [ ] Update all items in `src/config/site.ts`
- [ ] Replace all public assets (favicons, icons)
- [ ] Set `NEXT_PUBLIC_SITE_URL` to production domain
- [ ] Add Google Search Console verification
- [ ] Add Bing Webmaster Tools verification
- [ ] Submit sitemap to search engines
- [ ] Test OG images on social media debuggers
- [ ] Run Lighthouse audit (target: 90+ all categories)
- [ ] Test structured data with Google Rich Results Test
- [ ] Configure canonical URLs for all pages

---

## 10. Vercel Configuration

### Build Settings
- Build Command: `rm -rf .next && next build`
- Install Command: `bun install`
- Output Directory: `.next`

### Recommended Vercel Settings
- Enable Edge Functions for better performance
- Configure custom domains
- Set up preview deployments
- Enable Web Analytics
- Configure Speed Insights

---

## Quick Reference: Files to Modify

| File | Purpose |
|------|---------|
| `src/config/site.ts` | **Primary branding config** |
| `.env.local` | Environment variables |
| `public/` | Favicon, icons, manifest |
| `src/app/opengraph-image.tsx` | Social share image |
| `src/components/public/home-sections.tsx` | Homepage content |
| `src/components/public/navbar.tsx` | Navigation (uses siteConfig) |
| `src/components/public/footer.tsx` | Footer (uses siteConfig) |
| `public/manifest.webmanifest` | PWA configuration |
