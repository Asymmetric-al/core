import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { createLexicalRichText } from "./local-data.mjs";
import { adminAppDir } from "./paths.mjs";

const adminRequire = createRequire(path.join(adminAppDir, "package.json"));

const SCHEMA_CHANGE =
  /^\s*(?:create|alter|drop|truncate|grant|revoke|comment|reindex|cluster|refresh|security\s+label|reassign|import\s+foreign|set\s+(?:session\s+)?role|reset\s+role)\b/i;
const OUTSIDE_CMS =
  /\b(?:"?(?:public|auth|authz|platform|private|storage|extensions)"?)\s*\.\s*"?[a-z_]/i;

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

const fromAdmin = (...segments) =>
  import(pathToFileURL(path.join(adminAppDir, ...segments)).href);

async function loadPayload({ qualificationConfig = false } = {}) {
  const statements = recordStatements();
  const { getPayload, handleEndpoints, createPayloadRequest } = await import(
    pathToFileURL(adminRequire.resolve("payload")).href
  );
  const { default: config } = qualificationConfig
    ? await import(
        pathToFileURL(process.env.PAYLOAD_QUALIFICATION_CONFIG ?? "").href
      )
    : await fromAdmin("payload.config.ts");
  const { assertPayloadDatabaseConfiguration } = await fromAdmin(
    "src",
    "cms",
    "payload-database-config.ts",
  );
  const service = await fromAdmin("src", "cms", "ports", "service-port.ts");
  const actor = await fromAdmin("src", "cms", "ports", "actor-port.ts");
  const constraints = await fromAdmin(
    "src",
    "cms",
    "tenancy",
    "constraints.ts",
  );
  return {
    actor,
    assertPayloadDatabaseConfiguration,
    config,
    constraints,
    createPayloadRequest,
    getPayload,
    handleEndpoints,
    service,
    statements,
  };
}

function schemaChanges(statements) {
  return statements.filter((text) => SCHEMA_CHANGE.test(text));
}

const LEDGER = /payload_migrations/i;
const WRITE = /^\s*(?:insert|update|delete|merge|truncate|copy)\b/i;

function ledgerUse(statements) {
  const touching = statements.filter((text) => LEDGER.test(text));
  return { touching, writes: touching.filter((text) => WRITE.test(text)) };
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
      paths: (error?.data?.errors ?? []).map((item) => item.path),
    };
  }
}

async function restCall(handleEndpoints, config, pathname, init = {}) {
  const response = await handleEndpoints({
    config,
    request: new Request(
      new URL(pathname, "http://qualification.invalid"),
      init,
    ),
  });
  const text = await response.text();
  let body = null;
  try {
    body = JSON.parse(text);
  } catch {
    body = null;
  }
  return {
    status: response.status,
    contentType: response.headers.get("content-type"),
    errors: Array.isArray(body?.errors) ? body.errors.length : 0,
    message: typeof body?.message === "string" ? body.message : null,
    body,
  };
}

function docIds(result) {
  return result.ok ? result.value.docs.map((doc) => String(doc.id)) : null;
}

const editor = (tenantId) => ({
  id: randomUUID(),
  collection: "principal-links",
  tenantId,
  assignmentId: randomUUID(),
  staffRole: "development",
  isTenantAdmin: false,
});

export async function runConstraintList() {
  const { constraints } = await loadPayload();
  return { constraints: constraints.TENANT_CONSTRAINTS };
}

