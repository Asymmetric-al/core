## Approach

The installed package is the only source. The pinned release is whatever the
lockfile installs, so mirroring `node_modules/next/dist/docs` needs no network
access, no version argument and no second pin to maintain.

- The package ships `.md` pages; the committed fallback keeps its `.mdx`
  names so existing references stay valid.
- Comparison ignores line endings and the script writes LF.
- Write mode produces an exact mirror: it adds, updates and removes pages.
  Check mode never writes and prints the command that fixes drift.
- The script fails when the package is not installed instead of emptying the
  fallback.

## Verification

- Unit, with fixtures: drift detection for changed, missing and stale pages;
  no writes in check mode; an exact mirror in write mode; line-ending
  handling; failure on a missing install.
- Unit, against the repository: the committed fallback equals the installed
  docs. The test runs whenever `next` is installed and fails in CI if it is
  not.
- Structural: `bun run format:check`. `.next-docs` is Prettier-ignored.
