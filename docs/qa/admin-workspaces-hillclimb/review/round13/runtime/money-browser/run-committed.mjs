import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import {
  createWriteStream,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const output = dirname(fileURLToPath(import.meta.url));
const command = process.argv[2];
if (!["capture", "check"].includes(command))
  throw new Error("Expected capture or check");
const runner = join(
  process.cwd(),
  `docs/qa/admin-workspaces-hillclimb/${command}-workspaces.mjs`,
);
const label = process.argv[3] ? `${command}-focused` : command;
const destination = join(output, `committed-${label}`);
mkdirSync(destination, { recursive: true });
const log = createWriteStream(join(output, `committed-${label}.log`));
const states =
  process.argv[3] ??
  "crm-drawer-gifts,crm-gift-row-menu,crm-resend-receipt,crm-note-long,contributions-cards,contribution-fund-correction";
const args = [runner, destination, "crm,contributions", states];
const started = new Date().toISOString();
const child = spawn(process.execPath, args, {
  env: { ...process.env, CAPTURE_BASE_URL: "http://localhost:3031" },
  windowsHide: true,
  stdio: ["ignore", "pipe", "pipe"],
});
for (const stream of [child.stdout, child.stderr])
  stream.on("data", (bytes) => {
    log.write(bytes);
    process.stdout.write(bytes);
  });
let timedOut = false;
const watchdog = setTimeout(() => {
  timedOut = true;
  child.kill();
}, 480000);
const result = await new Promise((resolve) =>
  child.once("exit", (code, signal) => resolve({ code, signal })),
);
clearTimeout(watchdog);
log.end();
writeFileSync(
  join(output, `committed-${label}-execution.json`),
  JSON.stringify(
    {
      command: process.execPath,
      args,
      base: "http://localhost:3031",
      started,
      finished: new Date().toISOString(),
      timedOut,
      ...result,
      runnerSha256: createHash("sha256")
        .update(readFileSync(runner))
        .digest("hex"),
    },
    null,
    2,
  ),
);
process.exitCode = result.code ?? 1;
