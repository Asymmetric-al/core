## Deploy Checklist (for PRs to `production` or `develop`)

- [ ] CI passes
- [ ] Base branch confirmed: `develop` = development, `production` = production release;
      no canonical `main` branch exists
- [ ] `bun run verify:deployment-discipline` passes if deployment controls changed
- [ ] Migrations reviewed (or N/A)
- [ ] Migrations tested on development (or N/A)
- [ ] New env vars added to all 3 Vercel projects (or N/A)
- [ ] Rollback plan reviewed
- [ ] Production release will use `bun run release:production` (or N/A)
- [ ] Post-deploy smoke tests planned
