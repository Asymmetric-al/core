import { expect, test, type Page } from "@playwright/test";

import { readAuthMailEnv, warmUpRoutes } from "./helpers/auth-mail";
import {
  addFixtures,
  collectReads,
  countDocumentLoads,
  createPerson,
  deletePerson,
  DEMO,
  documentScopeHeaders,
  nextRead,
  ORGANIZATION_NAME,
  ownerIds,
  removeFixtures,
  SECOND,
  SEEDED,
  SEEDED_PASSWORD,
  seededRows,
  signIn,
  sorted,
  stripScopeHeaders,
  withOwner,
  type Fixtures,
  type Person,
  type PageRead,
} from "./helpers/request-scope-reads";

/**
 * The first release's reads against the second release's policies (WP2b,
 * AL-2675). Real people sign in through each app's own form, with real
 * Supabase Auth sessions on a local stack built from both releases; no
 * bypass cookie and no stub. Every read path the first release scoped is
 * proved against the migrated database: the rows of the selected
 * organization and row appear, a switch shows the other set and none of the
 * first, and each count is pinned against what the database owner computes
 * with the read's own rule.
 *
 * Five of its nine reads
 * (the shell, Web Studio's missionaries and funds, the
 * workspace's partners, the donor portal's history) go through service-key
 * routes. They show that the first release's pages still work, and still hold
 * to the selected organization, under the new policies; they do not test the
 * policies. Four read on the caller's own token and exercise
 * the policies end to end: the CRM list, the member directory, the feed preferences and the
 * comments case. The real-stack suites of issue 2675 test the policies table
 * by table.
 *
 * Read through a page, as a person on that screen makes it:
 * - Mission Control: the member directory (Teams), on the caller's token
 *   through `public.tenant_member_directory`; the CRM list, through the
 *   own-API wrapper on the caller's scoped session (AL-2677); the
 *   shell, rendered on the server for the resolved row (with the service key
 *   when the server has one, as it does here).
 * - Web Studio, under its tenant cookie: the missionaries and funds an
 *   editor picks from (service-key routes held to the resolved tenant).
 * - The missionary workspace: its partners list, through the own-API wrapper
 *   (a service-key route held to the resolved tenant).
 * - The donor portal: its history, read by the route-backed browser
 *   collection (a service-key route held to the resolved tenant).
 *
 * Read only by a direct call from a signed-in page, with the headers the
 * page's own-API wrapper would send, because no screen calls it: these cases
 * prove the route, not a screen.
 * - The feed-preferences route (`/api/donor/feed-preferences`), on the
 *   caller's token.
 * - The comments route, on the caller's token: a published public post's
 *   comments, with the commenters' names, which the first release reads
 *   through `public.post_comment_authors`, for a member of the post's
 *   organization and for a signed-in person outside it. The workspace's
 *   comments dialog calls it, but this case calls it directly.
 *
 * Not exercised here, because nothing calls them: the field-policy reader
 * (`loadFieldPolicies`) and the org-settings route.
 *
 * And a stale tab: a document whose requests carry neither header.
 *
 * Runs under `playwright.auth-mail.config.ts` (`bun run test:e2e:auth-mail`).
 * The seed's second organization holds no business data, so the database
 * owner adds the rows these journeys read before them and removes them after.
 */

const env = readAuthMailEnv();
const ADMIN_ORIGIN = `http://localhost:${process.env.AUTH_MAIL_ADMIN_PORT || 3130}`;

let staffInBoth: Person | null = null;
let missionaryInBoth: Person | null = null;
let secondDonor: Person | null = null;
let outsiderMissionary: Person | null = null;
let fixtures: Fixtures | null = null;

function surface(): "admin" | "missionary" | "donor" | null {
  const name = test.info().project.name;
  if (name === "auth-mail-admin") return "admin";
  if (name === "auth-mail-missionary") return "missionary";
  if (name === "auth-mail-donor") return "donor";
  return null;
}

