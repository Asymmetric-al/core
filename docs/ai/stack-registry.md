# Stack Registry (AI)

This is the canonical list of languages, frameworks, SDKs, and infrastructure used in this repo.
Agents MUST use this to build better Nia query preambles and to pick the right docs/rules/skills.

## Core

- Next.js (App Router)
- React
- TypeScript (default language); future TS 6/7 prep policy: `docs/guides/typescript-6-readiness.md`
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
- Base UI
- shadcn/ui (Base UI primitives, `base-maia` style)
- Lucide icons
- MAIA theme, Zinc palette
- Fonts: Inter, Syne, Geist Mono
- next-themes (theme switching)
- Tiptap 3 (`@tiptap/react`, StarterKit, extensions)

Nia keywords:

- tailwind, className, cn, tw
- Base UI, @base-ui/react, drawer, dialog, select, tooltip
- shadcn, components/shadcn, base-maia
- lucide-react
- MAIA, Zinc, theme, next-themes
- Inter, Syne, Geist Mono, fonts
- tiptap, useEditor, EditorContent, StarterKit, prosemirror

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
- @supabase-labs/tanstack-db
- TanStack Forms
- React Hook Form
- Zod

Nia keywords:

- useQuery, queryKey, invalidateQueries
- columnDef, row model
- tanstack db, @supabase-labs/tanstack-db
- supabaseCollectionOptions, queryOnce, collection registry, useLiveQuery
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

- React Email Editor (`@react-email/editor`) for Email Studio
- Legacy Unlayer (`react-email-editor`) for existing legacy templates and PDF Studio
- Resend (mail + webhooks)
- Provider-neutral email template storage and versions

Nia keywords:

- react_email, @react-email/editor, email_templates, email_template_versions
- legacy unlayer, react-email-editor, PDF Studio
- resend, webhook
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
- Twenty CRM (retired 2026-07-06 — ADR-0001; Asym Postgres owns all CRM
  truth; code dormant pending cleanup)
- Svix (external webhooks)
- Inngest (durable jobs/workflows)
- Zapier (integrations)
- Chatwoot CE
- Documenso CE

Nia keywords:

- payload, collections, globals
- drizzle, migrations
- crm (Twenty retired 2026-07-06 — ADR-0001)
- svix, webhook delivery
- inngest, steps, retries, scheduling
- zapier
- chatwoot
- documenso

Agent tooling note: official Inngest agent skills are vendored under
`docs/ai/skills/inngest-*` for integration planning and implementation work.
This does not move Inngest out of planned/referenced product status.

## "When user mentions X, include these stack tags"

- "auth/login/session" -> Supabase Auth, RLS, Next.js
- "db/schema/migration" -> Postgres, Supabase
- "dashboard/table" -> TanStack Table, Query, Tailwind/shadcn
- "payment/checkout/webhook" -> Stripe
- "email/template/pdf" -> React Email Editor, legacy Unlayer, Resend
- "charts/visualization" -> Recharts
- "motion/animation" -> motion
- "rich text/editor/tiptap" -> Tiptap, @tiptap/react, StarterKit

## "Planned" tags (only for explicit integration work)

- "jobs/workflows/retries" -> Inngest
- "external webhooks" -> Svix
- "cms/content" -> Payload
- "crm/sync" -> retired Twenty pipeline (ADR-0001); CRM work targets Asym
  Postgres via `packages/api/src/crm`
- "support/chat" -> Chatwoot
- "signing/docs" -> Documenso

## Source

Derived from the current codebase and roadmap notes. Keep in sync when the stack changes.
