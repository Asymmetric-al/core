import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

const count = Number(process.argv[2]);
const adminDir = path.resolve(import.meta.dirname, "../../../../../apps/admin");
process.chdir(adminDir);
process.env.PAYLOAD_DISABLE_SCHEMA_PUSH = "1";

const adminRequire = createRequire(path.join(adminDir, "package.json"));
const { getPayload } = await import(
  pathToFileURL(adminRequire.resolve("payload")).href
);
const { default: config } = await import(
  path.join(adminDir, "payload.config.ts")
);
const { migrations } = await import(
  path.join(adminDir, "src", "migrations", "index.ts")
);

const payload = await getPayload({ config, importMap: {} });
let code = 0;
try {
  const selected = Number.isInteger(count)
    ? migrations.slice(0, count)
    : migrations;
  await payload.db.migrate({ migrations: selected });
  process.stdout.write("MIGRATED\n");
} catch (error) {
  code = 1;
  process.stdout.write(
    `MIGRATION_ERROR ${JSON.stringify(String((error as Error)?.message ?? error))}\n`,
  );
} finally {
  await payload.destroy().catch(() => undefined);
}
process.exit(code);