test.beforeAll(async () => {
  const { project } = test.info();
  if (!env?.dbUrl || !surface() || !project.use.baseURL) return;
  staffInBoth = await createPerson(env, "staff", [
    { role: "staff", tenantId: DEMO, staffRole: "development", admin: true },
    { role: "staff", tenantId: SECOND, staffRole: "development", admin: true },
  ]);
  missionaryInBoth = await createPerson(env, "missionary", [
    { role: "missionary", tenantId: DEMO },
    { role: "missionary", tenantId: SECOND },
  ]);
  secondDonor = await createPerson(env, "donor", [
    { role: "donor", tenantId: SECOND },
  ]);
  // No membership in the demo organization, whose post the comments case reads.
  outsiderMissionary = await createPerson(env, "outsider", [
    { role: "missionary", tenantId: SECOND },
  ]);
  fixtures = await addFixtures(env, {
    missionary: missionaryInBoth,
    donor: secondDonor,
  });
  // Every route a journey opens, compiled before a browser opens it: a cold
  // development server reloads open pages while it compiles. The own-API
  // routes compile without a session (they answer 401).
  const WARM: Record<string, string[]> = {
    admin: [
      "/login",
      "/choose-organization",
      `/${DEMO}`,
      `/${DEMO}/admin/teams`,
      `/${DEMO}/crm`,
      "/web-studio/organization",
      "/web-studio",
      "/web-studio/missionaries",
      "/web-studio/projects/new",
      "/api/admin/users",
      "/api/admin/crm/records",
      "/api/admin/missionaries",
      "/api/admin/funds",
    ],
    missionary: [
      "/login",
      "/choose-organization",
      `/${DEMO}`,
      `/${DEMO}/donors`,
      "/api/missionary/donors",
      `/api/posts/${DEMO}/comments`,
    ],
    donor: [
      "/login",
      "/donor-dashboard",
      "/donor-dashboard/history",
      "/api/donor/portal",
      "/api/donor/feed-preferences",
    ],
  };
  await warmUpRoutes(project.use.baseURL, WARM[surface()!]!);
  // The workspace's demo-owner journey also reads Mission Control's CRM.
  if (surface() === "missionary")
    await warmUpRoutes(ADMIN_ORIGIN, [
      "/login",
      `/${DEMO}/crm`,
      "/api/admin/crm/records",
    ]);
});

test.afterAll(async () => {
  if (!env?.dbUrl) return;
  await removeFixtures(env, fixtures);
  for (const person of [
    staffInBoth,
    missionaryInBoth,
    secondDonor,
    outsiderMissionary,
  ])
    await deletePerson(env, person);
});

function requireStack() {
  test.skip(!env?.dbUrl, "Needs a local Supabase stack.");
  return env!;
}

/** Every read carried the organization and the row the page was opened for. */
function expectScoped(reads: readonly PageRead[], tenant: string, row: string) {
  expect(reads.length).toBeGreaterThan(0);
  for (const read of reads) {
    expect(read.status, read.path).toBe(200);
    expect(read.tenant, read.path).toBe(tenant);
    expect(read.assignment, read.path).toBe(row);
  }
}

/** Opens the app's chooser and picks one of the person's organizations. */
async function choose(page: Page, linkName: string, tenant: string) {
  await page.goto("/choose-organization");
  await page.getByRole("link", { name: linkName }).click();
  await expect(page).toHaveURL((url) => url.pathname === `/${tenant}`, {
    timeout: 120_000,
  });
}

const STAFF_ROLES = new Set([
  "super_admin",
  "admin",
  "staff",
  "finance",
  "fundraising",
  "member_care",
  "mobilizers",
  "events",
]);

