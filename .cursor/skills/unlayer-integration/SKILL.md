---
name: unlayer-integration
description: Integrate or extend Unlayer inside this repo using the shared editor wrapper and existing Email/PDF Studio surfaces. Use when working on react-email-editor setup, editor options, display modes, project configuration, or shared editor plumbing.
---

# Unlayer Integration

This repo already embeds Unlayer through a shared wrapper:

- `packages/ui/components/studio/UnlayerEditor.tsx`

Primary consumers today:

- `apps/admin/app/email/page.tsx`
- `apps/admin/app/pdf/page.tsx`

Prefer evolving the shared wrapper and shared config before adding raw `react-email-editor` usage in app pages.

## Apply This Skill When

- Adding Unlayer to a new repo surface
- Extending `UnlayerEditor` props or editor setup behavior
- Changing display modes (`email`, `web`, `popup`, `document`)
- Wiring project ID, locale, merge tags, appearance, or user context into the editor
- Debugging editor readiness, design loading, or save/export access patterns

## Do Not Use When

- The task is primarily merge tags, uploads, feature flags, or security only -> use `docs/ai/skills/unlayer-config/SKILL.md`
- The task is primarily export/save/load behavior -> use `docs/ai/skills/unlayer-export/SKILL.md`
- The task is primarily custom tool registration -> use `docs/ai/skills/unlayer-custom-tools/SKILL.md`

## Repo Surfaces to Check First

- Shared editor wrapper: `packages/ui/components/studio/UnlayerEditor.tsx`
- Email config: `packages/config/email-studio.ts`
- PDF config: `packages/config/pdf-studio.ts`
- Env schema: `packages/env/src/schema.ts`
- Example env values: `.env.example`
- Product docs:
  - `docs/guides/features/email-studio.md`
  - `docs/guides/features/pdf-studio.md`

## Workflow

1. Start with the shared wrapper and identify whether the change belongs in:
   - wrapper props / editor options
   - shared config
   - consuming page logic
2. Reuse existing wrapper abstractions before introducing raw `react-email-editor` calls in app code.
3. Keep environment-driven settings (`NEXT_PUBLIC_UNLAYER_*`) in config/env files, not in page-local constants.
4. If the change affects both Email Studio and PDF Studio, implement it in shared infrastructure first.
5. Verify that editor load, ready, design load, and imperative handle methods still follow the existing shared pattern.

## Checklist

- [ ] Shared `UnlayerEditor` considered before app-local integration
- [ ] Email/PDF Studio consumers remain consistent
- [ ] Environment-driven config lives in `packages/config/*` and `packages/env/*`
- [ ] No duplicate wrapper logic introduced in `apps/*`
- [ ] Follow-up export/config/custom-tool work routed to the right skill if needed

## References

- Upstream attribution: `references/upstream.md`
