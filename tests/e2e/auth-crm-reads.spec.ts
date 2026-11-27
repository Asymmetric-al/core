import { randomUUID } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";
import { readAuthMailEnv, warmUpRoutes } from "./helpers/auth-mail";
import {
  createPerson,
  deletePerson,
  documentScopeHeaders,
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
    rows: [],
    reason: "",
  },
  {
    path: "/crm/relationships",
    heading: "CRM Relationships",
    emptyState: /Sam Ortiz/,
    rows: [
      {
        recordId: "21000000-0000-0000-0000-000000000002",
        recordKind: "missionary",
        displayName: "Sam Ortiz",
      },
    ],
    reason:
      " (D-18, AL-2678: the seed's fixture worker Sam Ortiz holds a missionary record in the second organization, so its one relationship row is his, not the empty state)",
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
        "insert into public.donors (id,tenant_id,party_id,name,updated_at) values ($1,$3,public.donor_party_for_insert($3,null,'Alice Johnson',null),'Alice Johnson',now()),($2,$3,public.donor_party_for_insert($3,null,'Frank Miller',null),'Frank Miller',now())",
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
    for (const {
      emptyState,
      heading,
      path,
      rows: expectedRows,
      reason,
    } of CRM_LOCAL_SURFACES) {
      test(`${heading} (${path}) loads local Asym Postgres data without overlay${reason}`, async ({
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
          rows: expectedRows,
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

    test("staff without the administrator flag are refused a restricted note and nothing is written", async ({
      page,
    }) => {
      const title = "Restricted CRM note " + randomUUID();
      const staff = await createPerson(env!, "crm-plain-staff", [
        {
          role: "staff",
          tenantId: SECOND,
          staffRole: "development",
          admin: false,
        },
      ]);
      try {
        await signIn(page, staff.email, staff.password);
        await page.goto(`/${SECOND}/crm/notes`);
        await expect(
          page.getByRole("heading", { name: "CRM Notes" }),
        ).toBeVisible();
        const headers = await documentScopeHeaders(page);
        expect(headers).toEqual({
          "x-asym-tenant": SECOND,
          "x-asym-assignment": staff.rows[`${SECOND}:staff`],
        });
        const reply = await page.evaluate(
          async ({ scope, note }) => {
            const response = await fetch("/api/admin/crm/notes", {
              body: JSON.stringify(note),
              credentials: "same-origin",
              headers: {
                ...scope,
                Accept: "application/json",
                "Content-Type": "application/json",
                "Idempotency-Key": crypto.randomUUID(),
              },
              method: "POST",
            });
            return { status: response.status, text: await response.text() };
          },
          {
            scope: headers,
            note: { title, body: "Pastoral detail.", visibility: "restricted" },
          },
        );
        expect(reply.status).toBe(403);
        expect(reply.text).toContain("tenant-administrator flag");
        const written = await withOwner(env!, (db) =>
          db.query(
            "select (select count(*) from public.crm_notes where title=$1)::int as notes, (select count(*) from public.crm_command_logs where actor_user_id=$2)::int as logs",
            [title, staff.userId],
          ),
        );
        expect(written.rows).toEqual([{ notes: 0, logs: 0 }]);
      } finally {
        await deletePerson(env!, staff);
      }
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

      const alice = page
        .getByRole("button", { name: /Alice Johnson/i })
        .first();
      await expect(alice).toBeVisible();
      const missing = "__no_such_contact__";
      const [filtered] = await Promise.all([
        page.waitForResponse((response) => {
          const url = new URL(response.url());
          return (
            url.pathname === "/api/admin/crm/records" &&
            url.searchParams.get("q") === missing
          );
        }),
        search.fill(missing),
      ]);
      expect(filtered.status()).toBe(200);
      await expect(page).toHaveURL(
        (url) => url.searchParams.get("q") === missing,
      );
      await expect(page.getByText("No matching records")).toBeVisible();

      await page
        .getByRole("button", { name: "Clear search", exact: true })
        .click();
      await expect(search).toHaveValue("");
      await expect(page).toHaveURL((url) => !url.searchParams.has("q"));
      await expect(alice).toBeVisible();
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
