import { describe, expect, it } from "vitest";

import {
  MISSIONARY_SETTINGS_HEADER_VT_NAME,
  MISSIONARY_SHELL_AVATAR_VT_NAME,
  crmRecordAvatarTransitionName,
  crmRecordTitleTransitionName,
  workerAvatarTransitionName,
  workerHeroImageTransitionName,
  workerTitleTransitionName,
} from "../../../../packages/lib/view-transitions/names";

describe("view-transitions/names", () => {
  it("builds stable worker transition names from ids", () => {
    expect(workerHeroImageTransitionName("w-1")).toBe("worker-hero:w-1");
    expect(workerAvatarTransitionName("w-1")).toBe("worker-avatar:w-1");
    expect(workerTitleTransitionName("w-1")).toBe("worker-title:w-1");
  });

  it("builds stable CRM record transition names from ids", () => {
    expect(crmRecordTitleTransitionName("r-99")).toBe("crm-record-title:r-99");
    expect(crmRecordAvatarTransitionName("r-99")).toBe(
      "crm-record-avatar:r-99",
    );
  });

  it("exposes fixed shell/settings name constants", () => {
    expect(MISSIONARY_SHELL_AVATAR_VT_NAME).toBe("missionary-shell-avatar");
    expect(MISSIONARY_SETTINGS_HEADER_VT_NAME).toBe(
      "missionary-settings-header",
    );
  });
});
