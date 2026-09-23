## Context

Base UI 1.8.0 is the latest npm release with no newer beta/RC. Core uses 31 shared TSX modules importing Base UI, yet direct unused Radix dependencies and application-local behavior remain. The latest quick start requires app content isolation outside body portals and absolute backdrops on a relatively positioned body for Safari 26.

## Decisions

- Keep an exact shared release and the existing base-maia/Zinc configuration. Do not replace source files wholesale from the registry.
- Shared wrappers own primitive behavior. Apps compose the wrappers; upgrades must preserve existing control values and callbacks.
- Isolate each application content root while body portals remain siblings. Keep existing popup positioning and motion.
- Audit all applicable shared contracts and actual consumers. Native simple forms and specialist command search, toast, chart, calendar, editor, map, and resizing libraries keep their distinct documented responsibilities. Shared Input, Number Field, and OTP wrappers use the corresponding Base UI behaviors; TanStack Form retains validation and submit ownership.
- Verify dependency and API compatibility with focused behavior tests and consumer typechecks, then preflight and browser checks. Browser engine simulation is not physical iOS Safari proof.
- Merge className callbacks after Base UI supplies live state, rather than passing functions into ordinary class merging. Forward style callbacks, render props, refs, and cancelable events without narrowing the primitive API.
- Keep static Field layout parts compatible with display-only and standalone usage. Compose Base UI Field in the TanStack adapter to bind real labels, descriptions, errors, and control state.
- Use explicit menu groups around the related labels and items. ScrollArea Content owns content-size observation inside Viewport. Verify wrapper anatomy and dynamic behavior against the installed 1.8 implementation.
- Classify documentation requirements as applicable, conditional, or outside Core's current interaction model. A downloaded page, successful typecheck, or isolated fixture does not by itself prove every consumer works.

## Risks and rollback

A shared minor-version upgrade affects every popup/control consumer. New focus, render typing, and mounting behavior can expose wrapper assumptions; run all consumer checks. App root wrappers can change flex/grid behavior and stacking; preserve root dimensions and test portal placement. Revert manifests, lockfile, wrapper/app changes, and tests together to return to the prior baseline.
