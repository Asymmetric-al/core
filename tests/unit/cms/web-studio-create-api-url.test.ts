import { describe, expect, it } from "vitest";

import { buildWebStudioCreateFromTemplateUrl } from "../../../apps/admin/src/cms-ui/web-studio/flows/web-studio-create-api";

describe("buildWebStudioCreateFromTemplateUrl", () => {
  it("builds Payload REST path under the configured api route", () => {
    const url = buildWebStudioCreateFromTemplateUrl({ apiRoute: "/api" });
    expect(url).toContain("/api");
    expect(url).toContain("web-studio/create-from-template");
  });

  it("follows Payload's REST routes under /web-studio/api (AL-2675, WP2b slice C)", () => {
    expect(
      buildWebStudioCreateFromTemplateUrl({ apiRoute: "/web-studio/api" }),
    ).toBe("/web-studio/api/web-studio/create-from-template");
  });
});
