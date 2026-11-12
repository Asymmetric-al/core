// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DocumentReference } from "../../../../apps/admin/src/cms-ui/web-studio/collections/shared/list-workspace/document-reference";

const GRACE = "5b0c2a52-8f1e-4d0f-9a51-6f3e2b1c0a01";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("DocumentReference", () => {
  it("names the missionary a giving page is for, with the ID one copy away", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          missionaries: [{ id: GRACE, profile: { full_name: "Grace Okafor" } }],
        }),
      ),
    );
    render(<DocumentReference data={{ id: 1, missionaryId: GRACE }} />);

    await waitFor(() => expect(screen.getByText("Grace Okafor")).toBeTruthy());
    expect(screen.getByText(/^for/)).toBeTruthy();
    expect(
      screen.getByRole("button", { name: `Copy Missionary ID ${GRACE}` }),
    ).toBeTruthy();
  });

  it("keeps the short ID when the name cannot load", async () => {
    const fetchMock = vi.fn(
      async () => new Response("forbidden", { status: 403 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    render(<DocumentReference data={{ id: 1, fundId: GRACE }} />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(String(fetchMock.mock.calls[0]?.[0])).toMatch(
      /^\/api\/admin\/funds/,
    );
    expect(screen.getByText("5b0c2a52…0a01")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: `Copy Fund ID ${GRACE}` }),
    ).toBeTruthy();
  });

  it("renders nothing for a document without a reference", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { container } = render(
      <DocumentReference data={{ id: 1, title: "About us" }} />,
    );
    expect(container.textContent).toBe("");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
