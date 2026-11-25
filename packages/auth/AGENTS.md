# Auth package (`@asym/auth`)

**Scope:** Shared Next.js + Supabase auth helpers. Do not copy root `AGENTS.md`.

- Load `docs/ai/skills/supabase/SKILL.md` and `docs/ai/skills/nextjs-supabase-auth/SKILL.md`.
- Follow `docs/ai/rules/backend.md`. Session and cookie work is version-sensitive — read current `@supabase/ssr` and Next.js request-API docs, not memory.
- Fail closed. Do not weaken auth, RLS, or service-role usage from UI or instruction-system work.
- App auth callback routes should re-export package contracts rather than embedding a second client.
- `front.ts` owns the signed front stamp, dashboard admission allowlists, and donor front routing behind `CORE_SERVE_UNDER_PATHS`.
- `verified-name.ts` owns the dashboards' lookup of the stamped host and the per-surface admission rule; with the switch on, `x-asym-name-tenant` bounds every tenant claim (`docs/adr/0015-organization-from-the-verified-name.md`).
- In `apps/donor`, with the switch on, `lookUpVerifiedNameSurfaces` admits `donor_account` (`active`, home) and `website` (`active`) in one lookup per request, ends the single-organization donor fallback, and refuses absent/invalid names in every app (`docs/adr/0016-donor-organization-from-the-verified-name.md`).
- `home-name.ts` owns the one anonymous home read (`resolve_home_host`) behind the donor proxy's redirect of a Site name's four account roots to home; the target, scheme and port come only from that read, never from a request header (ADR 0016, decision 7).
- The reasons behind this package's rules are in `docs/adr/` (start at `docs/adr/README.md`). Read the record for a module before you change it. Source carries no comments, so a new decision goes there too.

## Triggers

- Editing files under `packages/auth/**`

## Workflow

1. Read this file, `docs/ai/rules/backend.md`, and `docs/ai/skills/nextjs-supabase-auth/SKILL.md`.
2. Follow TDD for substantive behavior.

## Checklist

- [ ] Shared auth stays in `packages/auth`
- [ ] Apps re-export rather than duplicating provider logic
