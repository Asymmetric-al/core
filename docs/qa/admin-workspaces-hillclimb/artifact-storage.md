# QA evidence storage

The root `.gitignore` excludes selected generated payloads from this hillclimb:
raw scan output, saved diff copies, screenshots, duplicate fixture exports and
archived browser observations. These files remain on disk. Source, tests,
fixture definitions, reports, manifests and decision records remain reviewable.

Some offline validators read these ignored payloads. A fresh checkout needs the
matching evidence bundle before replaying historical validation; a missing
payload is not a passing check. Rerunning current code does not reproduce the
historical observations or certify a newer candidate.

The cleanup bundle is stored locally, outside this worktree:
`C:/Users/Conrad/.t3/artifacts/core-admin-qa/cleanup-20261112T034226Z`.
Its `manifest.json` records 5,991 repository-relative paths, sizes and SHA-256
hashes. The SHA-256 of `evidence.zip` is
`8ff20cefcd49278f16505b879b0923304ff204167141911fb5b974b69173102c`.

To restore, verify the ZIP hash, extract into a separate empty directory, and
verify every extracted file against the manifest. Compare with the destination
before copying; preserve newer evidence and source. Keep the bundle when
removing temporary worktrees. This local archive is not an off-machine backup
or a new runtime acceptance result.
