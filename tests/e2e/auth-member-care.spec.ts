import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

import { readAuthMailEnv, warmUpRoutes } from "./helpers/auth-mail";
import {
  createPerson,
  deletePerson,
  DEMO,
  documentScopeHeaders,
  SEEDED,
  SEEDED_PASSWORD,
  signIn,
  withOwner,
  type Person,
} from "./helpers/request-scope-reads";

const env = readAuthMailEnv();
const runTag = randomUUID().slice(0, 6);
const subjectId = randomUUID();
const subjectLastName = `CareSubject ${runTag}`;
const subjectFullName = `Scope ${subjectLastName}`;
let subjectPerson: Person | null = null;
let careWorker: Person | null = null;
let dualStaff: Person | null = null;

test.describe("Member Care on the caller's session", () => {
  test.beforeAll(async () => {
    test.skip(
      test.info().project.name !== "auth-mail-admin",
      "Real local admin sessions only.",
    );
    if (!env?.dbUrl) {
      throw new Error(
        "Member Care journeys require the local Auth/PostgREST database",
      );
    }

    subjectPerson = await createPerson(env, `mc-subject-${runTag}`, [
      { role: "missionary", tenantId: DEMO },
    ]);
    await withOwner(env, async (db) => {
      await db.query(
        "update public.profiles set first_name = $1, last_name = $2 where user_id = $3",
        ["Scope", subjectLastName, subjectPerson!.userId],
      );
      await db.query(
        `insert into public.missionaries (id, tenant_id, profile_id, location, legal_entity_id, health_status, manual_attention)
         select $1, tenant_id, $2, $3, id, 'healthy', false
           from public.legal_entities
          where tenant_id = $4`,
        [subjectId, subjectPerson!.userId, `Nairobi ${runTag}`, DEMO],
      );
    });

    careWorker = await createPerson(env, `mc-worker-${runTag}`, [
      {
        role: "staff",
        tenantId: DEMO,
        staffRole: "member_care",
        admin: false,
      },
    ]);

    dualStaff = await createPerson(env, `mc-dual-${runTag}`, [
      {
        role: "staff",
        tenantId: DEMO,
        staffRole: "finance",
        admin: false,
      },
      {
        role: "staff",
        tenantId: DEMO,
        staffRole: "member_care",
        admin: false,
      },
    ]);

    const baseURL = test.info().project.use.baseURL!;
    await warmUpRoutes(baseURL, [
      "/login",
      "/choose-organization",
      `/${DEMO}`,
      `/${DEMO}/care`,
      `/${DEMO}/care/directory`,
      `/${DEMO}/care/directory/${subjectId}`,
      "/api/admin/member-care/dashboard",
      "/api/admin/member-care/directory",
    ]);
  });

  test.afterAll(async () => {
    if (!env?.dbUrl) return;
    await withOwner(env, async (db) => {
      await db.query(
        "delete from public.member_care_private_notes where missionary_id = $1",
        [subjectId],
      );
      await db.query(
        "delete from public.member_care_activities where missionary_id = $1",
        [subjectId],
      );
      await db.query(
        "delete from public.member_care_goals where missionary_id = $1",
        [subjectId],
      );
      await db.query(
        "delete from public.member_care_requirements where missionary_id = $1",
        [subjectId],
      );
      await db.query(
        "delete from public.giving_target_entity_locks where missionary_id = $1",
        [subjectId],
      );
      await db.query("delete from public.missionaries where id = $1", [
        subjectId,
      ]);
    });
    await deletePerson(env, careWorker);
    await deletePerson(env, dualStaff);
    await deletePerson(env, subjectPerson);
  });

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
  });

  test("backfilled development administrator sees no Care nav and receives no-access state on Care routes", async ({
    page,
  }) => {
    await signIn(page, SEEDED.owner.email, SEEDED_PASSWORD);
    await page.goto(`/${DEMO}`);
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("#__next_error__")).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: /Mission Control/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Member Care", exact: true }),
    ).toHaveCount(0);

    await page.goto(`/${DEMO}/care`);
    await page.waitForLoadState("domcontentloaded");
    const careNote = page.getByRole("note");
    await expect(careNote).toBeVisible();
    await expect(careNote).toContainText(/No access to Member Care/i);
    await expect(page.getByText(/Check your connection/i)).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Try again" })).toHaveCount(
      0,
    );

    await page.getByRole("link", { name: "Go to home" }).click();
    await expect(page).toHaveURL(new RegExp(`/${DEMO}/?$`));

    await page.goto(`/${DEMO}/care/directory`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByRole("note")).toBeVisible();
    await expect(page.getByText(subjectFullName)).toHaveCount(0);

    const headers = await documentScopeHeaders(page);
    const directoryReply = await page.request.get(
      "/api/admin/member-care/directory",
      { headers },
    );
    expect(directoryReply.status()).toBe(403);
  });

  test("non-admin member_care worker sees Care nav, reads dashboard and directory, executes all six writes, and passes direct directory API check", async ({
    page,
  }) => {
    await signIn(page, careWorker!.email, careWorker!.password);
    await page.goto(`/${DEMO}`);
    await page.waitForLoadState("domcontentloaded");

    const careNavLink = page
      .getByRole("link", { name: "Member Care", exact: true })
      .first();
    await expect(careNavLink).toBeVisible();

    const [dashboardReply] = await Promise.all([
      page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname ===
            "/api/admin/member-care/dashboard" &&
          response.request().method() === "GET",
      ),
      careNavLink.click(),
    ]);
    expect(dashboardReply.status()).toBe(200);
    await expect(page).toHaveURL(new RegExp(`/${DEMO}/care$`));
    await expect(page.locator("#__next_error__")).toHaveCount(0);
    await expect(page.getByRole("note")).toHaveCount(0);

    const headers = await documentScopeHeaders(page);
    const directDirectory = await page.request.get(
      "/api/admin/member-care/directory",
      { headers },
    );
    expect(directDirectory.status()).toBe(200);
    expect(directDirectory.headers()["x-directory-limit"]).toBe("250");
    expect(Number(directDirectory.headers()["x-total-count"])).toBeGreaterThan(
      0,
    );
    const directoryJson = (await directDirectory.json()) as Array<{
      id: string;
    }>;
    expect(directoryJson.some((row) => row.id === subjectId)).toBe(true);

    await page.goto(`/${DEMO}/care/directory`);
    const subjectLink = page
      .getByRole("region", { name: /Member Care personnel/i })
      .getByRole("link", { name: new RegExp(subjectFullName) })
      .first();
    await expect(subjectLink).toBeVisible();

    await subjectLink.click();
    await expect(page).toHaveURL(
      new RegExp(`/${DEMO}/care/directory/${subjectId}$`),
    );
    await expect(
      page.getByRole("heading", { level: 1, name: subjectFullName }),
    ).toBeVisible();

    const [attentionReply] = await Promise.all([
      page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname ===
            "/api/admin/member-care/attention" &&
          response.request().method() === "PATCH",
      ),
      page.getByRole("button", { name: "Flag for attention" }).click(),
    ]);
    expect(attentionReply.status()).toBe(200);
    await expect(
      page.getByRole("button", { name: "Clear attention flag" }),
    ).toBeVisible();

    const contactText = `Contact check-in ${runTag}`;
    await page.getByRole("button", { name: "Log contact" }).click();
    await page.getByLabel("Contact note").fill(contactText);
    const [activityReply] = await Promise.all([
      page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname ===
            "/api/admin/member-care/activity" &&
          response.request().method() === "POST",
      ),
      page
        .getByRole("dialog")
        .getByRole("button", { name: "Log contact" })
        .click(),
    ]);
    expect(activityReply.status()).toBe(201);
    await expect(page.getByText(contactText)).toBeVisible();

    const threadText = `Thread note ${runTag}`;
    await page.getByRole("tab", { name: "Care thread" }).click();
    const threadBox = page.getByRole("textbox", { name: "Care thread update" });
    await expect(threadBox).toBeVisible();
    await threadBox.click();
    await page.keyboard.type(threadText);
    const [threadReply] = await Promise.all([
      page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname ===
            "/api/admin/member-care/thread" &&
          response.request().method() === "POST",
      ),
      page.getByRole("button", { name: "Post update" }).click(),
    ]);
    expect(threadReply.status()).toBe(201);
    await expect(page.getByText(threadText)).toBeVisible();

    const goalTitle = `Monthly call goal ${runTag}`;
    await page.getByRole("tab", { name: "Care plan" }).click();
    await page.getByLabel("Add a goal").fill(goalTitle);
    const [goalReply] = await Promise.all([
      page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname === "/api/admin/member-care/goals" &&
          response.request().method() === "POST",
      ),
      page.getByRole("button", { name: "Add goal" }).click(),
    ]);
    expect(goalReply.status()).toBe(200);
    await expect(page.getByText(goalTitle)).toBeVisible();

    const scheduleNote = `Home assignment rhythm ${runTag}`;
    await page.getByLabel("Every (days)").fill("21");
    await page.getByLabel("Note (optional)").fill(scheduleNote);
    const [requirementReply] = await Promise.all([
      page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname ===
            "/api/admin/member-care/requirements" &&
          response.request().method() === "POST",
      ),
      page.getByRole("button", { name: /^(Add|Update) schedule$/ }).click(),
    ]);
    expect(requirementReply.status()).toBe(200);
    await expect(page.getByText(/Every 21 days/)).toBeVisible();
    await expect(page.getByText(scheduleNote)).toBeVisible();

    const privateNoteText = `Private care journal ${runTag}`;
    await page.getByRole("tab", { name: "Private notes" }).click();
    const privateBox = page.getByRole("textbox", { name: "Private care note" });
    await expect(privateBox).toBeVisible();
    await privateBox.click();
    await page.keyboard.type(privateNoteText);
    const [privateNoteReply] = await Promise.all([
      page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname ===
            "/api/admin/member-care/private-notes" &&
          response.request().method() === "POST",
      ),
      page.getByRole("button", { name: "Save note" }).click(),
    ]);
    expect(privateNoteReply.status()).toBe(201);
    await expect(page.getByText(privateNoteText)).toBeVisible();
  });

  test("dual-role finance and member_care user sees Care nav and rows under member_care and loses both under finance", async ({
    page,
  }) => {
    await signIn(page, dualStaff!.email, dualStaff!.password);
    await expect(page).toHaveURL(/\/choose-organization/);

    await page.getByRole("link", { name: /Member care/i }).click();
    await expect(page).toHaveURL(new RegExp(`/${DEMO}~member_care/?$`));
    await expect(
      page.getByRole("link", { name: "Member Care", exact: true }).first(),
    ).toBeVisible();

    await page.goto(`/${DEMO}~member_care/care/directory`);
    await expect(
      page
        .getByRole("region", { name: /Member Care personnel/i })
        .getByRole("link", { name: new RegExp(subjectFullName) })
        .first(),
    ).toBeVisible();

    await page.goto(`/${DEMO}~finance/care/directory`);
    await page.waitForLoadState("domcontentloaded");
    await expect(
      page.getByRole("link", { name: "Member Care", exact: true }),
    ).toHaveCount(0);
    await expect(page.getByRole("note")).toBeVisible();
    await expect(page.getByRole("note")).toContainText(
      /No access to Member Care/i,
    );
    await expect(page.getByText(subjectFullName)).toHaveCount(0);

    const financeHeaders = await documentScopeHeaders(page);
    const refusedDir = await page.request.get(
      "/api/admin/member-care/directory",
      { headers: financeHeaders },
    );
    expect(refusedDir.status()).toBe(403);

    await page.goto(`/${DEMO}~member_care/care/directory`);
    await expect(
      page.getByRole("link", { name: "Member Care", exact: true }).first(),
    ).toBeVisible();
    await expect(
      page
        .getByRole("region", { name: /Member Care personnel/i })
        .getByRole("link", { name: new RegExp(subjectFullName) })
        .first(),
    ).toBeVisible();
  });
});
