# React Component Development — Skill
**Name:** `react-component-dev`
**Purpose:** Build reusable, accessible React components with predictable APIs and ref forwarding.
Use this skill when creating or refactoring components.

**Applies when:** Building new components, refactoring UI components, or defining component APIs.
**Do not use when:** Only editing styles or content in existing components without API changes.

## Rules
- **Composition over configuration:** Prefer `children`/slots over many boolean props.
- **Forward refs:** If a component renders a DOM element, use `forwardRef`.
- **Accessibility:** Use semantic HTML first; add ARIA only when needed.
- **Predictable props:** Follow controlled/uncontrolled conventions.
- **Small and testable:** Extract complex behavior into hooks.

## Workflow
1. Define the component’s responsibility and minimal usage.
2. Choose the API shape (controlled vs uncontrolled as needed).
3. Implement with semantic HTML and accessibility defaults.
4. Add `forwardRef` for DOM-rendering components.
5. Extract complex behavior into hooks if needed.

## Checklists

### Implementation checklist
- [ ] Component has a single responsibility
- [ ] DOM components forward refs
- [ ] Semantic HTML used
- [ ] Keyboard interaction works
- [ ] Props follow React conventions

### Review checklist
- [ ] API is small and composable
- [ ] Example usage is included

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

### Compound component
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

## Common mistakes / pitfalls
- Missing `forwardRef` on input-like components
- Using `div` for buttons/links
- Overloading components with boolean props
- Shipping components without a minimal usage example
