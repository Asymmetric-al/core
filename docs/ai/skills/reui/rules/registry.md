# ReUI registry structure

ReUI is a shadcn-compatible registry with four entity types. **Examples and blocks are built FROM components** - reuse them, don't rebuild.

- **component** - one of the 17 ReUI building blocks with a real API (`data-grid`, `kanban`, `filters`, `date-selector`, `tree`, ...). Install directly (`@reui/data-grid`) or let it come in as a dependency of an example/block. Free. Read its API with `get_component(name)`.
- **example** - a free `c-*` single-pattern use-case of a component (`c-kanban-1`, `c-data-grid-3`). Install one and read it to copy real composition. Find a component's examples with `get_examples(name)`.
- **block** - a premium, full-page section that composes several components (`data-grid-2`, `pricing-page-1`). Pro or Ultimate license at install. Adapts to your active theme via semantic tokens.
- **icon** - Motion Icons in 4 styles (outline, solid, duotone, filled), static (`@reui/icons/default/<style>/<name>`) and hover-animated (`@reui/icons/animated/<style>/<name>`). Ultimate license at install. See [icons.md](./icons.md).

## The @reui registry

Install everything through the shadcn CLI: `npx shadcn@latest add @reui/<name> --yes`. The CLI reads the `@reui` registry from the project's `components.json`. Free items need only the plain string form:

```json
{ "registries": { "@reui": "https://reui.io/r/{style}/{name}.json" } }
```

Premium installs need the authenticated form + `REUI_LICENSE_KEY` in `.env.local` - see [cli.md](./cli.md). The MCP `get_project_context` tool returns the right config.

## Know your base: base or radix

ReUI ships every item in two builds - `base` (Base UI) and `radix` (Radix UI) - with mirrored names. The CLI installs the build matching your project automatically, but **you must write code against the right base's API**. Detect it from `components.json` -> `style`: the segment before the first `-` is the base (`base-nova` -> Base UI, `radix-nova` -> Radix UI). The installed files and `c-*` examples are already in your base - read them and adapt on that base. See [components.md](./components.md) for the API deltas. Blocks adapt to your active theme through semantic tokens and CSS variables - change the theme and every block follows.

## Free vs premium

- **Free, no key:** the 17 components, all `c-*` examples, the ReUI MCP, and this skill.
- **Premium, license required at install:** blocks (Pro or Ultimate), Motion Icons and templates (Ultimate). Set `REUI_LICENSE_KEY` (see [cli.md](./cli.md)).

## Component API index

The canonical index of every component's API docs is **https://reui.io/llms.txt** (returned as `componentsApiUrl` in MCP results). Prefer the inline `api` from `get_component`; use the index/docs as the fallback.
