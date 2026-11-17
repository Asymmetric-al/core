// Loaded through tsx's tsImport, as the Payload CLI loads its own entry, so
// that the TypeScript config and the pinned `payload` share one module graph.
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { createLexicalRichText } from "./local-data.mjs";
import { adminAppDir } from "./paths.mjs";

const adminRequire = createRequire(path.join(adminAppDir, "package.json"));

/** Statements that change a schema, a privilege or a session's authority. */
const SCHEMA_CHANGE =
  /^\s*(?:create|alter|drop|truncate|grant|revoke|comment|reindex|cluster|refresh|security\s+label|reassign|import\s+foreign|set\s+(?:session\s+)?role|reset\s+role)\b/i;

/**
 * Records every statement node-postgres sends for the pinned Payload adapter.
 * It patches the `pg` module that `@payloadcms/db-postgres` itself resolves.
 */
function recordStatements() {
  const adapterEntry = adminRequire.resolve("@payloadcms/db-postgres");
  const pg = createRequire(adapterEntry)("pg");
  const statements = [];
  const original = pg.Client.prototype.query;
  pg.Client.prototype.query = function query(config, ...rest) {
    const text = typeof config === "string" ? config : config?.text;
    if (typeof text === "string") {
      statements.push(text);
    }
    return original.call(this, config, ...rest);
  };
  return statements;
}

async function loadPayload() {
  const statements = recordStatements();
  const { getPayload } = await import(
    pathToFileURL(adminRequire.resolve("payload")).href
  );
  const { default: config } = await import(
    pathToFileURL(path.join(adminAppDir, "payload.config.ts")).href
  );
  const { assertPayloadDatabaseConfiguration } = await import(
    pathToFileURL(
      path.join(adminAppDir, "src", "cms", "payload-database-config.ts"),
    ).href
  );
  const { buildPublicReadRequestContext } = await import(
    pathToFileURL(
      path.join(adminAppDir, "src", "cms", "access", "public-read.ts"),
    ).href
  );
  return {
    assertPayloadDatabaseConfiguration,
    buildPublicReadRequestContext,
    config,
    getPayload,
    statements,
  };
}

function schemaChanges(statements) {
  return statements.filter((text) => SCHEMA_CHANGE.test(text));
}

async function outcome(run) {
  try {
    const value = await run();
    return { ok: true, value };
  } catch (error) {
    return {
      ok: false,
      name: error?.name ?? "Error",
      status: error?.status ?? null,
      message: String(error?.message ?? error).slice(0, 300),
    };
  }
}

function docIds(result) {
  return result.ok ? result.value.docs.map((doc) => String(doc.id)) : null;
}

/**
 * Starts Payload as configured (expected: cms_runtime, schema push off), then
 * exercises the Local API defaults and version-read access on the pin.
 */
export async function runStartupProof() {
  const {
    assertPayloadDatabaseConfiguration,
    buildPublicReadRequestContext,
    config,
    getPayload,
    statements,
  } = await loadPayload();

  assertPayloadDatabaseConfiguration();
  const payload = await getPayload({ config });
  const startupStatements = [...statements];

  const identity = await payload.db.pool.query(
    "SELECT current_user, session_user /* qualification sentinel */",
  );

  const tenantA = await payload.create({
    collection: "tenants",
    data: { name: "Qualification A", slug: "qualification-a" },
    overrideAccess: true,
  });
  const tenantB = await payload.create({
    collection: "tenants",
    data: { name: "Qualification B", slug: "qualification-b" },
    overrideAccess: true,
  });

  const page = await payload.create({
    collection: "pages",
    data: {
      tenant: tenantA.id,
      title: "Published title",
      slug: "qualification-page",
      content: createLexicalRichText("Published body"),
      _status: "published",
    },
    overrideAccess: true,
  });
  await payload.update({
    collection: "pages",
    id: page.id,
    data: { title: "Unpublished draft title" },
    draft: true,
    overrideAccess: true,
  });

  const allVersions = await payload.findVersions({
    collection: "pages",
    overrideAccess: true,
    limit: 50,
  });
  const draftVersion = allVersions.docs.find(
    (doc) => doc.version?._status === "draft",
  );

  const staffOfB = {
    collection: "cms-users",
    id: 999_001,
    role: "staff",
    tenantId: tenantB.id,
  };
  const staffOfA = { ...staffOfB, id: 999_002, tenantId: tenantA.id };
  const publicContext = buildPublicReadRequestContext({
    cmsTenantId: tenantA.id,
  });

  const checks = {
    anonymousFind: await outcome(() => payload.find({ collection: "pages" })),
    anonymousFindByID: await outcome(() =>
      payload.findByID({ collection: "pages", id: page.id }),
    ),
    anonymousCount: await outcome(() => payload.count({ collection: "pages" })),
    anonymousCreate: await outcome(() =>
      payload.create({
        collection: "pages",
        data: {
          tenant: tenantA.id,
          title: "Anonymous",
          slug: "anonymous",
          content: createLexicalRichText("Anonymous"),
        },
      }),
    ),
    overrideFind: await outcome(() =>
      payload.find({ collection: "pages", overrideAccess: true }),
    ),
    anonymousFindVersions: await outcome(() =>
      payload.findVersions({ collection: "pages" }),
    ),
    anonymousFindVersionByID: await outcome(() =>
      payload.findVersionByID({
        collection: "pages",
        id: draftVersion?.id ?? allVersions.docs[0]?.id,
      }),
    ),
    publicReadFindVersions: await outcome(() =>
      payload.findVersions({
        collection: "pages",
        context: publicContext,
        limit: 50,
      }),
    ),
    otherTenantStaffFindVersions: await outcome(() =>
      payload.findVersions({ collection: "pages", user: staffOfB, limit: 50 }),
    ),
    sameTenantStaffFindVersions: await outcome(() =>
      payload.findVersions({ collection: "pages", user: staffOfA, limit: 50 }),
    ),
  };

  const allStatements = [...statements];
  await payload.destroy();

  return {
    identity: identity.rows[0],
    statementCount: allStatements.length,
    startupStatementCount: startupStatements.length,
    sentinelRecorded: allStatements.some((text) =>
      text.includes("qualification sentinel"),
    ),
    schemaChangesAtStartup: schemaChanges(startupStatements),
    schemaChanges: schemaChanges(allStatements),
    versions: {
      total: allVersions.totalDocs,
      draftVersionId: draftVersion ? String(draftVersion.id) : null,
      publishedVersionIds: allVersions.docs
        .filter((doc) => doc.version?._status === "published")
        .map((doc) => String(doc.id)),
    },
    checks: Object.fromEntries(
      Object.entries(checks).map(([name, result]) => [
        name,
        result.ok
          ? {
              ok: true,
              ids: result.value?.docs ? docIds(result) : undefined,
              totalDocs: result.value?.totalDocs,
              id:
                result.value?.id !== undefined
                  ? String(result.value.id)
                  : undefined,
            }
          : result,
      ]),
    ),
  };
}

/**
 * Starts Payload with schema push left on. With cms_runtime the push must
 * fail before it changes anything.
 */
export async function runPushAttempt() {
  const { config, getPayload, statements } = await loadPayload();
  const started = await outcome(() => getPayload({ config }));
  if (started.ok) {
    await started.value.destroy();
  }
  return {
    started: started.ok,
    error: started.ok ? null : started,
    schemaChanges: schemaChanges(statements),
    statementCount: statements.length,
  };
}
