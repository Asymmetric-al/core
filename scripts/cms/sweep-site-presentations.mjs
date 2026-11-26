import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ensureSitePresentation } from "../../apps/admin/src/cms/site-presentation-step.ts";
import { isLoopbackDatabaseUrl } from "../../packages/env/src/database-url.mjs";
import { assertDatabaseTarget } from "../release/lib/database-target.mjs";
import {
  RELEASE_ENVIRONMENTS,
  readDatabaseCa,
} from "../release/release-database.mjs";
import { uuidKey } from "./lib/site-presentation-records.mjs";
import { scrubbed } from "./lib/sweep-output.mjs";
import { adminAppDir } from "./lib/paths.mjs";

export const SWEEP_ROLE = "cms_runtime";

export function assertSweepTarget(env = process.env) {
  const environment = env.CMS_SWEEP_ENVIRONMENT ?? "";
  if (!Object.hasOwn(RELEASE_ENVIRONMENTS, environment)) {
    throw new Error("CMS_SWEEP_ENVIRONMENT must be production or preview.");
  }
  const databaseUrl = env.PAYLOAD_DATABASE_URI ?? "";
  assertDatabaseTarget({
    databaseUrl,
    projectRef: env.CMS_SWEEP_PROJECT_REF,
    role: SWEEP_ROLE,
    forbiddenRefs: RELEASE_ENVIRONMENTS[environment].forbiddenRefs,
    allowLoopback: env.CMS_SWEEP_ALLOW_LOOPBACK === "1",
  });
  const login = decodeURIComponent(new URL(databaseUrl).username);
  if (login.split(".")[0] !== SWEEP_ROLE) {
    throw new Error(`The Site presentation sweep logs in as ${SWEEP_ROLE}.`);
  }
  if (!isLoopbackDatabaseUrl(databaseUrl)) {
    readDatabaseCa(env.PAYLOAD_DATABASE_SSL_CA, {
      name: "PAYLOAD_DATABASE_SSL_CA",
    });
  }
}

export function failureText(error, env = process.env) {
  const message = error instanceof Error ? error.message : String(error);
  let password = "";
  try {
    password = decodeURIComponent(
      new URL(env.PAYLOAD_DATABASE_URI ?? "").password,
    );
  } catch {
    password = "";
  }
  return scrubbed(message, [env.PAYLOAD_SECRET, password]);
}

export function readSweepInput(text) {
  let value;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error("The sweep's input is not JSON.");
  }
  if (!Array.isArray(value)) {
    throw new Error("The sweep's input is not a list of Sites.");
  }
  return value.map((entry) => {
    const keys =
      entry && typeof entry === "object" ? Object.keys(entry).sort() : [];
    const id = uuidKey(entry?.id);
    const tenantId = uuidKey(entry?.tenantId);
    if (keys.join(",") !== "id,tenantId" || id === null || tenantId === null) {
      throw new Error(
        "Each Site the sweep is given is exactly an id and a tenantId, both UUIDs.",
      );
    }
    return { id, tenantId };
  });
}

export async function presentSites(payload, sites, { log = console.log } = {}) {
  const core = new Map(sites.map((site) => [site.id, site]));
  const readSite = async (siteId) => core.get(uuidKey(siteId) ?? "") ?? null;
  let presented = 0;
  for (const site of sites) {
    await ensureSitePresentation(payload, { siteId: site.id, readSite });
    presented += 1;
  }
  log(`Site presentations: ${presented} of ${sites.length} Sites have theirs.`);
  return presented;
}

async function main() {
  assertSweepTarget();
  const sites = readSweepInput(readFileSync(0, "utf8"));
  if (sites.length === 0) return;
  process.chdir(adminAppDir);
  const requireFromAdmin = createRequire(
    path.join(adminAppDir, "package.json"),
  );
  const [{ getPayload }, { default: config }] = await Promise.all([
    import(requireFromAdmin.resolve("payload")),
    import("../../apps/admin/payload.config.ts"),
  ]);
  const payload = await getPayload({ config, importMap: {} });
  try {
    await presentSites(payload, sites);
  } finally {
    await payload.destroy();
  }
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(`sweep-site-presentations: ${failureText(error)}`);
      process.exit(1);
    });
}
