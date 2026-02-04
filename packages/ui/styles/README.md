# @asym/ui Styles

This directory contains the shared theme and styles for the @asym/ui package.

## Files

### `theme.css`

The core Maia theme (Soft & Rounded) with Zinc aesthetic. This file contains:

- **CSS Variables**: All color tokens, spacing, and design system variables
- **Light Theme**: Default light mode colors using OKLCH color space
- **Dark Theme**: Dark mode colors with `.dark` class
- **Responsive Breakpoints**: Adaptive spacing and sizing for mobile, tablet, and desktop
- **Base Styles**: Scrollbar styling, focus states, and touch target sizing
- **Utility Classes**: Container and responsive utilities

## Usage in Apps

### Tailwind CSS v4 (Current)

Import the theme in your app's `globals.css`:

```css
@import "tailwindcss";
@import "@asym/ui/styles/theme.css";
```

### Tailwind CSS v3 (Legacy)

If using Tailwind v3, you'll need to convert the CSS variables to a `tailwind.config.js` preset.

## Theme Colors

The theme uses OKLCH color space for perceptually uniform colors:

- **Primary**: Deep zinc (265° hue)
- **Secondary**: Light zinc
- **Muted**: Subtle zinc
- **Accent**: Soft zinc
- **Destructive**: Warm red (25° hue)
- **Charts**: 5 distinct colors for data visualization

## Responsive System

The theme includes a comprehensive responsive design system:

- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
- **Container**: Max-width 1600px with responsive padding
- **Spacing**: Adaptive gaps and section spacing
- **Touch Targets**: 44px minimum (Apple HIG), 48px recommended (Material Design)

## Border Radius

The theme uses a soft, rounded aesthetic:

- **Base**: `--radius: 1rem` (16px)
- **Variants**: sm, md, lg, xl, 2xl (calculated from base)

## Customization

To customize the theme in your app:

1. Override CSS variables in your app's `globals.css`
2. Add app-specific utilities in `@layer utilities`
3. Extend the theme with additional colors or spacing

Example:

```css
@import "@asym/ui/styles/theme.css";

:root {
  /* Override primary color */
  --primary: oklch(0.3 0.1 220);
}

@layer utilities {
  .app-specific-class {
    /* Your custom utilities */
  }
}
```
