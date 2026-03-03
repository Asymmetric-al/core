import { spawnSync } from "node:child_process";

const WARNING_PATTERNS = [
  /vite-cjs-node-api-deprecated/i,
  /CJS build of Vite's Node API is deprecated/i,
];

const result = spawnSync("bun", ["run", "test:unit"], {
  env: { ...process.env, FORCE_COLOR: process.env.FORCE_COLOR ?? "0" },
  encoding: "utf8",
  maxBuffer: 10 * 1024 * 1024,
});

const stdout = result.stdout ?? "";
const stderr = result.stderr ?? "";

if (stdout) process.stdout.write(stdout);
if (stderr) process.stderr.write(stderr);

if (result.error) {
  console.error(`==> FAIL test:unit:warnings (${result.error.message})`);
  process.exit(1);
}

const combinedOutput = `${stdout}\n${stderr}`;
const matchedWarnings = WARNING_PATTERNS.filter((pattern) =>
  pattern.test(combinedOutput),
);

if (matchedWarnings.length > 0) {
  console.error("==> FAIL test:unit:warnings (blocked warning pattern found)");
  for (const pattern of matchedWarnings) {
    console.error(`  - matched: ${pattern}`);
  }
  process.exit(1);
}

if ((result.status ?? 1) !== 0) {
  process.exit(result.status ?? 1);
}

console.log("==> PASS test:unit:warnings");
