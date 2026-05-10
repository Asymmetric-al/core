# Deploy Checklist

Use this checklist for production deploys to the current Vercel Production
Branch. As of 2026-05-10, all three live Vercel projects (`admin`, `donor`, and
`missionary`) use `epic` as the Production Branch. If a release also affects
staging validation, run the same checks against `develop` after deploy.

## 1. Pre-deploy

- [ ] CI checks pass (`lint`, `typecheck`, `unit tests`)
- [ ] Migrations reviewed (additive-only, or expand-then-contract followed)
- [ ] Migrations tested on staging first
- [ ] Vercel project Production Branch matches the intended release branch for all 3 projects
- [ ] The app-level `vercel.json` files do not disable that Production Branch
- [ ] New env vars added to all 3 Vercel projects in Production scope
- [ ] If syncing from GitHub Secrets, run `Sync Vercel Production Env` with
      `dry_run=true`, then with `dry_run=false` after the dry-run passes
- [ ] Resend production webhook exists at
      `https://admin.asymmetric.al/api/email/webhooks/resend`; if missing, run
      `Configure Resend Production Webhook` with `dry_run=true`, then
      `dry_run=false`
- [ ] Stripe live webhook endpoints exist for each production app at `/api/webhooks/stripe`
- [ ] Production readiness verifier passes for the exact commit to ship:
      `bun run verify:vercel-production -- --commit <sha>`
- [ ] Rollback plan reviewed for this deploy: [docs/ops/rollback-plan.md](./rollback-plan.md)

## 2. Deploy

- [ ] Merge or push the approved release commit to the current Vercel Production Branch
- [ ] Monitor Vercel build logs for all 3 projects:
  - `donor`
  - `missionary`
  - `admin`
- [ ] Do not force-deploy if any build fails

## 3. Post-deploy smoke tests (within 5 minutes)

- [ ] App loads:
  - `https://donor.asymmetric.al/`
  - `https://missionary.asymmetric.al/`
  - `https://admin.asymmetric.al/`
- [ ] Health checks return `{"status":"ok","checks":{"supabase":"ok"}}`:
  - `curl -sS https://donor.asymmetric.al/api/health`
  - `curl -sS https://missionary.asymmetric.al/api/health`
  - `curl -sS https://admin.asymmetric.al/api/health`
- [ ] Auth works: log in with a test account, log out, then log back in
- [ ] Stripe webhook works: trigger a test event via Stripe CLI/dashboard and verify receipt
- [ ] Supabase connectivity works: perform at least one read and one write action

## 4. Post-deploy monitoring (within 30 minutes)

- [ ] Sentry: check for new errors tagged with the deployed release
- [ ] Vercel Analytics: check for Web Vitals anomalies
- [ ] Supabase Dashboard: check for pool exhaustion and failed auth spikes
- [ ] Re-run production readiness verifier against the deployed commit:
      `bun run verify:vercel-production -- --commit <sha>`

## 5. If something is wrong

- [ ] Code-only issue: perform Vercel rollback (see [docs/ops/rollback-plan.md](./rollback-plan.md))
- [ ] Migration involved: assess and execute rollback/forward-fix via rollback plan
- [ ] Notify the team immediately with impact and mitigation status
