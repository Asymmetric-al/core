// @vitest-environment jsdom

import { act } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useEmailTemplates } from "../../../../packages/lib/hooks/use-email-studio";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

function EmailTemplatesProbe() {
  const { templates } = useEmailTemplates();

  return <output>{templates.length}</output>;
}

describe("useEmailTemplates", () => {
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("hydrates before reading localStorage-backed templates", async () => {
    const originalWindow = window;
    vi.stubGlobal("window", undefined);
    const serverHtml = renderToString(<EmailTemplatesProbe />);

    vi.stubGlobal("window", originalWindow);
    localStorage.setItem(
      "email_studio_draft_templates",
      JSON.stringify([
        {
          id: "template-1",
          name: "Newsletter",
          builder: "react_email",
          builderVersion: "test",
          design: {},
          html: null,
          text: null,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
          status: "draft",
        },
      ]),
    );

    const container = document.createElement("div");
    container.innerHTML = serverHtml;
    const recoverableErrors: unknown[] = [];
    let root: Root | undefined;

    await act(async () => {
      root = hydrateRoot(container, <EmailTemplatesProbe />, {
        onRecoverableError(error) {
          recoverableErrors.push(error);
        },
      });
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(recoverableErrors).toEqual([]);
    expect(container.textContent).toBe("1");

    await act(async () => {
      root?.unmount();
    });
  });
});
