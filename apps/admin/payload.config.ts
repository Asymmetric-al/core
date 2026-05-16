import path from "node:path";
import { fileURLToPath } from "node:url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";

import { CmsUsers } from "./src/cms/collections/cms-users";
import { Media } from "./src/cms/collections/media";
import { MinistryUpdates } from "./src/cms/collections/ministry-updates";
import { MissionaryGivingPages } from "./src/cms/collections/missionary-giving-pages";
import { MissionaryProfiles } from "./src/cms/collections/missionary-profiles";
import { Navigation } from "./src/cms/collections/navigation";
import { PageTemplates } from "./src/cms/collections/page-templates";
import { Pages } from "./src/cms/collections/pages";
import { ProjectPages } from "./src/cms/collections/project-pages";
import { Tenants } from "./src/cms/collections/tenants";
import { webStudioCreateFromTemplateEndpoint } from "./src/cms/create-from-template-endpoint";
import { resolvePayloadDatabaseConfig } from "./src/cms/payload-database-config";
import {
  createPayloadStoragePlugins,
  resolvePayloadEmailAdapter,
} from "./src/cms/payload-runtime-integrations";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const payloadDatabaseConfig = resolvePayloadDatabaseConfig();

if (payloadDatabaseConfig.warning) {
  console.warn(payloadDatabaseConfig.warning);
}

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

  throw new Error(
    "PAYLOAD_SECRET must be configured outside local development.",
  );
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
      views: {
        webStudioTemplates: {
          Component:
            "/src/cms-ui/web-studio/flows/TemplateGalleryView.tsx#TemplateGalleryView",
          path: "/templates",
        },
        webStudioMissionaries: {
          Component:
            "/src/cms-ui/web-studio/flows/MissionariesHubView.tsx#MissionariesHubView",
          path: "/missionaries",
        },
        webStudioPagesGive: {
          Component:
            "/src/cms-ui/web-studio/flows/MissionaryGivingCreateView.tsx#MissionaryGivingCreateView",
          path: "/pages/give",
        },
        webStudioPagesNewFromTemplate: {
          Component:
            "/src/cms-ui/web-studio/flows/StandardPageFromTemplateView.tsx#StandardPageFromTemplateView",
          path: "/pages/new-from-template",
        },
        webStudioProjectsNew: {
          Component:
            "/src/cms-ui/web-studio/flows/ProjectPageCreateView.tsx#ProjectPageCreateView",
          path: "/projects/new",
        },
        webStudioMinistryUpdatesNew: {
          Component:
            "/src/cms-ui/web-studio/flows/MinistryUpdateCreateView.tsx#MinistryUpdateCreateView",
          path: "/ministry-updates/new",
        },
      },
    },
    user: CmsUsers.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  endpoints: [webStudioCreateFromTemplateEndpoint],
  collections: [
    CmsUsers,
    Tenants,
    Pages,
    PageTemplates,
    MissionaryGivingPages,
    ProjectPages,
    Navigation,
    MissionaryProfiles,
    MinistryUpdates,
    Media,
  ],
  db: postgresAdapter({
    push: process.env.PAYLOAD_DISABLE_SCHEMA_PUSH === "1" ? false : undefined,
    schemaName: "cms",
    pool: payloadDatabaseConfig.pool,
  }),
  editor: lexicalEditor(),
  email: resolvePayloadEmailAdapter(),
  plugins: createPayloadStoragePlugins(),
  routes: {
    admin: "/web-studio",
  },
  secret: resolvePayloadSecret(),
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  sharp,
});
