import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { executeCandidateCheck } from "../pack/.shared/executor.mjs";

const root = process.argv[2];
const image = process.argv[3];
assert(
  root && path.isAbsolute(root),
  "Explicit disposable qualification root required",
);
assert(/^sha256:[a-f0-9]{64}$/.test(image), "Inspected image ID required");
await mkdir(root, { recursive: true, mode: 0o700 });
const workspace = await mkdtemp(path.join(root, "qualification-"));
await writeFile(
  path.join(workspace, "preserved.txt"),
  "unfinished candidate\n",
);
const common = {
  dockerExecutable: "/usr/bin/docker",
  image,
  workspaceRoot: root,
  workspaceDirectory: workspace,
};
const results = [];
const successful = await executeCandidateCheck({
  ...common,
  command: [
    "node",
    "-e",
    `
    const assert = require('node:assert/strict');
    const fs = require('node:fs');
    assert.equal(process.getuid(), 1000);
    assert.equal(process.env.HOME, '/tmp');
    assert.equal(process.env.CI, '1');
    assert.equal(process.version, 'v24.22.1');
    assert.equal(require('node:child_process').execFileSync('bun', ['--version'], {encoding:'utf8'}).trim(), '1.4.3');
    assert.deepEqual(Object.keys(require('node:os').networkInterfaces()), ['lo']);
    assert.equal(process.env.ANTHROPIC_API_KEY, undefined);
    assert.equal(process.env.CLAUDE_CONFIG_DIR, undefined);
    assert.equal(fs.existsSync('/var/run/docker.sock'), false);
    assert.equal(fs.existsSync('/home/admin/.claude'), false);
    assert.throws(() => fs.writeFileSync('/rootfs-write-probe', 'forbidden'));
    fs.writeFileSync('/candidate/result.txt', 'verified');
    console.log(JSON.stringify({node:process.version,uid:process.getuid(),interfaces:Object.keys(require('node:os').networkInterfaces())}));
  `,
  ],
});
assert.equal(successful.status, "passed");
assert.equal(successful.cleanupConfirmed, true);
assert.equal(
  await readFile(path.join(workspace, "result.txt"), "utf8"),
  "verified",
);
results.push(successful);
const failed = await executeCandidateCheck({
  ...common,
  command: ["node", "-e", "process.exit(7)"],
});
assert.equal(failed.status, "failed");
assert.equal(failed.exitCode, 7);
assert.equal(failed.cleanupConfirmed, true);
results.push(failed);
const timedOut = await executeCandidateCheck({
  ...common,
  limits: { timeoutMs: 2000 },
  command: ["node", "-e", "setInterval(() => {}, 1000)"],
});
assert.equal(timedOut.status, "timed_out");
assert.equal(timedOut.cleanupConfirmed, true);
results.push(timedOut);
const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), 2000);
try {
  const cancelled = await executeCandidateCheck({
    ...common,
    signal: controller.signal,
    command: [
      "node",
      "-e",
      "require('node:child_process').spawn('node',['-e','setInterval(()=>{},1000)']);setInterval(()=>{},1000)",
    ],
  });
  assert.equal(cancelled.status, "cancelled");
  assert.equal(cancelled.cleanupConfirmed, true);
  results.push(cancelled);
} finally {
  clearTimeout(timer);
}
assert.equal(
  await readFile(path.join(workspace, "preserved.txt"), "utf8"),
  "unfinished candidate\n",
);
const evidence = {
  qualification: "live-disposable-checks",
  image,
  workspace,
  results,
};
await writeFile(
  path.join(workspace, "qualification-receipt.json"),
  JSON.stringify(evidence, null, 2),
);
console.log(JSON.stringify(evidence));
