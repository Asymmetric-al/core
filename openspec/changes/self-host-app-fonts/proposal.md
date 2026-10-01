# Self-host the existing app fonts

Tracking: [AL-1914](https://github.com/Asymmetric-al/core/issues/1914).

## Why

Valid extensionless Google Fonts URLs can make the pinned Next compiler fail.
This affects the shared root layout before application routes can render.

## What Changes

- Check in the existing Inter, Syne and Geist Mono assets with OFL notices and
  hash provenance; load them through the supported local-font API in shared UI.
- Preserve all weights, Unicode subsets, fallback metrics, public font
  variables and preload choices across the three apps.
- Prove the real shared export compiles and loads fonts without network access;
  missing font files remain hard failures.

## Impact

- New capability: `app-font-delivery`.
- Affected: shared UI fonts, three root layouts, font verification and docs.
- No font/design or framework upgrade, provider/data operation, auth change,
  routing change or replacement of an existing CI gate.
- Rollback: revert the font delivery commit; that restores the previous Google
  compiler dependency and its known failure, so requalify builds before use.
