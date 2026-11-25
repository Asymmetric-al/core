import { randomUUID } from "node:crypto";

import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { readAuthMailEnv, warmUpRoutes } from "./helpers/auth-mail";
import {
  DEMO,
  documentScopeHeaders,
  SECOND,
  SEEDED,
  SEEDED_PASSWORD,
  signIn,
  withOwner,
} from "./helpers/request-scope-reads";

const env = readAuthMailEnv();
const MEMBER_CARE_EMAIL = "member-care@givehope.test";
const fixtureName = `E2E Axe ${randomUUID().slice(0, 8)}`;
let fixtureSiteId: string | null = null;

type SiteRow = {
  id: string;
  name: string;
  status: string;
  is_default: boolean;
};

async function sitesOf(tenant: string): Promise<SiteRow[]> {
  return withOwner(
    env!,
    async (db) =>
      (
        await db.query(
          "select id::text, name, status, is_default from public.sites where tenant_id = $1 order by is_default desc, name, id",
          [tenant],
        )
      ).rows as SiteRow[],
  );
}

async function brandOf(tenant: string): Promise<string | null> {
  return withOwner(env!, async (db) => {
    const { rows } = await db.query(
      "select display_name from public.donor_account_brands where tenant_id = $1",
      [tenant],
    );
    return (rows[0]?.display_name as string | undefined) ?? null;
  });
}

async function statusOf(siteId: string): Promise<string | null> {
  return withOwner(env!, async (db) => {
    const { rows } = await db.query(
      "select status from public.sites where id = $1",
      [siteId],
    );
    return (rows[0]?.status as string | undefined) ?? null;
  });
}

async function openSites(page: Page, tenant: string) {
  await page.goto(`/${tenant}/settings/sites`);
  await page.waitForLoadState("domcontentloaded");
  await expect(page.locator("#__next_error__")).toHaveCount(0);
}

async function seriousViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  return results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious",
  );
}

async function tabUntilFocused(
  page: Page,
  target: ReturnType<Page["locator"]>,
) {
  for (let step = 0; step < 15; step += 1) {
    if (await target.evaluate((el) => el === document.activeElement)) return;
    await page.keyboard.press("Tab");
  }
  await expect(target).toBeFocused();
}

