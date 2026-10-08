# Icons (ReUI delta over shadcn)

<!-- BEGIN:core-reui-overlay -->

## Core usage

Core config uses `iconLibrary: "lucide"` and imports `lucide-react`. Pro
unlocks blocks; Motion Icons require Ultimate for discovery and install. Keep
Lucide for current work, preserve accessible labels and reduced-motion rules,
and do not introduce another icon library to follow a demo's imports.

<!-- END:core-reui-overlay -->

Follow the shadcn icon rules (use the project's configured `iconLibrary`, `data-icon` on icons inside `Button`, no sizing classes on icons inside components, pass icons as component objects not string keys). ReUI adds the following.

## Portable icons (library-agnostic)

ReUI components, examples, and blocks are authored to be icon-library-agnostic. The shadcn CLI installs each item's icons in the library named by `iconLibrary` in `components.json` - you swap nothing. When `iconLibrary` is not set, the CLI falls back to `lucide`, so the icons arrive as `lucide-react` imports. If that is not the project's library, set `iconLibrary` before installing, or change the **import source and component name** to your library, keeping the same icon-name semantics (each key below is an `iconLibrary` value):

- `lucide` -> `lucide-react`
- `tabler` -> `@tabler/icons-react`
- `phosphor` -> `@phosphor-icons/react`
- `remixicon` -> `@remixicon/react`
- `hugeicons` -> icons from `@hugeicons/core-free-icons`, rendered through `HugeiconsIcon` from `@hugeicons/react`

Don't assume `lucide-react`: read `iconLibrary` from `components.json`, and when it is unset, check which icon package the project already uses.

## Keep icons purposeful

Icons support the hierarchy, they don't replace it: keep them small, matched to the surrounding density, and decorative ones `aria-hidden="true"` (an icon-only control still needs an accessible label on the control). Don't add ornamental icons that do no job.

## Motion Icons (the `@reui/icons/...` set)

ReUI ships its own icon set in 4 styles (outline, solid, duotone, filled), each icon in two variants:

```bash
npx shadcn@latest add @reui/icons/default/<style>/<name> --yes    # static
npx shadcn@latest add @reui/icons/animated/<style>/<name> --yes   # hover-animated (motion/react)
```

Motion Icons need an Ultimate license for **both discovery and install** (`REUI_LICENSE_KEY`, see [cli.md](./cli.md)). Without it `search_icons` comes back `locked` with no results and `search` returns no icons at all, so check the plan before you promise the user icons: on a free or Pro account, use the project's own `iconLibrary` instead. Reach for a Motion Icon on a primary action when a subtle hover cue helps; keep motion restrained.

Finding icons:

- Several icons (the common case): **`search_icons(concepts[])`** - up to 24 concepts in one call, the best icons per concept with install commands. Pass `animated: true` to get only icons with a hover-animated Motion variant.
- One icon: `search` with `type: "icon"`.
- Icon results and `get_icon` carry `animated: true` and `installAnimated` when an animated variant exists - use those install strings, do not construct paths by hand.
- Every icon result carries a `previewUrl` (its live icon-category page) - **share it with the user** so they can SEE the icon before installing.

The `icon-stack` component composes multiple icons into a stacked display.
