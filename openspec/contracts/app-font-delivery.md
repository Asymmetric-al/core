# app-font-delivery normative contract clauses

A section is binding only when the matching requirement unconditionally references
it. A proposed or historical section does not become accepted by residing here.
The reference, requirement identity, scenarios, and normal source-authority rules
form one contract. Preserve all clauses; see openspec/contracts/README.md.

<!-- prettier-ignore-start -->

<a id="contract-d7c0d738a3e0ce3cf763"></a>

## Local delivery preserves existing typography

<!-- BEGIN CONTRACT {"id":"d7c0d738a3e0ce3cf763","name":"Local delivery preserves existing typography"} -->

The application font contract SHALL retain Inter weights 300, 400, 500, 600 and
700, Syne weights 400, 500, 600, 700 and 800, and Geist Mono weights 100 through 900. It SHALL preserve the existing 16 Unicode subset assets, 56 face
descriptors, three metric-adjusted Arial fallbacks, swap display and public
`--font-inter`, `--font-syne`, `--font-geist-mono` variables. Only the Inter and
Syne Latin assets SHALL preload; Geist Mono and all other subsets SHALL load on
demand. Internal compiler-generated family/class names are not public tokens.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->
