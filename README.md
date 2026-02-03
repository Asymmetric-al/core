# Asymmetric.al - Kingdom Impact Platform

A high-performance, enterprise-grade Next.js 16.1 application for mission-focused organizations. Built for effortless impact with a sophisticated Zinc color and Shadcn/UI Maia theme.

## Quickstart

```bash
./scripts/setup
# first run creates .env.local with placeholders
# fill these required values, then re-run ./scripts/setup:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
bun run dev
./scripts/verify
```

**Required:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
**Optional:** All other entries in `.env.example` (Stripe, demo accounts, Unlayer, etc.)

### Windows

Windows PowerShell 5.1:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup.ps1
```

PowerShell 7+:

```powershell
pwsh -File .\scripts\setup.ps1
```

First run creates `.env.local`. Fill these required values, then re-run the setup:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Skip dependency install if you already ran it:

```powershell
pwsh -File .\scripts\setup.ps1 -SkipInstall
```

#### PowerShell script checks (optional)

Install and run PSScriptAnalyzer locally (not required):

```powershell
Install-Module PSScriptAnalyzer -Scope CurrentUser
Invoke-ScriptAnalyzer -Path .\scripts\setup.ps1, .\scripts\lib\*.ps1
```

## Architecture & Tech Stack

- **Framework**: Next.js 16.1Densitynsitynsity (App Router, Turbopack) - _Optimized for Performance_
- **UI System**: Tailwind CSS 4 + shadcn/ui (Maia Theme) + Radix UI + Base UI
- **Theme**: Light Zinc Aesthetic (Zinc/Zinc), Shadcn/UI Maia Theme
- **Database**: Supabase (PostgreSQL) + Prisma
- **Authentication**: Supabase Auth (Unified across platforms)
- **Payments**: Stripe (Advanced integration)
- **State Management**: React 19 + TanStack Query v5
- **Animations**: Motion + Tailwind Motion

## UX/UI Standards (Shadcn/UI December 2025)

The platform follows a standardized **Zinc Light** theme, optimized for both desktop and mobile viewports with a seamless, responsive transition.

### Typography

- **Primary**: Inter (`tracking-tight`)
- **Mono**: Geist Mono
- **Headings**: Refined tracking and bold weight for clarity

### Design Tokens

- **Padding**: Standardized `px-4 py-6 sm:px-6` for main content areas.
- **Borders**: Use maia theme tokens, not hard coded zinc. Default to `border-border` or `border-border/60`. Keep rounding driven by the Maia radius token `--radius`.
- **Motion**: Staggered reveals and smooth transitions using `MotionPreset`.
- **Responsive**: Mobile-first navigation with robust drawers (Sheet) for sidebar access on smaller screens.

### Chart Standards

- **Aesthetic**: Data-dense, high-contrast using Maia `oklch` theme tokens. Use `--chart-1` through `--chart-5` for series colors.
- **Bar Charts**:
  - **Radius**: Uniform corner radius of `[4, 4, 0, 0]` on the top segment of stacked bars or all segments of non-stacked bars. Avoid fully rounded domed tops.
  - **Density**: Use `maxBarSize={52}` for bold, wide bars that scale responsibly.
  - **Axes**: Ensure Y-Axis labels have sufficient width (min `40px`) and margin (`tickMargin={8}`) to prevent numerical cutoff.
  - **Labels**: Use `month` only for X-Axis time series (e.g., "Nov", "Dec") to maintain high density without clutter.

## Multi-Tenant Architecture & Routing

This platform is architected for a multi-tenant environment, allowing a single deployment to serve multiple organizations with isolated data and customized subdomains.

### Production Routing Model

In a live production environment, the platform uses dynamic routing based on host headers (subdomains):

| User Role                      | Production URL               | Routing Logic                                                             |
| :----------------------------- | :--------------------------- | :------------------------------------------------------------------------ |
| **Public Site**                | `tenanturl.org/`             | Root application serving public content and giving pages.                 |
| **Organization Admin**         | `tenanturl.org/admin`        | Administrative interface for the organization (Mission Control).          |
| **Missionaries/Field Workers** | `my.tenanturl.org`           | Dedicated subdomain for field workers to manage their support and donors. |
| **Donors/Partners**            | `tenanturl.org/givingportal` | Portal for donors to manage their contributions and pledges.              |

### Demo Site Accessibility

For this demonstration and development environment, we have implemented aliases to allow easy access to all modules from a single domain:

- **Mission Control (Admin)**: Accessible via [/admin](/admin) (mapped to `/mc`)
- **Missionary Dashboard**: Accessible via [/my](/my) (mapped to `/`)
- **Donor Portal**: Accessible via [/dashboard](/dashboard) (mapped to `/donor-dashboard`)

### Implementation Details

- **Routing**: All routing logic, including demo aliases and production subdomains, is centralized in `src/proxy.ts` (Next.js 16 convention).
- **Proxy/Middleware**: The `src/proxy.ts` file uses the `updateSession` utility from `src/lib/supabase/proxy.ts` to manage authentication, session updates, and internal rewrites.
- **Conceptualization**: This architecture demonstrates how host-based routing isolates tenant context in production while providing path-based aliases for the demo environment.

## Project Modules

### Mission Control (Admin Dashboard)

The administrative headquarters for organization leaders. Manage CRM, Contributions, Member Care, and Mobilization with advanced reporting and automation tools.

- Route: `/mc`

### Missionary Dashboard

Empowering field missionaries with donor engagement tools, task management, and impact feeds.

- **My Feed/Ministry Updates**: A high-fidelity social engagement platform designed for missionaries to share their journey directly with their support base.
  - **Functionality**: Supports rich text (HTML) storytelling, multi-media carousels for multiple photos, and real-time interaction (Likes, Prayers, Comments).
  - **Premium Style**: Features a high-end "Maia" aesthetic with animated micro-interactions. Clicking a reaction triggers a delightful burst of floating emoji particles (❤️, 🙏, 🔥) and visceral pulsing effects.
  - **Workflow**: Missionaries can save drafts, manage visibility (Public vs Partners Only), and handle follower requests with manual or automated approval levels.
  - **Media Management**: Integrated media toolbar allows for quick image uploads and carousel creation to make updates visually engaging.
- Route: `/`

### Donor Portal

A seamless experience for kingdom partners to manage their giving and follow mission progress.

- **Personalized Impact Feed**: A unified, high-fidelity view of updates from all missionaries the donor supports.
- **The Connection Concept**: The platform creates a direct link between generosity and real-world impact.
  - **Automatic Integration**: When a donor makes a contribution to a missionary or clicks "Follow" on their profile, that missionary's feed is automatically integrated into the donor's personalized dashboard.
  - **Real-Time Updates**: Donors receive instant access to stories, prayer requests, and progress reports, allowing them to see exactly how their partnership is making a difference.
  - **Two-Way Interaction**: Donors can respond with reactions and comments, fostering a genuine relationship between the field and the support base.
- Route: `/donor-portal`

## Development

This project is optimized for both local development and the **Example Cloud (example.com)** environment.

### Package Manager

This project uses **bun** (v1.3+). Do not use npm/yarn/pnpm.

- **Startup Command**: `bun run dev`

Common commands:

- `bun run format` (fix), `bun run format:check` (verify), `bun run lint`, and `bun run typecheck`
- `bun run test:e2e`

### Git Hooks Setup

Pre-commit hooks auto-run ESLint + Prettier. If you get "command not found" errors:

**macOS/Linux:**

```bash
mkdir -p ~/.config/husky && echo 'export PATH="/usr/local/bin:$PATH"' > ~/.config/husky/init.sh
```

**Windows:**

```bash
mkdir -p ~/.config/husky && echo 'export PATH="/c/Program Files/nodejs:$PATH"' > ~/.config/husky/init.sh
```

**Using nvm:** Replace with `export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"`

