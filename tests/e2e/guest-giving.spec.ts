import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import AxeBuilder from "@axe-core/playwright";
import {
  expect,
  test,
  type Locator,
  type Page,
  type Request,
} from "@playwright/test";
import pg from "pg";

import {
  createGivingWorld,
  givingCounts,
  givingReadback,
  journeyAccounts,
  origin,
  removeGivingWorld,
  stubStripeAtTheNetwork,
  waitForChallenge,
  type GivingAccounts,
  type GivingWorld,
} from "./helpers/guest-giving";

const DB_URL = process.env.GUEST_GIVING_E2E_DB_URL ?? "";
const LEVEL_2 = process.env.GIVING_STRIPE_TEST_PROOF === "1";
const EVIDENCE = process.env.GIVING_PROOF_EVIDENCE_DIR ?? "";

const WORDS = {
  notStarted:
    "Your payment didn't start, and your card wasn't charged. Please try again.",
  oneEntity:
    "Each gift goes to one legal entity of this ministry. Designations of different entities need separate gifts.",
  received: "Your gift was received.",
  claim: "Verify your email to claim your giving history.",
  lostConnection:
    "We lost the connection before we could confirm your payment. Reload this page to see whether your gift went through before you try again.",
  monthly:
    "Monthly giving isn't available online yet. You can give once now instead.",
  configUnavailable:
    "We can't take this gift online right now. It may be the designation you chose, or online giving may be paused. You haven't been charged.",
  declined:
    "Your card was declined, and you haven't been charged. Check the card details or try another card.",
};

let db: pg.Client;
let world: GivingWorld;

function proofAccounts(): GivingAccounts {
  return {
    A1: process.env.GIVING_PROOF_ACCOUNT_A1 ?? "",
    A2: process.env.GIVING_PROOF_ACCOUNT_A2 ?? "",
    B1: process.env.GIVING_PROOF_ACCOUNT_B1 ?? "",
  };
}

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  test.skip(
    !DB_URL,
    "GUEST_GIVING_E2E_DB_URL names the local stack's database",
  );
  db = new pg.Client({ connectionString: DB_URL });
  await db.connect();
  world = await createGivingWorld(
    db,
    LEVEL_2 ? proofAccounts() : journeyAccounts(),
  );
});

test.afterAll(async () => {
  if (!db) return;
  try {
    if (world && LEVEL_2 && EVIDENCE)
      writeFileSync(
        path.join(EVIDENCE, "db-readback.json"),
        JSON.stringify(await givingReadback(db, world), null, 2),
      );
    if (world) await removeGivingWorld(db, world);
  } finally {
    await db.end();
  }
});

const checkoutUrl = (host: string, query: string) =>
  `${origin(host)}/checkout?${query}`;

function donatePosts(page: Page) {
  const posts: Array<Record<string, unknown>> = [];
  page.on("request", (request: Request) => {
    if (
      request.method() === "POST" &&
      new URL(request.url()).pathname === "/api/donate"
    )
      posts.push(JSON.parse(request.postData() ?? "{}"));
  });
  return posts;
}

type Challenged = Window & {
  turnstile?: { reset: (widget?: string) => void };
  __resets?: number;
};

async function countResets(page: Page) {
  await page.waitForFunction(
    () => Boolean((window as Challenged).turnstile),
    undefined,
    { timeout: 120_000 },
  );
  await page.evaluate(() => {
    const counted = window as Challenged;
    const api = counted.turnstile!;
    const reset = api.reset.bind(api);
    counted.__resets = 0;
    api.reset = (widget?: string) => {
      counted.__resets = (counted.__resets ?? 0) + 1;
      return reset(widget);
    };
  });
}

async function typeGuest(page: Page, email: string) {
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("First name").fill("Ada");
  await page.getByLabel("Last name").fill("Lovelace");
}

