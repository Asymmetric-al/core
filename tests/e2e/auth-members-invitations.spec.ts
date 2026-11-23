import { randomUUID } from "node:crypto";

import { expect, test, type Page } from "@playwright/test";

import {
  deleteUser,
  readAuthMailEnv,
  uniqueTestEmail,
  waitForHydratedForm,
  warmUpRoutes,
  type AuthMailEnv,
} from "./helpers/auth-mail";
import { withOwner } from "./helpers/request-scope-reads";

const env = readAuthMailEnv();
const ADMIN_PORT = Number(process.env.AUTH_MAIL_ADMIN_PORT || 3130);
const MISSIONARY_PORT = Number(process.env.AUTH_MAIL_MISSIONARY_PORT || 4100);
const ADMIN_ORIGIN = `http://localhost:${ADMIN_PORT}`;
const MISSIONARY_ORIGIN = `http://localhost:${MISSIONARY_PORT}`;

type ProofPerson = {
  userId: string;
  email: string;
  password: string;
  name: string;
  membershipId?: string;
};

async function createConfirmedLogin(
  stack: AuthMailEnv,
  label: string,
): Promise<ProofPerson> {
  const email = uniqueTestEmail(`wp3c-${label}`);
  const password = `${label}-${randomUUID().slice(0, 8)}`;
  const last = `${label} ${randomUUID().slice(0, 4)}`;
  const res = await fetch(`${stack.supabaseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: stack.serviceRoleKey,
      Authorization: `Bearer ${stack.serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: "Invite", last_name: last },
    }),
  });
  expect(res.status, await res.clone().text()).toBe(200);
  const { id: userId } = (await res.json()) as { id: string };
  return { userId, email, password, name: `Invite ${last}` };
}

async function signInOnOrigin(
  page: Page,
  origin: string,
  email: string,
  password: string,
  nextPath?: string,
) {
  const loginUrl = nextPath
    ? `${origin}/login?next=${encodeURIComponent(nextPath)}`
    : `${origin}/login`;
  const away = (url: URL) => !url.pathname.startsWith("/login");
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      await page.goto(loginUrl);
      await waitForHydratedForm(page);
      await page.getByLabel("Email").fill(email, { timeout: 60_000 });
      await page
        .getByLabel("Password", { exact: true })
        .fill(password, { timeout: 60_000 });
      await page
        .getByRole("button", { name: "Sign in" })
        .click({ timeout: 60_000 });
      await page.waitForURL(away, { timeout: 60_000 });
      return;
    } catch {
      if (away(new URL(page.url()))) return;
    }
  }
  await expect(page).toHaveURL(away);
}

