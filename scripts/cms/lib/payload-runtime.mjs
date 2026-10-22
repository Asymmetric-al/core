import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { adminAppDir } from "./paths.mjs";

export const PAYLOAD_V4_MIN_NODE_VERSION = "24.15.0";

const supportedCommands = new Set([
  "generate:db-schema",
  "generate:importmap",
  "generate:types",
  "help",
  "info",
  "migrate",
  "migrate:create",
  "migrate:down",
  "migrate:fresh",
  "migrate:refresh",
  "migrate:reset",
  "migrate:status",
]);

export async function getPayloadCliCommand(args) {
  const adminRequire = createRequire(path.join(adminAppDir, "package.json"));
  const { createCLI } = await import(
    pathToFileURL(adminRequire.resolve("payload/cli")).href
  );
  // Parse the installed CLI's global options without loading application config,
  // initializing Payload, or executing a command before the target guard runs.
  const cli = await createCLI(
    {
      configDir: adminAppDir,
      destroy: async () => {},
      getConfig: async () => ({ cli: false }),
      getPayload: async () => {
        throw new Error(
          "Payload initialization is forbidden during preflight.",
        );
      },
      isScheduled: false,
      markScheduled: () => {},
    },
    { isJSON: false },
  );
  cli.configureOutput({ writeErr: () => {} });
  const { operands, unknown } = cli.parseOptions(args);
  const command =
    !operands.length &&
    unknown.length === 1 &&
    ["--help", "-h"].includes(unknown[0])
      ? "help"
      : operands[0];

  // This runner owns migration and generation workflows. New upstream CRUD,
  // job, and arbitrary-script commands must not inherit its database credentials.
  if (!supportedCommands.has(command)) {
    throw new Error(
      "Unsupported Payload command or leading option. Use the CMS migration, generation, help, or info commands.",
    );
  }
  return command;
}

export function parseNodeVersion(version) {
  const normalized = String(version ?? "")
    .trim()
    .replace(/^v/, "");
  const match = normalized.match(/^(\d+)\.(\d+)\.(\d+)/);

  if (!match) {
    return null;
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

export function compareNodeVersions(left, right) {
  const parsedLeft = parseNodeVersion(left);
  const parsedRight = parseNodeVersion(right);

  if (!parsedLeft || !parsedRight) {
    throw new Error(`Cannot compare Node.js versions: ${left} vs ${right}`);
  }

  for (const key of ["major", "minor", "patch"]) {
    if (parsedLeft[key] > parsedRight[key]) {
      return 1;
    }

    if (parsedLeft[key] < parsedRight[key]) {
      return -1;
    }
  }

  return 0;
}

export function getConfiguredPayloadVersion({
  packageJsonPath = path.join(adminAppDir, "package.json"),
} = {}) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  return (
    packageJson.dependencies?.payload ??
    packageJson.devDependencies?.payload ??
    null
  );
}

export function isPayloadV4Version(version) {
  if (!version) {
    return false;
  }

  const normalized = String(version).trim().replace(/^[~^]/, "");
  return normalized.startsWith("4.");
}

export function assertPayloadRuntimeRequirements({
  nodeVersion = process.versions.node,
  payloadVersion = getConfiguredPayloadVersion(),
} = {}) {
  if (!isPayloadV4Version(payloadVersion)) {
    return;
  }

  if (compareNodeVersions(nodeVersion, PAYLOAD_V4_MIN_NODE_VERSION) >= 0) {
    return;
  }

  throw new Error(
    [
      `Payload ${payloadVersion} requires Node.js ${PAYLOAD_V4_MIN_NODE_VERSION}+ for CMS CLI commands.`,
      `Current Node.js version is ${nodeVersion}.`,
      "Upgrade Node before running cms:migrate, cms:migrate:status, or cms:importmap.",
    ].join(" "),
  );
}
