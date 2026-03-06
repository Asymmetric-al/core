---
name: unlayer-custom-tools
description: Build or extend custom Unlayer tools in this repo. Use when registering custom drag-and-drop blocks, property editors, custom widgets, or shared tool configuration for Email Studio or PDF Studio.
---

# Unlayer Custom Tools

Use this skill when the task involves custom Unlayer blocks or editors that should live in shared studio infrastructure rather than being duplicated in a single app page.

## Apply This Skill When

- Registering a custom Unlayer tool
- Adding or changing a custom property editor
- Extending shared tool configuration passed into the editor
- Building reusable drag-and-drop blocks for Email Studio or PDF Studio
- Debugging custom tool rendering or exporter behavior

## Do Not Use When

- The task is only editor setup, lifecycle, or wrapper integration -> use `docs/ai/skills/unlayer-integration/SKILL.md`
- The task is only export/save/load behavior -> use `docs/ai/skills/unlayer-export/SKILL.md`
- The task is only appearance, merge tags, uploads, or security -> use `docs/ai/skills/unlayer-config/SKILL.md`

## Repo Surfaces to Check First

- Shared wrapper and editor options: `packages/ui/components/studio/UnlayerEditor.tsx`
- Email Studio consumer: `apps/admin/app/email/page.tsx`
- PDF Studio consumer: `apps/admin/app/pdf/page.tsx`

## Core Rules

- Prefer shared, reusable tool registration over page-local one-off blocks.
- If the tool is meant to work in multiple studio surfaces, wire it through shared infrastructure.
- Keep tool behavior aligned with the target display mode (`email` vs `document` vs `web`).
- For email-safe output, respect Unlayer’s table-based exporter guidance for email HTML.
- Keep any editor customization declarative and discoverable through shared configuration when possible.

## Workflow

1. Decide whether the tool belongs in shared studio infrastructure or only a single consumer.
2. Inspect `UnlayerEditor.tsx` for the right integration point:
   - shared `tools` config
   - custom CSS / JS
   - display-mode-specific handling
3. Keep tool registration and configuration centralized when the feature is reusable.
4. Verify renderers/exporters stay compatible with the intended output mode.
5. If the task introduces related upload, merge-tag, or feature-flag work, also apply `docs/ai/skills/unlayer-config/SKILL.md`.

## Checklist

- [ ] Custom tool belongs in shared infrastructure when reusable
- [ ] Tool registration is not duplicated across app pages
- [ ] Output mode compatibility considered (`email`, `document`, `web`, `popup`)
- [ ] Email-safe HTML constraints respected when applicable
- [ ] Related config/export concerns routed to the right Unlayer sub-skill

## References

- Upstream attribution: `references/upstream.md`
