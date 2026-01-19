# Icon System Documentation

This document describes how to use icons in the codebase, ensuring proper tree-shaking and bundle optimization.

## Quick Start

### Static Icons (Recommended)

For most use cases, import icons directly:

```tsx
import { Check, ChevronDown, Loader2 } from "@/components/ui/icons";

export function MyComponent() {
  return (
    <div>
      <Check className="h-4 w-4" />
      <ChevronDown className="h-4 w-4 text-muted-foreground" />
      <Loader2 className="h-4 w-4 animate-spin" />
    </div>
  );
}
```

### Dynamic Icons (For Config-Driven UIs)

When icon names come from data/config (e.g., navigation tiles):

```tsx
import { DynamicIcon, getIconByName } from '@/features/mission-control/components/icons'

// Using DynamicIcon component
<DynamicIcon name="Globe" className="h-6 w-6" />

// Using getIconByName for more control
const Icon = getIconByName(tile.icon)
<Icon className="h-4 w-4" />
```

## File Structure

```
src/
├── components/
│   └── ui/
│       └── icons/
│           └── index.tsx          # Primary icon registry (tree-shakeable exports)
│
├── components/mission-control/
│   └── icons.tsx                  # Dynamic icon map for MC tiles
│
└── features/mission-control/
    └── components/
        └── icons.tsx              # Dynamic icon map for MC features
```

## Import Paths

| Use Case                                           | Import From             |
| -------------------------------------------------- | ----------------------- |
| Static icons in any component                      | `@/components/ui/icons` |
| Dynamic icons in `src/components/mission-control/` | `../icons` (relative)   |
| Dynamic icons in `src/features/mission-control/`   | `../icons` (relative)   |

## Tree-Shaking Explained

### How It Works

Next.js has `lucide-react` in its `optimizePackageImports` list, so named imports are automatically tree-shaken:

```tsx
// GOOD - Only Camera and Check are bundled
import { Camera, Check } from "@/components/ui/icons";
```

### Anti-Patterns to Avoid

```tsx
// BAD - Don't use namespace imports
import * as Icons from 'lucide-react'

// BAD - Don't create objects with all icons
const allIcons = { Camera, Check, ... } // Includes all icons in bundle
```

## Adding New Icons

### Step 1: Add to Main Registry

Edit `src/components/ui/icons/index.tsx`:

```tsx
import {
  // ... existing imports
  NewIcon, // Add here
} from "lucide-react";

export {
  // ... existing exports
  NewIcon, // Add here
};
```

### Step 2: Add to Dynamic Map (if needed for tiles/navigation)

If the icon will be used with string-based names in tile configs, add to both:

**`src/components/mission-control/icons.tsx`:**

```tsx
import { NewIcon } from "@/components/ui/icons";

const TILE_ICON_MAP = {
  // ... existing icons
  NewIcon,
};
```

**`src/features/mission-control/components/icons.tsx`:**

```tsx
import { NewIcon } from "@/components/ui/icons";

const TILE_ICON_MAP = {
  // ... existing icons
  NewIcon,
};
```

## Removing Icons

1. Search for usages: `grep -r "IconName" src/`
2. If no usages found:
   - Remove from `src/components/ui/icons/index.tsx` import and export
   - Remove from dynamic maps if present
3. Run `bun run typecheck` to verify no broken imports

## Icon Aliases

Some legacy or semantic names map to existing icons:

| Alias           | Actual Icon     |
| --------------- | --------------- |
| `ClipboardPlus` | `ClipboardList` |
| `DoorOpen`      | `CalendarDays`  |
| `FileHeart`     | `FileHeart`     |

Add aliases in the `TILE_ICON_MAP`:

```tsx
const TILE_ICON_MAP = {
  ClipboardList,
  ClipboardPlus: ClipboardList, // Alias
};
```

## TypeScript Support

Types are re-exported for use in component props:

```tsx
import { type LucideIcon, type LucideProps } from "@/components/ui/icons";

interface Props {
  icon: LucideIcon;
  iconProps?: Omit<LucideProps, "ref">;
}
```

## Common Icon Patterns

### Loading State

```tsx
<Loader2 className="h-4 w-4 animate-spin" />
```

### Button with Icon

```tsx
<Button>
  <Plus className="mr-2 h-4 w-4" />
  Add Item
</Button>
```

### Icon Button

```tsx
<Button variant="ghost" size="icon">
  <Settings className="h-4 w-4" />
</Button>
```

### Conditional Icon

```tsx
{
  isOpen ? (
    <ChevronUp className="h-4 w-4" />
  ) : (
    <ChevronDown className="h-4 w-4" />
  );
}
```

## Available Icons

The registry includes 90+ icons. Common ones:

**Navigation:** `Home`, `LayoutDashboard`, `Settings`, `Menu`, `ChevronLeft/Right/Up/Down`

**Actions:** `Plus`, `Edit`, `Trash`, `Download`, `Upload`, `Search`, `Filter`, `RefreshCw`

**Status:** `Check`, `CheckCircle`, `AlertCircle`, `AlertTriangle`, `Info`, `Loader2`

**Communication:** `Mail`, `MessageSquare`, `Bell`, `Send`, `Phone`

**Users:** `User`, `Users`, `UserPlus`

**Finance:** `DollarSign`, `CreditCard`, `Receipt`, `Wallet`

See `src/components/ui/icons/index.tsx` for the complete list.

## For AI Agents

When implementing features:

1. **Always import from `@/components/ui/icons`** for static icon usage
2. **Check if icon exists** in the registry before using
3. **Add new icons** to the main registry first, then to dynamic maps if needed
4. **Use `DynamicIcon`** only when icon names come from config/data
5. **Never import directly from `lucide-react`** in feature code