async function createInviteFromMembersScreen(
  page: Page,
  input: {
    email: string;
    role: "staff" | "missionary";
    reason: string;
  },
): Promise<{ invitePath: string; selector: string; verifier: string }> {
  await page.getByRole("button", { name: "Invite member" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Email address").fill(input.email);
  if (input.role === "missionary") {
    await dialog.getByLabel("Membership class").click();
    await page.getByRole("option", { name: "Missionary" }).click();
  }
  await dialog.getByLabel("Reason").fill(input.reason);
  const [inviteResponse] = await Promise.all([
    page.waitForResponse(
      (res) =>
        res.request().method() === "POST" &&
        res.url().includes("/api/admin/members/invitations"),
      { timeout: 60_000 },
    ),
    dialog.getByRole("button", { name: "Create invitation" }).click(),
  ]);
  expect(inviteResponse.status()).toBe(201);
  const cacheControl = inviteResponse.headers()["cache-control"] ?? "";
  expect(cacheControl).toContain("private");
  expect(cacheControl).toContain("no-store");
  expect(inviteResponse.headers()["cdn-cache-control"]).toBe("no-store");
  expect(inviteResponse.headers()["vercel-cdn-cache-control"]).toBe("no-store");
  expect(inviteResponse.headers()["referrer-policy"]).toBe("no-referrer");

  await expect(
    dialog.getByText(
      "No email was sent. Copy this link now; it cannot be shown again.",
    ),
  ).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Copy link" })).toBeVisible();

  const linkInput = dialog.getByLabel("Invitation link path");
  await expect(linkInput).toBeVisible({ timeout: 60_000 });
  const hasReplayBlock = await linkInput.evaluate(
    (el) => el.closest("[data-sentry-block]") !== null,
  );
  expect(hasReplayBlock).toBe(true);
  const invitePath = await linkInput.inputValue();
  const match = /^\/invite\/([^#]+)#(.+)$/.exec(invitePath);
  expect(match, "unexpected invite path format").toBeTruthy();
  await dialog.getByRole("button", { name: "Done" }).click();
  await expect(dialog).toBeHidden();
  return {
    invitePath,
    selector: match![1]!,
    verifier: match![2]!,
  };
}

test.describe("AL-2676 WP3c: Members screen, invitations, doorway, and role changes", () => {
  const tenantId = randomUUID();
  let adminUser: ProofPerson | null = null;
  let regularStaff: ProofPerson | null = null;
  let staffInvitee: ProofPerson | null = null;
  let missionaryInvitee: ProofPerson | null = null;
  let revokedInvitee: ProofPerson | null = null;

  test.beforeAll(async () => {
    if (!env?.dbUrl || test.info().project.name !== "auth-mail-admin") return;

    adminUser = await createConfirmedLogin(env, "admin");
    regularStaff = await createConfirmedLogin(env, "staff");
    staffInvitee = await createConfirmedLogin(env, "staff-invitee");
    missionaryInvitee = await createConfirmedLogin(env, "missionary-invitee");
    revokedInvitee = await createConfirmedLogin(env, "revoked-invitee");

    await withOwner(env, async (db) => {
      await db.query("begin");
      try {
        await db.query(
          "insert into public.tenants (id, name, slug, status) values ($1, 'WP3c Members E2E Org', $2, 'active')",
          [tenantId, `wp3c-e2e-${tenantId.slice(0, 8)}`],
        );
        await db.query(
          "delete from authz.memberships where user_id = any($1::uuid[])",
          [[adminUser!.userId, regularStaff!.userId]],
        );
        const insertedAdmin = await db.query<{ id: string }>(
          `insert into authz.memberships (user_id, tenant_id, role, staff_role, is_tenant_admin)
           values ($1, $2, 'staff', 'development', true) returning id`,
          [adminUser!.userId, tenantId],
        );
        adminUser!.membershipId = insertedAdmin.rows[0]!.id;

        const insertedStaff = await db.query<{ id: string }>(
          `insert into authz.memberships (user_id, tenant_id, role, staff_role, is_tenant_admin)
           values ($1, $2, 'staff', 'hr', false) returning id`,
          [regularStaff!.userId, tenantId],
        );
        regularStaff!.membershipId = insertedStaff.rows[0]!.id;
        await db.query("commit");
      } catch (error) {
        await db.query("rollback");
        throw error;
      }
    });

    await warmUpRoutes(ADMIN_ORIGIN, [
      "/login",
      `/${tenantId}/admin/teams`,
      "/invite/warmup-selector",
    ]);
    await warmUpRoutes(MISSIONARY_ORIGIN, [
      "/login",
      "/invite/warmup-selector",
    ]);
  });

  test.afterAll(async () => {
    if (!env?.dbUrl || test.info().project.name !== "auth-mail-admin") return;
    const people = [
      adminUser,
      regularStaff,
      staffInvitee,
      missionaryInvitee,
      revokedInvitee,
    ].filter((p): p is ProofPerson => p !== null);
    const ids = people.map((p) => p.userId);
    await withOwner(env, async (db) => {
      await db.query(
        "delete from public.membership_invitations where tenant_id = $1",
        [tenantId],
      );
      await db.query(
        "delete from authz.memberships where tenant_id = $1 or user_id = any($2::uuid[])",
        [tenantId, ids],
      );
      await db.query("delete from public.audit_logs where tenant_id = $1", [
        tenantId,
      ]);
      await db.query("delete from public.tenants where id = $1", [tenantId]);
    });
    for (const person of people) {
      await deleteUser(env, person.userId);
    }
  });

  test("covers admin invite + scanner-safe doorway + staff and missionary acceptance + read-only staff + revoke + self-demotion", async ({
    browser,
    page,
  }) => {
    test.skip(
      test.info().project.name !== "auth-mail-admin",
      "runs once on the admin project against both admin and missionary servers",
    );
    test.skip(
      !env?.dbUrl,
      "requires local Supabase stack (bun run test:e2e:auth-mail)",
    );
    const stack = env!;

    const adminConsoleLogs: string[] = [];
    page.on("console", (msg) => {
      adminConsoleLogs.push(msg.text());
    });

    await signInOnOrigin(
      page,
      ADMIN_ORIGIN,
      adminUser!.email,
      adminUser!.password,
    );
    await page.goto(`${ADMIN_ORIGIN}/${tenantId}/admin/teams`);
    await expect(
      page.getByRole("heading", { level: 1, name: "Members" }),
    ).toBeVisible();
    await expect(page.getByText(adminUser!.email)).toBeVisible();
    await expect(page.getByText(regularStaff!.email)).toBeVisible();

    const staffInvite = await createInviteFromMembersScreen(page, {
      email: staffInvitee!.email,
      role: "staff",
      reason: "Browser staff invitation proof",
    });

    const missionaryInvite = await createInviteFromMembersScreen(page, {
      email: missionaryInvitee!.email,
      role: "missionary",
      reason: "Browser missionary invitation proof",
    });

    const revokedInvite = await createInviteFromMembersScreen(page, {
      email: revokedInvitee!.email,
      role: "staff",
      reason: "Browser revocation proof",
    });

    const issuedSecrets = [
      staffInvite.verifier,
      staffInvite.invitePath,
      missionaryInvite.verifier,
      missionaryInvite.invitePath,
      revokedInvite.verifier,
      revokedInvite.invitePath,
    ];

    const mailpitRes = await fetch(
      `${stack.mailpitUrl.replace(/\/$/, "")}/api/v1/messages`,
    );
    expect(mailpitRes.status).toBe(200);
    const mailpitBody = (await mailpitRes.json()) as {
      messages?: Array<{ To?: Array<{ Address?: string }> }>;
    };
    const inviteeEmails = new Set([
      staffInvitee!.email.toLowerCase(),
      missionaryInvitee!.email.toLowerCase(),
      revokedInvitee!.email.toLowerCase(),
    ]);
    const sentToInvitees = (mailpitBody.messages ?? []).filter((m) =>
      (m.To ?? []).some((to) =>
        inviteeEmails.has((to.Address ?? "").toLowerCase()),
      ),
    );
    expect(sentToInvitees).toHaveLength(0);

    const dbChecks = await withOwner(stack, async (db) => {
      const dispatchCount = await db.query<{ c: number }>(
        "select count(*)::int as c from public.workflow_dispatch_requests where tenant_id = $1",
        [tenantId],
      );
      const audits = await db.query<{ text: string }>(
        "select details::text as text from public.audit_logs where tenant_id = $1",
        [tenantId],
      );
      const invites = await db.query<{ text: string }>(
        "select to_jsonb(i)::text as text from public.membership_invitations as i where i.tenant_id = $1",
        [tenantId],
      );
      return {
        dispatchCount: dispatchCount.rows[0]?.c ?? -1,
        auditBlob: audits.rows.map((r) => r.text).join("\n"),
        inviteBlob: invites.rows.map((r) => r.text).join("\n"),
      };
    });
    expect(dbChecks.dispatchCount).toBe(0);
    for (const secret of issuedSecrets) {
      expect(dbChecks.auditBlob).not.toContain(secret);
      expect(dbChecks.inviteBlob).not.toContain(secret);
    }

    await page.reload();
    await expect(
      page.getByRole("heading", { level: 1, name: "Members" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", {
        name: `Revoke invitation for ${revokedInvitee!.email}`,
      }),
    ).toBeVisible();
    const reloadedHtml = await page.content();
    const clientStorage = await page.evaluate(async () => {
      const localEntries: Array<[string, string | null]> = [];
      for (let i = 0; i < window.localStorage.length; i += 1) {
        const key = window.localStorage.key(i);
        if (key !== null)
          localEntries.push([key, window.localStorage.getItem(key)]);
      }
      const sessionEntries: Array<[string, string | null]> = [];
      for (let i = 0; i < window.sessionStorage.length; i += 1) {
        const key = window.sessionStorage.key(i);
        if (key !== null)
          sessionEntries.push([key, window.sessionStorage.getItem(key)]);
      }
      const idbDump: unknown[] = [];
      if (
        typeof indexedDB !== "undefined" &&
        typeof indexedDB.databases === "function"
      ) {
        const dbs = await indexedDB.databases();
        for (const info of dbs) {
          if (!info.name) continue;
          const entries = await new Promise<unknown>((resolve) => {
            const req = indexedDB.open(info.name!);
            req.onerror = () => resolve({ name: info.name, error: true });
            req.onsuccess = () => {
              const db = req.result;
              const stores = Array.from(db.objectStoreNames);
              if (stores.length === 0) {
                db.close();
                resolve({ name: info.name, stores: [] });
                return;
              }
              const tx = db.transaction(stores, "readonly");
              const result: Record<string, unknown> = {};
              let remaining = stores.length;
              for (const storeName of stores) {
                const getAll = tx.objectStore(storeName).getAll();
                getAll.onsuccess = () => {
                  result[storeName] = getAll.result;
                  remaining -= 1;
                  if (remaining === 0) {
                    db.close();
                    resolve({ name: info.name, result });
                  }
                };
                getAll.onerror = () => {
                  remaining -= 1;
                  if (remaining === 0) {
                    db.close();
                    resolve({ name: info.name, result });
                  }
                };
              }
            };
          });
          idbDump.push(entries);
        }
      }
      return JSON.stringify({
        localEntries,
        sessionEntries,
        cookies: document.cookie,
        idbDump,
      });
    });
    const consoleBlob = adminConsoleLogs.join("\n");
    for (const secret of issuedSecrets) {
      expect(reloadedHtml).not.toContain(secret);
      expect(clientStorage).not.toContain(secret);
      expect(consoleBlob).not.toContain(secret);
    }

    for (const [origin, selector] of [
      [ADMIN_ORIGIN, staffInvite.selector],
      [MISSIONARY_ORIGIN, missionaryInvite.selector],
    ] as const) {
      for (const method of ["GET", "HEAD"] as const) {
        const res = await fetch(`${origin}/invite/${selector}`, {
          method,
          redirect: "manual",
        });
        expect(res.status, `${method} ${origin}/invite/${selector}`).toBe(200);
        expect(res.headers.get("cache-control") ?? "").toContain("no-store");
        expect(res.headers.get("cdn-cache-control")).toBe("no-store");
        expect(res.headers.get("vercel-cdn-cache-control")).toBe("no-store");
        expect(res.headers.get("referrer-policy")).toBe("no-referrer");
      }
    }

    const statusAfterScan = await withOwner(stack, async (db) => {
      const { rows } = await db.query<{ status: string; accepted_at: unknown }>(
        "select status, accepted_at from public.membership_invitations where selector = any($1::text[])",
        [[staffInvite.selector, missionaryInvite.selector]],
      );
      return rows;
    });
    expect(statusAfterScan).toHaveLength(2);
    for (const row of statusAfterScan) {
      expect(row.status).toBe("issued");
      expect(row.accepted_at).toBeNull();
    }

    await expect(
      page.getByRole("button", {
        name: `Revoke invitation for ${revokedInvitee!.email}`,
      }),
    ).toBeVisible();
    await page
      .getByRole("button", {
        name: `Revoke invitation for ${revokedInvitee!.email}`,
      })
      .click();
    const revokeInvDialog = page.getByRole("dialog");
    await expect(revokeInvDialog).toBeVisible();
    await revokeInvDialog.getByLabel("Reason").fill("Withdrawn before use");
    await revokeInvDialog
      .getByRole("button", { name: "Revoke invitation" })
      .click();
    await expect(revokeInvDialog).toBeHidden();

    const wrongAccountCtx = await browser.newContext({ baseURL: ADMIN_ORIGIN });
    try {
      const wrongPage = await wrongAccountCtx.newPage();
      await signInOnOrigin(
        wrongPage,
        ADMIN_ORIGIN,
        regularStaff!.email,
        regularStaff!.password,
        `/invite/${staffInvite.selector}`,
      );
      await wrongPage.goto(
        `${ADMIN_ORIGIN}/invite/${staffInvite.selector}#${staffInvite.verifier}`,
      );
      const acceptBtn = wrongPage.getByRole("button", {
        name: "Accept invitation",
      });
      await expect(acceptBtn).toBeEnabled();
      await acceptBtn.click();
      await expect(
        wrongPage.getByText(/invitation is invalid or no longer available/i),
      ).toBeVisible();
    } finally {
      await wrongAccountCtx.close();
    }

    const staffCtx = await browser.newContext({ baseURL: ADMIN_ORIGIN });
    try {
      const staffPage = await staffCtx.newPage();
      await signInOnOrigin(
        staffPage,
        ADMIN_ORIGIN,
        staffInvitee!.email,
        staffInvitee!.password,
        `/invite/${staffInvite.selector}`,
      );
      await staffPage.goto(
        `${ADMIN_ORIGIN}/invite/${staffInvite.selector}#${staffInvite.verifier}`,
      );
      const acceptBtn = staffPage.getByRole("button", {
        name: "Accept invitation",
      });
      await expect(acceptBtn).toBeEnabled();
      expect(new URL(staffPage.url()).hash).toBe("");
      await acceptBtn.click();
      await expect(staffPage).toHaveURL(new RegExp(`/${tenantId}`), {
        timeout: 120_000,
      });

      await staffPage.goto(
        `${ADMIN_ORIGIN}/invite/${staffInvite.selector}#${staffInvite.verifier}`,
      );
      await expect(
        staffPage.getByRole("button", { name: "Accept invitation" }),
      ).toBeEnabled();
      await staffPage
        .getByRole("button", { name: "Accept invitation" })
        .click();
      await expect(
        staffPage.getByText(/invitation is invalid or no longer available/i),
      ).toBeVisible();
    } finally {
      await staffCtx.close();
    }

    const missionaryCtx = await browser.newContext({
      baseURL: MISSIONARY_ORIGIN,
    });
    try {
      const missionaryPage = await missionaryCtx.newPage();
      await signInOnOrigin(
        missionaryPage,
        MISSIONARY_ORIGIN,
        missionaryInvitee!.email,
        missionaryInvitee!.password,
        `/invite/${missionaryInvite.selector}`,
      );
      await missionaryPage.goto(
        `${MISSIONARY_ORIGIN}/invite/${missionaryInvite.selector}#${missionaryInvite.verifier}`,
      );
      const acceptBtn = missionaryPage.getByRole("button", {
        name: "Accept invitation",
      });
      await expect(acceptBtn).toBeEnabled();
      expect(new URL(missionaryPage.url()).hash).toBe("");
      await acceptBtn.click();
      await expect(missionaryPage).toHaveURL(new RegExp(`/${tenantId}`), {
        timeout: 120_000,
      });
    } finally {
      await missionaryCtx.close();
    }

    const revokedCtx = await browser.newContext({ baseURL: ADMIN_ORIGIN });
    try {
      const revokedPage = await revokedCtx.newPage();
      await signInOnOrigin(
        revokedPage,
        ADMIN_ORIGIN,
        revokedInvitee!.email,
        revokedInvitee!.password,
        `/invite/${revokedInvite.selector}`,
      );
      await revokedPage.goto(
        `${ADMIN_ORIGIN}/invite/${revokedInvite.selector}#${revokedInvite.verifier}`,
      );
      await expect(
        revokedPage.getByRole("button", { name: "Accept invitation" }),
      ).toBeEnabled();
      await revokedPage
        .getByRole("button", { name: "Accept invitation" })
        .click();
      await expect(
        revokedPage.getByText(/invitation is invalid or no longer available/i),
      ).toBeVisible();
    } finally {
      await revokedCtx.close();
    }

    const createdMemberships = await withOwner(stack, async (db) => {
      const { rows } = await db.query<{
        user_id: string;
        role: string;
        staff_role: string | null;
      }>(
        "select user_id, role::text as role, staff_role::text as staff_role from authz.memberships where tenant_id = $1 and user_id = any($2::uuid[]) and is_active and revoked_at is null",
        [tenantId, [staffInvitee!.userId, missionaryInvitee!.userId]],
      );
      return rows;
    });
    expect(createdMemberships).toEqual(
      expect.arrayContaining([
        {
          user_id: staffInvitee!.userId,
          role: "staff",
          staff_role: "development",
        },
        {
          user_id: missionaryInvitee!.userId,
          role: "missionary",
          staff_role: null,
        },
      ]),
    );

    const readOnlyCtx = await browser.newContext({ baseURL: ADMIN_ORIGIN });
    try {
      const staffPage = await readOnlyCtx.newPage();
      await signInOnOrigin(
        staffPage,
        ADMIN_ORIGIN,
        regularStaff!.email,
        regularStaff!.password,
      );
      await staffPage.goto(`${ADMIN_ORIGIN}/${tenantId}/admin/teams`);
      await expect(
        staffPage.getByRole("heading", { level: 1, name: "Members" }),
      ).toBeVisible();
      await expect(staffPage.getByText(adminUser!.email)).toBeVisible();
      await expect(staffPage.getByText("Read-only directory")).toBeVisible();
      await expect(
        staffPage.getByRole("button", { name: "Invite member" }),
      ).toHaveCount(0);
      await expect(
        staffPage.getByRole("button", { name: /change role/i }),
      ).toHaveCount(0);
      await expect(
        staffPage.getByRole("button", { name: /revoke/i }),
      ).toHaveCount(0);
      await expect(
        staffPage.getByRole("button", { name: "Give up admin" }),
      ).toHaveCount(0);

      const directStatuses = await staffPage.evaluate(
        async ({ tId, aId, targetId }) => {
          const headers = {
            "Content-Type": "application/json",
            "x-asym-tenant": tId,
            "x-asym-assignment": aId,
          };
          const inviteRes = await fetch("/api/admin/members/invitations", {
            method: "POST",
            credentials: "same-origin",
            headers,
            body: JSON.stringify({
              email: "blocked@example.test",
              role: "staff",
              staffRole: "hr",
              isTenantAdmin: false,
              reason: "Should be 403",
            }),
          });
          const roleRes = await fetch("/api/admin/members/role", {
            method: "POST",
            credentials: "same-origin",
            headers,
            body: JSON.stringify({
              membershipId: targetId,
              role: "staff",
              staffRole: "hr",
              isTenantAdmin: true,
              reason: "Should be 403",
              expectedUpdatedAt: new Date().toISOString(),
            }),
          });
          const revokeRes = await fetch("/api/admin/members/revoke", {
            method: "POST",
            credentials: "same-origin",
            headers,
            body: JSON.stringify({
              membershipId: targetId,
              reason: "Should be 403",
            }),
          });
          return [inviteRes.status, roleRes.status, revokeRes.status];
        },
        {
          tId: tenantId,
          aId: regularStaff!.membershipId!,
          targetId: adminUser!.membershipId!,
        },
      );
      expect(directStatuses).toEqual([403, 403, 403]);
    } finally {
      await readOnlyCtx.close();
    }

    await page.reload();
    await expect(
      page.getByRole("heading", { level: 1, name: "Members" }),
    ).toBeVisible();

    const adminRow = page.getByRole("row", {
      name: new RegExp(adminUser!.email),
    });
    await adminRow.getByRole("button", { name: "Give up admin" }).click();
    const lastAdminDialog = page.getByRole("dialog");
    await expect(lastAdminDialog).toBeVisible();
    await lastAdminDialog.getByLabel("Reason").fill("Try leaving zero admins");
    await lastAdminDialog
      .getByRole("button", { name: "Give up administrator role" })
      .click();
    await expect(lastAdminDialog.getByRole("alert")).toBeVisible();
    await lastAdminDialog.getByRole("button", { name: "Cancel" }).click();
    await expect(lastAdminDialog).toBeHidden();

    const regularRow = page.getByRole("row", {
      name: new RegExp(regularStaff!.email),
    });
    await regularRow.getByRole("button", { name: /change role/i }).click();
    const promoteDialog = page.getByRole("dialog");
    await expect(promoteDialog).toBeVisible();
    await promoteDialog
      .getByRole("checkbox", { name: "Organization administrator" })
      .click();
    await promoteDialog.getByLabel("Reason").fill("Promote second admin");
    await promoteDialog.getByRole("button", { name: "Save role" }).click();
    await expect(promoteDialog).toBeHidden();

    await adminRow.getByRole("button", { name: "Give up admin" }).click();
    const selfDemoteDialog = page.getByRole("dialog");
    await expect(selfDemoteDialog).toBeVisible();
    await selfDemoteDialog
      .getByLabel("Reason")
      .fill("Hand off admin responsibility");
    await selfDemoteDialog
      .getByRole("button", { name: "Give up administrator role" })
      .click();
    await expect(selfDemoteDialog).toBeHidden();

    await page.reload();
    await expect(page.getByText("Read-only directory")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Invite member" }),
    ).toHaveCount(0);
  });
});
