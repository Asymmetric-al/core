import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from "@playwright/test";

import { adminBaseURL, donorBaseURL } from "./base-urls";
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

async function signInAsLocalDemoAdmin(page: Page, next = "/web-studio") {
  const availability = await page.request.get(
    `${adminBaseURL}/api/auth/demo-account`,
  );
  expect(availability.ok()).toBe(true);

  const payload = (await availability.json()) as {
    availableRoles?: Record<string, boolean>;
    roles?: Record<string, boolean>;
  };
  expect(payload.availableRoles?.admin ?? payload.roles?.admin).toBe(true);

  await page.goto(`${adminBaseURL}/login?next=${encodeURIComponent(next)}`);
  await page.getByRole("button", { name: "Demo Access" }).click();
  await page.waitForURL(new RegExp(next.replace(/\//g, "\\/")));
  await expect(page.getByTestId("web-studio-native-shell")).toBeVisible();
  await expectNoPayloadFailure(page);
}

async function fetchPublicJson<T>(
  request: APIRequestContext,
  path: string,
  status = 200,
) {
  const response = await request.get(`${adminBaseURL}${path}`, {
    headers: tenantHeaders,
  });
  expect(response.status()).toBe(status);
  return (await response.json()) as T;
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
    `${adminBaseURL}/api/${collection}?${params.toString()}`,
  );
  expect(response.ok()).toBe(true);

  const body = (await response.json()) as PayloadListResponse<T>;
  expect(body.docs?.[0]).toBeTruthy();
  return body.docs![0];
}

test.describe("@cms-local strict local CMS happy path", () => {
  test("redirects unauthenticated Web Studio users to Mission Control login", async ({
    page,
  }) => {
    await page.goto(`${adminBaseURL}/web-studio`);

    await expect(page).toHaveURL(/\/login/);
    await expect(page).toHaveURL(/next=%2Fweb-studio/);
  });

  test("serves seeded public CMS content and renders it through the donor app", async ({
    page,
    request,
  }) => {
    const home = await fetchPublicJson<{
      page: { id: string | number; title: string; slug: string };
      tenant: { slug: string };
    }>(request, "/api/cms/public/pages/local-cms-home");
    expect(home.tenant.slug).toBe("give-hope-demo");
    expect(home.page).toMatchObject({
      slug: "local-cms-home",
      title: "Local CMS Home",
    });

    const navigation = await fetchPublicJson<{
      navigation: { label: string; items: unknown[] };
      tenant: { slug: string };
    }>(request, "/api/cms/public/navigation");
    expect(navigation.navigation.label).toBe("Main Navigation");
    expect(navigation.navigation.items.length).toBeGreaterThanOrEqual(4);

    const updates = await fetchPublicJson<{
      updates: Array<{ slug: string; title: string }>;
    }>(request, "/api/cms/public/updates?limit=5");
    expect(updates.updates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "local-ministry-update",
          title: "Local Ministry Update",
        }),
      ]),
    );

    const project = await fetchPublicJson<{
      page: { slug: string; title: string };
    }>(request, "/api/cms/public/project-pages/local-project");
    expect(project.page.slug).toBe("local-project");

    const missionary = await fetchPublicJson<{
      page: { slug: string; title: string };
    }>(
      request,
      "/api/cms/public/missionary-pages/11111111-1111-1111-1111-111111111111",
    );
    expect(missionary.page.slug).toBe("local-missionary-giving");

    await fetchPublicJson(request, "/api/cms/public/pages/not-a-page", 404);

    await page.goto(`${donorBaseURL}/local-cms-home`);
    await expect(
      page.getByRole("heading", { name: "Local CMS Home" }).first(),
    ).toBeVisible();
    await expect(
      page.getByText("Published local CMS home content."),
    ).toBeVisible();
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
      await expect(page.getByTestId("web-studio-native-shell")).toBeVisible();
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

    for (const href of [
      "/web-studio/templates",
      "/web-studio/pages/new-from-template",
      "/web-studio/pages/give",
      "/web-studio/projects/new",
      "/web-studio/ministry-updates/new",
      "/web-studio/missionaries",
    ]) {
      await page.goto(`${adminBaseURL}${href}`);
      await expect(page.getByTestId("web-studio-native-shell")).toBeVisible();
      await expectNoPayloadFailure(page);
    }

    const uniqueSlug = `created-local-standard-page-${Date.now()}`;
    const createResponse = await page.request.post(
      `${adminBaseURL}/api/web-studio/create-from-template`,
      {
        data: {
          targetCollection: "pages",
          templateId: String(standardTemplate.id),
          title: "Created Local Standard Page",
          slug: uniqueSlug,
        },
      },
    );
    expect(createResponse.ok()).toBe(true);
    const created = (await createResponse.json()) as {
      collectionSlug: string;
      id: string;
    };
    expect(created.collectionSlug).toBe("pages");

    await page.goto(
      `${adminBaseURL}/web-studio/collections/pages/${created.id}`,
    );
    await expect(
      page.getByText("Created Local Standard Page").first(),
    ).toBeVisible();
  });
});
