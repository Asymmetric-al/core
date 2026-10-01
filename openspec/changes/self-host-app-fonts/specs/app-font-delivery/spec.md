## ADDED Requirements

### Requirement: App fonts compile and load from reviewed local assets

The admin, donor and missionary applications SHALL load their shared fonts from
reviewed repository assets without a Google Fonts request during compilation or
browser font loading. Asset updates SHALL retain source, hash and license
provenance. Missing required font files MUST fail compilation.

#### Scenario: The compiler has no external network

- GIVEN the pinned dependencies and reviewed font assets are installed
- WHEN the shared font export is compiled without external network access
- THEN compilation succeeds using the repository assets
- AND the browser can load the expected font faces from the same application

#### Scenario: A required font file is missing

- GIVEN a required asset is absent from the source tree
- WHEN the font export is compiled
- THEN compilation fails instead of silently substituting a fallback

### Requirement: Local delivery preserves existing typography

The application font contract SHALL retain Inter weights 300, 400, 500, 600 and
700, Syne weights 400, 500, 600, 700 and 800, and Geist Mono weights 100 through 900. It SHALL preserve the existing 16 Unicode subset assets, 56 face
descriptors, three metric-adjusted Arial fallbacks, swap display and public
`--font-inter`, `--font-syne`, `--font-geist-mono` variables. Only the Inter and
Syne Latin assets SHALL preload; Geist Mono and all other subsets SHALL load on
demand. Internal compiler-generated family/class names are not public tokens.

#### Scenario: A multilingual page uses all configured weights

- WHEN a page requests a supported weight and Unicode subset
- THEN the matching original font asset loads with the retained descriptors
- AND the existing semantic font tokens resolve to that font family

#### Scenario: A page begins loading

- WHEN the root layout is rendered
- THEN exactly the Inter and Syne Latin files are preloaded
- AND the existing fallback metrics apply until those web fonts load
