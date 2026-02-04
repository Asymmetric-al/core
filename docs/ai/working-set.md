# Working Set (AI)

Agents MUST keep this file updated during a task. Use it to build the Nia query preamble.

## Current objective
- Sweep apps/admin (and other workspaces if possible) for import/dependency drift and add missing deps to workspace package.json files.

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
  - "clsx"
  - "tailwind-merge"
  - "zod"
  - "motion"
  - "@tanstack/react-query"

## Expected behavior
- Each workspace declares every external package it imports; admin build has no module-not-found errors.

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