test.describe("Mission Control", () => {
  test.beforeEach(() => {
    test.skip(surface() !== "admin", "Mission Control only.");
  });

  test("the member directory and the CRM read the chosen organization's rows, and the other's after a switch", async ({
    page,
  }) => {
    const stack = requireStack();
    const person = staffInBoth!;
    await signIn(page, person.email, person.password);
    await expect(page).toHaveURL(/\/choose-organization/, { timeout: 120_000 });

    for (const [tenant, other] of [
      [DEMO, SECOND],
      [SECOND, DEMO],
    ] as const) {
      const row = person.rows[`${tenant}:staff`]!;
      await choose(page, `${ORGANIZATION_NAME[tenant]}: Development`, tenant);
      // The shell, rendered on the server for the resolved row, names it.
      await expect(
        page.getByText(ORGANIZATION_NAME[tenant]!).first(),
      ).toBeVisible();

      // The member directory, on the caller's own token.
      const directory = collectReads(page, /^\/api\/admin\/users$/);
      await page.goto(`/${tenant}/admin/teams`);
      await expect(
        page.getByRole("heading", { name: "Staff directory" }),
      ).toBeVisible();
      await expect(page.getByText(person.name).first()).toBeVisible({
        timeout: 120_000,
      });
      await expect
        .poll(() => directory.length)
        .toBeGreaterThanOrEqual(STAFF_ROLES.size);
      expectScoped(directory, tenant, row);
      const listed = new Set(
        directory.flatMap((read) =>
          (read.json as { users: { id: string; role: string }[] }).users
            .filter((user) => STAFF_ROLES.has(user.role))
            .map((user) => user.id),
        ),
      );
      const staff = await ownerIds(
        stack,
        `select distinct coalesce(p.id, m.user_id)::text
           from authz.memberships m left join public.profiles p on p.user_id = m.user_id
          where m.tenant_id = $1 and m.role = 'staff' and m.is_active and m.revoked_at is null`,
        [tenant],
      );
      expect(sorted([...listed])).toEqual(staff);
      const otherAdmin =
        tenant === DEMO ? SEEDED.morgan.name : SEEDED.owner.name;
      await expect(page.getByText(otherAdmin)).toHaveCount(0);

      // The CRM list, through the own-API wrapper.
      const crm = await nextRead(page, /^\/api\/admin\/crm\/records$/, () =>
        page.goto(`/${tenant}/crm`),
      );
      expectScoped([crm], tenant, row);
      const donors = await ownerIds(
        stack,
        "select id::text from public.donors where tenant_id = $1",
        [tenant],
      );
      expect(donors.length).toBeGreaterThan(0);
      expect(
        sorted((crm.json as { rows: { id: string }[] }).rows.map((r) => r.id)),
      ).toEqual(donors);
      const elsewhere = await ownerIds(
        stack,
        "select id::text from public.donors where tenant_id = $1",
        [other],
      );
      for (const id of (crm.json as { rows: { id: string }[] }).rows)
        expect(elsewhere).not.toContain(id.id);
    }
  });

  test("Web Studio: an editor of one organization sees its missionaries and funds only, and a person in two sees each after a switch", async ({
    page,
    browser,
  }) => {
    const stack = requireStack();
    const studioLists = async (studio: Page, tenant: string) => {
      const missionaries = await nextRead(
        studio,
        /^\/api\/admin\/missionaries$/,
        () => studio.goto("/web-studio/missionaries"),
      );
      expect(missionaries.status).toBe(200);
      expect(missionaries.tenant).toBe(tenant);
      expect(
        sorted(
          (
            missionaries.json as { missionaries: { id: string }[] }
          ).missionaries.map((m) => m.id),
        ),
      ).toEqual(
        await ownerIds(
          stack,
          "select id::text from public.missionaries where tenant_id = $1",
          [tenant],
        ),
      );
      const funds = await nextRead(studio, /^\/api\/admin\/funds$/, () =>
        studio.goto("/web-studio/projects/new"),
      );
      expect(funds.status).toBe(200);
      expect(funds.tenant).toBe(tenant);
      expect(
        sorted(
          (funds.json as { funds: { id: string }[] }).funds.map((f) => f.id),
        ),
      ).toEqual(
        await ownerIds(
          stack,
          "select id::text from public.funds where tenant_id = $1",
          [tenant],
        ),
      );
      return { missionaries, funds };
    };

    // The second organization's administrator: one staff row, no choice.
    await signIn(page, SEEDED.morgan.email, SEEDED_PASSWORD);
    await expect(page).toHaveURL((url) => url.pathname === `/${SECOND}`, {
      timeout: 120_000,
    });
    await studioLists(page, SECOND);
    await page.goto("/web-studio/missionaries");
    await expect(
      page.getByText(`Harbor field ${fixtures!.tag}`).first(),
    ).toBeVisible({ timeout: 120_000 });
    await expect(page.getByText(`Demo field ${fixtures!.tag}`)).toHaveCount(0);

    // A staff member of both organizations, through Web Studio's chooser.
    const context = await browser.newContext({ baseURL: ADMIN_ORIGIN });
    const studio = await context.newPage();
    try {
      await signIn(studio, staffInBoth!.email, staffInBoth!.password);
      await expect(studio).toHaveURL(/\/choose-organization/, {
        timeout: 120_000,
      });
      for (const tenant of [DEMO, SECOND]) {
        await studio.goto("/web-studio/organization?next=%2Fweb-studio");
        await studio
          .getByRole("button", {
            name: new RegExp(`^Open ${ORGANIZATION_NAME[tenant]}$`),
          })
          .click();
        await studio.waitForURL((url) => url.pathname === "/web-studio");
        const { missionaries } = await studioLists(studio, tenant);
        const ids = (
          missionaries.json as { missionaries: { id: string }[] }
        ).missionaries.map((m) => m.id);
        const [mine, notMine] =
          tenant === DEMO
            ? [fixtures!.missionaryInDemo, fixtures!.missionaryInSecond]
            : [fixtures!.missionaryInSecond, fixtures!.missionaryInDemo];
        expect(ids).toContain(mine);
        expect(ids).not.toContain(notMine);
      }
    } finally {
      await context.close();
    }
  });
});

