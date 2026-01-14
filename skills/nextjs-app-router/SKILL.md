# Next.js App Router — Skill

**Name:** `nextjs-app-router`

Use this skill whenever working in a **Next.js App Router** codebase (`/app` directory).  
Apply it for architecture decisions, data fetching, routing, rendering strategy, and performance.

---

## Goal

Help the user build **correct, idiomatic, and performant** Next.js apps using the App Router.

Priorities:
1. Correct rendering model (server vs client)
2. Clear data-flow and routing structure
3. Performance and caching
4. Maintainability

---

## Core principles

### 1) Server-first by default
- Assume **Server Components** unless there is a clear reason to use Client Components
- Add `'use client'` only when needed:
  - browser-only APIs
  - interactivity (event handlers, state, effects)
  - client-side libraries

Never mark entire trees as client without justification.

---

### 2) Routing and layout rules
- Use `/app` routing exclusively
- Prefer `layout.tsx` for shared UI and state
- Keep layouts **stable**; avoid unnecessary re-renders
- Use route groups `(group)` to organize without affecting URLs

---

### 3) Data fetching rules
- Fetch data in **Server Components** by default
- Co-locate data fetching with the component that needs it
- Avoid fetching the same data in multiple places

When data is:
- shared → cache it
- request-specific → keep it dynamic
- user-specific → isolate it

---

### 4) Rendering strategies
Choose intentionally:
- **Static**: build-time, no request dependency
- **Cached**: shared data with revalidation
- **Dynamic**: request-specific, streamed if possible

Avoid accidental dynamic rendering.

---

### 5) Client Components
Use Client Components only for:
- forms and inputs
- interactive UI
- animations
- browser-only APIs

Client Components should:
- be small
- receive data via props
- never fetch server data directly unless required

---

### 6) Suspense and streaming
- Use `<Suspense>` to isolate slow or dynamic parts
- Stream user-specific or low-priority UI
- Keep fallback UI minimal and predictable

---

### 7) Mutations
- Prefer **Server Actions**
- Mutations should:
  - live close to the data they affect
  - trigger cache invalidation when needed
- Avoid client-side mutation logic when a Server Action works

---

### 8) Error handling
- Use `error.tsx` for route-level errors
- Use `not-found.tsx` for missing resources
- Do not swallow errors in data fetching

---

## Common mistakes to prevent

- Marking entire pages as `'use client'`
- Reading request data in shared/cached logic
- Fetching data in Client Components unnecessarily
- Overusing route segment config instead of code-local control
- Mixing routing concerns with UI logic

---

## Review checklist

- [ ] Server Components used by default
- [ ] Client Components are small and justified
- [ ] Data fetching is colocated and not duplicated
- [ ] Rendering strategy is explicit
- [ ] Suspense boundaries isolate dynamic UI
- [ ] Server Actions used for mutations
- [ ] Errors handled at the route level

---

## Minimal examples

### Server Component (default)
```tsx
export default async function Page() {
  const data = await getData()
  return <View data={data} />
}
```

### Client Component (isolated)
```tsx
'use client'

export function Button({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick}>Click</button>
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
  )
}
```

---

## How to apply this skill

When making changes:
1. Decide server vs client first
2. Choose the rendering strategy intentionally
3. Fetch data in the closest Server Component
4. Isolate interactivity and user-specific UI
5. Use Suspense to control loading behavior
