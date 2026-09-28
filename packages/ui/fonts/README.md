# Shared app fonts

All three Next apps import `fontVariables` from `@asym/ui/fonts` and apply it to
the existing body. Semantic tokens remain in `styles/globals.css`.

These are the same unmodified Inter, Syne and Geist Mono WOFF2 assets returned
for the previous Google loader options on 2026-09-28. The 16 subsets occupy
349,868 bytes. `manifest.json` records exact hashes, source URLs, Unicode
ranges, weights, embedded versions/copyrights and upstream OFL notices.

Each subset has its own literal `next/font/local` call: Next applies custom
declarations and preload to the entire call. Using one source array for several
subsets loses Unicode selection; loading only Latin loses supported glyphs.
Inter and Syne preload Latin only. Geist Mono never preloads. The calls share a
family name and public variable within each font. Next's internal `GeistMono`
identifier names the unchanged Geist Mono bytes, not a replacement typeface.

`fallbacks.css` retains the previous Google loader's three Arial fallback
metrics. Automatic local-font fallback calculation is disabled because it uses
a different metric algorithm. Missing font files still fail compilation.

## Verification

```sh
bunx vitest run tests/unit/packages/ui/local-fonts.test.ts
bun run verify:fonts:offline
```

The offline check requires Linux/WSL, `unshare`, `ip`, the pinned dependencies
and an installed Playwright Chromium. It compiles the actual shared font export
in a network namespace with no external route, verifies browser face loads and
preload hashes, then confirms a missing asset fails. It uses disposable local
fixtures and no application environment files, APIs or data. Unsupported
isolation or missing browser dependencies fail the check rather than skip it.
Normal all-app builds, preflight and relevant E2E remain required.

## Updating assets

Keep each family's upstream `OFL.txt` and the embedded copyright/license
metadata with redistributed assets. The files are SIL Open Font License 1.1;
the captured embedded copyright years can differ from the upstream OFL header,
so preserve both. Do not alter or further subset font binaries as part of an
infrastructure repair.

Treat a font update as an explicit typography change. Capture the exact source
CSS and unmodified assets, retain licenses, refresh manifest hashes/descriptors
and literal loaders together, and rerun offline, browser and application
checks. Do not refresh fonts automatically during installation or compilation.

The permanent local loading avoids the valid extensionless Google URL failure
tracked in https://github.com/vercel/next.js/issues/99114 without patching Next
or changing a version pin.
