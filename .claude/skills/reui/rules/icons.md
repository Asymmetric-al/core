# Icons (ReUI delta over shadcn)

<!-- BEGIN:core-reui-overlay -->

## Core usage

Core config uses `iconLibrary: "lucide"` and imports `lucide-react`. Pro
unlocks blocks; Motion Icons require Ultimate for discovery and install. Keep
Lucide for current work, preserve accessible labels and reduced-motion rules,
and do not introduce another icon library to follow a demo's imports.

<!-- END:core-reui-overlay -->

Use the project's configured `iconLibrary`, put `data-icon="inline-start"` on an icon before the label inside `Button` (`data-icon="inline-end"` on one after it), put no sizing classes on icons inside components, and pass icons as components, not string keys. ReUI adds the following.

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

ReUI ships its own icon set in 4 styles (outline, solid, duotone, filled). Every icon installs from the default path; some also have a real hover animation (motion/react) on the animated path:

```bash
npx shadcn@latest add @reui/icons/default/<style>/<name> --yes    # static, every icon
npx shadcn@latest add @reui/icons/animated/<style>/<name> --yes   # hover-animated, only when the icon has installAnimated
```

The animated path answers for every icon, but for an icon without a real animation it installs the same static drawing, so only use it when the icon carries `installAnimated`.

Motion Icons need an Ultimate license for **both discovery and install** (`REUI_LICENSE_KEY`, see [cli.md](./cli.md)). Without it `search_icons` comes back `locked` with no results and `search` returns no icons at all, so check the plan before you promise the user icons: on a free or Pro account, use the project's own `iconLibrary` instead. On Ultimate, a Motion Icon on the primary action is the 1 hover flourish (see [motion.md](./motion.md)).

Finding icons:

- Several icons (the common case): **`search_icons(concepts[])`** - up to 24 concepts in one call, the best icons per concept with install commands. Pass `animated: true` to get only icons with a real hover animation; a concept with none comes back empty and `animatedNote` says so.
- One icon: `search` with `type: "icon"`.
- Icon results and `get_icon` carry `animated: true` and `installAnimated` only when the icon really animates - use those install strings, do not construct paths by hand.
- Every icon result carries a `previewUrl` (the icon's own page) and a `thumbnail` (its 4 styles side by side) - **show or share them** so the user can SEE the icon before installing, and look at the thumbnail yourself before trusting a name.
- Several icons can fit one concept. Before installing, read `get_icon`'s `whenNotToUse` (each entry names the icon to use instead), and use its `label` as the `aria-label` of an icon-only button.
- Icon names were revised in the icons v2 update. An old name (`save-2`, `abstract-18`) still answers in `get_icon`, `get_install_command`, `validate_usage` and `get_thumbnail` with the icon it became and `renamedFrom`, and still installs that same drawing; write the current name in new code. That includes names renamed because they misdescribed the drawing (`watch` installs a sand timer, `chevrons-down` points up), so look at the `thumbnail` before trusting an old name. `search_icons` answers an old name the same way, unless it is also an ordinary word icons are named for today (`watch`): then it ranks today's icons for the word, and `oldNameNotes` names the icon the old name installs. `search` ranks by current names only, so look an old name up with `get_icon`, never `search`. Only `tag` (it drew a money bag) no longer answers: the reply names the icons to use instead.

The `icon-stack` component composes multiple icons into a stacked display.
