#!/usr/bin/env node
// Runs before Playwright starts `next dev` for an app, outside CI only (see
// devServerCommand in ./playwright-shared.ts). Next.js allows one dev server
// per app directory: the running one holds `apps/<app>/.next/dev/lock` as an
// operating-system lock and records its URL and PID in it, and a second
// `next dev` there exits. This check never touches the lock. When a live
// server that is listening holds it, it names that server and says what to do,
// and exits 1 so the second server is never started.
import { readFileSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const REPO_ROOT = fileURLToPath(new URL("../../", import.meta.url));

/** Where `next dev` for an app keeps its lock. */
export function devServerLockPath(app, root = REPO_ROOT) {
  return path.join(root, "apps", app, ".next", "dev", "lock");
}

/** The server Next.js records in its dev lock, or null. */
export function readDevServerLock(lockPath, readFile = readFileSync) {
  try {
    const info = JSON.parse(readFile(lockPath, "utf8"));
    return Number.isInteger(info?.pid) && Number.isInteger(info?.port)
      ? info
      : null;
  } catch {
    return null;
  }
}

export function processIsAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error?.code === "EPERM";
  }
}

export function portIsListening(port, host, timeoutMs = 1000) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host });
    const done = (listening) => {
      socket.destroy();
      resolve(listening);
    };
    socket.setTimeout(timeoutMs, () => done(false));
    socket.once("connect", () => done(true));
    socket.once("error", () => done(false));
  });
}

/**
 * The live `next dev` holding the app's lock, or null. A lock left by a dead
 * process, or naming a process that is not listening on its port, is not a
 * running server: Next.js decides about those itself.
 */
export async function runningDevServer({
  app,
  root = REPO_ROOT,
  readFile = readFileSync,
  isAlive = processIsAlive,
  isListening = portIsListening,
}) {
  const server = readDevServerLock(devServerLockPath(app, root), readFile);
  if (!server || server.pid === process.pid || !isAlive(server.pid))
    return null;
  return (await isListening(server.port, server.hostname || "localhost"))
    ? server
    : null;
}

export function devServerConflictMessage({
  app,
  port,
  hostname,
  server,
  platform = process.platform,
}) {
  const stop =
    platform === "win32"
      ? `taskkill /PID ${server.pid} /T /F`
      : `kill ${server.pid}`;
  const url = server.appUrl || `http://localhost:${server.port}`;
  return [
    `Playwright needs its own next dev for apps/${app} on ${hostname}:${port}, but one is already running:`,
    `  ${url} (PID ${server.pid})`,
    `Next.js allows one dev server per app directory, so a second one would exit. Its lock, apps/${app}/.next/dev/lock, is left alone.`,
    "To continue, either:",
    `  - stop that server (${stop}) and rerun; Playwright then starts its own with the environment the tests need, or`,
    `  - restart it on Playwright's port with that environment (bun run --cwd apps/${app} dev:playwright -- --port ${port} --hostname ${hostname}); outside CI Playwright reuses a server it finds there.`,
  ].join("\n");
}

/** `<app> <port> <hostname>`: 1 with a message when a server holds the lock. */
export async function checkDevServerLock(
  [app, port, hostname],
  { error = console.error, ...options } = {},
) {
  if (!app || !port || !hostname) {
    error("usage: dev-server-lock.mjs <app> <port> <hostname>");
    return 2;
  }
  const server = await runningDevServer({ app, ...options });
  if (!server) return 0;
  error(devServerConflictMessage({ app, port, hostname, server }));
  return 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  process.exitCode = await checkDevServerLock(process.argv.slice(2));
