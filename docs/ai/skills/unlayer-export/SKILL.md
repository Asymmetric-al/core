---
name: unlayer-export
description: Export and persist Unlayer content in this repo. Use when working on HTML or PDF export, save/load design flows, design JSON persistence, auto-save patterns, or editor export methods in Email Studio or PDF Studio.
---

# Unlayer Export

Use this skill for save/load/export work across the repo’s Unlayer-based studio features.

## Apply This Skill When

- Changing `exportHtml`, `exportPdf`, or save/load behavior
- Persisting or restoring Unlayer design JSON
- Adjusting auto-save or debounced save flows
- Working on HTML output, PDF export, or export-related UX
- Debugging design restoration or export return payloads

## Repo Surfaces to Check First

- Shared wrapper export methods: `packages/ui/components/studio/UnlayerEditor.tsx`
- Email Studio docs and examples: `docs/guides/features/email-studio.md`
- PDF Studio docs and examples: `docs/guides/features/pdf-studio.md`
- Consumers:
  - `apps/admin/app/email/page.tsx`
  - `apps/admin/app/pdf/page.tsx`

## Core Rules

- Always preserve design JSON alongside exported output so designs remain editable.
- Prefer shared wrapper methods for export logic over duplicating raw Unlayer calls in app pages.
- Keep save/load behavior consistent across Email Studio and PDF Studio where possible.
- For cloud export behavior (image/PDF/ZIP), keep secrets and API keys out of client code and docs.

## Workflow

1. Identify whether the task affects:
   - shared wrapper export methods
   - page-level export UX
   - persistence / restore flow
   - design JSON structure assumptions
2. Start with `UnlayerEditor.tsx` and existing docs to understand the current shared pattern.
3. Keep save/load/export responsibilities centralized when the same behavior is used by multiple studio surfaces.
4. Verify both the exported artifact and the returned design payload shape.
5. If the change also affects merge tags, uploads, or feature flags, apply `docs/ai/skills/unlayer-config/SKILL.md` too.

## Checklist

- [ ] Design JSON is preserved for editable templates
- [ ] Shared export methods used or updated before app-local duplication
- [ ] Email Studio and PDF Studio behavior remains consistent when intended
- [ ] No client-side secrets introduced for cloud export flows
- [ ] Export-related docs and references remain accurate

## References

- Design JSON reference: `references/design-json.md`
- Upstream attribution: `references/upstream.md`
