## Context

Base UI 1.8.0 is the latest npm release with no newer beta/RC. Core uses 31 shared TSX modules importing Base UI, yet direct unused Radix dependencies and application-local behavior remain. The latest quick start requires app content isolation outside body portals and absolute backdrops on a relatively positioned body for Safari 26.

## Decisions

- Keep an exact shared release and the existing base-maia/Zinc configuration. Do not replace source files wholesale from the registry.
- Shared wrappers own primitive behavior. Apps compose the wrappers; upgrades must preserve existing control values and callbacks.
- Isolate each application content root while body portals remain siblings. Keep existing popup positioning and motion.
- Prioritize controls with real consumers and missing keyboard semantics. Retain native inputs/simple forms and specialist command search, OTP compatibility, toast, chart, calendar, editor, map, and resizing libraries where replacing them would not improve a demonstrated workflow.
- Verify dependency and API compatibility with focused behavior tests and consumer typechecks, then preflight and browser checks. Browser engine simulation is not physical iOS Safari proof.

## Risks and rollback

A shared minor-version upgrade affects every popup/control consumer. New focus, render typing, and mounting behavior can expose wrapper assumptions; run all consumer checks. App root wrappers can change flex/grid behavior and stacking; preserve root dimensions and test portal placement. Revert manifests, lockfile, wrapper/app changes, and tests together to return to the prior baseline.
