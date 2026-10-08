Independent readiness-fix review — 2026-10-08 UTC

Scope: read-only review of /workspace/core-reui-review current diff against readiness PR #1970. No repository edits or GitHub mutations.

Disposition: all seven former readiness findings are addressed; no new concrete P0/P1 finding found.

1. Protected-tree destinations: case-folded lexical containment runs before creation; physical repository/protected-tree/parent paths are resolved as a second guard. Existing lstat checks still reject symlink ancestors. Canonical and mirrored trees remain protected.
2. Bundle directory casing: normalized directory-prefix spellings are checked both for the remote bundle and the final staged inventory, covering retained Core references as well as complete duplicate filenames. Checks precede destination creation.
3. TOML leakage: section extraction terminates on indented subsequent headers; valid indented assignments are accepted. Regression fixture proves credentials from another table cannot satisfy ReUI readiness.
4. Registry metadata: every file requires nonempty path/content, a supported installed-schema discriminator, and page/file target. An independent probe against installed @shadcn/registry confirmed all 14 discriminators and the mandatory path/type/target behavior. Invalid metadata fixtures now fail closed.
5. Primitive rejection: dependency checks reject scoped @radix-ui/\* and monolithic radix-ui, including versioned/subpath forms. Source-string checks reject single/double-quoted ESM, re-export and require/import literals. Static backtick imports are invalid JS. Template-literal dynamic imports are outside this narrow scanner; no matching actual registry usage was found, so this is not an evidence-backed new blocker.
6. Filters documentation now matches current official createFilterQuery/createFilterRule ID signatures and factory ownership.
7. Number Field documentation imports actual @asym/ui wrapper exports and uses supported Label htmlFor/input id association. It no longer claims an unexported ScrubArea.

Verification: observed the implementation agent’s completed focused run: six files, 89 tests passed, including both ReUI suites and four existing skill safety/transaction/mirror suites (/tmp/core-stack-review/readiness-focused-tests.log). Independently inspected source, tests, schema and current official Filters evidence. No duplicate test run started. Credential redaction, read-only verification, scratch-only refresh, canonical ownership and Base UI/Maia rules remain intact. Generated ReUI mirrors reflect canonical corrections. Unrelated .cmd newline working-copy flags require the owner’s normal sync/status review; they are not a source behavior finding.
