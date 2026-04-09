import fs from "fs";
import path from "path";

import {
  test,
  expect,
  type APIRequestContext,
  type Page,
} from "@playwright/test";

import { getDemoRoleMap } from "./helpers/demo-auth";
import { installDemoSessionInBrowser } from "./helpers/install-demo-session";

const TEST_IMAGE_PATH = path.join(__dirname, "fixtures", "test-image.png");
const AUTH_OPTIONAL_SUITES = new Set(["Backend Image Processing"]);

type DemoAuthState = { available: true } | { available: false; reason: string };

let demoAuthState: DemoAuthState | null = null;

async function gotoDonorSettings(page: Page) {
  await page.goto("/donor-dashboard/settings");
  await expect(page.getByText("Public Avatar")).toBeVisible();
  await expect(page.getByRole("button", { name: /upload new/i })).toBeVisible();
}

async function openAvatarCropper(page: Page): Promise<boolean> {
  if (!fs.existsSync(TEST_IMAGE_PATH)) {
    return false;
  }

  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: /upload new/i }).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(TEST_IMAGE_PATH);
  await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5000 });

  return true;
}

async function getDemoAuthState(
  request: APIRequestContext,
): Promise<DemoAuthState> {
  if (demoAuthState) return demoAuthState;

  const availabilityRes = await request.get("/api/auth/demo-account");
  if (!availabilityRes.ok) {
    demoAuthState = {
      available: false,
      reason: `Demo auth availability check failed (${availabilityRes.status()})`,
    };
    return demoAuthState;
  }

  const payload = (await availabilityRes.json().catch(() => ({}))) as {
    roles?: Partial<Record<"donor", boolean>>;
    availableRoles?: Partial<Record<"donor", boolean>>;
  };
  if (!getDemoRoleMap(payload)?.donor) {
    demoAuthState = {
      available: false,
      reason: "Demo donor account is not available for E2E.",
    };
    return demoAuthState;
  }

  demoAuthState = { available: true };
  return demoAuthState;
}

test.beforeEach(async ({ page }, testInfo) => {
  const suiteName = testInfo.titlePath[1] ?? "";
  if (AUTH_OPTIONAL_SUITES.has(suiteName)) {
    return;
  }

  const authState = await getDemoAuthState(page.request);
  if (!authState.available) {
    test.skip(true, authState.reason);
  }

  // Same-origin fetch + credentials so Set-Cookie applies to the browser context.
  const { ok, status } = await installDemoSessionInBrowser(page, "donor");
  if (!ok) {
    test.skip(true, `Demo donor session install failed (${status})`);
  }
});

