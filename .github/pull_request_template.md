## Deploy Checklist (for PRs to `epic` or `develop`)

- [ ] CI passes
- [ ] Base branch confirmed: `develop` = staging, `epic` = production release,
      `main` = retired/inactive
- [ ] `bun run verify:deployment-discipline` passes if deployment controls changed
- [ ] Migrations reviewed (or N/A)
- [ ] Migrations tested on staging (or N/A)
- [ ] New env vars added to all 3 Vercel projects (or N/A)
- [ ] Rollback plan reviewed
- [ ] Production release will use `bun run release:production` (or N/A)
- [ ] Post-deploy smoke tests planned
