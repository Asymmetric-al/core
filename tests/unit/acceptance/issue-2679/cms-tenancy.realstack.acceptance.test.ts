import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  bootCmsStack,
  internalLink,
  lexical,
  relationshipNode,
  textNode,
  uploadNode,
  type CmsStack,
  type Doc,
  type Person,
} from "./cms-harness";

vi.mock(
  "@payload-config",
  () => import("../../../../apps/admin/payload.config"),
);

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2679 WP6 part 2b: the CMS keeps every document inside its organization (real stack, as cms_runtime)",
  { timeout: 120_000 },
  () => {
    let s: CmsStack;
    const A = randomUUID();
    const B = randomUUID();
    let siteA: Doc;
    let siteA2: Doc;
    let siteB: Doc;
    let mediaA: Doc;
    let mediaB: Doc;
    let pageA: Doc;
    let pageA2: Doc;
    let pageB: Doc;
    let navA: Doc;
    let navB: Doc;
    let editorA: Person;
    let viewerA: Person;
    let editorB: Person;

    beforeAll(async () => {
      s = await bootCmsStack();
      siteA = await s.site(A);
      siteA2 = await s.site(A);
      siteB = await s.site(B);
      mediaA = await s.media(A);
      mediaB = await s.media(B);
      pageA = await s.page(A, siteA.id);
      pageA2 = await s.page(A, siteA2.id);
      pageB = await s.page(B, siteB.id);
      navA = await s.navigation(A, siteA.id);
      navB = await s.navigation(B, siteB.id);
      editorA = await s.person(A);
      viewerA = await s.person(A, null);
      editorB = await s.person(B);
    }, 180_000);

    afterAll(async () => {
      await s?.cleanup();
    }, 120_000);

    const asA = (extra: Record<string, unknown> = {}) => ({
      overrideAccess: false,
      user: editorA,
      ...extra,
    });

    const versionsOf = async (id: string) =>
      Number(
        (
          await s.admin.query(
            "select count(*) from cms._pages_v where parent_id = $1",
            [id],
          )
        ).rows[0].count,
      );

    const row = async (table: string, id: string) =>
      (await s.admin.query(`select * from cms.${table} where id = $1`, [id]))
        .rows[0] as Record<string, unknown> | undefined;

    describe("test 1: isolation and write limits", () => {
      const others = () =>
        [
          ["site-presentations", siteB],
          ["pages", pageB],
          ["navigation", navB],
          ["media", mediaB],
        ] as const;

      it("staff of A cannot read or list B's presentation, page, navigation or media (actor port and Local API)", async () => {
        for (const [collection, doc] of others()) {
          const read = await s.settle(
            s.payload.findByID(asA({ collection, id: doc.id, draft: true })),
          );
          expect(read.ok, collection).toBe(false);
          const listed = await s.payload.find(
            asA({ collection, draft: true, limit: 0, pagination: false }),
          );
          expect(
            listed.docs.every((item) => item.tenant === A),
            collection,
          ).toBe(true);
          expect(listed.docs.map((item) => item.id)).not.toContain(doc.id);
          const viaPort = await s.actor.actorFind(await s.reqFor(editorA), {
            collection,
            where: { id: { equals: doc.id } },
          });
          expect(viaPort, collection).toEqual([]);
        }
      });

      it("staff of A cannot update or delete B's page, navigation or media, and B's rows do not change", async () => {
        for (const [collection, doc] of others()) {
          const before = await row(collection.replace("-", "_"), doc.id);
          const updated = await s.settle(
            s.payload.update(
              asA({
                collection,
                id: doc.id,
                data: { title: "x", label: "x", alt: "x" },
              }),
            ),
          );
          expect(updated.ok, collection).toBe(false);
          const deleted = await s.settle(
            s.payload.delete(asA({ collection, id: doc.id })),
          );
          expect(deleted.ok, collection).toBe(false);
          expect(await row(collection.replace("-", "_"), doc.id)).toEqual(
            before,
          );
        }
      });

      it("staff of A cannot list or read B's page versions, nor restore one, over the Local API and REST", async () => {
        const versionsB = await s.service.serviceFind(s.payload as never, {
          collection: "pages",
          where: {},
        });
        expect(versionsB.length).toBeGreaterThan(0);
        const bVersion = (
          await s.admin.query(
            "select id from cms._pages_v where parent_id = $1 limit 1",
            [pageB.id],
          )
        ).rows[0].id as string;
        const listed = await s.payload.findVersions(
          asA({ collection: "pages", limit: 0, pagination: false }),
        );
        expect(listed.docs.map((doc) => doc.id)).not.toContain(bVersion);
        expect(
          (
            await s.settle(
              s.payload.findVersionByID(
                asA({ collection: "pages", id: bVersion }),
              ),
            )
          ).ok,
        ).toBe(false);
        expect(
          (
            await s.settle(
              s.payload.restoreVersion(
                asA({ collection: "pages", id: bVersion }),
              ),
            )
          ).ok,
        ).toBe(false);
        const restList = await s.restAs(
          editorA,
          "GET",
          "/web-studio/api/pages/versions?limit=0&depth=0",
        );
        expect(restList.status).toBe(200);
        const restIds = (restList.json?.docs as Doc[]).map((doc) => doc.id);
        expect(restIds).not.toContain(bVersion);
        const restRestore = await s.restAs(
          editorA,
          "POST",
          `/web-studio/api/pages/versions/${bVersion}`,
          {},
        );
        expect(restRestore.status).toBeGreaterThanOrEqual(400);
        expect((await row("pages", pageB.id))?.tenant).toBe(B);
      });

      it("no actor creates, updates or deletes a Site presentation, nor creates or deletes media", async () => {
        const req = asA();
        expect(
          (
            await s.settle(
              s.payload.create({
                ...req,
                collection: "site-presentations",
                data: { tenant: A },
              }),
            )
          ).ok,
        ).toBe(false);
        expect(
          (
            await s.settle(
              s.payload.update({
                ...req,
                collection: "site-presentations",
                id: siteA.id,
                data: { tenant: A },
              }),
            )
          ).ok,
        ).toBe(false);
        expect(
          (
            await s.settle(
              s.payload.delete({
                ...req,
                collection: "site-presentations",
                id: siteA.id,
              }),
            )
          ).ok,
        ).toBe(false);
        expect(
          (
            await s.settle(
              s.payload.create({
                ...req,
                collection: "media",
                data: { tenant: A, alt: "New" },
              }),
            )
          ).ok,
        ).toBe(false);
        expect(
          (
            await s.settle(
              s.payload.delete({ ...req, collection: "media", id: mediaA.id }),
            )
          ).ok,
        ).toBe(false);
        expect(await row("site_presentations", siteA.id)).toBeDefined();
        expect(await row("media", mediaA.id)).toBeDefined();
      });

      it("staff of A update A's media alt, credit and folder", async () => {
        const updated = await s.payload.update(
          asA({
            collection: "media",
            id: mediaA.id,
            data: {
              alt: "Edited alt",
              credit: "Edited credit",
              folder: "Edited",
            },
          }),
        );
        expect(updated).toMatchObject({
          alt: "Edited alt",
          credit: "Edited credit",
          folder: "Edited",
          tenant: A,
        });
      });

      it("a person reads only their own principal-links row and writes none", async () => {
        const own = await s.payload.findByID(
          asA({ collection: "principal-links", id: editorA.id }),
        );
        expect(own.id).toBe(editorA.id);
        expect(
          (
            await s.settle(
              s.payload.findByID(
                asA({ collection: "principal-links", id: editorB.id }),
              ),
            )
          ).ok,
        ).toBe(false);
        for (const attempt of [
          () =>
            s.payload.create(
              asA({
                collection: "principal-links",
                data: { id: randomUUID() },
              }),
            ),
          () =>
            s.payload.update(
              asA({
                collection: "principal-links",
                id: editorA.id,
                data: { email: "x@y.z" },
              }),
            ),
          () =>
            s.payload.delete(
              asA({ collection: "principal-links", id: editorA.id }),
            ),
        ]) {
          expect((await s.settle(attempt())).ok).toBe(false);
        }
      });

      it("an actor without web_studio.edit is refused on all four collections", async () => {
        for (const collection of [
          "site-presentations",
          "pages",
          "navigation",
          "media",
        ]) {
          const listed = await s.settle(
            s.payload.find({
              collection,
              overrideAccess: false,
              user: viewerA,
            }),
          );
          expect(listed.ok, collection).toBe(false);
        }
        expect(
          (
            await s.settle(
              s.payload.create({
                collection: "pages",
                overrideAccess: false,
                user: viewerA,
                data: {
                  site: siteA.id,
                  title: "No",
                  slug: `no-${randomUUID()}`,
                },
                draft: true,
              }),
            )
          ).ok,
        ).toBe(false);
      });

      it("filterOptions and the Site picker list only A's Sites", async () => {
        const sites = await s.restAs(
          editorA,
          "GET",
          "/web-studio/api/site-presentations?limit=0&depth=0",
        );
        expect(sites.status).toBe(200);
        const ids = (sites.json?.docs as Doc[]).map((doc) => doc.id);
        expect(ids).toEqual(expect.arrayContaining([siteA.id, siteA2.id]));
        expect(ids).not.toContain(siteB.id);
        const { sameTenantOptions, sameSitePageOptions } =
          await import("../../../../apps/admin/src/cms/collections/page-builders");
        const req = await s.reqFor(editorA);
        expect(
          (sameTenantOptions as (a: unknown) => unknown)({
            data: { tenant: A },
            req,
          }),
        ).toEqual({ tenant: { equals: A } });
        expect(
          (sameSitePageOptions as (a: unknown) => unknown)({
            data: { tenant: A, site: siteA.id },
            req,
          }),
        ).toEqual({
          and: [{ tenant: { equals: A } }, { site: { equals: siteA.id } }],
        });
      });
    });

    describe("note 7: the tenant on create and update, on all four collections", () => {
      it("an actor's create with another organization's tenant is refused, not stripped (pages, navigation)", async () => {
        for (const [collection, data] of [
          ["pages", { site: siteA.id, title: "T", slug: `t-${randomUUID()}` }],
          [
            "navigation",
            {
              site: siteA.id,
              label: "N",
              items: [{ label: "x", href: "https://x.test" }],
            },
          ],
        ] as const) {
          const outcome = await s.settle(
            s.actor.actorCreate(await s.reqFor(editorA), {
              collection,
              data: { ...data, tenant: B },
              draft: collection === "pages",
            }),
          );
          expect(outcome.ok, collection).toBe(false);
          if (!outcome.ok) expect(outcome.paths).toContain("tenant");
        }
      });

      it.each([
        ["null", null],
        ["blank", ""],
        ["another organization", "BOTHER"],
      ])(
        "an update that sends a %s tenant is refused on every collection; one that sends none is kept",
        async (_label, value) => {
          const tenantValue = value === "BOTHER" ? B : value;
          const targets: Array<
            [string, Doc, Record<string, unknown>, boolean]
          > = [
            ["pages", pageA, { title: "Kept" }, true],
            ["navigation", navA, { label: "Kept" }, true],
            ["media", mediaA, { alt: "Kept" }, true],
            ["site-presentations", siteA, {}, false],
          ];
          for (const [collection, doc, data, actorWrites] of targets) {
            const refused = actorWrites
              ? await s.settle(
                  s.payload.update(
                    asA({
                      collection,
                      id: doc.id,
                      data: { ...data, tenant: tenantValue },
                      draft: collection === "pages",
                    }),
                  ),
                )
              : await s.settle(
                  s.service.serviceUpdate(s.payload as never, {
                    collection: collection as never,
                    id: doc.id,
                    data: { tenant: tenantValue },
                  }),
                );
            expect(refused.ok, collection).toBe(false);
            if (!refused.ok)
              expect(refused.paths, collection).toContain("tenant");
            expect(
              (await row(collection.replace("-", "_"), doc.id))?.tenant,
            ).toBe(A);
            const kept = actorWrites
              ? await s.settle(
                  s.payload.update(
                    asA({
                      collection,
                      id: doc.id,
                      data,
                      draft: collection === "pages",
                    }),
                  ),
                )
              : await s.settle(
                  s.service.serviceUpdate(s.payload as never, {
                    collection: collection as never,
                    id: doc.id,
                    data: {},
                  }),
                );
            expect(kept.ok, collection).toBe(true);
          }
        },
      );
    });

    describe("test 2: supplied IDs", () => {
      it("REST and the actor port replace a supplied id on create, for pages and navigation", async () => {
        const supplied = randomUUID();
        const rest = await s.restAs(
          editorA,
          "POST",
          "/web-studio/api/pages?draft=true",
          {
            id: supplied,
            site: siteA.id,
            title: "Supplied",
            slug: `supplied-${randomUUID().slice(0, 8)}`,
          },
        );
        expect(rest.status).toBe(201);
        const restId = (rest.json?.doc as Doc).id;
        s.created.push(["pages", restId]);
        expect(restId).not.toBe(supplied);
        const viaPort = await s.actor.actorCreate(await s.reqFor(editorA), {
          collection: "navigation",
          data: {
            id: supplied,
            site: siteA.id,
            label: "Supplied",
            items: [{ label: "x", href: "https://x.test" }],
          },
        });
        s.created.push(["navigation", viaPort.id]);
        expect(viaPort.id).not.toBe(supplied);
        expect(await row("pages", supplied)).toBeUndefined();
      });

      it("the service port keeps a supplied id for presentations, media and principal-links, never for pages or navigation", async () => {
        const presentation = await s.site(A);
        const record = await s.media(A);
        expect(await row("site_presentations", presentation.id)).toBeDefined();
        expect(await row("media", record.id)).toBeDefined();
        const login = randomUUID();
        const link = await s.service.ensurePrincipalLink(s.payload as never, {
          userId: login,
          email: null,
        });
        expect(link.id).toBe(login);
        const supplied = randomUUID();
        const servicePage = await s.service.serviceCreate(s.payload as never, {
          collection: "pages",
          data: {
            id: supplied,
            tenant: A,
            site: siteA.id,
            title: "Service",
            slug: `service-${randomUUID().slice(0, 8)}`,
          },
          draft: true,
        });
        s.created.push(["pages", servicePage.id]);
        expect(servicePage.id).not.toBe(supplied);
        const serviceNav = await s.service.serviceCreate(s.payload as never, {
          collection: "navigation",
          data: {
            id: supplied,
            tenant: A,
            site: siteA.id,
            label: "Service",
            items: [{ label: "x", href: "https://x.test" }],
          },
        });
        s.created.push(["navigation", serviceNav.id]);
        expect(serviceNav.id).not.toBe(supplied);
      });

      it("an update cannot change a document's id", async () => {
        const other = randomUUID();
        const updated = await s.restAs(
          editorA,
          "PATCH",
          `/web-studio/api/navigation/${navA.id}`,
          { id: other, label: "Same id" },
        );
        expect(updated.status).toBe(200);
        expect(await row("navigation", navA.id)).toBeDefined();
        expect(await row("navigation", other)).toBeUndefined();
      });
    });

    describe("test 3: constraints are the backstop, and the hook refuses first", () => {
      it("each named constraint is in the catalog with its definition", async () => {
        const { TENANT_CONSTRAINTS } =
          await import("../../../../apps/admin/src/cms/tenancy/constraints");
        const constraints = (
          await s.admin.query(
            "select c.relname as table, con.conname as name, pg_get_constraintdef(con.oid) as definition from pg_constraint con join pg_class c on c.oid = con.conrelid join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'cms'",
          )
        ).rows as Array<{ table: string; name: string; definition: string }>;
        const indexes = (
          await s.admin.query(
            "select tablename as table, indexname as name, indexdef as definition from pg_indexes where schemaname = 'cms'",
          )
        ).rows as Array<{ table: string; name: string; definition: string }>;
        for (const expected of TENANT_CONSTRAINTS) {
          const source =
            expected.kind === "unique index" ? indexes : constraints;
          const found = source.find((item) => item.name === expected.name);
          expect(found, expected.name).toBeDefined();
          expect(found?.table, expected.name).toBe(expected.table);
          expect(found?.definition, expected.name).toBe(expected.definition);
        }
      });

      it.each([
        [
          "a cross-tenant Site on pages",
          "insert into cms.pages (tenant, site_id, title, slug) values ($1, $2, 'x', $3)",
          () => [A, siteB.id, randomUUID()],
          "23503",
        ],
        [
          "a NULL tenant on pages",
          "insert into cms.pages (tenant, site_id, title, slug) values (null, $1, 'x', $2)",
          () => [siteA.id, randomUUID()],
          "23514",
        ],
        [
          "a NULL Site on pages",
          "insert into cms.pages (tenant, site_id, title, slug) values ($1, null, 'x', $2)",
          () => [A, randomUUID()],
          "23514",
        ],
        [
          "a cross-tenant Site on _pages_v",
          "insert into cms._pages_v (version_tenant, version_site_id) values ($1, $2)",
          () => [A, siteB.id],
          "23503",
        ],
        [
          "a NULL tenant on _pages_v",
          "insert into cms._pages_v (version_tenant, version_site_id) values (null, $1)",
          () => [siteA.id],
          "23514",
        ],
        [
          "a NULL Site on _pages_v",
          "insert into cms._pages_v (version_tenant, version_site_id) values ($1, null)",
          () => [A],
          "23514",
        ],
        [
          "an upper-case tenant on media",
          "insert into cms.media (tenant, alt) values ($1, 'x')",
          () => [A.toUpperCase()],
          "23514",
        ],
      ])(
        "as owner, %s fails in the database",
        async (_label, sql, params, code) => {
          await s.owner.query("begin");
          try {
            const outcome = await s.owner
              .query(sql, params())
              .then(() => "inserted")
              .catch((error: { code?: string }) => error.code);
            expect(outcome).toBe(code);
          } finally {
            await s.owner.query("rollback");
          }
        },
      );

      it("the hook refuses a cross-tenant Site first, with a field path, on create and on a later draft", async () => {
        const created = await s.settle(
          s.actor.actorCreate(await s.reqFor(editorA), {
            collection: "pages",
            data: { site: siteB.id, title: "x", slug: `x-${randomUUID()}` },
            draft: true,
          }),
        );
        expect(created.ok).toBe(false);
        if (!created.ok) {
          expect(created.name).toBe("ValidationError");
          expect(created.paths).toContain("site");
        }
        const before = await versionsOf(pageA.id);
        const drafted = await s.settle(
          s.payload.update(
            asA({
              collection: "pages",
              id: pageA.id,
              data: { site: siteB.id },
              draft: true,
            }),
          ),
        );
        expect(drafted.ok).toBe(false);
        if (!drafted.ok) expect(drafted.paths).toContain("site");
        expect(await versionsOf(pageA.id)).toBe(before);
      });
    });

    describe("test 4, note 2 and note 12: references in drafts, rich text and pasted blocks", () => {
      type Case = [string, () => unknown, boolean];
      const cases = (): Case[] => [
        [
          "a relationship to own media",
          () => relationshipNode("media", mediaA.id),
          true,
        ],
        [
          "a relationship to another organization's media",
          () => relationshipNode("media", mediaB.id),
          false,
        ],
        [
          "a relationship to own navigation",
          () => relationshipNode("navigation", navA.id),
          false,
        ],
        [
          "a relationship to a principal-links row",
          () => relationshipNode("principal-links", editorA.id),
          false,
        ],
        [
          "a relationship to own pages",
          () => relationshipNode("pages", pageA.id),
          false,
        ],
        [
          "an internal link to own page on the same Site",
          () => internalLink("pages", pageA.id),
          true,
        ],
        [
          "an internal link to own page on another Site",
          () => internalLink("pages", pageA2.id),
          false,
        ],
        [
          "an internal link to another organization's page",
          () => internalLink("pages", pageB.id),
          false,
        ],
        [
          "an internal link to media",
          () => internalLink("media", mediaA.id),
          false,
        ],
        ["an upload node", () => uploadNode("media", mediaA.id), false],
        [
          "a target that does not exist",
          () => relationshipNode("media", randomUUID()),
          false,
        ],
      ];
      const placements = [
        [
          "content",
          (node: unknown) => ({ content: lexical([textNode("a"), node]) }),
        ],
        [
          "a rich-text block's body",
          (node: unknown) => ({
            layout: [
              {
                blockType: "rich-text",
                heading: "h",
                body: lexical([textNode("a"), node]),
              },
            ],
          }),
        ],
      ] as const;
      const saves = [
        ["a draft save", { draft: true }],
        ["an autosave", { draft: true, autosave: true }],
      ] as const;

      for (const [placement, build] of placements) {
        for (const [saveLabel, saveArgs] of saves) {
          it.each(cases().map(([label], index) => [label, index]))(
            `${placement}, ${saveLabel}: %s`,
            async (_label, index) => {
              const [, node, allowed] = cases()[index as number]!;
              const before = await versionsOf(pageA.id);
              const outcome = await s.settle(
                s.payload.update(
                  asA({
                    collection: "pages",
                    id: pageA.id,
                    data: build(node()),
                    ...saveArgs,
                  }),
                ),
              );
              expect(outcome.ok).toBe(allowed);
              if (allowed) return;
              if (!outcome.ok) expect(outcome.status).toBe(400);
              expect(await versionsOf(pageA.id)).toBe(before);
            },
          );
        }
      }

      it("a relationship node to own media is kept as written in a draft", async () => {
        const saved = await s.payload.update(
          asA({
            collection: "pages",
            id: pageA.id,
            draft: true,
            data: { content: lexical([relationshipNode("media", mediaA.id)]) },
          }),
        );
        const node = (
          saved.content as {
            root: { children: Array<{ children: unknown[] }> };
          }
        ).root.children[0]!.children[0] as {
          relationTo?: string;
          value?: unknown;
        };
        expect(node.relationTo).toBe("media");
        expect(
          typeof node.value === "object" ? (node.value as Doc).id : node.value,
        ).toBe(mediaA.id);
      });

      it.each([
        [
          "another organization's media in a media-feature block",
          () => ({ blockType: "media-feature", media: mediaB.id }),
        ],
        [
          "another organization's media in a hero block",
          () => ({
            blockType: "hero",
            headline: "h",
            backgroundImage: mediaB.id,
          }),
        ],
        [
          "another organization's page in a pasted rich-text block",
          () => ({
            blockType: "rich-text",
            body: lexical([internalLink("pages", pageB.id)]),
          }),
        ],
      ])(
        "a pasted block with %s is refused over REST and nothing is written",
        async (_label, block) => {
          const before = await versionsOf(pageA.id);
          const response = await s.restAs(
            editorA,
            "PATCH",
            `/web-studio/api/pages/${pageA.id}?draft=true&autosave=true`,
            { layout: [block()] },
          );
          expect(response.status).toBe(400);
          expect(await versionsOf(pageA.id)).toBe(before);
        },
      );

      it("a bad reference is refused in a draft as in a published save, and an invalid UUID never reaches Postgres", async () => {
        const outcome = await s.settle(
          s.payload.update(
            asA({
              collection: "pages",
              id: pageA.id,
              draft: true,
              data: {
                layout: [{ blockType: "media-feature", media: "not-a-uuid" }],
              },
            }),
          ),
        );
        expect(outcome.ok).toBe(false);
        if (!outcome.ok) expect(outcome.status).toBe(400);
      });
    });

    describe("test 5: status", () => {
      it("REST POST without ?draft=true carrying _status published is refused and writes nothing", async () => {
        const slug = `published-${randomUUID().slice(0, 8)}`;
        const response = await s.restAs(
          editorA,
          "POST",
          "/web-studio/api/pages",
          {
            site: siteA.id,
            title: "Published",
            slug,
            _status: "published",
          },
        );
        expect(response.status).toBe(400);
        expect(
          (
            await s.admin.query(
              "select count(*) from cms.pages where slug = $1",
              [slug],
            )
          ).rows[0].count,
        ).toBe("0");
      });

      it("REST PATCH with _status published is refused and the row stays draft", async () => {
        const response = await s.restAs(
          editorA,
          "PATCH",
          `/web-studio/api/pages/${pageA.id}`,
          { _status: "published" },
        );
        expect(response.status).toBe(400);
        expect((await row("pages", pageA.id))?._status).toBe("draft");
      });

      it("guard: POST ?draft=true with _status published saves a draft (Payload coerces it)", async () => {
        const response = await s.restAs(
          editorA,
          "POST",
          "/web-studio/api/pages?draft=true",
          {
            site: siteA.id,
            title: "Coerced",
            slug: `coerced-${randomUUID().slice(0, 8)}`,
            _status: "published",
          },
        );
        expect(response.status).toBe(201);
        const doc = response.json?.doc as Doc;
        s.created.push(["pages", doc.id]);
        expect((await row("pages", doc.id))?._status).toBe("draft");
      });
    });

    describe("test 7: navigation items", () => {
      const save = async (item: Record<string, unknown>) =>
        s.settle(
          s.actor.actorCreate(await s.reqFor(editorA), {
            collection: "navigation",
            data: {
              site: siteA.id,
              label: "Nav",
              items: [{ label: "x", ...item }],
            },
          }),
        );

      it.each(["https://x.test/a", "http://x.test"])(
        "keeps %s",
        async (href) => {
          const outcome = await save({ href });
          expect(outcome.ok).toBe(true);
          if (outcome.ok)
            s.created.push(["navigation", (outcome.value as Doc).id]);
        },
      );

      it.each([
        "javascript:alert(1)",
        "data:text/html,x",
        "//x.test",
        "/a",
        "https:/x",
        "",
      ])("refuses %j", async (href) => {
        const outcome = await save({ href });
        expect(outcome.ok).toBe(false);
      });

      it("refuses both a page and an address, neither, and another Site's page; keeps a page of the same Site", async () => {
        expect(
          (await save({ page: pageA.id, href: "https://x.test" })).ok,
        ).toBe(false);
        expect((await save({})).ok).toBe(false);
        expect((await save({ page: pageA2.id })).ok).toBe(false);
        expect((await save({ page: pageB.id })).ok).toBe(false);
        const kept = await save({ page: pageA.id });
        expect(kept.ok).toBe(true);
        if (kept.ok) s.created.push(["navigation", (kept.value as Doc).id]);
      });
    });

    describe("test 6: missionary and fund checks need the caller's session", () => {
      it.each([
        ["missionary", { missionaryId: randomUUID() }],
        ["project", { fundId: randomUUID() }],
      ])(
        "a %s page is refused with no session (the E2E bypass included)",
        async (family, ids) => {
          const outcome = await s.settle(
            s.actor.actorCreate(await s.reqFor(editorA), {
              collection: "pages",
              data: {
                site: siteA.id,
                title: "F",
                slug: `f-${randomUUID()}`,
                family,
                ...ids,
              },
              draft: true,
            }),
          );
          expect(outcome.ok).toBe(false);
          const rest = await s.restAs(
            editorA,
            "POST",
            "/web-studio/api/pages?draft=true",
            {
              site: siteA.id,
              title: "F",
              slug: `f-${randomUUID().slice(0, 8)}`,
              family,
              ...ids,
            },
          );
          expect(rest.status).toBe(400);
        },
      );
    });
  },
);