test.describe("the missionary workspace", () => {
  test.beforeEach(() => {
    test.skip(surface() !== "missionary", "The missionary workspace only.");
  });

  test("its partners list reads the chosen organization's partners, and the other's after a switch", async ({
    page,
  }) => {
    const stack = requireStack();
    const person = missionaryInBoth!;
    await signIn(page, person.email, person.password);
    await expect(page).toHaveURL(/\/choose-organization/, { timeout: 120_000 });
    for (const tenant of [DEMO, SECOND]) {
      await choose(page, `Open ${ORGANIZATION_NAME[tenant]}`, tenant);
      const partners = await nextRead(page, /^\/api\/missionary\/donors$/, () =>
        page.goto(`/${tenant}/donors`),
      );
      expectScoped([partners], tenant, person.rows[`${tenant}:missionary`]!);
      const expected = await ownerIds(
        stack,
        "select id::text from public.donors where tenant_id = $1 and missionary_id = $2",
        [tenant, person.userId],
      );
      expect(expected.length).toBeGreaterThan(0);
      expect(
        sorted(
          (partners.json as { donors: { id: string }[] }).donors.map(
            (d) => d.id,
          ),
        ),
      ).toEqual(expected);
      const name =
        tenant === DEMO
          ? `Demo partner ${fixtures!.tag}`
          : `Harbor partner A ${fixtures!.tag}`;
      const absent =
        tenant === DEMO
          ? `Harbor partner A ${fixtures!.tag}`
          : `Demo partner ${fixtures!.tag}`;
      await expect(page.getByText(name).first()).toBeVisible({
        timeout: 120_000,
      });
      await expect(page.getByText(absent)).toHaveCount(0);
    }
  });

  test("the demo owner: the missionary row reads only their own partners, the staff row in Mission Control all of the organization's", async ({
    page,
  }) => {
    const stack = requireStack();
    const rows = await seededRows(stack, SEEDED.owner.userId);
    await signIn(page, SEEDED.owner.email, SEEDED_PASSWORD);
    await expect(page).toHaveURL((url) => url.pathname === `/${DEMO}`, {
      timeout: 120_000,
    });
    const partners = await nextRead(page, /^\/api\/missionary\/donors$/, () =>
      page.goto(`/${DEMO}/donors`),
    );
    expectScoped([partners], DEMO, rows[`${DEMO}:missionary`]!);
    const own = await ownerIds(
      stack,
      "select id::text from public.donors where tenant_id = $1 and missionary_id = $2",
      [DEMO, SEEDED.owner.userId],
    );
    const ownIds = (partners.json as { donors: { id: string }[] }).donors.map(
      (d) => d.id,
    );
    expect(sorted(ownIds)).toEqual(own);
    expect(ownIds).not.toContain(fixtures!.partnerInDemo);

    // The same session in Mission Control acts under the staff row.
    const crm = await nextRead(page, /^\/api\/admin\/crm\/records$/, () =>
      page.goto(`${ADMIN_ORIGIN}/${DEMO}/crm`),
    );
    expectScoped([crm], DEMO, rows[`${DEMO}:staff`]!);
    const all = await ownerIds(
      stack,
      "select id::text from public.donors where tenant_id = $1",
      [DEMO],
    );
    const crmIds = (crm.json as { rows: { id: string }[] }).rows.map(
      (r) => r.id,
    );
    expect(sorted(crmIds)).toEqual(all);
    expect(crmIds).toContain(fixtures!.partnerInDemo);
  });

  // Fixcheck F7 (record D-72). The first release reads the commenters
  // through `public.post_comment_authors`: a member of the post's
  // organization gets each commenter's display name and avatar; a signed-in
  // person with no membership there gets every comment, with an empty name
  // and no avatar. Each is compared with what the database owner computes by
  // the function's rule. This case replaced an expected failure (PGRST200 on
  // the route's old embed of `profiles`), which the first release's route
  // would have turned into a silent pass.
  test("the comments route returns a published post's comments, with the commenters' names only to a member of the post's organization", async ({
    page,
    browser,
    baseURL,
  }) => {
    const stack = requireStack();
    const [post] = await ownerIds(
      stack,
      `select p.id::text from public.posts p
        where p.tenant_id = $1 and p.status = 'published' and p.visibility = 'public'
          and exists (select 1 from public.post_comments c
                        join public.profiles pr on pr.user_id = c.user_id or pr.id = c.user_id
                       where c.post_id = p.id and nullif(btrim(pr.display_name), '') is not null)
        order by p.id limit 1`,
      [DEMO],
    );
    expect(post, "a published public post with a named commenter").toBeTruthy();
    type Shown = { id: string; name: string; last: string; avatar: unknown };
    const named = await withOwner(
      stack,
      async (db) =>
        (
          await db.query(
            `select c.id::text as id, coalesce(a.name, '') as name, '' as last, a.avatar
               from public.post_comments c
               left join lateral (
                 select nullif(btrim(p.display_name), '') as name, p.avatar_url as avatar
                   from public.profiles p
                  where p.user_id = c.user_id or p.id = c.user_id
                  order by (p.user_id is not distinct from c.user_id) desc
                  limit 1) a on true
              where c.post_id = $1
              order by 1`,
            [post],
          )
        ).rows as Shown[],
    );
    expect(named.some((c) => c.name !== "")).toBe(true);
    /** The comments as the route answers a page, with the page's own scope. */
    const shown = async (reader: Page): Promise<Shown[]> => {
      const headers = await documentScopeHeaders(reader);
      const response = await reader.request.get(`/api/posts/${post}/comments`, {
        headers,
      });
      expect(response.status()).toBe(200);
      const { comments } = (await response.json()) as {
        comments: {
          id: string;
          user: { first_name: string; last_name: string; avatar_url: unknown };
        }[];
      };
      return comments
        .map((c) => ({
          id: c.id,
          name: c.user.first_name,
          last: c.user.last_name,
          avatar: c.user.avatar_url,
        }))
        .sort((a, b) => a.id.localeCompare(b.id));
    };

    // A member of the post's organization, acting under that row.
    await signIn(page, missionaryInBoth!.email, missionaryInBoth!.password);
    await choose(page, `Open ${ORGANIZATION_NAME[DEMO]}`, DEMO);
    expect((await documentScopeHeaders(page))["x-asym-tenant"]).toBe(DEMO);
    expect(await shown(page)).toEqual(named);

    // A signed-in person whose only membership is in another organization.
    const context = await browser.newContext({ baseURL });
    const outsider = await context.newPage();
    await signIn(
      outsider,
      outsiderMissionary!.email,
      outsiderMissionary!.password,
    );
    await expect(outsider).toHaveURL((url) => url.pathname === `/${SECOND}`, {
      timeout: 120_000,
    });
    expect((await documentScopeHeaders(outsider))["x-asym-tenant"]).toBe(
      SECOND,
    );
    expect(await shown(outsider)).toEqual(
      named.map((c) => ({ ...c, name: "", avatar: null })),
    );
    await context.close();
  });
});

