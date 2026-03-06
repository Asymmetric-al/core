---
name: unlayer
description: Route Unlayer work in this repo to the right sub-skill. Use when the task involves the Unlayer visual editor, Email Studio, PDF Studio, editor configuration, exports, merge tags, custom tools, or embedded editor integration.
---

# Unlayer

Use this skill as the router for Unlayer work in Asymmetric.al. The repo already has a shared Unlayer wrapper and two main product surfaces:

- `packages/ui/components/studio/UnlayerEditor.tsx`
- `apps/admin/app/email/page.tsx`
- `apps/admin/app/pdf/page.tsx`

Do not default to raw one-off framework examples when the task belongs in the shared studio infrastructure.

## Route to the Right Skill

| If the task is about... | Use this skill |
| --- | --- |
| Embedding or extending the shared editor wrapper | `docs/ai/skills/unlayer-integration/SKILL.md` |
| HTML/PDF export, save/load flows, design JSON persistence | `docs/ai/skills/unlayer-export/SKILL.md` |
| Appearance, merge tags, security, allowed domains, uploads, feature flags | `docs/ai/skills/unlayer-config/SKILL.md` |
| Custom drag-and-drop blocks, property editors, or tool registration | `docs/ai/skills/unlayer-custom-tools/SKILL.md` |

## Workflow

1. Identify whether the request is primarily **integration**, **export**, **configuration**, or **custom tools**.
2. Read the matching sub-skill before editing.
3. Prefer repo-native surfaces (`UnlayerEditor`, Email Studio, PDF Studio, shared config) over page-local duplication.
4. If multiple concerns are involved, apply the skills in this order:
   1. `unlayer-integration`
   2. `unlayer-config`
   3. `unlayer-export`
   4. `unlayer-custom-tools`
5. Verify changes via `bun run skills:sync` when skill files change, then run targeted repo checks.

## Checklist

- [ ] Correct Unlayer sub-skill selected
- [ ] Shared wrapper and existing admin studio surfaces considered first
- [ ] No duplicate one-off editor integration introduced
- [ ] Any new skill guidance remains consistent with repo-specific Unlayer architecture

## Example Routing

- “Add Unlayer to a new admin feature” -> `docs/ai/skills/unlayer-integration/SKILL.md`
- “Add merge tags for donation receipts” -> `docs/ai/skills/unlayer-config/SKILL.md`
- “Adjust PDF export/save flow” -> `docs/ai/skills/unlayer-export/SKILL.md`
- “Create a reusable custom content block” -> `docs/ai/skills/unlayer-custom-tools/SKILL.md`

## References

- Upstream attribution: `references/upstream.md`
