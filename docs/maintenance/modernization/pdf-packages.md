# Imported PDF packages

Owner [react-PDF PR #25](https://github.com/Asymmetric-al/react-PDF/pull/25)
merged as `1a224e14dea72cd8539c3547bb5c55ffc0bf39d2`. All five post-merge
workflows passed. Core local qualification passes: frozen installation, full preflight, all three
app builds and the full browser matrix. Current-head review/CI, deployed previews
and Core merge remain required.

## Source and release identity

The five consumed packages are **0.1.0**, built from committed source
`cc171a147b8deef364bac8b5b70bb70410766f4f`. Release documentation was committed in
`7f5e5900f0455ac088c01ba60326be745c733aac`; it changes no package/build inputs.
The merge commit is not the artifact build commit.

[Core's receipt](pdf-package-provenance.json) binds archives, directories,
source/lock identities and the immutable owner release-record URL.
[The owner record](pdf-owner-release.json) is copied verbatim, with SHA256
`18903e239c7da83facfcf4a0efe1338e4f9b62611670d41de217c8ea57ca8576`.
Its dated qualification limits remain historical evidence. All packages include
upstream MIT licenses.

Bundled package readmes are immutable owner bytes. Their relative `docs/` and
`src/` links require the owner checkout; those paths are not in Core's packed
subset. Use the [pinned owner maintenance/source guide](https://github.com/Asymmetric-al/react-PDF/tree/7f5e5900f0455ac088c01ba60326be745c733aac/docs/maintenance/core-pdf-modernization)
for reconstruction, package source and owner build instructions.

Owner recovery preserves Core's shipped Phase 47 functionality: 53 runtime
sources were restored verbatim from committed source maps and 20 erased
type/reexport sources from shipped declarations. Reconstruction provenance and
baseline artifact hashes live in the owner's
`docs/maintenance/core-pdf-modernization/` records.

## Dependencies and installation

Core and the imported editor use React Email editor **1.7.14**, Tiptap **3.32.0**
and Zod **4.6.7**. Owner builds use Node **24.22.1**, pnpm **12.14.0** and product
TypeScript **7.0.2**. The maintained **6.0.3** compiler API is confined to the owner
declaration builder and Core's documented AST tooling.

Core installs versioned `file:*.tgz` archives through Bun. Unchanged local-directory
paths reproduced stale dependency metadata in Bun's lockfile during upgrade;
versioned archive identities resolve the reviewed graph correctly. Extracted
copies remain available for inspection and must match the owner inventories.
Owner-only dev declarations retained by pnpm pack are separately inventoried in
`dependencies.json`; Bun does not install dependency packages' devDependencies.
The owner's private `tsconfig@0.0.0` workspace is source configuration.

The PDF npm aliases and file-package repair script are removed after a fresh
frozen installation proves public editor/Zod resolution without them. Core's
separate workspace-link repair remains build infrastructure: cached Turbo
outputs can hollow links between app builds. Its removal requires separate
cached-build and supported-platform qualification.

The normal Bun family refresh also removes all retained Tiptap3.31.4 identities,
uses one ProseMirror transform1.12.3 and model1.25.12, and updates source-map-js
1.2.2 and socket.io-parser4.2.7 within upstream ranges. The installed React Email
CLI chain also uses Socket.IO4.8.4, adapter2.5.8, Engine.IO6.6.11, esbuild0.28.2
and fast-uri3.1.9. No new overrides or unused direct dependencies are introduced.

[The complete dependency disposition ledger](pdf-dependency-dispositions.json)
accounts for all282 installed family identities:215 current stable selections,
60 current maxima required by upstream parent constraints, five owner releases,
current24.x Node typings, and one shared peer selection. Payload's current public
v4 UI pins Floating UI DOM1.7.6 exactly; both Tiptap peers support it, and no
ordinary PDF child is stale. Core CMS/shared-editor maintainers own this verified
compatibility dependency. Engine.IO/Socket.IO's current parents require ws~8.21,
qualified at8.21.3; Ajv's current parents require fast-uri3, qualified at3.1.9.
Every parent/lock/advisory change triggers requalification. No forced override,
unused direct dependency or undocumented permanent hold is introduced.

## Verification and preservation

Baseline Core installation and 27 existing behavior cases passed before import.
New identity regressions failed on the old editor/Zod copies. A fresh frozen
install now preserves lock SHA256
`266bf5acfe2eb096459585a45ef5745b81c1e937951e2d3c7249701a62302233`.
All five package boundaries, eight installed/runtime cases including fresh Node
ESM/CJS processes and the real editor load/getJSON/getEmail round trip pass.
The initial cohort passed 125 focused cases; final combined qualification adds
the actual Email Studio adapter and accessibility regressions. Sixteen focused
Chromium cases cover keyboard formatting, complete custom-node HTML round trips,
ordinary rules, read-only behavior and axe accessibility across desktop/mobile
and light/dark reduced-motion projects. A Core-owned standard Tiptap extension
provides persistent names without replacing attribute functions or handlers;
real-editor regressions preserve selection and document contents. Email export
metadata now identifies the installed1.7.14 builder and is checked against the
consuming manifest. The final cold install passes133 cases across12 files and
all five package boundaries without lock drift. The full browser matrix passes
239 cases with five existing skips; strict React Doctor passes eight targets with
zero actionable findings and the same294 exact exceptions. Only supporting
evidence for97 existing records was requalified, including one unchanged spinner
that moved by two lines. Full preflight passes on the final frozen graph, including all 15 product
typechecks, all three app builds and the complete unit suite. Shadscan retains
its 48 pooled score and every application floor; 22 existing supporting proof
hashes were independently requalified without changing classifications or floors.

`bun run verify:pdf-package-provenance` runs offline and read-only in
`verify:workspace-contract` and normal preflight. It verifies five archives and
91 extracted files against the immutable owner record: complete inventories,
byte lengths/hashes, package/export identities, internal versions and MIT licenses.
It rejects symlinks, unsafe paths and stale artifacts; 18 adversarial fixtures
pass. Artifact changes select all three app compilations in PR CI.

The owner separately qualified 224 consumed unit cases, 447 upstream editor
cases, three browser cases, eight document categories and six matching build/pack
rounds across two clean committed-source checkouts. This does not substitute for
Core qualification. Native-builder activation is unchanged. Live DocRaptor
fidelity and whole-Core security/release qualification remain separate. Excluded
legacy owner workspaces retain findings.

The fresh complete-graph audit and independent review find no affected versions
in the 282-node closure of all five packages, the shared editor, and installed
CLI/build dependencies. Whole Core still has 84 records across 35 package names
and 73 unique advisories requiring review; no unreachability exceptions were
granted. See [the dated qualification record](pdf-qualification.json) for exact
lock, logs and review hashes.

## Refresh procedure

1. Update and qualify the five packages together in the owner repository using
   its pinned pnpm workflow. Preserve consumed exports and document versions.
2. Build/pack committed source, reproduce from clean checkouts, and merge the
   reviewed owner release. Record build, documentation and merge commits separately.
3. Verify archive hashes against the immutable owner record. Import reviewed
   regular files into the five dedicated directories, replacing directories
   completely, and replace old archives. Do not hand-edit compiled output or
   regenerate expected hashes from Core's current vendor tree.
4. Copy the owner record verbatim, update Core's receipt and consuming families,
   and regenerate Bun's lock through normal installation.
5. Pass provenance, clean frozen installation, runtime/editor/document regressions,
   full preflight, all app builds, current-head review/CI and deployed previews
   before merging Core.
