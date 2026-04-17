import { chromium, type FullConfig } from "@playwright/test";
import fs from "fs";
import path from "path";
import { adminBaseURL, donorBaseURL } from "./base-urls";

async function writeEmptyStorage(authFile: string) {
  const authDir = path.dirname(authFile);
  await fs.promises.mkdir(authDir, { recursive: true });
  await fs.promises.writeFile(
    authFile,
    JSON.stringify({ cookies: [], origins: [] }, null, 2),
  );
}

async function prepareAuthState({
  authFile,
  baseURL,
  email,
  password,
  destinationPattern,
  roleLabel,
}: {
  authFile: string;
  baseURL: string;
  email: string;
  password: string;
  destinationPattern: RegExp;
  roleLabel: string;
}) {
  await writeEmptyStorage(authFile);

  if (!email || !password) {
    console.warn(
      `[e2e] Set credentials for ${roleLabel} auth state. Using empty storage state at ${path.basename(authFile)}.`,
    );
    return;
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto(`${baseURL.replace(/\/$/, "")}/login`, {
      waitUntil: "domcontentloaded",
      timeout: 120_000,
    });
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL(destinationPattern, { timeout: 120_000 });
    await page.context().storageState({ path: authFile });
  } catch (error) {
    await writeEmptyStorage(authFile);
    throw error;
  } finally {
    await browser.close();
  }
}

export default async function globalSetup(_config: FullConfig) {
  const donorAuthFile = path.join(process.cwd(), ".auth", "donor.json");
  const adminAuthFile = path.join(process.cwd(), ".auth", "admin.json");

  // `run-with-ci-env.mjs` sets E2E_AUTH_BYPASS=true so apps accept the E2E cookie without
  // real Supabase password grants. Skip expensive (and often impossible) real logins.
  if (
    process.env.E2E_AUTH_BYPASS === "true" ||
    process.env.E2E_AUTH_BYPASS === "1"
  ) {
    await Promise.all([
      writeEmptyStorage(donorAuthFile),
      writeEmptyStorage(adminAuthFile),
    ]);
    return;
  }

  if (process.env.SKIP_E2E_AUTH === "1") {
    await Promise.all([
      writeEmptyStorage(donorAuthFile),
      writeEmptyStorage(adminAuthFile),
    ]);
    return;
  }

  await fs.promises.mkdir(path.dirname(donorAuthFile), { recursive: true });

  await prepareAuthState({
    authFile: donorAuthFile,
    baseURL: donorBaseURL,
    email: process.env.E2E_DONOR_EMAIL ?? process.env.DEMO_DONOR_EMAIL ?? "",
    password: process.env.E2E_DONOR_PASSWORD ?? process.env.DEMO_PASSWORD ?? "",
    destinationPattern: /donor-dashboard/,
    roleLabel: "donor",
  });

  await prepareAuthState({
    authFile: adminAuthFile,
    baseURL: adminBaseURL,
    email: process.env.E2E_ADMIN_EMAIL ?? process.env.DEMO_ADMIN_EMAIL ?? "",
    password: process.env.E2E_ADMIN_PASSWORD ?? process.env.DEMO_PASSWORD ?? "",
    destinationPattern: /\/(admin|contributions|feed|care)/,
    roleLabel: "admin",
  });
}
