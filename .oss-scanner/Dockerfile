# Keep the complete source, development dependencies, and tools for patch verification.
FROM oven/bun:1.4.3@sha256:ec06c3b6cea04192ae6770c434f668ca41d343ad19fa6472216c7b48be39c598 AS bun
FROM node:24.22.1-bookworm@sha256:5630d96570d4ca4a8523fda3d169d0114554d0f48293e1ae3db6be7c79b42a17

COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
RUN ln -s /usr/local/bin/bun /usr/local/bin/bunx

ENV DEBIAN_FRONTEND=noninteractive \
    LANG=C.UTF-8 \
    PLAYWRIGHT_BROWSERS_PATH=/opt/playwright \
    NEXT_TELEMETRY_DISABLED=1 \
    TURBO_TELEMETRY_DISABLED=1 \
    DO_NOT_TRACK=1

# PostgreSQL 15 matches CI's disposable migration database. The six canvas
# development libraries match scripts/github/install-canvas-deps.sh.
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl git sudo procps iproute2 tini \
    build-essential python3 python3-venv python3-yaml pkg-config \
    postgresql-15 postgresql-client-15 postgresql-contrib-15 \
    libpixman-1-dev libcairo2-dev libpango1.0-dev libjpeg-dev \
    libgif-dev librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /src
COPY . /src

# The official wrapper restores the full anonymous checkout history later. A
# direct Docker build also needs the census's real historical SQL object. Keep
# a separate bare store so /src/.git remains available for wrapper restoration.
RUN node -e '\
const { spawnSync } = require("node:child_process"); \
const { readFileSync } = require("node:fs"); \
const assert = require("node:assert/strict"); \
const census = JSON.parse(readFileSync("docs/security/field-policies/census-v1.json", "utf8")); \
const revision = census.provenance.repository_base_sha; \
assert.match(revision, /^[0-9a-f]{40}$/); \
const env = { PATH: "/usr/local/bin:/usr/bin:/bin", HOME: "/root", GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: "/dev/null", GIT_TERMINAL_PROMPT: "0" }; \
function git(args) { const result = spawnSync("git", args, { env, encoding: "buffer" }); if (result.error) throw result.error; assert.equal(result.status, 0, result.stderr.toString()); return result.stdout; } \
git(["init", "--bare", "--initial-branch=scanner-provenance", "/opt/core-provenance.git"]); \
git(["--git-dir=/opt/core-provenance.git", "-c", "credential.helper=", "-c", "protocol.allow=never", "-c", "protocol.https.allow=always", "fetch", "--depth=1", "--no-tags", "https://github.com/Asymmetric-al/core.git", revision]); \
const source = "supabase/migrations/20260702090000_donation_stripe_refund_ids.sql"; \
assert.deepEqual(git(["--git-dir=/opt/core-provenance.git", "show", `${revision}:${source}`]), readFileSync(source)); \
console.log(`Verified anonymous census provenance at ${revision}`);'

# Do not use --ignore-scripts: Core's postinstall repairs workspace/file links.
# No package-manager configuration, host cache, or credentials are mounted.
RUN HUSKY=0 bun ci --no-cache --backend=copyfile \
    && (node -e 'require("canvas").createCanvas(1,1).toBuffer("image/png")' \
        || npm --prefix node_modules/canvas run install) \
    && node -e 'require("canvas").createCanvas(1,1).toBuffer("image/png")' \
    && bunx --no-install playwright install --with-deps chromium \
    && chmod -R a+rX /opt/playwright \
    && rm -rf /var/lib/apt/lists/*

# Compile with egress disabled after dependencies and browsers are installed.
RUN --network=none bash .oss-scanner/build.sh

# The scanner replaces startup commands. Start services explicitly using the
# versioned helper documented in .oss-scanner/README.md after entering the image.
USER root
WORKDIR /src
