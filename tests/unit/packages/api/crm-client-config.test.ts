import { describe, expect, it, vi } from "vitest";

import {
  loadTwentyClientConfig,
  resolveTwentyRuntimeConfig,
} from "../../../../packages/api/src/crm/client/config";
import { TwentyCoreClient } from "../../../../packages/api/src/crm/client/core";

describe("Twenty client configuration", () => {
  it("normalizes the Twenty Cloud REST base path and keeps workspace optional", () => {
    expect(
      resolveTwentyRuntimeConfig({
        TWENTY_API_KEY: "twenty-secret",
        TWENTY_API_URL: " https://api.twenty.com/rest/ ",
      }),
    ).toMatchObject({
      configured: true,
      apiBaseUrl: "https://api.twenty.com/rest",
      apiBaseUrlKind: "twenty_cloud_rest",
      hasWebhookSecret: false,
    });
  });

  it("reports missing and malformed Twenty env without leaking values", () => {
    expect(resolveTwentyRuntimeConfig({})).toMatchObject({
      configured: false,
      status: "missing",
      missing: ["TWENTY_API_URL", "TWENTY_API_KEY"],
      invalid: [],
    });

    const malformed = resolveTwentyRuntimeConfig({
      TWENTY_API_KEY: "twenty-secret",
      TWENTY_API_URL: "https://api.twenty.com",
    });

    expect(malformed).toMatchObject({
      configured: false,
      status: "invalid",
      missing: [],
      invalid: [
        {
          key: "TWENTY_API_URL",
          reason: "missing_rest_path",
        },
      ],
    });
    expect(JSON.stringify(malformed)).not.toContain("twenty-secret");
    expect(loadTwentyClientConfig({ TWENTY_API_URL: "not a url" })).toBeNull();
  });

  it("constructs object and metadata paths relative to the configured REST base", async () => {
    const fetchImpl = vi.fn(async () => Response.json({ data: [] }));
    const client = new TwentyCoreClient({
      apiBaseUrl: "https://api.twenty.com/rest",
      apiKey: "twenty-secret",
      fetchImpl,
    });

    await client.listRecords("giftSummaries", {
      filter: '{"asymTenantId":{"eq":"tenant-1"}}',
    });
    await client.request({
      method: "GET",
      path: "/metadata/objects",
    });

    expect(fetchImpl.mock.calls[0]?.[0]).toBe(
      "https://api.twenty.com/rest/giftSummaries?filter=%7B%22asymTenantId%22%3A%7B%22eq%22%3A%22tenant-1%22%7D%7D",
    );
    expect(fetchImpl.mock.calls[1]?.[0]).toBe(
      "https://api.twenty.com/rest/metadata/objects",
    );
  });
});
