---
name: base-ui
description: "Build accessible, composable UI with @base-ui/react primitives and project styling tokens. Use when creating or refining unstyled primitive components and behavior-heavy UI such as overlays, menus, popovers, dialogs, and form controls, or defining custom component APIs. Prefer the moai-library-shadcn skill when copied-in shadcn components are the primary implementation path."
---

# Base UI Primitives - Skill

**Name:** `base-ui`
**Purpose:** Build accessible, composable UI with `@base-ui/react` primitives and project styling tokens.
Use this when creating or refining unstyled primitive components and behavior-heavy UI.

**Applies when:** Building overlays, menus, form controls, or custom component APIs with Base UI.
**Do not use when:** You are using copied-in shadcn components as the primary implementation path (use `moai-library-shadcn` first).

## Rules

- **Docs first:** Start from [reference-links.md](reference-links.md), then read the exact component page before writing code.
- **Behavior before styling:** Preserve Base UI interaction and accessibility behavior before adding project styles.
- **Styling agnostic:** Keep logic and visuals decoupled; prefer wrappers and class composition over forking behavior code.
- **Tailwind compatibility:** Base UI examples target Tailwind v4. If a target package uses v3, convert unsupported utilities to v3-safe equivalents.
- **Composable APIs:** Favor controlled/uncontrolled patterns, small props, and clear slots over monolithic components.
- **A11y is non-negotiable:** Keep labels, descriptions, focus handling, keyboard support, and ARIA relationships intact.
- **Styled wrapper contracts:** Preserve state-based `className`/`style`, `render`, refs, and cancelable events. Use `packages/ui/lib/base-ui.ts` to merge a Base UI class callback after receiving state; ordinary `cn`/CVA calls do not evaluate it.
- **Forms:** Keep TanStack Form as the validation/submission owner. Base UI Field can supply accessible relationships without adding a second Form state system. Group labels name a group; they are not labels for Select/Combobox controls.

## Workflow

1. Confirm `@base-ui/react` is present in the target workspace `package.json`.
2. Open the exact docs page from [reference-links.md](reference-links.md) for the primitive you need.
3. Implement behavior with Base UI primitives first, then layer project styles (`cn`, tokens, Tailwind).
4. Convert any Tailwind v4-only example classes if the target workspace is still on Tailwind v3.
5. Validate keyboard navigation, focus states, and screen-reader output.
6. Run local quality gates (typecheck/lint/tests relevant to changed scope).

## Checklists

### Implementation checklist

- [ ] Primitive choice matches the interaction model (dialog/menu/select/etc.)
- [ ] Controlled/uncontrolled behavior is explicit and testable
- [ ] Styling is layered without breaking interaction semantics
- [ ] Tailwind classes are compatible with the target package version
- [ ] Labels, descriptions, and focus behavior are preserved

### Review checklist

- [ ] No unnecessary re-implementation of behavior primitives
- [ ] No prop explosion; component API stays composable
- [ ] Keyboard-only interaction works end-to-end
- [ ] Error/help text is correctly announced for form fields

## Minimal examples

### Wrapper-first composition

```tsx
import { Field } from "@base-ui/react/field";

type FieldShellProps = {
  label: string;
  error?: string;
  children: React.ReactNode;
};

export function FieldShell({ label, error, children }: FieldShellProps) {
  return (
    <Field.Root invalid={Boolean(error)} className="grid gap-1.5">
      <Field.Label className="text-sm font-medium">{label}</Field.Label>
      {children}
      {error ? (
        <Field.Error match className="text-sm text-destructive">
          {error}
        </Field.Error>
      ) : null}
    </Field.Root>
  );
}
```

Use a Base UI-aware control such as the shared `Input` inside this shell. Core's
existing TanStack adapter already handles the product form case; reuse it instead
of adding another field wrapper. The static shadcn Field layout parts also support
display-only content and should not be globally replaced with behavioral Field.

### Tailwind v4 to v3 guardrail

```txt
When docs examples rely on Tailwind v4-only utilities,
replace them with equivalent v3-safe utilities before commit.
```

## Common mistakes / pitfalls

- Styling first, then patching broken interactions later
- Copying examples without checking Tailwind version compatibility
- Mixing multiple primitive systems in one component without intent
- Building large wrapper components with too many boolean props
