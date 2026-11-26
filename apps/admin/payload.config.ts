import path from "node:path";
import { fileURLToPath } from "node:url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";

import { webStudioRefusalAfterError } from "./src/cms/auth/web-studio-refusal";
import { Media } from "./src/cms/collections/media";
import { Navigation } from "./src/cms/collections/navigation";
import { Pages } from "./src/cms/collections/pages";
import { PrincipalLinks } from "./src/cms/collections/principal-links";
import { SitePresentations } from "./src/cms/collections/site-presentations";
import { webStudioCreateFromTemplateEndpoint } from "./src/cms/create-from-template-endpoint";
import { keepDocumentLocksInOrganization } from "./src/cms/document-locks";
import {
  assertPayloadDatabaseConfiguration,
  resolvePayloadDatabaseConfig,
} from "./src/cms/payload-database-config";
import { resolvePayloadEmailAdapter } from "./src/cms/payload-runtime-integrations";
import { resolvePayloadSchemaPush } from "./src/cms/payload-schema-push";
import { resolvePayloadSecret } from "./src/cms/payload-secret";
import { addTenantConstraints } from "./src/cms/tenancy/constraints";

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
  idType: "uuid",
  allowIDOnCreate: true,
  blocksAsJSON: true,
  afterSchemaInit: [addTenantConstraints],
  pool: payloadDatabaseConfig.pool,
  disableCreateDatabase: payloadDatabaseConfig.disableCreateDatabase,
});

/**
 * The one place that refuses a database configuration a protected deployment
 * must not use (payload-database-config.ts): the migration connection in the
 * runtime, a login other than cms_runtime, a routing override, and the rest.
 * Payload builds its adapter here before it connects, on every path that
 * starts it: the Local API, the admin, and the REST route, which calls
 * Payload's handlers directly.
 */
const guardedDatabaseAdapter: typeof postgresDatabaseAdapter = {
  ...postgresDatabaseAdapter,
  init: (args) => {
    assertPayloadDatabaseConfiguration(payloadDatabaseConfig);
    return postgresDatabaseAdapter.init(args);
  },
};

// Payload's lock collection, which Payload adds while building, keeps locks
// inside the selected organization: its default access let any signed-in user
// lock another organization's document (AL-2675, council C3 and round 2 CR2;
// src/cms/document-locks.ts). Set on the built configuration, so a development
// server's hot reload keeps it.
export default buildConfig({
  admin: {
    theme: "light",
    // Short dates, as elsewhere in Mission Control ("Nov 9, 2026, 3:45 PM").
    dateFormat: "MMM d, yyyy, h:mm a",
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
        webStudioPagesNewFromTemplate: {
          Component:
            "/src/cms-ui/web-studio/flows/StandardPageFromTemplateView.tsx#StandardPageFromTemplateView",
          path: "/pages/new-from-template",
        },
      },
    },
    user: PrincipalLinks.slug,
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
  collections: [PrincipalLinks, SitePresentations, Pages, Navigation, Media],
  db: guardedDatabaseAdapter,
  editor: lexicalEditor(),
  email: resolvePayloadEmailAdapter(),
  graphQL: {
    disable: true,
  },
  llmInstructions: false,
  routes: {
    admin: "/web-studio",
    // Payload's REST routes sit under Web Studio's path (plan 5.2), so the
    // Web Studio tenant cookie, scoped to `/web-studio`, reaches them and
    // never reaches Mission Control's own `/api` routes.
    api: "/web-studio/api",
  },
  secret: resolvePayloadSecret(),
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
}).then(keepDocumentLocksInOrganization);
