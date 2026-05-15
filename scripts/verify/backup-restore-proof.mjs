#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const POSTGRES_IMAGE = "postgres:16-alpine";
const DATABASE_NAME = "asym_phase11_restore";
const CONTAINER_DUMP_PATH = "/tmp/phase11-restore.dump";

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });
}

function runInherited(command, args) {
  execFileSync(command, args, {
    stdio: ["ignore", "inherit", "inherit"],
  });
}

function safeName(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function dockerExec(container, args, options = {}) {
  return run("docker", ["exec", container, ...args], options);
}

function waitForPostgres(container) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      dockerExec(container, [
        "pg_isready",
        "-U",
        "postgres",
        "-d",
        DATABASE_NAME,
      ]);
      return;
    } catch {
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
    }
  }

  throw new Error(`Timed out waiting for ${container}`);
}

export function parseRestoreCount(text) {
  const [rowCount, minMarker, maxMarker] = text.trim().split("|");
  return {
    rowCount: Number(rowCount),
    minMarker,
    maxMarker,
  };
}

export function buildBackupRestoreSummary({
  sourceContainer,
  targetContainer,
  rowCount,
  minMarker,
  maxMarker,
  dumpFile,
}) {
  return {
    status: rowCount === 3 ? "passed" : "failed",
    source: sourceContainer,
    isolatedRestoreTarget: targetContainer,
    database: DATABASE_NAME,
    dumpFile,
    restoredRows: rowCount,
    minMarker,
    maxMarker,
    productionTouched: false,
  };
}

export function formatBackupRestoreSummary(summary) {
  return [
    "# Backup Restore Proof",
    "",
    `Status: ${summary.status.toUpperCase()}`,
    `Source container: ${summary.source}`,
    `Isolated restore target: ${summary.isolatedRestoreTarget}`,
    `Database: ${summary.database}`,
    `Restored rows: ${summary.restoredRows}`,
    `Marker range: ${summary.minMarker} -> ${summary.maxMarker}`,
    "Production touched: no",
    "Secrets printed: no",
    "",
  ].join("\n");
}

export function runBackupRestoreProof() {
  const tempDir = mkdtempSync(path.join(os.tmpdir(), "asym-phase11-restore-"));
  const dumpFile = path.join(tempDir, "phase11-restore.dump");
  const sourceContainer = safeName("asym-phase11-source");
  const targetContainer = safeName("asym-phase11-target");

  try {
    for (const container of [sourceContainer, targetContainer]) {
      runInherited("docker", [
        "run",
        "-d",
        "--rm",
        "--name",
        container,
        "-e",
        "POSTGRES_PASSWORD=postgres",
        "-e",
        `POSTGRES_DB=${DATABASE_NAME}`,
        POSTGRES_IMAGE,
      ]);
      waitForPostgres(container);
    }

    dockerExec(sourceContainer, [
      "psql",
      "-U",
      "postgres",
      "-d",
      DATABASE_NAME,
      "-v",
      "ON_ERROR_STOP=1",
      "-c",
      `
        create table public.phase11_restore_probe (
          id integer primary key,
          marker text not null,
          created_at timestamptz not null default now()
        );
        insert into public.phase11_restore_probe (id, marker)
        values
          (1, 'phase11-alpha'),
          (2, 'phase11-beta'),
          (3, 'phase11-gamma');
      `,
    ]);

    dockerExec(sourceContainer, [
      "pg_dump",
      "-U",
      "postgres",
      "-d",
      DATABASE_NAME,
      "--format=custom",
      `--file=${CONTAINER_DUMP_PATH}`,
    ]);
    runInherited("docker", [
      "cp",
      `${sourceContainer}:${CONTAINER_DUMP_PATH}`,
      dumpFile,
    ]);
    runInherited("docker", [
      "cp",
      dumpFile,
      `${targetContainer}:${CONTAINER_DUMP_PATH}`,
    ]);
    dockerExec(targetContainer, [
      "pg_restore",
      "-U",
      "postgres",
      "-d",
      DATABASE_NAME,
      "--clean",
      "--if-exists",
      CONTAINER_DUMP_PATH,
    ]);

    const countOutput = dockerExec(targetContainer, [
      "psql",
      "-U",
      "postgres",
      "-d",
      DATABASE_NAME,
      "-tA",
      "-F",
      "|",
      "-c",
      "select count(*), min(marker), max(marker) from public.phase11_restore_probe;",
    ]);
    const counts = parseRestoreCount(countOutput);

    return buildBackupRestoreSummary({
      sourceContainer,
      targetContainer,
      dumpFile,
      ...counts,
    });
  } finally {
    for (const container of [sourceContainer, targetContainer]) {
      try {
        runInherited("docker", ["rm", "-f", container]);
      } catch {
        // Container may already be gone because --rm was used.
      }
    }
    rmSync(tempDir, { recursive: true, force: true });
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const summary = runBackupRestoreProof();
  console.log(formatBackupRestoreSummary(summary));
  process.exitCode = summary.status === "passed" ? 0 : 1;
}
