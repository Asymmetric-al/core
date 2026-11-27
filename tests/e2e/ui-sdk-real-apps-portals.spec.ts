import AxeBuilder from "@axe-core/playwright";
import {
  expect,
  test,
  type Locator,
  type Page,
  type PlaywrightWorkerArgs,
  type Route,
  type TestInfo,
} from "@playwright/test";

import { donorBaseURL } from "./base-urls";
import { getDemoRoleMap } from "./helpers/demo-auth";
import { installDemoSessionInBrowser } from "./helpers/install-demo-session";
import { hideNextDevOverlay } from "./helpers/next-dev-overlay";
import { skipUnlessRequired } from "./ui-sdk-real-apps-required";
import { DEMO_PROFILE_ID, DEMO_TENANT_ID } from "../../packages/auth/constants";

// Keyboard, focus and naming on the donor portal and the missionary
// workspace, proven in the running Next.js apps (real server rendering,
// hydration, compiled CSS and real key presses). The pages load their data in
// the browser, so each test answers those requests with fixtures through
// `page.route`; everything else (layouts, providers, Base UI owners) is the
// app's own. `ui-sdk-real-apps.spec.ts` covers the shells of the same apps.
//
// Placeholder Supabase has no session, so the browser client is given one:
// a session cookie plus answers for `auth/v1/user` and the profile row. The
// retained-draft provider needs that profile to accept writing at all.

const missionaryBaseURL =
  process.env.PLAYWRIGHT_MISSIONARY_BASE_URL ?? "http://localhost:4000";
const SUPABASE_URL = "https://example.supabase.co";

const VIEWPORTS = [
  { label: "1280", width: 1280, height: 900, phone: false },
  { label: "375", width: 375, height: 812, phone: true },
] as const;
type Viewport = (typeof VIEWPORTS)[number];

type PortalRole = "donor" | "missionary";
type PortalApp = { title: string; baseURL: string; role: PortalRole };
const DONOR_APP: PortalApp = {
  title: "donor portal",
  baseURL: donorBaseURL,
  role: "donor",
};
const MISSIONARY_APP: PortalApp = {
  title: "missionary workspace",
  baseURL: missionaryBaseURL,
  role: "missionary",
};

const HYDRATION = /hydrat|did not match|server rendered html/i;
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21aa"];

// ---------------------------------------------------------------------------
// Console and hydration

type Collected = { hydration: string[]; errors: string[] };
const consoleOf = new WeakMap<Page, Collected>();

function collectConsole(page: Page) {
  const collected: Collected = { hydration: [], errors: [] };
  consoleOf.set(page, collected);
  page.on("console", (message) => {
    const text = `${message.type()}: ${message.text()}`;
    if (HYDRATION.test(message.text())) collected.hydration.push(text);
    else if (message.type() === "error") collected.errors.push(text);
  });
  page.on("pageerror", (error) => {
    const text = `pageerror: ${error.message}`;
    if (HYDRATION.test(error.message)) collected.hydration.push(text);
    else collected.errors.push(text);
  });
}

async function attachJson(testInfo: TestInfo, name: string, value: unknown) {
  await testInfo.attach(name, {
    body: JSON.stringify(value, null, 2),
    contentType: "application/json",
  });
}

async function snap(page: Page, testInfo: TestInfo, name: string) {
  await testInfo.attach(name, {
    body: await page.screenshot(),
    contentType: "image/png",
  });
}

// ---------------------------------------------------------------------------
// Sign-in

/**
 * Skips the block, with the reason, when its server is not running or its
 * demo role is not configured; in CI it fails instead
 * (`ui-sdk-real-apps-required.ts`). Any other answer than 200 is a broken
 * server, and fails the block.
 */
async function requireApp(
  playwright: PlaywrightWorkerArgs["playwright"],
  app: PortalApp,
) {
  const request = await playwright.request.newContext();
  try {
    const availability = new URL("/api/auth/demo-account", app.baseURL);
    const response = await request
      .get(availability.toString(), { timeout: 120_000 })
      .catch((error: unknown) =>
        error instanceof Error ? error : new Error(String(error)),
      );
    if (response instanceof Error) {
      // No server listening skips the block; a server that hangs or errors fails it.
      if (!/ECONNREFUSED/.test(response.message)) throw response;
      skipUnlessRequired(
        true,
        `The ${app.title} server at ${app.baseURL} did not answer: ${response.message}`,
      );
      return;
    }
    // A working server answers 200, with each role's availability inside.
    expect(
      response.status(),
      `The ${app.title} demo availability endpoint at ${availability.toString()} answered ${response.status()}: ${await response.text()}`,
    ).toBe(200);
    const roles = getDemoRoleMap(await response.json()) ?? {};
    skipUnlessRequired(
      !roles[app.role],
      `The ${app.role} demo account is not configured at ${app.baseURL}.`,
    );
  } finally {
    await request.dispose();
  }
}

/**
 * Gives the browser Supabase client a signed-in user and profile on the
 * placeholder project, and answers its other requests empty, so no request
 * waits on a host that does not exist.
 */
async function installClientIdentity(page: Page, app: PortalApp) {
  const origin = new URL(app.baseURL).origin;
  const userId = `e2e-${app.role}-user`;
  const expiresAt = Math.floor(Date.now() / 1000) + 3600;
  const user = {
    id: userId,
    aud: "authenticated",
    role: "authenticated",
    email: `hermetic-${app.role}@example.test`,
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: {},
    created_at: "2026-11-11T00:00:00.000Z",
  };
  const accessToken = [
    { alg: "HS256", typ: "JWT" },
    {
      sub: userId,
      exp: expiresAt,
      aud: "authenticated",
      role: "authenticated",
    },
  ]
    .map((part) => Buffer.from(JSON.stringify(part)).toString("base64url"))
    .concat("hermetic-not-a-real-signature")
    .join(".");
  const session = {
    access_token: accessToken,
    refresh_token: "hermetic-not-a-real-refresh-token",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: expiresAt,
    user,
  };
  const headers = {
    "access-control-allow-origin": origin,
    "access-control-allow-credentials": "true",
    "access-control-allow-headers": "*",
    "access-control-allow-methods": "GET,POST,PATCH,DELETE,OPTIONS",
  };
  // Registered first, so the specific routes below take precedence.
  await page.route(`${SUPABASE_URL}/**`, (route) =>
    route.request().method() === "OPTIONS"
      ? route.fulfill({ status: 204, headers })
      : route.fulfill({ json: [], headers }),
  );
  await page.route(`${SUPABASE_URL}/auth/v1/user`, (route) =>
    route.request().method() === "OPTIONS"
      ? route.fulfill({ status: 204, headers })
      : route.fulfill({ json: user, headers }),
  );
  await page.route("**/api/auth/session", (route) =>
    route.fulfill({ json: { user } }),
  );
  await page.route(`${SUPABASE_URL}/rest/v1/profiles?*`, (route) => {
    const request = route.request();
    if (request.method() === "OPTIONS") {
      return route.fulfill({ status: 204, headers });
    }
    const requestedUser = new URL(request.url()).searchParams.get("user_id");
    if (requestedUser !== `eq.${userId}`) {
      return route.fulfill({ json: [], headers });
    }
    return route.fulfill({
      json: {
        id: DEMO_PROFILE_ID,
        user_id: userId,
        tenant_id: DEMO_TENANT_ID,
        role: app.role,
        first_name: app.role === "donor" ? "Avery" : "Sam",
        last_name: app.role === "donor" ? "Brooks" : "Carter",
        email: user.email,
      },
      headers,
    });
  });
  await page.context().addCookies([
    {
      name: "sb-example-auth-token",
      value:
        "base64-" + Buffer.from(JSON.stringify(session)).toString("base64url"),
      url: `${origin}/`,
      httpOnly: false,
      secure: origin.startsWith("https:"),
      sameSite: "Lax",
    },
  ]);
}

async function signIn(page: Page, app: PortalApp, viewport: Viewport) {
  await page.setViewportSize({
    width: viewport.width,
    height: viewport.height,
  });
  const session = await installDemoSessionInBrowser(
    page,
    app.role,
    app.baseURL,
  );
  expect(
    session.ok,
    `The ${app.role} demo sign-in answered ${session.status}`,
  ).toBe(true);
  await installClientIdentity(page, app);
}

async function open(page: Page, app: PortalApp, path: string) {
  await page.goto(new URL(path, app.baseURL).toString(), {
    waitUntil: "domcontentloaded",
    timeout: 180_000,
  });
}

/** Waits until React has hydrated `element` and the frame after it painted. */
async function hydrated(page: Page, element: Locator) {
  // The first hit of a route compiles it.
  await expect(element).toBeVisible({ timeout: 180_000 });
  await expect
    .poll(
      () =>
        element.evaluate((node) =>
          Object.keys(node).some((key) => key.startsWith("__reactFiber$")),
        ),
      { timeout: 120_000 },
    )
    .toBe(true);
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
}

// ---------------------------------------------------------------------------
// Keyboard helpers

