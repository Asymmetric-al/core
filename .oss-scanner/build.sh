#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."

# This script also supports rebuilding edited source offline inside the image.
# Refuse source-local env files: Next, Bun, and Eve have their own env loaders.
for source_root in . apps/admin apps/donor apps/missionary packages/eve-runtime; do
  for env_file in "$source_root"/.env "$source_root"/.env.*; do
    if [[ "$env_file" == */.env.example ]]; then continue; fi
    if [[ -e "$env_file" ]]; then
      printf 'Refusing scanner build with local environment file: %s\n' "$env_file" >&2
      exit 1
    fi
  done
done

[[ "$(node --version)" == "v$(tr -d '\r\n' < .node-version)" ]]
[[ "$(bun --version)" == "$(tr -d '\r\n' < .bun-version)" ]]
mkdir -p .oss-scanner/results

# An allowlist prevents ambient provider credentials or a developer's CI/demo
# bypass settings reaching build processes. Public values are synthetic local
# settings. Strict build scripts retain normal environment validation.
clean_environment=(
  env -i
  HOME=/root
  PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
  LANG=C.UTF-8
  CI=1
  HUSKY=0
  NODE_ENV=production
  NODE_OPTIONS=--max-old-space-size=4096
  NEXT_TELEMETRY_DISABLED=1
  TURBO_TELEMETRY_DISABLED=1
  DO_NOT_TRACK=1
  CIRCLE_NODE_TOTAL=3
  RAYON_NUM_THREADS=2
  UV_THREADPOOL_SIZE=2
  CORE_EVE_BUILD_MODE=artifacts
  NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
  NEXT_PUBLIC_SUPABASE_ANON_KEY=scanner-local-anon-key
  PAYLOAD_SECRET=oss-scanner-synthetic-local-secret-00000000
  PAYLOAD_DISABLE_SCHEMA_PUSH=1
  PAYLOAD_DATABASE_URI=postgresql://postgres:scanner-local-only@127.0.0.1:55432/core_scanner
  PAYLOAD_DATABASE_POOL_MAX=2
  E2E_AUTH_BYPASS=false
  ALLOW_DEMO_ACCOUNTS=false
  PLAYWRIGHT_BROWSERS_PATH=/opt/playwright
)

# ci-build compiles dependencies and all three apps sequentially with Turbo
# concurrency 1. The local Eve build emits .output/server/index.mjs; withEve's
# Next build phase writes service metadata without starting an agent or sandbox.
timeout --kill-after=30s 30m "${clean_environment[@]}" bun run build:strict

# Exercise the exact dispatcher embedded by admin's withEve integration too.
# Its service mode deliberately ignores CORE_EVE_BUILD_MODE outside hosted
# previews. These command-only preview signals select --skip-sandbox-prewarm.
# Vercel output is separate from the retained local .output server.
timeout --kill-after=30s 8m "${clean_environment[@]}" \
  VERCEL=1 VERCEL_ENV=preview VERCEL_TARGET_ENV=preview \
  bun run --cwd packages/eve-runtime build:service --profile /src/.oss-scanner/results/eve-service-build-profile.json

"${clean_environment[@]}" node --input-type=module <<'NODE'
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";

const root = JSON.parse(readFileSync("package.json", "utf8"));
function hasCompiledValue(directory, value) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = `${directory}/${entry.name}`;
    if (entry.isDirectory() && hasCompiledValue(file, value)) return true;
    if (entry.isFile() && entry.name.endsWith(".js") && readFileSync(file, "utf8").includes(value)) return true;
  }
  return false;
}
for (const app of ["admin", "donor", "missionary"]) {
  assert(existsSync(`apps/${app}/.next/BUILD_ID`), `${app} build output is missing`);
  assert(hasCompiledValue(`apps/${app}/.next/static`, process.env.NEXT_PUBLIC_SUPABASE_URL), `${app} compiled public Supabase URL differs from the scanner profile`);
}
assert(existsSync("packages/eve-runtime/.output/server/index.mjs"), "Local Eve server output is missing");
assert(existsSync("packages/eve-runtime/.vercel/output/config.json"), "Eve service output is missing");
const localManifest = JSON.parse(readFileSync("packages/eve-runtime/.output/.eve/compile/compiled-agent-manifest.json", "utf8"));
assert.equal(localManifest.config.model.routing.provider, "asym-fixture", "The default local Eve model must remain the deterministic verification fixture");
const profile = JSON.parse(readFileSync(".oss-scanner/results/eve-service-build-profile.json", "utf8"));
assert.equal(profile.kind, "eve-build-profile");
assert.equal(profile.target, "vercel");
assert(profile.phases.length > 0);
assert(!profile.phases.some(({ name }) => name === "sandbox.prewarm"), "Scanner service build attempted sandbox prewarming");
assert.equal(process.env.E2E_AUTH_BYPASS, "false");
assert.equal(process.env.SKIP_ENV_VALIDATION, undefined);
assert.equal(process.env.VERCEL, undefined);
const build = {
  node: process.version,
  bun: readFileSync(".bun-version", "utf8").trim(),
  next: root.devDependencies?.next ?? root.dependencies?.next,
  apps: ["admin", "donor", "missionary"],
  environmentValidation: true,
  e2eAuthBypass: false,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  compiledEveModel: localManifest.config.model.id,
  serviceSandboxPrewarm: false,
  serviceQualification: "artifacts only; no deployment or live-provider qualification",
};
writeFileSync(".oss-scanner/results/build.json", `${JSON.stringify(build, null, 2)}\n`);
console.log(JSON.stringify(build, null, 2));
NODE
