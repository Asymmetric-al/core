# Ultracite Code Standards (Reference)

Adapted from upstream:
https://github.com/haydenbleasel/ultracite/blob/HEAD/skills/ultracite/references/code-standards.md

## Core Principles

Write code that is accessible, performant, type-safe, and maintainable.
Prefer clarity and explicit intent over cleverness.

## Type Safety & Explicitness

- Prefer explicit types where they improve readability.
- Prefer `unknown` over `any` when type is not yet known.
- Use `as const` for immutable literals and stable unions.
- Prefer narrowing and guards over unsafe assertions.
- Extract magic numbers into well-named constants.

## Modern JavaScript / TypeScript

- Prefer `const`; use `let` only for reassignment; never use `var`.
- Prefer arrow functions for callbacks and small helpers.
- Prefer `for...of` over `.forEach()` in iteration-heavy logic.
- Prefer template literals over string concatenation.
- Prefer optional chaining (`?.`) and nullish coalescing (`??`).
- Avoid enums; prefer objects + `as const`.
- Avoid nested ternaries.

## Async & Promises

- Always await promises in async functions.
- Prefer async/await over promise chains when practical.
- Handle async errors intentionally (`try/catch` or propagated errors).
- Do not use async functions as Promise constructors/executors.

## React & JSX

- Use function components.
- Call hooks only at the top level.
- Keep hook dependency arrays complete and correct.
- Use stable `key` values for lists (avoid array index keys).
- Avoid defining components inside other components unless required.
- Use semantic HTML and ARIA-friendly structures.

## Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` from production paths.
- Throw `Error` objects with meaningful messages.
- Prefer early returns to deeply nested conditionals.

## Security

- Add `rel="noopener"` with `target="_blank"`.
- Avoid `dangerouslySetInnerHTML` unless absolutely required.
- Do not use `eval()` or direct `document.cookie` mutation patterns.
- Validate and sanitize user input.

## Performance

- Avoid spread accumulation in loops.
- Hoist regex literals/constants outside loops.
- Prefer specific imports over broad namespace imports.
- Avoid barrel-file overuse in hot code paths.

## Formatting / Style Baseline

- 2-space indentation
- LF line endings
- 80-character line width (target)
- Semicolons enabled
- Double quotes (single quotes in JSX where required by toolchain)
- ES5 trailing commas
- Kebab-case filenames where applicable

## Testing Hygiene

- Keep assertions inside test cases (`it` / `test` blocks).
- Avoid committed `.only` / `.skip`.
- Prefer async/await in async tests over callback-style completion.
