import { expect, test, type Page } from "@playwright/test";

import {
  bumpGeneration,
  P_EMAIL,
  proofReady,
  restoreName,
  saveName,
  signIn,
  sql,
} from "./helpers/n2-on";

test.skip(!proofReady(), "run through `bun run test:e2e:n2-on`");

const STALE_MESSAGE =
  "This page was opened for a different organization. Reload the page to continue; nothing was saved.";

async function enterWebStudio(page: Page) {
  const documents: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "document") {
      const url = new URL(request.url());
      documents.push(url.pathname + url.search);
    }
  });
  await signIn(page, P_EMAIL);
  await page.goto("/admin/web-studio");
  await page.waitForURL(
    /\/admin\/web-studio\/organization\?next=%2Fweb-studio$/,
  );
  const choice = page.getByRole("button", { name: /Development/ });
  await expect(choice).toBeVisible();
  const before = documents.length;
  const answered = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === "/admin/web-studio/organization" &&
      response.request().method() === "POST",
  );
  await choice.click();
  const answer = await answered;
  await page.waitForURL((url) => url.pathname === "/admin/web-studio");
  await expect(page.locator("[data-web-studio-scope]")).toBeAttached();
  return {
    documents,
    afterChoice: () => documents.slice(before),
    softRedirect: answer.headers()["x-action-redirect"] ?? null,
  };
}

async function createDraftPage(page: Page, title: string): Promise<string> {
  return page.evaluate(async (pageTitle) => {
    const sites = await fetch(
      "/admin/web-studio/api/site-presentations?limit=1&depth=0&sort=id",
    );
    const site = ((await sites.json()) as { docs: Array<{ id: string }> })
      .docs[0]?.id;
    const created = await fetch("/admin/web-studio/api/pages?draft=true", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: pageTitle,
        slug: pageTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        site,
        family: "standard",
        _status: "draft",
      }),
    });
    const body = (await created.json()) as { doc?: { id: string | number } };
    if (!created.ok || !body.doc) {
      throw new Error(`create failed: ${created.status}`);
    }
    return String(body.doc.id);
  }, title);
}

function titleOf(id: string): string {
  return sql(`SELECT title FROM cms.pages WHERE id::text = '${id}'`);
}

async function deletePageAfter(
  page: Page,
  id: string,
  body: () => Promise<void>,
) {
  let failure: unknown = null;
  try {
    await body();
  } catch (error) {
    failure = error;
  }
  try {
    await deletePage(page, id);
  } catch (error) {
    failure ??= error;
  }
  if (failure !== null) throw failure;
}

async function deletePage(page: Page, id: string) {
  page.on("dialog", (dialog) => void dialog.accept());
  await page.goto("/admin/web-studio");
  await expect(page.locator("[data-web-studio-scope]")).toBeAttached();
  const status = await page.evaluate(async (pageId) => {
    const response = await fetch(`/admin/web-studio/api/pages/${pageId}`, {
      method: "DELETE",
    });
    return response.status;
  }, id);
  expect(status).toBe(200);
  expect(titleOf(id)).toBe("");
}

