# Block Intake

This folder is for **temporary intake** of external UI blocks/components before adapting them to project conventions.

## Workflow

1. **Intake**: Copy external block code into `_intake/<source>/<name>.tsx`
2. **Adapt**: Modify to match project conventions (imports, theming, icons, motion)
3. **Promote**: Move adapted component to its final location (`components/ui/`, `features/`, etc.)
4. **Delete**: Remove the intake copy after merge

## Directory Structure

```
_intake/
├── README.md
├── shadcn/           # Blocks from shadcn/ui registry
│   └── example.tsx
├── magic-ui/         # Blocks from Magic UI
│   └── example.tsx
└── custom/           # Custom or other sources
    └── example.tsx
```

## Conventions

- Use named exports (not default exports)
- Update imports to use project aliases (`@/components/ui`, `@/lib/utils`)
- Replace icon imports with `@/components/ui/icons`
- Apply motion via `@/components/ui/motion-preset` when needed
- Follow existing component patterns in `components/ui/`

## Important

- **Do not import intake components** from production code
- Intake files are temporary and should be deleted after adaptation
- Run `npm run typecheck` before promoting to ensure no errors