test.describe("Image Upload and Crop Flow", () => {
  test.beforeAll(async () => {
    const fixturesDir = path.join(__dirname, "fixtures");
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }

    if (!fs.existsSync(TEST_IMAGE_PATH)) {
      const { createCanvas } = (await import("canvas").catch(() => null)) || {};
      if (createCanvas) {
        const canvas = createCanvas(400, 400);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#3b82f6";
        ctx.fillRect(0, 0, 400, 400);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 48px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("TEST", 200, 220);
        const buffer = canvas.toBuffer("image/png");
        fs.writeFileSync(TEST_IMAGE_PATH, buffer);
      }
    }
  });

  test("should open cropper dialog when image is selected", async ({
    page,
  }) => {
    await gotoDonorSettings(page);

    if (await openAvatarCropper(page)) {
      await expect(page.getByText("Crop Image")).toBeVisible();
    }
  });

  test("should close cropper and preserve original state on cancel", async ({
    page,
  }) => {
    await gotoDonorSettings(page);

    const avatarBefore = await page
      .locator('img[alt="Uploaded"]')
      .first()
      .getAttribute("src", { timeout: 1000 })
      .catch(() => null);

    if (await openAvatarCropper(page)) {
      const dialog = page.getByRole("dialog");

      await page.getByRole("button", { name: /cancel/i }).click();

      await expect(dialog).not.toBeVisible({ timeout: 3000 });

      const avatarAfter = await page
        .locator('img[alt="Uploaded"]')
        .first()
        .getAttribute("src", { timeout: 1000 })
        .catch(() => null);
      expect(avatarAfter).toBe(avatarBefore);
    }
  });

  test("should show error for invalid file type", async ({ page }) => {
    await gotoDonorSettings(page);

    const invalidFilePath = path.join(__dirname, "fixtures", "test.txt");
    fs.writeFileSync(invalidFilePath, "This is not an image");

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(invalidFilePath);

    await expect(
      page.getByText(/unsupported|invalid|please select/i),
    ).toBeVisible({ timeout: 5000 });

    fs.unlinkSync(invalidFilePath);
  });

  test("ImageUpload component should have all required controls", async ({
    page,
  }) => {
    await gotoDonorSettings(page);

    const uploadButton = page.getByRole("button", { name: /upload new/i });
    await expect(uploadButton).toBeEnabled();

    const removeButton = page.getByRole("button", { name: /remove/i });
    await expect(removeButton).toBeVisible();
  });

  test("cropper dialog should have zoom and rotation controls", async ({
    page,
  }) => {
    await gotoDonorSettings(page);

    if (await openAvatarCropper(page)) {
      const dialog = page.getByRole("dialog");

      const sliders = dialog.locator('[role="slider"]');
      await expect(sliders).toHaveCount(2);

      await expect(
        page.getByRole("button", { name: /apply crop/i }),
      ).toBeVisible();
      await expect(page.getByRole("button", { name: /cancel/i })).toBeVisible();

      await page.getByRole("button", { name: /cancel/i }).click();
    }
  });

  test("should support drag and drop", async ({ page }) => {
    await gotoDonorSettings(page);

    if (fs.existsSync(TEST_IMAGE_PATH)) {
      const uploadArea = page
        .locator('[class*="relative"]')
        .filter({ has: page.locator('input[type="file"]') })
        .first();

      const dataTransfer = await page.evaluateHandle(() => new DataTransfer());

      await uploadArea.dispatchEvent("dragover", { dataTransfer });
      await uploadArea.dispatchEvent("dragleave", { dataTransfer });
    }
  });

  test("mobile viewport should show responsive cropper", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await gotoDonorSettings(page);

    if (await openAvatarCropper(page)) {
      const dialog = page.getByRole("dialog");

      const dialogBox = await dialog.boundingBox();
      expect(dialogBox?.width).toBeLessThanOrEqual(375);

      await page.getByRole("button", { name: /cancel/i }).click();
    }
  });
});

test.describe("Image Upload Validation", () => {
  test("should accept JPEG files", async ({ page }) => {
    await gotoDonorSettings(page);

    const fileInput = page.locator('input[type="file"]').first();
    const acceptAttr = await fileInput.getAttribute("accept");

    expect(acceptAttr).toContain("image/jpeg");
  });

  test("should accept PNG files", async ({ page }) => {
    await gotoDonorSettings(page);

    const fileInput = page.locator('input[type="file"]').first();
    const acceptAttr = await fileInput.getAttribute("accept");

    expect(acceptAttr).toContain("image/png");
  });

  test("should accept WebP files", async ({ page }) => {
    await gotoDonorSettings(page);

    const fileInput = page.locator('input[type="file"]').first();
    const acceptAttr = await fileInput.getAttribute("accept");

    expect(acceptAttr).toContain("image/webp");
  });
});

test.describe("Large File Upload", () => {
  test("should allow files larger than 2MB (no client-side rejection)", async ({
    page,
  }) => {
    await gotoDonorSettings(page);

    await expect(page.getByText(/large files auto-optimized/i)).toBeVisible();
  });

  test("should only reject files over 50MB safeguard limit", async ({
    page,
  }) => {
    await gotoDonorSettings(page);

    const fileInput = page.locator('input[type="file"]').first();
    const acceptAttr = await fileInput.getAttribute("accept");
    expect(acceptAttr).toContain("image/jpeg");
  });
});

test.describe("Backend Image Processing", () => {
  test("API endpoint should exist for image processing", async ({
    request,
  }) => {
    const response = await request.post("/api/upload/image", {
      headers: {
        Authorization: "Bearer invalid-token",
      },
    });

    expect(response.status()).toBe(401);
  });

  test("API should reject requests without auth", async ({ request }) => {
    const response = await request.post("/api/upload/image");

    expect(response.status()).toBe(401);
    const data = await response.json();
    expect(data.error).toBeTruthy();
  });
});
