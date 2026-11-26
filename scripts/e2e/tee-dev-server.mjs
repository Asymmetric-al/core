#!/usr/bin/env node
import { spawn } from "node:child_process";
import { createWriteStream, mkdirSync } from "node:fs";
import path from "node:path";

const logFile = process.env.AUTH_MAIL_ADMIN_LOG_FILE?.trim();
const [command, ...args] = process.argv.slice(2);

if (!logFile) {
  console.error("error: set AUTH_MAIL_ADMIN_LOG_FILE to the log file path.");
  process.exit(2);
}
if (!command) {
  console.error(
    "usage: node scripts/e2e/tee-dev-server.mjs <command> [args...]",
  );
  process.exit(2);
}

const target = path.resolve(logFile);
mkdirSync(path.dirname(target), { recursive: true });
const log = createWriteStream(target, { flags: "w" });

const child = spawn(command, args, {
  stdio: ["inherit", "pipe", "pipe"],
  shell: process.platform === "win32",
});

child.stdout.on("data", (chunk) => {
  process.stdout.write(chunk);
  log.write(chunk);
});
child.stderr.on("data", (chunk) => {
  process.stderr.write(chunk);
  log.write(chunk);
});

for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(signal, () => {
    child.kill(signal);
  });
}

child.on("error", (error) => {
  console.error(
    `error: could not start ${command} (${error.code ?? "spawn error"}).`,
  );
  log.end(() => process.exit(1));
});

child.on("close", (code, signal) => {
  log.end(() => process.exit(code ?? (signal ? 1 : 0)));
});
