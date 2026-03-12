import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join, basename, relative } from "node:path";

type RegistryFile = {
  type?: string;
  target?: string;
  path?: string;
};

type RegistryItem = {
  name?: string;
  files?: RegistryFile[];
};

const REGISTRY_NAMESPACE = "@shadcnuikit";
const REGISTRY_BASE_URL = "https://shadcnuikit.com/r";
const SHADCN_CWD = "packages/ui";
const SHADCN_COMPONENT_PATH = "components/shadcn";

type ParsedArgs = {
  itemInputs: string[];
  dryRun: boolean;
  passthroughArgs: string[];
};

function printUsage(): void {
  console.error(
    [
      "Usage:",
      "  bun run shadcn:uikit:add <item> [item...] [-- <shadcn-add-options>]",
      "  bun run shadcn:uikit:add --dry-run <item> [item...]",
      "",
      "Examples:",
      "  bun run shadcn:uikit:add button1",
      "  bun run shadcn:uikit:add @shadcnuikit/button1 @shadcnuikit/chart1",
      "  bun run shadcn:uikit:add button1 -- --overwrite",
    ].join("\n"),
  );
}

function parseArgs(rawArgs: string[]): ParsedArgs {
  let dryRun = false;
  const itemInputs: string[] = [];
  const passthroughArgs: string[] = [];
  let collectPassthrough = false;

  for (const arg of rawArgs) {
    if (arg === "--") {
      collectPassthrough = true;
      continue;
    }

    if (!collectPassthrough && arg === "--dry-run") {
      dryRun = true;
      continue;
    }

    if (collectPassthrough) {
      passthroughArgs.push(arg);
      continue;
    }

    itemInputs.push(arg);
  }

  return {
    itemInputs,
    dryRun,
    passthroughArgs,
  };
}

function normalizeItemName(input: string): string {
  const trimmed = input.trim();

  if (!trimmed) {
    throw new Error("Received an empty item name.");
  }

  if (trimmed.startsWith(`${REGISTRY_NAMESPACE}/`)) {
    return trimmed.slice(`${REGISTRY_NAMESPACE}/`.length);
  }

  if (
    trimmed.startsWith("@") &&
    !trimmed.startsWith(`${REGISTRY_NAMESPACE}/`)
  ) {
    throw new Error(
      `Unsupported namespace in "${trimmed}". Use ${REGISTRY_NAMESPACE}/<item>.`,
    );
  }

  return trimmed;
}

async function readTokenFromEnvLocal(): Promise<string | undefined> {
  const envLocalPath = join(process.cwd(), ".env.local");

  try {
    const contents = await readFile(envLocalPath, "utf8");
    const line = contents
      .split(/\r?\n/)
      .find((entry) => entry.trim().startsWith("REGISTRY_TOKEN="));

    if (!line) {
      return undefined;
    }

    const [, rawValue = ""] = line.split("=", 2);
    const value = rawValue.trim().replace(/^['"]|['"]$/g, "");
    return value || undefined;
  } catch {
    return undefined;
  }
}

function sanitizeRegistryPayload(payload: RegistryItem): RegistryItem {
  const files = payload.files ?? [];
  const sanitizedFiles = files.map((file) => {
    const sanitized: RegistryFile = { ...file };
    const fileType = sanitized.type ?? "";
    const hasTarget =
      typeof sanitized.target === "string" &&
      sanitized.target.trim().length > 0;

    // shadcn v3.8+ validates explicit targets for safety. Some third-party
    // payloads set targets on non-file/page entries and trigger false positives
    // on Windows. Keep targets only where the schema requires them.
    if (
      hasTarget &&
      fileType !== "registry:file" &&
      fileType !== "registry:page"
    ) {
      delete sanitized.target;
    }

    if (!hasTarget && "target" in sanitized) {
      delete sanitized.target;
    }

    return sanitized;
  });

  return {
    ...payload,
    files: sanitizedFiles,
  };
}

async function fetchRegistryItem(
  name: string,
  token: string,
): Promise<RegistryItem> {
  const url = `${REGISTRY_BASE_URL}/${encodeURIComponent(name)}.json`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`;
    try {
      const body = await response.json();
      if (typeof body?.message === "string" && body.message.length > 0) {
        message = body.message;
      }
    } catch {
      // Ignore parse errors and keep HTTP status.
    }
    throw new Error(`Failed to fetch "${name}" from shadcnuikit: ${message}`);
  }

  const payload = (await response.json()) as RegistryItem;
  return sanitizeRegistryPayload(payload);
}

async function main(): Promise<void> {
  const parsedArgs = parseArgs(process.argv.slice(2));
  if (parsedArgs.itemInputs.length === 0) {
    printUsage();
    process.exit(1);
  }

  const itemNames = parsedArgs.itemInputs.map(normalizeItemName);
  const token = process.env.REGISTRY_TOKEN ?? (await readTokenFromEnvLocal());

  if (!token) {
    throw new Error(
      "Missing REGISTRY_TOKEN. Set it in your environment or in .env.local.",
    );
  }

  const tempDir = await mkdtemp(join(process.cwd(), ".shadcnuikit-"));

  try {
    const tempRegistryFiles: string[] = [];
    for (const name of itemNames) {
      const payload = await fetchRegistryItem(name, token);
      const filename = `${basename(name)}.json`;
      const filePath = join(tempDir, filename);
      await writeFile(filePath, JSON.stringify(payload, null, 2), "utf8");
      tempRegistryFiles.push(
        relative(process.cwd(), filePath).replace(/\\/g, "/"),
      );
    }

    const cmd = [
      "bunx",
      "--bun",
      "shadcn@latest",
      "add",
      ...tempRegistryFiles,
      "--cwd",
      SHADCN_CWD,
      "--path",
      SHADCN_COMPONENT_PATH,
      ...parsedArgs.passthroughArgs,
      "--yes",
    ];

    if (parsedArgs.dryRun) {
      console.log("Dry run: sanitized registry payloads prepared.");
      for (const tempFile of tempRegistryFiles) {
        console.log(`  - ${tempFile}`);
      }
      console.log(`Dry run: would execute: ${cmd.join(" ")}`);
      return;
    }

    const result = Bun.spawnSync({
      cmd,
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit",
      env: process.env,
    });

    if (result.exitCode !== 0) {
      process.exit(result.exitCode);
    }
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

await main();
