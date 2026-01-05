# UI Sources

This document serves as the single source of truth for UI block references and inspiration. Use these sources to find candidate blocks for implementation.

## Block Discovery & Reference
- **Orchids Docs**: [https://docs.orchids.app](https://docs.orchids.app) - Official documentation.
- **Shoogle**: [https://shoogle.dev](https://shoogle.dev) - shadcn blocks search.
- **lucide-react**: [https://lucide.dev](https://lucide.dev) - Standard icon library.
- **lucide-animated**: [https://github.com/StevenLeRoux/lucide-animated](https://github.com/StevenLeRoux/lucide-animated) - Animated Lucide icons.
- **AppIcon Abstraction**: `src/components/ui/icons/AppIcon.tsx` - Our internal wrapper that supports standard Lucide icons and adds optional `animated` behavior via `motion`.

## Dashboard & Admin Patterns
- **shadcnblocks**: [https://shadcnblocks.com](https://shadcnblocks.com) - High-quality shadcn/ui blocks.
- **Project Dashboard**: [https://github.com/Jason-uxui/project-dashboard](https://github.com/Jason-uxui/project-dashboard) - Reference for task management and complex dashboard UIs.

## Charts & Data Visualization
- **UI TripleD**: [https://github.com/ui-triple-d](https://github.com/ui-triple-d) - Chart and data visualization patterns.
- **ReUI**: [https://reui.io](https://reui.io) - Modern UI components and charts.
- **DiceUI**: [https://diceui.com](https://diceui.com) - Accessible chart components.

---

## Sources Library Template

Use this template when adding a new source to the project:

| Field | Description |
|-------|-------------|
| **Name** | |
| **URL** | |
| **Best for** | (e.g., Data tables, Auth flows, Charts) |
| **Intended extraction** | (What specific components or patterns we'll copy) |
| **Location** | `src/components/_intake/<source>/<name>.tsx` |
| **Notes / Gotchas** | (Maia theming, responsiveness, accessibility considerations) |

---

## How to use these docs

1. **Identify the Need**: Pick a surface and part from the [UI Inventory](./ui-inventory.md).
2. **Find Candidates**: Browse the sources listed above to find candidate blocks.
3. **Intake**: Bring the copied block into the repo using the `src/components/_intake/` pattern.
4. **Adapt**: Modify the block to match Maia theme tokens and repo conventions.
5. **Implement**: Move the adapted component to its permanent home in `src/components/` or `src/features/`.
6. **Verify**: Update the status and path in the [UI Inventory](./ui-inventory.md).
