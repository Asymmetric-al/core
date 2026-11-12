# Exact candidate views

`pack/.shared/candidate-view.mjs` (`prepareCandidateView`) materializes tracked regular-file blobs from a full
candidate commit SHA, after proving the full base SHA is an ancestor. It reads
Git objects, not the source working tree, and never runs checkout filters,
candidate scripts, hooks, credential helpers or submodule operations. Repository
and disposable root must be disjoint real paths, and the supplied repository
must be its actual Git top-level directory, not a discovered parent checkout.
Every directory prefix is checked for case and file/directory collisions before
creating a view. Dirty files, untracked profiles,
Git metadata and another view's reports are not copied.

Each specialist gets a fresh direct child of the disposable root, compatible
with `executeCandidateCheck`. The receipt binds assignment, attempt, role,
candidate/base and the sorted Git path/mode/blob manifest digest. Symlinks,
gitlinks, unsafe/case-colliding paths, missing objects, unrelated bases and a
view past a size limit reject before a view is created. A read, identity or
copy failure after that preserves the partial directory for reconciliation;
there is no destructive retry.

Sizes are read first (`git cat-file --batch-check`), then file contents in
batches of at most 128 MiB per Git process, each blob checked against its
object ID before it is written. Limits: 100,000 files, 64 MiB per file and
2 GiB per view. On 12 November 2026 Core's own tree was 23,812 files and
405 MB. The optional second argument can only lower a limit.

The adapter reads Git objects with the repository's own config. Callers must
first restore the issue clone's trusted metadata with `trustIssueRepo` from
`git.mjs` (freeze and `views.mjs` do so), so no planted config, alternates or
replace refs are consulted. Writer `run_check` containers mount the clone's
`.git` read-only; the separate hooked commit executor needs writable metadata,
so that mount does not replace the trusted-metadata check. Reviewer dependencies
come from `nodeModulesMounts` after freeze has reinstalled them from the
candidate's lockfile.

The result is a **Gitless snapshot**, not an editable Git worktree, an operating
factory or a runtime security boundary. It deliberately reports
`isolationQualified: false`. It does not seal later writes, scan tracked content
for accidentally committed secrets, enforce assigned-path edits, restrict a
native model's host tools, or prove installed-policy/peer-session isolation.
Those remain admission obligations. Checks that require Git metadata need a
separately qualified Git-aware environment; do not fabricate a repository.

`qualification/candidate-view.mjs` exercises this adapter against a synthetic
two-commit repository and the existing inspected Docker image. It checks the
exact second review view with no network, verifies source dirty/untracked
sentinels survive, rejects a tracked link, and requires confirmed container
cleanup. No model or GitHub request occurs. Run with explicit unused root and
full local image ID:

```sh
node scripts/archon-factory/qualification/candidate-view.mjs /absolute/unused-root sha256:<inspected-image-id>
```

Synthetic commits intentionally have no product hooks; this fixture says nothing
about Core's normal post-hook publication gate. Keep all live receipts and
leftover work until commissioning reconciliation finishes.
