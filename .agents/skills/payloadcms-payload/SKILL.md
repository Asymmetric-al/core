---
name: payloadcms-payload
description: "Payload CMS application development (collections, fields, hooks, access control, Local/REST/GraphQL queries, adapters, plugins). Vendored from payloadcms/skills. Use when editing payload.config.ts, Payload collections, admin, or debugging validation, security, relationships, transactions, or hooks in this repo."
metadata:
  owner: core
  last_updated: 2026-05-16
  status: active
  author: payloadcms
  version: "1.0.0"
  upstream:
    url: https://github.com/payloadcms/skills
    repo: payloadcms/skills
    path: skills/payload
license: MIT
---

# Payload CMS Application Development

Payload is a Next.js native CMS with TypeScript-first architecture, providing admin panel, database management, REST/GraphQL APIs, authentication, and file storage.

## Triggers

Use this skill when work touches Payload CMS application behavior in this repo, including:

- `apps/admin/payload.config.ts`, Payload collections, globals, fields, hooks, access control, admin routes, Local API usage, REST/GraphQL access, adapters, or plugins.
- Web Studio or CMS work under `apps/admin/app/(payload)/**`, `apps/admin/src/cms/**`, `apps/admin/src/cms-ui/**`, and related tests or docs.
- Payload validation, relationships, transactions, hook recursion, access-control behavior, generated types, migrations, import maps, or storage/email adapter behavior.

## Do not use when

- The task is only Supabase schema, RLS, Auth, Storage, or Edge Functions work; use the Supabase skills and nested Supabase instructions instead.
- The task is only Next.js route-handler or shared API boundary work without Payload-specific behavior; use `docs/guides/architecture/data-access-boundary.md` and backend rules first.
- The task is migrating content models from another CMS into Payload; use `docs/ai/skills/payloadcms-cms-migration/SKILL.md`.

## Workflow

1. Read **This repository** and apply the precedence rules before using generic upstream examples.
2. Open the local Payload entry points, starting with `apps/admin/payload.config.ts` and the relevant files under `apps/admin/src/cms/**` or `apps/admin/src/cms-ui/**`.
3. Use the matching topic reference under `reference/` for the specific Payload pattern: collections, fields, hooks, access, queries, adapters, endpoints, or plugins.
4. Prefer the repo's installed Payload version, `@payloadcms/db-postgres`, and `vendor/payload-upstream/` over newer upstream snippets when APIs differ.
5. Run the repo verification commands appropriate to the changed files; if you edit this skill, run `bun run skills:sync` and `bun run skills:verify`.

## This repository (Asymmetric-al/core)

