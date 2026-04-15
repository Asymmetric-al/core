import { describe, expect, it } from "vitest";

import { buildWebStudioCreateFromTemplateUrl } from "../../../apps/admin/src/cms-ui/web-studio/flows/web-studio-create-api";

describe("buildWebStudioCreateFromTemplateUrl", () => {
  it("builds Payload REST path under the configured api route", () => {
    const url = buildWebStudioCreateFromTemplateUrl({ apiRoute: "/api" });
    expect(url).toContain("/api");
    expect(url).toContain("web-studio/create-from-template");
  });
});
