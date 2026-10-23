---
title: Accessibility Guidelines
impact: CRITICAL
impactDescription: Essential for inclusive component design
tags: accessibility, a11y, aria, keyboard, screen-reader, focus, wcag
---

## Accessibility Guidelines

Accessibility (a11y) is not optional—it's a fundamental requirement. Every component must be usable by everyone, including people with visual, motor, auditory, or cognitive disabilities.

### Core Principles

#### 1. Semantic HTML First

Always start with the most appropriate HTML element:

**Incorrect (generic div):**

```tsx
<div onClick={handleClick} className="button">
  Click me
</div>
```

**Correct (semantic element):**

```tsx
<button onClick={handleClick}>Click me</button>
```

#### 2. Keyboard Navigation

Every interactive element must be keyboard accessible:

```tsx
import { Button } from "@asym/ui/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";

<DropdownMenu>
  <DropdownMenuTrigger render={<Button type="button" variant="outline" />}>
    Project actions
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={handleOpen}>Open project</DropdownMenuItem>
    <DropdownMenuItem onClick={handleSettings}>
      Project settings
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>;
```

#### 3. Screen Reader Support

Use ARIA attributes when necessary:

```tsx
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/" aria-current="page">Home</a></li>
  </ul>
</nav>

<div aria-live="polite" aria-atomic="true">
  {isLoading && <span>Loading results...</span>}
</div>
```

#### 4. Visual Accessibility

Support users with visual impairments. Shared controls own their focus
presentation; the CSS below illustrates semantic token mechanics for an
authorized host owner, not a global override of Core controls:

```css
/* Visible focus indicators */
button:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

/* Sufficient color contrast (4.5:1 for normal text) */
.text {
  color: var(--foreground);
  background: var(--background);
}
```

### ARIA Rules

1. **Don't use ARIA if you can use semantic HTML**
2. **Don't change native semantics unless necessary**
3. **All interactive elements must be keyboard accessible**
4. **Don't hide focusable elements** - Never use `aria-hidden="true"` on focusable elements
5. **All interactive elements must have accessible names**

### Component Patterns

#### Modal/Dialog

```tsx
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@asym/ui/components/shadcn/dialog";

<Dialog>
  <DialogTrigger render={<Button type="button" variant="outline" />}>
    Project details
  </DialogTrigger>
  <DialogContent>
    <DialogTitle>Project details</DialogTitle>
    <DialogDescription>Review the project before continuing.</DialogDescription>
    The existing content supplies its accessible close control.
  </DialogContent>
</Dialog>;
```

#### Dropdown Menu

```tsx
import { Button } from "@asym/ui/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";

<DropdownMenu>
  <DropdownMenuTrigger render={<Button type="button" />}>
    Menu
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={handleOpen}>Open item</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>;
```

#### Tabs

```tsx
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@asym/ui/components/shadcn/tabs";

<Tabs defaultValue="details">
  <TabsList aria-label="Project information">
    <TabsTrigger value="details">Details</TabsTrigger>
    <TabsTrigger value="history">History</TabsTrigger>
  </TabsList>
  <TabsContent value="details">Project details</TabsContent>
  <TabsContent value="history">Project history</TabsContent>
</Tabs>;
```

### Focus Management

Verify focus entry, containment and restoration through the existing primitive.
The following generic CSS is host-authoring background; do not redeclare shared
focus styles globally in an app.

```css
/* Show outline only for keyboard focus */
*:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
```

### Live Regions

```tsx
// Polite announcement
<div role="status" aria-live="polite">{savedMessage && "Saved"}</div>

// Assertive announcement
<div role="alert" aria-live="assertive">{errorMessage}</div>
```

### Common Pitfalls

**Placeholder as labels:**

```tsx
// ❌ Placeholder disappears
<input placeholder="Email address" />

// ✅ Persistent label
<label>Email address <input type="email" /></label>
```

**Empty buttons:**

```tsx
// ❌ No accessible name
<button><TrashIcon /></button>

// ✅ Screen reader text
<button aria-label="Delete item"><TrashIcon aria-hidden="true" /></button>
```

**Disabled elements:**

```tsx
import { Button } from "@asym/ui/components/shadcn/button";

// The form owns submission; Button owns native disabled behavior.
<>
  <Button type="submit" disabled={!isValid} aria-describedby="submit-help">
    Submit
  </Button>
  <span id="submit-help">{!isValid && "Fill required fields"}</span>
</>;
```

### Mobile Accessibility

```css
/* Minimum 44x44px touch targets */
.button {
  min-height: 44px;
  min-width: 44px;
}
```

```html
<!-- Allow zooming -->
<meta name="viewport" content="width=device-width, initial-scale=1" />
```