test.describe("the donor portal", () => {
  test.beforeEach(() => {
    test.skip(surface() !== "donor", "The donor portal only.");
  });

  test("its history reads the donor row's own gifts, and another organization's donor reads theirs", async ({
    page,
    browser,
    baseURL,
  }) => {
    const stack = requireStack();
    const giftsOf = (tenant: string, userId: string) =>
      ownerIds(
        stack,
        `select g.id::text from public.donations g
          where g.tenant_id = $1
            and g.donor_id in (select d.id from public.donors d where d.tenant_id = $1 and d.profile_id = $2)
          order by 1 limit 250`,
        [tenant, userId],
      );
    const history = async (p: Page, tenant: string, userId: string) => {
      const portal = await nextRead(p, /^\/api\/donor\/portal$/, () =>
        p.goto("/donor-dashboard/history"),
      );
      expect(portal.status).toBe(200);
      expect(portal.tenant).toBe(tenant);
      const ids = (
        portal.json as { portal: { donations: { id: string }[] } }
      ).portal.donations.map((d) => d.id);
      const expected = await giftsOf(tenant, userId);
      expect(expected.length).toBeGreaterThan(0);
      expect(sorted(ids)).toEqual(expected);
      return ids;
    };

    await signIn(page, SEEDED.owner.email, SEEDED_PASSWORD);
    await expect(page).toHaveURL(/\/donor-dashboard/, { timeout: 120_000 });
    const ownerGifts = await history(page, DEMO, SEEDED.owner.userId);

    const context = await browser.newContext({ baseURL });
    const other = await context.newPage();
    try {
      await signIn(other, secondDonor!.email, secondDonor!.password);
      await expect(other).toHaveURL(/\/donor-dashboard/, { timeout: 120_000 });
      const theirs = await history(other, SECOND, secondDonor!.userId);
      expect(sorted(theirs)).toEqual(sorted(fixtures!.secondGifts));
      for (const id of theirs) expect(ownerGifts).not.toContain(id);
    } finally {
      await context.close();
    }
  });

  test("the feed-preferences route reads the donor's own preferences on their token", async ({
    page,
  }) => {
    const stack = requireStack();
    await signIn(page, secondDonor!.email, secondDonor!.password);
    await expect(page).toHaveURL(/\/donor-dashboard/, { timeout: 120_000 });
    const rows = await seededRows(stack, secondDonor!.userId);
    const response = await page.request.get("/api/donor/feed-preferences", {
      headers: {
        "x-asym-tenant": SECOND,
        "x-asym-assignment": rows[`${SECOND}:donor`]!,
      },
    });
    expect(response.status()).toBe(200);
    // The fixture's values, none of them the route's defaults.
    expect(await response.json()).toEqual({
      showOrgPosts: false,
      showMissionaryPosts: true,
      followOrg: true,
      emailOrgPosts: true,
      emailMissionaryPosts: false,
    });
  });

  test("a donor in both organizations is refused the portal until WP3", async ({
    page,
  }) => {
    requireStack();
    await signIn(page, SEEDED.riley.email, SEEDED_PASSWORD);
    // Sign-in lands on the public site, and so does the portal: the donor
    // app's proxy sends a person whose donor row does not resolve to its
    // unauthorized address, "/" (apps/donor/proxy.ts), before the portal's
    // layout would send them to /no-access.
    await page.goto("/donor-dashboard");
    await expect(page).toHaveURL(
      (url) => url.pathname === "/" || url.pathname.startsWith("/no-access"),
      { timeout: 120_000 },
    );
    await expect(page.getByRole("link", { name: /history/i })).toHaveCount(0);
  });
});

