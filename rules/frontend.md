# Frontend Rules (Asymmetric.al)

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Core**: React 19, TypeScript 5.8
- **Styling**: Tailwind CSS 4
- **State**: TanStack Query v5 (Server), React Context (Client/UI)
- **Forms**: React Hook Form + Zod
- **UI Architecture**: Shadcn UI (Radix Primitives) + Lucide Icons

## Code Organization

### Directory Structure
Follow the **Feature-based** organization pattern:
```
src/
  app/               # Next.js App Router (pages/layouts)
  components/
    ui/              # Shared UI components (Button, Input) - do not edit unless necessary
    dashboard/       # Dashboard specific components
  features/          # Domain features
    auth/
      components/    # Auth-specific components
      hooks/         # Auth hooks
      types.ts       # Auth types
  lib/               # Singleton utilities (Supabase, Utils)
```

### Imports
- **Absolute Imports**: Always use `@/` alias (e.g., `import { Button } from '@/components/ui/button'`).
- **Icons**: Import from `lucide-react` (e.g., `import { ChevronRight } from 'lucide-react'`).

## Component Rules
- If using shadcn/studio MCP to generate UI (blocks/components/pages), follow `rules/shadcn-studio-mcp.md` and do not deviate from the workflow.
1.  **"Use Client"**: Only add `'use client'` when necessary (interactivity, hooks). Default to Server Components.
2.  **Shadcn UI**: Use the existing components in `src/components/ui`. Do not invent new primitives if one exists.
3.  **Tailwind**:
    - Use utility classes for everything.
    - Use `cn()` for class merging.
    - Avoid arbitrary values (`w-[123px]`)—use design tokens (`w-32`).

## State Management
- **Server State**: Use TanStack Query (`useQuery`, `useMutation`) for all async data.
    - **Keys**: Use array-based keys: `['users', id]`.
    - **Mutations**: Invalidate queries on success.
- **Client State**: Use `useState` or `useReducer` for local state. Use React Context for strictly global UI state (theming, toasts).
- **Zustand**: **Do not use**. This repo does not currently have Zustand installed.

## Forms
- **Validation**: Strict Zod schemas for all inputs.
- **Pattern**:
    ```tsx
    const form = useForm({ resolver: zodResolver(schema) })
    return <Form {...form}><form onSubmit={...}></form></Form>
    ```

## Testing
*(If frontend tests are added, generic RTL patterns apply, but standard CI currently only enforces build/lint/typecheck)*.
