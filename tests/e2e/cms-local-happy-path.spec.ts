import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from "@playwright/test";

import { adminBaseURL, donorBaseURL } from "./base-urls";
import { writeHeaders } from "./helpers/web-studio";
import { textMatchesPayloadDbFailure } from "./lib/payload-db-failure";

const tenantHeaders = {
  "x-forwarded-host": "localhost:3000",
};

type PayloadListResponse<T> = {
  docs?: T[];
};

type DocWithId = {
  id: string | number;
};

type CollectionRouteExpectation =
  | {
      href: string;
      text: string;
      textbox?: never;
    }
  | {
      href: string;
      text?: never;
      textbox: {
        name: RegExp;
        value: string;
      };
    };

async function expectNoPayloadFailure(page: Page) {
  const bodyText = await page
    .locator("body")
    .innerText()
    .catch(() => "");
  expect(textMatchesPayloadDbFailure(bodyText)).toBe(false);
}

// D-18 (AL-2677, 3bd91aa9f; fix check G7): sign in through the login form
// with the seeded login rather than the Demo Access button. On a production
// build of the local stack the login page offered no Demo Access button (the
// run of 21 November 2026 timed out waiting for it); the form works on every
// build. `bun run test:e2e:cms:local` supplies the seeded login from
// scripts/cms/lib/local-data.mjs when the environment holds none.
async function signInAsLocalDemoAdmin(page: Page, next = "/web-studio") {
  const email = process.env.DEMO_ADMIN_EMAIL;
  const password = process.env.DEMO_PASSWORD;
  if (!email || !password)
    throw new Error("Missing local CMS seed credentials");
  await page.goto(`${adminBaseURL}/login?next=${encodeURIComponent(next)}`);
  await page.getByRole("textbox", { name: "Email" }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL(new RegExp(next.replace(/\//g, "\\/")));
  await expect(
    page.getByTestId("web-studio-native-shell").filter({ visible: true }),
  ).toBeVisible();
  await expectNoPayloadFailure(page);
}

async function expectRetiredPublicCms404(
  request: APIRequestContext,
  label: string,
) {
  const retiredPaths = [
    "/api/cms/public/pages/local-cms-home",
    "/api/cms/public/navigation",
    "/api/cms/public/updates?limit=5",
    "/api/cms/public/project-pages/local-project",
    "/api/cms/public/missionary-pages/11111111-1111-1111-1111-111111111111",
  ];

  for (const method of ["GET", "HEAD"] as const) {
    for (const path of retiredPaths) {
      const response = await request.fetch(`${adminBaseURL}${path}`, {
        method,
        headers: tenantHeaders,
        maxRedirects: 0,
      });
      expect(response.status(), `${label} ${method} ${path}`).toBe(404);
      expect(
        response.headers()["location"],
        `${label} ${method} ${path} location`,
      ).toBeUndefined();
      expect(
        response.headers()["content-type"] ?? "",
        `${label} ${method} ${path} content-type`,
      ).not.toMatch(/\bapplication\/json\b/i);
      if (method === "GET") {
        const body = await response.text();
        expect(
          () => JSON.parse(body),
          `${label} ${method} ${path} not JSON`,
        ).toThrow();
        for (const forbidden of [
          "Local CMS Home",
          "Published local CMS home content.",
          "Main Navigation",
          "Local Ministry Update",
          "Local Project",
          "Local Missionary Giving",
          "give-hope-demo",
        ]) {
          expect(body, `${label} ${method} ${path} body`).not.toContain(
            forbidden,
          );
        }
      }
    }
  }
}

async function findPayloadDoc<T extends DocWithId>(
  request: APIRequestContext,
  collection: string,
  field: string,
  value: string,
) {
  const params = new URLSearchParams({
    depth: "0",
    draft: "true",
    limit: "1",
  });
  params.set(`where[${field}][equals]`, value);

  const response = await request.get(
    `${adminBaseURL}/web-studio/api/${collection}?${params.toString()}`,
  );
  expect(response.ok()).toBe(true);

  const body = (await response.json()) as PayloadListResponse<T>;
  expect(body.docs?.[0]).toBeTruthy();
  return body.docs![0];
}

test.describe("@cms-local strict local CMS happy path", () => {
  test("bodyless browser deletes remove a reaction, its post and a Studio draft", async ({
    page,
  }) => {
    // Fix check G6: fail, not skip, without the missionary app; the strict
    // local run starts it (scripts/cms/run-local-e2e.mjs).
    const missionary = process.env.PLAYWRIGHT_MISSIONARY_BASE_URL;
    expect(
      missionary,
      "PLAYWRIGHT_MISSIONARY_BASE_URL: the missionary app on the same seeded local stack",
    ).toBeTruthy();
    await signInAsLocalDemoAdmin(page);
    const headers = await writeHeaders(
      page,
      `${new URL(adminBaseURL).origin}/`,
    );
    const studio = await page.request.post(
      `${adminBaseURL}/web-studio/api/pages?draft=true`,
      {
        headers,
        data: {
          title: "Browser delete check",
          slug: `delete-${Date.now()}`,
          pageType: "standard",
          _status: "draft",
        },
      },
    );
    expect(studio.status()).toBe(201);
    const documentId = (await studio.json()).doc.id;
    const removedDraft = await page.evaluate(
      async ({ documentId, headers }) => {
        const response = await fetch(`/web-studio/api/pages/${documentId}`, {
          method: "DELETE",
          headers,
        });
        return response.status;
      },
      { documentId, headers },
    );
    expect(removedDraft).toBe(200);

    await page.goto(`${missionary}/api/health`);
    const post = await page.evaluate(async () => {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          content: "Browser deletion fixture",
          visibility: "public",
        }),
      });
      return {
        status: response.status,
        id: (await response.json()).post?.id as string | undefined,
      };
    });
    expect(post.status).toBe(201);
    expect(post.id).toBeTruthy();
    try {
      await page.goto(`${donorBaseURL}/api/playwright-ready`);
      for (const method of ["POST", "DELETE"]) {
        const reaction = await page.evaluate(
          async ({ id, method }) => {
            const response = await fetch(`/api/posts/${id}/like`, { method });
            return { status: response.status, result: await response.json() };
          },
          { id: post.id, method },
        );
        expect(reaction).toEqual({
          status: 200,
          result: { success: true, applied: true },
        });
      }
    } finally {
      await page.goto(`${missionary}/api/health`);
      const status = await page.evaluate(
        async (id) =>
          (await fetch(`/api/posts/${id}`, { method: "DELETE" })).status,
        post.id,
      );
      expect(status).toBe(200);
    }
  });

  test("picker lookups load template and uploaded media options on a seeded page", async ({
    page,
  }) => {
    await signInAsLocalDemoAdmin(page, "/web-studio/collections/pages");
    const doc = await findPayloadDoc<DocWithId>(
      page.request,
      "pages",
      "slug",
      "local-cms-home",
    );
    await page.goto(`${adminBaseURL}/web-studio/collections/pages/${doc.id}`);
    for (const [field, collection, search] of [
      ["#field-template", "page-templates", "Project"],
      ["#field-layout__0__backgroundImage", "media", "Local"],
    ] as const) {
      const combobox = page.locator(field).getByRole("combobox");
      if (collection === "media" && !(await combobox.isVisible())) {
        const toggle = page
          .locator('[id$="layout-row-0"] button[aria-expanded="false"]')
          .first();
        if (await toggle.isVisible()) await toggle.click();
      }
      await combobox.click();
      const result = page.waitForResponse((response) => {
        const request = response.request();
        return (
          new URL(response.url()).pathname ===
            `/web-studio/api/${collection}` &&
          request.method() === "POST" &&
          request.headers()["x-payload-http-method-override"] === "GET" &&
          Boolean(request.postData()?.includes(search))
        );
      });
      await combobox.fill(search);
      const response = await result;
      expect(response.status()).toBe(200);
      expect((await response.json()).docs).toBeInstanceOf(Array);
      await combobox.press("Escape");
    }
  });

  test("the signed-in Reports screen downloads its same-origin CSV", async ({
    page,
  }) => {
    await signInAsLocalDemoAdmin(page);
    await page.goto(`${adminBaseURL}/reports`);
    const [response, download] = await Promise.all([
      page.waitForResponse(
        (result) =>
          new URL(result.url()).pathname === "/api/admin/crm/reports/export",
      ),
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Export CSV" }).click(),
    ]);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("text/csv");
    expect(await download.failure()).toBeNull();
    expect(download.suggestedFilename()).toMatch(/\.csv$/);
  });

  test("redirects unauthenticated Web Studio users to Mission Control login", async ({
    page,
  }) => {
    await page.goto(`${adminBaseURL}/web-studio`);

    await expect(page).toHaveURL(/\/login/);
    await expect(page).toHaveURL(/next=%2Fweb-studio/);
  });

  test("returns 404 on retired public CMS routes signed out and signed in and renders donor not-found page after WP6 part 2a", async ({
    page,
    request,
  }) => {
    await expectRetiredPublicCms404(request, "signed-out");

    await signInAsLocalDemoAdmin(page);
    await expectRetiredPublicCms404(page.request, "signed-in");

    await page.goto(`${donorBaseURL}/local-cms-home`);
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "This page could not be found." }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Local CMS Home" }),
    ).toHaveCount(0);
    await expect(
      page.getByText("Published local CMS home content."),
    ).toHaveCount(0);
  });

  test("loads seeded Web Studio collections, preview, media, and template creation", async ({
    page,
  }) => {
    await signInAsLocalDemoAdmin(page, "/web-studio/collections/pages");

    const seededPage = await findPayloadDoc<{ id: string | number }>(
      page.request,
      "pages",
      "slug",
      "local-cms-home",
    );
    const draftPage = await findPayloadDoc<{ id: string | number }>(
      page.request,
      "pages",
      "slug",
      "local-cms-draft-preview",
    );
    const standardTemplate = await findPayloadDoc<{ id: string | number }>(
      page.request,
      "page-templates",
      "templateKey",
      "standard-local",
    );
    const navigation = await findPayloadDoc<{ id: string | number }>(
      page.request,
      "navigation",
      "label",
      "Main Navigation",
    );
    const missionaryProfile = await findPayloadDoc<{
      fullName: string;
      id: string | number;
    }>(page.request, "missionary-profiles", "slug", "local-missionary");
    const ministryUpdate = await findPayloadDoc<{ id: string | number }>(
      page.request,
      "ministry-updates",
      "slug",
      "local-ministry-update",
    );
    const media = await findPayloadDoc<{ id: string | number }>(
      page.request,
      "media",
      "alt",
      "Local CMS Demo Image",
    );
    const givingPage = await findPayloadDoc<{
      id: string | number;
      title: string;
    }>(
      page.request,
      "missionary-giving-pages",
      "slug",
      "local-missionary-giving",
    );
    const projectPage = await findPayloadDoc<{
      id: string | number;
      title: string;
    }>(page.request, "project-pages", "slug", "local-project");

    const collectionRoutes: CollectionRouteExpectation[] = [
      {
        href: "/web-studio/collections/pages",
        text: "Local CMS Home",
      },
      {
        href: `/web-studio/collections/pages/${seededPage.id}`,
        text: "Local CMS Home",
      },
      {
        href: "/web-studio/collections/navigation",
        text: "Main Navigation",
      },
      {
        href: `/web-studio/collections/navigation/${navigation.id}`,
        text: "Main Navigation",
      },
      {
        href: "/web-studio/collections/missionary-profiles",
        text: missionaryProfile.fullName,
      },
      {
        href: `/web-studio/collections/missionary-profiles/${missionaryProfile.id}`,
        text: missionaryProfile.fullName,
      },
      {
        href: "/web-studio/collections/ministry-updates",
        text: "Local Ministry Update",
      },
      {
        href: `/web-studio/collections/ministry-updates/${ministryUpdate.id}`,
        text: "Local Ministry Update",
      },
      {
        href: "/web-studio/collections/media",
        text: "Local CMS Demo Image",
      },
      {
        href: `/web-studio/collections/media/${media.id}`,
        textbox: {
          name: /Alt/,
          value: "Local CMS Demo Image",
        },
      },
      {
        href: "/web-studio/collections/page-templates",
        text: "Standard Page Template",
      },
      {
        href: `/web-studio/collections/page-templates/${standardTemplate.id}`,
        text: "Standard Page Template",
      },
      {
        href: "/web-studio/collections/missionary-giving-pages",
        text: givingPage.title,
      },
      {
        href: `/web-studio/collections/missionary-giving-pages/${givingPage.id}`,
        text: givingPage.title,
      },
      {
        href: "/web-studio/collections/project-pages",
        text: projectPage.title,
      },
      {
        href: `/web-studio/collections/project-pages/${projectPage.id}`,
        text: projectPage.title,
      },
    ];

    for (const route of collectionRoutes) {
      await page.goto(`${adminBaseURL}${route.href}`);
      await expect(
        page.getByTestId("web-studio-native-shell").filter({ visible: true }),
      ).toBeVisible();
      if (route.text) {
        await expect(page.getByText(route.text).first()).toBeVisible();
      } else {
        await expect(
          page.getByRole("textbox", { name: route.textbox.name }),
        ).toHaveValue(route.textbox.value);
      }
      await expectNoPayloadFailure(page);
    }

    await page.goto(`${adminBaseURL}/web-studio/preview/pages/${draftPage.id}`);
    await expect(
      page.getByText("Local CMS Draft Preview").first(),
    ).toBeVisible();
    await expect(
      page.getByText("Draft local CMS preview content."),
    ).toBeVisible();

    // Cache Components may retain hidden route views; strict matching still
    // requires exactly one visible, interactive native shell.
    for (const href of [
      "/web-studio/templates",
      "/web-studio/pages/new-from-template",
      "/web-studio/pages/give",
      "/web-studio/projects/new",
      "/web-studio/ministry-updates/new",
      "/web-studio/missionaries",
    ]) {
      await page.goto(`${adminBaseURL}${href}`);
      await expect(
        page.getByTestId("web-studio-native-shell").filter({ visible: true }),
      ).toBeVisible();
      await expectNoPayloadFailure(page);
    }

    const uniqueSlug = `created-local-standard-page-${Date.now()}`;
    const createdIds: string[] = [];
    for (const suffix of ["first", "second"]) {
      const title = `Created Local Standard Page ${suffix}`;
      // Payload's REST routes, custom endpoints included, answer under
      // /web-studio/api (AL-2675, WP2b slice C).
      const createResponse = await page.request.post(
        `${adminBaseURL}/web-studio/api/web-studio/create-from-template`,
        {
          headers: await writeHeaders(page, adminBaseURL),
          data: {
            targetCollection: "pages",
            templateId: String(standardTemplate.id),
            title,
            slug: `${uniqueSlug}-${suffix}`,
          },
        },
      );
      expect(createResponse.ok(), await createResponse.text()).toBe(true);
      const created = (await createResponse.json()) as {
        collectionSlug: string;
        id: string;
      };
      expect(created.collectionSlug).toBe("pages");
      expect(createdIds).not.toContain(created.id);
      createdIds.push(created.id);

      await page.goto(
        `${adminBaseURL}/web-studio/collections/pages/${created.id}`,
      );
      await expect(page.getByText(title).first()).toBeVisible();
    }
  });
});
