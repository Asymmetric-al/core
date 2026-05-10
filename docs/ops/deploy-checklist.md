# Deploy Checklist

Use this checklist for production deploys to `main`. If a release also affects
staging validation, run the same checks against `develop` after deploy.

## 1. Pre-deploy

- [ ] CI checks pass (`lint`, `typecheck`, `unit tests`)
- [ ] Migrations reviewed (additive-only, or expand-then-contract followed)
- [ ] Migrations tested on staging first
- [ ] `main` contains the current `epic` lineage, or the release owner has explicitly changed the production branch contract before deploy
- [ ] New env vars added to all 3 Vercel projects in Production scope
- [ ] Stripe live webhook endpoints exist for each production app at `/api/webhooks/stripe`
- [ ] Rollback plan reviewed for this deploy: [docs/ops/rollback-plan.md](./rollback-plan.md)

## 2. Deploy

- [ ] Merge approved PR to `main`
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

## 5. If something is wrong

- [ ] Code-only issue: perform Vercel rollback (see [docs/ops/rollback-plan.md](./rollback-plan.md))
- [ ] Migration involved: assess and execute rollback/forward-fix via rollback plan
- [ ] Notify the team immediately with impact and mitigation status
