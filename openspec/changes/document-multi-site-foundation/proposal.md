# Document Multi-Site Foundation

## Why

AL-478 reconciles durable platform language with the accepted Phase 2 Site
foundation and its explicit Phase 24 owner amendments. Singular public-website
wording currently leaves multiple Tenant-owned Sites and attribution ambiguous.

## What Changes

- Clarify one or more public Sites per Tenant and exactly one Default Site.
- Keep authenticated surfaces and donor accounts Tenant-wide.
- Record operational/CMS, domain, financial, and attribution ownership.
- Add the Phase 2 foundation reference to parity matrix Area 14 while preserving
  Phase 24 qualification seams and unexecuted runtime proof.

## Capabilities

- Modified: `platform-surfaces`, `platform-boundaries`, `platform-product-intent`.

## Non-Goals

No product code, tests, PRD amendments, schema, runtime activation, provider
qualification, imports, new dependencies, or archive operation are included.

## Validation And Rollback

Use strict OpenSpec validation, active-delta compatibility, changed-file
Prettier, whitespace and scoped link checks. Revert only this documentation
patch to roll back; no runtime or data rollback is required.