const hasFocus = (element: Locator) =>
  element.evaluate((node) => node === document.activeElement);

/** Presses Tab (or Shift+Tab) until `target` has focus. */
async function tabTo(
  page: Page,
  target: Locator,
  { backwards = false, limit = 40 } = {},
) {
  for (let presses = 0; presses < limit; presses += 1) {
    if (await hasFocus(target)) return;
    await page.keyboard.press(backwards ? "Shift+Tab" : "Tab");
  }
  await expect(target).toBeFocused();
}

/** The `tabindex` of each item, by accessible name. */
async function tabStops(items: Locator) {
  return items.evaluateAll((nodes) =>
    nodes.map((node) => ({
      name: node.getAttribute("aria-label") ?? node.textContent?.trim() ?? "",
      tabIndex: node.getAttribute("tabindex"),
    })),
  );
}

/** Exactly one item is in the tab order, and it is `name`. */
async function expectOneTabStop(items: Locator, name: string) {
  await expect
    .poll(async () =>
      (await tabStops(items))
        .filter((item) => item.tabIndex === "0")
        .map((item) => item.name),
    )
    .toEqual([name]);
}

const focusIsInside = (container: Locator) =>
  container.evaluate((node) => node.contains(document.activeElement));

/** The element's opacity as painted: its own times every ancestor's. */
const effectiveOpacity = (element: Locator) =>
  element.evaluate((node) => {
    let opacity = 1;
    for (let at: Element | null = node; at; at = at.parentElement) {
      opacity *= Number(getComputedStyle(at).opacity);
    }
    return opacity;
  });

// ---------------------------------------------------------------------------
// Accessibility

type AxeSummary = { id: string; impact: string | null; nodes: string[] }[];

/** Runs axe on the page and attaches every violation it finds. */
async function axeViolations(
  page: Page,
  testInfo: TestInfo,
  name: string,
  include = "main",
): Promise<AxeSummary> {
  const results = await new AxeBuilder({ page })
    .include(include)
    .withTags(AXE_TAGS)
    .analyze();
  const summary = results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact ?? null,
    nodes: violation.nodes.map((node) => node.target.join(" ")),
  }));
  await attachJson(
    testInfo,
    `axe-${name}`,
    results.violations.map((violation) => ({
      id: violation.id,
      help: violation.help,
      nodes: violation.nodes.map((node) => ({
        target: node.target.join(" "),
        html: node.html,
        failure: node.failureSummary,
      })),
    })),
  );
  return summary;
}

// ---------------------------------------------------------------------------
// Request capture

type Captured = { method: string; url: string; body: unknown };

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({ status, json: body });
}

function requestBody(route: Route): unknown {
  const raw = route.request().postData();
  return raw ? (JSON.parse(raw) as unknown) : null;
}

// ---------------------------------------------------------------------------
// Fixtures: posts

const YEAR = new Date().getFullYear();

/**
 * A post as `GET /api/posts` returns it (packages/api/src/posts): the whole
 * `posts` row, its author's profile, and the signed-in user's reactions.
 */
function apiPost(fixture: {
  id: string;
  postType: string;
  title: string;
  content: string;
  author: { id: string; first: string; last: string };
  daysAgo: number;
  status?: "published" | "draft";
  counts?: { likes: number; prayers: number; fires: number; comments: number };
}) {
  const created = new Date(
    Date.now() - fixture.daysAgo * 86_400_000,
  ).toISOString();
  const counts = fixture.counts ?? {
    likes: 0,
    prayers: 0,
    fires: 0,
    comments: 0,
  };
  return {
    id: fixture.id,
    tenant_id: DEMO_TENANT_ID,
    missionary_id: fixture.author.id,
    title: fixture.title,
    content: fixture.content,
    media: [],
    image_url: null,
    post_type: fixture.postType,
    type: "missionary_update",
    visibility: "public",
    status: fixture.status ?? "published",
    like_count: counts.likes,
    prayer_count: counts.prayers,
    fires_count: counts.fires,
    comment_count: counts.comments,
    created_at: created,
    updated_at: created,
    author: {
      id: fixture.author.id,
      first_name: fixture.author.first,
      last_name: fixture.author.last,
      avatar_url: null,
    },
    user_liked: false,
    user_prayed: false,
    user_fired: false,
  };
}

// ---------------------------------------------------------------------------
// Fixtures: donor portal

function feedPost(
  id: string,
  postType: string,
  title: string,
  author: { id: string; first: string; last: string },
  daysAgo: number,
) {
  return apiPost({
    id,
    postType,
    title,
    content: `<p>${title}. A short note from the field for the people who pray and give.</p>`,
    author,
    daysAgo,
    counts: { likes: 2, prayers: 1, fires: 0, comments: 0 },
  });
}

const JORDAN = { id: "missionary-jordan", first: "Jordan", last: "Hale" };
const GRACE = { id: "missionary-grace", first: "Grace", last: "Okafor" };
const DONOR_FEED = [
  feedPost("feed-1", "Story", "A new well in Kibera", JORDAN, 1),
  feedPost("feed-2", "Prayer Request", "Pray for the clinic team", JORDAN, 2),
  feedPost("feed-3", "Story", "Graduation day at the school", GRACE, 3),
  feedPost("feed-4", "Update", "Visas approved for the new term", GRACE, 4),
];

type Gift = {
  id: string;
  day: string;
  amount: number;
  missionary: string | null;
  fund: string | null;
  type: "Recurring" | "One-Time";
  status: "Paid" | "Processing" | "Failed" | "Refunded";
};

const GIFTS: Gift[] = [
  {
    id: "G-1004",
    day: "03-02",
    amount: 250,
    missionary: "Jordan Hale",
    fund: null,
    type: "One-Time",
    status: "Paid",
  },
  {
    id: "G-1003",
    day: "02-15",
    amount: 100,
    missionary: "Jordan Hale",
    fund: null,
    type: "Recurring",
    status: "Paid",
  },
  {
    id: "G-1002",
    day: "01-20",
    amount: 75,
    missionary: null,
    fund: "Clean Water Fund",
    type: "One-Time",
    status: "Processing",
  },
  {
    id: "G-1001",
    day: "01-15",
    amount: 100,
    missionary: "Jordan Hale",
    fund: null,
    type: "Recurring",
    status: "Failed",
  },
];

function portalSnapshot(profile: {
  displayName: string;
  email: string;
  phone: string | null;
}) {
  return {
    profile: { id: DEMO_PROFILE_ID, avatarUrl: null, ...profile },
    donor: {
      id: "donor-avery",
      status: "active",
      joinedDate: `${YEAR - 3}-04-01`,
      preferredContact: "email",
      receiptEmailFrequency: "each",
      defaultUpdateFrequency: null,
      preferredLanguage: "en",
      doNotContact: false,
      doNotEmail: false,
      givingPreferences: {},
      address: null,
      stripeCustomerConfigured: false,
    },
    summary: {
      yearToDateCents: 35_000,
      lifetimeGivenCents: 125_000,
      giftCount: GIFTS.length,
      activeRecurringGiftCount: 1,
      supportedDesignationCount: 2,
      receiptCount: 2,
      statementYears: [YEAR],
      latestImpactLabel: null,
    },
    donations: GIFTS.map((gift) => ({
      id: gift.id,
      date: `${YEAR}-${gift.day}T10:00:00`,
      amountCents: gift.amount * 100,
      amount: gift.amount,
      currency: "USD",
      status: gift.status,
      type: gift.type,
      method: "Card",
      receiptUrl: `/api/donor/receipts/${gift.id}`,
      statementYear: YEAR,
      designation: gift.missionary
        ? {
            id: "missionary-jordan",
            name: gift.missionary,
            type: "missionary",
            avatarUrl: null,
          }
        : { id: "fund-water", name: gift.fund, type: "fund", avatarUrl: null },
      missionary: gift.missionary
        ? { id: "missionary-jordan", name: gift.missionary, avatarUrl: null }
        : null,
      fund: gift.fund ? { id: "fund-water", name: gift.fund } : null,
    })),
    donationsComplete: true,
    recurringGifts: [],
    recurringGiftsComplete: true,
    paymentMethods: [],
    feedPreferences: {
      showOrgPosts: true,
      showMissionaryPosts: true,
      followOrg: true,
      emailOrgPosts: false,
      emailMissionaryPosts: true,
      pushOrgPosts: false,
      pushMissionaryPosts: false,
    },
  };
}

const AVERY = {
  displayName: "Avery Brooks",
  email: "avery@example.test",
  phone: "+1 555 0100",
};

// ---------------------------------------------------------------------------
// Fixtures: missionary workspace

function inDays(days: number) {
  return new Date(Date.now() + days * 86_400_000).toISOString();
}

type TaskFixture = {
  id: string;
  title: string;
  task_type: string;
  status: string;
  priority: string;
  sort_key: number;
  donor_id: string | null;
};

