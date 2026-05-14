import { describe, expect, it } from "vitest";

import {
  DEFAULT_MERGE_TAG_REGISTRY,
  getMergeTagDefinition,
  getMergeTagDefinitions,
  getMergeTagSamples,
  toLegacyUnlayerMergeTags,
} from "../../../../packages/email/merge-tags";

describe("@asym/email merge tag registry", () => {
  it("exposes first-class domain merge tags", () => {
    const keys = getMergeTagDefinitions().map((tag) => tag.key);

    expect(keys).toContain("first_name");
    expect(keys).toContain("donation_amount");
    expect(keys).toContain("unsubscribe_link");
    expect(keys).toContain("view_in_browser");
  });

  it("marks unsubscribe_link as an auto required URL tag", () => {
    expect(getMergeTagDefinition("unsubscribe_link")).toEqual(
      expect.objectContaining({
        type: "url",
        required: true,
        auto: true,
      }),
    );
  });

  it("provides sample values for previews", () => {
    const samples = getMergeTagSamples();

    expect(samples.first_name).toBe("John");
    expect(samples.unsubscribe_link).toMatch(/^https:\/\//);
  });

  it("can adapt the provider-neutral registry to legacy Unlayer merge tags", () => {
    const legacy = toLegacyUnlayerMergeTags(DEFAULT_MERGE_TAG_REGISTRY);

    expect(legacy.recipient?.mergeTags.first_name).toEqual({
      name: "First Name",
      value: "{{first_name}}",
      sample: "John",
    });
  });
});
