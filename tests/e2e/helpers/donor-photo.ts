import fs from "node:fs";
import path from "node:path";

import type { Page } from "@playwright/test";

/** Seed only the photo in the real portal response; no profile write is sent. */
export async function installDonorPhotoFixture(page: Page) {
  const image = fs.readFileSync(
    path.join(__dirname, "..", "fixtures", "test-image.png"),
  );
  const avatarUrl = `data:image/png;base64,${image.toString("base64")}`;
  await page.route("**/api/donor/portal", async (route) => {
    if (route.request().method() !== "GET") return route.fallback();
    const response = await route.fetch();
    if (!response.ok()) return route.fulfill({ response });
    const payload = await response.json();
    if (!payload.portal?.profile)
      throw new Error("The donor portal profile is missing.");
    await route.fulfill({
      response,
      json: {
        ...payload,
        portal: {
          ...payload.portal,
          profile: { ...payload.portal.profile, avatarUrl },
        },
      },
    });
  });
}
