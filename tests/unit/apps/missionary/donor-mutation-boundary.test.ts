import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const root = new URL("../../../../", import.meta.url);

function readRepoFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

describe("missionary donor mutation boundary", () => {
  it("keeps donor activity and tag mutations behind the missionary API boundary", () => {
    const source = readRepoFile(
      "apps/missionary/app/donors/use-donors-page-view.tsx",
    );
    const mutationClient = readRepoFile(
      "apps/missionary/app/donors/donor-mutation-client.ts",
    );

    expect(source).not.toContain("createBrowserClient");
    expect(source).not.toContain('.from("donor_activities")');
    expect(source).not.toContain('.from("donors")');
    expect(source).toContain('from "./donor-mutation-client"');
    expect(mutationClient).toContain("/api/missionary/donors/");
  });

  it("keeps edit-donor mutations behind the missionary API boundary", () => {
    const source = readRepoFile(
      "apps/missionary/app/donors/edit-donor-dialog.tsx",
    );

    expect(source).not.toContain("createBrowserClient");
    expect(source).not.toContain('.from("donors")');
    expect(source).toContain('from "./donor-mutation-client"');
  });
});
