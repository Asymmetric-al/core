import { type Page, test } from "@playwright/test";

import { textMatchesPayloadDbFailure } from "./lib/payload-db-failure";

const SKIP_REASON =
  "Payload cannot reach Postgres. Use a Supavisor session pooler URL in PAYLOAD_DATABASE_URI on IPv4-only hosts, or run `supabase start` for 127.0.0.1:54322.";
const MISSING_PROOF_USER_REASON =
  "Payload CMS proof user is not available in this environment. Provide a Supabase-backed staff/admin session to assert the authenticated native shell.";

type PayloadDbGetter = () => boolean;

const payloadDbGetterByPage = new WeakMap<Page, PayloadDbGetter>();

export function attachPayloadDbConsoleListener(page: Page): PayloadDbGetter {
  const existing = payloadDbGetterByPage.get(page);
  if (existing) {
    return existing;
  }

  let sawPayloadDbFailure = false;
  const onConsole = (msg: { text: () => string }) => {
    const t = msg.text();
    if (textMatchesPayloadDbFailure(t)) {
      sawPayloadDbFailure = true;
    }
  };
  const onPageError = (err: Error) => {
    if (textMatchesPayloadDbFailure(String(err))) {
      sawPayloadDbFailure = true;
    }
  };
  page.on("console", onConsole);
  page.on("pageerror", onPageError);
  const getter = () => sawPayloadDbFailure;
  payloadDbGetterByPage.set(page, getter);
  return getter;
}

/**
 * Skip the current test when the admin app rendered a Payload DB connection failure.
 * Use after navigation to a Payload-backed route (for example Web Studio).
 */
export async function skipIfPayloadDatabaseUnreachable(page: Page) {
  const html = await page.content();
  const bodyText = await page
    .locator("body")
    .innerText()
    .catch(() => "");
  if (textMatchesPayloadDbFailure(`${html}\n${bodyText}`)) {
    test.skip(true, SKIP_REASON);
  }
}

/**
 * After landing on a Web Studio route, either the native shell appears or Postgres is down.
 * Skips the test when Payload cannot initialize (no flaky timeouts on missing shell).
 */
export async function waitForWebStudioShellOrSkip(
  page: Page,
  sawFailureViaConsole?: () => boolean,
) {
  const consoleGetter =
    sawFailureViaConsole ?? attachPayloadDbConsoleListener(page);
  const shell = page.getByTestId("web-studio-native-shell");
  const failure = page.getByText(/cannot connect to Postgres/i);
  const payloadLogin = page.getByText(/Site Studio\s+CMS/i);

  await Promise.race([
    shell.waitFor({ state: "visible", timeout: 30_000 }),
    failure.waitFor({ state: "visible", timeout: 30_000 }),
    payloadLogin.waitFor({ state: "visible", timeout: 30_000 }),
  ]).catch(() => {});

  if (consoleGetter()) {
    test.skip(true, SKIP_REASON);
  }

  await skipIfPayloadDatabaseUnreachable(page);

  const shellVisible = await shell.isVisible().catch(() => false);
  const bodyText = await page
    .locator("body")
    .innerText()
    .catch(() => "");
  const html = await page.content().catch(() => "");
  const textHaystack = `${html}\n${bodyText}`;
  const payloadLoginVisible =
    (await payloadLogin.isVisible().catch(() => false)) ||
    (textHaystack.includes("Site Studio") && textHaystack.includes("CMS"));

  if (!shellVisible && payloadLoginVisible) {
    test.skip(true, MISSING_PROOF_USER_REASON);
  }

  if (!shellVisible) {
    throw new Error(
      "Web Studio native shell did not render within the timeout without a confirmed Payload DB outage. Treat this as a real regression, not a skip.",
    );
  }
}
