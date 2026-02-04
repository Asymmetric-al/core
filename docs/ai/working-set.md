# Working Set (AI)

Agents MUST keep this file updated during a task. Use it to build the Nia query preamble.

## Current objective
- Audit workspace source imports vs declared dependencies and add missing deps (apps/admin + packages/ui priority) to fix module resolution in Vercel/Next builds.

## Repo scope
- repository: Asymmetric-al/core
- in-scope paths (if known):
  - apps/
  - packages/
  - tooling/
  - bun.lock
  - package.json

## Stack tags (pick from docs/ai/stack-registry.md)
- Next.js
- React
- TypeScript
- Bun
- Turborepo

## Known identifiers (exact strings)
- files:
  - package.json
  - bun.lock
- symbols:
  - dependencies
  - devDependencies
  - peerDependencies
- routes:
  - N/A
- error strings:
  - "Module not found"
  - "Can't resolve"
  - "Cannot find module"
- package ids:
  - "@asym/ui"
  - "@radix-ui/react-visually-hidden"
  - "@tanstack/react-query"
  - "@tanstack/react-db"

## Expected behavior
- Each workspace declares all external packages it imports; module resolution succeeds in CI/Vercel.

## Constraints
- runtime: Node.js
- tooling: Bun/Turborepo
- env/platform notes:
  - No app code refactors; only dependency declarations and bun.lock updates.
  - Avoid adding deps to repo root unless the import is root-only.
  - Rules source of truth: docs/ai/rules/* (treat .cursor/rules/* as legacy).

## Verification
- bun install
- bun run build:admin

## Nia query preamble (fill before calling Nia)
Repo: Asymmetric-al/core
Goal: Audit workspace imports vs declared dependencies for module resolution failures
Area: apps/, packages/, tooling/
Stack: Next.js, React, TypeScript, Bun, Turborepo
Keywords: package.json, dependencies, devDependencies, peerDependencies, "Module not found", "Can't resolve", "@radix-ui/react-visually-hidden", "@tanstack/react-query", "@tanstack/react-db"
Constraints: dependency-only edits; no code refactors; cite exact files + imports
Evidence required: file paths + missing package names + brief explanation
