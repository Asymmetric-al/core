import path from "node:path";
import { fileURLToPath } from "node:url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { sharpTransformer } from "@payloadcms/transformer-sharp";
import { buildConfig } from "payload";
import sharp from "sharp";

import { webStudioRefusalAfterError } from "./src/cms/auth/web-studio-refusal";
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
import {
  assertPayloadDatabaseConfiguration,
  resolvePayloadDatabaseConfig,
} from "./src/cms/payload-database-config";
import {
  createPayloadStorageAdapters,
  resolvePayloadEmailAdapter,
} from "./src/cms/payload-runtime-integrations";
import { resolvePayloadSchemaPush } from "./src/cms/payload-schema-push";
import { resolvePayloadSecret } from "./src/cms/payload-secret";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const payloadDatabaseConfig = resolvePayloadDatabaseConfig();

if (payloadDatabaseConfig.warning) {
  console.warn(payloadDatabaseConfig.warning);
}

const postgresDatabaseAdapter = postgresAdapter({
  // Never against a non-loopback host (WP0); see payload-schema-push.ts.
  push: resolvePayloadSchemaPush({
    connectionString: payloadDatabaseConfig.pool.connectionString,
    env: process.env,
  }),
  schemaName: "cms",
  pool: payloadDatabaseConfig.pool,
  disableCreateDatabase: payloadDatabaseConfig.disableCreateDatabase,
});

/**
 * The one place that refuses a database configuration a protected deployment
 * must not use (payload-database-config.ts): the migration connection in the
 * runtime, a login other than cms_runtime, a routing override, and the rest.
 * Payload builds its adapter here before it connects, on every path that
 * starts it: the Local API, the admin, and the REST and GraphQL routes, which
 * call Payload's handlers directly.
 */
const guardedDatabaseAdapter: typeof postgresDatabaseAdapter = {
  ...postgresDatabaseAdapter,
  init: (args) => {
    assertPayloadDatabaseConfiguration(payloadDatabaseConfig);
    return postgresDatabaseAdapter.init(args);
  },
};

export default buildConfig({
  admin: {
    theme: "light",
    // Short dates, as elsewhere in Mission Control ("Nov 9, 2026, 3:45 PM").
    dateFormat: "MMM d, yyyy, h:mm a",
    dependencies: {
      vercelBlobClientUploadHandler: {
        type: "component",
        path: "@payloadcms/storage-vercel-blob/client#VercelBlobClientUploadHandler",
      },
    },
    components: {
      graphics: {
        Icon: "/src/cms-ui/brand/Icon.tsx#Icon",
        Logo: "/src/cms-ui/brand/Logo.tsx#Logo",
      },
      // Studio chrome for stock Payload screens; native screens render
      // StudioLayout themselves and these slots step aside.
      header: [
        "/src/cms-ui/web-studio/shell/studio-template-chrome.tsx#StudioTemplateHeader",
      ],
      Nav: "/src/cms-ui/web-studio/shell/studio-template-chrome.tsx#StudioTemplateNav",
      views: {
        account: {
          Component:
            "/src/cms-ui/web-studio/shell/studio-account-view.tsx#StudioAccountView",
        },
        dashboard: {
          Component:
            "/src/cms-ui/web-studio/dashboard/WebStudioDashboardView.tsx#WebStudioDashboardView",
        },
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
  hooks: {
    // A Web Studio REST call the strategy signed nobody in for is answered
    // with JSON that says why: 401 for an ended session, 409 for a page
    // opened for another organization (plan 5.2; auth/web-studio-refusal.ts).
    afterError: [webStudioRefusalAfterError],
  },
  i18n: {
    translations: {
      en: {
        general: {
          noLabel: "Not set",
          payloadSettings: "Web Studio preferences",
          resetPreferences: "Reset preferences",
        },
      },
    },
  },
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
  db: guardedDatabaseAdapter,
  editor: lexicalEditor(),
  email: resolvePayloadEmailAdapter(),
  llmInstructions: false,
  routes: {
    admin: "/web-studio",
    // Payload's REST routes sit under Web Studio's path (plan 5.2), so the
    // Web Studio tenant cookie, scoped to `/web-studio`, reaches them and
    // never reaches Mission Control's own `/api` routes.
    api: "/web-studio/api",
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
