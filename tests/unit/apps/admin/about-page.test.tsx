// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import {
  getGitHubLicenseUrl,
  getGitHubSourceTreeUrl,
} from "@asym/lib/build-info";
import AboutPage from "../../../../apps/admin/app/(app)/help/about/page";

vi.mock("@asym/lib/build-info", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@asym/lib/build-info")>()),
  getBuildInfo: () => ({
    ref: "develop",
    displayRef: "develop",
    refSource: "fallback",
    buildDate: null,
  }),
}));
afterEach(cleanup);
it("names source and license links and announces new tabs without losing deployment disclosures", () => {
  render(<AboutPage />);
  for (const [name, href] of [
    [
      "View the source for this deployment (opens in a new tab)",
      getGitHubSourceTreeUrl("develop"),
    ],
    ["Read the license (opens in a new tab)", getGitHubLicenseUrl("develop")],
  ]) {
    const link = screen.getByRole("link", { name });
    expect(link.getAttribute("href")).toBe(href);
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noreferrer");
  }
  expect(screen.getByText("Mission Control, by asymmetric.al")).toBeTruthy();
  expect(screen.getByText("Not recorded")).toBeTruthy();
  expect(screen.getByText(/This build has no recorded commit/)).toBeTruthy();
  expect(screen.getByText("Warranty")).toBeTruthy();
  expect(
    screen.getByRole("heading", { level: 2, name: "Deployment" }),
  ).toBeTruthy();
});
