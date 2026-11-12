import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const settings = new URL(
  "../../../../../../apps/admin/app/(app)/support/settings/",
  import.meta.url,
);

function read(path: string): string {
  return readFileSync(new URL(path, settings), "utf8");
}

describe("Support settings tab titles", () => {
  // Each title names the page as its heading and the settings navigation do,
  // then the area; the root layout appends "| Mission Control".
  it.each([
    ["assignment", "Assignment rules"],
    ["automations", "Inbox rules"],
    ["business-hours", "Business hours"],
    ["canned-responses", "Canned responses"],
    ["collaborators", "Collaborators"],
    ["inbox", "Inbox identity"],
    ["labels", "Labels"],
    ["macros", "Macros"],
    ["notifications", "Notifications"],
    ["saved-views", "Saved views"],
    ["signatures", "Signatures"],
    ["sla", "SLA policies"],
  ])("titles the %s page", (segment, title) => {
    const source = read(`${segment}/page.tsx`);
    const metadata = source.match(
      /export const metadata:\s*Metadata\s*=\s*\{([\s\S]*?)\};/,
    );
    expect(metadata?.[1]).toContain(`title: "${title} · Support settings"`);
    // A client page can't export metadata.
    expect(source).not.toMatch(/^"use client"/);
    expect(source).not.toContain("<SupportWorkspaceShell");
  });

  it("keeps the settings clock, confirmation and navigation in the persistent layout", () => {
    expect(read("layout.tsx")).toContain("SupportSettingsLayout");
    expect(read("loading.tsx")).not.toContain("PageShell");
  });

  it("leaves the redirect-only settings root without a title", () => {
    expect(read("page.tsx")).not.toContain("metadata");
  });
});
