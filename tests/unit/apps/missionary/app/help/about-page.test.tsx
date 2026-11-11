/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

const build = vi.hoisted(() => ({
  info: {
    ref: "develop",
    refSource: "fallback" as "env" | "fallback",
    displayRef: "develop",
    buildDate: undefined as string | undefined,
  },
}));

vi.mock("@asym/lib/build-info", () => ({
  getBuildInfo: () => build.info,
  getGitHubSourceTreeUrl: (ref: string) =>
    `https://github.com/Asymmetric-al/core/tree/${ref}`,
  getGitHubLicenseUrl: (ref: string) =>
    `https://github.com/Asymmetric-al/core/blob/${ref}/LICENSE`,
}));

// eslint-disable-next-line no-restricted-imports -- AL-1931: Server page rendered at its app boundary.
import AboutPage from "../../../../../../apps/missionary/app/help/about/page";

afterEach(cleanup);

it("explains the app in plain words and links its source and license", () => {
  render(<AboutPage />);
  expect(
    screen.getByRole("heading", { level: 1, name: "About this app" }),
  ).toBeTruthy();
  expect(
    screen
      .getByRole("link", { name: /View the source code/ })
      .getAttribute("href"),
  ).toBe("https://github.com/Asymmetric-al/core/tree/develop");
  expect(
    screen.getByRole("link", { name: /Read the license/ }).getAttribute("href"),
  ).toBe("https://github.com/Asymmetric-al/core/blob/develop/LICENSE");
  // No developer shorthand when the build didn't record its version.
  expect(screen.queryByText(/`|unknown/)).toBeNull();
  expect(screen.getByText("Development build")).toBeTruthy();
  expect(screen.queryByText("Built")).toBeNull();
});

it("shows the recorded version and build date when there is one", () => {
  build.info = {
    ref: "3f9c2b1aa",
    refSource: "env",
    displayRef: "3f9c2b1",
    buildDate: "2026-11-10",
  };
  render(<AboutPage />);
  expect(screen.getByText("3f9c2b1")).toBeTruthy();
  expect(screen.getByText("2026-11-10")).toBeTruthy();
});
