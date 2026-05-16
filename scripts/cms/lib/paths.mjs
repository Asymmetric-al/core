import path from "node:path";
import { fileURLToPath } from "node:url";

export const cmsScriptsDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

export const repoRoot = path.resolve(cmsScriptsDir, "..", "..");
export const rootEnvPath = path.join(repoRoot, ".env.local");
export const adminAppDir = path.join(repoRoot, "apps", "admin");
export const adminMediaDir = path.join(adminAppDir, "media");
export const adminImportMapPath = path.join(
  adminAppDir,
  "app",
  "(payload)",
  "web-studio",
  "importMap.js",
);
export const localCmsTmpDir = path.join(repoRoot, ".tmp", "cms-local");
