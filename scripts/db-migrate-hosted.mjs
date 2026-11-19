// Retired (plan 7.4, WP1): hosted databases migrate only through the release
// job, which checks migration order, runs the catalog gates and the schema
// fingerprint, and records the expected heads before anything deploys. The
// job is the only holder of migration credentials, so this command refuses
// instead of pushing from a workstation.
console.error(
  [
    "error: hosted migrations run only in the release job (.github/workflows/release.yml).",
    "A push to the production branch releases; a re-run is the workflow's dispatched `release` operation.",
    "See docs/ops/release-job.md. For a local database use `bun run db:migrate:local`.",
  ].join("\n"),
);
process.exit(1);
