# Admin Dashboard — UX/UI Standards

> Definitive reference for the admin dashboard design system. All admin pages must follow these standards.

## Table of Contents

- [Design Philosophy](#design-philosophy)
- [Typography](#typography)
- [Color System](#color-system)
- [Layout & Spacing](#layout--spacing)
- [PageShell Component](#pageshell-component)
- [Stat Cards](#stat-cards)
- [Buttons](#buttons)
- [Sidebar](#sidebar)
- [Tables](#tables)
- [Detail Sheets](#detail-sheets)
- [Cards](#cards)
- [Motion & Animation](#motion--animation)
- [Charts](#charts)
- [Empty States](#empty-states)
- [Icons](#icons)
- [Accessibility](#accessibility)
- [Component Imports](#component-imports)

---

## Design Philosophy

**Calm, predictable, fast.** Clean and breathable, not empty. Bold hierarchy for quick scanning. Everything feels like one product.

### Non-Negotiables

- Semantic tokens only — components use `bg-background`, `text-foreground`, `border-border`, etc.
- Zinc palette for structure (surfaces, borders, text hierarchy)
- Accent colors ONLY for semantic meaning (status, warning, success)
- One typography system: Inter for UI body, Syne for display/headings, Geist Mono for code/numbers
- Light and dark must both look designed

---

## Typography

### Fonts

| Font           | Usage                                                          |
| -------------- | -------------------------------------------------------------- |
| **Inter**      | All UI body text (default `font-sans`)                         |
| **Syne**       | Display and heading treatments (`font-display` or `font-syne`) |
| **Geist Mono** | IDs, transaction codes, fund codes, currency amounts in tables |

### When to Use Geist Mono (`font-mono`)

Use ONLY when users might:

- Copy a value (transaction IDs, fund codes)
- Compare digits (currency amounts in table columns)
- Scan repeated patterns (IDs, invoice numbers)

**Never** use on: dates, timestamps, general text, labels, descriptions.

### Type Scale

| Element          | Classes                                                                      |
| ---------------- | ---------------------------------------------------------------------------- |
| Page title       | `text-5xl font-black tracking-tighter uppercase lg:text-6xl` (via PageShell) |
| Page description | `text-sm font-bold uppercase tracking-widest text-zinc-400` (via PageShell)  |
| Section title    | `text-base font-semibold`                                                    |
| Card title       | `text-sm font-semibold` or `text-base font-semibold`                         |
| Body             | `text-sm` (14px)                                                             |
| Muted text       | `text-xs text-muted-foreground` or `text-sm text-muted-foreground`           |
| Labels           | `text-xs font-medium` or `text-[10px] font-bold uppercase tracking-widest`   |
| Stat card number | `text-3xl font-black tabular-nums tracking-tight text-zinc-900`              |
| Stat card label  | `text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400`            |
| Table header     | `text-xs font-semibold text-muted-foreground`                                |
| Tabular numbers  | Always add `tabular-nums` class                                              |

---

## Color System

### Zinc Palette (structure)

| Token      | Light Mode     | Usage                       |
| ---------- | -------------- | --------------------------- |
| `zinc-50`  | Background     | App canvas, subtle fills    |
| `white`    | Cards          | Card/panel surfaces         |
| `zinc-100` | Borders, hover | Default borders, hover rows |
| `zinc-200` | Strong borders | Emphasized borders          |
| `zinc-400` | Muted text     | Labels, hints               |
| `zinc-500` | Secondary text | Muted icons                 |
| `zinc-600` | Body text      | Sidebar inactive text       |
| `zinc-700` | Strong text    | Sidebar active text         |
| `zinc-900` | Primary text   | Titles, headings            |
| `zinc-950` | Darkest        | Rarely used                 |

### Accent Colors (meaning only)

| Color            | Usage                      |
| ---------------- | -------------------------- |
| `emerald-500`    | Success status dot         |
| `amber-500`      | Pending/warning status dot |
| `bg-destructive` | Failed/error status        |
| `orange-500`     | Disputed status            |
| `rose-500`       | Notification badge         |

**Rule**: No colored backgrounds on stat cards, icon containers, or decorative elements. Accent colors appear ONLY as small status dots or semantic badges.

---

## Layout & Spacing

### Page Structure

Every page follows this rhythm via `PageShell`:

```
┌──────────────────────────────────┐
│ Header (title + description)     │  ← PageShell header
│ Actions (buttons, right-aligned) │
├──────────────────────────────────┤
│ Stat cards row                   │  ← flex flex-wrap gap-4
├──────────────────────────────────┤
│ Content area                     │  ← space-y-10
│ (table, charts, cards, etc.)     │
└──────────────────────────────────┘
```

### Responsive Padding

```
PageShell: p-4 sm:p-6 lg:p-8
           (16px → 24px → 32px)
```

No `max-w-*` constraint — content fills the available width (sidebar constrains left edge).

### Spacing Scale

| Gap          | Usage                               |
| ------------ | ----------------------------------- |
| `gap-0.5`    | Between menu items                  |
| `gap-2`      | Inline elements, icon + text        |
| `gap-3`      | Button groups, header actions       |
| `gap-4`      | Stat cards, card grids              |
| `gap-6`      | Between header and content sections |
| `space-y-10` | Between major page sections         |

---

## PageShell Component

All module pages wrap in `PageShell` from `@asym/ui/components/primitives/page-shell`.

```tsx
<PageShell
  title="Contributions"
  description="Track and manage all donations and contributions."
  actions={<Button>...</Button>}
>
  <div className="space-y-10">
    {/* stat cards */}
    {/* table/content */}
  </div>
</PageShell>
```

**Do NOT use**: manual headers, `<h1>` tags outside PageShell, the old `PageHeader` component, or the `badge` prop (deprecated).

---

## Stat Cards

Neutral white cards with bold font-black numbers:

```tsx
<div className="flex items-center gap-4 px-6 py-5 rounded-2xl border border-zinc-100 bg-white shadow-sm min-w-[140px]">
  <div className="flex flex-col">
    <span className="text-3xl font-black tabular-nums tracking-tight text-zinc-900">
      $35,000.00
    </span>
    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mt-1">
      Received
    </span>
  </div>
</div>
```

**Rules**:

- No colored backgrounds on stat cards
- Use `font-mono` on stat card values ONLY for currency
- Add staggered `motion.div` entrance animation with `delay: index * 0.06`
- Add `whileHover={{ y: -2 }}` for hover lift

---

## Buttons

### Primary Action

```
h-11 px-6 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800
font-black uppercase tracking-widest text-[10px]
shadow-lg shadow-zinc-200 gap-2
```

### Outline Action

```
h-11 px-4 rounded-xl border-zinc-200 hover:bg-zinc-50
font-bold uppercase tracking-widest text-[10px] gap-2
```

**Rules**:

- One primary action per page (right side of PageShell header)
- Consistent `h-11` height for page-level buttons
- Uppercase text with wide tracking
- Use `gap-2` for icon + label

---

## Sidebar

Follows the pattern from `apps/missionary/components/app-sidebar.tsx`.

### Structure

```tsx
<Sidebar collapsible="icon" className="border-r border-zinc-200/60 bg-white">
  <SidebarHeader>   {/* Logo + org name */}
  <SidebarContent>   {/* NavSection groups */}
  <SidebarFooter>    {/* User avatar + name */}
  <SidebarRail />    {/* Resize handle */}
</Sidebar>
```

### Menu Items

- Use `SidebarMenuButton` with shadcn defaults (no custom size overrides)
- `text-[13px]` for labels, `size-4` for icons (via built-in `[&>svg]:size-4`)
- Active: `isActive` prop + `bg-zinc-100 text-zinc-900 font-medium`
- Inactive: `text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50`
- Use `AppIcon` with `animated={isActive}` for spring entrance on active route
- Use `usePathname()` for active route detection

### Group Labels

```
text-[10px] font-semibold uppercase tracking-wide text-zinc-400
```

### User Footer

Display-only: avatar + name + role. No interactive dropdown (profile dropdown lives in top header).

---

## Tables

Use `DataTableResponsive` from `@asym/ui/components/shadcn/data-table`.

```tsx
<DataTableResponsive
  columns={columns}
  data={data}
  filterFields={filterFields}
  searchKey="donor"
  searchPlaceholder="Search..."
  config={{
    enableRowSelection: true,
    enableColumnVisibility: true,
    enablePagination: true,
    enableFilters: true,
    enableSorting: true,
    enableViewToggle: true,
    enableKeyboardNavigation: true,
  }}
/>
```

### Column Styling

- Donor/name: `text-sm font-semibold text-foreground` (clickable)
- Amount: `font-mono text-sm font-semibold text-foreground tabular-nums` (right-aligned)
- Date: `text-sm text-muted-foreground` (NO font-mono)
- Status: dot indicator (`h-2 w-2 rounded-full`) + text label
- Fund code: `font-mono text-xs text-muted-foreground`
- Transaction ID: `font-mono text-xs text-muted-foreground tabular-nums`

### Column Factory Pattern

```tsx
export function getColumns({ onViewItem }) {
  return [
    /* columns array */
  ];
}
```

---

## Detail Sheets

Side sheet for viewing record details. Uses `Sheet` + `SheetContent` from shadcn.

### Labels

```
text-[9px] font-bold text-muted-foreground uppercase tracking-widest
```

### Values

```
text-sm font-bold text-foreground
```

### Amount Display

```
text-3xl font-black font-mono tabular-nums text-foreground tracking-tight
```

### Action Buttons

```
rounded-xl font-bold uppercase tracking-widest text-[10px] h-9
```

---

## Cards

```
rounded-2xl border border-zinc-100 shadow-sm
```

Module cards (Admin page, Support page): add `hover:-translate-y-1 hover:shadow-lg transition-all duration-300`.

---

## Motion & Animation

Import from `@asym/lib/motion`.

### Transitions

```tsx
const smooth = {
  duration: 0.25,
  ease: [0.25, 0.1, 0.25, 1],
};
```

### Page Entrance (via PageShell)

- Header: `initial={{ opacity: 0, y: -8 }}` → `animate={{ opacity: 1, y: 0 }}`
- Actions: slide-in from right with 100ms delay

### Stat Card Entrance

```tsx
<motion.div
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ ...smooth, delay: index * 0.06 }}
  whileHover={{ y: -2 }}
/>
```

### Content Sections

```tsx
<motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ ...smooth, delay: 0.3 }}
/>
```

### Where Motion Belongs

- ✅ Page entrance (PageShell header)
- ✅ Stat card stagger
- ✅ Content section fade-in
- ✅ Card hover lift (`whileHover: { y: -2 }`)
- ✅ Active sidebar icon (spring scale via AppIcon)
- ✅ Collapsible sub-menu expand/collapse

### Where Motion Does NOT Belong

- ❌ Long page transitions
- ❌ Bounce or overshoot effects
- ❌ Delays that block interaction
- ❌ Every hover (only on interactive cards)

---

## Charts

Use Recharts loaded via `dynamic()` with `ssr: false`.

### Zinc Color Palette for Charts

```
Recurring: #27272a (zinc-800) with gradient
One-Time:  #71717a (zinc-500) with gradient
Offline:   #d4d4d8 (zinc-300)
```

### Chart Styling

- `CartesianGrid`: `stroke="#f4f4f5"` (zinc-100), `vertical={false}`
- `XAxis/YAxis`: `fontSize={10}`, `fontWeight={700}`, `stroke="#a1a1aa"` (zinc-400)
- Tooltip: `borderRadius: 16`, `border: "1px solid #e4e4e7"`, deep shadow
- Bar animation: staggered `animationBegin` (200/400/600ms), `800ms` duration, `ease-out`
- Custom legend with dot indicators below chart

---

## Empty States

```tsx
<div className="text-center py-32 bg-zinc-50/50 border-2 border-dashed border-zinc-200 rounded-[2.5rem]">
  <div className="size-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-zinc-100">
    <Icon className="size-10 text-zinc-200" />
  </div>
  <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Title</h3>
  <p className="text-sm text-zinc-500 mt-2 font-medium">Description</p>
  <Button className="mt-8 ...">CTA</Button>
</div>
```

---

## Icons

- **Standard icons**: Import from `lucide-react`
- **Animated icons**: `lucide-animated` installed for sidebar active states
- **AppIcon wrapper**: Use `@asym/ui/components/shadcn/icons/AppIcon` for icons that need active animation
- Icon size in sidebar: `size-4` (16px) via shadcn default
- Icon size in buttons: `size-4` (16px)
- Icon size in stat cards: not used (numbers speak for themselves)

---

## Accessibility

- Visible focus on every interactive element (`:focus-visible` via globals.css)
- Keyboard navigation in tables, dialogs, selects, popovers
- `aria-label` on icon-only buttons
- Semantic HTML: `<main>`, `<header>`, `<nav>` (via Sidebar)
- Touch targets: minimum 44px on mobile (via `touch-target` utility)

---

## Component Imports

### From `@asym/ui` (shared package)

```tsx
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { DataTableResponsive } from "@asym/ui/components/shadcn/data-table";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Sheet, SheetContent } from "@asym/ui/components/shadcn/sheet";
import { AppIcon } from "@asym/ui/components/shadcn/icons/AppIcon";
import { cn } from "@asym/ui/lib/utils";
```

### From `@asym/lib` (shared library)

```tsx
import { motion } from "@asym/lib/motion";
import { formatCurrency } from "@asym/lib/utils";
```

### Icons

```tsx
import { DollarSign, Users, ... } from "lucide-react";
```

---

## Pages NOT Following PageShell Pattern

These pages use different layout paradigms and are excluded from the PageShell standard:

| Page           | Reason                       |
| -------------- | ---------------------------- |
| Email Studio   | Full-screen Unlayer editor   |
| PDF Studio     | Full-screen Unlayer editor   |
| Web Studio     | Editor + preview rail layout |
| Sign Studio    | TilePage-based layout        |
| Login/Register | Auth flow                    |

---

## Checklist for New Pages

- [ ] Uses `PageShell` wrapper
- [ ] No `slate-*` classes (use `zinc-*`)
- [ ] No hardcoded hex colors
- [ ] Stat cards use neutral white style
- [ ] Buttons follow primary/outline pattern
- [ ] Motion entrance on stat cards and content
- [ ] `font-mono` only on IDs, codes, and currency amounts
- [ ] `tabular-nums` on all numbers
- [ ] Responsive padding (`p-4 sm:p-6 lg:p-8` via PageShell)
- [ ] No `max-w-*` constraint
- [ ] Links use Next.js `Link` component
- [ ] Icons from `lucide-react`
