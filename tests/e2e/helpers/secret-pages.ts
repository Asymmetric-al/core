import type { BrowserContext, TestInfo } from "@playwright/test";

export async function closePagesAfterFailure(
  testInfo: TestInfo,
  context: BrowserContext,
): Promise<void> {
  if (testInfo.status === testInfo.expectedStatus) return;
  const refusals: unknown[] = [];
  for (const page of context.pages()) {
    try {
      await page.close({ runBeforeUnload: false });
    } catch (error) {
      refusals.push(error);
    }
  }
  if (refusals.length > 0) throw refusals[0];
}
