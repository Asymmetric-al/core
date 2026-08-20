import { afterEach, describe, expect, it, vi } from "vitest";

import { persistEmailTemplate } from "../../../../../apps/admin/app/(app)/email/email-studio-api";

describe("persistEmailTemplate", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts React Email design JSON and exported HTML together", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        template: {
          id: "tmpl_1",
          name: "Welcome",
          subject: "Hello",
          preheader: "Preview",
          html: "<p>Hi</p>",
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const saved = await persistEmailTemplate(
      {
        id: null,
        name: "Welcome",
        subject: "Hello",
        preheader: "Preview",
      },
      {
        html: "<p>Hi</p>",
        text: "Hi",
        design: { blocks: [] },
      },
    );

    expect(saved.id).toBe("tmpl_1");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body));
    expect(body.builder).toBe("react_email");
    expect(body.category).toBe("campaign");
    expect(body.designJson).toEqual({ blocks: [] });
    expect(body.html).toBe("<p>Hi</p>");
  });
});
