import { describe, expect, it } from "vitest";

import {
  DEFAULT_PAYLOAD_EMAIL_FROM_ADDRESS,
  DEFAULT_PAYLOAD_EMAIL_FROM_NAME,
  WEB_STUDIO_MEDIA_BLOB_PREFIX,
  createPayloadStorageAdapters,
  resolvePayloadEmailAdapter,
} from "../../../apps/admin/src/cms/payload-runtime-integrations";

import type { Config } from "payload";

const VALID_VERCEL_BLOB_TOKEN = "vercel_blob_rw_store123_token456";

describe("Payload runtime integrations", () => {
  it("keeps the Payload email adapter disabled until Resend is configured", () => {
    expect(resolvePayloadEmailAdapter({})).toBeUndefined();
  });

  it("configures Payload auth email through Resend when the key is available", () => {
    const adapterFactory = resolvePayloadEmailAdapter({
      RESEND_API_KEY: "re_test_key",
    });

    expect(adapterFactory).toBeDefined();

    const adapter = adapterFactory?.({ payload: {} as never });
    expect(adapter).toMatchObject({
      defaultFromAddress: DEFAULT_PAYLOAD_EMAIL_FROM_ADDRESS,
      defaultFromName: DEFAULT_PAYLOAD_EMAIL_FROM_NAME,
      name: "resend-rest",
    });
  });

  it("allows environment-specific Payload email sender overrides", () => {
    const adapterFactory = resolvePayloadEmailAdapter({
      PAYLOAD_EMAIL_FROM_ADDRESS: "studio@example.test",
      PAYLOAD_EMAIL_FROM_NAME: "Studio",
      RESEND_API_KEY: "re_test_key",
    });

    const adapter = adapterFactory?.({ payload: {} as never });
    expect(adapter).toMatchObject({
      defaultFromAddress: "studio@example.test",
      defaultFromName: "Studio",
    });
  });

  it("leaves upload collections untouched when no Blob token is configured", () => {
    const [adapter] = createPayloadStorageAdapters({});
    const baseConfig = createUploadConfig();

    expect(adapter.init(baseConfig)).toBe(baseConfig);
    expect(adapter).toMatchObject({
      collections: ["media"],
      name: "vercel-blob",
    });
  });

  it("uses Vercel Blob for Web Studio media uploads when the token is configured", () => {
    const [adapter] = createPayloadStorageAdapters({
      BLOB_READ_WRITE_TOKEN: VALID_VERCEL_BLOB_TOKEN,
    });

    const config = adapter.init(createUploadConfig());
    const media = config.collections?.find(
      (collection) => collection.slug === "media",
    );

    expect(media?.upload).toMatchObject({
      adapter: "vercel-blob",
      disableLocalStorage: true,
    });
    expect(media?.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          defaultValue: WEB_STUDIO_MEDIA_BLOB_PREFIX,
          name: "prefix",
        }),
        expect.objectContaining({
          name: "url",
        }),
      ]),
    );
  });
});

function createUploadConfig(): Config {
  return {
    collections: [
      {
        fields: [],
        slug: "media",
        upload: {
          staticDir: "media",
        },
      },
    ],
  } as Config;
}