function task(fixture: TaskFixture) {
  return {
    ...fixture,
    missionary_id: DEMO_PROFILE_ID,
    description: null,
    notes: null,
    due_date: inDays(fixture.sort_key + 2),
    reminder_date: null,
    donor:
      fixture.donor_id === "partner-avery"
        ? {
            id: "partner-avery",
            name: "Avery Brooks",
            email: "avery@example.test",
            avatar_url: null,
          }
        : null,
    is_auto_generated: false,
    created_at: inDays(-10),
    updated_at: inDays(-10),
    completed_at: fixture.status === "completed" ? inDays(-1) : null,
  };
}

const TASKS = [
  task({
    id: "task-call",
    title: "Call Avery Brooks",
    task_type: "call",
    status: "not_started",
    priority: "high",
    sort_key: 1,
    donor_id: "partner-avery",
  }),
  task({
    id: "task-email",
    title: "Email the Rivera family",
    task_type: "email",
    status: "in_progress",
    priority: "medium",
    sort_key: 2,
    donor_id: null,
  }),
  task({
    id: "task-thanks",
    title: "Thank Grace Community Church",
    task_type: "thank_you",
    status: "not_started",
    priority: "low",
    sort_key: 3,
    donor_id: null,
  }),
  task({
    id: "task-newsletter",
    title: "Plan the spring newsletter",
    task_type: "to_do",
    status: "completed",
    priority: "none",
    sort_key: 4,
    donor_id: null,
  }),
];

/** A pledge as `GET /api/missionary/donors` maps it: amounts in cents. */
type RecurringGift = {
  id: string;
  amount: number;
  currency: string | null;
  frequency: "Monthly" | "Quarterly" | "Annually" | "One-Time";
  status: "active" | "paused" | "completed" | "cancelled";
  start_date: string;
  end_date?: string;
  next_payment_date?: string;
  total_paid: number;
  total_expected: number;
  payments_completed: number;
  payments_remaining: number;
  payment_method?: string;
};

/**
 * A partner row as `buildMissionaryDonorRows` returns it (packages/api
 * missionary-portal/donors.ts): the stored totals are never sent, monthly
 * giving follows the partner's active pledges, and "partner since" is no
 * later than the first pledge. Rows come sorted by name.
 */
function partner(
  id: string,
  name: string,
  fixture: {
    type: "Individual" | "Organization" | "Church";
    status: "Active" | "Lapsed" | "New" | "At Risk";
    frequency: RecurringGift["frequency"];
    last_gift_date: string | null;
    joined_date: string;
    tags?: string[];
    recurring_donations?: RecurringGift[];
  },
) {
  const recurring = fixture.recurring_donations ?? [];
  const [joined] = [
    fixture.joined_date,
    ...recurring.map((gift) => gift.start_date),
  ].sort();
  return {
    id,
    type: fixture.type,
    status: fixture.status,
    total_given: null,
    last_gift_date: fixture.last_gift_date,
    last_gift_amount: null,
    frequency: fixture.frequency,
    score: 80,
    recurring_donations: recurring,
    has_active_pledge: recurring.some((gift) => gift.status === "active"),
    joined_date: joined,
    name,
    initials: name
      .split(" ")
      .map((part) => part[0] ?? "")
      .join("")
      .toUpperCase()
      .slice(0, 2),
    email: `${id}@example.test`,
    phone: "+1 555 0101",
    preferred_contact: "email",
    location: "Nashville, TN",
    address: { city: "Nashville", state: "TN", country: "US" },
    tags: fixture.tags ?? [],
    activities: [],
    is_anonymous: false,
  };
}

const PARTNERS = [
  partner("partner-avery", "Avery Brooks", {
    type: "Individual",
    status: "Active",
    frequency: "Monthly",
    last_gift_date: `${YEAR}-03-01`,
    joined_date: `${YEAR - 2}-05-01`,
    tags: ["monthly-partner"],
    recurring_donations: [
      {
        id: "pledge-avery",
        amount: 10_000,
        currency: "USD",
        frequency: "Monthly",
        status: "active",
        start_date: `${YEAR - 1}-03-01`,
        next_payment_date: inDays(12).slice(0, 10),
        total_paid: 120_000,
        total_expected: 240_000,
        payments_completed: 12,
        payments_remaining: 12,
        payment_method: "Online",
      },
    ],
  }),
  partner("partner-grace", "Grace Community Church", {
    type: "Church",
    status: "Active",
    frequency: "One-Time",
    last_gift_date: `${YEAR}-02-01`,
    joined_date: `${YEAR - 3}-09-15`,
  }),
  // The stored frequency still says Monthly, but no pledge is active.
  partner("partner-morgan", "Morgan Lee", {
    type: "Individual",
    status: "Lapsed",
    frequency: "Monthly",
    last_gift_date: `${YEAR - 1}-06-01`,
    joined_date: `${YEAR - 2}-07-01`,
  }),
];

// The signed-in missionary's own updates.
const SAM = { id: DEMO_PROFILE_ID, first: "Sam", last: "Carter" };
const PUBLISHED_UPDATE = apiPost({
  id: "post-clinic",
  postType: "Story",
  title: "Clinic opening in Gulu",
  content: "<p>The clinic opened its doors this week.</p>",
  author: SAM,
  daysAgo: 2,
  counts: { likes: 3, prayers: 2, fires: 1, comments: 0 },
});

const DRAFT_UPDATES = [
  apiPost({
    id: "draft-harvest",
    postType: "Prayer Request",
    title: "Pray for the harvest",
    content: "<p>The rains came late this year.</p>",
    author: SAM,
    daysAgo: 1,
    status: "draft",
  }),
  apiPost({
    id: "draft-school",
    postType: "Update",
    title: "School term starts",
    content: "<p>Forty new students enrolled.</p>",
    author: SAM,
    daysAgo: 3,
    status: "draft",
  }),
];

/** A route answer the test releases when it is ready to see the result. */
function deferred() {
  let release: () => void = () => {};
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { released, release };
}

// ---------------------------------------------------------------------------
// The suites

test.use({ reducedMotion: "reduce" });
// The dev-only Next.js overlay covers bottom-left controls; see the helper.
test.beforeEach(async ({ context }) => {
  await hideNextDevOverlay(context);
});

