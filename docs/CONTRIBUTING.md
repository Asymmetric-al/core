# Contributing Guide

Welcome to the Asymmetric.al codebase! This guide will help you get started quickly.
The "Give Hope" tenant you may see in the UI is a demo/test frontend and not the organization.

## Quick Start

Follow the canonical Quickstart in `README.md`:

```bash
./scripts/setup
# set these required values in .env.local:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
bun run dev
./scripts/verify
```

Stripe credentials are optional and only required when testing donation flows.

Optional MCP tooling configuration for contributors is documented in `docs/mcp-config.example.toml`.

### Nia (MCP) usage (repo-scoped)

If you use Nia for repo search, follow the canonical policy in [AGENTS.md#nia-mcp-usage-always-repo-scoped](../AGENTS.md#nia-mcp-usage-always-repo-scoped). Short version:

- Contributors use their own Nia API key and subscribe to the public `Asymmetric-al/core` indexed source (never share keys).
- Keep `docs/ai/working-set.md` updated and use `docs/ai/stack-registry.md` to select accurate stack tags.
- Nia search calls must include the required preamble at the top of the `query` string.
- Always scope Nia tool calls to `Asymmetric-al/core`; if you must search outside, justify it and then run a scoped pass back inside this repo.

---

## Contribution Model (Forks + PRs only)

- Contributors are not added to the GitHub org/team for this repo.
- All contributions must come from forks via pull requests (PRs) to the upstream repo.
- PRs must target the `develop` branch (never `main`).
- Maintainers review and merge PRs; direct pushes to protected branches are not allowed.

## Fork + PR Workflow (Required)

1. **Fork the repo (GitHub UI)**
   - Open `Asymmetric-al/core` and click **Fork** → **Create fork**.
2. **Clone your fork**

```bash
git clone https://github.com/<your-username>/core.git
cd core
```

3. **Add the upstream remote**

```bash
git remote add upstream https://github.com/Asymmetric-al/core.git
```

4. **Create a feature branch from upstream `develop`**

```bash
git fetch upstream
git checkout -b feature/AL-123-short-description upstream/develop
```

5. **Commit and push to your fork**

```bash
git add -A
git commit -m "AL-123: <summary>"
git push -u origin feature/AL-123-short-description
```

6. **Open a PR to upstream `develop` (GitHub UI)**
   - From your fork, click **Compare & pull request** (or **New pull request**).
   - Base repo: `Asymmetric-al/core` → base branch: `develop`.
   - Head repo: `<your-username>/core` → compare branch: your feature branch.

## Keep Your Fork in Sync

```bash
git fetch upstream
git checkout develop
git rebase upstream/develop
git push origin develop
```

If you do not have a local `develop` branch yet:

```bash
git checkout -b develop upstream/develop
git push -u origin develop
```

## When Changes Are Requested

- Check out your feature branch.
- Apply the requested changes locally.
- Commit and push to your fork; the PR updates automatically.

## Security & Maintainers

- Only maintainers can merge to `main`.
- PRs require review and required checks before merge.
- Direct pushes to protected branches are not allowed.

---

## Development Workflow

### Before You Code

1. **Sync with upstream `develop`**: `git fetch upstream` → `git checkout develop` → `git rebase upstream/develop`
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Understand the area**: Read relevant code and check [ARCHITECTURE.md](./ARCHITECTURE.md)

### While Coding

1. **Run type checking**: Keep `bun run typecheck` passing
2. **Follow patterns**: Match existing code style in the file/module
3. **Test locally**: Verify changes work on desktop and mobile viewports

### Before Committing

```bash
# Always run these before committing
bun run format
bun run format:check
bunx turbo run lint typecheck  # Cached checks via Turborepo
```

### PR Checks (Required)

- **Required checks:** `CI / format`, `CI / lint`, `CI / typecheck`, `CI / build`, `CI / test-unit`.
- **Informational only:** `CI / test-e2e (non-blocking)` must not be required for merge.

Maintainers must configure branch protection (Settings → Branches → Require status checks to pass) to require only the checks above and to exclude E2E.

### Local Verification (Before PR)

```bash
bun run format
bun run format:check
bunx turbo run lint typecheck build
bun run test:unit
```

---

## Code Standards

### TypeScript

- **Strict mode enabled** - All code must pass strict type checking
- **No `any` types** - Use `unknown` or proper types instead
- **Explicit return types** - For exported functions
- **Interface over type** - For object shapes (unless union/intersection needed)

```typescript
// Good
interface UserProps {
  name: string;
  email: string;
}

export function formatUser(user: UserProps): string {
  return `${user.name} <${user.email}>`;
}

// Avoid
export function formatUser(user: any) {
  return `${user.name} <${user.email}>`;
}
```

### React Components

- **Named exports** - Prefer `export function Component()` over `export default`
- **Props interface** - Define props interface above component
- **Hooks first** - All hooks at the top of the component
- **No inline functions in JSX** - Extract to handlers or use `useCallback`

```typescript
// Good
interface ButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
}

export function SubmitButton({ label, onClick, disabled }: ButtonProps) {
  return (
    <Button onClick={onClick} disabled={disabled}>
      {label}
    </Button>
  )
}
```

### Styling (Tailwind CSS)

- **Mobile-first** - Start with mobile styles, add responsive modifiers
- **Use design tokens** - Prefer `zinc-*` colors, `rounded-xl`, etc.
- **Consistent spacing** - Use responsive padding: `p-3 sm:p-4 lg:p-6`
- **Utility classes** - Use globals.css utilities: `container-responsive`, `section-gap`

```typescript
// Good - responsive, uses design system
<Card className="p-4 sm:p-6 rounded-xl border-zinc-200">

// Avoid - hard-coded values, not responsive
<Card className="p-[17px] rounded-[9px] border-gray-300">
```

### Imports

Order imports as follows:

1. React/Next.js
2. Third-party libraries
3. Internal absolute imports (`@/...`)
4. Relative imports
5. Types (with `type` keyword)

```typescript
// 1. React/Next
import { useState, useEffect } from "react";
import Link from "next/link";

// 2. Third-party
import { format } from "date-fns";

// 3. Internal absolute
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks";
import { cn } from "@/lib/utils";

// 4. Relative
import { MetricCard } from "./metric-card";

// 5. Types
import type { User } from "@/types";
```

---

## Turborepo Workflow

Turborepo orchestrates tasks and enables caching where appropriate. Local scripts still work, but Turbo is the recommended path for consistency with CI.

### Common Commands

```bash
# Local dev
bunx turbo run dev

# Cached checks
bunx turbo run lint typecheck build

# Format fix
bun run format

# Format check
bun run format:check
```

Lint caching does not require restored outputs; restoring the ESLint cache is optional.

### Remote Cache (Internal Only)

Remote caching uses **Vercel Remote Cache** and is enabled for internal PRs and `main` branch CI. Fork PRs are not supported.

- **CI env vars** (stored in GitHub secrets/vars, never committed):
  - `TURBO_TOKEN` (secret)
  - `TURBO_TEAM` (team slug; variable or secret)
