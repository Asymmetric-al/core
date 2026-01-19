# Branding & Customization

This Asymmetric.al codebase is fully white-labeled. The current "Give Hope" styling is a demo implementation for the test frontend.

## Quick Start: Swapping Branding

1. **Update `src/config/site.ts`** - Central source for brand name and config:

   ```ts
   export const brandConfig = {
     name: "Your Org Name", // Main brand name
     shortName: "YO", // 2-letter abbreviation for avatars
     tagline: "Your tagline",
     feed: {
       orgName: "Your Org Name",
       orgHandle: "@yourorg",
     },
   };
   ```

2. **Color Scheme** - Update Tailwind classes:
   - Primary brand: `bg-zinc-900`, `text-zinc-900`
   - Replace with your brand color (e.g., `bg-blue-600`)

## Branding Touchpoints

| Location                                       | What to Update                        |
| ---------------------------------------------- | ------------------------------------- |
| `src/config/site.ts`                           | `siteConfig.name`, `brandConfig.*`    |
| `src/components/brand-logo.tsx`                | Logo component, avatar styling        |
| `src/app/(admin)/mc/feed/org-updates/page.tsx` | Uses `brandConfig.name` in page title |
| `src/app/(admin)/mc/feed/page.tsx`             | Uses `BrandAvatar` for org posts      |
| `src/app/layout.tsx`                           | Root metadata                         |
| `src/components/app-sidebar.tsx`               | Sidebar logo rendering                |
| `src/components/public/footer.tsx`             | Public-facing footer                  |

## Components

### `BrandLogo` / `BrandAvatar`

Centralized brand display components in `src/components/brand-logo.tsx`:

- `BrandLogo` - Square logo for headers/compose areas
- `BrandAvatar` - Circular avatar for feed posts
- `BrandName` - Text-only brand name

### Usage

```tsx
import { BrandAvatar, BrandLogo, brandConfig } from '@/components/brand-logo'

// In feed posts
<BrandAvatar size="md" />

// In headers
<BrandLogo size="lg" variant="muted" />

// For text
<span>{brandConfig.name} Updates</span>
```

## Demo Brand

Current demo uses:

- **Name**: Give Hope
- **Short Name**: GH
- **Style**: High-contrast black/zinc palette

## Deployment Checklist

When deploying for a new tenant:

1. [ ] Update `src/config/site.ts` with tenant's brand info
2. [ ] Replace `shortName` in brandConfig (2 letters for avatars)
3. [ ] Update color classes if using different primary color
4. [ ] Replace any hardcoded "Give Hope" strings (search codebase)
5. [ ] Update favicon and OG image in `/public`
6. [ ] Test all feed pages for consistent branding
