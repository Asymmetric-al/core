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
/** The product contract at packages/ui/components/primitives/image-upload.tsx (acceptTypes). */
const ACCEPTED_TYPES = [
  ["JPEG", "image/jpeg"],
  ["PNG", "image/png"],
  ["WebP", "image/webp"],
  ["GIF", "image/gif"],
] as const;

type DemoAuthState = { available: true } | { available: false; reason: string };

let demoAuthState: DemoAuthState | null = null;

async function gotoDonorSettings(page: Page) {
  await page.goto("/donor-dashboard/settings");
  await expect(page.getByText("Public Avatar")).toBeVisible();
  await expect(page.getByRole("button", { name: /upload new/i })).toBeVisible();
}

/** Opens the "Crop Image" dialog from Upload New; a missing fixture fails the test. */
async function openAvatarCropper(page: Page) {
  expect(
    fs.existsSync(TEST_IMAGE_PATH),
    `fixture missing: ${TEST_IMAGE_PATH}`,
  ).toBe(true);

  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: /upload new/i }).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(TEST_IMAGE_PATH);

  const dialog = page.getByRole("dialog", { name: "Crop Image" });
  await expect(dialog).toBeVisible({ timeout: 5000 });
  return dialog;
}

/** What the "Upload public avatar" trigger renders: the image src, or the initials fallback. */
async function observeAvatar(page: Page) {
  const trigger = page.getByRole("button", { name: "Upload public avatar" });
  await expect(trigger).toBeVisible();

  const image = trigger.locator("img");
  const src =
    (await image.count()) > 0 ? await image.first().getAttribute("src") : null;
  const text = ((await trigger.textContent()) ?? "").trim();
  expect(src || text, "the avatar shows an image or initials").toBeTruthy();
  return { src, text };
}

async function getDemoAuthState(
  request: APIRequestContext,
): Promise<DemoAuthState> {
  if (demoAuthState) return demoAuthState;

  const availabilityRes = await request.get("/api/auth/demo-account");
  if (!availabilityRes.ok()) {
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

/** Required setup is broken: fail under CI (the smoke gate), skip locally. */
function requireDemoSetup(reason: string) {
  if (process.env.CI) {
    throw new Error(`Required E2E setup unavailable: ${reason}`);
  }
  test.skip(true, reason);
}

test.beforeEach(async ({ page }, testInfo) => {
  const suiteName = testInfo.titlePath[1] ?? "";
  if (AUTH_OPTIONAL_SUITES.has(suiteName)) {
    return;
  }

  const authState = await getDemoAuthState(page.request);
  if (!authState.available) {
    requireDemoSetup(authState.reason);
  }

  // Same-origin fetch + credentials so Set-Cookie applies to the browser context.
  const { ok, status } = await installDemoSessionInBrowser(page, "donor");
  if (!ok) {
    requireDemoSetup(`Demo donor session install failed (${status})`);
  }
});

test.describe("Image Upload and Crop Flow", () => {
  test("should open cropper dialog when image is selected", async ({
    page,
  }) => {
    await gotoDonorSettings(page);

    const dialog = await openAvatarCropper(page);
    await expect(dialog.getByText("Crop Image")).toBeVisible();
  });

  test("should close cropper and preserve original state on cancel", async ({
    page,
  }) => {
    // The demo avatar is a remote Unsplash URL and Avatar.Image renders the <img>
    // only once it loads; blocking it keeps the initials fallback stable between
    // the before/after observations and removes the outside-network dependency.
    await page.route("https://images.unsplash.com/**", (route) =>
      route.abort(),
    );
    await gotoDonorSettings(page);

    const uploadRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/api/upload/image")) {
        uploadRequests.push(request.url());
      }
    });
    const avatarBefore = await observeAvatar(page);

    const dialog = await openAvatarCropper(page);
    const cancelButton = dialog.getByRole("button", { name: /cancel/i });
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();

    await expect(dialog).not.toBeVisible({ timeout: 3000 });
    expect(await observeAvatar(page)).toEqual(avatarBefore);
    expect(uploadRequests).toEqual([]);
    await expect(page.getByText("Image uploaded successfully")).toHaveCount(0);
  });

  test("should show error for invalid file type", async ({ page }) => {
    await gotoDonorSettings(page);

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: "not-an-image.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("This is not an image"),
    });

    await expect(page.getByText(/Unsupported file type/)).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByRole("dialog")).toBeHidden();
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

    const dialog = await openAvatarCropper(page);

    // Base UI sliders use a native range input (implicit ARIA role), so
    // query by accessible role rather than an explicit role attribute.
    const sliders = dialog.getByRole("slider");
    await expect(sliders).toHaveCount(2);

    await expect(
      dialog.getByRole("button", { name: /apply crop/i }),
    ).toBeVisible();
    await expect(dialog.getByRole("button", { name: /cancel/i })).toBeVisible();

    await dialog.getByRole("button", { name: /cancel/i }).click();
  });

  test("should support drag and drop", async ({ page }) => {
    await gotoDonorSettings(page);

    const imageBase64 = fs.readFileSync(TEST_IMAGE_PATH).toString("base64");
    // The ImageUpload root (the file input's parent) owns the drag handlers.
    const uploadRoot = page.locator('input[type="file"]').first().locator("..");
    const dataTransfer = await page.evaluateHandle((base64) => {
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const transfer = new DataTransfer();
      transfer.items.add(
        new File([bytes], "test-image.png", { type: "image/png" }),
      );
      return transfer;
    }, imageBase64);

    await uploadRoot.dispatchEvent("dragover", { dataTransfer });
    await uploadRoot.dispatchEvent("drop", { dataTransfer });

    await expect(
      page.getByRole("dialog", { name: "Crop Image" }),
    ).toBeVisible();
  });

  test("mobile viewport should show responsive cropper", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await gotoDonorSettings(page);

    const dialog = await openAvatarCropper(page);

    const dialogBox = await dialog.boundingBox();
    expect(dialogBox, "the cropper dialog has a bounding box").not.toBeNull();
    expect(dialogBox?.width).toBeLessThanOrEqual(375);

    await dialog.getByRole("button", { name: /cancel/i }).click();
  });
});

test.describe("Image Upload Validation", () => {
  test("file input accepts exactly the supported image types", async ({
    page,
  }) => {
    await gotoDonorSettings(page);

    const fileInput = page.locator('input[type="file"]').first();
    const acceptAttr = await fileInput.getAttribute("accept");
    expect(acceptAttr, "the file input has an accept attribute").not.toBeNull();
    const accepted = (acceptAttr ?? "")
      .split(",")
      .map((type) => type.trim())
      .filter(Boolean);

    for (const [label, type] of ACCEPTED_TYPES) {
      await test.step(`accepts ${label} (${type})`, async () => {
        expect.soft(accepted, `${label} is accepted`).toContain(type);
      });
    }
    expect([...accepted].sort()).toEqual(
      ACCEPTED_TYPES.map(([, type]) => type).sort(),
    );
  });
});

test.describe("Large File Upload", () => {
  test("settings copy advertises large-file auto-optimization", async ({
    page,
  }) => {
    await gotoDonorSettings(page);

    await expect(page.getByText(/large files auto-optimized/i)).toBeVisible();
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