One-time setup per machine.

### Turborepo (Task Orchestration + Cache)

Use Turbo for consistent task execution (and caching where applicable):

- Local dev: `bunx turbo run dev`
- Cached checks: `bunx turbo run lint typecheck build`
- Formatting: `bun run format` (fix) / `bun run format:check` (verify)

Remote caching (Vercel Remote Cache) is enabled for internal PRs and `main` branch CI only. Fork PRs are not supported.

### Key Dependencies

| Package               | Version | Notes                                      |
| --------------------- | ------- | ------------------------------------------ |
| Next.js               | 16.1.1  | App Router + Turbopack                     |
| React                 | 19.2.3  | Concurrent features                        |
| TypeScript            | 5.9.3   | Strict mode                                |
| motion                | 12.x    | Animation library (formerly framer-motion) |
| @tanstack/react-query | 5.x     | Server state management                    |
| @supabase/ssr         | 0.8.x   | Server-side Supabase client                |
| @sentry/nextjs        | 10.x    | Error monitoring                           |

### Verification Steps

```bash
# Full verification suite
bun run format
bun run format:check
bunx turbo run typecheck lint build

# Check for outdated packages
bun outdated
```

## Key Conventions

1. **RSC First**: Keep components as React Server Components unless interactivity is required.
2. **Next.js 16.1 Compliance**: Always `await` dynamic `params` and `searchParams` in routes and layouts.
3. **Zinc and Shadcn/ui Maia Aesthetic**: Use `zinc-900` for primary actions and `zinc-500` for secondary text.
4. **Responsive Integrity**: Test all UI changes on both 375px (Mobile) and 1440px (Desktop) viewports.

---

## App-Connected Development

To run this project locally against the hosted Supabase project, you only need the public URL + anon key.

Follow the Quickstart above, and set these required values in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### How to request access

Ask a maintainer for access to the shared dev Supabase project and request the project URL + anon key. Do not request service-role keys or database credentials.

### Demo login (optional)

The demo login flow uses `/api/auth/demo-account` with the public anon client and pre-seeded demo users.
Set `DEMO_ADMIN_EMAIL`, `DEMO_MISSIONARY_EMAIL`, `DEMO_DONOR_EMAIL`, and `DEMO_PASSWORD` in `.env.local` to enable the demo buttons.

---

Built with ❤️ for the Kingdom.
