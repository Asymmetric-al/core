import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const root = new URL("../../../", import.meta.url);

function readRepoFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

describe("donor high-complexity extraction contracts", () => {
  it("keeps settings ProfileTab on loading, error, photo, and details siblings", () => {
    const source = readRepoFile(
      "apps/donor/app/(dashboard)/donor-dashboard/settings/page-client.tsx",
    );

    expect(source).toContain("type ProfileFormFields = {");
    expect(source).toContain("function TabLoading(");
    expect(source).toContain("function TabError(");
    expect(source).toContain("function PhotoCard(");
    expect(source).toContain("function DetailsCard(");
    expect(source).toContain("function ProfileTab() {");
    expect(source).toContain("void handleSave();");

    const profileTab = source.slice(
      source.indexOf("function ProfileTab() {"),
      source.indexOf("function PreferenceSwitch("),
    );
    expect(profileTab).toContain("buildProfileFormState({");
    expect(profileTab).toContain("<TabLoading");
    expect(profileTab).toContain("<TabError");
    expect(profileTab).toContain("<PhotoCard");
    expect(profileTab).toContain("<DetailsCard");
    // The form fields live in DetailsCard, not in the tab itself.
    expect(profileTab).not.toContain('htmlFor="firstName"');
  });
});
