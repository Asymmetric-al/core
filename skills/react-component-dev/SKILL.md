---
name: react-component-dev
description: Use this skill whenever creating/refactoring **React components** with strong: composition patterns, accessibility defaults, predictable props and ref forwarding citeturn4view1.
---

# React Component Development — Skill

**Name:** `react-component-dev`

Use this skill whenever creating/refactoring **React components** with strong:
- composition patterns
- accessibility defaults
- predictable props and ref forwarding citeturn4view1

---

## Goal

Produce **reusable, accessible, well-structured** components.

Priorities:
1. API design (props + composition)
2. Accessibility and keyboard support
3. Ref forwarding when rendering DOM
4. Maintainable file organization

---

## Core principles

### 1) Composition over configuration
- Prefer `children`, slots, and render props over huge prop enums
- Make the “happy path” easy, but allow escape hatches

### 2) Forward refs by default for DOM-wrapping components
- If the component renders a DOM element, use `forwardRef`
- Expose the correct element type via generics

### 3) Accessibility first
- Keyboard interactions (focus, enter/space where appropriate)
- ARIA only when needed; prefer semantic elements
- Respect reduced motion

### 4) Predictable props
- Prefer controlled/uncontrolled conventions (`value`/`defaultValue`, `onChange`)
- Avoid boolean prop explosions; group behavior into a single prop object when needed

### 5) Keep components small and testable
- Split complex behavior into hooks
- Keep rendering pure; side-effects in hooks

---

## Common mistakes to prevent

- Not forwarding refs for input-like components
- Using `div` for buttons/links
- Props that encode styling variants without a consistent pattern
- Complex components without a minimal example usage

---

## Review checklist

- [ ] Component has a clear single responsibility
- [ ] DOM-rendering components forward refs
- [ ] Uses semantic HTML (button, a, input, dialog)
- [ ] Keyboard interaction works
- [ ] Props align with React conventions
- [ ] Example usage included (copy/paste)

---

## Minimal examples

### forwardRef pattern
```tsx
import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={[variant === "ghost" ? "bg-transparent" : "bg-black text-white", className]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
```

### Compound component (slot-like API)
```tsx
export function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border p-4">{children}</div>;
}
export function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 font-semibold">{children}</div>;
}
export function CardBody({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
```

---

## How to apply this skill

When asked to build a component:
1. Define the component’s job and minimal usage first
2. Decide controlled/uncontrolled needs
3. Implement with semantic HTML + a11y
4. Add `forwardRef` if it renders DOM
5. Extract behavior into hooks when complexity grows
