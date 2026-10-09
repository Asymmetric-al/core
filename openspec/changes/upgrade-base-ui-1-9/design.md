## Context

AL-1985 upgrades the shared Base UI baseline from 1.8.0 to the published 1.9.0 release dated October 9, 2026. `packages/ui` and `apps/admin` declare direct dependencies; the donor and missionary apps consume shared wrappers. The earlier `complete-base-ui-adoption` change remains active and owns the broader adoption/compliance work.

`EmailStudioMergeTagMenu` already searches registry definitions by key, label, or category and inserts the selected key. Its ordinary input and scroll container currently sit inside a regular dropdown menu. Base UI 1.9.0 supplies preview filterable-menu parts that can own input/list keyboard coordination, highlight state, query reset, clearing, and empty announcements.

## Goals / Non-Goals

Goals are consistent exact dependencies, a reusable Maia-compatible filtering composition, unchanged merge-tag matching/insertion behavior, and bounded release compatibility evidence. Non-goals are a new primitive system, redesigning menu geometry or tokens, changing the merge-tag registry, migrating unrelated controls, and repeating the full 1.8 documentation compliance audit.

## Decisions

### Keep filtering in shared wrappers

Add the five filtering parts to the existing dropdown-menu module. Preserve Base UI refs, state callbacks, render composition, event cancellation, and upstream props. Use the existing semantic input/menu styles and `data-highlighted` state styling. Ordinary menus remain compatible; searchable submenus can compose their own provider when needed.

### Preserve the merge-tag search contract explicitly

Wrap the existing menu root in `DropdownMenuFilterProvider` with a controlled query and `filter={null}`. Continue filtering definitions in the consumer using the existing trimmed, case-insensitive substring check across key, label, and category. Base UI's default rendered-text filter would change that contract, so it does not perform a second filtering pass.

Use the shared filtering input, list, and empty parts in the merge-tag menu. The shared clear part remains available to other filtering compositions and has direct regression coverage. Keep the search input's accessible name, the merge-tag heading's semantic group, the disabled trigger, the existing ordering, and item callbacks. Keyboard movement highlights visible items; Enter inserts their exact key once. Closing resets the query without insertion; Escape closes and restores trigger focus.

### Accept upstream compatibility improvements through existing APIs

Existing generic Select and Combobox root wrappers forward upstream props, so readonly multiple-value input arrays become supported without a new adapter. The upgrade also supplies list/Strict Mode registration, async highlighting, disabled-trigger, popup focus/animation, slider touch, and drawer fixes through existing primitives.

The release changes `onItemHighlighted` event typing to native keyboard events and `MouseEvent | PointerEvent` for pointer highlights, with typing/clearing using reason `none`. Passing `actionsRef` no longer disables automatic unmounting for Combobox, Autocomplete, Select, or Navigation Menu; external animations must opt out with `preventUnmountOnClose()` and complete with `unmount()`. The current first-party source audit found neither callback nor actions-ref usage needing migration. Record that audit result rather than introducing unused lifecycle handlers.

### Keep release evidence scoped

Verify the published version against official releases/package metadata, exact manifest/lock agreement, new public wrapper behavior, the real merge-tag consumer, and affected workspace types. Use focused red-green tests for the new menu behavior, relevant existing Base UI tests, browser keyboard/focus/empty-state checks, and applicable repository gates. Capture actual results and limits; successful component checks do not qualify every app route or physical iOS keyboard behavior.

Official compatibility sources:

- [1.9.0 release notes](https://base-ui.com/react/overview/releases/v1-9-0)
- [Filterable menus and existing-menu behavior](https://github.com/mui/base-ui/pull/5527)
- [Filtering provider contract at 1.9.0](https://github.com/mui/base-ui/blob/v1.9.0/packages/react/src/menu/filter-provider/MenuFilterProviderOptions.ts)
- [Explicit popup-unmount migration](https://github.com/mui/base-ui/pull/5734)
- [Highlight event compatibility](https://github.com/mui/base-ui/pull/5838)
- [Readonly multiple-value arrays](https://github.com/mui/base-ui/pull/5710)

## Risks / Trade-offs

Filtering is an upstream preview API and may evolve; keep adoption behind shared wrappers and test the public composition. A shared dependency upgrade can affect consumers beyond the changed menu; affected typechecks and existing browser contracts remain part of verification. Custom registry matching must remain authoritative when the provider receives `filter={null}`. Do not describe unrun mobile-device or provider checks as passed.

## Migration and Rollback

There is no data migration, new API, store, job, authorization boundary, or email-send action. `packages/ui` owns primitive interaction; `packages/email` continues to own registry definitions; the caller continues to own insertion through `onInsert(key)`. Revert the exact dependency/lock changes, shared filtering parts, consumer composition, and associated tests together to return to the prior 1.8.0 behavior. Keep this OpenSpec change active until accepted implementation is merged.
