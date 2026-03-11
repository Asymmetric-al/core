import path from "node:path";
import { fileURLToPath } from "node:url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";

import { CmsUsers } from "./src/cms/collections/cms-users";
import { Media } from "./src/cms/collections/media";
import { MinistryUpdates } from "./src/cms/collections/ministry-updates";
import { MissionaryProfiles } from "./src/cms/collections/missionary-profiles";
import { Navigation } from "./src/cms/collections/navigation";
import { Pages } from "./src/cms/collections/pages";
import { Tenants } from "./src/cms/collections/tenants";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const defaultLocalDatabaseUrl =
  "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

function resolvePayloadSecret() {
  if (process.env.PAYLOAD_SECRET) {
    return process.env.PAYLOAD_SECRET;
  }

  if (
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "test"
  ) {
    return "payload-local-dev-secret";
  }

  throw new Error("PAYLOAD_SECRET must be configured outside local development.");
}

export default buildConfig({
  admin: {
    components: {
      beforeNav: ["/src/cms-ui/root/Nav.tsx#Nav"],
      graphics: {
        Icon: "/src/cms-ui/brand/Icon.tsx#Icon",
        Logo: "/src/cms-ui/brand/Logo.tsx#Logo",
      },
      header: ["/src/cms-ui/root/Header.tsx#Header"],
    },
    user: CmsUsers.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    CmsUsers,
    Tenants,
    Pages,
    Navigation,
    MissionaryProfiles,
    MinistryUpdates,
    Media,
  ],
  db: postgresAdapter({
    schemaName: "cms",
    pool: {
      connectionString:
        process.env.PAYLOAD_DATABASE_URI ??
        process.env.SUPABASE_DB_URL ??
        defaultLocalDatabaseUrl,
    },
  }),
  editor: lexicalEditor(),
  secret: resolvePayloadSecret(),
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  sharp,
});
