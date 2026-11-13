import { afterEach, describe, expect, it, vi } from "vitest";

import {
  isSupportNotFoundError,
  supportApiGet,
  supportApiJson,
} from "../../../../../../apps/admin/features/support-hub/lib/api-client";

afterEach(() => vi.unstubAllGlobals());

describe("Support API error identity", () => {
  it.each([404, 403, 500])(
    "retains HTTP %s for GET and mutation failures",
    async (status) => {
      vi.stubGlobal(
        "fetch",
        vi.fn(
          async () =>
            new Response(JSON.stringify({ error: "Unable to load" }), {
              status,
            }),
        ),
      );
      for (const request of [
        () => supportApiGet("/test"),
        () => supportApiJson("/test", "POST", {}),
      ]) {
        const error = await request().catch((failure: unknown) => failure);
        expect(error).toMatchObject({ status, message: "Unable to load" });
        expect(isSupportNotFoundError(error)).toBe(status === 404);
      }
    },
  );
});
