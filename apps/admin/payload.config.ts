import path from "node:path";
import { fileURLToPath } from "node:url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { sharpTransformer } from "@payloadcms/transformer-sharp";
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
  createPayloadStorageAdapters,
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
    dependencies: {
      vercelBlobClientUploadHandler: {
        type: "component",
        path: "@payloadcms/storage-vercel-blob/client#VercelBlobClientUploadHandler",
      },
    },
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
  llmInstructions: false,
  routes: {
    admin: "/web-studio",
  },
  secret: resolvePayloadSecret(),
  storage: createPayloadStorageAdapters(),
  upload: {
    transformers: [
      sharpTransformer({
        sharp,
        collections: {
          media: {
            variants: [
              { name: "thumbnail", width: 320, height: 320 },
              { name: "card", width: 960, height: 540 },
            ],
          },
        },
      }),
    ],
  },
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});
