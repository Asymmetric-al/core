/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { WaysToGiveClient } from "../../../../apps/donor/app/(public)/(hero)/ways-to-give/ways-to-give-client";
import { Footer } from "../../../../packages/ui/components/public/footer";

afterEach(cleanup);

// The demo organization has no contact page, support inbox, phone line,
// stock-transfer desk or legacy team. A public call to action either leads
// somewhere real or isn't shown.
describe("Ways to Give", () => {
  it("only offers actions that lead somewhere", () => {
    render(<WaysToGiveClient />);
    expect(screen.queryAllByRole("button")).toEqual([]);
    const hrefs = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"));
    expect(hrefs).toEqual(["/workers", "/faq"]);
    expect(
      screen.getByRole("link", { name: /find a missionary/i }),
    ).toBeTruthy();
  });

  it("describes online giving as it works today", () => {
    render(<WaysToGiveClient />);
    expect(
      screen.getByText(
        "Give a one-time gift by card to the missionary you choose.",
      ),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Not available online yet" }),
    ).toBeTruthy();
  });

  it("makes no claims the site can't back", () => {
    const { container } = render(<WaysToGiveClient />);
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/\(555\)/);
    expect(text).not.toMatch(/crypto portal|with our tool|physical card/i);
    expect(text).not.toMatch(/recurring monthly partnership/i);
  });
});

describe("public footer", () => {
  it("links only to pages that exist, once each", () => {
    render(<Footer />);
    const hrefs = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"));
    expect(hrefs).not.toContain("/about#contact");
    // A bare /checkout has no recipient; giving starts from the directory.
    expect(hrefs).not.toContain("/checkout");
    expect(screen.getAllByRole("link", { name: /donor portal/i })).toHaveLength(
      1,
    );
  });
});
