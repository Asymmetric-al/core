# Design

`packages/ui/fonts` owns the existing typography and exports `fontVariables`.
The apps apply those variables to the existing body. Semantic font tokens and
all providers remain as they are.

The Google subset option controls preloading, not the full available glyph
coverage. Preserve all 16 subset files and 56 face descriptors. Each subset has
a literal local-font call because Unicode declarations and preload apply to an
entire call, not an individual source. The same internal family and public
variable are used across each family's modules, so Unicode selection remains a
single family. Geist Mono receives Next's internal identifier `GeistMono`; its
original bytes and the public `--font-geist-mono` variable remain unchanged.

Keep the three existing Arial metric fallback faces explicitly. The local
loader's automatic metric algorithm differs from Google's cached metrics;
allowing it to recalculate would change fallback layout. These fallback faces
are not replacements for missing web-font assets.

The manifest records captured CSS/asset URLs and hashes, embedded version and
copyright metadata, OFL source files, descriptors and representative glyphs.
Assets remain unmodified. Updating fonts is an explicit reviewed change.

The offline verifier builds the real shared export in an isolated Linux network
namespace, checks browser font loads and exact preload hashes, and proves a
missing file fails in a separate copied fixture. It never starts Core routes or
uses application credentials. Existing CI, all-app builds and smoke gates are
still required before integration.
