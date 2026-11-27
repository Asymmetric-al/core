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

    describe("F1 (fix round): nothing a client adds to a page stops the rich-text walk", () => {
      const spoof = { root: { children: [] } };
      const placements = [
        [
          "a top-level root beside content",
          (node: unknown) => ({
            ...spoof,
            content: lexical([textNode("a"), node]),
          }),
        ],
        [
          "a root beside a block's body",
          (node: unknown) => ({
            layout: [
              {
                blockType: "rich-text",
                heading: "h",
                ...spoof,
                body: lexical([textNode("a"), node]),
              },
            ],
          }),
        ],
      ] as const;
      const nodes = [
        [
          "another organization's media",
          () => relationshipNode("media", mediaB.id),
        ],
        ["a page of another Site", () => internalLink("pages", pageA2.id)],
        [
          "a block node",
          () => ({
            type: "block",
            format: "",
            version: 2,
            fields: { id: "f1block", blockName: "", blockType: "rich-text" },
          }),
        ],
      ] as const;
      const operations = [
        ["create, draft", "create", true],
        ["create, not draft", "create", false],
        ["update, draft", "update", true],
        ["update, not draft", "update", false],
      ] as const;
      const stored = async (id: string) =>
        (
          await s.admin.query(
            "select content::text as content, layout::text as layout from cms.pages where id = $1",
            [id],
          )
        ).rows[0] as { content: string | null; layout: string | null };
      const slugCount = async (slug: string) =>
        Number(
          (
            await s.admin.query(
              "select (select count(*) from cms.pages where slug = $1) + (select count(*) from cms._pages_v where version_slug = $1) as n",
              [slug],
            )
          ).rows[0].n,
        );

      for (const [placement, build] of placements) {
        for (const [nodeLabel, node] of nodes) {
          it.each(operations.map((operation) => [...operation]))(
            `${placement}, ${nodeLabel}: %s is refused and nothing is stored`,
            async (_label, operation, draft) => {
              if (operation === "create") {
                const slug = `f1-${randomUUID().slice(0, 8)}`;
                const outcome = await s.settle(
                  s.payload.create(
                    asA({
                      collection: "pages",
                      draft,
                      data: {
                        site: siteA.id,
                        title: "F1",
                        slug,
                        ...build(node()),
                      },
                    }),
                  ),
                );
                if (outcome.ok)
                  s.created.push(["pages", (outcome.value as Doc).id]);
                expect(outcome.ok).toBe(false);
                if (!outcome.ok) expect(outcome.status).toBe(400);
                expect(await slugCount(slug)).toBe(0);
                return;
              }
              const target = await s.page(A, siteA.id);
              const before = await versionsOf(target.id);
              const rowBefore = await stored(target.id);
              const outcome = await s.settle(
                s.payload.update(
                  asA({
                    collection: "pages",
                    id: target.id,
                    draft,
                    data: build(node()),
                  }),
                ),
              );
              expect(outcome.ok).toBe(false);
              if (!outcome.ok) expect(outcome.status).toBe(400);
              expect(await versionsOf(target.id)).toBe(before);
              expect(await stored(target.id)).toEqual(rowBefore);
            },
          );
        }
      }

      it("over REST too: a draft POST with a top-level root and another organization's media is refused and nothing is stored", async () => {
        const slug = `f1-rest-${randomUUID().slice(0, 8)}`;
        const response = await s.restAs(
          editorA,
          "POST",
          "/web-studio/api/pages?draft=true",
          {
            site: siteA.id,
            title: "F1 REST",
            slug,
            ...spoof,
            content: lexical([relationshipNode("media", mediaB.id)]),
          },
        );
        if (response.status === 201)
          s.created.push(["pages", (response.json?.doc as Doc).id]);
        expect(response.status).toBe(400);
        expect(await slugCount(slug)).toBe(0);
      });

      it.each([
        ["content", (nodeList: unknown[]) => ({ content: lexical(nodeList) })],
        [
          "a block's body",
          (nodeList: unknown[]) => ({
            layout: [
              { blockType: "rich-text", heading: "h", body: lexical(nodeList) },
            ],
          }),
        ],
      ] as const)(
        "an honest document with own media and a page of the same Site in %s is accepted on create and update",
        async (_label, build) => {
          const honest = () =>
            build([
              textNode("a"),
              relationshipNode("media", mediaA.id),
              internalLink("pages", pageA.id),
            ]);
          const created = await s.payload.create(
            asA({
              collection: "pages",
              draft: true,
              data: {
                site: siteA.id,
                title: "Honest",
                slug: `honest-${randomUUID().slice(0, 8)}`,
                ...honest(),
              },
            }),
          );
          s.created.push(["pages", created.id]);
          const updated = await s.payload.update(
            asA({
              collection: "pages",
              id: created.id,
              draft: true,
              data: honest(),
            }),
          );
          expect(JSON.stringify(updated)).toContain(mediaA.id);
          expect(JSON.stringify(updated)).toContain(pageA.id);
        },
      );
    });

    describe("F4 (fix round): an existing page keeps its Site", () => {
      it.each([
        ["a draft", true],
        ["a non-draft save", false],
      ])(
        "an actor's %s that moves a page to another Site is refused, and nothing is written",
        async (_label, draft) => {
          const target = await s.page(A, siteA.id);
          const before = await versionsOf(target.id);
          const outcome = await s.settle(
            s.payload.update(
              asA({
                collection: "pages",
                id: target.id,
                draft,
                data: { site: siteA2.id },
              }),
            ),
          );
          expect(outcome.ok).toBe(false);
          if (!outcome.ok) expect(outcome.paths).toContain("site");
          expect(await versionsOf(target.id)).toBe(before);
          expect((await row("pages", target.id))?.site_id).toBe(siteA.id);
        },
      );

      it("the review's case: a draft PATCH moving a page between Sites is refused over REST, so a menu of the old Site never links a page that left it", async () => {
        const target = await s.page(A, siteA.id);
        const before = await versionsOf(target.id);
        const response = await s.restAs(
          editorA,
          "PATCH",
          `/web-studio/api/pages/${target.id}?draft=true`,
          { site: siteA2.id },
        );
        expect(response.status).toBe(400);
        expect(await versionsOf(target.id)).toBe(before);
        const latest = await s.admin.query(
          "select version_site_id from cms._pages_v where parent_id = $1 order by created_at desc limit 1",
          [target.id],
        );
        expect(latest.rows[0]?.version_site_id).toBe(siteA.id);
      });

      it("the service port cannot move a page either", async () => {
        const target = await s.page(A, siteA.id);
        const outcome = await s.settle(
          s.service.serviceUpdate(s.payload as never, {
            collection: "pages",
            id: target.id,
            draft: true,
            data: { site: siteA2.id },
          }),
        );
        expect(outcome.ok).toBe(false);
        expect((await row("pages", target.id))?.site_id).toBe(siteA.id);
      });

      it("a later draft that moves a page to another organization's Site is refused once, at site, as cms:qualify asks", async () => {
        const target = await s.page(A, siteA.id);
        const outcome = await s.settle(
          s.payload.update(
            asA({
              collection: "pages",
              id: target.id,
              draft: true,
              data: { site: siteB.id },
            }),
          ),
        );
        expect(outcome.ok).toBe(false);
        if (!outcome.ok) expect(outcome.paths).toEqual(["site"]);
        expect((await row("pages", target.id))?.site_id).toBe(siteA.id);
      });

      it("guard: an update that sends the page's own Site again is kept", async () => {
        const target = await s.page(A, siteA.id);
        const kept = await s.payload.update(
          asA({
            collection: "pages",
            id: target.id,
            draft: true,
            data: { site: siteA.id, title: "Same Site" },
          }),
        );
        expect(kept.title).toBe("Same Site");
      });
    });

    describe("reserved public page addresses", () => {
      it.each([
        "admin",
        "/admin",
        "Admin/x",
        "api/x",
        "login",
        "workers",
        "donate",
        "give/monthly",
        "lang/en",
      ])(
        "refuses %s on create, update and historical version restore at the slug field",
        async (slug) => {
          const page = await s.page(A, siteA.id);
          const version = await s.admin.query(
            "update cms._pages_v set version_slug = $1 where parent_id = $2 returning id",
            [slug, page.id],
          );
          const refused = { ok: false, status: 400, paths: ["slug"] };
          expect
            .soft(await s.settle(s.page(A, siteA.id, { slug })))
            .toMatchObject(refused);
          expect
            .soft(
              await s.settle(
                s.payload.update(
                  asA({
                    collection: "pages",
                    draft: true,
                    id: page.id,
                    data: { slug },
                  }),
                ),
              ),
            )
            .toMatchObject(refused);
          expect(
            await s.settle(
              s.payload.restoreVersion(
                asA({
                  collection: "pages",
                  draft: true,
                  id: version.rows[0].id,
                }),
              ),
            ),
          ).toMatchObject(refused);
        },
      );

      it.each(["about-us", "administration", "admins"])(
        "accepts the ordinary slug %s",
        async (slug) => {
          expect((await s.page(A, siteA.id, { slug })).slug).toBe(slug);
        },
      );
    });

    describe("F7 (fix round): a person changes no page's published state; only the service port does", () => {
      const published = async () => {
        const live = await s.page(A, siteA.id, { title: "Live title" });
        const draftVersion = String(
          (
            await s.admin.query(
              "select id from cms._pages_v where parent_id = $1 order by created_at asc limit 1",
              [live.id],
            )
          ).rows[0].id,
        );
        await s.service.serviceUpdate(s.payload as never, {
          collection: "pages",
          id: live.id,
          data: { _status: "published" },
        });
        expect((await row("pages", live.id))?._status).toBe("published");
        return { live, draftVersion };
      };

      it("a non-draft PATCH with _status draft is refused and the page stays published", async () => {
        const { live } = await published();
        const response = await s.restAs(
          editorA,
          "PATCH",
          `/web-studio/api/pages/${live.id}`,
          { _status: "draft" },
        );
        expect(response.status).toBe(400);
        expect((await row("pages", live.id))?._status).toBe("published");
      });

      it("guard: a non-draft PATCH that changes the title is refused, and the published row keeps its title", async () => {
        const { live } = await published();
        const response = await s.restAs(
          editorA,
          "PATCH",
          `/web-studio/api/pages/${live.id}`,
          { title: "Changed live" },
        );
        expect(response.status).toBe(400);
        expect(await row("pages", live.id)).toMatchObject({
          _status: "published",
          title: "Live title",
        });
      });

      it("a non-draft version restore is refused and the page stays published", async () => {
        const { live, draftVersion } = await published();
        const response = await s.restAs(
          editorA,
          "POST",
          `/web-studio/api/pages/versions/${draftVersion}`,
        );
        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(await row("pages", live.id)).toMatchObject({
          _status: "published",
          title: "Live title",
        });
      });

      it("guard: a draft PATCH and a draft restore are drafts, and the published row is unchanged", async () => {
        const { live, draftVersion } = await published();
        const before = await versionsOf(live.id);
        const patched = await s.restAs(
          editorA,
          "PATCH",
          `/web-studio/api/pages/${live.id}?draft=true`,
          { title: "Draft title" },
        );
        expect(patched.status).toBe(200);
        const restored = await s.restAs(
          editorA,
          "POST",
          `/web-studio/api/pages/versions/${draftVersion}?draft=true`,
        );
        expect(restored.status).toBe(200);
        expect(await versionsOf(live.id)).toBeGreaterThan(before);
        expect(await row("pages", live.id)).toMatchObject({
          _status: "published",
          title: "Live title",
        });
      });

      describe("unpublishAllLocales (confirmation finding 1): a person's write never changes or replaces a published version row", () => {
        const versionRows = async (id: string) =>
          (
            await s.admin.query(
              "select id, version__status, version_title, updated_at, latest from cms._pages_v where parent_id = $1 order by updated_at desc, created_at desc",
              [id],
            )
          ).rows as Array<Record<string, unknown>>;

        const publishedWithSnapshot = async () => {
          const { live } = await published();
          const versions = await versionRows(live.id);
          const snapshot = versions[0]!;
          expect(snapshot).toMatchObject({
            version__status: "published",
            version_title: "Live title",
          });
          return {
            live,
            versions,
            snapshot,
            page: await row("pages", live.id),
          };
        };

        const expectUnchanged = async (
          state: Awaited<ReturnType<typeof publishedWithSnapshot>>,
        ) => {
          expect(await versionRows(state.live.id)).toEqual(state.versions);
          expect(await row("pages", state.live.id)).toEqual(state.page);
        };

        it("by id: PATCH ?draft=true&unpublishAllLocales=true is refused, and the published snapshot and the page are unchanged", async () => {
          const state = await publishedWithSnapshot();
          const response = await s.restAs(
            editorA,
            "PATCH",
            `/web-studio/api/pages/${state.live.id}?draft=true&unpublishAllLocales=true`,
            { title: "Unpublished draft" },
          );
          await expectUnchanged(state);
          expect(response.status).toBe(400);
        });

        it("in bulk: PATCH ?where[id][equals]=…&draft=true&unpublishAllLocales=true updates no page, and the published snapshot and the page are unchanged", async () => {
          const state = await publishedWithSnapshot();
          const response = await s.restAs(
            editorA,
            "PATCH",
            `/web-studio/api/pages?where[id][equals]=${state.live.id}&draft=true&unpublishAllLocales=true`,
            { title: "Unpublished draft" },
          );
          await expectUnchanged(state);
          expect((response.json?.docs as unknown[] | undefined) ?? []).toEqual(
            [],
          );
          expect(response.json?.errors).toHaveLength(1);
        });

        it("through the Local API as an actor: a draft update with unpublishAllLocales is refused, and the published snapshot and the page are unchanged", async () => {
          const state = await publishedWithSnapshot();
          const outcome = await s.settle(
            s.payload.update(
              asA({
                collection: "pages",
                id: state.live.id,
                draft: true,
                unpublishAllLocales: true,
                data: { title: "Unpublished draft" },
              }),
            ),
          );
          await expectUnchanged(state);
          expect(outcome.ok).toBe(false);
          if (!outcome.ok) expect(outcome.paths).toContain("_status");
        });

        it("guard: a plain ?draft=true save succeeds and adds a draft version beside the published snapshot", async () => {
          const state = await publishedWithSnapshot();
          const response = await s.restAs(
            editorA,
            "PATCH",
            `/web-studio/api/pages/${state.live.id}?draft=true`,
            { title: "Plain draft" },
          );
          expect(response.status).toBe(200);
          const after = await versionRows(state.live.id);
          expect(after).toHaveLength(state.versions.length + 1);
          const { latest: _latest, ...snapshotContent } = state.snapshot;
          expect(
            after.find((version) => version.id === state.snapshot.id),
          ).toEqual({ ...snapshotContent, latest: false });
          expect(after[0]).toMatchObject({
            version__status: "draft",
            version_title: "Plain draft",
            latest: true,
          });
          expect(await row("pages", state.live.id)).toEqual(state.page);
        });
      });
    });

    describe("F3 (fix round): the service port never hands one organization's row to another", () => {
      it("createSitePresentation refuses a Site id another organization's presentation holds", async () => {
        const outcome = await s.settle(
          s.service.createSitePresentation(s.payload as never, {
            siteId: siteA.id,
            tenantId: B,
          }),
        );
        expect(outcome.ok).toBe(false);
        expect((await row("site_presentations", siteA.id))?.tenant).toBe(A);
      });

      it("registerMediaRecord refuses a media id another organization holds", async () => {
        const before = await row("media", mediaA.id);
        expect(before?.tenant).toBe(A);
        const outcome = await s.settle(
          s.service.registerMediaRecord(s.payload as never, {
            id: mediaA.id,
            tenantId: B,
            alt: "Not B's",
          }),
        );
        expect(outcome.ok).toBe(false);
        expect(await row("media", mediaA.id)).toEqual(before);
      });

      it("two concurrent first creations of one presentation return the one row", async () => {
        const siteId = randomUUID();
        const results = await Promise.allSettled([
          s.service.createSitePresentation(s.payload as never, {
            siteId,
            tenantId: A,
          }),
          s.service.createSitePresentation(s.payload as never, {
            siteId,
            tenantId: A,
          }),
        ]);
        s.created.push(["site-presentations", siteId]);
        expect(results.map((result) => result.status)).toEqual([
          "fulfilled",
          "fulfilled",
        ]);
        for (const result of results)
          if (result.status === "fulfilled")
            expect((result.value as Doc).id).toBe(siteId);
        expect(
          (
            await s.admin.query(
              "select count(*) from cms.site_presentations where id = $1",
              [siteId],
            )
          ).rows[0].count,
        ).toBe("1");
      });

      it("two concurrent first creations of one media record return the one row", async () => {
        const id = randomUUID();
        const results = await Promise.allSettled([
          s.service.registerMediaRecord(s.payload as never, {
            id,
            tenantId: A,
            alt: "One",
          }),
          s.service.registerMediaRecord(s.payload as never, {
            id,
            tenantId: A,
            alt: "One",
          }),
        ]);
        s.created.push(["media", id]);
        expect(results.map((result) => result.status)).toEqual([
          "fulfilled",
          "fulfilled",
        ]);
        expect(
          (
            await s.admin.query(
              "select count(*) from cms.media where id = $1",
              [id],
            )
          ).rows[0].count,
        ).toBe("1");
      });

      it("of two concurrent first creations for two organizations, one wins and the other is refused", async () => {
        const siteId = randomUUID();
        const results = await Promise.allSettled([
          s.service.createSitePresentation(s.payload as never, {
            siteId,
            tenantId: A,
          }),
          s.service.createSitePresentation(s.payload as never, {
            siteId,
            tenantId: B,
          }),
        ]);
        s.created.push(["site-presentations", siteId]);
        const won = results.filter((result) => result.status === "fulfilled");
        expect(won).toHaveLength(1);
        const owner = (await row("site_presentations", siteId))?.tenant;
        expect(owner === A || owner === B).toBe(true);
        expect(
          ((won[0] as PromiseFulfilledResult<Doc>).value as Doc).tenant,
        ).toBe(owner);
      });
    });
    describe("WP6 rest, pull request 2: media records by any spelling of their id, removed only in their organization (rule 13, invariant 4)", () => {
      it("registers an upper-case id and tenant as the one lower-case row, and registers it again as the same row", async () => {
        const id = randomUUID();
        const first = (await s.service.registerMediaRecord(s.payload as never, {
          id: id.toUpperCase(),
          tenantId: A.toUpperCase(),
          alt: "Upper",
        })) as Doc;
        s.created.push(["media", id]);
        expect(first).toMatchObject({ id, tenant: A });
        const again = (await s.service.registerMediaRecord(s.payload as never, {
          id,
          tenantId: A,
          alt: "Upper",
        })) as Doc;
        expect(again.id).toBe(id);
        expect(
          (
            await s.admin.query(
              "select count(*) from cms.media where id = $1",
              [id],
            )
          ).rows[0].count,
        ).toBe("1");
      });

      it("deleteMediaRecord refuses another organization's row and leaves it", async () => {
        const before = await row("media", mediaB.id);
        const outcome = await s.settle(
          s.service.deleteMediaRecord(s.payload as never, mediaB.id, A),
        );
        expect(outcome.ok).toBe(false);
        expect(await row("media", mediaB.id)).toEqual(before);
      });

      it("deleteMediaRecord deletes the organization's own row by a non-RFC id in upper case, and a second call does nothing", async () => {
        const id = "a1b2c3d4-0000-1111-2222-333344445555";
        await s.media(A, id, "Fixture-like");
        await s.service.deleteMediaRecord(
          s.payload as never,
          id.toUpperCase(),
          A,
        );
        expect(await row("media", id)).toBeUndefined();
        await expect(
          s.service.deleteMediaRecord(s.payload as never, id, A),
        ).resolves.toBeUndefined();
      });
    });

    describe("WP6 rest, pull request 2, fix round F5: the media library's register and remove refuse as every Web Studio call does", () => {
      it.each([
        ["register", { alt: "Refused" }],
        ["remove", {}],
      ])(
        "%s: a page opened for another organization answers 409 scope_mismatch, an ended session 401 no_session, and nothing is written",
        async (action, extra) => {
          const assetId = randomUUID();
          const path = `/web-studio/api/web-studio/media/${action}`;
          const stale = await s.restAs(
            editorA,
            "POST",
            path,
            { assetId, ...extra },
            { tenantHeader: B },
          );
          expect([stale.status, stale.refusal]).toEqual([
            409,
            "scope_mismatch",
          ]);
          const ended = await s.restAs(
            editorA,
            "POST",
            path,
            { assetId, ...extra },
            { signedIn: false },
          );
          expect([ended.status, ended.refusal]).toEqual([401, "no_session"]);
          expect(await row("media", assetId)).toBeUndefined();
        },
      );
    });

    describe("WP6 rest, pull request 2: a restore over another person's lock is refused (invariant 7; #2809 F4)", () => {
      let page: Doc;
      let version: string;
      let lockHolder: Person;

      const lockPage = async (holder: Person) => {
        await s.payload.db.create({
          collection: "payload-locked-documents",
          data: {
            document: { relationTo: "pages", value: page.id },
            user: { relationTo: "principal-links", value: holder.id },
          },
          req: await s.reqFor(holder),
        });
      };
      const unlock = () =>
        s.admin.query(
          "delete from cms.payload_locked_documents where id in (select parent_id from cms.payload_locked_documents_rels where pages_id = $1)",
          [page.id],
        );
      const restoreAs = (user: Person) =>
        s.settle(
          s.payload.restoreVersion({
            collection: "pages",
            id: version,
            draft: true,
            overrideAccess: false,
            user,
          }),
        );

      beforeAll(async () => {
        page = await s.page(A, siteA.id);
        for (const title of ["Second draft", "Third draft"]) {
          await s.payload.update({
            collection: "pages",
            id: page.id,
            data: { title },
            draft: true,
            overrideAccess: false,
            user: editorA,
          });
        }
        version = (
          await s.admin.query(
            "select id from cms._pages_v where parent_id = $1 order by created_at asc limit 1",
            [page.id],
          )
        ).rows[0].id as string;
        lockHolder = await s.person(A);
      });

      it("refuses a restore while another person holds an unexpired lock, and changes nothing", async () => {
        await lockPage(lockHolder);
        const before = await row("pages", page.id);
        const outcome = await restoreAs(editorA);
        expect(outcome.ok).toBe(false);
        expect(await row("pages", page.id)).toEqual(before);
        await unlock();
      });

      it("lets the holder restore", async () => {
        await lockPage(lockHolder);
        expect((await restoreAs(lockHolder)).ok).toBe(true);
        await unlock();
      });

      it("lets another person restore once the lock has expired", async () => {
        await lockPage(lockHolder);
        await s.admin.query(
          "update cms.payload_locked_documents set updated_at = now() - interval '10 minutes' where id in (select parent_id from cms.payload_locked_documents_rels where pages_id = $1)",
          [page.id],
        );
        expect((await restoreAs(editorA)).ok).toBe(true);
        await unlock();
      });
    });
  },
);
