---
title: Component Documentation
impact: MEDIUM
impactDescription: Adoption and developer experience
tags: documentation, jsdoc, examples, api-reference, accessibility-docs
---

## Component Documentation Guide

Create documentation that makes components accessible and easy to use.

### Essential Sections

#### 1. Overview

Brief introduction explaining what the component does:

```markdown
# Button

A versatile button component with multiple variants and sizes. Use for primary actions,
secondary actions, or destructive operations.
```

#### 2. Demo and Source Code

Include live demos with code:

```tsx
import { Button } from "@asym/ui/components/shadcn/button";

export function ButtonDemo() {
  return (
    <div className="flex gap-2">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
    </div>
  );
}
```

#### 3. Installation

For a justified Core addition, use the installed pinned CLI from repository root
and target `packages/ui`; app consumers import `@asym/ui`. The external npm
installation line below is publishing background, not a new Core dependency:

```bash
# shadcn/ui CLI
bunx --no-install shadcn add button --cwd packages/ui

# npm
npm install @acme/ui-components
```

#### 4. Features

List key capabilities:

```markdown
## Features

- **Customizable** – Adjust styles, sizes, and behavior
- **Accessible** – Keyboard navigation, ARIA, screen reader support
- **Composable** – Works with other components
- **Type-safe** – Comprehensive TypeScript types
- **Theming** – Integrates with design tokens
```

#### 5. Examples

Show variants, states, and advanced usage:

```tsx
// Variants
<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Destructive</Button>

// States
<Button disabled>Disabled</Button>
<Button disabled={isLoading} aria-busy={isLoading}>
  {isLoading ? "Saving…" : "Save"}
</Button>

// With icon
<Button><Icon /> Save</Button>
```

#### 6. Props/API Reference

Derive the complete contract from `React.ComponentProps<typeof Button>` and its
current source. The table below illustrates common props/values, not an
exhaustive or independent API definition:

```markdown
| Prop       | Type                                             | Default     | Description           |
| ---------- | ------------------------------------------------ | ----------- | --------------------- |
| `variant`  | `"default" \| "secondary" \| "destructive"`      | `"default"` | Visual style          |
| `size`     | `"sm" \| "default" \| "lg"` (common subset)      | `"default"` | Existing size axis    |
| `disabled` | `boolean`                                        | `false`     | Disabled state        |
| `onClick`  | `React.ComponentProps<typeof Button>["onClick"]` | -           | Native action handler |
```

#### 7. Accessibility

Document a11y features:

```markdown
## Accessibility

- **Keyboard** - Enter/Space activation
- **ARIA** - Proper roles and attributes
- **Focus** - Visible `:focus-visible` indicators
- **Contrast** - WCAG AA (4.5:1)
```

#### 8. Changelog

Track versions. The changelog below is generic documentation background for a
hypothetical external component, not the release history or props of Core Button:

```markdown
## Changelog

### v2.0.0

**Breaking:** `variant` uses `"default"` instead of `"primary"`

### v1.2.0

- Added `isLoading` prop
- Added `icon` prop
```

### Best Practices

**Use Real-World Examples:**

```tsx
// ✅ Real-world
function UserProfile({ user }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={() => editUser(user.id)}>Edit Profile</Button>
      </CardContent>
    </Card>
  );
}

// ❌ Too abstract
<Button onClick={handleClick}>Button</Button>;
```

**Include Troubleshooting:**

```markdown
## Troubleshooting

**Button not responding:**

- Ensure `onClick` handler is provided
- Check if `disabled` is set
- Verify no parent is capturing events
```

**Link Related Components:**

```markdown
## Related

- [`IconButton`](/components/icon-button)
- [`ButtonGroup`](/components/button-group)
```

**Make Examples Runnable:**

```tsx
// ✅ Complete client example
"use client";
import { Button } from "@asym/ui/components/shadcn/button";
import { useState } from "react";

export function CounterButton() {
  const [count, setCount] = useState(0);
  return (
    <Button onClick={() => setCount((current) => current + 1)}>
      Count: {count}
    </Button>
  );
}
```

### Documentation Checklist

- [ ] Clear overview
- [ ] Live demo
- [ ] Installation instructions
- [ ] Feature list
- [ ] Multiple examples
- [ ] Complete API reference
- [ ] Accessibility docs
- [ ] Changelog
- [ ] Troubleshooting
- [ ] Related components
- [ ] All examples runnable
