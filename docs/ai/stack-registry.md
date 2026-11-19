# Stack Registry (AI)

Languages, frameworks, SDKs, and infrastructure used in this repo. Use it to pick
stack tags for Nia query preambles ([Nia guide](nia.md)) and the right
docs/rules/skills. Installed versions live in the `package.json` files and `bun.lock`.

## Core

- Next.js (App Router)
- React
- TypeScript (default language; exact installed version in root `package.json`); readiness policy: `docs/guides/typescript-6-readiness.md`
- Node.js (runtime target; Vercel Functions `nodeVersion` `24.x`)
- Bun (package manager and script runner only; apps still run on Node.js. Do not set `vercel.json` `bunVersion` or `bun --bun` — that opts Vercel Functions onto the Bun runtime, which is separate from the pinned Bun package manager)
- PostgreSQL (Supabase Postgres)

Nia keywords:

- Next.js, App Router, server actions, route handler
- React, hooks, components
- TypeScript, tsconfig
- Node.js
- Bun, bun.lock, bunVersion, Vercel Functions runtime
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
- UI SDK (`@ui-sdk/react`, approved alongside Base UI for shared components, wrapped in `packages/ui`)
- Lucide icons
- MAIA theme, Zinc palette
- Fonts: Inter, Syne, Geist Mono
- next-themes (theme switching)
- Tiptap 3 (`@tiptap/react`, StarterKit, extensions)

Nia keywords:

- tailwind, className, cn, tw
- Base UI, @base-ui/react, drawer, dialog, select, tooltip
- shadcn, components/shadcn, base-maia
- ui-sdk, @ui-sdk/react, data-slot
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
- TanStack Virtual
- TanStack Store
- TanStack DB
- @supabase-labs/tanstack-db
- TanStack Form
- nuqs (URL search-param state)
- Zod

Nia keywords:

- useQuery, queryKey, invalidateQueries
- columnDef, row model
- tanstack db, @supabase-labs/tanstack-db
- supabaseCollectionOptions, queryOnce, collection registry, useLiveQuery
- useVirtualizer, @tanstack/react-store
- form, schema, validation, @tanstack/react-form, zod
- nuqs, useQueryState

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

## Web Studio CMS

- Payload CMS and `@payloadcms/db-postgres` power Mission Control Web Studio.
- Drizzle is owned by Payload's Postgres adapter within the `cms` schema. It does
  not establish a separate ORM boundary for Core business data.

Nia keywords:

- payload, collections, globals, Web Studio
- @payloadcms/db-postgres, cms schema, adapter-owned drizzle

## Durable Workflows

- Inngest (durable jobs/workflows)

Nia keywords:

- inngest, steps, retries, scheduling

Agent tooling note: official Inngest agent skills are vendored under
`docs/ai/skills/inngest-*` for integration planning and implementation work.
Core already installs Inngest in `packages/api/package.json`; the owned runtime
client and function registration live under `packages/api/src/workflows/` and
Mission Control exposes them through `apps/admin/app/api/inngest/route.ts`.
Use `docs/guides/features/inngest-workflows/local-development.md` for local setup
and durability limits. Installed runtime code and agent tooling do not establish
live Cloud qualification.

## Product Agent Runtime

- Eve (`eve` framework) in `packages/eve-runtime`; see `packages/eve-runtime/AGENTS.md`

Nia keywords:

- eve, eve-runtime, agent instructions, schedules, evals

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
- Playwright (e2e)
- Vitest (unit)
- Lighthouse CI (`@lhci/cli`, `lighthouserc.json`)

Nia keywords:

- actions, workflows
- playwright
- vitest
- lhci, lighthouse

## Planned or Referenced (not yet integrated)

These items appear in roadmap/docs/UI copy but are not present in code dependencies today.
Use these tags only when a task explicitly targets integration work.

- Svix (external webhooks)
- Zapier (integrations)
- Chatwoot CE
- Documenso CE

Nia keywords:

- svix, webhook delivery
- zapier
- chatwoot
- documenso

## Retired Integrations

Twenty CRM is retired and prohibited by the
[CRM contract](../../openspec/specs/crm-core/spec.md). Asym Postgres owns CRM
truth; route CRM work through `packages/api/src/crm`. Historical ADR-0001 and
retirement evidence remain records, not integration instructions. Runtime
removal has merged; external provider/credential cleanup remains separately
tracked in [retirement task 4.5](../../openspec/changes/complete-twenty-crm-retirement/tasks.md).

## "When user mentions X, include these stack tags"

- "auth/login/session" -> Supabase Auth, RLS, Next.js
- "db/schema/migration" -> Postgres, Supabase
- "dashboard/table" -> TanStack Table, Query, Tailwind/shadcn
- "payment/checkout/webhook" -> Stripe
- "email/template/pdf" -> React Email Editor, legacy Unlayer, Resend
- "charts/visualization" -> Recharts
- "motion/animation" -> motion
- "rich text/editor/tiptap" -> Tiptap, @tiptap/react, StarterKit
- "jobs/workflows/retries" -> Inngest
- "cms/content" -> Payload
- "crm/sync" -> Asym Postgres via `packages/api/src/crm`

## "Planned" tags (only for explicit integration work)

- "external webhooks" -> Svix
- "support/chat" -> Chatwoot
- "signing/docs" -> Documenso

## Source

Derived from the workspace `package.json` files and roadmap notes. Update it when a
dependency is added to or removed from the stack.
