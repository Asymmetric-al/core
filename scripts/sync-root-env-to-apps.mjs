import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const src = path.join(repoRoot, ".env.local");

if (!fs.existsSync(src)) {
  process.stderr.write(
    "[sync-root-env] No repo-root .env.local found; apps may miss env. Create one from your secrets provider.\n",
  );
  process.exit(0);
}

const apps = ["admin", "donor", "missionary"];
for (const app of apps) {
  const dest = path.join(repoRoot, "apps", app, ".env.local");
  fs.copyFileSync(src, dest);
}

process.stdout.write(
  `[sync-root-env] Mirrored .env.local → apps/{${apps.join(",")}}/.env.local\n`,
);
