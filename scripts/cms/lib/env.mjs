import fs from "node:fs";

import {
  LOCAL_DATABASE_URL,
  LOCAL_ENV_DEFAULTS,
  LOCAL_SUPABASE_URL,
} from "./local-data.mjs";
import { rootEnvPath } from "./paths.mjs";
import { maskValue } from "./process.mjs";

const STATUS_ENV_KEY_CANDIDATES = {
  NEXT_PUBLIC_SUPABASE_URL: [
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_URL",
    "API_URL",
  ],
  NEXT_PUBLIC_SUPABASE_ANON_KEY: [
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_ANON_KEY",
    "ANON_KEY",
  ],
  SUPABASE_SERVICE_ROLE_KEY: ["SUPABASE_SERVICE_ROLE_KEY", "SERVICE_ROLE_KEY"],
  SUPABASE_DB_URL: ["SUPABASE_DB_URL", "DB_URL", "DATABASE_URL"],
};

function parseEnvLine(line) {
  const match = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(line);
  if (!match) {
    return null;
  }

  return {
    key: match[1],
    value: unquoteEnvValue(match[2] ?? ""),
  };
}

function unquoteEnvValue(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return value;
}

function serializeEnvValue(value) {
  if (value === "") {
    return "";
  }

  if (/[\s#"'\\$]/.test(value)) {
    return JSON.stringify(value);
  }

  return value;
}

function isPlaceholderValue(value) {
  const normalized = value.trim().toLowerCase();
  return (
    normalized === "" ||
    normalized === "your-anon-key" ||
    normalized === "example-anon-key" ||
    normalized === "your-service-role-key" ||
    normalized === "your-supabase-url" ||
    normalized === "https://example.supabase.co"
  );
}

export function readEnvFile(filePath = rootEnvPath) {
  if (!fs.existsSync(filePath)) {
    return {
      entries: new Map(),
      lines: [],
    };
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  const entries = new Map();

  lines.forEach((line, index) => {
    const parsed = parseEnvLine(line);
    if (parsed) {
      entries.set(parsed.key, { ...parsed, index });
    }
  });

  return { entries, lines };
}

export function parseSupabaseStatusOutput(output) {
  const parsed = {};

  for (const rawLine of output.split(/\r?\n/)) {
    const line = rawLine.trim();
    const envLine = parseEnvLine(line.replace(/^export\s+/, ""));
    if (envLine) {
      parsed[envLine.key] = envLine.value;
      continue;
    }

    const pair = /^([^:]+):\s*(.+)$/.exec(line);
    if (!pair) {
      continue;
    }

    const label = pair[1].trim().toLowerCase();
    const value = pair[2].trim();
    if (label === "api url") {
      parsed.API_URL = value;
    } else if (label === "db url") {
      parsed.DB_URL = value;
    } else if (label === "anon key") {
      parsed.ANON_KEY = value;
    } else if (label === "service role key" || label === "service_role key") {
      parsed.SERVICE_ROLE_KEY = value;
    }
  }

  return parsed;
}

function resolveStatusValue(statusEnv, targetKey) {
  const candidates = STATUS_ENV_KEY_CANDIDATES[targetKey] ?? [];
  for (const candidate of candidates) {
    const value = statusEnv[candidate];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

export function buildLocalEnvValues(statusEnv = {}) {
  const values = {
    ...LOCAL_ENV_DEFAULTS,
    NEXT_PUBLIC_SUPABASE_URL:
      resolveStatusValue(statusEnv, "NEXT_PUBLIC_SUPABASE_URL") ??
      LOCAL_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      resolveStatusValue(statusEnv, "NEXT_PUBLIC_SUPABASE_ANON_KEY") ?? "",
    SUPABASE_SERVICE_ROLE_KEY:
      resolveStatusValue(statusEnv, "SUPABASE_SERVICE_ROLE_KEY") ?? "",
    SUPABASE_DB_URL:
      resolveStatusValue(statusEnv, "SUPABASE_DB_URL") ?? LOCAL_DATABASE_URL,
    PAYLOAD_DATABASE_URI:
      resolveStatusValue(statusEnv, "SUPABASE_DB_URL") ?? LOCAL_DATABASE_URL,
  };

  return values;
}

export function writeLocalEnv({
  filePath = rootEnvPath,
  force = false,
  statusEnv = {},
} = {}) {
  const desired = buildLocalEnvValues(statusEnv);
  const state = readEnvFile(filePath);
  const lines = [...state.lines];
  const added = [];
  const updated = [];
  const preserved = [];

  for (const [key, value] of Object.entries(desired)) {
    if (
      (key === "NEXT_PUBLIC_SUPABASE_ANON_KEY" ||
        key === "SUPABASE_SERVICE_ROLE_KEY") &&
      !value
    ) {
      continue;
    }

    const existing = state.entries.get(key);
    const shouldWrite =
      force || !existing || isPlaceholderValue(existing.value ?? "");

    if (!existing) {
      lines.push(`${key}=${serializeEnvValue(value)}`);
      added.push(key);
    } else if (shouldWrite) {
      lines[existing.index] = `${key}=${serializeEnvValue(value)}`;
      updated.push(key);
    } else {
      preserved.push(key);
    }
  }

  const finalLines = lines.filter((line, index) => {
    return index < lines.length - 1 || line !== "";
  });
  fs.writeFileSync(filePath, `${finalLines.join("\n")}\n`);

  return { added, updated, preserved, values: desired };
}

export function printEnvRepairSummary(result) {
  for (const key of result.added) {
    process.stdout.write(`[ok] env added: ${key}\n`);
  }
  for (const key of result.updated) {
    process.stdout.write(`[ok] env updated: ${key}\n`);
  }
  for (const key of result.preserved) {
    const value = result.values[key] ?? "";
    process.stdout.write(
      `[keep] env preserved: ${key} (${maskValue(value)})\n`,
    );
  }
}