test.describe("Guest giving with the switch on (Level 1: Stripe.js stubbed at the network)", () => {
  test.skip(LEVEL_2, "Level 2 runs the real Payment Element instead");

  let escaped: string[] = [];
  test.beforeEach(async ({ page }) => {
    escaped = await stubStripeAtTheNetwork(page);
  });
  test.afterEach(() => {
    expect(escaped, "no request left for Stripe").toEqual([]);
  });

  test("a website-only name asks only for email, name, Stripe's element and an unticked anonymity choice, and loads Stripe on the connected account with cards only", async ({
    page,
  }) => {
    await page.goto(
      checkoutUrl(world.hosts.siteA, `fund_id=${world.funds.A1}&amount=25`),
    );
    await expect(page.getByText(WORDS.oneEntity)).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("First name")).toBeVisible();
    await expect(page.getByLabel("Last name")).toBeVisible();
    await expect(
      page.getByRole("checkbox", {
        name: "Give anonymously to the missionary and the public",
      }),
    ).not.toBeChecked();
    await expect(page.getByTestId("stripe-stub-payment")).toBeVisible();
    for (const absent of [/country/i, /postal/i, /zip/i, /bank/i, /wallet/i])
      await expect(page.getByLabel(absent)).toHaveCount(0);
    await expect(
      page.locator('meta[name="referrer"][content="no-referrer"]'),
    ).toHaveCount(1);
    const stub = await page.evaluate(
      () =>
        (
          window as Window & {
            __stripeStub?: {
              loads: Array<{ key: string; options: Record<string, unknown> }>;
              elements: Array<Record<string, unknown>>;
            };
          }
        ).__stripeStub,
    );
    expect(stub?.loads[0]?.options).toEqual({
      stripeAccount: world.accounts.A1,
    });
    expect(stub?.elements[0]).toMatchObject({
      mode: "payment",
      currency: "usd",
      amount: 2500,
      allowedPaymentMethodTypes: ["card"],
    });
    await page.getByLabel("Email").focus();
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("First name")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("Last name")).toBeFocused();
    const scan = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .exclude("iframe")
      .analyze();
    expect(
      scan.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      ),
    ).toEqual([]);
  });

  test("Give creates one gift under one key; a first send that cannot start says so, asks for a fresh challenge, and the next Give sends the same key", async ({
    page,
  }) => {
    const before = await givingCounts(db, world.tenants.A);
    const posts = donatePosts(page);
    await page.goto(
      checkoutUrl(world.hosts.siteA, `fund_id=${world.funds.A1}&amount=30`),
    );
    await countResets(page);
    await typeGuest(page, `guest-${Date.now()}@example.test`);
    await waitForChallenge(page);
    expect(posts).toHaveLength(0);
    await page.getByRole("button", { name: /^Give \$/ }).click();
    await expect(page.getByText(WORDS.notStarted)).toBeVisible();
    await page.waitForFunction(
      () => ((window as Challenged).__resets ?? 0) >= 1,
    );
    await waitForChallenge(page);
    await page.getByRole("button", { name: /^Give \$/ }).click();
    await expect.poll(() => posts.length).toBe(2);
    await expect(page.getByText(WORDS.notStarted)).toBeVisible();
    expect(posts[1]?.key).toBe(posts[0]?.key);
    expect(posts[0]).toMatchObject({
      paymentMethod: "card",
      isAnonymous: false,
      surface: "website",
    });
    expect(Object.keys(posts[0]?.contact as object).sort()).toEqual([
      "email",
      "firstName",
      "lastName",
    ]);
    const after = await givingCounts(db, world.tenants.A);
    expect(after.gifts - before.gifts).toBe(1);
    expect(after.keys - before.keys).toBe(1);
    expect(after.requests - before.requests).toBe(1);
  });

  test("two pages of one browser with the same gift send one key: one gift", async ({
    page,
  }) => {
    const before = await givingCounts(db, world.tenants.A);
    const second = await page.context().newPage();
    const url = checkoutUrl(
      world.hosts.siteA,
      `fund_id=${world.funds.A1}&amount=40`,
    );
    const firstPosts = donatePosts(page);
    const secondPosts = donatePosts(second);
    const email = `tabs-${Date.now()}@example.test`;
    for (const tab of [page, second]) {
      await tab.goto(url);
      await typeGuest(tab, email);
      await waitForChallenge(tab);
    }
    await page.getByRole("button", { name: /^Give \$/ }).click();
    await expect(page.getByText(WORDS.notStarted)).toBeVisible();
    await second.getByRole("button", { name: /^Give \$/ }).click();
    await expect(second.getByText(WORDS.notStarted)).toBeVisible();
    expect(firstPosts).toHaveLength(1);
    expect(secondPosts).toHaveLength(1);
    expect(secondPosts[0]?.key).toBe(firstPosts[0]?.key);
    const after = await givingCounts(db, world.tenants.A);
    expect(after.gifts - before.gifts).toBe(1);
    expect(after.keys - before.keys).toBe(1);
    await second.close();
  });

  test("a monthly link says monthly is unavailable and shows a payment only after Give once instead", async ({
    page,
  }) => {
    await page.goto(
      checkoutUrl(
        world.hosts.siteA,
        `fund_id=${world.funds.A1}&amount=20&frequency=monthly`,
      ),
    );
    await expect(page.getByText(WORDS.monthly)).toBeVisible();
    await expect(page.getByRole("button", { name: /^Give \$/ })).toHaveCount(0);
    await page.getByRole("button", { name: "Give once instead" }).click();
    await expect(page.getByRole("button", { name: /^Give \$/ })).toBeVisible();
  });

  test("a designation of another organization gets no account and no payment", async ({
    page,
  }) => {
    await page.goto(
      checkoutUrl(world.hosts.siteA, `fund_id=${world.funds.B1}&amount=20`),
    );
    await expect(page.getByText(WORDS.configUnavailable)).toBeVisible();
    await expect(page.getByRole("button", { name: /^Give \$/ })).toHaveCount(0);
  });

  test("the thank-you says only that the gift was received, and a reload reads the payment's state from Stripe.js without asking our server", async ({
    page,
  }) => {
    const heldSecret = ["pi_journey", "secret", "held"].join("_");
    await page.addInitScript(() => {
      (window as Window & { __stripeStubPlan?: unknown }).__stripeStubPlan = {
        confirm: { error: { type: "api_connection_error" } },
        retrieve: { paymentIntent: { status: "succeeded" } },
      };
    });
    await page.route("**/api/donate", (route) =>
      route.request().method() === "POST"
        ? route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              intakeId: "00000000-0000-4000-8000-000000000001",
              clientSecret: heldSecret,
              connectedAccountId: world.accounts.A1,
              amountCents: 2000,
            }),
          })
        : route.continue(),
    );
    const sent: string[] = [];
    page.on("request", (request) => {
      if (new URL(request.url()).hostname.endsWith(".localhost"))
        sent.push(`${request.url()} ${request.postData() ?? ""}`);
    });
    await page.goto(
      checkoutUrl(world.hosts.siteA, `fund_id=${world.funds.A1}&amount=20`),
    );
    await typeGuest(page, `thanks-${Date.now()}@example.test`);
    await waitForChallenge(page);
    await page.getByRole("button", { name: /^Give \$/ }).click();
    await expect(page.getByText(WORDS.lostConnection)).toBeVisible();
    await expect(page.getByText(WORDS.received)).toHaveCount(0);
    await page.reload();
    await expect(page.getByText(WORDS.received)).toBeVisible();
    await expect(page.getByText(WORDS.claim)).toBeVisible();
    expect(
      await page.evaluate(
        () =>
          (window as Window & { __stripeStub?: { retrieves: number } })
            .__stripeStub?.retrieves ?? 0,
      ),
    ).toBeGreaterThanOrEqual(1);
    expect(sent.filter((line) => line.includes(heldSecret))).toEqual([]);
    expect(page.url()).not.toContain("secret");
  });
});

