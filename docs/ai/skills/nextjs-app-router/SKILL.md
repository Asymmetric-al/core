# Next.js App Router — Skill

**Name:** `nextjs-app-router`
**Purpose:** Ensure correct App Router architecture, rendering strategy, and data fetching in Next.js.
Use this skill whenever working under `/app`.

**Applies when:** Routing, layouts, server/client boundaries, data fetching, Suspense, Server Actions.
**Do not use when:** Working in the Pages Router (`/pages`) or non-Next.js projects.

## Rules

- **Server-first:** Default to Server Components; add `'use client'` only for interactivity or browser APIs.
- **Routing/layouts:** Use `layout.tsx` for shared UI; keep layouts stable; use route groups `(group)` for organization.
- **Data fetching:** Fetch in Server Components by default and colocate with usage.
- **Rendering strategy:** Choose static, cached, or dynamic intentionally; avoid accidental dynamic rendering.
- **Client components:** Keep them small, prop-driven, and avoid server data fetching inside them.
- **Suspense/streaming:** Use `<Suspense>` for slow or user-specific UI.
- **Mutations:** Prefer Server Actions and invalidate caches as needed.
- **Errors:** Use `error.tsx` and `not-found.tsx` for route-level handling.

## Workflow

1. Decide server vs client boundaries first.
2. Choose the rendering strategy (static/cached/dynamic).
3. Fetch data in the closest Server Component.
4. Isolate interactivity into small Client Components.
5. Add Suspense boundaries for dynamic or slow UI.
6. Use Server Actions for mutations and add error boundaries.

## Checklists

### Implementation checklist

- [ ] Server Components used by default
- [ ] Client Components are small and justified
- [ ] Data fetching is colocated and not duplicated
- [ ] Rendering strategy is explicit
- [ ] Suspense isolates dynamic UI
- [ ] Server Actions used for mutations

### Review checklist

- [ ] No accidental `'use client'` on large trees
- [ ] No server data fetching inside client-only components
- [ ] Errors handled via `error.tsx` / `not-found.tsx`

## Minimal examples

### Server Component (default)

```tsx
export default async function Page() {
  const data = await getData();
  return <View data={data} />;
}
```

### Client Component (isolated)

```tsx
"use client";

export function Button({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick}>Click</button>;
}
```

### Layout usage

```tsx
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
```

## Common mistakes / pitfalls

- Marking entire pages as `'use client'`
- Fetching server data in Client Components
- Reading request data in shared/cached logic
- Overusing route segment config instead of code-local controls
- Mixing routing concerns with component UI logic