test.describe("Donor portal keyboard and forms in the running app", () => {
  // First hits compile routes.
  test.describe.configure({ timeout: 300_000 });

  test.beforeAll(async ({ playwright }) => {
    await requireApp(playwright, DONOR_APP);
  });

  test.beforeEach(async ({ page }) => {
    collectConsole(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    const collected = consoleOf.get(page);
    if (!collected) return;
    await attachJson(testInfo, "console-errors", collected.errors);
    expect(collected.hydration, "hydration errors").toEqual([]);
  });

  for (const viewport of VIEWPORTS) {
    test(`Updates: the type-of-update toggle group is one tab stop, moves with arrows and announces the result at ${viewport.label}`, async ({
      page,
    }, testInfo) => {
      await signIn(page, DONOR_APP, viewport);
      const feedRequests: string[] = [];
      await page.route(
        (url) => url.pathname === "/api/posts",
        (route) => {
          if (route.request().method() !== "GET") return route.continue();
          feedRequests.push(route.request().url());
          return json(route, { posts: DONOR_FEED });
        },
      );
      await open(page, DONOR_APP, "/donor-dashboard/feed");

      const group = page.getByRole("group", { name: "Type of update" });
      const chips = group.getByRole("button");
      const chip = (name: string) =>
        group.getByRole("button", { name, exact: true });
      const articles = page.getByRole("main").getByRole("article");
      const result = page.locator('p[role="status"][aria-atomic="true"]');

      await hydrated(page, chip("All"));
      await expect(articles).toHaveCount(4);
      expect(feedRequests.length).toBeGreaterThan(0);
      // Chips come from the updates themselves, sorted, after "All".
      await expect(chips).toHaveText([
        "All",
        "Prayer request",
        "Story",
        "Update",
      ]);
      await expect(chip("All")).toHaveAttribute("aria-pressed", "true");
      await expectOneTabStop(chips, "All");
      await expect(result).toHaveText("");

      // Arrows move focus without pressing; Enter presses.
      await chip("All").click();
      await expect(chip("All")).toBeFocused();
      await page.keyboard.press("ArrowRight");
      await expect(chip("Prayer request")).toBeFocused();
      await expect(chip("Prayer request")).toHaveAttribute(
        "aria-pressed",
        "false",
      );
      await page.keyboard.press("ArrowRight");
      await expect(chip("Story")).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(chip("Story")).toHaveAttribute("aria-pressed", "true");
      await expect(chip("All")).toHaveAttribute("aria-pressed", "false");
      await expect(result).toHaveText(
        "2 updates match: Story, out of 4 loaded",
      );
      await expect(articles).toHaveCount(2);
      await expectOneTabStop(chips, "Story");

      // Pressing the chosen type again keeps one type on.
      await page.keyboard.press("Space");
      await expect(chip("Story")).toHaveAttribute("aria-pressed", "true");
      await expect(result).toHaveText(
        "2 updates match: Story, out of 4 loaded",
      );

      // Tab leaves the group in one step; Shift+Tab returns to the pressed chip.
      await page.keyboard.press("Tab");
      expect(await focusIsInside(group)).toBe(false);
      await expect(
        page.getByRole("combobox", { name: "Missionary" }),
      ).toBeFocused();
      await page.keyboard.press("Shift+Tab");
      await expect(chip("Story")).toBeFocused();

      // Arrows wrap; End and Home jump to the ends.
      await page.keyboard.press("End");
      await expect(chip("Update")).toBeFocused();
      await page.keyboard.press("ArrowRight");
      await expect(chip("All")).toBeFocused();
      await page.keyboard.press("ArrowLeft");
      await expect(chip("Update")).toBeFocused();
      await page.keyboard.press("Space");
      await expect(result).toHaveText(
        "1 update matches: Update, out of 4 loaded",
      );
      await expect(articles).toHaveCount(1);
      await snap(page, testInfo, `donor-feed-filtered-${viewport.label}`);

      await page.keyboard.press("Home");
      await expect(chip("All")).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(chip("All")).toHaveAttribute("aria-pressed", "true");
      await expect(result).toHaveText("");
      await expect(articles).toHaveCount(4);

      expect(await axeViolations(page, testInfo, "donor-feed")).toEqual([]);
    });

    test(`Giving history: the filter menus are named and work from the keyboard at ${viewport.label}`, async ({
      page,
    }, testInfo) => {
      await signIn(page, DONOR_APP, viewport);
      await page.route(
        (url) => url.pathname === "/api/donor/portal",
        (route) =>
          route.request().method() === "GET"
            ? json(route, { portal: portalSnapshot(AVERY) })
            : route.continue(),
      );
      await open(page, DONOR_APP, "/donor-dashboard/history");

      const search = page.getByRole("textbox", {
        name: "Search giving history",
      });
      const typeTrigger = page.getByRole("button", { name: /^Type: / });
      const statusTrigger = page.getByRole("button", { name: /^Status: / });
      const result = page.locator('p[role="status"][aria-atomic="true"]');
      await hydrated(page, search);
      await expect(page.getByTestId("giving-history-live")).toBeVisible();
      await expect(typeTrigger).toHaveAccessibleName("Type: All types");
      await expect(statusTrigger).toHaveAccessibleName("Status: All statuses");

      // From the search box, Tab reaches the Type menu next.
      await search.click();
      await page.keyboard.press("Tab");
      await expect(typeTrigger).toBeFocused();
      await page.keyboard.press("Enter");
      const menu = page.getByRole("menu");
      await expect(menu).toBeVisible();
      await expect(menu.getByRole("group", { name: "Type" })).toBeVisible();
      const allTypes = menu.getByRole("menuitemradio", { name: "All types" });
      const monthly = menu.getByRole("menuitemradio", {
        name: "Monthly gift",
      });
      await expect(allTypes).toHaveAttribute("aria-checked", "true");
      await expect(monthly).toHaveAttribute("aria-checked", "false");
      await expect(allTypes).toBeFocused();
      await page.keyboard.press("ArrowDown");
      await expect(monthly).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(monthly).toHaveAttribute("aria-checked", "true");
      await expect(result).toHaveText(`2 gifts match in ${YEAR}: Monthly gift`);
      await snap(page, testInfo, `donor-history-type-menu-${viewport.label}`);
      // A radio item keeps the menu open; Escape closes it to its trigger.
      await page.keyboard.press("Escape");
      await expect(menu).toBeHidden();
      await expect(typeTrigger).toBeFocused();
      await expect(typeTrigger).toHaveAccessibleName("Type: Monthly gift");
      await expect(typeTrigger).toHaveText("Monthly gift");

      // The Status menu, opened with the arrow key.
      await page.keyboard.press("Tab");
      await expect(statusTrigger).toBeFocused();
      await page.keyboard.press("ArrowDown");
      await expect(menu).toBeVisible();
      await expect(menu.getByRole("group", { name: "Status" })).toBeVisible();
      const paid = menu.getByRole("menuitemradio", { name: "Paid" });
      await expect(
        menu.getByRole("menuitemradio", { name: "All statuses" }),
      ).toBeFocused();
      await page.keyboard.press("ArrowDown");
      await expect(paid).toBeFocused();
      await page.keyboard.press("Space");
      await expect(paid).toHaveAttribute("aria-checked", "true");
      await expect(result).toHaveText(
        `1 gift matches in ${YEAR}: Monthly gift, Paid`,
      );
      await page.keyboard.press("Escape");
      await expect(statusTrigger).toBeFocused();
      await expect(statusTrigger).toHaveAccessibleName("Status: Paid");

      // Reopened, the menu starts on its first item, with the choice still
      // checked; choosing "All statuses" clears that filter.
      await page.keyboard.press("Enter");
      const allStatuses = menu.getByRole("menuitemradio", {
        name: "All statuses",
      });
      await expect(allStatuses).toBeFocused();
      await expect(paid).toHaveAttribute("aria-checked", "true");
      await page.keyboard.press("Enter");
      await expect(allStatuses).toHaveAttribute("aria-checked", "true");
      await expect(paid).toHaveAttribute("aria-checked", "false");
      await page.keyboard.press("Escape");
      await expect(statusTrigger).toBeFocused();
      await expect(statusTrigger).toHaveAccessibleName("Status: All statuses");
      await expect(result).toHaveText(`2 gifts match in ${YEAR}: Monthly gift`);

      expect(await axeViolations(page, testInfo, "donor-history")).toEqual([]);
    });

    test(`Settings: Enter saves the details once, a blank first name is flagged, and a refused save leaves the form read-only at ${viewport.label}`, async ({
      page,
    }, testInfo) => {
      await signIn(page, DONOR_APP, viewport);
      const patches: Captured[] = [];
      let refuse = false;
      let profile: Parameters<typeof portalSnapshot>[0] = { ...AVERY };
      await page.route(
        (url) => url.pathname === "/api/donor/portal",
        async (route) => {
          const request = route.request();
          if (request.method() === "GET") {
            return json(route, { portal: portalSnapshot(profile) });
          }
          if (request.method() !== "PATCH") return route.continue();
          const body = requestBody(route) as {
            displayName: string;
            phone: string | null;
          };
          patches.push({ method: "PATCH", url: request.url(), body });
          if (refuse) {
            return json(route, { error: "Forbidden" }, 403);
          }
          profile = {
            ...profile,
            displayName: body.displayName,
            phone: body.phone,
          };
          return json(route, { portal: portalSnapshot(profile) });
        },
      );
      await open(page, DONOR_APP, "/donor-dashboard/settings");

      const form = page.getByRole("form", { name: "Your details" });
      const firstName = form.getByRole("textbox", { name: "First name" });
      const lastName = form.getByRole("textbox", { name: "Last name" });
      const phone = form.getByRole("textbox", { name: "Phone" });
      const save = form.getByRole("button", { name: "Save changes" });
      await hydrated(page, firstName);
      await expect(firstName).toHaveValue("Avery");
      await expect(lastName).toHaveValue("Brooks");
      await expect(firstName).not.toHaveAttribute("readonly", "");

      // Enter in a field submits the form once.
      await lastName.click();
      await page.keyboard.press("ControlOrMeta+A");
      await page.keyboard.type("Brooks-Rivera");
      await page.keyboard.press("Enter");
      await expect(form.getByRole("status")).toHaveText("Saved.");
      await expect(
        form.getByRole("paragraph").filter({ hasText: /^Saved\.$/ }),
      ).toBeVisible();
      expect(patches).toEqual([
        {
          method: "PATCH",
          url: new URL("/api/donor/portal", DONOR_APP.baseURL).toString(),
          body: {
            firstName: "Avery",
            lastName: "Brooks-Rivera",
            displayName: "Avery Brooks-Rivera",
            phone: "+1 555 0100",
            avatarUrl: null,
          },
        },
      ]);
      await expect(lastName).toBeFocused();

      // A blank first name is flagged on the field, which takes focus, and
      // nothing is sent.
      await firstName.click();
      await page.keyboard.press("ControlOrMeta+A");
      await page.keyboard.press("Backspace");
      await phone.click();
      await page.keyboard.press("Enter");
      await expect(firstName).toHaveAttribute("aria-invalid", "true");
      await expect(firstName).toBeFocused();
      await expect(firstName).toHaveAccessibleDescription(
        "First name is required.",
      );
      expect(patches).toHaveLength(1);
      await snap(page, testInfo, `donor-settings-invalid-${viewport.label}`);

      // Typing a name clears the flag.
      await page.keyboard.type("Avery");
      await expect(firstName).not.toHaveAttribute("aria-invalid", "true");

      // The server refuses the next save: the profile becomes read-only.
      refuse = true;
      await page.keyboard.press("Enter");
      await expect(
        page.getByRole("status").filter({ hasText: "read-only" }),
      ).toBeVisible();
      expect(patches).toHaveLength(2);
      expect(patches[1]?.body).toMatchObject({
        firstName: "Avery",
        lastName: "Brooks-Rivera",
      });
      for (const field of [firstName, lastName, phone]) {
        await expect(field).toHaveAttribute("readonly", "");
      }
      await expect(save).toBeDisabled();
      // A read-only field still takes focus but keeps its value.
      await firstName.click();
      await expect(firstName).toBeFocused();
      await page.keyboard.type("x");
      await expect(firstName).toHaveValue("Avery");
      // Enter in a read-only form sends nothing. A request sent after the
      // key press reaches the route only after any the key press sent.
      await page.keyboard.press("Enter");
      await expect(firstName).toBeFocused();
      await page.evaluate(() =>
        fetch("/api/donor/portal").then(() => undefined),
      );
      expect(patches).toHaveLength(2);
      await snap(page, testInfo, `donor-settings-read-only-${viewport.label}`);

      expect(await axeViolations(page, testInfo, "donor-settings")).toEqual([]);
    });

    test(`Overview: Try again on "Updates couldn't load" keeps focus while it retries and lands on the page heading at ${viewport.label}`, async ({
      page,
    }, testInfo) => {
      await signIn(page, DONOR_APP, viewport);
      await page.route(
        (url) => url.pathname === "/api/donor/portal",
        (route) =>
          route.request().method() === "GET"
            ? json(route, { portal: portalSnapshot(AVERY) })
            : route.continue(),
      );
      await page.route(
        (url) => url.pathname === "/api/donor/payment-methods",
        (route) =>
          route.request().method() === "GET"
            ? json(route, { status: "not_linked", methods: [] })
            : route.continue(),
      );
      const feedRequests: string[] = [];
      let feedLoads = false;
      let hold: ReturnType<typeof deferred> | null = null;
      await page.route(
        (url) => url.pathname === "/api/posts",
        async (route) => {
          if (route.request().method() !== "GET") return route.continue();
          feedRequests.push(route.request().url());
          const loads = feedLoads;
          if (hold) await hold.released;
          return loads
            ? json(route, { posts: DONOR_FEED })
            : json(route, { error: "Service unavailable" }, 503);
        },
      );
      await open(page, DONOR_APP, "/donor-dashboard");

      const heading = page.getByRole("heading", {
        level: 1,
        name: /^Welcome back/,
      });
      const latest = page.getByRole("region", { name: "Latest update" });
      const more = page.getByRole("region", { name: "More updates" });
      const alert = latest.getByRole("alert");
      const retry = latest.getByRole("button", {
        name: /^(Try again|Trying again…)$/,
      });
      await hydrated(page, heading);
      await expect(heading).toHaveText("Welcome back, Avery");
      // The query retries a failed load three times before it gives up.
      await expect(alert).toHaveText("Updates couldn't load right now", {
        timeout: 60_000,
      });
      await expect(retry).toHaveText("Try again");
      await expect(more).toContainText("Updates couldn’t load right now.");
      await expect(
        more.getByRole("button", { name: "Try again" }),
      ).toBeVisible();
      const failedLoads = feedRequests.length;
      expect(failedLoads).toBe(4);
      await snap(
        page,
        testInfo,
        `donor-overview-updates-error-${viewport.label}`,
      );
      expect(
        await axeViolations(page, testInfo, "donor-overview-updates-error"),
      ).toEqual([]);

      // Try again from the keyboard: it keeps focus while the retry runs,
      // and both cards show the one shared retry.
      await heading.click();
      await tabTo(page, retry);
      feedLoads = true;
      hold = deferred();
      await page.keyboard.press("Enter");
      await expect(retry).toHaveText("Trying again…");
      await expect(retry).toBeFocused();
      await expect(retry).toHaveAttribute("aria-disabled", "true");
      await expect(
        more.getByRole("button", { name: "Trying again…" }),
      ).toBeVisible();
      await expect.poll(() => feedRequests.length).toBe(failedLoads + 1);
      // Pressing it again while it retries sends nothing more.
      await page.keyboard.press("Enter");
      await expect(retry).toBeFocused();
      hold.release();

      // The updates replace the button; focus lands on the page heading.
      await expect(
        latest.getByRole("heading", { name: DONOR_FEED[0]!.title }),
      ).toBeVisible();
      await expect(retry).toHaveCount(0);
      await expect(more.getByRole("link")).toHaveCount(4);
      await expect(heading).toBeFocused();
      await page.evaluate(() =>
        fetch("/api/donor/portal").then(() => undefined),
      );
      expect(feedRequests).toHaveLength(failedLoads + 1);
      for (const url of feedRequests) {
        expect(new URL(url).searchParams.toString()).toBe(
          "status=published&limit=5",
        );
      }
      await snap(page, testInfo, `donor-overview-updates-${viewport.label}`);
      expect(await axeViolations(page, testInfo, "donor-overview")).toEqual([]);
    });
  }

  test("Giving history: the sortable header exposes aria-sort and rows are one tab stop at 1280", async ({
    page,
  }, testInfo) => {
    await signIn(page, DONOR_APP, VIEWPORTS[0]);
    await page.route(
      (url) => url.pathname === "/api/donor/portal",
      (route) =>
        route.request().method() === "GET"
          ? json(route, { portal: portalSnapshot(AVERY) })
          : route.continue(),
    );
    await open(page, DONOR_APP, "/donor-dashboard/history");

    const grid = page.getByRole("grid", { name: "Giving history" });
    const header = grid.getByRole("columnheader", { name: /^Gift to/ });
    const sortButton = header.getByRole("button");
    const rows = grid.locator("tbody").getByRole("row");
    await hydrated(page, sortButton);
    await expect(rows).toHaveCount(4);

    // Every sortable header says it is unsorted.
    for (const name of ["Date", "Gift to", "Fund", "Amount", "Payment"]) {
      await expect(
        grid.getByRole("columnheader", { name: new RegExp(`^${name}`) }),
      ).toHaveAttribute("aria-sort", "none");
    }

    // Enter on the header button sorts; aria-sort and the name follow.
    await page.getByRole("textbox", { name: "Search giving history" }).click();
    await tabTo(page, sortButton);
    await page.keyboard.press("Enter");
    await expect(header).toHaveAttribute("aria-sort", "ascending");
    // The visually hidden suffix is read after the title.
    await expect(sortButton).toHaveAccessibleName(
      /^Gift to\s*, sorted ascending$/,
    );
    await expect(rows.first()).toContainText("Clean Water Fund");
    await page.keyboard.press("Enter");
    await expect(header).toHaveAttribute("aria-sort", "descending");
    await expect(sortButton).toHaveAccessibleName(
      /^Gift to\s*, sorted descending$/,
    );
    await expect(rows.first()).toContainText("Jordan Hale");
    await page.keyboard.press("Enter");
    await expect(header).toHaveAttribute("aria-sort", "none");
    await expect(sortButton).toHaveAccessibleName("Gift to");
    // Unsorted again: newest first, as the page orders them.
    await expect(rows.first()).toContainText(`Mar 2, ${YEAR}`);
    await expect(rows.nth(1)).toContainText(`Feb 15, ${YEAR}`);

    // The rows are one tab stop: the first row, until the arrows move it.
    const rowStops = () =>
      rows.evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute("tabindex")),
      );
    expect(await rowStops()).toEqual(["0", "-1", "-1", "-1"]);
    await tabTo(page, rows.first());
    await page.keyboard.press("ArrowDown");
    await expect(rows.nth(1)).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(rows.nth(2)).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(rows.nth(1)).toBeFocused();
    expect(await rowStops()).toEqual(["-1", "0", "-1", "-1"]);
    await snap(page, testInfo, "donor-history-row-focus-1280");

    // Tab moves into the focused row's link; Enter there follows the link
    // instead of being taken by the row.
    await page.keyboard.press("Tab");
    const monthlyLink = rows.nth(1).getByRole("link", { name: "Monthly gift" });
    await expect(monthlyLink).toBeFocused();
    await page.keyboard.press("Enter");
    await page.waitForURL("**/donor-dashboard/pledges", { timeout: 120_000 });

    await page.goBack();
    await hydrated(page, grid.getByRole("columnheader", { name: /^Date/ }));
    expect(await axeViolations(page, testInfo, "donor-history-grid")).toEqual(
      [],
    );
  });

  test("Giving history: on a phone each gift is a card and its link follows on Enter at 375", async ({
    page,
  }, testInfo) => {
    await signIn(page, DONOR_APP, VIEWPORTS[1]);
    await page.route(
      (url) => url.pathname === "/api/donor/portal",
      (route) =>
        route.request().method() === "GET"
          ? json(route, { portal: portalSnapshot(AVERY) })
          : route.continue(),
    );
    await open(page, DONOR_APP, "/donor-dashboard/history");

    const cards = page.getByRole("article", { name: /^Gift to / });
    const search = page.getByRole("textbox", { name: "Search giving history" });
    await hydrated(page, search);
    await expect(cards).toHaveCount(4);
    // No grid and so no row model on a phone.
    await expect(page.getByRole("grid")).toHaveCount(0);
    const monthlyLink = cards
      .nth(1)
      .getByRole("link", { name: "Monthly gift" });
    await search.click();
    await tabTo(page, monthlyLink);
    await snap(page, testInfo, "donor-history-card-link-375");
    await page.keyboard.press("Enter");
    await page.waitForURL("**/donor-dashboard/pledges", { timeout: 120_000 });
  });
});

