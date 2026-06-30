# Proposal: Upgrade Web Studio to Payload 4 internal spike

## Why

Web Studio needs to validate Payload 4 compatibility before the CMS engine can
graduate to a supported production baseline. The spike exercises the admin
runtime, custom Web Studio views, storage adapter wiring, migrations, and public
CMS read contracts against the Payload 4 internal build currently available to
the project.

## What Changes

- Upgrade the admin Payload runtime packages to `4.0.0-internal.1f9ae9a`.
- Move media storage wiring to Payload 4's top-level `storage` config.
- Keep Payload as a single `apps/admin` runtime under `/web-studio`.
- Add a Next App Router compatibility bridge for Payload admin routing.
- Validate Payload migrations, import map generation, admin build, CMS unit
  tests, and focused CMS Playwright smoke against Postgres.
- Document the internal-build status, Node.js `24.15.0+` CMS CLI requirement,
  and graduation criteria.

## What Does Not Change

- CMS remains public-content truth only; CRM remains operational truth.
- Donor and missionary apps do not import Payload runtime code.
- Public CMS APIs remain published-only and tenant-scoped.
- Internal Payload 4 packages are not declared a stable long-term dependency
  contract until a supported channel or stable Payload 4 release is selected.

## Expected Outcome

The PR can merge as an explicitly documented Payload 4 spike, with CI and docs
showing what was proven and what must be completed before the internal build is
treated as the durable Web Studio baseline.