test.describe("Mission Control's Sites settings on real sessions (AL-2676 WP3b part 3)", () => {
  test.beforeAll(async () => {
    test.skip(
      test.info().project.name !== "auth-mail-admin",
      "Real local admin sessions only.",
    );
    if (!env?.dbUrl) {
      throw new Error("The Sites journeys need the local stack's database");
    }
    fixtureSiteId = await withOwner(env, async (db) => {
      const { rows } = await db.query(
        "insert into public.sites (tenant_id, name) values ($1, $2) returning id::text",
        [DEMO, fixtureName],
      );
      return rows[0]!.id as string;
    });
    const baseURL = test.info().project.use.baseURL!;
    await warmUpRoutes(baseURL, [
      "/login",
      `/${DEMO}`,
      `/${DEMO}/settings`,
      `/${DEMO}/settings/sites`,
      "/api/admin/sites",
    ]);
  });

  test.afterAll(async () => {
    if (!env?.dbUrl || !fixtureSiteId) return;
    await withOwner(env, async (db) => {
      await db.query("delete from public.sites where id = $1", [fixtureSiteId]);
    });
  });

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
  });

  test("J1: the demo owner creates, deactivates, reactivates and renames, each shown as the database holds it", async ({
    page,
  }) => {
    const name = `E2E Site ${randomUUID().slice(0, 8)}`;
    const newBrand = `E2E brand ${randomUUID().slice(0, 8)}`;
    const originalBrand = await brandOf(DEMO);
    try {
      await signIn(page, SEEDED.owner.email, SEEDED_PASSWORD);
      await page.goto(`/${DEMO}/settings`);
      await page
        .getByRole("main")
        .getByRole("link", { name: /^Sites/ })
        .click();
      await expect(page).toHaveURL(new RegExp(`/${DEMO}/settings/sites$`));
      const table = page.getByRole("table", {
        name: "Sites in this organization",
      });
      await expect(table).toBeVisible();

      const [defaultSite] = await sitesOf(DEMO);
      expect(defaultSite!.is_default).toBe(true);
      await expect(
        table.getByRole("row").nth(1).getByRole("cell").first(),
      ).toHaveText(defaultSite!.name);
      await expect(page.getByLabel("Donor account name")).toHaveValue(
        originalBrand ?? "",
      );

      await page
        .getByRole("region", { name: "Sites" })
        .getByRole("button", { name: "Create Site" })
        .click();
      const create = page.getByRole("dialog", { name: "Create a Site" });
      await expect(create.getByLabel("Site name")).toBeFocused();
      await create.getByLabel("Site name").fill(name);
      await create.getByRole("button", { name: "Create Site" }).dblclick();
      await expect(create).toBeHidden();
      await expect(
        table.getByRole("cell", { name, exact: true }),
      ).toBeVisible();
      const created = (await sitesOf(DEMO)).filter((s) => s.name === name);
      expect(created).toHaveLength(1);
      const siteId = created[0]!.id;
      expect(created[0]!.status).toBe("active");

      await page
        .getByRole("button", { name: `Deactivate ${name}`, exact: true })
        .click();
      let confirm = page.getByRole("alertdialog", {
        name: `Deactivate ${name}?`,
      });
      await confirm.getByRole("button", { name: "Cancel" }).click();
      await expect(confirm).toBeHidden();
      expect(await statusOf(siteId)).toBe("active");

      await page
        .getByRole("button", { name: `Deactivate ${name}`, exact: true })
        .click();
      confirm = page.getByRole("alertdialog", { name: `Deactivate ${name}?` });
      await confirm
        .getByRole("button", { name: "Deactivate", exact: true })
        .click();
      await expect(confirm).toBeHidden();
      const reactivate = page.getByRole("button", {
        name: `Reactivate ${name}`,
        exact: true,
      });
      await expect(reactivate).toBeVisible();
      await expect.poll(() => statusOf(siteId)).toBe("inactive");
      await expect(
        table.getByRole("row").filter({ hasText: name }).getByText("Inactive"),
      ).toBeVisible();

      await reactivate.click();
      await expect(
        page.getByRole("button", { name: `Deactivate ${name}`, exact: true }),
      ).toBeVisible();
      await expect.poll(() => statusOf(siteId)).toBe("active");

      await page.getByLabel("Donor account name").fill(newBrand);
      await page.getByRole("button", { name: "Save" }).click();
      await expect.poll(() => brandOf(DEMO)).toBe(newBrand);
      await expect(page.getByLabel("Donor account name")).toHaveValue(newBrand);
    } finally {
      await withOwner(env!, async (db) => {
        await db.query(
          "delete from public.sites where tenant_id = $1 and name = $2",
          [DEMO, name],
        );
        if (originalBrand !== null)
          await db.query(
            "update public.donor_account_brands set display_name = $1 where tenant_id = $2",
            [originalBrand, DEMO],
          );
      });
    }
  });

  test("J2: no serious or critical axe violation on the page or in either dialog", async ({
    page,
  }) => {
    await signIn(page, SEEDED.owner.email, SEEDED_PASSWORD);
    await openSites(page, DEMO);
    await expect(
      page.getByRole("table", { name: "Sites in this organization" }),
    ).toBeVisible();
    expect(await seriousViolations(page)).toEqual([]);

    await page
      .getByRole("region", { name: "Sites" })
      .getByRole("button", { name: "Create Site" })
      .click();
    const create = page.getByRole("dialog", { name: "Create a Site" });
    await expect(create).toBeVisible();
    expect(await seriousViolations(page)).toEqual([]);
    await create.getByRole("button", { name: "Cancel" }).click();
    await expect(create).toBeHidden();

    await page
      .getByRole("button", { name: `Deactivate ${fixtureName}`, exact: true })
      .click();
    const confirm = page.getByRole("alertdialog", {
      name: `Deactivate ${fixtureName}?`,
    });
    await expect(confirm).toBeVisible();
    expect(await seriousViolations(page)).toEqual([]);
    await confirm.getByRole("button", { name: "Cancel" }).click();
    await expect(confirm).toBeHidden();
    expect(await statusOf(fixtureSiteId!)).toBe("active");
  });

  test("J3: both dialogs open and close from the keyboard and give focus back", async ({
    page,
  }) => {
    await signIn(page, SEEDED.owner.email, SEEDED_PASSWORD);
    await openSites(page, DEMO);
    const createButton = page
      .getByRole("region", { name: "Sites" })
      .getByRole("button", { name: "Create Site" });
    await expect(createButton).toBeVisible();
    await page.getByLabel("Donor account name").focus();
    await tabUntilFocused(page, createButton);
    await page.keyboard.press("Enter");
    const create = page.getByRole("dialog", { name: "Create a Site" });
    await expect(create.getByLabel("Site name")).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(create).toBeHidden();
    await expect(createButton).toBeFocused();

    const deactivate = page.getByRole("button", {
      name: `Deactivate ${fixtureName}`,
      exact: true,
    });
    await tabUntilFocused(page, deactivate);
    await page.keyboard.press("Enter");
    const confirm = page.getByRole("alertdialog", {
      name: `Deactivate ${fixtureName}?`,
    });
    await expect(confirm).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(confirm).toBeHidden();
    await expect(deactivate).toBeFocused();
    expect(await statusOf(fixtureSiteId!)).toBe("active");
  });

  test("J4: a Member Care worker sees no Sites link, the no-access note, and a 403 from the read", async ({
    page,
  }) => {
    await signIn(page, MEMBER_CARE_EMAIL, SEEDED_PASSWORD);
    await page.goto(`/${DEMO}/settings`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByRole("navigation").getByRole("link", { name: /^Sites/ }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("main").getByRole("link", { name: /^Sites/ }),
    ).toHaveCount(0);

    await openSites(page, DEMO);
    const note = page.getByRole("note");
    await expect(note).toBeVisible();
    await expect(note).toContainText("No access to Sites");
    await expect(page.getByRole("table")).toHaveCount(0);

    const reply = await page.request.get("/api/admin/sites", {
      headers: await documentScopeHeaders(page),
    });
    expect(reply.status()).toBe(403);
  });

  test("J5: Harbor Light's administrator sees no demo Site and cannot change one", async ({
    page,
  }) => {
    const demoSites = await sitesOf(DEMO);
    const target = demoSites.find((site) => site.is_default)!;
    await signIn(page, SEEDED.morgan.email, SEEDED_PASSWORD);
    await openSites(page, SECOND);
    const table = page.getByRole("table", {
      name: "Sites in this organization",
    });
    await expect(table).toBeVisible();
    for (const site of await sitesOf(SECOND))
      await expect(
        table.getByRole("cell", { name: site.name, exact: true }),
      ).toBeVisible();
    for (const site of demoSites)
      await expect(
        page.getByRole("main").getByText(site.name, { exact: true }),
      ).toHaveCount(0);

    const reply = await page.request.post("/api/admin/sites/status", {
      headers: {
        ...(await documentScopeHeaders(page)),
        Origin: new URL(page.url()).origin,
      },
      data: { siteId: target.id, status: "inactive" },
    });
    expect(reply.status()).toBe(404);
    expect((await reply.json()).code).toBe("SITE_NOT_FOUND");
    expect(await statusOf(target.id)).toBe(target.status);
  });
});
