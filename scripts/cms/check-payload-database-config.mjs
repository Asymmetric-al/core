import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  isProtectedPayloadDeployment,
  PayloadDatabaseConfigurationError,
  resolvePayloadDatabaseConfig,
} from "../../apps/admin/src/cms/payload-database-config.ts";

export function checkPayloadDatabaseConfigForBuild(env = process.env) {
  if (!isProtectedPayloadDeployment(env)) {
    return { ok: true, skipped: true };
  }

  try {
    const config = resolvePayloadDatabaseConfig(env);
    if (config.issue) {
      return { ok: false, code: config.issue.code };
    }
    return { ok: true, skipped: false };
  } catch (error) {
    if (error instanceof PayloadDatabaseConfigurationError) {
      return { ok: false, code: error.code };
    }
    return { ok: false, code: "payload-database-config-error" };
  }
}

const isDirectRun =
  typeof process.argv[1] === "string" &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isDirectRun) {
  const result = checkPayloadDatabaseConfigForBuild(process.env);
  if (!result.ok) {
    process.stderr.write(
      `error: Payload database configuration check failed (${result.code})\n`,
    );
    process.exit(1);
  }
}