async function enterCard(page: Page, number: string) {
  const frame = page
    .frameLocator('iframe[title="Secure payment input frame"]')
    .first();
  await frame.locator('input[name="number"]').fill(number);
  await frame.locator('input[name="expiry"]').fill("12 / 34");
  await frame.locator('input[name="cvc"]').fill("123");
  const postal = frame.locator('input[name="postalCode"]');
  if (await postal.count()) await postal.fill("10001");
}

async function completeCardCheck(page: Page) {
  const held: { button?: Locator } = {};
  await expect
    .poll(
      async () => {
        for (const frame of page.frames()) {
          const button = frame.getByRole("button", { name: /complete/i });
          if (await button.count().catch(() => 0)) {
            held.button = button.first();
            return true;
          }
        }
        return false;
      },
      { timeout: 120_000 },
    )
    .toBe(true);
  await held.button!.click();
}

async function shot(page: Page, name: string) {
  if (!EVIDENCE) return;
  mkdirSync(path.join(EVIDENCE, "screenshots"), { recursive: true });
  await page.screenshot({
    path: path.join(EVIDENCE, "screenshots", `${name}.png`),
    fullPage: true,
  });
}

async function giveWithCard(
  page: Page,
  url: string,
  email: string,
  card: string,
) {
  await page.goto(url);
  await typeGuest(page, email);
  await enterCard(page, card);
  await waitForChallenge(page);
  await page.getByRole("button", { name: /^Give \$/ }).click();
}