Canonical vendored source: [`payloadcms/skills`](https://github.com/payloadcms/skills) (`skills/payload/`). Maintainer refresh: `docs/ai/skills/payloadcms-payload/references/upstream.md`.

**Precedence when guidance conflicts**

1. **OpenSpec** (`openspec/specs/**`, `openspec/changes/**`) and **`docs/ai/rules/backend.md`** own product intent, security posture, and data-access boundaries for this monorepo.
2. **Supabase** (migrations, RLS, Auth, Storage) follows **`docs/ai/skills/supabase/SKILL.md`** and **`supabase/AGENTS.md`** — not replaced by Payload-only patterns.
3. **Next.js route handlers and shared API** follow **`docs/guides/architecture/data-access-boundary.md`** and existing app and package conventions.
4. This repo vendors a Payload tree under **`vendor/payload-upstream/`** and pins workspace packages to tracked versions. Prefer **local installed APIs and that tree** over examples from newer upstream Payload releases when they disagree.

The remainder of this skill documents **Payload CMS engine patterns** (config, collections, fields, hooks, access control, queries, adapters, plugins). Use the official [Payload documentation](https://payloadcms.com/docs) for version-specific gaps not covered in the vendored `reference/*.md` files.

## Quick Reference

| Task                     | Solution                                  | Details                                                                                                                          |
| ------------------------ | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Auto-generate slugs      | `slugField()`                             | [FIELDS.md#slug-field-helper](reference/FIELDS.md#slug-field-helper)                                                             |
| Restrict content by user | Access control with query                 | [ACCESS-CONTROL.md#row-level-security-with-complex-queries](reference/ACCESS-CONTROL.md#row-level-security-with-complex-queries) |
| Local API user ops       | `user` + `overrideAccess: false`          | [QUERIES.md#access-control-in-local-api](reference/QUERIES.md#access-control-in-local-api)                                       |
| Draft/publish workflow   | `versions: { drafts: true }`              | [COLLECTIONS.md#versioning--drafts](reference/COLLECTIONS.md#versioning--drafts)                                                 |
| Computed fields          | `virtual: true` with afterRead            | [FIELDS.md#virtual-fields](reference/FIELDS.md#virtual-fields)                                                                   |
| Conditional fields       | `admin.condition`                         | [FIELDS.md#conditional-fields](reference/FIELDS.md#conditional-fields)                                                           |
| Custom field validation  | `validate` function                       | [FIELDS.md#text-field](reference/FIELDS.md#text-field)                                                                           |
| Filter relationship list | `filterOptions` on field                  | [FIELDS.md#relationship](reference/FIELDS.md#relationship)                                                                       |
| Select specific fields   | `select` parameter                        | [QUERIES.md#local-api](reference/QUERIES.md#local-api)                                                                           |
| Auto-set author/dates    | beforeChange hook                         | [HOOKS.md#collection-hooks](reference/HOOKS.md#collection-hooks)                                                                 |
| Prevent hook loops       | `req.context` check                       | [HOOKS.md#hook-context](reference/HOOKS.md#hook-context)                                                                         |
| Cascading deletes        | beforeDelete hook                         | [HOOKS.md#collection-hooks](reference/HOOKS.md#collection-hooks)                                                                 |
| Geospatial queries       | `point` field with `near`/`within`        | [FIELDS.md#point-geolocation](reference/FIELDS.md#point-geolocation)                                                             |
| Reverse relationships    | `join` field type                         | [FIELDS.md#join-fields](reference/FIELDS.md#join-fields)                                                                         |
| Next.js revalidation     | Context control in afterChange            | [HOOKS.md#nextjs-revalidation-with-context-control](reference/HOOKS.md#nextjs-revalidation-with-context-control)                 |
| Query by relationship    | Nested property syntax                    | [QUERIES.md#nested-properties](reference/QUERIES.md#nested-properties)                                                           |
| Complex queries          | AND/OR logic                              | [QUERIES.md#andor-logic](reference/QUERIES.md#andor-logic)                                                                       |
| Transactions             | Pass `req` to operations                  | [ADAPTERS.md#threading-req-through-operations](reference/ADAPTERS.md#threading-req-through-operations)                           |
| Background jobs          | Jobs queue with tasks                     | [ADVANCED.md#jobs-queue](reference/ADVANCED.md#jobs-queue)                                                                       |
| Custom API routes        | Collection custom endpoints               | [ADVANCED.md#custom-endpoints](reference/ADVANCED.md#custom-endpoints)                                                           |
| Cloud storage            | Storage adapter plugins                   | [ADAPTERS.md#storage-adapters](reference/ADAPTERS.md#storage-adapters)                                                           |
| Multi-language           | `localization` config + `localized: true` | [ADVANCED.md#localization](reference/ADVANCED.md#localization)                                                                   |
| Create plugin            | `(options) => (config) => Config`         | [PLUGIN-DEVELOPMENT.md#plugin-architecture](reference/PLUGIN-DEVELOPMENT.md#plugin-architecture)                                 |
| Plugin package setup     | Package structure with SWC                | [PLUGIN-DEVELOPMENT.md#plugin-package-structure](reference/PLUGIN-DEVELOPMENT.md#plugin-package-structure)                       |
| Add fields to collection | Map collections, spread fields            | [PLUGIN-DEVELOPMENT.md#adding-fields-to-collections](reference/PLUGIN-DEVELOPMENT.md#adding-fields-to-collections)               |
| Plugin hooks             | Preserve existing hooks in array          | [PLUGIN-DEVELOPMENT.md#adding-hooks](reference/PLUGIN-DEVELOPMENT.md#adding-hooks)                                               |
| Check field type         | Type guard functions                      | [FIELD-TYPE-GUARDS.md](reference/FIELD-TYPE-GUARDS.md)                                                                           |

## This Repo Quick Start

Start from the existing admin app instead of creating a fresh standalone Payload app:

- Payload config: `apps/admin/payload.config.ts`
- Runtime/admin app: `bun run dev:admin`
- Local CMS helpers: `bun run cms:local:bootstrap`, `bun run cms:local:dev`, `bun run cms:local:seed`, `bun run cms:local:verify`
- Payload migrations: `bun run cms:migrate`, `bun run cms:migrate:create`, `bun run cms:migrate:status`
- Database adapter: `@payloadcms/db-postgres`
- Local/runtime env: `PAYLOAD_SECRET`, `PAYLOAD_DATABASE_URI` or the repo's local Postgres fallback documented in `apps/admin/src/cms/payload-database-config.ts`

## Upstream Generic Quick Start

The snippet below is retained as upstream reference material for standalone Payload apps. Do **not** treat it as this monorepo's setup path; this repo uses Bun, the admin app, Postgres, and repo CMS scripts listed above.

```bash
npx create-payload-app@latest my-app
cd my-app
pnpm dev
```

### Upstream Minimal Config

```ts
import { buildConfig } from "payload";
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { fileURLToPath } from "url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: "users",
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL,
  }),
});
```

## Essential Patterns

### Basic Collection

```ts
import type { CollectionConfig } from "payload";

export const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "author", "status", "createdAt"],
  },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "slug", type: "text", unique: true, index: true },
    { name: "content", type: "richText" },
    { name: "author", type: "relationship", relationTo: "users" },
  ],
  timestamps: true,
};
```

For more collection patterns (auth, upload, drafts, live preview), see [COLLECTIONS.md](reference/COLLECTIONS.md).

### Common Fields

```ts
// Text field
{ name: 'title', type: 'text', required: true }

// Relationship
{ name: 'author', type: 'relationship', relationTo: 'users', required: true }

// Rich text
{ name: 'content', type: 'richText', required: true }

// Select
{ name: 'status', type: 'select', options: ['draft', 'published'], defaultValue: 'draft' }

// Upload
{ name: 'image', type: 'upload', relationTo: 'media' }
```

For all field types (array, blocks, point, join, virtual, conditional, etc.), see [FIELDS.md](reference/FIELDS.md).

### Hook Example

```ts
export const Posts: CollectionConfig = {
  slug: "posts",
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        if (operation === "create") {
          data.slug = slugify(data.title);
        }
        return data;
      },
    ],
  },
  fields: [{ name: "title", type: "text" }],
};
```

For all hook patterns, see [HOOKS.md](reference/HOOKS.md). For access control, see [ACCESS-CONTROL.md](reference/ACCESS-CONTROL.md).

### Access Control with Type Safety

```ts
import type { Access } from "payload";
import type { User } from "@/payload-types";

// Example assumes req.user has already been narrowed to the generated User type.
export const adminOnly: Access = ({ req }) => {
  const user = req.user as User;
  return user?.roles?.includes("admin") || false;
};

// Row-level access control
export const ownPostsOnly: Access = ({ req }) => {
  const user = req.user as User;
  if (!user) return false;
  if (user.roles?.includes("admin")) return true;

  return {
    author: { equals: user.id },
  };
};
```

### Query Example

```ts
// Local API
const posts = await payload.find({
  collection: "posts",
  where: {
    status: { equals: "published" },
    "author.name": { contains: "john" },
  },
  depth: 2,
  limit: 10,
  sort: "-createdAt",
});

// Query with populated relationships
const post = await payload.findByID({
  collection: "posts",
  id: "123",
  depth: 2, // Populates relationships (default is 2)
});
// Returns: { author: { id: "user123", name: "John" } }

// Without depth, relationships return IDs only
const post = await payload.findByID({
  collection: "posts",
  id: "123",
  depth: 0,
});
// Returns: { author: "user123" }
```

For all query operators and REST/GraphQL examples, see [QUERIES.md](reference/QUERIES.md).

### Getting Payload Instance

```ts
// In API routes (Next.js)
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  const payload = await getPayload({ config })

  const posts = await payload.find({
    collection: 'posts',
  })

  return Response.json(posts)
}

// In Server Components
import { getPayload } from 'payload'
import config from '@payload-config'

export default async function Page() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'posts' })

  return <div>{docs.map(post => <h1 key={post.id}>{post.title}</h1>)}</div>
}
```

### Logger Usage

```ts
// ✅ Valid: single string
payload.logger.error("Something went wrong");

// ✅ Valid: object with msg and err
payload.logger.error({ msg: "Failed to process", err: error });

// ❌ Invalid: don't pass error as second argument
payload.logger.error("Failed to process", error);

// ❌ Invalid: use `err` not `error`, use `msg` not `message`
payload.logger.error({ message: "Failed", error: error });
```

## Security Pitfalls

### 1. Local API Access Control (CRITICAL)

**By default, Local API operations bypass ALL access control**, even when passing a user.

```ts
// ❌ SECURITY BUG: Passes user but ignores their permissions
await payload.find({
  collection: "posts",
  user: someUser, // Access control is BYPASSED!
});

// ✅ SECURE: Actually enforces the user's permissions
await payload.find({
  collection: "posts",
  user: someUser,
  overrideAccess: false, // REQUIRED for access control
});
```

**When to use each:**

- `overrideAccess: true` (default) - Server-side operations you trust (cron jobs, system tasks)
- `overrideAccess: false` - When operating on behalf of a user (API routes, webhooks)

See [QUERIES.md#access-control-in-local-api](reference/QUERIES.md#access-control-in-local-api).

### 2. Transaction Failures in Hooks

**Nested operations in hooks without `req` break transaction atomicity.**

```ts
// ❌ DATA CORRUPTION RISK: Separate transaction
hooks: {
  afterChange: [
    async ({ doc, req }) => {
      await req.payload.create({
        collection: "audit-log",
        data: { docId: doc.id },
        // Missing req - runs in separate transaction!
      });
    },
  ];
}

// ✅ ATOMIC: Same transaction
hooks: {
  afterChange: [
    async ({ doc, req }) => {
      await req.payload.create({
        collection: "audit-log",
        data: { docId: doc.id },
        req, // Maintains atomicity
      });
    },
  ];
}
```

See [ADAPTERS.md#threading-req-through-operations](reference/ADAPTERS.md#threading-req-through-operations).

### 3. Infinite Hook Loops

**Hooks triggering operations that trigger the same hooks create infinite loops.**

```ts
// ❌ INFINITE LOOP
hooks: {
  afterChange: [
    async ({ doc, req }) => {
      await req.payload.update({
        collection: "posts",
        id: doc.id,
        data: { views: doc.views + 1 },
        req,
      }); // Triggers afterChange again!
    },
  ];
}

// ✅ SAFE: Use context flag
hooks: {
  afterChange: [
    async ({ doc, req, context }) => {
      if (context.skipHooks) return;

      await req.payload.update({
        collection: "posts",
        id: doc.id,
        data: { views: doc.views + 1 },
        context: { skipHooks: true },
        req,
      });
    },
  ];
}
```

See [HOOKS.md#hook-context](reference/HOOKS.md#hook-context).

## Project Structure

```txt
src/
├── app/
│   ├── (frontend)/
│   │   └── page.tsx
│   └── (payload)/
│       └── admin/[[...segments]]/page.tsx
├── collections/
│   ├── Posts.ts
│   ├── Media.ts
│   └── Users.ts
├── globals/
│   └── Header.ts
├── components/
│   └── CustomField.tsx
├── hooks/
│   └── slugify.ts
└── payload.config.ts
```

## Type Generation

```ts
// payload.config.ts
export default buildConfig({
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  // ...
});

// Usage
import type { Post, User } from "@/payload-types";
```

## Reference Documentation

- **[FIELDS.md](reference/FIELDS.md)** - All field types, validation, admin options
- **[FIELD-TYPE-GUARDS.md](reference/FIELD-TYPE-GUARDS.md)** - Type guards for runtime field type checking and narrowing
- **[COLLECTIONS.md](reference/COLLECTIONS.md)** - Collection configs, auth, upload, drafts, live preview
- **[HOOKS.md](reference/HOOKS.md)** - Collection hooks, field hooks, context patterns
- **[ACCESS-CONTROL.md](reference/ACCESS-CONTROL.md)** - Collection, field, global access control, RBAC, multi-tenant
- **[ACCESS-CONTROL-ADVANCED.md](reference/ACCESS-CONTROL-ADVANCED.md)** - Context-aware, time-based, subscription-based access, factory functions, templates
- **[QUERIES.md](reference/QUERIES.md)** - Query operators, Local/REST/GraphQL APIs
- **[ENDPOINTS.md](reference/ENDPOINTS.md)** - Custom API endpoints: authentication, helpers, request/response patterns
- **[ADAPTERS.md](reference/ADAPTERS.md)** - Database, storage, email adapters, transactions
- **[ADVANCED.md](reference/ADVANCED.md)** - Authentication, jobs, endpoints, components, plugins, localization
- **[PLUGIN-DEVELOPMENT.md](reference/PLUGIN-DEVELOPMENT.md)** - Plugin architecture, monorepo structure, patterns, best practices

## Resources

- llms-full.txt: <https://payloadcms.com/llms-full.txt>
- Docs: <https://payloadcms.com/docs>
- GitHub: <https://github.com/payloadcms/payload>
- Examples: <https://github.com/payloadcms/payload/tree/main/examples>
- Templates: <https://github.com/payloadcms/payload/tree/main/templates>

## Checklist

- [ ] Read the **This repository** precedence block at the top of this `SKILL.md`.
- [ ] Opened **`docs/ai/rules/backend.md`** when work touches auth, persisted data, secrets, or admin/CMS boundaries.
- [ ] For database or RLS-affecting changes: reconciled with **`docs/ai/skills/supabase/SKILL.md`** and **`supabase/AGENTS.md`** as needed.
- [ ] For topic-specific Payload patterns, opened the matching file under **`reference/`** (for example `reference/HOOKS.md`, `reference/QUERIES.md`).
- [ ] If you edited files under `docs/ai/skills/payloadcms-payload/`, ran **`bun run skills:sync`** and **`bun run skills:verify`** before committing.
