// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import path from "node:path";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import * as homeSections from "../../../../packages/ui/components/public/home-sections";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));

afterEach(cleanup);

const SAMPLE = "Sample figures for this demo organization, not live totals.";
const repoRoot = path.resolve(__dirname, "../../../..");

describe("donor public site figures", () => {
  it("labels the impact ledger and project progress as sample figures", () => {
    render(<homeSections.HomeStats />);
    expect(screen.getByText(SAMPLE)).toBeTruthy();
    cleanup();
    render(<homeSections.HomeFeatured />);
    expect(screen.getByText(SAMPLE)).toBeTruthy();
  });

  it("has no invented live activity", () => {
    expect("LiveTicker" in homeSections).toBe(false);
    const home = readFileSync(
      path.join(repoRoot, "apps/donor/app/(public)/(hero)/page.tsx"),
      "utf8",
    );
    expect(home).not.toMatch(/LiveTicker/);

    render(<homeSections.HomeMission />);
    expect(screen.queryByText(/Live Deployment/i)).toBeNull();
    expect(screen.queryByText(/Real-Time Data/i)).toBeNull();
    expect(screen.queryByText(/under 4 hours/i)).toBeNull();
  });
});

describe("donor financials page", () => {
  it("labels its figures as samples and offers no documents it doesn't have", async () => {
    const { FinancialsPageClient } =
      await import("../../../../apps/donor/app/(public)/(hero)/financials/financials-client");
    render(<FinancialsPageClient />);
    expect(
      screen.getByText(
        "Sample figures and statements for this demo organization, not its real accounts.",
      ),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: /annual report/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /form 990/i })).toBeNull();
    expect(
      screen.getByText(
        "Annual reports and IRS filings aren’t published on this site yet.",
      ),
    ).toBeTruthy();
  });
});
