# Phase 4: Environment Variables Documentation

**Date:** 2026-01-23  
**Goal:** Document and organize environment variables per package/app

---

## 📊 Environment Variables by Package

### Core Infrastructure

#### `@asym/database`

**Required:**

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)

**Optional:**

- `NEXT_PUBLIC_MAIN_DOMAIN` - Main domain for multi-tenant routing

**Usage:** Supabase client initialization, database connections

---

#### `@asym/lib`

**Optional:**

- `NEXT_PUBLIC_CLOUDINARY_ENABLED` - Enable Cloudinary image uploads
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `NEXT_PUBLIC_CLOUDINARY_API_KEY` - Cloudinary API key (client-side)
- `CLOUDINARY_API_SECRET` - Cloudinary API secret (server-side only)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry DSN for error tracking
- `NODE_ENV` - Node environment (development/production)

**Usage:** Cloudinary uploads, Stripe payments, Sentry monitoring

---

#### `@asym/config`

**Optional:**

- `NEXT_PUBLIC_SITE_URL` - Full site URL (e.g., https://asymmetric.al)
- `NEXT_PUBLIC_BRAND_NAME` - Brand name (default: "GiveHope")
- `NEXT_PUBLIC_BRAND_LOGO_URL` - Brand logo URL
- `NEXT_PUBLIC_BRAND_PRIMARY_COLOR` - Primary brand color (hex)
- `NEXT_PUBLIC_BRAND_ACCENT_COLOR` - Accent brand color (hex)
- `NEXT_PUBLIC_EMAIL_FOOTER_TEXT` - Email footer text
- `NEXT_PUBLIC_PDF_FOOTER_TEXT` - PDF footer text
- `NEXT_PUBLIC_UNLAYER_PROJECT_ID` - Unlayer project ID
- `NEXT_PUBLIC_UNLAYER_WHITE_LABEL` - Unlayer white label mode
- `NEXT_PUBLIC_UNLAYER_ALLOWED_DOMAINS` - Unlayer allowed domains
- `GOOGLE_SITE_VERIFICATION` - Google Search Console verification
- `BING_SITE_VERIFICATION` - Bing Webmaster Tools verification
- `NODE_ENV` - Node environment

**Usage:** Site configuration, branding, SEO, email/PDF studio

---

#### `@asym/auth`

**Dependencies:** Inherits from `@asym/database`

- Uses Supabase env vars

---

#### `@asym/email`

**No direct env vars** - Uses SendGrid API key passed at runtime

---

#### `@asym/ui`

**No env vars** - Pure UI components

---

### Applications

#### All Apps (`admin`, `missionary`, `donor`)

**Required:**

- `NEXT_PUBLIC_SUPABASE_URL` - From `@asym/database`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - From `@asym/database`

**Optional:** All optional vars from packages they depend on

---

## 📁 File Structure

```
core/
├── .env.local              # Root env (shared by all apps in dev)
├── .env.example            # Template with all available vars
├── apps/
│   ├── admin/.env.local    # Admin-specific overrides (optional)
│   ├── missionary/.env.local # Missionary-specific overrides (optional)
│   └── donor/.env.local    # Donor-specific overrides (optional)
└── packages/               # Packages read from app env vars
```

---

## 🎯 Current Setup (Correct for Turborepo)

### Development

- **Root `.env.local`** contains all shared env vars
- Apps automatically inherit from root
- App-specific `.env.local` files can override if needed

### Production

- Each app deployed separately
- Each app has its own env vars configured in hosting platform
- No shared env file

**This is the correct Turborepo pattern!** ✅

---

## 📝 Environment Variable Categories

### 1. **Required (Core Functionality)**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. **Optional (Features)**

```bash
# Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Image Uploads
NEXT_PUBLIC_CLOUDINARY_ENABLED=true
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud
NEXT_PUBLIC_CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# Email Studio
NEXT_PUBLIC_UNLAYER_PROJECT_ID=your-project-id
NEXT_PUBLIC_UNLAYER_WHITE_LABEL=false
```

### 3. **Optional (Branding)**

```bash
NEXT_PUBLIC_BRAND_NAME=GiveHope
NEXT_PUBLIC_BRAND_PRIMARY_COLOR=#0f172a
NEXT_PUBLIC_BRAND_ACCENT_COLOR=#2563eb
```

### 4. **Optional (Observability)**

```bash
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

### 5. **Optional (SEO)**

```bash
GOOGLE_SITE_VERIFICATION=your-verification-code
BING_SITE_VERIFICATION=your-verification-code
```

---

## ✅ Phase 4 Status

**COMPLETE** - Environment variables documented by package and category.

---

## 🚀 Turborepo Migration Complete!

All 4 phases are now complete:

- ✅ **Phase 1:** Critical Fixes
- ✅ **Phase 2:** Dependency Refactor (with component migration)
- ✅ **Phase 3:** Build Optimization (JIT strategy confirmed)
- ✅ **Phase 4:** Environment Variables (documented)