/** Every value of a `tenantId` or `tenant_id` key anywhere in a payload. */
function tenantIdsIn(value: unknown): unknown[] {
  if (Array.isArray(value)) return value.flatMap(tenantIdsIn);
  if (!value || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, inner]) =>
    key === "tenantId" || key === "tenant_id"
      ? [inner, ...tenantIdsIn(inner)]
      : tenantIdsIn(inner),
  );
}

/** The seeded owner's one donor row (supabase/seed.sql). */
const OWNER_DONOR = "30000000-0000-0000-0000-000000000001";

/*
 * A stale tab: a document whose requests carry neither scope header, as a
 * page loaded before the first release would send them (review of pull
 * request 2737, thread 4641200068; the coordinator's ruling). The resolver
 * refuses such a request when the caller's scope is ambiguous: a person with
 * rows of the surface's class in two organizations gets 401 on every read,
 * the page shows its refusal, and nothing the same account reads with its
 * headers appears. When the caller holds exactly one live row of that class,
 * the request is answered from it: the designed fallback of plan WP2's
 * interim rule until WP3 ("From WP2a it takes the tenant from the person's
 * one live donor membership, through the resolver"), so the seeded owner's
 * portal answers with that owner's own data and no one else's. A reload loop
 * or an error page is a finding on every surface.
 */
