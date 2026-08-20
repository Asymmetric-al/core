# Auth package (`@asym/auth`)

**Scope:** Shared Next.js + Supabase auth helpers. Do not copy root `AGENTS.md`.

- Load `docs/ai/skills/supabase/SKILL.md` and `docs/ai/skills/nextjs-supabase-auth/SKILL.md`.
- Follow `docs/ai/rules/backend.md`. Session and cookie work is version-sensitive — read current `@supabase/ssr` and Next.js request-API docs, not memory.
- Fail closed. Do not weaken auth, RLS, or service-role usage from UI or instruction-system work.
- App auth callback routes should re-export package contracts rather than embedding a second client.

## Triggers

- Editing files under `packages/auth/**`

## Workflow

1. Read this file, `docs/ai/rules/backend.md`, and `docs/ai/skills/nextjs-supabase-auth/SKILL.md`.
2. Follow TDD for substantive behavior.

## Checklist

- [ ] Shared auth stays in `packages/auth`
- [ ] Apps re-export rather than duplicating provider logic
