# Base UI adoption

Audited for AL-1894 on 2026-09-22 against current `develop`, installed source, the [official releases](https://base-ui.com/react/overview/releases), [quick start](https://base-ui.com/react/overview/quick-start), and Core's Base UI/shadcn skills.

## Version and ownership

`packages/ui` owns the exact `@base-ui/react` **1.8.0** dependency. The npm registry lists only `latest: 1.8.0`; there is no newer published beta or release candidate. Per-commit canaries are available but no identified fix requires one. App workspaces consume shared UI and do not need separate Base UI dependencies. Unused direct Radix tabs and visually-hidden dependencies were removed.

The Maia style, Zinc base, semantic CSS variables, shared aliases, and registries are unchanged. A dependency contract test rejects divergent Base UI pins and direct competing Radix dependencies. Transitive Radix packages remain inside specialist upstream packages; those are not first-party primitive imports.

## Covered behavior

| Area                        | Shared ownership and audit outcome                                                                                                                                                                                                                                                                             |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Overlays                    | Dialog, AlertDialog, Sheet, Drawer, Popover, Tooltip, HoverCard already use Base UI. All app content roots now isolate their stacking contexts from body portals; modal backdrops use absolute positioning over a relative body.                                                                               |
| Navigation and selection    | Accordion, Collapsible, menus, NavigationMenu, Tabs, RadioGroup, Select, Checkbox, Switch, Slider, Toggle and ToggleGroup already use Base UI. NavigationMenu state styling now matches the actual attributes.                                                                                                 |
| Display and utilities       | Avatar, Progress, ScrollArea, Separator, Button, and render/prop composition already use Base UI. New upstream props remain available through the wrappers' primitive types and prop forwarding.                                                                                                               |
| Searchable filter selection | Single/multiple filter controls, table facets, and Support Hub labels now use a shared Base UI Combobox and 1.8 `createItems`, retaining string IDs, label search, icons, counts, clearing, and controlled callbacks. Multiple selection exposes proper selected states; chip removal no longer nests buttons. |
| Care                        | Keyboard shortcuts now use shared Dialog focus/dismissal behavior. The profile's TabsList fixes a missing-context crash. Unused local primitive forks were removed after verifying the sole live compatibility consumer.                                                                                       |
| Giving                      | Checkout and worker preset amounts use shared RadioGroup keyboard selection; payment-method tabs use shared Tabs and associated panels. Existing custom amount and payment-processing behavior remains covered.                                                                                                |

Task partner selection also uses the shared Combobox with stable donor IDs, so duplicate names can be selected independently. A named clear button replaces the inaccessible clickable SVG. Its extraction leaves existing task form and persistence ownership unchanged.

## Intentional boundaries

Utilization means assigning real interaction behavior to the appropriate shared primitive, not mounting every library component or replacing every native element.

- Native input, textarea, label, fieldset and simple form markup remains appropriate. TanStack Form and Zod own complex form state and validation; replacing that with a second form state system would change established contracts. Numeric/money parsing requires separate product-specific decisions, not a generic NumberField swap.
- `cmdk` remains the command/search engine, inside shared Base UI dialogs/popovers. Its command matching is a distinct responsibility. New selection controls should prefer the shared Combobox; command palettes are not selection fields.
- Sonner remains the existing app notification API. Replacing dozens of notification callsites with Base UI Toast would be a separate behavior migration.
- The exported `input-otp` compatibility component has no current product consumer. The official [shadcn Base UI OTP component](https://ui.shadcn.com/docs/components/base/input-otp) still uses that library. Base UI's stable OTPField is available for a future real OTP workflow; no unused parallel wrapper is added.
- Calendars, charts, maps, rich-text/email editors, carousels, and resizing retain their specialist libraries. Base UI does not replace those complete domains.
- CheckboxGroup, Autocomplete, Meter, NumberField, Toolbar, and other unused parts are available from the pinned package when a concrete interaction needs them. Existing progress displays and native forms do not require new APIs solely to increase coverage.

## Verification and limits

Behavior coverage belongs in the focused shared UI, care, and donor tests. The full preflight includes all consumer typechecks, builds, and unit tests. Browser evidence separately checks overlay stacking, focus, keyboard selection, and responsive layout. A simulated mobile viewport or WebKit run does not establish physical iOS 26 Safari browser-chrome coverage; that remains a device QA check.

Rollback is a single revert of the upgrade/adoption change, including manifests, lockfile, wrappers, app consumers, and tests. No schema migration, environment variable, provider setting, or data mutation is introduced.
