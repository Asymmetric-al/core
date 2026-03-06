---
name: unlayer-config
description: Configure Unlayer behavior in this repo. Use when changing feature flags, appearance, merge tags, design tags, uploads, security, allowed domains, white-label settings, or environment-driven editor configuration.
---

# Unlayer Config

Use this skill for editor configuration, security, and setup concerns across the repo’s Unlayer-based studio features.

## Apply This Skill When

- Adjusting feature flags or editor options
- Changing appearance, theme, fonts, or panel behavior
- Adding or updating merge tags or design tags
- Working on uploads, file manager, or storage integration
- Handling allowed domains, white-label mode, or project configuration
- Reviewing HMAC / user identification guidance

## Repo Surfaces to Check First

- Email Studio config: `packages/config/email-studio.ts`
- PDF Studio config: `packages/config/pdf-studio.ts`
- Environment schema: `packages/env/src/schema.ts`
- Example env file: `.env.example`
- Product docs:
  - `docs/guides/features/email-studio.md`
  - `docs/guides/features/pdf-studio.md`

## Repo-Relevant Environment Keys

- `NEXT_PUBLIC_UNLAYER_PROJECT_ID`
- `NEXT_PUBLIC_UNLAYER_WHITE_LABEL`
- `NEXT_PUBLIC_UNLAYER_ALLOWED_DOMAINS`

## Core Rules

- Keep browser-safe Unlayer configuration in `NEXT_PUBLIC_UNLAYER_*` vars only.
- Never place project secrets or cloud API keys in client-side code or committed docs.
- Prefer shared config modules over page-local configuration drift.
- Keep merge tags, appearance, and feature flags consistent with the shared studio setup.
- Use server-side generation for HMAC signatures or other secret-backed security flows.

## Workflow

1. Identify whether the task belongs in shared config, env schema, or product docs.
2. Update `packages/config/email-studio.ts` and/or `packages/config/pdf-studio.ts` before adding page-local overrides.
3. If new browser-safe config is required, update:
   - `packages/env/src/schema.ts`
   - `.env.example`
4. Keep security-sensitive values server-side and documented without secrets.
5. Verify the setup guidance, status components, and docs still reflect the actual configuration model.

## Checklist

- [ ] Shared config updated before app-local overrides
- [ ] `NEXT_PUBLIC_UNLAYER_*` usage remains browser-safe
- [ ] No secrets or project-specific identifiers added to committed files
- [ ] Merge tags / appearance / feature flags remain consistent across studio surfaces
- [ ] Setup docs and env examples match the new configuration behavior

## References

- Feature flags reference: `references/feature-flags.md`
- File storage reference: `references/file-storage.md`
- Security reference: `references/security.md`
- Upstream attribution: `references/upstream.md`