test.describe("a stale tab sends neither header", () => {
  test("an ambiguous scope is refused and a single row answers its own data, never a loop or a crash", async ({
    page,
  }) => {
    const stack = requireStack();
    const app = surface();
    test.skip(!app, "Each app's project.");
    let opened: string;
    let watched: RegExp;
    // A value the same account reads with its headers, which the stale tab
    // must not show (admin and missionary).
    let guarded: string | null = null;
    if (app === "admin") {
      await signIn(page, staffInBoth!.email, staffInBoth!.password);
      await choose(page, `${ORGANIZATION_NAME[DEMO]}: Development`, DEMO);
      opened = `/${DEMO}/admin/teams`;
      watched = /^\/api\/admin\/users$/;
      // The directory reads once per staff role; another staff member's name
      // from any of those reads, not the caller's own (the shell names it).
      const headed = collectReads(page, watched);
      await page.goto(opened);
      await expect
        .poll(() => headed.length, { timeout: 120_000 })
        .toBeGreaterThanOrEqual(STAFF_ROLES.size);
      for (const read of headed) expect(read.status, read.path).toBe(200);
      guarded =
        headed
          .flatMap(
            (read) =>
              (read.json as { users: { display_name: string | null }[] }).users,
          )
          .map((user) => user.display_name)
          .find(
            (name) =>
              !!name &&
              name.length > 3 &&
              name !== staffInBoth!.name &&
              !/scope/i.test(name),
          ) ?? null;
    } else if (app === "missionary") {
      await signIn(page, missionaryInBoth!.email, missionaryInBoth!.password);
      await choose(page, `Open ${ORGANIZATION_NAME[DEMO]}`, DEMO);
      opened = `/${DEMO}/donors`;
      watched = /^\/api\/missionary\/donors$/;
      const first = await nextRead(page, watched, () => page.goto(opened));
      expect(first.status).toBe(200);
      guarded =
        (first.json as { donors: { name: string | null }[] }).donors
          .map((donor) => donor.name)
          .find(
            (name) =>
              !!name &&
              name.length > 3 &&
              !/anonymous|unnamed|scope/i.test(name),
          ) ?? null;
    } else {
      await signIn(page, SEEDED.owner.email, SEEDED_PASSWORD);
      await expect(page).toHaveURL(/\/donor-dashboard/, { timeout: 120_000 });
      opened = "/donor-dashboard/history";
      watched = /^\/api\/donor\/portal$/;
    }
    if (app !== "donor") {
      expect(guarded, "a name read with the headers").toBeTruthy();
      // With its headers the page shows it, so its absence later means
      // something.
      await expect(page.getByText(guarded!).first()).toBeVisible({
        timeout: 120_000,
      });
    }
    const stripped = await stripScopeHeaders(page);
    const reads = collectReads(page, watched);
    const loads = countDocumentLoads(page);
    await page.goto(opened);
    await expect
      .poll(() => reads.length, { timeout: 120_000 })
      .toBeGreaterThan(0);
    // Long enough for a reload loop to show itself: wait for the document to
    // load again, which a loop would do within this window; the wait timing
    // out is the outcome this case wants.
    await expect
      .poll(() => loads.count, { timeout: 15_000 })
      .toBeGreaterThan(2)
      .catch(() => undefined);
    // A crash is the page itself gone: its heading replaced by a route's
    // error page. A message inside an intact page ("Unauthorized", "Could
    // not load staff") is the refusal an ambiguous scope gets.
    const outcome = {
      surface: app,
      documentLoads: loads.count,
      statuses: reads.map((read) => read.status),
      headersStripped: stripped.count,
      pageHeading: await page.getByRole("heading", { level: 1 }).count(),
      routeError: await page
        .getByText(/application error|unhandled runtime error/i)
        .count(),
      refusal: (
        (await page
          .getByText(/unauthori[sz]ed|could not load|didn.t load|no access/i)
          .allInnerTexts()) ?? []
      ).slice(0, 2),
      url: new URL(page.url()).pathname,
    };
    test.info().annotations.push({
      type: "stale tab",
      description: JSON.stringify(outcome),
    });
    console.log(`stale tab: ${JSON.stringify(outcome)}`);
    // The page did try to send its scope, and the network removed it.
    expect(outcome.headersStripped, JSON.stringify(outcome)).toBeGreaterThan(0);
    expect(outcome.documentLoads, JSON.stringify(outcome)).toBeLessThanOrEqual(
      2,
    );
    expect(outcome.pageHeading, JSON.stringify(outcome)).toBeGreaterThan(0);
    expect(outcome.routeError, JSON.stringify(outcome)).toBe(0);
    if (app === "donor") {
      // One live donor row: every read is answered from it, with the owner's
      // own snapshot and no other donor's id or name.
      const others = await withOwner(
        stack,
        async (db) =>
          (
            await db.query(
              "select id::text as id, coalesce(name, '') as name from public.donors where id <> $1",
              [OWNER_DONOR],
            )
          ).rows as { id: string; name: string }[],
      );
      expect(others.length).toBeGreaterThan(0);
      for (const read of reads)
        expect(read.status, JSON.stringify(outcome)).toBe(200);
      const answered = reads.filter((read) => read.json !== null);
      expect(answered.length, JSON.stringify(outcome)).toBeGreaterThan(0);
      for (const read of answered) {
        const { portal } = read.json as { portal: { donor: { id: string } } };
        expect(portal.donor.id).toBe(OWNER_DONOR);
        const text = JSON.stringify(read.json);
        for (const other of others) {
          expect(text, other.id).not.toContain(other.id);
          if (other.name.trim().length > 3)
            expect(text, other.name).not.toContain(other.name);
        }
        for (const tenant of tenantIdsIn(read.json)) expect(tenant).toBe(DEMO);
      }
    } else {
      // Rows in both organizations and no proposal: every read is refused,
      // the page says so, and the name read with the headers is gone.
      for (const read of reads)
        expect(read.status, JSON.stringify(outcome)).toBe(401);
      expect(outcome.refusal.length, JSON.stringify(outcome)).toBeGreaterThan(
        0,
      );
      expect(await page.getByText(guarded!).count(), guarded!).toBe(0);
    }
  });
});
