import { randomUUID } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";
import { readAuthMailEnv, warmUpRoutes } from "./helpers/auth-mail";
import {
  createPerson,
  deletePerson,
  DEMO,
  SECOND,
  ORGANIZATION_NAME,
  SEEDED,
  SEEDED_PASSWORD,
  signIn,
  withOwner,
  type Person,
} from "./helpers/request-scope-reads";
import { trackDocumentLoads } from "./helpers/tenant-address";

// D-18: data-dependent CRM journeys sign in on the isolated local stack.
const env = readAuthMailEnv();
const donors = [randomUUID(), randomUUID()];
const noteTitle = "Local CRM note " + randomUUID();
let dual: Person | null = null;
async function markDocument(page: Page) {
  await page.evaluate(() => {
    (window as unknown as { __tenantDoc?: boolean }).__tenantDoc = true;
  });
}

async function documentMarked(page: Page) {
  return page.evaluate(
    () => (window as unknown as { __tenantDoc?: boolean }).__tenantDoc === true,
  );
}

const CRM_LOCAL_SURFACES = [
  {
    path: "/crm/notes",
    heading: "CRM Notes",
    emptyState: /No CRM notes/i,
  },
  {
    path: "/crm/relationships",
    heading: "CRM Relationships",
    emptyState: /No CRM relationships/i,
  },
] as const;

