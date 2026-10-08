import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ESLint } from "eslint";

const apiDir = path.dirname(
  fileURLToPath(new URL("../package.json", import.meta.url)),
);
const repoDir = path.resolve(apiDir, "../..");
const fixtureDir = path.join(
  apiDir,
  "tests/fixtures/cms-public-client-boundary",
);
const buildDir = mkdtempSync(path.join(fixtureDir, ".next-boundary-"));

try {
  const build = spawnSync(
    process.execPath,
    [
      path.join(repoDir, "node_modules/next/dist/bin/next"),
      "build",
      fixtureDir,
    ],
    {
      cwd: repoDir,
      env: {
        ...process.env,
        CMS_PUBLIC_BOUNDARY_DIST_DIR: path.basename(buildDir),
      },
      encoding: "utf8",
      timeout: 120_000,
    },
  );
  const output = `${build.stdout ?? ""}\n${build.stderr ?? ""}`;

  assert.equal(
    build.error,
    undefined,
    `Next build could not run: ${build.error}`,
  );
  assert.notEqual(build.status, 0, "client-context fixture unexpectedly built");
  assert.match(output, /cms\/public\/index\.ts/);
  assert.match(
    output,
    /['"]server-only['"] cannot be imported from a Client Component module/,
  );
  assert.match(output, /cms-public-client-boundary\/app\/page\.jsx/);
  console.log(
    "PASS: Next rejects the public package through a Client Component import",
  );
} finally {
  rmSync(buildDir, { recursive: true, force: true });
}

const eslint = new ESLint({ cwd: apiDir });
const [result] = await eslint.lintText(
  'import "payload";\nimport "../../../../apps/admin/private";\n',
  {
    filePath: path.join(apiDir, "src/cms/public/forbidden-import-fixture.mjs"),
  },
);
const restricted = result.messages.filter(
  (message) => message.ruleId === "no-restricted-imports",
);

assert.ok(
  restricted.some((message) =>
    message.message.includes(
      "public-content contract package must not import Payload",
    ),
  ),
  "Payload import was not rejected by the package boundary rule",
);
assert.ok(
  restricted.some((message) =>
    message.message.includes("Cannot import from apps/admin"),
  ),
  "admin-app import was not rejected by the package boundary rule",
);
console.log(
  "PASS: ESLint rejects Payload and admin-app imports inside the public package",
);