test.describe("Level 2: the real Payment Element on Stripe TEST accounts", () => {
  test.skip(process.env.GIVING_STRIPE_TEST_PROOF !== "1", "opt-in only");

  test("C01 a guest gives on a website-only name and on the home @level2", async ({
    page,
  }) => {
    for (const host of [world.hosts.siteA, world.hosts.homeA]) {
      await giveWithCard(
        page,
        checkoutUrl(host, `fund_id=${world.funds.A1}&amount=11`),
        `c01-${Date.now()}@example.test`,
        "4242424242424242",
      );
      await expect(page.getByText(WORDS.received)).toBeVisible({
        timeout: 120_000,
      });
      await shot(page, `c01-${host.split(".")[0]}`);
    }
  });

  test("C05 a designation of the second entity pays on that entity's account @level2", async ({
    page,
  }) => {
    await giveWithCard(
      page,
      checkoutUrl(world.hosts.siteA, `fund_id=${world.funds.A2}&amount=12`),
      `c05-${Date.now()}@example.test`,
      "4242424242424242",
    );
    await expect(page.getByText(WORDS.received)).toBeVisible({
      timeout: 120_000,
    });
    await shot(page, "c05-second-entity");
  });

  test("C07 a designation of another organization is refused before any payment @level2", async ({
    page,
  }) => {
    await page.goto(
      checkoutUrl(world.hosts.siteA, `fund_id=${world.funds.B1}&amount=13`),
    );
    await expect(page.getByText(WORDS.configUnavailable)).toBeVisible();
    await shot(page, "c07-other-organization");
  });

  test("C17 two tabs with one gift make one payment @level2", async ({
    page,
  }) => {
    const second = await page.context().newPage();
    const url = checkoutUrl(
      world.hosts.siteA,
      `fund_id=${world.funds.A1}&amount=14`,
    );
    const email = `c17-${Date.now()}@example.test`;
    const firstPosts = donatePosts(page);
    const secondPosts = donatePosts(second);
    for (const tab of [page, second]) {
      await tab.goto(url);
      await typeGuest(tab, email);
      await waitForChallenge(tab);
    }
    await page.getByRole("button", { name: /^Give \$/ }).click();
    await second.getByRole("button", { name: /^Give \$/ }).click();
    await expect.poll(() => firstPosts.length + secondPosts.length).toBe(2);
    expect(secondPosts[0]?.key).toBe(firstPosts[0]?.key);
    await shot(page, "c17-first-tab");
    await shot(second, "c17-second-tab");
    await second.close();
  });

  test("C24 a declined card keeps the payment open, and a good card on the same payment is received @level2", async ({
    page,
  }) => {
    await giveWithCard(
      page,
      checkoutUrl(world.hosts.siteA, `fund_id=${world.funds.A1}&amount=15`),
      `c24-${Date.now()}@example.test`,
      "4000000000000002",
    );
    await expect(page.getByText(WORDS.declined)).toBeVisible({
      timeout: 120_000,
    });
    await shot(page, "c24-declined");
    await enterCard(page, "4242424242424242");
    await waitForChallenge(page);
    await page.getByRole("button", { name: /^Give \$/ }).click();
    await expect(page.getByText(WORDS.received)).toBeVisible({
      timeout: 120_000,
    });
    await shot(page, "c24-retried");
  });

  test("C24 a card that asks for a check is received once the check passes @level2", async ({
    page,
  }) => {
    await giveWithCard(
      page,
      checkoutUrl(world.hosts.siteA, `fund_id=${world.funds.A1}&amount=16`),
      `c24-3ds-${Date.now()}@example.test`,
      "4000002500003155",
    );
    await completeCardCheck(page);
    await expect(page.getByText(WORDS.received)).toBeVisible({
      timeout: 120_000,
    });
    await shot(page, "c24-card-check");
  });
});