test.describe("CRM on the caller's session", () => {
  test.beforeAll(async () => {
    test.skip(
      test.info().project.name !== "auth-mail-admin",
      "Real local admin sessions only.",
    );
    if (!env?.dbUrl)
      throw new Error("CRM journeys require the local Auth/PostgREST database");
    const baseURL = test.info().project.use.baseURL!;
    await warmUpRoutes(baseURL, [
      "/login",
      "/choose-organization",
      `/${DEMO}/crm`,
      `/${SECOND}/crm/notes`,
      `/${SECOND}/crm/relationships`,
      "/api/admin/crm/records",
      "/api/admin/crm/notes",
      "/api/admin/crm/relationships",
    ]);
    dual = await createPerson(
      env,
      "crm-staff",
      [DEMO, SECOND].map((tenantId) => ({
        role: "staff" as const,
        tenantId,
        staffRole: "development" as const,
        admin: true,
      })),
    );
    await withOwner(env, (db) =>
      db.query(
        "insert into public.donors (id,tenant_id,name,updated_at) values ($1,$3,'Alice Johnson',now()),($2,$3,'Frank Miller',now())",
        [...donors, DEMO],
      ),
    );
  });
  test.afterAll(async () => {
    if (!env?.dbUrl) return;
    await withOwner(env, async (db) => {
      await db.query(
        "delete from public.crm_command_logs where tenant_id=$1 and resource_id in (select id::text from public.crm_notes where tenant_id=$1 and title=$2)",
        [SECOND, noteTitle],
      );
      await db.query(
        "delete from public.crm_notes where tenant_id=$1 and title=$2",
        [SECOND, noteTitle],
      );
      await db.query("delete from public.donors where id=any($1::uuid[])", [
        donors,
      ]);
    });
    await deletePerson(env, dual);
  });
  test.describe("Local CRM notes and relationships", () => {
    for (const { emptyState, heading, path } of CRM_LOCAL_SURFACES) {
      test(`${heading} (${path}) loads local Asym Postgres data without overlay`, async ({
        page,
      }) => {
        await signIn(page, SEEDED.morgan.email, SEEDED_PASSWORD);
        const rows = page.waitForResponse(
          (response) =>
            new URL(response.url()).pathname === "/api/admin" + path &&
            response.request().method() === "GET",
        );
        await page.goto(`/${SECOND}${path}`);
        const reply = await rows;
        expect(reply.status()).toBe(200);
        expect(await reply.json()).toMatchObject({
          configured: true,
          mode: "local",
          rows: [],
        });
        await page.waitForLoadState("domcontentloaded");

        await expect(page.locator("#__next_error__")).toHaveCount(0);
        await expect(
          page.getByRole("link", { name: /Mission Control/i }),
        ).toBeVisible();
        await expect(
          page.getByRole("heading", { name: heading }),
        ).toBeVisible();
        await expect(page.getByText(emptyState).first()).toBeVisible({
          timeout: 120_000,
        });
        // The configured Notes screen suppresses its provenance footer. The
        // response above proves the local store there, even for an empty list.
        if (path === "/crm/relationships")
          await expect(
            page
              .getByRole("group", { name: "Data sources" })
              .getByText("Mission Control"),
          ).toBeVisible();
        await expect(page.getByText("Twenty CRM", { exact: true })).toHaveCount(
          0,
        );
        await expect(
          page.getByText("Twenty-backed", { exact: true }),
        ).toHaveCount(0);
      });
    }

    test("authorized staff can create a local CRM note that remains readable", async ({
      page,
    }) => {
      await signIn(page, SEEDED.morgan.email, SEEDED_PASSWORD);
      await page.goto(`/${SECOND}/crm/notes`);
      await page.waitForLoadState("domcontentloaded");

      const uniqueTitle = noteTitle;
      await page.getByLabel("Title").fill(uniqueTitle);
      await page.getByLabel("Body").fill("Authoritative Asym Postgres note.");
      await page.getByRole("button", { name: "Save note" }).click();

      await expect(page.getByText("CRM note saved")).toBeVisible();
      await expect(page.getByRole("cell", { name: uniqueTitle })).toBeVisible();
      await expect(page.getByText("Queued for Twenty")).toHaveCount(0);
    });
  });

  test.describe("CRM table interactions", () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
    });

    test("search filters records and clearing shows rows again", async ({
      page,
    }) => {
      await signIn(page, SEEDED.owner.email, SEEDED_PASSWORD);
      await page.goto(`/${DEMO}/crm`);
      await page.waitForLoadState("domcontentloaded");
      await expect(page.locator("#__next_error__")).toHaveCount(0);

      const search = page.getByRole("searchbox", {
        name: "Search CRM records",
      });
      await expect(search).toBeVisible();

      await search.fill("__no_such_contact__");
      await expect(page.getByText("No matching records")).toBeVisible();

      await page
        .getByRole("button", { name: "Clear search", exact: true })
        .click();
      await expect(
        page.getByRole("button", { name: /Alice Johnson/i }).first(),
      ).toBeVisible();
    });

    test("shows every loaded record without client pagination", async ({
      page,
    }) => {
      await signIn(page, SEEDED.owner.email, SEEDED_PASSWORD);
      await page.goto(`/${DEMO}/crm`);
      await page.waitForLoadState("domcontentloaded");

      const records = page.getByRole("region", { name: "CRM records" });
      await expect(
        records.getByRole("button", { name: /Alice Johnson/i }).first(),
      ).toBeVisible();
      // The ReUI grid renders loaded pages in one scroll body (no 10-row page).
      await expect(page.getByText(/^Page \d+ of \d+$/)).toHaveCount(0);
      await expect(
        records.getByRole("button", { name: /Frank Miller/i }).first(),
      ).toBeAttached();
    });
  });

  for (const [person, tenant] of [
    ["demoAdmin", DEMO],
    ["twoTenants", SECOND],
  ] as const) {
    test(`changing the CRM search keeps the document and its tenant address (${person})`, async ({
      page,
    }) => {
      if (person === "demoAdmin")
        await signIn(page, SEEDED.owner.email, SEEDED_PASSWORD);
      else {
        await signIn(page, dual!.email, dual!.password);
        await expect(page).toHaveURL(/\/choose-organization/);
        await page
          .getByRole("link", {
            name: ORGANIZATION_NAME[SECOND] + ": Development",
          })
          .click();
      }
      const crm = `/${tenant}/crm`;
      await page.goto(crm);
      await expect(page.locator("[data-tenant-scope]")).toHaveAttribute(
        "data-tenant-scope",
        `/${tenant}`,
        { timeout: 90_000 },
      );
      const search = page.getByRole("searchbox", {
        name: "Search CRM records",
      });
      await expect(search).toBeVisible();
      await page.waitForLoadState("networkidle");
      const documents = trackDocumentLoads(page);
      await markDocument(page);

      await search.fill("__no_such_contact__");
      await expect(page).toHaveURL(
        (url) =>
          url.pathname === crm &&
          url.searchParams.get("q") === "__no_such_contact__",
      );
      await page.waitForLoadState("networkidle");

      expect(documents).toEqual([]);
      expect(await documentMarked(page)).toBe(true);
      await expect(search).toHaveValue("__no_such_contact__");
      await expect(page.locator("[data-tenant-scope]")).toHaveAttribute(
        "data-tenant-scope",
        `/${tenant}`,
      );
    });
  }
});
