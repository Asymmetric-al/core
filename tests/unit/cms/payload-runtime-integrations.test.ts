import { describe, expect, it } from "vitest";

import * as integrations from "../../../apps/admin/src/cms/payload-runtime-integrations";
import {
  DEFAULT_PAYLOAD_EMAIL_FROM_ADDRESS,
  DEFAULT_PAYLOAD_EMAIL_FROM_NAME,
  resolvePayloadEmailAdapter,
} from "../../../apps/admin/src/cms/payload-runtime-integrations";

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

  it("configures no file storage adapter (D-18: WP6 part 2b drops Payload uploads and Vercel Blob; media is a plain record)", () => {
    expect(Object.keys(integrations).sort()).toEqual([
      "DEFAULT_PAYLOAD_EMAIL_FROM_ADDRESS",
      "DEFAULT_PAYLOAD_EMAIL_FROM_NAME",
      "resolvePayloadEmailAdapter",
    ]);
  });
});
