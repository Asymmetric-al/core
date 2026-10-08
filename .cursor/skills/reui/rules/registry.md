# ReUI registry structure

<!-- BEGIN:core-reui-overlay -->

## Core usage

`packages/ui/components.json` is authoritative: authenticated `@reui` object,
exact `base-maia`, Base UI, Zinc-oriented semantic tokens. The same configured
namespace handles free items and Pro blocks; do not toggle it to a plain string
between installs. Core's account is Pro, so Motion Icons remain Ultimate-only.
Account entitlement is separate from source-distribution permission. Core is
public and AGPL-3.0-only. The repository owner confirmed a separate agreement
covering public distribution of Pro block source and modified derivatives,
including contributors; see
`docs/guides/development/reui-source-license.md` for the recorded permission.
Use fitting Pro blocks with commercial-source provenance, and public MIT
components/hooks/examples with their notices. Do not infer rights to templates,
Ultimate icons, or distribution outside the confirmed scope. See
https://reui.io/legal/license.
The MCP style must resolve to `base-maia` (use `?style=base-maia` or
`X-Reui-Style`); `get_project_context` can confirm it. `@reui` is a shadcn
registry namespace, not a ReUI npm package. Templates are page downloads.
See [Core workflow](../SKILL.md#this-repository-asymmetric-alcore).

<!-- END:core-reui-overlay -->

ReUI is a shadcn-compatible registry with four entity types. **Examples and blocks are built FROM components** - reuse them, don't rebuild.

- **component** - one of the 24 ReUI building blocks with a real API (`data-grid`, `kanban`, `filters`, `date-selector`, `tree`, ...). Install directly (`@reui/data-grid`) or let it come in as a dependency of an example/block. Free. Read its API with `get_component(name)`.
- **example** - a free `c-*` single-pattern use-case of a component (`c-kanban-1`, `c-data-grid-3`). Install one and read it to copy real composition. Find a component's examples with `get_examples(name)`.
- **block** - a premium, full-page section that composes several components (`data-grid-base-2`, `settings-2`). Pro or Ultimate license at install. Adapts to your active theme via semantic tokens.
- **icon** - Motion Icons in 4 styles (outline, solid, duotone, filled), static (`@reui/icons/default/<style>/<name>`) and hover-animated (`@reui/icons/animated/<style>/<name>`). Ultimate license at install. See [icons.md](./icons.md).

## The @reui registry

ReUI items install through the shadcn CLI as `npx shadcn@latest add @reui/<name> --yes`, with `<name>` exactly as a ReUI tool returned it (`search`, a getter, `get_install_command`). The CLI reads the `@reui` registry from the project's `components.json`. Free items need only the plain string form:

```json
{ "registries": { "@reui": "https://reui.io/r/{style}/{name}.json" } }
```

Premium installs need the authenticated form + `REUI_LICENSE_KEY` in `.env.local` - see [cli.md](./cli.md). The MCP `get_project_context` tool returns the right config.

## ReUI items vs shadcn/ui components

- **ReUI items** (the 24 components, `c-*` examples, blocks, Motion Icons) install as `@reui/<name>`.
- **shadcn/ui components** that ReUI builds on (`button`, `dialog`, `select`, `card`, ...) are not ReUI items. They install from shadcn by bare name: `npx shadcn@latest add button --yes`.
- **`badge` and `alert` exist in both registries.** `@reui/badge` and `@reui/alert` are ReUI's components (the extra variants in [components.md](./components.md)); bare `badge` and `alert` are shadcn's.
- **In an item's `registryDependencies`**, a `@reui/<name>` entry is a ReUI item and a bare name is a shadcn/ui item. `add` installs both for you.
- **Templates are not registry items.** Download one from its page on reui.io (https://reui.io/templates?ref=skill); no `shadcn add` command installs a template.

## Know your base: base or radix

ReUI ships every item in two builds - `base` (Base UI) and `radix` (Radix UI) - with mirrored names. The CLI installs the build matching your project automatically, but **you must write code against the right base's API**. Detect it from `components.json` -> `style`: the segment before the first `-` is the base (`base-nova` -> Base UI, `radix-nova` -> Radix UI). The installed files and `c-*` examples are already in your base - read them and adapt on that base. See [components.md](./components.md) for the API deltas.

**So the MCP's own `docsUrl` and `previewUrl` match your base**, send your `style` to the MCP: add `?style=<your components.json style>` to the ReUI MCP server URL (or set an `X-Reui-Style` header) in your MCP client config - set once, applies to every call. The MCP then resolves docs/preview links to YOUR library (`/docs/components/radix/...`, `/preview/radix/...` for a radix project) instead of the default base; `get_project_context` echoes back the style it currently sees so you can confirm it. Install commands are unaffected (the CLI already installs the right variant). If you notice the MCP returning `base` links for a `radix` project, tell the user to add `?style=` to the server URL.

Blocks adapt to your active theme through semantic tokens and CSS variables - change the theme and every block follows.

## Free vs premium

- **Free, no license key:** the 24 components, all `c-*` examples, and this skill. The MCP is free too but still needs a free ReUI account (the agent signs in on first use); a license key is only for premium installs.
- **Premium, license required at install:** blocks (Pro or Ultimate) and Motion Icons (Ultimate). Set `REUI_LICENSE_KEY` (see [cli.md](./cli.md)).
- **Templates** are downloads, not installs: free ones need only a ReUI account, and each template's page on reui.io says what the others need.

## Component API index

The canonical index of every component's API docs is **https://reui.io/llms.txt** (returned as `componentsApiUrl` in MCP results). Prefer the inline `api` from `get_component`; use the index/docs as the fallback.
