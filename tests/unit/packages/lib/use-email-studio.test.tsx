// @vitest-environment jsdom

import { act } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { render } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { DocumentScopeProvider } from "../../../../packages/database/document-scope";
import { useEmailTemplates } from "../../../../packages/lib/hooks/use-email-studio";

// WP2b, AL-2675: drafts are keyed by the document's person and tenant, and a
// document with no scope stores nothing (use-email-studio-scope.test.tsx).
// These cases run in a document with a scope and read that scope's key.
const SCOPE = {
  userId: "00000000-0000-4000-8000-0000000000a1",
  tenantId: "00000000-0000-0000-0000-000000000001",
  assignmentId: "00000000-0000-4000-8000-000000000101",
  addressPrefix: "/00000000-0000-0000-0000-000000000001",
};
const TEMPLATES_KEY = `email_studio_draft_templates::${SCOPE.userId}::${SCOPE.tenantId}`;

beforeAll(() => {
  // A scope is valid only inside its segment (council round 1, A8 and SB2), so
  // the page is at an address in it, as a signed-in page is.
  window.history.replaceState(null, "", SCOPE.addressPrefix);
  render(createElement(DocumentScopeProvider, { scope: SCOPE }, null));
});

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
      TEMPLATES_KEY,
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

  it("shares writes across hook instances without an effect round-trip", async () => {
    const { renderHook } = await import("@testing-library/react");
    const first = renderHook(() => useEmailTemplates());
    const second = renderHook(() => useEmailTemplates());

    expect(first.result.current.templates).toEqual([]);

    await act(async () => {
      await first.result.current.createTemplate("Welcome", { blocks: [] });
    });

    expect(first.result.current.templates.map((t) => t.name)).toEqual([
      "Welcome",
    ]);
    expect(second.result.current.templates.map((t) => t.name)).toEqual([
      "Welcome",
    ]);
    expect(
      JSON.parse(localStorage.getItem(TEMPLATES_KEY) ?? "[]"),
    ).toHaveLength(1);

    first.unmount();
    second.unmount();
  });

  it("appends concurrent same-tab creates onto the latest stored list", async () => {
    const { renderHook } = await import("@testing-library/react");
    const first = renderHook(() => useEmailTemplates());
    const second = renderHook(() => useEmailTemplates());

    const createFirst = first.result.current.createTemplate;
    const createSecond = second.result.current.createTemplate;

    await act(async () => {
      await Promise.all([
        createFirst("Welcome", { blocks: [] }),
        createSecond("Receipt", { blocks: [] }),
      ]);
    });

    const stored = JSON.parse(localStorage.getItem(TEMPLATES_KEY) ?? "[]") as {
      name: string;
    }[];
    expect(stored.map((template) => template.name).toSorted()).toEqual([
      "Receipt",
      "Welcome",
    ]);

    first.unmount();
    second.unmount();
  });
});
