#!/usr/bin/env node
const { spawnSync } = require("node:child_process");
const { appendFileSync } = require("node:fs");
const { join } = require("node:path");
const { backend, record } = require(join(__dirname, "settings.json"));

appendFileSync(
  record,
  JSON.stringify({
    args: process.argv.slice(2),
    fast: process.env.TSRS_FAST,
    poison: process.env.TSRS_FIXTURE_POISON,
    backendPoison: process.env.OXLINT_TSGOLINT_FIXTURE_POISON,
  }) + "\n",
);
const result = spawnSync(backend, process.argv.slice(2), {
  stdio: "inherit",
  shell: false,
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 2;