export async function runStartupProof() {
  const {
    assertPayloadDatabaseConfiguration,
    config,
    getPayload,
    handleEndpoints,
    service,
    statements,
  } = await loadPayload();

  assertPayloadDatabaseConfiguration();
  const payload = await getPayload({ config, importMap: {} });
  const startupStatements = [...statements];

  const identity = await payload.db.pool.query(
    "SELECT current_user, session_user /* qualification sentinel */",
  );

  const tenantA = randomUUID();
  const tenantB = randomUUID();
  const site = await service.createSitePresentation(payload, {
    siteId: randomUUID(),
    tenantId: tenantA,
  });
  const page = await service.serviceCreate(payload, {
    collection: "pages",
    data: {
      tenant: tenantA,
      site: site.id,
      title: "Published title",
      slug: "qualification-page",
      content: createLexicalRichText("Published body"),
      _status: "published",
    },
  });
  await service.serviceUpdate(payload, {
    collection: "pages",
    id: page.id,
    data: { title: "Unpublished draft title" },
    draft: true,
  });

  const allVersions = {
    docs: await service.serviceFind(payload, {
      collection: "pages",
      where: {},
      draft: true,
    }),
  };
  const versionRows = await payload.db.pool
    .query("SELECT id::text AS id, version__status AS status FROM cms._pages_v")
    .then((result) => result.rows)
    .catch(() => []);
  const draftVersion = versionRows.find((row) => row.status === "draft");

  const staffOfB = editor(tenantB);
  const staffOfA = editor(tenantA);

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
          tenant: tenantA,
          site: site.id,
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
        id: draftVersion?.id ?? versionRows[0]?.id,
      }),
    ),
    otherTenantStaffFindVersions: await outcome(() =>
      payload.findVersions({ collection: "pages", user: staffOfB, limit: 50 }),
    ),
    sameTenantStaffFindVersions: await outcome(() =>
      payload.findVersions({ collection: "pages", user: staffOfA, limit: 50 }),
    ),
  };

  const restRoutes = {
    configured: payload.config.routes.api,
    underWebStudio: await restCall(
      handleEndpoints,
      config,
      "/web-studio/api/pages?limit=1",
    ),
    underApi: await restCall(handleEndpoints, config, "/api/pages?limit=1"),
  };

  const allStatements = [...statements];
  await payload.destroy();

  return {
    identity: identity.rows[0],
    restRoutes: {
      configured: restRoutes.configured,
      underWebStudio: { ...restRoutes.underWebStudio, body: undefined },
      underApi: { ...restRoutes.underApi, body: undefined },
    },
    statementCount: allStatements.length,
    startupStatementCount: startupStatements.length,
    sentinelRecorded: allStatements.some((text) =>
      text.includes("qualification sentinel"),
    ),
    schemaChangesAtStartup: schemaChanges(startupStatements),
    schemaChanges: schemaChanges(allStatements),
    ledger: ledgerUse(allStatements),
    versions: {
      total: versionRows.length,
      draftVersionId: draftVersion ? String(draftVersion.id) : null,
      allDocs: allVersions.docs.length,
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

const lexicalWith = (node) => ({
  root: {
    type: "root",
    children: [
      {
        type: "paragraph",
        children: [node],
        direction: null,
        format: "",
        indent: 0,
        version: 1,
      },
    ],
    direction: null,
    format: "",
    indent: 0,
    version: 1,
  },
});

async function e2eRest({
  handleEndpoints,
  config,
  person,
  method,
  pathname,
  body,
}) {
  const e2e = await import(
    pathToFileURL(
      path.join(adminAppDir, "..", "..", "packages", "auth", "e2e-auth.ts"),
    ).href
  );
  const { webStudioTenantCookie } = await fromAdmin(
    "src",
    "cms",
    "web-studio-tenant-cookie.ts",
  );
  const identity = await e2e.createE2EAuthCookieValue({
    userId: person.id,
    role: "staff",
    tenantId: person.tenantId,
    memberships: [
      {
        id: person.assignmentId,
        tenantId: person.tenantId,
        role: "staff",
        staffRole: "development",
        isTenantAdmin: false,
      },
    ],
  });
  const selection = await webStudioTenantCookie({
    tenantId: person.tenantId,
    assignmentId: person.assignmentId,
  });
  return restCall(handleEndpoints, config, pathname, {
    method,
    headers: {
      origin: "http://qualification.invalid",
      cookie: `${e2e.E2E_AUTH_COOKIE_NAME}=${identity}; ${selection.name}=${selection.value}`,
      "x-asym-tenant": person.tenantId,
      "x-asym-assignment": person.assignmentId,
      "content-type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export async function runBaselineProof() {
  const {
    actor,
    config,
    createPayloadRequest,
    getPayload,
    handleEndpoints,
    service,
    statements,
  } = await loadPayload();
  const payload = await getPayload({ config, importMap: {} });
  const tenantA = randomUUID();
  const tenantB = randomUUID();
  const reqFor = (user) =>
    createPayloadRequest({ payload, req: { headers: new Headers(), user } });
  const person = async (tenantId) => {
    const user = editor(tenantId);
    await service.ensurePrincipalLink(payload, {
      userId: user.id,
      email: null,
    });
    return user;
  };
  const results = {};

  const siteA = await service.createSitePresentation(payload, {
    siteId: randomUUID(),
    tenantId: tenantA,
  });
  const siteB = await service.createSitePresentation(payload, {
    siteId: randomUUID(),
    tenantId: tenantB,
  });
  const editorA = await person(tenantA);

  const crossCreate = await outcome(async () =>
    actor.actorCreate(await reqFor(editorA), {
      collection: "pages",
      data: { site: siteB.id, title: "Cross", slug: "cross" },
      draft: true,
    }),
  );
  const ownPage = await actor.actorCreate(await reqFor(editorA), {
    collection: "pages",
    data: { site: siteA.id, title: "Own", slug: "own" },
    draft: true,
  });
  const crossDraft = await outcome(async () =>
    payload.update({
      collection: "pages",
      id: ownPage.id,
      data: { site: siteB.id },
      draft: true,
      overrideAccess: false,
      user: editorA,
    }),
  );
  results.crossTenantSite = {
    create: crossCreate.ok ? "accepted" : crossCreate.paths,
    laterDraft: crossDraft.ok ? "accepted" : crossDraft.paths,
  };

  const suppliedPresentation = randomUUID();
  const presentation = await service.createSitePresentation(payload, {
    siteId: suppliedPresentation,
    tenantId: tenantA,
  });
  const restPresentation = await e2eRest({
    handleEndpoints,
    config,
    person: editorA,
    method: "POST",
    pathname: "/web-studio/api/site-presentations",
    body: { id: randomUUID(), tenant: tenantA },
  });
  results.suppliedPresentationIds = {
    servicePortKept: presentation.id === suppliedPresentation,
    restCreateStatus: restPresentation.status,
  };

  const media = await service.registerMediaRecord(payload, {
    id: randomUUID(),
    tenantId: tenantA,
    alt: "Qualification image",
  });
  const blocksPage = await actor.actorCreate(await reqFor(editorA), {
    collection: "pages",
    data: {
      site: siteA.id,
      title: "Blocks",
      slug: "blocks",
      layout: [
        {
          blockType: "hero",
          eyebrow: "Old eyebrow",
          headline: "Headline",
          subheading: "Old subheading",
          backgroundImage: media.id,
        },
        {
          blockType: "rich-text",
          body: lexicalWith({
            type: "relationship",
            format: "",
            relationTo: "media",
            value: media.id,
            version: 2,
          }),
        },
      ],
      content: lexicalWith({
        type: "relationship",
        format: "",
        relationTo: "media",
        value: media.id,
        version: 2,
      }),
    },
    draft: true,
  });
  const readAt = async (depth) =>
    payload.findByID({
      collection: "pages",
      id: blocksPage.id,
      depth,
      draft: true,
      overrideAccess: false,
      user: editorA,
    });
  const shape = (doc) => {
    const hero = doc.layout?.[0] ?? {};
    const rich = doc.layout?.[1]?.body?.root?.children?.[0]?.children?.[0];
    const content = doc.content?.root?.children?.[0]?.children?.[0];
    const valueOf = (value) =>
      value && typeof value === "object"
        ? { id: value.id ?? null, alt: value.alt ?? null }
        : (value ?? null);
    return {
      heroImage: valueOf(hero.backgroundImage),
      richTextNode: valueOf(rich?.value),
      contentNode: valueOf(content?.value),
    };
  };
  results.jsonBlocks = {
    pageId: blocksPage.id,
    mediaId: media.id,
    depth0: shape(await readAt(0)),
    depth1: shape(await readAt(1)),
  };

  const statusTarget = await actor.actorCreate(await reqFor(editorA), {
    collection: "pages",
    data: { site: siteA.id, title: "Status", slug: "status" },
    draft: true,
  });
  const before = statements.length;
  const statusWrite = await e2eRest({
    handleEndpoints,
    config,
    person: editorA,
    method: "PATCH",
    pathname: `/web-studio/api/pages/${statusTarget.id}`,
    body: { _status: "published" },
  });
  const statusStatements = statements.slice(before);
  const after = await service.serviceFind(payload, {
    collection: "pages",
    where: { id: { equals: statusTarget.id } },
  });
  results.restStatusWrite = {
    status: statusWrite.status,
    rowStatus: after[0]?._status ?? null,
    statements: statusStatements.length,
    outsideCms: statusStatements.filter((text) => OUTSIDE_CMS.test(text)),
  };

  const seedLogin = "11111111-1111-1111-1111-111111111111";
  const seedSite = "ffbeafc8-f85f-a2c9-5493-d62f5003e3b8";
  const seedMedia = "9ad2e745-8c83-f424-a21f-8dc1cafa97b9";
  const seedTenant = "11111111-2222-3333-4444-555555555555";
  const links = [];
  for (let attempt = 0; attempt < 2; attempt += 1) {
    links.push(
      await outcome(() =>
        service.ensurePrincipalLink(payload, {
          userId: seedLogin,
          email: null,
        }),
      ),
    );
  }
  const seedEditor = { ...editor(seedTenant), id: seedLogin };
  const ownRow = await outcome(() =>
    payload.findByID({
      collection: "principal-links",
      id: seedLogin,
      overrideAccess: false,
      user: seedEditor,
    }),
  );
  await service.createSitePresentation(payload, {
    siteId: seedSite,
    tenantId: seedTenant,
  });
  const seedPage = await outcome(async () =>
    actor.actorCreate(await reqFor(seedEditor), {
      collection: "pages",
      data: { site: seedSite, title: "Seed", slug: "seed" },
      draft: true,
    }),
  );
  const otherSite = await service.createSitePresentation(payload, {
    siteId: randomUUID(),
    tenantId: seedTenant,
  });
  const otherPage = await actor.actorCreate(await reqFor(seedEditor), {
    collection: "pages",
    data: { site: otherSite.id, title: "Other", slug: "other" },
    draft: true,
  });
  const seedNav = seedPage.ok
    ? await outcome(async () =>
        actor.actorCreate(await reqFor(seedEditor), {
          collection: "navigation",
          data: {
            site: seedSite,
            label: "Seed menu",
            items: [{ label: "Seed", page: seedPage.value.id }],
          },
        }),
      )
    : { ok: false };
  const notEquals = await payload.find({
    collection: "pages",
    draft: true,
    limit: 0,
    pagination: false,
    overrideAccess: false,
    user: seedEditor,
    where: { site: { not_equals: seedSite } },
  });
  await service.registerMediaRecord(payload, {
    id: seedMedia,
    tenantId: seedTenant,
    alt: "Seed image",
  });
  const holder = await person(seedTenant);
  const remover = await person(seedTenant);
  const lockReq = await reqFor(holder);
  await payload.db.create({
    collection: "payload-locked-documents",
    data: {
      document: { relationTo: "media", value: seedMedia },
      user: { relationTo: "principal-links", value: holder.id },
    },
    req: lockReq,
  });
  await payload
    .delete({
      collection: "media",
      overrideAccess: true,
      overrideLock: false,
      user: remover,
      where: { id: { in: [seedMedia] } },
    })
    .catch(() => undefined);
  const mediaLeft = await service.serviceFind(payload, {
    collection: "media",
    where: { id: { equals: seedMedia } },
  });
  results.nonRfcUuids = {
    principalLinks: links.map((link) =>
      link.ok ? link.value.id : link.message,
    ),
    ownRow: ownRow.ok ? ownRow.value.id : ownRow.message,
    seedSitePage: seedPage.ok ? "saved" : seedPage.message,
    seedSiteNavigation: seedNav.ok ? "saved" : (seedNav.message ?? "skipped"),
    notEqualsExcludesSeedSite:
      seedPage.ok &&
      !notEquals.docs.some((doc) => doc.id === seedPage.value.id) &&
      notEquals.docs.some((doc) => doc.id === otherPage.id),
    lockedMediaKept: mediaLeft.length === 1,
  };

  await payload.destroy();
  return results;
}

export async function runBlocksRead() {
  const { config, getPayload, service } = await loadPayload({
    qualificationConfig: true,
  });
  const payload = await getPayload({ config, importMap: {} });
  const pageId = process.env.PAYLOAD_QUALIFICATION_PAGE_ID;
  const [doc] = await service.serviceFind(payload, {
    collection: "pages",
    where: { id: { equals: pageId } },
    draft: true,
  });
  const hero = doc?.layout?.[0] ?? null;
  await payload.destroy();
  return { hero };
}

export async function runDeletedMediaRead() {
  const { config, getPayload, service } = await loadPayload();
  const payload = await getPayload({ config, importMap: {} });
  const pageId = process.env.PAYLOAD_QUALIFICATION_PAGE_ID;
  const mediaId = process.env.PAYLOAD_QUALIFICATION_MEDIA_ID;
  await service.deleteMediaRecord(payload, mediaId);
  const [doc] = await service.serviceFind(payload, {
    collection: "pages",
    where: { id: { equals: pageId } },
    draft: true,
    depth: 1,
  });
  const hero = doc?.layout?.[0] ?? {};
  const rich = doc?.layout?.[1]?.body?.root?.children?.[0]?.children?.[0];
  await payload.destroy();
  return {
    heroImage: hero.backgroundImage ?? null,
    richTextNodeValue: rich?.value ?? null,
  };
}

export async function runStartAttempt() {
  const { config, getPayload, statements } = await loadPayload();
  const started = await outcome(() => getPayload({ config, importMap: {} }));
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
