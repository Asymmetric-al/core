# Responsive Design System

This document defines the responsive design standards for the Asymmetric.al platform. Following these guidelines ensures consistent, perceptually uniform layouts across all screen sizes.

## Design Philosophy

1. **Perceptual Consistency**: Spacing and sizing should "feel" the same across devices, not just be mathematically identical
2. **Fluid Typography**: Text scales smoothly between breakpoints using `clamp()`
3. **Touch-First**: Mobile interactions are prioritized with adequate touch targets
4. **Content-Driven**: Breakpoints are based on content needs, not device dimensions

## Breakpoints

| Name | Width   | Usage                            |
| ---- | ------- | -------------------------------- |
| xs   | < 640px | Mobile phones                    |
| sm   | 640px+  | Large phones, small tablets      |
| md   | 768px+  | Tablets                          |
| lg   | 1024px+ | Small laptops, tablets landscape |
| xl   | 1280px+ | Laptops, desktops                |
| 2xl  | 1536px+ | Large desktops                   |

```tsx
import { BREAKPOINTS } from "@/lib/responsive";
// BREAKPOINTS = { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 }
```

## CSS Variables

The system uses CSS custom properties that automatically adjust at each breakpoint:

```css
/* Spacing automatically scales with breakpoint */
--gap-xs    /* 4px → 8px */
--gap-sm    /* 8px → 12px */
--gap-md    /* 12px → 20px */
--gap-lg    /* 16px → 24px */
--gap-xl    /* 24px → 32px */

/* Section and container spacing */
--section-gap      /* 16px → 24px → 32px */
--card-padding     /* 12px → 16px → 24px */
--container-padding /* 16px → 24px → 40px */

/* Touch targets (fixed, not responsive) */
--touch-target-min: 44px;
--touch-target-recommended: 48px;
```

## Utility Classes

### Containers

```tsx
// Standard responsive container (max-width: 1600px)
<div className="container-responsive">

// Narrow container (max-width: 56rem)
<div className="container-narrow">

// Wide container (max-width: 80rem)
<div className="container-wide">
```

### Spacing

```tsx
// Section gap (vertical spacing between sections)
<div className="section-gap">  // flex column with responsive gap

// Grid gap (responsive gap for grids)
<div className="grid-gap">     // gap: var(--gap-md)
<div className="grid-gap-sm">  // gap: var(--gap-sm)
<div className="grid-gap-lg">  // gap: var(--gap-lg)

// Card padding (responsive padding)
<div className="card-padding"> // padding: var(--card-padding)
```

### Typography

```tsx
// Fluid typography (scales smoothly)
<h1 className="text-responsive-display">  // 2.5rem → 4.5rem
<h1 className="text-responsive-h1">       // 1.5rem → 2.25rem
<h2 className="text-responsive-h2">       // 1.25rem → 1.875rem
<h3 className="text-responsive-h3">       // 1.125rem → 1.25rem
<p className="text-responsive-body">      // 0.875rem → 1rem
<span className="text-responsive-small">  // 0.75rem → 0.875rem
<span className="text-responsive-caption">// 0.625rem → 0.75rem
```

### Grids

```tsx
// Responsive grids with automatic column changes
<div className="grid-responsive-2">  // 1 col → 2 cols (md)
<div className="grid-responsive-3">  // 1 → 2 (md) → 3 (lg)
<div className="grid-responsive-4">  // 1 → 2 (sm) → 3 (lg) → 4 (xl)
<div className="grid-12">            // 1 col → 12 cols (lg)
```

### Touch Targets

```tsx
// Ensure adequate touch target size
<button className="touch-target">    // min 44x44px
<button className="touch-target-lg"> // min 48x48px

// Automatic on touch devices
// All buttons, links get min-height: 44px via @media (pointer: coarse)
```

### Visibility

```tsx
<div className="hide-mobile">       // hidden sm:block
<div className="hide-tablet">       // hidden md:block
<div className="hide-desktop">      // block lg:hidden
<div className="show-mobile-only">  // block sm:hidden
<div className="show-tablet-only">  // hidden sm:block lg:hidden
<div className="show-desktop-only"> // hidden lg:block
```

### Flex

```tsx
// Stack on mobile, row on larger
<div className="flex-responsive">         // flex-col sm:flex-row
<div className="flex-responsive-reverse"> // flex-col-reverse sm:flex-row
```

## React Hooks

```tsx
import {
  useIsMobile, // < md (768px)
  useIsTablet, // md to lg (768-1024px)
  useIsDesktop, // >= lg (1024px)
  useBreakpoint, // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  useResponsive, // { isMobile, isTablet, isDesktop, breakpoint, width }
} from "@/hooks/use-mobile";
```

## Best Practices

### 1. Use Responsive Containers

```tsx
// ✅ Good - uses responsive container
<main className="container-responsive py-responsive-section">

// ❌ Bad - fixed padding doesn't scale
<main className="px-4 py-6">
```

### 2. Use Fluid Typography

```tsx
// ✅ Good - scales smoothly
<h1 className="text-responsive-h1">Title</h1>

// ❌ Bad - jumpy breakpoint changes
<h1 className="text-xl md:text-2xl lg:text-3xl">Title</h1>
```

### 3. Ensure Touch Targets

```tsx
// ✅ Good - adequate touch target
<button className="h-10 px-4 touch-target">Click</button>

// ❌ Bad - too small on mobile
<button className="h-6 px-2">Click</button>
```

### 4. Stack on Mobile, Side-by-side on Desktop

```tsx
// ✅ Good - uses responsive flex
<div className="flex-responsive">
  <Card />
  <Card />
</div>

// ❌ Bad - always horizontal, cramped on mobile
<div className="flex">
  <Card />
  <Card />
</div>
```

### 5. Use CSS Variables for Custom Responsive Values

```tsx
// ✅ Good - leverages the responsive system
<div style={{ gap: 'var(--gap-lg)' }}>

// ❌ Bad - doesn't scale with breakpoint
<div style={{ gap: '16px' }}>
```

## Page Template

```tsx
export default function ExamplePage() {
  return (
    <div className="section-gap">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="text-responsive-h1">Page Title</h1>
        <p className="text-responsive-small text-muted-foreground">
          Description text
        </p>
      </div>

      {/* Content Grid */}
      <div className="grid-responsive-3">
        <Card className="card-padding">Content</Card>
        <Card className="card-padding">Content</Card>
        <Card className="card-padding">Content</Card>
      </div>

      {/* Two-Column Layout */}
      <div className="grid-12">
        <div className="lg:col-span-8">Main content</div>
        <div className="lg:col-span-4">Sidebar</div>
      </div>
    </div>
  );
}
```

## Testing Checklist

When implementing responsive designs:

- [ ] Test at 320px width (smallest mobile)
- [ ] Test at 375px width (iPhone SE/mini)
- [ ] Test at 768px width (tablet)
- [ ] Test at 1024px width (laptop)
- [ ] Test at 1440px width (desktop)
- [ ] Test at 1920px width (large desktop)
- [ ] Verify touch targets are at least 44px on mobile
- [ ] Check text is readable at all sizes (min 14px)
- [ ] Ensure no horizontal scrolling at any width
- [ ] Test with device toolbar in DevTools

## Files Reference

- `src/app/globals.css` - CSS variables and utility classes
- `src/lib/responsive.ts` - TypeScript constants and utilities
- `src/hooks/use-mobile.ts` - React hooks for responsive behavior
