# Skill catalog integration design

## Source preservation

PR #1905 is the catalog carrier because it already contains the broad refreshed
catalog and current integration history. PR numbers and signatures do not prove
supersession. Exact source comparisons identify later compatible fixes from
#1902 and #1904 and separately account for #1429 and #1862. The old PRs remain
open until an actually merged tree contains their valid unique work.

Canonical `docs/ai/skills` remains the authoring surface. Ecosystem-only sources
are adapted through `scripts/sync-agent-skills.mjs`, which restores the Git hook,
wizard discovery, Core shadcn guidance and eval JSON escaping before mirroring.
These adapters reject unknown replacement drift rather than silently dropping
the expected correction. The generated `.cursor` and `.claude` trees remain
outputs. Existing aliases and Core-owned adapters remain intact.

## Refresh transaction

Build each canonical tree in a sibling staging directory. Copy an existing
canonical tree to a complete recovery directory before removing the original;
copy failure must leave the original intact. A collision at a staging
destination preserves the unexpected destination and the recovery copy and
reports incomplete rollback instead of overwriting unowned data.

Keep every directory recovery copy until all source-group writes complete.
Lockfiles and GitHub companion files use complete sibling writes followed by
atomic replacement. Companion originals have persistent recovery files so a
failed file rollback retains their exact bytes after the process exits.

On failure, attempt every applicable restore even if one fails. Report all
recovery failures, keep the remaining recovery copies, and stop both focused
and broad refreshes. Do not emit a success message after incomplete rollback.

## Verification

Public CLI fixtures inject named filesystem failures and assert each injection
was reached. They cover partial canonical removal, occupied destinations,
directory rollback continuation, local lock writes, GitHub companion/lock
writes, and interrupted companion recovery, with a successful refresh control.
The eval fixture checks both script containment and JSON round-trip equality.
Structural contracts check operative discovery/workflow text and existing Core
UI ownership. Mirror verification runs without changing the working tree.

## Reference integrity and runtime preservation

Both CLIs share the scanner annotation helper so valid example syntax and
behavior survive canonical refresh and mirror generation. Existing tool-owned
trailing markers are repaired only outside quoted data. JSX and markup receive
no guessed suffix; continuations, multiline strings, heredocs and template
payloads stay intact. A JavaScript template remains data even when it contains
GraphQL. Standalone GraphQL examples use GraphQL comments. JSON data is retained.

The helper keeps uncertain contexts scanner-visible rather than inserting a
potentially unsafe allowlist comment. After a JavaScript template, shell heredoc
operator, line continuation or YAML block-scalar indicator appears, the
remaining code region is preserved. It does not guess full shell delimiter words from prefixes or infer
YAML payload boundaries from a subset of sequence, indentation and chomping
syntax. Each Markdown fence/frontmatter region has its own state; an indented
document marker inside a YAML value does not close frontmatter. Ordinary
unambiguous code still receives language-correct comments; no scanner settings,
exclusions or gates change.

Destination checks use filesystem entries rather than following symlinks.
Unexpected canonical entries are rejected before reading overlays and again
before publication. Collisions retain both the competing entry and complete
recovery data. Ecosystem mirror publication errors propagate to the CLI instead
of being reported as unreadable-source skips.

Core adapters keep imported Stripe guidance pointed at the approved client
version and donation payment-method owner. Well-known lock hashes continue to
identify raw upstream text; tests reverse only reviewed overlay substitutions
before checking that raw-source digest.

Pinned public Emil recipe fixtures retain exact source bytes and verified hashes.
Whitespace-tolerant replacements accept indentation and Markdown table padding
differences while still requiring every reviewed literal token. Unknown content
continues to fail required adapters before any canonical swap.

The preserved Eve fix skips redaction scanning only for schema-validated related
claim UUID fields. Later visibility and tenant/root/field relationship checks
remain in force. All content fields, including UUID-shaped payment-number
strings, remain subject to redaction validation.

## Copied menu example

The ecosystem-only shadcn-ui data-table example retains its source ownership in
.agents/skills. Its reviewed Core correction is owned by
scripts/refresh-overlays/shadcn-ui-data-table.json, applied before mirror sync.
The adapter restores an explicit DropdownMenuGroup around its label/items and
Base UI render composition for both triggers. It validates all expected source
fragments before one write, preserves unrelated source content, accepts the
already-corrected form, and rejects unknown or duplicated replacement drift.
No sync implementation is replaced by the overlapping UI branch's copy.
