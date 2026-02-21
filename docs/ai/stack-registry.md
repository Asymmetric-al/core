# Stack Registry (AI)

This is the canonical list of languages, frameworks, SDKs, and infrastructure used in this repo.
Agents MUST use this to build better Nia query preambles and to pick the right docs/rules/skills.

## Core

- Next.js (App Router)
- React
- TypeScript (default language)
- Node.js (runtime target)
- Bun (preferred package manager/runtime)
- PostgreSQL (Supabase Postgres)

Nia keywords:

- Next.js, App Router, server actions, route handler
- React, hooks, components
- TypeScript, tsconfig
- Node.js
- Bun, bun.lock
- Postgres, SQL, Supabase

## Monorepo and Tooling

- Turborepo
- ESLint, Prettier

Nia keywords:

- turbo.json, pipelines, cache
- eslint, prettier

## UI and Frontend Standards

- Tailwind CSS v4
- shadcn/ui (Radix UI primitives)
- Lucide icons
- MAIA theme, Zinc palette
- Fonts: Inter, Syne, Geist Mono
- next-themes (theme switching)

Nia keywords:

- tailwind, className, cn, tw
- shadcn, components/ui, radix
- lucide-react
- MAIA, Zinc, theme, next-themes
- Inter, Syne, Geist Mono, fonts

## Animation and Charts

- motion (motion/react)
- Recharts

Nia keywords:

- motion, animate, variants
- recharts, chart, tooltip

## Client Data, Tables, and Forms

- TanStack Query
- TanStack Table
- TanStack DB
- TanStack Forms
- React Hook Form
- Zod

Nia keywords:

- useQuery, queryKey, invalidateQueries
- columnDef, row model
- tanstack db
- form, schema, validation
- react-hook-form, zod

## Auth and Data Platform

- Supabase Postgres
- Supabase Auth
- Supabase Storage
- Supabase Realtime
- Row Level Security (RLS)

Nia keywords:

- supabase auth, session, jwt
- RLS, policies
- storage, bucket
- realtime, channel

## Payments

- Stripe
- Stripe.js + React Stripe.js (Elements)
- Stripe webhooks

Nia keywords:

- stripe, payment intent, subscription
- elements, stripe-js, @stripe/react-stripe-js
- webhook, signature, events

## Email, Templates, and PDFs

- Unlayer (react-email-editor)
- SendGrid (mail + event webhooks)
- Shared template source for email + PDF rendering pipeline

Nia keywords:

- unlayer, email editor, react-email-editor
- sendgrid, eventwebhook
- pdf render, template pipeline

## Observability

- Sentry

Nia keywords:

- sentry, tracing, instrumentation

## Engineering Standards

- GitHub Actions
- GitHub Projects
- Playwright (e2e)
- Vitest (unit)
- i18nexus (translations)
- Lighthouse CI

Nia keywords:

- actions, workflows
- playwright
- vitest
- i18nexus, translations
- lhci, lighthouse

## Planned or Referenced (not yet integrated)

These items appear in roadmap/docs/UI copy but are not present in code dependencies today.
Use these tags only when a task explicitly targets integration work.

- Payload CMS
- @payloadcms/db-postgres (Drizzle-based)
- Drizzle ORM
- Twenty CRM (system of record)
- Svix (external webhooks)
- Inngest (durable jobs/workflows)
- Zapier (integrations)
- Chatwoot CE
- Documenso CE

Nia keywords:

- payload, collections, globals
- drizzle, migrations
- twenty, crm
- svix, webhook delivery
- inngest, steps, retries, scheduling
- zapier
- chatwoot
- documenso

## "When user mentions X, include these stack tags"

- "auth/login/session" -> Supabase Auth, RLS, Next.js
- "db/schema/migration" -> Postgres, Supabase
- "dashboard/table" -> TanStack Table, Query, Tailwind/shadcn
- "payment/checkout/webhook" -> Stripe
- "email/template/pdf" -> Unlayer, SendGrid
- "charts/visualization" -> Recharts
- "motion/animation" -> motion

## "Planned" tags (only for explicit integration work)

- "jobs/workflows/retries" -> Inngest
- "external webhooks" -> Svix
- "cms/content" -> Payload
- "crm/sync" -> Twenty
- "support/chat" -> Chatwoot
- "signing/docs" -> Documenso

## Source

Derived from the current codebase and roadmap notes. Keep in sync when the stack changes.
