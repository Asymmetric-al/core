import { beforeEach, describe, expect, it, vi } from "vitest";

const { env } = vi.hoisted(() => ({
  env: {
    NEXT_PUBLIC_UNLAYER_PROJECT_ID: undefined as string | undefined,
    NEXT_PUBLIC_UNLAYER_WHITE_LABEL: false,
  },
}));

vi.mock("@asym/env", () => ({ clientEnv: env }));

import { getPDFStudioSetupStatus } from "../../../../packages/config/pdf-studio";

describe("PDF Studio setup status", () => {
  beforeEach(() => {
    env.NEXT_PUBLIC_UNLAYER_PROJECT_ID = undefined;
    env.NEXT_PUBLIC_UNLAYER_WHITE_LABEL = false;
  });

  it("says a configured account still exports with the editor's branding until white-label is on", () => {
    env.NEXT_PUBLIC_UNLAYER_PROJECT_ID = "123456";

    const status = getPDFStudioSetupStatus();

    expect(status.status).toBe("configured");
    expect(status.message).toBe(
      "PDF Studio is configured. Exports keep the Unlayer editor's branding until white-label is enabled.",
    );
  });

  it("does not mention branding once white-label is enabled", () => {
    env.NEXT_PUBLIC_UNLAYER_PROJECT_ID = "123456";
    env.NEXT_PUBLIC_UNLAYER_WHITE_LABEL = true;

    const status = getPDFStudioSetupStatus();

    expect(status.status).toBe("white_label");
    expect(status.message).not.toMatch(/branding/i);
  });
});