test("a choice in Web Studio's chooser enters by a document load; the API tab shows the JSON and offers no new-tab link; the REST address opened as a page is refused", async ({
  page,
  context,
}) => {
  const studio = await enterWebStudio(page);
  expect(studio.softRedirect).toBeNull();
  expect(studio.afterChoice()).toContain("/admin/web-studio");
  const title = `N2 on api ${Date.now()}`;
  const id = await createDraftPage(page, title);
  await deletePageAfter(page, id, async () => {
    await page.goto(`/admin/web-studio/collections/pages/${id}`);
    await expect(page.locator("[data-web-studio-scope]")).toBeAttached();
    const loginLoads: string[] = [];
    context.on("request", (request) => {
      if (
        request.resourceType() === "document" &&
        new URL(request.url()).pathname.startsWith("/admin/login")
      ) {
        loginLoads.push(request.url());
      }
    });
    const [preview] = await Promise.all([
      context.waitForEvent("page"),
      page
        .locator(`a[href="/admin/web-studio/preview/pages/${id}"]`)
        .filter({ visible: true })
        .first()
        .click(),
    ]);
    await expect(preview.getByRole("heading", { name: title })).toBeVisible();
    expect(new URL(preview.url()).pathname).toBe(
      `/admin/web-studio/preview/pages/${id}`,
    );
    expect(loginLoads).toEqual([]);
    await preview.close();

    await page.goto(`/admin/web-studio/collections/pages/${id}/api`);
    await expect(page.locator(".query-inspector")).toContainText(id);
    await expect(
      page.locator(".query-inspector__api-url-open-button"),
    ).toBeHidden();
    await expect(
      page.locator(".query-inspector__api-url-input"),
    ).toBeAttached();

    const opened = await context.newPage();
    const answer = await opened.goto(`/admin/web-studio/api/pages/${id}`);
    expect(answer?.status()).toBe(409);
    expect(answer?.headers()["x-asym-web-studio-refusal"]).toBe(
      "scope_mismatch",
    );
    await opened.close();
  });
});

test("Web Studio left open after the name's generation moved refuses a page made from a template with the reload prompt, and makes none", async ({
  page,
}) => {
  await enterWebStudio(page);
  await page.waitForLoadState("networkidle");
  const before = sql("SELECT count(*) FROM cms.pages");
  const saved = saveName();
  try {
    bumpGeneration();
    const answer = await page.evaluate(async () => {
      const response = await fetch(
        "/admin/web-studio/api/web-studio/create-from-template",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ title: "N2 on template" }),
        },
      );
      return {
        status: response.status,
        refusal: response.headers.get("x-asym-web-studio-refusal"),
      };
    });
    expect(answer).toEqual({ status: 409, refusal: "scope_mismatch" });
    const notice = page.getByRole("alertdialog");
    await expect(notice).toBeVisible();
    await expect(notice).toContainText(STALE_MESSAGE);
    expect(sql("SELECT count(*) FROM cms.pages")).toBe(before);
  } finally {
    restoreName(saved);
  }
});

test("Web Studio left open after the name's generation moved refuses a list read and a save with the reload prompt, and saves nothing", async ({
  page,
}) => {
  await enterWebStudio(page);
  const title = `N2 on stale ${Date.now()}`;
  const id = await createDraftPage(page, title);
  const saved = saveName();
  await deletePageAfter(page, id, async () => {
    try {
      await page.goto(`/admin/web-studio/collections/pages/${id}`);
      const field = page.getByRole("textbox", { name: /^Title/ }).first();
      await expect(field).toHaveValue(title);
      await page.waitForLoadState("networkidle");

      const moved = String(bumpGeneration());
      await field.fill(`${title} changed`);
      const saving = page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname ===
            `/admin/web-studio/api/pages/${id}` &&
          response.request().method() === "PATCH" &&
          !response.url().includes("autosave=true"),
      );
      await page.getByRole("button", { name: /^Save Draft$/i }).click();
      const save = await saving;
      expect(save.status()).toBe(409);
      expect(save.headers()["x-asym-web-studio-refusal"]).toBe(
        "scope_mismatch",
      );
      const notice = page.getByRole("alertdialog");
      await expect(notice).toBeVisible();
      await expect(notice).toContainText(STALE_MESSAGE);

      const list = await page.evaluate(async () => {
        const response = await fetch("/admin/web-studio/api/pages?limit=5");
        return {
          status: response.status,
          refusal: response.headers.get("x-asym-web-studio-refusal"),
        };
      });
      expect(list).toEqual({ status: 409, refusal: "scope_mismatch" });
      expect(titleOf(id)).toBe(title);

      const reloaded = page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname.startsWith(
            "/admin/web-studio/api/",
          ) &&
          response.request().headers()["x-asym-scope-generation"] === moved &&
          response.status() === 200,
      );
      await notice.getByRole("button", { name: "Reload" }).click();
      await reloaded;
      await expect(
        page.getByRole("textbox", { name: /^Title/ }).first(),
      ).toHaveValue(title);
    } finally {
      restoreName(saved);
    }
  });
});
