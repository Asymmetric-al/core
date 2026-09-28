# Separate Eve preview artifacts from runtime qualification

Tracking issue: [AL-1913](https://github.com/Asymmetric-al/core/issues/1913).

## Why

Admin preview builds traverse the Eve workspace dependency and then build the
generated `withEve` service. Both invoke sandbox prewarming, which correctly
refuses unavailable or Release-Off governance. This prevents the deployed,
Release-Off candidate required by the launch runbook from being inspected.

## What changes

- Give generic web builds an explicit Eve artifact mode and use Eve 0.25.1's
  supported `--skip-sandbox-prewarm` option for hosted preview services.
- Preserve ordinary standalone and production service builds with prewarming.
- Keep artifact mode distinct in build caching and describe its unqualified
  status in the build and launch runbooks.

## Scope and boundaries

This changes build orchestration only. It does not activate Eve, change any
governance/effect admission, authorize provisioning, supply credentials, or
qualify a preview for release. A passing preview is not sandbox or launch proof.

## Capability

- `eve-runtime-foundation`: separate compilation from runtime qualification.

## Rollback

Revert this focused change to restore full prewarming on web builds. The
existing fail-closed preview build failure returns; no data migration is needed.
