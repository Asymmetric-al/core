// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { DocumentPreviewMenu } from "../../../../apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/document-preview-links";

afterEach(cleanup);

describe("Web Studio phone preview action", () => {
  it("opens the only preview directly instead of a one-item menu", () => {
    render(
      <DocumentPreviewMenu
        previewURL="/web-studio/preview/pages/42"
        publishedURL={null}
      />,
    );
    const link = screen.getByRole("link", {
      name: "Open preview (opens in a new tab)",
    });
    expect(link.getAttribute("href")).toBe("/web-studio/preview/pages/42");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("names the published page when it is the only link", () => {
    render(
      <DocumentPreviewMenu
        previewURL={null}
        publishedURL="https://give.example.org/about"
      />,
    );
    expect(
      screen
        .getByRole("link", { name: "Open published page (opens in a new tab)" })
        .getAttribute("href"),
    ).toBe("https://give.example.org/about");
  });

  it("keeps a menu when there are two places to open", async () => {
    render(
      <DocumentPreviewMenu
        previewURL="/web-studio/preview/pages/42"
        publishedURL="https://give.example.org/about"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Preview" }));
    expect(
      await screen.findByRole("menuitem", { name: /Open preview/ }),
    ).toBeTruthy();
    expect(
      screen.getByRole("menuitem", { name: /Open published page/ }),
    ).toBeTruthy();
  });

  it("renders nothing without a link", () => {
    const { container } = render(
      <DocumentPreviewMenu previewURL={null} publishedURL={null} />,
    );
    expect(container.innerHTML).toBe("");
  });
});