test.describe("Missionary workspace keyboard and focus in the running app", () => {
  test.describe.configure({ timeout: 300_000 });

  test.beforeAll(async ({ playwright }) => {
    await requireApp(playwright, MISSIONARY_APP);
  });

  test.beforeEach(async ({ page }) => {
    collectConsole(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    const collected = consoleOf.get(page);
    if (!collected) return;
    await attachJson(testInfo, "console-errors", collected.errors);
    expect(collected.hydration, "hydration errors").toEqual([]);
  });

  async function stubTasks(page: Page) {
    const patches: Captured[] = [];
    await page.route(
      (url) => url.pathname === "/api/missionary/tasks",
      (route) => {
        if (route.request().method() !== "GET") return route.continue();
        const donorId = new URL(route.request().url()).searchParams.get(
          "donorId",
        );
        return json(route, {
          tasks: donorId
            ? TASKS.filter((item) => item.donor_id === donorId)
            : TASKS,
        });
      },
    );
    await page.route(
      (url) => url.pathname.startsWith("/api/missionary/tasks/"),
      (route) => {
        const request = route.request();
        if (request.method() !== "PATCH") return route.continue();
        const id = new URL(request.url()).pathname.split("/").at(-1);
        const body = requestBody(route) as Record<string, unknown>;
        patches.push({ method: "PATCH", url: request.url(), body });
        const current = TASKS.find((item) => item.id === id);
        return json(route, { task: { ...current, ...body } });
      },
    );
    return patches;
  }

  for (const viewport of VIEWPORTS) {
    test(`Tasks: the view toggle group, the Refine menu and completing a task keep focus in place at ${viewport.label}`, async ({
      page,
    }, testInfo) => {
      await signIn(page, MISSIONARY_APP, viewport);
      const patches = await stubTasks(page);
      await open(page, MISSIONARY_APP, "/tasks");

      const viewGroup = page.getByRole("group", { name: "Task view" });
      const views = viewGroup.getByRole("button");
      const board = viewGroup.getByRole("button", { name: "Board view" });
      const list = viewGroup.getByRole("button", { name: "List view" });
      await hydrated(page, board);
      const checkbox = (title: string) =>
        page.getByRole("checkbox", { name: `Mark ${title} complete` });

      // Wide screens open on the board, phones on the list.
      const opening = viewport.phone ? list : board;
      const other = viewport.phone ? board : list;
      await expect(opening).toHaveAttribute("aria-pressed", "true");
      await expect(other).toHaveAttribute("aria-pressed", "false");
      await expectOneTabStop(
        views,
        viewport.phone ? "List view" : "Board view",
      );

      // Arrows move between the two views; Enter switches.
      await opening.click();
      await expect(opening).toBeFocused();
      await page.keyboard.press(viewport.phone ? "ArrowLeft" : "ArrowRight");
      await expect(other).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(other).toHaveAttribute("aria-pressed", "true");
      await expect(opening).toHaveAttribute("aria-pressed", "false");
      await expectOneTabStop(
        views,
        viewport.phone ? "Board view" : "List view",
      );
      if (viewport.phone) {
        // Back to the list, where tasks are completed.
        await page.keyboard.press("ArrowRight");
        await expect(list).toBeFocused();
        await page.keyboard.press("Space");
        await expect(list).toHaveAttribute("aria-pressed", "true");
      }
      await expect(list).toBeFocused();
      await expect(
        page.getByRole("tablist", { name: "Show tasks" }),
      ).toBeVisible();
      await expect(checkbox("Call Avery Brooks")).toBeVisible();
      await snap(page, testInfo, `missionary-tasks-list-${viewport.label}`);

      // Completing the first open task from the list with Space: the row
      // leaves the Open list and focus lands on the checkbox now in its place.
      await tabTo(page, checkbox("Call Avery Brooks"));
      await page.keyboard.press("Space");
      await expect(checkbox("Call Avery Brooks")).toHaveCount(0);
      await expect(checkbox("Email the Rivera family")).toBeFocused();
      expect(patches).toEqual([
        {
          method: "PATCH",
          url: new URL(
            "/api/missionary/tasks/task-call",
            MISSIONARY_APP.baseURL,
          ).toString(),
          body: { status: "completed" },
        },
      ]);

      // The Refine menu: named radio groups, the current choice checked.
      const refine = page.getByRole("button", { name: "Refine" });
      await tabTo(page, refine, { backwards: true });
      await page.keyboard.press("Enter");
      const menu = page.getByRole("menu");
      await expect(menu).toBeVisible();
      const typeGroup = menu.getByRole("group", { name: "Task type" });
      await expect(typeGroup).toBeVisible();
      await expect(menu.getByRole("group", { name: "Priority" })).toBeVisible();
      const allTypes = menu.getByRole("menuitemradio", { name: "All types" });
      await expect(allTypes).toHaveAttribute("aria-checked", "true");
      await expect(allTypes).toBeFocused();
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowDown");
      const email = menu.getByRole("menuitemradio", { name: "Email" });
      await expect(email).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(email).toHaveAttribute("aria-checked", "true");
      await expect(allTypes).toHaveAttribute("aria-checked", "false");
      await snap(page, testInfo, `missionary-tasks-refine-${viewport.label}`);
      await page.keyboard.press("Escape");
      await expect(menu).toBeHidden();
      await expect(refine).toBeFocused();
      await expect(checkbox("Email the Rivera family")).toBeVisible();
      await expect(checkbox("Thank Grace Community Church")).toHaveCount(0);

      expect(await axeViolations(page, testInfo, "missionary-tasks")).toEqual(
        [],
      );
    });

    test(`Partners: Sort and Filter radio menus, filter chip removal focus and the detail tabs at ${viewport.label}`, async ({
      page,
    }, testInfo) => {
      await signIn(page, MISSIONARY_APP, viewport);
      await stubTasks(page);
      await page.route(
        (url) => url.pathname === "/api/missionary/donors",
        (route) =>
          route.request().method() === "GET"
            ? json(route, {
                donors: PARTNERS,
                hasMore: false,
                nextOffset: null,
              })
            : route.continue(),
      );
      await open(page, MISSIONARY_APP, "/donors");

      const sort = page.getByRole("button", { name: "Sort partners" });
      const filter = page.getByRole("button", { name: "Filter partners" });
      const search = page.getByRole("textbox", { name: "Search partners" });
      const partnerButton = (name: string) =>
        page.getByRole("button", { name: new RegExp(`^${name}`) });
      const order = () =>
        page
          .getByRole("button", {
            name: /^(Avery Brooks|Grace Community Church|Morgan Lee)/,
          })
          .evaluateAll((nodes) =>
            nodes.map(
              (node) =>
                ["Avery Brooks", "Grace Community Church", "Morgan Lee"].find(
                  (name) => node.textContent?.includes(name),
                ) ?? "",
            ),
          );
      await hydrated(page, sort);
      await expect(partnerButton("Avery Brooks")).toBeVisible();
      // Newest gift first.
      await expect
        .poll(order)
        .toEqual(["Avery Brooks", "Grace Community Church", "Morgan Lee"]);

      // Sort: a named radio group; arrows and Enter pick Name.
      await page.getByRole("heading", { name: /^All partners/ }).click();
      await tabTo(page, sort);
      await page.keyboard.press("Enter");
      const menu = page.getByRole("menu");
      await expect(menu).toBeVisible();
      await expect(menu.getByRole("group", { name: "Sort by" })).toBeVisible();
      const lastGift = menu.getByRole("menuitemradio", { name: "Last gift" });
      const byName = menu.getByRole("menuitemradio", { name: "Name" });
      await expect(lastGift).toHaveAttribute("aria-checked", "true");
      await expect(lastGift).toBeFocused();
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowDown");
      await expect(byName).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(byName).toHaveAttribute("aria-checked", "true");
      await expect(lastGift).toHaveAttribute("aria-checked", "false");
      await page.keyboard.press("Escape");
      await expect(menu).toBeHidden();
      await expect(sort).toBeFocused();
      // Descending by default, so Z to A.
      await expect
        .poll(order)
        .toEqual(["Morgan Lee", "Grace Community Church", "Avery Brooks"]);

      // Filter: status and monthly giving are radio groups.
      await page.keyboard.press("Tab");
      await expect(filter).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(menu).toBeVisible();
      await expect(menu.getByRole("group", { name: "Status" })).toBeVisible();
      await expect(
        menu.getByRole("group", { name: "Monthly giving" }),
      ).toBeVisible();
      const active = menu.getByRole("menuitemradio", {
        name: "Active",
        exact: true,
      });
      await expect(
        menu.getByRole("menuitemradio", { name: "All" }).first(),
      ).toBeFocused();
      await page.keyboard.press("ArrowDown");
      await expect(active).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(active).toHaveAttribute("aria-checked", "true");
      // Down to "Gives monthly" in the next group.
      const givesMonthly = menu.getByRole("menuitemradio", {
        name: "Gives monthly",
      });
      for (let step = 0; step < 8; step += 1) {
        if (await hasFocus(givesMonthly)) break;
        await page.keyboard.press("ArrowDown");
      }
      await expect(givesMonthly).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(givesMonthly).toHaveAttribute("aria-checked", "true");
      await snap(
        page,
        testInfo,
        `missionary-partners-filter-${viewport.label}`,
      );
      await page.keyboard.press("Escape");
      await expect(filter).toBeFocused();
      await expect.poll(order).toEqual(["Avery Brooks"]);

      // Removing a chip moves focus to the chip now in its place, then to
      // the search box when none is left.
      const clearStatus = page.getByRole("button", {
        name: "Clear Active status filter",
      });
      const clearMonthly = page.getByRole("button", {
        name: "Clear recurring filter",
      });
      await search.click();
      await page.keyboard.press("Tab");
      await expect(clearStatus).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(clearStatus).toHaveCount(0);
      await expect(clearMonthly).toBeFocused();
      // "Gives monthly" alone still leaves Morgan Lee out: it follows the
      // active pledges, not the stored Monthly frequency Morgan still has.
      await expect.poll(order).toEqual(["Avery Brooks"]);
      await page.keyboard.press("Enter");
      await expect(clearMonthly).toHaveCount(0);
      await expect(search).toBeFocused();
      await expect.poll(order).toHaveLength(3);

      // Detail tabs: one tab stop, arrows move, Enter selects.
      await tabTo(page, partnerButton("Avery Brooks"));
      await page.keyboard.press("Enter");
      const tabs = page.getByRole("tablist", { name: "Avery Brooks details" });
      await expect(tabs).toBeVisible();
      if (viewport.phone) {
        // The roster steps aside on a phone; focus moves into the detail.
        await expect(
          page.getByRole("button", { name: "Back to partner list" }),
        ).toBeFocused();
      }
      const tab = (name: string) => tabs.getByRole("tab", { name });
      await expect(tab("Overview")).toHaveAttribute("aria-selected", "true");
      await expectOneTabStop(tabs.getByRole("tab"), "Overview");
      await tabTo(page, tab("Overview"));
      await page.keyboard.press("ArrowRight");
      await expect(tab("Tasks")).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(tab("Tasks")).toHaveAttribute("aria-selected", "true");
      await expect(
        page.getByRole("tabpanel", { name: "Tasks" }).getByRole("checkbox", {
          name: "Mark Call Avery Brooks complete",
        }),
      ).toBeVisible();
      await expectOneTabStop(tabs.getByRole("tab"), "Tasks");
      await page.keyboard.press("End");
      await expect(tab("Giving")).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(tab("Giving")).toHaveAttribute("aria-selected", "true");
      await snap(page, testInfo, `missionary-partner-tabs-${viewport.label}`);
      expect(
        await axeViolations(page, testInfo, "missionary-partners"),
      ).toEqual([]);

      // Recurring shows the active pledge that makes Avery a monthly giver.
      await page.keyboard.press("ArrowLeft");
      await expect(tab("Recurring")).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(tab("Recurring")).toHaveAttribute("aria-selected", "true");
      await expect(
        page
          .getByRole("tabpanel", { name: "Recurring" })
          .getByRole("progressbar", {
            name: "Recurring gift progress, $100.00 monthly",
          }),
      ).toHaveAttribute("aria-valuenow", "50");
      await snap(
        page,
        testInfo,
        `missionary-partner-recurring-${viewport.label}`,
      );
      expect(
        await axeViolations(page, testInfo, "missionary-partner-recurring"),
      ).toEqual([]);
    });

    test(`Updates: the composer's type toggle group, Cancel editing focus and the read-only composer at ${viewport.label}`, async ({
      page,
    }, testInfo) => {
      await signIn(page, MISSIONARY_APP, viewport);
      const posts: Captured[] = [];
      await page.route(
        (url) => url.pathname === "/api/posts",
        (route) => {
          const request = route.request();
          if (request.method() === "GET") {
            const status = new URL(request.url()).searchParams.get("status");
            return json(route, {
              posts: status === "published" ? [PUBLISHED_UPDATE] : [],
            });
          }
          if (request.method() === "POST") {
            posts.push({
              method: "POST",
              url: request.url(),
              body: requestBody(route),
            });
            return json(route, { error: "Forbidden" }, 403);
          }
          return route.continue();
        },
      );
      await page.route(
        (url) => url.pathname === "/api/follower-requests",
        (route) =>
          route.request().method() === "GET"
            ? json(route, { requests: [] })
            : route.continue(),
      );
      await open(page, MISSIONARY_APP, "/feed");

      const composer = page.getByRole("region", { name: "Share an update" });
      const group = page.getByRole("group", { name: "Type of update" });
      const chips = group.getByRole("button");
      const chip = (name: string) =>
        group.getByRole("button", { name, exact: true });
      const title = page.getByRole("textbox", { name: "Title" });
      const editor = page.getByRole("textbox", {
        name: "Ministry post content",
      });
      await hydrated(page, chip("Update"));
      await expect(composer).toBeVisible();
      await expect(chips).toHaveText([
        "Update",
        "Story",
        "Prayer request",
        "Milestone",
      ]);
      await expect(chip("Update")).toHaveAttribute("aria-pressed", "true");
      await expectOneTabStop(chips, "Update");

      // Arrows move; Enter presses; Tab leaves the group in one step.
      await chip("Update").click();
      await page.keyboard.press("ArrowRight");
      await expect(chip("Story")).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(chip("Story")).toHaveAttribute("aria-pressed", "true");
      await expect(chip("Update")).toHaveAttribute("aria-pressed", "false");
      await expectOneTabStop(chips, "Story");
      await page.keyboard.press("Tab");
      await expect(title).toBeFocused();
      await page.keyboard.press("Shift+Tab");
      await expect(chip("Story")).toBeFocused();
      await page.keyboard.press("ArrowLeft");
      await page.keyboard.press("Space");
      await expect(chip("Update")).toHaveAttribute("aria-pressed", "true");

      // Editing a published update, then Cancel editing: the button leaves
      // with the edit and focus lands on the composer heading.
      const actions = page.getByRole("button", {
        name: `Update actions for ${PUBLISHED_UPDATE.title}`,
      });
      await actions.click();
      const menu = page.getByRole("menu");
      await expect(menu).toBeVisible();
      await menu.getByRole("menuitem", { name: "Edit" }).click();
      await expect(
        page.getByRole("heading", { name: "Edit update" }),
      ).toBeVisible();
      await expect(title).toHaveValue(PUBLISHED_UPDATE.title);
      await expect(chip("Story")).toHaveAttribute("aria-pressed", "true");
      const cancel = page.getByRole("button", { name: "Cancel editing" });
      await tabTo(page, cancel, { backwards: true, limit: 80 });
      await page.keyboard.press("Enter");
      await expect(cancel).toHaveCount(0);
      const heading = page.getByRole("heading", { name: "Share an update" });
      await expect(heading).toBeFocused();
      await expect(title).toHaveValue("");
      await expect(chip("Update")).toHaveAttribute("aria-pressed", "true");

      // The writable composer passes axe.
      expect(
        await axeViolations(page, testInfo, "missionary-feed-writable"),
      ).toEqual([]);

      // While writable, the editor's bottom row holds its formatting
      // controls and the composer's actions.
      const editorRoot = composer.locator('[data-slot="rich-text-editor"]');
      const formatting = editorRoot.getByRole("toolbar", {
        name: "Text formatting",
      });
      const publish = editorRoot.getByRole("button", { name: "Publish" });
      const saveDraft = editorRoot.getByRole("button", { name: "Save draft" });
      const audience = editorRoot.getByRole("button", {
        name: "Who can see this: Public",
      });
      await expect(formatting).toBeVisible();
      await expect(
        editorRoot.getByText("0 words", { exact: true }),
      ).toBeVisible();
      for (const action of [audience, saveDraft, publish]) {
        await expect(action).toBeVisible();
      }

      // Writing is refused (403): the composer turns read-only and keeps the
      // words, and says why.
      await chip("Milestone").click();
      await title.click();
      await page.keyboard.type("Water project finished");
      await editor.click();
      await page.keyboard.type("All twelve wells are pumping.");
      await expect(publish).toBeEnabled();
      await publish.click();
      const notice = composer.getByRole("status").filter({
        hasText: "Your updates are read-only.",
      });
      await expect(notice).toBeVisible();
      expect(posts).toHaveLength(1);
      expect(posts[0]?.body).toMatchObject({
        title: "Water project finished",
        post_type: "Milestone",
        visibility: "public",
        status: "published",
        media: [],
      });
      expect(JSON.stringify(posts[0]?.body)).toContain(
        "All twelve wells are pumping.",
      );
      const reason =
        "Your updates are read-only. Your readable draft is kept, but cannot be submitted.";
      await expect(notice).toHaveText(reason);
      // The notice opens the card's content, above the type of update; the
      // card's header keeps only its title and description.
      const content = composer.locator('[data-slot="card-content"]');
      await expect(content.getByRole("status")).toHaveText(reason);
      expect(
        await content.evaluate((node) => node.firstElementChild?.textContent),
      ).toBe(reason);
      await expect(
        composer.locator('[data-slot="card-header"]').getByRole("status"),
      ).toHaveCount(0);
      // The refused save says it was not saved because updates are
      // read-only, and offers no Try again: a retry cannot help.
      const toasts = page.locator("[data-sonner-toast]");
      await expect(
        toasts.filter({
          hasText:
            "Your updates are read-only, so this wasn’t saved. Your draft is kept.",
        }),
      ).toHaveCount(1);
      await expect(toasts.filter({ hasText: "Try again" })).toHaveCount(0);
      await expect(
        page.getByText("Couldn’t save your update. Try again."),
      ).toHaveCount(0);
      await snap(page, testInfo, `missionary-feed-refused-${viewport.label}`);
      // Publish stays in the editor's bottom row and keeps focus.
      await expect(publish).toBeFocused();

      // The kept draft is read-only at full strength, not dimmed. The editor
      // keeps its bottom row, word count and actions included, and drops
      // only its formatting controls.
      const wordCount = editorRoot.getByText("5 words", { exact: true });
      await expect(formatting).toHaveCount(0);
      await expect(editorRoot).toHaveAttribute("data-readonly", "");
      await expect(editorRoot).not.toHaveAttribute("data-disabled");
      await expect(editor).toHaveAttribute("contenteditable", "false");
      await expect(editor).toHaveAttribute("aria-readonly", "true");
      await expect(editor).not.toHaveAttribute("aria-disabled");
      await expect(editor).toHaveText("All twelve wells are pumping.");
      await expect(editor).toHaveAccessibleDescription(reason);
      await expect(wordCount).toBeVisible();
      expect(await effectiveOpacity(editor)).toBe(1);
      expect(await effectiveOpacity(wordCount)).toBe(1);

      await expect(title).toHaveAttribute("readonly", "");
      await expect(title).toHaveValue("Water project finished");
      await expect(title).toHaveAccessibleDescription(reason);
      await expect(group).toHaveAccessibleDescription(reason);
      for (const name of ["Update", "Story", "Prayer request", "Milestone"]) {
        await expect(chip(name)).toBeDisabled();
      }
      await expect(chip("Milestone")).toHaveAttribute("aria-pressed", "true");

      // The actions stay in the editor and reachable, so the reason is
      // heard, but do nothing.
      for (const action of [audience, saveDraft, publish]) {
        await expect(action).toBeVisible();
        await expect(action).toBeDisabled();
        await expect(action).toHaveAttribute("aria-disabled", "true");
        await expect(action).toHaveAccessibleDescription(reason);
      }
      await page.keyboard.press("Enter");
      await expect(publish).toBeFocused();
      await page.keyboard.press("Shift+Tab");
      await expect(saveDraft).toBeFocused();
      await page.keyboard.press("Enter");
      await page.keyboard.press("Space");
      await expect(saveDraft).toBeFocused();
      await page.keyboard.press("Shift+Tab");
      await expect(audience).toBeFocused();
      await page.keyboard.press("Enter");
      // An opened menu would take focus.
      await expect(audience).toBeFocused();
      await expect(audience).not.toHaveAttribute("aria-expanded", "true");
      await expect(page.getByRole("menu")).toHaveCount(0);

      // A read-only title and editor keep focus and their words.
      await title.click();
      await page.keyboard.type("!");
      await expect(title).toHaveValue("Water project finished");
      await editor.click();
      await page.keyboard.type(" More");
      await expect(editor).toHaveText("All twelve wells are pumping.");
      // A request sent after the key presses reaches the route only after
      // any they sent.
      await page.evaluate(() =>
        fetch("/api/posts?status=published").then(() => undefined),
      );
      expect(posts).toHaveLength(1);
      await snap(page, testInfo, `missionary-feed-read-only-${viewport.label}`);

      expect(
        await axeViolations(page, testInfo, "missionary-feed-read-only"),
      ).toEqual([]);
    });

    test(`Updates: Try again on a failed Drafts load keeps focus while it retries and lands on the Drafts panel at ${viewport.label}`, async ({
      page,
    }, testInfo) => {
      await signIn(page, MISSIONARY_APP, viewport);
      const draftRequests: string[] = [];
      // Drafts fail to load until the test lets them through.
      let draftsLoad = false;
      let hold: ReturnType<typeof deferred> | null = null;
      await page.route(
        (url) => url.pathname === "/api/posts",
        async (route) => {
          const request = route.request();
          if (request.method() !== "GET") return route.continue();
          const status = new URL(request.url()).searchParams.get("status");
          if (status !== "draft") {
            return json(route, { posts: [PUBLISHED_UPDATE] });
          }
          draftRequests.push(request.url());
          const loads = draftsLoad;
          if (hold) await hold.released;
          return loads
            ? json(route, { posts: DRAFT_UPDATES })
            : json(route, { error: "Unable to load posts" }, 500);
        },
      );
      await page.route(
        (url) => url.pathname === "/api/follower-requests",
        (route) =>
          route.request().method() === "GET"
            ? json(route, { requests: [] })
            : route.continue(),
      );
      await open(page, MISSIONARY_APP, "/feed");

      const tabs = page.getByRole("tablist", { name: "Updates" });
      const publishedTab = tabs.getByRole("tab", { name: "Published" });
      const draftsTab = tabs.getByRole("tab", { name: /^Drafts/ });
      const draftsPanel = page.getByRole("tabpanel", { name: /^Drafts/ });
      const alert = draftsPanel.getByRole("alert");
      const retry = draftsPanel.getByRole("button", {
        name: /^(Try again|Trying again…)$/,
      });
      await hydrated(page, publishedTab);
      await expect(
        page.getByRole("heading", { name: PUBLISHED_UPDATE.title }),
      ).toBeVisible();

      // To the Drafts tab from the keyboard.
      await publishedTab.click();
      await expect(publishedTab).toBeFocused();
      await page.keyboard.press("ArrowRight");
      await expect(draftsTab).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(draftsTab).toHaveAttribute("aria-selected", "true");
      await expect(alert).toHaveText("We couldn’t load your drafts.");
      await expect(retry).toHaveText("Try again");
      // Development mode runs the loading effect twice.
      const initialLoads = draftRequests.length;
      expect(initialLoads).toBeGreaterThanOrEqual(1);
      await snap(page, testInfo, `missionary-drafts-error-${viewport.label}`);
      expect(
        await axeViolations(page, testInfo, "missionary-feed-drafts-error"),
      ).toEqual([]);

      // A retry that fails again: Try again keeps focus throughout, and the
      // alert is a new element, so it is announced again.
      await tabTo(page, retry);
      const firstAlert = await alert.elementHandle();
      hold = deferred();
      await page.keyboard.press("Enter");
      await expect(retry).toHaveText("Trying again…");
      await expect(retry).toBeFocused();
      await expect(retry).toHaveAttribute("aria-disabled", "true");
      await expect.poll(() => draftRequests.length).toBe(initialLoads + 1);
      // Pressing it again while it retries sends nothing more.
      await page.keyboard.press("Enter");
      hold.release();
      await expect(retry).toHaveText("Try again");
      await expect(retry).toBeFocused();
      await expect(alert).toHaveText("We couldn’t load your drafts.");
      expect(await firstAlert?.evaluate((node) => node.isConnected)).toBe(
        false,
      );
      // A request sent now reaches the route after any the presses sent.
      await page.evaluate(() =>
        fetch("/api/posts?status=published").then(() => undefined),
      );
      expect(draftRequests).toHaveLength(initialLoads + 1);

      // A retry that loads: focus lands on the Drafts panel, not the page.
      draftsLoad = true;
      hold = deferred();
      await page.keyboard.press("Space");
      await expect(retry).toHaveText("Trying again…");
      await expect(retry).toBeFocused();
      await expect.poll(() => draftRequests.length).toBe(initialLoads + 2);
      hold.release();
      await expect(
        draftsPanel.getByRole("heading", { name: DRAFT_UPDATES[0]!.title }),
      ).toBeVisible();
      await expect(
        draftsPanel.getByRole("heading", { name: DRAFT_UPDATES[1]!.title }),
      ).toBeVisible();
      await expect(retry).toHaveCount(0);
      await expect(draftsPanel).toBeFocused();
      expect(draftRequests).toHaveLength(initialLoads + 2);
      for (const url of draftRequests) {
        expect(new URL(url).searchParams.toString()).toBe("status=draft");
      }
      await attachJson(testInfo, "draft-requests", draftRequests);
      await snap(page, testInfo, `missionary-drafts-loaded-${viewport.label}`);
      expect(
        await axeViolations(page, testInfo, "missionary-feed-drafts"),
      ).toEqual([]);
    });
  }
});
